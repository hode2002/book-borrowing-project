import axios from 'axios'
import jwt from 'jsonwebtoken'
import * as otpGenerator from 'otp-generator'
import * as passwordGenerator from 'generate-password'
import * as bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import { StatusCodes } from 'http-status-codes'
import Queue from 'bull'

import { ApiError } from '../utils'
import { UserModel, OtpModel, EmployeeModel } from '../models'
import { EmployeeStatus } from '../models/employee.model'
import {
    CreateEmployee,
    EmailVerificationInterface,
    JwtPayload,
} from '../common/interfaces'
import { UserRoles, UserStatus } from '../models/user.model'
import { EmployeeService, UserService } from '.'

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

    async register({ email }: { email: string }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        const isExist = await UserModel.findOne({ email }).lean()

        if (isExist) {
            throw new ApiError(StatusCodes.CONFLICT, 'Email already exists')
        }

        const isCreated = await UserModel.create({ email })
        if (!isCreated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create user email`
            )
        }

        return await this.sendOtp({ email })
    }

    async activeUserEmail({
        email,
        otpCode,
    }: {
        email: string
        otpCode: string
    }) {
        const isVerified = await this.verifyOtp({ email, otpCode })
        if (!isVerified?.is_success) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid email')
        }

        const userUpdated = await UserModel.findOneAndUpdate(
            { email, status: UserStatus.INACTIVE },
            { status: UserStatus.ACTIVE }
        )
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!userUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't active user`
            )
        }

        return {
            is_success: true,
        }
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

        mailQueue.process((job: any, done: Function) => {
            transporter.sendMail({
                from: `"No Reply" <${process.env['MAIL_FROM']}>`,
                to: job.data.email,
                subject,
                html: `CT449-Project Quản Lý Mượn Sách<br></br>
                ${msg} <b>${job.data.otpCode}</b>`,
            })
            done()
        })

        mailQueue.add(
            { email, otpCode },
            { removeOnComplete: 1000, removeOnFail: 1000 }
        )

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

        const deletedCount = (await OtpModel.deleteMany({ email })).deletedCount
        if (!deletedCount) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't delete otp code`
            )
        }

        const user = await UserModel.findOne({ email }).lean()
        if (user) {
            await UserModel.updateOne({ email }, { status: UserStatus.ACTIVE })
        } else {
            await EmployeeModel.updateOne(
                { email },
                { status: EmployeeStatus.ACTIVE }
            )
        }

        return {
            is_success: true,
        }
    }

    async createPassword(
        {
            email,
            password,
        }: {
            email: string
            password: string
        },
        isEmployee: boolean = false
    ) {
        const hashPassword = await bcrypt.hash(password, 10)
        if (!hashPassword) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create password`
            )
        }

        let result
        if (isEmployee) {
            result = await EmployeeService.updatePassword({ email, password })
        } else {
            result = await UserService.updatePassword({ email, password })
        }

        if (!result) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create password`
            )
        }

        const tokens = this.createTokenPairs({
            email,
            id: result._id.toString(),
            role: result.role,
        })

        let isUpdated
        if (isEmployee) {
            isUpdated = await EmployeeModel.updateOne(
                { email, status: EmployeeStatus.ACTIVE },
                {
                    refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
                }
            )
        } else {
            isUpdated = await UserModel.updateOne(
                { email, status: UserStatus.ACTIVE },
                {
                    refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
                }
            )
        }

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

    async login({ email, password }: { email: string; password: string }) {
        const user = await UserModel.findOne({
            email,
            status: UserStatus.ACTIVE,
        })
            .select(
                'id email password lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!user) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Incorrect Email or Password'
            )
        } else if (user.status === UserStatus.INACTIVE) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                'Your account has been locked, please contact the administrator'
            )
        }

        const { password: dbPass, role, _id, status, ...other } = user

        const isMatches = await bcrypt.compare(password, dbPass)
        if (!isMatches) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Incorrect Email or Password'
            )
        }

        const tokens = this.createTokenPairs({
            email,
            id: user._id.toString(),
            role,
        })

        const isUpdated = await UserModel.updateOne(
            { email, status: UserStatus.ACTIVE },
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
            ...other,
        }
    }

    async refreshToken({ email, id, role }: JwtPayload) {
        const tokens = this.createTokenPairs({ email, id, role })

        const model = role === UserRoles.USER ? UserModel : EmployeeModel
        const status = role === UserRoles.USER ? UserStatus : EmployeeStatus

        const isUpdated = await model.updateOne(
            { email, status: status.ACTIVE },
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

    async logout({ email, role }: JwtPayload) {
        const model = role === UserRoles.USER ? UserModel : EmployeeModel
        const status = role === UserRoles.USER ? UserStatus : EmployeeStatus

        const isUpdated = await model
            .updateOne({ email, status: status.ACTIVE }, { refreshToken: null })
            .lean()

        if (!isUpdated.modifiedCount) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                'Logout failed'
            )
        }

        return {
            is_success: true,
        }
    }

    async administratorLogin({
        email,
        password,
    }: {
        email: string
        password: string
    }) {
        const employee = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
        })
            .select(
                'id email password lastName firstName dob address phoneNumber avatar role'
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

        const { password: dbPass, role, _id, status, ...other } = employee

        const isMatches = await bcrypt.compare(password, dbPass)
        if (!isMatches) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Incorrect Email or Password'
            )
        }

        const tokens = this.createTokenPairs({
            email,
            id: _id.toString(),
            role,
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
            ...other,
        }
    }

    async createEmployeeAccount({
        email,
        firstName,
        lastName,
        phoneNumber,
        address,
    }: CreateEmployee) {
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
            address,
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
                address,
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
            port: 465,
            secure: true,
            auth: {
                user: process.env['MAIL_USER'],
                pass: process.env['MAIL_PASSWORD'],
            },
            tls: {
                rejectUnauthorized: false,
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
            prefix: 'ct449-project',
        })
    }
}

export default new AuthService()
