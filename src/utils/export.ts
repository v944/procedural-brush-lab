import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { TextureType, TextureParams } from '../types'

function generatePlist(params: TextureParams): string {
  const size = 'size' in params ? params.size : 0.5
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Brush Size</key>
    <real>${size}</real>
    <key>Spacing</key>
    <real>0.2</real>
    <key>Scatter</key>
    <real>0.0</real>
    <key>Angle</key>
    <real>0.0</real>
    <key>Opacity</key>
    <real>1.0</real>
    <key>Flow</key>
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
    generator: 'Procedural Brush Lab',
  }, null, 2)
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
      saveAs(blob, `brushlab_${type}_${seed}_${resolution}.png`)
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
  onProgress?.(0.4)

  const zip = new JSZip()
  zip.file('brush.png', pngBlob)
  zip.file('brush.plist', generatePlist(params))
  zip.file('brush.meta', generateMeta(type, params))

  onProgress?.(0.7)
  const content = await zip.generateAsync({ type: 'blob' })
  onProgress?.(0.9)
  saveAs(content, `brushlab_${type}_${seed}_${resolution}.brush`)
  onProgress?.(1)
}

export async function exportABR(
  canvas: HTMLCanvasElement,
  type: TextureType,
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

  const pngData = await pngBlob.arrayBuffer()
  const width = canvas.width
  const height = canvas.height

  const abrHeader = new ArrayBuffer(30)
  const dv = new DataView(abrHeader)
  const encoder = new TextEncoder()

  // ABR signature
  const sig = encoder.encode('8BIM')
  for (let i = 0; i < 4; i++) dv.setUint8(i, sig[i])
  dv.setUint16(4, 1) // version
  dv.setUint16(6, 2) // sub-version
  dv.setUint32(8, 24 + pngData.byteLength) // length of sample section

  // sample section
  const sampleHeader = new ArrayBuffer(24)
  const sdv = new DataView(sampleHeader)
  for (let i = 0; i < 4; i++) sdv.setUint8(i, sig[i])
  sdv.setUint16(4, 19) // brush sample tag
  sdv.setUint32(8, 8 + pngData.byteLength) // sample length

  sdv.setUint32(12, width)
  sdv.setUint32(16, height)
  sdv.setUint16(20, 8) // depth
  sdv.setUint8(22, 3) // compression (RLE flag)

  const combined = new Uint8Array(abrHeader.byteLength + sampleHeader.byteLength + pngData.byteLength)
  combined.set(new Uint8Array(abrHeader), 0)
  combined.set(new Uint8Array(sampleHeader), abrHeader.byteLength)
  combined.set(new Uint8Array(pngData), abrHeader.byteLength + sampleHeader.byteLength)

  onProgress?.(0.7)
  const blob = new Blob([combined], { type: 'application/octet-stream' })
  onProgress?.(0.9)
  saveAs(blob, `brushlab_${type}_${seed}_${resolution}.abr`)
  onProgress?.(1)
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
  saveAs(blob, `brushlab_preset_${name.replace(/\s+/g, '_')}.json`)
}
