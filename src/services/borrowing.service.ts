import { StatusCodes } from 'http-status-codes'
import { isValidObjectId } from 'mongoose'
import moment from 'moment'

import { BookModel, BorrowingModel, UserModel } from '../models'
import { ApiError } from '../utils'
import { CreateBookBorrowing } from '../common/interfaces'
import { TrackBookBorrowingStatus } from '../models/track-book-borrowing.model'

class BorrowingService {
    async create({ id }: { id: string }, createBorrowing: CreateBookBorrowing) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing user id')
        }

        if (!isValidObjectId(id)) {
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

        if (createBorrowing.quantity > 2) {
            throw new ApiError(
                StatusCodes.FORBIDDEN,
                'Quantity must be less than or equal 2'
            )
        }
        const user = await UserModel.findOne({ _id: id }).lean()
        if (!user) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'User not found')
        }

        const results = await BorrowingModel.find({
            userId: id,
            bookId: createBorrowing.bookId,
            // borrowDate:  createBorrowing.borrowDate,
            status: TrackBookBorrowingStatus.PENDING,
        }).lean()

        const isExist = results.find((item) =>
            moment(item.borrowDate).isSameOrBefore(
                createBorrowing.borrowDate,
                'day'
            )
        )

        if (isExist) {
            throw new ApiError(
                StatusCodes.CONFLICT,
                `You can't borrow the same book twice in 1 day`
            )
        }

        const book = await BookModel.findOne({
            _id: createBorrowing.bookId,
        }).lean()

        if (!book) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Book not found')
        }

        if (book.quantity < createBorrowing.quantity) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                'The current quantity of books is insufficient. Please return at another time or adjust the quantity.'
            )
        }

        const { _id, userId, bookId, quantity, borrowDate, dueDate, status } =
            await BorrowingModel.create({
                ...createBorrowing,
                borrowDate: moment(createBorrowing.borrowDate).format(),
                userId: id,
            })

        if (!_id) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                'Unable to borrow books at this time, please try again later.'
            )
        }

        const isQuantityUpdated = await BookModel.updateOne(
            { _id: createBorrowing.bookId },
            { quantity: book!.quantity - createBorrowing.quantity }
        )

        if (!isQuantityUpdated) {
            throw new ApiError(
                StatusCodes.UNPROCESSABLE_ENTITY,
                `Can't update book quantity`
            )
        }

        return {
            is_success: true,
            trackingInfo: {
                _id,
                userId,
                bookId,
                quantity,
                borrowDate,
                dueDate,
                status,
            },
        }
    }

    async accept(
        { employeeId }: { employeeId: string },
        { id }: { id: string }
    ) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid id')
        }

        const employee = await UserModel.findOne({ _id: employeeId })
            .select('_id email firstName lastName phoneNumber')
            .lean()
        if (!employee) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Employee not found')
        }

        const isUpdated = await BorrowingModel.findOneAndUpdate(
            { _id: id },
            {
                status: TrackBookBorrowingStatus.RECEIVED,
                acceptedBy: { ...employee },
            }
        )
            .populate({
                path: 'userId',
                select: '-status -createdAt -updatedAt -__v',
            })
            .populate({
                path: 'bookId',
                select: '_id name thumbnail slug',
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

    async adminGetAll() {
        const booksHasBorrowed = await BorrowingModel.find()
            .populate({
                path: 'userId',
                select: '-status -createdAt -updatedAt -__v',
            })
            .populate({
                path: 'bookId',
                select: '_id name thumbnail slug',
            })
            .sort({ createdAt: 'desc' })
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

    async adminGetById({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid id')
        }

        const trackingInfo = await BorrowingModel.findOne({ _id: id })
            .populate({
                path: 'userId',
                select: '-status -createdAt -updatedAt -__v',
            })
            .populate({
                path: 'bookId',
                select: '_id name thumbnail slug',
            })
            .sort({})
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        if (!trackingInfo) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Borrowed book not found')
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

    async adminGetByUserId({ userId }: { userId: string }) {
        if (!userId) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing user id')
        }

        if (!isValidObjectId(userId)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id')
        }

        const booksHasBorrowed = await BorrowingModel.find({ userId })
            .populate({
                path: 'userId',
                select: '-status -createdAt -updatedAt -__v',
            })
            .populate({
                path: 'bookId',
                select: '_id name thumbnail slug',
            })
            .sort({})
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        if (!booksHasBorrowed) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Borrowed book not found')
        }

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

    async getById({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing borrowing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

        const trackingInfo = await BorrowingModel.findOne({ _id: id })
            .populate({
                path: 'userId',
                select: '-status -createdAt -updatedAt -__v',
            })
            .populate({
                path: 'bookId',
                select: '_id name thumbnail slug',
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        if (!trackingInfo) {
            throw new ApiError(StatusCodes.NOT_FOUND, 'Borrowed book not found')
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

    async getByStatus({ id }: { id: string }, { status }: { status: string }) {
        if (!status) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing status')
        }

        const booksHasBorrowed = await BorrowingModel.find({
            userId: id,
            status,
        })
            .populate({
                path: 'userId',
                select: '-status -createdAt -updatedAt -__v',
            })
            .populate({
                path: 'bookId',
                select: '_id name thumbnail slug',
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

    async getByUserId({ id }: { id: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing user id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid user id')
        }

        const booksHasBorrowed = await BorrowingModel.find({ userId: id })
            .populate({
                path: 'userId',
                select: '-status -createdAt -updatedAt -__v',
            })
            .populate({
                path: 'bookId',
                select: '-createdAt -updatedAt -__v',
                populate: [
                    {
                        path: 'authorId',
                        select: '_id name photo description slug',
                    },
                    {
                        path: 'publisherId',
                        select: '_id name address slug',
                    },
                ],
            })
            .select('_id userId bookId quantity borrowDate dueDate status')
            .lean()

        const booksHasBorrowedPromises = <any>booksHasBorrowed.map(
            async (book) => {
                return {
                    ...book,
                    status: await this.updateStatusBasedOnDueDay({
                        _id: book._id.toString(),
                        dueDate: book.dueDate,
                        status: book.status,
                    }),
                }
            }
        )

        return await Promise.all(booksHasBorrowedPromises)
    }

    async updateStatus({ id, status }: { id: string; status: string }) {
        if (!id) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Missing borrowing id')
        }

        if (!isValidObjectId(id)) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid borrowing id')
        }

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
                select: '-status -createdAt -updatedAt -__v',
            })
            .populate({
                path: 'bookId',
                select: '_id name thumbnail slug',
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

    async return({ userId }: { userId: string }, { id }: { id: string }) {
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
                    TrackBookBorrowingStatus.OVERDUE,
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

        if (userId !== isExist.userId) {
            throw new ApiError(StatusCodes.FORBIDDEN, 'Access denied')
        }

        const trackingInfo = await this.updateStatus({
            id,
            status: TrackBookBorrowingStatus.RETURNED,
        })

        const isQuantityUpdated = await BookModel.findOneAndUpdate(
            { _id: trackingInfo.bookId },
            { $inc: { quantity: trackingInfo.quantity } },
            { new: true }
        )

            .lean()

        if (!isQuantityUpdated) {
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
                    TrackBookBorrowingStatus.OVERDUE,
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

        if (userId !== isExist.userId) {
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
                select: '-status -createdAt -updatedAt -__v',
            })
            .populate({
                path: 'bookId',
                select: '_id name thumbnail slug',
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

        if (moment(dueDate).isBefore(currentDate)) {
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
