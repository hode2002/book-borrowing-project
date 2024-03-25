<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { convertStatus } from '@/utils'
import moment from 'moment'

const {
  book,
  selectedBook,
  showDeleteBtn = false
} = defineProps({
  book: {
    type: Object,
    required: true
  },
  selectedBook: {
    type: Object,
    required: true
  },
  changeSelectedBook: {
    type: Function,
    required: true
  },
  isShowQuantity: {
    type: Boolean
  },
  status: {
    type: String
  },
  borrowDate: {
    type: String
  },
  dueDate: {
    type: String
  },
  showDeleteBtn: {
    type: Boolean
  },
  handleDelete: {
    type: Function
  }
})
</script>

<template>
  <div
    class="card mb-3 p-2"
    style="height: 120px"
    :class="{
      'border-bottom ': book._id === selectedBook?._id,
      'opacity-80': book._id !== selectedBook?._id
    }"
    @mouseover="() => changeSelectedBook(book)"
  >
    <div class="row h-100 text-black">
      <div class="col-md-3 text-center align-content-center">
        <RouterLink :to="{ name: 'book-detail', params: { name: book.slug } }">
          <img
            :src="book.thumbnail"
            alt="Trendy Pants and Shoes"
            class="rounded-5"
            style="height: 80px"
            loading="lazy"
          />
        </RouterLink>
      </div>
      <div class="col-md-9 align-items-center">
        <div class="d-flex justify-content-between align-items-center h-100">
          <div class="overflow-hidden">
            <RouterLink
              :to="{ name: 'book-detail', params: { name: book.slug } }"
              class="row h-100 text-black"
            >
              <div class="m-0 text-truncate">{{ book.name }}</div>
            </RouterLink>
            <p class="m-0 text-truncate">Tác giả: {{ book.authorId.name }}</p>
            <p class="m-0" v-if="isShowQuantity">
              <small class="text-muted text-truncate">Số lượng còn lại: </small>
              <span class="fw-bold">{{ book.quantity }}</span>
            </p>

            <template v-if="!status">
              <p class="m-0">
                <small class="text-muted text-truncate">
                  Nhà xuất bản: {{ book.publisherId.name }}
                </small>
              </p>
            </template>

            <div class="my-1" v-if="status">
              <div class="d-flex gap-5">
                <small class="text-muted text-truncate">
                  Ngày mượn:
                  <span class="fw-semibold"> {{ moment(borrowDate).format('L') }}</span>
                </small>

                <small class="text-muted text-truncate">
                  Ngày trả: <span class="fw-semibold"> {{ moment(dueDate).format('L') }}</span>
                </small>

                <small class="text-muted text-truncate">
                  Trạng thái: <span class="fw-semibold"> {{ convertStatus(status) }}</span>
                </small>
              </div>
            </div>
          </div>
          <button v-if="showDeleteBtn" class="btn me-2 p-1" @click="handleDelete!(book)">
            <i class="fa-regular fa-trash-can fs-5"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.border-bottom {
  border-bottom: 1px solid black !important;
}

.skeleton {
  background-color: #f0f0f0;
  border-radius: 5px;
  padding: 20px;
}

.skeleton-item-image {
  height: 200px;
  margin-bottom: 10px;
  background-color: #ddd;
  border-radius: 3px;
}

.skeleton-item {
  height: 20px;
  margin-bottom: 10px;
  background-color: #ddd;
  border-radius: 3px;
}
</style>
