---
title: Archive
description: "The unidpp-archive service — Tier-C notarized snapshots: OAIS metadata, Ed25519 notarization, transparency-log anchoring."
---

The Tier-C notarized archive: as-of snapshot packs with OAIS-style metadata,
Ed25519 notarization, optional transparency-log anchoring, and byte-identical
re-serving. In the reference deployment it binds `127.0.0.1:8396` and anchors
into the log at 8392.

The OAIS mapping (ISO 14721, simplified for passports): the issuer submits
the SIP (`POST /snapshots` body), the archive holds the AIP (state + log
head + digests), and access re-serves it byte-identically.

## Endpoints

| Endpoint | What |
|---|---|
| `GET /` | discovery (anchoring, OAIS mapping, notarization recipe, storage model) |
| `GET /healthz` | liveness |
| `GET /keyring` | the notarization keyring |
| `POST /snapshots` | ingest: validate, timestamp, notarize, optionally anchor into the log |
| `GET /snapshots?passport_id=&at=` | the as-of catalogue (a snapshot lists when `notarized_at <= at`) |
| `GET /snapshots/{id}` | re-serve a snapshot — byte-identical, strong ETag |
| `GET /admin/log?limit=&offset=` | audit log (admin) |

Ingest requires `UNIDPP_ARCHIVE_ADMIN_TOKEN` when set (open in dev mode).

## Example (recorded)

```sh
$ curl -s 'http://127.0.0.1:8396/snapshots' | jq '.snapshots[0] | {snapshot_id}'
{ "snapshot_id": "s-000000000000" }

$ curl -s http://127.0.0.1:8392/receipt/0 | jq '{seq, subject}'
{ "seq": 0, "subject": "urn:unidpp:archive:snapshot:s-000000000000" }
```

That is the anchoring visible end to end: the archive's first snapshot is
the transparency log's leaf 0 — notarized (Ed25519, tree-head domain) and
anchored (signed inclusion receipt, tree size, root riding the snapshot's
provenance).

## The SIP (submission)

```json
{
  "passport_id": "urn:unidpp:passport:pilot-e8-j000842",
  "state_hash": "<sha256 of the passport document>",
  "log_head": "<the passport's log head>",
  "submitter": "urn:unidpp:actor:pilot-operator",
  "state_size": 0
}
```

The notarization statement covers the canonical core (service, snapshot id,
sequence, passport id, state hash, log head, as-of instant) plus the
anchoring outcome when anchored; the signature is embedded in the document so
the AIP is self-verifying against `GET /keyring`. The commitment check ties
`sha256(core)` to the recorded digests.

## Environment

Manifest-rendered:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_ARCHIVE_BIND` | listen address | build default |
| `UNIDPP_ARCHIVE_ADMIN_TOKEN` | Bearer token for ingest and `/admin/*`; unset = open | unset |
| `UNIDPP_ARCHIVE_STATE_FILE` | append-only JSONL journal (replayed on start) | none |

Direct environment:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_ARCHIVE_SNAPSHOT_DIR` | the AIP directory (one JSON per snapshot) | none |
| `UNIDPP_LOG_URL` | the transparency log for anchoring; absent = anchoring off | none |
| `UNIDPP_ARCHIVE_LOG_TOKEN` | Bearer token for the log's append endpoint | none |
| `UNIDPP_ARCHIVE_LOG_TIMEOUT_MS` | log submission timeout | build default |
| `UNIDPP_ARCHIVE_DEV_SEED` / `UNIDPP_ARCHIVE_SIGN_SEED` | notarization key seed | dev seed |

## Degradation semantics

- **Anchoring degrades, notarization does not.** An unreachable or refusing
  log yields `status: unanchored` with the reason recorded; the snapshot
  remains notarized. The AIP always carries its signature.
- **Re-serve is byte-identical by construction**: `GET /snapshots/{id}`
  re-renders from the journaled record, pinned by a strong ETag — access
  never changes the AIP.
- **Journal + snapshot store cross-check on start**: AIP files are verified
  against the journal, re-materialized when missing; a mismatch is a hard
  error, not a silent re-notarization.
- Journal replay checks sequence, digest, and torn-tail integrity.
