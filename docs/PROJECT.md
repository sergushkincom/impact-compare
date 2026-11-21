# Relative — project passport

Relative is a clickable comparison of product environmental impact, live at [https://impact-compare.vercel.app](https://impact-compare.vercel.app).

**One-line promise:** show whether one construction product is actually lower-impact than another, and which part of its life makes the gap.

Prototype only. The figures are fictional. The app is not affiliated with any vendor.

## Who it is for

A sustainability manager at a materials company, with one product's environmental declaration open, who has to answer a procurement question before a meeting: is the other mix actually better, or does it only look better because the declaration is per square metre, or calculated under an older method?

The useful question is comparative. Against another of our mixes, or against a competitor from a public database, which one is lower, and where does the difference come from?

## Problems it solves

A declaration in the shape of EN 15804, cradle-to-gate, modules A1–A3, is hard to judge alone. Global warming in kilograms of CO2e is the only number most people can read. It does not say whether another product is better, and it does not say whether the gap is raw materials, transport, or the plant.

Each product carries eight indicators. A product can be better on global warming and worse on water in the same comparison. Nordic C30/37 against Meridian C30/37 is that case. A screen that only offers global warming hides the trade.

People compare things that should not be ranked: a cubic metre of concrete with a square metre of slab, a current declaration with an older method whose acidification unit is a different unit. Search will not stop them.

Timber can show a negative global-warming total because of biogenic carbon. The manufacturing stage is still a positive emission. The total hides it. A percent change that divides by the raw negative number flips "lower" and "higher".

## Main goals

1. Make the comparison the decision moment: two or three products, the one you opened as the base, percentages against that base, and a sentence that says whether those percentages are a ranking.
2. Show where the difference comes from — A1 raw materials, A2 transport, A3 manufacturing — one indicator at a time, so kilograms of CO2e never share an axis with a trace gas.
3. Keep the other indicators on the same page, so a win on global warming cannot hide a loss on water or minerals.
4. Leave the chart up when the declarations are not comparable, and say on screen that the percentages are arithmetic.
5. Put the selection in the URL so the comparison can be copied, and offer the same figures as a CSV.
6. Stay a design prototype: fictional data, a fixed catalogue, no workflow beyond reading and comparing.

## Product principles

- **Own library and the public database are tabs, with a count on each.** The job splits in two: another of ours, or the market. Search matches name, category, product id, and manufacturer.
- **The warning does not hide the chart.** If category, declared unit, or calculation method differs from the base, a lower number is not a better product. The figures stay. The deltas say "not the same basis" and take the higher-impact colour, so nothing is styled as a winner.
- **Two or three products, and the one you opened is the base.** A percentage needs one denominator. Three is the last count where a radar line and a stage bar still read as a particular product.
- **The radar and the stages stay on the same page.** The radar says which indicator differs. The stages say whether that difference is raw materials, transport, or manufacturing.
- **The centre of the radar is the lowest impact in the set.** Closer to the centre is lower impact, among these products. It is not a score out of 100. On a profile the scale is peers with the same category, declared unit, and method. On a comparison the scale is the products on screen.
- **Colour is reserved for meaning.** One series colour per product. Green is lower impact. Orange is higher impact. Glass surfaces stay neutral grey.
- **Percent change divides by the absolute value of the base.** A negative global-warming total still points the right way. A zero base has no percentage.
- **Dark is the default.** Light is the same panes in daylight. The choice is stored under `relative-theme`. Motion is a short fade and is skipped when the user prefers reduced motion.
- **Every figure is labelled fictional.**

## Screens and flows

| Route | What it is for |
| --- | --- |
| `/` | Redirects to the house product, `/products/hv-c30-089` (Nordic C30/37). |
| `/products/[id]` | The profile of one declaration. |
| `/products/[id]?with=id[,id]` | The comparison. The path product is the base. At most two other known ids. The base, unknowns, and duplicates are dropped. |
| Unknown id | Not-found page. The catalogue is the twenty products shipped with the prototype. A link opens Nordic C30/37. |

**Profile.** Identity card: material swatch, category, library (own or public), product id, summary, manufacturer, declared unit, method, and the line "modules A1–A3 · fictional figures". Three headlines: global warming, fossil energy, water deprivation. An eight-axis radar beside the absolute figures. A stage chart for one indicator at a time (toggle by short name: GWP, ODP, AP, EP, POCP, ADPe, ADPf, WDP), and a bar list of where that indicator comes from (cement, kiln fuel, and so on). A tooltip states that use and end of life are outside these figures.

**Compare.** The header button opens "Select products to compare". The opened product stays the base and is pinned at the top of the list. Search, then three tabs — Own library, Public database, All — each with a count for the current query. Rows are checkboxes. The preview card follows hover and keyboard focus and shows the three headlines. The dialog allows one or two others. If the draft set differs in category, unit, or method, the same warning appears before you confirm. Confirm writes the URL and closes the dialog. Enter in the search field moves focus to the first row.

**Comparison.** Heading, a sentence that either confirms a fair A1–A3 ranking or points at the warning, then an alert titled "These declarations are not a fair ranking" when category, declared unit, or method differs. One card per product, with a series dot and a Base badge on the first. Tiles of the active indicators: the base figure, then each other product's figure, percent, and "higher" or "lower". An overlaid radar, with toggles to turn indicators off (at least one stays on; turning one off removes it from the radar, the tiles, and the stage charts). Stage charts, one per active indicator. The header adds **Copy link** (clipboard, "Copied" for two seconds), **Export** (CSV named `relative-<ids>.csv`, one row per product per indicator, totals and A1–A3), and **Profile** (drops `with` and returns to the base).

**Chrome on every product screen.** Sticky header: the Relative wordmark links to the current product's profile, the product name and either its category or "comparison", a theme switch, and **Compare**. Footer: "Relative is a design prototype. Every figure is fictional. Not affiliated with any vendor." A skip link targets `#content`.

The README walkthrough is the intended demo: open Nordic C30/37, Compare, Public database, search `Meridian`, tick Meridian C30/37, land on `/products/hv-c30-089?with=mx-c30-441`. Ostmark CEM I 42.5 or Meridian slab 200 mm is the warning.

## Data

All product data is mock, seeded in the repo. There is no database, no API, and no user-saved library.

- `data/types.ts` — indicators, stages, categories, libraries, and the unit each method uses.
- `data/seed.ts` — the catalogue. `getProduct` looks up by id, case-insensitive. `DEFAULT_PRODUCT_ID` is `hv-c30-089`.
- `lib/compare.ts` — percent deltas, comparability, search, the two-other cap, radar scale, peers, CSV.
- `lib/format.ts` — en-GB numbers, percents (a minus sign, not a hyphen), CSV cells, source shares that sum to 100.

Twenty fictional products. Twelve in the own library of the fictional manufacturer Helvig Industri, eight in the public database (Ostmark Zement, Meridian Mix, Kestrel Steel, Palisade Brickworks, Lumenwool, Birch & Grain). Categories: cement, ready-mix concrete, reinforcement steel, clay brick, insulation, timber. Declared units are `1 t`, `1 m³`, or `1 m²`. Methods are `EN 15804+A2`, `EN 15804+A1`, and `ISO 21930`. A1 and ISO 21930 override the units for acidification, eutrophication, smog, and water.

Indicators, A2 units:

| Key | Name | Unit |
| --- | --- | --- |
| gwp | Global warming | kg CO2e |
| odp | Ozone depletion | kg CFC-11 eq |
| ap | Acidification | mol H+ eq |
| ep | Eutrophication | kg P eq |
| pocp | Smog formation | kg NMVOC eq |
| adpe | Minerals depletion | kg Sb eq |
| adpf | Fossil energy | MJ |
| wdp | Water deprivation | m³ world eq |

Stages are A1 raw materials, A2 transport, A3 manufacturing. Each product also has impact sources whose shares, per indicator, sum to 1. Magnitudes sit in a plausible EN 15804 range. None of these are real EPDs. Crosslam 140 and Birch & Grain glulam carry a negative GWP total with a positive A2 stage, so the stage chart can contradict the total.

The only client state is the theme in `localStorage` (`relative-theme`) and the comparison in the query string.

## Design system

The visual system is [Solid Glass](https://github.com/deeplethe/solid-glass) by DeepLethe (MIT), shipped as `app/solid-glass.css` and imported from `app/globals.css` after Tailwind, `tw-animate-css`, and `shadcn/tailwind.css`. Components are [shadcn/ui](https://ui.shadcn.com) style `base-nova` on Base UI (`components.json`: neutral base colour, CSS variables, Lucide icons). Charts are Recharts.

Solid Glass sits between flat design and liquid glass. Every surface is a thick pane of smoky glass with very little see-through: from a distance it reads as solid, and only close up as glass. The stylesheet states four rules:

1. The finish is at the edge: a rim, a hairline, and a shadow. No gradient across the face.
2. Heavy, not airy: neutral grey. The blur softens what is behind without boosting its colour.
3. Depth is thickness: panel (thinnest) < card < popover (thickest). Thicker is more opaque.
4. One state: hovered, chosen, and held-open wear the same small pane.

Dark is the material as designed and the default (`class="dark"` on `<html>`). Light is the same panes in daylight. An inline script in `app/layout.tsx` removes `dark` before paint when `relative-theme` is `light`.

**Fonts.** The page loads Geist and Geist Mono through `next/font/google` (`--font-geist-sans`, `--font-geist-mono`). `app/globals.css` sets the document font to Geist, with `ui-sans-serif` behind it, and maps `--font-mono` to Geist Mono. Product ids use the mono face. Solid Glass's own theme tokens name "Geist Variable" and "Geist Mono Variable"; the faces the app actually ships are the next/font files. The share image cannot use `next/font`, so it embeds the latin Geist regular and medium files in `app/fonts/` under the SIL Open Font License (`app/fonts/OFL.txt`).

**Colour.** Tokens are OKLCH. The page background is opaque; the panes are smoked glass.

| Token | Light (`:root`) | Dark (`.dark`, the default) |
| --- | --- | --- |
| `--background` | `oklch(0.925 0.007 265)` | `oklch(0.16 0 0)` |
| `--foreground` | `oklch(0.16 0 0)` | `oklch(0.985 0 0)` |
| `--panel` | `oklch(0.975 0.004 265 / 44%)` | `oklch(1 0 0 / 4.5%)` |
| `--card` | `oklch(0.98 0.004 265 / 60%)` | `oklch(0.31 0 0 / 46%)` |
| `--popover` | `oklch(0.985 0.003 265 / 96%)` | `oklch(0.22 0 0 / 96%)` |
| `--primary` | `oklch(0.2 0 0)` | `oklch(0.94 0 0)` |
| `--muted-foreground` | `oklch(0.47 0 0)` | `oklch(0.72 0 0)` |
| `--brand` | `oklch(0.68 0.13 165)` | `oklch(0.78 0.13 166)` |
| `--success` (lower impact) | `oklch(0.58 0.15 152)` | `oklch(0.74 0.16 152)` |
| `--status-interrupted` (higher impact, exposed as `--color-worse`) | `oklch(0.66 0.16 58)` | `oklch(0.77 0.15 62)` |

Product series, in `app/globals.css`, are the colours that mean "which product". Solid Glass chart tokens stay grey and are not what the radar and bars use.

| Series | Light | Dark |
| --- | --- | --- |
| `--series-1` | `oklch(0.42 0.11 166)` | `oklch(0.84 0.11 166)` |
| `--series-2` | `oklch(0.4 0.13 255)` | `oklch(0.78 0.11 250)` |
| `--series-3` | `oklch(0.46 0.12 62)` | `oklch(0.84 0.11 78)` |

Light page wash uses three faint radial gradients (`--light-1` teal, `--light-2` blue, `--light-3` teal). In dark those lights are transparent, so the page stays an even unlit grey. Glass blur is `blur(26px) saturate(180%)` in light and `blur(26px)` in dark. Controls use `blur(14px)`.

**Radii.** `--radius` is `0.875rem`. Controls step down to `--radius-control: 0.7rem`. The Tailwind scale is that base times 0.6 (`sm`), 0.8 (`md`), 1 (`lg`), 1.4 (`xl`), 1.8 (`2xl`), 2.2 (`3xl`), 2.6 (`4xl`). Cards and the compare dialog use `rounded-xl`. Content width is `max-w-6xl`.

## Stack, scripts, and checks

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · shadcn/ui on Base UI · Solid Glass · Motion · Recharts · Vitest · Playwright · pnpm.

Node 22, pinned in `.nvmrc` and `package.json` `engines`. Package manager is pnpm 12 (`packageManager`). `next.config.ts` turns on `cacheComponents` and `partialPrefetching`.

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm run typecheck   # next typegen && tsc --noEmit
pnpm run lint        # eslint
pnpm test            # vitest run — lib/**/*.test.ts and data/**/*.test.ts
pnpm run build
pnpm start
pnpm run test:e2e    # Playwright, Chromium, production server
```

Unit tests cover percent deltas (including a negative base), comparability warnings, search and library tabs, the two-other selection cap, radar scaling, CSV shape, source shares, and seed integrity (unique ids, stage sums, both libraries, all six categories, a fair concrete pair and a unit mismatch, timber with a negative total and a positive manufacturing stage). The Playwright spec walks profile → compare → Meridian C30/37 → shareable URL → reload → back to the profile.

CI is `.github/workflows/ci.yml`, on pull requests and pushes to `main`: frozen install, typecheck, lint, unit tests, production build, Playwright Chromium. E2e in CI runs against `pnpm start` after that build. Locally, Playwright builds and starts the server itself.

`scripts/capture.mjs` is a local Playwright capture that writes the README screenshots into `docs/`. It is not an npm script and it is not in CI.

## Status

Shipped and live at [https://impact-compare.vercel.app](https://impact-compare.vercel.app):

- Profile, compare dialog, and comparison for a fixed catalogue of twenty fictional products.
- Fair-ranking check on category, declared unit, and method, with the chart left visible.
- Shareable comparison URL, CSV export, copy link, dark/light theme.
- Eight indicators, peer-scaled radar, A1–A3 stage charts, source breakdown on the profile.
- Vitest suite and a Playwright spec, gated in CI together with typecheck, lint, and a production build.
- README essay, screenshots, and this passport.
- A share card for the site link. `app/opengraph-image.tsx` draws it: the Relative mark, Nordic C30/37 against Meridian C30/37, and the line that every figure is fictional. The root metadata sets the title, the description, the Open Graph fields, and a Twitter large-image card. `metadataBase` is `https://impact-compare.vercel.app`, so the image URL is absolute.

No open GitHub issues.

## Known gaps / next ideas

Only what the code and the README already leave open. There are no open issues to draw from.

Deliberately absent, as the README records: product passports, tenders, supplier requests, company-level reports, use phase and end of life (A4–D), a verification workflow, and any date filter. An EPD here is not a time series.

The compare dialog opens on **Own library**. The README flags that as an open question: if the real question is usually the competitor, the public database should be the tab that opens.

The README also records three things worth testing with people: whether the radar centre reads as "good" without the caption; whether the unit-mismatch warning stops someone quoting the percentage; and which tab should open by default.

The Playwright spec covers one fair two-product comparison, and checks that the site link carries the share-card title, description, image, and Twitter card. It does not cover the warning, a three-product set, export, copy, theme, or the not-found page.

The dialog subtitle says search matches name, category, and product id. `searchHaystack` in `lib/compare.ts` also includes the manufacturer, which is what the README describes.

The README still says the Live badge is a placeholder until the repo is connected to Vercel. The app is live at that address.

`scripts/capture.mjs` has no package script, so regenerating the screenshots is a manual invocation.

The share image is the one Nordic–Meridian card for every URL. A comparison link does not draw its own picture.

## Rules

- The license is MIT (`LICENSE`, copyright 2026 sergushkin.com). Keep it.
- Never name the real company this concept was inspired by. Not in code, docs, commits, or pull request text. The product is Relative. The manufacturers in the seed are fictional.
- One change per pull request.
- The owner merges. Open the pull request and stop.
