import mongoose from 'mongoose'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'Otp'
const COLLECTION_NAME = 'Otps'

const otpSchema = new Schema(
    {
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true,
            index: true,
        },
        otpCode: {
            type: String,
            required: true,
        },
        expireIn: {
            type: Date,
            expires: 300,
            default: Date.now,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

export default model(DOCUMENT_NAME, otpSchema)
