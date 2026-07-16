import { useRef, useEffect } from 'react'
import { useStore } from '../../stores/useStore'
import { readTexture } from '../../hooks/useWebGLCanvas'

export function BrushPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const params = useStore((s) => s.params)
  const textureType = useStore((s) => s.textureType)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 128 * (window.devicePixelRatio || 1)
    canvas.height = 128 * (window.devicePixelRatio || 1)
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
    ctx.clearRect(0, 0, 128, 128)

    readTexture(512, 512).then((url) => {
      if (!url) return
      const img = new Image()
      img.src = url
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 128, 128)
      }
    })
  }, [params, textureType])

  return (
    <canvas
      ref={canvasRef}
      className="w-32 h-32 bg-bg-surface rounded-xl border border-white/10"
    />
  )
}
