import { defineStore } from 'pinia';
import { useColorsStore } from './colors';
import { useComponentUiConfigStore } from './componentUiConfig';
import { useThemeStore } from './theme';
import { useUiStore } from './ui';
import type { UiConfigsState } from './componentUiConfig';
import type { CssVariableMapping } from './theme';

export interface SavedThemeSnapshot {
  name: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  // Minimal states we need to restore
  colors: ReturnType<typeof useColorsStore>['$state'];
  componentUiConfigs: UiConfigsState;
  theme: {
    mappings: Record<string, string | null>;
    cssVariableMappings: Record<string, CssVariableMapping>;
  };
}

export const useSavedThemesStore = defineStore('savedThemes', {
  state: () => ({
    themes: {} as Record<string, SavedThemeSnapshot>,
    currentConfigId: null as string | null,
    currentThemeName: null as string | null,
  }),
  getters: {
    listNames(state): string[] {
      return Object.keys(state.themes).sort((a, b) => a.localeCompare(b));
    },
    getTheme: state => (name: string): SavedThemeSnapshot | undefined => state.themes[name],
  },
  actions: {
    saveTheme(name: string) {
      if (!name) throw new Error('Theme-Name ist erforderlich.');
      const colors = useColorsStore();
      const componentUi = useComponentUiConfigStore();
      const theme = useThemeStore();

      const now = new Date().toISOString();
      const snapshot: SavedThemeSnapshot = {
        name,
        createdAt: this.themes[name]?.createdAt || now,
        updatedAt: now,
        colors: JSON.parse(JSON.stringify(colors.$state)),
        componentUiConfigs: JSON.parse(JSON.stringify(componentUi.exportAll())),
        theme: {
          mappings: JSON.parse(JSON.stringify(theme.mappings)),
          cssVariableMappings: JSON.parse(JSON.stringify(theme.cssVariableMappings)),
        },
      };

      this.themes[name] = snapshot;
    },

    async saveThemeToDatabase(name: string, opts?: { description?: string; isPublic?: boolean; projectId?: string; version?: number }) {
      if (!name) throw new Error('Theme-Name ist erforderlich.');
      const colors = useColorsStore();
      const componentUi = useComponentUiConfigStore();
      const theme = useThemeStore();

      const now = new Date().toISOString();
      const snapshot: SavedThemeSnapshot = {
        name,
        createdAt: this.themes[name]?.createdAt || now,
        updatedAt: now,
        colors: JSON.parse(JSON.stringify(colors.$state)),
        componentUiConfigs: JSON.parse(JSON.stringify(componentUi.exportAll())),
        theme: {
          mappings: JSON.parse(JSON.stringify(theme.mappings)),
          cssVariableMappings: JSON.parse(JSON.stringify(theme.cssVariableMappings)),
        },
      };

      // Persist locally as well
      this.themes[name] = snapshot;

      // Send to server API which validates and stores in Supabase
      const res = await $fetch<{ ok: boolean; id?: string; error?: string; issues?: any[] }>(
        '/api/save-theme',
        {
          method: 'POST',
          body: {
            name,
            description: opts?.description,
            isPublic: opts?.isPublic ?? false,
            projectId: opts?.projectId,
            version: opts?.version ?? 1,
            kind: 'theme',
            snapshot,
          },
        },
      );

      if (!res?.ok) {
        throw new Error(res?.error || 'Fehler beim Speichern des Themes in der Datenbank');
      }

      // Track current configuration id for overwrite functionality
      this.currentConfigId = res.id || null;
      this.currentThemeName = name;
      return res.id;
    },

    async loadTheme(name: string) {
      const snapshot = this.themes[name];
      if (!snapshot) throw new Error(`Theme "${name}" nicht gefunden.`);

      const ui = useUiStore();
      const colors = useColorsStore();
      const componentUi = useComponentUiConfigStore();
      const theme = useThemeStore();

      try {
        ui.showLoading(`Lade Theme "${name}"...`);
        // Simulate async batch for smoother overlay rendering
        await Promise.resolve();

        // Patch stores
        colors.$patch(snapshot.colors as any);
        componentUi.importAll(snapshot.componentUiConfigs);
        theme.mappings = JSON.parse(JSON.stringify(snapshot.theme.mappings));
        theme.cssVariableMappings = JSON.parse(JSON.stringify(snapshot.theme.cssVariableMappings));
      }
      finally {
        ui.hideLoading();
      }
    },

    async loadThemeByConfigId(id: string) {
      if (!id) throw new Error('Theme-ID ist erforderlich.');

      const ui = useUiStore();
      const colors = useColorsStore();
      const componentUi = useComponentUiConfigStore();
      const theme = useThemeStore();

      try {
        ui.showLoading('Lade gespeichertes Theme...');
        const res = await $fetch<{ ok: boolean; item?: { data?: SavedThemeSnapshot } ; error?: string }>(`/api/theme/${id}`);
        if (!res?.ok || !res.item?.data) throw new Error(res?.error || 'Theme nicht gefunden');
        const snapshot = res.item.data as SavedThemeSnapshot;

        // Patch stores
        colors.$patch(snapshot.colors as any);
        componentUi.importAll(snapshot.componentUiConfigs);
        theme.mappings = JSON.parse(JSON.stringify(snapshot.theme.mappings));
        theme.cssVariableMappings = JSON.parse(JSON.stringify(snapshot.theme.cssVariableMappings));

        // Track loaded configuration id
        this.currentConfigId = id;
        this.currentThemeName = snapshot.name || null;
      }
      finally {
        ui.hideLoading();
      }
    },

    async updateCurrentThemeInDatabase(opts?: { name?: string; description?: string; version?: number }) {
      if (!this.currentConfigId) throw new Error('Kein geladenes Theme zum Überschreiben vorhanden.');

      const colors = useColorsStore();
      const componentUi = useComponentUiConfigStore();
      const theme = useThemeStore();

      const now = new Date().toISOString();
      const snapshot: SavedThemeSnapshot = {
        name: opts?.name || (Object.keys(this.themes)[0] || 'Theme'),
        createdAt: now, // not used by server except as part of snapshot
        updatedAt: now,
        colors: JSON.parse(JSON.stringify(colors.$state)),
        componentUiConfigs: JSON.parse(JSON.stringify(componentUi.exportAll())),
        theme: {
          mappings: JSON.parse(JSON.stringify(theme.mappings)),
          cssVariableMappings: JSON.parse(JSON.stringify(theme.cssVariableMappings)),
        },
      };

      const res = await $fetch<{ ok: boolean; error?: string }>(`/api/theme/${this.currentConfigId}`, {
        method: 'PUT',
        body: {
          name: opts?.name,
          description: typeof opts?.description === 'string' ? opts?.description : undefined,
          version: typeof opts?.version === 'number' ? opts?.version : undefined,
          snapshot,
        },
      });
      if (!res?.ok) throw new Error(res?.error || 'Überschreiben fehlgeschlagen');

      if (opts?.name) this.currentThemeName = opts.name;
    },

    deleteTheme(name: string) {
      if (this.themes[name]) {
        delete this.themes[name];
      }
    },

    renameTheme(oldName: string, newName: string) {
      if (!this.themes[oldName]) return;
      if (this.themes[newName]) throw new Error('Neuer Name existiert bereits.');
      const snapshot = this.themes[oldName];
      snapshot.name = newName;
      snapshot.updatedAt = new Date().toISOString();
      this.themes[newName] = snapshot;
      delete this.themes[oldName];
    },
  },
});
