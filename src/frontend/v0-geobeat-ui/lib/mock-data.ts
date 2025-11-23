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
    pdi: 62.5,
    jdi: 36.0,
    ihi: 47.7,
    trend: "up",
    trendValue: "+2.3%",
    nodeCount: 16086,
    // Real metrics from GDI v0 calculation (2025-11-22)
    moransI: 0.25,
    spatialHHI: 0.021,
    enl: 207.6,
    countryHHI: 0.143,
    numCountries: 95,
    orgHHI: 0.016,
    numOrgs: 2274,
  },
  {
    id: "polygon",
    name: "Polygon",
    symbol: "MATIC",
    logoUrl: "https://cryptologos.cc/logos/polygon-matic-logo.svg",
    type: "L2",
    pdi: 59.3,
    jdi: 36.2,
    ihi: 47.9,
    trend: "neutral",
    trendValue: "+0.5%",
    nodeCount: 9688,
    // Real metrics from GDI v0 calculation (2025-11-22)
    moransI: 0.29,
    spatialHHI: 0.026,
    enl: 112.4,
    countryHHI: 0.145,
    numCountries: 76,
    orgHHI: 0.017,
    numOrgs: 1346,
  },
  {
    id: "filecoin",
    name: "Filecoin",
    symbol: "FIL",
    logoUrl: "https://cryptologos.cc/logos/filecoin-fil-logo.svg",
    type: "L1",
    pdi: 58.2,
    jdi: 36.0,
    ihi: 35.8,
    trend: "neutral",
    trendValue: "±0%",
    nodeCount: 223,
    // Real metrics from GDI v0 calculation (2025-11-22)
    moransI: 0.3,
    spatialHHI: 0.025,
    enl: 61.6,
    countryHHI: 0.137,
    numCountries: 24,
    orgHHI: 0.024,
    numOrgs: 116,
  },
]
