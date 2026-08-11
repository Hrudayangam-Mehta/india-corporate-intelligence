/**
 * The political layer: the Union Council of Ministers.
 *
 * Roster data only — names, seats, dates, parties, portfolios. Factual and neutral.
 * Allegations do not live in this file. They live in the graph as tiered edges, and
 * only after the evidence-auditor has cleared them.
 *
 * Portfolios are date-ranged wherever the source supports it. The date test is the
 * primary falsifier in this project and it can only run if the dates exist.
 *
 * Source: research/raw/cabinet.json — cross-checked against the official portfolio
 * allocation and the parliamentary member directories. Gaps are carried through
 * rather than smoothed over.
 */

import raw from '../../research/raw/cabinet.json';
import type { StateCode } from '../graph/schema';

export type MinisterRank = 'pm' | 'cabinet' | 'mos-independent' | 'mos';

export interface Minister {
  id: string;
  name: string;
  rank: MinisterRank;
  party: string;
  portfolios: string[];
  house: string;
  constituency: string | null;
  state: string;
  stateCode: StateCode;
  since: string | null;
  priorPortfolios?: string[];
  notes?: string;
  srcs: [string, string][];
}

export interface CabinetChange {
  date: string;
  change: string;
  src: [string, string];
}

const doc = raw as unknown as {
  asOf: string;
  sources: [string, string][];
  changesSince2024: CabinetChange[];
  gaps: string[];
  ministers: Minister[];
};

export const CABINET_AS_OF = doc.asOf;
export const CABINET_SOURCES = doc.sources;
export const CABINET_CHANGES = doc.changesSince2024 ?? [];
export const CABINET_GAPS = doc.gaps ?? [];
export const MINISTERS: Minister[] = doc.ministers;

export const RANK_LABEL: Record<MinisterRank, string> = {
  pm: 'Prime Minister',
  cabinet: 'Cabinet Minister',
  'mos-independent': 'Minister of State (Independent Charge)',
  mos: 'Minister of State',
};

export const RANK_ORDER: MinisterRank[] = ['pm', 'cabinet', 'mos-independent', 'mos'];

/** Ministers whose seat is in a given state. Used by the map and the state pages. */
export function ministersByState(): Map<StateCode, Minister[]> {
  const m = new Map<StateCode, Minister[]>();
  for (const p of MINISTERS) {
    if (!m.has(p.stateCode)) m.set(p.stateCode, []);
    m.get(p.stateCode)!.push(p);
  }
  for (const list of m.values()) {
    list.sort((a, b) => RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank));
  }
  return m;
}

export function partyTally(): { party: string; count: number }[] {
  const t = new Map<string, number>();
  for (const p of MINISTERS) t.set(p.party, (t.get(p.party) ?? 0) + 1);
  return [...t.entries()].map(([party, count]) => ({ party, count })).sort((a, b) => b.count - a.count);
}

export function rankTally(): { rank: MinisterRank; count: number }[] {
  return RANK_ORDER.map((rank) => ({ rank, count: MINISTERS.filter((m) => m.rank === rank).length }));
}

/**
 * Which economic portfolios a minister holds. The map from a ministry to the
 * companies it touches is the whole point of joining this dataset to the market
 * layer — but it is a map of REGULATORY REACH, never of influence or intent.
 */
export const ECONOMIC_MINISTRIES: { match: RegExp; sectors: string[]; label: string }[] = [
  { match: /\bCoal\b/i, sectors: ['Metals & Mining', 'Utilities'], label: 'Coal' },
  { match: /\bMines\b/i, sectors: ['Metals & Mining'], label: 'Mines' },
  { match: /Petroleum|Natural Gas/i, sectors: ['Energy'], label: 'Petroleum & Natural Gas' },
  { match: /\bPower\b/i, sectors: ['Utilities'], label: 'Power' },
  { match: /New and Renewable|New & Renewable/i, sectors: ['Utilities', 'Energy'], label: 'New & Renewable Energy' },
  { match: /\bSteel\b/i, sectors: ['Metals & Mining'], label: 'Steel' },
  { match: /Heavy Industries/i, sectors: ['Industrials', 'Auto'], label: 'Heavy Industries' },
  { match: /Road Transport|Highways/i, sectors: ['Infrastructure', 'Cement'], label: 'Road Transport & Highways' },
  { match: /Railways/i, sectors: ['Infrastructure', 'Industrials'], label: 'Railways' },
  { match: /Ports|Shipping|Waterways/i, sectors: ['Infrastructure'], label: 'Ports & Shipping' },
  { match: /Civil Aviation/i, sectors: ['Infrastructure'], label: 'Civil Aviation' },
  { match: /\bFinance\b/i, sectors: ['Financials'], label: 'Finance' },
  { match: /Corporate Affairs/i, sectors: ['Financials'], label: 'Corporate Affairs' },
  { match: /Commerce|Industry/i, sectors: ['Consumer Discretionary', 'Textiles', 'Chemicals'], label: 'Commerce & Industry' },
  { match: /Consumer Affairs|Food and Public Distribution|Food & Public Distribution/i, sectors: ['Consumer Staples', 'Agri'], label: 'Food & Consumer Affairs' },
  { match: /Chemicals|Fertilizers|Fertilisers/i, sectors: ['Chemicals', 'Healthcare'], label: 'Chemicals & Fertilizers' },
  { match: /Telecommunications|Communications/i, sectors: ['Telecom'], label: 'Communications' },
  { match: /Electronics|Information Technology/i, sectors: ['IT'], label: 'Electronics & IT' },
  { match: /\bDefence\b/i, sectors: ['Defence'], label: 'Defence' },
  { match: /Textiles/i, sectors: ['Textiles'], label: 'Textiles' },
  { match: /Housing|Urban Affairs/i, sectors: ['Real Estate', 'Cement', 'Infrastructure'], label: 'Housing & Urban Affairs' },
  { match: /Health and Family Welfare|Health & Family Welfare/i, sectors: ['Healthcare'], label: 'Health' },
  { match: /Information and Broadcasting|Information & Broadcasting/i, sectors: ['Media'], label: 'Information & Broadcasting' },
  { match: /Agriculture|Farmers/i, sectors: ['Agri'], label: 'Agriculture' },
  { match: /Mining/i, sectors: ['Metals & Mining'], label: 'Mining' },
];

export function sectorsTouchedBy(m: Minister): string[] {
  const out = new Set<string>();
  for (const p of m.portfolios) {
    for (const rule of ECONOMIC_MINISTRIES) if (rule.match.test(p)) rule.sectors.forEach((s) => out.add(s));
  }
  return [...out];
}

export function economicPortfolioLabels(m: Minister): string[] {
  const out = new Set<string>();
  for (const p of m.portfolios) {
    for (const rule of ECONOMIC_MINISTRIES) if (rule.match.test(p)) out.add(rule.label);
  }
  return [...out];
}
