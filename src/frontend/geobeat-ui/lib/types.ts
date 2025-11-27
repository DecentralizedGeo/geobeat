// Geographic data types for node locations and GeoJSON structures

export interface NodeLocation {
  node_id: string
  network: string
  lat: number
  lon: number
  country?: string
  city?: string
  asn?: string
  isp?: string
  cloud_provider?: string
}

export interface GeoJSONFeature {
  type: "Feature"
  geometry: {
    type: "Point"
    coordinates: [number, number] // [lon, lat] - note the order!
  }
  properties: {
    node_id: string
    network: string
    country?: string
    city?: string
    asn?: string
    isp?: string
    cloud_provider?: string
  }
}

export interface NetworkGeoJSON {
  type: "FeatureCollection"
  features: GeoJSONFeature[]
}

// Timeseries data types
export interface TimeSeriesPoint {
  network: string
  timestamp: string // ISO 8601
  date_str: string // YYYY-MM-DD
  morans_i: number // 0-1, spatial autocorrelation
  morans_i_interpretation: string
  spatial_hhi: number // 0-1, Herfindahl index
  spatial_hhi_interpretation: string
  enl: number // Effective number of locations
  ann: number // Average nearest neighbor
  ann_interpretation: string
}

export interface NetworkTimeSeries {
  network: string
  generated_at: string
  num_days: number
  metrics: string[]
  data: TimeSeriesPoint[]
}
