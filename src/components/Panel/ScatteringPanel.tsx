import { useBrushTipStore } from '../../stores/brushTipStore'
import { SliderWithInput } from '../UI/SliderWithInput'
import { Toggle } from '../UI/Toggle'
import { CollapsibleSection } from '../UI/CollapsibleSection'

export function ScatteringPanel() {
  const sc = useBrushTipStore((s) => s.scattering)
  const setScattering = useBrushTipStore((s) => s.setScattering)
  const toggleScattering = useBrushTipStore((s) => s.toggleScattering)

  return (
    <CollapsibleSection title="Scattering" defaultOpen={false}>
      <div className="space-y-3">
        <Toggle checked={sc.enabled} onChange={toggleScattering} label="Enable Scattering" />

        <SliderWithInput
          label="Scatter"
          value={sc.scatter}
          onChange={(v) => setScattering({ scatter: v })}
          min={0}
          max={1000}
          suffix="%"
        />

        <Toggle
          checked={sc.bothAxes}
          onChange={(v) => setScattering({ bothAxes: v })}
          label="Both Axes"
        />

        <SliderWithInput
          label="Count"
          value={sc.count}
          onChange={(v) => setScattering({ count: Math.round(v) })}
          min={1}
          max={10}
        />

        <SliderWithInput
          label="Count Jitter"
          value={sc.countJitter}
          onChange={(v) => setScattering({ countJitter: v })}
          min={0}
          max={100}
          suffix="%"
        />
      </div>
    </CollapsibleSection>
  )
}
