<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'

import type { Book, Publisher, Response } from '@/interfaces'
import BookCard from '@/components/BookCard.vue'
import SkeletonCard from '@/components/SkeletonCard.vue'
import { usePublisherStore } from '../stores'
import { getPublishers, getBookByPublisher } from '@/apiRequest'
import { useToast } from 'vue-toastification'
import type { RouterLink } from 'vue-router'
import { translate } from '@/utils'

const toast = useToast()

const publisherStore = usePublisherStore()

const books: Ref<Book[]> = ref([])
const publishers: Ref<Publisher[]> = ref([])

onMounted(async () => {
  const fetchPublishers: Response = await getPublishers()
  const publishersData = fetchPublishers.data as {
    is_success: boolean
    publishers: Array<Publisher>
  }
  publisherStore.setPublishers(publishersData.publishers)
  publishers.value = publishersData.publishers
  await fetchBookByPublisher(publishersData.publishers[0]._id)
  selectedPublisher.value = publishers?.value[0]
})

const fetchBookByPublisher = async (id: string) => {
  const result = publisherStore.getBooks(id)
  if (result.length > 0) {
    selectedPublisher.value = result[0]?.publisherId!
    return (books.value = result)
  }

  const response: Response = await getBookByPublisher(id)
  if (response?.code !== 200) {
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }
  const data = response.data as { is_success: boolean; books: Array<Book> }

  publisherStore.setBooks(id, data.books)
  selectedPublisher.value = data.books[0]?.publisherId!
  books.value = data.books
}

const selectedPublisher = ref<Publisher>(publishers?.value[0])
</script>

<template>
  <div style="margin-top: 10%; min-height: 565px" class="block-vote bg-white shadow-sm">
    <div
      style="
        background-image: url(https://cdn0.fahasa.com/media/wysiwyg/Thang-6-2020/banner_vote_06_2020.png);
      "
      class="p-3"
    >
      <div class="text-white fw-bold">NHÀ XUẤT BẢN</div>
    </div>
    <div class="d-flex justify-content-lg-around p-3" style="border-bottom: 1px solid #ccc">
      <template v-for="publisher in publishers" :key="String(publisher._id)">
        <p
          @click="fetchBookByPublisher(publisher._id)"
          class="cat-item"
          :class="{ active: selectedPublisher?.slug === publisher.slug }"
        >
          {{ publisher.name }}
        </p>
      </template>
    </div>

    <div>
      <div v-if="books.length" class="d-flex flex-wrap justify-content-between">
        <template v-for="book in books" :key="String(book._id)">
          <BookCard :book="book" />
        </template>
      </div>

      <div v-else class="d-flex flex-wrap justify-content-between">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>

      <div class="text-center">
        <RouterLink v-if="selectedPublisher" to="#" class="btn my-5 bg-dark text-white">
          Xem thêm
        </RouterLink>
      </div>
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
