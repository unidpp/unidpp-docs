---
title: "trust — API reference"
description: "Every routed endpoint of the TRUST service, generated from its router."
---

# trust — API reference

Generated from [`unidpp-trust/src/api.rs`](https://github.com/unidpp/unidpp-trust/blob/main/src/api.rs) — the router is the
source of truth; regenerate with `tools/gen-api-reference.sh`.

| Method | Path | Description |
|---|---|---|
| GET | `/` | discovery document |
| GET | `/admin/log` |  |
| GET | `/anchor-bundle` |  |
| POST | `/edges` | add a delegation credential (validated) |
| GET | `/graph` | full trust graph (nodes + edges) — verifiers reconstruct and resolve |
| GET | `/healthz` | liveness (signed JSON status) |
| GET | `/keyring` | public anchors a verifier pins (CLI `--anchor`) |
| GET | `/master-list` | M-of-K shape with witness list + per-entry live quorum verdicts |
| POST | `/master-list/entries` | upsert a master-list entry (re-verified live) |
| POST | `/master-list/witnesses` | replace the witness set (m + keys) |
| POST | `/nodes` | upsert a node (merges keys) |
| GET | `/revocations` |  |
| POST | `/revocations` | declare (retroactive requires a quorate attestation: member-key slots, or a threshold-ceremony group signature pinned on the quorum node — see `quorum`) |
| GET | `/trust-lists` |  |
| POST | `/trust-lists` | register a new trust list |
| GET | `/trust-lists/{jur}` |  |
| POST | `/trust-lists/{jur}/entries` | upsert a single entry (`superseded_at` = withdrawal) |

> The module docs describe these without a matching route —
> check the source: `GET /anchor-bundle?jurisdiction=`, `GET /revocations?at=&known_by=&window=&subject=&retroactive=`, `GET /trust-lists/{jur}?at=`, `GET /trust-lists?at=&jurisdiction=&framework=`
