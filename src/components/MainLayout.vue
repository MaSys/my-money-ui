<template>
  <div class="min-h-screen bg-secondary-50 flex">
    <!-- Mobile menu button -->
    <div class="lg:hidden fixed top-4 left-4 z-50">
      <button
        @click="sidebarOpen = !sidebarOpen"
        class="p-2 rounded-md bg-white shadow-md hover:shadow-lg transition-shadow"
      >
        <Bars3Icon class="h-6 w-6 text-secondary-600" />
      </button>
    </div>

    <!-- Sidebar -->
    <Sidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <div class="flex-1 min-h-screen">
      <main class="p-4 lg:p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Bars3Icon } from '@heroicons/vue/24/outline'
import Sidebar from '@/components/Sidebar.vue'

const sidebarOpen = ref(false)
</script> 