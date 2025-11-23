// Mock node location data generator for v0
// TODO: Replace with real node data from backend

import type { NetworkGeoJSON } from './types'

interface CityLocation {
  city: string
  country: string
  lat: number
  lon: number
  cloud_providers: string[]
}

// Major cities where blockchain nodes are typically hosted
const MAJOR_CITIES: CityLocation[] = [
  // North America
  { city: 'San Francisco', country: 'USA', lat: 37.7749, lon: -122.4194, cloud_providers: ['AWS', 'Google Cloud', 'Self-hosted'] },
  { city: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, cloud_providers: ['AWS', 'Azure', 'Digital Ocean'] },
  { city: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, cloud_providers: ['AWS', 'Azure'] },
  { city: 'Seattle', country: 'USA', lat: 47.6062, lon: -122.3321, cloud_providers: ['AWS', 'Self-hosted'] },

  // Europe
  { city: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, cloud_providers: ['AWS', 'Hetzner', 'OVH'] },
  { city: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821, cloud_providers: ['AWS', 'Hetzner'] },
  { city: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, cloud_providers: ['AWS', 'Digital Ocean'] },
  { city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, cloud_providers: ['OVH', 'AWS'] },
  { city: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, cloud_providers: ['Hetzner', 'AWS'] },
  { city: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686, cloud_providers: ['Self-hosted', 'AWS'] },

  // Asia
  { city: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, cloud_providers: ['AWS', 'Google Cloud'] },
  { city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, cloud_providers: ['AWS', 'Google Cloud'] },
  { city: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, cloud_providers: ['AWS', 'Self-hosted'] },
  { city: 'Hong Kong', country: 'Hong Kong', lat: 22.3193, lon: 114.1694, cloud_providers: ['AWS', 'Google Cloud'] },
  { city: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, cloud_providers: ['AWS', 'Self-hosted'] },
  { city: 'Bangalore', country: 'India', lat: 12.9716, lon: 77.5946, cloud_providers: ['AWS', 'Self-hosted'] },

  // Australia / Oceania
  { city: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, cloud_providers: ['AWS', 'Google Cloud'] },
  { city: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, cloud_providers: ['AWS'] },

  // South America
  { city: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, cloud_providers: ['AWS', 'Self-hosted'] },
  { city: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, cloud_providers: ['AWS'] },

  // Africa
  { city: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, cloud_providers: ['AWS', 'Self-hosted'] },
]

/**
 * Generate mock node location data for a network
 * Distribution varies by network type to simulate realistic decentralization patterns
 */
export function generateMockNodeData(networkId: string): NetworkGeoJSON {
  let nodeCount: number
  let distribution: 'centralized' | 'moderate' | 'distributed'

  // Different networks have different node counts and distributions
  switch (networkId) {
    case 'bitcoin':
      nodeCount = 150
      distribution = 'distributed'
      break
    case 'ethereum':
      nodeCount = 120
      distribution = 'distributed'
      break
    case 'solana':
      nodeCount = 60
      distribution = 'centralized' // Known for Hetzner concentration
      break
    case 'base':
    case 'optimism':
      nodeCount = 40
      distribution = 'centralized' // L2s typically more centralized
      break
    case 'polygon':
      nodeCount = 70
      distribution = 'moderate'
      break
    case 'cosmos':
      nodeCount = 50
      distribution = 'moderate'
      break
    case 'celo':
      nodeCount = 55
      distribution = 'moderate'
      break
    case 'filecoin':
      nodeCount = 65
      distribution = 'moderate'
      break
    default:
      nodeCount = 50
      distribution = 'moderate'
  }

  const features = []

  // Select cities based on distribution pattern
  let selectedCities: CityLocation[]
  if (distribution === 'centralized') {
    // Concentrate in top 5-8 cities
    selectedCities = MAJOR_CITIES.slice(0, 8)
  } else if (distribution === 'moderate') {
    // Use top 12-15 cities
    selectedCities = MAJOR_CITIES.slice(0, 15)
  } else {
    // Use all cities for distributed networks
    selectedCities = MAJOR_CITIES
  }

  // Generate nodes
  for (let i = 0; i < nodeCount; i++) {
    // Pick a city with weighted probability (earlier cities more likely)
    const cityIndex = Math.floor(Math.pow(Math.random(), 1.5) * selectedCities.length)
    const city = selectedCities[cityIndex]

    // Add small random offset to coordinates (within ~10km)
    const latOffset = (Math.random() - 0.5) * 0.2
    const lonOffset = (Math.random() - 0.5) * 0.2

    // Pick a cloud provider
    const provider = city.cloud_providers[
      Math.floor(Math.random() * city.cloud_providers.length)
    ]

    features.push({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [city.lon + lonOffset, city.lat + latOffset]
      },
      properties: {
        node_id: `${networkId}-node-${i.toString().padStart(4, '0')}`,
        network: networkId,
        city: city.city,
        country: city.country,
        cloud_provider: provider
      }
    })
  }

  return {
    type: "FeatureCollection",
    features
  }
}
