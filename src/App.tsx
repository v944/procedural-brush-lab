import { Header } from './components/Layout/Header'
import { Layout } from './components/Layout/Layout'
import { PreviewCanvas } from './components/Canvas/PreviewCanvas'
import { BrushPreview } from './components/Canvas/BrushPreview'
import { ParameterPanel } from './components/Panel/ParameterPanel'
import { ExportPanel } from './components/Panel/ExportPanel'
import { PresetPanel } from './components/Panel/PresetPanel'
import { PaywallOverlay } from './components/UI/PaywallOverlay'

function App() {
  return (
    <>
      <Header />
      <Layout
        canvas={
          <div className="flex flex-col items-center gap-4">
            <PreviewCanvas />
            <BrushPreview />
          </div>
        }
        panel={
          <>
            <div className="bg-surface rounded-xl p-5 border border-border">
              <ParameterPanel />
            </div>
            <div className="bg-surface rounded-xl p-5 border border-border">
              <h2 className="text-sm font-semibold text-text-primary mb-4">Export</h2>
              <ExportPanel />
            </div>
            <div className="bg-surface rounded-xl p-5 border border-border">
              <h2 className="text-sm font-semibold text-text-primary mb-4">Presets</h2>
              <PresetPanel />
            </div>
          </>
        }
      />
      <PaywallOverlay />
    </>
  )
}

export default App
