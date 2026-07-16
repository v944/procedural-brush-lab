import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useBrushTipStore } from '../../stores/brushTipStore'
import { BrushTipShapeSelector } from '../BrushTip/BrushTipShapeSelector'
import { AnglePicker } from '../BrushTip/AnglePicker'
import { SliderWithInput } from '../UI/SliderWithInput'
import { ProceduralSettingsPanel } from './ProceduralSettingsPanel'
import { cn } from '../../lib/cn'

export function TipPanel() {
  const [collapsed, setCollapsed] = useState(false)
  const diameter = useBrushTipStore((s) => s.diameter)
  const hardness = useBrushTipStore((s) => s.hardness)
  const roundness = useBrushTipStore((s) => s.roundness)
  const spacing = useBrushTipStore((s) => s.spacing)
  const setDiameter = useBrushTipStore((s) => s.setDiameter)
  const setHardness = useBrushTipStore((s) => s.setHardness)
  const setRoundness = useBrushTipStore((s) => s.setRoundness)
  const setSpacing = useBrushTipStore((s) => s.setSpacing)

  return (
    <div>
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="flex items-center gap-2 w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D0D14] rounded"
      >
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-gray-500 transition-transform duration-200',
            collapsed && '-rotate-90'
          )}
        />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Brush Tip Shape
        </span>
      </button>

      {!collapsed && (
        <>
          <div className="mt-3">
            <BrushTipShapeSelector />
          </div>

          <div className="space-y-3 mt-4">
            <SliderWithInput
              label="Diameter"
              value={diameter}
              onChange={setDiameter}
              min={1}
              max={2500}
              suffix="px"
            />
            <SliderWithInput
              label="Hardness"
              value={hardness}
              onChange={setHardness}
              min={0}
              max={1}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}`}
              suffix="%"
            />
            <SliderWithInput
              label="Roundness"
              value={roundness}
              onChange={setRoundness}
              min={0.01}
              max={1}
              step={0.01}
              format={(v) => `${Math.round(v * 100)}`}
              suffix="%"
            />
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1 block">Angle</label>
              <AnglePicker />
            </div>
            <SliderWithInput
              label="Spacing"
              value={spacing}
              onChange={setSpacing}
              min={1}
              max={300}
              suffix="%"
            />
          </div>

          <ProceduralSettingsPanel />
        </>
      )}
    </div>
  )
}
