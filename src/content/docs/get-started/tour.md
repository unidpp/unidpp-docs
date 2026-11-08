---
title: Five-minute tour
description: Five queries against the running reference stack that show the system working end to end.
---

The reference deployment serves the whole estate as one process on loopback
port 8090, every module at its prefix. This tour issues the five canonical
queries, one per module boundary, and explains what each answer proves. If a
command fails, see [run the reference deployment](/get-started/reference-stack/)
first.

## 0. The deployment is up

```sh
$ cd unidpp-pilot-data && ./ops/target/release/unidpp-stack one-status
  one-server  http://127.0.0.1:8090  healthy  v0.1.0  (pid 59403)
    registry     /registry     healthy
    trust        /trust        healthy
    log          /log          healthy
    issuer       /issuer       healthy
    views        /views        healthy
    render       /render       healthy
    archive      /archive      healthy
    relay        /relay        healthy
    peer         /registry-jp   mounted
  console     /console on the one origin  healthy
```

Every module answers `GET /<module>/healthz` with `ok` and serves its
discovery document at `GET /<module>/` that names the module, its endpoints,
and its configuration. The served contracts are the truth; these docs
summarize them.

## 1. Discovery: which services exist

The registry's discovery dataset (C3 services, C4 protocol bindings, C5
verification mechanisms, C1 units) is what a consumer resolves before it
calls anything.

```sh
$ curl -s http://127.0.0.1:8090/registry/services | jq '.services | length'
8
```

Eight services are registered: the UniDPP family plus EN 18222, GS1 Digital
Link, GB/T 33993, and UNTP protocol bindings.

## 2. As-of applicability: which duties bind a product type at T

The pilot's headline query. Product type `momiji:e8` (an e-bike) is bound to
jurisdiction profiles with dated effective windows:

```sh
$ curl -s 'http://127.0.0.1:8090/registry/applicability?product_type=momiji:e8&at=2027-06-01T00:00:00Z' \
    | jq '[.applicability[].binding.profile_item]'
["urn:unidpp:profile:jp-road-traffic"]

$ curl -s 'http://127.0.0.1:8090/registry/applicability?product_type=momiji:e8&at=2028-06-01T00:00:00Z' \
    | jq '[.applicability[].binding.profile_item]'
["urn:unidpp:profile:eu-machinery-battery","urn:unidpp:profile:jp-road-traffic"]
```

At 2027-06-01 only Japan's road-traffic duty applies. A year later the EU
machinery + battery duty joins it. Same product, same instant-shaped query,
different legal reality, answered from the register rather than a rules engine.

## 3. Two-lens view: one passport under two jurisdictions

The projector renders the same passport under a registered profile at a chosen
instant. The EU lens at 2028-06-01:

```sh
$ curl -s -G 'http://127.0.0.1:8090/views/view' \
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

## 4. Foreign render: EN 18222

The gateway renders the neutral core in foreign protocol shapes. This is the
EN 18222 REST binding (the freeDPP wire shape):

```sh
$ curl -s 'http://127.0.0.1:8090/render/en18222/v1/dppsByProductId/4006381333931?representation=full' \
    | jq '.dppStatus'
"active"
```

## 5. Trust: the anchors a verifier pins

The trust service co-signs every response in the tree-head domain and
publishes its keyring:

```sh
$ curl -s http://127.0.0.1:8090/trust/keyring | jq '{mode, roles: (.roles | keys)}'
{
  "mode": "seeded-dev",
  "roles": [
    "sign-ecdsa-p256",
    "sign-ed25519"
  ]
}
```

`seeded-dev` means the keyring derived from the documented dev seed, which is fine for
the pilot, wrong for production. [The security posture](/operators/security/)
covers what changes.

## Where to go next

- [Run the reference stack](/get-started/reference-stack/): build and start
  everything yourself.
- [Your first passport, pack, and verification](/get-started/first-passport/) —
  the write path.
- [The service references](/services/registry/): every endpoint of every
  service.
