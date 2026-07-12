import { useRef, useEffect, useState, useCallback } from 'react'
import { useStore } from '../../stores/useStore'
import { readTexture } from '../../hooks/useWebGLCanvas'
import { Eraser } from 'lucide-react'

export function BrushPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textureImgRef = useRef<HTMLImageElement | null>(null)
  const isDrawing = useRef(false)
  const [isEmpty, setIsEmpty] = useState(true)
  const viewMode = useStore((s) => s.viewMode)
  const params = useStore((s) => s.params)
  const textureType = useStore((s) => s.textureType)

  useEffect(() => {
    if (viewMode !== 'brush') return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 256 * (window.devicePixelRatio || 1)
    canvas.height = 256 * (window.devicePixelRatio || 1)
    ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1)
    ctx.clearRect(0, 0, 256, 256)

    readTexture(512, 512).then((url) => {
      if (!url) return
      const img = new Image()
      img.src = url
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 256, 256)
        textureImgRef.current = img
        setIsEmpty(false)
      }
    })
  }, [viewMode, params, textureType])

  const getPos = useCallback((e: React.PointerEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return { x: 0, y: 0 }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const draw = useCallback((pos: { x: number; y: number }) => {
    const img = textureImgRef.current
    const canvas = canvasRef.current
    if (!img || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.save()
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 16, 0, Math.PI * 2)
    ctx.clip()
    ctx.drawImage(img, pos.x - 16, pos.y - 16, 32, 32, pos.x - 16, pos.y - 16, 32, 32)
    ctx.restore()
    setIsEmpty(false)
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isDrawing.current = true
    draw(getPos(e))
  }, [draw, getPos])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDrawing.current) return
    draw(getPos(e))
  }, [draw, getPos])

  const handlePointerUp = useCallback(() => {
    isDrawing.current = false
  }, [])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, 256, 256)
    setIsEmpty(true)
  }, [])

  if (viewMode !== 'brush') return null

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-xs font-medium text-text-secondary">Brush Preview</div>
      <canvas
        ref={canvasRef}
        className="w-[256px] h-[256px] bg-surface-elevated rounded-xl border border-border cursor-crosshair touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />
      <div className="flex gap-2">
        {!isEmpty && (
          <button
            onClick={clear}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-surface border border-border rounded-md text-text-secondary hover:bg-surface-elevated cursor-pointer"
          >
            <Eraser size={12} />
            Clear
          </button>
        )}
        <span className="text-xs text-text-muted">{isEmpty ? 'Click or drag to paint' : 'Draw with mouse/stylus'}</span>
      </div>
    </div>
  )
}
