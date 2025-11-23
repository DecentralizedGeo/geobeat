import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IndexPill } from "@/components/index-pill"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Screen 1 - Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Left - Abstract Map Graphic */}
          <div className="relative aspect-square">
            <img
              src="/images/image.png"
              alt="Abstract network distribution visualization"
              className="w-full h-full object-cover rounded-sm opacity-90"
            />
          </div>

          {/* Right - Headline */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl tracking-tight text-balance leading-[1.1]">
                Most "decentralized" networks aren't{" "}
                <span className="font-semibold">geographically decentralized.</span>
              </h1>
              <p className="text-lg text-muted-foreground/80 leading-relaxed max-w-xl">
                We measure where networks actually run — physically, legally, and infrastructurally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screen 2 - What Geobeat Measures */}
      <section id="what-we-measure" className="min-h-screen flex items-center justify-center px-6 py-20 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="border border-border/50 rounded-sm p-12 bg-background">
            <h2 className="text-3xl font-semibold mb-8">What Geobeat Measures</h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Left column - Description */}
              <div>
                <p className="text-base text-foreground/90 leading-relaxed">
                  Geobeat makes the geographic structure of decentralized networks visible. We evaluate three
                  dimensions:
                </p>
              </div>

              {/* Right column - Three pillars */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-base">Physical Distribution</h3>
                    <IndexPill type="pdi" />
                  </div>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">
                    Measures spatial entropy and geographic spread of validator nodes across locations.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-base">Jurisdictional Diversity</h3>
                    <IndexPill type="jdi" />
                  </div>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">
                    Evaluates distribution across legal jurisdictions and regulatory environments.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-base">Infrastructure Heterogeneity</h3>
                    <IndexPill type="ihi" />
                  </div>
                  <p className="text-sm text-muted-foreground/80 leading-relaxed">
                    Assesses diversity of cloud providers and hosting infrastructure dependencies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen 3 - Evidence / Example */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="border border-border/50 rounded-sm p-12 bg-background">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Left - Example Network Card */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <img src="https://cryptologos.cc/logos/ethereum-eth-logo.svg" alt="Ethereum" className="w-10 h-10" />
                  <h3 className="text-2xl font-semibold">Ethereum</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-medium">Physical Distribution</span>
                      <span className="text-lg font-semibold" style={{ color: "oklch(0.6 0.18 240)" }}>
                        32
                      </span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: "32%", backgroundColor: "oklch(0.6 0.18 240)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-medium">Jurisdictional Diversity</span>
                      <span className="text-lg font-semibold" style={{ color: "oklch(0.65 0.15 150)" }}>
                        44
                      </span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: "44%", backgroundColor: "oklch(0.65 0.15 150)" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-sm font-medium">Infrastructural Heterogeneity</span>
                      <span className="text-lg font-semibold" style={{ color: "oklch(0.63 0.2 290)" }}>
                        38
                      </span>
                    </div>
                    <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: "38%", backgroundColor: "oklch(0.63 0.2 290)" }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <img
                    src="/images/image.png"
                    alt="Network distribution map"
                    className="w-full h-32 object-cover rounded-sm opacity-80"
                  />
                </div>
              </div>

              {/* Right - Key Findings */}
              <div className="flex flex-col justify-center space-y-6">
                <h3 className="text-xl font-semibold mb-2">Key Findings:</h3>
                <ul className="space-y-4 text-foreground/90">
                  <li className="flex items-start gap-3">
                    <span className="text-2xl font-bold" style={{ color: "oklch(0.55 0.15 40)" }}>
                      41%
                    </span>
                    <span className="text-base leading-relaxed pt-1">
                      <span style={{ color: "oklch(0.55 0.15 40)" }}>of</span> nodes{" "}
                      <span style={{ color: "oklch(0.55 0.15 40)" }}>in</span> a single country
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-2xl font-bold" style={{ color: "oklch(0.55 0.15 40)" }}>
                      52%
                    </span>
                    <span className="text-base leading-relaxed pt-1">
                      <span style={{ color: "oklch(0.55 0.15 40)" }}>on one</span> cloud provider
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-base leading-relaxed">
                      Effective jurisdictions:{" "}
                      <span className="text-2xl font-bold" style={{ color: "oklch(0.55 0.15 40)" }}>
                        2.7
                      </span>
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen 4 - Why This Matters */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="border border-border/50 rounded-sm p-12 bg-background">
            <h2 className="text-3xl font-semibold mb-8">Why Geographic Decentralization Matters</h2>

            <ul className="space-y-6 text-base text-foreground/90">
              <li className="flex items-start gap-3">
                <span className="text-lg">•</span>
                <span className="leading-relaxed">
                  Regional outages <span style={{ color: "oklch(0.55 0.15 40)" }}>create</span> correlated failures
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">•</span>
                <span className="leading-relaxed">
                  Legal alignment amplifies central points <span style={{ color: "oklch(0.55 0.15 40)" }}>of</span>{" "}
                  control
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">•</span>
                <span className="leading-relaxed">Cloud dependence hides critical single-provider risk</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-lg">•</span>
                <span className="leading-relaxed">
                  Geographic spread improves liveness <span style={{ color: "oklch(0.55 0.15 40)" }}>and</span>{" "}
                  resilience
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Screen 5 - Entry Into App */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="border border-border/50 rounded-sm p-12 bg-background">
            <h2 className="text-3xl font-semibold mb-8">Explore the Data</h2>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-sm bg-transparent">
                  Ethereum
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-sm bg-transparent">
                  Polygon
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-sm bg-transparent">
                  Solana
                </Button>
              </Link>
            </div>

            <Link href="/dashboard">
              <Button size="lg" className="rounded-sm group">
                Open Dashboard
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
