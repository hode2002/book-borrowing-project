import { StatusCodes } from 'http-status-codes'
import { isValidObjectId } from 'mongoose'

import { BookModel } from '../models'
import { ApiError, createSlug } from '../utils'
import { CreateBookInterface, UpdateBookInterface } from '../common/interfaces'

class BookService {
    async create(createBook: CreateBookInterface) {
        if (
            !createBook.name ||
            !createBook.price ||
            !createBook.quantity ||
            !createBook.publisherId ||
            !createBook.authorId
        ) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Missing data to create'
            )
        }

        const slug = createSlug(createBook.name as string)

        const isExist = await BookModel.findOne({ slug })
            .select(
                '_id name price quantity description publication_year thumbnail images publisherId authorId other_info'
            )
            .lean()

        if (isExist) {
            throw new ApiError(StatusCodes.CONFLICT, 'Book already exist')
        }

        const {
            _id,
            name,
            price,
            quantity,
            publication_year,
            publisherId,
            authorId,
            thumbnail,
            description,
            images,
            other_info,
        } = await BookModel.create({ ...createBook })
        if (!_id) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create book`
            )
        }

        return {
            is_success: true,
            book: {
                _id,
                name,
                price,
                quantity,
                publication_year,
                publisherId,
                authorId,
                thumbnail,
                description,
                images,
                other_info,
            },
        }
    }

    async getAll() {
        return await BookModel.find({
            quantity: { $gt: 0 },
        })
            .select('_id name price quantity thumbnail')
            .lean()
    }

    async adminGetAll() {
        return await BookModel.find()
            .select('_id name price quantity thumbnail')
            .lean()
    }

    async getById({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing book id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid book id')
        }

        const book = await BookModel.findOne({ _id: id, quantity: { $gt: 0 } })
            .populate({
                path: 'authorId',
                select: '_id name photo description slug',
            })
            .populate({ path: 'publisherId', select: '_id name address slug' })
            .select(
                '_id name price quantity description publication_year thumbnail images publisherId authorId other_info'
            )
            .lean()

        if (!book) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Book not found')
        }

        return {
            is_success: true,
            book,
        }
    }

    async updateById({ id }: { id: string }, updateBook: UpdateBookInterface) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing book id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid book id')
        }

        const isExist = await BookModel.findOne({ _id: id })
            .select(
                '_id name price quantity description publication_year thumbnail images publisherId authorId other_info'
            )
            .lean()

        if (!isExist) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Book not found')
        }

        if (updateBook?.name) {
            await BookModel.updateOne(
                { _id: id },
                { slug: createSlug(updateBook?.name as string) }
            )
        }

        const bookUpdated = await BookModel.findOneAndUpdate(
            { _id: id },
            { ...updateBook },
            { new: true }
        )
            .populate({
                path: 'authorId',
                select: '_id name photo description slug',
            })
            .populate({ path: 'publisherId', select: '_id name address slug' })
            .select(
                '_id name price quantity description publication_year thumbnail images publisherId authorId other_info'
            )
            .lean()

        if (!bookUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create new book`
            )
        }

        return {
            is_success: true,
            book: { ...bookUpdated },
        }
    }
}

export default new BookService()
