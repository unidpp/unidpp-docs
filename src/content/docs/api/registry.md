---
title: "registry — API reference"
description: "Every routed endpoint of the REGISTRY service, generated from its router."
---

# registry — API reference

Generated from [`unidpp-registry/src/api.rs`](https://github.com/unidpp/unidpp-registry/blob/main/src/api.rs) — the router is the
source of truth; regenerate with `tools/gen-api-reference.sh`.

| Method | Path | Description |
|---|---|---|
| GET | `/` |  |
| POST | `/` |  |
| GET | `/admin/log` |  |
| POST | `/admin/seed` |  |
| GET | `/applicability` |  |
| POST | `/applicability` |  |
| GET | `/cross-register-mappings` |  |
| POST | `/cross-register-mappings` |  |
| GET | `/cross-register-mappings/{id}` |  |
| GET | `/cross-register-mappings/{id}/supersession` |  |
| POST | `/cross-register-mappings/{id}/versions` |  |
| GET | `/healthz` |  |
| GET | `/items` |  |
| POST | `/items` |  |
| GET | `/items/{id}` |  |
| GET | `/items/{id}/supersession` |  |
| POST | `/items/{id}/versions` |  |
| GET | `/models` |  |
| POST | `/models` |  |
| GET | `/models/{id}` |  |
| POST | `/models/{id}/validate` |  |
| GET | `/protocol-bindings` |  |
| POST | `/protocol-bindings` |  |
| GET | `/protocol-bindings/{id}` |  |
| GET | `/schemas/profile-manifest` |  |
| GET | `/services` |  |
| POST | `/services` |  |
| GET | `/services/{id}` |  |
| GET | `/services/{id}/supersession` |  |
| POST | `/services/{id}/versions` |  |
| GET | `/verification-mechanisms` |  |
| POST | `/verification-mechanisms` |  |
| GET | `/verification-mechanisms/{id}` |  |
| GET | `/{id}` |  |
| GET | `/{id}/supersession` |  |
| POST | `/{id}/versions` |  |
