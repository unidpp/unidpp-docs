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
git clone https://github.com/unidpp/unidpp-server
git clone https://github.com/unidpp/unidpp-registry     # and the family
cd unidpp-server && cargo build --release
```

The server compiles the eight module crates by path, so the module
repositories — `unidpp-registry`, `unidpp-trust`, `unidpp-log`,
`unidpp-issuer`, `unidpp-projector`, `unidpp-gateway`, `unidpp-archive`,
`unidpp-hub` — and their two shared crates, `unidpp-core` and
`unidpp-signatif`, sit side by side with `unidpp-server` in one parent
directory. The clone-and-build sequence above is exactly that layout.

**Download a release binary.** The release workflow builds Linux x86-64 and
macOS ARM64 distributions on every tagged version, with a SHA-256 sum beside
each archive. The first tagged version awaits the maintainer's decision, as
version numbers are the project owner's call; the workflow itself is in the
repository.

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

## What a real deployment adds

A minimal start runs with no admin tokens and development seed keys, which is
the correct posture for a first look and the wrong posture for anything else.
A real deployment sets admin tokens and production signing seeds, and the
[operator manifest](/operators/manifest/) carries both. The reference
deployment's [dev-mode note](/get-started/reference-stack/#a-note-on-dev-mode)
states the boundary in one paragraph.
