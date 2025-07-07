<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-secondary-900">Template Management</h1>
      <button
        @click="openCreateModal"
        class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
      >
        <PlusIcon class="w-5 h-5" />
        <span>Create Template</span>
      </button>
    </div>

    <!-- Templates List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div v-if="loading" class="p-6 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-2 text-secondary-600">Loading templates...</p>
      </div>

      <div v-else-if="templates.length === 0" class="p-6 text-center text-secondary-500">
        <DocumentTextIcon class="w-12 h-12 mx-auto mb-4 text-secondary-300" />
        <p>No templates found. Create your first template to get started.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-secondary-200">
          <thead class="bg-secondary-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Name
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Amount
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Account
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Category
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Tags
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-secondary-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-secondary-200">
            <tr v-for="template in templates" :key="template.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-secondary-900">
                  {{ template.name }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      :class="getTypeColor(template.transaction_type)">
                  {{ template.transaction_type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                {{ formatCurrency(template.amount / 100) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                {{ getAccountName(template.account_id) }}
                <div v-if="template.transaction_type === 'transfer' && template.account_to_id" 
                     class="text-xs text-secondary-500">
                  → {{ getAccountName(template.account_to_id) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                {{ getCategoryName(template.category_id) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-secondary-900">
                <div class="flex flex-wrap gap-1">
                  <span v-for="tag in (template.tag_list || [])" :key="tag"
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-100 text-secondary-800">
                    {{ tag }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  @click="editTemplate(template)"
                  class="text-primary-600 hover:text-primary-900"
                >
                  <PencilIcon class="w-4 h-4" />
                </button>
                <button
                  @click="deleteTemplate(template.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-lg p-6 w-full max-w-4xl max-h-full overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-secondary-900">
            {{ isEditing ? 'Edit Template' : 'Create Template' }}
          </h2>
          <button @click="closeModal" class="text-secondary-400 hover:text-secondary-600">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>

        <form @submit.prevent="saveTemplate" class="space-y-4">
          <!-- Template Name -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Template Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formData.name"
              type="text"
              required
              placeholder="Enter template name"
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          <!-- Transaction Type -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-2">
              Transaction Type <span class="text-red-500">*</span>
            </label>
            <div class="flex space-x-4">
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="formData.transaction_type"
                  type="radio"
                  value="expense"
                  class="text-red-500 focus:ring-red-500"
                />
                <span class="ml-2 text-sm text-red-600">Expense</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="formData.transaction_type"
                  type="radio"
                  value="income"
                  class="text-green-500 focus:ring-green-500"
                />
                <span class="ml-2 text-sm text-green-600">Income</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  v-model="formData.transaction_type"
                  type="radio"
                  value="transfer"
                  class="text-blue-500 focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-blue-600">Transfer</span>
              </label>
            </div>
          </div>

          <!-- Account -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Account <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.account_id"
              required
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select an account</option>
              <option v-for="account in accounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>

          <!-- To Account (for transfers) -->
          <div v-if="formData.transaction_type === 'transfer'">
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              To Account <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.account_to_id"
              required
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select destination account</option>
              <option v-for="account in availableToAccounts" :key="account.id" :value="account.id">
                {{ account.name }}
              </option>
            </select>
          </div>

          <!-- Category (not for transfers) -->
          <div v-if="formData.transaction_type !== 'transfer'">
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Category <span class="text-red-500">*</span>
            </label>
            <select
              v-model="formData.category_id"
              required
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select a category</option>
              <option v-for="category in filteredCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Amount -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
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

          <!-- Notes -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Notes
            </label>
            <textarea
              v-model="formData.notes"
              rows="3"
              placeholder="Optional notes..."
              class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            ></textarea>
          </div>

          <!-- Tags -->
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">
              Tags
            </label>
            <TagSelector v-model="formData.tags" />
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="px-4 py-2 text-secondary-700 bg-secondary-100 rounded-lg hover:bg-secondary-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmitting"
              class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              <span v-if="isSubmitting">{{ isEditing ? 'Updating...' : 'Creating...' }}</span>
              <span v-else>{{ isEditing ? 'Update Template' : 'Create Template' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { templateService } from '@/services/templateService'
import { apiClient } from '@/services/api'
import TagSelector from '@/components/TagSelector.vue'

// State
const templates = ref([])
const accounts = ref([])
const categories = ref([])
const loading = ref(false)
const showModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const currentTemplate = ref(null)

// Form data
const formData = ref({
  name: '',
  transaction_type: 'expense',
  amount: '',
  account_id: '',
  account_to_id: '',
  category_id: '',
  notes: '',
  tags: []
})

// Computed
const availableToAccounts = computed(() => {
  return accounts.value.filter(account => account.id !== formData.value.account_id)
})

const filteredCategories = computed(() => {
  return categories.value.filter(category => 
    category.category_type === formData.value.transaction_type
  )
})

// Watchers
watch(() => formData.value.transaction_type, () => {
  formData.value.category_id = ''
  formData.value.account_to_id = ''
})

watch(() => formData.value.account_id, () => {
  if (formData.value.account_to_id === formData.value.account_id) {
    formData.value.account_to_id = ''
  }
})

// Methods
async function fetchTemplates() {
  loading.value = true
  try {
    const response = await templateService.getTemplates()
    templates.value = response || []
  } catch (error) {
    console.error('Error fetching templates:', error)
  } finally {
    loading.value = false
  }
}

async function fetchAccounts() {
  try {
    const response = await apiClient.get('/accounts')
    accounts.value = response.data || []
  } catch (error) {
    console.error('Error fetching accounts:', error)
  }
}

async function fetchCategories() {
  try {
    const response = await apiClient.get('/categories')
    categories.value = response.data || []
  } catch (error) {
    console.error('Error fetching categories:', error)
  }
}

function getAccountName(accountId) {
  const account = accounts.value.find(a => a.id === accountId)
  return account ? account.name : 'Unknown Account'
}

function getCategoryName(categoryId) {
  const category = categories.value.find(c => c.id === categoryId)
  return category ? category.name : 'No Category'
}

function getTypeColor(type) {
  switch (type) {
    case 'income':
      return 'bg-green-100 text-green-800'
    case 'expense':
      return 'bg-red-100 text-red-800'
    case 'transfer':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-secondary-100 text-secondary-800'
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

function openCreateModal() {
  isEditing.value = false
  currentTemplate.value = null
  formData.value = {
    name: '',
    transaction_type: 'expense',
    amount: '',
    account_id: '',
    account_to_id: '',
    category_id: '',
    notes: '',
    tags: []
  }
  showModal.value = true
}

function editTemplate(template) {
  isEditing.value = true
  currentTemplate.value = template
  formData.value = {
    name: template.name || '',
    transaction_type: template.transaction_type || 'expense',
    amount: template.amount ? (template.amount / 100).toFixed(2) : '',
    account_id: template.account_id || '',
    account_to_id: template.account_to_id || '',
    category_id: template.category_id || '',
    notes: template.notes || '',
    tags: template.tag_list || []
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  isEditing.value = false
  currentTemplate.value = null
}

async function saveTemplate() {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const templateData = {
      name: formData.value.name,
      transaction_type: formData.value.transaction_type,
      amount: Math.round(parseFloat(formData.value.amount) * 100),
      account_id: formData.value.account_id,
      account_to_id: formData.value.account_to_id || null,
      category_id: formData.value.category_id || null,
      notes: formData.value.notes,
      tag_list: formData.value.tags || []
    }
    
    if (isEditing.value) {
      await templateService.updateTemplate(currentTemplate.value.id, templateData)
    } else {
      await templateService.createTemplate(templateData)
    }
    
    await fetchTemplates()
    closeModal()
  } catch (error) {
    console.error('Error saving template:', error)
    alert('Failed to save template. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

async function deleteTemplate(id) {
  if (!confirm('Are you sure you want to delete this template?')) {
    return
  }
  
  try {
    await templateService.deleteTemplate(id)
    await fetchTemplates()
  } catch (error) {
    console.error('Error deleting template:', error)
    alert('Failed to delete template. Please try again.')
  }
}

// Initialize
onMounted(async () => {
  await Promise.all([fetchTemplates(), fetchAccounts(), fetchCategories()])
})
</script> 
