"use client"

import { networks } from "@/lib/mock-data"
import { TrendingUp, Globe, Activity, Network } from "lucide-react"
import { cn } from "@/lib/utils"

export function StatsCards() {
  // Calculate statistics
  const totalNetworks = networks.length
  const totalNodes = networks.reduce((sum, network) => sum + (network.nodeCount || 0), 0)

  // Calculate GDI for each network (composite score)
  const networksWithGDI = networks.map((network) => ({
    ...network,
    gdi: Math.round(0.4 * network.pdi + 0.35 * network.jdi + 0.25 * network.ihi),
  }))

  const avgGDI = Math.round(
    networksWithGDI.reduce((sum, network) => sum + network.gdi, 0) / totalNetworks
  )

  const stats = [
    {
      label: "Networks Analyzed",
      value: totalNetworks,
      icon: Network,
      color: "oklch(0.60 0.14 240)",
      bgColor: "rgba(80, 120, 220, 0.08)",
    },
    {
      label: "Total Nodes",
      value: totalNodes.toLocaleString(),
      icon: Globe,
      color: "oklch(0.65 0.12 150)",
      bgColor: "rgba(80, 200, 150, 0.08)",
    },
    {
      label: "Average GDI",
      value: avgGDI,
      icon: Activity,
      color: "oklch(0.58 0.02 240)",
      bgColor: "rgba(100, 100, 120, 0.08)",
      subtitle: "Across all networks",
    },
    {
      label: "Top Network",
      value: networksWithGDI[0]?.name || "N/A",
      icon: TrendingUp,
      color: "oklch(0.63 0.15 290)",
      bgColor: "rgba(180, 100, 220, 0.08)",
      subtitle: `GDI: ${networksWithGDI[0]?.gdi || 0}`,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div
            key={index}
            className="border-2 border-foreground rounded-sm bg-background p-5 hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="p-2 rounded-sm border-2 border-foreground"
                style={{
                  backgroundColor: stat.bgColor,
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: stat.color }}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-[12px] font-bold text-foreground uppercase tracking-wide">
                {stat.label}
              </p>
              <p className="text-3xl font-bold tracking-tight text-foreground">
                {stat.value}
              </p>
              {stat.subtitle && (
                <p className="text-[13px] text-foreground/75 font-medium">
                  {stat.subtitle}
                </p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
