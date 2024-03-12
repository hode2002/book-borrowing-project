import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import {
    CreateAuthorInterface,
    UpdateAuthorInterface,
} from '../common/interfaces'
import { AuthorService } from '../services'

class AuthorController {
    async create(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.CREATED,
            message: 'Create author success',
            data: await AuthorService.create(req.body as CreateAuthorInterface),
        }).send(res)
    }

    async getAll(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get all authors success',
            data: await AuthorService.getAll(),
        }).send(res)
    }

    async getById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get author by id success',
            data: await AuthorService.getById(req.params as { id: string }),
        }).send(res)
    }

    async updateById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Update author by id success',
            data: await AuthorService.updateById(
                req.params as { id: string },
                req.body as UpdateAuthorInterface
            ),
        }).send(res)
    }
}

export default new AuthorController()
