import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  baseURL: import.meta.env.VITE_APP_API_BASE_URL,
  timeout: 10000,
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return response
    }
    return Promise.reject(new Error(response.statusText))
  },
  (error: AxiosError) => {
    const { response } = error

    const message =
      (response?.data as { message?: string } | undefined)?.message ||
      error.message ||
      '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
