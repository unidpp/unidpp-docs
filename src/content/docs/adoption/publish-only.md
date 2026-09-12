---
title: Publish-only adoption
description: One issuer, nothing else — passports, signed events and offline-verifiable packs, with no registry, log or trust service.
---

The publish-only adopter issues passports and mints packs, and runs
nothing else. No registry, no transparency log, no trust service, no
gateway, no console. One `unidpp-issuer` deployment with its journal
on disk; the packs it mints verify offline against the keyring it
publishes.

This path implements Part 2 (core model: identity and events) and
the issuance half of Part 5: the issuer is the anchor of its own
signatures.

## What the adopter holds

- The `unidpp-issuer` binary and a state file (a JSONL journal).
- Two environment variables at minimum: `UNIDPP_ISSUER_BIND` and
  `UNIDPP_ISSUER_STATE_FILE`.
- In production, key material: `UNIDPP_ISSUER_EVENT_SEED` and
  `UNIDPP_ISSUER_PACK_SEED` (without them the keyring runs in
  seeded-dev mode and says so on every start).

## The quickstart

The exercised form is `unidpp-e2e/scripts/quickstart-publish-only.sh`
(CI test 7):

```sh
$ UNIDPP_ISSUER_BIND=127.0.0.1:18511 \
  UNIDPP_ISSUER_STATE_FILE=issuer-journal.jsonl \
  unidpp-issuer &
unidpp-issuer listening on http://127.0.0.1:18511

$ curl -s http://127.0.0.1:18511/keyring | jq '.roles.pack'
# the public key a verifier pins

$ curl -s -X POST http://127.0.0.1:18511/passports \
    -H 'content-type: application/json' \
    -d '{"identity":"gtin:4006381333931",
         "type_ref":"https://example.org/types/battery-pack",
         "capability":"S1"}' | jq .passport_id
"urn:unidpp:passport:iss-9a1dba1c9f41"

$ curl -s -X POST http://127.0.0.1:18511/passports/$ID/events \
    -H 'content-type: application/json' \
    -d '{"type":"custody.transfer",
         "data":{"from":"mfg","to":"dist","counterparty_signed":true}}'

$ curl -s -X POST http://127.0.0.1:18511/passports/$ID/pack \
    -H 'content-type: application/json' -d '{}' | jq -r .pack > pack.hex
```

The event is signed server-side by the event key; the pack by the
pack key (ECDSA P-256 by default; SM2 and the post-quantum suites
are configured through `UNIDPP_ISSUER_PACK_SUITE`).

## The independence check

The quickstart's closing step is the point of the path: stop the
issuer, then verify the pack offline with the officer's terminal
against the keyring-pinned anchor. The verdict is pass. Publication
is complete at mint — the packs do not call home, and neither does
the terminal that reads them.

## Growing the path

When the adopter later wants a register of profiles, an anchoring
log or a trust service, those components join without rewriting the
journal: the issuer consumes each as a declared capability, absent
by default. See [the full host](/adoption/full-host/).
