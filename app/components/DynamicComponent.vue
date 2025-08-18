<script setup lang="ts">
import { h, resolveComponent, defineComponent } from 'vue'
type DocsProp = { name: string; type: 'boolean' | 'string' | string[] | unknown };

const props = defineProps<{ component: string }>();

const { availableComponentConfigs } = useComponentPreviewConfig();

// Find docs props for current component
const currentConfig = computed(() =>
  availableComponentConfigs.find(c => c.value === props.component)
);

const docsProps = computed<DocsProp[]>(() => currentConfig.value?.props || []);

// Exclude 'ui' from all configurator lists
const booleanPropsAll = computed(() => docsProps.value.filter(p => p.name !== 'ui' && p.type === 'boolean'));

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

const optionPropsAll = computed(() => docsProps.value
  .filter(p => p.name !== 'ui')
  .map(p => ({ name: p.name, type: extractOptions(p.type) }))
  .filter(p => Array.isArray(p.type) && (p.type as string[]).length) as { name: string; type: string[] }[]);

const stringPropsAll = computed(() => docsProps.value.filter(p => p.name !== 'ui' && p.type === 'string'));

// Preview configuration from overrides
const previewPropName = computed(() => currentConfig.value?.previewProp);
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
        if (customEvent) {
          const ce = customEvent as string
          if (ce.includes(':')) {
            // e.g., 'update:foo' -> 'onUpdate:foo'
            const up = `on${ce[0].toUpperCase()}${ce.slice(1)}`
            eventKey = up.replace('OnUpdate:', 'onUpdate:')
          } else {
            // e.g., 'change' -> 'onChange'
            eventKey = `on${ce[0].toUpperCase()}${ce.slice(1)}`
          }
        } else {
          eventKey = `onUpdate:${propName}`
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
const booleanProps = computed(() => booleanPropsAll.value.filter(p => p.name.toLowerCase() !== (previewPropName.value || '').toLowerCase()));
const optionProps = computed(() => optionPropsAll.value.filter(p => p.name.toLowerCase() !== (previewPropName.value || '').toLowerCase()));
const stringProps = computed(() => stringPropsAll.value.filter(p => p.name.toLowerCase() !== (previewPropName.value || '').toLowerCase()));

// Bound props state
const bound = reactive<Record<string, any>>({});

// Initialize preset defaults from overrides (run BEFORE defaults)
watchEffect(() => {
  const preset = currentConfig.value?.preset || {};
  for (const key in preset) {
    if (!(key in bound)) bound[key] = preset[key];
  }
});

// Initialize defaults for boolean props (only if not set by preset)
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

// (Removed duplicate preset initializer)
</script>

<template>   
    <div v-if="booleanProps.length || optionProps.length || stringProps.length"class="flex-1 w-full">
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
              <component :is="props.component" :key="opt" v-bind="{ ...bound, [previewPropName as string]: opt }">
                <RenderFn v-if="renderedChildFn" :render="renderedChildFn" />
                <template v-for="(content, slotName) in slotsContent" :key="slotName" v-slot:[slotName]>
                  {{ content }}
                </template>
              </component>
            </UFormField>
          </div>
        </template>
        <template v-else>
          <component :is="props.component" v-bind="bound">
            <RenderFn v-if="renderedChildFn" :render="renderedChildFn" />
            <template v-for="(content, slotName) in slotsContent" :key="slotName" v-slot:[slotName]>
              {{ content }}
            </template>
          </component>
        </template>
    </div>
    <USeparator class="my-6"/>
</template>