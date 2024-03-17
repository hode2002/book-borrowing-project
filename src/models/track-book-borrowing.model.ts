import mongoose from 'mongoose'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'TrackBookBorrowing'
const COLLECTION_NAME = 'TrackBookBorrowings'

export enum TrackBookBorrowingStatus {
    PENDING = 'pending',
    RECEIVED = 'received',
    RETURNED = 'returned',
    RENEWED = 'renewed',
    OVERDUE = 'overdue',
    LOST = 'lost',
}

const Employee = {
    id: String,
    email: String,
    lastName: String,
    firstName: String,
    phoneNumber: String,
}

const trackBookBorrowingSchema = new Schema(
    {
        userId: {
            type: String,
            ref: 'User',
        },
        bookId: {
            type: String,
            ref: 'Book',
        },
        borrowDate: {
            type: Date,
            default: new Date(),
        },
        dueDate: {
            type: Date,
            required: true,
        },
        quantity: {
            type: Number,
            default: 1,
        },
        status: {
            type: String,
            default: TrackBookBorrowingStatus.PENDING,
        },
        acceptedBy: {
            type: Employee,
            default: null,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

export default model(DOCUMENT_NAME, trackBookBorrowingSchema)
