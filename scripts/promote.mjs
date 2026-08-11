#!/usr/bin/env node
/**
 * Promotion pipeline: research/raw/ → a machine-readable promotion report.
 *
 * `research/raw/` is a QUARANTINE ZONE. Research agents with web access write
 * there; nothing in it is trusted. This script is the gate between what an agent
 * proposed and what the platform is willing to publish. It runs the four stages
 * of the architecture — extraction → resolution → grounding → assembly — and
 * writes `research/promotion-report.json`, which is the audit trail for the
 * Phase C acceptance criterion: *every published claim traces to a source AND a
 * run id*.
 *
 * The rules below exist for specific reasons, each stated at the rule. The two
 * that matter most:
 *
 *   1. Entities are resolved on STRONG KEYS ONLY — ISIN, NSE ticker, BSE code,
 *      CIN, or an exact normalised legal name. Name *similarity* never resolves
 *      anything. Fusing "Reliance Industries" (Mukesh Ambani) with "Reliance
 *      Power" (Anil Ambani) on a shared brand token is not a graph, it is a
 *      defamation generator. Every such near-miss is recorded as a collision
 *      candidate and explicitly NOT merged.
 *   2. A record that would draw an edge must carry its own sources unless its
 *      tier is `alleged` or `analytic`. That is the provenance invariant, the
 *      single rule this project rests on, applied one stage earlier than
 *      `scripts/validate.mjs` applies it.
 *
 * Usage:
 *   node scripts/promote.mjs                 readable summary
 *   node scripts/promote.mjs --json          print the report to stdout
 *   node scripts/promote.mjs --dir <path>    run against another raw directory
 *   node scripts/promote.mjs --out <path>    write the report elsewhere
 *
 * Exit code is non-zero if and only if a rejection is FATAL — that is, a record
 * that would violate the provenance invariant or state an undated figure.
 * Quarantine decisions (an entity that cannot be identified strongly enough to
 * take an edge) are warnings: they are the pipeline working, not failing.
 *
 * No dependencies, no clock, no network. Plain ESM and node:fs/node:path, to
 * match scripts/validate.mjs — a gate that needs an install step is a gate that
 * gets skipped.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Folded into the run id. The run id must change when the RULES change, not only
 * when the data changes — a report id that survives a rule rewrite would let two
 * different verdicts claim the same provenance stamp. Bump this whenever a
 * resolution or grounding rule below is edited.
 */
const PIPELINE_VERSION = '1.0.0';

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(name);
const opt = (name, fallback) => {
  const i = argv.indexOf(name);
  return i > -1 && argv[i + 1] ? argv[i + 1] : fallback;
};

if (flag('--help') || flag('-h')) {
  console.log('usage: node scripts/promote.mjs [--json] [--dir research/raw] [--out research/promotion-report.json]');
  process.exit(0);
}

const AS_JSON = flag('--json');
const RAW_DIR = resolve(root, opt('--dir', 'research/raw'));
const OUT_PATH = resolve(root, opt('--out', 'research/promotion-report.json'));

// ---------------------------------------------------------------------------
// 0. Primitives
// ---------------------------------------------------------------------------

/**
 * FNV-1a, 64-bit. Hand-rolled rather than imported from node:crypto so this file
 * keeps the same "fs and path, nothing else" surface as the validator. The only
 * requirement on the hash here is that it is a stable function of its input:
 * the run id must be reproducible across machines and across runs, which rules
 * out Date.now(), a counter, or anything read from the environment.
 */
function fnv1a64(str) {
  const PRIME = 0x100000001b3n;
  const MASK = (1n << 64n) - 1n;
  let h = 0xcbf29ce484222325n;
  for (let i = 0; i < str.length; i++) {
    h ^= BigInt(str.charCodeAt(i) & 0xffff);
    h = (h * PRIME) & MASK;
  }
  return h.toString(16).padStart(16, '0');
}

/** Legal-form noise. Stripped for comparison only — the label keeps its real name. */
const SUFFIXES = new Set([
  'ltd', 'limited', 'pvt', 'private', 'plc', 'inc', 'incorporated', 'corp',
  'corporation', 'company', 'co', 'llp', 'lp', 'holdings', 'holding', 'group',
  'the', 'of', 'and', '&',
]);

/**
 * Normalise a name for EXACT comparison. Lowercase, strip accents and
 * punctuation, drop legal-form suffixes, collapse whitespace. "Reliance
 * Industries Ltd" and "Reliance Industries Limited" are the same legal person
 * and normalise to the same key; "Reliance Industries" and "Reliance Power" do
 * not, and no amount of normalisation will make them.
 */
function normName(s) {
  const base = String(s ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9&\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const toks = base.split(' ').filter((t) => t && !SUFFIXES.has(t));
  return toks.join(' ');
}

const nameTokens = (s) => normName(s).split(' ').filter(Boolean);

/** Character trigrams, for the near-miss detector only. Never for merging. */
function trigrams(s) {
  const p = `  ${normName(s)} `;
  const out = new Set();
  for (let i = 0; i < p.length - 2; i++) out.add(p.slice(i, i + 3));
  return out;
}

/** Dice coefficient over trigrams: 0 = nothing shared, 1 = identical strings. */
function similarity(a, b) {
  const A = trigrams(a);
  const B = trigrams(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t)) shared++;
  return (2 * shared) / (A.size + B.size);
}

/** Tokens too generic to imply anything. Sharing one is not even a near-miss. */
const GENERIC_TOKENS = new Set([
  'india', 'indian', 'national', 'bharat', 'state', 'bank', 'industries',
  'industry', 'enterprises', 'power', 'energy', 'steel', 'cement', 'motors',
  'finance', 'financial', 'services', 'technologies', 'technology', 'chemicals',
  'infrastructure', 'international', 'projects', 'consumer', 'products',
  'international', 'general', 'new', 'sri', 'shree', 'shri', 'kumar', 'ltd',
]);

const rel = (p) => relative(root, p).split('\\').join('/');

// ---------------------------------------------------------------------------
// 1. EXTRACTION — read the quarantine, prove each file is well-formed
// ---------------------------------------------------------------------------
//
// A raw file must parse, must carry `asOf` (every figure on this platform is
// as-of-a-date, never current) and must carry top-level `sources`. A file that
// fails any of these is not partially imported: it is refused whole, because a
// file with no date stamp cannot have its figures grounded and a file with no
// sources cannot have its claims traced.
//
// Extraction turns each raw shape into a flat list of RECORDS. A record is a
// proposed claim, not a fact. It carries:
//   kind      what sort of entity it describes
//   keys      strong identifiers, the ONLY things resolution is allowed to use
//   ids       which identity tests it passes (see the grounding stage)
//   figures   numbers, each with the date stamp it inherits or carries
//   edges     the predicates this record would draw if promoted — the empty
//             list means the record is descriptive and draws nothing, which
//             exempts it from the provenance rule
//   scope     the group/file scope it belongs to, used by the separation guard

const files = [];
const records = [];
const rejections = [];
const warnings = [];

const reject = (r) => rejections.push(r);
const warn = (where, message) => warnings.push({ where, message });

/** A rejection that must stop the build: the record would break an invariant. */
const FATAL = 'fatal';
/** A rejection that stops PROMOTION of one record but not the build. */
const QUARANTINE = 'quarantine';

function mkRecord(o) {
  return {
    file: o.file,
    path: o.path,
    kind: o.kind,
    label: String(o.label ?? '').trim(),
    keys: Object.fromEntries(Object.entries(o.keys ?? {}).filter(([, v]) => v != null && v !== '')),
    ids: o.ids ?? [],
    attrs: o.attrs ?? {},
    figures: (o.figures ?? []).filter((f) => f.value != null && f.value !== ''),
    edges: o.edges ?? [],
    tier: o.tier ?? (o.srcs?.length ? 'documented' : undefined),
    srcs: o.srcs ?? [],
    srcsFrom: o.srcsFrom ?? 'record',
    scope: o.scope ?? null,
    excludes: o.excludes ?? [],
    note: o.note,
  };
}

/**
 * Per-dataset adapters. Adding a raw dataset means adding one entry here; a file
 * with no adapter is still parsed and date/source-checked, but contributes no
 * records and says so loudly, so a new dataset cannot silently pass through the
 * gate unexamined.
 */
const ADAPTERS = {
  // -- Union Council of Ministers -----------------------------------------
  'cabinet.json': (doc, f) => {
    const out = [];
    for (const [i, m] of (doc.ministers ?? []).entries()) {
      // The identity test for a person: a name is never enough. A constituency
      // or an office held with a start date is the minimum corroborating
      // identifier — the same bar the evidence-tiering skill sets.
      const ids = [];
      if (m.constituency) ids.push('constituency');
      if (m.since && m.portfolios?.length) ids.push('office-with-date');
      out.push(mkRecord({
        file: f,
        path: `ministers[${i}]`,
        kind: 'person',
        label: m.name,
        keys: { name: m.name },
        ids,
        attrs: {
          party: m.party ?? null,
          constituency: m.constituency ?? null,
          house: m.house ?? null,
          stateCode: m.stateCode ?? null,
          office: (m.portfolios ?? []).join('; ') || null,
          since: m.since ?? null,
        },
        edges: ['role'],
        srcs: m.srcs,
        scope: 'union-council',
      }));
    }
    return out;
  },

  // -- Listed companies by registered HQ -----------------------------------
  'companies-by-state.json': (doc, f) => {
    const out = [];
    for (const [i, c] of (doc.companies ?? []).entries()) {
      const ids = [];
      if (c.isin) ids.push('isin');
      if (c.nse) ids.push('nse');
      if (c.bse) ids.push('bse');
      out.push(mkRecord({
        file: f,
        path: `companies[${i}]`,
        kind: 'company',
        label: c.name,
        keys: { isin: c.isin, nse: c.nse, bse: c.bse, name: c.name },
        ids,
        attrs: { group: c.group ?? null, stateCode: c.stateCode ?? null, sector: c.sector ?? null },
        // marketCapCr carries no per-record stamp; it inherits the file asOf,
        // which is why the file asOf is mandatory rather than nice to have.
        figures: [{ field: 'marketCapCr', value: c.marketCapCr, stamp: doc.asOf, stampFrom: 'file' }],
        edges: ['hq', 'listed', 'sector'],
        srcs: c.srcs,
      }));
    }
    // Documented voids. "No listed company is registered here" is a finding and
    // is reported as loudly as a presence — but it draws no edge, so it is
    // exempt from the per-record source rule and inherits the file's sources.
    for (const [i, s] of (doc.statesWithNoListedHQ ?? []).entries()) {
      out.push(mkRecord({
        file: f,
        path: `statesWithNoListedHQ[${i}]`,
        kind: 'state',
        label: s.state,
        keys: { code: s.stateCode, name: s.state },
        ids: s.stateCode ? ['state-code'] : [],
        attrs: { absence: s.justification ?? null },
        edges: [],
        srcs: doc.sources ?? [],
        srcsFrom: 'file',
        note: 'documented absence: no NSE/BSE-listed registered office',
      }));
    }
    return out;
  },

  // -- Conglomerate structure ----------------------------------------------
  'conglomerates.json': (doc, f) => {
    const out = [];
    const listed = (e, path, scope, extra = {}) => mkRecord({
      file: f,
      path,
      kind: 'company',
      label: e.name,
      keys: { nse: e.nse, bse: e.bse, name: e.name },
      ids: [e.nse && 'nse', e.bse && 'bse'].filter(Boolean),
      attrs: { group: scope, sector: e.sector ?? null, stateCode: e.hqState ?? null, ...extra },
      figures: [
        { field: 'mcapCr', value: e.mcapCr, stamp: e.asOfQuarter ?? doc.asOf, stampFrom: e.asOfQuarter ? 'record' : 'file' },
        { field: 'promoterHoldingPct', value: e.promoterHoldingPct, stamp: e.asOfQuarter ?? doc.asOf, stampFrom: e.asOfQuarter ? 'record' : 'file' },
      ],
      edges: ['own', 'listed'],
      srcs: e.srcs,
      scope,
      excludes: extra.excludes ?? [],
    });

    for (const [gi, g] of (doc.groups ?? []).entries()) {
      out.push(mkRecord({
        file: f,
        path: `groups[${gi}]`,
        kind: 'group',
        label: g.name,
        keys: { name: g.name },
        ids: ['group-id'],
        attrs: { promoterFamily: g.promoterFamily ?? null, stateCode: g.stateCode ?? null, group: g.id },
        figures: [{ field: 'combinedMcapCr', value: g.combinedMcapCr, stamp: doc.asOf, stampFrom: 'file' }],
        edges: ['own', 'hq'],
        srcs: g.srcs,
        scope: g.id,
      }));

      for (const [ei, e] of (g.listedEntities ?? []).entries()) {
        out.push(listed(e, `groups[${gi}].listedEntities[${ei}]`, g.id));
      }
      for (const [ei, e] of (g.formerListedEntities ?? []).entries()) {
        out.push(listed(e, `groups[${gi}].formerListedEntities[${ei}]`, g.id, { status: e.status ?? null }));
      }

      /**
       * The Ambani separation, enforced structurally rather than in prose.
       * Anil Ambani's Reliance Group is a different group with no promoter
       * overlap. Its entities are extracted under their own scope and each
       * carries an `excludes` marker naming the scope they may never be merged
       * into. If resolution ever proposes such a merge, that is a FATAL
       * rejection — conflating the two groups is a factual error that
       * discredits everything near it.
       */
      const sep = g.separateAnilAmbaniGroup;
      if (sep) {
        const sepScope = `${g.id}#separate`;
        out.push(mkRecord({
          file: f,
          path: `groups[${gi}].separateAnilAmbaniGroup`,
          kind: 'group',
          label: sep.name,
          keys: { name: sep.name },
          ids: ['group-id'],
          attrs: { promoterFamily: sep.promoterFamily ?? null, group: sepScope },
          edges: ['own'],
          srcs: sep.srcs,
          scope: sepScope,
          excludes: [g.id],
          note: sep.relationship,
        }));
        for (const [ei, e] of (sep.listedEntities ?? []).entries()) {
          out.push(listed(e, `groups[${gi}].separateAnilAmbaniGroup.listedEntities[${ei}]`, sepScope, { excludes: [g.id] }));
        }
      }

      for (const [pi, p] of (g.keyPeople ?? []).entries()) {
        // Office WITHOUT a date is not an identity test. A board seat with no
        // start date cannot be checked against a tenure, and the date test is
        // the cheapest falsifier this project has.
        const ids = p.since && p.role ? ['office-with-date'] : [];
        out.push(mkRecord({
          file: f,
          path: `groups[${gi}].keyPeople[${pi}]`,
          kind: 'person',
          label: p.name,
          keys: { name: p.name },
          ids,
          attrs: { entity: p.entity ?? null, office: p.role ?? null, since: p.since ?? null, group: g.id },
          edges: ['role'],
          srcs: p.srcs,
          scope: g.id,
        }));
      }

      for (const [si, s] of (g.notableSubsidiaries ?? []).entries()) {
        out.push(mkRecord({
          file: f,
          path: `groups[${gi}].notableSubsidiaries[${si}]`,
          kind: 'company',
          label: s.name,
          keys: { name: s.name },
          ids: [], // unlisted: no ticker, no CIN in this file
          attrs: { parent: s.parent ?? null, group: g.id },
          edges: ['own'],
          srcs: s.srcs,
          scope: g.id,
        }));
      }

      for (const [pi, p] of (g.foreignPartners ?? []).entries()) {
        out.push(mkRecord({
          file: f,
          path: `groups[${gi}].foreignPartners[${pi}]`,
          kind: 'org',
          label: p.name,
          keys: { name: p.name },
          ids: [],
          attrs: { country: p.country ?? null, entity: p.entity ?? null, group: g.id },
          edges: ['own'],
          srcs: p.srcs,
          scope: g.id,
        }));
      }
    }
    return out;
  },

  // -- State economy --------------------------------------------------------
  'state-economy.json': (doc, f) => (doc.states ?? []).map((s, i) => mkRecord({
    file: f,
    path: `states[${i}]`,
    kind: 'state',
    label: s.name,
    keys: { code: s.stateCode, name: s.name },
    ids: s.stateCode ? ['state-code'] : [],
    attrs: { capital: s.capital ?? null },
    figures: [
      { field: 'gsdpCr', value: s.gsdpCr, stamp: s.gsdpYear, stampFrom: 'record' },
      { field: 'population', value: s.population, stamp: s.populationYear, stampFrom: 'record' },
    ],
    edges: [],
    srcs: s.srcs,
  })),
};

/**
 * Supersession events. Facts are superseded, never overwritten, so the changes a
 * raw file reports about its own prior state are carried into the report as a
 * changelog rather than being silently applied.
 */
const supersessions = [];

function collectSupersessions(doc, f) {
  for (const c of doc.changesSince2024 ?? []) {
    supersessions.push({ file: f, date: c.date ?? null, what: c.change, src: c.src ?? null });
  }
  for (const g of doc.groups ?? []) {
    for (const e of g.formerListedEntities ?? []) {
      supersessions.push({
        file: f,
        date: null,
        what: `${e.name} — ${e.status ?? 'status changed'}: ${e.notes ?? ''}`.trim(),
        src: e.srcs?.[0] ?? null,
      });
    }
  }
}

/** Documented voids declared by the raw files themselves. Absence is a finding. */
const absences = [];

if (!existsSync(RAW_DIR)) {
  console.error(`promote: raw directory not found: ${rel(RAW_DIR)}`);
  process.exit(1);
}

for (const name of readdirSync(RAW_DIR).filter((n) => n.endsWith('.json')).sort()) {
  const abs = join(RAW_DIR, name);
  const text = readFileSync(abs, 'utf8');
  const entry = { file: name, bytes: text.length, digest: fnv1a64(text), asOf: null, sources: 0, records: 0 };
  files.push(entry);

  let doc;
  try {
    doc = JSON.parse(text);
  } catch (e) {
    // Unparseable quarantine output is fatal. There is no partial trust here.
    reject({ level: FATAL, file: name, path: '(file)', label: name, rule: 'extract/parse', reason: `invalid JSON: ${e.message}` });
    continue;
  }

  if (!doc.asOf) {
    reject({ level: FATAL, file: name, path: '(file)', label: name, rule: 'extract/asOf', reason: 'no top-level asOf — figures in this file cannot be dated, so none of it can be grounded' });
  }
  if (!Array.isArray(doc.sources) || doc.sources.length === 0) {
    reject({ level: FATAL, file: name, path: '(file)', label: name, rule: 'extract/sources', reason: 'no top-level sources — claims in this file cannot be traced' });
  }
  entry.asOf = doc.asOf ?? null;
  entry.sources = Array.isArray(doc.sources) ? doc.sources.length : 0;

  const adapter = ADAPTERS[name];
  if (!adapter) {
    // Not an error: a new dataset may legitimately arrive before its adapter.
    // But it contributes nothing, and the report says so, so nobody mistakes an
    // unread file for a validated one.
    warn(`research/raw/${name}`, 'no extraction adapter — file was date/source checked but contributed no records. Add an adapter in scripts/promote.mjs to promote it.');
    continue;
  }

  if (!doc.asOf || !Array.isArray(doc.sources)) continue; // refused whole, above

  const got = adapter(doc, name);
  entry.records = got.length;
  records.push(...got);
  collectSupersessions(doc, name);
  for (const g of doc.gaps ?? []) absences.push({ file: name, kind: 'declared-gap', what: g });
  for (const s of doc.statesWithNoListedHQ ?? []) {
    absences.push({ file: name, kind: 'no-listed-hq', what: `${s.state}: ${s.justification}` });
  }
}

// Deterministic order in, deterministic order out. Resolution must not depend on
// readdir order or on which record happened to be seen first.
records.sort((a, b) => (a.file + a.path).localeCompare(b.file + b.path));

// ---------------------------------------------------------------------------
// 2. RESOLUTION — strong keys only, every merge with a rationale
// ---------------------------------------------------------------------------
//
// Two records resolve to the same entity ONLY when they share a strong key:
//
//   isin        ISIN, an issuer-and-security identifier. Unambiguous.
//   nse / bse   Exchange tickers/scrip codes. Unambiguous while listed.
//   cin         Corporate Identity Number from the MCA register. Unambiguous.
//   code        State/UT code. Unambiguous.
//   name        EXACT normalised legal name — the weakest strong key, and for
//               persons not sufficient on its own (see below).
//
// Everything else — shared surname, shared brand token, high string similarity —
// is a COLLISION CANDIDATE. It is recorded, it is shown in the UI, and it is not
// merged. This is the project's primary defamation risk and the reason the
// pipeline exists at all.

const KEY_RULES = [
  { key: 'isin', confidence: 0.99, why: 'identical ISIN — an issuer-and-security identifier, unique by construction' },
  { key: 'cin', confidence: 0.99, why: 'identical CIN — the MCA corporate identity number, unique by construction' },
  { key: 'code', confidence: 0.99, why: 'identical state/UT code — a closed official code list' },
  { key: 'nse', confidence: 0.96, why: 'identical NSE ticker — unique among currently listed securities' },
  { key: 'bse', confidence: 0.95, why: 'identical BSE scrip code — unique among currently listed securities' },
  { key: 'name', confidence: 0.82, why: 'exact normalised legal name after stripping legal-form suffixes — the weakest key admitted, and never applied on similarity' },
];

const parent = new Map();
const find = (x) => {
  let r = x;
  while (parent.get(r) !== r) r = parent.get(r);
  while (parent.get(x) !== r) { const n = parent.get(x); parent.set(x, r); x = n; }
  return r;
};
records.forEach((r, i) => { r.idx = i; parent.set(i, i); });

const merges = [];
const collisions = [];

/** Records that may never share an entity, e.g. the two Reliance groups. */
function separationViolation(a, b) {
  const aScopes = [a.scope, a.attrs.group].filter(Boolean);
  const bScopes = [b.scope, b.attrs.group].filter(Boolean);
  if ((a.excludes ?? []).some((s) => bScopes.includes(s))) return true;
  if ((b.excludes ?? []).some((s) => aScopes.includes(s))) return true;
  return false;
}

/**
 * Persons need corroboration beyond the name. "Joshi", "Sharma", "Reddy",
 * "Patel", "Singh", "Kumar", "Gupta" and "Yadav" each return dozens of unrelated
 * people in any Indian corporate or political search. Two person records with
 * the same normalised name merge only if they also share a constituency, a
 * party, an entity/group affiliation or an office — and otherwise become a
 * collision candidate, not a merge.
 */
const PERSON_CORROBORANTS = ['constituency', 'party', 'entity', 'group', 'stateCode', 'office'];

function personCorroboration(a, b) {
  const shared = PERSON_CORROBORANTS.filter((k) => a.attrs[k] && b.attrs[k] && a.attrs[k] === b.attrs[k]);
  return shared;
}

for (const rule of KEY_RULES) {
  const buckets = new Map();
  for (const r of records) {
    const raw = r.keys[rule.key];
    if (raw == null) continue;
    const v = rule.key === 'name' ? normName(raw) : String(raw).trim().toUpperCase();
    if (!v) continue;
    // Different kinds never merge: a group named "Vedanta" and a company named
    // "Vedanta" are different objects with different edges.
    const bucket = `${r.kind}::${v}`;
    if (!buckets.has(bucket)) buckets.set(bucket, []);
    buckets.get(bucket).push(r);
  }

  for (const [bucket, group] of [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    if (group.length < 2) continue;
    const [head, ...rest] = group;
    for (const other of rest) {
      if (find(head.idx) === find(other.idx)) continue;

      if (separationViolation(head, other)) {
        // Tripwire. Reached only if a raw file starts claiming the same security
        // for two groups that are declared separate.
        reject({
          level: FATAL,
          file: other.file,
          path: other.path,
          label: other.label,
          rule: 'resolve/separation-guard',
          reason: `merge on ${rule.key} would fuse "${head.label}" (${head.scope}) with "${other.label}" (${other.scope}), which are declared structurally separate groups`,
        });
        continue;
      }

      let confidence = rule.confidence;
      let why = rule.why;

      if (rule.key === 'name' && head.kind === 'person') {
        const shared = personCorroboration(head, other);
        if (!shared.length) {
          collisions.push({
            detector: 'exact-name-no-corroboration',
            kind: head.kind,
            similarity: 1,
            a: { file: head.file, path: head.path, label: head.label },
            b: { file: other.file, path: other.path, label: other.label },
            reason: 'identical normalised name but no shared constituency, party, office or affiliation — a name match alone is never an identity',
            action: 'NOT MERGED',
          });
          continue;
        }
        confidence = 0.78;
        why = `exact normalised name plus shared ${shared.join(', ')} — a name alone would not have been enough`;
      }

      parent.set(find(other.idx), find(head.idx));
      merges.push({
        entity: `${rule.key}:${bucket.split('::')[1]}`,
        kind: head.kind,
        key: rule.key,
        value: bucket.split('::')[1],
        rationale: why,
        confidence: Number(confidence.toFixed(2)),
        members: [
          { file: head.file, path: head.path, label: head.label },
          { file: other.file, path: other.path, label: other.label },
        ],
      });
    }
  }
}

// Canonical entity index.
const entities = new Map();
for (const r of records) {
  const key = find(r.idx);
  if (!entities.has(key)) entities.set(key, { kind: r.kind, members: [], keys: {} });
  const e = entities.get(key);
  e.members.push(r);
  for (const [k, v] of Object.entries(r.keys)) if (e.keys[k] == null) e.keys[k] = v;
}

// -- Collision candidates ----------------------------------------------------
//
// Three detectors, each modelling a matcher somebody would plausibly have
// written, and each producing pairs that this pipeline refuses to fuse:
//
//   surname        two people sharing a last name
//   brand-token    two organisations sharing a distinctive leading token
//                  ("Reliance", "Adani", "Tata") — the naive matcher
//   fuzzy          any same-kind pair above a string-similarity threshold
//
// The threshold is deliberately generous. A near-miss recorded and refused costs
// a table row; a near-miss silently merged costs the project its standing.

const FUZZY_THRESHOLD = 0.72;
const BRAND_FLOOR = 0.35;

const byKind = new Map();
for (const [id, e] of entities) {
  if (!byKind.has(e.kind)) byKind.set(e.kind, []);
  byKind.get(e.kind).push({ id, ...e, label: e.members[0].label, rep: e.members[0] });
}

const seenPair = new Set();
function addCollision(detector, kind, a, b, sim, reason) {
  const pair = [a.id, b.id].sort((x, y) => x - y).join('~') + '|' + detector;
  if (seenPair.has(pair)) return;
  seenPair.add(pair);
  collisions.push({
    detector,
    kind,
    similarity: Number(sim.toFixed(3)),
    a: { file: a.rep.file, path: a.rep.path, label: a.label },
    b: { file: b.rep.file, path: b.rep.path, label: b.label },
    reason,
    action: 'NOT MERGED',
  });
}

for (const [kind, list] of byKind) {
  const sorted = [...list].sort((a, b) => a.label.localeCompare(b.label));
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const a = sorted[i];
      const b = sorted[j];
      const ta = nameTokens(a.label);
      const tb = nameTokens(b.label);
      if (!ta.length || !tb.length) continue;
      const sim = similarity(a.label, b.label);

      if (kind === 'person' && ta[ta.length - 1] === tb[tb.length - 1]) {
        addCollision('shared-surname', kind, a, b, sim,
          `both surnamed "${ta[ta.length - 1]}" — a surname is a family name, not an identifier, and carries no claim that these two are related`);
        continue;
      }

      const brand = ta[0] === tb[0] && !GENERIC_TOKENS.has(ta[0]) ? ta[0] : null;
      if (brand && sim >= BRAND_FLOOR) {
        addCollision('shared-brand-token', kind, a, b, sim,
          `both begin with "${brand}" but share no ISIN, ticker, scrip code or exact legal name — a brand token is not an ownership relation`);
        continue;
      }

      if (sim >= FUZZY_THRESHOLD) {
        addCollision('fuzzy-name', kind, a, b, sim,
          `string similarity ${sim.toFixed(2)} above the ${FUZZY_THRESHOLD} threshold with no shared strong key`);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 3. GROUNDING — the tests each record must survive to be promoted
// ---------------------------------------------------------------------------

const TIER_EXEMPT = new Set(['alleged', 'analytic']);
const promoted = [];

for (const r of records) {
  let fatal = false;
  let quarantined = false;

  // G1. The provenance invariant, applied one stage early.
  //     A record that would draw an edge must carry sources, unless its tier is
  //     alleged or analytic — those two tiers carry their own warning label in
  //     the UI and are allowed to stand on attribution alone. A record that
  //     draws no edge (a state's population, a documented absence) is
  //     descriptive and inherits the file-level sources.
  if (r.edges.length > 0 && r.srcs.length === 0 && !TIER_EXEMPT.has(r.tier)) {
    reject({
      level: FATAL, file: r.file, path: r.path, label: r.label,
      rule: 'ground/provenance',
      reason: `would draw ${r.edges.join('/')} edge(s) with no sources and tier "${r.tier ?? 'none'}" — the provenance invariant admits only alleged/analytic without sources`,
    });
    fatal = true;
  }
  if (r.edges.length > 0 && r.srcsFrom === 'file' && r.srcs.length > 0) {
    warn(`${r.file}:${r.path}`, 'edge-bearing record inherits file-level sources rather than carrying its own');
  }

  // G2. No undated figure. Market caps, GSDP and holdings all drift; an
  //     unstamped number is a claim about the present, which this platform never
  //     makes. A stamp may be inherited from the file's asOf — that is what asOf
  //     is for — but it must exist somewhere.
  for (const fig of r.figures) {
    if (!fig.stamp) {
      reject({
        level: FATAL, file: r.file, path: r.path, label: r.label,
        rule: 'ground/undated-figure',
        reason: `figure "${fig.field}" = ${fig.value} carries no asOf at record or file level`,
      });
      fatal = true;
    }
  }

  // G3. The identity test. An entity that cannot be identified by a strong
  //     identifier is not promoted to a node that takes edges. It is quarantined
  //     with resolved:false, exactly as the schema requires. This is the
  //     pipeline working as designed, so it warns rather than failing the build.
  if (!fatal && r.edges.length > 0 && r.ids.length === 0) {
    reject({
      level: QUARANTINE, file: r.file, path: r.path, label: r.label,
      rule: 'ground/identity',
      reason: `no strong identifier (ISIN, CIN, ticker, scrip code, constituency, or office with a start date) — quarantined as resolved:false; unresolved entities take no edges`,
    });
    quarantined = true;
  }

  if (!fatal && !quarantined) promoted.push(r);
}

// ---------------------------------------------------------------------------
// 4. ASSEMBLY — write the report
// ---------------------------------------------------------------------------

/**
 * The run id. Derived from the pipeline version and a digest of every input
 * file, so it is a pure function of "these rules over these bytes". Two runs on
 * the same inputs produce the same id on any machine; a single edited character
 * in any raw file produces a different one. It is what a published claim cites
 * alongside its source.
 */
const runId = `run-${fnv1a64(`${PIPELINE_VERSION}\n${files.map((f) => `${f.file}:${f.bytes}:${f.digest}`).sort().join('\n')}`).slice(0, 12)}`;

const byReason = {};
for (const r of rejections) byReason[r.rule] = (byReason[r.rule] ?? 0) + 1;

const kindTally = {};
for (const e of entities.values()) kindTally[e.kind] = (kindTally[e.kind] ?? 0) + 1;

const detectorTally = {};
for (const c of collisions) detectorTally[c.detector] = (detectorTally[c.detector] ?? 0) + 1;

merges.sort((a, b) => (b.confidence - a.confidence) || a.entity.localeCompare(b.entity));
collisions.sort((a, b) => (b.similarity - a.similarity) || a.a.label.localeCompare(b.a.label));
rejections.sort((a, b) => (a.level === b.level ? (a.file + a.path).localeCompare(b.file + b.path) : a.level === FATAL ? -1 : 1));
warnings.sort((a, b) => (a.where + a.message).localeCompare(b.where + b.message));

const fatalCount = rejections.filter((r) => r.level === FATAL).length;

const report = {
  runId,
  pipelineVersion: PIPELINE_VERSION,
  generator: 'scripts/promote.mjs',
  source: rel(RAW_DIR),
  /** Deliberately absent: any wall-clock timestamp. The report must be reproducible. */
  inputs: files,
  counts: {
    files: files.length,
    records: records.length,
    entities: entities.size,
    promoted: promoted.length,
    merges: merges.length,
    collisionCandidates: collisions.length,
    rejections: rejections.length,
    fatal: fatalCount,
    quarantined: rejections.length - fatalCount,
    warnings: warnings.length,
    supersessions: supersessions.length,
    absences: absences.length,
  },
  entityKinds: kindTally,
  collisionDetectors: detectorTally,
  rejectionRules: byReason,
  merges,
  collisions,
  rejections,
  warnings,
  supersessions,
  absences,
};

writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`);

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const pad = (n) => String(n).padStart(5);
  console.log(`\n  promotion run ${runId}  ·  pipeline ${PIPELINE_VERSION}  ·  ${rel(RAW_DIR)}\n`);
  for (const f of files) {
    console.log(`  · ${f.file.padEnd(28)} ${pad(f.records)} records  asOf ${f.asOf ?? '—'}  ${f.sources} file source(s)  #${f.digest.slice(0, 8)}`);
  }
  console.log('');
  console.log(`  extracted   ${pad(records.length)} records`);
  console.log(`  resolved    ${pad(entities.size)} canonical entities  (${Object.entries(kindTally).sort().map(([k, v]) => `${k} ${v}`).join(' · ')})`);
  console.log(`  merged      ${pad(merges.length)} on strong keys      (${Object.entries(merges.reduce((a, m) => ({ ...a, [m.key]: (a[m.key] ?? 0) + 1 }), {})).sort().map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'})`);
  console.log(`  collisions  ${pad(collisions.length)} candidates NOT merged (${Object.entries(detectorTally).sort().map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'})`);
  console.log(`  rejected    ${pad(rejections.length)} records            (${Object.entries(byReason).sort().map(([k, v]) => `${k} ${v}`).join(' · ') || 'none'})`);
  console.log(`  promoted    ${pad(promoted.length)} records`);
  if (supersessions.length) console.log(`  supersedes  ${pad(supersessions.length)} recorded changes carried as a changelog`);
  if (absences.length) console.log(`  absences    ${pad(absences.length)} documented voids carried through`);

  if (fatalCount) {
    console.error(`\n  ${fatalCount} FATAL rejection(s):`);
    for (const r of rejections.filter((x) => x.level === FATAL)) {
      console.error(`    ✗ ${r.file}:${r.path} [${r.rule}] ${r.label} — ${r.reason}`);
    }
  }
  const quarantines = rejections.filter((r) => r.level === QUARANTINE);
  if (quarantines.length) {
    console.log(`\n  ${quarantines.length} quarantined (not promoted, build not failed):`);
    for (const r of quarantines.slice(0, 8)) console.log(`    · ${r.file}:${r.path} — ${r.label} [${r.rule}]`);
    if (quarantines.length > 8) console.log(`    · … ${quarantines.length - 8} more, all listed in the report`);
  }
  if (warnings.length) {
    console.log(`\n  ${warnings.length} warning(s):`);
    for (const w of warnings.slice(0, 8)) console.log(`    ! ${w.where}: ${w.message}`);
    if (warnings.length > 8) console.log(`    ! … ${warnings.length - 8} more, all listed in the report`);
  }

  console.log(`\n  report → ${rel(OUT_PATH)}`);
  console.log(fatalCount ? '\npromote: FAILED\n' : '\npromote: OK\n');
}

// Fatal rejections fail the build. Quarantine decisions and warnings do not:
// refusing to promote a weakly identified entity is the gate doing its job.
process.exit(fatalCount ? 1 : 0);
