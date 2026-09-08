---
title: Issuer
description: "The unidpp-issuer service — passport lifecycle: create, typed events, Tier-A packs, full-pipeline verdicts."
---

The passport lifecycle issuer: create passports, append server-signed typed
events, mint Tier-A offline packs with real signatures, run full-pipeline
verdicts, and (optionally) forward profiles and applicability bindings to the
registry. In the reference deployment it binds `127.0.0.1:8393` and forwards
to the registry at 8390; the whitelabel tenant's issuer binds 9393.

Mutations require `UNIDPP_ISSUER_ADMIN_TOKEN` when set (open in dev mode).
Events are signed Ed25519 (SIGNATIF infrastructure suite); packs are signed
with the configured pack suite(s) — ECDSA P-256 by default, SM2 on sovereign
CN deployments, or a co-signature set.

## Endpoints

| Endpoint | What |
|---|---|
| `GET /` | discovery (endpoints, keyring mode, registry upstream, signature policy) |
| `GET /healthz` | liveness |
| `GET /keyring` | the public anchors a verifier pins (event + pack roles) |
| `POST /passports` | create a passport: identity, type ref, config vector |
| `GET /passports/{id}?at=` | the passport document: core + manifest + log head |
| `POST /passports/{id}/events` | append a typed, server-signed event |
| `POST /passports/{id}/pack` | mint the Tier-A pack (real signature, QR-sized carrier) |
| `GET /passports/{id}/verdict?at=&max_age=` | the full-pipeline verdict + coverage |
| `POST /admin/profiles` · `GET /admin/profiles` | register/list profiles (forwards to the registry when configured) |
| `POST /admin/applicability` · `GET /admin/applicability?product_type=&at=` | bind/query locally recorded applicability |
| `GET /admin/log?limit=&offset=` | the append-only audit log (admin, paged) |

The walkthrough for the first four lifecycle calls is
[your first passport](/get-started/first-passport/).

## The verdict

One call, three legs:

```sh
$ curl -s 'http://127.0.0.1:8393/passports/urn%3Aunidpp%3Apassport%3Apilot-e8-j000842/verdict' \
    | jq '{reading_answered, log_outcome: .log.outcome, log_marker: .log.trust_marker,
           events: .log.evidentiary.events_total, corrections: .log.evidentiary.corrections,
           freshness: .log.freshness}'
{
  "reading_answered": "current-state",
  "log_outcome": "Pass",
  "log_marker": "log-anchored",
  "events": 5,
  "corrections": 3,
  "freshness": { "Fresh": { "as_of": "2026-09-07T13:30:43Z" } }
}
```

The legs: **Tier-A** (the pack verdict — carrier, signature, coverage),
**log** (evidentiary chain: events, corrections, recalls, security flags,
freshness window, cryptographic anchor), and **event-signature audit**
(signatures verified against the keyring's event anchor).
`?max_age=` bounds the freshness window (`0` selects static/archival
semantics); the default comes from the deployment environment.

## Audit log shape

`GET /admin/log` answers `{total, offset, records}` — each record is
`{seq, op, recorded_at}` where `op` is the typed operation
(`CreatePassport`, event appends, packs, …) with its full payload:

```sh
$ curl -s 'http://127.0.0.1:8393/admin/log?limit=1' | jq '{total, first: .records[0].op | keys}'
{ "total": 8, "first": ["CreatePassport"] }
```

## Environment

Manifest-rendered:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_ISSUER_BIND` | listen address | `127.0.0.1:8091` |
| `UNIDPP_ISSUER_ADMIN_TOKEN` | Bearer token for mutations; unset = open | unset |
| `UNIDPP_ISSUER_STATE_FILE` | append-only JSONL journal | none |
| `UNIDPP_ISSUER_PACK_SUITE` | pack suite(s), comma-joined | `ecdsa-p256` |
| `UNIDPP_ISSUER_REGISTRY_URL` | registry upstream for profile/binding forwarding | none |

Direct environment:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_ISSUER_MAX_AGE` | default freshness window of the verdict's Tier-A leg (seconds) | build default |
| `UNIDPP_ISSUER_SEED` | deterministic keyring seed (production identity) | dev seed |
| `UNIDPP_ISSUER_PACK_SEED` | pack-suite key seed | — |
| `UNIDPP_ISSUER_EVENT_SEED` | event-signing key seed | — |
| `UNIDPP_ISSUER_REGISTRY_TOKEN` | Bearer token forwarded to the registry | none |

## Semantics and degradation

- **The state machine is enforced.** Events follow the lifecycle state
  machine (I6); a `StatusChange` whose `from` does not match the replayed
  status is rejected. Bad requests fail with named 400s (an unknown
  identifier scheme names the scheme); duplicate creates are 409.
- **Identity is validated.** Product identifiers must use a known scheme
  (`gtin:`, `sgtin:`, `gsrn:`, `gln:`, `cpid:`, `ssn:`, `upu:`, `vin:`,
  `handle:`, `doi:`, `uri:`, `local:<tag>`).
- **Registry forwarding degrades explicitly.** When `registry_url` is set
  but the registry is unreachable, the local registration stands and the
  forwarding failure is reported — the issuer does not pretend the registry
  holds what it does not.
- **Packs are signed with real keys**, never placeholders; a multi-suite
  policy co-signs one body per suite.
- **Journals are the state.** Everything (passports, events, packs, admin
  actions) replays from the journal on restart.
