---
title: "Operations: upgrades"
description: "The upgrade rehearsal: rebuild, restart, journal replay, and the proof that nothing was rewritten."
---

# Upgrades

An upgrade is a binary swap plus journal replay — and it is rehearsed
before it is ever needed:

```sh
./unidpp-ops rehearse-upgrade
```

The drill, end to end on the live stack:

1. **backup** — the durability net goes up first;
2. **before-readings** — the domain state (registry items, trust
   revocations, log tree size) and every journal's line count;
3. **rebuild** — every service binary rebuilds from the sibling
   checkouts (the swap);
4. **restart** — the full stack stops and starts; journals replay on
   the new binaries;
5. **proof** — after-readings equal before-readings, and every
   journaled `.jsonl` the backup captured is a **byte prefix** of the
   live journal: the append-only proof. An upgrade that rewrote
   history fails the rehearsal loudly.

The report lands in `backups/upgrade-<stamp>.json` beside the
backups.

## Upgrading for real

The rehearsal IS the procedure — a production upgrade differs only in
where the binaries come from (a release archive, an on-prem bundle)
and in announcing the maintenance window:

1. `./unidpp-ops backup` — snapshot first, always.
2. Swap the binaries (the [on-prem bundle](/operators/multi-tenant/)
   carries its own verified archive).
3. Restart through `./stack.sh stop && ./stack.sh start`.
4. `./stack.sh status` — everything healthy, public hostnames 200.
5. `./unidpp-ops verify <the step-1 archive>` — the net is intact.

If anything fails: journals are append-only, so the pre-upgrade state
is fully recoverable from the step-1 backup by
[`restore`](/operations/backups/).

## The event-model view

Product-level upgrades (a component installed into a product) are the
`UpgradeInstall` event class in the core taxonomy — see the
[issuer API reference](/api/issuer/). The operator-level upgrade on
this page is the platform's own version of the same discipline:
recorded, replayable, and proven non-destructive.
