<script setup lang="ts">
import { fa } from 'zod/v4/locales';

const props = defineProps<{
	modelValue: string[];
}>();

const emit = defineEmits(['update:modelValue']);
const { getAllClasses } = useTailwindClasses();
const currentInput = ref('');
const label = ref('');
const suggestions = computed(() => getAllClasses().map(s => ({ label: s.value })));

const selectSuggestion = (s: string | undefined) => {
	const input = s?.trim();
	if (!input) return;
	emit('update:modelValue', [...props.modelValue || [], input]);
	currentInput.value = '';
	label.value = '';
};
const removeItem = (s: string) => {
	emit('update:modelValue', props.modelValue?.filter(item => item !== s));
};

const updateSearchTerm = (val: string) => {
	currentInput.value = val;
};
</script>

<template>
	<div class="relative w-full">
		<div
			v-if="props.modelValue"
			class="flex gap-2 mb-2"
		>
			<UBadge
				v-for="s in props.modelValue"
				:key="s"
				:label="s"
				variant="soft"
				class="cursor-pointer"
				title="Remove"
				color="secondary"
				@click="removeItem(s)"
			/>
		</div>
		<UPopover
			:open-on-click="true"
			:open-on-hover="false"
			:content="{ side: 'bottom', align: 'start' }"
		>
			<UButton
				icon="i-lucide-plus"
				color="primary"
				variant="soft"
				size="xs"
				label="Add class"
			/>

			<template #content>
				<div
					class="w-72 max-w-full"
					@keydown.enter.stop.prevent="selectSuggestion(currentInput)"
					@keydown.space.stop.prevent="selectSuggestion(currentInput)"
				>
					<UCommandPalette
						v-model="label"
						placeholder="Search or type class..."
						:groups="[{ id: 'labels', items: suggestions }]"
						:search-term="currentInput"
						:multiple="false"
						:ui="{ input: '[&>input]:h-8 [&>input]:text-sm', content: 'max-h-[100px] overflow-y-auto' }"
						@update:search-term="updateSearchTerm($event)"
						@submit="selectSuggestion(currentInput)"
					>
						<template #empty>
							<div class="p-4 text-center text-sm text-gray-500">
								Type your custom class and press Enter or click Add.
							</div>
						</template>
						<template #item="{ item }">
							<UButton
								block
								class="justify-start"
								color="neutral"
								variant="link"
								size="xs"
								@click="selectSuggestion(item.label)"
							>
								{{ item.label }}
							</UButton>
						</template>
					</UCommandPalette>

					<div class="mt-2 flex justify-end">
						<UButton
							icon="i-lucide-check"
							size="sm"
							color="neutral"
							variant="soft"
							:disabled="!currentInput?.trim()"
							@click="selectSuggestion(currentInput)"
						>
						</UButton>
					</div>
				</div>
			</template>
		</UPopover>
	</div>
</template>
