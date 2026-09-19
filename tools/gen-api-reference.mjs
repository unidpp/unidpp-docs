// gen-api-reference.mjs — write the per-service API reference pages
// from the services' committed OpenAPI contract documents (the
// goldens of TODO 228). The contract is the source; the page is a
// render. Pair with check-api-reference.mjs, which fails when a page
// no longer matches its contract.
//
// Usage: node tools/gen-api-reference.mjs   (from the repo root;
// assumes the family checkout ../unidpp-<service>)

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { parse } from "yaml";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SERVICES, operations, renderPage } from "./api-reference.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const DOCS_API = path.join(here, "..", "src", "content", "docs", "api");
const FAMILY = process.env.UNIDPP_FAMILY_DIR ?? path.join(here, "..", "..");

await mkdir(DOCS_API, { recursive: true });
for (const service of SERVICES) {
  const contractPath = path.join(FAMILY, `unidpp-${service}`, "openapi.yaml");
  let contract;
  try {
    contract = await readFile(contractPath, "utf8");
  } catch {
    console.log(`gen-api: SKIP ${service} (no contract at ${contractPath})`);
    continue;
  }
  const doc = parse(contract);
  const page = renderPage(service, doc);
  const out = path.join(DOCS_API, `${service}.md`);
  await writeFile(out, page);
  const count = operations(doc).length;
  console.log(`gen-api: ${service}: ${count} operations -> ${out}`);
}
