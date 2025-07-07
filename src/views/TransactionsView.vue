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
      <div class="flex space-x-3">
        <button
          @click="createTransaction"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <PlusIcon class="w-4 h-4 mr-2 inline" />
          Create Transaction
        </button>
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
    </div>

    <!-- Planned Transactions Section -->
    <div class="bg-white rounded-lg shadow" v-if="plannedTransactions.length">
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
        <TransactionRow
          v-for="transaction in plannedTransactions"
          :key="transaction.id"
          :transaction="transaction"
          :is-paid="false"
          @transaction-updated="handleTransactionUpdated"
          @transaction-deleted="handleTransactionDeleted"
        />

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
        <TransactionRow
          v-for="transaction in paidTransactions"
          :key="transaction.id"
          :transaction="transaction"
          :is-paid="true"
          @transaction-updated="handleTransactionUpdated"
          @transaction-deleted="handleTransactionDeleted"
        />

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
import { useRouter } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import { apiClient } from '@/services/api'
import { useProfileData } from '@/composables/useProfileData'
import TransactionRow from '@/components/TransactionRow.vue'

const router = useRouter()

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
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const today = `${year}-${month}-${day}`

    const response = await apiClient.get(`/transactions`, {
      params: {
        start_date: today,
        end_date: today,
        paid: true
      }
    })
    
    if (response.data) {
      paidTransactions.value = (response.data || []).filter(o => !o.from_transaction_id)
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

// Create transaction
const createTransaction = () => {
  router.push('/transactions/create')
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

// Event handlers
const handleTransactionUpdated = (updatedTransaction) => {
  // Find and update the transaction in the appropriate array
  const paidIndex = paidTransactions.value.findIndex(t => t.id === updatedTransaction.id)
  const plannedIndex = plannedTransactions.value.findIndex(t => t.id === updatedTransaction.id)
  
  if (paidIndex !== -1) {
    paidTransactions.value[paidIndex] = updatedTransaction
  } else if (plannedIndex !== -1) {
    // If a planned transaction was marked as paid, move it to paid transactions
    if (updatedTransaction.paid) {
      plannedTransactions.value.splice(plannedIndex, 1)
      paidTransactions.value.push(updatedTransaction)
    } else {
      plannedTransactions.value[plannedIndex] = updatedTransaction
    }
  }
}

const handleTransactionDeleted = (transactionId) => {
  // Remove the transaction from both arrays
  paidTransactions.value = paidTransactions.value.filter(t => t.id !== transactionId)
  plannedTransactions.value = plannedTransactions.value.filter(t => t.id !== transactionId)
}

// Load initial data
onMounted(() => {
  fetchAllTransactions()
})
</script> 
