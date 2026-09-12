---
title: "Operations: monitoring"
description: "What to watch: stack.sh status, the console's dashboard, and how to read the public probes."
---

# Monitoring

The stack observes itself with three honest surfaces — no metrics
infrastructure required, and each degrades visibly rather than lying.

## stack.sh status

The one-command truth ([deployment](/operations/deploy/)): every
service's health **and identity** (a healthy listener of the wrong
service fails), journal state (items replayed, the log tree head),
and every public hostname probed through its tunnel. Exit status is
monitoring-ready: non-zero means something needs a human. The watch is
installed, not just prescribed:

```sh
./unidpp-ops schedule --watch --install   # */10, idempotent
./unidpp-ops schedule --status            # both lines: backup + watch
# removal: crontab -l | grep -v 'unidpp-ops: always-on watch' | crontab -
```

## The admin console

`console.unidpp.org` in the reference deployment — every fact on it
comes from the service APIs or the manifest, never a second brain:

- **Dashboard cards** — registry items, UNTDED data elements,
  passports, the log tree size; an unreachable service renders `—`,
  never a stale guess.
- **The services matrix** — one row per manifest service: bind, role,
  the manifest-declared public URL (loopback-only when absent), and a
  live health probe.
- **Egress inventory** — what may leave the box, derived from the
  manifest's sovereignty policy; sealed rows where a policy forbids
  the call.

The console is read-driven: its probes are short-timeout loopback
calls, so a down service costs a dash, not an outage of the page.

## Reading the public probes

- **502 through a tunnel** — cloudflared is alive but the origin
  service is down: restart via `./stack.sh start`; the journal
  replays.
- **000 / no route to host** — the tunnel process itself is down or
  the DNS record is missing: re-ensure with `./stack.sh start`
  (tunnels restart from their token files) and check the tunnel
  provisioning block in the pilot README.
- **`/healthz` 200 but wrong data** — a stale binary or a foreign
  listener took the port: `status` catches this via the service
  identity check; stop by PID (`run/*.pid`), never by name.

## Performance: the NF-1 bench

The performance requirement's three numbers are measured, not
asserted — `unidpp-e2e` `scripts/bench-nf1.sh` (harness test 10 in
CI):

| Number | Bar | Reference measurement |
|---|---|---|
| Tier-A offline verification | the order of milliseconds | p95 0.7 ms (in-process, the officer's terminal's own pipeline) |
| Served profile views | p95 under 300 ms at reference scale | p95 5.6 ms (512 passports, 400 requests, fixture profile) |
| Roll-up verification over deep graphs | without full traversal | inclusion proof 6 µs vs 57 ms full traversal; the proof is log₂(N) hashes, gated structurally |

Run it on your own class of machine:

```sh
$ cd unidpp-e2e && UNIDPP_BENCH_VIEWS=1 ./scripts/bench-nf1.sh
```

The two offline numbers gate (a regression fails the harness); the
served-views p95 is the reference-class measurement — CI reports it
without gating, because a shared runner is not the reference
machine class.

## What there is deliberately not

No central telemetry, no outbound beacon: the reference deployment's
monitoring is local-first by doctrine. A sovereign deployment can run
the whole surface air-gapped; the same three commands are the whole
observability contract.
