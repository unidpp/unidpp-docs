---
title: "gateway — API reference"
description: "Every routed endpoint of the GATEWAY service, generated from its router."
---

# gateway — API reference

Generated from [`unidpp-gateway/src/api.rs`](https://github.com/unidpp/unidpp-gateway/blob/main/src/api.rs) — the router is the
source of truth; regenerate with `tools/gen-api-reference.sh`.

| Method | Path | Description |
|---|---|---|
| GET | `/` | discovery: both bindings documented as C4 protocol renderings |
| GET | `/en18222/v1/dppsByProductId/{gtin}` |  |
| GET | `/healthz` | liveness |
| POST | `/untp/ingest` | the import direction: a UNTP passport VC (bare or triad) mints a core passport with a deterministic identity; conformity → profile bindings |
| GET | `/untp/product/{id}` | the UNTP verifiable-credential triad (passport VC + conformity credentials + link-resolver entry) with the py-adapter verdict |

> The module docs describe these without a matching route —
> check the source: `GET /en18222/v1/dppsByProductId/{gtin}?representation=full\`
