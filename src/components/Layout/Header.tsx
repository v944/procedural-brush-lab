import { useStore } from '../../stores/useStore'

export function Header() {
  const plan = useStore((s) => s.plan)
  const setShowPricing = useStore((s) => s.setShowPricing)

  return (
    <header className="h-20 border-b border-border flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-3">
        <img src="/favicon.png" alt="BrushSpark" className="w-14 h-14 rounded" />
        <span className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700 }}>
          BrushSpark
        </span>
      </div>

      <div className="flex items-center gap-4">
        {plan === 'lifetime' ? (
          <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full">
            Lifetime
          </span>
        ) : plan === 'pro' ? (
          <span className="text-xs font-medium text-success bg-success/10 px-3 py-1 rounded-full">
            Pro
          </span>
        ) : (
          <button
            onClick={() => setShowPricing(true)}
            className="text-xs font-medium text-text-muted bg-surface px-3 py-1 rounded-full border border-border hover:bg-surface-elevated hover:text-text-primary cursor-pointer transition-colors"
          >
            Free — Upgrade
          </button>
        )}
      </div>
    </header>
  )
}
