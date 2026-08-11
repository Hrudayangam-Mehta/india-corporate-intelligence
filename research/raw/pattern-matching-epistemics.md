# The Cognitive Science and Epistemology of Conspiracy-Shaped Pattern Matching

*A research dossier on apophenia, illusory correlation, and the specific failure modes that afflict network analysis of corporate and political data.*

**Status:** research note / literature review. Every citation below was checked against a primary or authoritative secondary source; items that could not be confirmed are listed in the **UNVERIFIED** section at the end and are not asserted as fact elsewhere in this document.

---

## Executive summary

Investigative network analysis — building a graph of companies, directors, shareholders, addresses, donations, and contracts, and then looking for "suspicious" structures — sits on top of a well-documented set of cognitive and statistical failure modes. The core problem is not that analysts are gullible. It is that **the human perceptual and inferential system is tuned to over-detect structure**, and that **large relational datasets contain enormous quantities of genuinely meaningless structure** that will satisfy almost any pattern you decide to look for after the fact.

Three findings anchor the whole dossier:

1. **Pattern over-detection is normal, continuous, and non-pathological.** The term *apophenia* comes from clinical psychiatry (Conrad, 1958), but the disposition it names is measurable across the general population and is not equivalent to psychosis. The colloquial phrase "schizophrenic pattern matching" is a category error and is stigmatising; the accurate terms are *apophenia*, *illusory pattern perception*, or *aberrant salience*, and none of them imply mental illness.
2. **Coincidence is cheap at scale.** Ramsey theory shows that structure is mathematically unavoidable in sufficiently large systems (Graham & Spencer, 1990); the law of truly large numbers (Diaconis & Mosteller, 1989) shows that with enough data, outrageous coincidences are *expected*. In a corporate graph with hundreds of thousands of nodes, "these two people share an address and a former auditor" is a base-rate question, not a finding.
3. **The corrective is calibration, not dismissal.** MKUltra, Watergate, Tuskegee, LIBOR, and Volkswagen's defeat device were all real, documented, adjudicated conspiracies. An epistemology that rules out coordinated concealment a priori is as broken as one that sees it everywhere. What separates the two is *method*: base rates, pre-specified falsifiers, null models, denominators, and honest evidence tiering.

The deliverable of this document is the trap table (§10) and the operational checklist (§11), which are intended to be run as a literal procedure before publishing any network-derived claim.

---

## 1. Apophenia: the clinical construct and its popular drift

### 1.1 Origin

The term *Apophänie* was coined by the German neurologist and psychiatrist **Klaus Conrad** in his 1958 monograph *Die beginnende Schizophrenie: Versuch einer Gestaltanalyse des Wahns* ("The Onset of Schizophrenia: An Attempt at a Gestalt Analysis of Delusion"). Conrad's definition, as it is standardly rendered in English, is the **"unmotivated seeing of connections"** accompanied by a **"specific feeling of abnormal meaningfulness."**

Two things in that definition matter and are routinely lost in popular use:

- **"Unmotivated"** does not mean "unjustified by evidence." It means the connection arrives *without a search process that would explain it* — it presents itself as already-known rather than as concluded.
- **The affective component is constitutive, not incidental.** Conrad's construct is not "seeing a pattern." It is "seeing a pattern *and experiencing it as charged with significance directed at oneself*." Apophenia in the clinical sense is a disorder of salience and self-reference, not merely of inference.

Conrad embedded apophenia in a **phase model** of emerging psychosis: an initial *Trema* phase (a diffuse, pre-delusional mood of tension and impending significance), followed by *Apophänie* (the crystallisation of self-referential meaning), with further stages describing the consolidation of a delusional system. (The precise German labels and ordering of the later stages are treated as UNVERIFIED below — I could not access the primary German text.)

**Sources:** [Wikipedia, "Apophenia"](https://en.wikipedia.org/wiki/Apophenia) (which carries the standard English rendering of Conrad's definition and cites the 1958 monograph); [Britannica, "Apophenia"](https://www.britannica.com/topic/apophenia); [Britannica, "Klaus Conrad"](https://www.britannica.com/biography/Klaus-Conrad).

### 1.2 The essential clarification: this is not a claim about mental illness

This section exists because the colloquial framing — "schizophrenic pattern matching" — is both inaccurate and harmful, and a public-facing document must say so plainly.

**Schizophrenia is a serious psychiatric condition affecting roughly a small percentage of the population. Conspiracy-shaped reasoning about corporate networks is overwhelmingly not psychosis, is not a symptom of psychosis, and does not indicate that the reasoner has any psychiatric condition at all.** Using "schizophrenic" as a metaphor for "over-connecting" imports a clinical diagnosis into a description of ordinary cognition, and simultaneously misrepresents the lived experience of people with psychotic disorders — who are, statistically, far more likely to be victims than perpetrators of harm.

The research literature supports the non-pathological reading directly:

- **Continuum models.** Bell, Halligan & Ellis (2006, *Trends in Cognitive Sciences*) set out the cognitive-neuropsychiatry position that delusions represent a breakdown in *normal* belief formation, and that delusional ideation is distributed continuously into the non-clinical population rather than forming a discrete category. ([DOI: 10.1016/j.tics.2006.03.004](https://doi.org/10.1016/j.tics.2006.03.004); [PDF](https://vaughanbell.net/wp-content/uploads/2014/09/bell_et_al_2006_tics.pdf))
- **Aberrant salience.** Kapur (2003, *American Journal of Psychiatry*) proposed that psychosis involves a dysregulated dopaminergic state producing *aberrant assignment of salience* — ordinary stimuli acquiring undeserved motivational significance — with delusion as the *cognitive effort to explain* that anomalous salience. This is important for our purposes because it locates the disorder in the **salience-tagging system**, not in the reasoning that follows. The reasoning is often locally coherent. ([DOI: 10.1176/appi.ajp.160.1.13](https://doi.org/10.1176/appi.ajp.160.1.13); [PubMed 12505794](https://pubmed.ncbi.nlm.nih.gov/12505794/))
- **Apophenia as a normal-range trait.** Blain, Longenecker, Grazioplene, Klimes-Dougan & DeYoung (2020, *Journal of Abnormal Psychology*, 129(3), 279–292) develop apophenia as a **disposition toward false positives**, unifying openness to experience and psychoticism on a single normal-range personality dimension. Apophenia here is a measurable individual difference in the general population, with a signal-detection interpretation: a liberal criterion for "there is something there." ([PubMed 32212749](https://pubmed.ncbi.nlm.nih.gov/32212749/))
- **Conspiracy belief correlates only modestly with schizotypy.** Bowes, Costello & Tasimi (2023, *Psychological Bulletin*) meta-analysed 170 studies / 1,429 effect sizes / 158,473 participants and found conspiratorial ideation clusters around perceived danger and threat, reliance on intuition, and antagonism. Related meta-analytic work reports schizotypy correlations in the region of r ≈ .3 — a real but moderate association that leaves the large majority of variance unexplained by anything clinical. ([PubMed 37358543](https://pubmed.ncbi.nlm.nih.gov/37358543/); [APA release PDF](https://www.apa.org/pubs/journals/releases/bul-bul0000392.pdf))

**Operational upshot:** treat over-connection as a *property of the task and the data*, not a property of the analyst. It is produced by weak priors, unconstrained search, and absent denominators — all of which are fixable with procedure.

### 1.3 Situational triggers

Whitson & Galinsky (2008, *Science*, 322, 115–117) showed experimentally that **lacking control increases illusory pattern perception** — participants primed with lack of control saw more images in noise, formed more illusory correlations in stock-market information, perceived more conspiracies, and developed more superstitions. Self-affirmation reduced the effect. ([DOI: 10.1126/science.1159845](https://doi.org/10.1126/science.1159845))

For an investigative team this is a workflow warning: pattern over-detection spikes exactly when an investigation feels stalled, threatened, or adversarial — which is precisely when the stakes of publishing a false claim are highest.

---

## 2. Patternicity, agenticity, and why false positives are evolutionarily cheap

**Michael Shermer** coined **patternicity** — "the tendency to find meaningful patterns in meaningless noise" — in *Scientific American* (December 2008), and paired it with **agenticity**, "the tendency to infuse patterns with meaning, intention, and agency." The two-step is the engine of conspiracy cognition: first a pattern is detected, then an intentional agent is posited behind it. Shermer developed both in *The Believing Brain* (2011). ([Scientific American, "Patternicity"](https://www.scientificamerican.com/article/patternicity-finding-meaningful-patterns/); [Scientific American, "Agenticity"](https://www.scientificamerican.com/article/skeptic-agenticity/); [michaelshermer.com](https://michaelshermer.com/the-believing-brain/))

The formal argument for why this is adaptive rather than defective comes from **Foster & Kokko (2009), "The evolution of superstitious and superstition-like behaviour," *Proceedings of the Royal Society B*, 276(1654), 31–37.** They model when natural selection favours assigning causality between two events, and derive an inequality — described in the paper as akin to an amalgam of Hamilton's rule and Pascal's wager — showing that **selection can favour strategies producing frequent errors of assessment, provided the occasional correct response carries a large fitness benefit.** Mistaking wind for a predator is cheap; mistaking a predator for wind is not. ([DOI: 10.1098/rspb.2008.0981](https://doi.org/10.1098/rspb.2008.0981); [PMC2615824](https://pmc.ncbi.nlm.nih.gov/articles/PMC2615824/))

The agency half has its own literature. **Stewart Guthrie**'s *Faces in the Clouds: A New Theory of Religion* (Oxford University Press, 1993) argued that anthropomorphism is a perceptual default. **Justin Barrett** extended this to the **Hyperactive (or Hypersensitive) Agency Detection Device (HADD)** — a bias toward inferring goal-directed agents from minimal cues — in "Exploring the natural foundations of religion," *Trends in Cognitive Sciences*, 4(1), 29–34 (2000). ([DOI: 10.1016/S1364-6613(99)01419-9](https://doi.org/10.1016/S1364-6613%2899%2901419-9); [PubMed 10637620](https://pubmed.ncbi.nlm.nih.gov/10637620/))

**Why this matters for corporate network work:** the asymmetric-cost logic that makes Type I errors adaptive in a predator environment is *inverted* in publishing. A false positive in an investigative dossier is expensive — legally, reputationally, and to the credibility of the true findings sitting next to it. The evolved default is miscalibrated for this task and must be overridden by procedure.

---

## 3. Illusory correlation

**Chapman & Chapman (1967), "Genesis of popular but erroneous psychodiagnostic observations," *Journal of Abnormal Psychology*, 72(3), 193–204.** Naïve undergraduates were shown Draw-A-Person test drawings randomly paired with contrived symptom statements. They "rediscovered" the same drawing–symptom relationships that practising clinicians reported seeing — **relationships that were absent from the materials by construction.** Reported associations tracked *semantic associative strength* between symptom and drawing feature, not co-occurrence. The bias persisted under repeated exposure and under conditions designed to maximise motivation and opportunity for accurate observation. ([DOI: 10.1037/h0024670](https://doi.org/10.1037/h0024670); [PubMed 4859731](https://pubmed.ncbi.nlm.nih.gov/4859731/))

This is the single most directly transferable result in the dossier. It is a controlled demonstration that **expert practitioners, working carefully on real-looking data, reliably perceive a correlation that is exactly zero**, because the two things *sound like* they go together.

**Hamilton & Gifford (1976), "Illusory correlation in interpersonal perception: A cognitive basis of stereotypic judgments," *Journal of Experimental Social Psychology*, 12(4), 392–407** identified the **distinctiveness-based** mechanism: when a rare group co-occurs with a rare behaviour, the conjunction is doubly distinctive, hence better attended, better encoded, and more accessible at recall — producing a perceived association where none exists. ([DOI: 10.1016/S0022-1031(76)80006-6](https://doi.org/10.1016/S0022-1031%2876%2980006-6); [ERIC EJ152890](https://eric.ed.gov/?id=EJ152890))

**Graph translation:** in a corporate network, the rare-rare conjunction is the *shell company in a small jurisdiction that shares a nominee with a politically exposed person*. Both elements are individually rare and individually memorable. The distinctiveness effect predicts you will over-weight this co-occurrence relative to its actual frequency **even if nominee-sharing is uniformly distributed across the register**. The corrective is mechanical: compute how often that conjunction occurs among entities you are *not* investigating.

---

## 4. Base rates, representativeness, and the conjunction fallacy

**Kahneman & Tversky (1973), "On the psychology of prediction," *Psychological Review*, 80(4), 237–251.** Intuitive prediction follows *representativeness*: people predict the outcome that best resembles the evidence, and are consequently insensitive both to the reliability of the evidence and to the prior probability of the outcome. In the "Tom W." studies, judged similarity to a field-stereotype predicted likelihood rankings almost perfectly (r ≈ .98), with base rates essentially ignored. ([DOI: 10.1037/h0034747](https://doi.org/10.1037/h0034747))

**Bar-Hillel (1980), "The base-rate fallacy in probability judgments," *Acta Psychologica*, 44(3), 211–233** established the fallacy as a systematic phenomenon and analysed the conditions (chiefly perceived *relevance* of the base-rate information) under which people do and do not incorporate priors. ([DOI: 10.1016/0001-6918(80)90046-3](https://doi.org/10.1016/0001-6918%2880%2990046-3); [PDF](http://bear.warrington.ufl.edu/brenner/mar7588/Papers/barhillel-acta1980.pdf))

**Tversky & Kahneman (1983), "Extensional versus intuitive reasoning: The conjunction fallacy in probability judgment," *Psychological Review*, 90(4), 293–315** — the Linda problem. A conjunction (bank teller *and* feminist) was judged more probable than one of its conjuncts (bank teller) by a large majority of respondents, in direct violation of the conjunction rule P(A∧B) ≤ P(A). Adding a *representative* detail makes a story feel more probable while making it strictly less probable. ([DOI: 10.1037/0033-295X.90.4.293](https://doi.org/10.1037/0033-295X.90.4.293); [PDF](https://pages.ucsd.edu/~cmckenzie/TverskyKahneman1983PsychRev.pdf))

**This is the conspiracy-narrative failure mode in one line.** A detailed, coherent, multi-actor account of how a scheme worked is *strictly less likely* than each of its components, but *feels* more likely because it is more representative — more like what a scheme "looks like." Every additional named participant, every additional causal link, multiplies a probability below 1.0 and simultaneously increases subjective confidence.

**The corrective — natural frequencies.** Gigerenzer & Hoffrage (1995), "How to improve Bayesian reasoning without instruction: Frequency formats," *Psychological Review*, 102(4), 684–704, showed that Bayesian inference becomes computationally simpler and dramatically more accurate when information is presented as **natural frequencies** ("out of 10,000 companies, 30 have X, of which 8 also have Y") rather than conditional probabilities. Reported Bayesian-conforming inference rose to roughly 50% in statistically naïve participants, from a much lower baseline. ([DOI: 10.1037/0033-295X.102.4.684](https://doi.org/10.1037/0033-295X.102.4.684); [PDF](https://pages.ucsd.edu/~scoulson/203/GG_How_1995.pdf))

**Implementation rule:** never state a network finding as a probability or as a bare count. State it as a natural frequency with an explicit denominator drawn from the same register.

---

## 5. Randomness misperception: clustering, Ramsey, and the law of truly large numbers

### 5.1 The clustering illusion

**Gilovich, Vallone & Tversky (1985), "The hot hand in basketball: On the misperception of random sequences," *Cognitive Psychology*, 17(3), 295–314.** Analysing Philadelphia 76ers field-goal data, Boston Celtics free-throw data, and a controlled 100-shot experiment with Cornell players, they found no evidence for streak-dependence beyond chance, and attributed the near-universal belief in "hot hands" to a misperception of what random sequences look like — people expect randomness to be more alternating and less clumpy than it is. ([DOI: 10.1016/0010-0285(85)90010-6](https://doi.org/10.1016/0010-0285%2885%2990010-6))

*Important caveat for honesty:* this specific finding has been substantially contested since 2015 on grounds of a selection-induced small-sample bias in the original estimator, and the current literature is genuinely unsettled about whether a small hot-hand effect exists in basketball. **The psychological claim that survives intact is the general one: humans systematically under-estimate the clumpiness of random sequences.** That is the claim used in this dossier; the basketball-specific claim is flagged as contested.

### 5.2 Structure is mathematically unavoidable

**Graham & Spencer (1990), "Ramsey Theory," *Scientific American*, 263(1), 112–117.** Ramsey theory studies the conditions under which order must appear. The article's framing of Frank Plumpton Ramsey's result is that **"complete disorder is an impossibility"**: any sufficiently large structure necessarily contains a highly ordered substructure, regardless of how it was generated. ([Scientific American](https://www.scientificamerican.com/article/ramsey-theory/))

Stated precisely, so the claim is not overreached: the canonical graph-theoretic form of Ramsey's theorem says that for any integers *s*, *t* there exists a finite number *R(s,t)* such that **any** 2-colouring of the edges of a complete graph on *R(s,t)* vertices contains either a monochromatic clique of size *s* or one of size *t*. Ramsey theory does not say that "any pattern you like appears in any large random graph" — that is a stronger and false claim. It says that **specified classes of ordered substructure are forced to exist above a size threshold, with no cause needed beyond size.** For network investigation, the honest generalisation is: *the existence of a tightly interconnected subgroup in a large graph is not, by itself, evidence of anything. Tightly interconnected subgroups are compulsory.*

### 5.3 Coincidence at scale

**Diaconis & Mosteller (1989), "Methods for studying coincidences," *Journal of the American Statistical Association*, 84(408), 853–861.** The paper sets out statistical machinery for coincidence problems — including a generalised birthday problem admitting dependence, inhomogeneity, and near-matches, plus Fisher-style partial credit for close matches. It is the source standardly credited for the **law of truly large numbers**: *with a large enough sample, any outrageous thing is likely to happen.* ([DOI: 10.1080/01621459.1989.10478847](https://doi.org/10.1080/01621459.1989.10478847); [PDF](https://www.stat.berkeley.edu/~aldous/157/Papers/diaconis_mosteller.pdf); [Wolfram MathWorld, "Law of Truly Large Numbers"](https://mathworld.wolfram.com/LawofTrulyLargeNumbers.html))

The birthday problem is the cheapest available intuition pump: in a room of 23 people the probability that *some* pair shares a birthday exceeds 50%, because there are 253 pairs, not 23. The count that matters is **the number of opportunities for a match, not the number of entities.** In a graph of *n* nodes there are *n(n−1)/2* possible pairs. At n = 100,000 that is roughly 5 × 10⁹ pairs. Any "shared attribute" test applied across all pairs will return a very large absolute number of hits at a vanishingly small per-pair probability. The absolute count of coincidences carries almost no information; only the count *relative to the expected count under a null model* does.

---

## 6. Multiple comparisons and the garden of forking paths

This is where the psychology becomes statistics.

**Gelman & Loken (2014), "The statistical crisis in science: data-dependent analysis — a 'garden of forking paths' — explains why many statistically significant comparisons don't hold up," *American Scientist*, 102(6), 460–465.** Their central insight is that **you do not need to run multiple tests to suffer a multiple-comparisons problem.** It is sufficient that the analysis you *would have run* depends on the data you saw. A single test, chosen after inspecting the data, carries the inflated error rate of the whole implicit family of tests you might have chosen instead. ([American Scientist](https://www.americanscientist.org/article/the-statistical-crisis-in-science); [Columbia PDF](https://sites.stat.columbia.edu/gelman/research/published/ForkingPaths.pdf))

For an OSINT analyst this is the exact description of exploratory graph work. You load the graph, you look around, something catches your eye, you query it. There was no explicit test family — but there was an enormous implicit one.

**Simmons, Nelson & Simonsohn (2011), "False-positive psychology: Undisclosed flexibility in data collection and analysis allows presenting anything as significant," *Psychological Science*, 22(11), 1359–1366.** Simulation plus two real experiments demonstrating how ordinary, individually-defensible analytic flexibility ("researcher degrees of freedom") drives the false-positive rate far above the nominal 5%. The authors' remedy is disclosure-based: state what you decided, when, and why. ([DOI: 10.1177/0956797611417632](https://doi.org/10.1177/0956797611417632); [PubMed 22006061](https://pubmed.ncbi.nlm.nih.gov/22006061/))

**The statistical corrective.** Bonferroni correction (test at α/m for m comparisons) controls the family-wise error rate but is punishingly conservative at the scale of graph queries. The workable alternative is **Benjamini & Hochberg (1995), "Controlling the false discovery rate: a practical and powerful approach to multiple testing," *Journal of the Royal Statistical Society, Series B*, 57(1), 289–300**, which controls the *expected proportion of false discoveries among the discoveries made* rather than the probability of any false discovery at all. ([DOI: 10.1111/j.2517-6161.1995.tb02031.x](https://doi.org/10.1111/j.2517-6161.1995.tb02031.x); [PDF](http://engr.case.edu/ray_soumya/mlrg/controlling_fdr_benjamini95.pdf))

FDR is the right frame for investigative work because it maps onto the actual editorial question: *of the N suspicious things in this dossier, roughly how many should I expect to be nothing?* An answer of "about 2 of 30" is publishable with caveats. An answer of "about 25 of 30" is not a dossier, it is a query log.

---

## 7. The psychology of conspiracy belief — and the necessary counterweight

### 7.1 What the literature finds

- **Douglas, Sutton & Cichocka (2017), "The psychology of conspiracy theories," *Current Directions in Psychological Science*, 26(6), 538–542** organise the drivers into three motive classes: **epistemic** (understanding one's environment), **existential** (safety and control), and **social** (maintaining a positive image of self and in-group). They note the evidence base is much stronger on *causes* than on *consequences* of adopting such beliefs. ([DOI: 10.1177/0963721417718261](https://doi.org/10.1177/0963721417718261); [Kent repository PDF](https://kar.kent.ac.uk/61995/1/Douglas%20Sutton%20Cichocka%202017.pdf))
- **van Prooijen & Douglas (2018), "Belief in conspiracy theories: Basic principles of an emerging research domain," *European Journal of Social Psychology*, 48(7), 897–908** distil four principles: conspiracy beliefs are **consequential, universal, emotional, and social**. The "emotional" principle is the important one methodologically — negative affect, not deliberative reasoning, is the proximate driver. ([DOI: 10.1002/ejsp.2530](https://doi.org/10.1002/ejsp.2530); [Kent PDF](https://kar.kent.ac.uk/68554/1/EJSP%20Special%20Issue%20Introduction_FINAL.pdf))
- **Imhoff & Bruder (2014), "Speaking (un-)truth to power: Conspiracy mentality as a generalised political attitude," *European Journal of Personality*, 28(1), 25–43** establish **conspiracy mentality** as a stable, generalised attitude distinct from right-wing authoritarianism and social dominance orientation, and characterised by prejudice *against high-power groups* — the mirror image of the RWA/SDO pattern. ([DOI: 10.1002/per.1930](https://doi.org/10.1002/per.1930))
- **van Prooijen, Douglas & De Inocencio (2018), "Connecting the dots: Illusory pattern perception predicts belief in conspiracies and the supernatural," *European Journal of Social Psychology*, 48(3), 320–335** — five studies linking pattern perception in random coin-toss sequences and in chaotic paintings to conspiracy and supernatural belief, including an experimental manipulation of conspiracy belief that changed downstream pattern perception. This is the direct empirical bridge between apophenia and conspiracy belief. ([DOI: 10.1002/ejsp.2331](https://doi.org/10.1002/ejsp.2331))
- **Wood, Douglas & Sutton (2012), "Dead and alive: Beliefs in contradictory conspiracy theories," *Social Psychological and Personality Science*, 3(6), 767–773** reported that endorsement of *mutually incompatible* conspiracy theories is positively correlated (Diana murdered / Diana faked her death; bin Laden already dead / bin Laden still alive), mediated by a higher-order belief that authorities are engaged in cover-up. ([DOI: 10.1177/1948550611434786](https://doi.org/10.1177/1948550611434786); [Kent PDF](https://kar.kent.ac.uk/28566/1/Wood%20et%20al%202012%20SPPS.pdf))

  **This finding is genuinely contested and must be reported as such.** van Prooijen, Wahring, Mausolf, Mulas & Shwan (2023), "Just dead, not alive: Reconsidering belief in contradictory conspiracy theories," *Psychological Science*, ran four preregistered studies (N = 7,641) across 28 contradictory pairs and argued the positive correlation is largely driven by respondents who **disbelieve both** conspiracy theories — among actual conspiracy believers the correlation was inconsistent at best. ([DOI: 10.1177/09567976231158570](https://doi.org/10.1177/09567976231158570)) Miani & Lewandowsky (2024), "Still very much dead and alive: Re-reconsidering belief in contradictory conspiracy theories," rebut in the other direction ([OSF preprint DOI: 10.31219/osf.io/t6a54](https://doi.org/10.31219/osf.io/t6a54)). Treat the "believers hold contradictory beliefs" claim as **live scientific dispute**, not settled fact.

### 7.2 The counterweight: real, documented conspiracies

Any framework for detecting apophenia must not become a framework for dismissing evidence. Coordinated, concealed, illegal action by powerful actors is an ordinary feature of the historical record. Five examples with primary or official documentation:

1. **Project MKUltra (CIA, c. 1953–1973).** CIA human experimentation with drugs and behavioural modification, largely without informed consent, with most records destroyed in 1973. Documented in the Senate joint hearing *Project MKULTRA, the CIA's Program of Research in Behavioral Modification*, Select Committee on Intelligence and Subcommittee on Health and Scientific Research, 95th Congress, 1st session, **3 August 1977**. ([Senate Select Committee on Intelligence](https://www.intelligence.senate.gov/1977/08/03/hearings-joint-hearing-subcommittee-health-and-scientific-research-committee-human-resources-project/); [hearing PDF](https://www.intelligence.senate.gov/wp-content/uploads/2024/08/sites-default-files-hearings-95mkultra.pdf); [CIA reading room copy](https://www.cia.gov/readingroom/document/00163357)). Context: the Church Committee's final report (April 1976, six volumes).
2. **Watergate (1972–1974).** Burglary, wiretapping, obstruction of justice, and a concealed White House coordination effort. *Final Report of the Senate Select Committee on Presidential Campaign Activities* (the Ervin Committee), 27 June 1974 ([senate.gov PDF](https://www.senate.gov/about/resources/pdf/watergate-final-report-1974.pdf)); *United States v. Nixon*, 418 U.S. 683 (1974) ([GovInfo](https://www.govinfo.gov/app/details/USREPORTS-418/USREPORTS-418-683); [Library of Congress](https://www.loc.gov/item/usrep418683/)).
3. **The US Public Health Service Untreated Syphilis Study at Tuskegee (1932–1972).** 600 Black men (399 with syphilis, 201 without) enrolled without informed consent, told they were treated for "bad blood," and denied penicillin after it became the standard of care in the 1940s. Ended in 1972 following press exposure. ([CDC](https://www.cdc.gov/tuskegee/about/index.html); [CDC timeline](https://www.cdc.gov/tuskegee/about/timeline.html))
4. **LIBOR / EURIBOR benchmark manipulation (c. 2003–2012).** Multi-bank coordinated false rate submissions. Barclays: CFTC $200m penalty ([CFTC release 6289-12](https://www.cftc.gov/PressRoom/PressReleases/6289-12)), FSA/FCA £59.5m ([FCA](https://www.fca.org.uk/news/press-releases/barclays-fined-%C2%A3595-million-significant-failings-relation-libor-and-euribor)), DOJ $160m. Deutsche Bank: CFTC $800m ([CFTC release 7159-15](https://www.cftc.gov/PressRoom/PressReleases/7159-15)), with a UK subsidiary guilty plea and a parent-company deferred prosecution agreement.
5. **Volkswagen emissions defeat device (2009–2015).** Software designed to detect test conditions and modulate emissions controls; real-world NOx up to ~40× the standard on approximately 499,000 US vehicles. EPA Notice of Violation, **18 September 2015** ([EPA NOV PDF](https://www.epa.gov/sites/default/files/2015-10/documents/vw-nov-caa-09-18-15.pdf)); subsequent DOJ civil complaint ([DOJ](https://www.justice.gov/archives/opa/pr/united-states-files-complaint-against-volkswagen-audi-and-porsche-alleged-clean-air-act)).

**What distinguishes these from apophenia is not the shape of the claim but the shape of the evidence:** internal documents, sworn testimony, adversarial cross-examination, regulatory findings, guilty pleas, and adjudicated judgments. The pattern in each case was *confirmed by a source independent of the pattern itself.* That is the discriminating criterion.

---

## 8. Network-analysis-specific traps

Everything above applies to any dataset. These are the traps specific to graphs.

**8.1 Spurious edges from entity resolution failure.** The most common source of false findings in corporate network work is not inference — it is **the graph being wrong**. Two distinct "Rajesh Kumar" directors merged into one node manufactures a bridge between unrelated clusters; one person spelled two ways splits a real hub. The foundational theory is **Fellegi & Sunter (1969), "A theory for record linkage," *Journal of the American Statistical Association*, 64(328), 1183–1210**, which frames linkage as a decision problem over comparison vectors with three outcomes — link, non-link, and *possible link* — and derives a rule minimising the possible-link region under fixed error bounds. ([DOI: 10.1080/01621459.1969.10501049](https://doi.org/10.1080/01621459.1969.10501049); [PDF](http://www2.stat.duke.edu/~rcs46/linkage/presentations/01-baiLi_FelleigSunter1969.pdf)) The practical lesson is that **"possible link" must be preserved as a distinct state in the graph**, not silently resolved to link or non-link. Name-frequency-aware matching matters enormously in registers with highly skewed name distributions.

**8.2 Degree heterogeneity makes hubs trivially "central."** In heavy-tailed networks, betweenness, closeness, and eigenvector centrality are all strongly driven by degree. A company appearing "central to the whole network" is frequently just a company with many filings — a large auditor, a registered-agent service, a bank. Reporting raw centrality without conditioning on degree is close to reporting node size.

**8.3 Hubs are expected, not anomalous.** **Barabási & Albert (1999), "Emergence of scaling in random networks," *Science*, 286(5439), 509–512** showed that growth plus **preferential attachment** ("new vertices attach preferentially to sites that are already well connected") generates power-law degree distributions as a matter of course. ([DOI: 10.1126/science.286.5439.509](https://doi.org/10.1126/science.286.5439.509)) The existence of a few enormously connected nodes requires no conspiracy; it requires only that the network grew and that connection begets connection.

**8.4 Short paths between arbitrary entities are the norm.** **Watts & Strogatz (1998), "Collective dynamics of 'small-world' networks," *Nature*, 393, 440–442** showed that a small amount of random rewiring in an otherwise regular network collapses characteristic path length while preserving high clustering. ([DOI: 10.1038/30918](https://doi.org/10.1038/30918)) Empirically, **Travers & Milgram (1969), "An experimental study of the small world problem," *Sociometry*, 32(4), 425–443** found a mean of 5.2 intermediaries among completed chains. ([JSTOR/DOI: 10.2307/2786545](https://doi.org/10.2307/2786545); [PDF](https://snap.stanford.edu/class/cs224w-readings/travers69smallworld.pdf)) **"X is connected to Y in four hops" is therefore not a finding.** It is the expected behaviour of the medium. A path becomes evidential only when its *length is short relative to a null distribution*, its *edges are individually strong and documented*, and its *semantics are coherent* (a chain that hops director → company → auditor → company → shareholder asserts almost nothing).

**8.5 Null models are mandatory.** The remedy for 8.2–8.4 is a **degree-preserving null model**. **Maslov & Sneppen (2002), "Specificity and stability in topology of protein networks," *Science*, 296(5569), 910–913** established the randomised-rewiring approach: rewire all links at random while preserving each node's degree, then compare the observed statistic to the ensemble. Their substantive finding — that links between highly connected proteins are systematically suppressed relative to the null — is exactly the kind of claim that is invisible without a null model. ([DOI: 10.1126/science.1065103](https://doi.org/10.1126/science.1065103)) The general configuration-model framework is reviewed in **Newman (2003), "The structure and function of complex networks," *SIAM Review*, 45(2), 167–256** ([DOI: 10.1137/S003614450342480](https://doi.org/10.1137/S003614450342480)).

**8.6 Motif significance testing.** **Milo, Shen-Orr, Itzkovitz, Kashtan, Chklovskii & Alon (2002), "Network motifs: simple building blocks of complex networks," *Science*, 298(5594), 824–827** defined network motifs as **patterns of interconnection occurring at numbers significantly higher than in randomized networks with the same degree sequence**. ([DOI: 10.1126/science.298.5594.824](https://doi.org/10.1126/science.298.5594.824); [PubMed 12399590](https://pubmed.ncbi.nlm.nih.gov/12399590/)) This is the template for the entire discipline being recommended here: *a subgraph pattern is only interesting relative to a degree-matched random ensemble.* If a "suspicious triangle of cross-directorships" appears 4,000 times in your data and 4,100 times in the degree-preserving null, you have found nothing.

**8.7 Simpson's paradox.** **Simpson (1951), "The interpretation of interaction in contingency tables," *Journal of the Royal Statistical Society, Series B*, 13(2), 238–241** showed that an association present in aggregated data can reverse when the data are disaggregated by a third variable. ([DOI: 10.1111/j.2517-6161.1951.tb00088.x](https://doi.org/10.1111/j.2517-6161.1951.tb00088.x); [OUP PDF](https://academic.oup.com/jrsssb/article-pdf/13/2/238/49093972/jrsssb_13_2_238.pdf)) In network terms: an apparent sector-wide association between political donations and contract awards can invert once you stratify by firm size or state.

**8.8 Ecological fallacy.** **Robinson (1950), "Ecological correlations and the behavior of individuals," *American Sociological Review*, 15(3), 351–357** — his canonical example being that US state-level immigration and literacy rates correlated positively while individual-level immigration and literacy correlated negatively. ([DOI: 10.2307/2087176](https://doi.org/10.2307/2087176); [PDF](https://www.stats.uwo.ca/faculty/aim/2015/9938/articles/Robinson1950AmericanSociologicalReview.pdf)) In network terms: a cluster-level statistic (this community has unusually many state contracts) licenses **no** inference about any individual node inside it.

---

## 9. What separates a finding from a coincidence

A compact operational definition, synthesising the above. A network-derived pattern warrants publication as a *claim about the world* only when it satisfies all of:

- **Denominator known.** You can state how many entities were eligible for this pattern, not just how many exhibited it.
- **Null-model excess.** The observed count materially exceeds the degree-preserving null expectation, and you can say by how much.
- **Search space disclosed.** You can enumerate, at least approximately, how many patterns you looked for before finding this one.
- **Pre-specified falsifier.** You wrote down, before querying, what result would have made you drop the hypothesis — and that result did not occur.
- **Independent corroboration.** At least one item of evidence external to the graph structure itself (a filing, a document, a named source, a regulatory record) supports the same conclusion.
- **Entity resolution audited.** Every node on the critical path has been individually verified as the entity you think it is.

Anything failing one or more of these is legitimate as a *lead*, and must be labelled as such.

---

## 10. Trap → mechanism → corrective → graph-database implementation

| Trap | Why it fools you | Statistical corrective | How to implement it in a graph database |
|---|---|---|---|
| **Apophenia / illusory pattern perception** (Conrad 1958; van Prooijen et al. 2018) | Pattern detection is coupled to a felt sense of significance; the feeling arrives before the evidence | Require an explicit, pre-registered hypothesis and a numeric threshold | Store every exploratory query in a `Query` node with timestamp, author, and stated hypothesis *before* execution; findings can only cite a pre-existing query ID |
| **Patternicity + agenticity** (Shermer 2008; Foster & Kokko 2009; Barrett 2000) | Type I errors were evolutionarily cheap; agency is the default explanation for structure | Force articulation of at least two non-agentic mechanisms (regulation, market structure, service provider, coincidence) | Require every `Finding` node to carry ≥2 linked `AlternativeExplanation` nodes before it can be promoted past `lead` status |
| **Illusory correlation** (Chapman & Chapman 1967; Hamilton & Gifford 1976) | Semantically associated and doubly-rare co-occurrences are over-attended and over-remembered | Build the full 2×2 contingency table, including the two cells you never look at | For any "A tends to co-occur with B" claim, compute all four counts: A∧B, A∧¬B, ¬A∧B, ¬A∧¬B, over the whole register. Store the table on the finding |
| **Base-rate neglect** (Kahneman & Tversky 1973; Bar-Hillel 1980) | Representativeness feels like probability | Compute the prior from the register itself; express as natural frequencies (Gigerenzer & Hoffrage 1995) | Materialise a `base_rates` view: per-attribute prevalence across all nodes of that label. Every finding must render as "k of N entities, versus m of M overall" |
| **Conjunction fallacy** (Tversky & Kahneman 1983) | More narrative detail feels more probable while being less probable | Score narrative complexity; penalise each additional required actor/link | Compute a `conjunction_depth` on each finding = number of independent asserted links. Flag anything above a small threshold for extra scrutiny |
| **Clustering illusion** (Gilovich, Vallone & Tversky 1985) | Real randomness is clumpier than intuition expects | Compare observed clustering to a randomised ensemble | Run the same clustering/community query on ≥100 degree-preserving rewirings; report the observed value as a percentile of the null distribution |
| **"Look at all these coincidences"** (Diaconis & Mosteller 1989; Ramsey theory, Graham & Spencer 1990) | Absolute coincidence counts scale with pair count, not entity count | Compare observed matches to expected matches under the null; remember structure is compulsory above a size threshold | Before running any pairwise-match query, compute and log the number of pairs tested (~n²/2) and the expected hit count. Store both alongside results |
| **Garden of forking paths** (Gelman & Loken 2014; Simmons et al. 2011) | The implicit test family is invisible because you only ran one query | Pre-registration + disclosure of researcher degrees of freedom | Append-only, immutable query log. Publish the query count alongside the findings count. Never allow retroactive edits to a stated hypothesis |
| **Multiple comparisons** (Bonferroni; Benjamini & Hochberg 1995) | N suspicious coincidences from N×1000 tests is exactly what noise looks like | FDR control at a stated q | For each batch of graph tests, compute p-values against the null ensemble, apply Benjamini–Hochberg, and report the expected number of false discoveries in the published set |
| **Spurious edges / entity collision** (Fellegi & Sunter 1969) | A merged node fabricates a bridge; a split node hides a hub | Probabilistic record linkage with an explicit *possible-link* state and name-frequency weighting | Never hard-merge. Use `SAME_AS {confidence, method, evidence}` relationships. Traversals must be able to run at multiple confidence thresholds and report sensitivity |
| **Degree-driven centrality** | Hubs look important because centrality measures track degree | Degree-normalise, or compare centrality to the degree-matched null | Store `centrality_percentile_vs_null` next to raw centrality. Never surface raw betweenness in a narrative |
| **Preferential attachment** (Barabási & Albert 1999) | Superhubs feel engineered | Expect power-law degree; test whether the tail is *anomalous* for this register | Fit the degree distribution per node label; flag only nodes exceeding the fitted expectation, not merely high-degree nodes |
| **Small-world short paths** (Watts & Strogatz 1998; Travers & Milgram 1969) | "Only 4 hops apart!" | Compare path length to the null distribution of path lengths between random node pairs of the same degree | Precompute the null path-length distribution. Reject any path claim whose length is at or above the null median. Also enforce edge-type semantics on paths |
| **Weak/ubiquitous edges** | Registered-agent addresses and Big-4 auditors connect everything | Weight edges by informativeness (inverse frequency of the shared attribute) | Give each edge an `idf_weight`. Exclude edges below an informativeness floor from path and community queries by default |
| **Motif over-reading** (Milo et al. 2002) | A subgraph shape looks like collusion | Motif Z-score against a degree-preserving random ensemble | Implement motif counting plus ensemble generation as a first-class pipeline; store `z_score` and `n_random_graphs` on every motif finding |
| **Simpson's paradox** (Simpson 1951) | Aggregate association reverses under stratification | Always stratify by the obvious confounders before asserting association | Every association query must also run stratified by sector, size band, jurisdiction, and year, with results stored |
| **Ecological fallacy** (Robinson 1950) | Cluster-level statistics get attributed to individual nodes | Keep levels of analysis separate and explicit | Type findings as `entity_level` or `cluster_level`; block templates that name individuals from citing cluster-level evidence |
| **Absence not recorded** | Only hits get written down, so the hit rate looks like 100% | Record negative results with equal prominence | Persist `NullResult` nodes for every query that returned nothing. Report the hit rate in the published methodology |

---

## 11. Practical antidotes: an operational checklist

Run this as a literal procedure. Each step is designed to be checkable by someone other than the analyst who did the work.

**Before touching the data**

1. **Write the hypothesis down, with a date and an owner.** One sentence. Specific enough to be wrong.
2. **Define the falsifier first.** "If fewer than X% of matched control entities lack this feature, I abandon the hypothesis." A hypothesis with no falsifier is not a hypothesis.
3. **Pre-register the query.** The exact query text, the threshold, the expected direction. Commit it before running it. (Gelman & Loken 2014; Simmons et al. 2011)
4. **Estimate the base rate before looking at the target.** How common is this pattern in the register at large? Write the number down before you see the target's number. (Bar-Hillel 1980)

**While querying**

5. **Count the denominator every time.** Never report "we found 47 companies with X" without "…out of N eligible companies, versus M% in the register overall." Express as natural frequencies. (Gigerenzer & Hoffrage 1995)
6. **Build a control group.** Match on degree, sector, incorporation year, jurisdiction, and size. Run the *identical* query against the controls. If controls produce the same rate, there is no finding.
7. **Run a degree-preserving null model.** ≥100 rewirings; report the observed statistic as a percentile of the null. (Maslov & Sneppen 2002; Milo et al. 2002)
8. **Log every query, including the ones that failed.** Append-only. This is the only defence against the garden of forking paths.
9. **Apply FDR control to any batch of tests.** State q, state the expected number of false discoveries in the surviving set. (Benjamini & Hochberg 1995)
10. **Stratify before asserting association.** At minimum by sector, size, jurisdiction, and time period. (Simpson 1951)

**Before writing anything**

11. **Audit entity resolution on the critical path, node by node.** Every entity named in the finding must be individually confirmed — full identifiers, not name strings. Preserve "possible link" as a state; never let a probabilistic merge become an asserted identity. (Fellegi & Sunter 1969)
12. **Generate at least two non-agentic explanations** for the pattern and state why each was rejected. If you cannot generate two, you do not understand the domain well enough to publish.
13. **Check the level of analysis.** Cluster-level evidence never supports an individual-level claim. (Robinson 1950)
14. **Tier every claim explicitly.** Use four fixed labels and apply them per sentence, not per article:
    - **DOCUMENTED** — supported by a primary record (filing, judgment, contract, regulatory order) that a reader can independently retrieve.
    - **REPORTED** — asserted by an identified third party whose reliability the reader can assess.
    - **ALLEGED** — asserted by a party to a dispute, or under investigation, without adjudication.
    - **ANALYTIC** — derived by us from data, with the method and null model stated. This tier is an inference, never a fact, and must never be phrased as one.
15. **Record absence as loudly as presence.** Publish the number of queries run, the number that returned nothing, and the hit rate. A methodology section that lists only successful queries is a garden-of-forking-paths artefact.
16. **Have someone else try to break it.** Adversarial review by a colleague whose explicit job is to find the innocent explanation.

**Language discipline**

17. Do not use psychiatric vocabulary as metaphor. "Apophenia," "illusory pattern perception," and "over-fitting" are precise and carry no stigma. "Schizophrenic pattern matching" is neither accurate nor defensible in a public document.
18. Do not describe short graph paths as connections between people. Describe the specific relationship, its documentary source, and its date.
19. Never write "coincidence?" as a rhetorical device. Either compute the probability under a stated null or drop the observation.

---

## 12. References

**Clinical and cognitive foundations**

- Conrad, K. (1958). *Die beginnende Schizophrenie: Versuch einer Gestaltanalyse des Wahns*. Stuttgart: Georg Thieme. (Origin of *Apophänie*; see [Wikipedia summary](https://en.wikipedia.org/wiki/Apophenia) and [Britannica](https://www.britannica.com/topic/apophenia) for the standard English rendering.)
- Kapur, S. (2003). Psychosis as a state of aberrant salience. *American Journal of Psychiatry*, 160(1), 13–23. https://doi.org/10.1176/appi.ajp.160.1.13
- Bell, V., Halligan, P. W., & Ellis, H. D. (2006). Explaining delusions: a cognitive perspective. *Trends in Cognitive Sciences*, 10(5), 219–226. https://doi.org/10.1016/j.tics.2006.03.004
- Blain, S. D., Longenecker, J. M., Grazioplene, R. G., Klimes-Dougan, B., & DeYoung, C. G. (2020). Apophenia as the disposition to false positives: A unifying framework for openness and psychoticism. *Journal of Abnormal Psychology*, 129(3), 279–292. https://pubmed.ncbi.nlm.nih.gov/32212749/
- Bowes, S. M., Costello, T. H., & Tasimi, A. (2023). The conspiratorial mind: A meta-analytic review of motivational and personological correlates. *Psychological Bulletin*. https://pubmed.ncbi.nlm.nih.gov/37358543/
- Whitson, J. A., & Galinsky, A. D. (2008). Lacking control increases illusory pattern perception. *Science*, 322(5898), 115–117. https://doi.org/10.1126/science.1159845

**Patternicity, agenticity, evolution**

- Shermer, M. (2008, December). Patternicity: Finding meaningful patterns in meaningless noise. *Scientific American*. https://www.scientificamerican.com/article/patternicity-finding-meaningful-patterns/
- Shermer, M. (2009). Agenticity / Why people believe invisible agents control the world. *Scientific American*. https://www.scientificamerican.com/article/skeptic-agenticity/
- Shermer, M. (2011). *The Believing Brain*. New York: Times Books. https://michaelshermer.com/the-believing-brain/
- Foster, K. R., & Kokko, H. (2009). The evolution of superstitious and superstition-like behaviour. *Proceedings of the Royal Society B*, 276(1654), 31–37. https://doi.org/10.1098/rspb.2008.0981
- Barrett, J. L. (2000). Exploring the natural foundations of religion. *Trends in Cognitive Sciences*, 4(1), 29–34. https://doi.org/10.1016/S1364-6613(99)01419-9
- Guthrie, S. E. (1993). *Faces in the Clouds: A New Theory of Religion*. New York: Oxford University Press.

**Illusory correlation**

- Chapman, L. J., & Chapman, J. P. (1967). Genesis of popular but erroneous psychodiagnostic observations. *Journal of Abnormal Psychology*, 72(3), 193–204. https://doi.org/10.1037/h0024670
- Hamilton, D. L., & Gifford, R. K. (1976). Illusory correlation in interpersonal perception: A cognitive basis of stereotypic judgments. *Journal of Experimental Social Psychology*, 12(4), 392–407. https://doi.org/10.1016/S0022-1031(76)80006-6

**Heuristics, base rates, conjunction**

- Kahneman, D., & Tversky, A. (1973). On the psychology of prediction. *Psychological Review*, 80(4), 237–251. https://doi.org/10.1037/h0034747
- Bar-Hillel, M. (1980). The base-rate fallacy in probability judgments. *Acta Psychologica*, 44(3), 211–233. https://doi.org/10.1016/0001-6918(80)90046-3
- Tversky, A., & Kahneman, D. (1983). Extensional versus intuitive reasoning: The conjunction fallacy in probability judgment. *Psychological Review*, 90(4), 293–315. https://doi.org/10.1037/0033-295X.90.4.293
- Gigerenzer, G., & Hoffrage, U. (1995). How to improve Bayesian reasoning without instruction: Frequency formats. *Psychological Review*, 102(4), 684–704. https://doi.org/10.1037/0033-295X.102.4.684

**Randomness, coincidence, combinatorics**

- Gilovich, T., Vallone, R., & Tversky, A. (1985). The hot hand in basketball: On the misperception of random sequences. *Cognitive Psychology*, 17(3), 295–314. https://doi.org/10.1016/0010-0285(85)90010-6
- Graham, R. L., & Spencer, J. H. (1990). Ramsey theory. *Scientific American*, 263(1), 112–117. https://www.scientificamerican.com/article/ramsey-theory/
- Diaconis, P., & Mosteller, F. (1989). Methods for studying coincidences. *Journal of the American Statistical Association*, 84(408), 853–861. https://doi.org/10.1080/01621459.1989.10478847
- Law of truly large numbers (summary and attribution): https://mathworld.wolfram.com/LawofTrulyLargeNumbers.html

**Multiple comparisons**

- Gelman, A., & Loken, E. (2014). The statistical crisis in science. *American Scientist*, 102(6), 460–465. https://www.americanscientist.org/article/the-statistical-crisis-in-science
- Simmons, J. P., Nelson, L. D., & Simonsohn, U. (2011). False-positive psychology. *Psychological Science*, 22(11), 1359–1366. https://doi.org/10.1177/0956797611417632
- Benjamini, Y., & Hochberg, Y. (1995). Controlling the false discovery rate. *JRSS Series B*, 57(1), 289–300. https://doi.org/10.1111/j.2517-6161.1995.tb02031.x

**Conspiracy-belief psychology**

- Douglas, K. M., Sutton, R. M., & Cichocka, A. (2017). The psychology of conspiracy theories. *Current Directions in Psychological Science*, 26(6), 538–542. https://doi.org/10.1177/0963721417718261
- van Prooijen, J.-W., & Douglas, K. M. (2018). Belief in conspiracy theories: Basic principles of an emerging research domain. *European Journal of Social Psychology*, 48(7), 897–908. https://doi.org/10.1002/ejsp.2530
- van Prooijen, J.-W., Douglas, K. M., & De Inocencio, C. (2018). Connecting the dots: Illusory pattern perception predicts belief in conspiracies and the supernatural. *European Journal of Social Psychology*, 48(3), 320–335. https://doi.org/10.1002/ejsp.2331
- Imhoff, R., & Bruder, M. (2014). Speaking (un-)truth to power: Conspiracy mentality as a generalised political attitude. *European Journal of Personality*, 28(1), 25–43. https://doi.org/10.1002/per.1930
- Wood, M. J., Douglas, K. M., & Sutton, R. M. (2012). Dead and alive: Beliefs in contradictory conspiracy theories. *Social Psychological and Personality Science*, 3(6), 767–773. https://doi.org/10.1177/1948550611434786
- van Prooijen, J.-W., Wahring, I., Mausolf, L., Mulas, N., & Shwan, S. (2023). Just dead, not alive: Reconsidering belief in contradictory conspiracy theories. *Psychological Science*. https://doi.org/10.1177/09567976231158570
- Miani, A., & Lewandowsky, S. (2024). Still very much dead and alive: Re-reconsidering belief in contradictory conspiracy theories. Preprint. https://doi.org/10.31219/osf.io/t6a54

**Documented conspiracies (primary/official sources)**

- U.S. Senate, Select Committee on Intelligence & Subcommittee on Health and Scientific Research (1977). *Project MKULTRA, the CIA's Program of Research in Behavioral Modification*, 3 August 1977. https://www.intelligence.senate.gov/1977/08/03/hearings-joint-hearing-subcommittee-health-and-scientific-research-committee-human-resources-project/
- U.S. Senate Select Committee on Presidential Campaign Activities (1974). *Final Report* (Ervin Committee). https://www.senate.gov/about/resources/pdf/watergate-final-report-1974.pdf
- *United States v. Nixon*, 418 U.S. 683 (1974). https://www.govinfo.gov/app/details/USREPORTS-418/USREPORTS-418-683
- U.S. Centers for Disease Control and Prevention. *About the Untreated Syphilis Study at Tuskegee*. https://www.cdc.gov/tuskegee/about/index.html
- U.S. CFTC (2012). *CFTC Orders Barclays to Pay $200 Million Penalty…* Release 6289-12. https://www.cftc.gov/PressRoom/PressReleases/6289-12
- U.K. FCA (2012). *Barclays fined £59.5 million…* https://www.fca.org.uk/news/press-releases/barclays-fined-%C2%A3595-million-significant-failings-relation-libor-and-euribor
- U.S. CFTC (2015). *Deutsche Bank to Pay $800 Million Penalty…* Release 7159-15. https://www.cftc.gov/PressRoom/PressReleases/7159-15
- U.S. EPA (2015). *Notice of Violation, Clean Air Act — Volkswagen*, 18 September 2015. https://www.epa.gov/sites/default/files/2015-10/documents/vw-nov-caa-09-18-15.pdf
- U.S. DOJ (2016). *United States Files Complaint Against Volkswagen, Audi and Porsche…* https://www.justice.gov/archives/opa/pr/united-states-files-complaint-against-volkswagen-audi-and-porsche-alleged-clean-air-act

**Network science**

- Barabási, A.-L., & Albert, R. (1999). Emergence of scaling in random networks. *Science*, 286(5439), 509–512. https://doi.org/10.1126/science.286.5439.509
- Watts, D. J., & Strogatz, S. H. (1998). Collective dynamics of 'small-world' networks. *Nature*, 393, 440–442. https://doi.org/10.1038/30918
- Travers, J., & Milgram, S. (1969). An experimental study of the small world problem. *Sociometry*, 32(4), 425–443. https://doi.org/10.2307/2786545
- Maslov, S., & Sneppen, K. (2002). Specificity and stability in topology of protein networks. *Science*, 296(5569), 910–913. https://doi.org/10.1126/science.1065103
- Milo, R., Shen-Orr, S., Itzkovitz, S., Kashtan, N., Chklovskii, D., & Alon, U. (2002). Network motifs: simple building blocks of complex networks. *Science*, 298(5594), 824–827. https://doi.org/10.1126/science.298.5594.824
- Newman, M. E. J. (2003). The structure and function of complex networks. *SIAM Review*, 45(2), 167–256. https://doi.org/10.1137/S003614450342480
- Fellegi, I. P., & Sunter, A. B. (1969). A theory for record linkage. *JASA*, 64(328), 1183–1210. https://doi.org/10.1080/01621459.1969.10501049
- Simpson, E. H. (1951). The interpretation of interaction in contingency tables. *JRSS Series B*, 13(2), 238–241. https://doi.org/10.1111/j.2517-6161.1951.tb00088.x
- Robinson, W. S. (1950). Ecological correlations and the behavior of individuals. *American Sociological Review*, 15(3), 351–357. https://doi.org/10.2307/2087176

---

## 13. UNVERIFIED / could not confirm

Listed so that nothing above is read as more certain than it is.

1. **Conrad's original German wording.** I could not access the 1958 primary text or a scan of it. The English phrases *"unmotivated seeing of connections"* and *"specific feeling of abnormal meaningfulness"* are the standard rendering carried by Britannica and Wikipedia; I could not verify the exact German source sentence.
2. **The full stage sequence of Conrad's phase model.** *Trema* and *Apophänie* are well attested. Search results also mentioned *Überstieg*, *Anastrophé*, *Apokalypse*, and *Konsolidierung*/*Residuum*, but sources disagreed on the ordering and on what *anastrophe* denotes (one summary described it as a restructuring of reality around the perceived connections; another treated it as a distinct terminal consolidation phase). **The precise definition and ordering of the post-apophany stages is UNVERIFIED** and no substantive claim in this document depends on it.
3. **Diaconis & Mosteller's verbatim phrasing of the law of truly large numbers.** Both PDF copies I retrieved were scanned images without an extractable text layer. The attribution and the formulation *"with a large enough sample, any outrageous thing is likely to happen"* are taken from Wolfram MathWorld and from the paper's standard secondary characterisation, not from my own reading of the page. Treat the *phrasing* as secondary-sourced; the *attribution* is well established.
4. **The Graham & Spencer quotation.** "Complete disorder is an impossibility" is reported by search of the *Scientific American* article page; I did not read the paywalled full text. The mathematical statement of Ramsey's theorem given in §5.2 is standard and does not depend on the quotation.
5. **Milgram (1967) *Psychology Today* pagination.** Sources conflict (volume 1 vs 2; pp. 60–67 vs 61–67). I therefore cite **Travers & Milgram (1969), *Sociometry*** instead, which is verified. The 1967 *Psychology Today* article is real but its exact volume/pages are UNVERIFIED here.
6. **The hot-hand literature's current state.** Gilovich, Vallone & Tversky (1985) is verified as published. Post-2015 reanalyses (concerning a selection bias in streak estimators) were referenced in search results but I did not verify a specific rebuttal paper's citation, so none is given. The contestation is flagged in §5.1 as a caveat, not asserted with a citation.
7. **Guthrie (1993) publisher/edition details.** *Faces in the Clouds: A New Theory of Religion*, Oxford University Press, 1993 — confirmed as the work referenced across the HADD literature, but I did not verify edition or pagination against a catalogue record.
8. **Shermer, *The Believing Brain* (2011) publisher.** Listed as Times Books/Henry Holt from general knowledge and the author's own site; the site was not fetched to confirm imprint and year.
9. **Exact aggregate LIBOR penalty figures.** Individual figures cited (Barclays CFTC $200m, FCA £59.5m, DOJ $160m; Deutsche Bank CFTC $800m) come from the linked official releases. Aggregate totals circulating in secondary coverage (e.g. "$2.519bn for Deutsche Bank across all regulators") were **not** independently verified against every constituent order and are not asserted here.
10. **Schizotypy–conspiracy correlation magnitude (r ≈ .30).** This figure appeared in search summaries of meta-analytic work (attributed to a Bayesian three-level meta-analysis of 686 correlations from 127 samples). I could not confirm the specific paper and effect size against the article itself, so it is presented in §1.2 as approximate and directional only. The Bowes, Costello & Tasimi (2023) citation *is* verified; the specific r value is not drawn from it.
11. **Barrett (1998).** The task brief mentioned a 1998 Barrett work. I verified only Barrett (2000, *TiCS*). Any 1998 Barrett citation is UNVERIFIED and omitted.
