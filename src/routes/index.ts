import express from 'express'
import AuthRoute from './auth.route'
import UserRoute from './user.route'

const router = express.Router()

router.use('/auth', AuthRoute)

router.use('/users', UserRoute)

export default router
