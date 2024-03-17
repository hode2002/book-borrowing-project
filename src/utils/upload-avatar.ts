import { StatusCodes } from 'http-status-codes'

import { UserAvatar } from '../common/interfaces'
import { MediaService } from '../services'
import ApiError from './api-error'

export const handleUploadAvatar = async (
    file: UserAvatar,
    oldAvatar: string
): Promise<{ is_success: boolean; newAvatar: string }> => {
    const res = await MediaService.upload(file)
    if (!res?.is_success) {
        throw new ApiError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            `Can't upload avatar file`
        )
    }

    const newAvatar = res?.link
    if (!newAvatar) {
        throw new ApiError(
            StatusCodes.UNPROCESSABLE_ENTITY,
            `Can't upload avatar file`
        )
    }

    if (!oldAvatar.includes('default.jpg')) {
        await MediaService.deleteFileS3(oldAvatar)
    }

    return {
        is_success: true,
        newAvatar,
    }
}
