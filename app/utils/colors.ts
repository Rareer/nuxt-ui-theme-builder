// Color-related utilities

export function normalizeColorName(name: string): string {
	return name.toLowerCase().replace(/\s+/g, '-');
}

/**
 * Generates a full color palette from a base color (500)
 * @param baseColor The base color in hex format (e.g. #FF0000)
 * @returns Object with all color shades from 50-950
 */
export function generateColorPalette(baseColor: string): Record<string, string> {
	// Convert hex to HSL for better manipulation
	const hsl = hexToHSL(baseColor);

	// Generate shades based on the base color (500)
	return {
		50: generateShade(hsl, { l: 0.97 }), // Lightest
		100: generateShade(hsl, { l: 0.94 }),
		200: generateShade(hsl, { l: 0.86 }),
		300: generateShade(hsl, { l: 0.74 }),
		400: generateShade(hsl, { l: 0.6 }),
		500: baseColor, // Base color
		600: generateShade(hsl, { l: 0.45, s: 1.05 }),
		700: generateShade(hsl, { l: 0.32, s: 1.1 }),
		800: generateShade(hsl, { l: 0.23, s: 1.05 }),
		900: generateShade(hsl, { l: 0.15 }),
		950: generateShade(hsl, { l: 0.1 }), // Darkest
	};
}

/**
 * Converts hex color to HSL
 * @param hex Hex color string
 * @returns HSL object
 */
function hexToHSL(hex: string): { h: number; s: number; l: number } {
	// Remove the # if present
	hex = hex.replace(/^#/, '');

	let r = 0, g = 0, b = 0;

	// Parse the hex values
	if (hex.length === 3) {
		r = Number.parseInt(hex[0]! + hex[0], 16) / 255;
		g = Number.parseInt(hex[1]! + hex[1], 16) / 255;
		b = Number.parseInt(hex[2]! + hex[2], 16) / 255;
	}
	else if (hex.length === 6) {
		r = Number.parseInt(hex.substring(0, 2), 16) / 255;
		g = Number.parseInt(hex.substring(2, 4), 16) / 255;
		b = Number.parseInt(hex.substring(4, 6), 16) / 255;
	}

	// Find min and max
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);

	let h = 0, s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}

		h /= 6;
	}

	return { h, s, l };
}

/**
 * Generates a new shade based on HSL adjustments
 * @param hsl Base HSL color
 * @param adjustments Adjustments to apply to HSL values
 * @returns New hex color
 */
function generateShade(
	hsl: { h: number; s: number; l: number },
	adjustments: { h?: number; s?: number; l?: number },
): string {
	const newHSL = {
		h: adjustments.h !== undefined ? hsl.h * adjustments.h : hsl.h,
		s: adjustments.s !== undefined ? Math.min(1, hsl.s * adjustments.s) : hsl.s,
		l: adjustments.l !== undefined ? adjustments.l : hsl.l,
	};

	return hslToHex(newHSL.h, newHSL.s, newHSL.l);
}

/**
 * Converts HSL to hex color
 * @param h Hue (0-1)
 * @param s Saturation (0-1)
 * @param l Lightness (0-1)
 * @returns Hex color string
 */
function hslToHex(h: number, s: number, l: number): string {
	let r, g, b;

	if (s === 0) {
		r = g = b = l;
	}
	else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	// Convert to hex
	const toHex = (x: number) => {
		const hex = Math.round(x * 255).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
