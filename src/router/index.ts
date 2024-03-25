import { createRouter, createWebHistory } from 'vue-router'
import { BookRoutes } from './book.route'
import HomeView from '@/views/HomeView.vue'
import { AccountRoutes } from './account.route'
import NotFound from '@/components/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/sach',
      name: 'book',
      children: BookRoutes
    },
    {
      path: '/dang-nhap',
      name: 'login',
      children: AccountRoutes
    },
    {
      path: '/:catchAll(.*)',
      component: NotFound
    }
  ]
})

export default router
