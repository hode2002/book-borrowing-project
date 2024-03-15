import mongoose from 'mongoose'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'TrackBookBorrowing'
const COLLECTION_NAME = 'TrackBookBorrowings'

export enum TrackBookBorrowingStatus {
    PENDING = 'pending',
    DELIVERY = 'delivery',
    RECEIVED = 'received',
    REJECTED = 'rejected',
    RETURNED = 'returned',
    RENEWED = 'renewed',
    CANCELLED = 'cancelled',
    OVERDUE = 'overdue',
    LOST = 'lost',
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
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
)

export default model(DOCUMENT_NAME, trackBookBorrowingSchema)
