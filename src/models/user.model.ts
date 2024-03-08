import mongoose from 'mongoose'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

enum Status {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

enum Role {
    USER = 'user',
    ADMIN = 'admin',
}

enum AuthType {
    EMAIL = 'email',
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
}

const userAddressSchema = new Schema({
    address: {
        type: String,
    },
    province: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    ward: {
        type: String,
        required: true,
    },
    hamlet: {
        type: Object,
    },
})

const userSchema = new Schema(
    {
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true,
            index: true,
        },
        password: {
            type: String,
            trim: true,
            required: true,
        },
        name: {
            type: String,
            maxLength: 150,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
            maxLength: 10,
        },
        address: {
            type: userAddressSchema,
        },
        avatar: {
            type: String,
            default:
                'https://ct466-project.s3.ap-southeast-2.amazonaws.com/default.jpg',
        },
        status: {
            type: String,
            enum: Status,
            default: Status.INACTIVE,
            index: true,
        },
        role: {
            type: String,
            enum: Role,
            default: Role.USER,
            index: true,
        },
        authType: {
            type: String,
            enum: AuthType,
            default: AuthType.EMAIL,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

export default model(DOCUMENT_NAME, userSchema)
