import { useColorsStore } from '../store/colors';
import { useThemeStore } from '../store/theme';

export function useThemeCss() {
	const colorStore = useColorsStore();
	const themeStore = useThemeStore();
	const styleTagId = 'global-theme-style';
	const fontLinkId = 'global-theme-fonts';
	const ignoredFonts = new Set([
		'sans-serif',
		'serif',
		'monospace',
		'ui-sans-serif',
		'ui-serif',
		'ui-monospace',
		'system-ui',
		'emoji',
		'math',
		'fangsong',
		'cursive',
		'fantasy',
		'georgia',
		'cambria',
		'times new roman',
		'times',
		'sfmono-regular',
		'menlo',
		'monaco',
		'consolas',
		'liberation mono',
		'courier new',
		'arial',
		'helvetica',
		'helvetica neue',
	]);

	// Only run in client-side environment
	if (import.meta.client) {
		watchEffect(() => {
			// Ensure newly added default variables (e.g., fonts) exist in both modes without overriding user choices
			themeStore.ensureCssVariableDefaults();

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

			const baseAppStyles = `\nhtml, body {\n  background-color: var(--ui-bg);\n  color: var(--ui-text);\n  font-family: var(--font-sans, ui-sans-serif);\n  font-weight: var(--font-weight-normal, 400);\n}\ncode, pre, kbd, samp {\n  font-family: var(--font-mono, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace);\n}\n* {\n  corner-shape: var(--ui-corner-shape, superellipse(1));\n}\n`;

			const cssContent = `:root {\n${lightString}\n}\n\n.dark {\n${darkString}\n}\n${baseAppStyles}`;

			styleEl.innerHTML = cssContent;

			updateGoogleFonts([lightModeVars, darkModeVars]);
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

	function updateGoogleFonts(modeVars: Array<Record<string, string>>) {
		const families = Array.from(new Set(modeVars.flatMap(extractFontFamilies))).filter(Boolean);
		const weights = Array.from(new Set(modeVars.flatMap(extractFontWeights)))
			.filter((v): v is number => Number.isFinite(v))
			.sort((a, b) => a - b);
		const href = buildGoogleFontsHref(families, weights);
		let linkEl = document.getElementById(fontLinkId) as HTMLLinkElement | null;

		if (!href) {
			if (linkEl) linkEl.remove();
			return;
		}

		if (!linkEl) {
			linkEl = document.createElement('link');
			linkEl.id = fontLinkId;
			linkEl.rel = 'stylesheet';
			document.head.appendChild(linkEl);
		}

		if (linkEl.getAttribute('href') !== href) {
			linkEl.href = href;
		}
	}

	function extractFontFamilies(vars: Record<string, string>): string[] {
		return Object.entries(vars)
			.filter(([key]) => key.startsWith('--font-') && !key.startsWith('--font-weight-'))
			.map(([, value]) => parsePrimaryFont(value))
			.filter((font): font is string => Boolean(font));
	}

	function extractFontWeights(vars: Record<string, string>): Array<number | null> {
		return Object.entries(vars)
			.filter(([key]) => key.startsWith('--font-weight-'))
			.map(([, value]) => sanitizeWeight(value));
	}

	function parsePrimaryFont(value?: string): string | null {
		if (!value) return null;
		const candidates = value.split(',').map(part => part.trim()).filter(Boolean);

		for (const candidate of candidates) {
			if (!candidate || candidate.startsWith('var(')) continue;
			const cleaned = candidate.replace(/^['"]|['"]$/g, '');
			if (!cleaned || ignoredFonts.has(cleaned.toLowerCase())) continue;
			return cleaned;
		}

		return null;
	}

	function sanitizeWeight(value?: string): number | null {
		if (!value) return null;
		const parsed = Number.parseInt(value, 10);
		if (Number.isNaN(parsed)) return null;
		return Math.min(900, Math.max(100, parsed));
	}

	function buildGoogleFontsHref(families: string[], weights: number[]): string | null {
		if (!families.length) return null;
		const resolvedWeights = (weights.length ? weights : [400, 500, 600, 700]).map(w => Math.round(w));
		const weightString = Array.from(new Set(resolvedWeights)).sort((a, b) => a - b).join(';');
		const familyParams = families.map((family) => {
			const normalized = family.replace(/['"]/g, '').trim().replace(/\s+/g, '+');
			return `family=${normalized}:wght@${weightString}`;
		});
		return `https://fonts.googleapis.com/css2?${familyParams.join('&')}&display=swap`;
	}
}
