// Minimal composable: expose available components and their docs-derived configs only

type DocsProp = {
  name: string;
  type: 'boolean' | 'string' | string[] | unknown;
};

type AvailableComponentConfig = {
  label: string; // PascalCase, e.g. 'Button'
  value: string; // 'U' + label, e.g. 'UButton'
  baseName: string; // same as label
  props: DocsProp[]; // from app/generated/nuxt-ui-docs/*.json
};

const docsPropsMap = import.meta.glob('../generated/nuxt-ui-docs/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, DocsProp[]>;

function fileKeyToComponentName(key: string): string {
  const normalized = key.replace(/\\/g, '/');
  const base = normalized.split('/').pop() || '';
  return base.replace(/\.json$/, '');
}

function pascalCase(s: string): string {
  return s
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

export const useComponentPreviewConfig = () => {
  const names = Object.keys(docsPropsMap)
    .map((k) => fileKeyToComponentName(k))
    .filter(Boolean);

  const availableComponents = names
    .map((n) => pascalCase(n))
    .map((label) => ({ label, value: `U${label}` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const availableComponentConfigs: AvailableComponentConfig[] = availableComponents.map((c) => {
    const lower = c.label.toLowerCase();
    const propsEntry = Object.entries(docsPropsMap).find(([k]) => fileKeyToComponentName(k).toLowerCase() === lower)?.[1] || [];
    return {
      label: c.label,
      value: c.value,
      baseName: c.label,
      props: propsEntry,
    };
  });

  return {
    availableComponents,
    availableComponentConfigs,
  };
};
