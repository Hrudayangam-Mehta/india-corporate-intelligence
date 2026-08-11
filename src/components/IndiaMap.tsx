import { useEffect, useRef } from 'react';
import type { Company } from '../types';

// India state boundaries simplified GeoJSON
const indiaStatesGeoJSON = {
  type: "FeatureCollection",
  features: [
    { type: "Feature", properties: { name: "Maharashtra", code: "MH" }, geometry: { type: "Polygon", coordinates: [[[72.8, 16.0], [80.9, 16.0], [80.9, 22.0], [72.8, 22.0], [72.8, 16.0]]] } },
    { type: "Feature", properties: { name: "Karnataka", code: "KA" }, geometry: { type: "Polygon", coordinates: [[[74.0, 11.5], [78.5, 11.5], [78.5, 18.5], [74.0, 18.5], [74.0, 11.5]]] } },
    { type: "Feature", properties: { name: "Tamil Nadu", code: "TN" }, geometry: { type: "Polygon", coordinates: [[[76.5, 8.0], [80.3, 8.0], [80.3, 13.5], [76.5, 13.5], [76.5, 8.0]]] } },
    { type: "Feature", properties: { name: "Gujarat", code: "GJ" }, geometry: { type: "Polygon", coordinates: [[[68.1, 20.0], [74.5, 20.0], [74.5, 24.7], [68.1, 24.7], [68.1, 20.0]]] } },
    { type: "Feature", properties: { name: "Telangana", code: "TG" }, geometry: { type: "Polygon", coordinates: [[[77.0, 15.5], [81.5, 15.5], [81.5, 19.5], [77.0, 19.5], [77.0, 15.5]]] } },
    { type: "Feature", properties: { name: "Uttarakhand", code: "UK" }, geometry: { type: "Polygon", coordinates: [[[77.5, 28.5], [81.0, 28.5], [81.0, 31.5], [77.5, 31.5], [77.5, 28.5]]] } },
    { type: "Feature", properties: { name: "Delhi", code: "DL" }, geometry: { type: "Polygon", coordinates: [[[76.8, 28.4], [77.4, 28.4], [77.4, 28.9], [76.8, 28.9], [76.8, 28.4]]] } },
    { type: "Feature", properties: { name: "West Bengal", code: "WB" }, geometry: { type: "Polygon", coordinates: [[[85.8, 21.5], [89.9, 21.5], [89.9, 27.2], [85.8, 27.2], [85.8, 21.5]]] } },
    { type: "Feature", properties: { name: "Rajasthan", code: "RJ" }, geometry: { type: "Polygon", coordinates: [[[69.5, 23.0], [78.0, 23.0], [78.0, 30.2], [69.5, 30.2], [69.5, 23.0]]] } },
    { type: "Feature", properties: { name: "Andhra Pradesh", code: "AP" }, geometry: { type: "Polygon", coordinates: [[[76.7, 12.5], [84.8, 12.5], [84.8, 19.9], [76.7, 19.9], [76.7, 12.5]]] } },
    { type: "Feature", properties: { name: "Haryana", code: "HR" }, geometry: { type: "Polygon", coordinates: [[[74.5, 27.5], [77.5, 27.5], [77.5, 31.0], [74.5, 31.0], [74.5, 27.5]]] } },
    { type: "Feature", properties: { name: "Uttar Pradesh", code: "UP" }, geometry: { type: "Polygon", coordinates: [[[77.0, 24.0], [84.5, 24.0], [84.5, 30.5], [77.0, 30.5], [77.0, 24.0]]] } },
    { type: "Feature", properties: { name: "Madhya Pradesh", code: "MP" }, geometry: { type: "Polygon", coordinates: [[[74.0, 21.0], [82.5, 21.0], [82.5, 26.5], [74.0, 26.5], [74.0, 21.0]]] } },
    { type: "Feature", properties: { name: "Punjab", code: "PB" }, geometry: { type: "Polygon", coordinates: [[[73.5, 29.5], [76.5, 29.5], [76.5, 32.5], [73.5, 32.5], [73.5, 29.5]]] } },
    { type: "Feature", properties: { name: "Kerala", code: "KL" }, geometry: { type: "Polygon", coordinates: [[[74.8, 8.0], [77.5, 8.0], [77.5, 12.5], [74.8, 12.5], [74.8, 8.0]]] } },
    { type: "Feature", properties: { name: "Odisha", code: "OD" }, geometry: { type: "Polygon", coordinates: [[[81.5, 17.5], [87.5, 17.5], [87.5, 22.5], [81.5, 22.5], [81.5, 17.5]]] } },
  ]
};

interface IndiaMapProps {
  companies: Company[];
  selectedState?: string | null;
  onStateClick?: (state: string) => void;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({ companies, selectedState, onStateClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate company counts by state
  const stateCounts = companies.reduce((acc, company) => {
    const state = company.hqLocation.state;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(stateCounts), 1);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const width = svg.clientWidth || 800;
    const height = svg.clientHeight || 500;
    
    // Clear previous
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    
    // Create projection (simplified mercator for India)
    const projection = (lng: number, lat: number): [number, number] => {
      const x = ((lng - 68) / (97 - 68)) * width;
      const y = height - ((lat - 8) / (37 - 8)) * height;
      return [x, y];
    };

    // Draw states
    indiaStatesGeoJSON.features.forEach((feature: any) => {
      const coords = feature.geometry.coordinates[0];
      const pathData = coords.map((coord: number[], i: number) => {
        const [x, y] = projection(coord[0], coord[1]);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      }).join(' ') + ' Z';

      const stateName = feature.properties.name;
      const count = stateCounts[stateName] || 0;
      const intensity = count / maxCount;
      const isSelected = selectedState === stateName;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', isSelected 
        ? 'rgba(201, 168, 108, 0.6)' 
        : intensity > 0 
          ? `rgba(201, 168, 108, ${0.1 + intensity * 0.5})` 
          : '#1a1a1e');
      path.setAttribute('stroke', isSelected ? '#c9a86c' : 'rgba(244, 240, 232, 0.1)');
      path.setAttribute('stroke-width', isSelected ? '2' : '1');
      path.setAttribute('class', 'transition-all duration-300 hover:stroke-accent cursor-pointer');
      if (onStateClick) {
        path.addEventListener('click', () => onStateClick(stateName));
      }
      svg.appendChild(path);

      // Add label if has companies
      if (count > 0) {
        const centroid = coords.reduce((sum: number[], coord: number[]) => [sum[0] + coord[0], sum[1] + coord[1]], [0, 0]);
        const [cx, cy] = projection(centroid[0] / coords.length, centroid[1] / coords.length);
        
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', cx.toString());
        text.setAttribute('y', cy.toString());
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#c9a86c');
        text.setAttribute('font-size', '11');
        text.setAttribute('font-weight', '600');
        text.textContent = count.toString();
        svg.appendChild(text);
      }
    });

    // Draw company markers
    companies.forEach(company => {
      const [x, y] = projection(company.hqLocation.lng, company.hqLocation.lat);
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x.toString());
      circle.setAttribute('cy', y.toString());
      circle.setAttribute('r', Math.max(4, Math.min(12, (company.marketCap || 0) / 100000)).toString());
      circle.setAttribute('fill', '#c9a86c');
      circle.setAttribute('stroke', '#0a0a0c');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('class', 'cursor-pointer hover:r-8 transition-all');
      circle.setAttribute('opacity', '0.8');
      
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = `${company.name} (${company.sector})`;
      circle.appendChild(title);
      
      svg.appendChild(circle);
    });
  }, [companies, selectedState, maxCount, stateCounts, onStateClick]);

  return (
    <svg 
      ref={svgRef} 
      className="w-full h-[500px]"
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid meet"
    />
  );
};

export default IndiaMap;
