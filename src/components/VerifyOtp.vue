<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'

import { sendOtp, verifyOtp } from '@/apiRequest'
import type { Response } from '@/interfaces'
import { translate } from '@/utils'

const { email, changeCurrentForm } = defineProps({
  email: {
    type: String,
    required: true
  },
  changeCurrentForm: {
    type: Function,
    required: true
  }
})

const toast = useToast()

const timeCounter = ref<number>(300)
const isDisableBtn = ref<boolean>(true)

const otpCodes = ref<string[]>(Array(6).fill(''))
const otpInputs = ref<HTMLInputElement[]>([])

onMounted(() => {
  otpInputs.value = Array.from(document.querySelectorAll('input[name="otpInput"]'))

  const interval = setInterval(() => {
    timeCounter.value--

    if (timeCounter.value <= 0) {
      changeCurrentForm('signup')
      timeCounter.value = 300
      clearInterval(interval)
    }
  }, 1000)
})

const handleInput = (index: number) => {
  if (typeof Number(otpCodes.value[index]) !== 'number' || isNaN(Number(otpCodes.value[index]))) {
    return (otpCodes.value[index] = '')
  }

  if (index !== otpCodes.value.length - 1) {
    const nextInput = otpInputs.value[index + 1]
    nextInput.focus()
  }
}

const handleSendOtp = async () => {
  const response: Response = await sendOtp(email)
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

  toast.success('Đã gửi lại OTP code', {
    timeout: 2000
  })
  otpCodes.value = Array(6).fill('')
  timeCounter.value = 300
}

const handleVerifyOtp = async () => {
  const otpCode = otpCodes.value.join('')
  const response: Response = await verifyOtp(email, otpCode)

  if (response?.code !== 200) {
    isDisableBtn.value = true
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }

  const data = response.data as { is_success: boolean }

  if (!data.is_success) {
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }

  toast.success(translate(response.message)!, {
    timeout: 2000
  })
  return changeCurrentForm('create-password')
}

function timeConvert(num: number) {
  let hours = Math.floor(num / 60) <= 9 ? '0' + Math.floor(num / 60) : Math.floor(num / 60)
  let minutes = num % 60 <= 9 ? '0' + (num % 60) : num % 60
  return hours + ':' + minutes
}
</script>

<template>
  <div class="form-group d-flex justify-content-center">
    <input
      v-for="index in 6"
      :key="index"
      name="otpInput"
      type="text"
      class="form-control text-center p-0"
      ref="otpInputs"
      maxlength="1"
      autocomplete="off"
      v-model="otpCodes[index - 1]"
      @input="handleInput(index - 1)"
    />
  </div>

  <div v-if="timeCounter > 0" class="text-center mt-2">
    <p>{{ timeConvert(timeCounter) }}</p>
    <a v-if="timeCounter <= 360" href="#" @click="handleSendOtp">Gửi lại</a>
  </div>

  <button
    :class="{
      disabled: !otpCodes.every((code) => code !== '')
    }"
    type="button"
    role="button"
    class="btn-signup btn btn-block text-white ripple-surface mt-4"
    style="background-color: rgb(201, 33, 39)"
    @click="handleVerifyOtp"
  >
    Xác thực
  </button>
</template>
