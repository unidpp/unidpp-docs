---
title: Install and run
description: Install UniDPP as one binary, run the whole estate in one process, and read the deployment's discovery document and contract.
---

UniDPP deploys as **one binary**: `unidpp-server` mounts every module of the
estate — registry, trust, log, issuer, views, render, archive, relay — in one
process on one port, with one data root. This page takes a fresh machine from
nothing to a serving deployment. To see the same machinery exercised end to
end afterwards, continue with
[your first passport, pack, and verification](/get-started/first-passport/).

## Install

Two paths exist, and both produce the same binary.

**Build from source** (the path that works today):

```sh
for r in unidpp-server unidpp-registry unidpp-trust unidpp-log \
         unidpp-issuer unidpp-projector unidpp-gateway unidpp-archive \
         unidpp-hub unidpp-console unidpp-core unidpp-signatif \
         unidpp-cli unidpp-config; do
  git clone https://github.com/unidpp/$r
done
cd unidpp-server && cargo build --release
```

The server compiles the module crates by path, so every repository above
sits side by side in one parent directory: the eight data modules and the
console, their two shared crates (`unidpp-core`, `unidpp-signatif`), the
manifest model (`unidpp-config`), and the offline verifier
(`unidpp-cli`, used in the verification step below). The loop clones
exactly that layout; the build succeeds with nothing else present.

**Download a release binary.** The release workflow builds Linux x86-64 and
macOS ARM64 distributions on every tagged version, with a SHA-256 sum beside
each archive. The releases live on the repository's releases page
(v0.1.0 and v0.1.1 carry the one-binary estate); the workflow itself is in
the repository.

## Run

The server reads one bind address and, per module, the state paths it keeps
its journals under. A minimal start keeps everything in one data directory:

```sh
$ mkdir -p data/run data/passports
$ UNIDPP_SERVER_BIND=127.0.0.1:8090 \
  UNIDPP_REGISTRY_STATE_FILE=data/registry-journal.jsonl \
  UNIDPP_TRUST_STATE_FILE=data/run/trust-journal.jsonl \
  UNIDPP_LOG_STATE_FILE=data/run/log-journal.jsonl \
  UNIDPP_ISSUER_STATE_FILE=data/run/issuer-journal.jsonl \
  UNIDPP_ARCHIVE_STATE_FILE=data/run/archive-journal.jsonl \
  UNIDPP_ARCHIVE_SNAPSHOT_DIR=data/run/archive-snapshots \
  UNIDPP_PROJECTOR_PASSPORTS_DIR=data/passports \
  UNIDPP_GATEWAY_FEEDBACK_JOURNAL=data/run/feedback-journal.jsonl \
  ./target/release/unidpp-server
unidpp-server listening on http://127.0.0.1:8090
```

Every module answers behind its prefix, and the deployment answers at the
root. The paths are exact: a module prefix carries no trailing slash.

## Read the deployment

```sh
$ curl -s http://127.0.0.1:8090/ | jq .service
"unidpp"
$ curl -s http://127.0.0.1:8090/healthz
{"status": "ok"}
$ curl -s http://127.0.0.1:8090/registry/healthz
{"status": "ok"}
```

The discovery document at `/` names the mounted modules, each with its
contract URL and health URL. The union contract at `/openapi.yaml` is the
whole surface in one document, and each module's own contract — the same
bytes its repository pins as a golden — sits at `/<module>/openapi.yaml`.
[The five-minute tour](/get-started/tour/) explains what the modules are;
[the reference deployment](/get-started/reference-stack/) shows the same
binary operated as a service with seed data, backups and a console.

## Mint a passport and verify it offline

With the deployment running, the whole passport story is four calls and one
local command. Issue, append the first event, and mint the pack:

```sh
$ curl -s -X POST http://127.0.0.1:8090/issuer/passports \
    -H 'content-type: application/json' -d '{
      "identity": "local:demo:B-0001",
      "type_ref": "demo:battery",
      "capability": "S2",
      "eo_id": "urn:unidpp:actor:demo",
      "resolver_uri": "https://example.org/r/demo-0001",
      "passport_id": "urn:unidpp:passport:demo-0001",
      "config": []
    }' | jq -c '{passport_id, status}'
$ curl -s -X POST http://127.0.0.1:8090/issuer/passports/urn%3Aunidpp%3Apassport%3Ademo-0001/events \
    -H 'content-type: application/json' -d '{
      "type": "issuance",
      "data": {"Issuance": {"derived": false, "inputs": []}},
      "actor": "demo-operator",
      "actor_role": "economic operator",
      "at": "2026-11-08T00:00:00Z"
    }' | jq -c '{seq, event_type}'
$ curl -s -X POST http://127.0.0.1:8090/issuer/passports/urn%3Aunidpp%3Apassport%3Ademo-0001/pack \
    -H 'content-type: application/json' -d '{}' -o pack-response.json
$ jq -r '.pack' pack-response.json > pack.hex
```

Verification is offline: the pack plus the issuer's published anchor, and
nothing else. The verifier binary lives in `unidpp-cli` (already cloned;
build it once):

```sh
$ (cd ../unidpp-cli && cargo build --release)
$ anchor=$(curl -s http://127.0.0.1:8090/issuer/keyring | jq -r '.roles.pack.public')
$ ../unidpp-cli/target/release/unidpp verify pack.hex --anchor "$anchor" --max-age 0 --json | jq '.verdict'
"pass"
```

Exit codes are the contract: **0** pass, **1** degraded (verifiable but
incomplete — a pack minted while the issuer cannot reach the log verifies
degraded, because nothing anchors its event log), **2** fail. The same
verdict format is what a border officer's terminal prints.

## Replay the format's proof vectors

The wire format is pinned by a vector corpus that every implementation
reproduces byte for byte, and the TypeScript SDK carries the corpus
vendored. From the same parent directory:

```sh
$ cd ../unidpp-ts && npm ci && npm test
 Test Files  6 passed (6)
      Tests  79 passed (79)
```

A run that reproduces the vectors is a format-conformant implementation by
the second-implementation rule; the Ruby and Python SDKs hold their own
copies of the same corpus.

## What a real deployment adds

A minimal start runs with no admin tokens and development seed keys, which is
the correct posture for a first look and the wrong posture for anything else.
A real deployment sets admin tokens and production signing seeds, and the
[operator manifest](/operators/manifest/) carries both. The reference
deployment's [dev-mode note](/get-started/reference-stack/#a-note-on-dev-mode)
states the boundary in one paragraph.
