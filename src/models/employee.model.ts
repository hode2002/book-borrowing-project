import mongoose from 'mongoose'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'Employee'
const COLLECTION_NAME = 'Employees'

export enum EmployeeRoles {
    ADMIN = 'admin',
    LIBRARIAN = 'librarian',
    CUSTOMER_SERVICE = 'customer_service',
}

export enum EmployeeStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
}

const employeeSchema = new Schema(
    {
        email: {
            type: String,
            trim: true,
            index: true,
            required: true,
            unique: true,
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
            required: true,
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
        phoneNumber: {
            type: String,
            trim: true,
            maxLength: 10,
            required: true,
        },
        avatar: {
            type: String,
            default:
                'https://ct466-project.s3.ap-southeast-2.amazonaws.com/default.jpg',
        },
        status: {
            type: String,
            enum: EmployeeStatus,
            default: EmployeeStatus.ACTIVE,
            index: true,
        },
        refreshToken: {
            type: String,
            default: null,
        },
        role: {
            type: String,
            default: EmployeeRoles.LIBRARIAN,
            index: true,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

export default model(DOCUMENT_NAME, employeeSchema)
