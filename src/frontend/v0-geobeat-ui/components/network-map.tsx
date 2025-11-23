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
        style: 'mapbox://styles/mapbox/dark-v11',
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

  // Load and display node data
  useEffect(() => {
    if (!map.current || !mapLoaded) return

    const loadNodeData = async () => {
      try {
        const response = await fetch(`/api/networks/${networkId}/nodes`)
        if (!response.ok) {
          console.warn(`No node data available for ${networkId}`)
          return
        }

        const nodeData: NetworkGeoJSON = await response.json()

        // Add data source
        if (map.current?.getSource('nodes')) {
          // Update existing source
          (map.current.getSource('nodes') as mapboxgl.GeoJSONSource).setData(nodeData)
        } else {
          // Add new source with clustering
          map.current?.addSource('nodes', {
            type: 'geojson',
            data: nodeData,
            cluster: true,
            clusterMaxZoom: 10,
            clusterRadius: 50
          })

          // Cluster circles
          map.current?.addLayer({
            id: 'clusters',
            type: 'circle',
            source: 'nodes',
            filter: ['has', 'point_count'],
            paint: {
              'circle-color': [
                'step',
                ['get', 'point_count'],
                'oklch(0.6 0.18 240)', // PDI blue for small clusters
                100,
                'oklch(0.65 0.15 150)', // JDI green for medium
                750,
                'oklch(0.63 0.2 290)' // IHI purple for large
              ],
              'circle-radius': [
                'step',
                ['get', 'point_count'],
                20,
                100,
                30,
                750,
                40
              ],
              'circle-opacity': 0.8
            }
          })

          // Cluster count labels
          map.current?.addLayer({
            id: 'cluster-count',
            type: 'symbol',
            source: 'nodes',
            filter: ['has', 'point_count'],
            layout: {
              'text-field': '{point_count_abbreviated}',
              'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
              'text-size': 12
            },
            paint: {
              'text-color': '#ffffff'
            }
          })

          // Individual unclustered points
          map.current?.addLayer({
            id: 'unclustered-point',
            type: 'circle',
            source: 'nodes',
            filter: ['!', ['has', 'point_count']],
            paint: {
              'circle-color': 'oklch(0.6 0.18 240)',
              'circle-radius': 6,
              'circle-stroke-width': 1,
              'circle-stroke-color': '#fff',
              'circle-opacity': 0.9
            }
          })

          // Click handler for clusters - zoom in
          map.current?.on('click', 'clusters', (e) => {
            if (!map.current) return
            const features = map.current.queryRenderedFeatures(e.point, {
              layers: ['clusters']
            })
            const clusterId = features[0].properties?.cluster_id
            const source = map.current.getSource('nodes') as mapboxgl.GeoJSONSource

            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
              if (err || !map.current) return

              map.current.easeTo({
                center: (features[0].geometry as any).coordinates,
                zoom: zoom
              })
            })
          })

          // Click handler for individual points - show popup
          map.current?.on('click', 'unclustered-point', (e) => {
            if (!map.current || !e.features || !e.features[0]) return

            const coordinates = (e.features[0].geometry as any).coordinates.slice()
            const { node_id, city, country, cloud_provider } = e.features[0].properties || {}

            // Ensure popup appears over the point
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
            }

            new mapboxgl.Popup()
              .setLngLat(coordinates)
              .setHTML(`
                <div style="padding: 8px; min-width: 150px;">
                  <h3 style="font-weight: 600; margin-bottom: 4px;">${networkId} Node</h3>
                  <p style="font-size: 12px; margin: 2px 0;">ID: ${node_id}</p>
                  ${city ? `<p style="font-size: 12px; margin: 2px 0;">${city}, ${country}</p>` : ''}
                  ${cloud_provider ? `<p style="font-size: 12px; margin: 2px 0;">Provider: ${cloud_provider}</p>` : ''}
                </div>
              `)
              .addTo(map.current)
          })

          // Change cursor on hover
          map.current?.on('mouseenter', 'clusters', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer'
          })
          map.current?.on('mouseleave', 'clusters', () => {
            if (map.current) map.current.getCanvas().style.cursor = ''
          })
          map.current?.on('mouseenter', 'unclustered-point', () => {
            if (map.current) map.current.getCanvas().style.cursor = 'pointer'
          })
          map.current?.on('mouseleave', 'unclustered-point', () => {
            if (map.current) map.current.getCanvas().style.cursor = ''
          })
        }

      } catch (err) {
        console.error('Failed to load node data:', err)
      }
    }

    loadNodeData()
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
