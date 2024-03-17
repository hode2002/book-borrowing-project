import { PassportStatic } from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { Request } from 'express'
import * as bcrypt from 'bcrypt'
import { StatusCodes } from 'http-status-codes'

import { JwtPayload } from '../../common/interfaces'
import { EmployeeModel, UserModel } from '../../models'
import { ApiError } from '../../utils'
import { UserRoles } from '../../models/user.model'

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
                    try {
                        const refreshToken = <string>(
                            req?.headers['authorization']
                                ?.toString()
                                .replace('Bearer', '')
                                .trim()
                        )

                        if (!refreshToken) {
                            throw new ApiError(
                                StatusCodes.FORBIDDEN,
                                'Access denied'
                            )
                        }

                        let result
                        if (payload.role === UserRoles.USER) {
                            result = await UserModel.findOne({
                                _id: payload.id,
                            }).lean()

                            if (!result) {
                                throw new ApiError(
                                    StatusCodes.NOT_FOUND,
                                    `User not found`
                                )
                            }
                        } else {
                            result = await EmployeeModel.findOne({
                                _id: payload.id,
                            }).lean()

                            if (!result) {
                                throw new ApiError(
                                    StatusCodes.NOT_FOUND,
                                    'Employee not found'
                                )
                            }
                        }

                        const hashRf = <string>result?.refreshToken
                        if (!hashRf) {
                            throw new ApiError(
                                StatusCodes.FORBIDDEN,
                                'Access denied'
                            )
                        }

                        const isMatches = await bcrypt.compare(
                            refreshToken,
                            hashRf
                        )
                        if (!isMatches) {
                            throw new ApiError(
                                StatusCodes.FORBIDDEN,
                                'Access denied'
                            )
                        }

                        return done(null, payload)
                    } catch (error) {
                        done(error)
                    }
                }
            )
        )
    }
}
