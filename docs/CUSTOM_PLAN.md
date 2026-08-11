# ICIP × Money-Trail Atlas — Integrated Build Plan

*Version 2.0 · 2026-08-11 · supersedes the scope in `MASTER_PLAN.md` (which is retained as the breadth roadmap)*

---

## 1. What happened to the plan

Two projects arrived at the same place from opposite ends.

**ICIP** (this repo) started from **breadth**: map every NSE/BSE company, every
state, every industry, every political and media connection. It has a React shell,
a type system, and sample data. Its weakness is that breadth without an evidence
discipline produces exactly the artefact the Money-Trail Atlas work warns about —
a dense, alarming-looking web whose edges are near-universal and therefore measure
nothing.

**The Money-Trail Atlas** started from **depth**: one minister, ~71 nodes, ~117
edges, every one a sourced claim with an evidence tier, built to Karpathy's graph-
engineering method. Its weakness is that it is a single 300 KB HTML file with data,
geometry and render code fused, invariants held by author care rather than by code,
and no path to scale.

**The integration thesis:** ICIP supplies the scale, the Atlas supplies the
epistemics. The Atlas's four invariants — provenance, entity resolution,
supersession, contradiction-as-first-class — become the *schema* of the ICIP graph,
enforced in CI. ICIP's state/company/industry backbone becomes the population that
gives Atlas claims their denominators.

That last point is the whole design. The Atlas repeatedly hit the same wall: *is
this edge unusual?* It could not answer, because it had no population to compare
against. 82.45% of electoral-trust money went to one party; ~100% of responding
PSUs gave to PM CARES; CSR is compulsory by statute. Every one of those base rates
killed an edge. ICIP's several-hundred-company dataset **is** the reference class.
Built together, the base-rate check stops being a manual footnote and becomes a
query.

---

## 2. Non-negotiable guardrails

Carried verbatim from the Atlas hand-off. These are acceptance criteria, not aspirations.

1. **Alleged ≠ proven.** The platform maps public records and published claims. It
   asserts no guilt. No node adjudicates a quid pro quo. No feature may make this
   distinction less legible than it is today.
2. **Provenance invariant.** Every edge carries `srcs` **or** is tier
   `alleged`/`analytic`. Enforced by `scripts/validate.mjs`; CI fails on violation.
   Never invent a source, figure, date, quote, ticker or CIN.
3. **Correlation ≠ causation.** Every `analytic` edge and every motif ships with an
   `innocentReading` — the boring explanation that also fits the data.
4. **Absence is reported as loudly as presence.** The documented void — a top
   beneficiary with zero traceable donations, a decision with no file noting — is
   the integrity check on the whole exercise.
5. **Entity resolution before edges.** Nothing with `resolved: false` takes an
   edge. Name matching at scale is a defamation generator, not a network graph.
6. **Denials are first-class.** `contra` edges render as prominently as what they
   contradict.

---

## 3. Architecture — invariants true by construction

```
                        ┌─────────────────────────────────┐
   research/raw/*.json  │  EXTRACTION                     │  subagents propose
   (agent output)  ───► │  claims with provenance         │  claims, never facts
                        └──────────────┬──────────────────┘
                                       ▼
                        ┌─────────────────────────────────┐
                        │  RESOLUTION                     │  canonical node +
                        │  alias merge, confidence,       │  rationale; unresolved
                        │  collision-risk flag            │  entities quarantined
                        └──────────────┬──────────────────┘
                                       ▼
                        ┌─────────────────────────────────┐
                        │  GROUNDING (evidence-auditor)   │  date test → identity
                        │  tier assignment, falsifier,    │  test → base rate →
                        │  base rate, denial capture      │  falsifier → tier
                        └──────────────┬──────────────────┘
                                       ▼
                        ┌─────────────────────────────────┐
                        │  ASSEMBLY  src/graph/*.ts       │  supersede/contra,
                        │  + scripts/validate.mjs (CI)    │  never overwrite
                        └──────────────┬──────────────────┘
                                       ▼
                        ┌─────────────────────────────────┐
                        │  QUERY  motif engine, base-rate │  computed at build,
                        │  engine, React views            │  not hand-tagged
                        └─────────────────────────────────┘
```

Key departures from the Atlas single-file artefact:

- Data is separated from presentation. `src/data/` (facts) and `src/graph/`
  (claims) are typed TS modules, diffable and reviewable.
- Geometry is an asset (`src/data/india-geo.json`), not 173 KB of inlined JS.
- Motifs are computed from declarative patterns, not hand-tagged on edges.
- The provenance invariant is a build step, not an author's habit.

---

## 4. The agent roster

Defined in `.claude/agents/`. Each is hired for a bounded job with an explicit
refusal surface.

| Agent | Owns | Refuses to |
|---|---|---|
| `graph-cartographer` | `src/graph/` — nodes, edges, aliases, resolution | Create a node on a name match; delete a superseded fact |
| `evidence-auditor` | Tier assignment, falsifiers, denials | Soften a COLLAPSES verdict; publish an allegation without its denial |
| `base-rate-statistician` | Denominators, null models, FDR correction | Report a numerator without a denominator |
| `market-cartographer` | `src/data/companies.ts`, `states.ts` | Conflate registered HQ with operational HQ; conflate the two Ambani groups |
| `polity-analyst` | `src/data/politics.ts` | Record a portfolio without a date range |
| `viz-engineer` | `src/components/viz/` | Draw a state as a rectangle; restyle a tier for aesthetics |

Supporting skills in `.claude/skills/`: `evidence-tiering`, `pattern-discipline`,
`india-map`, `graph-schema`.

**Division of labour:** research agents (with web access) write to
`research/raw/*.json` — a quarantine zone. Nothing there is trusted. The
evidence-auditor and base-rate-statistician promote from `research/raw/` into
`src/data/` and `src/graph/`. This mirrors the extraction → grounding boundary and
means a hallucinating researcher cannot corrupt the graph without passing a gate.

---

## 5. Pages

### Existing, rebuilt
| Route | Change |
|---|---|
| `/` Dashboard | Real aggregates over the full dataset; evidence-tier census |
| `/map` Map Explorer | **Complete rebuild.** Real 36-state geometry, pole-of-inaccessibility labels, quantile choropleth, NSE/BSE toggle, drill-down |
| `/network` Network | Rebuilt on the tiered graph engine, with the full filter rail |
| `/industries`, `/political`, `/media`, `/search`, `/watchlist`, `/company/:id` | Rewired to the real dataset |

### New
| Route | What it is |
|---|---|
| `/patterns` | **Pattern Discipline** — the deep research on apophenia, base-rate neglect, clustering illusion, multiple comparisons, hub and small-world artefacts; the seven traps table; the symmetry check; the documented-conspiracies counterweight. The methodological spine of the project. |
| `/evidence` | **Evidence Audit** — the tier ladder, the date-test timeline, the falsification table, the name-collision trap, "what would change the conclusion". Ported from the audit artefacts. |
| `/base-rates` | **Base Rates** — the discriminating-power bars, the tender ledger, the denominator ledger. Answers "compared to what?" for every edge type. |
| `/cabinet` | **The Cabinet Graph** — Union Council of Ministers, portfolios with date ranges, constituencies, home states, and the ministry→PSU→sector chain. |
| `/conglomerates` | **Ambani & Adani** — group structure graphs for the two largest private groups plus the next tier, with the Mukesh/Anil distinction made structurally impossible to miss. |
| `/states/:code` | **State drill-down** — top listed companies, dominant industries, GSDP, ministers from that state, exchange split. |
| `/atlas` | **Money-Trail Atlas** — the depth case study, now running on the shared engine. |
| `/method` | How the graph is built, the four invariants, the tier definitions, what the project will not do. |

---

## 6. Phases and acceptance criteria

### Phase A — Foundation *(this pass)*
- [x] Real 36-state geometry with computed pole-of-inaccessibility anchors
- [x] Agent roster + skills, with refusal surfaces
- [ ] `src/graph/schema.ts` + `scripts/validate.mjs` enforcing the invariant
- [ ] Rebuilt India map (NSE/BSE, choropleth, drill-down)
- [ ] Graph engine with the filter rail
- [ ] `/patterns`, `/evidence`, `/base-rates`, `/cabinet`, `/conglomerates`, `/states/:code`

**Acceptance:** `npm run build` and `npm run validate` both pass. No edge violates
the provenance invariant. No state renders as a rectangle. Every tier appears in
the legend.

### Phase B — Population and denominators
- Companies dataset to 250+ with per-state coverage; state economy layer
- Base-rate engine: any edge type can report its rate against the population
- Motif engine: declarative patterns computed at build, with census + z-score

**Acceptance:** every motif in the UI shows numerator, denominator and z-score
against a degree-preserving null model. No hand-tagged motifs remain.

### Phase C — Ingestion
- Extractor → resolver → grounder → assembler pipeline over `research/raw/`
- Entity-resolution report: every merge with its rationale and confidence
- Supersession log rendered as a visible changelog

**Acceptance:** every published claim traces to a source **and** a run id.

### Phase D — Depth and breadth
- Director-interlock graph; promoter-holding layer; media ownership
- Time-range filter across all views; flow-direction (Sankey) mode
- URL-hash state for share/export; the WCAG-clean table twin of every graphic

### Phase E — The investigative watchlist
Carried from the Atlas analysis, as dated, checkable actions:
- FY2025-26 electoral-trust and party contribution filings (due ~Nov 2026–Feb 2027)
- L&T's Companies Act s.182 line against the ₹500 cr Elevated Avenue donation
- ECI alphanumeric bond file: purchaser → party match for the Rungta purchases
- PPPAC 2022 minutes — the wording of the FCI anti-monopoly clause removal *(RTI-shaped)*
- PM CARES FY24/FY25 statements *(RTI-shaped)*
- Coal India and mining-PSU CSR destinations 2019–24 — the direct analogue of the
  ONGC finding, inside the relevant ministry. Public reports; nobody has run it.
  **The single most answerable open question in the file.**
- A base-rate study of electoral bonds against every coal/mining award 2019–24,
  with a shuffled control. Until someone runs it, the quid-pro-quo claim is
  unproven in both directions.

---

## 7. What this project will not do

- Assert that any named person committed an offence.
- Publish a private individual's details, or any allegation about a person with no
  public role.
- Link entities on name similarity.
- Render a pattern as a finding without its denominator, its innocent reading, and
  its kill condition.
- Present a self-declared affidavit figure as an audited one, or an asset
  trajectory without its peer baseline.

---

## 8. Open assumptions

1. Market caps and cabinet composition are stamped `asOf` and will drift. Every
   figure in the UI carries its date.
2. Registered HQ is used for state attribution throughout; operational reality is a
   separate, explicitly labelled field.
3. Map marks are positioned *within* a state, not geocoded, except where a real
   city coordinate exists. The UI says so wherever marks appear.
4. GSDP figures, where present, are the most recent verifiable MoSPI/RBI series and
   are labelled with their year.
