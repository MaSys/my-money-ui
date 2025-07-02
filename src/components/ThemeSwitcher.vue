<template>
  <div class="space-y-3">
    <h3 class="text-sm font-medium text-secondary-900">Theme</h3>
    <div class="grid grid-cols-4 gap-2">
      <button
        v-for="themeOption in themes"
        :key="themeOption.name"
        @click="setTheme(themeOption.name)"
        :class="[
          'w-8 h-8 rounded-full border-2 transition-all',
          theme === themeOption.name
            ? 'border-secondary-900 scale-110'
            : 'border-secondary-300 hover:border-secondary-400'
        ]"
        :style="{ backgroundColor: themeOption.color }"
        :title="themeOption.label"
      >
        <CheckIcon
          v-if="theme === themeOption.name"
          class="w-4 h-4 text-white mx-auto"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { CheckIcon } from '@heroicons/vue/24/outline'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const { theme, themes } = storeToRefs(themeStore)
const { setTheme } = themeStore
</script> 