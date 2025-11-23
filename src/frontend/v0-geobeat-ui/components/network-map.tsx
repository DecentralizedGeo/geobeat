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

  // Load and display hexbin + heatmap data
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const loadVisualizationData = async () => {
      try {
        // Load hexbins (bigger resolution 3 for continental view)
        const hexbinResponse = await fetch(`/api/networks/${networkId}/nodes?resolution=3`)
        if (!hexbinResponse.ok) {
          console.warn(`No node data available for ${networkId}`)
          return
        }

        const hexbinData: NetworkGeoJSON = await hexbinResponse.json()

        // Load point data for heatmap
        const pointsResponse = await fetch(`/api/networks/${networkId}/nodes?format=points`)
        const pointsData: NetworkGeoJSON = await pointsResponse.json()

        // Add data sources
        if (!map.current?.getSource('hexbins')) {
          map.current?.addSource('hexbins', {
            type: 'geojson',
            data: hexbinData
          })
        } else {
          (map.current.getSource('hexbins') as mapboxgl.GeoJSONSource).setData(hexbinData)
        }

        if (!map.current?.getSource('heatmap-points')) {
          map.current?.addSource('heatmap-points', {
            type: 'geojson',
            data: pointsData
          })
        } else {
          (map.current.getSource('heatmap-points') as mapboxgl.GeoJSONSource).setData(pointsData)
        }

        // Add layers if they don't exist
        if (!map.current?.getLayer('heatmap-layer')) {
          // Heatmap layer (visible at LOW zoom - zoomed out/continental)
          map.current?.addLayer({
            id: 'heatmap-layer',
            type: 'heatmap',
            source: 'heatmap-points',
            maxzoom: 15,
            paint: {
              // Higher weight at lower zoom
              'heatmap-weight': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1,
                6, 0.5,
                15, 0
              ],
              // Higher intensity at lower zoom
              'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 1.5,
                3, 1.2,
                6, 0.8
              ],
              // Use viridis-inspired color ramp
              'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(68, 1, 84, 0)',      // Transparent purple
                0.2, 'rgb(68, 1, 84)',         // Dark purple
                0.4, 'rgb(59, 82, 139)',       // Blue
                0.6, 'rgb(33, 145, 140)',      // Teal/cyan
                0.8, 'rgb(94, 201, 98)',       // Green
                1, 'rgb(253, 231, 37)'         // Yellow
              ],
              // Tighter radius for sharper visualization
              'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 4,       // Tight radius when zoomed out
                2, 6,
                4, 8,
                6, 10       // Slightly larger when zoomed in
              ],
              // Visible at LOW zoom, fades out as you zoom IN
              'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.8,     // Visible when zoomed out
                3, 0.7,
                5, 0.4,     // Start fading
                6, 0        // Invisible when zoomed in
              ]
            }
          })

          // Hexbin fill layer (visible at HIGH zoom - zoomed in/regional)
          map.current?.addLayer({
            id: 'hexbin-fill',
            type: 'fill',
            source: 'hexbins',
            paint: {
              'fill-color': ['get', 'color'],
              'fill-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0,       // Invisible when zoomed out
                5, 0.3,     // Start fading in
                6, 0.7,     // Solid when zoomed in
                15, 0.7
              ]
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
              'line-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0,
                5, 0.2,
                6, 0.5,
                15, 0.5
              ]
            }
          })

          // Tooltip on hover (hexbins only)
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
        console.error('Failed to load visualization data:', err)
      }
    }

    loadVisualizationData()
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
