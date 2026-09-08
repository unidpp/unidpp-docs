---
title: Security posture
description: Tokens, sessions, egress rules, key material, and what is hardened versus what is dev-mode by design.
---

The platform's security model is small on purpose: every service is a
loopback process configured by environment; mutations are token-guarded;
trust is anchored in published keyrings; egress is a validated declaration.
This page states what is guarded, how, and what remains an operator
responsibility.

## The honest headline

The reference deployment is a **demonstration pilot**: no admin tokens, no
TLS between services, seeded-dev keyrings. That is the correct posture for
something meant to be probed publicly, and it is not a production posture.
Production deployments — the whitelabel and sovereign tenants — differ from
it by manifest and environment, not by code. Nothing in this section is
aspirational: each statement names where it is enforced.

## Admin tokens

Every service with mutations guards them with a Bearer token, declared in the
manifest (one knob per service: [`services.<svc>.admin_token`](/operators/manifest/#services-common-admin_token),
rendered into each service's `UNIDPP_*_ADMIN_TOKEN` or, for the log,
`UNIDPP_LOG_APPEND_TOKEN`):

| Service | Guards | Token variable |
|---|---|---|
| registry | item/service/binding/model mutations, `/admin/*` | `UNIDPP_REGISTRY_ADMIN_TOKEN` |
| trust | graph mutations, trust-list writes, `/admin/log` | `UNIDPP_TRUST_ADMIN_TOKEN` |
| log | `POST /commitments` | `UNIDPP_LOG_APPEND_TOKEN` |
| issuer | passport/pack/profile mutations, `/admin/*` | `UNIDPP_ISSUER_ADMIN_TOKEN` |
| archive | `POST /snapshots`, `/admin/log` | `UNIDPP_ARCHIVE_ADMIN_TOKEN` |
| gateway | (renders are public; no mutations) | `UNIDPP_GATEWAY_ADMIN_TOKEN` accepted |
| projector | none — read-only service by design | — |

Rules that hold across all of them:

- **Unset token = open dev mode.** Every service opens its mutations when the
  variable is unset or empty. This is how the pilot runs; it is a load-time
  decision, visible in each service's discovery document (`auth` field).
- **Reads stay public.** Consumers resolve passports, views, renders,
  keyrings, and tree heads without authentication — that is the point of the
  read side.
- **Tokens are compared without leaking timing.** The console compares the
  admin token in constant time; services reject wrong tokens with the same
  error as missing ones.
- **Token values never live in the manifest.** The manifest carries
  `${VAR}` references; the loader substitutes from the environment and an
  unset reference is a load error. A manifest in git leaks no secrets.

## Console sessions

The console is the one surface with a login. See [the console manual](/operators/console/#the-auth-model)
for the full model; in brief: token → (constant-time compare) → HttpOnly
SameSite=Strict session cookie, 8-hour lifetime, server-side revocation on
logout, and **exactly one mutation gated behind it** (manifest save).
Without a token configured, the console is read-only by construction — no
session can be minted, so the save path cannot be reached.

Every interpolated string on every console page passes through one HTML
escaping helper. Operator-controlled strings (organization names, manifest
text, API responses) are treated as untrusted input.

## Egress rules

What may leave the box is declared in the manifest's
[`sovereignty`](/operators/manifest/#sovereignty) block and **validated at
load**:

- `external_calls: none` — nothing leaves.
- `tsa-only` — only the log's RFC 3161 TSA submission.
- `external` — upstream fetches permitted.

Two contradictions are refused at validation time:

1. A `sovereign` profile with egress beyond `none` and no recorded
   `egress_override_reason`.
2. A sovereign log configured with an `external_tsa_url` under a `none`
   policy — the block contradicts the policy, reason or no reason.

Egress claims are therefore part of the deployment record, not marketing
copy: the file either validates or the deployment does not start.

## Key material and trust anchors

- **Every service signs with its own keyring** and publishes the public side
  at `GET /keyring`. Verifiers pin those anchors at onboarding.
- **The trust service co-signs every response** in the tree-head domain
  (suite headers name key ids); the log's tree heads are signed by its
  operator key, published in its discovery document.
- **Dev seeds are documented and shared.** `seeded-dev` keyrings derive from
  fixed development seeds (`unidpp-log-dev-seed-v1` and siblings). Every
  consumer of that seed produces the same key — which is exactly why it is
  fine for a demo and disqualifying for production. Production deployments
  set per-deployment seeds (`UNIDPP_ISSUER_SEED`, `UNIDPP_LOG_SEED`,
  `UNIDPP_TRUST_SIGN_SEED`, `UNIDPP_ARCHIVE_SIGN_SEED`, …) from the secret
  store, never from the manifest.
- **Passport packs** are signed with the issuer's declared pack suite(s)
  ([`pack_suites`](/operators/manifest/#services-issuer-pack_suites)); a
  co-signature policy (e.g. `["ecdsa-p256", "sm2"]`) produces one pack body
  signed in both suites.
- **Revocation** is the trust service's job: prospective reasons (key
  compromise, cessation, supersession, affiliation change) keep prior as-of
  verifications valid; retroactive reasons (misissuance, fraud,
  authority-compromised) void from the start within an explicit distrust
  window. Both readings are visible per declaration.

## Network posture

- **Everything binds loopback by default.** Every manifest bind in the
  reference deployment and both tenants is `127.0.0.1`.
- **Public exposure is a tunnel decision, not a bind change.** The pilot
  exposes only surfaces chosen deliberately (the registry via named tunnel);
  the rest of the stack stays loopback.
- **No service-to-service TLS** in the pilot. On a single host with loopback
  binds this is coherent; across hosts, put the inter-service URLs behind
  your own transport security before declaring any `external_calls` posture.
- **Enumeration resistance.** The transparency log exposes no listing
  surface (verifiable without being browsable); the gateway's 404s are
  identical bytes for unknown and deliberately unresolvable ids.

## Secrets handling

1. Secret **values** live in your environment / secret manager.
2. The **manifest** references them (`${VAR}`); the console editor renders
   references, never resolved values, and the loader refuses unset
   references.
3. `render-env` output (what a launcher consumes) contains resolved values —
   treat launcher environments and their logs accordingly; `stack.sh` and
   `up.sh` write service logs under `run/`, and services do not log their
   token values.
4. Backups do not contain secrets by design — see
   [backup and restore](/operators/backup-restore/#what-backups-do-not-include).

## The operator's production checklist

- [ ] Every deployed service block has `admin_token: ${…}` set (no open dev
      mode).
- [ ] Per-deployment signing seeds exported from the secret store; no dev
      seeds anywhere.
- [ ] `sovereignty` reflects reality — `external` only where upstreams
      actually exist; sovereign tenants sealed or reasoned.
- [ ] Console token set if the console runs at all; loopback bind unless a
      deliberate exposure exists.
- [ ] Loopback binds everywhere a host-shared deployment runs; tunnels for
      the surfaces you choose to publish.
- [ ] Backups scheduled (see the [consistency contract](/operators/backup-restore/)).
- [ ] Keyring anchors pinned by your verifiers from the published keyrings —
      not fetched at verification time.
