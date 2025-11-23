import { Header } from "@/components/header"
import { NetworkList } from "@/components/network-list"
import { IndexPill } from "@/components/index-pill"
import { ScrollToTop } from "@/components/scroll-to-top"

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Header />
      <main className="flex-1 container mx-auto px-4 py-4 max-w-7xl">
        <div className="space-y-8">
          <div className="flex flex-col gap-6">
            <div>
              <h1 className="font-serif text-[44px] font-semibold tracking-tight text-balance leading-tight">
                Geographic Decentralization Dashboard
              </h1>
              <p className="text-[13px] text-muted-foreground/85 mt-3 leading-[1.5] max-w-2xl font-normal">
                Explore how blockchain networks differ across geography, providers, and jurisdictions
              </p>
            </div>
          </div>
          <NetworkList />
        </div>
      </main>
    </div>
  )
}
