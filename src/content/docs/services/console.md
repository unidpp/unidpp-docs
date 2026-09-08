---
title: Console (service)
description: The unidpp-console service reference — endpoints, environment, and the manifest it manages.
---

The admin console as a service. The operator-facing manual — every page, the
auth model, what the console can and cannot do — is
[the console manual](/operators/console/); this page is the endpoint and
environment reference. In the reference deployment the console binds
`127.0.0.1:8389`.

The console is a surface, not a second brain: every fact comes from a
service's API or from the manifest; the only mutation is the validated,
session-gated save of the manifest file itself.

## Endpoints

| Endpoint | What |
|---|---|
| `GET /` | the dashboard: deployment summary + per-service health probes |
| `GET /healthz` | liveness (`ok`, plain text) |
| `GET /.well-known/unidpp-service` | the identity document (service, deployment, profile, product) — the orchestrator's probe |
| `GET /login` · `POST /login` | sign-in (token → session cookie) |
| `POST /logout` | revoke the session server-side |
| `GET /config` | the manifest editor (file as stored; secrets stay `${VAR}`) |
| `POST /config` | validate and atomically save the manifest (session required) |
| `GET /config/env?service=` | the rendered `UNIDPP_*` environment for one service |
| `GET /registry?class=&register=` | the registry item browser (filters forwarded) |
| `GET /passports?id=` | passport lookup, issuer audit tail, inline pack verification |
| `POST /passports` | the pack-verification submit (through the CLI's own pipeline) |
| `GET /branding` | the whitelabel preview |

## Identity probe (recorded)

```sh
$ curl -s http://127.0.0.1:8389/.well-known/unidpp-service | jq .
{
  "service": "unidpp-console",
  "deployment": "unidpp-reference",
  "profile": "reference",
  "product": "UniDPP Reference Deployment"
}
```

On the whitelabel tenant (9389) the same call answers `acme-eu` /
`whitelabel` / `ACME Digital Product Passport`.

## Environment

Manifest-rendered:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_CONSOLE_BIND` | listen address | `127.0.0.1:8397` |
| `UNIDPP_CONSOLE_ADMIN_TOKEN` | the admin token; unset = read-only dev mode | unset |
| `UNIDPP_CONSOLE_STATE_FILE` | accepted (the console's state is the manifest + memory) | none |

Direct environment:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_CONSOLE_MANIFEST` | path to the operator manifest it manages | `unidpp-operator.yaml` |

The console refuses to start over an unreadable or invalid manifest — the
error names the file and the reason.

## Degradation semantics

- **Unreachable services show as unreachable.** The dashboard probes each
  declared service's `/healthz` and reports `healthy` / the HTTP status /
  `unreachable` — a down registry or issuer degrades exactly that page's
  data, never the console itself.
- **A rejected save writes nothing.** Validation failures return the error
  verbatim; the write is atomic (temp + rename) so a failed write never
  truncates the live manifest.
- **Unset secret variables are advisory.** A `${VAR}` missing from the
  console's environment is explained (export it and save again) — the editor
  stages the file; the launcher resolves the environment.
