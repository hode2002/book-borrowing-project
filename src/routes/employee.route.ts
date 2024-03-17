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

router.get(
    '/users',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(EmployeeController.getUsers)
)

router.get(
    '/users/:id',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(EmployeeController.getUserById)
)

router.get(
    '/users/status/:status',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(EmployeeController.getUserByStatus)
)

export default router
