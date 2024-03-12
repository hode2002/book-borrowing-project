import express from 'express'
import passport from 'passport'

import { asyncHandler } from '../utils'
import { IsLibrarian } from '../common/middlewares'
import { AuthorController } from '../controllers'

const router = express.Router()

router.get('/', asyncHandler(AuthorController.getAll))

router.get('/:id', asyncHandler(AuthorController.getById))

router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(AuthorController.create)
)

router.patch(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(AuthorController.updateById)
)

export default router
