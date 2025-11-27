import { NetworkCard } from "@/components/network-card"
import { networks } from "@/lib/network-data"

export function NetworkGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {networks.map((network) => (
        <NetworkCard key={network.id} network={network} />
      ))}
    </div>
  )
}
