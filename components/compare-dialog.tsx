"use client"

import { useMemo, useState } from "react"

import { MaterialSwatch } from "@/components/swatch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CATEGORY_LABEL,
  LIBRARY_LABEL,
  type Product,
  unitFor,
} from "@/data/types"
import {
  filterProducts,
  resolveComparison,
  sortForPicker,
  tabCounts,
  warningCopy,
  type LibraryTab,
} from "@/lib/compare"
import { formatQuantity } from "@/lib/format"
import { cn } from "@/lib/utils"

const TABS: { id: LibraryTab; label: string }[] = [
  { id: "own", label: "Own library" },
  { id: "public", label: "Public database" },
  { id: "all", label: "All" },
]

function HeadlineTrio({ product }: { product: Product }) {
  const rows = [
    ["Global warming", product.totals.gwp, unitFor("gwp", product.method)],
    ["Fossil energy", product.totals.adpf, unitFor("adpf", product.method)],
    ["Water deprivation", product.totals.wdp, unitFor("wdp", product.method)],
  ] as const
  return (
    <dl className="grid grid-cols-3 gap-2">
      {rows.map(([label, value, unit]) => (
        <div key={label} className="flex flex-col gap-0.5 rounded-lg bg-muted/60 px-2 py-1.5">
          <dt className="text-[11px] text-muted-foreground">{label}</dt>
          <dd className="text-sm font-medium tabular-nums">{formatQuantity(value, unit)}</dd>
        </div>
      ))}
    </dl>
  )
}

export function CompareDialog({
  open,
  onOpenChange,
  base,
  catalogue,
  selectedIds,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  base: Product
  catalogue: Product[]
  selectedIds: string[]
  onConfirm: (ids: string[]) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <CompareForm
          base={base}
          catalogue={catalogue}
          selectedIds={selectedIds}
          onOpenChange={onOpenChange}
          onConfirm={onConfirm}
        />
      ) : null}
    </Dialog>
  )
}

function CompareForm({
  base,
  catalogue,
  selectedIds,
  onOpenChange,
  onConfirm,
}: {
  base: Product
  catalogue: Product[]
  selectedIds: string[]
  onOpenChange: (open: boolean) => void
  onConfirm: (ids: string[]) => void
}) {
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<LibraryTab>("own")
  const [draft, setDraft] = useState<string[]>(selectedIds)
  const [previewId, setPreviewId] = useState(selectedIds[0] ?? base.id)

  const counts = useMemo(() => tabCounts(catalogue, query), [catalogue, query])
  const visible = useMemo(
    () =>
      sortForPicker(filterProducts(catalogue, query, tab), base.id).filter(
        (product) => product.id !== base.id,
      ),
    [catalogue, query, tab, base.id],
  )
  const preview = catalogue.find((product) => product.id === previewId) ?? base
  const chosen = resolveComparison(base, draft, (id) => catalogue.find((product) => product.id === id))
  const warning = warningCopy(chosen)
  const atLimit = draft.length >= 2

  function toggle(id: string, checked: boolean) {
    setDraft((current) => {
      if (checked) {
        if (current.includes(id) || current.length >= 2) return current
        return [...current, id]
      }
      return current.filter((item) => item !== id)
    })
    setPreviewId(id)
  }

  const confirmLabel =
    draft.length === 1 ? "Compare 2 products" : draft.length === 2 ? "Compare 3 products" : "Choose one or two products"

  return (
      <DialogContent className="gap-0 p-0 sm:max-w-3xl">
        <DialogHeader className="gap-1 border-b border-border px-4 py-4 pr-12">
          <DialogTitle>Select products to compare</DialogTitle>
          <DialogDescription>
            {base.name} stays as the base. Add one or two others. Search matches name, category and product ID.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="compare-search">Search by name, category, or product ID</Label>
            <Input
              id="compare-search"
              value={query}
              autoFocus
              placeholder="Nordic, cement, hv-c30-089"
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key !== "Enter") return
                event.preventDefault()
                const row = document.querySelector<HTMLElement>("[data-compare-row]")
                const control = row?.querySelector<HTMLElement>("[data-slot=checkbox]")
                ;(control ?? row)?.focus()
              }}
            />
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as LibraryTab)}>
            <TabsList variant="line">
              {TABS.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label} ({counts[item.id]})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid min-h-0 gap-3 px-4 pb-3 lg:grid-cols-[minmax(0,1fr)_17rem]">
          <ScrollArea className="h-[22rem] rounded-xl ring-1 ring-foreground/10">
            <ul className="flex flex-col" aria-label="Products">
              <li className="border-b border-border">
                <ProductRow
                  product={base}
                  checked
                  readOnly
                  previewed={preview.id === base.id}
                  onPreview={() => setPreviewId(base.id)}
                  badge="Base"
                />
              </li>
              {visible.length === 0 ? (
                <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                  {query.trim()
                    ? `No products match “${query.trim()}” in ${TABS.find((item) => item.id === tab)?.label}.`
                    : "Nothing in this tab."}
                </li>
              ) : (
                visible.map((product) => {
                  const checked = draft.includes(product.id)
                  return (
                    <li key={product.id} className="border-b border-border last:border-b-0">
                      <ProductRow
                        product={product}
                        checked={checked}
                        disabled={!checked && atLimit}
                        previewed={preview.id === product.id}
                        onPreview={() => setPreviewId(product.id)}
                        onCheckedChange={(next) => toggle(product.id, next)}
                      />
                    </li>
                  )
                })
              )}
            </ul>
          </ScrollArea>

          <aside aria-label="Product preview" className="flex flex-col gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
            <div className="flex items-start gap-3">
              <MaterialSwatch category={preview.category} className="size-16" />
              <div className="min-w-0 flex flex-col gap-1">
                <h3 className="text-sm font-medium leading-snug">{preview.name}</h3>
                <p className="font-mono text-[11px] text-muted-foreground">{preview.id}</p>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{CATEGORY_LABEL[preview.category]}</Badge>
                  <Badge variant="outline">{LIBRARY_LABEL[preview.library]}</Badge>
                </div>
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{preview.summary}</p>
            <HeadlineTrio product={preview} />
            <p className="text-[11px] text-muted-foreground">
              {preview.manufacturer} · per {preview.declaredUnit} · {preview.method}
            </p>
          </aside>
        </div>

        {warning && draft.length > 0 ? (
          <div className="px-4 pb-3">
            <Alert>
              <AlertTitle>{warning.title}</AlertTitle>
              <AlertDescription>{warning.body}</AlertDescription>
            </Alert>
          </div>
        ) : null}

        <DialogFooter className="mx-0 mb-0 rounded-none border-t">
          <p className="mr-auto self-center text-xs text-muted-foreground">
            {draft.length === 0
              ? "Choose one or two products."
              : `${draft.length + 1} products selected. Three is the maximum.`}
          </p>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={draft.length === 0} onClick={() => onConfirm(draft)}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
  )
}

function ProductRow({
  product,
  checked,
  disabled,
  readOnly,
  previewed,
  badge,
  onPreview,
  onCheckedChange,
}: {
  product: Product
  checked: boolean
  disabled?: boolean
  readOnly?: boolean
  previewed: boolean
  badge?: string
  onPreview: () => void
  onCheckedChange?: (checked: boolean) => void
}) {
  const id = `compare-${product.id}`
  return (
    <label
      htmlFor={id}
      data-compare-row={readOnly ? undefined : "true"}
      onMouseEnter={onPreview}
      onFocus={onPreview}
      className={cn(
        "flex cursor-pointer items-start gap-3 px-3 py-2.5 outline-none focus-within:bg-accent",
        previewed && "bg-accent",
        disabled && "cursor-not-allowed opacity-50",
        readOnly && "cursor-default",
      )}
    >
      <Checkbox
        id={id}
        className="mt-0.5"
        checked={checked}
        disabled={disabled}
        readOnly={readOnly}
        onCheckedChange={(next) => onCheckedChange?.(next)}
        aria-describedby={`${id}-meta`}
      />
      <span className="min-w-0 flex flex-1 flex-col gap-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{product.name}</span>
          {badge ? <Badge variant="outline">{badge}</Badge> : null}
          <span className="font-mono text-[11px] text-muted-foreground">{product.id}</span>
        </span>
        <span id={`${id}-meta`} className="text-xs text-muted-foreground">
          {product.manufacturer} · {CATEGORY_LABEL[product.category]} · per {product.declaredUnit}
        </span>
        {checked && !readOnly ? (
          <span className="pt-1">
            <HeadlineTrio product={product} />
          </span>
        ) : null}
      </span>
    </label>
  )
}
