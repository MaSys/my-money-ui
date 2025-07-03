import { apiClient, handleApiResponse, handleApiError } from './api'

export const transactionService = {
  // Get all transactions with filtering and pagination
  async getTransactions(params = {}) {
    try {
      const response = await apiClient.get('/transactions', { params })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Refresh transactions data (useful after profile switch)
  async refreshTransactions(params = {}) {
    try {
      const response = await apiClient.get('/transactions/refresh', { params })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get specific transaction by ID
  async getTransaction(id) {
    try {
      const response = await apiClient.get(`/transactions/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Create new transaction
  async createTransaction(transactionData) {
    try {
      const response = await apiClient.post('/transactions', {
        transaction: transactionData
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Update existing transaction
  async updateTransaction(id, transactionData) {
    try {
      const response = await apiClient.put(`/transactions/${id}`, {
        transaction: transactionData
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Delete transaction
  async deleteTransaction(id) {
    try {
      const response = await apiClient.delete(`/transactions/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get transaction categories
  async getCategories() {
    try {
      const response = await apiClient.get('/transactions/categories')
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get transaction statistics
  async getTransactionStats(params = {}) {
    try {
      const response = await apiClient.get('/transactions/stats', { params })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Search transactions
  async searchTransactions(query, params = {}) {
    try {
      const response = await apiClient.get('/transactions/search', {
        params: { q: query, ...params }
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  }
} 