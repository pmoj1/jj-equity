// api/_cors.js
var APP_ORIGIN_PATTERN = /^https:\/\/(?:(?:www|app|api|tech|finance|commodity|happy|energy)\.)?worldmonitor\.app$/;
var MAX_ORIGIN_BYTES = 300;
var ORIGIN_ENCODER = new TextEncoder();
var ALLOWED_ORIGIN_PATTERNS = [
  APP_ORIGIN_PATTERN,
  // Vercel preview deployments under the "eliewm" team scope, e.g.
  //   worldmonitor-git-<branch>-eliewm.vercel.app  (git-branch alias)
  //   worldmonitor-<hash>-eliewm.vercel.app        (deployment URL)
  // Tight on purpose: never a bare *.vercel.app (this is a security allowlist).
  /^https:\/\/worldmonitor-[a-z0-9-]+-eliewm\.vercel\.app$/,
  /^https?:\/\/tauri\.localhost(:\d+)?$/,
  /^https?:\/\/[a-z0-9-]+\.tauri\.localhost(:\d+)?$/i,
  /^tauri:\/\/localhost$/,
  /^asset:\/\/localhost$/,
  // Only allow bare localhost/127.0.0.1 in non-production (matches server/cors.ts)
  ...process.env.NODE_ENV === "production" ? [] : [
    /^https?:\/\/localhost(:\d+)?$/,
    /^https?:\/\/127\.0\.0\.1(:\d+)?$/
  ]
];
var ALLOWED_HEADERS = [
  "Content-Type",
  "Authorization",
  "X-WorldMonitor-Key",
  "X-Api-Key",
  "X-Widget-Key",
  "X-Pro-Key",
  "Idempotency-Key",
  "Mcp-Session-Id",
  "MCP-Protocol-Version",
  // MCP 2026-07-28 request metadata headers (mirrored method / tool, prompt or resource name).
  "Mcp-Method",
  "Mcp-Name",
  "Last-Event-ID"
].join(", ");
var EXPOSED_HEADERS = [
  "Mcp-Session-Id",
  "WWW-Authenticate",
  "Retry-After",
  "Idempotency-Key",
  "Idempotent-Replayed",
  // Poll URL on a gateway 202 Accepted async job (#4810). The Worker stamps
  // this list over every api.worldmonitor.app response, so it must be here
  // for browser agents to read it, not only in server/cors.ts.
  "Location",
  // Billing-verification denials (server/_shared/entitlement-check.ts) carry
  // the reason here alongside `Retry-After`. Docs advertise the header
  // (docs/usage-errors.mdx) but it was not exposed, so a cross-origin browser
  // client — the Tauri desktop shell, widget embeds, anything on
  // api.worldmonitor.app — could not read it and had to parse `code` from the
  // body to tell a retryable verification blip from a terminal lapse (#5622).
  "X-Billing-Verification",
  // IETF RateLimit fields (draft-ietf-httpapi-ratelimit-headers): RateLimit-Policy
  // + RateLimit-Limit are advertised on every API response (vercel.json); the
  // combined RateLimit member and RateLimit-Remaining/Reset appear on a 429.
  // Exposed so browser-context agents can read them cross-origin and self-throttle.
  "RateLimit",
  "RateLimit-Policy",
  "RateLimit-Limit",
  "RateLimit-Remaining",
  "RateLimit-Reset",
  // Legacy X-RateLimit-* retained for back-compat with existing consumers.
  "X-RateLimit-Limit",
  "X-RateLimit-Remaining",
  "X-RateLimit-Reset",
  // Fail-open limiter degradation (oauth/token, wm-session, gateway). Mode is
  // not part of the Limit/Remaining/Reset triplet; omitting it left
  // `response.headers.get('X-RateLimit-Mode')` null for cross-origin JS
  // even though the header is on the wire (#7270).
  "X-RateLimit-Mode",
  // api/mcp-proxy marks the 504 it relays for a remote MCP server timeout so
  // premium-fetch's origin-5xx canary can skip it (WORLDMONITOR-17A).
  "X-Wm-Upstream-Timeout",
  "X-WorldMonitor-Bbox",
  "X-WorldMonitor-Bbox-Missing",
  "X-WorldMonitor-Bbox-Invalid",
  "X-Military-Bbox",
  // RFC 9745 / RFC 8594 lifecycle signals. Link rel="deprecation" is present
  // on current responses for policy discovery; Deprecation and Sunset appear
  // only when a surface is actually deprecated.
  "Link",
  "Deprecation",
  "Sunset"
].join(", ");
function stripTrailingDnsDots(hostname) {
  let end = hostname.length;
  while (end > 0 && hostname[end - 1] === ".") end--;
  return hostname.slice(0, end);
}
function originForAllowlistMatch(origin) {
  if (!origin) return "";
  try {
    const url = new URL(origin);
    const host = stripTrailingDnsDots(url.hostname);
    if (!host || host === url.hostname) return origin;
    url.hostname = host;
    return url.origin;
  } catch {
    return origin;
  }
}
function isWorldMonitorGoogleTranslateOrigin(origin) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" || url.port !== "") return false;
    const host = stripTrailingDnsDots(url.hostname);
    const suffix = ".translate.goog";
    if (!host.endsWith(suffix)) return false;
    const encoded = host.slice(0, -suffix.length);
    if (!encoded || encoded.includes(".")) return false;
    const decoded = encoded.replace(/--/g, "\0").replace(/-/g, ".").replace(/\0/g, "-");
    return APP_ORIGIN_PATTERN.test(`https://${decoded}`);
  } catch {
    return false;
  }
}
function isAllowedOrigin(origin) {
  if (!origin || origin.length > MAX_ORIGIN_BYTES || ORIGIN_ENCODER.encode(origin).byteLength > MAX_ORIGIN_BYTES) return false;
  if (isWorldMonitorGoogleTranslateOrigin(origin)) return true;
  const candidate = originForAllowlistMatch(origin);
  return ALLOWED_ORIGIN_PATTERNS.some((pattern) => pattern.test(candidate));
}
function getCorsHeaders(req, methods = "GET, OPTIONS") {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = isAllowedOrigin(origin) ? origin : "https://worldmonitor.app";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Expose-Headers": EXPOSED_HEADERS,
    "Access-Control-Max-Age": "3600",
    "Vary": "Origin"
  };
}
function getPublicCorsHeaders(methods = "GET, OPTIONS") {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Expose-Headers": EXPOSED_HEADERS,
    "Access-Control-Max-Age": "3600"
  };
}
function isDisallowedOrigin(req) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  return !isAllowedOrigin(origin);
}

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

// api/_seed-envelope.js
function unwrapEnvelope(raw) {
  if (raw == null) return { _seed: null, data: null };
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return { _seed: null, data: raw };
    }
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    return { _seed: null, data: value };
  }
  const seed = value._seed;
  if (seed && typeof seed === "object" && typeof seed.fetchedAt === "number") {
    return { _seed: seed, data: value.data };
  }
  return { _seed: null, data: value };
}

// api/_upstash-json.js
function getKeyPrefix() {
  const env = process.env.VERCEL_ENV;
  if (!env || env === "production") return "";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "dev";
  return `${env}:${sha}:`;
}
function applyRedisKeyPrefix(key) {
  const prefix = getKeyPrefix();
  return prefix ? `${prefix}${key}` : key;
}
async function readJsonFromUpstash(key, timeoutMs = 3e3, raw = false) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const resp = await fetch(`${url}/get/${encodeURIComponent(raw ? key : applyRedisKeyPrefix(key))}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!resp.ok) return null;
  const data = await resp.json();
  if (data.result == null) return null;
  try {
    return unwrapEnvelope(JSON.parse(data.result)).data;
  } catch {
    return null;
  }
}

// api/gpsjam.js
var config = { runtime: "edge" };
var REDIS_KEY = "intelligence:gpsjam:v2";
var REDIS_KEY_V1 = "intelligence:gpsjam:v1";
var cached = null;
var cachedAt = 0;
var CACHE_TTL = 3e5;
var negUntil = 0;
var NEG_TTL = 6e4;
function toWebHex(hex) {
  const base = { h3: hex.h3, lat: hex.lat, lon: hex.lon, level: hex.level, region: hex.region };
  if (Number.isFinite(hex.pct)) {
    return {
      ...base,
      pct: hex.pct,
      affectedAircraft: hex.affectedAircraft ?? hex.bad ?? hex.sampleCount ?? 0,
      totalAircraft: hex.totalAircraft ?? hex.total ?? hex.aircraftCount ?? 0
    };
  }
  const npAvg = Number.isFinite(hex.npAvg) ? hex.npAvg : 2;
  return {
    ...base,
    pct: npAvg <= 0.5 ? 15 : npAvg <= 1 ? 5 : 0,
    affectedAircraft: hex.sampleCount ?? 0,
    totalAircraft: hex.aircraftCount ?? 0
  };
}
async function fetchGpsJamData() {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_TTL) return cached;
  if (now < negUntil) return null;
  let raw;
  try {
    raw = await readJsonFromUpstash(REDIS_KEY, 3e3, true);
  } catch {
    raw = null;
  }
  if (!raw) {
    try {
      raw = await readJsonFromUpstash(REDIS_KEY_V1, 3e3, true);
    } catch {
      raw = null;
    }
  }
  if (!raw?.hexes) {
    negUntil = now + NEG_TTL;
    return null;
  }
  const data = { ...raw, source: raw.source || "gpsjam.org", hexes: raw.hexes.map(toWebHex) };
  cached = data;
  cachedAt = now;
  return data;
}
async function handler(req) {
  const corsHeaders = getCorsHeaders(req, "GET, OPTIONS");
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (isDisallowedOrigin(req)) {
    return jsonResponse({ error: "Origin not allowed" }, 403, corsHeaders);
  }
  const publicCorsHeaders = getPublicCorsHeaders("GET, OPTIONS");
  const data = await fetchGpsJamData();
  if (!data) {
    return jsonResponse(
      { error: "GPS interference data temporarily unavailable" },
      503,
      { "Cache-Control": "no-cache, no-store", ...corsHeaders }
    );
  }
  return jsonResponse(
    data,
    200,
    {
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=1800, stale-if-error=3600",
      ...publicCorsHeaders
    }
  );
}
export {
  config,
  handler as default,
  toWebHex
};
