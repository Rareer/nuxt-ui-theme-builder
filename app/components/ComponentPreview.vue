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
            <UFormField v-if="config?.hasTrailingIcon" label="Trailing Icon">
                <USelect placeholder="None" class="w-full" v-model="trailingIcon" :items="icons" />
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
                        :is="props.component" 
                        :color="color"
                        :size="size"
                        :loading="isLoading"
                        :trailingIcon="trailingIcon"
                        :variant="variant.value"
                        :ui="{[uiRootName]: getMergedClasses(variant.value, color, size)}"
                        v-bind="config?.staticProps"
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
            <UTabs :items="customizableTabs">
                <template #variants="{ item }">
                    <div 
                        v-for="variant in config?.variants" 
                        :key="variant"
                        class="mb-4"
                    >
                        <UFormField :label="variant">
                            <Combobox v-model="variantClasses[variant]" />
                        </UFormField>
                    </div>
                </template>
                <template #colors="{ item }">
                    <div 
                        v-for="color in colors" 
                        :key="color.value"
                        class="mb-4"
                    >
                        <UFormField :label="color.value">
                            <Combobox v-model="colorClasses[color.value]" />
                        </UFormField>
                    </div>
                </template>
                <template #sizes="{ item }">
                    <div 
                        v-for="size in sizes" 
                        :key="size"
                        class="mb-4"
                    >
                        <UFormField :label="size">
                            <Combobox v-model="sizeClasses[size]" />
                        </UFormField>
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
const componentConfigs = useComponentPreviewConfig()
const props = defineProps({
  component: {
    type: String,
    required: true
  }
})
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
const config = computed(() => componentConfigs.componentConfigs[props.component])
const uiRootName = computed(() => config?.value?.ui?.[0] || 'base');
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
const trailingIcon = ref('')
const variantClasses = ref<Record<string, string>>({})
const colorClasses = ref<Record<string, string>>({})
const sizeClasses = ref<Record<string, string>>({})
const icons = useTailwindIcons()

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
                typeof classes === 'string' ? classes.split(' ') : Array.isArray(classes) ? classes : []
            )
        }
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
                typeof classes === 'string' ? classes.split(' ') : Array.isArray(classes) ? classes : []
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
                typeof classes === 'string' ? classes.split(' ') : Array.isArray(classes) ? classes : []
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
        })
    }
})

const getMergedClasses = (variant: string, color: string, size: string) => {
    return twMerge(
        sizeClasses.value[size],
        colorClasses.value[color],
        variantClasses.value[variant],
    )
}
</script>