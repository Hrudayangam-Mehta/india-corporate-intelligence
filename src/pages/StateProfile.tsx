import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Kicker, PageTitle, Standfirst, Section, Callout, StatGrid, DataTable, Footnote, Prose } from '../components/Editorial';
import { STATES, STATE_BY_ID, STATE_NAMES, VIEWBOX } from '../data/geo';
import { COMPANIES, ECONOMY_BY_STATE, rollupByState, hhi } from '../data/companies';
import { GROUPS } from '../data/conglomerates';
import { ministersByState, RANK_LABEL } from '../data/politics';
import type { StateCode } from '../graph/schema';

/** Per-state drill-down: what is listed here, what it does, who represents it. */

const fmtCr = (v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(2)} lakh cr` : `₹${Math.round(v).toLocaleString('en-IN')} cr`);

/** A single state drawn in isolation, at its own scale. */
function StateInset({ code }: { code: StateCode }) {
  const geo = STATE_BY_ID.get(code);
  if (!geo) return null;
  const [x0, y0, x1, y1] = geo.bbox;
  const pad = Math.max(6, (x1 - x0) * 0.08);
  return (
    <svg
      viewBox={`${x0 - pad} ${y0 - pad} ${x1 - x0 + pad * 2} ${y1 - y0 + pad * 2}`}
      className="w-full max-w-[16rem]"
      role="img"
      aria-label={`Outline of ${geo.name}`}
    >
      {/* neighbours, faint, for orientation */}
      {STATES.filter((s) => s.id !== code).map((s) => (
        <path key={s.id} d={s.path} fill="none" stroke="rgba(232,228,220,0.10)" strokeWidth="0.5" />
      ))}
      <path d={geo.path} fill="rgba(201,168,108,0.14)" stroke="var(--color-accent,#c9a86c)" strokeWidth="0.9" strokeLinejoin="round" />
      <circle cx={geo.cx} cy={geo.cy} r="1.6" fill="var(--color-accent,#c9a86c)" />
    </svg>
  );
}

export default function StateProfile() {
  const { code } = useParams<{ code: string }>();
  const st = (code ?? '') as StateCode;
  const geo = STATE_BY_ID.get(st);

  const rollup = useMemo(() => rollupByState(), []);
  const r = rollup.get(st);
  const econ = ECONOMY_BY_STATE.get(st);
  const ministers = useMemo(() => ministersByState().get(st) ?? [], [st]);
  const groups = useMemo(() => GROUPS.filter((g) => g.stateCode === st), [st]);

  const nationalMcap = useMemo(() => COMPANIES.reduce((a, c) => a + (c.marketCapCr ?? 0), 0), []);
  const share = r && nationalMcap ? (r.totalMcapCr / nationalMcap) * 100 : 0;
  const conc = r?.topSectors.length ? hhi(r.topSectors.map((s) => s.mcapCr)) : 0;

  if (!geo) {
    return (
      <article className="pt-4">
        <PageTitle>Unknown state</PageTitle>
        <Prose>
          <p>
            No state or union territory matches <code>{code}</code>. The platform carries 36 — the full set
            of states and UTs in the boundary geometry.
          </p>
        </Prose>
        <Link to="/map" className="btn-ghost mt-4 inline-block">
          ← back to the map
        </Link>
      </article>
    );
  }

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>
          <Link to="/map" className="hover:text-accent">
            Map
          </Link>{' '}
          / state profile
        </Kicker>
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex-1 min-w-[16rem]">
            <PageTitle>{geo.name}</PageTitle>
            <Standfirst>
              {econ?.capital ? `Capital ${econ.capital}. ` : ''}
              {r
                ? `${r.count} listed compan${r.count === 1 ? 'y' : 'ies'} in the dataset are registered here, carrying ${fmtCr(r.totalMcapCr)} of recorded market capitalisation — ${share.toFixed(1)}% of the national total in view.`
                : 'No company in the current dataset is registered here. That is a statement about the dataset, not about the state.'}
            </Standfirst>
          </div>
          <StateInset code={st} />
        </div>
      </header>

      <StatGrid
        items={[
          { value: r ? String(r.count) : '—', label: 'listed companies registered here' },
          { value: r ? fmtCr(r.totalMcapCr) : '—', label: 'recorded market cap' },
          { value: econ?.gsdpCr ? fmtCr(econ.gsdpCr) : '—', label: `GSDP${econ?.gsdpYear ? ` (${econ.gsdpYear})` : ' — not recorded'}` },
          { value: String(ministers.length), label: 'union ministers seated here', tone: 'sage' },
        ]}
      />

      {econ && (econ.dominantIndustries?.length || econ.notableClusters?.length) ? (
        <Section title="The industrial base" note="What the state actually makes and moves">
          <Prose>
            {econ.dominantIndustries?.length > 0 && (
              <p>
                <strong className="text-text">Dominant industries.</strong> {econ.dominantIndustries.join(', ')}.
              </p>
            )}
            {econ.notableClusters?.length > 0 && (
              <ul className="space-y-2 list-none pl-0">
                {econ.notableClusters.map((c) => (
                  <li key={c} className="border-l-2 border-border-light pl-3">
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </Prose>
        </Section>
      ) : null}

      {r && r.topSectors.length > 0 && (
        <Section
          title="Sector mix"
          note={`Herfindahl–Hirschman index ${Math.round(conc)} across ${r.topSectors.length} sectors — a structural concentration measure, not an allegation`}
        >
          <div className="space-y-2">
            {r.topSectors.map((s) => (
              <div key={s.sector} className="flex items-center gap-3">
                <span className="text-[13px] w-36 truncate text-text-secondary">{s.sector}</span>
                <span
                  className="h-4 bg-teal/60 rounded-sm"
                  style={{ width: `${Math.max(2, (s.mcapCr / (r.topSectors[0].mcapCr || 1)) * 55)}%` }}
                />
                <span className="font-mono text-[11px] text-text-muted whitespace-nowrap">
                  {fmtCr(s.mcapCr)} · {s.count} co
                </span>
              </div>
            ))}
          </div>
          {conc > 2500 && (
            <Callout label="Reading the concentration figure" tone="note">
              <p>
                An HHI above 2,500 is conventionally described as a concentrated market. Here it says the
                state's <em>listed</em> market cap sits in few sectors — which for a state with two or three
                large listed companies is arithmetic, not structure. It is not a claim about competition in
                the real economy, which includes everything unlisted.
              </p>
            </Callout>
          )}
        </Section>
      )}

      {r && r.companies.length > 0 && (
        <Section title="Listed companies registered here" note="By recorded market cap; registered office, not operational footprint">
          <DataTable
            columns={['Company', 'Ticker', 'Sector', 'Market cap', 'Ownership', 'Group']}
            rows={r.companies.map((c) => [
              <Link key="n" to={`/company/${c.id}`} className="text-text hover:text-accent">
                {c.shortName || c.name}
                {c.notes && <span className="block text-[11.5px] text-text-muted italic mt-0.5">{c.notes}</span>}
              </Link>,
              <span key="t" className="font-mono text-[11.5px]">
                {c.nse ?? c.bse ?? '—'}
              </span>,
              <span key="s" className="text-[12.5px]">
                {c.industry}
              </span>,
              <span key="m" className="font-mono text-[11.5px] whitespace-nowrap">
                {c.marketCapCr != null ? fmtCr(c.marketCapCr) : '—'}
              </span>,
              <span key="o" className="font-mono text-[10.5px] uppercase tracking-wider text-text-muted">
                {c.ownership}
              </span>,
              <span key="g" className="text-[12.5px]">
                {c.group ?? '—'}
              </span>,
            ])}
          />
        </Section>
      )}

      {groups.length > 0 && (
        <Section title="Conglomerate groups seated here" note="Registered headquarters of the promoter group">
          <ul className="space-y-3">
            {groups.map((g) => (
              <li key={g.id} className="border border-border rounded-lg p-4">
                <Link to="/conglomerates" className="heading-editorial font-bold text-lg hover:text-accent">
                  {g.name}
                </Link>
                <p className="text-[13px] text-text-muted mt-1">
                  {g.listedEntities.length} listed entities ·{' '}
                  {g.combinedMcapCr ? fmtCr(g.combinedMcapCr) : 'combined market cap not recorded'} ·{' '}
                  {g.sectors.slice(0, 5).join(', ')}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {ministers.length > 0 && (
        <Section title="Union ministers seated here" note="Roster data. Co-location with a company is context, never a relationship.">
          <DataTable
            columns={['Minister', 'Rank', 'Portfolios', 'Seat']}
            rows={ministers.map((m) => [
              <strong key="n" className="text-text">
                {m.name}
              </strong>,
              <span key="r" className="text-[12.5px]">
                {RANK_LABEL[m.rank]}
              </span>,
              <span key="p" className="text-[13px]">
                {m.portfolios.join('; ')}
              </span>,
              <span key="s" className="text-[12.5px]">
                {m.constituency ?? `${m.house}`}
              </span>,
            ])}
          />
          <Callout label="Why there is no line drawn here" tone="note">
            <p>
              A minister seated in {geo.name} and a company registered in {geo.name} are two facts about the
              same state. Joining them would create an edge in every large state by construction — which is
              exactly the artefact the{' '}
              <Link to="/patterns" className="underline underline-offset-2">
                pattern discipline
              </Link>{' '}
              page exists to prevent. Co-location is shown as context and is never rendered as a relationship.
            </p>
          </Callout>
        </Section>
      )}

      {!r && (
        <Callout label="No listed companies recorded" tone="note">
          <p>
            No company in the current dataset is registered in {geo.name}. This is reported explicitly
            rather than left as an empty page, because <strong>absence is data</strong>: a state with no
            large listed headquarters is a real economic fact about India's corporate geography, and
            silently omitting it would overstate how evenly listed capital is distributed.
          </p>
        </Callout>
      )}

      <Footnote>
        <p>
          <strong>Geometry.</strong> {geo.name} is drawn from {geo.parts} sub-polygon{geo.parts === 1 ? '' : 's'}
          {geo.parts > 1 ? ' — islands and enclaves are drawn, not dropped' : ''}. Label anchor at ({geo.cx},{' '}
          {geo.cy}) in viewBox {VIEWBOX}, with {geo.clearance} units of clearance.
        </p>
        {econ?.srcs?.length ? (
          <p>
            <strong>Sources.</strong>{' '}
            {econ.srcs.map(([l, u], i) => (
              <span key={i}>
                {i > 0 && ' · '}
                <a href={u} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                  {l}
                </a>
              </span>
            ))}
          </p>
        ) : null}
        <p>
          <strong>Attribution.</strong> Companies are placed by <em>registered</em> headquarters. Several
          large public-sector companies are registered in Delhi or Kolkata while operating principally
          elsewhere; where that is true it is noted on the company row.
        </p>
      </Footnote>

      <div className="mt-8 flex flex-wrap gap-2">
        {STATES.filter((s) => s.id !== st)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((s) => (
            <Link
              key={s.id}
              to={`/states/${s.id}`}
              className="font-mono text-[10.5px] px-2 py-1 rounded border border-border text-text-muted hover:text-accent hover:border-accent/40 transition-colors"
            >
              {STATE_NAMES[s.id]}
            </Link>
          ))}
      </div>
    </article>
  );
}
