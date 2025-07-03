import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)
  
  // Computed property to check if user is authenticated
  const isAuthenticated = computed(() => {
    return !!token.value && !!user.value
  })
  
  // Login function
  const login = async (credentials) => {
    try {
      // Simulate API call - replace with your actual API endpoint
      console.log('Logging in with:', credentials)
      
      // Simulate successful login
      const mockUser = {
        id: 1,
        name: 'John Doe',
        email: credentials.email
      }
      const mockToken = 'mock-jwt-token-' + Date.now()
      
      // Set user and token
      user.value = mockUser
      token.value = mockToken
      
      // Store token in localStorage for persistence
      localStorage.setItem('authToken', mockToken)
      localStorage.setItem('user', JSON.stringify(mockUser))
      
      return { success: true, user: mockUser }
    } catch (error) {
      console.error('Login failed:', error)
      return { success: false, error: error.message }
    }
  }
  
  // Logout function
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }
  
  // Initialize authentication state from localStorage
  const initAuth = () => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        token.value = savedToken
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Failed to restore auth state:', error)
        logout() // Clear invalid data
      }
    }
  }
  
  // Check if token is valid (you can add API call to verify)
  const checkAuthStatus = async () => {
    if (!token.value) return false
    
    try {
      // Simulate API call to verify token
      // Replace with your actual token verification endpoint
      console.log('Verifying token...')
      
      // For demo purposes, assume token is valid
      return true
    } catch (error) {
      console.error('Token verification failed:', error)
      logout() // Clear invalid token
      return false
    }
  }
  
  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    initAuth,
    checkAuthStatus
  }
}) 