import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { EmployeeService } from '../services'
import { Address } from '../common/interfaces'

class EmployeeController {
    async getProfile(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get employee profile success',
            data: await EmployeeService.getProfile(
                req.user as { email: string }
            ),
        }).send(res)
    }

    async getUsers(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get users success',
            data: await EmployeeService.getUsers(),
        }).send(res)
    }

    async getUserById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get user profile by id success',
            data: await EmployeeService.getUserById(
                req.params as { id: string }
            ),
        }).send(res)
    }

    async getUserByStatus(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get user profile by id success',
            data: await EmployeeService.getUserByStatus(
                req.params as { status: string }
            ),
        }).send(res)
    }

    async updateAddress(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Update address success',
            data: await EmployeeService.updateAddress(
                req.user as { email: string },
                req.body as Address
            ),
        }).send(res)
    }

    async forgotPassword(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Send otp code success',
            data: await EmployeeService.forgotPassword(
                req.body as { email: string }
            ),
        }).send(res)
    }

    async changePassword(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Change password success',
            data: await EmployeeService.changePassword(
                req.user as { email: string },
                req.body as { oldPassword: string; newPassword: string }
            ),
        }).send(res)
    }
}

export default new EmployeeController()
