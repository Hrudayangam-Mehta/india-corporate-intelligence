---
name: pattern-discipline
description: The anti-apophenia checklist. Run before publishing any "connection", motif, cluster, or coincidence as a finding. Use whenever a pattern in the network data looks meaningful.
---

# Pattern Discipline

Large networks of powerful entities generate striking patterns **by construction**.
Ramsey theory guarantees structure in sufficiently large random graphs; the Law of
Truly Large Numbers guarantees that with enough pairs, extraordinary coincidences
become certainties. A pattern is therefore not evidence. A pattern that a null
model cannot reproduce is evidence.

This skill is the checklist that separates the two. It is a discipline for
analysts, not a diagnosis of anyone.

## Before you look

1. **Write the hypothesis down.** Specific enough to be wrong.
2. **Write the falsifier down.** What would you accept as disproof?
3. **Fix the reference class.** Which entities are the comparison set, and why that set?
4. **Declare the comparison family.** How many pairs/paths/windows will you scan?
   You must know this number before you find anything, or your p-values are fiction.

## The seven traps

| Trap | Why it fools you | Corrective |
|---|---|---|
| **Base-rate neglect** | The link looks damning until you learn 82% of everyone has it | Compute the rate among comparables; publish the denominator |
| **Illusory correlation** | Rare + rare co-occurrences are memorable, so they feel frequent | Build the full 2×2 table, including the cells you didn't notice |
| **Clustering illusion** | Random processes produce clumps; clumps look designed | Compare to a shuffled control, not to your intuition about randomness |
| **Multiple comparisons** | Scan 200 pairs at p<0.05 and ~10 "findings" are guaranteed noise | Benjamini–Hochberg FDR; report raw *and* corrected counts |
| **Hub artefact** | Hubs are central in every scale-free network | Degree-preserving null model; z-score the motif, don't count it |
| **Small-world artefact** | Short paths between any two large Indian entities are the norm | Report the path-length distribution, not the single path you found |
| **Entity-resolution failure** | Name matching fuses unrelated people into one "network" | Confirm identity by DIN/office/dates; unresolved entities get no edges |

## The conjunction check

"A donated to the party **and** won the tender **and** the minister is from the same
state" is *less* probable than any of its conjuncts, but reads as more convincing.
Every clause you add to a story makes it more compelling and less likely. If the
narrative got better when you added detail, you are in the failure mode.

## Contradiction check

Do you hold two claims that cannot both be true? (E.g. "the process was rigged for
X" and "the process was chaotic and unmanaged".) Holding mutually inconsistent
explanations that share a villain is a well-documented marker of pattern-driven
rather than evidence-driven reasoning. Resolve it or drop one.

## The symmetry check — the most important one

Run the identical analysis on a **control set** you have no theory about: an
opposition-governed state, a rival conglomerate, an earlier government. If the
method produces an equally alarming graph there, the method is generating the
finding, not detecting it.

## What this discipline is *not*

It is not a reason to dismiss everything. Documented conspiracies exist and were
proven by exactly this kind of patient, denominator-aware work — MKUltra surfaced
via the Church Committee, Watergate via documents, LIBOR rigging via chat logs,
Volkswagen's defeat device via emissions testing. The goal is **calibration**:
strong claims for strong evidence, weak claims for weak evidence, and explicit
"not established" for the large middle. Blanket credulity and blanket dismissal
are the same error with opposite signs.

## Output

Any motif rendered in the UI must carry: the pattern, the null-model z-score, the
comparison family size, the innocent reading, and the specific evidence that would
upgrade or kill it. If any of those five is missing, it does not ship as a finding —
it ships as a question.
