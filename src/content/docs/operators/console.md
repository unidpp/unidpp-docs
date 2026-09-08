---
title: The admin console
description: The console manual — every page, the auth model, read-only dev mode, and what the console can and cannot do.
---

The admin console is one branded pane over a deployment. Its doctrine:
**a surface, not a second brain** — every fact it shows comes from a
service's own API or from the operator manifest; every capability is a call
to an existing endpoint. It adds no domain logic. It is itself configured by
the same manifest it manages: branding, bind, and the admin token all come
from `unidpp-operator.yaml` + environment.

## Starting it

The console is a service block like any other. `stack.sh` starts it on
`127.0.0.1:8389` for the reference deployment; a tenant's `up.sh` starts it
from the tenant manifest:

```sh
$ ./tenants/up.sh acme start
tenant acme:
  registry: already running
  issuer: already running
  console: started (pid 21035)
```

Its configuration is three environment variables (the manifest renders the
first two):

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_CONSOLE_BIND` | listen address | `127.0.0.1:8397` |
| `UNIDPP_CONSOLE_MANIFEST` | path to the operator manifest it manages | `unidpp-operator.yaml` |
| `UNIDPP_CONSOLE_ADMIN_TOKEN` | the admin token (unset = read-only dev mode) | unset |

If the manifest cannot be read or validated, the console refuses to start and
says why on stderr. A console over an invalid manifest is worse than no
console.

## The identity check

The console identifies itself at the well-known path — this is what stack
orchestrators probe to tell it apart from other listeners:

```sh
$ curl -s http://127.0.0.1:8389/.well-known/unidpp-service | jq .
{
  "service": "unidpp-console",
  "deployment": "unidpp-reference",
  "profile": "reference",
  "product": "UniDPP Reference Deployment"
}
```

On the acme tenant the same call answers `"deployment": "acme-eu"`,
`"profile": "whitelabel"`, `"product": "ACME Digital Product Passport"` —
one binary, two deployments, the manifest is the difference.

## The pages

### Dashboard (`/`)

The deployment summary — name, profile, base URL, egress policy (with
residency when pinned) — and a per-service health table: every service the
manifest declares, its bind, its role, and a live probe of its `/healthz`.
Health is honest: `healthy`, the HTTP status, or `unreachable` — the console
reports what it can reach, it does not infer.

### Configuration (`/config`)

The operator manifest as an editable YAML textarea. The rules:

- **The editor shows the file as stored** — secrets remain `${VAR}`
  references; resolved values never render anywhere in the console.
- **Saving validates first.** A manifest that fails schema or semantic
  validation is rejected with the error verbatim, and **nothing is written**
  (the write itself is atomic: temp file + rename; a failed write never
  truncates the live one).
- **Unset secret variables are explained, not fatal-looking.** A referenced
  `${VAR}` that is not in the console's environment produces a note: export
  it (or let the service runner export it) and save again — the manifest
  itself is fine to stage.
- **Rendered environment** — pick a service from the dropdown and the page
  shows the exact `UNIDPP_*` environment the manifest produces for it
  (`render-env` in the browser).

### Registry (`/registry`)

The registry's items with class and register filters (e.g.
`class=profile`, `register=untded`). Calls the registry's own `/items`
endpoint with the declared registry's bind; a deployment that declares no
registry says so.

### Passports (`/passports`)

Three things from the issuer:

1. **Lookup** — fetch one passport document by id (the issuer's
   `GET /passports/{id}`), pretty-printed.
2. **The audit tail** — recent lifecycle actions from the issuer's audit log.
3. **Inline pack verification** — paste or fetch a pack and verify it through
   the CLI's own pipeline against the issuer's published keyring anchors; the
   verdict renders on the page.

### Branding

`/branding` — the whitelabel preview: organization, product name, theme swatches, a chrome
mock (header/card/footer) that inherits the colors, and the manifest's
branding block for copy-back. This page is why a whitelabel deployment can be
handed to a marketing team safely: the preview is live from the manifest, and
saving goes through the same validated editor.

## The auth model

Sessions, one token, constant time:

1. **The admin token** comes from `UNIDPP_CONSOLE_ADMIN_TOKEN` (the
   manifest's [`services.console.admin_token`](/operators/manifest/#services-common-admin_token)
   renders it). Submission is compared in **constant time**.
2. **A session** is an HttpOnly, SameSite=Strict cookie (`unidpp_console=`),
   valid **8 hours**. Sign-in issues it; `/logout` revokes it server-side.
3. **Mutations require a session.** Today that means exactly one mutation:
   saving the manifest. Everything else in the console is a read of some
   service's API.

### Read-only dev mode

With no admin token configured, the console is **open but read-only by
construction**: no session can exist (sessions require the token), and
without a session the save path refuses. The login page says exactly this:

```html
<h1>Open dev mode</h1>
<p>No admin token is configured. The console is read-only:
configuration saves require <code>UNIDPP_CONSOLE_ADMIN_TOKEN</code>.</p>
```

This is the pilot reference console's posture (and the acme tenant's, as
started by `up.sh` without an exported token). It is the correct posture for
a demonstration; a production deployment exports the token before starting
the console.

## What the console can and cannot do

**Can**: show health, browse registry items, show passports and the issuer
audit tail, verify packs inline, edit/validate/save the manifest (session
required), preview branding, render any service's environment.

**Cannot**: mint packs, create passports, register items, revoke keys, rotate
secrets, restart services, or modify anything in any service. The console has
exactly one write path — its own configuration file — and that path is
session-gated and validation-gated. Operational mutations remain operator
actions against service APIs (where they are audited, journaled, and
token-guarded by each service's own rules).

This is deliberate. An admin surface with implicit write-through to domain
services would be a second brain — a path around every service's audit
discipline. The console shows; the services do.

## Escaping HTML

Every interpolated value in every page goes through one escaping helper
before render. The console renders operator-controlled strings
(organization names, manifest text, service responses); all of them are
treated as untrusted. The test suite exercises a `<script>` payload in an
organization name end to end.
