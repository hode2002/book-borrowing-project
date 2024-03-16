import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { BorrowingService } from '../services'
import {
    CreateBookBorrowing,
    UpdateBorrowingInterface,
} from '../common/interfaces'

class BookController {
    async create(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.CREATED,
            message: 'Create new book success',
            data: await BorrowingService.create(
                req.body as CreateBookBorrowing
            ),
        }).send(res)
    }

    async getAll(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get all borrowed books success',
            data: await BorrowingService.getAll(),
        }).send(res)
    }

    async getById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get by tracking id success',
            data: await BorrowingService.getById(req.params as { id: string }),
        }).send(res)
    }

    async getByStatus(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: `Get by ${req.params?.status} status success`,
            data: await BorrowingService.getByStatus(
                req.params as { status: string }
            ),
        }).send(res)
    }

    async getByUserId(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get book borrowing tracking by user id success',
            data: await BorrowingService.getByUserId(
                req.params as { userId: string }
            ),
        }).send(res)
    }

    async return(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Successfully returned borrowed books',
            data: await BorrowingService.return(req.params as { id: string }),
        }).send(res)
    }

    async renew(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Renewal successful',
            data: await BorrowingService.renew(
                req.params as { id: string },
                req.body as { numberOfRenewalDays: number }
            ),
        }).send(res)
    }
}

export default new BookController()
