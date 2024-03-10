import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { AuthService } from '../services'
import { UserJwtPayload } from '../common/interfaces'

class AuthController {
    async emailVerification(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Email verification',
            data: await AuthService.emailVerification(
                req.body as { email: string }
            ),
        }).send(res)
    }

    async register(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.CREATED,
            message: 'Send otp successfully',
            data: await AuthService.register(req.body as { email: string }),
        }).send(res)
    }

    async resendOtp(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Send otp successfully',
            data: await AuthService.resendOtp(req.body as { email: string }),
        }).send(res)
    }

    async activeUserEmail(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Active User Email Success',
            data: await AuthService.activeUserEmail(
                req.body as { email: string; otpCode: string }
            ),
        }).send(res)
    }

    async createPassword(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Create Password Success',
            data: await AuthService.createPassword(
                req.body as { email: string; password: string }
            ),
        }).send(res)
    }

    async login(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Login Success',
            data: await AuthService.login(
                req.body as { email: string; password: string }
            ),
        }).send(res)
    }

    async refreshToken(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Refresh Token Success',
            data: await AuthService.refreshToken(req.user as UserJwtPayload),
        }).send(res)
    }

    async logout(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Logout Success',
            data: await AuthService.logout(req?.user as { email: string }),
        }).send(res)
    }
}

export default new AuthController()
