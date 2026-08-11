# The Methodology of Exhaustive, Generative Hypothesis Search

*A research dossier on how to enumerate enormous numbers of candidate patterns and still end up with trustworthy findings.*

**Status:** research note / literature review. Companion to `pattern-matching-epistemics.md`, which documents the *failure* side — apophenia, base-rate neglect, the garden of forking paths. This document is its constructive counterpart: the disciplines that make large-scale pattern generation legitimate rather than pathological.

Every citation below was checked against a primary or authoritative secondary source. Items that could not be confirmed are listed in the **UNVERIFIED** section (§11) and are not asserted as fact elsewhere.

---

## Executive summary

A user asks for a system that "creates endless graphs and networks to then question and look further into." Read one way, that is a description of an apophenia machine — a device for manufacturing striking connections at industrial scale. Read another way, it is a description of genome-wide association studies, high-throughput screening, and literature-based discovery, three of the most productive discovery methodologies of the last forty years.

The difference between the two readings is not the number of hypotheses generated. It is six specific commitments, and this dossier is about what each one is and where the evidence for it comes from.

**The central claim, which sounds backwards and is not:**

> **Testing more hypotheses makes results more reliable — provided you test them *all*, and you declare how many.**

The proof case is genetics. Candidate-gene studies tested a handful of biologically plausible genes each, chosen by judgement. They produced thousands of papers and a replication catastrophe: 96% of novel candidate gene-by-environment findings in psychiatry were positive, against 27% of replication attempts (Duncan & Keller, 2011); the 18 most-studied depression candidate genes showed no association with depression in samples up to N = 443,264, and as a set were no more associated with depression than randomly chosen genes (Border et al., 2019). Genome-wide association studies test *every* common variant — of the order of a million effectively independent hypotheses, most biologically implausible — apply a threshold calibrated to exactly that number (5×10⁻⁸), and require replication in an independent cohort. GWAS findings are, in the words of a review devoted to the question, "highly replicable… an unprecedented phenomenon in complex trait genetics" (Marigorta et al., 2018). As of the 2 August 2026 release, the NHGRI-EBI GWAS Catalog holds 1,188,619 curated associations from 7,784 studies.

**Testing 10⁶ hypotheses produced a reliable literature; testing 10 produced a false one.** The reason is not caution. It is that exhaustive enumeration makes the comparison family *knowable*, and a knowable family can be corrected for. A selective search cannot be corrected for, because nobody — including the searcher — can reconstruct how many hypotheses would have been entertained had the data looked different (Gelman & Loken, 2014).

The six commitments that follow from this:

1. **Exploration and confirmation are different activities with different outputs.** Exploration produces hypotheses; only confirmation produces findings. Tukey insisted on both and on not confusing them (Tukey, 1977, 1980). Preregistration is the machinery that keeps the line visible (Nosek et al., 2018); registered reports are the strongest available implementation, and the positive-result rate drops from 96% to 44% when you use them (Scheel, Schijen & Lakens, 2021).
2. **Enumerate exhaustively, not selectively.** The family size is the output of enumeration and must be fixed before any candidate is scored.
3. **Report the whole distribution of defensible analyses, not one path through it.** Specification-curve analysis (Simonsohn, Simmons & Nelson, 2020), multiverse analysis (Steegen et al., 2016), vibration of effects (Patel, Burford & Ioannidis, 2015).
4. **Control error at the scale you are actually working at.** FDR for discovery pipelines (Benjamini & Hochberg, 1995; Storey, 2002), FWER for confirmatory ones, and an honest account of the *effective* number of independent tests when tests are correlated — which graph motifs emphatically are.
5. **Score every candidate against a null model that already knows the boring explanations.** For networks that means a degree-preserving null (Milo et al., 2002; Maslov & Sneppen, 2002) — with the important caveat that motif significance is highly sensitive to which null you choose (Artzy-Randrup et al., 2004).
6. **Publish the funnel, not the gallery.** The honest output of a generator is "N enumerated → M beat the null → K survived FDR at q → J replicated," and every survivor is a *question*, not a claim.

The two things this dossier says most emphatically. First: **a run that finds nothing is a successful run**, and must be reported as prominently as one that finds something — a generator that always finds something is a generator that is not testing anything. Second: **generate the hypotheses that would falsify your favoured claim, not only the ones that would support it.** A test a claim could not have failed establishes nothing about that claim (Mayo, 2018).

---

## 1. The exploratory/confirmatory distinction

### 1.1 Exploration is legitimate, necessary, and not a finding

The distinction is Tukey's, and he defended both halves of it with equal force. *Exploratory Data Analysis* (Tukey, 1977, Addison-Wesley, ISBN 0-201-07616-0) is the founding text; the sharpest statement of the relationship is the three-page paper "We Need Both Exploratory and Confirmatory" (Tukey, 1980, *The American Statistician*, 34(1), 23–25).

Tukey's position, which is the position this platform adopts:

- Exploratory data analysis is "an attitude, a flexibility, and a reliance on display, **not** a bundle of techniques."
- "Neither exploratory nor confirmatory is sufficient alone. To try to replace either by the other is madness."
- The value of an exploratory display is that it "forces us to notice what we never expected to see."

Nothing in the anti-apophenia literature argues against looking. It argues against *reporting what you found by looking as though you had predicted it*. Kerr (1998) named this failure HARKing — Hypothesizing After the Results are Known — presenting a post-hoc hypothesis in a research report as if it had been a priori (*Personality and Social Psychology Review*, 2(3), 196–217, [DOI: 10.1207/s15327957pspr0203_4](https://doi.org/10.1207/s15327957pspr0203_4)).

The output of exploration is a **hypothesis with a known provenance**: this pattern, generated by this enumeration, over this family of size N, ranked this highly. That is a real deliverable. It is not a claim about the world.

### 1.2 What has to happen between exploration and confirmation

Nosek, Ebersole, DeHaven & Mellor (2018), "The preregistration revolution," *PNAS*, 115(11), 2600–2606 ([DOI: 10.1073/pnas.1708274114](https://doi.org/10.1073/pnas.1708274114)) frame it as the difference between **postdiction and prediction**. Their abstract: "Progress in science relies in part on generating hypotheses with existing observations and testing hypotheses with new observations. This distinction between postdiction and prediction is appreciated conceptually but is not respected in practice. Mistaking generation of postdictions with testing of predictions reduces the credibility of research findings."

Three points from that paper matter for a generative engine:

1. **The problem is cognitive, not merely procedural.** Hindsight bias means researchers genuinely cannot reconstruct, after the fact, what they would have predicted. Honesty is not sufficient; a timestamped record is.
2. **Preregistration does not prohibit exploration.** It requires that exploratory and confirmatory analyses be *labelled distinctly*. A preregistration that yields a paper reporting both a confirmatory test and twenty exploratory analyses is a success, provided the twenty are marked.
3. **It works on pre-existing data**, which is the relevant case for a corporate-registry graph. The commitment is made before the analyst has seen the *outcome*, not before the data existed. The paper discusses techniques for this case explicitly.

The stronger implementation is the **Registered Report**: peer review of the question and the method happens *before* results are known, and acceptance is granted in principle on the basis of the design. Chambers (2013), "Registered Reports: A new publishing initiative at Cortex," *Cortex*, 49(3), 609–610 ([DOI: 10.1016/j.cortex.2012.12.016](https://doi.org/10.1016/j.cortex.2012.12.016)) introduced the format.

The empirical payoff is measurable and large. Scheel, Schijen & Lakens (2021), "An Excess of Positive Results: Comparing the Standard Psychology Literature With Registered Reports," *Advances in Methods and Practices in Psychological Science*, 4(2) ([DOI: 10.1177/25152459211007467](https://doi.org/10.1177/25152459211007467)) compared 71 published Registered Reports with a random sample of 152 standard hypothesis-testing psychology articles. Taking the first hypothesis of each article: **96% positive results in the standard literature, 44% in Registered Reports.**

That gap is the size of the distortion introduced by deciding what to report after seeing the results. For a network-pattern generator the number to keep in mind is that a well-run discovery process is expected to return *nothing* most of the time.

### 1.3 The operational translation

| Exploration produces | Confirmation produces |
|---|---|
| Ranked candidate lists with a declared family size | Findings with an error rate |
| Questions ("worth asking about") | Claims ("this is the case") |
| Hypotheses whose prior is now slightly raised | Hypotheses tested against data that did not generate them |
| A survival funnel | A single pre-specified test with a pre-specified falsifier |

The bridge between the columns is **new data, or a partition of the data that the generator did not see**. In GWAS this is the independent replication cohort. In a graph engine it is a split-half over edges, a later time window, or — best — a documentary source outside the graph entirely.

---

## 2. GWAS: why testing more hypotheses made the results more reliable

This is the intellectual core of the dossier. It is the one case where a field ran the experiment: the same scientific question, attacked first by selective hypothesis testing and then by exhaustive hypothesis testing, with the outcomes visible a decade apart.

### 2.1 The candidate-gene era and its collapse

The candidate-gene approach picked a small number of genes with a plausible biological story — a serotonin transporter for depression, a dopamine receptor for reward behaviour — and tested those. It was defensible in every respect except its results.

**The warning came early.** Ioannidis, Ntzani, Trikalinos & Contopoulos-Ioannidis (2001), "Replication validity of genetic association studies," *Nature Genetics*, 29(3), 306–309 ([PubMed 11600885](https://pubmed.ncbi.nlm.nih.gov/11600885/)) meta-analysed 370 studies covering 36 genetic associations and found that significant between-study heterogeneity was frequent, that the first study's result correlated only modestly with subsequent research, and that **the first study typically reported a stronger genetic effect than later work found** — the winner's curse, visible in 2001.

**The systematic audit.** Duncan & Keller (2011), "A critical review of the first 10 years of candidate gene-by-environment interaction research in psychiatry," *American Journal of Psychiatry*, 168(10), 1041–1049 ([DOI: 10.1176/appi.ajp.2011.11020191](https://doi.org/10.1176/appi.ajp.2011.11020191)) extracted data from all 103 published cG×E studies from 2000–2009. The headline numbers:

- **96% of novel cG×E studies were significant.**
- **27% of replication attempts were significant.**
- Positive replication attempts had *smaller* average sample sizes than negative ones — the signature of publication bias operating on the replication literature too.
- Power calculations on the observed sample sizes indicated the studies were badly underpowered, so that "most or even all positive cG×E findings represent type I errors."

**The obituary.** Border, Johnson, Evans, Smolen, Berley, Sullivan & Keller (2019), "No support for historical candidate gene or candidate gene-by-interaction hypotheses for major depression across multiple large samples," *American Journal of Psychiatry*, 176(5), 376–387 ([DOI: 10.1176/appi.ajp.2018.18070881](https://doi.org/10.1176/appi.ajp.2018.18070881)) empirically identified the 18 genes that had been studied ten or more times in depression research and tested them in samples ranging from N = 62,138 to N = 443,264, using preregistered analyses across multiple definitions of depression and multiple environmental moderators.

Result: "No clear evidence was found for any candidate gene polymorphism associations with depression phenotypes or any polymorphism-by-environment moderator effects. **As a set, depression candidate genes were no more associated with depression phenotypes than noncandidate genes.**" They further showed measurement error could not explain the nulls, and concluded that "the large number of associations reported in the depression candidate gene literature are likely to be false positives."

Two corroborating collapses, because one case is an anecdote:

- **Intelligence.** Chabris et al. (2012), "Most Reported Genetic Associations With General Intelligence Are Probably False Positives," *Psychological Science*, 23(11), 1314–1323 ([DOI: 10.1177/0956797611435528](https://doi.org/10.1177/0956797611435528)) attempted to replicate published associations between general intelligence and 12 specific variants across three longitudinal samples (N = 5,571; 1,759; 2,441). Of 32 independent tests, **1 was nominally significant** where power analysis predicted 10–15.
- **5-HTTLPR × stress**, the single most cited candidate G×E result in psychiatry. Risch et al. (2009), *JAMA*, 301(23), 2462–2471 ([PubMed 19531786](https://pubmed.ncbi.nlm.nih.gov/19531786/)) meta-analysed 14 qualifying studies and found no association between genotype and depression and no genotype × stress interaction. Culverhouse et al. (2018), *Molecular Psychiatry*, 23(1), 133–142 ([PubMed 28373689](https://pubmed.ncbi.nlm.nih.gov/28373689/)) ran a collaborative individual-level meta-analysis over 31 studies and 38,802 participants of European ancestry and again found no support for the interaction.

### 2.2 What GWAS did differently

A genome-wide association study genotypes hundreds of thousands to millions of variants across the genome and tests **every one** against the phenotype. It does not use biological plausibility to choose which to test. The landmark demonstration is the Wellcome Trust Case Control Consortium (2007), "Genome-wide association study of 14,000 cases of seven common diseases and 3,000 shared controls," *Nature*, 447(7145), 661–678 ([DOI: 10.1038/nature05911](https://doi.org/10.1038/nature05911)), which examined ~2,000 cases for each of seven diseases against ~3,000 shared controls on a 500K array and reported 24 independent association signals at P < 5×10⁻⁷.

Three structural features make it work, and all three transfer directly to graph pattern search.

**(a) The family size is knowable because the search is exhaustive.**

You cannot count the hypotheses a candidate-gene literature considered, because the counting would have to include every gene any researcher *would have* tested had the pilot data pointed elsewhere, plus every phenotype definition, every subgroup, every genetic model. That number does not exist. In a genome-wide scan it does exist: it is the number of variants on the array, adjusted for correlation between them.

**(b) The threshold is calibrated to that number.**

The genome-wide significance threshold of **5×10⁻⁸** is, to a first approximation, a Bonferroni correction of α = 0.05 over **one million effectively independent tests**: 0.05 / 10⁶ = 5×10⁻⁸.

The "one million" is not a guess. Because nearby variants are in linkage disequilibrium, the ~10⁷ common variants in the genome behave like far fewer independent tests, and two groups estimated how many:

- **Pe'er, Yelensky, Altshuler & Daly (2008)**, "Estimation of the multiple testing burden for genomewide association studies of nearly all common variants," *Genetic Epidemiology*, 32(4), 381–385 ([DOI: 10.1002/gepi.20303](https://doi.org/10.1002/gepi.20303)) used International HapMap data to estimate a testing burden of **~1 million independent tests genome-wide in Europeans, and roughly twice that in Africans** — the higher figure following from shorter LD blocks in African populations.
- **Dudbridge & Gusnanto (2008)**, "Estimation of significance thresholds for genomewide association scans," *Genetic Epidemiology*, 32(3), 227–234 ([DOI: 10.1002/gepi.20297](https://doi.org/10.1002/gepi.20297)) came at it by permutation, subsampling markers at increasing density and extrapolating to genome saturation with a fitted Monod function. They obtained **7.2×10⁻⁸ (95% CI 6.3–8.9×10⁻⁸)** for two-sided tests in a UK Caucasian population, and note earlier estimates of 5×10⁻⁸ (Risch & Merikangas, 1996) and 5.5×10⁻⁸ (International HapMap Consortium, 2005).

Two things to notice. First, the threshold is a *property of the search space*, not of any hypothesis in it — it is the same for a variant with a beautiful biological story and one in a gene desert. Second, the estimates converge on the same order of magnitude by unrelated methods, which is why the field settled on one number and stopped arguing.

**(c) Replication in an independent cohort is required, not optional.**

The NCI-NHGRI Working Group on Replication in Association Studies (2007), "Replicating genotype–phenotype associations," *Nature*, 447(7145), 655–660 ([DOI: 10.1038/447655a](https://doi.org/10.1038/447655a)) set out what counts as a replication: an independent dataset, adequate sample size, the same phenotype definition, a comparable study population, and the same variant assessed in the same direction of effect. This became an editorial requirement at the major journals, which is the enforcement mechanism that made it stick.

### 2.3 Why this made results *more* reliable, stated precisely

Four mechanisms, and it is worth separating them because a graph engine needs all four.

1. **The comparison family becomes real.** A correction is only honest if the denominator is honest. Exhaustive enumeration produces an honest denominator; selective search produces an unknowable one. This is the whole argument in one sentence.
2. **The threshold becomes brutal, which selects for large effects or large samples.** 5×10⁻⁸ is roughly a Z of 5.45. Candidate-gene studies with N in the hundreds could clear p < 0.05 on noise; nothing clears 5×10⁻⁸ on noise at that sample size. The threshold forced consortium-scale collaboration, which fixed the power problem as a side effect.
3. **Prior plausibility stops doing work it cannot do.** Duncan & Keller's power analysis makes the Bayesian point: with low power and a low prior probability that any given cG×E hypothesis is true, a "significant" result is more likely to be a type I error than a discovery. Candidate-gene selection *felt* like it raised the prior, because biological stories are persuasive. Empirically it did not: Border et al. found candidate genes performed no better than random genes. **Plausibility judgement added confidence without adding accuracy** — the exact profile of a bias.
4. **Replication is a genuinely independent test.** Because the discovery scan is exhaustive and pre-specified, the replication cohort tests one named variant at one threshold in one direction. That is a confirmatory test in Tukey's sense, and it is severe in Mayo's (§9).

### 2.4 The scale of the result

As of the release dated **2 August 2026**, the NHGRI-EBI GWAS Catalog contains **1,188,619 curated associations** across **7,784 studies** and **560,816 distinct variants**, with 193,739 full summary-statistics datasets ([GWAS Catalog release statistics](https://www.ebi.ac.uk/gwas/api/search/stats); catalogue described in Sollis et al., 2023, *Nucleic Acids Research*, 51(D1), D977–D985, [DOI: 10.1093/nar/gkac1010](https://doi.org/10.1093/nar/gkac1010)).

Marigorta, Rodríguez, Gibson & Navarro (2018), "Replicability and Prediction: Lessons and Challenges from GWAS," *Trends in Genetics*, 34(7), 504–517 ([DOI: 10.1016/j.tig.2018.03.005](https://doi.org/10.1016/j.tig.2018.03.005)) make the point that concerns us: "GWAS findings are highly replicable. This is an unprecedented phenomenon in complex trait genetics, and indeed in many areas of science, which in past decades have been plagued by false positives."

Visscher, Wray, Zhang, Sklar, McCarthy, Brown & Yang (2017), "10 Years of GWAS Discovery: Biology, Function, and Translation," *American Journal of Human Genetics*, 101(1), 5–22 ([DOI: 10.1016/j.ajhg.2017.06.005](https://doi.org/10.1016/j.ajhg.2017.06.005)) is the standard decadal review.

### 2.5 The transfer to graph pattern search

The mapping is close enough to be used as a design specification:

| GWAS | Graph pattern generator |
|---|---|
| Every common variant on the array | Every instance of every declared motif shape |
| Effective number of independent tests (~10⁶, LD-adjusted) | Effective family size, adjusted for overlap between motif instances |
| 5×10⁻⁸ threshold derived from that number | q-threshold applied by Benjamini–Hochberg over the declared family |
| Population-structure control (principal components) | Degree-preserving null model |
| Independent replication cohort | Split-half over edges, later time window, or external documentary source |
| GWAS Catalog: every association, effect size, and p-value published | The survival funnel: N enumerated → M → K → J, published with the nulls |
| Candidate-gene selection by biological plausibility | Selecting which connection to investigate because it looks suspicious |

The last row is the one to sit with. **"This connection looks suspicious, let me query it" is methodologically identical to candidate-gene selection**, and it has the same track record.

One honest disanalogy, which §5 develops: GWAS enjoys a well-understood correlation structure (linkage disequilibrium is measurable and local) and a null model — Hardy-Weinberg equilibrium plus population structure — that is grounded in mechanism. Graph motif nulls are neither. That is a reason to hold graph results to a *lower* confidence ceiling than GWAS results, not a reason to abandon the method.

---

## 3. Specification-curve and multiverse analysis: report the whole distribution

Sections 1 and 2 concern *which hypotheses* you test. This section concerns *how you test each one* — and the finding is that the analytic path is itself a hidden search space, usually larger than the one you were worrying about.

### 3.1 Multiverse analysis — the multiverse of datasets

Steegen, Tuerlinckx, Gelman & Vanpaemel (2016), "Increasing transparency through a multiverse analysis," *Perspectives on Psychological Science*, 11(5), 702–712 ([DOI: 10.1177/1745691616658637](https://doi.org/10.1177/1745691616658637); [open PDF](https://sites.stat.columbia.edu/gelman/research/published/multiverse_published.pdf)).

Their definition: "A multiverse analysis involves performing the analysis of interest across the whole set of data sets that arise from different reasonable choices for data processing." They describe it as "a systematic and organized extension of outlier analysis," closely related to the garden of forking paths (Gelman & Loken, 2013/2014) but scoped specifically to **data processing** — exclusions, transformations, codings — rather than model choice. They are explicit that they "ignored arbitrary choices occurring at the level of statistical models," and suggest crossing the data multiverse with a model multiverse for a fuller treatment.

The worked example is a reanalysis of Durante, Rae & Griskevicius (2013), "The fluctuating female vote: Politics, religion, and the ovulatory cycle," *Psychological Science*, 24(6), 1007–1016 ([DOI: 10.1177/0956797612466416](https://doi.org/10.1177/0956797612466416)), on fertility effects on religiosity and political attitudes. Tabulating the defensible choices — fertility-window definition, next-menstrual-onset estimation, cycle-length exclusions, relationship-status coding, certainty-rating exclusions — gives 180 combinations in Study 1 (120 after dropping internally inconsistent ones) and 270 in Study 2 (210 consistent).

The results are the argument:

- Religiosity, Study 1: **7 of 120** combinations gave a significant Fertility × Relationship interaction; "the remaining 94% lead to p values ranging from .05 to 1.0."
- Fiscal attitudes, Study 2: 8% of 210.
- Religiosity, Study 2: **88 of 210 (42%)**. Social attitudes 49%, voting 46%, donation 57%.

Their conclusion where the multiverse splits: "the only reasonable conclusion on the effect of fertility is that there is considerable scientific uncertainty," and a multiverse that fragments this way signals "a gaping hole in theory or in measurement."

**The graph analogue is exact and uncomfortable.** Before a single motif is counted, a corporate-network analyst has made a long list of individually defensible choices: which registers to include, what date window, whether a dissolved company stays in the graph, whether "possible-link" entity matches are edges, what confidence threshold on name matching, whether registered-agent addresses count as an edge type, whether to keep or drop edges through Big-4 auditors, whether to treat a group as one node or many. Each choice is arguable. Together they define hundreds of graphs. **A finding that holds in one of them is not a finding.**

Network-specific evidence that this is not hypothetical: Burkhardt & Gießing (2026), "The Comet Toolbox: Improving robustness in network neuroscience through multiverse analysis," *Imaging Neuroscience*, 4 ([DOI: 10.1162/IMAG.a.1122](https://doi.org/10.1162/IMAG.a.1122)) built a multiverse framework over 18 dynamic functional-connectivity methods plus graph-theoretic analyses. In a demonstration predicting autism diagnosis from resting-state fMRI, "classification accuracies varied widely across universes, with some pipelines performing close to chance while others achieved accuracies in the range of 70%." Same data, same question, same construction — the pipeline choice was worth up to twenty accuracy points.

### 3.2 Specification-curve analysis — the multiverse of models, with a significance test

Simonsohn, Simmons & Nelson (2020), "Specification curve analysis," *Nature Human Behaviour*, 4(11), 1208–1214 ([DOI: 10.1038/s41562-020-0912-z](https://doi.org/10.1038/s41562-020-0912-z); [author-hosted PDF](https://urisohn.com/sohn_files/wp/wordpress/wp-content/uploads/specification-curve-published-hand-corrected.pdf)). *(A Publisher Correction exists: 4(11), 1215, [DOI: 10.1038/s41562-020-00974-w](https://doi.org/10.1038/s41562-020-00974-w); its content is listed as UNVERIFIED in §11.)*

SCA adds to multiverse analysis the thing a generator most needs: **joint inference across the whole set of specifications**. The three steps, from the abstract:

> "(1) identifying the set of theoretically justified, statistically valid and non-redundant specifications; (2) displaying the results graphically, allowing readers to identify consequential specifications decisions; and (3) conducting joint inference across all specifications."

Step 3 is the methodological contribution. Because "the specifications are neither statistically independent nor part of a single model," the null distribution cannot be derived analytically. So they compute it by **resampling under the null**: shuffle the column of the variable whose effect is being tested, re-estimate *every* specification on the shuffled data, and repeat (they use 500 shuffles, re-running 1,728 specifications each time in one example). The only assumption is exchangeability, so "the resulting P values are hence 'exact', not dependent on distributional assumptions."

They propose three test statistics, computed on the observed specification set and compared against its shuffled null:

1. the **median effect estimate** across specifications;
2. the **share of specifications significant in the predicted direction**;
3. the **average Z across all specifications** (Stouffer's method), which "bypasses arbitrary discretization and is thus preferable from a statistical efficiency perspective."

They recommend reporting (2) and (3). Because specifications are correlated, they plot by *dominant vs non-dominant sign* rather than positive/negative.

The worked results show what the method buys you. In the hurricane-names reanalysis, 37 of 1,728 specifications were significant — but 425 of 500 shuffled null samples reached 37 or more, giving P = 0.85. All three tests were non-significant (P = 0.536, 0.850, 0.512). In a study of callback discrimination against Black-sounding names, 85 of 90 specifications were significant and all three tests gave P < 0.002. Their summary of the three cases they analyse: "one finding is robust, one is weak and one is not robust at all."

**The transferable insight:** "some specifications were significant" is not evidence. The question is whether *more* specifications were significant than a null in which the effect is absent would produce, given the same correlated specification set. This is the same logic as a degree-preserving motif null, applied to analytic choices instead of to edges.

### 3.3 Vibration of effects — quantifying how much the answer moves

Patel, Burford & Ioannidis (2015), "Assessment of vibration of effects due to model specification can demonstrate the instability of observational associations," *Journal of Clinical Epidemiology*, 68(9), 1046–1058 ([DOI: 10.1016/j.jclinepi.2015.05.029](https://doi.org/10.1016/j.jclinepi.2015.05.029); [PMC4555355](https://pmc.ncbi.nlm.nih.gov/articles/PMC4555355/)).

Vibration of effects (VoE) is "the extent to which an estimated association changes under multiple distinct analytical modeling approaches." Their design: NHANES cycles 1999–2000, 2001–2002 and 2003–2004 (9,555 / 11,021 / 10,100 participants with mortality follow-up), **417** clinical, environmental and physiological variables, **13** candidate adjustment covariates — hence **2¹³ = 8,192 Cox models per variable**, all-cause mortality as the outcome.

Two summary metrics, both percentile-based:

- **RHR (relative hazard ratio)** — "the ratio of the 99th percentile and 1st percentile HR."
- **RP (relative P-value)** — "the difference between the 99th and 1st percentile of −log10(p-value)."

The headline result is what they call the **"Janus effect"**: "the estimated HRs can be both greater and less than the null value (HR > 1 and HR ≤ 1) depending on what adjustments were made." **131 of 417 variables (31%) had a 99th-percentile HR above 1 and a 1st-percentile HR below 1** — that is, for nearly a third of exposures, the defensible model set contained both "protective" and "harmful" answers. A further 91 variables (22%) attenuated to p > 0.05 as adjustments increased, while only 53 (13%) stayed significant across all adjustment scenarios. Their conclusion: "When VoE is large, claims for observational associations should be very cautious."

**For the engine, VoE is the cheapest available honesty check.** It requires no new theory: run the candidate under every defensible covariate/filter set and publish the 1st–99th percentile band. If the band straddles the null, the correct output is "unstable under specification," and that is a publishable result in its own right.

### 3.4 What this section demands of a generator

Specification-curve and multiverse analysis are the reason a generator must not be allowed to *choose* its own graph. The declared family (§2.5) has to include the specification dimension, not just the pattern dimension. In practice:

- Fix the graph-construction choices in advance, or enumerate over them explicitly and report the curve.
- Never report the specification that produced the strongest result. Report the median and the share significant, against a shuffled null.
- A candidate that survives in one graph construction and not in the others is a **specification artefact**, and should be labelled as one rather than downgraded to "suggestive."

