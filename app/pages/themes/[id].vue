<template>
  <div class="container mx-auto py-10 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Theme-Details</h1>
      <div class="flex gap-2">
        <UButton color="neutral" variant="outline" icon="i-lucide-arrow-left" @click="goBack">Zurück</UButton>
      </div>
    </div>

    <div v-if="pending" class="flex items-center gap-2 text-sm text-gray-500">
      <ULoader size="sm" /> Lädt…
    </div>

    <div v-else-if="!item" class="text-sm text-gray-500">Theme nicht gefunden.</div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="lg:col-span-2">
        <template #header>
          <div class="flex items-center justify-between w-full">
            <div class="flex flex-col">
              <span class="font-medium">{{ item.name }}</span>
              <span class="text-xs text-gray-500">Aktualisiert: {{ formatDate(item.updated_at || item.created_at) }}</span>
            </div>
            <UBadge :color="item.is_public ? 'primary' : 'neutral'">{{ item.is_public ? 'Öffentlich' : 'Privat' }}</UBadge>
          </div>
        </template>

        <div class="space-y-4">
          <p class="text-sm text-gray-600">{{ item.description || 'Kein Beschreibungstext' }}</p>
          <UDivider />
          <div>
            <h3 class="text-sm font-semibold mb-2">Snapshot</h3>
            <UCodeBlock :code="prettyData" lang="json" class="max-h-96 overflow-auto" />
          </div>
        </div>

        <template #footer>
          <div class="flex gap-2">
            <UButton icon="i-lucide-eye" @click="loadIntoBuilder">In Builder laden</UButton>
            <UButton v-if="isOwner" color="neutral" variant="outline" icon="i-lucide-trash-2" @click="deleteTheme">Löschen</UButton>
          </div>
        </template>
      </UCard>

      <UCard>
        <template #header>
          <span class="font-medium">Metadaten</span>
        </template>
        <ul class="text-sm space-y-1">
          <li><span class="text-gray-500">ID:</span> {{ item.id }}</li>
          <li><span class="text-gray-500">Version:</span> {{ item.version }}</li>
          <li><span class="text-gray-500">Erstellt:</span> {{ formatDate(item.created_at) }}</li>
          <li><span class="text-gray-500">Aktualisiert:</span> {{ formatDate(item.updated_at) }}</li>
        </ul>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemeListItem } from '../../composables/useUserThemes';

const route = useRoute();
const router = useRouter();
const id = computed(() => route.params.id as string);

const { data, pending, refresh } = await useFetch<{ ok: boolean; item?: (ThemeListItem & { data?: any }) }>(
  () => `/api/theme/${id.value}`,
  { key: () => `theme-${id.value}` },
);

const item = computed(() => data.value?.item as (ThemeListItem & { owner?: string; data?: any }) | undefined);
const prettyData = computed(() => JSON.stringify(item.value?.data ?? {}, null, 2));

function formatDate(iso?: string) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

function goBack() {
  if (history.length > 1) router.back();
  else router.push('/mythemes');
}

// Actions
import { useSavedThemesStore } from '../../store/savedThemes';
const saved = useSavedThemesStore();
const toast = useToast();
const supaUser = useSupabaseUser();
const isOwner = computed(() => !!(supaUser.value && item.value && item.value.owner && supaUser.value.id === item.value.owner));

async function loadIntoBuilder() {
  if (!id.value) return;
  try {
    await saved.loadThemeByConfigId(id.value);
    toast.add({ title: 'Theme geladen', description: 'Das Theme wurde in den Builder geladen.', color: 'success', icon: 'i-lucide-check' });
  } catch (e: any) {
    toast.add({ title: 'Laden fehlgeschlagen', description: (e?.message || 'Theme konnte nicht geladen werden.'), color: 'error', icon: 'i-lucide-alert-triangle' });
  }
}

async function deleteTheme() {
  if (!id.value) return;
  if (!confirm('Möchtest du dieses Theme wirklich löschen?')) return;
  try {
    const res = await $fetch<{ ok: boolean; error?: string }>(`/api/theme/${id.value}`, { method: 'DELETE' });
    if (!res?.ok) throw new Error(res?.error || 'Löschen fehlgeschlagen');
    toast.add({ title: 'Theme gelöscht', description: 'Das Theme wurde entfernt.', color: 'success', icon: 'i-lucide-check' });
    router.push('/mythemes');
  } catch (e: any) {
    toast.add({ title: 'Löschen fehlgeschlagen', description: (e?.message || 'Theme konnte nicht gelöscht werden.'), color: 'error', icon: 'i-lucide-alert-triangle' });
  }
}
</script>
