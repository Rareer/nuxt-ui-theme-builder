<template>
  <aside class="h-full flex flex-col">
    <!-- Sidebar Header -->
    <NuxtLink to="/" class="h-16 px-4 flex items-center border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
      <UIcon name="i-heroicons-swatch-20-solid" class="text-primary-500 mr-2 text-xl" />
      <h2 class="font-bold text-lg">{{ $t('app.name') }}</h2> <UBadge class="ml-2" color="error" size="xs">Alpha</UBadge>
    </NuxtLink>
    
    <!-- Navigation Menu -->
    <div class="flex-1 p-2">
      <UNavigationMenu :items="items" orientation="vertical"/>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { NavigationMenuItem } from '@nuxt/ui'
import { useI18n } from 'vue-i18n'
const { availableComponents } = useComponentPreviewConfig()
const localePath = useLocalePath()
const { t } = useI18n()

const items = computed<NavigationMenuItem[][]>(() => [
  [
    {
      label: t('nav.navigation'),
      type: 'label'
    },
    {
      label: t('nav.home'),
      icon: 'i-lucide-home',
      to: localePath('/')
    },
    {
      label: t('nav.globals'),
      type: 'label'
    },
    {
      label: t('nav.customColors'),
      icon: 'i-lucide-palette',
      to: localePath('/colors')
    },
    {
      label: t('nav.preview'),
      icon: 'i-lucide-eye',
      to: localePath('/preview')
    },
    {
      label: t('nav.components'),
      icon: 'i-lucide-square-code',
      children: availableComponents.map((component) => ({
        label: component.label,
        to: localePath(`/components/${component.value}`)
      }))
    },
  ],
])
</script>
