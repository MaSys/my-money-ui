<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-secondary-900">Dashboard</h1>
        <p class="text-secondary-600">Welcome back! Here's your financial overview.</p>
      </div>
      <button
        @click="createTransaction"
        class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
      >
        <PlusIcon class="w-4 h-4 mr-2 inline" />
        Add Transaction
      </button>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <BanknotesIcon class="h-8 w-8 text-green-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">Total Balance</p>
            <p class="text-2xl font-semibold text-secondary-900">{{ dashboardStore.balanceFormatted }}</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center text-sm text-secondary-500">
            <span>Payment accounts - Credit cards</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ArrowUpIcon class="h-8 w-8 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">Monthly Income</p>
            <p class="text-2xl font-semibold text-secondary-900">{{ dashboardStore.incomeFormatted }}</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center text-sm text-secondary-500">
            <span>This month</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ArrowDownIcon class="h-8 w-8 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">Monthly Expenses</p>
            <p class="text-2xl font-semibold text-secondary-900">{{ dashboardStore.expensesFormatted }}</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center text-sm text-secondary-500">
            <span>This month</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ChartBarIcon class="h-8 w-8 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">Monthly Savings</p>
            <p class="text-2xl font-semibold text-secondary-900">{{ dashboardStore.savingsFormatted }}</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center text-sm text-secondary-500">
            <span>This month</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Recent Transactions -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-secondary-200">
          <h3 class="text-lg font-medium text-secondary-900">Recent Transactions</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-if="dashboardStore.recentTransactions.length === 0" class="text-center py-8 text-secondary-500">
              No recent transactions
            </div>
            <div v-for="transaction in dashboardStore.recentTransactions" :key="transaction.id" class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                    <BanknotesIcon class="h-5 w-5 text-secondary-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-900">{{ transaction.description }}</p>
                  <p class="text-sm text-secondary-500">{{ formatTransactionDate(transaction.due_date) }}</p>
                </div>
              </div>
              <div class="text-right">
                <p :class="[
                  'text-sm font-medium',
                  transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ transaction.transaction_type === 'income' ? '+' : '-' }}{{ formatCurrency(Math.abs(transaction.amount) / 100) }}
                </p>
                <p class="text-xs text-secondary-500">{{ transaction.category?.name || 'Uncategorized' }}</p>
              </div>
            </div>
          </div>
          <div class="mt-6">
            <router-link to="/transactions" class="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all transactions →
            </router-link>
          </div>
        </div>
      </div>

      <!-- Budget Overview -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6 border-b border-secondary-200">
          <h3 class="text-lg font-medium text-secondary-900">Budget Overview</h3>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div v-for="budget in budgetCategories" :key="budget.category" class="space-y-2">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-secondary-900">{{ budget.category }}</span>
                <span class="text-sm text-secondary-500">${{ budget.spent }} / ${{ budget.limit }}</span>
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="budget.percentage > 90 ? 'bg-red-500' : budget.percentage > 70 ? 'bg-yellow-500' : 'bg-primary-500'"
                  :style="{ width: `${Math.min(budget.percentage, 100)}%` }"
                ></div>
              </div>
              <div class="flex justify-between items-center text-xs text-secondary-500">
                <span>{{ budget.percentage.toFixed(1) }}% used</span>
                <span>${{ budget.limit - budget.spent }} remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  PlusIcon
} from '@heroicons/vue/24/outline'
import { useDashboardStore } from '@/stores/dashboard'
import { useProfileData } from '@/composables/useProfileData'

const router = useRouter()

const dashboardStore = useDashboardStore()

// Set up automatic data refresh when profile changes
const { isRefreshing, currentProfile } = useProfileData(() => dashboardStore.refreshData())

// Load initial data
onMounted(async () => {
  await dashboardStore.fetchDashboardData()
})

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

const formatTransactionDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) {
    return 'Today'
  } else if (diffDays === 2) {
    return 'Yesterday'
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }
}

const budgetCategories = ref([
  {
    category: 'Food & Dining',
    spent: 423,
    limit: 600,
    percentage: 70.5
  },
  {
    category: 'Transportation',
    spent: 189,
    limit: 300,
    percentage: 63.0
  },
  {
    category: 'Entertainment',
    spent: 156,
    limit: 200,
    percentage: 78.0
  },
  {
    category: 'Shopping',
    spent: 342,
    limit: 400,
    percentage: 85.5
  },
  {
    category: 'Bills & Utilities',
    spent: 1256,
    limit: 1300,
    percentage: 96.6
  }
])
</script> 
