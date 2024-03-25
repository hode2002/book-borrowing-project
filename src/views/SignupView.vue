<script setup lang="ts">
import { MDBBtn, MDBIcon } from 'mdb-vue-ui-kit'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useToast } from 'vue-toastification'

import VerifyOtp from '../components/VerifyOtp.vue'
import CreatePassword from '@/components/CreatePassword.vue'

import { signup } from '@/apiRequest'
import type { Response } from '@/interfaces'

const currentForm = ref<string>('signup')
const isValidEmail = ref<boolean>(false)
const isDisableBtn = ref<boolean>(true)
const email = ref<string>('')
const errorMsg = ref<string>('Email không chính xác')
const toast = useToast()

onMounted(() => {
  currentForm.value = 'signup'
  email.value = ''
  isValidEmail.value = false
  isDisableBtn.value = true
  errorMsg.value = 'Email không chính xác'
})

const validateEmail = (email: string) => {
  const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  return email.match(validRegex)
}

const handleCheckEmail = () => {
  if (validateEmail(email.value)) {
    isValidEmail.value = true
    isDisableBtn.value = false
  } else {
    isValidEmail.value = false
  }
}

const handleSignup = async () => {
  const response: Response = await signup(email.value)

  if (response?.code !== 200) {
    isDisableBtn.value = true
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }

  const data = response.data as { is_success: boolean }

  toast.success(translate(response.message)!, {
    timeout: 2000
  })

  if (data.is_success) {
    changeCurrentForm('verify-otp')
    isValidEmail.value = false
  }
}

const changeCurrentForm = (form: string) => {
  currentForm.value = form
}
</script>

<template>
  <div class="container bg-white py-5">
    <div class="p-5 d-flex justify-content-center">
      <form class="w-50" :class="{ 'was-validated': isValidEmail }">
        <template v-if="currentForm === 'signup'">
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

          <button
            :class="{
              'mt-4': email && !isValidEmail,
              disabled: isDisableBtn
            }"
            type="button"
            role="button"
            class="btn-signup btn btn-block text-white ripple-surface"
            style="background-color: rgb(201, 33, 39)"
            @click="handleSignup"
          >
            Đăng ký
          </button>
        </template>

        <template v-else-if="currentForm === 'verify-otp'">
          <VerifyOtp :email="email" :changeCurrentForm="changeCurrentForm" />
        </template>

        <template v-else-if="currentForm === 'create-password'">
          <CreatePassword :email="email" />
        </template>

        <div class="text-center pt-4">
          <p>Đã có tài khoản? <RouterLink to="/dang-nhap">đăng nhập</RouterLink></p>
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
.container {
  box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
}

.btn-signup:hover {
  background-color: black !important;
}
</style>
