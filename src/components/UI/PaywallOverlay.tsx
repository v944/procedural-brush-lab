import { useState } from 'react'
import { useStore } from '../../stores/useStore'
import { Modal } from './Modal'
import { Button } from './Button'
import { Lock } from 'lucide-react'
import { PricingModal } from '../Pricing/PricingModal'

export function PaywallOverlay() {
  const showPaywall = useStore((s) => s.showPaywall)
  const hidePaywall = useStore((s) => s.hidePaywall)
  const [pricingTier, setPricingTier] = useState<'pro' | 'lifetime' | null>(null)

  return (
    <>
      <Modal open={showPaywall} onClose={hidePaywall}>
        <div className="text-center space-y-6">
          <div className="w-12 h-12 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
            <Lock size={24} className="text-orange-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Pro Features</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Export to Procreate .brush</li>
              <li>• Export to Photoshop .abr</li>
              <li>• 4K resolution (4096×4096)</li>
              <li>• Unlimited presets</li>
              <li>• No watermark</li>
            </ul>
          </div>

          <div>
            <div className="text-xl font-bold text-gray-100">$10 USDT (TRC-20)</div>
            <div className="text-sm text-gray-400">or $30 for Lifetime</div>
          </div>

          <div className="space-y-2">
            <Button variant="primary" onClick={() => { hidePaywall(); setPricingTier('pro') }} className="w-full">
              Upgrade to Pro — $10
            </Button>
            <Button variant="secondary" onClick={() => { hidePaywall(); setPricingTier('lifetime') }} className="w-full">
              Lifetime — $30
            </Button>
            <Button variant="ghost" onClick={hidePaywall} className="w-full text-sm">
              Maybe later
            </Button>
          </div>
        </div>
      </Modal>

      {pricingTier && (
        <PricingModal tier={pricingTier} onClose={() => setPricingTier(null)} />
      )}
    </>
  )
}
