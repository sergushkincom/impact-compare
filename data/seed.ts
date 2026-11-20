import {
  INDICATOR_KEYS,
  type Category,
  type ImpactSource,
  type IndicatorKey,
  type Indicators,
  type Library,
  type Product,
  type Stages,
} from "@/data/types"

/**
 * Fictional cradle-to-gate figures (modules A1–A3) for a made-up manufacturer,
 * Helvig Industri, and a handful of made-up public declarations.
 * Magnitudes sit in a plausible EN 15804 range. None of these are real EPDs.
 */

const weights = (...values: number[]): Indicators => {
  if (values.length !== INDICATOR_KEYS.length) {
    throw new Error(`Expected ${INDICATOR_KEYS.length} weights`)
  }
  return Object.fromEntries(
    INDICATOR_KEYS.map((key, index) => [key, values[index]]),
  ) as Indicators
}

function sourcesFrom(
  rows: { name: string; weight: Indicators }[],
): ImpactSource[] {
  const totals = Object.fromEntries(
    INDICATOR_KEYS.map((key) => [
      key,
      rows.reduce((sum, row) => sum + row.weight[key], 0),
    ]),
  ) as Indicators
  return rows.map((row) => ({
    name: row.name,
    shares: Object.fromEntries(
      INDICATOR_KEYS.map((key) => [key, row.weight[key] / totals[key]]),
    ) as Indicators,
  }))
}

function scale(base: Indicators, factor: Partial<Indicators> & { all?: number }): Indicators {
  const all = factor.all ?? 1
  return Object.fromEntries(
    INDICATOR_KEYS.map((key) => [key, base[key] * (factor[key] ?? all)]),
  ) as Indicators
}

type StageShare = [number, number, number]

function buildStages(
  totals: Indicators,
  share: StageShare,
  overrides?: Partial<Record<IndicatorKey, StageShare>>,
): Stages {
  const stages: Stages = { A1: {} as Indicators, A2: {} as Indicators, A3: {} as Indicators }
  for (const key of INDICATOR_KEYS) {
    const override = overrides?.[key]
    if (override) {
      stages.A1[key] = override[0]
      stages.A2[key] = override[1]
      stages.A3[key] = totals[key] - override[0] - override[1]
      continue
    }
    const a1 = totals[key] * share[0]
    const a2 = totals[key] * share[1]
    stages.A1[key] = a1
    stages.A2[key] = a2
    stages.A3[key] = totals[key] - a1 - a2
  }
  return stages
}

type Draft = {
  id: string
  name: string
  category: Category
  library: Library
  manufacturer: string
  declaredUnit: string
  method: string
  summary: string
  totals: Indicators
  stageShare: StageShare
  stageOverrides?: Partial<Record<IndicatorKey, StageShare>>
  sources: ImpactSource[]
}

function finish(draft: Draft): Product {
  return {
    id: draft.id,
    name: draft.name,
    category: draft.category,
    library: draft.library,
    manufacturer: draft.manufacturer,
    declaredUnit: draft.declaredUnit,
    method: draft.method,
    summary: draft.summary,
    totals: draft.totals,
    stages: buildStages(draft.totals, draft.stageShare, draft.stageOverrides),
    sources: draft.sources,
  }
}

const cementSources = sourcesFrom([
  { name: "Raw meal", weight: weights(18, 22, 30, 34, 16, 62, 8, 28) },
  { name: "Kiln fuel", weight: weights(64, 48, 46, 28, 58, 8, 72, 14) },
  { name: "Electricity", weight: weights(12, 18, 14, 16, 14, 18, 14, 22) },
  { name: "Inbound haul", weight: weights(6, 12, 10, 22, 12, 12, 6, 36) },
])

const concreteSources = sourcesFrom([
  { name: "Cement", weight: weights(74, 61, 58, 44, 55, 18, 50, 22) },
  { name: "Aggregates", weight: weights(7, 8, 14, 16, 10, 64, 12, 8) },
  { name: "Mixing water", weight: weights(1, 2, 2, 6, 2, 2, 1, 48) },
  { name: "Admixtures", weight: weights(3, 7, 5, 8, 9, 8, 5, 4) },
  { name: "Plant energy", weight: weights(7, 12, 10, 8, 12, 3, 24, 6) },
  { name: "Inbound haul", weight: weights(8, 10, 11, 18, 12, 5, 8, 12) },
])

const rebarSources = sourcesFrom([
  { name: "Scrap charge", weight: weights(22, 18, 16, 20, 14, 48, 12, 18) },
  { name: "Alloys", weight: weights(8, 14, 10, 12, 8, 36, 6, 8) },
  { name: "Furnace energy", weight: weights(48, 42, 46, 30, 52, 6, 58, 28) },
  { name: "Rolling", weight: weights(14, 16, 16, 14, 16, 4, 16, 22) },
  { name: "Inbound haul", weight: weights(8, 10, 12, 24, 10, 6, 8, 24) },
])

const brickSources = sourcesFrom([
  { name: "Clay", weight: weights(12, 16, 22, 28, 10, 58, 6, 34) },
  { name: "Firing fuel", weight: weights(68, 52, 50, 36, 64, 10, 74, 18) },
  { name: "Electricity", weight: weights(12, 18, 14, 12, 12, 20, 12, 16) },
  { name: "Inbound haul", weight: weights(8, 14, 14, 24, 14, 12, 8, 32) },
])

const woolSources = sourcesFrom([
  { name: "Mineral feedstock", weight: weights(28, 24, 32, 30, 18, 62, 16, 22) },
  { name: "Binder", weight: weights(18, 22, 16, 22, 28, 14, 18, 12) },
  { name: "Furnace energy", weight: weights(40, 36, 34, 22, 38, 10, 52, 28) },
  { name: "Inbound haul", weight: weights(14, 18, 18, 26, 16, 14, 14, 38) },
])

const timberSources = sourcesFrom([
  { name: "Forestry", weight: weights(70, 18, 24, 36, 16, 22, 18, 42) },
  { name: "Sawmill energy", weight: weights(12, 34, 28, 18, 24, 16, 42, 22) },
  { name: "Adhesives", weight: weights(10, 32, 28, 22, 44, 48, 28, 12) },
  { name: "Inbound haul", weight: weights(8, 16, 20, 24, 16, 14, 12, 24) },
])

const A2 = "EN 15804+A2"
const A1 = "EN 15804+A1"
const ISO = "ISO 21930"

const cemI: Indicators = {
  gwp: 836,
  odp: 2.1e-6,
  ap: 1.72,
  ep: 0.038,
  pocp: 1.54,
  adpe: 2.8e-4,
  adpf: 4520,
  wdp: 16.4,
}

const c30: Indicators = {
  gwp: 268,
  odp: 7.4e-7,
  ap: 0.58,
  ep: 0.013,
  pocp: 0.46,
  adpe: 1.2e-4,
  adpf: 1540,
  wdp: 6.8,
}

const rebar: Indicators = {
  gwp: 748,
  odp: 1.8e-6,
  ap: 2.15,
  ep: 0.021,
  pocp: 0.88,
  adpe: 4.6e-4,
  adpf: 8640,
  wdp: 24.5,
}

const brick: Indicators = {
  gwp: 238,
  odp: 1.1e-6,
  ap: 0.84,
  ep: 0.016,
  pocp: 0.62,
  adpe: 2.2e-4,
  adpf: 3120,
  wdp: 3.6,
}

const wool: Indicators = {
  gwp: 3.6,
  odp: 2.4e-8,
  ap: 0.012,
  ep: 0.00042,
  pocp: 0.008,
  adpe: 1.8e-6,
  adpf: 61,
  wdp: 0.38,
}

const clt: Indicators = {
  gwp: -628,
  odp: 3.2e-6,
  ap: 0.41,
  ep: 0.018,
  pocp: 0.52,
  adpe: 1.1e-4,
  adpf: 1860,
  wdp: 14.2,
}

const HELVIG = "Helvig Industri"

export const DEFAULT_PRODUCT_ID = "hv-c30-089"

export const products: Product[] = [
  finish({
    id: "hv-cem-i-042",
    name: "CEM I 52.5 R",
    category: "cement",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 t",
    method: A2,
    summary:
      "Ordinary Portland cement from the fictional Bergen kiln. High clinker factor, the reference the blended cements are judged against.",
    totals: cemI,
    stageShare: [0.12, 0.04, 0.84],
    sources: cementSources,
  }),
  finish({
    id: "hv-cem-ii-018",
    name: "CEM II/B-M 42.5",
    category: "cement",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 t",
    method: A2,
    summary:
      "Blended cement, limestone and fly ash, same kiln as CEM I. Lower clinker, so global warming drops faster than minerals do.",
    totals: scale(cemI, { gwp: 0.74, adpf: 0.82, ap: 0.71, ep: 0.78, pocp: 0.76, odp: 0.8, adpe: 0.92, wdp: 0.84 }),
    stageShare: [0.16, 0.05, 0.79],
    sources: cementSources,
  }),
  finish({
    id: "hv-cem-iii-007",
    name: "CEM III/B 42.5",
    category: "cement",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 t",
    method: A2,
    summary:
      "Slag cement. Global warming is much lower; minerals depletion is not, because the slag carries its own abiotic load.",
    totals: scale(cemI, { gwp: 0.39, adpf: 0.55, ap: 0.48, ep: 0.62, pocp: 0.5, odp: 0.7, adpe: 1.45, wdp: 0.72 }),
    stageShare: [0.28, 0.06, 0.66],
    sources: cementSources,
  }),
  finish({
    id: "hv-c25-110",
    name: "Harbour C25/30",
    category: "concrete",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 m³",
    method: A2,
    summary:
      "A leaner ready-mix for marine works in the fiction. Less cement than Nordic C30, and a longer aggregate haul to the quay plant.",
    totals: scale(c30, { gwp: 0.8, adpf: 0.83, wdp: 0.79, ap: 0.84, ep: 0.82, pocp: 0.85, adpe: 0.9, odp: 0.82 }),
    stageShare: [0.74, 0.12, 0.14],
    sources: concreteSources,
  }),
  finish({
    id: "hv-c30-089",
    name: "Nordic C30/37",
    category: "concrete",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 m³",
    method: A2,
    summary:
      "The house ready-mix. Self-compacting, ordinary Portland binder, aggregates from the fictional Osøy pit. This is the product the comparison opens on.",
    totals: c30,
    stageShare: [0.76, 0.1, 0.14],
    sources: concreteSources,
  }),
  finish({
    id: "hv-c45-204",
    name: "Pier C45/55",
    category: "concrete",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 m³",
    method: A2,
    summary:
      "High-strength mix for a pier superstructure. More cement per cubic metre, so almost every indicator moves with the binder.",
    totals: scale(c30, { gwp: 1.27, adpf: 1.29, wdp: 1.19, ap: 1.32, ep: 1.24, pocp: 1.28, adpe: 1.15, odp: 1.22 }),
    stageShare: [0.81, 0.08, 0.11],
    sources: concreteSources,
  }),
  finish({
    id: "hv-c30-rec",
    name: "Nordic C30/37 recycled",
    category: "concrete",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 m³",
    method: A2,
    summary:
      "Same strength class as Nordic C30/37 with 40% recycled coarse aggregate. Global warming dips; water deprivation rises with the washing.",
    totals: scale(c30, { gwp: 0.93, adpf: 0.97, wdp: 1.18, ap: 0.95, ep: 0.98, pocp: 0.94, adpe: 0.7, odp: 0.96 }),
    stageShare: [0.72, 0.15, 0.13],
    sources: concreteSources,
  }),
  finish({
    id: "hv-rebar-500",
    name: "Ribbed bar B500B",
    category: "rebar",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 t",
    method: A2,
    summary:
      "Electric-arc reinforcement bar, fictional melt shop at Odda. Scrap-based, so the furnace electricity dominates fossil energy.",
    totals: rebar,
    stageShare: [0.22, 0.06, 0.72],
    sources: rebarSources,
  }),
  finish({
    id: "hv-brick-nf",
    name: "Facing brick NF",
    category: "brick",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 t",
    method: A2,
    summary:
      "Wirecut facing brick, fictional clay pit outside Fredrikstad. Firing fuel is most of the global warming.",
    totals: brick,
    stageShare: [0.18, 0.07, 0.75],
    sources: brickSources,
  }),
  finish({
    id: "hv-wool-100",
    name: "Loft wool 100 mm",
    category: "insulation",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 m²",
    method: A2,
    summary:
      "Stone-wool loft batt, 100 mm, declared for one square metre at the stated thickness. Not comparable with a cubic metre of concrete.",
    totals: wool,
    stageShare: [0.46, 0.14, 0.4],
    sources: woolSources,
  }),
  finish({
    id: "hv-wool-160",
    name: "Loft wool 160 mm",
    category: "insulation",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 m²",
    method: A2,
    summary:
      "The same batt at 160 mm. Thicker than 100 mm, so the square metre carries more material — and the two can be ranked.",
    totals: scale(wool, { all: 1.48, wdp: 1.42, adpe: 1.5 }),
    stageShare: [0.46, 0.14, 0.4],
    sources: woolSources,
  }),
  finish({
    id: "hv-clt-140",
    name: "Crosslam 140",
    category: "timber",
    library: "own",
    manufacturer: HELVIG,
    declaredUnit: "1 m³",
    method: A2,
    summary:
      "Cross-laminated timber, GWP-total with biogenic carbon. The negative total is storage in the wood, not a kiln that removes CO2e. A2 and A3 are still emissions.",
    totals: clt,
    stageShare: [0.55, 0.28, 0.17],
    stageOverrides: { gwp: [-860, 72, 0] },
    sources: timberSources,
  }),
  finish({
    id: "oz-cem-i-220",
    name: "Ostmark CEM I 42.5",
    category: "cement",
    library: "public",
    manufacturer: "Ostmark Zement",
    declaredUnit: "1 t",
    method: A2,
    summary:
      "A public-database Portland cement from a fictional inland plant. Same unit and method as Helvig CEM I, slightly higher kiln fuel.",
    totals: scale(cemI, { gwp: 1.06, adpf: 1.08, wdp: 1.12, ap: 1.04, ep: 1.05, pocp: 1.07, adpe: 0.96, odp: 1.02 }),
    stageShare: [0.11, 0.07, 0.82],
    sources: cementSources,
  }),
  finish({
    id: "oz-cem-i-a1",
    name: "Ostmark CEM I 42.5 legacy",
    category: "cement",
    library: "public",
    manufacturer: "Ostmark Zement",
    declaredUnit: "1 t",
    method: A1,
    summary:
      "The same plant's older declaration, calculated under EN 15804+A1. Acidification and eutrophication use different units from the A2 set.",
    totals: scale(cemI, { gwp: 0.98, adpf: 1.02, ap: 0.55, ep: 2.4, pocp: 0.18, wdp: 0.42, adpe: 0.9, odp: 1.1 }),
    stageShare: [0.14, 0.06, 0.8],
    sources: cementSources,
  }),
  finish({
    id: "mx-c30-441",
    name: "Meridian C30/37",
    category: "concrete",
    library: "public",
    manufacturer: "Meridian Mix",
    declaredUnit: "1 m³",
    method: A2,
    summary:
      "A competitor ready-mix in the same strength class, unit and method as Nordic C30/37. Fair to rank. The gap is mostly binder, not the plant.",
    totals: scale(c30, { gwp: 1.11, adpf: 1.11, wdp: 0.9, ap: 1.08, ep: 1.06, pocp: 1.15, adpe: 1.22, odp: 1.05 }),
    stageShare: [0.79, 0.09, 0.12],
    sources: concreteSources,
  }),
  finish({
    id: "mx-slab-200",
    name: "Meridian slab 200 mm",
    category: "concrete",
    library: "public",
    manufacturer: "Meridian Mix",
    declaredUnit: "1 m²",
    method: A2,
    summary:
      "The same family of mix, declared for one square metre of a 200 mm slab. A smaller GWP here is thinner concrete, not a better recipe.",
    totals: scale(c30, { all: 0.22, gwp: 0.23, adpf: 0.22, wdp: 0.2 }),
    stageShare: [0.78, 0.1, 0.12],
    sources: concreteSources,
  }),
  finish({
    id: "ks-rebar-eaf",
    name: "Kestrel bar B500B",
    category: "rebar",
    library: "public",
    manufacturer: "Kestrel Steel",
    declaredUnit: "1 t",
    method: A2,
    summary:
      "Public EAF rebar. Lower electricity carbon than the Helvig bar, higher minerals depletion from the alloy recipe.",
    totals: scale(rebar, { gwp: 0.91, adpf: 0.88, wdp: 0.8, ap: 0.94, ep: 0.9, pocp: 0.92, adpe: 1.18, odp: 0.86 }),
    stageShare: [0.2, 0.08, 0.72],
    sources: rebarSources,
  }),
  finish({
    id: "pb-wirecut",
    name: "Palisade wirecut",
    category: "brick",
    library: "public",
    manufacturer: "Palisade Brickworks",
    declaredUnit: "1 t",
    method: A2,
    summary:
      "A public facing brick from an older tunnel kiln. Same unit and method as Helvig NF, higher firing fuel.",
    totals: scale(brick, { gwp: 1.16, adpf: 1.2, ap: 1.18, ep: 1.1, pocp: 1.14, wdp: 0.94, adpe: 1.05, odp: 1.08 }),
    stageShare: [0.16, 0.06, 0.78],
    sources: brickSources,
  }),
  finish({
    id: "lw-batt-100",
    name: "Lumenwool batt 100 mm",
    category: "insulation",
    library: "public",
    manufacturer: "Lumenwool",
    declaredUnit: "1 m²",
    method: ISO,
    summary:
      "A public stone-wool batt declared to ISO 21930, not EN 15804+A2. Same thickness, different indicator definitions.",
    totals: scale(wool, { gwp: 1.22, adpf: 1.18, ap: 0.7, ep: 3.1, pocp: 0.4, wdp: 0.55, adpe: 1.1, odp: 1.3 }),
    stageShare: [0.42, 0.18, 0.4],
    sources: woolSources,
  }),
  finish({
    id: "bg-glulam",
    name: "Birch & Grain glulam",
    category: "timber",
    library: "public",
    manufacturer: "Birch & Grain",
    declaredUnit: "1 m³",
    method: A2,
    summary:
      "Public glulam, GWP-total with biogenic carbon. More adhesive than Crosslam 140, so smog and fossil energy sit higher even though the total GWP is still negative.",
    totals: scale(clt, { gwp: 0.62, adpf: 1.28, pocp: 1.45, ap: 1.22, ep: 1.18, wdp: 0.9, adpe: 1.35, odp: 1.1 }),
    stageShare: [0.48, 0.3, 0.22],
    stageOverrides: { gwp: [-690, 96, 0] },
    sources: timberSources,
  }),
]

const byId = new Map(products.map((product) => [product.id, product]))

export function getProduct(id: string): Product | undefined {
  return byId.get(id.toLowerCase())
}

export function productIds(): Set<string> {
  return new Set(products.map((product) => product.id))
}
