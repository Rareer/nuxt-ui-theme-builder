import { defineStore } from 'pinia';
import { useColorsStore } from './colors';

// Definiere die Theme-Variablen, die wir zuweisen können
export type ThemeVariable = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

// Definiere die zusätzlichen CSS-Variablen
export type CssVariableType = 'color-reference' | 'direct-value';

export interface CssVariableMapping {
  name: string;         // Name der CSS-Variable (ohne --)
  type: CssVariableType; // Typ der Zuweisung (Farbreferenz oder direkter Wert)
  value: string;        // Wert oder Referenz
  label: string;        // Anzeigename für die UI
  category: string;     // Kategorie für die Gruppierung in der UI
  selectedColor?: string; // Ausgewählte Grundfarbe (ohne Shade) für die UI
}

// Vordefinierte CSS-Variablen
export const predefinedCssVariables: CssVariableMapping[] = [
  // Text-Variablen
  { name: 'ui-text-dimmed', type: 'color-reference', value: 'neutral-400', label: 'Text Dimmed', category: 'Text' },
  { name: 'ui-text-muted', type: 'color-reference', value: 'neutral-500', label: 'Text Muted', category: 'Text' },
  { name: 'ui-text-toned', type: 'color-reference', value: 'neutral-600', label: 'Text Toned', category: 'Text' },
  { name: 'ui-text', type: 'color-reference', value: 'neutral-700', label: 'Text', category: 'Text' },
  { name: 'ui-text-highlighted', type: 'color-reference', value: 'neutral-900', label: 'Text Highlighted', category: 'Text' },
  { name: 'ui-text-inverted', type: 'direct-value', value: '#ffffff', label: 'Text Inverted', category: 'Text' },
  
  // Hintergrund-Variablen
  { name: 'ui-bg', type: 'direct-value', value: '#ffffff', label: 'Background', category: 'Background' },
  { name: 'ui-bg-muted', type: 'color-reference', value: 'neutral-50', label: 'Background Muted', category: 'Background' },
  { name: 'ui-bg-elevated', type: 'color-reference', value: 'neutral-100', label: 'Background Elevated', category: 'Background' },
  { name: 'ui-bg-accented', type: 'color-reference', value: 'neutral-200', label: 'Background Accented', category: 'Background' },
  { name: 'ui-bg-inverted', type: 'color-reference', value: 'neutral-900', label: 'Background Inverted', category: 'Background' },
  
  // Rahmen-Variablen
  { name: 'ui-border', type: 'color-reference', value: 'neutral-200', label: 'Border', category: 'Border' },
  { name: 'ui-border-muted', type: 'color-reference', value: 'neutral-200', label: 'Border Muted', category: 'Border' },
  { name: 'ui-border-accented', type: 'color-reference', value: 'neutral-300', label: 'Border Accented', category: 'Border' },
  { name: 'ui-border-inverted', type: 'color-reference', value: 'neutral-900', label: 'Border Inverted', category: 'Border' }
];

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // Speichert die Zuordnungen von Theme-Variablen zu Farbnamen
    // z.B. { primary: 'Blau', secondary: 'Grün', ... }
    mappings: {} as Record<ThemeVariable, string | null>,
    
    // Speichert die Zuordnungen für zusätzliche CSS-Variablen
    cssVariableMappings: {} as Record<string, CssVariableMapping>,
  }),
  
  // Initialisiere den Store mit vordefinierten CSS-Variablen
  hydrate(state) {
    // Initialisiere die CSS-Variablen mit den vordefinierten Werten
    predefinedCssVariables.forEach(variable => {
      state.cssVariableMappings[variable.name] = { ...variable };
    });
  },

  getters: {
    // Gibt alle Theme-Variablen zurück
    getThemeVariables(): ThemeVariable[] {
      return ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
    },
    
    // Gibt alle CSS-Variablen zurück
    getCssVariables(): CssVariableMapping[] {
      return Object.values(this.cssVariableMappings);
    },
    
    // Gibt alle CSS-Variablen nach Kategorie gruppiert zurück
    getCssVariablesByCategory(): Record<string, CssVariableMapping[]> {
      const result: Record<string, CssVariableMapping[]> = {};
      
      Object.values(this.cssVariableMappings).forEach(variable => {
        if (variable && variable.category) {
          // Initialize the category array if it doesn't exist
          if (!result[variable.category]) {
            result[variable.category] = [];
          }
          // TypeScript assertion to ensure the array exists
          const categoryArray = result[variable.category];
          if (categoryArray) {
            categoryArray.push(variable);
          }
        }
      });
      
      return result;
    },
    
    // Gibt eine bestimmte CSS-Variable zurück
    getCssVariable: (state) => (name: string): CssVariableMapping | null => {
      return state.cssVariableMappings[name] || null;
    },

    // Gibt die aktuelle Zuordnung für eine Theme-Variable zurück
    getMapping: (state) => (variable: ThemeVariable): string | null => {
      return state.mappings[variable] || null;
    },

    // Gibt alle CSS-Variablen für die Theme-Vorschau zurück
    getThemeCssVariables(): Record<string, string> {
      const colorStore = useColorsStore();
      const result: Record<string, string> = {};
      
      // Für jede Theme-Variable
      Object.entries(this.mappings).forEach(([variable, colorName]) => {
        if (!colorName) return;
        
        // Normalize color name to ensure consistency with CSS variable naming in ThemePreview.vue
        const normalizedColorName = colorName.toLowerCase().replace(/\s+/g, '-');
        
        // Setze die Hauptvariable als Referenz auf die 500er Farbvariable
        result[`--ui-${variable}`] = `var(--ui-color-${normalizedColorName}-500)`;
        
        // Generiere die CSS-Variablen für jede Abstufung
        const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
        shades.forEach(shade => {
          result[`--ui-${variable}-${shade}`] = `var(--ui-color-${normalizedColorName}-${shade})`;
        });
      });
      
      // Für jede zusätzliche CSS-Variable
      Object.values(this.cssVariableMappings).forEach(variable => {
        if (variable && variable.type === 'color-reference') {
          // Format: 'neutral-500' -> split into colorName and shade
          const [colorName, shade] = variable.value.split('-');
          if (colorName && shade) {
            // Ensure color name is already normalized in the reference
            // No need to normalize here as it should be normalized when set in ThemeMapping.vue
            result[`--${variable.name}`] = `var(--ui-color-${colorName}-${shade})`;
          }
        } else if (variable && variable.type === 'direct-value') {
          // Direkter Wert (z.B. #ffffff)
          result[`--${variable.name}`] = variable.value || '';
        }
      });
      
      return result;
    }
  },

  actions: {
    // Setzt die Zuordnung für eine Theme-Variable
    setMapping(variable: ThemeVariable, colorName: string | null) {
      // Normalize color name to ensure consistency with CSS variable naming
      // This matches the normalization in ThemePreview.vue
      this.mappings[variable] = colorName ? colorName : null;
    },

    // Löscht die Zuordnung für eine Theme-Variable
    clearMapping(variable: ThemeVariable) {
      this.mappings[variable] = null;
    },

    // Löscht alle Zuordnungen
    clearAllMappings() {
      this.getThemeVariables.forEach(variable => {
        this.mappings[variable] = null;
      });
    },
    
    // Setzt den Wert einer CSS-Variable
    setCssVariableValue(name: string, value: string) {
      if (this.cssVariableMappings[name]) {
        this.cssVariableMappings[name].value = value;
      }
    },
    
    // Setzt den Typ einer CSS-Variable
    setCssVariableType(name: string, type: CssVariableType) {
      if (this.cssVariableMappings[name]) {
        this.cssVariableMappings[name].type = type;
      }
    },
    
    // Fügt eine neue CSS-Variable hinzu oder aktualisiert eine bestehende
    updateCssVariable(variable: CssVariableMapping) {
      this.cssVariableMappings[variable.name] = { ...variable };
    },
    
    // Löscht eine CSS-Variable
    deleteCssVariable(name: string) {
      delete this.cssVariableMappings[name];
    },
    
    // Setzt alle CSS-Variablen auf ihre Standardwerte zurück
    resetCssVariables() {
      this.cssVariableMappings = {};
      predefinedCssVariables.forEach(variable => {
        this.cssVariableMappings[variable.name] = { ...variable };
      });
    }
  }
});
