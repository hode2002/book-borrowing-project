import axiosInstance from './axios-instance'

const baseURL: string = import.meta.env.VITE_APP_API_URL

export const getBooks = async () => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/books`,
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

export const getBookByName = async (slug: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/books/name/${slug}`,
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

export const getBookByAuthorId = async (id: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/books/author/${id}`,
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

export const getBookBySearchTerm = async (searchTerm: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/books/search?searchTerm=${searchTerm}`,
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

export const getBookByCate = async (slug: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/books/category/${slug}`,
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

export const getBookByPublisher = async (id: string) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/books/publishers/${id}`,
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

export const updateBookById = async (token: string, id: string, quantity: number) => {
  try {
    const response = await axiosInstance({
      url: `${baseURL}/books/${id}`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      data: { quantity }
    })
    return response.data
  } catch (error: any) {
    return error.response.data
  }
}
