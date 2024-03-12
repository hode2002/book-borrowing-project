import mongoose from 'mongoose'
import { createSlug } from '../utils'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'Publisher'
const COLLECTION_NAME = 'Publishers'

const addressSchema = new Schema({
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
})

const publisherSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            index: true,
        },
        address: {
            type: addressSchema,
            default: null,
        },
        slug: {
            type: String,
        },
    },
    {
        timestamps: true,
        collection: COLLECTION_NAME,
    }
).pre('save', function (next) {
    const publisher = this
    publisher.slug = createSlug(publisher.name as string)
    next()
})

export default model(DOCUMENT_NAME, publisherSchema)
