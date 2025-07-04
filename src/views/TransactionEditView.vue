<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="goBack"
          class="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
        >
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <h1 class="text-2xl font-bold text-secondary-900">Edit Transaction</h1>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-primary-500 border-t-transparent"></div>
    </div>

    <div v-else-if="!transaction" class="text-center py-12">
      <div class="text-secondary-500">
        <p class="text-lg font-medium mb-2">Transaction not found</p>
        <p class="mb-4">The transaction you're trying to edit doesn't exist or you don't have access to it.</p>
        <button
          @click="goBack"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Go Back
        </button>
      </div>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6 space-y-6">
      <!-- Account Selection -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 mb-2">
          Account <span class="text-red-500">*</span>
        </label>
        <select
          v-model="formData.account_id"
          required
          class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select an account</option>
          <option
            v-for="account in accounts"
            :key="account.id"
            :value="account.id"
          >
            {{ account.name }} ({{ formatCurrency(account.balance / 100) }})
          </option>
        </select>
      </div>

             <!-- Transaction Type -->
       <div>
         <label class="block text-sm font-medium text-secondary-700 mb-2">
           Transaction Type <span class="text-red-500">*</span>
         </label>
         <div class="flex space-x-4">
           <label class="flex items-center cursor-pointer group">
             <div class="relative">
               <input
                 v-model="formData.transaction_type"
                 type="radio"
                 value="expense"
                 class="sr-only"
               />
               <div class="w-4 h-4 border-2 border-secondary-300 rounded-full group-hover:border-red-400 transition-colors"
                    :class="formData.transaction_type === 'expense' ? 'border-red-500 bg-red-500' : ''">
                 <div v-if="formData.transaction_type === 'expense'" 
                      class="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
               </div>
             </div>
             <span class="ml-3 text-sm font-medium text-red-600">Expense</span>
           </label>
           <label class="flex items-center cursor-pointer group">
             <div class="relative">
               <input
                 v-model="formData.transaction_type"
                 type="radio"
                 value="income"
                 class="sr-only"
               />
               <div class="w-4 h-4 border-2 border-secondary-300 rounded-full group-hover:border-green-400 transition-colors"
                    :class="formData.transaction_type === 'income' ? 'border-green-500 bg-green-500' : ''">
                 <div v-if="formData.transaction_type === 'income'" 
                      class="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
               </div>
             </div>
             <span class="ml-3 text-sm font-medium text-green-600">Income</span>
           </label>
         </div>
       </div>

      <!-- Category Selection -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 mb-2">
          Category <span class="text-red-500">*</span>
        </label>
        <select
          v-model="formData.category_id"
          required
          class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select a category</option>
          <option
            v-for="category in filteredCategories"
            :key="category.id"
            :value="category.id"
          >
            {{ category.name }}
          </option>
        </select>
      </div>

      <!-- Amount -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 mb-2">
          Amount <span class="text-red-500">*</span>
        </label>
        <div class="relative">
          <span class="absolute left-3 top-2 text-secondary-500">$</span>
          <input
            v-model="formData.amount"
            type="number"
            step="0.01"
            min="0"
            required
            placeholder="0.00"
            class="w-full pl-8 pr-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          />
        </div>
      </div>

      <!-- Date -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 mb-2">
          Date <span class="text-red-500">*</span>
        </label>
        <input
          v-model="formData.due_date"
          type="date"
          required
          class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-secondary-700 mb-2">
          Description
        </label>
        <textarea
          v-model="formData.description"
          rows="3"
          placeholder="Optional description..."
          class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        ></textarea>
      </div>

             <!-- Tags -->
       <div>
         <label class="block text-sm font-medium text-secondary-700 mb-2">
           Tags
         </label>
         <TagSelector v-model="formData.tags" />
       </div>

             <!-- Transaction Status -->
       <div class="space-y-4">
         <label class="flex items-center cursor-pointer group">
           <div class="relative">
             <input
               v-model="formData.paid"
               type="checkbox"
               class="sr-only"
             />
             <div class="w-4 h-4 border-2 border-secondary-300 rounded group-hover:border-primary-400 transition-colors"
                  :class="formData.paid ? 'border-primary-500 bg-primary-500' : ''">
               <CheckIcon v-if="formData.paid" class="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
             </div>
           </div>
           <span class="ml-3 text-sm font-medium text-secondary-700">
             Mark as paid
           </span>
         </label>

         <label
           v-if="formData.paid && selectedAccount && selectedAccount.reconcile"
           class="flex items-center cursor-pointer group"
         >
           <div class="relative">
             <input
               v-model="formData.cleared"
               type="checkbox"
               class="sr-only"
             />
             <div class="w-4 h-4 border-2 border-secondary-300 rounded group-hover:border-yellow-400 transition-colors"
                  :class="formData.cleared ? 'border-yellow-500 bg-yellow-500' : ''">
               <CheckIcon v-if="formData.cleared" class="w-3 h-3 text-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
             </div>
           </div>
           <span class="ml-3 text-sm font-medium text-secondary-700">
             Mark as cleared (reconcilable account)
           </span>
         </label>
       </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-4 border-t border-secondary-200">
        <button
          type="button"
          @click="goBack"
          class="px-4 py-2 text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
        >
          <span v-if="isSubmitting">Saving...</span>
          <span v-else>Save Changes</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeftIcon, CheckIcon } from '@heroicons/vue/24/outline'
import { apiClient } from '@/services/api'
import { useProfileData } from '@/composables/useProfileData'
import TagSelector from '@/components/TagSelector.vue'

const route = useRoute()
const router = useRouter()

// Set up profile data composable
const { currentProfile } = useProfileData()

// State
const transaction = ref(null)
const accounts = ref([])
const categories = ref([])
const loading = ref(false)
const isSubmitting = ref(false)

// Form data
const formData = ref({
  account_id: '',
  category_id: '',
  amount: '',
  due_date: '',
  description: '',
  transaction_type: 'expense',
  paid: false,
  cleared: false,
  tags: []
})

// Computed
const selectedAccount = computed(() => {
  return accounts.value.find(account => account.id === formData.value.account_id)
})

const filteredCategories = computed(() => {
  return categories.value.filter(category => 
    category.category_type === formData.value.transaction_type
  )
})

// TODO: fix this
// Watchers
//watch(() => formData.value.transaction_type, () => {
//  // Reset category when transaction type changes
//  formData.value.category_id = ''
//})

watch(() => formData.value.account_id, () => {
  // Reset cleared status when account changes
  formData.value.cleared = false
})

// Fetch transaction details
async function fetchTransaction() {
  loading.value = true
  
  try {
    const response = await apiClient.get(`/transactions/${route.params.id}`)
    
    if (response.data) {
      transaction.value = response.data
      populateForm(response.data)
    } else {
      console.error('Failed to fetch transaction')
      transaction.value = null
    }
  } catch (error) {
    console.error('Error fetching transaction:', error)
    transaction.value = null
  } finally {
    loading.value = false
  }
}

// Populate form with transaction data
function populateForm(transactionData) {
  formData.value = {
    account_id: transactionData.account_id,
    category_id: transactionData.category_id,
    amount: Math.abs(transactionData.amount / 100).toFixed(2),
    due_date: transactionData.due_date.split('T')[0],
    description: transactionData.description || '',
    transaction_type: transactionData.transaction_type,
    paid: transactionData.paid,
    cleared: transactionData.cleared,
    tags: transactionData.tag_list
  }
}

// Fetch accounts and categories
async function fetchAccounts() {
  try {
    const response = await apiClient.get('/accounts')
    
    if (response.data) {
      accounts.value = response.data || []
    }
  } catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

async function fetchCategories() {
  try {
    const response = await apiClient.get('/categories')
    
    if (response.data) {
      categories.value = response.data || []
    }
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

// Actions
const goBack = () => {
  router.go(-1)
}

const handleSubmit = async () => {
  if (isSubmitting.value) return

  isSubmitting.value = true

  try {
    // Convert amount to cents
    const amountInCents = Math.round(parseFloat(formData.value.amount) * 100)

    const transactionData = {
      account_id: formData.value.account_id,
      category_id: formData.value.category_id,
      amount: amountInCents,
      due_date: formData.value.due_date,
      description: formData.value.description,
      transaction_type: formData.value.transaction_type,
      paid: formData.value.paid,
      cleared: formData.value.cleared,
      tag_list: (formData.value.tags || []).join(',')
    }

    const response = await apiClient.patch(`/transactions/${route.params.id}`, transactionData)

    if (response.data) {
      // Success - redirect back to previous page
      router.go(-1)
    }
  } catch (error) {
    console.error('Error updating transaction:', error)
    alert('Failed to update transaction. Please check your input and try again.')
  } finally {
    isSubmitting.value = false
  }
}

// Utility functions
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Load initial data
onMounted(async () => {
  await Promise.all([fetchAccounts(), fetchCategories(), fetchTransaction()])
})
</script> 
