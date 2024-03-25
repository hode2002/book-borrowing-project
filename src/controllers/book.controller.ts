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
            message: 'Get book by id success',
            data: await BookService.getById(req.params as { id: string }),
        }).send(res)
    }

    async getBySlug(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get book by slug success',
            data: await BookService.getBySlug(req.params as { slug: string }),
        }).send(res)
    }

    async getBySearchTerm(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get book by search term success',
            data: await BookService.getBySearchTerm(
                req.query as { searchTerm: string }
            ),
        }).send(res)
    }

    async getByAuthorId(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get book by author success',
            data: await BookService.getByAuthorId(req.params as { id: string }),
        }).send(res)
    }

    async getByCateName(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get book by category success',
            data: await BookService.getByCateName(
                req.params as { slug: string }
            ),
        }).send(res)
    }

    async getByPublisherId(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get book by publisher success',
            data: await BookService.getByPublisherId(
                req.params as { id: string }
            ),
        }).send(res)
    }

    async updateById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Update book by id success',
            data: await BookService.updateById(
                req.params as { id: string },
                req.body as UpdateBookInterface
            ),
        }).send(res)
    }
}

export default new BookController()
