import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    // Get theme variables, custom colors, and theme mappings from request body
    const { themeVariables, customColors, themeMappings, exportMode } = await readBody<{ 
      themeVariables: Record<string, string>,
      customColors?: Array<{ name: string, values: Record<string, string> }>,
      // Accept either flat mapping or per-mode mapping coming from the new store
      themeMappings?: Record<string, string | null> | { light?: Record<string, string | null>, dark?: Record<string, string | null> },
      // Optional preferred export mode for per-mode mappings
      exportMode?: 'light' | 'dark'
    }>(event)
    
    if (!themeVariables) {
      return {
        success: false,
        error: 'No theme variables provided'
      }
    }
    
    // Generate CSS content with the theme variables and custom colors
    const cssContent = generateCssContent(themeVariables, customColors)
    
    // Generate app.config.ts content
    const appConfigContent = generateAppConfigContent(themeMappings, exportMode)
    
    return {
      success: true,
      cssContent,
      appConfigContent
    }
  } catch (error: unknown) {
    console.error('Error exporting theme:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
})

function generateAppConfigContent(
  themeMappings?: Record<string, string | null> | { light?: Record<string, string | null>, dark?: Record<string, string | null> },
  exportMode?: 'light' | 'dark'
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
      const mode: 'light'|'dark' = exportMode || 'light';
      flat = ((themeMappings as any)[mode] || {}) as Record<string, string | null>;
    } else {
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
  
  // Close the structure
  configContent += `    }
  }
});
`;
  
  return configContent;
}

function generateCssContent(themeVariables: Record<string, string>, customColors?: Array<{ name: string, values: Record<string, string> }>): string {
  let cssContent = `@import "tailwindcss";\n@import "@nuxt/ui";\n\n:root {\n`
  
  // Add only non-theme CSS variables to the content
  // Theme variables (--ui-primary, --ui-secondary, etc.) will be handled by Nuxt via app.config.ts
  Object.entries(themeVariables).forEach(([key, value]) => {
    // Skip theme variable assignments (primary, secondary, etc.)
    if (!key.match(/^--ui-(primary|secondary|success|info|warning|error)(-\d+)?$/)) {
      cssContent += `  ${key}: ${value};\n`
    }
  })
  
  cssContent += '}\n'
  
  // Add custom colors as CSS variables if they exist
  if (customColors && customColors.length > 0) {
    cssContent += '\n/* Custom Colors */\n:root {\n'
    
    customColors.forEach(color => {
      Object.entries(color.values).forEach(([shade, value]) => {
        cssContent += `  --color-${color.name.toLowerCase()}-${shade}: ${value};\n`
      })
    })
    
    cssContent += '}\n'
  }
  
  return cssContent
}


