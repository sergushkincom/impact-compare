"use client"

import { useMemo, useState } from "react"

import { IndicatorRadar, SERIES_COLOR, StageChart } from "@/components/charts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  CATEGORY_LABEL,
  INDICATOR_KEYS,
  INDICATORS,
  LIBRARY_LABEL,
  indicatorMeta,
  type IndicatorKey,
  type Product,
  unitFor,
} from "@/data/types"
import { percentDelta, warningCopy } from "@/lib/compare"
import { deltaWord, formatNumber, formatPercent, formatQuantity } from "@/lib/format"
import { cn } from "@/lib/utils"

export function ComparisonView({
  products,
  catalogue,
}: {
  products: Product[]
  catalogue: Product[]
}) {
  const [active, setActive] = useState<IndicatorKey[]>([...INDICATOR_KEYS])
  const base = products[0]
  const warning = warningCopy(products)
  const activeIndicators = useMemo(
    () => INDICATORS.filter((indicator) => active.includes(indicator.key)),
    [active],
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium tracking-tight">Comparison</h1>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {products.length} products. Percentages are against {base.name}. A minus is lower impact.
          {warning
            ? " Read them only with the warning — the declarations are not on the same basis."
            : " Category, declared unit and method match, so the ranking is fair within A1–A3."}
        </p>
      </div>

      {warning ? (
        <Alert>
          <AlertTitle>{warning.title}</AlertTitle>
          <AlertDescription>{warning.body}</AlertDescription>
        </Alert>
      ) : null}

      <ul className="grid gap-3 md:grid-cols-3">
        {products.map((product, index) => (
          <li key={product.id}>
            <Card className="h-full px-3 py-3">
              <div className="flex items-start gap-2">
                <span
                  aria-hidden
                  className="mt-1 size-2.5 shrink-0 rounded-full"
                  style={{ background: SERIES_COLOR[index] }}
                />
                <div className="min-w-0 flex flex-col gap-1">
                  <p className="text-sm font-medium leading-snug">{product.name}</p>
                  <p className="font-mono text-[11px] text-muted-foreground">{product.id}</p>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary">{CATEGORY_LABEL[product.category]}</Badge>
                    <Badge variant="outline">{LIBRARY_LABEL[product.library]}</Badge>
                    {index === 0 ? <Badge variant="outline">Base</Badge> : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    per {product.declaredUnit} · {product.method}
                  </p>
                </div>
              </div>
            </Card>
          </li>
        ))}
      </ul>

      <section className="flex flex-col gap-3" aria-labelledby="deltas-heading">
        <h2 id="deltas-heading" className="text-base font-medium">
          Against {base.name}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {activeIndicators.map((indicator) => (
            <MetricTile key={indicator.key} indicator={indicator.key} products={products} />
          ))}
        </div>
      </section>

      <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]" aria-labelledby="radar-heading">
        <div className="flex flex-col gap-3">
          <h2 id="radar-heading" className="text-base font-medium">
            Indicators, overlaid
          </h2>
          <Card className="px-2 py-4">
            <IndicatorRadar products={products} keys={active} mode="comparison" catalogue={catalogue} />
          </Card>
        </div>
        <div className="flex flex-col gap-3">
          <h2 className="text-base font-medium">Show</h2>
          <ToggleGroup
            multiple
            orientation="vertical"
            value={active}
            onValueChange={(next) => {
              if (next.length === 0) return
              setActive(next as IndicatorKey[])
            }}
            spacing={1}
            className="w-full flex-col items-stretch"
            aria-label="Indicators on the comparison"
          >
            {INDICATORS.map((indicator) => (
              <ToggleGroupItem
                key={indicator.key}
                value={indicator.key}
                aria-label={indicator.name}
                variant="outline"
                className="h-auto w-full justify-start py-1.5 whitespace-normal"
              >
                {indicator.short}
                <span className="text-muted-foreground">{indicator.name}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <p className="text-xs leading-relaxed text-muted-foreground">
            At least one stays on. Turning an indicator off removes it from the radar, the tiles and the stage charts.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="gap-heading">
        <div className="flex flex-col gap-1">
          <h2 id="gap-heading" className="text-base font-medium">
            Where the difference comes from
          </h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Each chart is one indicator, so kilograms of CO2e are never drawn on the same axis as a trace gas. A1 is raw materials, A2 transport to the plant, A3 manufacturing.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {activeIndicators.map((indicator) => (
            <Card key={indicator.key} className="px-3 py-3">
              <StageChart products={products} indicator={indicator.key} />
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}

function MetricTile({
  indicator,
  products,
}: {
  indicator: IndicatorKey
  products: Product[]
}) {
  const base = products[0]
  const meta = indicatorMeta(indicator)
  return (
    <Card className="px-3 py-3">
      <p className="text-xs text-muted-foreground">{meta.name}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums tracking-tight">
        {formatNumber(base.totals[indicator])}
      </p>
      <p className="text-xs text-muted-foreground">
        {unitFor(indicator, base.method)} · {base.name}
      </p>
      <ul className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
        {products.slice(1).map((product, index) => {
          const delta = percentDelta(base.totals[indicator], product.totals[indicator])
          const word = deltaWord(delta)
          const sameBasis =
            product.declaredUnit === base.declaredUnit &&
            product.method === base.method &&
            product.category === base.category
          return (
            <li key={product.id} className="flex flex-col gap-0.5">
              <p className="truncate text-xs text-muted-foreground">{product.name}</p>
              <p className="text-sm tabular-nums">
                {formatQuantity(product.totals[indicator], unitFor(indicator, product.method))}
              </p>
              <p
                className={cn(
                  "text-xs tabular-nums",
                  !sameBasis && "text-worse",
                  sameBasis && word === "lower" && "text-success",
                  sameBasis && word === "higher" && "text-worse",
                  sameBasis && (word === "same" || word === "n/a") && "text-muted-foreground",
                )}
              >
                <span className="font-medium">{formatPercent(delta)}</span>{" "}
                {word === "n/a" ? "no percentage" : `${word} than ${base.name}`}
                {!sameBasis ? " · not the same basis" : ""}
              </p>
              <span className="sr-only">Series {index + 2}</span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
