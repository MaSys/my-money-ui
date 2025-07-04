<template>
  <div class="max-w-2xl mx-auto py-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-secondary-900">Create New Profile</h1>
        <p class="text-secondary-600 mt-1">
          Create a new profile to organize your financial data separately
        </p>
      </div>

      <form @submit.prevent="handleCreateProfile" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label for="name" class="block text-sm font-medium text-secondary-700">
              Profile Name *
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="e.g., Personal, Business, Family"
            />
          </div>

          <div>
            <label for="color" class="block text-sm font-medium text-secondary-700">
              Profile Color
            </label>
            <div class="mt-1 flex items-center space-x-2">
              <input
                id="color"
                v-model="form.color"
                type="color"
                class="w-10 h-10 rounded-lg border border-secondary-300 cursor-pointer"
              />
              <span class="text-sm text-secondary-500">{{ form.color }}</span>
            </div>
          </div>
        </div>

        <div>
          <label for="description" class="block text-sm font-medium text-secondary-700">
            Description
          </label>
          <textarea
            id="description"
            v-model="form.description"
            rows="3"
            class="mt-1 block w-full px-3 py-2 border border-secondary-300 rounded-lg shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            placeholder="Optional description for this profile"
          ></textarea>
        </div>

        <div class="flex items-center">
          <input
            id="isDefault"
            v-model="form.isDefault"
            type="checkbox"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
          />
          <label for="isDefault" class="ml-2 block text-sm text-secondary-900">
            Set as default profile
          </label>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="$router.back()"
            class="px-4 py-2 text-sm font-medium text-secondary-700 bg-secondary-100 hover:bg-secondary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isLoading"
            class="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
          >
            <span v-if="isLoading" class="mr-2">
              <svg class="animate-spin h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Creating...' : 'Create Profile' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProfileStore } from '@/stores/profile'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const profileStore = useProfileStore()
const { execute, isLoading } = useApi()

const form = ref({
  name: '',
  description: '',
  color: '#3B82F6',
  isDefault: false
})

const handleCreateProfile = async () => {
  const result = await execute(
    () => profileStore.createProfile(form.value),
    {
      onSuccess: (profile) => {
        router.push('/dashboard')
      },
      onError: (error) => {
        console.error('Failed to create profile:', error)
        alert('Failed to create profile: ' + error.error)
      }
    }
  )
}
</script> 
