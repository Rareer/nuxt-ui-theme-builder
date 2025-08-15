import { useColorsStore } from '../store/colors';
import { useThemeStore } from '../store/theme';

export function useThemeCss() {
	const colorStore = useColorsStore();
	const themeStore = useThemeStore();
	const styleTagId = 'global-theme-style';

	// Only run in client-side environment
	if (import.meta.client) {
		watchEffect(() => {
			// Create or update style tag
			let styleEl = document.getElementById(styleTagId) as HTMLStyleElement | null;
			if (!styleEl) {
				styleEl = document.createElement('style');
				styleEl.id = styleTagId;
				document.head.appendChild(styleEl);
			}

			// Build per-mode CSS variables using the store
			const getByMode = themeStore.getThemeCssVariablesByMode;
			const lightModeVars = { ...generateColorCssVariables(), ...getByMode('light') };
			const darkModeVars = { ...generateColorCssVariables(), ...getByMode('dark') };

			const lightString = Object.entries(lightModeVars)
				.map(([key, value]) => `  ${key}: ${value};`)
				.join('\n');

			const darkString = Object.entries(darkModeVars)
				.map(([key, value]) => `  ${key}: ${value};`)
				.join('\n');

			const baseAppStyles = `\nhtml, body {\n  background-color: var(--ui-bg);\n  color: var(--ui-text);\n}\n`;

			const cssContent = `:root {\n${lightString}\n}\n\n.dark {\n${darkString}\n}\n${baseAppStyles}`;

			styleEl.innerHTML = cssContent;
		});
	}

	// Generate CSS variables from all colors in the store
	function generateColorCssVariables(): Record<string, string> {
		const styleObj: Record<string, string> = {};

		// Add custom colors from the store
		const colors = colorStore.getColors;
		if (colors && colors.length > 0) {
			colors.forEach((color) => {
				const colorName = color.name.toLowerCase().replace(/\s+/g, '-');
				// Add base color variable (using 500 as default)
				styleObj[`--ui-color-${colorName}`] = color.values['500'];

				// Add all shade variants
				Object.entries(color.values).forEach(([shade, value]) => {
					styleObj[`--ui-color-${colorName}-${shade}`] = value;
				});
			});
		}

		// Add all Tailwind colors
		Object.entries(tailwindColors).forEach(([colorName, shades]) => {
			// Add base color variable (using 500 as default)
			if (shades['500']) {
				styleObj[`--ui-color-${colorName}`] = shades['500'];
			}

			// Add all shade variants
			Object.entries(shades).forEach(([shade, value]) => {
				if (value) {
					styleObj[`--ui-color-${colorName}-${shade}`] = value;
				}
			});
		});

		return styleObj;
	}

	// Combine all CSS variables
	function generateAllCssVariables(): Record<string, string> {
		return {
			...generateColorCssVariables(),
			...themeStore.getThemeCssVariables,
		};
	}
}
