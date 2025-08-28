import { computed, type Ref } from 'vue';
import { useComponentUiConfigStore } from '@/store/componentUiConfig';

export function useUiConfiguratorModels(params: {
  componentName: Ref<string>;
  configPropNames: Ref<string[]>;
  uiSlots: Ref<string[]>;
  optionsByProp: Ref<Record<string, string[]>>;
}) {
  const uiStore = useComponentUiConfigStore();

  const uiModel = (propName: string, opt: string, slot: string) => computed<string[]>({
    get() {
      uiStore.ensurePath(params.componentName.value, propName, opt, slot);
      return uiStore.getClasses(params.componentName.value, propName, opt, slot);
    },
    set(v: string[]) {
      uiStore.setClasses(params.componentName.value, propName, opt, slot, v);
    },
  });

  const defaultUiModel = (slot: string) => computed<string[]>({
    get() {
      uiStore.ensureDefaultSlot(params.componentName.value, slot);
      return uiStore.getDefaultClasses(params.componentName.value, slot);
    },
    set(v: string[]) {
      uiStore.setDefaultClasses(params.componentName.value, slot, v);
    },
  });

  function ensureAllPaths() {
    for (const propName of params.configPropNames.value) {
      const opts = params.optionsByProp.value[propName] || [];
      for (const opt of opts) {
        for (const slot of params.uiSlots.value) {
          uiStore.ensurePath(params.componentName.value, propName, opt, slot);
        }
      }
    }
    for (const slot of params.uiSlots.value) {
      uiStore.ensureDefaultSlot(params.componentName.value, slot);
    }
  }

  function hasAnyDefault() {
    return uiStore.hasAnyDefaultClasses(params.componentName.value);
  }
  function resetDefault() {
    uiStore.clearDefaultClasses(params.componentName.value);
  }
  function hasAnyForOption(propName: string, opt: string) {
    return uiStore.hasAnyClassesForOption(params.componentName.value, propName, opt);
  }
  function resetOption(propName: string, opt: string) {
    uiStore.clearClassesForOption(params.componentName.value, propName, opt);
  }

  return {
    uiModel,
    defaultUiModel,
    ensureAllPaths,
    hasAnyDefault,
    resetDefault,
    hasAnyForOption,
    resetOption,
  } as const;
}
