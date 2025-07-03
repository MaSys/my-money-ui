import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import SignupView from '@/views/SignupView.vue'
import ResetPasswordView from '@/views/ResetPasswordView.vue'
import DashboardView from '@/views/DashboardView.vue'
import MainLayout from '@/components/MainLayout.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { 
        requiresAuth: false,
        guestOnly: true // Only accessible to non-authenticated users
      }
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
      meta: { 
        requiresAuth: false,
        guestOnly: true // Only accessible to non-authenticated users
      }
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPasswordView,
      meta: { 
        requiresAuth: false,
        guestOnly: true // Only accessible to non-authenticated users
      }
    },
    {
      path: '/',
      component: MainLayout,
      meta: { requiresAuth: true }, // Protect the entire layout
      children: [
        {
          path: '',
          name: 'dashboard',
          component: DashboardView,
          meta: { requiresAuth: true }
        },
        {
          path: 'transactions',
          name: 'transactions',
          component: () => import('@/views/TransactionsView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'accounts',
          name: 'accounts',
          component: () => import('@/views/AccountsView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'budgets',
          name: 'budgets',
          component: () => import('@/views/BudgetsView.vue'),
          meta: { requiresAuth: true }
        }
        // Add more protected routes here as needed
      ]
    },
    {
      path: '/profiles',
      component: MainLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: 'create',
          name: 'create-profile',
          component: () => import('@/views/ProfileCreateView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'manage',
          name: 'manage-profiles',
          component: () => import('@/views/ProfileManageView.vue'),
          meta: { requiresAuth: true }
        }
      ]
    },
    {
      // Catch-all route - redirect to dashboard if authenticated, login if not
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      redirect: (to) => {
        const authStore = useAuthStore()
        return authStore.isAuthenticated ? '/' : '/login'
      }
    }
  ]
})

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  // Initialize auth state if not already done
  if (!authStore.user && localStorage.getItem('authToken')) {
    await authStore.initAuth()
  }
  
  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)
  
  console.log('Navigation Guard:', {
    to: to.name,
    isAuthenticated,
    requiresAuth,
    guestOnly
  })
  
  // If route requires authentication and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    console.log('Redirecting to login - authentication required')
    next({
      name: 'login',
      query: { redirect: to.fullPath } // Save intended destination
    })
    return
  }
  
  // If route is guest-only (login, signup, etc.) and user is authenticated
  if (guestOnly && isAuthenticated) {
    console.log('Redirecting to dashboard - user already authenticated')
    next({ name: 'dashboard' })
    return
  }
  
  // Allow navigation
  next()
})

export default router 
