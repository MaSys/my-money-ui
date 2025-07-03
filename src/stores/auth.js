import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { useProfileStore } from '@/stores/profile'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('authToken') || null)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials)
      
      if (response.success) {
        const { email: email, user_id: userId, token: authToken } = response.data
        
        const userData = { email, userId }
        user.value = userData
        token.value = authToken
        localStorage.setItem('authToken', authToken)
        localStorage.setItem('user', JSON.stringify(userData))
        
        // Fetch profiles after successful login
        await initializeProfilesAfterAuth()
        
        return { success: true, user: userData }
      } else {
        return { success: false, error: response.error, errors: response.errors }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await authService.register(userData)
      
      if (response.success) {
        const { user: newUser, token: authToken } = response.data
        
        user.value = newUser
        token.value = authToken
        localStorage.setItem('authToken', authToken)
        localStorage.setItem('user', JSON.stringify(newUser))
        
        // Fetch profiles after successful registration
        await initializeProfilesAfterAuth()
        
        return { success: true, user: newUser }
      } else {
        return { success: false, error: response.error, errors: response.errors }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      // Call API to logout (optional - for session cleanup)
      await authService.logout()
    } catch (error) {
      console.warn('Logout API call failed:', error)
    } finally {
      // Always clear local state
      user.value = null
      token.value = null
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      localStorage.removeItem('currentProfileId')
    }
  }

  const resetPassword = async (email) => {
    try {
      const response = await authService.resetPassword(email)
      return response
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const verifyToken = async () => {
    try {
      const response = await authService.verifyToken()
      
      if (response.success) {
        user.value = response.data.user
        return { success: true, user: response.data.user }
      } else {
        // Token invalid, clear auth
        logout()
        return { success: false, error: response.error }
      }
    } catch (error) {
      // Token invalid, clear auth
      logout()
      return { success: false, error: error.message }
    }
  }

  const initAuth = async () => {
    const storedUser = localStorage.getItem('user')
    if (storedUser && token.value) {
      user.value = JSON.parse(storedUser)
      
      // Initialize profiles if user is authenticated
      await initializeProfilesAfterAuth()
      
      // Optionally verify token with server
      // await verifyToken()
    }
  }

  const initializeProfilesAfterAuth = async () => {
    try {
      // Get profile store instance
      const profileStore = useProfileStore()
      
      // Fetch profiles from the server
      const profilesResult = await profileStore.fetchProfiles()
      
      if (profilesResult.success && profilesResult.data.length > 0) {
        // Check if there's a saved profile in localStorage
        const savedProfileId = localStorage.getItem('currentProfileId')
        
        if (savedProfileId) {
          // Try to find the saved profile
          const savedProfile = profilesResult.data.find(p => p.id === parseInt(savedProfileId))
          if (savedProfile) {
            profileStore.currentProfile = savedProfile
            console.log('Profile restored from localStorage:', savedProfile.name)
            return
          }
        }
        
        // If no saved profile or saved profile not found, use the first profile
        const firstProfile = profilesResult.data.find(p => p.is_default) || profilesResult.data[0]
        profileStore.currentProfile = firstProfile
        localStorage.setItem('currentProfileId', firstProfile.id.toString())
        
        console.log('Profile initialized:', firstProfile.name)
      } else {
        // TODO: fix this
        // No profiles found - create a default profile for new users
        //console.log('No profiles found - creating default profile')
        //
        //const defaultProfileData = {
        //  name: 'Personal',
        //  description: 'My personal finances',
        //  color: '#3B82F6',
        //  is_default: true
        //}
        //
        //const createResult = await profileStore.createProfile(defaultProfileData)
        //if (createResult.success) {
        //  console.log('Default profile created:', createResult.data.name)
        //} else {
        //  console.error('Failed to create default profile:', createResult.error)
        //}
      }
    } catch (error) {
      console.error('Failed to initialize profiles:', error)
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    register,
    logout,
    resetPassword,
    verifyToken,
    initAuth,
    initializeProfilesAfterAuth
  }
}) 
