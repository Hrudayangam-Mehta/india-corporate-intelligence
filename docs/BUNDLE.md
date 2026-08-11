# The hand-off bundle

`icip-bundle.zip` is a self-contained snapshot: source, data, docs, agents, skills,
a runnable build, and the hand-off prompt. No network access is needed to read it or
to run the built app.

## Layout

```
icip/
├── HANDOFF.md            ← start here if you are picking this up cold
├── README.md             ← what the project is and the four invariants
├── docs/
│   ├── INDEX.md          ← every file, what it is, what depends on it
│   ├── CUSTOM_PLAN.md    ← why the two projects merged; the phased plan
│   ├── INGESTION.md      ← the extraction → resolution → grounding pipeline
│   ├── BUNDLE.md         ← this file
│   └── legacy/           ← superseded, retained so nothing is lost
├── .claude/
│   ├── agents/           ← six agents, each with an explicit refusal surface
│   └── skills/           ← evidence-tiering, pattern-discipline, india-map, graph-schema
├── src/
│   ├── graph/            ← schema, the case-study data, base rates, null model, motif engine
│   ├── data/             ← geometry, companies, politics, conglomerates
│   ├── components/viz/   ← the map, the geographic network, the force graph, the flow diagram
│   └── pages/            ← 21 routes
├── research/
│   ├── raw/              ← the QUARANTINE ZONE. Untrusted until promoted
│   └── promotion-report.json
├── scripts/              ← promote, validate, smoke
├── dist/                 ← runnable build (see below)
└── .github/workflows/    ← CI: promote → validate → build → smoke
```

## Running it

**Just look at it.** Open `dist/index.html` in a browser. The build uses relative
asset paths, so it works from `file://` with no server. Fonts come from a CDN and
fall back to system families when offline — the platform renders correctly either
way.

**Work on it.**

```bash
npm install
npm run dev        # vite dev server
npm run check      # promote → validate → build → smoke, in that order
```

`npm run smoke` drives a headless Chromium over all 21 routes and serves `dist`
itself, so nothing external needs to be running. It uses a pinned browser if
`PLAYWRIGHT_CHROMIUM_PATH` is set, otherwise `npx playwright install chromium`.

## What is deliberately not in the bundle

- `node_modules/` — restore with `npm install`.
- Git history — the bundle is a snapshot. The repository is the record.

## Verifying the snapshot

Everything in the bundle passed, at the moment it was cut:

| Gate | Result |
|---|---|
| `npm run promote` | OK — 515 entities resolved, 46 merged, 218 collisions refused, 100 quarantined, 0 fatal |
| `npm run validate` | OK — 36 states, 59 nodes, 106 edges, 11 motifs, no invariant violations |
| `npm run build` | OK |
| `npm run smoke` | OK — 21 routes, no console errors, geometry and keyboard checks pass |

The promotion run id is derived from a hash of the input files, not a clock, so
re-running `npm run promote` on an unchanged bundle reproduces it byte-for-byte.
That is the check that the pipeline is deterministic: if the id moves, an input did.
