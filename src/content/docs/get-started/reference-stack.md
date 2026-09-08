---
title: Run the reference stack
description: Build and start the full UniDPP pilot stack on one machine, seed it, and stop it cleanly.
---

The reference deployment is orchestrated by one script:
`stack.sh` in the `unidpp-pilot-data` repository. It builds each service if
needed, starts them dependency-ordered, waits for each to be healthy, and
verifies the right service is on the right port before declaring success.

## Prerequisites

- A checkout of the UniDPP family — the service repositories side by side,
  with `unidpp-pilot-data` among them:
  `unidpp-registry`, `unidpp-trust`, `unidpp-log`, `unidpp-issuer`,
  `unidpp-projector`, `unidpp-gateway`, `unidpp-archive`, `unidpp-console`,
  `unidpp-cli`, `unidpp-config`.
- Rust toolchain (`cargo`) for the initial build.
- `curl`, `jq`, `python3` for the seed script.

Ports used: **8390-8396** (the seven services), **8389** (console),
**8399** (the JP peer registry). All loopback by design; public exposure is a
per-deployment decision made through a tunnel, not a bind change.

## Start

```sh
$ cd unidpp-pilot-data
$ ./stack.sh start
==> starting registry on http://127.0.0.1:8390
==> starting trust on http://127.0.0.1:8391
==> starting log on http://127.0.0.1:8392
==> starting issuer on http://127.0.0.1:8393
==> starting projector on http://127.0.0.1:8394
==> starting gateway on http://127.0.0.1:8395
==> starting archive on http://127.0.0.1:8396
==> starting console on http://127.0.0.1:8389
==> starting jp-registry on http://127.0.0.1:8399
==> stack up: 8390 registry · 8391 trust · 8392 log · 8393 issuer
               8394 projector · 8395 gateway · 8396 archive
==> next: ./seed-pilot.sh   (idempotent: seed + demo artifacts)
```

What `start` actually does:

1. **Build if needed.** Each service binary is built (`cargo build --release`)
   only when missing; `UNIDPP_FORCE_BUILD=1` rebuilds unconditionally.
2. **Adopt or refuse.** A service already healthy on its port and answering the
   right identity is adopted (`==> registry already healthy (reusing)`). A
   foreign listener on a needed port is a hard error naming the holder.
3. **Wire the environment.** Every service starts with its `UNIDPP_*`
   environment (binds, state files, upstreams) — the same variables
   [the operator manifest](/operators/manifest/) renders.
4. **Wait for health**, then verify identity via the discovery document's
   `service` field (all family services answer `ok` on `/healthz`; the
   identity check is what tells them apart on a shared box).
5. **Journals replay.** Nothing is wiped; state comes back from the JSONL
   journals on start.
6. **Tunnels** (optional): if `tunnel.token`, `jp-tunnel.token`, or
   `console-tunnel.token` are present, a cloudflared named tunnel is adopted
   or started per surface. No token, no tunnel — the stack stays loopback.

## Seed

```sh
$ ./seed-pilot.sh
== [1] discovery seed (C3/C4/C5 + C1 units)
  already present (10 units — journal replay)
== [2] item seed (10 pilot items)
  present    urn:unidpp:profile:extraction
  ...
== [5] demo passport (live issuer)
  already issued urn:unidpp:passport:pilot-e8-j000842 (issuer journal replay)
== [6] Tier-A pack + CLI verify (anchor from the issuer /keyring)
  verified: PASS (exit 0) — the three readings named, coverage complete
== [7] notarized Tier-C snapshot (anchored in the transparency log)
== [8] projector two-lens views (at 2028-06-01T00:00:00Z)
== [9] gateway renders (UNTP triad + EN 18222)
== [10] as-of applicability for momiji:e8
  at 2027-06-01: ['urn:unidpp:profile:jp-road-traffic']
  at 2028-06-01: ['urn:unidpp:profile:eu-machinery-battery', 'urn:unidpp:profile:jp-road-traffic']
== seed-pilot complete — the stack stays up (./stack.sh status, ./stack.sh stop)
```

The seed is **idempotent**: item and profile registrations tolerate `409`, the
demo passport is issued once, events are appended only up to the expected
sequence. Re-running against a seeded stack is safe and produces the demo
artifacts under `demo/` (the passport view, the Tier-A pack, the CLI
verification report, the notarized snapshot, both lens views, both gateway
renders, the as-of proofs).

The JP peer node is seeded separately (it has its own journal and register):

```sh
$ ./seed-jp.sh
seeding the JP national peer node (http://127.0.0.1:8399)
  [skip] jp-road-traffic profile already present
  [skip] jp-road-traffic binding already present
JP node seeded: 1 profile + 1 applicability binding (its own journal, its own register)
```

## Status

```sh
$ ./stack.sh status
  registry   (unidpp-registry)  http://127.0.0.1:8390  healthy
  trust      (unidpp-trust)     http://127.0.0.1:8391  healthy
  log        (unidpp-log)       http://127.0.0.1:8392  healthy
  issuer     (unidpp-issuer)    http://127.0.0.1:8393  healthy
  projector  (unidpp-projector) http://127.0.0.1:8394  healthy
  gateway    (unidpp-gateway)   http://127.0.0.1:8395  healthy
  archive    (unidpp-archive)   http://127.0.0.1:8396  healthy
  registry journal: 1550 records -> 1531 items, 8 discovery services
  applicability (momiji:e8 @2028-06-01): urn:unidpp:profile:eu-machinery-battery, urn:unidpp:profile:jp-road-traffic
  log tree head: size 5 · root d23b199b96ed73ea…
  demo artifacts: 13 files under demo/
```

`status` exits non-zero if any service is down or a port is held by a foreign
listener — it is safe to use as a monitoring probe.

## Stop

```sh
$ ./stack.sh stop
==> stopped console (pid 1234)
==> stopped archive (pid 1235)
...
==> journals preserved (registry-journal.jsonl, run/*-journal.jsonl)
```

Stop never deletes state. The journals replay on the next start.

## Where the state lives

| Path | What |
|---|---|
| `registry-journal.jsonl` | the registry's append-only journal (the seed of record) |
| `jp-registry-journal.jsonl` | the JP peer's journal |
| `run/*-journal.jsonl` | trust, log, issuer, archive journals |
| `run/archive-snapshots/` | one AIP file per notarized snapshot |
| `run/*.pid`, `run/*.log` | process handles and per-service logs |
| `passports/` | the projector's passport document store |
| `demo/` | artifacts produced by `seed-pilot.sh` |

The [backup and restore](/operators/backup-restore/) page builds on exactly
this file set.

## A note on dev mode

The reference stack runs with **no admin tokens** and **seeded-dev keyrings**.
Every mutation endpoint is open, and every signing key derives from documented
development seeds. That is the correct posture for a demonstration pilot and
the wrong posture for anything else — a real deployment sets admin tokens and
production seeds in its [operator manifest](/operators/manifest/) and
environment. The whitelabel and sovereign tenants demonstrate the difference.
