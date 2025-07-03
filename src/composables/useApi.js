import { ref, computed, readonly } from 'vue'

export function useApi() {
  const loading = ref(false)
  const error = ref(null)
  const data = ref(null)

  // Computed properties
  const isLoading = computed(() => loading.value)
  const hasError = computed(() => error.value !== null)
  const hasData = computed(() => data.value !== null)

  // Execute API call with loading and error handling
  const execute = async (apiCall, options = {}) => {
    const { 
      showLoading = true, 
      clearPreviousData = true,
      onSuccess = null,
      onError = null 
    } = options

    try {
      // Reset state
      if (clearPreviousData) data.value = null
      error.value = null
      if (showLoading) loading.value = true

      // Execute the API call
      const response = await apiCall()

      // Handle success
      if (response.success) {
        data.value = response.data
        if (onSuccess) onSuccess(response.data)
        return { success: true, data: response.data }
      } else {
        // Handle API error response
        error.value = response.error || 'An error occurred'
        if (onError) onError(response)
        return { success: false, error: response.error, errors: response.errors }
      }
    } catch (err) {
      // Handle unexpected errors
      const errorMessage = err.message || 'An unexpected error occurred'
      error.value = errorMessage
      if (onError) onError({ error: errorMessage })
      return { success: false, error: errorMessage }
    } finally {
      if (showLoading) loading.value = false
    }
  }

  // Reset all state
  const reset = () => {
    loading.value = false
    error.value = null
    data.value = null
  }

  // Clear only error
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    loading: readonly(loading),
    error: readonly(error),
    data: readonly(data),

    // Computed
    isLoading,
    hasError,
    hasData,

    // Methods
    execute,
    reset,
    clearError
  }
} 