// check-manifest-coverage.mjs — the manifest-reference completeness
// check. Every field and enum value of the operator manifest schema
// (the exported JSON Schema of unidpp-config, the model) must be
// documented on the manifest reference page.

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA = path.join(here, "..", "public", "operator-manifest.schema.json");
const PAGE = path.join(here, "..", "src", "content", "docs", "operators", "manifest.md");

const schema = JSON.parse(await readFile(SCHEMA, "utf8"));
const page = await readFile(PAGE, "utf8");

const names = new Set();
function walk(node) {
  if (!node || typeof node !== "object") return;
  for (const name of Object.keys(node.properties ?? {})) names.add(name);
  for (const value of node.enum ?? []) {
    if (typeof value === "string") names.add(value);
  }
  for (const child of Object.values(node.properties ?? {})) walk(child);
  for (const child of Object.values(node.definitions ?? {})) walk(child);
  walk(node.items);
  for (const key of ["oneOf", "anyOf", "allOf"]) {
    for (const child of node[key] ?? []) walk(child);
  }
}
walk(schema);
// $defs entries are schema fragments, not names the page must carry;
// walk into their values only.
for (const child of Object.values(schema.$defs ?? {})) walk(child);

let total = 0;
let missing = 0;
for (const name of [...names].sort()) {
  total += 1;
  if (!page.includes(name)) {
    console.log(`  MISS  ${name}`);
    missing += 1;
  }
}
console.log(`coverage: ${total - missing}/${total} schema names documented`);
process.exit(missing === 0 ? 0 : 1);
