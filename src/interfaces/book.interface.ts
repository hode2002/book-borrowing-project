import type { Author } from './author.interface'
import type { Publisher } from './publisher.interface'

export interface Book {
  _id: string
  name: string
  publication_year?: number
  publisherId?: Publisher
  authorId?: Author
  thumbnail: string
  description?: string
  images?: Array<string>
  other_info?: Array<Object>
  category: {
    name: string
    slug: string
  }
  quantity?: number
  slug: string
}
