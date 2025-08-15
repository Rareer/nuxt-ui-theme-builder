import type { PiniaPluginContext } from 'pinia';

function createLocalStoragePlugin() {
	return ({ store }: PiniaPluginContext) => {
		if (import.meta.server) return; // only run on client

		const key = `store:${store.$id}`;

		try {
			const saved = localStorage.getItem(key);
			if (saved) {
				// Patch the store with the saved state
				store.$patch(JSON.parse(saved));
			}
			else {
				// Optionally initialize defaults for specific stores if needed
				// For theme store, ensure cssVariableMappings are initialized
				if (
					store.$id === 'theme'
					&& typeof (store as any).resetCssVariables === 'function'
					&& (!((store as any).cssVariableMappings) || Object.keys((store as any).cssVariableMappings).length === 0)
				) {
					(store as any).resetCssVariables();
				}
			}
		}
		catch (e) {
			// If parsing fails, ignore and continue with current state
			console.warn(`[piniaPersist] Failed to load state for ${store.$id}:`, e);
		}

		// Subscribe to store changes and persist them
		store.$subscribe((_mutation, state) => {
			try {
				localStorage.setItem(key, JSON.stringify(state));
			}
			catch (e) {
				console.warn(`[piniaPersist] Failed to save state for ${store.$id}:`, e);
			}
		}, { detached: true });
	};
}

export default defineNuxtPlugin((nuxtApp) => {
	const pinia = nuxtApp.$pinia as any;
	if (!pinia) return;
	pinia.use(createLocalStoragePlugin());
});
