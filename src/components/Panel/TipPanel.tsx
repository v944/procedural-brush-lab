import { useBrushTipStore } from '../../stores/brushTipStore'
import { BrushTipShapeSelector } from '../BrushTip/BrushTipShapeSelector'
import { AnglePicker } from '../BrushTip/AnglePicker'
import { SliderWithInput } from '../UI/SliderWithInput'

export function TipPanel() {
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
      <BrushTipShapeSelector />

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
          max={1000}
          suffix="%"
        />
      </div>
    </div>
  )
}
