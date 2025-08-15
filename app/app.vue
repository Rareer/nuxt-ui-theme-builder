<template>
  <UApp>
    <div class="flex h-screen">
      <!-- Sidebar -->
      <AppSidebar class="w-64 border-r border-gray-200 dark:border-gray-800" />
      
      <!-- Main Content -->
      <div class="flex flex-col flex-1 overflow-hidden">
        <!-- Header -->
        <AppHeader class="border-b border-gray-200 dark:border-gray-800" />
        
        <!-- Page Content -->
        <main class="flex-1 overflow-auto p-4">
          <NuxtPage />
        </main>
      </div>
    </div>
    <!-- Global Loading Overlay -->
    <GlobalLoadingOverlay />
    <Analytics />
  </UApp>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useThemeCss } from './composables/useThemeCss';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay.vue';
import { Analytics } from '@vercel/analytics/nuxt'
import { useThemeStore } from './store/theme'

// Initialize global CSS variables
useThemeCss();

// Keep theme store's editMode in sync with global color mode
const themeStore = useThemeStore()
const colorMode = useColorMode()

if (process.client) {
  watch(() => colorMode.value, (val) => {
    themeStore.setEditMode(val === 'dark' ? 'dark' : 'light')
  }, { immediate: true })
}
</script>