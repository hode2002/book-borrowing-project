<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { borrowBook, getBorrowedBooks } from '@/apiRequest'
import type { Book, Response, TrackingInfo } from '@/interfaces'
import { useUserStore } from '@/stores'
import CateBookCard from './CateBookCard.vue'
import _ from 'lodash'
import moment from 'moment'
import { translate } from '@/utils'

const toast = useToast()
const userStore = useUserStore()
const currentView = ref<string>('confirmation')
const modalShow = ref<boolean>(false)

onMounted(async () => {
  listOfBooksToBorrow.value = JSON.parse(
    window.localStorage.getItem('listOfBooksToBorrow') as string
  ) as Book[]

  await fetchBorrowedBooks()
})

const listOfBooksToBorrow = ref<Book[]>([])
const listOfBorrowedBooks = ref<TrackingInfo[]>([])

const dueDate = ref<number>(1)

const selectedBook = ref<Book>()
const changeSelectedBook = (book: Book, borrowDate: string) => {
  const item = listOfBorrowedBooks.value.find((item) =>
    moment(item.borrowDate).isSame(borrowDate, 'millisecond')
  )
  return (selectedBook.value = item?.bookId)
}

const handleBorrow = async () => {
  const token = userStore.getToken() as string
  let isError = false
  const listBorrowedSuccess = [] as Book[]

  for (const book of listOfBooksToBorrow.value) {
    const response: Response = await borrowBook(token, book, dueDate.value)
    if (response?.code !== 201) {
      isError = true
      toast.error(translate(response.message)!, {
        timeout: 2000
      })
      break
    }
    listBorrowedSuccess.push(book)
  }

  _.remove(listOfBooksToBorrow.value, (item) =>
    listBorrowedSuccess.find((book) => book._id === item._id)
  )
  if (isError) return

  toast.success('Đăng ký mượn thành công', {
    timeout: 2000
  })

  modalShow.value = false
  setTimeout(async () => await fetchBorrowedBooks(), 500)
  return window.localStorage.removeItem('listOfBooksToBorrow')
}

const fetchBorrowedBooks = async () => {
  const token = userStore.getToken() as string

  const response: Response = await getBorrowedBooks(token)
  if (response?.code !== 200) {
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }

  const result = response.data as TrackingInfo[]
  listOfBorrowedBooks.value = result
}

const handleDelete = (book: Book) => {
  _.remove(listOfBooksToBorrow.value, (item) => item._id === book._id)
  listOfBooksToBorrow.value = []
  window.localStorage.setItem('listOfBooksToBorrow', JSON.stringify(listOfBooksToBorrow.value))
  return toast.success('Xóa khỏi danh sách thành công', {
    timeout: 2000
  })
}
</script>

<template>
  <div class="d-flex">
    <p
      @mouseover="currentView = 'confirmation'"
      :class="{ active: currentView === 'confirmation' }"
      class="fs-4 fw-bold w-50 opacity-80 text-center mb-0 cursor-pointer"
    >
      Danh sách
    </p>
    <p
      @mouseover="currentView = 'history'"
      :class="{ active: currentView === 'history' }"
      class="fs-4 fw-bold opacity-80 w-50 text-center mb-0 cursor-pointer"
    >
      Lịch sử
    </p>
  </div>

  <template v-if="currentView === 'confirmation'">
    <div
      class="p-4"
      style="height: 90%; background-color: #f8f8f8"
      v-if="listOfBooksToBorrow?.length"
    >
      <div>
        <template v-for="book in listOfBooksToBorrow" :key="book._id">
          <CateBookCard
            :changeSelectedBook="changeSelectedBook"
            :selectedBook="selectedBook!"
            :book="book!"
            :isShowQuantity="true"
            :handleDelete="handleDelete"
            :showDeleteBtn="true"
          />
        </template>
      </div>
      <div class="text-center mt-5">
        <button v-b-modal.modal-confirm class="btn text-white bg-black">Xác nhận</button>
      </div>
    </div>

    <div
      class="p-4 d-flex justify-content-center align-items-center"
      style="height: 90%; background-color: #f8f8f8"
      v-else
    >
      <p class="fw-bold">Danh sách trống</p>
    </div>

    <!-- Modal -->
    <b-modal v-model="modalShow" id="modal-confirm" centered hide-footer title="Đăng ký mượn sách">
      <div class="d-flex justify-content-center align-items-center gap-4">
        <p class="m-0">Số ngày mượn:</p>
        <input
          type="text"
          class="from-control w-50 px-2 py-1"
          autocomplete="off"
          v-model="dueDate"
        />
      </div>
      <div class="text-end">
        <button @click="handleBorrow" class="btn mt-4 bg-black text-white">Xác nhận</button>
      </div>
    </b-modal>
    <!-- Modal -->
  </template>
  <!-- History of borrowing books -->
  <template v-else>
    <div
      class="p-4"
      style="height: 90%; background-color: #f8f8f8"
      v-if="listOfBorrowedBooks?.length"
    >
      <div>
        <template v-for="item in listOfBorrowedBooks" :key="item._id">
          <CateBookCard
            :changeSelectedBook="changeSelectedBook"
            :selectedBook="selectedBook!"
            :book="item.bookId!"
            :status="item.status"
            :dueDate="item.dueDate"
            :borrowDate="item.borrowDate"
          />
        </template>
      </div>
    </div>

    <div
      class="p-4 d-flex justify-content-center align-items-center"
      style="height: 90%; background-color: #f8f8f8"
      v-else
    >
      <p class="fw-bold">Danh sách trống</p>
    </div>
  </template>
  <!-- History of borrowing books -->
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.btn:hover {
  opacity: 0.8;
}

.mt-70 {
  margin-top: 70px !important;
}

.mb-50 {
  margin-bottom: 50px !important;
}

.active {
  opacity: 1 !important;
  background-color: #f8f8f8;
  border-top: 1px solid #e0e0e0;
  border-left: 1px solid #e0e0e0;
  border-right: 1px solid #e0e0e0;
}
</style>
