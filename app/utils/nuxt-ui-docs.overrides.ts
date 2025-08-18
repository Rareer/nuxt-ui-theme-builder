// Centralized container for Nuxt UI overrides.
// Move your overrides here to avoid JSON globs at runtime. For now, we re-export the JSON to keep behavior.

export type Overrides = Record<string, {
  disable?: string[];
  set?: Record<string, any>;
  previewProp?: string;
  configProps?: string[];
  slots?: Record<string, any>;
  child?: any;
}>;

// Inlined overrides migrated from JSON. Keys are PascalCase component names.
const overrides: Overrides = {
  Alert: {
    set: {
      title: 'Alert',
      icon: 'i-lucide-square-code',
      description: 'Description text',
      closeIcon: 'i-lucide-x',
      close: true,
    },
    previewProp: 'variant',
    configProps: ['variant'],
    disable: [],
  },
  Avatar: {
    set: {
      label: 'Avatar',
      src: 'https://github.com/benjamincanac.png',
      icon: 'i-lucide-square-code',
    },
    previewProp: 'size',
    configProps: ['size'],
    disable: ['alt', 'text'],
  },
  Badge: {
    set: {
      label: 'Badge',
      icon: 'i-lucide-square-code',
    },
    previewProp: 'variant',
    configProps: ['variant'],
    disable: ['type', 'label', 'leadingIcon', 'trailingIcon', 'loadingIcon'],
  },
  Button: {
    set: {
      label: 'Button',
      icon: 'i-lucide-square-code',
      color: 'primary',
    },
    previewProp: 'variant',
    configProps: ['variant'],
    disable: ['type', 'label', 'leadingIcon', 'trailingIcon', 'loadingIcon', 'leading', 'loadingAuto', 'block'],
  },
  Calendar: {
    set: {
      color: 'primary',
    },
    // Note: Calendar has no 'variant' prop in the scraped dataset, but we keep this per original config
    configProps: ['variant'],
    // Corrected prop names to match dataset: allowNonContiguousRanges, initialFocus
    disable: ['allowNonContiguousRanges', 'pagedNavigation', 'preventDeselect', 'fixedWeeks', 'initialFocus', 'disableDaysOutsideCurrentView', 'fixedDate'],
  },
  Card: {
    set: {
      header: 'Header',
      content: 'Content',
      footer: 'Footer',
    },
    previewProp: 'variant',
    configProps: ['variant'],
    slots: {
      header: 'Header',
      default: 'Content',
      footer: 'Footer',
    },
    disable: [],
  },
  Checkbox: {
    set: {
      color: 'primary',
      size: 'md',
      label: 'Checkbox',
      description: 'Description text',
      icon: 'i-lucide-check',
    },
    previewProp: 'variant',
    configProps: ['variant'],
    disable: ['name', 'id', 'indeterminateIcon'],
  },
  Chip: {
    set: {
      color: 'primary',
      size: 'md',
      show: true,
      inset: true,
    },
    previewProp: 'position',
    configProps: ['position', 'color', 'size'],
    child: {
      is: 'UButton',
      props: { label: 'Button' },
    },
    disable: [],
  },
};

export default overrides;
