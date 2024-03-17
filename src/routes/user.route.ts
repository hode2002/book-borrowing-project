import express from 'express'
import passport from 'passport'
import multer from 'multer'

import { UserController } from '../controllers'
import { asyncHandler } from '../utils'

const router = express.Router()
const upload = multer({})

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(UserController.getProfile)
)

router.patch(
    '/update-address',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(UserController.updateAddress)
)

router.patch(
    '/avatar',
    passport.authenticate('jwt', { session: false }),
    upload.single('avatar'),
    asyncHandler(UserController.updateAvatar)
)

router.patch('/forgot-password', asyncHandler(UserController.forgotPassword))

router.patch(
    '/change-password',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(UserController.changePassword)
)

export default router
