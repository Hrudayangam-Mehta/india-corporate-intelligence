import { useMemo } from 'react';
import {
  Kicker, PageTitle, Standfirst, Byline, Section, Prose, Callout,
  StatGrid, DataTable, Cite, Footnote,
} from '../components/Editorial';
import { BASE_RATES, DISCRIMINATION_META, classify, computeRate, type Discrimination } from '../graph/baseRates';
import { COMPANIES } from '../data/companies';

/**
 * Base Rates — "compared to what?"
 *
 * A network graph is only informative if its edges are SELECTIVE. Three of the four
 * edge types people most want to draw in Indian corporate-political data are close
 * to universal, which means drawing them proves almost nothing. This page publishes
 * the arithmetic.
 */

const BAR_COLOR: Record<Discrimination, string> = {
  none: '#6b6558',
  negligible: '#6b6558',
  weak: '#9c9688',
  moderate: '#5aa89e',
  high: '#7a9e7e',
};

const TEXT_COLOR: Record<Discrimination, string> = {
  none: 'text-text-muted',
  negligible: 'text-text-muted',
  weak: 'text-text-secondary',
  moderate: 'text-teal',
  high: 'text-sage',
};

const TENDER_LEDGER = [
  ['Vedanta', 'Largest mine in tranche 1 (6 MTPA); later Radhikapur West and Kuraloi (A) North', 'Nov 2020 – Jun 2021', true],
  ['Hindalco', 'Commercial coal block, tranche 1', 'Nov 2020', true],
  ['Jindal Power / JSPL', 'Tranche 1 block; later Gare Palma IV/6', 'Nov 2020 / Oct 2022', true],
  ['Aurobindo Realty & Infrastructure', 'Takli-Jena-Bellora N&S (Maharashtra); Urma Paharitola (Jharkhand) at 26.5% revenue share', 'Nov 2020', true],
  ['EMIL Mines & Mineral Resources', 'Radhikapur East, Odisha, 16.75% revenue share', 'Nov 2020', true],
  ['Adani Group', 'Gondbahera Ujheni East, 250 Mt, sole bidder, allotted after rule change', 'Aug 2022', true],
  ['Adani Agri Logistics', '4 of 14 FCI silo contracts, Phase 1 DBFOT; then all contracts in the round following the clause removal', 'Apr 2022 onward', false],
  ['Leap India Food & Logistics', '38 of 48 FCI silo contracts in Phase 2, worth ₹6,173 cr of ₹7,149 cr', 'from Sep 2024', true],
];

function Bar({ rate, disc }: { rate: number; disc: Discrimination }) {
  const signal = Math.max(0, 1 - rate);
  return (
    <div>
      <div className="flex h-8 border border-border rounded overflow-hidden bg-bg">
        <span
          style={{
            width: `${rate * 100}%`,
            background:
              'repeating-linear-gradient(90deg,rgba(155,150,136,.5),rgba(155,150,136,.5) 5px,rgba(107,101,88,.5) 5px,rgba(107,101,88,.5) 10px)',
          }}
        />
        <span style={{ width: `${signal * 100}%`, background: BAR_COLOR[disc] }} />
      </div>
      <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-text-muted mt-1.5 gap-4">
        <span>{(rate * 100).toFixed(1)}% — expected by default</span>
        <span>{(signal * 100).toFixed(1)}% residual</span>
      </div>
    </div>
  );
}

export default function BaseRates() {
  // Measured from the loaded dataset, never asserted. The page prints the
  // denominator alongside every rate it shows.
  const shared = useMemo(() => (COMPANIES.length ? computeRate(COMPANIES, (c) => c.stateCode === 'mh') : null), []);

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Denominators · the question every edge has to answer</Kicker>
        <PageTitle>Compared to what?</PageTitle>
        <Standfirst>
          The obvious graph — tender winners linked to party donations, to a national relief fund, to CSR
          spending — can be drawn. The problem is that almost all of those links are near-universal, which
          means drawing them proves close to nothing. You would get the identical web from a random sample
          of large Indian companies that never won anything. Here is the arithmetic.
        </Standfirst>
        <Byline>ECI contribution reports · RTI disclosures · statutory text · CSR annual reports</Byline>
      </header>

      <Callout label="The core problem with the graph everyone wants" tone="bottomline">
        <p>
          A network graph is only informative if its edges are <em>selective</em> — if drawing one
          distinguishes the flagged companies from everyone else.
        </p>
        <p>
          <strong>Donations to the ruling party:</strong> it took 82.45% of all money routed through
          electoral trusts in 2024–25. <strong>PM CARES:</strong> essentially every large public-sector
          undertaking contributed in 2020. <strong>CSR spending:</strong> legally compulsory for every
          qualifying company under s.135 of the Companies Act.
        </p>
        <p>
          Connect tender winners to those three and you get a dense, alarming-looking web.{' '}
          <strong>A graph that cannot come out clean is not measuring anything.</strong>
        </p>
      </Callout>

      <StatGrid
        items={[
          { value: '82.5%', label: 'ruling-party share of electoral-trust money, FY2024–25', tone: 'muted' },
          { value: '38/38', label: 'PSUs that responded to RTI and had given to PM CARES', tone: 'muted' },
          { value: '110/134', label: 'FCI silo contracts held by two companies — where the rate finally drops', tone: 'accent' },
          { value: '0', label: 'cases, charges or findings against the minister personally', tone: 'sage' },
        ]}
      />

      <Section
        title="What each edge is actually worth"
        note="Hatched grey = what you would expect by default. Solid = the portion that discriminates."
      >
        <div className="border-t border-border-light">
          {BASE_RATES.filter((b) => b.id !== 'br-shared-state').map((b) => (
            <div key={b.id} className="py-6 border-b border-border">
              <p className="font-medium text-[16px] mb-1.5">“{b.claim}”</p>
              <p className="text-[14.5px] text-text-muted leading-relaxed max-w-[70ch] mb-4">{b.reading}</p>
              <Bar rate={b.rate} disc={b.discrimination} />
              <div className="flex flex-wrap gap-x-6 gap-y-1 mt-3 font-mono text-[10.5px]">
                <span className={TEXT_COLOR[b.discrimination]}>
                  Discriminating power: {DISCRIMINATION_META[b.discrimination].label.toLowerCase()}
                </span>
                <span className="text-text-muted">
                  {b.numerator != null && b.denominator != null
                    ? `${b.numerator.toLocaleString('en-IN')} of ${b.denominator.toLocaleString('en-IN')} — ${b.denominatorLabel}`
                    : b.denominatorLabel}
                </span>
                <span className="text-text-muted">{b.period}</span>
              </div>
              <Cite srcs={b.srcs} />
            </div>
          ))}

          {/* The live one — measured from loaded data, never asserted */}
          <div className="py-6 border-b border-border">
            <p className="font-medium text-[16px] mb-1.5">
              “This company is headquartered in the same state as the minister who decided its case.”
            </p>
            <p className="text-[14.5px] text-text-muted leading-relaxed max-w-[70ch] mb-4">
              Computed live from the loaded company dataset rather than asserted. Maharashtra alone carries
              a large plurality of listed corporate headquarters, so co-location with any Maharashtra-seated
              minister is close to expected.
            </p>
            {shared ? (
              <>
                <Bar rate={shared.rate} disc={classify(shared.rate)} />
                <p className="font-mono text-[10.5px] text-text-muted mt-3">
                  Live figure: {shared.numerator} of {shared.denominator} loaded companies are
                  Maharashtra-registered — {(shared.rate * 100).toFixed(1)}%. Discriminating power:{' '}
                  {DISCRIMINATION_META[shared.discrimination].label.toLowerCase()}. Recomputed on every load.
                </p>
              </>
            ) : (
              <p className="font-mono text-[11px] text-text-muted">
                Company dataset not loaded — no figure asserted.
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section title="The tender ledger" note="Teal tag = awarded while the minister held the relevant portfolio">
        <DataTable
          columns={['Winner', 'What', 'When', "Whose ministry"]}
          rows={TENDER_LEDGER.map((r) => [
            <strong key={r[0] as string} className="text-text">
              {r[0]}
            </strong>,
            r[1],
            <span key="w" className="font-mono text-[11.5px] whitespace-nowrap">
              {r[2]}
            </span>,
            <span
              key="m"
              className={`font-mono text-[9.5px] uppercase tracking-[0.09em] px-1.5 py-0.5 border rounded whitespace-nowrap ${
                r[3] ? 'text-teal border-teal/50' : 'text-text-muted border-border-light'
              }`}
            >
              {r[3] ? 'in tenure' : 'different minister'}
            </span>,
          ])}
        />
      </Section>

      <Section title="Where the evidence is actually strong" note="The shape of edge that carries information">
        <Callout label="FCI silos — the anti-monopoly clause that was removed" tone="warn">
          <p>
            FCI's "Hub and Spoke" silo programme is worth roughly ₹20,000 crore, and FCI itself proposed an
            anti-monopoly clause to stop one company cornering it. At a 2022 meeting, NITI Aayog and the
            Department of Economic Affairs opposed the restriction, arguing for market forces. The clause
            was dropped; the appraisal committee also recorded that qualification would rest on financial
            capacity alone, with no reverse auction.
          </p>
          <p>
            Across both phases, two companies hold <strong>110 of 134 contracts</strong> worth over ₹16,500
            crore, storing roughly 46.5 of 60 lakh metric tonnes. This is a specific, documented,
            discretionary act with an identifiable beneficiary and a counterfactual — which is what
            distinguishes it from every near-universal edge above.
          </p>
          <p>
            <strong>FCI's answer</strong>, recorded here as prominently as the claim: one group won in
            Phase 1 but nothing in Phase 2, other bidders succeeded in later rounds, tenders were widely
            publicised, and restricting participation in a growth sector would have reduced competition
            rather than increased it.
          </p>
        </Callout>

        <Callout label="The falsifier — who the second beneficiary actually is" tone="good">
          <p>
            If the theory is domestic crony capture, the second-largest beneficiary should look like a
            politically-connected Indian conglomerate. It does not. Leap India Food & Logistics was founded
            in Coimbatore in 2016, and its capital comes substantially from{' '}
            <strong>Western development finance institutions</strong> — British International Investment
            (the UK government's DFI), the US International Development Finance Corporation, Denmark's IFU,
            and the FCDO/SBI-backed Neev Fund, alongside Indian banks.
          </p>
          <p>
            That does not resolve the concentration concern — a duopoly is a duopoly regardless of who funds
            each half. But it is a real strike against the simplest version of the story, and an honest
            analysis has to carry it.
          </p>
        </Callout>
      </Section>

      <Section title="What would count as real evidence" note="The open, computable tests">
        <Prose>
          <ul className="space-y-3 list-none pl-0">
            {[
              ['A donation pattern that beats the base rate', 'Not "winner X donated to the ruling party" — 82% of donors did. You need tender winners donating at rates or volumes materially above comparable non-winners. That requires the full award list and the full donor list, matched, with a control group. Nobody has published it. It is doable.'],
              ['Timing tighter than volume explains', 'Large groups donate continuously and win contracts continuously, so near-coincidences are guaranteed. The test is whether the gaps cluster tighter than a shuffled control would produce.'],
              ['Coal India and mining-PSU CSR destinations, 2019–24', 'The direct analogue of the ONGC finding, inside the ministry that actually matters here. Public reports. Nobody has run it.'],
              ['File notings', 'Who signed the lone-bidder rule change and the Singrauli reversal. RTI or a leak.'],
              ['The 2022 PPPAC minutes', 'Recording who argued to drop the FCI anti-monopoly clause, and on what basis.'],
            ].map(([t, b]) => (
              <li key={t} className="border-l-2 border-border-light pl-4">
                <strong className="text-text block mb-1">{t}</strong>
                <span className="text-[15px]">{b}</span>
              </li>
            ))}
          </ul>
        </Prose>
      </Section>

      <Footnote>
        <p>
          <strong>Method note.</strong> Every figure above is from a published source: ECI contribution
          reports as analysed by ADR, Scroll and The Wire; Indian Express RTI reporting on PM CARES; ONGC
          CSR annual reports as analysed by The News Minute, with the counter-analysis carried alongside;
          Newslaundry and The News Minute on the FCI silo programme, with FCI's rebuttal; The Reporters'
          Collective on coal. The single live figure on this page is computed from the platform's own
          company dataset and is labelled as such.
        </p>
        <p>
          <strong>Standing.</strong> Nothing here asserts that any named person has committed an offence.
          Allegations are identified as allegations, attributed, and paired with the response of those they
          concern.
        </p>
      </Footnote>
    </article>
  );
}
