---
spec_clauses: ["5", "13"]
title: Extending the model
description: The fact path as the feature extensibility surface, the closed value-kind set, and the frozen-view doctrine for class evolution.
---

A person who brings a new kind of product to UniDPP asks two
questions. The first question is how a new feature of that product
becomes part of the system without a change to the core. The second
question is what happens to the passports that already exist when
their class evolves. The specification answers both questions in
closed form, and this page states those answers in the terms an
implementer uses.

## The fact path is the extensibility surface

The digital twin carries its facts in an open map (clause 5). The
keys are dotted fact paths, and every value is one of four canonical
kinds: a string, a decimal number, a boolean, or a list of strings.
The set of value kinds is closed. A profile declares the fact paths
it consumes, and an instance may carry facts beyond every profile's
declaration; the system takes such facts as data.

The consequence is the rule that governs product features: a new
feature of a product class is a fact path and, where the feature
shall surface in views, a profile declaration. No core change is
required for a feature that fits the four kinds, and none is
permitted for one.

## The closed value-kind set, and when the core moves

The canonical encoding of the fact map follows Annex B, and the
golden vectors of the conformance corpus pin its bytes (clause 5
binds the encoding; the corpus discipline binds the languages). An
implementation shall not admit a fifth value kind through an encoding
side door, and a value outside the four kinds fails to serialize
rather than degrading silently.

Admitting a fifth value kind is a coordinated core change. The core
model, the canonical encoding of Annex B, the golden-vector corpus,
and the language implementations move in one change, proposed and
reviewed as such. Until that change lands, an implementation carries
a value shape it needs as a string fact with a declared vocabulary.
The vectors keep every such change verifiable: the Rust, TypeScript,
Python, and Ruby implementations reproduce the corpus byte-identically,
and the family drift harness fails the estate on any divergence.

## Class evolution never retcons a committed view

A committed frozen view is immutable in its class reference as in
everything else (clause 13). An evolution of the referenced class, a
new profile version, a changed lens manifest, a superseded transform,
or a remapped unit shall not alter, silently invalidate, or re-render
a frozen view already published under the earlier class state.

Re-execution of a frozen view resolves the transform chain by the
versions the view names, not by the registry's current state. Where a
named version has been superseded, verification continues against the
named versions. Where a named version has been withdrawn, the failure
is stated as a resolution failure, never as a silent substitution of
the successor. A class change never retcons an existing instance's
committed views.

## What an author does today

The authoring surface today is registered, signed data. A class
author defines a profile as a manifest against the formal schema,
signs it, and submits it through registry intake; instances carry
their features as fact paths, and views render through the registered
lens. The registry now also carries the class descriptor (clause 5):
an author-defined passport class declares its machine-checkable
shape as a registered, signed item of the class `class-descriptor`,
naming its features as dotted fact paths over the four canonical
value kinds, the vocabularies and unit references those features
carry, the capability classes that may carry the class, and the rule
references the class relies on. The register surfaces the registered
descriptors beside its service descriptors, so a verifier meeting an
unknown class resolves the descriptor of that class.

An instance of an author-defined class registers as an item of the
class `instance` (clause 5) whose manifest states the descriptor it
instantiates and carries the twin-fact map. Registry intake resolves
the descriptor point-in-time and refuses a required fact that is
missing, a value of the wrong kind, a member outside a declared
vocabulary, a unit reference that no registered unit names, and an
instance of an unknown class; every refusal names the failing fact
path. Facts the descriptor does not declare are the open map, and
intake takes them as data.

The rule references a descriptor carries take their deterministic
reading through the rule-expression language (clause 5). A rule is a
boolean expression over the instance's facts: comparisons against
thresholds and literals, membership tests, and the and/or/not
connectives, evaluated with fixed semantics so the same expression
over the same facts reads the same in every implementation. The
descriptor intake validates every expression (it parses, it names
only declared fact paths, it compares literals only against the
declared kinds, and every reference resolves to a declared rule);
the instance intake evaluates every referenced rule and names the
failing rule and its expression when one reads false.

UniDPP does not yet ship a mapping workbench for bespoke classes
(the console's class designer now covers authoring, worked-instance
validation, signing and submission); the registry intake, the signed
descriptor and profile forms, the rule-expression language, and the
fact path are the authoring surface the workbench will ride.
