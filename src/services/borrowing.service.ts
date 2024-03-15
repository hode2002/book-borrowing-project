import { StatusCodes } from 'http-status-codes'
import { isValidObjectId } from 'mongoose'
import moment from 'moment'

import { BookModel, BorrowingModel } from '../models'
import { ApiError } from '../utils'
import {
    CreateBorrowingInterface,
    UpdateBorrowingInterface,
} from '../common/interfaces'
import { TrackBookBorrowingStatus } from '../models/track-book-borrowing.model'
import userModel from '../models/user.model'

class BorrowingService {
    async create(
        { userId }: { userId: string },
        createBorrowing: CreateBorrowingInterface
    ) {
        if (!userId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing user id')
        }

        if (!isValidObjectId(userId)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id')
        }

        if (
            !createBorrowing.bookId ||
            !createBorrowing.quantity ||
            !createBorrowing.borrowDate ||
            !createBorrowing.dueDate
        ) {
            throw new ApiError(
                StatusCodes.BAD_REQUEST,
                'Missing data to create'
            )
        }

        const user = await userModel.findOne({ _id: userId }).lean()
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        } else if (!user?.address) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                'Please update your address before borrowing books.'
            )
        }

        const isExist = await BorrowingModel.findOne({
            userId,
            bookId: createBorrowing.bookId,
            borrowDate: createBorrowing.borrowDate,
            status: { $nin: [TrackBookBorrowingStatus.CANCELLED] },
        })
            .populate({
                path: 'userId',
                select: '_id email name avatar address phoneNumber',
            })
            .populate({
                path: 'bookId',
                select: '_id name price thumbnail slug',
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        if (isExist) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                `You can't borrow the same book twice in 1 day`
            )
        }

        const book = await BookModel.findOne({
            _id: createBorrowing.bookId,
        }).lean()

        if (book!.quantity < createBorrowing.quantity) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                'The current quantity of books is insufficient. Please return at another time or adjust the quantity.'
            )
        }

        const { _id, bookId, quantity, borrowDate, dueDate, status } =
            await BorrowingModel.create({ ...createBorrowing, userId })

        if (!_id) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                'Unable to borrow books at this time, please try again later.'
            )
        }

        return {
            is_success: true,
            trackingInfo: {
                _id,
                bookId,
                quantity,
                borrowDate,
                dueDate,
                status,
            },
        }
    }

    async getAll() {
        const booksHasBorrowed = await BorrowingModel.find()
            .populate({
                path: 'userId',
                select: '_id email name avatar address phoneNumber',
            })
            .populate({
                path: 'bookId',
                select: '_id name price thumbnail slug',
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        const booksHasBorrowedPromises = booksHasBorrowed.map(async (book) => {
            return {
                ...book,
                status: await this.updateStatusBasedOnDueDay({
                    _id: book._id.toString(),
                    dueDate: book.dueDate,
                    status: book.status,
                }),
            }
        })

        return await Promise.all(booksHasBorrowedPromises)
    }

    async getById({ id }: { id: string }, { userId }: { userId: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing borrowing id')
        }

        if (!userId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing user id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const trackingInfo = await BorrowingModel.findOne({ _id: id, userId })
            .populate({
                path: 'userId',
                select: '_id email name avatar address phoneNumber',
            })
            .populate({
                path: 'bookId',
                select: '_id name price thumbnail slug',
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        if (!trackingInfo) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Borrowed books not found'
            )
        }

        return {
            is_success: true,
            trackingInfo: {
                ...trackingInfo,
                status: await this.updateStatusBasedOnDueDay({
                    _id: id,
                    dueDate: trackingInfo.dueDate,
                    status: trackingInfo.status,
                }),
            },
        }
    }

    async getByStatus({ status }: { status: string }) {
        if (!status) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing status')
        }

        const booksHasBorrowed = await BorrowingModel.find({ status })
            .populate({
                path: 'userId',
                select: '_id email name avatar address phoneNumber',
            })
            .populate({
                path: 'bookId',
                select: '_id name price thumbnail slug',
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        const booksHasBorrowedPromises = booksHasBorrowed.map(async (book) => {
            return {
                ...book,
                status: await this.updateStatusBasedOnDueDay({
                    _id: book._id.toString(),
                    dueDate: book.dueDate,
                    status: book.status,
                }),
            }
        })

        return await Promise.all(booksHasBorrowedPromises)
    }

    async getByUserId({ userId }: { userId: string }) {
        if (!userId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing user id')
        }

        if (!isValidObjectId(userId)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id')
        }

        const booksHasBorrowed = await BorrowingModel.find({ userId })
            .populate({
                path: 'userId',
                select: '_id email name avatar address phoneNumber',
            })
            .populate({
                path: 'bookId',
                select: '_id name price thumbnail slug',
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        const booksHasBorrowedPromises = booksHasBorrowed.map(async (book) => {
            return {
                ...book,
                status: await this.updateStatusBasedOnDueDay({
                    _id: book._id.toString(),
                    dueDate: book.dueDate,
                    status: book.status,
                }),
            }
        })

        return await Promise.all(booksHasBorrowedPromises)
    }

    async updateStatus({ id, status }: { id: string; status: string }) {
        if (!status) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid status')
        }

        const isUpdated = await BorrowingModel.findOneAndUpdate(
            { _id: id },
            { status },
            { new: true }
        )
            .populate({
                path: 'userId',
                select: '_id email name avatar address phoneNumber',
            })
            .populate({
                path: 'bookId',
                select: '_id name price thumbnail slug',
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update status`
            )
        }

        return {
            is_success: true,
            ...isUpdated,
        }
    }

    async accept({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing borrowing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const isExist = await BorrowingModel.findOne({
            _id: id,
            status: TrackBookBorrowingStatus.PENDING,
        }).lean()

        if (!isExist) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Borrowed books not found'
            )
        }

        const trackingInfo = await this.updateStatus({
            id,
            status: TrackBookBorrowingStatus.DELIVERY,
        })

        const book = await BookModel.findOne({ _id: trackingInfo.bookId })
            .select('quantity')
            .lean()

        const isUpdatedQuantity = await BookModel.updateOne(
            { _id: trackingInfo.bookId },
            { quantity: book!.quantity - trackingInfo.quantity }
        )

        if (!isUpdatedQuantity) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update book quantity`
            )
        }

        return trackingInfo
    }

    async reject({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing borrowing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const isExist = await BorrowingModel.findOne({
            _id: id,
            status: TrackBookBorrowingStatus.PENDING,
        }).lean()

        if (!isExist) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Borrowed books not found'
            )
        }

        return await this.updateStatus({
            id,
            status: TrackBookBorrowingStatus.REJECTED,
        })
    }

    async receive({ userId }: { userId: string }, { id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing borrowing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const isExist = await BorrowingModel.findOne({
            _id: id,
            status: TrackBookBorrowingStatus.DELIVERY,
        })
            .select('userId')
            .lean()

        if (!isExist) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Borrowed books not found'
            )
        }

        if (isExist?.userId !== userId) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
        }

        const trackingInfo = await this.updateStatus({
            id,
            status: TrackBookBorrowingStatus.RECEIVED,
        })

        return trackingInfo
    }

    async return({ userId }: { userId: string }, { id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing borrowing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const isExist = await BorrowingModel.findOne({
            _id: id,
            status: TrackBookBorrowingStatus.RECEIVED,
        })
            .select('userId')
            .lean()

        if (!isExist) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Borrowed books not found'
            )
        }

        if (isExist?.userId !== userId) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
        }

        const trackingInfo = await this.updateStatus({
            id,
            status: TrackBookBorrowingStatus.RETURNED,
        })

        const book = await BookModel.findOne({ _id: trackingInfo.bookId })
            .select('quantity')
            .lean()

        const isUpdatedQuantity = await BookModel.updateOne(
            { _id: trackingInfo.bookId },
            { quantity: book!.quantity + trackingInfo.quantity }
        )

        if (!isUpdatedQuantity) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update book quantity`
            )
        }

        return trackingInfo
    }

    async renew(
        { userId }: { userId: string },
        { id }: { id: string },
        { numberOfRenewalDays }: { numberOfRenewalDays: number }
    ) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing borrowing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const isExist = await BorrowingModel.findOne({
            _id: id,
            status: {
                $in: [
                    TrackBookBorrowingStatus.RECEIVED,
                    TrackBookBorrowingStatus.RENEWED,
                ],
            },
        })
            .select('userId')
            .lean()

        if (!isExist) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Borrowed books not found'
            )
        }

        if (isExist?.userId !== userId) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
        }

        const trackingInfo = await this.updateStatus({
            id,
            status: TrackBookBorrowingStatus.RENEWED,
        })

        const isUpdatedDueDay = await BorrowingModel.findOneAndUpdate(
            { _id: trackingInfo._id },
            {
                dueDate: moment(trackingInfo.dueDate)
                    .add(numberOfRenewalDays, 'days')
                    .toISOString(),
            },
            { new: true }
        )
            .populate({
                path: 'userId',
                select: '_id email name avatar address phoneNumber',
            })
            .populate({
                path: 'bookId',
                select: '_id name price thumbnail slug',
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        if (!isUpdatedDueDay) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update due day`
            )
        }

        return {
            is_success: true,
            trackingInfo: { ...isUpdatedDueDay },
        }
    }

    async cancel({ userId }: { userId: string }, { id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing borrowing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const isExist = await BorrowingModel.findOne({
            _id: id,
            status: {
                $nin: [
                    TrackBookBorrowingStatus.CANCELLED,
                    TrackBookBorrowingStatus.DELIVERY,
                ],
            },
        })
            .select('userId')
            .lean()

        if (!isExist) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Borrowed books not found'
            )
        }

        if (isExist?.userId !== userId) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
        }

        const trackingInfo = await this.updateStatus({
            id,
            status: TrackBookBorrowingStatus.CANCELLED,
        })

        const book = await BookModel.findOne({ _id: trackingInfo.bookId })
            .select('quantity')
            .lean()

        const isUpdatedQuantity = await BookModel.updateOne(
            { _id: trackingInfo.bookId },
            { quantity: book!.quantity + trackingInfo.quantity }
        )

        if (!isUpdatedQuantity) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update book quantity`
            )
        }

        return trackingInfo
    }

    async updateById(
        { id }: { id: string },
        { userId }: { userId: string },
        updateBorrowing: UpdateBorrowingInterface
    ) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing book id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid book id')
        }

        if (!userId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing user id')
        }

        if (!isValidObjectId(userId)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id')
        }

        const isExist = await BorrowingModel.findOne({ _id: id })
            .select(
                '_id name price quantity description publication_year thumbnail images publisherId authorId other_info'
            )
            .lean()

        if (!isExist) {
            throw new ApiError(
                StatusCodes.NOT_FOUND,
                'Borrowed books not found'
            )
        }

        const isUpdated = await BorrowingModel.findOneAndUpdate(
            { _id: id },
            { ...updateBorrowing },
            { new: true }
        )
            .populate({
                path: 'userId',
                select: '_id email name avatar address phoneNumber',
            })
            .populate({
                path: 'bookId',
                select: '_id name price thumbnail slug',
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        if (!isUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Unable to update book borrowing tracking`
            )
        }

        return {
            is_success: true,
            trackingInfo: { ...isUpdated },
        }
    }

    private async updateStatusBasedOnDueDay({
        _id,
        dueDate,
        status,
    }: {
        _id: String
        dueDate: Date
        status: String
    }) {
        const currentDate = new Date()
        console.log(dueDate)
        console.log(currentDate)
        console.log(moment(dueDate).isBefore(currentDate))

        if (moment(dueDate).isBefore(currentDate)) {
            console.log('1')
            if (status !== TrackBookBorrowingStatus.OVERDUE) {
                await BorrowingModel.updateOne(
                    { _id },
                    { status: TrackBookBorrowingStatus.OVERDUE }
                ).lean()
                return TrackBookBorrowingStatus.OVERDUE
            }

            const limitDate: number = 10
            const numberOfDaysNotRenewed = moment(dueDate).add(
                limitDate,
                'days'
            )

            if (numberOfDaysNotRenewed.isSameOrBefore(currentDate)) {
                await BorrowingModel.updateOne(
                    { _id },
                    { status: TrackBookBorrowingStatus.LOST }
                ).lean()
                return TrackBookBorrowingStatus.LOST
            }
        }

        return status
    }
}

export default new BorrowingService()
