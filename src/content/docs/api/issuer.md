---
title: "issuer — API reference"
description: "Every operation of the issuer service, rendered from its committed OpenAPI contract."
---

# issuer — API reference

The contract is declared once, on the handlers of `unidpp-issuer`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-issuer/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 10 environment variables (`x-unidpp-env-keys`).

## issuance

Discovery, health, the public keyring and the passport lifecycle: creation, event appendage, pack minting, the document view and the verdict

### GET `/`

Serve the discovery document.

**Responses**

- `200` — The discovery document: the service identity and build, the endpoint index, the keyring mode, the signature suites for events and packs, the as-of stamping convention, the authentication posture and the registry configuration

### GET `/healthz`

Serve the liveness probe.

**Responses**

- `200` — The service is serving

### GET `/keyring`

Serve the public anchors a verifier pins.

**Responses**

- `200` — The keyring's public side: the event key and every pack key, each with its suite, key identifier and public value

### GET `/passports`

List the issued passports, paged.

**Parameters**

| Name | In | Description |
|---|---|---|
| `limit` | query | Records per page (default 100, cap 500, floor 1) |
| `offset` | query | Records to skip (default 0) |

**Responses**

- `200` — The page: the total count (independent of the window), the window parameters and the passport summaries (passport id, product identity, capability class, economic-operator identity, event count); the listing is current-state
- `400` — A non-numeric `limit` or `offset`

### POST `/passports`

Create a passport from the identity, the type reference, the config vector and the capability class.

**Request body**: The creation request: `identity` (aliases `product_id` and `id`) is required; optional `granularity`, `capability` (`S0`-`S3` or a canonical name, default `S0`), `type_ref` (alias `type`), `eo_id`, `resolver_uri`, `passport_id` (default: the content- and time-derived identity), `valid_from` and `valid_to` (RFC 3339), and `config` (alias `configuration`; a non-empty string or an array of non-empty strings)

**Responses**

- `201` — The passport is created: the passport id, the schema, the product identity and granularity, the type reference, the config vector, the capability class, the economic-operator identity, the resolver URI, the validity interval, the empty log and the audit sequence are stated
- `400` — An invalid body, an unparseable product identity, an unknown granularity or capability token, a rejected passport document, or a config vector that is not an array of non-empty strings
- `401` — A bearer token is configured and the request does not carry it
- `409` — The passport id is already registered

### GET `/passports/{id}`

Render the passport document: the core, the manifest layer and the log head.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The passport id |
| `at` | query | An RFC 3339 instant; the document is rendered as of that instant (alias `asof`) |

**Responses**

- `200` — The passport view: the document loadable by `unidpp pack`/`verify` verbatim, plus the config vector, the replayed status and safety state, the custodian when stated, the log head, the event count and the as-of stamp
- `400` — An invalid `at` instant
- `404` — The no-information 404: unknown passports answer the byte-identical body (I12)

### POST `/passports/{id}/events`

Append a typed event to a passport's log; the server signs it, and illegal status transitions are rejected (I6).

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The passport id |

**Request body**: `type` is required (a typed-event token); optional `data` (alias `payload`; the event class's default payload is used when it has one), `at` (RFC 3339, default now), `actor` (default: the passport's economic operator), `actor_role` (default: the event class's appender role), and `sign` (default true; a false value leaves the event unsigned)

**Responses**

- `201` — The event is appended: the sequence number, the event type, the occurred-at instant, the actor, the trust marker, the signature record, the log head, the resulting status and safety state and the audit sequence are stated
- `400` — An invalid body, an unknown event type, a rejected payload, or a missing `data` where the event class has no default payload
- `401` — A bearer token is configured and the request does not carry it
- `404` — The passport is not known here (the no-information 404)
- `409` — The event's status transition is illegal (I6) or the sequence collides

### POST `/passports/{id}/pack`

Mint the Tier-A offline pack with a real carrier signature and QR budget enforcement.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The passport id |

**Request body**: The mint options, all optional (an empty body is accepted): `budget` (error-correction level and version), `encoding` (default `hex`), `sign` (default true), and `suite` (alias `suites`; one token or a comma-separated co-signature list overriding the deployment policy for this pack)

**Responses**

- `201` — The pack is minted over the passport log: the encoded pack, the byte budget accounting (used, projected, QR version, margin), the signature records with their anchors and the keyring anchors are stated
- `400` — An invalid body, an unknown budget, encoding or suite token, or a pack signing failure
- `404` — The passport is not known here (the no-information 404)
- `413` — The pack exceeds the requested QR budget

### GET `/passports/{id}/verdict`

Run the full-pipeline verdict for a passport and state its coverage.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The passport id |
| `at` | query | An RFC 3339 instant; the verdict is computed as of that instant (alias `asof`) |
| `max_age` | query | The freshness window of the Tier-A verdict leg in seconds (default: the deployment's `UNIDPP_ISSUER_MAX_AGE`; `0` selects static/archival semantics) |

**Responses**

- `200` — The verdict and its coverage: the log verdict, the event-signature audit (every recorded signature re-verified against the keyring anchor), the Tier-A carrier leg (grade, findings, readings, coverage, freshness, trust marker, byte accounting) and the config resolution
- `400` — An invalid `at` or `max_age`, or a pack signing failure in the carrier leg
- `404` — The passport is not known here (the no-information 404)
- `413` — The Tier-A carrier leg exceeds the QR budget

## admin

The operator surface: profile registration, applicability binding and the audit log

### GET `/admin/applicability`

Serve the applicability bindings in force for a product type.

**Parameters**

| Name | In | Description |
|---|---|---|
| `product_type` | query | The product type whose bindings are in force |
| `at` | query | An RFC 3339 instant; the bindings are evaluated as of that instant (alias `asof`) |

**Responses**

- `200` — The product type and the count and records of the bindings in force at the requested instant
- `400` — A missing `product_type` or an invalid `at` instant
- `401` — A bearer token is configured and the request does not carry it

### POST `/admin/applicability`

Bind a profile to a product type.

**Request body**: `profile_id` and `product_type` are required; optional `profile_version`, `effective_from` (RFC 3339, default now), `effective_until` (must not precede `effective_from`), and `retroactive` (default false)

**Responses**

- `201` — The binding is recorded: the stored binding, the transport used (`registry` or the fixtures fallback), the registry response when a live registry answered, and the audit sequence are stated
- `400` — An invalid body, a profile that is not registered here, an `effective_until` preceding `effective_from`, or a registry rejection of the forwarded binding
- `401` — A bearer token is configured and the request does not carry it

### GET `/admin/log`

Serve the append-only audit log, paged.

**Parameters**

| Name | In | Description |
|---|---|---|
| `limit` | query | Records to return (default 100, maximum 10 000) |
| `offset` | query | Records to skip (default 0) |

**Responses**

- `200` — The journal window: every recorded mutation of every passport, profile and binding, in recording order
- `401` — A bearer token is configured and the request does not carry it

### GET `/admin/profiles`

List the locally registered profiles.

**Responses**

- `200` — The count and the locally registered profiles with their definitions, versions, registers, jurisdictions, data points and registration instants
- `401` — A bearer token is configured and the request does not carry it

### POST `/admin/profiles`

Register a profile locally and forward it to the configured registry.

**Request body**: `profile_id` and `definition` are required; optional `version` (default `1.0.0`), `register_id`, `jurisdiction`, `issuer_class` (default `declaration`), and `data_points` (an array of non-empty strings). The registration is forwarded in its signed form: the issuer composes the manifest and signs it in the Profile domain

**Responses**

- `201` — The profile is registered: the stored record, the transport used (`registry` or the fixtures fallback), the registry response when a live registry answered, and the audit sequence are stated
- `400` — An invalid body, a registry rejection of the forwarded registration, or a profile id already registered here
- `401` — A bearer token is configured and the request does not carry it
- `409` — The profile id is already registered here
