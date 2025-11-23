"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface BreakdownItem {
  label: string
  count: number
  percentage: number
}

interface IndexTooltipProps {
  children: React.ReactNode
  type: "pdi" | "jdi" | "ihi"
  breakdown: BreakdownItem[]
  score: number
  className?: string
}

const indexConfig = {
  pdi: {
    color: "oklch(0.60 0.18 240)",
    label: "Physical Distribution",
    breakdownLabel: "Organization Distribution"
  },
  jdi: {
    color: "oklch(0.65 0.15 150)",
    label: "Jurisdictional Diversity",
    breakdownLabel: "Country Distribution"
  },
  ihi: {
    color: "oklch(0.63 0.2 290)",
    label: "Infrastructure Heterogeneity",
    breakdownLabel: "Provider Distribution"
  }
}

export function IndexTooltip({ 
  children, 
  type, 
  breakdown, 
  score, 
  className 
}: IndexTooltipProps) {
  const config = indexConfig[type]
  
  // Sort breakdown by count descending and take top 8
  const topBreakdown = [...breakdown]
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)
  
  const maxCount = Math.max(...topBreakdown.map(item => item.count))
  
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-help flex items-center gap-2.5 w-full">
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="w-[280px] p-3 bg-background border border-border shadow-lg"
          sideOffset={8}
        >
          <div className="space-y-2.5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-semibold text-foreground/90">
                {config.label}
              </span>
              <span 
                className="text-base font-bold"
                style={{ color: config.color }}
              >
                {Math.round(score)}
              </span>
            </div>
            
            {/* Breakdown Label */}
            <div className="text-[11px] font-medium text-muted-foreground/80 uppercase tracking-wide">
              {config.breakdownLabel}
            </div>
            
            {/* Mini Bar Chart */}
            <div className="space-y-1.5">
              {topBreakdown.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex items-center justify-between text-[11px] mb-0.5">
                    <span className="text-foreground/80 truncate max-w-[140px]" title={item.label}>
                      {item.label}
                    </span>
                    <span className="text-muted-foreground/70 font-mono text-[10px]">
                      {item.count} ({item.percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="h-1.5 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${(item.count / maxCount) * 100}%`,
                        background: config.color,
                        opacity: 0.85
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Footer */}
            {breakdown.length > 8 && (
              <div className="text-[10px] text-muted-foreground/60 pt-1 border-t border-border/30">
                +{breakdown.length - 8} more...
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

