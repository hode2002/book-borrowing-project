import { StatusCodes } from 'http-status-codes'
import { isValidObjectId } from 'mongoose'

import { BookModel } from '../models'
import { ApiError, createSlug } from '../utils'
import { CreateBookInterface, UpdateBookInterface } from '../common/interfaces'

class BookService {
    async create(createBook: CreateBookInterface) {
        if (
            !createBook.name ||
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
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
            )
            .lean()

        if (isExist) {
            throw new ApiError(StatusCodes.CONFLICT, 'Book already exist')
        }

        const {
            _id,
            name,
            quantity,
            publication_year,
            publisherId,
            authorId,
            thumbnail,
            description,
            images,
            other_info,
            category,
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
                quantity,
                publication_year,
                publisherId,
                authorId,
                thumbnail,
                description,
                images,
                other_info,
                category,
            },
        }
    }

    async getAll() {
        const books = await BookModel.find({
            quantity: { $gt: 0 },
        })
            .populate({
                path: 'authorId',
                select: '_id name photo description slug',
            })
            .populate({ path: 'publisherId', select: '_id name address slug' })
            .select(
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
            )
            .lean()

        return {
            is_success: true,
            books,
        }
    }

    async adminGetAll() {
        return await BookModel.find()
            .populate({
                path: 'authorId',
                select: '_id name photo description slug',
            })
            .populate({ path: 'publisherId', select: '_id name address slug' })
            .select(
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
            )
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
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
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

    async getBySlug({ slug }: { slug: string }) {
        if (!slug) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing book name')
        }

        const book = await BookModel.findOne({ slug, quantity: { $gt: 0 } })
            .populate({
                path: 'authorId',
                select: '_id name photo description slug',
            })
            .populate({ path: 'publisherId', select: '_id name address slug' })
            .select(
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
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

    async getBySearchTerm({ searchTerm }: { searchTerm: string }) {
        if (!searchTerm) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing key word')
        }

        const books = await BookModel.find({
            slug: searchTerm,
            quantity: { $gt: 0 },
        })
            .populate({
                path: 'authorId',
                select: '_id name photo description slug',
            })
            .populate({ path: 'publisherId', select: '_id name address slug' })
            .select(
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
            )
            .lean()

        return {
            is_success: true,
            books,
        }
    }

    async getByCateName({ slug }: { slug: string }) {
        if (!slug) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing category')
        }

        const books = await BookModel.find({ 'category.slug': slug })
            .populate({
                path: 'authorId',
                select: '_id name photo description slug',
            })
            .populate({ path: 'publisherId', select: '_id name address slug' })
            .select(
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
            )
            .lean()

        return {
            is_success: true,
            books,
        }
    }

    async getByAuthorId({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing author id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid author id')
        }

        const books = await BookModel.find({ authorId: id })
            .populate({ path: 'publisherId', select: '_id name address slug' })
            .select(
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
            )
            .lean()

        return {
            is_success: true,
            books,
        }
    }

    async getByPublisherId({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Missing book publisher id'
            )
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Invalid book publisher id'
            )
        }

        const books = await BookModel.find({ publisherId: id })
            .populate({
                path: 'authorId',
                select: '_id name photo description slug',
            })
            .populate({ path: 'publisherId', select: '_id name address slug' })
            .select(
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
            )
            .lean()

        return {
            is_success: true,
            books,
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
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
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
                '_id name quantity description publication_year thumbnail images publisherId authorId category other_info slug'
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
