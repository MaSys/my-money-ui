import { apiClient } from './api'

export const templateService = {
  // Get all templates for the current profile
  async getTemplates() {
    try {
      const response = await apiClient.get('/templates')
      return response.data
    } catch (error) {
      console.error('Error fetching templates:', error)
      throw error
    }
  },

  // Get a specific template by ID
  async getTemplate(id) {
    try {
      const response = await apiClient.get(`/templates/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching template:', error)
      throw error
    }
  },

  // Create a new template
  async createTemplate(templateData) {
    try {
      const response = await apiClient.post('/templates', templateData)
      return response.data
    } catch (error) {
      console.error('Error creating template:', error)
      throw error
    }
  },

  // Update an existing template
  async updateTemplate(id, templateData) {
    try {
      const response = await apiClient.put(`/templates/${id}`, templateData)
      return response.data
    } catch (error) {
      console.error('Error updating template:', error)
      throw error
    }
  },

  // Delete a template
  async deleteTemplate(id) {
    try {
      const response = await apiClient.delete(`/templates/${id}`)
      return response.data
    } catch (error) {
      console.error('Error deleting template:', error)
      throw error
    }
  }
} 