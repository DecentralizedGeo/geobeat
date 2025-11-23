"use client"

import { useEffect } from "react"
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { networks } from "@/lib/mock-data";
import { NetworkMap } from "@/components/network-map";

export default function NetworkDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const network = networks.find((n) => n.id === id);

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  if (!network) {
    notFound();
  }

  // GDI calculation - composite score
  const gdi = Math.round(0.4 * network.pdi + 0.35 * network.jdi + 0.25 * network.ihi);

  // Mock detailed data
  const detailData = {
    spatialEntropy: 3.45,
    effectiveRegions: 12,
    clusterIntensity: "Moderate clustering",
    footprintRadius: "2,450 km",
    effectiveJurisdictions: 9,
    topJurisdictions: [
      { name: "United States", share: 41 },
      { name: "Germany", share: 12 },
      { name: "United Kingdom", share: 8 },
      { name: "France", share: 7 },
      { name: "Netherlands", share: 6 },
    ],
    providerHHI: 1850,
    effectiveProviders: 8,
    bareMetalShare: 18,
    providers: [
      { name: "AWS", share: 55 },
      { name: "Google Cloud", share: 22 },
      { name: "Hetzner", share: 15 },
      { name: "Other", share: 8 },
    ],
    lastMeasurement: "2024-01-15 14:32 UTC",
    confidence: 87,
  };

  const getBandLabel = (score: number): string => {
    if (score >= 80) return "High dispersion";
    if (score >= 60) return "Moderate dispersion";
    return "Low dispersion";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header Section */}
        <div className="mb-10 pb-8 border-b border-border/60">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 flex-shrink-0">
              <Image
                src={network.logoUrl || "/placeholder.svg"}
                alt={network.name}
                width={48}
                height={48}
                className="w-full h-full"
              />
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight mb-1">
                {network.name}
              </h1>
              <p className="text-[13px] text-muted-foreground">
                Geographic Decentralization Detail
              </p>
            </div>
          </div>

          {/* GDI Score */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[13px] font-medium text-muted-foreground uppercase tracking-wide">
                Overall GDI Score
              </span>
              <span className="text-3xl font-semibold">{gdi}</span>
            </div>
            <div className="h-3 bg-muted rounded-sm overflow-hidden max-w-2xl">
              <div
                className="h-full rounded-sm transition-all duration-300"
                style={{
                  width: `${gdi}%`,
                  background: "oklch(0.60 0.14 240)",
                }}
              />
            </div>
          </div>

          {/* Three Pillar Scores */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl">
            <div className="space-y-2">
              <div className="text-[12px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                PDI
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-semibold w-10">
                  {Math.round(network.pdi)}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${network.pdi}%`,
                      background: "oklch(0.60 0.14 240)",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[12px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                JDI
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-semibold w-10">
                  {Math.round(network.jdi)}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${network.jdi}%`,
                      background: "oklch(0.65 0.12 150)",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-[12px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                IHI
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-semibold w-10">
                  {Math.round(network.ihi)}
                </span>
                <div className="flex-1 h-2 bg-muted rounded-sm overflow-hidden">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${network.ihi}%`,
                      background: "oklch(0.63 0.15 290)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: Physical Distribution */}
        <div className="mb-12">
          <div className="grid md:grid-cols-[60%_40%] gap-8">
            {/* Left: Map */}
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Physical Distribution
                </h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed">
                  How widely infrastructure is distributed across physical
                  geography
                </p>
              </div>
              <NetworkMap networkId={network.id} />
            </div>

            {/* Right: Metrics Panel */}
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold">
                    {Math.round(network.pdi)}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {getBandLabel(network.pdi)}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="text-[13px] font-medium mb-1">
                    Moran&apos;s I
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {network.moransI?.toFixed(3) || "N/A"}
                  </div>
                  <div className="text-[12px] text-muted-foreground/70 mt-1">
                    Measures spatial autocorrelation; higher values indicate
                    stronger geographic clustering
                  </div>
                </div>

                <div>
                  <div className="text-[13px] font-medium mb-1">
                    Spatial HHI
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {network.spatialHHI?.toFixed(3) || "N/A"}
                  </div>
                  <div className="text-[12px] text-muted-foreground/70 mt-1">
                    Herfindahl index for geographic concentration; lower values
                    indicate better distribution
                  </div>
                </div>

                <div>
                  <div className="text-[13px] font-medium mb-1">
                    Effective Number of Locations (ENL)
                  </div>
                  <div className="text-[13px] text-muted-foreground">
                    {network.enl || "N/A"}
                  </div>
                  <div className="text-[12px] text-muted-foreground/70 mt-1">
                    Equivalent number of evenly distributed regions; higher
                    values indicate better dispersion
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Jurisdictional Diversity */}
        <div className="mb-12 pb-12 border-b border-border/60">
          <h2 className="text-xl font-semibold mb-5">
            Jurisdictional Diversity
          </h2>

          <div className="max-w-2xl space-y-5">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold">
                {Math.round(network.jdi)}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {getBandLabel(network.jdi)}
              </span>
            </div>

            <div className="pt-4 space-y-3">
              <div>
                <span className="text-[13px] font-medium">
                  Country HHI:{" "}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {network.countryHHI?.toFixed(3) || "N/A"}
                </span>
              </div>
              <div>
                <span className="text-[13px] font-medium">
                  Total Countries:{" "}
                </span>
                <span className="text-[13px] text-muted-foreground">
                  {network.numCountries || "N/A"}
                </span>
              </div>
              <div className="text-[13px] text-muted-foreground">
                Lower HHI indicates more even distribution across countries
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Infrastructure Heterogeneity */}
        <div className="mb-12 pb-12 border-b border-border/60">
          <h2 className="text-xl font-semibold mb-5">
            Infrastructure Heterogeneity
          </h2>

          <div className="max-w-3xl space-y-5">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-semibold">
                {Math.round(network.ihi)}
              </span>
              <span className="text-[13px] text-muted-foreground">
                {getBandLabel(network.ihi)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-3">
              <div>
                <div className="text-[13px] font-medium mb-1">Org HHI</div>
                <div className="text-[13px] text-muted-foreground">
                  {network.orgHHI?.toFixed(3) || "N/A"}
                </div>
              </div>

              <div>
                <div className="text-[13px] font-medium mb-1">
                  Total Organizations
                </div>
                <div className="text-[13px] text-muted-foreground">
                  {network.numOrgs?.toLocaleString() || "N/A"}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-[13px] text-muted-foreground">
                  Lower HHI indicates more even distribution across hosting providers/organizations
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Notes and Uncertainty */}
        <div className="max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Notes and Uncertainty</h2>

          <div className="space-y-4 text-[13px] text-muted-foreground leading-relaxed">
            <p>
              All location and provider inferences are probabilistic and
              imperfect. Geographic decentralization metrics should be
              interpreted as estimates with inherent uncertainty, not absolute
              measurements.
            </p>

            <div className="space-y-2">
              <div className="font-medium text-foreground">
                Data Sources and Methodology
              </div>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Public node crawls and peer discovery protocols</li>
                <li>IP geolocation databases (MaxMind, IPinfo)</li>
                <li>Cloud provider fingerprinting via ASN and reverse DNS</li>
                <li>RIPE Atlas measurements for validation</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-medium text-foreground">
                Measurement Details
              </div>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Last measurement: {detailData.lastMeasurement}</li>
                <li>Sample size: {network.nodeCount.toLocaleString()} nodes</li>
                <li>Overall confidence: {detailData.confidence}%</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-medium text-foreground">
                Known Limitations
              </div>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>VPN usage may distort location inferences</li>
                <li>Residential nodes are underrepresented in public crawls</li>
                <li>Provider identification accuracy varies by network</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
