<template>
  <div class="space-y-10">
    <!-- Theme-Variablen Sektion -->
    <div class="space-y-6">
      <h2 class="text-xl font-bold">Theme-Variablen zuweisen</h2>
      <p class="text-sm text-neutral-500">
        Weise deine erstellten Farben den Nuxt UI Theme-Variablen zu, um das Erscheinungsbild der UI-Komponenten anzupassen.
      </p>
    <ThemePreview>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div 
        v-for="variable in themeVariables" 
        :key="variable"
        class="border rounded-lg p-4 space-y-3 flex flex-col gap-2"
      >
        <div class="flex items-center justify-between">
          <h3 class="font-medium">{{ getVariableLabel(variable) }}</h3>
          <UBadge :color="variable">{{ variable }}</UBadge>
        </div>

        <UFormField>
          <USelect
            class="w-full"
            v-model="selectedColors[variable]"
            :items="colorOptions"
            placeholder="Farbe auswählen"
          />
        </UFormField>

        <div v-if="selectedColors[variable]" class="flex flex-wrap gap-1">
          <div 
            v-for="shade in shades" 
            :key="shade"
            class="w-5 h-5 rounded-sm"
            :style="{ backgroundColor: getColorShade(selectedColors[variable], shade) }"
            :title="`${shade}: ${getColorShade(selectedColors[variable], shade)}`"
          ></div>
        </div>
      </div>
    </div>
    </ThemePreview>
    </div>
    
    <!-- CSS-Variablen Sektion -->
    <div class="space-y-6">
      <h2 class="text-xl font-bold">CSS-Variablen anpassen</h2>
      <p class="text-sm text-neutral-500">
        Passe die zusätzlichen CSS-Variablen an, die für spezielle UI-Elemente verwendet werden.
      </p>
        <div v-for="(variables, category) in cssVariablesByCategory" :key="category" class="mb-8">
          <h3 class="font-medium text-lg mb-4">{{ category }}</h3>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="variable in variables" 
              :key="variable.name"
              class="border rounded-lg p-4 space-y-3"
            >
              <div class="flex items-center justify-between">
                <h4 class="font-medium">{{ variable.label }}</h4>
                <UBadge color="neutral">--{{ variable.name }}</UBadge>
              </div>
              
              <div class="space-y-3">
                <!-- Typ-Auswahl -->
                <URadioGroup
                  v-model="variable.type"
                  :items="[{label: 'Farbreferenz', value: 'color-reference'}, {label: 'Direkter Wert', value: 'direct-value'}]"
                  @update:model-value="updateCssVariable(variable)"
                />
                
                <!-- Eingabefeld je nach Typ -->
                <div v-if="variable.type === 'color-reference'" class="mt-2">
                  <UFormField>
                    <USelect
                      v-model="variable.selectedColor"
                      :items="colorOptions"
                      placeholder="Farbe auswählen"
                      @update:model-value="updateSelectedColor(variable)"
                    />
                  </UFormField>
                  
                  <!-- Shade-Auswahl durch Klick -->
                  <div v-if="variable.selectedColor" class="mt-3">
                    <div class="text-xs text-neutral-500 mb-1">Shade auswählen:</div>
                    <div class="flex flex-wrap gap-1">
                      <div 
                        v-for="shade in shades" 
                        :key="shade"
                        class="w-6 h-6 rounded-sm cursor-pointer transition-all hover:scale-110"
                        :class="{ 'ring-2 ring-primary-500': isSelectedShade(variable, shade) }"
                        :style="{ backgroundColor: getColorShade(variable.selectedColor, shade) }"
                        :title="`${shade}: ${getColorShade(variable.selectedColor, shade)}`"
                        @click="selectShade(variable, shade)"
                      ></div>
                    </div>
                  </div>
                  
                  <!-- Vorschau der ausgewählten Farbe -->
                  <div v-if="variable.value" class="mt-2 flex items-center gap-2">
                    <div 
                      class="w-6 h-6 rounded-sm" 
                      :style="{ backgroundColor: getColorFromReference(variable.value) }"
                    ></div>
                    <span class="text-xs">{{ getColorFromReference(variable.value) }}</span>
                  </div>
                </div>
                
                <div v-else class="mt-2">
                  <UFormField>
                    <UInput
                      v-model="variable.value"
                      type="text"
                      placeholder="CSS-Wert eingeben (z.B. #ffffff)"
                      @update:model-value="updateCssVariable(variable)"
                    >
                      <template #trailing>
                        <div 
                          class="w-5 h-5 rounded-sm" 
                          :style="{ backgroundColor: variable.value }"
                        ></div>
                      </template>
                    </UInput>
                  </UFormField>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <UButton color="neutral" @click="resetCssVariables">Auf Standardwerte zurücksetzen</UButton>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useColorsStore } from '../store/colors';
import { useThemeStore, type ThemeVariable, type CssVariableMapping, type CssVariableType } from '../store/theme';
import { getTailwindColorsAsColorObjects, getTailwindColorByName, isTailwindColor } from '../utils/tailwindColors';
import type { Color } from '../types/color';
// Nuxt UI components should be auto-imported

// Type für Farbwerte mit String-Index
interface ColorValues {
  [key: string]: string;
}

const colorStore = useColorsStore();
const themeStore = useThemeStore();

// Verfügbare Theme-Variablen
const themeVariables = themeStore.getThemeVariables;

// Farbabstufungen
const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// Ausgewählte Farben für jede Theme-Variable
const selectedColors = ref<Record<ThemeVariable, string>>({} as Record<ThemeVariable, string>);

// Farb-Optionen für die Selects
const colorOptions = computed(() => {
  const options = [];
    
  // Eigene Farben Header
  if (colorStore.getColors.length > 0) {
    options.push({
      label: '--- Eigene Farben ---',
      value: 'separator-custom',
      disabled: true
    });
    
    // Store-Farben
    colorStore.getColors.forEach(color => {
      options.push({
        label: color.name,
        value: color.name
      });
    });
  }
  
  // Tailwind Farben Header
  options.push({
    label: '--- Tailwind Farben ---',
    value: 'separator-tailwind',
    disabled: true
  });
  
  // Tailwind-Farben
  getTailwindColorsAsColorObjects().forEach(color => {
    options.push({
      label: color.name,
      value: color.name
    });
  });
  
  return options;
});

// Beobachte Änderungen an den ausgewählten Farben und aktualisiere den Store
watch(selectedColors, (newValues) => {
  Object.entries(newValues).forEach(([variable, colorName]) => {
    themeStore.setMapping(variable as ThemeVariable, colorName || null);
  });
}, { deep: true });

// Initialisiere die ausgewählten Farben aus dem Store
onMounted(() => {
  // Initialisiere Theme-Variablen
  themeVariables.forEach(variable => {
    const mapping = themeStore.getMapping(variable);
    selectedColors.value[variable] = mapping || '';
  });
  
  // Initialisiere CSS-Variablen mit selectedColor-Eigenschaft
  Object.values(themeStore.getCssVariablesByCategory).flat().forEach(variable => {
    if (variable.type === 'color-reference' && variable.value) {
      const [colorName] = variable.value.split('-');
      if (colorName) {
        // Finde den passenden Farbnamen (mit korrekter Groß-/Kleinschreibung)
        let matchedColor = '';
        
        // Suche in eigenen Farben
        const customColor = colorStore.getColors.find(c => 
          c.name.toLowerCase().replace(/\s+/g, '-') === colorName
        );
        if (customColor) {
          matchedColor = customColor.name;
        } else {
          // Suche in Tailwind-Farben
          const tailwindColor = getTailwindColorsAsColorObjects().find(c => 
            c.name.toLowerCase() === colorName
          );
          if (tailwindColor) {
            matchedColor = tailwindColor.name;
          }
        }
        
        // Setze die ausgewählte Farbe
        (variable as any).selectedColor = matchedColor;
      }
    }
  });
});

// CSS-Variablen nach Kategorie gruppiert
const cssVariablesByCategory = computed(() => {
  return themeStore.getCssVariablesByCategory;
});

// Optionen für Farbreferenzen (alle Farben mit allen Shades) - wird nicht mehr direkt verwendet
// Stattdessen verwenden wir jetzt colorOptions und wählen den Shade separat aus
const colorReferenceOptions = computed(() => {
  const options = [];
  const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
  
  // Eigene Farben
  if (colorStore.getColors.length > 0) {
    options.push({
      label: '--- Eigene Farben ---',
      value: 'separator-custom',
      disabled: true
    });
    
    colorStore.getColors.forEach(color => {
      shades.forEach(shade => {
        options.push({
          label: `${color.name} (${shade})`,
          value: `${color.name.toLowerCase().replace(/\s+/g, '-')}-${shade}`
        });
      });
    });
  }
  
  // Tailwind Farben
  options.push({
    label: '--- Tailwind Farben ---',
    value: 'separator-tailwind',
    disabled: true
  });
  
  // Füge alle Tailwind-Farben mit allen Shades hinzu
  getTailwindColorsAsColorObjects().forEach(color => {
    shades.forEach(shade => {
      // Behandle color.values als ColorValues mit String-Index
      const values = color.values as ColorValues;
      if (values && shade in values) { // Nur wenn dieser Shade existiert
        options.push({
          label: `${color.name} (${shade})`,
          value: `${color.name.toLowerCase()}-${shade}`
        });
      }
    });
  });
  
  return options;
});

// Hilfsfunktion, um eine Farbe aus einer Referenz zu erhalten (z.B. 'neutral-500')
function getColorFromReference(reference: string): string {
  if (!reference) return 'transparent';
  
  const [colorName, shade] = reference.split('-');
  if (!colorName || !shade) return 'transparent';
  
  // Prüfe, ob es eine Tailwind-Farbe ist
  if (isTailwindColor(colorName)) {
    const color = getTailwindColorByName(colorName);
    const values = color?.values as ColorValues | undefined;
    return (values && shade in values && values[shade]) ? values[shade] : 'transparent';
  } else {
    // Sonst suche in den Store-Farben
    const color = colorStore.colors.find(c => 
      c.name.toLowerCase().replace(/\s+/g, '-') === colorName
    );
    const values = color?.values as ColorValues | undefined;
    return (values && shade in values && values[shade]) ? values[shade] : 'transparent';
  }
}

// Funktion zum Aktualisieren einer CSS-Variable im Store
function updateCssVariable(variable: CssVariableMapping) {
  themeStore.updateCssVariable(variable);
}

// Funktion zum Aktualisieren der ausgewählten Farbe einer CSS-Variable
function updateSelectedColor(variable: CssVariableMapping & { selectedColor?: string }) {
  // Wenn eine Farbe ausgewählt wurde, aber noch kein Shade, setzen wir standardmäßig 500
  if (variable.selectedColor) {
    selectShade(variable, '500');
  } else {
    // Wenn keine Farbe ausgewählt wurde, setzen wir den Wert zurück
    variable.value = '';
    updateCssVariable(variable);
  }
}

// Funktion zum Auswählen eines Shades für eine CSS-Variable
function selectShade(variable: CssVariableMapping & { selectedColor?: string }, shade: string) {
  if (!variable.selectedColor) return;
  
  // Erstelle den Wert im Format 'colorname-shade'
  const colorName = variable.selectedColor.toLowerCase().replace(/\s+/g, '-');
  const isTailwind = isTailwindColor(variable.selectedColor);
  const value = isTailwind ? 
    `${colorName.toLowerCase()}-${shade}` : 
    `${colorName.toLowerCase().replace(/\s+/g, '-')}-${shade}`;
  
  // Setze den Wert und aktualisiere die Variable
  variable.value = value;
  updateCssVariable(variable);
}

// Funktion zum Prüfen, ob ein bestimmter Shade für eine Variable ausgewählt ist
function isSelectedShade(variable: CssVariableMapping & { selectedColor?: string }, shade: string): boolean {
  if (!variable.value || !variable.selectedColor) return false;
  
  const [, selectedShade] = variable.value.split('-');
  return selectedShade === shade;
}

// Funktion zum Zurücksetzen aller CSS-Variablen auf Standardwerte
function resetCssVariables() {
  themeStore.resetCssVariables();
}

// Hilfsfunktion für die Anzeige der Variablennamen
function getVariableLabel(variable: ThemeVariable): string {
  const labels: Record<ThemeVariable, string> = {
    primary: 'Primary',
    secondary: 'Secondary',
    success: 'Success',
    info: 'Info',
    warning: 'Warning',
    error: 'Error'
  };
  return labels[variable] || variable;
}

// Hilfsfunktion, um einen bestimmten Farbton einer Farbe zu erhalten
function getColorShade(colorName: string, shade: string): string {
  if (!colorName) return 'transparent';
  
  let color: Color | null = null;
  
  // Prüfe, ob es eine Tailwind-Farbe ist
  if (isTailwindColor(colorName)) {
    color = getTailwindColorByName(colorName);
  } else {
    // Sonst suche in den Store-Farben
    color = colorStore.colors.find(c => c.name === colorName) || null;
  }
  
  if (!color) return 'transparent';
  
  // Verwende einen sicheren Zugriff auf die Farben
  return (color.values as Record<string, string>)[shade] || 'transparent';
}
</script>
