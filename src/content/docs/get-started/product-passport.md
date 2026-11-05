---
title: What a digital product passport is
description: The product passport attaches to whatever is traded as a product, not to every part; this page states why a passport exists and the six dimensions along which a passport can be deep.
spec_clauses: ["5", "6", "7", "8", "9", "10", "13", "15"]
---

This page teaches what a digital product passport (DPP) is, why a product
carries one, and the six dimensions along which a passport can be deep. The
page describes the model that [the UniDPP framework](/get-started/tour/)
implements, and each dimension names the mechanism that records it.

## The passport belongs to the product

A digital product passport (DPP) is the structured, machine-checkable record
that accompanies a product through its life in trade. The passport belongs to
the product as the market treats it, and not to the physical parts of which
the product happens to consist: the abbreviation does not stand for a digital
parts passport. Anything that can be sold can carry a passport. A computer, a
battery, a washing machine and a one-tonne lot of iron ore are all products in
this sense, and each of them can carry its own passport from the moment it
exists as a tradeable unit.

Not every part of a product needs a passport of its own. Whether the
components of a composite product carry separate passports is a decision about
depth, which the coverage dimension below states precisely, and the framework
imposes no default duty in either direction. The framework records the
boundary faithfully either way: a passport whose composition declares which of
its components carry their own passports states that coverage as data, and the
relationship edges of clause 6 carry it.

## Why a passport exists

A product carries a passport for one of three reasons, and the three classes
are exhaustive. The first class is legal obligation, in which a regulation
requires a passport for a product placed on its market. The second class is
industry initiative, in which a scheme or consortium requires passports of its
participants as a condition of trade. The third class is self-regulation, in
which an operator publishes a passport voluntarily, in pursuit of
transparency, traceability, repairability or recyclability.

The motivation does not change the mechanics. The framework serves mandatory
and voluntary passports with one model, because the checks a border guard, a
repairer or a recycler performs against a passport do not depend on why the
passport exists.

## The six dimensions of depth

A passport can be shallow or deep, and the depth decomposes into six
independent dimensions, which together are exhaustive: component coverage,
product composition, lifecycle state, ownership, upstream traceability and
production traceability. A use case states how deeply it looks along each
dimension by selecting a lens (clause 13), and the verification verdict states
what the record actually covered (clause 10), so a reader never confuses what
a passport declares with what a verifier could reach.

### 1. Component coverage

Component coverage answers the question of how many of a composite product's
parts, and which of their types, carry passports of their own. A laptop whose
battery carries its own passport, whose mainboard carries its own passport and
whose screws carry none states that coverage in its composition, and the
statement is part of the record rather than an assumption about it. Coverage
is a decision of the product's maker within whatever its regulation or scheme
demands, and the framework's duty is to record the decision and its
consequences exactly (clause 6).

### 2. Product composition

Product composition is the algebra of combining passported products into one
and of splitting one passported quantity into several. One tonne of
passported iron ore splits into ten trade units of one hundred kilograms, and
three kilograms of one unit's material can leave it as the input of a screw
run, with the quantities balancing across every split (clause 8). The algebra
also carries taint: a recall that taints the tonne reaches the units derived
from it and the screws made from those units, in proportion to what each
derived product actually took. Composition is what lets a passport survive the
physical world's arithmetic instead of describing only whole, indivisible
objects.

### 3. Lifecycle state

Lifecycle state answers the question of what has happened to the product:
produced, placed on the market, installed into a larger product, repaired,
retired, recycled or destroyed. The state rides a typed event log (clause 7),
the lawful transitions between states are enforced at write time, and an
illegal transition is rejected rather than recorded. The state machine also
knows the crossings that ordinary status lists miss, such as a product
re-entering trade after recycling as end-of-waste material (clause 8).

### 4. Ownership

Ownership answers the question of who has held the product in trade: the
first sale, the resale, the second-hand market and the export. The ownership
chain rides the same typed event log as the physical state (clause 7), which
is why a buyer at any point of the chain can read the possession history and
the state history from one record.

### 5. Upstream traceability

Upstream traceability answers the question of how far back the record
reaches: from the engine to the parts inside it, to the manufacturer of the
screw inside a part, to the source of the metal of that screw. The depth is a
recorded commitment of each passport in the chain, and not a property the
framework invents; a reader who asks how far the chain reaches receives a
coverage statement that names what is actually linked (clause 6), and a
verification states what was reachable rather than what was assumed (clause
10).

### 6. Production traceability

Production traceability answers the question of how the product was made:
which machines, which lines and which facilities. The machines participate as
principals of their own (clause 5), so a machine's commitments enter the
record as signed statements rather than as prose. Where a quantity is
measured rather than declared, the measurement enters with its method, its
calibration chain and its uncertainty (clause 15), because a measurement
without those three is a claim rather than a result.

## How one model records all six dimensions

The framework realizes the six dimensions with mechanisms that share one
identity discipline. The passport's subject carries an identity that is never
re-minted, so every statement above attaches to the same product through its
whole life (clause 6). The typed event log carries state and ownership
(clause 7), the transformation algebra carries composition and mass balance
(clause 8), the relationship edges carry coverage and upstream links (clause
6), the device and measurement machinery carries production traceability
(clause 5, clause 15), the trust layer signs every statement and states what
each verification could reach (clause 10), and the lens mechanism lets a
border, a repairer or a recycler ask only for the depth its use case needs
(clause 13). The offline carrier of clause 9 closes the set, because the
checks a border performs must also work where no network exists (clause 9).

To see the model in motion, read [the five-minute tour](/get-started/tour/)
and then issue a passport of your own in
[your first passport, pack, and verification](/get-started/first-passport/).
