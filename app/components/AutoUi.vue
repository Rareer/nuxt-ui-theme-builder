<script setup lang="ts">
import { computed, cloneVNode, useSlots, type VNode } from 'vue';
import RenderFn from '@/components/RenderFn.vue';
import { buildUiObject } from '@/composables/useUiClasses';
import { useComponentUiConfigStore } from '@/store/componentUiConfig';

const props = withDefaults(defineProps<{
  component?: string;
  selections?: Record<string, string | undefined>;
  slots?: string[];
}>(), {});

const slotsApi = useSlots();
const store = useComponentUiConfigStore();

// Cache to keep VNode identity stable across renders unless inputs change
let cachedSource: VNode | null = null;
let cachedUi: Record<string, any> | null = null;
let cachedCloned: VNode | null = null;

// Some components (overlays/teleports) are sensitive to wrapper boundaries.
// Do not clone/wrap them to avoid breaking positioning or model bindings.
const SKIP_COMPONENTS = new Set([
  'UModal',
  'UTooltip',
  'UPopover',
  'UDropdownMenu',
]);

function inferChild(): VNode | undefined {
  const list = slotsApi.default?.() || [];
  // pick first non-empty vnode
  return list.find(v => !!v) as VNode | undefined;
}

function inferComponentName(vnode?: VNode): string | undefined {
  if (props.component) return props.component;
  const t = vnode?.type as any;
  if (t && typeof t === 'object') return t.name || t.__name;
  if (typeof t === 'function') return (t as any).name;
  return undefined;
}

function collectSelectionsFromVNode(vnode?: VNode): Record<string, string | undefined> {
  if (props.selections && Object.keys(props.selections).length) return props.selections;
  const out: Record<string, string | undefined> = {};
  const p = (vnode?.props || {}) as Record<string, unknown>;
  for (const [k, v] of Object.entries(p)) {
    if (k.startsWith('on')) continue; // skip listeners
    if (typeof v === 'string') out[k] = v;
  }
  return out;
}

function inferSlots(component?: string): string[] {
  if (props.slots && props.slots.length) return props.slots;
  if (!component) return ['root'];
  const cfg = store.getComponentConfig(component);
  const s = new Set<string>();
  for (const k of Object.keys(cfg.defaults || {})) s.add(k);
  for (const byOption of Object.values(cfg.props || {})) {
    for (const optionSlots of Object.values(byOption || {})) {
      for (const k of Object.keys(optionSlots || {})) s.add(k);
    }
  }
  return s.size ? Array.from(s) : ['root'];
}

function renderChild() {
  const child = inferChild();
  if (!child) return null;
  const componentName = inferComponentName(child);
  if (!componentName) return child; // nothing to do
  if (SKIP_COMPONENTS.has(componentName)) return child;
  const selections = collectSelectionsFromVNode(child);
  const slots = inferSlots(componentName);
  const ui = buildUiObject(componentName, selections, slots);
  const prev = (child.props as any)?.ui || {};
  const mergedUi = { ...prev, ...ui } as Record<string, any>;

  // If source child and UI are unchanged, return cached VNode to keep el identity
  const uiStable = JSON.stringify(mergedUi);
  const cachedUiStable = cachedUi ? JSON.stringify(cachedUi) : null;
  if (cachedSource === child && cachedCloned && cachedUiStable === uiStable) {
    return cachedCloned;
  }

  // Preserve original ref, key and children
  const props = { ...(child.props as any), ui: mergedUi } as Record<string, any>;
  if ((child as any).ref) props.ref = (child as any).ref;
  const cloned = cloneVNode(child, props, (child as any).children);
  // ensure key consistency
  (cloned as any).key = (child as any).key;

  cachedSource = child;
  cachedUi = mergedUi;
  cachedCloned = cloned;
  return cloned;
}
</script>

<template>
  <RenderFn :render="renderChild" />
</template>
