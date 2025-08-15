<template>
	<div class="ring ring-gray-200 rounded-lg p-4 space-y-3">
		<div class="flex items-center justify-between">
			<h4 class="font-medium">
				{{ variable.label }}
			</h4>
			<UBadge color="neutral">
				--{{ variable.name }}
			</UBadge>
		</div>

		<div class="space-y-3">
			<URadioGroup
				v-model="local.type"
				:items="typeItems"
				@update:model-value="emitUpdate"
			/>

			<div
				v-if="local.type === 'color-reference'"
				class="mt-2"
			>
				<UFormField>
					<USelect
						v-model="local.selectedColor"
						:items="colorOptions"
						placeholder="Farbe auswählen"
						class="w-full"
						@update:model-value="onSelectedColor"
					/>
				</UFormField>

				<div
					v-if="local.selectedColor"
					class="mt-3"
				>
					<div class="text-xs text-neutral-500 mb-1">
						Shade auswählen:
					</div>
					<div class="flex flex-wrap gap-1">
						<div
							v-for="shade in shades"
							:key="shade"
							class="w-6 h-6 rounded-sm cursor-pointer transition-all hover:scale-110"
							:class="{ 'ring-2 ring-primary-500': isSelectedShade(shade) }"
							:style="{ backgroundColor: getColorShade(local.selectedColor, shade) }"
							:title="`${shade}: ${getColorShade(local.selectedColor, shade)}`"
							@click="selectShade(shade)"
						/>
					</div>
				</div>

				<div
					v-if="local.value"
					class="mt-2 flex items-center gap-2"
				>
					<div
						class="w-6 h-6 rounded-sm"
						:style="{ backgroundColor: getColorFromReference(local.value) }"
					/>
					<span class="text-xs">{{ getColorFromReference(local.value) }}</span>
				</div>
			</div>

			<div
				v-else
				class="mt-2"
			>
				<UFormField>
					<UInput
						v-model="local.value"
						type="text"
						class="w-full"
						placeholder="CSS-Wert eingeben (z.B. #ffffff)"
						@update:model-value="emitUpdate"
					>
						<template #trailing>
							<div
								class="w-5 h-5 rounded-sm"
								:style="{ backgroundColor: local.value }"
							/>
						</template>
					</UInput>
				</UFormField>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import type { CssVariableMapping, CssVariableType } from '../store/theme';

const props = defineProps<{ variable: CssVariableMapping }>();
const emit = defineEmits<{ (e: 'update', value: CssVariableMapping): void }>();

const { shades, colorOptions, getColorShade, getColorFromReference } = useColorUtils();

const typeItems = computed(() => ([
	{ label: 'Farbreferenz', value: 'color-reference' },
	{ label: 'Direkter Wert', value: 'direct-value' },
]));

// local reactive copy to avoid mutating props directly
const local = reactive<{
	name: string;
	label: string;
	type: CssVariableType;
	value: string;
	selectedColor?: string;
}>({
	name: props.variable.name,
	label: props.variable.label,
	type: props.variable.type,
	value: props.variable.value,
	selectedColor: (props.variable as any).selectedColor,
});

watch(() => props.variable, (v) => {
	local.name = v.name;
	local.label = v.label;
	local.type = v.type;
	local.value = v.value
	;(local as any).selectedColor = (v as any).selectedColor;
}, { deep: true });

function emitUpdate() {
	emit('update', { ...props.variable, type: local.type, value: local.value });
}

function onSelectedColor() {
	if (local.selectedColor) {
		selectShade('500');
	}
	else {
		local.value = '';
		emitUpdate();
	}
}

function selectShade(shade: string) {
	if (!local.selectedColor) return;
	const colorName = normalizeColorName(local.selectedColor);
	local.value = `${colorName}-${shade}`;
	emitUpdate();
}

function isSelectedShade(shade: string): boolean {
	if (!local.value || !local.selectedColor) return false;
	const [, selectedShade] = local.value.split('-');
	return selectedShade === shade;
}
</script>
