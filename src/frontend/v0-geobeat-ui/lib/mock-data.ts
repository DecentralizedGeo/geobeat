export interface Network {
  id: string
  name: string
  symbol: string
  logoUrl: string
  type: "L1" | "L2" | "App Chain"
  pdi: number
  jdi?: number // Optional - coming soon
  ihi?: number // Optional - coming soon
  trend: "up" | "down" | "neutral"
  trendValue: string
  nodeCount: number
  // Real PDI metrics
  moransI?: number
  spatialHHI?: number
  enl?: number
}

// v0 networks with real data
export const networks: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
    type: "L1",
    pdi: 54.8,
    trend: "up",
    trendValue: "+2.3%",
    nodeCount: 6920,
    // Real metrics from CSV data
    moransI: 0.52,
    spatialHHI: 0.032,
    enl: 180,
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    logoUrl: "https://cryptologos.cc/logos/polygon-matic-logo.svg",
    type: "L2",
    pdi: 46.1,
    trend: "neutral",
    trendValue: "+0.5%",
    nodeCount: 3287,
    // Placeholder - will be updated with real data
    moransI: 0.45,
    spatialHHI: 0.041,
    enl: 145,
  },
  {
    id: "filecoin",
    name: "Filecoin",
    symbol: "FIL",
    logoUrl: "https://cryptologos.cc/logos/filecoin-fil-logo.svg",
    type: "L1",
    pdi: 51.7,
    trend: "neutral",
    trendValue: "+0.2%",
    nodeCount: 3128,
    // Placeholder - will be updated with real data
    moransI: 0.48,
    spatialHHI: 0.038,
    enl: 165,
  },
]
