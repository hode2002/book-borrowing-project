import express from 'express'
import AuthRoute from './auth.route'
import UserRoute from './user.route'
import BookRoute from './book.route'
import AuthorRoute from './author.route'
import PublisherRoute from './publisher.route'

const router = express.Router()

router.use('/auth', AuthRoute)

router.use('/users', UserRoute)

router.use('/books', BookRoute)

router.use('/authors', AuthorRoute)

router.use('/publishers', PublisherRoute)

export default router
