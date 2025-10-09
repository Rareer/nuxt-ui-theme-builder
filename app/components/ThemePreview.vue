<template>
  <div class="theme-preview">
    <img
      v-if="src"
      :src="src"
      :alt="altText"
      :width="width"
      :height="height"
      class="w-full h-auto rounded-md border border-gray-200/50 dark:border-white/10 shadow-sm object-cover"
      loading="lazy"
      decoding="async"
    />
    <div v-else class="w-full aspect-[16/9] rounded-md border border-gray-200/50 dark:border-white/10 grid place-items-center text-xs text-gray-500">
      Vorschau wird generiert…
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ThemeSnapshot } from '../composables/useThemePreview'
import { useThemePreview } from '../composables/useThemePreview'
import { renderSnapshotToImage } from '@/utils/previewCapture.client'

const props = defineProps<{
  dataUrl?: string | null
  snapshot?: ThemeSnapshot | null
  mode?: 'light' | 'dark'
  width?: number
  height?: number
  alt?: string
  client?: boolean
}>()

const src = ref<string | undefined>(props.dataUrl || undefined)
const width = computed(() => props.width ?? 800)
const height = computed(() => props.height ?? 420)
const altText = computed(() => props.alt || 'Theme preview image')

const { generate } = useThemePreview()

async function ensurePreview() {
  if (props.dataUrl) {
    src.value = props.dataUrl || undefined
    return
  }
  if (props.snapshot) {
    // Prefer client-side capture when requested
    if (props.client) {
      try {
        const url = await renderSnapshotToImage({ snapshot: props.snapshot as any, mode: props.mode || 'light', width: width.value as number, height: height.value as number })
        if (url) {
          src.value = url
          return
        }
      } catch (e) {
        // fallback to server rendering
      }
    }
    const url = await generate(props.snapshot as any, props.mode || 'light')
    if (url) src.value = url
  }
}

watch(() => [props.dataUrl, props.snapshot, props.mode, props.client, width.value, height.value], ensurePreview, { immediate: true })
</script>

<style scoped>
.theme-preview {
  display: block;
}
</style>
