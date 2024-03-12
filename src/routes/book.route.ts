import express from 'express'
import passport from 'passport'

import { BookController } from '../controllers'
import { asyncHandler } from '../utils'
import { IsLibrarian } from '../common/middlewares'

const router = express.Router()

router.get('/', asyncHandler(BookController.getAll))

router.get(
    '/manage',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BookController.adminGetAll)
)

router.get('/:id', asyncHandler(BookController.getById))

router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BookController.create)
)

router.patch(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(BookController.updateById)
)

export default router
