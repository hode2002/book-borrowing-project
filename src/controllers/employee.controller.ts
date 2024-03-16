import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { EmployeeService } from '../services'
import { Address } from '../common/interfaces'
import { CreateUser } from '../common/interfaces/user'

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
