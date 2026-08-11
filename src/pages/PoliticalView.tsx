import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Kicker, PageTitle, Standfirst, Byline, Section, Callout, StatGrid, DataTable, TierChip, Cite, Footnote } from '../components/Editorial';
import { NODES, EDGES } from '../graph/data';
import { BASE_RATES } from '../graph/baseRates';
import type { Predicate } from '../graph/schema';

/**
 * Money to parties.
 *
 * Built from the case-study subgraph, which is the only part of the platform that
 * carries donation edges — and every one of them is sourced. The page leads with
 * the documented void rather than the flows, because the void is the finding that
 * the flows on their own cannot support.
 */

const MONEY_PREDS: Predicate[] = ['bond', 'trust', 'direct', 'pmin', 'pmout', 'csr'];

const PRED_LABEL: Record<string, string> = {
  bond: 'Electoral bond',
  trust: 'Electoral trust',
  direct: 'Direct donation',
  pmin: 'Into a fund',
  pmout: 'Out of a fund',
  csr: 'CSR disbursement',
};

export default function PoliticalView() {
  const [pred, setPred] = useState<Predicate | 'all'>('all');

  const byId = useMemo(() => new Map(NODES.map((n) => [n.id, n])), []);

  const flows = useMemo(
    () =>
      EDGES.filter((e) => MONEY_PREDS.includes(e.pred))
        .filter((e) => pred === 'all' || e.pred === pred)
        .sort((a, b) => (b.a ?? 0) - (a.a ?? 0)),
    [pred],
  );

  const totals = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of EDGES.filter((x) => MONEY_PREDS.includes(x.pred))) {
      m.set(e.pred, (m.get(e.pred) ?? 0) + (e.a ?? 0));
    }
    return m;
  }, []);

  const totalTraced = [...totals.values()].reduce((a, b) => a + b, 0);
  const sourced = flows.filter((e) => (e.srcs?.length ?? 0) > 0).length;

  // The anti-motif: beneficiaries with awards but no traceable donation edge.
  const beneficiaries = useMemo(() => {
    const awarded = new Set(EDGES.filter((e) => e.pred === 'award').map((e) => e.t));
    const donors = new Set(EDGES.filter((e) => ['bond', 'trust', 'direct'].includes(e.pred)).map((e) => e.s));
    return [...awarded]
      .filter((id) => !donors.has(id))
      .map((id) => byId.get(id))
      .filter(Boolean);
  }, [byId]);

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Money to parties and funds</Kicker>
        <PageTitle>The flows, and what they are worth</PageTitle>
        <Standfirst>
          Every traceable political-money edge in the platform, with its source. The important thing on
          this page is not the flows — it is the void beneath them: the largest beneficiaries in the graph
          show no traceable political donations at all.
        </Standfirst>
        <Byline>
          {flows.length} money edges · {sourced} carrying a source URL · figures in ₹ crore as published
        </Byline>
      </header>

      <Callout label="Read this before the numbers" tone="bottomline">
        <p>
          Three of the four edges people most want to draw here are close to universal.{' '}
          <strong>82.45%</strong> of electoral-trust money went to one party in FY2024-25;{' '}
          <strong>every</strong> public-sector undertaking that responded to an RTI had contributed to PM
          CARES; and CSR spending is <strong>compulsory by statute</strong> for qualifying companies.
        </p>
        <p>
          Drawing those edges produces a dense, alarming-looking web — and it would look identical if you
          fed in a random sample of large Indian companies that never won anything.{' '}
          <Link to="/base-rates" className="underline underline-offset-2 text-accent">
            The full arithmetic
          </Link>
          .
        </p>
      </Callout>

      <StatGrid
        items={[
          { value: `₹${Math.round(totalTraced).toLocaleString('en-IN')} cr`, label: 'total traced across all money edges in the case study' },
          { value: String(beneficiaries.length), label: 'award recipients with NO traceable donation edge', tone: 'accent' },
          { value: '82.45%', label: 'ruling-party share of electoral-trust money, FY2024-25 — the base rate any donation edge must beat', tone: 'muted' },
          { value: `${sourced}/${flows.length}`, label: 'money edges carrying a source URL', tone: 'sage' },
        ]}
      />

      <Section title="The documented void" note="The anti-motif — and the integrity check on this whole exercise">
        <Callout label="Benefit ≠ payment" tone="warn">
          <p>
            If benefit reliably followed payment, the largest beneficiaries in this graph would be its
            heaviest donors. They are not in the donation data at all. That is a finding, and it is
            rendered as loudly as any flow — a graph that can only show what exists systematically
            overstates the case.
          </p>
          <ul className="space-y-1.5 mt-2">
            {beneficiaries.map((n) => (
              <li key={n!.id} className="text-[14px]">
                <strong className="text-text">{n!.label}</strong>
                {n!.sub && <span className="text-text-muted"> — {n!.sub}</span>}
              </li>
            ))}
          </ul>
        </Callout>
      </Section>

      <Section title="Traced flows" note="Filter by instrument. Every row carries its tier and its source.">
        <div className="flex flex-wrap gap-1.5 mb-4">
          <button
            onClick={() => setPred('all')}
            className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
              pred === 'all' ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
            }`}
          >
            All ({EDGES.filter((e) => MONEY_PREDS.includes(e.pred)).length})
          </button>
          {MONEY_PREDS.filter((p) => EDGES.some((e) => e.pred === p)).map((p) => (
            <button
              key={p}
              onClick={() => setPred(p)}
              className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
                pred === p ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
              }`}
            >
              {PRED_LABEL[p]} ({EDGES.filter((e) => e.pred === p).length})
            </button>
          ))}
        </div>

        <DataTable
          columns={['From', 'Instrument', 'To', '₹ cr', 'Tier', 'Source']}
          rows={flows.map((e, i) => [
            <strong key="s" className="text-text">
              {byId.get(e.s)?.label ?? e.s}
            </strong>,
            <span key="p" className="text-[12.5px]">
              {PRED_LABEL[e.pred] ?? e.pred}
              {e.lab && <span className="block text-[11.5px] text-text-muted">{e.lab}</span>}
            </span>,
            byId.get(e.t)?.label ?? e.t,
            <span key="a" className="font-mono text-[12px] whitespace-nowrap">
              {e.a ? e.a.toLocaleString('en-IN') : '—'}
            </span>,
            <TierChip key={`t${i}`} tier={e.tier} />,
            e.srcs?.length ? (
              <a key="src" href={e.srcs[0][1]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-[12px]">
                {e.srcs[0][0]}
              </a>
            ) : (
              <span key="src" className="text-[12px] text-text-muted">
                unsourced by design — {e.tier}
              </span>
            ),
          ])}
        />
      </Section>

      <Section title="What each edge type is worth" note="Discriminating power, with published denominators">
        <div className="space-y-4">
          {BASE_RATES.filter((b) => b.id !== 'br-shared-state').map((b) => (
            <div key={b.id} className="border-l-2 border-border-light pl-4">
              <p className="font-medium text-[15px]">“{b.claim}”</p>
              <p className="text-[13.5px] text-text-muted mt-1 max-w-[68ch] leading-relaxed">{b.reading}</p>
              <p className="font-mono text-[10.5px] mt-1.5">
                <span className={b.discrimination === 'high' ? 'text-sage' : b.discrimination === 'moderate' ? 'text-teal' : 'text-text-muted'}>
                  {(b.rate * 100).toFixed(1)}% base rate · {b.discrimination} discriminating power
                </span>
              </p>
              <Cite srcs={b.srcs} />
            </div>
          ))}
        </div>
      </Section>

      <Footnote>
        <p>
          <strong>Coverage.</strong> Donation edges exist only in the case-study subgraph, which covers the
          ministries of one Union minister. There is no platform-wide donations dataset yet — that is a
          coverage gap, and treating this page as a national picture would be a category error.
        </p>
        <p>
          <strong>Standing.</strong> Money flows between corporate entities, parties and funds are recorded
          as published. Nothing here asserts a quid pro quo, and no edge on this page adjudicates one.
        </p>
      </Footnote>
    </article>
  );
}
