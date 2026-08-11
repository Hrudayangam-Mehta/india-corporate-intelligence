import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Kicker, PageTitle, Standfirst, Section, Callout, StatGrid, DataTable, Prose, Footnote } from '../components/Editorial';
import { useData } from '../context/DataContext';
import { STATE_NAMES } from '../data/geo';
import { hhi } from '../data/companies';

const fmtCr = (v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(2)}L cr` : `₹${Math.round(v).toLocaleString('en-IN')} cr`);

/**
 * Media ownership.
 *
 * This page is deliberately thin, and says so. The platform has listed media
 * companies and the conglomerate entities that own some of them — it does not have
 * a media-ownership dataset, a coverage-sentiment corpus, or ad-spend figures.
 * Rendering a rich-looking media page from that would be inventing the finding.
 */
export default function MediaView() {
  const { companies, groups } = useData();

  const mediaCos = useMemo(
    () =>
      companies
        .filter((c) => c.sector === 'Media' || /media|broadcast|television|newspaper|publish|entertainment/i.test(c.industry))
        .sort((a, b) => (b.marketCapCr ?? 0) - (a.marketCapCr ?? 0)),
    [companies],
  );

  const groupOwned = useMemo(
    () =>
      groups
        .map((g) => ({
          g,
          entities: g.listedEntities.filter((e) => /media|broadcast|television|news|entertainment/i.test(`${e.name} ${e.sector}`)),
        }))
        .filter((x) => x.entities.length > 0),
    [groups],
  );

  const totalMcap = mediaCos.reduce((a, c) => a + (c.marketCapCr ?? 0), 0);
  const conc = hhi(mediaCos.map((c) => c.marketCapCr ?? 0));
  const conglomerateOwned = groupOwned.reduce((a, x) => a + x.entities.length, 0);

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Media layer · coverage is thin, and this page says so</Kicker>
        <PageTitle>Who owns the outlets</PageTitle>
        <Standfirst>
          Listed media companies in the dataset and the conglomerate groups that hold some of them. This
          is a structural ownership view only — the platform has no coverage-sentiment corpus, no ad-spend
          figures, and no ownership data for the many outlets that are not listed.
        </Standfirst>
      </header>

      <Callout label="What is missing, stated plainly" tone="warn">
        <p>
          The interesting questions about Indian media ownership — cross-holdings between print, television
          and digital; who funds outlets that are not listed; whether ad spend tracks coverage — cannot be
          answered from this dataset. A page that presented a dense-looking media graph from the data
          actually present would be manufacturing the appearance of a finding.
        </p>
        <p>
          What is here is what is verifiable: {mediaCos.length} listed media companies with real tickers,
          and {conglomerateOwned} media entities inside the mapped conglomerate groups. Everything else is
          a coverage gap, not a null result.
        </p>
      </Callout>

      <StatGrid
        items={[
          { value: String(mediaCos.length), label: 'listed media companies in the dataset' },
          { value: totalMcap ? fmtCr(totalMcap) : '—', label: 'combined recorded market cap' },
          { value: String(Math.round(conc)), label: 'HHI among listed media only — not a claim about the media market', tone: 'muted' },
          { value: String(conglomerateOwned), label: 'media entities held inside mapped conglomerate groups', tone: 'accent' },
        ]}
      />

      {mediaCos.length > 0 && (
        <Section title="Listed media companies" note="By recorded market cap">
          <DataTable
            columns={['Company', 'Ticker', 'Industry', 'Market cap', 'State', 'Group']}
            rows={mediaCos.map((c) => [
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
      )}

      {groupOwned.length > 0 && (
        <Section title="Media held inside conglomerate groups" note="Ownership fact, drawn from group filings">
          <ul className="space-y-3">
            {groupOwned.map(({ g, entities }) => (
              <li key={g.id} className="border border-border rounded-lg p-4">
                <Link to="/conglomerates" className="heading-editorial font-bold text-lg hover:text-accent">
                  {g.name}
                </Link>
                <ul className="mt-2 space-y-1.5">
                  {entities.map((e) => (
                    <li key={e.name} className="text-[13.5px] text-text-secondary">
                      <strong className="text-text">{e.name}</strong>
                      {e.nse && <span className="font-mono text-[11.5px] text-text-muted"> · {e.nse}</span>}
                      {e.promoterHoldingPct != null && (
                        <span className="text-text-muted"> · promoter {e.promoterHoldingPct}%{e.asOfQuarter ? ` (${e.asOfQuarter})` : ''}</span>
                      )}
                      {e.notes && <span className="block text-[12px] text-text-muted italic mt-0.5">{e.notes}</span>}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section title="What would make this page worth having" note="Concrete, checkable next steps">
        <Prose>
          <ul className="space-y-3 list-none pl-0">
            {[
              ['A media-ownership register', 'RNI registration data for print, MIB permissions for television, and the shareholding filings behind each. Public, laborious, and nobody has assembled it into one queryable set.'],
              ['Cross-media holdings', 'Which owners hold across print, television and digital in the same language market. This is the concentration question that actually matters, and it needs the register above first.'],
              ['A control group before any coverage claim', 'Any claim that an outlet covers its owner favourably needs the same measurement run on outlets with no such ownership. Without that comparison the finding is generated by the method, not detected by it.'],
              ['Ad-spend against coverage', 'Requires spend data that is not public. Likely to remain a gap; saying so is better than filling it with inference.'],
            ].map(([t, b]) => (
              <li key={t} className="border-l-2 border-accent/40 pl-3">
                <strong className="text-text block mb-0.5">{t}</strong>
                <span className="text-[14.5px]">{b}</span>
              </li>
            ))}
          </ul>
        </Prose>
      </Section>

      <Footnote>
        <p>
          <strong>Standing.</strong> Ownership facts drawn from exchange filings. Nothing on this page makes
          any claim about the editorial conduct of any outlet, or about the relationship between ownership
          and coverage — that claim would require evidence this platform does not have.
        </p>
      </Footnote>
    </article>
  );
}
