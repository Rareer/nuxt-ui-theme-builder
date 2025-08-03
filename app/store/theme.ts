import { defineStore } from 'pinia';
import { useColorsStore } from './colors';

// Definiere die Theme-Variablen, die wir zuweisen können
export type ThemeVariable = 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error';

export const useThemeStore = defineStore('theme', {
  state: () => ({
    // Speichert die Zuordnungen von Theme-Variablen zu Farbnamen
    // z.B. { primary: 'Blau', secondary: 'Grün', ... }
    mappings: {} as Record<ThemeVariable, string | null>,
  }),

  getters: {
    // Gibt alle Theme-Variablen zurück
    getThemeVariables(): ThemeVariable[] {
      return ['primary', 'secondary', 'success', 'info', 'warning', 'error'];
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
        
        // Setze die Hauptvariable als Referenz auf die 500er Farbvariable
        result[`--ui-${variable}`] = `var(--ui-color-${colorName}-500)`;
        
        // Generiere die CSS-Variablen für jede Abstufung
        const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
        shades.forEach(shade => {
          result[`--ui-${variable}-${shade}`] = `var(--ui-color-${colorName}-${shade})`;
        });
      });
      
      return result;
    }
  },

  actions: {
    // Setzt die Zuordnung für eine Theme-Variable
    setMapping(variable: ThemeVariable, colorName: string | null) {
      this.mappings[variable] = colorName;
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
    }
  }
});
