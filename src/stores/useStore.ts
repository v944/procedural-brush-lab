import { create } from 'zustand'
import type { TextureType, ViewMode, ExportFormat, ExportResolution, TextureParams, Preset, NoiseParams, GrungeParams, BristlesParams, ScalesParams, CracksParams } from '../types'

interface AppState {
  textureType: TextureType
  params: TextureParams
  viewMode: ViewMode
  isPro: boolean
  presets: Preset[]
  exportFormat: ExportFormat
  exportResolution: ExportResolution
  isExporting: boolean
  exportProgress: number
  showPaywall: boolean
  paywallFeature: string
  isFallback: boolean
  setFallback: (fb: boolean) => void
  setTextureType: (type: TextureType) => void
  setParam: (key: string, value: number) => void
  setParams: (params: TextureParams) => void
  setViewMode: (mode: ViewMode) => void
  randomizeSeed: () => void
  resetParams: () => void
  setExportFormat: (format: ExportFormat) => void
  setExportResolution: (resolution: ExportResolution) => void
  setExporting: (exporting: boolean) => void
  setExportProgress: (progress: number) => void
  setPro: (pro: boolean) => void
  showPaywallFor: (feature: string) => void
  hidePaywall: () => void
  savePreset: (name: string) => void
  loadPreset: (preset: Preset) => void
  deletePreset: (name: string) => void
  importPresets: (presets: Preset[]) => void
}

const DEFAULT_NOISE: NoiseParams = {
  scale: 50, density: 0.5, octaves: 4, lacunarity: 2.0, gain: 0.5, seed: Math.floor(Math.random() * 999999),
}

const DEFAULT_GRUNGE: GrungeParams = {
  scale: 30, density: 0.3, roughness: 0.5, seed: Math.floor(Math.random() * 999999),
}

const DEFAULT_BRISTLES: BristlesParams = {
  count: 100, length: 30, angle: 45, angleVariance: 15, thickness: 2, seed: Math.floor(Math.random() * 999999),
}

const DEFAULT_SCALES: ScalesParams = {
  scale: 20, density: 0.5, edge: 0.3, seed: Math.floor(Math.random() * 999999),
}

const DEFAULT_CRACKS: CracksParams = {
  scale: 40, density: 0.4, width: 2, branching: 0.3, seed: Math.floor(Math.random() * 999999),
}

function getDefaultParams(type: TextureType): TextureParams {
  switch (type) {
    case 'noise': return { ...DEFAULT_NOISE }
    case 'grunge': return { ...DEFAULT_GRUNGE }
    case 'bristles': return { ...DEFAULT_BRISTLES }
    case 'scales': return { ...DEFAULT_SCALES }
    case 'cracks': return { ...DEFAULT_CRACKS }
  }
}

function getRandomSeed(params: TextureParams): TextureParams {
  return { ...params, seed: Math.floor(Math.random() * 999999) }
}

function loadPresets(): Preset[] {
  try {
    const data = localStorage.getItem('brushlab-presets')
    if (data) return JSON.parse(data)
  } catch {}
  return []
}

function savePresetsToStorage(presets: Preset[]) {
  try {
    localStorage.setItem('brushlab-presets', JSON.stringify(presets))
  } catch {}
}

function loadProStatus(): boolean {
  try {
    return localStorage.getItem('brushlab-pro') === 'true'
  } catch {
    return false
  }
}

export const useStore = create<AppState>((set, get) => ({
  textureType: 'noise',
  params: { ...DEFAULT_NOISE },
  viewMode: 'single',
  isPro: loadProStatus(),
  presets: loadPresets(),
  exportFormat: 'png',
  exportResolution: 2048,
  isExporting: false,
  exportProgress: 0,
  showPaywall: false,
  paywallFeature: '',
  isFallback: false,

  setTextureType: (type) => {
    set({ textureType: type, params: getDefaultParams(type) })
  },

  setParam: (key, value) => {
    set((state) => ({ params: { ...state.params, [key]: value } }))
  },

  setParams: (params) => {
    set({ params })
  },

  setViewMode: (mode) => {
    set({ viewMode: mode })
  },

  randomizeSeed: () => {
    set((state) => ({ params: getRandomSeed(state.params) }))
  },

  resetParams: () => {
    set((state) => ({ params: getDefaultParams(state.textureType) }))
  },

  setExportFormat: (format) => set({ exportFormat: format }),
  setExportResolution: (resolution) => set({ exportResolution: resolution }),
  setExporting: (exporting) => set({ isExporting: exporting, exportProgress: 0 }),
  setExportProgress: (progress) => set({ exportProgress: progress }),

  setPro: (pro) => {
    try {
      localStorage.setItem('brushlab-pro', pro ? 'true' : 'false')
    } catch {}
    set({ isPro: pro })
  },

  showPaywallFor: (feature) => {
    set({ showPaywall: true, paywallFeature: feature })
  },

  hidePaywall: () => {
    set({ showPaywall: false, paywallFeature: '' })
  },

  setFallback: (fb) => set((state) => ({
    isFallback: fb,
    exportFormat: fb ? 'png' : state.exportFormat,
    exportResolution: fb ? 1024 : state.exportResolution,
  })),

  savePreset: (name) => {
    const state = get()
    const newPreset: Preset = {
      version: '1.0',
      name,
      type: state.textureType,
      params: state.params,
      createdAt: new Date().toISOString(),
    }
    const updated = [...state.presets, newPreset]
    savePresetsToStorage(updated)
    set({ presets: updated })
  },

  loadPreset: (preset) => {
    set({
      textureType: preset.type,
      params: preset.params,
    })
  },

  deletePreset: (name) => {
    const updated = get().presets.filter((p) => p.name !== name)
    savePresetsToStorage(updated)
    set({ presets: updated })
  },

  importPresets: (presets) => {
    const existing = get().presets
    const updated = [...existing, ...presets]
    savePresetsToStorage(updated)
    set({ presets: updated })
  },
}))
