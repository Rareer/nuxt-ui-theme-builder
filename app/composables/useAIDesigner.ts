import { useFetch } from '#app'

export type GenerateThemeResponse = {
  data?: any
  error?: string
}

export function useAIDesigner() {
  async function generateThemeFromPrompt(prompt: string, model?: string, apiKey?: string): Promise<GenerateThemeResponse> {
    try {
      const { data, error } = await useFetch('/api/generate-theme', {
        method: 'POST',
        body: { prompt, model },
        headers: apiKey ? { 'x-openai-key': apiKey } : undefined,
      })

      // unwrap
      const val = data.value as GenerateThemeResponse | undefined
      if (error.value) return { error: error.value?.message || 'Request failed' }
      if (!val) return { error: 'No response' }
      return val
    } catch (e: any) {
      return { error: e?.message || 'Unexpected error' }
    }
  }

  return { generateThemeFromPrompt }
}
