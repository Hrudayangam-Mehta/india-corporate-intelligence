import coalRaw from '../../research/raw/resources-coal.json';
import mineralsRaw from '../../research/raw/resources-minerals.json';
import hydrocarbonsRaw from '../../research/raw/resources-hydrocarbons.json';
import type { StateCode } from '../graph/schema';

/**
 * Natural-resource allocation registers.
 *
 * The only domain on this platform where geography is CAUSAL rather than incidental.
 * A coal block is a place — its state, its coalfield and its reserves are properties
 * of the ground, not of the winner. A tender is not a place, which is why the awards
 * register gets a concentration curve and this one gets a map.
 *
 * The organising fact is a regime change. Allocations from 1993 were made by a
 * Screening Committee on applications; the Supreme Court declared that process
 * arbitrary and illegal in 2014, and the Coal Mines (Special Provisions) Act 2015
 * replaced it with competitive auction. Every series in this domain splits at that
 * boundary, because plotting a discretionary regime and an auction regime as one
 * continuous line is a chart that hides its own subject.
 */

export interface ResourceSource {
  publisher: string;
  title: string;
  url: string;
  retrieved: string;
  /** How the document was actually read — "PDF ... extracted with pypdf", "page images". */
  readAs?: string;
}

export interface CoalBlock {
  id: string;
  ministrySerial: string;
  blocksCoveredByThisRow: number;
  mineNameAsPrinted: string;
  state: string;
  district: string | null;
  coalfield: string | null;
  act: string | null;
  tranche: string | null;
  mode: string | null;
  endUse: string | null;
  geologicalReservesMt: number | null;
  peakRatedCapacityMtpa: number | null;
  explorationStatus: string | null;
  winnerLegalName: string | null;
  winnerCin: string | null;
  winnerDirectParent: string | null;
  revenueSharePctFinalOffer: number | null;
  vestingOrAllotmentOrderDate: string | null;
  status: string | null;
  tier: 'documented' | 'reported' | 'alleged' | 'analytic';
  srcs: ResourceSource[];
}

export interface CoalTranche {
  round: number;
  minesOffered: number | null;
  minesOfferedNote?: string | null;
  minesSuccessfullyAuctioned: number | null;
  minesSuccessfullyAuctionedAsOf?: string;
  minesSuccessfullyAuctionedEarlierFigure?: number | null;
  minesSuccessfullyAuctionedEarlierFigureAsOf?: string;
  tier: string;
  srcs: ResourceSource[];
}

export interface WinnerRow {
  rank: number;
  winnerLegalName: string;
  blocksWon: number;
  shareOfAllCommercialBlocksPct: number;
  cumulativeSharePct: number;
  winnerCin: string | null;
  mines: string[];
}

export interface CoalEraRecord {
  fact?: string;
  finding?: string;
  tier?: string;
  srcs?: ResourceSource[];
  [k: string]: unknown;
}

export interface CoalBaseRate {
  claim: string;
  rate: number | null;
  numerator: number | null;
  denominator: number | null;
  denominatorLabel: string;
  tier: string;
  reading: string;
  srcs?: ResourceSource[];
}

const coal = coalRaw as unknown as {
  asOf: string;
  scope: string;
  method: Record<string, unknown>;
  sources: ResourceSource[];
  screeningCommitteeEraAndCancellation: CoalEraRecord[];
  auctionRegime: { id: string; claim: string; figures?: unknown; definitions?: unknown; tier: string; note?: string; srcs: ResourceSource[] }[];
  tranches: CoalTranche[];
  blocks: CoalBlock[];
  denominators: {
    theHeadlineDenominator: {
      commercialBlocksWithVestingOrAllocationOrders: number;
      ministryRowsCoveringThem: number;
      distinctWinningLegalEntities: number;
      meanBlocksPerWinner: number;
      medianBlocksPerWinner: number;
      singleBlockWinners: number;
      singleBlockWinnersAsPctOfWinners: number;
      singleBlockWinnersAsPctOfBlocks: number;
      top1BlocksPct: number;
      top5BlocksPct: number;
      top10BlocksPct: number;
      herfindahlHirschmanIndexOnBlockShare: number;
      asOf: string;
      definition: string;
      top5TieNote?: string;
      srcs: ResourceSource[];
    };
    whyThisIsNotTheOnlyDenominator: Record<string, unknown>;
    [k: string]: unknown;
  };
  winnerFrequencyDistribution: {
    unit: string;
    denominator: number;
    distinctWinners: number;
    note: string;
    distribution: WinnerRow[];
    tieNote?: string;
    srcs: ResourceSource[];
  };
  corporateFamilyCaveat: unknown;
  revenueShareOutcomes: unknown;
  baseRates: CoalBaseRate[];
  gaps: string[];
  rejected: { candidate: string; reason: string }[];
};

export const COAL = coal;
export const COAL_BLOCKS = coal.blocks;
export const COAL_TRANCHES = coal.tranches;
export const COAL_AS_OF = coal.asOf;
export const COAL_HEADLINE = coal.denominators.theHeadlineDenominator;
export const COAL_WINNERS = coal.winnerFrequencyDistribution;

/** State names as printed by the Ministry, mapped to the platform's state codes. */
const STATE_CODE_BY_NAME: Record<string, StateCode> = {
  Chhattisgarh: 'ct',
  Jharkhand: 'jh',
  'Madhya Pradesh': 'mp',
  Maharashtra: 'mh',
  Odisha: 'or',
  'West Bengal': 'wb',
  Assam: 'as',
  'Arunachal Pradesh': 'ar',
};

export function coalStateCode(stateName: string): StateCode | null {
  return STATE_CODE_BY_NAME[stateName.trim()] ?? null;
}

/**
 * Blocks per state, for the allocation layer of the map.
 *
 * `blocksCoveredByThisRow` matters: seven rows in the ministry file carry a
 * hyphenated serial covering two blocks each, so counting rows undercounts blocks
 * by seven. The register's own denominator is 133 blocks across 126 rows, and this
 * must reconcile to it.
 */
export function coalByState(blocks: CoalBlock[] = COAL_BLOCKS): {
  state: string;
  code: StateCode | null;
  blocks: number;
  rows: number;
  winners: number;
}[] {
  const m = new Map<string, { blocks: number; rows: number; winners: Set<string> }>();
  for (const b of blocks) {
    const e = m.get(b.state) ?? { blocks: 0, rows: 0, winners: new Set<string>() };
    e.blocks += b.blocksCoveredByThisRow || 1;
    e.rows += 1;
    if (b.winnerLegalName) e.winners.add(b.winnerLegalName);
    m.set(b.state, e);
  }
  return [...m.entries()]
    .map(([state, v]) => ({
      state,
      code: coalStateCode(state),
      blocks: v.blocks,
      rows: v.rows,
      winners: v.winners.size,
    }))
    .sort((a, b) => b.blocks - a.blocks || a.state.localeCompare(b.state));
}

/**
 * Offered vs auctioned, for the rounds where BOTH numbers exist.
 *
 * They exist for rounds 11–14 only, because the ministry's tranche summary publishes
 * how many mines were auctioned and never how many were offered — the offered count
 * survives only in the pre-bid technical presentations still on the download page.
 * Reporting a take rate across all fourteen rounds would silently treat "offered
 * unknown" as "offered equals auctioned", i.e. a 100% take rate, which is the exact
 * inversion of what the recoverable rounds show.
 */
export function coalTakeRate(): {
  rounds: { round: number; offered: number; auctioned: number }[];
  offered: number;
  auctioned: number;
  ratePct: number | null;
  roundsWithoutOffered: number;
} {
  const rounds = COAL_TRANCHES.filter(
    (t): t is CoalTranche & { minesOffered: number; minesSuccessfullyAuctioned: number } =>
      t.minesOffered != null && t.minesSuccessfullyAuctioned != null,
  ).map((t) => ({ round: t.round, offered: t.minesOffered, auctioned: t.minesSuccessfullyAuctioned }));
  const offered = rounds.reduce((s, r) => s + r.offered, 0);
  const auctioned = rounds.reduce((s, r) => s + r.auctioned, 0);
  return {
    rounds,
    offered,
    auctioned,
    ratePct: offered > 0 ? (auctioned / offered) * 100 : null,
    roundsWithoutOffered: COAL_TRANCHES.length - rounds.length,
  };
}

/**
 * Identifier coverage — and this one bounds the concentration finding rather than
 * merely describing the data.
 *
 * A CIN is what lets two rows be resolved to one corporate family. Where it is
 * missing, a group holding several blocks under differently-named vehicles is
 * indistinguishable from several unrelated single-block winners. The missing CINs
 * are concentrated among exactly those single-block private winners, so the measured
 * HHI is a FLOOR on concentration, never a measurement of it.
 */
export function coalIdentifierCoverage(): {
  withCin: number;
  total: number;
  pct: number;
  missingAmongSingleBlockWinners: number;
} {
  const withCin = COAL_BLOCKS.filter((b) => b.winnerCin).length;
  const singleBlockNames = new Set(
    COAL_WINNERS.distribution.filter((w) => w.blocksWon === 1).map((w) => w.winnerLegalName),
  );
  return {
    withCin,
    total: COAL_BLOCKS.length,
    pct: COAL_BLOCKS.length ? (withCin / COAL_BLOCKS.length) * 100 : 0,
    missingAmongSingleBlockWinners: COAL_BLOCKS.filter(
      (b) => !b.winnerCin && b.winnerLegalName && singleBlockNames.has(b.winnerLegalName),
    ).length,
  };
}

// ---------------------------------------------------------------------------
// Non-coal minerals
// ---------------------------------------------------------------------------

export interface MineralBlock {
  id: string;
  register: string;
  awardingBody: string | null;
  blockName: string;
  state: string;
  mineral: string;
  concessionType: string | null;
  areaAsPrinted: string | null;
  reserveEstimateAsPrinted: string | null;
  nitDate: string | null;
  auctionDate: string | null;
  reservePricePctOfValueDispatched: number | null;
  winningPremiumPctOfValueDispatched: number | null;
  quotesReceived: number | null;
  winnerAsPrinted: string | null;
  tier: 'documented' | 'reported' | 'alleged' | 'analytic';
  srcs: ResourceSource[];
}

export interface MineralTranche {
  tranche: number;
  romanNumeral: string | null;
  launchDate: string | null;
  blocksOffered: number | null;
  blocksSuccessfullyAuctioned: number | null;
  blocksAnnulled: number | null;
  resultDate: string | null;
  states: string[] | null;
  minerals: string[] | null;
  note?: string;
  srcs: ResourceSource[];
}

const minerals = mineralsRaw as unknown as {
  asOf: string;
  scope: string;
  title: string;
  sources: ResourceSource[];
  regime: { id?: string; claim: string; tier: string; note?: string; srcs: ResourceSource[] }[];
  tranches: MineralTranche[];
  totals: { id: string; claim: string; value: number | null; unit: string; asOf: string; note?: string; scope?: string; tier: string; srcs: ResourceSource[] }[];
  blocks: MineralBlock[];
  denominators: {
    note: string;
    criticalMineralAuction: {
      blockOfferings: number;
      uniqueBlocksOffered: number;
      blocksSuccessfullyAuctioned: number;
      blocksAnnulled: number;
      unreconciled: number;
      windowCovered: string;
      asOf: string;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  baseRates: CoalBaseRate[];
  portalAsymmetry: {
    body: string;
    url: string;
    reachable: boolean;
    format: string;
    publishesResults: boolean;
    fieldsCarried?: string[];
    note?: string;
  }[];
  gaps: string[];
  rejected: { candidate: string; reason: string }[];
};

export const MINERALS = minerals;
export const MINERAL_BLOCKS = minerals.blocks;
export const MINERAL_TRANCHES = minerals.tranches;
export const MINERALS_AS_OF = minerals.asOf;
export const CRITICAL_MINERALS = minerals.denominators.criticalMineralAuction;

/**
 * Critical-mineral annulment rate.
 *
 * The register's headline, and the reason it needs to be stated with its denominator
 * attached: the file records that THREE different denominators are in circulation for
 * this one programme, giving answers 18 percentage points apart, and that the ministry
 * publishes the most flattering of them. Offerings (a block offered in three tranches
 * counts three times) is the honest denominator for "did this tranche sell", because
 * a block re-offered twice and annulled twice failed twice.
 */
export function mineralAnnulment(): {
  offerings: number;
  uniqueBlocks: number;
  auctioned: number;
  annulled: number;
  annulmentRateOnOfferings: number;
  annulmentRateOnUnique: number;
  window: string;
  asOf: string;
} {
  const c = CRITICAL_MINERALS;
  return {
    offerings: c.blockOfferings,
    uniqueBlocks: c.uniqueBlocksOffered,
    auctioned: c.blocksSuccessfullyAuctioned,
    annulled: c.blocksAnnulled,
    annulmentRateOnOfferings: c.blockOfferings ? (c.blocksAnnulled / c.blockOfferings) * 100 : 0,
    annulmentRateOnUnique: c.uniqueBlocksOffered
      ? (c.blocksAnnulled / c.uniqueBlocksOffered) * 100
      : 0,
    window: c.windowCovered,
    asOf: c.asOf,
  };
}

export function mineralsByState(): { state: string; code: StateCode | null; blocks: number; minerals: number }[] {
  const m = new Map<string, { blocks: number; minerals: Set<string> }>();
  for (const b of MINERAL_BLOCKS) {
    const e = m.get(b.state) ?? { blocks: 0, minerals: new Set<string>() };
    e.blocks++;
    if (b.mineral) e.minerals.add(b.mineral);
    m.set(b.state, e);
  }
  return [...m.entries()]
    .map(([state, v]) => ({
      state,
      code: STATE_CODE_BY_NAME[state] ?? null,
      blocks: v.blocks,
      minerals: v.minerals.size,
    }))
    .sort((a, b) => b.blocks - a.blocks || a.state.localeCompare(b.state));
}

/** Quote-count coverage — the mineral register's version of the bidder-count hole. */
export function mineralQuoteCoverage(): { withQuotes: number; total: number; mean: number | null } {
  const withQ = MINERAL_BLOCKS.filter((b) => b.quotesReceived != null);
  return {
    withQuotes: withQ.length,
    total: MINERAL_BLOCKS.length,
    mean: withQ.length
      ? withQ.reduce((s, b) => s + (b.quotesReceived ?? 0), 0) / withQ.length
      : null,
  };
}

// ---------------------------------------------------------------------------
// Hydrocarbons
// ---------------------------------------------------------------------------

export interface HydrocarbonRound {
  round: string;
  regime: string;
  launchYear: number | null;
  signingYear: number | null;
  blocksOffered: number | null;
  blocksAwarded: number | null;
  bidsReceived: number | null;
  biddersParticipating: number | null;
  singleBidBlocks: number | null;
  singleBidSharePct: number | null;
  areaAwardedSqKm: number | null;
  tier: string;
  notes?: string;
  srcs: ResourceSource[];
}

export interface HydrocarbonBlock {
  id: string;
  round: string;
  blockId: string;
  basin: string | null;
  terrain: string | null;
  areaSqKm: number | null;
  awardee: string | null;
  awardDate: string | null;
  bidsReceived: number | null;
  singleBid: boolean | null;
  tier: 'documented' | 'reported' | 'alleged' | 'analytic';
  srcs: ResourceSource[];
  notes?: string;
}

const hydro = hydrocarbonsRaw as unknown as {
  asOf: string;
  scope: string;
  /** States the file's central statistic AND its coverage limit, before anything else. */
  readThisFirst: string;
  sources: ResourceSource[];
  regimes: { id?: string; claim: string; tier: string; note?: string; srcs: ResourceSource[] }[];
  rounds: HydrocarbonRound[];
  blocks: HydrocarbonBlock[];
  kgD6: { claim: string; finding?: string; tier: string; srcs: ResourceSource[] }[];
  denominators: Record<string, { value: number; note?: string; srcs: unknown }>;
  baseRates: CoalBaseRate[];
  gaps: string[];
  rejected: { candidate: string; reason: string }[];
};

export const HYDROCARBONS = hydro;
export const HC_ROUNDS = hydro.rounds;
export const HC_BLOCKS = hydro.blocks;
export const HC_AS_OF = hydro.asOf;

/**
 * Single-bid share per round, for the rounds that published a block-by-block bid table.
 *
 * Only four OALP rounds have one. Computing a rate across all rounds would silently
 * treat "bid count unpublished" as "more than one bid", which is the assumption most
 * favourable to a competitive reading and the one the data cannot support.
 */
export function hydrocarbonSingleBid(): {
  rounds: { round: string; awarded: number; single: number; pct: number; year: number | null }[];
  covered: number;
  totalRounds: number;
  blocksWithoutBidCount: number;
  totalBlocks: number;
} {
  const rounds = HC_ROUNDS.filter(
    (r): r is HydrocarbonRound & { blocksAwarded: number; singleBidBlocks: number } =>
      r.singleBidBlocks != null && r.blocksAwarded != null && r.blocksAwarded > 0,
  ).map((r) => ({
    round: r.round,
    awarded: r.blocksAwarded,
    single: r.singleBidBlocks,
    pct: (r.singleBidBlocks / r.blocksAwarded) * 100,
    year: r.signingYear ?? r.launchYear,
  }));
  return {
    rounds,
    covered: rounds.length,
    totalRounds: HC_ROUNDS.length,
    blocksWithoutBidCount: HC_BLOCKS.filter((b) => b.bidsReceived == null).length,
    totalBlocks: HC_BLOCKS.length,
  };
}

/** Offered vs awarded across every round that publishes both. */
export function hydrocarbonTakeRate(): {
  rounds: { round: string; regime: string; offered: number; awarded: number }[];
  offered: number;
  awarded: number;
  ratePct: number | null;
} {
  const rounds = HC_ROUNDS.filter(
    (r): r is HydrocarbonRound & { blocksOffered: number; blocksAwarded: number } =>
      r.blocksOffered != null && r.blocksAwarded != null,
  ).map((r) => ({
    round: r.round,
    regime: r.regime,
    offered: r.blocksOffered,
    awarded: r.blocksAwarded,
  }));
  const offered = rounds.reduce((s, r) => s + r.offered, 0);
  const awarded = rounds.reduce((s, r) => s + r.awarded, 0);
  return { rounds, offered, awarded, ratePct: offered ? (awarded / offered) * 100 : null };
}

// ---------------------------------------------------------------------------
// The cross-register spine
// ---------------------------------------------------------------------------

export interface RegisterTension {
  register: string;
  route: string;
  unit: string;
  /** Mean bidders per lot, or null where the register does not publish bid counts. */
  biddersPerLot: number | null;
  biddersNote: string;
  offered: number | null;
  taken: number | null;
  asOf: string;
  note: string;
}

/**
 * The same two questions, asked identically of every register: how many bidders
 * showed up per lot, and how much of what was offered found a buyer.
 *
 * Everything here is derived. `null` means the register does not publish the figure,
 * which is a different fact from zero and renders differently — the coal register
 * publishes reserve price, final offer and winner for every mine and the bid count
 * for none, and that hole is a finding about the disclosure regime rather than a hole
 * in our own coverage.
 */
export function registerTension(): RegisterTension[] {
  const coalTake = coalTakeRate();
  const mineral = mineralAnnulment();
  const hcTake = hydrocarbonTakeRate();
  const hcSingle = hydrocarbonSingleBid();
  const mineralQuotes = mineralQuoteCoverage();

  return [
    {
      register: 'Coal blocks',
      route: '/resources?register=coal',
      unit: 'block',
      biddersPerLot: null,
      biddersNote: `0 of ${COAL_BLOCKS.length} rows carry a bid count — the Ministry of Coal publishes reserve price, final offer and winner, never the number of bids`,
      offered: coalTake.offered || null,
      taken: coalTake.auctioned || null,
      asOf: COAL_AS_OF,
      note:
        coalTake.roundsWithoutOffered > 0
          ? `Offered count recoverable for ${coalTake.rounds.length} of ${coalTake.rounds.length + coalTake.roundsWithoutOffered} rounds only`
          : 'All rounds',
    },
    {
      register: 'Critical mineral blocks',
      route: '/resources?register=minerals',
      unit: 'block offering',
      biddersPerLot: mineralQuotes.mean,
      biddersNote: `quotes recorded for ${mineralQuotes.withQuotes} of ${mineralQuotes.total} block records`,
      offered: mineral.offerings,
      taken: mineral.auctioned,
      asOf: mineral.asOf,
      note: `${mineral.annulled} annulled — ${mineral.annulmentRateOnOfferings.toFixed(0)}% of offerings`,
    },
    {
      register: 'Hydrocarbon blocks',
      route: '/resources?register=hydrocarbons',
      unit: 'block',
      biddersPerLot: null,
      biddersNote: `bid count published for ${hcSingle.totalBlocks - hcSingle.blocksWithoutBidCount} of ${hcSingle.totalBlocks} awarded blocks; four rounds carry a block-by-block table`,
      offered: hcTake.offered,
      taken: hcTake.awarded,
      asOf: HC_AS_OF,
      note: `single-bid share rose from ${hcSingle.rounds[0]?.pct.toFixed(1)}% to ${Math.max(...hcSingle.rounds.map((r) => r.pct)).toFixed(1)}% across the covered rounds`,
    },
  ];
}

/** Revenue-share coverage — the only published proxy for what a block fetched. */
export function coalRevenueShareCoverage(): {
  withOffer: number;
  total: number;
  min: number | null;
  max: number | null;
  median: number | null;
} {
  const vals = COAL_BLOCKS.map((b) => b.revenueSharePctFinalOffer).filter(
    (v): v is number => v != null,
  );
  const sorted = [...vals].sort((a, b) => a - b);
  return {
    withOffer: vals.length,
    total: COAL_BLOCKS.length,
    min: sorted[0] ?? null,
    max: sorted[sorted.length - 1] ?? null,
    median: sorted.length ? sorted[Math.floor(sorted.length / 2)] : null,
  };
}
