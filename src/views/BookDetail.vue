<script setup lang="ts">
import { getBookByName, getBookByAuthorId } from '@/apiRequest'
import type { Book, Response } from '@/interfaces'
import { translate } from '@/utils'
import { MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBCardImg } from 'mdb-vue-ui-kit'
import { onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'

const { name } = defineProps({
  name: {
    type: String,
    required: true
  }
})

watch(
  () => name,
  async () => {
    bookName.value = name
    isDisableBtn.value = false
    await fetchBooks()
  }
)

const toast = useToast()

const bookName = ref<string>(name)

const book = ref<Book | null>(null)
const authorBooks = ref<Array<Book> | null>(null)

const isDisableBtn = ref<boolean>(false)

onMounted(async () => {
  await fetchBooks()
})

const fetchBooks = async () => {
  const response: Response = await getBookByName(name)
  if (response?.code !== 200) {
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }
  const result = response.data as { is_success: boolean; book: Book }
  book.value = result.book

  await fetchBooksAuthorId(book.value?.authorId?._id as string)
}

const fetchBooksAuthorId = async (authorId: string) => {
  const response: Response = await getBookByAuthorId(authorId)
  if (response?.code !== 200) {
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }
  const result = response.data as { is_success: boolean; books: Array<Book> }
  authorBooks.value = result.books
}

const handleBorrowing = () => {
  let listOfBooksToBorrow = window.localStorage.getItem('listOfBooksToBorrow')
    ? (JSON.parse(window.localStorage.getItem('listOfBooksToBorrow') as string) as Book[])
    : ([] as Book[])

  if (listOfBooksToBorrow.find((item) => item._id === book.value?._id)) {
    isDisableBtn.value = true
    return toast.error('Đã có trong danh sách mượn', {
      timeout: 2000
    })
  }

  listOfBooksToBorrow.push(book.value as Book)
  window.localStorage.setItem('listOfBooksToBorrow', JSON.stringify(listOfBooksToBorrow))

  return toast.success('Thêm thành công', {
    timeout: 2000
  })
}
</script>

<template>
  <main class="container" style="min-height: 100vh">
    <div class="d-flex bg-white p-5">
      <div class="d-flex" style="width: 45%">
        <div class="text-center">
          <template v-for="image in book?.images" :key="image">
            <img class="mb-1" width="70%" :src="image" :alt="book?.name" />
          </template>
        </div>
        <img class="mb-1" width="80%" :src="book?.thumbnail" :alt="book?.name" />
      </div>
      <div style="width: 55%">
        <p class="mb-2 fs-2 fw-bold text-capitalize">{{ book?.name }}</p>
        <div class="fs-6">
          <p class="my-2">
            Nhà xuất bản:
            <span class="fw-semibold text-capitalize">{{ book?.publisherId?.name }}</span>
          </p>
          <p class="my-2">
            Năm xuất bản:
            <span class="fw-semibold text-capitalize">{{ book?.publication_year }}</span>
          </p>
          <div class="d-flex gap-5">
            <div>
              <p class="my-2">
                Tác giả: <span class="fw-semibold text-capitalize">{{ book?.authorId?.name }}</span>
              </p>
              <p class="my-2">
                Thể loại: <span class="fw-semibold text-capitalize">{{ book?.category.name }}</span>
              </p>
            </div>
            <div>
              <p class="my-2">
                Hình thức bìa: <span class="fw-semibold text-capitalize">Bìa Mềm</span>
              </p>
              <p class="my-2">
                Số lượng còn lại:
                <span class="fw-semibold text-capitalize">{{ book?.quantity }}</span>
              </p>
            </div>
          </div>
        </div>

        <div class="text-center" style="margin-top: 25%">
          <button
            type="button"
            @click="handleBorrowing"
            class="btn bg-black text-white"
            :disabled="isDisableBtn"
          >
            Thêm vào danh sách
          </button>
        </div>
      </div>
    </div>

    <div class="bg-white pb-4">
      <p class="fw-bold fs-4 p-4 mb-4 border-bottom">Mô tả</p>
      <p class="p-4">{{ book?.description }}</p>
    </div>

    <div class="bg-white my-5" v-if="authorBooks">
      <p class="fw-bold fs-4 p-4 mb-4 border-bottom">Sản phẩm cùng tác giả</p>
      <div class="d-flex gap-4 flex-wrap">
        <template v-for="book in authorBooks" :key="book._id">
          <MDBCard style="width: 23%">
            <RouterLink to="/"></RouterLink>
            <MDBCardImg top :src="book.thumbnail" :alt="book.name" />
            <MDBCardBody>
              <MDBCardTitle>{{ book.name }}</MDBCardTitle>
              <MDBCardText>{{ book.authorId?.name }}</MDBCardText>
              <MDBCardText class="text-body-tertiary text-truncate">
                Số lượng còn: {{ book.quantity }}
              </MDBCardText>
            </MDBCardBody>
          </MDBCard>
        </template>
      </div>
    </div>
  </main>
</template>
<style scoped>
.btn:hover {
  opacity: 0.8;
}
</style>
