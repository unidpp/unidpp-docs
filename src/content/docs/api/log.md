---
title: "log — API reference"
description: "Every operation of the log service, rendered from its committed OpenAPI contract."
---

# log — API reference

The contract is declared once, on the handlers of `unidpp-log`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-log/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 7 environment variables (`x-unidpp-env-keys`).

## log

The transparency-log surface: discovery, commitment sequencing, signed tree heads, consistency proofs and receipts

### GET `/`

Serve the discovery document.

**Responses**

- `200` — The discovery document: the log identity and version, the operator public key with its key id and fingerprint, the endpoint references, the receipt-verification steps, the sequencing and enumeration invariants, and the quorum posture

### POST `/commitments`

Sequence a subject commitment and return the signed inclusion
receipt.

**Request body**: `{{"subject": ..., "commitment": <64-character hex SHA-256 value>, "salt_ref": <unsigned integer, optional>}}`

**Responses**

- `201` — The commitment is sequenced and the signed inclusion receipt is stated: leaf index, Merkle path and the append-time signed tree head, verifiable against the operator public key published in the discovery document
- `400` — Invalid JSON, a missing or oversized `subject`, a commitment that is not a 64-character hex SHA-256 value, or a `salt_ref` that is not an unsigned integer
- `401` — An append token is configured and the request does not carry it
- `500` — The journal rejected the append (a storage failure)

### GET `/healthz`

Liveness probe.

**Responses**

- `200` — The service is serving

### GET `/receipt/{seq}`

Re-serve a receipt byte-identically (derived state, deterministic
under journal replay).

**Parameters**

| Name | In | Description |
|---|---|---|
| `seq` | path | The sequence number of the receipt (an unsigned integer) |

**Responses**

- `200` — The receipt, byte-identical to the one returned by the append that produced the sequence number
- `400` — The sequence number is not an unsigned integer
- `404` — No receipt exists for the sequence number

### GET `/tree/consistency`

The consistency proof from a pinned prefix to the current head
(what lets a receipt stay valid as the tree grows).

**Parameters**

| Name | In | Description |
|---|---|---|
| `from` | query | The pinned prefix size (an unsigned integer); the proof ties that prefix to the current head |

**Responses**

- `200` — The consistency proof: the old and new sizes and roots and the audit path, verifiable against a previously pinned root and the current head's root
- `400` — A missing `from`, a `from` that is not an unsigned integer, or a `from` larger than the current tree size

### GET `/tree/head`

The latest signed tree head (append-time checkpoint, monotonic in
size, byte-identical across restarts).

**Responses**

- `200` — The latest signed tree head with its external RFC 3161 anchor state; for an empty log the head carries tree size zero and null timestamp, root and signature
