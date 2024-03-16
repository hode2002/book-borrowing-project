import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { EmployeeRoles } from '../../models/employee.model'
import { JwtPayload } from '../interfaces'
import { ApiError } from '../../utils'

export const IsLibrarian = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const { role } = req.user as JwtPayload
    if (role !== EmployeeRoles.ADMIN && role !== EmployeeRoles.LIBRARIAN) {
        throw new ApiError(
            StatusCodes.FORBIDDEN,
            'You must be an admin or librarian'
        )
    }

    return next()
}
