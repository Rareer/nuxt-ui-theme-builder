<template>
  <div class="theme-preview" :style="cssVariablesStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useColorsStore } from '../store/colors';
import type { Color } from '../types/color';

const colorStore = useColorsStore();

// Generate CSS variables from all colors in the store as an inline style object
const cssVariablesStyle = computed(() => {
  const colors = colorStore.getColors;
  if (!colors || colors.length === 0) return {};
  
  const styleObj: Record<string, string> = {};
  
  colors.forEach(color => {
    const colorName = color.name.toLowerCase().replace(/\s+/g, '-');
    Object.entries(color.values).forEach(([shade, value]) => {
      styleObj[`--color-${colorName}-${shade}`] = value;
    });
  });
  
  return styleObj;
});

// Watch for changes in the colors store to update CSS variables
watch(
  () => colorStore.colors,
  () => {
    // The computed property will automatically update
  },
  { deep: true }
);
</script>

<style scoped>
.theme-preview {
  /* Base styles for the theme preview container */
  display: contents;
}
</style>
