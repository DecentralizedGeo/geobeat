import { cn } from "@/lib/utils"

type IndexType = "gdi" | "pdi" | "jdi" | "ihi"

const indexConfig = {
  gdi: {
    label: "GDI",
    color: "oklch(0.58 0.02 240)",
    bgColor: "rgba(100, 100, 120, 0.12)",
  },
  pdi: {
    label: "PDI",
    color: "oklch(0.60 0.18 240)",
    bgColor: "rgba(80, 120, 220, 0.12)",
  },
  jdi: {
    label: "JDI",
    color: "oklch(0.65 0.15 150)",
    bgColor: "rgba(80, 200, 150, 0.12)",
  },
  ihi: {
    label: "IHI",
    color: "oklch(0.63 0.2 290)",
    bgColor: "rgba(180, 100, 220, 0.12)",
  },
}

export function IndexPill({ type, className }: { type: IndexType; className?: string }) {
  const config = indexConfig[type]

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-semibold tracking-wide",
        className,
      )}
      style={{
        color: config.color,
        backgroundColor: config.bgColor,
      }}
    >
      {config.label}
    </span>
  )
}
