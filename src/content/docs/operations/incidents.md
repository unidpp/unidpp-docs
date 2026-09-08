---
title: "Operations: incident response"
description: "The operator's decision tree: down services, dark tunnels, held ports, and when to restore from backup."
---

# Incident response

Every scenario below ends in a state you can verify — that is the
design constraint: journals are append-only, backups are
checksummed, and drills prove the restore path before you need it.

## A public hostname answers 502

The tunnel is alive; the origin service is down.

```sh
./stack.sh status        # confirms: which origin, which tunnel
./stack.sh start         # the idempotent repair: only the dead restart
```

If the service refuses to start, read its log under `run/<name>.log`.
A journal that fails to replay is a **restore situation**, not a
delete-the-journal situation — the journal is the record.

## A port is held by the wrong listener

`status` names the holder (the service identity check). Kill by the
exact PID — `run/*.pid` for the stack's own, `lsof -nP -iTCP:<port>`
for a foreign one — never by process name.

## A verification unexpectedly degrades

Run the [verdict](/api/issuer/) with the same `--as-of`: the three
readings (cryptographic, evidentiary, current-state) name the check
that degraded. Trust-side questions (anchor rotation, revocations)
answer from `GET /revocations` on the trust service — including the
retroactivity semantics and the evidentiary cutoff that protects
pre-declaration verifiers.

## Suspicion of state corruption

1. `./unidpp-ops verify <latest-archive>` — is the last good backup
   intact?
2. `./unidpp-ops drill` — does restore still work end to end?
3. Only then: `./unidpp-ops restore <archive> <tenant> --force` (the
   current directory is renamed aside, never deleted — the incident's
   evidence survives by construction).

## The transparency log is unreachable

Everything degrades explicitly, never silently: packs still verify
(their log-head commitment is inside the pack), the external TSA
anchor reports unreachable rather than pretending, and the archive
service says so. Reconnection is a restart; the log's journal replays.

## Communications

The reference deployment's status surface IS the incident channel:
`stack.sh status` output and the console's services matrix are
pasteable evidence. For a tenant-facing incident, the tenant's
manifest name and the affected service binds identify the blast
radius without exposing anything else.
