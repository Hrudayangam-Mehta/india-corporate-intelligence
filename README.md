# India Corporate Intelligence Platform

A map of India's listed corporate landscape joined to a **provenance-bearing knowledge graph** of
political and ownership connections — built so that every claim carries its evidence tier, and every
pattern carries its denominator.

The platform is as interested in what it cannot show as in what it can.

---

## Why it is built this way

Two projects merged here from opposite ends.

**ICIP** started from **breadth** — map every NSE/BSE company, every state, every industry, every
political and media connection. Breadth without an evidence discipline produces exactly the artefact
this project exists to avoid: a dense, alarming-looking web whose edges are near-universal and
therefore measure nothing.

**The Money-Trail Atlas** started from **depth** — one minister, ~70 entities, ~106 relationships,
every one a sourced claim with an evidence tier. Its limit was that it kept hitting the same wall:
*is this edge unusual?* It could not answer, because it had no population to compare against.

**The integration:** the Atlas supplies the epistemics, ICIP supplies the population. The Atlas's four
invariants become the *schema* of the graph, enforced in CI. ICIP's several-hundred-company dataset
**is** the reference class that gives Atlas claims their denominators. The base-rate check stops being
a manual footnote and becomes a query.

Full reasoning: [`docs/CUSTOM_PLAN.md`](docs/CUSTOM_PLAN.md).

---

## The four invariants

Enforced by `npm run validate`, which CI runs. These are build steps, not conventions.

| Invariant | Meaning |
|---|---|
| **Provenance** | Every edge carries `srcs`, **or** is tier `alleged`/`analytic`. No exceptions. Never invent a source, figure, date, quote, ticker or CIN. |
| **Resolution** | One real-world entity, one canonical node, aliases on the node. Identity is confirmed by DIN, constituency, office-with-dates or DOB — never by name match. A node with `resolved: false` **may not be an endpoint of any edge**. |
| **Supersession** | When a fact changes, the old claim is retained and stays addressable. Nothing is ever deleted from the graph. |
| **Contradiction** | Denials and counter-evidence are first-class `contra` edges, rendered as prominently as the claims they answer. |

### Evidence tiers

Line style in every graph carries the tier. It is semantic and is never restyled for looks.

| Tier | Bar |
|---|---|
| `documented` | A primary record says so — gazette, filing, court order, audit report, RTI reply, official portal. Or two independent credible sources. |
| `reported` | A credible outlet with named sourcing or published underlying documents. |
| `alleged` | A named party asserts it. Ships with the denial alongside. |
| `analytic` | Our own comparison. Carries no causal claim. Ships with a mandatory `innocentReading`. |

---

## Pages

Full file-by-file index: [`docs/INDEX.md`](docs/INDEX.md). Picking this up cold:
[`HANDOFF.md`](HANDOFF.md).

**Markets** — `/` dashboard · `/map` the NSE/BSE map · `/geograph` the geographic network ·
`/industries` sector concentration · `/conglomerates` the ten largest groups · `/interlocks` who
sits on more than one board · `/states/:code` per-state drill-down · `/company/:id`

**Power** — `/cabinet` the Union Council of Ministers · `/network` the merged connection graph ·
`/atlas` the Money-Trail case study · `/political` money to parties, with the flow diagram ·
`/media` ownership

**Method** — `/patterns` why every large network looks like a conspiracy · `/motifs` the computed
motif engine · `/evidence` the tiering procedure applied claim by claim · `/base-rates` compared to
what? · `/provenance` the ingestion ledger · `/method` how this is built, with a live integrity check

### The geographic network

`/geograph` draws the graph in place rather than making the reader join a map and a
force-directed layout in their head. Two modes: entities placed in their registered state and
connected by arcs, or relationships aggregated into arcs between states.

Three things it cannot honestly show, all surfaced rather than quietly handled:

- **Nothing is geocoded.** A mark sits on a golden-angle spiral inside its state; its position
  there carries no information.
- **Most of the graph has no place.** People, rules, parties and sectors are not geographic.
  Dropping them would silently delete most of the network; scattering them over the map would
  invent locations. They sit in a labelled side column.
- **Registered ≠ operational.** An arc records where two registered offices are.

Arc curvature is jittered deterministically per pair — Delhi originates most arcs in every view, and
one fixed curvature bundles them into an unreadable blob. Same pair, same curve, so the picture is
reproducible.

### Ingestion

`research/raw/` is a quarantine zone. `npm run promote` runs extraction → resolution → grounding →
assembly with a run id derived from a hash of the inputs, not a clock, so it is reproducible.

On the current data it resolves **515 canonical entities** from 561 records, merges **46 on strong
keys only** (ticker, scrip code, state code, exact corroborated name), and refuses **218 collision
candidates** — including "Reliance Group (Anil Dhirubhai Ambani Group)" against "Reliance Industries
Group (Mukesh Ambani)". Fusing those two is a structural guard that fails the build. 100
weakly-identified records are quarantined as `resolved: false` and take no edges; that is the gate
working, so it does not fail the build. The ledger is at `/provenance`.

### The motif engine

Motifs are **computed from declarative templates** at load time, not hand-tagged on edges. A
hand-tagged motif is an assertion wearing the costume of a query — the analyst decides which edges
belong to the pattern, so the pattern can never fail to be found. These can, and several do.

Templates support chained steps, **star** steps (both legs departing from the same entity), and
**negation** — which is how the documented void became a query rather than a curated list. Every result
is scored against a predicate-preserving Maslov–Sneppen rewiring.

The engine's most useful output so far is about itself: **4 of 5 templates are untestable** on the
case-study subgraph. It is star-shaped — nearly every award edge shares one ministry as its source — so
a degree-preserving swap between two award edges returns the same edge set, the null model has zero
variance, and any z-score against it is meaningless. The engine reports *null model degenerate* and
says why, rather than printing a confident-looking `z = 0.00`.

The **symmetry check** runs the identical templates against the national layer, which contains no
award, donation or enforcement edges at all. A template that fires there anyway is matching on
something structural rather than on the substance it claims to detect.

---

## The map

`src/data/india-geo.json` — 36 real state and UT boundary paths at `viewBox 0 0 612 696`.

- Label anchors are the **pole of inaccessibility** of each state's largest sub-polygon — the interior
  point furthest from any edge. Bounding-box centres fall outside Gujarat, Kerala, Odisha and West
  Bengal, so they are not used anywhere.
- `clearance` is the label-fit budget. Below 8 units a state gets an outboard label with an elbowed
  leader line into the nearest gutter.
- West Bengal has 63 sub-polygons, Gujarat 17, the Andamans 36. Islands and enclaves are drawn.
- Choropleth defaults to **quantile** bins: Indian state market cap is extremely heavy-tailed, and a
  linear ramp renders thirty states identical.
- **No data ≠ zero.** Unmeasured states render as an unmistakable hatch with an explicit legend entry.
  The lowest colour step is deliberately well clear of the page background so "small" can never be
  confused with "unmeasured".
- Entity marks are placed on a golden-angle spiral **within** a state — not geocoded, and the UI says
  so wherever marks appear.

---

## Data

`research/raw/` is a **quarantine zone**. Research agents with web access write there; nothing in it is
trusted. Promotion into `src/data/` and `src/graph/` happens only after the grounding checks pass,
which means a hallucinating researcher cannot corrupt the graph without passing a gate.

| Dataset | Records | Notes |
|---|---|---|
| `cabinet.json` | 69 ministers | Portfolios date-ranged; departures recorded, not deleted |
| `companies-by-state.json` | 259 companies | 26 states covered; 10 states explicitly recorded as having no listed HQ |
| `state-economy.json` | 36 states/UTs | GSDP where verifiable, null otherwise |
| `conglomerates.json` | 10 groups, 64 listed entities | The two Ambani groups separated **structurally**, not just in prose |
| `pattern-matching-epistemics.md` | literature review | Every citation checked; unverifiable items listed and not asserted |

Every figure is stamped `asOf` and is as-of-a-date, never current. Companies are attributed to their
**registered** headquarters — Coal India is Kolkata-registered though the coal is in Jharkhand and
Chhattisgarh. Conflating registered with operational HQ is the most common error in state-wise
corporate maps.

---

## Agents and skills

`.claude/agents/` — six agents, each hired for a bounded job with an explicit refusal surface.

| Agent | Refuses to |
|---|---|
| `graph-cartographer` | Create a node on a name match; delete a superseded fact |
| `evidence-auditor` | Soften a COLLAPSES verdict; publish an allegation without its denial |
| `base-rate-statistician` | Report a numerator without a denominator |
| `market-cartographer` | Conflate registered with operational HQ; conflate the two Ambani groups |
| `polity-analyst` | Record a portfolio without a date range |
| `viz-engineer` | Draw a state as a rectangle; restyle a tier for aesthetics |

`.claude/skills/` — `evidence-tiering`, `pattern-discipline`, `india-map`, `graph-schema`.

---

## Development

```bash
npm install
npm run dev        # vite dev server
npm run promote    # research/raw → resolution + grounding report
npm run validate   # data-integrity gate — the four invariants
npm run build      # tsc -b && vite build
npm run smoke      # headless render of all 21 routes; serves dist itself
npm run check      # promote + validate + build + smoke
```

`npm run smoke` serves `dist` on an ephemeral port itself — there is no preview server to start or
wait on. Pass a base URL as the first argument to point it somewhere else. It uses the environment's
pinned Chromium; override with `PLAYWRIGHT_CHROMIUM_PATH`, or `npx playwright install chromium`.

### Stack

React 18 · TypeScript · Vite 6 · Tailwind CSS v4 · d3-force · hand-written SVG cartography.
No map SDK, no external runtime dependencies, no network calls at runtime. Fonts are progressive
enhancement — every family has a system fallback, so the platform renders correctly offline.

---

## What this platform will not do

- Assert that any named person committed an offence.
- Publish a private individual's details, or any allegation about a person with no public role.
- Link entities on name similarity.
- Render a pattern as a finding without its denominator, its innocent reading, and its kill condition.
- Present a self-declared affidavit figure as an audited one, or an asset trajectory without its peer
  baseline.
- Draw an edge between a minister and a company on the basis of shared state or shared sector.
  Co-location is context; it is never a relationship.

---

## Standing

This platform maps public records and published claims about the conduct of public offices, and is a
matter of legitimate public interest. It asserts no guilt. Allegations are identified as allegations,
attributed, and paired with the response of those they concern. No node adjudicates a quid pro quo.

The **documented void** — the largest beneficiaries in the case-study graph carrying no traceable
political donations at all — is rendered as loudly as any flow. A graph that can only show what exists
systematically overstates the case.

## Licence

MIT.
