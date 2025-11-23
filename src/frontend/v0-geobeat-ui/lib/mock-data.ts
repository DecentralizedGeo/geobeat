export interface Network {
  id: string
  name: string
  symbol: string
  logoUrl: string
  type: "L1" | "L2" | "App Chain"
  pdi: number
  jdi: number
  ihi: number
  trend: "up" | "down" | "neutral"
  trendValue: string
  nodeCount: number
  // Real metrics from GDI calculation
  moransI: number
  spatialHHI: number
  enl: number
  countryHHI: number
  numCountries: number
  orgHHI: number
  numOrgs: number
}

// v0 networks with real GDI data
export const networks: Network[] = [
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    logoUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.svg",
    type: "L1",
    pdi: 62.8,
    jdi: 34.9,
    ihi: 48.2,
    trend: "up",
    trendValue: "+2.3%",
    nodeCount: 12664,
    // Real metrics from GDI v0 calculation
    moransI: 0.254,
    spatialHHI: 0.020,
    enl: 236.9,
    countryHHI: 0.145,
    numCountries: 92,
    orgHHI: 0.016,
    numOrgs: 2070,
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    logoUrl: "https://cryptologos.cc/logos/polygon-matic-logo.svg",
    type: "L2",
    pdi: 57.7,
    jdi: 33.2,
    ihi: 46.5,
    trend: "neutral",
    trendValue: "+0.5%",
    nodeCount: 5747,
    // Real metrics from GDI v0 calculation
    moransI: 0.323,
    spatialHHI: 0.030,
    enl: 98.2,
    countryHHI: 0.156,
    numCountries: 69,
    orgHHI: 0.018,
    numOrgs: 944,
  },
]
