import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Kicker, PageTitle, Standfirst, Byline, Section, Callout, StatGrid, DataTable } from '../components/Editorial';
import IndiaMap from '../components/viz/IndiaMap';
import { useData } from '../context/DataContext';
import { hhi } from '../data/companies';
import { STATE_NAMES } from '../data/geo';
import type { StateCode } from '../graph/schema';

const fmtCr = (v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(2)}L cr` : `₹${Math.round(v).toLocaleString('en-IN')} cr`);

/**
 * Sector view.
 *
 * HHI here measures concentration among LISTED companies in the dataset — not
 * market share in the real economy, which includes everything unlisted, imported
 * and state-run. The page says so, because an HHI presented without that caveat
 * reads as a competition finding it cannot support.
 */
export default function IndustryView() {
  const { companies, sectors, groups } = useData();
  const [sector, setSector] = useState<string>(sectors[0]?.sector ?? '');

  const inSector = useMemo(() => companies.filter((c) => c.sector === sector), [companies, sector]);
  const conc = useMemo(() => hhi(inSector.map((c) => c.marketCapCr ?? 0)), [inSector]);
  const totalMcap = useMemo(() => inSector.reduce((a, c) => a + (c.marketCapCr ?? 0), 0), [inSector]);
  const topShare = useMemo(() => {
    const sorted = [...inSector].sort((a, b) => (b.marketCapCr ?? 0) - (a.marketCapCr ?? 0));
    return totalMcap ? ((sorted[0]?.marketCapCr ?? 0) / totalMcap) * 100 : 0;
  }, [inSector, totalMcap]);

  const mapData = useMemo(() => {
    const d: Partial<Record<StateCode, { value: number | null; detail?: string }>> = {};
    for (const c of inSector) {
      const cur = d[c.stateCode]?.value ?? 0;
      d[c.stateCode] = { value: (cur ?? 0) + (c.marketCapCr ?? 0) };
    }
    return d;
  }, [inSector]);

  const groupsHere = useMemo(
    () =>
      groups
        .map((g) => ({
          g,
          entities: g.listedEntities.filter((e) => e.sector.toLowerCase().includes(sector.toLowerCase().split(' ')[0])),
        }))
        .filter((x) => x.entities.length > 0),
    [groups, sector],
  );

  const statesPresent = new Set(inSector.map((c) => c.stateCode)).size;

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Sector layer</Kicker>
        <PageTitle>Industries, and how concentrated they are</PageTitle>
        <Standfirst>
          Every sector in the dataset, with its geography, its concentration, and which conglomerate
          groups sit inside it. Concentration is measured among <em>listed</em> companies only — the real
          economy includes everything unlisted, imported and state-run, so these figures describe the
          stock market, not the market.
        </Standfirst>
        <Byline>
          {sectors.length} sectors · {companies.length} companies · Herfindahl–Hirschman index over
          recorded market cap
        </Byline>
      </header>

      <div className="flex flex-wrap gap-1.5 my-6">
        {sectors.map((s) => (
          <button
            key={s.sector}
            onClick={() => setSector(s.sector)}
            className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
              sector === s.sector ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
            }`}
          >
            {s.sector} <span className="opacity-60">{s.count}</span>
          </button>
        ))}
      </div>

      <StatGrid
        items={[
          { value: String(inSector.length), label: `listed companies in ${sector}` },
          { value: fmtCr(totalMcap), label: 'recorded market cap' },
          { value: String(Math.round(conc)), label: `HHI — ${conc > 2500 ? 'concentrated among listed firms' : conc > 1500 ? 'moderately concentrated' : 'dispersed'}`, tone: conc > 2500 ? 'rose' : 'sage' },
          { value: `${topShare.toFixed(0)}%`, label: 'held by the largest listed firm in the sector', tone: 'muted' },
        ]}
      />

      <Callout label="What HHI does and does not say here" tone="note">
        <p>
          The index is computed over the market caps of the listed companies in this dataset. A sector
          with three listed companies will show a high HHI as a matter of arithmetic, whether or not the
          underlying market is competitive — most Indian sectors have large unlisted and public-sector
          participants that never enter this calculation. Read it as a measure of <em>listed</em>{' '}
          concentration and nothing more.
        </p>
      </Callout>

      <Section title={`Where ${sector} is registered`} note={`${statesPresent} of 36 states and UTs have a listed ${sector} headquarters`}>
        <IndiaMap
          data={mapData}
          metricLabel={`${sector} market cap`}
          unit="₹ cr"
          scaleMode="log"
          showMarks={false}
          height={520}
          format={(v) => fmtCr(v)}
        />
      </Section>

      <Section title={`Listed ${sector} companies`} note="By recorded market cap">
        <DataTable
          columns={['Company', 'Ticker', 'Industry', 'Market cap', 'State', 'Group']}
          rows={[...inSector]
            .sort((a, b) => (b.marketCapCr ?? 0) - (a.marketCapCr ?? 0))
            .map((c) => [
              <Link key="n" to={`/company/${c.id}`} className="text-text hover:text-accent">
                {c.shortName || c.name}
              </Link>,
              <span key="t" className="font-mono text-[11.5px]">
                {c.nse ?? c.bse ?? '—'}
              </span>,
              <span key="i" className="text-[12.5px]">
                {c.industry}
              </span>,
              <span key="m" className="font-mono text-[11.5px] whitespace-nowrap">
                {c.marketCapCr != null ? fmtCr(c.marketCapCr) : '—'}
              </span>,
              <Link key="s" to={`/states/${c.stateCode}`} className="text-[12.5px] hover:text-accent">
                {STATE_NAMES[c.stateCode]}
              </Link>,
              <span key="g" className="text-[12.5px]">
                {c.group ?? '—'}
              </span>,
            ])}
        />
      </Section>

      {groupsHere.length > 0 && (
        <Section title="Conglomerate presence" note="Groups with a declared entity in this sector">
          <ul className="space-y-2">
            {groupsHere.map(({ g, entities }) => (
              <li key={g.id} className="border border-border rounded-lg p-3">
                <Link to="/conglomerates" className="font-medium hover:text-accent">
                  {g.name}
                </Link>
                <p className="text-[13px] text-text-muted mt-1">{entities.map((e) => e.name).join(' · ')}</p>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-text-muted mt-4 max-w-[70ch]">
            Two large groups operating in the same sector is what "diversified conglomerate" means. Sector
            co-presence is a structural fact about the market and is never rendered as a relationship
            between the groups.
          </p>
        </Section>
      )}

      <Section title="All sectors" note="Sorted by recorded market cap">
        <DataTable
          columns={['Sector', 'Companies', 'States', 'Market cap', 'HHI (listed only)']}
          rows={sectors.map((s) => {
            const list = companies.filter((c) => c.sector === s.sector);
            const h = hhi(list.map((c) => c.marketCapCr ?? 0));
            return [
              <button key="s" onClick={() => setSector(s.sector)} className="text-text hover:text-accent text-left">
                {s.sector}
              </button>,
              String(s.count),
              String(s.states),
              <span key="m" className="font-mono text-[12px] whitespace-nowrap">
                {fmtCr(s.mcapCr)}
              </span>,
              <span key="h" className={`font-mono text-[12px] ${h > 2500 ? 'text-rose' : h > 1500 ? 'text-amber' : 'text-sage'}`}>
                {Math.round(h)}
              </span>,
            ];
          })}
        />
      </Section>
    </article>
  );
}
