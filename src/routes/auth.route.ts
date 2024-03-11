import express from 'express'
import passport from 'passport'

import { AuthController } from '../controllers'
import { asyncHandler } from '../utils'
import { IsAdmin } from '../common/middlewares'

const router = express.Router()

router.post(
    '/email-verification',
    asyncHandler(AuthController.emailVerification)
)

router.post('/register', asyncHandler(AuthController.register))

router.post('/otp/resend', asyncHandler(AuthController.resendOtp))

router.post('/active-user-email', asyncHandler(AuthController.activeUserEmail))

router.post('/create-password', asyncHandler(AuthController.createPassword))

router.post('/login', asyncHandler(AuthController.login))

router.post(
    '/logout',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(AuthController.logout)
)

router.post(
    '/admin/create-employee-account',
    passport.authenticate('jwt', { session: false }),
    IsAdmin,
    asyncHandler(AuthController.createEmployeeAccount)
)

router.delete(
    '/admin/delete-account',
    passport.authenticate('jwt', { session: false }),
    IsAdmin,
    asyncHandler(AuthController.deleteAccount)
)

router.post(
    '/admin/set-role',
    passport.authenticate('jwt', { session: false }),
    IsAdmin,
    asyncHandler(AuthController.setRole)
)

router.post(
    '/token/refresh',
    passport.authenticate('jwt-refresh', { session: false }),
    asyncHandler(AuthController.refreshToken)
)

export default router
