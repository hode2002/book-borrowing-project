<script setup lang="ts">
import ChangePassword from '@/components/ChangePassword.vue'
import ChangeAddress from '@/components/ChangeAddress.vue'
import type { Response, UserProfile, UpdateProfile } from '@/interfaces'
import { useUserStore } from '@/stores'
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { getProfile, updateProfile } from '@/apiRequest/'
import { useToast } from 'vue-toastification'
import HistoryBorrowing from '@/components/HistoryBorrowing.vue'
import { translate } from '@/utils'

const userStore = useUserStore()
const toast = useToast()

onMounted(async () => {
  const token = userStore.getToken()

  const userProfile = userStore.getProfile()
  if (userProfile.address.ward.length < 0) {
    const response: Response = await getProfile(token)
    const data = response.data as {
      is_success: boolean
      user: UserProfile
    }
    userStore.setProfile(data.user)
  }

  profile.value = userStore.getProfile()
  phoneNumber.value = userStore.getProfile().phoneNumber
  firstName.value = userStore.getProfile().firstName
  lastName.value = userStore.getProfile().lastName
  gender.value = userStore.getProfile().gender
  dob.value = userStore.getProfile().dob!

  if (dob.value) {
    const arrDOB = dob.value.toString().split('T')[0].split('-')
    DOB_DD.value = arrDOB[2]
    DOB_MM.value = arrDOB[1]
    DOB_YYYY.value = arrDOB[0]
  }
})

const profile = ref<UserProfile | null>(null)

const phoneNumber = ref<string | null>(null)
const firstName = ref<string | null>(null)
const lastName = ref<string | null>(null)
const gender = ref<string | null>(null)
const dob = ref<Date | null>(null)
const DOB_DD = ref<string | null>(null)
const DOB_MM = ref<string | null>(null)
const DOB_YYYY = ref<string | null>(null)

const handleSubmit = async () => {
  const token = userStore.getToken()
  const userDOB = DOB_YYYY.value + '-' + DOB_MM.value + '-' + DOB_DD.value
  dob.value = new Date(userDOB)

  const updatedProfile = {
    dob: dob.value,
    firstName: firstName.value,
    lastName: lastName.value,
    gender: gender.value,
    phoneNumber: phoneNumber.value
  } as UpdateProfile
  const response: Response = await updateProfile(token, updatedProfile)

  if (response?.code !== 200) {
    return toast.error(translate(response.message)!, {
      timeout: 2000
    })
  }

  const data = response.data as { is_success: boolean; user: UserProfile }

  if (!data.is_success) {
    return toast.success(translate(response.message)!, {
      timeout: 2000
    })
  }

  profile.value = data.user
  userStore.setProfile(data.user)

  toast.success(translate(translate(response.message)!)!, {
    timeout: 2000
  })
}
</script>

<template>
  <main class="container">
    <div class="d-flex p-4" style="min-height: 68vh">
      <div class="w-25 bg-white me-4 p-3">
        <div class="mb-4 fs-3 fw-bold">Tài khoản</div>
        <div class="py-1">
          <RouterLink
            to="/tai-khoan"
            class="opacity-80"
            :class="{ 'side-active': $route.path === '/tai-khoan' }"
            >Thông tin tài khoản</RouterLink
          >
        </div>
        <div class="py-1">
          <RouterLink
            to="/tai-khoan/lich-su-muon-sach"
            class="opacity-80"
            :class="{ 'side-active': $route.path === '/tai-khoan/lich-su-muon-sach' }"
          >
            Lịch sử mượn sách
          </RouterLink>
        </div>
        <div class="py-1">
          <RouterLink
            to="/tai-khoan/doi-mat-khau"
            class="opacity-80"
            :class="{ 'side-active': $route.path === '/tai-khoan/doi-mat-khau' }"
          >
            Đổi mật khẩu
          </RouterLink>
        </div>
        <div class="py-1">
          <RouterLink
            to="/tai-khoan/dia-chi"
            class="opacity-80"
            :class="{ 'side-active': $route.path === '/tai-khoan/dia-chi' }"
          >
            Địa chỉ
          </RouterLink>
        </div>
      </div>

      <div v-if="$route.name === 'profile'" class="w-75 bg-white py-3 px-4">
        <p class="mb-4 fs-3 fw-bold">Thông tin tài khoản</p>

        <div class="d-flex gap-5">
          <div class="form-outline mb-3">
            <input id="email" class="form-control" type="text" autocomplete="off" disabled />
            <label class="form-label" for="email">{{ profile!?.email }}</label>

            <div class="form-notch">
              <div class="form-notch-leading" style="width: 9px"></div>
              <div class="form-notch-middle" style="width: 80px"></div>
              <div class="form-notch-trailing"></div>
            </div>
          </div>
          <div class="form-outline mb-3">
            <input
              id="phone"
              class="form-control"
              v-model="phoneNumber"
              :class="{ active: phoneNumber }"
              type="text"
              autocomplete="off"
            />
            <label class="form-label" for="phone">Số điện thoại</label>

            <div class="form-notch">
              <div class="form-notch-leading" style="width: 9px"></div>
              <div class="form-notch-middle" style="width: 80px"></div>
              <div class="form-notch-trailing"></div>
            </div>
          </div>
        </div>

        <div class="d-flex gap-5">
          <div class="form-outline mb-3">
            <input
              id="email"
              class="form-control"
              v-model="firstName"
              :class="{ active: firstName }"
              type="text"
              autocomplete="off"
            />
            <label class="form-label" for="email">Họ</label>

            <div class="form-notch">
              <div class="form-notch-leading" style="width: 9px"></div>
              <div class="form-notch-middle" style="width: 24px"></div>
              <div class="form-notch-trailing"></div>
            </div>
          </div>

          <div class="form-outline mb-3">
            <input
              id="email"
              class="form-control"
              v-model="lastName"
              :class="{ active: lastName }"
              type="text"
              autocomplete="off"
            />
            <label class="form-label" for="email">Tên</label>

            <div class="form-notch">
              <div class="form-notch-leading" style="width: 9px"></div>
              <div class="form-notch-middle" style="width: 28px"></div>
              <div class="form-notch-trailing"></div>
            </div>
          </div>
        </div>

        <div class="my-2 d-flex align-items-center">
          <label>Giới tính</label>
          <div class="d-flex">
            <div class="d-flex gap-5" style="margin-left: 60px">
              <div>
                <input
                  id="male"
                  @click="gender = 'male'"
                  :checked="gender === 'male'"
                  type="radio"
                  class="me-2"
                  name="gender-radio"
                />
                <label for="male" style="margin-top: 2px">Nam</label>
              </div>
              <div>
                <input
                  id="female"
                  @click="gender = 'female'"
                  :checked="gender === 'female'"
                  type="radio"
                  class="me-2"
                  name="gender-radio"
                />
                <label for="female" style="margin-top: 2px">Nữ</label>
              </div>
            </div>
          </div>
        </div>

        <div class="my-4">
          <div class="d-flex align-items-center">
            <label>Ngày sinh</label>

            <div style="margin-left: 50px" class="d-flex justify-content-center">
              <div class="d-flex">
                <div class="account-input-bod">
                  <input
                    class="form-control"
                    type="text"
                    autocomplete="off"
                    style="text-align: center"
                    maxlength="2"
                    placeholder="DD"
                    v-model="DOB_DD"
                  />
                </div>
                <div class="account-input-bod">
                  <input
                    class="form-control"
                    type="text"
                    autocomplete="off"
                    style="text-align: center"
                    maxlength="2"
                    placeholder="MM"
                    v-model="DOB_MM"
                  />
                </div>
                <div class="account-input-bod">
                  <input
                    class="form-control"
                    type="text"
                    autocomplete="off"
                    style="text-align: center"
                    maxlength="4"
                    placeholder="YYYY"
                    v-model="DOB_YYYY"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style="text-align: center; padding: 20px 0 10px 0">
          <button @click="handleSubmit" class="btn bg-dark text-white">Lưu thay đổi</button>
        </div>
      </div>

      <div v-else-if="$route.name === 'change-password'" class="w-75 bg-white py-3 px-4">
        <p class="mb-4 fs-3 fw-bold">Đổi mật khẩu</p>

        <template v-if="profile">
          <ChangePassword :email="profile.email" />
        </template>
      </div>

      <div v-else-if="$route.name === 'history'" class="w-75 bg-white py-3 px-4">
        <template v-if="profile">
          <HistoryBorrowing />
        </template>
      </div>

      <div v-else-if="$route.name === 'change-address'" class="w-75 bg-white py-3 px-4">
        <p class="mb-4 fs-3 fw-bold">Thay đổi địa chỉ</p>

        <template v-if="profile">
          <ChangeAddress />
        </template>

        <template v-else> 555 </template>
      </div>
    </div>
  </main>
</template>
<style scoped>
.btn:hover {
  opacity: 0.9;
}

.side-active {
  opacity: 1 !important;
  font-weight: bold;
  text-decoration: underline;
}
</style>
