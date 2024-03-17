import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import { BorrowingService } from '../services'
import { CreateBookBorrowing, JwtPayload } from '../common/interfaces'

class BookController {
    async create(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.CREATED,
            message: 'Create success',
            data: await BorrowingService.create(
                req.user as { id: string },
                req.body as CreateBookBorrowing
            ),
        }).send(res)
    }

    async accept(req: Request, res: Response) {
        const employeeId = (req.user as JwtPayload).id
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Accepted',
            data: await BorrowingService.accept(
                { employeeId },
                req.params as { id: string }
            ),
        }).send(res)
    }

    async getById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get by id success',
            data: await BorrowingService.getById(req.params as { id: string }),
        }).send(res)
    }

    async getByStatus(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: `Get by ${req.params?.status} status success`,
            data: await BorrowingService.getByStatus(
                req.user as { id: string },
                req.params as { status: string }
            ),
        }).send(res)
    }

    async getByUserId(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get by user id success',
            data: await BorrowingService.getByUserId(
                req.user as { id: string }
            ),
        }).send(res)
    }

    async return(req: Request, res: Response) {
        const userId = (req.user as JwtPayload).id

        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Successfully returned borrowed books',
            data: await BorrowingService.return(
                { userId },
                req.params as { id: string }
            ),
        }).send(res)
    }

    async renew(req: Request, res: Response) {
        const userId = (req.user as JwtPayload).id
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Renewal successful',
            data: await BorrowingService.renew(
                { userId },
                req.params as { id: string },
                req.body as { numberOfRenewalDays: number }
            ),
        }).send(res)
    }

    async updateStatus(req: Request, res: Response) {
        const { id } = req.params
        const { status } = req.body
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Renewal successful',
            data: await BorrowingService.updateStatus({ id, status }),
        }).send(res)
    }

    async adminGetAll(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get all borrowed books success',
            data: await BorrowingService.adminGetAll(),
        }).send(res)
    }

    async adminGetById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get all borrowed books success',
            data: await BorrowingService.adminGetById(
                req.params as { id: string }
            ),
        }).send(res)
    }

    async adminGetByUserId(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get all borrowed books success',
            data: await BorrowingService.adminGetByUserId(
                req.params as { userId: string }
            ),
        }).send(res)
    }
}

export default new BookController()
