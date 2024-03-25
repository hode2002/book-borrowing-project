<script setup lang="ts">
import { getBookBySearchTerm } from '@/apiRequest'
import type { Author, Book, Publisher, Response } from '@/interfaces'
import { createSlug } from '@/utils'
import { onMounted, ref, watch } from 'vue'
import _ from 'lodash'
import BookCard from '@/components/BookCard.vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const authors = ref<Array<Author>>([])
const publishers = ref<Array<Publisher>>([])
const categories = ref<Array<{ name: string; slug: string }>>([])

const filterAuthors = ref<Array<string>>([])
const filterPublishers = ref<Array<string>>([])
const filterCategories = ref<Array<string>>([])

const books = ref<Array<Book> | []>([])
const filteredBooks = ref<Book[]>([])

const keyword = ref<String>(route.query['tu-khoa'] as string)

onMounted(async () => {
  await fetchBooks()
})

watch(
  () => route.query['tu-khoa'],
  async () => {
    keyword.value = route.query['tu-khoa'] as string
    await fetchBooks()
  }
)

const fetchBooks = async () => {
  const searchTerm = keyword.value
  const convertSearchTerm = createSlug(searchTerm.split(' ').join('-'))

  const fetchBooks: Response = await getBookBySearchTerm(convertSearchTerm)
  const results = fetchBooks.data as {
    is_success: boolean
    books: Array<Book>
  }

  books.value = results.books
  filteredBooks.value = results.books

  const authorFromBooks = books.value.map((book) => book.authorId)
  const publisherFromBooks = books.value.map((book) => book.publisherId)
  const categoryFromBooks = books.value.map((book) => ({
    name: book.category.name,
    slug: book.category.slug
  }))

  authors.value = authorFromBooks as Author[]
  publishers.value = publisherFromBooks as Publisher[]
  categories.value = _.uniqBy(categoryFromBooks, 'name')
}

const handleFilter = () => {
  let booksData = books.value
  let result = [] as Book[]

  if (filterAuthors.value.length > 0) {
    const bookFilteredByAuthor = booksData.filter((book) => {
      return filterAuthors.value.includes(book.authorId?.slug!)
    })
    result = [...result, ...bookFilteredByAuthor]
  }

  if (filterPublishers.value.length > 0) {
    const bookFilteredByPublisher = booksData.filter((book) => {
      return filterPublishers.value.includes(book.publisherId?.slug!)
    })

    result = [...result, ...bookFilteredByPublisher]
  }

  if (filterCategories.value.length > 0) {
    const bookFilteredByCategory = booksData.filter((book) => {
      return filterCategories.value.includes(book.category?.slug!)
    })
    result = [...result, ...bookFilteredByCategory]
  }

  if (
    !filterAuthors.value.length &&
    !filterPublishers.value.length &&
    !filterCategories.value.length
  ) {
    return (filteredBooks.value = booksData)
  }

  return (filteredBooks.value = _.uniqBy(result, 'slug'))
}

const handleClickFilter = (type: string, value: string) => {
  switch (type) {
    case 'publisher':
      if (_.includes(filterPublishers.value, value)) {
        _.remove(filterPublishers.value, (item) => item === value)
      } else {
        filterPublishers.value.push(value)
      }
      break
    case 'author':
      if (_.includes(filterAuthors.value, value)) {
        _.remove(filterAuthors.value, (item) => item === value)
      } else {
        filterAuthors.value.push(value)
      }
      break
    case 'category':
      if (_.includes(filterCategories.value, value)) {
        _.remove(filterCategories.value, (item) => item === value)
      } else {
        filterCategories.value.push(value)
      }
      break
  }
  handleFilter()
}
</script>

<template>
  <div class="container d-flex" style="min-height: 85vh">
    <div v-if="books.length" class="w-25 bg-white me-4 p-4" style="max-width: 300px">
      <div>
        <div class="block block-layered-nav">
          <p class="fw-bold text-center fs-5">Lọc theo</p>

          <div class="mb-4" v-if="publishers">
            <div class="mb-1" data-id="m_left_book_layout_filter">Nhà xuất bản</div>
            <template v-for="publisher in publishers" :key="publisher!?._id">
              <div>
                <input
                  :id="publisher._id"
                  type="checkbox"
                  @click="handleClickFilter('publisher', publisher.slug)"
                />
                <label :for="publisher._id" class="ms-1"> {{ publisher.name }} </label>
              </div>
            </template>
          </div>

          <div class="mb-4" v-if="authors">
            <div class="mb-1" data-id="m_left_book_layout_filter">Tác giả</div>
            <template v-for="author in authors" :key="author!?._id">
              <div>
                <input
                  :id="author._id"
                  type="checkbox"
                  @click="handleClickFilter('author', author.slug)"
                />
                <label :for="author._id" class="ms-1"> {{ author.name }} </label>
              </div>
            </template>
          </div>

          <div class="mb-4" v-if="categories">
            <div class="mb-1" data-id="m_left_book_layout_filter">Thể loại</div>
            <template v-for="cate in categories" :key="cate.slug">
              <div>
                <input
                  :id="cate.slug"
                  type="checkbox"
                  @click="handleClickFilter('category', cate.slug)"
                />
                <label :for="cate.slug" class="ms-1 text-capitalize"> {{ cate.name }} </label>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <div :class="books.length ? 'w-75' : 'w-100'" class="w-75 bg-white p-4">
      <template v-if="books.length">
        <div class="pb-3 mb-5 border-bottom">
          <div v-if="Object.values(route.query)[0]" class="d-flex align-items-center gap-2">
            <p class="fw-bold fs-4 m-0">Kết quả tìm kiếm:</p>
            <p class="fs-5 m-0">{{ Object.values(route.query)[0] }}</p>
          </div>
          <div
            v-if="filterPublishers.length || filterAuthors.length || filterCategories.length"
            class="d-flex gap-2"
          >
            <p class="mb-0">Lọc theo:</p>
            <template v-for="publisher in filterPublishers" :key="publisher">
              NXB:
              <span class="fw-bold">
                {{ books.find((book) => book.publisherId?.slug === publisher)?.publisherId?.name }},
              </span>
            </template>

            <template v-for="author in filterAuthors" :key="author">
              Tác giả:
              <span class="fw-bold">
                {{ books.find((book) => book.authorId?.slug === author)?.authorId?.name }},
              </span>
            </template>

            <template v-for="category in filterCategories" :key="category">
              Thể loại:
              <span class="fw-bold text-capitalize">
                {{ books.find((book) => book.category?.slug === category)?.category?.name }}
              </span>
            </template>
          </div>
        </div>

        <div class="d-flex flex-wrap gap-4 row" v-if="books.length">
          <template v-for="book in filteredBooks" :key="book._id">
            <BookCard :book="book" />
          </template>
        </div>
      </template>

      <div v-else class="d-flex flex-column justify-content-center align-items-center">
        <p class="fs-4">Không tìm thấy kết quả nào khớp với:</p>
        <p class="fw-bold fs-5">{{ Object.values(route.query)[0] }}</p>
        <RouterLink to="/" class="fw-bold text-decoration-underline">Quay lại trang chủ</RouterLink>
      </div>
    </div>
  </div>
</template>
