---
title: Full-host adoption
description: The reference stack — registry, issuer, resolver, projector, trust, log, archive, gateway and console — operated as one deployment.
---

The full host operates the reference stack: the whole family, one
deployment, one console. This is the path of an operator whose
mission spans issuance, registration, verification, transparency,
archival and federation — a national platform operator, a sector
body, a large economic operator running its own estate.

## What the adopter holds

The reference stack, described service by service in the
[service references](/services/issuer/), and the
[admin console](/operators/console/) over all of it:

| Service | Duty | Part |
|---|---|---|
| registry | items, profiles, mappings, models (19135 lifecycle) | 7, 3 |
| issuer | passports, events, packs | 2, 5 |
| resolver | identifiers and carriers to endpoints | 10 |
| projector | profiles applied as projections and renders | 3 |
| trust | anchors, keyrings, graded readings | 5 |
| log | transparency log, inclusion receipts | 5, 9 |
| archive | Tier-C snapshots, notarized and anchored | 9 |
| gateway | EN 18222 / UNTP bindings, ingest | 10, 6 |
| console | the operator's one pane | 9 |

## The walked path

[Run the reference stack](/get-started/reference-stack/) builds and
starts the family; [the five-minute tour](/get-started/tour/) walks
the five queries that show the shape; [your first
passport](/get-started/first-passport/) walks the write path; the
[whitelabel walkthrough](/get-started/tenant-walkthrough/) stands up
a branded tenant. The end-to-end story — including the cross-border
battery case — runs as `make demo` in `unidpp-e2e`, and the same
harness runs the three partial-adoption quickstarts beside it: the
full host is never more than the sum of the paths, and the harness
proves the paths hold on their own.

## The console over all of it

The console carries the operator's journey without a command line:
health and the manifest, the registry's items, the issuer's
passports with inline pack verification, interop declarations,
coverage visualization, [carrier generation](/operators/console/),
profile intake, archival, trust, and branding. Whitelabelling is a
separate deployment, not a mode: each tenant runs its own stack,
and [multi-tenant operations](/operators/multi-tenant/) describe
the isolation.

## Duties of the full host

The partial paths lend the host nothing it does not already carry:
every capability available here is available at the same class
level to each partial adopter — the no-orphan rule. What the full
host adds is duties: [production keys](/operations/production-keys/),
[backups and restore drills](/operations/backups/),
[upgrades](/operations/upgrades/), [incident
response](/operations/incidents/), and the [always-on
loop](/operations/deploy/) of an operator with dependents.
