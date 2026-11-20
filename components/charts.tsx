"use client"

import { useEffect, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  indicatorMeta,
  STAGE_LABEL,
  type IndicatorKey,
  type Product,
  unitFor,
} from "@/data/types"
import { axisScore, peersOf, stageRows } from "@/lib/compare"
import { formatNumber, formatQuantity } from "@/lib/format"

export const SERIES_COLOR = [
  "var(--series-1)",
  "var(--series-2)",
  "var(--series-3)",
] as const

function useElementSize<T extends HTMLElement>(fallback: { width: number; height: number }) {
  const ref = useRef<T>(null)
  const [size, setSize] = useState(fallback)
  useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect
      if (!rect) return
      const width = Math.floor(rect.width)
      const height = Math.floor(rect.height)
      setSize((current) =>
        current.width === width && current.height === height ? current : { width, height },
      )
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [ref, size] as const
}

type RadarRow = Record<string, string | number>

function radarRows(products: Product[], keys: IndicatorKey[], scaleFrom: Product[]): RadarRow[] {
  return keys.map((key) => {
    const values = scaleFrom.map((product) => product.totals[key])
    const row: RadarRow = {
      short: indicatorMeta(key).short,
      indicator: indicatorMeta(key).name,
    }
    for (const product of products) {
      row[product.id] = axisScore(product.totals[key], values) ?? 0
      row[`abs:${product.id}`] = product.totals[key]
      row[`unit:${product.id}`] = unitFor(key, product.method)
    }
    return row
  })
}

function RadarTip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{
    name?: string
    dataKey?: string | number
    payload?: RadarRow
  }>
}) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  if (!row) return null
  return (
    <div className="grid min-w-44 gap-1 rounded-lg bg-popover px-2.5 py-2 text-xs text-popover-foreground ring-1 ring-foreground/10">
      <p className="font-medium">{row.indicator}</p>
      {payload.map((item) => {
        const id = String(item.dataKey)
        return (
          <p key={id}>
            <span className="text-muted-foreground">{item.name}. </span>
            {formatQuantity(Number(row[`abs:${id}`]), String(row[`unit:${id}`]))}
          </p>
        )
      })}
    </div>
  )
}

export function IndicatorRadar({
  products,
  keys,
  mode,
  catalogue,
}: {
  products: Product[]
  keys: IndicatorKey[]
  mode: "profile" | "comparison"
  catalogue: Product[]
}) {
  const reduce = useReducedMotion()
  const [frame, size] = useElementSize<HTMLDivElement>({ width: 480, height: 480 })
  const scaleFrom = mode === "profile" ? peersOf(products[0], catalogue) : products
  const scaled = scaleFrom.length >= 2 && keys.length > 0
  const data = scaled ? radarRows(products, keys, scaleFrom) : []
  const note =
    mode === "profile"
      ? scaled
        ? `Centre is the lowest of ${scaleFrom.length} declarations with the same category, unit and method. The rim is the highest. Closer to the centre is lower impact.`
        : "No second declaration shares this category, unit and method, so the radar has no scale. The numbers beside it are the absolute figures."
      : "Centre is the lowest value in this comparison, the rim is the highest. Closer to the centre is lower impact. The scale is redrawn for the indicators you leave on."

  return (
    <figure className="flex flex-col gap-3">
      {scaled ? (
        <div ref={frame} className="aspect-square w-full min-h-[280px] overflow-hidden">
          <RadarChart width={size.width} height={size.height} data={data} cx="50%" cy="50%" outerRadius="68%">
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis
              dataKey="short"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />
            <PolarRadiusAxis domain={[0, 1]} tick={false} axisLine={false} />
            {products.map((product, index) => (
              <Radar
                key={product.id}
                name={product.name}
                dataKey={product.id}
                stroke={SERIES_COLOR[index]}
                fill={SERIES_COLOR[index]}
                fillOpacity={0.16}
                strokeWidth={1.75}
                isAnimationActive={!reduce}
              />
            ))}
            <Tooltip content={<RadarTip />} />
          </RadarChart>
        </div>
      ) : (
        <div className="grid aspect-square min-h-[220px] place-items-center rounded-xl bg-card px-6 text-center text-sm text-muted-foreground ring-1 ring-foreground/10">
          Radar needs a second product on the same scale.
        </div>
      )}
      <figcaption className="text-xs leading-relaxed text-muted-foreground">{note}</figcaption>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {products.map((product, index) => (
          <li key={product.id} className="flex items-center gap-2 text-xs">
            <span
              aria-hidden
              className="size-2.5 rounded-full"
              style={{ background: SERIES_COLOR[index] }}
            />
            <span>{product.name}</span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

function StageTip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: Array<{ name?: string; value?: number; color?: string }>
  label?: string
  unit: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="grid min-w-40 gap-1 rounded-lg bg-popover px-2.5 py-2 text-xs text-popover-foreground ring-1 ring-foreground/10">
      <p className="font-medium">{label}</p>
      {payload.map((item) => (
        <p key={item.name}>
          <span className="text-muted-foreground">{item.name}. </span>
          {formatQuantity(Number(item.value), unit)}
        </p>
      ))}
    </div>
  )
}

export function StageChart({
  products,
  indicator,
}: {
  products: Product[]
  indicator: IndicatorKey
}) {
  const reduce = useReducedMotion()
  const [frame, size] = useElementSize<HTMLDivElement>({ width: 560, height: 240 })
  const meta = indicatorMeta(indicator)
  const rows: Array<{ stage: string; label: string } & Record<string, string | number>> =
    stageRows(products, indicator).map((row) => ({
      ...row,
      label: `${row.stage} ${STAGE_LABEL[row.stage as keyof typeof STAGE_LABEL]}`,
    }))
  const unit = unitFor(indicator, products[0].method)
  const mixedUnit = products.some((product) => unitFor(indicator, product.method) !== unit)

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-medium">{meta.name}</span>
        <span className="text-xs text-muted-foreground">
          {mixedUnit ? "Units differ — see the warning" : `${unit} per declared unit`}
        </span>
      </figcaption>
      <div ref={frame} className="aspect-[2.1/1] min-h-[180px] w-full overflow-hidden">
        <BarChart width={size.width} height={size.height} data={rows} barGap={2} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={48}
            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            tickFormatter={(value) => formatNumber(Number(value))}
          />
          {products.map((product, index) => (
            <Bar
              key={product.id}
              dataKey={product.id}
              name={product.name}
              fill={SERIES_COLOR[index]}
              radius={[3, 3, 0, 0]}
              isAnimationActive={!reduce}
            />
          ))}
          <Tooltip content={<StageTip unit={unit} />} />
        </BarChart>
      </div>
      <table className="sr-only">
        <caption>
          {meta.name} by lifecycle stage
        </caption>
        <thead>
          <tr>
            <th scope="col">Stage</th>
            {products.map((product) => (
              <th key={product.id} scope="col">
                {product.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.stage}>
              <th scope="row">{row.label}</th>
              {products.map((product) => (
                <td key={product.id}>
                  {formatQuantity(Number(row[product.id]), unitFor(indicator, product.method))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
