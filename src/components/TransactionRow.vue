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
            :class="getCategoryColorClass(transaction)"
          >
            <i :class="getCategoryIcon(transaction)"></i>
          </div>
        </div>

        <div class="flex-1">
          <div class="flex items-center space-x-2">
            <p class="text-sm font-medium text-secondary-900">
              {{ getTransactionTitle(transaction) }}
            </p>
            <!-- Cleared checkmark for paid transactions -->
            <CheckCircleIcon
              v-if="isPaid && transaction.cleared && transaction.account.reconcile"
              class="w-4 h-4 text-green-600"
            />
            <!-- Not Cleared checkmark for paid transactions -->
            <XMarkIcon
              v-if="isPaid && !transaction.cleared && transaction.account.reconcile"
              class="w-4 h-4 text-gray-600"
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

        <!-- Action Buttons -->
        <div class="flex items-center justify-end space-x-1 mt-2">
          <!-- Mark as Paid Button -->
          <button
            v-if="!transaction.paid"
            @click="handleMarkAsPaid"
            :disabled="isUpdating"
            class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 transition-colors"
            title="Mark as Paid"
          >
            <CheckIcon class="w-3 h-3" />
          </button>

          <!-- Mark as Cleared Button -->
          <button
            v-if="transaction.paid && transaction.account.reconcile && !transaction.cleared"
            @click="handleMarkAsCleared"
            :disabled="isClearing"
            class="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50 transition-colors"
            title="Mark as Cleared"
          >
            <CheckCircleIcon class="w-3 h-3" />
          </button>

          <!-- Edit Button -->
          <button
            @click="handleEdit"
            class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            title="Edit Transaction"
          >
            <PencilIcon class="w-3 h-3" />
          </button>

          <!-- Delete Button -->
          <button
            @click="handleDelete"
            :disabled="isDeleting"
            class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50 transition-colors"
            title="Delete Transaction"
          >
            <TrashIcon class="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircleIcon, XMarkIcon, ClockIcon, CheckIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { apiClient } from '@/services/api'

const router = useRouter()

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

// Emits
const emit = defineEmits(['transaction-updated', 'transaction-deleted'])

// State
const isUpdating = ref(false)
const isDeleting = ref(false)
const isClearing = ref(false)

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

const getTransactionTitle = (transaction) => {
  if (!!transaction.from_transaction_id || !!transaction.to_transaction) {
    if (transaction.from_transaction) {
      return `${transaction.from_transaction.account.name} > ${transaction.account.name}`
    } else if (transaction.to_transaction) {
      return `${transaction.account.name} > ${transaction.to_transaction.account.name}`
    }
  }

  return transaction.category.name
}

const getCategoryColorClass = (transaction) => {
  if (!!transaction.from_transaction_id || !!transaction.to_transaction) {
    return 'bg-gray-500'
  }

  const type = transaction.category.category_type
  return type === 'income' ? 'bg-green-500' : 'bg-red-500'
}

const getAccountIcon = (icon) => {
  return `fa-solid fa-${icon} fa-xl`
}

const getCategoryIcon = (transaction) => {
  if (!!transaction.from_transaction_id || !!transaction.to_transaction) {
    return `fa-solid fa-arrows-rotate fa-xl`
  }

  const icon = transaction.category.icon
  return `fa-solid fa-${icon} fa-xl`
}

// Action handlers
const handleMarkAsPaid = async () => {
  if (isUpdating.value) return

  isUpdating.value = true

  try {
    const response = await apiClient.patch(`/transactions/${props.transaction.id}`, {
      paid: true,
      due_date: new Date()
    })

    if (response.data) {
      // Emit event to parent to refresh data
      emit('transaction-updated', response.data)
    }
  } catch (error) {
    console.error('Error marking transaction as paid:', error)
  } finally {
    isUpdating.value = false
  }
}

const handleMarkAsCleared = async () => {
  if (isClearing.value) return

  isClearing.value = true

  try {
    const response = await apiClient.patch(`/transactions/${props.transaction.id}`, {
      cleared: true
    })

    if (response.data) {
      // Emit event to parent to refresh data
      emit('transaction-updated', response.data)
    }
  } catch (error) {
    console.error('Error marking transaction as cleared:', error)
  } finally {
    isClearing.value = false
  }
}

const handleEdit = () => {
  // Navigate to edit transaction page
  router.push(`/transactions/${props.transaction.id}/edit`)
}

const handleDelete = async () => {
  if (isDeleting.value) return

  // Confirm deletion
  if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
    return
  }

  isDeleting.value = true

  try {
    const response = await apiClient.delete(`/transactions/${props.transaction.id}`)

    if (response.status === 200 || response.status === 204) {
      // Emit event to parent to remove transaction from list
      emit('transaction-deleted', props.transaction.id)
    }
  } catch (error) {
    console.error('Error deleting transaction:', error)
    alert('Failed to delete transaction. Please try again.')
  } finally {
    isDeleting.value = false
  }
}
</script>
