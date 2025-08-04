<template>
  <div class="p-6 flex items-center justify-center">
    <ComponentPreview :component="name as string" />
  </div>
</template>
<script setup lang="ts">
const route = useRoute()
const name = route.params.name
</script>