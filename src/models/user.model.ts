import mongoose from 'mongoose'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

const userSchema = new Schema(
    {
        phoneNumber: {
            type: String,
            trim: true,
            maxLength: 10,
            required: true,
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
                type: String,
            },
        },
        gender: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: UserStatus,
            default: UserStatus.ACTIVE,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

export default model(DOCUMENT_NAME, userSchema)
