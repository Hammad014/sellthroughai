/**
 * Tiny builder for n8n workflow JSON, so each workflow reads as a short list
 * of nodes + wires instead of hand-maintained JSON. Node ids are derived from
 * the workflow + node name, so rebuilds produce identical files.
 */
import { createHash } from "node:crypto";

function stableId(...parts) {
  const h = createHash("sha1").update(parts.join("\u0000")).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

export class Workflow {
  constructor(name) {
    this.name = name;
    this.nodes = [];
    this.connections = {};
  }

  /** Add a node. Returns its name, for wiring. */
  node({ name, type, version, at, params = {}, extra = {} }) {
    if (this.nodes.some((n) => n.name === name))
      throw new Error(`${this.name}: duplicate node name "${name}"`);
    this.nodes.push({
      parameters: params,
      id: stableId(this.name, name),
      name,
      type,
      typeVersion: version,
      position: at,
      ...extra,
    });
    return name;
  }

  /**
   * Wire `from` → `to`. `kind` is "main" or an AI port such as
   * "ai_languageModel", "ai_outputParser", "ai_memory", "ai_tool".
   */
  connect(from, to, { output = 0, input = 0, kind = "main" } = {}) {
    const ports = (this.connections[from] ??= {});
    const outs = (ports[kind] ??= []);
    while (outs.length <= output) outs.push([]);
    outs[output].push({ node: to, type: kind, index: input });
  }

  /** Chain several nodes on their first main output/input. */
  chain(...names) {
    for (let i = 0; i < names.length - 1; i++)
      this.connect(names[i], names[i + 1]);
  }

  /**
   * Canvas note (markdown). Colors: 1 yellow … 7 purple in n8n's palette.
   * Height is estimated from the text so the note hugs its content.
   */
  sticky(name, content, at, { width = 380, color = 7 } = {}) {
    const chars = Math.floor((width - 40) / 7);
    const titleChars = Math.floor((width - 40) / 14);
    let height = 60;
    for (const line of content.split("\n")) {
      if (line.startsWith("## "))
        height += Math.ceil((line.length - 3) / titleChars) * 34;
      else if (line.startsWith("### ")) height += 30;
      else height += Math.max(1, Math.ceil(line.length / chars)) * 18;
    }
    return this.node({
      name,
      type: "n8n-nodes-base.stickyNote",
      version: 1,
      at,
      params: { content, width, height, color },
    });
  }

  toJSON() {
    return {
      name: this.name,
      nodes: this.nodes,
      connections: this.connections,
      pinData: {},
      active: false,
      settings: { executionOrder: "v1" },
      meta: { templateCredsSetupCompleted: false },
      tags: [],
    };
  }
}
