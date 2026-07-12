import { useStore } from '../../stores/useStore'
import { Sparkles } from 'lucide-react'

export function Header() {
  const isPro = useStore((s) => s.isPro)

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <Sparkles size={20} className="text-primary" />
        <span className="text-lg font-bold text-text-primary" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
          BrushLab
        </span>
      </div>

      <div className="flex items-center gap-4">
        {isPro ? (
          <span className="text-xs font-medium text-success bg-success/10 px-3 py-1 rounded-full">
            Pro
          </span>
        ) : (
          <span className="text-xs font-medium text-text-muted bg-surface px-3 py-1 rounded-full">
            Free
          </span>
        )}
      </div>
    </header>
  )
}
