import { computed, type Ref } from 'vue';
import { useComponentPreviewConfig } from '@/composables/useComponentPreviewConfig';
import { extractOptions, type DocsProp, filterDocsProps } from '@/utils/docsProps';

export function usePreviewSchema(componentName: Ref<string>) {
  const { availableComponentConfigs } = useComponentPreviewConfig();

  const currentConfig = computed(() =>
    availableComponentConfigs.find(c => c.value === componentName.value),
  );

  const docsProps = computed<DocsProp[]>(() => currentConfig.value?.props || []);
  const filteredDocsProps = computed<DocsProp[]>(() => filterDocsProps(docsProps.value, { excludeNames: ['ui'] }));

  const booleanPropsAll = computed(() => filteredDocsProps.value.filter(p => p.type === 'boolean'));
  const stringPropsAll = computed(() => filteredDocsProps.value.filter(p => p.type === 'string'));
  const optionPropsAll = computed(() => filteredDocsProps.value
    .map(p => ({ name: p.name, type: extractOptions(p.type) }))
    .filter(p => Array.isArray(p.type) && (p.type as string[]).length) as { name: string; type: string[] }[],
  );

  const configPropNames = computed<string[]>(() => currentConfig.value?.configProps || []);
  const optionsByProp = computed<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = {};
    for (const name of configPropNames.value) {
      const prop = docsProps.value.find(p => p.name.toLowerCase() === name.toLowerCase());
      map[name] = prop ? extractOptions(prop.type) : [];
    }
    return map;
  });

  const uiSlots = computed<string[]>(() => {
    const uiProp = docsProps.value.find(p => p.name === 'ui');
    return uiProp ? extractOptions(uiProp.type) : [];
  });

  const previewPropName = computed(() => currentConfig.value?.previewProp);
  const previewPropLower = computed(() => (previewPropName.value || '').toLowerCase());
  const previewPropOptions = computed<string[]>(() => {
    const name = previewPropName.value?.toLowerCase();
    if (!name) return [];
    const prop = docsProps.value.find(p => p.name.toLowerCase() === name);
    return prop ? extractOptions(prop.type) : [];
  });

  const slotsContent = computed<Record<string, any>>(() => currentConfig.value?.slots || {});
  const childSpec = computed<any | undefined>(() => (currentConfig.value as any)?.child);
  const childModelCfg = computed<{ value: any; prop?: string; event?: string } | undefined>(() => (currentConfig.value as any)?.childModel);

  const booleanProps = computed(() => booleanPropsAll.value.filter(p => p.name.toLowerCase() !== previewPropLower.value));
  const optionProps = computed(() => optionPropsAll.value.filter(p => p.name.toLowerCase() !== previewPropLower.value));
  const stringProps = computed(() => stringPropsAll.value.filter(p => p.name.toLowerCase() !== previewPropLower.value));

  const preset = computed<Record<string, any>>(() => currentConfig.value?.preset || {});

  return {
    currentConfig,
    docsProps,
    filteredDocsProps,
    booleanPropsAll,
    optionPropsAll,
    stringPropsAll,
    booleanProps,
    optionProps,
    stringProps,
    configPropNames,
    optionsByProp,
    uiSlots,
    previewPropName,
    previewPropLower,
    previewPropOptions,
    slotsContent,
    childSpec,
    childModelCfg,
    preset,
  };
}
