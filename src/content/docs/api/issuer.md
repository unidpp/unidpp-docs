---
title: "issuer — API reference"
description: "Every routed endpoint of the ISSUER service, generated from its router."
---

# issuer — API reference

Generated from [`unidpp-issuer/src/api.rs`](https://github.com/unidpp/unidpp-issuer/blob/main/src/api.rs) — the router is the
source of truth; regenerate with `tools/gen-api-reference.sh`.

| Method | Path | Description |
|---|---|---|
| GET | `/` |  |
| POST | `/admin/applicability` |  |
| GET | `/admin/log` |  |
| POST | `/admin/profiles` |  |
| GET | `/healthz` |  |
| GET | `/keyring` | the public anchors a verifier pins |
| POST | `/passports` | create: identity, type ref, config vector, capability class → passport id + empty log |
| GET | `/passports/{id}` | core + manifest (config vector) + log head |
| POST | `/passports/{id}/events` | append a typed event; server-signed (Ed25519) → `TrustMarker::Attested`; illegal status transitions rejected (I6) |
| POST | `/passports/{id}/pack` | mint the Tier-A pack: real ECDSA-P256 carrier signature, QR budget enforcement |
| GET | `/passports/{id}/verdict` | full-pipeline verdict + coverage (log verdict, Tier-A pack verdict, event-signature audit) |
