export interface CreateBookInterface {
    name: String
    quantity: Number
    publication_year?: Number
    publisherId: String
    authorId: String
    thumbnail?: String
    images?: Array<String>
    category?: {
        name: String
    }
}
