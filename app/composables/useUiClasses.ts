import { computed, type ComputedRef, type Ref } from 'vue';
import { twMerge } from 'tailwind-merge';
import { useComponentUiConfigStore } from '@/store/componentUiConfig';

/**
 * Build a merged `ui` object for a Nuxt UI component based on:
 * - component-wide defaults per slot (from store)
 * - currently selected option for each configurable prop (from bound state)
 *
 * The merge order is: defaults -> for each prop in `configPropNames`: classes for the selected option.
 * Later entries win when class names conflict (handled by tailwind-merge).
 */
export function useUiClasses(params: {
	component: Ref<string>;
	configPropNames: Ref<string[]>;
	uiSlots: Ref<string[]>;
	getPropValue: (propName: string) => string | undefined;
}): ComputedRef<Record<string, string>> {
	const { component, configPropNames, uiSlots, getPropValue } = params;
	const store = useComponentUiConfigStore();

	return computed<Record<string, string>>(() => {
		const comp = component.value;
		const slots = uiSlots.value;
		const propNames = configPropNames.value;

		const result: Record<string, string> = {};
		for (const slot of slots) {
			// Start with defaults
			const parts: string[] = [];
			const defaults = store.getDefaultClasses(comp, slot);
			if (defaults.length) parts.push(defaults.join(' '));

			// Then merge per selected option for each config prop
			for (const propName of propNames) {
				const selected = getPropValue(propName);
				if (!selected) continue;
				const arr = store.getClasses(comp, propName, String(selected), slot);
				if (arr.length) parts.push(arr.join(' '));
			}

			const merged = parts.length ? twMerge(...parts) : '';
			if (merged) result[slot] = merged;
		}
		return result;
	});
}

/** Non-reactive helper for ad-hoc merging */
export function buildUiObject(
	component: string,
	selections: Record<string, string | undefined>,
	slots: string[],
): Record<string, string> {
	const store = useComponentUiConfigStore();
	const result: Record<string, string> = {};
	for (const slot of slots) {
		const parts: string[] = [];
		const defaults = store.getDefaultClasses(component, slot);
		if (defaults.length) parts.push(defaults.join(' '));
		for (const [propName, selected] of Object.entries(selections)) {
			if (!selected) continue;
			const arr = store.getClasses(component, propName, String(selected), slot);
			if (arr.length) parts.push(arr.join(' '));
		}
		const merged = parts.length ? twMerge(...parts) : '';
		if (merged) result[slot] = merged;
	}
	return result;
}
