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

router.get('/search', asyncHandler(BookController.getBySearchTerm))

router.get('/:id', asyncHandler(BookController.getById))

router.get('/name/:slug', asyncHandler(BookController.getBySlug))

router.get('/author/:id', asyncHandler(BookController.getByAuthorId))

router.get('/category/:slug', asyncHandler(BookController.getByCateName))

router.get('/publishers/:id', asyncHandler(BookController.getByPublisherId))

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
