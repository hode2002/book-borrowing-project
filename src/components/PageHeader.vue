<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'

import SearchHistoryItem from './SearchHistoryItem.vue'
import CateCard from './CateCard.vue'
import { getAuthors, getBooks, logout } from '@/apiRequest'
import { useUserStore, useBookStore, useAuthorStore } from '../stores'
import type { Book, Response, Author } from '@/interfaces'
import { translate } from '@/utils'

const toast = useToast()

const searchTerm = ref<string>('')
const isShowMenu = ref<boolean>(false)
const displayContent = ref<String>('book')
const isShowSearchHistory = ref<boolean>(false)
const isShowLoginMethod = ref<boolean>(false)

const router = useRouter()

const userStore = useUserStore()
const bookStore = useBookStore()
const authorStore = useAuthorStore()

const books = ref<Array<Book>>([])
const authors = ref<Array<Author>>([])

onMounted(async () => {
  const fetchBooks: Response = await getBooks()
  const booksData = fetchBooks.data as { is_success: boolean; books: Array<Book> }
  bookStore.setBooks(booksData.books)
  books.value = bookStore.getBooks()

  const fetchAuthors: Response = await getAuthors()
  const authorsData = fetchAuthors.data as { is_success: boolean; authors: Array<Author> }
  authorStore.setAuthors(authorsData.authors)
  authors.value = authorStore.getAuthors()

  searchHistory.value = books.value.map((book) => ({ text: book.name }))
})

const handleSubmit = () => {
  if (!searchTerm.value) {
    return
  }

  router.push('/tim-kiem?tu-khoa=' + searchTerm.value.split(' ').join('+'))
}

const handleShowMenu = () => {
  if (isShowSearchHistory.value) {
    isShowSearchHistory.value = false
  }
  isShowMenu.value = !isShowMenu.value
}

const handleShowSearchHistory = () => {
  if (isShowMenu.value) {
    isShowMenu.value = false
  }
  isShowSearchHistory.value = !isShowSearchHistory.value
}

const handleShowUserProfile = (value = !isShowLoginMethod.value) => {
  if (isShowSearchHistory.value) {
    isShowSearchHistory.value = false
  }
  isShowLoginMethod.value = value
}

const handleLogout = async () => {
  const response: Response = await logout(userStore.getToken()!)

  if (response?.code !== 200) {
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }

  window.localStorage.removeItem('refreshToken')
  userStore.removeToken()
  return toast.success(translate(response.message)!, {
    timeout: 2000
  })
}

const searchHistory = ref<Array<{ text: string }>>([])

const filteredSearchHistory = computed(() => {
  const newValue = searchTerm.value.toLowerCase()
  if (newValue === '') {
    return searchHistory.value
  }

  const filtered = searchHistory.value.filter((item) =>
    item.text.toLowerCase().startsWith(newValue)
  )
  if (filtered.length <= 3) {
    filtered.push({ text: 'test' })
  }

  return filtered
})
</script>

<template>
  <header class="border-bottom">
    <div class="d-flex justify-content-center" style="background-color: #6fd4a8">
      <img
        class="container"
        src="https://cdn0.fahasa.com/media/wysiwyg/Thang-03-2024/NCCTanViet_T323_BannerHeader_1263x60.jpg"
        loading="lazy"
      />
    </div>
    <div class="container">
      <div class="position-relative">
        <b-navbar>
          <b-navbar-brand style="width: 10%" href="#">
            <RouterLink
              to="/"
              class="fw-bold px-4 fs-4 text-decoration-none"
              style="color: #c92127"
            >
              BookStore
            </RouterLink>
          </b-navbar-brand>

          <b-collapse id="nav-collapse" class="justify-content-lg-around" is-nav>
            <b-navbar-nav style="width: 15%" class="d-flex justify-content-center">
              <b-nav-item href="#">
                <div v-if="!isShowMenu">
                  <i @mouseover="handleShowMenu" class="fa-solid fa-bars fs-3"> </i>
                </div>
                <div v-else><i class="fa-solid fa-xmark fa-rotate-90 fs-3"></i></div>
              </b-nav-item>
            </b-navbar-nav>

            <b-navbar-nav
              class="d-block position-relative"
              style="width: 70%"
              @click="(e: Event) => e.stopPropagation()"
            >
              <div class="w-100 d-flex">
                <input
                  v-model="searchTerm"
                  @click="handleShowSearchHistory"
                  class="form-control w-75 shadow-none"
                  type="text"
                  placeholder="Bạn cần tìm gì..."
                  style="outline: none"
                  autocomplete="off"
                />

                <b-button @click="handleSubmit" class="w-25" style="background-color: #c92127">
                  <i class="fa-solid fa-magnifying-glass text-white"></i>
                </b-button>
              </div>

              <div
                class="HS-box w-75 bg-white position-absolute shadow-lg"
                style="z-index: 100"
                :class="{
                  'd-none': !isShowSearchHistory,
                  'd-block': isShowSearchHistory
                }"
                @mouseleave="handleShowSearchHistory"
              >
                <template v-for="item in filteredSearchHistory" :key="item.text">
                  <SearchHistoryItem
                    :searchItem="item"
                    :handleShowSearchHistory="handleShowSearchHistory"
                  />
                </template>
              </div>
            </b-navbar-nav>

            <b-navbar-nav class="p-1">
              <b-nav-form class="user-account text-center position-relative">
                <template v-if="!userStore.getToken()">
                  <RouterLink to="/dang-nhap" class="text-decoration-none text-black">
                    <p class="m-0 d-flex flex-column p-1">
                      <i
                        class="fa-regular fa-user"
                        style="font-size: larger"
                        @mouseover="handleShowUserProfile(true)"
                      ></i>
                      <span @mouseover="handleShowUserProfile(true)">Tài khoản</span>
                    </p>
                  </RouterLink>
                </template>
                <template v-else>
                  <RouterLink to="/tai-khoan" class="text-decoration-none text-black">
                    <div class="d-flex align-items-center flex-column">
                      <img
                        width="40px"
                        :src="userStore.getProfile().avatar"
                        @mouseover="handleShowUserProfile(true)"
                        alt=""
                      />
                      <p
                        @mouseover="handleShowUserProfile(true)"
                        class="mt-1 mb-0 text-truncate text-center"
                        style="width: 50%"
                      >
                        {{ userStore.getProfile()?.email }}
                      </p>
                    </div>
                  </RouterLink>
                </template>
              </b-nav-form>
              <div
                class="login-method-box position-absolute top-0 bg-white rounded-3"
                style="margin-top: 5%; width: 200px; right: 0"
                v-if="isShowLoginMethod"
                @mouseover="(e: Event) => e.stopPropagation()"
                @mouseleave="handleShowUserProfile()"
              >
                <template v-if="userStore.getToken()">
                  <RouterLink to="/tai-khoan" class="text-decoration-none">
                    <div class="login-method-item p-2 text-center">Thông tin tài khoản</div>
                  </RouterLink>
                  <RouterLink to="/dang-xuat" class="text-decoration-none">
                    <div class="login-method-item p-2 text-center" @click="handleLogout">
                      Đăng xuất
                    </div>
                  </RouterLink>
                </template>

                <template v-else>
                  <RouterLink to="/dang-nhap" class="text-decoration-none">
                    <div class="login-method-item p-2 text-center">Đăng nhập</div>
                  </RouterLink>
                  <RouterLink to="/dang-ky" class="text-decoration-none">
                    <div class="login-method-item p-2 text-center">Đăng ký</div>
                  </RouterLink>
                </template>

                <!-- <RouterLink to="/facebook" class="text-decoration-none">
                  <div class="login-method-item p-2 text-center">Facebook</div>
                  <div
                    class="fb-login-button"
                    data-width=""
                    data-size=""
                    data-button-type=""
                    data-layout=""
                    data-auto-logout-link="false"
                    data-use-continue-as="false"
                  ></div>
                </RouterLink>
                <RouterLink to="/google" class="text-decoration-none">
                  <div class="login-method-item p-2 text-center">Google</div>
                </RouterLink> -->
              </div>
            </b-navbar-nav>
          </b-collapse>
        </b-navbar>

        <div
          :class="{ 'd-block': isShowMenu, 'd-none': !isShowMenu }"
          class="position-absolute w-100 d-flex bg-white rounded-bottom-2 shadow-lg"
          style="height: 80vh; z-index: 100"
          @click="(e: Event) => e.stopPropagation()"
          @mouseleave="handleShowMenu"
        >
          <!-- Category -->
          <div class="w-25 border-end px-2">
            <p class="fw-bold px-4 pt-3 fs-4" style="color: #7a7e7f">Danh mục</p>
            <div
              :class="{ active: displayContent === 'book' }"
              @mouseover="displayContent = 'book'"
              class="cate-item px-4 py-3 fw-bold"
            >
              Sách
            </div>
            <div
              :class="{ active: displayContent === 'author' }"
              class="cate-item px-4 py-3 fw-bold"
              @mouseover="displayContent = 'author'"
            >
              Tác giả
            </div>
          </div>
          <!-- Category -->

          <!-- Content -->
          <div v-if="displayContent === 'book'" class="book w-75 px-2">
            <div>
              <p class="fw-bold px-4 pt-3 fs-4" style="color: #7a7e7f">Sách</p>
              <div class="d-flex text-center justify-content-around flex-wrap">
                <template v-for="book in books" :key="book._id">
                  <CateCard :item="book" :handleShowMenu="handleShowMenu" />
                </template>
              </div>
            </div>
          </div>

          <div v-else class="author w-75 px-2">
            <div>
              <p class="fw-bold px-4 pt-3 fs-4" style="color: #7a7e7f">Tác giả</p>
              <div class="d-flex text-center justify-content-around flex-wrap">
                <template v-for="author in authors" :key="author._id">
                  <CateCard :item="author" :isAuthor="true" :handleShowMenu="handleShowMenu" />
                </template>
              </div>
            </div>
          </div>
          <!-- Content -->
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  box-shadow: none !important;
}

.cate-item.active {
  background-color: #000;
  border-radius: 10px;
  color: white !important;
}

.login-method-box {
  box-shadow:
    rgba(0, 0, 0, 0.15) 0px 15px 25px,
    rgba(0, 0, 0, 0.05) 0px 5px 10px;
}

.cate-item:hover,
.login-method-item:hover {
  background-color: #000;
  cursor: pointer;
  border-radius: 10px;
  color: white !important;
}

.login-method-item {
  color: black !important;
}

.user-account:hover {
  cursor: pointer;
}

.container {
  padding: 0;
}
</style>
./SearchHistoryItem.vue
