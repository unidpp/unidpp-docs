---
title: Trust
description: "The unidpp-trust service — the SIGNATIF trust graph: jurisdiction trust lists, master list quorum, revocations."
---

The trust service is the SIGNATIF trust-graph: jurisdiction trust lists per
framework, an M-of-K multi-witness master list, and live
reason-to-retroactivity revocations. **Every response is signed** in the
tree-head domain — signature headers name their suites and key ids so a
verifier picks the right public keys from `/keyring`.

In the reference deployment it binds `127.0.0.1:8391`. Reads are public;
mutations and `/admin/log` require `UNIDPP_TRUST_ADMIN_TOKEN` when set.

## Endpoints

| Endpoint | What |
|---|---|
| `GET /` | discovery (endpoints, signing domain, revocation semantics) |
| `GET /healthz` | liveness |
| `GET /keyring` | the service keyring (verifier pinning) |
| `GET /graph` | the trust graph |
| `GET /anchor-bundle?jurisdiction=` | an anchor bundle per jurisdiction |
| `GET /trust-lists?at=&jurisdiction=&framework=` | trust lists |
| `GET /trust-lists/{jur}?at=` | one jurisdiction's list |
| `POST /trust-lists` | register a trust list |
| `POST /trust-lists/{jur}/entries` | upsert a trust entry |
| `GET /master-list` | the M-of-K master list |
| `POST /master-list/witnesses` | set the witness set |
| `POST /master-list/entries` | upsert a master entry |
| `GET /revocations?at=&known_by=&window=&subject=&retroactive=` | revocation declarations, both readings |
| `POST /revocations` | declare a revocation |
| `POST /nodes` · `POST /edges` | graph registration |
| `GET /admin/log?limit=&offset=` | audit log (admin) |

## Example (recorded against the reference deployment)

```sh
$ curl -s http://127.0.0.1:8391/keyring | jq '{mode, roles: (.roles | keys)}'
{
  "mode": "seeded-dev",
  "roles": [
    "sign-ecdsa-p256",
    "sign-ed25519"
  ]
}

$ curl -s http://127.0.0.1:8391/trust-lists | jq '.trust_lists | length'
1
```

`seeded-dev` flags the deterministic dev keyring; production sets a signing
seed (see [security posture](/operators/security/#key-material-and-trust-anchors)).

## Revocation semantics

The reason codes decide whether history survives:

- **Prospective reasons** — `key-compromise`, `cessation`, `supersession`,
  `affiliation-change`: prior as-of verifications stay valid (timestamping
  protects, as with code signing).
- **Retroactive reasons** — `misissuance`, `fraudulent-issuance`,
  `authority-compromised`: void **ab initio** within the explicit distrust
  window `[start, end]`, re-valid outside it.

Both readings are computable per declaration: responses carry
`known_at_cutoff` and `voids_at_as_of`.

## Response signing

Every body is signed over the exact bytes; headers carry `x-sig-domain`
(`tree-head`), `x-sig-ed25519` + `x-sig-key-id-ed25519`, and
`x-sig-ecdsa-p256` + `x-sig-key-id-ecdsa-p256`. Cache policy per response:
current-state answers revalidate; point-in-time (`?at=`) answers are
`immutable, max-age=86400`; mutations are never stored.

SIGNATIF has no service-response domain; tree-head (the operator's signed
statement of state, as used for transparency-log signed tree heads) is the
documented adaptation — stated in the discovery document, not hidden.

## Environment

Manifest-rendered:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_TRUST_BIND` | listen address | `127.0.0.1:8091` |
| `UNIDPP_TRUST_ADMIN_TOKEN` | Bearer token for mutations and `/admin/*`; unset = open | unset |
| `UNIDPP_TRUST_STATE_FILE` | append-only JSONL journal | none |

Direct environment:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_TRUST_NO_SEED_FIXTURES` | `1` skips seeding the fixture trust graph at first start | unset (seed on) |
| `UNIDPP_TRUST_SIGN_SEED` | deterministic signing seed (production identity) | dev seed |
| `UNIDPP_TRUST_DEV_SEED` | the dev seed value | documented dev seed |

## Semantics and degradation

- **Fixtures by default.** First start seeds a fixture trust graph so the
  service is useful to a verifier out of the box; disable with
  `UNIDPP_TRUST_NO_SEED_FIXTURES=1` for a clean production instance.
- **Journal replay** on start; the graph, lists, and revocation ledger all
  restore from the journal.
- **No silent unsigned answers.** If a response cannot carry its signature
  headers, that is a bug, not a degradation mode — the signing keyring is
  constructed at start or the process exits.
