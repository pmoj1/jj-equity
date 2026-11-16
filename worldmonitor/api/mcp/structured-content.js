// api/mcp/utils.ts
function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

// api/mcp/structured-content.ts
var NON_DOCUMENTED_BRANCHES = [
  // The payload as reshaped by the caller: a `jmespath` projection, or a cache
  // tool's `summary: true` (lists become `{count, sample}`). A projection can
  // be any JSON value and `structuredContent` must be an object, so both are
  // carried under one key.
  { required: ["projection"] },
  // A projection from a licence-bearing tool: the attribution rider already
  // wraps it (`mergeAttributionRider`), so it is sent as it appears in the text.
  { required: ["data", "_attribution"] },
  { required: ["_budget_exceeded"] },
  { required: ["_jmespath_error"] }
];
var DEPRECATION_NOTICE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["alias", "replacement", "message"],
  properties: {
    alias: { type: "string" },
    replacement: { type: "string" },
    message: { type: "string" },
    limit: {
      type: "object",
      additionalProperties: false,
      required: ["requested", "servedAsYears", "mismatch"],
      properties: {
        requested: { type: ["number", "null"] },
        servedAsYears: { type: "integer", minimum: 1, maximum: 30 },
        mismatch: {
          type: "string",
          enum: ["omitted-was-newest-30", "non-positive-was-full-history", "row-cap-as-years", "capped-at-30"]
        }
      }
    },
    moved: {
      type: "object",
      additionalProperties: false,
      required: ["dataset", "tool"],
      properties: {
        dataset: { type: "string", enum: ["tariffs"] },
        tool: { type: "string" }
      }
    }
  }
};
function advertisedOutputSchema(documented, opts) {
  const branches = [documented, ...structuredClone(NON_DOCUMENTED_BRANCHES)];
  const anyOf = opts?.permitDeprecation === true ? branches.map((branch) => permitDeprecationRoot(branch)) : branches;
  return { type: "object", anyOf };
}
function permitDeprecationRoot(branch) {
  const record = isPlainObject(branch) ? branch : {};
  const properties = isPlainObject(record.properties) ? record.properties : {};
  return { ...record, properties: { ...properties, deprecation: DEPRECATION_NOTICE_SCHEMA } };
}
function schemaAdmitsNotice(advertised) {
  if (!isPlainObject(advertised) || !Array.isArray(advertised.anyOf) || advertised.anyOf.length === 0) return false;
  for (const branch of advertised.anyOf) {
    if (!isPlainObject(branch) || !isPlainObject(branch.properties)) return false;
    if (branch.properties.deprecation !== DEPRECATION_NOTICE_SCHEMA) return false;
    if (hasNestedDeprecationProperty(branch)) return false;
  }
  return true;
}
function hasNestedDeprecationProperty(root) {
  const visit = (node, atRoot) => {
    if (Array.isArray(node)) return node.some((item) => visit(item, false));
    if (!isPlainObject(node)) return false;
    if (!atRoot && isPlainObject(node.properties) && Object.prototype.hasOwnProperty.call(node.properties, "deprecation")) {
      return true;
    }
    return Object.values(node).some((value) => visit(value, false));
  };
  return visit(root, true);
}
function buildStructuredContent(value, opts) {
  if (opts.rider !== null) return { data: value ?? null, _attribution: opts.rider };
  if (!opts.reshaped && isPlainObject(value)) return value;
  return { projection: value ?? null };
}
function applyDeprecationNotice(structured, text, notice) {
  const structuredContent = { ...structured, deprecation: notice };
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = void 0;
  }
  const nextText = isPlainObject(parsed) ? JSON.stringify({ ...parsed, deprecation: notice }) : text;
  return { structuredContent, text: nextText };
}
export {
  DEPRECATION_NOTICE_SCHEMA,
  advertisedOutputSchema,
  applyDeprecationNotice,
  buildStructuredContent,
  permitDeprecationRoot,
  schemaAdmitsNotice
};
