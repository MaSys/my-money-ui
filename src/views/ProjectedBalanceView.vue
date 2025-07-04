<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-secondary-900">Projected Balance Report</h1>
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
        <h2 class="text-lg font-semibold text-secondary-900">Balance Projection</h2>
        <div v-if="reportData" class="text-sm text-secondary-600">
          Showing {{ Object.keys(reportData).length }} days
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
        <h3 class="text-sm font-medium text-secondary-700 mb-2">Starting Balance</h3>
        <p class="text-2xl font-bold text-green-600">{{ formatCurrency(startingBalance) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-secondary-700 mb-2">Ending Balance</h3>
        <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(endingBalance) }}</p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-secondary-700 mb-2">Total Change</h3>
        <p class="text-2xl font-bold" :class="totalChange >= 0 ? 'text-green-600' : 'text-red-600'">
          {{ formatCurrency(totalChange) }}
        </p>
      </div>
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-sm font-medium text-secondary-700 mb-2">Lowest Point</h3>
        <p class="text-2xl font-bold text-orange-600">{{ formatCurrency(lowestBalance) }}</p>
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
  () => currentProfile.value?.id,
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
const startingBalance = computed(() => {
  if (!reportData.value) return 0
  const dates = Object.keys(reportData.value).sort()
  return dates.length > 0 ? reportData.value[dates[0]] / 100 : 0
})

const endingBalance = computed(() => {
  if (!reportData.value) return 0
  const dates = Object.keys(reportData.value).sort()
  return dates.length > 0 ? reportData.value[dates[dates.length - 1]] / 100 : 0
})

const totalChange = computed(() => {
  return endingBalance.value - startingBalance.value
})

const lowestBalance = computed(() => {
  if (!reportData.value) return 0
  const balances = Object.values(reportData.value).map(balance => balance / 100)
  return Math.min(...balances)
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
    const response = await reportService.getProjectedBalance({
      accountIds: selectedAccountIds.value,
      startDate: startDate.value,
      endDate: endDate.value,
      merged: true
    })

    if (response && typeof response === 'object' && Object.keys(response).length > 0) {
      reportData.value = response
    } else {
      console.warn('Invalid or empty response:', response)
      error.value = 'No data returned from API'
    }
  } catch (err) {
    error.value = 'Failed to load report data'
    console.error('Error loading report:', err)
    console.error('Error details:', err.response?.data || err.message)
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

  // Prepare data for chart
  const dates = Object.keys(reportData.value).sort()
  const balances = dates.map(date => reportData.value[date] / 100) // Convert from cents to dollars

  const chartLabels = dates.map(date => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = date.split('-').map(Number)
    const d = new Date(year, month - 1, day) // month is 0-indexed
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  try {
    // Create new chart
    chartInstance = new Chart(chartCanvas.value, {
      type: 'line',
      data: {
        labels: chartLabels,
              datasets: [{
        label: 'Projected Balance',
        data: balances,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 8,
        pointHitRadius: 15, // Larger hit area for easier hovering
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: 'white',
        pointBorderWidth: 2
      }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(value)
              }
            }
          },
          x: {
            ticks: {
              maxTicksLimit: 10
            }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              title: function(context) {
                return context[0].label
              },
              label: function(context) {
                return 'Balance: ' + new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: 'USD'
                }).format(context.parsed.y)
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
  // Auto-load report on mount only if we have both accounts and profile
  if (accounts.value.length > 0) {
    await loadReport()
  }
})
</script> 
