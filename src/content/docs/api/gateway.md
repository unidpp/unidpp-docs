---
title: "gateway — API reference"
description: "Every operation of the gateway service, rendered from its committed OpenAPI contract."
---

# gateway — API reference

The contract is declared once, on the handlers of `unidpp-gateway`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-gateway/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 9 environment variables (`x-unidpp-env-keys`).

## gateway

Protocol renderings, the report channel and the scan-policy gate

### GET `/`

Serve the discovery document.

**Responses**

- `200` — The discovery document: the served profiles, their endpoint references, the source posture and the response conventions

### GET `/en18222/v1/dppsByProductId/{gtin}`

GET /en18222/v1/dppsByProductId/{gtin} — the EN 18222 REST render.
Render passports for a GTIN in the EN 18222 REST shape (full or
compressed; the default is compressed per the EN).

**Parameters**

| Name | In | Description |
|---|---|---|
| `gtin` | path | The GTIN |
| `rendering` | query | `full` (element tree, string-printed values) or `compressed` (collection-keyed, native JSON values; the default) |

**Responses**

- `200` — The EN 18222 document, as-of stamped
- `404` — The no-information 404 (I12)

### POST `/feedback`

POST /feedback — the consumer report channel (TODO.impl 224):
a stated report path on the public edge. The typed categories are
MobileQR's two (goods-mismatch 实物不符 / advertising-mismatch 宣传
不符) plus a stated free-form other; admission control is the
deployment's pluggable choice (a rate window here; captcha + SMS
behind the same trait in a deployment that runs them); every
admitted report is journaled and acknowledged with its sequence
and instant.
File a consumer report through the report channel (typed,
journaled, receipted; the pluggable admission control decides
what a flood is).

**Request body**: The report: its type, the subject identifier and the statement

**Responses**

- `201` — Filed; the receipt carries the sequence number that cites it
- `400` — An unparseable or mistyped report
- `429` — The admission control refused the report as a flood

### GET `/feedback/{seq}`

GET /feedback/{seq} — the public citation form: the report by
sequence with the contact withheld (stated, never silent).
Retrieve one filed report by its receipt sequence number.

**Parameters**

| Name | In | Description |
|---|---|---|
| `seq` | path | The receipt sequence number |

**Responses**

- `200` — The report, byte-identical on every read
- `404` — No report carries this sequence number

### GET `/healthz`

Liveness probe.

**Responses**

- `200` — The service is serving

### POST `/scan-tokens`

POST /scan-tokens {source} — issue a scan token under the
configured policy (the gate states where the policy came from; no
policy configured = the gate is open and issuance is a stated
no-op). The source names the requester in production set by the
fronting proxy (X-UniDPP-Source is accepted here).
Issue a scan token (the scan-policy gate: a scan-gated deployment
answers unauthenticated mark reads with a stated 401 naming this
endpoint; absent policy, reads are free).

**Request body**: The issuance request under the deployment's scan policy (rate and ttl are manifest data)

**Responses**

- `201` — Issued; the token and its expiry are stated
- `401` — The issuance credential is required and absent
- `429` — The policy's per-minute limit is reached

### POST `/untp/ingest`

POST /untp/ingest — the import direction: a UNTP passport VC (bare
or the triad this gateway renders) mints a neutral-core passport
with a deterministic identity; conformity credentials land as
profile bindings. Idempotent per subject identity.
Ingest a UNTP document back into the neutral core (render and
ingest are inverse projections; imported documents carry an empty
log and the receipt records the origin).

**Request body**: The UNTP document to import

**Responses**

- `200` — Matched (the subject already exists; the import is an identity)
- `201` — Imported (new subject)
- `422` — The document is well-formed JSON but not a conforming UNTP rendering

### GET `/untp/product/{id}`

GET /untp/product/{id} — the verifiable-credential triad + verdict.
Render one passport in the UNTP verifiable-credential triad
(DigitalProductPassport VC + DigitalConformityCredentials + the
link-resolver entry) — one neutral core, a C4 protocol rendering.

**Parameters**

| Name | In | Description |
|---|---|---|
| `id` | path | The product identifier (core cpid or GS1 family element string) |

**Responses**

- `200` — The UNTP triad, as-of stamped
- `404` — The no-information 404: identical bytes for unknown and deliberately unresolvable ids (I12)

## admin

The operator surface over the report channel

### GET `/admin/feedback`

GET /admin/feedback?limit&offset — the full listing (contacts
included), newest first, admin-guarded when a token is configured.
The operator's window onto the report channel.

**Responses**

- `200` — The listing of filed reports
- `401` — A bearer token is configured and the request does not carry it
