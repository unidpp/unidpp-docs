---
title: Hub
description: "The unidpp-hub service — the translation hub: a stateless signed relay between willing pairs divided by protocols."
---

The hub service is the SI-3 hub contract as an operable service: a
**stateless signed relay** between pairs divided by protocols. It
carries no storage (no journals, no posture state); relaying is a
pure function of the request, which carries both sides' published
[interop declarations](/adoption/registry-participant/) and the
evidence.

Willingness is checked **both ways** before anything moves: a scheme
that declines interop is never brokered around, because the WILL gap is not
the hub's to bridge, and the refusal names both endpoints and the
reason. Every relay is signed in the HUB-RELAY domain over the
forwarded bytes' digest plus the relay metadata; [`/keyring`](#endpoints)
publishes the verifying key. No message of the protocol names a
master: a pair that speaks directly has no need of the hub.

In the reference deployment it binds `127.0.0.1:8397`. There is no
admin surface, and there is nothing to administer.

## Endpoints

| Endpoint | What |
|---|---|
| `GET /` | discovery (the hub contract) |
| `GET /healthz` | liveness |
| `GET /keyring` | the hub's public key (relay signatures verify under it) |
| `POST /relay` | check willingness both ways, forward, sign, retain nothing |
| `POST /relay/verify` | verify a relay under this hub's key |

## The relay request

```json
POST /relay
{
  "from": "eu-scheme",
  "to": "cn-scheme",
  "data_class": "*",
  "evidence_hex": "…",
  "declarations": [ …both sides' published interop declarations… ]
}
```

The response carries the signed `relay` object (hub id, endpoints,
class, evidence digest, the HUB-RELAY signature) and the forwarded
evidence. A refusal is HTTP 422 with `"refused": true` and the
reason, whether an L0 posture (`WILL gap`) or an absent declaration (the
silent side named).

## Verification

The recipient verifies with the same key discipline as every other
signature: pin the hub's public key from `/keyring`, recompute the
relay payload, check the Ed25519 signature. `POST /relay/verify`
runs the check server-side for any third party; tampered evidence
under a valid signature fails.

## Operations

Configuration is three environment variables: `UNIDPP_HUB_BIND`,
`UNIDPP_HUB_ID`, `UNIDPP_HUB_SEED` (production sets the seed; without
it the keyring runs in seeded-dev mode and says so on every start).
Backups: nothing to back up. Upgrades: restart, because the hub held
nothing before and holds nothing after. See the [hub attachment
quickstart](https://github.com/unidpp/unidpp-e2e/blob/main/scripts/quickstart-hub.sh)
for the walked path.
