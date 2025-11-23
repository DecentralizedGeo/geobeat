import { Header } from "@/components/header"
import { NetworkList } from "@/components/network-list"
import { IndexPill } from "@/components/index-pill"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-4 max-w-7xl">
        <div className="space-y-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="text-[44px] font-semibold tracking-tight text-balance leading-tight">
                Geographic Decentralization Dashboard
              </h1>
              <p className="text-[12px] text-muted-foreground/70 mt-3 leading-[1.5] max-w-2xl font-normal">
                Explore how blockchain networks differ across geography, providers, and jurisdictions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-6 border-b border-border/50">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <IndexPill type="gdi" />
                  <span className="text-[13px] font-medium text-foreground">Geographic Decentralization Index</span>
                </div>
                <p className="text-[11px] text-muted-foreground/75 leading-relaxed">
                  Composite score across all dimensions
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <IndexPill type="pdi" />
                  <span className="text-[13px] font-medium text-foreground">Physical Distribution Index</span>
                </div>
                <p className="text-[11px] text-muted-foreground/75 leading-relaxed">
                  Spatial distribution of nodes across locations
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <IndexPill type="jdi" />
                  <span className="text-[13px] font-medium text-foreground">Jurisdictional Diversity Index</span>
                </div>
                <p className="text-[11px] text-muted-foreground/75 leading-relaxed">
                  Distribution across legal jurisdictions
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <IndexPill type="ihi" />
                  <span className="text-[13px] font-medium text-foreground">Infrastructure Heterogeneity Index</span>
                </div>
                <p className="text-[11px] text-muted-foreground/75 leading-relaxed">Diversity of hosting providers</p>
              </div>
            </div>
          </div>
          <NetworkList />
        </div>
      </main>
    </div>
  )
}
