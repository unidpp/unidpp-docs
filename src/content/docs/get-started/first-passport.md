---
title: Your first passport, pack, and verification
description: Issue a passport, append a lifecycle event, mint the offline Tier-A pack, and verify it against the issuer's published anchor.
---

This page walks the write path end to end: create a passport, append a typed
event, mint the offline Tier-A pack, and verify the pack offline against the
issuer's published anchor. The transcript was recorded against a tenant
issuer (the whitelabel `acme` tenant, loopback `127.0.0.1:9393`) — the same
calls work against any [issuer](/services/issuer/) deployment, including a
reference stack you own. Point a fresh tenant at the commands and its journals
stay isolated: see [the 15-minute whitelabel deployment](/quickstart-whitelabel/).

## 1. The issuer is up and its keyring is published

```sh
$ curl -s http://127.0.0.1:9393/healthz
ok
$ curl -s http://127.0.0.1:9393/keyring | jq '{mode, roles: (.roles | keys)}'
{
  "mode": "seeded-dev",
  "roles": [
    "event",
    "pack"
  ]
}
```

The keyring is the trust anchor set: `event` (Ed25519, signs lifecycle
events), `pack` (the pack suite — ECDSA P-256 here, SM2 on a Chinese
sovereign tenant — declared in the tenant's
[operator manifest](/operators/manifest/#services-issuer-pack_suites)).

## 2. Create the passport

```sh
$ curl -s -X POST http://127.0.0.1:9393/passports \
    -H 'content-type: application/json' \
    -d '{
          "identity": "local:acme:docs-demo-1",
          "type_ref": "momiji:e8",
          "capability": "S2",
          "eo_id": "urn:acme:actor:demo",
          "resolver_uri": "https://resolver.example.org/r/acme-demo-1",
          "passport_id": "urn:acme:passport:docs-demo-1",
          "config": []
        }' | jq '{passport_id, status}'
{
  "passport_id": "urn:acme:passport:docs-demo-1",
  "status": "issued"
}
```

The fields:

| Field | Meaning |
|---|---|
| `identity` | the product identifier, scheme-prefixed. `gtin:`, `sgtin:`, `gsrn:`, `gln:`, `cpid:`, `ssn:`, `upu:`, `vin:`, `handle:`, `doi:`, `uri:` and `local:<tag>` are accepted; an unknown scheme is rejected with a 400 naming the scheme. |
| `type_ref` | the product type reference (drives [applicability](/services/registry/) queries). |
| `capability` | the capability class S0-S3 of the carrier (S2 = logged contact). |
| `eo_id` | the economic operator. |
| `resolver_uri` | where a resolver redirects to this passport. |
| `passport_id` | your URN for the passport; must be unused (409 otherwise). |
| `config` | the profile manifest — the jurisdiction/sector/characteristic profiles this passport carries. Empty here; the pilot demo carries `["urn:unidpp:profile:eu-machinery-battery", "urn:unidpp:profile:jp-road-traffic"]`. |

A bad identity scheme fails loudly:

```sh
$ curl -s -X POST http://127.0.0.1:9393/passports ... -d '{"identity": "acme:demo-1", ...}'
{
  "as_of": "2026-09-08T05:17:18.726180Z",
  "error": "`identity`: parse error: unknown identifier scheme `acme`"
}
```

(HTTP 400.) Use `local:acme:demo-1` for private identifier spaces.

## 3. Append a lifecycle event

Events are typed and server-signed. The first event of any passport is
`issuance`:

```sh
$ curl -s -X POST http://127.0.0.1:9393/passports/urn%3Aacme%3Apassport%3Adocs-demo-1/events \
    -H 'content-type: application/json' \
    -d '{
          "type": "issuance",
          "data": {"Issuance": {"derived": false, "inputs": []}},
          "actor": "demo-operator",
          "actor_role": "economic operator",
          "at": "2026-09-08T00:00:00Z"
        }' | jq -c '{seq, event_type}'
{"seq":0,"event_type":"issuance"}
```

The URL-encoded passport id matters: `urn:acme:passport:docs-demo-1` becomes
`urn%3Aacme%3Apassport%3Adocs-demo-1`. Event types follow the lifecycle state
machine (issuance, correction, milestone.record, status changes); an event
that violates the state machine is rejected, not coerced. Corrections carry
`{field, prior_value, new_value, reason}`; milestones carry typed counters
(the battery-management system example in the pilot seeds
`de.dpp.reparability-score`, `de.dpp.carbon-footprint`,
`battery.capacity-kwh`).

## 4. Mint the Tier-A pack

The pack is the offline carrier: a compact binary rendering of the passport's
readings plus the pack signature — sized to print as a QR code.

```sh
$ curl -s -X POST http://127.0.0.1:9393/passports/urn%3Aacme%3Apassport%3Adocs-demo-1/pack \
    -H 'content-type: application/json' -d '{}' \
    | jq '{bytes, qr_version, ec}'
{
  "bytes": 337,
  "qr_version": 14,
  "ec": "m"
}
```

The response also carries `pack` (the hex carrier bytes), `signature` /
`signatures` (the pack signature block — one per configured suite), and
`anchor` / `anchors` (the public keys that verify it). The pilot's demo pack
is 363 bytes at QR version 15-M with two suites co-signing.

## 5. Verify offline

Verification is an offline operation: the pack plus the issuer's published
anchor. Nothing else. First put the carrier bytes in a file (the pack
response's `pack` member is the hex string), then pin the anchor from the
issuer's keyring (an operator would pin it at onboarding, not fetch it
ad hoc):

```sh
$ curl -s -X POST http://127.0.0.1:9393/passports/urn%3Aacme%3Apassport%3Adocs-demo-1/pack \
    -H 'content-type: application/json' -d '{}' -o pack-response.json
$ jq -r '.pack' pack-response.json > pack.hex
$ anchor=$(curl -s http://127.0.0.1:9393/keyring | jq -r '.roles.pack.public')
$ echo "${anchor:0:24}…"
04d90cd961d7afccc4b4b65f…
$ unidpp verify pack.hex --anchor "$anchor"
UniDPP Tier-A verification
  carrier       337 bytes (hex)
  passport      urn:acme:passport:docs-demo-1
  product       local:acme:docs-demo-1 (model)
  resolver      https://resolver.example.org/r/acme-demo-1
  economic op.  urn:acme:actor:demo
  as-of         2026-09-08T00:00:00Z
  log head      296a203b6fd52d5f..
  ...
```

`--json` emits the machine-readable verdict (`verdict`, `coverage` with the
required/present reading sets, the three readings). Exit codes: **0** pass,
**1** degraded (verifiable but incomplete), **2** fail.

## 6. What the issuer recorded

Every mutation lands in the issuer's audit log:

```sh
$ curl -s 'http://127.0.0.1:9393/admin/log' | jq '{total, first_op: .records[0].op | keys}'
{
  "total": 2,
  "first_op": [
    "CreatePassport"
  ]
}
```

And in the issuer's journal (`tenants/acme/issuer-journal.jsonl` for the
tenant), which replays on restart — the audit trail is the state.

## Where to go next

- [The issuer reference](/services/issuer/) — every endpoint, the verdict
  legs, event typing.
- [The projector](/services/projector/) — rendering a passport under a
  registered profile.
- [The 15-minute whitelabel deployment](/quickstart-whitelabel/) — the full
  tenant procedure this page borrowed an issuer from.
