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
    asyncHandler(BorrowingController.getById)
)

router.patch(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.updateById)
)

router.get(
    '/user/list',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.getByUserId)
)

router.patch(
    '/:id/cancel',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.cancel)
)

router.patch(
    '/:id/accept',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.accept)
)

router.patch(
    '/:id/reject',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BorrowingController.reject)
)

router.patch(
    '/:id/receive',
    passport.authenticate('jwt', { session: false }),
    asyncHandler(BorrowingController.receive)
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

export default router
