---
title: "API explorer"
description: "The family's HTTP contracts: every service serves its OpenAPI document and browses it live at /docs."
---

# API explorer

Every service in the UniDPP family declares its HTTP contract once,
on its handlers, and serves that contract from the running process:

- `GET /openapi.json` and `GET /openapi.yaml` answer the machine-readable contract (the YAML form carries the `x-unidpp-env-keys` deployment contract);
- `GET /docs` answers Swagger UI, the live demo interface: every operation is browsable and, against a running deployment, callable from the same page.

The contract is also committed as the `openapi.yaml` golden in each
service's repository, locked to its router by tests (a route that
escapes its contract fails the service's suite), and the reference
pages in this section render those goldens — regenerated with
`npm run gen:api`, verified with `npm run check:api`.

## The live pilot

The reference deployment runs publicly; its explorer surfaces are
reachable directly:

- [registry.unidpp.org/docs](https://registry.unidpp.org/docs/) — the register service
- [registry-jp.unidpp.org/docs](https://registry-jp.unidpp.org/docs/) — the peer register (JP)
- [console.unidpp.org](https://console.unidpp.org) — the operator console (an HTML surface; its contract documents the pages and forms)

The remaining services of the pilot deployment (issuer, projector,
gateway, archive, resolver, log, trust, hub) bind the operator
network; on any deployment of your own, the same two paths
(`/openapi.json`, `/docs`) answer on every service — the contract
convention is uniform across the family.

## The reference pages

Each page in this section renders one service's committed contract:
every operation with its parameters, request body and responses.
