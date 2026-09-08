---
title: Running a national peer (JP)
description: The peer doctrine and the JP walkthrough — a jurisdiction's registry as a peer, not a child.
---

National registries are **peers, not children** — the ePassport doctrine. A
jurisdiction's registry holds the jurisdiction's own data in its own journal,
served from its own register; the global registry keeps what is global
(scheme namespaces, cross-register mappings). Jurisdiction-shaped data lives
with the jurisdiction.

The pilot runs one national peer: the JP node, the same `unidpp-registry`
binary with its own journal (`jp-registry-journal.jsonl`), bound to
`127.0.0.1:8399` and published at `registry-jp.unidpp.org` through its own
named tunnel.

## The walkthrough

### 1. The node is a service block, not a fork

`stack.sh` starts the JP node with the rest of the stack — same binary,
different journal, different port:

```sh
start_service jp-registry unidpp-registry 8399 60 \
  UNIDPP_REGISTRY_BIND=127.0.0.1:8399 \
  UNIDPP_REGISTRY_STATE_FILE="$JP_REGISTRY_JOURNAL"
```

No code differs from the global registry. A peer is a deployment decision.

### 2. Seed the jurisdiction's own data

`seed-jp.sh` registers the JP road-traffic profile and its binding **on the
JP node** — JP data, decided in JP:

```sh
$ ./seed-jp.sh
seeding the JP national peer node (http://127.0.0.1:8399)
  [ok]   jp-road-traffic profile registered
  [ok]   jp-road-traffic binding registered
JP node seeded: 1 profile + 1 applicability binding (its own journal, its own register)
```

(Idempotent: `[skip]` lines on re-run.) Contrast the global node, where the
same profile exists as one of the pilot's ten items alongside the EU profile
— the two registers overlap by reference, not by subordination.

### 3. The peer answers its own register

```sh
$ curl -s 'http://127.0.0.1:8399/applicability?product_type=momiji:e8&at=2028-06-01T00:00:00Z' \
    | jq '[.applicability[].binding.profile_item]'
["urn:unidpp:profile:jp-road-traffic"]
```

At the same instant the global registry answers the same query with **EU +
JP**. Neither answer is wrong: each register answers for its own scope. A
consumer that must reconcile both uses
[cross-register mappings](/federation/cross-register/).

### 4. Publication

The JP node reaches the public internet the way every UniDPP surface does:
a named tunnel, ingress `registry-jp.unidpp.org` → `127.0.0.1:8399`, adopted
or started by `stack.sh` when `jp-tunnel.token` is present. No token, no
tunnel — the node stays loopback, which is itself a valid (sovereign)
posture.

## What lives where

| Data | Owner |
|---|---|
| Jurisdiction profiles and their bindings | the jurisdiction's peer register |
| Jurisdiction trust lists | the jurisdiction (via the [trust service](/services/trust/)) |
| Scheme namespaces, cross-register mappings, equivalence transforms | the global register |
| Units and ISO 80000 citations | the global register (units subregister) |

The GB 4943.1 ↔ IEC 62368-1 equivalence transform is the pilot's worked
example of global-scope data: it maps between two external registers, so it
belongs nowhere else.

## Operating a second peer

The registry starter kit demonstrates the shape; operationally, running a
second peer on the same host is running a second registry block:

1. A journal file of its own.
2. A bind of its own (the family convention keeps 8399 for JP; a third peer
   takes another port).
3. Its own tunnel token if published.
4. Its seed assets in the pilot's case; your jurisdiction's items in yours.

In a manifest-shaped deployment, a peer is a tenant directory whose manifest
declares exactly one service block (`registry`) — the sovereign profile with
`data_residency` pinned to the jurisdiction fits naturally.
