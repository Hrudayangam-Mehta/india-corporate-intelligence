import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Kicker, PageTitle, Standfirst, Section, Callout, StatGrid, TierLegend, DataTable, Footnote, Prose } from '../components/Editorial';
import { NODES, EDGES, MOTIFS } from '../graph/data';
import { buildNationalGraph } from '../graph/build';
import { validateGraph, hasProvenance } from '../graph/schema';
import { COMPANIES, COMPANIES_AS_OF } from '../data/companies';
import { MINISTERS, CABINET_AS_OF } from '../data/politics';
import { GROUPS, GROUPS_AS_OF } from '../data/conglomerates';
import { STATES } from '../data/geo';

/** How the graph is built, what it will not do, and a live integrity check. */

export default function Method() {
  const national = useMemo(() => buildNationalGraph(), []);
  const allNodes = useMemo(() => [...NODES, ...national.nodes], [national]);
  const allEdges = useMemo(() => [...EDGES, ...national.edges], [national]);
  const issues = useMemo(() => validateGraph(allNodes, allEdges, MOTIFS), [allNodes, allEdges]);
  const errors = issues.filter((i) => i.level === 'error');
  const warns = issues.filter((i) => i.level === 'warn');
  const violations = allEdges.filter((e) => !hasProvenance(e)).length;

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Method · the rules, and what they refuse</Kicker>
        <PageTitle>How this graph is built</PageTitle>
        <Standfirst>
          The graph is durable, provenance-bearing shared memory — not a drawing. Every edge is a sourced
          claim with an evidence tier. Facts are superseded rather than deleted, denials are first-class,
          and entities are resolved before they take edges. The four invariants below are enforced by the
          build, not by author care.
        </Standfirst>
      </header>

      <StatGrid
        items={[
          { value: String(allNodes.length), label: 'entities across the case study and the national layers' },
          { value: String(allEdges.length), label: 'relationships' },
          { value: violations === 0 ? '0' : String(violations), label: 'provenance-invariant violations', tone: violations ? 'rose' : 'sage' },
          { value: errors.length === 0 ? 'PASS' : `${errors.length} ERR`, label: 'live integrity check on this page load', tone: errors.length ? 'rose' : 'sage' },
        ]}
      />

      <Section title="The four invariants" note="Each is a build step, not a convention">
        <DataTable
          columns={['Invariant', 'What it means', 'How it is enforced']}
          rows={[
            [
              <strong key="1">Provenance</strong>,
              'Every edge carries sources, or is tier alleged/analytic. Never invent a source, figure, date, quote, ticker or CIN.',
              <code key="c">scripts/validate.mjs</code>,
            ],
            [
              <strong key="2">Resolution</strong>,
              'One real-world entity, one canonical node. Aliases live on the node. Identity must be confirmed by DIN, constituency, office with dates, or date of birth — never by name match.',
              'Nodes with resolved:false take no edges; CI fails if one does',
            ],
            [
              <strong key="3">Supersession</strong>,
              'When a fact changes, the old claim is retained and stays addressable. Nothing is ever deleted from this graph.',
              'supersede edges; superseded targets must resolve',
            ],
            [
              <strong key="4">Contradiction</strong>,
              'Denials, rebuttals and counter-evidence are first-class edges, rendered as prominently as the claims they answer.',
              'contra edges; a warning fires if allegations exist with no denials captured',
            ],
          ]}
        />
      </Section>

      <Section title="The evidence tiers" note="Line style carries the tier. It is semantic and is never restyled for looks.">
        <TierLegend />
      </Section>

      <Section title="The pipeline" note="Extraction → resolution → grounding → assembly → query">
        <Prose>
          <p>
            Research agents with web access write to <code>research/raw/</code>, which is a{' '}
            <strong>quarantine zone</strong>. Nothing there is trusted. Promotion into{' '}
            <code>src/data/</code> and <code>src/graph/</code> happens only after the grounding checks
            below have run — which means a hallucinating researcher cannot corrupt the graph without
            passing a gate.
          </p>
          <ol className="space-y-3 list-none pl-0 counter-reset">
            {[
              ['Extraction', 'Agents propose claims with provenance. They propose claims, never facts.'],
              ['Resolution', 'Merge to canonical nodes, retaining aliases, confidence and the rationale for each merge. Unresolved entities are quarantined, not guessed at.'],
              ['Grounding', 'Date test → identity test → base rate → falsifier → tier. Any claim lacking a source, or contradicting an existing edge without a supersede, is rejected.'],
              ['Assembly', 'Writes supersede/contra rather than overwriting. CI runs the invariant.'],
              ['Query', 'Motifs computed from declarative patterns at build time, each carrying its census and its mandatory innocent reading.'],
            ].map(([t, b], i) => (
              <li key={t} className="border-l-2 border-border-light pl-4">
                <strong className="text-text">
                  {i + 1}. {t}
                </strong>
                <span className="block text-[14.5px] mt-0.5">{b}</span>
              </li>
            ))}
          </ol>
        </Prose>
      </Section>

      <Section title="The agents" note="Each hired for a bounded job, with an explicit refusal surface">
        <DataTable
          columns={['Agent', 'Owns', 'Refuses to']}
          rows={[
            ['graph-cartographer', 'nodes, edges, aliases, resolution', 'create a node on a name match; delete a superseded fact'],
            ['evidence-auditor', 'tier assignment, falsifiers, denials', 'soften a COLLAPSES verdict; publish an allegation without its denial'],
            ['base-rate-statistician', 'denominators, null models, FDR correction', 'report a numerator without a denominator'],
            ['market-cartographer', 'the listed-company dataset', 'conflate registered with operational HQ; conflate the two Ambani groups'],
            ['polity-analyst', 'the cabinet roster', 'record a portfolio without a date range'],
            ['viz-engineer', 'the map and graph components', 'draw a state as a rectangle; restyle a tier for aesthetics'],
          ].map((r) => [
            <code key="a" className="text-[12.5px] text-accent">
              {r[0]}
            </code>,
            r[1],
            <span key="r" className="text-rose/90 text-[13px]">
              {r[2]}
            </span>,
          ])}
        />
      </Section>

      <Section title="What this platform will not do" note="Refusals, stated so they can be held against it">
        <Callout label="Hard limits" tone="warn">
          <ul className="space-y-2 list-none pl-0">
            {[
              'Assert that any named person committed an offence.',
              'Publish a private individual’s details, or any allegation about a person with no public role.',
              'Link entities on name similarity.',
              'Render a pattern as a finding without its denominator, its innocent reading, and its kill condition.',
              'Present a self-declared affidavit figure as an audited one, or an asset trajectory without its peer baseline.',
              'Draw an edge between a minister and a company on the basis of shared state or shared sector. Co-location is context; it is never a relationship.',
            ].map((l) => (
              <li key={l} className="border-l-2 border-rose/40 pl-3">
                {l}
              </li>
            ))}
          </ul>
        </Callout>
      </Section>

      <Section title="Live integrity check" note="Run against the merged graph on this page load, not on a cached result">
        {errors.length === 0 ? (
          <p className="text-sage text-[15px]">
            All {allEdges.length} relationships satisfy the provenance invariant. Every analytic edge carries
            an innocent reading. Every edge endpoint resolves to an existing node. No unresolved entity holds
            an edge.
          </p>
        ) : (
          <ul className="space-y-1.5">
            {errors.slice(0, 40).map((i, k) => (
              <li key={k} className="font-mono text-[12.5px] text-rose">
                {i.where} — {i.message}
              </li>
            ))}
          </ul>
        )}
        {warns.length > 0 && (
          <details className="mt-4">
            <summary className="font-mono text-[11px] text-amber cursor-pointer">{warns.length} warning(s)</summary>
            <ul className="space-y-1 mt-2">
              {warns.slice(0, 40).map((i, k) => (
                <li key={k} className="font-mono text-[12px] text-amber/80">
                  {i.where} — {i.message}
                </li>
              ))}
            </ul>
          </details>
        )}
      </Section>

      <Section title="Data as-of dates" note="Every figure on this platform is as-of, never current">
        <DataTable
          columns={['Layer', 'Records', 'As of']}
          rows={[
            ['Cabinet roster', `${MINISTERS.length} ministers`, CABINET_AS_OF],
            ['Conglomerate structure', `${GROUPS.length} groups`, GROUPS_AS_OF],
            ['Listed companies', `${COMPANIES.length} companies`, COMPANIES_AS_OF || 'not yet loaded'],
            ['State geometry', `${STATES.length} states and UTs`, 'boundary geometry, no as-of'],
            ['Atlas case study', `${NODES.length} entities, ${EDGES.length} relationships`, '2026-07-25'],
          ]}
        />
      </Section>

      <Footnote>
        <p>
          <strong>Further reading in this platform.</strong>{' '}
          <Link to="/patterns" className="underline underline-offset-2">
            Pattern discipline
          </Link>{' '}
          — the cognitive and statistical failure modes this method exists to constrain.{' '}
          <Link to="/base-rates" className="underline underline-offset-2">
            Base rates
          </Link>{' '}
          — the denominators.{' '}
          <Link to="/evidence" className="underline underline-offset-2">
            Evidence audit
          </Link>{' '}
          — the tiering procedure applied claim by claim.
        </p>
        <p>
          <strong>Standing.</strong> This page describes a method. It makes no claim about any named person
          or company.
        </p>
      </Footnote>
    </article>
  );
}
