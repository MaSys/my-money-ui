<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-secondary-900">Transactions</h1>
      <button
        @click="handleRefresh"
        :disabled="isRefreshing"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        <span v-if="isRefreshing">Refreshing...</span>
        <span v-else>Refresh</span>
      </button>
    </div>

    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-secondary-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium text-secondary-900">
            Recent Transactions
            <span v-if="currentProfile" class="text-sm text-secondary-500">
              - {{ currentProfile.name }}
            </span>
          </h2>
          <div class="flex items-center space-x-4">
            <select
              v-model="filters.category"
              @change="fetchTransactions"
              class="px-3 py-1 border border-secondary-300 rounded-lg text-sm"
            >
              <option value="">All Categories</option>
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
              <option value="utilities">Utilities</option>
            </select>
            <select
              v-model="filters.type"
              @change="fetchTransactions"
              class="px-3 py-1 border border-secondary-300 rounded-lg text-sm"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
        </div>
      </div>

      <div class="divide-y divide-secondary-200">
        <div
          v-for="transaction in transactions"
          :key="transaction.id"
          class="px-6 py-4 hover:bg-secondary-50"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center"
                :class="transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'"
              >
                <ArrowUpIcon
                  v-if="transaction.type === 'income'"
                  class="w-5 h-5 text-green-600"
                />
                <ArrowDownIcon
                  v-else
                  class="w-5 h-5 text-red-600"
                />
              </div>
              <div>
                <p class="text-sm font-medium text-secondary-900">
                  {{ transaction.description }}
                </p>
                <p class="text-xs text-secondary-500">
                  {{ transaction.category }} • {{ formatDate(transaction.date) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p
                class="text-sm font-medium"
                :class="transaction.type === 'income' ? 'text-green-600' : 'text-red-600'"
              >
                {{ transaction.type === 'income' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
              </p>
              <p class="text-xs text-secondary-500">
                {{ transaction.account }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="loading" class="px-6 py-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
          <p class="mt-2 text-sm text-secondary-500">Loading transactions...</p>
        </div>

        <div v-if="!loading && transactions.length === 0" class="px-6 py-8 text-center">
          <p class="text-secondary-500">No transactions found for this profile.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/vue/24/outline'
import { transactionService } from '@/services/transactionService'
import { useProfileData } from '@/composables/useProfileData'

// State
const transactions = ref([])
const loading = ref(false)
const filters = ref({
  category: '',
  type: ''
})

// Set up automatic refresh when profile changes
const { isRefreshing, currentProfile } = useProfileData(fetchTransactions)

// Fetch transactions
async function fetchTransactions() {
  loading.value = true
  
  try {
    const params = {
      start_date: new Date().toISOString().slice(0,10),
      end_date: new Date().toISOString().slice(0,10),
      paid: true,
      //...filters.value
    }
    
    const response = await transactionService.getTransactions(params)
    
    if (response.success) {
      transactions.value = response.data.transactions || []
      console.log(`Loaded ${transactions.value.length} transactions for profile:`, currentProfile.value?.name)
    } else {
      console.error('Failed to fetch transactions:', response.error)
      transactions.value = []
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
    transactions.value = []
  } finally {
    loading.value = false
  }
}

// Manual refresh
const handleRefresh = () => {
  fetchTransactions()
}

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

// Load initial data
onMounted(() => {
  fetchTransactions()
})
</script> 
