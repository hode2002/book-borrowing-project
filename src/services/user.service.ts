import { StatusCodes } from 'http-status-codes'
import { isValidObjectId } from 'mongoose'

import { UserModel } from '../models'
import { ApiError } from '../utils'
import { CreateUser } from '../common/interfaces'
import { UserStatus } from '../models/user.model'

class UserService {
    async createProfile(createUser: CreateUser) {
        if (!createUser?.phoneNumber) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing phone number')
        }

        if (
            !createUser.firstName ||
            !createUser.lastName ||
            !createUser.address
        ) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Missing data to create'
            )
        }

        const isExist = await UserModel.findOne({
            phoneNumber: createUser.phoneNumber,
            status: UserStatus.ACTIVE,
        })
            .select('_id phoneNumber lastName firstName dob address gender')
            .lean()

        if (isExist) {
            throw new ApiError(StatusCodes.CONFLICT, 'User already exists')
        }

        const user = await UserModel.create({ ...createUser })
        if (!user) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create user`
            )
        }

        return {
            is_success: true,
            user,
        }
    }

    async getProfiles() {
        return await UserModel.find({ status: UserStatus.ACTIVE })
            .select('_id phoneNumber lastName firstName dob address gender')
            .lean()
    }

    async getProfileById({ id }: { id: string }) {
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
            .select('_id phoneNumber lastName firstName dob address gender')
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        return {
            is_success: true,
            user,
        }
    }

    async getProfileByPhoneNumber({ number }: { number: string }) {
        if (!number) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing phone number')
        }

        const user = await UserModel.findOne({
            phoneNumber: number,
            status: UserStatus.ACTIVE,
        })
            .select('_id phoneNumber lastName firstName dob address gender')
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        return {
            is_success: true,
            user,
        }
    }
}

export default new UserService()
