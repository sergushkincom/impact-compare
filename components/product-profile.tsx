"use client"

import { Info } from "lucide-react"
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"

import { absoluteRowId, IndicatorRadar, radarAxisId, StageChart, type MetricLink } from "@/components/charts"
import { MaterialSwatch } from "@/components/swatch"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  CATEGORY_LABEL,
  INDICATORS,
  LIBRARY_LABEL,
  indicatorMeta,
  type IndicatorKey,
  type Product,
  unitFor,
} from "@/data/types"
import { formatNumber, formatQuantity, percentShares } from "@/lib/format"
import { cn } from "@/lib/utils"

const HEADLINES: IndicatorKey[] = ["gwp", "adpf", "wdp"]
const RADAR_KEYS = INDICATORS.map((item) => item.key)

function metricFrom(target: EventTarget | null): IndicatorKey | null {
  if (!(target instanceof Element)) return null
  const value = target.closest("[data-metric]")?.getAttribute("data-metric")
  if (!value) return null
  return INDICATORS.some((item) => item.key === value) ? (value as IndicatorKey) : null
}

function LinkedIndicators({
  product,
  catalogue,
}: {
  product: Product
  catalogue: Product[]
}) {
  const [hoveredMetric, setHoveredMetric] = useState<IndicatorKey | null>(null)
  const scope = useRef<HTMLDivElement>(null)
  const onEnter = useCallback((key: IndicatorKey) => setHoveredMetric(key), [])
  const onSettle = useCallback((target: EventTarget | null) => setHoveredMetric(metricFrom(target)), [])
  const metricLink = useMemo<MetricLink>(() => ({ onEnter, onSettle }), [onEnter, onSettle])
  const products = useMemo(() => [product], [product])

  useLayoutEffect(() => {
    const root = scope.current
    if (!root) return
    for (const axis of root.querySelectorAll<SVGElement>(".radar-axis")) {
      if (axis.dataset.metric === hoveredMetric) axis.setAttribute("data-highlighted", "true")
      else axis.removeAttribute("data-highlighted")
    }
  }, [hoveredMetric])

  return (
    <div ref={scope} className="contents metric-link" data-hovered={hoveredMetric ?? undefined}>
      <Card className="px-2 py-4">
        <IndicatorRadar
          products={products}
          keys={RADAR_KEYS}
          mode="profile"
          catalogue={catalogue}
          metricLink={metricLink}
        />
      </Card>
      <table className="w-full border-separate border-spacing-0 text-left">
        <caption className="sr-only">Absolute figures</caption>
        <tbody className="[&>tr:last-child>th]:border-b-0">
          {INDICATORS.map((indicator) => {
            const highlighted = hoveredMetric === indicator.key
            return (
              <tr
                key={indicator.key}
                id={absoluteRowId(indicator.key)}
                tabIndex={0}
                data-metric={indicator.key}
                data-highlighted={highlighted ? "true" : undefined}
                aria-controls={radarAxisId(indicator.key)}
                className="group outline-none"
                onMouseEnter={() => setHoveredMetric(indicator.key)}
                onMouseLeave={() => setHoveredMetric(metricFrom(document.activeElement))}
                onFocus={() => setHoveredMetric(indicator.key)}
                onBlur={(event) => setHoveredMetric(metricFrom(event.relatedTarget))}
                onKeyDown={(event) => {
                  if (event.key === " " || event.key === "Enter") event.preventDefault()
                }}
              >
                <th
                  scope="row"
                  className={cn(
                    "rounded-md border-b border-border px-2 py-2 text-left font-normal transition-colors duration-200 ease-out motion-reduce:transition-none",
                    "group-data-[highlighted=true]:bg-[var(--hover)]",
                    "group-focus-visible:ring-3 group-focus-visible:ring-ring/50",
                  )}
                >
                  <span className="block text-xs text-muted-foreground transition-colors duration-200 ease-out motion-reduce:transition-none group-data-[highlighted=true]:text-foreground">
                    {indicator.name}{" "}
                    <span className="font-mono text-[10px] tracking-wide">{indicator.short}</span>
                  </span>
                  <span className="mt-0.5 block text-sm tabular-nums text-foreground">
                    {formatQuantity(product.totals[indicator.key], unitFor(indicator.key, product.method))}
                  </span>
                </th>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export function ProductProfile({
  product,
  catalogue,
}: {
  product: Product
  catalogue: Product[]
}) {
  const [stageKey, setStageKey] = useState<IndicatorKey>("gwp")
  const shares = product.sources.map((source) => source.shares[stageKey])
  const percents = percentShares(shares)
  const ranked = product.sources
    .map((source, index) => ({ source, percent: percents[index] }))
    .sort((a, b) => b.percent - a.percent)

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6">
      <Card>
        <div className="flex flex-col gap-5 px-4 lg:flex-row lg:items-start">
          <MaterialSwatch category={product.category} className="size-28" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{CATEGORY_LABEL[product.category]}</Badge>
              <Badge variant="outline">{LIBRARY_LABEL[product.library]}</Badge>
              <span className="font-mono text-xs text-muted-foreground">{product.id}</span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight">{product.name}</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{product.summary}</p>
            <p className="text-xs text-muted-foreground">
              {product.manufacturer} · per {product.declaredUnit} · {product.method} · modules A1–A3 · fictional figures
            </p>
          </div>
        </div>
        <div className="grid border-t border-border sm:grid-cols-3">
          {HEADLINES.map((key, index) => {
            const meta = indicatorMeta(key)
            return (
              <div
                key={key}
                className={index > 0 ? "border-t border-border px-4 py-4 sm:border-t-0 sm:border-l" : "px-4 py-4"}
              >
                <p className="text-xs text-muted-foreground">{meta.name}</p>
                <p className="mt-1 text-3xl font-medium tabular-nums tracking-tight">
                  {formatNumber(product.totals[key])}
                </p>
                <p className="text-xs text-muted-foreground">
                  {unitFor(key, product.method)} per {product.declaredUnit}
                </p>
              </div>
            )
          })}
        </div>
      </Card>

      <section className="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)_16rem]" aria-labelledby="indicators-heading">
        <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <h2 id="indicators-heading" className="text-base font-medium text-foreground">
            Eight indicators
          </h2>
          <p>
            Global warming is the number most people can read. It is one of eight. A low figure there can sit beside a high one for water or minerals.
          </p>
          <p>
            The radar is scaled to other declarations with the same category, declared unit and method. It is not a score out of 100, and it is not a rating.
          </p>
          <p>Lower impact sits toward the centre. The table on the right is the absolute figure. A row and its axis light up together.</p>
        </div>
        <LinkedIndicators product={product} catalogue={catalogue} />
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="stages-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 id="stages-heading" className="text-base font-medium">
              Lifecycle stages A1–A3
            </h2>
            <Tooltip>
              <TooltipTrigger
                aria-label="What A1 to A3 covers"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Info className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent>
                A1 raw materials, A2 transport to the plant, A3 manufacturing. Use and end of life are not in these figures.
              </TooltipContent>
            </Tooltip>
          </div>
          <ToggleGroup
            value={[stageKey]}
            onValueChange={(next) => {
              const value = next[0]
              if (value) setStageKey(value as IndicatorKey)
            }}
            spacing={1}
            className="flex-wrap"
            aria-label="Indicator shown on the stage chart"
          >
            {INDICATORS.map((indicator) => (
              <ToggleGroupItem key={indicator.key} value={indicator.key} aria-label={indicator.name} size="sm" variant="outline">
                {indicator.short}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <Card className="px-4 py-4">
          <StageChart products={[product]} indicator={stageKey} />
        </Card>
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-medium">
            Where {indicatorMeta(stageKey).name.toLowerCase()} comes from
          </h3>
          <ul className="flex flex-col gap-2">
            {ranked.map(({ source, percent }) => (
              <li key={source.name} className="grid grid-cols-[9rem_minmax(0,1fr)_2.5rem] items-center gap-3 text-sm">
                <span className="truncate">{source.name}</span>
                <span className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <span
                    className="block h-full rounded-full bg-foreground/80"
                    style={{ width: `${percent}%` }}
                  />
                </span>
                <span className="text-right text-xs tabular-nums text-muted-foreground">{percent}%</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Shares of this indicator only. They are part of the fictional declaration, and they will not match the shape of a different indicator.
          </p>
        </div>
      </section>
    </div>
  )
}
