import BookDetail from '@/views/BookDetail.vue'
import SearchView from '@/views/SearchView.vue'
import { type RouteRecordRaw } from 'vue-router'

export const BookRoutes: RouteRecordRaw[] = [
  { path: '/sach/:name', name: 'book-detail', component: BookDetail, props: true },
  { path: '/tac-gia/:name', name: 'author', component: SearchView, props: true },
  { path: '/tim-kiem', name: 'search', component: SearchView, props: true }
]
