export interface UpdateBookInterface {
    name?: String
    quantity?: Number
    publication_year?: Number
    publisherId?: String
    authorId?: String
    thumbnail?: String
    category?: {
        name: string
    }
}
