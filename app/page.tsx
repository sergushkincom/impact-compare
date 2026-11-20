import { redirect } from "next/navigation"

import { DEFAULT_PRODUCT_ID } from "@/data/seed"

export default function Home() {
  redirect(`/products/${DEFAULT_PRODUCT_ID}`)
}
