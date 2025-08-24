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
