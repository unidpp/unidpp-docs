// api-reference.mjs — the shared renderer: an API reference page from
// a service's OpenAPI contract document. Both the generator (which
// writes the pages) and the checker (which compares them) call this
// one function; the rendering has exactly one home.

export const SERVICES = [
  "registry",
  "trust",
  "log",
  "issuer",
  "projector",
  "gateway",
  "archive",
  "resolver",
  "hub",
  "console",
];

const METHODS = ["get", "post", "put", "delete", "patch"];

export function operations(doc) {
  const lines = [];
  for (const [route, item] of Object.entries(doc.paths ?? {})) {
    for (const method of METHODS) {
      const op = item[method];
      if (!op) continue;
      lines.push({ route, method: method.toUpperCase(), op });
    }
  }
  return lines;
}

export function renderPage(service, doc) {
  const envKeys = doc.info?.["x-unidpp-env-keys"] ?? [];
  const parts = [];
  parts.push("---");
  parts.push(`title: "${service} — API reference"`);
  parts.push(
    `description: "Every operation of the ${service} service, rendered from its committed OpenAPI contract."`,
  );
  parts.push("---");
  parts.push("");
  parts.push(`# ${service} — API reference`);
  parts.push("");
  parts.push(
    `The contract is declared once, on the handlers of \`unidpp-${service}\`, and committed as its [\`openapi.yaml\`](https://github.com/unidpp/unidpp-${service}/blob/main/openapi.yaml); this page renders that document.`,
  );
  parts.push(
    `A running service serves the same contract at \`/openapi.json\` and \`/openapi.yaml\`, and browses it live at \`/docs\` (Swagger UI). The deployment consumes ${
      envKeys.length
    } environment variable${envKeys.length === 1 ? "" : "s"} (\`x-unidpp-env-keys\`).`,
  );

  const byTag = new Map();
  for (const { route, method, op } of operations(doc)) {
    const tag = (op.tags ?? [service])[0];
    if (!byTag.has(tag)) byTag.set(tag, []);
    byTag.get(tag).push({ route, method, op });
  }
  const tagDescriptions = new Map(
    (doc.tags ?? []).map((t) => [t.name, t.description ?? ""]),
  );

  for (const [tag, ops] of byTag) {
    parts.push("");
    parts.push(`## ${tag}`);
    const tagDescription = tagDescriptions.get(tag);
    if (tagDescription) {
      parts.push("");
      parts.push(tagDescription);
    }
    for (const { route, method, op } of ops) {
      parts.push("");
      parts.push(`### ${method} \`${route}\``);
      const summary = op.summary?.trim();
      const description = op.description?.trim();
      if (summary || description) {
        parts.push("");
        if (summary && description && summary !== description) {
          parts.push(summary);
          parts.push("");
          parts.push(description);
        } else {
          parts.push(summary ?? description);
        }
      }
      const parameters = op.parameters ?? [];
      if (parameters.length > 0) {
        parts.push("");
        parts.push("**Parameters**");
        parts.push("");
        parts.push("| Name | In | Description |");
        parts.push("|---|---|---|");
        for (const parameter of parameters) {
          parts.push(
            `| \`${parameter.name}\` | ${parameter.in} | ${
              (parameter.description ?? "").replaceAll("|", "\\|")
            } |`,
          );
        }
      }
      const requestBody = op.requestBody;
      if (requestBody) {
        parts.push("");
        parts.push(`**Request body**: ${(requestBody.description ?? "").trim()}`);
      }
      const responses = Object.entries(op.responses ?? {});
      if (responses.length > 0) {
        parts.push("");
        parts.push("**Responses**");
        parts.push("");
        for (const [status, response] of responses) {
          parts.push(`- \`${status}\` — ${response.description ?? ""}`);
        }
      }
    }
  }
  parts.push("");
  return parts.join("\n");
}
