import { PassportStatic } from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { Request } from 'express'
import * as bcrypt from 'bcrypt'

import { ApiError } from '../../utils'
import { UserJwtPayload } from '../../common/interfaces'
import { UserModel } from '../../models'

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
                async (
                    req: Request,
                    payload: UserJwtPayload,
                    done: Function
                ) => {
                    const refreshToken = <string>(
                        req?.headers['authorization']
                            ?.toString()
                            .replace('Bearer', '')
                            .trim()
                    )

                    if (!refreshToken) {
                        throw new ApiError(403, 'Access denied')
                    }

                    const user = await UserModel.findOne({
                        _id: payload.userId,
                    }).lean()

                    if (!user) {
                        throw new ApiError(404, 'User not found')
                    }

                    const hashRf = <string>user?.refreshToken

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
