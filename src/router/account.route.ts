import type { NavigationGuardNext, RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

import SigninView from '@/views/SigninView.vue'
import SignupView from '@/views/SignupView.vue'
import ProfileView from '@/views/ProfileView.vue'
import { useUserStore } from './../stores/user'
import { useToast } from 'vue-toastification'

const checkAuthMiddleware = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const userStore = useUserStore()

  if (userStore.getToken()) {
    return next()
  }
  const toast = useToast()
  toast.success('Vui lòng đăng nhập để tiếp tục', {
    timeout: 2000
  })
  return next('/dang-nhap')
}

export const AccountRoutes: RouteRecordRaw[] = [
  { path: '', name: 'login', component: SigninView },
  { path: '/dang-ky', name: 'signup', component: SignupView },
  {
    path: '/dang-xuat',
    name: 'logout',
    redirect: '/dang-nhap'
  },
  {
    path: '/tai-khoan',
    name: 'profile',
    component: ProfileView,
    beforeEnter: checkAuthMiddleware
  },
  {
    path: '/tai-khoan/lich-su-muon-sach',
    name: 'history',
    component: ProfileView,
    beforeEnter: checkAuthMiddleware
  },
  {
    path: '/tai-khoan/doi-mat-khau',
    name: 'change-password',
    component: ProfileView,
    beforeEnter: checkAuthMiddleware
  },
  {
    path: '/tai-khoan/dia-chi',
    name: 'change-address',
    component: ProfileView,
    beforeEnter: checkAuthMiddleware
  }
]
