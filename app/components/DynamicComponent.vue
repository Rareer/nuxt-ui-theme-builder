<script setup lang="ts">
import { h, resolveComponent, defineComponent, onMounted, watch } from 'vue'
import { useComponentUiConfigStore } from '@/store/componentUiConfig'
import { useUiClasses } from '@/composables/useUiClasses'

type DocsProp = { name: string; type: 'boolean' | 'string' | string[] | unknown };

const props = defineProps<{ component: string }>();

const { availableComponentConfigs } = useComponentPreviewConfig();

// Find docs props for current component
const currentConfig = computed(() =>
  availableComponentConfigs.find(c => c.value === props.component)
);

const docsProps = computed<DocsProp[]>(() => currentConfig.value?.props || []);
// Exclude 'ui' once and reuse
const filteredDocsProps = computed<DocsProp[]>(() => docsProps.value.filter(p => p.name !== 'ui'))

// Config tabs based on overrides
const configPropNames = computed<string[]>(() => currentConfig.value?.configProps || [])
const optionsByProp = computed<Record<string, string[]>>(() => {
  const map: Record<string, string[]> = {}
  for (const name of configPropNames.value) {
    const prop = docsProps.value.find(p => p.name.toLowerCase() === name.toLowerCase())
    map[name] = prop ? extractOptions(prop.type) : []
  }
  return map
})
// Available UI slots for this component
const uiSlots = computed<string[]>(() => {
  const uiProp = docsProps.value.find(p => p.name === 'ui')
  return uiProp ? extractOptions(uiProp.type) : []
})
// Pinia store for Combobox-driven UI config
const uiStore = useComponentUiConfigStore()

// v-model helper backed by the store
const uiModel = (propName: string, opt: string, slot: string) => computed<string[]>({
  get() {
    uiStore.ensurePath(props.component, propName, opt, slot)
    return uiStore.getClasses(props.component, propName, opt, slot)
  },
  set(v: string[]) {
    uiStore.setClasses(props.component, propName, opt, slot, v)
  }
})

// v-model helper for component-wide default classes per slot
const defaultUiModel = (slot: string) => computed<string[]>({
  get() {
    uiStore.ensureDefaultSlot(props.component, slot)
    return uiStore.getDefaultClasses(props.component, slot)
  },
  set(v: string[]) {
    uiStore.setDefaultClasses(props.component, slot, v)
  }
})

// Ensure store paths exist for all prop/option/slot combinations
watchEffect(() => {
  for (const propName of configPropNames.value) {
    const opts = optionsByProp.value[propName] || []
    for (const opt of opts) {
      for (const slot of uiSlots.value) {
        uiStore.ensurePath(props.component, propName, opt, slot)
      }
    }
  }
  // Ensure defaults exist for each slot regardless of configProps
  for (const slot of uiSlots.value) {
    uiStore.ensureDefaultSlot(props.component, slot)
  }
})

// Persistence lifecycle
onMounted(() => {
  uiStore.loadFromLocalStorage()
})

watch(() => uiStore.byComponent, () => uiStore.saveToLocalStorage(), { deep: true })

// Exclude 'ui' from all configurator lists
const booleanPropsAll = computed(() => filteredDocsProps.value.filter(p => p.type === 'boolean'));

function extractOptions(t: DocsProp['type']): string[] {
  // Already array of options
  if (Array.isArray(t)) return t as string[];
  // Union type expressed as string: "'solid' | 'outline' | 'soft'"
  if (typeof t === 'string' && t.includes('|')) {
    return t
      .split('|')
      .map(s => s.trim().replace(/^'+|"+|'+$|"+$/g, '').replace(/^'|"|`|\{|\}|\(|\)/g, '').replace(/'|"|`/g, ''))
      .filter(Boolean);
  }
  // Enum-like object: { options: [...] } or { enum: [...] } or { values: [...] }
  if (t && typeof t === 'object') {
    const anyT = t as any;
    const arr = anyT.options || anyT.enum || anyT.values;
    if (Array.isArray(arr)) return arr as string[];
  }
  return [];
}

const optionPropsAll = computed(() => filteredDocsProps.value
  .map(p => ({ name: p.name, type: extractOptions(p.type) }))
  .filter(p => Array.isArray(p.type) && (p.type as string[]).length) as { name: string; type: string[] }[]);

const stringPropsAll = computed(() => filteredDocsProps.value.filter(p => p.type === 'string'));

// Preview configuration from overrides
const previewPropName = computed(() => currentConfig.value?.previewProp);
const previewPropLower = computed(() => (previewPropName.value || '').toLowerCase())
const previewPropOptions = computed<string[]>(() => {
  const name = previewPropName.value?.toLowerCase();
  if (!name) return [];
  // look up in all docs props to allow extraction beyond simple arrays
  const prop = docsProps.value.find(p => p.name.toLowerCase() === name);
  if (!prop) return [];
  return extractOptions(prop.type);
});

// Slots content from overrides (string-only handling)
const slotsContent = computed<Record<string, string>>(() => currentConfig.value?.slots || {});

// Optional top-level child spec to be rendered into the default slot
const childSpec = computed<any | undefined>(() => (currentConfig.value as any)?.child)
const childModelCfg = computed<{ value: any; prop?: string; event?: string } | undefined>(() => (currentConfig.value as any)?.childModel)
const childModelValue = ref<any>()

watchEffect(() => {
  if (childModelCfg.value) {
    childModelValue.value = childModelCfg.value.value
  } else {
    childModelValue.value = undefined
  }
})

function renderChild(spec: any) {
  if (typeof spec === 'function') return spec
  if (spec && typeof spec === 'object' && (spec.is || spec.component)) {
    return () => {
      const name = spec.is || spec.component
      const comp = typeof name === 'string' ? resolveComponent(name) : name
      const children = spec.children
      // merge props with optional v-model-like binding
      const propsMerged: Record<string, any> = { ...(spec.props || {}) }
      if (childModelCfg.value) {
        const propName = childModelCfg.value.prop || 'modelValue'
        const customEvent = childModelCfg.value.event?.trim()
        // Map event name to Vue listener key
        let eventKey: string
        if (!customEvent) {
          eventKey = `onUpdate:${propName}`
        } else {
          const ce = customEvent as string
          if (!ce || ce.length === 0) {
            eventKey = 'onChange'
          } else if (ce.startsWith('update:')) {
            // Special-case update:foo -> onUpdate:foo
            eventKey = `onUpdate:${ce.slice('update:'.length)}`
          } else {
            // e.g., 'change' -> 'onChange'
            eventKey = `on${ce[0].toUpperCase()}${ce.slice(1)}`
          }
        }
        propsMerged[propName] = childModelValue.value
        propsMerged[eventKey] = (v: any) => { childModelValue.value = v }
      }
      if (Array.isArray(children)) return h(comp as any, propsMerged, children)
      if (typeof children === 'function') return h(comp as any, propsMerged, children)
      if (children != null) return h(comp as any, propsMerged, () => children)
      return h(comp as any, propsMerged)
    }
  }
  return () => spec
}

// No renderedSlots needed; we render named slots via <template v-for> and child directly

// Lightweight helper component to render a VNode-producing function as default content
const RenderFn = defineComponent<{ render: () => any }>({
  name: 'RenderFn',
  props: {
    render: { type: Function as unknown as () => () => any, required: true },
  },
  setup(props) {
    return () => props.render()
  },
})

const renderedChildFn = computed<(() => any) | null>(() => {
  if (childSpec.value === undefined) return null
  return renderChild(childSpec.value)
})

// Exclude previewProp from top controls
const booleanProps = computed(() => booleanPropsAll.value.filter(p => p.name.toLowerCase() !== previewPropLower.value));
const optionProps = computed(() => optionPropsAll.value.filter(p => p.name.toLowerCase() !== previewPropLower.value));
const stringProps = computed(() => stringPropsAll.value.filter(p => p.name.toLowerCase() !== previewPropLower.value));

// Bound props state
const bound = reactive<Record<string, any>>({});

// Build merged ui object from defaults + selected options
const uiObject = useUiClasses({
  component: computed(() => props.component),
  configPropNames,
  uiSlots,
  getPropValue: (propName: string) => bound[propName] as string | undefined,
})

// Initialize defaults in a single ordered pass: preset -> booleans -> options
watchEffect(() => {
  // Preset from overrides (does not overwrite user changes)
  const preset = currentConfig.value?.preset || {};
  for (const key in preset) {
    if (!(key in bound)) bound[key] = preset[key];
  }

  // Boolean defaults
  for (const p of booleanProps.value) {
    if (!(p.name in bound)) bound[p.name] = false;
  }

  // Option (select) defaults
  for (const p of optionProps.value) {
    const options = Array.isArray(p.type) ? (p.type as string[]) : [];
    if (options.length && !(p.name in bound)) {
      bound[p.name] = options[0];
    }
  }
});

// (Removed duplicate preset initializer)
</script>

<template>   
    <div v-if="booleanProps.length || optionProps.length || stringProps.length" class="flex-1 w-full">
        <div class="flex flex-wrap items-center gap-6 mb-4">
        <UFormField v-for="p in booleanProps" :key="p.name" :label="p.name">
            <USwitch v-model="bound[p.name]" />
        </UFormField>
        </div>

        <div class="flex flex-wrap items-center gap-6 mb-4">
        <UFormField v-for="p in optionProps" :key="p.name" :label="p.name">
            <USelect class="block w-full" :items="(p.type as string[]).map(v => ({ label: v, value: v }))" v-model="bound[p.name]" />
        </UFormField>
        </div>

        <div class="flex flex-wrap items-center gap-6 mb-4">
        <UFormField v-for="p in stringProps" :key="p.name" :label="p.name">
            <UInput v-model="bound[p.name]" />
        </UFormField>
        </div>
    </div>
    <USeparator class="my-6" v-if="previewPropOptions.length"/>
    <div class="flex-1 w-full">
        <h2 class="text-lg font-semibold my-8">Preview</h2>
        <template v-if="previewPropOptions.length">
          <div class="flex flex-wrap gap-8">
            <UFormField v-for="opt in previewPropOptions" :key="opt" class="space-y-2" :label="opt">
              <component :is="props.component" :key="opt" v-bind="{ ...bound, [previewPropName as string]: opt }" :ui="uiObject">
                <RenderFn v-if="renderedChildFn" :render="renderedChildFn" />
                <template v-for="(content, slotName) in slotsContent" :key="slotName" v-slot:[slotName]>
                  {{ content }}
                </template>
              </component>
            </UFormField>
          </div>
        </template>
        <template v-else>
          <component :is="props.component" v-bind="bound" :ui="uiObject">
            <RenderFn v-if="renderedChildFn" :render="renderedChildFn" />
            <template v-for="(content, slotName) in slotsContent" :key="slotName" v-slot:[slotName]>
              {{ content }}
            </template>
          </component>
        </template>
    </div>
    {{ uiObject }}
    <USeparator class="my-6"/>
    <!-- Default classes per UI slot (component-wide) -->
    <h2 class="text-lg font-semibold my-8">Config</h2>
    <UCollapsible v-if="uiSlots.length">
      <UButton label="Default" block variant="soft" color="neutral" trailing-icon="i-lucide-chevron-down" />
      <template #content>
        <div class="flex flex-col gap-2 py-2">
          <UFormField v-for="slotName in uiSlots" :key="slotName" :label="slotName">
            <Combobox v-model="defaultUiModel(slotName).value" />
          </UFormField>
        </div>
      </template>
    </UCollapsible>

    <!-- Config tabs for configProps: per option -> Combobox per ui slot -->
    <UTabs v-if="configPropNames.length && uiSlots.length" color="neutral" :items="configPropNames.map(n => ({ label: n }))" class="my-6">
      <!-- @vue-ignore: Volar types for UTabs slot context are not inferred -->
      <template #content="{ item }">
        <div class="space-y-6">
          <div v-for="opt in (optionsByProp[(item as any).label] || [])" :key="opt" class="space-y-3">
            <!-- @vue-ignore -->
             <UCollapsible>
                <UButton :label="opt" block variant="soft" color="neutral" trailing-icon="i-lucide-chevron-down" />
                <template #content>
                    <div class="flex flex-col gap-2 py-2">
                        <UFormField v-for="slotName in uiSlots" :key="slotName" :label="slotName">
                            <Combobox v-model="uiModel((item as any).label, opt, slotName).value" />
                        </UFormField>
                    </div>
                </template>
             </UCollapsible>
          </div>
        </div>
      </template>
    </UTabs>
</template>