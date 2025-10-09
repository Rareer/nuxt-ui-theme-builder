import { createApp, h, nextTick } from 'vue'
import type { SavedThemeSnapshot } from '@/store/savedThemes'
import ThemePreviewStage from '@/components/ThemePreviewStage.vue'
import * as htmlToImage from 'html-to-image'

export async function renderSnapshotToImage(params: {
  snapshot: SavedThemeSnapshot
  mode?: 'light' | 'dark'
  width?: number
  height?: number
  pixelRatio?: number
}): Promise<string> {
  const { snapshot, mode = 'light', width = 800, height = 420, pixelRatio = 2 } = params

  // Container offscreen
  const container = document.createElement('div')
  container.style.position = 'fixed'
  container.style.left = '-10000px'
  container.style.top = '0'
  container.style.pointerEvents = 'none'
  document.body.appendChild(container)

  // Mount temporary app with the preview stage
  const app = createApp({
    render() {
      return h(ThemePreviewStage as any, { snapshot, mode, width, height })
    },
  })
  app.mount(container)

  try {
    await nextTick()
    // Allow CSS to apply
    await new Promise((r) => setTimeout(r, 50))
    const dataUrl = await htmlToImage.toPng(container, {
      canvasWidth: width,
      canvasHeight: height,
      pixelRatio,
      width,
      height,
      style: { width: `${width}px`, height: `${height}px` },
    })
    return dataUrl
  } finally {
    try { app.unmount() } catch {}
    try { container.remove() } catch {}
  }
}
