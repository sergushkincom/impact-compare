import { chromium } from "@playwright/test"
import { mkdir } from "node:fs/promises"

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000"
const out = new URL("../docs/", import.meta.url)

await mkdir(out, { recursive: true })

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: "dark",
  recordVideo: { dir: "/tmp/relative-video", size: { width: 1440, height: 900 } },
})
const page = await context.newPage()
const pause = (ms) => page.waitForTimeout(ms)

await page.goto(`${base}/products/hv-c30-089`, { waitUntil: "networkidle" })
await page.getByRole("heading", { level: 1, name: "Nordic C30/37" }).waitFor()
await pause(600)
await page.screenshot({ path: new URL("profile.png", out).pathname })

async function openCompare() {
  const dialog = page.getByRole("dialog")
  await page.getByRole("button", { name: "Compare", exact: true }).click()
  await dialog.getByRole("heading", { name: "Select products to compare" }).waitFor()
  return dialog
}

await page.getByRole("heading", { name: "Lifecycle stages A1–A3" }).scrollIntoViewIfNeeded()
await pause(300)
await page.screenshot({ path: new URL("profile-stages.png", out).pathname })
await page.evaluate(() => window.scrollTo(0, 0))
await pause(200)

const dialog = await openCompare()
await pause(300)
await page.screenshot({ path: new URL("compare-list.png", out).pathname })

await dialog.getByRole("tab", { name: /Public database/ }).click()
await dialog.getByLabel("Search by name, category, or product ID").fill("Meridian")
await pause(200)
await dialog.getByRole("checkbox", { name: /Meridian C30\/37/ }).hover()
await pause(350)
await page.screenshot({ path: new URL("compare-search.png", out).pathname })

await dialog.getByRole("checkbox", { name: /Meridian C30\/37/ }).check()
await pause(300)
await page.screenshot({ path: new URL("compare-selected.png", out).pathname })
await dialog.getByRole("button", { name: "Compare 2 products" }).click()
await page.getByRole("heading", { level: 1, name: "Comparison" }).waitFor()
await pause(500)
await page.screenshot({ path: new URL("comparison.png", out).pathname })

await page.mouse.move(8, 8)
await page.getByRole("heading", { name: "Where the difference comes from" }).scrollIntoViewIfNeeded()
await pause(400)
await page.mouse.move(8, 8)
await page.screenshot({ path: new URL("comparison-stages.png", out).pathname })

await page.evaluate(() => window.scrollTo(0, 0))
await openCompare()
await dialog.getByRole("tab", { name: /^All/ }).click()
await dialog.getByRole("checkbox", { name: /Meridian C30\/37/ }).uncheck()
await dialog.getByLabel("Search by name, category, or product ID").fill("Ostmark CEM I 42.5")
await dialog.getByRole("checkbox", { name: /Ostmark CEM I 42\.5(?! legacy)/ }).check()
await pause(300)
await page.screenshot({ path: new URL("compare-warning.png", out).pathname })
await dialog.getByRole("button", { name: "Compare 2 products" }).click()
await page.getByRole("heading", { name: "These declarations are not a fair ranking" }).waitFor()
await pause(300)
await page.screenshot({ path: new URL("warning.png", out).pathname })

await context.close()
await browser.close()
console.log("captured")
