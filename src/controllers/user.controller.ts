import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { UserService } from '../services'

class UserController {
    async create(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.CREATED,
            message: 'Create new user success',
            data: await UserService.create(),
        }).send(res)
    }
}

export default new UserController()
