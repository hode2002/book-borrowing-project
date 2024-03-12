import express from 'express'
import passport from 'passport'

import { asyncHandler } from '../utils'
import { IsLibrarian } from '../common/middlewares'
import { PublisherController } from '../controllers'

const router = express.Router()

router.get('/', asyncHandler(PublisherController.getAll))

router.get('/:id', asyncHandler(PublisherController.getById))

router.post(
    '/',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(PublisherController.create)
)

router.patch(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    IsLibrarian,
    asyncHandler(PublisherController.updateById)
)

export default router
