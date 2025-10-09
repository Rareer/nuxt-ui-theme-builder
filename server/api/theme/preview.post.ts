import { defineEventHandler, readBody, createError } from 'h3'
import { buildThemePreviewDataUrl, type ThemeSnapshot } from '../../utils/themePreview'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const snapshot = (body?.snapshot || body) as ThemeSnapshot
    const mode = (body?.mode as 'light' | 'dark' | undefined) || 'light'
    if (!snapshot || typeof snapshot !== 'object') {
      throw createError({ statusCode: 400, statusMessage: 'Missing snapshot' })
    }
    const dataUrl = buildThemePreviewDataUrl(snapshot, { mode })
    return { ok: true, dataUrl }
  } catch (e: any) {
    if (e?.statusCode) throw e
    return { ok: false, error: e?.message || 'Unexpected error' }
  }
})
