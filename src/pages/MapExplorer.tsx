import { useEffect, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { MapPin, Building2, TrendingUp, Filter } from 'lucide-react';

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
  ]
};

export default function MapExplorer() {
  const { companies } = useData();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'india' | 'world'>('india');

  // Calculate company counts by state
  const stateCounts = companies.reduce((acc, company) => {
    const state = company.hqLocation.state;
    acc[state] = (acc[state] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const maxCount = Math.max(...Object.values(stateCounts), 1);

  useEffect(() => {
    if (!svgRef.current || viewMode !== 'india') return;
    
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    
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

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', pathData);
      path.setAttribute('fill', intensity > 0 
        ? `rgba(201, 168, 108, ${0.1 + intensity * 0.7})` 
        : '#1a1a1e');
      path.setAttribute('stroke', 'rgba(244, 240, 232, 0.1)');
      path.setAttribute('stroke-width', '1');
      path.setAttribute('class', 'transition-all duration-300 hover:stroke-accent cursor-pointer');
      path.addEventListener('click', () => setSelectedState(stateName));
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
        text.setAttribute('font-size', '10');
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
      circle.setAttribute('r', '6');
      circle.setAttribute('fill', '#c9a86c');
      circle.setAttribute('stroke', '#0a0a0c');
      circle.setAttribute('stroke-width', '2');
      circle.setAttribute('class', 'cursor-pointer hover:r-8 transition-all');
      
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
      title.textContent = company.name;
      circle.appendChild(title);
      
      svg.appendChild(circle);
    });
  }, [companies, viewMode, maxCount, stateCounts]);

  const filteredCompanies = selectedState 
    ? companies.filter(c => c.hqLocation.state === selectedState)
    : companies;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-editorial text-3xl font-bold">Map Explorer</h1>
          <p className="text-text-secondary mt-1">Geographic distribution of Indian companies</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('india')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'india' ? 'bg-accent text-bg' : 'bg-bg-card text-text-secondary border border-border'
            }`}
          >
            India
          </button>
          <button 
            onClick={() => setViewMode('world')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === 'world' ? 'bg-accent text-bg' : 'bg-bg-card text-text-secondary border border-border'
            }`}
          >
            World
          </button>
        </div>
      </div>

      {viewMode === 'india' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 card-surface p-4">
            <svg 
              ref={svgRef} 
              className="w-full h-[500px]"
              viewBox="0 0 800 600"
              preserveAspectRatio="xMidYMid meet"
            />
            <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent/20" />
                <span>Low</span>
              </div>
              <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-accent/20 to-accent" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card-surface p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-accent" />
                <h3 className="font-semibold">Companies</h3>
                {selectedState && (
                  <button 
                    onClick={() => setSelectedState(null)}
                    className="ml-auto text-xs text-accent hover:underline"
                  >
                    Clear filter
                  </button>
                )}
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {filteredCompanies.map(company => (
                  <div key={company.id} className="p-3 bg-bg-elevated rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-accent" />
                      <span className="font-medium text-sm">{company.name}</span>
                    </div>
                    <div className="text-xs text-text-muted mt-1 flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      {company.hqLocation.city}, {company.hqLocation.state}
                    </div>
                    {company.marketCap && (
                      <div className="text-xs text-accent mt-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        ₹{(company.marketCap / 1000).toFixed(0)}K Cr
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* State Summary */}
            <div className="card-surface p-4">
              <h3 className="font-semibold mb-3">State Summary</h3>
              <div className="space-y-2">
                {Object.entries(stateCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([state, count]) => (
                    <div 
                      key={state} 
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-all ${
                        selectedState === state ? 'bg-accent/10 border border-accent/20' : 'hover:bg-bg-elevated'
                      }`}
                      onClick={() => setSelectedState(selectedState === state ? null : state)}
                    >
                      <span className="text-sm">{state}</span>
                      <span className="text-xs bg-bg-elevated px-2 py-1 rounded">{count}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-surface p-8 text-center">
          <h2 className="text-xl font-semibold mb-4">World Map Coming Soon</h2>
          <p className="text-text-secondary">
            Global FDI flows, port connections, and foreign subsidiary mapping will be available in the next phase.
          </p>
        </div>
      )}
    </div>
  );
}
