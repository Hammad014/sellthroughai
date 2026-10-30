/**
 * Node factories for the kit's workflows, pinned to the node versions of
 * n8n 2.45 (checked by validate.mjs against n8n's own node schemas).
 * Each factory returns the args for Workflow.node().
 */

export const AI_MODEL = "gpt-5-mini";

const expr = (s) => `=${s}`;
export { expr };

// ---- Triggers --------------------------------------------------------------

export const gmailTrigger = ({ name = "New email", at, q, attachments }) => ({
  name,
  type: "n8n-nodes-base.gmailTrigger",
  version: 1.4,
  at,
  params: {
    pollTimes: { item: [{ mode: "everyMinute" }] },
    simple: false,
    filters: { readStatus: "unread", ...(q ? { q } : {}) },
    options: attachments ? { downloadAttachments: true } : {},
  },
});

export const schedule = ({ name = "Schedule", at, interval }) => ({
  name,
  type: "n8n-nodes-base.scheduleTrigger",
  version: 1.4,
  at,
  params: { rule: { interval: [interval] } },
});

export const formTrigger = ({
  name = "Form",
  at,
  title,
  description,
  fields,
  button = "Submit",
  thanks,
  path,
}) => ({
  name,
  type: "n8n-nodes-base.formTrigger",
  version: 2.6,
  at,
  params: {
    formTitle: title,
    formDescription: description,
    formFields: {
      values: fields.map(
        ({ label, type = "text", required = true, placeholder, options }) => ({
          fieldLabel: label,
          fieldType: type,
          ...(placeholder ? { placeholder } : {}),
          ...(options
            ? {
                fieldOptions: {
                  values: options.map((option) => ({ option })),
                },
              }
            : {}),
          requiredField: required,
        }),
      ),
    },
    responseMode: "onReceived",
    options: {
      appendAttribution: false,
      buttonLabel: button,
      ...(path ? { path } : {}),
      ...(thanks
        ? {
            respondWithOptions: {
              values: { respondWith: "text", formSubmittedText: thanks },
            },
          }
        : {}),
    },
  },
});

// ---- Core ------------------------------------------------------------------

/** "⚙️ Settings" Set node: the one place a buyer edits their details. */
export const settings = ({ name = "⚙️ Settings", at, fields }) => ({
  name,
  type: "n8n-nodes-base.set",
  version: 3.5,
  at,
  params: {
    mode: "manual",
    assignments: {
      assignments: fields.map(([key, value, type = "string"], i) => ({
        id: `setting-${i + 1}`,
        name: key,
        value,
        type,
      })),
    },
    includeOtherFields: true,
    options: {},
  },
});

export const setFields = ({ name, at, fields, keepOthers = false }) => ({
  name,
  type: "n8n-nodes-base.set",
  version: 3.5,
  at,
  params: {
    mode: "manual",
    assignments: {
      assignments: fields.map(([key, value, type = "string"], i) => ({
        id: `field-${i + 1}`,
        name: key,
        value,
        type,
      })),
    },
    includeOtherFields: keepOthers,
    options: {},
  },
});

export const code = ({ name, at, js, perItem = false }) => ({
  name,
  type: "n8n-nodes-base.code",
  version: 2,
  at,
  params: {
    mode: perItem ? "runOnceForEachItem" : "runOnceForAllItems",
    jsCode: js.trim(),
  },
});

/** One condition: [leftExpr, operation, right?, type="string"]. */
function conditions(list, combinator = "and") {
  return {
    options: {
      caseSensitive: false,
      leftValue: "",
      typeValidation: "loose",
      version: 3,
    },
    conditions: list.map(([left, operation, right, type = "string"], i) => ({
      id: `cond-${i + 1}`,
      leftValue: left,
      rightValue: right ?? "",
      operator: {
        type,
        operation,
        ...(right === undefined ? { singleValue: true } : {}),
      },
    })),
    combinator,
  };
}

export const ifNode = ({ name, at, when, combinator }) => ({
  name,
  type: "n8n-nodes-base.if",
  version: 2.4,
  at,
  params: {
    conditions: conditions(when, combinator),
    looseTypeValidation: true,
    options: {},
  },
});

export const filter = ({ name, at, when, combinator }) => ({
  name,
  type: "n8n-nodes-base.filter",
  version: 2.4,
  at,
  params: {
    conditions: conditions(when, combinator),
    looseTypeValidation: true,
    options: {},
  },
});

/** Switch with named outputs: rules = [[outputName, condition], ...]. */
export const switchNode = ({ name, at, rules, fallback }) => ({
  name,
  type: "n8n-nodes-base.switch",
  version: 3.5,
  at,
  params: {
    mode: "rules",
    rules: {
      values: rules.map(([key, cond]) => ({
        conditions: conditions([cond]),
        renameOutput: true,
        outputKey: key,
      })),
    },
    looseTypeValidation: true,
    options: fallback
      ? { fallbackOutput: "extra", renameFallbackOutput: fallback }
      : {},
  },
});

export const aggregateAll = ({ name, at, field = "items" }) => ({
  name,
  type: "n8n-nodes-base.aggregate",
  version: 1,
  at,
  params: { aggregate: "aggregateAllItemData", destinationFieldName: field },
});

export const splitOut = ({ name, at, field }) => ({
  name,
  type: "n8n-nodes-base.splitOut",
  version: 1.1,
  at,
  params: { fieldToSplitOut: field, options: {} },
});

export const httpGet = ({ name, at, url }) => ({
  name,
  type: "n8n-nodes-base.httpRequest",
  version: 4.5,
  at,
  params: {
    url,
    options: { response: { response: { responseFormat: "text" } } },
  },
});

export const rss = ({ name = "Read feed", at, url }) => ({
  name,
  type: "n8n-nodes-base.rssFeedRead",
  version: 1.2,
  at,
  params: { url, options: {} },
});

export const extractPdf = ({ name = "Read PDF text", at, binary }) => ({
  name,
  type: "n8n-nodes-base.extractFromFile",
  version: 1.2,
  at,
  params: { operation: "pdf", binaryPropertyName: binary, options: {} },
});

// ---- Apps ------------------------------------------------------------------

export const gmailSend = ({ name, at, to, subject, message, html = true }) => ({
  name,
  type: "n8n-nodes-base.gmail",
  version: 2.2,
  at,
  params: {
    resource: "message",
    operation: "send",
    sendTo: to,
    subject,
    emailType: html ? "html" : "text",
    message,
    options: { appendAttribution: false },
  },
});

export const gmailDraft = ({ name, at, to, subject, message, threadId }) => ({
  name,
  type: "n8n-nodes-base.gmail",
  version: 2.2,
  at,
  params: {
    resource: "draft",
    operation: "create",
    subject,
    emailType: "text",
    message,
    options: { threadId, sendTo: to },
  },
});

export const gmailAddLabels = ({ name, at, messageId, labelIds }) => ({
  name,
  type: "n8n-nodes-base.gmail",
  version: 2.2,
  at,
  params: {
    resource: "message",
    operation: "addLabels",
    messageId,
    labelIds,
  },
});

const sheetRef = (docExpr, sheet) => ({
  documentId: { __rl: true, mode: "url", value: docExpr },
  sheetName: { __rl: true, mode: "name", value: sheet },
});

/** Columns map for append/update: { header: expression }. */
function columns(map, match) {
  return {
    mappingMode: "defineBelow",
    value: map,
    matchingColumns: match ? [match] : [],
    schema: Object.keys(map).map((id) => ({
      id,
      displayName: id,
      required: false,
      defaultMatch: false,
      display: true,
      type: "string",
      canBeUsedToMatch: true,
    })),
  };
}

export const sheetAppend = ({ name, at, doc, sheet, map }) => ({
  name,
  type: "n8n-nodes-base.googleSheets",
  version: 4.7,
  at,
  params: {
    resource: "sheet",
    operation: "append",
    ...sheetRef(doc, sheet),
    columns: columns(map),
    options: {},
  },
});

export const sheetRead = ({ name, at, doc, sheet }) => ({
  name,
  type: "n8n-nodes-base.googleSheets",
  version: 4.7,
  at,
  params: {
    resource: "sheet",
    operation: "read",
    ...sheetRef(doc, sheet),
    options: {},
  },
});

export const sheetUpdate = ({ name, at, doc, sheet, map, match }) => ({
  name,
  type: "n8n-nodes-base.googleSheets",
  version: 4.7,
  at,
  params: {
    resource: "sheet",
    operation: "update",
    ...sheetRef(doc, sheet),
    columns: columns(map, match),
    options: {},
  },
});

export const slackPost = ({ name, at, channel, text }) => ({
  name,
  type: "n8n-nodes-base.slack",
  version: 2.7,
  at,
  params: {
    resource: "message",
    operation: "post",
    select: "channel",
    channelId: { __rl: true, mode: "name", value: channel },
    messageType: "text",
    text,
    otherOptions: { includeLinkToWorkflow: false },
  },
});

// ---- AI --------------------------------------------------------------------

export const llmChain = ({ name, at, prompt, system, parser = false }) => ({
  name,
  type: "@n8n/n8n-nodes-langchain.chainLlm",
  version: 1.9,
  at,
  params: {
    promptType: "define",
    text: prompt,
    hasOutputParser: parser,
    messages: {
      messageValues: [{ type: "SystemMessagePromptTemplate", message: system }],
    },
  },
});

// No temperature: GPT-5 models only accept the default and reject anything else.
export const openAiModel = ({ name = "OpenAI model", at }) => ({
  name,
  type: "@n8n/n8n-nodes-langchain.lmChatOpenAi",
  version: 1.3,
  at,
  params: {
    model: { __rl: true, mode: "list", value: AI_MODEL },
    options: {},
  },
});

export const jsonParser = ({ name = "Structured output", at, example }) => ({
  name,
  type: "@n8n/n8n-nodes-langchain.outputParserStructured",
  version: 1.3,
  at,
  params: {
    schemaType: "fromJson",
    jsonSchemaExample: JSON.stringify(example, null, 2),
  },
});

/**
 * Add an LLM chain with its model (and optional JSON parser) wired up.
 * Sub-nodes sit under the chain on the canvas. Returns the chain's name.
 */
export function addAiStep(w, { name, at, prompt, system, example }) {
  const [x, y] = at;
  const chain = w.node(
    llmChain({ name, at, prompt, system, parser: Boolean(example) }),
  );
  const model = w.node(
    openAiModel({ name: `${name} · model`, at: [x - 60, y + 220] }),
  );
  w.connect(model, chain, { kind: "ai_languageModel" });
  if (example) {
    const parser = w.node(
      jsonParser({ name: `${name} · format`, at: [x + 120, y + 220], example }),
    );
    w.connect(parser, chain, { kind: "ai_outputParser" });
  }
  return chain;
}

// ---- Agents ----------------------------------------------------------------

/** Private chat for testing an agent inside the n8n editor ("Open chat"). */
export const chatTrigger = ({ name = "Chat with your agent", at }) => ({
  name,
  type: "@n8n/n8n-nodes-langchain.chatTrigger",
  version: 1.5,
  at,
  params: { options: {} },
});

/** Tools-agent driven by the chat input, with a system message. */
export const agent = ({ name, at, system }) => ({
  name,
  type: "@n8n/n8n-nodes-langchain.agent",
  version: 3.1,
  at,
  params: {
    promptType: "auto",
    options: { systemMessage: system },
  },
});

export const windowMemory = ({ name = "Memory", at, turns = 10 }) => ({
  name,
  type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
  version: 1.4,
  at,
  params: { contextWindowLength: turns },
});

/** An app node used as an agent tool (e.g. "n8n-nodes-base.gmailTool"). */
export const appTool = ({ name, type, version, at, description, params }) => ({
  name,
  type,
  version,
  at,
  params: {
    descriptionType: "manual",
    toolDescription: description,
    ...params,
  },
});

/** Let the agent fill a parameter: $fromAI(key, hint, type). */
export const fromAI = (key, hint, type = "string") =>
  `={{ $fromAI('${key}', ${JSON.stringify(hint).replace(/'/g, "\\'")}, '${type}') }}`;
