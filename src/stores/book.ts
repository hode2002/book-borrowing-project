import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Book } from '@/interfaces'

interface BookStore {
  books: Ref<Array<Book>>
  setBooks: (data: Array<Book>) => void
  getBooks: () => Array<Book>
  cateBooks: Ref<Array<Book>>
  setCateBooks: (cateName: string, data: Array<Book>) => void
  getCateBooks: (cateName: string) => Array<Book> | []
}

interface CateBook {
  slug: string
  books: Array<Book>
}

export const useBookStore = defineStore('book', () => {
  const books = ref<Array<Book> | []>([])
  const cateBooks = ref<Array<CateBook> | []>([])

  const setBooks = (data: Array<Book>): void => {
    books.value = data
  }

  const getBooks = (): Array<Book> => {
    return books.value
  }

  const setCateBooks = (slug: string, data: Array<Book>): void => {
    const item = { slug, books: data } as CateBook
    cateBooks.value = [...cateBooks.value, item]
  }

  const getCateBooks = (slug: string): Array<Book> | null => {
    const data = cateBooks.value as Array<CateBook>
    if (!data) return []

    const isExist = data.find((item) => item.slug === slug)
    if (!isExist) return []

    return isExist.books
  }

  return { books, setBooks, getBooks, cateBooks, setCateBooks, getCateBooks } as BookStore
})
