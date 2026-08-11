import { useMemo, useState } from 'react';
import { TIERS, type GNode, type GEdge, type Predicate, type Tier, type NodeFamily } from '../../graph/schema';
import { FAMILY_COLOR, FAMILY_LABEL } from './ForceGraph';
import { DataTable, TierChip } from '../Editorial';

/**
 * Flow-direction ("Sankey") diagram of monetary edges.
 *
 * Left-to-right position is the order money moved through the graph — never a
 * claim about influence or causation, which is why that line is in the caption,
 * not just a code comment. Band width is proportional to ₹ crore. Evidence tier
 * is carried on the ribbon's stroke-dasharray and on its opacity — semantic, not
 * decorative, and never restyled for looks. Node hue is FAMILY_COLOR, the same
 * palette as the connection graph. No layout dependency is added: the DAG
 * layering, cycle breaking and coordinate assignment below are plain TypeScript.
 */

interface Props {
  nodes: GNode[];
  edges: GEdge[];
  /** Only these predicates are treated as flows. Defaults to monetary ones. */
  flowPreds?: Predicate[];
  height?: number;
  /** Called when a band is clicked, with the edge ids it aggregates. */
  onSelectFlow?: (edges: GEdge[]) => void;
}

const DEFAULT_FLOW_PREDS: Predicate[] = ['bond', 'trust', 'direct', 'pmin', 'pmout', 'csr', 'award'];

const FLOW_PRED_LABEL: Partial<Record<Predicate, string>> = {
  bond: 'Electoral bond',
  trust: 'Electoral trust',
  direct: 'Direct donation',
  pmin: 'Into a fund',
  pmout: 'Out of a fund',
  csr: 'CSR disbursement',
  award: 'Award / contract',
};

const LAYER_MAX = 4; // caps the diagram at 5 columns (0..4); deeper paths collapse into the last one
const W = 960;
const MARGIN_L = 16;
const MARGIN_R = 16;
const NODE_W = 14;
const NODE_GAP = 9;
const PANEL_TOP = 22;
const PANEL_BOTTOM = 30;

/** One rendered band. Parallel edges between the same two entities are summed
 *  into a single band — stacking N near-identical ribbons between the same pair
 *  of boxes reads as noise, not signal — but the underlying GEdge objects are
 *  kept so nothing is lost: onSelectFlow and the table both see all of them. */
interface FlowRecord {
  key: string;
  s: string;
  t: string;
  a: number;
  edges: GEdge[];
  /** Weakest tier among the merged edges — aggregation never overstates confidence. */
  tier: Tier;
}

interface NodeBox {
  id: string;
  layer: number;
  x: number;
  y0: number;
  y1: number;
  value: number;
}

interface RibbonRecord {
  key: string;
  edges: GEdge[];
  tier: Tier;
  a: number;
  x1: number;
  x2: number;
  sy0: number;
  sy1: number;
  ty0: number;
  ty1: number;
  sourceNode: GNode;
  targetNode: GNode;
}

interface SankeyLayout {
  kept: FlowRecord[];
  broken: FlowRecord[];
  nodeBoxes: Map<string, NodeBox>;
  ribbons: RibbonRecord[];
  numLayers: number;
}

/** DFS cycle detector over the flow subgraph. Returns the edges forming one
 *  cycle (not necessarily the shortest), or null if the graph is acyclic. */
function findCycle(records: FlowRecord[]): FlowRecord[] | null {
  const adj = new Map<string, FlowRecord[]>();
  for (const r of records) {
    if (!adj.has(r.s)) adj.set(r.s, []);
    adj.get(r.s)!.push(r);
  }
  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  const pathEdges: FlowRecord[] = [];
  const pathNodes: string[] = [];

  const visit = (u: string): FlowRecord[] | null => {
    color.set(u, GRAY);
    pathNodes.push(u);
    for (const r of adj.get(u) ?? []) {
      const v = r.t;
      const c = color.get(v) ?? WHITE;
      if (c === WHITE) {
        pathEdges.push(r);
        const found = visit(v);
        if (found) return found;
        pathEdges.pop();
      } else if (c === GRAY) {
        const startIdx = pathNodes.indexOf(v);
        return pathEdges.slice(startIdx).concat(r);
      }
    }
    color.set(u, BLACK);
    pathNodes.pop();
    return null;
  };

  for (const r of records) {
    if ((color.get(r.s) ?? WHITE) === WHITE) {
      const found = visit(r.s);
      if (found) return found;
    }
  }
  return null;
}

/** Breaks cycles one at a time, each time removing the lowest-value band in the
 *  cycle found, until the graph is acyclic. Guarded so a pathological input
 *  cannot loop forever. */
function breakCycles(records: FlowRecord[]): { kept: FlowRecord[]; broken: FlowRecord[] } {
  const working = [...records];
  const broken: FlowRecord[] = [];
  const guardMax = records.length + 4;
  for (let i = 0; i < guardMax; i++) {
    const cycle = findCycle(working);
    if (!cycle || !cycle.length) break;
    let minIdx = 0;
    for (let j = 1; j < cycle.length; j++) if (cycle[j].a < cycle[minIdx].a) minIdx = j;
    const victim = cycle[minIdx];
    const pos = working.findIndex((r) => r.key === victim.key);
    if (pos === -1) break;
    working.splice(pos, 1);
    broken.push(victim);
  }
  return { kept: working, broken };
}

/** Longest-path-from-a-source layering over the (now acyclic) flow subgraph,
 *  via Kahn's algorithm so it runs in one pass without recursion. Sources are
 *  nodes with no incoming flow edge. Layers are capped at LAYER_MAX. */
function computeLayers(records: FlowRecord[]): Map<string, number> {
  const nodeIds = new Set<string>();
  for (const r of records) {
    nodeIds.add(r.s);
    nodeIds.add(r.t);
  }
  const adj = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const id of nodeIds) {
    adj.set(id, []);
    indeg.set(id, 0);
  }
  for (const r of records) {
    adj.get(r.s)!.push(r.t);
    indeg.set(r.t, (indeg.get(r.t) ?? 0) + 1);
  }
  const layer = new Map<string, number>();
  for (const id of nodeIds) layer.set(id, 0);
  const work = new Map(indeg);
  const queue: string[] = [...nodeIds].filter((id) => (indeg.get(id) ?? 0) === 0);
  const visited = new Set<string>();
  let qi = 0;
  while (qi < queue.length) {
    const u = queue[qi++];
    visited.add(u);
    for (const v of adj.get(u) ?? []) {
      layer.set(v, Math.max(layer.get(v) ?? 0, (layer.get(u) ?? 0) + 1));
      const d = (work.get(v) ?? 0) - 1;
      work.set(v, d);
      if (d === 0 && !visited.has(v)) queue.push(v);
    }
  }
  // Defensive only: once the graph is acyclic every node is reachable by Kahn's
  // algorithm, but a node this pass never queues is placed at layer 0 rather
  // than silently dropped.
  for (const id of nodeIds) if (!visited.has(id)) layer.set(id, layer.get(id) ?? 0);
  for (const id of nodeIds) layer.set(id, Math.min(layer.get(id) ?? 0, LAYER_MAX));
  return layer;
}

export default function FlowSankey({ nodes, edges, flowPreds, height = 560, onSelectFlow }: Props) {
  const [hoverNode, setHoverNode] = useState<string | null>(null);
  const [hoverRibbon, setHoverRibbon] = useState<string | null>(null);
  const [selectedRibbon, setSelectedRibbon] = useState<string | null>(null);
  const reduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const predSet = useMemo(() => new Set<Predicate>(flowPreds && flowPreds.length ? flowPreds : DEFAULT_FLOW_PREDS), [flowPreds]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  const { withAmount, droppedNoAmount } = useMemo(() => {
    const candidates = edges.filter((e) => predSet.has(e.pred) && byId.has(e.s) && byId.has(e.t));
    const w = candidates.filter((e) => (e.a ?? 0) > 0);
    return { withAmount: w, droppedNoAmount: candidates.length - w.length };
  }, [edges, predSet, byId]);

  const layout: SankeyLayout | null = useMemo(() => {
    if (!withAmount.length) return null;

    // Parallel bands between the same pair collapse into one, summed, at their
    // weakest tier — see FlowRecord doc comment.
    const grouped = new Map<string, GEdge[]>();
    for (const e of withAmount) {
      const key = `${e.s}~${e.t}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(e);
    }
    const records: FlowRecord[] = [...grouped.entries()].map(([key, es]) => {
      const a = es.reduce((acc, e) => acc + (e.a ?? 0), 0);
      const tier = es.reduce<Tier>((worst, e) => (TIERS[e.tier].weight < TIERS[worst].weight ? e.tier : worst), es[0].tier);
      return { key, s: es[0].s, t: es[0].t, a, edges: es, tier };
    });

    const { kept, broken } = breakCycles(records);
    if (!kept.length) {
      return { kept: [], broken, nodeBoxes: new Map(), ribbons: [], numLayers: 0 };
    }

    const layerOf = computeLayers(kept);
    const nodeIds = [...layerOf.keys()];

    const sumIn = new Map<string, number>();
    const sumOut = new Map<string, number>();
    for (const id of nodeIds) {
      sumIn.set(id, 0);
      sumOut.set(id, 0);
    }
    for (const r of kept) {
      sumOut.set(r.s, (sumOut.get(r.s) ?? 0) + r.a);
      sumIn.set(r.t, (sumIn.get(r.t) ?? 0) + r.a);
    }
    const nodeValue = new Map<string, number>();
    for (const id of nodeIds) nodeValue.set(id, Math.max(sumIn.get(id) ?? 0, sumOut.get(id) ?? 0, 1e-6));

    const maxLayerUsed = nodeIds.reduce((m, id) => Math.max(m, layerOf.get(id) ?? 0), 0);
    const numLayers = Math.min(LAYER_MAX, maxLayerUsed) + 1;

    const byLayer = new Map<number, string[]>();
    for (const id of nodeIds) {
      const L = layerOf.get(id) ?? 0;
      if (!byLayer.has(L)) byLayer.set(L, []);
      byLayer.get(L)!.push(id);
    }

    const availableH = Math.max(40, height - PANEL_TOP - PANEL_BOTTOM);
    const innerW = W - MARGIN_L - MARGIN_R - NODE_W;
    const xFor = (L: number) => MARGIN_L + (numLayers <= 1 ? 0 : (L / (numLayers - 1)) * innerW);

    const scaleByLayer = new Map<number, number>();
    const orderIndex = new Map<string, number>();
    const nodeBoxes = new Map<string, NodeBox>();

    for (const [L, ids] of byLayer) {
      // Within a layer, nodes stack by total throughput descending.
      const sorted = [...ids].sort((a, b) => (nodeValue.get(b) ?? 0) - (nodeValue.get(a) ?? 0));
      const totalValue = sorted.reduce((acc, id) => acc + (nodeValue.get(id) ?? 0), 0);
      const totalGap = NODE_GAP * Math.max(0, sorted.length - 1);
      // Each layer gets its own pixel budget so a thin layer isn't squeezed to
      // match a heavy one — the trade-off is that a band's thickness can taper
      // between its two ends. The caption says so.
      const usable = Math.max(10, availableH - totalGap);
      const scale = totalValue > 0 ? usable / totalValue : 0;
      scaleByLayer.set(L, scale);
      let y = PANEL_TOP;
      sorted.forEach((id, idx) => {
        orderIndex.set(id, idx);
        const h = Math.max(2, (nodeValue.get(id) ?? 0) * scale);
        nodeBoxes.set(id, { id, layer: L, x: xFor(L), y0: y, y1: y + h, value: nodeValue.get(id) ?? 0 });
        y += h + NODE_GAP;
      });
    }

    // Stack each node's outgoing and incoming bands independently, ordered by
    // the neighbour's position in its own layer so ribbons cross as little as
    // the layering allows.
    const outByNode = new Map<string, FlowRecord[]>();
    const inByNode = new Map<string, FlowRecord[]>();
    for (const r of kept) {
      if (!outByNode.has(r.s)) outByNode.set(r.s, []);
      outByNode.get(r.s)!.push(r);
      if (!inByNode.has(r.t)) inByNode.set(r.t, []);
      inByNode.get(r.t)!.push(r);
    }
    for (const list of outByNode.values()) list.sort((a, b) => (orderIndex.get(a.t) ?? 0) - (orderIndex.get(b.t) ?? 0));
    for (const list of inByNode.values()) list.sort((a, b) => (orderIndex.get(a.s) ?? 0) - (orderIndex.get(b.s) ?? 0));

    const sOffset = new Map<string, { y0: number; y1: number }>();
    const tOffset = new Map<string, { y0: number; y1: number }>();
    for (const [nodeId, list] of outByNode) {
      const box = nodeBoxes.get(nodeId)!;
      const scale = scaleByLayer.get(box.layer) ?? 0;
      let cursor = box.y0;
      for (const r of list) {
        const h = r.a * scale;
        sOffset.set(r.key, { y0: cursor, y1: cursor + h });
        cursor += h;
      }
    }
    for (const [nodeId, list] of inByNode) {
      const box = nodeBoxes.get(nodeId)!;
      const scale = scaleByLayer.get(box.layer) ?? 0;
      let cursor = box.y0;
      for (const r of list) {
        const h = r.a * scale;
        tOffset.set(r.key, { y0: cursor, y1: cursor + h });
        cursor += h;
      }
    }

    const ribbons: RibbonRecord[] = kept.map((r) => {
      const sBox = nodeBoxes.get(r.s)!;
      const tBox = nodeBoxes.get(r.t)!;
      const so = sOffset.get(r.key) ?? { y0: sBox.y0, y1: sBox.y0 };
      const to = tOffset.get(r.key) ?? { y0: tBox.y0, y1: tBox.y0 };
      return {
        key: r.key,
        edges: r.edges,
        tier: r.tier,
        a: r.a,
        x1: sBox.x + NODE_W,
        x2: tBox.x,
        sy0: so.y0,
        sy1: so.y1,
        ty0: to.y0,
        ty1: to.y1,
        sourceNode: byId.get(r.s)!,
        targetNode: byId.get(r.t)!,
      };
    });

    return { kept, broken, nodeBoxes, ribbons, numLayers };
  }, [withAmount, byId, height]);

  const activeRibbonKey = hoverRibbon ?? selectedRibbon;
  const highlighted = useMemo(() => {
    if (!layout) return null;
    if (activeRibbonKey) {
      const rb = layout.ribbons.find((r) => r.key === activeRibbonKey);
      if (!rb) return null;
      return { nodes: new Set([rb.sourceNode.id, rb.targetNode.id]), ribbons: new Set([rb.key]) };
    }
    if (hoverNode) {
      const related = layout.ribbons.filter((r) => r.sourceNode.id === hoverNode || r.targetNode.id === hoverNode);
      return { nodes: new Set([hoverNode]), ribbons: new Set(related.map((r) => r.key)) };
    }
    return null;
  }, [layout, activeRibbonKey, hoverNode]);

  const totalValue = layout ? layout.kept.reduce((acc, r) => acc + r.a, 0) : 0;
  const cyclesBroken = layout?.broken.length ?? 0;
  const totalCandidateEdges = withAmount.length + droppedNoAmount;

  const familiesPresent = useMemo(() => {
    if (!layout) return [] as NodeFamily[];
    const s = new Set<NodeFamily>();
    for (const box of layout.nodeBoxes.values()) s.add(byId.get(box.id)?.fam ?? 'market');
    return [...s];
  }, [layout, byId]);

  const tiersPresent = useMemo(() => {
    if (!layout) return [] as Tier[];
    return [...new Set(layout.kept.map((r) => r.tier))];
  }, [layout]);

  const predLabelSet = (edgesInBand: GEdge[]) =>
    [...new Set(edgesInBand.map((e) => e.pred))].map((p) => FLOW_PRED_LABEL[p] ?? p).join(', ');

  const flowPredList = flowPreds && flowPreds.length ? flowPreds : DEFAULT_FLOW_PREDS;

  const caption = (
    <p className="font-mono text-[10.5px] text-text-muted leading-relaxed max-w-[70ch]">
      Left-to-right position encodes the order money moved through — not influence or causation. Band
      width is ₹ crore; dash style and opacity carry the evidence tier and are never restyled for looks.
      Each layer is scaled to its own pixel budget, so a band's width can taper between its two ends —
      that is a layout choice, not a change in the underlying amount. Parallel relationships between the
      same two entities are summed into one band, shown at their weakest tier.{' '}
      {layout ? (
        <>
          {layout.kept.length} band{layout.kept.length === 1 ? '' : 's'} shown, ₹{Math.round(totalValue).toLocaleString('en-IN')} cr
          total across {layout.numLayers} layer{layout.numLayers === 1 ? '' : 's'}, aggregating{' '}
          {withAmount.length} of {totalCandidateEdges} candidate relationship{totalCandidateEdges === 1 ? '' : 's'}.
        </>
      ) : (
        <>0 of {totalCandidateEdges} candidate relationships carried a ₹ amount.</>
      )}{' '}
      {droppedNoAmount > 0 &&
        `${droppedNoAmount} relationship${droppedNoAmount === 1 ? '' : 's'} matching ${flowPredList.join(', ')} dropped for carrying no ₹ amount. `}
      {cyclesBroken > 0 &&
        `${cyclesBroken} cycle${cyclesBroken === 1 ? '' : 's'} broken at the lowest-value band to keep the diagram left-to-right.`}
    </p>
  );

  if (!layout || !layout.kept.length) {
    return (
      <div className="card-surface p-6">
        <p className="text-[14px] text-text-secondary">
          No flow-typed relationship among {flowPredList.map((p) => FLOW_PRED_LABEL[p] ?? p).join(', ')} carries a ₹ amount in this
          dataset. Nothing to draw.
        </p>
        <div className="mt-3">{caption}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2">{caption}</div>

      <svg
        viewBox={`0 0 ${W} ${height}`}
        style={{ width: '100%', height }}
        role="img"
        aria-label={`Flow diagram: ${layout.kept.length} monetary bands totaling ₹${Math.round(totalValue).toLocaleString(
          'en-IN',
        )} crore across ${layout.numLayers} layers, left to right. A table view of the same data is available below.`}
      >
        <g>
          {layout.ribbons.map((rb) => {
            const meta = TIERS[rb.tier];
            const cx = (rb.x1 + rb.x2) / 2;
            const d = `M ${rb.x1} ${rb.sy0} C ${cx} ${rb.sy0} ${cx} ${rb.ty0} ${rb.x2} ${rb.ty0} L ${rb.x2} ${rb.ty1} C ${cx} ${rb.ty1} ${cx} ${rb.sy1} ${rb.x1} ${rb.sy1} Z`;
            const color = FAMILY_COLOR[rb.sourceNode.fam];
            const dim = highlighted ? !highlighted.ribbons.has(rb.key) : false;
            const isSel = selectedRibbon === rb.key;
            return (
              <path
                key={rb.key}
                d={d}
                fill={color}
                fillOpacity={dim ? 0.05 : 0.1 + meta.weight * 0.22}
                stroke={isSel ? 'var(--color-accent,#c9a86c)' : color}
                strokeOpacity={dim ? 0.12 : isSel ? 0.95 : 0.55}
                strokeWidth={isSel ? 1.6 : 1}
                strokeDasharray={meta.dash || undefined}
                style={{ cursor: 'pointer', ...(reduced ? {} : { transition: 'fill-opacity .15s ease, stroke-opacity .15s ease' }) }}
                tabIndex={0}
                role="button"
                aria-label={`${rb.sourceNode.label} to ${rb.targetNode.label}, ₹${Math.round(rb.a).toLocaleString('en-IN')} crore, ${meta.label} tier, ${predLabelSet(rb.edges)}${rb.edges.length > 1 ? `, ${rb.edges.length} relationships merged` : ''}`}
                onMouseEnter={() => setHoverRibbon(rb.key)}
                onMouseLeave={() => setHoverRibbon(null)}
                onFocus={() => setHoverRibbon(rb.key)}
                onBlur={() => setHoverRibbon(null)}
                onClick={() => {
                  setSelectedRibbon((k) => (k === rb.key ? null : rb.key));
                  onSelectFlow?.(rb.edges);
                }}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter' || ev.key === ' ') {
                    ev.preventDefault();
                    setSelectedRibbon((k) => (k === rb.key ? null : rb.key));
                    onSelectFlow?.(rb.edges);
                  }
                }}
              >
                <title>
                  {`${rb.sourceNode.label} → ${rb.targetNode.label} · ₹${Math.round(rb.a).toLocaleString('en-IN')} cr · ${predLabelSet(
                    rb.edges,
                  )} · ${meta.label} tier${rb.edges.length > 1 ? ` · ${rb.edges.length} relationships merged` : ''}`}
                </title>
              </path>
            );
          })}
        </g>

        <g>
          {[...layout.nodeBoxes.values()].map((box) => {
            const n = byId.get(box.id);
            if (!n) return null;
            const isLast = box.layer === layout.numLayers - 1;
            const h = Math.max(1, box.y1 - box.y0);
            const showLabel = h >= 8;
            const dim = highlighted ? !highlighted.nodes.has(box.id) : false;
            return (
              <g
                key={box.id}
                opacity={dim ? 0.32 : 1}
                style={reduced ? undefined : { transition: 'opacity .15s ease' }}
                tabIndex={0}
                role="button"
                aria-label={`${n.label}${n.sub ? `, ${n.sub}` : ''}, throughput ₹${Math.round(box.value).toLocaleString('en-IN')} crore`}
                onMouseEnter={() => setHoverNode(box.id)}
                onMouseLeave={() => setHoverNode(null)}
                onFocus={() => setHoverNode(box.id)}
                onBlur={() => setHoverNode(null)}
              >
                <rect
                  x={box.x}
                  y={box.y0}
                  width={NODE_W}
                  height={h}
                  rx={1.5}
                  fill={FAMILY_COLOR[n.fam]}
                  fillOpacity={n.resolved === false ? 0.3 : 0.92}
                  stroke="rgba(10,10,12,0.85)"
                  strokeWidth={0.8}
                  strokeDasharray={n.resolved === false ? '2 2' : undefined}
                />
                {showLabel && (
                  <text
                    x={isLast ? box.x - 6 : box.x + NODE_W + 6}
                    y={(box.y0 + box.y1) / 2}
                    dominantBaseline="central"
                    textAnchor={isLast ? 'end' : 'start'}
                    fontSize={9.5}
                    fill="var(--color-text,#e8e4dc)"
                    stroke="var(--color-bg,#0a0a0c)"
                    strokeWidth={2.2}
                    paintOrder="stroke"
                  >
                    {n.label}
                  </text>
                )}
                <title>{`${n.label}${n.sub ? ` — ${n.sub}` : ''} · throughput ₹${Math.round(box.value).toLocaleString('en-IN')} cr`}</title>
              </g>
            );
          })}
        </g>
      </svg>

      {/* legend — every encoding used above has an entry here */}
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-text-muted">
        <span className="uppercase tracking-wider">family</span>
        {familiesPresent.map((f) => (
          <span key={f} className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: FAMILY_COLOR[f] }} />
            {FAMILY_LABEL[f]}
          </span>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-text-muted">
        <span className="uppercase tracking-wider">evidence tier</span>
        {tiersPresent.map((t) => (
          <span key={t} className="flex items-center gap-1.5">
            <svg width="22" height="10" aria-hidden className="flex-shrink-0">
              <line
                x1="1"
                y1="5"
                x2="21"
                y2="5"
                stroke="currentColor"
                className="text-text-secondary"
                strokeWidth="1.6"
                strokeDasharray={TIERS[t].dash || undefined}
              />
            </svg>
            {TIERS[t].label}
          </span>
        ))}
        <span className="italic">band opacity also drops for weaker tiers · width = ₹ crore, not significance</span>
      </div>

      {/* accessible twin */}
      <div className="mt-6">
        <DataTable
          caption={`Table view — accessible twin of the flow diagram above. ${layout.kept.length} monetary bands, ₹${Math.round(
            totalValue,
          ).toLocaleString('en-IN')} cr total.`}
          columns={['Source', 'Target', '₹ cr', 'Tier', 'Source URL']}
          rows={[...layout.kept]
            .sort((a, b) => b.a - a.a)
            .map((r) => {
              const firstSrc = r.edges.find((e) => e.srcs?.length)?.srcs?.[0];
              return [
                byId.get(r.s)?.label ?? r.s,
                byId.get(r.t)?.label ?? r.t,
                Math.round(r.a).toLocaleString('en-IN'),
                <span key="t" className="flex items-center gap-1.5">
                  <TierChip tier={r.tier} />
                  {r.edges.length > 1 && (
                    <span className="font-mono text-[10px] text-text-muted">({r.edges.length} merged)</span>
                  )}
                </span>,
                firstSrc ? (
                  <a key="s" href={firstSrc[1]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-[12px]">
                    {firstSrc[0]}
                  </a>
                ) : (
                  <span key="s" className="text-[12px] text-text-muted">
                    {TIERS[r.tier].label.toLowerCase()} — no source by design
                  </span>
                ),
              ];
            })}
        />
      </div>
    </div>
  );
}
