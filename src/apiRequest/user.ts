import type { Address, Book, UpdateProfile } from '@/interfaces'
import axiosInstance from './axios-instance'
import moment from 'moment'

type AccessToken = string | null

interface selectOption {
  value: string | number
  text: string
  disabled?: boolean
}

interface Province {
  ProvinceID: number
  ProvinceName: string
}

interface District {
  DistrictID: number
  DistrictName: string
}

interface Ward {
  WardCode: string
  WardName: string
}

const baseURL: string = import.meta.env.VITE_APP_API_URL
const GHN_baseURL: string = import.meta.env.VITE_APP_GHN_URL
const GHN_KEY = import.meta.env.VITE_APP_GHN_KEY

export const getProfile = async (token: AccessToken) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/users`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const updateAddress = async (token: AccessToken, address: Address) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/users/update-address`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      data: {
        ...address
      }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const updateProfile = async (token: AccessToken, profile: UpdateProfile) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/users`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      data: {
        ...profile
      }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const fetchAddress = async (type: string, id?: string | number) => {
  let query = ''

  switch (type) {
    case 'district':
      query = '?province_id=' + id
      break
    case 'ward':
      query = '?district_id=' + id
      break
  }

  const response = await axiosInstance({
    url: `${GHN_baseURL}/${type}` + query,
    headers: { Token: GHN_KEY }
  })
  const data = response.data.data
  let result = <Array<selectOption>>[]
  switch (type) {
    case 'province':
      result = [{ value: 'default', text: '-- Tỉnh/Thành phố --', disabled: true }]
      result = [
        ...result,
        ...(data.map((item: Province) => ({
          value: item.ProvinceID,
          text: item.ProvinceName
        })) as Array<selectOption>)
      ]
      break
    case 'district':
      result = [{ value: 'default', text: '-- Quận/Huyện --', disabled: true }]
      result = [
        ...result,
        ...(data.map((item: District) => ({
          value: item.DistrictID,
          text: item.DistrictName
        })) as Array<selectOption>)
      ]
      break
    case 'ward':
      result = [{ value: 'default', text: '-- Xã/Phường --', disabled: true }]
      result = [
        ...result,
        ...(data.map((item: Ward) => ({
          value: item.WardCode,
          text: item.WardName
        })) as Array<selectOption>)
      ]
      break
  }

  return result
}

export const getUserAddress = async (address: Address) => {
  const { province, district, ward, ...other } = address

  const districtResponse = await axiosInstance({
    url: `${GHN_baseURL}/district?province_id=` + province,
    headers: { Token: GHN_KEY }
  })
  const districtName = districtResponse.data.data.find(
    (item: any) => item.DistrictID === +district
  ).DistrictName

  const wardResponse = await axiosInstance({
    url: `${GHN_baseURL}/ward?district_id=` + district,
    headers: { Token: GHN_KEY }
  })
  const wardName = wardResponse.data.data.find((item: any) => item.WardCode === ward)?.WardName

  return {
    district: districtName,
    ward: wardName,
    ...other
  }
}

export const getBorrowedBooks = async (token: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/borrowings`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const borrowBook = async (token: string, book: Book, dueDate: number) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/borrowings`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      data: {
        bookId: book._id,
        quantity: 1,
        borrowDate: new Date(),
        dueDate: moment(new Date()).add(dueDate, 'days')
      }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}
