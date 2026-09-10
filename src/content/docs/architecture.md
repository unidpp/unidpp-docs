---
title: Architecture pointers
description: Where the framework lives — the fourteen invariants, layers, seams, and tiers on the main site — and the running deployment map.
---

The framework itself — the fourteen invariants, the six layers, the lens
model, profile axes, capability classes, the twin axis, the trust model — is
documented on [the main site](https://www.unidpp.org/framework/). These docs
do not duplicate it; they point at it and map it onto the running deployment
you operate.

## The framework, where it is written down

- [Framework overview](https://www.unidpp.org/framework/) —
  [architecture and the six layers L0-L5](https://www.unidpp.org/framework/#architecture),
  [the fourteen invariants](https://www.unidpp.org/framework/#invariants),
  [the lens model](https://www.unidpp.org/framework/#lens),
  [profile axes](https://www.unidpp.org/framework/#axes),
  [capability classes S0-S3](https://www.unidpp.org/framework/#capability),
  [the twin axis](https://www.unidpp.org/framework/#twin),
  [resilience and the degradation ladder](https://www.unidpp.org/framework/#resilience),
  [the trust model](https://www.unidpp.org/framework/#trust).
- [Framework structure](https://www.unidpp.org/framework/structure/) — the
  seams between components.
- [Standards map](https://www.unidpp.org/framework/standards/) — every layer
  as an existing international standard or published open system; the
  framework adds no proprietary layer.
- [Trust model](https://www.unidpp.org/framework/trust/).
- The specification parts: [index](https://www.unidpp.org/specs/) —
  framework, profiles, events/identity/transforms, tiers and trust,
  conformance.

## Invariants you meet as an operator

The invariants surface operationally. A few examples, with where you bump
into them in these docs:

| Invariant | Where it shows up |
|---|---|
| Enumeration resistance (I12) | the [log](/services/log/) exposes no listing surface; the [gateway](/services/gateway/) answers identical 404 bytes for unknown and unresolvable ids |
| Append-only event sourcing | every service journal; [backup and restore](/operators/backup-restore/) |
| State-machine legitimacy (I6) | the [issuer](/services/issuer/) rejects lifecycle events that do not follow the machine |
| Graded trust (I9) | the [projector](/services/projector/)'s per-element trust markers and selection gates |
| No-load-bearing-proprietary layer | the whole [manifest](/operators/manifest/) — a deployment is data, rendered into open processes' environments |

The numbered invariants are enumerated on
[the framework page](https://www.unidpp.org/framework/#invariants) — the
authoritative list, not this table.

## The running deployment map

What the pilot actually runs, service by service, and which framework seam
each occupies:

| Service | Port (reference) | Tier/seam | Role |
|---|---|---|---|
| [registry](/services/registry/) | 8390 | register | ISO 19135 items, discovery (C3/C4/C5), units, EXPRESS models, cross-register mappings |
| [trust](/services/trust/) | 8391 | trust | SIGNATIF trust graph, lists, master list, revocations |
| [log](/services/log/) | 8392 | transparency | RFC 6962 commitments, receipts, tree heads |
| [issuer](/services/issuer/) | 8393 | issuance | passport lifecycle, typed events, Tier-A packs, verdicts |
| [projector](/services/projector/) | 8394 | projection | lens views (EU/JP), presentation renders |
| [gateway](/services/gateway/) | 8395 | interop | UNTP triad + EN 18222 renders, UNTP ingest |
| [archive](/services/archive/) | 8396 | Tier-C | OAIS notarized snapshots, log-anchored |
| [console](/services/console/) | 8389 | operations | the manifest surface |
| registry (JP peer) | 8399 | federation | the national-peer node — see [running a national peer](/federation/jp-peer/) |

The tiers (A: the offline pack; B: the online passport; C: the notarized
archive) are defined in the framework's
[tiers and trust specification part](https://www.unidpp.org/specs/);
operationally, Tier A is what the CLI verifies offline, Tier B is what the
issuer serves, Tier C is what the archive notarizes and anchors.

## The specification

The framework specification — the model, tiers, trust, federation,
conformance classes, and the operations-and-durability clause — is
published at
[www.unidpp.org/unidpp-spec](https://www.unidpp.org/unidpp-spec/),
compiled from the [unidpp-spec](https://github.com/unidpp/unidpp-spec)
repository on every push (a broken clause fails its CI).

## The grid and the cross-border seam

Phase 1 and 2 of the build contract are implemented and
demonstrated on every merge (the G-GRID beat in `make demo`):

- **The segment grid** — one subject, parallel policy-defined
  sovereignty segments (open, pairing-gated, origin-sealed,
  escrowed), each governed by an authority-SIGNED policy object; a
  commitment spine proves existence, currency and append-only
  growth without opening any segment ([unidpp-grid] in core,
  signing in signatif).
- **S13** — the cross-border choreography: request → policy
  evaluation → permit / deny / attestation offer / escalation,
  denial stated never silent, responses citing the governing
  policy (core's `unidpp-s13`).
- **Sovereign attestation substitution** — statements ABOUT sealed
  commitments (never contents), high-stakes claims quorum
  co-signed, verified under the verifier's own anchors; verdicts
  grade evidence verified-direct / attested-by-authority
  (signatif's sovereign seam).
- **Acceptance + coverage reports** — the RECEIVING profile decides
  what counts as evidence (anchored services, claim classes, quorum
  strength, freshness, per-element truth modes); the verdict is a
  first-class coverage report object naming the governing policies.
- **Document orientation** — the dossier: everything a foreign
  verifier needs as signed documents; `unidpp dossier <path>`
  re-derives the verdict offline with zero calls to foreign
  systems. The spine anchors in the transparency log (one chain)
  and the receipt rides the dossier.
- **Canonical interop** — Annex B of the spec states the canonical
  encoding and domain separation normatively; golden vectors are
  CI-replayed, so an independent implementation reproducing their
  digests is conformant.

Run it: `unidpp grid` — the CN battery case (static verified-direct,
dynamic attested under policy cn-dynamic-bms, acceptance decided) in
fifteen checks; `unidpp grid --dossier <path>` + `unidpp dossier
<path>` for the offline verdict.

[unidpp-grid]: https://github.com/unidpp/unidpp-core/tree/main/crates/grid
