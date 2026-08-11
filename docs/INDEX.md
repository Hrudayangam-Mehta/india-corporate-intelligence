# Index

Every file in this repository, what it is, and what depends on it. Read this before
changing anything — several files are load-bearing for the project's editorial
guarantees, not just for its build.

---

## 1. Read-me-first, in order

| # | File | Why |
|---|---|---|
| 1 | [`README.md`](../README.md) | What the project is, the four invariants, the stack |
| 2 | [`docs/CUSTOM_PLAN.md`](CUSTOM_PLAN.md) | Why the two source projects merged, the phased plan, what shipped |
| 3 | [`.claude/skills/pattern-discipline/SKILL.md`](../.claude/skills/pattern-discipline/SKILL.md) | The anti-apophenia checklist the whole platform exists to enforce |
| 4 | [`.claude/skills/graph-schema/SKILL.md`](../.claude/skills/graph-schema/SKILL.md) | The data model |
| 5 | [`.claude/skills/evidence-tiering/SKILL.md`](../.claude/skills/evidence-tiering/SKILL.md) | How a claim gets a tier |
| 6 | [`docs/INGESTION.md`](INGESTION.md) | How raw research becomes graph data |
| 7 | [`HANDOFF.md`](../HANDOFF.md) | Pick-up-cold prompt for the next session |

---

## 2. The graph engine — `src/graph/`

| File | Role | Load-bearing because |
|---|---|---|
| `schema.ts` | Node / edge / motif types, the four tiers, `hasProvenance()`, `validateGraph()` | **The provenance invariant lives here.** Every other module's guarantees reduce to this file |
| `data.ts` | The Money-Trail Atlas subgraph: 59 nodes, 106 edges, 11 motifs | Generated from the reviewed artefact, then extended by hand with motif patterns and innocent readings. Do not hand-edit census figures |
| `build.ts` | Derives the national graph from the factual datasets | **Never** creates an edge between a person and a company on shared state or shared sector |
| `baseRates.ts` | Published denominators with sources; `computeRate()`; Benjamini–Hochberg FDR | The numbers that kill most proposed edges |
| `nullModel.ts` | Maslov–Sneppen degree-preserving rewiring, motif z-scores, path-length profile | Predicate-preserving: a donation edge can never rewire into a family edge |
| `motifEngine.ts` | Declarative motif templates — chained steps, star steps, negation | Computed, so a motif is allowed to come out empty. Reports `degenerate-null` when the topology makes the test impossible |

## 3. Data — `src/data/`

| File | Role | Notes |
|---|---|---|
| `geo.ts` | 36-state geometry accessor, label modes, `spiralWithin`, name→code resolution | Anchors are poles of inaccessibility, not bbox centres |
| `india-geo.json` | The geometry itself, with `cx`/`cy`/`clearance`/`bbox`/`parts` per state | Generated offline from `india-states.json`; regenerate rather than hand-edit |
| `india-states.json` | Upstream `@svg-maps/india` paths, kept for provenance | Source of truth for the derived file above |
| `companies.ts` | 259 listed companies, state rollups, sector totals, HHI | **Registered** HQ, never operational |
| `politics.ts` | 69 union ministers, portfolios with date ranges, ministry→sector reach | A portfolio without dates is useless — the date test is the primary falsifier |
| `conglomerates.ts` | 10 groups, 64 listed entities, key people, foreign partners | Anil Ambani's entities sit outside `listedEntities` **structurally** |
| `promotion.ts` | Typed accessor over the ingestion report | |

## 4. Visual components — `src/components/`

| File | Role |
|---|---|
| `Editorial.tsx` | Page primitives — `Kicker`, `PageTitle`, `Standfirst`, `Section`, `Callout`, `StatGrid`, `DataTable`, `TierChip`, `TierLegend`, `Cite`, `Footnote` |
| `Layout.tsx` | Grouped sidebar navigation, mobile menu, live dataset counts |
| `viz/IndiaMap.tsx` | The choropleth map — quantile bins, no-data hatch, leader lines, keyboard ring |
| `viz/GeoNetwork.tsx` | **The geographic network** — entities in place, arcs between them, state-flow aggregation, off-map gutter |
| `viz/ForceGraph.tsx` | Force-directed graph; `FAMILY_COLOR`/`FAMILY_LABEL` live here |
| `viz/GraphExplorer.tsx` | Filter rail + graph + detail panel + table twin, with URL-shareable state |
| `viz/FlowSankey.tsx` | Layered flow diagram; band width = ₹ crore, dash = tier |

## 5. Pages — `src/pages/` (21 routes)

**Markets** — `Dashboard` `/` · `MapExplorer` `/map` · `GeoGraph` `/geograph` ·
`IndustryView` `/industries` · `Conglomerates` `/conglomerates` · `Interlocks`
`/interlocks` · `StateProfile` `/states/:code` · `CompanyProfile` `/company/:id`

**Power** — `Cabinet` `/cabinet` · `NetworkView` `/network` · `Atlas` `/atlas` ·
`PoliticalView` `/political` · `MediaView` `/media`

**Method** — `Patterns` `/patterns` · `Motifs` `/motifs` · `EvidenceAudit`
`/evidence` · `BaseRates` `/base-rates` · `Provenance` `/provenance` · `Method`
`/method`

**Tools** — `Search` `/search` · `Watchlist` `/watchlist`

## 6. Scripts — `scripts/`

| File | Command | Fails the build when |
|---|---|---|
| `promote.mjs` | `npm run promote` | A record would produce an edge with no source and a tier that is not `alleged`/`analytic`; or a merge would fuse the two Reliance groups |
| `validate.mjs` | `npm run validate` | Any of the four invariants is violated; geometry is missing or malformed; a motif census has no denominator |
| `smoke.mjs` | `npm run smoke` | Any route renders blank or throws; the map draws fewer than 36 state paths; the map is not keyboard-focusable. Serves `dist` itself |

`npm run check` runs all three plus the build, in order.

## 7. Agents and skills — `.claude/`

Six agents, each with an explicit refusal surface: `graph-cartographer`,
`evidence-auditor`, `base-rate-statistician`, `market-cartographer`,
`polity-analyst`, `viz-engineer`.

Four skills: `evidence-tiering`, `pattern-discipline`, `india-map`, `graph-schema`.

## 8. Research quarantine — `research/`

`research/raw/*.json` is **untrusted**. Research agents write there; nothing is
believed until `promote.mjs` has resolved and grounded it.

| File | Records |
|---|---|
| `raw/cabinet.json` | 69 ministers |
| `raw/companies-by-state.json` | 259 companies, 26 states covered, 10 states explicitly recorded as having none |
| `raw/state-economy.json` | 36 states/UTs |
| `raw/conglomerates.json` | 10 groups, 64 listed entities |
| `raw/pattern-matching-epistemics.md` | The literature review behind `/patterns` |
| `promotion-report.json` | Generated. Merges, collision candidates, rejections, run id |

## 9. Legacy — `docs/legacy/`

Superseded, retained so nothing is lost: the original ICIP master plan, the two
pre-`.claude` skill notes, and the original type model (never wired to real data;
the live model is `src/graph/schema.ts` plus the `src/data/*` modules).

---

## Invariants that live in more than one place

If you change any of these, change **all** the listed sites together.

| Invariant | Sites |
|---|---|
| Provenance: every edge sourced or `alleged`/`analytic` | `schema.ts:hasProvenance`, `validate.mjs`, `promote.mjs`, `/method` live check |
| Unresolved entities take no edges | `schema.ts:validateGraph`, `validate.mjs`, `promote.mjs`, `GraphExplorer` detail panel |
| Analytic edges and motifs carry an innocent reading | `schema.ts`, `validate.mjs`, `motifEngine.ts`, every page that renders a motif |
| No edge from co-location | `build.ts` (by omission), `/states/:code`, `/company/:id`, `/geograph` — all three say so in prose |
| Registered ≠ operational HQ | `companies.ts`, `market-cartographer` agent, `/map`, `/company/:id`, `/geograph` |
| The two Ambani groups never merge | `conglomerates.ts` type shape, `promote.mjs` structural guard, `/conglomerates` |
