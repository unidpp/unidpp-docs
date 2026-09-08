#!/usr/bin/env bash
# gen-api-reference.sh — generate the per-service API reference pages
# from the services' routers (the source of truth: every `.route()`
# call in each sibling repo's src/api.rs; the console's routes live in
# src/lib.rs). Descriptions come from the module-doc endpoint tables
# where a service documents them (`//! | `GET /path` | desc |`).
#
# Pages land in src/content/docs/api/<service>.md; pair this with
# check-api-coverage.sh, which fails when a routed endpoint is
# missing from its page.
#
# Usage: tools/gen-api-reference.sh   (run from the repo root; assumes
# the family checkout ../unidpp-<service>)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCS_API="$SCRIPT_DIR/../src/content/docs/api"
FAMILY="${UNIDPP_FAMILY_DIR:-$SCRIPT_DIR/../../}"

mkdir -p "$DOCS_API"

# <service> <router-file> <title-blurb>
SERVICES="registry:api.rs trust:api.rs log:api.rs issuer:api.rs projector:api.rs gateway:api.rs archive:api.rs resolver:api.rs console:lib.rs"

for spec in $SERVICES; do
  service="${spec%%:*}"
  router_file="${spec#*:}"
  src="$FAMILY/unidpp-$service/src/$router_file"
  if [ ! -f "$src" ]; then
    echo "gen-api: SKIP $service (no router at $src)"
    continue
  fi
  python3 - "$src" "$service" "$DOCS_API/$service.md" "$router_file" <<'PYIN'
import re, sys
src, service, out, router_file = sys.argv[1:5]
text = open(src).read()

# The router: every .route("PATH", get(h).post(h)...) call.
routes = []
for m in re.finditer(r'\.route\(\s*"([^"]+)"\s*,\s*([a-z]+(?:\.[a-z]+)*)\(', text):
    path, chain = m.group(1), m.group(2)
    for method in chain.split("."):
        routes.append((method.upper(), path))

# Module-doc endpoint tables: `//! | `GET /path` | description |`.
descriptions = {}
for m in re.finditer(r'^//!\s*\|\s*`?([A-Z]+)\s+(/[^`|]*)`?\s*\|\s*(.*?)\s*\|', text, re.M):
    method, path, desc = m.group(1), m.group(2).strip(), m.group(3).strip(" `")
    descriptions[(method, path)] = desc

seen, rows = set(), []
for method, path in sorted(routes, key=lambda r: (r[1], r[0])):
    if (method, path) in seen:
        continue
    seen.add((method, path))
    desc = descriptions.get((method, path), "")
    rows.append(f"| {method} | `{path}` | {desc} |")

undocumented = [k for k in descriptions if k not in seen and not k[1].startswith("/admin")]
frontmatter = """---
title: "{s} — API reference"
description: "Every routed endpoint of the {S} service, generated from its router."
---

# {s} — API reference

Generated from [`unidpp-{s}/src/{rf}`](https://github.com/unidpp/unidpp-{s}/blob/main/src/{rf}) — the router is the
source of truth; regenerate with `tools/gen-api-reference.sh`.

| Method | Path | Description |
|---|---|---|
""".format(s=service, rf=router_file, S=service.upper())
body = "\n".join(rows) + "\n"
note = ""
if undocumented:
    note = ("\n> The module docs describe these without a matching route —\n"
            "> check the source: " + ", ".join(f"`{m} {p}`" for m, p in sorted(undocumented)) + "\n")
open(out, "w").write(frontmatter + body + note)
print(f"gen-api: {service}: {len(rows)} endpoints -> {out}")
PYIN
done
