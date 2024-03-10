import * as bcrypt from 'bcrypt'
import * as passwordGenerator from 'generate-password'
import { StatusCodes } from 'http-status-codes'

import { UserModel } from '../models'
import { UserStatus } from '../models/user.model'
import { ApiError } from '../utils'
import {
    UserAddressInterface,
    UserChangePasswordInterface,
} from '../common/interfaces'
import AuthService from './auth.service'

class UserService {
    async getProfile({ email }: { email: string }) {
        const user = await UserModel.findOne(
            {
                email,
                status: UserStatus.ACTIVE,
                refreshToken: { $ne: null },
            },
            {}
        )
            .select('_id email avatar lastName firstName dob address')
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'User not found')
        }

        return user
    }

    async updateAddress(
        { email }: { email: string },
        userAddress: UserAddressInterface
    ) {
        const user = await UserModel.findOne({
            email,
            status: UserStatus.ACTIVE,
        })
            .select('_id email password avatar lastName firstName dob address')
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'User not found')
        }

        return await UserModel.findOneAndUpdate(
            { email, status: UserStatus.ACTIVE },
            { address: { ...userAddress } }
        )
            .select('_id email avatar lastName firstName dob address')
            .lean()
    }

    async forgotPassword({ email }: { email: string }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        const user = await UserModel.findOne({ email }).lean()
        if (!user) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Email not found')
        }

        const mailQueue = AuthService.createMailQueue()
        const transporter = AuthService.createTransporter()

        mailQueue.process(async (job: any, done: Function) => {
            await transporter.sendMail({
                from: `"No Reply" <${process.env['MAIL_FROM']}>`,
                to: job.data.email,
                subject: 'Reset Password',
                html: `
                    CT449-Project Quản Lý Mượn Sách<br></br>
                    Mật khẩu mới của bạn là: <b>${job.data.newPassword}</b>`,
            })
            done()
        })

        const newPassword = passwordGenerator.generate({
            length: 10,
            lowercase: true,
            uppercase: true,
            numbers: true,
        })

        if (!newPassword) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create new password`
            )
        }

        await mailQueue.add({ email, newPassword })

        const hashPassword = await bcrypt.hash(newPassword, 10)
        const isUpdated = await UserModel.updateOne(
            {
                email,
                status: UserStatus.ACTIVE,
            },
            {
                password: hashPassword,
            }
        )

        return {
            is_success: isUpdated.modifiedCount ? true : false,
        }
    }

    async changePassword(
        { email }: { email: string },
        { oldPassword, newPassword }: UserChangePasswordInterface
    ) {
        const user = await UserModel.findOne({
            email,
            status: UserStatus.ACTIVE,
        })
            .select('_id email password avatar lastName firstName dob address')
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'User not found')
        }

        const isMatches = await bcrypt.compare(oldPassword, user.password)
        if (!isMatches) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Old password mismatch')
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)

        return await UserModel.findOneAndUpdate(
            { email, status: UserStatus.ACTIVE },
            { password: hashPassword }
        )
            .select('_id email avatar lastName firstName dob address')
            .lean()
    }
}

export default new UserService()
