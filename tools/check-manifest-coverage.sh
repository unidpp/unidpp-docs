#!/usr/bin/env bash
# check-manifest-coverage.sh — the manifest-reference completeness check.
#
# Extracts every serde struct field name from unidpp-config's schema
# (src/lib.rs) and verifies each is documented with an anchor in the
# manifest reference page. Exits non-zero on any gap.
#
# Usage:
#   tools/check-manifest-coverage.sh [path/to/unidpp-config/src/lib.rs] \
#                                    [path/to/operators/manifest.md]
#
# Defaults assume the family checkout: ../unidpp-config and this repo's
# page.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LIB_RS="${1:-$SCRIPT_DIR/../unidpp-config/src/lib.rs}"
MANIFEST_MD="${2:-$SCRIPT_DIR/../src/content/docs/operators/manifest.md}"

[ -f "$LIB_RS" ] || { echo "cannot read schema at $LIB_RS" >&2; exit 2; }
[ -f "$MANIFEST_MD" ] || { echo "cannot read page at $MANIFEST_MD" >&2; exit 2; }

# Struct fields: `pub <name>:` lines, restricted to the schema section
# (everything before the `#[cfg(test)]` module). Function signatures
# (`pub fn`) are excluded by requiring the trailing colon.
FIELDS=$(awk '/#\[cfg\(test\)\]/{exit} 1' "$LIB_RS" \
  | grep -oE '^\s+pub [a-z_][a-z0-9_]*:' \
  | awk '{print $2}' | tr -d ':' | sort -u)

# Enum variant values (Profile and EgressPolicy): mapped to their serde
# wire names (lowercase per rename_all="lowercase"; kebab-case per
# rename_all="kebab-case" — TsaOnly -> tsa-only).
ENUMS=$(awk '/#\[cfg\(test\)\]/{exit} 1' "$LIB_RS" \
  | grep -oE '^\s+(Reference|Whitelabel|Sovereign|None|TsaOnly|External),' \
  | tr -d ',' | sort -u | sed -E 's/([a-z0-9])([A-Z])/\1-\2/g' | tr 'A-Z' 'a-z')

total=0; missing=0
for field in $FIELDS $ENUMS; do
  total=$((total + 1))
  if grep -qF "$field" "$MANIFEST_MD"; then
    printf '  ok    %s\n' "$field"
  else
    printf '  MISS  %s\n' "$field"
    missing=$((missing + 1))
  fi
done

echo
echo "coverage: $((total - missing))/$total fields documented ($LIB_RS -> $MANIFEST_MD)"
[ "$missing" -eq 0 ] || exit 1
