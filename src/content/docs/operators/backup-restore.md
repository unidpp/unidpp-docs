---
title: Backup and restore
description: What state exists, why it is safe to copy while services run, and the backup tooling contract.
---

A UniDPP deployment's state is a small set of append-only files. This page
documents what they are, the consistency model that makes copying them safe
while services run, and the `unidpp-ops backup`/`unidpp-ops restore` tooling
contract.

> **Status of the tooling.** The `unidpp-ops` backup/restore commands are
> <https://github.com/unidpp/unidpp-pilot-data> (`unidpp-ops`). The manual
> `tar`+`shasum` procedure below is kept as the transparent form of the same
> contract — read it to understand what the script does.
> Everything below about the state layout and the consistency contract is
> verified against the running deployment; the exact command surface
> (`unidpp-ops backup <tenant>`, `unidpp-ops restore <archive> <tenant>`,
> the console Backups page) is the contract the tool implements. Until it
> lands, the manual procedure at the end of this page is the honest path.

## What constitutes a deployment's state

| File | Owner | Restores |
|---|---|---|
| `unidpp-operator.yaml` | the operator | the deployment declaration itself |
| `registry-journal.jsonl` | registry | every item, version, binding, discovery record |
| `trust-journal.jsonl` | trust | the trust graph, lists, revocations |
| `log-journal.jsonl` | log | the sequenced commitments and tree |
| `issuer-journal.jsonl` | issuer | every passport, event, pack record |
| `archive-journal.jsonl` | archive | every snapshot's notarized record |
| `archive-snapshots/*.json` | archive | the AIP files (re-materializable from the journal) |
| `passports/*.json` | projector | the passport document store |
| seed assets | the operator | reproducibility of the initial state |

For a tenant, all of the above live inside `tenants/<name>/` (plus
`run/tenants/<name>/` for logs and pids, which are not state).

## Why backups can run hot

Every journal is **append-only JSONL**; services replay them on start. No
service rewrites its journal, so a file copy taken while services append is
at worst a torn tail — and every journal replay checks sequence, digest, and
torn-tail integrity, refusing to continue past a torn record rather than
silently accepting a partial line.

The **consistency point** across services is the transparency log's signed
tree head: at backup time, record `GET /log/tree/head` (tree size + root +
signature). A restore that replays journals and then verifies the tree head
against the recorded consistency point proves the backup is coherent across
services — the log anchors the archive snapshots, and the issuer's verdicts
reference the log head.

```sh
$ curl -s http://127.0.0.1:8392/tree/head | jq '{tree_size, root: .root[0:16], log_id}'
{
  "tree_size": 5,
  "root": "d23b199b96ed73ea",
  "log_id": "unidpp-pilot-log-1"
}
```

The signature over the full head (in the same response) is what makes the
point verifiable, rather than merely recorded.

## The backup contract (`unidpp-ops backup <tenant>`)

```sh
$ ./unidpp-ops backup
backup: unidpp-reference-20260908T053255Z
  files: 27  consistency point: size 5 root d23b199b96ed73ea7a7e...
  archive: backups/unidpp-reference-20260908T053255Z.tar.gz

$ ./unidpp-ops verify backups/unidpp-reference-20260908T053255Z.tar.gz
verified: 27 member(s), consistency point size 5 root d23b199b...
```

A tampered archive fails verification naming the corrupted member; a
restore of the reference deployment's backup served the identical
1 531 registry items — parity proven.

What the tooling must produce — and what you should demand of any hand-rolled
equivalent:

1. **Contents**: the operator manifest, every journal, the snapshot
   directory, the passport store, and the seed assets of the tenant.
2. **A manifest-of-the-backup**: what was copied, when, and a SHA-256 per
   file — the backup is verifiable the same way everything else in the
   system is.
3. **The consistency point**: the log tree head recorded at snapshot time
   (from the live log service if the deployment declares one).
4. **Taken hot**: services keep running; append-only journals make this
   sound (above).
5. **Versioned**: backup files carry the deployment name and timestamp;
   nothing overwrites a previous backup.

## The restore contract (`unidpp-ops restore <archive> <tenant>`)

1. Unpack into a **fresh** tenant directory; refuse to overwrite an existing
   tenant without an explicit `--force`.
2. **Verify checksums** before writing anything; a tampered or corrupt
   archive is a hard failure naming the file.
3. **Validate the manifest** with `unidpp-config validate` — a restore of a
   manifest that no longer validates is refused.
4. Start via `tenants/up.sh <tenant>`; journals replay.

**Acceptance** (the test the tooling must pass): backup → restore → start →
the registry serves the same item count as before, and the log verifies its
head against the recorded consistency point.

## Manual procedure (works today)

```sh
# 1. Record the consistency point (if the deployment declares a log).
$ curl -s http://127.0.0.1:8392/tree/head > /tmp/tree-head-$(date -u +%Y%m%dT%H%M%SZ).json

# 2. Copy the tenant's state (services stay up).
$ tar -C unidpp-pilot-data -czf acme-backup-$(date -u +%Y%m%dT%H%M%SZ).tgz \
    tenants/acme

# 3. Checksum the archive (the manifest-of-the-backup, minimal form).
$ shasum -a 256 acme-backup-*.tgz > acme-backup-*.tgz.sha256

# Restore into a fresh directory:
$ mkdir -p unidpp-pilot-data/tenants/acme-restored
$ tar -C unidpp-pilot-data/tenants/acme-restored -xzf acme-backup-<stamp>.tgz
# (adjust the manifest's state_file paths if the directory name changed)
$ unidpp-config validate unidpp-pilot-data/tenants/acme-restored/unidpp-operator.yaml
$ ./tenants/up.sh acme-restored start   # journals replay
```

The console's Backups page (landing with the tooling) will list backups in
the configured directory, trigger one by invoking the script — the console
never reimplements the logic — and show the consistency point. It is
session-gated like every console mutation.

## What backups do not include

- **Secrets.** The manifest carries `${VAR}` references; the values live in
  your secret manager. A restored deployment needs the same environment —
  by design, a stolen backup yields no tokens.
- **Signing keys.** Keyrings derive from seed material in the environment
  (`UNIDPP_ISSUER_SEED`, `UNIDPP_LOG_SEED`, …). Back up the seed
  configuration the same way you back up other secrets — separately, and
  more carefully. Lose the seed, lose the identity: re-issued anchors do not
  verify against previously published ones.
- **Ephemeral runtime**: `run/` pids and logs are not state.
