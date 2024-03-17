export interface CreateBookInterface {
    name: String
    price: Number
    quantity: Number
    publication_year?: Number
    publisherId: String
    authorId: String
    thumbnail?: String
    images?: Array<String>
}