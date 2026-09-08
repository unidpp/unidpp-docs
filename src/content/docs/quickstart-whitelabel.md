---
title: The 15-minute whitelabel deployment
description: Your own digital product passport service in one manifest — the whitelabel walkthrough, mirroring the verified acme tenant, with the sovereign and peer variants.
---

One file stands between the public reference deployment and your own branded
passport service: the operator manifest. This walkthrough builds a whitelabel
tenant — registry, issuer, console, your branding, your jurisdiction's pack
suite — in about fifteen minutes. Every step below was executed against the
pilot workspace; transcripts are as recorded (the tenant used for the
transcripts is `acme`, the pilot's whitelabel tenant; the sovereign variant
is `acme-cn`).

## What you end up with

- a tenant directory holding one manifest and its journals,
- three services running on your chosen ports (registry, issuer, console),
- a branded, read-only-unless-tokened console over them,
- passports issuing with your pack suite, verifiable offline against your
  published anchor,
- the sovereignty declaration of your choice.

## 0. Prerequisites (2 minutes)

- The UniDPP family checked out side by side, with `unidpp-pilot-data` among
  the repositories, and the service binaries built
  (`cargo build --release` per repo; `stack.sh` builds missing ones).
- Pick a port decade nobody in your workspace uses. The pilot's convention:
  reference 838x-839x, whitelabel tenants 93xx, sovereign tenants 95xx. This
  walkthrough uses 9389 (console), 9390 (registry), 9393 (issuer).

## 1. Write the manifest (3 minutes)

Create `tenants/<name>/unidpp-operator.yaml`. The whitelabel shape:

```yaml title="tenants/acme/unidpp-operator.yaml"
api_version: unidpp.org/v1
deployment:
  name: acme-eu                     # your deployment's name
  profile: whitelabel
  base_url: https://dpp.acme-mobility.example.org
branding:
  organization: ACME Mobility       # your legal/display name
  product_name: ACME Digital Product Passport
  theme:
    primary: "#7c3aed"              # your colors (#rrggbb, validated)
    accent: "#f59e0b"
  footer:
    legal_url: https://www.acme-mobility.example.org/legal
    contact_url: mailto:dpp@acme-mobility.example.org
services:
  registry:
    bind: 127.0.0.1:9390
    state_file: tenants/acme/registry-journal.jsonl
    admin_token: ${ACME_REGISTRY_TOKEN}   # optional: seal mutations
  issuer:
    bind: 127.0.0.1:9393
    state_file: tenants/acme/issuer-journal.jsonl
    pack_suites: [ecdsa-p256]       # your jurisdiction's suite(s)
  console:
    bind: 127.0.0.1:9389
    admin_token: ${ACME_CONSOLE_TOKEN}    # unset = read-only dev mode
sovereignty:
  data_residency: EU
  external_calls: none
```

Every knob is documented in
[the manifest reference](/operators/manifest/). The knobs you must decide:
`name`, `profile`, `base_url`, the branding block, `pack_suites`, the binds,
and the sovereignty block. Everything else has a default.

## 2. Validate (30 seconds)

```sh
$ unidpp-config validate tenants/acme/unidpp-operator.yaml
valid: acme-eu (profile whitelabel, 3 service(s): ["registry", "issuer", "console"])
```

Typo insurance: an unknown key is refused by name —

```sh
$ unidpp-config validate bad-manifest.yaml
unidpp-config: manifest does not match the schema: unknown field `binds`, expected one of `bind`, `admin_token`, `state_file`
```

If your manifest references `${VAR}` tokens, export them before validating
(unset references are load errors — secrets must resolve).

## 3. Start the tenant (1 minute)

```sh
$ ./tenants/up.sh acme start
tenant acme:
  registry: started (pid 35999)
  issuer: started (pid 36003)
  console: started (pid 21035)
```

The launcher renders each service's environment from the manifest
(`unidpp-config render-env`) and starts the same binaries the reference
deployment runs. Zero per-tenant code. `start` is idempotent — re-running
reports `already running` and touches nothing:

```sh
$ ./tenants/up.sh acme start
tenant acme:
  registry: already running
  issuer: already running
  console: already running
```

## 4. Verify what is running (1 minute)

```sh
$ curl -s http://127.0.0.1:9393/keyring | jq '{mode, roles: (.roles | keys)}'
{
  "mode": "seeded-dev",
  "roles": [
    "event",
    "pack"
  ]
}

$ curl -s http://127.0.0.1:9389/.well-known/unidpp-service | jq .
{
  "service": "unidpp-console",
  "deployment": "acme-eu",
  "profile": "whitelabel",
  "product": "ACME Digital Product Passport"
}
```

Your deployment's name, profile, and product — from the manifest, on the
console's identity endpoint. Open `http://127.0.0.1:9389/` and the dashboard
carries your chrome:

```html
<title>Dashboard · ACME Digital Product Passport</title>
```

The `/branding` page previews organization, product name, and the theme
swatches live from the manifest.

## 5. Issue your first passport on your tenant (3 minutes)

The full walkthrough with explanations is
[your first passport](/get-started/first-passport/); the commands as recorded
against this tenant's issuer:

```sh
$ curl -s -X POST http://127.0.0.1:9393/passports \
    -H 'content-type: application/json' \
    -d '{"identity":"local:acme:docs-demo-1","type_ref":"momiji:e8","capability":"S2",
         "eo_id":"urn:acme:actor:demo","resolver_uri":"https://resolver.example.org/r/acme-demo-1",
         "passport_id":"urn:acme:passport:docs-demo-1","config":[]}' \
    | jq '{passport_id, status}'
{
  "passport_id": "urn:acme:passport:docs-demo-1",
  "status": "issued"
}

$ curl -s -X POST http://127.0.0.1:9393/passports/urn%3Aacme%3Apassport%3Adocs-demo-1/events \
    -H 'content-type: application/json' \
    -d '{"type":"issuance","data":{"Issuance":{"derived":false,"inputs":[]}},
         "actor":"demo-operator","actor_role":"economic operator","at":"2026-09-08T00:00:00Z"}' \
    | jq -c '{seq, event_type}'
{"seq":0,"event_type":"issuance"}

$ curl -s -X POST http://127.0.0.1:9393/passports/urn%3Aacme%3Apassport%3Adocs-demo-1/pack \
    -H 'content-type: application/json' -d '{}' | jq '{bytes, qr_version, ec}'
{
  "bytes": 337,
  "qr_version": 14,
  "ec": "m"
}
```

Verify it offline against **your** issuer's published anchor:

```sh
$ anchor=$(curl -s http://127.0.0.1:9393/keyring | jq -r '.roles.pack.public')
$ unidpp verify pack.hex --anchor "$anchor"
UniDPP Tier-A verification
  carrier       337 bytes (hex)
  passport      urn:acme:passport:docs-demo-1
  ...
```

Exit 0. The pack is yours — your suite, your anchor.

## 6. Set your admin tokens (2 minutes)

Tokens are environment, referenced from the manifest:

```sh
$ export ACME_REGISTRY_TOKEN="$(openssl rand -hex 24)"
$ export ACME_ISSUER_TOKEN="$(openssl rand -hex 24)"
$ export ACME_CONSOLE_TOKEN="$(openssl rand -hex 24)"
```

Put the `${…}` references in the manifest's `admin_token` knobs (step 1 shows
two), export the values where the tenant launches, and restart. With the
console token set, `/login` offers the token sign-in; without it the console
is read-only by construction (the login page says exactly that). Full rules:
[security posture](/operators/security/).

Also set production signing seeds for a real deployment
(`UNIDPP_ISSUER_SEED` and siblings) — `mode: seeded-dev` in the keyring is
the honest flag that you have not.

## 7. Your hostname (2 minutes)

Tenant services bind loopback; publication is a tunnel, never a bind change.
The pilot's pattern: a cloudflared named tunnel per published surface, its
token in a file the launcher adopts (`tunnel.token`, `jp-tunnel.token`,
`console-tunnel.token` at the pilot root for the reference surfaces). The
running pilot demonstrates all three — `stack.sh status` reports:

```
tunnel: running (pid 61606) -> registry.unidpp.org
jp-tunnel: running (pid 61610) -> registry-jp.unidpp.org
```

For your tenant: create a named tunnel with ingress
`your.hostname` → `http://127.0.0.1:<your-console-or-registry-port>`, place
its token where your launcher looks, and expose exactly the surface you
chose. Everything else stays loopback.

## 8. Schedule backups (1 minute)

Your tenant's state is its manifest plus its journals — safe to copy while
services run, with the log tree head as the cross-service consistency point.
The `unidpp-ops backup` / `restore` commands are landing (see the honest
status and the manual procedure in
[backup and restore](/operators/backup-restore/)); today the manual `tar` +
`shasum` procedure takes under a minute and restores by replay.

## The sovereign variant (3 minutes away)

Change three things and you have the CN-shape tenant (`acme-cn`):

```yaml
deployment:
  name: acme-cn
  profile: sovereign                 # ← the constraint profile
branding:
  organization: ACME 华动
  product_name: ACME 产品数字护照
services:
  registry: { bind: 127.0.0.1:9590, state_file: tenants/acme-cn/registry-journal.jsonl }
  issuer:   { bind: 127.0.0.1:9593, state_file: tenants/acme-cn/issuer-journal.jsonl, pack_suites: [sm2] }   # ← sm2 only
  console:  { bind: 127.0.0.1:9589 }
sovereignty:
  data_residency: CN
  external_calls: none               # ← sealed, and enforced at validation
```

```sh
$ unidpp-config validate tenants/acme-cn/unidpp-operator.yaml
valid: acme-cn (profile sovereign, 3 service(s): ["registry", "issuer", "console"])
```

The validator does the enforcing: `sovereign` + any egress beyond `none`
without a recorded `egress_override_reason` refuses to load, and a sovereign
log with a TSA URL under a `none` policy is a contradiction, rejected. Every
pack this issuer mints is SM2-signed. The same three-step procedure —
validate, `up.sh <name> start`, probe — applies.

## The national-peer variant

A jurisdiction running its own register is a peer, not a child of the global
registry: the same registry binary, its own journal, its own items. The full
walkthrough (including what lives in which register) is
[running a national peer](/federation/jp-peer/).

## Recap of the doctrine

You wrote one file. No code differs between your deployment and the public
reference: the manifest is the product, the console is a surface over it,
and the sovereignty claims you make are validated, not aspirational. That is
the whole point.
