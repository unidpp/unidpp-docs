---
title: "Operations: deployment and the always-on loop"
description: "Run the stack: stack.sh start/stop/status, the containerized variant, tenants, and the always-on operating loop."
---

# Deployment and the always-on loop

The reference deployment lives in
[unidpp-pilot-data](https://github.com/unidpp/unidpp-pilot-data): nine
services on `127.0.0.1:8389-8399`, each an append-only journal plus a
binary, all wired by one operator manifest.

```sh
./stack.sh start     # build-if-needed + start every service + wait healthy
./stack.sh status    # the truth: per-service health, journals, and every
                     # public hostname probed THROUGH its tunnel
./stack.sh stop      # stop everything; journals are preserved
```

`start` is the **idempotent repair**: healthy services are reused
untouched, dead ones restart (journals replay on start), and every
tunnel is re-ensured. A second run is a no-op — which makes it safe as
a cron watch:

```cron
*/10 * * * * cd <pilot-dir> && ./stack.sh start >/dev/null 2>&1
```

## What status actually checks

- Every service (including the console and the JP peer node) answers
  `/healthz` **and** identifies itself at `/` — a healthy listener of
  the wrong service fails the check, not just a dead port.
- Every tunnel is probed **through its public hostname**: a tunnel
  process can be alive while its origin is down, and the world sees
  502. `status` prints the real answer and exits non-zero.
- Journal state: the registry's journal records → items, the log's
  tree head, the seeded applicability.

## PID discipline

Never `pkill`/`killall` by process name on a host running the stack —
the stack's services share binary names with test instances. Kill by
the exact PID from `run/*.pid`, or `./stack.sh stop`. After any local
test run that spawned services, `./stack.sh status` to confirm the
stack's integrity.

## The containerized variant

`docker-compose.yml` in the same repo runs the identical stack
containerized (same ports, same env wiring; `stack.sh` stays the
primary path). Journals and the passport store are bind-mounted so
state survives restarts.

## Tenants

A tenant is a manifest: `tenants/<name>/unidpp-operator.yaml` +
journals. `./tenants/up.sh <name> [start|stop|status]` renders the
service environment from the manifest (`unidpp-config render-env`)
and runs exactly the declared services. Whitelabel and sovereign
deployments are manifest deltas — see
[Multi-tenant operations](/operators/multi-tenant/) and
[Deployment profiles](/operators/profiles/).
