---
title: UNTP and EN 18222 interop
description: The gateway's two protocol bindings — the UNTP credential triad both directions, and the EN 18222 REST render.
---

No region is the universal envelope. The [gateway](/services/gateway/)
renders the neutral core in foreign protocol shapes — a protocol is a render
profile, not a fork — and imports them back with deterministic identity.
Adding a protocol adds a render profile; the core never grows a region's
fields.

## The UNTP binding

### Render (core → UNTP)

`GET /untp/product/{id}?freshness=` returns the verifiable-credential triad:

- the **DigitalProductPassport VC**,
- the **DigitalConformityCredentials** (profile bindings + inspection
  stamps),
- a **link-resolver entry** anchored at the log head,

plus the verdict over the evidence. Recorded against the reference
deployment:

```sh
$ curl -s -G 'http://127.0.0.1:8395/untp/product/urn%3Aunidpp%3Apassport%3Apilot-e8-j000842' \
    | jq '{source: .rendering.source, outcome: .verdict.outcome,
           signatures_verified: .verdict.coverage.signatures.verified}'
{
  "source": "issuer",
  "outcome": "pass",
  "signatures_verified": 5
}
```

The five signatures are the passport's five lifecycle events, verified
against the issuer's published anchors during the render.

**Identifier mapping**: core `cpid:` identifiers map to `https://unidpp.org/id/`
URIs; the GS1 family maps to `https://gs1.org/voc/` with `(01)/(10)/(21)`
application identifiers. The render names its profile
(`urn:unidpp:profile:render:untp`).

### Ingest (UNTP → core)

`POST /untp/ingest` accepts a UNTP passport VC (bare or as a triad) and mints
a core passport with a **deterministic identity** — idempotent per subject:
submitting the same VC twice yields one core passport, not two. Imported
documents carry an empty event log (their events live in the source regime)
and a receipt recording the origin. Render and ingest are inverse
projections.

## The EN 18222 binding

`GET /en18222/v1/dppsByProductId/{gtin}?representation=full|compressed` —
the EN 18222 REST shape, default `compressed` per the EN. Recorded:

```sh
$ curl -s 'http://127.0.0.1:8395/en18222/v1/dppsByProductId/4006381333931?representation=full' \
    | jq '.dppStatus'
"active"
```

- **full**: the element tree, string-printed values;
- **compressed**: collection-keyed, native JSON values.

The wire field set is mirrored from the freeDPP live-endpoint artifacts (the
conformance corpus keeps both representations as fixtures) — an EN 18222
client sees what it expects, including the frozen-wire rule: no `as_of`
member on the EN 18222 body (the `x-as-of` header still carries it).

## Semantics sources

The renderings are ports, not re-derivations: the UNTP adapter's semantics
come from the Python reference adapters (`unidpp-py`), and the EN 18222 wire
from the freeDPP artifacts. The gateway's discovery document states both
provenances. What that buys an operator: when a question arises — *is this
field part of the compressed representation? does the triad include the
resolver entry?* — the answer lives in the reference implementation and the
conformance corpus, not in prose.

## Degradation and failure behavior

- No upstream, or upstream unreachable → fixtures serve, the render metadata
  names the source (`fixtures`).
- Unknown and deliberately unresolvable ids → identical 404 bytes (I12).
- `?freshness=` on the UNTP render bounds the evidence freshness window the
  verdict applies.

## Which binding do I expose?

The gateway serves both simultaneously; there is no either/or. A deployment
facing EU regulation serves the EN 18222 binding; one facing UNTP
counterparts serves the triad; both come from the same core passports,
signed by the same keyrings, anchored in the same log. The choice of what to
tunnel to the public internet is a per-deployment exposure decision (see
[security posture](/operators/security/#network-posture)).
