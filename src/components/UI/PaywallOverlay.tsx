import { useStore } from '../../stores/useStore'
import { Modal } from './Modal'
import { Button } from './Button'
import { Lock } from 'lucide-react'

export function PaywallOverlay() {
  const showPaywall = useStore((s) => s.showPaywall)
  const hidePaywall = useStore((s) => s.hidePaywall)
  const setPro = useStore((s) => s.setPro)

  const handleUpgrade = () => {
    setPro(true)
    hidePaywall()
  }

  return (
    <Modal open={showPaywall} onClose={hidePaywall}>
      <div className="text-center space-y-6">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Lock size={24} className="text-primary" />
        </div>

        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Pro Features</h3>
          <ul className="space-y-2 text-sm text-text-secondary">
            <li>• Export to Procreate .brush</li>
            <li>• Export to Photoshop .abr</li>
            <li>• 4K resolution (4096×4096)</li>
            <li>• Unlimited presets</li>
            <li>• No watermark</li>
          </ul>
        </div>

        <div>
          <div className="text-xl font-bold text-text-primary">$25 / year</div>
          <div className="text-sm text-text-muted">or $7 one-time</div>
        </div>

        <div className="space-y-2">
          <Button variant="primary" onClick={handleUpgrade} className="w-full">
            Upgrade to Pro
          </Button>
          <Button variant="ghost" onClick={hidePaywall} className="w-full text-sm">
            Maybe later
          </Button>
        </div>
      </div>
    </Modal>
  )
}
