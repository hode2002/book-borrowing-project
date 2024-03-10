import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { UserService } from '../services'
import {
    UserAddressInterface,
    UserChangePasswordInterface,
} from '../common/interfaces'

class UserController {
    async getProfile(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get user profile success',
            data: await UserService.getProfile(req.user as { email: string }),
        }).send(res)
    }

    async updateAddress(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Send new password success',
            data: await UserService.updateAddress(
                req.user as { email: string },
                req.body as UserAddressInterface
            ),
        }).send(res)
    }

    async forgotPassword(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Send new password success',
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
                req.body as UserChangePasswordInterface
            ),
        }).send(res)
    }
}

export default new UserController()
