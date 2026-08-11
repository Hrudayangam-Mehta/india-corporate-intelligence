#!/usr/bin/env node
/**
 * Data-integrity gate. CI fails on any error.
 *
 * This is where the four invariants stop being conventions and become facts about
 * the repository: provenance, entity resolution, supersession, contradiction.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const errors = [];
const warnings = [];
const notes = [];

const err = (where, msg) => errors.push(`${where}: ${msg}`);
const warn = (where, msg) => warnings.push(`${where}: ${msg}`);

// ---------------------------------------------------------------------------
// 1. Geometry
// ---------------------------------------------------------------------------
const geoPath = join(root, 'src/data/india-geo.json');
if (!existsSync(geoPath)) {
  err('geo', 'src/data/india-geo.json is missing');
} else {
  const geo = JSON.parse(readFileSync(geoPath, 'utf8'));
  if (geo.viewBox !== '0 0 612 696') err('geo', `unexpected viewBox "${geo.viewBox}"`);
  if (geo.states.length !== 36) err('geo', `expected 36 states/UTs, found ${geo.states.length}`);
  for (const s of geo.states) {
    if (!s.path || s.path.length < 20) err(`geo:${s.id}`, 'missing or truncated path — never approximate a state');
    if (typeof s.cx !== 'number' || typeof s.cy !== 'number') err(`geo:${s.id}`, 'missing label anchor');
    if (typeof s.clearance !== 'number') err(`geo:${s.id}`, 'missing clearance (label-fit budget)');
    const [x0, y0, x1, y1] = s.bbox ?? [];
    if (s.cx < x0 - 1 || s.cx > x1 + 1 || s.cy < y0 - 1 || s.cy > y1 + 1) {
      err(`geo:${s.id}`, 'label anchor lies outside the state bounding box');
    }
  }
  notes.push(`geometry: ${geo.states.length} states/UTs, ${geo.states.reduce((a, s) => a + s.parts, 0)} sub-polygons`);
}

// ---------------------------------------------------------------------------
// 2. Graph — the provenance invariant
// ---------------------------------------------------------------------------
const TIERS = ['documented', 'reported', 'alleged', 'analytic'];
const PREDS = [
  'award', 'bond', 'trust', 'direct', 'pmin', 'pmout', 'csr', 'own', 'family',
  'role', 'law', 'enforce', 'hq', 'listed', 'sector', 'contra', 'supersede', 'analytic',
];

/**
 * The graph lives in TypeScript modules for editability. Rather than compile
 * them, extract the literals with a narrow parse — enough to enforce the rules,
 * and it fails loudly rather than silently passing on an unreadable file.
 */
function loadGraph() {
  const file = join(root, 'src/graph/data.ts');
  if (!existsSync(file)) return null;
  const src = readFileSync(file, 'utf8');
  const grab = (name) => {
    const m = src.match(new RegExp(`export const ${name}[^=]*=\\s*(\\[[\\s\\S]*?\\n\\];)`, 'm'));
    if (!m) return null;
    const body = m[1].replace(/;$/, '');
    try {
      // The data modules are plain literals with no imports or calls inside.
      return Function(`"use strict"; return (${body});`)();
    } catch (e) {
      err('graph', `could not parse ${name}: ${e.message}`);
      return null;
    }
  };
  return { nodes: grab('NODES'), edges: grab('EDGES'), motifs: grab('MOTIFS') };
}

const graph = loadGraph();
if (!graph) {
  notes.push('graph: src/graph/data.ts not present yet — skipping graph checks');
} else {
  const { nodes = [], edges = [], motifs = [] } = graph;
  const byId = new Map();
  const aliasOwner = new Map();

  for (const n of nodes ?? []) {
    if (byId.has(n.id)) err(`node:${n.id}`, 'duplicate node id');
    byId.set(n.id, n);
  }
  for (const n of nodes ?? []) {
    for (const a of n.al ?? []) {
      const k = a.trim().toLowerCase();
      const prior = aliasOwner.get(k);
      if (prior && prior !== n.id) {
        err(`node:${n.id}`, `alias "${a}" already claimed by "${prior}" — entity-resolution collision`);
      }
      aliasOwner.set(k, n.id);
    }
    if (n.resolved === false && !n.collisionRisk) {
      warn(`node:${n.id}`, 'unresolved node should explain its collisionRisk');
    }
  }

  (edges ?? []).forEach((e, i) => {
    const id = e.id ?? `${e.s}~${e.pred}~${e.t}~${i}`;
    const sourced = (e.srcs?.length ?? 0) > 0;
    if (!sourced && e.tier !== 'alleged' && e.tier !== 'analytic') {
      err(`edge:${id}`, 'PROVENANCE INVARIANT VIOLATED — no srcs and tier is not alleged/analytic');
    }
    if (e.tier === 'analytic' && !e.innocentReading) {
      err(`edge:${id}`, 'analytic edge must carry an innocentReading (correlation ≠ causation)');
    }
    if (!TIERS.includes(e.tier)) err(`edge:${id}`, `unknown tier "${e.tier}"`);
    if (!PREDS.includes(e.pred)) err(`edge:${id}`, `unknown predicate "${e.pred}"`);
    for (const side of ['s', 't']) {
      const n = byId.get(e[side]);
      if (!n) err(`edge:${id}`, `endpoint "${e[side]}" does not resolve to a node`);
      else if (n.resolved === false) err(`edge:${id}`, `endpoint "${e[side]}" is unresolved — unresolved entities take no edges`);
    }
    if (e.supersededBy && !(edges ?? []).some((o, j) => (o.id ?? `${o.s}~${o.pred}~${o.t}~${j}`) === e.supersededBy)) {
      err(`edge:${id}`, `supersededBy "${e.supersededBy}" does not resolve — superseded facts stay addressable`);
    }
    for (const src of e.srcs ?? []) {
      if (!Array.isArray(src) || src.length !== 2) err(`edge:${id}`, 'source must be [label, url]');
      else if (!/^https?:\/\//.test(src[1])) warn(`edge:${id}`, `source url looks malformed: ${src[1]}`);
    }
  });

  for (const m of motifs ?? []) {
    if (!m.innocentReading) err(`motif:${m.id}`, 'motif must carry an innocentReading');
    if (!m.census || !(m.census.population > 0)) {
      err(`motif:${m.id}`, 'census needs population > 0 — a numerator without a denominator is not a finding');
    }
  }

  const tally = TIERS.map((t) => `${t} ${(edges ?? []).filter((e) => e.tier === t).length}`).join(' · ');
  notes.push(`graph: ${(nodes ?? []).length} nodes, ${(edges ?? []).length} edges (${tally}), ${(motifs ?? []).length} motifs`);
  const contras = (edges ?? []).filter((e) => e.pred === 'contra').length;
  if ((edges ?? []).some((e) => e.tier === 'alleged') && contras === 0) {
    warn('graph', 'allegations present with zero contra edges — denials are first-class and must be captured');
  }
}

// ---------------------------------------------------------------------------
// 3. Research quarantine — raw agent output is never trusted
// ---------------------------------------------------------------------------
const rawDir = join(root, 'research/raw');
if (existsSync(rawDir)) {
  for (const f of readdirSync(rawDir).filter((f) => f.endsWith('.json'))) {
    try {
      const j = JSON.parse(readFileSync(join(rawDir, f), 'utf8'));
      if (!j.asOf) warn(`research/raw/${f}`, 'missing asOf — every figure must be stamped with its date');
      if (!j.sources) warn(`research/raw/${f}`, 'missing top-level sources');
      notes.push(`research/raw/${f}: parses`);
    } catch (e) {
      err(`research/raw/${f}`, `invalid JSON: ${e.message}`);
    }
  }
}

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------
for (const n of notes) console.log(`  · ${n}`);
if (warnings.length) {
  console.log(`\n  ${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`    ! ${w}`);
}
if (errors.length) {
  console.error(`\n  ${errors.length} ERROR(S):`);
  for (const e of errors) console.error(`    ✗ ${e}`);
  console.error('\nvalidate: FAILED\n');
  process.exit(1);
}
console.log('\nvalidate: OK\n');
