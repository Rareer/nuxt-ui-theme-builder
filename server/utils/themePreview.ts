import type { H3Event } from 'h3'

// Types are intentionally loose to be resilient to snapshot format changes
export type Json = any

export interface ThemeSnapshot {
  name: string
  createdAt: string
  updatedAt: string
  colors?: any
  componentUiConfigs?: any
  theme: {
    mappings: {
      light?: Record<string, string | null>
      dark?: Record<string, string | null>
    }
    cssVariableMappings: {
      light?: Record<string, Json>
      dark?: Record<string, Json>
    }
  }
}

export interface PreviewOptions {
  mode?: 'light' | 'dark'
  width?: number
  height?: number
}

const SEMANTIC_KEYS = ['primary', 'secondary', 'success', 'info', 'warning', 'error', 'neutral'] as const

function parseColor(value?: string | null): string | undefined {
  if (!value) return undefined
  const v = String(value).trim()
  if (/^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i.test(v)) return v
  // rgb/rgba
  if (/^rgba?\(/i.test(v)) return v
  return undefined
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  if (!hex || !hex.startsWith('#')) return null
  let h = hex.slice(1)
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  if (h.length < 6) return null
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return { r, g, b }
}

function luminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  const srgb = [rgb.r, rgb.g, rgb.b].map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2]
}

function bestTextColor(bg: string): string {
  // WCAG recommended threshold ~0.179
  try {
    return luminance(bg) > 0.5 ? '#111111' : '#FFFFFF'
  } catch {
    return '#FFFFFF'
  }
}

function getSemanticSwatch(snapshot: ThemeSnapshot, key: string, mode: 'light' | 'dark'): string | undefined {
  // 1) Prefer explicit css variable mapping --ui-color-<key>-500
  const varKey = `--ui-color-${key}-500`
  const cssVars = (snapshot.theme?.cssVariableMappings?.[mode] || {}) as Record<string, any>
  const v = cssVars[varKey]
  const parsed = parseColor(typeof v === 'string' ? v : undefined)
  if (parsed) return parsed

  // 2) If semantic maps to a named color, find shade 500 from custom colors
  const mappedName = snapshot.theme?.mappings?.[mode]?.[key]
  if (mappedName && typeof mappedName === 'string' && snapshot.colors) {
    const colors = snapshot.colors?.colors || snapshot.colors // tolerate different shapes
    const found = colors?.find?.((c: any) => (c?.name || c?.key || '').toLowerCase() === mappedName.toLowerCase())
    const shade500 = found?.values?.['500'] || found?.values?.[500]
    const parsedShade = parseColor(typeof shade500 === 'string' ? shade500 : undefined)
    if (parsedShade) return parsedShade
    // Also try css variable form --color-<name>-500
    const cssVarAlt = cssVars[`--color-${String(mappedName).toLowerCase()}-500`]
    const parsedCssVarAlt = parseColor(typeof cssVarAlt === 'string' ? cssVarAlt : undefined)
    if (parsedCssVarAlt) return parsedCssVarAlt
  }

  // 3) Fallbacks from css variables like --ui-primary, --ui-primary-500
  const aliases = [
    `--ui-${key}-500`,
    `--ui-${key}`,
  ]
  for (const k of aliases) {
    const val = cssVars[k]
    const parsedAlias = parseColor(typeof val === 'string' ? val : undefined)
    if (parsedAlias) return parsedAlias
  }

  return undefined
}

export function buildThemePreviewSVG(snapshot: ThemeSnapshot, opts: PreviewOptions = {}): string {
  const mode = opts.mode || 'light'
  const width = opts.width ?? 800
  const height = opts.height ?? 420

  // compute swatches
  const swatches = SEMANTIC_KEYS.map(key => ({ key, color: getSemanticSwatch(snapshot, key, mode) }))

  const bg = snapshot.theme?.cssVariableMappings?.[mode]?.['--ui-background']
  const bgColor = parseColor(typeof bg === 'string' ? bg : undefined) || '#0B1020'
  const fgColor = bestTextColor(bgColor)

  // layout params
  const padding = 24
  const cardW = width - padding * 2
  const headerH = 48
  const gap = 12
  const swatchH = 48

  // Sample button colors
  const primary = swatches.find(s => s.key === 'primary')?.color || '#4F46E5'
  const primaryText = bestTextColor(primary)

  const secondary = swatches.find(s => s.key === 'secondary')?.color || '#0EA5E9'
  const secondaryText = bestTextColor(secondary)

  const neutral = swatches.find(s => s.key === 'neutral')?.color || '#64748B'
  const neutralText = bestTextColor(neutral)

  // Build swatch items (no labels, only boxes)
  const swatchItems = swatches.map((s, i) => {
    const x = padding + i * ((cardW - (SEMANTIC_KEYS.length - 1) * gap) / SEMANTIC_KEYS.length + gap)
    const itemW = (cardW - (SEMANTIC_KEYS.length - 1) * gap) / SEMANTIC_KEYS.length
    const color = s.color || '#2D2D2D'
    return `
      <rect x="${x}" y="${padding + headerH + gap}" width="${itemW}" height="${swatchH}" rx="8" fill="${color}" />`
  }).join('\n')

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.25" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${bgColor}"/>
  <g>
    <rect x="${padding}" y="${padding}" width="${cardW}" height="${height - padding * 2}" rx="16" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.06)" />
    <!-- Headline -->
    <text x="${padding * 2}" y="${padding + 26}" font-family="Inter, ui-sans-serif" font-size="18" font-weight="600" fill="${fgColor}">${snapshot.name || 'Theme Preview'}</text>
    <!-- Swatches row without labels -->
    ${swatchItems}

    <!-- UI Samples -->
    <g transform="translate(${padding * 2}, ${padding + headerH + swatchH + gap * 2})">
      <!-- Button Primary (solid) -->
      <rect width="140" height="40" rx="10" fill="${primary}" filter="url(#shadow)" />
      <text x="70" y="26" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" font-weight="600" fill="${primaryText}">Primary</text>

      <!-- Button Secondary (ghost) -->
      <g transform="translate(160, 0)">
        <rect width="140" height="40" rx="10" fill="transparent" stroke="${secondary}" stroke-width="2" />
        <text x="70" y="26" text-anchor="middle" font-family="Inter, ui-sans-serif" font-size="14" font-weight="600" fill="${secondary}">Secondary</text>
      </g>

      <!-- Separator with vertical padding (py-4) -->
      <g transform="translate(0, 56)">
        <rect x="0" y="8" width="580" height="1.5" fill="rgba(255,255,255,0.12)" />
      </g>

      <!-- Card with title, content, footer -->
      <g transform="translate(0, 76)">
        <rect width="580" height="120" rx="12" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" />
        <text x="16" y="36" font-family="Inter, ui-sans-serif" font-size="14" font-weight="600" fill="${fgColor}">Card title</text>
        <text x="16" y="60" font-family="Inter, ui-sans-serif" font-size="12" fill="${fgColor}" opacity="0.85">Some content preview styled with your theme</text>
        <rect x="0" y="88" width="580" height="1" fill="rgba(255,255,255,0.08)" />
        <text x="16" y="108" font-family="Inter, ui-sans-serif" font-size="12" fill="${fgColor}" opacity="0.9">Footer</text>
      </g>
    </g>
  </g>
</svg>`

  return svg
}

export function svgToDataUrl(svg: string): string {
  const base64 = Buffer.from(svg, 'utf-8').toString('base64')
  return `data:image/svg+xml;base64,${base64}`
}

export function buildThemePreviewDataUrl(snapshot: ThemeSnapshot, opts: PreviewOptions = {}): string {
  const svg = buildThemePreviewSVG(snapshot, opts)
  return svgToDataUrl(svg)
}
