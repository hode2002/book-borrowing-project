import { PassportStatic } from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { UserJwtPayload } from '../../common/interfaces'

export class AtJwtStrategy {
    private readonly passport: PassportStatic

    constructor(passport: PassportStatic) {
        this.passport = passport
    }

    create() {
        this.passport.use(
            'jwt',
            new Strategy(
                {
                    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                    secretOrKey: <string>process.env['ACCESS_TOKEN_SECRET'],
                },
                (payload: UserJwtPayload, done: Function) => {
                    return done(null, payload)
                }
            )
        )
    }
}
