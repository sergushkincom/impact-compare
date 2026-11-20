import type { IndicatorKey } from "@/data/types"

export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—"
  const abs = Math.abs(value)
  if (abs !== 0 && abs < 0.01) {
    return value.toExponential(2).replace("e", "e")
  }
  const digits = abs >= 100 ? 0 : abs >= 10 ? 1 : 2
  return new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatQuantity(value: number, unit: string): string {
  return `${formatNumber(value)} ${unit}`
}

/** Percent change of `other` relative to `base`. Positive means higher impact. */
export function formatPercent(delta: number | null): string {
  if (delta === null || !Number.isFinite(delta)) return "—"
  const rounded = Math.round(delta * 10) / 10
  const body = new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 1,
    minimumFractionDigits: Math.abs(rounded) < 10 && rounded !== 0 ? 1 : 0,
  }).format(Math.abs(rounded))
  if (rounded > 0) return `+${body}%`
  if (rounded < 0) return `−${body}%`
  return "0%"
}

export function deltaWord(delta: number | null): "higher" | "lower" | "same" | "n/a" {
  if (delta === null || !Number.isFinite(delta)) return "n/a"
  if (delta > 0.05) return "higher"
  if (delta < -0.05) return "lower"
  return "same"
}

export function csvCell(value: string | number): string {
  const text = String(value)
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`
  return text
}

export function indicatorFileKey(key: IndicatorKey): string {
  return key
}

/** Largest-remainder rounding so displayed shares sum to 100. */
export function percentShares(shares: readonly number[]): number[] {
  if (shares.length === 0) return []
  const raw = shares.map((share) => share * 100)
  const floors = raw.map((value) => Math.floor(value))
  let left = 100 - floors.reduce((sum, value) => sum + value, 0)
  const order = raw
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
  const out = [...floors]
  for (const item of order) {
    if (left <= 0) break
    out[item.index] += 1
    left -= 1
  }
  return out
}
