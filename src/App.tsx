import { Header } from './components/Layout/Header'
import { Layout } from './components/Layout/Layout'
import { PreviewCanvas } from './components/Canvas/PreviewCanvas'
import { BrushPreview } from './components/Canvas/BrushPreview'
import { ParameterPanel } from './components/Panel/ParameterPanel'
import { ExportPanel } from './components/Panel/ExportPanel'
import { PresetPanel } from './components/Panel/PresetPanel'
import { TipPanel } from './components/Panel/TipPanel'

import { DynamicsPanel } from './components/Panel/DynamicsPanel'
import { ScatteringPanel } from './components/Panel/ScatteringPanel'
import { TransferPanel } from './components/Panel/TransferPanel'
import { BrushTipCanvas } from './components/BrushTip/BrushTipCanvas'
import { StrokePreviewCanvas } from './components/StrokePreview/StrokePreviewCanvas'
import { PaywallOverlay } from './components/UI/PaywallOverlay'
import { PricingModal } from './components/Pricing/PricingModal'
import { useStore } from './stores/useStore'

function App() {
  const showPricing = useStore((s) => s.showPricing)
  const setShowPricing = useStore((s) => s.setShowPricing)

  return (
    <>
      <Header />
      <Layout
        texturePreview={<PreviewCanvas />}
        textureSettings={
          <>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Texture</h2>
            <ParameterPanel />
            <div className="border-t border-white/5 pt-4 mt-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Export</h2>
              <ExportPanel />
            </div>
          </>
        }
        brushPreview={
          <div className="flex flex-row gap-4 w-full flex-1 items-start">
            <div className="flex-1 min-w-0 self-stretch flex flex-col">
              <StrokePreviewCanvas />
            </div>
            <div className="flex flex-col gap-4 shrink-0 mt-[32px]">
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Tip Preview</span>
                <BrushTipCanvas />
              </div>
              <div className="flex flex-col items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Texture Preview</span>
                <BrushPreview />
              </div>
            </div>
          </div>
        }
        brushSettings={
          <>
            <TipPanel />
            <DynamicsPanel />
            <ScatteringPanel />
            <TransferPanel />
            <div className="border-t border-white/5 pt-4 mt-4">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Presets</h2>
              <PresetPanel />
            </div>
          </>
        }
      />
      <PaywallOverlay />
      {showPricing && (
        <PricingModal tier="pro" onClose={() => setShowPricing(false)} />
      )}
    </>
  )
}

export default App
