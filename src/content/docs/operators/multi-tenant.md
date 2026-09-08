---
title: Multi-tenant operations
description: Running whitelabel and sovereign deployments side by side — the tenant directory, up.sh, and what isolation means.
---

A tenant is a directory: one operator manifest plus its journals. Nothing
else. The launcher (`tenants/up.sh`) reads the manifest, renders each
declared service's environment through `unidpp-config render-env`, and starts
the same binaries the reference deployment runs. **Zero per-tenant code.**

```
tenants/
├── up.sh                    # the launcher: <name> [start|stop|status]
├── acme/
│   ├── unidpp-operator.yaml # whitelabel, EU
│   ├── registry-journal.jsonl
│   └── issuer-journal.jsonl
└── acme-cn/
    ├── unidpp-operator.yaml # sovereign, CN, sm2 packs
    ├── registry-journal.jsonl
    └── issuer-journal.jsonl
```

Tenant runtime state (pids, logs) lands under `run/tenants/<name>/`, one
directory per tenant.

## The lifecycle

```sh
$ ./tenants/up.sh acme start
tenant acme:
  registry: started (pid 35999)
  issuer: started (pid 36003)
  console: started (pid 21035)

$ ./tenants/up.sh acme status
tenant acme (status):
  registry: running (pid 35999)
  issuer: running (pid 36003)
  console: running (pid 21035)

$ ./tenants/up.sh acme stop
tenant acme (stop):
  stopped acme/registry
  stopped acme/issuer
  stopped acme/console
```

`start` is idempotent: a service with a live pid file is reported
`already running` and left alone. `stop` kills by pid file; journals are
never touched — a stopped tenant restarts with its state replayed.

## Upgrades

An upgrade is new binaries over unchanged state. The compatibility contract
is the journal: every service replays its append-only JSONL on start, and
the manifest's API version (`unidpp.org/v1`) is pinned — a launcher or
manifest the running schema does not accept is a loud error, not a
silent-misconfiguration risk.

The procedure, per the launcher's own behavior:

1. **Stop** — `./tenants/up.sh <name> stop` (or `./stack.sh stop` for the
   reference deployment). Journals are preserved by both; nothing is wiped.
2. **Build the new binaries** — `cargo build --release` per repository.
   `stack.sh` rebuilds only when a binary is missing; force a rebuild of a
   present-but-stale tree with `UNIDPP_FORCE_BUILD=1 ./stack.sh start`.
3. **Start** — the same start command; every service replays its journal
   (`stack.sh status` shows the journal record and item counts).
4. **Verify** — same acceptance as a
   [restore](/operators/backup-restore/): the registry serves the same item
   count as before the upgrade, and the log verifies its head
   (`GET /tree/head` — tree heads are monotonic by construction; a head
   that moved backwards is a hard fault).

Between stop and start there is no migration step to forget: if the new
binary can read the journal, the deployment is up; if it cannot, it says so
at replay, before serving. Take a [backup](/operators/backup-restore/)
first when the jump is large — the restore procedure is the rollback.


The console needs one variable the manifest cannot express (its own manifest
path), which `up.sh` supplies: `UNIDPP_CONSOLE_MANIFEST=tenants/<name>/unidpp-operator.yaml`.

## What a tenant declares

A minimal tenant manifest declares registry + issuer + console — enough to
issue passports, mint packs, and manage itself:

```sh
$ unidpp-config validate tenants/acme/unidpp-operator.yaml
valid: acme-eu (profile whitelabel, 3 service(s): ["registry", "issuer", "console"])

$ unidpp-config render-env issuer tenants/acme-cn/unidpp-operator.yaml
UNIDPP_ISSUER_BIND=127.0.0.1:9593
UNIDPP_ISSUER_PACK_SUITE=sm2
UNIDPP_ISSUER_STATE_FILE=tenants/acme-cn/issuer-journal.jsonl
```

A tenant can declare any subset of the family's services; trust, log,
projector, gateway, and archive blocks are optional. What a tenant does not
declare, it does not run.

## Isolation

What separates tenants from each other and from the reference deployment:

- **Journals.** Each service's `state_file` points inside the tenant
  directory. State never crosses tenants.
- **Ports.** Each tenant's binds are its own (acme on 93xx, acme-cn on 95xx).
  The launcher does not invent ports; the manifest declares them and a
  collision is a manifest fix.
- **Keys.** Each issuer derives its keyring from its seed environment.
  Two tenants' packs verify against two different published anchors. (Dev
  seeds are shared by default — see [security posture](/operators/security/);
  production tenants set per-tenant seeds.)
- **Branding and policy.** Per-tenant manifest: names, theme, footer, pack
  suites, residency, egress.

What is **not** isolated: the binaries (shared, by design), the host, and —
unless you say otherwise in `sovereignty` — the egress boundary. A tenant is
a process group on your box; treat host access accordingly.

## Port allocation

The family's working convention:

| Range | User |
|---|---|
| 8389-8396 | reference deployment (console + seven services) |
| 8399 | JP national peer registry |
| 93xx | whitelabel tenants (acme: 9389 console, 9390 registry, 9393 issuer) |
| 95xx | sovereign tenants (acme-cn: 9589 console, 9590 registry, 9593 issuer) |

There is no registry of ports beyond the manifests themselves; when adding a
tenant, pick a decade and stay in it.

## Operating against a tenant

Everything in the [service references](/services/registry/) applies to a
tenant's services — same endpoints, same shapes, tenant bind. Example: the
whitelabel tenant's issuer answers on 9393 exactly as the reference issuer
answers on 8393:

```sh
$ curl -s http://127.0.0.1:9393/keyring | jq '{mode, roles: (.roles | keys)}'
{
  "mode": "seeded-dev",
  "roles": [
    "event",
    "pack"
  ]
}
```

And the CN tenant's issuer would answer the same query on 9593 with an SM2
pack role. Issuing a passport on a tenant is the
[first-passport walkthrough](/get-started/first-passport/) with the bind
changed.

## Adding a tenant

1. `mkdir tenants/<name>` and write `unidpp-operator.yaml` (start from
   `tenants/acme/` — the closest profile).
2. `unidpp-config validate tenants/<name>/unidpp-operator.yaml` until it
   passes.
3. `./tenants/up.sh <name> start`.
4. Probe: `curl -s http://127.0.0.1:<console-port>/.well-known/unidpp-service`.

The full procedure with branding, tokens, and tunnel is
[the 15-minute whitelabel deployment](/quickstart-whitelabel/).
