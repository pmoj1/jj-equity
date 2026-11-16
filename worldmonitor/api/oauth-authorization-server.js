// api/_agent-metadata.ts
var ALLOWED_HOST = /^(?:[a-z0-9-]+\.)?worldmonitor\.app$/;
var FALLBACK_ORIGIN = "https://worldmonitor.app";
function resolveMetadataOrigin(req) {
  const url = new URL(req.url);
  const host = (req.headers.get("host") ?? url.host).toLowerCase();
  return ALLOWED_HOST.test(host) ? `https://${host}` : FALLBACK_ORIGIN;
}
function authSkillUrl(origin) {
  return `${origin}/auth.md`;
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

// api/oauth-authorization-server.ts
var config = { runtime: "edge" };
function handler(req) {
  const guarded = guardMetadataMethod(req);
  if (guarded) return guarded;
  const origin = resolveMetadataOrigin(req);
  const body = JSON.stringify({
    issuer: origin,
    authorization_endpoint: `${origin}/oauth/authorize`,
    token_endpoint: `${origin}/oauth/token`,
    registration_endpoint: `${origin}/oauth/register`,
    grant_types_supported: ["authorization_code", "refresh_token"],
    response_types_supported: ["code"],
    code_challenge_methods_supported: ["S256"],
    // Public clients only. Adding private_key_jwt would move ChatGPT, which
    // prefers it, onto signed client assertions this server does not verify.
    token_endpoint_auth_methods_supported: ["none"],
    // A URL client_id is resolved from its Client ID Metadata Document, for
    // the trusted vendor documents in api/oauth/_client-metadata.js (#9244).
    // DCR stays available; clients choose one at discovery and do not fall
    // back, so this flag must stay true only while that flow works end to end.
    client_id_metadata_document_supported: true,
    scopes_supported: ["mcp"],
    // RFC 9207: /oauth/authorize and /oauth/authorize-pro append `iss` to the
    // authorization response. ChatGPT registers its stable redirect URI only
    // with authorization servers that advertise this.
    authorization_response_iss_parameter_supported: true,
    agent_auth: {
      skill: authSkillUrl(origin),
      // Not identity_endpoint: auth.md v0.2 defines that as a POST taking
      // {"type":"anonymous"} and returning an identity_assertion. This is
      // RFC 7591 client registration, which the pre-v0.2 key describes.
      register_uri: `${origin}/oauth/register`,
      claim_uri: `${origin}/oauth/authorize`,
      identity_types_supported: ["anonymous"],
      anonymous: {
        credential_types_supported: ["access_token"],
        claim_uri: `${origin}/oauth/authorize`
      }
    }
  });
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
      "Access-Control-Allow-Origin": "*",
      // Response body varies by Host (issuer/endpoints derived from it). Any
      // intermediate cache keying on path alone could serve wrong-origin
      // metadata across hosts. Belt-and-braces against downstream caches;
      // Vercel's own router is already per-host.
      "Vary": "Host"
    }
  });
}
export {
  config,
  handler as default
};
