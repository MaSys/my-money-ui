<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mb-4">
          <span class="text-white font-bold text-2xl">$</span>
        </div>
        <h2 class="text-3xl font-extrabold text-secondary-900">
          Sign in to My Money
        </h2>
        <p class="mt-2 text-sm text-secondary-600">
          Manage your personal finances with ease
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="space-y-4">
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
              v-model="formData.email"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-secondary-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="formData.password"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Enter your password"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              v-model="formData.rememberMe"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-secondary-900">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <router-link
              to="/reset-password"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Forgot your password?
            </router-link>
          </div>
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
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-secondary-600">
            Don't have an account?
            <router-link
              to="/signup"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign up
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const authStore = useAuthStore()
const { execute, isLoading, error } = useApi()

const formData = ref({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const formErrors = ref({})

const validateForm = () => {
  const errors = {}
  
  if (!formData.value.email) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (!formData.value.password) {
    errors.password = 'Password is required'
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  const result = await execute(
    () => authStore.login(formData.value),
    {
      onSuccess: (userData) => {
        // Redirect to dashboard or intended page
        const redirectTo = router.currentRoute.value.query.redirect || '/dashboard'
        router.push(redirectTo)
      },
      onError: (error) => {
        // Handle specific validation errors from API
        if (error.errors) {
          formErrors.value = error.errors
        }
      }
    }
  )
  
  if (!result.success) {
    console.error('Login failed:', result.error)
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}
</script> 