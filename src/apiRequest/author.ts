import axiosInstance from './axios-instance'

const baseURL: string = import.meta.env.VITE_APP_API_URL

export const getAuthors = async () => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/authors`,
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

export const getAuthorById = async (id: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/authors/${id}`,
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
