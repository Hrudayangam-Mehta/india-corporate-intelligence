import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Kicker, PageTitle, Standfirst, Section, Callout, StatGrid, Footnote } from '../components/Editorial';
import GraphExplorer from '../components/viz/GraphExplorer';
import { NODES, EDGES } from '../graph/data';
import { buildNationalGraph } from '../graph/build';
import { medianDegreeSeparation, pathLengthProfile } from '../graph/nullModel';
import type { GNode, GEdge } from '../graph/schema';

/**
 * The unified connection graph.
 *
 * Merges the case-study subgraph with the derived national layers. The path finder
 * deliberately reports the median separation alongside any specific path it finds —
 * "only three hops from the minister" describes the network, not the relationship.
 */

type Layer = 'all' | 'atlas' | 'political' | 'capital';

const LAYERS: { id: Layer; label: string; note: string }[] = [
  { id: 'all', label: 'Everything', note: 'Case study plus the national political and capital layers.' },
  { id: 'atlas', label: 'Case study', note: 'The Money-Trail Atlas subgraph — tiered, sourced, allegation-bearing.' },
  { id: 'political', label: 'Political', note: 'Ministers, ministries and regulatory reach. Roster facts only.' },
  { id: 'capital', label: 'Capital', note: 'Conglomerate groups, listed entities, promoters and foreign partners.' },
];

export default function NetworkView() {
  const [layer, setLayer] = useState<Layer>('all');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const national = useMemo(() => buildNationalGraph(), []);

  const { nodes, edges } = useMemo((): { nodes: GNode[]; edges: GEdge[] } => {
    if (layer === 'atlas') return { nodes: NODES, edges: EDGES };
    if (layer === 'political') {
      const keep = new Set(national.nodes.filter((n) => n.fam === 'state' || n.fam === 'market').map((n) => n.id));
      return {
        nodes: national.nodes.filter((n) => keep.has(n.id)),
        edges: national.edges.filter((e) => keep.has(e.s) && keep.has(e.t)),
      };
    }
    if (layer === 'capital') {
      const keep = new Set(national.nodes.filter((n) => n.fam === 'capital' || n.fam === 'market').map((n) => n.id));
      return {
        nodes: national.nodes.filter((n) => keep.has(n.id)),
        edges: national.edges.filter((e) => keep.has(e.s) && keep.has(e.t)),
      };
    }
    return { nodes: [...NODES, ...national.nodes], edges: [...EDGES, ...national.edges] };
  }, [layer, national]);

  const raw = useMemo(() => edges.map((e) => ({ s: e.s, t: e.t, pred: e.pred })), [edges]);
  const byLabel = useMemo(() => new Map(nodes.map((n) => [n.label.toLowerCase(), n.id])), [nodes]);

  const median = useMemo(() => {
    const seeds = nodes.slice(0, 6).map((n) => n.id);
    return medianDegreeSeparation(raw, seeds);
  }, [raw, nodes]);

  const pathResult = useMemo(() => {
    const a = byLabel.get(from.trim().toLowerCase());
    const b = byLabel.get(to.trim().toLowerCase());
    if (!a || !b) return null;
    const dist = pathLengthProfile(raw, a);
    return { hops: dist.get(b) ?? null, reachable: dist.size };
  }, [from, to, byLabel, raw]);

  const degrees = useMemo(() => {
    const d = new Map<string, number>();
    for (const e of edges) {
      d.set(e.s, (d.get(e.s) ?? 0) + 1);
      d.set(e.t, (d.get(e.t) ?? 0) + 1);
    }
    return [...d.entries()]
      .map(([id, deg]) => ({ id, deg, label: nodes.find((n) => n.id === id)?.label ?? id }))
      .sort((a, b) => b.deg - a.deg)
      .slice(0, 8);
  }, [edges, nodes]);

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Connection graph</Kicker>
        <PageTitle>Everything, and how it connects</PageTitle>
        <Standfirst>
          The case study merged with the national political and capital layers. Filter by evidence tier,
          entity family, and relationship type. The table view carries the same data for screen readers and
          for anyone who would rather read than squint.
        </Standfirst>
      </header>

      <StatGrid
        items={[
          { value: String(nodes.length), label: 'entities in view' },
          { value: String(edges.length), label: 'relationships in view' },
          { value: `${median} hops`, label: 'median separation between entities — the baseline any "short path" must beat', tone: 'muted' },
          { value: String(degrees[0]?.deg ?? 0), label: `highest degree (${degrees[0]?.label ?? '—'}) — expected, not a finding`, tone: 'muted' },
        ]}
      />

      <Callout label="Read the hub and the short path correctly" tone="note">
        <p>
          The highest-degree node in this graph is <strong>{degrees[0]?.label ?? '—'}</strong>, with{' '}
          {degrees[0]?.deg ?? 0} connections. That is what large, well-documented entities look like in any
          network built this way — hubs are compulsory in preferential-attachment structures, and centrality
          on its own is a statement about size, not about coordination.
        </p>
        <p>
          Likewise, the median separation here is <strong>{median} hops</strong>. Any specific path you find
          has to be read against that baseline: "only three hops from the minister" is a description of the
          network's density, not a relationship.{' '}
          <Link to="/patterns" className="underline underline-offset-2">
            Why this matters
          </Link>
          .
        </p>
      </Callout>

      <Section title="" note="">
        <div className="flex flex-wrap gap-2 mb-2">
          {LAYERS.map((l) => (
            <button
              key={l.id}
              onClick={() => setLayer(l.id)}
              title={l.note}
              className={`font-mono text-[11px] px-3 py-1.5 rounded border transition-colors ${
                layer === l.id ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-[12.5px] text-text-muted mb-5">{LAYERS.find((l) => l.id === layer)!.note}</p>

        <GraphExplorer nodes={nodes} edges={edges} height={700} />
      </Section>

      <Section title="Path finder" note="Reports the hop count against the graph's median separation, never alone">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label htmlFor="pf-from" className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-1.5">
              From (exact entity name)
            </label>
            <input id="pf-from" value={from} onChange={(e) => setFrom(e.target.value)} className="input-field !w-56" placeholder="e.g. Coal & Mines Ministry" />
          </div>
          <div>
            <label htmlFor="pf-to" className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-1.5">
              To
            </label>
            <input id="pf-to" value={to} onChange={(e) => setTo(e.target.value)} className="input-field !w-56" placeholder="e.g. PM CARES" />
          </div>
        </div>
        {from && to && (
          <div className="mt-4 card-surface p-4">
            {pathResult == null ? (
              <p className="text-[14px] text-text-muted">
                One or both names do not match an entity exactly. Names are matched literally — that is
                deliberate, because fuzzy matching is how unrelated entities get fused.
              </p>
            ) : pathResult.hops == null ? (
              <p className="text-[14px] text-text-secondary">
                No path exists between these two entities in the current layer. Disconnection is a finding
                too, and is reported rather than hidden.
              </p>
            ) : (
              <>
                <p className="font-mono text-2xl text-accent">{pathResult.hops} hops</p>
                <p className="text-[13.5px] text-text-secondary mt-1.5 max-w-[64ch]">
                  Against a median separation of <strong>{median} hops</strong> across this graph, and{' '}
                  {pathResult.reachable} entities reachable from the origin.{' '}
                  {pathResult.hops <= median
                    ? 'This path is at or below the typical distance — which means it is unremarkable on its own.'
                    : 'This path is longer than typical, which makes it less notable, not more.'}
                </p>
              </>
            )}
          </div>
        )}
      </Section>

      <Section title="Highest-degree entities" note="Sorted by connection count. Read as a size measure, not an influence measure.">
        <div className="space-y-2">
          {degrees.map((d) => (
            <div key={d.id} className="flex items-center gap-3">
              <span className="text-[13px] w-52 truncate text-text-secondary">{d.label}</span>
              <span className="h-3.5 bg-accent/50 rounded-sm" style={{ width: `${(d.deg / degrees[0].deg) * 55}%` }} />
              <span className="font-mono text-[11px] text-text-muted">{d.deg}</span>
            </div>
          ))}
        </div>
      </Section>

      <Footnote>
        <p>
          <strong>Standing.</strong> The political and capital layers contain roster and ownership facts
          only. Allegation-bearing edges exist solely in the case-study layer, are tiered, and are paired
          with denials. No edge anywhere in this graph is drawn between a person and a company on the basis
          of shared state or shared sector.
        </p>
      </Footnote>
    </article>
  );
}
