import mongoose from 'mongoose'
import { createSlug } from '../utils'

const { model, Schema } = mongoose

const DOCUMENT_NAME = 'Author'
const COLLECTION_NAME = 'Authors'

const authorSchema = new Schema(
    {
        name: {
            type: String,
            trim: true,
            index: true,
        },
        photo: {
            type: String,
            default:
                'https://ct466-project.s3.ap-southeast-2.amazonaws.com/default.jpg',
        },
        description: {
            type: String,
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
    const author = this
    author.slug = createSlug(author.name as string)
    next()
})

export default model(DOCUMENT_NAME, authorSchema)
