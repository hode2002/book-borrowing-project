import { PassportStatic } from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { Request } from 'express'
import * as bcrypt from 'bcrypt'

import { JwtPayload } from '../../common/interfaces'
import { EmployeeModel } from '../../models'
import { ApiError } from '../../utils'

export class RfJwtStrategy {
    private readonly passport: PassportStatic

    constructor(passport: PassportStatic) {
        this.passport = passport
    }

    create() {
        this.passport.use(
            'jwt-refresh',
            new Strategy(
                {
                    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                    secretOrKey: <string>process.env['REFRESH_TOKEN_SECRET'],
                    passReqToCallback: true,
                },
                async (req: Request, payload: JwtPayload, done: Function) => {
                    const refreshToken = <string>(
                        req?.headers['authorization']
                            ?.toString()
                            .replace('Bearer', '')
                            .trim()
                    )

                    if (!refreshToken) {
                        throw new ApiError(403, 'Access denied')
                    }

                    const employee = await EmployeeModel.findOne({
                        _id: payload.id,
                    }).lean()

                    if (!employee) {
                        throw new ApiError(404, 'Employee not found')
                    }

                    const hashRf = <string>employee?.refreshToken

                    const isMatches = await bcrypt.compare(refreshToken, hashRf)
                    if (!isMatches) {
                        throw new ApiError(403, 'Access denied')
                    }

                    return done(null, payload)
                }
            )
        )
    }
}
