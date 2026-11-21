import { getProduct } from "@/data/seed"
import { CATEGORY_LABEL, indicatorMeta, unitFor, type IndicatorKey } from "@/data/types"
import { HEADLINE_KEYS, percentDelta } from "@/lib/compare"
import { deltaWord, formatNumber, formatPercent } from "@/lib/format"

/** The address the live site is shared as. */
export const SITE_ORIGIN = "https://impact-compare.vercel.app"

/** Nordic C30/37, the product the app opens on. */
export const SHARE_BASE_ID = "hv-c30-089"

/** Meridian C30/37, the public ready-mix the demo compares it with. */
export const SHARE_OTHER_ID = "mx-c30-441"

export const SHARE_TITLE = "Relative — Nordic against Meridian"

export const SHARE_DESCRIPTION =
  "Global warming is higher, water is lower. Same cubic metre, same method. Every figure is fictional."

export const SHARE_IMAGE_ALT =
  "Relative. Nordic C30/37 against Meridian C30/37: global warming is higher, water is lower. Every figure is fictional."

export type ShareWord = ReturnType<typeof deltaWord>

export type ShareRow = {
  key: IndicatorKey
  name: string
  unit: string
  baseText: string
  otherText: string
  percent: string
  word: ShareWord
  /** Bar length, 0–1, against the larger of the two totals. */
  baseBar: number
  otherBar: number
}

export type ShareCard = {
  baseName: string
  otherName: string
  baseId: string
  otherId: string
  category: string
  declaredUnit: string
  method: string
  rows: ShareRow[]
}

/**
 * The comparison the share card draws. Figures come from the catalogue,
 * so the picture stays the same comparison the app opens on.
 */
export function shareCard(): ShareCard {
  const base = getProduct(SHARE_BASE_ID)
  const other = getProduct(SHARE_OTHER_ID)
  if (!base || !other) {
    throw new Error("The share card needs Nordic C30/37 and Meridian C30/37 in the catalogue.")
  }

  const rows: ShareRow[] = HEADLINE_KEYS.map((key) => {
    const meta = indicatorMeta(key)
    const baseValue = base.totals[key]
    const otherValue = other.totals[key]
    const delta = percentDelta(baseValue, otherValue)
    const peak = Math.max(Math.abs(baseValue), Math.abs(otherValue))
    const bar = (value: number) => (peak === 0 ? 0 : Math.abs(value) / peak)
    return {
      key,
      name: meta.name,
      unit: unitFor(key, base.method),
      baseText: formatNumber(baseValue),
      otherText: formatNumber(otherValue),
      percent: formatPercent(delta),
      word: deltaWord(delta),
      baseBar: bar(baseValue),
      otherBar: bar(otherValue),
    }
  })

  return {
    baseName: base.name,
    otherName: other.name,
    baseId: base.id,
    otherId: other.id,
    category: CATEGORY_LABEL[base.category],
    declaredUnit: base.declaredUnit,
    method: base.method,
    rows,
  }
}
