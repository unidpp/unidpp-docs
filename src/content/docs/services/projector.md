---
title: Projector
description: "The unidpp-projector service — lens projection: a passport under a registered profile, plus the consumer presentation render."
---

The lens projection service: render a passport under a registered profile at
a chosen instant — the EU/JP two-lens moment as a service. Read-only by
design; the `actor` parameter is recorded, not authenticated. In the
reference deployment it binds `127.0.0.1:8394` and reads the registry at
8390 plus the passport store under `passports/`.

## Endpoints

| Endpoint | What |
|---|---|
| `GET /` | discovery (view/render contracts, selection gates, source precedence) |
| `GET /healthz` | liveness |
| `GET /view?passport=&profile=&actor=&at=` | the projection: selected elements (each with sourcing provenance and trust marker), transforms, coverage report |
| `GET /render?passport=&profile=&lang=&at=` | the consumer presentation (localized sections, formatted values) |

## The two-lens example (recorded)

The same passport under two registered lens profiles at the same instant:

```sh
$ curl -s -G 'http://127.0.0.1:8394/view' \
    --data-urlencode 'passport=urn:unidpp:passport:pilot-e8-j000842' \
    --data-urlencode 'profile=urn:unidpp:profile:pilot-eu-lens' \
    --data-urlencode 'actor=importer' --data-urlencode 'at=2028-06-01T00:00:00Z' \
    | jq '{source: .profile.source, present: .coverage.elements_present,
           required: .coverage.elements_required, complete: .coverage.complete}'
{
  "source": "registry",
  "present": 3,
  "required": 3,
  "complete": true
}
```

The JP lens over the same passport and instant reports the gap explicitly —
`de.jp.top-runner-class` was never written at or before the as-of instant
(`reason: absent-as-of`), and the coverage ratio drops to 2/3. A missing fact
is never invented; the divergence between two lenses is auditable.

`GET /render` adds the presentation layer: localized section titles and
labels (with fallback language), values formatted per the binding (unit
suffix, one decimal), and render metadata (profile version, template
reference, the language actually served).

## Selection gates

An element enters a view only if it passes the gates, and each missing
element names the gate that stopped it:

- **presence** — a sourcing event wrote the fact at or before the as-of
  instant (`absent-as-of`);
- **capability-gate** — the subject class meets the binding floor;
- **below-trust-floor** — the sourcing event's trust marker is under the
  binding's floor.

## Sources and precedence {#environment}

The projector assembles a view from multiple sources, each with an explicit
fallback:

| Source | Primary | Fallback |
|---|---|---|
| profiles | registry profile items (point-in-time) | built-in EU/JP fixtures |
| passports | `UNIDPP_PROJECTOR_PASSPORTS_DIR` documents | built-in two-lens fixture |
| units | registry units subregister (ISO 80000 chain) | local ISO 80000 seed (conversions exact) |
| mappings | registry transform subregister | built-in fixtures (EU A-E ↔ JP star) |
| primmel rules | `UNIDPP_PROJECTOR_PRIMMEL_DIR` (operator pin) | registry → built-in fixtures |
| rollups | signed roll-up attestations when armed | field absent (never a placeholder) |

Every profile in a response names its `source`: `registry`, `fixtures`, or
`unreachable` — a degraded view says so in the body.

## Environment

Manifest-rendered:

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_PROJECTOR_BIND` | listen address | `127.0.0.1:8092` |
| `UNIDPP_PROJECTOR_ADMIN_TOKEN` | accepted for consistency (read-only service) | unset |
| `UNIDPP_PROJECTOR_STATE_FILE` | accepted; the projector keeps no journal | none |

Direct environment (the projection sources — this is where a deployment
points the projector at its own data):

| Variable | Meaning | Default |
|---|---|---|
| `UNIDPP_REGISTRY_URL` | registry base URL for profiles/units/transforms | none (fixtures) |
| `UNIDPP_PROJECTOR_REGISTRY_TOKEN` | Bearer token sent to the registry | none |
| `UNIDPP_PROJECTOR_PASSPORTS_DIR` | the passport document store | none (fixture mode) |
| `UNIDPP_PROJECTOR_PRIMMEL_DIR` | `.prml` Primmel rule packages (operator pin) | none |
| `UNIDPP_PROJECTOR_ROLLUP_SEED` | roll-up sealing key seed (with attester = armed) | none |
| `UNIDPP_PROJECTOR_ROLLUP_ATTESTER` | the attester id roll-ups name | none |

A rollup seed without an attester is refused loudly — the projector never
arms half-way.

## Degradation semantics

- **Registry unreachable** → fixtures serve, profiles report
  `source: "unreachable"`, and the view is honest about what it was built
  from.
- **Unmapped transform values** emit an explicit `unmapped` output, never a
  guessed one.
- **Failed transforms** carry `status: failed | missing-inputs |
  missing-children` per transform entry.
- **No mutations exist.** The projector cannot write anything; its worst
  failure is a degraded view, and degradation is stated in the response.
