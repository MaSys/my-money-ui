<template>
  <div class="max-w-4xl mx-auto py-8">
    <div class="bg-white rounded-lg shadow-lg p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-secondary-900">Manage Profiles</h1>
        <p class="text-secondary-600 mt-1">
          Edit, delete, or create new profiles for organizing your financial data
        </p>
      </div>

      <div class="mb-6">
        <router-link
          to="/profiles/create"
          class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          Create New Profile
        </router-link>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="profile in profiles"
          :key="profile.id"
          class="bg-secondary-50 rounded-lg p-4 border border-secondary-200"
        >
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
              <div 
                class="w-4 h-4 rounded-full"
                :style="{ backgroundColor: profile.color }"
              ></div>
              <h3 class="text-lg font-semibold text-secondary-900">
                {{ profile.name }}
              </h3>
              <span
                v-if="profile.isActive"
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
              >
                Active
              </span>
            </div>
            
            <div class="flex items-center space-x-2">
              <button
                @click="editProfile(profile)"
                class="p-1 text-secondary-500 hover:text-secondary-700"
              >
                <PencilIcon class="w-4 h-4" />
              </button>
              <button
                @click="deleteProfile(profile)"
                :disabled="profiles.length <= 1"
                class="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <TrashIcon class="w-4 h-4" />
              </button>
            </div>
          </div>

          <p class="text-sm text-secondary-600 mb-4">
            {{ profile.description || 'No description' }}
          </p>

          <div class="flex justify-between items-center">
            <button
              v-if="!profile.isActive"
              @click="switchToProfile(profile.id)"
              class="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Switch to this profile
            </button>
            <span v-else class="text-sm text-secondary-500">
              Currently active
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { useProfileStore } from '@/stores/profile'
import { useRouter } from 'vue-router'

const router = useRouter()
const profileStore = useProfileStore()

// Computed
const profiles = computed(() => profileStore.profileOptions)

// Methods
const switchToProfile = async (profileId) => {
  const result = await profileStore.switchProfile(profileId)
  if (result.success) {
    console.log('Profile switched successfully')
  } else {
    alert('Failed to switch profile: ' + result.error)
  }
}

const editProfile = (profile) => {
  router.push(`/profiles/edit/${profile.id}`)
}

const deleteProfile = async (profile) => {
  if (profiles.value.length <= 1) {
    alert('Cannot delete the last profile')
    return
  }

  if (confirm(`Are you sure you want to delete the profile "${profile.name}"? This action cannot be undone.`)) {
    const result = await profileStore.deleteProfile(profile.id)
    if (result.success) {
      console.log('Profile deleted successfully')
    } else {
      alert('Failed to delete profile: ' + result.error)
    }
  }
}

// Load profiles on mount
onMounted(() => {
  profileStore.fetchProfiles()
})
</script> 