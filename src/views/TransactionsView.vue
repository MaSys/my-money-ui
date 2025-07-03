<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-secondary-900">Today's Transactions</h1>
        <p class="text-sm text-secondary-500">
          {{ formatDate(new Date()) }}
          <span v-if="currentProfile" class="ml-2">
            • {{ currentProfile.name }}
          </span>
        </p>
      </div>
      <button
        @click="handleRefresh"
        :disabled="isRefreshing"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
      >
        <span v-if="isRefreshing">Refreshing...</span>
        <span v-else>Refresh</span>
      </button>
    </div>

    <!-- Planned Transactions Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-secondary-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium text-secondary-900">
            Planned Transactions
            <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {{ plannedTransactions.length }}
            </span>
          </h2>
          <div class="text-sm text-secondary-500">
            Total: {{ formatCurrency(plannedTotal) }}
          </div>
        </div>
      </div>

      <div class="divide-y divide-secondary-200">
        <div
          v-for="transaction in plannedTransactions"
          :key="transaction.id"
          class="px-6 py-4 hover:bg-secondary-50 opacity-75"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <!-- Account Icon -->
              <div class="flex items-center space-x-2">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  :class="getAccountColorClass(transaction.account.color)"
                >
                  <i :class="getAccountIcon(transaction.account.icon)"></i>
                </div>
                <!-- Category Icon -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  :class="getCategoryColorClass(transaction.category.category_type)"
                >
                  <i :class="getCategoryIcon(transaction.category.icon)"></i>
                </div>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <p class="text-sm font-medium text-secondary-900">
                    {{ transaction.category.name }}
                  </p>
                  <ClockIcon class="w-4 h-4 text-blue-500" />
                </div>
                <div class="flex items-center space-x-2 mt-1">
                  <p class="text-xs text-secondary-500">
                    {{ transaction.account.name }}
                  </p>
                  <!-- Tags -->
                  <div v-if="transaction.tag_list.length > 0" class="flex space-x-1">
                    <span
                      v-for="tag in transaction.tag_list"
                      :key="tag"
                      class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <p
                class="text-sm font-medium"
                :class="transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatCurrency(Math.abs(transaction.amount / 100)) }}
              </p>
              <p class="text-xs text-secondary-500">
                {{ formatDayMonth(transaction.due_date) }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="loadingPlanned" class="px-6 py-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
          <p class="mt-2 text-sm text-secondary-500">Loading planned transactions...</p>
        </div>

        <div v-if="!loadingPlanned && plannedTransactions.length === 0" class="px-6 py-8 text-center">
          <p class="text-secondary-500">No planned transactions.</p>
        </div>
      </div>
    </div>

    <!-- Paid Transactions Section -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-secondary-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium text-secondary-900">
            Paid Transactions
            <span class="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              {{ paidTransactions.length }}
            </span>
          </h2>
          <div class="text-sm text-secondary-500">
            Total: {{ formatCurrency(paidTotal) }}
          </div>
        </div>
      </div>

      <div class="divide-y divide-secondary-200">
        <div
          v-for="transaction in paidTransactions"
          :key="transaction.id"
          class="px-6 py-4 hover:bg-secondary-50"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <!-- Account Icon -->
              <div class="flex items-center space-x-2">
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  :class="getAccountColorClass(transaction.account.color)"
                >
                  <i :class="getAccountIcon(transaction.account.icon)"></i>
                </div>
                <!-- Category Icon -->
                <div
                  class="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium"
                  :class="getCategoryColorClass(transaction.category.category_type)"
                >
                  <i :class="getCategoryIcon(transaction.category.icon)"></i>
                </div>
              </div>
              
              <div class="flex-1">
                <div class="flex items-center space-x-2">
                  <p class="text-sm font-medium text-secondary-900">
                    {{ transaction.category.name }}
                  </p>
                  <!-- Cleared checkmark -->
                  <CheckCircleIcon
                    v-if="transaction.cleared && transaction.account.reconcile"
                    class="w-4 h-4 text-green-600"
                  />
                </div>
                <div class="flex items-center space-x-2 mt-1">
                  <p class="text-xs text-secondary-500">
                    {{ transaction.account.name }}
                  </p>
                  <!-- Tags -->
                  <div v-if="transaction.tag_list.length > 0" class="flex space-x-1">
                    <span
                      v-for="tag in transaction.tag_list"
                      :key="tag"
                      class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <p
                class="text-sm font-medium"
                :class="transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'"
              >
                {{ formatCurrency(Math.abs(transaction.amount / 100)) }}
              </p>
              <p class="text-xs text-secondary-500">
                {{ formatDayMonth(transaction.due_date) }}
              </p>
            </div>
          </div>
        </div>

        <div v-if="loadingPaid" class="px-6 py-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
          <p class="mt-2 text-sm text-secondary-500">Loading paid transactions...</p>
        </div>

        <div v-if="!loadingPaid && paidTransactions.length === 0" class="px-6 py-8 text-center">
          <p class="text-secondary-500">No paid transactions for today.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { CheckCircleIcon, ClockIcon } from '@heroicons/vue/24/outline'
import { apiClient } from '@/services/api'
import { useProfileData } from '@/composables/useProfileData'

// State
const paidTransactions = ref([])
const plannedTransactions = ref([])
const loadingPaid = ref(false)
const loadingPlanned = ref(false)

// Set up automatic refresh when profile changes
const { isRefreshing, currentProfile } = useProfileData(fetchAllTransactions)

// Computed totals
const paidTotal = computed(() => {
  return paidTransactions.value.reduce((sum, t) => sum + Math.abs(t.amount / 100), 0)
})

const plannedTotal = computed(() => {
  return plannedTransactions.value.reduce((sum, t) => sum + Math.abs(t.amount / 100), 0)
})

// Fetch paid transactions
async function fetchPaidTransactions() {
  loadingPaid.value = true
  
  try {
    const today = new Date().toISOString().slice(0, 10)
    const response = await apiClient.get(`/transactions`, {
      params: {
        start_date: today,
        end_date: today,
        paid: true
      }
    })
    
    if (response.data) {
      paidTransactions.value = response.data || []
    } else {
      console.error('Failed to fetch paid transactions:', response.data.error)
      paidTransactions.value = []
    }
  } catch (error) {
    console.error('Error fetching paid transactions:', error)
    paidTransactions.value = []
  } finally {
    loadingPaid.value = false
  }
}

// Fetch planned transactions
async function fetchPlannedTransactions() {
  loadingPlanned.value = true
  
  try {
    const response = await apiClient.get(`/transactions`, {
      params: {
        planned: true
      }
    })
    
    if (response.data) {
      plannedTransactions.value = response.data || []
    } else {
      console.error('Failed to fetch planned transactions:', response.data)
      plannedTransactions.value = []
    }
  } catch (error) {
    console.error('Error fetching planned transactions:', error)
    plannedTransactions.value = []
  } finally {
    loadingPlanned.value = false
  }
}

// Fetch all transactions
async function fetchAllTransactions() {
  await Promise.all([
    fetchPaidTransactions(),
    fetchPlannedTransactions()
  ])
}

// Manual refresh
const handleRefresh = () => {
  fetchAllTransactions()
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDayMonth = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

// Account and category styling
const getAccountColorClass = (color) => {
  const colorMap = {
    'cp_red': 'bg-red-500',
    'cp_blue': 'bg-blue-500',
    'cp_green': 'bg-green-500',
    'cp_yellow': 'bg-yellow-500',
    'cp_purple': 'bg-purple-500',
    'cp_orange': 'bg-orange-500',
    'cp_pink': 'bg-pink-500',
    'cp_gray': 'bg-gray-500'
  }
  return colorMap[color] || 'bg-gray-500'
}

const getCategoryColorClass = (type) => {
  return type === 'income' ? 'bg-green-500' : 'bg-red-500'
}

const getAccountIcon = (icon) => {
  // Map account icons to FontAwesome or similar classes
  const iconMap = {
    'cc-mastercard': 'fa-brands fa-cc-mastercard',
    'cc-visa': 'fa-brands fa-cc-visa',
    'cc-amex': 'fa-brands fa-cc-amex',
    'university': 'fa-solid fa-university',
    'piggy-bank': 'fa-solid fa-piggy-bank',
    'wallet': 'fa-solid fa-wallet',
    'credit-card': 'fa-solid fa-credit-card'
  }
  return iconMap[icon] || 'fa-solid fa-credit-card'
}

const getCategoryIcon = (icon) => {
  // Map category icons to FontAwesome classes
  const iconMap = {
    'bowl-food': 'fa-solid fa-bowl-food',
    'gas-pump': 'fa-solid fa-gas-pump',
    'house': 'fa-solid fa-house',
    'car': 'fa-solid fa-car',
    'gamepad': 'fa-solid fa-gamepad',
    'shirt': 'fa-solid fa-shirt',
    'utensils': 'fa-solid fa-utensils',
    'shopping-cart': 'fa-solid fa-shopping-cart',
    'money-bill': 'fa-solid fa-money-bill'
  }
  return iconMap[icon] || 'fa-solid fa-circle'
}

// Load initial data
onMounted(() => {
  fetchAllTransactions()
})
</script> 
