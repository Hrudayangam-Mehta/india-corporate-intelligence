---
name: pattern-prospecting
description: Generate candidate patterns from the graph exhaustively and turn them into ranked questions rather than findings. Use when asked to "find connections", "look for patterns", "explore the network", or to run an open-ended search over entities and relationships.
---

# Pattern Prospecting

The constructive counterpart to `pattern-discipline`. That skill tells you why a
pattern you noticed is probably nothing. This one tells you how to look for patterns
*on purpose*, at volume, and still be able to trust what comes out.

## The insight this rests on

**Testing more hypotheses makes results more reliable — provided you test them all,
and declare how many.**

That sounds backwards, so here is the case that settles it.

**Candidate-gene studies** picked a handful of biologically plausible genes and
tested those against a trait. Thousands of papers, a generation of work, and almost
nothing replicated. Border et al. (2019) re-examined the 18 most-studied candidate
genes for depression across large samples and found no support for any of them.

**Genome-wide association studies** test *every* variant — millions of hypotheses,
most of them biologically implausible — apply a significance threshold calibrated to
that number (5×10⁻⁸, roughly Bonferroni over ~1 million independent tests), and
require replication in an independent cohort. GWAS findings hold up.

The difference is not that GWAS was more cautious. It tested vastly *more*. The
difference is that exhaustive testing makes the comparison family **knowable**, and a
knowable family can be corrected for. A selective search cannot be, because you can
never reconstruct how many hypotheses you would have entertained.

This is the answer to "generate endless graphs and question them". Endless is fine.
**Selective is fatal.**

## The procedure

Run these in order. Skipping any one makes the rest worthless.

### 1. Declare the shapes before you look

Write down the *forms* of pattern you will enumerate — multiplex ties, closed
triads, concentrated roles, structural voids. Declaring shapes afterwards, having
seen what the graph contains, is the garden of forking paths wearing a lab coat.

### 2. Enumerate exhaustively

Generate **every** instance of each shape. No ranking, filtering or judgement during
enumeration. The moment the generator can choose what to look at, the family size
becomes fiction.

Include the boring ones. A connected pair with one relationship is a candidate that
scored badly, not a non-candidate. Dropping it before correction shrinks the
denominator and inflates every q-value that survives.

### 3. Fix the family size

The count from step 2 **is** the multiple-comparison family. Record it before any
candidate is scored. This is the number that makes the correction honest.

### 4. Score against a degree-aware null

Every candidate gets a p-value from a null that knows the degree sequence — a
configuration model analytically, or a degree-preserving rewiring empirically. Hubs
connect to things; that is what hubs are. A null that does not know this will hand you
every hub as a discovery.

### 5. Correct across the whole family

Benjamini–Hochberg at a declared q. FDR rather than family-wise error, because this is
a discovery pipeline: the question is *what proportion of what I report will be
wrong*, not *what is the chance I make any error at all*.

Correct over the **declared family**, not over the survivors, and not per-shape unless
each shape was declared as its own family in advance.

### 6. Replicate on a split

Split the edges into halves and require the candidate to survive in both,
independently. This is the replication cohort, and it is the single most effective
filter — most candidates that clear FDR on the full graph do not clear it twice.

### 7. Report the survival rate, never a gallery

The headline output is:

> **N enumerated → M beat the null → K survived FDR at q → J replicated.**

A list of survivors without N is exactly the artefact this platform exists not to
produce. The funnel is the finding; the survivors are the *questions*.

## What the output is, and is not

**Every survivor is a question, not a claim.** The correct verb is "worth asking
about", never "shows" or "reveals". A prospector output hands off to the
`evidence-auditor`, which runs the date test, the identity test and the denial
capture before anything is published.

Concretely, a survivor earns: someone's time. That is all it earns.

## Interpreting a run that finds nothing

**A run with zero survivors is a successful run.** It means the graph's structure is
explained by its degree sequence, which is the honest answer most of the time and the
one a selective search can never give you.

Report it as prominently as a run with survivors. A generator that always finds
something is a generator that is not testing anything.

## The stopping problem

An endless generator needs a stopping rule fixed in advance, or optional stopping
becomes p-hacking: run until something clears, then stop.

Declare either a **fixed enumeration budget** (these shapes, this graph, this q) or a
**fixed schedule** (re-run when the data changes, not when the result disappoints).
Re-running the same search on the same data after seeing the result, with a tweaked
parameter, is a new family and invalidates the old correction.

## Adversarial generation

Generate hypotheses that would **falsify** a favoured claim, not only ones that would
support it. If a claim survives a test it could not have failed, the test established
nothing about it.

In practice: for every pattern found around an entity of interest, run the identical
enumeration on a matched control entity nobody has a theory about. If the control
produces an equally striking set, the method is generating the pattern.

## Shape-specific traps

| Shape | The trap |
|---|---|
| **Multiplex ties** | Two large entities transacting in several registers is ordinary. The test is whether the count exceeds what their degrees predict — not whether it feels like a lot. |
| **Closed triads** | Triangles are compulsory above a density threshold. Ramsey theory guarantees ordered substructure in any sufficiently large graph, with no cause needed beyond size. |
| **Concentrated roles** | A ministry concentrated in "award" edges is a description of what a ministry is. Role specialisation is usually definitional, not discovered. |
| **Structural voids** | The strongest shape here and the easiest to over-read. **An absence in the dataset may be an absence in the world or a hole in coverage, and the engine cannot tell them apart.** Every void goes to the auditor with that caveat attached. |

## What this skill will not do

- Rank candidates by how interesting they look. Ranking is by q-value, full stop.
- Report survivors without the enumerated total.
- Treat a pattern as evidence of intent, coordination or wrongdoing. It is a
  structural observation about a graph built from public records.
- Name a person in a generated pattern. Person nodes enter prospector output only
  where the graph already resolved them by DIN, office or constituency, and even then
  the output is a question for the auditor.
- Re-run with a tweaked threshold after seeing a disappointing result and report the
  second run as if it were the first.
