import { Response } from 'express'

interface SuccessResponseInterface {
    status: string
    code: number
    message?: string
    data?: any
}

export class SuccessResponse {
    status: string
    code: number
    message?: string
    data?: any

    constructor(obj: SuccessResponseInterface) {
        this.status = obj.status
        this.code = obj.code
        this.message = obj.message
        this.data = obj.data
    }

    send(res: Response) {
        return res.status(this.code).json(this)
    }
}
