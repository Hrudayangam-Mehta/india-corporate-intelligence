/**
 * Conglomerate ownership backbone.
 *
 * Descriptive corporate structure ONLY. No allegations, no investigations, no
 * wrongdoing claims live in this file — that is the graph's job, under tiering.
 *
 * The Mukesh/Anil Ambani split is handled STRUCTURALLY, not just in prose: Anil
 * Ambani's entities sit in `separateAnilAmbaniGroup`, outside `listedEntities` and
 * excluded from `combinedMcapCr`, so no downstream aggregation can conflate them.
 * Conflating the two groups is a factual error that discredits everything near it.
 *
 * Source: research/raw/conglomerates.json. Market caps and promoter percentages
 * are stamped with the quarter they come from and are as-of, never current.
 */

import raw from '../../research/raw/conglomerates.json';
import type { StateCode } from '../graph/schema';

export interface ListedEntity {
  name: string;
  nse: string | null;
  bse: string | null;
  sector: string;
  mcapCr: number | null;
  promoterHoldingPct: number | null;
  asOfQuarter?: string;
  hqState: StateCode;
  listedYear: string | null;
  notes?: string;
  srcs: [string, string][];
}

export interface KeyPerson {
  name: string;
  role: string;
  entity: string;
  since: string | null;
  family: boolean;
  notes?: string;
  srcs: [string, string][];
}

export interface Subsidiary {
  name: string;
  parent: string;
  activity: string;
  srcs: [string, string][];
}

export interface ForeignPartner {
  name: string;
  country: string;
  stake: string;
  entity: string;
  notes?: string;
  srcs: [string, string][];
}

export interface Group {
  id: string;
  name: string;
  promoterFamily: string;
  holdingEntity: string;
  foundedYear: string;
  hqCity: string;
  state: string;
  stateCode: StateCode;
  sectors: string[];
  combinedMcapCr: number | null;
  listedEntities: ListedEntity[];
  formerListedEntities?: (ListedEntity & { status?: string })[];
  separateAnilAmbaniGroup?: { note?: string; entities?: ListedEntity[] } | ListedEntity[];
  keyPeople: KeyPerson[];
  notableSubsidiaries: Subsidiary[];
  foreignPartners: ForeignPartner[];
  notes?: string;
  srcs: [string, string][];
}

const doc = raw as unknown as {
  asOf: string;
  scope?: string;
  methodology?: Record<string, string>;
  sources: [string, string][];
  disambiguation: Record<string, string>;
  groups: Group[];
  gaps: string[];
};

export const GROUPS_AS_OF = doc.asOf;
export const GROUPS: Group[] = doc.groups;
export const GROUP_SOURCES = doc.sources;
export const GROUP_GAPS = doc.gaps ?? [];
export const DISAMBIGUATION = doc.disambiguation ?? {};
export const GROUP_METHODOLOGY = doc.methodology ?? {};

export const GROUP_BY_ID = new Map(GROUPS.map((g) => [g.id, g]));

export function allListedEntities(): (ListedEntity & { group: string; groupId: string })[] {
  return GROUPS.flatMap((g) => g.listedEntities.map((e) => ({ ...e, group: g.name, groupId: g.id })));
}

export function groupTotals() {
  return GROUPS.map((g) => ({
    id: g.id,
    name: g.name,
    mcapCr: g.combinedMcapCr,
    entities: g.listedEntities.length,
    people: g.keyPeople.length,
    familyPeople: g.keyPeople.filter((p) => p.family).length,
    sectors: g.sectors.length,
    stateCode: g.stateCode,
  })).sort((a, b) => (b.mcapCr ?? 0) - (a.mcapCr ?? 0));
}

/**
 * Sector overlap between two groups. This is a DESCRIPTIVE measure of where two
 * groups compete or coexist — it carries no claim about coordination, and the UI
 * must not present it as one.
 */
export function sectorOverlap(a: Group, b: Group): string[] {
  const setB = new Set(b.sectors.map((s) => s.toLowerCase()));
  return a.sectors.filter((s) => setB.has(s.toLowerCase()));
}
