import { useSavedThemesStore } from '../store/savedThemes';

export type ThemeListItem = {
  id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
};

export function useUserThemes() {
  const route = useRoute();
  const router = useRouter();
  const savedThemes = useSavedThemesStore();
  const toast = useToast();

  const { data, pending, refresh, error } = useFetch<{ ok: boolean; items?: ThemeListItem[]; error?: string }>(
    '/api/my-themes',
    { key: 'my-themes' },
  );
  const items = computed(() => data.value?.items || []);

  function formatDate(iso?: string) {
    if (!iso) return '';
    try { return new Date(iso).toLocaleString(); } catch { return iso; }
  }

  async function loadIntoBuilderById(id: string) {
    try {
      await savedThemes.loadThemeByConfigId(id);
      toast.add({ title: 'Theme geladen', description: 'Das Theme wurde in den Builder geladen.', color: 'success', icon: 'i-lucide-check' });
    } catch (e: any) {
      toast.add({ title: 'Laden fehlgeschlagen', description: (e?.message || 'Theme konnte nicht geladen werden.'), color: 'error', icon: 'i-lucide-alert-triangle' });
      throw e;
    }
  }

  async function deleteById(id: string) {
    try {
      const res = await $fetch<{ ok: boolean; error?: string }>(`/api/theme/${id}`, { method: 'DELETE' });
      if (!res?.ok) throw new Error(res?.error || 'Löschen fehlgeschlagen');
      toast.add({ title: 'Theme gelöscht', description: 'Das Theme wurde entfernt.', color: 'success', icon: 'i-lucide-check' });
      await refresh();
    } catch (e: any) {
      toast.add({ title: 'Löschen fehlgeschlagen', description: (e?.message || 'Theme konnte nicht gelöscht werden.'), color: 'error', icon: 'i-lucide-alert-triangle' });
      throw e;
    }
  }

  function goToDetail(id: string) {
    router.push({ path: `/themes/${id}` });
  }

  async function updatePublic(id: string, isPublic: boolean) {
    try {
      const res = await $fetch<{ ok: boolean; error?: string }>(`/api/theme/${id}`, {
        method: 'PATCH',
        body: { is_public: isPublic },
      });
      if (!res?.ok) throw new Error(res?.error || 'Aktualisierung fehlgeschlagen');
      toast.add({ title: 'Sichtbarkeit aktualisiert', description: isPublic ? 'Theme ist jetzt öffentlich.' : 'Theme ist jetzt privat.', color: 'success', icon: 'i-lucide-check' });
      await refresh();
    } catch (e: any) {
      toast.add({ title: 'Aktualisierung fehlgeschlagen', description: (e?.message || 'Sichtbarkeit konnte nicht geändert werden.'), color: 'error', icon: 'i-lucide-alert-triangle' });
      throw e;
    }
  }

  return {
    // list state
    items,
    pending,
    error,
    refresh,
    // actions
    formatDate,
    loadIntoBuilderById,
    deleteById,
    goToDetail,
    updatePublic,
  };
}
