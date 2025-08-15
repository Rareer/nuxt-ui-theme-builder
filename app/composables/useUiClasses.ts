import { computed, onMounted, ref, type Ref, watch } from 'vue';
import { twMerge } from 'tailwind-merge';

export type ConfigType = 'variants' | 'colors' | 'sizes';

export interface ComponentConfigStore {
	initComponentDefaults: (component: string) => void;
	getClasses: (component: string, type: ConfigType, key: string, uiProp: string) => string[];
	setClasses: (component: string, type: ConfigType, key: string, uiProp: string, classes: string[]) => void;
}

export function useUiClasses(params: {
	component: Ref<string>;
	config: Ref<{
		variants?: string[];
		customizable: string[];
		hasColors?: boolean;
		hasSizes?: boolean;
		ui?: string[];
	} | undefined>;
	uiRootName: Ref<string>;
	componentConfigStore: ComponentConfigStore;
	colors: Ref<Array<{ label: string; value: string }>>;
	sizes: Ref<string[]>;
}) {
	const { component, config, uiRootName, componentConfigStore, colors, sizes } = params;

	const variantClasses = ref<Record<string, string[]>>({});
	const colorClasses = ref<Record<string, string[]>>({});
	const sizeClasses = ref<Record<string, string[]>>({});
	const uiPropertiesClasses = ref<Record<string, Record<string, string>>>({});

	const uiProperties = computed<string[]>(() => config.value?.ui || []);

	const stringToArray = (value: string | string[] | undefined): string[] => {
		if (!value) return [];
		if (Array.isArray(value)) return value;
		return value.split(' ').filter(Boolean);
	};

	const getUiPropertyClassesRef = (type: ConfigType, key: string, uiProp: string): string[] => {
		if (!uiPropertiesClasses.value[uiProp]) uiPropertiesClasses.value[uiProp] = {};
		const typeKey = `${type}:${key}`;
		if (!uiPropertiesClasses.value[uiProp][typeKey]) uiPropertiesClasses.value[uiProp][typeKey] = '';
		return stringToArray(uiPropertiesClasses.value[uiProp][typeKey]);
	};

	const updateUiPropertyClass = (uiProp: string, type: ConfigType, key: string, value: string | string[]) => {
		if (!uiPropertiesClasses.value[uiProp]) uiPropertiesClasses.value[uiProp] = {};
		uiPropertiesClasses.value[uiProp][`${type}:${key}`] = Array.isArray(value) ? value.join(' ') : value;
	};

	const getMergedClassesForProperty = (property: string, variant: string, color: string, size: string): string => {
		const variantKey = `variants:${variant}`;
		const colorKey = `colors:${color}`;
		const sizeKey = `sizes:${size}`;

		if (property === uiRootName.value) {
			return twMerge(
				(sizeClasses.value[size] || []).join(' '),
				(colorClasses.value[color] || []).join(' '),
				(variantClasses.value[variant] || []).join(' '),
			);
		}

		if (uiPropertiesClasses.value[property]) {
			return twMerge(
				uiPropertiesClasses.value[property][sizeKey] || '',
				uiPropertiesClasses.value[property][colorKey] || '',
				uiPropertiesClasses.value[property][variantKey] || '',
			);
		}

		return '';
	};

	const getMergedUiObject = (variant: string, color: string, size: string): Record<string, string> => {
		const result: Record<string, string> = {};
		uiProperties.value.forEach((property) => {
			const classes = getMergedClassesForProperty(property, variant, color, size);
			if (classes) result[property] = classes;
		});
		return result;
	};

	// Accordion state and toggler
	const uiPropertyAccordionState = ref({
		variants: {} as Record<string, boolean>,
		colors: {} as Record<string, boolean>,
		sizes: {} as Record<string, boolean>,
	});

	// Unified expanded state for generic UI keyed by `${type}:${key}`
	const expandedKeys = ref<Set<string>>(new Set());

	const makeCompositeKey = (type: ConfigType, key: string) => `${type}:${key}`;

	const isExpanded = (type: ConfigType, key: string) => {
		return expandedKeys.value.has(makeCompositeKey(type, key));
	};

	const toggleExpanded = (type: ConfigType, key: string) => {
		const k = makeCompositeKey(type, key);
		if (expandedKeys.value.has(k)) expandedKeys.value.delete(k);
		else expandedKeys.value.add(k);
	};

	// Backwards compatible toggler used by current template
	const toggleUiPropertyAccordion = (type: ConfigType, key: string) => {
		if (!uiPropertyAccordionState.value[type][key]) {
			uiPropertyAccordionState.value[type][key] = true;
		}
		else {
			uiPropertyAccordionState.value[type][key] = !uiPropertyAccordionState.value[type][key];
		}
		// keep unified state in sync
		toggleExpanded(type, key);
	};

	// Initialization: load classes from store
	const initialize = () => {
		componentConfigStore.initComponentDefaults(component.value);

		if (config.value?.variants) {
			config.value.variants.forEach((variant) => {
				const classes = componentConfigStore.getClasses(component.value, 'variants', variant, uiRootName.value);
				if (classes.length > 0) variantClasses.value[variant] = classes;

				if (config.value?.ui) {
					config.value.ui.forEach((uiProp) => {
						if (uiProp !== uiRootName.value) {
							const propClasses = componentConfigStore.getClasses(component.value, 'variants', variant, uiProp);
							if (propClasses.length > 0) {
								if (!uiPropertiesClasses.value[uiProp]) uiPropertiesClasses.value[uiProp] = {};
								uiPropertiesClasses.value[uiProp][`variants:${variant}`] = propClasses.join(' ');
							}
						}
					});
				}
			});
		}

		if (config.value?.hasColors) {
			colors.value.forEach((colorObj) => {
				const classes = componentConfigStore.getClasses(component.value, 'colors', colorObj.value, uiRootName.value);
				if (classes.length > 0) colorClasses.value[colorObj.value] = classes;

				if (config.value?.ui) {
					config.value.ui.forEach((uiProp) => {
						if (uiProp !== uiRootName.value) {
							const propClasses = componentConfigStore.getClasses(component.value, 'colors', colorObj.value, uiProp);
							if (propClasses.length > 0) {
								if (!uiPropertiesClasses.value[uiProp]) uiPropertiesClasses.value[uiProp] = {};
								uiPropertiesClasses.value[uiProp][`colors:${colorObj.value}`] = propClasses.join(' ');
							}
						}
					});
				}
			});
		}

		if (config.value?.hasSizes) {
			sizes.value.forEach((size) => {
				const classes = componentConfigStore.getClasses(component.value, 'sizes', size, uiRootName.value);
				if (classes.length > 0) sizeClasses.value[size] = classes;

				if (config.value?.ui) {
					config.value.ui.forEach((uiProp) => {
						if (uiProp !== uiRootName.value) {
							const propClasses = componentConfigStore.getClasses(component.value, 'sizes', size, uiProp);
							if (propClasses.length > 0) {
								if (!uiPropertiesClasses.value[uiProp]) uiPropertiesClasses.value[uiProp] = {};
								uiPropertiesClasses.value[uiProp][`sizes:${size}`] = propClasses.join(' ');
							}
						}
					});
				}
			});
		}
	};

	// Watchers to persist changes back to store
	const setupWatchers = () => {
		watch(variantClasses, (newValue) => {
			Object.entries(newValue).forEach(([variant, classes]) => {
				if (classes) {
					componentConfigStore.setClasses(
						component.value,
						'variants',
						variant,
						uiRootName.value,
						Array.isArray(classes) ? classes : [],
					);
				}
			});
		}, { deep: true });

		watch(uiPropertiesClasses, (newValue) => {
			Object.entries(newValue).forEach(([uiProp, propClasses]) => {
				Object.entries(propClasses).forEach(([typeAndKey, classes]) => {
					if (classes) {
						const [type, key] = typeAndKey.split(':') as [ConfigType, string];
						componentConfigStore.setClasses(
							component.value,
							type as ConfigType,
							key,
							uiProp,
							typeof classes === 'string' ? classes.split(' ').filter(Boolean) : Array.isArray(classes) ? classes : [],
						);
					}
				});
			});
		}, { deep: true });

		watch(colorClasses, (newValue) => {
			Object.entries(newValue).forEach(([color, classes]) => {
				if (classes) {
					componentConfigStore.setClasses(
						component.value,
						'colors',
						color,
						uiRootName.value,
						Array.isArray(classes) ? classes : [],
					);
				}
			});
		}, { deep: true });

		watch(sizeClasses, (newValue) => {
			Object.entries(newValue).forEach(([size, classes]) => {
				if (classes) {
					componentConfigStore.setClasses(
						component.value,
						'sizes',
						size,
						uiRootName.value,
						Array.isArray(classes) ? classes : [],
					);
				}
			});
		}, { deep: true });
	};

	return {
		// state
		variantClasses,
		colorClasses,
		sizeClasses,
		uiPropertiesClasses,
		uiProperties,
		uiPropertyAccordionState,
		expandedKeys,
		// helpers
		stringToArray,
		getUiPropertyClassesRef,
		updateUiPropertyClass,
		getMergedClassesForProperty,
		getMergedUiObject,
		toggleUiPropertyAccordion,
		// generic helpers
		isExpanded,
		toggleExpanded,
		getKeyClasses: (type: ConfigType, key: string): string[] => {
			if (type === 'variants') return variantClasses.value[key] || [];
			if (type === 'colors') return colorClasses.value[key] || [];
			return sizeClasses.value[key] || [];
		},
		setKeyClasses: (type: ConfigType, key: string, classes: string[] | string) => {
			const arr = Array.isArray(classes) ? classes : classes.split(' ').filter(Boolean);
			if (type === 'variants') variantClasses.value[key] = arr;
			else if (type === 'colors') colorClasses.value[key] = arr;
			else sizeClasses.value[key] = arr;
		},
		getUiSlotClasses: (type: ConfigType, key: string, uiProp: string): string[] => {
			return getUiPropertyClassesRef(type, key, uiProp);
		},
		setUiSlotClasses: (type: ConfigType, key: string, uiProp: string, value: string[] | string) => {
			updateUiPropertyClass(uiProp, type, key, value);
		},
		// lifecycle helpers
		initialize,
		setupWatchers,
	};
}
