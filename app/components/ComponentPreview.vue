<template>
    <div class="w-full flex flex-col gap-6 items-center">
        <ThemePreview>
            <component :is="componentToRender" :variant="variant" :color="color" :size="size" />
        </ThemePreview>
        <div class="flex grow gap-2">
            <UFormField label="Variant">
                <USelect v-model="variant" :items="variants" />
            </UFormField>
            <UFormField label="Color">
                <USelect v-model="color" :items="colors" />
            </UFormField>
            <UFormField label="Size">
                <USelect v-model="size" :items="sizes" />
            </UFormField>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { useThemeStore, type ThemeVariable } from '~/store/theme'

const themeStore = useThemeStore()

const variant = ref('solid')
const color = ref<ThemeVariable>('primary')
const size = ref('md')

const variants = ref([
    {
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
    }
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

// Mapping from route names to component names
const componentMapping: { [key: string]: string } = {
  'button': 'UButton',
  // Add more mappings as needed
  // 'alert': 'UAlert',
  // 'badge': 'UBadge',
  // etc.
}

// Get the component name from the mapping or use the provided name directly
const componentName = computed(() => {
  return componentMapping[props.component] || props.component
})

// Dynamically import the component from the previews directory
const componentToRender = defineAsyncComponent(() => {
  try {
    return import(`~/components/previews/${componentName.value}.vue`)
  } catch (error) {
    console.error(`Failed to load component: ${componentName.value}`, error)
    return import('~/components/previews/UButton.vue') // Fallback component
  }
})
</script>