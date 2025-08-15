import { defineStore } from 'pinia';
import { THEME_VARIABLES } from '../constants/theme';
import type { ThemeVariable } from '../constants/theme';
import { buildThemeCssVariables } from '../utils/themeCss';
import { normalizeColorName } from '../utils/colors';

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

export type ThemeMode = 'light' | 'dark'

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
  { name: 'ui-border-inverted', type: 'color-reference', value: 'neutral-900', label: 'Border Inverted', category: 'Border' },

    // Radius-Variablen
    { name: 'ui-radius', type: 'direct-value', value: '0.25rem', label: 'Radius', category: 'Radius' },
];

// Dark defaults derived from current darkOverrides in useThemeCss
const darkDefaultOverrides: Record<string, { type: CssVariableType; value: string }> = {
  // Background
  'ui-bg': { type: 'color-reference', value: 'slate-900' },
  'ui-bg-muted': { type: 'color-reference', value: 'slate-800' },
  'ui-bg-elevated': { type: 'color-reference', value: 'slate-700' },
  'ui-bg-accented': { type: 'color-reference', value: 'slate-600' },
  'ui-bg-inverted': { type: 'color-reference', value: 'slate-500' },
  // Text
  'ui-text': { type: 'direct-value', value: '#ffffff' },
  'ui-text-dimmed': { type: 'color-reference', value: 'neutral-400' },
  'ui-text-muted': { type: 'color-reference', value: 'neutral-300' },
  'ui-text-toned': { type: 'color-reference', value: 'neutral-200' },
  'ui-text-highlighted': { type: 'direct-value', value: '#ffffff' },
  // Border
  'ui-border': { type: 'color-reference', value: 'neutral-800' },
  'ui-border-muted': { type: 'color-reference', value: 'neutral-800' },
  'ui-border-accented': { type: 'color-reference', value: 'neutral-700' },
  'ui-border-inverted': { type: 'color-reference', value: 'neutral-800' }
}

function buildPredefinedForMode(mode: ThemeMode): CssVariableMapping[] {
  if (mode === 'light') return predefinedCssVariables.map(v => ({ ...v }))
  // dark: copy light and override values/types where provided
  return predefinedCssVariables.map(v => {
    const override = darkDefaultOverrides[v.name]
    if (override) {
      return { ...v, type: override.type, value: override.value }
    }
    return { ...v }
  })
}

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // Speichert die Zuordnungen von Theme-Variablen zu Farbnamen je Modus
    // z.B. { light: { primary: 'blue', ... }, dark: { primary: 'indigo', ... } }
    mappings: {
      light: {} as Record<ThemeVariable, string | null>,
      dark: {} as Record<ThemeVariable, string | null>
    },
    
    // Editiermodus für UI (welche Variante wird im Editor angezeigt/bearbeitet)
    editMode: 'light' as ThemeMode,

    // Speichert die Zuordnungen für zusätzliche CSS-Variablen je Modus
    cssVariableMappings: {
      light: {} as Record<string, CssVariableMapping>,
      dark: {} as Record<string, CssVariableMapping>
    },
  }),
  
  // Initialisiere den Store mit vordefinierten CSS-Variablen
  hydrate(state) {
    // Initialisiere die CSS-Variablen mit den vordefinierten Werten je Modus
    buildPredefinedForMode('light').forEach(variable => {
      state.cssVariableMappings.light[variable.name] = { ...variable }
    })
    buildPredefinedForMode('dark').forEach(variable => {
      state.cssVariableMappings.dark[variable.name] = { ...variable }
    })
  },

  getters: {
    // Gibt alle Theme-Variablen zurück
    getThemeVariables(): ThemeVariable[] {
      return THEME_VARIABLES;
    },
    
    // Aktueller Editiermodus
    getEditMode(state): ThemeMode {
      return state.editMode
    },

    // Gibt alle CSS-Variablen (für aktuellen Editiermodus) zurück
    getCssVariables(): CssVariableMapping[] {
      return Object.values(this.cssVariableMappings[this.editMode]);
    },

    // Gibt alle CSS-Variablen für angegebenen Modus zurück
    getCssVariablesByMode: (state) => (mode: ThemeMode): CssVariableMapping[] => {
      return Object.values(state.cssVariableMappings[mode] || {})
    },
    
    // Gibt alle CSS-Variablen nach Kategorie gruppiert zurück
    getCssVariablesByCategory(): Record<string, CssVariableMapping[]> {
      const result: Record<string, CssVariableMapping[]> = {};
      
      Object.values(this.cssVariableMappings[this.editMode]).forEach(variable => {
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

    // Kategorie-Gruppierung für angegebenen Modus
    getCssVariablesByCategoryByMode(): (mode: ThemeMode) => Record<string, CssVariableMapping[]> {
      return (mode: ThemeMode) => {
        const result: Record<string, CssVariableMapping[]> = {}
        Object.values(this.cssVariableMappings[mode] || {}).forEach(variable => {
          if (variable && variable.category) {
            if (!result[variable.category]) result[variable.category] = []
            result[variable.category].push(variable)
          }
        })
        return result
      }
    },
    
    // Gibt eine bestimmte CSS-Variable zurück
    getCssVariable: (state) => (name: string, mode?: ThemeMode): CssVariableMapping | null => {
      const m = mode || state.editMode
      return state.cssVariableMappings[m]?.[name] || null;
    },

    // Gibt die aktuelle Zuordnung für eine Theme-Variable zurück (optional Modus)
    getMapping: (state) => (variable: ThemeVariable, mode?: ThemeMode): string | null => {
      const m = mode || state.editMode
      return state.mappings[m]?.[variable] ?? null;
    },

    // Gibt alle CSS-Variablen für die Theme-Vorschau zurück (für aktuellen Modus)
    getThemeCssVariables(): Record<string, string> {
      return buildThemeCssVariables(this.mappings[this.editMode] as Record<ThemeVariable, string | null>, this.cssVariableMappings[this.editMode]);
    },

    // Für angegebenen Modus
    getThemeCssVariablesByMode(): (mode: ThemeMode) => Record<string, string> {
      return (mode: ThemeMode) => buildThemeCssVariables(this.mappings[mode] as Record<ThemeVariable, string | null>, this.cssVariableMappings[mode])
    }
  },

  actions: {
    setEditMode(mode: ThemeMode) {
      this.editMode = mode
    },
    // Setzt die Zuordnung für eine Theme-Variable (optional Modus)
    setMapping(variable: ThemeVariable, colorName: string | null, mode?: ThemeMode) {
      const m = mode || this.editMode
      this.mappings[m][variable] = colorName ? normalizeColorName(colorName) : null;
    },

    // Löscht die Zuordnung für eine Theme-Variable
    clearMapping(variable: ThemeVariable, mode?: ThemeMode) {
      const m = mode || this.editMode
      this.mappings[m][variable] = null;
    },

    // Löscht alle Zuordnungen (optional nur für einen Modus)
    clearAllMappings(mode?: ThemeMode) {
      const clearFor = (m: ThemeMode) => {
        this.getThemeVariables.forEach(variable => {
          this.mappings[m][variable] = null;
        });
      }
      if (mode) clearFor(mode)
      else { clearFor('light'); clearFor('dark') }
    },
    
    // Setzt den Wert einer CSS-Variable
    setCssVariableValue(name: string, value: string, mode?: ThemeMode) {
      const m = mode || this.editMode
      const bucket = this.cssVariableMappings[m]
      if (bucket && bucket[name]) {
        bucket[name].value = value
      }
    },
    
    // Setzt den Typ einer CSS-Variable
    setCssVariableType(name: string, type: CssVariableType, mode?: ThemeMode) {
      const m = mode || this.editMode
      const bucket = this.cssVariableMappings[m]
      if (bucket && bucket[name]) {
        bucket[name].type = type
      }
    },
    
    // Fügt eine neue CSS-Variable hinzu oder aktualisiert eine bestehende
    updateCssVariable(variable: CssVariableMapping, mode?: ThemeMode) {
      const m = mode || this.editMode
      this.cssVariableMappings[m][variable.name] = { ...variable };
    },
    
    // Löscht eine CSS-Variable
    deleteCssVariable(name: string, mode?: ThemeMode) {
      const m = mode || this.editMode
      delete this.cssVariableMappings[m][name];
    },
    
    // Setzt alle CSS-Variablen auf ihre Standardwerte zurück
    resetCssVariables(mode?: ThemeMode) {
      if (mode) {
        this.cssVariableMappings[mode] = {}
        buildPredefinedForMode(mode).forEach(variable => {
          this.cssVariableMappings[mode][variable.name] = { ...variable }
        })
      } else {
        this.cssVariableMappings.light = {}
        this.cssVariableMappings.dark = {}
        buildPredefinedForMode('light').forEach(variable => {
          this.cssVariableMappings.light[variable.name] = { ...variable }
        })
        buildPredefinedForMode('dark').forEach(variable => {
          this.cssVariableMappings.dark[variable.name] = { ...variable }
        })
      }
    },

    // Persist the current store state to LocalStorage
    saveToLocalStorage() {
      if (typeof window === 'undefined') return;
      const key = `store:${this.$id}`;
      try {
        localStorage.setItem(key, JSON.stringify(this.$state));
      } catch (e) {
        console.warn(`[theme] Failed to save state:`, e);
      }
    },

    // Load the store state from LocalStorage
    loadFromLocalStorage() {
      if (typeof window === 'undefined') return;
      const key = `store:${this.$id}`;
      try {
        const raw = localStorage.getItem(key);
        if (raw) {
          this.$patch(JSON.parse(raw));
        }
      } catch (e) {
        console.warn(`[theme] Failed to load state:`, e);
      }
    },

    // Remove any persisted state for this store
    clearLocalStorage() {
      if (typeof window === 'undefined') return;
      const key = `store:${this.$id}`;
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`[theme] Failed to clear persisted state:`, e);
      }
    }
  }
});
