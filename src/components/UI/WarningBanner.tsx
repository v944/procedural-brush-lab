import { AlertTriangle } from 'lucide-react'

interface WarningBannerProps {
  message: string
}

export function WarningBanner({ message }: WarningBannerProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-warning/10 border border-warning/30 rounded-lg text-xs text-warning">
      <AlertTriangle size={14} className="shrink-0" />
      <span>{message}</span>
    </div>
  )
}
