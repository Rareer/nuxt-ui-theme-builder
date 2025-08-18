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
  // preset prop values provided via overrides (used to initialize bound state)
  preset?: Record<string, any>;
  // name of a prop to preview all options for (e.g., 'variant')
  previewProp?: string;
  // list of props that are relevant for slot configuration
  configProps?: string[];
  // slot demo content keyed by slot name (e.g., { header: 'Header', default: 'Body', footer: 'Footer' })
  slots?: Record<string, any>;
  // preferred declarative child for default slot (overrides slots.default if present)
  child?: any;
};

// Overrides format
type Overrides = Record<string, {
  disable?: string[];
  set?: Record<string, any>;
  previewProp?: string;
  configProps?: string[];
  slots?: Record<string, any>;
  child?: any;
}>;

// Prefer centralized utility dataset; fallback to per-file JSON globs
import docsData from '@/utils/nuxt-ui-docs.data';
const docsPropsMapGlob = import.meta.glob('../generated/nuxt-ui-docs/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, DocsProp[]>;

// Load manual overrides via utility, with fallback to JSON
import overridesUtil from '@/utils/nuxt-ui-docs.overrides';
const overridesGlob = import.meta.glob('../config/nuxt-ui-docs.overrides.json', {
  eager: true,
  import: 'default',
}) as Record<string, Overrides>;
const overridesFromJson: Overrides = (Object.values(overridesGlob)[0] as Overrides) || {};
const overrides: Overrides = Object.keys(overridesUtil || {}).length ? overridesUtil : overridesFromJson;

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
  // Build dataset from utility or globbed files
  const docsPropsMap: Record<string, DocsProp[]> = (Object.keys(docsData || {}).length
    ? Object.fromEntries(Object.entries(docsData).map(([name, props]) => [
        `utils://${name}.json`,
        props,
      ]))
    : docsPropsMapGlob);

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
    // Apply overrides (case-insensitive key support)
    const overrideEntry =
      overrides[c.label] ||
      overrides[c.label.toLowerCase()];

    let mergedProps = propsEntry;
    if (overrideEntry) {
      const disableSet = new Set((overrideEntry.disable || []).map((s) => s.toLowerCase()));
      mergedProps = propsEntry.filter((p) => !disableSet.has(p.name.toLowerCase()));
    }

    // Resolve preview/config props (support misplaced keys inside `set` as fallback)
    const resolvedPreviewProp = overrideEntry?.previewProp ?? (overrideEntry as any)?.set?.previewProp;
    const resolvedConfigProps = overrideEntry?.configProps ?? (overrideEntry as any)?.set?.configProps;
    const resolvedSlots = overrideEntry?.slots ?? (overrideEntry as any)?.set?.slots;
    const resolvedChild = (overrideEntry as any)?.child ?? (overrideEntry as any)?.set?.child;

    // Build preset, stripping reserved keys if they were incorrectly placed in `set`
    let preset: Record<string, any> | undefined = undefined;
    if (overrideEntry?.set) {
      const { previewProp, configProps, slots, ...rest } = overrideEntry.set as Record<string, any>;
      preset = Object.keys(rest).length ? rest : undefined;
    }
    return {
      label: c.label,
      value: c.value,
      baseName: c.label,
      props: mergedProps,
      preset,
      previewProp: resolvedPreviewProp,
      configProps: resolvedConfigProps,
      slots: resolvedSlots,
      child: resolvedChild,
    };
  });

  return {
    availableComponents,
    availableComponentConfigs,
  };
};
