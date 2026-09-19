---
title: "resolver — API reference"
description: "Every operation of the resolver service, rendered from its committed OpenAPI contract."
---

# resolver — API reference

The contract is declared once, on the handlers of `unidpp-resolver`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-resolver/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 5 environment variables (`x-unidpp-env-keys`).

## resolution

Discovery, resolution and carrier normalization

### GET `/`

Serve the discovery document.

**Responses**

- `200` — The discovery document: identifier keys, carrier syntaxes, context routing, link types, content negotiation, entry points, rotation and correlation semantics, the national-intermediary posture and the enumeration-resistance statement

### GET `/.well-known/unidpp-resolver`

Serve the discovery document at its well-known path.

**Responses**

- `200` — The discovery document (identical bytes to `GET /`)

### GET `/healthz`

Liveness probe.

**Responses**

- `200` — The service is serving

### POST `/normalize`

Translate a carrier value to its canonical identifier.

**Request body**: The carrier under test: `{"carrier": "..."}`

**Responses**

- `200` — The parsed carrier: scheme, identifier components and the canonical form
- `400` — Invalid JSON, a missing `carrier`, an invalid check digit or an unrecognized syntax

### GET `/resolve`

Resolve an identifier to its linkset.

**Parameters**

| Name | In | Description |
|---|---|---|
| `identifier` | query | The identifier in any supported syntax (ISO/IEC 15459 URN, GS1 element string or Digital Link, GB/T 33993 path or custom code, legacy EAN-13); mutually exclusive with `carrier` |
| `carrier` | query | A complete carrier value; translated, then resolved — mutually exclusive with `identifier` |
| `asof` | query | An RFC 3339 instant; the record is resolved as of that instant (I13) |
| `profile` | query | Context dimension: profile |
| `role` | query | Context dimension: verifier role |
| `lang` | query | Context dimension: language (BCP 47, exact match then primary-subtag fallback) |
| `region` | query | Context dimension: region |
| `linkType` | query | The link type to resolve (default `dpp`; `all` returns every link) |

**Responses**

- `200` — The linkset document (RFC 9264), carrying the rotation and same-subject correlation statements as members and `X-UniDPP-*` headers; the `Link` header names the default link
- `400` — Unparseable identifier, invalid carrier check digit, or mutually exclusive parameters
- `404` — The no-information 404: unknown and dark identifiers answer byte-identically (I12)

## admin

The operator surface: linksets, revocations, dark identities, rotation, correlation, the record log

### POST `/admin/correlations`

POST /admin/correlations — record a same-subject correlation
(TODO.impl 225 / spec 6.3 k): `identifierA` and `identifierB`
denote one physical subject under different schemes. The local
side (A) must be known here — a correlation is a statement about
registered content; the counterpart (B) must be well-formed but
need NOT be locally registered (the cross-registry reality: a
national resolver may hold only one side of the claim). Direction
is `mutual` | `from-a` | `from-b`.
Record a same-subject correlation (spec 6.3 k): `identifierA`
(known here) and `identifierB` (well-formed; local registration
not required — the cross-registry case) denote one physical
subject under different schemes. Correlates, never consolidates.

**Request body**: `{{"identifierA": ..., "identifierB": ...}}`; optional `assertor`, `evidence` and `direction` (`mutual` | `from-a` | `from-b`, default `mutual`)

**Responses**

- `201` — The correlation is recorded on both identifiers and is stated on every subsequent resolution of either side
- `400` — The local side is not known here, the counterpart is not well-formed, the pair is identical, or the direction is not one of the three
- `401` — A bearer token is configured and the request does not carry it

### POST `/admin/dark`

Set or clear the dark state of an identifier (I12: a dark
identifier answers the byte-identical no-information 404).

**Request body**: `{{"identifier": ..., "dark": <boolean>}}`; optional `effectiveAt` (RFC 3339, default now)

**Responses**

- `200` — The dark state is recorded; the sequence number is stated
- `400` — An invalid body
- `401` — A bearer token is configured and the request does not carry it

### GET `/admin/identifiers/{identifier}`

The operator's view of one identifier.

**Parameters**

| Name | In | Description |
|---|---|---|
| `identifier` | path | The identifier key, in any supported syntax |

**Responses**

- `200` — The identifier's entries, dark state, rotation and correlations
- `401` — A bearer token is configured and the request does not carry it
- `404` — Not known here (the no-information form)

### POST `/admin/linksets`

Register linkset entries for an identifier (append-only).

**Request body**: `{{"identifier": ..., "links": [entry, ...]}}` — at least one entry; `identifier` in any supported syntax

**Responses**

- `201` — Registered; the stored entries and the record count are stated
- `400` — Invalid JSON, an unparseable identifier, or an empty `links` array
- `401` — A bearer token is configured and the request does not carry it

### PUT `/admin/linksets`

Replace the effective linkset of an identifier (append-only: the
currently effective entries are revoked, the new set appended).

**Request body**: `{{"identifier": ..., "links": [entry, ...]}}`; optional `effectiveAt` (RFC 3339, default now)

**Responses**

- `200` — Replaced; the revoked ids, the new entries and the record count are stated
- `400` — Invalid JSON, an unparseable identifier, or an empty `links` array
- `401` — A bearer token is configured and the request does not carry it

### GET `/admin/log`

Read the append-only record log.

**Parameters**

| Name | In | Description |
|---|---|---|
| `limit` | query | Records to return (default 100, maximum 10 000) |
| `offset` | query | Records to skip (default 0) |

**Responses**

- `200` — The journal window
- `401` — A bearer token is configured and the request does not carry it

### POST `/admin/revocations`

Revoke one linkset entry of an identifier.

**Request body**: `{{"identifier": ..., "entryId": <id>}}`; optional `effectiveAt` (RFC 3339, default now) and `reason` (default `revoked`)

**Responses**

- `200` — Revoked as of the effective instant
- `400` — An unknown identifier-entry pair or an invalid body
- `401` — A bearer token is configured and the request does not carry it

### POST `/admin/supersessions`

POST /admin/supersessions — record an identity rotation (TODO.impl
224): from `effectiveAt` the identifier's responses state the
successor (linkset block + `X-UniDPP-Superseded-By`, and a stated
404 once its entries are gone). The identifier must already be
known here — a rotation record is a statement *about* registered
content, and refusing unknown identifiers keeps typos from
manufacturing phantom history.
Record an identity rotation: from `effectiveAt`, every non-dark
response for the identifier states its successor.

**Request body**: `{{"identifier": ..., "successor": ...}}`; optional `effectiveAt` (RFC 3339), `authority` and `reason`. The identifier must already be known here, and the successor must not be empty — an unstated successor is a revocation, not a rotation

**Responses**

- `200` — The rotation is recorded; the journal record is stated
- `400` — An unknown identifier, an empty successor, or an invalid body
- `401` — A bearer token is configured and the request does not carry it
