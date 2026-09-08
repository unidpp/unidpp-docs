---
title: Log
description: "The unidpp-log service — the transparency-log anchor: RFC 6962 Merkle commitments, signed receipts, monotonic tree heads."
---

The transparency log: sequenced Merkle commitments (RFC 6962, Confium
constants) with signed inclusion receipts, monotonic signed tree heads, and
optional RFC 3161 external anchoring. In the reference deployment it binds
`127.0.0.1:8392` as log `unidpp-pilot-log-1`.

**Deliberately absent: any enumeration surface.** There is no endpoint that
lists subjects or commitments — a transparency log is verifiable without
being browsable. The journal file and receipts are the audit interfaces.

## Endpoints

| Endpoint | What |
|---|---|
| `GET /` | discovery: the operator public key, invariants, verification recipe, quorum statement |
| `GET /healthz` | liveness |
| `POST /commitments` | sequence `{subject, commitment (64-hex), salt_ref?}` → the signed inclusion receipt |
| `GET /tree/head` | the latest signed tree head (append-time checkpoint, monotonic) |
| `GET /tree/consistency?from=N` | RFC 6962 consistency proof from a pinned prefix to the current head |
| `GET /receipt/{seq}` | re-serve a receipt, byte-identical to the original `POST /commitments` response |

Appending requires `UNIDPP_LOG_APPEND_TOKEN` when set (open in dev mode).

## Example (recorded against the reference deployment)

```sh
$ curl -s http://127.0.0.1:8392/tree/head | jq '{tree_size, root: .root[0:16], log_id}'
{
  "tree_size": 5,
  "root": "d23b199b96ed73ea",
  "log_id": "unidpp-pilot-log-1"
}

$ curl -s http://127.0.0.1:8392/receipt/0 | jq '{seq, subject, log_id}'
{
  "seq": 0,
  "subject": "urn:unidpp:archive:snapshot:s-000000000000",
  "log_id": "unidpp-pilot-log-1"
}
```

The discovery document publishes the operator key (id, suite, public key hex,
fingerprint) — pin it alongside the log id.

## Verifying a receipt

The recipe, from the discovery document:

1. Verify `tree_head.signature` against the operator public key (from `GET /`).
2. Verify the inclusion proof reconstructs `tree_head.root` from the anchored
   commitment.
3. As the tree grows, `GET /tree/consistency?from=<receipt tree_size>` and
   verify it ties the receipt's pinned root to the current head.

Invariants: sequence numbers are strictly monotonic; heads are signed at
append time over `tree_size + root + timestamp` and never move backwards; no
enumeration (see above). Quorum today is M=1 of K=1 — one honest operator —
with the documented succession path (M-of-K log-of-logs; the master-list
verification already exists in the trust service).

## Environment

Manifest-rendered:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_LOG_BIND` | listen address | `127.0.0.1:8092` |
| `UNIDPP_LOG_APPEND_TOKEN` | Bearer token for appends; unset = open | unset |
| `UNIDPP_LOG_STATE_FILE` | append-only JSONL journal (replayed on start) | none |
| `UNIDPP_LOG_ID` | the log identity, 1-64 printable ASCII | `unidpp-log-1` |
| `UNIDPP_LOG_EXTERNAL_TSA_URL` | RFC 3161 TSA endpoint; absent = no external anchoring | none |

Direct environment:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_LOG_SUITE` | operator signing suite | `ed25519` |
| `UNIDPP_LOG_SEED` | deterministic operator key seed (production identity) | documented dev seed |

## Degradation semantics

- **TSA anchoring degrades explicitly.** Every append's tree head is also
  submitted to the TSA when configured; an unreachable or refusing TSA
  records the failure — the anchor is never silently skipped.
- **Bad configuration exits loudly.** A malformed `UNIDPP_LOG_BIND` is
  ignored with a warning; an invalid log id or suite prevents startup.
- **Journal replay discipline.** The journal replays with the same
  monotonic-sequencing checks it appends with; a torn tail stops replay at
  the last whole record.
- On a sovereign deployment, a configured TSA URL under a `none` egress
  policy is refused at **manifest validation** — before anything runs.
