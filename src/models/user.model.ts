import mongoose from 'mongoose'

const { model, Schema, Types } = mongoose

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum AuthType {
    EMAIL = 'email',
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
}

const userAddressSchema = new Schema({
    Address: {
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
            default: null,
            trim: true,
        },
        lastName: {
            type: String,
            default: null,
            trim: true,
        },
        firstName: {
            type: String,
            default: null,
            trim: true,
        },
        dob: {
            type: Date,
            default: null,
        },
        address: {
            type: userAddressSchema,
            default: null,
        },
        phoneNumber: {
            type: String,
            trim: true,
            maxLength: 10,
        },
        avatar: {
            type: String,
            default:
                'https://ct466-project.s3.ap-southeast-2.amazonaws.com/default.jpg',
        },
        status: {
            type: String,
            enum: UserStatus,
            default: UserStatus.INACTIVE,
            index: true,
        },
        authType: {
            type: String,
            enum: AuthType,
            default: AuthType.EMAIL,
            index: true,
        },
        refreshToken: {
            type: String,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

export default model(DOCUMENT_NAME, userSchema)
