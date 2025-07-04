<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-secondary-900">Budgets</h1>
      <div class="flex items-center space-x-3">
        <span v-if="currentProfile" class="text-sm text-secondary-600">
          Profile: {{ currentProfile.name }}
        </span>
        <button
          @click="handleRefresh"
          :disabled="isRefreshing"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <span v-if="isRefreshing">Refreshing...</span>
          <span v-else>Refresh All</span>
        </button>
      </div>
    </div>

    <!-- Budget Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-secondary-900">Total Budget</h3>
          <TrendingUpIcon class="w-6 h-6 text-primary-600" />
        </div>
        <div class="space-y-2">
          <p class="text-3xl font-bold text-secondary-900">
            {{ formatCurrency(totalBudget) }}
          </p>
          <p class="text-sm text-secondary-500">Monthly allocation</p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-secondary-900">Spent</h3>
          <TrendingDownIcon class="w-6 h-6 text-red-600" />
        </div>
        <div class="space-y-2">
          <p class="text-3xl font-bold text-red-600">
            {{ formatCurrency(totalSpent) }}
          </p>
          <p class="text-sm text-secondary-500">
            {{ spentPercentage }}% of budget
          </p>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-medium text-secondary-900">Remaining</h3>
          <PlusIcon class="w-6 h-6 text-green-600" />
        </div>
        <div class="space-y-2">
          <p class="text-3xl font-bold text-green-600">
            {{ formatCurrency(totalBudget - totalSpent) }}
          </p>
          <p class="text-sm text-secondary-500">Available to spend</p>
        </div>
      </div>
    </div>

    <!-- Budget Categories -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-secondary-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-medium text-secondary-900">Budget Categories</h2>
          <button class="px-4 py-2 text-sm text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100">
            Add Category
          </button>
        </div>
      </div>

      <div class="p-6">
        <div class="space-y-6">
          <div
            v-for="category in budgetCategories"
            :key="category.id"
            class="border border-secondary-200 rounded-lg p-4"
          >
            <div class="flex justify-between items-center mb-3">
              <div class="flex items-center space-x-3">
                <div
                  class="w-4 h-4 rounded-full"
                  :style="{ backgroundColor: category.color }"
                ></div>
                <h3 class="text-lg font-medium text-secondary-900">
                  {{ category.name }}
                </h3>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-secondary-500">
                  {{ formatCurrency(category.spent) }} / {{ formatCurrency(category.limit) }}
                </span>
                <button class="p-1 text-secondary-400 hover:text-secondary-600">
                  <PencilIcon class="w-4 h-4" />
                </button>
              </div>
            </div>

            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-secondary-600">Progress</span>
                <span
                  :class="category.percentage > 90 ? 'text-red-600' : category.percentage > 70 ? 'text-yellow-600' : 'text-green-600'"
                >
                  {{ category.percentage.toFixed(1) }}%
                </span>
              </div>
              <div class="w-full bg-secondary-200 rounded-full h-2">
                <div
                  class="h-2 rounded-full transition-all duration-300"
                  :class="category.percentage > 90 ? 'bg-red-500' : category.percentage > 70 ? 'bg-yellow-500' : 'bg-green-500'"
                  :style="{ width: `${Math.min(category.percentage, 100)}%` }"
                ></div>
              </div>
              <div class="flex justify-between text-xs text-secondary-500">
                <span>{{ category.transactionCount }} transactions</span>
                <span>{{ formatCurrency(category.limit - category.spent) }} remaining</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="loading" class="py-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent mx-auto"></div>
          <p class="mt-2 text-sm text-secondary-500">Loading budgets...</p>
        </div>

        <div v-if="!loading && budgetCategories.length === 0" class="py-8 text-center">
          <ChartBarIcon class="w-12 h-12 text-secondary-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-secondary-900 mb-2">No budgets found</h3>
          <p class="text-secondary-500 mb-4">
            No budget categories found for profile: {{ currentProfile?.name }}
          </p>
          <button class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Create Your First Budget
          </button>
        </div>
      </div>
    </div>

    <!-- Recent Budget Activity -->
    <div class="bg-white rounded-lg shadow">
      <div class="px-6 py-4 border-b border-secondary-200">
        <h2 class="text-lg font-medium text-secondary-900">Recent Activity</h2>
      </div>
      <div class="p-6">
        <div class="space-y-4">
          <div
            v-for="activity in recentActivity"
            :key="activity.id"
            class="flex items-center justify-between py-3 border-b border-secondary-100 last:border-b-0"
          >
            <div class="flex items-center space-x-3">
              <div
                class="w-2 h-2 rounded-full"
                :style="{ backgroundColor: activity.color }"
              ></div>
              <div>
                <p class="text-sm font-medium text-secondary-900">
                  {{ activity.description }}
                </p>
                <p class="text-xs text-secondary-500">
                  {{ activity.category }} • {{ formatDate(activity.date) }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-sm font-medium text-red-600">
                -{{ formatCurrency(activity.amount) }}
              </p>
              <p class="text-xs text-secondary-500">
                {{ activity.percentage }}% of budget
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  TrendingUpIcon,
  TrendingDownIcon,
  PlusIcon,
  ChartBarIcon,
  PencilIcon
} from '@heroicons/vue/24/outline'
import { useMultipleProfileData } from '@/composables/useProfileData'
import { apiClient } from '@/services/api'

// State
const budgetCategories = ref([])
const recentActivity = ref([])
const loading = ref(false)

// Set up multiple data refresh functions when profile changes
const { isRefreshing, currentProfile, onProfileSwitch } = useMultipleProfileData()

// Register multiple refresh functions
onProfileSwitch(fetchBudgets)
onProfileSwitch(fetchBudgetActivity)

// Computed values
const totalBudget = computed(() => {
  return budgetCategories.value.reduce((sum, category) => sum + category.limit, 0)
})

const totalSpent = computed(() => {
  return budgetCategories.value.reduce((sum, category) => sum + category.spent, 0)
})

const spentPercentage = computed(() => {
  return totalBudget.value > 0 ? ((totalSpent.value / totalBudget.value) * 100).toFixed(1) : 0
})

// Fetch budget categories
async function fetchBudgets() {
  loading.value = true
  
  try {
    const response = await apiClient.get('/budgets')
    
    if (response.data.success) {
      budgetCategories.value = response.data.data.budgets || []
    } else {
      console.error('Failed to fetch budgets:', response.data.error)
      budgetCategories.value = []
    }
  } catch (error) {
    console.error('Error fetching budgets:', error)
    budgetCategories.value = []
  } finally {
    loading.value = false
  }
}

// Fetch recent budget activity
async function fetchBudgetActivity() {
  try {
    const response = await apiClient.get('/budgets/activity')
    
    if (response.data.success) {
      recentActivity.value = response.data.data.activities || []
    } else {
      console.error('Failed to fetch budget activity:', response.data.error)
      recentActivity.value = []
    }
  } catch (error) {
    console.error('Error fetching budget activity:', error)
    recentActivity.value = []
  }
}

// Manual refresh all data
const handleRefresh = async () => {
  await Promise.all([
    fetchBudgets(),
    fetchBudgetActivity()
  ])
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
    day: 'numeric'
  })
}

// Load initial data
onMounted(async () => {
  await handleRefresh()
})
</script> 
