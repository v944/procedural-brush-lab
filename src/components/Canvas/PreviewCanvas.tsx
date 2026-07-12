import { useRef } from 'react'
import { useWebGLCanvas } from '../../hooks/useWebGLCanvas'
import { useCanvas2D } from '../../hooks/useCanvas2D'
import { useCanvasRenderer } from '../../hooks/useCanvasRenderer'
import { useStore } from '../../stores/useStore'
import { WarningBanner } from '../UI/WarningBanner'

function WebGLCanvas({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  const textureType = useStore((s) => s.textureType)
  const params = useStore((s) => s.params)
  const viewMode = useStore((s) => s.viewMode)
  const tileMode = viewMode === 'tile2x2'

  useWebGLCanvas(canvasRef, textureType, params, tileMode)
  return null
}

function Canvas2DFallback({ canvasRef }: { canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
  const textureType = useStore((s) => s.textureType)
  const params = useStore((s) => s.params)
  const viewMode = useStore((s) => s.viewMode)
  const tileMode = viewMode === 'tile2x2'

  useCanvas2D(canvasRef, textureType, params, tileMode)
  return null
}

export function PreviewCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewMode = useStore((s) => s.viewMode)
  const setViewMode = useStore((s) => s.setViewMode)
  const isWebGL2 = useCanvasRenderer()

  return (
    <div className="flex flex-col items-center gap-3">
      {!isWebGL2 && (
        <WarningBanner message="Your browser does not support WebGL2. Using simplified Canvas 2D rendering. For full functionality, update your browser." />
      )}

      <div className="w-[512px] h-[512px] max-w-full max-h-[60vh] bg-surface-elevated rounded-xl overflow-hidden border border-border">
        <canvas
          ref={canvasRef}
          data-preview-canvas
          className="w-full h-full"
          style={{ imageRendering: 'pixelated' }}
        />
      </div>

      {isWebGL2 ? <WebGLCanvas canvasRef={canvasRef} /> : <Canvas2DFallback canvasRef={canvasRef} />}

      <div className="flex gap-2">
        {(['single', 'tile2x2', 'brush'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-4 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              viewMode === mode
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary border border-border hover:bg-surface-elevated'
            }`}
          >
            {mode === 'single' ? 'Single' : mode === 'tile2x2' ? '2×2 Tile' : 'Brush Preview'}
          </button>
        ))}
      </div>
    </div>
  )
}
