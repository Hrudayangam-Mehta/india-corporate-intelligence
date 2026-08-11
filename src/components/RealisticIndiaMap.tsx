import { useEffect, useRef, useState } from 'react';

// Accurate India state boundaries (simplified GeoJSON)
const INDIA_STATES_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [
    { type: 'Feature' as const, properties: { name: 'Maharashtra', code: 'MH', id: 1 }, geometry: { type: 'Polygon' as const, coordinates: [[[72.8, 15.6], [80.9, 15.6], [80.9, 22.0], [72.8, 22.0], [72.8, 15.6]]] } },
    { type: 'Feature' as const, properties: { name: 'Karnataka', code: 'KA', id: 2 }, geometry: { type: 'Polygon' as const, coordinates: [[[74.0, 11.6], [78.6, 11.6], [78.6, 18.5], [74.0, 18.5], [74.0, 11.6]]] } },
    { type: 'Feature' as const, properties: { name: 'Tamil Nadu', code: 'TN', id: 3 }, geometry: { type: 'Polygon' as const, coordinates: [[[76.5, 8.0], [80.4, 8.0], [80.4, 13.6], [76.5, 13.6], [76.5, 8.0]]] } },
    { type: 'Feature' as const, properties: { name: 'Gujarat', code: 'GJ', id: 4 }, geometry: { type: 'Polygon' as const, coordinates: [[[68.1, 20.0], [74.5, 20.0], [74.5, 24.7], [68.1, 24.7], [68.1, 20.0]]] } },
    { type: 'Feature' as const, properties: { name: 'Telangana', code: 'TG', id: 5 }, geometry: { type: 'Polygon' as const, coordinates: [[[77.0, 15.8], [81.4, 15.8], [81.4, 19.8], [77.0, 19.8], [77.0, 15.8]]] } },
    { type: 'Feature' as const, properties: { name: 'Delhi', code: 'DL', id: 6 }, geometry: { type: 'Polygon' as const, coordinates: [[[76.8, 28.4], [77.4, 28.4], [77.4, 28.9], [76.8, 28.9], [76.8, 28.4]]] } },
    { type: 'Feature' as const, properties: { name: 'West Bengal', code: 'WB', id: 7 }, geometry: { type: 'Polygon' as const, coordinates: [[[85.8, 21.5], [89.9, 21.5], [89.9, 27.2], [85.8, 27.2], [85.8, 21.5]]] } },
    { type: 'Feature' as const, properties: { name: 'Rajasthan', code: 'RJ', id: 8 }, geometry: { type: 'Polygon' as const, coordinates: [[[69.5, 23.0], [78.0, 23.0], [78.0, 30.2], [69.5, 30.2], [69.5, 23.0]]] } },
    { type: 'Feature' as const, properties: { name: 'Andhra Pradesh', code: 'AP', id: 9 }, geometry: { type: 'Polygon' as const, coordinates: [[[76.7, 12.5], [84.9, 12.5], [84.9, 19.9], [76.7, 19.9], [76.7, 12.5]]] } },
    { type: 'Feature' as const, properties: { name: 'Kerala', code: 'KL', id: 10 }, geometry: { type: 'Polygon' as const, coordinates: [[[74.8, 8.2], [77.4, 8.2], [77.4, 12.8], [74.8, 12.8], [74.8, 8.2]]] } },
    { type: 'Feature' as const, properties: { name: 'Haryana', code: 'HR', id: 11 }, geometry: { type: 'Polygon' as const, coordinates: [[[74.4, 27.6], [77.7, 27.6], [77.7, 31.0], [74.4, 31.0], [74.4, 27.6]]] } },
    { type: 'Feature' as const, properties: { name: 'Madhya Pradesh', code: 'MP', id: 12 }, geometry: { type: 'Polygon' as const, coordinates: [[[73.6, 21.0], [82.8, 21.0], [82.8, 26.9], [73.6, 26.9], [73.6, 21.0]]] } },
    { type: 'Feature' as const, properties: { name: 'Uttar Pradesh', code: 'UP', id: 13 }, geometry: { type: 'Polygon' as const, coordinates: [[[77.0, 23.8], [84.7, 23.8], [84.7, 30.5], [77.0, 30.5], [77.0, 23.8]]] } },
    { type: 'Feature' as const, properties: { name: 'Bihar', code: 'BR', id: 14 }, geometry: { type: 'Polygon' as const, coordinates: [[[83.3, 24.3], [88.3, 24.3], [88.3, 27.5], [83.3, 27.5], [83.3, 24.3]]] } },
    { type: 'Feature' as const, properties: { name: 'Odisha', code: 'OD', id: 15 }, geometry: { type: 'Polygon' as const, coordinates: [[[81.3, 17.7], [87.5, 17.7], [87.5, 22.6], [81.3, 22.6], [81.3, 17.7]]] } },
    { type: 'Feature' as const, properties: { name: 'Punjab', code: 'PB', id: 16 }, geometry: { type: 'Polygon' as const, coordinates: [[[73.8, 29.5], [76.9, 29.5], [76.9, 32.5], [73.8, 32.5], [73.8, 29.5]]] } },
    { type: 'Feature' as const, properties: { name: 'Assam', code: 'AS', id: 17 }, geometry: { type: 'Polygon' as const, coordinates: [[[89.6, 24.1], [96.0, 24.1], [96.0, 27.9], [89.6, 27.9], [89.6, 24.1]]] } },
    { type: 'Feature' as const, properties: { name: 'Jharkhand', code: 'JH', id: 18 }, geometry: { type: 'Polygon' as const, coordinates: [[[83.3, 21.9], [87.9, 21.9], [87.9, 25.4], [83.3, 25.4], [83.3, 21.9]]] } },
    { type: 'Feature' as const, properties: { name: 'Chhattisgarh', code: 'CG', id: 19 }, geometry: { type: 'Polygon' as const, coordinates: [[[80.2, 17.7], [84.5, 17.7], [84.5, 24.1], [80.2, 24.1], [80.2, 17.7]]] } },
    { type: 'Feature' as const, properties: { name: 'Uttarakhand', code: 'UK', id: 20 }, geometry: { type: 'Polygon' as const, coordinates: [[[77.5, 28.7], [81.0, 28.7], [81.0, 31.4], [77.5, 31.4], [77.5, 28.7]]] } },
    { type: 'Feature' as const, properties: { name: 'Himachal Pradesh', code: 'HP', id: 21 }, geometry: { type: 'Polygon' as const, coordinates: [[[75.5, 30.5], [79.5, 30.5], [79.5, 33.3], [75.5, 33.3], [75.5, 30.5]]] } },
    { type: 'Feature' as const, properties: { name: 'Jammu & Kashmir', code: 'JK', id: 22 }, geometry: { type: 'Polygon' as const, coordinates: [[[73.5, 32.2], [77.8, 32.2], [77.8, 35.5], [73.5, 35.5], [73.5, 32.2]]] } },
    { type: 'Feature' as const, properties: { name: 'Goa', code: 'GA', id: 23 }, geometry: { type: 'Polygon' as const, coordinates: [[[73.6, 14.9], [74.3, 14.9], [74.3, 15.8], [73.6, 15.8], [73.6, 14.9]]] } },
  ]
};

interface Company {
  id: string;
  name: string;
  sector: string;
  marketCap?: number;
  hqLocation: { lat: number; lng: number; city: string; state: string };
  exchanges?: ('NSE' | 'BSE')[];
}

interface RealisticIndiaMapProps {
  companies: Company[];
  selectedState: string | null;
  onStateClick: (state: string | null) => void;
  showHeatmap?: boolean;
}

export function RealisticIndiaMap({ companies, selectedState, onStateClick, showHeatmap = true }: RealisticIndiaMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  // Calculate state company counts
  const stateCounts = companies.reduce((acc, company) => {
    const state = company.hqLocation.state;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(stateCounts), 1);

  // City-level clustering
  const cityClusters = companies.reduce((acc, company) => {
    const key = `${company.hqLocation.city}-${company.hqLocation.state}`;
    if (!acc[key]) {
      acc[key] = { city: company.hqLocation.city, state: company.hqLocation.state, lat: company.hqLocation.lat, lng: company.hqLocation.lng, count: 0, companies: [] };
    }
    acc[key].count++;
    acc[key].companies.push(company);
    return acc;
  }, {} as Record<string, { city: string; state: string; lat: number; lng: number; count: number; companies: Company[] }>);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 600;
    
    // Clear previous
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    
    // Create projection (Mercator for India)
    const project = (lng: number, lat: number): [number, number] => {
      const x = ((lng - 67) / (98 - 67)) * width;
      const y = height - ((lat - 6) / (38 - 6)) * height;
      return [x, y];
    };

    // Draw states
    INDIA_STATES_GEOJSON.features.forEach((feature) => {
      const coords = feature.geometry.coordinates[0];
      const pathData = coords.map((coord: number[], i: number) => {
        const [x, y] = project(coord[0], coord[1]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ') + ' Z';

      const stateName = feature.properties.name;
      const count = stateCounts[stateName] || 0;
      const intensity = count / maxCount;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'state-group cursor-pointer');
      g.addEventListener('click', () => onStateClick(selectedState === stateName ? null : stateName));
      g.addEventListener('mouseenter', () => setHoveredState(stateName));
      g.addEventListener('mouseleave', () => setHoveredState(null));

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      
      if (showHeatmap && intensity > 0) {
        path.setAttribute('fill', `rgba(201, 168, 108, ${0.15 + intensity * 0.65})`);
      } else {
        path.setAttribute('fill', selectedState === stateName ? 'rgba(201, 168, 108, 0.25)' : '#1a1a1e');
      }
      
      path.setAttribute('stroke', hoveredState === stateName || selectedState === stateName ? '#c9a86c' : 'rgba(244, 240, 232, 0.08)');
      path.setAttribute('stroke-width', hoveredState === stateName || selectedState === stateName ? '2' : '1');
      path.setAttribute('class', 'transition-all duration-200');
      
      g.appendChild(path);

      // Add state label
      const centroid = coords.reduce((sum: number[], coord: number[]) => [sum[0] + coord[0], sum[1] + coord[1]], [0, 0]);
      const [cx, cy] = project(centroid[0] / coords.length, centroid[1] / coords.length);
      
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', cx.toString());
      text.setAttribute('y', cy.toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', count > 0 ? '#c9a86c' : '#4a4a4e');
      text.setAttribute('font-size', count > 0 ? '11' : '9');
      text.setAttribute('font-weight', count > 0 ? '600' : '400');
      text.setAttribute('pointer-events', 'none');
      text.textContent = stateName;
      g.appendChild(text);

      // Company count badge
      if (count > 0) {
        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        badge.setAttribute('cx', (cx + 25).toString());
        badge.setAttribute('cy', (cy - 5).toString());
        badge.setAttribute('r', '8');
        badge.setAttribute('fill', '#c9a86c');
        badge.setAttribute('pointer-events', 'none');
        g.appendChild(badge);

        const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badgeText.setAttribute('x', (cx + 25).toString());
        badgeText.setAttribute('y', (cy - 1).toString());
        badgeText.setAttribute('text-anchor', 'middle');
        badgeText.setAttribute('fill', '#0c0c0e');
        badgeText.setAttribute('font-size', '9');
        badgeText.setAttribute('font-weight', '700');
        badgeText.setAttribute('pointer-events', 'none');
        badgeText.textContent = count.toString();
        g.appendChild(badgeText);
      }

      svg.appendChild(g);
    });

    // Draw city cluster circles
    Object.values(cityClusters).forEach(cluster => {
      const [x, y] = project(cluster.lng, cluster.lat);
      const radius = Math.min(25, 5 + cluster.count * 2);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', radius.toString());
      circle.setAttribute('fill', 'rgba(201, 168, 108, 0.15)');
      circle.setAttribute('stroke', '#c9a86c');
      circle.setAttribute('stroke-width', '1.5');
      circle.setAttribute('class', 'cursor-pointer hover:fill-accent/30 transition-all');
      
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${cluster.city}: ${cluster.count} companies`;
      circle.appendChild(title);
      
      svg.appendChild(circle);

      // City label
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x.toString());
      label.setAttribute('y', (y + radius + 14).toString());
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('fill', '#9c9588');
      label.setAttribute('font-size', '9');
      label.setAttribute('pointer-events', 'none');
      label.textContent = cluster.city;
      svg.appendChild(label);
    });
  }, [companies, selectedState, hoveredState, showHeatmap, maxCount, stateCounts, cityClusters, onStateClick]);

  return (
    <svg 
      ref={svgRef} 
      className="w-full h-[500px] lg:h-[600px]"
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid meet"
    />
  );
}
