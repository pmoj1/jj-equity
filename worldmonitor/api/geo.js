// api/_json-response.js
function jsonResponse(body, status, headers = {}) {
  const json = JSON.stringify(body, function replaceError(key, value) {
    const original = this[key];
    return original instanceof Error ? { error: original.message } : value;
  });
  const byteLength = new TextEncoder().encode(json).byteLength;
  return new Response(json, {
    status,
    headers: {
      "Content-Type": "application/json",
      "Content-Length": String(byteLength),
      ...headers
    }
  });
}

// api/geo.js
var config = { runtime: "edge" };
function handler(req) {
  const cfCountry = req.headers.get("cf-ipcountry");
  const country = (cfCountry && cfCountry !== "T1" ? cfCountry : null) || req.headers.get("x-vercel-ip-country") || "XX";
  return jsonResponse({ country }, 200, {
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*"
  });
}
export {
  config,
  handler as default
};
