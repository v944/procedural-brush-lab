import { useStore } from '../../stores/useStore'

export function Header() {
  const plan = useStore((s) => s.plan)
  const setShowPricing = useStore((s) => s.setShowPricing)

  return (
    <header className="h-14 bg-bg-header border-b border-white/5 flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-3">
        <img src="/favicon.png" alt="BrushSpark" className="w-9 h-9 rounded" />
        <span className="text-base font-bold text-gray-100">
          BrushSpark
        </span>
      </div>

      <div className="flex items-center gap-3">
        {plan === 'lifetime' ? (
          <span className="text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
            Lifetime
          </span>
        ) : plan === 'pro' ? (
          <span className="text-xs font-medium text-orange-400 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
            Pro
          </span>
        ) : (
          <button
            onClick={() => setShowPricing(true)}
            className="text-xs font-medium text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/5 hover:bg-white/10 hover:text-gray-200 cursor-pointer transition-colors"
          >
            Free — Upgrade
          </button>
        )}
      </div>
    </header>
  )
}
