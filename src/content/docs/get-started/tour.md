---
title: Five-minute tour
description: Five queries against the running reference stack that show the system working end to end.
---

The reference stack runs seven services on loopback. This tour issues the five
canonical queries — one per service boundary — and explains what each answer
proves. If a command fails, see [run the reference stack](/get-started/reference-stack/)
first.

## 0. The stack is up

```sh
$ cd unidpp-pilot-data && ./stack.sh status
  registry   (unidpp-registry)  http://127.0.0.1:8390  healthy
  trust      (unidpp-trust)     http://127.0.0.1:8391  healthy
  log        (unidpp-log)       http://127.0.0.1:8392  healthy
  issuer     (unidpp-issuer)    http://127.0.0.1:8393  healthy
  projector  (unidpp-projector) http://127.0.0.1:8394  healthy
  gateway    (unidpp-gateway)   http://127.0.0.1:8395  healthy
  archive    (unidpp-archive)   http://127.0.0.1:8396  healthy
```

Every service answers `GET /healthz` with `ok` and serves a discovery document
at `GET /` that names the service, its endpoints, and its configuration. The
discovery documents are the contract — these docs summarize them; the services
remain the source of truth.

## 1. Discovery — which services exist

The registry's discovery dataset (C3 services, C4 protocol bindings, C5
verification mechanisms, C1 units) is what a consumer resolves before it
calls anything.

```sh
$ curl -s http://127.0.0.1:8390/services | jq '.services | length'
8
```

Eight services are registered: the UniDPP family plus EN 18222, GS1 Digital
Link, GB/T 33993, and UNTP protocol bindings.

## 2. As-of applicability — which duties bind a product type at T

The pilot's headline query. Product type `momiji:e8` (an e-bike) is bound to
jurisdiction profiles with dated effective windows:

```sh
$ curl -s 'http://127.0.0.1:8390/applicability?product_type=momiji:e8&at=2027-06-01T00:00:00Z' \
    | jq '[.applicability[].binding.profile_item]'
["urn:unidpp:profile:jp-road-traffic"]

$ curl -s 'http://127.0.0.1:8390/applicability?product_type=momiji:e8&at=2028-06-01T00:00:00Z' \
    | jq '[.applicability[].binding.profile_item]'
["urn:unidpp:profile:eu-machinery-battery","urn:unidpp:profile:jp-road-traffic"]
```

At 2027-06-01 only Japan's road-traffic duty applies. A year later the EU
machinery + battery duty joins it. Same product, same instant-shaped query,
different legal reality — answered from the register, not from a rules engine.

## 3. Two-lens view — one passport under two jurisdictions

The projector renders the same passport under a registered profile at a chosen
instant. The EU lens at 2028-06-01:

```sh
$ curl -s -G 'http://127.0.0.1:8394/view' \
    --data-urlencode 'passport=urn:unidpp:passport:pilot-e8-j000842' \
    --data-urlencode 'profile=urn:unidpp:profile:pilot-eu-lens' \
    --data-urlencode 'actor=importer' --data-urlencode 'at=2028-06-01T00:00:00Z' \
    | jq '.coverage'
{
  "complete": true,
  "elements_present": 3,
  "elements_required": 3,
  ...
}
```

The JP lens over the same passport and instant reports `complete: false`: the
JP top-runner class fact was never written at or before the as-of instant —
an explicit, auditable gap, never an invented value:

```json
"missing": [
  {
    "element": "unidpp-dev/de.jp.top-runner-class@2026.1",
    "reason": "absent-as-of",
    "detail": "no event wrote this fact at or before the as-of instant"
  }
]
```

## 4. Foreign render — EN 18222

The gateway renders the neutral core in foreign protocol shapes. This is the
EN 18222 REST binding (the freeDPP wire shape):

```sh
$ curl -s 'http://127.0.0.1:8395/en18222/v1/dppsByProductId/4006381333931?representation=full' \
    | jq '.dppStatus'
"active"
```

## 5. Trust — the anchors a verifier pins

The trust service co-signs every response in the tree-head domain and
publishes its keyring:

```sh
$ curl -s http://127.0.0.1:8391/keyring | jq '{mode, roles: (.roles | keys)}'
{
  "mode": "seeded-dev",
  "roles": [
    "sign-ecdsa-p256",
    "sign-ed25519"
  ]
}
```

`seeded-dev` means the keyring derived from the documented dev seed — fine for
the pilot, wrong for production. [The security posture](/operators/security/)
covers what changes.

## Where to go next

- [Run the reference stack](/get-started/reference-stack/) — build and start
  everything yourself.
- [Your first passport, pack, and verification](/get-started/first-passport/) —
  the write path.
- [The service references](/services/registry/) — every endpoint of every
  service.
