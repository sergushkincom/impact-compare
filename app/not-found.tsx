import Link from "next/link"

import { DEFAULT_PRODUCT_ID } from "@/data/seed"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <main id="content" className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-4 px-4 py-24">
      <h1 className="text-2xl font-medium tracking-tight">That product is not in the library</h1>
      <p className="text-sm leading-relaxed text-muted-foreground">
        The address does not match a fictional declaration. The catalogue is the twenty products shipped with this prototype.
      </p>
      <Button render={<Link href={`/products/${DEFAULT_PRODUCT_ID}`} />} className="w-fit">
        Open Nordic C30/37
      </Button>
    </main>
  )
}
