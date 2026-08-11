---
name: evidence-tiering
description: Assign an evidence tier to a claim before it enters the ICIP graph, and write its falsifier, base rate, innocent reading and denial. Use whenever adding an allegation, a correlation, a "connection", or any edge that could imply wrongdoing.
---

# Evidence Tiering

Every claim in this project carries a tier. The tier is not a label you attach at
the end — it is the outcome of running the tests below. Run them in order and stop
at the first failure.

## Step 1 — The date test (cheapest, highest yield)

Write the claim as `<actor> <did> <thing> <when>`. Then write the actor's tenure
or ownership window. If they do not overlap, the claim is **COLLAPSED**. Stop.

In the reference corpus for this project, four of seven circulating allegations
died here. When a set of allegations is assembled around a *person* rather than a
*timeline*, chronology is the first thing lost and the cheapest thing to check.

## Step 2 — The identity test

Is this the same entity? Required for a person: at least one of DIN, constituency,
office held with dates, DOB, or PAN fragment. Name match alone is never sufficient.
"Joshi", "Sharma", "Reddy", "Patel", "Singh", "Kumar", "Gupta" and "Yadav" will
each return dozens of unrelated people in any corruption-keyword search.

If identity cannot be confirmed, create the node with `resolved: false` and a
`collisionRisk` note. Do not draw the edge.

## Step 3 — The base-rate test

Compute: what fraction of *comparable* entities have this same property?

| Observed rate among comparables | Verdict |
|---|---|
| ≥ 80% | Non-discriminating. The edge proves nothing. Drop it or demote to context. |
| 40–80% | Weak. Only usable with a control group and an effect size. |
| 10–40% | Moderate. Worth arguing about. Publish the denominator. |
| < 10% and specific | Discriminating. This is where attention belongs. |

Always publish the denominator in the UI, not just the numerator.

## Step 4 — Write the falsifier before looking further

State the specific, findable evidence that would kill the claim. If you cannot
name any, the claim is unfalsifiable and does not belong in the graph.

Good falsifier: "If the rule change preceded the lobbying letter, the sequence
argument fails." Bad falsifier: "If there were no corruption."

## Step 5 — Assign the tier

| Tier | Requirement |
|---|---|
| `documented` | Primary record: gazette, filing, court order, audit report, RTI reply, official portal. Or two independent credible sources. |
| `reported` | One credible outlet with named sourcing or published underlying documents. |
| `alleged` | A named party asserts it. **Must** ship with the denial as a `contra` edge. |
| `analytic` | Our own comparison. **Must** ship with an `innocentReading`. Implies no wrongdoing. |

## Step 6 — Capture the denial

Find what the accused party said. If they denied it, that denial is a first-class
`contra` edge rendered as prominently as the claim. If they were asked and did not
respond, record that. If they were never asked, record that too — it is a weakness
in the claim, not a neutral fact.

## Step 7 — Record the upgrade/kill condition

Every non-`documented` claim carries `upgradeIf` and `killIf` strings. These become
the watchlist. A claim with no path to resolution is a dead end and should be marked as one.

## The absence rule

A documented void — a large beneficiary with zero traceable donations, a decision
with no recorded file noting, a question nobody has asked — is a **finding**. Render
it as loudly as a presence. A graph that can only show what exists systematically
overstates the case.

## What this skill will not do

Assert guilt. Name a private individual in an allegation without a public record.
Fuse entities on name match. Invent a source, figure, date or quote.
