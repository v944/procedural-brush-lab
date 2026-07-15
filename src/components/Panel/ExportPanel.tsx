import { useCallback, useRef, useState } from 'react'
import { useStore } from '../../stores/useStore'
import { useBrushTipStore } from '../../stores/brushTipStore'
import { Button } from '../UI/Button'
import { Dropdown } from '../UI/Dropdown'
import { Download } from 'lucide-react'
import type { ExportResolution } from '../../types'
import { exportPNG, exportCombinedPNG, exportTipABR, exportBrushMeta } from '../../utils/export'
import type { CombinedExportData } from '../../utils/export'
import { readTexture } from '../../hooks/useWebGLCanvas'
import { readTip } from '../../hooks/useWebGLBrushTip'
import { applyWatermark } from '../../utils/watermark'

type ExportMode = 'texture' | 'combined' | 'tip' | 'brushmeta'

const MODE_OPTIONS: { value: ExportMode; label: string }[] = [
  { value: 'combined', label: 'Combined (Tip × Texture)' },
  { value: 'texture', label: 'Texture Only' },
  { value: 'tip', label: 'Brush Tip (.abr)' },
  { value: 'brushmeta', label: 'BrushMeta JSON' },
]

const MODE_OPTIONS_FALLBACK = [
  { value: 'combined' as ExportMode, label: 'Combined (Tip × Texture)' },
  { value: 'texture' as ExportMode, label: 'Texture Only' },
  { value: 'tip' as ExportMode, label: 'Brush Tip (.abr)' },
  { value: 'brushmeta' as ExportMode, label: 'BrushMeta JSON' },
]

const RESOLUTION_OPTIONS = [
  { value: 512 as ExportResolution, label: '512×512' },
  { value: 1024 as ExportResolution, label: '1024×1024' },
  { value: 2048 as ExportResolution, label: '2048×2048' },
  { value: 4096 as ExportResolution, label: '4096×4096 (Pro)' },
]

const RESOLUTION_OPTIONS_FALLBACK = [
  { value: 512 as ExportResolution, label: '512×512' },
  { value: 1024 as ExportResolution, label: '1024×1024' },
]

export function ExportPanel() {
  const exportResolution = useStore((s) => s.exportResolution)
  const isExporting = useStore((s) => s.isExporting)
  const exportProgress = useStore((s) => s.exportProgress)
  const isPro = useStore((s) => s.isPro)
  const isFallback = useStore((s) => s.isFallback)
  const textureType = useStore((s) => s.textureType)
  const params = useStore((s) => s.params)
  const setExportResolution = useStore((s) => s.setExportResolution)
  const setExporting = useStore((s) => s.setExporting)
  const setExportProgress = useStore((s) => s.setExportProgress)
  const showPaywallFor = useStore((s) => s.showPaywallFor)
  const [exportMode, setExportMode] = useState<ExportMode>('combined')
  const exportCanvasRef = useRef<HTMLCanvasElement>(null)

  const modeOptions = isFallback ? MODE_OPTIONS_FALLBACK : MODE_OPTIONS
  const resolutionOptions = isFallback ? RESOLUTION_OPTIONS_FALLBACK : RESOLUTION_OPTIONS

  const isProFeature = exportResolution === 4096

  const loadImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })

  const handleDownload = useCallback(async () => {
    if (exportMode === 'brushmeta') {
      const tipState = useBrushTipStore.getState()
      const storeState = useStore.getState()
      const data: CombinedExportData = {
        version: '1.0',
        app: 'BrushSpark',
        tip: {
          shape: tipState.shape,
          diameter: tipState.diameter,
          hardness: tipState.hardness,
          roundness: tipState.roundness,
          angle: tipState.angle,
          spacing: tipState.spacing,
        },
        dynamics: {
          shapeDynamics: tipState.shapeDynamics,
          scattering: tipState.scattering,
          transfer: tipState.transfer,
        },
        texture: {
          type: storeState.textureType,
          parameters: storeState.params as unknown as Record<string, number>,
        },
      }
      if (tipState.shape === 'procedural') {
        data.tip.procedural = { ...tipState.procedural }
      }
      exportBrushMeta(data)
      return
    }

    if (isProFeature && !isPro) {
      showPaywallFor('4K resolution')
      return
    }

    setExporting(true)

    try {
      if (exportMode === 'tip') {
        const tipUrl = await readTip(exportResolution, exportResolution)
        if (!tipUrl) { setExporting(false); return }
        const tipCanvas = document.createElement('canvas')
        tipCanvas.width = exportResolution
        tipCanvas.height = exportResolution
        const tipCtx = tipCanvas.getContext('2d')!
        const tipImg = await loadImage(tipUrl)
        tipCtx.drawImage(tipImg, 0, 0, exportResolution, exportResolution)
        await exportTipABR(tipCanvas, exportResolution, setExportProgress)
        setExporting(false)
        return
      }

      const url = await readTexture(exportResolution, exportResolution)
      if (!url) { setExporting(false); return }

      setExportProgress(0.1)
      const canvas = exportCanvasRef.current!
      canvas.width = exportResolution
      canvas.height = exportResolution
      const ctx = canvas.getContext('2d')!
      const img = await loadImage(url)
      ctx.drawImage(img, 0, 0, exportResolution, exportResolution)

      if (!isPro) applyWatermark(canvas)

      if (exportMode === 'combined') {
        const tipUrl = await readTip(exportResolution, exportResolution)
        const tipCanvas = document.createElement('canvas')
        tipCanvas.width = exportResolution
        tipCanvas.height = exportResolution
        if (tipUrl) {
          const tipImg = await loadImage(tipUrl)
          tipCanvas.getContext('2d')!.drawImage(tipImg, 0, 0, exportResolution, exportResolution)
        }
        await exportCombinedPNG(canvas, tipCanvas, textureType, params.seed, exportResolution, setExportProgress)
      } else {
        await exportPNG(canvas, textureType, params.seed, exportResolution, setExportProgress)
      }

      setExporting(false)
    } catch (err) {
      console.error('Export error:', err)
      setExporting(false)
    }
  }, [exportMode, exportResolution, isPro, isProFeature, textureType, params, setExporting, setExportProgress, showPaywallFor])

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-400 mb-1 block">Export Mode</label>
        <Dropdown value={exportMode} options={modeOptions} onChange={(v) => setExportMode(v as ExportMode)} />
      </div>

      {exportMode !== 'brushmeta' && (
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Resolution</label>
          <Dropdown value={exportResolution} options={resolutionOptions} onChange={setExportResolution} />
        </div>
      )}

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
        {isExporting ? 'Exporting...' : 'Download'}
      </Button>

      <canvas ref={exportCanvasRef} style={{ display: 'none' }} />
    </div>
  )
}
