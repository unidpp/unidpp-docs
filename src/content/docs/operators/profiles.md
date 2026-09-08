---
title: Deployment profiles
description: The three deployment shapes — reference, whitelabel, sovereign — and what each one commits to.
---

The manifest's [`deployment.profile`](/operators/manifest/#deployment-profile)
names the shape of the deployment. Three profiles exist, and the difference
between them is constraint, not code: the same binaries, the same manifest
schema, different validated guarantees.

| | `reference` | `whitelabel` | `sovereign` |
|---|---|---|---|
| Purpose | the hosted public deployment | an organization's own instance | on-prem, jurisdiction-pinned |
| Egress default | `external` (upstreams permitted) | operator's choice | `none` unless a reason is recorded |
| Residency | unpinned | commonly pinned | pinned (`CN`, `EU`, `JP`, …) |
| Branding | UniDPP defaults | full branding block | full branding block |
| Packs | dual-suite pilot policy | typically `ecdsa-p256` | jurisdiction suite (e.g. `sm2`) |
| Validation delta | — | — | egress × reason rule enforced |

## `reference`

The public demonstration deployment: seven services, loopback binds, one
tunnel to the public registry URL. Egress is `external` because the stack's
services call each other as upstreams (issuer → registry, gateway → issuer,
archive → log). It runs in dev mode — open mutations, seeded-dev keyrings —
because it exists to be probed, not trusted.

## `whitelabel`

An organization's own deployment: its name, product name, logo, theme, and
footer on the same console and explorer surfaces. Zero code differs from the
reference deployment; the [`branding`](/operators/manifest/#branding) block
is the whole difference, and the console renders it live.

The pilot workspace runs one whitelabel tenant, `acme-eu`:

```yaml title="tenants/acme/unidpp-operator.yaml (excerpt)"
api_version: unidpp.org/v1
deployment:
  name: acme-eu
  profile: whitelabel
  base_url: https://dpp.acme-mobility.example.org
branding:
  organization: ACME Mobility
  product_name: ACME Digital Product Passport
  theme:
    primary: "#7c3aed"
    accent: "#f59e0b"
  footer:
    legal_url: https://www.acme-mobility.example.org/legal
    contact_url: mailto:dpp@acme-mobility.example.org
services:
  registry: { bind: 127.0.0.1:9390, state_file: tenants/acme/registry-journal.jsonl }
  issuer:   { bind: 127.0.0.1:9393, state_file: tenants/acme/issuer-journal.jsonl, pack_suites: [ecdsa-p256] }
  console:  { bind: 127.0.0.1:9389 }
sovereignty:
  data_residency: EU
  external_calls: none
```

Three services, EU residency, egress sealed. The full walkthrough — including
the console serving the branded chrome — is
[the 15-minute whitelabel deployment](/quickstart-whitelabel/).

## `sovereign`

The on-prem, jurisdiction-pinned shape. Two hard rules the validator
enforces (not conventions — load-time refusals):

1. **Egress needs a reason.** A sovereign manifest with
   `external_calls: tsa-only` or `external` must carry a non-empty
   [`egress_override_reason`](/operators/manifest/#sovereignty-egress_override_reason);
   the recorded justification is part of the deployment record.
2. **The log cannot contradict the policy.** A sovereign deployment with a
   [`external_tsa_url`](/operators/manifest/#services-log-external_tsa_url)
   set while `external_calls` is `none` is refused — even with an override
   reason on record.

The pilot workspace runs one sovereign tenant, `acme-cn`:

```yaml title="tenants/acme-cn/unidpp-operator.yaml (excerpt)"
api_version: unidpp.org/v1
deployment:
  name: acme-cn
  profile: sovereign
  base_url: https://dpp.acme.cn.example.org
branding:
  organization: ACME 华动
  product_name: ACME 产品数字护照
  theme:
    primary: "#b91c1c"
    accent: "#991b1b"
services:
  registry: { bind: 127.0.0.1:9590, state_file: tenants/acme-cn/registry-journal.jsonl }
  issuer:   { bind: 127.0.0.1:9593, state_file: tenants/acme-cn/issuer-journal.jsonl, pack_suites: [sm2] }
  console:  { bind: 127.0.0.1:9589 }
sovereignty:
  data_residency: CN
  external_calls: none
```

Note the pack policy: `pack_suites: [sm2]` — every pack this issuer mints is
signed with the SM2 suite, and nothing else. A verifier in that jurisdiction
pins the SM2 anchor from the issuer's keyring and verifies accordingly.

## Choosing ports

Reference services occupy 8389-8396 and 8399 (the JP peer). Tenants take
their own ranges — the acme tenants use 939x, the CN tenant 959x — declared
per service block in the manifest. A tenant's ports are its own; collisions
between tenants are a manifest problem you find at validation or launch, not
a runtime surprise.

## What a profile is not

A profile does not select features, editions, or modules of the software. All
services exist for all profiles; what changes is which blocks the manifest
declares (absent = not deployed), which keys sign (suites), what may leave
the box (sovereignty), and what the surfaces look like (branding).
