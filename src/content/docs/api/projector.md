---
title: "projector — API reference"
description: "Every operation of the projector service, rendered from its committed OpenAPI contract."
---

# projector — API reference

The contract is declared once, on the handlers of `unidpp-projector`, and committed as its [`openapi.yaml`](https://github.com/unidpp/unidpp-projector/blob/main/openapi.yaml); this page renders that document.
A running service serves the same contract at `/openapi.json` and `/openapi.yaml`, and browses it live at `/docs` (Swagger UI). The deployment consumes 7 environment variables (`x-unidpp-env-keys`).

## projection

The twin-fold view and the consumer render

### GET `/`

Serve the discovery document.

**Responses**

- `200` — The discovery document: the view and render query forms, the as-of semantics, the coverage honesty and the render metadata shape

### GET `/healthz`

Liveness probe.

**Responses**

- `200` — The service is serving

### GET `/render`

GET /render — the consumer presentation (TODO.impl 54): the
passport's data points arranged per the lens's presentation
binding, localized, formatted, with links to the authoritative
sources and the same coverage honesty as the view.

One presentation computation, three wire formats (TODO.impl 224):
JSON by default; `Accept: text/html` or `text/plain` (or an
explicit `format` parameter, which outranks the header) serves the
same render document as a standalone HTML page or as speakable
text (the TTS substrate) — the consumer surfaces a scanned code
resolves to.
The consumer presentation: the passport's data points arranged per
the lens's presentation binding, localized and formatted, with
links to the authoritative sources. One presentation computation,
three wire formats — JSON by default; `Accept: text/html` or
`text/plain` (or an explicit `format` parameter, which outranks
the header) serves the same render document as a standalone HTML
page or as speakable text.

**Parameters**

| Name | In | Description |
|---|---|---|
| `passport` | query | The passport identifier |
| `profile` | query | The profile whose presentation binding is applied |
| `lang` | query | The requested language tag (a fallback is served when the requested language has no label) |
| `at` | query | An RFC 3339 instant |
| `format` | query | `html`, `text` or `json`; outranks the `Accept` header |

**Responses**

- `200` — The render, as-of stamped
- `400` — A missing required query parameter, or an unknown `format`
- `404` — No such passport

### GET `/view`

GET /view — the projection.
The twin-fold view of a passport under a lens, as of an instant:
the profile's lens manifest resolved (registry first, fixtures
otherwise), the data points presented with the same coverage
honesty the render carries, and the roll-up where a sealer is
configured.

**Parameters**

| Name | In | Description |
|---|---|---|
| `passport` | query | The passport identifier |
| `profile` | query | The profile whose lens is applied |
| `actor` | query | The requesting role (the lens may gate data points on it) |
| `at` | query | An RFC 3339 instant; the twin is folded as of that instant |

**Responses**

- `200` — The view, as-of stamped, with the coverage and provenance metadata
- `400` — A missing required query parameter
- `404` — No such passport
