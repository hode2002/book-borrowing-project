import mongoose from 'mongoose'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

export enum UserRoles {
    EMPLOYEE = 'employee',
    USER = 'user',
}

export enum EmployeePositions {
    LIBRARIAN = 'librarian',
    CUSTOMER_SERVICE = 'customer_service',
}

export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

export enum AuthType {
    EMAIL = 'email',
    GOOGLE = 'google',
    FACEBOOK = 'facebook',
    EMPLOYEE_ID = 'employee_id',
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

const employeeSchema = new Schema({
    position: {
        type: String,
        default: EmployeePositions.LIBRARIAN,
    },
    id: {
        type: String,
        default: null,
        index: true,
        required: true,
    },
})

const userSchema = new Schema(
    {
        email: {
            type: String,
            trim: true,
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
        role: {
            type: String,
            default: UserRoles.USER,
            index: true,
        },
        employee: {
            type: employeeSchema,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

export default model(DOCUMENT_NAME, userSchema)
