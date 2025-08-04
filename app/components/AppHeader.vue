<template>
  <header class="h-16 px-6 flex items-center justify-between border-b border-gray-200">
    <div class="flex items-center">
      <h1 class="text-xl font-bold">NuxtUI Theme Builder</h1>
    </div>
    <div class="flex items-center gap-4">
      <!-- Theme Configuration Button -->
      <UButton
        icon="i-lucide-palette"
        color="primary"
        variant="soft"
        aria-label="Theme Configuration"
        @click="isThemeConfigOpen = true"
      />
      <!-- Dark Mode Toggle -->
      <UButton
        icon="i-heroicons-moon-20-solid"
        color="neutral"
        variant="soft"
        aria-label="Toggle dark mode"
        @click="toggleDark"
      />
    </div>
  </header>
  
  <!-- Theme Configuration Slideover -->
  <USlideover v-model:open="isThemeConfigOpen" side="right" :width="500">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-xl font-medium">Theme-Konfiguration</h3>
        <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="isThemeConfigOpen = false" />
      </div>
    </template>
    
    <template #content>
      <div class="overflow-auto h-full">
        <VariableConfigurator />
      </div>
    </template>
  </USlideover>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import VariableConfigurator from './VariableConfigurator.vue';

const colorMode = useColorMode();
const isThemeConfigOpen = ref(false);

function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
}
</script>
