---
title: "projector — API reference"
description: "Every routed endpoint of the PROJECTOR service, generated from its router."
---

# projector — API reference

Generated from [`unidpp-projector/src/api.rs`](https://github.com/unidpp/unidpp-projector/blob/main/src/api.rs) — the router is the
source of truth; regenerate with `tools/gen-api-reference.sh`.

| Method | Path | Description |
|---|---|---|
| GET | `/` | service discovery (the endpoint contract) |
| GET | `/healthz` | liveness |
| GET | `/render` |  |
| GET | `/view` |  |

> The module docs describe these without a matching route —
> check the source: `GET /render?passport=<id>&profile=<profile-item>&lang=<tag>[&at=<RFC3339>]`, `GET /view?passport=<id>&profile=<profile-item>&actor=<role>[&at=<RFC3339>]`
