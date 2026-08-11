import { useState } from 'react';
import {
  Kicker, PageTitle, Standfirst, Byline, Section, Prose, Lead, Callout,
  StatGrid, DataTable, Cite, Footnote,
} from '../components/Editorial';

/**
 * Pattern Discipline.
 *
 * The methodological spine of the platform. Sourced from the research dossier at
 * research/raw/pattern-matching-epistemics.md — every citation there was checked
 * against a primary or authoritative secondary source.
 *
 * Editorial note: the colloquial framing this page answers to is "schizophrenic
 * pattern matching". That phrase is a category error and is stigmatising, and the
 * page says so in its first section rather than adopting it. The accurate terms
 * are apophenia, illusory pattern perception, and aberrant salience — none of
 * which imply mental illness.
 */

const TRAPS = [
  {
    trap: 'Base-rate neglect',
    why: 'The link looks damning until you learn that most comparable entities have it too. Judgment follows resemblance to a stereotype, not prior probability.',
    fix: 'Compute the rate among comparables. Present as a natural frequency with an explicit denominator drawn from the same register.',
    impl: 'Every edge type carries a population-wide rate. The UI refuses to render a numerator alone.',
    lit: 'Kahneman & Tversky 1973; Bar-Hillel 1980; Gigerenzer & Hoffrage 1995',
  },
  {
    trap: 'Illusory correlation',
    why: 'Rare-plus-rare co-occurrences are doubly distinctive, so they are better encoded and more accessible — producing a felt association where the true correlation is zero.',
    fix: 'Build the full 2×2 table, including the cells you never noticed. Count the conjunction among entities you are not investigating.',
    impl: 'Contingency view: for any pair of attributes, all four cells rendered, not just the top-left.',
    lit: 'Chapman & Chapman 1967; Hamilton & Gifford 1976',
  },
  {
    trap: 'Conjunction fallacy',
    why: 'Each named participant and causal link you add makes the story more representative and strictly less probable. Confidence rises as probability falls.',
    fix: 'Decompose the narrative into conjuncts and price each separately. If the story got better when you added detail, you are in the failure mode.',
    impl: 'Motif claims are stated as the minimum number of conjuncts that carry the finding.',
    lit: 'Tversky & Kahneman 1983',
  },
  {
    trap: 'Clustering illusion',
    why: 'Humans systematically underestimate how clumpy random sequences are, so genuine noise reads as design.',
    fix: 'Compare against a shuffled control, never against intuition about what randomness should look like.',
    impl: 'Timing claims tested against date-shuffled controls holding donation volume fixed.',
    lit: 'Gilovich, Vallone & Tversky 1985 (basketball claim contested post-2015; the psychological claim survives)',
  },
  {
    trap: 'Coincidence at scale',
    why: 'The count that matters is opportunities for a match, not entities. A graph of 100,000 nodes has ~5 billion pairs; any shared-attribute test returns a large absolute number of hits at vanishing per-pair probability.',
    fix: 'Report hits relative to the expected count under a null model. The absolute count carries almost no information.',
    impl: 'Motif counts are z-scores against a degree-preserving ensemble, not raw tallies.',
    lit: 'Diaconis & Mosteller 1989; Graham & Spencer 1990',
  },
  {
    trap: 'Garden of forking paths',
    why: 'You do not need to run many tests to have a multiple-comparisons problem. It is enough that the analysis you would have run depends on the data you saw.',
    fix: 'Pre-register the query. Declare the comparison family size before looking. Apply Benjamini–Hochberg FDR.',
    impl: 'Saved queries record what was asked, when, and how many alternatives were live at the time.',
    lit: 'Gelman & Loken 2014; Simmons, Nelson & Simonsohn 2011; Benjamini & Hochberg 1995',
  },
  {
    trap: 'Hub artefact',
    why: 'Hubs are compulsory in preferential-attachment networks. A high-degree node looks central because it is large, not because it is coordinating anything.',
    fix: 'Degree-preserving null model. Score the structure, do not count it.',
    impl: 'Maslov–Sneppen double-edge swap, ≥1000 rewirings, predicate-preserving.',
    lit: 'Barabási & Albert 1999; Maslov & Sneppen 2002; Milo et al. 2002',
  },
  {
    trap: 'Small-world artefact',
    why: 'Short paths between any two large entities are the norm. "Only three hops from the minister" describes the network, not the relationship.',
    fix: 'Publish the path-length distribution, not the single short path you found.',
    impl: 'Path finder reports the median separation across the graph alongside any specific path.',
    lit: 'Watts & Strogatz 1998; Travers & Milgram 1969',
  },
  {
    trap: 'Entity-resolution failure',
    why: 'Name matching fuses unrelated people into one apparent network. Common Indian surnames make this the dominant error mode at scale.',
    fix: 'Require DIN, constituency, office with dates, or DOB. Keep "possible link" as a distinct state — never silently resolve it.',
    impl: 'Nodes with resolved:false take no edges. CI fails if one does.',
    lit: 'Fellegi & Sunter 1969',
  },
  {
    trap: 'Simpson’s paradox / ecological fallacy',
    why: 'A state-level correlation is not a company-level claim, and never a person-level one. Aggregation can reverse a relationship entirely.',
    fix: 'Analyse at the level you intend to claim at. Check subgroup consistency before aggregating.',
    impl: 'State views are labelled as state-level and do not export person-level conclusions.',
    lit: 'Simpson 1951; Robinson 1950',
  },
];

const REAL_CONSPIRACIES = [
  ['MKUltra', 'CIA human-experimentation programme, 1953–73', 'Surfaced by the Church Committee and 1977 Senate hearings after most records were destroyed'],
  ['Watergate', 'Break-in, cover-up and obstruction, 1972–74', 'Ervin Committee report; tapes compelled by United States v. Nixon'],
  ['Tuskegee syphilis study', 'US Public Health Service, 1932–72', 'Ended after press exposure; documented by the CDC'],
  ['LIBOR rigging', 'Coordinated benchmark manipulation across banks', 'CFTC and FCA enforcement orders, built on chat logs'],
  ['VW defeat device', 'Emissions software designed to detect testing', 'EPA Notice of Violation, 2015'],
];

const CHECKLIST = [
  ['Before you look', 'Write the hypothesis, specific enough to be wrong.'],
  ['Before you look', 'Write the falsifier: what evidence would you accept as disproof?'],
  ['Before you look', 'Fix the reference class. Which entities are the comparison set, and why that set?'],
  ['Before you look', 'Declare the comparison family. How many pairs, paths or windows will you scan?'],
  ['While you look', 'Run the date test first — does the event fall inside the tenure window?'],
  ['While you look', 'Run the identity test — DIN, constituency, office, DOB. Name match is never enough.'],
  ['While you look', 'Count the denominator every time you count a numerator.'],
  ['While you look', 'Build the full 2×2, including the cells that did not catch your eye.'],
  ['Before publishing', 'Score motifs against a degree-preserving null model, not against intuition.'],
  ['Before publishing', 'Apply FDR correction across the declared family; report raw and corrected counts.'],
  ['Before publishing', 'Run the symmetry check on a control set you have no theory about.'],
  ['Before publishing', 'Write the innocent reading — the boring explanation that also fits.'],
  ['Before publishing', 'Find and record the denial. If nobody was asked, say so.'],
  ['Before publishing', 'Assign a tier, and state the upgrade and kill conditions.'],
  ['Before publishing', 'Render absence as loudly as presence.'],
];

export default function Patterns() {
  const [openTrap, setOpenTrap] = useState<string | null>(null);

  return (
    <article className="pb-20">
      <header className="pt-2 pb-6 border-b-2 border-border-light">
        <Kicker>Method · the discipline this platform is built on</Kicker>
        <PageTitle>Why every large network looks like a conspiracy</PageTitle>
        <Standfirst>
          Build a graph of companies, directors, addresses, donations and contracts, then go looking for
          suspicious structure, and you will find it. Not because the structure is there, but because
          large relational datasets contain enormous quantities of genuinely meaningless structure that
          will satisfy almost any pattern you decide on after the fact. This page is the procedure that
          separates a finding from a coincidence.
        </Standfirst>
        <Byline>
          Research dossier · literature review · every citation checked against a primary or authoritative
          secondary source · unverified items listed and not asserted
        </Byline>
      </header>

      <Callout label="Naming this correctly, first" tone="warn">
        <p>
          The colloquial phrase for what this page addresses is <em>"schizophrenic pattern matching."</em>{' '}
          That phrase is wrong twice over, and a platform that publishes allegations about real people
          cannot afford to be careless about a clinical diagnosis.
        </p>
        <p>
          <strong>Schizophrenia is a serious psychiatric condition.</strong> Conspiracy-shaped reasoning
          about corporate networks is overwhelmingly not psychosis, is not a symptom of psychosis, and
          does not indicate that the reasoner has any psychiatric condition at all. Using "schizophrenic"
          as a metaphor for "over-connecting" imports a diagnosis into a description of ordinary
          cognition, and misrepresents the lived experience of people with psychotic disorders — who are,
          statistically, far more likely to be victims than perpetrators of harm.
        </p>
        <p>
          The accurate terms are <strong>apophenia</strong>, <strong>illusory pattern perception</strong>,
          and <strong>aberrant salience</strong>. None of them implies mental illness. Over-connection is
          a property of <em>the task and the data</em> — weak priors, unconstrained search, absent
          denominators — not a property of the analyst. All three are fixable with procedure, which is
          what the rest of this page is.
        </p>
      </Callout>

      <StatGrid
        items={[
          { value: '5×10⁹', label: 'pairs in a 100,000-node graph. The count that matters is opportunities for a match, not entities.', tone: 'accent' },
          { value: 'r ≈ .98', label: 'correlation between judged similarity-to-stereotype and predicted likelihood, with base rates essentially ignored (Kahneman & Tversky 1973)', tone: 'rose' },
          { value: '0', label: 'true correlation in the Chapman drawings — which trained clinicians nonetheless reliably "observed"', tone: 'rose' },
          { value: '5', label: 'documented, adjudicated conspiracies listed below. The corrective is calibration, not dismissal.', tone: 'sage' },
        ]}
      />

      <Section
        title="1. Apophenia, precisely"
        note="What the clinical construct actually says, and what it does not"
      >
        <Prose>
          <Lead>
            The term <em>Apophänie</em> was coined by the German neurologist and psychiatrist Klaus Conrad
            in his 1958 monograph <em>Die beginnende Schizophrenie</em>. His definition, in the standard
            English rendering, is the <strong>"unmotivated seeing of connections"</strong> accompanied by a{' '}
            <strong>"specific feeling of abnormal meaningfulness."</strong>
          </Lead>
          <p>
            Two things in that definition are routinely lost. <strong>"Unmotivated"</strong> does not mean
            "unjustified by evidence" — it means the connection arrives <em>without a search process that
            would explain it</em>, presenting itself as already-known rather than as concluded. And{' '}
            <strong>the affective component is constitutive, not incidental</strong>: the construct is not
            "seeing a pattern," it is seeing a pattern <em>and experiencing it as charged with significance
            directed at oneself</em>. Clinical apophenia is a disorder of salience and self-reference, not
            of inference.
          </p>
          <p>
            The research literature places pattern over-detection on a continuum through the general
            population. Bell, Halligan and Ellis (2006) set out the cognitive-neuropsychiatry position
            that delusions represent a breakdown in <em>normal</em> belief formation, distributed
            continuously rather than categorically. Kapur (2003) locates psychosis in a dysregulated
            salience-tagging system, with delusion as the <em>cognitive effort to explain</em> anomalous
            salience — which is why the reasoning that follows is often locally coherent. Blain and
            colleagues (2020) develop apophenia as a measurable normal-range disposition toward false
            positives: in signal-detection terms, a liberal criterion for "there is something there."
          </p>
          <p>
            One situational finding matters for workflow. Whitson and Galinsky (2008) showed
            experimentally that <strong>lacking control increases illusory pattern perception</strong> —
            participants primed with lack of control saw more images in noise, formed more illusory
            correlations in stock-market information, and perceived more conspiracies. Self-affirmation
            reduced the effect. Pattern over-detection therefore spikes exactly when an investigation
            feels stalled, threatened or adversarial — which is precisely when the cost of publishing a
            false claim is highest.
          </p>
        </Prose>
        <Cite
          srcs={[
            ['Bell, Halligan & Ellis 2006, Trends Cogn Sci', 'https://doi.org/10.1016/j.tics.2006.03.004'],
            ['Kapur 2003, Am J Psychiatry', 'https://doi.org/10.1176/appi.ajp.160.1.13'],
            ['Blain et al. 2020, J Abnorm Psychol', 'https://pubmed.ncbi.nlm.nih.gov/32212749/'],
            ['Whitson & Galinsky 2008, Science', 'https://doi.org/10.1126/science.1159845'],
          ]}
        />
      </Section>

      <Section
        title="2. Why the brain is built to over-connect"
        note="Patternicity, agenticity, and the asymmetric cost of error"
      >
        <Prose>
          <p>
            Michael Shermer's pair of terms names the two-step that drives conspiracy cognition:{' '}
            <strong>patternicity</strong>, the tendency to find meaningful patterns in meaningless noise,
            followed by <strong>agenticity</strong>, the tendency to infuse those patterns with
            intention and agency. First a structure is detected; then an agent is posited behind it.
          </p>
          <p>
            The formal argument for why this is adaptive rather than defective comes from Foster and
            Kokko (2009), who model when selection favours assigning causality between two events and
            derive an inequality showing that{' '}
            <strong>
              selection can favour strategies producing frequent errors of assessment, provided the
              occasional correct response carries a large fitness benefit
            </strong>
            . Mistaking wind for a predator is cheap. Mistaking a predator for wind is not.
          </p>
          <Callout label="The inversion that matters here" tone="warn">
            <p>
              The asymmetric-cost logic that makes false positives adaptive in a predator environment is{' '}
              <strong>exactly inverted in publishing</strong>. A false positive in an investigative
              dossier is expensive — legally, reputationally, and to the credibility of the true findings
              sitting next to it. The evolved default is miscalibrated for this task and has to be
              overridden by procedure rather than by care.
            </p>
          </Callout>
        </Prose>
        <Cite
          srcs={[
            ['Shermer, "Patternicity", Scientific American 2008', 'https://www.scientificamerican.com/article/patternicity-finding-meaningful-patterns/'],
            ['Foster & Kokko 2009, Proc R Soc B', 'https://doi.org/10.1098/rspb.2008.0981'],
            ['Barrett 2000, Trends Cogn Sci', 'https://pubmed.ncbi.nlm.nih.gov/10637620/'],
          ]}
        />
      </Section>

      <Section
        title="3. The single most transferable experiment"
        note="Chapman & Chapman 1967 — experts perceiving a correlation that is exactly zero"
      >
        <Prose>
          <p>
            Naïve undergraduates were shown Draw-A-Person test drawings randomly paired with contrived
            symptom statements. They "rediscovered" the same drawing-to-symptom relationships that
            practising clinicians reported seeing —{' '}
            <strong>relationships that were absent from the materials by construction</strong>. Reported
            associations tracked the <em>semantic associative strength</em> between symptom and drawing
            feature, not co-occurrence. The bias persisted under repeated exposure and under conditions
            designed to maximise both motivation and opportunity for accurate observation.
          </p>
          <p>
            This is a controlled demonstration that expert practitioners, working carefully on
            real-looking data, reliably perceive a correlation of exactly zero — because the two things{' '}
            <em>sound like</em> they go together. Hamilton and Gifford (1976) identified the mechanism:
            when a rare group co-occurs with a rare behaviour, the conjunction is doubly distinctive,
            hence better attended and more accessible at recall.
          </p>
          <p>
            <strong>The graph translation:</strong> the rare-rare conjunction here is the shell company in
            a small jurisdiction sharing a nominee with a politically exposed person. Both elements are
            individually rare and individually memorable. The distinctiveness effect predicts you will
            over-weight the co-occurrence <em>even if nominee-sharing is uniformly distributed across the
            register</em>. The corrective is mechanical: compute how often that conjunction occurs among
            entities you are not investigating.
          </p>
        </Prose>
        <Cite
          srcs={[
            ['Chapman & Chapman 1967, J Abnorm Psychol', 'https://doi.org/10.1037/h0024670'],
            ['Hamilton & Gifford 1976, J Exp Soc Psychol', 'https://eric.ed.gov/?id=EJ152890'],
          ]}
        />
      </Section>

      <Section
        title="4. Structure is compulsory above a size threshold"
        note="Ramsey theory and the law of truly large numbers, stated without overreach"
      >
        <Prose>
          <p>
            Ramsey's theorem says that for any integers <em>s</em> and <em>t</em> there exists a finite
            number <em>R(s,t)</em> such that <strong>any</strong> two-colouring of the edges of a complete
            graph on <em>R(s,t)</em> vertices contains a monochromatic clique of size <em>s</em> or one of
            size <em>t</em>.
          </p>
          <Callout label="What Ramsey theory does not say" tone="note">
            <p>
              It does <strong>not</strong> say that any pattern you like appears in any large random
              graph — that is a stronger and false claim, and it is the version that circulates. What it
              says is that <em>specified classes of ordered substructure are forced to exist above a size
              threshold, with no cause needed beyond size</em>.
            </p>
            <p>
              The honest generalisation for network investigation:{' '}
              <strong>
                a tightly interconnected subgroup in a large graph is not by itself evidence of anything.
                Tightly interconnected subgroups are compulsory.
              </strong>
            </p>
          </Callout>
          <p>
            Diaconis and Mosteller (1989) supply the complementary result, the law of truly large
            numbers: with a large enough sample, any outrageous thing is likely to happen. The birthday
            problem is the cheapest intuition pump — in a room of 23 people the probability that{' '}
            <em>some</em> pair shares a birthday exceeds 50%, because there are 253 pairs, not 23. In a
            graph of <em>n</em> nodes there are <em>n(n−1)/2</em> pairs. At 100,000 nodes that is roughly
            five billion. Any shared-attribute test applied across all pairs returns a very large absolute
            number of hits at a vanishingly small per-pair probability.{' '}
            <strong>Only the count relative to a null model carries information.</strong>
          </p>
        </Prose>
        <Cite
          srcs={[
            ['Graham & Spencer, "Ramsey Theory", Scientific American 1990', 'https://www.scientificamerican.com/article/ramsey-theory/'],
            ['Diaconis & Mosteller 1989, JASA', 'https://doi.org/10.1080/01621459.1989.10478847'],
          ]}
        />
      </Section>

      <Section
        title="5. The garden of forking paths"
        note="Why exploratory graph work has a multiple-comparisons problem even when you run one test"
      >
        <Prose>
          <p>
            Gelman and Loken's central insight is that{' '}
            <strong>you do not need to run multiple tests to suffer a multiple-comparisons problem</strong>.
            It is sufficient that the analysis you <em>would have run</em> depends on the data you saw. A
            single test, chosen after inspecting the data, carries the inflated error rate of the entire
            implicit family of tests you might have chosen instead.
          </p>
          <p>
            That is an exact description of exploratory graph work. You load the graph, you look around,
            something catches your eye, you query it. There was no explicit test family — but there was an
            enormous implicit one.
          </p>
          <p>
            Bonferroni correction controls the family-wise error rate but is punishing at the scale of
            graph queries. Benjamini–Hochberg FDR controls the <em>expected proportion of false
            discoveries among the discoveries made</em>, which maps directly onto the editorial question:{' '}
            <em>of the N suspicious things in this dossier, roughly how many should I expect to be
            nothing?</em> An answer of "about 2 of 30" is publishable with caveats. An answer of "about 25
            of 30" is not a dossier — it is a query log.
          </p>
        </Prose>
        <Cite
          srcs={[
            ['Gelman & Loken 2014, American Scientist', 'https://www.americanscientist.org/article/the-statistical-crisis-in-science'],
            ['Simmons, Nelson & Simonsohn 2011, Psych Science', 'https://doi.org/10.1177/0956797611417632'],
            ['Benjamini & Hochberg 1995, JRSS-B', 'https://doi.org/10.1111/j.2517-6161.1995.tb02031.x'],
          ]}
        />
      </Section>

      <Section title="6. The ten traps" note="Click a row for the corrective and how it is implemented here">
        <div className="border-t border-border-light">
          {TRAPS.map((t) => {
            const open = openTrap === t.trap;
            return (
              <div key={t.trap} className="border-b border-border">
                <button
                  onClick={() => setOpenTrap(open ? null : t.trap)}
                  aria-expanded={open}
                  className="w-full text-left py-4 flex items-start gap-4 group"
                >
                  <span className="font-mono text-[10px] text-text-muted pt-1.5 w-6 flex-shrink-0">
                    {open ? '−' : '+'}
                  </span>
                  <span className="flex-1">
                    <span className="block font-medium text-[15.5px] group-hover:text-accent transition-colors">
                      {t.trap}
                    </span>
                    <span className="block text-[14px] text-text-muted mt-1 leading-snug max-w-[62ch]">{t.why}</span>
                  </span>
                </button>
                {open && (
                  <div className="pb-5 pl-10 space-y-3 max-w-[66ch]">
                    <p className="text-[14.5px] text-text-secondary">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-sage mr-2">Corrective</span>
                      {t.fix}
                    </p>
                    <p className="text-[14.5px] text-text-secondary">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-accent mr-2">In this codebase</span>
                      {t.impl}
                    </p>
                    <p className="font-mono text-[10.5px] text-text-muted">{t.lit}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      <Section
        title="7. The counterweight"
        note="An epistemology that rules out coordinated concealment a priori is as broken as one that sees it everywhere"
      >
        <Prose>
          <p>
            None of the above is a reason to dismiss everything. Documented conspiracies exist, and were
            proven by exactly this kind of patient, denominator-aware work.
          </p>
        </Prose>
        <DataTable
          columns={['Case', 'What it was', 'How it was established']}
          rows={REAL_CONSPIRACIES.map((r) => [<strong key={r[0]}>{r[0]}</strong>, r[1], r[2]])}
        />
        <Prose>
          <p>
            The literature on conspiracy belief itself needs the same calibration applied to it. The
            frequently-cited finding that belief in mutually contradictory conspiracies correlates
            positively (Wood, Douglas & Sutton 2012) has been{' '}
            <strong>actively disputed</strong> in more recent work, and this platform does not lean on it.
            What holds more robustly is that conspiratorial ideation clusters around perceived danger and
            threat, reliance on intuition, and antagonism (Bowes, Costello & Tasimi 2023, meta-analysing
            170 studies and 158,473 participants).
          </p>
          <p>
            What separates a real finding from a coincidence is not attitude. It is method: base rates,
            pre-specified falsifiers, null models, denominators, and honest evidence tiering.
          </p>
        </Prose>
        <Cite
          srcs={[
            ['Bowes, Costello & Tasimi 2023, Psychological Bulletin', 'https://pubmed.ncbi.nlm.nih.gov/37358543/'],
            ['Douglas, Sutton & Cichocka 2017, Curr Dir Psychol Sci', 'https://doi.org/10.1177/0963721417718261'],
          ]}
        />
      </Section>

      <Section title="8. The checklist" note="Run this as a literal procedure before publishing any network-derived claim">
        <DataTable
          columns={['Stage', 'Step']}
          rows={CHECKLIST.map(([stage, step]) => [
            <span key={step} className="font-mono text-[10px] uppercase tracking-wider text-text-muted whitespace-nowrap">
              {stage}
            </span>,
            step,
          ])}
        />
        <Callout label="The symmetry check — the one that catches the most" tone="good">
          <p>
            Run the identical analysis on a <strong>control set you have no theory about</strong>: an
            opposition-governed state, a rival conglomerate, an earlier government. If the method produces
            an equally alarming graph there, then the method is generating the finding rather than
            detecting it.
          </p>
          <p>
            This platform ships that check as a feature, not a footnote. Any motif can be re-run against a
            control population from the Base Rates page.
          </p>
        </Callout>
      </Section>

      <Footnote>
        <p>
          <strong>Sourcing.</strong> This page condenses the research dossier at{' '}
          <code>research/raw/pattern-matching-epistemics.md</code>, which carries the full reference list
          with DOIs and an explicit list of items that could not be verified and are therefore not
          asserted here. Where a cited finding is contested in the current literature — the basketball
          hot-hand result, and the contradictory-conspiracies correlation — the contest is stated rather
          than smoothed over.
        </p>
        <p>
          <strong>Standing.</strong> This is a methodological page. It makes no claim about any named
          person or company. It exists to constrain what the rest of the platform is permitted to claim.
        </p>
      </Footnote>
    </article>
  );
}
