<template>
  <div 
    class="px-6 py-4 hover:bg-secondary-50"
    :class="{ 'opacity-75': !isPaid }"
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
            <!-- Cleared checkmark for paid transactions -->
            <CheckCircleIcon
              v-if="isPaid && transaction.cleared && transaction.account.reconcile"
              class="w-4 h-4 text-green-600"
            />
            <!-- Clock icon for planned transactions -->
            <ClockIcon 
              v-if="!isPaid" 
              class="w-4 h-4 text-blue-500" 
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
</template>

<script setup>
import { CheckCircleIcon, ClockIcon } from '@heroicons/vue/24/outline'

// Props
const props = defineProps({
  transaction: {
    type: Object,
    required: true
  },
  isPaid: {
    type: Boolean,
    default: true
  }
})

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
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
  return `fa-solid fa-${icon} fa-xl`
}

const getCategoryIcon = (icon) => {
  return `fa-solid fa-${icon} fa-xl`
}
</script> 
