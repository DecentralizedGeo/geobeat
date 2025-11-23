# Quick Reference Guide - Mapbox + Recharts Integration

Essential commands, patterns, and troubleshooting for the Geobeat dashboard.

## Installation Commands

```bash
cd /Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui

# Install Mapbox
npm install mapbox-gl
npm install --save-dev @types/mapbox-gl

# Optional: Install react-map-gl wrapper
npm install react-map-gl

# Install Turf.js for geospatial operations
npm install @turf/turf
npm install --save-dev @types/turf

# Install Playwright for testing (optional)
npm install --save-dev @playwright/test
npx playwright install
```

## Environment Setup

Create `.env.local`:
```env
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6InlvdXJ0b2tlbiJ9
```

Get token from: https://account.mapbox.com/access-tokens/

## Project already has:
- ✅ Recharts 2.15.4
- ✅ Zod 3.25.76
- ✅ Next.js 16.0.3
- ✅ TypeScript 5.x
- ✅ Tailwind CSS 4.1.9

## File Locations

Your project uses these paths:
```
/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/
├── components/
│   └── network-map.tsx          <- Replace this placeholder
├── package.json
├── .env.local                    <- Create this
└── tsconfig.json
```

## Common Patterns

### 1. Basic Map Component

```typescript
'use client';
import { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function MapboxMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return; // Prevent re-initialization

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

    if (mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 2,
      });
    }

    return () => map.current?.remove();
  }, []);

  return <div ref={mapContainer} className="w-full h-[600px]" />;
}
```

### 2. Add GeoJSON Points

```typescript
// After map loads
map.current.on('load', () => {
  map.current!.addSource('nodes', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: nodes.map(n => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: n.coordinates },
        properties: { id: n.id, network: n.network }
      }))
    }
  });

  map.current!.addLayer({
    id: 'nodes-layer',
    type: 'circle',
    source: 'nodes',
    paint: {
      'circle-radius': 6,
      'circle-color': '#007cbf',
    }
  });
});
```

### 3. Add Clustering

```typescript
map.current!.addSource('nodes', {
  type: 'geojson',
  data: geojsonData,
  cluster: true,           // Enable clustering
  clusterMaxZoom: 14,      // Max zoom to cluster
  clusterRadius: 50        // Cluster radius in pixels
});
```

### 4. Basic Recharts Timeline

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={400}>
  <LineChart data={data}>
    <XAxis dataKey="timestamp" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="gdi" stroke="#8884d8" />
  </LineChart>
</ResponsiveContainer>
```

### 5. Connect Map Click to Chart

```typescript
// In parent component
const [selectedTimestamp, setSelectedTimestamp] = useState<number | null>(null);

// Map component
<NetworkMap onNodeClick={(node) => setSelectedTimestamp(node.timestamp)} />

// Chart component
<NetworkTimeline highlightedTimestamp={selectedTimestamp} />
```

## Troubleshooting

### Map Not Rendering

**Problem:** Blank container or error
**Solutions:**
```typescript
// 1. Check token is set
console.log(process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN); // Should not be undefined

// 2. Import CSS
import 'mapbox-gl/dist/mapbox-gl.css';

// 3. Set explicit height
<div ref={mapContainer} className="h-[600px]" />

// 4. Check 'use client' directive at top of file
'use client';
```

### Webpack Build Error

**Error:** `Module not found: Can't resolve 'mapbox-gl'`

**Solution:** Add to `next.config.js`:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'mapbox-gl': 'mapbox-gl/dist/mapbox-gl.js',
    };
    return config;
  },
};

module.exports = nextConfig;
```

### Environment Variable Not Working

**Problem:** `process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is undefined

**Solutions:**
```bash
# 1. Restart dev server after adding .env.local
npm run dev

# 2. Check file name is exactly .env.local (not .env or .env.development)

# 3. Verify NEXT_PUBLIC_ prefix is present
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_token  # ✓ Correct
MAPBOX_ACCESS_TOKEN=your_token              # ✗ Won't work in browser
```

### Map Re-renders Infinitely

**Problem:** Map keeps reinitializing

**Solution:**
```typescript
// ✗ WRONG - Missing dependency array
useEffect(() => {
  map.current = new mapboxgl.Map({...});
});

// ✓ CORRECT - Empty dependency array
useEffect(() => {
  if (map.current) return;
  map.current = new mapboxgl.Map({...});
}, []); // <-- Empty array is critical!
```

### TypeScript Errors with Recharts

**Problem:** Type errors with Recharts components

**Solution:**
```typescript
// Install types if missing
npm install --save-dev @types/recharts

// Or use 'any' for complex tooltip types
const CustomTooltip = ({ active, payload }: any) => {
  // ...
}
```

### Click Events Not Working

**Problem:** Map clicks don't trigger handlers

**Solution:**
```typescript
// Make sure layer ID matches
map.current!.on('click', 'nodes-layer', (e) => { ... });
//                         ^^^^^^^^^^^
//                         Must match addLayer() id

// Check layer exists
if (map.current!.getLayer('nodes-layer')) {
  map.current!.on('click', 'nodes-layer', handler);
}
```

## Performance Tips

### 1. Clustering Large Datasets

```typescript
// Enable clustering for 1000+ points
cluster: true,
clusterMaxZoom: 14,
clusterRadius: 50,

// Or use Supercluster manually
import Supercluster from 'supercluster';
const index = new Supercluster({ radius: 40, maxZoom: 16 });
```

### 2. Optimize Recharts Rendering

```typescript
// Disable animations for large datasets
<Line animationDuration={0} />

// Reduce data points
const downsampledData = data.filter((_, i) => i % 10 === 0);

// Use dot={false} for smoother lines
<Line dot={false} />
```

### 3. Lazy Load Map

```typescript
import dynamic from 'next/dynamic';

const NetworkMap = dynamic(
  () => import('@/components/maps/network-map'),
  { ssr: false } // Don't render on server
);
```

## Useful Mapbox Style URLs

```typescript
const STYLES = {
  dark: 'mapbox://styles/mapbox/dark-v11',
  light: 'mapbox://styles/mapbox/light-v11',
  streets: 'mapbox://styles/mapbox/streets-v12',
  satellite: 'mapbox://styles/mapbox/satellite-streets-v12',
  outdoors: 'mapbox://styles/mapbox/outdoors-v12',
};
```

## CSS for Mapbox Popups

```css
/* Add to global CSS or component */
.mapboxgl-popup-content {
  background-color: oklch(0.20 0 0);
  border: 1px solid oklch(0.30 0 0);
  border-radius: 8px;
  padding: 1rem;
  color: oklch(0.95 0 0);
}

.mapboxgl-popup-tip {
  border-top-color: oklch(0.20 0 0);
}
```

## Accessibility Checklist

```typescript
// Map component
<div
  ref={mapContainer}
  role="img"
  aria-label="Interactive map showing node distribution"
  tabIndex={0}
/>

// Chart component
<div role="img" aria-label="Network metrics over time">
  <ResponsiveContainer>
    <LineChart accessibilityLayer>
      {/* ... */}
    </LineChart>
  </ResponsiveContainer>

  {/* Add screen-reader-only data table */}
  <table className="sr-only">
    <caption>Network Metrics</caption>
    {/* ... */}
  </table>
</div>
```

## Testing Commands

```bash
# Run Playwright tests
npx playwright test

# Run in UI mode
npx playwright test --ui

# Generate screenshots
npx playwright test --update-snapshots

# Run specific test
npx playwright test map-visualization.spec.ts
```

## Data Validation Example

```typescript
import { z } from 'zod';

const NodeSchema = z.object({
  id: z.string(),
  coordinates: z.tuple([
    z.number().min(-180).max(180),
    z.number().min(-90).max(90)
  ]),
  network: z.enum(['ethereum', 'bitcoin', 'solana']),
  timestamp: z.number().positive(),
});

// Validate API response
try {
  const validatedNodes = z.array(NodeSchema).parse(apiData);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Validation errors:', error.errors);
  }
}
```

## Debugging Tips

### 1. Check Map State

```typescript
// In browser console
map.current.getStyle()     // Current style
map.current.getCenter()    // Current center
map.current.getZoom()      // Current zoom
map.current.getSource('nodes') // Check if source exists
map.current.getLayer('nodes-layer') // Check if layer exists
```

### 2. Debug Recharts Data

```typescript
// Add to chart
<LineChart data={data} onClick={(e) => console.log('Chart data:', e)} />

// Check data format
console.log('Chart data:', data);
// Should be: [{ timestamp: 123, gdi: 50, ... }, ...]
```

### 3. Network Request Debugging

```typescript
// Check if data is being fetched
useEffect(() => {
  console.log('Nodes:', nodes.length);
  console.log('Time series points:', timeSeries.length);
}, [nodes, timeSeries]);
```

## Color Palette (from existing design)

```typescript
const COLORS = {
  gdi: 'oklch(0.70 0.15 265)', // Purple
  pdi: 'oklch(0.60 0.18 240)', // Blue
  jdi: 'oklch(0.65 0.15 150)', // Green
  ihi: 'oklch(0.63 0.20 290)', // Violet

  background: 'oklch(0.15 0 0)',
  foreground: 'oklch(0.95 0 0)',
  muted: 'oklch(0.30 0 0)',
  border: 'oklch(0.30 0 0)',
};
```

## Common Commands Summary

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Install new package
npm install <package-name>

# Install dev dependency
npm install --save-dev <package-name>

# Check installed versions
npm list mapbox-gl
npm list recharts
npm list zod
```

## Key Documentation Links

**Mapbox:**
- API Reference: https://docs.mapbox.com/mapbox-gl-js/api/
- Examples: https://docs.mapbox.com/mapbox-gl-js/example/
- Clustering: https://docs.mapbox.com/mapbox-gl-js/example/cluster/

**Recharts:**
- Documentation: https://recharts.org/en-US/
- API: https://recharts.org/en-US/api
- Examples: https://recharts.org/en-US/examples

**Next.js:**
- App Router: https://nextjs.org/docs/app
- Environment Variables: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

**Zod:**
- Documentation: https://zod.dev/
- Error Handling: https://zod.dev/ERROR_HANDLING

## Quick Start Checklist

- [ ] Install mapbox-gl and types
- [ ] Create .env.local with NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
- [ ] Import 'mapbox-gl/dist/mapbox-gl.css'
- [ ] Add 'use client' directive to components
- [ ] Set explicit height on map container
- [ ] Use empty dependency array in useEffect
- [ ] Add cleanup in useEffect return
- [ ] Validate data with Zod schemas
- [ ] Test in browser (check for errors)
- [ ] Add accessibility attributes

## Next Steps

1. Replace `/Users/x25bd/Code/astral/geobeat/src/frontend/v0-geobeat-ui/components/network-map.tsx`
2. Create custom hook in `components/maps/use-mapbox.ts`
3. Add type definitions in `types/network.ts`
4. Create timeline chart in `components/charts/network-timeline.tsx`
5. Integrate in dashboard page
6. Add tests with Playwright
7. Deploy and test in production
