"use client"

import { Download, GitCompare, Link2 } from "lucide-react"
import Link from "next/link"

import { ThemeSwitch } from "@/components/theme-switch"
import { Button } from "@/components/ui/button"
import { CATEGORY_LABEL, type Product } from "@/data/types"

export function AppHeader({
  product,
  comparing,
  copied,
  onCompare,
  onExport,
  onCopy,
}: {
  product: Product
  comparing: boolean
  copied: boolean
  onCompare: () => void
  onExport?: () => void
  onCopy?: () => void
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-3 px-4">
        <Link href={`/products/${product.id}`} className="flex items-center gap-2 rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          <span aria-hidden className="size-2.5 rounded-full bg-series-1" />
          <span className="text-sm font-medium tracking-tight">Relative</span>
        </Link>
        <p className="hidden min-w-0 truncate text-sm text-muted-foreground sm:block">
          <span className="text-foreground">{product.name}</span>
          {comparing ? (
            <span> · comparison</span>
          ) : (
            <span> · {CATEGORY_LABEL[product.category]}</span>
          )}
        </p>
        <div className="ml-auto flex items-center gap-1.5">
          <ThemeSwitch />
          {comparing && onCopy ? (
            <Button variant="outline" onClick={onCopy}>
              <Link2 data-icon="inline-start" />
              {copied ? "Copied" : "Copy link"}
            </Button>
          ) : null}
          {comparing && onExport ? (
            <Button variant="outline" onClick={onExport}>
              <Download data-icon="inline-start" />
              Export
            </Button>
          ) : null}
          {comparing ? (
            <Button variant="outline" render={<Link href={`/products/${product.id}`} />}>
              Profile
            </Button>
          ) : null}
          <Button onClick={onCompare}>
            <GitCompare data-icon="inline-start" />
            Compare
          </Button>
        </div>
      </div>
      <p role="status" className="sr-only">
        {copied ? "Comparison link copied." : ""}
      </p>
    </header>
  )
}
