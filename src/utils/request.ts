import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'

// Create axios instance - use /api as base in all cases since mock is configured for this
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api', // Base URL for API requests
  timeout: 10000, // Request timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
request.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // Add token or other headers here if needed
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
request.interceptors.response.use(
  (response: AxiosResponse) => {
    // Handle successful responses
    return response.data
  },
  (error) => {
    // Handle error responses
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    // Return error with readable message
    return Promise.reject(error)
  }
)

export default request