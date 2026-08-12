import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Kicker, PageTitle, Standfirst, Byline, Section, Callout, StatGrid, DataTable,
  Prose, Footnote, TierChip,
} from '../components/Editorial';
import {
  DenominatorStrip, GapsPanel, SourceLedger, ConcentrationCurve, RegimeSplit,
  CompetitiveTension, type Gap, type LedgerEntry, type TensionRow,
} from '../components/Domain';
import IndiaMap from '../components/viz/IndiaMap';
import {
  COAL, COAL_BLOCKS, COAL_AS_OF, COAL_HEADLINE, COAL_WINNERS,
  coalByState, coalTakeRate, coalIdentifierCoverage,
  MINERALS, MINERAL_BLOCKS, MINERAL_TRANCHES, MINERALS_AS_OF,
  mineralAnnulment, mineralsByState, mineralQuoteCoverage,
  HYDROCARBONS, HC_BLOCKS, HC_AS_OF,
  hydrocarbonSingleBid, hydrocarbonTakeRate,
  registerTension,
} from '../data/resources';
import type { StateCode } from '../graph/schema';

type Register = 'all' | 'coal' | 'minerals' | 'hydrocarbons';
type View = 'map' | 'blocks' | 'winners' | 'record';

const REGISTERS: { id: Register; label: string; asOf: string }[] = [
  { id: 'all', label: 'All registers', asOf: COAL_AS_OF },
  { id: 'coal', label: 'Coal', asOf: COAL_AS_OF },
  { id: 'minerals', label: 'Minerals', asOf: MINERALS_AS_OF },
  { id: 'hydrocarbons', label: 'Hydrocarbons', asOf: HC_AS_OF },
];

/**
 * Natural-resource allocation registers.
 *
 * The only domain where geography is causal rather than incidental — a coal block IS
 * a place — so the centre is a map. The organising fact is the 2014-15 regime change,
 * and every series splits there, because plotting a discretionary regime and an
 * auction regime as one continuous line hides the subject of the chart.
 *
 * Three registers ship here and the comparison across them is the point: they are
 * three different allocation mechanisms over the same kind of object, and the same
 * two questions can be asked of each.
 */
export default function Resources() {
  const [params, setParams] = useSearchParams();
  const setParam = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v == null || v === '') next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  const register = (params.get('register') ?? 'all') as Register;
  const view = (params.get('view') ?? 'map') as View;
  const stateFilter = params.get('state') ?? 'all';
  const query = params.get('q') ?? '';
  const [selectedState, setSelectedState] = useState<StateCode | null>(null);

  const coalStates = useMemo(() => coalByState(), []);
  const mineralStates = useMemo(() => mineralsByState(), []);
  const takeRate = useMemo(() => coalTakeRate(), []);
  const idCoverage = useMemo(() => coalIdentifierCoverage(), []);
  const annulment = useMemo(() => mineralAnnulment(), []);
  const quotes = useMemo(() => mineralQuoteCoverage(), []);
  const singleBid = useMemo(() => hydrocarbonSingleBid(), []);
  const hcTake = useMemo(() => hydrocarbonTakeRate(), []);
  const tension = useMemo(() => registerTension(), []);

  const tensionRows: TensionRow[] = useMemo(
    () =>
      tension.map((t) => ({
        register: t.register,
        biddersPerLot: t.biddersPerLot,
        taken: t.taken ?? 0,
        offered: t.offered ?? 0,
        asOf: t.asOf,
        unit: t.unit,
        note: t.note,
      })),
    [tension],
  );

  const coalFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COAL_BLOCKS.filter(
      (b) =>
        (stateFilter === 'all' || b.state === stateFilter) &&
        (!q ||
          `${b.mineNameAsPrinted} ${b.winnerLegalName ?? ''} ${b.state} ${b.coalfield ?? ''}`
            .toLowerCase()
            .includes(q)),
    );
  }, [stateFilter, query]);

  const mineralFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MINERAL_BLOCKS.filter(
      (b) =>
        (stateFilter === 'all' || b.state === stateFilter) &&
        (!q ||
          `${b.blockName} ${b.winnerAsPrinted ?? ''} ${b.state} ${b.mineral}`
            .toLowerCase()
            .includes(q)),
    );
  }, [stateFilter, query]);

  const hcFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return HC_BLOCKS.filter(
      (b) =>
        !q ||
        `${b.blockId} ${b.awardee ?? ''} ${b.basin ?? ''} ${b.round}`.toLowerCase().includes(q),
    );
  }, [query]);

  const coalBlockCount = coalFiltered.reduce((s, b) => s + (b.blocksCoveredByThisRow || 1), 0);

  const mapData = useMemo(() => {
    const d: Partial<Record<StateCode, { value: number | null; detail?: string }>> = {};
    if (register === 'minerals') {
      for (const s of mineralStates) {
        if (!s.code) continue;
        d[s.code] = { value: s.blocks, detail: `${s.minerals} minerals` };
      }
    } else {
      for (const s of coalStates) {
        if (!s.code) continue;
        d[s.code] = { value: s.blocks, detail: `${s.winners} distinct winners` };
      }
    }
    return d;
  }, [register, coalStates, mineralStates]);

  const gaps: Gap[] = useMemo(() => {
    const src =
      register === 'minerals' ? MINERALS.gaps
      : register === 'hydrocarbons' ? HYDROCARBONS.gaps
      : register === 'coal' ? COAL.gaps
      : [...COAL.gaps, ...MINERALS.gaps, ...HYDROCARBONS.gaps];
    return src.map((g) => ({
      what: g.slice(0, 200) + (g.length > 200 ? '…' : ''),
      why: g.length > 200 ? g.slice(200) : 'Recorded during retrieval.',
    }));
  }, [register]);

  const ledger: LedgerEntry[] = useMemo(() => {
    const src =
      register === 'minerals' ? MINERALS.sources
      : register === 'hydrocarbons' ? HYDROCARBONS.sources
      : register === 'coal' ? COAL.sources
      : [...COAL.sources, ...MINERALS.sources, ...HYDROCARBONS.sources];
    return src.map((s) => ({
      label: `${s.publisher} — ${s.title}`,
      url: s.url,
      establishes: s.readAs ? `Read as: ${s.readAs}` : 'See per-claim citations above.',
      primary: /gov\.in|nic\.in|sci\.gov\.in|mstcecommerce|dghindia/i.test(s.url),
      retrieved: s.retrieved,
    }));
  }, [register]);

  const showCoal = register === 'all' || register === 'coal';
  const showMinerals = register === 'all' || register === 'minerals';
  const showHydro = register === 'all' || register === 'hydrocarbons';

  return (
    <div className="max-w-[1180px]">
      <Kicker>Natural resources · allocation registers</Kicker>
      <PageTitle>Who was given the ground</PageTitle>
      <Standfirst>
        A coal block is a place. Its state, its coalfield and its reserves are properties of the
        earth, not of whoever won it — which is why this domain gets a map where the awards
        register gets a curve. Three registers sit here: coal, non-coal minerals and
        hydrocarbons. They are three different mechanisms for handing over the same kind of
        object, and the comparison between them is the point.
      </Standfirst>
      <Byline>
        {COAL_HEADLINE.commercialBlocksWithVestingOrAllocationOrders} coal blocks ·{' '}
        {MINERAL_BLOCKS.length} mineral block records · {HC_BLOCKS.length} hydrocarbon blocks
      </Byline>

      <div className="mt-6">
        <DenominatorStrip
          asOf={REGISTERS.find((r) => r.id === register)?.asOf ?? COAL_AS_OF}
          facts={[
            {
              n: coalBlockCount,
              of: COAL_HEADLINE.commercialBlocksWithVestingOrAllocationOrders,
              label: 'coal blocks',
            },
            { n: mineralFiltered.length, of: MINERAL_BLOCKS.length, label: 'mineral records' },
            { n: hcFiltered.length, of: HC_BLOCKS.length, label: 'hydrocarbon blocks' },
          ]}
        />
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {REGISTERS.map((r) => (
          <button
            key={r.id}
            onClick={() => setParam('register', r.id === 'all' ? null : r.id)}
            className={`font-mono text-[11px] px-2.5 py-1 rounded border transition-colors ${
              register === r.id
                ? 'border-accent text-accent'
                : 'border-border text-text-muted hover:border-border-light'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <Section
        title="Competitive tension across the three registers"
        note="The same two questions, asked identically of each — and answerable in none of them completely"
      >
        <Prose>
          <p>
            One number decides whether an auction was an auction: <strong>how many bidders showed
            up</strong>. It is neutral — a low count is as consistent with an unattractive asset,
            a heavy capex threshold or outstanding forest clearances as with anything else — which
            is why it can be shown without a caveat wrapped around it, unlike any score attached
            to a company.
          </p>
        </Prose>
        <div className="mt-4">
          <CompetitiveTension
            rows={tensionRows}
            caption="“not published” is not zero. It means the awarding body does not disclose the figure, which is a fact about the disclosure regime rather than a hole in this platform's coverage. Every offered→taken pair here is computed only over the rounds that publish both numbers; treating an unpublished offered count as equal to the sold count would imply a 100% take rate, which is the exact inversion of what the recoverable rounds show."
          />
        </div>
        <div className="mt-5 grid md:grid-cols-3 gap-4">
          {tension.map((t) => (
            <div key={t.register} className="border border-border rounded-lg p-3.5">
              <p className="font-medium text-[14px]">{t.register}</p>
              <p className="text-[12.5px] text-text-muted mt-1.5 leading-relaxed">{t.biddersNote}</p>
            </div>
          ))}
        </div>
      </Section>

      {showHydro && singleBid.rounds.length > 0 && (
        <Section
          title="The clearest competition series on the platform"
          note="Hydrocarbon blocks that drew exactly one bid, per round, where DGH published a block-by-block table"
        >
          <div className="space-y-2">
            {singleBid.rounds.map((r) => (
              <div key={r.round} className="flex items-center gap-3 text-[13px]">
                <span className="w-36 shrink-0 text-text-secondary truncate" title={r.round}>
                  {r.round}
                </span>
                <span className="flex-1 max-w-[280px] h-3.5 bg-bg-elevated rounded-sm overflow-hidden">
                  <span
                    className={`block h-full ${r.pct > 50 ? 'bg-amber/70' : 'bg-sage/70'}`}
                    style={{ width: `${r.pct}%` }}
                  />
                </span>
                <span className="font-mono text-[11px] tabular-nums text-text-muted">
                  {r.single} of {r.awarded}
                </span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${r.pct > 50 ? 'text-amber' : 'text-sage'}`}
                >
                  {r.pct.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
          <Callout label="What the register says about itself, before anything else" tone="bottomline">
            {HYDROCARBONS.readThisFirst}
          </Callout>
          <p className="text-[13.5px] text-text-muted mt-4 max-w-[74ch] leading-relaxed">
            {singleBid.blocksWithoutBidCount} of {singleBid.totalBlocks} awarded blocks carry no
            published bid count at all, and only {singleBid.covered} of {singleBid.totalRounds}{' '}
            rounds have a block-by-block table. Computing a single-bid rate across every round
            would silently treat "bid count unpublished" as "more than one bid" — the assumption
            most favourable to a competitive reading, and the one the data cannot support.
          </p>
        </Section>
      )}

      {showMinerals && (
        <Section
          title="The critical-mineral annulment rate, and the three denominators it can be divided by"
          note="Where a published rate depends entirely on which denominator the publisher chose"
        >
          <StatGrid
            items={[
              { value: String(annulment.offerings), label: 'block offerings, tranches I–VII' },
              { value: String(annulment.auctioned), label: 'successfully auctioned', tone: 'sage' },
              { value: String(annulment.annulled), label: 'annulled', tone: 'rose' },
              {
                value: `${annulment.annulmentRateOnOfferings.toFixed(0)}%`,
                label: 'annulled, as a share of offerings',
                tone: 'accent',
              },
            ]}
          />
          <Callout label="The denominator problem, stated by the register itself" tone="warn">
            {MINERALS.denominators.note}
            <br />
            <br />
            On <strong className="text-text">offerings</strong> ({annulment.offerings}, counting a
            block offered in three tranches three times) the annulment rate is{' '}
            <strong className="text-text">{annulment.annulmentRateOnOfferings.toFixed(1)}%</strong>.
            On <strong className="text-text">unique blocks</strong> ({annulment.uniqueBlocks}) it is{' '}
            <strong className="text-text">{annulment.annulmentRateOnUnique.toFixed(1)}%</strong>.
            Offerings is the honest denominator for "did this tranche sell", because a block
            re-offered twice and annulled twice failed twice.
          </Callout>
          <div className="mt-5 space-y-1.5">
            {MINERAL_TRANCHES.map((t) => {
              const offered = t.blocksOffered ?? 0;
              const sold = t.blocksSuccessfullyAuctioned;
              return (
                <div key={t.tranche} className="flex items-center gap-3 text-[13px]">
                  <span className="w-24 shrink-0 font-mono text-[11px] text-text-muted">
                    tranche {t.romanNumeral ?? t.tranche}
                  </span>
                  <span className="flex-1 max-w-[280px] h-3.5 bg-bg-elevated rounded-sm overflow-hidden">
                    {sold != null && offered > 0 && (
                      <span
                        className="block h-full bg-accent/70"
                        style={{ width: `${(sold / offered) * 100}%` }}
                      />
                    )}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-text-muted">
                    {offered} offered →{' '}
                    {sold == null ? (
                      <span className="text-amber">no result yet</span>
                    ) : (
                      <span className="text-text">{sold} sold</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[13px] text-text-muted mt-3 max-w-[74ch] leading-relaxed">
            A high annulment rate is consistent with reserve prices set above what bidders
            thought the blocks were worth, with exploration data too thin to price against, and
            with a genuinely immature market for these minerals in India. It is a measure of the
            lots, not a verdict on anyone.
          </p>
        </Section>
      )}

      {showCoal && (
        <>
          <Section
            title="Read this before any coal number below"
            note="Two figures in general circulation are wrong, and both are wrong in the same direction"
          >
            <Callout label="“The Supreme Court cancelled 204 of 218 blocks”" tone="warn">
              Neither order uses either number. The 25 August 2014 judgment declared the Screening
              Committee allocations arbitrary and illegal and{' '}
              <strong className="text-text">expressly left the consequences open</strong> (para
              157) — it cancelled nothing, which is why a second order was needed a month later.
              The 24 September 2014 order did the cancelling, and its own arithmetic is{' '}
              <strong className="text-text">
                46 blocks identified as producing or ready to produce, 42 quashed, 4 saved
              </strong>
              . The only "204" in that order is an interlocutory application number in a footnote.
              <br />
              <br />
              <strong className="text-text">204 is statutory, not judicial</strong> — the row count
              of Schedule I of the Coal Mines (Special Provisions) Act 2015, defined more broadly
              than the order. 218 is the Union's own affidavit figure of 216, plus 2 coal-to-liquid
              blocks mentioned orally by the Attorney General.
            </Callout>
            <div className="mt-4">
              <Callout label="“The CAG found a ₹1.86 lakh crore loss to the exchequer”" tone="warn">
                The report says something different, and says it precisely. Chapter 4, para 4.3,
                headed <em>Financial gains to the private parties</em>, computes a{' '}
                <strong className="text-text">
                  financial gain of ₹1,85,591.34 crore to private parties
                </strong>{' '}
                in respect of 57 opencast and mixed mines as at 31 March 2011, and adds only that{' '}
                <em>"a part of this financial gain could have been tapped by the Government."</em>
                <br />
                <br />
                It is a gain to allottees, not a loss to the exchequer, and it covers 57 mines —
                excluding underground mines, PSU joint ventures, every government allottee and the
                12 ultra-mega power project blocks. The ₹295.41 per tonne net gain inside it is the
                ancestor of the ₹295 per tonne levy the Court later imposed.
              </Callout>
            </div>
          </Section>

          <Section
            title="The regime change, which is why every series splits"
            note="1993–2011 discretionary allocation against 2015-onward competitive auction"
          >
            <RegimeSplit
              boundary="Coal Mines (Special Provisions) Act 2015, following the Supreme Court orders of 25 August and 24 September 2014"
              unit="blocks"
              periods={[
                {
                  name: 'Screening Committee',
                  span: '1993 – 31 March 2011',
                  rule: 'Allocation on application, decided by a committee across 36 meetings. No competitive bidding — and the CAG found it could lawfully have been introduced in 2006 on the Law Ministry’s own advice.',
                  bars: [
                    { label: 'allocated (affidavit)', value: 216 },
                    { label: 'live at judgment', value: 194 },
                    { label: 'producing / ready', value: 46 },
                    { label: 'quashed', value: 42 },
                    { label: 'saved', value: 4 },
                  ],
                },
                {
                  name: 'Competitive auction',
                  span: '2015 – present',
                  rule: 'Forward auction on percentage revenue share, floor 4% (2% underground). Vesting follows payment, so a declared winner is not yet an allottee.',
                  bars: [
                    {
                      label: 'vested',
                      value: COAL_HEADLINE.commercialBlocksWithVestingOrAllocationOrders,
                    },
                    {
                      label: 'distinct winners',
                      value: COAL_HEADLINE.distinctWinningLegalEntities,
                    },
                    { label: 'won exactly one', value: COAL_HEADLINE.singleBlockWinners },
                  ],
                },
              ]}
            />
            <p className="text-[13px] text-text-muted mt-3 max-w-[74ch] leading-relaxed">
              The two panels are not two measurements of one quantity. The left counts allocations
              under a process the Court struck down; the right counts blocks that completed vesting
              under its replacement. They share a scale so magnitudes are comparable, and nothing
              more should be read across them.
            </p>
          </Section>

          {takeRate.rounds.length > 0 && (
            <Section
              title="Coal: offered against sold"
              note="Recoverable only where the pre-bid document survives on the download page"
            >
              <div className="space-y-1.5">
                {takeRate.rounds.map((r) => (
                  <div key={r.round} className="flex items-center gap-3 text-[13px]">
                    <span className="w-20 shrink-0 font-mono text-[11px] text-text-muted">
                      round {r.round}
                    </span>
                    <span className="flex-1 max-w-[280px] h-3.5 bg-bg-elevated rounded-sm overflow-hidden">
                      <span
                        className="block h-full bg-accent/70"
                        style={{ width: `${(r.auctioned / r.offered) * 100}%` }}
                      />
                    </span>
                    <span className="font-mono text-[11px] tabular-nums text-text-muted">
                      {r.offered} offered → <span className="text-text">{r.auctioned}</span> sold
                    </span>
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        r.auctioned / r.offered < 0.5 ? 'text-amber' : 'text-sage'
                      }`}
                    >
                      {((r.auctioned / r.offered) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[13.5px] text-text-secondary mt-4 max-w-[74ch] leading-relaxed">
                Across the {takeRate.rounds.length} round
                {takeRate.rounds.length === 1 ? '' : 's'} where both figures exist,{' '}
                <strong className="text-text">
                  {takeRate.auctioned} of {takeRate.offered}
                </strong>{' '}
                mines offered were sold — {takeRate.ratePct?.toFixed(0)}%.{' '}
                {takeRate.roundsWithoutOffered > 0 && (
                  <>
                    The other {takeRate.roundsWithoutOffered} round
                    {takeRate.roundsWithoutOffered === 1 ? '' : 's'} publish no offered count and
                    are excluded rather than assumed.
                  </>
                )}
              </p>
            </Section>
          )}

          <Section
            title="Coal concentration, and the reason it is a floor"
            note="The full winner distribution, including every entity that won exactly one block"
          >
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <ConcentrationCurve
                  values={COAL_WINNERS.distribution.map((w) => w.blocksWon)}
                  label="coal blocks"
                />
                <p className="font-mono text-[11px] text-text-muted mt-2">
                  top 1 {COAL_HEADLINE.top1BlocksPct}% · top 5 {COAL_HEADLINE.top5BlocksPct}% · top
                  10 {COAL_HEADLINE.top10BlocksPct}% · HHI{' '}
                  {COAL_HEADLINE.herfindahlHirschmanIndexOnBlockShare}
                </p>
              </div>
              <div>
                <Callout label="The base rate" tone="bottomline">
                  <strong className="text-text">
                    {COAL_HEADLINE.singleBlockWinners} of{' '}
                    {COAL_HEADLINE.distinctWinningLegalEntities} winners (
                    {COAL_HEADLINE.singleBlockWinnersAsPctOfWinners}%) won exactly one block
                  </strong>
                  , and between them they hold {COAL_HEADLINE.singleBlockWinnersAsPctOfBlocks}% of
                  all blocks. The median winner holds {COAL_HEADLINE.medianBlocksPerWinner}. Any
                  sentence of the form "company X won N coal blocks" has to be read against that.
                </Callout>
                <div className="mt-4">
                  <Callout label="Why the measured concentration is a floor" tone="warn">
                    A CIN is what allows two rows to be resolved to one corporate family.{' '}
                    <strong className="text-text">
                      {idCoverage.total - idCoverage.withCin} of {idCoverage.total} rows carry no
                      CIN
                    </strong>
                    , and the missing ones sit almost entirely among the single-block private
                    winners — precisely where a group holding several blocks through
                    differently-named vehicles would be invisible. An HHI of{' '}
                    {COAL_HEADLINE.herfindahlHirschmanIndexOnBlockShare} is a lower bound on
                    concentration, never a measurement of it.
                  </Callout>
                </div>
              </div>
            </div>
            {COAL_HEADLINE.top5TieNote && (
              <p className="text-[13px] text-text-muted mt-4 max-w-[76ch] leading-relaxed border-l-2 border-border-light pl-3">
                {COAL_HEADLINE.top5TieNote}
              </p>
            )}
          </Section>
        </>
      )}

      {showMinerals && MINERALS.portalAsymmetry?.length > 0 && (
        <Section
          title="Which states publish, and which do not"
          note="The asymmetry between state portals is itself a finding about the register"
        >
          <DataTable
            columns={['Body', 'Reachable', 'Publishes results', 'Format']}
            rows={MINERALS.portalAsymmetry.map((p) => [
              <span key="b">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text underline underline-offset-2 decoration-border-light hover:decoration-accent"
                >
                  {p.body}
                </a>
                {p.note && (
                  <span className="block text-[11.5px] text-text-muted mt-0.5 max-w-[52ch]">
                    {p.note.slice(0, 180)}
                    {p.note.length > 180 ? '…' : ''}
                  </span>
                )}
              </span>,
              <span
                key="r"
                className={`font-mono text-[10.5px] ${p.reachable ? 'text-sage' : 'text-rose'}`}
              >
                {p.reachable ? 'yes' : 'no'}
              </span>,
              <span
                key="p"
                className={`font-mono text-[10.5px] ${p.publishesResults ? 'text-sage' : 'text-amber'}`}
              >
                {p.publishesResults ? 'yes' : 'no'}
              </span>,
              <span key="f" className="text-[12px] text-text-muted">
                {p.format}
              </span>,
            ])}
          />
        </Section>
      )}

      <Section title="Where the blocks are" note="Registered geography is the ground itself here, not an office address">
        <div className="flex flex-wrap gap-2 mb-4">
          {(['map', 'blocks', 'winners', 'record'] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setParam('view', v === 'map' ? null : v)}
              className={`font-mono text-[11px] px-2.5 py-1 rounded border transition-colors ${
                view === v
                  ? 'border-accent text-accent'
                  : 'border-border text-text-muted hover:border-border-light'
              }`}
            >
              {v}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => setParam('q', e.target.value)}
            placeholder="filter by block, winner, basin…"
            className="ml-auto bg-bg-elevated border border-border rounded px-2.5 py-1 text-[12.5px] w-56 focus:border-accent outline-none"
          />
        </div>

        {view === 'map' && (
          <>
            <IndiaMap
              data={mapData}
              metricLabel={register === 'minerals' ? 'Mineral block records' : 'Coal blocks vested'}
              unit="blocks"
              scaleMode="linear"
              onSelect={(code) => {
                setSelectedState(code);
                const list = register === 'minerals' ? mineralStates : coalStates;
                const s = list.find((x) => x.code === code);
                setParam('state', s ? s.state : null);
              }}
              selected={selectedState}
            />
            <div className="mt-4 space-y-1.5">
              {(register === 'minerals' ? mineralStates : coalStates).map((s, _i, arr) => (
                <div key={s.state} className="flex items-center gap-3 text-[13px]">
                  <button
                    onClick={() => setParam('state', stateFilter === s.state ? null : s.state)}
                    className={`w-36 shrink-0 text-left ${
                      stateFilter === s.state ? 'text-accent' : 'text-text-secondary hover:text-text'
                    }`}
                  >
                    {s.state}
                  </button>
                  <span
                    className="h-3 bg-accent/60 rounded-sm"
                    style={{ width: `${(s.blocks / arr[0].blocks) * 240}px`, minWidth: '2px' }}
                  />
                  <span className="font-mono text-[11px] text-text-muted tabular-nums">
                    {s.blocks} block{s.blocks === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[13px] text-text-muted mt-3 max-w-[74ch] leading-relaxed">
              District is null for every coal block in this register. No Ministry of Coal document
              opened in this pass carries it — the tranche-wise file gives the state, the technical
              presentations give the coalfield. It was not inferred. Hydrocarbon blocks are keyed
              to basins rather than states, and basins cross state lines, so they do not appear on
              this map at all.
            </p>
          </>
        )}

        {view === 'blocks' && showCoal && (
          <DataTable
            columns={['Mine', 'State / coalfield', 'Winner', 'Revenue share', 'Vested', 'Tier']}
            rows={coalFiltered.slice(0, 200).map((b) => [
              <span key="m">
                <strong className="text-text">{b.mineNameAsPrinted}</strong>
                {b.blocksCoveredByThisRow > 1 && (
                  <span className="font-mono text-[10px] text-amber ml-2">
                    {b.blocksCoveredByThisRow} blocks in one row
                  </span>
                )}
                <span className="block font-mono text-[10px] text-text-muted mt-0.5">
                  {b.tranche ?? '—'} · {b.mode ?? '—'} · {b.endUse ?? '—'}
                </span>
              </span>,
              <span key="s" className="text-[12.5px]">
                {b.state}
                {b.coalfield && (
                  <span className="block text-[11.5px] text-text-muted">{b.coalfield}</span>
                )}
              </span>,
              <span key="w" className="text-[12.5px]">
                {b.winnerLegalName ?? '—'}
                <span
                  className={`block font-mono text-[10px] mt-0.5 ${b.winnerCin ? 'text-text-muted' : 'text-amber'}`}
                >
                  {b.winnerCin ?? 'CIN not obtained'}
                </span>
              </span>,
              <span key="r" className="font-mono text-[11.5px] tabular-nums">
                {b.revenueSharePctFinalOffer != null ? (
                  `${b.revenueSharePctFinalOffer}%`
                ) : (
                  <span className="text-amber">not published</span>
                )}
              </span>,
              <span key="v" className="font-mono text-[11px] text-text-muted">
                {b.vestingOrAllotmentOrderDate ?? '—'}
              </span>,
              <TierChip key="t" tier={b.tier} />,
            ])}
          />
        )}

        {view === 'blocks' && register === 'minerals' && (
          <DataTable
            columns={['Block', 'State / mineral', 'Winner', 'Premium', 'Quotes', 'Tier']}
            rows={mineralFiltered.slice(0, 200).map((b) => [
              <span key="b">
                <strong className="text-text">{b.blockName}</strong>
                <span className="block font-mono text-[10px] text-text-muted mt-0.5">
                  {b.concessionType ?? '—'} · NIT {b.nitDate ?? '—'}
                </span>
              </span>,
              <span key="s" className="text-[12.5px]">
                {b.state}
                <span className="block text-[11.5px] text-text-muted">{b.mineral}</span>
              </span>,
              <span key="w" className="text-[12.5px]">
                {b.winnerAsPrinted ?? <span className="text-amber">annulled or no result</span>}
              </span>,
              <span key="p" className="font-mono text-[11.5px] tabular-nums">
                {b.winningPremiumPctOfValueDispatched != null
                  ? `${b.winningPremiumPctOfValueDispatched}%`
                  : '—'}
              </span>,
              <span key="q" className="font-mono text-[11.5px] tabular-nums">
                {b.quotesReceived ?? <span className="text-amber">not published</span>}
              </span>,
              <TierChip key="t" tier={b.tier} />,
            ])}
          />
        )}

        {view === 'blocks' && register === 'hydrocarbons' && (
          <DataTable
            columns={['Block', 'Basin / terrain', 'Awardee', 'Bids', 'Awarded', 'Tier']}
            rows={hcFiltered.slice(0, 200).map((b) => [
              <span key="b">
                <strong className="text-text">{b.blockId}</strong>
                <span className="block font-mono text-[10px] text-text-muted mt-0.5">
                  {b.round}
                </span>
              </span>,
              <span key="s" className="text-[12.5px]">
                {b.basin ?? '—'}
                {b.terrain && (
                  <span className="block text-[11.5px] text-text-muted">{b.terrain}</span>
                )}
              </span>,
              <span key="w" className="text-[12.5px]">
                {b.awardee ?? '—'}
              </span>,
              <span key="q" className="font-mono text-[11.5px] tabular-nums">
                {b.bidsReceived == null ? (
                  <span className="text-amber">not published</span>
                ) : (
                  <>
                    {b.bidsReceived}
                    {b.singleBid && <span className="text-amber ml-1.5">sole</span>}
                  </>
                )}
              </span>,
              <span key="v" className="font-mono text-[11px] text-text-muted">
                {b.awardDate ?? '—'}
              </span>,
              <TierChip key="t" tier={b.tier} />,
            ])}
          />
        )}

        {view === 'winners' && (
          <>
            <p className="text-[13.5px] text-text-muted mb-3 max-w-[74ch] leading-relaxed">
              {COAL_WINNERS.note}
            </p>
            <DataTable
              columns={['Rank', 'Winner', 'Blocks', 'Share', 'Cumulative', 'CIN']}
              rows={COAL_WINNERS.distribution.map((w) => [
                <span key="r" className="font-mono text-[11px] text-text-muted">
                  {w.rank}
                </span>,
                <span key="w">
                  <strong className="text-text">{w.winnerLegalName}</strong>
                  {w.mines.length > 0 && (
                    <span className="block text-[11.5px] text-text-muted mt-0.5 max-w-[52ch]">
                      {w.mines.join(' · ')}
                    </span>
                  )}
                </span>,
                <span key="b" className="font-mono text-[12px] tabular-nums">
                  {w.blocksWon}
                </span>,
                <span key="s" className="font-mono text-[11.5px] tabular-nums text-text-muted">
                  {w.shareOfAllCommercialBlocksPct}%
                </span>,
                <span key="c" className="font-mono text-[11.5px] tabular-nums text-text-muted">
                  {w.cumulativeSharePct}%
                </span>,
                <span
                  key="cin"
                  className={`font-mono text-[10px] ${w.winnerCin ? 'text-text-muted' : 'text-amber'}`}
                >
                  {w.winnerCin ?? 'not obtained'}
                </span>,
              ])}
            />
          </>
        )}

        {view === 'record' && (
          <div className="space-y-5">
            {COAL.screeningCommitteeEraAndCancellation.map((r, i) => (
              <div key={i} className="border-l-2 border-accent/40 pl-3">
                <p className="text-[14.5px] text-text leading-relaxed max-w-[76ch]">
                  {String(r.fact ?? '')}
                </p>
                {r.finding && (
                  <p className="text-[13px] text-text-muted mt-1.5 max-w-[76ch] leading-relaxed">
                    {String(r.finding)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="What the registers establish" note="Each with the denominator it is drawn from">
        <StatGrid
          items={[
            {
              value: String(COAL_HEADLINE.commercialBlocksWithVestingOrAllocationOrders),
              label: `coal blocks vested, across ${COAL_HEADLINE.ministryRowsCoveringThem} ministry rows`,
            },
            {
              value: `${COAL_HEADLINE.singleBlockWinnersAsPctOfWinners}%`,
              label: 'of coal winners took exactly one block',
              tone: 'accent',
            },
            {
              value: `${annulment.annulmentRateOnOfferings.toFixed(0)}%`,
              label: 'of critical-mineral offerings were annulled',
              tone: 'accent',
            },
            {
              value: `${hcTake.awarded}/${hcTake.offered}`,
              label: 'hydrocarbon blocks awarded of those offered',
            },
            {
              value: `${quotes.withQuotes}/${quotes.total}`,
              label: 'mineral records carrying a quote count',
              tone: 'muted',
            },
            { value: '0', label: 'coal blocks with a published bidder count', tone: 'rose' },
          ]}
        />
        <Callout label="Zero of every coal block has a published bidder count" tone="warn">
          The Ministry of Coal publishes the reserve price, the final offer and the winner for each
          mine, and never the number of bids received. The same hole appears in the awards
          register, where coal discloses bid position for none of its rows while spectrum, airports
          and renewables disclose it for all of theirs. It bounds every claim about competition in
          this register <em>in both directions</em> — nothing here can show that a coal auction was
          competitive, and nothing here can show that it was not.
        </Callout>
      </Section>

      <Section title="Base rates" note="Read before drawing anything from the tables above">
        <div className="space-y-4">
          {[
            ...(showCoal ? COAL.baseRates : []),
            ...(showMinerals ? MINERALS.baseRates : []),
            ...(showHydro ? HYDROCARBONS.baseRates : []),
          ].map((b, i) => (
            <div key={i} className="border-l-2 border-border-light pl-3">
              <p className="font-medium text-[14.5px]">“{b.claim}”</p>
              {b.rate != null && (
                <p className="font-mono text-[12px] text-accent mt-1">
                  {b.rate}
                  {b.numerator != null && b.denominator != null && (
                    <span className="text-text-muted">
                      {' '}
                      ({b.numerator} of {b.denominator} — {b.denominatorLabel})
                    </span>
                  )}
                </p>
              )}
              <p className="text-[13.5px] text-text-muted mt-1 max-w-[74ch] leading-relaxed">
                {b.reading}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Candidates checked and rejected"
        note="A rejection is a result, and names the check that killed it"
      >
        <div className="space-y-3">
          {[
            ...(showCoal ? COAL.rejected : []),
            ...(showMinerals ? MINERALS.rejected : []),
            ...(showHydro ? HYDROCARBONS.rejected : []),
          ].map((r, i) => (
            <div key={i} className="border-l-2 border-rose/40 pl-3">
              <p className="font-medium text-[14px]">{r.candidate}</p>
              <p className="text-[13px] text-text-muted mt-1 max-w-[74ch] leading-relaxed">
                {r.reason}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Gaps" note="Named at the same size as the findings, because they bound them">
        <GapsPanel gaps={gaps} />
      </Section>

      <Section title="Sources" note="Every one opened, with how it was actually read">
        <SourceLedger entries={ledger} />
      </Section>

      <Footnote>
        <p>
          <strong>One register still missing.</strong> Spectrum is in research and will join these
          three. Until it lands, nothing here should be read as a statement about Indian resource
          allocation generally — three registers is three mechanisms, not a survey.
        </p>
        <p>
          <strong>Standing.</strong> Every figure comes from a document the platform opened, with
          how it was read recorded alongside it. Nothing here asserts intent, coordination or
          wrongdoing by any named entity, and a block won is a block won.{' '}
          <Link to="/tenders" className="underline underline-offset-2">
            The awards register
          </Link>{' '}
          ·{' '}
          <Link to="/patterns" className="underline underline-offset-2">
            Why the discipline exists
          </Link>
        </p>
      </Footnote>
    </div>
  );
}
