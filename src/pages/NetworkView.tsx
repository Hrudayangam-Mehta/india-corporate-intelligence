import { useEffect, useRef, useState } from 'react';
import { useData } from '../context/DataContext';
import { Filter, User, Building2 } from 'lucide-react';

export default function NetworkView() {
  const { companies, persons, edges } = useData();
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  // Build nodes
  const nodes = [
    ...companies.map(c => ({
      id: c.id,
      label: c.name,
      type: 'company' as const,
      size: Math.sqrt((c.marketCap || 100000) / 10000) + 5,
      color: '#c9a86c',
    })),
    ...persons.map(p => ({
      id: p.id,
      label: p.name,
      type: 'person' as const,
      size: 8,
      color: '#7a9e7e',
    })),
  ];

  // Filter edges
  const filteredEdges = filterType === 'all' 
    ? edges 
    : edges.filter(e => e.type === filterType);

  useEffect(() => {
    if (!svgRef.current) return;
    
    const svg = svgRef.current;
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    
    // Clear previous
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    // Simple force simulation
    const nodePositions = new Map<string, { x: number; y: number; vx: number; vy: number }>();
    
    // Initialize positions in a circle
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      nodePositions.set(node.id, {
        x: width / 2 + Math.cos(angle) * 150,
        y: height / 2 + Math.sin(angle) * 150,
        vx: 0,
        vy: 0,
      });
    });

    // Run force simulation
    for (let iter = 0; iter < 100; iter++) {
      // Repulsion
      nodes.forEach((nodeA, i) => {
        const posA = nodePositions.get(nodeA.id)!;
        nodes.forEach((nodeB, j) => {
          if (i === j) return;
          const posB = nodePositions.get(nodeB.id)!;
          const dx = posA.x - posB.x;
          const dy = posA.y - posB.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = 2000 / (dist * dist);
          posA.vx += (dx / dist) * force;
          posA.vy += (dy / dist) * force;
        });
      });

      // Attraction (edges)
      filteredEdges.forEach(edge => {
        const posA = nodePositions.get(edge.source);
        const posB = nodePositions.get(edge.target);
        if (!posA || !posB) return;
        const dx = posB.x - posA.x;
        const dy = posB.y - posA.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = dist * 0.001;
        posA.vx += (dx / dist) * force;
        posA.vy += (dy / dist) * force;
        posB.vx -= (dx / dist) * force;
        posB.vy -= (dy / dist) * force;
      });

      // Center gravity
      nodes.forEach(node => {
        const pos = nodePositions.get(node.id)!;
        pos.vx += (width / 2 - pos.x) * 0.001;
        pos.vy += (height / 2 - pos.y) * 0.001;
        
        // Apply velocity with damping
        pos.vx *= 0.9;
        pos.vy *= 0.9;
        pos.x += pos.vx;
        pos.y += pos.vy;
      });
    }

    // Draw edges
    filteredEdges.forEach(edge => {
      const posA = nodePositions.get(edge.source);
      const posB = nodePositions.get(edge.target);
      if (!posA || !posB) return;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', posA.x.toString());
      line.setAttribute('y1', posA.y.toString());
      line.setAttribute('x2', posB.x.toString());
      line.setAttribute('y2', posB.y.toString());
      line.setAttribute('stroke', 'rgba(201, 168, 108, 0.2)');
      line.setAttribute('stroke-width', (edge.strength * 3).toString());
      svg.appendChild(line);
    });

    // Draw nodes
    nodes.forEach(node => {
      const pos = nodePositions.get(node.id)!;
      const isSelected = selectedNode === node.id;

      // Glow effect for selected
      if (isSelected) {
        const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        glow.setAttribute('cx', pos.x.toString());
        glow.setAttribute('cy', pos.y.toString());
        glow.setAttribute('r', (node.size + 8).toString());
        glow.setAttribute('fill', node.color);
        glow.setAttribute('opacity', '0.2');
        svg.appendChild(glow);
      }

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pos.x.toString());
      circle.setAttribute('cy', pos.y.toString());
      circle.setAttribute('r', node.size.toString());
      circle.setAttribute('fill', node.color);
      circle.setAttribute('stroke', isSelected ? '#f0e6d8' : '#0a0a0c');
      circle.setAttribute('stroke-width', isSelected ? '3' : '2');
      circle.setAttribute('class', 'cursor-pointer transition-all');
      circle.addEventListener('click', () => setSelectedNode(node.id));
      svg.appendChild(circle);

      // Label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pos.x.toString());
      text.setAttribute('y', (pos.y + node.size + 14).toString());
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', isSelected ? '#f0e6d8' : '#9c9688');
      text.setAttribute('font-size', '10');
      text.setAttribute('font-weight', isSelected ? '600' : '400');
      text.textContent = node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label;
      svg.appendChild(text);
    });
  }, [nodes, filteredEdges, selectedNode]);

  const selectedNodeData = selectedNode 
    ? nodes.find(n => n.id === selectedNode) 
    : null;

  const connectedEdges = selectedNode
    ? edges.filter(e => e.source === selectedNode || e.target === selectedNode)
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-editorial text-3xl font-bold">Network Graph</h1>
          <p className="text-text-secondary mt-1">Corporate connections and relationships</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Graph */}
        <div className="lg:col-span-3 card-surface p-4">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-accent" />
            <span className="text-sm text-text-secondary">Filter:</span>
            {['all', 'directorship', 'promoter', 'subsidiary'].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                  filterType === type 
                    ? 'bg-accent/20 text-accent border border-accent/30' 
                    : 'bg-bg-elevated text-text-muted border border-border'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          
          <svg 
            ref={svgRef} 
            className="w-full h-[600px]"
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid meet"
          />
          
          <div className="flex items-center gap-6 mt-4 text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-accent" />
              <span>Company</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-sage" />
              <span>Person</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose" />
              <span>Political</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple" />
              <span>Media</span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card-surface p-4">
            <h3 className="font-semibold mb-4">Node Details</h3>
            {selectedNodeData ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {selectedNodeData.type === 'company' ? (
                    <Building2 className="w-4 h-4 text-accent" />
                  ) : (
                    <User className="w-4 h-4 text-sage" />
                  )}
                  <span className="font-medium">{selectedNodeData.label}</span>
                </div>
                <div className="text-xs text-text-muted">
                  Type: {selectedNodeData.type}
                </div>
                
                {connectedEdges.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-text-secondary mb-2">Connections</h4>
                    <div className="space-y-1">
                      {connectedEdges.map(edge => {
                        const otherId = edge.source === selectedNode ? edge.target : edge.source;
                        const otherNode = nodes.find(n => n.id === otherId);
                        return (
                          <div key={edge.id} className="text-xs p-2 bg-bg-elevated rounded">
                            <span className="text-accent">{otherNode?.label}</span>
                            <span className="text-text-muted ml-2">({edge.type})</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-text-muted">Click on a node to see details</p>
            )}
          </div>

          <div className="card-surface p-4">
            <h3 className="font-semibold mb-3">Network Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total Nodes</span>
                <span className="font-medium">{nodes.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Total Edges</span>
                <span className="font-medium">{edges.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Companies</span>
                <span className="font-medium">{companies.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Persons</span>
                <span className="font-medium">{persons.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
