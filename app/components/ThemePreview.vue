<template>
  <div class="theme-preview" :style="allCssVariablesStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useColorsStore } from '../store/colors';
import { useThemeStore } from '../store/theme';
import type { Color } from '../types/color';

const colorStore = useColorsStore();
const themeStore = useThemeStore();

// Generate CSS variables from all colors in the store as an inline style object
const colorCssVariablesStyle = computed(() => {
  const colors = colorStore.getColors;
  if (!colors || colors.length === 0) return {};
  
  const styleObj: Record<string, string> = {};
  
  colors.forEach(color => {
    const colorName = color.name.toLowerCase().replace(/\s+/g, '-');
    // Add base color variable (using 500 as default)
    styleObj[`--color-${colorName}`] = color.values['500'];
    
    // Add all shade variants
    Object.entries(color.values).forEach(([shade, value]) => {
      styleObj[`--color-${colorName}-${shade}`] = value;
    });
  });
  
  return styleObj;
});

// Get theme CSS variables from the theme store
const themeCssVariablesStyle = computed(() => {
  return themeStore.getThemeCssVariables;
});

// Combine all CSS variables
const allCssVariablesStyle = computed(() => {
  return {
    ...colorCssVariablesStyle.value,
    ...themeCssVariablesStyle.value
  };
});

// Watch for changes in the colors store to update CSS variables
watch(
  [() => colorStore.colors, () => themeStore.mappings],
  () => {
    // The computed properties will automatically update
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
