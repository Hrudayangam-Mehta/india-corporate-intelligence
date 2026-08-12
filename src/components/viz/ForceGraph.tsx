import { useEffect, useMemo, useRef, useState } from 'react';
import {
  forceSimulation, forceLink, forceManyBody, forceCollide, forceX, forceY,
  type Simulation, type SimulationNodeDatum,
} from 'd3-force';
import { TIERS, type GNode, type GEdge, type Tier, type NodeFamily } from '../../graph/schema';

/**
 * The connection graph.
 *
 * Edge style carries the EVIDENCE TIER — solid / dashed / dotted / dot-dash. That
 * is semantic, not decorative, and is never restyled for looks. Node shape carries
 * type, hue carries family, radius carries weight: three orthogonal channels,
 * never overloaded.
 */

export const FAMILY_COLOR: Record<NodeFamily, string> = {
  state: '#5a8ec4',
  capital: '#c9a86c',
  recipient: '#8b7ec4',
  instrument: '#5aa89e',
  enforce: '#c45b5a',
  market: '#7a9e7e',
};

export const FAMILY_LABEL: Record<NodeFamily, string> = {
  state: 'Public power',
  capital: 'Private capital',
  recipient: 'Recipients',
  instrument: 'Instruments',
  enforce: 'Regulators & courts',
  market: 'Markets & geography',
};

interface SimNode extends SimulationNodeDatum {
  n: GNode;
  id: string;
  r: number;
}
interface SimLink {
  source: SimNode | string;
  target: SimNode | string;
  e: GEdge;
}

export interface GraphFilter {
  tiers: Set<Tier>;
  families: Set<NodeFamily>;
  preds: Set<string>;
  query: string;
  /** ISO date; edges whose window ends before this are hidden. */
  from?: string;
  to?: string;
  minAmount?: number;
}

interface Props {
  nodes: GNode[];
  edges: GEdge[];
  filter: GraphFilter;
  selected?: string | null;
  onSelect?: (id: string | null) => void;
  height?: number;
  /** Ego-network radius in hops. 0 draws the whole filtered graph. */
  focusHops?: number;
}

/** ty → shape. Deliberately few shapes; more would be unreadable at this density. */
function shapeFor(n: GNode, r: number): string {
  switch (n.ty) {
    case 'person':
      return `M ${-r} ${r} a ${r} ${r} 0 1 1 ${r * 2} 0 z`; // half-round: people read as distinct
    case 'ministry':
    case 'agency':
    case 'psu':
      return `M ${-r} ${-r} h ${r * 2} v ${r * 2} h ${-r * 2} z`; // square: institutions
    case 'party':
    case 'sangh':
    case 'trust':
    case 'fund':
      return `M 0 ${-r} L ${r} 0 L 0 ${r} L ${-r} 0 z`; // diamond: recipients of money
    case 'law':
    case 'mechanism':
      return `M 0 ${-r} L ${r * 0.87} ${r * 0.5} L ${-r * 0.87} ${r * 0.5} z`; // triangle: rules
    default:
      return `M ${-r} 0 a ${r} ${r} 0 1 0 ${r * 2} 0 a ${r} ${r} 0 1 0 ${-r * 2} 0`; // circle: companies
  }
}

function within(e: GEdge, f: GraphFilter): boolean {
  if (!f.tiers.has(e.tier)) return false;
  if (f.preds.size && !f.preds.has(e.pred)) return false;
  if (f.minAmount && (e.a ?? 0) < f.minAmount) return false;
  if (f.from && e.to && e.to < f.from) return false;
  if (f.to && e.from && e.from > f.to) return false;
  return true;
}

export default function ForceGraph({
  nodes,
  edges,
  filter,
  selected,
  onSelect,
  height = 620,
  /**
   * Ego-network radius. When a node is selected, render only that node and
   * everything within this many hops of it. 0 disables focus and draws the
   * whole filtered graph.
   *
   * This is the single most important control on a dense graph. Nearly 800
   * relationships in one frame is not a picture of a network, it is a texture;
   * the question a reader actually has is "what is attached to THIS", and an
   * ego view answers it where the full draw cannot.
   */
  focusHops = 0,
}: Props) {
  const ref = useRef<SVGSVGElement>(null);
  const simRef = useRef<Simulation<SimNode, undefined> | null>(null);
  const [tick, setTick] = useState(0);
  const [hover, setHover] = useState<string | null>(null);
  const W = 900;
  const H = height;

  // Pan and zoom. Implemented directly rather than pulling in d3-zoom — it is a
  // transform, a wheel handler and a drag, and the dependency budget is five.
  const [view, setView] = useState({ k: 1, tx: 0, ty: 0 });
  const dragRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const { simNodes, simLinks, hiddenByFocus } = useMemo(() => {
    const q = filter.query.trim().toLowerCase();
    const matches = (n: GNode) =>
      !q ||
      n.label.toLowerCase().includes(q) ||
      (n.sub ?? '').toLowerCase().includes(q) ||
      (n.al ?? []).some((a) => a.toLowerCase().includes(q));

    const visibleEdges = edges.filter((e) => within(e, filter));
    const keep = new Set<string>();
    for (const n of nodes) if (filter.families.has(n.fam) && matches(n)) keep.add(n.id);
    // Keep an edge only when both endpoints survive the node filter.
    let links = visibleEdges.filter((e) => keep.has(e.s) && keep.has(e.t));

    // Ego-network restriction, applied AFTER the filters so the hop count is
    // measured on the graph the reader is actually looking at.
    let hidden = 0;
    if (focusHops > 0 && selected && keep.has(selected)) {
      const adj = new Map<string, string[]>();
      for (const e of links) {
        (adj.get(e.s) ?? adj.set(e.s, []).get(e.s)!).push(e.t);
        (adj.get(e.t) ?? adj.set(e.t, []).get(e.t)!).push(e.s);
      }
      const reach = new Set<string>([selected]);
      let frontier = [selected];
      for (let hop = 0; hop < focusHops; hop++) {
        const next: string[] = [];
        for (const id of frontier) {
          for (const nb of adj.get(id) ?? []) {
            if (!reach.has(nb)) {
              reach.add(nb);
              next.push(nb);
            }
          }
        }
        frontier = next;
        if (!frontier.length) break;
      }
      const before = keep.size;
      for (const id of [...keep]) if (!reach.has(id)) keep.delete(id);
      hidden = before - keep.size;
      links = links.filter((e) => keep.has(e.s) && keep.has(e.t));
    }

    // Drop isolated nodes only when a query is active; otherwise the population matters.
    const connected = new Set<string>();
    for (const l of links) {
      connected.add(l.s);
      connected.add(l.t);
    }
    const finalNodes = nodes
      .filter((n) => keep.has(n.id) && (!q || connected.has(n.id) || matches(n)))
      .map<SimNode>((n) => ({ n, id: n.id, r: 4 + n.sz * 3.2 }));
    const byId = new Map(finalNodes.map((s) => [s.id, s]));
    return {
      simNodes: finalNodes,
      simLinks: links.filter((e) => byId.has(e.s) && byId.has(e.t)).map<SimLink>((e) => ({ source: e.s, target: e.t, e })),
      hiddenByFocus: hidden,
    };
  }, [nodes, edges, filter, focusHops, selected]);

  useEffect(() => {
    simRef.current?.stop();
    if (!simNodes.length) {
      setTick((t) => t + 1);
      return;
    }
    const sim = forceSimulation<SimNode>(simNodes)
      .force('link', forceLink<SimNode, SimLink>(simLinks as never).id((d) => (d as SimNode).id).distance(78).strength(0.55))
      .force('charge', forceManyBody().strength(-190))
      .force('collide', forceCollide<SimNode>().radius((d) => d.r + 7))
      // Families settle into bands — public power left, capital right — so the
      // layout reads as a flow rather than a hairball.
      .force('x', forceX<SimNode>((d) => (d.n.fam === 'state' ? W * 0.28 : d.n.fam === 'capital' ? W * 0.72 : W * 0.5)).strength(0.09))
      .force('y', forceY<SimNode>(H / 2).strength(0.05));

    if (reduced) {
      sim.stop();
      for (let i = 0; i < 260; i++) sim.tick();
      setTick((t) => t + 1);
    } else {
      sim.on('tick', () => setTick((t) => t + 1));
      sim.alpha(1).restart();
      // Freeze once settled — a graph that jitters under the cursor is unreadable.
      window.setTimeout(() => sim.alphaTarget(0).stop(), 4200);
    }
    simRef.current = sim;
    return () => {
      sim.stop();
    };
  }, [simNodes, simLinks, reduced, H]);

  const neighbours = useMemo(() => {
    const focus = hover ?? selected;
    if (!focus) return null;
    const s = new Set<string>([focus]);
    for (const l of simLinks) {
      if (l.e.s === focus) s.add(l.e.t);
      if (l.e.t === focus) s.add(l.e.s);
    }
    return s;
  }, [hover, selected, simLinks]);

  /** Zoom about the cursor, so the thing under the pointer stays under the pointer. */
  const onWheel = (ev: React.WheelEvent<SVGSVGElement>) => {
    ev.preventDefault();
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = ((ev.clientX - rect.left) / rect.width) * W;
    const py = ((ev.clientY - rect.top) / rect.height) * H;
    setView((v) => {
      const k = Math.min(6, Math.max(0.35, v.k * (ev.deltaY < 0 ? 1.15 : 1 / 1.15)));
      return { k, tx: px - ((px - v.tx) / v.k) * k, ty: py - ((py - v.ty) / v.k) * k };
    });
  };

  const onPointerDown = (ev: React.PointerEvent<SVGSVGElement>) => {
    if (ev.button !== 0) return;
    dragRef.current = { x: ev.clientX, y: ev.clientY, tx: view.tx, ty: view.ty };
    (ev.target as Element).setPointerCapture?.(ev.pointerId);
  };
  const onPointerMove = (ev: React.PointerEvent<SVGSVGElement>) => {
    const d = dragRef.current;
    if (!d) return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const sx = W / rect.width;
    const sy = H / rect.height;
    setView((v) => ({ ...v, tx: d.tx + (ev.clientX - d.x) * sx, ty: d.ty + (ev.clientY - d.y) * sy }));
  };
  const endDrag = () => {
    dragRef.current = null;
  };

  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height, touchAction: 'none', cursor: dragRef.current ? 'grabbing' : 'grab' }}
        role="img"
        aria-label={`Connection graph: ${simNodes.length} entities, ${simLinks.length} relationships. Scroll to zoom, drag to pan. A table view of the same data is available below.`}
        data-tick={tick}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
      <defs>
        <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="rgba(232,228,220,0.35)" />
        </marker>
      </defs>

      <g transform={`translate(${view.tx},${view.ty}) scale(${view.k})`}>
      <g>
        {simLinks.map((l, i) => {
          const s = l.source as SimNode;
          const t = l.target as SimNode;
          if (typeof s === 'string' || typeof t === 'string' || s.x == null || t.x == null) return null;
          const meta = TIERS[l.e.tier];
          const dim = neighbours && !(neighbours.has(l.e.s) && neighbours.has(l.e.t));
          const isContra = l.e.pred === 'contra';
          return (
            <line
              key={`${l.e.s}-${l.e.t}-${i}`}
              x1={s.x}
              y1={s.y}
              x2={t.x}
              y2={t.y}
              stroke={isContra ? '#c45b5a' : 'rgba(232,228,220,0.30)'}
              strokeWidth={isContra ? 1.5 : 0.7 + Math.min(2.4, Math.sqrt(l.e.a ?? 0) / 26)}
              strokeDasharray={meta.dash || undefined}
              opacity={dim ? 0.1 : isContra ? 0.9 : 0.55}
              markerEnd={l.e.pred === 'contra' || l.e.pred === 'supersede' ? undefined : 'url(#arrow)'}
            >
              <title>{`${l.e.s} → ${l.e.t} · ${l.e.pred} · ${l.e.tier}${l.e.a ? ` · ₹${l.e.a} cr` : ''}${l.e.lab ? ` · ${l.e.lab}` : ''}`}</title>
            </line>
          );
        })}
      </g>

      <g>
        {simNodes.map((d) => {
          if (d.x == null || d.y == null) return null;
          const dim = neighbours && !neighbours.has(d.id);
          const isSel = selected === d.id;
          return (
            <g
              key={d.id}
              transform={`translate(${d.x},${d.y})`}
              opacity={dim ? 0.16 : 1}
              style={{ cursor: 'pointer' }}
              tabIndex={0}
              role="button"
              aria-label={`${d.n.label}${d.n.sub ? `, ${d.n.sub}` : ''}`}
              onMouseEnter={() => setHover(d.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(d.id)}
              onBlur={() => setHover(null)}
              onClick={() => onSelect?.(isSel ? null : d.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect?.(isSel ? null : d.id);
                }
              }}
            >
              <path
                d={shapeFor(d.n, d.r)}
                fill={FAMILY_COLOR[d.n.fam]}
                fillOpacity={d.n.resolved === false ? 0.25 : 0.88}
                stroke={isSel ? '#e8e4dc' : 'rgba(10,10,12,0.9)'}
                strokeWidth={isSel ? 2 : 0.8}
                strokeDasharray={d.n.resolved === false ? '2 2' : undefined}
              />
              {(d.n.sz >= 3 || isSel || hover === d.id) && (
                <text
                  x={0}
                  y={d.r + 11}
                  textAnchor="middle"
                  fontSize="9.5"
                  fill="rgba(240,236,228,0.86)"
                  stroke="rgba(10,10,12,0.7)"
                  strokeWidth="2.4"
                  paintOrder="stroke"
                  pointerEvents="none"
                >
                  {d.n.label}
                </text>
              )}
              <title>{`${d.n.label}${d.n.sub ? ` — ${d.n.sub}` : ''}`}</title>
            </g>
          );
        })}
      </g>

      </g>

      {!simNodes.length && (
        <text x={W / 2} y={H / 2} textAnchor="middle" fill="rgba(232,228,220,0.4)" fontSize="13">
          No entities match these filters.
        </text>
      )}
      </svg>

      <div className="absolute top-2 right-2 flex items-center gap-1.5">
        {(view.k !== 1 || view.tx !== 0 || view.ty !== 0) && (
          <button
            onClick={() => setView({ k: 1, tx: 0, ty: 0 })}
            className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border-light bg-bg/85 text-text-muted hover:text-accent"
          >
            reset view
          </button>
        )}
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-border bg-bg/85 text-text-muted tabular-nums">
          {view.k.toFixed(1)}×
        </span>
      </div>

      <div className="absolute bottom-2 left-2 font-mono text-[10px] text-text-muted bg-bg/80 px-1.5 py-0.5 rounded">
        scroll to zoom · drag to pan
        {focusHops > 0 && selected && hiddenByFocus > 0 && (
          <span className="text-accent">
            {' '}· {hiddenByFocus} entities outside {focusHops} hop{focusHops === 1 ? '' : 's'} hidden
          </span>
        )}
      </div>
    </div>
  );
}
