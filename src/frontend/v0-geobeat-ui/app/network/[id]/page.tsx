import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { networks } from "@/lib/network-data";
import { NetworkMap } from "@/components/network-map";
import { ScrollToTop } from "@/components/scroll-to-top";
import { IndexTooltip } from "@/components/index-tooltip";
import { generateMockNodeData } from "@/lib/mock-node-data";
import { calculateOrgBreakdown, calculateCountryBreakdown, calculateIspBreakdown } from "@/lib/breakdown-utils";

export async function generateStaticParams() {
  return networks.map((network) => ({
    id: network.id,
  }));
}

export default async function NetworkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const network = networks.find((n) => n.id === id);

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

  // Calculate breakdowns for tooltips
  const nodeData = generateMockNodeData(network.id);
  const orgBreakdown = calculateOrgBreakdown(nodeData);
  const countryBreakdown = calculateCountryBreakdown(nodeData);
  const ispBreakdown = calculateIspBreakdown(nodeData);

  return (
    <div className="min-h-screen bg-white">
      <ScrollToTop />
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Back button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-[14px] font-medium text-foreground/75 hover:text-foreground transition-colors mb-6"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Header Section */}
        <div className="mb-10 pb-8 border-b border-foreground/20">
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
              <h1 className="text-3xl font-bold tracking-tight mb-1">
                {network.name}
              </h1>
              <p className="text-[15px] text-foreground/75 font-medium">
                Geographic Decentralization Detail
              </p>
            </div>
          </div>

          {/* GDI Score */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[13px] font-bold text-muted-foreground uppercase tracking-wide">
                Overall GDI Score
              </span>
              <span className="text-3xl font-bold">{gdi}</span>
            </div>
            <div className="h-3 bg-muted rounded-sm overflow-hidden max-w-2xl">
              <div
                className="h-full rounded-sm transition-all duration-300 bg-muted-foreground"
                style={{
                  width: `${gdi}%`,
                }}
              />
            </div>
          </div>

          {/* Three Pillar Scores */}
          <div className="grid grid-cols-3 gap-6 max-w-3xl">
            <div className="space-y-2">
              <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide">
                PDI
              </div>
              <IndexTooltip type="pdi" breakdown={orgBreakdown} score={network.pdi}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-bold w-10 text-muted-foreground">
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
              </IndexTooltip>
            </div>

            <div className="space-y-2">
              <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide">
                JDI
              </div>
              <IndexTooltip type="jdi" breakdown={countryBreakdown} score={network.jdi}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-bold w-10 text-muted-foreground">
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
              </IndexTooltip>
            </div>

            <div className="space-y-2">
              <div className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide">
                IHI
              </div>
              <IndexTooltip type="ihi" breakdown={ispBreakdown} score={network.ihi}>
                <div className="flex items-center gap-2.5">
                  <span className="text-xl font-bold w-10 text-muted-foreground">
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
              </IndexTooltip>
            </div>
          </div>
        </div>

        {/* Section 1: Physical Distribution */}
        <div className="mb-12">
          <div>
            <h2 className="text-xl font-bold mb-1">
              Physical Distribution
            </h2>
            <p className="text-[15px] text-foreground/75 font-medium leading-relaxed mb-4">
              How widely infrastructure is distributed across physical
              geography
            </p>
          </div>

          <div className="grid md:grid-cols-[60%_40%] gap-8 items-start">
            {/* Left: Map */}
            <div className="space-y-4">
              {/* PDI Score - above map */}
              <div className="border-2 border-foreground rounded-sm bg-white p-5">
                <div className="space-y-1">
                  <div className="text-[12px] font-bold text-foreground uppercase tracking-wide mb-3">
                    PDI Score
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-bold">
                      {Math.round(network.pdi)}
                    </span>
                    <span className="text-[14px] text-foreground/70 font-medium">
                      {getBandLabel(network.pdi)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="border border-foreground/30 rounded-sm overflow-hidden">
                <NetworkMap networkId={network.id} />
              </div>
            </div>

            {/* Right: Component Metrics - aligned with map */}
            <div className="flex flex-col gap-4 h-full">
              <div className="border-2 border-foreground rounded-sm bg-white p-5 flex-1">
                <div className="text-[11px] font-bold text-foreground uppercase tracking-wide mb-2">
                  Moran&apos;s I
                </div>
                <div className="text-3xl font-bold mb-2">
                  {network.moransI?.toFixed(3) || "N/A"}
                </div>
                <div className="text-[13px] text-foreground/70 font-medium">
                  Measures spatial autocorrelation
                </div>
              </div>

              <div className="border-2 border-foreground rounded-sm bg-white p-5 flex-1">
                <div className="text-[11px] font-bold text-foreground uppercase tracking-wide mb-2">
                  Spatial HHI
                </div>
                <div className="text-3xl font-bold mb-2">
                  {network.spatialHHI?.toFixed(3) || "N/A"}
                </div>
                <div className="text-[13px] text-foreground/70 font-medium">
                  Geographic concentration index
                </div>
              </div>

              <div className="border-2 border-foreground rounded-sm bg-white p-5 flex-1">
                <div className="text-[11px] font-bold text-foreground uppercase tracking-wide mb-2">
                  ENL
                </div>
                <div className="text-3xl font-bold mb-2">
                  {network.enl || "N/A"}
                </div>
                <div className="text-[13px] text-foreground/70 font-medium">
                  Effective number of locations
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Jurisdictional Diversity */}
        <div className="mb-12 pb-12 border-b border-foreground/20">
          <h2 className="text-xl font-bold mb-5">
            Jurisdictional Diversity
          </h2>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl">
            <div className="border-2 border-foreground rounded-sm bg-white p-5">
              <div className="text-[12px] font-bold text-foreground uppercase tracking-wide mb-3">
                JDI Score
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">
                  {Math.round(network.jdi)}
                </span>
              </div>
              <div className="text-[14px] text-foreground/70 font-medium mt-2">
                {getBandLabel(network.jdi)}
              </div>
            </div>

            <div className="border-2 border-foreground rounded-sm bg-white p-5">
              <div className="text-[11px] font-bold text-foreground uppercase tracking-wide mb-2">
                Country HHI
              </div>
              <div className="text-3xl font-bold mb-2">
                {network.countryHHI?.toFixed(3) || "N/A"}
              </div>
              <div className="text-[13px] text-foreground/70 font-medium">
                Concentration index
              </div>
            </div>

            <div className="border-2 border-foreground rounded-sm bg-white p-5">
              <div className="text-[11px] font-bold text-foreground uppercase tracking-wide mb-2">
                Total Countries
              </div>
              <div className="text-3xl font-bold mb-2">
                {network.numCountries || "N/A"}
              </div>
              <div className="text-[13px] text-foreground/70 font-medium">
                Jurisdictions covered
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Infrastructure Heterogeneity */}
        <div className="mb-12 pb-12 border-b border-foreground/20">
          <h2 className="text-xl font-bold mb-5">
            Infrastructure Heterogeneity
          </h2>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl">
            <div className="border-2 border-foreground rounded-sm bg-white p-5">
              <div className="text-[12px] font-bold text-foreground uppercase tracking-wide mb-3">
                IHI Score
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">
                  {Math.round(network.ihi)}
                </span>
              </div>
              <div className="text-[14px] text-foreground/70 font-medium mt-2">
                {getBandLabel(network.ihi)}
              </div>
            </div>

            <div className="border-2 border-foreground rounded-sm bg-white p-5">
              <div className="text-[11px] font-bold text-foreground uppercase tracking-wide mb-2">
                Org HHI
              </div>
              <div className="text-3xl font-bold mb-2">
                {network.orgHHI?.toFixed(3) || "N/A"}
              </div>
              <div className="text-[13px] text-foreground/70 font-medium">
                Provider concentration
              </div>
            </div>

            <div className="border-2 border-foreground rounded-sm bg-white p-5">
              <div className="text-[11px] font-bold text-foreground uppercase tracking-wide mb-2">
                Total Organizations
              </div>
              <div className="text-3xl font-bold mb-2">
                {network.numOrgs?.toLocaleString() || "N/A"}
              </div>
              <div className="text-[13px] text-foreground/70 font-medium">
                Hosting providers
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Notes and Uncertainty */}
        <div className="max-w-3xl">
          <h2 className="text-xl font-bold mb-4">Notes and Uncertainty</h2>

          <div className="space-y-4 text-[14px] text-foreground/75 font-medium leading-relaxed">
            <p>
              All location and provider inferences are probabilistic and
              imperfect. Geographic decentralization metrics should be
              interpreted as estimates with inherent uncertainty, not absolute
              measurements.
            </p>

            <div className="space-y-2">
              <div className="font-bold text-foreground">
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
              <div className="font-bold text-foreground">
                Measurement Details
              </div>
              <ul className="space-y-1.5 list-disc list-inside">
                <li>Last measurement: {detailData.lastMeasurement}</li>
                <li>Sample size: {network.nodeCount.toLocaleString()} nodes</li>
                <li>Overall confidence: {detailData.confidence}%</li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="font-bold text-foreground">
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
