import express, { NextFunction, Request, Response } from 'express'

const router = express.Router()

router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('Welcome')
})

export default router
