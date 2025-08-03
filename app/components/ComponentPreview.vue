<template>
  <ThemePreview>
    <component :is="componentToRender" />
  </ThemePreview>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const props = defineProps({
  component: {
    type: String,
    required: true
  }
})

// Mapping from route names to component names
const componentMapping = {
  'button': 'UButton',
  // Add more mappings as needed
  // 'alert': 'UAlert',
  // 'badge': 'UBadge',
  // etc.
}

// Get the component name from the mapping or use the provided name directly
const componentName = computed(() => {
  return componentMapping[props.component] || props.component
})

// Dynamically import the component from the previews directory
const componentToRender = defineAsyncComponent(() => {
  try {
    return import(`~/components/previews/${componentName.value}.vue`)
  } catch (error) {
    console.error(`Failed to load component: ${componentName.value}`, error)
    return import('~/components/previews/UButton.vue') // Fallback component
  }
})
</script>