// Types derived from generated extractor output
type ExtractedProp = {
  name: string;
  type: string;
  optional?: boolean;
  default?: string;
  description?: string;
  tags?: Record<string, string>;
};
type ExtractedComponent = {
  component: string; // e.g. 'Alert'
  file: string;
  props: ExtractedProp[];
  slots: { name: string; props: string; description?: string }[];
  emits: { name: string; args: string }[];
};

type ComponentsIndexEntry = {
  component: string; // 'Alert'
  file: string;
  props: string[];
  hasVariant: boolean;
  hasColor: boolean;
  hasSize: boolean;
  previewProp: 'variant' | null;
};

// Static imports to JSON outputs
// Index of components
// Use paths relative to this file: app/composables/useComponentPreviewConfig.ts
const indexGlob = import.meta.glob('../generated/nuxt-ui/components.index.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;
const overridesGlob = import.meta.glob('../config/components.index.overrides.json', {
  eager: true,
  import: 'default',
}) as Record<string, unknown>;

// All per-component JSONs
const componentsMap = import.meta.glob('../generated/nuxt-ui/components/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, ExtractedComponent>;

const componentsIndex = Object.values(indexGlob)[0] as ComponentsIndexEntry[] | undefined;
const previewOverrides = (Object.values(overridesGlob)[0] as Partial<ComponentsIndexEntry>[] | undefined) || [];
// Debug: what did the globs pick up?
console.debug('[useComponentPreviewConfig:init] indexGlob keys:', Object.keys(indexGlob));
console.debug('[useComponentPreviewConfig:init] overridesGlob keys:', Object.keys(overridesGlob));
console.debug('[useComponentPreviewConfig:init] componentsMap keys (count):', Object.keys(componentsMap).length);

function fileKeyToComponentName(key: string): string {
  // Normalize separators to handle Windows paths
  const normalized = key.replace(/\\/g, '/');
  const base = normalized.split('/').pop() || '';
  return base.replace(/\.json$/, '');
}

export const useComponentPreviewConfig = () => {
  // Build available components from index (prefixed with 'U')
  // Merge overrides for previewProp
  if (!componentsIndex || componentsIndex.length === 0) {
    console.warn('[useComponentPreviewConfig] No generated index found. Run `npm run extract:nuxt-ui` to generate app/generated/nuxt-ui/*.json');
    console.debug('[useComponentPreviewConfig] indexGlob keys:', Object.keys(indexGlob));
    console.debug('[useComponentPreviewConfig] overridesGlob keys:', Object.keys(overridesGlob));
    console.debug('[useComponentPreviewConfig] componentsMap keys (count):', Object.keys(componentsMap).length);
  }

  const mergedIndex: ComponentsIndexEntry[] = (componentsIndex || []).map((entry) => {
    const override = previewOverrides.find((o) => o.component === entry.component);
    return {
      ...entry,
      previewProp: override?.previewProp ?? entry.previewProp ?? null,
    } as ComponentsIndexEntry;
  });

  let availableComponents = mergedIndex
    .map((entry) => ({
      label: entry.component,
      value: `U${entry.component}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Fallback: derive from filenames if index is empty
  if (availableComponents.length === 0 && Object.keys(componentsMap).length > 0) {
    const names = Object.keys(componentsMap)
      .map((k) => fileKeyToComponentName(k))
      .filter(Boolean);
    availableComponents = names
      .map((name) => ({ label: name, value: `U${name}` }))
      .sort((a, b) => a.label.localeCompare(b.label));
    console.debug('[useComponentPreviewConfig] Using fallback availableComponents from componentsMap:', availableComponents.length);
  }
  console.debug('[useComponentPreviewConfig] counts', {
    mergedIndex: mergedIndex.length,
    availableComponents: availableComponents.length,
  });

  // Access a component meta by base name (without 'U')
  function getComponentMeta(baseName: string): ExtractedComponent | undefined {
    // Find in glob map by filename
    for (const [key, meta] of Object.entries(componentsMap)) {
      if (fileKeyToComponentName(key) === baseName) return meta;
    }
    return undefined;
  }

  // Index lookup by base name
  function getIndexEntry(baseName: string): ComponentsIndexEntry | undefined {
    return mergedIndex.find((e) => e.component === baseName);
  }

  // Provide some static props to ensure components render in preview by default
  function getStaticProps(baseName: string): Record<string, any> | undefined {
    switch (baseName) {
      case 'Accordion':
        return {
          items: [
            { label: 'Item 1', content: 'Content 1', icon: 'i-heroicons-exclamation-triangle' },
            { label: 'Item 2', content: 'Content 2', icon: 'i-heroicons-exclamation-triangle' },
            { label: 'Item 3', content: 'Content 3', icon: 'i-heroicons-exclamation-triangle' },
          ],
        };
      case 'Alert':
        return { title: 'Alert', description: 'This is an alert', icon: 'i-heroicons-exclamation-triangle' };
      case 'Badge':
        return { label: 'Badge' };
      case 'Button':
        return { label: 'Button' };
      case 'Card':
        return { class: 'w-full' };
      default:
        return undefined;
    }
  }

  // Some defaults the UI can use
  const defaultVariants = ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'];
  const defaultSizes = ['xs', 'sm', 'md', 'lg', 'xl'];

  // Central prop options registry (component-agnostic)
  function getPropOptions(propName: string): string[] | undefined {
    if (propName === 'variant') return defaultVariants;
    if (propName === 'size') return defaultSizes;
    if (propName === 'color') {
      try {
        const cfg: any = useAppConfig?.() as any;
        const uiColors = cfg?.ui?.colors;
        const keys = uiColors ? Object.keys(uiColors) : [];
        if (keys.length) return keys;
      } catch {}
      return undefined;
    }
    return undefined;
  }

  return {
    availableComponents,
    getComponentMeta,
    getIndexEntry,
    getStaticProps,
    defaultVariants,
    defaultSizes,
    getPropOptions,
  };
};
