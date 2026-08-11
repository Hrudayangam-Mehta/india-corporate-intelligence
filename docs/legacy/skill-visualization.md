# ICIP Visualization Skill

## Purpose
Create interactive maps and network graphs for corporate intelligence.

## Map Libraries

### Mapbox GL JS
- Use for: World map, detailed India map
- Token: Required (free tier: 50,000 loads/month)
- Style: Custom dark theme matching ICIP brand

### D3.js
- Use for: India choropleth, network graphs, force simulations
- Modules needed: d3-geo, d3-scale, d3-selection, d3-force

## Component Architecture

### MapExplorer
```typescript
interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  data: GeoJSON | PointData[];
  colorScale: string[];
  opacity: number;
}

interface MapProps {
  center: [number, number];  // [lng, lat]
  zoom: number;
  layers: MapLayer[];
  onRegionClick: (region: string) => void;
  onCompanyClick: (companyId: string) => void;
}
```

### NetworkGraph
```typescript
interface GraphNode {
  id: string;
  label: string;
  type: 'company' | 'person' | 'political_party' | 'media_house';
  size: number;           // Based on market cap/influence
  color: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
  strength: number;       // Line thickness
  directed: boolean;
}

interface GraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick: (node: GraphNode) => void;
  filters: GraphFilter[];
}
```

## India GeoJSON
- Source: https://github.com/datameet/maps
- Files needed:
  - `india-states.geojson` — State boundaries
  - `india-districts.geojson` — District boundaries (optional)
  - `india-cities.geojson` — Major cities with coordinates

## Performance Optimization
- Use canvas rendering for >1000 nodes
- Implement viewport culling for maps
- Lazy load GeoJSON data
- Use web workers for force simulation

## Mobile Considerations
- Tap to select (instead of hover)
- Pinch to zoom
- Swipe to pan
- Bottom sheet for details
- Simplified graph on mobile (reduce nodes)

## Color Schemes

### Corporate Network
- Companies: `#c9a86c` (gold)
- Persons: `#7a9e7e` (sage)
- Political: `#c45b5a` (red)
- Media: `#8b7ec4` (purple)

### India Map
- Heat: `#0c0c0e` → `#c9a86c` (black to gold)
- Selected: `#f0e6d8` (white)
- Hover: `#b8975a` (bright gold)

### World Map
- FDI inflow: Green intensity
- Ports: Blue dots with size = volume
- Trade routes: Animated lines
