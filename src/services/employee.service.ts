import * as bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'

import { EmployeeModel } from '../models'
import { ApiError } from '../utils'
import { Address } from '../common/interfaces'
import AuthService from './auth.service'
import { EmployeeStatus } from '../models/employee.model'

class EmployeeService {
    async getProfile({ email }: { email: string }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        const employee = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
            refreshToken: { $ne: null },
        })
            .select(
                '_id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!employee) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found')
        }

        return employee
    }

    async getUsers() {
        return await EmployeeModel.find()
            .select(
                '_id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()
    }

    async getUserById({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'User id missing')
        }

        const user = await EmployeeModel.findOne()
            .select(
                '_id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        return user
    }

    async getUserByStatus({ status }: { status: string }) {
        if (!status) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Status missing')
        }

        return await EmployeeModel.find({
            status,
        })
            .select(
                '_id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()
    }

    async updateAddress({ email }: { email: string }, address: Address) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        const employee = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
        })
            .select(
                '_id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!employee) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found')
        }

        const isUpdated = await EmployeeModel.findOneAndUpdate(
            { email, status: EmployeeStatus.ACTIVE },
            { address },
            { new: true }
        )
            .select(
                '_id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update employee address`
            )
        }

        return {
            is_success: true,
            ...isUpdated,
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

        const isExist = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
        })
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar'
            )
            .lean()

        if (!isExist) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found')
        }

        const hashPassword = await bcrypt.hash(password, 10)
        if (!hashPassword) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create password`
            )
        }

        const employee = await EmployeeModel.findOneAndUpdate(
            { email, status: EmployeeStatus.ACTIVE },
            { password: hashPassword },
            { new: true }
        )
            .select(
                '_id email phoneNumber lastName firstName dob address gender avatar role'
            )
            .lean()

        if (!employee) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create password`
            )
        }

        return {
            is_success: true,
            ...employee,
        }
    }

    async forgotPassword({ email }: { email: string }) {
        if (!email) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Email missing')
        }

        const employee = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
        }).lean()

        if (!employee) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Employee not found')
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
        const employee = await EmployeeModel.findOne({
            email,
            status: EmployeeStatus.ACTIVE,
        })
            .select(
                '_id email password lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!employee) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found')
        }

        const isMatches = await bcrypt.compare(oldPassword, employee.password)
        if (!isMatches) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Old password mismatch')
        }

        const hashPassword = await bcrypt.hash(newPassword, 10)

        const isUpdated = await EmployeeModel.findOneAndUpdate(
            { email, status: EmployeeStatus.ACTIVE },
            { password: hashPassword }
        )
            .select(
                '_id email lastName firstName dob address phoneNumber avatar status role'
            )
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update password`
            )
        }

        return {
            is_success: true,
        }
    }
}

export default new EmployeeService()
