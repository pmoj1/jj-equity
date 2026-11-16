// api/mcp/utils.ts
function utf8ByteLength(s) {
  return new TextEncoder().encode(s).length;
}
var MAX_JSON_RPC_ID_BYTES = 256;
function safeJsonRpcId(value) {
  if (typeof value === "number") return Number.isInteger(value) ? value : null;
  if (typeof value !== "string" || value.length > MAX_JSON_RPC_ID_BYTES) return null;
  return utf8ByteLength(value) <= MAX_JSON_RPC_ID_BYTES ? value : null;
}
function compressDescription(text, maxBytes) {
  if (typeof text !== "string" || text.length === 0) return text;
  if (utf8ByteLength(text) <= maxBytes) return text;
  const sentenceMatch = text.match(/^[\s\S]+?[.!?](?:\s|$)/);
  const candidate = sentenceMatch ? sentenceMatch[0].trim() : text;
  if (utf8ByteLength(candidate) <= maxBytes) return candidate;
  const encoder = new TextEncoder();
  let out = "";
  let used = 0;
  for (const ch of candidate) {
    const chBytes = encoder.encode(ch).length;
    if (used + chBytes > maxBytes) break;
    out += ch;
    used += chBytes;
  }
  return out;
}
function isPlainObject(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function clientAcceptsSse(req) {
  const accept = req.headers.get("accept") ?? "";
  return accept.split(",").some((entry) => {
    const [type, ...params] = entry.split(";").map((part) => part.trim().toLowerCase());
    if (type !== "text/event-stream") return false;
    const qParam = params.find((part) => part.startsWith("q="));
    if (!qParam) return true;
    const q = Number(qParam.slice(2));
    return Number.isFinite(q) && q > 0;
  });
}
export {
  clientAcceptsSse,
  compressDescription,
  isPlainObject,
  safeJsonRpcId,
  utf8ByteLength
};
