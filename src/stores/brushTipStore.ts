import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type BrushTipShape = 'round' | 'square' | 'softRound' | 'softSquare' | 'procedural';

export type JitterControl =
  | 'off'
  | 'fade'
  | 'pressure'
  | 'tilt'
  | 'direction'
  | 'stylusWheel'
  | 'rotation'
  | 'initialDirection';

export type NoiseType = 'simplex' | 'value' | 'worley';

export interface ProceduralSettings {
  noiseType: NoiseType;
  noiseAmount: number;
  noiseScale: number;
  seed: number;
  threshold: number;
  smoothing: number;
}

export interface ShapeDynamics {
  enabled: boolean;
  sizeJitter: number;
  sizeJitterControl: JitterControl;
  minDiameter: number;
  angleJitter: number;
  angleJitterControl: JitterControl;
  roundnessJitter: number;
  minRoundness: number;
  flipXJitter: boolean;
  flipYJitter: boolean;
}

export interface ScatteringSettings {
  enabled: boolean;
  scatter: number;
  bothAxes: boolean;
  count: number;
  countJitter: number;
}

export interface TransferSettings {
  enabled: boolean;
  opacityJitter: number;
  opacityJitterControl: JitterControl;
  minOpacity: number;
  flowJitter: number;
  flowJitterControl: JitterControl;
  minFlow: number;
}

export interface BrushTipState {
  shape: BrushTipShape;
  diameter: number;
  hardness: number;
  roundness: number;
  angle: number;
  spacing: number;

  procedural: ProceduralSettings;

  shapeDynamics: ShapeDynamics;
  scattering: ScatteringSettings;
  transfer: TransferSettings;

  setShape: (shape: BrushTipShape) => void;
  setDiameter: (v: number) => void;
  setHardness: (v: number) => void;
  setRoundness: (v: number) => void;
  setAngle: (v: number) => void;
  setSpacing: (v: number) => void;

  setProcedural: (settings: Partial<ProceduralSettings>) => void;
  randomizeProcedural: () => void;
  resetProcedural: () => void;

  setShapeDynamics: (settings: Partial<ShapeDynamics>) => void;
  toggleShapeDynamics: () => void;

  setScattering: (settings: Partial<ScatteringSettings>) => void;
  toggleScattering: () => void;

  setTransfer: (settings: Partial<TransferSettings>) => void;
  toggleTransfer: () => void;

  resetToDefaults: () => void;
}

const DEFAULT_PROCEDURAL: ProceduralSettings = {
  noiseType: 'simplex',
  noiseAmount: 0.3,
  noiseScale: 2.5,
  seed: 42,
  threshold: 0.5,
  smoothing: 0.3,
};

const DEFAULT_SHAPE_DYNAMICS: ShapeDynamics = {
  enabled: false,
  sizeJitter: 0,
  sizeJitterControl: 'off',
  minDiameter: 1,
  angleJitter: 0,
  angleJitterControl: 'off',
  roundnessJitter: 0,
  minRoundness: 1,
  flipXJitter: false,
  flipYJitter: false,
};

const DEFAULT_SCATTERING: ScatteringSettings = {
  enabled: false,
  scatter: 0,
  bothAxes: false,
  count: 1,
  countJitter: 0,
};

const DEFAULT_TRANSFER: TransferSettings = {
  enabled: false,
  opacityJitter: 0,
  opacityJitterControl: 'off',
  minOpacity: 0,
  flowJitter: 0,
  flowJitterControl: 'off',
  minFlow: 0,
};

const DEFAULTS = {
  shape: 'round' as BrushTipShape,
  diameter: 512,
  hardness: 1.0,
  roundness: 1.0,
  angle: 0,
  spacing: 25,
  procedural: { ...DEFAULT_PROCEDURAL },
  shapeDynamics: { ...DEFAULT_SHAPE_DYNAMICS },
  scattering: { ...DEFAULT_SCATTERING },
  transfer: { ...DEFAULT_TRANSFER },
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const normalizeAngle = (deg: number): number => {
  const normalized = ((deg % 360) + 360) % 360;
  return normalized > 180 ? normalized - 360 : normalized;
};

export const useBrushTipStore = create<BrushTipState>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      setShape: (shape) => set({ shape }),

      setDiameter: (diameter) =>
        set({ diameter: clamp(diameter, 1, 2500) }),

      setHardness: (hardness) =>
        set({ hardness: clamp(hardness, 0, 1) }),

      setRoundness: (roundness) =>
        set({ roundness: clamp(roundness, 0.01, 1) }),

      setAngle: (angle) =>
        set({ angle: normalizeAngle(angle) }),

      setSpacing: (spacing) =>
        set({ spacing: clamp(spacing, 1, 1000) }),

      setProcedural: (settings) =>
        set((state) => ({
          procedural: {
            ...state.procedural,
            noiseAmount: settings.noiseAmount ?? state.procedural.noiseAmount,
            noiseScale: settings.noiseScale ?? state.procedural.noiseScale,
            seed: Math.floor(settings.seed ?? state.procedural.seed),
            threshold: settings.threshold ?? state.procedural.threshold,
            smoothing: settings.smoothing ?? state.procedural.smoothing,
            noiseType: settings.noiseType ?? state.procedural.noiseType,
          },
        })),

      randomizeProcedural: () =>
        set((state) => ({
          procedural: {
            ...state.procedural,
            seed: Math.floor(Math.random() * 10000),
            noiseAmount: Math.random() * 0.5 + 0.1,
            noiseScale: Math.random() * 4 + 0.5,
            threshold: Math.random() * 0.6 + 0.2,
          },
        })),

      resetProcedural: () =>
        set({ procedural: { ...DEFAULT_PROCEDURAL } }),

      setShapeDynamics: (settings) =>
        set((state) => ({
          shapeDynamics: { ...state.shapeDynamics, ...settings },
        })),

      toggleShapeDynamics: () =>
        set((state) => ({
          shapeDynamics: { ...state.shapeDynamics, enabled: !state.shapeDynamics.enabled },
        })),

      setScattering: (settings) =>
        set((state) => ({
          scattering: { ...state.scattering, ...settings },
        })),

      toggleScattering: () =>
        set((state) => ({
          scattering: { ...state.scattering, enabled: !state.scattering.enabled },
        })),

      setTransfer: (settings) =>
        set((state) => ({
          transfer: { ...state.transfer, ...settings },
        })),

      toggleTransfer: () =>
        set((state) => ({
          transfer: { ...state.transfer, enabled: !state.transfer.enabled },
        })),

      resetToDefaults: () => set({ ...DEFAULTS }),
    }),
    {
      name: 'brushspark-tip-settings',
      partialize: (state) => ({
        shape: state.shape,
        diameter: state.diameter,
        hardness: state.hardness,
        roundness: state.roundness,
        angle: state.angle,
        spacing: state.spacing,
        procedural: state.procedural,
        shapeDynamics: state.shapeDynamics,
        scattering: state.scattering,
        transfer: state.transfer,
      }),
    }
  )
);
