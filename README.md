# unidpp-docs

The documentation site for the UniDPP platform — docs.unidpp.org. Astro +
Starlight; content lives in `src/content/docs/`.

## Layout

```text
src/content/docs/
├── index.md                    the landing page
├── get-started/                tour · reference stack · first passport
├── operators/                  manifest reference · profiles · console ·
│                               multi-tenant · backup/restore · security
├── services/                   one reference page per service
├── architecture.md             pointers to unidpp.org framework pages
├── federation/                 JP peer · cross-register mappings · UNTP/EN 18222
└── quickstart-whitelabel.md    the 15-minute whitelabel deployment
tools/check-manifest-coverage.sh  schema-vs-docs completeness check
```

## Commands

| Command | Action |
| :--- | :--- |
| `npm install` | install dependencies |
| `npm run dev` | local dev server at `localhost:4321` |
| `npm run build` | production build to `./dist/` |
| `npm run preview` | preview the build locally |
| `tools/check-manifest-coverage.sh [lib.rs] [manifest.md]` | verify the manifest reference covers every schema field |

## The coverage check

The [operator manifest reference](src/content/docs/operators/manifest.md)
must document every field of the schema in `unidpp-config`
(`api_version: unidpp.org/v1`). The check extracts the serde field names
from the schema source and greps the reference page for each:

```sh
tools/check-manifest-coverage.sh ../unidpp-config/src/lib.rs \
    src/content/docs/operators/manifest.md
```

Expected output ends `coverage: 46/46 fields documented`. A schema change
without a docs change fails the check.

## Deployment

docs.unidpp.org is a Cloudflare Pages project (`unidpp-docs`) with
NO git integration — deploys are manual, through wrangler:

```sh
npm run build
npx wrangler pages deploy dist --project-name unidpp-docs --branch main
```

CI compiles and checks coverage on every push; the deploy step is
the operator's publish act (wrangler authenticates with the
`unidpp` account's OAuth).

## Conventions

- Every command shown in the pages was executed against the running pilot
  deployment; transcripts are reproduced as recorded.
- The framework content (invariants, layers, seams, tiers) lives on
  www.unidpp.org — these pages link to it, never duplicate it.
- Professional, task-oriented, terse. No marketing voice.
