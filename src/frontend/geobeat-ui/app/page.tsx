import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IndexPill } from "@/components/index-pill"
import { HeroGeofunnel } from "@/components/hero-geofunnel"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Screen 1 - Hero with Funnel Animation */}
      <HeroGeofunnel />

      {/* Screen 2 - What GEOBEAT Measures */}
      <section id="what-we-measure" className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="border-2 border-foreground rounded-sm p-12 bg-white">
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
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="border-2 border-foreground rounded-sm p-12 bg-white">
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
      <section className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="border-2 border-foreground rounded-sm p-12 bg-white">
            <h2 className="font-serif text-4xl font-normal mb-10">Explore the Data</h2>

            <div className="flex flex-wrap justify-center gap-4 mb-10">
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-sm bg-white border-2 border-foreground">
                  Ethereum
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-sm bg-white border-2 border-foreground">
                  Polygon
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" className="rounded-sm bg-white border-2 border-foreground">
                  Filecoin
                </Button>
              </Link>
            </div>

            <Link href="/dashboard">
              <Button size="lg" className="rounded-sm group bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground">
                Open Dashboard
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t-2 border-foreground">
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
