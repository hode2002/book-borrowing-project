import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { AuthService } from '../services'
import { JwtPayload } from '../common/interfaces'

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

    async verifyOtp(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Verify OTP successfully',
            data: await AuthService.verifyOtp(
                req.body as { email: string; otpCode: string }
            ),
        }).send(res)
    }

    async createPassword(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Verify OTP successfully',
            data: await AuthService.createPassword(
                req.body as { email: string; password: string }
            ),
        }).send(res)
    }

    async createEmployeeAccount(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Successfully Created Account For New Employee',
            data: await AuthService.createEmployeeAccount(
                req.body as {
                    email: string
                    firstName: string
                    lastName: string
                    phoneNumber: string
                }
            ),
        }).send(res)
    }

    async resendOtp(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Send otp success',
            data: await AuthService.resendOtp(req.body as { email: string }),
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
            data: await AuthService.refreshToken(req.user as JwtPayload),
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

    async deleteAccount(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Successfully Deleted Account',
            data: await AuthService.deleteAccount(
                req.body as { email: string }
            ),
        }).send(res)
    }

    async restoreAccount(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Successfully restored Account',
            data: await AuthService.restoreAccount(
                req.body as { email: string }
            ),
        }).send(res)
    }

    async setRole(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Set role for employee Success',
            data: await AuthService.setRole(
                req.body as {
                    email: string
                    role: string
                }
            ),
        }).send(res)
    }
}

export default new AuthController()
