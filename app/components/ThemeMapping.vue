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
            <CssVariableEditor
              v-for="variable in variables"
              :key="variable.name"
              :variable="variable"
              @update="updateCssVariable"
            />
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
import { useThemeStore, type CssVariableMapping, type CssVariableType } from '../store/theme';
import { type ThemeVariable } from '../constants/theme';
import { getTailwindColorsAsColorObjects } from '../utils/tailwindColors';
import { useColorUtils } from '../composables/useColorUtils';
import CssVariableEditor from './CssVariableEditor.vue';

// Nuxt UI components should be auto-imported

const colorStore = useColorsStore();
const themeStore = useThemeStore();

// Verfügbare Theme-Variablen
const themeVariables = themeStore.getThemeVariables;

// Farbutils (Shades, Optionen, Helpers)
const { shades, colorOptions, getColorShade } = useColorUtils();

// Ausgewählte Farben für jede Theme-Variable
const selectedColors = ref<Record<ThemeVariable, string>>({} as Record<ThemeVariable, string>);

// colorOptions kommt aus useColorUtils

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

// Entfernt: colorReferenceOptions (nicht verwendet)

// Entfernt: getColorFromReference (jetzt im CssVariableEditor/useColorUtils)

// Funktion zum Aktualisieren einer CSS-Variable im Store
function updateCssVariable(variable: CssVariableMapping) {
  themeStore.updateCssVariable(variable);
}

// Entfernt: updateSelectedColor/selectShade/isSelectedShade (in CssVariableEditor)

// Funktion zum Zurücksetzen aller CSS-Variablen auf Standardwerte
function resetCssVariables() {
  themeStore.resetCssVariables();
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

// getColorShade kommt aus useColorUtils
</script>
