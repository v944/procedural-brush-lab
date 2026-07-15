import { useCallback, useRef } from 'react'
import { useStore } from '../../stores/useStore'
import { Button } from '../UI/Button'
import { Dropdown } from '../UI/Dropdown'
import { Download } from 'lucide-react'
import type { ExportFormat, ExportResolution } from '../../types'
import { exportPNG, exportProcreate, exportABR } from '../../utils/export'
import { readTexture } from '../../hooks/useWebGLCanvas'
import { applyWatermark } from '../../utils/watermark'

const FORMAT_OPTIONS = [
  { value: 'png' as ExportFormat, label: 'PNG' },
  { value: 'procreate' as ExportFormat, label: 'Procreate .brush' },
  { value: 'photoshop' as ExportFormat, label: 'Photoshop .abr' },
]

const RESOLUTION_OPTIONS = [
  { value: 512 as ExportResolution, label: '512×512' },
  { value: 1024 as ExportResolution, label: '1024×1024' },
  { value: 2048 as ExportResolution, label: '2048×2048' },
  { value: 4096 as ExportResolution, label: '4096×4096 (Pro)' },
]

const FORMAT_OPTIONS_FALLBACK = [
  { value: 'png' as ExportFormat, label: 'PNG' },
]

const RESOLUTION_OPTIONS_FALLBACK = [
  { value: 512 as ExportResolution, label: '512×512' },
  { value: 1024 as ExportResolution, label: '1024×1024' },
]

export function ExportPanel() {
  const exportFormat = useStore((s) => s.exportFormat)
  const exportResolution = useStore((s) => s.exportResolution)
  const isExporting = useStore((s) => s.isExporting)
  const exportProgress = useStore((s) => s.exportProgress)
  const isPro = useStore((s) => s.isPro)
  const isFallback = useStore((s) => s.isFallback)
  const textureType = useStore((s) => s.textureType)
  const params = useStore((s) => s.params)
  const setExportFormat = useStore((s) => s.setExportFormat)
  const setExportResolution = useStore((s) => s.setExportResolution)
  const setExporting = useStore((s) => s.setExporting)
  const setExportProgress = useStore((s) => s.setExportProgress)
  const showPaywallFor = useStore((s) => s.showPaywallFor)
  const exportCanvasRef = useRef<HTMLCanvasElement>(null)

  const formatOptions = isFallback ? FORMAT_OPTIONS_FALLBACK : FORMAT_OPTIONS
  const resolutionOptions = isFallback ? RESOLUTION_OPTIONS_FALLBACK : RESOLUTION_OPTIONS

  const isProFeature = exportFormat !== 'png' || exportResolution === 4096

  const handleDownload = useCallback(async () => {
    if (isProFeature && !isPro) {
      showPaywallFor(exportFormat === 'procreate' ? 'Procreate .brush' : exportResolution === 4096 ? '4K resolution' : 'Photoshop .abr')
      return
    }

    setExporting(true)

    try {
      const url = await readTexture(exportResolution, exportResolution)
      if (!url) {
        setExporting(false)
        return
      }

      setExportProgress(0.3)

      const canvas = exportCanvasRef.current!
      canvas.width = exportResolution
      canvas.height = exportResolution
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, exportResolution, exportResolution)

      const img = new Image()
      img.src = url
      await new Promise<void>((resolve) => {
        img.onload = async () => {
          ctx.drawImage(img, 0, 0, exportResolution, exportResolution)

          if (!isPro) {
            applyWatermark(canvas)
          }

          try {
            switch (exportFormat) {
              case 'png':
                await exportPNG(canvas, textureType, params.seed, exportResolution, setExportProgress)
                break
              case 'procreate':
                await exportProcreate(canvas, textureType, params, params.seed, exportResolution, setExportProgress)
                break
              case 'photoshop':
                await exportABR(canvas, textureType, params.seed, exportResolution, setExportProgress)
                break
            }
          } catch (err) {
            console.error('Export error:', err)
          }

          setExporting(false)
          resolve()
        }
      })
    } catch (err) {
      console.error('Export error:', err)
      setExporting(false)
    }
  }, [exportFormat, exportResolution, isPro, isProFeature, textureType, params, setExporting, setExportProgress, showPaywallFor])

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-text-secondary mb-1 block">Format</label>
        <Dropdown value={exportFormat} options={formatOptions} onChange={setExportFormat} />
      </div>

      <div>
        <label className="text-xs font-medium text-gray-400 mb-1 block">Resolution</label>
        <Dropdown value={exportResolution} options={resolutionOptions} onChange={setExportResolution} />
      </div>

      {isExporting && (
        <div className="space-y-1">
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-400 transition-all duration-300 ease-linear rounded-full"
              style={{ width: `${exportProgress * 100}%` }}
            />
          </div>
          <div className="text-xs text-gray-400 text-right">{Math.round(exportProgress * 100)}%</div>
        </div>
      )}

      <Button
        variant="primary"
        onClick={handleDownload}
        disabled={isExporting}
        className="w-full flex items-center justify-center gap-2"
      >
        <Download size={14} />
        {isExporting ? 'Rendering...' : 'Download'}
      </Button>

      <canvas ref={exportCanvasRef} style={{ display: 'none' }} />
    </div>
  )
}
