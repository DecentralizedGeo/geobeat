# Mapbox + Recharts Implementation Examples

Complete working examples for integrating Mapbox GL JS with Recharts in the Geobeat dashboard.

## File Structure

```
/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/
├── components/
│   ├── maps/
│   │   ├── network-map.tsx
│   │   ├── map-controls.tsx
│   │   └── use-mapbox.ts
│   ├── charts/
│   │   ├── network-timeline.tsx
│   │   └── metric-chart.tsx
│   └── network-dashboard.tsx
├── lib/
│   ├── mapbox/
│   │   ├── config.ts
│   │   └── geojson.ts
│   └── schemas/
│       └── network-data.ts
└── types/
    └── network.ts
```

## 1. Type Definitions

### `/types/network.ts`

```typescript
export interface NetworkNode {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  network: 'ethereum' | 'bitcoin' | 'solana';
  timestamp: number;
  provider?: string;
  jurisdiction?: string;
  metadata?: {
    version?: string;
    uptime?: number;
    [key: string]: unknown;
  };
}

export interface TimeSeriesMetric {
  timestamp: number;
  gdi: number; // Geographic Decentralization Index
  pdi: number; // Physical Distribution Index
  jdi: number; // Jurisdictional Diversity Index
  ihi: number; // Infrastructure Heterogeneity Index
  nodeCount: number;
  network: string;
}

export interface MapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing?: number;
  pitch?: number;
}

export interface ChartInteraction {
  timestamp: number;
  metric: keyof Omit<TimeSeriesMetric, 'timestamp' | 'network'>;
  value: number;
}

export interface DashboardState {
  selectedNetwork: string;
  timeRange: [number, number];
  selectedNode: NetworkNode | null;
  hoveredTimestamp: number | null;
  mapViewState: MapViewState;
}
```

## 2. Data Schemas (Zod)

### `/lib/schemas/network-data.ts`

```typescript
import { z } from 'zod';

export const NetworkNodeSchema = z.object({
  id: z.string(),
  coordinates: z.tuple([
    z.number().min(-180).max(180), // longitude
    z.number().min(-90).max(90),   // latitude
  ]),
  network: z.enum(['ethereum', 'bitcoin', 'solana']),
  timestamp: z.number().positive(),
  provider: z.string().optional(),
  jurisdiction: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const TimeSeriesMetricSchema = z.object({
  timestamp: z.number().positive(),
  gdi: z.number().min(0).max(100),
  pdi: z.number().min(0).max(100),
  jdi: z.number().min(0).max(100),
  ihi: z.number().min(0).max(100),
  nodeCount: z.number().nonnegative(),
  network: z.string(),
});

export const GeoJSONPointFeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: z.object({
    id: z.string(),
    network: z.string(),
    timestamp: z.number(),
  }).passthrough(), // Allow additional properties
});

export const GeoJSONFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(GeoJSONPointFeatureSchema),
});

// Type inference
export type NetworkNode = z.infer<typeof NetworkNodeSchema>;
export type TimeSeriesMetric = z.infer<typeof TimeSeriesMetricSchema>;
export type GeoJSONPointFeature = z.infer<typeof GeoJSONPointFeatureSchema>;
export type GeoJSONFeatureCollection = z.infer<typeof GeoJSONFeatureCollectionSchema>;

// Validation functions
export function validateNodes(data: unknown): NetworkNode[] {
  return z.array(NetworkNodeSchema).parse(data);
}

export function validateTimeSeries(data: unknown): TimeSeriesMetric[] {
  return z.array(TimeSeriesMetricSchema).parse(data);
}
```

## 3. Mapbox Configuration

### `/lib/mapbox/config.ts`

```typescript
import type mapboxgl from 'mapbox-gl';

export const MAPBOX_STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
} as const;

export const DEFAULT_MAP_CONFIG = {
  center: [0, 20] as [number, number],
  zoom: 2,
  minZoom: 1,
  maxZoom: 18,
  style: MAPBOX_STYLES.dark,
} as const;

export const CLUSTER_CONFIG = {
  clusterMaxZoom: 14,
  clusterRadius: 50,
  clusterMinPoints: 2,
} as const;

export const NETWORK_COLORS = {
  ethereum: 'oklch(0.60 0.18 240)', // Blue
  bitcoin: 'oklch(0.70 0.20 60)',   // Orange
  solana: 'oklch(0.65 0.15 150)',   // Green
  default: 'oklch(0.70 0.15 265)',  // Purple
} as const;

export function getNetworkColor(network: string): string {
  return NETWORK_COLORS[network as keyof typeof NETWORK_COLORS] || NETWORK_COLORS.default;
}

export const LAYER_IDS = {
  clusters: 'clusters',
  clusterCount: 'cluster-count',
  unclusteredPoint: 'unclustered-point',
  heatmap: 'nodes-heatmap',
} as const;

export function getClusterPaint(): mapboxgl.CirclePaint {
  return {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      NETWORK_COLORS.ethereum,
      100,
      NETWORK_COLORS.solana,
      750,
      NETWORK_COLORS.default,
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20,
      100,
      30,
      750,
      40,
    ],
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
  };
}
```

### `/lib/mapbox/geojson.ts`

```typescript
import type { NetworkNode } from '@/types/network';
import type { GeoJSONFeatureCollection } from '@/lib/schemas/network-data';

export function nodesToGeoJSON(nodes: NetworkNode[]): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: nodes.map(node => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: node.coordinates,
      },
      properties: {
        id: node.id,
        network: node.network,
        timestamp: node.timestamp,
        provider: node.provider,
        jurisdiction: node.jurisdiction,
      },
    })),
  };
}

export function filterNodesByTimeRange(
  nodes: NetworkNode[],
  timeRange: [number, number]
): NetworkNode[] {
  const [start, end] = timeRange;
  return nodes.filter(node => node.timestamp >= start && node.timestamp <= end);
}

export function filterNodesByNetwork(
  nodes: NetworkNode[],
  network: string
): NetworkNode[] {
  return nodes.filter(node => node.network === network);
}

export function getBounds(
  nodes: NetworkNode[]
): [[number, number], [number, number]] | null {
  if (nodes.length === 0) return null;

  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  nodes.forEach(node => {
    const [lng, lat] = node.coordinates;
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
```

## 4. Custom Mapbox Hook

### `/components/maps/use-mapbox.ts`

```typescript
import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { DEFAULT_MAP_CONFIG } from '@/lib/mapbox/config';

interface UseMapboxOptions {
  center?: [number, number];
  zoom?: number;
  style?: string;
  onLoad?: (map: mapboxgl.Map) => void;
}

export function useMapbox(options: UseMapboxOptions = {}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setError(new Error('Mapbox access token not found'));
      return;
    }

    mapboxgl.accessToken = token;

    if (mapContainer.current) {
      try {
        map.current = new mapboxgl.Map({
          container: mapContainer.current,
          style: options.style || DEFAULT_MAP_CONFIG.style,
          center: options.center || DEFAULT_MAP_CONFIG.center,
          zoom: options.zoom || DEFAULT_MAP_CONFIG.zoom,
          minZoom: DEFAULT_MAP_CONFIG.minZoom,
          maxZoom: DEFAULT_MAP_CONFIG.maxZoom,
        });

        map.current.on('load', () => {
          setIsLoaded(true);
          if (options.onLoad && map.current) {
            options.onLoad(map.current);
          }
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          setError(new Error(e.error?.message || 'Map error'));
        });

        // Add navigation controls
        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        // Add scale control
        map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize map'));
      }
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Fly to location
  const flyTo = useCallback((
    coordinates: [number, number],
    zoom?: number
  ) => {
    if (!map.current) return;

    map.current.flyTo({
      center: coordinates,
      zoom: zoom || 10,
      duration: 1500,
      essential: true,
    });
  }, []);

  // Fit bounds
  const fitBounds = useCallback((
    bounds: [[number, number], [number, number]],
    padding = 50
  ) => {
    if (!map.current) return;

    map.current.fitBounds(bounds, {
      padding,
      duration: 1000,
    });
  }, []);

  return {
    mapContainer,
    map: map.current,
    isLoaded,
    error,
    flyTo,
    fitBounds,
  };
}
```

## 5. Network Map Component

### `/components/maps/network-map.tsx`

```typescript
'use client';

import { useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapbox } from './use-mapbox';
import { nodesToGeoJSON, getBounds } from '@/lib/mapbox/geojson';
import { getClusterPaint, getNetworkColor, LAYER_IDS } from '@/lib/mapbox/config';
import type { NetworkNode } from '@/types/network';

interface NetworkMapProps {
  nodes: NetworkNode[];
  selectedNode?: NetworkNode | null;
  hoveredNode?: string | null;
  onNodeClick?: (node: NetworkNode) => void;
  onNodeHover?: (nodeId: string | null) => void;
}

export function NetworkMap({
  nodes,
  selectedNode,
  hoveredNode,
  onNodeClick,
  onNodeHover,
}: NetworkMapProps) {
  const { mapContainer, map, isLoaded, error, fitBounds } = useMapbox();

  // Initialize data source and layers
  useEffect(() => {
    if (!map || !isLoaded) return;

    const geojsonData = nodesToGeoJSON(nodes);

    // Add source if it doesn't exist
    if (!map.getSource('nodes')) {
      map.addSource('nodes', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Cluster circles
      map.addLayer({
        id: LAYER_IDS.clusters,
        type: 'circle',
        source: 'nodes',
        filter: ['has', 'point_count'],
        paint: getClusterPaint(),
      });

      // Cluster count labels
      map.addLayer({
        id: LAYER_IDS.clusterCount,
        type: 'symbol',
        source: 'nodes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
        paint: {
          'text-color': '#ffffff',
        },
      });

      // Unclustered points
      map.addLayer({
        id: LAYER_IDS.unclusteredPoint,
        type: 'circle',
        source: 'nodes',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'network'],
            'ethereum', getNetworkColor('ethereum'),
            'bitcoin', getNetworkColor('bitcoin'),
            'solana', getNetworkColor('solana'),
            getNetworkColor('default'),
          ],
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#ffffff',
        },
      });
    } else {
      // Update existing source
      const source = map.getSource('nodes') as mapboxgl.GeoJSONSource;
      source.setData(geojsonData);
    }

    // Fit bounds to show all nodes
    const bounds = getBounds(nodes);
    if (bounds) {
      fitBounds(bounds, 50);
    }
  }, [map, isLoaded, nodes, fitBounds]);

  // Handle click interactions
  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!e.features || !e.features[0]) return;

      const feature = e.features[0];
      const properties = feature.properties;

      if (!properties) return;

      // Handle cluster click - zoom in
      if (properties.cluster) {
        const clusterId = properties.cluster_id;
        const source = map.getSource('nodes') as mapboxgl.GeoJSONSource;

        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;

          map.easeTo({
            center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
            zoom: zoom || map.getZoom() + 2,
          });
        });
      } else {
        // Handle individual node click
        const node: NetworkNode = {
          id: properties.id,
          coordinates: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
          network: properties.network,
          timestamp: properties.timestamp,
          provider: properties.provider,
          jurisdiction: properties.jurisdiction,
        };

        onNodeClick?.(node);

        // Show popup
        new mapboxgl.Popup()
          .setLngLat(node.coordinates)
          .setHTML(`
            <div class="p-2">
              <h3 class="font-semibold">${node.network}</h3>
              <p class="text-sm">Node ID: ${node.id}</p>
              ${node.jurisdiction ? `<p class="text-sm">Jurisdiction: ${node.jurisdiction}</p>` : ''}
            </div>
          `)
          .addTo(map);
      }
    };

    map.on('click', LAYER_IDS.clusters, handleClick);
    map.on('click', LAYER_IDS.unclusteredPoint, handleClick);

    return () => {
      map.off('click', LAYER_IDS.clusters, handleClick);
      map.off('click', LAYER_IDS.unclusteredPoint, handleClick);
    };
  }, [map, isLoaded, onNodeClick]);

  // Handle hover interactions
  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleMouseEnter = (e: mapboxgl.MapLayerMouseEvent) => {
      map.getCanvas().style.cursor = 'pointer';

      if (e.features && e.features[0]?.properties) {
        onNodeHover?.(e.features[0].properties.id);
      }
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
      onNodeHover?.(null);
    };

    map.on('mouseenter', LAYER_IDS.clusters, handleMouseEnter);
    map.on('mouseenter', LAYER_IDS.unclusteredPoint, handleMouseEnter);
    map.on('mouseleave', LAYER_IDS.clusters, handleMouseLeave);
    map.on('mouseleave', LAYER_IDS.unclusteredPoint, handleMouseLeave);

    return () => {
      map.off('mouseenter', LAYER_IDS.clusters, handleMouseEnter);
      map.off('mouseenter', LAYER_IDS.unclusteredPoint, handleMouseEnter);
      map.off('mouseleave', LAYER_IDS.clusters, handleMouseLeave);
      map.off('mouseleave', LAYER_IDS.unclusteredPoint, handleMouseLeave);
    };
  }, [map, isLoaded, onNodeHover]);

  // Highlight selected node
  useEffect(() => {
    if (!map || !isLoaded || !selectedNode) return;

    // Could add a highlight layer or update existing layer's paint property
    // For simplicity, just fly to the selected node
    map.flyTo({
      center: selectedNode.coordinates,
      zoom: 10,
      duration: 1000,
    });
  }, [map, isLoaded, selectedNode]);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg">
        <div className="text-center p-4">
          <p className="text-destructive font-medium">Failed to load map</p>
          <p className="text-sm text-muted-foreground mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainer}
      className="w-full h-[600px] rounded-lg overflow-hidden"
      role="img"
      aria-label={`Interactive map showing distribution of ${nodes.length} network nodes`}
    />
  );
}
```

## 6. Network Timeline Chart

### `/components/charts/network-timeline.tsx`

```typescript
'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from 'recharts';
import type { TimeSeriesMetric } from '@/types/network';

interface NetworkTimelineProps {
  data: TimeSeriesMetric[];
  selectedRange?: [number, number];
  onRangeChange?: (range: [number, number]) => void;
  highlightedTimestamp?: number | null;
  onTimestampSelect?: (timestamp: number) => void;
}

export function NetworkTimeline({
  data,
  selectedRange,
  onRangeChange,
  highlightedTimestamp,
  onTimestampSelect,
}: NetworkTimelineProps) {
  const chartData = useMemo(() => {
    return data.map(d => ({
      ...d,
      date: new Date(d.timestamp).toLocaleDateString(),
    }));
  }, [data]);

  const handleBrushChange = (brushRange: { startIndex?: number; endIndex?: number }) => {
    if (!brushRange || !data.length || !onRangeChange) return;

    const startIdx = brushRange.startIndex || 0;
    const endIdx = brushRange.endIndex || data.length - 1;

    const startTime = data[startIdx].timestamp;
    const endTime = data[endIdx].timestamp;

    onRangeChange([startTime, endTime]);
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium mb-2">{data.date}</p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.70_0.15_265)]" />
            <span className="text-xs">GDI: {data.gdi.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.60_0.18_240)]" />
            <span className="text-xs">PDI: {data.pdi.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.65_0.15_150)]" />
            <span className="text-xs">JDI: {data.jdi.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[oklch(0.63_0.20_290)]" />
            <span className="text-xs">IHI: {data.ihi.toFixed(2)}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">
              Nodes: {data.nodeCount}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="w-full"
      role="img"
      aria-label="Network metrics timeline showing GDI, PDI, JDI, and IHI over time"
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          onClick={(e) => {
            if (e && e.activePayload && onTimestampSelect) {
              onTimestampSelect(e.activePayload[0].payload.timestamp);
            }
          }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="oklch(0.30 0 0)"
            opacity={0.3}
          />
          <XAxis
            dataKey="date"
            stroke="oklch(0.50 0 0)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="oklch(0.50 0 0)"
            tick={{ fontSize: 12 }}
            domain={[0, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="line"
          />

          {highlightedTimestamp && (
            <ReferenceLine
              x={new Date(highlightedTimestamp).toLocaleDateString()}
              stroke="oklch(0.70 0.15 265)"
              strokeDasharray="3 3"
              strokeWidth={2}
            />
          )}

          <Line
            type="monotone"
            dataKey="gdi"
            name="GDI"
            stroke="oklch(0.70 0.15 265)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            animationDuration={300}
          />
          <Line
            type="monotone"
            dataKey="pdi"
            name="PDI"
            stroke="oklch(0.60 0.18 240)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            animationDuration={300}
          />
          <Line
            type="monotone"
            dataKey="jdi"
            name="JDI"
            stroke="oklch(0.65 0.15 150)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            animationDuration={300}
          />
          <Line
            type="monotone"
            dataKey="ihi"
            name="IHI"
            stroke="oklch(0.63 0.20 290)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
            animationDuration={300}
          />

          <Brush
            dataKey="date"
            height={30}
            stroke="oklch(0.70 0.15 265)"
            fill="oklch(0.20 0 0)"
            onChange={handleBrushChange}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## 7. Integrated Dashboard Component

### `/components/network-dashboard.tsx`

```typescript
'use client';

import { useState, useMemo } from 'react';
import { NetworkMap } from '@/components/maps/network-map';
import { NetworkTimeline } from '@/components/charts/network-timeline';
import { filterNodesByTimeRange } from '@/lib/mapbox/geojson';
import type { NetworkNode, TimeSeriesMetric } from '@/types/network';

interface NetworkDashboardProps {
  nodes: NetworkNode[];
  timeSeries: TimeSeriesMetric[];
  networkId: string;
}

export function NetworkDashboard({
  nodes,
  timeSeries,
  networkId,
}: NetworkDashboardProps) {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [highlightedTimestamp, setHighlightedTimestamp] = useState<number | null>(null);

  // Initialize with full time range
  const initialTimeRange: [number, number] = useMemo(() => {
    if (timeSeries.length === 0) return [0, Date.now()];
    return [
      timeSeries[0].timestamp,
      timeSeries[timeSeries.length - 1].timestamp,
    ];
  }, [timeSeries]);

  const [timeRange, setTimeRange] = useState<[number, number]>(initialTimeRange);

  // Filter nodes based on selected time range
  const filteredNodes = useMemo(() => {
    return filterNodesByTimeRange(nodes, timeRange);
  }, [nodes, timeRange]);

  // Get current metrics for display
  const currentMetrics = useMemo(() => {
    const latestData = timeSeries[timeSeries.length - 1];
    return latestData || null;
  }, [timeSeries]);

  return (
    <div className="space-y-6">
      {/* Header with metrics */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{networkId} Network</h1>
          <p className="text-sm text-muted-foreground">
            Showing {filteredNodes.length} nodes from{' '}
            {new Date(timeRange[0]).toLocaleDateString()} to{' '}
            {new Date(timeRange[1]).toLocaleDateString()}
          </p>
        </div>

        {currentMetrics && (
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-[oklch(0.70_0.15_265)]">
                {currentMetrics.gdi.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">GDI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[oklch(0.60_0.18_240)]">
                {currentMetrics.pdi.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">PDI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[oklch(0.65_0.15_150)]">
                {currentMetrics.jdi.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">JDI</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[oklch(0.63_0.20_290)]">
                {currentMetrics.ihi.toFixed(1)}
              </div>
              <div className="text-xs text-muted-foreground">IHI</div>
            </div>
          </div>
        )}
      </div>

      {/* Map and Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Map */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Geographic Distribution</h2>
          <NetworkMap
            nodes={filteredNodes}
            selectedNode={selectedNode}
            hoveredNode={hoveredNode}
            onNodeClick={setSelectedNode}
            onNodeHover={setHoveredNode}
          />
        </div>

        {/* Timeline Chart */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Network Metrics Over Time</h2>
          <NetworkTimeline
            data={timeSeries}
            selectedRange={timeRange}
            onRangeChange={setTimeRange}
            highlightedTimestamp={highlightedTimestamp}
            onTimestampSelect={setHighlightedTimestamp}
          />
        </div>
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="border border-border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Selected Node Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">ID:</span>
              <span className="ml-2 font-mono">{selectedNode.id}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Network:</span>
              <span className="ml-2 capitalize">{selectedNode.network}</span>
            </div>
            {selectedNode.jurisdiction && (
              <div>
                <span className="text-muted-foreground">Jurisdiction:</span>
                <span className="ml-2">{selectedNode.jurisdiction}</span>
              </div>
            )}
            {selectedNode.provider && (
              <div>
                <span className="text-muted-foreground">Provider:</span>
                <span className="ml-2">{selectedNode.provider}</span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Coordinates:</span>
              <span className="ml-2 font-mono">
                {selectedNode.coordinates[1].toFixed(4)}, {selectedNode.coordinates[0].toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Timestamp:</span>
              <span className="ml-2">
                {new Date(selectedNode.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

## 8. Usage in Page

### `/app/dashboard/page.tsx`

```typescript
import { NetworkDashboard } from '@/components/network-dashboard';
import { validateNodes, validateTimeSeries } from '@/lib/schemas/network-data';

async function getNetworkData(networkId: string) {
  // Replace with your actual data source
  const [nodesRes, timeSeriesRes] = await Promise.all([
    fetch(`https://api.example.com/networks/${networkId}/nodes`),
    fetch(`https://api.example.com/networks/${networkId}/metrics`),
  ]);

  if (!nodesRes.ok || !timeSeriesRes.ok) {
    throw new Error('Failed to fetch network data');
  }

  const nodesData = await nodesRes.json();
  const timeSeriesData = await timeSeriesRes.json();

  // Validate with Zod schemas
  const nodes = validateNodes(nodesData);
  const timeSeries = validateTimeSeries(timeSeriesData);

  return { nodes, timeSeries };
}

export default async function DashboardPage({
  params,
}: {
  params: { network: string };
}) {
  const { nodes, timeSeries } = await getNetworkData(params.network);

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <NetworkDashboard
        nodes={nodes}
        timeSeries={timeSeries}
        networkId={params.network}
      />
    </main>
  );
}
```

## 9. Sample Data Generator (for testing)

### `/lib/data/sample-data.ts`

```typescript
import type { NetworkNode, TimeSeriesMetric } from '@/types/network';

export function generateSampleNodes(count: number = 100): NetworkNode[] {
  const networks = ['ethereum', 'bitcoin', 'solana'] as const;
  const providers = ['AWS', 'Google Cloud', 'Azure', 'DigitalOcean', 'Hetzner'];
  const jurisdictions = ['US', 'EU', 'UK', 'SG', 'JP', 'CA', 'AU'];

  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i}`,
    coordinates: [
      Math.random() * 360 - 180, // longitude
      Math.random() * 180 - 90,  // latitude
    ] as [number, number],
    network: networks[Math.floor(Math.random() * networks.length)],
    timestamp: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000, // Last 30 days
    provider: providers[Math.floor(Math.random() * providers.length)],
    jurisdiction: jurisdictions[Math.floor(Math.random() * jurisdictions.length)],
  }));
}

export function generateSampleTimeSeries(days: number = 30): TimeSeriesMetric[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  return Array.from({ length: days }, (_, i) => {
    const baseGDI = 70 + Math.sin(i / 5) * 10;
    return {
      timestamp: now - (days - i) * dayMs,
      gdi: baseGDI + Math.random() * 5,
      pdi: 60 + Math.random() * 20,
      jdi: 55 + Math.random() * 25,
      ihi: 65 + Math.random() * 15,
      nodeCount: 1000 + Math.floor(Math.random() * 500),
      network: 'ethereum',
    };
  });
}
```

This implementation provides:
- Full TypeScript type safety
- Zod validation for runtime safety
- Interactive map with clustering
- Time-series chart with brush selection
- Bidirectional communication between map and chart
- Accessible components with ARIA labels
- Error handling and loading states
- Sample data generators for testing
