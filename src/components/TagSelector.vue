<template>
  <div class="space-y-3">
    <!-- Input for searching/adding tags -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search or add tags..."
        @keydown.enter.prevent="addTag"
        @keydown.escape="searchQuery = ''"
        class="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
      />
      <div v-if="searchQuery" class="absolute right-2 top-2">
        <button
          @click="addTag"
          class="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded hover:bg-primary-200 transition-colors"
        >
          Add "{{ searchQuery }}"
        </button>
      </div>
    </div>

    <!-- Selected tags -->
    <div v-if="selectedTags.length > 0" class="space-y-2">
      <label class="block text-sm font-medium text-secondary-700">Selected Tags:</label>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in selectedTags"
          :key="tag"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800 group"
        >
          {{ tag }}
          <button
            @click="removeTag(tag)"
            class="ml-2 text-primary-600 hover:text-primary-800 transition-colors"
          >
            <XMarkIcon class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>

    <!-- Available tags to select -->
    <div v-if="filteredAvailableTags.length > 0" class="space-y-2">
      <label class="block text-sm font-medium text-secondary-700">Available Tags:</label>
      <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
        <button
          v-for="tag in filteredAvailableTags"
          :key="tag"
          @click="selectTag(tag)"
          class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-secondary-100 text-secondary-700 hover:bg-secondary-200 transition-colors"
        >
          {{ tag }}
          <PlusIcon class="w-3 h-3 ml-1" />
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loadingTags" class="text-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-2 border-primary-500 border-t-transparent mx-auto"></div>
      <p class="text-sm text-secondary-500 mt-2">Loading tags...</p>
    </div>

    <!-- Help text -->
    <p class="text-xs text-secondary-500">
      Type to search existing tags or press Enter to add new ones.
    </p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { XMarkIcon, PlusIcon } from '@heroicons/vue/24/outline'
import { apiClient } from '@/services/api'

// Props
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// State
const availableTags = ref([])
const loadingTags = ref(false)
const searchQuery = ref('')

// Computed
const selectedTags = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const filteredAvailableTags = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  return availableTags.value.filter(tag => {
    // Don't show already selected tags
    if (selectedTags.value.includes(tag)) return false
    
    // Filter by search query if present
    if (query) {
      return tag.toLowerCase().includes(query)
    }
    
    return true
  }).slice(0, 20) // Limit to 20 tags for performance
})

// Fetch available tags
async function fetchTags() {
  loadingTags.value = true
  
  try {
    const response = await apiClient.get('/tags')
    
    if (response.data) {
      availableTags.value = (response.data || []).map(o => o.name)
    } else {
      console.error('Failed to fetch tags')
      availableTags.value = []
    }
  } catch (error) {
    console.error('Error fetching tags:', error)
    availableTags.value = []
  } finally {
    loadingTags.value = false
  }
}

// Add a new tag
const addTag = () => {
  const newTag = searchQuery.value.trim()
  if (!newTag) return
  
  // Check if tag already exists (case insensitive)
  const exists = selectedTags.value.some(tag => 
    tag.toLowerCase() === newTag.toLowerCase()
  )
  
  if (!exists) {
    selectedTags.value = [...selectedTags.value, newTag]
    
    // Add to available tags if not already there
    if (!availableTags.value.includes(newTag)) {
      availableTags.value.push(newTag)
    }
  }
  
  searchQuery.value = ''
}

// Select an existing tag
const selectTag = (tag) => {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value = [...selectedTags.value, tag]
  }
  searchQuery.value = ''
}

// Remove a selected tag
const removeTag = (tag) => {
  selectedTags.value = selectedTags.value.filter(t => t !== tag)
}

// Load tags on mount
onMounted(() => {
  fetchTags()
})
</script> 
