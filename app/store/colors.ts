import type { Color } from '../types/color';

import { defineStore } from 'pinia';
import { useThemeStore } from './theme';

interface ColorsState {
	colors: Color[];
	selectedColor: Color | null;
}

export const useColorsStore = defineStore('colors', {
	state: (): ColorsState => ({
		colors: [],
		selectedColor: null,
	}),

	getters: {
		getColors: state => state.colors,
		getSelectedColor: state => state.selectedColor,
		getColorByName: state => (name: string) => {
			return state.colors.find(color => color.name === name);
		},
	},

	actions: {
		// Add a new color
		addColor(color: Color) {
			// Check if color with same name already exists
			const exists = this.colors.some(c => c.name === color.name);
			if (exists) {
				throw new Error(`Color with name "${color.name}" already exists`);
			}

			this.colors.push(color);
		},

		// Update an existing color
		updateColor(updatedColor: Color) {
			const index = this.colors.findIndex(color => color.name === updatedColor.name);
			if (index !== -1) {
				this.colors[index] = updatedColor;

				// If this was the selected color, update it too
				if (this.selectedColor?.name === updatedColor.name) {
					this.selectedColor = updatedColor;
				}
			}
			else {
				throw new Error(`Color with name "${updatedColor.name}" not found`);
			}
		},

		// Delete a color by name
		deleteColor(name: string) {
			const index = this.colors.findIndex(color => color.name === name);
			if (index !== -1) {
				this.colors.splice(index, 1);

				// Inform theme store so any role (e.g. primary) referencing this color falls back to default
				try {
					const theme = useThemeStore();
					theme.resetMappingsForDeletedColor(name);
					// persist updated theme state if desired
					theme.saveToLocalStorage?.();
				}
				catch (e) {
					console.warn('[colors] Failed to reset theme mappings after color deletion:', e);
				}

				// If this was the selected color, clear the selection
				if (this.selectedColor?.name === name) {
					this.selectedColor = null;
				}
			}
			else {
				throw new Error(`Color with name "${name}" not found`);
			}
		},

		// Select a color for editing
		selectColor(name: string) {
			const color = this.colors.find(color => color.name === name);
			if (color) {
				this.selectedColor = color;
			}
			else {
				throw new Error(`Color with name "${name}" not found`);
			}
		},

		// Clear the selected color
		clearSelection() {
			this.selectedColor = null;
		},

		// Create a new empty color template with default values
		createEmptyColor(name: string): Color {
			return {
				name,
				values: {
					50: '#ffffff',
					100: '#fafafa',
					200: '#e5e5e5',
					300: '#d4d4d4',
					400: '#a3a3a3',
					500: '#737373',
					600: '#525252',
					700: '#404040',
					800: '#262626',
					900: '#171717',
					950: '#0a0a0a',
				},
			};
		},

		// Persist the current store state to LocalStorage
		saveToLocalStorage() {
			if (typeof window === 'undefined') return;
			const key = `store:${this.$id}`;
			try {
				localStorage.setItem(key, JSON.stringify(this.$state));
			}
			catch (e) {
				console.warn(`[colors] Failed to save state:`, e);
			}
		},

		// Load the store state from LocalStorage
		loadFromLocalStorage() {
			if (typeof window === 'undefined') return;
			const key = `store:${this.$id}`;
			try {
				const raw = localStorage.getItem(key);
				if (raw) {
					this.$patch(JSON.parse(raw));
				}
			}
			catch (e) {
				console.warn(`[colors] Failed to load state:`, e);
			}
		},

		// Remove any persisted state for this store
		clearLocalStorage() {
			if (typeof window === 'undefined') return;
			const key = `store:${this.$id}`;
			try {
				localStorage.removeItem(key);
			}
			catch (e) {
				console.warn(`[colors] Failed to clear persisted state:`, e);
			}
		},
	},
});
