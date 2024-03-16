import express from 'express'
import passport from 'passport'

import { EmployeeController } from '../controllers'
import { asyncHandler } from '../utils'
import { IsLibrarian } from '../common/middlewares'

const router = express.Router()

router.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(EmployeeController.getProfile)
)

router.patch(
    '/update-address',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(EmployeeController.updateAddress)
)

router.patch(
    '/forgot-password',
    asyncHandler(EmployeeController.forgotPassword)
)

router.patch(
    '/change-password',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(EmployeeController.changePassword)
)

export default router
