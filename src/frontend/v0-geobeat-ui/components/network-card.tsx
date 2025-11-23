"use client"

import Link from "next/link"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TriangleChart } from "@/components/triangle-chart"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { Network } from "@/lib/network-data"
import { IndexTooltip } from "@/components/index-tooltip"
import { generateMockNodeData } from "@/lib/mock-node-data"
import { calculateOrgBreakdown, calculateCountryBreakdown, calculateIspBreakdown } from "@/lib/breakdown-utils"
import { useMemo } from "react"

interface NetworkCardProps {
  network: Network
}

export function NetworkCard({ network }: NetworkCardProps) {
  const TrendIcon = network.trend === "up" ? TrendingUp : network.trend === "down" ? TrendingDown : Minus
  const trendColor =
    network.trend === "up" ? "text-jdi" : network.trend === "down" ? "text-destructive" : "text-muted-foreground"
  
  // Calculate breakdowns for tooltips
  const nodeData = useMemo(() => generateMockNodeData(network.id), [network.id])
  const orgBreakdown = useMemo(() => calculateOrgBreakdown(nodeData), [nodeData])
  const countryBreakdown = useMemo(() => calculateCountryBreakdown(nodeData), [nodeData])
  const ispBreakdown = useMemo(() => calculateIspBreakdown(nodeData), [nodeData])

  return (
    <Link href={`/network/${network.id}`}>
      <Card className="p-5 hover:bg-accent/50 transition-all duration-150 cursor-pointer border-border group">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                <Image
                  src={`https://cryptoicons.org/api/icon/${network.symbol.toLowerCase()}/32`}
                  alt={network.name}
                  width={32}
                  height={32}
                  className="w-6 h-6"
                />
              </div>
              <div>
                <h3 className="font-semibold text-base group-hover:text-primary transition-colors">{network.name}</h3>
                <p className="text-xs text-muted-foreground">{network.symbol}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {network.type}
            </Badge>
          </div>

          {/* Triangle Chart */}
          <div className="flex items-center justify-center py-2">
            <TriangleChart pdi={network.pdi} jdi={network.jdi} ihi={network.ihi} size={140} />
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border">
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">PDI</div>
              <IndexTooltip type="pdi" breakdown={orgBreakdown} score={network.pdi}>
                <div className="font-mono text-sm font-medium" style={{ color: "oklch(0.60 0.18 240)" }}>
                  {network.pdi.toFixed(2)}
                </div>
              </IndexTooltip>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">JDI</div>
              <IndexTooltip type="jdi" breakdown={countryBreakdown} score={network.jdi}>
                <div className="font-mono text-sm font-medium" style={{ color: "oklch(0.65 0.15 150)" }}>
                  {network.jdi.toFixed(2)}
                </div>
              </IndexTooltip>
            </div>
            <div>
              <div className="text-xs text-muted-foreground mb-0.5">IHI</div>
              <IndexTooltip type="ihi" breakdown={ispBreakdown} score={network.ihi}>
                <div className="font-mono text-sm font-medium" style={{ color: "oklch(0.63 0.20 290)" }}>
                  {network.ihi.toFixed(2)}
                </div>
              </IndexTooltip>
            </div>
          </div>

          {/* Trend */}
          <div className="flex items-center gap-1.5 text-xs">
            <TrendIcon className={`w-3.5 h-3.5 ${trendColor}`} />
            <span className={trendColor}>{network.trendValue}</span>
            <span className="text-muted-foreground">vs. last month</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
