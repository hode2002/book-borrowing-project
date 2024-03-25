<script setup lang="ts">
import CateBookCard from '@/components/CateBookCard.vue'

import { useBookStore } from '../stores'
import { getBookByCate } from '@/apiRequest'
import { useToast } from 'vue-toastification'
import { onMounted, ref, type Ref } from 'vue'
import type { Book, Response } from '@/interfaces'
import SkeletonCard from './SkeletonCard.vue'
import { RouterLink } from 'vue-router'
import { translate } from '@/utils'

const toast = useToast()

const bookStore = useBookStore()
const cateBooks: Ref<Book[]> = ref([])
const categories = ref<Array<{ name: string; slug: string }>>([
  { name: 'Văn học', slug: 'van-hoc' },
  { name: 'Kinh tế', slug: 'kinh-te' },
  { name: 'Tâm lý', slug: 'tam-ly' },
  { name: 'Thiếu nhi', slug: 'thieu-nhi' },
  { name: 'Sách học ngoại ngữ', slug: 'sach-hoc-ngoai-ngu' },
  { name: 'Thể loại khác', slug: 'other' }
])

onMounted(async () => {
  await fetchBookByCate(categories.value[0].slug)
  selectedCate.value = categories.value[0].slug
  selectedBook.value = cateBooks.value[0]
})

const fetchBookByCate = async (slug: string) => {
  if (slug === 'other') {
    return alert('Đang phát triển')
  }

  selectedCate.value = slug

  const result = bookStore.getCateBooks(slug)
  if (result.length > 0) {
    selectedBook.value = bookStore.getCateBooks(selectedCate.value)[0]
    return (cateBooks.value = result)
  }

  const response: Response = await getBookByCate(slug)
  if (response?.code !== 200) {
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }
  const data = response.data as { is_success: boolean; books: Array<Book> }

  bookStore.setCateBooks(slug, data.books)
  selectedBook.value = bookStore.getCateBooks(selectedCate.value)[0]
  cateBooks.value = data.books
}

const selectedCate = ref<string>(categories.value[0].slug)
const selectedBook = ref<Book>(bookStore.getCateBooks(selectedCate.value)[0])

const changeSelectedBook = (book: Book) => {
  selectedBook.value = book
}
</script>

<template>
  <div style="margin-top: 10%; min-height: 565px" class="block-vote bg-white">
    <div
      style="
        background-image: url(https://cdn0.fahasa.com/media/wysiwyg/Thang-6-2020/banner_vote_06_2020.png);
      "
      class="p-3"
    >
      <div class="text-white fw-bold">THỂ LOẠI</div>
    </div>
    <div class="d-flex justify-content-between p-3" style="border-bottom: 1px solid #ccc">
      <template v-for="cate in categories" :key="cate.slug">
        <p
          @click="fetchBookByCate(cate.slug)"
          class="cat-item"
          :class="{ active: selectedCate === cate.slug }"
        >
          {{ cate.name }}
        </p>
      </template>
    </div>
    <div class="d-flex">
      <div style="width: 30%; padding-right: 10px; border-right: 1px solid #ccc">
        <template v-if="cateBooks.length > 0">
          <template v-for="cateBook in cateBooks" :key="String(cateBook._id)">
            <CateBookCard
              :changeSelectedBook="changeSelectedBook"
              :selectedBook="selectedBook"
              :book="cateBook"
            />
          </template>
        </template>
        <template v-else>
          <SkeletonCard :direction="'horizontal'" />
          <SkeletonCard :direction="'horizontal'" />
          <SkeletonCard :direction="'horizontal'" />
          <SkeletonCard :direction="'horizontal'" />
        </template>
      </div>

      <div style="width: 70%" class="p-2 bg-white">
        <div v-if="selectedBook" class="d-flex">
          <div style="width: 40%" class="text-center">
            <img
              :src="selectedBook?.thumbnail"
              style="max-height: 400px"
              class="rounded-5"
              loading="lazy"
              alt=""
            />
          </div>
          <div style="width: 60%" class="px-4 overflow-hidden">
            <p class="fw-bold text-uppercase text-wrap fs-5">{{ selectedBook?.name }}</p>
            <p>
              Tác giả: <span class="fw-bold">{{ selectedBook?.authorId?.name }}</span>
            </p>
            <p>
              Năm xuất bản: <span class="fw-bold">{{ selectedBook?.publication_year }}</span>
            </p>
            <p>
              Nhà xuất bản: <span class="fw-bold">{{ selectedBook?.publisherId?.name }}</span>
            </p>
            <p>
              Thể loại:
              <span class="fw-bold text-capitalize">{{ selectedBook?.category?.name }}</span>
            </p>
            <p class="text-truncate">{{ selectedBook?.description }}</p>
          </div>
        </div>

        <div v-else class="d-flex">
          <SkeletonCard :width="40" />
          <div style="width: 60%" class="px-4 overflow-hidden">
            <SkeletonCard :width="60" :noImage="true" :direction="'horizontal'" />
            <SkeletonCard :width="60" :noImage="true" :direction="'horizontal'" />
            <SkeletonCard :width="60" :noImage="true" :direction="'horizontal'" />
            <SkeletonCard :width="60" :noImage="true" :direction="'horizontal'" />
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedBook" class="text-center">
      <RouterLink v-if="selectedCate" to="#" class="btn my-5 bg-dark text-white">
        Xem thêm
      </RouterLink>
    </div>
  </div>
</template>
<style scoped>
.cat-item {
  opacity: 0.8;
  margin-bottom: 0;
  font-weight: bold;
}

.cat-item.active {
  color: #c92127 !important;
  opacity: 1;
  border: none !important;
  border-bottom: 2px solid #c92127 !important;
  border-radius: 0px !important;
}

.cat-item:hover {
  cursor: pointer;
}
</style>
