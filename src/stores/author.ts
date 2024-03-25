import { ref, type Ref } from 'vue'
import { defineStore } from 'pinia'
import type { Author } from '@/interfaces'

interface AuthorStore {
  authors: Ref<Array<Author>>
  setAuthors: (data: Array<Author>) => void
  getAuthors: () => Array<Author>
}

export const useAuthorStore = defineStore('author', () => {
  const authors = ref<Array<Author> | []>([])

  const setAuthors = (data: Array<Author>): void => {
    authors.value = data
  }

  const getAuthors = (): Array<Author> => {
    return authors.value
  }

  return { authors, setAuthors, getAuthors } as AuthorStore
})
