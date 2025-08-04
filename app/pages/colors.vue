<script setup lang="ts">
import ThemePreview from '../components/ThemePreview.vue';
import ThemeMapping from '../components/ThemeMapping.vue';
import { useColorsStore } from '../store/colors';

const colorsStore = useColorsStore();
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold">Colors</h1>
    
    <!-- Tabs für verschiedene Ansichten -->
    <div class="mt-6">
      <UTabs :items="[
        { label: 'Farben verwalten', slot: 'colors' },
        { label: 'Theme-Variablen zuweisen', slot: 'theme' },
        { label: 'CSS-Variablen', slot: 'css' }
      ]">
        <template #colors>
          <div class="py-4">
            <ColorListing />
          </div>
        </template>
        
        <template #theme>
          <div class="py-4">
            <ThemeMapping />
          </div>
        </template>
        
        <template #css>
          <div class="py-4">
            <h2 class="text-xl font-bold mb-4">CSS-Variablen</h2>
            <div class="p-6 border rounded-lg">
              <p class="mb-4">Diese Vorschau zeigt alle definierten Farben als CSS-Variablen:</p>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div 
                  v-for="color in colorsStore.getColors" 
                  :key="color.name"
                  class="space-y-2"
                >
                  <h3 class="font-medium">{{ color.name }}</h3>
                  <div class="flex flex-col gap-1">
                    <div 
                      v-for="(value, shade) in color.values" 
                      :key="shade"
                      class="flex items-center gap-2"
                    >
                      <div 
                        class="w-8 h-8 rounded border" 
                        :style="{ backgroundColor: value }"
                      ></div>
                      <code class="text-xs">var(--ui-color-{{ color.name.toLowerCase().replace(/\s+/g, '-') }}-{{ shade }})</code>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UTabs>
    </div>
  </div>
</template>