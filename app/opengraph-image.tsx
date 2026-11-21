import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"

import { SHARE_IMAGE_ALT, shareCard, type ShareRow } from "@/lib/share"

export const alt = SHARE_IMAGE_ALT
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const BG = "#0d0d0d"
const FG = "#fafafa"
const MUTED = "#a4a4a4"
const MARK = "#9ad8cc"
const SERIES_1 = "#7fe2ba"
const SERIES_2 = "#80bdfb"
const LOWER = "#4ac777"
const HIGHER = "#f79c40"
const PANE = "#1a1a1a"
const HAIRLINE = "rgba(255,255,255,0.10)"
const TRACK = "rgba(255,255,255,0.08)"

const BAR = 176

function tone(word: ShareRow["word"]): string {
  if (word === "lower") return LOWER
  if (word === "higher") return HIGHER
  return MUTED
}

function Mark({ px }: { px: number }) {
  return (
    <svg width={px} height={px} viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="8" fill="none" stroke={MARK} strokeWidth="1.6" />
      <circle cx="16" cy="16" r="2.1" fill={MARK} />
      <path
        d="M16 8.5 V16 L22 19"
        fill="none"
        stroke={MARK}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Bar({ value, color }: { value: number; color: string }) {
  const width = Math.max(8, Math.round(value * BAR))
  return (
    <div
      style={{
        display: "flex",
        width: BAR,
        height: 7,
        borderRadius: 99,
        background: TRACK,
      }}
    >
      <div style={{ width, height: 7, borderRadius: 99, background: color }} />
    </div>
  )
}

function Metric({ row }: { row: ShareRow }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
          <span style={{ fontSize: 18, color: MUTED }}>{row.name}</span>
          <span style={{ fontSize: 14, color: MUTED }}>· {row.unit}</span>
        </div>
        <span style={{ fontSize: 20, fontWeight: 500, color: tone(row.word) }}>
          {row.percent} {row.word}
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, width: BAR }}>
          <span style={{ fontSize: 40, fontWeight: 500, letterSpacing: -1, color: FG }}>{row.baseText}</span>
          <Bar value={row.baseBar} color={SERIES_1} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, width: BAR }}>
          <span style={{ fontSize: 40, fontWeight: 500, letterSpacing: -1, color: FG }}>{row.otherText}</span>
          <Bar value={row.otherBar} color={SERIES_2} />
        </div>
      </div>
    </div>
  )
}

export default async function Image() {
  const [regular, medium] = await Promise.all([
    readFile(join(process.cwd(), "app/fonts/GeistSans-Regular.ttf")),
    readFile(join(process.cwd(), "app/fonts/GeistSans-Medium.ttf")),
  ])
  const card = shareCard()

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: BG,
          color: FG,
          fontFamily: "Geist",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            height: "100%",
            padding: "46px 48px",
            gap: 36,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              width: 430,
              height: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div
                style={{
                  display: "flex",
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid ${HAIRLINE}`,
                }}
              >
                <Mark px={30} />
              </div>
              <span style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.6 }}>Relative</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 15, letterSpacing: 1.4, color: MUTED }}>
                {card.category.toUpperCase()} · PER {card.declaredUnit}
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: 14,
                  fontSize: 68,
                  fontWeight: 500,
                  letterSpacing: -2.2,
                  lineHeight: 1,
                }}
              >
                <span>Nordic</span>
                <span style={{ color: MUTED, marginTop: 6 }}>against</span>
                <span style={{ marginTop: 6 }}>Meridian</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <span style={{ fontSize: 18, color: MUTED, lineHeight: 1.35 }}>
                {card.method} · modules A1–A3. A minus is lower impact.
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 28, height: 2, background: MARK }} />
                <span style={{ fontSize: 20, fontWeight: 500 }}>Every figure is fictional.</span>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 638,
              height: "100%",
              borderRadius: 22,
              background: PANE,
              border: `1px solid ${HAIRLINE}`,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16), 0 18px 40px rgba(0,0,0,0.45)",
              padding: "26px 32px 22px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 99, background: SERIES_1 }} />
                  <span style={{ fontSize: 20, fontWeight: 500 }}>{card.baseName}</span>
                  <span
                    style={{
                      fontSize: 13,
                      color: MUTED,
                      border: `1px solid ${HAIRLINE}`,
                      borderRadius: 999,
                      padding: "2px 8px",
                    }}
                  >
                    Base
                  </span>
                </div>
                <span style={{ fontSize: 14, color: MUTED, marginLeft: 18 }}>{card.baseId}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 99, background: SERIES_2 }} />
                  <span style={{ fontSize: 20, fontWeight: 500 }}>{card.otherName}</span>
                </div>
                <span style={{ fontSize: 14, color: MUTED }}>{card.otherId}</span>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flexGrow: 1,
                marginTop: 22,
              }}
            >
              {card.rows.map((row, index) => (
                <div key={row.key} style={{ display: "flex", flexDirection: "column" }}>
                  {index > 0 ? (
                    <div style={{ height: 1, background: HAIRLINE, marginBottom: 16 }} />
                  ) : null}
                  <Metric row={row} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: regular, weight: 400, style: "normal" },
        { name: "Geist", data: medium, weight: 500, style: "normal" },
      ],
    },
  )
}
