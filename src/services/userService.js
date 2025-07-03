import { apiClient, handleApiResponse, handleApiError } from './api'

export const userService = {
  // Get current user profile
  async getCurrentUser() {
    try {
      const response = await apiClient.get('/users/me')
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get all users (admin only)
  async getUsers(params = {}) {
    try {
      const response = await apiClient.get('/users', { params })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get specific user by ID
  async getUser(id) {
    try {
      const response = await apiClient.get(`/users/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Update user profile
  async updateUser(id, userData) {
    try {
      const response = await apiClient.put(`/users/${id}`, {
        user: userData
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Update current user profile
  async updateCurrentUser(userData) {
    try {
      const response = await apiClient.put('/users/me', {
        user: userData
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Delete user account
  async deleteUser(id) {
    try {
      const response = await apiClient.delete(`/users/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Change password
  async changePassword(passwordData) {
    try {
      const response = await apiClient.patch('/users/me/password', {
        user: {
          current_password: passwordData.currentPassword,
          password: passwordData.newPassword,
          password_confirmation: passwordData.confirmPassword
        }
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  }
} 