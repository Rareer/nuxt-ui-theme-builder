import { useColorsStore } from '../store/colors'
import { useThemeStore, type CssVariableMapping, type ThemeVariable } from '../store/theme'
import { useComponentConfigStore, type ComponentsConfig } from '../store/componentConfig'
import type { Color } from '../types/color'

export type ThemeImportPayload = {
  // Raw CSS string containing --ui-* variables
  css?: string
  // Custom colors to import
  colors?: Color[]
  // Theme variable -> color name mapping (e.g., { primary: 'blue' })
  themeMappings?: Partial<Record<ThemeVariable, string | null>>
  // Additional CSS variables (array or record)
  cssVariables?: CssVariableMapping[] | Record<string, CssVariableMapping>
  // Component configuration
  componentsConfig?: ComponentsConfig
  // Merge into current state (default: true). If false, existing state will be replaced.
  merge?: boolean
}

export type ThemeImportResult = {
  imported: {
    colors: number
    mappings: number
    cssVariables: number
    components: number
  }
  details: {
    colors: string[]
    mappings: Array<{ variable: ThemeVariable; color: string | null }>
    cssVariables: string[]
    components: string[]
  }
}

function normalizeColorName(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-')
}

function toArray<T>(val?: T[] | Record<string, T>): T[] {
  if (!val) return []
  if (Array.isArray(val)) return val
  return Object.values(val)
}

// Allowed Tailwind-like shade keys for colors
const SHADE_KEYS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
type ShadeKey = typeof SHADE_KEYS[number]

// Type guard to narrow a number into the union of valid shade keys
function isShadeKey(val: number): val is keyof Color['values'] {
  return (SHADE_KEYS as readonly number[]).includes(val)
}

// Extracts all CSS custom properties from a CSS string: --name: value;
function extractCssVariables(css: string): Record<string, string> {
  const map: Record<string, string> = {}
  const regex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g
  let m: RegExpExecArray | null
  while ((m = regex.exec(css)) !== null) {
    const name = m[1].trim()
    const value = m[2].trim()
    map[name] = value
  }
  return map
}

function buildColorsFromCssVars(vars: Record<string, string>): Color[] {
  // Matches: ui-color-<name>-<shade>
  const colorShadeRe = /^ui-color-([a-z0-9-]+)-(50|100|200|300|400|500|600|700|800|900|950)$/
  const byName: Record<string, Partial<Color['values']>> = {}

  Object.entries(vars).forEach(([key, value]) => {
    const m = colorShadeRe.exec(key)
    if (!m) return
    const name = m[1]
    // Convert captured shade (string) to a number and validate against allowed shade keys
    const shadeNum = Number(m[2])
    if (!isShadeKey(shadeNum)) return
    const shade: keyof Color['values'] = shadeNum
    byName[name] ||= {}
    byName[name][shade] = value
  })

  return Object.entries(byName).map(([name, values]) => ({
    name,
    values: {
      50: values[50] || '#ffffff',
      100: values[100] || '#fafafa',
      200: values[200] || '#e5e5e5',
      300: values[300] || '#d4d4d4',
      400: values[400] || '#a3a3a3',
      500: values[500] || '#737373',
      600: values[600] || '#525252',
      700: values[700] || '#404040',
      800: values[800] || '#262626',
      900: values[900] || '#171717',
      950: values[950] || '#0a0a0a',
    },
  }))
}

function buildThemeMappingsFromCssVars(vars: Record<string, string>): Partial<Record<ThemeVariable, string | null>> {
  // --ui-primary: var(--ui-color-<name>-500)
  const themeBaseRe = /^ui-(primary|secondary|success|info|warning|error)$/
  const colorRefRe = /^var\(--ui-color-([a-z0-9-]+)-(50|100|200|300|400|500|600|700|800|900|950)\)$/

  const mappings: Partial<Record<ThemeVariable, string | null>> = {}

  Object.entries(vars).forEach(([key, value]) => {
    const tm = themeBaseRe.exec(key)
    if (!tm) return
    const themeVar = tm[1] as ThemeVariable
    const cm = colorRefRe.exec(value)
    if (cm) {
      mappings[themeVar] = cm[1]
    } else {
      // Could be direct value. We cannot infer a color mapping; set null.
      mappings[themeVar] = null
    }
  })

  return mappings
}

function buildExtraCssVariableMappings(vars: Record<string, string>): CssVariableMapping[] {
  // Consider any "ui-*" that is NOT a color shade var and NOT a theme base var as extra CSS variable
  const excludedRe = /^(ui-color-[a-z0-9-]+-(50|100|200|300|400|500|600|700|800|900|950)|ui-(primary|secondary|success|info|warning|error)(-.+)?)$/
  const colorRefRe = /^var\(--ui-color-([a-z0-9-]+)-(50|100|200|300|400|500|600|700|800|900|950)\)$/

  const results: CssVariableMapping[] = []

  Object.entries(vars).forEach(([key, value]) => {
    if (excludedRe.test(key)) return
    // Only consider variables starting with ui-
    if (!key.startsWith('ui-')) return

    const match = colorRefRe.exec(value)
    if (match) {
      results.push({
        name: key,
        type: 'color-reference',
        value: `${match[1]}-${match[2]}`,
        label: key,
        category: 'Imported'
      })
    } else {
      results.push({
        name: key,
        type: 'direct-value',
        value,
        label: key,
        category: 'Imported'
      })
    }
  })

  return results
}

export function useThemeImport() {
  const colorsStore = useColorsStore()
  const themeStore = useThemeStore()
  const componentConfigStore = useComponentConfigStore()

  function resetStateForReplace() {
    // Replace mode: clear existing state
    colorsStore.$patch({ colors: [], selectedColor: null })
    // Clear mappings
    const clearedMappings = themeStore.getThemeVariables.reduce((acc, v) => {
      acc[v] = null
      return acc
    }, {} as Record<ThemeVariable, string | null>)
    themeStore.$patch({ mappings: clearedMappings, cssVariableMappings: {} })
    componentConfigStore.$patch({ componentsConfig: {} as ComponentsConfig })
  }

  function importColors(colors: Color[], merge = true): string[] {
    const added: string[] = []
    const existingNames = new Set(colorsStore.getColors.map(c => normalizeColorName(c.name)))

    colors.forEach(color => {
      const normalized = normalizeColorName(color.name)
      const colorObj: Color = { name: normalized, values: color.values }

      if (!merge) {
        colorsStore.addColor(colorObj)
        added.push(normalized)
        return
      }

      if (existingNames.has(normalized)) {
        // Update existing
        colorsStore.updateColor(colorObj)
      } else {
        colorsStore.addColor(colorObj)
        existingNames.add(normalized)
      }
      added.push(normalized)
    })

    return added
  }

  function importThemeMappings(mappings: Partial<Record<ThemeVariable, string | null>> | undefined) {
    const applied: Array<{ variable: ThemeVariable; color: string | null }> = []
    if (!mappings) return applied
    ;(Object.entries(mappings) as Array<[ThemeVariable, string | null]>).forEach(([variable, color]) => {
      themeStore.setMapping(variable, color ? normalizeColorName(color) : null)
      applied.push({ variable, color: color ? normalizeColorName(color) : null })
    })
    return applied
  }

  function importCssVariables(vars: CssVariableMapping[] | Record<string, CssVariableMapping> | undefined, merge = true): string[] {
    if (!vars) return []
    const list = toArray(vars)

    if (!merge) {
      themeStore.$patch({ cssVariableMappings: {} })
    }

    const names: string[] = []
    list.forEach(v => {
      // Ensure name has no leading --
      const clean: CssVariableMapping = { ...v, name: v.name.replace(/^--/, '') }
      themeStore.updateCssVariable(clean)
      names.push(clean.name)
    })
    return names
  }

  function importComponentsConfig(cfg: ComponentsConfig | undefined, merge = true): string[] {
    if (!cfg) return []
    if (!merge) {
      componentConfigStore.$patch({ componentsConfig: {} as ComponentsConfig })
    }
    componentConfigStore.importConfig(cfg)
    return Object.keys(cfg)
  }

  function importFromCss(css: string, merge = true) {
    const vars = extractCssVariables(css)

    // 1) Colors from --ui-color-*-<shade>
    const colors = buildColorsFromCssVars(vars)
    const colorNames = importColors(colors, merge)

    // 2) Theme mappings from --ui-primary etc.
    const mappings = buildThemeMappingsFromCssVars(vars)
    const appliedMappings = importThemeMappings(mappings)

    // 3) Additional CSS variables (ui-*)
    const extraCssVars = buildExtraCssVariableMappings(vars)
    const extraVarNames = importCssVariables(extraCssVars, merge)

    return {
      colorNames,
      appliedMappings,
      extraVarNames,
    }
  }

  async function importTheme(payload: ThemeImportPayload): Promise<ThemeImportResult> {
    const merge = payload.merge !== false

    if (!merge) resetStateForReplace()

    const summary: ThemeImportResult = {
      imported: { colors: 0, mappings: 0, cssVariables: 0, components: 0 },
      details: { colors: [], mappings: [], cssVariables: [], components: [] },
    }

    // Structured imports
    if (payload.colors?.length) {
      const names = importColors(payload.colors, merge)
      summary.imported.colors += names.length
      summary.details.colors.push(...names)
    }

    if (payload.themeMappings) {
      const applied = importThemeMappings(payload.themeMappings)
      summary.imported.mappings += applied.length
      summary.details.mappings.push(...applied)
    }

    if (payload.cssVariables) {
      const names = importCssVariables(payload.cssVariables, merge)
      summary.imported.cssVariables += names.length
      summary.details.cssVariables.push(...names)
    }

    if (payload.componentsConfig) {
      const comps = importComponentsConfig(payload.componentsConfig, merge)
      summary.imported.components += comps.length
      summary.details.components.push(...comps)
    }

    // CSS parsing import
    if (payload.css) {
      const res = importFromCss(payload.css, merge)
      summary.imported.colors += res.colorNames.length
      summary.details.colors.push(...res.colorNames)
      summary.imported.mappings += res.appliedMappings.length
      summary.details.mappings.push(...res.appliedMappings)
      summary.imported.cssVariables += res.extraVarNames.length
      summary.details.cssVariables.push(...res.extraVarNames)
    }

    return summary
  }

  return {
    importTheme,
  }
}
