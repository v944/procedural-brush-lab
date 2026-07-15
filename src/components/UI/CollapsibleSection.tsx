import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../lib/cn'

interface CollapsibleSectionProps {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}

export function CollapsibleSection({ title, defaultOpen = true, children }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-t border-white/5 pt-4 mt-4 first:border-t-0 first:pt-0 first:mt-0">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full text-left mb-3"
      >
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-gray-500 transition-transform duration-150',
            !open && '-rotate-90'
          )}
        />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </span>
      </button>
      {open && children}
    </div>
  )
}
