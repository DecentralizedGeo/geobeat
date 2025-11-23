"use client"

import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type IndexType = "gdi" | "pdi" | "jdi" | "ihi"

const indexConfig = {
  gdi: {
    label: "GDI",
    color: "oklch(0.58 0.02 240)",
    bgColor: "rgba(100, 100, 120, 0.12)",
    tooltip: "Geographic Decentralization Index - Composite score across physical distribution, jurisdictional diversity, and infrastructure heterogeneity"
  },
  pdi: {
    label: "PDI",
    color: "oklch(0.60 0.18 240)",
    bgColor: "rgba(80, 120, 220, 0.12)",
    tooltip: "Physical Distribution Index - Measures spatial distribution of nodes across physical geography using Moran's I, ENL, and Spatial HHI"
  },
  jdi: {
    label: "JDI",
    color: "oklch(0.65 0.15 150)",
    bgColor: "rgba(80, 200, 150, 0.12)",
    tooltip: "Jurisdictional Diversity Index - Distribution across countries and regulatory environments"
  },
  ihi: {
    label: "IHI",
    color: "oklch(0.63 0.2 290)",
    bgColor: "rgba(180, 100, 220, 0.12)",
    tooltip: "Infrastructure Heterogeneity Index - Diversity across hosting providers and organizations"
  },
}

export function IndexPill({
  type,
  className,
  showTooltip = false
}: {
  type: IndexType
  className?: string
  showTooltip?: boolean
}) {
  const config = indexConfig[type]

  const pill = (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-bold tracking-wide border border-foreground text-foreground",
        showTooltip && "cursor-help",
        className,
      )}
      style={{
        backgroundColor: config.bgColor,
      }}
    >
      {config.label}
    </span>
  )

  if (!showTooltip) {
    return pill
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {pill}
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <p className="text-[12px]">{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
