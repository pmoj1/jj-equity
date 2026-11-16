// api/_cors.js
var APP_ORIGIN_PATTERN = /^https:\/\/(?:(?:www|app|api|tech|finance|commodity|happy|energy)\.)?worldmonitor\.app$/;
var MAX_ORIGIN_BYTES = 300;
var ORIGIN_ENCODER = new TextEncoder();
function isHostedAppOrigin(origin) {
  return typeof origin === "string" && APP_ORIGIN_PATTERN.test(origin);
}
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

// api/_session.js
var SESSION_TTL_MS = 12 * 60 * 60 * 1e3;
var PREFIX = "wms_";
var enc = new TextEncoder();
function getSecret() {
  const s = process.env.WM_SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error("WM_SESSION_SECRET must be set (min 32 chars)");
  }
  return s;
}
async function importHmacKey() {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}
function bufferToBase64Url(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function stringToBase64Url(s) {
  return bufferToBase64Url(enc.encode(s).buffer);
}
function randomNonceHex(byteLen = 8) {
  const arr = new Uint8Array(byteLen);
  crypto.getRandomValues(arr);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += arr[i].toString(16).padStart(2, "0");
  return s;
}
async function issueSessionToken() {
  const payload = {
    iat: Date.now(),
    exp: Date.now() + SESSION_TTL_MS,
    n: randomNonceHex(8)
  };
  const body = stringToBase64Url(JSON.stringify(payload));
  const key = await importHmacKey();
  const sigBuf = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  const sig = bufferToBase64Url(sigBuf);
  return { token: `${PREFIX}${body}.${sig}`, exp: payload.exp };
}

// server/_shared/internal-auth.ts
async function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const aHash = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(a)));
  const bHash = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(b)));
  const n = bHash.length;
  let diff = 0;
  for (let i = 0; i < n; i++) {
    diff |= aHash[i] ^ bHash[i];
  }
  return diff === 0;
}

// api/seed-contract-probe.ts
var config = { runtime: "edge" };
var RETRY_DELAY_MS = 500;
async function withRetry(attempt, delayMs = RETRY_DELAY_MS) {
  const first = await attempt();
  if (first.pass) return first;
  if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
  const second = await attempt();
  if (second.pass) second.recovered = true;
  return second;
}
var DEFAULT_PROBES = [
  // Canonical keys migrated by runSeed contract mode — must envelope.
  { key: "economic:fsi-eu:v1", shape: "envelope", dataHas: ["latestValue", "history"] },
  { key: "climate:zone-normals:v1", shape: "envelope", dataHas: ["normals"], minRecords: 13 },
  { key: "wildfire:fires:v1", shape: "envelope", dataHas: ["fireDetections"] },
  // Derived extra key the CII and temporal-anomaly rebuilds read (#9509).
  { key: "wildfire:fires-summary:v1", shape: "envelope", dataHas: ["totalCount", "firms", "byCountry"] },
  { key: "seismology:earthquakes:v1", shape: "envelope", dataHas: ["earthquakes"] },
  // Multi-panel canonical + extras — regression guard for publishTransform
  // shape-mismatch bug that previously skipped all 3 writes (token-panels).
  // Every panel needs minRecords ≥ 1; without the floor, an extra-key
  // declareRecords regressed to 0 would still pass this probe as long as
  // `.tokens` existed on the payload.
  { key: "market:defi-tokens:v1", shape: "envelope", dataHas: ["tokens"], minRecords: 1 },
  { key: "market:ai-tokens:v1", shape: "envelope", dataHas: ["tokens"], minRecords: 1 },
  { key: "market:other-tokens:v1", shape: "envelope", dataHas: ["tokens"], minRecords: 1 },
  // Direct writers (ais-relay.cjs) — regression guard for envelope wrap.
  { key: "product-catalog:v3", shape: "envelope", dataHas: ["tiers"] },
  // Invariant: seed-meta:* keys must NEVER envelope (shouldEnvelopeKey guard).
  { key: "seed-meta:energy:oil-stocks-analysis", shape: "bare", dataHas: ["fetchedAt"] },
  { key: "seed-meta:economic:fsi-eu", shape: "bare", dataHas: ["fetchedAt"] }
];
function hasEnvelopeShape(parsed) {
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return false;
  const seed = parsed._seed;
  return !!seed && typeof seed === "object" && typeof seed.fetchedAt === "number";
}
function errMessage(err) {
  return err instanceof Error ? err.message : String(err);
}
async function checkProbe(spec) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { key: spec.key, shape: spec.shape, pass: false, reason: "no-redis-creds" };
  let resp;
  try {
    resp = await fetch(`${url}/get/${encodeURIComponent(spec.key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(3e3)
    });
  } catch (err) {
    return { key: spec.key, shape: spec.shape, pass: false, reason: `fetch:${errMessage(err)}` };
  }
  if (!resp.ok) return { key: spec.key, shape: spec.shape, pass: false, reason: `redis:${resp.status}` };
  let body;
  try {
    body = await resp.json();
  } catch {
    return { key: spec.key, shape: spec.shape, pass: false, reason: "redis-bad-json-body" };
  }
  if (!body.result) return { key: spec.key, shape: spec.shape, pass: false, reason: "missing" };
  let parsed;
  try {
    parsed = JSON.parse(body.result);
  } catch {
    return { key: spec.key, shape: spec.shape, pass: false, reason: "malformed-json" };
  }
  const isEnvelope = hasEnvelopeShape(parsed);
  if (spec.shape === "envelope") {
    if (!isEnvelope) return { key: spec.key, shape: spec.shape, pass: false, reason: "expected-envelope-got-bare" };
    const env = parsed;
    for (const field of spec.dataHas ?? []) {
      if (env.data?.[field] === void 0) {
        return { key: spec.key, shape: spec.shape, pass: false, reason: `missing-field:${field}` };
      }
    }
    if (spec.minRecords != null && env._seed.recordCount < spec.minRecords) {
      return {
        key: spec.key,
        shape: spec.shape,
        pass: false,
        reason: `records:${env._seed.recordCount}<${spec.minRecords}`
      };
    }
    return {
      key: spec.key,
      shape: spec.shape,
      pass: true,
      state: env._seed.state,
      records: env._seed.recordCount,
      ageMs: Date.now() - env._seed.fetchedAt
    };
  }
  if (isEnvelope) return { key: spec.key, shape: spec.shape, pass: false, reason: "expected-bare-got-envelope" };
  const bare = parsed;
  for (const field of spec.dataHas ?? []) {
    if (bare[field] === void 0) {
      return { key: spec.key, shape: spec.shape, pass: false, reason: `missing-field:${field}` };
    }
  }
  return { key: spec.key, shape: spec.shape, pass: true };
}
var BOUNDARY_CHECKS = [
  { endpoint: "/api/product-catalog", requireSourceHeader: { name: "x-product-catalog-source", value: "cache" } },
  { endpoint: "/api/bootstrap" }
];
async function checkPublicBoundary(origin, retryDelayMs = RETRY_DELAY_MS) {
  if (!isHostedAppOrigin(origin)) {
    return BOUNDARY_CHECKS.map(({ endpoint }) => ({ endpoint, pass: false, reason: "untrusted-origin" }));
  }
  if (origin === "https://worldmonitor.app") origin = "https://www.worldmonitor.app";
  let sessionToken = null;
  try {
    sessionToken = (await issueSessionToken()).token;
  } catch {
  }
  const headers = {
    Origin: "https://worldmonitor.app",
    "User-Agent": "WorldMonitor-SeedContractProbe/1.0"
  };
  if (sessionToken) headers["X-WorldMonitor-Key"] = sessionToken;
  return Promise.all(
    BOUNDARY_CHECKS.map(
      (check) => withRetry(() => probeBoundaryOnce(origin, check, headers), retryDelayMs)
    )
  );
}
async function probeBoundaryOnce(origin, { endpoint, requireSourceHeader }, headers) {
  try {
    const r = await fetch(`${origin}${endpoint}`, {
      // The edge runtime refuses `redirect: 'error'` outright — fetch throws a
      // TypeError before the request leaves the function, which fails BOTH
      // boundary checks and 503s the probe on every poll. 'manual' is the
      // supported way to not follow a redirect; we enforce the same guarantee
      // by rejecting any 3xx ourselves, so credentials never chase a Location.
      redirect: "manual",
      signal: AbortSignal.timeout(5e3),
      headers
    });
    if (r.type === "opaqueredirect" || r.status >= 300 && r.status < 400) {
      return { endpoint, pass: false, status: r.status, reason: "redirect" };
    }
    const text = await r.text();
    if (/"_seed"\s*:/.test(text)) {
      return { endpoint, pass: false, status: r.status, reason: "seed-leak" };
    }
    if (!r.ok) return { endpoint, pass: false, status: r.status, reason: `status:${r.status}` };
    if (requireSourceHeader) {
      const actual = r.headers.get(requireSourceHeader.name);
      if ((actual ?? "").toLowerCase() !== requireSourceHeader.value.toLowerCase()) {
        return {
          endpoint,
          pass: false,
          status: r.status,
          reason: `source:${actual ?? "missing"}!=${requireSourceHeader.value}`
        };
      }
    }
    return { endpoint, pass: true, status: r.status };
  } catch (err) {
    return { endpoint, pass: false, reason: `fetch:${errMessage(err)}` };
  }
}
async function handler(req) {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
  try {
    const secret = req.headers.get("x-probe-secret") ?? "";
    const expected = process.env.RELAY_SHARED_SECRET;
    if (!expected) return jsonResponse({ error: "not-configured" }, 503, cors);
    if (!await timingSafeEqual(secret, expected)) {
      return jsonResponse({ error: "unauthorized" }, 401, cors);
    }
    const [checks, boundary] = await Promise.all([
      Promise.all(DEFAULT_PROBES.map((spec) => withRetry(() => checkProbe(spec)))),
      checkPublicBoundary((process.env.WORLDMONITOR_PUBLIC_BASE_URL ?? "https://www.worldmonitor.app").replace(/\/+$/, ""))
    ]);
    const passedKeys = checks.filter((c) => c.pass).length;
    const failedKeys = checks.length - passedKeys;
    const passedBoundary = boundary.filter((b) => b.pass).length;
    const failedBoundary = boundary.length - passedBoundary;
    const recovered = [...checks, ...boundary].filter((r) => r.recovered).length;
    const ok = failedKeys === 0 && failedBoundary === 0;
    return jsonResponse({
      ok,
      summary: {
        probes: { passed: passedKeys, failed: failedKeys, total: checks.length },
        boundary: { passed: passedBoundary, failed: failedBoundary, total: boundary.length },
        recovered
      },
      checks,
      boundary,
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    }, ok ? 200 : 503, cors);
  } catch (err) {
    return jsonResponse({ ok: false, error: `probe-exception:${errMessage(err)}` }, 503, cors);
  }
}
export {
  DEFAULT_PROBES,
  checkProbe,
  checkPublicBoundary,
  config,
  handler as default,
  withRetry
};
