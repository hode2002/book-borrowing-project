import { StatusCodes } from 'http-status-codes'
import { isValidObjectId } from 'mongoose'
import * as bcrypt from 'bcrypt'

import { UserModel } from '../models'
import { ApiError, handleUploadAvatar } from '../utils'
import { Address, UserAvatar, UserProfile } from '../common/interfaces'
import { UserStatus } from '../models/user.model'
import { AuthService } from '.'

class UserService {
    async getProfile({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing user id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const user = await UserModel.findOne({
            _id: id,
            status: UserStatus.ACTIVE,
        })
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        return {
            is_success: true,
            user,
        }
    }

    async updateProfile({ id }: { id: string }, profile: UserProfile) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing user id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const user = await UserModel.findOneAndUpdate(
            {
                _id: id,
                status: UserStatus.ACTIVE,
            },
            { ...profile },
            { new: true }
        )
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        return {
            is_success: true,
            user,
        }
    }

    async updatePassword({
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

        const isExist = await UserModel.findOne({
            email,
            status: UserStatus.ACTIVE,
        })
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!isExist) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        const hashPassword = await bcrypt.hash(password, 10)
        if (!hashPassword) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create password`
            )
        }

        const user = await UserModel.findOneAndUpdate(
            { email, status: UserStatus.ACTIVE },
            { password: hashPassword },
            { new: true }
        )
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar role'
            )
            .lean()

        if (!user) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create password`
            )
        }

        return {
            is_success: true,
            ...user,
        }
    }

    async updateAddress({ email }: { email: string }, address: Address) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        const user = await UserModel.findOne({
            email,
            status: UserStatus.ACTIVE,
        })
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        const isUpdated = await UserModel.findOneAndUpdate(
            { email, status: UserStatus.ACTIVE },
            { address },
            { new: true }
        )
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update user address`
            )
        }

        return {
            is_success: true,
            ...isUpdated,
        }
    }

    async updateAvatar({ email }: { email: string }, file: UserAvatar) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        const user = await UserModel.findOne({
            email,
            status: UserStatus.ACTIVE,
        })
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        const res = await handleUploadAvatar(file, user.avatar)
        if (!res.is_success) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update user avatar`
            )
        }

        const isUpdated = await UserModel.findOneAndUpdate(
            { email },
            { avatar: res.newAvatar },
            { new: true }
        )
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update user avatar`
            )
        }

        return {
            is_success: true,
            ...isUpdated,
        }
    }

    async forgotPassword({ email }: { email: string }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        const user = await UserModel.findOne({
            email,
            status: UserStatus.ACTIVE,
        }).lean()

        if (!user) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'User not found')
        }

        const result = await AuthService.sendOtp({ email })
        if (!result.is_success) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't send OTP`
            )
        }

        return {
            is_success: true,
        }
    }

    async changePassword(
        { email }: { email: string },
        {
            oldPassword,
            newPassword,
        }: { oldPassword: string; newPassword: string }
    ) {
        const user = await UserModel.findOne({
            email,
            status: UserStatus.ACTIVE,
        })
            .select(
                '_id email password phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        const isMatches = await bcrypt.compare(oldPassword, user.password)
        if (!isMatches) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Old password mismatch')
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)
        if (!hashPassword) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create new password`
            )
        }

        const isUpdated = await UserModel.findOneAndUpdate(
            { email, status: UserStatus.ACTIVE },
            { password: hashPassword }
        )
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create new password`
            )
        }

        return {
            is_success: true,
        }
    }
}

export default new UserService()
