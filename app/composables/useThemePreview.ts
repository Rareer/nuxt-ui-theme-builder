import { useFetch } from '#app'

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
      light?: Record<string, any>
      dark?: Record<string, any>
    }
  }
}

export function useThemePreview() {
  async function generate(snapshot: ThemeSnapshot, mode: 'light' | 'dark' = 'light'): Promise<string | undefined> {
    const { data, error } = await useFetch<{ ok: boolean; dataUrl?: string; error?: string }>(
      '/api/theme/preview',
      {
        method: 'POST',
        body: { snapshot, mode },
      },
    )
    if (error.value) return undefined
    return data.value?.dataUrl
  }

  return { generate }
}
