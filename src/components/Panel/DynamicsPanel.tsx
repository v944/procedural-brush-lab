import { useBrushTipStore, type JitterControl } from '../../stores/brushTipStore'
import { SliderWithInput } from '../UI/SliderWithInput'
import { Toggle } from '../UI/Toggle'
import { CollapsibleSection } from '../UI/CollapsibleSection'

const CONTROL_OPTIONS: { value: JitterControl; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'fade', label: 'Fade' },
  { value: 'pressure', label: 'Pressure' },
  { value: 'tilt', label: 'Tilt' },
  { value: 'direction', label: 'Direction' },
]

function JitterControlSelect({
  value,
  onChange,
}: {
  value: JitterControl
  onChange: (v: JitterControl) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as JitterControl)}
      className="h-8 px-2 text-xs bg-white/5 border border-white/10 rounded-lg text-gray-200 focus:outline-none focus:border-orange-500/50"
    >
      {CONTROL_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#0D0D14] text-gray-200">
          {opt.label}
        </option>
      ))}
    </select>
  )
}

export function DynamicsPanel() {
  const sd = useBrushTipStore((s) => s.shapeDynamics)
  const setShapeDynamics = useBrushTipStore((s) => s.setShapeDynamics)
  const toggleShapeDynamics = useBrushTipStore((s) => s.toggleShapeDynamics)

  return (
    <CollapsibleSection title="Shape Dynamics" defaultOpen={false}>
      <div className="space-y-3">
        <Toggle checked={sd.enabled} onChange={toggleShapeDynamics} label="Enable Shape Dynamics" />

        <div className="space-y-3">
          <div>
            <SliderWithInput
              label="Size Jitter"
              value={sd.sizeJitter}
              onChange={(v) => setShapeDynamics({ sizeJitter: v })}
              min={0}
              max={100}
              suffix="%"
            />
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Control:</span>
              <JitterControlSelect
                value={sd.sizeJitterControl}
                onChange={(v) => setShapeDynamics({ sizeJitterControl: v })}
              />
            </div>
          </div>

          <SliderWithInput
            label="Min Diameter"
            value={sd.minDiameter}
            onChange={(v) => setShapeDynamics({ minDiameter: v })}
            min={1}
            max={100}
            suffix="%"
          />

          <div>
            <SliderWithInput
              label="Angle Jitter"
              value={sd.angleJitter}
              onChange={(v) => setShapeDynamics({ angleJitter: v })}
              min={0}
              max={100}
              suffix="%"
            />
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] text-gray-500">Control:</span>
              <JitterControlSelect
                value={sd.angleJitterControl}
                onChange={(v) => setShapeDynamics({ angleJitterControl: v })}
              />
            </div>
          </div>

          <SliderWithInput
            label="Roundness Jitter"
            value={sd.roundnessJitter}
            onChange={(v) => setShapeDynamics({ roundnessJitter: v })}
            min={0}
            max={100}
            suffix="%"
          />

          <SliderWithInput
            label="Min Roundness"
            value={sd.minRoundness}
            onChange={(v) => setShapeDynamics({ minRoundness: v })}
            min={1}
            max={100}
            suffix="%"
          />

          <div className="flex gap-4">
            <Toggle
              checked={sd.flipXJitter}
              onChange={(v) => setShapeDynamics({ flipXJitter: v })}
              label="Flip X"
            />
            <Toggle
              checked={sd.flipYJitter}
              onChange={(v) => setShapeDynamics({ flipYJitter: v })}
              label="Flip Y"
            />
          </div>
        </div>
      </div>
    </CollapsibleSection>
  )
}
