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
          path: 'transactions/create',
          name: 'transaction-create',
          component: () => import('@/views/TransactionCreateView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'transactions/:id/edit',
          name: 'transaction-edit',
          component: () => import('@/views/TransactionEditView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'accounts',
          name: 'accounts',
          component: () => import('@/views/AccountsView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'accounts/:id',
          name: 'account-detail',
          component: () => import('@/views/AccountDetailView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'reports/projected-balance',
          name: 'projected-balance',
          component: () => import('@/views/ProjectedBalanceView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'reports/income-expenses',
          name: 'income-expenses',
          component: () => import('@/views/IncomeExpensesView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'reports/transactions',
          name: 'transactions-report',
          component: () => import('@/views/TransactionsReportView.vue'),
          meta: { requiresAuth: true }
        },
        {
          path: 'templates',
          name: 'templates',
          component: () => import('@/views/TemplateManageView.vue'),
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
  
  // If route requires authentication and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath } // Save intended destination
    })
    return
  }
  
  // If route is guest-only (login, signup, etc.) and user is authenticated
  if (guestOnly && isAuthenticated) {
    next({ name: 'dashboard' })
    return
  }
  
  // Allow navigation
  next()
})

export default router 
