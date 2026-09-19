---
title: "trust — API reference"
description: "Every operation of the trust service, rendered from its committed OpenAPI contract."
---

# trust — API reference

The contract is declared once, on the handlers of `unidpp-trust`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-trust/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 7 environment variables (`x-unidpp-env-keys`).

## trust

The public surface: discovery, health, keyring, graph, anchor bundle, trust lists, master list, revocations, operators, evidence

### GET `/`

Serve the discovery document.

**Responses**

- `200` — The discovery document: the service identity, the signing posture (the tree-head domain, both suites, the signature headers), the endpoint table, the revocation semantics, the as-of conventions, the seed-fixture provenance and the authentication rule

### GET `/anchor-bundle`

Serve the verifier artifact for one jurisdiction.

**Parameters**

| Name | In | Description |
|---|---|---|
| `jurisdiction` | query | The jurisdiction whose trust list the bundle carries beside the master list |
| `at` | query | An RFC 3339 instant; the bundle is rendered as of that instant (alias `asof`) |

**Responses**

- `200` — The verifier-shaped anchor bundle: the jurisdiction's trust list and the M-of-K master list, with wire-form keys a verifier rebuilds without touching the asymmetric PublicKey serde
- `400` — The `jurisdiction` parameter is absent, or the `at` parameter is present and is not a valid RFC 3339 instant
- `404` — No trust list exists for the requested jurisdiction

### GET `/evidence`

GET /evidence — the public catalogue: metadata only (ids, content
types, required scopes, sizes). Content never appears here; a
document is released only under its scope.
Serve the gated-evidence catalogue.

**Responses**

- `200` — The catalogue metadata only: identifiers, content types, descriptions, required scopes and sizes; document content never appears in the catalogue

### GET `/evidence/{id}`

GET /evidence/{id}?scope=... — release a gated evidence document
(TODO.impl 224): the MobileQR `getbase64str` pattern with the
honesty doctrine applied. The scope arrives as the `scope` query
parameter or the `X-UniDPP-Scope` header (the parameter outranks
the header); the requester, when presented, as `requester` or
`X-UniDPP-Requester`. A scope that does not satisfy the
registration is a **stated 403 naming the required scope** — never
a silent 404; a release journals the access decision and the
response is signed over the exact bytes returned (integrity is the
signature, not a digest field).
Release a gated evidence document under its scope.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The evidence identifier |
| `scope` | query | The requester's scope; the `X-UniDPP-Scope` header is accepted when the parameter is absent, and the parameter outranks the header |
| `requester` | query | The requester identity the journal records; the `X-UniDPP-Requester` header is accepted when the parameter is absent |

**Responses**

- `200` — The document bytes are released and the signature covers the exact bytes returned; the response carries the registered content type and the required scope, and the release is journaled
- `403` — The presented scope does not satisfy the registration; the refusal is a stated error naming the required scope, and no release is journaled
- `404` — No evidence document with this identifier is registered

### GET `/graph`

Serve the full trust graph.

**Parameters**

| Name | In | Description |
|---|---|---|
| `at` | query | An RFC 3339 instant; the graph is rendered as of that instant (alias `asof`) |

**Responses**

- `200` — The trust graph: the node count, the edge count, the nodes and the delegation edges, stamped with the as-of instant; a verifier reconstructs the signatif objects from this document
- `400` — The `at` parameter is present and is not a valid RFC 3339 instant

### GET `/healthz`

Liveness probe.

**Responses**

- `200` — The service is serving; the signed status names the service and carries the as-of instant

### GET `/keyring`

Serve the public keyring.

**Responses**

- `200` — The public keyring: the keyring mode, the per-role suites, key ids and hex-encoded public anchors a verifier pins (the CLI `--anchor`), the signing domain and the verification recipe matching the response headers

### GET `/master-list`

Serve the M-of-K master list.

**Parameters**

| Name | In | Description |
|---|---|---|
| `at` | query | An RFC 3339 instant; attestations are verified against the witness set as of that instant (alias `asof`) |

**Responses**

- `200` — The master list: the M-of-K shape, the witness list, and every entry with its attestations, the live per-attestation verification results, the verified-witness count and the quorum verdict
- `400` — The `at` parameter is present and is not a valid RFC 3339 instant

### GET `/operators/{node}`

GET /operators/{node}?at= — the operator surface (TODO.impl 224):
one operator's credential directory rendered from the same
registries (MobileQR's firm page + credential 有效期 counterpart):
identity (kind, registered keys), delegation position (edges in
and out with their scopes), trust-list memberships **with their
validity windows** (`not_before` / `superseded_at`), master-list
attestations, and revocation standing. An unknown operator is a
stated 404.
Serve the operator surface for one node.

**Parameters**

| Name | In | Description |
|---|---|---|
| `node` | path | The operator's node id |
| `at` | query | An RFC 3339 instant; memberships are read for force at that instant (alias `asof`) |

**Responses**

- `200` — The operator's credential directory: identity (kind, registered keys), delegation position (edges in and out with their scopes), trust-list memberships with their validity windows, master-list attestations and revocation standing
- `400` — The node id is not a valid operator node id, or the `at` parameter is present and is not a valid RFC 3339 instant
- `404` — No operator with this node id is known here

### GET `/revocations`

Serve the revocation ledger with the live retroactivity reading.

**Parameters**

| Name | In | Description |
|---|---|---|
| `at` | query | An RFC 3339 instant; each declaration is read for void-ab-initio standing at that instant (alias `asof`) |
| `known_by` | query | An RFC 3339 evidentiary cutoff; declarations made after it keep prior as-of verifications valid |
| `window` | query | A distrust window `START..END` (or `START,END`); declarations whose window overlaps it are returned |
| `subject` | query | Restrict the response to declarations naming this subject (prefix match) |
| `retroactive` | query | `true` restricts to retroactive reasons, `false` to prospective reasons |

**Responses**

- `200` — The declarations with the live reading: `known_at_cutoff`, `voids_at_as_of`, `standing_at_as_of`, the quorum verdict for retroactive declarations and the governing rule
- `400` — The `at`, `known_by` or `window` parameter does not parse, or `retroactive` is not a boolean

### GET `/trust-lists`

Serve the jurisdiction trust lists.

**Parameters**

| Name | In | Description |
|---|---|---|
| `at` | query | An RFC 3339 instant; every entry carries `in_force_at_as_of` for that instant (alias `asof`) |
| `jurisdiction` | query | Restrict the response to one jurisdiction |
| `framework` | query | Restrict the response to the lists whose framework matches this value |

**Responses**

- `200` — The trust lists, each with its jurisdiction, framework and entries with their validity windows, sorted by jurisdiction
- `400` — The `at` parameter is present and is not a valid RFC 3339 instant

### GET `/trust-lists/{jur}`

Serve one jurisdiction's trust list.

**Parameters**

| Name | In | Description |
|---|---|---|
| `jur` | path | The jurisdiction (matched case-insensitively) |
| `at` | query | An RFC 3339 instant; every entry carries `in_force_at_as_of` for that instant (alias `asof`) |

**Responses**

- `200` — The jurisdiction's trust list: jurisdiction, framework and the entries with their validity windows
- `400` — The `at` parameter is present and is not a valid RFC 3339 instant
- `404` — No trust list exists for the requested jurisdiction

## admin

The operator surface: node, edge, trust-list, master-list and revocation mutations, evidence registration, the audit log

### POST `/admin/evidence`

POST /admin/evidence — register a gated evidence document: id,
contentType, description, requiredScope, contentHex (hex-encoded
bytes; the journal stores the same encoding, so replay is exact).
Register a gated evidence document.

**Request body**: `{{"id": ..., "requiredScope": ..., "contentHex": ...}}` — the bytes hex-encoded; optional `contentType` (default `application/octet-stream`) and `description`. Ungated registration is refused, and re-registration of an identifier is a conflict because supersession of evidence is a new identifier, not an edit

**Responses**

- `201` — The document is registered; its catalogue metadata and the audit sequence number are stated
- `400` — Invalid JSON, a missing `id`, `requiredScope` or `contentHex`, or a `contentHex` that does not decode
- `401` — A bearer token is configured and the request does not carry it
- `409` — An evidence document with this identifier is already registered

### GET `/admin/log`

Serve the append-only audit log.

**Parameters**

| Name | In | Description |
|---|---|---|
| `limit` | query | Records to return (default 100, maximum 10 000) |
| `offset` | query | Records to skip (default 0) |

**Responses**

- `200` — The audit-log window: the total record count, the offset and the records
- `401` — A bearer token is configured and the request does not carry it

### POST `/edges`

Add a delegation credential to the trust graph.

**Request body**: The parent-signed delegation credential document: `parent`, `child`, the signature slots and the delegated scope

**Responses**

- `201` — The credential is added; the stored credential and the audit sequence number are stated
- `400` — Invalid JSON, or a credential the graph rejects (an unknown endpoint, an invalid signature or a scope violation)
- `401` — A bearer token is configured and the request does not carry it

### POST `/master-list/entries`

Upsert one master-list entry.

**Request body**: The entry: `node` and `attestations` (witness, instant, signature slot); every attestation must name a witness that is already registered

**Responses**

- `201` — The entry is upserted; the node, the attestations and the audit sequence number are stated
- `400` — Invalid JSON, an invalid entry, or an attestation naming an unregistered witness
- `401` — A bearer token is configured and the request does not carry it

### POST `/master-list/witnesses`

Replace the witness set of the master list.

**Request body**: `{{"m": <threshold>, "witnesses": [...]}}` — the M-of-K shape is replaced wholesale by the stated threshold and witness keys

**Responses**

- `201` — The witness set is replaced; the new M-of-K shape with the rendered witnesses and the audit sequence number are stated
- `400` — Invalid JSON, a missing `m` or `witnesses`, or an `m` that exceeds the witness count
- `401` — A bearer token is configured and the request does not carry it

### POST `/nodes`

Register a trust-graph node.

**Request body**: The node document: `id` and `kind` (root, threshold-group, delegated or end); optional `keys`, which are merged into any existing registration of the same node

**Responses**

- `201` — The node is registered; the stored node and the audit sequence number are stated
- `400` — Invalid JSON or an invalid node document
- `401` — A bearer token is configured and the request does not carry it

### POST `/revocations`

Declare a revocation.

**Request body**: The declaration: `subject`, `reason`, `declared_at` (RFC 3339), `declared_by` and `window`; a retroactive reason additionally requires a quorate attestation (member-key slots, or a threshold-ceremony group signature pinned on the quorum node — see `quorum`)

**Responses**

- `201` — The declaration is recorded; the subject, the reason, the window and the audit sequence number are stated
- `400` — Invalid JSON or an invalid declaration document
- `401` — A bearer token is configured and the request does not carry it
- `422` — The declaration is refused on the merits: a retroactive reason without a quorum attestation, or an attestation that does not reach the threshold

### POST `/trust-lists`

Register a jurisdiction trust list.

**Request body**: `{{"jurisdiction": ...}}`; optional `framework` and an initial `entries` array, which is applied after the list is registered

**Responses**

- `201` — The list is registered; the jurisdiction, the framework and the audit sequence number are stated
- `400` — Invalid JSON, a missing or invalid `jurisdiction`, or an invalid entry in `entries`
- `401` — A bearer token is configured and the request does not carry it
- `409` — A trust list for this jurisdiction is already registered

### POST `/trust-lists/{jur}/entries`

Upsert one entry of a jurisdiction trust list.

**Parameters**

| Name | In | Description |
|---|---|---|
| `jur` | path | The jurisdiction (matched case-insensitively) |

**Request body**: The entry: `node` and `not_before` (RFC 3339); optional `superseded_at`, an RFC 3339 instant whose presence is the withdrawal of the entry

**Responses**

- `201` — The entry is upserted; the jurisdiction, the node, the validity window and the audit sequence number are stated
- `400` — Invalid JSON or an invalid entry document
- `401` — A bearer token is configured and the request does not carry it
- `404` — No trust list exists for this jurisdiction
