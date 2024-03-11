import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { UserJwtPayload } from '../interfaces'
import { ApiError } from '../../utils'

export const IsAdmin = (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user as UserJwtPayload
    if (role !== 'admin') {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            'You must be an administrator'
        )
    }

    return next()
}
