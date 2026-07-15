import { useRef, useCallback, useState } from 'react'
import { useBrushTipStore } from '../../stores/brushTipStore'

export function AnglePicker() {
  const angle = useBrushTipStore((s) => s.angle)
  const setAngle = useBrushTipStore((s) => s.setAngle)
  const ref = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = clientX - cx
      const dy = clientY - cy
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI
      setAngle(Math.round(deg))
    },
    [setAngle]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragging(true)
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      handleMove(e.clientX, e.clientY)
    },
    [handleMove]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return
      handleMove(e.clientX, e.clientY)
    },
    [dragging, handleMove]
  )

  const handlePointerUp = useCallback(() => {
    setDragging(false)
  }, [])

  const rad = ((angle + 90) * Math.PI) / 180
  const handleX = 50 + 40 * Math.cos(rad)
  const handleY = 50 + 40 * Math.sin(rad)

  return (
    <div className="flex items-center gap-2">
      <div
        ref={ref}
        className="relative w-12 h-12 rounded-full border border-white/10 cursor-pointer shrink-0"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      >
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from ${-90}deg, rgba(249,115,22,0.2) ${((angle + 180) % 360)}deg, transparent ${((angle + 180) % 360)}deg)`,
          }}
        />
        <div
          className="absolute w-2.5 h-2.5 bg-orange-500 rounded-full shadow-lg -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform"
          style={{
            left: `${handleX}%`,
            top: `${handleY}%`,
            transform: `translate(-50%, -50%) scale(${dragging ? 1.25 : 1})`,
          }}
        />
      </div>
      <span className="text-xs font-mono text-gray-400 w-10 text-right tabular-nums">
        {angle}°
      </span>
    </div>
  )
}
