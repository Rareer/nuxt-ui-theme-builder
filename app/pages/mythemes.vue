<template>
  <div class="container mx-auto py-10">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Meine Themes</h1>
      <div class="flex items-center gap-2">
        <UButton to="/publicthemes" icon="i-lucide-globe-2" variant="soft">Öffentliche Themes</UButton>
        <UButton color="gray" variant="outline" @click="logout" icon="i-lucide-log-out">Logout</UButton>
      </div>
    </div>

    <UAlert icon="i-lucide-info" color="blue" title="Hier kannst du deine gespeicherten Themes verwalten." class="mb-6" />

    <!-- Placeholder for user's themes list -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="n in 3" :key="n">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-medium">Theme {{ n }}</span>
            <UBadge color="gray">Entwurf</UBadge>
          </div>
        </template>
        <p class="text-sm text-gray-500">Platzhalter – hier erscheinen deine Themes, sobald die Speicherung angebunden ist.</p>
        <template #footer>
          <div class="flex gap-2">
            <UButton size="sm" icon="i-lucide-eye">Ansehen</UButton>
            <UButton size="sm" color="gray" variant="outline" icon="i-lucide-trash-2">Löschen</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] });

const client = useSupabaseClient();

async function logout() {
  await client.auth.signOut();
  await navigateTo('/login');
}
</script>
