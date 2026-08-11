---
name: graph-schema
description: The ICIP knowledge-graph data model — node/edge/motif types, tiers, predicates, families, and the validation rules. Use when reading, extending, or querying src/graph/.
---

# Graph Schema

Defined in `src/graph/schema.ts`; validated by `npm run validate`.

## Node

```ts
{
  id: string            // stable kebab-case slug, never reused
  label: string
  sub?: string          // one-line qualifier shown under the label
  ty: NodeType          // ministry|psu|agency|company|shell|person|party|fund|trust|sangh|law|mechanism|state|industry|exchange
  fam: NodeFamily       // state|capital|recipient|instrument|enforce|market  → drives hue
  st?: StateCode|null   // map state; null = network-only node
  sz: 1|2|3|4           // visual weight
  al?: string[]         // aliases — the entity-resolution surface
  resolved?: boolean    // false = identity not confirmed; renders with a warning and takes no edges
  collisionRisk?: string
  d?: string[]          // facts, each ending with a bracketed tier marker
  srcs?: Source[]       // [label, url][]
}
```

`ty` drives shape, `fam` drives hue, `sz` drives size. Three orthogonal channels —
never overload one.

## Edge

```ts
{
  s: NodeId; t: NodeId
  pred: Predicate       // award|bond|trust|direct|pmin|pmout|csr|own|family|role|law|enforce|contra|supersede|analytic|hq|listed|sector
  tier: Tier            // documented|reported|alleged|analytic
  a?: number            // amount in ₹ crore, 0 if not monetary
  lab?: string
  d?: string
  from?: string; to?: string     // ISO dates — the window this edge is true in
  srcs?: Source[]
  innocentReading?: string       // REQUIRED when tier === 'analytic'
  upgradeIf?: string; killIf?: string
  supersededBy?: EdgeId
  m?: MotifId[]
}
```

### The provenance invariant

`srcs.length > 0 || tier === 'alleged' || tier === 'analytic'`

Enforced in `scripts/validate.mjs`. CI fails on violation. There is no override.

### Three special predicates

- `contra` — a denial or counter-evidence. Rendered as prominently as its target.
  Never suppressed, never collapsed into a footnote.
- `supersede` — a fact update. The superseded edge is **retained and addressable**,
  marked, and still queryable. Nothing is ever deleted from this graph.
- `analytic` — our own comparison. Carries no causal claim. Requires
  `innocentReading`. Rendered in a visually distinct, deliberately unexciting style.

## Motif

```ts
{
  id, name, tier,
  pattern: string        // declarative path pattern over typed edges + time window
  note: string           // what the pattern is
  innocentReading: string // REQUIRED — the boring explanation that also fits
  census: { members: number; population: number }  // numerator AND denominator
  zScore?: number        // vs degree-preserving null model, ≥1000 rewirings
  upgradeIf, killIf
}
```

Motifs are **computed from the pattern at build time**, not hand-tagged on edges.
A hand-tagged motif is an assertion wearing the costume of a query.

## Validation rules (all enforced in CI)

1. Every edge satisfies the provenance invariant.
2. Every `analytic` edge and every motif has a non-empty `innocentReading`.
3. Every edge endpoint resolves to an existing node.
4. No node with `resolved: false` is an endpoint of any edge.
5. Every `supersede` target still exists.
6. `tier` and `pred` are in their enums.
7. Every motif census has `population > 0` — a numerator without a denominator is not a finding.
8. No duplicate node ids; no alias collides with a different node's id or alias.
