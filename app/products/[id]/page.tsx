import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"

import { Workspace } from "@/components/workspace"
import { getProduct, productIds, products } from "@/data/seed"
import { parseComparisonIds } from "@/lib/compare"

export function generateStaticParams() {
  return products.map((product) => ({ id: product.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const product = getProduct(id)
  if (!product) {
    return {
      title: "Product not found",
      description: "That address is not one of the twenty fictional declarations.",
    }
  }
  return {
    title: product.name,
    description: product.summary,
  }
}

function ProductFallback() {
  return (
    <main id="content" className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8">
      <div className="h-4 w-28 rounded-md bg-muted" />
      <div className="h-40 rounded-xl bg-muted" />
      <p className="text-sm text-muted-foreground">Loading the declaration…</p>
    </main>
  )
}

export default function ProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ with?: string | string[] }>
}) {
  return (
    <Suspense fallback={<ProductFallback />}>
      <ProductScreen params={params} searchParams={searchParams} />
    </Suspense>
  )
}

async function ProductScreen({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ with?: string | string[] }>
}) {
  const { id } = await params
  const product = getProduct(id)
  if (!product) notFound()
  const query = await searchParams
  const withIds = parseComparisonIds(product.id, query.with, productIds())
  return <Workspace baseId={product.id} withIds={withIds} />
}
