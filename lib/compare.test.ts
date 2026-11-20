import { describe, expect, it } from "vitest"

import { getProduct, productIds, products } from "@/data/seed"
import {
  axisScore,
  comparabilityIssues,
  comparisonToCsv,
  filterProducts,
  parseComparisonIds,
  percentDelta,
  resolveComparison,
  tabCounts,
  warningCopy,
} from "@/lib/compare"
import { percentShares } from "@/lib/format"

describe("percentDelta", () => {
  it("treats a drop as negative and a rise as positive", () => {
    expect(percentDelta(100, 80)).toBeCloseTo(-20)
    expect(percentDelta(100, 125)).toBeCloseTo(25)
  })

  it("returns null when the base is zero", () => {
    expect(percentDelta(0, 4)).toBeNull()
  })

  it("keeps the sign when the base is negative", () => {
    // -440 is higher impact than -612 (less carbon stored).
    const delta = percentDelta(-612, -440)
    expect(delta).not.toBeNull()
    expect(delta!).toBeGreaterThan(0)
    expect(percentDelta(-612, -700)!).toBeLessThan(0)
  })
})

describe("comparability", () => {
  const nordic = getProduct("hv-c30-089")!
  const meridian = getProduct("mx-c30-441")!
  const slab = getProduct("mx-slab-200")!
  const cement = getProduct("oz-cem-i-220")!
  const legacy = getProduct("oz-cem-i-a1")!
  const helvigCement = getProduct("hv-cem-i-042")!

  it("is quiet when category, unit and method match", () => {
    expect(comparabilityIssues([nordic, meridian])).toEqual([])
    expect(warningCopy([nordic, meridian])).toBeNull()
  })

  it("flags a different declared unit", () => {
    const issues = comparabilityIssues([nordic, slab])
    expect(issues.map((issue) => issue.field)).toEqual(["declaredUnit"])
    expect(warningCopy([nordic, slab])?.title).toMatch(/not a fair ranking/)
    expect(warningCopy([nordic, slab])?.body).toMatch(/1 m²/)
    expect(warningCopy([nordic, slab])?.body).toMatch(/1 m³/)
  })

  it("flags category and unit together", () => {
    const fields = comparabilityIssues([nordic, cement]).map((issue) => issue.field)
    expect(fields).toEqual(["category", "declaredUnit"])
  })

  it("flags a different calculation method even when the product looks the same", () => {
    const fields = comparabilityIssues([helvigCement, legacy]).map((issue) => issue.field)
    expect(fields).toEqual(["method"])
    expect(warningCopy([helvigCement, legacy])?.body).toMatch(/EN 15804\+A1/)
  })
})

describe("search", () => {
  it("matches name, category and product id, and ignores case", () => {
    expect(filterProducts(products, "nordic c30", "all").map((item) => item.id)).toContain(
      "hv-c30-089",
    )
    expect(filterProducts(products, "HV-C30-089", "all").map((item) => item.id)).toEqual([
      "hv-c30-089",
    ])
    const bricks = filterProducts(products, "clay brick", "all")
    expect(bricks.length).toBeGreaterThan(0)
    expect(bricks.every((item) => item.category === "brick")).toBe(true)
  })

  it("keeps own and public libraries apart", () => {
    const own = filterProducts(products, "c30", "own")
    const pub = filterProducts(products, "c30", "public")
    expect(own.every((item) => item.library === "own")).toBe(true)
    expect(pub.every((item) => item.library === "public")).toBe(true)
    expect(own.map((item) => item.id)).toContain("hv-c30-089")
    expect(pub.map((item) => item.id)).toContain("mx-c30-441")
    expect(own.map((item) => item.id)).not.toContain("mx-c30-441")
  })

  it("counts each tab for the current query", () => {
    const counts = tabCounts(products, "cement")
    expect(counts.all).toBe(counts.own + counts.public)
    expect(counts.own).toBeGreaterThan(0)
    expect(counts.public).toBeGreaterThan(0)
  })

  it("returns the whole tab when the query is blank", () => {
    expect(filterProducts(products, "   ", "own")).toHaveLength(
      products.filter((item) => item.library === "own").length,
    )
  })
})

describe("selection", () => {
  const known = productIds()

  it("drops the base, unknowns and duplicates, and caps at two others", () => {
    expect(parseComparisonIds("hv-c30-089", "hv-c30-089,mx-c30-441,nope,mx-c30-441,ks-rebar-eaf", known)).toEqual([
      "mx-c30-441",
      "ks-rebar-eaf",
    ])
  })

  it("reads a repeated query param", () => {
    expect(parseComparisonIds("hv-c30-089", ["pb-wirecut", "hv-brick-nf"], known)).toEqual([
      "pb-wirecut",
      "hv-brick-nf",
    ])
  })

  it("resolves a base plus the others", () => {
    const nordic = getProduct("hv-c30-089")!
    const set = resolveComparison(nordic, ["mx-c30-441", "missing", "hv-c30-089"], getProduct)
    expect(set.map((item) => item.id)).toEqual(["hv-c30-089", "mx-c30-441"])
  })
})

describe("axisScore", () => {
  it("puts the lowest impact at the centre and the highest at the rim", () => {
    expect(axisScore(10, [10, 30])).toBe(0)
    expect(axisScore(30, [10, 30])).toBe(1)
    expect(axisScore(20, [10, 30])).toBeCloseTo(0.5)
  })

  it("still orders a negative indicator", () => {
    expect(axisScore(-700, [-700, -400])).toBe(0)
    expect(axisScore(-400, [-700, -400])).toBe(1)
  })

  it("returns null when a single value cannot define a scale", () => {
    expect(axisScore(5, [5])).toBeNull()
  })
})

describe("csv", () => {
  it("includes one row per indicator and both products", () => {
    const csv = comparisonToCsv([getProduct("hv-c30-089")!, getProduct("mx-c30-441")!])
    expect(csv.split("\n")[0]).toMatch(/^product_id,/)
    expect(csv).toContain("hv-c30-089")
    expect(csv).toContain("mx-c30-441")
    expect(csv).toContain("Global warming")
    const rows = csv.trim().split("\n")
    expect(rows).toHaveLength(1 + 8 * 2)
  })
})

describe("percentShares", () => {
  it("sums to 100", () => {
    const parts = percentShares([0.74, 0.07, 0.01, 0.03, 0.07, 0.08])
    expect(parts.reduce((sum, value) => sum + value, 0)).toBe(100)
  })
})
