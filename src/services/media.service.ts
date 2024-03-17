import { StatusCodes } from 'http-status-codes'
import { S3 } from 'aws-sdk'
import { v4 } from 'uuid'

import { ApiError, createSlug } from '../utils'
import { PutObjectRequest } from 'aws-sdk/clients/s3'

class MediaService {
    async upload(file: any): Promise<{ is_success: boolean; link: string }> {
        const uuid = v4()
        const arr_name = file.originalname.split('.')
        const extension = arr_name.pop()
        const name = arr_name.join('.')
        const key = uuid + '/' + createSlug(name) + '.' + extension

        await this.uploadS3(file.buffer, key, file.mimetype)

        return {
            is_success: true,
            link: process.env['AWS_BASE_URL'] + key,
        }
    }

    private async uploadS3(
        file_buffer: Buffer,
        key: string,
        content_type: string
    ) {
        const s3 = this.createInstanceS3()
        const params = {
            Bucket: process.env['AWS_PUBLIC_BUCKET_NAME'],
            Key: key,
            Body: file_buffer,
            ContentType: content_type,
            ACL: 'public-read', // comment if private file
        }

        return new Promise((resolve, reject) => {
            s3.upload(params as PutObjectRequest, (err: Error, data: any) => {
                if (err) {
                    reject()
                    throw new ApiError(
                        StatusCodes.UNPROCESSABLE_ENTITY,
                        `Can't upload image file`
                    )
                }
                resolve(data)
            })
        })
    }

    async deleteFileS3(key: string) {
        const s3 = this.createInstanceS3()
        const params = {
            Bucket: process.env['AWS_PUBLIC_BUCKET_NAME'],
            Key: key.replace(process.env['AWS_BASE_URL'] as string, '').trim(),
        }

        // eslint-disable-next-line
        s3.deleteObject(params as PutObjectRequest, (err, data) => {})

        return {
            is_success: true,
        }
    }

    private createInstanceS3() {
        return new S3({
            region: process.env['AWS_REGION'],
            accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
            secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
        })
    }
}

export default new MediaService()
