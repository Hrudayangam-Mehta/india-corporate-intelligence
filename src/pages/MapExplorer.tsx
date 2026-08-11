import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Kicker, PageTitle, Standfirst, Byline, Section, Callout, StatGrid, DataTable, Footnote } from '../components/Editorial';
import IndiaMap, { type MapMark, type ScaleMode } from '../components/viz/IndiaMap';
import {
  COMPANIES, COMPANIES_AS_OF, COMPANY_SOURCES, COMPANY_GAPS, STATES_WITH_NO_LISTED_HQ,
  ECONOMY_BY_STATE, rollupByState, sectorTotals, hhi, type Company,
} from '../data/companies';
import { STATES, STATE_NAMES } from '../data/geo';
import { ministersByState } from '../data/politics';
import type { StateCode } from '../graph/schema';

/**
 * The NSE/BSE map.
 *
 * Real 36-state geometry, quantile choropleth by default (Indian state market cap
 * is extremely heavy-tailed — a linear ramp renders thirty states identical), and
 * an explicit no-data hatch so a grey state reads as "not measured", never "zero".
 */

type Metric = 'mcap' | 'count' | 'psu' | 'gsdp' | 'hhi';
type Exchange = 'both' | 'NSE' | 'BSE';

const METRICS: { id: Metric; label: string; unit: string; note: string }[] = [
  { id: 'mcap', label: 'Listed market cap', unit: '₹ cr', note: 'Sum of recorded market caps of companies registered in the state.' },
  { id: 'count', label: 'Listed companies', unit: 'companies', note: 'Count of companies in the dataset registered in the state.' },
  { id: 'psu', label: 'Public-sector share', unit: '%', note: 'Share of the state’s listed companies that are central or state PSUs.' },
  { id: 'gsdp', label: 'State GSDP', unit: '₹ cr', note: 'Gross state domestic product, where a verifiable figure exists.' },
  { id: 'hhi', label: 'Sector concentration', unit: 'HHI', note: 'Herfindahl–Hirschman index over sector market cap within the state. A structural measure, not an allegation.' },
];

const fmtCr = (v: number) => (v >= 100000 ? `${(v / 100000).toFixed(2)} lakh cr` : `${Math.round(v).toLocaleString('en-IN')} cr`);

export default function MapExplorer() {
  const [metric, setMetric] = useState<Metric>('mcap');
  const [exchange, setExchange] = useState<Exchange>('both');
  const [sector, setSector] = useState<string>('all');
  const [scaleMode, setScaleMode] = useState<ScaleMode>('quantile');
  const [selected, setSelected] = useState<StateCode | null>(null);
  const [showMarks, setShowMarks] = useState(true);

  const sectors = useMemo(() => sectorTotals().map((s) => s.sector), []);

  const filtered = useMemo(
    () =>
      COMPANIES.filter(
        (c) =>
          (exchange === 'both' || (exchange === 'NSE' ? !!c.nse : !!c.bse)) &&
          (sector === 'all' || c.sector === sector),
      ),
    [exchange, sector],
  );

  const rollup = useMemo(() => rollupByState(filtered), [filtered]);
  const ministers = useMemo(() => ministersByState(), []);

  const mapData = useMemo(() => {
    const d: Partial<Record<StateCode, { value: number | null; detail?: string }>> = {};
    for (const s of STATES) {
      const r = rollup.get(s.id);
      const econ = ECONOMY_BY_STATE.get(s.id);
      let value: number | null = null;
      if (metric === 'gsdp') value = econ?.gsdpCr ?? null;
      else if (!r) value = null;
      else if (metric === 'mcap') value = r.totalMcapCr || null;
      else if (metric === 'count') value = r.count;
      else if (metric === 'psu') value = r.count ? Math.round((r.psuCount / r.count) * 100) : null;
      else if (metric === 'hhi') value = r.topSectors.length ? Math.round(hhi(r.topSectors.map((t) => t.mcapCr))) : null;

      const bits: string[] = [];
      if (r) bits.push(`${r.count} listed · ${r.nseCount} NSE · ${r.bseCount} BSE`);
      if (r?.mcapGaps) bits.push(`${r.mcapGaps} without a recorded market cap`);
      const mins = ministers.get(s.id)?.length ?? 0;
      if (mins) bits.push(`${mins} union minister${mins === 1 ? '' : 's'}`);
      d[s.id] = { value, detail: bits.join(' · ') || undefined };
    }
    return d;
  }, [rollup, metric, ministers]);

  const marks: MapMark[] = useMemo(
    () =>
      filtered
        .slice()
        .sort((a, b) => (b.marketCapCr ?? 0) - (a.marketCapCr ?? 0))
        .slice(0, 220)
        .map((c) => ({
          id: c.id,
          label: c.shortName || c.name,
          state: c.stateCode,
          weight: c.marketCapCr ?? 0,
          kind: c.ownership.startsWith('psu') ? 'psu' : 'company',
          exchanges: [c.nse ? 'NSE' : null, c.bse ? 'BSE' : null].filter(Boolean) as ('NSE' | 'BSE')[],
        })),
    [filtered],
  );

  const sel = selected ? rollup.get(selected) : null;
  const selEcon = selected ? ECONOMY_BY_STATE.get(selected) : null;
  const activeMetric = METRICS.find((m) => m.id === metric)!;

  const totalMcap = filtered.reduce((a, c) => a + (c.marketCapCr ?? 0), 0);
  const statesCovered = rollup.size;
  const noData = 36 - statesCovered;
  const topState = [...rollup.values()].sort((a, b) => b.totalMcapCr - a.totalMcapCr)[0];
  const concentration = topState && totalMcap ? (topState.totalMcapCr / totalMcap) * 100 : 0;

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Market layer · registered headquarters, not operational footprint</Kicker>
        <PageTitle>The NSE and BSE map of India</PageTitle>
        <Standfirst>
          Every state and union territory, drawn from real boundary geometry, shaded by what is actually
          listed there. The distribution is the finding: a small number of states carry almost all listed
          market capitalisation, which is why the default scale is quantile-binned — a linear ramp would
          render thirty states identical and hide the thing worth seeing.
        </Standfirst>
        <Byline>
          {COMPANIES.length} companies · as of {COMPANIES_AS_OF || 'dataset date'} · 36 states and UTs ·
          market caps are as-of, never current
        </Byline>
      </header>

      {COMPANIES.length === 0 ? (
        <Callout label="Company dataset not yet loaded" tone="warn">
          <p>
            The map geometry and the interaction layer are live, but no company records are present in{' '}
            <code>research/raw/companies-by-state.json</code> yet. Rather than render plausible-looking
            placeholder figures, the map shows every state as <strong>no data</strong> — which is the honest
            state of the world right now.
          </p>
        </Callout>
      ) : (
        <StatGrid
          items={[
            { value: `₹${(totalMcap / 100000).toFixed(1)}L cr`, label: 'total recorded listed market cap in view' },
            { value: String(filtered.length), label: `companies in view (${exchange === 'both' ? 'NSE + BSE' : exchange})` },
            { value: `${concentration.toFixed(0)}%`, label: `carried by ${topState ? STATE_NAMES[topState.stateCode] : '—'} alone`, tone: 'rose' },
            { value: `${noData}/36`, label: 'states and UTs with no company in the dataset — not zero, unmeasured', tone: 'muted' },
          ]}
        />
      )}

      <Section title="" note="">
        <div className="flex flex-wrap gap-4 mb-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-1.5">Metric</p>
            <div className="flex flex-wrap gap-1.5">
              {METRICS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetric(m.id)}
                  title={m.note}
                  className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
                    metric === m.id ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-1.5">Exchange</p>
            <div className="flex gap-1.5">
              {(['both', 'NSE', 'BSE'] as Exchange[]).map((x) => (
                <button
                  key={x}
                  onClick={() => setExchange(x)}
                  className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
                    exchange === x ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
                  }`}
                >
                  {x === 'both' ? 'NSE + BSE' : x}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-1.5">Scale</p>
            <div className="flex gap-1.5">
              {(['quantile', 'log', 'linear'] as ScaleMode[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setScaleMode(s)}
                  className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
                    scaleMode === s ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {sectors.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-1.5">Sector</p>
              <select value={sector} onChange={(e) => setSector(e.target.value)} className="input-field !py-1.5 !text-[12px] !w-auto">
                <option value="all">All sectors</option>
                {sectors.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-1.5">Marks</p>
            <button
              onClick={() => setShowMarks((s) => !s)}
              className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
                showMarks ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
              }`}
            >
              {showMarks ? 'shown' : 'hidden'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="card-surface !p-4 min-w-0">
            <IndiaMap
              data={mapData}
              marks={showMarks ? marks : []}
              metricLabel={activeMetric.label}
              unit={activeMetric.unit}
              scaleMode={scaleMode}
              selected={selected}
              onSelect={setSelected}
              height={680}
              format={(v) => (metric === 'mcap' || metric === 'gsdp' ? fmtCr(v) : String(Math.round(v)))}
            />
            <p className="text-[12px] text-text-muted mt-3 max-w-[70ch]">{activeMetric.note}</p>
          </div>

          {/* drill-down */}
          <aside className="lg:sticky lg:top-4 lg:self-start space-y-4">
            {sel && selected ? (
              <div className="card-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="heading-editorial font-bold text-xl leading-tight">{STATE_NAMES[selected]}</h3>
                  <button onClick={() => setSelected(null)} className="btn-ghost !py-1 !px-2 !text-[11px]">
                    close
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <p className="font-mono text-[17px] text-accent">{fmtCr(sel.totalMcapCr)}</p>
                    <p className="text-[11px] text-text-muted">recorded market cap</p>
                  </div>
                  <div>
                    <p className="font-mono text-[17px]">{sel.count}</p>
                    <p className="text-[11px] text-text-muted">
                      listed · {sel.nseCount} NSE · {sel.bseCount} BSE
                    </p>
                  </div>
                </div>

                {sel.mcapGaps > 0 && (
                  <p className="text-[11.5px] text-amber mt-3 border-l-2 border-amber/40 pl-2">
                    {sel.mcapGaps} of {sel.count} have no recorded market cap — the total above is a floor,
                    not a measurement.
                  </p>
                )}

                {selEcon && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-1.5">
                      Capital · {selEcon.capital}
                    </p>
                    {selEcon.gsdpCr != null && (
                      <p className="text-[13px] text-text-secondary">
                        GSDP {fmtCr(selEcon.gsdpCr)} <span className="text-text-muted">({selEcon.gsdpYear})</span>
                      </p>
                    )}
                    {selEcon.dominantIndustries?.length > 0 && (
                      <p className="text-[13px] text-text-secondary mt-1.5">{selEcon.dominantIndustries.join(' · ')}</p>
                    )}
                    {selEcon.notableClusters?.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {selEcon.notableClusters.map((c) => (
                          <li key={c} className="text-[12px] text-text-muted">
                            {c}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {sel.topSectors.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">Sectors by market cap</p>
                    {sel.topSectors.slice(0, 6).map((s) => (
                      <div key={s.sector} className="flex items-center gap-2 mb-1.5">
                        <span className="text-[12px] w-24 truncate text-text-secondary">{s.sector}</span>
                        <span
                          className="h-2.5 bg-teal/60 rounded-sm"
                          style={{ width: `${Math.max(3, (s.mcapCr / (sel.topSectors[0].mcapCr || 1)) * 60)}%` }}
                        />
                        <span className="font-mono text-[10px] text-text-muted">{s.count}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-border">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">Largest by market cap</p>
                  <ul className="space-y-1.5">
                    {sel.companies.slice(0, 8).map((c: Company) => (
                      <li key={c.id} className="flex justify-between gap-2 text-[12.5px]">
                        <Link to={`/company/${c.id}`} className="text-text-secondary hover:text-accent truncate">
                          {c.shortName || c.name}
                        </Link>
                        <span className="font-mono text-[11px] text-text-muted whitespace-nowrap">
                          {c.marketCapCr != null ? fmtCr(c.marketCapCr) : '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {(ministers.get(selected)?.length ?? 0) > 0 && (
                  <div className="mt-4 pt-3 border-t border-border">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted mb-2">
                      Union ministers seated here
                    </p>
                    <ul className="space-y-1">
                      {ministers.get(selected)!.slice(0, 6).map((m) => (
                        <li key={m.id} className="text-[12.5px] text-text-secondary">
                          {m.name} <span className="text-text-muted">— {m.portfolios[0]}</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-text-muted mt-2 italic">
                      Co-location is not a relationship. Shown as context, never drawn as an edge.
                    </p>
                  </div>
                )}

                <Link to={`/states/${selected}`} className="btn-ghost w-full mt-4 !text-[12px] block text-center">
                  full state profile →
                </Link>
              </div>
            ) : (
              <div className="card-surface p-4">
                <p className="text-[13.5px] text-text-secondary leading-relaxed">
                  Click any state to drill down — listed companies, sector mix, GSDP, industrial clusters,
                  and the union ministers seated there.
                </p>
                <p className="text-[12px] text-text-muted mt-3 leading-relaxed">
                  Keyboard: arrow keys move north-to-south through the states, Enter opens one, Escape closes.
                </p>
              </div>
            )}
          </aside>
        </div>
      </Section>

      <Callout label="What the marks do and do not mean" tone="note">
        <p>
          Company marks are placed on a golden-angle spiral <strong>within</strong> the state polygon, sized
          by market cap. They are <strong>not geocoded</strong> — a mark's position inside a state carries
          no information about where the company actually is. Where a real city coordinate exists in the
          dataset it is used and the entity is flagged as geocoded; everything else is anchored.
        </p>
        <p>
          A grey hatched state means <strong>no company in the dataset</strong>, not zero listed companies.
          Those are different claims and the legend keeps them apart.
        </p>
      </Callout>

      {STATES_WITH_NO_LISTED_HQ.length > 0 && (
        <Section title="States with no significant listed headquarters" note="Recorded explicitly — an empty state is data, not a hole">
          <ul className="space-y-1.5">
            {(STATES_WITH_NO_LISTED_HQ as { stateCode: StateCode; note: string }[]).map((s, i) =>
              typeof s === 'string' ? (
                <li key={i} className="text-[13.5px] text-text-secondary">
                  {STATE_NAMES[s] ?? s}
                </li>
              ) : (
                <li key={s.stateCode} className="text-[13.5px] text-text-secondary">
                  <strong className="text-text">{STATE_NAMES[s.stateCode] ?? s.stateCode}</strong> — {s.note}
                </li>
              ),
            )}
          </ul>
        </Section>
      )}

      {COMPANIES.length > 0 && (
        <Section title="State ledger" note="The accessible twin of the map — same data, same filters">
          <DataTable
            columns={['State / UT', 'Listed', 'NSE', 'BSE', 'Market cap', 'PSU', 'Leading sector']}
            rows={[...rollup.values()]
              .sort((a, b) => b.totalMcapCr - a.totalMcapCr)
              .map((r) => [
                <Link key="s" to={`/states/${r.stateCode}`} className="text-text hover:text-accent">
                  {STATE_NAMES[r.stateCode]}
                </Link>,
                String(r.count),
                String(r.nseCount),
                String(r.bseCount),
                <span key="m" className="font-mono text-[12px] whitespace-nowrap">
                  {fmtCr(r.totalMcapCr)}
                  {r.mcapGaps > 0 && <span className="block text-[10px] text-amber">{r.mcapGaps} unpriced</span>}
                </span>,
                String(r.psuCount),
                <span key="t" className="text-[12.5px]">
                  {r.topSectors[0]?.sector ?? '—'}
                </span>,
              ])}
          />
        </Section>
      )}

      <Footnote>
        <p>
          <strong>Geometry.</strong> 36 state and UT boundaries at viewBox 612×696, with label anchors
          computed as the pole of inaccessibility of each state's largest sub-polygon — the interior point
          furthest from any edge. Bounding-box centres fall outside Gujarat, Kerala, Odisha and West Bengal
          and are not used. West Bengal has 63 sub-polygons, Gujarat 17, the Andamans 36; islands and
          enclaves are drawn, not dropped.
        </p>
        <p>
          <strong>Attribution.</strong> Companies are attributed to their <em>registered</em> headquarters
          state. Coal India is Kolkata-registered though the coal is in Jharkhand and Chhattisgarh; several
          large PSUs are Delhi-registered though their operations are elsewhere. Conflating registered with
          operational headquarters is the most common error in state-wise corporate maps and is avoided
          here by construction.
        </p>
        {COMPANY_GAPS.length > 0 && (
          <p>
            <strong>Gaps.</strong> {COMPANY_GAPS.join(' · ')}
          </p>
        )}
        {COMPANY_SOURCES.length > 0 && (
          <p>
            <strong>Sources.</strong>{' '}
            {COMPANY_SOURCES.slice(0, 8).map(([l, u], i) => (
              <span key={i}>
                {i > 0 && ' · '}
                <a href={u} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {l}
                </a>
              </span>
            ))}
          </p>
        )}
      </Footnote>
    </article>
  );
}
