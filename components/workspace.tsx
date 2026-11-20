"use client"

import { useState, useSyncExternalStore } from "react"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "motion/react"

import { AppHeader } from "@/components/header"
import { CompareDialog } from "@/components/compare-dialog"
import { ComparisonView } from "@/components/comparison-view"
import { ProductProfile } from "@/components/product-profile"
import { getProduct, products } from "@/data/seed"
import { comparisonToCsv, resolveComparison } from "@/lib/compare"

function subscribeHydration() {
  return () => {}
}

/** False during SSR and hydration, true after. Keeps the first paint visible. */
function useHydrated() {
  return useSyncExternalStore(subscribeHydration, () => true, () => false)
}

export function Workspace({
  baseId,
  withIds,
}: {
  baseId: string
  withIds: string[]
}) {
  const base = getProduct(baseId)
  const router = useRouter()
  const reduce = useReducedMotion()
  const hydrated = useHydrated()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!base) return null
  const product = base

  const set = resolveComparison(product, withIds, getProduct)
  const comparing = set.length > 1

  function confirm(ids: string[]) {
    const href = ids.length
      ? `/products/${product.id}?with=${ids.join(",")}`
      : `/products/${product.id}`
    router.push(href)
    setOpen(false)
  }

  function exportCsv() {
    const csv = comparisonToCsv(set)
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = `relative-${set.map((product) => product.id).join("-")}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
    } catch {
      return
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppHeader
        product={product}
        comparing={comparing}
        copied={copied}
        onCompare={() => setOpen(true)}
        onExport={comparing ? exportCsv : undefined}
        onCopy={comparing ? copyLink : undefined}
      />
      <main id="content" className="flex-1">
        <motion.div
          key={comparing ? `compare-${set.map((item) => item.id).join("-")}` : `profile-${product.id}`}
          initial={!hydrated || reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {comparing ? (
            <ComparisonView products={set} catalogue={products} />
          ) : (
            <ProductProfile product={product} catalogue={products} />
          )}
        </motion.div>
      </main>
      <footer className="mx-auto w-full max-w-6xl px-4 py-8 text-xs text-muted-foreground">
        Relative is a design prototype. Every figure is fictional. Not affiliated with any vendor.
      </footer>
      <CompareDialog
        open={open}
        onOpenChange={setOpen}
        base={product}
        catalogue={products}
        selectedIds={withIds}
        onConfirm={confirm}
      />
    </div>
  )
}
