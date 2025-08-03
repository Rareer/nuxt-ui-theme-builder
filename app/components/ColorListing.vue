<template>
  <div class="color-listing">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold">Farben</h2>
      <UButton
        icon="i-heroicons-plus"
        color="primary"
        @click="isAddModalOpen = true"
      >
        Neue Farbe
      </UButton>
    </div>

    <!-- Color List -->
    <div v-if="colorStore.getColors.length > 0" class="space-y-4">
      <div
        v-for="color in colorStore.getColors"
        :key="color.name"
        class="color-item flex items-center justify-between p-4 border rounded-lg shadow-sm"
      >
        <div class="flex items-center gap-4">
          <!-- Color Preview -->
          <div class="flex gap-1">
            <div
              v-for="(_, shade) in color.values"
              :key="shade"
              :style="{ backgroundColor: color.values[shade] }"
              class="w-4 h-10 first:rounded-l-md last:rounded-r-md"
              :title="`${color.name} ${shade}`"
            ></div>
          </div>
          
          <!-- Color Name -->
          <div>
            <h3 class="font-medium">{{ color.name }}</h3>
            <p class="text-xs text-gray-500">{{ color.values[500] }}</p>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="flex gap-2">
          <UButton
            icon="i-heroicons-pencil-square"
            color="neutral"
            variant="ghost"
            @click="editColor(color)"
          />
          <UButton
            icon="i-heroicons-trash"
            color="error"
            variant="ghost"
            @click="confirmDelete(color.name)"
          />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-10 border rounded-lg">
      <UIcon name="i-heroicons-swatch" class="text-4xl text-gray-400 mx-auto mb-2" />
      <p class="text-gray-500">Keine Farben vorhanden</p>
      <UButton class="mt-4" color="primary" @click="isAddModalOpen = true">
        Erste Farbe hinzufügen
      </UButton>
    </div>

    <!-- Add/Edit Color Modal -->
    <UModal 
      v-model:open="isAddModalOpen" 
      :title="isEditing ? 'Farbe bearbeiten' : 'Neue Farbe hinzufügen'" 
      class="sm:max-w-md"
    >
      <!-- Modal trigger is not needed here as we're controlling it programmatically -->
      <template #body>
        <div class="space-y-4 p-4">
          <!-- Color Name -->
          <UFormGroup label="Name" required>
            <UInput
              v-model="newColor.name"
              placeholder="z.B. Blau, Rot, Grün"
              :disabled="isEditing"
            />
          </UFormGroup>

          <!-- Base Color Picker -->
          <UFormGroup label="Hauptfarbe (500)" required>
            <div class="flex gap-2 items-center">
              <div
                class="w-10 h-10 rounded border"
                :style="{ backgroundColor: baseColorHex }"
              ></div>
              <UInput
                v-model="baseColorHex"
                placeholder="#000000"
                class="flex-1"
              />
            </div>
          </UFormGroup>

          <!-- Preview Generated Colors -->
          <div v-if="baseColorHex" class="mt-4">
            <p class="text-sm font-medium mb-2">Vorschau der Farbpalette:</p>
            <div class="flex gap-1 h-10 w-full">
              <div
                v-for="(color, shade) in previewPalette"
                :key="shade"
                :style="{ backgroundColor: color }"
                class="flex-1 first:rounded-l-md last:rounded-r-md"
                :title="`${shade}: ${color}`"
              ></div>
            </div>
          </div>
        </div>
      </template>
      
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="soft"
            @click="isAddModalOpen = false"
          >
            Abbrechen
          </UButton>
          <UButton
            color="primary"
            :disabled="!isFormValid"
            @click="saveColor"
          >
            {{ isEditing ? 'Aktualisieren' : 'Hinzufügen' }}
          </UButton>
        </div>
      </template>
    </UModal>

    <!-- Delete Confirmation Modal -->
    <UModal 
      v-model:open="isDeleteModalOpen"
      title="Farbe löschen"
    >
      <!-- Modal trigger is not needed here as we're controlling it programmatically -->
      <template #body>
        <div class="p-4">
          <p>
            Bist du sicher, dass du die Farbe <strong>{{ colorToDelete }}</strong> löschen möchtest?
            Diese Aktion kann nicht rückgängig gemacht werden.
          </p>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            color="neutral"
            variant="soft"
            @click="isDeleteModalOpen = false"
          >
            Abbrechen
          </UButton>
          <UButton
            color="error"
            @click="deleteColor"
          >
            Löschen
          </UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useColorsStore } from '../store/colors';
import { generateColorPalette } from '../utils/colorUtils';
import type { Color } from '../types/color';

// Store
const colorStore = useColorsStore();

// Modal states
const isAddModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isEditing = ref(false);
const colorToDelete = ref('');

// Form data
const baseColorHex = ref('#3B82F6'); // Default blue
const newColor = reactive<Color>({
  name: '',
  values: {
    '50': '',
    '100': '',
    '200': '',
    '300': '',
    '400': '',
    '500': '',
    '600': '',
    '700': '',
    '800': '',
    '900': '',
    '950': '',
  }
});

// Preview palette based on selected base color
const previewPalette = computed(() => {
  if (!baseColorHex.value || !isValidHexColor(baseColorHex.value)) {
    return {};
  }
  
  return generateColorPalette(baseColorHex.value);
});

// Form validation
const isFormValid = computed(() => {
  return (
    newColor.name.trim() !== '' &&
    baseColorHex.value &&
    isValidHexColor(baseColorHex.value)
  );
});

// Check if string is valid hex color
function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

// Reset form
function resetForm() {
  newColor.name = '';
  baseColorHex.value = '#3B82F6';
  isEditing.value = false;
}

// Edit color
function editColor(color: Color) {
  isEditing.value = true;
  newColor.name = color.name;
  baseColorHex.value = color.values[500];
  isAddModalOpen.value = true;
}

// Save color (add or update)
function saveColor() {
  if (!isFormValid.value) return;
  
  // Generate color palette from base color
  const palette = generateColorPalette(baseColorHex.value);
  
  // Create color object
  const colorData: Color = {
    name: newColor.name,
    values: palette as any // Type assertion needed due to string index vs numeric index
  };
  
  try {
    if (isEditing.value) {
      colorStore.updateColor(colorData);
    } else {
      colorStore.addColor(colorData);
    }
    
    // Close modal and reset form
    isAddModalOpen.value = false;
    resetForm();
  } catch (error) {
    // Handle error (e.g., duplicate name)
    alert(`Fehler: ${(error as Error).message}`);
  }
}

// Confirm delete
function confirmDelete(name: string) {
  colorToDelete.value = name;
  isDeleteModalOpen.value = true;
}

// Delete color
function deleteColor() {
  if (!colorToDelete.value) return;
  
  try {
    colorStore.deleteColor(colorToDelete.value);
    isDeleteModalOpen.value = false;
    colorToDelete.value = '';
  } catch (error) {
    alert(`Fehler: ${(error as Error).message}`);
  }
}
</script>

<style scoped>
.color-listing {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
