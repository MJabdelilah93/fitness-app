import type { WeightUnit } from '../types'

const KG_TO_LBS = 2.20462

export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'lbs' ? value / KG_TO_LBS : value
}

export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'lbs' ? Math.round(kg * KG_TO_LBS * 10) / 10 : kg
}

export function weightLabel(unit: WeightUnit): string {
  return unit
}

/** Round to nearest 0.5 for plates that matter (2.5 lb/1.25 kg increments) */
export function snapWeight(value: number, unit: WeightUnit): number {
  const snap = unit === 'lbs' ? 2.5 : 1.25
  return Math.round(value / snap) * snap
}
