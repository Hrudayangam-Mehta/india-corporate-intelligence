import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Kicker, PageTitle, Standfirst, Byline, Section, Callout, StatGrid, DataTable, Prose, Footnote,
} from '../components/Editorial';
import { GROUPS, GROUPS_AS_OF } from '../data/conglomerates';
import { MINISTERS } from '../data/politics';
import { benjaminiHochberg } from '../graph/baseRates';

/**
 * Interlocks.
 *
 * Which people hold roles across more than one entity, computed from the group
 * datasets. This is the classic OSINT network view and the classic OSINT trap: the
 * whole analysis lives or dies on entity resolution, and name matching alone
 * fuses unrelated people at scale.
 *
 * So the page does two things at once — it computes the interlocks, and it reports
 * how many of them rest on a name match it cannot independently confirm.
 */

interface Person {
  name: string;
  roles: { role: string; entity: string; group: string; groupId: string; family: boolean; since: string | null }[];
  /** Distinct groups this name appears in. Cross-group is where the risk concentrates. */
  groups: Set<string>;
  srcs: [string, string][];
}

/** Surnames common enough in India that a bare name match is not identification. */
const HIGH_COLLISION = [
  'sharma', 'singh', 'kumar', 'patel', 'shah', 'gupta', 'joshi', 'reddy', 'rao',
  'agarwal', 'agrawal', 'mehta', 'desai', 'nair', 'menon', 'iyer', 'das', 'roy',
  'chatterjee', 'banerjee', 'mukherjee', 'yadav', 'verma', 'jain', 'khan', 'ahmed',
];

function collisionRisk(name: string): 'high' | 'moderate' | 'low' {
  const parts = name.toLowerCase().replace(/[.,]/g, '').split(/\s+/);
  const surname = parts[parts.length - 1];
  if (HIGH_COLLISION.includes(surname)) return parts.length >= 3 ? 'moderate' : 'high';
  return 'low';
}

const RISK_CLASS = {
  high: 'text-rose border-rose/50',
  moderate: 'text-amber border-amber/50',
  low: 'text-sage border-sage/50',
};

export default function Interlocks() {
  const [minRoles, setMinRoles] = useState(2);

  const people = useMemo(() => {
    const m = new Map<string, Person>();
    for (const g of GROUPS) {
      for (const p of g.keyPeople) {
        const key = p.name.trim().toLowerCase();
        if (!m.has(key)) m.set(key, { name: p.name.trim(), roles: [], groups: new Set(), srcs: [] });
        const rec = m.get(key)!;
        rec.roles.push({ role: p.role, entity: p.entity, group: g.name, groupId: g.id, family: p.family, since: p.since });
        rec.groups.add(g.id);
        for (const s of p.srcs ?? []) if (!rec.srcs.some((x) => x[1] === s[1])) rec.srcs.push(s);
      }
    }
    return [...m.values()];
  }, []);

  const interlocked = useMemo(
    () =>
      people
        .filter((p) => p.roles.length >= minRoles)
        .sort((a, b) => b.groups.size - a.groups.size || b.roles.length - a.roles.length),
    [people, minRoles],
  );

  const crossGroup = interlocked.filter((p) => p.groups.size > 1);
  const risky = interlocked.filter((p) => collisionRisk(p.name) !== 'low');

  // Ministers sharing a surname with an interlocked person. Presented as a
  // false-positive demonstration, never as a link.
  const surnameCoincidences = useMemo(() => {
    const out: { minister: string; person: string; surname: string }[] = [];
    const surnameOf = (n: string) => n.toLowerCase().replace(/[.,]/g, '').split(/\s+/).pop()!;
    for (const m of MINISTERS) {
      const ms = surnameOf(m.name);
      for (const p of people) {
        if (surnameOf(p.name) === ms && m.name.toLowerCase() !== p.name.toLowerCase()) {
          out.push({ minister: m.name, person: p.name, surname: ms });
        }
      }
    }
    return out;
  }, [people]);

  /**
   * The denominator argument, done properly.
   *
   * The temptation is to correct the p-values of the coincidences you found. That
   * is the wrong calculation: the question is how many coincidences the comparison
   * family produces by chance, and whether the observed count exceeds it.
   *
   * Family = every minister × every mapped office-holder. `pShare` is a deliberately
   * conservative estimate of the chance two independent Indian names share a
   * surname — conservative in the direction that FAVOURS the suspicious reading.
   */
  const family = MINISTERS.length * people.length;
  const pShare = 1 / 200;
  const expectedByChance = family * pShare;
  const excess = surnameCoincidences.length - expectedByChance;

  // Shown for the case where a real per-pair test exists. With every pair carrying
  // the same crude p, BH is uninformative — and saying so is the point.
  const fdr = useMemo(
    () => (surnameCoincidences.length ? benjaminiHochberg(new Array(surnameCoincidences.length).fill(pShare), 0.05) : null),
    [surnameCoincidences, pShare],
  );

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Interlocks · and the trap they set</Kicker>
        <PageTitle>Who sits on more than one board</PageTitle>
        <Standfirst>
          The classic network view — people holding roles across multiple entities — and the classic
          network trap. This analysis lives or dies entirely on entity resolution, so the page computes the
          interlocks <em>and</em> reports how many rest on a name match it cannot independently confirm.
        </Standfirst>
        <Byline>
          {people.length} mapped office-holders across {GROUPS.length} groups · as of {GROUPS_AS_OF} ·
          coverage is the groups' declared key people, not a full directorship register
        </Byline>
      </header>

      <StatGrid
        items={[
          { value: String(interlocked.length), label: `people holding ${minRoles}+ recorded roles` },
          { value: String(crossGroup.length), label: 'holding roles across more than one group', tone: crossGroup.length ? 'accent' : 'sage' },
          { value: String(risky.length), label: 'whose identity rests on a high-collision name', tone: risky.length ? 'rose' : 'sage' },
          { value: String(surnameCoincidences.length), label: 'minister–office-holder surname coincidences, none of which is a link', tone: 'muted' },
        ]}
      />

      <Callout label="Why this page is half caveat" tone="warn">
        <p>
          A directorship-interlock graph is the single easiest way to manufacture a conspiracy from public
          data. Merge on names and you fuse unrelated people; merge on nothing and you miss the real
          interlocks. Neither error is visible in the finished graphic — which is why this page reports the
          resolution status of every row rather than presenting a clean network.
        </p>
        <p>
          Identity here is confirmed only where the source names the same person in the same entity. Where
          a match rests on a common surname it is flagged, and{' '}
          <strong>a flagged match is not drawn as an edge anywhere in this platform</strong>.
        </p>
      </Callout>

      <Section title="Interlocked office-holders" note="Sorted by number of distinct groups, then number of roles">
        <div className="flex gap-1.5 mb-4">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setMinRoles(n)}
              className={`font-mono text-[11px] px-2.5 py-1.5 rounded border transition-colors ${
                minRoles === n ? 'border-accent text-accent bg-accent/10' : 'border-border text-text-muted hover:text-text'
              }`}
            >
              {n}+ roles
            </button>
          ))}
        </div>

        {interlocked.length === 0 ? (
          <Callout label="Nothing at this threshold" tone="note">
            <p>
              No mapped office-holder holds {minRoles} or more recorded roles. That is a statement about the
              dataset's coverage — the groups' declared key people, not a full directorship register — and
              not about Indian corporate governance.
            </p>
          </Callout>
        ) : (
          <DataTable
            columns={['Person', 'Roles', 'Groups', 'Identity']}
            rows={interlocked.map((p) => {
              const risk = collisionRisk(p.name);
              return [
                <span key="n">
                  <strong className="text-text">{p.name}</strong>
                  {p.roles.some((r) => r.family) && (
                    <span className="ml-2 font-mono text-[9.5px] uppercase tracking-wider text-accent">promoter family</span>
                  )}
                  {p.srcs.length > 0 && (
                    <span className="block font-mono text-[10px] text-text-muted mt-0.5">
                      <a href={p.srcs[0][1]} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
                        {p.srcs[0][0]}
                      </a>
                    </span>
                  )}
                </span>,
                <ul key="r" className="space-y-1">
                  {p.roles.map((r, i) => (
                    <li key={i} className="text-[12.5px]">
                      {r.role} — {r.entity}
                      {r.since ? <span className="text-text-muted"> · since {r.since}</span> : null}
                    </li>
                  ))}
                </ul>,
                <span key="g" className="text-[12.5px]">
                  {[...new Set(p.roles.map((r) => r.group))].join(', ')}
                </span>,
                <span
                  key="i"
                  className={`font-mono text-[9.5px] uppercase tracking-[0.1em] px-1.5 py-0.5 border rounded whitespace-nowrap ${RISK_CLASS[risk]}`}
                  title={
                    risk === 'low'
                      ? 'Distinctive name; a match is unlikely to be a collision.'
                      : 'Common surname — a name match alone is not identification here.'
                  }
                >
                  {risk === 'low' ? 'resolved' : `${risk} collision risk`}
                </span>,
              ];
            })}
          />
        )}
      </Section>

      <Section
        title="Where the real interlock is"
        note="In Indian corporate structure it is family control across entities, not shared board seats"
      >
        <Prose>
          <p>
            The board-interlock frame is imported from American corporate-governance research, where
            dispersed ownership makes shared directorships the main channel of coordination. It maps
            poorly onto India, where the dominant structure is a{' '}
            <strong>promoter family holding controlling stakes across many separately listed entities</strong>.
            The dataset shows that clearly, and it shows nothing at all in the board-seat frame.
          </p>
        </Prose>
        <DataTable
          columns={['Promoter family', 'Group', 'Listed entities controlled', 'Family office-holders', 'Median promoter stake']}
          rows={GROUPS.map((g) => {
            const stakes = g.listedEntities.map((e) => e.promoterHoldingPct).filter((v): v is number => v != null).sort((a, b) => a - b);
            const median = stakes.length ? stakes[Math.floor(stakes.length / 2)] : null;
            return [
              <strong key="f" className="text-text">
                {g.promoterFamily}
              </strong>,
              <Link key="g" to="/conglomerates" className="text-[13px] hover:text-accent">
                {g.name}
              </Link>,
              <span key="e" className="font-mono text-[13px]">
                {g.listedEntities.length}
              </span>,
              <span key="p" className="font-mono text-[13px]">
                {g.keyPeople.filter((p) => p.family).length}
                <span className="text-text-muted"> of {g.keyPeople.length}</span>
              </span>,
              <span key="m" className="font-mono text-[13px]">
                {median != null ? `${median.toFixed(1)}%` : '—'}
                {stakes.length < g.listedEntities.length && (
                  <span className="block text-[10px] text-amber">{g.listedEntities.length - stakes.length} unrecorded</span>
                )}
              </span>,
            ];
          })}
        />
        <p className="text-[13px] text-text-muted mt-3 max-w-[70ch] leading-relaxed">
          A median promoter stake of 50%+ across several separately listed companies is a far stronger
          coordination mechanism than any number of shared board seats — and it is fully disclosed, in
          quarterly filings, to anyone who looks. The interesting structure in Indian corporate power is
          not hidden. It is published, and largely unexamined.
        </p>
      </Section>

      <Section
        title="The false-positive demonstration"
        note="Run the naive analysis on purpose, so you can see what it would have produced"
      >
        <Prose>
          <p>
            An automated pipeline that links people on surname match would, on this dataset alone, draw{' '}
            <strong>{surnameCoincidences.length} edges</strong> between union ministers and corporate
            office-holders. Every one of them would be false. None is drawn.
          </p>
          <p>
            Now the denominator. The comparison family is {MINISTERS.length} ministers ×{' '}
            {people.length} office-holders = <strong>{family.toLocaleString('en-IN')} pairs</strong>. At a
            conservative 1-in-200 chance that two independent Indian names share a surname — conservative
            in the direction that <em>favours</em> the suspicious reading — chance alone predicts about{' '}
            <strong>{expectedByChance.toFixed(0)} such coincidences</strong> in this dataset.
          </p>
          <p>
            {excess <= 0 ? (
              <>
                We found <strong>{surnameCoincidences.length}</strong>.{' '}
                <strong className="text-sage">
                  That is fewer than chance predicts, not more.
                </strong>{' '}
                There is no excess to explain. Every one of these coincidences is exactly what a dataset
                this size produces on its own, and an analyst who presented them as a network would be
                reporting the arithmetic of large numbers as a finding.
              </>
            ) : (
              <>
                We found <strong>{surnameCoincidences.length}</strong> — an excess of{' '}
                {excess.toFixed(0)} over chance. An excess is not evidence of anything by itself; it is the
                point at which it becomes worth checking identities properly, one pair at a time, against
                DIN or office records.
              </>
            )}
          </p>
          {fdr && (
            <p className="text-[14px] text-text-muted">
              A note on what was deliberately <em>not</em> done: correcting the p-values of the
              coincidences that were found. With every pair carrying the same crude probability, a
              Benjamini–Hochberg pass "retains" all of them and tells you nothing — because the question
              was never whether each individual coincidence is improbable. It is whether the{' '}
              <em>count</em> exceeds what the family size generates. Running the correction anyway, and
              reporting its output as a finding, is one of the more common ways this analysis goes wrong.
            </p>
          )}
        </Prose>
        {surnameCoincidences.length > 0 && (
          <DataTable
            caption="Pairs a naive matcher would fuse. Shown as a warning, never as data."
            columns={['Union minister', 'Corporate office-holder', 'Shared surname', 'Status']}
            rows={surnameCoincidences.slice(0, 25).map((c) => [
              c.minister,
              c.person,
              <span key="s" className="font-mono text-[12px]">
                {c.surname}
              </span>,
              <span key="x" className="font-mono text-[9.5px] uppercase tracking-wider text-rose border border-rose/50 rounded px-1.5 py-0.5">
                not a link
              </span>,
            ])}
          />
        )}
      </Section>

      <Section title="What would make this analysis real" note="">
        <Prose>
          <ul className="space-y-3 list-none pl-0">
            {[
              ['DIN-keyed directorship data', 'The Director Identification Number is the only reliable join key for Indian directorships. MCA holds it. Until every person node carries one, every interlock on this page is provisional.'],
              ['A full board register, not declared key people', 'The current dataset is what each group publishes about its own leadership. A real interlock graph needs every board of every listed company — roughly 5,000 companies and tens of thousands of directorships.'],
              ['A null model for interlocks', 'Directors sit on multiple boards as a matter of routine market structure. Any claim that a particular overlap is meaningful needs the expected overlap rate, computed from a degree-preserving rewiring, alongside it.'],
              ['Time-resolved tenures', 'Two people on the same board in different decades are not an interlock. Every role needs a from and a to.'],
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
          <strong>Coverage.</strong> This page draws on the key people each conglomerate group publicly
          declares — chairmen, managing directors, and named promoters — not on a directorship register.
          Absence of an interlock here means the dataset does not record one, not that none exists.
        </p>
        <p>
          <strong>Standing.</strong> Roles and appointments drawn from company disclosures. No claim is made
          about the conduct of any office-holder, and no relationship is asserted on the basis of a shared
          name.{' '}
          <Link to="/patterns" className="underline underline-offset-2">
            Why entity resolution is the whole ballgame
          </Link>
          .
        </p>
      </Footnote>
    </article>
  );
}
