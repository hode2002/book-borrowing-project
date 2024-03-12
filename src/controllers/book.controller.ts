import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { BookService } from '../services'
import { CreateBookInterface, UpdateBookInterface } from '../common/interfaces'

class BookController {
    async create(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.CREATED,
            message: 'Create new book success',
            data: await BookService.create(req.body as CreateBookInterface),
        }).send(res)
    }

    async getAll(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get all books success',
            data: await BookService.getAll(),
        }).send(res)
    }

    async adminGetAll(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get all books success',
            data: await BookService.adminGetAll(),
        }).send(res)
    }

    async getById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get author by id success',
            data: await BookService.getById(req.params as { id: string }),
        }).send(res)
    }

    async updateById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Update author by id success',
            data: await BookService.updateById(
                req.params as { id: string },
                req.body as UpdateBookInterface
            ),
        }).send(res)
    }
}

export default new BookController()
