import express from 'express'
import passport from 'passport'

import { BorrowingController } from '../controllers'
import { asyncHandler } from '../utils'
import { IsLibrarian } from '../common/middlewares'

const router = express.Router()

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.getAll)
)

router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.create)
)

router.get(
    '/status/:status',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.getByStatus)
)

router.get(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.getById)
)

router.get(
    '/users/:userId',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.getByUserId)
)

router.patch(
    '/:id/return',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.return)
)

router.patch(
    '/:id/renew',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.renew)
)

export default router
