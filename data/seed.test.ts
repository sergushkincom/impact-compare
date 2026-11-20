import { describe, expect, it } from "vitest"

import { INDICATOR_KEYS, STAGE_KEYS } from "@/data/types"
import { products } from "@/data/seed"

describe("seed", () => {
  it("holds a full fictional catalogue, own and public", () => {
    expect(products.length).toBeGreaterThanOrEqual(15)
    expect(products.length).toBeLessThanOrEqual(20)
    expect(new Set(products.map((product) => product.id)).size).toBe(products.length)
    expect(products.some((product) => product.library === "own")).toBe(true)
    expect(products.some((product) => product.library === "public")).toBe(true)
    const categories = new Set(products.map((product) => product.category))
    expect(categories).toEqual(
      new Set(["cement", "concrete", "rebar", "brick", "insulation", "timber"]),
    )
  })

  it("keeps lifecycle stages summing to the declared total", () => {
    for (const product of products) {
      for (const key of INDICATOR_KEYS) {
        const sum = STAGE_KEYS.reduce((total, stage) => total + product.stages[stage][key], 0)
        expect(sum, `${product.id} ${key}`).toBeCloseTo(product.totals[key], 8)
      }
    }
  })

  it("keeps impact-source shares summing to 1", () => {
    for (const product of products) {
      expect(product.sources.length).toBeGreaterThan(1)
      for (const key of INDICATOR_KEYS) {
        const sum = product.sources.reduce((total, source) => total + source.shares[key], 0)
        expect(sum, `${product.id} ${key}`).toBeCloseTo(1, 8)
      }
    }
  })

  it("gives timber a negative total and a positive manufacturing stage", () => {
    const timber = products.filter((product) => product.category === "timber")
    expect(timber.length).toBeGreaterThanOrEqual(2)
    for (const product of timber) {
      expect(product.totals.gwp).toBeLessThan(0)
      expect(product.stages.A1.gwp).toBeLessThan(0)
      expect(product.stages.A3.gwp).toBeGreaterThan(0)
    }
  })

  it("includes a matched pair and a unit mismatch for concrete", () => {
    const nordic = products.find((product) => product.id === "hv-c30-089")!
    const meridian = products.find((product) => product.id === "mx-c30-441")!
    const slab = products.find((product) => product.id === "mx-slab-200")!
    expect(meridian.declaredUnit).toBe(nordic.declaredUnit)
    expect(meridian.method).toBe(nordic.method)
    expect(meridian.category).toBe(nordic.category)
    expect(slab.declaredUnit).not.toBe(nordic.declaredUnit)
  })
})
