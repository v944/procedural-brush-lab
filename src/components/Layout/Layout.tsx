import type { ReactNode } from 'react'

interface LayoutProps {
  canvas: ReactNode
  panel: ReactNode
}

export function Layout({ canvas, panel }: LayoutProps) {
  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 max-w-[1400px] mx-auto w-full">
      <div className="flex-1 flex items-start justify-center lg:sticky lg:top-6">
        {canvas}
      </div>
      <div className="w-full lg:w-[340px] shrink-0 space-y-6">
        {panel}
      </div>
    </div>
  )
}
