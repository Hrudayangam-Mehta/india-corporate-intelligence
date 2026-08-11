# Ingestion — the promotion pipeline

*Phase C. Implemented by `scripts/promote.mjs`; report at `research/promotion-report.json`;
rendered at `/provenance`.*

`research/raw/` is a **quarantine zone**. Research agents with web access write there.
Nothing in it is trusted, nothing in it is rendered directly, and nothing in it reaches
`src/data/` or `src/graph/` without passing the gate described here. The point of the
boundary is blunt: a hallucinating researcher must not be able to corrupt the graph
without first satisfying a rule that is written down and run in CI.

Acceptance criterion for this phase: **every published claim traces to a source and a
run id.**

```
research/raw/*.json
        │
        ▼  EXTRACTION      file parses · has asOf · has sources · adapter → records
        ▼  RESOLUTION      strong keys only · merge rationale + confidence
        ▼  GROUNDING       provenance rule · date rule · identity test
        ▼  ASSEMBLY        research/promotion-report.json + run id
        │
        ▼  scripts/validate.mjs → src/data/, src/graph/
```

---

## Running it

```bash
npm run promote                 # readable summary, writes the report
node scripts/promote.mjs --json # print the whole report to stdout
node scripts/promote.mjs --dir path/to/raw --out path/to/report.json
```

`npm run check` runs `promote` **before** `validate`, so a raw file that would break an
invariant is caught before the graph is checked at all.

---

## Stage 1 — Extraction

Every file in `research/raw/` must:

1. parse as JSON,
2. carry a top-level `asOf`,
3. carry a top-level `sources` array.

A file failing any of the three is **refused whole**, not partially imported. A file with
no date stamp cannot have its figures grounded; a file with no sources cannot have its
claims traced. Partial trust in an untrusted directory is not a coherent position.

Each file is then converted into **records** by a named adapter (`ADAPTERS` in
`scripts/promote.mjs`). A record is a *proposed claim*, never a fact. It carries:

| field | meaning |
|---|---|
| `kind` | `company`, `group`, `person`, `state`, `org` |
| `keys` | strong identifiers — the only things resolution may use |
| `ids` | which identity tests the record passes |
| `figures` | numbers, each with the date stamp it carries or inherits |
| `edges` | the predicates this record would draw if promoted |
| `srcs` | the record's own sources |
| `scope` / `excludes` | group scope, and any scope it may never be merged into |

A file with **no adapter** is still date- and source-checked but contributes no records,
and the run warns about it — so an unread file is never mistaken for a validated one.

## Stage 2 — Resolution

Two records resolve to the same entity **only** when they share a strong key:

| Key | Confidence | Why it is admitted |
|---|---|---|
| `isin` | 0.99 | Issuer-and-security identifier; unique by construction |
| `cin` | 0.99 | MCA corporate identity number; unique by construction |
| `code` | 0.99 | State/UT code from a closed official list |
| `nse` | 0.96 | NSE ticker; unique among listed securities |
| `bse` | 0.95 | BSE scrip code; unique among listed securities |
| `name` | 0.82 | **Exact** normalised legal name, after stripping legal-form suffixes |

Rules that follow from that table:

- **Name similarity resolves nothing.** Not a shared brand token, not a shared surname,
  not a high string-similarity score. This is the project's primary defamation risk.
- **Different kinds never merge.** A group named "Vedanta" and a company named "Vedanta"
  are different objects with different edges.
- **A person needs corroboration.** Two person records with the same normalised name merge
  only if they also share a constituency, party, entity, group or office. A name alone is
  never an identity — "Joshi", "Sharma", "Singh", "Reddy", "Patel", "Kumar", "Gupta" and
  "Yadav" each return dozens of unrelated people in any Indian corporate or political
  search. Without corroboration the pair becomes a collision candidate.
- **Separation guard.** A record may declare scopes it must never be merged into. The two
  Reliance groups use this: Anil Ambani's ADAG entities are extracted under their own scope
  and excluded from Mukesh Ambani's. A merge that would fuse them is a **fatal** rejection,
  not a warning.
- Resolution is order-independent: records are sorted before union-find runs, so the report
  does not depend on directory order.

### Collision candidates

Three detectors model matchers somebody would plausibly have written, and every pair they
find is recorded and **not merged**:

| Detector | Fires when |
|---|---|
| `shared-surname` | two people share a last name |
| `shared-brand-token` | two organisations share a distinctive leading token ("Reliance", "Adani", "Tata") and similarity ≥ 0.35 |
| `fuzzy-name` | any same-kind pair with trigram similarity ≥ 0.72 and no shared strong key |
| `exact-name-no-corroboration` | two people share an exact name but nothing else |

The thresholds are deliberately generous. A near-miss recorded and refused costs a table
row; a near-miss silently merged costs the project its standing. The similarity score is
published so the refusal can be judged, never so it can be acted on.

## Stage 3 — Grounding

| Rule | Level | What it enforces |
|---|---|---|
| `ground/provenance` | **fatal** | A record that would draw an edge must carry its own sources, unless its tier is `alleged` or `analytic`. Records that draw no edge (a population figure, a documented absence) are descriptive and may inherit the file's sources. |
| `ground/undated-figure` | **fatal** | Every figure carries an `asOf`, at record level or inherited from the file. A market cap, a GSDP or a promoter holding with no date is a claim about the present, which this platform never makes. |
| `ground/identity` | quarantine | A record with no strong identifier (ISIN, CIN, ticker, scrip code, constituency, or office with a start date) is held as `resolved: false`. Unresolved entities take no edges. |

## Stage 4 — Assembly

`research/promotion-report.json` is written with:

- `runId` — `run-<12 hex>`, derived from `PIPELINE_VERSION` plus a digest of the bytes of
  every input file. **No wall-clock time is read.** The same inputs and rules always produce
  the same id on any machine; one edited character in one raw file produces a different one.
  Bump `PIPELINE_VERSION` whenever a resolution or grounding rule changes, so a rule rewrite
  cannot inherit the previous run's stamp.
- `inputs` — per-file byte count, content digest, `asOf`, source count and record count.
- `merges` — every merge with its key, value, rationale, confidence and members.
- `collisions` — every candidate, with detector, similarity, reason and `action: NOT MERGED`.
- `rejections` — every rejection with its rule, reason and level.
- `supersessions` — changes the raw files report about their own prior state, carried as a
  changelog rather than applied silently. Facts are superseded, never overwritten.
- `absences` — documented voids the raw files declare about themselves. Absence is reported
  as loudly as presence.

---

## What fails the build, and what only warns

**Fails** (`promote` exits non-zero, so `npm run check` stops):

- a raw file that does not parse, or has no `asOf`, or has no `sources`;
- a record that would draw an edge with no sources and a tier that is not `alleged`/`analytic`;
- a figure with no date at record or file level;
- a merge that would fuse two structurally separate groups.

**Warns** (recorded in the report, build continues):

- a record quarantined by the identity test — this is the gate working, not failing;
- an edge-bearing record inheriting file-level rather than record-level sources;
- a raw file with no extraction adapter.

---

## Adding a new raw dataset

1. Drop the file in `research/raw/`. Give it a top-level `asOf` and a top-level `sources`
   array of `[label, url]` pairs. Every record that will draw an edge gets its own `srcs`.
2. Add an adapter to `ADAPTERS` in `scripts/promote.mjs`, keyed by file name. It receives
   `(doc, fileName)` and returns `mkRecord({...})` objects. Decide, per record type:
   - which strong `keys` it genuinely has — never invent one to make a merge happen;
   - which identity tests it passes (`ids`);
   - which `edges` it would draw — an empty list means descriptive, and exempts the record
     from the per-record source rule;
   - which `figures` it states, and where each one's date stamp comes from.
3. Run `npm run promote`. Read the rejections. A fatal rejection is a fact about the data,
   not an obstacle to route around: fix the raw file or narrow the adapter's claims.
4. Read the new collision candidates. If a pair should have merged, the fix is to add the
   missing strong key to the raw data — never to lower a threshold.
5. If a resolution or grounding rule changed, bump `PIPELINE_VERSION`.
6. Consume the promoted data from a typed module in `src/data/`, importing the raw JSON the
   way `src/data/companies.ts` does. The report itself is read only through
   `src/data/promotion.ts`.
7. `npm run check` — promote, validate, build, smoke.
