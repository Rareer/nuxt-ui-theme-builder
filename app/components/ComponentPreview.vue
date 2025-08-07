<template>
    <div>
        <div>
            <h2 class="text-xl font-bold mb-6">Preview Options</h2>
        </div>
        <div class="flex grow gap-4">
            <UFormField v-if="config?.hasColors" label="Color">
                <USelect v-model="color" :items="colors" />
            </UFormField>
            <UFormField v-if="config?.hasSizes" label="Size">
                <USelect v-model="size" :items="sizes" />
            </UFormField>
            <UFormField v-if="config?.hasLoading" label="Loading">
                <USwitch v-model="isLoading" />
            </UFormField>
            <UFormField v-if="config?.hasIcon" label="Icon">
                <USwitch v-model="showIcon" />
            </UFormField>
            <UFormField v-if="config?.hasTrailingIcon && showIcon" label="Trailing Icon">
                <USwitch v-model="trailingIcon" />
            </UFormField>
        </div>
        <USeparator class="my-6"/>
        <div>
            <h2 class="text-xl font-bold mb-6">Preview Variants</h2>
        </div>
        <ThemePreview>
            <div class="space-y-6 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                <div 
                    v-if="config?.variants" 
                    class="space-y-2 flex flex-col items-start" 
                    v-for="variant in config.variants.map((variant) => ({
                        value: variant,
                        label: variant
                    }))" 
                    :key="variant.value"
                >
                    <label class="text-sm font-medium">{{ variant.label }}</label>
                    <component
                        v-bind="config?.staticProps"
                        :is="props.component" 
                        :color="color"
                        :size="size"
                        :icon="showIcon ? 'i-heroicons-exclamation-triangle' : undefined"
                        :trailing="trailingIcon"
                        :loading="isLoading"
                        :variant="variant.value"
                        :ui="getMergedUiObject(variant.value, color, size)"
                    >
                        <template v-if="config?.hasHeader" #header>
                            <span class="h-8">Header</span>
                        </template>
                        <span v-if="config?.hasContent" class="h-32">Content</span>
                        <template v-if="config?.hasFooter" #footer>
                            <span class="h-8">Footer</span>
                        </template>
                    </component>
                </div>
            </div>
        </ThemePreview>
        <USeparator class="my-6"/>
        <div>
            <h2 class="text-xl font-bold mb-6">Customization</h2>
            <UTabs :items="customizableTabs" color="neutral">
                <template #variants="{ item }">
                    <div 
                        v-for="variant in config?.variants" 
                        :key="variant"
                        class="mb-4"
                    >
                        <UFormField :label="variant">
                            <Combobox :model-value="variantClasses[variant]" @update:model-value="val => variantClasses[variant] = val" />
                            <UButton 
                                size="xs" 
                                color="neutral" 
                                variant="ghost" 
                                icon="i-heroicons-chevron-down" 
                                :trailing="true" 
                                class="mt-2" 
                                @click="toggleUiPropertyAccordion('variants', variant)"
                                :label="uiPropertyAccordionState.variants[variant] ? 'Hide additional properties' : 'Show additional properties'"
                            />
                        </UFormField>
                        <div v-if="uiPropertyAccordionState.variants[variant]" class="pl-4 border-l-2 border-gray-200 mt-2 mb-4 space-y-4">
                            <div v-for="uiProp in uiProperties" :key="uiProp" v-show="uiProp !== uiRootName">
                                <UFormField :label="uiProp">
                                    <Combobox :model-value="getUiPropertyClassesRef('variants', variant, uiProp)" @update:model-value="val => updateUiPropertyClass(uiProp, 'variants', variant, val)" />
                                </UFormField>
                            </div>
                        </div>
                    </div>
                </template>
                <template #colors="{ item }">
                    <div 
                        v-for="color in colors" 
                        :key="color.value"
                        class="mb-4"
                    >
                        <UFormField :label="color.value">
                            <Combobox :model-value="colorClasses[color.value]" @update:model-value="val => colorClasses[color.value] = val" />
                            <UButton 
                                size="xs" 
                                color="neutral" 
                                variant="ghost" 
                                icon="i-heroicons-chevron-down" 
                                :trailing="true" 
                                class="mt-2" 
                                @click="toggleUiPropertyAccordion('colors', color.value)"
                                :label="uiPropertyAccordionState.colors[color.value] ? 'Hide additional properties' : 'Show additional properties'"
                            />
                        </UFormField>
                        <div v-if="uiPropertyAccordionState.colors[color.value]" class="pl-4 border-l-2 border-gray-200 mt-2 mb-4 space-y-4">
                            <div v-for="uiProp in uiProperties" :key="uiProp" v-show="uiProp !== uiRootName">
                                <UFormField :label="uiProp">
                                    <Combobox :model-value="getUiPropertyClassesRef('colors', color.value, uiProp)" @update:model-value="val => updateUiPropertyClass(uiProp, 'colors', color.value, val)" />
                                </UFormField>
                            </div>
                        </div>
                    </div>
                </template>
                <template #sizes="{ item }">
                    <div 
                        v-for="size in sizes" 
                        :key="size"
                        class="mb-4"
                    >
                        <UFormField :label="size">
                            <Combobox :model-value="sizeClasses[size]" @update:model-value="val => sizeClasses[size] = val" />
                            <UButton 
                                size="xs" 
                                color="neutral" 
                                variant="ghost" 
                                icon="i-heroicons-chevron-down" 
                                :trailing="true" 
                                class="mt-2" 
                                @click="toggleUiPropertyAccordion('sizes', size)"
                                :label="uiPropertyAccordionState.sizes[size] ? 'Hide additional properties' : 'Show additional properties'"
                            />
                        </UFormField>
                        <div v-if="uiPropertyAccordionState.sizes[size]" class="pl-4 border-l-2 border-gray-200 mt-2 mb-4 space-y-4">
                            <div v-for="uiProp in uiProperties" :key="uiProp" v-show="uiProp !== uiRootName">
                                <UFormField :label="uiProp">
                                    <Combobox :model-value="getUiPropertyClassesRef('sizes', size, uiProp)" @update:model-value="val => updateUiPropertyClass(uiProp, 'sizes', size, val)" />
                                </UFormField>
                            </div>
                        </div>
                    </div>
                </template>
            </UTabs>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useThemeStore, type ThemeVariable } from '~/store/theme'
import { useComponentConfigStore } from '~/store/componentConfig'
import { twMerge } from 'tailwind-merge'

const themeStore = useThemeStore()
const componentConfigStore = useComponentConfigStore()

// Type for component config store methods
type ConfigType = 'variants' | 'colors' | 'sizes'
const componentConfigs = useComponentPreviewConfig()
const props = defineProps({
  component: {
    type: String,
    required: true
  }
})
const sizes: string[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const config = computed(() => componentConfigs.componentConfigs[props.component])
const uiRootName = computed<string>(() => config.value?.ui?.[0] || 'base');
const variant = ref('solid')
const color = ref<ThemeVariable>('primary')
const size = ref('md')
const colors = computed(() => {
    return Object.entries(themeStore.getThemeVariables).map(([key, value]) => {
        return {
            label: value,
            value: value
        }
    })
})
const isLoading = ref(false)
const trailingIcon = ref(false)
const showIcon = ref(false)
const variantClasses = ref<Record<string, string>>({})
const colorClasses = ref<Record<string, string>>({})
const sizeClasses = ref<Record<string, string>>({})

// Store for additional UI properties classes
const uiPropertiesClasses = ref<Record<string, Record<string, string>>>({})  // { property: { variant/color/size: classes } }

const customizableTabs = computed(() => {
    return config.value?.customizable.map((customizable) => {
        return {
            label: customizable.charAt(0).toUpperCase() + customizable.slice(1),
            value: customizable,
            slot: customizable
        }
    })
})

// Save classes to the store whenever they change
watch(variantClasses, (newValue) => {
    Object.entries(newValue).forEach(([variant, classes]) => {
        if (classes) {
            componentConfigStore.setClasses(
                props.component,
                'variants',
                variant,
                uiRootName.value,
                typeof classes === 'string' ? classes.split(' ').filter(Boolean) : Array.isArray(classes) ? classes : []
            )
        }
    })
}, { deep: true })

// Watch for changes in UI properties classes and save to store
watch(uiPropertiesClasses, (newValue) => {
    Object.entries(newValue).forEach(([uiProp, propClasses]) => {
        Object.entries(propClasses).forEach(([typeAndKey, classes]) => {
            if (classes) {
                const [type, key] = typeAndKey.split(':') as [ConfigType, string]
                componentConfigStore.setClasses(
                    props.component,
                    type as ConfigType,
                    key,
                    uiProp,
                    typeof classes === 'string' ? classes.split(' ').filter(Boolean) : Array.isArray(classes) ? classes : []
                )
            }
        })
    })
}, { deep: true })

watch(colorClasses, (newValue) => {
    Object.entries(newValue).forEach(([color, classes]) => {
        if (classes) {
            componentConfigStore.setClasses(
                props.component,
                'colors',
                color,
                uiRootName.value,
                typeof classes === 'string' ? classes.split(' ').filter(Boolean) : Array.isArray(classes) ? classes : []
            )
        }
    })
}, { deep: true })

watch(sizeClasses, (newValue) => {
    Object.entries(newValue).forEach(([size, classes]) => {
        if (classes) {
            componentConfigStore.setClasses(
                props.component,
                'sizes',
                size,
                uiRootName.value,
                typeof classes === 'string' ? classes.split(' ').filter(Boolean) : Array.isArray(classes) ? classes : []
            )
        }
    })
}, { deep: true })

// Initialize component configuration and load classes from the store on component mount
onMounted(() => {
    // Initialize default configurations for this component
    componentConfigStore.initComponentDefaults(props.component)
    
    // Load variant classes
    if (config.value?.variants) {
        config.value.variants.forEach((variant) => {
            const classes = componentConfigStore.getClasses(
                props.component,
                'variants',
                variant,
                uiRootName.value
            )
            if (classes.length > 0) {
                variantClasses.value[variant] = classes.join(' ')
            }
            
            // Load additional UI properties for variants
            if (config.value?.ui) {
                config.value.ui.forEach(uiProp => {
                    if (uiProp !== uiRootName.value) {
                        const propClasses = componentConfigStore.getClasses(
                            props.component,
                            'variants',
                            variant,
                            uiProp
                        )
                        if (propClasses.length > 0) {
                            if (!uiPropertiesClasses.value[uiProp]) {
                                uiPropertiesClasses.value[uiProp] = {}
                            }
                            uiPropertiesClasses.value[uiProp][`variants:${variant}`] = propClasses.join(' ')
                        }
                    }
                })
            }
        })
    }
    
    // Load color classes
    if (config.value?.hasColors) {
        colors.value.forEach((colorObj) => {
            const classes = componentConfigStore.getClasses(
                props.component,
                'colors',
                colorObj.value,
                uiRootName.value
            )
            if (classes.length > 0) {
                colorClasses.value[colorObj.value] = classes.join(' ')
            }
            
            // Load additional UI properties for colors
            if (config.value?.ui) {
                config.value.ui.forEach(uiProp => {
                    if (uiProp !== uiRootName.value) {
                        const propClasses = componentConfigStore.getClasses(
                            props.component,
                            'colors',
                            colorObj.value,
                            uiProp
                        )
                        if (propClasses.length > 0) {
                            if (!uiPropertiesClasses.value[uiProp]) {
                                uiPropertiesClasses.value[uiProp] = {}
                            }
                            uiPropertiesClasses.value[uiProp][`colors:${colorObj.value}`] = propClasses.join(' ')
                        }
                    }
                })
            }
        })
    }
    
    // Load size classes
    if (config.value?.hasSizes) {
        sizes.forEach((size) => {
            const classes = componentConfigStore.getClasses(
                props.component,
                'sizes',
                size,
                uiRootName.value
            )
            if (classes.length > 0) {
                sizeClasses.value[size] = classes.join(' ')
            }
            
            // Load additional UI properties for sizes
            if (config.value?.ui) {
                config.value.ui.forEach(uiProp => {
                    if (uiProp !== uiRootName.value) {
                        const propClasses = componentConfigStore.getClasses(
                            props.component,
                            'sizes',
                            size,
                            uiProp
                        )
                        if (propClasses.length > 0) {
                            if (!uiPropertiesClasses.value[uiProp]) {
                                uiPropertiesClasses.value[uiProp] = {}
                            }
                            uiPropertiesClasses.value[uiProp][`sizes:${size}`] = propClasses.join(' ')
                        }
                    }
                })
            }
        })
    }
})

// Helper function to get or create a reference to a UI property class
const getUiPropertyClassesRef = (type: ConfigType, key: string, uiProp: string): string[] => {
    if (!uiPropertiesClasses.value[uiProp]) {
        uiPropertiesClasses.value[uiProp] = {}
    }
    
    const typeKey = `${type}:${key}`
    if (!uiPropertiesClasses.value[uiProp][typeKey]) {
        uiPropertiesClasses.value[uiProp][typeKey] = ''
    }
    
    return stringToArray(uiPropertiesClasses.value[uiProp][typeKey])
}

// Helper function to update a UI property class
const updateUiPropertyClass = (uiProp: string, type: ConfigType, key: string, value: string | string[]): void => {
    if (!uiPropertiesClasses.value[uiProp]) {
        uiPropertiesClasses.value[uiProp] = {}
    }
    
    uiPropertiesClasses.value[uiProp][`${type}:${key}`] = Array.isArray(value) ? value.join(' ') : value
}

// Accordion state for UI properties
const uiPropertyAccordionState = ref({
    variants: {} as Record<string, boolean>,
    colors: {} as Record<string, boolean>,
    sizes: {} as Record<string, boolean>
})

// Toggle accordion state for UI properties
const toggleUiPropertyAccordion = (type: ConfigType, key: string): void => {
    if (!uiPropertyAccordionState.value[type][key]) {
        uiPropertyAccordionState.value[type][key] = true
    } else {
        uiPropertyAccordionState.value[type][key] = !uiPropertyAccordionState.value[type][key]
    }
}

// Get all UI properties from config
const uiProperties = computed<string[]>(() => {
    return config.value?.ui || []
})

// Helper function to convert string to string array
const stringToArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    return value.split(' ').filter(Boolean);
}

// Get merged classes for a specific UI property
const getMergedClassesForProperty = (property: string, variant: string, color: string, size: string): string => {
    const variantKey = `variants:${variant}`
    const colorKey = `colors:${color}`
    const sizeKey = `sizes:${size}`
    
    // If this is the root property (base/root), use the main classes
    if (property === uiRootName.value) {
        return twMerge(
            sizeClasses.value[size],
            colorClasses.value[color],
            variantClasses.value[variant],
        )
    }
    
    // Otherwise use the property-specific classes
    if (uiPropertiesClasses.value[property]) {
        return twMerge(
            uiPropertiesClasses.value[property][sizeKey] || '',
            uiPropertiesClasses.value[property][colorKey] || '',
            uiPropertiesClasses.value[property][variantKey] || '',
        )
    }
    
    return ''
}

// Create the complete UI object with all properties
const getMergedUiObject = (variant: string, color: string, size: string): Record<string, string> => {
    const result: Record<string, string> = {}
    
    // Add all UI properties to the result object
    uiProperties.value.forEach(property => {
        const classes = getMergedClassesForProperty(property, variant, color, size)
        if (classes) {
            result[property] = classes
        }
    })
    
    return result
}
</script>