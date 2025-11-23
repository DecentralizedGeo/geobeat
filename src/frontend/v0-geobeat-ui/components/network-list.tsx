"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp, ExternalLink } from "lucide-react"
import { networks, type Network } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { NetworkMap } from "@/components/network-map"
import { IndexPill } from "@/components/index-pill"
import { IndexTooltip } from "@/components/index-tooltip"
import { generateMockNodeData } from "@/lib/mock-node-data"
import { calculateOrgBreakdown, calculateCountryBreakdown, calculateIspBreakdown } from "@/lib/breakdown-utils"

type SortField = "gdi" | "pdi" | "jdi" | "ihi"
type SortDirection = "asc" | "desc"

export function NetworkList() {
  const [sortField, setSortField] = useState<SortField>("gdi")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const toggleExpanded = (networkId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(networkId)) {
        newSet.delete(networkId)
      } else {
        newSet.add(networkId)
      }
      return newSet
    })
  }

  const networksWithGDI = networks.map((network) => ({
    ...network,
    // GDI calculation - composite score
    gdi: Math.round(0.4 * network.pdi + 0.35 * network.jdi + 0.25 * network.ihi),
  }))

  const sortedNetworks = [...networksWithGDI].sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1
    const aValue = a[sortField] ?? 0
    const bValue = b[sortField] ?? 0
    return direction * (aValue - bValue)
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-1.5">Network Comparison</h2>
        <p className="text-[15px] text-foreground/75 font-medium">Compare networks across any dimension</p>
      </div>

      <div className="border-2 border-foreground rounded-sm overflow-hidden bg-white">
        {/* Column Headers */}
        <div className="grid grid-cols-[50px_2fr_1fr_70px_1fr_1fr_1fr] gap-4 px-5 py-3 border-b-2 border-foreground bg-white">
          <div className="text-[12px] font-bold text-foreground uppercase tracking-wide">#</div>
          <div className="text-[12px] font-bold text-foreground uppercase tracking-wide">Network</div>
          <button
            onClick={() => handleSort("gdi")}
            className="text-[12px] font-bold text-foreground uppercase tracking-wide hover:opacity-70 transition-opacity flex items-center gap-1.5 justify-start"
          >
            <IndexPill type="gdi" showTooltip />
            {sortField === "gdi" && <span className="text-[10px]">{sortDirection === "desc" ? "↓" : "↑"}</span>}
          </button>
          <div className="text-[12px] font-bold text-foreground uppercase tracking-wide">Trend</div>
          <button
            onClick={() => handleSort("pdi")}
            className="text-[12px] font-bold text-foreground uppercase tracking-wide hover:opacity-70 transition-opacity flex items-center gap-1.5 justify-start"
          >
            <IndexPill type="pdi" showTooltip />
            {sortField === "pdi" && <span className="text-[10px]">{sortDirection === "desc" ? "↓" : "↑"}</span>}
          </button>
          <button
            onClick={() => handleSort("jdi")}
            className="text-[12px] font-bold text-foreground uppercase tracking-wide hover:opacity-70 transition-opacity flex items-center gap-1.5 justify-start"
          >
            <IndexPill type="jdi" showTooltip />
            {sortField === "jdi" && <span className="text-[10px]">{sortDirection === "desc" ? "↓" : "↑"}</span>}
          </button>
          <button
            onClick={() => handleSort("ihi")}
            className="text-[12px] font-bold text-foreground uppercase tracking-wide hover:opacity-70 transition-opacity flex items-center gap-1.5 justify-start"
          >
            <IndexPill type="ihi" showTooltip />
            {sortField === "ihi" && <span className="text-[10px]">{sortDirection === "desc" ? "↓" : "↑"}</span>}
          </button>
        </div>

        {/* Rows */}
        <div>
          {sortedNetworks.map((network, index) => (
            <NetworkRow
              key={network.id}
              network={network}
              rank={index + 1}
              isEven={index % 2 === 0}
              isExpanded={expandedRows.has(network.id)}
              onToggle={() => toggleExpanded(network.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function NetworkRow({
  network,
  rank,
  isEven,
  isExpanded,
  onToggle,
}: {
  network: Network & { gdi: number }
  rank: number
  isEven: boolean
  isExpanded: boolean
  onToggle: () => void
}) {
  const TrendIcon = network.trend === "up" ? TrendingUp : network.trend === "down" ? TrendingDown : Minus
  const trendColor =
    network.trend === "up"
      ? "text-green-600/80"
      : network.trend === "down"
        ? "text-red-600/80"
        : "text-muted-foreground/50"

  const isLowScore = (score: number) => score < 50
  
  // Calculate breakdowns for tooltips
  const nodeData = useMemo(() => generateMockNodeData(network.id), [network.id])
  const orgBreakdown = useMemo(() => calculateOrgBreakdown(nodeData), [nodeData])
  const countryBreakdown = useMemo(() => calculateCountryBreakdown(nodeData), [nodeData])
  const ispBreakdown = useMemo(() => calculateIspBreakdown(nodeData), [nodeData])

  return (
    <div className="border-b border-foreground/20">
      <button
        onClick={onToggle}
        className={cn(
          "w-full grid grid-cols-[50px_2fr_1fr_70px_1fr_1fr_1fr] gap-4 px-5 transition-colors group text-left",
          rank === 1 ? "py-4" : "py-3.5",
        )}
      >
        {/* Rank */}
        <div className="flex items-center">
          <span className="text-[15px] font-medium text-muted-foreground/60">{rank}</span>
        </div>

        {/* Network Name + Logo */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-5 h-5 flex-shrink-0">
            <Image
              src={network.logoUrl || "/placeholder.svg"}
              alt={network.name}
              width={20}
              height={20}
              className="w-full h-full"
            />
          </div>
          <div className="min-w-0 flex-1">
            <Link
              href={`/network/${network.id}`}
              className="font-semibold text-[15px] leading-tight hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {network.name}
            </Link>
            <p className="text-[11px] text-muted-foreground/60 font-normal">
              {network.nodeCount?.toLocaleString()} nodes
            </p>
          </div>
          <div className="ml-auto">
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground/60" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60" />
            )}
          </div>
        </div>

        {/* GDI with horizontal bar */}
        <div className="flex items-center gap-2.5">
          <span className="font-semibold text-[15px] w-7">{network.gdi}</span>
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${network.gdi}%`,
                background: "oklch(0.58 0.02 240)",
              }}
            />
          </div>
        </div>

        {/* Trend */}
        <div className="flex items-center justify-center">
          <TrendIcon className={cn("w-3.5 h-3.5", trendColor)} />
        </div>

        {/* PDI with horizontal bar */}
        <IndexTooltip type="pdi" breakdown={orgBreakdown} score={network.pdi}>
          <div className="flex items-center gap-2.5">
            <span className={cn("font-semibold text-[15px] w-7", isLowScore(network.pdi) && "text-red-500/90")}>
              {network.pdi}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${network.pdi}%`,
                  background: "oklch(0.60 0.14 240)",
                }}
              />
            </div>
          </div>
        </IndexTooltip>

        {/* JDI with horizontal bar */}
        <IndexTooltip type="jdi" breakdown={countryBreakdown} score={network.jdi}>
          <div className="flex items-center gap-2.5">
            <span className={cn("font-semibold text-[15px] w-7", isLowScore(network.jdi) && "text-red-500/90")}>
              {Math.round(network.jdi)}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${network.jdi}%`,
                  background: "oklch(0.65 0.12 150)",
                }}
              />
            </div>
          </div>
        </IndexTooltip>

        {/* IHI with horizontal bar */}
        <IndexTooltip type="ihi" breakdown={ispBreakdown} score={network.ihi}>
          <div className="flex items-center gap-2.5">
            <span className={cn("font-semibold text-[15px] w-7", isLowScore(network.ihi) && "text-red-500/90")}>
              {Math.round(network.ihi)}
            </span>
            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${network.ihi}%`,
                  background: "oklch(0.63 0.15 290)",
                }}
              />
            </div>
          </div>
        </IndexTooltip>
      </button>

      <div
        className={cn(
          "grid transition-all duration-300 ease-in-out",
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5 pt-3 border-t border-border/40">
            <div className="grid grid-cols-[60%_40%] gap-6">
              {/* Left: Map */}
              <div className="space-y-3">
                <div className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide mb-2">
                  Geographic Distribution
                </div>
                <NetworkMap networkId={network.id} />
              </div>

              {/* Right: Pillar Metrics */}
              <div className="space-y-4">
                <div className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wide mb-2">
                  Pillar Breakdown
                </div>

                {/* PDI Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">PDI: {Math.round(network.pdi)}</span>
                    <div className="flex-1 mx-3 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${network.pdi}%`,
                          background: "oklch(0.60 0.14 240)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-[13px] text-muted-foreground/80 space-y-1 pl-1">
                    <div>• Moran's I: {network.moransI?.toFixed(3) || 'N/A'}</div>
                    <div>• ENL: {network.enl?.toFixed(1) || 'N/A'}</div>
                    <div>• Spatial HHI: {network.spatialHHI?.toFixed(3) || 'N/A'}</div>
                  </div>
                </div>

                {/* JDI Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">JDI: {Math.round(network.jdi)}</span>
                    <div className="flex-1 mx-3 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${network.jdi}%`,
                          background: "oklch(0.65 0.12 150)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-[13px] text-muted-foreground/80 space-y-1 pl-1">
                    <div>• Country HHI: {network.countryHHI?.toFixed(3) || 'N/A'}</div>
                    <div>• Total countries: {network.numCountries || 'N/A'}</div>
                  </div>
                </div>

                {/* IHI Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold">IHI: {Math.round(network.ihi)}</span>
                    <div className="flex-1 mx-3 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${network.ihi}%`,
                          background: "oklch(0.63 0.15 290)",
                        }}
                      />
                    </div>
                  </div>
                  <div className="text-[13px] text-muted-foreground/80 space-y-1 pl-1">
                    <div>• Org HHI: {network.orgHHI?.toFixed(3) || 'N/A'}</div>
                    <div>• Total orgs: {network.numOrgs?.toLocaleString() || 'N/A'}</div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="pt-3 border-t border-border/40 space-y-2">
                  <div className="text-[11px] text-muted-foreground/70">
                    {network.nodeCount?.toLocaleString()} nodes analyzed • Confidence: 87% • Last updated: 2h ago
                  </div>
                  <Link
                    href={`/network/${network.id}`}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-foreground/80 hover:text-foreground transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Full Details
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
