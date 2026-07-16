import { type ReactNode, useState, useEffect } from 'react'
import { Settings, X } from 'lucide-react'

interface LayoutProps {
  texturePreview: ReactNode
  textureSettings: ReactNode
  brushPreview: ReactNode
  brushSettings: ReactNode
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export function Layout({ texturePreview, textureSettings, brushPreview, brushSettings }: LayoutProps) {
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)

  if (!isMobile) {
    return (
      <div className="flex-1 flex flex-row max-w-[1400px] mx-auto w-full bg-bg-page">
        <div className="flex-1 flex flex-col border-r border-white/5 min-w-0">
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Texture Preview</span>
            <div className="h-[480px] max-h-[55vh] flex flex-col items-center overflow-hidden">
              {texturePreview}
            </div>
          </div>
          <div className="border-t border-white/5 p-5 space-y-6">
            {textureSettings}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Stroke Preview</span>
            <div className="h-[480px] max-h-[55vh] flex flex-col overflow-hidden">
              {brushPreview}
            </div>
          </div>
          <div className="border-t border-white/5 p-5 space-y-6 overflow-y-auto">
            {brushSettings}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full bg-bg-page">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          {texturePreview}
        </div>
        <div className="p-4">
          {brushPreview}
        </div>
      </div>

      <button
        onClick={() => setPanelOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-orange-500 text-black rounded-full shadow-lg flex items-center justify-center hover:bg-orange-400 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D14]"
      >
        <Settings size={20} />
      </button>

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPanelOpen(false)} />
          <div className="relative mt-auto bg-bg-surface rounded-t-2xl border-t border-white/5 max-h-[80vh] overflow-y-auto p-5 pb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-gray-100">Settings</span>
              <button
                onClick={() => setPanelOpen(false)}
                className="text-gray-400 hover:text-gray-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-6">
              {textureSettings}
            </div>
            <div className="border-t border-white/5 mt-6 pt-6 space-y-6">
              {brushSettings}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
