import { computed } from 'vue';
import { useColorsStore } from '../store/colors';
import { getTailwindColorsAsColorObjects, getTailwindColorByName, isTailwindColor } from '../utils/tailwindColors';
import type { Color } from '../types/color';

export interface ColorValues {
	[key: string]: string;
}

export const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'] as const;

export function useColorUtils() {
	const colorStore = useColorsStore();

	const colorOptions = computed(() => {
		const options: Array<{ label: string; value: string; disabled?: boolean }> = [];

		if (colorStore.getColors.length > 0) {
			options.push({ label: '--- Eigene Farben ---', value: 'separator-custom', disabled: true });
			colorStore.getColors.forEach((color) => {
				options.push({ label: color.name, value: color.name });
			});
		}

		options.push({ label: '--- Tailwind Farben ---', value: 'separator-tailwind', disabled: true });
		getTailwindColorsAsColorObjects().forEach((color) => {
			options.push({ label: color.name, value: color.name });
		});

		return options;
	});

	function getColorShade(colorName: string, shade: string): string {
		if (!colorName) return 'transparent';

		let color: Color | null = null;
		if (isTailwindColor(colorName)) {
			color = getTailwindColorByName(colorName);
		}
		else {
			color = colorStore.colors.find(c => c.name === colorName) || null;
		}
		if (!color) return 'transparent';
		return (color.values as Record<string, string>)[shade] || 'transparent';
	}

	function getColorFromReference(reference: string): string {
		if (!reference) return 'transparent';
		const [colorNameRaw, shade] = reference.split('-');
		if (!colorNameRaw || !shade) return 'transparent';
		const colorName = colorNameRaw;

		if (isTailwindColor(colorName)) {
			const color = getTailwindColorByName(colorName);
			const values = color?.values as ColorValues | undefined;
			return (values && shade in values && values[shade]) ? values[shade] : 'transparent';
		}
		else {
			const color = colorStore.colors.find(c => normalizeColorName(c.name) === colorName);
			const values = color?.values as ColorValues | undefined;
			return (values && shade in values && values[shade]) ? values[shade] : 'transparent';
		}
	}

	return {
		shades,
		colorOptions,
		getColorShade,
		getColorFromReference,
	};
}
