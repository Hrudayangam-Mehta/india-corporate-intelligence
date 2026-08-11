/**
 * Government award register — central and state.
 *
 * Two datasets with the same shape and very different coverage, and the difference
 * is the point.
 *
 * The central register carries 88 awards across seven ministries, 16 of which have
 * a bidder count. The state register carries 37 across eleven states and **none**
 * has a bidder count, because no state publishes one. Every state award was
 * reconstructed from the winner's own disclosures rather than from the awarding
 * state.
 *
 * That asymmetry constrains what can be claimed. A sole-bidder award and a
 * twelve-bidder award are identical in a table and completely different facts, so
 * the state data supports a coverage map and not a concentration analysis. The UI
 * enforces that rather than leaving it to the reader.
 */

import centreRaw from '../../research/raw/tenders-centre.json';
import statesRaw from '../../research/raw/tenders-states.json';
import type { Tier, StateCode } from '../graph/schema';

export type ProcessType =
  | 'open-tender' | 'auction' | 'ppp' | 'nomination' | 'swiss-challenge' | 'unknown' | string;

export interface Award {
  id: string;
  awardingBody: string;
  /** Central only. */
  ministry?: string;
  /** State only. */
  state?: string;
  stateCode?: StateCode;
  sector: string;
  winner: string;
  winnerGroup: string | null;
  winnerNse: string | null;
  what: string;
  valueCr: number | null;
  awardDate: string | null;
  processType: ProcessType;
  /** Companies that COMPETED, never companies that won. Null where not published. */
  bidders: number | null;
  soleBidder: boolean | null;
  /** State only — a roster field for computing rates across differently-governed states. */
  governingParty?: string | null;
  tier: Tier;
  notes: string;
  srcs: [string, string][];
}

export interface MinistryRollup {
  ministry: string;
  awardCount: number;
  totalValueCr: number | null;
  distinctWinners: number | null;
  note: string;
}

export interface StateRollup {
  stateCode: StateCode;
  state: string;
  awardCount: number;
  totalValueCr: number | null;
  distinctWinners: number | null;
  note: string;
}

export interface Concentration {
  sector: string;
  topWinner: string;
  topWinnerShareOfValue: number | null;
  /** What the share is OF. Mandatory — a count without this is not a finding. */
  denominator: string;
  note: string;
  srcs: [string, string][];
}

export interface TenderBaseRate {
  claim: string;
  rate: number | null;
  numerator: number | null;
  denominator: number | null;
  denominatorLabel: string;
  reading: string;
  srcs: [string, string][];
}

/** Whether a state publishes procurement data at all, and in what form. */
export interface StateCoverage {
  stateCode: StateCode;
  portalFound: boolean;
  portalUrl: string | null;
  machineReadable: boolean;
  note: string;
}

const centre = centreRaw as unknown as {
  asOf: string;
  sources: [string, string][];
  awards: Award[];
  byMinistry: MinistryRollup[];
  concentration: Concentration[];
  baseRates: TenderBaseRate[];
  gaps: string[];
  rejected?: { candidate: string; reason: string }[];
};

const states = statesRaw as unknown as {
  asOf: string;
  sources: [string, string][];
  awards: Award[];
  byState: StateRollup[];
  baseRates: TenderBaseRate[];
  coverage: StateCoverage[];
  gaps: string[];
  rejected?: { candidate: string; reason: string }[];
};

export const CENTRE = centre;
export const STATES_TENDERS = states;
export const TENDERS_AS_OF = centre.asOf;

export const ALL_AWARDS: Award[] = [...centre.awards, ...states.awards];

/**
 * Bidder-count coverage — the measure that decides what this data can support.
 * Published on the page rather than buried, because every concentration claim
 * downstream depends on it.
 */
export function bidderCoverage(awards: Award[]): { withCount: number; total: number; pct: number } {
  const withCount = awards.filter((a) => a.bidders != null).length;
  return { withCount, total: awards.length, pct: awards.length ? (withCount / awards.length) * 100 : 0 };
}

export function valueCoverage(awards: Award[]): { withValue: number; total: number } {
  return { withValue: awards.filter((a) => a.valueCr != null).length, total: awards.length };
}

export function winnerTally(awards: Award[]): { winner: string; count: number; valueCr: number }[] {
  const m = new Map<string, { count: number; valueCr: number }>();
  for (const a of awards) {
    const e = m.get(a.winner) ?? { count: 0, valueCr: 0 };
    e.count++;
    e.valueCr += a.valueCr ?? 0;
    m.set(a.winner, e);
  }
  return [...m.entries()]
    .map(([winner, v]) => ({ winner, ...v }))
    .sort((a, b) => b.count - a.count || b.valueCr - a.valueCr);
}

export function sectorTally(awards: Award[]): { sector: string; count: number; winners: number }[] {
  const m = new Map<string, Set<string>>();
  const c = new Map<string, number>();
  for (const a of awards) {
    if (!m.has(a.sector)) m.set(a.sector, new Set());
    m.get(a.sector)!.add(a.winner);
    c.set(a.sector, (c.get(a.sector) ?? 0) + 1);
  }
  return [...c.entries()]
    .map(([sector, count]) => ({ sector, count, winners: m.get(sector)!.size }))
    .sort((a, b) => b.count - a.count);
}

/** Coverage keyed by state, for the transparency map. */
export const COVERAGE_BY_STATE = new Map(states.coverage.map((c) => [c.stateCode, c]));

/**
 * Transparency score per state, for the choropleth.
 *   2 = portal found and machine-readable
 *   1 = portal found, not machine-readable
 *   0 = portal not reachable — "could not check", never "no portal"
 * Deliberately coarse. A finer scale would imply a precision the survey does not have.
 */
export function transparencyScore(code: StateCode): number | null {
  const c = COVERAGE_BY_STATE.get(code);
  if (!c) return null;
  if (c.machineReadable) return 2;
  return c.portalFound ? 1 : 0;
}

export const TRANSPARENCY_LABEL: Record<number, string> = {
  2: 'Portal found, machine-readable',
  1: 'Portal found, not machine-readable',
  0: 'Portal not reachable — could not check',
};
