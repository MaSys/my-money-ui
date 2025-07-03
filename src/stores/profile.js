import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { profileService } from '@/services/profileService'

export const useProfileStore = defineStore('profile', () => {
  // State
  const profiles = ref([])
  const currentProfile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const hasProfiles = computed(() => profiles.value.length > 0)
  const hasCurrentProfile = computed(() => !!currentProfile.value)
  const profileOptions = computed(() => 
    profiles.value.map(profile => ({
      id: profile.id,
      name: profile.name,
      description: profile.description,
      color: profile.color || '#3B82F6',
      isActive: profile.id === currentProfile.value?.id
    }))
  )

  // Watch for profile changes to emit events
  watch(currentProfile, (newProfile, oldProfile) => {
    if (newProfile && oldProfile && newProfile.id !== oldProfile.id) {
      // Profile switched - emit event for other stores to refresh data
      window.dispatchEvent(new CustomEvent('profile-switched', {
        detail: {
          newProfile,
          oldProfile
        }
      }))
    }
  })

  // Actions
  const fetchProfiles = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await profileService.getProfiles()
      
      if (response.success) {
        profiles.value = response.data.profiles || []
        
        // Set current profile if not set and profiles exist
        if (!currentProfile.value && profiles.value.length > 0) {
          currentProfile.value = profiles.value.find(p => p.is_default) || profiles.value[0]
        }
        
        return { success: true, data: profiles.value }
      } else {
        error.value = response.error
        return { success: false, error: response.error }
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const switchProfile = async (profileId) => {
    if (!profileId || currentProfile.value?.id === profileId) {
      return { success: true, data: currentProfile.value }
    }

    loading.value = true
    error.value = null
    
    try {
      // Call API to switch profile context
      const response = await profileService.switchProfile(profileId)
      
      if (response.success) {
        // Update current profile
        const newProfile = profiles.value.find(p => p.id === profileId)
        if (newProfile) {
          currentProfile.value = newProfile
          
          // Store in localStorage for persistence
          localStorage.setItem('currentProfileId', profileId.toString())
          
          return { success: true, data: newProfile }
        }
      }
      
      error.value = response.error
      return { success: false, error: response.error }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const createProfile = async (profileData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await profileService.createProfile(profileData)
      
      if (response.success) {
        const newProfile = response.data.profile
        profiles.value.push(newProfile)
        
        // Switch to new profile if it's the first one
        if (profiles.value.length === 1) {
          currentProfile.value = newProfile
          localStorage.setItem('currentProfileId', newProfile.id.toString())
        }
        
        return { success: true, data: newProfile }
      } else {
        error.value = response.error
        return { success: false, error: response.error }
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const updateProfile = async (profileId, profileData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await profileService.updateProfile(profileId, profileData)
      
      if (response.success) {
        const updatedProfile = response.data.profile
        const index = profiles.value.findIndex(p => p.id === profileId)
        
        if (index !== -1) {
          profiles.value[index] = updatedProfile
          
          // Update current profile if it's the one being updated
          if (currentProfile.value?.id === profileId) {
            currentProfile.value = updatedProfile
          }
        }
        
        return { success: true, data: updatedProfile }
      } else {
        error.value = response.error
        return { success: false, error: response.error }
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const deleteProfile = async (profileId) => {
    if (profiles.value.length <= 1) {
      return { success: false, error: 'Cannot delete the last profile' }
    }

    loading.value = true
    error.value = null
    
    try {
      const response = await profileService.deleteProfile(profileId)
      
      if (response.success) {
        profiles.value = profiles.value.filter(p => p.id !== profileId)
        
        // Switch to another profile if current profile was deleted
        if (currentProfile.value?.id === profileId) {
          const newProfile = profiles.value[0]
          currentProfile.value = newProfile
          localStorage.setItem('currentProfileId', newProfile.id.toString())
        }
        
        return { success: true }
      } else {
        error.value = response.error
        return { success: false, error: response.error }
      }
    } catch (err) {
      error.value = err.message
      return { success: false, error: err.message }
    } finally {
      loading.value = false
    }
  }

  const initializeProfile = async () => {
    // Try to restore current profile from localStorage
    const savedProfileId = localStorage.getItem('currentProfileId')
    
    if (savedProfileId && profiles.value.length > 0) {
      const savedProfile = profiles.value.find(p => p.id === parseInt(savedProfileId))
      if (savedProfile) {
        currentProfile.value = savedProfile
      }
    }
  }

  const clearProfile = () => {
    profiles.value = []
    currentProfile.value = null
    error.value = null
    localStorage.removeItem('currentProfileId')
  }

  return {
    // State
    profiles,
    currentProfile,
    loading,
    error,
    
    // Computed
    hasProfiles,
    hasCurrentProfile,
    profileOptions,
    
    // Actions
    fetchProfiles,
    switchProfile,
    createProfile,
    updateProfile,
    deleteProfile,
    initializeProfile,
    clearProfile
  }
}) 