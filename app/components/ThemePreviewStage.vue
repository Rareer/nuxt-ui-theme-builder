<script setup lang="ts">
import type { SavedThemeSnapshot } from '@/store/savedThemes'
import AutoUi from '@/components/AutoUi.vue'

const props = withDefaults(defineProps<{
  snapshot: SavedThemeSnapshot
  mode?: 'light' | 'dark'
  width?: number
  height?: number
}>(), {
  mode: 'light',
  width: 800,
  height: 420,
})

const SEMANTIC_KEYS = ['primary','secondary','success','info','warning','error','neutral'] as const

function parseColor(value?: string | null): string | undefined {
  if (!value) return undefined
  const v = String(value).trim()
  if (/^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(v)) return v
  if (/^rgba?\(/i.test(v)) return v
  return undefined
}

function resolveVarColor(val: string | undefined): string | undefined {
  if (!val || typeof val !== 'string') return undefined
  const m = val.match(/^var\(\s*--color-([a-z0-9-]+)-(\d{2,3})\s*\)$/i)
  if (!m) return undefined
  const [, name, shade] = m
  const colors = (props.snapshot as any)?.colors?.colors || (props.snapshot as any)?.colors
  const found = colors?.find?.((c: any) => (c?.name || c?.key || '').toLowerCase() === name.toLowerCase())
  const hex = found?.values?.[shade] || found?.values?.[Number(shade)]
  return typeof hex === 'string' ? hex : undefined
}

function getCssVarsForMode(): Record<string, string> {
  const mode = props.mode || 'light'
  const raw = (props.snapshot?.theme?.cssVariableMappings as any) || {}
  // Prefer per-mode object
  const src = (raw && typeof raw[mode] === 'object') ? raw[mode] : raw
  // Otherwise, gather all string values at top-level keys that look like CSS variables
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(src as Record<string, any>)) {
    if (!k.startsWith('--')) continue
    let val: any = v
    if (val && typeof val === 'object' && 'value' in val) val = (val as any).value
    if (typeof val === 'number') val = String(val)
    if (typeof val === 'string') {
      const resolved = resolveVarColor(val) || val
      out[k] = resolved
    }
  }
  return out
}

function getMappingsForMode(): Record<string, string | null> {
  const mode = props.mode || 'light'
  const m: any = props.snapshot?.theme?.mappings || {}
  if (m && typeof m[mode] === 'object') return m[mode] as Record<string, string | null>
  return m as Record<string, string | null>
}

function getColorForKey(key: string): string | undefined {
  const cssVars = getCssVarsForMode()
  // 1) --ui-color-<key>-500
  const raw1 = cssVars[`--ui-color-${key}-500`]
  const v1 = parseColor(raw1) || resolveVarColor(raw1)
  if (v1) return v1
  // 2) mapped named color shade 500
  const mapped = getMappingsForMode()?.[key]
  if (mapped && props.snapshot?.colors) {
    const colors = (props.snapshot as any).colors?.colors || (props.snapshot as any).colors
    const found = colors?.find?.((c: any) => (c?.name || c?.key || '').toLowerCase() === String(mapped).toLowerCase())
    const shade500 = found?.values?.['500'] || found?.values?.[500]
    const parsedShade = parseColor(typeof shade500 === 'string' ? shade500 : undefined)
    if (parsedShade) return parsedShade
    const raw2 = cssVars[`--color-${String(mapped).toLowerCase()}-500`]
    const v2 = parseColor(raw2) || resolveVarColor(raw2)
    if (v2) return v2
  }
  // 3) fallbacks
  const raw3a = cssVars[`--ui-${key}-500`]
  const raw3b = cssVars[`--ui-${key}`]
  const v3 = parseColor(raw3a) || resolveVarColor(raw3a) || parseColor(raw3b) || resolveVarColor(raw3b)
  if (v3) return v3
  return undefined
}

const styleVars = computed<Record<string,string>>(() => {
  const map = getCssVarsForMode()
  const out: Record<string,string> = {}
  for (const [k, v] of Object.entries(map)) {
    if (typeof v === 'string' && k.startsWith('--')) {
      // inline var() may not resolve; try to expand color vars
      const resolved = resolveVarColor(v) || v
      out[k] = resolved
    }
  }
  // Also inject semantic CSS variables for Nuxt UI usage
  for (const key of SEMANTIC_KEYS as unknown as string[]) {
    const c = getColorForKey(key)
    if (c) {
      out[`--ui-${key}-500`] = c
      out[`--ui-${key}`] = c
    }
  }
  return out
})
</script>

<template>
  <div
    class="preview-stage rounded-xl shadow-sm max-w-[100%]"
    :style="{ width: `${width}px`, height: `${height}px`, background: 'var(--ui-background)', padding: '24px', boxSizing: 'border-box', ...styleVars }"
  >
    <!-- Card backdrop -->
    <div class="rounded-2xl border" style="border-color: rgba(255,255,255,0.06); background: rgba(255,255,255,0.02); width: 100%; height: 100%; padding: 16px; box-sizing: border-box;">
      <!-- Headline -->
      <div class="text-sm font-semibold mb-3">{{ snapshot.name }}</div>

      <!-- Swatches row (no labels) -->
      <div class="grid grid-cols-7 gap-3 mb-4">
        <div v-for="key in SEMANTIC_KEYS" :key="key" class="rounded-md h-12" :style="{ background: getColorForKey(key) || '#2D2D2D' }" />
      </div>

      <!-- Buttons -->
      <div class="flex items-center gap-4 mb-4">
        <AutoUi>
          <UButton color="primary" variant="solid">Primary</UButton>
        </AutoUi>
        <AutoUi>
          <UButton color="secondary" variant="ghost">Secondary</UButton>
        </AutoUi>
      </div>

      <!-- Separator -->
      <USeparator class="my-4" />

      <!-- Card -->
      <AutoUi>
        <UCard>
          <template #header>Card title</template>
          <div class="text-sm opacity-85">Some content preview styled with your theme</div>
          <template #footer>Footer</template>
        </UCard>
      </AutoUi>
    </div>
  </div>
</template>
