---
title: Augment-existing adoption
description: Keep the passport system you have — the gateway renders one UniDPP core through the EN 18222 and UNTP bindings your consumers already speak.
---

The augment-existing adopter already has consumers: EN 18222
clients, UNTP tooling, or both. The adoption adds the neutral core
behind a translation edge and changes nothing the consumers see.
`unidpp-gateway` runs in front of one `unidpp-issuer` and renders
the same core state through both foreign protocol bindings.

This path implements Part 10 (client retrieval) in its binding-
plural form: one capability, two protocols, one identity. The
gateway's integration surface is the documented binding set; the
issuer behind it implements Part 2.

## What the adopter holds

- The `unidpp-issuer` binary (the core that fronts the old system's
  successor), and
- The `unidpp-gateway` binary, pointed at it.

## The quickstart

The exercised form is `unidpp-e2e/scripts/quickstart-gateway.sh`
(CI test 8):

```sh
$ UNIDPP_ISSUER_BIND=127.0.0.1:18521 \
  UNIDPP_ISSUER_STATE_FILE=issuer-journal.jsonl unidpp-issuer &
$ UNIDPP_GATEWAY_BIND=127.0.0.1:18522 \
  UNIDPP_ISSUER_URL=http://127.0.0.1:18521 unidpp-gateway &
unidpp-gateway: issuer upstream http://127.0.0.1:18521

# EN 18222 consumers, unchanged:
$ curl -s http://127.0.0.1:18522/en18222/v1/dppsByProductId/4006381333931 \
    | jq .uniqueProductIdentifier
"4006381333931"

# UNTP consumers, unchanged:
$ curl -s http://127.0.0.1:18522/untp/product/4006381333931 \
    | jq '.passport.productIdentifiers[0].value'
"(01)4006381333931"
```

The two answers are the same identity in two spellings — the GS1
AI-delimited form UNTP carries and the bare key EN 18222 carries.
The quickstart asserts exactly this parity, and that a passport
newly issued at the upstream serves through the binding under its
passport id.

## The ingest direction

The gateway also runs the import direction: `POST /untp/ingest`
accepts a UNTP passport (VC or triad) and mints a core passport with
a deterministic identity, idempotent per subject. An adopter whose
existing assets are UNTP documents can pull them in rather than
re-issue.

## The reversibility check

The quickstart's closing step removes the gateway and confirms the
upstream issuer is whole — no state was lent out, none needs
returning. The adoption is additive and reversible by construction.
For a sustained deployment of the same edge, see
[federation gateway](/adoption/federation-gateway/).
