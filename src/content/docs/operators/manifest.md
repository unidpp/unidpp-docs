---
title: The operator manifest reference
description: Every knob of the operator manifest — typed, with defaults, examples, constraints, and the environment each renders.
---

A UniDPP deployment is data. One versioned, validated file — the **operator
manifest** (`unidpp-operator.yaml`) — declares every knob of every service:
binds, secrets, feature toggles, crypto-suite policy, branding, and the
sovereignty declaration. Processes stay plain environment-configured; the
manifest is rendered into their environment at launch. Zero code differs
between the reference deployment and a tenant: the manifest is the product.

This page documents **every field** of the manifest schema
(`api_version: unidpp.org/v1`). Each knob below has an anchor (`#api_version`,
`#services-issuer-pack_suites`, …) — the field list is machine-checked against
the schema's struct definitions by the coverage script in the docs repository.

## The file

YAML by convention; a leading `{` parses as JSON (the schema is identical).
Secrets are `${VAR}` references substituted from the environment at load —
**the manifest never carries token values.**

```yaml title="unidpp-operator.yaml — the reference deployment"
api_version: unidpp.org/v1
deployment:
  name: unidpp-reference
  profile: reference
  base_url: https://registry.unidpp.org
branding:
  organization: UniDPP
  product_name: UniDPP Reference Deployment
services:
  registry:
    bind: 127.0.0.1:8390
    state_file: registry-journal.jsonl
  trust:
    bind: 127.0.0.1:8391
    state_file: run/trust-journal.jsonl
  log:
    bind: 127.0.0.1:8392
    log_id: unidpp-pilot-log-1
    state_file: run/log-journal.jsonl
    external_tsa_url: http://timestamp.digicert.com
  issuer:
    bind: 127.0.0.1:8393
    pack_suites: [ecdsa-p256, sm2]
    registry_url: http://127.0.0.1:8390
  projector:
    bind: 127.0.0.1:8394
  gateway:
    bind: 127.0.0.1:8395
    issuer_url: http://127.0.0.1:8393
  archive:
    bind: 127.0.0.1:8396
sovereignty:
  external_calls: external
```

## Loading rules

Four rules the loader enforces before anything starts:

1. **Unknown knobs are loud.** A typo is a schema error naming the field and
   the legal alternatives — never a silent no-op:

   ```sh
   $ unidpp-config validate bad-manifest.yaml
   unidpp-config: manifest does not match the schema: unknown field `binds`, expected one of `bind`, `admin_token`, `state_file`
   ```

2. **Secrets must resolve.** `${VAR}` substitutes from the environment; an
   unset reference is an error (secrets never silently resolve to empty).
   Variable names are ASCII alphanumerics and `_`; an unterminated `${...` is
   an error.
3. **Semantic validation.** Beyond shape: the API version, theme colors, pack
   suites, and the profile × egress rule (below) are checked.
4. **Profiles constrain.** A `sovereign` deployment with any egress beyond
   `none` refuses to validate unless [`egress_override_reason`](#sovereignty-egress_override_reason)
   records why — data-sovereignty claims are validated, not aspirational.

## The tool

`unidpp-config` is the manifest CLI. All three subcommands are read-only over
the file plus the environment:

```sh
$ unidpp-config validate unidpp-operator.yaml
valid: unidpp-reference (profile reference, 7 service(s): ["registry", "trust", "log", "issuer", "projector", "gateway", "archive"])

$ unidpp-config services unidpp-operator.yaml
registry
trust
log
issuer
projector
gateway
archive

$ unidpp-config render-env log unidpp-operator.yaml
UNIDPP_LOG_BIND=127.0.0.1:8392
UNIDPP_LOG_EXTERNAL_TSA_URL=http://timestamp.digicert.com
UNIDPP_LOG_ID=unidpp-pilot-log-1
UNIDPP_LOG_STATE_FILE=run/log-journal.jsonl
```

`render-env <service> <manifest>` prints exactly the `UNIDPP_*` variables the
named service's own environment-based configuration reads, one `KEY=value`
per line in stable order. It fails when the deployment declares no such
service block or the name is unknown. `stack.sh` and `tenants/up.sh` launch
processes from this rendering — manifests drive unmodified binaries.

---

## Top-level fields

<a id="api_version"></a>
### `api_version`

| | |
|---|---|
| Type | string |
| Required | yes |
| Constraint | must equal `unidpp.org/v1` |
| Example | `api_version: unidpp.org/v1` |

The manifest's API version — the only version this generation of the schema
speaks. Anything else is refused at load with the offending value named.

<a id="deployment"></a>
### `deployment`

| | |
|---|---|
| Type | object ([`Deployment`](#deployment-name)) |
| Required | yes |
| Default | — |

The deployment identity and shape. Fields: [`name`](#deployment-name),
[`profile`](#deployment-profile), [`base_url`](#deployment-base_url).

<a id="branding"></a>
### `branding`

| | |
|---|---|
| Type | object ([`Branding`](#branding-organization)) |
| Required | no |
| Default | organization `UniDPP`, product name `UniDPP Platform`, no logo, default theme, empty footer |

The whitelabel surface. The console (and any explorer surface) renders its
chrome from these values — see [the console manual](/operators/console/#branding)
for the preview. Fields: [`organization`](#branding-organization),
[`product_name`](#branding-product_name), [`logo`](#branding-logo),
[`theme`](#branding-theme), [`footer`](#branding-footer),
[`locale`](#branding-locale).

<a id="services"></a>
### `services`

| | |
|---|---|
| Type | object ([`Services`](#services-registry)) |
| Required | no |
| Default | no services |

Per-service configuration blocks. **An absent service block means that
service is not part of this deployment** — the launcher will neither start it
nor render its environment. Present blocks:
[`registry`](#services-registry), [`trust`](#services-trust), [`log`](#services-log),
[`issuer`](#services-issuer), [`projector`](#services-projector),
[`gateway`](#services-gateway), [`archive`](#services-archive),
[`console`](#services-console).

<a id="features"></a>
### `features`

| | |
|---|---|
| Type | object ([`Features`](#features-untp_ingest)) |
| Required | no |
| Default | all toggles `true` |

Cross-cutting toggles. Fields: [`untp_ingest`](#features-untp_ingest),
[`cddal_negotiation`](#features-cddal_negotiation),
[`presentation_render`](#features-presentation_render).

> **Status — declared, not yet consumed.** The `features` block is part of the
> schema (typed, validated, unknown keys rejected), but as of this writing no
> service in the running stack reads it and `render-env` does not emit it.
> The toggles below describe the intent each knob will govern. Set them only
> if you accept that they are currently inert.

<a id="sovereignty"></a>
### `sovereignty`

| | |
|---|---|
| Type | object ([`Sovereignty`](#sovereignty-data_residency)) |
| Required | no |
| Default | no residency pinned, egress `none`, no override reason |

The sovereignty declaration: what may leave the box. Fields:
[`data_residency`](#sovereignty-data_residency),
[`external_calls`](#sovereignty-external_calls),
[`egress_override_reason`](#sovereignty-egress_override_reason).

---

## `deployment` fields

<a id="deployment-name"></a>
### `deployment.name`

| | |
|---|---|
| Type | string |
| Required | yes |
| Constraint | must not be empty (or whitespace) |
| Example | `name: acme-eu` |

The deployment's name — the tenant name, unique per operator. It appears in
the console's identity document and dashboard.

<a id="deployment-profile"></a>
### `deployment.profile`

| | |
|---|---|
| Type | enum: `reference` \| `whitelabel` \| `sovereign` |
| Required | yes |
| Example | `profile: whitelabel` |

The deployment shape. See [deployment profiles](/operators/profiles/):

- **`reference`** — the hosted reference deployment.
- **`whitelabel`** — an organization's own branded instance.
- **`sovereign`** — on-prem, jurisdiction-pinned, external calls off (or on
  only with a recorded reason — see [`egress_override_reason`](#sovereignty-egress_override_reason)).

<a id="deployment-base_url"></a>
### `deployment.base_url`

| | |
|---|---|
| Type | string (URL) |
| Required | yes |
| Example | `base_url: https://dpp.acme-mobility.example.org` |

The public base URL of the deployment's primary surface. Informational for
now — used in the console dashboard; the deployment's own binds and upstreams
are declared per service.

---

## `branding` fields

<a id="branding-organization"></a>
### `branding.organization`

| | |
|---|---|
| Type | string |
| Default | `UniDPP` |
| Example | `organization: ACME Mobility` |

The operating organization's legal/display name. Rendered in the console
chrome (header, login card) and carried by every branded surface.

<a id="branding-product_name"></a>
### `branding.product_name`

| | |
|---|---|
| Type | string |
| Default | `UniDPP Platform` |
| Example | `product_name: ACME 产品数字护照` |

The product name shown in chrome — login, page titles, footers. Unicode is
accepted (the sovereign CN tenant ships its product name in Chinese).

<a id="branding-logo"></a>
### `branding.logo`

| | |
|---|---|
| Type | string (path or data URI), optional |
| Default | absent (no logo; the organization name stands alone) |
| Example | `logo: "data:image/svg+xml;base64,..."` |

A logo the console and explorer serve. Consumed by the console chrome: when
set, an `<img class="logo">` renders before the organization name.

<a id="branding-locale"></a>
### `branding.locale`

| | |
|---|---|
| Type | string, optional |
| Default | `en` |
| Example | `locale: zh-CN` |

The console chrome's language: nav, titles, login, cards, badges,
and the primary buttons render through the console's i18n table
(`en`, `zh-CN` today; validated). A new language is a table entry
plus the config crate's `SUPPORTED_LOCALES` — not a code change.
Body prose is English in v1 (chrome-level i18n, honestly scoped).

<a id="branding-theme"></a>
### `branding.theme`

| | |
|---|---|
| Type | object ([`Theme`](#branding-theme-primary)) |
| Default | primary `#0f62fe`, accent `#08bdba` |

Two hex colors. Fields: [`primary`](#branding-theme-primary),
[`accent`](#branding-theme-accent).

<a id="branding-theme-primary"></a>
### `branding.theme.primary`

| | |
|---|---|
| Type | string |
| Default | `#0f62fe` |
| Constraint | six-digit hex, `#`-prefixed (`#rrggbb`) — anything else is refused |

The primary color — headers, badges, the login card border.

<a id="branding-theme-accent"></a>
### `branding.theme.accent`

| | |
|---|---|
| Type | string |
| Default | `#08bdba` |
| Constraint | `#rrggbb` (same as primary) |

The accent color.

Validation error when a color is wrong:

```sh
unidpp-config: branding.theme.primary must be a #rrggbb hex color (got `red`)
```

<a id="branding-footer"></a>
### `branding.footer`

| | |
|---|---|
| Type | object ([`Footer`](#branding-footer-legal_url)) |
| Default | no links |

Footer links. Fields: [`legal_url`](#branding-footer-legal_url),
[`contact_url`](#branding-footer-contact_url).

<a id="branding-footer-legal_url"></a>
### `branding.footer.legal_url`

| | |
|---|---|
| Type | string (URL), optional |
| Default | absent |
| Example | `legal_url: https://www.acme-mobility.example.org/legal` |

The legal/imprint link rendered in the console footer.

<a id="branding-footer-contact_url"></a>
### `branding.footer.contact_url`

| | |
|---|---|
| Type | string (URL), optional |
| Default | absent |
| Example | `contact_url: mailto:dpp@acme-mobility.example.org` |

The contact link rendered in the console footer.

---

## `services` blocks

Each block below lists the fields and the environment variables
[`render-env`](#the-tool) produces. Every service also accepts the common
knobs; the service-specific knobs come after.

<a id="services-registry"></a>
### `services.registry`

| | |
|---|---|
| Type | object ([`ServiceCommon`](#services-common-bind)) |
| Example | `registry: { bind: 127.0.0.1:8390, admin_token: ${ACME_REGISTRY_TOKEN}, state_file: tenants/acme/registry-journal.jsonl }` |

The ISO 19135 item + discovery registry. See the
[registry reference](/services/registry/).

| Manifest field | Environment variable |
|---|---|
| `bind` | `UNIDPP_REGISTRY_BIND` |
| `admin_token` | `UNIDPP_REGISTRY_ADMIN_TOKEN` |
| `state_file` | `UNIDPP_REGISTRY_STATE_FILE` |

<a id="services-trust"></a>
### `services.trust`

| | |
|---|---|
| Type | object ([`ServiceCommon`](#services-common-bind)) |

The SIGNATIF trust-graph service. See the
[trust reference](/services/trust/).

| Manifest field | Environment variable |
|---|---|
| `bind` | `UNIDPP_TRUST_BIND` |
| `admin_token` | `UNIDPP_TRUST_ADMIN_TOKEN` |
| `state_file` | `UNIDPP_TRUST_STATE_FILE` |

<a id="services-log"></a>
### `services.log`

| | |
|---|---|
| Type | object (`LogService` = [common](#services-common-bind) + [`log_id`](#services-log-log_id) + [`external_tsa_url`](#services-log-external_tsa_url)) |

The transparency-log anchor service. See the
[log reference](/services/log/).

| Manifest field | Environment variable |
|---|---|
| `bind` | `UNIDPP_LOG_BIND` |
| `admin_token` | `UNIDPP_LOG_APPEND_TOKEN` |
| `state_file` | `UNIDPP_LOG_STATE_FILE` |
| `log_id` | `UNIDPP_LOG_ID` |
| `external_tsa_url` | `UNIDPP_LOG_EXTERNAL_TSA_URL` |

Note the token's variable name: the log calls it the **append token**
(`UNIDPP_LOG_APPEND_TOKEN`) because appending commitments is its only
mutation.

<a id="services-log-log_id"></a>
### `services.log.log_id`

| | |
|---|---|
| Type | string |
| Default | `unidpp-log-1` |
| Constraint | 1-64 printable ASCII characters |
| Example | `log_id: unidpp-pilot-log-1` |

The log's identity — the `log_id` inside every signed tree head and receipt,
and what a verifier pins along with the operator key.

<a id="services-log-external_tsa_url"></a>
### `services.log.external_tsa_url`

| | |
|---|---|
| Type | string (URL), optional |
| Default | absent (no external anchoring) |
| Example | `external_tsa_url: http://timestamp.digicert.com` |

An RFC 3161 timestamp-authority endpoint; every append's tree head is also
anchored there. An unreachable TSA **degrades explicitly** — the submission
failure is recorded, never silently skipped.

Setting this on a `sovereign` deployment whose [`external_calls`](#sovereignty-external_calls)
is `none` is a contradiction the validator refuses, even with an egress
override reason on record.

<a id="services-issuer"></a>
### `services.issuer`

| | |
|---|---|
| Type | object (`IssuerService` = [common](#services-common-bind) + [`pack_suites`](#services-issuer-pack_suites) + [`registry_url`](#services-issuer-registry_url)) |

The passport lifecycle issuer. See the [issuer reference](/services/issuer/).

| Manifest field | Environment variable |
|---|---|
| `bind` | `UNIDPP_ISSUER_BIND` |
| `admin_token` | `UNIDPP_ISSUER_ADMIN_TOKEN` |
| `state_file` | `UNIDPP_ISSUER_STATE_FILE` |
| `pack_suites` | `UNIDPP_ISSUER_PACK_SUITE` (comma-joined) |
| `registry_url` | `UNIDPP_ISSUER_REGISTRY_URL` |

<a id="services-issuer-pack_suites"></a>
### `services.issuer.pack_suites`

| | |
|---|---|
| Type | list of strings |
| Default | `["ecdsa-p256"]` |
| Constraint | at least one suite; no empty entries |
| Example | `pack_suites: [ecdsa-p256, sm2]` — the co-signature policy |

The sovereign pack-signing policy: one suite, or a co-signature set where
every listed suite signs the same pack body (a pack verifiable in both
circuit-styles). Known suites: `ecdsa-p256`, `sm2`. The default EU posture is
`ecdsa-p256`; a Chinese sovereign deployment sets `pack_suites: [sm2]`.

<a id="services-issuer-registry_url"></a>
### `services.issuer.registry_url`

| | |
|---|---|
| Type | string (URL), optional |
| Default | absent (no registry forwarding) |
| Example | `registry_url: http://127.0.0.1:8390` |

The registry the issuer forwards profile registrations and applicability
bindings to (its `/admin/profiles` and `/admin/applicability` endpoints
forward on success). Absent = the issuer keeps profiles locally.

<a id="services-projector"></a>
### `services.projector`

| | |
|---|---|
| Type | object ([`ServiceCommon`](#services-common-bind)) |

The lens projection service. See the
[projector reference](/services/projector/).

| Manifest field | Environment variable |
|---|---|
| `bind` | `UNIDPP_PROJECTOR_BIND` |
| `admin_token` | `UNIDPP_PROJECTOR_ADMIN_TOKEN` |
| `state_file` | `UNIDPP_PROJECTOR_STATE_FILE` |

The projector reads passports, profiles, units, and transforms from its own
environment (`UNIDPP_PROJECTOR_PASSPORTS_DIR`, `UNIDPP_REGISTRY_URL`, …) —
those are deployment environment, not manifest fields; see the
[projector reference](/services/projector/#environment) for the full list.

<a id="services-gateway"></a>
### `services.gateway`

| | |
|---|---|
| Type | object (`GatewayService` = [common](#services-common-bind) minus `state_file` + [`issuer_url`](#services-gateway-issuer_url)) |

The interop gateway. See the [gateway reference](/services/gateway/).

| Manifest field | Environment variable |
|---|---|
| `bind` | `UNIDPP_GATEWAY_BIND` |
| `admin_token` | `UNIDPP_GATEWAY_ADMIN_TOKEN` |
| `issuer_url` | `UNIDPP_ISSUER_URL` |

The gateway keeps no state — it renders, it does not store — so its block
declares no `state_file`.

<a id="services-gateway-issuer_url"></a>
### `services.gateway.issuer_url`

| | |
|---|---|
| Type | string (URL), optional |
| Default | absent (fixture mode) |
| Example | `issuer_url: http://127.0.0.1:8393` |

The issuer upstream whose passports the gateway renders. Absent = the gateway
serves its built-in fixtures only (`issuer-upstream-with-fixture-fallback`:
when the upstream is unreachable the gateway answers from fixtures and says
so in the render metadata).

<a id="services-archive"></a>
### `services.archive`

| | |
|---|---|
| Type | object ([`ServiceCommon`](#services-common-bind)) |

The Tier-C notarized snapshot service. See the
[archive reference](/services/archive/).

| Manifest field | Environment variable |
|---|---|
| `bind` | `UNIDPP_ARCHIVE_BIND` |
| `admin_token` | `UNIDPP_ARCHIVE_ADMIN_TOKEN` |
| `state_file` | `UNIDPP_ARCHIVE_STATE_FILE` |

The archive's snapshot directory (`UNIDPP_ARCHIVE_SNAPSHOT_DIR`) and its log
upstream (`UNIDPP_LOG_URL`) are deployment environment; see the
[archive reference](/services/archive/#environment).

<a id="services-console"></a>
### `services.console`

| | |
|---|---|
| Type | object ([`ServiceCommon`](#services-common-bind)) |

The admin console. See the [console manual](/operators/console/).

| Manifest field | Environment variable |
|---|---|
| `bind` | `UNIDPP_CONSOLE_BIND` |
| `admin_token` | `UNIDPP_CONSOLE_ADMIN_TOKEN` |
| `state_file` | `UNIDPP_CONSOLE_STATE_FILE` |

The console's manifest **path** is environment, not manifest:
`UNIDPP_CONSOLE_MANIFEST` points the console at the file it manages.

### Common service knobs

## The machine-readable schema

The manifest's shape is published as a JSON Schema (draft 2020-12),
generated from the model itself — never hand-maintained:

- This page's companion artifact:
  [`/operator-manifest.schema.json`](/operator-manifest.schema.json)
- Regenerate after changing unidpp-config:
  `unidpp-config schema > public/operator-manifest.schema.json`
  (the docs CI fails on drift)

The schema is exactly as strict as `unidpp-config load` (unknown
fields are rejected everywhere). It describes **shape only**:
semantic validation — `${VAR}` secret substitution, hex colors, the
sovereign egress rule — stays with the CLI's `validate`, which is
what editors' CI preflight should call for the final word.

These four knobs appear on every service block (`registry`, `trust`,
`projector`, `archive`, `console` carry exactly these; `log`, `issuer`,
`gateway` add the knobs listed above).

#### `bind`

| | |
|---|---|
| Type | string (`host:port`) |
| Required | yes (on any present service block) |
| Example | `bind: 127.0.0.1:9390` |

The address the service listens on. `render-env` emits it as the service's
`UNIDPP_<SERVICE>_BIND`; a bad address makes the service exit at startup.

<a id="services-common-admin_token"></a>
#### `admin_token`

| | |
|---|---|
| Type | string — an `${VAR}` reference, optional |
| Default | absent (open dev mode) |
| Example | `admin_token: ${ACME_ISSUER_TOKEN}` |

The Bearer token guarding the service's mutations and `/admin/*` endpoints.
**Absent = open dev mode** — every mutation endpoint answers without
authentication. This is the pilot posture; it is not a production posture.
The value should always be an `${VAR}` reference; inline secrets work at load
time but defeat the doctrine (the console editor, for one, is built around
references never resolving on screen).

<a id="services-common-state_file"></a>
#### `state_file`

| | |
|---|---|
| Type | string (path), optional |
| Default | absent (state lives in memory only) |
| Example | `state_file: run/issuer-journal.jsonl` |

The service's append-only JSONL journal — the audit log that replays on
start. Absent = no persistence across restarts. Paths are relative to the
process working directory; `stack.sh` and `tenants/up.sh` launch from the
pilot-data root, which is why the reference manifest says
`registry-journal.jsonl` for one service and `run/…` for others.

<a id="services-common-public_url"></a>
#### `public_url`

| | |
|---|---|
| Type | string (URL), optional |
| Default | absent (the service is loopback-only) |
| Example | `public_url: https://registry.unidpp.org` |

The service's public hostname when a tunnel or ingress fronts it. The
console's services matrix renders it as the service's public link;
absent renders loopback-only — the console invents nothing. Declaring
it does not create the tunnel: provisioning (tunnel token + DNS
record) is an operator act, documented in the pilot repo's README.

The gateway declares no `state_file` (it is stateless by design); the
console's is accepted by the schema but the console's own state is the
manifest file itself plus in-memory sessions.

---

## `features` fields

> Recall the [status note](#features): validated, not yet consumed by the
> running services.

<a id="features-untp_ingest"></a>
### `features.untp_ingest`

| | |
|---|---|
| Type | boolean |
| Default | `true` |

Accept UNTP ingest on the gateway (`POST /untp/ingest` — see
[UNTP interop](/federation/untp/)).

<a id="features-cddal_negotiation"></a>
### `features.cddal_negotiation`

| | |
|---|---|
| Type | boolean |
| Default | `true` |

Serve the CDDAL dictionary form on content negotiation (registry collection
reads with `Accept: text/cddal` — see the
[registry reference](/services/registry/#content-negotiation)).

<a id="features-presentation_render"></a>
### `features.presentation_render`

| | |
|---|---|
| Type | boolean |
| Default | `true` |

Serve the presentation render on the projector (`GET /render` — see the
[projector reference](/services/projector/)).

---

## `sovereignty` fields

<a id="sovereignty-data_residency"></a>
### `sovereignty.data_residency`

| | |
|---|---|
| Type | string, optional |
| Default | absent (no residency pinned) |
| Example | `data_residency: EU` — or `CN`, `JP` |

The jurisdiction this deployment pins data to. Displayed in the console
dashboard's egress summary.

<a id="sovereignty-external_calls"></a>
### `sovereignty.external_calls`

| | |
|---|---|
| Type | enum: `none` \| `tsa-only` \| `external` |
| Default | `none` |

The egress policy — what may leave the box:

- **`none`** — nothing leaves the box.
- **`tsa-only`** — only the RFC 3161 TSA submission (the log's
  [`external_tsa_url`](#services-log-external_tsa_url)).
- **`external`** — upstream fetches permitted (the reference deployment's
  posture: the issuer forwards to the registry, the gateway fetches the
  issuer, the archive anchors into the log).

<a id="sovereignty-egress_override_reason"></a>
### `sovereignty.egress_override_reason`

| | |
|---|---|
| Type | string, optional |
| Default | absent |
| Example | `egress_override_reason: CN AICPA timestamp regulation 2026-14` |

Required when a `sovereign` profile permits egress beyond `none`: the
recorded, auditable reason. A sovereign manifest with
`external_calls: tsa-only` and no reason is refused:

```sh
unidpp-config: profile `sovereign` with external_calls `tsa-only` requires sovereignty.egress_override_reason (recorded, auditable)
```

With the reason on record, the same manifest validates. The point is honesty:
sovereignty claims that contradict the deployment's actual egress do not
load.

---

## Worked examples

The three real deployments of the pilot workspace, all validated:

- **reference** — the manifest shown [above](#the-file): seven services, dual
  pack suites, external egress.
- **whitelabel (`acme-eu`)** — three services (registry 9390, issuer 9393,
  console 9389), EU residency, `ecdsa-p256` packs, egress `none`, full
  branding block (theme `#7c3aed`/`#f59e0b`, footer links).
- **sovereign (`acme-cn`)** — three services (registry 9590, issuer 9593,
  console 9589), CN residency, **`sm2`-only packs**, egress `none` — the
  policy enforced by the validator, not by convention.

See [multi-tenant operations](/operators/multi-tenant/) for how these run.

## Coverage check

The docs repository carries a coverage script that extracts every serde
field name from `unidpp-config`'s schema definitions and checks each has a
documented anchor on this page. Run it from the docs repo:

```sh
tools/check-manifest-coverage.sh ../unidpp-config/src/lib.rs src/content/docs/operators/manifest.md
```

It prints one line per field and a final `coverage: N/N fields documented`.
If a knob is added to the schema without documentation, the check fails —
this page and the schema move together or not at all.
