import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useProfileStore } from '@/stores/profile'

export function useProfileData(refreshCallback) {
  const profileStore = useProfileStore()
  const isRefreshing = ref(false)

  // Watch for profile changes and automatically refresh
  const stopWatching = watch(
    () => profileStore.currentProfile?.id,
    async (newProfileId, oldProfileId) => {
      // Skip the initial call and only trigger on actual changes
      if (oldProfileId !== undefined && newProfileId !== oldProfileId && refreshCallback) {
        console.log('Profile changed, refreshing data...')
        await refreshData()
      }
    }
  )

  // Refresh data function
  const refreshData = async () => {
    if (isRefreshing.value || !refreshCallback) return
    
    isRefreshing.value = true
    
    try {
      await refreshCallback()
      console.log('Data refreshed for profile:', profileStore.currentProfile?.name)
    } catch (error) {
      console.error('Error refreshing data:', error)
    } finally {
      isRefreshing.value = false
    }
  }

  // Manual refresh function
  const manualRefresh = () => refreshData()

  // Clean up watcher on unmount
  onUnmounted(() => {
    stopWatching()
  })

  return {
    isRefreshing,
    refreshData,
    manualRefresh,
    currentProfile: profileStore.currentProfile
  }
}

// Alternative composable for multiple refresh functions
export function useMultipleProfileData() {
  const profileStore = useProfileStore()
  const isRefreshing = ref(false)
  const refreshCallbacks = ref([])

  // Register a callback to be called when profile switches
  const onProfileSwitch = (callback) => {
    refreshCallbacks.value.push(callback)
  }

  // Remove a callback
  const offProfileSwitch = (callback) => {
    const index = refreshCallbacks.value.indexOf(callback)
    if (index > -1) {
      refreshCallbacks.value.splice(index, 1)
    }
  }

  // Watch for profile changes
  const stopWatching = watch(
    () => profileStore.currentProfile?.id,
    async (newProfileId, oldProfileId) => {
      // Skip the initial call and only trigger on actual changes
      if (oldProfileId !== undefined && newProfileId !== oldProfileId) {
        await refreshAllData()
      }
    }
  )

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

  // Clean up on unmount
  onUnmounted(() => {
    stopWatching()
    refreshCallbacks.value = []
  })

  return {
    isRefreshing,
    onProfileSwitch,
    offProfileSwitch,
    refreshAllData,
    currentProfile: profileStore.currentProfile
  }
} 