<template>
  <div class="space-y-6">
          <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="goBack"
            class="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
          >
            <ArrowLeftIcon class="w-5 h-5" />
          </button>
          <div v-if="account" class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white"
              :class="getAccountColorClass(account.color)"
            >
              <i :class="getAccountIcon(account.icon)" class="text-lg"></i>
            </div>
            <div>
              <h1 class="text-2xl font-bold text-secondary-900">{{ account.name }}</h1>
              <p class="text-sm text-secondary-500">
                Balance: {{ formatCurrency(account.balance / 100) }}
                <span v-if="account.reconcile" class="ml-2">
                  • Cleared: {{ formatCurrency(account.cleared_balance / 100) }}
                </span>
              </p>
            </div>
          </div>
          <div v-else class="animate-pulse">
            <div class="h-8 bg-gray-300 rounded w-48"></div>
            <div class="h-4 bg-gray-300 rounded w-32 mt-2"></div>
          </div>
        </div>
        <div class="flex space-x-3">
          <button
            @click="createTransaction"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <PlusIcon class="w-4 h-4 mr-2 inline" />
            Add Transaction
          </button>
          <button
            @click="fetchAccountTransactions"
            :disabled="loadingTransactions"
            class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
          >
            <span v-if="loadingTransactions">Refreshing...</span>
            <span v-else>Refresh</span>
          </button>
        </div>
      </div>

    <!-- Date Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-secondary-900 mb-4">Filter Transactions</h3>
      
      <!-- Quick Date Filters -->
      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="filter in quickDateFilters"
          :key="filter.key"
          @click="applyQuickFilter(filter)"
          :class="activeQuickFilter === filter.key ? 'bg-primary-600 text-white' : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'"
          class="px-3 py-2 text-sm rounded-lg transition-colors"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Custom Date Range -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1">Start Date</label>
          <input
            v-model="dateFilters.startDate"
            type="date"
            @change="applyDateFilter"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-1">End Date</label>
          <input
            v-model="dateFilters.endDate"
            type="date"
            @change="applyDateFilter"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <!-- Cleared Filter (for reconcilable accounts) -->
      <div v-if="account && account.reconcile" class="flex items-center space-x-4">
        <label class="flex items-center">
          <input
            v-model="showAllTransactions"
            type="radio"
            :value="true"
            @change="applyDateFilter"
            class="mr-2"
          />
          All Transactions
        </label>
        <label class="flex items-center">
          <input
            v-model="showAllTransactions"
            type="radio"
            :value="false"
            @change="applyDateFilter"
            class="mr-2"
          />
          Not Cleared Only
        </label>
      </div>
    </div>

    <!-- Transactions List -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-secondary-200">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-secondary-900">
            Transactions 
            <span class="text-sm text-secondary-500">
              ({{ accountTransactions.length }})
            </span>
          </h3>
          <div class="text-sm text-secondary-500">
            Total: {{ formatCurrency(transactionTotal) }}
          </div>
        </div>
      </div>

      <div class="divide-y divide-secondary-200">
        <TransactionRow
          v-for="transaction in accountTransactions"
          :key="transaction.id"
          :transaction="transaction"
          :is-paid="transaction.paid"
          @transaction-updated="handleTransactionUpdated"
          @transaction-deleted="handleTransactionDeleted"
        />

        <div v-if="loadingTransactions" class="px-6 py-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
          <p class="mt-2 text-sm text-secondary-500">Loading transactions...</p>
        </div>

        <div v-if="!loadingTransactions && accountTransactions.length === 0" class="px-6 py-8 text-center">
          <p class="text-secondary-500">No transactions found for the selected filters.</p>
        </div>
      </div>
    </div>

    <!-- Account not found -->
    <div v-if="!loading && !account" class="text-center py-12">
      <div class="text-secondary-500">
        <p class="text-lg font-medium mb-2">Account not found</p>
        <p class="mb-4">The account you're looking for doesn't exist or you don't have access to it.</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Go Back to Accounts
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { apiClient } from '@/services/api'
import { useProfileData } from '@/composables/useProfileData'
import TransactionRow from '@/components/TransactionRow.vue'

const route = useRoute()
const router = useRouter()

// State
const account = ref(null)
const loading = ref(false)
const accountTransactions = ref([])
const loadingTransactions = ref(false)
const activeQuickFilter = ref('thisMonth')
const showAllTransactions = ref(true)

// Date filters
const dateFilters = ref({
  startDate: '',
  endDate: ''
})

// Set up profile data composable
const { currentProfile } = useProfileData()

// Quick date filter options
const quickDateFilters = [
  {
    key: 'lastWeek',
    label: 'Last Week',
    getDateRange: () => {
      const end = new Date()
      end.setDate(end.getDate() - 1) // Yesterday
      const start = new Date()
      start.setDate(start.getDate() - 7) // 7 days ago
      return { start, end }
    }
  },
  {
    key: 'thisMonth',
    label: 'This Month',
    getDateRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      return { start, end }
    }
  },
  {
    key: 'lastMonth',
    label: 'Last Month',
    getDateRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 0)
      return { start, end }
    }
  },
  {
    key: 'thisYear',
    label: 'This Year',
    getDateRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear(), 0, 1)
      const end = new Date(now.getFullYear(), 11, 31)
      return { start, end }
    }
  },
  {
    key: 'lastYear',
    label: 'Last Year',
    getDateRange: () => {
      const now = new Date()
      const start = new Date(now.getFullYear() - 1, 0, 1)
      const end = new Date(now.getFullYear() - 1, 11, 31)
      return { start, end }
    }
  }
]

// Computed
const transactionTotal = computed(() => {
  return accountTransactions.value.reduce((sum, t) => sum + (t.amount / 100), 0)
})

// Fetch account details
async function fetchAccount() {
  loading.value = true
  
  try {
    const response = await apiClient.get(`/accounts/${route.params.id}`)
    
    if (response.data) {
      account.value = response.data
    } else {
      console.error('Failed to fetch account')
      account.value = null
    }
  } catch (error) {
    console.error('Error fetching account:', error)
    account.value = null
  } finally {
    loading.value = false
  }
}

// Fetch transactions for the account
async function fetchAccountTransactions() {
  if (!account.value) return

  loadingTransactions.value = true
  
  try {
    const params = {
      account_id: account.value.id,
      paid: true,
      start_date: dateFilters.value.startDate,
      end_date: dateFilters.value.endDate
    }

    // Add cleared filter for reconcilable accounts
    if (account.value.reconcile && !showAllTransactions.value) {
      params.cleared = false
    }

    const response = await apiClient.get('/transactions', { params })
    
    if (response.data) {
      accountTransactions.value = response.data || []
    } else {
      console.error('Failed to fetch account transactions')
      accountTransactions.value = []
    }
  } catch (error) {
    console.error('Error fetching account transactions:', error)
    accountTransactions.value = []
  } finally {
    loadingTransactions.value = false
  }
}

// Actions
const goBack = () => {
  router.push('/accounts')
}

const createTransaction = () => {
  router.push(`/transactions/create?account_id=${route.params.id}`)
}

const applyQuickFilter = (filter) => {
  activeQuickFilter.value = filter.key
  const { start, end } = filter.getDateRange()
  dateFilters.value.startDate = start.toISOString().split('T')[0]
  dateFilters.value.endDate = end.toISOString().split('T')[0]
  fetchAccountTransactions()
}

const applyDateFilter = () => {
  activeQuickFilter.value = null
  fetchAccountTransactions()
}

// Transaction event handlers
const handleTransactionUpdated = (updatedTransaction) => {
  const index = accountTransactions.value.findIndex(t => t.id === updatedTransaction.id)
  if (index !== -1) {
    accountTransactions.value[index] = updatedTransaction
  }
}

const handleTransactionDeleted = (transactionId) => {
  accountTransactions.value = accountTransactions.value.filter(t => t.id !== transactionId)
}

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const getAccountColorClass = (color) => {
  const colorMap = {
    'cp_red': 'bg-red-500',
    'cp_blue': 'bg-blue-500',
    'cp_green': 'bg-green-500',
    'cp_yellow': 'bg-yellow-500',
    'cp_purple': 'bg-purple-500',
    'cp_orange': 'bg-orange-500',
    'cp_pink': 'bg-pink-500',
    'cp_gray': 'bg-gray-500',
    'cp_white': 'bg-gray-400'
  }
  return colorMap[color] || 'bg-gray-500'
}

const getAccountIcon = (icon) => {
  return `fa-solid fa-${icon} fa-xl`
}

// Watchers
//watch(() => route.params.id, (newId) => {
//  if (newId) {
//    fetchAccount()
//  }
//}, { immediate: true })

//watch(() => currentProfile.value, () => {
//  if (currentProfile.value && account.value) {
//    fetchAccount()
//  }
//}, { deep: true })

// Load initial data
onMounted(async () => {
  await fetchAccount()
  if (account.value) {
    // Set default to current month
    applyQuickFilter(quickDateFilters.find(f => f.key === 'thisMonth'))
  }
})
</script> 
