import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { SuccessResponse } from '../common/response'
import {
    CreatePublisherInterface,
    UpdatePublisherInterface,
} from '../common/interfaces'
import { PublisherService } from '../services'

class PublisherController {
    async create(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.CREATED,
            message: 'Create publisher success',
            data: await PublisherService.create(
                req.body as CreatePublisherInterface
            ),
        }).send(res)
    }

    async getAll(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get all book publishers success',
            data: await PublisherService.getAll(),
        }).send(res)
    }

    async getById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Get publisher by id success',
            data: await PublisherService.getById(req.params as { id: string }),
        }).send(res)
    }

    async updateById(req: Request, res: Response) {
        return new SuccessResponse({
            status: 'Success',
            code: StatusCodes.OK,
            message: 'Update publisher by id success',
            data: await PublisherService.updateById(
                req.params as { id: string },
                req.body as UpdatePublisherInterface
            ),
        }).send(res)
    }
}

export default new PublisherController()
