import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Kicker, PageTitle, Standfirst, Byline, Section, Callout, StatGrid, DataTable, TierChip, Footnote, Prose,
} from '../components/Editorial';
import GeoNetwork, { aggregateStateFlows, type GeoFilter, type GeoMode } from '../components/viz/GeoNetwork';
import { useData } from '../context/DataContext';
import { NODES, EDGES } from '../graph/data';
import { buildNationalGraph } from '../graph/build';
import { TIER_ORDER, type NodeFamily, type StateCode, type GNode, type GEdge } from '../graph/schema';
import { FAMILY_COLOR, FAMILY_LABEL } from '../components/viz/ForceGraph';
import { STATE_NAMES } from '../data/geo';
import { rollupByState } from '../data/companies';

/**
 * The geographic network.
 *
 * The map and the graph as one object, rather than two views that have to be
 * mentally joined. Everything the map cannot honestly show — un-geocoded positions,
 * non-geographic entities, intra-state relationships — is stated on the page rather
 * than quietly handled.
 */

type Layer = 'atlas' | 'capital' | 'all';

const LAYERS: { id: Layer; label: string; note: string }[] = [
  { id: 'atlas', label: 'Case study', note: 'The tiered, sourced subgraph. Small enough that every arc is legible.' },
  { id: 'capital', label: 'Capital', note: 'Conglomerate groups, listed entities, promoters and foreign capital.' },
  { id: 'all', label: 'Everything', note: 'Dense — use the filters, or the state-flow mode.' },
];

const STATE_METRICS: { id: string; label: string; note: string }[] = [
  { id: 'entities', label: 'Entities in graph', note: 'How many entities in the current view are registered in each state.' },
  { id: 'mcap', label: 'Listed market cap', note: 'Recorded market cap of listed companies registered in each state.' },
  { id: 'companies', label: 'Listed companies', note: 'Count of listed companies registered in each state.' },
  { id: 'none', label: 'None', note: 'Plain ground, so the network carries the whole signal.' },
];

export default function GeoGraph() {
  const { nodes: allNodes, edges: allEdges } = useData();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [showTable, setShowTable] = useState(false);

  const setParam = useCallback(
    (k: string, v: string | null) => {
      const next = new URLSearchParams(params);
      if (v == null || v === '') next.delete(k);
      else next.set(k, v);
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const layer = (params.get('layer') ?? 'atlas') as Layer;
  const mode = (params.get('mode') ?? 'entities') as GeoMode;
  const metric = params.get('metric') ?? 'entities';
  const query = params.get('q') ?? '';
  const minAmount = Number(params.get('min') ?? 0);

  const national = useMemo(() => buildNationalGraph(), []);

  const { nodes, edges } = useMemo((): { nodes: GNode[]; edges: GEdge[] } => {
    if (layer === 'atlas') return { nodes: NODES, edges: EDGES };
    if (layer === 'capital') {
      const keep = new Set(national.nodes.filter((n) => n.fam === 'capital').map((n) => n.id));
      return {
        nodes: national.nodes.filter((n) => keep.has(n.id)),
        edges: national.edges.filter((e) => keep.has(e.s) && keep.has(e.t)),
      };
    }
    return { nodes: allNodes, edges: allEdges };
  }, [layer, national, allNodes, allEdges]);

  const families = useMemo(() => [...new Set(nodes.map((n) => n.fam))] as NodeFamily[], [nodes]);
  const preds = useMemo(() => [...new Set(edges.map((e) => e.pred))].sort(), [edges]);

  const listParam = <T extends string>(k: string, fallback: T[]): Set<T> => {
    const raw = params.get(k);
    if (raw == null) return new Set(fallback);
    return new Set(raw.split(',').filter(Boolean) as T[]);
  };
  const tiers = useMemo(() => listParam('tier', TIER_ORDER), [params]);
  const fams = useMemo(() => listParam('fam', families), [params, families]);
  const activePreds = useMemo(() => listParam<string>('pred', []), [params]);

  const toggle = <T extends string>(set: Set<T>, v: T, key: string) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setParam(key, [...next].join(','));
  };

  const filter: GeoFilter = useMemo(
    () => ({ tiers, families: fams, preds: activePreds, query, minAmount }),
    [tiers, fams, activePreds, query, minAmount],
  );

  const stateRollup = useMemo(() => rollupByState(), []);

  const stateWeight = useMemo((): Partial<Record<StateCode, number>> | undefined => {
    if (metric === 'none') return undefined;
    const out: Partial<Record<StateCode, number>> = {};
    if (metric === 'entities') {
      for (const n of nodes) if (n.st) out[n.st] = (out[n.st] ?? 0) + 1;
    } else if (metric === 'mcap') {
      for (const [code, r] of stateRollup) if (r.totalMcapCr) out[code] = r.totalMcapCr;
    } else {
      for (const [code, r] of stateRollup) out[code] = r.count;
    }
    return out;
  }, [metric, nodes, stateRollup]);

  const visibleEdges = useMemo(() => {
    const byId = new Map(nodes.map((n) => [n.id, n]));
    const q = query.trim().toLowerCase();
    return edges.filter((e) => {
      if (!tiers.has(e.tier)) return false;
      if (activePreds.size && !activePreds.has(e.pred)) return false;
      if (minAmount && (e.a ?? 0) < minAmount) return false;
      const s = byId.get(e.s);
      const t = byId.get(e.t);
      if (!s || !t || !fams.has(s.fam) || !fams.has(t.fam)) return false;
      if (q && !`${s.label} ${t.label}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [edges, nodes, tiers, activePreds, minAmount, fams, query]);

  const flows = useMemo(() => aggregateStateFlows(nodes, visibleEdges), [nodes, visibleEdges]);

  const geoNodes = nodes.filter((n) => n.st).length;
  const nonGeo = nodes.length - geoNodes;
  const statesTouched = new Set(nodes.map((n) => n.st).filter(Boolean)).size;
  const byId = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Geographic network · the map and the graph as one object</Kicker>
        <PageTitle>Relationships, drawn in place</PageTitle>
        <Standfirst>
          A force-directed graph tells you who connects to whom and destroys geography. A choropleth tells
          you where things are and destroys the connections. This draws the relationships on real boundary
          geometry — and states, in the three places where that is dishonest, exactly how it is dishonest.
        </Standfirst>
        <Byline>
          {nodes.length} entities · {edges.length} relationships · {statesTouched} of 36 states and UTs
          touched · marks are placed within a state, never geocoded
        </Byline>
      </header>

      <StatGrid
        items={[
          { value: String(geoNodes), label: 'entities with a registered state, placeable on the map' },
          { value: String(nonGeo), label: 'with no location at all — people, rules, parties, sectors', tone: 'muted' },
          { value: String(flows.length), label: 'distinct state-to-state pairs in the current view', tone: 'accent' },
          { value: `${statesTouched}/36`, label: 'states and UTs the graph reaches' },
        ]}
      />

      <Callout label="The three honest problems with drawing a network on a map" tone="bottomline">
        <p>
          <strong>1. Nothing here is geocoded.</strong> A mark sits on a golden-angle spiral inside its
          registered state. Its position within that state carries no information whatsoever — it is a
          packing algorithm, not a location.
        </p>
        <p>
          <strong>2. Most of the graph has no place.</strong> {nonGeo} of {nodes.length} entities in this
          view are people, rules, parties or sectors, which are not geographic. Dropping them would
          silently delete most of the network; scattering them across the map would invent locations they
          do not have. They sit in a labelled side column instead.
        </p>
        <p>
          <strong>3. Registered ≠ operational.</strong> An arc between two states records where two
          registered offices are, not where anything happened. Coal India is Kolkata-registered though the
          coal is in Jharkhand and Chhattisgarh.
        </p>
      </Callout>

      {/* ---- controls ---- */}
      <div className="grid gap-5 lg:grid-cols-[15rem_1fr] mt-8">
        <aside className="space-y-5 lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1">
          <fieldset>
            <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-2">View</legend>
            <div className="flex flex-wrap gap-1.5">
              {(['entities', 'state-flows'] as GeoMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setParam('mode', m)}
                  className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
                    mode === m ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
                  }`}
                >
                  {m === 'entities' ? 'Entities' : 'State flows'}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-2 leading-snug">
              {mode === 'entities'
                ? 'Every entity drawn individually, in its state.'
                : 'Relationships aggregated into arcs between registered states.'}
            </p>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-2">Layer</legend>
            <div className="flex flex-wrap gap-1.5">
              {LAYERS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setParam('layer', l.id)}
                  title={l.note}
                  className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
                    layer === l.id ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-text-muted mt-2 leading-snug">{LAYERS.find((l) => l.id === layer)!.note}</p>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-2">Ground</legend>
            <select value={metric} onChange={(e) => setParam('metric', e.target.value)} className="input-field !py-1.5 !text-[12px]">
              {STATE_METRICS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted mt-2 leading-snug">
              {STATE_METRICS.find((m) => m.id === metric)!.note}
            </p>
          </fieldset>

          <div>
            <label htmlFor="geoq" className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-2">
              Search
            </label>
            <input
              id="geoq"
              value={query}
              onChange={(e) => setParam('q', e.target.value)}
              placeholder="entity name…"
              className="input-field"
            />
          </div>

          <fieldset>
            <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-2">Evidence tier</legend>
            <div className="space-y-1.5">
              {TIER_ORDER.filter((t) => edges.some((e) => e.tier === t)).map((t) => (
                <label key={t} className="flex items-center gap-2.5 cursor-pointer text-[13px]">
                  <input type="checkbox" checked={tiers.has(t)} onChange={() => toggle(tiers, t, 'tier')} className="accent-accent" />
                  <TierChip tier={t} />
                  <span className="ml-auto font-mono text-[10.5px] text-text-muted">
                    {edges.filter((e) => e.tier === t).length}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-2">Family</legend>
            <div className="space-y-1.5">
              {families.map((f) => (
                <label key={f} className="flex items-center gap-2.5 cursor-pointer text-[13px]">
                  <input type="checkbox" checked={fams.has(f)} onChange={() => toggle(fams, f, 'fam')} className="accent-accent" />
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: FAMILY_COLOR[f] }} />
                  <span className="text-text-secondary">{FAMILY_LABEL[f]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-2">
              Relationship {activePreds.size > 0 && <span className="text-accent">({activePreds.size})</span>}
            </legend>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {preds.map((p) => (
                <label key={p} className="flex items-center gap-2.5 cursor-pointer text-[12.5px]">
                  <input
                    type="checkbox"
                    checked={activePreds.has(p)}
                    onChange={() => toggle(activePreds, p, 'pred')}
                    className="accent-accent"
                  />
                  <span className="text-text-secondary">{p}</span>
                </label>
              ))}
            </div>
            {activePreds.size > 0 && (
              <button onClick={() => setParam('pred', null)} className="btn-ghost mt-2 !py-1 !px-2 !text-[11px]">
                clear
              </button>
            )}
          </fieldset>

          {edges.some((e) => (e.a ?? 0) > 0) && (
            <div>
              <label htmlFor="geomin" className="block font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-2">
                Minimum ₹ crore — {minAmount || 'any'}
              </label>
              <input
                id="geomin"
                type="range"
                min={0}
                max={500}
                step={25}
                value={minAmount}
                onChange={(e) => setParam('min', e.target.value === '0' ? null : e.target.value)}
                className="w-full accent-accent"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <button onClick={() => setShowTable((s) => !s)} className="btn-ghost w-full !text-[12px]">
              {showTable ? 'Hide' : 'Show'} table view
            </button>
            {[...params.keys()].length > 0 && (
              <>
                <button
                  onClick={() => navigator.clipboard?.writeText(window.location.href)}
                  className="btn-ghost w-full !text-[12px]"
                >
                  copy link to this view
                </button>
                <button onClick={() => setParams(new URLSearchParams(), { replace: true })} className="btn-ghost w-full !text-[12px]">
                  reset
                </button>
              </>
            )}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="card-surface !p-3 overflow-hidden">
            <GeoNetwork
              nodes={nodes}
              edges={edges}
              filter={filter}
              mode={mode}
              selected={selected}
              onSelect={setSelected}
              stateWeight={stateWeight}
              height={760}
            />
          </div>

          {selected && byId.get(selected) && (
            <div className="card-surface mt-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="heading-editorial font-bold text-xl">{byId.get(selected)!.label}</h3>
                  {byId.get(selected)!.sub && <p className="text-[13px] text-text-muted mt-0.5">{byId.get(selected)!.sub}</p>}
                  <p className="font-mono text-[10.5px] text-text-muted mt-1">
                    {byId.get(selected)!.st ? `registered in ${STATE_NAMES[byId.get(selected)!.st as string]}` : 'no location — non-geographic entity'}
                  </p>
                </div>
                <button onClick={() => setSelected(null)} className="btn-ghost !py-1 !px-2 !text-[11px]">
                  close
                </button>
              </div>
              {byId.get(selected)!.d?.length ? (
                <ul className="mt-4 space-y-2">
                  {byId.get(selected)!.d!.map((f, i) => (
                    <li key={i} className="text-[14px] text-text-secondary leading-relaxed border-l-2 border-border-light pl-3">
                      {f}
                    </li>
                  ))}
                </ul>
              ) : null}
              <ul className="mt-4 space-y-1.5">
                {visibleEdges
                  .filter((e) => e.s === selected || e.t === selected)
                  .slice(0, 14)
                  .map((e, i) => (
                    <li key={i} className="text-[13px] flex flex-wrap items-baseline gap-2">
                      <TierChip tier={e.tier} />
                      <span className="text-text-muted">{e.s === selected ? '→' : '←'}</span>
                      <strong className="text-text">{byId.get(e.s === selected ? e.t : e.s)?.label ?? '?'}</strong>
                      <span className="text-text-muted">{e.pred}</span>
                      {e.a ? <span className="font-mono text-[11.5px] text-accent">₹{e.a.toLocaleString('en-IN')} cr</span> : null}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {showTable && (
        <Section
          title={mode === 'state-flows' ? 'State-flow ledger' : 'Relationship ledger'}
          note="The accessible twin of the graphic — same data, same filters"
        >
          {mode === 'state-flows' ? (
            <DataTable
              columns={['From', 'To', 'Relationships', '₹ cr', 'Predicates']}
              rows={flows.map((f) => [
                <Link key="f" to={`/states/${f.from}`} className="text-text hover:text-accent">
                  {STATE_NAMES[f.from]}
                </Link>,
                <Link key="t" to={`/states/${f.to}`} className="text-text hover:text-accent">
                  {STATE_NAMES[f.to]}
                </Link>,
                String(f.count),
                <span key="a" className="font-mono text-[12px]">
                  {f.amount ? f.amount.toLocaleString('en-IN') : '—'}
                </span>,
                <span key="p" className="text-[12px] text-text-muted">
                  {[...new Set(f.edges.map((e) => e.pred))].join(', ')}
                </span>,
              ])}
            />
          ) : (
            <DataTable
              columns={['From', 'State', 'Relationship', 'To', 'State', 'Tier']}
              rows={visibleEdges.slice(0, 300).map((e, i) => [
                byId.get(e.s)?.label ?? e.s,
                <span key="ss" className="text-[12px] text-text-muted">
                  {byId.get(e.s)?.st ? STATE_NAMES[byId.get(e.s)!.st as string] : '—'}
                </span>,
                <span key="p" className="text-[12.5px]">
                  {e.pred}
                </span>,
                byId.get(e.t)?.label ?? e.t,
                <span key="ts" className="text-[12px] text-text-muted">
                  {byId.get(e.t)?.st ? STATE_NAMES[byId.get(e.t)!.st as string] : '—'}
                </span>,
                <TierChip key={`t${i}`} tier={e.tier} />,
              ])}
            />
          )}
        </Section>
      )}

      <Section title="What the geography does and does not tell you" note="">
        <Prose>
          <p>
            The dominant feature of this map in almost every view is <strong>Delhi</strong> — because
            ministries, central agencies and a large share of PSU registered offices are there. That is an
            artefact of where the Union government sits. It is not a finding about Delhi, and reading a
            concentration of arcs into or out of it as evidence of anything would be the geographic version
            of the hub artefact.
          </p>
          <p>
            The second feature is <strong>Maharashtra</strong>, which carries a large plurality of listed
            corporate headquarters. Any relationship involving a Maharashtra-registered company is
            therefore close to expected, which is exactly why co-location is never drawn as an edge
            anywhere in this platform.{' '}
            <Link to="/patterns" className="underline underline-offset-2">
              The general form of this error
            </Link>
            .
          </p>
        </Prose>
      </Section>

      <Footnote>
        <p>
          <strong>Geometry.</strong> 36 real state and UT boundaries at viewBox 612×696, with anchors at
          the pole of inaccessibility of each state's largest sub-polygon. Arcs are quadratic Béziers that
          always bulge the same way relative to travel direction, so an A→B relationship and a B→A
          relationship separate rather than overprint.
        </p>
        <p>
          <strong>What is excluded, and counted.</strong> In state-flow mode, relationships inside a single
          state cannot be drawn as an arc, and relationships involving a non-geographic entity have no
          endpoint to draw from. Both are excluded from the map and reported in the caption beneath it.
          Nothing is silently dropped.
        </p>
      </Footnote>
    </article>
  );
}
