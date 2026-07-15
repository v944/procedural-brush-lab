import { type ReactNode, useState, useEffect } from 'react'
import { Settings, X } from 'lucide-react'

interface LayoutProps {
  canvas: ReactNode
  panel: ReactNode
  tipPreview?: ReactNode
  strokePreview?: ReactNode
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

export function Layout({ canvas, panel, tipPreview, strokePreview }: LayoutProps) {
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)

  if (tipPreview && strokePreview && !isMobile) {
    return (
      <div className="flex-1 flex flex-row max-w-[1400px] mx-auto w-full bg-bg-page">
        <div className="w-[340px] shrink-0 bg-bg-sidebar border-r border-white/5 p-5 overflow-y-auto space-y-6">
          <div className="bg-bg-surface rounded-xl p-5 border border-white/5">
            {panel}
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-start p-6 gap-4">
          {tipPreview}
          {canvas}
        </div>

        {strokePreview && (
          <div className="w-[420px] shrink-0 bg-bg-sidebar border-l border-white/5 p-5 flex flex-col">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Stroke Preview
            </h2>
            {strokePreview}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 max-w-[1400px] mx-auto w-full bg-bg-page">
      <div className="flex-1 flex items-start justify-center lg:sticky lg:top-6 p-6">
        {canvas}
        {tipPreview}
        {strokePreview}
      </div>

      {!isMobile && (
        <div className="w-full lg:w-[340px] shrink-0 space-y-6 bg-bg-sidebar border-l border-white/5 p-5">
          {panel}
        </div>
      )}

      {isMobile && (
        <>
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
                {panel}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
