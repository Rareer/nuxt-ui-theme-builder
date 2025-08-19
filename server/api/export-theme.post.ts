import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
	try {
		// Get theme variables, custom colors, and theme mappings from request body
		const { themeVariables, themeVariablesByMode, customColors, themeMappings, exportMode, componentUiConfigs } = await readBody<{
			themeVariables?: Record<string, string>;
			themeVariablesByMode?: { light?: Record<string, string>; dark?: Record<string, string> };
			customColors?: Array<{ name: string; values: Record<string, string> }>;
			// Accept either flat mapping or per-mode mapping coming from the new store
			themeMappings?: Record<string, string | null> | { light?: Record<string, string | null>; dark?: Record<string, string | null> };
			// Optional preferred export mode for per-mode mappings
			exportMode?: 'light' | 'dark';
			// Optional component UI configs from client
			componentUiConfigs?: { byComponent?: Record<string, any> };
		}>(event);

		if (!themeVariables && !themeVariablesByMode) {
			return {
				success: false,
				error: 'No theme variables provided',
			};
		}

		// Generate CSS content with the theme variables and custom colors
		const cssContent = generateCssContent({ themeVariables, themeVariablesByMode, customColors });

		// Generate app.config.ts content
		const appConfigContent = generateAppConfigContent(themeMappings, exportMode, componentUiConfigs?.byComponent || {});

		return {
			success: true,
			cssContent,
			appConfigContent,
		};
	}
	catch (error: unknown) {
		console.error('Error exporting theme:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error occurred',
		};
	}
});

function generateAppConfigContent(
	themeMappings?: Record<string, string | null> | { light?: Record<string, string | null>; dark?: Record<string, string | null> },
	exportMode?: 'light' | 'dark',
	byComponent: Record<string, any> = {},
): string {
	// Start with the basic structure
	let configContent = `export default defineAppConfig({
	  ui: {
	    colors: {
	`;

	// Add color mappings if they exist
	if (themeMappings) {
		// Normalize to a flat mapping (default to light mode if per-mode provided)
		let flat: Record<string, string | null> = {};
		const isPerMode = typeof (themeMappings as any).light === 'object' || typeof (themeMappings as any).dark === 'object';
		if (isPerMode) {
			const mode: 'light' | 'dark' = exportMode || 'light';
			flat = ((themeMappings as any)[mode] || {}) as Record<string, string | null>;
		}
		else {
			flat = themeMappings as Record<string, string | null>;
		}

		Object.entries(flat).forEach(([variable, colorName]) => {
			if (typeof colorName === 'string' && colorName.trim().length > 0) {
				// Format the color name to match Nuxt UI's expected format (lowercase, no spaces)
				const formattedColorName = colorName.toLowerCase().replace(/\s+/g, '-');
				configContent += `      ${variable}: '${formattedColorName}',\n`;
			}
		});
	}

	configContent += `    },
`;

    // Helper: map component name like "UButton" -> "button"
    const mapComponentKey = (name: string) => {
        let n = name || ''
        if (n.startsWith('U')) n = n.slice(1)
        return n.length ? n[0].toLowerCase() + n.slice(1) : n
    }

    // Serialize each component as sibling under ui, skipping empty ones
    const entries = Object.entries(byComponent || {});
    entries.forEach(([componentName, cfg]) => {
        const key = mapComponentKey(componentName)

        // Build slots content
        const slotLines: string[] = []
        if (cfg && cfg.defaults) {
            for (const [slot, arr] of Object.entries(cfg.defaults)) {
                if (Array.isArray(arr) && arr.length) {
                    const cls = (arr as string[]).join(' ').replace(/`/g, '\\`')
                    slotLines.push(`        ${slot}: \`${cls}\`,`)
                }
            }
        }

        // Build variants content
        const variantPropBlocks: string[] = []
        if (cfg && cfg.props) {
            for (const [propName, options] of Object.entries(cfg.props)) {
                let optionBuffer = ''
                for (const [optionName, slots] of Object.entries(options as Record<string, any>)) {
                    const slotEntries = Object.entries(slots as Record<string, string[]>)
                        .filter(([_, arr]) => Array.isArray(arr) && (arr as string[]).length)
                    if (!slotEntries.length) continue
                    if (slotEntries.length === 1 && slotEntries[0][0] === 'base') {
                        const cls = (slotEntries[0][1] as string[]).join(' ').replace(/`/g, '\\`')
                        optionBuffer += `        ${optionName}: \`${cls}\`,\n`
                    } else {
                        optionBuffer += `        ${optionName}: {\n`
                        for (const [slot, arr] of slotEntries) {
                            const cls = (arr as string[]).join(' ').replace(/`/g, '\\`')
                            optionBuffer += `          ${slot}: \`${cls}\`,\n`
                        }
                        optionBuffer += `        },\n`
                    }
                }
                if (optionBuffer) {
                    variantPropBlocks.push(`      ${propName}: {\n${optionBuffer}      },`)
                }
            }
        }

        // Skip entirely if nothing to output
        if (slotLines.length === 0 && variantPropBlocks.length === 0) return

        // Start component block
        configContent += `    ${key}: {\n`
        // slots (only if any)
        if (slotLines.length) {
            configContent += `      slots: {\n${slotLines.join('\n')}\n      },\n`
        }
        // variants (only if any)
        if (variantPropBlocks.length) {
            configContent += `      variants: {\n${variantPropBlocks.join('\n')}\n      }\n`
        }
        configContent += `    },\n`
    });

    // Close the structure
    configContent += `  }
});
`;

	return configContent;
}

function generateCssContent(params: {
	themeVariables?: Record<string, string>;
	themeVariablesByMode?: { light?: Record<string, string>; dark?: Record<string, string> };
	customColors?: Array<{ name: string; values: Record<string, string> }>;
}): string {
	const { themeVariables, themeVariablesByMode, customColors } = params;
	let cssContent = `@import "tailwindcss";\n@import "@nuxt/ui";\n\n`;

	// Determine per-mode maps
	const lightVars = themeVariablesByMode?.light || themeVariables || {};
	const darkVars = themeVariablesByMode?.dark;

	// Helper to serialize vars excluding theme color assignments
	const toLines = (vars: Record<string, string>) => Object.entries(vars)
		// Exclude semantic vars (--ui-[var], --ui-[var]-[shade], --ui-[var]-color-[shade])
		// and the new aliases (--ui-color-[var]-[shade]) from export
		.filter(([key]) => !(
			/^--ui-(primary|secondary|success|neutral|info|warning|error)(?:-\d+|-color-\d+)?$/.test(key) ||
			/^--ui-color-(primary|secondary|success|neutral|info|warning|error)-\d+$/.test(key)
		))
		.map(([key, value]) => `  ${key}: ${value};`)
		.join('\n');

	// :root block (light)
	cssContent += `:root {\n${toLines(lightVars)}\n}\n`;

	// .dark block, if provided
	if (darkVars && Object.keys(darkVars).length) {
		cssContent += `\n.dark {\n${toLines(darkVars)}\n}\n`;
	}

	// Add custom colors as CSS variables if they exist (on :root)
	if (customColors && customColors.length > 0) {
		cssContent += '\n/* Custom Colors */\n:root {\n';
		customColors.forEach((color) => {
			Object.entries(color.values).forEach(([shade, value]) => {
				cssContent += `  --color-${color.name.toLowerCase()}-${shade}: ${value};\n`;
			});
		});
		cssContent += '}\n';
	}

	return cssContent;
}
