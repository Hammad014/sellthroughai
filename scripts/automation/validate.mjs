/**
 * Check every built workflow with n8n's OWN validator (@n8n/workflow-sdk):
 * structure, connections, expressions and each node's parameters against the
 * node schemas that ship with n8n. Dev-only — needs an n8n install:
 *
 *   npm i --prefix /some/dir n8n        (once)
 *   N8N_MODULES=/some/dir/node_modules node scripts/automation/validate.mjs
 *
 * Exits non-zero on any error or warning.
 */
import { readdir, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { OUT } from "./build.mjs";

const modules = process.env.N8N_MODULES;
if (!modules) {
  console.error(
    "Set N8N_MODULES to the node_modules folder of an n8n install.",
  );
  process.exit(2);
}
const require = createRequire(path.join(modules, "noop.js"));
const sdk = require("@n8n/workflow-sdk");
sdk.setSchemaBaseDirs([
  path.join(modules, "n8n-nodes-base/dist/node-definitions"),
  path.join(modules, "@n8n/n8n-nodes-langchain/dist/node-definitions"),
]);

const dir = path.join(OUT, "workflows");
let problems = 0;
for (const file of (await readdir(dir)).filter((f) => f.endsWith(".json"))) {
  const json = JSON.parse(await readFile(path.join(dir, file), "utf8"));
  const { errors, warnings } = sdk.validateWorkflow(json, {
    validateSchema: true,
  });
  const issues = [...errors, ...warnings].filter(
    (i) => !sdk.isInformationalIssue?.(i) || i.code === "DISCONNECTED_NODE",
  );
  issues.push(...wiringIssues(json));
  problems += issues.length;
  console.log(`${issues.length ? "✗" : "✓"} ${file}`);
  for (const i of issues)
    console.log(
      `    ${i.severity} ${i.code}${i.nodeName ? ` [${i.nodeName}]` : ""}: ${i.message}`,
    );
}
/** Checks n8n's validator leaves out: every wire must point at a real node. */
function wiringIssues(json) {
  const names = new Set(json.nodes.map((n) => n.name));
  const out = [];
  for (const [from, ports] of Object.entries(json.connections)) {
    if (!names.has(from))
      out.push({
        severity: "error",
        code: "UNKNOWN_SOURCE",
        nodeName: from,
        message: "wire from a node that doesn't exist",
      });
    for (const outputs of Object.values(ports))
      for (const targets of outputs)
        for (const t of targets)
          if (!names.has(t.node))
            out.push({
              severity: "error",
              code: "UNKNOWN_TARGET",
              nodeName: from,
              message: `wire to missing node "${t.node}"`,
            });
  }
  return out;
}

if (problems) {
  console.error(`\n${problems} issue(s).`);
  process.exit(1);
}
console.log("\nAll workflows pass n8n's validator.");
