import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { BorrowingService } from '../services'
import {
    CreateBorrowingInterface,
    UpdateBorrowingInterface,
} from '../common/interfaces'

class BookController {
    async create(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.CREATED,
            message: 'Create new book success',
            data: await BorrowingService.create(
                req.user as { userId: string },
                req.body as CreateBorrowingInterface
            ),
        }).send(res)
    }

    async updateById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Update successful',
            data: await BorrowingService.updateById(
                req.params as { id: string },
                req.user as { userId: string },
                req.body as UpdateBorrowingInterface
            ),
        }).send(res)
    }

    async getAll(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get all books success',
            data: await BorrowingService.getAll(),
        }).send(res)
    }

    async getById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get by tracking id success',
            data: await BorrowingService.getById(
                req.params as { id: string },
                req.user as { userId: string }
            ),
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
                req.user as { userId: string }
            ),
        }).send(res)
    }

    async accept(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Accept successful',
            data: await BorrowingService.accept(req.params as { id: string }),
        }).send(res)
    }

    async reject(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Reject successful',
            data: await BorrowingService.reject(req.params as { id: string }),
        }).send(res)
    }

    async receive(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Received book successfully',
            data: await BorrowingService.receive(
                req.user as { userId: string },
                req.params as { id: string }
            ),
        }).send(res)
    }

    async return(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Successfully returned borrowed books',
            data: await BorrowingService.return(
                req.user as { userId: string },
                req.params as { id: string }
            ),
        }).send(res)
    }

    async renew(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Renewal successful',
            data: await BorrowingService.renew(
                req.user as { userId: string },
                req.params as { id: string },
                req.body as { numberOfRenewalDays: number }
            ),
        }).send(res)
    }

    async cancel(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Cancel successful',
            data: await BorrowingService.cancel(
                req.user as { userId: string },
                req.params as { id: string }
            ),
        }).send(res)
    }
}

export default new BookController()
