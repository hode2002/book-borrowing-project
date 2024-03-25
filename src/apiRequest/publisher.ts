import axiosInstance from './axios-instance'

const baseURL: string = import.meta.env.VITE_APP_API_URL

export const getPublishers = async () => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/publishers`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}

export const getPublisherById = async (id: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/publishers/${id}`,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}
