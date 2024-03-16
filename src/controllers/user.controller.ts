import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { UserService } from '../services'
import { CreateUser } from '../common/interfaces/user'

class EmployeeController {
    async createProfile(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.CREATED,
            message: 'Create user profile success',
            data: await UserService.createProfile(req.body as CreateUser),
        }).send(res)
    }

    async getProfiles(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get user profiles success',
            data: await UserService.getProfiles(),
        }).send(res)
    }

    async getProfileById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get user profile by id success',
            data: await UserService.getProfileById(
                req.params as { id: string }
            ),
        }).send(res)
    }

    async getProfileByPhoneNumber(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Create user profile by number phone success',
            data: await UserService.getProfileByPhoneNumber(
                req.params as { number: string }
            ),
        }).send(res)
    }
}

export default new EmployeeController()
