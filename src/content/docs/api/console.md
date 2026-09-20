---
title: "console — API reference"
description: "Every operation of the console service, rendered from its committed OpenAPI contract."
---

# console — API reference

The contract is declared once, on the handlers of `unidpp-console`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-console/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 3 environment variables (`x-unidpp-env-keys`).

## console

The session-gated operator surface

### GET `/`

The dashboard: the deployment's service cards and their readiness.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### GET `/.well-known/unidpp-service`

The service identity (the orchestrator's probe reads it).

**Responses**

- `200` — The identity document: service, version, build id

### GET `/archival`

The archival journey: snapshots and their verification.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### POST `/archival`

Intake a snapshot.

**Request body**: The archival intake form: the snapshot reference

**Responses**

- `200` — The form is re-rendered with its error stated
- `303` — Intake accepted: a redirect back to the journey

### GET `/backups`

The backups view: the bundle, its consistency point and the restore drills.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### POST `/backups`

Run a backup operation.

**Request body**: The backup form: the operation to run

**Responses**

- `200` — The form is re-rendered with its error stated
- `303` — Run: a redirect back to the view with the result stated

### POST `/backups/drill`

POST /backups/drill — run the restore rehearsal through the
durability program (session-gated; the program owns the logic).

**Request body**: The drill form: the bundle to restore

**Responses**

- `200` — The form is re-rendered with its error stated
- `303` — Drilled: a redirect back to the view with the drill report stated

### GET `/branding`

The branding preview: the manifest's identity rendered as the console chrome.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### POST `/branding`

POST /branding — apply the form to the manifest's branding block
through the validated save path; nothing else in the manifest is
touched (the model is loaded, mutated, re-serialized).

**Request body**: The branding form: product name and locale

**Responses**

- `200` — The form is re-rendered with its error stated
- `303` — Saved: a redirect back to the preview

### GET `/carrier`

The carrier journey: carrier generation and translation.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### GET `/config`

The manifest editor: the deployment as data, secrets still ${VAR} references.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### POST `/config`

Save the edited manifest.

**Request body**: The edited manifest text

**Responses**

- `200` — The form is re-rendered with its error stated
- `303` — Saved: a redirect back to the editor

### GET `/config/env`

The rendered environment of the deployment, resolved secrets sealed.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### GET `/coverage`

The coverage view: the profile's coverage report.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### GET `/declarations`

The declarations journey: the signed declarations and their state.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### GET `/egress`

The egress inventory: what leaves the deployment, sealed and real rows alike.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### GET `/feedback`

The consumer-reports view over the gateway's report channel.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### GET `/healthz`

Liveness probe.

**Responses**

- `200` — The service is serving

### GET `/login`

The login page.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### POST `/login`

Submit the login form.

**Request body**: The login form: the admin token

**Responses**

- `200` — The form is re-rendered with its error stated
- `303` — Authenticated: a redirect to the dashboard with the session issued

### POST `/logout`

End the session.

**Responses**

- `303` — A redirect to the login page, the session ended

### GET `/passports`

The verification form and its most recent verdicts.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### POST `/passports`

POST /passports with a pack: verify through the pipeline.

**Request body**: The verification form: the pack reference and its anchors

**Responses**

- `200` — The form is re-rendered with its error stated
- `303` — Verified: a redirect back to the form with the verdict stated

### GET `/profiles`

The profiles journey: profile intake and the registry's manifest schema.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### POST `/profiles`

Intake a profile.

**Request body**: The profile intake form: the manifest and its signature

**Responses**

- `200` — The form is re-rendered with its error stated
- `303` — Intake accepted: a redirect back to the journey

### GET `/registry`

The register browser over the registry service's items.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### GET `/tenants`

The tenants view: the whitelabel tenants of the deployment.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`

### POST `/tenants`

Create a tenant.

**Request body**: The tenant form: the tenant's manifest

**Responses**

- `200` — The form is re-rendered with its error stated
- `303` — Created: a redirect back to the tenants view

### GET `/trust`

The trust view: operators, trust markers and validity windows.

**Responses**

- `200` — The page, rendered against the deployment manifest
- `303` — The session gate redirects an unauthenticated browser to `/login`
