---
title: Run the reference deployment
description: Operate UniDPP as the reference deployment does — one process, one port, seeded demo data, the console, and the public surfaces — with unidpp-stack.
---

The reference deployment at unidpp.org runs the same one binary this
documentation installs ([Install and run](/get-started/install-and-run/)),
operated by one program: `unidpp-stack` in the `unidpp-pilot-data`
repository (source at `ops/`, invoked from the pilot directory as
`./ops/target/release/unidpp-stack`). One command starts the whole estate,
one command verifies it against its committed contracts, and every command
is idempotent.

## The shape

One process serves every module on **8090**; the operator console keeps its
own process on **8389** until it folds into the same process. Five public
hostnames — `registry.unidpp.org`, `registry-jp.unidpp.org`,
`trust.unidpp.org`, `log.unidpp.org`, `console.unidpp.org` — are deployment
aliases: each serves the deployment's union contract at `/openapi.yaml`, and
each module answers at its prefix on every alias, so
`registry.unidpp.org/trust/healthz` is the trust module's health check. The
federation peer lives inside the same process as a second registry mounted
at `/registry-jp` with its own journal.

## Start

```sh
$ cd unidpp-pilot-data
$ ./ops/target/release/unidpp-stack one-up
==> starting the one deployment on http://127.0.0.1:8090
==> all eight modules answer behind their prefixes
==> starting cloudflared named tunnel (registry.unidpp.org -> 127.0.0.1:8090)
...
==> one deployment up: http://127.0.0.1:8090
               registry · trust · log · issuer · views · render · archive · relay · registry-jp
==> console: 127.0.0.1:8389 (own process until R3 folds it in)
==> next: unidpp-stack one-verify
```

What `one-up` actually does:

1. **Builds if needed.** The `unidpp-server` binary is built only when
   missing.
2. **Adopts or refuses.** A healthy listener answering the deployment's
   identity is adopted; a foreign listener on the port is a hard error
   naming the holder.
3. **Wires one environment.** The one process starts with every module's
   `UNIDPP_*` keys — the same names [the operator manifest](/operators/manifest/)
   renders — with the pilot's real journals: the registry journal stays the
   seed of record at the repo root, and the peer's journal feeds the
   `/registry-jp` mount.
4. **Waits for every module** behind its prefix, not only for the process.
5. **Journals replay.** Nothing is wiped; state returns from the JSONL
   journals on start.
6. **Starts the tunnels** whose token files exist, each hostname pointing at
   the one origin. No token, no tunnel, loopback only.

## Verify

```sh
$ ./ops/target/release/unidpp-stack one-verify
  union        /openapi.yaml  CURRENT
  registry     /registry     CURRENT
  trust        /trust        CURRENT
  ...
  relay        /relay        CURRENT
one-verify: the union and every module serve their committed contracts
```

`one-verify` pins the deployment twice: the union document must equal the
server repository's committed golden, and every module's served contract
must equal its own repository's golden, byte for byte. A stale build or a
foreign deployment fails here with the module named, and the command exits
non-zero, which is what makes it safe as a monitoring probe.

## Seed

```sh
$ ./ops/target/release/unidpp-stack seed
== [1] discovery seed (C3/C4/C5 + C1 units)
  already present (10 units — journal replay)
...
== [10] as-of applicability for momiji:e8
== seed complete — the stack stays up
$ ./ops/target/release/unidpp-stack seed-jp
  [skip] jp-road-traffic profile already present
JP node seeded: 1 profile + 1 applicability binding (its own journal, its own register)
```

The walkthrough seed drives the live modules through the demonstration
passport and writes its artifacts under `demo/`. It is idempotent:
registrations tolerate `409`, the demo passport is issued once, events
append only up to the expected sequence. The JP peer's seed addresses the
`/registry-jp` mount and is idempotent the same way.

## Status and stop

```sh
$ ./ops/target/release/unidpp-stack one-status
  one-server  http://127.0.0.1:8090  healthy  v0.1.0  (pid 59403)
    registry     /registry     healthy
    ...
$ ./ops/target/release/unidpp-stack one-down
==> journals preserved
```

`one-status` shows the process, every module's prefix health, the console
and each tunnel. `one-down` stops the deployment and its tunnels and never
deletes state; the journals replay on the next start. A crontab watch runs
`one-up` every ten minutes, so a deployment that dies comes back, including
its tunnels — the tunnel binary is resolved absolutely, because the watch
runs under cron, whose path carries none of the operator's shell extras.

## Where the state lives

| Path | What |
|---|---|
| `registry-journal.jsonl` | the registry's append-only journal (the seed of record) |
| `jp-registry-journal.jsonl` | the federation peer's journal |
| `run/*-journal.jsonl` | trust, log, issuer, archive journals |
| `run/archive-snapshots/` | one AIP file per notarized snapshot |
| `run/one-server.pid`, `run/one-server.log` | the deployment's process handle and log |
| `passports/` | the projector's passport document store |
| `demo/` | artifacts produced by `unidpp-stack seed` |

The [backup and restore](/operators/backup-restore/) page builds on exactly
this file set.

## A note on dev mode

The reference deployment runs with **no admin tokens** and **seeded-dev
keyrings**. Every mutation endpoint is open, and every signing key derives
from documented development seeds. That is the correct posture for a
demonstration pilot and the wrong posture for anything else; a real
deployment sets admin tokens and production seeds in its
[operator manifest](/operators/manifest/) and environment. The whitelabel
and sovereign tenants demonstrate the difference.
