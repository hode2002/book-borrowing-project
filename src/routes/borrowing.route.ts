import express from 'express'
import passport from 'passport'

import { BorrowingController } from '../controllers'
import { asyncHandler } from '../utils'
import { IsLibrarian } from '../common/middlewares'

const router = express.Router()

router.get(
    '/',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.getByUserId)
)

router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.create)
)

router.get(
    '/management',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.adminGetAll)
)

router.get(
    '/management/:id',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.adminGetById)
)

router.get(
    '/management/user/:userId',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.adminGetByUserId)
)

router.get(
    '/status/:status',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.getByStatus)
)

router.get(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.getById)
)

router.patch(
    '/:id/accept',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.accept)
)

router.patch(
    '/:id/return',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.return)
)

router.patch(
    '/:id/renew',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.renew)
)

router.patch(
    '/:id/status',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.updateStatus)
)

export default router
