// api/_agent-metadata.ts
var ALLOWED_HOST = /^(?:[a-z0-9-]+\.)?worldmonitor\.app$/;
var FALLBACK_ORIGIN = "https://worldmonitor.app";
function resolveMetadataOrigin(req) {
  const url = new URL(req.url);
  const host = (req.headers.get("host") ?? url.host).toLowerCase();
  return ALLOWED_HOST.test(host) ? `https://${host}` : FALLBACK_ORIGIN;
}
function guardMetadataMethod(req) {
  if (req.method === "GET" || req.method === "HEAD") return null;
  const cors = { "Access-Control-Allow-Origin": "*" };
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: { ...cors, "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS" }
    });
  }
  return new Response(null, { status: 405, headers: { ...cors, Allow: "GET, HEAD, OPTIONS" } });
}

// shared/strip-trailing-slashes.js
function stripTrailingSlashes(value) {
  let end = value.length;
  while (end > 1 && value.charCodeAt(end - 1) === 47) end -= 1;
  return end === value.length ? value : value.slice(0, end);
}

// api/oauth-protected-resource.ts
var config = { runtime: "edge" };
var RESOURCE_PATHS = /* @__PURE__ */ new Set(["mcp", "api/mcp"]);
function resolveResourcePath(req) {
  const url = new URL(req.url);
  const path = stripTrailingSlashes(url.pathname);
  if (path.endsWith("/.well-known/oauth-protected-resource")) return "";
  const flag = url.searchParams.get("resource");
  if (flag !== null) return RESOURCE_PATHS.has(flag) ? `/${flag}` : null;
  const suffix = path.match(/\/oauth-protected-resource\/(.+)$/)?.[1];
  if (suffix === void 0) return "";
  return RESOURCE_PATHS.has(suffix) ? `/${suffix}` : null;
}
function handler(req) {
  const guarded = guardMetadataMethod(req);
  if (guarded) return guarded;
  const resourcePath = resolveResourcePath(req);
  if (resourcePath === null) {
    return new Response(JSON.stringify({ error: "not_found" }), {
      status: 404,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*" }
    });
  }
  const origin = resolveMetadataOrigin(req);
  const body = JSON.stringify({
    resource: `${origin}${resourcePath}`,
    authorization_servers: [origin],
    bearer_methods_supported: ["header"],
    scopes_supported: ["mcp"]
  });
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      // Response body varies by Host (resource/authorization_servers derived
      // from it). Any intermediate cache keying on path alone could serve
      // wrong-origin metadata across hosts. Vercel's own router is per-host,
      // but this is belt-and-braces against downstream caches.
      "Vary": "Host"
    }
  });
}
export {
  config,
  handler as default
};
