import type { Directive, VNode } from 'vue';
import { buildUiObject } from '@/composables/useUiClasses';
import { useComponentUiConfigStore } from '@/store/componentUiConfig';

export type NuxtUiBinding = {
  // Name of the Nuxt UI component; if omitted we try to infer from vnode
  component?: string;
  // Current selected options per configurable prop, e.g. { color: 'primary', size: 'md' }
  selections: Record<string, string | undefined>;
  // List of ui slots to build (e.g. ['root','label','icon'])
  slots: string[];
};

function inferComponentName(vnode: VNode): string | undefined {
  // For component vnodes, vnode.type can be a function or an object with name
  const t = vnode.type as any;
  if (t && typeof t === 'object') return t.name || t.__name;
  if (typeof t === 'function') return (t as any).name;
  return undefined;
}

function collectSelectionsFromVNode(vnode: VNode): Record<string, string | undefined> {
  const props = (vnode.props || {}) as Record<string, unknown>;
  const selections: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(props)) {
    // Vue normalizes event listeners as onX; skip them
    if (k.startsWith('on')) continue;
    if (typeof v === 'string') selections[k] = v;
  }
  return selections;
}

function inferSlotsFromStore(component: string): string[] {
  const store = useComponentUiConfigStore();
  const cfg = store.getComponentConfig(component);
  const slots = new Set<string>();
  // defaults
  for (const s of Object.keys(cfg.defaults || {})) slots.add(s);
  // per prop/option
  for (const byOption of Object.values(cfg.props || {})) {
    for (const optionSlots of Object.values(byOption || {})) {
      for (const s of Object.keys(optionSlots || {})) slots.add(s);
    }
  }
  // sensible fallback
  if (slots.size === 0) slots.add('root');
  return Array.from(slots);
}

function applyUi(vnode: VNode, value?: NuxtUiBinding) {
  const component = (value && value.component) || inferComponentName(vnode);
  if (!component) return;

  const slots = Array.isArray(value?.slots) && (value!.slots as any[]).length
    ? (value!.slots as string[])
    : inferSlotsFromStore(component);
  if (!slots.length) return;

  const selections = value?.selections && Object.keys(value.selections).length
    ? value.selections
    : collectSelectionsFromVNode(vnode);

  const ui = buildUiObject(component, selections, slots);
  (vnode.props ||= {} as any);
  // Merge (do not clobber if author already provided some of ui)
  const prev = (vnode.props as any).ui || {};
  (vnode.props as any).ui = { ...prev, ...ui };
}

export const nuxtUiDirective: Directive = {
  created(_el, binding, vnode) {
    applyUi(vnode, binding.value as NuxtUiBinding);
  },
  beforeMount(_el, binding, vnode) {
    applyUi(vnode, binding.value as NuxtUiBinding);
  },
  mounted(_el, binding, vnode) {
    applyUi(vnode, binding.value as NuxtUiBinding);
  },
  beforeUpdate(_el, binding, vnode) {
    applyUi(vnode, binding.value as NuxtUiBinding);
  },
  updated(_el, binding, vnode) {
    applyUi(vnode, binding.value as NuxtUiBinding);
  },
};

export default nuxtUiDirective;
