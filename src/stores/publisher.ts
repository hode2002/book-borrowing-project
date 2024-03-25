import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Book, Publisher } from '@/interfaces'

interface PublisherStore {
  publishers: Ref<Array<Publisher>>
  setPublishers: (data: Array<Publisher>) => void
  getPublishers: () => Array<Publisher>

  books: Ref<Array<BookPublisher>>
  setBooks: (publisherId: string, data: Array<Book>) => void
  getBooks: (publisherId: string) => Array<Book> | []
}

interface BookPublisher {
  publisherId: string
  books: Array<Book>
}

export const usePublisherStore = defineStore('publisher', () => {
  const publishers = ref<Array<Publisher> | []>([])
  const books = ref<Array<BookPublisher> | []>([])

  const setPublishers = (data: Array<Publisher>): void => {
    publishers.value = data
  }

  const getPublishers = (): Array<Publisher> => {
    return publishers.value
  }

  const setBooks = (publisherId: string, data: Array<Book>): void => {
    const item = { publisherId, books: data } as BookPublisher
    books.value = [...books.value, item]
  }

  const getBooks = (publisherId: string): Array<Book> | null => {
    const data = books.value as Array<BookPublisher>
    if (!data) return []

    const isExist = data.find((item) => item.publisherId === publisherId)
    if (!isExist) return []

    return isExist.books
  }

  return {
    publishers,
    setPublishers,
    getPublishers,
    books,
    setBooks,
    getBooks
  } as PublisherStore
})
