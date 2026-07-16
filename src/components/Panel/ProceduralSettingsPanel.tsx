import { Shuffle, Sparkles } from 'lucide-react'
import { useBrushTipStore, type NoiseType } from '../../stores/brushTipStore'
import { SliderWithInput } from '../UI/SliderWithInput'

const NOISE_OPTIONS: { value: NoiseType; label: string }[] = [
  { value: 'simplex', label: 'Simplex' },
  { value: 'value', label: 'Value' },
  { value: 'worley', label: 'Worley' },
]

export function ProceduralSettingsPanel() {
  const shape = useBrushTipStore((s) => s.shape)
  const proc = useBrushTipStore((s) => s.procedural)
  const setProcedural = useBrushTipStore((s) => s.setProcedural)
  const randomizeProcedural = useBrushTipStore((s) => s.randomizeProcedural)
  const resetProcedural = useBrushTipStore((s) => s.resetProcedural)

  if (shape !== 'procedural') return null

  return (
    <div className="mt-4 pt-4 border-t border-white/5">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Procedural Brush Tip Shape
      </h3>
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Noise Type</label>
          <div className="flex gap-2">
            {NOISE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setProcedural({ noiseType: value })}
                className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                  proc.noiseType === value
                    ? 'bg-orange-500 text-black'
                    : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <SliderWithInput
          label="Noise Amount"
          value={proc.noiseAmount}
          onChange={(v) => setProcedural({ noiseAmount: v })}
          min={0}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}`}
          suffix="%"
        />

        <SliderWithInput
          label="Noise Scale"
          value={proc.noiseScale}
          onChange={(v) => setProcedural({ noiseScale: v })}
          min={0.1}
          max={10}
          step={0.1}
        />

        <SliderWithInput
          label="Threshold"
          value={proc.threshold}
          onChange={(v) => setProcedural({ threshold: v })}
          min={0.1}
          max={0.9}
          step={0.01}
        />

        <SliderWithInput
          label="Smoothing"
          value={proc.smoothing}
          onChange={(v) => setProcedural({ smoothing: v })}
          min={0}
          max={1}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}`}
          suffix="%"
        />

        <div>
          <label className="text-xs font-medium text-gray-400 mb-1 block">Seed</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={0}
              max={9999}
              value={proc.seed}
              onChange={(e) => {
                const v = parseInt(e.target.value, 10)
                if (!isNaN(v)) setProcedural({ seed: v })
              }}
              className="w-20 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-200 text-center font-mono focus:outline-none focus:border-orange-500/50"
            />
            <button
              onClick={randomizeProcedural}
              className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-200 transition-colors"
              title="Randomize"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>

        <button
          onClick={randomizeProcedural}
          className="w-full bg-white/5 text-gray-200 border border-white/5 rounded-lg px-3 py-2 text-xs hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Randomize All
        </button>

        <button
          onClick={resetProcedural}
          className="w-full bg-transparent text-gray-500 hover:text-gray-300 rounded-lg px-3 py-1.5 text-xs transition-colors"
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  )
}
