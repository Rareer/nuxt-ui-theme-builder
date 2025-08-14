<template>
  <aside class="h-full flex flex-col">
    <!-- Sidebar Header -->
    <NuxtLink to="/" class="h-16 px-4 flex items-center border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
      <UIcon name="i-heroicons-swatch-20-solid" class="text-primary-500 mr-2 text-xl" />
      <h2 class="font-bold text-lg">Theme Builder</h2> <UBadge class="ml-2" color="error" size="xs">Alpha</UBadge>
    </NuxtLink>
    
    <!-- Navigation Menu -->
    <div class="flex-1 p-2">
      <UNavigationMenu :items="items" orientation="vertical"/>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
const { availableComponents } = useComponentPreviewConfig()
const localePath = useLocalePath()

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Navigation',
      type: 'label'
    },
    {
      label: 'Startseite',
      icon: 'i-lucide-home',
      to: localePath('/')
    },
    {
      label: 'Globals',
      type: 'label'
    },
    {
      label: 'Custom Colors',
      icon: 'i-lucide-palette',
      to: localePath('/colors')
    },
    {
      label: 'Preview',
      icon: 'i-lucide-eye',
      to: localePath('/preview')
    },
    {
      label: 'Components',
      icon: 'i-lucide-square-code',
      children: availableComponents.map((component) => ({
        label: component.label,
        to: localePath(`/components/${component.value}`)
      }))
    },
  ],
])
</script>
