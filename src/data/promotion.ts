/**
 * The promotion report: what the ingestion gate did to the quarantine zone.
 *
 * `research/raw/` is written by research agents and is trusted by nothing.
 * `scripts/promote.mjs` runs extraction → resolution → grounding → assembly over
 * it and writes `research/promotion-report.json`. This module is the typed view
 * of that report, and it is the only way the app reads it.
 *
 * The report is a pure function of the pipeline version and the bytes of the raw
 * files: it carries a run id derived from a digest of its inputs and NO
 * wall-clock timestamp, so the same inputs always produce the same run id. That
 * is what makes the Phase C acceptance criterion checkable — every published
 * claim traces to a source AND a run id, and the run id can be recomputed.
 *
 * Regenerate with `npm run promote`. Nothing in this file is hand-edited.
 */

import raw from '../../research/promotion-report.json';

/** A record's address inside the quarantine zone: which file, which path. */
export interface RecordRef {
  file: string;
  path: string;
  label: string;
}

/**
 * A merge. Two raw records were judged to describe the same real-world entity.
 * `key` names the strong identifier that justified it — never a similarity
 * score, which is why there is no similarity field here.
 */
export interface Merge {
  entity: string;
  kind: string;
  key: 'isin' | 'cin' | 'nse' | 'bse' | 'code' | 'name';
  value: string;
  rationale: string;
  /** 0–1. The weakest admitted key (exact legal name) scores lowest. */
  confidence: number;
  members: RecordRef[];
}

/**
 * A pair a naive matcher would have fused. Recorded, shown, and NOT merged.
 * `similarity` is reported so the refusal can be judged, never so it can be
 * acted on.
 */
export interface CollisionCandidate {
  detector: 'shared-surname' | 'shared-brand-token' | 'fuzzy-name' | 'exact-name-no-corroboration';
  kind: string;
  similarity: number;
  a: RecordRef;
  b: RecordRef;
  reason: string;
  action: 'NOT MERGED';
}

/**
 * A record the gate refused to promote. `fatal` rejections break the build —
 * they would have violated the provenance invariant or stated an undated figure.
 * `quarantine` rejections do not: an entity too weakly identified to take an
 * edge is the gate working, not failing.
 */
export interface Rejection {
  level: 'fatal' | 'quarantine';
  file: string;
  path: string;
  label: string;
  rule: string;
  reason: string;
}

export interface InputFile {
  file: string;
  bytes: number;
  digest: string;
  asOf: string | null;
  sources: number;
  records: number;
}

export interface PromotionCounts {
  files: number;
  records: number;
  entities: number;
  promoted: number;
  merges: number;
  collisionCandidates: number;
  rejections: number;
  fatal: number;
  quarantined: number;
  warnings: number;
  supersessions: number;
  absences: number;
}

export interface Supersession {
  file: string;
  date: string | null;
  what: string;
  src: [string, string] | null;
}

/** A documented void the raw files declared about themselves. */
export interface Absence {
  file: string;
  kind: string;
  what: string;
}

export interface PromotionReport {
  runId: string;
  pipelineVersion: string;
  generator: string;
  source: string;
  inputs: InputFile[];
  counts: PromotionCounts;
  entityKinds: Record<string, number>;
  collisionDetectors: Record<string, number>;
  rejectionRules: Record<string, number>;
  merges: Merge[];
  collisions: CollisionCandidate[];
  rejections: Rejection[];
  warnings: { where: string; message: string }[];
  supersessions: Supersession[];
  absences: Absence[];
}

export const REPORT = raw as unknown as PromotionReport;

export const PROMOTION_COUNTS = REPORT.counts;
export const PROMOTION_INPUTS = REPORT.inputs;
export const SUPERSESSIONS = REPORT.supersessions ?? [];
export const ABSENCES = REPORT.absences ?? [];

/** The id every claim promoted in this run cites alongside its source. */
export function runId(): string {
  return REPORT.runId;
}

export function mergeCount(): number {
  return REPORT.merges.length;
}

/** Every merge, strongest key first. */
export function merges(): Merge[] {
  return REPORT.merges;
}

/**
 * The pairs a naive matcher would have fused. Sorted most-similar first, because
 * the most similar pair is the one a careless matcher would have fused first.
 */
export function collisionCandidates(): CollisionCandidate[] {
  return REPORT.collisions;
}

/** Rejections, fatal first. Pass a level to filter. */
export function rejections(level?: Rejection['level']): Rejection[] {
  return level ? REPORT.rejections.filter((r) => r.level === level) : REPORT.rejections;
}

/** How many distinct real-world entities the raw records resolved to. */
export function entityCount(): number {
  return REPORT.counts.entities;
}

export function tally<T extends { [k: string]: unknown }>(rows: T[], key: keyof T): { name: string; count: number }[] {
  const m = new Map<string, number>();
  for (const r of rows) {
    const k = String(r[key]);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return [...m.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}
