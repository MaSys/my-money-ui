<template>
  <!-- Mobile backdrop -->
  <div
    v-if="open"
    class="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
    @click="$emit('close')"
  ></div>

  <!-- Sidebar -->
  <div
    :class="[
      'fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:relative lg:z-auto',
      open ? 'translate-x-0' : '-translate-x-full'
    ]"
  >
    <div class="flex flex-col h-full">
      <!-- Logo -->
      <div class="flex items-center justify-between h-16 px-6 border-b border-secondary-200">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">$</span>
          </div>
          <span class="ml-3 text-xl font-semibold text-secondary-900">My Money</span>
        </div>
        <button
          @click="$emit('close')"
          class="lg:hidden p-1 rounded-md hover:bg-secondary-100"
        >
          <XMarkIcon class="h-5 w-5 text-secondary-500" />
        </button>
      </div>

      <!-- Profile Switcher -->
      <div class="px-4 py-3 border-b border-secondary-200">
        <ProfileSwitcher />
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-4 py-6 space-y-2">
        <router-link
          to="/"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
          :class="$route.name === 'dashboard' ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'"
        >
          <HomeIcon class="mr-3 h-5 w-5" />
          Dashboard
        </router-link>

        <router-link
          to="/transactions"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
          :class="$route.name === 'transactions' ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'"
        >
          <BanknotesIcon class="mr-3 h-5 w-5" />
          Transactions
        </router-link>

        <router-link
          to="/accounts"
          class="flex items-center px-4 py-3 text-sm font-medium rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
          :class="$route.name === 'accounts' ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'"
        >
          <CreditCardIcon class="mr-3 h-5 w-5" />
          Accounts
        </router-link>

        <a
          href="#"
          class="flex items-center px-4 py-3 text-sm font-medium text-secondary-700 rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
        >
          <CogIcon class="mr-3 h-5 w-5" />
          Settings
        </a>

        <!-- Reports Menu -->
        <div class="space-y-1">
          <div class="text-xs font-semibold text-secondary-500 uppercase tracking-wide px-4">
            Reports
          </div>
          <router-link
            to="/reports/projected-balance"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
            :class="$route.name === 'projected-balance' ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'"
          >
            <ChartBarIcon class="mr-3 h-4 w-4" />
            Projected Balance
          </router-link>
          <router-link
            to="/reports/income-expenses"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
            :class="$route.name === 'income-expenses' ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'"
          >
            <PresentationChartBarIcon class="mr-3 h-4 w-4" />
            Income vs Expenses
          </router-link>
          <router-link
            to="/reports/transactions"
            class="flex items-center px-4 py-2 text-sm font-medium rounded-lg hover:bg-primary-50 hover:text-primary-700 transition-colors"
            :class="$route.name === 'transactions-report' ? 'bg-primary-100 text-primary-700' : 'text-secondary-700'"
          >
            <BanknotesIcon class="mr-3 h-4 w-4" />
            Transactions Report
          </router-link>
        </div>
      </nav>

      <!-- Theme Switcher -->
      <!--
      <div class="p-4 border-t border-secondary-200">
        <ThemeSwitcher />
      </div>
      -->

      <!-- User section -->
      <div class="p-4 border-t border-secondary-200">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
            <span class="text-white text-sm font-medium">JD</span>
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-secondary-900">John Doe</p>
            <p class="text-xs text-secondary-500">john@example.com</p>
          </div>
        </div>
        <button
          @click="logout"
          class="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
        >
          <ArrowRightOnRectangleIcon class="mr-2 h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import {
  HomeIcon,
  BanknotesIcon,
  ChartBarIcon,
  CreditCardIcon,
  CogIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  PresentationChartLineIcon,
  PresentationChartBarIcon
} from '@heroicons/vue/24/outline'
import ThemeSwitcher from '@/components/ThemeSwitcher.vue'
import ProfileSwitcher from '@/components/ProfileSwitcher.vue'
import { useAuthStore } from '@/stores/auth'

defineProps({
  open: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])

const router = useRouter()
const authStore = useAuthStore()

const logout = () => {
  // Use auth store to logout
  authStore.logout()
  
  // Redirect to login page
  router.push('/login')
}
</script> 
