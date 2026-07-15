import { type ReactNode, useState, useEffect } from 'react'
import { Settings, X } from 'lucide-react'

interface LayoutProps {
  canvas: ReactNode
  panel: ReactNode
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

export function Layout({ canvas, panel }: LayoutProps) {
  const isMobile = useIsMobile()
  const [panelOpen, setPanelOpen] = useState(false)

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1400px] mx-auto w-full">
      <div className="flex-1 flex items-start justify-center lg:sticky lg:top-6">
        {canvas}
      </div>

      {!isMobile && (
        <div className="w-full lg:w-[340px] shrink-0 space-y-6">
          {panel}
        </div>
      )}

      {isMobile && (
        <>
          <button
            onClick={() => setPanelOpen(true)}
            className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-hover transition-colors cursor-pointer"
          >
            <Settings size={20} />
          </button>

          {panelOpen && (
            <div className="fixed inset-0 z-50 flex flex-col">
              <div className="absolute inset-0 bg-black/60" onClick={() => setPanelOpen(false)} />
              <div className="relative mt-auto bg-surface rounded-t-2xl border-t border-border max-h-[80vh] overflow-y-auto p-5 pb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-text-primary">Settings</span>
                  <button
                    onClick={() => setPanelOpen(false)}
                    className="text-text-muted hover:text-text-primary cursor-pointer"
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
