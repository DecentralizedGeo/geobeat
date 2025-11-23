import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IndexPill } from "@/components/index-pill"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Screen 1 - Hero */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          {/* Left - Black Hole Graphic */}
          <div className="relative flex items-start justify-center p-4 pt-0">
            <img
              src="/images/black-hole.png"
              alt="Abstract network distribution visualization"
              className="w-full h-auto object-contain rounded-sm max-w-lg"
            />
          </div>

          {/* Right - Headline */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h1 className="font-serif text-5xl md:text-6xl tracking-tight text-balance leading-[1.15] text-foreground font-normal">
                Most "decentralized" networks aren't{" "}
                <span className="font-semibold">geographically decentralized.</span>
              </h1>
              <p className="text-xl text-foreground/75 leading-relaxed max-w-xl">
                <span className="font-semibold">GEOBEAT</span> measures where networks <em>actually</em> run — through
                physical, jurisdictional, and infrastructural lenses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Screen 2 - What GEOBEAT Measures */}
      <section id="what-we-measure" className="min-h-screen flex items-center justify-center px-6 py-20 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="border border-border/50 rounded-sm p-12 bg-background">
            <h2 className="font-serif text-4xl font-normal mb-10">What GEOBEAT Measures</h2>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Left column - Description */}
              <div>
                <p className="text-lg text-foreground/85 leading-relaxed">
                  GEOBEAT quantifies geographic decentralization through a composite index across three dimensions:
                </p>
              </div>

              {/* Right column - Three pillars */}
              <div className="space-y-7">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-base">Physical Distribution</h3>
                    <IndexPill type="pdi" />
                  </div>
                  <p className="text-sm text-muted-foreground/90 leading-relaxed">
                    How spread out nodes are across physical geography. Combines spatial clustering detection,
                    effective number of locations, and geographic concentration.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-base">Jurisdictional Diversity</h3>
                    <IndexPill type="jdi" />
                  </div>
                  <p className="text-sm text-muted-foreground/90 leading-relaxed">
                    Distribution across countries and regulatory environments. Penalizes single-country dominance and
                    rewards absolute jurisdictional diversity.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium text-base">Infrastructure Heterogeneity</h3>
                    <IndexPill type="ihi" />
                  </div>
                  <p className="text-sm text-muted-foreground/90 leading-relaxed">
                    Diversity across hosting providers and organizations. Detects concentration risk from cloud
                    provider dependencies.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen 3 - Why This Matters */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <div className="border border-border/50 rounded-sm p-12 bg-background">
            <h2 className="font-serif text-4xl font-normal mb-12">Why Geographic Decentralization Matters</h2>

            <div className="grid md:grid-cols-2 gap-x-14 gap-y-10">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.6 0.18 240)" }}
                  />
                  <div>
                    <h3 className="font-medium text-lg mb-2">Correlated Failures</h3>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      Regional outages create cascading failures when nodes cluster geographically
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.65 0.15 150)" }}
                  />
                  <div>
                    <h3 className="font-medium text-lg mb-2">Regulatory Risk</h3>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      Jurisdictional concentration enables coordinated government action against networks
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.63 0.2 290)" }}
                  />
                  <div>
                    <h3 className="font-medium text-lg mb-2">Infrastructure Dependencies</h3>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      Cloud provider concentration hides critical single points of failure
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div
                    className="mt-1.5 w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: "oklch(0.7 0.1 60)" }}
                  />
                  <div>
                    <h3 className="font-medium text-lg mb-2">Network Resilience</h3>
                    <p className="text-sm text-muted-foreground/90 leading-relaxed">
                      Geographic spread improves liveness, fault tolerance, and attack resistance
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Screen 4 - Entry Into App */}
      <section className="min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="border border-border/50 rounded-sm p-12 bg-background">
            <h2 className="font-serif text-4xl font-normal mb-10">Explore the Data</h2>

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
                  Filecoin
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

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t border-border/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-muted-foreground/70">
            <span className="text-sm">Built by</span>
            <a
              href="https://astral.global"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <img src="/images/astral.svg" alt="Astral" className="h-5 w-auto" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
