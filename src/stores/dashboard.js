import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transactionService } from '@/services/transactionService'
import { userService } from '@/services/userService'
import { accountService } from '@/services/accountService'
import { reportService } from '@/services/reportService'

export const useDashboardStore = defineStore('dashboard', () => {
  // State
  const transactions = ref([])
  const accounts = ref([])
  const stats = ref({
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0
  })
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const recentTransactions = computed(() => 
    transactions.value.slice(0, 5)
  )

  const balanceFormatted = computed(() => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(stats.value.totalBalance)
  )

  const incomeFormatted = computed(() => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(stats.value.monthlyIncome)
  )

  const expensesFormatted = computed(() => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(stats.value.monthlyExpenses)
  )

  const savingsFormatted = computed(() => 
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(stats.value.monthlySavings)
  )

  // Actions
  const fetchDashboardData = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Fetch accounts first to calculate total balance
      const accountsResponse = await accountService.getAccounts()
      
      if (accountsResponse.success) {
        accounts.value = accountsResponse.data || []
      }

      // Fetch transactions
      const transactionsResponse = await transactionService.getTransactions({
        planned: true
      })
      
      if (transactionsResponse.success) {
        transactions.value = transactionsResponse.data || []
      }

      // Get current month date range
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      // Format dates for API
      const startDate = startOfMonth.toISOString().split('T')[0]
      const endDate = endOfMonth.toISOString().split('T')[0]
      
      // Fetch income/expenses report for current month
      let monthlyIncome = 0
      let monthlyExpenses = 0
      
      try {
        const incomeExpensesData = await reportService.getIncomeExpensesReport({
          startDate,
          endDate
        })
        
        if (incomeExpensesData) {
          // Convert from cents to dollars
          monthlyIncome = Math.abs(incomeExpensesData.income || 0) / 100
          monthlyExpenses = Math.abs(incomeExpensesData.expense || 0) / 100
        }
      } catch (error) {
        console.error('Error fetching income/expenses report:', error)
        // Keep defaults of 0
      }
      
      // Calculate total balance using account data
      const calculatedTotalBalance = accountService.calculateTotalBalance(accounts.value)
      
      // Calculate monthly savings (income - expenses)
      const monthlySavings = monthlyIncome - monthlyExpenses
      
      stats.value = {
        totalBalance: calculatedTotalBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlySavings
      }

      return { success: true }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const refreshData = async () => {
    return await fetchDashboardData()
  }

  const addTransaction = (transaction) => {
    transactions.value.unshift(transaction)
  }

  const updateTransaction = (id, updatedTransaction) => {
    const index = transactions.value.findIndex(t => t.id === id)
    if (index !== -1) {
      transactions.value[index] = updatedTransaction
    }
  }

  const removeTransaction = (id) => {
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  const clearDashboard = () => {
    transactions.value = []
    accounts.value = []
    stats.value = {
      totalBalance: 0,
      monthlyIncome: 0,
      monthlyExpenses: 0,
      monthlySavings: 0
    }
    error.value = null
  }

  return {
    // State
    transactions,
    accounts,
    stats,
    loading,
    error,
    
    // Computed
    recentTransactions,
    balanceFormatted,
    incomeFormatted,
    expensesFormatted,
    savingsFormatted,
    
    // Actions
    fetchDashboardData,
    refreshData,
    addTransaction,
    updateTransaction,
    removeTransaction,
    clearDashboard
  }
}) 
