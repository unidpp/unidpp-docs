---
title: Adoption paths
description: Adoption is any subset of components in any combination, not a sequence — the six paths, what each adopter holds, and the no-orphan rule that binds them.
---

UniDPP is adopted as a subset, not as a sequence. A customs authority
verifies passports without issuing one. A manufacturer publishes
without a registry. An operator with an existing passport system adds
the neutral core behind a translation edge and changes nothing its
consumers see. Each of these is a complete adoption, not a partial
one waiting to be finished.

The framework guarantees this in two directions:

- **Partial adoption is first-class.** Every component deploys
  standalone, consumes declared capability interfaces rather than its
  siblings, and interoperates with foreign implementations of those
  interfaces. The tests of each component pass without the others
  deployed.
- **No orphan capabilities.** Whatever a full host can do, a partial
  adopter can do at the same class level: adopted parts federate with
  the non-adopted remainder through frozen views, the inter-scheme
  protocol and mapping items. This rule — FW-7 — is pinned by an
  adversarial audit (`unidpp-cli` `tests/no_orphan_audit.rs`) that
  reconstructs each capability at the smallest adopter's scope and
  asserts the identical digests and verdicts.

## The six paths

| Path | What the adopter holds | Quickstart |
|---|---|---|
| [Verify-only](/adoption/verify-only/) | One binary, the officer's terminal | `scripts/quickstart-verify-only.sh` |
| [Publish-only](/adoption/publish-only/) | One issuer deployment | `scripts/quickstart-publish-only.sh` |
| [Augment-existing](/adoption/augment-existing/) | An existing system plus the gateway | `scripts/quickstart-gateway.sh` |
| [Registry participant](/adoption/registry-participant/) | The registry service | — |
| [Federation gateway](/adoption/federation-gateway/) | The gateway, sustained | `scripts/quickstart-gateway.sh` |
| [Full host](/adoption/full-host/) | The reference stack and console | [Run the reference stack](/get-started/reference-stack/) |

The first three quickstarts run in continuous integration
(`unidpp-e2e`, tests 6 to 8): what the pages describe is what the
harness exercises.

## Choosing a path

Choose by the question you are answering. If the question is *what
am I looking at* — at a border, at a service counter, in a
warehouse — the answer is verify-only. If it is *how do I publish*,
it is publish-only. If it is *my consumers already speak EN 18222 or
UNTP*, it is augment-existing. If it is *my jurisdiction needs a
register of profiles, data elements and mappings*, it is registry
participant. If it is *two systems must talk and neither will
change*, it is the federation gateway. If it is all of these, the
full host runs the reference stack.

Moving between paths is additive: components join a deployment, they
do not rewrite it. The registry joins a publish-only host without
touching its journals; the gateway leaves one without a trace.
