import express, { Request, Response } from 'express'
import passport from 'passport'

import { UserController } from '../controllers'
import { asyncHandler } from '../utils'

const router = express.Router()

router.get(
    '/profile',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(UserController.getProfile)
)

router.patch(
    '/update-address',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(UserController.updateAddress)
)

router.patch(
    '/forgot-password',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(UserController.forgotPassword)
)

router.patch(
    '/change-password',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(UserController.changePassword)
)

export default router
