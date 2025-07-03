<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-secondary-900">Dashboard</h1>
      <p class="text-secondary-600">Welcome back! Here's your financial overview.</p>
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
            <p class="text-2xl font-semibold text-secondary-900">$12,543.32</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center text-sm text-green-600">
            <ArrowUpIcon class="h-4 w-4 mr-1" />
            <span>+2.5% from last month</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ArrowUpIcon class="h-8 w-8 text-blue-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">Income</p>
            <p class="text-2xl font-semibold text-secondary-900">$4,230.00</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center text-sm text-green-600">
            <ArrowUpIcon class="h-4 w-4 mr-1" />
            <span>+5.2% from last month</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ArrowDownIcon class="h-8 w-8 text-red-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">Expenses</p>
            <p class="text-2xl font-semibold text-secondary-900">$2,847.69</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center text-sm text-red-600">
            <ArrowUpIcon class="h-4 w-4 mr-1" />
            <span>+1.3% from last month</span>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <ChartBarIcon class="h-8 w-8 text-purple-600" />
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-secondary-500">Savings</p>
            <p class="text-2xl font-semibold text-secondary-900">$1,382.31</p>
          </div>
        </div>
        <div class="mt-4">
          <div class="flex items-center text-sm text-green-600">
            <ArrowUpIcon class="h-4 w-4 mr-1" />
            <span>+3.8% from last month</span>
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
            <div v-for="transaction in recentTransactions" :key="transaction.id" class="flex items-center justify-between">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="w-10 h-10 bg-secondary-100 rounded-full flex items-center justify-center">
                    <component :is="transaction.icon" class="h-5 w-5 text-secondary-600" />
                  </div>
                </div>
                <div class="ml-4">
                  <p class="text-sm font-medium text-secondary-900">{{ transaction.description }}</p>
                  <p class="text-sm text-secondary-500">{{ transaction.date }}</p>
                </div>
              </div>
              <div class="text-right">
                <p :class="[
                  'text-sm font-medium',
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                ]">
                  {{ transaction.type === 'income' ? '+' : '-' }}${{ Math.abs(transaction.amount) }}
                </p>
                <p class="text-xs text-secondary-500">{{ transaction.category }}</p>
              </div>
            </div>
          </div>
          <div class="mt-6">
            <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-500">
              View all transactions →
            </a>
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
import {
  BanknotesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  ShoppingCartIcon,
  HomeIcon,
  FilmIcon,
  TruckIcon
} from '@heroicons/vue/24/outline'
import { useDashboardStore } from '@/stores/dashboard'
import { useProfileData } from '@/composables/useProfileData'

const dashboardStore = useDashboardStore()

// Set up automatic data refresh when profile changes
const { isRefreshing, currentProfile } = useProfileData(() => dashboardStore.refreshData())

// Load initial data
onMounted(async () => {
  await dashboardStore.fetchDashboardData()
})

const recentTransactions = ref([
  {
    id: 1,
    description: 'Grocery Store',
    amount: -89.32,
    type: 'expense',
    category: 'Food',
    date: '2 hours ago',
    icon: ShoppingCartIcon
  },
  {
    id: 2,
    description: 'Salary Deposit',
    amount: 4230.00,
    type: 'income',
    category: 'Salary',
    date: '1 day ago',
    icon: BanknotesIcon
  },
  {
    id: 3,
    description: 'Rent Payment',
    amount: -1200.00,
    type: 'expense',
    category: 'Housing',
    date: '2 days ago',
    icon: HomeIcon
  },
  {
    id: 4,
    description: 'Netflix Subscription',
    amount: -15.99,
    type: 'expense',
    category: 'Entertainment',
    date: '3 days ago',
    icon: FilmIcon
  },
  {
    id: 5,
    description: 'Gas Station',
    amount: -45.20,
    type: 'expense',
    category: 'Transportation',
    date: '4 days ago',
    icon: TruckIcon
  }
])

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