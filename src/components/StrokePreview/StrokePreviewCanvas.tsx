import { useRef, useEffect, useCallback, useState } from 'react'
import { Play, Trash2, Undo2, Download } from 'lucide-react'
import { useBrushTipStore } from '../../stores/brushTipStore'
import { useStore } from '../../stores/useStore'
import { readTexture } from '../../hooks/useWebGLCanvas'
import { readTip } from '../../hooks/useWebGLBrushTip'
import { BrushStrokeRenderer, type StrokePoint } from '../../utils/brushStrokeRenderer'
import { exportStrokePNG } from '../../utils/export'

const AUTO_STROKE_POINTS: StrokePoint[] = [
  { x: 100, y: 180, pressure: 0.3 },
  { x: 120, y: 170, pressure: 0.5 },
  { x: 150, y: 155, pressure: 0.8 },
  { x: 200, y: 145, pressure: 1.0 },
  { x: 260, y: 140, pressure: 1.0 },
  { x: 320, y: 145, pressure: 0.9 },
  { x: 370, y: 155, pressure: 0.7 },
  { x: 400, y: 170, pressure: 0.5 },
  { x: 420, y: 190, pressure: 0.3 },
  { x: 430, y: 210, pressure: 0.2 },
]

export function StrokePreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<BrushStrokeRenderer | null>(null)
  const pointsRef = useRef<StrokePoint[]>([])
  const drawingRef = useRef(false)
  const [pressure, setPressure] = useState(1.0)
  const [history, setHistory] = useState<number>(0)
  const historyRef = useRef<ImageData[]>([])
  const [initialized, setInitialized] = useState(false)

  const settings = useBrushTipStore()

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(dpr, dpr)
    }

    if (!rendererRef.current) {
      rendererRef.current = new BrushStrokeRenderer(canvas)
      setInitialized(true)
    }
  }, [])

  useEffect(() => {
    setupCanvas()
    const onResize = () => setupCanvas()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [setupCanvas])

  useEffect(() => {
    if (!initialized || !rendererRef.current) return
    const renderer = rendererRef.current
    readTip(128, 128).then((url) => {
      if (url) {
        renderer.updateTip(url)
      } else {
        const tempCanvas = document.createElement('canvas')
        tempCanvas.width = 128
        tempCanvas.height = 128
        const tempCtx = tempCanvas.getContext('2d')!
        tempCtx.fillStyle = 'white'
        tempCtx.beginPath()
        tempCtx.arc(64, 64, 60, 0, Math.PI * 2)
        tempCtx.fill()
        renderer.setTipFromCanvas(tempCanvas)
      }
    })
  }, [initialized, settings.shape, settings.diameter, settings.hardness, settings.roundness, settings.angle])

  const textureType = useStore((s) => s.textureType)
  const textureParams = useStore((s) => s.params)

  useEffect(() => {
    if (!initialized || !rendererRef.current) return
    readTexture(512, 512).then((url) => {
      if (!url) return
      const img = new Image()
      img.onload = () => {
        const texCanvas = document.createElement('canvas')
        texCanvas.width = 512
        texCanvas.height = 512
        const texCtx = texCanvas.getContext('2d')!
        texCtx.drawImage(img, 0, 0)
        rendererRef.current?.setTexture(texCanvas)
      }
      img.src = url
    })
  }, [initialized, textureType, textureParams])

  const saveState = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const state = ctx.getImageData(0, 0, canvas.width, canvas.height)
    historyRef.current.push(state)
    if (historyRef.current.length > 20) historyRef.current.shift()
    setHistory(historyRef.current.length)
  }, [])

  const undo = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const state = historyRef.current.pop()
    if (!state) return
    ctx.putImageData(state, 0, 0)
    setHistory(historyRef.current.length)
  }, [])

  const clear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    saveState()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }, [saveState])

  const renderStroke = useCallback((points: StrokePoint[]) => {
    const renderer = rendererRef.current
    const canvas = canvasRef.current
    if (!renderer || !canvas) return
    renderer.renderStroke(points, settings)
  }, [settings])

  const autoStroke = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const offsetX = rect.left
    const offsetY = rect.top
    saveState()
    const scaled = AUTO_STROKE_POINTS.map((p) => ({
      ...p,
      x: p.x + offsetX,
      y: p.y + offsetY,
    }))
    renderStroke(scaled)
  }, [saveState, renderStroke])

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      drawingRef.current = true
      pointsRef.current = [{ x: e.clientX, y: e.clientY, pressure: e.pressure || pressure }]
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [pressure]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!drawingRef.current) return
      pointsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        pressure: e.pressure || pressure,
      })
    },
    [pressure]
  )

  const handlePointerUp = useCallback(() => {
    if (!drawingRef.current) return
    drawingRef.current = false
    if (pointsRef.current.length < 2) return
    saveState()
    renderStroke(pointsRef.current)
    pointsRef.current = []
  }, [saveState, renderStroke])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault()
      undo()
    }
  }, [undo])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const downloadStroke = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    exportStrokePNG(canvas)
  }, [])

  return (
    <div className="flex flex-col gap-3 flex-1">
      <div ref={containerRef} className="h-[384px]">
        <canvas
          ref={canvasRef}
          className="w-full h-full bg-[#1A1A24] rounded-xl border border-white/10 cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          data-stroke-canvas="true"
        />
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={autoStroke}
          className="bg-white/5 text-gray-200 border border-white/5 rounded-lg px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5"
        >
          <Play className="w-3.5 h-3.5" />
          Auto Stroke
        </button>
        <button
          onClick={clear}
          className="bg-white/5 text-gray-200 border border-white/5 rounded-lg px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear
        </button>
        <button
          onClick={undo}
          disabled={history === 0}
          className="bg-white/5 text-gray-200 border border-white/5 rounded-lg px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-3.5 h-3.5" />
          Undo
        </button>
        <button
          onClick={downloadStroke}
          className="bg-white/5 text-gray-200 border border-white/5 rounded-lg px-3 py-1.5 text-xs hover:bg-white/10 transition-colors flex items-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Save PNG
        </button>
      </div>
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs text-gray-400">Simulate Pressure</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={pressure}
          onChange={(e) => setPressure(parseFloat(e.target.value))}
          className="w-32 accent-orange-500 h-1"
        />
        <span className="text-xs font-mono text-gray-200 w-8 text-right tabular-nums">
          {pressure.toFixed(2)}
        </span>
      </div>
    </div>
  )
}
