<script setup lang="ts">
import { onMounted, onUpdated, ref } from 'vue'
import { useToast } from 'vue-toastification'

import { forgotPassword } from '@/apiRequest'
import type { Response } from '@/interfaces'
import { translate } from '@/utils'

const toast = useToast()

const isDisableBtn = ref<boolean>(true)
const email = ref<string>('')
const errorMsg = ref<string>('Email không chính xác')
const isValidEmail = ref<boolean>(false)

const { changeEmail, changeCurrentForm } = defineProps({
  changeEmail: {
    type: Function,
    required: true
  },
  changeCurrentForm: {
    type: Function,
    required: true
  }
})

onMounted(() => {
  email.value = ''
  errorMsg.value = 'Email không chính xác'
  isValidEmail.value = false
  isDisableBtn.value = true
})

onUpdated(() => {
  if (email.value && isValidEmail.value) {
    isDisableBtn.value = false
  } else {
    isDisableBtn.value = true
  }
})

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

const handleForgotPassword = async () => {
  const response: Response = await forgotPassword(email.value)

  if (response?.code !== 200) {
    isDisableBtn.value = true
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }

  const data = response.data as { is_success: boolean }

  if (!data.is_success) {
    return toast.success(translate(response.message)!, {
      timeout: 2000
    })
  }

  toast.success('Đã gửi OTP code', {
    timeout: 2000
  })

  changeEmail(email.value)

  changeCurrentForm('verify-otp')
}
</script>

<template>
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

  <button
    :class="{
      'mt-4': email && !isValidEmail,
      disabled: isDisableBtn
    }"
    type="button"
    role="button"
    class="btn-signup btn btn-block text-white ripple-surface"
    style="background-color: rgb(201, 33, 39)"
    @click="handleForgotPassword"
  >
    Quên mật khẩu
  </button>

  <div class="text-center pt-4">
    <p class="back" @click="changeCurrentForm('signin')">Quay lại</p>
  </div>
</template>

<style scoped>
.back {
  text-decoration: underline;
  color: cornflowerblue;
}

.back:hover {
  cursor: pointer;
  color: darkblue;
}
</style>
