import { apiClient, handleApiResponse, handleApiError } from './api'

export const profileService = {
  // Get all profiles for current user
  async getProfiles() {
    try {
      const response = await apiClient.get('/profiles')
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get specific profile by ID
  async getProfile(id) {
    try {
      const response = await apiClient.get(`/profiles/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Create new profile
  async createProfile(profileData) {
    try {
      const response = await apiClient.post('/profiles', {
        profile: profileData
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Update existing profile
  async updateProfile(id, profileData) {
    try {
      const response = await apiClient.put(`/profiles/${id}`, {
        profile: profileData
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Delete profile
  async deleteProfile(id) {
    try {
      const response = await apiClient.delete(`/profiles/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Switch to profile (update current profile context)
  async switchProfile(profileId) {
    try {
      const response = await apiClient.post('/profiles/switch', {
        profile_id: profileId
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get profile summary/stats
  async getProfileSummary(profileId) {
    try {
      const response = await apiClient.get(`/profiles/${profileId}/summary`)
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  }
} 