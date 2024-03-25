import axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { useUserStore } from '@/stores'

const baseURL: string = import.meta.env.VITE_APP_API_URL

const updateToken = (refreshTokenResponse: any) => {
  const userStore = useUserStore()

  const rfToken = refreshTokenResponse.data?.data.refreshToken
  const acToken = refreshTokenResponse.data?.data.accessToken

  userStore.setToken(acToken)
  window.localStorage.setItem('refreshToken', JSON.stringify(rfToken))
}

const axiosInstance = axios.create({
  baseURL,
  timeout: 5000
  //   withCredentials: true
})

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    let countRequest = 0
    const originalRequest = error.config

    if (error.response.status === 401 && !originalRequest._retry && countRequest < 10) {
      originalRequest._retry = true
      countRequest++

      const rfTokenJson = window.localStorage.getItem('refreshToken')
      const rfToken = JSON.parse(rfTokenJson!)
      const decoded = jwtDecode(rfToken)

      if (!decoded.exp || Date.now() >= decoded.exp * 1000) {
        return
      }

      const refreshTokenResponse = await axiosInstance({
        url: baseURL + '/auth/token/refresh',
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + rfToken
        }
      })

      if (refreshTokenResponse.status === 200) {
        const acToken = refreshTokenResponse.data?.data.accessToken

        updateToken(refreshTokenResponse)

        originalRequest.headers['Authorization'] = 'Bearer ' + acToken

        return axiosInstance(originalRequest)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
