<script setup lang="ts">
type DocsProp = { name: string; type: 'boolean' | 'string' | string[] | unknown };

const props = defineProps<{ component: string }>();

const { availableComponentConfigs } = useComponentPreviewConfig();

// Find docs props for current component
const currentConfig = computed(() =>
  availableComponentConfigs.find(c => c.value === props.component)
);

const docsProps = computed<DocsProp[]>(() => currentConfig.value?.props || []);

const booleanProps = computed(() => docsProps.value.filter(p => p.type === 'boolean'));
const optionProps = computed(() => docsProps.value.filter(p => Array.isArray(p.type)) as {name: string; type: string[]}[]);
const stringProps = computed(() => docsProps.value.filter(p => p.type === 'string'));

// Bound props state
const bound = reactive<Record<string, any>>({});

// Initialize defaults for boolean props
watchEffect(() => {
  for (const p of booleanProps.value) {
    if (!(p.name in bound)) bound[p.name] = false;
  }
});

// Initialize option (select) props to their first entry if unset
watchEffect(() => {
  for (const p of optionProps.value) {
    const options = Array.isArray(p.type) ? (p.type as string[]) : [];
    if (options.length && !(p.name in bound)) {
      bound[p.name] = options[0];
    }
  }
});
</script>

<template>
  <div class="flex flex-col gap-6">
    
    <div class="space-y-4 flex flex-wrap gap-4">
      <div v-if="booleanProps.length === 0 && optionProps.length === 0 && stringProps.length === 0" class="text-sm text-gray-500">No configurable props from docs.</div>

      <div v-for="p in booleanProps" :key="p.name" class="flex items-center justify-between gap-4 py-2">
        <div class="min-w-0">
          <label class="block text-sm font-medium">{{ p.name }}</label>
        </div>
        <USwitch v-model="bound[p.name]" />
      </div>

      <div v-for="p in optionProps" :key="p.name" class="space-y-1">
        <label class="block text-sm font-medium">{{ p.name }}</label>
        <USelect class="block w-full" :items="(p.type as string[]).map(v => ({ label: v, value: v }))" v-model="bound[p.name]" />
      </div>

      <div v-for="p in stringProps" :key="p.name" class="space-y-1">
        <label class="block text-sm font-medium">{{ p.name }}</label>
        <UInput v-model="bound[p.name]" />
      </div>
    </div>
    <div class="lg:col-span-2">
      <component :is="props.component" v-bind="bound" />
    </div>
  </div>
</template>