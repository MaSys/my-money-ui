import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token and CSRF token
api.interceptors.request.use(
  (config) => {
    // Add authentication token if available
    const authStore = useAuthStore()
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`
    }

    // Add CSRF token for Rails (if using cookies)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      })
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      })
    }
    return response
  },
  (error) => {
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      })
    }

    // Handle specific error cases
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - clear auth and redirect to login
          console.warn('Authentication failed - redirecting to login')
          const authStore = useAuthStore()
          authStore.logout()
          // Only redirect if not already on auth pages
          if (!window.location.pathname.includes('login') && 
              !window.location.pathname.includes('signup') && 
              !window.location.pathname.includes('reset-password')) {
            window.location.href = '/login'
          }
          break
          
        case 403:
          console.warn('Access forbidden')
          break
          
        case 404:
          console.warn('Resource not found')
          break
          
        case 422:
          // Validation errors from Rails
          console.warn('Validation errors:', data.errors)
          break
          
        case 500:
          console.error('Server error')
          break
          
        default:
          console.error('Unexpected error:', status, data)
      }
    } else if (error.request) {
      // Network error
      console.error('Network error - no response received')
    } else {
      // Request setup error
      console.error('Request setup error:', error.message)
    }

    return Promise.reject(error)
  }
)

// Generic API methods
export const apiClient = {
  // GET request
  get: (url, config = {}) => api.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => api.delete(url, config),
}

// Utility functions for handling Rails responses
export const handleApiResponse = (response) => {
  return {
    data: response.data,
    status: response.status,
    success: response.status >= 200 && response.status < 300
  }
}

export const handleApiError = (error) => {
  const response = error.response
  
  if (response) {
    return {
      error: response.data?.error || response.data?.message || 'An error occurred',
      errors: response.data?.errors || {},
      status: response.status,
      success: false
    }
  }
  
  return {
    error: error.message || 'Network error',
    errors: {},
    status: null,
    success: false
  }
}

export default api 
