"use client"

import { Moon, Sun } from "lucide-react"
import { useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"

const EVENT = "relative-theme"
const STORAGE = "relative-theme"

function subscribe(onStoreChange: () => void) {
  window.addEventListener(EVENT, onStoreChange)
  return () => window.removeEventListener(EVENT, onStoreChange)
}

function snapshot() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light"
}

export function ThemeSwitch() {
  const theme = useSyncExternalStore(subscribe, snapshot, () => "dark")
  const dark = theme === "dark"

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={dark ? "Use light theme" : "Use dark theme"}
      onClick={() => {
        const next = dark ? "light" : "dark"
        document.documentElement.classList.toggle("dark", next === "dark")
        try {
          localStorage.setItem(STORAGE, next)
        } catch {
          // Private mode can refuse storage. The class on the document still flips.
        }
        window.dispatchEvent(new Event(EVENT))
      }}
    >
      {dark ? <Sun /> : <Moon />}
    </Button>
  )
}
