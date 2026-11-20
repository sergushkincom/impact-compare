import { CATEGORY_LABEL, type Category } from "@/data/types"
import { cn } from "@/lib/utils"

const ink = "currentColor"

function Pattern({ category }: { category: Category }) {
  if (category === "concrete") {
    return (
      <g fill={ink}>
        <circle cx="28" cy="34" r="10" opacity="0.9" />
        <circle cx="62" cy="28" r="16" opacity="0.45" />
        <circle cx="86" cy="58" r="12" opacity="0.75" />
        <circle cx="40" cy="72" r="7" opacity="0.55" />
        <circle cx="70" cy="84" r="9" opacity="0.35" />
        <circle cx="96" cy="24" r="5" opacity="0.6" />
      </g>
    )
  }
  if (category === "cement") {
    return (
      <g fill={ink}>
        {Array.from({ length: 42 }, (_, index) => {
          const x = 16 + (index % 7) * 13
          const y = 18 + Math.floor(index / 7) * 14
          const r = index % 3 === 0 ? 2.2 : 1.3
          return <circle key={index} cx={x} cy={y} r={r} opacity={0.35 + (index % 5) * 0.1} />
        })}
      </g>
    )
  }
  if (category === "rebar") {
    return (
      <g fill="none" stroke={ink} strokeWidth="3" strokeLinecap="round">
        <path d="M18 96 L102 18" opacity="0.85" />
        <path d="M30 104 L114 26" opacity="0.4" />
        <path d="M8 78 L78 8" opacity="0.4" />
        {Array.from({ length: 8 }, (_, index) => (
          <path
            key={index}
            d={`M${24 + index * 10} ${88 - index * 8} l8 -4`}
            opacity="0.7"
          />
        ))}
      </g>
    )
  }
  if (category === "brick") {
    return (
      <g fill={ink}>
        {Array.from({ length: 4 }, (_, row) => {
          const offset = row % 2 === 0 ? 8 : 28
          return Array.from({ length: 3 }, (_, col) => (
            <rect
              key={`${row}-${col}`}
              x={offset + col * 36}
              y={16 + row * 24}
              width="30"
              height="16"
              rx="1.5"
              opacity={0.35 + ((row + col) % 3) * 0.2}
            />
          ))
        })}
      </g>
    )
  }
  if (category === "insulation") {
    return (
      <g fill="none" stroke={ink} strokeWidth="1.6" strokeLinecap="round">
        {Array.from({ length: 9 }, (_, index) => (
          <path
            key={index}
            d={`M14 ${18 + index * 10} C 34 ${10 + index * 10}, 48 ${28 + index * 10}, 68 ${18 + index * 10} S 100 ${12 + index * 10}, 110 ${20 + index * 10}`}
            opacity={0.3 + (index % 3) * 0.2}
          />
        ))}
      </g>
    )
  }
  return (
    <g fill="none" stroke={ink} strokeWidth="1.4">
      <ellipse cx="60" cy="60" rx="40" ry="26" opacity="0.85" />
      <ellipse cx="60" cy="60" rx="28" ry="16" opacity="0.55" />
      <ellipse cx="60" cy="60" rx="14" ry="8" opacity="0.4" />
      <path d="M22 60 H98" opacity="0.35" />
    </g>
  )
}

export function MaterialSwatch({
  category,
  className,
}: {
  category: Category
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-label={`${CATEGORY_LABEL[category]} material`}
      className={cn(
        "size-24 shrink-0 rounded-xl bg-card text-foreground/80 ring-1 ring-foreground/10",
        className,
      )}
    >
      <Pattern category={category} />
    </svg>
  )
}
