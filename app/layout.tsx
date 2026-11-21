import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import { TooltipProvider } from "@/components/ui/tooltip"
import { SHARE_DESCRIPTION, SHARE_TITLE, SITE_ORIGIN } from "@/lib/share"

import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: SHARE_TITLE,
    template: "%s · Relative",
  },
  description: SHARE_DESCRIPTION,
  openGraph: {
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    url: SITE_ORIGIN,
    siteName: "Relative",
    type: "website",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
  },
}

const themeScript = `(function(){try{if(localStorage.getItem("relative-theme")==="light"){document.documentElement.classList.remove("dark")}}catch(e){}})()`

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <TooltipProvider>
          <a
            href="#content"
            className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-popover focus:px-3 focus:py-2 focus:text-sm focus:text-popover-foreground focus:ring-2 focus:ring-ring"
          >
            Skip to content
          </a>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
