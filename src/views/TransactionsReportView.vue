<template>
  <div class="max-w-7xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-secondary-900">Transactions Report</h1>
    </div>

    <!-- Server-side Filters -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-secondary-900 mb-4">Report Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Start Date
          </label>
          <input
            v-model="startDate"
            type="date"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            End Date
          </label>
          <input
            v-model="endDate"
            type="date"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
        <div>
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
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Categories
          </label>
          <select
            v-model="selectedCategoryIds"
            multiple
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option
              v-for="category in categories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Tag
          </label>
          <select
            v-model="selectedTag"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">All Tags</option>
            <option
              v-for="tag in tags"
              :key="tag"
              :value="tag"
            >
              {{ tag }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex space-x-3 mt-4">
        <button
          @click="loadTransactions"
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
          Select All Accounts
        </button>
        <button
          @click="selectAllCategories"
          type="button"
          class="px-4 py-2 text-primary-600 bg-primary-100 rounded-lg hover:bg-primary-200"
        >
          Select All Categories
        </button>
      </div>
    </div>

    <!-- Client-side Filters -->
    <div v-if="transactions.length > 0" class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-secondary-900 mb-4">Display Filters</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Payment Status
          </label>
          <select
            v-model="paidFilter"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="planned">Planned</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Transaction Type
          </label>
          <select
            v-model="typeFilter"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Cleared Status
          </label>
          <select
            v-model="clearedFilter"
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="all">All</option>
            <option value="cleared">Cleared</option>
            <option value="not-cleared">Not Cleared</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="isLoading" class="bg-white rounded-lg shadow p-6">
      <div class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    </div>
    
    <div v-else-if="error" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-12">
        <p class="text-red-600">{{ error }}</p>
      </div>
    </div>
    
    <div v-else-if="transactions.length === 0 && hasSearched" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-12">
        <p class="text-secondary-600">No transactions found for the selected criteria.</p>
      </div>
    </div>
    
    <div v-else-if="!hasSearched" class="bg-white rounded-lg shadow p-6">
      <div class="text-center py-12">
        <p class="text-secondary-600">Configure your filters and click "Generate Report" to view transactions.</p>
      </div>
    </div>

    <!-- Transactions Table -->
    <div v-if="filteredTransactions.length > 0" class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-6 py-4 border-b border-secondary-200">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-medium text-secondary-900">
            Transactions ({{ filteredTransactions.length }})
          </h3>
          <div class="text-sm text-secondary-600">
            Total: {{ formatCurrency(totalAmount) }}
          </div>
        </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-secondary-200">
          <thead class="bg-secondary-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Account
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Tags
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Amount
              </th>
                                            <th class="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                 Status
               </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-secondary-200">
            <tr v-for="transaction in filteredTransactions" :key="transaction.id" class="hover:bg-secondary-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                {{ formatDate(transaction.due_date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                {{ getAccountName(transaction.account_id) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                {{ getCategoryName(transaction.category_id) }}
              </td>
              <td class="px-6 py-4 text-sm text-secondary-900">
                {{ transaction.description || transaction.notes || '-' }}
              </td>
              <td class="px-6 py-4 text-sm text-secondary-900">
                <div v-if="transaction.tag_list && transaction.tag_list.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="tag in transaction.tag_list"
                    :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                  >
                    {{ tag }}
                  </span>
                </div>
                <span v-else class="text-secondary-400">-</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span :class="transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'">
                  {{ transaction.transaction_type === 'income' ? '+' : '-' }}{{ formatCurrency(Math.abs(transaction.amount) / 100) }}
                </span>
              </td>
                             <td class="px-6 py-4 whitespace-nowrap text-right">
                 <div class="flex items-center justify-end space-x-2">
                   <span
                     v-if="transaction.cleared && transaction.account.reconcile"
                     class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600"
                   >
                     Cleared
                   </span>
                   <span
                     :class="transaction.paid ? 'text-green-600' : 'text-yellow-600'"
                     class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                     :style="{ backgroundColor: transaction.paid ? 'rgb(220 252 231)' : 'rgb(254 249 195)' }"
                   >
                     {{ transaction.paid ? 'Paid' : 'Planned' }}
                   </span>
                   <button
                     v-if="transaction.account.reconcile && !transaction.cleared"
                     @click="markAsCleared(transaction)"
                     :disabled="updatingTransaction === transaction.id"
                     class="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 disabled:opacity-50"
                   >
                     <span v-if="updatingTransaction === transaction.id">...</span>
                     <span v-else>Mark Cleared</span>
                   </button>
                 </div>
               </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { apiClient } from '@/services/api'
import { reportService } from '@/services/reportService'
import { transactionService } from '@/services/transactionService'
import { useProfileData } from '@/composables/useProfileData'

// Set up profile data composable
const { currentProfile } = useProfileData()

// Watch for profile changes to re-load data
watch(
  () => currentProfile?.value?.id,
  async (newProfileId, oldProfileId) => {
    if (newProfileId && newProfileId !== oldProfileId) {
      await Promise.all([fetchAccounts(), fetchCategories(), fetchTags()])
    }
  }
)

// State
const accounts = ref([])
const categories = ref([])
const tags = ref([])
const transactions = ref([])
const selectedAccountIds = ref([])
const selectedCategoryIds = ref([])
const selectedTag = ref('')
const startDate = ref('')
const endDate = ref('')
const isLoading = ref(false)
const error = ref('')
const hasSearched = ref(false)
const updatingTransaction = ref(null)

// Client-side filters
const paidFilter = ref('all')
const typeFilter = ref('all')
const clearedFilter = ref('all')

// Computed properties
const filteredTransactions = computed(() => {
  let filtered = [...transactions.value]

  // Filter by paid status
  if (paidFilter.value === 'paid') {
    filtered = filtered.filter(t => t.paid)
  } else if (paidFilter.value === 'planned') {
    filtered = filtered.filter(t => !t.paid)
  }

  // Filter by transaction type
  if (typeFilter.value === 'income') {
    filtered = filtered.filter(t => t.transaction_type === 'income')
  } else if (typeFilter.value === 'expense') {
    filtered = filtered.filter(t => t.transaction_type === 'expense')
  }

  // Filter by cleared status
  if (clearedFilter.value === 'cleared') {
    filtered = filtered.filter(t => t.cleared)
  } else if (clearedFilter.value === 'not-cleared') {
    filtered = filtered.filter(t => !t.cleared)
  }

  return filtered
})

const totalAmount = computed(() => {
  return filteredTransactions.value.reduce((sum, transaction) => {
    const amount = transaction.amount / 100
    return sum + (transaction.transaction_type === 'income' ? amount : -amount)
  }, 0)
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
    }
  } catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

// Fetch categories
const fetchCategories = async () => {
  try {
    const response = await apiClient.get('/categories')
    if (response.data) {
      categories.value = response.data || []
      // Select all categories by default
      selectedCategoryIds.value = categories.value.map(category => category.id)
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// Fetch tags
const fetchTags = async () => {
  try {
    const response = await reportService.getTags()
    if (response) {
      tags.value = (response || []).map(o => o.name)
    }
  } catch (error) {
    console.error('Error fetching tags:', error)
  }
}

// Helper functions
const selectAllAccounts = () => {
  selectedAccountIds.value = accounts.value.map(account => account.id)
}

const selectAllCategories = () => {
  selectedCategoryIds.value = categories.value.map(category => category.id)
}

const getAccountName = (accountId) => {
  const account = accounts.value.find(a => a.id === accountId)
  return account ? account.name : 'Unknown Account'
}

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'Unknown Category'
}

// Load transactions
const loadTransactions = async () => {
  if (!startDate.value || !endDate.value) {
    error.value = 'Please select both start and end dates'
    return
  }

  isLoading.value = true
  error.value = ''
  hasSearched.value = true

  try {
    const response = await reportService.getTransactionsReport({
      accountIds: selectedAccountIds.value,
      categoryIds: selectedCategoryIds.value,
      startDate: startDate.value,
      endDate: endDate.value,
      tag: selectedTag.value
    })

    if (response && Array.isArray(response)) {
      transactions.value = response
    } else {
      console.warn('Invalid or empty response:', response)
      transactions.value = []
    }
  } catch (err) {
    error.value = 'Failed to load transactions'
    console.error('Error loading transactions:', err)
    transactions.value = []
  } finally {
    isLoading.value = false
  }
}

// Mark transaction as cleared
const markAsCleared = async (transaction) => {
  if (!transaction.account.reconcile || transaction.cleared) {
    return
  }

  updatingTransaction.value = transaction.id

  try {
    const response = await transactionService.updateTransaction(transaction.id, {
      cleared: true
    })

    if (response.success) {
      // Update the transaction in the local list
      const index = transactions.value.findIndex(t => t.id === transaction.id)
      if (index !== -1) {
        transactions.value[index].cleared = true
      }
    } else {
      console.error('Failed to mark transaction as cleared:', response.error)
      alert('Failed to mark transaction as cleared. Please try again.')
    }
  } catch (err) {
    console.error('Error marking transaction as cleared:', err)
    alert('Failed to mark transaction as cleared. Please try again.')
  } finally {
    updatingTransaction.value = null
  }
}

// Format functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

onMounted(async () => {
  initializeDates()
  await Promise.all([fetchAccounts(), fetchCategories(), fetchTags()])
})
</script> 
