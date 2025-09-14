<template>
  <div class="container mx-auto py-10">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Öffentliche Themes</h1>
      <UButton to="/mythemes" icon="i-lucide-user">Meine Themes</UButton>
    </div>
    <div v-if="pending" class="flex items-center gap-2 text-sm text-gray-500">
      <ULoader size="sm" />
      Lädt…
    </div>

    <div v-else-if="items.length === 0" class="text-sm text-gray-500">
      Es sind derzeit keine öffentlichen Themes vorhanden.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="t in items" :key="t.id">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col">
              <span class="font-medium">{{ t.name }}</span>
              <span class="text-xs text-gray-500">von {{ (t as any).owner_name || 'Unbekannt' }} · Aktualisiert: {{ formatDate(t.updated_at || t.created_at) }}</span>
            </div>
            <UBadge color="primary">Öffentlich</UBadge>
          </div>
        </template>
        <p class="text-sm text-gray-500">{{ t.description || 'Kein Beschreibungstext' }}</p>
        <template #footer>
          <div class="flex gap-2">
            <UButton size="sm" icon="i-lucide-eye" @click="viewTheme(t.id)">Laden</UButton>
            <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-link" :to="`/themes/${t.id}`">Details</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
// Öffentlich zugänglich – keine Middleware notwendig
import type { ThemeListItem } from '../composables/useUserThemes';
import { useUserThemes } from '../composables/useUserThemes';

const { loadIntoBuilderById, formatDate } = useUserThemes();

const { data, pending, error, refresh } = useFetch<{ ok: boolean; items?: (ThemeListItem & { owner?: string })[]; error?: string }>(
  '/api/public-themes',
  { key: 'public-themes' },
);
const items = computed(() => data.value?.items || []);

async function viewTheme(id: string) {
  await loadIntoBuilderById(id);
}
</script>
