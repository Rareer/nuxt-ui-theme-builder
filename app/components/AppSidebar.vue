<template>
  <aside class="h-full flex flex-col">
    <!-- Sidebar Header -->
    <div class="h-16 px-4 flex items-center border-b border-gray-200 dark:border-gray-800">
      <UIcon name="i-heroicons-swatch-20-solid" class="text-primary-500 mr-2 text-xl" />
      <h2 class="font-bold text-lg">Theme Builder</h2>
    </div>
    
    <!-- Navigation Menu -->
    <div class="flex-1 p-2">
      <UNavigationMenu :items="items" orientation="vertical"/>
    </div>
  </aside>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Globals',
      type: 'label'
    },
    {
      label: 'Colors',
      icon: 'i-lucide-book-open',
      to: '/colors'
    },
    {
      label: 'Components',
      type: 'label'
    },
    {
      label: 'Button',
      to: '/components/button'
    },
  ],
  [
    {
      label: 'GitHub',
      icon: 'i-simple-icons-github',
      badge: '3.8k',
      to: 'https://github.com/nuxt/ui',
      target: '_blank'
    },
    {
      label: 'Help',
      icon: 'i-lucide-circle-help',
      disabled: true
    }
  ]
])
</script>
