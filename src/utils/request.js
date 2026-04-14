import axios from 'axios'
import { ElMessage } from 'element-plus'

const service = axios.create({
  // baseURL: '/api',
  baseURL: 'https://shasnow.top/s/api',
  timeout: 10000
})

service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    if (response.status === 200) {
      return response
    }
    return Promise.reject(new Error(response.statusText))
  },
  error => {
    const { response } = error
    
    const message = response?.data?.message || error.message || '请求失败'
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default service
