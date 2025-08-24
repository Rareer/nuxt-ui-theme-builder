import { computed, ref } from 'vue'
import { useThemeStore, type CssVariableMapping } from '../store/theme'
import { GOOGLE_FONTS } from '../constants/googleFonts'

export function useFonts() {
  const themeStore = useThemeStore()

  // Current font CSS variable mapping
  const fontVar = computed(() => themeStore.getCssVariable('font-sans'))

  const currentFontLabel = computed(() => {
    const v = fontVar.value?.value || ''
    const m = v.match(/'([^']+)'|"([^"]+)"/)
    return m ? (m[1] || (m[2] ?? '')) : v.split(',')[0]?.trim() || ''
  })

  const fontSearch = ref('')
  const fontModel = ref('')

  const fontGroups = computed(() => {
    const items = GOOGLE_FONTS.map(name => ({ label: name, value: name }))
    return [{ id: 'fonts', items }]
  })

  // We only expose Sans Serif options here, so the fallback is fixed
  function fallbackForSans(): string { return 'sans-serif' }

  function selectFont(family: string) {
    const fallback = fallbackForSans()
    const value = `'${family}', ${fallback}`
    const existing = themeStore.getCssVariable('font-sans')
    const next: CssVariableMapping = existing ? { ...existing, type: 'direct-value', value } : {
      name: 'font-sans', type: 'direct-value', value, label: 'Sans Font Family', category: 'Fonts',
    }
    themeStore.updateCssVariable(next)
    fontModel.value = family
  }

  function resetFont() {
    selectFont('Public Sans')
  }

  return {
    // Data
    fontVar,
    currentFontLabel,
    fontSearch,
    fontModel,
    fontGroups,

    // Actions
    selectFont,
    resetFont,

    // Expose font catalog
    GOOGLE_FONTS,
  }
}
