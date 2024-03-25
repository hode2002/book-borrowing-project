<script setup lang="ts">
import { onMounted, ref, type Ref } from 'vue'

import CateBook from '@/components/CateBook.vue'
import CarouselComponent from '@/components/CarouselComponent.vue'
import type { Book } from '@/interfaces'
import { useBookStore } from '../stores'
import BookPublisher from '@/components/BookPublisher.vue'

const bookStore = useBookStore()

const books: Ref<Book[]> = ref([])

onMounted(() => {
  books.value = bookStore.getBooks()
})
</script>

<template>
  <div class="container" style="background-color: #f0f0f0">
    <CarouselComponent />
    <CateBook />
    <BookPublisher />
  </div>
</template>
