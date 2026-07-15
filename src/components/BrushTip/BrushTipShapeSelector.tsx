import { Circle, Square, CircleDot, SquareDot, Sparkles } from 'lucide-react'
import { useBrushTipStore, type BrushTipShape } from '../../stores/brushTipStore'
import { cn } from '../../lib/cn'

const SHAPES: { id: BrushTipShape; label: string; icon: typeof Circle }[] = [
  { id: 'round', label: 'Round', icon: Circle },
  { id: 'square', label: 'Square', icon: Square },
  { id: 'softRound', label: 'Sft R', icon: CircleDot },
  { id: 'softSquare', label: 'Sft S', icon: SquareDot },
  { id: 'procedural', label: 'Proc', icon: Sparkles },
]

export function BrushTipShapeSelector() {
  const shape = useBrushTipStore((s) => s.shape)
  const setShape = useBrushTipStore((s) => s.setShape)

  return (
    <div>
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">
        Brush Tip Shape
      </label>
      <div className="flex gap-2">
        {SHAPES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setShape(id)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 px-2 py-3 rounded-lg border text-xs font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D14]',
              shape === id
                ? 'bg-orange-500 text-black border-orange-500 shadow-[0_4px_15px_rgba(249,115,22,0.4)]'
                : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-gray-200'
            )}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider mt-0.5">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
