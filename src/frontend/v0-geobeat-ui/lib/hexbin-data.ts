// H3 hexbin aggregation for node data
import { latLngToCell, cellToBoundary } from 'h3-js'
import { scaleSequential } from 'd3-scale'
import { interpolateViridis } from 'd3-scale-chromatic'
import { heatmapColorScale } from './color-scales'

export interface NodeData {
  ip: string
  country: string
  country_code: string
  city: string
  region_name: string
  lat: number
  lon: number
  isp: string
  org: string
  asname: string
  hosting: boolean
  proxy: boolean
  mobile: boolean
}

export interface HexbinFeature {
  type: 'Feature'
  properties: {
    hex: string
    count: number
    color: string
  }
  geometry: {
    type: 'Polygon'
    coordinates: number[][][]
  }
}

export interface HexbinGeoJSON {
  type: 'FeatureCollection'
  features: HexbinFeature[]
}

/**
 * Parse CSV data into node objects
 */
export function parseNodeCSV(csvText: string): NodeData[] {
  const lines = csvText.trim().split('\n')
  const headers = lines[0].split(',')

  return lines.slice(1).map(line => {
    const values = line.split(',')
    const node: any = {}

    headers.forEach((header, i) => {
      const value = values[i]

      // Parse specific fields
      if (header === 'lat' || header === 'lon') {
        node[header] = parseFloat(value)
      } else if (header === 'hosting' || header === 'proxy' || header === 'mobile') {
        node[header] = value === 't'
      } else {
        node[header] = value
      }
    })

    return node as NodeData
  }).filter(node => !isNaN(node.lat) && !isNaN(node.lon))
}

/**
 * Aggregate nodes into H3 hexbins
 */
export function aggregateToHexbins(
  nodes: NodeData[],
  resolution: number = 4
): HexbinGeoJSON {
  // Count nodes per hexbin
  const hexCounts = new Map<string, number>()

  nodes.forEach(node => {
    try {
      const hex = latLngToCell(node.lat, node.lon, resolution)
      hexCounts.set(hex, (hexCounts.get(hex) || 0) + 1)
    } catch (err) {
      console.warn(`Invalid coordinates: ${node.lat}, ${node.lon}`)
    }
  })

  // Find max count for color scaling
  const maxCount = Math.max(...Array.from(hexCounts.values()))

  // Use log scale for better distribution
  const logScale = (count: number) => Math.log(count + 1) / Math.log(maxCount + 1)

  // Convert to GeoJSON features
  const features: HexbinFeature[] = Array.from(hexCounts.entries()).map(([hex, count]) => {
    const boundary = cellToBoundary(hex, true) // true = GeoJSON format [lng, lat]

    // Close the polygon by adding first point at the end
    const coordinates = [...boundary, boundary[0]]

    // Color based on log scale using shared color scale
    const color = heatmapColorScale(logScale(count))

    return {
      type: 'Feature',
      properties: {
        hex,
        count,
        color
      },
      geometry: {
        type: 'Polygon',
        coordinates: [coordinates]
      }
    }
  })

  return {
    type: 'FeatureCollection',
    features
  }
}

/**
 * Convert D3 color (rgb string) to hex
 */
export function rgbToHex(rgb: string): string {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  if (!match) return rgb

  const r = parseInt(match[1])
  const g = parseInt(match[2])
  const b = parseInt(match[3])

  return '#' + [r, g, b]
    .map(x => x.toString(16).padStart(2, '0'))
    .join('')
}
