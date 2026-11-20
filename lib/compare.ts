import {
  CATEGORY_LABEL,
  INDICATOR_KEYS,
  INDICATORS,
  LIBRARY_LABEL,
  STAGE_KEYS,
  STAGE_LABEL,
  type IndicatorKey,
  type Indicators,
  type Product,
  unitFor,
} from "@/data/types"
import { csvCell, formatNumber } from "@/lib/format"

export type LibraryTab = "own" | "public" | "all"

export type ComparabilityField = "category" | "declaredUnit" | "method"

export type ComparabilityIssue = {
  field: ComparabilityField
  /** Products that differ from the base (the first product). */
  products: Product[]
}

const FIELD_LABEL: Record<ComparabilityField, string> = {
  category: "category",
  declaredUnit: "declared unit",
  method: "calculation method",
}

export function percentDelta(base: number, other: number): number | null {
  if (!Number.isFinite(base) || !Number.isFinite(other)) return null
  if (base === 0) return null
  return ((other - base) / Math.abs(base)) * 100
}

export function comparabilityIssues(products: Product[]): ComparabilityIssue[] {
  if (products.length < 2) return []
  const base = products[0]
  const issues: ComparabilityIssue[] = []
  const fields: ComparabilityField[] = ["category", "declaredUnit", "method"]
  for (const field of fields) {
    const differing = products.filter((product) => product[field] !== base[field])
    if (differing.length > 0) issues.push({ field, products: differing })
  }
  return issues
}

function nameList(products: Product[]): string {
  const names = products.map((product) => product.name)
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} and ${names[1]}`
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
}

export function warningCopy(products: Product[]): { title: string; body: string } | null {
  const issues = comparabilityIssues(products)
  if (issues.length === 0) return null
  const base = products[0]
  const sentences = issues.map((issue) => {
    const names = nameList(issue.products)
    const verb = issue.products.length > 1 ? "differ" : "differs"
    if (issue.field === "category") {
      const theirs = issue.products
        .map((product) => CATEGORY_LABEL[product.category])
        .join(", ")
      return `${names} ${verb} in category (${theirs}; ${base.name} is ${CATEGORY_LABEL[base.category]}).`
    }
    if (issue.field === "declaredUnit") {
      const theirs = issue.products
        .map((product) => `${product.name} is per ${product.declaredUnit}`)
        .join("; ")
      return `${theirs}. ${base.name} is per ${base.declaredUnit}.`
    }
    const theirs = issue.products
      .map((product) => `${product.name} uses ${product.method}`)
      .join("; ")
    return `${theirs}. ${base.name} uses ${base.method}.`
  })
  return {
    title: "These declarations are not a fair ranking",
    body: `${sentences.join(" ")} The percentages below are arithmetic against ${base.name}. They are not a recommendation, and a smaller number can be an artefact of the ${issues.map((issue) => FIELD_LABEL[issue.field]).join(" or ")}.`,
  }
}

export function searchHaystack(product: Product): string {
  return [
    product.name,
    product.id,
    product.manufacturer,
    CATEGORY_LABEL[product.category],
    product.category,
  ]
    .join(" ")
    .toLowerCase()
}

export function filterProducts(
  products: Product[],
  query: string,
  tab: LibraryTab,
): Product[] {
  const needle = query.trim().toLowerCase()
  return products.filter((product) => {
    if (tab === "own" && product.library !== "own") return false
    if (tab === "public" && product.library !== "public") return false
    if (!needle) return true
    return searchHaystack(product).includes(needle)
  })
}

export function tabCounts(
  products: Product[],
  query: string,
): Record<LibraryTab, number> {
  return {
    own: filterProducts(products, query, "own").length,
    public: filterProducts(products, query, "public").length,
    all: filterProducts(products, query, "all").length,
  }
}

/** Keep at most two other products. Drop the base, unknowns, and duplicates. */
export function parseComparisonIds(
  baseId: string,
  raw: string | string[] | undefined,
  known: ReadonlySet<string>,
): string[] {
  const text = Array.isArray(raw) ? raw.join(",") : (raw ?? "")
  const out: string[] = []
  for (const part of text.split(",")) {
    const id = part.trim().toLowerCase()
    if (!id || id === baseId.toLowerCase()) continue
    if (!known.has(id)) continue
    if (out.includes(id)) continue
    out.push(id)
    if (out.length === 2) break
  }
  return out
}

export function resolveComparison(
  base: Product,
  otherIds: readonly string[],
  byId: (id: string) => Product | undefined,
): Product[] {
  const others: Product[] = []
  for (const id of otherIds) {
    if (id === base.id || others.some((product) => product.id === id)) continue
    const product = byId(id)
    if (!product) continue
    others.push(product)
    if (others.length === 2) break
  }
  return [base, ...others]
}

/**
 * 0 is the lowest impact in the set (drawn at the centre), 1 is the highest
 * (drawn at the rim). Returns null when the set cannot define a scale.
 */
export function axisScore(value: number, values: readonly number[]): number | null {
  if (values.length < 2) return null
  const finite = values.filter((item) => Number.isFinite(item))
  if (finite.length < 2 || !Number.isFinite(value)) return null
  const min = Math.min(...finite)
  const max = Math.max(...finite)
  if (min === max) return 0.5
  return (value - min) / (max - min)
}

export function peersOf(product: Product, all: readonly Product[]): Product[] {
  return all.filter(
    (candidate) =>
      candidate.category === product.category &&
      candidate.declaredUnit === product.declaredUnit &&
      candidate.method === product.method,
  )
}

export function sortForPicker(products: Product[], baseId: string): Product[] {
  return [...products].sort((a, b) => {
    if (a.id === baseId) return -1
    if (b.id === baseId) return 1
    if (a.library !== b.library) return a.library === "own" ? -1 : 1
    return a.name.localeCompare(b.name, "en")
  })
}

export function comparisonToCsv(products: Product[]): string {
  const header = [
    "product_id",
    "name",
    "library",
    "manufacturer",
    "category",
    "declared_unit",
    "method",
    "indicator",
    "indicator_name",
    "unit",
    "total",
    ...STAGE_KEYS.map((stage) => stage),
  ]
  const lines = [header.join(",")]
  for (const product of products) {
    for (const indicator of INDICATORS) {
      const unit = unitFor(indicator.key, product.method)
      const row = [
        product.id,
        product.name,
        LIBRARY_LABEL[product.library],
        product.manufacturer,
        CATEGORY_LABEL[product.category],
        product.declaredUnit,
        product.method,
        indicator.key,
        indicator.name,
        unit,
        formatNumber(product.totals[indicator.key]),
        ...STAGE_KEYS.map((stage) => formatNumber(product.stages[stage][indicator.key])),
      ]
      lines.push(row.map((cell) => csvCell(cell)).join(","))
    }
  }
  return `${lines.join("\n")}\n`
}

export function stageRows(
  products: Product[],
  key: IndicatorKey,
): { stage: string; label: string; [id: string]: string | number }[] {
  return STAGE_KEYS.map((stage) => {
    const row: { stage: string; label: string; [id: string]: string | number } = {
      stage,
      label: `${stage} ${STAGE_LABEL[stage]}`,
    }
    for (const product of products) {
      row[product.id] = product.stages[stage][key]
    }
    return row
  })
}

export function emptyIndicators(): Indicators {
  return Object.fromEntries(INDICATOR_KEYS.map((key) => [key, 0])) as Indicators
}

export const HEADLINE_KEYS = ["gwp", "adpf", "wdp"] as const satisfies readonly IndicatorKey[]
