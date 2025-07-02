import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const theme = ref(localStorage.getItem('theme') || 'blue')
  
  const themes = [
    { name: 'blue', label: 'Blue', color: '#3b82f6' },
    { name: 'green', label: 'Green', color: '#22c55e' },
    { name: 'purple', label: 'Purple', color: '#a855f7' },
    { name: 'red', label: 'Red', color: '#ef4444' }
  ]
  
  const setTheme = (newTheme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }
  
  // Initialize theme on load
  const initTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value)
  }
  
  // Watch for theme changes
  watch(theme, (newTheme) => {
    document.documentElement.setAttribute('data-theme', newTheme)
  })
  
  return {
    theme,
    themes,
    setTheme,
    initTheme
  }
}) 