<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-secondary-900">Accounts</h1>
      <!--
      <button
        @click="handleRefresh"
        :disabled="isRefreshing"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        <span v-if="isRefreshing">Refreshing...</span>
        <span v-else>Refresh</span>
      </button>
      -->
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="account in accounts"
        :key="account.id"
        @click="selectAccount(account)"
        class="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white"
              :class="getAccountColorClass(account.color)"
            >
              <i :class="getAccountIcon(account.icon)" class="text-lg"></i>
            </div>
            <div>
              <h3 class="text-lg font-medium text-secondary-900">
                {{ account.name }}
              </h3>
              <p class="text-sm text-secondary-500 capitalize">
                {{ account.account_type.replace('_', ' ') }}
              </p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-sm text-secondary-600">Balance</span>
            <span
              class="text-sm font-medium"
              :class="account.balance >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatCurrency(account.balance / 100) }}
            </span>
          </div>
          
          <div v-if="account.reconcile" class="flex justify-between">
            <span class="text-sm text-secondary-600">Cleared Balance</span>
            <span
              class="text-sm font-medium"
              :class="account.cleared_balance >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              {{ formatCurrency(account.cleared_balance / 100) }}
            </span>
          </div>

          <div v-if="account.limit > 0" class="flex justify-between">
            <span class="text-sm text-secondary-600">Limit</span>
            <span class="text-sm text-secondary-900">
              {{ formatCurrency(account.limit / 100) }}
            </span>
          </div>

          <div class="flex justify-between">
            <span class="text-sm text-secondary-600">Last Updated</span>
            <span class="text-sm text-secondary-900">
              {{ formatDate(account.updated_at) }}
            </span>
          </div>
        </div>

        <div v-if="account.reconcile" class="mt-2">
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
            <CheckCircleIcon class="w-3 h-3 mr-1" />
            Reconcilable
          </span>
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
import { useRouter } from 'vue-router'
import {
  BanknotesIcon,
  PlusIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useProfileData } from '@/composables/useProfileData'
import { apiClient } from '@/services/api'

const router = useRouter()

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
    
    if (response.data) {
      accounts.value = response.data || []
    } else {
      console.error('Failed to fetch accounts')
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

const selectAccount = (account) => {
  router.push(`/accounts/${account.id}`)
}

const createAccount = () => {
  console.log('Create account for profile:', currentProfile.value?.name)
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

// Load initial data
onMounted(() => {
  fetchAccounts()
})
</script> 
