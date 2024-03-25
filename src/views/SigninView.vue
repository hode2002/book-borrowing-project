<script setup lang="ts">
import { MDBBtn, MDBIcon } from 'mdb-vue-ui-kit'
import { onMounted, onUpdated, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'
import { translate } from '@/utils'

import { type UserProfile } from '@/interfaces'
import { signin } from '@/apiRequest'
import { useUserStore } from '../stores'

import ForgotPassword from '@/components/ForgotPassword.vue'
import VerifyOtp from '@/components/VerifyOtp.vue'
import CreatePassword from '@/components/CreatePassword.vue'

import type { Response } from '@/interfaces'
import router from '@/router'

const isDisableBtn = ref<boolean>(true)
const toast = useToast()

const currentForm = ref<string>('signin')

const email = ref<string>('')
const errorMsg = ref<string>('Email không chính xác')
const isValidEmail = ref<boolean>(false)

const password = ref<string>('')
const isValidPassword = ref<boolean>(false)
const passwordErrorMsg = ref<string>(
  'Mật khẩu phải chứa một chữ số từ 1 đến 9, một chữ cái viết thường, một chữ cái viết hoa và phải dài 6 ký tự.'
)
const isShowPassword = ref<boolean>(false)

const userStore = useUserStore()

onMounted(() => {
  currentForm.value = 'signin'
  email.value = ''
  password.value = ''
  isValidEmail.value = false
  isValidPassword.value = false
  isDisableBtn.value = true
  errorMsg.value = 'Email không chính xác'
  passwordErrorMsg.value =
    'Mật khẩu phải chứa một chữ số từ 1 đến 9, một chữ cái viết thường, một chữ cái viết hoa và phải dài 6 ký tự.'
})

const changeCurrentForm = (form: string) => {
  currentForm.value = form
}

const changeEmail = (newEmail: string) => {
  email.value = newEmail
}

const validateEmail = (email: string) => {
  const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  return email.match(validRegex)
}

const handleCheckEmail = () => {
  if (validateEmail(email.value)) {
    isValidEmail.value = true
  } else {
    isValidEmail.value = false
  }
}

const handleSignin = async () => {
  const response: Response = await signin(email.value, password.value)
  if (response?.code !== 200) {
    isDisableBtn.value = true
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }

  const data = response.data as { accessToken: string; refreshToken: string } & UserProfile

  toast.success(translate(response.message)!, {
    timeout: 2000
  })

  const { accessToken, refreshToken, ...other } = data
  userStore.setProfile(other)
  userStore.setToken(accessToken)
  window.localStorage.setItem('refreshToken', JSON.stringify(refreshToken))

  return router.push('/')
}

const validatePassword = (password: string) => {
  const validRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.* ).{6,}$/
  return password.match(validRegex)
}

const handleCheckPassword = () => {
  if (validatePassword(password.value)) {
    isValidPassword.value = true
  } else {
    isValidPassword.value = false
  }
}

onUpdated(() => {
  if (email.value && isValidPassword.value) {
    isDisableBtn.value = false
  } else {
    isDisableBtn.value = true
  }
})
</script>

<template>
  <div class="container bg-white py-5">
    <div class="p-5 d-flex justify-content-center">
      <form class="w-50">
        <template v-if="currentForm === 'signin'">
          <div :class="{ 'was-validated': email && isValidEmail }">
            <div class="form-outline mb-3">
              <input
                id="email"
                class="form-control"
                :class="{ active: email, 'is-invalid': email && !isValidEmail }"
                type="text"
                autocomplete="off"
                v-model="email"
                @keyup="handleCheckEmail"
              />
              <label class="form-label" for="email">Địa chỉ email</label>
              <div v-if="email && !isValidEmail" class="invalid-feedback">{{ errorMsg }}</div>

              <div class="form-notch">
                <div class="form-notch-leading" style="width: 9px"></div>
                <div class="form-notch-middle" style="width: 80px"></div>
                <div class="form-notch-trailing"></div>
              </div>
            </div>
          </div>

          <div :class="{ 'was-validated': password && isValidPassword }">
            <div
              class="form-outline"
              :class="{
                'mt-5': email && !isValidEmail
              }"
            >
              <input
                id="password"
                class="form-control position-relative"
                :class="{
                  active: password,
                  'is-invalid': password && !isValidPassword
                }"
                :type="isShowPassword ? 'text' : 'password'"
                autocomplete="off"
                v-model="password"
                @keyup="handleCheckPassword"
              />

              <i
                @click="() => (isShowPassword = !isShowPassword)"
                class="cursor-pointer position-absolute fa-regular fs-5"
                :class="isShowPassword ? 'fa-eye-slash' : 'fa-eye'"
                style="top: 20%; right: 2%"
              >
              </i>
              <label class="form-label" for="password">Mật khẩu</label>

              <div v-if="password && !isValidPassword" class="invalid-feedback">
                {{ passwordErrorMsg }}
              </div>

              <div class="form-notch">
                <div class="form-notch-leading" style="width: 9px"></div>
                <div class="form-notch-middle" style="width: 60px"></div>
                <div class="form-notch-trailing"></div>
              </div>
            </div>
          </div>

          <div
            class="mb-4"
            :class="{
              'mt-5': password && !isValidPassword
            }"
          >
            <div class="text-end mt-3">
              <p class="forgotPasswordBtn" @click="currentForm = 'forgot-password'">
                Quên mật khẩu?
              </p>
            </div>
          </div>

          <button
            :class="{
              disabled: isDisableBtn
            }"
            type="button"
            role="button"
            class="btn-signup btn btn-block text-white ripple-surface"
            style="background-color: rgb(201, 33, 39)"
            @click="handleSignin"
          >
            Đăng nhập
          </button>
        </template>

        <template v-else-if="currentForm === 'forgot-password'">
          <ForgotPassword :changeEmail="changeEmail" :changeCurrentForm="changeCurrentForm" />
        </template>

        <template v-else-if="currentForm === 'verify-otp'">
          <VerifyOtp :email="email" :changeCurrentForm="changeCurrentForm" />
        </template>

        <template v-else-if="currentForm === 'create-password'">
          <CreatePassword :email="email" />
        </template>

        <div class="text-center pt-4">
          <p>Chưa có tài khoản? <RouterLink to="/dang-ky">đăng ký</RouterLink></p>
          <p>hoặc đăng nhập bằng:</p>
          <MDBBtn color="secondary" floating class="mx-1">
            <MDBIcon iconStyle="fab" icon="facebook-f" />>
          </MDBBtn>

          <MDBBtn color="secondary" floating class="mx-1">
            <MDBIcon iconStyle="fab" icon="google" />
          </MDBBtn>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.forgotPasswordBtn {
  text-decoration: underline;
  color: cornflowerblue;
}

.forgotPasswordBtn:hover {
  cursor: pointer;
  color: darkblue;
}
</style>
