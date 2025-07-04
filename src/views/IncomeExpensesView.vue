<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-secondary-900">Income & Expenses Report</h1>
    </div>

    <!-- Date Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex flex-wrap gap-4 items-end">
        <div class="flex-1 min-w-48">
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Start Date
          </label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div class="flex-1 min-w-48">
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            End Date
          </label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div class="flex-1 min-w-48">
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Accounts
          </label>
          <select
            v-model="selectedAccountIds"
            multiple
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option
              v-for="account in accounts"
              :key="account.id"
              :value="account.id"
            >
              {{ account.name }}
            </option>
          </select>
        </div>
        <div class="flex space-x-2">
          <button
            @click="loadReport"
            :disabled="isLoading"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <span v-if="isLoading">Loading...</span>
            <span v-else>Generate Report</span>
          </button>
          <button
            @click="selectAllAccounts"
            type="button"
            class="px-4 py-2 text-primary-600 bg-primary-100 rounded-lg hover:bg-primary-200"
          >
            Select All
          </button>
        </div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-secondary-900">Income vs Expenses</h2>
        <div v-if="reportData" class="text-sm text-secondary-600">
          {{ formatDateRange(startDate, endDate) }}
        </div>
      </div>
      
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
      
      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
      </div>
      
      <div v-else-if="!reportData" class="text-center py-12">
        <p class="text-secondary-600">Select date range and accounts to generate report</p>
      </div>
      
      <div v-else class="relative h-96">
        <canvas ref="chartCanvas" class="w-full h-full"></canvas>
      </div>
    </div>

    <!-- Summary Stats -->
    <div v-if="reportData" class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-secondary-700 mb-2">Total Income</h3>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(totalIncome) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-secondary-700 mb-2">Total Expenses</h3>
        <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalExpenses) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-secondary-700 mb-2">Net Income</h3>
        <p class="text-2xl font-bold" :class="netIncome >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ formatCurrency(netIncome) }}
        </p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-secondary-700 mb-2">Avg Daily Net</h3>
        <p class="text-2xl font-bold" :class="avgDailyNet >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ formatCurrency(avgDailyNet) }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { apiClient } from '@/services/api'
import { reportService } from '@/services/reportService'
import { useProfileData } from '@/composables/useProfileData'

// Register Chart.js components
Chart.register(...registerables)

// Set up profile data composable
const { currentProfile } = useProfileData()

// Watch for profile changes to re-load data
watch(
  () => currentProfile?.value?.id,
  async (newProfileId, oldProfileId) => {
    if (newProfileId && newProfileId !== oldProfileId) {
      if (accounts.value.length > 0) {
        await loadReport()
      }
    }
  }
)

// State
const accounts = ref([])
const selectedAccountIds = ref([])
const startDate = ref('')
const endDate = ref('')
const reportData = ref(null)
const isLoading = ref(false)
const error = ref('')
const chartCanvas = ref(null)
let chartInstance = null

// Computed properties
const totalIncome = computed(() => {
  if (!reportData.value) return 0
  return (reportData.value.income || 0) / 100
})

const totalExpenses = computed(() => {
  if (!reportData.value) return 0
  // API returns expense as negative number, so we make it positive for display
  return Math.abs(reportData.value.expense || 0) / 100
})

const netIncome = computed(() => {
  return totalIncome.value - totalExpenses.value
})

const avgDailyNet = computed(() => {
  if (!reportData.value || !startDate.value || !endDate.value) return 0
  // Calculate number of days between start and end date
  const start = new Date(startDate.value)
  const end = new Date(endDate.value)
  const timeDiff = end.getTime() - start.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1
  return daysDiff > 0 ? netIncome.value / daysDiff : 0
})

// Initialize dates with current month
const initializeDates = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  
  // First day of current month
  const firstDay = new Date(year, month, 1)
  startDate.value = firstDay.toISOString().split('T')[0]
  
  // Last day of current month
  const lastDay = new Date(year, month + 1, 0)
  endDate.value = lastDay.toISOString().split('T')[0]
}

// Fetch accounts
const fetchAccounts = async () => {
  try {
    const response = await apiClient.get('/accounts')
    
    if (response.data) {
      accounts.value = response.data || []
      // Select all accounts by default
      selectedAccountIds.value = accounts.value.map(account => account.id)
    } else {
      console.warn('No accounts data in response')
    }
  } catch (error) {
    console.error('Error fetching accounts:', error)
    error.value = 'Failed to load accounts'
  }
}

// Select all accounts
const selectAllAccounts = () => {
  selectedAccountIds.value = accounts.value.map(account => account.id)
}

// Load report data
const loadReport = async () => {
  if (!startDate.value || !endDate.value) {
    error.value = 'Please select both start and end dates'
    return
  }

  if (selectedAccountIds.value.length === 0) {
    error.value = 'Please select at least one account'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    const response = await reportService.getIncomeExpensesReport({
      accountIds: selectedAccountIds.value,
      startDate: startDate.value,
      endDate: endDate.value,
      merged: true
    })

    if (response && typeof response === 'object' && (response.income !== undefined || response.expense !== undefined)) {
      reportData.value = response
    } else {
      console.warn('Invalid or empty response:', response)
      error.value = 'No data returned from API'
    }
  } catch (err) {
    error.value = 'Failed to load report data'
    console.error('Error loading report:', err)
  } finally {
    isLoading.value = false
  }
}

// Create chart
const createChart = () => {
  if (!chartCanvas.value) {
    console.error('Chart canvas not found')
    return
  }

  if (!reportData.value) {
    console.error('No report data available')
    return
  }

  // Destroy existing chart
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }

  // Prepare data for chart - simple comparison of income vs expenses
  const income = (reportData.value.income || 0) / 100
  const expenses = Math.abs(reportData.value.expense || 0) / 100

  try {
    // Create new chart
    chartInstance = new Chart(chartCanvas.value, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [
          {
            label: 'Amount',
            data: [income, expenses],
            backgroundColor: [
              'rgba(34, 197, 94, 0.8)',   // Green for income
              'rgba(239, 68, 68, 0.8)'    // Red for expenses
            ],
            borderColor: [
              'rgb(34, 197, 94)',
              'rgb(239, 68, 68)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false // Hide legend since colors are self-explanatory
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(context.parsed.y)
                return `${context.label}: ${value}`
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(value)
              }
            }
          }
        }
      }
    })
  } catch (error) {
    console.error('Error creating chart:', error)
  }
}

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Format date range for display
const formatDateRange = (start, end) => {
  if (!start || !end) return ''
  
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  const options = { 
    month: 'short', 
    day: 'numeric', 
    year: startDate.getFullYear() !== endDate.getFullYear() ? 'numeric' : undefined 
  }
  
  const startFormatted = startDate.toLocaleDateString('en-US', options)
  const endFormatted = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  return `${startFormatted} - ${endFormatted}`
}

// Watch for data changes to recreate chart
watch(
  () => reportData.value,
  (newData) => {
    if (newData) {
      nextTick(() => {
        createChart()
      })
    }
  }
)

// Cleanup chart on unmount
onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy()
    chartInstance = null
  }
})

onMounted(async () => {
  initializeDates()
  await fetchAccounts()
  
  // Auto-load report on mount
  if (accounts.value.length > 0) {
    await loadReport()
  }
})
</script> 
