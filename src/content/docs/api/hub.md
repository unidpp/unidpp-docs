---
title: "hub — API reference"
description: "Every operation of the hub service, rendered from its committed OpenAPI contract."
---

# hub — API reference

The contract is declared once, on the handlers of `unidpp-hub`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-hub/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 3 environment variables (`x-unidpp-env-keys`).

## hub

The hub surface: discovery, liveness, the keyring, the relay and its verification

### GET `/`

Serve the discovery document.

**Responses**

- `200` — The discovery document: the service identity, the hub id, the endpoint map and the contract statements — statelessness, two-way willingness, signed relays, no master

### GET `/healthz`

Answer the liveness probe.

**Responses**

- `200` — The service is serving

### GET `/keyring`

Serve the hub's public key.

**Responses**

- `200` — The keyring: the relay role's suite and public key, under which every relay signature verifies, and the keyring mode

### POST `/relay`

Relay evidence between two willing schemes.

The hub checks willingness both ways, forwards the evidence bytes,
signs the relay in the HUB-RELAY domain over the forwarded bytes
plus the relay metadata, and retains nothing.

**Request body**: The relay request: `{"from": ..., "to": ..., "data_class": ..., "evidence_hex": ..., "declarations": [declaration, ...]}` — the declarations carry both sides' published interoperability postures, because the hub holds no posture state of its own

**Responses**

- `200` — The evidence is relayed: the signed relay (hub id, parties, class, evidence digest, signature) and the forwarded bytes are returned, and nothing is retained
- `400` — Invalid JSON syntax, or an `evidence_hex` that is not hex
- `415` — The request carries no `application/json` content type
- `422` — The relay is refused: a side declines the class or publishes no declaration for it; the refusal states the declining side and the gap, and carries `refused: true`

### POST `/relay/verify`

Verify a relayed evidence under this hub's key.

The check is the recipient's, offered by the hub itself so that
any third party can run the verification without linking the
crate; linking the crate is equally conforming.

**Request body**: The verification request: `{"evidence_hex": ..., "relay": {..}}` — the relay exactly as returned by `POST /relay`

**Responses**

- `200` — The verification verdict: `verified` is `true` and the evidence digest is stated, or `verified` is `false` and the verification error is stated; both outcomes answer 200
- `400` — Invalid JSON syntax, or an `evidence_hex` that is not hex
- `415` — The request carries no `application/json` content type
- `422` — The body does not deserialize into a relay verification request
