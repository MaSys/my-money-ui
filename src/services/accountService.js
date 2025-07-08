import { apiClient, handleApiResponse, handleApiError } from './api'

export const accountService = {
  // Get all accounts for the current profile
  async getAccounts() {
    try {
      const response = await apiClient.get('/accounts')
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Get specific account by ID
  async getAccount(id) {
    try {
      const response = await apiClient.get(`/accounts/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Create new account
  async createAccount(accountData) {
    try {
      const response = await apiClient.post('/accounts', {
        account: accountData
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Update existing account
  async updateAccount(id, accountData) {
    try {
      const response = await apiClient.put(`/accounts/${id}`, {
        account: accountData
      })
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Delete account
  async deleteAccount(id) {
    try {
      const response = await apiClient.delete(`/accounts/${id}`)
      return handleApiResponse(response)
    } catch (error) {
      return handleApiError(error)
    }
  },

  // Calculate total balance based on account types
  calculateTotalBalance(accounts) {
    if (!accounts || accounts.length === 0) {
      return 0
    }

    let totalBalance = 0

    accounts.forEach(account => {
      // Determine which balance to use (cleared_balance if reconcilable, otherwise balance)
      const balanceToUse = account.reconcile ? account.cleared_balance : account.balance
      
      // Convert from cents to dollars for calculation
      const balanceInDollars = balanceToUse / 100
      totalBalance += balanceInDollars
    })

    return totalBalance
  }
} 
