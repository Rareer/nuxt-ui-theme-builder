import { watchEffect } from 'vue';
import { useColorsStore } from '../store/colors';
import { useThemeStore } from '../store/theme';
import { tailwindColors } from '../utils/tailwindColors';

export function useThemeCss() {
  const colorStore = useColorsStore();
  const themeStore = useThemeStore();
  const styleTagId = 'global-theme-style';

  // Only run in client-side environment
  if (process.client) {
    watchEffect(() => {
      // Get all CSS variables
      const cssVariables = generateAllCssVariables();
      
      // Create or update style tag
      let styleEl = document.getElementById(styleTagId) as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleTagId;
        document.head.appendChild(styleEl);
      }

      // Generate CSS content - apply to both :root and .theme-preview
      // This ensures the variables are available globally but also specifically within theme previews
      const cssVariablesString = Object.entries(cssVariables)
        .map(([key, value]) => `  ${key}: ${value};`)
        .join('\n');
        
      const cssContent = `.theme-preview {\n${cssVariablesString}\n color: var(--ui-text); background: var(--ui-bg);}`;

      styleEl.innerHTML = cssContent;
    });
  }

  // Generate CSS variables from all colors in the store
  function generateColorCssVariables(): Record<string, string> {
    const styleObj: Record<string, string> = {};
    
    // Add custom colors from the store
    const colors = colorStore.getColors;
    if (colors && colors.length > 0) {
      colors.forEach(color => {
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
      ...themeStore.getThemeCssVariables
    };
  }
}
