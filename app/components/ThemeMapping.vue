<template>
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

        <UFormGroup>
          <USelect
            class="w-full"
            v-model="selectedColors[variable]"
            :items="colorOptions"
            placeholder="Farbe auswählen"
          />
        </UFormGroup>

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
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useColorsStore } from '../store/colors';
import { useThemeStore, type ThemeVariable } from '../store/theme';
import { getTailwindColorsAsColorObjects, getTailwindColorByName, isTailwindColor } from '../utils/tailwindColors';
import type { Color } from '../types/color';

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
  themeVariables.forEach(variable => {
    const mapping = themeStore.getMapping(variable);
    selectedColors.value[variable] = mapping || '';
  });
});

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
