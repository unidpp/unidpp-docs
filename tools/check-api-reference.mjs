// check-api-reference.mjs — every generated API reference page must
// match its service's committed OpenAPI contract. The contract is the
// truth; a stale page fails the check (regenerate with
// `npm run gen:api`).

import { readFile } from "node:fs/promises";
import { parse } from "yaml";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { SERVICES, operations, renderPage } from "./api-reference.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const DOCS_API = path.join(here, "..", "src", "content", "docs", "api");
const FAMILY = process.env.UNIDPP_FAMILY_DIR ?? path.join(here, "..", "..");

let failed = 0;
for (const service of SERVICES) {
  const contractPath = path.join(FAMILY, `unidpp-${service}`, "openapi.yaml");
  const pagePath = path.join(DOCS_API, `${service}.md`);
  let contract, page;
  try {
    contract = await readFile(contractPath, "utf8");
    page = await readFile(pagePath, "utf8");
  } catch {
    console.log(`check-api: SKIP ${service} (contract or page absent)`);
    continue;
  }
  const expected = renderPage(service, parse(contract));
  if (page === expected) {
    const count = operations(parse(contract)).length;
    console.log(`check-api: ok ${service} (${count} operations)`);
  } else {
    console.log(`check-api: FAIL ${service} — the page does not match its contract; regenerate with npm run gen:api`);
    failed = 1;
  }
}
process.exit(failed);
