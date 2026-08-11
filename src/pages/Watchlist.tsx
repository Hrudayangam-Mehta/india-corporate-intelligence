import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Kicker, PageTitle, Standfirst, Section, Callout, DataTable, Prose } from '../components/Editorial';
import { useData } from '../context/DataContext';
import { STATE_NAMES } from '../data/geo';

const fmtCr = (v: number) => (v >= 100000 ? `₹${(v / 100000).toFixed(2)}L cr` : `₹${Math.round(v).toLocaleString('en-IN')} cr`);

/** Investigative watchlist: the dated, checkable open questions, plus tracked companies. */

const OPEN_QUESTIONS = [
  {
    q: 'FY2025-26 electoral-trust and party contribution filings',
    due: '~Nov 2026 – Feb 2027',
    shape: 'Wait',
    why: 'The first full-year picture of post-bond trust routing. Until it lands, any claim about where post-bond money went is speculation in both directions.',
  },
  {
    q: "L&T's Companies Act s.182 line against the ₹500 cr Elevated Avenue donation",
    due: 'Next audited accounts',
    shape: 'Public filing',
    why: 'The specific test that would close or break the trust-route chain. Either the audited s.182 disclosure reconciles to the vehicle, or it does not.',
  },
  {
    q: 'ECI alphanumeric bond file — purchaser to party match for the Rungta purchases',
    due: 'Available now',
    shape: 'Computable',
    why: 'Public data. The match has not been published. Doing it settles one of the two remaining timing claims.',
  },
  {
    q: 'PPPAC minutes, 13 May 2022 — wording of the FCI anti-monopoly clause removal',
    due: 'On RTI response',
    shape: 'RTI',
    why: 'Records who argued for the removal and on whose representation. The strongest documented item in the file turns on this wording.',
  },
  {
    q: 'PM CARES FY24 and FY25 statements',
    due: 'On RTI response',
    shape: 'RTI',
    why: 'Accounts have been dark since FY23. The interesting question was always the fund’s opacity, not who gave — near-universal PSU contribution makes the donor list uninformative.',
  },
  {
    q: 'Coal India and mining-PSU CSR destinations, 2019–24',
    due: 'Available now',
    shape: 'Computable',
    why: 'The direct analogue of the ONGC finding, inside the ministry that actually matters. CSR annual reports are public and nobody has run it. The most answerable open question in the whole file.',
  },
  {
    q: 'A base-rate study of electoral bonds against every coal and mining award 2019–24',
    due: 'Available now',
    shape: 'Computable',
    why: 'With a date-shuffled control holding donation volume fixed. Until someone runs it, the quid pro quo claim is unproven in both directions — which is not the same as disproven.',
  },
  {
    q: 'A parliamentary standing committee or CAG performance audit of the commercial auction regime',
    due: 'Institutional',
    shape: 'Wait',
    why: 'None has yet reported on the 2019–24 tranches.',
  },
];

const SHAPE_CLASS: Record<string, string> = {
  Computable: 'text-sage border-sage/50',
  RTI: 'text-accent border-accent/50',
  'Public filing': 'text-blue border-blue/50',
  Wait: 'text-text-muted border-border-light',
};

export default function Watchlist() {
  const { companies, watchlist, toggleWatch } = useData();

  const watched = useMemo(() => companies.filter((c) => watchlist.includes(c.id)), [companies, watchlist]);

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Watchlist</Kicker>
        <PageTitle>What is still open</PageTitle>
        <Standfirst>
          The dated, checkable questions this platform cannot currently answer — separated by whether they
          are computable from public data today, need an RTI, or need someone else to file something. An
          open question stated precisely is worth more than a pattern stated confidently.
        </Standfirst>
      </header>

      <Section title="Open questions" note="Three of these are computable from public data right now">
        <div className="space-y-3">
          {OPEN_QUESTIONS.map((o) => (
            <div key={o.q} className="border border-border rounded-lg p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-medium text-[15.5px] flex-1 min-w-[16rem]">{o.q}</h3>
                <span className={`font-mono text-[9.5px] uppercase tracking-[0.11em] px-1.5 py-0.5 border rounded whitespace-nowrap ${SHAPE_CLASS[o.shape]}`}>
                  {o.shape}
                </span>
              </div>
              <p className="text-[14px] text-text-secondary mt-2 leading-relaxed max-w-[68ch]">{o.why}</p>
              <p className="font-mono text-[10.5px] text-text-muted mt-2">{o.due}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Tracked companies" note="Stored locally in your browser; nothing is sent anywhere">
        {watched.length === 0 ? (
          <Callout label="Nothing tracked yet" tone="note">
            <p>
              Open any{' '}
              <Link to="/map" className="underline underline-offset-2">
                company from the map
              </Link>{' '}
              or a{' '}
              <Link to="/states/mh" className="underline underline-offset-2">
                state profile
              </Link>{' '}
              and add it here. The list lives in this browser's local storage only — the platform has no
              accounts and no server to send it to.
            </p>
          </Callout>
        ) : (
          <DataTable
            columns={['Company', 'Ticker', 'Sector', 'Market cap', 'State', '']}
            rows={watched.map((c) => [
              <Link key="n" to={`/company/${c.id}`} className="text-text hover:text-accent">
                {c.shortName || c.name}
              </Link>,
              <span key="t" className="font-mono text-[11.5px]">
                {c.nse ?? c.bse ?? '—'}
              </span>,
              <span key="s" className="text-[12.5px]">
                {c.sector}
              </span>,
              <span key="m" className="font-mono text-[11.5px]">
                {c.marketCapCr != null ? fmtCr(c.marketCapCr) : '—'}
              </span>,
              <Link key="st" to={`/states/${c.stateCode}`} className="text-[12.5px] hover:text-accent">
                {STATE_NAMES[c.stateCode]}
              </Link>,
              <button key="x" onClick={() => toggleWatch(c.id)} className="btn-ghost !py-1 !px-2 !text-[11px]">
                remove
              </button>,
            ])}
          />
        )}
      </Section>

      <Section title="How to read a watchlist" note="">
        <Prose>
          <p>
            Every non-documented claim on this platform carries an <strong>upgrade</strong> condition and a{' '}
            <strong>kill</strong> condition — the specific evidence that would move it up a tier or destroy
            it. This page is those conditions collected into one place.
          </p>
          <p>
            A claim with no path to resolution is a dead end, and is marked as one rather than left to
            accumulate implied significance. That is the difference between a watchlist and a grievance
            file.
          </p>
        </Prose>
      </Section>
    </article>
  );
}
