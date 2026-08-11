# Platform Plan — company pages, tender maps, and the data layer beneath them

*Version 1.0 · 2026-08-11 · the architecture and UX plan for the next build phase.
`docs/TASK_INDEX.md` tracks execution; this explains what is being built and why.*

---

## 0. Table of contents

| § | Section | Answers |
|---|---|---|
| 1 | [The backend decision](#1-the-backend-decision) | Where does data live, and what serves it? |
| 2 | [The entity record](#2-the-entity-record) | What does the platform know about one company? |
| 3 | [Information architecture](#3-information-architecture) | Every route, and what each is for |
| 4 | [The company page](#4-the-company-page) | Section-by-section design |
| 5 | [The consolidated NSE/BSE map](#5-the-consolidated-nsebse-map) | Layers, interactions, drill-down |
| 6 | [Tender maps and the tender graph](#6-tender-maps-and-the-tender-graph) | Centre, state, and the network between them |
| 7 | [Group deep-dives](#7-group-deep-dives) | Adani, Reliance, and the eight behind them |
| 8 | [Overlays: foreign capital and PM CARES](#8-overlays-foreign-capital-and-pm-cares) | The cross-cutting layers |
| 9 | [UI/UX system](#9-uiux-system) | Navigation, density, mobile, performance |
| 10 | [What must not be built](#10-what-must-not-be-built) | The refusals, restated for this phase |
| 11 | [Phasing](#11-phasing) | Order of work and what unblocks what |

---

## 1. The backend decision

**The requirement:** per-company pages with rich, queryable data, and a "baseline
mechanism" to generate them.

**The constraint:** the app is static. Data is compiled in, there are no runtime
fetches, it deploys to GitHub Pages and works offline. That is not an accident —
it is why the site is free to host, impossible to take down by breaking an API, and
auditable, because every number shipped is in the git history.

**The decision: a build-time data layer, not a served API.**

```
research/raw/*.json          ← quarantine. Agents write here. Untrusted.
        │  npm run promote   ← extract → resolve → ground → assemble
        ▼
research/promotion-report.json
        │  npm run generate  ← NEW. Emits typed, per-entity records
        ▼
src/data/generated/
        ├── entities/*.ts     one record per company, tree-shakeable
        ├── index.ts          id → lazy import map
        └── manifest.ts       counts, asOf dates, coverage
        │  vite build
        ▼
dist/  ← one static bundle, per-route code-split
```

This is a backend in every sense that matters here — a pipeline that validates,
resolves and shapes data into an API the frontend consumes. The API is the module
graph rather than HTTP.

**When a served API becomes necessary**, and what it costs:

| Trigger | Why static stops working | Cost |
|---|---|---|
| > ~2,000 companies with full financials | Bundle exceeds what a browser should parse | Hosting + DB (~$20-40/mo) |
| User accounts, saved queries, alerts | Needs server-side state | Auth + DB + email |
| Live prices | Runtime fetches by definition | Market data licence — the real cost |
| Full-text search over annual reports | Index too large to ship | Search service |

None of those is triggered yet at 259 companies. The honest sequencing is: build
the generator now, and let the first of those triggers decide the API, rather than
building an API on speculation.

**Interim scaling step**, before any server: move per-entity records to
`public/data/entities/*.json`, fetched on demand and cached. Keeps Pages hosting,
removes the bundle ceiling, costs one loading state. That is the bridge, and it is
cheap.

---

## 2. The entity record

One shape, for every company, generated per entity. Everything optional is
`null` — never a plausible-looking default.

```ts
interface EntityRecord {
  id: string;                       // stable slug
  identity: {
    legalName: string; shortName: string;
    cin: string | null;             // the MCA join key
    isin: string | null;
    nse: string | null; bse: string | null;   // BSE is NUMERIC. Not the ticker.
    incorporated: string | null;
    aliases: string[];
    resolved: boolean;              // false ⇒ takes no edges, anywhere
  };
  classification: { sector; industry; subIndustry; ownership; group };
  geography: {
    registered: { city; state; stateCode; lat; lon; geocoded: boolean };
    operational: Facility[];        // plants, mines, ports, offices
    // registered ≠ operational. Never conflated, never silently merged.
  };
  market: {
    mcapCr: number | null; asOf: string | null;
    promoterPct: number | null; fiiPct: number | null; diiPct: number | null;
    shareholdingAsOfQuarter: string | null;
  };
  structure: { parent; subsidiaries[]; jointVentures[]; foreignInvestors[] };
  people: { name; role; since; din; family }[];   // DIN or it takes no edge
  government: {
    contracts: ContractRef[];       // → the tender dataset
    concessions: ConcessionRef[];
    // Every one carries its denominator: "9 of 41 blocks offered"
  };
  flows: { politicalDonations[]; pmCares[]; csr[] };  // each tiered + sourced
  provenance: {
    sources: Source[]; runId: string;
    tierCensus: Record<Tier, number>;
    gaps: string[];                 // published, not hidden
  };
}
```

**The three rules that shape this record**

1. **Every scalar that could be wrong carries an `asOf`.** A market cap without a
   date is a claim about now, and it is always false by the time it is read.
2. **`geocoded: boolean` is not decoration.** Today most marks are placed *within* a
   state, not located. The flag is what lets the UI stop saying so once F005 lands.
3. **`resolved: false` propagates.** An unresolved entity renders, and takes no
   edges. This is enforced in `validate.mjs`, not by discipline.

---

## 3. Information architecture

Current routes stay. New ones marked **NEW**.

| Route | Purpose |
|---|---|
| `/` | Dashboard — aggregates, concentration, evidence census |
| `/map` | Consolidated NSE/BSE map (§5) |
| `/geograph` | Geographic network — relationships drawn in place |
| `/tenders` | **NEW** Tender explorer — centre + state (§6) |
| `/tenders/map` | **NEW** Tender map, toggleable centre/state (§6) |
| `/tenders/graph` | **NEW** Tender network — awarding body ↔ winner (§6) |
| `/company/:id` | Company page (§4) |
| `/company/:id/map` | **NEW** Per-company facility map |
| `/conglomerates` | Ten groups, comparative |
| `/conglomerates/:id` | **NEW** Group deep-dive (§7) |
| `/states/:code` | State profile |
| `/industries` | Sector concentration |
| `/cabinet`, `/network`, `/atlas`, `/political`, `/media` | As now |
| `/foreign-capital` | **NEW** Foreign investment overlay (§8) |
| `/patterns`, `/motifs`, `/evidence`, `/base-rates`, `/provenance`, `/method` | The discipline layer |

**Navigation grouping** — four rails, unchanged in spirit:
*Markets* · *Power* · *Method* · *Tools*. `/tenders/*` joins **Power**, because a
procurement record is an exercise of public authority, not a market fact.

---

## 4. The company page

The current page is a good skeleton and thin on substance. Target structure, in
reading order — each section renders only when it has real data, and says so when
it does not.

| # | Section | Content | Empty state |
|---|---|---|---|
| 1 | **Identity header** | Name, tickers, ISIN, CIN, sector, registered city/state, group, watch toggle | — |
| 2 | **Key figures** | Market cap + `asOf`, promoter %, employees, founded | "not recorded" — never a dash that reads as zero |
| 3 | **Where it is** | Per-company facility map: registered office + plants/mines/ports/offices | "Registered office only; no facilities recorded" |
| 4 | **Structure** | Parent, subsidiaries, JVs, foreign investors, promoter chain | "No structure recorded beyond the listed entity" |
| 5 | **People** | Board and promoters, with DIN where known | Flags unresolved names explicitly |
| 6 | **Government business** | Contracts and concessions, **each with its denominator** and process type | "No central or state award recorded in the dataset" — a *coverage* statement, not an absence claim |
| 7 | **Flows** | Donations, PM CARES, CSR — tiered, sourced, with base rate alongside | Renders the base rate even at zero: "0 recorded; 82.45% of trust money went to one party" |
| 8 | **In the graph** | Ego network, tier-coded, with the median-separation baseline | — |
| 9 | **Peers** | Same-sector companies by market cap — the reference class | — |
| 10 | **Provenance** | Every source, the run id, the tier census, the gaps | Always renders. This is the page's spine |

**The design rule that matters most:** section 6 and section 7 are where a reader
will look for wrongdoing. Both must render their **denominator inline**, not behind
a link. "Won 9 of 41 blocks offered" and "one of 38 of 38 responding PSUs" are the
whole difference between a finding and an insinuation.

---

## 5. The consolidated NSE/BSE map

Extends the existing `/map`.

**Layers** (independently toggleable, composited in this order):

1. **Ground** — state choropleth: market cap / company count / GSDP / PSU share / HHI
2. **Companies** — marks, sized by market cap, coloured by sector
3. **Facilities** — plants, mines, ports, refineries (needs the facility dataset)
4. **Tenders** — award locations, sized by value (§6)
5. **Political** — ministers by seat, as *context only*, never edges

**Interactions**

- Hover → readout with the metric **and its denominator**
- Click state → side panel; click again → `/states/:code`
- Click mark → company card → `/company/:id`
- Lasso/box select → "N companies, ₹X cr, sector mix" summary
- Exchange toggle NSE / BSE / both; sector filter; market-cap floor
- URL-encoded state, so any view is shareable — already true, extend to layers

**The honesty furniture, which is not optional**

- No-data hatch, visually distinct from the lowest ramp step
- "positioned within state, not geocoded" wherever anchored marks appear, until
  `geocoded: true` is the norm
- Quantile bins by default; a linear ramp renders thirty states identical
- Every count shows its denominator

---

## 6. Tender maps and the tender graph

The largest new surface. Three views over one dataset.

### 6.1 `/tenders` — the explorer

A filterable ledger: awarding body, ministry/state, sector, winner, value, date,
process type, bidder count. Sortable, with a table twin. Filters are URL-encoded.

**Every aggregate carries its denominator.** "Adani won 9" is not a row this page
will render; "9 of 41 blocks offered, against 12 distinct winners" is.

### 6.2 `/tenders/map` — the tender map

Toggle **Centre** / **State** / **Both**.

- **Centre**: awards plotted at the *project* location where known, otherwise at the
  awarding body's seat — which is usually Delhi, and the caption must say that the
  Delhi cluster is an artefact of where ministries are registered, exactly as
  `/geograph` already does.
- **State**: choropleth of award count/value per state, with marks per award.
  A second encoding shows **portal transparency** — states with no machine-readable
  procurement data render hatched. *That gap is the finding*: if most states publish
  nothing queryable, the map's main job is to show that.

### 6.3 `/tenders/graph` — the tender network

Nodes: awarding bodies, ministries, states, winning companies, promoter groups.
Edges: `award` (tiered, valued, dated).

**What this graph must do to be worth building:**

- Report **bidder counts** on the edge. A sole-bidder award and a twelve-bidder
  award look identical in a network diagram and are completely different facts.
- Run the **degree-preserving null model** before highlighting any structure. A
  ministry that awards many contracts is a hub by construction.
- Publish the **share of large listed companies holding any government contract**.
  If most do, then "company X holds a government contract" is not a finding, and
  the page leads with that.
- Offer the **symmetry check**: run the same concentration analysis on a
  differently-governed state or an earlier period. If the method produces an equally
  striking picture there, the method is generating the result.

---

## 7. Group deep-dives

`/conglomerates/:id` — one data-driven page for all ten groups, not two hardcoded ones.

| Section | Content |
|---|---|
| Structure tree | Holding entity → listed → unlisted → SPVs, with holding % |
| Sector spread | Which sectors, how concentrated, against peer groups |
| Domestic map | Facilities and registered offices |
| **World map** | International facilities and foreign investors |
| Government business | Contracts across centre and states, each with denominators |
| Foreign capital | Sovereign funds, strategic investors, DFIs — with stakes and dates |
| Flows | Donations, PM CARES, CSR — tiered, with base rates |
| Comparison | The same metrics for the other nine groups, side by side |

**The comparison column is the point.** A single group's chart of contracts and
donations always looks alarming. The same chart beside nine peers is the only
version that supports a conclusion — and may well refute one.

Structural guarantee retained: **Anil Ambani's entities never merge into Mukesh
Ambani's group**, enforced in the data shape, not in prose.

---

## 8. Overlays: foreign capital and PM CARES

`/foreign-capital` — sovereign wealth funds, DFIs, strategic investors and their
stakes across Indian listed entities.

Worth building because it **cuts against the simplest story as often as it supports
it**: the second-largest FCI silo beneficiary is funded substantially by Western
development finance institutions, which is a strike against a domestic-capture
reading. A platform that only shows the connections supporting one narrative is not
an analysis tool.

**PM CARES** stays an overlay rather than a page, because the base rate makes it
nearly information-free at the entity level: 38 of 38 responding PSUs contributed.
It renders as a badge on company and group pages **with that denominator attached**,
never as a standalone graph of "who donated" — which would be a graph of "who exists".

---

## 9. UI/UX system

**Density.** These are documents, not dashboards. Prose carries the reasoning;
charts carry the magnitudes; tables carry the detail. Every graphic has a table twin.

**Progressive disclosure.** Summary → detail → provenance. The provenance layer is
always reachable in one click and never the default view.

**Performance.** The bundle is ~1.2 MB and will not survive per-entity records.
Required, in order: route-level code splitting; per-entity records as lazy imports
or fetched JSON; virtualised long tables; the graph capped with an explicit
"showing N of M" rather than silent truncation.

**Mobile.** Sidebar collapses (done). Graphs need pinch-zoom and pan (E007, E008,
open). Tables scroll within their own container — the page body must never scroll
horizontally.

**Accessibility.** Table twin for every graphic; keyboard reachable nodes and states;
`prefers-reduced-motion` honoured; contrast ≥ 4.5:1 text and ≥ 3:1 graphics in both
themes. Tier is encoded by **line style as well as colour**, so it survives
colourblindness and print.

**Loading.** Per-entity fetches need skeletons — C018 was marked "not applicable"
when nothing loaded asynchronously. The interim scaling step in §1 reopens it.

---

## 10. What must not be built

Restating the platform's refusals for this phase specifically, because tender and
donation data is exactly where they get tested:

- **No "influence score."** A composite number with a decimal point, built from
  contracts and donations, is unfalsifiable by construction. Refused (J007).
- **No edge from co-location.** Same state, same sector, same ministry's remit — none
  of these is a relationship.
- **No name-matched people.** DIN or no edge. The `/interlocks` page exists to show
  what this rule prevents: 7 minister-to-office-holder edges a naive matcher would
  draw, against ~19 expected by chance across 3,795 pairs.
- **No award-to-donation edge without a shuffled control.** Timing proximity between
  two continuous streams is guaranteed. Without a control that holds donation volume
  fixed, it is arithmetic, not evidence.
- **No trade routes without a trade dataset.** Ownership and operation links only.
- **No aggregate that hides its denominator.** This is the one that will be under
  most pressure, because denominator-free numbers are more shareable.

---

## 11. Phasing

Ordered by what unblocks the most, not by what demos best.

### Phase F1 — the data layer *(prerequisite for everything else)*
- `npm run generate`: promotion emits typed per-entity records (**O007**)
- The `EntityRecord` shape above, with `asOf` on every volatile scalar
- Route-level code splitting, before the bundle becomes the constraint
- **Done when:** one company page renders entirely from a generated record

### Phase F2 — company pages and facility maps
- The ten-section company page (§4)
- Facility dataset + `/company/:id/map`
- Geocoding (**F005**) — removes the "not geocoded" caveat platform-wide
- **Done when:** a reader can answer "what is this company, where, whose, and on what evidence" without leaving the page

### Phase F3 — tenders
- Ingest `tenders-centre.json` + `tenders-states.json` from the research sweeps
- `/tenders`, `/tenders/map`, `/tenders/graph`
- Base rate: what share of large listed companies hold any government contract
- Null model over the award graph before any structure is highlighted
- **Done when:** every concentration claim on the page renders its denominator inline

### Phase F4 — groups and overlays
- `/conglomerates/:id` with the peer comparison column
- `/foreign-capital`
- PM CARES as a badge with its denominator
- **Done when:** the Adani and Reliance pages answer the cross-connection question *with peers alongside*

### Phase F5 — the analytical close
- Full award population 2019-24 (**G008**) — unblocks the motif engine
- ECI bond file, purchaser → party (**G001**, **G002**)
- Coal India / mining-PSU CSR destinations (**G009**)
- Re-run every motif; report which survive a null model on a graph large enough to test them
- **Done when:** the motif engine stops reporting `degenerate-null`

---

*The through-line: the platform's value is not that it draws connections. Anything
can draw connections. Its value is that it can tell you which connections are
surprising — and it can only do that if it knows what is ordinary.*
