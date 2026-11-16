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
function base64UrlToBytes(s) {
  const pad = (4 - s.length % 4) % 4;
  const b64 = (s + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function base64UrlToString(s) {
  const bytes = base64UrlToBytes(s);
  return new TextDecoder().decode(bytes);
}
function isSessionTokenShape(token) {
  return typeof token === "string" && token.startsWith(PREFIX);
}
async function validateSessionToken(token) {
  if (!isSessionTokenShape(token)) return false;
  const tail = token.slice(PREFIX.length);
  const dot = tail.indexOf(".");
  if (dot < 0) return false;
  const body = tail.slice(0, dot);
  const sig = tail.slice(dot + 1);
  if (!body || !sig) return false;
  let key;
  try {
    key = await importHmacKey();
  } catch {
    return false;
  }
  let expectedBuf;
  try {
    expectedBuf = await crypto.subtle.sign("HMAC", key, enc.encode(body));
  } catch {
    return false;
  }
  let providedBytes;
  try {
    providedBytes = base64UrlToBytes(sig);
  } catch {
    return false;
  }
  if (bufferToBase64Url(providedBytes.buffer) !== sig) return false;
  const expected = new Uint8Array(expectedBuf);
  if (expected.length !== providedBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ providedBytes[i];
  if (diff !== 0) return false;
  let payload2;
  try {
    payload2 = JSON.parse(base64UrlToString(body));
  } catch {
    return false;
  }
  if (typeof payload2.exp !== "number") return false;
  if (!Number.isFinite(payload2.exp)) return false;
  if (Date.now() >= payload2.exp) return false;
  return true;
}

// api/_crypto.js
function getOperatorKeys() {
  return (process.env.WORLDMONITOR_VALID_KEYS || "").split(",").map((k) => k.trim()).filter(Boolean);
}
async function timingSafeIncludes(candidate, validKeys) {
  if (typeof candidate !== "string" || !candidate || !Array.isArray(validKeys) || !validKeys.length || validKeys.some((key) => typeof key !== "string")) {
    return false;
  }
  const enc2 = new TextEncoder();
  const candidateHash = await crypto.subtle.digest("SHA-256", enc2.encode(candidate));
  const candidateBytes = new Uint8Array(candidateHash);
  let found = false;
  for (const k of validKeys) {
    const kHash = await crypto.subtle.digest("SHA-256", enc2.encode(k));
    const kBytes = new Uint8Array(kHash);
    let diff = 0;
    for (let i = 0; i < kBytes.length; i++) diff |= candidateBytes[i] ^ kBytes[i];
    if (diff === 0) found = true;
  }
  return found;
}

// api/_api-key.js
var USER_API_KEY_GATEWAY_VALIDATION_ERROR = "User API key requires gateway validation";
var DESKTOP_ORIGIN_PATTERNS = [
  /^https?:\/\/tauri\.localhost(:\d+)?$/,
  /^https?:\/\/[a-z0-9-]+\.tauri\.localhost(:\d+)?$/i,
  /^tauri:\/\/localhost$/,
  /^asset:\/\/localhost$/
];
function isDesktopOrigin(origin) {
  return Boolean(origin) && DESKTOP_ORIGIN_PATTERNS.some((p) => p.test(origin));
}
function getHeaderApiKey(req) {
  return req.headers.get("X-WorldMonitor-Key") || req.headers.get("X-Api-Key") || "";
}
async function isValidEnterpriseKey(key) {
  if (!key) return false;
  const validKeys = getOperatorKeys();
  return timingSafeIncludes(key, validKeys);
}
async function validateCredential(key, forceKey) {
  if (isSessionTokenShape(key)) {
    if (forceKey) {
      return { valid: false, required: true, error: "Pro authentication required" };
    }
    if (await validateSessionToken(key)) {
      return { valid: true, required: false, kind: "session" };
    }
    return { valid: false, required: true, error: "Invalid session token" };
  }
  if (key && await isValidEnterpriseKey(key)) {
    return { valid: true, required: true, kind: "enterprise", credential: key };
  }
  if (key && key.startsWith("wm_")) {
    return { valid: false, required: true, error: USER_API_KEY_GATEWAY_VALIDATION_ERROR };
  }
  if (key) {
    return { valid: false, required: true, error: "Invalid API key" };
  }
  return { valid: false, required: true, error: "API key required" };
}
var MAX_COOKIE_CANDIDATES = 4;
function getCookies(req, name) {
  const raw = req.headers.get("Cookie") || req.headers.get("cookie") || "";
  if (!raw) return [];
  const prefix = `${name}=`;
  const values = [];
  for (const part of raw.split(";")) {
    if (values.length >= MAX_COOKIE_CANDIDATES) break;
    const trimmed = part.trim();
    if (!trimmed.startsWith(prefix)) continue;
    let value;
    try {
      value = decodeURIComponent(trimmed.slice(prefix.length));
    } catch {
      value = trimmed.slice(prefix.length);
    }
    if (value) values.push(value);
  }
  return values;
}
function getCookie(req, name) {
  return getCookies(req, name)[0] || "";
}
async function validateSessionCookies(sessionCookies, forceKey) {
  let firstResult = null;
  for (const cookie of sessionCookies) {
    const result = await validateCredential(cookie, forceKey);
    if (result.valid) return result;
    firstResult ??= result;
  }
  return firstResult;
}
async function validateApiKey(req, options = {}) {
  const forceKey = options.forceKey === true;
  const headerKey = getHeaderApiKey(req);
  const sessionCookies = getCookies(req, "wm-session");
  const testerCookies = [getCookie(req, "__Host-wm-pro-key"), getCookie(req, "__Host-wm-widget-key")].filter(Boolean);
  const origin = req.headers.get("Origin") || "";
  if (isDesktopOrigin(origin)) {
    if (!headerKey) return { valid: false, required: true, error: "API key required for desktop access" };
    if (!await isValidEnterpriseKey(headerKey)) return { valid: false, required: true, error: "Invalid API key" };
    return { valid: true, required: true, kind: "enterprise", credential: headerKey };
  }
  if (headerKey && !isSessionTokenShape(headerKey)) {
    return validateCredential(headerKey, forceKey);
  }
  for (const testerCookie of testerCookies) {
    if (await isValidEnterpriseKey(testerCookie)) {
      return { valid: true, required: true, kind: "enterprise", credential: testerCookie };
    }
  }
  if (headerKey) return validateCredential(headerKey, forceKey);
  if (sessionCookies.length) return validateSessionCookies(sessionCookies, forceKey);
  if (testerCookies.length) return { valid: false, required: true, error: "Invalid API key" };
  return { valid: false, required: true, error: "API key required" };
}

// api/_pool-coverage.js
var PREDICTION_MARKET_MIN_POOL_COUNTS = Object.freeze({
  geopolitical: 1,
  tech: 1,
  finance: 1
});
function parsePoolCounts(value, minimums) {
  if (!minimums || !value || typeof value !== "object" || Array.isArray(value)) return null;
  const counts = {};
  for (const pool of Object.keys(minimums)) {
    const count = value[pool];
    if (!Number.isSafeInteger(count) || count < 0) return null;
    counts[pool] = count;
  }
  return counts;
}
function hasPoolCoverageShortfall(counts, minimums) {
  if (!minimums) return false;
  if (!counts) return true;
  return Object.entries(minimums).some(([pool, minimum]) => {
    const count = counts[pool];
    return !Number.isSafeInteger(count) || count < minimum;
  });
}
function poolCoverageMargins(counts, minimums, marginThreshold) {
  if (!minimums || !counts || typeof counts !== "object" || Array.isArray(counts)) return null;
  if (!Number.isSafeInteger(marginThreshold) || marginThreshold < 0) return null;
  const margins = {};
  for (const [pool, floor] of Object.entries(minimums)) {
    const count = counts[pool];
    if (!Number.isSafeInteger(count) || !Number.isSafeInteger(floor)) return null;
    const margin = count - floor;
    margins[pool] = { count, floor, margin, low: margin < marginThreshold };
  }
  return margins;
}

// api/_rankable-coverage.js
var EDUCATION_MIN_RANKABLE_RECORD_COUNT = 180;
var SUPPLY_VULNERABILITY_MIN_RANKABLE_RECORD_COUNT = 220;
var RANKABLE_COUNTRY_CODES = new Set(
  "AF,AL,DZ,AD,AO,AG,AR,AM,AU,AT,AZ,BS,BH,BD,BB,BY,BE,BZ,BJ,BT,BO,BA,BW,BR,BN,BG,BF,BI,CV,KH,CM,CA,CF,TD,CL,CN,CO,KM,CG,CD,CR,CI,HR,CU,CY,CZ,DK,DJ,DM,DO,EC,EG,SV,GQ,ER,EE,SZ,ET,FJ,FI,FR,GA,GM,GE,DE,GH,GR,GD,GT,GN,GW,GY,HT,HN,HU,IS,IN,ID,IR,IQ,IE,IL,IT,JM,JP,JO,KZ,KE,KI,KP,KR,KW,KG,LA,LV,LB,LS,LR,LY,LI,LT,LU,MG,MW,MY,MV,ML,MT,MH,MR,MU,MX,FM,MD,MC,MN,ME,MA,MZ,MM,NA,NR,NP,NL,NZ,NI,NE,NG,MK,NO,OM,PK,PW,PA,PG,PY,PE,PH,PL,PT,QA,RO,RU,RW,KN,LC,VC,WS,SM,ST,SA,SN,RS,SC,SL,SG,SK,SI,SB,SO,ZA,SS,ES,LK,SD,SR,SE,CH,SY,TJ,TZ,TH,TL,TG,TO,TT,TN,TR,TM,TV,UG,UA,AE,GB,US,UY,UZ,VU,VE,VN,YE,ZM,ZW,HK,MO,TW".split(",")
);
function isRankableCountryCode(value) {
  return typeof value === "string" && RANKABLE_COUNTRY_CODES.has(value);
}
function parseRankableRecordCount(meta) {
  if (meta == null || typeof meta !== "object" || Array.isArray(meta)) return null;
  const rawCount = meta.rankableRecordCount;
  if (rawCount !== null && rawCount !== "" && typeof rawCount !== "boolean") {
    const numericCount = Number(rawCount);
    if (Number.isSafeInteger(numericCount) && numericCount >= 0) return numericCount;
  }
  if (typeof meta.countrySet !== "string" || meta.countrySet.length === 0) return null;
  const codes = meta.countrySet.split(",").map((code) => code.trim());
  if (codes.length === 0 || codes.some((code) => !isRankableCountryCode(code))) return null;
  return new Set(codes).size;
}
function parseEducationPayloadRankableRecordCount(payload2) {
  if (payload2 == null || typeof payload2 !== "object" || Array.isArray(payload2)) return null;
  const countries = payload2.countries;
  if (countries == null || typeof countries !== "object" || Array.isArray(countries)) return null;
  let count = 0;
  for (const [countryCode, record] of Object.entries(countries)) {
    if (!isRankableCountryCode(countryCode) || record == null || typeof record !== "object" || Array.isArray(record)) continue;
    const value = record.value;
    const year = record.year;
    if (typeof value === "number" && Number.isFinite(value) && value >= 0 && value <= 100 && typeof year === "number" && Number.isSafeInteger(year) && year >= 1900 && year <= 2200) {
      count += 1;
    }
  }
  return count;
}

// api/_cii-input-health.js
var INPUTS = {
  acled: { maxQuietMin: 360, sourceCheck: null },
  ucdp: { maxQuietMin: 1440, sourceCheck: "ucdpEvents" },
  gdeltCountryEvents: { maxQuietMin: 720, sourceCheck: "gdeltCountryEvents" },
  iranEvents: { maxQuietMin: null, sourceCheck: "iranEvents" },
  strikePressure: { maxQuietMin: null, sourceCheck: "strikePressure" },
  oref: { maxQuietMin: null, sourceCheck: null, missingIsQuiet: true },
  outages: { maxQuietMin: null, sourceCheck: "outages" },
  climate: { maxQuietMin: null, sourceCheck: "climateAnomalies" },
  fires: { maxQuietMin: 1440, sourceCheck: "wildfiresSummary" },
  gpsjam: { maxQuietMin: 720, sourceCheck: "gpsjam" },
  advisories: { maxQuietMin: 1440, sourceCheck: null },
  displacement: { maxQuietMin: 1440, sourceCheck: null },
  crossBorder: { maxQuietMin: null, sourceCheck: null },
  newsInsights: { maxQuietMin: 360, sourceCheck: "newsInsights" },
  threatSummary: { maxQuietMin: 360, sourceCheck: "newsThreatSummary" },
  aviation: { maxQuietMin: null, sourceCheck: "flightDelays" },
  earthquakes: { maxQuietMin: null, sourceCheck: "earthquakes" },
  sanctionsPressure: { maxQuietMin: 1440, sourceCheck: "sanctionsPressure" },
  sanctionsCounts: { maxQuietMin: 1440, sourceCheck: null },
  militaryCii: { maxQuietMin: 720, sourceCheck: "militaryCii" }
};
var FAMILIES = {
  conflict: ["acled", "gdeltCountryEvents"],
  information: ["newsInsights", "threatSummary"],
  security: ["militaryCii", "gpsjam", "aviation"]
};
var CII_INPUT_POLICY = Object.freeze({
  inputs: Object.freeze(Object.fromEntries(Object.entries(INPUTS).map(([id, cfg]) => [id, Object.freeze(cfg)]))),
  families: Object.freeze(Object.fromEntries(Object.entries(FAMILIES).map(([id, members]) => [id, Object.freeze(members)])))
});
var PRODUCER_STATES = /* @__PURE__ */ new Set(["live", "quiet", "missing", "unusable", "not_configured"]);
var STALE_SOURCE_STATUSES = /* @__PURE__ */ new Set(["STALE_SEED"]);
var QUIET_CLOCK_SKEW_MS = 5 * 6e4;
function assessCiiInputs(meta, now, sourceStatuses = {}) {
  const reported = meta && typeof meta === "object" && meta.inputs && typeof meta.inputs === "object" && !Array.isArray(meta.inputs) ? meta.inputs : null;
  const states = {};
  const dead = [];
  const notConfigured = [];
  const healthy = /* @__PURE__ */ new Set();
  for (const [id, cfg] of Object.entries(CII_INPUT_POLICY.inputs)) {
    const report = reported?.[id];
    const state = report && PRODUCER_STATES.has(report.state) ? report.state : "unreported";
    const sourceCheck = cfg.sourceCheck && STALE_SOURCE_STATUSES.has(sourceStatuses[id]) ? cfg.sourceCheck : null;
    states[id] = state;
    if (state === "not_configured") {
      notConfigured.push(id);
    } else if (state === "missing" && cfg.missingIsQuiet) {
      healthy.add(id);
    } else if (state === "missing" || state === "unusable" || state === "unreported") {
      dead.push({ id, state });
    } else if (sourceCheck) {
      states[id] = "stale";
      dead.push({ id, state: "stale", sourceCheck });
    } else if (state === "quiet") {
      const quietSince = Number(report.quietSince);
      const quietMin = Number.isFinite(quietSince) && quietSince > 0 && quietSince <= now + QUIET_CLOCK_SKEW_MS ? Math.max(0, Math.floor((now - quietSince) / 6e4)) : null;
      if (quietMin === null) dead.push({ id, state });
      else if (cfg.maxQuietMin != null && quietMin > cfg.maxQuietMin) dead.push({ id, state, quietMin });
      else healthy.add(id);
    } else {
      healthy.add(id);
    }
  }
  const unfedFamilies = Object.entries(CII_INPUT_POLICY.families).filter(([, members]) => !members.some((id) => healthy.has(id))).map(([family]) => family);
  return { valid: reported !== null, states, dead, notConfigured, unfedFamilies };
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
function getRedisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}
function readExistsFlags(results, keys) {
  const states = /* @__PURE__ */ new Map();
  if (!Array.isArray(results) || results.length !== keys.length) return states;
  for (let i = 0; i < keys.length; i++) {
    const entry = results[i];
    if (!entry || typeof entry !== "object" || Array.isArray(entry) || Object.prototype.hasOwnProperty.call(entry, "error") || !Object.prototype.hasOwnProperty.call(entry, "result")) {
      continue;
    }
    if (entry.result === 1 || entry.result === "1") states.set(keys[i], true);
    else if (entry.result === 0 || entry.result === "0") states.set(keys[i], false);
  }
  return states;
}
function normalizePipelineCommand(command, raw) {
  if (raw || !Array.isArray(command) || command.length < 2) return [...command];
  const [verb, key, ...rest] = command;
  if (typeof verb !== "string" || typeof key !== "string") return [...command];
  if (verb.toUpperCase() === "EVAL") {
    const keyCount = Number(rest[0]);
    if (!Number.isInteger(keyCount) || keyCount < 0 || rest.length < keyCount + 1) return [...command];
    const keys = rest.slice(1, keyCount + 1).map((item) => typeof item === "string" ? applyRedisKeyPrefix(item) : item);
    return [verb, key, rest[0], ...keys, ...rest.slice(keyCount + 1)];
  }
  return [verb, applyRedisKeyPrefix(key), ...rest];
}
async function redisPipeline(commands, timeoutMs = 5e3, raw = false) {
  const creds = getRedisCredentials();
  if (!creds) return null;
  if (!Array.isArray(commands)) return null;
  try {
    const resp = await fetch(`${creds.url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.token}`,
        "Content-Type": "application/json",
        "User-Agent": "worldmonitor-edge/1.0"
      },
      body: JSON.stringify(commands.map((command) => normalizePipelineCommand(command, raw))),
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!resp.ok) return null;
    const entries = await resp.json();
    if (!Array.isArray(entries) || entries.length !== commands.length) return null;
    return entries;
  } catch {
    return null;
  }
}

// api/_redis-key-ownership.js
var APP_OWNED_KEYS = Object.freeze([
  // Written solely by Vercel RPC routes through the prefix-aware server
  // helpers (setCachedJson / cachedFetchJson / runRedisPipeline with
  // raw = false), so the snapshot and its freshness stamp live in the
  // deployment's own namespace on preview. The Railway CII/chokepoint
  // warm-pings only hit the routes over HTTP — they never write these keys
  // to Redis directly (scripts/ais-relay.cjs: "The RPC handler owns
  // seed-meta:intelligence:risk-scores").
  "temporal:anomalies:v1",
  // infrastructure/v1/list-temporal-anomalies
  "seed-meta:temporal:anomalies",
  "risk:scores:sebuf:v14",
  // intelligence/v1/get-risk-scores (live + stale fallback + meta)
  "risk:scores:sebuf:stale:v14",
  "risk:scores:sebuf:rejected:v14",
  "seed-meta:intelligence:risk-scores",
  "risk:scores:history:index",
  "seed-meta:intelligence:risk-scores-history",
  "seed-activated:intelligence:risk-scores-history",
  "supply_chain:chokepoints:v4",
  // supply-chain/v1/get-chokepoint-status (+ meta)
  "seed-meta:supply_chain:chokepoints",
  "cable-health-v1",
  // infrastructure/v1/get-cable-health (+ meta)
  "seed-meta:cable-health"
]);
var APP_OWNED_KEY_SET = new Set(APP_OWNED_KEYS);
function isAppOwnedRedisKey(key) {
  return typeof key === "string" && (APP_OWNED_KEY_SET.has(key) || /^risk:scores:history:[A-Z]{2}$/.test(key));
}

// api/_cii-risk-cache-keys.js
var CII_RISK_SCORE_CACHE_KEYS = Object.freeze({
  live: "risk:scores:sebuf:v14",
  stale: "risk:scores:sebuf:stale:v14",
  trendHistoryPrefix: "risk:scores:sebuf:trend-history:v14",
  dailyHistoryPrefix: "risk:scores:history:",
  dailyHistoryIndex: "risk:scores:history:index",
  dailyHistoryMeta: "seed-meta:intelligence:risk-scores-history",
  dailyHistoryActivation: "seed-activated:intelligence:risk-scores-history"
});

// api/_bootstrap-tier-keys.js
var BOOTSTRAP_CACHE_KEYS = Object.freeze({
  ukmtoIncidents: "maritime:ukmto-incidents:v1",
  earthquakes: "seismology:earthquakes:v1",
  outages: "infra:outages:v1",
  serviceStatuses: "infra:service-statuses:v1",
  ddosAttacks: "cf:radar:ddos:v1",
  trafficAnomalies: "cf:radar:traffic-anomalies:v1",
  marketQuotes: "market:stocks-bootstrap:v1",
  commodityQuotes: "market:commodities-bootstrap:v1",
  sectors: "market:sectors:v2",
  etfFlows: "market:etf-flows:v1",
  macroSignals: "economic:macro-signals:v1",
  bisPolicy: "economic:bis:policy:v1",
  bisExchange: "economic:bis:eer:v1",
  bisCredit: "economic:bis:credit:v1",
  bisDsr: "economic:bis:dsr:v1",
  bisPropertyResidential: "economic:bis:property-residential:v1",
  bisPropertyCommercial: "economic:bis:property-commercial:v1",
  imfMacro: "economic:imf:macro:v2",
  imfGrowth: "economic:imf:growth:v1",
  imfLabor: "economic:imf:labor:v1",
  imfExternal: "economic:imf:external:v1",
  chinaMacro: "economic:china:macro:v2",
  chinaReleaseCalendar: "economic:china:release-calendar:v1",
  chinaCorporateDisclosures: "market:china:corporate-disclosures:v1",
  chinaPolicyEvents: "china:policy-events:v1",
  chinaDecisionSignals: "intelligence:china-decision-signals:v1",
  shippingRates: "supply_chain:shipping:v2",
  chokepoints: "supply_chain:chokepoints:v4",
  minerals: "supply_chain:minerals:v2",
  giving: "giving:summary:v2",
  climateAnomalies: "climate:anomalies:v2",
  climateDisasters: "climate:disasters:v1",
  co2Monitoring: "climate:co2-monitoring:v1",
  oceanIce: "climate:ocean-ice:v1",
  climateNews: "climate:news-intelligence:v1",
  radiationWatch: "radiation:observations:v1",
  thermalEscalation: "thermal:escalation-bootstrap:v1",
  crossSourceSignals: "intelligence:cross-source-signals:v1",
  wildfires: "wildfire:fires-bootstrap:v1",
  cyberThreats: "cyber:threats-bootstrap:v2",
  techReadiness: "economic:worldbank-techreadiness:v1",
  progressData: "economic:worldbank-progress:v1",
  renewableEnergy: "economic:worldbank-renewable:v1",
  positiveGeoEvents: "positive_events:geo-bootstrap:v1",
  theaterPosture: "theater_posture:sebuf:stale:v1",
  riskScores: "risk:scores:sebuf:stale:v14",
  naturalEvents: "natural:events:v1",
  flightDelays: "aviation:delays-bootstrap:v2",
  insights: "news:insights:v1",
  predictions: "prediction:markets-bootstrap:v1",
  cryptoQuotes: "market:crypto:v1",
  cryptoSectors: "market:crypto-sectors:v1",
  defiTokens: "market:defi-tokens:v1",
  aiTokens: "market:ai-tokens:v1",
  otherTokens: "market:other-tokens:v1",
  gulfQuotes: "market:gulf-quotes:v1",
  stablecoinMarkets: "market:stablecoins:v1",
  unrestEvents: "unrest:events:v1",
  iranEvents: "conflict:iran-events:v1",
  ucdpEvents: "conflict:ucdp-events-bootstrap:v1",
  temporalAnomalies: "temporal:anomalies:v1",
  weatherAlerts: "weather:alerts:v1",
  imdCycloneMarine: "weather:imd-cyclone-marine:v1",
  notamAirspace: "aviation:notam:airspace:v1",
  liveVideoResolved: "live-video:resolved:v1",
  crossBorderArrivals: "displacement:cross-border:v1",
  idmcIduDisplacement: "displacement:idmc-idu:v1",
  canadaRoads: "infra:ontario-511:v1",
  albertaRoads: "infra:alberta-511:v1",
  manitobaRoads: "infra:manitoba-511:v1",
  torontoRoads: "infra:toronto-roads:v1",
  bcOpen511: "infra:bc-open511:v1",
  canadaAlerts: "alerts:canada:v1",
  spending: "economic:spending:v1",
  techEvents: "research:tech-events-bootstrap:v1",
  gdeltIntel: "intelligence:gdelt-intel:v1",
  correlationCards: "correlation:cards-bootstrap:v1",
  crossStraitActivity: "military:cross-strait-activity-bootstrap:v1",
  forecasts: "forecast:predictions-bootstrap:v1",
  securityAdvisories: "intelligence:advisories-bootstrap:v1",
  customsRevenue: "trade:customs-revenue:v1",
  sanctionsPressure: "sanctions:pressure:v1",
  consumerPricesOverview: "consumer-prices:overview:ae",
  consumerPricesCategories: "consumer-prices:categories:ae:30d",
  consumerPricesMovers: "consumer-prices:movers:ae:30d",
  consumerPricesSpread: "consumer-prices:retailer-spread:ae:essentials-ae",
  groceryBasket: "economic:grocery-basket:v1",
  bigmac: "economic:bigmac:v1",
  fuelPrices: "economic:fuel-prices:v1",
  faoFoodPriceIndex: "economic:fao-ffpi:v1",
  nationalDebt: "economic:national-debt:v1",
  euGasStorage: "economic:eu-gas-storage:v1",
  eurostatCountryData: "economic:eurostat-country-data:v1",
  eurostatHousePrices: "economic:eurostat:house-prices:v1",
  eurostatGovDebtQ: "economic:eurostat:gov-debt-q:v1",
  eurostatIndProd: "economic:eurostat:industrial-production:v1",
  fearGreedIndex: "market:fear-greed:v1",
  hyperliquidFlow: "market:hyperliquid:flow:v1",
  crudeInventories: "economic:crude-inventories:v1",
  natGasStorage: "economic:nat-gas-storage:v1",
  ecbFxRates: "economic:ecb-fx-rates:v1",
  cbrRates: "economic:cbr-rates:v1",
  fxYoy: "economic:fx:yoy:v1",
  sharedFxRates: "shared:fx-rates:v1",
  euFsi: "economic:fsi-eu:v1",
  shippingStress: "supply_chain:shipping_stress:v1",
  socialVelocity: "intelligence:social:reddit:v1",
  pizzint: "intelligence:pizzint:seed:v1",
  diseaseOutbreaks: "health:disease-outbreaks:v1",
  economicStress: "economic:stress-index:v1",
  electricityPrices: "energy:electricity:v1:index",
  jodiOil: "energy:jodi-oil:v1:_countries",
  chokepointBaselines: "energy:chokepoint-baselines:v1",
  portwatchChokepointsRef: "portwatch:chokepoints:ref:v1",
  portwatchPortActivity: "supply_chain:portwatch-ports:v1:_countries",
  oilStocksAnalysis: "energy:oil-stocks-analysis:v1",
  lngVulnerability: "energy:lng-vulnerability:v1",
  sprPolicies: "energy:spr-policies:v1",
  pipelinesGas: "energy:pipelines:gas:v1",
  pipelinesOil: "energy:pipelines:oil:v1",
  storageFacilities: "energy:storage-facilities:v1",
  fuelShortages: "energy:fuel-shortages:v1",
  energyDisruptions: "energy:disruptions:v1",
  energyCrisisPolicies: "energy:crisis-policies:v1",
  aaiiSentiment: "market:aaii-sentiment:v1",
  breadthHistory: "market:breadth-history:v1",
  marketCorrelationSeries: "market:correlation-series:v1"
});
var SLOW_KEY_NAMES = /* @__PURE__ */ new Set([
  "bisPolicy",
  "bisExchange",
  "bisCredit",
  "chinaMacro",
  "chinaReleaseCalendar",
  "chinaCorporateDisclosures",
  "minerals",
  "giving",
  "sectors",
  "etfFlows",
  "wildfires",
  "climateAnomalies",
  "climateDisasters",
  "co2Monitoring",
  "oceanIce",
  "climateNews",
  "radiationWatch",
  "thermalEscalation",
  "crossSourceSignals",
  "crossStraitActivity",
  "techReadiness",
  "progressData",
  "renewableEnergy",
  "naturalEvents",
  "cryptoQuotes",
  "cryptoSectors",
  "defiTokens",
  "aiTokens",
  "otherTokens",
  "gulfQuotes",
  "stablecoinMarkets",
  "unrestEvents",
  "ucdpEvents",
  "techEvents",
  "securityAdvisories",
  "customsRevenue",
  "sanctionsPressure",
  "consumerPricesOverview",
  "consumerPricesCategories",
  "consumerPricesMovers",
  "consumerPricesSpread",
  "groceryBasket",
  "bigmac",
  "fuelPrices",
  "faoFoodPriceIndex",
  "nationalDebt",
  "euGasStorage",
  "eurostatCountryData",
  "fearGreedIndex",
  "hyperliquidFlow",
  "crudeInventories",
  "natGasStorage",
  "ecbFxRates",
  "euFsi",
  "diseaseOutbreaks",
  "economicStress",
  "pizzint",
  "oilStocksAnalysis",
  "lngVulnerability",
  "fuelShortages",
  "energyCrisisPolicies",
  "aaiiSentiment",
  "breadthHistory"
]);
var FAST_KEY_NAMES = /* @__PURE__ */ new Set([
  "earthquakes",
  "outages",
  "serviceStatuses",
  "ddosAttacks",
  "trafficAnomalies",
  "macroSignals",
  "chokepoints",
  "marketQuotes",
  "commodityQuotes",
  "positiveGeoEvents",
  "riskScores",
  "insights",
  "predictions",
  "iranEvents",
  "temporalAnomalies",
  "weatherAlerts",
  "spending",
  "theaterPosture",
  "gdeltIntel",
  "canadaAlerts",
  "shippingRates",
  "shippingStress",
  "socialVelocity"
]);
var ON_DEMAND_KEY_NAMES = /* @__PURE__ */ new Set([
  "ukmtoIncidents",
  "cyberThreats",
  "chinaPolicyEvents",
  "chinaDecisionSignals",
  "bisDsr",
  "bisPropertyResidential",
  "bisPropertyCommercial",
  // One row of this feeds the Central Banks tab's policy-rate list, which BIS
  // cannot supply for Russia. On-demand rather than tiered: the tab fetches it
  // through the credential-less per-key URL when it renders, so the ~8KB never
  // rides a payload every visitor downloads.
  "cbrRates",
  "imfMacro",
  "imfGrowth",
  "imfLabor",
  "imfExternal",
  "eurostatHousePrices",
  "eurostatGovDebtQ",
  "eurostatIndProd",
  "electricityPrices",
  "jodiOil",
  "chokepointBaselines",
  "portwatchChokepointsRef",
  "portwatchPortActivity",
  "sprPolicies",
  "energyDisruptions",
  // Oil/gas pipeline and storage registries. Previously slow-tier freight:
  // every visitor downloaded ~528 KB decoded even when the map layers were
  // off (full/happy defaults) and the panels were below the fold. Demand
  // comes from an enabled layer or a near-viewport energy panel (#7046).
  "pipelinesGas",
  "pipelinesOil",
  "storageFacilities",
  // Flights layer ships disabled on every variant, so this never rendered
  // from the fast payload for a default visitor.
  "flightDelays",
  // The minimum further FAST demotion needed by #7046. Both consumers are
  // demand-gated and read the credential-less per-key URL. Putting them in
  // SLOW would erase the energy-registry reduction; moving additional FAST
  // keys would add default-startup requests after the 20% target is met.
  "forecasts",
  "correlationCards",
  // Both back the opt-in FX panel (#6199). On-demand rather than tiered
  // because that panel ships disabled by default: neither payload should ride
  // a tier every visitor downloads to render a surface almost nobody has on.
  // NOTE: no apostrophes in this block. scripts/docs-stats.mjs scans these
  // Sets with a bare quote matcher, so one apostrophe in prose opens a phantom
  // string and gets registered as a duplicate key.
  "fxYoy",
  "sharedFxRates",
  "marketCorrelationSeries",
  // Toronto's live road-restrictions snapshot is about 2 MB. Keep it off the
  // global FAST payload and fetch it only when the Canada-roads layer renders.
  "torontoRoads",
  // DriveBC is also too large for every visitor's startup payload.
  "bcOpen511",
  // The other two feeds behind the same map layer, moved off FAST in #6763.
  // Together they were 507,639 of the fast tier's 1,343,003 bytes — 37.8%, more
  // than marketQuotes — and a tier is not layer-gated, so every visitor on every
  // variant downloaded them, mobile included, where this layer ships disabled
  // and nothing ever rendered a byte of it.
  //
  // All five road sources are on-demand now, which is what lets the layer stay
  // off by default: with none of them tiered, a visitor who never enables
  // Canada roads pays nothing at all for them.
  "canadaRoads",
  "albertaRoads",
  "manitobaRoads",
  // IMD cyclone/port/coastal/marine products (#7005). On-demand: the weather
  // and natural layers fetch this key only when those layers are on, so it
  // never rides a payload every visitor downloads.
  "imdCycloneMarine",
  // FAA NMS airspace restrictions (TFRs, restricted/danger/prohibited areas),
  // ~1.5 MB. On-demand: fetched only when the NOTAM airspace layer is on.
  "notamAirspace",
  // The video each catalog YouTube channel has live now (#8545), fetched by the
  // live video players at play intent and only for slots that list a channel.
  // The get-bootstrap-data RPC also serves any registered key by name, so the
  // payload stays minimal: channel id to video id and timestamps, no titles,
  // enforced by validateResolvedPayload in scripts/seed-live-video-resolved.mjs.
  "liveVideoResolved",
  // Legacy ODP bootstrap/widget contract. The dashboard uses the source-dated
  // movement RPC; retain this on-demand key until legacy clients migrate.
  "crossBorderArrivals",
  // IDMC internal displacement events (#9014), about 2.5 MB, read by the
  // displacement panel and map layer only when they are open.
  "idmcIduDisplacement"
]);
function tierForKey(name) {
  if (FAST_KEY_NAMES.has(name)) return "fast";
  if (SLOW_KEY_NAMES.has(name)) return "slow";
  if (ON_DEMAND_KEY_NAMES.has(name)) return "on-demand";
  throw new Error(`Bootstrap cache key "${name}" has no tier assignment`);
}
var BOOTSTRAP_TIERS = Object.freeze(Object.fromEntries(
  Object.keys(BOOTSTRAP_CACHE_KEYS).map((name) => [name, tierForKey(name)])
));

// api/_canada-alerts-cutover.js
var CANADA_ALERTS_SIBLING_KEY = "alerts:canada:alberta-aea:v1";
var CANADA_ALERTS_LEGACY_KEY = "alerts:alberta-aea:v1";
var CANADA_ALERTS_CUTOVER_FALLBACK_KEYS = Object.freeze([
  CANADA_ALERTS_SIBLING_KEY,
  CANADA_ALERTS_LEGACY_KEY
]);

// api/_china-decision-health.js
function projectChinaDecisionGroupDiagnostics(meta, { groupIds = [], allowedStates, healthyQuietCause }) {
  const states = meta?.groupStates;
  const counts = meta?.groupCounts;
  if (!Array.isArray(groupIds) || groupIds.length === 0 || !states || typeof states !== "object" || Array.isArray(states) || !counts || typeof counts !== "object" || Array.isArray(counts)) return null;
  const stateSet = allowedStates instanceof Set ? allowedStates : /* @__PURE__ */ new Set(["available", "partial", "stale", "unavailable"]);
  const groupStates = Object.fromEntries(
    groupIds.map((groupId) => [groupId, states[groupId]])
  );
  if (Object.values(groupStates).some((state) => !stateSet.has(state)) || !["populated", "partial", "stale", "unavailable", "healthyQuiet", "operationallyCovered"].every(
    (key) => Number.isInteger(counts[key]) && counts[key] >= 0 && counts[key] <= groupIds.length
  )) return null;
  const unavailableCauses = meta?.unavailableCauses;
  const causeOf = (groupId) => unavailableCauses && typeof unavailableCauses === "object" && !Array.isArray(unavailableCauses) && typeof unavailableCauses[groupId] === "string" ? unavailableCauses[groupId].slice(0, 40) : "unknown";
  const quietGroups = [];
  const partialGroups = [];
  const staleGroups = [];
  const unavailableGroups = [];
  for (const groupId of groupIds) {
    const state = groupStates[groupId];
    if (state === "partial") partialGroups.push(groupId);
    if (state === "stale") staleGroups.push(groupId);
    if (state !== "unavailable") continue;
    if (causeOf(groupId) === healthyQuietCause) quietGroups.push(groupId);
    else {
      unavailableGroups.push({ id: groupId, unavailableCause: causeOf(groupId) });
    }
  }
  const expectedCounts = {
    populated: groupIds.filter((groupId) => groupStates[groupId] !== "unavailable").length,
    partial: partialGroups.length,
    stale: staleGroups.length,
    unavailable: quietGroups.length + unavailableGroups.length,
    healthyQuiet: quietGroups.length,
    operationallyCovered: groupIds.length - staleGroups.length - unavailableGroups.length
  };
  if (Object.entries(expectedCounts).some(([key, value]) => counts[key] !== value)) return null;
  const fetchedAt = Number.isSafeInteger(meta?.fetchedAt) && meta.fetchedAt > 0 ? meta.fetchedAt : null;
  const lastSuccessAt = Number.isSafeInteger(meta?.lastDecisionCoverageSuccessAt) && meta.lastDecisionCoverageSuccessAt > 0 ? meta.lastDecisionCoverageSuccessAt : null;
  const legacyLastSuccessAt = expectedCounts.operationallyCovered === groupIds.length && fetchedAt !== null ? fetchedAt : null;
  const coverageLastSuccessAt = lastSuccessAt ?? legacyLastSuccessAt;
  const coverageFailureInvalidReason = coverageLastSuccessAt === null ? "LAST_SUCCESS_MISSING" : fetchedAt === null || coverageLastSuccessAt > fetchedAt ? "LAST_SUCCESS_INVALID" : null;
  return {
    groupStates,
    groupCounts: {
      populated: counts.populated,
      partial: counts.partial,
      stale: counts.stale,
      unavailable: counts.unavailable,
      healthyQuiet: counts.healthyQuiet,
      operationallyCovered: counts.operationallyCovered
    },
    quietGroups,
    partialGroups,
    staleGroups,
    unavailableGroups,
    ...coverageLastSuccessAt !== null ? { coverageLastSuccessAt } : {},
    ...coverageFailureInvalidReason ? { coverageFailureInvalidReason } : {}
  };
}

// api/_content-freshness.js
function hasOwnField(value, field) {
  return value !== null && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, field);
}
function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function nonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}
function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
function entityList(value) {
  return Array.isArray(value) ? value.filter((entity) => typeof entity === "string").slice(0, 40).map((entity) => entity.slice(0, 8)) : [];
}
var PORTWATCH_CONTENT_FRESHNESS_ACTIVATION_KEY = "seed-activated:supply_chain:portwatch-ports:content-freshness";
var CONTENT_FRESHNESS_ROLLOUT = Object.freeze({
  [PORTWATCH_CONTENT_FRESHNESS_ACTIVATION_KEY]: Object.freeze({
    from: "2026-08-03T10:24:42Z",
    until: "2026-08-04T06:00:00Z"
  })
});
var CONTENT_FRESHNESS_ROLLOUT_WINDOWS = new Map(
  Object.entries(CONTENT_FRESHNESS_ROLLOUT).map(([key, window]) => [key, {
    ...window,
    fromMs: Date.parse(window.from),
    untilMs: Date.parse(window.until)
  }])
);
var CONTENT_FRESHNESS_ROLLOUT_UNTIL_MS = Object.freeze(
  Object.fromEntries(
    [...CONTENT_FRESHNESS_ROLLOUT_WINDOWS.entries()].filter(([, window]) => Number.isFinite(window.untilMs)).map(([key, window]) => [key, window.untilMs])
  )
);
function getContentFreshnessActivationWindow(activationKey) {
  const window = CONTENT_FRESHNESS_ROLLOUT_WINDOWS.get(activationKey);
  if (!window || !Number.isFinite(window.fromMs) || !Number.isFinite(window.untilMs)) return null;
  if (window.untilMs <= window.fromMs) return null;
  return window;
}
function getActiveContentFreshnessActivationWindow(activationKey, activationState, now) {
  const window = getContentFreshnessActivationWindow(activationKey);
  return activationState === false && window !== null && Number.isFinite(now) && now >= window.fromMs && now < window.untilMs ? window : null;
}
function buildContentFreshnessAssessment(meta, requirement, now) {
  if (!requirement) return null;
  const block = meta?.contentFreshness;
  const fieldPresent = hasOwnField(meta, "contentFreshness");
  const blockPresent = isPlainObject(block);
  const count = nonNegativeInteger;
  const coveredCount = count(block?.coveredCount);
  const freshCount = count(block?.freshCount);
  const staleCount = count(block?.staleCount);
  const unknownCount = count(block?.unknownCount);
  const criticalCountries = entityList(block?.criticalCountries);
  const criticalFreshCount = count(block?.criticalFreshCount);
  const expectedCountries = Array.isArray(requirement.countries) ? requirement.countries : [];
  const expectedBudgetMinutes = Number(requirement.budgetMinutes);
  const criticalOldestObservedAt = finiteNumber(block?.criticalOldestObservedAt);
  const criticalAgeMs = criticalOldestObservedAt === null || !Number.isFinite(now) ? null : now - criticalOldestObservedAt;
  const criticalAgeMinutes = criticalAgeMs === null ? null : Math.round(criticalAgeMs / 6e4);
  const declaredScopeCoversExpected = expectedCountries.length > 0 && expectedCountries.every((entity) => criticalCountries.includes(entity));
  const unusableReasons = [];
  if (coveredCount === null) unusableReasons.push("covered_count_unusable");
  if (freshCount === null) unusableReasons.push("fresh_count_unusable");
  else if (coveredCount !== null && freshCount > coveredCount) {
    unusableReasons.push("fresh_exceeds_covered");
  }
  if (staleCount === null) unusableReasons.push("stale_count_unusable");
  if (unknownCount === null) unusableReasons.push("unknown_count_unusable");
  if (coveredCount !== null && freshCount !== null && staleCount !== null && unknownCount !== null && freshCount + staleCount + unknownCount !== coveredCount && freshCount <= coveredCount) {
    unusableReasons.push("content_counts_inconsistent");
  }
  if (!declaredScopeCoversExpected) unusableReasons.push("declared_scope_narrowed");
  if (criticalFreshCount === null) unusableReasons.push("critical_fresh_count_unusable");
  else if (criticalFreshCount > criticalCountries.length) {
    unusableReasons.push("critical_fresh_exceeds_declared");
  }
  if (criticalFreshCount !== null && coveredCount !== null && criticalFreshCount > coveredCount) {
    unusableReasons.push("critical_fresh_exceeds_covered");
  }
  if (!Number.isFinite(expectedBudgetMinutes) || expectedBudgetMinutes <= 0) {
    unusableReasons.push("expected_budget_unusable");
  }
  if (blockPresent && criticalOldestObservedAt === null && criticalFreshCount !== null && criticalCountries.length > 0 && criticalFreshCount === criticalCountries.length) {
    unusableReasons.push("critical_observation_time_unusable");
  }
  const usable = unusableReasons.length === 0;
  const budgetMs = Number.isFinite(expectedBudgetMinutes) && expectedBudgetMinutes > 0 ? expectedBudgetMinutes * 6e4 : null;
  return {
    fieldPresent,
    usable,
    unusableReasons,
    expectedCriticalCountries: expectedCountries,
    budgetMinutes: Number.isFinite(expectedBudgetMinutes) ? expectedBudgetMinutes : null,
    coveredCount,
    freshCount,
    staleCount,
    unknownCount,
    staleCountries: entityList(block?.staleCountries),
    staleCountriesTruncated: count(block?.staleCountriesTruncated) ?? 0,
    oldestObservedAt: finiteNumber(block?.oldestObservedAt),
    oldestObservedCountry: typeof block?.oldestObservedCountry === "string" ? block.oldestObservedCountry.slice(0, 8) : null,
    oldestAgeMinutes: finiteNumber(block?.oldestAgeMinutes) === null ? null : Math.round(block.oldestAgeMinutes),
    criticalCountries,
    criticalFreshCount,
    criticalStaleCountries: entityList(block?.criticalStaleCountries),
    criticalMissingCountries: count(block?.criticalMissingCountries),
    criticalOldestObservedAt,
    criticalOldestObservedCountry: typeof block?.criticalOldestObservedCountry === "string" ? block.criticalOldestObservedCountry.slice(0, 8) : null,
    criticalOldestAgeMinutes: criticalAgeMinutes,
    // Compare raw milliseconds inclusively. The producer treats exactly-at-
    // budget as stale; rounded minutes would accept up to 29,999ms over.
    contentStale: usable ? criticalFreshCount < criticalCountries.length || criticalAgeMs === null || criticalAgeMs < 0 || budgetMs !== null && criticalAgeMs >= budgetMs : false
  };
}
function projectContentFreshnessForWire(assessment) {
  if (!assessment) return null;
  const { fieldPresent: _fieldPresent, ...wire } = assessment;
  return wire;
}

// api/_content-age.js
var CONTENT_AGE_PREWARNING_RATIO = 0.8;
function assessContentAge(meta, now) {
  if (meta == null || typeof meta !== "object") return null;
  const maxContentAgeMin = meta.maxContentAgeMin;
  if (typeof maxContentAgeMin !== "number") return null;
  const newestItemAt = typeof meta.newestItemAt === "number" && Number.isFinite(meta.newestItemAt) ? meta.newestItemAt : null;
  const oldestItemAt = typeof meta.oldestItemAt === "number" && Number.isFinite(meta.oldestItemAt) ? meta.oldestItemAt : null;
  const contentAgeMin = newestItemAt == null ? null : Math.round((now - newestItemAt) / 6e4);
  const isFutureDated = contentAgeMin != null && contentAgeMin < 0;
  const contentStale = contentAgeMin == null || isFutureDated || contentAgeMin > maxContentAgeMin;
  let preWarning = null;
  if (!contentStale && contentAgeMin != null && Number.isFinite(contentAgeMin)) {
    const warnAtContentAgeMin = Math.ceil(maxContentAgeMin * CONTENT_AGE_PREWARNING_RATIO);
    if (Number.isFinite(warnAtContentAgeMin) && warnAtContentAgeMin > 0 && contentAgeMin >= warnAtContentAgeMin && contentAgeMin <= maxContentAgeMin) {
      const breachMs = newestItemAt + (maxContentAgeMin + 0.5) * 6e4;
      preWarning = {
        warnAtContentAgeMin,
        remainingContentAgeMin: maxContentAgeMin - contentAgeMin,
        breachAt: new Date(Math.round(breachMs)).toISOString()
      };
    }
  }
  return {
    newestItemAt,
    oldestItemAt,
    maxContentAgeMin,
    contentAgeMin,
    contentStale,
    preWarning
  };
}

// api/_humanitarian-retention.js
var CACHE_KEY = "conflict:humanitarian:v1";
var RETENTION_MS = 6 * 60 * 6e4;
var COUNTS = ["conflictEventsTotal", "conflictPoliticalViolenceEvents", "conflictFatalities", "conflictDemonstrations"];
function payload(raw) {
  try {
    return unwrapEnvelope(typeof raw === "string" ? JSON.parse(raw) : raw).data;
  } catch {
    return null;
  }
}
async function readHumanitarianRetention(meta, requiredCountryCount, now, pipeline) {
  const codes = meta?.requiredCountryCodes;
  if (!Array.isArray(codes) || codes.length !== requiredCountryCount || codes.length > 100 || codes.some((code) => typeof code !== "string" || !/^[A-Z]{2}$/.test(code)) || new Set(codes).size !== codes.length || !Number.isSafeInteger(meta.fetchedAt) || meta.fetchedAt <= 0 || meta.fetchedAt > now || meta.lastSuccessAt !== void 0 && meta.lastSuccessAt !== meta.fetchedAt) return null;
  const results = await pipeline([
    ["GET", CACHE_KEY],
    ...codes.flatMap((code) => [["GET", `${CACHE_KEY}:${code}`], ["PTTL", `${CACHE_KEY}:${code}`]])
  ], 4e3, true).catch(() => null);
  if (!Array.isArray(results) || results.length !== 1 + codes.length * 2 || results.some((row) => !row || row.error)) return null;
  const sortedCodes = [...codes].sort();
  const marker = payload(results[0].result);
  if (marker?.updatedAt !== meta.fetchedAt || marker.requiredCountriesTotal !== codes.length || marker.requiredCountriesCovered !== codes.length || !Array.isArray(marker.requiredCountryCodes) || marker.requiredCountryCodes.length !== codes.length || [...marker.requiredCountryCodes].sort().some((code, index) => code !== sortedCodes[index])) return null;
  let until = meta.fetchedAt + RETENTION_MS;
  for (let i = 0; i < codes.length; i += 1) {
    const summary = payload(results[1 + i * 2].result)?.summary;
    const ttl = results[2 + i * 2].result;
    const referenceAt = typeof summary?.referencePeriod === "string" ? Date.parse(summary.referencePeriod) : NaN;
    if (!summary || summary.countryCode !== codes[i] || typeof summary.countryName !== "string" || !summary.countryName.trim() || !Number.isFinite(referenceAt) || referenceAt > now || new Date(referenceAt).toISOString().slice(0, 10) !== summary.referencePeriod.slice(0, 10) || COUNTS.some((field) => !Number.isFinite(summary[field]) || summary[field] < 0) || !Number.isSafeInteger(summary.updatedAt) || summary.updatedAt <= 0 || summary.updatedAt > meta.fetchedAt || !Number.isSafeInteger(ttl) || ttl <= 0) return null;
    until = Math.min(until, summary.updatedAt + RETENTION_MS, now + ttl);
  }
  return until > now ? { until, records: codes.length } : null;
}

// api/_sentry-common.js
var _key = "";
var _envelopeUrl = "";
(function parseDsn() {
  if (process.env.NODE_TEST_CONTEXT) return;
  const dsn = process.env.VITE_SENTRY_DSN ?? "";
  if (!dsn) return;
  try {
    const u = new URL(dsn);
    _key = u.username;
    const projectId = u.pathname.replace(/^\//, "");
    _envelopeUrl = `${u.protocol}//${u.host}/api/${projectId}/envelope/`;
  } catch {
  }
})();
function parseStack(stack) {
  const lines = stack.split("\n").slice(1, 30);
  const frames = [];
  for (const line of lines) {
    const m = line.match(/at\s+(?:(.+?)\s+\()?(.+?):(\d+):(\d+)\)?$/);
    if (!m) continue;
    frames.push({
      function: m[1] || "<anonymous>",
      filename: m[2],
      lineno: Number(m[3]),
      colno: Number(m[4])
    });
  }
  return frames.reverse();
}
function buildEnvelope(err, ctx, runtimeCfg) {
  const errMsg = err instanceof Error ? err.message : String(err);
  const errType = err instanceof Error ? err.name || err.constructor.name || "Error" : "Error";
  const stack = err instanceof Error && err.stack ? err.stack : void 0;
  const eventId = crypto.randomUUID().replace(/-/g, "");
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const level = ctx?.level === "warning" || ctx?.level === "info" || ctx?.level === "fatal" ? ctx.level : "error";
  const event = {
    event_id: eventId,
    timestamp,
    level,
    platform: runtimeCfg.platform,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "production",
    release: process.env.VERCEL_GIT_COMMIT_SHA,
    exception: {
      values: [
        {
          type: errType,
          value: errMsg,
          ...stack ? { stacktrace: { frames: parseStack(stack) } } : {}
        }
      ]
    },
    tags: { surface: "api", runtime: runtimeCfg.runtime, ...ctx?.tags ?? {} },
    extra: ctx?.extra,
    // Caller-supplied fingerprint overrides Sentry's default grouping.
    // Use when the error message contains a high-cardinality token (request id,
    // ephemeral hash) that would otherwise split one logical issue into many.
    ...Array.isArray(ctx?.fingerprint) && ctx.fingerprint.length > 0 ? { fingerprint: ctx.fingerprint } : {}
  };
  const header = JSON.stringify({ event_id: eventId, sent_at: timestamp });
  const itemHeader = JSON.stringify({ type: "event" });
  const itemPayload = JSON.stringify(event);
  return `${header}
${itemHeader}
${itemPayload}
`;
}
async function deliver(body, logPrefix) {
  if (!_envelopeUrl || !_key) return false;
  try {
    const res = await fetch(_envelopeUrl, {
      method: "POST",
      keepalive: true,
      signal: AbortSignal.timeout(2e3),
      headers: {
        "Content-Type": "application/x-sentry-envelope",
        "X-Sentry-Auth": `Sentry sentry_version=7, sentry_key=${_key}`
      },
      body
    });
    if (!res.ok) {
      const hint = res.status === 401 || res.status === 403 ? " \u2014 check VITE_SENTRY_DSN and auth key" : res.status === 429 ? " \u2014 rate limited by Sentry" : " \u2014 Sentry outage or transient error";
      console.warn(`${logPrefix} non-2xx response ${res.status}${hint}`);
    }
    return res.ok;
  } catch (fetchErr) {
    console.warn(
      `${logPrefix} failed to deliver event:`,
      fetchErr instanceof Error ? fetchErr.message : fetchErr
    );
    return false;
  }
}
function makeCaptureSilentError({ runtime, platform, logPrefix }) {
  const runtimeCfg = { runtime, platform };
  return function captureSilentError2(err, opts) {
    if (!_envelopeUrl || !_key) return Promise.resolve(false);
    const promise = deliver(buildEnvelope(err, opts, runtimeCfg), logPrefix);
    if (opts?.ctx && typeof opts.ctx.waitUntil === "function") {
      opts.ctx.waitUntil(promise);
    } else {
      promise.catch(() => {
      });
    }
    return promise;
  };
}

// api/_sentry-edge.js
var captureSilentError = makeCaptureSilentError({
  runtime: "edge",
  platform: "javascript",
  logPrefix: "[sentry-edge]"
});

// api/health.js
var config = { runtime: "edge" };
var RESILIENCE_INTERVAL_METHODOLOGY = "weight-perturbation-sensitivity-v3";
var RESILIENCE_INTERVAL_MIN_RECORD_COUNT = 180;
function isEnabledEnv(name, defaultValue) {
  return String(process.env[name] ?? defaultValue).toLowerCase() === "true";
}
function isResiliencePillarCombineEnabled() {
  return process.env.RESILIENCE_PILLAR_COMBINE_ENABLED?.trim().toLowerCase() !== "false";
}
function currentResilienceCacheFormula() {
  return isResiliencePillarCombineEnabled() && isEnabledEnv("RESILIENCE_SCHEMA_V2_ENABLED", "true") ? "pc" : "d6";
}
function currentResilienceEducationState() {
  return isEnabledEnv("RESILIENCE_EDUCATION_ENABLED", "true") ? "education-on" : "education-off";
}
function assessResilienceCacheState(meta) {
  const formula = meta?._formula === "pc" || meta?._formula === "d6" ? meta._formula : null;
  const educationState = meta?._educationState === "education-on" || meta?._educationState === "education-off" ? meta._educationState : null;
  const intervalMethodology = meta?._intervalMethodology === RESILIENCE_INTERVAL_METHODOLOGY ? meta._intervalMethodology : null;
  const requiredFormula = currentResilienceCacheFormula();
  const requiredEducationState = currentResilienceEducationState();
  return {
    ok: formula === requiredFormula && educationState === requiredEducationState && intervalMethodology === RESILIENCE_INTERVAL_METHODOLOGY,
    formula,
    requiredFormula,
    educationState,
    requiredEducationState,
    intervalMethodology,
    requiredIntervalMethodology: RESILIENCE_INTERVAL_METHODOLOGY
  };
}
var CHINA_DECISION_SIGNAL_GROUP_IDS = Object.freeze([
  "macro",
  "policy-enforcement",
  "cross-strait-activity",
  "corporate-disclosures",
  "corridor-conditions",
  "activity-nowcast"
]);
var CHINA_DECISION_SIGNAL_STATES = /* @__PURE__ */ new Set([
  "available",
  "partial",
  "stale",
  "unavailable"
]);
var CHINA_DECISION_HEALTHY_QUIET_CAUSE = "healthy_quiet_window";
var HEALTH_VERDICT_SNAPSHOT_BASE_KEY = "health:verdict:v2";
function healthVerdictRedisKey(baseKey, vercelEnv, commitSha) {
  if (!vercelEnv || vercelEnv === "production") return baseKey;
  return `${vercelEnv}:${commitSha?.slice(0, 8) || "dev"}:${baseKey}`;
}
var STALE_CONTENT_GRACE_MS = 3 * 60 * 60 * 1e3;
var STALE_CONTENT_GRACE_STATE_KEY = healthVerdictRedisKey(
  "health:stale-content-grace:v1",
  process.env.VERCEL_ENV,
  process.env.VERCEL_GIT_COMMIT_SHA
);
var HEALTH_VERDICT_SNAPSHOT_KEY = healthVerdictRedisKey(
  HEALTH_VERDICT_SNAPSHOT_BASE_KEY,
  process.env.VERCEL_ENV,
  process.env.VERCEL_GIT_COMMIT_SHA
);
var HEALTH_VERDICT_COMPACT_SNAPSHOT_BASE_KEY = "health:verdict:compact:v2";
var HEALTH_VERDICT_COMPACT_SNAPSHOT_KEY = healthVerdictRedisKey(
  HEALTH_VERDICT_COMPACT_SNAPSHOT_BASE_KEY,
  process.env.VERCEL_ENV,
  process.env.VERCEL_GIT_COMMIT_SHA
);
var HEALTH_VERDICT_SNAPSHOT_TTL_SECONDS = 60;
var CONTRACTS_FINDER_CANONICAL_KEY = "economic:global-tenders:v1";
var CHINA_COVERAGE_SUMMARY_KEY = "health:china-coverage:v1";
var CHINA_DECISION_SIGNALS_PENDING_MS = 3 * 60 * 60 * 1e3;
var CHINA_TRANSIENT_COVERAGE_REASONS = /* @__PURE__ */ new Set([
  "CHINA_COVERAGE_PARTIAL",
  "TRANSPORT_ERROR"
]);
var HEALTH_VERDICT_SNAPSHOT_TTL_MS = HEALTH_VERDICT_SNAPSHOT_TTL_SECONDS * 1e3;
var HEALTH_VERDICT_REFRESH_LOCK_KEY = `${HEALTH_VERDICT_SNAPSHOT_KEY}:refresh-lock`;
var HEALTH_VERDICT_REFRESH_LOCK_TTL_SECONDS = 30;
var HEALTH_VERDICT_REFRESH_WAIT_ATTEMPTS = 45;
var HEALTH_VERDICT_REFRESH_WAIT_MS = 3e3;
var HEALTH_VERDICT_LAST_KNOWN_KEY = `${HEALTH_VERDICT_SNAPSHOT_KEY}:last-known`;
var HEALTH_VERDICT_COMPACT_LAST_KNOWN_KEY = `${HEALTH_VERDICT_COMPACT_SNAPSHOT_KEY}:last-known`;
var HEALTH_VERDICT_LAST_KNOWN_TTL_SECONDS = 600;
var HEALTH_VERDICT_LAST_KNOWN_READ_TIMEOUT_MS = 2e3;
var HEALTH_VERDICT_MIN_REDIS_TIMEOUT_MS = 100;
var HEALTH_REQUEST_DEADLINE_MS = 22e3;
var HEALTH_REQUEST_WORK_BUDGET_MS = HEALTH_REQUEST_DEADLINE_MS - HEALTH_VERDICT_LAST_KNOWN_READ_TIMEOUT_MS;
var HealthBudgetExhaustedError = class extends Error {
  constructor() {
    super("health request deadline exhausted");
    this.name = "HealthBudgetExhaustedError";
  }
};
function createHealthRequestBudget(startedAt, workBudgetMs = HEALTH_REQUEST_WORK_BUDGET_MS) {
  const workDeadline = startedAt + workBudgetMs;
  const responseDeadline = workDeadline + HEALTH_VERDICT_LAST_KNOWN_READ_TIMEOUT_MS;
  const remaining = () => workDeadline - Date.now();
  return {
    workDeadline,
    remaining,
    // Too little left to start another Redis request that could complete.
    exhausted: () => remaining() < HEALTH_VERDICT_MIN_REDIS_TIMEOUT_MS,
    // The timeout for one operation: its own ceiling or the remaining budget.
    clamp: (timeoutMs) => Math.max(1, Math.min(timeoutMs, remaining())),
    // The stale fallback read gets what is left before the response deadline.
    fallbackTimeout: () => Math.min(HEALTH_VERDICT_LAST_KNOWN_READ_TIMEOUT_MS, responseDeadline - Date.now())
  };
}
var RUNTIME_ROLLOUT_PENDING_POLICIES = Object.freeze({
  fredRatesSeeder: Object.freeze({
    deadlineKey: "health:rollout-deadline:economic:fred-rates:v1",
    durationMs: 24 * 60 * 60 * 1e3
  })
});
var FRED_RATES_ROLLOUT_DEADLINE_KEY = RUNTIME_ROLLOUT_PENDING_POLICIES.fredRatesSeeder.deadlineKey;
var FRED_RATES_ROLLOUT_DURATION_MS = RUNTIME_ROLLOUT_PENDING_POLICIES.fredRatesSeeder.durationMs;
var HEALTH_VERDICT_RELEASE_LOCK_SCRIPT = [
  "if redis.call('get', KEYS[1]) == ARGV[1] then",
  "  return redis.call('del', KEYS[1])",
  "end",
  "return 0"
].join("\n");
var HEALTH_VERDICT_WRITE_SNAPSHOT_SCRIPT = [
  "if redis.call('get', KEYS[1]) ~= ARGV[1] then return nil end",
  "redis.call('set', KEYS[2], ARGV[2], 'EX', ARGV[4])",
  "redis.call('set', KEYS[3], ARGV[3], 'EX', ARGV[4])",
  "redis.call('set', KEYS[4], ARGV[2], 'EX', ARGV[5])",
  "redis.call('set', KEYS[5], ARGV[3], 'EX', ARGV[5])",
  "return 'OK'"
].join("\n");
var HEALTH_VERDICT_MUTATION_SCRIPT = [
  "if redis.call('get', KEYS[1]) ~= ARGV[1] then return nil end",
  "return redis.call(ARGV[2], KEYS[2], unpack(ARGV, 3))"
].join("\n");
var HEALTH_REFRESH_MUTATIONS = /* @__PURE__ */ new Set(["SET", "DEL", "HSETNX", "HDEL", "PEXPIRE", "LPUSH", "LTRIM", "EXPIRE"]);
function fenceHealthMutations(commands, token) {
  return commands.map(([op, key, ...args]) => HEALTH_REFRESH_MUTATIONS.has(op) ? ["EVAL", HEALTH_VERDICT_MUTATION_SCRIPT, "2", HEALTH_VERDICT_REFRESH_LOCK_KEY, key, token, op, ...args] : [op, key, ...args]);
}
var IRAN_EVENTS_ENABLED = (process.env.IRAN_EVENTS_ENABLED ?? "false").toLowerCase() === "true";
var BOOTSTRAP_KEYS = {
  earthquakes: "seismology:earthquakes:v1",
  outages: "infra:outages:v1",
  sectors: "market:sectors:v2",
  etfFlows: "market:etf-flows:v1",
  climateAnomalies: "climate:anomalies:v2",
  climateDisasters: "climate:disasters:v1",
  climateAirQuality: "climate:air-quality:v1",
  co2Monitoring: "climate:co2-monitoring:v1",
  oceanIce: "climate:ocean-ice:v1",
  wildfires: "wildfire:fires:v1",
  wildfiresBootstrap: "wildfire:fires-bootstrap:v1",
  marketQuotes: "market:stocks-bootstrap:v1",
  commodityQuotes: "market:commodities-bootstrap:v1",
  cyberThreats: "cyber:threats-bootstrap:v2",
  techReadiness: "economic:worldbank-techreadiness:v1",
  progressData: "economic:worldbank-progress:v1",
  renewableEnergy: "economic:worldbank-renewable:v1",
  positiveGeoEvents: "positive_events:geo-bootstrap:v1",
  riskScores: CII_RISK_SCORE_CACHE_KEYS.stale,
  naturalEvents: "natural:events:v1",
  flightDelays: "aviation:delays-bootstrap:v2",
  newsInsights: "news:insights:v1",
  predictionMarkets: "prediction:markets-bootstrap:v1",
  cryptoQuotes: "market:crypto:v1",
  gulfQuotes: "market:gulf-quotes:v1",
  stablecoinMarkets: "market:stablecoins:v1",
  unrestEvents: "unrest:events:v1",
  iranEvents: "conflict:iran-events:v1",
  ucdpEvents: "conflict:ucdp-events:v1",
  ucdpEventsBootstrap: "conflict:ucdp-events-bootstrap:v1",
  weatherAlerts: "weather:alerts:v1",
  canadaRoads: "infra:ontario-511:v1",
  albertaRoads: "infra:alberta-511:v1",
  manitobaRoads: "infra:manitoba-511:v1",
  torontoRoads: "infra:toronto-roads:v1",
  bcOpen511: "infra:bc-open511:v1",
  canadaAlerts: "alerts:canada:v1",
  spending: "economic:spending:v1",
  techEvents: "research:tech-events-bootstrap:v1",
  gdeltIntel: "intelligence:gdelt-intel:v1",
  correlationCards: "correlation:cards-bootstrap:v1",
  crossStraitActivity: "military:cross-strait-activity:v1",
  crossStraitActivityBootstrap: "military:cross-strait-activity-bootstrap:v1",
  forecasts: "forecast:predictions:v2",
  forecastsBootstrap: "forecast:predictions-bootstrap:v1",
  securityAdvisories: "intelligence:advisories-bootstrap:v1",
  customsRevenue: "trade:customs-revenue:v1",
  comtradeFlows: "comtrade:flows:v1",
  blsSeries: "bls:series:v1",
  sanctionsPressure: "sanctions:pressure:v1",
  crossSourceSignals: "intelligence:cross-source-signals:v1",
  sanctionsEntities: "sanctions:entities:v1",
  radiationWatch: "radiation:observations:v1",
  consumerPricesOverview: "consumer-prices:overview:ae",
  consumerPricesCategories: "consumer-prices:categories:ae:30d",
  consumerPricesMovers: "consumer-prices:movers:ae:30d",
  consumerPricesSpread: "consumer-prices:retailer-spread:ae:essentials-ae",
  consumerPricesFreshness: "consumer-prices:freshness:ae",
  consumerPricesCoverage: "consumer-prices:coverage:ae",
  groceryBasket: "economic:grocery-basket:v1",
  bigmac: "economic:bigmac:v1",
  fuelPrices: "economic:fuel-prices:v1",
  faoFoodPriceIndex: "economic:fao-ffpi:v1",
  nationalDebt: "economic:national-debt:v1",
  defiTokens: "market:defi-tokens:v1",
  aiTokens: "market:ai-tokens:v1",
  otherTokens: "market:other-tokens:v1",
  fredBatch: "economic:fred:v1:FEDFUNDS:0",
  ecbEstr: "economic:fred:v1:ESTR:0",
  ecbEuribor3m: "economic:fred:v1:EURIBOR3M:0",
  ecbEuribor6m: "economic:fred:v1:EURIBOR6M:0",
  ecbEuribor1y: "economic:fred:v1:EURIBOR1Y:0",
  fearGreedIndex: "market:fear-greed:v1",
  breadthHistory: "market:breadth-history:v1",
  euYieldCurve: "economic:yield-curve-eu:v1",
  earningsCalendar: "market:earnings-calendar:v1",
  econCalendar: "economic:econ-calendar:v1",
  chinaMacro: BOOTSTRAP_CACHE_KEYS.chinaMacro,
  chinaReleaseCalendar: BOOTSTRAP_CACHE_KEYS.chinaReleaseCalendar,
  chinaCorporateDisclosures: "market:china:corporate-disclosures:v1",
  chinaPolicyEvents: "china:policy-events:v1",
  chinaDecisionSignals: BOOTSTRAP_CACHE_KEYS.chinaDecisionSignals,
  cotPositioning: "market:cot:v1",
  hyperliquidFlow: "market:hyperliquid:flow:v1",
  crudeInventories: "economic:crude-inventories:v1",
  natGasStorage: "economic:nat-gas-storage:v1",
  spr: "economic:spr:v1",
  refineryInputs: "economic:refinery-inputs:v1",
  ecbFxRates: "economic:ecb-fx-rates:v1",
  eurostatCountryData: "economic:eurostat-country-data:v1",
  eurostatHousePrices: "economic:eurostat:house-prices:v1",
  eurostatGovDebtQ: "economic:eurostat:gov-debt-q:v1",
  eurostatIndProd: "economic:eurostat:industrial-production:v1",
  euGasStorage: "economic:eu-gas-storage:v1",
  euFsi: "economic:fsi-eu:v1",
  shippingStress: "supply_chain:shipping_stress:v1",
  diseaseOutbreaks: "health:disease-outbreaks:v1",
  healthAirQuality: "health:air-quality:v1",
  socialVelocity: "intelligence:social:reddit:v1",
  wsbTickers: "intelligence:wsb-tickers:v1",
  vpdTrackerRealtime: "health:vpd-tracker:realtime:v1",
  vpdTrackerHistorical: "health:vpd-tracker:historical:v1",
  electricityPrices: "energy:electricity:v1:index",
  gasStorageCountries: "energy:gas-storage:v1:_countries",
  aaiiSentiment: "market:aaii-sentiment:v1",
  cryptoSectors: "market:crypto-sectors:v1",
  ddosAttacks: "cf:radar:ddos:v1",
  economicStress: "economic:stress-index:v1",
  trafficAnomalies: "cf:radar:traffic-anomalies:v1"
};
var STANDALONE_KEYS = {
  ukmtoIncidents: "maritime:ukmto-incidents:v1",
  sanctionsChanges: "sanctions:changes:v1",
  predictionCountryMarkets: "prediction:markets-country-index:v1",
  // US HTS chapter 99 duty index (catalog; coverage shards are versioned by
  // release under trade:us-hts:coverage:v1). Read only by get-us-import-duty.
  usHtsDuties: "trade:us-hts:catalog:v1",
  // Per-country GDELT article index (#7748): read only by the search route's
  // country form and the weekly crawlable freeze, never by the dashboard, so
  // it is monitored here rather than bootstrap-tiered. Without this gate an
  // evicted or stale index stays invisible until the next weekly freeze.
  gdeltCountryArticles: "gdelt:bulk:country-articles:v1",
  gdeltDyadTension: "gdelt:bulk:dyad-tension:v1",
  // Non-news evidence per tension pair, read only by get-pizzint-status for
  // the tension popup, so monitored here.
  tensionEvidence: "intelligence:tension-evidence:v1",
  // Per-country GDELT conflict counts and own-baseline medians, read only by the
  // CII conflict component (get-risk-scores), so monitored here.
  gdeltCountryEvents: "gdelt:bulk:country-events:v1",
  // 30 days of per-country strike tallies the relay builds from the Middle East
  // strike feed; read only by the CII strike pressure (get-risk-scores), so
  // monitored here. Gated by IRAN_EVENTS_ENABLED like the feed itself.
  strikePressure: "conflict:strike-pressure:v1",
  chinaCoverage: CHINA_COVERAGE_SUMMARY_KEY,
  // Control-plane heartbeat only. Convex owns every durable scan lease,
  // checkpoint, receipt, and replay decision; this Redis value is disposable.
  companyMonitoringWorker: "company-monitoring:worker-health:v1",
  // Per-tick status of the chokepoint webhook delivery worker (#9217). No
  // dashboard reads it; recordCount is the number of active subscribers.
  shippingWebhookWorker: "shipping:webhook-worker:v1",
  // Seeded and health-monitored; no dashboard consumer yet (#6155 is the
  // data layer only), so it is standalone rather than bootstrap-tiered.
  chinaStockConnect: "market:china:stock-connect:v1",
  // Seeded by seed-no2-activity (#9722): the global Sentinel-5P NO2 dataset
  // keyed by region, read by the China activity nowcast RPC for its
  // atmosphere family, so no bootstrap tier.
  no2Activity: "economic:no2-activity:v1",
  hkoWarnings: "weather:hko-warnings:v1",
  imdCycloneMarine: "weather:imd-cyclone-marine:v1",
  // Seeded by seed-live-video-resolved (#8545); read by the live video players
  // through the on-demand bootstrap URL. Strict once activated (SEED_META).
  liveVideoResolved: BOOTSTRAP_CACHE_KEYS.liveVideoResolved,
  // Seeded by seed-cross-border-arrivals (#9023); read by the displacement
  // panel and map layer through the on-demand bootstrap URL.
  crossBorderArrivals: BOOTSTRAP_CACHE_KEYS.crossBorderArrivals,
  canadaAlertsAbSource: "alerts:canada:alberta-aea:v1",
  canadaAlertsBcSource: "alerts:canada:bc-evacuation:v1",
  canadaAlertsSkSource: "alerts:canada:saskalert:v1",
  humanitarianSummary: "conflict:humanitarian:v1",
  // #4920 completeness measurement (daily GH Actions publishers) — ops
  // keys: health-monitored but NOT bootstrap-hydrated into page loads.
  newsFeedHealth: "news:feed-health:v1",
  newsRecallBenchmark: "news:recall-benchmark:v1",
  serviceStatuses: "infra:service-statuses:v1",
  macroSignals: "economic:macro-signals:v1",
  energyPrices: "economic:energy:v1:all",
  bisPolicy: "economic:bis:policy:v1",
  bisExchange: "economic:bis:eer:v1",
  fxYoy: "economic:fx:yoy:v1",
  sharedFxRates: "shared:fx-rates:v1",
  // Operational batch written by seed-fred-rates. The UI and MCP surfaces
  // consume the individual FRED series keys, not this producer envelope.
  fredRatesSeeder: "economic:fred:batch:v1",
  bisCredit: "economic:bis:credit:v1",
  bisDsr: "economic:bis:dsr:v1",
  // Bank of Russia official rates: health-monitored but deliberately NOT a
  // bootstrap key. Its dashboard consumer (the FX panel's RUB tab, #6231)
  // reads it on demand through the credential-less per-key bootstrap URL, so
  // registering it in a tier would add ~6KB to a payload every client
  // downloads and only the opt-in panel consumes.
  cbrRates: "economic:cbr-rates:v1",
  bocValet: "economic:boc-valet:v1",
  statcanWds: "economic:statcan-wds:v1",
  // SGE physical premiums. The dashboard fetches them on demand via
  // GET /api/market/v1/get-physical-premiums, not bootstrap hydration.
  // classifyKey only treats ON_DEMAND_KEYS as pending when allowOnDemand is
  // true, and that flag is set only on the STANDALONE_KEYS walk. Keeping this
  // here (not in BOOTSTRAP_KEYS) is what makes the activation-marker cutover
  // pending before the first successful publish and strict after it.
  physicalPremiums: "market:physical-premium:v1",
  physicalDivergence: "market:physical-divergence:v1",
  bisPropertyResidential: "economic:bis:property-residential:v1",
  bisPropertyCommercial: "economic:bis:property-commercial:v1",
  imfMacro: "economic:imf:macro:v2",
  imfGrowth: "economic:imf:growth:v1",
  imfLabor: "economic:imf:labor:v1",
  imfExternal: "economic:imf:external:v1",
  // plan 2026-04-25-004 Phase 2: financialSystemExposure data keys.
  wbExternalDebt: "economic:wb-external-debt:v1",
  bisLbs: "economic:bis-lbs:v1",
  capitalFlows: "economic:capital-flows:v1",
  fatfListing: "economic:fatf-listing:v1",
  climateZoneNormals: "climate:zone-normals:v1",
  shippingRates: "supply_chain:shipping:v2",
  chokepoints: "supply_chain:chokepoints:v4",
  minerals: "supply_chain:minerals:v2",
  mineralProduction: "supply-chain:mineral-production:v1",
  giving: "giving:summary:v2",
  gpsjam: "intelligence:gpsjam:v2",
  // Corporate intelligence (issue #5695): SEC ticker→CIK registry + 8-K
  // material-events stream. Health-monitored, not bootstrap-hydrated.
  secCikMap: "intelligence:sec-cik-map:v1",
  sec8kStream: "intelligence:sec-8k-stream:v1",
  theaterPosture: "theater_posture:sebuf:stale:v1",
  theaterPostureLive: "theater-posture:sebuf:v1",
  theaterPostureBackup: "theater-posture:sebuf:backup:v1",
  riskScoresLive: CII_RISK_SCORE_CACHE_KEYS.live,
  riskScoresHistory: CII_RISK_SCORE_CACHE_KEYS.dailyHistoryIndex,
  countryHistory: "history:country:index",
  usniFleet: "usni-fleet:sebuf:v1",
  usniFleetStale: "usni-fleet:sebuf:stale:v1",
  faaDelays: "aviation:delays:faa:v1",
  intlDelays: "aviation:delays:intl:v3",
  notamClosures: "aviation:notam:closures:v2",
  notamAirspace: "aviation:notam:airspace:v1",
  notamNmsClosures: "aviation:notam:nms:closures:v1",
  positiveEventsLive: "positive-events:geo:v1",
  cableHealth: "cable-health-v1",
  submarineCables: "infrastructure:submarine-cables:v1",
  cyberThreatsRpc: "cyber:threats:v2",
  militaryBases: "military:bases:active",
  militaryFlights: "military:flights:v1",
  aisGaps: "maritime:ais-gaps:v1",
  militaryFlightsStale: "military:flights:stale:v1",
  // STANDALONE (not BOOTSTRAP) by design — value is a single keyed payload
  // (asOf + per-country aggregate), no per-record gating needed; health just
  // verifies existence + freshness via the matching SEED_META entry. Same
  // shape as militaryFlights above.
  militaryCii: "intelligence:military-cii:v1",
  // Derived by seed-fire-detections from the canonical wildfires key (#9509):
  // per-country intensity rows plus the FIRMS clock, read by the CII and
  // temporal-anomaly rebuilds instead of the 2-5 MB canonical payload. Same
  // single-payload shape as militaryCii; health checks existence + freshness.
  wildfiresSummary: "wildfire:fires-summary:v1",
  globalTendersSam: "economic:global-tenders:v1:source:sam",
  globalTendersTed: "economic:global-tenders:v1:source:ted",
  globalTendersContractsFinder: "economic:global-tenders:v1:source:contracts-finder",
  globalTendersCanadaBuys: "economic:global-tenders:v1:source:canada-buys",
  globalTendersGets: "economic:global-tenders:v1:source:gets",
  globalTendersWorldBank: "economic:global-tenders:v1:source:world-bank",
  globalTendersColombiaSecop: "economic:global-tenders:v1:source:colombia-secop",
  globalTendersKenyaPpip: "economic:global-tenders:v1:source:kenya-ppip",
  globalTendersSouthAfricaEtenders: "economic:global-tenders:v1:source:south-africa-etenders",
  globalTendersChileMercadoPublico: "economic:global-tenders:v1:source:chile-mercado-publico",
  globalTendersBrazilPncp: "economic:global-tenders:v1:source:brazil-pncp",
  globalTendersUkraineProzorro: "economic:global-tenders:v1:source:ukraine-prozorro",
  globalTendersBulgariaEop: "economic:global-tenders:v1:source:bulgaria-eop",
  globalTendersLatviaIub: "economic:global-tenders:v1:source:latvia-iub",
  globalTendersPolandBzp: "economic:global-tenders:v1:source:poland-bzp",
  globalTendersPakistanPpra: "economic:global-tenders:v1:source:pakistan-ppra",
  crossStraitActivityTaiwanMnd: "military:cross-strait-activity:v1:source:taiwan-mnd",
  crossStraitActivityJapanMod: "military:cross-strait-activity:v1:source:japan-mod",
  defensePatents: "patents:defense:latest",
  temporalAnomalies: "temporal:anomalies:v1",
  displacement: `displacement:summary:v1:${(/* @__PURE__ */ new Date()).getUTCFullYear()}`,
  displacementPrev: `displacement:summary:v1:${(/* @__PURE__ */ new Date()).getUTCFullYear() - 1}`,
  dtmDisplacement: "displacement:dtm:v1",
  borderUk: "displacement:border-uk:v1",
  borderCbp: "displacement:border-cbp:v1",
  borderFrontex: "displacement:border-frontex:v1",
  borderPanama: "displacement:border-panama:v1",
  // Seeded by seed-idmc-idu-displacement (#9014); read by the displacement
  // panel and map layer through the on-demand bootstrap URL, and by MCP.
  idmcIduDisplacement: BOOTSTRAP_CACHE_KEYS.idmcIduDisplacement,
  acledIntel: "conflict:acled:v1:all:0:0",
  satellites: "intelligence:satellites:tle:v1",
  portwatch: "supply_chain:portwatch:v1",
  portwatchDisruptions: "portwatch:disruptions:active:v1",
  portwatchPortActivity: "supply_chain:portwatch-ports:v1:_countries",
  corridorrisk: "supply_chain:corridorrisk:v1",
  chokepointTransits: "supply_chain:chokepoint_transits:v1",
  transitSummaries: "supply_chain:transit-summaries:v1",
  // Meta-only aggregate: payloads are sharded by country, so use the seed-meta
  // key as the probe target rather than pretending one country key is global.
  comtradeBilateralHs4: "seed-meta:comtrade:bilateral-hs4",
  // Meta-only probes. The CPI and par-curve documents are sharded, and the
  // canonical curve is large enough to time out a health GET.
  usCpiMonthly: "seed-meta:economic:us-cpi",
  usTreasuryParYield: "seed-meta:economic:us-treasury-par-yield",
  usInterestRates: "seed-meta:economic:us-interest-rates",
  // #8538. One probe per worldwide CPI source. The canonical keys are 115 KB –
  // 1 MB and the read path pipelines four of them, so health reads the
  // seed-meta keys instead of paying for the full payloads.
  worldCpiImf: "seed-meta:economic:world-cpi-imf",
  worldCpiEurostat: "seed-meta:economic:world-cpi-eurostat",
  worldCpiEstat: "seed-meta:economic:world-cpi-estat",
  worldCpiAbs: "seed-meta:economic:world-cpi-abs",
  // Meta-only probes for the yield-curve bundle. Every market's history is
  // sharded per year; the canonical payloads are too large to probe directly.
  yieldCurveJp: "seed-meta:economic:yield-curve-jp",
  yieldCurveCa: "seed-meta:economic:yield-curve-ca",
  yieldCurveDe: "seed-meta:economic:yield-curve-de",
  yieldCurveGb: "seed-meta:economic:yield-curve-gb",
  yieldCurveAu: "seed-meta:economic:yield-curve-au",
  yieldCurveCh: "seed-meta:economic:yield-curve-ch",
  yieldCurveNo: "seed-meta:economic:yield-curve-no",
  yieldCurveSe: "seed-meta:economic:yield-curve-se",
  oecdLtRates: "seed-meta:economic:oecd-lt-rates",
  // Authoritative shared cohort pointer read by all vulnerability RPCs. The
  // country and inverse manifests are compatibility projections; probing only
  // them can report OK while every public handler is unavailable.
  supplyVulnerability: "supply-chain:vulnerability:cohort:v1",
  supplyChokepointDependencies: "supply-chain:chokepoint-dependencies:v1",
  thermalEscalation: "thermal:escalation:v1",
  thermalEscalationBootstrap: "thermal:escalation-bootstrap:v1",
  // Meta-only aggregate: payloads are sharded one key per reporter, so probe
  // the seed-meta key rather than electing one reporter (or one lookback) to
  // stand for the fleet. Pre-#6316 this pointed at the US years=10 data key.
  tariffTrendsUs: "seed-meta:trade:tariffs",
  // Meta-only aggregate: payloads are sharded one key per reporter, so probe
  // the seed-meta key rather than electing one reporter to stand for the fleet.
  tradeFlows: "seed-meta:trade:flows",
  militaryForecastInputs: "military:forecast-inputs:stale:v1",
  militarySurges: "military:surges:stale:v1",
  gscpi: "economic:fred:v1:GSCPI:0",
  forecastFredWalcl: "economic:fred:v1:WALCL:0",
  forecastFredT10y2y: "economic:fred:v1:T10Y2Y:0",
  forecastFredUnrate: "economic:fred:v1:UNRATE:0",
  forecastFredCpiaucsl: "economic:fred:v1:CPIAUCSL:0",
  forecastFredDgs10: "economic:fred:v1:DGS10:0",
  forecastFredVixcls: "economic:fred:v1:VIXCLS:0",
  forecastFredGdp: "economic:fred:v1:GDP:0",
  forecastFredM2sl: "economic:fred:v1:M2SL:0",
  forecastFredDcoilwtico: "economic:fred:v1:DCOILWTICO:0",
  marketImplications: "intelligence:market-implications:v1",
  hormuzTracker: "supply_chain:hormuz_tracker:v1",
  simulationPackageLatest: "forecast:simulation-package:latest",
  simulationOutcomeLatest: "forecast:simulation-outcome:latest",
  newsThreatSummary: "news:threat:summary:v1",
  climateNews: "climate:news-intelligence:v1",
  pizzint: "intelligence:pizzint:seed:v1",
  // Retained PizzINT observations (docs/architecture/pizzint-history.md). No
  // browser or RPC consumer, so it is registered here per the standalone-health
  // rule. The watched key is the provider-agnostic heartbeat the archive's Lua
  // advances on every successful write: the daily buckets themselves rotate by
  // UTC date and split by provider, so watching one of those would read EMPTY at
  // every midnight and STALE whenever the BestTime fallback took over.
  pizzintHistory: "seed-meta:intelligence:pizzint:history:v1",
  resilienceStaticIndex: "resilience:static:index:v1",
  resilienceStaticFao: "resilience:static:fao",
  // USDA PSD food stocks + FAOSTAT production fill (#6440). RPC/MCP only —
  // not bootstrap-hydrated; country deep-dive fetches on demand.
  foodStocks: "resilience:food-stocks:v1",
  // UN WPP + UNESCO/World Bank + ILOSTAT capability data (#6437). The country
  // deep-dive fetches this seeded key on demand; it is not bootstrap-hydrated.
  demographicsCapability: "demographics:capability:v1",
  // Atomic country evidence + derived five-factor results (#6441). The public
  // API and MCP service read this key only; no request-time source fan-out.
  scorecardFiveFactor: "scorecard:five-factor:v1",
  resilienceRanking: "resilience:ranking:v29",
  productCatalog: "product-catalog:v3",
  energySpineCountries: "energy:spine:v1:_countries",
  energyExposure: "energy:exposure:v1:index",
  energyMixAll: "energy:mix:v1:_all",
  regulatoryActions: "regulatory:actions:v1",
  energyIntelligence: "energy:intelligence:feed:v1",
  ieaOilStocks: "energy:iea-oil-stocks:v1:index",
  oilStocksAnalysis: "energy:oil-stocks-analysis:v1",
  eiaPetroleum: "energy:eia-petroleum:v1",
  jodiGas: "energy:jodi-gas:v1:_countries",
  lngVulnerability: "energy:lng-vulnerability:v1",
  jodiOil: "energy:jodi-oil:v1:_countries",
  oilTradeSeries: "energy:oil-trade-series:v1",
  chokepointBaselines: "energy:chokepoint-baselines:v1",
  portwatchChokepointsRef: "portwatch:chokepoints:ref:v1",
  chokepointFlows: "energy:chokepoint-flows:v1",
  emberElectricity: "energy:ember:v1:_all",
  regionalEnergyPgcb: "energy:regional:pgcb:v1",
  regionalEnergyPetrobangla: "energy:regional:petrobangla:v1",
  regionalEnergyNiso: "energy:regional:niso:v1",
  regionalEnergyEskom: "energy:regional:eskom:v1",
  regionalEnergyCammesa: "energy:regional:cammesa:v1",
  regionalEnergyGse: "energy:regional:gse:v1",
  regionalEnergyOns: "energy:regional:ons:v1",
  regionalEnergyAnp: "energy:regional:anp:v1",
  regionalEnergyEvn: "energy:regional:evn:v1",
  regionalEnergyKorem: "energy:regional:korem:v1",
  regionalEnergyCoes: "energy:regional:coes:v1",
  regionalEnergyIccc: "energy:regional:iccc:v1",
  regionalEnergyFccc: "energy:regional:fccc:v1",
  resilienceIntervals: "resilience:intervals:v12:US",
  sprPolicies: "energy:spr-policies:v1",
  pipelinesGas: "energy:pipelines:gas:v1",
  pipelinesOil: "energy:pipelines:oil:v1",
  storageFacilities: "energy:storage-facilities:v1",
  fuelShortages: "energy:fuel-shortages:v1",
  energyDisruptions: "energy:disruptions:v1",
  energyCrisisPolicies: "energy:crisis-policies:v1",
  regionalSnapshots: "intelligence:regional-snapshots:summary:v1",
  regionalBriefs: "intelligence:regional-briefs:summary:v1",
  recoveryFiscalSpace: "resilience:recovery:fiscal-space:v1",
  recoveryReserveAdequacy: "resilience:recovery:reserve-adequacy:v1",
  recoveryExternalDebt: "resilience:recovery:external-debt:v1",
  recoveryImportHhi: "resilience:recovery:import-hhi:v1",
  // recoveryFuelStocks: probe removed. The seeder
  // (seed-recovery-fuel-stocks.mjs) still runs in seed-bundle-resilience-
  // recovery so the data is preserved for a future replacement dimension,
  // but `scoreFuelStockDays` in _dimension-scorers.ts is hard-wired to
  // return coverage=0/imputationClass=null (retired in PR 3 §3.5) and
  // never calls getCachedJson on this key. Probing it surfaced a green
  // STATUS:OK that meant "the cron ran", not "the data is used"; that's
  // an actively-misleading signal so it's gone. Re-add this slot if and
  // when a future PR wires scoreFuelStockDays to read real data again.
  recoveryReexportShare: "resilience:recovery:reexport-share:v1",
  recoverySovereignWealth: "resilience:recovery:sovereign-wealth:v1",
  // PR 1 v2 energy-construct seeds. STRICT SEED_META (not ON_DEMAND):
  // plan 2026-04-24-001 removed these from ON_DEMAND_KEYS so /api/health
  // reports CRIT (not WARN) when they are absent. This is the intended
  // alarm on the Railway bundle-not-provisioned state. See the ON_DEMAND_KEYS
  // comment block below for the full rationale.
  lowCarbonGeneration: "resilience:low-carbon-generation:v1",
  fossilElectricityShare: "resilience:fossil-electricity-share:v1",
  powerLosses: "resilience:power-losses:v1",
  // Same strict treatment as the v2 energy seeds above: the education seeder is
  // a seed-bundle-macro member, so an absent key means the bundle stopped
  // publishing, which is a real outage and must read CRIT rather than WARN.
  educationAttainment: "resilience:education-attainment:v1",
  goldExtended: "market:gold-extended:v1",
  goldEtfFlows: "market:gold-etf-flows:v1",
  goldCbReserves: "market:gold-cb-reserves:v1",
  // Relay-side loop heartbeats. ais-relay.cjs writes these on successful child
  // exit for the two execFile-spawned seeders (chokepoint-flows, climate-news).
  // A stale heartbeat means the relay loop itself is broken (child dying at
  // import, parent event-loop blocked, container in a restart loop, etc.)
  // and alarms earlier than the underlying seed-meta staleness window.
  chokepointFlowsRelayHeartbeat: "relay:heartbeat:chokepoint-flows",
  climateNewsRelayHeartbeat: "relay:heartbeat:climate-news",
  // News digest warm cycle (scripts/lib/news-digest-warm.cjs): written only
  // when at least half the (edition, language) digests served news (#9766).
  newsDigestWarmRelayHeartbeat: "relay:heartbeat:news-digest-warm",
  // Bundle tick heartbeat written by `_bundle-runner.mjs` on every container
  // start, including skip-all ticks. Detects Railway cron-scheduler freeze
  // (#6691) that member seed-meta budgets (17.5d+) cannot see.
  staticRefBundleTick: "bundle:heartbeat:static-ref",
  staticRefHeavyBundleTick: "bundle:heartbeat:static-ref-heavy",
  telegramFeed: "intelligence:telegram-feed:v1",
  xFeed: "intelligence:x-feed:v1",
  digestNotifications: "digest:last-run",
  webcams: "webcam:cameras:active",
  forecastResolutions: "forecast:resolutions:v1",
  forecastProbabilityTrail: "forecast:probability-trail:v1",
  forecastArchive: "forecast:archive:v1",
  forecastScorecard: "forecast:scorecard:v1",
  forecastCalibrationMap: "forecast:calibration-map:v1",
  marketAlertLedger: "correlation:market-alerts:ledger:v1",
  marketAlertScorecard: "correlation:market-alerts:scorecard:v1",
  forecastBets: "forecast:bets:history:v1",
  forecastFunnel: "forecast:funnel:health:v1",
  researchArxivHnTrending: "research:arxiv:v1:cs.AI::50",
  techEventsSeeder: "research:tech-events:v1",
  // #5736 — historical-intelligence ingest health, one record per collector.
  // These are NOT the collectors' canonical keys: scripts/_seed-history.mjs
  // appends to the Convex intel-history store fail-open, so a permanently
  // broken relay leg (missing RELAY_SHARED_SECRET, rejecting relay, dead
  // embedder) left every canonical key fresh and the store empty. The paired
  // seed-meta below carries the last HEALTHY append, so "history stopped
  // accumulating" ages into STALE_SEED while canonical publication stays OK.
  intelHistoryIngestConflictAcled: "intel-history:ingest-health:conflict:acled-intel:v1",
  intelHistoryIngestMilitaryCrossStrait: "intel-history:ingest-health:military:cross-strait-activity:v1",
  intelHistoryIngestEnergyIntelligence: "intel-history:ingest-health:energy:intelligence:v1",
  // VIA Rail Tracker unofficial live JSON (#6615). No dashboard consumer.
  viarailLive: "transit:viarail:live",
  // #7012 TPS Open Data — retrospective MCI + annual Calls Attended. Not live
  // CAD, not bootstrap. Seeded by seed-bundle-canada at a 6h member interval
  // since #7036: "on-demand" had no invoker, so the 24h canonical TTL emptied
  // both keys a day after each hand run while seed-meta still read `ok`.
  tpsMci: "safety:toronto:tps-mci:v1",
  tpsCallsAttended: "safety:toronto:tps-calls-attended:v1",
  // Seeded and health-monitored; no transit panel yet (#6623).
  ttcAlerts: "transit:ttc:alerts:v1",
  // Official Toronto Fire Services live CAD (#6682). Own key; not folded into
  // canadaAlerts / canadaRoads / torontoRoads. No map panel yet.
  torontoTfs: "safety:toronto-tfs:v1",
  // Official TPS public-safety calls for service (#6682). Own key; not folded
  // into canadaAlerts / canadaRoads / torontoRoads. No map panel yet.
  torontoTps: "safety:toronto-tps:v1"
};
var FIVE_FACTOR_SCORECARD_READ_MODEL_KEY = "scorecard:five-factor:v1:read-model";
var SEED_META = {
  ukmtoIncidents: {
    key: "seed-meta:maritime:ukmto-incidents",
    maxStaleMin: 75,
    activationKey: "seed-activated:maritime:ukmto-incidents",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9831, activationKey: "seed-activated:maritime:ukmto-incidents" }
  },
  // scripts/seed-conflict-intel.mjs cron runs every 15min, while HAPI is gated
  // to one bulk refresh every 2h. Bounded above by
  // HAPI_TTL (360min / 6h) — the per-country data key's own Redis TTL — not
  // by cron headroom alone: this MUST fire before a per-country key can expire,
  // or users see empty data for up to 6h before health notices (#5554 review;
  // an earlier 720min value left exactly that blind spot). 300 (5h) is ~10x
  // the HAPI refresh interval (headroom for missed/lock-contended ticks) while staying
  // a full hour below the 6h data-expiry floor.
  humanitarianSummary: { key: "seed-meta:conflict:humanitarian", maxStaleMin: 300, minRecordCount: 41 },
  chinaCoverage: { key: "seed-meta:health:china-coverage", maxStaleMin: 180 },
  // Always-on loop publishes every few seconds. Five minutes tolerates deploy
  // churn while still detecting a stopped worker well before leases age out.
  companyMonitoringWorker: { key: "seed-meta:company-monitoring:worker", maxStaleMin: 5, workerControl: true },
  // Ticks every 5 minutes; 15 tolerates 2 missed ticks across a deploy.
  shippingWebhookWorker: {
    key: "seed-meta:shipping:webhook-worker",
    maxStaleMin: 15,
    activationKey: "seed-activated:shipping:webhook-worker",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9217,
      activationKey: "seed-activated:shipping:webhook-worker"
    }
  },
  earthquakes: {
    key: "seed-meta:seismology:earthquakes",
    maxStaleMin: 30,
    sourceFailure: {
      warnAfterConsecutive: 2,
      maxPendingMin: 10,
      successAtField: "lastSourceSuccessAt",
      failureCodePattern: /^EARTHQUAKE_UPSTREAM_INCOMPLETE$/
    }
  },
  wildfires: {
    key: "seed-meta:wildfire:fires",
    maxStaleMin: 360,
    sourceFailure: [
      { warnAfterConsecutive: 2, failureCodePattern: /^FIRMS_PARTIAL_COVERAGE$/ },
      {
        warnAfterConsecutive: 3,
        maxPendingMin: 180,
        successAtField: "lastSourceSuccessAt",
        sources: ["cwfis", "firms", "bc"],
        failureCodePattern: /^CWFIS_SOURCE_FAILED$/
      }
    ]
  },
  // FIRMS NRT resets at midnight UTC; new-day data takes 3-6h to accumulate
  wildfiresBootstrap: { key: "seed-meta:wildfire:fires-bootstrap", maxStaleMin: 360 },
  // Compact CDN payload is a distinct publish target; monitor it so canonical fallback cannot hide transform/write failures.
  // Derived summary the CII and temporal-anomaly rebuilds read (#9509). Same
  // seeder run and 2h TTL as the canonical key; monitored on its own so the
  // readers' canonical fallback cannot hide a broken summary write. Softened
  // until seed-fire-detections writes the durable marker on its first publish.
  wildfiresSummary: {
    key: "seed-meta:wildfire:fires-summary",
    maxStaleMin: 360,
    activationKey: "seed-activated:wildfire:fires-summary",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9509,
      activationKey: "seed-activated:wildfire:fires-summary"
    }
  },
  outages: { key: "seed-meta:infra:outages", maxStaleMin: 30 },
  // seed-live-video-resolved cron `0 */6 * * *` (#8545); 1080 = 3× cadence per
  // project convention. The PR registers the probe before the Railway service
  // exists, so it softens to EMPTY_ON_DEMAND only until the seeder's first
  // publish writes the activation marker; from then on it is strict forever
  // (EMPTY / STALE_SEED). Not in EMPTY_DATA_OK_KEYS: a dead cron must alarm.
  liveVideoResolved: {
    key: "seed-meta:live-video:resolved",
    maxStaleMin: 1080,
    activationKey: "seed-activated:live-video:resolved",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8545,
      activationKey: "seed-activated:live-video:resolved"
    }
  },
  climateAnomalies: { key: "seed-meta:climate:anomalies", maxStaleMin: 540 },
  // bundled into seed-bundle-climate (cron `0 */3 * * *`, every 3h); 540 = 3× cron cadence per project convention. Prior 240 (1.33× cron) flipped to silent-EMPTY between minute 180 (TTL_DATA expiry) and 240 (alarm trigger) on every routine cron-jitter cycle — see scripts/seed-climate-anomalies.mjs CACHE_TTL comment.
  climateDisasters: { key: "seed-meta:climate:disasters", maxStaleMin: 720 },
  // runs every 6h; 720min = 2x interval
  climateAirQuality: { key: "seed-meta:health:air-quality", maxStaleMin: 180 },
  // hourly cron; 180 = 3x interval — shares meta key with healthAirQuality (same seeder run)
  climateZoneNormals: { key: "seed-meta:climate:zone-normals", maxStaleMin: 89280 },
  // monthly cron on the 1st; 62d = 2x 31-day cadence
  co2Monitoring: { key: "seed-meta:climate:co2-monitoring", maxStaleMin: 4320 },
  // daily cron at 06:00 UTC; 72h tolerates two missed runs
  oceanIce: { key: "seed-meta:climate:ocean-ice", maxStaleMin: 2880 },
  // daily cron at 08:00 UTC; 48h = 2× interval, tolerates one missed run
  climateNews: { key: "seed-meta:climate:news-intelligence", maxStaleMin: 90 },
  // relay loop every 30min; 90 = 3× interval
  unrestEvents: { key: "seed-meta:unrest:events", maxStaleMin: 120 },
  // 45min cron; 120 = 2h grace (was 75 = 30min buffer, too tight)
  cyberThreats: { key: "seed-meta:cyber:threats", maxStaleMin: 240 },
  // 2h interval; 240min = 2x interval
  cryptoQuotes: { key: "seed-meta:market:crypto", maxStaleMin: 30 },
  etfFlows: { key: "seed-meta:market:etf-flows", maxStaleMin: 60 },
  gulfQuotes: { key: "seed-meta:market:gulf-quotes", maxStaleMin: 30 },
  stablecoinMarkets: { key: "seed-meta:market:stablecoins", maxStaleMin: 60 },
  naturalEvents: {
    key: "seed-meta:natural:events",
    maxStaleMin: 540,
    // 3h Railway climate bundle; 3x cadence preserves a full missed run.
    sourceFailure: {
      warnAfterConsecutive: 2,
      maxPendingMin: 210,
      successAtField: "lastSourceSuccessAt",
      failureCodePattern: /^NHC_(POINT_REQUEST_FAILED|POINT_RESPONSE_INVALID)$/
    }
  },
  hkoWarnings: { key: "seed-meta:weather:hko-warnings", maxStaleMin: 540 },
  // successful HKO responses publish a snapshot even when no tropical-cyclone warning is active.
  // #6987: moved off seed-meta:aviation:faa, which carries the FAA-ONLY alert
  // count. This probe's data key is the combined page-load aggregate, so a quiet
  // FAA window published recordCount=0 while 115 alerts were still being served
  // and classifyKey read that zero as EMPTY_DATA. seed-aviation now publishes a
  // meta from the aggregate's own payload, so the probe counts the population it
  // actually serves — and an aggregate that is genuinely empty still alarms.
  flightDelays: {
    key: "seed-meta:aviation:delays-bootstrap",
    maxStaleMin: 90,
    // CACHE_TTL=7200s; matches notamClosures from same cron
    cutover: { mode: "expiring-ack", fromKey: "seed-meta:aviation:faa", issue: 6987, status: "STALE_SEED" }
  },
  notamClosures: { key: "seed-meta:aviation:notam", maxStaleMin: 240 },
  // 2h interval; 240min = 2x interval
  // FAA NMS-API seeder (scripts/seed-notam-nms.mjs, */5 cron). Soft until the
  // first production publish writes the activation marker: the FAA issues
  // production credentials only after pre-prod validation.
  notamAirspace: {
    key: "seed-meta:aviation:notam-airspace",
    maxStaleMin: 20,
    // 4× the */5 Railway cron
    activationKey: "seed-activated:aviation:notam-nms:v1",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9635, activationKey: "seed-activated:aviation:notam-nms:v1" }
  },
  notamNmsClosures: {
    key: "seed-meta:aviation:notam-nms-closures",
    maxStaleMin: 20,
    // same run as notamAirspace
    activationKey: "seed-activated:aviation:notam-nms:v1",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9635, activationKey: "seed-activated:aviation:notam-nms:v1" }
  },
  predictionMarkets: {
    key: "seed-meta:prediction:markets",
    maxStaleMin: 90,
    minRecordCount: 20,
    // #5875: one is the narrowest floor that detects a dead category signal
    // without treating ordinary pool-volume variation as an incident.
    minPoolCounts: PREDICTION_MARKET_MIN_POOL_COUNTS
  },
  predictionCountryMarkets: {
    key: "seed-meta:prediction:markets-country-index",
    maxStaleMin: 90,
    minRecordCount: 1,
    activationKey: "seed-activated:prediction:markets-country-index",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 7489,
      activationKey: "seed-activated:prediction:markets-country-index"
    }
  },
  newsInsights: {
    key: "seed-meta:news:insights",
    maxStaleMin: 30,
    // `fetchedAt` is deliberately held at the served LKG timestamp when a
    // synthesis is rejected. This separate bounded contract warns before the
    // generic 30-minute seed-age gate when repeated attempts keep failing.
    synthesisFailure: {
      warnAfterConsecutive: 2,
      warnAfterAgeMin: 20,
      warnWithoutSuccess: true,
      // Declared explicitly rather than relying on readSeedMeta's fallback:
      // an omitted pattern silently DROPS every code the producer writes, so
      // the contract is only safe if each key names its own vocabulary. A test
      // asserts every synthesisFailure entry declares one.
      //
      // #5947: the LEAD_* codes and COMPOSER_ERROR name WHICH editorial gate
      // rejected the synthesis — GATE stays as the producer's residual bucket.
      // This list is the second source of truth for that vocabulary, and an
      // unmatched code is dropped SILENTLY, so widening the seeder's codes
      // without widening this makes them invisible in health. A test asserts
      // every INSIGHTS_SYNTHESIS_FAILURE_CODES value matches this pattern.
      failureCodePattern: /^INSIGHTS_SYNTHESIS_(PARSE|GATE|MISSING_CLUSTER|PROVIDER|COMPOSER_ERROR|LEAD_(EMPTY|UNCITED|PROPER_NOUN|NUMERIC_FACT|STATUS_QUALIFIER|GROUNDING))$/
    }
  },
  // #4920: daily GH Actions cadence; 2880 = 2x — one fully missed day alarms
  newsFeedHealth: { key: "seed-meta:news:feed-health", maxStaleMin: 2880 },
  newsRecallBenchmark: { key: "seed-meta:news:recall-benchmark", maxStaleMin: 2880 },
  marketQuotes: { key: "seed-meta:market:stocks", maxStaleMin: 30 },
  // #6235: the country-index RPC is seeded for every serviceable country in the
  // enum. The seeding pass is deliberately best-effort (one country's provider
  // failure must not cost the others their refresh) and therefore never
  // throws — so without this entry a run where every country failed would leave
  // seed-meta:market:stocks fresh and health green while the country caches
  // expired and the RPC silently reverted to per-request Yahoo fetches.
  // #6240: countries whose Yahoo symbol is dead carry `unavailable` in
  // shared/openapi-filter-param-contracts.json and are not seeded (38 of 45 as
  // of 2026-09-13). 30 leaves headroom for 8 transient failures;
  // tests/country-stock-index-health.test.mjs keeps it below the seedable count.
  countryStockIndexes: { key: "seed-meta:market:country-indexes", maxStaleMin: 30, minRecordCount: 30 },
  commodityQuotes: { key: "seed-meta:market:commodities", maxStaleMin: 30 },
  physicalPremiums: {
    key: "seed-meta:market:physical-premium",
    maxStaleMin: 4320,
    minRecordCount: 2,
    activationKey: "seed-activated:market:physical-premium",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 6436,
      activationKey: "seed-activated:market:physical-premium"
    }
  },
  physicalDivergence: {
    key: "seed-meta:market:physical-divergence",
    maxStaleMin: 4320,
    minRecordCount: 2,
    enforceInputFreshUntil: true,
    activationKey: "seed-activated:market:physical-divergence",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 6448,
      activationKey: "seed-activated:market:physical-divergence"
    }
  },
  goldExtended: { key: "seed-meta:market:gold-extended", maxStaleMin: 30 },
  goldEtfFlows: { key: "seed-meta:market:gold-etf-flows", maxStaleMin: 2880 },
  // SPDR publishes daily; 2× = 48h tolerance
  goldCbReserves: { key: "seed-meta:market:gold-cb-reserves", maxStaleMin: 44640 },
  // IMF IFS is monthly w/ ~2-3mo lag; 31d tolerance
  // RPC/warm-ping keys — seed-meta written by relay loops or handlers
  // serviceStatuses: moved to ON_DEMAND — RPC-populated, no dedicated seed, goes stale when no users visit
  cableHealth: { key: "seed-meta:cable-health", maxStaleMin: 90 },
  // ais-relay warm-ping runs every 30min; 90min = 3× interval catches missed pings without false positives
  submarineCables: { key: "seed-meta:infrastructure:submarine-cables", maxStaleMin: 25200 },
  macroSignals: { key: "seed-meta:economic:macro-signals", maxStaleMin: 150 },
  // seed-economy afterPublish-derived stress/macro key
  chinaMacro: { key: "seed-meta:economic:china-macro-transport", maxStaleMin: 4320 },
  // oldest required-source last success; preserved failures do not refresh it
  chinaReleaseCalendar: { key: "seed-meta:economic:china-release-calendar", maxStaleMin: 4320 },
  chinaCorporateDisclosures: { key: "seed-meta:market:china-corporate-disclosures", maxStaleMin: 180 },
  chinaStockConnect: { key: "seed-meta:market:china-stock-connect", maxStaleMin: 180 },
  // seed-no2-activity daily cron `20 6 * * *` (#9722); 4320 = 3x cadence.
  no2Activity: {
    key: "seed-meta:economic:no2-activity",
    maxStaleMin: 4320,
    activationKey: "seed-activated:economic:no2-activity",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9722,
      activationKey: "seed-activated:economic:no2-activity"
    }
  },
  crossStraitActivity: { key: "seed-meta:military:cross-strait-activity", maxStaleMin: 720 },
  crossStraitActivityBootstrap: { key: "seed-meta:military:cross-strait-activity-bootstrap", maxStaleMin: 720 },
  crossStraitActivityTaiwanMnd: {
    key: "seed-meta:military:cross-strait-activity:taiwan-mnd",
    maxStaleMin: 720,
    sourceFailure: {
      warnAfterConsecutive: 2,
      maxPendingMin: 210,
      failureCodePattern: /^MND_[A-Z0-9_]{1,60}$/
    }
  },
  // One X read per 12-hour UTC slot, run by a 3-hour bundle: a healthy read can
  // be 15h old, so 18h tolerates bundle lag but not a missed slot.
  crossStraitActivityJapanMod: { key: "seed-meta:military:cross-strait-activity:japan-mod", maxStaleMin: 1080 },
  chinaPolicyEvents: { key: "seed-meta:china:policy-events", maxStaleMin: 2160 },
  // decisionGroups (#6060): the seeder's afterPublish diagnostics name which
  // groups are quiet, stale, or unavailable, so a shortfall is actionable
  // rather than a bare 4/6. minRecordCount stays the verdict — it counts
  // operationally covered groups, which now includes a healthy quiet
  // disclosure window (the exchanges answered; there was nothing to report)
  // but no other unavailable cause.
  chinaDecisionSignals: {
    key: "seed-meta:intelligence:china-decision-signals",
    maxStaleMin: 180,
    minRecordCount: 6,
    decisionGroups: CHINA_DECISION_SIGNAL_GROUP_IDS
  },
  energyPrices: { key: "seed-meta:economic:energy-prices", maxStaleMin: 150 },
  // seed-economy primary runSeed resource
  bisPolicy: { key: "seed-meta:economic:bis", maxStaleMin: 10080 },
  // runSeed('economic','bis',...) writes seed-meta:economic:bis
  // seed-bis-extended.mjs is a child-process section spawned by
  // scripts/seed-bundle-macro.mjs. The bundle's Railway cron fires more
  // often than the per-section `intervalMs: 12 * HOUR` gate (production
  // logs 2026-04-26T08:00:45 show "BIS-Extended Skipped, last seeded
  // 175min ago, interval: 720min" — gate actively load-bearing on every
  // bundle tick). So the EFFECTIVE write cadence is governed by the 12h
  // gate, not the bundle cron. Per-dataset seed-meta is only written when
  // THAT dataset published fresh entries — so a single-dataset BIS outage
  // (e.g. WS_DSR 500s) goes STALE in health without dragging down the
  // healthy ones.
  //
  // The previous 1440 (= 2× the 12h gate, but only 1× the actual rolled-up
  // cadence after typical cron drift) had ZERO grace. All three keys
  // flipped to STALE_SEED synchronously at minute 1442 on 2026-04-27
  // (gate-eligible run delayed by ~24h after one failed intermediate cron).
  // 2160min = 3× the 12h gate covers cron drift + one degraded-to-24h
  // cycle, fires within 36h on a real outage.
  bisDsr: { key: "seed-meta:economic:bis-dsr", maxStaleMin: 2160 },
  bisPropertyResidential: { key: "seed-meta:economic:bis-property-residential", maxStaleMin: 2160 },
  bisPropertyCommercial: { key: "seed-meta:economic:bis-property-commercial", maxStaleMin: 2160 },
  imfMacro: { key: "seed-meta:economic:imf-macro", maxStaleMin: 100800 },
  // monthly seed; 100800min = 70 days = 2× interval (absorbs one missed run)
  imfGrowth: { key: "seed-meta:economic:imf-growth", maxStaleMin: 100800 },
  // monthly seed; 70d threshold matches imfMacro (same WEO release cadence)
  imfLabor: { key: "seed-meta:economic:imf-labor", maxStaleMin: 100800 },
  // monthly seed; 70d threshold matches imfMacro
  imfExternal: { key: "seed-meta:economic:imf-external", maxStaleMin: 100800 },
  // monthly seed; 70d threshold matches imfMacro
  // plan 2026-04-25-004 Phase 2: financialSystemExposure component seeders.
  // Bundle: scripts/seed-bundle-macro.mjs (Codex R1 #5, Option A).
  wbExternalDebt: { key: "seed-meta:economic:wb-external-debt", maxStaleMin: 100800 },
  // annual WB IDS publication; 70d threshold matches IMF cadence pattern
  // Weekly macro-bundle seed of quarterly IMF BOP/PIP + BIS LBS (#9394);
  // 10d = weekly interval + slack. Activation marker bridges deploy-before-first-tick.
  capitalFlows: {
    key: "seed-meta:economic:capital-flows",
    maxStaleMin: 14400,
    activationKey: "seed-activated:economic:capital-flows",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9394,
      activationKey: "seed-activated:economic:capital-flows"
    }
  },
  bisLbs: { key: "seed-meta:economic:bis-lbs", maxStaleMin: 14400 },
  // BIS LBS quarterly publication; 10d threshold = ~1× publish lag tolerance after macro bundle daily refresh
  fatfListing: { key: "seed-meta:economic:fatf-listing", maxStaleMin: 60480 },
  // FATF plenary 3×/year; 42d threshold = >1 plenary cycle (catches missed-update if cron silently fails)
  shippingRates: { key: "seed-meta:supply_chain:shipping", maxStaleMin: 1140 },
  chokepoints: { key: "seed-meta:supply_chain:chokepoints", maxStaleMin: 60, minRecordCount: 13 },
  // 13 canonical chokepoints; get-chokepoint-status writes covered-count → < 13 = upstream partial (portwatch/ArcGIS dropped some)
  // minerals + giving: on-demand cachedFetchJson only, no seed-meta writer — freshness checked via TTL
  // bisExchange + bisCredit: extras written by same BIS script via writeExtraKey, no dedicated seed-meta
  fxYoy: { key: "seed-meta:economic:fx-yoy", maxStaleMin: 1500 },
  // daily cron; 25h tolerance + 1h drift
  sharedFxRates: { key: "seed-meta:shared:fx-rates", maxStaleMin: 3600 },
  // daily seed; 60h tolerance covers a missed 25h cache refresh
  gpsjam: { key: "seed-meta:intelligence:gpsjam", maxStaleMin: 1440 },
  // Wingbits API (scripts/fetch-gpsjam.mjs); 1440min = 24h tolerance gives operator headroom to handle upstream outages and monthly quota exhaustion (HTTP 402 observed 2026-04-29) without dashboard noise. Seeder catch-block extends TTL on fail without refreshing fetchedAt, so STALE_SEED via age is the only alarm path.
  positiveGeoEvents: { key: "seed-meta:positive-events:geo", maxStaleMin: 60 },
  riskScores: { key: "seed-meta:intelligence:risk-scores", maxStaleMin: 30, minRecordCount: 2 },
  // CII warm-ping every 8min; recordCount is realtime signal-density coverage for score-relevant conflict (ACLED or UCDP) and news families, not raw feed availability; quiet-but-fresh feeds may warn COVERAGE_PARTIAL. Per-input availability (seed-meta `inputs`) is graded by composeRiskScoresInputHealth.
  riskScoresHistory: {
    key: "seed-meta:intelligence:risk-scores-history",
    maxStaleMin: 30,
    minRecordCount: 31,
    activationKey: CII_RISK_SCORE_CACHE_KEYS.dailyHistoryActivation,
    cutover: { mode: "activation-marker", fromKey: null, issue: 9354, activationKey: CII_RISK_SCORE_CACHE_KEYS.dailyHistoryActivation }
  },
  countryHistory: {
    key: "seed-meta:history:country",
    maxStaleMin: 2160,
    minRecordCount: 196,
    activationKey: "seed-activated:history:country",
    cutover: { mode: "activation-marker", fromKey: null, issue: 4276, activationKey: "seed-activated:history:country" }
  },
  iranEvents: { key: "seed-meta:conflict:iran-events", maxStaleMin: 45 },
  // ais-relay Middle East strike loop (Telegram + GDELT) every 10min; 45 = 4 missed ticks. The relay withholds seed-meta when the Telegram poll is stale or the classifier fails, so either outage turns STALE_SEED rather than reading a frozen feed as fresh.
  ucdpEvents: { key: "seed-meta:conflict:ucdp-events", maxStaleMin: 420 },
  ucdpEventsBootstrap: { key: "seed-meta:conflict:ucdp-events-bootstrap", maxStaleMin: 420 },
  // Same cron. Monitored separately because the bootstrap tier now hydrates from the compact projection, and a transform/write failure there must not hide behind a healthy canonical key (#5300).
  acledIntel: { key: "seed-meta:conflict:acled-intel", maxStaleMin: 38 },
  // conflict:acled:v1:all:0:0, now ACLED-or-GDELT fallback for the forecast EMA input (#5099).
  militaryFlights: { key: "seed-meta:military:flights", maxStaleMin: 30 },
  // cron ~10min (LIVE_TTL=600s); 30min = 3x interval,
  // These are late-stage outputs of the same ~10min seeder. Keep their
  // budgets tied to the cron rather than the payload TTL (24h), so a run that
  // writes flights and then dies still becomes visible as the downstream
  // snapshots age.
  militaryForecastInputs: { key: "seed-meta:military-forecast-inputs", maxStaleMin: 30 },
  militarySurges: { key: "seed-meta:military-surges", maxStaleMin: 30 },
  // #6845 item 3: staleness was invisible — the bases corpus was monitored
  // only through the presence of military:bases:active, which is a pointer, not
  // a clock: it stayed green while the corpus behind it aged indefinitely.
  //
  // Cadence: Military-Bases runs on seed-bundle-static-ref-heavy, NOT
  // seed-bundle-static-ref — #6806 split the three expensive members onto their
  // own daily cron because they could not share leftover's 570s tick. The
  // member's own intervalMs is unchanged at 30 * DAY, so 86_400min (60d) is
  // still two intervals.
  //
  // The heavy bundle rotates its lead slot (dayIndex % 3), so a member that has
  // become due waits at most ~3 days for a tick it can be admitted on. Worst
  // case is therefore ~33d, not 30d — comfortably inside the 60d budget, and
  // the reason this is not sized any tighter.
  //
  // This config uses the existing militaryBases standalone check. Its data key
  // is the active-version pointer, while this seed-meta supplies the freshness
  // clock and integrity floor for the version behind that pointer. The
  // ON_DEMAND entry keeps an absent pointer soft here; /api/seed-health uses
  // that same atomicSwitch pointer to distinguish a never-published deployment
  // from a published corpus whose seed-meta was later lost.
  //
  // Pre-seed rather than an acknowledgement: the key is already seeded, and
  // classifyKey against the live value returns OK (14,730min of an 86,400min
  // budget; 125,380 records over the 100,000 floor). An expiring
  // acknowledgement here would declare a status the probe does not produce.
  militaryBases: {
    key: "seed-meta:military:bases",
    maxStaleMin: 86400,
    minRecordCount: 1e5,
    cutover: {
      mode: "preseed",
      fromKey: null,
      issue: 6845,
      verifiedAt: "2026-08-19T08:33:42.000Z",
      evidence: {
        platform: "railway",
        service: "seed-bundle-static-ref-heavy",
        probeKey: "seed-meta:military:bases",
        compactHealthStatus: "OK",
        reference: "https://github.com/koala73/worldmonitor/issues/6845#issuecomment-5339597917"
      }
    }
  },
  militaryCii: { key: "seed-meta:intelligence:military-cii", maxStaleMin: 45 },
  // seed-military-cii cron ~10min; 45 = generous grace (relay-dependent; preserve-last-good runs still refresh meta)
  defensePatents: { key: "seed-meta:military:defense-patents", maxStaleMin: 25200 },
  satellites: { key: "seed-meta:intelligence:satellites", maxStaleMin: 240 },
  // CelesTrak every 120min; 240min = absorbs one missed cycle
  temporalAnomalies: { key: "seed-meta:temporal:anomalies", maxStaleMin: 45 },
  // rebuild-stamped ONLY (TEMPORAL_ANOMALIES_REBUILD_AFTER_MS=20min in infrastructure/v1/_shared.ts) — only producer-route traffic can rebuild and refresh this request-driven stamp, so a traffic lull can age it past 45min; 45min leaves ~2.25x margin. Data TTL is 60min so health reaches STALE_SEED before EMPTY. Content freshness is a separate clock: the producer stamps newestItemAt/maxContentAgeMin from all five COUNT_SOURCE_KEYS payloads (news, FIRMS, military flights, theater-posture vessels, AIS gaps — TEMPORAL_ANOMALIES_MAX_CONTENT_AGE_MIN); a frozen-but-200 upstream keeps fetchedAt fresh and reads STALE_CONTENT.
  weatherAlerts: {
    key: "seed-meta:weather:alerts",
    maxStaleMin: 45,
    sourceFailure: {
      warnAfterConsecutive: 2,
      maxPendingMin: 20,
      successAtField: "lastSourceSuccessAt",
      failureCodePattern: /^WEATHER_ALERT_SOURCE_INCOMPLETE$/,
      sources: ["nws", "eccc", "swic"]
    }
  },
  // Public-bulletin seeder (#7005, #7730). This is an activation-marker cutover
  // rather than a 24h expiring acknowledgement.
  // Softening stays on-demand until the durable marker is written.
  imdCycloneMarine: {
    key: "seed-meta:weather:imd-cyclone-marine",
    maxStaleMin: 45,
    // 3× the live */15 Railway cron
    activationKey: "seed-activated:weather:imd-cyclone-marine:v2",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 7005,
      activationKey: "seed-activated:weather:imd-cyclone-marine:v2"
    }
  },
  canadaRoads: {
    key: "seed-meta:infra:ontario-511",
    maxStaleMin: 45,
    // seed-provincial-511 cron */15; 45 = 3× interval
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6608,
      status: "EMPTY"
    }
  },
  albertaRoads: {
    key: "seed-meta:infra:alberta-511",
    maxStaleMin: 45,
    // same seed-provincial-511 cron */15; 45 = 3× interval
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6612,
      status: "EMPTY"
    }
  },
  manitobaRoads: {
    key: "seed-meta:infra:manitoba-511",
    maxStaleMin: 45,
    // same seed-provincial-511 cron */15; 45 = 3× interval
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6622,
      status: "EMPTY"
    }
  },
  torontoRoads: {
    key: "seed-meta:infra:toronto-roads",
    maxStaleMin: 360,
    // seed-bundle-canada member interval 2h; 360 = 3× interval. At the old 45 (sized for a */15 cron) a healthy 2h publisher read STALE_SEED permanently, because normal data age reaches 120min.
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6609,
      status: "EMPTY"
    }
  },
  bcOpen511: {
    key: "seed-meta:infra:bc-open511",
    maxStaleMin: 90,
    // seed-bundle-canada member interval 30min; 90 = 3× interval, and matches this seeder's own 5400s TTL. At the old 45 a single missed tick tripped STALE_SEED.
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6611,
      status: "EMPTY"
    }
  },
  canadaAlerts: {
    key: "seed-meta:alerts:canada-union",
    maxStaleMin: 45,
    // union rebuilds on the */15 Alberta tick; 45 = 3× interval
    cutover: {
      mode: "expiring-ack",
      fromKey: "seed-meta:alerts:alberta-aea",
      issue: 6659,
      status: "EMPTY"
    }
  },
  canadaAlertsAbSource: {
    key: "seed-meta:alerts:alberta-aea",
    maxStaleMin: 45,
    // seed-alberta-emergency-alert cron */15; 45 = 3× interval
    cutover: { mode: "expiring-ack", fromKey: null, issue: 6659, status: "EMPTY" }
  },
  // Event modification dates do not expire BC orders; fetchedAt ages active-list verification.
  canadaAlertsBcSource: {
    key: "seed-meta:alerts:bc-emergency-info",
    maxStaleMin: 45,
    cutover: { mode: "expiring-ack", fromKey: null, issue: 6659, status: "EMPTY" }
  },
  canadaAlertsSkSource: {
    key: "seed-meta:alerts:saskalert",
    maxStaleMin: 45,
    cutover: { mode: "expiring-ack", fromKey: null, issue: 6659, status: "STALE_SEED" }
  },
  // seed-meta is `seed-meta:${domain}:${resource}` from runSeed('transit', 'ttc-alerts'),
  // so the key takes a HYPHEN — it is NOT the canonical transit:ttc:alerts:v1 with
  // :v1 stripped. The colon form probed a key the seeder never writes, which reads
  // absent forever no matter how healthy the seeder is.
  ttcAlerts: { key: "seed-meta:transit:ttc-alerts", maxStaleMin: 30, cutover: { mode: "expiring-ack", fromKey: null, issue: 6623, status: "EMPTY" } },
  // 5min bundle member; 30 = 6× interval. Empty until first Railway tick is an expiring acknowledgement, not a crit.
  // #7012/#7036 TPS Open Data, now seed-bundle-canada members at a 6h interval;
  // 1080 = 3× interval, the same sizing rule torontoRoads documents. The old
  // 14d was sized for a manual writer and would have hidden a stopped bundle
  // for two weeks — the opposite of what a scheduled publisher needs. Content
  // age stays governed separately by the adapter's maxContentAgeMin, so this
  // bound is about the seeder running, not about upstream refreshing. GTA
  // Update is intentionally absent: its writer is disabled pending the rights gate.
  tpsMci: { key: "seed-meta:safety:tps-mci", maxStaleMin: 1080, cutover: { mode: "expiring-ack", fromKey: null, issue: 7035, status: "EMPTY" } },
  tpsCallsAttended: { key: "seed-meta:safety:tps-calls-attended", maxStaleMin: 1080, cutover: { mode: "expiring-ack", fromKey: null, issue: 7036, status: "EMPTY" } },
  torontoTfs: {
    key: "seed-meta:safety:toronto-tfs",
    maxStaleMin: 15,
    // TFS live CAD refreshes every ~5min; 15 = 3× interval
    activationKey: "seed-activated:safety:toronto-tfs",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 7037,
      activationKey: "seed-activated:safety:toronto-tfs"
    }
  },
  torontoTps: {
    key: "seed-meta:safety:toronto-tps",
    maxStaleMin: 90,
    activationKey: "seed-activated:safety:toronto-tps",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 7038,
      activationKey: "seed-activated:safety:toronto-tps"
    }
  },
  spending: { key: "seed-meta:economic:spending", maxStaleMin: 120 },
  globalTenders: { key: "seed-meta:economic:global-tenders", maxStaleMin: 180 },
  // Per-source tender health: the producer keeps a failed source's last-good
  // open tenders for 24h (TENDER_SOURCE_RETENTION_MS in scripts/_global-tenders.mjs),
  // and seed-meta fetchedAt is the last SUCCESS, so a rate-limited, unpublished
  // or weekend-quiet portal is OK until that success is a day old, then
  // STALE_SEED. sourceFailureWithinBudgetOk keeps a failed attempt from
  // reporting SEED_ERROR inside that budget only while the source still serves
  // something true: retained rows ('stale') or a verified empty result. An
  // 'error' with nothing retained still warns.
  globalTendersSam: { key: "seed-meta:economic:global-tenders:sam", maxStaleMin: 1440, sourceFailureWithinBudgetOk: true },
  globalTendersTed: { key: "seed-meta:economic:global-tenders:ted", maxStaleMin: 1440, sourceFailureWithinBudgetOk: true },
  // Contracts Finder keeps its bespoke first-failure containment instead
  // (composeContractsFinderHealth), which recounts usable canonical rows.
  globalTendersContractsFinder: { key: "seed-meta:economic:global-tenders:contracts-finder", maxStaleMin: 180 },
  globalTendersCanadaBuys: { key: "seed-meta:economic:global-tenders:canada-buys", maxStaleMin: 1440, sourceFailureWithinBudgetOk: true },
  globalTendersGets: { key: "seed-meta:economic:global-tenders:gets", maxStaleMin: 1440, sourceFailureWithinBudgetOk: true },
  globalTendersWorldBank: { key: "seed-meta:economic:global-tenders:world-bank", maxStaleMin: 1440, sourceFailureWithinBudgetOk: true },
  globalTendersColombiaSecop: {
    key: "seed-meta:economic:global-tenders:colombia-secop",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:colombia-secop",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:colombia-secop" }
  },
  globalTendersKenyaPpip: {
    key: "seed-meta:economic:global-tenders:kenya-ppip",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:kenya-ppip",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:kenya-ppip" }
  },
  globalTendersSouthAfricaEtenders: {
    key: "seed-meta:economic:global-tenders:south-africa-etenders",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:south-africa-etenders",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:south-africa-etenders" }
  },
  globalTendersChileMercadoPublico: {
    key: "seed-meta:economic:global-tenders:chile-mercado-publico",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:chile-mercado-publico",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:chile-mercado-publico" }
  },
  globalTendersBrazilPncp: {
    key: "seed-meta:economic:global-tenders:brazil-pncp",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:brazil-pncp",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:brazil-pncp" }
  },
  globalTendersUkraineProzorro: {
    key: "seed-meta:economic:global-tenders:ukraine-prozorro",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:ukraine-prozorro",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:ukraine-prozorro" }
  },
  globalTendersBulgariaEop: {
    key: "seed-meta:economic:global-tenders:bulgaria-eop",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:bulgaria-eop",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:bulgaria-eop" }
  },
  globalTendersLatviaIub: {
    key: "seed-meta:economic:global-tenders:latvia-iub",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:latvia-iub",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:latvia-iub" }
  },
  globalTendersPolandBzp: {
    key: "seed-meta:economic:global-tenders:poland-bzp",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:poland-bzp",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:poland-bzp" }
  },
  globalTendersPakistanPpra: {
    key: "seed-meta:economic:global-tenders:pakistan-ppra",
    maxStaleMin: 1440,
    sourceFailureWithinBudgetOk: true,
    activationKey: "seed-activated:economic:global-tenders:pakistan-ppra",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9840, activationKey: "seed-activated:economic:global-tenders:pakistan-ppra" }
  },
  techEvents: { key: "seed-meta:research:tech-events", maxStaleMin: 480 },
  techEventsSeeder: {
    key: "seed-meta:research:tech-events:seeder",
    maxStaleMin: 180,
    cutover: {
      mode: "preseed",
      fromKey: null,
      issue: 8572,
      verifiedAt: "2026-09-24T08:57:09.430Z",
      evidence: {
        platform: "railway",
        service: "seed-research",
        probeKey: "seed-meta:research:tech-events:seeder",
        compactHealthStatus: "OK",
        reference: "https://github.com/koala73/worldmonitor/blob/codex/8572-tech-events-feed-health/docs/snapshots/tech-events-seeder-preseed-2026-09-24.json"
      }
    }
  },
  researchArxivHnTrending: { key: "seed-meta:research:arxiv-hn-trending", maxStaleMin: 150 },
  gdeltIntel: { key: "seed-meta:intelligence:gdelt-intel", maxStaleMin: 45 },
  // 15min bulk materializer; 45min = 3× cadence and expires before the 24h canonical key.
  gdeltDyadTension: {
    key: "seed-meta:gdelt:bulk:dyad-tension",
    maxStaleMin: 45,
    activationKey: "seed-activated:gdelt:bulk:dyad-tension",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8676,
      activationKey: "seed-activated:gdelt:bulk:dyad-tension"
    }
  },
  // 15-minute derived-signals section; 45 = 3 missed runs.
  tensionEvidence: {
    key: "seed-meta:intelligence:tension-evidence",
    maxStaleMin: 45,
    activationKey: "seed-activated:intelligence:tension-evidence",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8676,
      activationKey: "seed-activated:intelligence:tension-evidence"
    }
  },
  // Same materializer tick; pending until its first country-events publish
  // writes the durable marker, strict after it. The 32-day data TTL outlives this gate.
  gdeltCountryEvents: {
    key: "seed-meta:gdelt:bulk:country-events",
    maxStaleMin: 45,
    activationKey: "seed-activated:gdelt:bulk:country-events",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 7582,
      activationKey: "seed-activated:gdelt:bulk:country-events"
    }
  },
  // ais-relay strike loop (10min) adds each healthy window to the 30-day tally;
  // seed-meta advances only on a healthy cycle, like iranEvents. Pending until
  // the first healthy tally publish writes the durable marker, strict after it.
  // The 35-day data TTL outlives this gate.
  strikePressure: {
    key: "seed-meta:conflict:strike-pressure",
    maxStaleMin: 45,
    activationKey: "seed-activated:conflict:strike-pressure",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 7582,
      activationKey: "seed-activated:conflict:strike-pressure"
    }
  },
  // Same materializer tick as gdeltIntel; the 2-day data TTL outlives this
  // gate. Pending until the materializer's first successful index publish
  // writes the durable marker, strict after it (#7748).
  gdeltCountryArticles: {
    key: "seed-meta:gdelt:bulk:country-articles",
    maxStaleMin: 45,
    activationKey: "seed-activated:gdelt:bulk:country-articles",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 7748,
      activationKey: "seed-activated:gdelt:bulk:country-articles"
    }
  },
  telegramFeed: { key: "seed-meta:intelligence:telegram-feed:v1", maxStaleMin: 10 },
  // 60s poll interval; 10min grace catches poll failures before they go stale in the panel
  xFeed: { key: "seed-meta:intelligence:x-feed:v1", maxStaleMin: 45 },
  // Fixed 15min List slots; 45min = 3 missed slots. Freshness advances only after an accepted page is published.
  digestNotifications: { key: "seed-meta:digest:last-run", maxStaleMin: 90 },
  // Railway digest-notifications cron runs every 30min; 90 = 3x cadence and detects a dead cron before daily digests are missed.
  forecasts: { key: "seed-meta:forecast:predictions", maxStaleMin: 90 },
  forecastProbabilityTrail: {
    key: "seed-meta:forecast:probability-trail",
    maxStaleMin: 90,
    activationKey: "seed-activated:forecast:probability-trail",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9353, activationKey: "seed-activated:forecast:probability-trail" }
  },
  forecastArchive: {
    key: "seed-meta:forecast:archive",
    maxStaleMin: 2160,
    activationKey: "seed-activated:forecast:archive",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9353, activationKey: "seed-activated:forecast:archive" }
  },
  forecastsBootstrap: { key: "seed-meta:forecast:predictions-bootstrap", maxStaleMin: 90 },
  // Same cron. Monitored separately: the fast tier now hydrates from the dashboard list, and a transform/write failure there must not hide behind a healthy canonical key (#5300).
  forecastResolutions: { key: "seed-meta:forecast:resolutions", maxStaleMin: 2160 },
  // daily Bet-2 resolver; 36h catches a missed cron without flapping on normal daily jitter
  forecastScorecard: { key: "seed-meta:forecast:scorecard", maxStaleMin: 2160 },
  // scorecard extra key written by seed-forecast-resolutions
  // #7070 shadow calibration map, extra key of seed-forecast-resolutions.
  forecastCalibrationMap: {
    key: "seed-meta:forecast:calibration-map",
    maxStaleMin: 2160,
    activationKey: "seed-activated:forecast:calibration-map",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 7070,
      activationKey: "seed-activated:forecast:calibration-map"
    }
  },
  // #8867 market-alert ledger and its scorecard, written every 5-minute tick
  // by seed-market-alert-ledger (seed-bundle-derived-signals). Both bind the
  // one activation marker the seeder sets after its first publish.
  marketAlertLedger: {
    key: "seed-meta:correlation:market-alerts",
    maxStaleMin: 30,
    activationKey: "seed-activated:correlation:market-alerts",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8867,
      activationKey: "seed-activated:correlation:market-alerts"
    }
  },
  marketAlertScorecard: {
    key: "seed-meta:correlation:market-alerts-scorecard",
    maxStaleMin: 30,
    activationKey: "seed-activated:correlation:market-alerts",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8867,
      activationKey: "seed-activated:correlation:market-alerts"
    }
  },
  forecastBets: { key: "seed-meta:forecast:bets", maxStaleMin: 2880 },
  // #5233 shadow bet-engine seeder; daily cron (05:00 UTC), 48h = 2× interval
  forecastMarketsResolution: { key: "seed-meta:prediction:markets-resolution", maxStaleMin: 2160 },
  // #5525 market settlement feed; written every resolver run (even zero-due), so it shares the resolver's 36h window
  forecastFunnel: { key: "seed-meta:forecast:funnel:health:v1", maxStaleMin: 180 },
  // funnel-diversity guardrail (#5233); written by seed-forecasts afterPublish each hourly run (3× cadence). A collapsed funnel (too few domains / mostly synthetic) is recorded as information and never sets status:'error' (#8990)
  sectors: { key: "seed-meta:market:sectors", maxStaleMin: 30 },
  techReadiness: { key: "seed-meta:economic:worldbank-techreadiness:v1", maxStaleMin: 10080 },
  progressData: { key: "seed-meta:economic:worldbank-progress:v1", maxStaleMin: 10080 },
  renewableEnergy: { key: "seed-meta:economic:worldbank-renewable:v1", maxStaleMin: 10080 },
  intlDelays: { key: "seed-meta:aviation:intl", maxStaleMin: 90 },
  // #6987: faaDelays used to have no entry here, on the grounds that it "shares
  // flightDelays's meta key". That sharing WAS the bug — it leaked FAA's
  // allowed-empty count into the aggregate probe, which is not allowed to be
  // empty. Now that flightDelays reads the aggregate's own meta, the FAA sidecar
  // gets an explicit entry rather than an implicit one (ported from #6988).
  //
  // faaDelays stays in EMPTY_DATA_OK_KEYS, so a quiet FAA window remains a VALID
  // state; this entry adds the staleness coverage it never had, which is the
  // half that was genuinely missing.
  faaDelays: {
    key: "seed-meta:aviation:faa",
    maxStaleMin: 90,
    // Pre-seed, not an acknowledgement: the key itself has existed for a long
    // time (it was registered under flightDelays), so classifyKey against the
    // live value already returns OK. recordCount=0 is VALID here because
    // faaDelays is in EMPTY_DATA_OK_KEYS.
    cutover: {
      mode: "preseed",
      fromKey: null,
      issue: 6987,
      verifiedAt: "2026-08-20T10:36:00.000Z",
      evidence: {
        platform: "railway",
        service: "seed-aviation",
        probeKey: "seed-meta:aviation:faa",
        compactHealthStatus: "OK",
        reference: "https://github.com/koala73/worldmonitor/issues/6987#issuecomment-5354967398"
      }
    }
  },
  theaterPosture: { key: "seed-meta:theater-posture", maxStaleMin: 60 },
  correlationCards: { key: "seed-meta:correlation:cards", maxStaleMin: 30 },
  // 5min cron (seed-bundle-derived-signals); 30min = 6× interval. Was 15 (3× = gold-standard floor) — overnight UptimeRobot flips when bundle jitter spaced two consecutive runs ~9-10min apart, producing 15-19min gaps that tripped STALE_SEED briefly. See WM 2026-05-10 health:failure-log.
  portwatch: { key: "seed-meta:supply_chain:portwatch", maxStaleMin: 720 },
  portwatchDisruptions: { key: "seed-meta:portwatch:disruptions", maxStaleMin: 150 },
  // 12h cron; 36h = 3x interval; #3613 requires full 174-country coverage before OK.
  // requireContentFreshness (#6060): cardinality and transport freshness alone
  // let a 174/174 run report healthy while China's cached observation was 170h
  // old — past the 144h budget the China corridor adapter and activity-nowcast
  // enforce. The seeder publishes contentFreshness; a missing block is
  // COVERAGE_DEGRADED, a stale country is STALE_CONTENT.
  //
  // The value is the country set health REQUIRES the producer to cover, not a
  // bare `true`: it mirrors PORTWATCH_DECISION_CRITICAL_COUNTRIES in
  // scripts/seed-portwatch-port-activity.mjs and CHINA_CORRIDOR_KEYS in
  // get-china-corridor-control-towers.ts, and it exists so a producer-side
  // change cannot narrow the alarm scope without health noticing.
  portwatchPortActivity: { key: "seed-meta:supply_chain:portwatch-ports", maxStaleMin: 2160, minRecordCount: 174, requireContentFreshness: { countries: ["CN", "HK"], budgetMinutes: 10 * 24 * 60 }, contentFreshnessActivation: "portwatchContentFreshness" },
  corridorrisk: { key: "seed-meta:supply_chain:corridorrisk", maxStaleMin: 120 },
  // Gate-to-gate counting (#9551) only measures straits AISStream's shore
  // receivers can see. A 2026-10-31 probe and 42h of gate journals found zero
  // positions at the narrows of Hormuz, Suez, Bab el-Mandeb, Malacca, Panama,
  // Taiwan, Bosporus, Korea, Kerch and Lombok; the old 5/13 came from 2° circles
  // counting nearby port traffic. Dover, Gibraltar and Cape are the measurable
  // set: the floor is three, and composeChokepointTransitsCoverage requires
  // those three by name. PortWatch supplies the rest.
  chokepointTransits: { key: "seed-meta:supply_chain:chokepoint_transits", maxStaleMin: 30, minRecordCount: 3 },
  transitSummaries: { key: "seed-meta:supply_chain:transit-summaries", maxStaleMin: 30 },
  // relay every 10min; 30min = 3x interval,
  usniFleet: { key: "seed-meta:military:usni-fleet", maxStaleMin: 720 },
  // relay loop every 6h; 720 = 2× interval (was 480 = 1.3×, too tight)
  aisGaps: {
    key: "seed-meta:maritime:ais-gaps",
    maxStaleMin: 30,
    // relay loop every 10min; feeds the temporal anomalies ais_gaps count source (COUNT_SOURCE_KEYS #7574). 30min = 3× interval, matching militaryFlights' budget style.
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 7574,
      // Bounded deploy-order window: until the Railway relay's first publish,
      // the data key is absent and reads plain EMPTY. Acknowledged with an
      // expiry bounded to the first scheduled producer run.
      status: "EMPTY"
    }
  },
  securityAdvisories: { key: "seed-meta:intelligence:advisories", maxStaleMin: 120 },
  secCikMap: { key: "seed-meta:intelligence:sec-cik-map", maxStaleMin: 2880, minRecordCount: 5e3 },
  // daily bundle section; 2880min = 48h = 2x interval. minRecordCount mirrors MIN_CIK_ENTRIES in scripts/seed-sec-cik-map.mjs.
  sec8kStream: { key: "seed-meta:intelligence:sec-8k-stream", maxStaleMin: 120, minRecordCount: 50 },
  // 30min bundle section; 120min = 4x interval. minRecordCount mirrors MIN_STREAM_EVENTS in scripts/seed-sec-8k-stream.mjs — a drained window means Atom-parse decay, not a quiet market.
  customsRevenue: { key: "seed-meta:trade:customs-revenue", maxStaleMin: 1440 },
  // 6h cron, 24h data TTL (US_HTS_TTL); 132 measures in HTS 2026 Rev 21.
  // seed-supply-chain-trade sets the marker after its first catalog publish.
  usHtsDuties: {
    key: "seed-meta:trade:us-hts:catalog",
    maxStaleMin: 1440,
    minRecordCount: 100,
    activationKey: "seed-activated:trade:us-hts",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9086,
      activationKey: "seed-activated:trade:us-hts"
    }
  },
  comtradeFlows: { key: "seed-meta:trade:comtrade-flows", maxStaleMin: 2880 },
  // 24h cron; 2880min = 48h = 2x interval
  comtradeBilateralHs4: { key: "seed-meta:comtrade:bilateral-hs4", maxStaleMin: 50400, minRecordCount: 110 },
  // 35d health budget for monthly seed; 40d payload/meta TTL leaves a 5d stale-but-queryable warning window. minRecordCount mirrors MIN_COUNTRY_COVERAGE in scripts/seed-comtrade-bilateral-hs4.mjs (110 of 197 clusters) so a shrunken run reads COVERAGE_PARTIAL, not OK — without it 3-of-197 and 197-of-197 were indistinguishable for the full 35d window.
  supplyVulnerability: {
    key: "seed-meta:supply-chain:vulnerability",
    maxStaleMin: 2880,
    minRecordCount: 110,
    minRankableRecordCount: SUPPLY_VULNERABILITY_MIN_RANKABLE_RECORD_COUNT,
    requiredRedistributionPolicyVersion: 1,
    // Mirrors buildVulnerabilityCoverageRequirements() in
    // scripts/shared/supply-vulnerability-coverage.mjs; the operations test pins
    // this object to that output. completeCountryCount is diagnostic only.
    requireVulnerabilityCoverage: {
      countrySpecificImportCountryCount: 110,
      globalProductionCommodityCount: 1,
      rankableCountryCount: 110,
      rankableRecordCount: SUPPLY_VULNERABILITY_MIN_RANKABLE_RECORD_COUNT,
      freshRankableRecordCount: 1,
      reviewedCommodityCount: 23,
      reviewedHs4Count: 22,
      reviewedHs2Count: 9
    },
    activationKey: "seed-activated:supply-chain:vulnerability",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 6449,
      activationKey: "seed-activated:supply-chain:vulnerability"
    }
  },
  supplyChokepointDependencies: {
    key: "seed-meta:supply-chain:chokepoint-dependencies",
    maxStaleMin: 2880,
    minRecordCount: 7,
    requiredRedistributionPolicyVersion: 1,
    activationKey: "seed-activated:supply-chain:vulnerability",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 6449,
      activationKey: "seed-activated:supply-chain:vulnerability"
    }
  },
  blsSeries: { key: "seed-meta:economic:bls-series", maxStaleMin: 2880 },
  // daily seed; 2880min = 48h = 2x interval
  sanctionsPressure: { key: "seed-meta:sanctions:pressure", maxStaleMin: 720 },
  // 6h cron; 12h = 2× interval, before the 18h data TTL
  crossSourceSignals: { key: "seed-meta:intelligence:cross-source-signals", maxStaleMin: 30 },
  // 15min cron; 30min = 2x interval
  regionalSnapshots: { key: "seed-meta:intelligence:regional-snapshots", maxStaleMin: 720 },
  // 6h cron via seed-bundle-derived-signals; 720min = 12h = 2x interval
  regionalBriefs: { key: "seed-meta:intelligence:regional-briefs", maxStaleMin: 20160 },
  // weekly cron; 20160min = 14 days = 2x interval
  sanctionsEntities: { key: "seed-meta:sanctions:entities", maxStaleMin: 720 },
  // same 6h producer; co-pinned with pressure so both alarm before the 18h TTL
  sanctionsChanges: {
    key: "seed-meta:sanctions:changes",
    maxStaleMin: 720,
    activationKey: "seed-activated:sanctions:changes",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9352, activationKey: "seed-activated:sanctions:changes" }
  },
  radiationWatch: { key: "seed-meta:radiation:observations", maxStaleMin: 30 },
  groceryBasket: { key: "seed-meta:economic:grocery-basket", maxStaleMin: 10080 },
  // weekly seed; 10080 = 7 days
  bigmac: { key: "seed-meta:economic:bigmac", maxStaleMin: 10080 },
  // weekly seed; 10080 = 7 days
  fuelPrices: { key: "seed-meta:economic:fuel-prices", maxStaleMin: 10080 },
  // weekly seed; 10080 = 7 days
  faoFoodPriceIndex: { key: "seed-meta:economic:fao-ffpi", maxStaleMin: 86400 },
  // monthly seed; 86400 = 60 days (2x interval)
  thermalEscalation: { key: "seed-meta:thermal:escalation", maxStaleMin: 360 },
  // cron every 2h; 360 = 3x interval (was 240 = 2x)
  thermalEscalationBootstrap: { key: "seed-meta:thermal:escalation-bootstrap", maxStaleMin: 360 },
  // Same cron as above. Monitored separately because the bootstrap tier now hydrates from the compact projection, and a transform/write failure there must not hide behind a healthy canonical key (#5300).
  nationalDebt: { key: "seed-meta:economic:national-debt", maxStaleMin: 86400 },
  // monthly seed (seed-bundle-macro intervalMs: 30 * DAY); 60d = 2x interval absorbs one missed run. Prior 10080 (7d) was narrower than the cron interval so every cron past day 7 alarmed STALE_SEED.
  // recordCount is the number of reporter/World pairs actually published, so a
  // shortfall reads as COVERAGE_PARTIAL (warn) while a dead seeder still reads
  // as STALE_SEED — which is the distinction #6309 needs: "WTO never had this
  // combination" and "the seeder stopped" must not share one verdict.
  // Floor derived from measurement, not from the fixture, and measured against
  // the rule THIS change ships rather than the one it replaced: a 47-reporter
  // spread (every 6th of the 278 the WTO /reporters endpoint advertises) driven
  // through the real fetchFlowPair on 2026-08-07 published 46, a 97.9% rate,
  // projecting ~272 pairs. That is above the 256 the old seeder held in Redis —
  // the both-indicators gate costs nothing in practice (0 one-sided years across
  // the sample) while the 30-year window picks up reporters with no recent data.
  // 200 leaves ~26% headroom for reporter-list drift and still fires well before
  // a real collapse.
  // maxStaleMin sits INSIDE the 1440min (24h, #4873) TRADE_TTL, not outside it. This is
  // a meta-only probe (STANDALONE_KEYS.tradeFlows is the seed-meta key itself,
  // because the payload is sharded one key per reporter), so the hasData/EMPTY
  // backstop watches the meta record — which writeSeedMeta gives a 7-day TTL —
  // and not the 24h data keys. Nothing else would notice the data expiring. A
  // budget past 1440 would therefore be silently green while every flow key was
  // already gone. 1140 = three 6h ticks plus one hour of grace, so health reaches
  // STALE_SEED 5 hours BEFORE the keys it vouches for lapse. Same shape as the
  // meta-only comtradeBilateralHs4 entry above (35d budget, 40d payload TTL).
  tradeFlows: { key: "seed-meta:trade:flows", maxStaleMin: 1140, legacyMaxStaleMin: 420, minRecordCount: 200, dominantFailureMode: true },
  // Same meta-only shape as tradeFlows above (#6316 moved tariffs off the
  // single-key US years=10 probe). maxStaleMin 1140 sits inside TARIFF_TTL
  // (1440min since #4873); minRecordCount 150 leaves headroom under a ~200+ reporter fleet.
  tariffTrendsUs: { key: "seed-meta:trade:tariffs", maxStaleMin: 1140, legacyMaxStaleMin: 420, minRecordCount: 150 },
  // publish.ts runs each day at 02:30-05:30 UTC (hourly); seed-meta TTL=52h — maxStaleMin must cover the full 24h cycle
  consumerPricesOverview: { key: "seed-meta:consumer-prices:overview:ae", maxStaleMin: 1500, minSuccessRate: 0.5 },
  // 25h = 24h cadence + 1h grace; warn when <50% snapshots succeeded
  consumerPricesCategories: { key: "seed-meta:consumer-prices:categories:ae:30d", maxStaleMin: 1500 },
  consumerPricesMovers: { key: "seed-meta:consumer-prices:movers:ae:30d", maxStaleMin: 1500 },
  consumerPricesSpread: { key: "seed-meta:consumer-prices:retailer-spread:ae:essentials-ae", maxStaleMin: 1500 },
  consumerPricesFreshness: { key: "seed-meta:consumer-prices:freshness:ae", maxStaleMin: 1500 },
  consumerPricesCoverage: { key: "seed-meta:consumer-prices:coverage:ae", maxStaleMin: 1500, minSuccessRate: 0.5, requireCoverage: true },
  // defiTokens/aiTokens/otherTokens all share one seed run (seed-token-panels cron, every 30min)
  defiTokens: { key: "seed-meta:market:token-panels", maxStaleMin: 90 },
  aiTokens: { key: "seed-meta:market:token-panels", maxStaleMin: 90 },
  otherTokens: { key: "seed-meta:market:token-panels", maxStaleMin: 90 },
  fredBatch: { key: "seed-meta:economic:fred:v1:FEDFUNDS:0", maxStaleMin: 1500 },
  // daily cron
  fredRatesSeeder: { key: "seed-meta:economic:fred-rates", maxStaleMin: 180, minRecordCount: 24 },
  // independent hourly FRED/rates seeder; publication accepts 18/24, but health requires full consumer coverage
  forecastFredWalcl: { key: "seed-meta:economic:fred:v1:WALCL:0", maxStaleMin: 1500 },
  forecastFredT10y2y: { key: "seed-meta:economic:fred:v1:T10Y2Y:0", maxStaleMin: 1500 },
  forecastFredUnrate: { key: "seed-meta:economic:fred:v1:UNRATE:0", maxStaleMin: 1500 },
  forecastFredCpiaucsl: { key: "seed-meta:economic:fred:v1:CPIAUCSL:0", maxStaleMin: 1500 },
  forecastFredDgs10: { key: "seed-meta:economic:fred:v1:DGS10:0", maxStaleMin: 1500 },
  forecastFredVixcls: { key: "seed-meta:economic:fred:v1:VIXCLS:0", maxStaleMin: 1500 },
  forecastFredGdp: { key: "seed-meta:economic:fred:v1:GDP:0", maxStaleMin: 1500 },
  forecastFredM2sl: { key: "seed-meta:economic:fred:v1:M2SL:0", maxStaleMin: 1500 },
  forecastFredDcoilwtico: { key: "seed-meta:economic:fred:v1:DCOILWTICO:0", maxStaleMin: 1500 },
  ecbEstr: { key: "seed-meta:economic:ecb-short-rates", maxStaleMin: 4320 },
  // daily ECB publish; 4320min = 3d = TTL/interval
  ecbEuribor3m: { key: "seed-meta:economic:ecb-short-rates", maxStaleMin: 4320 },
  // shared meta key with ecbEstr
  ecbEuribor6m: { key: "seed-meta:economic:ecb-short-rates", maxStaleMin: 4320 },
  // shared meta key with ecbEstr
  ecbEuribor1y: { key: "seed-meta:economic:ecb-short-rates", maxStaleMin: 4320 },
  // shared meta key with ecbEstr
  gscpi: { key: "seed-meta:economic:gscpi", maxStaleMin: 2880 },
  // 24h interval; 2880min = 48h = 2x interval
  fearGreedIndex: { key: "seed-meta:market:fear-greed", maxStaleMin: 720 },
  // 6h cron; 720min = 12h = 2x interval
  breadthHistory: { key: "seed-meta:market:breadth-history", maxStaleMin: 5760 },
  // cron at 02:00 UTC, Tue-Sat (captures Mon-Fri market close); max gap Sat→Tue = 72h + 24h miss buffer = 96h = 5760min. 48h was wrong — alarmed every Monday morning when Sun+Mon are intentionally skipped.
  marketCorrelationSeries: {
    key: "seed-meta:market:correlation-series",
    maxStaleMin: 45,
    minRecordCount: 6,
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6418,
      status: "EMPTY"
    }
  },
  // 15min bundle member; three missed runs should alert before the 14d chart ages materially.
  hormuzTracker: { key: "seed-meta:supply_chain:hormuz_tracker", maxStaleMin: 2880 },
  // daily cron; 2880min = 48h = 2x interval
  earningsCalendar: { key: "seed-meta:market:earnings-calendar", maxStaleMin: 1440 },
  // 12h cron; 1440min = 24h = 2x interval
  econCalendar: { key: "seed-meta:economic:econ-calendar", maxStaleMin: 1440 },
  // 12h cron; 1440min = 24h = 2x interval
  cotPositioning: { key: "seed-meta:market:cot", maxStaleMin: 14400 },
  // weekly CFTC release; 14400min = 10d = 1.4x interval (weekend + delay buffer)
  hyperliquidFlow: { key: "seed-meta:market:hyperliquid-flow", maxStaleMin: 30 },
  // 5min cron (bundled in seed-bundle-market-backup); 30min = 6× interval. Was 15 (3× = gold-standard floor with zero safety margin) — same exposure as correlationCards. Pre-fix comment said "Railway cron" but it's bundle-driven, so subject to the 80% skip-gate that produced 9-19min jitter under load.
  crudeInventories: { key: "seed-meta:economic:crude-inventories", maxStaleMin: 20160 },
  // weekly EIA data; 20160min = 14 days = 2x weekly cadence
  natGasStorage: { key: "seed-meta:economic:nat-gas-storage", maxStaleMin: 20160 },
  // weekly EIA data; 20160min = 14 days = 2x weekly cadence
  spr: { key: "seed-meta:economic:spr", maxStaleMin: 20160 },
  // weekly EIA data; 20160min = 14 days = 2x weekly cadence
  refineryInputs: { key: "seed-meta:economic:refinery-inputs", maxStaleMin: 20160 },
  // weekly EIA data; 20160min = 14 days = 2x weekly cadence
  ecbFxRates: { key: "seed-meta:economic:ecb-fx-rates", maxStaleMin: 5760 },
  // daily seed (weekdays + holidays); 5760min = 96h = covers Wed→Mon Easter gap
  // daily seed (seed-bundle-macro); 4320min = 72h = 3x interval, and below the 4d
  // canonical TTL so the key outlives its own gate. minRecordCount mirrors
  // MIN_RATE_COUNT in scripts/seed-cbr-rates.mjs (30 currencies + the key rate):
  // a truncated cbr.ru body still parses into a handful of well-formed rows, so
  // a shrunken table must surface as COVERAGE_PARTIAL rather than OK.
  cbrRates: { key: "seed-meta:economic:cbr-rates", maxStaleMin: 4320, minRecordCount: 31 },
  // UNHCR Operational Data Portal situations (seed-cross-border-arrivals.mjs,
  // daily health bundle, #9023). 48h = two missed ticks; report age is
  // checked by maxContentAgeMin.
  borderUk: { key: "seed-meta:displacement:border-uk", maxStaleMin: 2880, activationKey: "seed-activated:displacement:border-uk", cutover: { mode: "activation-marker", fromKey: null, issue: 9023, activationKey: "seed-activated:displacement:border-uk" } },
  borderCbp: { key: "seed-meta:displacement:border-cbp", maxStaleMin: 2880, activationKey: "seed-activated:displacement:border-cbp", cutover: { mode: "activation-marker", fromKey: null, issue: 9023, activationKey: "seed-activated:displacement:border-cbp" } },
  borderFrontex: { key: "seed-meta:displacement:border-frontex", maxStaleMin: 2880, activationKey: "seed-activated:displacement:border-frontex", cutover: { mode: "activation-marker", fromKey: null, issue: 9023, activationKey: "seed-activated:displacement:border-frontex" } },
  borderPanama: { key: "seed-meta:displacement:border-panama", maxStaleMin: 2880, activationKey: "seed-activated:displacement:border-panama", cutover: { mode: "activation-marker", fromKey: null, issue: 9023, activationKey: "seed-activated:displacement:border-panama" } },
  crossBorderArrivals: {
    key: "seed-meta:displacement:cross-border",
    maxStaleMin: 2880,
    minRecordCount: 12,
    activationKey: "seed-activated:displacement:cross-border",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9023,
      activationKey: "seed-activated:displacement:cross-border"
    }
  },
  // IOM DTM operations (seed-dtm-displacement.mjs, daily health bundle, #9014).
  // 48h = two missed ticks; round age is checked by maxContentAgeMin.
  dtmDisplacement: {
    key: "seed-meta:displacement:dtm",
    maxStaleMin: 2880,
    minRecordCount: 15,
    activationKey: "seed-activated:displacement:dtm",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9014,
      activationKey: "seed-activated:displacement:dtm"
    }
  },
  // IDMC Internal Displacement Updates from HDX (seed-idmc-idu-displacement.mjs,
  // daily health bundle, #9014). 48h = two missed ticks.
  idmcIduDisplacement: {
    key: "seed-meta:displacement:idmc-idu",
    maxStaleMin: 2880,
    minRecordCount: 500,
    activationKey: "seed-activated:displacement:idmc-idu",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9014,
      activationKey: "seed-activated:displacement:idmc-idu"
    }
  },
  bocValet: {
    key: "seed-meta:economic:boc-valet",
    maxStaleMin: 4320,
    minRecordCount: 19,
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6616,
      status: "EMPTY"
    }
  },
  // daily seed-bundle-macro 08:00 UTC; 4320min = 3x interval. minRecordCount = 15 FX pairs + policy rate + 2y/5y/10y yields.
  statcanWds: {
    key: "seed-meta:economic:statcan-wds",
    maxStaleMin: 4320,
    minRecordCount: 2,
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6676,
      status: "EMPTY"
    }
  },
  // daily seed-bundle-macro 08:00 UTC. Toronto-today 409 "not released yet" is quiet like 404; CPI/LFS still POST. First-publish EMPTY ack #6676 retired after recovery. Floor is the two resilience cubes (CPI YoY + LFS).
  eurostatCountryData: { key: "seed-meta:economic:eurostat-country-data", maxStaleMin: 4320 },
  // daily seed; 4320min = 3 days = 3x interval
  eurostatHousePrices: { key: "seed-meta:economic:eurostat-house-prices", maxStaleMin: 60 * 24 * 50 },
  // weekly cron, annual data; 50d threshold = 35d TTL + 15d buffer
  eurostatGovDebtQ: { key: "seed-meta:economic:eurostat-gov-debt-q", maxStaleMin: 60 * 24 * 14 },
  // 2d cron, quarterly data; 14d threshold matches TTL + quarterly release drift
  eurostatIndProd: { key: "seed-meta:economic:eurostat-industrial-production", maxStaleMin: 60 * 24 * 5 },
  // daily cron, monthly data; 5d threshold matches TTL
  euGasStorage: { key: "seed-meta:economic:eu-gas-storage", maxStaleMin: 2880 },
  // daily seed (T+1); 2880min = 48h = 2x interval
  euYieldCurve: { key: "seed-meta:economic:yield-curve-eu", maxStaleMin: 4320 },
  // daily seed (weekdays only); 4320min = 72h = covers Fri→Mon gap
  usCpiMonthly: {
    key: "seed-meta:economic:us-cpi",
    maxStaleMin: 4320,
    // daily macro-bundle tail; 72h covers one missed tick. CPI content age is separate.
    activationKey: "seed-activated:economic:us-cpi",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8480,
      activationKey: "seed-activated:economic:us-cpi"
    }
  },
  usTreasuryParYield: {
    key: "seed-meta:economic:us-treasury-par-yield",
    maxStaleMin: 4320,
    // daily macro-bundle tail; 72h covers one missed tick. Curve content age is separate.
    activationKey: "seed-activated:economic:us-treasury-par-yield",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8480,
      activationKey: "seed-activated:economic:us-treasury-par-yield"
    }
  },
  usInterestRates: {
    key: "seed-meta:economic:us-interest-rates",
    maxStaleMin: 4320,
    // daily macro-bundle tail; 72h covers one missed tick. DFF content age is separate.
    activationKey: "seed-activated:economic:us-interest-rates",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8485,
      activationKey: "seed-activated:economic:us-interest-rates"
    }
  },
  // #8538. Worldwide CPI sources. Each is a macro-bundle tail section on a
  // daily interval, so 72h covers one missed tick; content age is the tighter
  // clock and is declared per seeder (IMF 120d, Eurostat 120d,
  // e-Stat 120d, ABS 400d) because their publication lags differ structurally.
  worldCpiImf: {
    key: "seed-meta:economic:world-cpi-imf",
    maxStaleMin: 4320,
    activationKey: "seed-activated:economic:world-cpi-imf",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8538,
      activationKey: "seed-activated:economic:world-cpi-imf"
    }
  },
  worldCpiEurostat: {
    key: "seed-meta:economic:world-cpi-eurostat",
    maxStaleMin: 4320,
    activationKey: "seed-activated:economic:world-cpi-eurostat",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8538,
      activationKey: "seed-activated:economic:world-cpi-eurostat"
    }
  },
  worldCpiEstat: {
    key: "seed-meta:economic:world-cpi-estat",
    maxStaleMin: 4320,
    activationKey: "seed-activated:economic:world-cpi-estat",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8538,
      activationKey: "seed-activated:economic:world-cpi-estat"
    }
  },
  worldCpiAbs: {
    key: "seed-meta:economic:world-cpi-abs",
    maxStaleMin: 4320,
    activationKey: "seed-activated:economic:world-cpi-abs",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8538,
      activationKey: "seed-activated:economic:world-cpi-abs"
    }
  },
  yieldCurveJp: {
    key: "seed-meta:economic:yield-curve-jp",
    maxStaleMin: 4320,
    // daily business-day source; 72h covers the Fri→Mon gap. Curve content age is separate.
    activationKey: "seed-activated:economic:yield-curve-jp",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8522,
      activationKey: "seed-activated:economic:yield-curve-jp"
    }
  },
  yieldCurveCa: {
    key: "seed-meta:economic:yield-curve-ca",
    maxStaleMin: 4320,
    activationKey: "seed-activated:economic:yield-curve-ca",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8522,
      activationKey: "seed-activated:economic:yield-curve-ca"
    }
  },
  yieldCurveDe: {
    key: "seed-meta:economic:yield-curve-de",
    maxStaleMin: 4320,
    activationKey: "seed-activated:economic:yield-curve-de",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8522,
      activationKey: "seed-activated:economic:yield-curve-de"
    }
  },
  // The GB cold start (39 MB BoE archive) can be budget-deferred behind the
  // 570s bundle budget; 4460min still sits inside the 7d canonical TTL.
  yieldCurveGb: {
    key: "seed-meta:economic:yield-curve-gb",
    maxStaleMin: 4460,
    activationKey: "seed-activated:economic:yield-curve-gb",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8522,
      activationKey: "seed-activated:economic:yield-curve-gb"
    }
  },
  yieldCurveAu: {
    key: "seed-meta:economic:yield-curve-au",
    maxStaleMin: 4460,
    activationKey: "seed-activated:economic:yield-curve-au",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8522,
      activationKey: "seed-activated:economic:yield-curve-au"
    }
  },
  yieldCurveCh: {
    key: "seed-meta:economic:yield-curve-ch",
    maxStaleMin: 4460,
    activationKey: "seed-activated:economic:yield-curve-ch",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8522,
      activationKey: "seed-activated:economic:yield-curve-ch"
    }
  },
  yieldCurveNo: {
    key: "seed-meta:economic:yield-curve-no",
    maxStaleMin: 4320,
    activationKey: "seed-activated:economic:yield-curve-no",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8522,
      activationKey: "seed-activated:economic:yield-curve-no"
    }
  },
  yieldCurveSe: {
    key: "seed-meta:economic:yield-curve-se",
    maxStaleMin: 4460,
    activationKey: "seed-activated:economic:yield-curve-se",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8522,
      activationKey: "seed-activated:economic:yield-curve-se"
    }
  },
  oecdLtRates: {
    key: "seed-meta:economic:oecd-lt-rates",
    // budgetMinutes is the widest entry of OECD_LT_SOURCE_BUDGET_MIN in
    // scripts/lib/yield-curves/oecd-lt.mjs (FRED/OECD route, 120d); the producer
    // judges ECB-sourced markets at the tighter 114d budget before publishing.
    requireContentFreshness: { countries: ["DE", "JP", "GB", "CA", "AU", "CH", "NO", "SE", "IT", "ES", "KR", "MX", "ZA", "PL", "NL", "BE", "AT", "PT", "IE", "FI", "DK", "GR", "CZ", "HU", "CL", "FR", "US"], budgetMinutes: 120 * 24 * 60 },
    maxStaleMin: 4320,
    // daily bundle section; 72h = 3x interval. Per-market content age is separate.
    activationKey: "seed-activated:economic:oecd-lt-rates",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8522,
      activationKey: "seed-activated:economic:oecd-lt-rates"
    }
  },
  euFsi: { key: "seed-meta:economic:fsi-eu", maxStaleMin: 5760 },
  // daily seed (weekdays + holidays); 5760min = 96h = covers Wed→Mon Easter gap. Data freshness is tracked separately via content-age (STALE_CONTENT) — see seed-fsi-eu.mjs.
  newsThreatSummary: { key: "seed-meta:news:threat-summary", maxStaleMin: 60 },
  // relay classify writes every 15min (27-48min across restarts); 60min budget sits under the 2h payload TTL so this goes stale before the key vanishes
  shippingStress: { key: "seed-meta:supply_chain:shipping_stress", maxStaleMin: 45 },
  // relay loop every 15min; 45 = 3x interval (was 30 = 2×, too tight on relay hiccup)
  diseaseOutbreaks: { key: "seed-meta:health:disease-outbreaks", maxStaleMin: 2880 },
  // daily seed; 2880 = 48h = 2x interval
  healthAirQuality: { key: "seed-meta:health:air-quality", maxStaleMin: 180 },
  // hourly cron; 180 = 3x interval for shared health/climate seed
  socialVelocity: { key: "seed-meta:intelligence:social-reddit", maxStaleMin: 540 },
  // relay loop every 180min (3h; was 60min, dropped now that ScrapeCreators handles Reddit); 540 = 3x interval. Co-pinned with SOCIAL_VELOCITY_TTL=43200 (ais-relay.cjs): the data-key TTL must STRICTLY exceed this (720min > 540min) so a dead relay shows STALE_SEED before the key expires to EMPTY.
  wsbTickers: { key: "seed-meta:intelligence:wsb-tickers", maxStaleMin: 540 },
  // relay loop every 180min (3h); 540 = 3x interval. Co-pinned with WSB_TICKERS_TTL=43200 (ais-relay.cjs); TTL strictly > maxStaleMin (see socialVelocity note).
  pizzint: { key: "seed-meta:intelligence:pizzint", maxStaleMin: 45 },
  // relay loop every 15min; 45 = 3x interval
  // Same relay loop and cadence as pizzint above, so the same 3x-interval budget.
  // The archive write is fire-and-forget alongside live publication, so this can
  // go stale while the live key stays fresh — that asymmetry is the signal, and
  // it is the only one an operator gets that archiving has stopped.
  pizzintHistory: {
    key: "seed-meta:intelligence:pizzint:history:v1",
    maxStaleMin: 45,
    // The archive's Lua writes this marker on its first write that lands records,
    // so the on-demand EMPTY grace below expires on evidence rather than never.
    activationKey: "seed-activated:intelligence:pizzint-history",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 8679,
      activationKey: "seed-activated:intelligence:pizzint-history"
    }
  },
  productCatalog: { key: "seed-meta:product-catalog", maxStaleMin: 1080 },
  // relay loop every 6h; 1080 = 18h = 3x interval
  vpdTrackerRealtime: { key: "seed-meta:health:vpd-tracker", maxStaleMin: 2880 },
  // daily seed (0 2 * * *); 2880min = 48h = 2x interval
  vpdTrackerHistorical: { key: "seed-meta:health:vpd-tracker", maxStaleMin: 2880 },
  // shares seed-meta key with vpdTrackerRealtime (same run)
  resilienceStaticIndex: { key: "seed-meta:resilience:static", maxStaleMin: 576e3, projectFailedDatasets: true },
  // annual October snapshot; 400d threshold matches TTL and preserves prior-year data on source outages
  resilienceStaticFao: { key: "seed-meta:resilience:static", maxStaleMin: 576e3 },
  // same seeder + same heartbeat as resilienceStaticIndex; required so EMPTY_DATA_OK + missing data degrades to STALE_SEED instead of silent OK
  foodStocks: {
    key: "seed-meta:resilience:food-stocks",
    maxStaleMin: 86400,
    // monthly WASDE cycle; 86400min = 60d = 2× interval. Content-age is marketing-year presence (see seed-food-stocks.mjs), not this fetch clock.
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6440,
      status: "EMPTY"
    }
  },
  demographicsCapability: {
    key: "seed-meta:demographics:capability",
    maxStaleMin: 36e3,
    // 25d: static-ref refreshes every 20d; data TTL is 30d.
    minRecordCount: 150,
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6437,
      status: "EMPTY"
    }
  },
  scorecardFiveFactor: {
    key: "seed-meta:scorecard:five-factor",
    maxStaleMin: 2160,
    // Daily section; 36h allows one delayed Railway tick before the 3d data TTL.
    minRecordCount: 180,
    minPoolCounts: { population: 150, food: 80, energy: 120, demographics: 150, technology: 110, defense: 30 },
    // These minimums are byte-identical to SCORECARD_PUBLICATION_FLOORS in
    // server/worldmonitor/scorecard/v1/_snapshot.ts, so the producer refuses to
    // publish any cohort that would trip the shortfall check — health can only
    // ever see a passing cohort or a stale one, and COVERAGE_PARTIAL is
    // unreachable here. This margin makes the remaining headroom observable
    // while the cohort still passes. Informational only (COVERAGE_MARGIN_LOW
    // buckets to `ok`); 10 is a starting distance, not a calibrated one — worth
    // revisiting against published poolCounts history before anything alerts.
    poolCountMargin: 10,
    activationKey: "seed-activated:scorecard:five-factor",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 6441,
      activationKey: "seed-activated:scorecard:five-factor"
    }
  },
  resilienceRanking: { key: "seed-meta:resilience:ranking", maxStaleMin: 840, requireResilienceCacheState: true },
  // RPC cache (12h TTL, refreshed every 6h by seed-resilience-scores cron); 14h budget tolerates 1 missed tick (12h gap) + ~2h jitter for in-flight deploys that preempt a scheduled tick; alerts at 2 missed ticks (18h gap). Bumped from 720 — see comment below.
  resilienceIntervals: { key: "seed-meta:resilience:intervals", maxStaleMin: 840, minRecordCount: RESILIENCE_INTERVAL_MIN_RECORD_COUNT, requireResilienceCacheState: true },
  // bundled into seed-bundle-resilience, written by the Resilience-Scores section. Real Railway cron is `0 */6 * * *` (every 6h on the hour, UTC) — empirically verified 2026-04-28 via Railway logs showing 6h gaps between successful runs (the prior `intervalMs=2h with hourly fires` claim did not match what's deployed; either the bundle interval gate or the Railway service schedule makes the effective cadence 6h). 840 = 14h staleness ≈ 2.33× cadence: tolerates 1 missed tick (12h gap) + ~2h jitter for in-flight deploys; alerts at 2 missed ticks (18h gap). The 180-record floor matches the atomic publisher: a fresh probe cannot hide a mixed or shrunken fleet. Matches resilienceRanking above (same Resilience-Scores section writes both). Prior values: 20160 (14d, 168× — silent on real outage), 1080 (18h, 3× — over-permissive: masks a 12h outage), 720 (12h, 2× — exact floor; flipped UptimeRobot WARNING for ~1min on every Railway-deploy-preempted tick: 2026-05-10 incident at 18:02 UTC, seedAgeMin=722 vs maxStale=720 after the 12:00 UTC tick was skipped during an in-flight deploy), 360 (1× — false-positive on routine jitter, 2026-04-28: seedAgeMin=367 vs maxStale=360). Re-tighten ONLY if/when the actual Railway cron schedule is verified sub-6h.
  energyExposure: { key: "seed-meta:economic:owid-energy-mix", maxStaleMin: 50400 },
  // monthly cron on 1st; 50400min = 35d = TTL matches cron cadence + 5d buffer
  energyMixAll: { key: "seed-meta:economic:owid-energy-mix", maxStaleMin: 50400 },
  // same seed run as energyExposure; shares seed-meta key
  regulatoryActions: { key: "seed-meta:regulatory:actions", maxStaleMin: 360 },
  // 2h cron; 360min = 3x interval
  energySpineCountries: { key: "seed-meta:energy:spine", maxStaleMin: 2880 },
  // daily cron (06:00 UTC); 2880min = 48h = 2x interval
  electricityPrices: { key: "seed-meta:energy:electricity-prices", maxStaleMin: 3e3 },
  // one snapshot per UTC day, tried at 14/17/20/23 UTC; two days + 2h margin
  gasStorageCountries: { key: "seed-meta:energy:gas-storage-countries", maxStaleMin: 2880 },
  // daily cron at 10:30 UTC; 2880min = 48h = 2x interval
  energyIntelligence: { key: "seed-meta:energy:intelligence", maxStaleMin: 720 },
  // 6h cron; 720min = 2x interval
  // `chinaCoverage` opts these three into the producer diagnostic below. An
  // unusable China row no longer withholds the JODI publish (#6395), so the
  // freshness verdict now describes the 51-63 countries that DID publish and
  // the China gap rides alongside it, named, instead of surfacing 40 days
  // later as a generic STALE_SEED. Content age is producer-declared
  // (newestItemAt/maxContentAgeMin in seed-meta) — a frozen upstream file
  // reads STALE_CONTENT rather than passing as fresh.
  jodiOil: { key: "seed-meta:energy:jodi-oil", maxStaleMin: 60 * 24 * 40, chinaRow: true },
  // 15d bundle interval (monthly publisher); 40d allows missed runs plus a late publish. Data/meta TTL is 70d so last-good outlives this gate and one missed monthly publish.
  // Weekly bundle tick (seed-bundle-energy-sources); 14d = two missed runs. minRecordCount
  // mirrors MIN_COUNTRIES_WITH_PRODUCTION in scripts/seed-oil-trade-series.mjs. Content age is
  // the newest EIA STEO month (newestItemAt/maxContentAgeMin in seed-meta).
  oilTradeSeries: {
    key: "seed-meta:energy:oil-trade-series",
    maxStaleMin: 20160,
    minRecordCount: 18,
    activationKey: "seed-activated:energy:oil-trade-series",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9392,
      activationKey: "seed-activated:energy:oil-trade-series"
    }
  },
  ieaOilStocks: { key: "seed-meta:energy:iea-oil-stocks", maxStaleMin: 60 * 24 * 40 },
  // monthly cron on 15th; 40d threshold = TTL_SECONDS
  oilStocksAnalysis: { key: "seed-meta:energy:oil-stocks-analysis", maxStaleMin: 60 * 24 * 50 },
  // afterPublish of ieaOilStocks; 50d = matches seed-meta TTL (exceeds 40d data TTL)
  eiaPetroleum: { key: "seed-meta:energy:eia-petroleum", maxStaleMin: 4320 },
  // daily bundle cron (seed-bundle-energy-sources); 72h = 3× interval, well under 7d data TTL
  jodiGas: { key: "seed-meta:energy:jodi-gas", maxStaleMin: 60 * 24 * 40, chinaRow: true },
  // 15d bundle interval; 40d allows missed runs. Data/meta TTL is 70d so last-good outlives this gate and several intervals.
  lngVulnerability: { key: "seed-meta:energy:jodi-gas", maxStaleMin: 60 * 24 * 40, chinaRow: true },
  // written by jodi-gas seeder afterPublish; shares seed-meta key and the 70d GAS_TTL
  chokepointBaselines: { key: "seed-meta:energy:chokepoint-baselines", maxStaleMin: 60 * 24 * 400 },
  // 400 days
  // maxStaleMin is 120d = 2x the 60-day bundle interval, matching the repo's
  // 2-3x norm. The data is annual but the PUBLISHER runs every 60 days, so the
  // previous 400-day budget (6.7x cadence) would have let a dead seeder read OK
  // until ~2027-09; the 540-day content-age gate would not have covered it
  // either. Sized to the publisher, not the source.
  // Keep `key` and `maxStaleMin` adjacent: the coverage guard in
  // tests/seed-ttl-outlives-staleness-fleet.test.mjs matches them with a single
  // regex that only tolerates whitespace between the two, so a comment placed
  // between them drops this gate from the parsed set.
  mineralProduction: {
    key: "seed-meta:supply-chain:mineral-production",
    maxStaleMin: 60 * 24 * 120,
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6439,
      status: "EMPTY"
    }
  },
  sprPolicies: { key: "seed-meta:energy:spr-policies", maxStaleMin: 60 * 24 * 400 },
  // 400 days; static registry, same cadence as chokepoint baselines
  pipelinesGas: { key: "seed-meta:energy:pipelines-gas", maxStaleMin: 20160 },
  // 14d — weekly cron (7d) × 2 headroom
  pipelinesOil: { key: "seed-meta:energy:pipelines-oil", maxStaleMin: 20160 },
  // 14d — same seed-pipelines.mjs publishes both keys
  storageFacilities: { key: "seed-meta:energy:storage-facilities", maxStaleMin: 20160 },
  // 14d — weekly cron (7d) × 2 headroom
  fuelShortages: { key: "seed-meta:energy:fuel-shortages", maxStaleMin: 2880 },
  // 2d — daily cron × 2 headroom (classifier-driven post-launch)
  energyDisruptions: { key: "seed-meta:energy:disruptions", maxStaleMin: 20160 },
  // 14d — weekly cron × 2 headroom
  energyCrisisPolicies: { key: "seed-meta:energy:crisis-policies", maxStaleMin: 60 * 24 * 400 },
  // static data, ~400d TTL matches seeder
  aaiiSentiment: { key: "seed-meta:market:aaii-sentiment", maxStaleMin: 20160 },
  // weekly cron; 20160min = 14 days = 2x weekly cadence
  portwatchChokepointsRef: { key: "seed-meta:portwatch:chokepoints-ref", maxStaleMin: 60 * 24 * 14 },
  // seed-bundle-portwatch runs this at WEEK cadence; 14d = 2× interval
  chokepointFlows: { key: "seed-meta:energy:chokepoint-flows", maxStaleMin: 720 },
  // 6h cron; 720min = 2x interval
  // Relay-side heartbeat written by ais-relay.cjs on successful child exit.
  // Detects "relay loop fires but child dies at import/runtime" failures
  // (e.g. ERR_MODULE_NOT_FOUND from a missing Dockerfile COPY) 4h earlier
  // than the 720min seed-meta threshold above. TTL is 18h on the writer.
  chokepointFlowsRelayHeartbeat: { key: "relay:heartbeat:chokepoint-flows", maxStaleMin: 480 },
  // 6h loop; 8h alarm
  climateNewsRelayHeartbeat: { key: "relay:heartbeat:climate-news", maxStaleMin: 60 },
  // 30m loop; 60m alarm
  // 17m loop; 51m = 3 missed cycles. Soft until the first healthy cycle.
  newsDigestWarmRelayHeartbeat: {
    key: "relay:heartbeat:news-digest-warm",
    maxStaleMin: 51,
    activationKey: "seed-activated:news:digest-warm:v1",
    cutover: {
      mode: "activation-marker",
      fromKey: null,
      issue: 9766,
      activationKey: "seed-activated:news:digest-warm:v1"
    }
  },
  staticRefBundleTick: {
    key: "bundle:heartbeat:static-ref",
    maxStaleMin: 2880,
    // daily cron `0 3 * * *`; 48h = 2× cadence
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6691,
      status: "EMPTY"
    }
  },
  // The heavy half of static-ref: Arms-Suppliers, Military-Bases and
  // Mineral-Production on one rotating daily tick (#6806). One heartbeat, not
  // three — Railway's 10-minute container kill means no two of those members
  // can share a tick, but they share a BUNDLE and the runner defers the loser
  // to tomorrow, which is free at 10/30/60-day cadences.
  staticRefHeavyBundleTick: {
    key: "bundle:heartbeat:static-ref-heavy",
    maxStaleMin: 2880,
    // daily cron `0 4 * * *`; 48h = 2× cadence
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6806,
      status: "EMPTY"
    }
  },
  emberElectricity: { key: "seed-meta:energy:ember", maxStaleMin: 2880 },
  // daily cron (08:00 UTC); 2880min = 48h = 2x interval
  regionalEnergyPgcb: {
    key: "seed-meta:energy:regional-pgcb",
    maxStaleMin: 180,
    maxContentAgeMin: 720,
    activationKey: "seed-activated:energy:regional-pgcb",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9842, activationKey: "seed-activated:energy:regional-pgcb" }
  },
  regionalEnergyPetrobangla: {
    key: "seed-meta:energy:regional-petrobangla",
    maxStaleMin: 4320,
    maxContentAgeMin: 7200,
    activationKey: "seed-activated:energy:regional-petrobangla",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9842, activationKey: "seed-activated:energy:regional-petrobangla" }
  },
  regionalEnergyNiso: {
    key: "seed-meta:energy:regional-niso",
    maxStaleMin: 1080,
    maxContentAgeMin: 7200,
    activationKey: "seed-activated:energy:regional-niso",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9842, activationKey: "seed-activated:energy:regional-niso" }
  },
  regionalEnergyEskom: {
    key: "seed-meta:energy:regional-eskom",
    maxStaleMin: 4320,
    maxContentAgeMin: 10080,
    activationKey: "seed-activated:energy:regional-eskom",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9842, activationKey: "seed-activated:energy:regional-eskom" }
  },
  regionalEnergyCammesa: {
    key: "seed-meta:energy:regional-cammesa",
    maxStaleMin: 180,
    maxContentAgeMin: 720,
    activationKey: "seed-activated:energy:regional-cammesa",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9842, activationKey: "seed-activated:energy:regional-cammesa" }
  },
  regionalEnergyGse: {
    key: "seed-meta:energy:regional-gse",
    maxStaleMin: 4320,
    maxContentAgeMin: 129600,
    activationKey: "seed-activated:energy:regional-gse",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9842, activationKey: "seed-activated:energy:regional-gse" }
  },
  regionalEnergyOns: {
    key: "seed-meta:energy:regional-ons",
    maxStaleMin: 2160,
    maxContentAgeMin: 7200,
    activationKey: "seed-activated:energy:regional-ons",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9842, activationKey: "seed-activated:energy:regional-ons" }
  },
  regionalEnergyAnp: {
    key: "seed-meta:energy:regional-anp",
    maxStaleMin: 4320,
    maxContentAgeMin: 172800,
    activationKey: "seed-activated:energy:regional-anp",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9842, activationKey: "seed-activated:energy:regional-anp" }
  },
  regionalEnergyEvn: {
    key: "seed-meta:energy:regional-evn",
    maxStaleMin: 1080,
    maxContentAgeMin: 4320,
    activationKey: "seed-activated:energy:regional-evn",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9893, activationKey: "seed-activated:energy:regional-evn" }
  },
  regionalEnergyKorem: {
    key: "seed-meta:energy:regional-korem",
    maxStaleMin: 1080,
    maxContentAgeMin: 4320,
    activationKey: "seed-activated:energy:regional-korem",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9893, activationKey: "seed-activated:energy:regional-korem" }
  },
  regionalEnergyCoes: {
    key: "seed-meta:energy:regional-coes",
    maxStaleMin: 180,
    maxContentAgeMin: 360,
    activationKey: "seed-activated:energy:regional-coes",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9893, activationKey: "seed-activated:energy:regional-coes" }
  },
  regionalEnergyIccc: {
    key: "seed-meta:energy:regional-iccc",
    maxStaleMin: 2160,
    maxContentAgeMin: 64800,
    activationKey: "seed-activated:energy:regional-iccc",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9893, activationKey: "seed-activated:energy:regional-iccc" }
  },
  regionalEnergyFccc: {
    key: "seed-meta:energy:regional-fccc",
    maxStaleMin: 2160,
    maxContentAgeMin: 64800,
    activationKey: "seed-activated:energy:regional-fccc",
    cutover: { mode: "activation-marker", fromKey: null, issue: 9893, activationKey: "seed-activated:energy:regional-fccc" }
  },
  cryptoSectors: { key: "seed-meta:market:crypto-sectors", maxStaleMin: 120 },
  // relay loop every ~30min; 120min = 2h = 4x interval
  ddosAttacks: { key: "seed-meta:cf:radar:ddos", maxStaleMin: 60 },
  // seed-internet-outages publishes the payload before advancing this clock; outages cron ~15min; 60 = 4x interval
  economicStress: { key: "seed-meta:economic:stress-index", maxStaleMin: 180 },
  // computed in seed-economy afterPublish; cron ~1h; 180min = 3x interval
  marketImplications: {
    key: "seed-meta:intelligence:market-implications",
    maxStaleMin: 120,
    // LLM-generated in seed-forecasts; cron ~1h; 120min = 2x interval
    // The tail LLM stage misses regularly — an observed five-attempt window
    // produced three publications and two provider timeouts — while the cards
    // it publishes stay useful for hours. seed-forecasts holds `fetchedAt` at
    // the served vintage on a miss (so the 120min gate above still governs)
    // and records the streak here. Thresholds are sized to the SAME hourly
    // cadence as maxStaleMin: two consecutive misses is ~2h without a fresh
    // generation, and a failure with no follow-up attempt for 120min means
    // the stage stopped running at all. `warnWithoutSuccess` is deliberately
    // absent: the producer only records a streak when it has a served payload
    // to point at, which is itself proof of an earlier success, so the flag
    // could never fire here.
    synthesisFailure: {
      warnAfterConsecutive: 2,
      warnAfterAgeMin: 120,
      failureCodePattern: /^MARKET_IMPLICATIONS_(LLM_NO_RESPONSE|NO_PARSEABLE_CARDS|VALIDATION|UNKNOWN)$/
    }
  },
  trafficAnomalies: { key: "seed-meta:cf:radar:traffic-anomalies", maxStaleMin: 60 },
  // seed-internet-outages publishes the payload before advancing this clock; ANOMALIES_TTL is co-pinned to exceed this gate (see the seeder)
  chokepointExposure: { key: "seed-meta:supply_chain:chokepoint-exposure", maxStaleMin: 2880 },
  // daily cron; 2880min = 48h = 2x interval
  recoveryFiscalSpace: { key: "seed-meta:resilience:recovery:fiscal-space", maxStaleMin: 129600 },
  // monthly cron; 129600min = 90d = 3x interval (bumped from 86400/60d = 2x in PR #3669 for month-2 hiccup margin)
  recoveryReserveAdequacy: { key: "seed-meta:resilience:recovery:reserve-adequacy", maxStaleMin: 86400 },
  // monthly cron; 86400min = 60d = 2x interval
  recoveryExternalDebt: { key: "seed-meta:resilience:recovery:external-debt", maxStaleMin: 86400 },
  // monthly cron; 86400min = 60d = 2x interval
  recoveryImportHhi: { key: "seed-meta:resilience:recovery:import-hhi", maxStaleMin: 50400 },
  // monthly cron; 50400min = 35d catches missed import-HHI runs before stale country coverage lingers for 46d+
  // recoveryFuelStocks: probe removed (PR #3764). See STANDALONE_KEYS comment.
  recoveryReexportShare: { key: "seed-meta:resilience:recovery:reexport-share", maxStaleMin: 86400 },
  // monthly cron; 86400min = 60d = 2x interval
  recoverySovereignWealth: { key: "seed-meta:resilience:recovery:sovereign-wealth", maxStaleMin: 86400 },
  // monthly cron; 86400min = 60d = 2x interval
  // PR 1 v2 energy seeds — weekly cron (8d * 1440 = 11520min = 2x interval).
  // STRICT SEED_META (not ON_DEMAND): plan 2026-04-24-001 made /api/health
  // CRIT on absent/stale so operators see the Railway-bundle gap before
  // the flag flips. See the ON_DEMAND_KEYS "do not add back" note below.
  lowCarbonGeneration: { key: "seed-meta:resilience:low-carbon-generation", maxStaleMin: 11520 },
  fossilElectricityShare: { key: "seed-meta:resilience:fossil-electricity-share", maxStaleMin: 11520 },
  powerLosses: { key: "seed-meta:resilience:power-losses", maxStaleMin: 11520 },
  // Education attainment — 8d budget. The bundle runs a DAILY Railway cron and
  // gates each member on its own intervalMs (7d here), so a failed attempt
  // retries on the next daily tick rather than a week later; 8d is the 7d
  // interval plus roughly one day of retry headroom, not "2x interval". The
  // budget alarms on the SEEDER being dead, not on the data being old —
  // content-age staleness is the seeder's own 48-month maxContentAgeMin.
  educationAttainment: {
    key: "seed-meta:resilience:education-attainment",
    maxStaleMin: 11520,
    minRankableRecordCount: EDUCATION_MIN_RANKABLE_RECORD_COUNT,
    // Pre-seed evidence per scripts/check-health-probe-cutovers.mts. #6450 shipped
    // the seeder but Railway refused the merge commit (its post-merge check suite
    // was red on two unrelated tests), so seed-bundle-macro ran an image without
    // the script and the probe could not be registered then. The service was
    // deployed to a green head on 2026-08-11 and this entry cites its first real
    // publish. See docs/methodology/education-flag-flip-runbook.md.
    cutover: {
      mode: "preseed",
      fromKey: null,
      issue: 6452,
      verifiedAt: "2026-08-11T08:03:25.357Z",
      evidence: {
        platform: "railway",
        service: "seed-bundle-macro",
        probeKey: "seed-meta:resilience:education-attainment",
        compactHealthStatus: "OK",
        reference: "https://github.com/koala73/worldmonitor/issues/6452#issuecomment-5252687464"
      }
    }
  },
  webcams: { key: "seed-meta:webcam:cameras:geo", maxStaleMin: 1440 },
  // seed-webcams writes 24h geo/meta keys plus a 30h active pointer; stale at 24h before the layer goes blank.
  // #5736 — history-ingest freshness per collector. `fetchedAt` here is the
  // last HEALTHY append (success, or a correctly-detected unconfigured run),
  // NEVER the last attempt, so a relay that rejects every chunk ages this out
  // while the collector's own seed-meta stays fresh. Budgets mirror each
  // collector's canonical maxStaleMin above — the hook runs once per successful
  // publish, so a tighter budget would alarm on the parent's cadence, not on
  // history. Keep in step with api/seed-health.js (intervalMin = maxStaleMin/2).
  intelHistoryIngestConflictAcled: { key: "seed-meta:intel-history:conflict:acled-intel", maxStaleMin: 38 },
  // mirrors acledIntel
  intelHistoryIngestMilitaryCrossStrait: { key: "seed-meta:intel-history:military:cross-strait-activity", maxStaleMin: 720 },
  // mirrors crossStraitActivity
  intelHistoryIngestEnergyIntelligence: { key: "seed-meta:intel-history:energy:intelligence", maxStaleMin: 720 },
  // mirrors energyIntelligence
  // Unofficial tsimobile.viarail.ca JSON. The source needs no credentials, so
  // fetch/shape failures write sourceState stale and surface as SEED_ERROR when
  // no last-good value exists. 15min cron; 45 = 3x cadence. EMPTY_DATA_OK makes
  // a pre-first-publish absence STALE_SEED (warn), not EMPTY (crit).
  viarailLive: {
    key: "seed-meta:transit:viarail-live",
    maxStaleMin: 45,
    cutover: {
      mode: "expiring-ack",
      fromKey: null,
      issue: 6615,
      status: "STALE_SEED"
    }
  }
};
var CONSUMER_PRICE_HEALTH_MARKETS = Object.freeze(["ae", "au", "br", "gb", "in", "sa", "sg", "us"]);
var consumerPriceCoverageHealthName = (market) => market === "ae" ? "consumerPricesCoverage" : `consumerPricesCoverage${market.toUpperCase()}`;
for (const market of CONSUMER_PRICE_HEALTH_MARKETS) {
  if (market === "ae") continue;
  const name = consumerPriceCoverageHealthName(market);
  BOOTSTRAP_KEYS[name] = `consumer-prices:coverage:${market}`;
  SEED_META[name] = {
    key: `seed-meta:consumer-prices:coverage:${market}`,
    maxStaleMin: 1500,
    minSuccessRate: 0.5,
    requireCoverage: true
  };
}
if (!IRAN_EVENTS_ENABLED) {
  delete BOOTSTRAP_KEYS.iranEvents;
  delete SEED_META.iranEvents;
  delete STANDALONE_KEYS.strikePressure;
  delete SEED_META.strikePressure;
}
var ON_DEMAND_KEYS = /* @__PURE__ */ new Set([
  "regionalEnergyPgcb",
  "regionalEnergyPetrobangla",
  "regionalEnergyNiso",
  "regionalEnergyEskom",
  "regionalEnergyCammesa",
  "regionalEnergyGse",
  "regionalEnergyOns",
  "regionalEnergyAnp",
  "regionalEnergyEvn",
  "regionalEnergyKorem",
  "regionalEnergyCoes",
  "regionalEnergyIccc",
  "regionalEnergyFccc",
  "globalTendersColombiaSecop",
  "globalTendersKenyaPpip",
  "globalTendersSouthAfricaEtenders",
  "globalTendersChileMercadoPublico",
  "globalTendersBrazilPncp",
  "globalTendersUkraineProzorro",
  "globalTendersBulgariaEop",
  "globalTendersLatviaIub",
  "globalTendersPolandBzp",
  "globalTendersPakistanPpra",
  "ukmtoIncidents",
  // Deployment-order bridge: Vercel can ship this reader before Railway's
  // hourly bundle publishes the first summary. The seeder writes a durable
  // activation marker after its first successful publish; after that, a
  // missing/stale summary is strict forever.
  "chinaCoverage",
  // Deployment-order bridge (#9509): Vercel can ship the summary readers before
  // seed-fire-detections' next 10-minute tick writes the key. The seeder SETs
  // the durable marker on every successful publish; strict from then on.
  "wildfiresSummary",
  // Deployment-order bridge. The worker writes a permanent activation marker
  // on its first healthy loop report; absence becomes strict immediately after.
  "companyMonitoringWorker",
  // Deployment-order bridge (#9217): this reader ships before the
  // shipping-webhook-worker Railway service is provisioned. The worker SETs the
  // durable marker on its first tick that reads the score feed; strict from then on.
  "shippingWebhookWorker",
  "sanctionsChanges",
  // Same deployment-order bridge as chinaCoverage: Vercel can ship this reader
  // before seed-bundle-macro's next 08:00 UTC tick publishes the first CBR
  // table, and the every-15-minute freshness monitor would otherwise report an
  // unactionable EMPTY/CRIT for up to a day. seed-cbr-rates.mjs SETs the durable
  // marker after its first successful publish; from then on it is strict forever.
  "cbrRates",
  // Same bridge for IOM DTM: the reader ships before seed-bundle-health's next
  // daily tick publishes. seed-dtm-displacement.mjs SETs the marker after its
  // first successful publish.
  "dtmDisplacement",
  // Same bridge for the IDMC IDU events (seed-idmc-idu-displacement.mjs).
  "idmcIduDisplacement",
  // Same bridge for the oil trade series: the reader ships before the energy
  // bundle's first tick publishes. seed-oil-trade-series.mjs SETs the marker.
  "oilTradeSeries",
  // Same bridge for the UNHCR cross-border movements (#9023).
  // Deploy-before-first-tick bridge for the weekly capital-flows seed (#9394).
  "capitalFlows",
  "crossBorderArrivals",
  "borderUk",
  "borderCbp",
  "borderFrontex",
  "borderPanama",
  // Same deploy-before-first-tick bridge as cbrRates for the two Canada
  // national-statistics seeders: bocValet (#6616) and statcanWds (#6676).
  // Softening lifts once the durable activation marker exists.
  "bocValet",
  "statcanWds",
  // Deployment-order bridge (#8545): this reader ships before the
  // seed-live-video-resolved Railway service is provisioned. The seeder SETs the
  // durable marker after its first successful publish; strict from then on.
  "liveVideoResolved",
  // Same bridge (#9722): the nowcast reader ships before the
  // seed-no2-activity Railway service is provisioned.
  "no2Activity",
  // #8480. The macro bundle can ship the reader before the tail sections
  // publish. Each marker is written after the first successful publish.
  "usCpiMonthly",
  "usTreasuryParYield",
  // #8485. Same deploy-before-first-tick bridge for the US rate basket.
  "usInterestRates",
  // #8538. Same bridge for the four worldwide CPI sources: the reader ships
  // with the world CPI endpoint before the macro-bundle tail sections run.
  "worldCpiImf",
  "worldCpiEurostat",
  "worldCpiEstat",
  "worldCpiAbs",
  // Scheduled Toronto CAD producer deployment bridges. Each seeder writes a
  // permanent marker after its first successful canonical publish; health is
  // strict from that point onward.
  "torontoTfs",
  "torontoTps",
  // Scheduled country-index projection. The marker is written only after the
  // projection and its seed metadata publish successfully.
  "predictionCountryMarkets",
  // Per-country GDELT article index (#7748). The 15-minute materializer
  // writes the marker after the index and its seed-meta publish; absence is
  // pending until that first tick and strict afterward.
  "gdeltCountryArticles",
  "gdeltDyadTension",
  "gdeltCountryEvents",
  // Written by scripts/seed-tension-evidence.mjs after each publish.
  "tensionEvidence",
  // Relay strike-pressure tally: the marker is written after its first healthy publish.
  "strikePressure",
  // Relay digest warm cycle: the marker is written after its first healthy cycle.
  "newsDigestWarmRelayHeartbeat",
  // Scheduled producer. The marker is written only after a successful
  // publish of the canonical snapshot. Before that first publish, absence is
  // pending activation; after it, missing or stale data is strict.
  "physicalPremiums",
  "physicalDivergence",
  // US HTS chapter 99 duty index: pending until seed-supply-chain-trade's
  // first catalog publish writes the marker, strict afterward.
  "usHtsDuties",
  // Five-factor scorecard (#6441). Vercel can ship this probe before the
  // Railway resilience bundle publishes the first daily cohort. The seeder
  // writes a permanent marker in the same EVAL as that first successful
  // cohort; absence is pending until then and strict afterward.
  "scorecardFiveFactor",
  // Daily commodity-vulnerability producer. One durable cohort marker bridges
  // the Edge reader deploy to the first Railway publish; both projections are
  // strict forever after the marker exists.
  "supplyVulnerability",
  "supplyChokepointDependencies",
  "riskScoresLive",
  "usniFleetStale",
  "positiveEventsLive",
  "bisPolicy",
  "bisExchange",
  "bisCredit",
  // bisDsr/bisPropertyResidential/bisPropertyCommercial have dedicated SEED_META
  // entries (seed-bis-extended.mjs), so they are not on-demand.
  // shippingRates is a scheduled 6h producer and FAST bootstrap key;
  // absence must be EMPTY/CRIT rather than on-demand.
  "macroSignals",
  "chokepoints",
  "minerals",
  "giving",
  "cyberThreatsRpc",
  "militaryBases",
  "displacement",
  // militaryBases keeps the existing standalone pointer check. Its seed-meta
  // supplies strict freshness and integrity verdicts once that pointer exists;
  // an absent pointer remains the existing EMPTY_ON_DEMAND warning.
  "corridorrisk",
  // intermediate key; data flows through transit-summaries:v1
  "serviceStatuses",
  // RPC-populated; seed-meta written on fresh fetch only, goes stale between visits
  // marketImplications removed 2026-05-01 — see policy block above. Homepage panel,
  // chronic LLM-provider failures must surface as CRIT.
  "simulationPackageLatest",
  // written by writeSimulationPackage after deep forecast runs; only present after first successful deep run
  "simulationOutcomeLatest",
  // written by writeSimulationOutcome after simulation runs; only present after first successful simulation
  // #4927 review P1: activation-gated on the operator adding UPSTASH_* as GH
  // Actions secrets — the publishers skip silently without them, so a
  // never-activated key must read as soft EMPTY_ON_DEMAND, not EMPTY/CRIT,
  // while the workflow stays green. On-demand softening is REVOKED once the
  // durable activation marker exists (see ACTIVATION_MARKERS): after the
  // first publish, missing data/meta is EMPTY/STALE_SEED like any other key.
  "newsFeedHealth",
  "imdCycloneMarine",
  "notamAirspace",
  "notamNmsClosures",
  "forecastCalibrationMap",
  "marketAlertLedger",
  "marketAlertScorecard",
  "newsRecallBenchmark",
  "resilienceRanking",
  // on-demand RPC cache populated after ranking requests; missing before first Pro use is expected
  "recoveryFiscalSpace",
  "recoveryReserveAdequacy",
  "recoveryExternalDebt",
  // NOTE (2026-04-24, plan 2026-04-24-001): the PR 1 v2 energy seeds
  // (`lowCarbonGeneration`, `fossilElectricityShare`, `powerLosses`)
  // are INTENTIONALLY NOT listed in ON_DEMAND_KEYS. They stay strict
  // SEED_META so `/api/health` returns CRIT (not WARN) when they are
  // absent — which is the alarm a future operator needs before flipping
  // `RESILIENCE_ENERGY_V2_ENABLED=true`. The scorer fails closed via
  // ResilienceConfigurationError if the flag flips before the seeds
  // populate (server/worldmonitor/resilience/v1/_dimension-scorers.ts
  // #scoreEnergy). Do NOT add these labels back to ON_DEMAND_KEYS
  // without revisiting that plan.
  "displacementPrev",
  // covered by cascade onto current-year displacement; empty most of the year
  // The archive starts empty on the deploy that introduces it and stays empty
  // until the first relay poll. Absence is therefore not a fault; a STOPPED
  // archive is, and that still reports STALE_SEED because on-demand softening
  // never covers a key that has data behind it (see classifyKey).
  "pizzintHistory",
  "riskScoresHistory",
  // first fresh leader build atomically activates daily history
  "countryHistory",
  // #6070 retired six expired deployment-order bridges after live producer
  // verification. Future temporary softening needs an activation marker or an
  // enforced wall-clock expiry; a prose-only removal reminder is not a control.
  // #5736 deployment-order bridge, activation-gated like chinaCoverage: Vercel
  // ships this registry the moment the PR merges, but the record only exists
  // after the collector's next Railway tick (up to 6h for energy/intelligence).
  // Softening is revoked the instant the durable marker appears — after the
  // first report, an absent record is EMPTY and a stalled one is STALE_SEED.
  "intelHistoryIngestConflictAcled",
  "intelHistoryIngestMilitaryCrossStrait",
  "intelHistoryIngestEnergyIntelligence",
  // #7012 TPS Open Data is on-demand. Absence before the first explicit fetch
  // is pending, not CRIT. GTA Update is not registered: writer disabled.
  "tpsMci",
  "tpsCallsAttended",
  "forecastProbabilityTrail",
  "forecastArchive"
]);
var ACTIVATION_MARKERS = {
  regionalEnergyPgcb: SEED_META.regionalEnergyPgcb.activationKey,
  regionalEnergyPetrobangla: SEED_META.regionalEnergyPetrobangla.activationKey,
  regionalEnergyNiso: SEED_META.regionalEnergyNiso.activationKey,
  regionalEnergyEskom: SEED_META.regionalEnergyEskom.activationKey,
  regionalEnergyCammesa: SEED_META.regionalEnergyCammesa.activationKey,
  regionalEnergyGse: SEED_META.regionalEnergyGse.activationKey,
  regionalEnergyOns: SEED_META.regionalEnergyOns.activationKey,
  regionalEnergyAnp: SEED_META.regionalEnergyAnp.activationKey,
  regionalEnergyEvn: SEED_META.regionalEnergyEvn.activationKey,
  regionalEnergyKorem: SEED_META.regionalEnergyKorem.activationKey,
  regionalEnergyCoes: SEED_META.regionalEnergyCoes.activationKey,
  regionalEnergyIccc: SEED_META.regionalEnergyIccc.activationKey,
  regionalEnergyFccc: SEED_META.regionalEnergyFccc.activationKey,
  globalTendersColombiaSecop: SEED_META.globalTendersColombiaSecop.activationKey,
  globalTendersKenyaPpip: SEED_META.globalTendersKenyaPpip.activationKey,
  globalTendersSouthAfricaEtenders: SEED_META.globalTendersSouthAfricaEtenders.activationKey,
  globalTendersChileMercadoPublico: SEED_META.globalTendersChileMercadoPublico.activationKey,
  globalTendersBrazilPncp: SEED_META.globalTendersBrazilPncp.activationKey,
  globalTendersUkraineProzorro: SEED_META.globalTendersUkraineProzorro.activationKey,
  globalTendersBulgariaEop: SEED_META.globalTendersBulgariaEop.activationKey,
  globalTendersLatviaIub: SEED_META.globalTendersLatviaIub.activationKey,
  globalTendersPolandBzp: SEED_META.globalTendersPolandBzp.activationKey,
  globalTendersPakistanPpra: SEED_META.globalTendersPakistanPpra.activationKey,
  ukmtoIncidents: "seed-activated:maritime:ukmto-incidents",
  chinaCoverage: "seed-activated:health:china-coverage",
  // Written by the PizzINT archive's Lua (scripts/shared/pizzint-history.cjs).
  pizzintHistory: SEED_META.pizzintHistory.activationKey,
  riskScoresHistory: SEED_META.riskScoresHistory.activationKey,
  countryHistory: SEED_META.countryHistory.activationKey,
  companyMonitoringWorker: "seed-activated:company-monitoring:worker",
  shippingWebhookWorker: SEED_META.shippingWebhookWorker.activationKey,
  sanctionsChanges: SEED_META.sanctionsChanges.activationKey,
  // Written by scripts/seed-cbr-rates.mjs (CBR_ACTIVATION_KEY) in runSeed's
  // afterPublish hook, so it exists only once a real table has been published.
  cbrRates: "seed-activated:economic:cbr-rates",
  // Written by scripts/seed-dtm-displacement.mjs in runSeed's afterPublish hook.
  dtmDisplacement: SEED_META.dtmDisplacement.activationKey,
  // Written by scripts/seed-idmc-idu-displacement.mjs in runSeed's afterPublish hook.
  idmcIduDisplacement: SEED_META.idmcIduDisplacement.activationKey,
  // Written by scripts/seed-oil-trade-series.mjs in runSeed's afterPublish hook.
  oilTradeSeries: SEED_META.oilTradeSeries.activationKey,
  // Written by scripts/seed-cross-border-arrivals.mjs in runSeed's afterPublish hook.
  crossBorderArrivals: SEED_META.crossBorderArrivals.activationKey,
  borderUk: SEED_META.borderUk.activationKey,
  borderCbp: SEED_META.borderCbp.activationKey,
  borderFrontex: SEED_META.borderFrontex.activationKey,
  borderPanama: SEED_META.borderPanama.activationKey,
  // Written by scripts/seed-capital-flows.mjs in runSeed's afterPublish hook.
  capitalFlows: SEED_META.capitalFlows.activationKey,
  bocValet: "seed-activated:economic:boc-valet",
  statcanWds: "seed-activated:economic:statcan-wds",
  // Written by scripts/seed-live-video-resolved.mjs in runSeed's afterPublish hook.
  liveVideoResolved: SEED_META.liveVideoResolved.activationKey,
  // Written atomically with the dataset by scripts/seed-no2-activity.mjs.
  no2Activity: SEED_META.no2Activity.activationKey,
  // Written by scripts/seed-fire-detections.mjs in runSeed's afterFreshness hook,
  // after the summary extra key and the canonical seed-meta (#9509).
  wildfiresSummary: SEED_META.wildfiresSummary.activationKey,
  usCpiMonthly: SEED_META.usCpiMonthly.activationKey,
  usTreasuryParYield: SEED_META.usTreasuryParYield.activationKey,
  usInterestRates: SEED_META.usInterestRates.activationKey,
  worldCpiImf: SEED_META.worldCpiImf.activationKey,
  worldCpiEurostat: SEED_META.worldCpiEurostat.activationKey,
  worldCpiEstat: SEED_META.worldCpiEstat.activationKey,
  worldCpiAbs: SEED_META.worldCpiAbs.activationKey,
  torontoTfs: SEED_META.torontoTfs.activationKey,
  torontoTps: SEED_META.torontoTps.activationKey,
  predictionCountryMarkets: SEED_META.predictionCountryMarkets.activationKey,
  // Written by scripts/seed-gdelt-bulk-materializer.mjs after the per-country
  // article index publishes with its seed-meta (#7748).
  gdeltCountryArticles: SEED_META.gdeltCountryArticles.activationKey,
  gdeltDyadTension: SEED_META.gdeltDyadTension.activationKey,
  tensionEvidence: SEED_META.tensionEvidence.activationKey,
  gdeltCountryEvents: SEED_META.gdeltCountryEvents.activationKey,
  // Written by scripts/ais-relay.cjs after the first healthy strike-pressure publish.
  strikePressure: "seed-activated:conflict:strike-pressure",
  // Written by scripts/ais-relay.cjs after the first healthy digest warm cycle.
  newsDigestWarmRelayHeartbeat: SEED_META.newsDigestWarmRelayHeartbeat.activationKey,
  physicalPremiums: SEED_META.physicalPremiums.activationKey,
  // Written by publishUsHtsIndex in scripts/seed-supply-chain-trade.mjs.
  usHtsDuties: SEED_META.usHtsDuties.activationKey,
  physicalDivergence: SEED_META.physicalDivergence.activationKey,
  scorecardFiveFactor: SEED_META.scorecardFiveFactor.activationKey,
  imdCycloneMarine: SEED_META.imdCycloneMarine.activationKey,
  notamAirspace: SEED_META.notamAirspace.activationKey,
  notamNmsClosures: SEED_META.notamNmsClosures.activationKey,
  forecastCalibrationMap: SEED_META.forecastCalibrationMap.activationKey,
  forecastProbabilityTrail: SEED_META.forecastProbabilityTrail.activationKey,
  forecastArchive: SEED_META.forecastArchive.activationKey,
  marketAlertLedger: SEED_META.marketAlertLedger.activationKey,
  marketAlertScorecard: SEED_META.marketAlertScorecard.activationKey,
  supplyVulnerability: SEED_META.supplyVulnerability.activationKey,
  supplyChokepointDependencies: SEED_META.supplyChokepointDependencies.activationKey,
  newsFeedHealth: "seed-activated:news:feed-health",
  newsRecallBenchmark: "seed-activated:news:recall-benchmark",
  // Written by scripts/_seed-history.mjs on every ingest-health report,
  // including an `unconfigured` one — "the hook ran" is the activation signal,
  // not "the relay answered". See historyIngestActivationKey there.
  intelHistoryIngestConflictAcled: "seed-activated:intel-history:conflict:acled-intel",
  intelHistoryIngestMilitaryCrossStrait: "seed-activated:intel-history:military:cross-strait-activity",
  intelHistoryIngestEnergyIntelligence: "seed-activated:intel-history:energy:intelligence",
  // #6060 deployment-order softening. This Edge function redeploys within
  // minutes of merge; the producer is a 12h Railway cron. The marker is written
  // on the first run that publishes a contentFreshness block, so "the producer
  // has never shipped this field" reads as pending rather than as a fault —
  // while a block that DISAPPEARS after activation still fails closed.
  portwatchContentFreshness: PORTWATCH_CONTENT_FRESHNESS_ACTIVATION_KEY,
  // Written without a TTL by scripts/seed-fred-rates.mjs only after runSeed
  // successfully publishes the version-1 canonical batch. The marker makes
  // first publication one-way: a later disappearance is strict forever.
  fredRatesSeeder: "seed-activated:economic:fred-rates:v1"
};
var COVERAGE_FAILURE_REASONS = Object.freeze([
  "provider-cooldown",
  "provider-error",
  "source-http-error",
  "missing-price",
  "price-evidence-missing",
  "quantity-as-price",
  "currency-mismatch",
  "title-mismatch",
  "validator-rejected",
  "parsed-zero-products",
  "pin-validator-rejected",
  "match-admission-persist-failed",
  "unknown-error"
]);
function sanitizeCoverageFailureReasons(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const clean = {};
  for (const reason of COVERAGE_FAILURE_REASONS) {
    const count = Number(raw[reason]);
    if (Number.isSafeInteger(count) && count > 0) clean[reason] = count;
  }
  return clean;
}
function fredRatesRolloutCommands(now, vercelEnv = process.env.VERCEL_ENV) {
  if (vercelEnv !== "production") return [];
  const candidateUntil = now + FRED_RATES_ROLLOUT_DURATION_MS;
  return [
    ["SET", FRED_RATES_ROLLOUT_DEADLINE_KEY, String(candidateUntil), "NX"],
    ["GET", FRED_RATES_ROLLOUT_DEADLINE_KEY]
  ];
}
function parseFredRatesRolloutUntil(results) {
  if (!Array.isArray(results) || results.length !== 2) return null;
  if (results[0]?.error || results[1]?.error) return null;
  const until = Number(results[1]?.result);
  return Number.isSafeInteger(until) && until > 0 ? until : null;
}
var KEY_VERSION_ROLLOUT_DEADLINE_PREFIX = "health:rollout-deadline:key-version:";
var KEY_VERSION_ROLLOUT_MAX_MS = 24 * 60 * 60 * 1e3;
function keyVersionRolloutDurationMs(seedCfg) {
  return Math.min(seedCfg.maxStaleMin * 6e4, KEY_VERSION_ROLLOUT_MAX_MS);
}
function versionedKeyFamily(dataKey) {
  const match = /^(.+?):v(\d+)(?=:|$)/.exec(dataKey);
  return match ? { family: match[1], version: Number(match[2]) } : null;
}
function writerKeyVersionBehind(dataKey, sourceVersion) {
  const target = versionedKeyFamily(dataKey);
  if (!target || typeof sourceVersion !== "string") return false;
  const family = target.family.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`(?:^|:)${family}:v(\\d+)(?=:|$)`).exec(sourceVersion);
  return match !== null && Number(match[1]) < target.version;
}
function keyVersionRolloutCandidates(registries, keyStrens, keyErrors, keyMetaValues, keyMetaErrors, now) {
  const candidates = [];
  for (const registry of registries) {
    for (const [name, dataKey] of Object.entries(registry)) {
      const seedCfg = SEED_META[name];
      if (!seedCfg || keyErrors.get(dataKey) || keyHasData(dataKey, keyStrens.get(dataKey) ?? 0)) continue;
      const seedMeta = readSeedMeta(seedCfg, keyMetaValues, keyMetaErrors, now);
      if (!seedMeta.hasMeta || seedMeta.seedError || seedMeta.seedStale !== false) continue;
      const meta = unwrapEnvelope(parseRedisValue(keyMetaValues.get(seedCfg.key))).data;
      if (!writerKeyVersionBehind(dataKey, meta?.sourceVersion)) continue;
      candidates.push({ name, dataKey, durationMs: keyVersionRolloutDurationMs(seedCfg) });
    }
  }
  return candidates;
}
function keyVersionRolloutCommands(candidates, now, vercelEnv = process.env.VERCEL_ENV) {
  if (vercelEnv !== "production") return [];
  return candidates.flatMap(({ dataKey, durationMs }) => {
    const deadlineKey = `${KEY_VERSION_ROLLOUT_DEADLINE_PREFIX}${dataKey}`;
    return [
      ["SET", deadlineKey, String(now + durationMs), "NX"],
      ["GET", deadlineKey]
    ];
  });
}
function staleContentGraceEvidence(contentAge, contentFreshness, now) {
  if (!contentAge && !contentFreshness) return null;
  let observedAt;
  let budgetMinutes;
  if (contentAge?.contentStale) {
    observedAt = contentAge.newestItemAt;
    budgetMinutes = contentAge.maxContentAgeMin;
  } else if (contentFreshness?.usable && contentFreshness.contentStale) {
    observedAt = contentFreshness.criticalOldestObservedAt;
    budgetMinutes = contentFreshness.budgetMinutes;
  } else {
    if (contentFreshness && !contentFreshness.usable) return null;
    return { contentStale: false, graceEligible: false, boundaryMs: null };
  }
  if (observedAt === null) {
    return { contentStale: true, graceEligible: true, boundaryMs: null };
  }
  if (!Number.isFinite(observedAt) || observedAt > now) {
    return { contentStale: true, graceEligible: false, boundaryMs: null };
  }
  const boundaryMs = observedAt + budgetMinutes * 6e4;
  if (!Number.isSafeInteger(boundaryMs)) {
    return { contentStale: true, graceEligible: false, boundaryMs: null };
  }
  return { contentStale: true, graceEligible: true, boundaryMs };
}
function staleContentGraceCandidateUntil(evidence, now) {
  return evidence.boundaryMs !== null && evidence.boundaryMs <= now ? evidence.boundaryMs + STALE_CONTENT_GRACE_MS : now + STALE_CONTENT_GRACE_MS;
}
function staleContentGraceStatePlan(graceEvidenceByName, checks, now, stateKey = STALE_CONTENT_GRACE_STATE_KEY) {
  const claimCommands = [];
  const cleanupCommands = [];
  const stateBackedNames = [];
  const recoveredNames = [];
  for (const [name, evidence] of graceEvidenceByName) {
    if (!evidence) continue;
    if (evidence.contentStale && evidence.graceEligible && checks?.[name]?.status === "STALE_CONTENT") {
      claimCommands.push(
        ["HSETNX", stateKey, name, String(staleContentGraceCandidateUntil(evidence, now))],
        ["HGET", stateKey, name]
      );
      stateBackedNames.push(name);
    } else if (!evidence.contentStale) {
      recoveredNames.push(name);
    }
  }
  if (claimCommands.length > 0) {
    claimCommands.push(["PEXPIRE", stateKey, String(STALE_CONTENT_GRACE_MS * 2)]);
  }
  if (recoveredNames.length > 0) cleanupCommands.push(["HDEL", stateKey, ...recoveredNames]);
  return { claimCommands, cleanupCommands, stateBackedNames };
}
function parseStaleContentGraceUntil(results, stateBackedNames) {
  const deadlines = /* @__PURE__ */ new Map();
  if (!Array.isArray(results)) return deadlines;
  for (let i = 0; i < stateBackedNames.length; i++) {
    const setResult = results[i * 2];
    const getResult = results[i * 2 + 1];
    const claimed = Number(setResult?.result);
    const until = Number(getResult?.result);
    if (setResult?.error || getResult?.error || claimed !== 0 && claimed !== 1 || !Number.isSafeInteger(until) || until <= 0) continue;
    deadlines.set(stateBackedNames[i], until);
  }
  return deadlines;
}
function staleContentGraceUntilMs(evidence, stateBackedUntil, now) {
  if (!evidence?.contentStale || !evidence.graceEligible) return null;
  if (!Number.isSafeInteger(stateBackedUntil)) return null;
  return stateBackedUntil > now && stateBackedUntil <= now + STALE_CONTENT_GRACE_MS ? stateBackedUntil : null;
}
function applyStaleContentGrace(checks, graceEvidenceByName, deadlines, now) {
  for (const [name, entry] of Object.entries(checks)) {
    if (entry?.status !== "STALE_CONTENT") continue;
    const until = staleContentGraceUntilMs(graceEvidenceByName.get(name), deadlines.get(name), now);
    if (until !== null) entry.staleContentGraceUntil = new Date(until).toISOString();
  }
}
var EMPTY_DATA_OK_KEYS = /* @__PURE__ */ new Set([
  "notamClosures",
  "faaDelays",
  "intlDelays",
  "gpsjam",
  "positiveGeoEvents",
  "weatherAlerts",
  "imdCycloneMarine",
  "canadaRoads",
  "albertaRoads",
  "manitobaRoads",
  "torontoRoads",
  "bcOpen511",
  "canadaAlerts",
  "canadaAlertsAbSource",
  "canadaAlertsBcSource",
  "canadaAlertsSkSource",
  "earningsCalendar",
  "econCalendar",
  "cotPositioning",
  "usniFleet",
  // usniFleetStale covers the fallback; relay outages → WARN not CRIT
  "newsThreatSummary",
  // a quiet classify cycle writes `byCountry: {}` (0 records); MISSING_DATA_IS_FAILURE_KEYS makes a payload missing beside fresh seed-meta critical (expiry after the 2h TTL reads STALE_SEED, since seed-meta is stale by then)
  "recoveryFiscalSpace",
  "ddosAttacks",
  "trafficAnomalies",
  // zero events during quiet periods is valid, not critical
  "resilienceStaticFao",
  // empty aggregate = no IPC Phase 3+ countries this year (possible in theory); the key must exist but count=0 is fine
  "cableHealth",
  // `cables: {}` = no active subsea cable disruptions per NGA NAVAREA warnings — all cables implicitly healthy. Also covers NGA-upstream-down windows where get-cable-health writes back the fallback response (empty cables); without this, those would alarm EMPTY_DATA.
  "forecastBets",
  // #5233 shadow bet-engine stream; absent before the cron ships it and empty on weeks the energy feed yields no bet — tolerate as STALE_SEED (warn), not EMPTY (crit).
  "forecastFunnel",
  // #5233 funnel guardrail is a new afterPublish side-write; before the first seed-forecasts run ships it the key is absent — tolerate as STALE_SEED (warn), not EMPTY (crit). Its producer never writes status:'error': a collapsed funnel is informational (#8990), so only freshness can degrade this check.
  "forecastCalibrationMap",
  // #7070 map; absent until the daily resolver first writes it, and seed-forecasts publishes raw while it is absent. A dead resolver still alarms through forecastResolutions/forecastScorecard.
  "marketAlertLedger",
  "marketAlertScorecard",
  // #8867: an empty ledger means no market alert has fired yet, and the scorecard then carries four zero rows; a dead seeder still alarms through the 30-minute seed-meta gate.
  "viarailLive",
  // unofficial optional VIA Rail live JSON (#6615); unconfigured / 404 is STALE_SEED then NOT_CONFIGURED, never EMPTY/crit
  // Venues closed or not yet reporting: the relay advances seed-meta only when
  // BestTime answers every venue cleanly with no usable live reading, for up to 24h
  // after the last live one. Provider errors, a dead loop, or a longer silence
  // stop the heartbeat, so an absent payload then reads STALE_SEED.
  "pizzint",
  // Compact projections stay STALE_SEED before their first producer tick or
  // after metadata turns stale. Fresh metadata plus a missing payload is
  // deliberately strict: MISSING_DATA_IS_FAILURE_KEYS reports EMPTY (crit).
  "thermalEscalationBootstrap",
  "ucdpEventsBootstrap",
  "forecastsBootstrap",
  "wildfiresBootstrap",
  "crossStraitActivityBootstrap"
]);
var MISSING_DATA_IS_FAILURE_KEYS = /* @__PURE__ */ new Set([
  // These sparse feeds publish an explicit canonical payload on every
  // successful cycle, including valid zero-record cycles. Fresh metadata
  // therefore cannot excuse a vanished data key.
  "cableHealth",
  "ddosAttacks",
  "trafficAnomalies",
  "notamClosures",
  "thermalEscalationBootstrap",
  "ucdpEventsBootstrap",
  "wildfiresBootstrap",
  "forecastsBootstrap",
  "positiveGeoEvents",
  "crossStraitActivityBootstrap",
  // The Canada road seeders publish an explicit {records: []} envelope on every
  // successful tick (zeroIsValid -> contractState OK_ZERO -> canonical written),
  // so they never refresh metadata alone. Without this, an expired or evicted
  // canonical key alongside a still-refreshing seed-meta classified OK: the map
  // layer goes blank and nothing pages. Same reasoning as `outages`.
  // albertaRoads and manitobaRoads are written by the same seeder on the same
  // publish path; torontoRoads is a different seeder under the same publish contract.
  "canadaRoads",
  "albertaRoads",
  "manitobaRoads",
  "torontoRoads",
  "bcOpen511",
  // Same contract, and the highest-stakes member of it: the provincial union
  // writes {alerts: []} when all configured sources are quiet. Reading
  // OK while an EMERGENCY ALERT payload has vanished is the worst failure in this set.
  "canadaAlerts",
  "canadaAlertsAbSource",
  "canadaAlertsBcSource",
  "canadaAlertsSkSource",
  // The relay classify loop writes the summary on every cycle that reached a
  // digest (`byCountry: {}` when quiet) and advances seed-meta only after that
  // write lands, so fresh metadata beside a missing payload is an expiry or a
  // lost write. That gap zeroes every country's CII news score.
  "newsThreatSummary"
]);
var ZERO_RECORD_DATA_OK_KEYS = /* @__PURE__ */ new Set([
  "ukmtoIncidents",
  ...EMPTY_DATA_OK_KEYS,
  "sanctionsChanges",
  "forecastArchive",
  "naturalEvents",
  // A 72h window with no corroborated strike is a quiet theater, not a failed
  // publish: the relay writes {events: []} every healthy tick, so a MISSING
  // canonical key still reads EMPTY.
  "iranEvents",
  // Thirty quiet days leave an empty tally ({days: {}}), still written every tick.
  "strikePressure",
  // A current List query can validly return no Posts. The relay still writes
  // the canonical snapshot, so a missing xFeed key remains a hard failure.
  "xFeed",
  // Zero active webhook subscribers is a valid state; the status key is still
  // written every tick, so a missing key stays a hard failure.
  "shippingWebhookWorker",
  // Both Toronto CAD sources publish an explicit {records:[]} envelope on a
  // quiet tick. Keep zero valid without softening a missing payload after each
  // activation marker exists.
  "torontoTfs",
  "torontoTps",
  // The relay publishes the dark-ship envelope with zeroOk — zero dark ships
  // is a legitimate peaceful state, not a failed publish. A MISSING key still
  // reads EMPTY (absence is not peaceful).
  "aisGaps",
  "globalTendersSam",
  "globalTendersTed",
  "globalTendersContractsFinder",
  "globalTendersCanadaBuys",
  "globalTendersGets",
  "globalTendersWorldBank",
  "globalTendersColombiaSecop",
  "globalTendersKenyaPpip",
  "globalTendersSouthAfricaEtenders",
  "globalTendersChileMercadoPublico",
  "globalTendersBrazilPncp",
  "globalTendersUkraineProzorro",
  "globalTendersBulgariaEop",
  "globalTendersLatviaIub",
  "globalTendersPolandBzp",
  "globalTendersPakistanPpra",
  // retailer-spread is SUPPRESSED to an explicit 0 by the aggregate job when a
  // market's retailers share < MIN_SPREAD_ITEMS (4) common basket items —
  // consumer-prices-core/src/jobs/aggregate.ts writes `retailer_spread_pct: 0`
  // ("prevent stale noisy value persisting") and logs "spread suppressed
  // (N/4 common items)". That is a valid data-coverage state, not a pipeline
  // outage: the AE basket's cross-retailer overlap shrank 2/4 → 1/4 → 0/4 over
  // late-May 2026 while the seeder kept running fresh (seedAgeMin well inside
  // maxStaleMin) and the sibling keys (overview/categories/movers/basket-series)
  // published normally. Treat 0 records as OK while fresh; STALE_SEED still
  // fires if the publish job itself stops.
  "consumerPricesSpread",
  // CF Radar curated outage annotations (seed-internet-outages, zeroIsValid)
  // are sparse — most 28d windows publish an empty {outages:[]} envelope with
  // recordCount=0 (hasData=true). NARROW set, not EMPTY_DATA_OK_KEYS: the
  // seeder always publishes the array, so a MISSING canonical key is a real
  // publish failure → still EMPTY (crit). ddosAttacks and trafficAnomalies use
  // the same present-payload contract. Their EMPTY_DATA_OK_KEYS membership only
  // preserves pre-first-publish grace.
  "outages",
  // Official disclosure categories are sparse. The canonical snapshot always
  // exists after a successful query, but a quiet 90-day window can validly
  // contain zero owned-category events.
  "chinaCorporateDisclosures",
  "no2Activity",
  // #5736 ingest-health records. `recordCount` is the volume the relay accepted
  // on the last successful append, and zero is legitimate — a run whose records
  // were all deduped, or one with no noteworthy records at all. The record key
  // itself must still exist, so this is the NARROW set: a vanished record is a
  // real gap, not a quiet period.
  "intelHistoryIngestConflictAcled",
  "intelHistoryIngestMilitaryCrossStrait",
  "intelHistoryIngestEnergyIntelligence",
  // A completed surge calculation can legitimately contain no surge events;
  // the canonical snapshot must still exist and remain fresh.
  "militarySurges",
  // TTC GTFS-RT service alerts: a quiet window can validly contain zero
  // disruptions. The seeder always publishes {alerts:[]}, so a missing
  // canonical key is still EMPTY (crit).
  "ttcAlerts"
]);
var CASCADE_GROUPS = {
  theaterPosture: ["theaterPosture", "theaterPostureLive", "theaterPostureBackup"],
  theaterPostureLive: ["theaterPosture", "theaterPostureLive", "theaterPostureBackup"],
  theaterPostureBackup: ["theaterPosture", "theaterPostureLive", "theaterPostureBackup"],
  militaryFlights: ["militaryFlights", "militaryFlightsStale"],
  militaryFlightsStale: ["militaryFlights", "militaryFlightsStale"],
  // Displacement key embeds UTC year — on Jan 1 the new-year key may be empty
  // for hours until the seed runs. Cascade onto the previous-year snapshot.
  displacement: ["displacement", "displacementPrev"],
  displacementPrev: ["displacement", "displacementPrev"]
};
var NEG_SENTINEL = "__WM_NEG__";
function parseRedisValue(raw) {
  if (!raw || raw === NEG_SENTINEL) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}
function strlenIsData(strlen) {
  return strlen > 0 && strlen !== NEG_SENTINEL.length;
}
var LIST_DATA_KEYS = /* @__PURE__ */ new Set([
  STANDALONE_KEYS.forecastBets
  // LPUSH/LTRIM — scripts/seed-forecast-bets.mjs
]);
function dataLenCommand(redisKey) {
  return [LIST_DATA_KEYS.has(redisKey) ? "LLEN" : "STRLEN", redisKey];
}
function keyHasData(redisKey, len) {
  return LIST_DATA_KEYS.has(redisKey) ? len > 0 : strlenIsData(len);
}
function applyCanadaAlertsDataPresenceFallback(keyStrens, keyErrors) {
  const primaryKey = BOOTSTRAP_KEYS.canadaAlerts;
  if (keyErrors.has(primaryKey) || keyHasData(primaryKey, keyStrens.get(primaryKey) ?? 0)) {
    return false;
  }
  for (const fallbackKey of CANADA_ALERTS_CUTOVER_FALLBACK_KEYS) {
    if (keyErrors.has(fallbackKey)) continue;
    const fallbackLength = keyStrens.get(fallbackKey) ?? 0;
    if (keyHasData(fallbackKey, fallbackLength)) {
      keyStrens.set(primaryKey, fallbackLength);
      return true;
    }
  }
  return false;
}
function applyCanadaAlertsSeedMetaFallback(keyMetaValues, keyMetaErrors, usedFallback) {
  if (!usedFallback) return;
  const unionMetaKey = SEED_META.canadaAlerts.key;
  const albertaMetaKey = SEED_META.canadaAlertsAbSource.key;
  if (keyMetaErrors.has(albertaMetaKey)) return;
  const albertaMeta = keyMetaValues.get(albertaMetaKey);
  if (albertaMeta != null) keyMetaValues.set(unionMetaKey, albertaMeta);
}
var TRADE_FLOW_DOMINANT_FAILURE_MODES = /* @__PURE__ */ new Set([
  "run-failed",
  "upstream",
  "empty",
  "incomplete-years",
  "mixed",
  "none"
]);
var COMPANY_MONITORING_WORKER_STATUSES = /* @__PURE__ */ new Set(["ok", "error"]);
var COMPANY_MONITORING_CLAIM_FAILURE_KINDS = /* @__PURE__ */ new Set([
  "timeout",
  "network",
  "http_transient",
  "http_error",
  "invalid_response",
  "unknown"
]);
var COMPANY_MONITORING_SCAN_OUTCOMES = /* @__PURE__ */ new Set([
  "starting",
  "disabled",
  "idle",
  "completed",
  "non_reassuring",
  "fenced",
  "replayed",
  "claim_error",
  "finalize_error"
]);
var COMPANY_MONITORING_ADMISSION_OUTCOMES = /* @__PURE__ */ new Set([
  "disabled",
  "idle",
  "admission_recorded",
  "admission_replayed",
  "admission_transport_failure",
  "admission_claim_error",
  "admission_finalize_error"
]);
var COMPANY_MONITORING_WORKER_OUTCOMES = /* @__PURE__ */ new Set([
  ...COMPANY_MONITORING_SCAN_OUTCOMES,
  ...COMPANY_MONITORING_ADMISSION_OUTCOMES
]);
var COMPANY_MONITORING_WORKER_COUNTERS = Object.freeze([
  "loops",
  "claims",
  "completed",
  "nonReassuring",
  "fenced",
  "replayed",
  "executorErrors",
  "claimErrors",
  "finalizeErrors",
  "admissionClaims",
  "admissionRecorded",
  "admissionReplayed",
  "admissionTransportFailures",
  "admissionClaimErrors",
  "admissionFinalizeErrors"
]);
function projectCompanyMonitoringWorkerSubsystem(raw, outcomes) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw) || !COMPANY_MONITORING_WORKER_STATUSES.has(raw.status) || !outcomes.has(raw.outcome)) return null;
  return { status: raw.status, outcome: raw.outcome };
}
function projectCompanyMonitoringWorkerControl(meta, enabled, now) {
  if (!enabled || !COMPANY_MONITORING_WORKER_STATUSES.has(meta?.status) || !COMPANY_MONITORING_WORKER_OUTCOMES.has(meta?.outcome)) return null;
  let subsystems;
  if (meta.subsystems !== void 0) {
    if (!meta.subsystems || typeof meta.subsystems !== "object" || Array.isArray(meta.subsystems)) return null;
    const scan = projectCompanyMonitoringWorkerSubsystem(
      meta.subsystems.scan,
      COMPANY_MONITORING_SCAN_OUTCOMES
    );
    const admission = projectCompanyMonitoringWorkerSubsystem(
      meta.subsystems.admission,
      COMPANY_MONITORING_ADMISSION_OUTCOMES
    );
    if (!scan || !admission) return null;
    const failure = meta.subsystems.scan.claimFailure;
    if (scan.outcome === "claim_error" && COMPANY_MONITORING_CLAIM_FAILURE_KINDS.has(failure?.kind) && (failure.httpStatus === null || Number.isInteger(failure.httpStatus) && failure.httpStatus >= 400 && failure.httpStatus <= 599)) {
      scan.claimFailure = {
        kind: failure.kind,
        httpStatus: failure.httpStatus,
        consecutiveFailures: Number.isSafeInteger(failure.consecutiveFailures) && failure.consecutiveFailures > 0 ? Math.min(failure.consecutiveFailures, 9999999999) : null,
        lastHealthyAt: Number.isSafeInteger(failure.lastHealthyAt) && failure.lastHealthyAt > 0 && Number.isSafeInteger(meta.observedAt) && meta.observedAt === meta.fetchedAt && failure.lastHealthyAt <= meta.observedAt && meta.observedAt <= now ? failure.lastHealthyAt : null
      };
    }
    subsystems = { scan, admission };
  }
  const counters = {};
  for (const name of COMPANY_MONITORING_WORKER_COUNTERS) {
    const value = meta?.counters?.[name];
    counters[name] = Number.isSafeInteger(value) && value >= 0 ? Math.min(value, 9999999999) : 0;
  }
  return {
    status: meta.status,
    outcome: meta.outcome,
    ...subsystems ? { subsystems } : {},
    counters
  };
}
var JODI_CHINA_ROW_REASONS = /* @__PURE__ */ new Set([
  "china-missing",
  "china-invalid-month",
  "china-stale",
  "china-no-measurements"
]);
function projectJodiChinaRow(meta, enabled) {
  if (!enabled) return null;
  const raw = meta?.chinaRow;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const ok = raw.ok === true;
  const ageMonths = typeof raw.ageMonths === "number" ? raw.ageMonths : NaN;
  const unavailableSince = typeof raw.unavailableSince === "number" ? raw.unavailableSince : NaN;
  return {
    ok,
    reason: !ok && typeof raw.reason === "string" && JODI_CHINA_ROW_REASONS.has(raw.reason) ? raw.reason : null,
    dataMonth: typeof raw.dataMonth === "string" && /^\d{4}-\d{2}$/.test(raw.dataMonth) ? raw.dataMonth : null,
    ageMonths: Number.isSafeInteger(ageMonths) && ageMonths >= 0 ? ageMonths : null,
    unavailableSince: !ok && Number.isFinite(unavailableSince) && unavailableSince > 0 ? unavailableSince : null
  };
}
function parseFiniteRecordCount(raw) {
  if (typeof raw === "number") return Number.isFinite(raw) && raw >= 0 ? raw : null;
  if (typeof raw === "string" && raw.trim() !== "") {
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }
  return null;
}
function projectSourceFailure(meta, policy, now, maxStaleMin) {
  if (Array.isArray(policy)) policy = policy.find((candidate) => candidate.failureCodePattern.test(meta?.errorCode));
  if (!policy || meta?.sourceState !== "degraded") return null;
  let retainedUntil = Infinity;
  if (policy.sources) {
    const failed = meta.failedSources;
    const states = Array.isArray(failed) && failed.length > 0 && failed.length < policy.sources.length && new Set(failed).size === failed.length && failed.every((source) => policy.sources.includes(source)) ? failed.map((source) => meta.sourceHealth?.[source]) : [];
    const valid = states.length > 0 && states.every((state) => Number.isSafeInteger(state?.consecutiveFailures) && state.consecutiveFailures >= 1 && [state.lastSuccessAt, state.firstFailureAt, state.retainedUntil].every((value) => Number.isSafeInteger(value) && value > 0) && state.lastSuccessAt <= state.firstFailureAt && state.firstFailureAt <= meta.lastSourceAttemptAt);
    retainedUntil = valid ? Math.min(...states.map((state) => state.retainedUntil)) : NaN;
    meta = {
      ...meta,
      consecutiveSourceFailures: valid ? Math.max(...states.map((state) => state.consecutiveFailures)) : null,
      firstSourceFailureAt: valid ? Math.min(...states.map((state) => state.firstFailureAt)) : null,
      lastSourceSuccessAt: valid ? Math.min(...states.map((state) => state.lastSuccessAt)) : null,
      lastSourceFailureCode: meta.errorCode
    };
  }
  const errorCode = typeof meta?.errorCode === "string" && policy.failureCodePattern.test(meta.errorCode) ? meta.errorCode : null;
  if (!errorCode) return null;
  const lastSourceFailureCode = typeof meta?.lastSourceFailureCode === "string" && policy.failureCodePattern.test(meta.lastSourceFailureCode) ? meta.lastSourceFailureCode : null;
  const consecutiveSourceFailures = Number.isInteger(meta?.consecutiveSourceFailures) && meta.consecutiveSourceFailures >= 1 ? Math.min(meta.consecutiveSourceFailures, 100) : null;
  let pending = lastSourceFailureCode === errorCode && consecutiveSourceFailures !== null && consecutiveSourceFailures < policy.warnAfterConsecutive;
  let pendingUntil = null;
  if (policy.maxPendingMin != null) {
    const first = meta.firstSourceFailureAt;
    const attempt = meta.lastSourceAttemptAt;
    const success = meta[policy.successAtField || "fetchedAt"];
    const validEpisode = [first, attempt, success].every((value) => Number.isSafeInteger(value) && value > 0) && success <= first && first <= attempt && attempt <= now;
    const deadline = validEpisode ? Math.min(first + policy.maxPendingMin * 6e4, success + maxStaleMin * 6e4, retainedUntil) : NaN;
    pending = pending && parseFiniteRecordCount(meta.count ?? meta.recordCount) > 0 && Number.isFinite(deadline) && now < deadline;
    if (pending) pendingUntil = new Date(deadline).toISOString();
  }
  return {
    errorCode,
    consecutiveSourceFailures,
    lastSourceFailureCode,
    pending,
    pendingUntil
  };
}
function readSeedMeta(seedCfg, keyMetaValues, keyMetaErrors, now) {
  if (!seedCfg) {
    return { hasMeta: false, seedAge: null, seedStale: null, seedError: false, sourceUnavailable: false, sourceBlocked: false, metaReadFailed: false, metaCount: null, contentAge: null, coverage: null, sourceFailure: null, synthesisFailure: null, dominantFailureMode: null, chinaRow: null, workerControl: null, resilienceCacheState: null };
  }
  if (keyMetaErrors.get(seedCfg.key)) {
    return { hasMeta: false, seedAge: null, seedStale: null, seedError: false, sourceUnavailable: false, sourceBlocked: false, metaReadFailed: true, metaCount: null, contentAge: null, coverage: null, sourceFailure: null, synthesisFailure: null, dominantFailureMode: null, chinaRow: null, workerControl: null, resilienceCacheState: null };
  }
  const meta = unwrapEnvelope(parseRedisValue(keyMetaValues.get(seedCfg.key))).data;
  const metaCount = parseFiniteRecordCount(meta?.count ?? meta?.recordCount ?? null);
  const failedDatasets = [];
  const seenFailedDatasets = /* @__PURE__ */ new Set();
  if (seedCfg.projectFailedDatasets && Array.isArray(meta?.failedDatasets)) {
    for (const entry of meta.failedDatasets) {
      if (typeof entry !== "string" || entry.length === 0 || entry.length > 100 || seenFailedDatasets.has(entry)) continue;
      seenFailedDatasets.add(entry);
      failedDatasets.push(entry);
      if (failedDatasets.length === 50) break;
    }
  }
  const metaRankableCount = parseRankableRecordCount(meta);
  const redistributionPolicyVersion = Number.isInteger(meta?.redistributionPolicyVersion) ? meta.redistributionPolicyVersion : null;
  const poolCounts = parsePoolCounts(meta?.poolCounts, seedCfg.minPoolCounts);
  const poolMargins = seedCfg.poolCountMargin != null ? poolCoverageMargins(poolCounts, seedCfg.minPoolCounts, seedCfg.poolCountMargin) : null;
  const errorCode = typeof meta?.errorCode === "string" && /^[A-Z0-9_]{1,64}$/.test(meta.errorCode) ? meta.errorCode : null;
  const workerControl = projectCompanyMonitoringWorkerControl(meta, seedCfg.workerControl, now);
  const resilienceCacheState = seedCfg.requireResilienceCacheState ? assessResilienceCacheState(meta) : null;
  if (meta?.status === "error") {
    return {
      hasMeta: true,
      seedAge: null,
      seedStale: true,
      seedError: true,
      sourceUnavailable: false,
      sourceBlocked: false,
      metaReadFailed: false,
      metaCount,
      metaRankableCount,
      redistributionPolicyVersion,
      poolCounts,
      poolMargins,
      contentAge: null,
      contentFreshness: null,
      decisionGroups: null,
      coverage: null,
      errorCode,
      sourceFailure: null,
      synthesisFailure: null,
      dominantFailureMode: null,
      // A producer that reported `status: 'error'` never got far enough to
      // assess China this run; relaying the previous run's verdict here would
      // read as current.
      chinaRow: null,
      workerControl,
      resilienceCacheState,
      failedDatasets
    };
  }
  let seedAge = null;
  let seedStale = true;
  const fetchedAt = Number(meta?.fetchedAt);
  if (Number.isFinite(fetchedAt) && fetchedAt > 0) {
    seedAge = Math.round((now - fetchedAt) / 6e4);
    seedStale = seedAge > seedCfg.maxStaleMin;
  }
  if (resilienceCacheState?.ok === false) seedStale = true;
  const sourceUnavailable = meta?.sourceState === "unavailable";
  const sourceBlocked = meta?.sourceState === "blocked";
  const sourceFailure = projectSourceFailure(meta, seedCfg.sourceFailure, now, seedCfg.maxStaleMin);
  const inputFreshUntil = Number(meta?.inputFreshUntil);
  const inputFreshnessExpired = seedCfg.enforceInputFreshUntil === true && meta?.sourceState === "ok" && (!Number.isFinite(inputFreshUntil) || inputFreshUntil <= now);
  const sourceDegraded = inputFreshnessExpired || typeof meta?.sourceState === "string" && meta.sourceState !== "ok" && !sourceUnavailable && !sourceBlocked && sourceFailure?.pending !== true && !(seedCfg.sourceFailureWithinBudgetOk === true && seedStale === false && (meta.sourceState === "stale" && meta.recordCount > 0 || meta.sourceState === "error" && meta.confirmedEmpty === true));
  const contentAge = assessContentAge(meta, now);
  const contentFreshness = buildContentFreshnessAssessment(
    meta,
    seedCfg.requireContentFreshness,
    now
  );
  const decisionDiagnostics = seedCfg.decisionGroups ? projectChinaDecisionGroupDiagnostics(meta, {
    groupIds: seedCfg.decisionGroups,
    allowedStates: CHINA_DECISION_SIGNAL_STATES,
    healthyQuietCause: CHINA_DECISION_HEALTHY_QUIET_CAUSE
  }) : null;
  const decisionGroups = decisionDiagnostics ? {
    ...decisionDiagnostics.groupCounts,
    groupStates: decisionDiagnostics.groupStates,
    quietGroups: decisionDiagnostics.quietGroups,
    partialGroups: decisionDiagnostics.partialGroups,
    staleGroups: decisionDiagnostics.staleGroups,
    unavailableGroups: decisionDiagnostics.unavailableGroups,
    ...decisionDiagnostics.coverageLastSuccessAt ? { coverageLastSuccessAt: decisionDiagnostics.coverageLastSuccessAt } : {},
    ...decisionDiagnostics.coverageFailureInvalidReason ? { coverageFailureInvalidReason: decisionDiagnostics.coverageFailureInvalidReason } : {}
  } : seedCfg.decisionGroups ? { coverageFailureInvalidReason: "GROUP_DIAGNOSTICS_INVALID" } : null;
  const coverageRetailers = Array.isArray(meta?.coverage?.retailers) ? meta.coverage.retailers.slice(0, 100).map((retailer) => ({
    slug: typeof retailer?.slug === "string" ? retailer.slug.slice(0, 80) : null,
    name: typeof retailer?.name === "string" ? retailer.name.slice(0, 120) : null,
    coverageStatus: typeof retailer?.coverageStatus === "string" ? retailer.coverageStatus : "unknown",
    pagesAttempted: Number(retailer?.pagesAttempted) || 0,
    pagesSucceeded: Number(retailer?.pagesSucceeded) || 0,
    failedPages: Number(retailer?.failedPages) || 0,
    rejectedCount: Number(retailer?.rejectedCount) || 0,
    completionRatio: retailer?.completionRatio == null ? null : Number(retailer.completionRatio) || 0,
    failureReasons: sanitizeCoverageFailureReasons(retailer?.failureReasons)
  })) : null;
  const finiteCoverageField = (field) => {
    const value = meta?.coverage?.[field];
    return Number.isFinite(value) ? { [field]: value } : {};
  };
  const coverage = meta?.coverage && typeof meta.coverage === "object" ? {
    status: typeof meta.coverage.status === "string" ? meta.coverage.status : null,
    completedPages: Number(meta.coverage.completedPages) || 0,
    failedPages: Number(meta.coverage.failedPages) || 0,
    completionRatio: meta.coverage.completionRatio == null ? null : Number(meta.coverage.completionRatio) || 0,
    rejectedCount: Number(meta.coverage.rejectedCount) || 0,
    ...finiteCoverageField("countrySpecificImportCountryCount"),
    ...finiteCoverageField("globalProductionCommodityCount"),
    ...finiteCoverageField("completeCountryCount"),
    ...finiteCoverageField("currentCountryCount"),
    ...finiteCoverageField("retainedCountryCount"),
    ...finiteCoverageField("oldestCountryCacheWrittenAt"),
    ...finiteCoverageField("rankableCountryCount"),
    ...finiteCoverageField("rankableRecordCount"),
    ...finiteCoverageField("freshRankableRecordCount"),
    ...finiteCoverageField("reviewedCommodityCount"),
    ...finiteCoverageField("reviewedHs4Count"),
    ...finiteCoverageField("reviewedHs2Count"),
    failureReasons: sanitizeCoverageFailureReasons(meta.coverage.failureReasons),
    retailers: coverageRetailers
  } : null;
  const coverageCompletionRatioUsable = Number.isFinite(meta?.coverage?.completionRatio) && meta.coverage.completionRatio >= 0 && meta.coverage.completionRatio <= 1;
  let synthesisFailure = null;
  if (seedCfg.synthesisFailure) {
    const consecutiveFailures = Number.isInteger(meta?.consecutiveFailures) && meta.consecutiveFailures >= 0 ? Math.min(meta.consecutiveFailures, 100) : 0;
    const lastAttemptAt = Number.isFinite(Number(meta?.lastAttemptAt)) && Number(meta.lastAttemptAt) > 0 ? Number(meta.lastAttemptAt) : null;
    const lastSuccessAt = Number.isFinite(Number(meta?.lastSuccessAt)) && Number(meta.lastSuccessAt) > 0 ? Number(meta.lastSuccessAt) : null;
    const synthesisFailureAgeMin = lastAttemptAt == null ? null : Math.round((now - lastAttemptAt) / 6e4);
    const failureCodePattern = seedCfg.synthesisFailure.failureCodePattern ?? /^INSIGHTS_SYNTHESIS_(PARSE|GATE|MISSING_CLUSTER|PROVIDER)$/;
    const lastSynthesisFailureCode = typeof meta?.lastSynthesisFailureCode === "string" && failureCodePattern.test(meta.lastSynthesisFailureCode) ? meta.lastSynthesisFailureCode : null;
    const servedGeneratedAt = typeof meta?.servedGeneratedAt === "string" && meta.servedGeneratedAt.length <= 64 ? meta.servedGeneratedAt : null;
    const warning = consecutiveFailures > 0 && (consecutiveFailures >= seedCfg.synthesisFailure.warnAfterConsecutive || synthesisFailureAgeMin != null && synthesisFailureAgeMin >= seedCfg.synthesisFailure.warnAfterAgeMin || seedCfg.synthesisFailure.warnWithoutSuccess && lastSuccessAt == null);
    synthesisFailure = {
      consecutiveFailures,
      lastAttemptAt,
      lastSuccessAt,
      servedGeneratedAt,
      synthesisFailureAgeMin,
      lastSynthesisFailureCode,
      warning
    };
  }
  let dominantFailureMode = null;
  if (seedCfg?.dominantFailureMode && typeof meta?.dominantFailureMode === "string" && TRADE_FLOW_DOMINANT_FAILURE_MODES.has(meta.dominantFailureMode)) {
    dominantFailureMode = meta.dominantFailureMode;
  }
  const chinaRow = projectJodiChinaRow(meta, seedCfg?.chinaRow);
  return {
    hasMeta: meta != null,
    seedFetchedAt: fetchedAt,
    targetLocationsDegraded: meta?.targetLocationsDegraded === true,
    seedAge,
    seedStale,
    seedError: sourceDegraded || failedDatasets.length > 0,
    sourceUnavailable,
    sourceBlocked,
    metaReadFailed: false,
    metaCount,
    metaRankableCount,
    redistributionPolicyVersion,
    poolCounts,
    poolMargins,
    contentAge,
    contentFreshness,
    decisionGroups,
    coverage,
    coverageCompletionRatioUsable,
    errorCode,
    sourceFailure,
    synthesisFailure,
    dominantFailureMode,
    chinaRow,
    workerControl,
    resilienceCacheState,
    failedDatasets
  };
}
function isCascadeCovered(name, hasData, keyStrens, keyErrors) {
  const siblings = CASCADE_GROUPS[name];
  if (!siblings || hasData) return false;
  for (const sibling of siblings) {
    if (sibling === name) continue;
    const sibKey = STANDALONE_KEYS[sibling] ?? BOOTSTRAP_KEYS[sibling];
    if (!sibKey) continue;
    if (keyErrors.get(sibKey)) continue;
    if (keyHasData(sibKey, keyStrens.get(sibKey) ?? 0)) return true;
  }
  return false;
}
function classifyKey(name, redisKey, opts, ctx) {
  const { keyStrens, keyErrors, keyMetaValues, keyMetaErrors, now } = ctx;
  let seedCfg = SEED_META[name];
  if (seedCfg?.legacyMaxStaleMin != null) {
    const published = unwrapEnvelope(parseRedisValue(keyMetaValues.get(seedCfg.key))).data;
    const payloadTtlSeconds = published?.payloadTtlSeconds;
    if (!Number.isFinite(payloadTtlSeconds) || payloadTtlSeconds <= seedCfg.maxStaleMin * 60) {
      seedCfg = { ...seedCfg, maxStaleMin: seedCfg.legacyMaxStaleMin };
    }
  }
  ctx.containmentEvidenceByName?.delete(name);
  let isOnDemand = !!opts.allowOnDemand && ON_DEMAND_KEYS.has(name) && ctx.activationStates?.get(name) !== true;
  const rolloutPendingUntil = ctx.rolloutPendingUntilMs?.get(name);
  const isRolloutPending = rolloutPendingUntil != null && now < rolloutPendingUntil && ctx.activationStates?.get(name) !== true;
  const activationUnknown = Boolean(ctx.activationStates) && [
    ACTIVATION_MARKERS[name] ? name : null,
    seedCfg?.contentFreshnessActivation ?? null
  ].some((markerName) => markerName !== null && !ctx.activationStates.has(markerName));
  const meta = readSeedMeta(seedCfg, keyMetaValues, keyMetaErrors, now);
  if (name === "no2Activity" && meta.hasMeta) isOnDemand = false;
  if (keyErrors.get(redisKey) || meta.metaReadFailed || name === "educationAttainment" && ctx.educationPayloadReadFailed) {
    const entry2 = { status: "REDIS_PARTIAL", records: null };
    if (seedCfg) entry2.maxStaleMin = seedCfg.maxStaleMin;
    return entry2;
  }
  const strlen = keyStrens.get(redisKey) ?? 0;
  const hasData = keyHasData(redisKey, strlen);
  const {
    hasMeta,
    seedAge,
    seedStale,
    seedError,
    sourceUnavailable,
    sourceBlocked,
    metaCount,
    metaRankableCount,
    redistributionPolicyVersion,
    poolCounts,
    poolMargins,
    contentAge,
    contentFreshness,
    decisionGroups,
    coverage,
    coverageCompletionRatioUsable,
    errorCode,
    sourceFailure,
    synthesisFailure,
    dominantFailureMode,
    chinaRow,
    workerControl,
    resilienceCacheState,
    failedDatasets
  } = meta;
  const isPreActivationOnDemand = isOnDemand && !hasData && !hasMeta && ctx.activationStates?.get(name) === false;
  const rankableRecordCount = name === "educationAttainment" && Object.hasOwn(ctx, "educationPayloadRankableCount") ? ctx.educationPayloadRankableCount : metaRankableCount;
  const contentFreshnessActivationWindow = seedCfg?.requireContentFreshness && contentFreshness && !contentFreshness.fieldPresent && seedCfg.contentFreshnessActivation ? getActiveContentFreshnessActivationWindow(
    ACTIVATION_MARKERS[seedCfg.contentFreshnessActivation],
    ctx.activationStates?.get(seedCfg.contentFreshnessActivation),
    now
  ) : null;
  const contentFreshnessPending = contentFreshnessActivationWindow !== null;
  const records = hasData ? metaCount ?? 1 : 0;
  const cascadeCovered = isCascadeCovered(name, hasData, keyStrens, keyErrors);
  let fault = null;
  if (!sourceUnavailable) {
    if (sourceBlocked && name !== "crossStraitActivityJapanMod") {
      fault = "SEED_ERROR";
    } else if (sourceBlocked && hasData && records > 0 && seedStale !== true) fault = "SOURCE_BLOCKED";
    else if (synthesisFailure?.warning) fault = "SEED_ERROR";
    else if (seedError || sourceFailure?.pendingUntil && !hasData) fault = "SEED_ERROR";
  }
  let status;
  if (sourceUnavailable) status = "NOT_CONFIGURED";
  else if (!hasData) {
    let absent;
    if (cascadeCovered) absent = "OK_CASCADE";
    else if (MISSING_DATA_IS_FAILURE_KEYS.has(name) && hasMeta && (seedStale !== true || fault)) {
      absent = isRolloutPending ? "ROLLOUT_PENDING" : "EMPTY";
    } else if (isPreActivationOnDemand) absent = "EMPTY_ON_DEMAND";
    else if (EMPTY_DATA_OK_KEYS.has(name)) absent = seedStale === true ? "STALE_SEED" : "OK";
    else if (isOnDemand) absent = "EMPTY_ON_DEMAND";
    else if (isRolloutPending) absent = "ROLLOUT_PENDING";
    else absent = "EMPTY";
    status = fault && statusSeverityRank(absent) <= statusSeverityRank(fault) ? fault : absent;
  } else if (fault) status = fault;
  else if (records === 0) {
    if (ZERO_RECORD_DATA_OK_KEYS.has(name)) status = seedStale === true ? "STALE_SEED" : "OK";
    else if (isOnDemand) status = "EMPTY_ON_DEMAND";
    else status = "EMPTY_DATA";
  } else if (seedStale === true) status = "STALE_SEED";
  else if (seedCfg?.requiredRedistributionPolicyVersion != null && redistributionPolicyVersion !== seedCfg.requiredRedistributionPolicyVersion) status = "POLICY_INCOMPATIBLE";
  else if (decisionGroups?.coverageFailureInvalidReason || decisionGroups?.staleGroups?.length > 0) status = "COVERAGE_PARTIAL";
  else if (seedCfg?.minRecordCount != null && (metaCount == null || metaCount < seedCfg.minRecordCount)) status = "COVERAGE_PARTIAL";
  else if (seedCfg?.minRankableRecordCount != null && (rankableRecordCount == null || rankableRecordCount < seedCfg.minRankableRecordCount)) status = "COVERAGE_PARTIAL";
  else if (seedCfg?.requireVulnerabilityCoverage && (!coverage || Object.entries(seedCfg.requireVulnerabilityCoverage).some(([field, floor]) => !Number.isFinite(coverage[field]) || coverage[field] < floor))) status = "COVERAGE_PARTIAL";
  else if (hasPoolCoverageShortfall(poolCounts, seedCfg?.minPoolCounts)) status = "COVERAGE_PARTIAL";
  else if (seedCfg?.requireCoverage && !coverage) status = "COVERAGE_DEGRADED";
  else if (seedCfg?.requireContentFreshness && !contentFreshness?.usable && !contentFreshnessPending) status = "COVERAGE_DEGRADED";
  else if (seedCfg?.minSuccessRate != null && coverage && (coverage.completionRatio < seedCfg.minSuccessRate || coverage.status === "degraded")) status = "COVERAGE_DEGRADED";
  else if (coverage && coverage.status === "partial") status = "COVERAGE_PARTIAL";
  else if (contentAge && contentAge.contentStale) status = "STALE_CONTENT";
  else if (contentFreshness?.contentStale) status = "STALE_CONTENT";
  else if (contentAge && contentAge.preWarning) status = "CONTENT_AGE_PREWARNING";
  else if (poolMargins && Object.values(poolMargins).some((pool) => pool.low)) status = "COVERAGE_MARGIN_LOW";
  else status = "OK";
  const entry = { status, records };
  if (name === "ddosAttacks" && meta.targetLocationsDegraded) entry.targetLocationsDegraded = true;
  if (isOnDemand) entry.onDemand = true;
  if (activationUnknown) entry.activationUnknown = true;
  if (status === "ROLLOUT_PENDING") entry.rolloutPendingUntil = new Date(rolloutPendingUntil).toISOString();
  if (contentFreshnessActivationWindow) {
    entry.contentFreshnessPendingUntil = new Date(contentFreshnessActivationWindow.untilMs).toISOString();
  }
  if (rolloutPendingUntil != null) {
    entry.activated = ctx.activationStates?.get(name) === true;
  }
  if (seedAge !== null) entry.seedAgeMin = seedAge;
  if (seedCfg) entry.maxStaleMin = seedCfg.maxStaleMin;
  if (seedCfg?.minRecordCount != null) entry.minRecordCount = seedCfg.minRecordCount;
  if (seedCfg?.minRankableRecordCount != null) {
    entry.rankableRecordCount = rankableRecordCount;
    entry.minRankableRecordCount = seedCfg.minRankableRecordCount;
  }
  if (seedCfg?.minPoolCounts) entry.minPoolCounts = seedCfg.minPoolCounts;
  if (seedCfg?.requiredRedistributionPolicyVersion != null) {
    entry.redistributionPolicyVersion = redistributionPolicyVersion;
    entry.requiredRedistributionPolicyVersion = seedCfg.requiredRedistributionPolicyVersion;
  }
  if (seedCfg?.requireVulnerabilityCoverage) {
    entry.requiredVulnerabilityCoverage = seedCfg.requireVulnerabilityCoverage;
  }
  if (poolCounts) entry.poolCounts = poolCounts;
  if (poolMargins) entry.poolCoverageMargin = poolMargins;
  if (seedCfg?.poolCountMargin != null) entry.poolCountMargin = seedCfg.poolCountMargin;
  if (coverage || seedCfg?.requireCoverage) entry.coverage = coverage;
  if ((fault === "SEED_ERROR" || sourceFailure) && errorCode) entry.errorCode = errorCode;
  if (sourceFailure) {
    if (sourceFailure.consecutiveSourceFailures !== null) {
      entry.consecutiveSourceFailures = sourceFailure.consecutiveSourceFailures;
    }
    if (sourceFailure.lastSourceFailureCode) {
      entry.lastSourceFailureCode = sourceFailure.lastSourceFailureCode;
    }
    if (sourceFailure.pendingUntil) {
      if (status === "OK" && hasData && records > 0 && metaCount > 0 && seedStale === false) {
        entry.status = "SEED_ERROR";
        entry.sourceFailurePendingUntil = sourceFailure.pendingUntil;
      }
    } else if (sourceFailure.pending) entry.sourceFailurePending = true;
  }
  if (dominantFailureMode) entry.dominantFailureMode = dominantFailureMode;
  if (chinaRow) entry.chinaRow = chinaRow;
  if (workerControl) entry.workerControl = workerControl;
  const claimFailure = workerControl?.subsystems?.scan?.claimFailure;
  if (entry.status === "SEED_ERROR" && hasData && records > 0 && workerControl?.status === "error" && workerControl.outcome === "claim_error" && workerControl.subsystems.scan.status === "error" && workerControl.subsystems.admission.status === "ok" && ["disabled", "idle", "admission_recorded", "admission_replayed"].includes(workerControl.subsystems.admission.outcome) && claimFailure?.consecutiveFailures >= 1 && claimFailure.consecutiveFailures < 3 && (["timeout", "network"].includes(claimFailure.kind) && claimFailure.httpStatus === null || claimFailure.kind === "http_transient" && [408, 429, 500, 502, 503, 504].includes(claimFailure.httpStatus)) && claimFailure.lastHealthyAt !== null && claimFailure.lastHealthyAt <= now) {
    const deadline = claimFailure.lastHealthyAt + seedCfg.maxStaleMin * 6e4;
    if (now < deadline) entry.workerControlPendingUntil = new Date(deadline).toISOString();
  }
  if (resilienceCacheState) entry.cacheState = resilienceCacheState;
  if (failedDatasets?.length > 0) entry.failedDatasets = failedDatasets;
  if (contentAge) {
    entry.contentAgeMin = contentAge.contentAgeMin;
    entry.maxContentAgeMin = contentAge.maxContentAgeMin;
    if (status === "CONTENT_AGE_PREWARNING" && contentAge.preWarning) {
      entry.warnAtContentAgeMin = contentAge.preWarning.warnAtContentAgeMin;
      entry.contentAgeRemainingMin = contentAge.preWarning.remainingContentAgeMin;
      if (contentAge.preWarning.breachAt) entry.contentAgeBreachAt = contentAge.preWarning.breachAt;
    }
  }
  if (contentFreshness && !contentFreshnessPending) {
    entry.contentFreshness = projectContentFreshnessForWire(contentFreshness);
  }
  if (decisionGroups) entry.decisionGroups = decisionGroups;
  if (synthesisFailure) {
    entry.consecutiveFailures = synthesisFailure.consecutiveFailures;
    if (synthesisFailure.lastAttemptAt != null) entry.lastAttemptAt = synthesisFailure.lastAttemptAt;
    if (synthesisFailure.lastSuccessAt != null || synthesisFailure.consecutiveFailures > 0) {
      entry.lastSuccessAt = synthesisFailure.lastSuccessAt;
    }
    if (synthesisFailure.servedGeneratedAt != null) entry.servedGeneratedAt = synthesisFailure.servedGeneratedAt;
    if (synthesisFailure.synthesisFailureAgeMin != null && synthesisFailure.consecutiveFailures > 0) {
      entry.synthesisFailureAgeMin = synthesisFailure.synthesisFailureAgeMin;
    }
    if (synthesisFailure.lastSynthesisFailureCode) {
      entry.lastSynthesisFailureCode = synthesisFailure.lastSynthesisFailureCode;
    }
  }
  if (name === "humanitarianSummary" && ctx.humanitarianRetention?.until > now) {
    entry.containmentUntil = new Date(ctx.humanitarianRetention.until).toISOString();
  }
  if (name === "humanitarianSummary") {
    const sourceMeta = unwrapEnvelope(parseRedisValue(keyMetaValues.get(seedCfg.key))).data;
    for (const field of ["lastSourceAttemptAt", "lastSuccessAt", "retryAt"]) {
      if (Number.isSafeInteger(sourceMeta?.[field]) && sourceMeta[field] > 0) entry[field] = sourceMeta[field];
    }
  }
  ctx.containmentEvidenceByName?.set(name, {
    status,
    records: hasData ? metaCount : null,
    usable: Number.isFinite(seedAge) && seedAge >= 0 && Number.isFinite(meta.seedFetchedAt) && meta.seedFetchedAt > 0 && meta.seedFetchedAt <= now && (!synthesisFailure?.servedGeneratedAt || Date.parse(synthesisFailure.servedGeneratedAt) <= now) && (seedCfg?.requiredRedistributionPolicyVersion == null || redistributionPolicyVersion === seedCfg.requiredRedistributionPolicyVersion) && !decisionGroups?.coverageFailureInvalidReason && (seedCfg?.minRankableRecordCount == null || rankableRecordCount != null) && (!seedCfg?.requireVulnerabilityCoverage || coverage && Object.keys(seedCfg.requireVulnerabilityCoverage).every((field) => Number.isFinite(coverage[field]))) && (!seedCfg?.minPoolCounts || poolCounts !== null) && (!seedCfg?.requireCoverage || coverage !== null) && (!coverage || seedCfg?.minSuccessRate == null || coverageCompletionRatioUsable) && (!seedCfg?.requireContentFreshness || contentFreshness?.usable || contentFreshnessPending) && (!contentAge || Number.isFinite(contentAge.newestItemAt) && contentAge.newestItemAt <= now && Number.isFinite(contentAge.contentAgeMin) && contentAge.contentAgeMin >= 0) && resilienceCacheState?.ok !== false && (name !== "humanitarianSummary" || ctx.humanitarianRetention?.until > now && ctx.humanitarianRetention.records === metaCount) && !seedCfg?.enforceInputFreshUntil
  });
  return entry;
}
var STATUS_COUNTS = {
  OK: "ok",
  OK_CASCADE: "ok",
  // An optional source adapter this deployment never supplied a credential for
  // (producer wrote sourceState:'unavailable'). Buckets to `ok` because there is
  // no fault and no operator action that would clear it other than opting in.
  // Must stay registered here: the summary does `STATUS_COUNTS[status] ?? 'warn'`,
  // so an unlisted status would silently re-become the warn this exists to stop.
  NOT_CONFIGURED: "ok",
  // The producer ran and classified an external transport refusal with a
  // documented reason. Retained reviewed data remains usable, and retrying the
  // same bounded paths cannot clear it, so this is informational rather than a
  // fleet-health warning.
  SOURCE_BLOCKED: "ok",
  // Every configured pool is ABOVE its floor, but at least one is within
  // `poolCountMargin` of it. Buckets to `ok` on purpose: for probes whose
  // health minimums equal the producer's publication floors, a passing cohort
  // sitting a few records above the line is the normal steady state, so warning
  // on it would flip fleet health to WARNING indefinitely and train operators
  // to ignore it. The margin is carried as data on the entry
  // (`poolCoverageMargin`) for dashboards and trend queries; an actual breach
  // is still COVERAGE_PARTIAL (warn), and a producer that stops publishing
  // still goes STALE_SEED (warn). Registered here rather than left out because
  // the summary does `STATUS_COUNTS[status] ?? 'warn'` — omitting it would
  // silently produce exactly the warn this status exists to avoid.
  COVERAGE_MARGIN_LOW: "ok",
  STALE_SEED: "warn",
  SEED_ERROR: "warn",
  EMPTY_ON_DEMAND: "warn",
  REDIS_PARTIAL: "warn",
  COVERAGE_PARTIAL: "warn",
  COVERAGE_DEGRADED: "warn",
  // The stored cohort is present but every current reader rejects it. Treat
  // this like an unavailable schema, not reduced-but-serving coverage.
  POLICY_INCOMPATIBLE: "crit",
  // Content-age signal — seeder is healthy but upstream stopped publishing.
  // Operator can't fix upstream cadence, so de-rank vs. STALE_SEED in alerting
  // (both bucket to 'warn' — overall status is `degraded`, not `critical`).
  // 2026-05-04 health-readiness plan, Sprint 1.
  STALE_CONTENT: "warn",
  // Registered as warn (required: unlisted statuses re-become warn) and
  // bucketed ok below, so the pre-warning rides the compact pending lane
  // without flipping fleet health or paging. Same pattern as the bounded
  // STALE_CONTENT grace and relay transport grace.
  CONTENT_AGE_PREWARNING: "warn",
  // Bounded deploy-before-cron window (#6059): the schema is live but its
  // producer has not reached its first scheduled run yet. Warn — NOT ok — so
  // the interim state is visible and flips `overall` to WARNING; and NOT
  // subtracted from realWarnCount the way EMPTY_ON_DEMAND is, because unlike
  // an unrequested RPC cache this one is on a clock and must be watched.
  ROLLOUT_PENDING: "warn",
  CHINA_DEGRADED: "warn",
  CHINA_UNAVAILABLE: "crit",
  EMPTY: "crit",
  EMPTY_DATA: "crit",
  // Tenant-relay gateway gate (probeRelayGatewayGate). Both crit statuses mean
  // checkout / customer-portal / notification-channels are dead right now:
  // MISCONFIGURED is the Vercel half of #8208 (the build cannot see the
  // secret), REJECTED is the Convex half (the deployed gate does not admit
  // it). UNREACHABLE is a transport verdict, not a credential one, and stays
  // a warning so a single Convex blip inside one 60 s snapshot does not page.
  RELAY_GATE_MISCONFIGURED: "crit",
  RELAY_GATE_REJECTED: "crit",
  RELAY_GATE_UNREACHABLE: "warn"
};
function healthStatusBucket(entry, now) {
  if (entry?.status === "CONTENT_AGE_PREWARNING") return "ok";
  if (["COVERAGE_PARTIAL", "CHINA_DEGRADED"].includes(entry?.status) && typeof entry.chinaCoveragePendingUntil === "string" && !isExpiredDeadline(entry.chinaCoveragePendingUntil, now)) return "ok";
  if (entry?.status === "SEED_ERROR" && [entry.sourceFailurePendingUntil, entry.workerControlPendingUntil].some((deadline) => typeof deadline === "string" && !isExpiredDeadline(deadline, now))) return "ok";
  if (entry?.status === "STALE_CONTENT" && Object.prototype.hasOwnProperty.call(entry, "staleContentGraceUntil") && !isExpiredDeadline(entry.staleContentGraceUntil, now)) return "ok";
  if (entry?.status === "RELAY_GATE_UNREACHABLE" && typeof entry.transportGraceUntil === "string" && !isExpiredDeadline(entry.transportGraceUntil, now)) return "ok";
  return STATUS_COUNTS[entry?.status] ?? "warn";
}
var CONTAINMENT_ELIGIBLE_STATUSES = /* @__PURE__ */ new Set([
  "STALE_SEED",
  "SEED_ERROR",
  "STALE_CONTENT",
  "COVERAGE_PARTIAL",
  "COVERAGE_DEGRADED",
  "CHINA_DEGRADED"
]);
function isContainedHealthWarning(entry, evidence, now = Date.now()) {
  return healthStatusBucket(entry, now) === "warn" && CONTAINMENT_ELIGIBLE_STATUSES.has(entry?.status) && Number.isFinite(entry?.records) && (entry.records > 0 || entry.records === 0 && evidence?.confirmedEmpty === true) && evidence?.status === entry.status && evidence.records === entry.records && evidence.usable === true && (entry.containmentUntil === void 0 || !isExpiredDeadline(entry.containmentUntil, now)) && entry.readModelReady !== false;
}
function isUsableTender(tender) {
  if (!tender || typeof tender !== "object" || Array.isArray(tender)) return false;
  const stringArray = (values) => Array.isArray(values) && values.every((value) => typeof value === "string");
  const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  return [
    tender.id,
    tender.title,
    tender.source,
    tender.sourceNoticeId,
    tender.officialUrl,
    tender.status,
    tender.participationMode
  ].every((value) => typeof value === "string" && value.trim()) && [
    tender.countryCode,
    tender.region,
    tender.buyer,
    tender.description,
    tender.noticeType,
    tender.publishedAt,
    tender.updatedAt,
    tender.deadline
  ].every((value) => value === void 0 || typeof value === "string") && [tender.categoryCodes, tender.sectors, tender.eligibilityRequirements, tender.submissionUrls].every(stringArray) && (tender.money === void 0 || object(tender.money) && (tender.money.amount === void 0 || Number.isFinite(tender.money.amount)) && (tender.money.currency === void 0 || typeof tender.money.currency === "string")) && (tender.automationFit === void 0 || object(tender.automationFit) && typeof tender.automationFit.level === "string" && Number.isFinite(tender.automationFit.score) && typeof tender.automationFit.classificationVersion === "string" && stringArray(tender.automationFit.matchReasons) && stringArray(tender.automationFit.evidence));
}
function composeContractsFinderHealth(entry, meta, snapshot, readFailed, now) {
  const evidence = { status: entry.status, records: entry.records, usable: false };
  const source = Array.isArray(snapshot?.sourceStatuses) ? snapshot.sourceStatuses.find((status) => status?.source === "contracts-finder") : null;
  const error = meta?.error ?? source?.error;
  const lastAttemptAt = meta?.lastAttemptAt ?? source?.fetchedAt;
  const lastSuccessAt = meta?.lastSuccessfulAt ?? source?.lastSuccessfulAt;
  entry = { ...entry };
  if (typeof meta?.sourceState === "string") entry.sourceState = meta.sourceState;
  if (typeof error === "string") entry.error = error.slice(0, 200);
  if (typeof lastAttemptAt === "string") entry.lastAttemptAt = lastAttemptAt;
  if (typeof lastSuccessAt === "string") entry.lastSuccessAt = lastSuccessAt;
  if (typeof meta?.firstFailureAt === "string") entry.firstFailureAt = meta.firstFailureAt;
  if (Number.isSafeInteger(meta?.consecutiveFailures) && meta.consecutiveFailures >= 0) {
    entry.consecutiveSourceFailures = meta.consecutiveFailures;
  }
  if (readFailed) return { entry: { ...entry, status: "REDIS_PARTIAL" }, evidence };
  if (snapshot === null) return { entry: { ...entry, status: "EMPTY", records: 0 }, evidence };
  if (meta?.sourceState === "ok") return { entry, evidence };
  if (["OK", "NOT_CONFIGURED"].includes(entry.status)) entry.status = "SEED_ERROR";
  if (snapshot.dataAvailable !== true || !Array.isArray(snapshot.tenders) || !Array.isArray(snapshot.sourceStatuses)) {
    return { entry: { ...entry, status: "EMPTY_DATA", records: 0 }, evidence };
  }
  const sourceRows = snapshot.tenders.filter((tender) => tender?.source === "contracts-finder");
  const records = sourceRows.filter((tender) => {
    if (typeof tender.id !== "string" || !tender.id.trim() || typeof tender.title !== "string" || !tender.title.trim() || ![tender.categoryCodes, tender.sectors].every((values) => Array.isArray(values) && values.every((value) => typeof value === "string")) || !["active", "open"].includes(tender.status) || !(Date.parse(tender.deadline) > now)) return false;
    try {
      const url = new URL(tender.officialUrl);
      return url.protocol === "https:" && !url.username && !url.password && (url.hostname === "contractsfinder.service.gov.uk" || url.hostname.endsWith(".contractsfinder.service.gov.uk"));
    } catch {
      return false;
    }
  });
  entry.records = records.length;
  const success = Date.parse(meta?.lastSuccessfulAt || "");
  const first = Date.parse(meta?.firstFailureAt || "");
  const attempt = Date.parse(meta?.lastAttemptAt || "");
  const validEpisode = success > 0 && success <= first && first <= attempt && attempt <= now && meta.fetchedAt === success && meta.consecutiveFailures === 1;
  const aggregateFresh = Number.isFinite(snapshot.fetchedAt) && snapshot.fetchedAt > 0 && snapshot.fetchedAt <= now && now < snapshot.fetchedAt + 180 * 6e4;
  const confirmedEmpty = source?.confirmedEmpty === true && meta?.confirmedEmpty === true && sourceRows.length === 0 && source.recordCount === 0 && meta.recordCount === 0 && snapshot.sourceStatuses.filter((status) => status?.source === "contracts-finder").length === 1 && snapshot.sourceStatuses.every((status) => status && typeof status.source === "string" && typeof status.state === "string") && ["available", "partial", "empty"].includes(snapshot.availability) && aggregateFresh && snapshot.tenders.every(isUsableTender);
  const aligned = (confirmedEmpty ? source.state === "error" && meta.sourceState === "error" : source?.state === "stale" && meta?.sourceState === "stale") && source.lastSuccessfulAt === meta.lastSuccessfulAt && source.fetchedAt === meta.lastAttemptAt && source.firstFailureAt === meta.firstFailureAt && source.consecutiveFailures === meta.consecutiveFailures && source.recordCount === records.length && meta.recordCount === records.length && sourceRows.length === records.length && new Set(records.map((tender) => tender.id)).size === records.length;
  const deadline = validEpisode && (records.length > 0 || confirmedEmpty) ? Math.min(
    first + 90 * 6e4,
    success + SEED_META.globalTendersContractsFinder.maxStaleMin * 6e4,
    ...confirmedEmpty ? [snapshot.fetchedAt + 180 * 6e4] : [],
    ...records.map((tender) => Date.parse(tender.deadline))
  ) : NaN;
  if (entry.status === "SEED_ERROR" && aligned && now < deadline) {
    entry.containmentUntil = new Date(deadline).toISOString();
    evidence.usable = true;
    if (confirmedEmpty) evidence.confirmedEmpty = true;
  }
  evidence.status = entry.status;
  evidence.records = entry.records;
  return { entry, evidence };
}
var STATUS_SEVERITY_RANK = { ok: 0, warn: 1, crit: 2 };
function statusSeverityRank(status) {
  return STATUS_SEVERITY_RANK[STATUS_COUNTS[status] ?? "warn"];
}
function isValidChinaCoverageSummary(candidate) {
  if (!candidate || typeof candidate !== "object" || candidate.schemaVersion !== 1 || candidate.countryCode !== "CN" || !["healthy", "degraded", "unavailable"].includes(candidate.status) || typeof candidate.evaluatedAt !== "string" || !Number.isFinite(Date.parse(candidate.evaluatedAt)) || !Array.isArray(candidate.entries) || candidate.entries.length === 0 || candidate.entries.length > 100 || !candidate.counts || typeof candidate.counts !== "object") {
    return false;
  }
  const ids = /* @__PURE__ */ new Set();
  const actual = {
    total: candidate.entries.length,
    launched: 0,
    planned: 0,
    blocked: 0,
    healthy: 0,
    degraded: 0,
    unavailable: 0
  };
  for (const entry of candidate.entries) {
    if (!entry || typeof entry !== "object" || typeof entry.id !== "string" || entry.id.length === 0 || entry.id.length > 100 || ids.has(entry.id) || !["launched", "planned", "blocked"].includes(entry.launchStatus) || !Array.isArray(entry.reasonCodes) || entry.reasonCodes.length > 16 || entry.reasonCodes.some((reason) => typeof reason !== "string" || reason.length > 64)) {
      return false;
    }
    ids.add(entry.id);
    actual[entry.launchStatus]++;
    if (entry.launchStatus === "launched") {
      if (!["healthy", "degraded", "unavailable"].includes(entry.status)) return false;
      actual[entry.status]++;
    } else if (entry.status !== entry.launchStatus) {
      return false;
    }
  }
  if (actual.launched === 0) return false;
  for (const [name, value] of Object.entries(actual)) {
    if (candidate.counts[name] !== value) return false;
  }
  const expectedStatus = actual.unavailable === actual.launched ? "unavailable" : actual.degraded > 0 || actual.unavailable > 0 ? "degraded" : "healthy";
  return candidate.status === expectedStatus;
}
function projectChinaCoverageStatus(raw, readError = false, now = Date.now()) {
  if (readError) {
    return { status: "REDIS_PARTIAL", chinaStatus: null, reason: "SUMMARY_READ_FAILED" };
  }
  const candidate = typeof raw === "string" ? unwrapEnvelope(parseRedisValue(raw)).data : unwrapEnvelope(raw).data;
  if (!isValidChinaCoverageSummary(candidate)) {
    return { status: "CHINA_UNAVAILABLE", chinaStatus: "unavailable", reason: "SUMMARY_INVALID" };
  }
  const status = {
    healthy: "OK",
    degraded: "CHINA_DEGRADED",
    unavailable: "CHINA_UNAVAILABLE"
  }[candidate.status] ?? "CHINA_UNAVAILABLE";
  const evaluatedAt = Date.parse(candidate.evaluatedAt ?? "");
  const validLastHealthy = status === "CHINA_DEGRADED" && Number.isSafeInteger(candidate.lastHealthyAt) && candidate.lastHealthyAt > 0 && candidate.lastHealthyAt <= evaluatedAt && evaluatedAt <= now;
  const pendingUntil = validLastHealthy ? candidate.lastHealthyAt + CHINA_DECISION_SIGNALS_PENDING_MS : null;
  const problems = Array.isArray(candidate.entries) ? candidate.entries.filter((entry) => entry?.launchStatus === "launched" && entry?.status !== "healthy").map((entry) => ({ id: entry.id, status: entry.status, reasonCodes: entry.reasonCodes ?? [] })) : [];
  const transientCoverageOnly = problems.length > 0 && problems.every((problem) => problem.status === "degraded" && problem.reasonCodes.length > 0 && problem.reasonCodes.every((reason) => CHINA_TRANSIENT_COVERAGE_REASONS.has(reason)));
  return {
    status,
    chinaStatus: candidate.status,
    evaluatedAt: candidate.evaluatedAt ?? null,
    counts: candidate.counts ?? null,
    // Published even while debounced: a held verdict must stay visible, or the
    // debounce becomes indistinguishable from health.
    ...Number.isInteger(candidate.degradedStreak) ? { degradedStreak: candidate.degradedStreak } : {},
    ...typeof candidate.degradedProblemKey === "string" ? { degradedProblemKey: candidate.degradedProblemKey } : {},
    ...Number.isSafeInteger(candidate.lastHealthyAt) ? { lastHealthyAt: candidate.lastHealthyAt } : {},
    ...transientCoverageOnly && pendingUntil !== null && now < pendingUntil ? { chinaCoveragePendingUntil: new Date(pendingUntil).toISOString() } : {},
    ...problems.length > 0 ? { problems } : {}
  };
}
function composeChinaCoverageStatus(entry, raw, readError = false, now = Date.now()) {
  if (!entry || !["OK", "STALE_SEED", "SEED_ERROR"].includes(entry.status)) return entry;
  const seedStatus = entry.status;
  const projected = projectChinaCoverageStatus(raw, readError, now);
  if (seedStatus === "OK") return { ...entry, ...projected };
  if (projected.status === "OK") {
    return { ...entry, ...projected, status: seedStatus, seedStatus };
  }
  return { ...entry, ...projected, seedStatus };
}
function composeChinaDecisionSignalsStatus(entry, _chinaCoverageEntry, now) {
  if (entry?.status !== "COVERAGE_PARTIAL") return entry;
  const decisionProblems = Array.isArray(entry.decisionGroups?.unavailableGroups) ? entry.decisionGroups.unavailableGroups : [];
  const lastSuccessAt = entry.decisionGroups?.coverageLastSuccessAt;
  const requiredDecisionGroups = SEED_META.chinaDecisionSignals.minRecordCount;
  const validCoverageShortfall = decisionProblems.length > 0 && !entry.decisionGroups?.coverageFailureInvalidReason && !entry.decisionGroups?.staleGroups?.length && entry.minRecordCount === requiredDecisionGroups && entry.records === entry.decisionGroups?.operationallyCovered && entry.records > 0 && entry.records < requiredDecisionGroups;
  if (validCoverageShortfall) {
    const pendingUntil = lastSuccessAt + CHINA_DECISION_SIGNALS_PENDING_MS;
    if (Number.isSafeInteger(lastSuccessAt) && now < pendingUntil) {
      return {
        ...entry,
        chinaCoveragePendingUntil: new Date(pendingUntil).toISOString()
      };
    }
  }
  return entry;
}
var AIS_MEASURABLE_TRANSIT_IDS = Object.freeze(["dover_strait", "gibraltar", "cape_of_good_hope"]);
function composeChokepointTransitsCoverage(entry, rawMeta) {
  if (!entry || entry.status !== "OK") return entry;
  const missing = unwrapEnvelope(parseRedisValue(rawMeta)).data?.transitCoverage?.missing;
  const missingMeasurable = Array.isArray(missing) ? AIS_MEASURABLE_TRANSIT_IDS.filter((id) => missing.includes(id)) : [...AIS_MEASURABLE_TRANSIT_IDS];
  if (missingMeasurable.length === 0) return entry;
  return { ...entry, status: "COVERAGE_PARTIAL", missingMeasurable };
}
function composeRiskScoresInputHealth(entry, rawMeta, checks, now, containmentEvidenceByName) {
  if (!entry) return entry;
  const meta = unwrapEnvelope(parseRedisValue(rawMeta)).data;
  const sourceStatuses = {};
  for (const [id, cfg] of Object.entries(CII_INPUT_POLICY.inputs)) {
    if (cfg.sourceCheck && checks?.[cfg.sourceCheck]) sourceStatuses[id] = checks[cfg.sourceCheck].status;
  }
  const ciiInputs = assessCiiInputs(meta, now, sourceStatuses);
  const unfed = !ciiInputs.valid || ciiInputs.unfedFamilies.length > 0;
  if (!unfed && ciiInputs.dead.length === 0) return { ...entry, ciiInputs };
  containmentEvidenceByName?.delete("riskScores");
  if (entry.status !== "OK" && entry.status !== "COVERAGE_PARTIAL") return { ...entry, ciiInputs };
  return { ...entry, status: unfed ? "COVERAGE_DEGRADED" : "COVERAGE_PARTIAL", ciiInputs };
}
function composeScorecardReadModelStatus(entry, raw, readError = false) {
  if (!entry) return entry;
  if (readError) {
    return { ...entry, status: "REDIS_PARTIAL", readModelReady: false };
  }
  const readModelReady = Number(raw) === 1;
  if (readModelReady) return { ...entry, readModelReady: true };
  if (STATUS_COUNTS[entry.status] === "crit" || entry.status === "SEED_ERROR") {
    return { ...entry, readModelReady: false };
  }
  return {
    ...entry,
    status: "COVERAGE_PARTIAL",
    seedStatus: entry.status,
    readModelReady: false
  };
}
function parseHealthVerdictSnapshot(raw, now, { requireChecks = true, maxAgeMs = HEALTH_VERDICT_SNAPSHOT_TTL_MS } = {}) {
  if (typeof raw !== "string") return null;
  const snapshot = parseRedisValue(raw);
  if (!snapshot || typeof snapshot !== "object") return null;
  if (typeof snapshot.status !== "string" || typeof snapshot.checkedAt !== "string") return null;
  if (!snapshot.summary || typeof snapshot.summary !== "object") return null;
  if (requireChecks && (!snapshot.checks || typeof snapshot.checks !== "object")) return null;
  const checkedAtMs = Date.parse(snapshot.checkedAt);
  const ageMs = now - checkedAtMs;
  if (!Number.isFinite(checkedAtMs) || ageMs < 0 || ageMs > maxAgeMs) return null;
  return snapshot;
}
async function releaseHealthVerdictRefreshLock(lockToken) {
  if (!lockToken) return;
  await redisPipeline([[
    "EVAL",
    HEALTH_VERDICT_RELEASE_LOCK_SCRIPT,
    "1",
    HEALTH_VERDICT_REFRESH_LOCK_KEY,
    lockToken
  ]], 4e3, true).catch(() => null);
}
function isProblemStatus(status) {
  return STATUS_COUNTS[status] !== "ok";
}
function isPendingHealthEntry(entry, now) {
  return isProblemStatus(entry?.status) && healthStatusBucket(entry, now) === "ok";
}
function isExpiredDeadline(raw, now) {
  const until = Date.parse(typeof raw === "string" ? raw : "");
  return !Number.isFinite(until) || now >= until;
}
var ENTRY_SOFTENING_DEADLINES = [
  { field: "rolloutPendingUntil", kind: "rollout", status: "ROLLOUT_PENDING" },
  { field: "contentFreshnessPendingUntil", kind: "content", status: null },
  { field: "staleContentGraceUntil", kind: "content", status: null },
  { field: "sourceFailurePendingUntil", kind: "source", status: "SEED_ERROR" },
  { field: "workerControlPendingUntil", kind: "source", status: "SEED_ERROR" },
  { field: "chinaCoveragePendingUntil", kind: "source", status: null },
  { field: "containmentUntil", kind: "source", status: null },
  { field: "transportGraceUntil", kind: "source", status: "RELAY_GATE_UNREACHABLE" }
];
function entryDeadlineRaw(entry, { field, status }) {
  if (status !== null) return entry?.status === status ? entry[field] : void 0;
  return Object.prototype.hasOwnProperty.call(entry ?? {}, field) ? entry[field] : void 0;
}
function snapshotCheckEntries(snapshot) {
  return [snapshot?.checks ?? snapshot?.problems, snapshot?.pending].filter((entries) => entries && typeof entries === "object").flatMap((entries) => Object.values(entries));
}
function hasExpiredActivationGrace(snapshot, now, { includeRollout = true, includeContent = true } = {}) {
  const included = { rollout: includeRollout, content: includeContent, source: true };
  for (const entry of snapshotCheckEntries(snapshot)) {
    for (const spec of ENTRY_SOFTENING_DEADLINES) {
      if (!included[spec.kind]) continue;
      const raw = entryDeadlineRaw(entry, spec);
      if (raw !== void 0 && isExpiredDeadline(raw, now)) return true;
    }
  }
  if (includeContent) {
    const summaryDeadlines = snapshot?.summary?.contentFreshnessPendingUntil;
    if (summaryDeadlines && typeof summaryDeadlines === "object") {
      for (const deadline of Object.values(summaryDeadlines)) {
        if (isExpiredDeadline(deadline, now)) return true;
      }
    }
  }
  return false;
}
function nearestActivationDeadlineMs(snapshot, now) {
  let nearest = Infinity;
  const consider = (raw) => {
    const parsed = Date.parse(typeof raw === "string" ? raw : "");
    const deadline = Number.isFinite(parsed) ? parsed : now;
    if (deadline < nearest) nearest = deadline;
  };
  for (const entry of snapshotCheckEntries(snapshot)) {
    for (const spec of ENTRY_SOFTENING_DEADLINES) {
      const raw = entryDeadlineRaw(entry, spec);
      if (raw !== void 0) consider(raw);
    }
  }
  const summaryDeadlines = snapshot?.summary?.contentFreshnessPendingUntil;
  if (summaryDeadlines && typeof summaryDeadlines === "object") {
    for (const deadline of Object.values(summaryDeadlines)) consider(deadline);
  }
  return nearest;
}
function snapshotTtlSeconds(snapshot, now) {
  const nearest = nearestActivationDeadlineMs(snapshot, now);
  if (nearest === Infinity) return HEALTH_VERDICT_SNAPSHOT_TTL_SECONDS;
  const secondsUntilDeadline = Math.floor((nearest - now) / 1e3);
  return Math.min(HEALTH_VERDICT_SNAPSHOT_TTL_SECONDS, Math.max(1, secondsUntilDeadline));
}
var RELAY_GATEWAY_GATE_CHECK_NAME = "relayGatewayGate";
var RELAY_GATEWAY_GATE_ROUTE = "/relay/create-checkout";
var RELAY_GATEWAY_GATE_TIMEOUT_MS = 4e3;
var RELAY_GATEWAY_GATE_USER_AGENT = "worldmonitor-health-relay-gate/1.0";
function resolveRelayGatewaySiteUrl() {
  return process.env.CONVEX_SITE_URL ?? (process.env.CONVEX_URL ?? "").replace(".convex.cloud", ".convex.site");
}
function relayGatewayGateMissingEnv() {
  const missing = [];
  if (!resolveRelayGatewaySiteUrl()) missing.push("CONVEX_SITE_URL");
  if (!process.env.CONVEX_TENANT_RELAY_SECRET) missing.push("CONVEX_TENANT_RELAY_SECRET");
  return missing;
}
var RELAY_GATEWAY_GATE_PROBE_KEY = healthVerdictRedisKey(
  "health:relay-gate:v1",
  process.env.VERCEL_ENV,
  process.env.VERCEL_GIT_COMMIT_SHA
);
var RELAY_GATEWAY_GATE_PROBE_TTL_SECONDS = HEALTH_VERDICT_SNAPSHOT_TTL_SECONDS;
var RELAY_GATEWAY_GATE_TRANSPORT_GRACE_MS = 3 * 60 * 1e3;
var HEALTH_POLL_INTERVAL_MS = 15 * 60 * 1e3;
var RELAY_GATEWAY_GATE_PROBE_RETENTION_SECONDS = RELAY_GATEWAY_GATE_PROBE_TTL_SECONDS + (RELAY_GATEWAY_GATE_TRANSPORT_GRACE_MS + HEALTH_POLL_INTERVAL_MS + 6e4) / 1e3;
function parsePreviousRelayGatewayGate(raw) {
  if (typeof raw !== "string" || raw.length === 0) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && typeof parsed.status === "string" ? parsed : null;
  } catch {
    return null;
  }
}
function withTransportGrace(fresh, previous, now) {
  if (fresh.status !== "RELAY_GATE_UNREACHABLE") return fresh;
  const carried = previous?.status === "RELAY_GATE_UNREACHABLE" ? [previous.transportGraceUntil, previous.transportGraceExpiredAt].find((raw) => typeof raw === "string" && Number.isFinite(Date.parse(raw))) ?? null : null;
  const deadline = carried ?? new Date(now + RELAY_GATEWAY_GATE_TRANSPORT_GRACE_MS).toISOString();
  return isExpiredDeadline(deadline, now) ? { ...fresh, transportGraceExpiredAt: deadline } : { ...fresh, transportGraceUntil: deadline };
}
function parseCachedRelayGatewayGate(raw, now) {
  if (typeof raw !== "string" || raw.length === 0) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || typeof parsed.status !== "string") return null;
  if (parsed.probed === false) return null;
  const evaluatedAt = Date.parse(parsed.evaluatedAt ?? "");
  if (!Number.isFinite(evaluatedAt) || evaluatedAt > now) return null;
  if (now - evaluatedAt >= RELAY_GATEWAY_GATE_PROBE_TTL_SECONDS * 1e3) return null;
  return parsed;
}
var RELAY_GATEWAY_GATE_OWNER_PUBLISH_SCRIPT = [
  "if redis.call('get', KEYS[1]) == ARGV[1] then",
  "  return redis.call('set', KEYS[2], ARGV[2], 'EX', ARGV[3])",
  "end",
  "return 0"
].join("\n");
var RELAY_GATEWAY_GATE_FALLBACK_PUBLISH_SCRIPT = [
  "local current = redis.call('get', KEYS[1])",
  "if current == false then current = '' end",
  "if current == ARGV[1] then",
  "  return redis.call('set', KEYS[1], ARGV[2], 'EX', ARGV[3])",
  "end",
  "return 0"
].join("\n");
var RELAY_GATEWAY_GATE_LEASE_KEY = `${RELAY_GATEWAY_GATE_PROBE_KEY}:lease`;
var RELAY_GATEWAY_GATE_LEASE_TTL_SECONDS = 10;
var RELAY_GATEWAY_GATE_FOLLOWER_POLL_MS = 250;
var RELAY_GATEWAY_GATE_REDIS_TIMEOUT_MS = 2e3;
var RELAY_GATEWAY_GATE_FOLLOWER_WAIT_MS = RELAY_GATEWAY_GATE_TIMEOUT_MS + RELAY_GATEWAY_GATE_REDIS_TIMEOUT_MS + 1e3;
async function readOrProbeRelayGatewayGate({
  now,
  // Cache validation reads the live clock, not the sweep's fixed `now`: a
  // follower polls for a verdict the lease owner publishes AFTER this sweep
  // began, and that verdict's `evaluatedAt` is later than `now`. Validating
  // against `now` would reject it as future-dated and persist a false
  // RELAY_GATE_UNREACHABLE in both snapshots. `now` still stamps any verdict
  // this sweep creates itself.
  clock = Date.now,
  key,
  leaseKey,
  ctx,
  fetchImpl,
  followerWaitMs = RELAY_GATEWAY_GATE_FOLLOWER_WAIT_MS,
  followerPollMs = RELAY_GATEWAY_GATE_FOLLOWER_POLL_MS,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  // The caller's per-request budget (createHealthRequestBudget). Every Redis
  // call and the probe time out at min(own timeout, remaining budget); when
  // it runs out this throws HealthBudgetExhaustedError rather than publish an
  // observation the deadline, not the gate, produced.
  budget = null
} = {}) {
  if (!probeRelayGatewayGateApplies()) return null;
  const timeoutMs = (ms) => budget ? budget.clamp(ms) : ms;
  const checkBudget = () => {
    if (budget?.exhausted()) throw new HealthBudgetExhaustedError();
  };
  let lastRaw = null;
  const readCached = async () => {
    checkBudget();
    const cached = await redisPipeline([["GET", key]], timeoutMs(RELAY_GATEWAY_GATE_REDIS_TIMEOUT_MS), true).catch(() => null);
    lastRaw = cached?.[0]?.result ?? null;
    return parseCachedRelayGatewayGate(lastRaw, clock());
  };
  const reused = await readCached();
  if (reused) return reused;
  const previous = parsePreviousRelayGatewayGate(lastRaw);
  const leaseToken = `${now}:${crypto.randomUUID()}`;
  checkBudget();
  const lease = await redisPipeline(
    [["SET", leaseKey, leaseToken, "EX", String(RELAY_GATEWAY_GATE_LEASE_TTL_SECONDS), "NX"]],
    timeoutMs(RELAY_GATEWAY_GATE_REDIS_TIMEOUT_MS),
    true
  ).catch(() => null);
  const ownsLease = lease?.[0]?.result === "OK";
  const follow = async (own = null) => {
    const deadline = Math.min(Date.now() + followerWaitMs, budget ? budget.workDeadline : Infinity);
    while (Date.now() < deadline) {
      await sleep(followerPollMs);
      const published2 = await readCached();
      if (published2) return published2;
    }
    checkBudget();
    if (own) return own;
    if (!probeRelayGatewayGateApplies()) return null;
    const fallback = withTransportGrace({
      role: "gateway",
      route: RELAY_GATEWAY_GATE_ROUTE,
      evaluatedAt: new Date(now).toISOString(),
      status: "RELAY_GATE_UNREACHABLE",
      error: "another sweep holds the probe lease and published no verdict within the probe budget",
      hint: "This sweep did not probe the gate itself (single-flight). Persistent across sweeps = the probing sweep keeps timing out against Convex."
    }, parsePreviousRelayGatewayGate(lastRaw), now);
    const published = await redisPipeline([[
      "EVAL",
      RELAY_GATEWAY_GATE_FALLBACK_PUBLISH_SCRIPT,
      "1",
      key,
      typeof lastRaw === "string" ? lastRaw : "",
      JSON.stringify({ ...fallback, probed: false }),
      String(RELAY_GATEWAY_GATE_PROBE_RETENTION_SECONDS)
    ]], timeoutMs(RELAY_GATEWAY_GATE_REDIS_TIMEOUT_MS), true).catch(() => null);
    if (published?.[0]?.result !== "OK") {
      const winner = await readCached();
      if (winner) return winner;
    }
    return fallback;
  };
  if (!ownsLease) return follow();
  try {
    checkBudget();
    const probed = await probeRelayGatewayGate({ now, fetchImpl, timeoutMs: timeoutMs(RELAY_GATEWAY_GATE_TIMEOUT_MS) });
    checkBudget();
    if (!probed) return null;
    const fresh = withTransportGrace(probed, previous, now);
    const published = await redisPipeline([[
      "EVAL",
      RELAY_GATEWAY_GATE_OWNER_PUBLISH_SCRIPT,
      "2",
      leaseKey,
      key,
      leaseToken,
      JSON.stringify(fresh),
      String(RELAY_GATEWAY_GATE_PROBE_RETENTION_SECONDS)
    ]], timeoutMs(RELAY_GATEWAY_GATE_REDIS_TIMEOUT_MS), true).catch(() => null);
    const result = published?.[0]?.result;
    if (result === "OK") return fresh;
    return follow(result === 0 ? null : fresh);
  } finally {
    const release = redisPipeline([[
      "EVAL",
      HEALTH_VERDICT_RELEASE_LOCK_SCRIPT,
      "1",
      leaseKey,
      leaseToken
    ]], RELAY_GATEWAY_GATE_REDIS_TIMEOUT_MS, true).catch(() => {
    });
    if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(release);
    else await release;
  }
}
function probeRelayGatewayGateApplies() {
  const configured = relayGatewayGateMissingEnv().length === 0;
  const isProductionBuild = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
  return configured || isProductionBuild;
}
async function probeRelayGatewayGate({
  now = Date.now(),
  fetchImpl = (...args) => globalThis.fetch(...args),
  timeoutMs = RELAY_GATEWAY_GATE_TIMEOUT_MS
} = {}) {
  const missing = relayGatewayGateMissingEnv();
  const base = {
    role: "gateway",
    route: RELAY_GATEWAY_GATE_ROUTE,
    evaluatedAt: new Date(now).toISOString()
  };
  if (missing.length > 0) {
    const isProductionBuild = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
    if (!isProductionBuild) return null;
    return {
      ...base,
      status: "RELAY_GATE_MISCONFIGURED",
      missing,
      hint: `This production build cannot see ${missing.map((name) => name === "CONVEX_SITE_URL" ? "CONVEX_SITE_URL (or CONVEX_URL)" : name).join(", ")}; the gateways answer 503 before reaching Convex. Set the value, then redeploy production; scripts/vercel-ignore.sh builds a same-commit redeploy on main (#8216).`
    };
  }
  let target;
  try {
    const configured = resolveRelayGatewaySiteUrl();
    const site = new URL(configured);
    if (site.protocol !== "https:") throw new Error(`protocol ${site.protocol}`);
    target = `${configured}${RELAY_GATEWAY_GATE_ROUTE}`;
  } catch (error) {
    const isProductionBuild = process.env.VERCEL === "1" && process.env.VERCEL_ENV === "production";
    if (!isProductionBuild) return null;
    return {
      ...base,
      status: "RELAY_GATE_MISCONFIGURED",
      invalid: ["CONVEX_SITE_URL"],
      error: String(error?.message ?? error),
      hint: "CONVEX_SITE_URL must be an https: origin; the gateway credential is never sent over plaintext, so no probe was made."
    };
  }
  const startedAt = Date.now();
  let response;
  try {
    response = await fetchImpl(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.CONVEX_TENANT_RELAY_SECRET}`,
        "User-Agent": RELAY_GATEWAY_GATE_USER_AGENT
      },
      body: "{}",
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch (error) {
    return {
      ...base,
      status: "RELAY_GATE_UNREACHABLE",
      latencyMs: Date.now() - startedAt,
      error: String(error?.message ?? error),
      hint: "The Convex relay did not answer the gate probe; a credential verdict needs a reachable gate. Persistent over several sweeps = Convex outage or a wrong CONVEX_SITE_URL."
    };
  }
  const latencyMs = Date.now() - startedAt;
  let body = null;
  try {
    body = await response.json();
  } catch {
  }
  if (response.status === 401) {
    return {
      ...base,
      status: "RELAY_GATE_REJECTED",
      httpStatus: 401,
      latencyMs,
      hint: "The deployed Convex gate does not admit this build's CONVEX_TENANT_RELAY_SECRET. Either side can be stale: a value written after the last `convex deploy` reads as undefined inside deployed functions until the next push (#8217). Redeploy Convex, then confirm this check returns OK."
    };
  }
  if (response.status === 400 && body?.error === "MISSING_FIELDS") {
    return { ...base, status: "OK", httpStatus: 400, latencyMs };
  }
  return {
    ...base,
    status: "RELAY_GATE_UNREACHABLE",
    httpStatus: response.status,
    latencyMs,
    error: typeof body?.error === "string" ? body.error : `unexpected HTTP ${response.status}`,
    hint: "The gate answered something other than 401 or 400 MISSING_FIELDS, so this sweep cannot classify the credential. Persistent over several sweeps = relay contract drift or a Convex fault."
  };
}
function computeOverallStatus(counts, totalChecks) {
  const realWarnCount = counts.warn - counts.onDemandWarn;
  const containedWarnCount = Number.isInteger(counts.containedWarn) && counts.containedWarn >= 0 && counts.containedWarn <= realWarnCount ? counts.containedWarn : 0;
  const availabilityWarnCount = realWarnCount - containedWarnCount;
  const critCount = counts.crit;
  if (critCount > 0) {
    const overall2 = critCount / totalChecks <= 0.03 ? "DEGRADED" : "UNHEALTHY";
    return {
      overall: overall2,
      diagnosticOverall: overall2,
      realWarnCount,
      critCount
    };
  }
  const diagnosticOverall = realWarnCount > 0 ? "WARNING" : "HEALTHY";
  const overall = availabilityWarnCount === 0 && containedWarnCount / totalChecks <= 0.03 ? "HEALTHY" : "WARNING";
  return {
    overall,
    diagnosticOverall,
    realWarnCount,
    critCount
  };
}
function collectFailureLogProblems(checks, now = Date.now()) {
  const entries = Object.entries(checks).filter(([, c]) => isProblemStatus(c.status) && healthStatusBucket(c, now) !== "ok" && c.status !== "EMPTY_ON_DEMAND");
  return {
    problemKeys: entries.map(([k, c]) => `${k}:${c.status}${c.seedAgeMin != null ? `(${c.seedAgeMin}min)` : ""}`),
    // The dedupe signature uses only key:status (no age) so a long STALE_SEED
    // window doesn't produce a new log entry on every poll.
    sigKeys: entries.map(([k, c]) => `${k}:${c.status}`).sort()
  };
}
function buildFailureLogPersistencePlan({
  verdict,
  diagnostics,
  containedWarnCount,
  previousSignature,
  now
}) {
  const {
    overall: availabilityOverall,
    diagnosticOverall,
    critCount,
    realWarnCount: warnCount
  } = verdict;
  const { problemKeys, sigKeys } = diagnostics;
  if (problemKeys.length === 0) {
    return {
      action: "clear",
      commands: [["DEL", "health:failure-log-sig"]]
    };
  }
  const entry = {
    at: new Date(now).toISOString(),
    status: diagnosticOverall,
    ...diagnosticOverall !== availabilityOverall ? { availabilityStatus: availabilityOverall, containedWarnCount } : {},
    critCount,
    warnCount,
    problems: problemKeys
  };
  const signature = `${diagnosticOverall}|${sigKeys.join(",")}`;
  const appendIncident = signature !== previousSignature;
  const commands = [
    ["SET", "health:last-failure", JSON.stringify(entry), "EX", 86400]
  ];
  if (appendIncident) {
    commands.push(
      ["LPUSH", "health:failure-log", JSON.stringify(entry)],
      ["LTRIM", "health:failure-log", 0, 49]
    );
  }
  commands.push(
    ["EXPIRE", "health:failure-log", 86400 * 7],
    ["SET", "health:failure-log-sig", signature, "EX", 86400]
  );
  return {
    action: "persist",
    appendIncident,
    entry,
    signature,
    commands
  };
}
var HEALTH_INCIDENT_ALERTS_KEY = "health:incident-alerts";
var HEALTH_INCIDENT_ALERTS_TTL_SECONDS = 86400 * 7;
function parseAlertedIncidents(raw) {
  if (raw === null || raw === void 0) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((key) => typeof key === "string") ? parsed : null;
  } catch {
    return null;
  }
}
function pendingIncidentKeys(alertedRaw, sigKeys) {
  const alerted = new Set(parseAlertedIncidents(alertedRaw) ?? []);
  return sigKeys.filter((key) => !alerted.has(key));
}
function nextAlertedIncidents(alertedRaw, sigKeys, delivered) {
  const active = new Set(sigKeys);
  const kept = (parseAlertedIncidents(alertedRaw) ?? []).filter((key) => active.has(key));
  return [.../* @__PURE__ */ new Set([...kept, ...delivered])].sort();
}
async function reportSourceIncident(key, checks, ctx, capture = captureSilentError) {
  const separator = key.lastIndexOf(":");
  const name = key.slice(0, separator);
  const status = key.slice(separator + 1);
  const check = checks[name] ?? {};
  const extra = {};
  for (const field of ["records", "seedAgeMin", "maxStaleMin", "contentAgeMin", "maxContentAgeMin", "errorCode"]) {
    if (check[field] !== void 0) extra[field] = check[field];
  }
  return await capture(new Error(`Health source incident: ${name} ${status}`), {
    level: "warning",
    fingerprint: ["health-source-incident", name, status],
    tags: { health_source: name, health_status: status },
    extra,
    ctx
  }) === true;
}
function dataStatusFromSummary(summary) {
  if (summary?.crit > 0) return "CRITICAL";
  if (summary?.warn > 0) return "DEGRADED";
  return "OK";
}
function healthResponseBody(snapshot, compact) {
  const body = {
    status: snapshot.status,
    dataStatus: dataStatusFromSummary(snapshot.summary),
    summary: snapshot.summary,
    checkedAt: snapshot.checkedAt
  };
  if (!compact) {
    body.checks = snapshot.checks;
    return body;
  }
  const entries = snapshot.checks ? Object.entries(snapshot.checks).filter(
    ([name, check]) => isProblemStatus(check.status) || name === "chinaCoverage" && typeof check.chinaStatus === "string" && check.chinaStatus !== "healthy"
  ) : Object.entries({ ...snapshot.pending ?? {}, ...snapshot.problems ?? {} });
  const evaluatedAt = Date.parse(snapshot.checkedAt);
  const problems = Object.fromEntries(entries.filter(([, check]) => !isPendingHealthEntry(check, evaluatedAt)));
  const pending = Object.fromEntries(entries.filter(([, check]) => isPendingHealthEntry(check, evaluatedAt)));
  for (const collection of [problems, pending]) {
    for (const [name, check] of Object.entries(collection)) {
      if (name === "chinaDecisionSignals") {
        collection[name] = { status: check?.status };
        for (const { field } of ENTRY_SOFTENING_DEADLINES) {
          if (Object.prototype.hasOwnProperty.call(check ?? {}, field)) {
            collection[name][field] = check[field];
          }
        }
        continue;
      }
      if (check?.contentFreshness === void 0 && check?.decisionGroups === void 0 && check?.chinaRow === void 0 && check?.ciiInputs === void 0) continue;
      const {
        contentFreshness: _detail,
        decisionGroups: _groups,
        chinaRow: _chinaRow,
        ciiInputs: _ciiInputs,
        ...publicFields
      } = check;
      collection[name] = publicFields;
    }
  }
  if (Object.keys(problems).length > 0) body.problems = problems;
  if (Object.keys(pending).length > 0) body.pending = pending;
  return body;
}
function buildCompactVerdictSnapshot(snapshot) {
  return healthResponseBody(snapshot, true);
}
function healthResponse(snapshot, compact, headers, { stale = false } = {}) {
  let responseHeaders = headers;
  if (compact) {
    const { "CF-Cache-Status": _bypassMarker, ...base } = headers;
    responseHeaders = {
      ...base,
      "Cache-Control": "no-store, max-age=0",
      "CDN-Cache-Control": "no-store"
    };
  }
  const body = healthResponseBody(snapshot, compact);
  if (stale) Object.assign(body, { stale: true, staleReason: "REFRESH_PENDING" });
  return new Response(JSON.stringify(body, null, compact ? 0 : 2), {
    status: 200,
    headers: responseHeaders
  });
}
function healthRefreshPendingResponse(headers) {
  return jsonResponse({
    status: "REFRESH_PENDING",
    error: "Health refresh is pending. Retry shortly.",
    retryAfterSeconds: 3
  }, 503, { ...headers, "Retry-After": "3" });
}
async function lastKnownOrRefreshPendingResponse(compact, headers, snapshotNow, timeoutMs = HEALTH_VERDICT_LAST_KNOWN_READ_TIMEOUT_MS) {
  if (timeoutMs < HEALTH_VERDICT_MIN_REDIS_TIMEOUT_MS) return healthRefreshPendingResponse(headers);
  const key = compact ? HEALTH_VERDICT_COMPACT_LAST_KNOWN_KEY : HEALTH_VERDICT_LAST_KNOWN_KEY;
  const result = await redisPipeline([["GET", key]], timeoutMs, true).catch(() => null);
  const snapshot = result?.[0]?.error ? null : parseHealthVerdictSnapshot(result?.[0]?.result, snapshotNow(), {
    requireChecks: !compact,
    maxAgeMs: HEALTH_VERDICT_LAST_KNOWN_TTL_SECONDS * 1e3
  });
  if (!snapshot || hasExpiredActivationGrace(snapshot, snapshotNow())) return healthRefreshPendingResponse(headers);
  return healthResponse(snapshot, compact, headers, { stale: true });
}
async function handleHealth(req, ctx, options = {}) {
  const budget = createHealthRequestBudget(Date.now(), options.workBudgetMs);
  const hasInjectedClock = Object.prototype.hasOwnProperty.call(options, "now");
  const now = hasInjectedClock ? options.now : Date.now();
  const snapshotNow = () => hasInjectedClock ? now : Date.now();
  if (isDisallowedOrigin(req)) {
    return new Response("Forbidden", { status: 403 });
  }
  const cors = getCorsHeaders(req, "GET, OPTIONS");
  const headers = {
    "Content-Type": "application/json",
    "Cache-Control": "private, no-store, max-age=0",
    "CDN-Cache-Control": "no-store",
    "CF-Cache-Status": "BYPASS",
    ...cors
  };
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  const url = new URL(req.url);
  const compact = url.searchParams.get("compact") === "1";
  const wantsHistory = url.searchParams.get("history") === "1";
  const deadlineFallback = () => {
    console.warn("[health] request deadline exhausted; serving the last-known verdict");
    return lastKnownOrRefreshPendingResponse(compact, headers, snapshotNow, budget.fallbackTimeout());
  };
  if (!compact || wantsHistory) {
    const keyCheck = await validateApiKey(req, { forceKey: true });
    if (keyCheck.required && !keyCheck.valid) {
      const error = keyCheck.error === USER_API_KEY_GATEWAY_VALIDATION_ERROR ? "Invalid API key" : keyCheck.error;
      return jsonResponse(
        {
          error,
          hint: "Detailed health requires an operator/enterprise API key. Public status: /api/health?compact=1"
        },
        401,
        {
          ...headers,
          "WWW-Authenticate": 'ApiKey realm="worldmonitor-health", header="X-WorldMonitor-Key"'
        }
      );
    }
  }
  if (wantsHistory) {
    const results2 = await redisPipeline(
      [
        ["GET", "health:last-failure"],
        ["LRANGE", "health:failure-log", "0", "-1"]
      ],
      4e3
    );
    const parseJson = (raw) => {
      if (typeof raw !== "string") return null;
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    };
    const lastFailureRaw = results2?.[0]?.result;
    const failureLogRaw = results2?.[1]?.result;
    const body = {
      lastFailure: parseJson(lastFailureRaw),
      failureLog: Array.isArray(failureLogRaw) ? failureLogRaw.map(parseJson).filter((e) => e !== null) : [],
      checkedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    return new Response(JSON.stringify(body, null, 2), { status: 200, headers });
  }
  let refreshLockToken = null;
  let ownsSnapshotRefreshLock = false;
  let refreshLeaseStartedAt = 0;
  try {
    if (!getRedisCredentials()) throw new Error("Redis not configured");
    const snapshotKey = compact ? HEALTH_VERDICT_COMPACT_SNAPSHOT_KEY : HEALTH_VERDICT_SNAPSHOT_KEY;
    const snapshotResult = await redisPipeline([["GET", snapshotKey]], budget.clamp(4e3), true);
    if (!snapshotResult) throw new Error("Redis request failed");
    if (snapshotResult[0]?.error) throw new Error("Redis snapshot read failed");
    const cachedSnapshot = parseHealthVerdictSnapshot(snapshotResult[0]?.result, snapshotNow(), { requireChecks: !compact });
    if (cachedSnapshot && !hasExpiredActivationGrace(cachedSnapshot, snapshotNow())) {
      return healthResponse(cachedSnapshot, compact, headers);
    }
    refreshLockToken = `${now}:${crypto.randomUUID()}`;
    refreshLeaseStartedAt = Date.now();
    if (budget.exhausted()) throw new HealthBudgetExhaustedError();
    let lockResult = await redisPipeline([[
      "SET",
      HEALTH_VERDICT_REFRESH_LOCK_KEY,
      refreshLockToken,
      "EX",
      String(HEALTH_VERDICT_REFRESH_LOCK_TTL_SECONDS),
      "NX"
    ]], budget.clamp(4e3), true);
    if (!lockResult || lockResult.length !== 1 || lockResult[0]?.error || !["OK", null].includes(lockResult[0]?.result)) throw new Error("Redis snapshot lock failed");
    ownsSnapshotRefreshLock = lockResult[0]?.result === "OK";
    if (!ownsSnapshotRefreshLock) {
      const waitDeadline = Date.now() + HEALTH_VERDICT_REFRESH_WAIT_MS;
      for (let attempt = 0; attempt < HEALTH_VERDICT_REFRESH_WAIT_ATTEMPTS && Date.now() < waitDeadline; attempt++) {
        const backoffMs = Math.min(100 * 2 ** attempt, 1e3);
        const jitterMs = Math.floor(Math.random() * 50);
        const sleepMs = Math.min(backoffMs + jitterMs, Math.max(0, waitDeadline - Date.now()));
        await new Promise((resolve) => setTimeout(resolve, sleepMs));
        const remainingMs = waitDeadline - Date.now();
        if (remainingMs < HEALTH_VERDICT_MIN_REDIS_TIMEOUT_MS || budget.exhausted()) break;
        const redisTimeoutMs = budget.clamp(Math.min(4e3, remainingMs));
        const refreshedResult = await redisPipeline([["GET", snapshotKey]], redisTimeoutMs, true);
        if (!refreshedResult || refreshedResult[0]?.error) throw new Error("Redis snapshot wait failed");
        const refreshedSnapshot = parseHealthVerdictSnapshot(refreshedResult[0]?.result, snapshotNow(), { requireChecks: !compact });
        if (refreshedSnapshot && !hasExpiredActivationGrace(refreshedSnapshot, snapshotNow())) {
          return healthResponse(refreshedSnapshot, compact, headers);
        }
        const retryRemainingMs = waitDeadline - Date.now();
        if (retryRemainingMs < HEALTH_VERDICT_MIN_REDIS_TIMEOUT_MS || budget.exhausted()) break;
        refreshLeaseStartedAt = Date.now();
        lockResult = await redisPipeline([[
          "SET",
          HEALTH_VERDICT_REFRESH_LOCK_KEY,
          refreshLockToken,
          "EX",
          String(HEALTH_VERDICT_REFRESH_LOCK_TTL_SECONDS),
          "NX"
        ]], budget.clamp(Math.min(4e3, retryRemainingMs)), true);
        if (!lockResult || lockResult.length !== 1 || lockResult[0]?.error || !["OK", null].includes(lockResult[0]?.result)) throw new Error("Redis snapshot lock retry failed");
        ownsSnapshotRefreshLock = lockResult[0]?.result === "OK";
        if (ownsSnapshotRefreshLock) break;
      }
      if (!ownsSnapshotRefreshLock) {
        return await lastKnownOrRefreshPendingResponse(compact, headers, snapshotNow, budget.fallbackTimeout());
      }
    }
  } catch (err) {
    if (budget.exhausted()) return deadlineFallback();
    if (ownsSnapshotRefreshLock) await releaseHealthVerdictRefreshLock(refreshLockToken);
    console.error("[health] Redis read failed:", err?.message ?? err);
    return jsonResponse({
      status: "REDIS_DOWN",
      error: "Redis unavailable",
      checkedAt: new Date(now).toISOString()
    }, 503, headers);
  }
  if (Date.now() - refreshLeaseStartedAt >= HEALTH_VERDICT_REFRESH_LOCK_TTL_SECONDS * 1e3) {
    await releaseHealthVerdictRefreshLock(refreshLockToken);
    return lastKnownOrRefreshPendingResponse(compact, headers, snapshotNow, budget.fallbackTimeout());
  }
  const allDataKeys = [
    ...Object.values(BOOTSTRAP_KEYS),
    ...Object.values(STANDALONE_KEYS)
  ];
  for (const key of CANADA_ALERTS_CUTOVER_FALLBACK_KEYS) {
    if (!allDataKeys.includes(key)) allDataKeys.push(key);
  }
  if (!allDataKeys.includes(CONTRACTS_FINDER_CANONICAL_KEY)) allDataKeys.push(CONTRACTS_FINDER_CANONICAL_KEY);
  const allMetaKeys = Object.values(SEED_META).map((s) => s.key);
  const activationEntries = Object.entries(ACTIVATION_MARKERS);
  const fredRolloutCommands = fredRatesRolloutCommands(now);
  const sweepKey = (key) => isAppOwnedRedisKey(key) ? applyRedisKeyPrefix(key) : key;
  let results;
  try {
    const commands = [
      ...allDataKeys.map((k) => dataLenCommand(sweepKey(k))),
      ...allMetaKeys.map((k) => ["GET", sweepKey(k)]),
      ...activationEntries.map(([, marker]) => ["EXISTS", sweepKey(marker)]),
      ["GET", sweepKey(CHINA_COVERAGE_SUMMARY_KEY)],
      ["GET", sweepKey(STANDALONE_KEYS.educationAttainment)],
      ["HEXISTS", sweepKey(FIVE_FACTOR_SCORECARD_READ_MODEL_KEY), "metadata"],
      ...fredRolloutCommands
    ];
    if (!getRedisCredentials()) throw new Error("Redis not configured");
    if (budget.exhausted()) return deadlineFallback();
    results = await redisPipeline(fenceHealthMutations(commands, refreshLockToken), budget.clamp(8e3), true);
    if (!results) throw new Error("Redis request failed");
  } catch (err) {
    if (budget.exhausted()) return deadlineFallback();
    if (ownsSnapshotRefreshLock) await releaseHealthVerdictRefreshLock(refreshLockToken);
    console.error("[health] Redis read failed:", err?.message ?? err);
    return jsonResponse({
      status: "REDIS_DOWN",
      error: "Redis unavailable",
      checkedAt: new Date(now).toISOString()
    }, 503, headers);
  }
  const contractsFinderMetaResult = results[allDataKeys.length + allMetaKeys.indexOf(SEED_META.globalTendersContractsFinder.key)];
  const contractsFinderMeta = unwrapEnvelope(parseRedisValue(contractsFinderMetaResult?.result)).data;
  const contractsFinderDataResult = results[allDataKeys.indexOf(CONTRACTS_FINDER_CANONICAL_KEY)];
  const contractsFinderHasData = keyHasData(CONTRACTS_FINDER_CANONICAL_KEY, contractsFinderDataResult?.result ?? 0);
  let contractsFinderSnapshot = contractsFinderHasData ? void 0 : null;
  let contractsFinderReadFailed = Boolean(contractsFinderMetaResult?.error || contractsFinderDataResult?.error);
  if (!contractsFinderReadFailed && contractsFinderHasData && contractsFinderMeta?.sourceState !== "ok") {
    if (budget.exhausted()) return deadlineFallback();
    const payload2 = await redisPipeline([["GET", CONTRACTS_FINDER_CANONICAL_KEY]], budget.clamp(4e3), true).catch(() => null);
    contractsFinderReadFailed = !payload2 || Boolean(payload2[0]?.error);
    if (contractsFinderReadFailed && budget.exhausted()) return deadlineFallback();
    contractsFinderSnapshot = unwrapEnvelope(parseRedisValue(payload2?.[0]?.result)).data;
  }
  const humanitarianMetaResult = results[allDataKeys.length + allMetaKeys.indexOf(SEED_META.humanitarianSummary.key)];
  const humanitarianMeta = unwrapEnvelope(parseRedisValue(humanitarianMetaResult?.result)).data;
  const humanitarianNeedsProof = humanitarianMeta?.sourceState === "degraded" || snapshotNow() - humanitarianMeta?.fetchedAt > SEED_META.humanitarianSummary.maxStaleMin * 6e4;
  let humanitarianRetention = null;
  if (!humanitarianMetaResult?.error && humanitarianNeedsProof) {
    if (budget.exhausted()) return deadlineFallback();
    humanitarianRetention = await readHumanitarianRetention(
      humanitarianMeta,
      SEED_META.humanitarianSummary.minRecordCount,
      snapshotNow(),
      (commands, timeoutMs, raw) => redisPipeline(commands, budget.clamp(timeoutMs), raw)
    );
    if (budget.exhausted()) return deadlineFallback();
  }
  const evaluationNow = snapshotNow();
  const keyStrens = /* @__PURE__ */ new Map();
  const keyErrors = /* @__PURE__ */ new Map();
  for (let i = 0; i < allDataKeys.length; i++) {
    const r = results[i];
    if (r?.error) keyErrors.set(allDataKeys[i], r.error);
    keyStrens.set(allDataKeys[i], r?.result ?? 0);
  }
  const usedCanadaAlertsFallback = applyCanadaAlertsDataPresenceFallback(keyStrens, keyErrors);
  const keyMetaValues = /* @__PURE__ */ new Map();
  const keyMetaErrors = /* @__PURE__ */ new Map();
  for (let i = 0; i < allMetaKeys.length; i++) {
    const r = results[allDataKeys.length + i];
    if (r?.error) keyMetaErrors.set(allMetaKeys[i], r.error);
    keyMetaValues.set(allMetaKeys[i], r?.result ?? null);
  }
  applyCanadaAlertsSeedMetaFallback(keyMetaValues, keyMetaErrors, usedCanadaAlertsFallback);
  const graceEvidenceByName = /* @__PURE__ */ new Map();
  for (const [name, seedCfg] of Object.entries(SEED_META)) {
    const seedMeta = readSeedMeta(seedCfg, keyMetaValues, keyMetaErrors, evaluationNow);
    graceEvidenceByName.set(name, staleContentGraceEvidence(
      seedMeta.contentAge,
      seedMeta.contentFreshness,
      evaluationNow
    ));
  }
  const activationOffset = allDataKeys.length + allMetaKeys.length;
  const activationStates = readExistsFlags(
    results.slice(activationOffset, activationOffset + activationEntries.length),
    activationEntries.map(([name]) => name)
  );
  const chinaCoverageResult = results[allDataKeys.length + allMetaKeys.length + activationEntries.length];
  const chinaCoverageRaw = chinaCoverageResult?.error ? null : chinaCoverageResult?.result;
  const educationPayloadResult = results[allDataKeys.length + allMetaKeys.length + activationEntries.length + 1];
  const educationPayload = unwrapEnvelope(parseRedisValue(educationPayloadResult?.result)).data;
  const educationPayloadRankableCount = parseEducationPayloadRankableRecordCount(educationPayload);
  const scorecardReadModelResult = results[allDataKeys.length + allMetaKeys.length + activationEntries.length + 2];
  const fredRolloutOffset = allDataKeys.length + allMetaKeys.length + activationEntries.length + 3;
  const fredRatesRolloutUntil = parseFredRatesRolloutUntil(
    results.slice(fredRolloutOffset, fredRolloutOffset + fredRolloutCommands.length)
  );
  const rolloutPendingUntilMs = /* @__PURE__ */ new Map();
  if (fredRatesRolloutUntil !== null) {
    rolloutPendingUntilMs.set("fredRatesSeeder", fredRatesRolloutUntil);
  }
  const keyVersionRollouts = keyVersionRolloutCandidates(
    [BOOTSTRAP_KEYS, STANDALONE_KEYS],
    keyStrens,
    keyErrors,
    keyMetaValues,
    keyMetaErrors,
    evaluationNow
  );
  const keyVersionCommands = keyVersionRolloutCommands(keyVersionRollouts, evaluationNow);
  if (keyVersionCommands.length > 0) {
    if (budget.exhausted()) return deadlineFallback();
    const deadlineResults = await redisPipeline(
      fenceHealthMutations(keyVersionCommands, refreshLockToken),
      budget.clamp(4e3),
      true
    ).catch(() => null);
    if (budget.exhausted()) return deadlineFallback();
    keyVersionRollouts.forEach(({ name }, index) => {
      const until = parseFredRatesRolloutUntil(deadlineResults?.slice(index * 2, index * 2 + 2));
      if (until !== null) rolloutPendingUntilMs.set(name, until);
    });
  }
  const containmentEvidenceByName = /* @__PURE__ */ new Map();
  const classifyCtx = {
    containmentEvidenceByName,
    keyStrens,
    keyErrors,
    keyMetaValues,
    keyMetaErrors,
    activationStates,
    rolloutPendingUntilMs,
    educationPayloadReadFailed: Boolean(educationPayloadResult?.error),
    educationPayloadRankableCount,
    humanitarianRetention,
    now: evaluationNow
  };
  const checks = {};
  const contentFreshnessPendingUntil = {};
  const counts = {
    ok: 0,
    warn: 0,
    containedWarn: 0,
    onDemandWarn: 0,
    staleContent: 0,
    rolloutPending: 0,
    pending: 0,
    crit: 0
  };
  let totalChecks = 0;
  const sources = [
    [BOOTSTRAP_KEYS, { allowOnDemand: false }],
    [STANDALONE_KEYS, { allowOnDemand: true }]
  ];
  for (const [registry, opts] of sources) {
    for (const [name, redisKey] of Object.entries(registry)) {
      totalChecks++;
      let entry = classifyKey(name, redisKey, opts, classifyCtx);
      if (name === "globalTendersContractsFinder") {
        const composed = composeContractsFinderHealth(entry, contractsFinderMeta, contractsFinderSnapshot, contractsFinderReadFailed, evaluationNow);
        entry = composed.entry;
        containmentEvidenceByName.set(name, composed.evidence);
      }
      if (name === "chinaCoverage") {
        entry = composeChinaCoverageStatus(
          entry,
          chinaCoverageRaw,
          Boolean(chinaCoverageResult?.error),
          evaluationNow
        );
        const evidence = containmentEvidenceByName.get(name);
        const evaluatedAt = Date.parse(entry.evaluatedAt ?? "");
        if (evidence && evidence.records === entry.records && Number.isFinite(evaluatedAt) && evaluatedAt <= evaluationNow && !entry.problems?.some((problem) => problem.status === "unavailable")) {
          evidence.status = entry.status;
        }
      }
      if (name === "scorecardFiveFactor") {
        entry = composeScorecardReadModelStatus(
          entry,
          scorecardReadModelResult?.result,
          Boolean(scorecardReadModelResult?.error)
        );
      }
      checks[name] = entry;
      if (typeof entry.contentFreshnessPendingUntil === "string") {
        contentFreshnessPendingUntil[name] = entry.contentFreshnessPendingUntil;
      }
    }
  }
  checks.chinaDecisionSignals = composeChinaDecisionSignalsStatus(
    checks.chinaDecisionSignals,
    checks.chinaCoverage,
    evaluationNow
  );
  checks.chokepointTransits = composeChokepointTransitsCoverage(
    checks.chokepointTransits,
    keyMetaValues.get(SEED_META.chokepointTransits.key)
  );
  checks.riskScores = composeRiskScoresInputHealth(
    checks.riskScores,
    keyMetaValues.get(SEED_META.riskScores.key),
    checks,
    evaluationNow,
    containmentEvidenceByName
  );
  const ownedBackgroundWrites = [];
  const graceStatePlan = staleContentGraceStatePlan(graceEvidenceByName, checks, evaluationNow);
  if (graceStatePlan.claimCommands.length > 0) {
    if (budget.exhausted()) return deadlineFallback();
    const graceResults = await redisPipeline(fenceHealthMutations(graceStatePlan.claimCommands, refreshLockToken), budget.clamp(4e3), true).catch(() => null);
    if (!graceResults && budget.exhausted()) return deadlineFallback();
    applyStaleContentGrace(
      checks,
      graceEvidenceByName,
      parseStaleContentGraceUntil(graceResults, graceStatePlan.stateBackedNames),
      evaluationNow
    );
  }
  if (graceStatePlan.cleanupCommands.length > 0) {
    ownedBackgroundWrites.push(
      redisPipeline(fenceHealthMutations(graceStatePlan.cleanupCommands, refreshLockToken), 4e3, true).catch(() => {
      })
    );
  }
  let relayGatewayGate;
  try {
    relayGatewayGate = await readOrProbeRelayGatewayGate({
      now: evaluationNow,
      key: RELAY_GATEWAY_GATE_PROBE_KEY,
      leaseKey: RELAY_GATEWAY_GATE_LEASE_KEY,
      ctx,
      budget
    });
  } catch (err) {
    if (err instanceof HealthBudgetExhaustedError) return deadlineFallback();
    throw err;
  }
  if (relayGatewayGate) {
    checks[RELAY_GATEWAY_GATE_CHECK_NAME] = relayGatewayGate;
    totalChecks++;
  }
  for (const [name, entry] of Object.entries(checks)) {
    const bucket = healthStatusBucket(entry, evaluationNow);
    counts[bucket]++;
    const evidence = containmentEvidenceByName.get(name);
    if (isContainedHealthWarning(entry, evidence, evaluationNow)) {
      counts.containedWarn++;
    }
    if (isPendingHealthEntry(entry, evaluationNow)) counts.pending++;
    if (entry.status === "EMPTY_ON_DEMAND") counts.onDemandWarn++;
    if (entry.status === "STALE_CONTENT") counts.staleContent++;
    if (entry.status === "ROLLOUT_PENDING") counts.rolloutPending++;
  }
  const {
    overall,
    diagnosticOverall,
    realWarnCount,
    critCount
  } = computeOverallStatus(counts, totalChecks);
  const diagnostics = collectFailureLogProblems(checks, evaluationNow);
  const { problemKeys } = diagnostics;
  if (problemKeys.length > 0) {
    console.log("[health] %s problems=[%s]", diagnosticOverall, problemKeys.join(", "));
  }
  const persistFailureLog = async () => {
    let previousSignature = "";
    const alertCommands = [];
    if (problemKeys.length > 0) {
      const result = await redisPipeline([
        ["GET", "health:failure-log-sig"],
        ["GET", HEALTH_INCIDENT_ALERTS_KEY]
      ], 4e3).catch(() => null);
      previousSignature = result?.[0]?.error ? "" : result?.[0]?.result ?? "";
      if (Array.isArray(result) && result[1] && !result[1].error && parseAlertedIncidents(result[1].result) !== null) {
        const alertedRaw = result[1].result ?? null;
        const pending = pendingIncidentKeys(alertedRaw, diagnostics.sigKeys);
        const outcomes = await Promise.all(pending.map((key) => reportSourceIncident(key, checks, ctx, options.captureIncident).catch(() => false)));
        const delivered = pending.filter((_, index) => outcomes[index]);
        alertCommands.push([
          "SET",
          HEALTH_INCIDENT_ALERTS_KEY,
          JSON.stringify(nextAlertedIncidents(alertedRaw, diagnostics.sigKeys, delivered)),
          "EX",
          HEALTH_INCIDENT_ALERTS_TTL_SECONDS
        ]);
      }
    } else {
      alertCommands.push(["DEL", HEALTH_INCIDENT_ALERTS_KEY]);
    }
    const persistencePlan = buildFailureLogPersistencePlan({
      verdict: { overall, diagnosticOverall, realWarnCount, critCount },
      diagnostics,
      containedWarnCount: counts.containedWarn,
      previousSignature,
      now: evaluationNow
    });
    const commands = [...persistencePlan.commands, ...alertCommands].map(([op, key, ...args]) => [op, applyRedisKeyPrefix(key), ...args]);
    await redisPipeline(fenceHealthMutations(commands, refreshLockToken), 4e3, true).catch(() => {
    });
  };
  ownedBackgroundWrites.push(persistFailureLog().catch(() => {
  }));
  const verdictSnapshot = {
    status: overall,
    summary: {
      total: totalChecks,
      ok: counts.ok,
      // `warn` excludes on-demand-empty (cosmetic warns); `onDemandWarn` is
      // surfaced separately so readers can reconcile against `overall`.
      warn: realWarnCount,
      // Subset of `warn`: actionable source defects that still prove a usable
      // metadata-backed payload. These remain in `problems` even when the
      // small-cohort availability verdict stays HEALTHY.
      containedWarn: counts.containedWarn,
      onDemandWarn: counts.onDemandWarn,
      // `staleContent` counts every STALE_CONTENT diagnosis (fresh seeder,
      // frozen upstream data — issue #3845), so a frozen feed is visible
      // without walking every check entry. It is NOT a subset of `warn`: an
      // entry inside its bounded `staleContentGraceUntil` window is counted
      // here while its severity bucket is `ok`, so this can exceed `warn`.
      staleContent: counts.staleContent,
      ...counts.pending > 0 ? { pending: counts.pending } : {},
      // `rolloutPending` is a SUBSET of `warn` (#6059) — a newly deployed
      // schema whose producer has not reached its first scheduled run yet.
      // Bounded: each entry carries a `rolloutPendingUntil` deadline, after
      // which it becomes EMPTY (crit).
      rolloutPending: counts.rolloutPending,
      ...Object.keys(contentFreshnessPendingUntil).length > 0 ? { contentFreshnessPendingUntil } : {},
      crit: critCount
    },
    checkedAt: new Date(evaluationNow).toISOString(),
    checks
  };
  const snapshotTtl = String(snapshotTtlSeconds(verdictSnapshot, snapshotNow()));
  const snapshotWriteResult = budget.exhausted() ? null : await redisPipeline([[
    "EVAL",
    HEALTH_VERDICT_WRITE_SNAPSHOT_SCRIPT,
    "5",
    HEALTH_VERDICT_REFRESH_LOCK_KEY,
    HEALTH_VERDICT_SNAPSHOT_KEY,
    HEALTH_VERDICT_COMPACT_SNAPSHOT_KEY,
    HEALTH_VERDICT_LAST_KNOWN_KEY,
    HEALTH_VERDICT_COMPACT_LAST_KNOWN_KEY,
    refreshLockToken,
    JSON.stringify(verdictSnapshot),
    JSON.stringify(buildCompactVerdictSnapshot(verdictSnapshot)),
    snapshotTtl,
    String(HEALTH_VERDICT_LAST_KNOWN_TTL_SECONDS)
  ]], budget.clamp(4e3), true).catch(() => null);
  const snapshotWriteFailed = !snapshotWriteResult || snapshotWriteResult.length !== 1 || snapshotWriteResult[0]?.error || snapshotWriteResult[0]?.result !== "OK";
  const releaseAfterBackgroundWrites = Promise.allSettled(ownedBackgroundWrites).then(() => releaseHealthVerdictRefreshLock(refreshLockToken));
  if (ctx && typeof ctx.waitUntil === "function") ctx.waitUntil(releaseAfterBackgroundWrites);
  else await releaseAfterBackgroundWrites;
  if (snapshotWriteFailed) console.warn("[health] verdict snapshot write failed");
  for (const name of ["globalTendersContractsFinder", "humanitarianSummary"]) {
    const entry = checks[name];
    if (entry?.containmentUntil && isContainedHealthWarning(entry, containmentEvidenceByName.get(name), evaluationNow) && isExpiredDeadline(entry.containmentUntil, snapshotNow())) {
      verdictSnapshot.summary.containedWarn--;
      verdictSnapshot.status = computeOverallStatus({ ...counts, containedWarn: verdictSnapshot.summary.containedWarn }, totalChecks).overall;
    }
  }
  return healthResponse(verdictSnapshot, compact, headers);
}
async function handler(req, ctx) {
  return handleHealth(req, ctx);
}
var __testing__ = {
  composeContractsFinderHealth,
  composeChokepointTransitsCoverage,
  composeRiskScoresInputHealth,
  readSeedMeta,
  classifyKey,
  healthResponseBody,
  collectFailureLogProblems,
  pendingIncidentKeys,
  nextAlertedIncidents,
  HEALTH_INCIDENT_ALERTS_KEY,
  dataStatusFromSummary,
  buildFailureLogPersistencePlan,
  ACTIVATION_MARKERS,
  CONTENT_FRESHNESS_ROLLOUT_UNTIL_MS,
  RUNTIME_ROLLOUT_PENDING_POLICIES,
  FRED_RATES_ROLLOUT_DEADLINE_KEY,
  FRED_RATES_ROLLOUT_DURATION_MS,
  KEY_VERSION_ROLLOUT_DEADLINE_PREFIX,
  KEY_VERSION_ROLLOUT_MAX_MS,
  keyVersionRolloutDurationMs,
  writerKeyVersionBehind,
  keyVersionRolloutCommands,
  fredRatesRolloutCommands,
  parseFredRatesRolloutUntil,
  STALE_CONTENT_GRACE_MS,
  STALE_CONTENT_GRACE_STATE_KEY,
  staleContentGraceEvidence,
  staleContentGraceCandidateUntil,
  staleContentGraceStatePlan,
  parseStaleContentGraceUntil,
  staleContentGraceUntilMs,
  applyStaleContentGrace,
  healthStatusBucket,
  isContainedHealthWarning,
  computeOverallStatus,
  hasExpiredActivationGrace,
  snapshotTtlSeconds,
  CONSUMER_PRICE_HEALTH_MARKETS,
  consumerPriceCoverageHealthName,
  STATUS_COUNTS,
  // List-typed data keys + the command builder that measures them with LLEN
  // instead of STRLEN (tests/health-list-data-keys.test.mjs).
  LIST_DATA_KEYS,
  dataLenCommand,
  HEALTH_VERDICT_SNAPSHOT_KEY,
  HEALTH_VERDICT_COMPACT_SNAPSHOT_KEY,
  RELAY_GATEWAY_GATE_CHECK_NAME,
  RELAY_GATEWAY_GATE_ROUTE,
  RELAY_GATEWAY_GATE_TIMEOUT_MS,
  RELAY_GATEWAY_GATE_PROBE_KEY,
  RELAY_GATEWAY_GATE_PROBE_TTL_SECONDS,
  RELAY_GATEWAY_GATE_LEASE_KEY,
  RELAY_GATEWAY_GATE_LEASE_TTL_SECONDS,
  RELAY_GATEWAY_GATE_REDIS_TIMEOUT_MS,
  RELAY_GATEWAY_GATE_FOLLOWER_WAIT_MS,
  RELAY_GATEWAY_GATE_TRANSPORT_GRACE_MS,
  RELAY_GATEWAY_GATE_PROBE_RETENTION_SECONDS,
  HEALTH_POLL_INTERVAL_MS,
  withTransportGrace,
  probeRelayGatewayGate,
  parseCachedRelayGatewayGate,
  readOrProbeRelayGatewayGate,
  buildCompactVerdictSnapshot,
  HEALTH_VERDICT_SNAPSHOT_TTL_SECONDS,
  HEALTH_VERDICT_REFRESH_LOCK_KEY,
  HEALTH_VERDICT_REFRESH_LOCK_TTL_SECONDS,
  HEALTH_VERDICT_REFRESH_WAIT_MS,
  HEALTH_VERDICT_LAST_KNOWN_READ_TIMEOUT_MS,
  HEALTH_REQUEST_DEADLINE_MS,
  HEALTH_REQUEST_WORK_BUDGET_MS,
  HealthBudgetExhaustedError,
  createHealthRequestBudget,
  HEALTH_VERDICT_WRITE_SNAPSHOT_SCRIPT,
  HEALTH_VERDICT_LAST_KNOWN_KEY,
  HEALTH_VERDICT_COMPACT_LAST_KNOWN_KEY,
  HEALTH_VERDICT_LAST_KNOWN_TTL_SECONDS,
  HEALTH_VERDICT_MUTATION_SCRIPT,
  HEALTH_VERDICT_RELEASE_LOCK_SCRIPT,
  fenceHealthMutations,
  CHINA_COVERAGE_SUMMARY_KEY,
  CHINA_DECISION_SIGNALS_PENDING_MS,
  projectChinaCoverageStatus,
  composeChinaCoverageStatus,
  composeChinaDecisionSignalsStatus,
  composeScorecardReadModelStatus,
  healthVerdictRedisKey,
  parseHealthVerdictSnapshot,
  // U7 (Tier 3 parity test): exposed for tests/mcp-bootstrap-parity.test.mjs
  // to walk the canonical seeded-data inventory. Both consts are unexported
  // at module scope by design — this is the test-only escape hatch.
  BOOTSTRAP_KEYS,
  STANDALONE_KEYS,
  CANADA_ALERTS_CUTOVER_FALLBACK_KEYS,
  applyCanadaAlertsDataPresenceFallback,
  applyCanadaAlertsSeedMetaFallback,
  SEED_META,
  EMPTY_DATA_OK_KEYS,
  MISSING_DATA_IS_FAILURE_KEYS,
  ZERO_RECORD_DATA_OK_KEYS,
  // Exposed so a registration test can prove a key's deployment-order softening
  // is actually wired — membership here is what keeps a not-yet-published key
  // out of CRIT, and nothing could assert it before (#5736).
  ON_DEMAND_KEYS
};
export {
  COVERAGE_FAILURE_REASONS,
  __testing__,
  config,
  handler as default,
  handleHealth
};
