<template>
  <header class="h-16 px-6 flex items-center justify-between">
    <div class="flex items-center">
      <h1 class="text-lg font-semibold">Nuxt UI Theme Builder</h1>
    </div>
    <div class="flex items-center gap-4">
      <UButton
        icon="i-heroicons-moon-20-solid"
        color="neutral"
        variant="ghost"
        aria-label="Toggle dark mode"
        @click="toggleDark"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
