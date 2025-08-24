import { defineStore } from 'pinia';

// Store for Combobox-driven UI config per component
// Shape: component -> propName -> option -> slotName -> string[] (classes)
export type SlotClasses = string[];
export type OptionSlots = Record<string, SlotClasses>; // slot -> classes
export type PropOptions = Record<string, OptionSlots>; // option -> slots

// Component config now separates prop-based configs and component-wide defaults
export type ComponentUiConfig = {
	props: Record<string, PropOptions>;
	defaults: OptionSlots; // slot -> classes
};

export interface UiConfigsState {
	byComponent: Record<string, ComponentUiConfig>;
}

export const useComponentUiConfigStore = defineStore('componentUiConfig', {
	state: (): UiConfigsState => ({
		byComponent: {},
	}),

	actions: {
		// Normalize a single component record (migrate from legacy flat shape)
		_normalizeComponentRecord(rec: any): ComponentUiConfig {
			if (!rec || typeof rec !== 'object') return { props: {}, defaults: {} };
			if ('props' in rec || 'defaults' in rec) {
				return {
					props: rec.props || {},
					defaults: rec.defaults || {},
				};
			}
			// Legacy: rec was Record<string, PropOptions>
			return { props: rec as Record<string, PropOptions>, defaults: {} };
		},
		// Ensure component entry exists
		initComponent(componentName: string) {
			if (!this.byComponent[componentName]) {
				this.byComponent[componentName] = { props: {}, defaults: {} };
			}
		},

		// Check if any default classes exist for a component
		hasAnyDefaultClasses(componentName: string): boolean {
			const comp = this.byComponent[componentName];
			if (!comp || !comp.defaults) return false;
			return Object.values(comp.defaults).some(arr => Array.isArray(arr) && arr.length > 0);
		},

		// Clear all default classes for a component
		clearDefaultClasses(componentName: string) {
			const comp = (this.byComponent[componentName] ??= { props: {}, defaults: {} });
			comp.defaults = {};
		},

		// Check if any classes exist for a specific prop/option across any slot
		hasAnyClassesForOption(componentName: string, propName: string, option: string): boolean {
			const comp = this.byComponent[componentName];
			if (!comp) return false;
			const byProp = comp.props[propName];
			if (!byProp) return false;
			const byOption = byProp[option];
			if (!byOption) return false;
			return Object.values(byOption).some(arr => Array.isArray(arr) && arr.length > 0);
		},

		// Clear all classes for a specific prop/option across all slots
		clearClassesForOption(componentName: string, propName: string, option: string) {
			const comp = this.byComponent[componentName];
			if (!comp) return;
			const byProp = comp.props[propName];
			if (!byProp) return;
			if (byProp[option]) {
				// Remove the option entirely for clean state
				delete byProp[option];
			}
		},

		// Ensure nested path exists and return the current SlotClasses array reference
		ensurePath(
			componentName: string,
			propName: string,
			option: string,
			slot: string,
		): SlotClasses {
			// In-place init to satisfy TS
			const comp = (this.byComponent[componentName] ??= { props: {}, defaults: {} });
			const byProp = (comp.props[propName] ??= {});
			const byOption = (byProp[option] ??= {});
			const bySlot = (byOption[slot] ??= []);
			return bySlot;
		},

		// Set (replace) classes for a given path
		setClasses(
			componentName: string,
			propName: string,
			option: string,
			slot: string,
			classes: string[],
		) {
			const comp = (this.byComponent[componentName] ??= { props: {}, defaults: {} });
			const byProp = (comp.props[propName] ??= {});
			const byOption = (byProp[option] ??= {});
			// Replace with a new array to keep reactivity straightforward
			byOption[slot] = Array.isArray(classes) ? [...classes] : [];
		},

		// Get classes for a given path (returns empty array if missing)
		getClasses(
			componentName: string,
			propName: string,
			option: string,
			slot: string,
		): string[] {
			const comp = this.byComponent[componentName];
			if (!comp) return [];
			const byProp = comp.props[propName];
			if (!byProp) return [];
			const byOption = byProp[option];
			if (!byOption) return [];
			const bySlot = byOption[slot];
			return Array.isArray(bySlot) ? bySlot : [];
		},

		// Convenience helpers for component-wide defaults (per UI slot)
		ensureDefaultSlot(componentName: string, slot: string): SlotClasses {
			const comp = (this.byComponent[componentName] ??= { props: {}, defaults: {} });
			const arr = (comp.defaults[slot] ??= []);
			return arr;
		},

		setDefaultClasses(componentName: string, slot: string, classes: string[]) {
			const comp = (this.byComponent[componentName] ??= { props: {}, defaults: {} });
			comp.defaults[slot] = Array.isArray(classes) ? [...classes] : [];
		},

		getDefaultClasses(componentName: string, slot: string): string[] {
			const comp = this.byComponent[componentName];
			if (!comp) return [];
			const arr = comp.defaults[slot];
			return Array.isArray(arr) ? arr : [];
		},

		// Bulk set/replace the entire config for a component
		replaceComponentConfig(componentName: string, config: ComponentUiConfig) {
			const safe: ComponentUiConfig = {
				props: config?.props || {},
				defaults: config?.defaults || {},
			};
			this.byComponent[componentName] = JSON.parse(JSON.stringify(safe));
		},

		// Read-only view of a component config
		getComponentConfig(componentName: string): ComponentUiConfig {
			return this.byComponent[componentName] || { props: {}, defaults: {} };
		},

		// Clear a single component config
		clearComponent(componentName: string) {
			if (this.byComponent[componentName]) delete this.byComponent[componentName];
		},

		// Import full store state
		importAll(state: UiConfigsState) {
			const incoming = state?.byComponent || {};
			const normalized: Record<string, ComponentUiConfig> = {};
			for (const [k, v] of Object.entries(incoming)) {
				normalized[k] = this._normalizeComponentRecord(v);
			}
			this.byComponent = normalized;
		},

		// Export full store state
		exportAll(): UiConfigsState {
			return { byComponent: this.byComponent };
		},

		// Persistence helpers (localStorage)
		saveToLocalStorage() {
			if (typeof window === 'undefined') return;
			const key = `store:${this.$id}`;
			try {
				localStorage.setItem(key, JSON.stringify(this.$state));
			}
			catch (e) {
				console.warn('[componentUiConfig] Failed to save state:', e);
			}
		},

		loadFromLocalStorage() {
			if (typeof window === 'undefined') return;
			const key = `store:${this.$id}`;
			try {
				const raw = localStorage.getItem(key);
				if (raw) {
					const parsed = JSON.parse(raw);
					// Migrate in-place
					if (parsed && parsed.byComponent) {
						const normalized: Record<string, ComponentUiConfig> = {};
						for (const [k, v] of Object.entries(parsed.byComponent)) {
							normalized[k] = this._normalizeComponentRecord(v);
						}
						parsed.byComponent = normalized;
					}
					this.$patch(parsed);
				}
			}
			catch (e) {
				console.warn('[componentUiConfig] Failed to load state:', e);
			}
		},

		clearLocalStorage() {
			if (typeof window === 'undefined') return;
			const key = `store:${this.$id}`;
			try {
				localStorage.removeItem(key);
			}
			catch (e) {
				console.warn('[componentUiConfig] Failed to clear persisted state:', e);
			}
		},
	},
});
