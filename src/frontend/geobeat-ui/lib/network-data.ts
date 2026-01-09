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
  // GDI calculation metrics
  moransI: number
  spatialHHI: number
  enl: number
  countryHHI: number
  numCountries: number
  orgHHI: number
  numOrgs: number
  // Concentration metrics
  topCountryShare: number
  top2CountryShare: number
  top3OrgShare: number
}

// Import GDI data calculated by gdi_standalone.py
import gdiResults from "./data/gdi_results.json"

// Type assertion to ensure the imported data matches Network[]
export const networks: Network[] = gdiResults as Network[]
