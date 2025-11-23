# Mapbox GL JS & Recharts Integration Guide for Geobeat Dashboard

## Project Context

**Current Stack:**
- Next.js 16.0.3 (App Router)
- React 19.2.0
- TypeScript 5.x
- Recharts 2.15.4 (already installed)
- Tailwind CSS 4.1.9
- Zod 3.25.76 (for validation)
- Current charting: Custom SVG triangle chart + Recharts

**Required Integration:**
- Add Mapbox GL JS for interactive geographic visualization
- Connect map interactions with existing Recharts line graphs
- Display blockchain node distribution data on maps

---

## 1. Mapbox GL JS Documentation

### 1.1 Official Setup and Configuration

#### Installation

```bash
npm install mapbox-gl
npm install --save-dev @types/mapbox-gl
```

#### Package Versions
- **Recommended:** `mapbox-gl@^3.0.0` (latest v3 is backwards-compatible)
- **TypeScript types:** `@types/mapbox-gl@^3.0.0`

#### Official Resources
- **Getting Started:** https://docs.mapbox.com/mapbox-gl-js/guides/install/
- **API Reference:** https://docs.mapbox.com/mapbox-gl-js/api/
- **React Integration Tutorial:** https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
- **v3 Migration Guide:** https://docs.mapbox.com/mapbox-gl-js/guides/migrate-to-v3/

### 1.2 Environment Variable Best Practices

#### Setup in Next.js

Create `/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/.env.local`:

```env
# Mapbox Access Token (requires NEXT_PUBLIC_ prefix for client-side access)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
```

**Critical Notes:**
- **MUST use `NEXT_PUBLIC_` prefix** - without it, the browser won't receive the token
- Add `.env.local` to `.gitignore` to avoid exposing tokens in version control
- Get your token from: https://account.mapbox.com/access-tokens/

#### TypeScript Environment Variable Typing

Create `/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/env.d.ts`:

```typescript
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};
```

#### Validation with Zod (Recommended)

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().min(1, 'Mapbox token is required'),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
});
```

**Resources:**
- [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables)
- [Next.js with Mapbox Best Practices](https://dev.to/dqunbp/using-mapbox-gl-in-react-with-next-js-2glg)
- [Environment Variable Configuration](https://www.dhiwise.com/post/configuring-nextjs-env-local-environment-variables-in-nextjs)

### 1.3 React Integration Patterns

#### Option A: Direct mapbox-gl Integration (Recommended for Custom Control)

**Component Pattern with useRef and useEffect:**

```typescript
'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface MapboxMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  onMapLoad?: (map: mapboxgl.Map) => void;
}

export function MapboxMap({
  initialCenter = [-74.5, 40],
  initialZoom = 9,
  onMapLoad
}: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Prevent re-initialization
    if (map.current) return;

    // Set access token
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    // Initialize map
    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11', // Matches your dark theme
        center: initialCenter,
        zoom: initialZoom,
      });

      map.current.on('load', () => {
        setMapLoaded(true);
        if (onMapLoad && map.current) {
          onMapLoad(map.current);
        }
      });
    }

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Empty dependency array is critical!

  return (
    <div
      ref={mapContainer}
      className="w-full h-full min-h-[400px] rounded-lg overflow-hidden"
    />
  );
}
```

**Key Points:**
- Use `useRef` to store map instance (prevents re-renders)
- Empty dependency array in `useEffect` prevents infinite loops
- Check `if (!map.current)` before initialization
- Always cleanup with `map.remove()` in return function
- Import CSS: `import 'mapbox-gl/dist/mapbox-gl.css'`

**Resources:**
- [Build React MapboxGL Component with Hooks](https://sparkgeo.com/blog/build-a-react-mapboxgl-component-with-hooks/)
- [Mapbox GL in React with Hooks](https://dev.to/ahmedrafiullahk/how-to-integrate-mapbox-gl-in-react-using-hooks-3a44)
- [React Mapbox Integration](https://medium.com/@kyrcha/mapbox-with-react-hooks-365cc569ea0a)

#### Option B: react-map-gl (Declarative React Wrapper)

```bash
npm install react-map-gl
```

```typescript
'use client';

import Map from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function MapboxMap() {
  return (
    <Map
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      initialViewState={{
        longitude: -74.5,
        latitude: 40,
        zoom: 9
      }}
      style={{ width: '100%', height: 400 }}
      mapStyle="mapbox://styles/mapbox/dark-v11"
    />
  );
}
```

**When to use react-map-gl:**
- Need React-style state management
- Want declarative component synchronization
- Prefer React props over imperative APIs

**When to use direct mapbox-gl:**
- Need direct access to all Mapbox GL JS features
- Custom advanced functionality
- Better TypeScript support

**Resources:**
- [react-map-gl Documentation](https://visgl.github.io/react-map-gl/)
- [React Map Library Comparison](https://www.somethingsblog.com/2024/10/18/react-map-library-showdown-top-options-compared/)

### 1.4 Markers and Layers API

#### Adding GeoJSON Data Points

```typescript
// After map loads
map.current.on('load', () => {
  // Add source
  map.current!.addSource('nodes', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-74.5, 40]
          },
          properties: {
            title: 'Ethereum Node',
            description: 'Node #1234',
            network: 'ethereum'
          }
        }
      ]
    }
  });

  // Add layer
  map.current!.addLayer({
    id: 'nodes-layer',
    type: 'circle',
    source: 'nodes',
    paint: {
      'circle-radius': 6,
      'circle-color': '#007cbf',
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff'
    }
  });
});
```

#### Symbol Layer for Custom Markers

```typescript
// First, load custom image
map.current!.loadImage('/marker-icon.png', (error, image) => {
  if (error) throw error;
  if (image) {
    map.current!.addImage('custom-marker', image);
  }
});

// Add symbol layer
map.current!.addLayer({
  id: 'nodes-symbols',
  type: 'symbol',
  source: 'nodes',
  layout: {
    'icon-image': 'custom-marker',
    'icon-size': 1,
    'icon-allow-overlap': true
  }
});
```

**Resources:**
- [Add Markers with Symbol Layer](https://docs.mapbox.com/mapbox-gl-js/example/geojson-markers/)
- [Working with Large GeoJSON Sources](https://docs.mapbox.com/help/troubleshooting/working-with-large-geojson-data/)

### 1.5 Clustering and Aggregation

#### Built-in Cluster Support

```typescript
map.current!.addSource('nodes', {
  type: 'geojson',
  data: geojsonData,
  cluster: true,
  clusterMaxZoom: 14, // Max zoom to cluster points
  clusterRadius: 50 // Radius of each cluster when clustering
});

// Cluster circles
map.current!.addLayer({
  id: 'clusters',
  type: 'circle',
  source: 'nodes',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': [
      'step',
      ['get', 'point_count'],
      '#51bbd6', 100,
      '#f1f075', 750,
      '#f28cb1'
    ],
    'circle-radius': [
      'step',
      ['get', 'point_count'],
      20, 100,
      30, 750,
      40
    ]
  }
});

// Cluster count labels
map.current!.addLayer({
  id: 'cluster-count',
  type: 'symbol',
  source: 'nodes',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  }
});

// Unclustered points
map.current!.addLayer({
  id: 'unclustered-point',
  type: 'circle',
  source: 'nodes',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#11b4da',
    'circle-radius': 4,
    'circle-stroke-width': 1,
    'circle-stroke-color': '#fff'
  }
});
```

#### Supercluster for Advanced Clustering

```bash
npm install supercluster
```

```typescript
import Supercluster from 'supercluster';

const index = new Supercluster({
  radius: 40,
  maxZoom: 16
});

index.load(points); // Load GeoJSON points

// Get clusters for current map bounds
const clusters = index.getClusters([-180, -85, 180, 85], zoom);
```

#### Hexbin Aggregation

For spatial aggregation into hexagonal bins, use Turf.js:

```bash
npm install @turf/turf
```

```typescript
import * as turf from '@turf/turf';

// Create hexagonal grid
const bbox = [-180, -85, 180, 85];
const cellSide = 50;
const options = { units: 'kilometers' as const };
const hexgrid = turf.hexGrid(bbox, cellSide, options);

// Aggregate points into hexbins
hexgrid.features.forEach(hex => {
  const pointsWithin = turf.pointsWithinPolygon(points, hex);
  hex.properties.count = pointsWithin.features.length;
});
```

**Resources:**
- [Create and Style Clusters](https://docs.mapbox.com/mapbox-gl-js/example/cluster/)
- [Display HTML Clusters](https://docs.mapbox.com/mapbox-gl-js/example/cluster-html/)
- [Supercluster GitHub](https://github.com/mapbox/supercluster)
- [Clustering Millions of Points](https://blog.mapbox.com/clustering-millions-of-points-on-a-map-with-supercluster-272046ec5c97)
- [Hexbin Map Tutorial](https://observablehq.com/@clhenrick/mapboxgl-hexbin-map)

#### Heatmap Layer

```typescript
map.current!.addLayer({
  id: 'nodes-heat',
  type: 'heatmap',
  source: 'nodes',
  maxzoom: 15,
  paint: {
    'heatmap-weight': [
      'interpolate',
      ['linear'],
      ['get', 'value'],
      0, 0,
      6, 1
    ],
    'heatmap-intensity': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 1,
      15, 3
    ],
    'heatmap-color': [
      'interpolate',
      ['linear'],
      ['heatmap-density'],
      0, 'rgba(33,102,172,0)',
      0.2, 'rgb(103,169,207)',
      0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)',
      0.8, 'rgb(239,138,98)',
      1, 'rgb(178,24,43)'
    ],
    'heatmap-radius': [
      'interpolate',
      ['linear'],
      ['zoom'],
      0, 2,
      15, 20
    ]
  }
});
```

**Resources:**
- [Make a Heatmap with Mapbox GL JS](https://docs.mapbox.com/help/tutorials/make-a-heatmap-with-mapbox-gl-js/)
- [Heatmap Tutorial](https://medium.com/@mzdraper/mapbox-tutorial-heatmap-using-gl-js-bc2e5199d630)

---

## 2. React/Next.js Patterns

### 2.1 Component Structure for Map Integration

#### Recommended Directory Structure

```
/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/
├── components/
│   ├── maps/
│   │   ├── mapbox-map.tsx          # Main map component
│   │   ├── map-controls.tsx        # Zoom, navigation controls
│   │   ├── map-legend.tsx          # Legend component
│   │   └── use-mapbox.ts           # Custom hook
│   ├── charts/
│   │   └── network-timeline.tsx    # Recharts component
│   └── network-map.tsx             # Replace existing placeholder
├── lib/
│   ├── mapbox/
│   │   ├── config.ts               # Map configuration
│   │   ├── styles.ts               # Custom map styles
│   │   └── utils.ts                # Helper functions
│   └── data/
│       └── geojson.ts              # GeoJSON transformation
└── types/
    └── mapbox.ts                   # TypeScript types
```

#### Custom Hook Pattern

`/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/components/maps/use-mapbox.ts`:

```typescript
import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';

interface UseMapboxOptions {
  center?: [number, number];
  zoom?: number;
  style?: string;
}

export function useMapbox(options: UseMapboxOptions = {}) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: options.style || 'mapbox://styles/mapbox/dark-v11',
        center: options.center || [0, 0],
        zoom: options.zoom || 2,
      });

      map.current.on('load', () => setIsLoaded(true));
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return {
    mapContainer,
    map: map.current,
    isLoaded,
  };
}
```

### 2.2 Data Fetching and State Management

#### Server Component for Data Fetching (Recommended)

```typescript
// app/dashboard/page.tsx (Server Component)
import { NetworkMap } from '@/components/network-map';

async function getNetworkData() {
  // Fetch from your data source
  const res = await fetch('https://api.example.com/nodes', {
    next: { revalidate: 3600 } // Revalidate every hour
  });

  if (!res.ok) throw new Error('Failed to fetch network data');

  return res.json();
}

export default async function DashboardPage() {
  const data = await getNetworkData();

  return (
    <div>
      <NetworkMap data={data} />
    </div>
  );
}
```

#### Client Component with State

```typescript
'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';

// Define data schema with Zod
const NodeSchema = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  network: z.string(),
  timestamp: z.number(),
});

type Node = z.infer<typeof NodeSchema>;

export function NetworkMap({ initialData }: { initialData: Node[] }) {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, Date.now()]);

  const filteredNodes = initialData.filter(node =>
    node.timestamp >= timeRange[0] &&
    node.timestamp <= timeRange[1]
  );

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        {/* Map component */}
        <MapboxMap
          nodes={filteredNodes}
          onNodeClick={setSelectedNode}
        />
      </div>
      <div>
        {/* Chart component */}
        <NetworkTimeline
          data={filteredNodes}
          highlightedNode={selectedNode}
        />
      </div>
    </div>
  );
}
```

### 2.3 TypeScript Integration

#### Type Definitions

`/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/types/mapbox.ts`:

```typescript
import type { Map, LngLatLike, MapboxGeoJSONFeature } from 'mapbox-gl';

export interface NetworkNode {
  id: string;
  coordinates: [number, number]; // [longitude, latitude]
  network: 'ethereum' | 'bitcoin' | 'solana';
  timestamp: number;
  provider?: string;
  jurisdiction?: string;
}

export interface MapConfig {
  center: LngLatLike;
  zoom: number;
  style: string;
  minZoom?: number;
  maxZoom?: number;
}

export interface ClusterProperties {
  cluster: boolean;
  cluster_id: number;
  point_count: number;
  point_count_abbreviated: string;
}

export interface MapInteraction {
  type: 'click' | 'hover';
  feature: MapboxGeoJSONFeature;
  coordinates: [number, number];
}
```

**Resources:**
- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [TypeScript with Next.js](https://nextjs.org/docs/app/building-your-application/configuring/typescript)

---

## 3. Recharts Integration (Current Library)

### 3.1 Current Usage

Your project already uses Recharts 2.15.4. Current implementation includes a custom triangle chart. You'll integrate Recharts for time-series visualization.

### 3.2 Data Binding Patterns

#### Type-Safe Data Binding

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface TimeSeriesData {
  timestamp: number;
  nodeCount: number;
  gdi: number;
  pdi: number;
  jdi: number;
  ihi: number;
}

interface NetworkTimelineProps {
  data: TimeSeriesData[];
  highlightedTimestamp?: number;
}

export function NetworkTimeline({ data, highlightedTimestamp }: NetworkTimelineProps) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.30 0 0)" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(ts) => new Date(ts).toLocaleDateString()}
          stroke="oklch(0.50 0 0)"
        />
        <YAxis stroke="oklch(0.50 0 0)" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'oklch(0.20 0 0)',
            border: '1px solid oklch(0.30 0 0)',
            borderRadius: '8px'
          }}
        />
        <Line
          type="monotone"
          dataKey="gdi"
          stroke="oklch(0.70 0.15 265)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="pdi"
          stroke="oklch(0.60 0.18 240)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="jdi"
          stroke="oklch(0.65 0.15 150)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

### 3.3 Responsive Design

Recharts provides `ResponsiveContainer` which automatically resizes:

```typescript
<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data}>
    {/* ... */}
  </LineChart>
</ResponsiveContainer>
```

**Best Practices:**
- Always wrap charts in `ResponsiveContainer`
- Set explicit height (percentage or pixels)
- Use `width="100%"` for fluid layouts
- Consider `aspect` prop: `<ResponsiveContainer aspect={16/9}>`

### 3.4 Animation and Interaction

#### Animation Configuration

```typescript
<Line
  type="monotone"
  dataKey="nodeCount"
  stroke="#8884d8"
  animationDuration={300} // Animation duration in ms
  animationEasing="ease-in-out"
/>
```

#### Click and Hover Events

```typescript
<Line
  dataKey="gdi"
  onClick={(data) => {
    console.log('Clicked:', data);
    // Handle click - e.g., update map to show nodes from this time period
  }}
  onMouseEnter={(data) => {
    console.log('Hover:', data);
    // Handle hover
  }}
/>

<LineChart
  onClick={(e) => {
    if (e && e.activePayload) {
      const timestamp = e.activePayload[0].payload.timestamp;
      // Update map to this timestamp
    }
  }}
>
  {/* ... */}
</LineChart>
```

#### Custom Tooltip

```typescript
interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: string;
    payload: TimeSeriesData;
  }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
      <p className="text-sm font-medium">
        {new Date(data.timestamp).toLocaleDateString()}
      </p>
      <div className="mt-2 space-y-1">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs">
              {entry.dataKey}: {entry.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Usage
<LineChart data={data}>
  <Tooltip content={<CustomTooltip />} />
  {/* ... */}
</LineChart>
```

#### Brush for Range Selection

```typescript
import { Brush } from 'recharts';

<LineChart data={data}>
  {/* ... other components */}
  <Brush
    dataKey="timestamp"
    height={30}
    stroke="oklch(0.70 0.15 265)"
    onChange={(range) => {
      // Update map based on time range
      console.log('Selected range:', range);
    }}
  />
</LineChart>
```

**Resources:**
- [Recharts Documentation](https://recharts.github.io/en-US/)
- [Creating Charts in React with TypeScript](https://medium.com/@asyncme/a-guide-to-creating-charts-in-react-with-typescript-8ac9fd17fa74)
- [Recharts ResponsiveContainer Guide](https://www.dhiwise.com/post/simplify-data-visualization-with-recharts-responsivecontainer)
- [Custom Style Recharts](https://www.paigeniedringhaus.com/blog/build-and-custom-style-recharts-data-charts/)

---

## 4. Connecting Map and Chart Interactions

### 4.1 Shared State Pattern

```typescript
'use client';

import { useState } from 'react';
import { MapboxMap } from '@/components/maps/mapbox-map';
import { NetworkTimeline } from '@/components/charts/network-timeline';

interface NetworkDashboardProps {
  nodes: NetworkNode[];
  timeSeries: TimeSeriesData[];
}

export function NetworkDashboard({ nodes, timeSeries }: NetworkDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState<[number, number]>([
    timeSeries[0]?.timestamp || 0,
    timeSeries[timeSeries.length - 1]?.timestamp || Date.now()
  ]);

  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Filter nodes based on time range
  const filteredNodes = nodes.filter(node =>
    node.timestamp >= selectedTimeRange[0] &&
    node.timestamp <= selectedTimeRange[1]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Map */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Geographic Distribution</h2>
        <MapboxMap
          nodes={filteredNodes}
          selectedNode={selectedNode}
          hoveredNode={hoveredNode}
          onNodeClick={(node) => {
            setSelectedNode(node);
            // Could also update chart to highlight this node's timeline
          }}
          onNodeHover={setHoveredNode}
        />
      </div>

      {/* Chart */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Network Metrics Over Time</h2>
        <NetworkTimeline
          data={timeSeries}
          selectedRange={selectedTimeRange}
          onRangeChange={setSelectedTimeRange}
          highlightedNode={selectedNode}
        />
      </div>
    </div>
  );
}
```

### 4.2 Map to Chart Communication

```typescript
// In MapboxMap component
useEffect(() => {
  if (!map.current || !isLoaded) return;

  // Click handler
  map.current.on('click', 'nodes-layer', (e) => {
    if (!e.features || !e.features[0]) return;

    const feature = e.features[0];
    const node = feature.properties as NetworkNode;

    // Trigger callback to update chart
    onNodeClick?.(node);

    // Could also fly to this location
    map.current!.flyTo({
      center: [node.coordinates[0], node.coordinates[1]],
      zoom: 10,
      duration: 1000
    });
  });

  // Hover handler for highlighting
  map.current.on('mouseenter', 'nodes-layer', (e) => {
    if (e.features && e.features[0]) {
      map.current!.getCanvas().style.cursor = 'pointer';
      onNodeHover?.(e.features[0].properties.id);
    }
  });

  map.current.on('mouseleave', 'nodes-layer', () => {
    map.current!.getCanvas().style.cursor = '';
    onNodeHover?.(null);
  });
}, [isLoaded]);
```

### 4.3 Chart to Map Communication

```typescript
// In NetworkTimeline component
<Brush
  onChange={(brushRange) => {
    if (!brushRange || !data.length) return;

    const startIdx = brushRange.startIndex || 0;
    const endIdx = brushRange.endIndex || data.length - 1;

    const startTime = data[startIdx].timestamp;
    const endTime = data[endIdx].timestamp;

    onRangeChange?.([startTime, endTime]);
  }}
/>

<Line
  onClick={(clickData) => {
    // When user clicks a point on the chart,
    // could trigger map to show nodes from that time
    const timestamp = clickData.payload.timestamp;
    onTimestampSelect?.(timestamp);
  }}
/>
```

---

## 5. Testing & Validation

### 5.1 Visual Regression Testing with Playwright

Your project doesn't currently have Playwright installed. To add it:

```bash
npm install --save-dev @playwright/test
npx playwright install
```

#### Configuration

Create `/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Visual Regression Test Example

```typescript
// tests/map-visualization.spec.ts
import { test, expect } from '@playwright/test';

test('map renders correctly with nodes', async ({ page }) => {
  await page.goto('/dashboard');

  // Wait for map to load
  await page.waitForSelector('.mapboxgl-canvas');

  // Take screenshot and compare
  await expect(page).toHaveScreenshot('map-with-nodes.png', {
    maxDiffPixels: 100, // Allow small differences
  });
});

test('chart renders correctly', async ({ page }) => {
  await page.goto('/dashboard');

  // Wait for chart
  await page.waitForSelector('.recharts-wrapper');

  // Take screenshot
  await expect(page.locator('.recharts-wrapper')).toHaveScreenshot('timeline-chart.png');
});

test('map-chart interaction works', async ({ page }) => {
  await page.goto('/dashboard');

  // Click on a data point in chart
  await page.click('.recharts-line-dot');

  // Verify map updated (check if map center changed)
  const mapCanvas = page.locator('.mapboxgl-canvas');
  await expect(mapCanvas).toBeVisible();

  // Take screenshot of interaction result
  await expect(page).toHaveScreenshot('map-chart-interaction.png');
});
```

**Resources:**
- [Automated Visual Regression Testing With Playwright](https://css-tricks.com/automated-visual-regression-testing-with-playwright/)
- [Playwright Visual Testing](https://dev.to/hashcode01/visual-regression-testing-with-playwright-2137)
- [Playwright Component Testing](https://playwright.dev/docs/test-components)

### 5.2 Data Validation with Zod

You already have Zod 3.25.76 installed. Use it for runtime validation:

```typescript
import { z } from 'zod';

// GeoJSON Feature Schema
export const GeoJSONPointSchema = z.object({
  type: z.literal('Feature'),
  geometry: z.object({
    type: z.literal('Point'),
    coordinates: z.tuple([
      z.number().min(-180).max(180), // longitude
      z.number().min(-90).max(90),   // latitude
    ]),
  }),
  properties: z.object({
    id: z.string(),
    network: z.enum(['ethereum', 'bitcoin', 'solana']),
    timestamp: z.number().positive(),
    nodeCount: z.number().nonnegative().optional(),
  }),
});

export const GeoJSONFeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(GeoJSONPointSchema),
});

// Validate API response
export function validateNetworkData(data: unknown) {
  try {
    return GeoJSONFeatureCollectionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Data validation failed:', error.errors);
    }
    throw new Error('Invalid network data format');
  }
}

// Time series data schema
export const TimeSeriesDataSchema = z.object({
  timestamp: z.number().positive(),
  gdi: z.number().min(0).max(100),
  pdi: z.number().min(0).max(100),
  jdi: z.number().min(0).max(100),
  ihi: z.number().min(0).max(100),
  nodeCount: z.number().nonnegative(),
});

export type TimeSeriesData = z.infer<typeof TimeSeriesDataSchema>;
```

**Resources:**
- [Zod Documentation](https://zod.dev/)
- [Schema Validation with Zod](https://blog.logrocket.com/schema-validation-typescript-zod/)
- [Zod TypeScript Guide](https://www.telerik.com/blogs/zod-typescript-schema-validation-made-easy)

### 5.3 Accessibility for Data Visualizations

#### Map Accessibility

```typescript
export function MapboxMap({ nodes }: MapboxMapProps) {
  const { mapContainer, map, isLoaded } = useMapbox();

  return (
    <div
      ref={mapContainer}
      className="w-full h-[600px] rounded-lg"
      role="img"
      aria-label={`Interactive map showing distribution of ${nodes.length} network nodes`}
      tabIndex={0}
    >
      {/* Fallback content for screen readers */}
      <div className="sr-only">
        <h3>Node Distribution Summary</h3>
        <ul>
          {nodes.slice(0, 10).map(node => (
            <li key={node.id}>
              {node.network} node at coordinates
              {node.coordinates[1]}, {node.coordinates[0]}
            </li>
          ))}
          {nodes.length > 10 && (
            <li>...and {nodes.length - 10} more nodes</li>
          )}
        </ul>
      </div>
    </div>
  );
}
```

#### Chart Accessibility

```typescript
export function NetworkTimeline({ data }: NetworkTimelineProps) {
  return (
    <div role="img" aria-label="Network metrics timeline chart showing GDI, PDI, JDI, and IHI over time">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          accessibilityLayer // Recharts built-in accessibility
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line dataKey="gdi" stroke="#8884d8" name="Geographic Decentralization Index" />
          <Line dataKey="pdi" stroke="#82ca9d" name="Physical Distribution Index" />
          <Line dataKey="jdi" stroke="#ffc658" name="Jurisdictional Diversity Index" />
          <Line dataKey="ihi" stroke="#ff7c7c" name="Infrastructure Heterogeneity Index" />
        </LineChart>
      </ResponsiveContainer>

      {/* Screen reader accessible data table */}
      <table className="sr-only">
        <caption>Network Metrics Over Time</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>GDI</th>
            <th>PDI</th>
            <th>JDI</th>
            <th>IHI</th>
          </tr>
        </thead>
        <tbody>
          {data.map((point, idx) => (
            <tr key={idx}>
              <td>{new Date(point.timestamp).toLocaleDateString()}</td>
              <td>{point.gdi}</td>
              <td>{point.pdi}</td>
              <td>{point.jdi}</td>
              <td>{point.ihi}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### WCAG 2.1 Checklist

- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Color contrast ratio ≥ 3:1 for data visualization elements
- [ ] Don't rely on color alone to convey information
- [ ] Provide text alternatives for visual content
- [ ] Keyboard navigation support
- [ ] Focus indicators for interactive elements
- [ ] ARIA labels for complex widgets
- [ ] Screen reader accessible data tables as fallback

**Resources:**
- [Chart.js Accessibility](https://www.chartjs.org/docs/latest/general/accessibility.html)
- [Making Charts Accessible](https://www.stuartashworth.com/blog/making-a-chartjs-chart-accessible/)
- [Accessible Data Viz with D3](https://fossheim.io/writing/posts/accessible-dataviz-d3-intro/)

---

## 6. Implementation Roadmap

### Phase 1: Basic Setup (Week 1)
1. Install Mapbox GL JS and types
2. Set up environment variables
3. Create basic map component with useRef/useEffect pattern
4. Test map rendering in development

### Phase 2: Data Integration (Week 2)
1. Create GeoJSON transformation utilities
2. Add data validation with Zod schemas
3. Implement basic marker/point rendering
4. Add clustering for dense areas

### Phase 3: Chart Integration (Week 3)
1. Create Recharts timeline component
2. Implement shared state between map and chart
3. Add click/hover interactions
4. Implement time range filtering

### Phase 4: Polish & Testing (Week 4)
1. Add Playwright visual regression tests
2. Implement accessibility features
3. Optimize performance (clustering, lazy loading)
4. Add loading states and error handling

---

## 7. Quick Start Example

Replace your current `/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/components/network-map.tsx`:

```typescript
'use client';

import { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface NetworkMapProps {
  networkId: string;
  nodes?: Array<{
    id: string;
    coordinates: [number, number];
    network: string;
  }>;
}

export function NetworkMap({ networkId, nodes = [] }: NetworkMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (map.current) return;

    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
      console.error('Mapbox token not found');
      return;
    }

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 2,
      });

      map.current.on('load', () => {
        setIsLoaded(true);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isLoaded || !nodes.length) return;

    // Add GeoJSON source
    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: nodes.map(node => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: node.coordinates,
        },
        properties: {
          id: node.id,
          network: node.network,
        },
      })),
    };

    if (!map.current.getSource('nodes')) {
      map.current.addSource('nodes', {
        type: 'geojson',
        data: geojsonData,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      });

      // Add cluster layer
      map.current.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'nodes',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            'oklch(0.60 0.18 240)',
            100,
            'oklch(0.65 0.15 150)',
            750,
            'oklch(0.70 0.15 265)'
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
        },
      });

      // Add cluster count
      map.current.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'nodes',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
          'text-size': 12,
        },
      });

      // Add unclustered points
      map.current.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'nodes',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': 'oklch(0.70 0.15 265)',
          'circle-radius': 6,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });
    } else {
      const source = map.current.getSource('nodes') as mapboxgl.GeoJSONSource;
      source.setData(geojsonData);
    }
  }, [isLoaded, nodes]);

  return (
    <div
      ref={mapContainer}
      className="w-full aspect-[16/9] bg-muted/20 rounded overflow-hidden"
      role="img"
      aria-label={`Map showing geographic distribution of ${networkId} nodes`}
    />
  );
}
```

---

## Sources

### Mapbox GL JS
- [Getting Started Guide](https://docs.mapbox.com/mapbox-gl-js/guides/install/)
- [React Integration Tutorial](https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/)
- [Migration Guide for v3](https://docs.mapbox.com/mapbox-gl-js/guides/migrate-to-v3/)
- [API Reference](https://docs.mapbox.com/mapbox-gl-js/api/)
- [Using Mapbox GL in React with Next.js](https://dev.to/dqunbp/using-mapbox-gl-in-react-with-next-js-2glg)
- [How to use Mapbox in Next.js](https://dev.to/sakshamgurung/how-to-use-mapbox-in-nextjs-j7k)
- [Build React MapboxGL Component with Hooks](https://sparkgeo.com/blog/build-a-react-mapboxgl-component-with-hooks/)

### Clustering and Aggregation
- [Create and Style Clusters](https://docs.mapbox.com/mapbox-gl-js/example/cluster/)
- [Display HTML Clusters](https://docs.mapbox.com/mapbox-gl-js/example/cluster-html/)
- [Supercluster GitHub](https://github.com/mapbox/supercluster)
- [Clustering Millions of Points](https://blog.mapbox.com/clustering-millions-of-points-on-a-map-with-supercluster-272046ec5c97)
- [Hexbin Map Tutorial](https://observablehq.com/@clhenrick/mapboxgl-hexbin-map)
- [Make a Heatmap with Mapbox GL JS](https://docs.mapbox.com/help/tutorials/make-a-heatmap-with-mapbox-gl-js/)

### Next.js and Environment Variables
- [Next.js Environment Variables Guide](https://nextjs.org/docs/pages/guides/environment-variables)
- [Configuring Next.js Env Local](https://www.dhiwise.com/post/configuring-nextjs-env-local-environment-variables-in-nextjs)
- [Next.js Environment Variables](https://refine.dev/blog/next-js-environment-variables/)

### Recharts
- [Recharts Documentation](https://recharts.github.io/en-US/)
- [Creating Charts in React with TypeScript](https://medium.com/@asyncme/a-guide-to-creating-charts-in-react-with-typescript-8ac9fd17fa74)
- [Recharts ResponsiveContainer Guide](https://www.dhiwise.com/post/simplify-data-visualization-with-recharts-responsivecontainer)
- [Custom Style Recharts](https://www.paigeniedringhaus.com/blog/build-and-custom-style-recharts-data-charts/)
- [Create charts using Recharts](https://refine.dev/blog/recharts/)

### Testing
- [Automated Visual Regression Testing With Playwright](https://css-tricks.com/automated-visual-regression-testing-with-playwright/)
- [Playwright Visual Testing](https://dev.to/hashcode01/visual-regression-testing-with-playwright-2137)
- [Playwright Component Testing](https://playwright.dev/docs/test-components)
- [Effective Visual Regression Testing: Vitest vs Playwright](https://mayashavin.com/articles/visual-testing-vitest-playwright)

### Validation and Accessibility
- [Zod Documentation](https://zod.dev/)
- [Schema Validation with Zod](https://blog.logrocket.com/schema-validation-typescript-zod/)
- [Chart.js Accessibility](https://www.chartjs.org/docs/latest/general/accessibility.html)
- [Making Charts Accessible](https://www.stuartashworth.com/blog/making-a-chartjs-chart-accessible/)
- [Accessible Data Viz with D3](https://fossheim.io/writing/posts/accessible-dataviz-d3-intro/)

### Library Comparisons
- [react-map-gl Documentation](https://visgl.github.io/react-map-gl/)
- [React Map Library Comparison](https://www.somethingsblog.com/2024/10/18/react-map-library-showdown-top-options-compared/)
- [How to integrate Mapbox GL JS in Next.js without react-map-gl](https://dev.to/naomigrace/how-to-integrate-mapbox-gl-js-in-your-next-js-project-without-react-map-gl-or-a-react-wrapper-library-50f)
