<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
  configPropNames: { type: Array as PropType<string[]>, required: true },
  uiSlots: { type: Array as PropType<string[]>, required: true },
  optionsByProp: { type: Object as PropType<Record<string, string[]>>, required: true },
  hasAnyForOption: { type: Function as PropType<(propName: string, opt: string) => boolean>, required: true },
  resetOption: { type: Function as PropType<(propName: string, opt: string) => void>, required: true },
  uiModel: { type: Function as PropType<(propName: string, opt: string, slot: string) => { value: string[] }>, required: true },
});
</script>

<template>
  <UTabs
    v-if="props.configPropNames.length && props.uiSlots.length"
    color="neutral"
    :items="props.configPropNames.map(n => ({ label: n }))"
    class="my-6"
  >
    <!-- @vue-ignore: Volar types for UTabs slot context are not inferred -->
    <template #content="{ item }">
      <div class="space-y-6">
        <div v-for="opt in (props.optionsByProp[(item as any).label] || [])" :key="opt" class="space-y-3">
          <!-- @vue-ignore -->
          <UCollapsible>
            <div class="flex items-center gap-2">
              <UButton
                :label="opt"
                class="flex-1"
                variant="soft"
                :color="props.hasAnyForOption((item as any).label, opt) ? 'primary' : 'neutral'"
                :leading-icon="props.hasAnyForOption((item as any).label, opt) ? 'i-lucide-sparkles' : undefined"
                trailing-icon="i-lucide-chevron-down"
              />
              <UButton
                v-if="props.hasAnyForOption((item as any).label, opt)"
                variant="ghost"
                color="neutral"
                size="xs"
                icon="i-lucide-rotate-ccw"
                @click.stop="props.resetOption((item as any).label, opt)"
              />
            </div>
            <template #content>
              <div class="flex flex-col gap-2 py-2">
                <UFormField v-for="slotName in props.uiSlots" :key="slotName" :label="slotName">
                  <Combobox v-model="props.uiModel((item as any).label, opt, slotName).value" />
                </UFormField>
              </div>
            </template>
          </UCollapsible>
        </div>
      </div>
    </template>
  </UTabs>
</template>
