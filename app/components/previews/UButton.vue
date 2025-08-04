<template>
  <UButton 
    label="Button" 
    :color="color" 
    :variant="variant" 
    :size="size" 
 />
</template>
<script setup lang="ts">
defineProps({
  color: {
    type: String,
    default: 'primary'
  },
  variant: {
    type: String,
    default: 'solid'
  },
  size: {
    type: String,
    default: 'md'
  }
})
defineExpose({
  name: 'UButton',
  config: {
    variants: {
     variant: {
      
     }
    }
  }
})
</script>