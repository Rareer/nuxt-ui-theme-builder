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
  </UApp>
</template>

<script setup lang="ts">
import { useThemeCss } from './composables/useThemeCss';
import GlobalLoadingOverlay from './components/GlobalLoadingOverlay.vue';

// Initialize global CSS variables
useThemeCss();
</script>