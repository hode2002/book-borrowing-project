import type { Book } from './book.interface'
import type { UserProfile } from './user-profile.interface'

export interface TrackingInfo {
  _id: string
  userId: UserProfile
  bookId: Book
  quantity: number
  borrowDate: string
  dueDate: string
  status: string
}
