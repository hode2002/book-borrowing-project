import { UserModel } from '../models'

class UserService {
    async create() {
        const user = await UserModel.create({
            email: 'hvd@gmail.com',
            password: 'password',
        })

        if (!user) {
            throw new Error("Can't create user")
        }

        return user
    }
}

export default new UserService()
