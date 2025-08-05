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
                        ref="dynamicComponent" 
                        :color="color"
                        :size="size"
                        :loading="isLoading"
                        :trailingIcon="trailingIcon"
                        :variant="variant.value"
                        :ui="{base: variantClasses[variant.value]}"
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
            <div v-for="variant in config?.variants" 
            :key="variant">
                <UFormField :label="variant">
                    <UInput class="w-full" v-model="variantClasses[variant]" />
                </UFormField>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useThemeStore, type ThemeVariable } from '~/store/theme'

const themeStore = useThemeStore()
const componentConfigs = useComponentPreviewConfig()
const props = defineProps({
  component: {
    type: String,
    required: true
  }
})
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
const config = computed(() => componentConfigs.componentConfigs[props.component])
const variant = ref('solid')
const color = ref<ThemeVariable>('primary')
const size = ref('md')
const dynamicComponent = ref(null);
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
const icons = useTailwindIcons()


</script>