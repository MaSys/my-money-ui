import { ref, onMounted, onUnmounted } from 'vue'
import { useProfileStore } from '@/stores/profile'

export function useProfileData() {
  const profileStore = useProfileStore()
  const isRefreshing = ref(false)
  const refreshCallbacks = ref([])

  // Register a callback to be called when profile switches
  const onProfileSwitch = (callback) => {
    refreshCallbacks.value.push(callback)
  }

  // Refresh all registered data
  const refreshAllData = async () => {
    if (isRefreshing.value) return
    
    isRefreshing.value = true
    
    try {
      // Execute all registered callbacks
      const promises = refreshCallbacks.value.map(callback => {
        try {
          return callback()
        } catch (error) {
          console.error('Error refreshing data:', error)
          return Promise.resolve()
        }
      })
      
      await Promise.all(promises)
      
      console.log('All profile data refreshed successfully')
    } catch (error) {
      console.error('Error refreshing profile data:', error)
    } finally {
      isRefreshing.value = false
    }
  }

  // Handle profile switch event
  const handleProfileSwitch = (event) => {
    const { newProfile, oldProfile } = event.detail
    console.log('Profile switched:', oldProfile?.name, '→', newProfile?.name)
    
    // Refresh all data after a short delay to ensure API context is updated
    setTimeout(refreshAllData, 100)
  }

  // Setup event listeners
  onMounted(() => {
    window.addEventListener('profile-switched', handleProfileSwitch)
  })

  onUnmounted(() => {
    window.removeEventListener('profile-switched', handleProfileSwitch)
  })

  return {
    isRefreshing,
    onProfileSwitch,
    refreshAllData,
    currentProfile: profileStore.currentProfile
  }
} 