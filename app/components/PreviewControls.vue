<script setup lang="ts">
import type { PropType } from 'vue';

const props = defineProps({
  booleanProps: { type: Array as PropType<Array<{ name: string }>>, required: true },
  optionProps: { type: Array as PropType<Array<{ name: string; type: string[] }>>, required: true },
  stringProps: { type: Array as PropType<Array<{ name: string }>>, required: true },
  bound: { type: Object as PropType<Record<string, any>>, required: true },
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-6">
      <UFormField v-for="p in props.booleanProps" :key="p.name" :label="p.name">
        <USwitch v-model="props.bound[p.name]" />
      </UFormField>
    </div>

    <div class="flex flex-wrap items-center gap-6">
      <UFormField v-for="p in props.optionProps" :key="p.name" :label="p.name">
        <USelect
          v-model="props.bound[p.name]"
          class="block w-full"
          :items="(p.type as string[]).map(v => ({ label: v, value: v }))"
        />
      </UFormField>
    </div>

    <div class="flex flex-wrap items-center gap-6">
      <UFormField v-for="p in props.stringProps" :key="p.name" :label="p.name">
        <UInput v-model="props.bound[p.name]" />
      </UFormField>
    </div>
  </div>
</template>
