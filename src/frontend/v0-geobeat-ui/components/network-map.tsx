"use client"

import { useRef, useEffect, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { NetworkGeoJSON } from '@/lib/types'

interface NetworkMapProps {
  networkId: string
}

export function NetworkMap({ networkId }: NetworkMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current) return // Initialize only once

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      setError('Mapbox token not configured')
      return
    }

    mapboxgl.accessToken = token

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11', // Light theme
        center: [0, 20], // Centered on global view
        zoom: 1.5,
        projection: { name: 'mercator' }
      })

      map.current.on('load', () => {
        setMapLoaded(true)
      })

      map.current.on('error', (e) => {
        console.error('Map error:', e)
        setError('Failed to load map')
      })

    } catch (err) {
      console.error('Map initialization error:', err)
      setError('Failed to initialize map')
    }

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Load and display hexbin data
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const loadHexbinData = async () => {
      try {
        const response = await fetch(`/api/networks/${networkId}/nodes?resolution=4`)
        if (!response.ok) {
          console.warn(`No node data available for ${networkId}`)
          return
        }

        const hexbinData: NetworkGeoJSON = await response.json()

        // Add data source
        if (map.current?.getSource('hexbins')) {
          // Update existing source
          (map.current.getSource('hexbins') as mapboxgl.GeoJSONSource).setData(hexbinData)
        } else {
          // Add new source for hexbins
          map.current?.addSource('hexbins', {
            type: 'geojson',
            data: hexbinData
          })

          // Hexbin fill layer with viridis colors
          map.current?.addLayer({
            id: 'hexbin-fill',
            type: 'fill',
            source: 'hexbins',
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': 0.7
            }
          })

          // Hexbin outline layer
          map.current?.addLayer({
            id: 'hexbin-outline',
            type: 'line',
            source: 'hexbins',
            paint: {
              'line-color': '#ffffff',
              'line-width': 0.5,
              'line-opacity': 0.5
            }
          })

          // Tooltip on hover
          let popup: mapboxgl.Popup | null = null

          map.current?.on('mousemove', 'hexbin-fill', (e) => {
            if (!map.current || !e.features || !e.features[0]) return

            // Change cursor
            map.current.getCanvas().style.cursor = 'pointer'

            const feature = e.features[0]
            const count = feature.properties?.count || 0

            // Remove existing popup
            if (popup) popup.remove()

            // Create new popup
            popup = new mapboxgl.Popup({
              closeButton: false,
              closeOnClick: false,
              offset: 10
            })
              .setLngLat(e.lngLat)
              .setHTML(`
                <div style="padding: 6px 10px; font-size: 13px; font-weight: 500;">
                  ${count} node${count !== 1 ? 's' : ''}
                </div>
              `)
              .addTo(map.current)
          })

          map.current?.on('mouseleave', 'hexbin-fill', () => {
            if (map.current) {
              map.current.getCanvas().style.cursor = ''
            }
            if (popup) {
              popup.remove()
              popup = null
            }
          })
        }

      } catch (err) {
        console.error('Failed to load hexbin data:', err)
      }
    }

    loadHexbinData()
  }, [mapLoaded, networkId])

  if (error) {
    return (
      <div className="w-full aspect-[16/9] bg-muted/20 rounded overflow-hidden relative flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-destructive font-medium mb-2">Map Error</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full aspect-[16/9] bg-muted/20 rounded overflow-hidden relative">
      <div ref={mapContainer} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      )}
    </div>
  )
}
