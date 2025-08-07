<template>
  <header class="h-16 px-6 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
    <div class="flex items-center">
    </div>
    <div class="flex items-center">
      <UNavigationMenu :items="items" orientation="horizontal" />
    </div>
    <div class="flex items-center gap-4">
      <!-- Export Theme Button -->
      <UButton
        icon="i-heroicons-arrow-down-tray"
        color="success"
        variant="soft"
        aria-label="Export Theme"
        @click="exportTheme"
        :loading="isExporting"
      />
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
  
  <!-- Theme Export Modal -->
  <UModal v-model:open="isExportModalOpen" size="xl" class="max-w-4xl">
    <template #header>
      <div class="flex items-center justify-between w-full">
        <h3 class="text-xl font-medium">Theme Export</h3>
        <UButton color="neutral" variant="ghost" icon="i-lucide-x" @click="closeExportModal" />
      </div>
    </template>
    
    <template #body>
      <div class="space-y-6 p-2">
        <!-- app.config.ts -->
        <div>
          <div class="flex items-center align-center justify-between mb-2">
            <label for="app-config" class="block text-sm font-medium">app.config.ts</label>
            <UButton
              icon="i-heroicons-clipboard"
              color="primary"
              variant="soft"
              size="sm"
              @click="copyToClipboard(appConfigContent)"
            />
          </div>
          <div class="relative">
            <!-- Highlighted code -->
            <div v-if="isHighlighterReady" class="rounded-md overflow-auto max-h-64" v-html="highlightedAppConfigContent"></div>
            
            <!-- Fallback textarea while highlighter loads -->
            <UTextarea
              v-else
              id="app-config"
              v-model="appConfigContent"
              :rows="8"
              class="font-mono text-sm w-full"
              readonly
            />
          </div>
        </div>
        
        <!-- main.css -->
        <div>
          <div class="flex items-center align-center justify-between mb-2">
            <label for="main-css" class="block text-sm font-medium">main.css</label>
            <UButton
              icon="i-heroicons-clipboard"
              color="primary"
              variant="soft"
              size="sm"
              @click="copyToClipboard(cssContent)"
            />
          </div>
          <div class="relative">
            <!-- Highlighted code -->
            <div v-if="isHighlighterReady" class="rounded-md overflow-auto max-h-64" v-html="highlightedCssContent"></div>
            
            <!-- Fallback textarea while highlighter loads -->
            <UTextarea
              v-else
              id="main-css"
              v-model="cssContent"
              :rows="12"
              class="font-mono text-sm w-full"
              readonly
            />
          </div>
        </div>
      </div>
    </template>
    
    <template #footer>
      <div class="flex justify-end">
        <UButton color="neutral" @click="closeExportModal">Schließen</UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import VariableConfigurator from './VariableConfigurator.vue';
import { useThemeExport } from '../composables/useThemeExport';

const colorMode = useColorMode();
const isThemeConfigOpen = ref(false);
const { 
  exportTheme, 
  isExporting, 
  isExportModalOpen, 
  cssContent, 
  appConfigContent, 
  highlightedCssContent,
  highlightedAppConfigContent,
  isHighlighterReady,
  closeExportModal 
} = useThemeExport();

const items = ref([
    {
        label: 'Startseite',
        to: '/'
    },
    {
        label: 'Pricing',
        to: '/pricing'
    },
    {
        label: 'How to',
        to: '/how-to'
    },
    {
        label: 'Pro',
        to: '/profeatures',
        icon: 'i-heroicons-star-20-solid'
    },
])
function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
}

// Copy text to clipboard
function copyToClipboard(text: string) {
  if (process.client) {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Could add a toast notification here if desired
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
}
</script>
