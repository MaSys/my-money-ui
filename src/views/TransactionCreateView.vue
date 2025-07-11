<template>
  <div class="w-full space-y-6">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button
          @click="goBack"
          class="p-2 text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100 rounded-lg"
        >
          <ArrowLeftIcon class="w-5 h-5" />
        </button>
        <h1 class="text-2xl font-bold text-secondary-900">Create Transaction</h1>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow p-6">
      <!-- Template Selection -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-secondary-700 mb-2">
          Use Template (Optional)
        </label>
        <select
          v-model="selectedTemplate"
          @change="applyTemplate"
          class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Choose a template...</option>
          <option
            v-for="template in templates"
            :key="template.id"
            :value="template.id"
          >
            {{ template.name }}
          </option>
        </select>
      </div>

      <!-- Form Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

        <!-- Transaction Type -->
        <div class="md:col-span-2 lg:col-span-3">
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
            <label class="flex items-center cursor-pointer group">
              <div class="relative">
                <input
                  v-model="formData.transaction_type"
                  type="radio"
                  value="transfer"
                  class="sr-only"
                />
                <div class="w-4 h-4 border-2 border-secondary-300 rounded-full group-hover:border-blue-400 transition-colors"
                     :class="formData.transaction_type === 'transfer' ? 'border-blue-500 bg-blue-500' : ''">
                  <div v-if="formData.transaction_type === 'transfer'" 
                       class="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
              </div>
              <span class="ml-3 text-sm font-medium text-blue-600">Transfer</span>
            </label>
          </div>
        </div>

        <!-- To Account Selection (only for transfers) -->
        <div v-if="formData.transaction_type === 'transfer'">
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            To Account <span class="text-red-500">*</span>
          </label>
          <select
            v-model="formData.to_account_id"
            required
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select destination account</option>
            <option
              v-for="account in availableToAccounts"
              :key="account.id"
              :value="account.id"
            >
              {{ account.name }} ({{ formatCurrency(account.balance / 100) }})
            </option>
          </select>
        </div>

        <!-- Category Selection (only for income/expense) -->
        <div v-if="formData.transaction_type !== 'transfer'">
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

        <!-- Tags -->
        <div class="md:col-span-2 lg:col-span-3">
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Tags
          </label>
          <TagSelector v-model="formData.tags" />
        </div>

        <!-- Description -->
        <div class="md:col-span-2 lg:col-span-3">
          <label class="block text-sm font-medium text-secondary-700 mb-2">
            Description
          </label>
          <textarea
            v-model="formData.description"
            rows="2"
            placeholder="Optional description..."
            class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
          ></textarea>
        </div>

        <!-- Transaction Status -->
        <div class="md:col-span-2 lg:col-span-3 space-y-4">
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
            v-if="formData.paid && isReconcilableTransaction"
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
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-6 mt-6 border-t border-secondary-200">
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
          <span v-if="isSubmitting">Creating...</span>
          <span v-else>Create Transaction</span>
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
import { templateService } from '@/services/templateService'
import { transactionService } from '@/services/transactionService'
import { useProfileData } from '@/composables/useProfileData'
import TagSelector from '@/components/TagSelector.vue'

const route = useRoute()
const router = useRouter()

// Set up profile data composable
const { currentProfile } = useProfileData()

// State
const accounts = ref([])
const categories = ref([])
const templates = ref([])
const selectedTemplate = ref('')
const isSubmitting = ref(false)

// Utility function to get today's date in browser timezone
const getTodayInBrowserTimezone = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Form data
const formData = ref({
  account_id: '',
  category_id: '',
  amount: '',
  due_date: getTodayInBrowserTimezone(),
  description: '',
  transaction_type: 'expense',
  paid: true,
  cleared: false,
  tags: [],
  to_account_id: ''
})

// Computed
const selectedAccount = computed(() => {
  return accounts.value.find(account => account.id === formData.value.account_id)
})

const availableToAccounts = computed(() => {
  // Filter out the selected account from the to_account options
  return accounts.value.filter(account => account.id !== formData.value.account_id)
})

const filteredCategories = computed(() => {
  return categories.value.filter(category => 
    category.category_type === formData.value.transaction_type
  )
})

const selectedToAccount = computed(() => {
  return accounts.value.find(account => account.id === formData.value.to_account_id)
})

const isReconcilableTransaction = computed(() => {
  if (formData.value.transaction_type === 'transfer') {
    // For transfers, check if either account is reconcilable
    const sourceAccountReconcile = selectedAccount.value?.reconcile
    const destAccountReconcile = selectedToAccount.value?.reconcile
    return sourceAccountReconcile || destAccountReconcile
  } else {
    // For regular transactions, check if the account is reconcilable
    return selectedAccount.value?.reconcile
  }
})

// Watchers
watch(() => formData.value.transaction_type, () => {
  // Reset category when transaction type changes
  formData.value.category_id = ''
  // Reset to_account_id when transaction type changes
  formData.value.to_account_id = ''
})

watch(() => formData.value.account_id, () => {
  // Reset cleared status when account changes
  formData.value.cleared = false
  // Reset to_account_id if it's the same as selected account
  if (formData.value.to_account_id === formData.value.account_id) {
    formData.value.to_account_id = ''
  }
})

watch(() => formData.value.to_account_id, () => {
  // Reset cleared status when to_account changes (for transfers)
  formData.value.cleared = false
})

// Fetch accounts and categories
async function fetchAccounts() {
  try {
    const response = await apiClient.get('/accounts')
    
    if (response.data) {
      accounts.value = response.data || []
      
      // Pre-select account if provided in query params
      if (route.query.account_id) {
        formData.value.account_id = route.query.account_id
      }
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

async function fetchTemplates() {
  try {
    const response = await templateService.getTemplates()
    
    if (response) {
      templates.value = response || []
    }
  } catch (error) {
    console.error('Error fetching templates:', error)
  }
}

function applyTemplate() {
  if (!selectedTemplate.value) return
  
  const template = templates.value.find(t => t.id === selectedTemplate.value)
  if (!template) return
  
  const amount = Number(template.amount) || 0
  formData.value.account_id = template.account_id || ''
  formData.value.category_id = template.category_id || ''
  formData.value.transaction_type = template.transaction_type || 'expense'
  formData.value.description = template.notes || ''
  formData.value.tags = template.tag_list || []
  
  // Handle transfer template specific field
  if (template.transaction_type === 'transfer') {
    formData.value.to_account_id = template.to_account_id || ''
  } else {
    formData.value.to_account_id = ''
  }
  
  // Convert amount from cents to dollars if needed
  formData.value.amount = ''
  if (amount && typeof amount === 'number' && amount > 0) {
    formData.value.amount = (amount / 100).toFixed(2)
  }
  
  // Reset template selection
  selectedTemplate.value = ''
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

    if (formData.value.transaction_type === 'transfer') {
      // Handle transfer transaction
      const transferData = {
        account_id: formData.value.account_id,
        to_account_id: formData.value.to_account_id,
        amount: amountInCents,
        due_date: formData.value.due_date,
        paid: formData.value.paid,
        cleared: formData.value.cleared,
        notes: formData.value.description,
        tag_list: (formData.value.tags || []).join(',')
      }

      const response = await transactionService.createTransferTransaction(transferData)

      if (response.success) {
        // Success - redirect to transactions view or back to previous page
        if (route.query.account_id) {
          router.push(`/accounts/${route.query.account_id}`)
        } else {
          router.push('/transactions')
        }
      }
    } else {
      // Handle regular transaction
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

      const response = await transactionService.createTransaction(transactionData)

      if (response.success) {
        // Success - redirect to transactions view or back to previous page
        if (route.query.account_id) {
          router.push(`/accounts/${route.query.account_id}`)
        } else {
          router.push('/transactions')
        }
      }
    }
  } catch (error) {
    console.error('Error creating transaction:', error)
    alert('Failed to create transaction. Please check your input and try again.')
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
  await Promise.all([fetchAccounts(), fetchCategories(), fetchTemplates()])
})
</script> 
