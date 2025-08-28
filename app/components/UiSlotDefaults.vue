<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
  uiSlots: { type: Array as PropType<string[]>, required: true },
  hasAnyDefault: { type: Boolean, required: true },
  resetDefault: { type: Function as PropType<() => void>, required: true },
  defaultUiModel: { type: Function as PropType<(slot: string) => { value: string[] }>, required: true },
});
</script>

<template>
  <h2 class="text-lg font-semibold my-8">Component Config</h2>
  <UCollapsible v-if="props.uiSlots.length">
    <div class="flex items-center gap-2">
      <UButton
        label="Default"
        class="flex-1"
        variant="soft"
        :color="props.hasAnyDefault ? 'primary' : 'neutral'"
        :leading-icon="props.hasAnyDefault ? 'i-lucide-dot' : undefined"
        trailing-icon="i-lucide-chevron-down"
      />
      <UButton
        v-if="props.hasAnyDefault"
        variant="ghost"
        color="neutral"
        size="xs"
        icon="i-lucide-rotate-ccw"
        @click.stop="props.resetDefault()"
      />
    </div>
    <template #content>
      <div class="flex flex-col gap-2 py-2">
        <UFormField v-for="slotName in props.uiSlots" :key="slotName" :label="slotName">
          <Combobox v-model="props.defaultUiModel(slotName).value" />
        </UFormField>
      </div>
    </template>
  </UCollapsible>
</template>
