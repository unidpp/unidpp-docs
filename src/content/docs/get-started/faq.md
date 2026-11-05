---
title: Frequently asked questions
description: Direct answers for product makers, verifiers and integrators about what a passport attaches to, why it exists, what a verifier can trust, and how it fits with schemes that already exist.
spec_clauses: ["5", "6", "7", "8", "9", "10", "12", "13", "14", "15"]
---

This page answers the questions that arise most often about digital product
passports, grouped for the four audiences that ask them: the product maker,
the verifier (the border officer, the repairer, the recycler, the consumer),
the reader who asks the trust and law questions, and the integrator whose
products already carry codes and credentials. Each answer names the mechanism
behind it, and the reader who wants the model in full will find it in
[What a digital product passport is](/get-started/product-passport/).

## For the product maker

### Does every product need a passport?

No. A product carries a passport because a law demands it, because an
industry scheme requires it of its participants, or because its operator
publishes one voluntarily in pursuit of transparency, traceability,
repairability or recyclability. A product for which none of the three applies
carries no passport, and the framework imposes no duty of its own.

### Is a digital product passport a parts passport?

No. A digital product passport (DPP) belongs to the product as the market
trades it, and the abbreviation does not stand for a digital parts passport.
Anything that can be sold can carry one, from a computer to a battery to a
one-tonne lot of iron ore, and the components inside a product carry
passports only where the product's coverage decision says so.

### Does a raw material carry a passport?

Yes, insofar as the raw material exists in trade as a product. Iron ore sold
in traceable lots is a product, and each lot can carry its own passport. The
passported quantity can then be split into smaller trade units, and every
split carries its quantities forward in balance (clause 8).

### Do all the parts of my product need their own passports?

No. Component coverage is one of the six depth dimensions, and it is a
decision of the product's maker within whatever its regulation or scheme
demands (clause 6). A laptop whose battery and mainboard carry passports and
whose screws carry none is a fully conforming statement of coverage, because
the passport records which parts carry passports as data.

### Will a passport expose my trade secrets and my supplier list?

No more than you choose to disclose, and the disclosure decisions are part of
the record rather than an afterthought. The passport attaches at the
granularity you trade at, so the record describes your product without
describing your recipe (clause 6); an evidence release can be gated so that a
caller without the right receives a stated refusal rather than the document
(clause 10); and an access decision is journaled, so a disclosure leaves its
own receipt (clause 12). A passport that must stay silent states its
boundaries as data instead of hoping nobody asks.

### Can our industry define its own kind of passport?

Yes, and the class system is built for it: a kind of passport is a profile, a
registered and signed statement of which data elements, units, vocabularies
and views the class carries (clause 5). The honest boundary is who does the
work today: authoring a new class is expert work against a formal schema,
because the guided class designer has not been built yet, and features that
fit the platform's value kinds ride as data while a genuinely new kind of
value is a coordinated change to the core. The class system is open by
design; the tooling around it is on the roadmap.

### What does adopting this cost?

The software carries no licence fee: the framework is open source, and one
deployment is one binary plus one configuration file, with the data model,
the contracts and the test vectors published. The real cost of a passport has
never been the software; it is assembling the data the passport must state,
and the quickstarts exist so that the machinery itself is a same-day exercise
([Run the reference stack](/get-started/reference-stack/)).

## For the verifier

### What does a customs officer actually check?

The officer checks the offline carrier. A passport travels with a Tier-A pack
whose verification completes without any network call, returning a graded
verdict that states whether the product conforms, what the check covered and
what it could not assess (clause 9).

### How do I know the data is not stale?

Staleness is a stated property, never a surprise. The freshness demand is
declared per data element, and an element past its window degrades the
verdict visibly rather than passing silently (clause 5); a verification then
reports exactly what it could reach at the moment it looked (clause 10).

### How does a recall reach products made from a tainted input?

The taint travels with the material. When a passported quantity is split, the
derived products inherit the taint in proportion to what each took (clause
8), and a revocation applies retroactively through the transparency
machinery, so a passport that was true when issued can become non-conforming
without anyone editing it (clause 10).

### What remains when the issuer has gone out of business?

The record does not depend on the issuer staying alive. Tier C is the
notarized archive of a passport state, and it re-serves the snapshot
byte-identically decades later, with the archival packages kept and drilled
as an operational routine (clause 9, clause 12).

### Can a consumer read the passport?

Yes, through the consumer presentation. A passport can render as a readable
consumer page, including a text form suitable for screen readers, and the
data points a consumer scan returns follow a stated policy rather than
dumping the operator's whole record (clause 6).

### How deep does traceability go?

As deep as each passport in the chain commits to. One passport may reach from
an engine to the source of the metal in its screws, and a shallower passport
may stop at its immediate supplier; the chain states its own reach as data
(clause 6). A reader never has to guess the depth, because every verification
reports the coverage it achieved (clause 10).

## Trust, law and privacy

### Can a passport contain false statements?

The design assumes that question and answers it with machinery rather than
with trust. Every statement enters the record signed (clause 10), the event
log is append-only and its integrity is anchored, so a statement once
recorded cannot be quietly rewritten, and a verification verdict states what
the verifier could actually reach, so a claim that outruns its evidence
becomes visible as a degraded verdict rather than passing silently (clause
10).

### Do passports contain personal data?

The framework treats personal data as a class of data to be handled, not as
an afterthought. The operations model includes the personal-data machinery:
an owner's data can be removed by cryptographic shredding, and a subject can
export what the record holds about them (clause 12). A passport states what
it carries; the machinery exists so that what it carries can be honoured.

### Who can read a passport?

Whoever the passport's operator grants. A passport can be read offline from
its carrier by anyone who physically holds it (clause 9), resolution online
answers only callers that present the identifier and satisfy the deployment's
policy, and an existence that is not published is not discoverable by
guessing (clause 6).

### What happens when two schemes disagree about a passport?

A scheme states its willingness, and a scheme that declines interoperability
is never brokered around (clause 12). Where interop happens, the receiving
profile decides what it accepts, which is why a verdict names the acceptance
policy that judged it rather than asserting a universal answer (clause 5).

## Integration with what already exists

### My product already has GS1 codes and a UNTP credential. Do I start over?

No. The framework correlates rather than consolidates: one physical thing may
carry several codes, the record states that the codes belong to the same
subject, and nothing forces a re-identification (clause 6). An existing
verifiable credential can enter the system through the import direction, which
mints a core passport from it deterministically (clause 14).

### Why not simply adopt one existing scheme wholesale?

Because the schemes answer different regulators, and a passport that must
cross borders answers all of them. In this framework a foreign format is a
render profile over one neutral core, so the same record can present as the
shape a scheme expects without becoming a copy of it (clause 13). Adopting
one scheme wholesale is the path where every new border means a second
record.

### Which lifecycle states does the framework know?

The event model records produced, placed on the market, installed, repaired,
retired, recycled and destroyed, among the states a product's regulation
demands, and it enforces the lawful transitions at write time (clause 7). The
model also records the crossings between regimes, such as recycled material
re-entering trade as end-of-waste product (clause 8).

### What happens to a passport when a product is split?

The passport splits with the product. The transformation algebra divides one
passported quantity into several, each carrying its quantities forward in
balance, so one tonne of passported iron ore becomes ten passported units of
one hundred kilograms with nothing created and nothing destroyed in the
record (clause 8). Taint travels the same path, so a recall that reaches the
tonne reaches the units derived from it.

### What happens when products are combined?

The same algebra runs in reverse. Products that each carry a passport combine
into an assembly whose passport references the passports of its members
(clause 6), and when a product is installed into a larger product, the
installation is a typed event with the method, slot and pairing recorded
(clause 7).

### How do I decide how deep my passport must go?

Your regulation, your industry scheme or your own disclosure decision states
the depth, and the framework records that statement as data. The six
dimensions exist so that a depth requirement has an unambiguous place to
land, and a reader consults a passport through a lens that asks only for the
depth that the reading requires (clause 13).

### What is the difference between state and ownership?

State is the condition of the product, such as produced, installed, repaired
or recycled, and ownership is the commercial chain of who has held it in
trade, such as first sale, resale or export. Both ride the same typed event
log, which is why one record answers both questions coherently (clause 7).

### Where do the machine and measurement records come from?

From the production line itself. Machines participate as principals of their
own and commit their statements under their own keys (clause 5), and a
measured quantity enters the record with its method citation, its calibration
chain and its uncertainty (clause 15), because a measurement without those
three is a claim rather than a result.

## Reading on

The five-minute tour introduces the model in motion
([the five-minute tour](/get-started/tour/)), and
[your first passport, pack, and verification](/get-started/first-passport/)
issues a real passport end to end against the
[reference stack](/get-started/reference-stack/). The six dimensions of
depth, with the iron-ore example worked through, live in
[What a digital product passport is](/get-started/product-passport/).
