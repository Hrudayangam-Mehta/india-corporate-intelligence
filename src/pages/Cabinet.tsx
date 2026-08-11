import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Kicker, PageTitle, Standfirst, Byline, Section, Callout, StatGrid, DataTable, Footnote, Prose,
} from '../components/Editorial';
import IndiaMap, { type MapMark } from '../components/viz/IndiaMap';
import GraphExplorer from '../components/viz/GraphExplorer';
import {
  MINISTERS, RANK_LABEL, RANK_ORDER, CABINET_AS_OF, CABINET_CHANGES, CABINET_GAPS,
  CABINET_SOURCES, ministersByState, partyTally, rankTally, economicPortfolioLabels,
  type MinisterRank,
} from '../data/politics';
import { buildNationalGraph } from '../graph/build';
import { STATE_NAMES } from '../data/geo';
import type { StateCode } from '../graph/schema';

/**
 * The Cabinet Graph.
 *
 * Roster data, portfolios with dates, and the ministry→sector map of regulatory
 * reach. Nothing on this page is an allegation. Regulatory reach is an
 * allocation-of-business fact about the constitution, not a claim about any
 * individual — the page says so where the reach graph appears.
 */

export default function Cabinet() {
  const [rank, setRank] = useState<MinisterRank | 'all'>('cabinet');
  const [state, setState] = useState<StateCode | null>(null);

  const byState = useMemo(() => ministersByState(), []);
  const parties = useMemo(() => partyTally(), []);
  const ranks = useMemo(() => rankTally(), []);

  const shown = useMemo(
    () =>
      MINISTERS.filter((m) => (rank === 'all' || m.rank === rank) && (!state || m.stateCode === state)).sort(
        (a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank) || a.name.localeCompare(b.name),
      ),
    [rank, state],
  );

  const mapData = useMemo(() => {
    const d: Partial<Record<StateCode, { value: number | null; detail?: string }>> = {};
    for (const [code, list] of byState) {
      const cab = list.filter((m) => m.rank === 'cabinet' || m.rank === 'pm').length;
      d[code] = {
        value: list.length,
        detail: `${cab} cabinet rank · ${list.length - cab} minister${list.length - cab === 1 ? '' : 's'} of state`,
      };
    }
    return d;
  }, [byState]);

  const marks: MapMark[] = useMemo(
    () =>
      MINISTERS.filter((m) => m.rank === 'pm' || m.rank === 'cabinet').map((m) => ({
        id: m.id,
        label: `${m.name} — ${m.portfolios[0]}`,
        state: m.stateCode,
        weight: m.rank === 'pm' ? 400000 : 90000,
        kind: 'person',
      })),
    [],
  );

  // Political subgraph only: ministers, ministries, sectors they regulate.
  const politicalGraph = useMemo(() => {
    const g = buildNationalGraph();
    const keep = new Set(g.nodes.filter((n) => n.fam === 'state' || n.fam === 'market').map((n) => n.id));
    return {
      nodes: g.nodes.filter((n) => keep.has(n.id)),
      edges: g.edges.filter((e) => keep.has(e.s) && keep.has(e.t)),
    };
  }, []);

  const statesRepresented = byState.size;
  const withEconomicPortfolio = MINISTERS.filter((m) => economicPortfolioLabels(m).length > 0).length;

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Political layer · roster data, factual and neutral</Kicker>
        <PageTitle>The Union Council of Ministers</PageTitle>
        <Standfirst>
          Every minister, every portfolio, every seat — with the dates. Dates are not decoration here: the
          date test is the first and cheapest falsifier this platform runs, and it can only run if the
          tenure windows exist. Four of seven allegations in the reference audit collapsed on dates alone.
        </Standfirst>
        <Byline>
          As of {CABINET_AS_OF} · cross-checked against the official portfolio allocation and the
          parliamentary member directories · every minister carries at least one source
        </Byline>
      </header>

      <StatGrid
        items={[
          { value: String(MINISTERS.length), label: 'ministers in the council' },
          { value: String(ranks.find((r) => r.rank === 'cabinet')?.count ?? 0), label: 'of cabinet rank' },
          { value: String(statesRepresented), label: 'states and UTs represented' },
          { value: String(withEconomicPortfolio), label: 'holding a portfolio with direct economic reach', tone: 'sage' },
        ]}
      />

      <Callout label="What this page is not" tone="note">
        <p>
          This is roster data: names, seats, dates, parties, portfolios. It contains no allegations and no
          asset claims. Where the graph below draws a ministry to a sector, that edge records{' '}
          <strong>regulatory reach</strong> — which ministry has policy responsibility for which sector
          under the Allocation of Business Rules. It is a fact about the constitution, not a claim about
          any individual, and it is deliberately never drawn from a person to a company.
        </p>
      </Callout>

      <Section title="Where the council sits" note="Shaded by number of ministers whose seat is in that state; marks are cabinet-rank ministers">
        <IndiaMap
          data={mapData}
          marks={marks}
          metricLabel="Ministers by seat"
          unit="ministers"
          scaleMode="quantile"
          selected={state}
          onSelect={setState}
          height={560}
          format={(v) => String(Math.round(v))}
        />
        {state && (
          <div className="card-surface p-4 mt-4">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="heading-editorial font-bold text-lg">{STATE_NAMES[state]}</h3>
              <div className="flex gap-2">
                <Link to={`/states/${state}`} className="btn-ghost !py-1 !px-2.5 !text-[11px]">
                  state profile →
                </Link>
                <button onClick={() => setState(null)} className="btn-ghost !py-1 !px-2.5 !text-[11px]">
                  clear
                </button>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {(byState.get(state) ?? []).map((m) => (
                <li key={m.id} className="text-[14px]">
                  <strong className="text-text">{m.name}</strong>{' '}
                  <span className="text-text-muted">— {RANK_LABEL[m.rank]}, {m.party}</span>
                  <span className="block text-[13px] text-text-secondary">{m.portfolios.join('; ')}</span>
                  <span className="block font-mono text-[10.5px] text-text-muted">
                    {m.house}{m.constituency ? ` · ${m.constituency}` : ' · no territorial constituency'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section
        title="Ministers, ministries, and regulatory reach"
        note="Filter by tier, family and relationship. The table view is the accessible twin."
      >
        <GraphExplorer nodes={politicalGraph.nodes} edges={politicalGraph.edges} height={620} />
      </Section>

      <Section title="The roster" note="Filter by rank; every row carries its sources">
        <div className="flex flex-wrap gap-2 mb-4">
          {(['all', ...RANK_ORDER] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRank(r as MinisterRank | 'all')}
              className={`font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded border transition-colors ${
                rank === r ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
              }`}
            >
              {r === 'all' ? `All (${MINISTERS.length})` : `${RANK_LABEL[r as MinisterRank]} (${ranks.find((x) => x.rank === r)?.count ?? 0})`}
            </button>
          ))}
        </div>

        <DataTable
          columns={['Minister', 'Portfolios', 'Seat', 'Party', 'Economic reach']}
          rows={shown.map((m) => [
            <span key="n">
              <strong className="text-text">{m.name}</strong>
              <span className="block font-mono text-[10px] text-text-muted uppercase tracking-wider">
                {RANK_LABEL[m.rank]}
              </span>
            </span>,
            <span key="p" className="text-[13.5px]">
              {m.portfolios.join('; ')}
              {m.notes && <span className="block text-[12px] text-text-muted mt-1 italic">{m.notes}</span>}
            </span>,
            <span key="s" className="text-[13px]">
              {m.constituency ?? '—'}
              <span className="block text-[11.5px] text-text-muted">
                {m.state} · {m.house}
              </span>
            </span>,
            <span key="pa" className="font-mono text-[11.5px]">
              {m.party}
            </span>,
            <span key="e" className="text-[12px] text-teal">
              {economicPortfolioLabels(m).join(', ') || '—'}
            </span>,
          ])}
        />
      </Section>

      <Section title="Party composition" note="Of the council as constituted on the as-of date">
        <div className="grid gap-2 sm:grid-cols-2">
          {parties.map((p) => (
            <div key={p.party} className="flex items-center gap-3">
              <span className="font-mono text-[11px] w-20 text-text-muted">{p.party}</span>
              <span
                className="h-4 bg-accent/60 rounded-sm"
                style={{ width: `${(p.count / parties[0].count) * 68}%`, minWidth: '6px' }}
              />
              <span className="font-mono text-[11px] text-text-secondary">{p.count}</span>
            </div>
          ))}
        </div>
      </Section>

      {CABINET_CHANGES.length > 0 && (
        <Section title="Changes since the ministry was formed" note="Supersession, not deletion — departures are recorded, never quietly dropped">
          <DataTable
            columns={['Date', 'Change', 'Source']}
            rows={CABINET_CHANGES.map((c) => [
              <span key="d" className="font-mono text-[11.5px] whitespace-nowrap">
                {c.date}
              </span>,
              c.change,
              <a
                key="s"
                href={c.src[1]}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 text-[12px]"
              >
                {c.src[0]}
              </a>,
            ])}
          />
        </Section>
      )}

      <Section title="Known gaps" note="Recorded rather than smoothed over — absence is data">
        <Prose>
          <ul className="space-y-2.5 list-none pl-0">
            {CABINET_GAPS.map((g, i) => (
              <li key={i} className="border-l-2 border-amber/40 pl-3 text-[14px]">
                {g}
              </li>
            ))}
          </ul>
        </Prose>
      </Section>

      <Footnote>
        <p>
          <strong>Sourcing.</strong>{' '}
          {CABINET_SOURCES.map(([l, u], i) => (
            <span key={i}>
              {i > 0 && ' · '}
              <a href={u} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                {l}
              </a>
            </span>
          ))}
        </p>
        <p>
          <strong>Standing.</strong> Roster data about public office-holders, drawn from official records.
          No allegation, asset claim or proceeding is asserted on this page about any individual.
        </p>
      </Footnote>
    </article>
  );
}
