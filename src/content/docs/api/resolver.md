---
title: "resolver — API reference"
description: "Every routed endpoint of the RESOLVER service, generated from its router."
---

# resolver — API reference

Generated from [`unidpp-resolver/src/api.rs`](https://github.com/unidpp/unidpp-resolver/blob/main/src/api.rs) — the router is the
source of truth; regenerate with `tools/gen-api-reference.sh`.

| Method | Path | Description |
|---|---|---|
| GET | `/` |  |
| GET | `/.well-known/unidpp-resolver` |  |
| POST | `/admin/dark` |  |
| GET | `/admin/identifiers/{*identifier}` |  |
| POST | `/admin/linksets` |  |
| GET | `/admin/log` |  |
| POST | `/admin/revocations` |  |
| GET | `/healthz` |  |
| POST | `/normalize` |  |
| GET | `/resolve` |  |
