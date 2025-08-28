<script setup lang="ts">
const props = defineProps<{ render: () => any }>();
</script>

<template>
  <component :is="props.render" />
</template>
