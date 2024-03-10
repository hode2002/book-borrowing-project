import dotenv from 'dotenv'
import helmet from 'helmet'
import cors from 'cors'
import initWebRoute from './routes'
import express, { Request, Response, NextFunction } from 'express'
import passport from 'passport'

import { connect } from './db/init.mongodb'
import { AtJwtStrategy, RfJwtStrategy } from './auth'
import { ApiError } from './utils'

dotenv.config()
const app = express()

// init middlewares
app.use(helmet())
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

//init database
connect()

//init strategies
new AtJwtStrategy(passport).create()
new RfJwtStrategy(passport).create()

//init routes
app.use('/api/v1', initWebRoute)

//handling error
app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new ApiError(404, 'Resource not found') as any
    next(error)
})

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    const statusCode = error.status || 500
    return res.status(statusCode).json({
        status: 'error',
        code: statusCode,
        message: error.message || 'Internal Server Error',
    })
})

export default app
