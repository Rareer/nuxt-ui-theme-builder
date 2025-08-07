import { useThemeStore } from '../store/theme'
import { useColorsStore } from '../store/colors'

export function useThemeExport() {
  const themeStore = useThemeStore()
  const colorsStore = useColorsStore()
  const isExporting = ref(false)
  const exportError = ref<string | null>(null)

  /**
   * Export the current theme as a ZIP file containing main.css
   */
  const exportTheme = async (event?: MouseEvent): Promise<void> => {
    try {
      isExporting.value = true
      exportError.value = null

      // Get all theme CSS variables
      const themeVariables = themeStore.getThemeCssVariables
      
      // Get all custom colors
      const customColors = colorsStore.getColors
      
      // Get theme mappings (for app.config.ts)
      const themeMappings = themeStore.mappings

      // Call the server API to generate the ZIP file
      const response = await $fetch<{
        success: boolean;
        error?: string;
        zipContent?: string;
        filename?: string;
      }>('/api/export-theme', {
        method: 'POST',
        body: {
          themeVariables,
          customColors,
          themeMappings
        }
      })

      if (!response.success) {
        throw new Error(response.error || 'Failed to export theme')
      }

      // Create and download the ZIP file
      if (response.zipContent && response.filename) {
        downloadZipFile(response.zipContent, response.filename)
      }
      
      return
    } catch (error: unknown) {
      console.error('Error exporting theme:', error)
      exportError.value = error instanceof Error ? error.message : 'An unknown error occurred'
      return
    } finally {
      isExporting.value = false
    }
  }

  /**
   * Download the ZIP file as a blob
   */
  const downloadZipFile = (base64Content: string, filename: string) => {
    // Convert base64 to blob
    const byteCharacters = atob(base64Content)
    const byteArrays = []
    
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512)
      
      const byteNumbers = new Array(slice.length)
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i)
      }
      
      const byteArray = new Uint8Array(byteNumbers)
      byteArrays.push(byteArray)
    }
    
    const blob = new Blob(byteArrays, { type: 'application/zip' })
    
    // Create download link and trigger download
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    document.body.appendChild(link)
    link.click()
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(link.href)
      document.body.removeChild(link)
    }, 100)
  }

  return {
    exportTheme,
    isExporting,
    exportError
  }
}
