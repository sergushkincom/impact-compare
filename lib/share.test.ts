import { describe, expect, it } from "vitest"

import { SHARE_DESCRIPTION, SHARE_TITLE, shareCard } from "@/lib/share"

describe("share card", () => {
  const card = shareCard()

  it("is the fair Nordic against Meridian comparison", () => {
    expect(card.baseName).toBe("Nordic C30/37")
    expect(card.otherName).toBe("Meridian C30/37")
    expect(card.baseId).toBe("hv-c30-089")
    expect(card.otherId).toBe("mx-c30-441")
    expect(card.declaredUnit).toBe("1 m³")
    expect(card.method).toBe("EN 15804+A2")
    expect(card.rows.map((row) => row.key)).toEqual(["gwp", "adpf", "wdp"])
  })

  it("shows global warming higher and water lower", () => {
    const gwp = card.rows.find((row) => row.key === "gwp")
    const water = card.rows.find((row) => row.key === "wdp")
    const energy = card.rows.find((row) => row.key === "adpf")
    expect(gwp).toMatchObject({ baseText: "268", otherText: "297", percent: "+11%", word: "higher" })
    expect(energy).toMatchObject({ baseText: "1,540", otherText: "1,709", percent: "+11%", word: "higher" })
    expect(water).toMatchObject({ baseText: "6.8", otherText: "6.12", percent: "−10%", word: "lower" })
    expect(gwp!.otherBar).toBeGreaterThan(gwp!.baseBar)
    expect(water!.otherBar).toBeLessThan(water!.baseBar)
  })

  it("says the figures are fictional in the text that accompanies the image", () => {
    expect(SHARE_TITLE).toContain("Relative")
    expect(SHARE_DESCRIPTION.toLowerCase()).toContain("fictional")
    expect(SHARE_DESCRIPTION).toContain("water is lower")
  })
})
