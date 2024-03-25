<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useToast } from 'vue-toastification'
import { fetchAddress, updateAddress, getUserAddress } from '@/apiRequest'
import { useUserStore } from '@/stores'
import type { Address } from '@/interfaces'
import { translate } from '@/utils'

const userStore = useUserStore()
const toast = useToast()

interface selectOption {
  value: string | number
  text: string
  disabled?: boolean
}

const isChangeProvince = ref<boolean>(false)
const province = ref<string | number>('default')
const provinceOptions = ref<Array<selectOption>>([
  { value: 'default', text: '-- Tỉnh/Thành phố --', disabled: true }
])

const district = ref<string | number>('default')
const districtOptions = ref<Array<selectOption>>([
  { value: 'default', text: '-- Quận/Huyện --', disabled: true }
])

const ward = ref<string | number>('default')
const wardOptions = ref<Array<selectOption>>([
  { value: 'default', text: '-- Xã/Phường --', disabled: true }
])

const addressDetail = ref<string>('')

onMounted(async () => {
  const userProfile = userStore.getProfile()
  const provinces = await fetchAddress('province')
  provinceOptions.value = provinces

  if (userProfile?.address.province) {
    isChangeProvince.value = false

    const userAddress = (await getUserAddress(userProfile.address)) as Address
    // fetched province
    province.value = userProfile.address.province

    // No district, ward yet
    districtOptions.value[0].text = userAddress.district
    wardOptions.value[0].text = userAddress.ward

    addressDetail.value = userAddress.Address!
  }
})

const changeProvince = async () => {
  const districts = await fetchAddress('district', province.value)
  districtOptions.value = districts
  isChangeProvince.value = true
}

const changeDistrict = async () => {
  const wards = await fetchAddress('ward', district.value)
  wardOptions.value = wards
}

const handleSubmit = async () => {
  const profile = userStore.getProfile()
  const token = userStore.getToken()
  const userAddress = {
    Address: addressDetail.value,
    province: province.value,
    district: district.value,
    ward: ward.value
  } as Address

  const response = await updateAddress(token, userAddress)

  toast.success(translate(response.message)!, {
    timeout: 2000
  })

  userStore.setProfile({ ...profile, address: { ...userAddress } })
}
</script>

<template>
  <div class="d-flex justify-content-between">
    <b-form-select
      v-model="province"
      :options="provinceOptions"
      class="w-25 form-control"
      style="height: 35px"
      @change="changeProvince"
    >
    </b-form-select>

    <b-form-select
      :disabled="province === 'default' || !isChangeProvince"
      v-model="district"
      :options="districtOptions"
      class="w-25 form-control"
      style="height: 35px"
      @change="changeDistrict"
    ></b-form-select>

    <b-form-select
      :disabled="district === 'default'"
      v-model="ward"
      :options="wardOptions"
      class="w-25 form-control"
      style="height: 35px"
    ></b-form-select>
  </div>

  <div class="mt-4">
    <div class="form-outline">
      <input
        id="address-detail"
        :class="{ active: addressDetail }"
        class="form-control position-relative"
        autocomplete="off"
        v-model="addressDetail"
      />

      <label class="form-label" for="password">Địa chỉ cụ thể</label>

      <div class="form-notch">
        <div class="form-notch-leading" style="width: 9px"></div>
        <div class="form-notch-middle" style="width: 85px"></div>
        <div class="form-notch-trailing"></div>
      </div>
    </div>
  </div>

  <div style="text-align: center; padding: 20px 0 10px 0" class="mt-5">
    <button
      title="Lưu thay đổi"
      @click="handleSubmit"
      class="btn bg-dark text-white"
      :disabled="ward === 'default'"
    >
      Lưu thay đổi
    </button>
  </div>
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
