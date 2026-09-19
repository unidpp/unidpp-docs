## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Summary governance (spec_clauses)

A page that summarizes specification clauses declares them in its
frontmatter — `spec_clauses: ["6.3", "11"]` — and cites each declared
clause in its body. The rule the convention enforces: a summary
changes only in the change that moves the clause it summarizes, with
the clause cited beside it. `npm run check:citations`
(tools/check-spec-citations.mjs) fails a page that declares a clause
it never cites; adding a summary of a clause means adding its number
to the page's frontmatter in the same change.
