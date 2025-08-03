<script setup lang="ts">
import ThemePreview from '../components/ThemePreview.vue';
import { useColorsStore } from '../store/colors';

const colorsStore = useColorsStore();
</script>

<template>
  <ThemePreview>
    <div>
      <h1 class="text-2xl font-bold">Colors</h1>
      <ColorListing />
      
      <!-- Theme Preview Section -->
      <div class="mt-10">
        <h2 class="text-xl font-bold mb-4">Theme Preview</h2>
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
                  <code class="text-xs">var(--color-{{ color.name.toLowerCase().replace(/\s+/g, '-') }}-{{ shade }})</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ThemePreview>
</template>