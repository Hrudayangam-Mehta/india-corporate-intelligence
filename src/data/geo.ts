/**
 * India state/UT geometry.
 *
 * 36 real SVG paths in viewBox "0 0 612 696", derived from @svg-maps/india.
 * `cx`/`cy` are the POLE OF INACCESSIBILITY of each state's largest sub-polygon —
 * the interior point furthest from any edge — computed offline. Bounding-box
 * centres fall outside Gujarat, Kerala, Odisha and West Bengal, so they are not
 * used anywhere.
 */

import raw from './india-geo.json';
import type { StateCode } from '../graph/schema';

export interface StateGeo {
  id: StateCode;
  name: string;
  path: string;
  /** Label anchor: pole of inaccessibility of the largest part. */
  cx: number;
  cy: number;
  /** Free radius around the anchor, in viewBox units. The label-fit budget. */
  clearance: number;
  area: number;
  bbox: [number, number, number, number];
  /** Sub-polygon count. West Bengal 63, Gujarat 17, Andaman 36 — islands are real. */
  parts: number;
}

export const VIEWBOX = (raw as { viewBox: string }).viewBox;
export const STATES = (raw as unknown as { states: StateGeo[] }).states;

export const STATE_BY_ID = new Map<string, StateGeo>(STATES.map((s) => [s.id, s]));

/** Label treatment thresholds — see the india-map skill. */
export type LabelMode = 'full' | 'code' | 'leader';

export function labelMode(s: StateGeo): LabelMode {
  if (s.clearance >= 20) return 'full';
  if (s.clearance >= 8) return 'code';
  return 'leader';
}

/** States that always need an outboard label with a leader line. */
export const LEADER_STATES = STATES.filter((s) => labelMode(s) === 'leader').map((s) => s.id);

export const STATE_NAMES: Record<string, string> = Object.fromEntries(
  STATES.map((s) => [s.id, s.name]),
);

/** Full name → code, for reconciling research output that uses names. */
export const CODE_BY_NAME: Record<string, StateCode> = Object.fromEntries(
  STATES.map((s) => [s.name.toLowerCase(), s.id]),
) as Record<string, StateCode>;

const NAME_ALIASES: Record<string, StateCode> = {
  odisha: 'or',
  orissa: 'or',
  'jammu & kashmir': 'jk',
  'jammu and kashmir': 'jk',
  ladakh: 'jk',
  pondicherry: 'py',
  puducherry: 'py',
  uttaranchal: 'ut',
  'nct of delhi': 'dl',
  'new delhi': 'dl',
  'national capital territory of delhi': 'dl',
  'dadra & nagar haveli': 'dn',
  'daman & diu': 'dd',
  'dadra and nagar haveli and daman and diu': 'dn',
  'tamilnadu': 'tn',
  'chattisgarh': 'ct',
  'chhatisgarh': 'ct',
  'andaman & nicobar islands': 'an',
  'andaman and nicobar': 'an',
  'nct delhi': 'dl',
  telengana: 'tg',
};

export function resolveState(name: string | null | undefined): StateCode | null {
  if (!name) return null;
  const k = name.trim().toLowerCase();
  if (STATE_BY_ID.has(k)) return k as StateCode;
  return CODE_BY_NAME[k] ?? NAME_ALIASES[k] ?? null;
}

/**
 * Golden-angle spiral placement inside a state.
 *
 * This is a DELIBERATE APPROXIMATION: marks are positioned *within* the state,
 * not geocoded. Any view that uses this must say so. Radius is clamped to the
 * state's clearance so marks never spill outside the polygon.
 */
export function spiralWithin(s: StateGeo, i: number, total: number): { x: number; y: number } {
  if (total <= 1) return { x: s.cx, y: s.cy };
  const golden = 2.399963229728653; // 137.507° in radians
  const maxR = Math.max(3, s.clearance * 0.72);
  const r = maxR * Math.sqrt(i / Math.max(1, total - 1));
  const a = i * golden;
  return { x: s.cx + r * Math.cos(a), y: s.cy + r * Math.sin(a) };
}

/** Approximate lon/lat → viewBox, for the few entities with real city coordinates. */
export function projectLonLat(lon: number, lat: number): { x: number; y: number } {
  // Calibrated against known state anchors in the source projection.
  const x = ((lon - 67.5) / (97.5 - 67.5)) * 612;
  const y = 696 - ((lat - 6.5) / (37.5 - 6.5)) * 696;
  return { x, y };
}
