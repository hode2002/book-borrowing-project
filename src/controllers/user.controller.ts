import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { UserService } from '../services'
import { Address, UserAvatar } from '../common/interfaces'

class EmployeeController {
    async getProfile(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get user profile success',
            data: await UserService.getProfile(req.user as { id: string }),
        }).send(res)
    }

    async updateAddress(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Update user avatar success',
            data: await UserService.updateAddress(
                req.user as { email: string },
                req.body as Address
            ),
        }).send(res)
    }

    async updateAvatar(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Update user avatar success',
            data: await UserService.updateAvatar(
                req.user as { email: string },
                req?.file as UserAvatar
            ),
        }).send(res)
    }

    async forgotPassword(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Send otp code success',
            data: await UserService.forgotPassword(
                req.body as { email: string }
            ),
        }).send(res)
    }

    async changePassword(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Change password success',
            data: await UserService.changePassword(
                req.user as { email: string },
                req.body as { oldPassword: string; newPassword: string }
            ),
        }).send(res)
    }
}

export default new EmployeeController()
