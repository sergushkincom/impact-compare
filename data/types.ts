export const INDICATOR_KEYS = [
  "gwp",
  "odp",
  "ap",
  "ep",
  "pocp",
  "adpe",
  "adpf",
  "wdp",
] as const

export type IndicatorKey = (typeof INDICATOR_KEYS)[number]

export type Indicators = Record<IndicatorKey, number>

export const STAGE_KEYS = ["A1", "A2", "A3"] as const

export type StageKey = (typeof STAGE_KEYS)[number]

export type Stages = Record<StageKey, Indicators>

export const CATEGORY_KEYS = [
  "cement",
  "concrete",
  "rebar",
  "brick",
  "insulation",
  "timber",
] as const

export type Category = (typeof CATEGORY_KEYS)[number]

export type Library = "own" | "public"

export type ImpactSource = {
  name: string
  /** Share of each indicator, 0–1. Shares for one indicator sum to 1. */
  shares: Indicators
}

export type Product = {
  id: string
  name: string
  category: Category
  library: Library
  manufacturer: string
  /** Declared unit, including the quantity. "1 m³", "1 t", "1 m²". */
  declaredUnit: string
  /** PCR / standard the numbers were calculated under. */
  method: string
  summary: string
  totals: Indicators
  stages: Stages
  sources: ImpactSource[]
}

export type IndicatorMeta = {
  key: IndicatorKey
  short: string
  name: string
  /** Default unit under EN 15804+A2. Other methods override this. */
  unit: string
}

export const INDICATORS: IndicatorMeta[] = [
  { key: "gwp", short: "GWP", name: "Global warming", unit: "kg CO2e" },
  { key: "odp", short: "ODP", name: "Ozone depletion", unit: "kg CFC-11 eq" },
  { key: "ap", short: "AP", name: "Acidification", unit: "mol H+ eq" },
  { key: "ep", short: "EP", name: "Eutrophication", unit: "kg P eq" },
  { key: "pocp", short: "POCP", name: "Smog formation", unit: "kg NMVOC eq" },
  { key: "adpe", short: "ADPe", name: "Minerals depletion", unit: "kg Sb eq" },
  { key: "adpf", short: "ADPf", name: "Fossil energy", unit: "MJ" },
  { key: "wdp", short: "WDP", name: "Water deprivation", unit: "m³ world eq" },
]

export const CATEGORY_LABEL: Record<Category, string> = {
  cement: "Cement",
  concrete: "Ready-mix concrete",
  rebar: "Reinforcement steel",
  brick: "Clay brick",
  insulation: "Insulation",
  timber: "Timber",
}

export const STAGE_LABEL: Record<StageKey, string> = {
  A1: "Raw materials",
  A2: "Transport",
  A3: "Manufacturing",
}

export const LIBRARY_LABEL: Record<Library, string> = {
  own: "Own library",
  public: "Public database",
}

export function indicatorMeta(key: IndicatorKey): IndicatorMeta {
  const found = INDICATORS.find((item) => item.key === key)
  if (!found) throw new Error(`Unknown indicator ${key}`)
  return found
}

/** Units shift with the calculation method. A1 and ISO 21930 do not use the A2 set. */
export function unitFor(key: IndicatorKey, method: string): string {
  const legacy = method === "EN 15804+A1" || method === "ISO 21930"
  if (!legacy) return indicatorMeta(key).unit
  if (key === "ap") return "kg SO2 eq"
  if (key === "ep") return "kg PO4 eq"
  if (key === "pocp") return "kg C2H4 eq"
  if (key === "wdp") return "m³"
  return indicatorMeta(key).unit
}
