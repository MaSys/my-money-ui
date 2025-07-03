<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mb-4">
          <span class="text-white font-bold text-2xl">$</span>
        </div>
        <h2 class="text-3xl font-extrabold text-secondary-900">
          Reset your password
        </h2>
        <p class="mt-2 text-sm text-secondary-600">
          Enter your email address and we'll send you a link to reset your password
        </p>
      </div>
      
      <form v-if="!emailSent" class="mt-8 space-y-6" @submit.prevent="handleResetPassword">
        <div>
          <label for="email" class="block text-sm font-medium text-secondary-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            v-model="email"
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
            placeholder="Enter your email address"
          />
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="mr-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Sending...' : 'Send reset link' }}
          </button>
        </div>

        <div class="text-center">
          <router-link
            to="/login"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Back to sign in
          </router-link>
        </div>
      </form>

      <!-- Success message -->
      <div v-else class="text-center space-y-4">
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckIcon class="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h3 class="text-lg font-medium text-secondary-900">Check your email</h3>
          <p class="mt-2 text-sm text-secondary-600">
            We've sent a password reset link to <span class="font-medium">{{ email }}</span>
          </p>
        </div>
        <div class="pt-4">
          <button
            @click="emailSent = false"
            class="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Didn't receive the email? Try again
          </button>
        </div>
        <div class="pt-2">
          <router-link
            to="/login"
            class="text-sm font-medium text-secondary-500 hover:text-secondary-700"
          >
            Back to sign in
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CheckIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'

const authStore = useAuthStore()
const { execute, isLoading, error } = useApi()

const emailSent = ref(false)
const email = ref('')

const validateEmail = () => {
  if (!email.value) {
    alert('Please enter your email address')
    return false
  }
  
  if (!/\S+@\S+\.\S+/.test(email.value)) {
    alert('Please enter a valid email address')
    return false
  }
  
  return true
}

const handleResetPassword = async () => {
  if (!validateEmail()) return
  
  const result = await execute(
    () => authStore.resetPassword(email.value),
    {
      onSuccess: (data) => {
        emailSent.value = true
      },
      onError: (error) => {
        alert('Reset password failed: ' + error.error)
      }
    }
  )
  
  if (!result.success) {
    console.error('Reset password failed:', result.error)
  }
}
</script> 