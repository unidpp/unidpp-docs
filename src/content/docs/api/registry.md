---
title: "registry — API reference"
description: "Every operation of the registry service, rendered from its committed OpenAPI contract."
---

# registry — API reference

The contract is declared once, on the handlers of `unidpp-registry`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-registry/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 5 environment variables (`x-unidpp-env-keys`).

## register

The ISO 19135 register: items, subregisters, cross-register mappings, the manifest schema

### GET `/`

Serve the discovery document.

**Responses**

- `200` — The discovery document: endpoint references, item classes, statuses, subregister mounts, as-of semantics, content negotiation, intake checks and the auth posture

### GET `/cross-register-mappings`

GET /cross-register-mappings — with `item`/`source`/`target`
filters, the directional lookup; without them, the generic
class-scoped listing (content-negotiated like every listing).
List cross-register mappings; with `item`, `source` or `target`
present this is the directional lookup.

**Parameters**

| Name | In | Description |
|---|---|---|
| `item` | query | Directional lookup: the mapped item |
| `source` | query | Directional lookup: the source register |
| `target` | query | Directional lookup: the target register |
| `register` | query | Filter by register id |
| `at` | query | An RFC 3339 instant (alias: `asof`) |

**Responses**

- `200` — The listing or the directional result, as-of stamped

### POST `/cross-register-mappings`

Register a cross-register mapping (ISO 19135 harmonization: a
mapping between items of two registers is itself a registered
item).

**Request body**: The mapping item and its first version

**Responses**

- `201` — Registered; the item view is stated
- `400` — An invalid body or a failed mapping-integrity check
- `401` — A bearer token is configured and the request does not carry it
- `409` — The mapping is already registered

### GET `/cross-register-mappings/{id}`

Retrieve one cross-register mapping as of an instant.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The mapping identifier |
| `at` | query | An RFC 3339 instant (alias: `asof`) |

**Responses**

- `200` — The mapping view, as-of stamped
- `404` — No such mapping as of the requested instant

### GET `/cross-register-mappings/{id}/supersession`

The supersession chain of a cross-register mapping.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The mapping identifier |
| `from` | query | Start the chain at this version |

**Responses**

- `200` — The chain, as-of stamped
- `404` — No such mapping

### POST `/cross-register-mappings/{id}/versions`

Supersede a cross-register mapping with a new version.

**Request body**: The successor version and its manifest

**Responses**

- `201` — Superseded; the new version, the superseded version and the item view are stated
- `400` — No valid version to supersede or an invalid body
- `401` — A bearer token is configured and the request does not carry it

### GET `/healthz`

Liveness probe.

**Responses**

- `200` — The service is serving

### GET `/items`

List registered items (content-negotiated; `Accept: text/cddal`
serves the canonical dictionary form).

**Parameters**

| Name | In | Description |
|---|---|---|
| `class` | query | Filter by item class |
| `register` | query | Filter by register id |
| `at` | query | An RFC 3339 instant; the listing is stated as of that instant (alias: `asof`) |

**Responses**

- `200` — The listing, as-of stamped

### POST `/items`

Register a new ISO 19135 item with its first version.

**Request body**: The item and its first version: `{register_id, item_id, class, definition, version, status: valid}`

**Responses**

- `201` — Registered; the item view is stated
- `400` — An invalid body or a failed intake check
- `401` — A bearer token is configured and the request does not carry it
- `409` — The item is already registered

### GET `/items/{id}`

Retrieve one item as of an instant.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The item identifier |
| `at` | query | An RFC 3339 instant (alias: `asof`) |

**Responses**

- `200` — The item view, as-of stamped
- `404` — No such item as of the requested instant

### GET `/items/{id}/supersession`

The supersession chain of an item.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The item identifier |
| `from` | query | Start the chain at this version |

**Responses**

- `200` — The chain, as-of stamped
- `404` — No such item

### POST `/items/{id}/versions`

Supersede an item's current version with a new one
(append-only; the window of the superseded version closes).

**Request body**: The successor version and its manifest; an explicit `supersede_version` names the version to supersede, otherwise the current valid version is superseded

**Responses**

- `201` — Superseded; the new version, the superseded version and the item view are stated
- `400` — No valid version to supersede, a manifest pin that matches no registered version, or an invalid body
- `401` — A bearer token is configured and the request does not carry it

### GET `/schemas/profile-manifest`

GET /schemas/profile-manifest — the JSON Schema (draft 2020-12)
generated from the canonical manifest model. The `as_of` member
is serving metadata (not a validation keyword; draft 2020-12
validators ignore it); the schema version rides in `$id`.
The generated JSON Schema of a profile manifest.

**Parameters**

| Name | In | Description |
|---|---|---|
| `at` | query | An RFC 3339 instant for the as-of stamp (alias: `asof`) |

**Responses**

- `200` — The JSON Schema, as-of stamped

### GET `/{class}`

List a subregister's items (content-negotiated;
`Accept: text/cddal` serves the canonical dictionary form).

**Parameters**

| Name | In | Description |
|---|---|---|
| `class` | path | The subregister's class plural |

**Responses**

- `200` — The listing, as-of stamped

### POST `/{class}`

Register an item in a class subregister (the class is the mount
point: data-elements, profiles, crypto-suites, transforms,
trust-anchors, units).

**Parameters**

| Name | In | Description |
|---|---|---|
| `class` | path | The subregister's class plural |

**Request body**: The item and its first version

**Responses**

- `201` — Registered; the item view is stated
- `400` — An invalid body or a failed intake check
- `401` — A bearer token is configured and the request does not carry it
- `409` — The item is already registered

### GET `/{class}/{id}`

Retrieve one subregister item as of an instant.

**Parameters**

| Name | In | Description |
|---|---|---|
| `class` | path | The subregister's class plural |
| `id` | path | The item identifier |

**Responses**

- `200` — The item view, as-of stamped
- `404` — No such item as of the requested instant

### GET `/{class}/{id}/supersession`

The supersession chain of a subregister item.

**Parameters**

| Name | In | Description |
|---|---|---|
| `class` | path | The subregister's class plural |
| `id` | path | The item identifier |

**Responses**

- `200` — The chain, as-of stamped
- `404` — No such item

### POST `/{class}/{id}/versions`

Supersede a subregister item's current version.

**Parameters**

| Name | In | Description |
|---|---|---|
| `class` | path | The subregister's class plural |
| `id` | path | The item identifier |

**Request body**: The successor version and its manifest

**Responses**

- `201` — Superseded; the new version, the superseded version and the item view are stated
- `400` — No valid version to supersede or an invalid body
- `401` — A bearer token is configured and the request does not carry it

## admin

The operator surface: the audit log and seeding

### GET `/admin/log`

GET /admin/log — the append-only audit log (admin, paged).
Read the append-only audit log.

**Parameters**

| Name | In | Description |
|---|---|---|
| `limit` | query | Records to return (default 100, maximum 10 000) |
| `offset` | query | Records to skip (default 0) |

**Responses**

- `200` — The journal window
- `401` — A bearer token is configured and the request does not carry it

### POST `/admin/seed`

`POST /admin/seed` — idempotent: populates the seed dataset only once
per process (or until the journal is wiped). Returns a summary of
counts registered. Disabled with `UNIDPP_REGISTRY_SEED_ON_DEMAND=0`.
Seed the register with the development corpus (refused when
`UNIDPP_REGISTRY_SEED_ON_DEMAND` is off).

**Responses**

- `200` — The seed report
- `401` — A bearer token is configured and the request does not carry it
- `403` — Seeding on demand is disabled

## applicability

Profile-to-product-type bindings and their clock predicates

### GET `/applicability`

GET /applicability?product_type=&at=&subject_facts= — which
profiles applied at `at` (legal as-of semantics: retroactive
bindings apply from their `effective_from`; non-retroactive ones
only from `registered_at`). With `subject_facts` (a JSON object),
clock predicates on the bound profiles' manifests are evaluated
at the query instant: a time-triggered profile binds only once
its threshold (`basis + duration`) is crossed. Fact predicates
are evaluated locally by the subject's custodian, never here.
Evaluate applicability bindings for a product type, optionally
against supplied subject facts (the clock predicates run against
the facts).

**Parameters**

| Name | In | Description |
|---|---|---|
| `product_type` | query | The product type (alias: `subject`) |
| `at` | query | An RFC 3339 instant (alias: `asof`) |
| `subject_facts` | query | A JSON object of subject facts for predicate evaluation |

**Responses**

- `200` — The applicability evaluation, as-of stamped
- `400` — A missing `product_type` or malformed `subject_facts`

### POST `/applicability`

POST /applicability — bind a profile to a product type with an
effective window and a retroactivity flag.
Bind a profile to a product type with an effective window and a
retroactivity flag. A body carrying `subject_facts` and no
`profile_id` is an evaluation request, not a mutation.

**Request body**: The binding: `{product_type, profile_id, ...window and retroactivity fields}`; or an evaluation request `{product_type, subject_facts, at?}`

**Responses**

- `200` — The evaluation result (when the body is an evaluation request)
- `201` — Bound; the binding view is stated
- `400` — An invalid body, or `subject_facts` combined with `profile_id`
- `401` — A bearer token is configured and the request does not carry it

## models

EXPRESS and CDDAL semantic model deposits

### GET `/models`

GET /models — list deposited models with their validation status.
List deposited models.

**Parameters**

| Name | In | Description |
|---|---|---|
| `register` | query | Filter by register id |
| `at` | query | An RFC 3339 instant (alias: `asof`) |

**Responses**

- `200` — The listing, as-of stamped

### POST `/models`

POST /models — deposit an EXPRESS model: source text + metadata;
content hash over the exact bytes; expressir validation
(subprocess; `pending` when the binary is absent; `invalid`
deposits are rejected).
Deposit an EXPRESS (or CDDAL) semantic model: source text plus
metadata; the content hash covers the exact bytes and expressir
validates the source (pending when the binary is absent; invalid
deposits are rejected).

**Request body**: `{register_id, item_id, title, version, source, submitting_organization?}`

**Responses**

- `201` — Deposited; the content hash and the validation status are stated
- `400` — An invalid body or a rejected (invalid) model
- `401` — A bearer token is configured and the request does not carry it
- `409` — The model is already deposited

### GET `/models/{id}`

GET /models/{id}?at=&hash= — the deposited source, its content
hash and validation status. With `hash=`, retrieval is pinned to
that hash (mismatch → 409).
Retrieve a deposited model; hash-pinned retrieval names an exact
byte form.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The model identifier |
| `at` | query | An RFC 3339 instant (alias: `asof`) |
| `hash` | query | Pin the retrieval to this content hash |

**Responses**

- `200` — The model record, as-of stamped
- `404` — No such model, or the pinned hash matches no deposit

### POST `/models/{id}/validate`

POST /models/{id}/validate — re-run expressir validation over the
stored source and record the outcome (the degrade path: deposits
stored `pending` become `valid`/`invalid` once expressir is
available).
Re-run expressir validation over a deposited model.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The model identifier |

**Responses**

- `200` — The validation report
- `401` — A bearer token is configured and the request does not carry it
- `404` — No such model

## discovery

The discovery registry: C3 services, C4 protocol bindings, C5 verification mechanisms

### GET `/protocol-bindings`

`GET /protocol-bindings` — list all registered protocol bindings.
List registered C4 protocol bindings.

**Parameters**

| Name | In | Description |
|---|---|---|
| `at` | query | An RFC 3339 instant (alias: `asof`) |

**Responses**

- `200` — The listing, as-of stamped

### POST `/protocol-bindings`

`POST /protocol-bindings` — register a signed C4 protocol binding.
Register a signed C4 protocol binding descriptor.

**Request body**: The signed protocol binding descriptor

**Responses**

- `201` — Registered; the stored record is stated
- `400` — The descriptor or its signature fails the intake checks
- `401` — A bearer token is configured and the request does not carry it

### GET `/protocol-bindings/{id}`

`GET /protocol-bindings/{id}` — a single protocol binding.
Retrieve one C4 protocol binding descriptor.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The protocol binding identifier |

**Responses**

- `200` — The descriptor
- `404` — No such protocol binding

### GET `/services`

`GET /services` — list services with optional `class=` and
`jurisdiction=` filters and `at=` point-in-time semantics.
List registered C3 service descriptors.

**Parameters**

| Name | In | Description |
|---|---|---|
| `class` | query | Filter by service class |
| `jurisdiction` | query | Filter by jurisdiction |
| `at` | query | An RFC 3339 instant (alias: `asof`) |

**Responses**

- `200` — The listing, as-of stamped

### POST `/services`

`POST /services` — register a signed C3 service descriptor.
Register a signed C3 service descriptor (the signature is
verified against the operator keyring at intake).

**Request body**: The signed service descriptor

**Responses**

- `201` — Registered; the stored record is stated
- `400` — The descriptor or its signature fails the intake checks
- `401` — A bearer token is configured and the request does not carry it

### GET `/services/{id}`

`GET /services/{id}` — a single service descriptor with the version
in force at `at`.
Retrieve one C3 service descriptor as of an instant.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The service identifier |
| `at` | query | An RFC 3339 instant (alias: `asof`) |

**Responses**

- `200` — The descriptor, as-of stamped
- `404` — No such service as of the requested instant

### GET `/services/{id}/supersession`

`GET /services/{id}/supersession` — the supersession chain for a
service descriptor.
The supersession chain of a C3 service descriptor.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The service identifier |
| `from` | query | Start the chain at this version |

**Responses**

- `200` — The chain, as-of stamped
- `404` — No such service

### POST `/services/{id}/versions`

`POST /services/{id}/versions` — supersede a service descriptor
with a new signed version.
Supersede a C3 service descriptor with a new signed version.

**Request body**: The signed successor descriptor

**Responses**

- `201` — Superseded; the stored record is stated
- `400` — The descriptor or its signature fails the intake checks
- `401` — A bearer token is configured and the request does not carry it

### GET `/verification-mechanisms`

`GET /verification-mechanisms` — list all registered verification
mechanisms.
List registered C5 verification mechanisms.

**Parameters**

| Name | In | Description |
|---|---|---|
| `at` | query | An RFC 3339 instant (alias: `asof`) |

**Responses**

- `200` — The listing, as-of stamped

### POST `/verification-mechanisms`

`POST /verification-mechanisms` — register a signed C5 verification
mechanism.
Register a signed C5 verification mechanism descriptor.

**Request body**: The signed verification mechanism descriptor

**Responses**

- `201` — Registered; the stored record is stated
- `400` — The descriptor or its signature fails the intake checks
- `401` — A bearer token is configured and the request does not carry it

### GET `/verification-mechanisms/{id}`

`GET /verification-mechanisms/{id}` — a single verification
mechanism.
Retrieve one C5 verification mechanism descriptor.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The verification mechanism identifier |

**Responses**

- `200` — The descriptor
- `404` — No such verification mechanism
