<template>
    <div class="w-full flex flex-col gap-6 items-center">
        <ThemePreview>
            <component 
                :is="props.component" 
                ref="dynamicComponent" 
                v-bind="componentConfigs[props.component]"
            />
        </ThemePreview>
        <div class="flex grow gap-2">
            <UFormField v-if="componentConfigs[props.component].variant" label="Variant">
                <USelect v-model="variant" :items="componentConfigs[props.component].variants" />
            </UFormField>
            <UFormField v-if="componentConfigs[props.component].color" label="Color">
                <USelect v-model="color" :items="colors" />
            </UFormField>
            <UFormField v-if="componentConfigs[props.component].size" label="Size">
                <USelect v-model="size" :items="sizes" />
            </UFormField>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, reactive } from 'vue'
import { useThemeStore, type ThemeVariable } from '~/store/theme'

const themeStore = useThemeStore()

const variant = ref('solid')
const color = ref<ThemeVariable>('primary')
const size = ref('md')
const dynamicComponent = ref(null);
const variants = ref([
    
])
const colors = computed(() => {
    return Object.entries(themeStore.getThemeVariables).map(([key, value]) => {
        return {
            label: value,
            value: value
        }
    })
})

const sizes = ref([
    {
        label: 'Small',
        value: 'sm'
    },
    {
        label: 'Medium',
        value: 'md'
    },
    {
        label: 'Large',
        value: 'lg'
    }
])
const props = defineProps({
  component: {
    type: String,
    required: true
  }
})
const variantsSet01 = [{
        label: 'Solid',
        value: 'solid'
    },
    {
        label: 'Ghost',
        value: 'ghost'
    },
    {
        label: 'Soft',
        value: 'soft'
    },
    {
        label: 'Link',
        value: 'link'
    }]
const variantsSet02 = [
{
        label: 'Solid',
        value: 'solid'
    },
    {
        label: 'Outline',
        value: 'outline'
    },
    {
        label: 'Soft',
        value: 'soft'
    },
    {
        label: 'Subtle',
        value: 'subtle'
    }
]
const componentConfigs = computed<any>(() => ({
    UAccordion: {
        items: [
            {
                label: 'Icons',
                icon: 'i-lucide-smile',
                content: 'You have nothing to do, @nuxt/icon will handle it automatically.'
            },
            {
                label: 'Colors',
                icon: 'i-lucide-swatch-book',
                slot: 'colors' as const,
                content: 'Choose a primary and a neutral color from your Tailwind CSS theme.'
            },
            {
                label: 'Components',
                icon: 'i-lucide-box',
                content: 'You can customize components by using the `class` / `ui` props or in your app.config.ts.'
            }
        ]
    },
    UAlert: {
        color: color.value,
        variant: variant.value,
        variants: variantsSet02,
        title: 'Alert Title',
        description: 'Alert Description',
        icon: 'i-lucide-smile',
    },
    UButton: {
        variant: variant.value,
        variants: variantsSet01,
        color: color.value,
        size: size.value,
        label: 'Button',
    }
}));
</script>