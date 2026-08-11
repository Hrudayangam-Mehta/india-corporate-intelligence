import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Kicker, PageTitle, Standfirst, Section, Callout } from '../components/Editorial';
import { useData } from '../context/DataContext';
import { STATE_NAMES, STATES } from '../data/geo';
import { RANK_LABEL } from '../data/politics';

/**
 * Universal search.
 *
 * Matching is literal substring, deliberately. Fuzzy matching is exactly how
 * unrelated entities with similar names get fused into a single apparent network —
 * the primary defamation risk in a platform like this — so results are grouped by
 * what kind of thing they are and never merged.
 */

type Hit =
  | { kind: 'company'; id: string; title: string; sub: string; to: string }
  | { kind: 'minister'; id: string; title: string; sub: string; to: string }
  | { kind: 'group'; id: string; title: string; sub: string; to: string }
  | { kind: 'state'; id: string; title: string; sub: string; to: string }
  | { kind: 'entity'; id: string; title: string; sub: string; to: string };

const KIND_LABEL: Record<Hit['kind'], string> = {
  company: 'Listed companies',
  minister: 'Union ministers',
  group: 'Conglomerate groups',
  state: 'States and UTs',
  entity: 'Graph entities',
};

export default function Search() {
  const [q, setQ] = useState('');
  const { companies, ministers, groups, nodes } = useData();

  const hits = useMemo((): Hit[] => {
    const needle = q.trim().toLowerCase();
    if (needle.length < 2) return [];
    const out: Hit[] = [];

    for (const c of companies) {
      const hay = `${c.name} ${c.shortName} ${c.nse ?? ''} ${c.bse ?? ''} ${c.isin ?? ''} ${c.hqCity} ${c.industry} ${c.group ?? ''}`.toLowerCase();
      if (hay.includes(needle)) {
        out.push({
          kind: 'company',
          id: c.id,
          title: c.shortName || c.name,
          sub: `${c.nse ?? c.bse ?? 'unlisted ticker'} · ${c.industry} · ${c.hqCity}, ${STATE_NAMES[c.stateCode]}`,
          to: `/company/${c.id}`,
        });
      }
    }

    for (const m of ministers) {
      const hay = `${m.name} ${m.party} ${m.constituency ?? ''} ${m.state} ${m.portfolios.join(' ')}`.toLowerCase();
      if (hay.includes(needle)) {
        out.push({
          kind: 'minister',
          id: m.id,
          title: m.name,
          sub: `${RANK_LABEL[m.rank]} · ${m.portfolios[0]} · ${m.constituency ?? m.state}`,
          to: '/cabinet',
        });
      }
    }

    for (const g of groups) {
      const hay = `${g.name} ${g.promoterFamily} ${g.sectors.join(' ')} ${g.listedEntities.map((e) => e.name).join(' ')}`.toLowerCase();
      if (hay.includes(needle)) {
        out.push({
          kind: 'group',
          id: g.id,
          title: g.name,
          sub: `${g.listedEntities.length} listed entities · ${g.hqCity}, ${g.state}`,
          to: '/conglomerates',
        });
      }
    }

    for (const s of STATES) {
      if (s.name.toLowerCase().includes(needle) || s.id === needle) {
        out.push({ kind: 'state', id: s.id, title: s.name, sub: 'state or union territory', to: `/states/${s.id}` });
      }
    }

    const seen = new Set(out.map((h) => h.title.toLowerCase()));
    for (const n of nodes) {
      const hay = `${n.label} ${n.sub ?? ''} ${(n.al ?? []).join(' ')}`.toLowerCase();
      if (hay.includes(needle) && !seen.has(n.label.toLowerCase())) {
        out.push({
          kind: 'entity',
          id: n.id,
          title: n.label,
          sub: `${n.sub ?? n.ty}${n.al?.length ? ` · also known as ${n.al.slice(0, 2).join(', ')}` : ''}`,
          to: n.id.startsWith('co:') || n.id.startsWith('grp:') ? '/network' : '/atlas',
        });
      }
    }

    return out;
  }, [q, companies, ministers, groups, nodes]);

  const grouped = useMemo(() => {
    const m = new Map<Hit['kind'], Hit[]>();
    for (const h of hits) {
      if (!m.has(h.kind)) m.set(h.kind, []);
      m.get(h.kind)!.push(h);
    }
    return m;
  }, [hits]);

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Search</Kicker>
        <PageTitle>Find an entity</PageTitle>
        <Standfirst>
          Companies, ministers, conglomerate groups, states, and every node in the graph — including
          aliases. Results are grouped by what kind of thing they are and are never merged across kinds.
        </Standfirst>
      </header>

      <div className="my-6">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <input
          id="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus
          placeholder="company, ticker, ISIN, minister, group, state, alias…"
          className="input-field !text-base !py-3"
        />
        <p className="font-mono text-[10.5px] text-text-muted mt-2">
          {q.trim().length < 2 ? 'type at least two characters' : `${hits.length} result${hits.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {q.trim().length >= 2 && hits.length === 0 && (
        <Callout label="No match" tone="note">
          <p>
            Nothing in the dataset matches “{q.trim()}”. Matching is literal substring rather than fuzzy,
            deliberately: approximate name matching is how unrelated people and companies get fused into
            one apparent network. If you expected a match, the entity is probably not in the dataset yet —
            which is a coverage gap, not a finding.
          </p>
        </Callout>
      )}

      {[...grouped.entries()].map(([kind, list]) => (
        <Section key={kind} title={KIND_LABEL[kind]} note={`${list.length} match${list.length === 1 ? '' : 'es'}`}>
          <ul className="space-y-1.5">
            {list.slice(0, 60).map((h) => (
              <li key={`${h.kind}-${h.id}`}>
                <Link to={h.to} className="block card-surface px-4 py-3">
                  <span className="text-[15px] text-text">{h.title}</span>
                  <span className="block text-[12.5px] text-text-muted mt-0.5">{h.sub}</span>
                </Link>
              </li>
            ))}
          </ul>
          {list.length > 60 && (
            <p className="font-mono text-[10.5px] text-text-muted mt-2">
              Showing 60 of {list.length}. Narrow the query — nothing is silently dropped from the count.
            </p>
          )}
        </Section>
      ))}
    </article>
  );
}
