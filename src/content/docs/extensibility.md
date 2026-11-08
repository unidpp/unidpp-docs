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
lens. UniDPP does not yet ship a guided class designer, a per-class
instance intake of its own, or a mapping workbench for bespoke
classes; the registry intake and the signed profile form are the
authoring surface, and the fact path is the surface every other
extension rides.
