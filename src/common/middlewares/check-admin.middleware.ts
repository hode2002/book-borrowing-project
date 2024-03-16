import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { EmployeeRoles } from '../../models/employee.model'
import { JwtPayload } from '../interfaces'
import { ApiError } from '../../utils'

export const IsAdmin = (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user as JwtPayload
    if (role !== EmployeeRoles.ADMIN) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            'You must be an administrator'
        )
    }

    return next()
}
