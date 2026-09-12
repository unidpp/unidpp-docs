---
title: Verify-only adoption
description: One binary, no services — the officer's terminal unpacks, checks and grades a pack against a pinned anchor, and never phones home.
---

The verify-only adopter answers one question at one place: *what am
I looking at, and does it hold?* The adoption is a single binary —
`unidpp`, the officer's terminal — and an anchor to pin. No services
run. No network is required. The terminal unpacks a Tier-A carrier,
checks its structure and signatures, and prints a graded verdict:
pass, degraded (with the reason), or fail.

This path implements Part 5 (trust and verification) at its client
edge, and the offline half of Part 10 (client retrieval): the
carrier is the retrieval, resolved by hand or scanner.

## What the adopter holds

- The `unidpp` binary, built from `unidpp-cli`.
- The anchor: the issuer public key, pinned from a jurisdiction
  trust list, the issuer's keyring, or paper accompanying the
  shipment. Without an anchor, signature slots cannot be verified and
  the verdict degrades — stated, never silently passed.
- The pack: a file from a carrier (QR photograph, scanned text, or a
  transferred file).

## The quickstart

The exercised form is `unidpp-e2e/scripts/quickstart-verify-only.sh`
(CI test 6). Its steps, as an operator runs them:

```sh
# The verdict — the whole adoption in one line.
$ unidpp verify pack.hex --anchor 044b43bd0db84998… --max-age 0
verdict: pass
```

`--max-age 0` selects static or archival semantics: the pack is
checked as a document, never as news. With a freshness window
instead, the as-of stamp inside the pack is held against it.

The terminal also reads carriers: `--image photo.png` decodes a QR
from a still photograph, and `resolve` normalizes a scanned GS1
digital link, GB/T 33993 code, EAN-13 or URN to the identity it
carries.

## What the terminal catches on its own

The quickstart's second half is the adversarial check. One byte of
the pack flipped — the damage a relabeller does — and the verdict is
`fail` with exit code 2, no services consulted. The signature slot
does that work: the pack's canonical body is signed by the issuer's
pack key, and the pinned anchor is that key.

## No orphan capabilities at this scope

A verify-only adopter still holds the federation capabilities, as
data rather than as services: a frozen view received as a document
verifies and re-executes air-gapped; a recorded verification route
replays its coverage report byte-identically; mapping items held as
a registry export apply under the same tier discipline the registry
enforces at intake. The no-orphan audit pins exactly this
(`unidpp-cli` `tests/no_orphan_audit.rs`).
