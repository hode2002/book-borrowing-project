export interface CreateBookBorrowing {
    userId: string
    bookId: string
    quantity: number
    borrowDate: Date
    dueDate: Date
}
