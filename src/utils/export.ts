import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { TextureType, TextureParams } from '../types'
import type { BrushTipState } from '../stores/brushTipStore'

export interface CombinedExportData {
  version: string
  app: string
  tip: {
    shape: string
    diameter: number
    hardness: number
    roundness: number
    angle: number
    spacing: number
    procedural?: {
      noiseType: string
      noiseAmount: number
      noiseScale: number
      seed: number
      threshold: number
      smoothing: number
    }
  }
  dynamics: {
    shapeDynamics: BrushTipState['shapeDynamics']
    scattering: BrushTipState['scattering']
    transfer: BrushTipState['transfer']
  }
  texture: {
    type: TextureType
    parameters: Record<string, number>
  }
}

function generatePlist(params: TextureParams): string {
  const size = 'size' in params ? params.size : 0.5
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>paintSize</key>
    <real>${size}</real>
    <key>plotSpacing</key>
    <real>0.2</real>
    <key>plotJitter</key>
    <real>0.0</real>
    <key>shapeRotation</key>
    <real>0.0</real>
    <key>paintOpacity</key>
    <real>1.0</real>
    <key>dynamicsGlazeFlow</key>
    <real>1.0</real>
</dict>
</plist>`
}

function generateMeta(type: TextureType, params: TextureParams): string {
  return JSON.stringify({
    version: '1.0',
    type,
    params,
    createdAt: new Date().toISOString(),
    generator: 'BrushSpark',
  }, null, 2)
}

function canvasToGrayscaleInverted(canvas: HTMLCanvasElement): ImageData {
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const d = imageData.data
  for (let i = 0; i < d.length; i += 4) {
    const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]
    const inverted = 255 - Math.round(gray)
    d[i] = inverted
    d[i + 1] = inverted
    d[i + 2] = inverted
  }
  return imageData
}

function createThumbnail(canvas: HTMLCanvasElement, maxSize: number): Promise<Blob> {
  const scale = Math.min(maxSize / canvas.width, maxSize / canvas.height, 1)
  const w = Math.round(canvas.width * scale)
  const h = Math.round(canvas.height * scale)
  const offscreen = document.createElement('canvas')
  offscreen.width = w
  offscreen.height = h
  const ctx = offscreen.getContext('2d')!
  ctx.drawImage(canvas, 0, 0, w, h)
  return new Promise((resolve) => offscreen.toBlob((b) => resolve(b!), 'image/png'))
}

export async function exportPNG(
  canvas: HTMLCanvasElement,
  type: TextureType,
  seed: number,
  resolution: number,
  onProgress?: (pct: number) => void,
): Promise<void> {
  onProgress?.(0)
  await new Promise((r) => setTimeout(r, 50))
  onProgress?.(0.5)
  canvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, `brushspark_${type}_${seed}_${resolution}.png`)
    }
    onProgress?.(1)
  }, 'image/png')
}

export async function exportCombinedPNG(
  canvas: HTMLCanvasElement,
  tipCanvas: HTMLCanvasElement,
  type: TextureType,
  seed: number,
  resolution: number,
  onProgress?: (pct: number) => void,
): Promise<void> {
  onProgress?.(0)
  const combined = document.createElement('canvas')
  combined.width = resolution
  combined.height = resolution
  const ctx = combined.getContext('2d')!

  ctx.drawImage(canvas, 0, 0, resolution, resolution)
  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(tipCanvas, 0, 0, resolution, resolution)
  ctx.globalCompositeOperation = 'source-over'

  onProgress?.(0.5)
  combined.toBlob((blob) => {
    if (blob) {
      saveAs(blob, `brushspark_${type}_${seed}_${resolution}.png`)
    }
    onProgress?.(1)
  }, 'image/png')
}

export async function exportProcreate(
  canvas: HTMLCanvasElement,
  type: TextureType,
  params: TextureParams,
  seed: number,
  resolution: number,
  onProgress?: (pct: number) => void,
): Promise<void> {
  onProgress?.(0.1)

  const pngBlob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
  if (!pngBlob) return
  onProgress?.(0.3)

  const grainCanvas = document.createElement('canvas')
  grainCanvas.width = canvas.width
  grainCanvas.height = canvas.height
  const gctx = grainCanvas.getContext('2d')!
  gctx.putImageData(canvasToGrayscaleInverted(canvas), 0, 0)

  const grainBlob = await new Promise<Blob | null>((resolve) => {
    grainCanvas.toBlob((blob) => resolve(blob), 'image/png')
  })
  if (!grainBlob) return
  onProgress?.(0.5)

  const thumbBlob = await createThumbnail(canvas, 256)
  onProgress?.(0.7)

  const zip = new JSZip()
  zip.file('brush.png', pngBlob)
  zip.file('Grain.png', grainBlob)
  zip.file('QuickLook/Thumbnail.png', thumbBlob)
  zip.file('brush.plist', generatePlist(params))
  zip.file('brush.meta', generateMeta(type, params))

  onProgress?.(0.85)
  const content = await zip.generateAsync({ type: 'blob' })
  onProgress?.(0.95)
  saveAs(content, `brushspark_${type}_${seed}_${resolution}.brush`)
  onProgress?.(1)
}

export async function exportProcreateCombined(
  textureCanvas: HTMLCanvasElement,
  tipCanvas: HTMLCanvasElement,
  type: TextureType,
  params: TextureParams,
  seed: number,
  resolution: number,
  onProgress?: (pct: number) => void,
): Promise<void> {
  onProgress?.(0.1)

  const combined = document.createElement('canvas')
  combined.width = resolution
  combined.height = resolution
  const ctx = combined.getContext('2d')!
  ctx.drawImage(textureCanvas, 0, 0, resolution, resolution)
  ctx.globalCompositeOperation = 'multiply'
  ctx.drawImage(tipCanvas, 0, 0, resolution, resolution)
  ctx.globalCompositeOperation = 'source-over'

  const pngBlob = await new Promise<Blob | null>((resolve) => {
    combined.toBlob((blob) => resolve(blob), 'image/png')
  })
  if (!pngBlob) return
  onProgress?.(0.3)

  const tipGrayscale = document.createElement('canvas')
  tipGrayscale.width = resolution
  tipGrayscale.height = resolution
  const tgctx = tipGrayscale.getContext('2d')!
  tgctx.drawImage(tipCanvas, 0, 0, resolution, resolution)
  const grainBlob = await new Promise<Blob | null>((resolve) => {
    tgctx.canvas.toBlob((blob) => resolve(blob), 'image/png')
  })
  if (!grainBlob) return
  onProgress?.(0.5)

  const thumbBlob = await createThumbnail(combined, 256)
  onProgress?.(0.7)

  const zip = new JSZip()
  zip.file('brush.png', pngBlob)
  zip.file('Grain.png', grainBlob)
  zip.file('QuickLook/Thumbnail.png', thumbBlob)
  zip.file('brush.plist', generatePlist(params))
  zip.file('brush.meta', generateMeta(type, params))

  onProgress?.(0.85)
  const content = await zip.generateAsync({ type: 'blob' })
  onProgress?.(0.95)
  saveAs(content, `brushspark_${type}_${seed}_${resolution}.brush`)
  onProgress?.(1)
}

function buildABRv2(canvas: HTMLCanvasElement): Uint8Array {
  const width = canvas.width
  const height = canvas.height
  const ctx = canvas.getContext('2d')!
  const imageData = ctx.getImageData(0, 0, width, height)
  const rgba = imageData.data
  const grayscale = new Uint8Array(width * height)
  for (let i = 0; i < width * height; i++) {
    const r = rgba[i * 4], g = rgba[i * 4 + 1], b = rgba[i * 4 + 2]
    grayscale[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
  }

  const pixelDataSize = width * height
  const name = 'BrushSpark'
  const encoder = new TextEncoder()
  const nameUtf16 = encoder.encode(name)
  const BRUSH_OVERHEAD = 2 + 4 + 4 + 2 + 4 + nameUtf16.length * 2 + 1 + 8 + 16 + 2 + 1
  const brushSize = BRUSH_OVERHEAD + pixelDataSize
  const totalSize = 2 + 2 + brushSize
  const ab = new ArrayBuffer(totalSize)
  const buf = new Uint8Array(ab)
  const dv = new DataView(ab)

  let o = 0
  dv.setUint16(o, 2); o += 2
  dv.setUint16(o, 1); o += 2
  dv.setUint16(o, 2); o += 2
  dv.setUint32(o, brushSize); o += 4
  dv.setUint32(o, 0); o += 4
  dv.setUint16(o, 250); o += 2
  const nameLen = name.length
  dv.setUint32(o, nameLen); o += 4
  for (let i = 0; i < nameLen; i++) {
    dv.setUint16(o, name.charCodeAt(i)); o += 2
  }
  dv.setUint8(o, 1); o += 1
  dv.setUint16(o, 0); o += 2
  dv.setUint16(o, 0); o += 2
  dv.setUint16(o, height); o += 2
  dv.setUint16(o, width); o += 2
  dv.setUint32(o, 0); o += 4
  dv.setUint32(o, 0); o += 4
  dv.setUint32(o, height); o += 4
  dv.setUint32(o, width); o += 4
  dv.setUint16(o, 8); o += 2
  dv.setUint8(o, 0); o += 1
  buf.set(grayscale, o)
  return buf
}

export async function exportABR(
  canvas: HTMLCanvasElement,
  type: TextureType,
  seed: number,
  resolution: number,
  onProgress?: (pct: number) => void,
): Promise<void> {
  onProgress?.(0.1)
  await new Promise((r) => setTimeout(r, 50))
  onProgress?.(0.3)
  const data = buildABRv2(canvas)
  onProgress?.(0.7)
  const blob = new Blob([data], { type: 'application/octet-stream' })
  onProgress?.(0.9)
  saveAs(blob, `brushspark_${type}_${seed}_${resolution}.abr`)
  onProgress?.(1)
}

export async function exportTipABR(
  tipCanvas: HTMLCanvasElement,
  resolution: number,
  onProgress?: (pct: number) => void,
): Promise<void> {
  onProgress?.(0.1)
  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, resolution, resolution)
  ctx.drawImage(tipCanvas, 0, 0, resolution, resolution)
  onProgress?.(0.3)
  const data = buildABRv2(canvas)
  onProgress?.(0.7)
  const blob = new Blob([data], { type: 'application/octet-stream' })
  onProgress?.(0.9)
  saveAs(blob, `brushspark_tip_${resolution}.abr`)
  onProgress?.(1)
}

export function exportBrushMeta(data: CombinedExportData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  saveAs(blob, `brushspark_${data.tip.shape}_${data.texture.type}.brushmeta`)
}

export async function exportStrokePNG(
  strokeCanvas: HTMLCanvasElement,
  onProgress?: (pct: number) => void,
): Promise<void> {
  onProgress?.(0)
  await new Promise((r) => setTimeout(r, 50))
  onProgress?.(0.5)
  strokeCanvas.toBlob((blob) => {
    if (blob) {
      saveAs(blob, `brushspark_stroke.png`)
    }
    onProgress?.(1)
  }, 'image/png')
}

export function exportPresetJSON(
  type: TextureType,
  params: TextureParams,
  name: string,
): void {
  const preset = {
    version: '1.0',
    name,
    type,
    params,
    createdAt: new Date().toISOString(),
  }
  const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' })
  saveAs(blob, `brushspark_preset_${name.replace(/\s+/g, '_')}.json`)
}
