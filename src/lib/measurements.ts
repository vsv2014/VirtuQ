/**
 * Body measurements used to build the try-on avatar.
 *
 * Everything is in centimetres except `skinTone`. Measurements are persisted so
 * a returning shopper doesn't have to re-enter them.
 */
export interface Measurements {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulder: number;
  skinTone: string;
}

export const DEFAULT_MEASUREMENTS: Measurements = {
  height: 168,
  chest: 88,
  waist: 72,
  hips: 96,
  shoulder: 40,
  skinTone: '#d9a884',
};

export const MEASUREMENT_RANGES = {
  height: { min: 140, max: 210, step: 1, label: 'Height' },
  chest: { min: 70, max: 130, step: 1, label: 'Chest' },
  waist: { min: 55, max: 120, step: 1, label: 'Waist' },
  hips: { min: 70, max: 140, step: 1, label: 'Hips' },
  shoulder: { min: 32, max: 55, step: 1, label: 'Shoulder' },
} as const;

export type MeasurementKey = keyof typeof MEASUREMENT_RANGES;

export const SKIN_TONES = [
  { label: 'Porcelain', hex: '#f3d9c4' },
  { label: 'Fair', hex: '#e8c3a4' },
  { label: 'Medium', hex: '#d9a884' },
  { label: 'Olive', hex: '#c08a5e' },
  { label: 'Brown', hex: '#8d5524' },
  { label: 'Deep', hex: '#5c3317' },
];

/** Looseness multiplier applied to the body radius per size. */
export const SIZE_EASE: Record<string, number> = {
  S: 1.04,
  M: 1.07,
  L: 1.1,
  XL: 1.14,
};

export const SIZES = ['S', 'M', 'L', 'XL'] as const;

export function easeForSize(size: string): number {
  return SIZE_EASE[size] ?? SIZE_EASE.M;
}

export function clampMeasurement(key: MeasurementKey, value: number): number {
  const { min, max } = MEASUREMENT_RANGES[key];
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
