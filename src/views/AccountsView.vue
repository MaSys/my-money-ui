<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-secondary-900">Accounts</h1>
      <button
        @click="handleRefresh"
        :disabled="isRefreshing"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        <span v-if="isRefreshing">Refreshing...</span>
        <span v-else>Refresh</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="account in accounts"
        :key="account.id"
        class="bg-white rounded-lg shadow p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="getAccountTypeColor(account.type)"
            >
              <component
                :is="getAccountIcon(account.type)"
                class="w-5 h-5 text-white"
              />
            </div>
            <div>
              <h3 class="text-lg font-medium text-secondary-900">
                {{ account.name }}
              </h3>
              <p class="text-sm text-secondary-500">
                {{ account.type }}
              </p>
            </div>
          </div>
          <button
            @click="editAccount(account)"
            class="p-1 text-secondary-400 hover:text-secondary-600"
          >
            <PencilIcon class="w-4 h-4" />
          </button>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-secondary-600">Balance</span>
            <span
              class="text-sm font-medium"
              :class="account.balance >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatCurrency(account.balance) }}
            </span>
          </div>
          
          <div class="flex justify-between">
            <span class="text-sm text-secondary-600">Account Number</span>
            <span class="text-sm text-secondary-900">
              {{ maskAccountNumber(account.account_number) }}
            </span>
          </div>

          <div class="flex justify-between">
            <span class="text-sm text-secondary-600">Last Updated</span>
            <span class="text-sm text-secondary-900">
              {{ formatDate(account.updated_at) }}
            </span>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-secondary-200">
          <div class="flex space-x-2">
            <button
              @click="viewTransactions(account)"
              class="flex-1 px-3 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
            >
              View Transactions
            </button>
            <button
              @click="transferFunds(account)"
              class="flex-1 px-3 py-2 text-sm text-secondary-600 bg-secondary-50 rounded-lg hover:bg-secondary-100"
            >
              Transfer
            </button>
          </div>
        </div>
      </div>

      <!-- Add Account Card -->
      <div
        @click="createAccount"
        class="bg-white rounded-lg shadow p-6 border-2 border-dashed border-secondary-300 hover:border-primary-500 cursor-pointer transition-colors"
      >
        <div class="flex flex-col items-center justify-center h-full text-center">
          <PlusIcon class="w-8 h-8 text-secondary-400 mb-2" />
          <h3 class="text-lg font-medium text-secondary-900 mb-1">
            Add Account
          </h3>
          <p class="text-sm text-secondary-500">
            Create a new account to track
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
    </div>

    <!-- Empty State -->
    <div v-if="!loading && accounts.length === 0" class="text-center py-12">
      <BanknotesIcon class="w-12 h-12 text-secondary-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-secondary-900 mb-2">No accounts found</h3>
      <p class="text-secondary-500 mb-4">
        No accounts found for the current profile: {{ currentProfile?.name }}
      </p>
      <button
        @click="createAccount"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
      >
        Create Your First Account
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  PiggyBankIcon,
  PencilIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import { useProfileData } from '@/composables/useProfileData'
import { apiClient } from '@/services/api'

// State
const accounts = ref([])
const loading = ref(false)

// Set up automatic refresh when profile changes
const { isRefreshing, currentProfile } = useProfileData(fetchAccounts)

// Fetch accounts for current profile
async function fetchAccounts() {
  loading.value = true
  
  try {
    const response = await apiClient.get('/accounts')
    
    if (response.data.success) {
      accounts.value = response.data.data.accounts || []
      console.log(`Loaded ${accounts.value.length} accounts for profile:`, currentProfile.value?.name)
    } else {
      console.error('Failed to fetch accounts:', response.data.error)
      accounts.value = []
    }
  } catch (error) {
    console.error('Error fetching accounts:', error)
    accounts.value = []
  } finally {
    loading.value = false
  }
}

// Actions
const handleRefresh = () => {
  fetchAccounts()
}

const createAccount = () => {
  // Navigate to create account page or open modal
  console.log('Create account for profile:', currentProfile.value?.name)
}

const editAccount = (account) => {
  console.log('Edit account:', account.name)
}

const viewTransactions = (account) => {
  console.log('View transactions for account:', account.name)
}

const transferFunds = (account) => {
  console.log('Transfer funds from account:', account.name)
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

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return 'N/A'
  const visible = accountNumber.slice(-4)
  return `****${visible}`
}

const getAccountTypeColor = (type) => {
  const colors = {
    checking: 'bg-blue-500',
    savings: 'bg-green-500',
    credit: 'bg-red-500',
    investment: 'bg-purple-500'
  }
  return colors[type] || 'bg-gray-500'
}

const getAccountIcon = (type) => {
  const icons = {
    checking: BanknotesIcon,
    savings: PiggyBankIcon,
    credit: CreditCardIcon,
    investment: BuildingLibraryIcon
  }
  return icons[type] || BanknotesIcon
}

// Load initial data
onMounted(() => {
  fetchAccounts()
})
</script> 