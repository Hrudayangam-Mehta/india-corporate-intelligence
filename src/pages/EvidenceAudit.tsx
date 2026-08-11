import {
  Kicker, PageTitle, Standfirst, Byline, Section, Prose, Callout,
  TierChip, TierLegend, DataTable, Footnote,
} from '../components/Editorial';
import type { Tier } from '../graph/schema';

/**
 * Evidence Audit — the worked example of the tiering procedure.
 *
 * Not an accusation document. Everything here concerns published allegations about
 * the conduct of public offices, and is a matter of legitimate public interest.
 * Nothing asserts that any named person has committed an offence. Allegations are
 * identified as allegations, attributed, and paired with denials.
 */

interface TimelineItem {
  date: string;
  inTenure: boolean;
  chip: string;
  title: string;
  body: string;
}

const TIMELINE: TimelineItem[] = [
  {
    date: 'Dec 2014 – Feb 2015',
    inTenure: false,
    chip: 'Outside tenure',
    title: 'Sarisatolli coal block; state utility disqualified',
    body: "India's first coal auctions. CAG Report 20/2016 found West Bengal's state utility was disqualified contrary to existing provisions. Later reporting found three of five bidders belonged to one industrial group, one a shell firm acquired days before. The Coal portfolio changed hands in 2019 — four years later. This cannot attach to the later minister.",
  },
  {
    date: 'Jun–Nov 2020',
    inTenure: true,
    chip: 'In tenure',
    title: 'Commercial coal mining launched; first auction',
    body: '41 blocks offered. Of 38 mines put up, 15 drew no technical bids. Winners included Vedanta (largest mine, 6 MTPA), Hindalco, Jindal Power, EMIL Mines (Radhikapur East, 16.75% revenue share) and Aurobindo Realty & Infrastructure, which took two blocks including Urma Paharitola at 26.5%.',
  },
  {
    date: '2020–21',
    inTenure: true,
    chip: 'In tenure',
    title: 'Chhattisgarh alleges auction undervaluation',
    body: 'A state minister alleged the 2020 revenue-share auctions yielded less than 2015 rates. The Coal Ministry answered in the Rajya Sabha defending the revenue-share model as structurally different and not directly comparable. An allegation of policy failure, not of bribery.',
  },
  {
    date: 'Nov 2021 → Mar 2023',
    inTenure: true,
    chip: 'In tenure',
    title: 'Coal Ministry overrides Environment Ministry on Singrauli forest blocks',
    body: 'An industry lobby whose members include several large conglomerates wrote to the Coal Ministry in November 2021 asking that two blocks in some of India\'s densest forest be auctioned. The Ministry\'s 2018 decision to keep them off auction was reversed on 29 March 2023, documented from ministry records. This is the strongest documented item in the file.',
  },
  {
    date: 'Aug 2022',
    inTenure: true,
    chip: 'In tenure',
    title: 'Sole bidder declared winner of a 250 Mt block',
    body: 'The auction failed for want of competition, but rules had been changed to let the government allot blocks to lone bidders at its discretion. Twelve private companies have benefited from this route.',
  },
  {
    date: 'Oct 2022 / Mar 2021',
    inTenure: true,
    chip: 'In tenure',
    title: 'Electoral bond purchases near mine awards',
    body: 'An opposition spokesperson alleged one group bought ₹25 crore of bonds on 7 October 2022 and won a block on 10 October; and that another won a block in March 2021 and bought ₹25 crore of bonds the following month. These are timing correlations. The donations went to a party, not to a minister, and the scheme\'s design made donor-to-decision tracing deliberately impossible.',
  },
  {
    date: 'Jan 2024',
    inTenure: false,
    chip: 'Outside tenure',
    title: 'FCI bribery raids — ₹3 crore seized',
    body: 'Four officials arrested; cash, gold and a bribe ledger recovered. Frequently attached to the current Food minister because he now holds the portfolio. He took that ministry in June 2024, five months later. It was a different minister\'s at the time.',
  },
  {
    date: 'Oct 2024',
    inTenure: false,
    chip: 'Not an accused',
    title: 'FIR against relatives',
    body: 'Police booked three relatives over an alleged ₹2.5 crore taken on a promise of a party ticket. The minister is not named as an accused; he states he has been estranged from the principal accused for over three decades and obtained a 2013 civil court injunction against use of his name. Nothing has been tested in court.',
  },
  {
    date: 'Aug–Oct 2019',
    inTenure: false,
    chip: 'Outside tenure',
    title: 'Solar tender greenshoe clause',
    body: 'A 2026 competition-regulator order records that the contested clause was directed in letters of 14 August and 9 October 2019, approved by the then Minister for Power and New & Renewable Energy. The renewable-energy portfolio changed hands in 2024. The regulator dismissed the complaint, finding no prima facie bid rigging or abuse of dominance.',
  },
  {
    date: 'Nov 2024',
    inTenure: false,
    chip: 'Different jurisdiction',
    title: 'US indictment of conglomerate executives',
    body: 'Alleges bribes to Indian officials over solar supply agreements. The named state is Andhra Pradesh, and the official identified as meeting the group chairman was then a state Chief Minister. No Union minister is named as a recipient. The group denies all allegations.',
  },
];

const LADDER: { tier: Tier; title: string; body: string; src?: string }[] = [
  {
    tier: 'documented',
    title: 'The Coal Ministry reversed its own forest-protection decision after industry lobbying',
    body: 'Ministry records show the sequence: a 2018 decision to keep dense Singrauli blocks off auction, a November 2021 lobby letter, a 29 March 2023 reversal, and a lobby member emerging as sole bidder on one block. The Environment Ministry\'s objections were overridden.',
    src: 'The Reporters\' Collective, from obtained ministry documents',
  },
  {
    tier: 'documented',
    title: 'Rules were changed to allow discretionary allotment when auctions fail',
    body: 'Where only one bidder appears and the auction is annulled, the government gave itself power to allot anyway. Twelve private firms have benefited. This is a material departure from the competitive-auction principle used to attack the previous government\'s allocations.',
    src: 'The Reporters\' Collective, "Coal Reform Overturned"',
  },
  {
    tier: 'documented',
    title: 'The government was warned its new coal regime "will lead to scams" — from within',
    body: 'The warnings came from two figures who later became Union ministers. Separately, the PMO in 2020 called mine-developer-operator contracts "inappropriate," yet one group was allowed to revive such deals while competitors were not.',
    src: 'The Reporters\' Collective, #CoalFiles',
  },
  {
    tier: 'reported',
    title: 'The 2020 revenue-share auctions undervalued national assets',
    body: 'A state government said yes; the Coal Ministry said the revenue-share model is structurally different from the 2015 premium model and not directly comparable. Both positions are arguable. No audit finding has settled it.',
  },
  {
    tier: 'alleged',
    title: 'Electoral bond purchases were quid pro quo for mine awards',
    body: 'The timing correlations are real and were placed on record. But the scheme was engineered so that donor-to-decision causation could not be established, which cuts both ways: it neither proves nor refutes the charge. The Supreme Court struck the scheme down as unconstitutional partly for exactly this reason.',
  },
  {
    tier: 'analytic',
    title: 'The minister personally directed decisions to benefit specific corporates',
    body: 'Plausible on the face of the pattern — he was the minister — but no document in the public record shows his hand on any of these files. The investigations that obtained the internal correspondence do not name him as the decision-maker or allege he benefited. That silence in a well-sourced investigation is itself evidence.',
  },
];

const FALSIFICATION: { theory: string; test: string; result: 'Survives' | 'Collapses' | 'Not established' }[] = [
  {
    theory: 'The coal ministry shaped rules to favour a particular conglomerate',
    test: 'If the rule changes had preceded the lobbying, or if the beneficiaries were broadly distributed across unrelated firms. Neither holds: the lobby letter precedes the reversal, and the sole-bidder route\'s most conspicuous beneficiary was a lobby member. Twelve firms benefited, which weakens but does not eliminate the concentration argument.',
    result: 'Survives',
  },
  {
    theory: 'The minister personally profited from coal decisions',
    test: 'Any asset jump, benami trail, shell company, enforcement lookthrough, or named document. None exists in the public record. His affidavit discloses no criminal cases. Investigative outlets holding the internal files did not allege it.',
    result: 'Collapses',
  },
  {
    theory: 'Bond purchases near mine awards prove bribery',
    test: 'Base rate. Large industrial groups bought bonds continuously and won government contracts continuously; with enough of both, near-coincidences are guaranteed. To beat coincidence you need awards clustered on donors beyond what volume alone predicts — and nobody has published that analysis. Also: the money went to a party, not a minister.',
    result: 'Not established',
  },
  {
    theory: "The FCI bribery case reflects on the current minister's stewardship",
    test: 'The dates. The raids were January 2024; he took the ministry in June 2024. Falsified outright.',
    result: 'Collapses',
  },
  {
    theory: 'The solar tender was rigged under his renewable-energy watch',
    test: 'The dates again. The contested clause was directed in 2019 under a different minister, and the competition regulator dismissed the complaint in April 2026 for want of a prima facie case.',
    result: 'Collapses',
  },
  {
    theory: 'The 2014–15 coal-auction bid rigging belongs in his file',
    test: 'The dates a third time. 2014–15, four years before he took the portfolio.',
    result: 'Collapses',
  },
  {
    theory: 'The family FIR proves a ticket-selling operation run through him',
    test: "Being named as an accused, a summons, a money trail to him, or a witness placing him in a transaction. None present. The complaint's own theory is that his name was invoked.",
    result: 'Collapses',
  },
];

const RESULT_CLASS = {
  Survives: 'text-sage',
  Collapses: 'text-rose',
  'Not established': 'text-amber',
};

export default function EvidenceAudit() {
  const collapsed = FALSIFICATION.filter((f) => f.result === 'Collapses').length;

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Evidence audit · not an accusation document</Kicker>
        <PageTitle>What is actually documented — and what isn't</PageTitle>
        <Standfirst>
          A calibrated review of corruption allegations touching one Union minister and the ministries he
          has held, sorted by how well each claim is evidenced. Several widely-circulated links fail on
          dates alone. This page is the worked example of the tiering procedure the whole platform runs on.
        </Standfirst>
        <Byline>
          Sources: election affidavits · CAG reports · The Reporters' Collective · competition-regulator
          orders · court and FIR reporting · mainstream press
        </Byline>
      </header>

      <Callout label="Bottom line" tone="bottomline">
        <p>
          <strong>
            There is no conviction, no charge, no FIR and no enforcement case against the minister
            personally.
          </strong>{' '}
          His 2024 Lok Sabha affidavit declares zero criminal cases. No court has made an adverse finding
          against him.
        </p>
        <p>
          <strong>There is a real, documented accountability story</strong> — but it is about{' '}
          <em>decisions taken by the Ministry of Coal</em> between 2019 and 2024, established mainly
          through documents obtained by investigative reporters. That reporting alleges policy capture
          favouring particular corporates. It does not allege personal enrichment, and does not claim to
          have found any.
        </p>
        <p>
          <strong>The gap between those two paragraphs is the whole analytical problem.</strong> A
          minister is politically accountable for his ministry's decisions. That is not the same as being
          personally corrupt, and the evidence for one does not transfer to the other.
        </p>
      </Callout>

      <Section title="The tier ladder" note="Every claim on this platform sits on one of four rungs">
        <TierLegend />
      </Section>

      <Section
        title="Timeline test — which events fall inside his tenure?"
        note="Dates are the single most useful analytical tool here. Most bad inference comes from attaching an event to the wrong chair."
      >
        <div className="border-t border-border-light">
          {TIMELINE.map((t) => (
            <div key={t.title} className="grid grid-cols-[5.5rem_1.25rem_1fr] gap-x-3 py-4 border-b border-border">
              <div className={`font-mono text-[10.5px] pt-1 ${t.inTenure ? 'text-text-secondary' : 'text-text-muted'}`}>
                {t.date}
              </div>
              <div className="relative">
                <div
                  className="absolute left-1.5 -top-4 -bottom-4 w-2 border-x border-border"
                  style={
                    t.inTenure
                      ? { background: 'var(--color-sage)' }
                      : {
                          background:
                            'repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(232,228,220,.16) 3px,rgba(232,228,220,.16) 4px)',
                        }
                  }
                />
              </div>
              <div>
                <span
                  className={`inline-block font-mono text-[9.5px] uppercase tracking-[0.11em] px-1.5 py-0.5 border rounded mb-2 ${
                    t.inTenure ? 'text-sage border-sage/50' : 'text-text-muted border-border-light'
                  }`}
                >
                  {t.chip}
                </span>
                <h3 className={`font-medium text-[15.5px] mb-1 ${t.inTenure ? '' : 'text-text-muted'}`}>{t.title}</h3>
                <p className="text-[14.5px] text-text-muted leading-relaxed max-w-[64ch]">{t.body}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="font-mono text-[10.5px] text-text-muted mt-3">
          Solid bar = held the relevant portfolio. Hatched = did not.
        </p>
      </Section>

      <Section title="Evidence calibration" note="Each claim placed on the ladder from documented fact to unsupported inference">
        <div className="border-t border-border-light">
          {LADDER.map((c) => (
            <div key={c.title} className="py-5 border-b border-border">
              <TierChip tier={c.tier} />
              <h3 className="font-medium text-[16px] mt-2.5 mb-1.5 max-w-[64ch]">{c.title}</h3>
              <p className="text-[15px] text-text-secondary leading-relaxed max-w-[68ch]">{c.body}</p>
              {c.src && <p className="font-mono text-[10.5px] text-text-muted mt-2">Source: {c.src}</p>}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Falsification tests" note="Each theory against the evidence that would kill it">
        <DataTable
          columns={['Theory', 'What would falsify it', 'Result']}
          rows={FALSIFICATION.map((f) => [
            <strong key={f.theory} className="text-text">
              {f.theory}
            </strong>,
            f.test,
            <span key="r" className={`font-mono text-[10px] uppercase tracking-[0.1em] whitespace-nowrap ${RESULT_CLASS[f.result]}`}>
              {f.result}
            </span>,
          ])}
        />
        <Callout label={`${collapsed} of ${FALSIFICATION.length} collapse on dates alone`} tone="warn">
          <p>
            That is the most important output of this exercise. When a set of allegations is assembled
            around a <em>person</em> rather than around a <em>timeline</em>, chronology is the first thing
            lost — and it is the cheapest thing to check. It is why the date test runs first in this
            platform's tiering procedure, before identity, before base rates, before anything else.
          </p>
        </Callout>
      </Section>

      <Section title="The name-collision trap" note="The primary defamation risk in any automated pipeline">
        <Prose>
          <p>
            "Joshi" is among the most common surnames in India. Searching it alongside corruption keywords
            returns a stream of unrelated people. Every one of the following appeared in searches for this
            file and has <strong>no connection</strong> to the subject: a former state minister of a
            different party arrested under money-laundering law over a water-mission case; an advertising
            professional arrested in an excise-policy case; a former IAS couple in a separate proceeding; a
            Home Ministry under-secretary in an FCRA case; and — most instructive — the{' '}
            <em>investigating agency's own spokesperson</em>, quoted describing the FCI raids. A search
            engine will happily place that surname next to "₹3 crore recovered."
          </p>
          <Callout label="Why this is architectural, not editorial" tone="warn">
            <p>
              An automated pipeline that scrapes and links on name matches will fuse all of these into one
              person. That is not a network graph. It is a defamation generator.
            </p>
            <p>
              This platform's answer is structural: nodes carry a <code>resolved</code> flag, identity must
              be confirmed by DIN, constituency, office with dates or date of birth, and{' '}
              <strong>an unresolved node may not be an endpoint of any edge</strong>. CI fails the build if
              one is.
            </p>
          </Callout>
        </Prose>
      </Section>

      <Section title="What would change the conclusion" note="The open, checkable actions">
        <DataTable
          columns={['Action', 'Why it moves the needle', 'Shape']}
          rows={[
            [
              'File notings on the March 2023 forest-block reversal and the lone-bidder rule change',
              'Would show whether direction came from ministerial level. This is the single gap between "the ministry did this" and any personal claim.',
              'RTI or leak',
            ],
            [
              'Asset trajectory across the 2004, 2009, 2014, 2019 and 2024 affidavits',
              'A discontinuity around 2020–22 would be worth explaining. Must be read against the cohort mean for re-elected MPs of the same vintage — the prior pass found growth sitting at that peer mean, and retracted it as an indicator.',
              'Public — MyNeta/ADR',
            ],
            [
              'A base-rate study of electoral bonds against every coal and mining award 2019–24',
              'Tests whether proximity exceeds chance. Until someone runs it with a shuffled control, the quid pro quo claim is unproven in both directions.',
              'Computable now',
            ],
            [
              'Coal India and mining-PSU CSR destinations 2019–24',
              'The direct analogue of the ONGC finding, inside the relevant ministry. CSR annual reports are public and nobody has run this. The most answerable open question in the file.',
              'Computable now',
            ],
            [
              'A parliamentary standing committee or CAG performance audit of the commercial auction regime',
              'None has yet reported on the 2019–24 tranches.',
              'Institutional',
            ],
            ['Any regulatory or judicial finding naming him', 'As of now there is none.', 'Watchlist'],
          ]}
        />
      </Section>

      <Footnote>
        <p>
          <strong>Sourcing.</strong> Investigative material is overwhelmingly from The Reporters'
          Collective, a non-profit outlet that publishes its underlying documents, with corroborating and
          contextual reporting from Deccan Herald, The Print, The News Minute, Newslaundry, The Wire,
          Business Standard, Al Jazeera and Adani Watch. Affidavit data from MyNeta/ADR. Regulatory
          findings from the CCI order of 16 April 2026. Audit findings from CAG Report 20/2016.
        </p>
        <p>
          <strong>Standing of this document.</strong> Everything above concerns published allegations about
          the conduct of public offices, and is a matter of legitimate public interest. Nothing here
          asserts that any named person has committed an offence. Where allegations are described they are
          identified as allegations and attributed, and denials are recorded alongside them.
        </p>
      </Footnote>
    </article>
  );
}
