import mongoose from 'mongoose'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

export enum UserRoles {
    USER = 'user',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

const userSchema = new Schema(
    {
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        password: {
            type: String,
            unique: true,
            default: null,
            trim: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            maxLength: 10,
            unique: true,
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
            Address: {
                type: String,
                default: null,
            },
            province: {
                type: String,
                default: null,
            },
            district: {
                type: String,
                default: null,
            },
            ward: {
                type: String,
                default: null,
            },
            hamlet: {
                type: String,
                default: null,
            },
        },
        gender: {
            type: String,
            default: null,
        },
        status: {
            type: String,
            enum: UserStatus,
            default: UserStatus.INACTIVE,
            index: true,
        },
        avatar: {
            type: String,
            default:
                'https://ct449-project.s3.ap-southeast-1.amazonaws.com/default.jpg',
        },
        refreshToken: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            default: UserRoles.USER,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

export default model(DOCUMENT_NAME, userSchema)
