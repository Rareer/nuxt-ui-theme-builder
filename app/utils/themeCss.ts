import { SHADES } from '../constants/theme';
import type { ThemeVariable } from '../constants/theme';
import { normalizeColorName } from './colors';

// Minimal shape compatible with Theme store's CssVariableMapping
export type CssVariableType = 'color-reference' | 'direct-value';
export interface CssVariableMappingLite {
	name: string;
	type: CssVariableType;
	// For color-reference, expects "color-shade" string (e.g., "neutral-500") for backward compatibility
	// or already normalized formats. We keep string to avoid breaking changes.
	value: string;
}

export function buildThemeCssVariables(
	mappings: Record<ThemeVariable, string | null>,
	cssVariableMappings: Record<string, CssVariableMappingLite>,
): Record<string, string> {
	const result: Record<string, string> = {};

	// Build from theme variable mappings
	Object.entries(mappings).forEach(([variable, colorName]) => {
		if (!colorName) return;
		const normalized = normalizeColorName(colorName);

		// Base var references 500 by convention
		result[`--ui-${variable}`] = `var(--ui-color-${normalized}-500)`;
		// Alias for 500 shade to support text color usage like --ui-[variable]-color-500
		result[`--ui-${variable}-color-500`] = `var(--ui-color-${normalized}-500)`;


		SHADES.forEach((shade) => {
			// Old semantic shade alias (kept for compatibility)
			result[`--ui-${variable}-${shade}`] = `var(--ui-color-${normalized}-${shade})`;
			// New: per-shade alias under --ui-color-[variable]-[shade]
			result[`--ui-color-${variable}-${shade}`] = `var(--ui-color-${normalized}-${shade})`;
		});
	});

	// Additional CSS variables
	Object.values(cssVariableMappings).forEach((variable) => {
		if (variable.type === 'color-reference') {
			const [colorName, shade] = (variable.value || '').split('-');
			if (colorName && shade) {
				result[`--${variable.name}`] = `var(--ui-color-${colorName}-${shade})`;
			}
		}
		else if (variable.type === 'direct-value') {
			result[`--${variable.name}`] = variable.value || '';
		}
	});

	return result;
}
