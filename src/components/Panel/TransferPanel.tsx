import { useBrushTipStore, type JitterControl } from '../../stores/brushTipStore'
import { SliderWithInput } from '../UI/SliderWithInput'
import { Toggle } from '../UI/Toggle'
import { CollapsibleSection } from '../UI/CollapsibleSection'

const CONTROL_OPTIONS: { value: JitterControl; label: string }[] = [
  { value: 'off', label: 'Off' },
  { value: 'fade', label: 'Fade' },
  { value: 'pressure', label: 'Pressure' },
  { value: 'tilt', label: 'Tilt' },
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

export function TransferPanel() {
  const tr = useBrushTipStore((s) => s.transfer)
  const setTransfer = useBrushTipStore((s) => s.setTransfer)
  const toggleTransfer = useBrushTipStore((s) => s.toggleTransfer)

  return (
    <CollapsibleSection title="Transfer" defaultOpen={false}>
      <div className="space-y-3">
        <Toggle checked={tr.enabled} onChange={toggleTransfer} label="Enable Transfer" />

        <div>
          <SliderWithInput
            label="Opacity Jitter"
            value={tr.opacityJitter}
            onChange={(v) => setTransfer({ opacityJitter: v })}
            min={0}
            max={100}
            suffix="%"
          />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Control:</span>
            <JitterControlSelect
              value={tr.opacityJitterControl}
              onChange={(v) => setTransfer({ opacityJitterControl: v })}
            />
          </div>
        </div>

        <SliderWithInput
          label="Min Opacity"
          value={tr.minOpacity}
          onChange={(v) => setTransfer({ minOpacity: v })}
          min={0}
          max={100}
          suffix="%"
        />

        <div>
          <SliderWithInput
            label="Flow Jitter"
            value={tr.flowJitter}
            onChange={(v) => setTransfer({ flowJitter: v })}
            min={0}
            max={100}
            suffix="%"
          />
          <div className="mt-1 flex items-center gap-2">
            <span className="text-[10px] text-gray-500">Control:</span>
            <JitterControlSelect
              value={tr.flowJitterControl}
              onChange={(v) => setTransfer({ flowJitterControl: v })}
            />
          </div>
        </div>

        <SliderWithInput
          label="Min Flow"
          value={tr.minFlow}
          onChange={(v) => setTransfer({ minFlow: v })}
          min={0}
          max={100}
          suffix="%"
        />
      </div>
    </CollapsibleSection>
  )
}
