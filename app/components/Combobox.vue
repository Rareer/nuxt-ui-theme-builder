<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps({
	modelValue: Array<string>,
});

const emit = defineEmits(['update:modelValue']);
const { getFormattedClasses } = useTailwindClasses();
const currentInput = ref('');

const suggestions = computed(() => getFormattedClasses().map(s => s.value));

const filtered = computed(() =>
	suggestions.value.filter(s =>
		s.toLowerCase().includes(currentInput.value.toLowerCase()),
	),
);

const selectSuggestion = (s: string) => {
	const input = s.trim();
	if (!input) return;
	emit('update:modelValue', [...props.modelValue || [], input]);
	currentInput.value = '';
};

const removeItem = (s: string) => {
	emit('update:modelValue', props.modelValue?.filter(item => item !== s));
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
		<UInput
			v-model="currentInput"
			type="text"
			placeholder="Type a tailwind class ..."
			class="w-full rounded"
			@keyup.enter="selectSuggestion(currentInput)"
			@keydown.space="selectSuggestion(currentInput)"
		/>

		<ul
			v-if="currentInput && filtered.length"
			class="absolute z-10 bg-white border border-gray-200 dark:border-gray-800 w-full mt-1 rounded-md shadow-lg max-h-64 overflow-y-scroll"
		>
			<li
				v-for="s in filtered"
				:key="s"
				class="px-3 py-1 hover:bg-gray-100 cursor-pointer"
				@click="selectSuggestion(s)"
			>
				{{ s }}
			</li>
		</ul>
	</div>
</template>
