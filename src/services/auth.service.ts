import axios from 'axios'
import jwt from 'jsonwebtoken'
import * as otpGenerator from 'otp-generator'
import * as bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import { StatusCodes } from 'http-status-codes'
import Queue from 'bull'

import { ApiError } from '../utils'
import { UserModel, OtpModel } from '../models'
import { UserStatus } from '../models/user.model'
import {
    EmailVerificationInterface,
    UserJwtPayload,
    UserResponse,
} from '../common/interfaces'

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

        const isExist = await UserModel.findOne({ email })
            .select('_id email avatar lastName firstName dob address')
            .lean()

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

        return await this.sendOtp(email)
    }

    async activeUserEmail({
        email,
        otpCode,
    }: {
        email: string
        otpCode: string
    }) {
        const isVerified = await this.verifyOtp(email, otpCode)
        if (!isVerified) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Invalid email')
        }

        const userUpdated = <UserResponse>(
            await UserModel.findOneAndUpdate(
                { email, status: UserStatus.INACTIVE, password: null },
                { status: UserStatus.ACTIVE }
            )
                .select('_id email avatar lastName firstName dob address')
                .lean()
        )

        if (!userUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't active user`
            )
        }

        return {
            is_success: userUpdated ? true : false,
            ...userUpdated,
        }
    }

    async resendOtp({ email }: { email: string }) {
        return await this.sendOtp(email)
    }

    async sendOtp(email: string) {
        const otpCode = otpGenerator.generate(6, {
            specialChars: false,
            digits: true,
            upperCaseAlphabets: true,
            lowerCaseAlphabets: true,
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
                subject: 'Mã xác thực OTP',
                html: `
                CT449-Project Quản Lý Mượn Sách<br></br>
                Mã OTP của bạn là: <b>${job.data.otpCode}</b>`,
            })
            done()
        })

        await mailQueue.add({ email, otpCode })

        return { email }
    }

    async verifyOtp(email: string, otpCode: string) {
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
        const isExist = await UserModel.findOne({
            email,
            password: null,
            status: UserStatus.ACTIVE,
        })
            .select('_id email avatar lastName firstName dob address')
            .lean()

        if (!isExist) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
        }

        const hashPass = await bcrypt.hash(password, 10)

        const isSuccess = await UserModel.updateOne(
            { email },
            { password: hashPass }
        )

        return {
            is_success: isSuccess?.modifiedCount ? true : false,
        }
    }

    async login({ email, password }: { email: string; password: string }) {
        const user = await UserModel.findOne({ email })
            .select('_id email password avatar lastName firstName dob address')
            .lean()

        if (!user) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                'Incorrect Email or Password'
            )
        }

        const isMatches = await bcrypt.compare(password, user.password)
        if (!isMatches) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                'Incorrect Email or Password'
            )
        }

        const tokens = this.createTokenPairs({
            email,
            userId: user._id.toString(),
        })

        const isUpdated = await UserModel.updateOne(
            { email },
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

    async refreshToken({ email, userId }: UserJwtPayload) {
        const tokens = this.createTokenPairs({ email, userId })

        const isUpdated = await UserModel.updateOne(
            { email },
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
        const isUpdated = await UserModel.findOneAndUpdate(
            { email },
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

    private createTokenPairs({ email, userId }: UserJwtPayload) {
        const accessToken = jwt.sign(
            { email, userId },
            process.env['ACCESS_TOKEN_SECRET'] as string,
            {
                expiresIn: process.env['ACCESS_TOKEN_EXPIRES_IN'] as string,
            }
        )

        const refreshToken = jwt.sign(
            { email, userId },
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