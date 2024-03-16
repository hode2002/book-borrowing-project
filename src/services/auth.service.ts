import axios from 'axios'
import jwt from 'jsonwebtoken'
import * as otpGenerator from 'otp-generator'
import * as passwordGenerator from 'generate-password'
import * as bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import { StatusCodes } from 'http-status-codes'
import Queue from 'bull'
import { v4 as uuidV4 } from 'uuid'

import { ApiError } from '../utils'
import { UserModel, OtpModel, EmployeeModel } from '../models'
import { EmployeeRoles, EmployeeStatus } from '../models/employee.model'
import { EmailVerificationInterface, JwtPayload } from '../common/interfaces'

class AuthService {
    async emailVerification({ email }: { email: string }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        const response = await axios.get(
            <string>process.env['MAIL_VERIFICATION_URL'] +
                <string>process.env['MAIL_VERIFICATION_API_KEY'] +
                `&emailAddress=${email}`
        )

        const data = (await response.data) as EmailVerificationInterface

        return {
            email_available: data.smtpCheck,
        }
    }

    async resendOtp({ email }: { email: string }) {
        const user = await UserModel.findOne({ email })
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, `User not found`)
        }
        return await this.sendOtp({ email })
    }

    async sendOtp({
        email,
        subject = 'Mã xác thực OTP',
        msg = 'Mã OTP của bạn là:',
    }: {
        email: string
        subject?: string
        msg?: string
    }) {
        const otpCode = otpGenerator.generate(6, {
            specialChars: false,
            digits: true,
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
        })

        if (!otpCode) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create OTP`
            )
        }

        const isCreated = await OtpModel.create({
            email,
            otpCode: bcrypt.hashSync(otpCode, 10),
        })

        if (!isCreated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create OTP`
            )
        }

        const mailQueue = this.createMailQueue()
        const transporter = this.createTransporter()

        mailQueue.process(async (job: any, done: Function) => {
            await transporter.sendMail({
                from: `"No Reply" <${process.env['MAIL_FROM']}>`,
                to: job.data.email,
                subject,
                html: `CT449-Project Quản Lý Mượn Sách<br></br>
                ${msg} <b>${job.data.otpCode}</b>`,
            })
            done()
        })

        await mailQueue.add({ email, otpCode })

        return {
            is_success: true,
        }
    }

    async verifyOtp({ email, otpCode }: { email: string; otpCode: string }) {
        const otps = await OtpModel.find({ email }).lean()
        if (!otps.length) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                'Invalid Email Or OTP Code'
            )
        }

        const lastOtpObj = otps[otps.length - 1]

        const isMatches = await bcrypt.compare(otpCode, lastOtpObj.otpCode)
        if (!isMatches) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                'Invalid Email Or OTP Code'
            )
        }

        await OtpModel.deleteMany({ email })

        return {
            is_success: true,
        }
    }

    async createPassword({
        email,
        password,
    }: {
        email: string
        password: string
    }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        if (!password) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Password missing')
        }

        const isExist = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
        })
            .select(
                'id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!isExist) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found')
        }

        const hashPassword = await bcrypt.hash(password, 10)
        if (!hashPassword) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create new password`
            )
        }

        const employee = await EmployeeModel.findOneAndUpdate(
            { email, status: EmployeeStatus.ACTIVE },
            { password: hashPassword }
        )
            .select(
                'id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!employee) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update password`
            )
        }

        return {
            is_success: true,
            ...employee,
        }
    }

    async login({ email, password }: { email: string; password: string }) {
        const employee = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
        })
            .select(
                'id email password lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!employee) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Incorrect Email or Password'
            )
        } else if (employee.status === EmployeeStatus.INACTIVE) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                'Your account has been locked, please contact the administrator'
            )
        }

        const isMatches = await bcrypt.compare(password, employee.password)
        if (!isMatches) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Incorrect Email or Password'
            )
        }

        const tokens = this.createTokenPairs({
            email,
            id: employee._id.toString(),
            role: employee.role,
        })

        const isUpdated = await EmployeeModel.updateOne(
            { email, status: EmployeeStatus.ACTIVE },
            {
                refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
            }
        )

        if (!isUpdated.modifiedCount) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update refresh token`
            )
        }

        return {
            is_success: true,
            ...tokens,
        }
    }

    async refreshToken({ email, id, role }: JwtPayload) {
        const tokens = this.createTokenPairs({ email, id, role })

        const isUpdated = await EmployeeModel.updateOne(
            { email, status: EmployeeStatus.ACTIVE },
            {
                refresh_token: await bcrypt.hash(tokens.refreshToken, 10),
            }
        )

        if (!isUpdated.modifiedCount) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update refresh token`
            )
        }

        return tokens
    }

    async logout({ email }: { email: string }) {
        const isUpdated = await EmployeeModel.findOneAndUpdate(
            { email, status: EmployeeStatus.ACTIVE },
            { refreshToken: null }
        )
            .select('_id email avatar lastName firstName dob address')
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                'Logout failed'
            )
        }

        return {
            is_success: true,
        }
    }

    async createEmployeeAccount({
        email,
        firstName,
        lastName,
        phoneNumber,
    }: {
        email: string
        firstName: string
        lastName: string
        phoneNumber: string
    }) {
        if (!firstName) {
            throw new ApiError(StatusCodes.BAD_REQUEST, `First name missing`)
        }

        const isExist = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
        }).lean()
        if (isExist) {
            throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
        }

        const password = passwordGenerator.generate({
            length: 8,
            lowercase: true,
            uppercase: true,
            numbers: true,
        })

        if (!password) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create password`
            )
        }

        const hashPassword = await bcrypt.hash(password, 10)
        if (!hashPassword) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't hash password`
            )
        }

        const employee = await EmployeeModel.create({
            email,
            firstName,
            lastName,
            password: hashPassword,
            phoneNumber,
        })

        if (!employee) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create new employee account`
            )
        }

        return {
            is_success: true,
            employee: {
                email,
                password,
                firstName,
                lastName,
                role: employee.role,
                phoneNumber,
            },
        }
    }

    async deleteAccount({ email }: { email: string }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, `Email missing`)
        }

        const isUpdated = await EmployeeModel.findOneAndUpdate(
            { email, status: EmployeeStatus.ACTIVE },
            { status: EmployeeStatus.INACTIVE },
            { new: true }
        )
            .select(
                'id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't delete this account`
            )
        }

        return {
            is_success: true,
            ...isUpdated,
        }
    }

    async restoreAccount({ email }: { email: string }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, `Email missing`)
        }

        const isUpdated = await EmployeeModel.findOneAndUpdate(
            { email, status: EmployeeStatus.INACTIVE },
            { status: EmployeeStatus.ACTIVE },
            { new: true }
        )
            .select(
                'id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't restore this account`
            )
        }

        return {
            is_success: true,
            ...isUpdated,
        }
    }

    async setRole({ email, role }: { email: string; role: string }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing email')
        }

        if (!role) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing role')
        }

        const employee = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
        })
            .select(
                'id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        const isUpdated = await EmployeeModel.findOneAndUpdate(
            { email, status: EmployeeStatus.ACTIVE },
            { role },
            { new: true }
        )
            .select(
                'id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't set role for employee`
            )
        }

        return {
            is_success: true,
            ...isUpdated,
        }
    }

    private createTokenPairs({ email, id, role }: JwtPayload) {
        const accessToken = jwt.sign(
            { email, id, role },
            process.env['ACCESS_TOKEN_SECRET'] as string,
            {
                expiresIn: process.env['ACCESS_TOKEN_EXPIRES_IN'] as string,
            }
        )

        const refreshToken = jwt.sign(
            { email, id, role },
            process.env['REFRESH_TOKEN_SECRET'] as string,
            {
                expiresIn: process.env['REFRESH_TOKEN_EXPIRES_IN'] as string,
            }
        )

        return { accessToken, refreshToken }
    }

    createTransporter() {
        return nodemailer.createTransport({
            host: process.env['MAIL_HOST'],
            port: 587,
            secure: false,
            auth: {
                user: process.env['MAIL_USER'],
                pass: process.env['MAIL_PASSWORD'],
            },
        })
    }

    createMailQueue() {
        return new Queue('send-mail', {
            redis: {
                port: Number(process.env['REDIS_PORT']),
                host: <string>process.env['REDIS_HOST'],
                username: <string>process.env['REDIS_USERNAME'],
                password: <string>process.env['REDIS_PASSWORD'],
            },
        })
    }
}

export default new AuthService()
