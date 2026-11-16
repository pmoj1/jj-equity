// api/mcp/error-fingerprint.ts
function mcpErrorFingerprint(step, toolName, err) {
  const message = err instanceof Error ? err.message : String(err);
  const siblingHttp = message.match(/^([A-Za-z0-9_-]+) HTTP (\d{3})\b/);
  if (siblingHttp?.[2] === "401" && message === `${siblingHttp[1]} HTTP 401: invalid_internal_mcp_signature`) {
    return ["mcp-internal-auth-401"];
  }
  const signature = siblingHttp ? `${siblingHttp[1]}:${siblingHttp[2]}` : err instanceof Error ? err.name || err.constructor.name : "non-error";
  return [`mcp-${step}`, toolName, signature];
}
export {
  mcpErrorFingerprint
};
