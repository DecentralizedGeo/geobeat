import Link from "next/link"
import { Header } from "@/components/header"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "GEOBEAT: A Clearer View of Network Geography - GEOBEAT Blog",
  description:
    "The crypto world spends a lot of energy talking about decentralization, but most of that discussion stays inside the protocol. What's missing is a clear view of the physical and legal footprint these networks depend on.",
}

export default function IntroducingGeobeat() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <article className="space-y-8">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Header */}
          <header className="space-y-4 pb-8 border-b-2 border-foreground/10">
            <h1 className="font-serif text-[44px] font-semibold tracking-tight leading-tight">
              GEOBEAT: A Clearer View of Network Geography
            </h1>
            <div className="flex items-center gap-3 text-[14px] text-muted-foreground/70">
              <time dateTime="2025-12-09">December 9, 2025</time>
              <span>•</span>
              <span>8 min read</span>
              <span>•</span>
              <span>Built by Astral</span>
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <h2 className="font-serif text-3xl font-semibold mt-12 mb-6">Setting the Stage</h2>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              The crypto world spends a lot of energy talking about decentralization, but most of that discussion stays
              inside the protocol. Consensus, clients, staking distribution, governance — all important. What's missing
              is a clear view of the <strong>physical and legal footprint</strong> these networks depend on.
            </p>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              Flashbots'{" "}
              <a
                href="https://collective.flashbots.net/t/decentralized-crypto-needs-you-to-be-a-geographical-decentralization-maxi/1385"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline hover:text-foreground/80"
              >
                post on geographical decentralization
              </a>{" "}
              made this pretty plain.
            </p>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              Once you start paying attention, you notice how little visibility there is into where nodes actually run,
              which countries matter most, and how much of the system sits inside a few commercial clouds. People talk
              about decentralization in the abstract; the real-world structure is something most teams only have a loose
              sense of.
            </p>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              GEOBEAT is meant to give that structure some shape.
            </p>

            <h2 className="font-serif text-3xl font-semibold mt-12 mb-6">The Index</h2>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              The <strong>Geographic Decentralization Index (GDI)</strong> is a way to summarize the physical,
              jurisdictional, and infrastructural layout of a network without pretending the problem is simple.
            </p>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">It focuses on three areas:</p>

            <div className="space-y-6 my-8 pl-6">
              <div>
                <h3 className="font-semibold text-[19px] mb-2">Physical distribution</h3>
                <p className="text-[17px] leading-[1.7] text-foreground/85">
                  How spread out or concentrated the infrastructure is when you look at actual spatial patterns.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[19px] mb-2">Jurisdictional diversity</h3>
                <p className="text-[17px] leading-[1.7] text-foreground/85">
                  Which legal systems have influence because that's where infrastructure ends up.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[19px] mb-2">Infrastructure heterogeneity</h3>
                <p className="text-[17px] leading-[1.7] text-foreground/85">
                  How much variety there is in clouds, ASNs, and datacenters.
                </p>
              </div>
            </div>

            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              The methods and assumptions are{" "}
              <a
                href="https://github.com/DecentralizedGeo/geobeat/blob/main/docs/PROPOSED_METHODOLOGY.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline hover:text-foreground/80"
              >
                written down
              </a>{" "}
              so people can critique them or propose changes.
            </p>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              The point is to give the community a common starting place rather than a finished verdict.
            </p>

            <h2 className="font-serif text-3xl font-semibold mt-12 mb-6">The Tool</h2>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              The{" "}
              <a
                href="https://geobeat.xyz/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground underline hover:text-foreground/80"
              >
                dashboard at GEOBEAT.xyz
              </a>{" "}
              turns all of this into something you can inspect directly.
            </p>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              It shows where nodes cluster, which jurisdictions dominate, and how infrastructure choices differ across
              networks. You can flip between networks, look at sub-index scores, and get a sense of patterns that aren't
              visible from protocol-level data alone.
            </p>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              Think of it as basic geographic literacy for decentralized systems.
            </p>

            <h2 className="font-serif text-3xl font-semibold mt-12 mb-6">Why Geography Matters</h2>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              Geography shapes how networks behave under stress — regulatory pressure, regional outages, datacenter
              failures, unexpected incentives, or shifts in where operators prefer to host. These things usually show up
              before anyone is looking for them.
            </p>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              It's not a theoretical debate; it's the everyday operational substrate these networks sit on. Once you map
              it, you see how much it influences "decentralization" in practice.
            </p>

            <h2 className="font-serif text-3xl font-semibold mt-12 mb-6">What's Next</h2>

            <div className="space-y-6 my-8">
              <div>
                <h3 className="font-semibold text-[19px] mb-2">Refine the methodology with the community</h3>
                <p className="text-[17px] leading-[1.7] text-foreground/85">
                  The index will improve as researchers, client teams, operators, and policy folks weigh in.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[19px] mb-2">
                  Strengthen the data pipelines <span className="text-muted-foreground">(in progress)</span>
                </h3>
                <p className="text-[17px] leading-[1.7] text-foreground/85">
                  Reliable feeds across more networks, with better ways to keep inference and telemetry aligned.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[19px] mb-2">Expand coverage</h3>
                <p className="text-[17px] leading-[1.7] text-foreground/85">
                  More L1s, L2s, AVSs, rollups, storage networks, and P2P systems.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-[19px] mb-2">Develop stronger signals</h3>
                <p className="text-[17px] leading-[1.7] text-foreground/85 mb-3">
                  Inference can only get us so far. We're working toward a framework for multifactor location proofs —
                  combining several independent signals, including cryptographic ones — that make geographic claims more
                  reliable.
                </p>
                <p className="text-[17px] leading-[1.7] text-foreground/85">
                  Related work:{" "}
                  <a
                    href="https://collective.flashbots.net/t/towards-stronger-location-proofs/5323"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground underline hover:text-foreground/80"
                  >
                    Towards Stronger Location Proofs
                  </a>
                </p>
              </div>
            </div>

            <h2 className="font-serif text-3xl font-semibold mt-12 mb-6">If You Want to Talk</h2>
            <p className="text-[17px] leading-[1.7] text-foreground/85 mb-5">
              Astral is building GEOBEAT as an open measurement layer for network geography. If you're thinking about
              infrastructure resilience, decentralization standards, or verifiable location systems, we're happy to
              compare notes.
            </p>

            {/* CTA Box */}
            <div className="border-2 border-foreground rounded-sm p-8 bg-white mt-12">
              <h3 className="font-serif text-2xl font-semibold mb-4">Explore the Dashboard</h3>
              <p className="text-[16px] text-foreground/80 mb-6">
                See how Ethereum, Polygon, Filecoin, and other networks compare across geographic decentralization
                metrics.
              </p>
              <Link
                href="/dashboard"
                className="inline-block px-6 py-3 bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground rounded-sm text-[14px] font-medium transition-colors"
              >
                View Dashboard →
              </Link>
            </div>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t-2 border-foreground mt-16">
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
