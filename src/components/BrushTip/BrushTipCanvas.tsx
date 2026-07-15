import { useRef } from 'react'
import { useWebGLBrushTip } from '../../hooks/useWebGLBrushTip'
import { useBrushTipStore } from '../../stores/brushTipStore'

export function BrushTipCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useWebGLBrushTip(canvasRef)
  const angle = useBrushTipStore((s) => s.angle)
  const roundness = useBrushTipStore((s) => s.roundness)

  return (
    <div className="relative w-32 h-32 bg-[#1A1A24] rounded-xl border border-white/10 overflow-hidden shrink-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={128}
        height={128}
        data-brush-tip="true"
      />
      <div
        className="absolute top-1/2 left-1/2 w-[40%] h-px origin-left pointer-events-none"
        style={{
          background: 'rgba(249,115,22,0.6)',
          transform: `translateY(-0.5px) rotate(${angle}deg)`,
        }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-[60%] pointer-events-none"
        style={{
          border: '1px solid rgba(249,115,22,0.4)',
          borderRadius: '50%',
          aspectRatio: '1',
          transform: `translate(-50%, -50%) scaleY(${roundness})`,
        }}
      />
    </div>
  )
}
