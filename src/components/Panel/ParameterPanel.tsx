import { useCallback } from 'react'
import { useStore } from '../../stores/useStore'
import { Slider } from '../UI/Slider'
import { Button } from '../UI/Button'
import { Dropdown } from '../UI/Dropdown'
import { Shuffle, RotateCcw } from 'lucide-react'
import type { TextureType, ParamDefinition } from '../../types'

const TEXTURE_OPTIONS = [
  { value: 'noise' as TextureType, label: 'Noise (Smoke / Mist)' },
  { value: 'grunge' as TextureType, label: 'Grunge / Dirt' },
  { value: 'bristles' as TextureType, label: 'Bristles / Hair' },
  { value: 'scales' as TextureType, label: 'Scales / Blobs (Voronoi)' },
  { value: 'cracks' as TextureType, label: 'Cracks' },
]

function getParamDefinitions(type: TextureType): ParamDefinition[] {
  switch (type) {
    case 'noise':
      return [
        { key: 'scale', label: 'Scale', min: 1, max: 100, step: 1 },
        { key: 'density', label: 'Density', min: 0, max: 1, step: 0.01 },
        { key: 'octaves', label: 'Octaves', min: 1, max: 8, step: 1 },
        { key: 'lacunarity', label: 'Lacunarity', min: 1, max: 4, step: 0.1 },
        { key: 'gain', label: 'Gain', min: 0.1, max: 1, step: 0.01 },
      ]
    case 'grunge':
      return [
        { key: 'scale', label: 'Scale', min: 1, max: 100, step: 1 },
        { key: 'density', label: 'Density', min: 0, max: 1, step: 0.01 },
        { key: 'roughness', label: 'Roughness', min: 0, max: 1, step: 0.01 },
      ]
    case 'bristles':
      return [
        { key: 'count', label: 'Count', min: 10, max: 500, step: 10 },
        { key: 'length', label: 'Length', min: 5, max: 100, step: 1 },
        { key: 'angle', label: 'Angle', min: 0, max: 360, step: 1 },
        { key: 'angleVariance', label: 'Angle Variance', min: 0, max: 90, step: 1 },
        { key: 'thickness', label: 'Thickness', min: 1, max: 10, step: 0.5 },
      ]
    case 'scales':
      return [
        { key: 'scale', label: 'Scale', min: 1, max: 100, step: 1 },
        { key: 'density', label: 'Density', min: 0, max: 1, step: 0.01 },
        { key: 'edge', label: 'Edge', min: 0, max: 1, step: 0.01 },
      ]
    case 'cracks':
      return [
        { key: 'scale', label: 'Scale', min: 1, max: 100, step: 1 },
        { key: 'density', label: 'Density', min: 0, max: 1, step: 0.01 },
        { key: 'width', label: 'Width', min: 1, max: 10, step: 0.5 },
        { key: 'branching', label: 'Branching', min: 0, max: 1, step: 0.01 },
      ]
  }
}

export function ParameterPanel() {
  const textureType = useStore((s) => s.textureType)
  const params = useStore((s) => s.params)
  const setTextureType = useStore((s) => s.setTextureType)
  const setParam = useStore((s) => s.setParam)
  const randomizeSeed = useStore((s) => s.randomizeSeed)
  const resetParams = useStore((s) => s.resetParams)

  const handleParamChange = useCallback((key: string, value: number) => {
    setParam(key, value)
  }, [setParam])

  const paramDefs = getParamDefinitions(textureType)

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-text-secondary mb-1 block">Texture Type</label>
        <Dropdown value={textureType} options={TEXTURE_OPTIONS} onChange={setTextureType} />
      </div>

      <div className="border-t border-border pt-4">
        {paramDefs.map((def) => (
          <Slider
            key={def.key}
            label={def.label}
            value={(params as unknown as Record<string, number>)[def.key] ?? def.min}
            min={def.min}
            max={def.max}
            step={def.step}
            onChange={(v) => handleParamChange(def.key, v)}
          />
        ))}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={randomizeSeed} className="flex-1 flex items-center justify-center gap-2">
            <Shuffle size={14} />
            Randomize Seed
          </Button>
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-text-muted">Seed</span>
          <span className="text-xs font-mono text-text-primary font-medium">{params.seed}</span>
        </div>
        <Button variant="ghost" onClick={resetParams} className="w-full flex items-center justify-center gap-2">
          <RotateCcw size={14} />
          Reset
        </Button>
      </div>
    </div>
  )
}
