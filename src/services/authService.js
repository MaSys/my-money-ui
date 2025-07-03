import { apiClient, handleApiResponse, handleApiError } from './api'

export const authService = {
  // Login user
  async login(credentials) {
    try {
      const response = await apiClient.post('/login', {
        email: credentials.email,
        password: credentials.password
      })
      
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Register new user
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        user: {
          email: userData.email,
          password: userData.password,
          password_confirmation: userData.confirmPassword,
          first_name: userData.firstName,
          last_name: userData.lastName
        }
      })
      
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Logout user
  async logout() {
    try {
      const response = await apiClient.delete('/logout')
      return handleApiResponse(response)
    } catch (error) {
      //return handleApiError(error)
      return handleApiResponse({ status: 204 })
    }
  },

  // Reset password
  async resetPassword(email) {
    try {
      const response = await apiClient.post('/auth/password/reset', {
        user: { email }
      })
      
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Verify token/session
  async verifyToken() {
    try {
      const response = await apiClient.get('/auth/verify')
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Refresh token (if using JWT)
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh')
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  }
} 
