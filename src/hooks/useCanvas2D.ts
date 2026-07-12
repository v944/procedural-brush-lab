import { useRef, useEffect } from 'react'
import { renderNoise, renderGrunge, renderBristles, renderScales, renderCracks } from '../utils/noise2d'
import { setReadTexture2DFn } from './useWebGLCanvas'
import type { TextureType, TextureParams } from '../types'

const RENDERERS = {
  noise: renderNoise,
  grunge: renderGrunge,
  bristles: renderBristles,
  scales: renderScales,
  cracks: renderCracks,
}

export function useCanvas2D(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  textureType: TextureType,
  params: TextureParams,
  tileMode: boolean,
) {
  const lastParamsRef = useRef<TextureParams | null>(null)
  const lastTileModeRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    lastParamsRef.current = params
    lastTileModeRef.current = tileMode

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth * dpr
    const h = canvas.clientHeight * dpr
    canvas.width = w
    canvas.height = h

    ctx.clearRect(0, 0, w, h)

    const renderFn = RENDERERS[textureType]
    if (renderFn) {
      renderFn(ctx, w, h, params as any, tileMode)
    }

    setReadTexture2DFn(async (width: number, height: number) => {
      const c = canvasRef.current
      if (!c) return ''
      const tmp = document.createElement('canvas')
      tmp.width = width
      tmp.height = height
      const tCtx = tmp.getContext('2d')
      if (!tCtx) return ''

      const render = RENDERERS[textureType]
      if (render) {
        render(tCtx, width, height, lastParamsRef.current as any, lastTileModeRef.current)
      }
      return tmp.toDataURL('image/png')
    })
  }, [canvasRef, textureType, params, tileMode])
}
