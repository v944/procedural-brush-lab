export type TextureType = 'noise' | 'grunge' | 'bristles' | 'scales' | 'cracks'

export type ViewMode = 'single' | 'tile2x2' | 'brush'

export type ExportFormat = 'png' | 'procreate' | 'photoshop'

export type ExportResolution = 512 | 1024 | 2048 | 4096

export interface NoiseParams {
  scale: number
  density: number
  octaves: number
  lacunarity: number
  gain: number
  seed: number
}

export interface GrungeParams {
  scale: number
  density: number
  roughness: number
  seed: number
}

export interface BristlesParams {
  count: number
  length: number
  angle: number
  angleVariance: number
  thickness: number
  seed: number
}

export interface ScalesParams {
  scale: number
  density: number
  edge: number
  seed: number
}

export interface CracksParams {
  scale: number
  density: number
  width: number
  branching: number
  seed: number
}

export type TextureParams = NoiseParams | GrungeParams | BristlesParams | ScalesParams | CracksParams

export interface Preset {
  version: string
  name: string
  type: TextureType
  params: TextureParams
  createdAt: string
}

export type ParamDefinition = {
  key: string
  label: string
  min: number
  max: number
  step: number
}
