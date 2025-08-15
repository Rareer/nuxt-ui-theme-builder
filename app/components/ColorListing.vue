<script setup lang="ts">
import { z } from 'zod';
import { useColorsStore } from '../store/colors';
import type { Color } from '../types/color';

// i18n
const { t } = useI18n();

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
		50: '',
		100: '',
		200: '',
		300: '',
		400: '',
		500: '',
		600: '',
		700: '',
		800: '',
		900: '',
		950: '',
	},
});

// Zod schema for color name: only letters and hyphen
const nameSchema = z.string().min(1).regex(/^[A-Z-]+$/i);

const isNameValid = computed(() => nameSchema.safeParse(newColor.name.trim()).success);
const nameError = computed(() => {
	if (newColor.name.trim() === '') return '';
	return isNameValid.value ? '' : t('colorListing.nameInvalid');
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
		newColor.name.trim() !== ''
		&& isNameValid.value
		&& baseColorHex.value
		&& isValidHexColor(baseColorHex.value)
	);
});

// Check if string is valid hex color
function isValidHexColor(hex: string): boolean {
	return /^#([A-F0-9]{6}|[A-F0-9]{3})$/i.test(hex);
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
		values: palette as any, // Type assertion needed due to string index vs numeric index
	};

	try {
		if (isEditing.value) {
			colorStore.updateColor(colorData);
		}
		else {
			colorStore.addColor(colorData);
		}

		// Close modal and reset form
		isAddModalOpen.value = false;
		resetForm();
	}
	catch (error) {
		// Handle error (e.g., duplicate name)
		alert(`${t('colorListing.errorPrefix')}: ${(error as Error).message}`);
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
	}
	catch (error) {
		alert(`${t('colorListing.errorPrefix')}: ${(error as Error).message}`);
	}
}
</script>

<template>
	<div class="color-listing">
		<div class="flex justify-end items-center mb-6">
			<UButton
				icon="i-heroicons-plus"
				color="primary"
				@click="isAddModalOpen = true"
			>
				{{ $t('colorListing.addColor') }}
			</UButton>
		</div>

		<!-- Color List -->
		<div
			v-if="colorStore.getColors.length > 0"
			class="space-y-4"
		>
			<div
				v-for="color in colorStore.getColors"
				:key="color.name"
				class="color-item flex items-center justify-between p-4 ring ring-gray-200 rounded-lg shadow-sm"
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
						/>
					</div>

					<!-- Color Name -->
					<div>
						<h3 class="font-medium">
							{{ color.name }}
						</h3>
						<p class="text-xs text-gray-500">
							{{ color.values[500] }}
						</p>
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
		<div
			v-else
			class="text-center py-10 ring ring-gray-200 rounded-lg"
		>
			<UIcon
				name="i-heroicons-swatch"
				class="text-4xl text-gray-400 mx-auto mb-2"
			/>
			<p class="text-gray-500">
				{{ $t('colorListing.emptyTitle') }}
			</p>
			<UButton
				class="mt-4"
				color="primary"
				@click="isAddModalOpen = true"
			>
				{{ $t('colorListing.emptyCta') }}
			</UButton>
		</div>

		<!-- Add/Edit Color Modal -->
		<UModal
			v-model:open="isAddModalOpen"
			:title="isEditing ? $t('colorListing.modalEditTitle') : $t('colorListing.modalAddTitle')"
			class="sm:max-w-md"
		>
			<!-- Modal trigger is not needed here as we're controlling it programmatically -->
			<template #body>
				<div class="space-y-4 p-4">
					<!-- Color Name -->
					<UFormField
						:label="$t('colorListing.nameLabel')"
						required
					>
						<UInput
							v-model="newColor.name"
							:placeholder="$t('colorListing.namePlaceholder')"
							:disabled="isEditing"
						/>
						<p
							v-if="nameError"
							class="text-xs text-red-600 mt-1"
						>
							{{ nameError }}
						</p>
					</UFormField>
					<div class="flex flex-col gap-2">
						<UColorPicker v-model="baseColorHex" />
						<UInput
							v-model="baseColorHex"
							placeholder="#000000"
							class="flex-1"
						/>
					</div>
					<!-- Preview Generated Colors -->
					<div
						v-if="baseColorHex"
						class="mt-4"
					>
						<p class="text-sm font-medium mb-2">
							{{ $t('colorListing.palettePreview') }}
						</p>
						<div class="flex gap-1 h-10 w-full">
							<div
								v-for="(color, shade) in previewPalette"
								:key="shade"
								:style="{ backgroundColor: color }"
								class="flex-1 first:rounded-l-md last:rounded-r-md"
								:title="`${shade}: ${color}`"
							/>
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
						{{ $t('actions.cancel') }}
					</UButton>
					<UButton
						color="primary"
						:disabled="!isFormValid"
						@click="saveColor"
					>
						{{ isEditing ? $t('colorListing.update') : $t('colorListing.add') }}
					</UButton>
				</div>
			</template>
		</UModal>

		<!-- Delete Confirmation Modal -->
		<UModal
			v-model:open="isDeleteModalOpen"
			:title="$t('colorListing.deleteTitle')"
		>
			<!-- Modal trigger is not needed here as we're controlling it programmatically -->
			<template #body>
				<div class="p-4">
					<p>
						{{ $t('colorListing.deleteConfirm', { name: colorToDelete }) }}
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
						{{ $t('actions.cancel') }}
					</UButton>
					<UButton
						color="error"
						@click="deleteColor"
					>
						{{ $t('actions.delete') }}
					</UButton>
				</div>
			</template>
		</UModal>
	</div>
</template>

<style scoped>
.color-listing {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
