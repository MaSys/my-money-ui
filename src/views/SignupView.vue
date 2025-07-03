<template>
  <div class="min-h-screen flex items-center justify-center bg-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mb-4">
          <span class="text-white font-bold text-2xl">$</span>
        </div>
        <h2 class="text-3xl font-extrabold text-secondary-900">
          Create your account
        </h2>
        <p class="mt-2 text-sm text-secondary-600">
          Start managing your finances today
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-secondary-700">
                First name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                v-model="form.firstName"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="First name"
              />
            </div>
            
            <div>
              <label for="lastName" class="block text-sm font-medium text-secondary-700">
                Last name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                v-model="form.lastName"
                class="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Last name"
              />
            </div>
          </div>
          
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
              v-model="form.email"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
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
              required
              v-model="form.password"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Create a password"
            />
          </div>
          
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-secondary-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              v-model="form.confirmPassword"
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-secondary-300 placeholder-secondary-500 text-secondary-900 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="Confirm your password"
            />
            <p v-if="passwordMismatch" class="mt-1 text-sm text-red-600">
              Passwords do not match
            </p>
          </div>
        </div>

        <div class="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            v-model="form.acceptTerms"
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
          />
          <label for="terms" class="ml-2 block text-sm text-secondary-900">
            I agree to the
            <a href="#" class="text-primary-600 hover:text-primary-500">Terms of Service</a>
            and
            <a href="#" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
          </label>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isLoading || passwordMismatch || !form.acceptTerms"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isLoading" class="mr-2">
              <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ isLoading ? 'Creating account...' : 'Create account' }}
          </button>
        </div>

        <div class="text-center">
          <p class="text-sm text-secondary-600">
            Already have an account?
            <router-link
              to="/login"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </router-link>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useApi } from '@/composables/useApi'

const router = useRouter()
const authStore = useAuthStore()
const { execute, isLoading, error } = useApi()

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false
})

const formErrors = ref({})

const passwordMismatch = computed(() => {
  return form.value.password !== form.value.confirmPassword && form.value.confirmPassword !== ''
})

const validateForm = () => {
  const errors = {}
  
  if (!form.value.firstName) {
    errors.firstName = 'First name is required'
  }
  
  if (!form.value.lastName) {
    errors.lastName = 'Last name is required'
  }
  
  if (!form.value.email) {
    errors.email = 'Email is required'
  } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (!form.value.password) {
    errors.password = 'Password is required'
  } else if (form.value.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
  }
  
  if (!form.value.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
  }
  
  if (!form.value.acceptTerms) {
    errors.acceptTerms = 'You must accept the terms and conditions'
  }
  
  formErrors.value = errors
  return Object.keys(errors).length === 0
}

const handleSignup = async () => {
  if (!validateForm()) return
  
  const userData = {
    firstName: form.value.firstName,
    lastName: form.value.lastName,
    email: form.value.email,
    password: form.value.password,
    confirmPassword: form.value.confirmPassword
  }
  
  const result = await execute(
    () => authStore.register(userData),
    {
      onSuccess: (userData) => {
        // Redirect to dashboard after successful registration
        router.push('/dashboard')
      },
      onError: (error) => {
        // Handle specific validation errors from API
        if (error.errors) {
          formErrors.value = error.errors
        } else {
          alert('Registration failed: ' + error.error)
        }
      }
    }
  )
  
  if (!result.success) {
    console.error('Registration failed:', result.error)
  }
}
</script> 