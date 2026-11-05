---
title: Frequently asked questions
description: Direct answers about what a product passport attaches to, why it exists, how depth, composition, splitting and ownership work, and what a verifier can trust.
spec_clauses: ["5", "6", "7", "8", "9", "10", "15"]
---

This page answers the questions that arise most often about digital product
passports. Each answer stands on the model that
[What a digital product passport is](/get-started/product-passport/) teaches,
and the reader who wants the mechanics behind an answer will find the
mechanism named in it.

## Is a digital product passport a parts passport?

No. A digital product passport (DPP) belongs to the product as the market
trades it, and the abbreviation does not stand for a digital parts passport.
Anything that can be sold can carry one, from a computer to a battery to a
one-tonne lot of iron ore, and the components inside a product carry
passports only where the product's coverage decision says so.

## Does every product need a passport?

No. A product carries a passport because a law demands it, because an
industry scheme requires it of its participants, or because its operator
publishes one voluntarily in pursuit of transparency, traceability,
repairability or recyclability. A product for which none of the three applies
carries no passport, and the framework imposes no duty of its own.

## Does a raw material carry a passport?

Yes, insofar as the raw material exists in trade as a product. Iron ore sold
in traceable lots is a product, and each lot can carry its own passport. The
passported quantity can then be split into smaller trade units, and every
split carries its quantities forward in balance (clause 8).

## Do all the parts of my product need their own passports?

No. Component coverage is one of the six depth dimensions, and it is a
decision of the product's maker within whatever its regulation or scheme
demands (clause 6). A laptop whose battery and mainboard carry passports and
whose screws carry none is a fully conforming statement of coverage, because
the passport records which parts carry passports as data.

## What happens to a passport when a product is split?

The passport splits with the product. The transformation algebra divides one
passported quantity into several, each carrying its quantities forward in
balance, so one tonne of passported iron ore becomes ten passported units of
one hundred kilograms with nothing created and nothing destroyed in the
record (clause 8). Taint travels the same path, so a recall that reaches the
tonne reaches the units derived from it.

## What happens when products are combined?

The same algebra runs in reverse. Products that each carry a passport combine
into an assembly whose passport references the passports of its members
(clause 6), and when a product is installed into a larger product, the
installation is a typed event with the method, slot and pairing recorded
(clause 7).

## Which lifecycle states does the framework know?

The event model records produced, placed on the market, installed, repaired,
retired, recycled and destroyed, among the states a product's regulation
demands, and it enforces the lawful transitions at write time (clause 7). The
model also records the crossings between regimes, such as recycled material
re-entering trade as end-of-waste product (clause 8).

## Who can read a passport?

Whoever the passport's operator grants. A passport can be read offline from
its carrier by anyone who physically holds it (clause 9), and online
resolution answers only the callers that present the identifier and satisfy
the deployment's policy, with enumeration resistance so that a passport's
existence is not discoverable by guessing (clause 10).

## Can a passport contain false statements?

The design assumes that question and answers it with machinery rather than
with trust. Every statement enters the record signed (clause 10), the event
log is append-only and its integrity is anchored, so a statement once
recorded cannot be quietly rewritten, and a verification verdict states what
the verifier could actually reach, so a claim that outruns its evidence
becomes visible as a degraded verdict rather than passing silently (clause
10).

## What does a customs officer actually check?

The officer checks the offline carrier. A passport travels with a Tier-A pack
whose verification completes without any network call, returning a graded
verdict that states whether the product conforms, what the check covered and
what it could not assess (clause 9).

## How deep does traceability go?

As deep as each passport in the chain commits to. One passport may reach from
an engine to the source of the metal in its screws, and a shallower passport
may stop at its immediate supplier; the chain states its own reach as data
(clause 6). A reader never has to guess the depth, because every verification
reports the coverage it achieved (clause 10).

## Where do the machine and measurement records come from?

From the production line itself. Machines participate as principals of their
own and commit their statements under their own keys (clause 5), and a
measured quantity enters the record with its method citation, its calibration
chain and its uncertainty (clause 15), because a measurement without those
three is a claim rather than a result.

## What is the difference between state and ownership?

State is the condition of the product, such as produced, installed, repaired
or recycled, and ownership is the commercial chain of who has held it in
trade, such as first sale, resale or export. Both ride the same typed event
log, which is why one record answers both questions coherently (clause 7).

## To start, what should I read next?

The five-minute tour introduces the model in motion
([the five-minute tour](/get-started/tour/)), and
[your first passport, pack, and verification](/get-started/first-passport/)
issues a real passport end to end against the
[reference stack](/get-started/reference-stack/).
