import { StatusCodes } from 'http-status-codes'
import { isValidObjectId } from 'mongoose'

import { PublisherModel } from '../models'
import { ApiError, createSlug } from '../utils'
import {
    CreatePublisherInterface,
    UpdatePublisherInterface,
} from '../common/interfaces'

class PublisherService {
    async create(createPublisher: CreatePublisherInterface) {
        if (!createPublisher.name) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Missing data to create'
            )
        }

        const isExist = await PublisherModel.findOne({
            slug: createSlug(createPublisher.name as string),
        })
            .select('_id name address slug')
            .lean()

        if (isExist) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                'Book publisher already exist'
            )
        }

        const { _id, name, address } = await PublisherModel.create({
            name: createPublisher.name,
            address: { ...createPublisher },
        })

        if (!_id) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't create new publisher`
            )
        }

        return {
            is_success: true,
            publisher: { _id, name, address },
        }
    }

    async getAll() {
        const publishers = await PublisherModel.find()
            .select('_id name address slug')
            .lean()

        return {
            is_success: true,
            publishers,
        }
    }

    async getById({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing publisher id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid publisher id')
        }

        const publisher = await PublisherModel.findOne({ _id: id })
            .select('_id name address slug')
            .lean()

        if (!publisher) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Publisher not found')
        }

        return {
            is_success: true,
            publisher,
        }
    }

    async updateById(
        { id }: { id: string },
        updatePublisher: UpdatePublisherInterface
    ) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing publisher id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid publisher id')
        }

        const isExist = await PublisherModel.findOne({ _id: id })
            .select('_id name address slug')
            .lean()

        if (!isExist) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Publisher not found')
        }

        if (updatePublisher?.name) {
            await PublisherModel.updateOne(
                { _id: id },
                { slug: createSlug(updatePublisher?.name as string) }
            )
        }

        const publisherUpdated = await PublisherModel.findOneAndUpdate(
            { _id: id },
            { ...updatePublisher },
            { new: true }
        )
            .select('_id name address slug')
            .lean()

        if (!publisherUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update publisher`
            )
        }

        return {
            is_success: true,
            publisher: { ...publisherUpdated },
        }
    }
}

export default new PublisherService()
