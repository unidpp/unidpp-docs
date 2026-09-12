---
title: Registry participant adoption
description: Run the registry alone — profiles in their signed form, data elements, transforms, cross-register mappings and deposited models, under the ISO 19135 item lifecycle.
---

The registry participant operates a register, not a passport
system: profiles, data elements, units, transforms, trust anchors,
crypto suites, cross-register mappings and deposited semantic
models — each item versioned under the ISO 19135 lifecycle, each
mutation audited. A jurisdiction running its profile catalogue, a
standards body running a data-element directory, a sector body
running mappings between two vocabularies: all registry
participants.

This path implements Part 7 (semantic registry and mappings) and
the registry half of Part 3 (profiles register here; the projector
that applies them belongs to other paths).

## What the adopter holds

- The `unidpp-registry` binary, a state file, and — for mutations —
  an admin token.

```sh
$ UNIDPP_REGISTRY_BIND=127.0.0.1:18401 \
  UNIDPP_REGISTRY_STATE_FILE=registry.json \
  UNIDPP_REGISTRY_ADMIN_TOKEN=… unidpp-registry &
```

Reads are public; mutations require the bearer token.

## The item classes

Each class mounts its own subregister (`/profiles`, `/data-elements`,
`/transforms`, `/units`, `/trust-anchors`, `/crypto-suites`) with the
same endpoints: list, get, supersede, supersession chain. Two
classes carry dedicated surfaces:

- **Models** (`POST /models`): an EXPRESS or CDDAL semantic model —
  source text, content hash, expressir validation status.
- **Cross-register mappings** (`/cross-register-mappings`): the
  source-to-target items of the mapping discipline, with their tier
  (deterministic transform, attested correspondence, or recorded
  divergence).

## Profiles register only in their signed form

The intake for a profile requires the signed manifest: the issuer
class (law, treaty, consensus, declaration or attestation), the
issuing node, and a signature slot with a value. The registry holds
no trust graph, so it enforces the form; the cryptographic reading
belongs to the trust service. The refusal is verbatim:

```sh
$ curl -s -X POST http://127.0.0.1:18401/profiles \
    -H 'authorization: Bearer …' -H 'content-type: application/json' \
    -d '{"register_id":"unidpp","item_id":"battery-eu","version":"1",
         "definition":"…","manifest":{"version":"1"}}'
{"error": "profile-signature-required rejected the item: profiles register
only in their SIGNED form: a signature slot with a signature value is
required (the cryptographic reading is the trust service's)"}
```

The console's [profile-authoring surface](/operators/console/)
walks the same intake as a form.

## The 19135 discipline

Items move through the lifecycle — valid, superseded,
retired — by versioning, never by editing: supersession chains are
served at `/{class}/{id}/supersession`, and applicability bindings
(`/applicability`) carry legal-as-of semantics with dated effective
windows. Reads accept `at=` for point-in-time state; the current
registered state and in-force-at-now are distinct queries.

## Peering

A registry federates as a peer, never as a master: item exchange
runs the same operation in both directions, each deployment serving
the other's items as mirrors, and no message of the protocol names a
privileged node. See [running a national peer](/federation/jp-peer/).
