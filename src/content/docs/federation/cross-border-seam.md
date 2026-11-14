---
title: The cross-border seam (S13)
description: The system-to-system request across a border — the signed choreography, the governing policy's outcomes, the journal replay, and the estate surface that serves it.
spec_clauses: ["12"]
---

A verifier in one jurisdiction asks a question about a subject whose
data lives under another jurisdiction's policy. The cross-border seam
is the system-to-system request that carries that question and its
answer (clause 12). The verifier requests a segment view; the
custodian's governing policy answers. The outcome is one of four
machine-reproducible forms, derived from the governing policy's reveal
class: `permit` for an open class, `permit-paired` for a pairing-gated
class, `attestation-offer` for an origin-sealed class (a sovereign
attestation about the class substitutes for its contents), and
`escalation` for an escrowed class (a threshold-trustee ceremony).
Denial is stated with its reason, never silent. The response binds to
the request's digest and cites the governing policy's identifier and
version.

## The signed choreography

Both directions sign. The verifier signs its request's canonical
bytes, and the custodian signs its answer's canonical bytes, each in
the S13-message domain (`UNIDPP-SIGNATIF/S13-MESSAGE`, Annex B
Table B.2); the canonical framing length-prefixes every field,
little-endian throughout (Annex B). A signature verifies only under
the declared signer's registered key, so a valid signature from any
other node does not count as this request.

Offers and refusals of record carry a second signature: the policy
authority counter-signs the answer's identity and its place in the
per-(subject, custodian) sequence. A dispute is therefore decided
from the record — who answered, under which policy, at which point in
the sequence. A replayed offer carries a stale sequence and fails.
Both sides journal the exchange, and the choreography replays from
the journal alone: every journaled entry verifies under the trust
graph, every answer binds to a journaled request's digest, and the
decisions come back in journal sequence.

## The estate surface

The estate serves the seam behind the `/s13` prefix on every
deployment — the Cloudflare Worker's tenants and the self-hosted
one-binary release alike, the same routes, the same wire, the same
seed degrades — tenanted like every other surface on the edge:

| Endpoint | What it does |
|---|---|
| `GET /s13/custodian` | the custodian's and the authority's public keys and key ids |
| `GET /s13/nodes`, `POST /s13/nodes` | the trust-graph projection: register a verifier's node under its public key |
| `GET /s13/policies`, `POST /s13/policies` | the grid policies this custodian answers under, by identifier and version |
| `GET /s13/segments`, `POST /s13/segments` | the segment pins: which registered policy governs which segment |
| `POST /s13/requests` | the signed exchange: a signed request in, the custodian's signed answer out |
| `POST /s13/countersign` | the authority's counter-signature over a journaled answer's place |
| `GET /s13/journal` | the replay: every entry verifies, every answer binds, the decisions return in sequence |
| `POST /s13/route/encode` | a verification route's canonical bytes and digest (the replayable trace) |
| `POST /s13/coverage/encode` | a coverage report's canonical bytes and digest |
| `POST /s13/compose` | the composition law: the effective interop level over the six layers and the policy cap, with the bottleneck layer named |

A tenant's seam carries its own node registry, its own policies, and
its own journal. `registry-jp.unidpp.org` — the JP peer host — serves
its own seam: a registration, policy, or journaled exchange on the JP
tenant is absent from `app.unidpp.org`'s, and the reverse.

## Participating as a foreign verifier

The verifier's duties are four. First, generate an Ed25519 keypair
and register the public key with the custodian's node registry,
under the node identifier the policy's verifier set will name.
Second, frame the signature exactly as the spec defines: the
S13-message tag, one zero byte, then the request's canonical bytes —
the five fields (verifier, subject, profile, segment, moment), each
length-prefixed. Third, post the signed request to
`/s13/requests` and verify the answer locally against the
custodian's published key from `/s13/custodian`. Fourth, journal what
was sent and received; the custodian's journal replays
independently, and `POST /s13/countersign` returns the authority's
counter-signature for the answer's place, which the verifier checks
under the authority's published key.

The canonical bytes and the digest are pinned by the corpus: the
fixtures in `unidpp-core/crates/s13/fixtures/canonical/` (the
request, the response, the verification route, the coverage report)
and the F2 signed-exchange vector in
`unidpp-signatif/fixtures/canonical/`. An implementation reproducing
those digests is conformant (Annex B.4). The estate's own encoders
reproduce them: on 2026-11-13, the deployed `/s13/route/encode` and
`/s13/coverage/encode` returned the corpus's exact digests on both
`app.unidpp.org` and `registry-jp.unidpp.org`, and a foreign
verifier's freshly generated keypair completed the full journey —
registered, answered, verified locally, journaled, and
counter-signed at sequence 1 — on both hosts.

## What the surface does not do

The dossier encoders canonicalize a route or a report that a caller
supplies as JSON; the estate does not produce coverage entries on a
caller's behalf, because a coverage report is the verifier's own
output from its own journey. The identifier-resolution question —
which passport answers a scanned GTIN — is the resolution surface's
concern, documented in the [resolver API
reference](/api/resolver/). The registry-level reconciliation of two
registers' vocabularies is the cross-register mapping's concern,
documented under [cross-register mappings](/federation/cross-register/).
