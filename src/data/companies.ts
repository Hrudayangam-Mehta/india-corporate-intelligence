/**
 * The listed-company layer: NSE and BSE constituents by registered headquarters.
 *
 * REGISTERED HQ, NOT OPERATIONAL HQ. Coal India is Kolkata-registered even though
 * the coal is in Jharkhand and Chhattisgarh; ONGC is Delhi-registered even though
 * the fields are offshore Mumbai and in Assam. Conflating the two is the single
 * most common error in state-wise corporate maps, so the registered state drives
 * `stateCode` and the operational reality goes in `notes`.
 *
 * Market caps are stamped `asOf` and are as-of-a-date, never current.
 *
 * Source: research/raw/companies-by-state.json, promoted from the research
 * quarantine after validation. Gaps are carried through, not smoothed over.
 */

import raw from '../../research/raw/companies-by-state.json';
import stateEconomyRaw from '../../research/raw/state-economy.json';
import type { StateCode } from '../graph/schema';

export type Ownership = 'private' | 'psu-central' | 'psu-state' | 'mnc-subsidiary';

export interface Company {
  id: string;
  name: string;
  shortName: string;
  nse: string | null;
  bse: string | null;
  isin: string | null;
  sector: string;
  industry: string;
  marketCapCr: number | null;
  hqCity: string;
  state: string;
  stateCode: StateCode;
  group: string | null;
  ownership: Ownership;
  founded: string | null;
  employees: number | null;
  notes?: string;
  srcs: [string, string][];
}

export interface StateEconomy {
  stateCode: StateCode;
  name: string;
  gsdpCr: number | null;
  gsdpYear: string | null;
  population: number | null;
  populationYear: string | null;
  capital: string;
  dominantIndustries: string[];
  notableClusters: string[];
  srcs: [string, string][];
}

const doc = raw as unknown as {
  asOf: string;
  marketCapUnit: string;
  sources: [string, string][];
  companies: Company[];
  statesWithNoListedHQ?: { stateCode: StateCode; note: string }[] | string[];
  gaps?: string[];
};

const econ = stateEconomyRaw as unknown as {
  asOf: string;
  sources: [string, string][];
  states: StateEconomy[];
};

export const COMPANIES_AS_OF = doc.asOf;
export const COMPANY_SOURCES = doc.sources;
export const COMPANY_GAPS = doc.gaps ?? [];
export const COMPANIES: Company[] = doc.companies ?? [];
export const STATES_WITH_NO_LISTED_HQ = doc.statesWithNoListedHQ ?? [];

export const STATE_ECONOMY: StateEconomy[] = econ.states ?? [];
export const STATE_ECONOMY_AS_OF = econ.asOf;
export const ECONOMY_BY_STATE = new Map(STATE_ECONOMY.map((s) => [s.stateCode, s]));

export const EXCHANGE_OF = (c: Company): ('NSE' | 'BSE')[] => {
  const out: ('NSE' | 'BSE')[] = [];
  if (c.nse) out.push('NSE');
  if (c.bse) out.push('BSE');
  return out;
};

/** Convenience alias so the graph builder and pages read the same shape. */
export type CompanyWithExchanges = Company & { exchanges: ('NSE' | 'BSE')[] };

export function withExchanges(c: Company): CompanyWithExchanges {
  return { ...c, exchanges: EXCHANGE_OF(c) };
}

export interface StateRollup {
  stateCode: StateCode;
  companies: Company[];
  count: number;
  nseCount: number;
  bseCount: number;
  totalMcapCr: number;
  /** How many companies in this state have no recorded market cap. */
  mcapGaps: number;
  topSectors: { sector: string; count: number; mcapCr: number }[];
  psuCount: number;
}

export function rollupByState(companies: Company[] = COMPANIES): Map<StateCode, StateRollup> {
  const m = new Map<StateCode, StateRollup>();
  for (const c of companies) {
    if (!m.has(c.stateCode)) {
      m.set(c.stateCode, {
        stateCode: c.stateCode,
        companies: [],
        count: 0,
        nseCount: 0,
        bseCount: 0,
        totalMcapCr: 0,
        mcapGaps: 0,
        topSectors: [],
        psuCount: 0,
      });
    }
    const r = m.get(c.stateCode)!;
    r.companies.push(c);
    r.count++;
    if (c.nse) r.nseCount++;
    if (c.bse) r.bseCount++;
    if (c.marketCapCr == null) r.mcapGaps++;
    else r.totalMcapCr += c.marketCapCr;
    if (c.ownership.startsWith('psu')) r.psuCount++;
  }
  for (const r of m.values()) {
    const bySector = new Map<string, { count: number; mcapCr: number }>();
    for (const c of r.companies) {
      const e = bySector.get(c.sector) ?? { count: 0, mcapCr: 0 };
      e.count++;
      e.mcapCr += c.marketCapCr ?? 0;
      bySector.set(c.sector, e);
    }
    r.topSectors = [...bySector.entries()]
      .map(([sector, v]) => ({ sector, ...v }))
      .sort((a, b) => b.mcapCr - a.mcapCr || b.count - a.count);
    r.companies.sort((a, b) => (b.marketCapCr ?? 0) - (a.marketCapCr ?? 0));
  }
  return m;
}

export function sectorTotals(companies: Company[] = COMPANIES) {
  const m = new Map<string, { count: number; mcapCr: number; states: Set<StateCode> }>();
  for (const c of companies) {
    const e = m.get(c.sector) ?? { count: 0, mcapCr: 0, states: new Set<StateCode>() };
    e.count++;
    e.mcapCr += c.marketCapCr ?? 0;
    e.states.add(c.stateCode);
    m.set(c.sector, e);
  }
  return [...m.entries()]
    .map(([sector, v]) => ({ sector, count: v.count, mcapCr: v.mcapCr, states: v.states.size }))
    .sort((a, b) => b.mcapCr - a.mcapCr);
}

/**
 * Herfindahl–Hirschman index over market cap. A concentration measure, nothing
 * more: a high HHI says a sector is dominated by few listed firms, which is a
 * structural fact about the market and not an allegation about anyone.
 */
export function hhi(values: number[]): number {
  const total = values.reduce((a, b) => a + b, 0);
  if (total <= 0) return 0;
  return values.reduce((a, v) => a + ((v / total) * 100) ** 2, 0);
}
