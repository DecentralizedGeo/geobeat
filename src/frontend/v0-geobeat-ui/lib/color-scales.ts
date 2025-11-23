/**
 * Shared color scales for heatmaps and hexbins
 * Single source of truth for the gradient: yellow → orange → red → dark red/brown
 */

/**
 * Color stop definition using rgb() notation
 */
interface ColorStop {
  position: number
  color: string  // rgb() format
}

/**
 * Single source of truth: color stops for the heatmap gradient
 * Traditional heatmap: yellow → orange → red → dark red/brown
 */
const HEATMAP_COLOR_STOPS: ColorStop[] = [
  { position: 0.0, color: 'rgb(255, 255, 100)' },  // Light yellow
  { position: 0.2, color: 'rgb(255, 255, 100)' },  // Light yellow
  { position: 0.4, color: 'rgb(255, 200, 0)' },    // Yellow-orange
  { position: 0.6, color: 'rgb(255, 100, 0)' },    // Orange
  { position: 0.8, color: 'rgb(220, 0, 0)' },      // Bright red
  { position: 1.0, color: 'rgb(100, 0, 0)' },      // Dark red/brown
]

/**
 * Parse rgb() string to components
 */
function parseRgb(rgb: string): { r: number; g: number; b: number } {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)
  if (!match) {
    throw new Error(`Invalid rgb format: ${rgb}`)
  }
  return {
    r: parseInt(match[1]),
    g: parseInt(match[2]),
    b: parseInt(match[3]),
  }
}

/**
 * Interpolate between two rgb colors
 */
function interpolateRgb(rgb1: string, rgb2: string, t: number): string {
  const c1 = parseRgb(rgb1)
  const c2 = parseRgb(rgb2)
  
  const r = Math.floor(c1.r + (c2.r - c1.r) * t)
  const g = Math.floor(c1.g + (c2.g - c1.g) * t)
  const b = Math.floor(c1.b + (c2.b - c1.b) * t)
  
  return `rgb(${r}, ${g}, ${b})`
}

/**
 * Get color for a given position using the shared color stops
 * @param t - Value between 0 and 1
 * @returns RGB color string
 */
export function heatmapColorScale(t: number): string {
  // Clamp t to [0, 1]
  t = Math.max(0, Math.min(1, t))

  // Find the two stops to interpolate between
  for (let i = 0; i < HEATMAP_COLOR_STOPS.length - 1; i++) {
    const stop1 = HEATMAP_COLOR_STOPS[i]
    const stop2 = HEATMAP_COLOR_STOPS[i + 1]

    if (t >= stop1.position && t <= stop2.position) {
      // Interpolate between the two stops
      const localT = (t - stop1.position) / (stop2.position - stop1.position)
      return interpolateRgb(stop1.color, stop2.color, localT)
    }
  }

  // Fallback to last color
  return HEATMAP_COLOR_STOPS[HEATMAP_COLOR_STOPS.length - 1].color
}

/**
 * Mapbox-compatible color stops for heatmap layers
 * Returns array format: [density, color, density, color, ...]
 */
export function getMapboxHeatmapColorStops(): any[] {
  const stops: any[] = []
  
  // Add transparent start
  stops.push(0, 'rgba(255, 255, 100, 0)')
  
  // Convert our color stops to Mapbox format
  HEATMAP_COLOR_STOPS.forEach(stop => {
    if (stop.position > 0) {
      stops.push(stop.position, stop.color)
    }
  })
  
  return stops
}
