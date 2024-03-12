import { StatusCodes } from 'http-status-codes'
import { isValidObjectId } from 'mongoose'

import { AuthorModel } from '../models'
import { ApiError, createSlug } from '../utils'
import {
    CreateAuthorInterface,
    UpdateAuthorInterface,
} from '../common/interfaces'

class AuthorService {
    async create(createAuthor: CreateAuthorInterface) {
        if (
            !createAuthor.name ||
            !createAuthor.photo ||
            !createAuthor.description
        ) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Missing data to create'
            )
        }

        const isExist = await AuthorModel.findOne({
            slug: createSlug(createAuthor.name as string),
        })
            .select('_id name photo description slug')
            .lean()

        if (isExist) {
            throw new ApiError(StatusCodes.CONFLICT, 'Author already exist')
        }

        const { _id, name, photo, description, slug } =
            await AuthorModel.create({
                ...createAuthor,
            })

        if (!_id) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create new author`
            )
        }

        return {
            is_success: true,
            author: { _id, name, photo, description, slug },
        }
    }

    async getAll() {
        const authors = await AuthorModel.find()
            .select('_id name photo description slug')
            .lean()

        return {
            is_success: true,
            authors,
        }
    }

    async getById({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing author id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid author id')
        }

        const author = await AuthorModel.findOne({ _id: id })
            .select('_id name photo description slug')
            .lean()

        if (!author) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Author not found')
        }

        return {
            is_success: true,
            author,
        }
    }

    async updateById(
        { id }: { id: string },
        updateAuthor: UpdateAuthorInterface
    ) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing author id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid author id')
        }

        const isExist = await AuthorModel.findOne({ _id: id })
            .select('_id name photo description slug')
            .lean()

        if (!isExist) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Author not found')
        }

        if (updateAuthor?.name) {
            await AuthorModel.updateOne(
                { _id: id },
                { slug: createSlug(updateAuthor?.name as string) }
            )
        }

        const authorUpdated = await AuthorModel.findOneAndUpdate(
            { _id: id },
            { ...updateAuthor },
            { new: true }
        )
            .select('_id name photo description slug')
            .lean()

        if (!authorUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update author`
            )
        }

        return {
            is_success: true,
            author: { ...authorUpdated },
        }
    }
}

export default new AuthorService()
