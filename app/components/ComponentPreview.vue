<template>
    <div class="flex gap-6">
        <div class="flex-1">
            <div>
                <h2 class="text-xl font-bold mb-6">{{ config?.name }}</h2>
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
        </div>
        <div class="flex-1 pl-6 border-l border-gray-200 dark:border-gray-800">
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
            <UTabs :items="customizableTabs" color="neutral">
                <template #variants="{ item }">
                    <div 
                        v-for="variant in config?.variants" 
                        :key="variant"
                        class="mb-4"
                    >
                        <UFormField :label="variant">
                            <Combobox :model-value="getKeyClasses('variants', variant)" @update:model-value="val => setKeyClasses('variants', variant, val)" />
                            <UButton 
                                size="xs" 
                                color="neutral" 
                                variant="ghost" 
                                icon="i-heroicons-chevron-down" 
                                :trailing="true" 
                                class="mt-2" 
                                @click="toggleExpanded('variants', variant)"
                                :label="isExpanded('variants', variant) ? 'Hide additional properties' : 'Show additional properties'"
                            />
                        </UFormField>
                        <div v-if="isExpanded('variants', variant)" class="pl-4 border-l-2 border-gray-200 mt-2 mb-4 space-y-4">
                            <div v-for="uiProp in uiProperties" :key="uiProp" v-show="uiProp !== uiRootName">
                                <UFormField :label="uiProp">
                                    <Combobox :model-value="getUiSlotClasses('variants', variant, uiProp)" @update:model-value="val => setUiSlotClasses('variants', variant, uiProp, val)" />
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
                            <Combobox :model-value="getKeyClasses('colors', color.value)" @update:model-value="val => setKeyClasses('colors', color.value, val)" />
                            <UButton 
                                size="xs" 
                                color="neutral" 
                                variant="ghost" 
                                icon="i-heroicons-chevron-down" 
                                :trailing="true" 
                                class="mt-2" 
                                @click="toggleExpanded('colors', color.value)"
                                :label="isExpanded('colors', color.value) ? 'Hide additional properties' : 'Show additional properties'"
                            />
                        </UFormField>
                        <div v-if="isExpanded('colors', color.value)" class="pl-4 border-l-2 border-gray-200 mt-2 mb-4 space-y-4">
                            <div v-for="uiProp in uiProperties" :key="uiProp" v-show="uiProp !== uiRootName">
                                <UFormField :label="uiProp">
                                    <Combobox :model-value="getUiSlotClasses('colors', color.value, uiProp)" @update:model-value="val => setUiSlotClasses('colors', color.value, uiProp, val)" />
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
                            <Combobox :model-value="getKeyClasses('sizes', size)" @update:model-value="val => setKeyClasses('sizes', size, val)" />
                            <UButton 
                                size="xs" 
                                color="neutral" 
                                variant="ghost" 
                                icon="i-heroicons-chevron-down" 
                                :trailing="true" 
                                class="mt-2" 
                                @click="toggleExpanded('sizes', size)"
                                :label="isExpanded('sizes', size) ? 'Hide additional properties' : 'Show additional properties'"
                            />
                        </UFormField>
                        <div v-if="isExpanded('sizes', size)" class="pl-4 border-l-2 border-gray-200 mt-2 mb-4 space-y-4">
                            <div v-for="uiProp in uiProperties" :key="uiProp" v-show="uiProp !== uiRootName">
                                <UFormField :label="uiProp">
                                    <Combobox :model-value="getUiSlotClasses('sizes', size, uiProp)" @update:model-value="val => setUiSlotClasses('sizes', size, uiProp, val)" />
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
import { useThemeStore } from '~/store/theme'
import { useComponentConfigStore } from '~/store/componentConfig'
import { useUiClasses } from '~/composables/useUiClasses'

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
const sizes = ref<string[]>(['xs', 'sm', 'md', 'lg', 'xl'])

const config = computed(() => componentConfigs.componentConfigs[props.component])
const uiRootName = computed<string>(() => config.value?.ui?.[0] || 'base');

const variant = ref('solid')
const color = ref<any>('primary')
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

// Use composable to manage UI classes and helpers
const {
  variantClasses,
  colorClasses,
  sizeClasses,
  uiPropertiesClasses,
  uiProperties,
  uiPropertyAccordionState,
  getUiPropertyClassesRef,
  updateUiPropertyClass,
  getMergedClassesForProperty,
  getMergedUiObject,
  toggleUiPropertyAccordion,
  // new generic helpers
  getKeyClasses,
  setKeyClasses,
  isExpanded,
  toggleExpanded,
  getUiSlotClasses,
  setUiSlotClasses,
  initialize,
  setupWatchers,
} = useUiClasses({
  component: computed(() => props.component),
  config,
  uiRootName,
  componentConfigStore,
  colors,
  sizes,
})

const customizableTabs = computed(() => {
    return config.value?.customizable.map((customizable) => {
        return {
            label: customizable.charAt(0).toUpperCase() + customizable.slice(1),
            value: customizable,
            slot: customizable
        }
    })
})

// Watchers are encapsulated in composable

// Initialize component configuration and load classes from the store on component mount
onMounted(() => {
  initialize()
  setupWatchers()
})

// All helper functions are provided by the composable
</script>