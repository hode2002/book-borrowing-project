import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import initWebRoute from './routes/index'
import express, { Request, Response, NextFunction } from 'express'

import { connect } from './db/init.mongodb'

dotenv.config()
const app = express()

// init middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//init database
connect()

//init routes
app.use('/api/v1', initWebRoute)

//handling error
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error('Not Found') as any
    error['status'] = 404
    next(error)
})

app.use((error: any, req: Request, res: Response) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
    })
})

export default app
