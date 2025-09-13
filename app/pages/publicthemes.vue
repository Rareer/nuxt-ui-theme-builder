<template>
  <div class="container mx-auto py-10">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Öffentliche Themes</h1>
      <UButton to="/mythemes" icon="i-lucide-user">Meine Themes</UButton>
    </div>

    <UAlert icon="i-lucide-globe-2" color="green" title="Entdecke öffentlich geteilte Themes." class="mb-6" />

    <!-- Placeholder for public themes list -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="n in 6" :key="n">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">Public Theme {{ n }}</span>
            <UBadge color="green">Public</UBadge>
          </div>
        </template>
        <p class="text-sm text-gray-500">Platzhalter – hier erscheinen öffentliche Themes.</p>
        <template #footer>
          <div class="flex gap-2">
            <UButton size="sm" icon="i-lucide-eye">Ansehen</UButton>
            <UButton size="sm" color="gray" variant="outline" icon="i-lucide-share-2">Teilen</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// Öffentlich zugänglich – keine Middleware notwendig
</script>
