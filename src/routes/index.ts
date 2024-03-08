import express from 'express'
import UserRoute from './user.route'

const router = express.Router()

router.use('/users', UserRoute)

export default router
