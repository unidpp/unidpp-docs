---
title: Federation gateway adoption
description: The sustained translation edge — two systems that will not change each talk to the gateway, which renders one core through both bindings and moves evidence by document or protocol.
---

The federation-gateway adopter operates the translation edge as its
mission, not as a migration step. Two systems that will not change —
an EN 18222 estate and a UNTP estate, a national portal and a
counterpart's portal — each keep talking their own protocol; the
gateway holds the one core state behind both renderings and moves
evidence across in either direction.

This path implements Part 10 (client retrieval, binding pluralism)
and the transport half of Part 6 (federation): the gateway is where
the inter-scheme protocol touches a wire.

## What the adopter holds

- The `unidpp-gateway` binary, and
- An upstream that answers for passports: a `unidpp-issuer`, or the
  seeded fixture catalogue the gateway ships (the stand-in used
  before an upstream exists).

```sh
$ UNIDPP_GATEWAY_BIND=127.0.0.1:18522 \
  UNIDPP_ISSUER_URL=http://127.0.0.1:18521 unidpp-gateway
```

The discovery document at `/` names the bindings, their endpoints,
and the resolution mode (`issuer-upstream-with-fixture-fallback` or
`fixtures`).

## The binding surface

| Endpoint | Direction | Protocol |
|---|---|---|
| `GET /en18222/v1/dppsByProductId/{gtin}` | serve | EN 18222 |
| `GET /untp/product/{id}` | serve | UNTP |
| `POST /untp/ingest` | import | UNTP |

The serve direction renders one core passport under the requested
protocol; the identity matches across bindings — the delimited GS1
form UNTP carries wraps the bare key EN 18222 carries. The import
direction mints a core passport from a UNTP document with a
deterministic identity, idempotent per subject.

## Beyond rendering: the document transport

The gateway's bindings are the retrieval edge of the federation
story; the evidence itself moves by the transport modes of the
inter-scheme protocol — protocol, document, or relayed hub — with
frozen views as the document form that survives an air gap. A
partial adopter on the far side holds the same capabilities as data:
see [verify-only](/adoption/verify-only/) and the no-orphan audit.

## Operating the edge

The gateway is stateless in its render path and journaled in its
ingest path; it adds no duties the upstream did not already carry.
[Monitoring](/operations/monitoring/) treats it like any other
service. When the adopter's mission grows to running the whole
stack behind the edge, see [the full host](/adoption/full-host/).
