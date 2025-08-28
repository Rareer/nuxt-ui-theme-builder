import { computed, h, ref, resolveComponent, type Ref } from 'vue';

export function useChildRenderer(params: {
  childSpec: Ref<any | undefined>;
  childModelCfg: Ref<{ value: any; prop?: string; event?: string } | undefined>;
}) {
  const childModelValue = ref<any>();

  // sync default
  const _ = computed(() => {
    if (params.childModelCfg.value) {
      childModelValue.value = params.childModelCfg.value.value;
    } else {
      childModelValue.value = undefined;
    }
    return 0;
  });

  function renderChild(spec: any) {
    if (typeof spec === 'function') return spec;
    if (spec && typeof spec === 'object' && (spec.is || spec.component)) {
      return () => {
        const name = spec.is || spec.component;
        const comp = typeof name === 'string' ? resolveComponent(name) : name;
        const children = spec.children;
        const propsMerged: Record<string, any> = { ...(spec.props || {}) };
        if (params.childModelCfg.value) {
          const propName = params.childModelCfg.value.prop || 'modelValue';
          const customEvent = params.childModelCfg.value.event?.trim();
          let eventKey: string;
          if (!customEvent) {
            eventKey = `onUpdate:${propName}`;
          } else {
            const ce = customEvent as string;
            if (!ce || ce.length === 0) {
              eventKey = 'onChange';
            } else if (ce.startsWith('update:')) {
              eventKey = `onUpdate:${ce.slice('update:'.length)}`;
            } else if (typeof ce === 'string' && ce.length > 0) {
              eventKey = `on${ce.charAt(0).toUpperCase()}${ce.slice(1)}`;
            } else {
              eventKey = 'onChange';
            }
          }
          propsMerged[propName] = childModelValue.value;
          propsMerged[eventKey] = (v: any) => { childModelValue.value = v; };
        }
        if (Array.isArray(children)) return h(comp as any, propsMerged, children);
        if (typeof children === 'function') return h(comp as any, propsMerged, children);
        if (children != null) return h(comp as any, propsMerged, () => children);
        return h(comp as any, propsMerged);
      };
    }
    return () => spec;
  }

  const renderedChildFn = computed<(() => any) | null>(() => {
    if (params.childSpec.value === undefined) return null;
    return renderChild(params.childSpec.value);
  });

  return { childModelValue, renderedChildFn } as const;
}
