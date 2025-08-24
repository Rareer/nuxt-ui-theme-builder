<script setup lang="ts">
import { useFonts } from '../composables/useFonts'

const { currentFontLabel, fontGroups, fontModel, fontSearch, selectFont, resetFont } = useFonts()
</script>

<template>
  <div class="space-y-3">
    <div class="flex items-center justify-end">
      <UBadge color="neutral">--font-sans</UBadge>
    </div>
    <div class="border border-1 border-default rounded-lg p-4 mb-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-sm">{{ $t('fontSelector.current') }}</span>
          <UBadge color="neutral">{{ currentFontLabel || "'Public Sans'" }}</UBadge>
        </div>
        <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="soft" size="xs" title="Reset font" @click="resetFont" />
      </div>

      <UCommandPalette
        v-model="fontModel"
        :groups="fontGroups"
        :search-term="fontSearch"
        placeholder="Search font..."
        :multiple="false"
        @keydown.enter="selectFont(fontModel as string)"
        @update:search-term="(v: string) => (fontSearch = v)"
        @submit="selectFont(fontModel as string)"
        :ui="{ input: '[&>input]:h-9 [&>input]:text-sm', content: 'max-h-[220px] overflow-y-auto' }"
      >
        <template #empty>
          <div class="p-4 text-center text-sm text-gray-500">{{ $t('fontSelector.empty') }}</div>
        </template>
        <template #item="{ item }">
          <UButton block class="justify-start" color="neutral" variant="link" size="xs" @click="selectFont(item.value)">
            {{ item.label }}
          </UButton>
        </template>
      </UCommandPalette>
    </div>
  </div>
</template>
