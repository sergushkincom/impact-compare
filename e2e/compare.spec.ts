import { expect, test } from "@playwright/test"

test("the site link unfurls as a large card", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveURL(/\/products\/hv-c30-089$/)

  const title = "Relative — Nordic against Meridian"
  const description =
    "Global warming is higher, water is lower. Same cubic metre, same method. Every figure is fictional."

  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", title)
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", description)
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /^https:\/\/impact-compare\.vercel\.app\/opengraph-image/,
  )
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image")
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute("content", title)
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute("content", description)
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute(
    "content",
    /^https:\/\/impact-compare\.vercel\.app\/opengraph-image/,
  )

  const image = await page.request.get("/opengraph-image")
  expect(image.status()).toBe(200)
  expect(image.headers()["content-type"]).toContain("image/png")
  const body = await image.body()
  expect(body.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a")
  expect(body.byteLength).toBeGreaterThan(8_000)
})

test("profile, compare, two products, shareable comparison", async ({ page }) => {
  await page.goto("/products/hv-c30-089")

  await expect(page.getByRole("heading", { level: 1, name: "Nordic C30/37" })).toBeVisible()
  await expect(page.getByText("kg CO2e").first()).toBeVisible()
  await expect(page.getByRole("heading", { name: "Eight indicators" })).toBeVisible()
  await expect(page.getByRole("heading", { name: "Lifecycle stages A1–A3" })).toBeVisible()

  await page.getByRole("button", { name: "Compare", exact: true }).click()
  const dialog = page.getByRole("dialog")
  await expect(dialog.getByRole("heading", { name: "Select products to compare" })).toBeVisible()

  await dialog.getByRole("tab", { name: /Public database/ }).click()
  await dialog.getByLabel("Search by name, category, or product ID").fill("Meridian C30/37")
  const row = dialog.getByRole("checkbox", { name: /Meridian C30\/37/ })
  await row.focus()
  await expect(dialog.getByRole("complementary", { name: "Product preview" })).toContainText("Meridian C30/37")
  await row.check()
  await dialog.getByRole("button", { name: "Compare 2 products" }).click()

  await expect(page).toHaveURL(/\/products\/hv-c30-089\?with=mx-c30-441$/)
  await expect(page.getByRole("heading", { level: 1, name: "Comparison" })).toBeVisible()
  await expect(page.getByText("higher than Nordic C30/37").first()).toBeVisible()
  await expect(page.getByText("declared unit and method match")).toBeVisible()

  await page.getByRole("button", { name: "Ozone depletion" }).click()
  await expect(page.getByRole("button", { name: "Ozone depletion" })).toHaveAttribute("aria-pressed", "false")

  await page.reload()
  await expect(page.getByRole("heading", { level: 1, name: "Comparison" })).toBeVisible()
  await expect(page.getByText("Meridian C30/37").first()).toBeVisible()

  await page.getByRole("link", { name: "Profile" }).click()
  await expect(page).toHaveURL(/\/products\/hv-c30-089$/)
  await expect(page.getByRole("heading", { level: 1, name: "Nordic C30/37" })).toBeVisible()
})
