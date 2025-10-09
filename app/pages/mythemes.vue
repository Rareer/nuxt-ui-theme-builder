<template>
  <div class="container mx-auto py-10">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-semibold">Meine Themes</h1>
      <div class="flex items-center gap-2">
        <UButton to="/publicthemes" icon="i-lucide-globe-2" variant="soft">Öffentliche Themes</UButton>
        <UButton color="secondary" variant="outline" @click="logout" icon="i-lucide-log-out">Logout</UButton>
      </div>
    </div>
    <div v-if="pending" class="flex items-center gap-2 text-sm text-gray-500">
      <ULoader size="sm" />
      Lädt…
    </div>

    <div v-else-if="items.length === 0" class="text-sm text-gray-500">
      Du hast noch keine gespeicherten Themes.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <UCard v-for="t in items" :key="t.id">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col">
              <span class="font-medium">{{ t.name }}</span>
              <span class="text-xs text-gray-500">Aktualisiert: {{ formatDate(t.updated_at || t.created_at) }}</span>
            </div>
            <div class="flex items-center gap-2">
              <UBadge :color="t.is_public ? 'primary' : 'neutral'">{{ t.is_public ? 'Öffentlich' : 'Privat' }}</UBadge>
              <USwitch :model-value="t.is_public" @update:model-value="(val:boolean) => updatePublic(t.id, val)" />
            </div>
          </div>
        </template>
        <div class="mb-3">
          <!-- Live test preview rendered client-side from snapshot to verify exact colors/UI -->
          <div class="mb-2 text-xs text-gray-500">Live Test Preview</div>
          <div class="rounded-md overflow-hidden border border-gray-200/50 dark:border-white/10 w-full">
            <ThemePreviewStage :snapshot="(t as any).data" mode="light" :width="640" :height="336" />
          </div>
        </div>
        <div class="mb-3">
          <!-- Stored image preview from DB -->
          <ThemePreview :data-url="(t as any).preview" :width="640" :height="336" :alt="`Vorschau von ${t.name}`" />
        </div>
        <p class="text-sm text-gray-500">{{ t.description || 'Kein Beschreibungstext' }}</p>
        <template #footer>
          <div class="flex gap-2">
            <UButton size="sm" icon="i-lucide-eye" @click="viewTheme(t.id)">Laden</UButton>
            <UButton size="sm" color="neutral" variant="outline" icon="i-lucide-trash-2" @click="deleteTheme(t.id)">Löschen</UButton>
          </div>
        </template>
      </UCard>
    </div>
  </div>
  
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth'] });
import { useUserThemes } from '../composables/useUserThemes';

const { items, pending, refresh, formatDate, loadIntoBuilderById, deleteById, goToDetail, updatePublic } = useUserThemes();

const client = useSupabaseClient();

async function logout() {
  await client.auth.signOut();
  await navigateTo('/login');
}

async function viewTheme(id: string) {
  try {
    await loadIntoBuilderById(id);
    // Optional: navigate back to builder/root if needed
    // await navigateTo('/');
  } catch (e: any) {
    console.error(e);
  }
}

async function deleteTheme(id: string) {
  if (!confirm('Möchtest du dieses Theme wirklich löschen?')) return;
  try {
    await deleteById(id);
    await refresh();
  } catch (e: any) {
    console.error(e);
    alert(e?.message || 'Löschen fehlgeschlagen');
  }
}
</script>
