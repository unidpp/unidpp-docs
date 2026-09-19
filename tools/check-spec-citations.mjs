// check-spec-citations.mjs — the summary-governance check (TODO 235):
// a page that summarizes specification clauses declares them in its
// frontmatter (`spec_clauses: ["6.3", "11"]`), and every declared
// clause is cited in the page body. The rule the convention enforces:
// a summary changes only in the change that moves the clause it
// summarizes, with the clause cited beside it.

import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const DOCS = path.join(here, "..", "src", "content", "docs");

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.name.endsWith(".md")) yield full;
  }
}

let declared = 0;
let failed = 0;
for await (const page of walk(DOCS)) {
  const text = await readFile(page, "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) continue;
  const clauses = match[1]
    .split("\n")
    .find((line) => line.startsWith("spec_clauses:"));
  if (!clauses) continue;
  declared += 1;
  const body = text.slice(match[0].length);
  const list = clauses
    .replace("spec_clauses:", "")
    .replace(/[\[\]"']/g, "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  for (const clause of list) {
    if (!body.includes(clause)) {
      console.log(`check-citations: FAIL ${path.relative(DOCS, page)} — declares clause ${clause} but never cites it`);
      failed = 1;
    }
  }
}
console.log(
  failed === 0
    ? `check-citations: ok — ${declared} page(s) declare their clauses`
    : "check-citations: FAIL",
);
process.exit(failed);
