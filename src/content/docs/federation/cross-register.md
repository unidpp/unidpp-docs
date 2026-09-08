---
title: Cross-register mappings
description: Mapping items between registers — the equivalence transform, the registry endpoints, and the integrity checks.
---

A cross-register mapping is a registered item (class
`cross-register-mapping`) that states a correspondence between identifiers or
semantics in two registers — for example, that a Chinese national standard
corresponds to an IEC standard *for the purposes of* some conformity
evidence. Mappings are versioned, dated, and integrity-checked like every
other registry item; they are how peers and foreign registers reconcile
without merging.

## The registry endpoints

The mapping class has a subregister surface (`/cross-register-mappings`) and
dedicated queries:

| Endpoint | What |
|---|---|
| `GET /cross-register-mappings?item=&source=&target=&register=&at=` | mappings by item, source register, target register |
| `GET /cross-register-mappings/{id}` | one mapping |
| `POST /items` (class `cross-register-mapping`) | register a mapping |
| `GET /cross-register-mappings/{id}/supersession` | the mapping's version chain |

## The worked example (recorded)

The pilot's seeded mapping — GB 4943.1-2022 ↔ IEC 62368-1 for charger
conformity evidence:

```sh
$ curl -s 'http://127.0.0.1:8390/cross-register-mappings?limit=2' \
    | jq '.items[0] | {identifier, title, version: .version.status, effective: .version.effective_from}'
{
  "identifier": "urn:unidpp:map:gb4943-iec62368",
  "title": "GB 4943.1-2022 corresponds to IEC 62368-1 for the purposes of charger conformity evidence",
  "version": "valid",
  "effective": "2026-09-01T00:00:00Z"
}
```

Note the shape of the claim: not "GB 4943.1 = IEC 62368-1" (two standards are
never identical), but a scoped correspondence — *for the purposes of* — with
a version and an effective date. A mapping is a legal fact, and it is dated
like one.

## Integrity checks

Mapping intake is one of the registry's three named
[intake checks](/services/registry/#semantics-and-degradation) (alongside the
profile-manifest schema and profile satisfiability): the referenced items,
source and target registers must resolve. A mapping to a nonexistent item is
rejected at registration, not discovered at query time.

## Why mappings are global

A mapping's value is that both sides trust it. A jurisdiction's register can
hold its own mappings, but the mappings between *external* registers — GB ↔
IEC, or a jurisdiction profile ↔ a sector profile — belong in the global
register where every peer can resolve them. This is the split the
[JP peer](/federation/jp-peer/#what-lives-where) page summarizes: the global
node keeps what is governance-shaped; jurisdiction-shaped data lives with the
jurisdiction.

## What mappings are not

- **Not transforms.** The transform class (`/transforms`) is executable
  semantics — unit conversions, classifications, code-list mappings a
  [projector](/services/projector/) view runs. A mapping is a registered
  claim about correspondence; a transform is a function. (The GB↔IEC item
  doubles as a transform in the pilot's seed corpus, which is why its
  submitting organization names the equivalence seed.)
- **Not identifier resolution.** Resolving one identifier to another is the
  resolver's job; mappings state *why* two identifiers correspond.
