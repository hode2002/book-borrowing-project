import express from 'express'
import passport from 'passport'

import { UserController } from '../controllers'
import { asyncHandler } from '../utils'
import { IsLibrarian } from '../common/middlewares'

const router = express.Router()

router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(UserController.createProfile)
)

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(UserController.getProfiles)
)

router.get(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(UserController.getProfileById)
)

router.get(
    '/phone/:number',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(UserController.getProfileByPhoneNumber)
)

export default router
