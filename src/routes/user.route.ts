import express from 'express'
import { UserController } from '../controllers'
import { asyncHandler } from '../utils'

const router = express.Router()

router.post('/', asyncHandler(UserController.create))

export default router
