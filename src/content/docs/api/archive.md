---
title: "archive — API reference"
description: "Every routed endpoint of the ARCHIVE service, generated from its router."
---

# archive — API reference

Generated from [`unidpp-archive/src/api.rs`](https://github.com/unidpp/unidpp-archive/blob/main/src/api.rs) — the router is the
source of truth; regenerate with `tools/gen-api-reference.sh`.

| Method | Path | Description |
|---|---|---|
| GET | `/` | discovery document (OAIS mapping, notarization recipe) |
| GET | `/admin/log` |  |
| GET | `/healthz` | liveness |
| GET | `/keyring` | the notary anchor a verifier pins |
| GET | `/snapshots` |  |
| POST | `/snapshots` | ingest: notarize an as-of snapshot (SIP → AIP) |
| GET | `/snapshots/{id}` | access: re-serve the AIP byte-identically |

> The module docs describe these without a matching route —
> check the source: `GET /snapshots?passport_id=&at=`
