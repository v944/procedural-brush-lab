import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { TextureType, ViewMode, ExportFormat, ExportResolution, TextureParams, Preset, NoiseParams, GrungeParams, BristlesParams, ScalesParams, CracksParams } from '../types'

const IS_DEV = typeof location !== 'undefined' && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')

export type PlanTier = 'free' | 'pro' | 'lifetime'

interface AppState {
  textureType: TextureType
  params: TextureParams
  viewMode: ViewMode
  isPro: boolean
  plan: PlanTier
  sessionId: string
  presets: Preset[]
  exportFormat: ExportFormat
  exportResolution: ExportResolution
  isExporting: boolean
  exportProgress: number
  showPaywall: boolean
  paywallFeature: string
  isFallback: boolean
  showPricing: boolean
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
  setPlan: (plan: PlanTier) => void
  showPaywallFor: (feature: string) => void
  hidePaywall: () => void
  setShowPricing: (show: boolean) => void
  savePreset: (name: string) => void
  loadPreset: (preset: Preset) => void
  deletePreset: (name: string) => void
  importPresets: (presets: Preset[]) => void
  syncPlanFromServer: () => Promise<void>
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
    const data = localStorage.getItem('brushspark-presets')
    if (data) return JSON.parse(data)
  } catch {}
  return []
}

function savePresetsToStorage(presets: Preset[]) {
  try {
    localStorage.setItem('brushspark-presets', JSON.stringify(presets))
  } catch {}
}

function generateSessionId(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  }
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      textureType: 'noise',
      params: { ...DEFAULT_NOISE },
      viewMode: 'single',
      isPro: IS_DEV ? true : false,
      plan: IS_DEV ? 'lifetime' : 'free',
      sessionId: generateSessionId(),
      presets: loadPresets(),
      exportFormat: 'png',
      exportResolution: 2048,
      isExporting: false,
      exportProgress: 0,
      showPaywall: false,
      paywallFeature: '',
      isFallback: false,
      showPricing: false,

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
        const plan: PlanTier = pro ? 'pro' : 'free'
        set({ isPro: pro, plan })
      },

      setPlan: (plan) => {
        set({ isPro: plan !== 'free', plan })
      },

      showPaywallFor: (feature) => {
        set({ showPaywall: true, paywallFeature: feature })
      },

      hidePaywall: () => {
        set({ showPaywall: false, paywallFeature: '' })
      },

      setShowPricing: (show) => {
        set({ showPricing: show })
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

      syncPlanFromServer: async () => {
        const { sessionId } = get()
        try {
          const res = await fetch(`/api/crypto/check?sessionId=${encodeURIComponent(sessionId)}`)
          const json = await res.json() as { success: boolean; data?: { activated: boolean; tier?: string } }
          if (json.success && json.data?.activated && json.data.tier) {
            const plan = json.data.tier as PlanTier
            set({ isPro: plan !== 'free', plan })
          }
        } catch {
          /* fail-open: keep current plan */
        }
      },
    }),
    {
      name: 'brushspark-user',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        plan: state.plan,
        sessionId: state.sessionId,
        isPro: state.isPro,
      }),
    }
  )
)
