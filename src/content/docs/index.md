---
title: UniDPP documentation
description: Operator documentation for the UniDPP digital product passport platform.
template: splash
hero:
  tagline: A deployment is data — the operator manifest is the product.
  actions:
    - text: Five-minute tour
      link: /get-started/tour/
      icon: right-arrow
      variant: primary
    - text: The operator manifest reference
      link: /operators/manifest/
      icon: right-arrow
    - text: The 15-minute whitelabel deployment
      link: /quickstart-whitelabel/
      icon: right-arrow
---

These pages document the running UniDPP platform: the operator manifest, the
admin console, every service's endpoints and environment variables, and the
operations procedures — against the reference deployment, not a mock. Every
command shown was executed against the live stack; transcripts are reproduced
as recorded.

## What UniDPP is

UniDPP is a digital product passport platform built on one neutral core
passport and many jurisdiction, sector, and characteristic profiles. No region
is the universal envelope: the same passport renders as a UNTP credential
triad, as an EN 18222 REST document, as an offline Tier-A pack, and as a
per-jurisdiction lens view — each projection derived from one core, never
forked.

The framework itself — the fourteen invariants, the six layers, the seams and
tiers — lives on
[the main site](https://www.unidpp.org/framework/). These docs cover what an
operator does with it.

## Who these docs are for

- **Operators** run a deployment: one `unidpp-operator.yaml` file, the
  `stack.sh` / `tenants/up.sh` launchers, and the admin console. Start with
  [the operator's manual](/operators/manifest/).
- **Integrators** call the services: the [service references](/services/registry/)
  list every endpoint, environment variable, error, and degradation rule.
- **Jurisdiction teams** run peers: the [federation pages](/federation/jp-peer/)
  cover the national-peer doctrine and cross-register mappings.

## The reading order

1. [Five-minute tour](/get-started/tour/) — the five queries that show the
   system working.
2. [Run the reference stack](/get-started/reference-stack/) — build and start
   all seven services on one machine.
3. [Your first passport, pack, and verification](/get-started/first-passport/) —
   issue a passport, mint the offline pack, verify it against the issuer's
   published anchor.
4. [The operator manifest reference](/operators/manifest/) — every knob, typed,
   with defaults, examples, and validation rules. The backbone of these docs.

## Conventions

- Commands assume a checkout of the UniDPP family (the service repositories
  side by side) with the reference deployment running on `127.0.0.1:8390-8396`,
  the JP peer on `8399`, and the operator console on `8389`.
- The reference deployment runs in dev mode: no admin tokens, seeded-dev
  keyrings, everything loopback. It is a demonstration pilot. Production
  deployments — whitelabel and sovereign tenants — are declared by manifest,
  not by code; see [deployment profiles](/operators/profiles/).
- Transcripts show real output. Counts and timestamps drift as the registers
  grow; field shapes do not.
