<template>
  <teleport to="body">
    <transition name="fade">
      <div v-if="ui.isLoading" class="fixed inset-0 z-[1000] flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" />
        <div class="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg p-6 w-[320px] flex flex-col items-center gap-4">
          <div class="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <div class="text-sm text-gray-700 dark:text-gray-200 text-center">
            {{ ui.loadingMessage || 'Lädt...' }}
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { useUiStore } from '../store/ui';
const ui = useUiStore();
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
