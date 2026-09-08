#!/usr/bin/env bash
# check-api-coverage.sh — every routed endpoint of every service must
# appear in its generated API reference page. The router is the truth;
# a routed-but-undocumented endpoint fails the check (regenerate with
# tools/gen-api-reference.sh).
#
# Usage: tools/check-api-coverage.sh   (from the repo root)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FAMILY="${UNIDPP_FAMILY_DIR:-$SCRIPT_DIR/../../}"
DOCS_API="$SCRIPT_DIR/../src/content/docs/api"

SERVICES="registry:api.rs trust:api.rs log:api.rs issuer:api.rs projector:api.rs gateway:api.rs archive:api.rs resolver:api.rs console:lib.rs"

failed=0
for spec in $SERVICES; do
  service="${spec%%:*}"
  router_file="${spec#*:}"
  src="$FAMILY/unidpp-$service/src/$router_file"
  page="$DOCS_API/$service.md"
  [ -f "$src" ] && [ -f "$page" ] || { echo "check-api: SKIP $service (source or page absent)"; continue; }
  missing=$(python3 - "$src" "$page" <<'PYIN'
import re, sys
src, page = sys.argv[1:3]
routes = set()
for m in re.finditer(
        r'\.route\(\s*"([^"]+)"\s*,\s*([a-z]+\([^)]*\)(?:\.[a-z]+\([^)]*\))*)\s*,?\s*\)',
        open(src).read()):
    for method in re.findall(r'\b(get|post|put|delete|patch)\(', m.group(2)):
        routes.add((method.upper(), m.group(1)))
doc = open(page).read()
missing = [f"{m} {p}" for m, p in sorted(routes) if f"| {m} | `{p}` |" not in doc]
print("\n".join(missing))
PYIN
)
  if [ -n "$missing" ]; then
    echo "check-api: FAIL $service — routed but not documented:"
    echo "$missing"
    failed=1
  else
    count=$(grep -c '^| ' "$page")
    echo "check-api: ok $service ($count endpoint rows)"
  fi
done
exit $failed
