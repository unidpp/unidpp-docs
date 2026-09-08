---
title: "Operations: production keys"
description: "From dev seeds to real keys: every service's env-key surface, what each key protects, and the rotation ceremony."
---

# Production keys

Every service ships in **dev mode**: deterministic seeds derive the
keyrings so transcripts and demos are reproducible. Production is the
same binaries with real entropy in the environment — no code path
changes, only configuration.

## The key surface per service

| Service | Key material (env) | What it protects |
|---|---|---|
| registry | `UNIDPP_REGISTRY_ADMIN_TOKEN` | mutations (items, bindings) |
| trust | `UNIDPP_TRUST_SIGN_SEED` (Ed25519), `UNIDPP_TRUST_SIGN_SEED_P256`, `UNIDPP_TRUST_ADMIN_TOKEN` | response signing in the tree-head domain; the pinned pack anchor; mutations |
| log | `UNIDPP_LOG_SEED`, `UNIDPP_LOG_SUITE`, `UNIDPP_LOG_APPEND_TOKEN` | receipt signing; who may append commitments |
| issuer | `UNIDPP_ISSUER_EVENT_SEED` (Ed25519), `UNIDPP_ISSUER_PACK_SEED` (P-256/SM2 per `UNIDPP_ISSUER_PACK_SUITE`), `UNIDPP_ISSUER_ADMIN_TOKEN` | event signatures; Tier-A pack signatures |
| gateway | — (stateless renders) | — |
| archive | `UNIDPP_ARCHIVE_SIGN_SEED`, `UNIDPP_ARCHIVE_ADMIN_TOKEN` | snapshot notarization |
| console | `UNIDPP_CONSOLE_ADMIN_TOKEN` | the admin session login |

Secrets in manifests are `${VAR}` references — `unidpp-config`
substitutes them from the environment at render time, and the console
renders them sealed (never resolved). A manifest in git is therefore
publishable; the `.env` it references is not.

## The rotation ceremony

1. **Generate** the new key material out of band (e.g. 32 bytes of
   real entropy per seed) and stage it in the deployment's `.env`.
2. **Backup first** — the durability contract covers the state that
   predates the rotation ([Backups and restore drills](/operations/backups/)).
3. **Restart the service**; its journal replays under the new key for
   signing NEW acts. Events already sealed keep their signatures —
   verification is as-of, so history stays verifiable under the OLD
   anchors.
4. **Re-pin the anchors**: verifiers pin the trust service's
   `GET /keyring`; supersession is a trust-graph act (register the
   new key, declare the old one superseded — see the
   [trust API reference](/api/trust/)). Retroactive distrust of an
   authority requires a quorate attestation; key supersession does
   not.
5. **Drill the verify path**: mint a pack under the new keys and
   verify it against the re-pinned anchors.

## What dev seeds are for

Deterministic seeds make the reference stack reproducible: the same
seed → the same public anchors → the same transcripts. They are
published in the demo scripts on purpose. Never reuse them where a
real duty attaches.
