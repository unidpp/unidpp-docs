---
title: Registry
description: "The unidpp-registry service — ISO 19135 item and discovery registry: endpoints, environment, semantics."
---

The registry is the register service: item registration under ISO 19135
discipline (version supersession, point-in-time resolution), applicability
bindings, and the discovery registry (C3 services, C4 protocol bindings, C5
verification mechanisms, C1 units). In the reference deployment it binds
`127.0.0.1:8390`; the JP peer runs the same binary on `8399` with its own
journal.

Reads are public. Mutations require a Bearer token when
`UNIDPP_REGISTRY_ADMIN_TOKEN` is set (open in dev mode). Every response is
as-of stamped (`x-as-of` header plus an `as_of` body field); every mutation
is journaled and audited.

## Endpoints

| Endpoint | What |
|---|---|
| `GET /` | discovery: the endpoint map, item classes, subregisters, intake checks, auth and content-negotiation declarations |
| `GET /healthz` | liveness (`ok`) |
| `POST /items` | register a new item with its first version |
| `GET /items?class=&register=&at=&limit=` | list items (class/register-scoped) |
| `GET /items/{id}?at=` | the item with the version in force at `at` |
| `POST /items/{id}/versions` | supersede: register a new version |
| `GET /items/{id}/supersession?from=` | the supersession chain |
| `POST /applicability` | bind a profile to a product type with an effective window |
| `GET /applicability?product_type=&at=&subject_facts=` | which profiles bind at `at` (or `POST` with subject facts — evaluates clock predicates) |
| `GET /services?class=&jurisdiction=&at=` · `POST /services` | C3 service registry |
| `GET /services/{id}` · `POST /services/{id}/versions` · `GET /services/{id}/supersession` | service lifecycle |
| `GET /protocol-bindings` · `GET /protocol-bindings/{id}` · `POST /protocol-bindings` | C4 protocol bindings |
| `GET /verification-mechanisms` · `GET /verification-mechanisms/{id}` · `POST /verification-mechanisms` | C5 verification mechanisms |
| `GET /schemas/profile-manifest` | the profile-manifest JSON Schema (draft 2020-12) |
| `POST /models` · `GET /models` · `GET /models/{id}?at=&hash=` · `POST /models/{id}/validate` | EXPRESS model deposits (content hash, expressir validation) |
| `GET /cross-register-mappings?item=&source=&target=` | mappings by item, source, target |
| `GET /admin/log?limit=&offset=` | the append-only audit log (admin) |
| `POST /admin/seed` | populate the seed dataset (C3/C4/C5 + units) |

**Subregisters** mount the same endpoints, class-scoped, at the plural class
names: `/data-elements`, `/profiles`, `/crypto-suites`, `/transforms`,
`/trust-anchors`, `/units`, `/cross-register-mappings`.

Item classes: `data-element`, `profile`, `crypto-suite`, `transform`,
`trust-anchor`, `unit`, `model`, `cross-register-mapping`. Item statuses:
`valid`, `superseded`, `retired`. Service statuses: `active`, `superseded`,
`suspended`, `succeeded`.

## Examples (recorded against the reference deployment)

```sh
$ curl -s 'http://127.0.0.1:8390/items?limit=1' | jq '{count}'
{ "count": 1531 }

$ curl -s 'http://127.0.0.1:8390/applicability?product_type=momiji:e8&at=2027-06-01T00:00:00Z' \
    | jq '[.applicability[].binding.profile_item]'
["urn:unidpp:profile:jp-road-traffic"]

$ curl -s 'http://127.0.0.1:8390/units' | jq '.items | length'
10

# As-of resolution: before the JP profile's effective window (2027-04-01),
# no version is in force — version is null, not an error.
$ curl -s 'http://127.0.0.1:8390/items/urn%3Aunidpp%3Aprofile%3Ajp-road-traffic?at=2026-01-01T00:00:00Z' \
    | jq '{identifier, version: .version.status}'
{ "identifier": "urn:unidpp:profile:jp-road-traffic", "version": null }
```

## Content negotiation

Collection reads (`GET /items` and subregister listings) serve the canonical
CDDAL plain-text dictionary form when the request's `Accept` lists
`text/cddal`; JSON is the default and the fallback:

```sh
$ curl -s -H 'Accept: text/cddal' http://127.0.0.1:8390/units | head -5
TERM unit-a
  register: unidpp-seed
  class: unit
  name: ampere
  definition: ampere
```

An `Accept` listing nothing servable falls back to JSON with an
`x-content-negotiation: unknown-accept-fallback` warning header.

## Environment

Manifest-rendered (see the [manifest reference](/operators/manifest/#services-registry)):

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_REGISTRY_BIND` | listen address | `127.0.0.1:8090` |
| `UNIDPP_REGISTRY_ADMIN_TOKEN` | Bearer token for mutations and `/admin/*`; unset = open | unset |
| `UNIDPP_REGISTRY_STATE_FILE` | append-only JSONL journal (replayed on start) | none |

Direct environment (deployment-level, not manifest fields):

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_REGISTRY_SEED_ON_DEMAND` | `POST /admin/seed` populates the seed dataset on demand | `true` |
| `UNIDPP_REGISTRY_SEED_EXPRESS` | deposit the vendored UniDPP EXPRESS core schema at startup | `true` |

## Semantics and degradation

- **As-of everywhere.** `?at=` (alias `?asof=`) on reads; `x-as-of` header on
  responses. Point-in-time queries are the registry's core function, not an
  audit add-on.
- **No dedup on applicability.** Binding the same profile twice creates two
  bindings — the seed script's idempotence works by querying first. This is
  deliberate (bindings are dated facts), and an operator error you notice at
  query time.
- **Intake checks.** Item intake validates the profile-manifest schema,
  profile satisfiability, and cross-register-mapping integrity; failures are
  4xx with the named check.
- **EXPRESS validation degrades explicitly.** Model deposits run `expressir`
  as a subprocess; without expressir on `PATH` the deposit is stored with
  `validation.status = pending`, never silently marked valid.
- **Discovery signatures.** Service descriptors carry an Ed25519 signature
  over the canonical-JSON body; signatures are verified at intake only
  (replay re-applies the stored record).
- **Journal replay** restores all state on start; the journal never rewrites.
