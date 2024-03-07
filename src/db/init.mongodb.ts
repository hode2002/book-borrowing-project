import mongoose from 'mongoose'
import configMongoDB from '../configs/config.mongodb'

const {
    db: { uri },
} = configMongoDB

//connect
export const connect = async () => {
    try {
        await mongoose.connect(uri)
        console.log('Connected to Database')
    } catch (error) {
        throw new Error('Connection error: ' + error)
    }
}
