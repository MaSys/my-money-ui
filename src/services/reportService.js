import { apiClient } from './api'

export const reportService = {
  // Get projected balance report
  async getProjectedBalance(options = {}) {
    try {
      const params = new URLSearchParams()
      
      // Add account IDs if provided
      if (options.accountIds && options.accountIds.length > 0) {
        options.accountIds.forEach(accountId => {
          params.append('account_id[]', accountId)
        })
      }
      
      // Add date range
      if (options.startDate) {
        params.append('start_date', options.startDate)
      }
      if (options.endDate) {
        params.append('end_date', options.endDate)
      }
      
      // Add merged flag
      if (options.merged !== undefined) {
        params.append('merged', options.merged)
      }
      
      const response = await apiClient.get(`/reports/projected_balance?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching projected balance report:', error)
      throw error
    }
  },

  // Add other report methods as needed
  async getCashFlowReport(options = {}) {
    try {
      const params = new URLSearchParams()
      
      if (options.startDate) {
        params.append('start_date', options.startDate)
      }
      if (options.endDate) {
        params.append('end_date', options.endDate)
      }
      
      const response = await apiClient.get(`/reports/cash_flow?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching cash flow report:', error)
      throw error
    }
  }
} 