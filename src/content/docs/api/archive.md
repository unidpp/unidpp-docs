---
title: "archive — API reference"
description: "Every operation of the archive service, rendered from its committed OpenAPI contract."
---

# archive — API reference

The contract is declared once, on the handlers of `unidpp-archive`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-archive/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 9 environment variables (`x-unidpp-env-keys`).

## archive

The public surface: discovery, health, the notary keyring, snapshot access and the as-of catalogue

### GET `/`

Serve the discovery document: the service identity, the OAIS
mapping, the notarization recipe, the anchoring semantics, the
storage layout and the entry points.

**Responses**

- `200` — The discovery document: the service identity and build, the ISO 14721 (OAIS) role mapping, the notarization suite and statement recipe, the anchoring semantics and the explicit unanchored fallback, the journal and snapshot-store layout, the as-of query conventions and the bearer-guard posture

### GET `/healthz`

Serve the liveness document.

**Responses**

- `200` — The service is serving; the snapshot count and the anchoring posture are stated

### GET `/keyring`

Serve the notary keyring a verifier pins.

**Responses**

- `200` — The notary anchor: the keyring mode, the suite, the key id, the Ed25519 public anchor, the verification recipe and, in seeded-dev mode, the warning

### GET `/snapshots`

List the snapshots in the as-of catalogue (OAIS data management).

**Parameters**

| Name | In | Description |
|---|---|---|
| `passport_id` | query | List only the snapshots of this passport |
| `at` | query | An RFC 3339 instant; the catalogue is evaluated as of that instant (alias: `asof`), and the answer is immutable and cacheable forever |

**Responses**

- `200` — The catalogue: every snapshot notarized at or before the effective instant, with the query echo, the count, the fixity digests, the anchoring summary and the per-snapshot `href`
- `400` — The `at` parameter is not a parseable instant

### GET `/snapshots/{id}`

Re-serve a stored snapshot byte-identically (OAIS access).

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The snapshot identifier, as returned by the ingest response and the as-of catalogue |

**Responses**

- `200` — The archival package is re-rendered from the journaled record byte-identically; the strong `ETag` pins the body digest and the `X-As-Of` header carries the notarization instant
- `404` — No snapshot carries the requested identifier

## admin

The bearer-guarded surface: OAIS ingest and the audit journal

### GET `/admin/log`

Read the append-only audit journal.

**Parameters**

| Name | In | Description |
|---|---|---|
| `limit` | query | Records to return (default 100, maximum 10 000) |
| `offset` | query | Records to skip (default 0) |

**Responses**

- `200` — The journal window
- `401` — A bearer token is configured and the request does not carry it

### POST `/snapshots`

Ingest a snapshot: the OAIS submission is notarized into the
archival package.

**Request body**: The SIP: `{"passport_id": ..., "state_hash": ..., "log_head": ...}`; optional `submitter` and `state_size`

**Responses**

- `201` — The snapshot is notarized and stored; the AIP document is returned with the `Location`, `ETag`, `X-Snapshot-Id` and `X-As-Of` headers, and `X-Anchored-Receipt` when the transparency log anchored the commitment
- `400` — Invalid JSON, a missing or malformed `passport_id`, `state_hash` or `log_head`, or an invalid optional field
- `401` — A bearer token is configured and the request does not carry it
- `409` — The storage reports a sequence conflict
- `500` — Notarization failed or the storage reported an integrity failure
