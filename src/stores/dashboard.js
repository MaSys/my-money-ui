import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { transactionService } from '@/services/transactionService'
import { userService } from '@/services/userService'

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
      // Fetch transactions
      const transactionsResponse = await transactionService.getTransactions({
        limit: 10,
        order: 'desc'
      })
      
      if (transactionsResponse.success) {
        transactions.value = transactionsResponse.data.transactions || []
      }

      // Fetch transaction stats
      const statsResponse = await transactionService.getTransactionStats()
      
      if (statsResponse.success) {
        stats.value = {
          totalBalance: statsResponse.data.total_balance || 0,
          monthlyIncome: statsResponse.data.monthly_income || 0,
          monthlyExpenses: statsResponse.data.monthly_expenses || 0,
          monthlySavings: statsResponse.data.monthly_savings || 0
        }
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
