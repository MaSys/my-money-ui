<template>
  <div class="relative w-full">
    <!-- Profile Switcher Button -->
    <button
      @click="toggleDropdown"
      class="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg bg-secondary-100 hover:bg-secondary-200 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
      :class="{ 'bg-secondary-200': isOpen }"
    >
      <div class="flex items-center space-x-2">
        <div 
          class="w-3 h-3 rounded-full"
          :style="{ backgroundColor: currentProfile?.color || '#3B82F6' }"
        ></div>
        <span class="text-secondary-900">{{ currentProfile?.name || 'Select Profile' }}</span>
      </div>
      <ChevronDownIcon 
        class="w-4 h-4 text-secondary-500 transition-transform flex-shrink-0"
        :class="{ 'rotate-180': isOpen }"
      />
    </button>

    <!-- Dropdown Menu -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
        @click.stop
      >
        <div class="py-1">
          <!-- Profile Options -->
          <div class="px-3 py-2">
            <p class="text-xs font-medium text-secondary-500 uppercase tracking-wider">
              Your Profiles
            </p>
          </div>
          
          <div class="max-h-48 overflow-y-auto">
            <button
              v-for="profile in profileOptions"
              :key="profile.id"
              @click="handleSwitchProfile(profile.id)"
              class="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-secondary-50 transition-colors"
              :class="{ 'bg-primary-50 text-primary-900': profile.isActive }"
            >
              <div class="flex items-center space-x-3">
                <div 
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: profile.color }"
                ></div>
                <div class="text-left">
                  <div class="font-medium">{{ profile.name }}</div>
                  <div class="text-xs text-secondary-500" v-if="profile.description">
                    {{ profile.description }}
                  </div>
                </div>
              </div>
              
              <CheckIcon 
                v-if="profile.isActive"
                class="w-4 h-4 text-primary-600"
              />
            </button>
          </div>
          
          <!-- Loading State -->
          <div v-if="loading" class="px-3 py-2 text-sm text-secondary-500">
            <div class="flex items-center space-x-2">
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
              <span>Switching profile...</span>
            </div>
          </div>
          
          <!-- Divider -->
          <div class="border-t border-secondary-200 my-1"></div>
          
          <!-- Actions -->
          <button
            @click="handleCreateProfile"
            class="w-full flex items-center px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <PlusIcon class="w-4 h-4 mr-3" />
            Create New Profile
          </button>
          
          <button
            @click="handleManageProfiles"
            class="w-full flex items-center px-3 py-2 text-sm text-secondary-700 hover:bg-secondary-50 transition-colors"
          >
            <Cog6ToothIcon class="w-4 h-4 mr-3" />
            Manage Profiles
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDownIcon, CheckIcon, PlusIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
import { useProfileStore } from '@/stores/profile'
import { useRouter } from 'vue-router'

const router = useRouter()
const profileStore = useProfileStore()

// State
const isOpen = ref(false)

// Computed
const currentProfile = computed(() => profileStore.currentProfile)
const profileOptions = computed(() => profileStore.profileOptions)
const loading = computed(() => profileStore.loading)

// Methods
const toggleDropdown = () => {
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleSwitchProfile = async (profileId) => {
  if (currentProfile.value?.id === profileId) {
    closeDropdown()
    return
  }

  const result = await profileStore.switchProfile(profileId)
  
  if (result.success) {
    closeDropdown()
    // Optionally show success message
  } else {
    console.error('Failed to switch profile:', result.error)
    // Optionally show error message
  }
}

const handleCreateProfile = () => {
  closeDropdown()
  router.push('/profiles/create')
}

const handleManageProfiles = () => {
  closeDropdown()
  router.push('/profiles/manage')
}

// Click outside to close
const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.relative')) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script> 
