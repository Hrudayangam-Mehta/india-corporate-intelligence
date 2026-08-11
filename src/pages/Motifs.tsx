import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Kicker, PageTitle, Standfirst, Byline, Section, Callout, StatGrid, DataTable, TierChip, Prose, Footnote,
} from '../components/Editorial';
import { useData } from '../context/DataContext';
import { TEMPLATES, runMotif, VERDICT_META, type MotifResult } from '../graph/motifEngine';
import { NODES, EDGES } from '../graph/data';
import { buildNationalGraph } from '../graph/build';

/**
 * Computed motifs.
 *
 * Every pattern here is matched from a declarative template at load time, scored
 * against a degree-preserving null model, and reported with its census — including
 * when it finds nothing. The symmetry check runs the identical templates over a
 * control graph the theory says nothing about.
 */

type Scope = 'atlas' | 'national' | 'all';

const TONE: Record<string, string> = {
  sage: 'text-sage border-sage/50 bg-sage/10',
  accent: 'text-accent border-accent/50 bg-accent/10',
  muted: 'text-text-muted border-border-light bg-bg-elevated',
  rose: 'text-rose border-rose/50 bg-rose/10',
};

function MotifCard({ r, open, onToggle }: { r: MotifResult; open: boolean; onToggle: () => void }) {
  const meta = VERDICT_META[r.verdict];
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button onClick={onToggle} aria-expanded={open} className="w-full text-left p-4">
        <div className="flex items-start gap-3">
          <span className="font-mono text-[10px] text-text-muted pt-1 w-7 flex-shrink-0">{r.template.id}</span>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h3 className="font-medium text-[15.5px]">{r.template.name}</h3>
              <TierChip tier={r.template.tier} />
              <span className={`font-mono text-[9.5px] uppercase tracking-[0.11em] px-1.5 py-0.5 border rounded ${TONE[meta.tone]}`}>
                {meta.label}
              </span>
            </div>
            <p className="text-[13.5px] text-text-muted mt-1.5 leading-snug max-w-[68ch]">{r.template.note}</p>
            <p className="font-mono text-[10.5px] text-text-muted mt-2">
              {r.instances.length} path{r.instances.length === 1 ? '' : 's'} · {r.census.members} of{' '}
              {r.census.population} {r.census.label}
              {r.significance && r.verdict !== 'degenerate-null' ? ` · z = ${r.significance.zScore.toFixed(2)}` : ''}
              {r.verdict === 'degenerate-null' ? ' · no z-score: the null model has zero variance here' : ''}
            </p>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          <p className="text-[13.5px] text-text-muted leading-relaxed max-w-[70ch]">{meta.note}</p>

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-1.5">Template</p>
            <code className="block text-[12px] text-teal bg-bg p-2.5 rounded border border-border overflow-x-auto">
              ({r.template.startLabel}){' '}
              {r.template.steps
                .map((s) => `${s.from === 'start' ? '⌐' : ''}-[${s.preds.join('|')}]${s.dir === 'in' ? '<-' : '->'} (${s.label ?? '?'})`)
                .join(' ')}
              {r.template.mustNotHave ? ` NOT -[${r.template.mustNotHave.preds.join('|')}]-> (${r.template.mustNotHave.label})` : ''}
              {r.template.windowDays ? ` WITHIN ${r.template.windowDays}d` : ''}
            </code>
          </div>

          {r.significance && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Observed</p>
                <p className="font-mono text-xl text-accent">{r.significance.observed}</p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Null model</p>
                <p className="font-mono text-xl">
                  {r.significance.nullMean.toFixed(1)} <span className="text-text-muted text-sm">± {r.significance.nullSd.toFixed(1)}</span>
                </p>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Score</p>
                {r.verdict === 'degenerate-null' ? (
                  <p className="font-mono text-[13px] text-rose leading-snug">
                    undefined
                    <span className="block text-[11px] text-text-muted mt-1">
                      zero variance across {r.significance.shuffles} rewirings — no test is possible
                    </span>
                  </p>
                ) : (
                  <p className="font-mono text-xl">
                    z = {r.significance.zScore.toFixed(2)}
                    <span className="block text-[11px] text-text-muted">
                      p<sub>emp</sub> {r.significance.pEmpirical.toFixed(3)} · {r.significance.shuffles} rewirings
                    </span>
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-sage mb-1.5">Innocent reading — mandatory</p>
            <p className="text-[14px] text-text-secondary leading-relaxed max-w-[70ch]">{r.template.innocentReading}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-1.5">Upgrades if</p>
              <p className="text-[13.5px] text-text-secondary leading-relaxed">{r.template.upgradeIf}</p>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-rose mb-1.5">Killed by</p>
              <p className="text-[13.5px] text-text-secondary leading-relaxed">{r.template.killIf}</p>
            </div>
          </div>

          {r.instances.length > 0 && (
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted mb-2">
                Matched paths {r.instances.length > 12 ? `(first 12 of ${r.instances.length})` : ''}
              </p>
              <ul className="space-y-1.5">
                {r.instances.slice(0, 12).map((inst, i) => (
                  <li key={i} className="font-mono text-[11.5px] text-text-secondary">
                    {inst.path.join(' → ')}
                    <span className="text-text-muted">
                      {' '}
                      · weakest link {inst.weakestTier}
                      {inst.spanDays != null ? ` · span ${Math.round(inst.spanDays)}d` : ' · undated'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Motifs() {
  const { nodes: allNodes, edges: allEdges } = useData();
  const [scope, setScope] = useState<Scope>('atlas');
  const [open, setOpen] = useState<string | null>('T5');

  const national = useMemo(() => buildNationalGraph(), []);

  const graph = useMemo(() => {
    if (scope === 'atlas') return { nodes: NODES, edges: EDGES };
    if (scope === 'national') return national;
    return { nodes: allNodes, edges: allEdges };
  }, [scope, national, allNodes, allEdges]);

  const results = useMemo(
    () => TEMPLATES.map((t) => runMotif(graph.nodes, graph.edges, t, scope === 'all' ? 60 : 200)),
    [graph, scope],
  );

  // The symmetry check: identical templates, a graph the theory says nothing about.
  const control = useMemo(() => TEMPLATES.map((t) => runMotif(national.nodes, national.edges, t, 60)), [national]);

  const found = results.filter((r) => r.instances.length > 0).length;
  const notable = results.filter((r) => r.verdict === 'notable').length;
  const untestable = results.filter((r) => r.verdict === 'degenerate-null' || r.verdict === 'under-powered').length;
  const controlFound = control.filter((r) => r.instances.length > 0).length;

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Motif engine · computed, not hand-tagged</Kicker>
        <PageTitle>Patterns that are allowed to come out empty</PageTitle>
        <Standfirst>
          Every motif here is matched from a declarative template over typed edges, at load time, and
          scored against a degree-preserving rewiring of the same graph. A hand-tagged motif is an
          assertion wearing the costume of a query — the analyst decides which edges belong to the
          pattern, so the pattern can never fail to be found. These can, and several do.
        </Standfirst>
        <Byline>
          {TEMPLATES.length} templates · matched over {graph.nodes.length} entities and {graph.edges.length}{' '}
          relationships · null model: Maslov–Sneppen double-edge swap, predicate-preserving
        </Byline>
      </header>

      <StatGrid
        items={[
          { value: `${found}/${TEMPLATES.length}`, label: 'templates that match anything at all in this scope' },
          { value: String(notable), label: 'exceeding what a degree-preserving rewiring produces', tone: notable ? 'accent' : 'sage' },
          { value: String(untestable), label: 'that this graph is too small or too star-shaped to test at all', tone: 'rose' },
          { value: `${controlFound}/${TEMPLATES.length}`, label: 'matching in the control graph — the symmetry check', tone: 'muted' },
        ]}
      />

      <Callout label="Why this page exists" tone="bottomline">
        <p>
          The reference implementation this platform inherited tagged motif membership by hand on each
          edge. That is a defensible way to tell a story and an indefensible way to test one: it makes the
          motif unfalsifiable by construction. Replacing hand-tags with templates means the engine reports{' '}
          <strong>Not found</strong> when a pattern is not there, and <strong>Unremarkable</strong> when
          the network's shape already explains it.
        </p>
        <p>
          Most of these come back unremarkable, and several come back untestable. Both are the expected
          results, and reporting them is the point.
        </p>
      </Callout>

      {untestable > 0 && (
        <Callout label="What the engine found out about itself" tone="warn">
          <p>
            {untestable} of {TEMPLATES.length} templates cannot be tested on this graph at all. The
            case-study subgraph is <strong>star-shaped</strong> — nearly every award edge shares a single
            ministry as its source — so a degree-preserving double-edge swap between two award edges
            returns the same edge set. The null model has zero variance, and a z-score computed against it
            would be meaningless.
          </p>
          <p>
            This is a real limit on what a hand-assembled subgraph of this size can support, and it is
            surfaced rather than papered over with a confident-looking 0.00. Testing these patterns
            properly needs the full award population — every coal and mining award 2019–24 against every
            donor — which is on the{' '}
            <Link to="/watchlist" className="underline underline-offset-2">
              watchlist
            </Link>{' '}
            as computable-from-public-data-today.
          </p>
        </Callout>
      )}

      <div className="flex flex-wrap gap-1.5 my-6">
        {(
          [
            ['atlas', 'Case study', 'The tiered, sourced, allegation-bearing subgraph.'],
            ['national', 'National layers', 'Roster and ownership facts only. This is also the control set.'],
            ['all', 'Everything merged', 'Slower — fewer rewirings, and the z-scores are correspondingly weaker.'],
          ] as [Scope, string, string][]
        ).map(([id, label, note]) => (
          <button
            key={id}
            onClick={() => setScope(id)}
            title={note}
            className={`font-mono text-[11px] px-3 py-1.5 rounded border transition-colors ${
              scope === id ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <Section title="Templates" note="Click to expand — the pattern, the null-model score, the innocent reading, and the kill condition">
        <div className="space-y-2.5">
          {results.map((r) => (
            <MotifCard key={r.template.id} r={r} open={open === r.template.id} onToggle={() => setOpen(open === r.template.id ? null : r.template.id)} />
          ))}
        </div>
      </Section>

      <Section
        title="The symmetry check"
        note="The identical templates, run over a graph containing no allegations at all"
      >
        <Prose>
          <p>
            The single most useful check in this whole discipline: run the same analysis on a control set
            you have no theory about. If the method produces an equally striking result there, the method
            is generating the finding rather than detecting it.
          </p>
          <p>
            The control here is the <strong>national layer</strong> — cabinet roster facts and conglomerate
            ownership, with no award, donation or enforcement edges in it whatsoever. Templates that depend
            on those predicates <em>must</em> come back empty. Templates that fire anyway are matching on
            something structural rather than on the substance they claim to detect.
          </p>
        </Prose>
        <DataTable
          columns={['Template', 'Case study', 'Control graph', 'Reading']}
          rows={results.map((r, i) => {
            const c = control[i];
            const bothFire = r.instances.length > 0 && c.instances.length > 0;
            return [
              <strong key="t" className="text-text">
                {r.template.name}
              </strong>,
              <span key="a" className="font-mono text-[12px]">
                {r.instances.length} path{r.instances.length === 1 ? '' : 's'}
              </span>,
              <span key="c" className="font-mono text-[12px]">
                {c.instances.length} path{c.instances.length === 1 ? '' : 's'}
              </span>,
              <span key="r" className={`text-[12.5px] ${bothFire ? 'text-amber' : 'text-text-muted'}`}>
                {bothFire
                  ? 'Fires in both — the pattern is at least partly structural, so treat any reading of it with corresponding caution.'
                  : c.instances.length === 0 && r.instances.length > 0
                    ? 'Fires only where the substantive edges exist, which is the behaviour a template should have.'
                    : 'Does not fire in either.'}
              </span>,
            ];
          })}
        />
      </Section>

      <Footnote>
        <p>
          <strong>Method.</strong> Paths are simple (no repeated nodes). The null model is a
          predicate-preserving Maslov–Sneppen double-edge swap: a donation edge can never be rewired into
          a family edge, because that would compare the observed graph against an ensemble it could not
          have come from. Time windows never fail on undated edges — absence of a date is not evidence of
          proximity, and treating it as such manufactures the finding.
        </p>
        <p>
          <strong>Power.</strong> Shuffle counts are modest so this runs in the browser, and every score
          reports the count it was computed at. An under-powered z-score labelled as such is more useful
          than a precise one nobody waits for — and where the candidate population is under ten entities,
          the verdict says <em>under-powered</em> rather than pretending otherwise.{' '}
          <Link to="/patterns" className="underline underline-offset-2">
            Why any of this is necessary
          </Link>
          .
        </p>
      </Footnote>
    </article>
  );
}
