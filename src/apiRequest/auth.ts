import axiosInstance from './axios-instance'

const baseURL: string = import.meta.env.VITE_APP_API_URL

export const signin = async (email: string, password: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/auth/login`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { email, password }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const signup = async (email: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/auth/register`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { email }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const sendOtp = async (email: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/auth/otp/send`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { email }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const verifyOtp = async (email: string, otpCode: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/auth/otp/verify`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { email, otpCode }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const createPassword = async (email: string, password: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/auth/user/create-password`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { email, password }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const logout = async (token: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/auth/logout`,
      method: 'POST',
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

export const forgotPassword = async (email: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/users/forgot-password`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      data: { email }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const refreshToken = async (rfToken: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/auth/token/refresh`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + rfToken
      }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const changePassword = async (token: string, oldPassword: string, newPassword: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/users/change-password`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      data: {
        oldPassword,
        newPassword
      }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}
