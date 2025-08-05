<template>
  <div class="p-6">
    <ComponentPreview :component="component.value" />
  </div>
</template>
<script setup lang="ts">
const { availableComponents } = useComponentPreviewConfig()
const route = useRoute()
const name = route.params.name
const component = availableComponents.find((component) => component.value === name)
if (!component) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Component not supported yet.'
    })
}
</script>