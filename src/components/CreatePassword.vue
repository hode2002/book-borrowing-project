<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'
import { createPassword, changePassword } from '@/apiRequest'
import type { Response } from '@/interfaces'
import { useUserStore } from '@/stores'
import { translate } from '@/utils'

const userStore = useUserStore()

const { email, isCreatePassword = true } = defineProps({
  email: {
    type: String,
    required: true
  },
  isCreatePassword: {
    type: Boolean
  }
})

onMounted(() => {
  isDisableBtn.value = true
  passwordErrorMsg.value =
    'Mật khẩu phải chứa một chữ số từ 1 đến 9, một chữ cái viết thường, một chữ cái viết hoa và phải dài 6 ký tự.'
  isShowPassword.value = false
  confirmPasswordErrorMsg.value =
    'Mật khẩu phải chứa một chữ số từ 1 đến 9, một chữ cái viết thường, một chữ cái viết hoa và phải dài 6 ký tự.'
  isShowConfirmPassword.value = false
})

const toast = useToast()
const router = useRouter()

const isDisableBtn = ref<boolean>(true)

const oldPassword = ref<string>('')
const isValidOldPassword = ref<boolean>(false)
const oldPasswordErrorMsg = ref<string>(
  'Mật khẩu phải chứa một chữ số từ 1 đến 9, một chữ cái viết thường, một chữ cái viết hoa và phải dài 6 ký tự.'
)
const isShowOldPassword = ref<boolean>(false)

const password = ref<string>('')
const isValidPassword = ref<boolean>(false)
const passwordErrorMsg = ref<string>(
  'Mật khẩu phải chứa một chữ số từ 1 đến 9, một chữ cái viết thường, một chữ cái viết hoa và phải dài 6 ký tự.'
)
const isShowPassword = ref<boolean>(false)

const confirmPassword = ref<string>('')
const isValidConfirmPassword = ref<boolean>(false)
const confirmPasswordErrorMsg = ref<string>(
  'Mật khẩu phải chứa một chữ số từ 1 đến 9, một chữ cái viết thường, một chữ cái viết hoa và phải dài 6 ký tự.'
)
const isShowConfirmPassword = ref<boolean>(false)

const validatePassword = (password: string) => {
  const validRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.* ).{6,}$/
  return password.match(validRegex)
}

const handleCheckOldPassword = () => {
  if (validatePassword(oldPassword.value)) {
    isValidOldPassword.value = true
  } else {
    isValidOldPassword.value = false
  }
}

const handleCheckPassword = () => {
  if (validatePassword(password.value)) {
    isValidPassword.value = true
  } else {
    isValidPassword.value = false
  }
}

const handleCheckConfirmPassword = () => {
  if (!validatePassword(confirmPassword.value)) {
    isValidConfirmPassword.value = false
    return
  }

  if (confirmPassword.value === password.value) {
    isValidConfirmPassword.value = true
    isDisableBtn.value = false
  } else {
    isValidConfirmPassword.value = false
    confirmPasswordErrorMsg.value = 'Mật khẩu không khớp'
  }
}

const handleSubmit = async () => {
  let response: Response
  if (isCreatePassword) {
    response = await createPassword(email, password.value)
  } else {
    response = await changePassword(email, oldPassword.value, password.value)
  }

  if (response?.code !== 200) {
    isDisableBtn.value = true
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }

  const data = response.data as { is_success: boolean; accessToken: string; refreshToken: string }

  if (!data.is_success) {
    return toast.success(translate(response.message)!, {
      timeout: 2000
    })
  }

  if (isCreatePassword) {
    userStore.setToken(data.accessToken)
    window.localStorage.setItem('refreshToken', JSON.stringify(data.refreshToken))
  }

  toast.success(translate(response.message)!, {
    timeout: 2000
  })

  isDisableBtn.value = true
  oldPassword.value = ''
  password.value = ''
  confirmPassword.value = ''
}
</script>

<template>
  <template v-if="isCreatePassword === false">
    <form :class="{ 'was-validated': oldPassword && isValidOldPassword }" class="mb-3">
      <div class="form-outline">
        <input
          id="password"
          class="form-control position-relative"
          :class="{
            active: oldPassword,
            'is-invalid': oldPassword && !isValidOldPassword
          }"
          :type="isShowOldPassword ? 'text' : 'password'"
          autocomplete="off"
          v-model="oldPassword"
          @keyup="handleCheckOldPassword"
        />

        <i
          @click="() => (isShowOldPassword = !isShowOldPassword)"
          class="cursor-pointer position-absolute fa-regular fs-5"
          :class="isShowOldPassword ? 'fa-eye-slash' : 'fa-eye'"
          style="top: 20%; right: 2%"
        >
        </i>
        <label class="form-label" for="password">Mật khẩu cũ</label>

        <div v-if="oldPassword && !isValidOldPassword" class="invalid-feedback">
          {{ oldPasswordErrorMsg }}
        </div>

        <div class="form-notch">
          <div class="form-notch-leading" style="width: 9px"></div>
          <div class="form-notch-middle" style="width: 77px"></div>
          <div class="form-notch-trailing"></div>
        </div>
      </div>
    </form>
  </template>

  <form :class="{ 'was-validated': password && isValidPassword }">
    <div
      class="form-outline"
      :class="{
        'mt-70': oldPassword && !isValidOldPassword
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
      <label class="form-label" for="password">
        Mật khẩu
        <span v-if="isCreatePassword === false">mới</span>
      </label>

      <div v-if="password && !isValidPassword" class="invalid-feedback">{{ passwordErrorMsg }}</div>

      <div class="form-notch">
        <div class="form-notch-leading" style="width: 9px"></div>
        <div class="form-notch-middle" style="width: 85px"></div>
        <div class="form-notch-trailing"></div>
      </div>
    </div>
  </form>

  <form :class="{ 'was-validated': confirmPassword && isValidConfirmPassword }">
    <div
      class="form-outline mt-3"
      :class="{
        'mt-70': password && !isValidPassword,
        'mb-50': confirmPassword && !isValidConfirmPassword
      }"
    >
      <input
        id="confirmPassword"
        class="form-control"
        :disabled="!password"
        :class="{
          active: confirmPassword,
          'is-invalid': confirmPassword && !isValidConfirmPassword
        }"
        :type="isShowConfirmPassword ? 'text' : 'password'"
        autocomplete="off"
        v-model="confirmPassword"
        @keyup="handleCheckConfirmPassword"
      />

      <i
        @click="isShowConfirmPassword = !isShowConfirmPassword"
        class="cursor-pointer position-absolute fa-regular fs-5"
        :class="isShowConfirmPassword ? 'fa-eye-slash' : 'fa-eye'"
        style="top: 20%; right: 2%"
      >
      </i>

      <label class="form-label" for="confirmPassword">
        Nhập lại mật khẩu
        <span v-if="isCreatePassword === false">mới</span>
      </label>

      <div v-if="confirmPassword && !isValidConfirmPassword" class="invalid-feedback">
        {{ confirmPasswordErrorMsg }}
      </div>

      <div class="form-notch">
        <div class="form-notch-leading" style="width: 9px"></div>
        <div class="form-notch-middle" style="width: 110px"></div>
        <div class="form-notch-trailing"></div>
      </div>
    </div>
  </form>

  <button
    :class="{ disabled: isDisableBtn }"
    @click="handleSubmit"
    type="button"
    role="button"
    class="btn-signup btn btn-block text-white ripple-surface mt-4"
    style="background-color: rgb(201, 33, 39)"
  >
    {{ isCreatePassword ? 'Tạo mật khẩu' : 'Xác nhận' }}
  </button>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.mt-70 {
  margin-top: 70px !important;
}

.mb-50 {
  margin-bottom: 50px !important;
}
</style>
