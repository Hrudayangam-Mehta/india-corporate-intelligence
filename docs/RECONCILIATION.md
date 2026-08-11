# Reconciliation: `main` → `master`

*2026-08-11. Records what was taken from the parallel `main` line, what was rejected,
and why. Nothing here is a judgement about the people who wrote it — `main` was
built to a different brief, before the evidence discipline existed.*

---

## The situation

`main` and `master` were two independent implementations of the same project. They
diverged at `9d9d8fb` — the original scaffold — and never met.

| | `master` | `main` |
|---|---|---|
| Commits since scaffold | 10 | 15 |
| Routes | 21 | 14 |
| Runtime dependencies | 5 | 14 |
| CI | promote → validate → build → smoke | none |
| Deployed | no | yes, manually, to `gh-pages` |

`master` was chosen as the trunk: it is the repository default, PR #1 merged into it,
and it carries the invariants, the ingestion pipeline and the CI gates. `main`'s
history is merged in so nothing is orphaned, with `master`'s files winning every
conflict.

---

## The test everything was measured against

`master`'s premise is that **every figure carries a source and every claim carries a
tier**. Anything imported has to clear that bar or be rebuilt. Applied honestly, that
test rejects a good deal of otherwise attractive work — which is the test doing its job.

---

## Rejected

### `src/data/exchangeData.ts` — 100 companies

- `isin: ''`, `incorporated: ''`, `lastUpdated: ''`, `dataSource: []` on every record.
  No provenance of any kind.
- Market caps are round approximations — Reliance at ₹15,00,000 cr against `master`'s
  sourced ₹17,93,940 cr as of the June 2026 quarter.
- **`bseCode: symbol` is structurally wrong.** BSE scrip codes are numeric (Reliance is
  `500325`); the field was populated with the NSE ticker. Every BSE code in the file is
  invalid.
- Coordinate errors: Adani Ports is given `22.3072, 73.1812`, which is Vadodara, not
  Ahmedabad.

`master` already carries 259 companies with real tickers, ISINs, registered-HQ states
and sourced market caps stamped with their quarter. Superseded.

### NIFTY 50 page and its sparkline series

```js
// Generate mock intraday price history for sparklines
function generateSparkline(basePrice, changePercent) {
  const noise = (Math.random() - 0.5) * volatility * 2;
```

The page rendered `Math.random()` output as intraday price history. On a platform whose
first rule is *never invent a figure*, this cannot ship in any form. The **`Sparkline`
component itself is kept** — it is a pure renderer of a `number[]` and is blameless. It
stays unwired until a real price series exists.

### `RealisticIndiaMap.tsx`

Its "accurate India state boundaries" are bounding boxes:

```js
{ name: 'Maharashtra', coordinates: [[[72.8,15.6],[80.9,15.6],[80.9,22.0],[72.8,22.0],[72.8,15.6]]] }
```

That is a rectangle. It is precisely what `master` replaced with real 36-state geometry
and computed pole-of-inaccessibility label anchors.

### `NSEMap.tsx`, `BSEMap.tsx`

Separate per-exchange map pages built on the rectangle map and `exchangeData`.
`master`'s `/map` already carries an NSE / BSE / both toggle over sourced data.

### Trade-route links in the deep-dives

```js
{ from: 'Mundra Port', to: 'Colombo Port', type: 'trade', strength: 0.7 }
```

Unsourced assertions with invented strength values. The facilities are real; the
trade relationships between them were asserted, not established. Ownership and
operation links survive with sources; `trade` links do not.

Separately, every connection in that list referenced `'Ahmedabad HQ'`, which was never
defined in the locations array — so the component silently dropped those links. A
rendering that quietly discards half its input is worse than one that errors.

---

## Taken

| From `main` | Disposition |
|---|---|
| `PieChart.tsx` | Kept, moved under `src/components/viz/`, wired to real sector market-cap data |
| `Sparkline.tsx` | Kept, unwired. Lands when a real price series does |
| `WorldMap.tsx` | Concept kept, implementation rebuilt — it used `document.createElementNS` inside React, and `master` draws declarative SVG |
| Deep-dive facility lists | Extracted, re-verified against sources, and rebuilt as `research/raw/global-footprint.json` |
| `docs/TASK_INDEX.md`, `MASTER_TRACKER.md`, `STATUS_REPORT.md` | Kept. The ID-per-task tracking system is better than prose phases and is now the project's tracker |
| `public/404.html` | Replaced. The original was the `spa-github-pages` redirect shim for BrowserRouter; `master` uses HashRouter, where it does nothing |

---

## What this cost

The reconciliation deletes roughly 1,400 lines of working, rendering code. That is not
waste — it is the price of the guarantee the platform makes on every page. A dataset
with no sources and an invalid identifier column cannot sit behind a project that tells
readers to check its denominators.

The features those files served are not abandoned. Per-exchange views exist on `/map`.
Group deep-dives are rebuilt data-driven over all ten groups rather than hardcoded for
two. The world map returns properly built. What does not return is the fabricated data.
