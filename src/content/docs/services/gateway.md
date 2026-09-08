---
title: Gateway
description: "The unidpp-gateway service — interop renders of the neutral core: UNTP VC triad, EN 18222 REST, and UNTP ingest."
---

The interop gateway renders the neutral core in foreign protocol shapes —
their format is our profile. Both directions: **render** (core → UNTP /
EN 18222) and **ingest** (UNTP → core, with deterministic identity). Adding a
protocol adds a render profile, never a fork. In the reference deployment it
binds `127.0.0.1:8395` with the issuer upstream at 8393.

## Endpoints

| Endpoint | What |
|---|---|
| `GET /` | discovery (bindings, fixtures, upstream mode, conventions) |
| `GET /healthz` | liveness |
| `GET /untp/product/{id}?freshness=` | the UNTP verifiable-credential triad + verdict |
| `POST /untp/ingest` | the import direction: a UNTP passport VC (or triad) mints a core passport; idempotent per subject |
| `GET /en18222/v1/dppsByProductId/{gtin}?representation=full\|compressed` | the EN 18222 REST render (default compressed, per the EN) |

## Examples (recorded)

```sh
$ curl -s 'http://127.0.0.1:8395/en18222/v1/dppsByProductId/4006381333931?representation=full' \
    | jq '.dppStatus'
"active"

$ curl -s -G 'http://127.0.0.1:8395/untp/product/urn%3Aunidpp%3Apassport%3Apilot-e8-j000842' \
    | jq '{source: .rendering.source, outcome: .verdict.outcome,
           signatures_verified: .verdict.coverage.signatures.verified}'
{
  "source": "issuer",
  "outcome": "pass",
  "signatures_verified": 5
}
```

The UNTP render is the VC triad — DigitalProductPassport VC, Digital
Conformity Credentials, and a link-resolver entry anchored at the log head —
with identifier mapping (core `cpid:` ↔ `https://unidpp.org/id/`, GS1 family
↔ `https://gs1.org/voc/` with `(01)/(10)/(21)` application identifiers). See
[UNTP interop](/federation/untp/) for the semantics.

## Conventions

- As-of stamped responses (`x-as-of` header; `as_of` body member except on
  the frozen EN 18222 wire).
- **No-information 404s**: identical bytes for unknown and deliberately
  unresolvable ids — a foreign client learns nothing about existence policy.
- Render and ingest are **inverse projections**: imported documents carry a
  deterministic identity, an empty event log (their events live in the source
  regime), and a receipt recording the origin.

## Environment

Manifest-rendered:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_GATEWAY_BIND` | listen address | `127.0.0.1:8095` |
| `UNIDPP_GATEWAY_ADMIN_TOKEN` | accepted (renders are public) | unset |
| `UNIDPP_ISSUER_URL` | the issuer upstream (alias `UNIDPP_GATEWAY_ISSUER_URL`) | none (fixture mode) |

Direct environment:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_GATEWAY_TIMEOUT_MS` | upstream fetch timeout | build default |

## Degradation semantics

- **Upstream mode is `issuer-upstream-with-fixture-fallback`**: when the
  issuer upstream is unreachable, the gateway answers from its built-in
  fixtures and the render metadata names the source. A render never fails
  silently into stale upstream data.
- **Timeouts** on upstream fetches degrade the same way (fixture fallback
  with the source stated).
- The gateway keeps **no state** — nothing to journal, nothing to lose;
  restart is free.

## Fixtures

The built-in fixtures (served when no upstream answers): the ISO/IEC 15459
keyed passport `urn:iso:std:iso-iec:15459:unidpp:passport:84120099012345`
and the GTIN-keyed tyre `4006381333931`
(`urn:unidpp:passport:tyre-4006381333931`).
