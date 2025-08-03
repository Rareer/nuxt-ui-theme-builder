<template>
  <div class="theme-preview" :style="allCssVariablesStyle">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useColorsStore } from '../store/colors';
import { useThemeStore } from '../store/theme';
import { tailwindColors } from '../utils/tailwindColors';
import type { Color } from '../types/color';

const colorStore = useColorsStore();
const themeStore = useThemeStore();

// Generate CSS variables from all colors in the store as an inline style object
const colorCssVariablesStyle = computed(() => {
  const styleObj: Record<string, string> = {};
  
  // Add custom colors from the store
  const colors = colorStore.getColors;
  if (colors && colors.length > 0) {
    colors.forEach(color => {
      const colorName = color.name.toLowerCase().replace(/\s+/g, '-');
      // Add base color variable (using 500 as default)
      styleObj[`--ui-color-${colorName}`] = color.values['500'];
      styleObj[`--color-${colorName}`] = color.values['500']; // Keep original for backward compatibility
      
      // Add all shade variants
      Object.entries(color.values).forEach(([shade, value]) => {
        styleObj[`--ui-color-${colorName}-${shade}`] = value;
        styleObj[`--color-${colorName}-${shade}`] = value; // Keep original for backward compatibility
      });
    });
  }
  
  // Add all Tailwind colors
  Object.entries(tailwindColors).forEach(([colorName, shades]) => {
    // Add base color variable (using 500 as default)
    if (shades['500']) {
      styleObj[`--ui-color-${colorName}`] = shades['500'];
      styleObj[`--color-${colorName}`] = shades['500']; // Keep original for backward compatibility
    }
    
    // Add all shade variants
    Object.entries(shades).forEach(([shade, value]) => {
      if (value) {
        styleObj[`--ui-color-${colorName}-${shade}`] = value;
        styleObj[`--color-${colorName}-${shade}`] = value; // Keep original for backward compatibility
      }
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
