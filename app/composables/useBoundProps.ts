import { reactive, watchEffect } from 'vue';

export type OptionProp = { name: string; type: string[] };
export type BooleanProp = { name: string; type: 'boolean' };
export type StringProp = { name: string; type: 'string' };

export function useBoundProps(opts: {
  booleanProps: () => BooleanProp[];
  optionProps: () => OptionProp[];
  preset: () => Record<string, any>;
}) {
  const bound = reactive<Record<string, any>>({});

  watchEffect(() => {
    const preset = opts.preset() || {};
    for (const key in preset) {
      if (!(key in bound)) bound[key] = preset[key];
    }

    for (const p of opts.booleanProps()) {
      if (!(p.name in bound)) bound[p.name] = false;
    }

    for (const p of opts.optionProps()) {
      const options = Array.isArray(p.type) ? (p.type as string[]) : [];
      if (options.length && !(p.name in bound)) {
        bound[p.name] = options[0];
      }
    }
  });

  return { bound } as const;
}
