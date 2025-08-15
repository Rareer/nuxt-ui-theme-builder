<template>
  <div class="space-y-8 p-4">
    <!-- Mode Toggle -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-sm text-neutral-500">Mode:</span>
        <div class="inline-flex rounded-md overflow-hidden ring-1 ring-gray-200">
          <UButton
            :color="currentMode === 'light' ? 'primary' : 'neutral'"
            variant="soft"
            size="xs"
            @click="setMode('light')"
          >Light</UButton>
          <UButton
            :color="currentMode === 'dark' ? 'primary' : 'neutral'"
            variant="soft"
            size="xs"
            @click="setMode('dark')"
          >Dark</UButton>
        </div>
      </div>
    </div>
    <!-- Theme-Variablen Sektion -->
    <div class="space-y-6">
      <h2 class="text-xl font-bold">{{ t('variableConfigurator.assignTitle') }}</h2>
      <p class="text-sm text-neutral-500">{{ t('variableConfigurator.assignDesc') }}</p>
        <div class="grid grid-cols-1 gap-4">
          <div 
            v-for="variable in themeVariables" 
            :key="variable"
            class="ring ring-gray-200 rounded-lg p-4 space-y-3 flex flex-col gap-2"
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
                :placeholder="t('variableConfigurator.selectColor')"
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
    </div>
    
    <!-- CSS-Variablen Sektion -->
    <div class="space-y-6">
      <h2 class="text-xl font-bold">{{ t('variableConfigurator.cssTitle') }}</h2>
      <p class="text-sm text-neutral-500">{{ t('variableConfigurator.cssDesc') }}</p>
      <div class="space-y-4">
        <UAccordion
          v-if="Object.keys(cssVariablesByCategory).length > 0"
          :items="Object.keys(cssVariablesByCategory).map(category => ({
            label: category,
            slot: category,
            defaultOpen: category === 'Text'
          }))"
        >
          <template #default="{ item }">
            <div class="py-3">
              <div class="font-medium text-lg">{{ item.label }}</div>
            </div>
          </template>
          
          <template v-for="category in Object.keys(cssVariablesByCategory)" :key="category" #[category]>
            <div class="grid grid-cols-1 gap-4 py-4 px-1">
              <div 
                v-for="variable in cssVariablesByCategory[category]" 
                :key="variable.name"
                class="ring ring-gray-200 rounded-lg p-4 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <h4 class="font-medium">{{ variable.label }}</h4>
                  <UBadge color="neutral">--{{ variable.name }}</UBadge>
                </div>
                
                <div class="space-y-3">
                  <!-- Typ-Auswahl -->
                  <URadioGroup
                    v-model="variable.type"
                    :items="[{label: t('variableConfigurator.colorRef'), value: 'color-reference'}, {label: t('variableConfigurator.directValue'), value: 'direct-value'}]"
                    @update:model-value="updateCssVariable(variable)"
                  />
                  
                  <!-- Eingabefeld je nach Typ -->
                  <div v-if="variable.type === 'color-reference'" class="mt-2">
                    <UFormField>
                      <USelect
                        v-model="variable.selectedColor"
                        :items="colorOptions"
                        :placeholder="t('variableConfigurator.selectColor')"
                        class="w-full"
                        @update:model-value="updateSelectedColor(variable)"
                      />
                    </UFormField>
                    
                    <!-- Shade-Auswahl durch Klick -->
                    <div v-if="variable.selectedColor" class="mt-3">
                      <div class="text-xs text-neutral-500 mb-1">{{ t('variableConfigurator.selectShade') }}</div>
                      <div class="flex flex-wrap gap-1">
                        <div 
                          v-for="shade in shades" 
                          :key="shade"
                          class="w-6 h-6 rounded-sm cursor-pointer transition-all hover:scale-110"
                          :class="{ 'ring-2 ring-primary-500': isSelectedShade(variable, shade) }"
                          :style="{ backgroundColor: getColorShade(variable.selectedColor, shade) }"
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
                        class="w-full"
                        @update:model-value="updateCssVariable(variable)"
                      >
                        <template #trailing v-if="variable.value && variable.value.startsWith('#')">
                          <div 
                            class="w-4 h-4 rounded-sm" 
                            :style="{ backgroundColor: variable.value }"
                          ></div>
                        </template>
                      </UInput>
                    </UFormField>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UAccordion>
      </div>
      
      <div class="mt-4 flex gap-2">
        <UButton color="neutral" @click="resetCssVariables">{{ t('variableConfigurator.resetAll') }} ({{ currentMode }})</UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useColorsStore } from '../store/colors';
import { useThemeStore, type CssVariableMapping, type CssVariableType } from '../store/theme';
import { type ThemeVariable } from '../constants/theme';
import { getTailwindColorsAsColorObjects, getTailwindColorByName, isTailwindColor } from '../utils/tailwindColors';
import type { Color } from '../types/color';
import { useI18n } from 'vue-i18n';

// Type für Farbwerte mit String-Index
interface ColorValues {
  [key: string]: string;
}

const colorStore = useColorsStore();
const themeStore = useThemeStore();
const { t } = useI18n();

// Aktueller Editiermodus aus dem Store
const currentMode = computed(() => themeStore.getEditMode);

function setMode(mode: 'light'|'dark') {
  themeStore.setEditMode(mode);
  if (process.client) {
    const el = document.documentElement;
    if (mode === 'dark') el.classList.add('dark');
    else el.classList.remove('dark');
  }
}

// Verfügbare Theme-Variablen
const themeVariables = themeStore.getThemeVariables;

// Farbabstufungen
const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

// Ausgewählte Farben für Theme-Variablen
const selectedColors = ref<Record<ThemeVariable, string>>({} as Record<ThemeVariable, string>);

// Initialisiere die ausgewählten Farben aus dem Store
onMounted(() => {
  // Initial aus aktuellem Modus laden
  hydrateSelectedColorsFromMode(currentMode.value);
});

// Wenn der Modus wechselt, UI-Auswahl aus dem entsprechenden Bucket laden
watch(currentMode, (mode) => {
  hydrateSelectedColorsFromMode(mode);
});

function hydrateSelectedColorsFromMode(mode: 'light'|'dark') {
  const bucket = themeStore.mappings?.[mode] || {};
  const next: Record<ThemeVariable, string> = {} as any;
  (themeVariables as ThemeVariable[]).forEach((v) => {
    next[v] = (bucket[v] || '') as string;
  });
  selectedColors.value = next;
}

// CSS-Variablen nach Kategorien gruppiert
const cssVariablesByCategory = computed(() => {
  const variables = themeStore.getCssVariables;
  const categories: Record<string, Array<CssVariableMapping & { selectedColor?: string }>> = {};
  
  variables.forEach(variable => {
    const category = variable.category || 'Allgemein';
    if (!categories[category]) {
      categories[category] = [];
    }
    
    // Füge selectedColor hinzu, wenn es eine Farbreferenz ist
    const enhancedVariable = { ...variable };
    if (variable.type === 'color-reference' && variable.value) {
      const [colorName] = variable.value.split('-');
      enhancedVariable.selectedColor = colorName;
    }
    
    categories[category].push(enhancedVariable);
  });
  
  return categories;
});

// Farboptionen für die Dropdown-Menüs
const colorOptions = computed(() => {
  const options: Array<{ label: string; value: string; disabled?: boolean }> = [];
  
  // Eigene Farben Header
  if (colorStore.colors.length > 0) {
    options.push({
      label: `--- ${t('variableConfigurator.customColorsHeader')} ---`,
      value: 'separator-custom',
      disabled: true
    });
    
    // Füge benutzerdefinierte Farben hinzu
    colorStore.colors.forEach(color => {
      options.push({
        label: color.name,
        value: color.name
      });
    });
  }
  
  // Tailwind Farben Header
  options.push({
    label: `--- ${t('variableConfigurator.tailwindColorsHeader')} ---`,
    value: 'separator-tailwind',
    disabled: true
  });
  
  // Füge Tailwind-Farben hinzu
  const tailwindColors = getTailwindColorsAsColorObjects();
  tailwindColors.forEach(color => {
    options.push({
      label: color.name,
      value: color.name
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
  themeStore.resetCssVariables(currentMode.value);
  // Zusätzlich: Theme-Variablen-Zuweisungen zurücksetzen
  themeStore.clearAllMappings();
  // UI zurücksetzen: Auswahl der Farben leeren
  themeVariables.forEach(variable => {
    selectedColors.value[variable] = '' as any;
  });
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

// Watch for changes in selected colors and update the theme store
watch(selectedColors, (newValues) => {
  Object.entries(newValues).forEach(([variable, colorName]) => {
    // Schreibt in den aktuell aktiven Modus (editMode)
    themeStore.setMapping(variable as ThemeVariable, (colorName as string) || null);
  });
}, { deep: true });
</script>
