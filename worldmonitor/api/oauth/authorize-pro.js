var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// shared/compare-and-delete-script.cjs
var require_compare_and_delete_script = __commonJS({
  "shared/compare-and-delete-script.cjs"(exports, module) {
    "use strict";
    var COMPARE_AND_DELETE_SCRIPT2 = "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end";
    module.exports = { COMPARE_AND_DELETE_SCRIPT: COMPARE_AND_DELETE_SCRIPT2 };
  }
});

// server/_shared/sidecar-cache.ts
var sidecar_cache_exports = {};
__export(sidecar_cache_exports, {
  sidecarCacheGet: () => sidecarCacheGet,
  sidecarCacheSet: () => sidecarCacheSet,
  sidecarCacheSetIfAbsent: () => sidecarCacheSetIfAbsent,
  sidecarCacheStats: () => sidecarCacheStats
});
function startSweepIfNeeded() {
  if (sweepTimer) return;
  sweepTimer = setInterval(() => {
    const now = Date.now();
    for (const [k, entry] of store) {
      if (entry.expiresAt <= now) {
        totalBytes -= entry.size;
        store.delete(k);
      }
    }
  }, SWEEP_INTERVAL_MS);
  if (typeof sweepTimer === "object" && "unref" in sweepTimer) {
    sweepTimer.unref();
  }
}
function evictLRU(incomingSize = 0) {
  const keysToEvict = [];
  for (const [k, entry] of store) {
    const nextEntryCount = store.size - keysToEvict.length + 1;
    const nextTotalBytes = totalBytes + incomingSize;
    if (nextEntryCount <= MAX_ENTRIES && nextTotalBytes <= MAX_BYTES) break;
    keysToEvict.push(k);
    totalBytes -= entry.size;
  }
  for (const k of keysToEvict) store.delete(k);
}
function sidecarCacheGet(key) {
  const entry = store.get(key);
  if (!entry) {
    missCount++;
    return null;
  }
  if (entry.expiresAt <= Date.now()) {
    totalBytes -= entry.size;
    store.delete(key);
    missCount++;
    return null;
  }
  store.delete(key);
  store.set(key, entry);
  hitCount++;
  return JSON.parse(entry.value);
}
function sidecarCacheSetIfAbsent(key, value, ttlSeconds) {
  const existing = store.get(key);
  if (existing && existing.expiresAt > Date.now()) return false;
  return sidecarCacheSet(key, value, ttlSeconds);
}
function sidecarCacheSet(key, value, ttlSeconds) {
  const clamped = Math.max(MIN_TTL_S, Math.min(MAX_TTL_S, ttlSeconds));
  const json = JSON.stringify(value);
  const size = json.length * 2;
  if (size > MAX_SINGLE_VALUE_BYTES) {
    console.warn(`[sidecar-cache] rejecting key "${key}": ${(size / 1024 / 1024).toFixed(1)} MB exceeds 2 MB limit`);
    return false;
  }
  const existing = store.get(key);
  if (existing) {
    totalBytes -= existing.size;
    store.delete(key);
  }
  if (store.size >= MAX_ENTRIES || totalBytes + size > MAX_BYTES) {
    evictLRU(size);
  }
  store.set(key, {
    value: json,
    expiresAt: Date.now() + clamped * 1e3,
    size
  });
  totalBytes += size;
  startSweepIfNeeded();
  return true;
}
function sidecarCacheStats() {
  return { entries: store.size, bytes: totalBytes, hits: hitCount, misses: missCount };
}
var MAX_ENTRIES, MAX_BYTES, MAX_SINGLE_VALUE_BYTES, MIN_TTL_S, MAX_TTL_S, SWEEP_INTERVAL_MS, store, totalBytes, sweepTimer, hitCount, missCount;
var init_sidecar_cache = __esm({
  "server/_shared/sidecar-cache.ts"() {
    "use strict";
    MAX_ENTRIES = 500;
    MAX_BYTES = 50 * 1024 * 1024;
    MAX_SINGLE_VALUE_BYTES = 2 * 1024 * 1024;
    MIN_TTL_S = 10;
    MAX_TTL_S = 86400;
    SWEEP_INTERVAL_MS = 6e4;
    store = /* @__PURE__ */ new Map();
    totalBytes = 0;
    sweepTimer = null;
    hitCount = 0;
    missCount = 0;
  }
});

// api/_mcp-grant-hmac.ts
var ENC = new TextEncoder();
var DEC = new TextDecoder();
var GrantConfigError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "GrantConfigError";
  }
};
function base64UrlDecode(s) {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - s.length % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    ENC.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
function readGrantSecret(env = process.env) {
  const secret = env.MCP_PRO_GRANT_HMAC_SECRET ?? "";
  if (!secret) {
    console.warn("[mcp-grant-hmac] MCP_PRO_GRANT_HMAC_SECRET is not set");
    throw new GrantConfigError("MCP_PRO_GRANT_HMAC_SECRET is not set");
  }
  return secret;
}
async function verifyGrant(token, secret, now = Date.now()) {
  if (typeof token !== "string" || token.length === 0) return { ok: false, reason: "malformed" };
  const dot = token.indexOf(".");
  if (dot <= 0 || dot === token.length - 1) return { ok: false, reason: "malformed" };
  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  if (!/^[A-Za-z0-9_-]+$/.test(payloadB64) || !/^[A-Za-z0-9_-]+$/.test(sigB64)) {
    return { ok: false, reason: "malformed" };
  }
  let payloadBytes;
  let sigBytes;
  try {
    payloadBytes = base64UrlDecode(payloadB64);
    sigBytes = base64UrlDecode(sigB64);
  } catch {
    return { ok: false, reason: "malformed" };
  }
  const sec = secret ?? readGrantSecret();
  const key = await importHmacKey(sec);
  const ok = await crypto.subtle.verify("HMAC", key, sigBytes, payloadBytes);
  if (!ok) return { ok: false, reason: "bad-signature" };
  let payload;
  try {
    payload = JSON.parse(DEC.decode(payloadBytes));
  } catch {
    return { ok: false, reason: "invalid-payload" };
  }
  if (!payload || typeof payload !== "object") return { ok: false, reason: "invalid-payload" };
  const p = payload;
  if (typeof p.userId !== "string" || p.userId.length === 0) return { ok: false, reason: "invalid-payload" };
  if (typeof p.nonce !== "string" || p.nonce.length === 0) return { ok: false, reason: "invalid-payload" };
  if (typeof p.exp !== "number" || !Number.isFinite(p.exp)) return { ok: false, reason: "invalid-payload" };
  if (p.exp <= now) return { ok: false, reason: "expired" };
  return { ok: true, payload: { userId: p.userId, nonce: p.nonce, exp: p.exp } };
}

// server/_shared/entitlement-coverage.ts
function hasCurrentEntitlementCoverage(entitlement, now = Date.now()) {
  return entitlement != null && entitlement.verificationUnavailable !== true && entitlement.billingStatus !== "subscription_lapsed" && Number.isFinite(entitlement.validUntil) && entitlement.validUntil >= now;
}

// server/_shared/redis.ts
var import_compare_and_delete_script = __toESM(require_compare_and_delete_script(), 1);

// server/_shared/seed-envelope.ts
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

// server/_shared/client-ip.ts
var CLOUDFLARE_IPV4_CIDRS = Object.freeze([
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22"
]);
var CLOUDFLARE_IPV6_CIDRS = Object.freeze([
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32"
]);
function parseIpv4(value) {
  const parts = value.split(".");
  if (parts.length !== 4) return null;
  let address = 0;
  for (const part of parts) {
    if (!/^(?:0|[1-9]\d{0,2})$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    address = address * 256 + octet;
  }
  return address >>> 0;
}
function parseIpv6(value) {
  if (!value || value.includes(".") || value.includes("%")) return null;
  const halves = value.split("::");
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  if (halves.length === 1 && head.length !== 8) return null;
  if (halves.length === 2 && head.length + tail.length >= 8) return null;
  const groups = halves.length === 2 ? [...head, ...Array(8 - head.length - tail.length).fill("0"), ...tail] : head;
  if (groups.some((group) => !/^[0-9a-f]{1,4}$/i.test(group))) return null;
  return groups.map((group) => Number.parseInt(group, 16));
}
function parseIpv4Cidr(cidr) {
  const [networkText = "", prefixText = ""] = cidr.split("/");
  const network = parseIpv4(networkText);
  if (network === null) throw new Error(`Invalid Cloudflare IPv4 CIDR: ${cidr}`);
  return [network, Number(prefixText)];
}
function parseIpv6Cidr(cidr) {
  const [networkText = "", prefixText = ""] = cidr.split("/");
  const network = parseIpv6(networkText);
  if (network === null) throw new Error(`Invalid Cloudflare IPv6 CIDR: ${cidr}`);
  return [network, Number(prefixText)];
}
var CLOUDFLARE_IPV4_RANGES = Object.freeze(CLOUDFLARE_IPV4_CIDRS.map(parseIpv4Cidr));
var CLOUDFLARE_IPV6_RANGES = Object.freeze(CLOUDFLARE_IPV6_CIDRS.map(parseIpv6Cidr));

// server/_shared/usage.ts
var AXIOM_DATASET = "wm_api_usage";
var AXIOM_INGEST_URL = `https://api.axiom.co/v1/datasets/${AXIOM_DATASET}/ingest`;
var CB_WINDOW_MS = 5 * 60 * 1e3;

// server/_shared/redis.ts
function parseTimeoutEnv(raw, defaultMs) {
  const parsed = Number.parseInt(raw ?? "", 10);
  return parsed > 0 ? parsed : defaultMs;
}
var REDIS_OP_TIMEOUT_MS = parseTimeoutEnv(process.env.REDIS_OP_TIMEOUT_MS, 1500);
var REDIS_PIPELINE_TIMEOUT_MS = parseTimeoutEnv(process.env.REDIS_PIPELINE_TIMEOUT_MS, 5e3);
function errMsg(err) {
  return err instanceof Error ? err.message : String(err);
}
function getKeyPrefix() {
  const env = process.env.VERCEL_ENV;
  if (!env || env === "production") return "";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "dev";
  return `${env}:${sha}:`;
}
var cachedPrefix;
function prefixKey(key) {
  if (cachedPrefix === void 0) cachedPrefix = getKeyPrefix();
  if (!cachedPrefix) return key;
  return `${cachedPrefix}${key}`;
}
async function readCachedJsonInternal(key, raw = false, unwrapSeedEnvelope = true) {
  if (process.env.LOCAL_API_MODE === "tauri-sidecar") {
    try {
      const { sidecarCacheGet: sidecarCacheGet2 } = await Promise.resolve().then(() => (init_sidecar_cache(), sidecar_cache_exports));
      const value = sidecarCacheGet2(key);
      return value == null ? { status: "miss" } : { status: "hit", value };
    } catch (error) {
      return { status: "error", error };
    }
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { status: "miss" };
  try {
    const finalKey = raw ? key : prefixKey(key);
    const resp = await fetch(`${url}/get/${encodeURIComponent(finalKey)}`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(REDIS_OP_TIMEOUT_MS)
    });
    if (!resp.ok) throw new Error(`Redis HTTP ${resp.status}`);
    const data = await resp.json();
    if (data.error) throw new Error(`Redis command error: ${data.error}`);
    if (!data.result) return { status: "miss" };
    const parsed = JSON.parse(data.result);
    return {
      status: "hit",
      value: unwrapSeedEnvelope ? unwrapEnvelope(parsed).data : parsed
    };
  } catch (error) {
    return { status: "error", error };
  }
}
async function readCachedJson(key, raw = false) {
  return readCachedJsonInternal(key, raw, true);
}
function logCacheReadError(key, err) {
  const isTimeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
  if (isTimeout) {
    console.error(`[REDIS-TIMEOUT] getCachedJson key=${key} timeoutMs=${REDIS_OP_TIMEOUT_MS}`);
  } else {
    console.warn("[redis] getCachedJson failed:", errMsg(err));
  }
}
async function getCachedJson(key, raw = false) {
  const read = await readCachedJson(key, raw);
  if (read.status === "hit") return read.value;
  if (read.status === "error") logCacheReadError(key, read.error);
  return null;
}
async function setCachedJson(key, value, ttlSeconds, raw = false) {
  if (process.env.LOCAL_API_MODE === "tauri-sidecar") {
    const { sidecarCacheSet: sidecarCacheSet2 } = await Promise.resolve().then(() => (init_sidecar_cache(), sidecar_cache_exports));
    return sidecarCacheSet2(key, value, ttlSeconds);
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  try {
    const finalKey = raw ? key : prefixKey(key);
    const resp = await fetch(`${url}/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "worldmonitor-server/1.0 (redis)"
      },
      body: JSON.stringify(["SET", finalKey, JSON.stringify(value), "EX", String(ttlSeconds)]),
      signal: AbortSignal.timeout(REDIS_PIPELINE_TIMEOUT_MS)
    });
    const data = await resp.json().catch(() => null);
    if (!resp.ok || data?.error) {
      console.warn(`[redis] setCachedJson failed:`, data?.error ?? `HTTP ${resp.status}`);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[redis] setCachedJson failed:", errMsg(err));
    return false;
  }
}

// server/_shared/entitlement-check.ts
var ENDPOINT_ENTITLEMENTS = {
  "/api/forecast/v1/trigger-simulation": 1,
  "/api/intelligence/v1/classify-event": 1,
  // deduct-situation is a Pro panel (DeductionPanel premium: 'locked') and in
  // PREMIUM_RPC_PATHS, but it is also a direct-LLM quota route. The gateway
  // treats a resolved Clerk session as authenticated for quota routes, which
  // skipped the legacy Pro bearer gate and let any signed-in free account
  // spend LLM budget here. The tier entry makes the Pro check explicit.
  "/api/intelligence/v1/deduct-situation": 1,
  "/api/intelligence/v1/get-country-intel-brief": 1,
  "/api/intelligence/v1/search-intel-history": 1,
  "/api/intelligence/v1/get-intel-timeline": 1,
  "/api/intelligence/v1/get-similar-events": 1,
  "/api/market/v1/analyze-stock": 1,
  "/api/market/v1/get-stock-analysis-history": 1,
  "/api/market/v1/get-insider-transactions": 1,
  "/api/market/v1/backtest-stock": 1,
  "/api/market/v1/list-stored-stock-backtests": 1,
  "/api/economic/v1/list-global-tenders": 1,
  "/api/scenario/v1/run-scenario": 1,
  "/api/scenario/v1/get-scenario-status": 1,
  "/api/supply-chain/v1/get-country-chokepoint-index": 1,
  "/api/supply-chain/v1/get-bypass-options": 1,
  "/api/supply-chain/v1/get-country-cost-shock": 1,
  "/api/supply-chain/v1/get-route-explorer-lane": 1,
  "/api/supply-chain/v1/get-route-impact": 1,
  "/api/supply-chain/v1/get-country-products": 1,
  "/api/supply-chain/v1/get-multi-sector-cost-shock": 1,
  "/api/supply-chain/v1/get-sector-dependency": 1,
  "/api/trade/v1/list-comtrade-flows": 1,
  "/api/trade/v1/get-tariff-trends": 1,
  "/api/trade/v1/get-bilateral-tariff": 1,
  "/api/trade/v1/get-us-import-duty": 1,
  "/api/resilience/v1/get-food-stocks": 1,
  "/api/resilience/v1/get-demographics-capability": 1,
  "/api/resilience/v1/get-resilience-indicators": 1,
  // The five-factor scorecard (food, energy, demographics, technology, defense
  // bands) went free (#9742): a calm per-country capability check should not
  // sit behind Pro. Its sibling resilience routes above stay gated.
  // Physical-vs-paper metals (#6436 series, #6448 index), mineral production
  // concentration (#6439), arms-supplier dependency (#6438) and commodity
  // supply vulnerability (#6449). Each shipped ungated because the issues
  // scoped ingestion + exposure and never named an access tier; the audit that
  // produced this block found all seven serving full payloads to an anonymous
  // wms_ session. They belong beside their siblings above: the same seeded
  // derived-analytics product the resilience routes sell.
  "/api/market/v1/get-physical-premiums": 1,
  "/api/market/v1/get-physical-divergence-index": 1,
  "/api/supply-chain/v1/get-mineral-production": 1,
  "/api/military/v1/get-defense-industrial-base": 1,
  "/api/supply-chain/v1/get-country-vulnerabilities": 1,
  "/api/supply-chain/v1/get-chokepoint-dependencies": 1,
  "/api/supply-chain/v1/list-vulnerability-rankings": 1,
  "/api/news/v1/list-media-perspective": 1,
  "/api/news/v1/list-news-pool": 1
};
var CONVEX_INTERNAL_ENTITLEMENTS_PATH = "/api/internal-entitlements";
var _didWarnMissingConvexSharedSecret = false;
var _didWarnMissingConvexSiteUrl = false;
function getConvexSharedSecret() {
  const secret = process.env.CONVEX_SERVER_SHARED_SECRET ?? "";
  if (!secret && !_didWarnMissingConvexSharedSecret) {
    _didWarnMissingConvexSharedSecret = true;
    console.warn("[entitlement-check] CONVEX_SERVER_SHARED_SECRET not set; Convex fallback disabled");
  }
  return secret;
}
function getConvexSiteUrl() {
  const siteUrl = process.env.CONVEX_SITE_URL ?? "";
  if (!siteUrl && !_didWarnMissingConvexSiteUrl) {
    _didWarnMissingConvexSiteUrl = true;
    console.warn("[entitlement-check] CONVEX_SITE_URL not set; Convex fallback disabled");
  }
  return siteUrl;
}
var _inFlight = /* @__PURE__ */ new Map();
var UNAVAILABLE_NEGATIVE_CACHE_TTL_MS = 3e3;
var UNAVAILABLE_NEGATIVE_CACHE_MAX_ENTRIES = 1e3;
var _unavailableUntil = /* @__PURE__ */ new Map();
function rememberVerificationUnavailable(userId, retryAfterSeconds) {
  const now = Date.now();
  if (_unavailableUntil.size >= UNAVAILABLE_NEGATIVE_CACHE_MAX_ENTRIES) {
    for (const [key, entry] of _unavailableUntil) {
      if (entry.expiresAt <= now) _unavailableUntil.delete(key);
    }
    while (_unavailableUntil.size >= UNAVAILABLE_NEGATIVE_CACHE_MAX_ENTRIES) {
      const oldest = _unavailableUntil.keys().next();
      if (oldest.done) break;
      _unavailableUntil.delete(oldest.value);
    }
  }
  _unavailableUntil.set(userId, {
    expiresAt: now + UNAVAILABLE_NEGATIVE_CACHE_TTL_MS,
    retryAfterSeconds
  });
}
var ENV_PREFIX = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live" : "test";
var ENTITLEMENT_CACHE_TTL_SECONDS = 900;
var LAPSED_BILLING_MARKER_TTL_SECONDS = 60;
var NOT_APPLICABLE_VERIFICATION_TTL_SECONDS = 60;
function isEntitlementBackendConfigured() {
  return Boolean(process.env.CONVEX_SITE_URL && getConvexSharedSecret());
}
function clampRetryAfterSeconds(raw) {
  return Number.isFinite(raw) ? Math.max(1, Math.min(60, Math.ceil(raw))) : 5;
}
function isBillingVerificationStatus(value) {
  return value === "subscription_lapsed" || value === "renewal_verification_pending" || value === "renewal_verification_failed";
}
function billingMarkerTtlSeconds(entitlements) {
  if (!isBillingVerificationStatus(entitlements.billingStatus)) return null;
  if (entitlements.billingStatus === "subscription_lapsed") {
    return LAPSED_BILLING_MARKER_TTL_SECONDS;
  }
  return clampRetryAfterSeconds(entitlements.retryAfterSeconds);
}
function notApplicableVerificationTtlSeconds(entitlements) {
  const marker = entitlements.renewalVerificationFreshness;
  if (marker?.status !== "not_applicable" || !Number.isFinite(marker.checkedAt)) {
    return null;
  }
  const remainingMs = marker.checkedAt + NOT_APPLICABLE_VERIFICATION_TTL_SECONDS * 1e3 - Date.now();
  return remainingMs > 0 ? Math.max(1, Math.min(
    NOT_APPLICABLE_VERIFICATION_TTL_SECONDS,
    Math.ceil(remainingMs / 1e3)
  )) : null;
}
function entitlementMarkerTtlSeconds(entitlements) {
  return billingMarkerTtlSeconds(entitlements) ?? notApplicableVerificationTtlSeconds(entitlements);
}
var TIER_GATED_PATHS = new Set(Object.keys(ENDPOINT_ENTITLEMENTS));
async function getEntitlements(userId, options = {}) {
  const unavailable = _unavailableUntil.get(userId);
  if (unavailable !== void 0) {
    if (unavailable.expiresAt > Date.now()) {
      return unavailableEntitlements(unavailable.retryAfterSeconds);
    }
    _unavailableUntil.delete(userId);
  }
  const inFlightKey = options.requireDesktopKeyShape ? `${userId}\0desktop-key-shape` : userId;
  const existing = _inFlight.get(inFlightKey);
  if (existing) return existing;
  const promise = _getEntitlementsImpl(userId, options);
  _inFlight.set(inFlightKey, promise);
  try {
    const result = await promise;
    if (result?.verificationUnavailable) {
      rememberVerificationUnavailable(userId, result.retryAfterSeconds);
    }
    return result;
  } finally {
    _inFlight.delete(inFlightKey);
  }
}
function hasDesktopKeyShape(ent) {
  if (ent.features.tier < 1) return true;
  return typeof ent.features.desktopKeyAccess === "boolean";
}
function unavailableEntitlements(retryAfterSeconds) {
  return {
    planKey: "free",
    features: {
      tier: 0,
      apiAccess: false,
      apiRateLimit: 0,
      maxDashboards: 3,
      prioritySupport: false,
      exportFormats: ["csv"],
      mcpAccess: false
    },
    validUntil: 0,
    verificationUnavailable: true,
    ...retryAfterSeconds === void 0 ? {} : { retryAfterSeconds }
  };
}
function parseRetryAfterSeconds(header) {
  if (!header) return void 0;
  const seconds = Number(header.trim());
  return Number.isFinite(seconds) && seconds > 0 ? seconds : void 0;
}
async function _getEntitlementsImpl(userId, options) {
  try {
    const cached = await getCachedJson(`entitlements:${ENV_PREFIX}:${userId}`, true);
    if (cached && typeof cached === "object") {
      const ent = cached;
      const hasCurrentEmbedAccessShape = typeof ent.features?.embedAccess === "boolean";
      if (hasCurrentEmbedAccessShape && entitlementMarkerTtlSeconds(ent) !== null) return ent;
      const legacySharedBudgetShape = ent.features.apiAccess === true && ent.features.tier < 3 && typeof ent.features.planLimits?.mcpCallsPerDay === "number";
      if (ent.validUntil >= Date.now() && typeof ent.features.mcpAccess === "boolean" && hasCurrentEmbedAccessShape && ent.features.planLimits?.dashboardAiCallsPerDay !== void 0 && !legacySharedBudgetShape && (!options.requireDesktopKeyShape || hasDesktopKeyShape(ent))) {
        return ent;
      }
    }
    const convexSiteUrl = getConvexSiteUrl();
    const convexSharedSecret = getConvexSharedSecret();
    if (!convexSiteUrl || !convexSharedSecret) return null;
    const response = await fetch(`${convexSiteUrl}${CONVEX_INTERNAL_ENTITLEMENTS_PATH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "worldmonitor-gateway/1.0",
        "x-convex-shared-secret": convexSharedSecret
      },
      body: JSON.stringify({ userId }),
      signal: AbortSignal.timeout(3e3)
    });
    if (!response.ok) {
      return unavailableEntitlements(
        response.status === 429 ? parseRetryAfterSeconds(response.headers.get("Retry-After")) : void 0
      );
    }
    const result = await response.json();
    if (result) {
      try {
        await setCachedJson(
          `entitlements:${ENV_PREFIX}:${userId}`,
          result,
          entitlementMarkerTtlSeconds(result) ?? ENTITLEMENT_CACHE_TTL_SECONDS,
          true
        );
      } catch (cacheErr) {
        console.warn("[entitlement-check] cache write failed (non-fatal):", cacheErr instanceof Error ? cacheErr.message : String(cacheErr));
      }
      return result;
    }
    return null;
  } catch (err) {
    console.warn("[entitlement-check] getEntitlements failed:", err instanceof Error ? err.message : String(err));
    return unavailableEntitlements();
  }
}
function unverifiableEntitlementDenial(retryAfterSeconds) {
  return {
    retryable: true,
    code: "entitlement_verification_unavailable",
    retryAfterSeconds: clampRetryAfterSeconds(retryAfterSeconds),
    message: "Unable to verify API access",
    status: 503
  };
}
function classifyBillingVerification(entitlements) {
  if (entitlements?.verificationUnavailable) {
    return unverifiableEntitlementDenial(entitlements.retryAfterSeconds);
  }
  const status = entitlements?.billingStatus;
  if (!isBillingVerificationStatus(status)) return null;
  if (status === "subscription_lapsed") {
    return {
      retryable: false,
      code: status,
      retryAfterSeconds: 0,
      message: "Subscription lapsed",
      status: 403
    };
  }
  return {
    retryable: true,
    code: status,
    retryAfterSeconds: clampRetryAfterSeconds(entitlements?.retryAfterSeconds),
    message: status === "renewal_verification_pending" ? "Renewal verification pending" : "Renewal verification failed",
    status: 503
  };
}

// server/_shared/pro-mcp-gate.ts
function isConfirmedFreeMcpAccount(entitlements, opts) {
  if (entitlements === null) return opts?.backendConfigured === true;
  if (!entitlements || typeof entitlements !== "object") return false;
  const candidate = entitlements;
  return candidate.planKey === "free" && candidate.features?.tier === 0 && candidate.features.mcpAccess === false && typeof candidate.validUntil === "number" && Number.isFinite(candidate.validUntil);
}
function checkProMcpAccess(entitlements, now, opts) {
  if (entitlements && entitlements.features && entitlements.features.tier >= 1 && entitlements.features.mcpAccess === true && hasCurrentEntitlementCoverage(entitlements, now)) {
    return null;
  }
  if (!entitlements && opts?.backendConfigured === false) {
    return { kind: "billing_verification", denial: unverifiableEntitlementDenial() };
  }
  const billingInput = entitlements ? {
    ...entitlements,
    verificationUnavailable: entitlements.verificationUnavailable === true ? true : void 0
  } : entitlements;
  const denial = classifyBillingVerification(billingInput);
  if (denial) {
    if (!denial.retryable) return { kind: "free_account" };
    return { kind: "billing_verification", denial };
  }
  if (isConfirmedFreeMcpAccount(entitlements, opts)) return { kind: "free_account" };
  return { kind: "insufficient_tier" };
}

// server/_shared/pro-mcp-token.ts
var NEG_TTL_SECONDS = 60;
var CONVEX_TIMEOUT_MS = 3e3;
var NEG_CACHE_KEY_PREFIX = "pro-mcp-token-neg:";
var NEG_SENTINEL_VALUE = "1";
var ProMcpIssueFailed = class extends Error {
  kind;
  status;
  constructor(kind, message, status) {
    super(message);
    this.name = "ProMcpIssueFailed";
    this.kind = kind;
    this.status = status;
  }
};
function getConvexEnv() {
  const siteUrl = process.env.CONVEX_SITE_URL;
  const sharedSecret = process.env.CONVEX_SERVER_SHARED_SECRET;
  if (!siteUrl || !sharedSecret) return null;
  return { siteUrl, sharedSecret };
}
function convexHeaders(sharedSecret) {
  return {
    "Content-Type": "application/json",
    "User-Agent": "worldmonitor-gateway/1.0",
    "x-convex-shared-secret": sharedSecret
  };
}
var REDIS_OP_TIMEOUT_MS2 = 1500;
function negCacheKey(tokenId) {
  return `${NEG_CACHE_KEY_PREFIX}${tokenId}`;
}
async function writeNegCache(tokenId) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await fetch(
      `${url}/set/${encodeURIComponent(negCacheKey(tokenId))}/${encodeURIComponent(NEG_SENTINEL_VALUE)}/EX/${NEG_TTL_SECONDS}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(REDIS_OP_TIMEOUT_MS2)
      }
    );
  } catch (err) {
    console.warn("[pro-mcp-token] writeNegCache failed:", err instanceof Error ? err.message : String(err));
  }
}
async function issueProMcpTokenForUser(userId, clientId, name) {
  const env = getConvexEnv();
  if (!env) {
    throw new ProMcpIssueFailed(
      "config",
      "CONVEX_SITE_URL or CONVEX_SERVER_SHARED_SECRET not configured"
    );
  }
  let resp;
  try {
    resp = await fetch(`${env.siteUrl}/api/internal-issue-pro-mcp-token`, {
      method: "POST",
      headers: convexHeaders(env.sharedSecret),
      body: JSON.stringify({ userId, clientId, name }),
      signal: AbortSignal.timeout(CONVEX_TIMEOUT_MS)
    });
  } catch (err) {
    throw new ProMcpIssueFailed(
      "network",
      `Convex issue request failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  if (resp.ok) {
    const data = await resp.json().catch(() => null);
    if (!data || typeof data.tokenId !== "string" || !data.tokenId) {
      throw new ProMcpIssueFailed("network", "Convex issue response missing tokenId", resp.status);
    }
    return { tokenId: data.tokenId };
  }
  if (resp.status === 403) {
    throw new ProMcpIssueFailed("pro-required", "Pro entitlement required to issue MCP token", 403);
  }
  if (resp.status === 400) {
    throw new ProMcpIssueFailed("invalid-user-id", "Invalid userId for Pro MCP token issue", 400);
  }
  throw new ProMcpIssueFailed(
    "network",
    `Convex issue returned HTTP ${resp.status}`,
    resp.status
  );
}
async function revokeProMcpToken(userId, tokenId) {
  if (!userId || !tokenId) return { ok: false, reason: "not-found" };
  const env = getConvexEnv();
  if (!env) return { ok: false, reason: "config" };
  let resp;
  try {
    resp = await fetch(`${env.siteUrl}/api/internal-revoke-pro-mcp-token`, {
      method: "POST",
      headers: convexHeaders(env.sharedSecret),
      body: JSON.stringify({ userId, tokenId }),
      signal: AbortSignal.timeout(CONVEX_TIMEOUT_MS)
    });
  } catch (err) {
    console.warn(
      "[pro-mcp-token] revokeProMcpToken Convex fetch failed:",
      err instanceof Error ? err.message : String(err)
    );
    return { ok: false, reason: "network" };
  }
  if (resp.ok) {
    await writeNegCache(tokenId);
    return { ok: true };
  }
  if (resp.status === 404) return { ok: false, reason: "not-found" };
  if (resp.status === 409) return { ok: false, reason: "already-revoked" };
  return { ok: false, reason: "network" };
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
  const errMsg2 = err instanceof Error ? err.message : String(err);
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
          value: errMsg2,
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

// shared/agent-client-source.js
var AGENT_CLIENT_SOURCES = Object.freeze([
  "claude",
  "chatgpt",
  "cursor",
  "gemini",
  "grok-bot",
  "other"
]);
var CLIENT_MATCHERS = Object.freeze([
  ["claude", /claude|anthropic/],
  ["chatgpt", /chatgpt|openai/],
  ["cursor", /cursor/],
  ["gemini", /gemini/],
  ["grok-bot", /grok/]
]);
var UNKNOWN_CLIENT_NAME = "Unknown Client";
var MCP_GRANT_NAME_PREFIX = "Connected via ";
function mcpGrantName(clientName) {
  const name = typeof clientName === "string" && clientName.trim() ? clientName : UNKNOWN_CLIENT_NAME;
  return `${MCP_GRANT_NAME_PREFIX}${name}`;
}
var AGENT_REF_TTL_MS = 30 * 24 * 60 * 60 * 1e3;

// api/oauth/_client-metadata-snapshots.js
var CLIENT_METADATA_SNAPSHOTS = {
  "https://claude.ai/oauth/mcp-oauth-client-metadata": {
    client_id: "https://claude.ai/oauth/mcp-oauth-client-metadata",
    client_name: "Claude",
    redirect_uris: [
      "https://claude.ai/api/mcp/auth_callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token",
      "urn:ietf:params:oauth:grant-type:jwt-bearer"
    ],
    response_types: [
      "code"
    ]
  },
  "https://claude.ai/oauth/claude-code-client-metadata": {
    client_id: "https://claude.ai/oauth/claude-code-client-metadata",
    client_name: "Claude Code",
    redirect_uris: [
      "http://localhost/callback",
      "http://127.0.0.1/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://chatgpt.com/oauth/client.json": {
    client_id: "https://chatgpt.com/oauth/client.json",
    client_name: "ChatGPT",
    redirect_uris: [
      "https://chatgpt.com/connector_platform_oauth_redirect"
    ],
    token_endpoint_auth_method: "private_key_jwt",
    token_endpoint_auth_methods_supported: [
      "none",
      "private_key_jwt"
    ],
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://chatgpt.com/oauth/codex/client.json": {
    client_id: "https://chatgpt.com/oauth/codex/client.json",
    client_name: "Codex",
    redirect_uris: [
      "http://127.0.0.1/callback",
      "http://localhost/callback"
    ],
    token_endpoint_auth_method: "none",
    token_endpoint_auth_methods_supported: [
      "none"
    ],
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://cursor.com/oauth/mcp-client.json": {
    client_id: "https://cursor.com/oauth/mcp-client.json",
    client_name: "Cursor",
    redirect_uris: [
      "https://www.cursor.com/agents/mcp/oauth/callback",
      "https://www.cursor.com/bot/mcp/oauth/callback",
      "https://grok.com/connectors-oauth-exchange-code/",
      "http://localhost:8787/callback",
      "http://127.0.0.1:8787/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://grok.com/oauth/mcp-client.json": {
    client_id: "https://grok.com/oauth/mcp-client.json",
    client_name: "Grok",
    redirect_uris: [
      "https://grok.com/connectors-oauth-exchange-code/",
      "https://console.x.ai/connectors-oauth-exchange-code/"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://vscode.dev/oauth/client-metadata.json": {
    client_id: "https://vscode.dev/oauth/client-metadata.json",
    client_name: "Visual Studio Code",
    redirect_uris: [
      "http://127.0.0.1:33418/",
      "https://vscode.dev/redirect"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token",
      "urn:ietf:params:oauth:grant-type:device_code"
    ],
    response_types: [
      "code"
    ]
  },
  "https://goose-docs.ai/oauth/client-metadata.json": {
    client_id: "https://goose-docs.ai/oauth/client-metadata.json",
    client_name: "goose",
    redirect_uris: [
      "http://127.0.0.1/oauth_callback",
      "http://[::1]/oauth_callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://www.notion.so/oauth/mcp-client-metadata.json": {
    client_id: "https://www.notion.so/oauth/mcp-client-metadata.json",
    client_name: "Notion",
    redirect_uris: [
      "https://www.notion.so/workflows/mcp/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://app.notion.com/oauth/mcp-client-metadata.json": {
    client_id: "https://app.notion.com/oauth/mcp-client-metadata.json",
    client_name: "Notion",
    redirect_uris: [
      "https://app.notion.com/workflows/mcp/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://linear.app/.well-known/oauth-client-metadata/mcp.json": {
    client_id: "https://linear.app/.well-known/oauth-client-metadata/mcp.json",
    client_name: "Linear",
    redirect_uris: [
      "https://linear.app/connect/mcp/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://api.lovable.dev/.well-known/oauth-client": {
    client_id: "https://api.lovable.dev/.well-known/oauth-client",
    client_name: "Lovable",
    redirect_uris: [
      "https://api.lovable.dev/workspaces/connectors/mcp/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://api.factory.ai/mcp/oauth-client": {
    client_id: "https://api.factory.ai/mcp/oauth-client",
    client_name: "Factory Droid",
    redirect_uris: [
      "http://127.0.0.1/callback",
      "http://127.0.0.1:54621/callback",
      "http://127.0.0.1:54622/callback",
      "http://127.0.0.1:54623/callback",
      "https://dev.app.factory.ai/mcp/oauth/callback",
      "https://staging.app.factory.ai/mcp/oauth/callback",
      "https://preprod.app.factory.ai/mcp/oauth/callback",
      "https://app.factory.ai/mcp/oauth/callback",
      "https://dev.app.eu.factory.ai/mcp/oauth/callback",
      "https://staging.app.eu.factory.ai/mcp/oauth/callback",
      "https://preprod.app.eu.factory.ai/mcp/oauth/callback",
      "https://app.eu.factory.ai/mcp/oauth/callback",
      "http://localhost:3002/mcp/oauth/callback",
      "http://127.0.0.1:3002/mcp/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://api.conductor.build/oauth/client-metadata.json": {
    client_id: "https://api.conductor.build/oauth/client-metadata.json",
    client_name: "Conductor",
    redirect_uris: [
      "https://api.conductor.build/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://www.skydive.com/api/v1/external-oauth/client-metadata": {
    client_id: "https://www.skydive.com/api/v1/external-oauth/client-metadata",
    client_name: "Skydive",
    redirect_uris: [
      "https://www.skydive.com/api/v1/external-oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://www.mcpjam.com/.well-known/oauth/client-metadata.json": {
    client_id: "https://www.mcpjam.com/.well-known/oauth/client-metadata.json",
    client_name: "MCPJam",
    redirect_uris: [
      "http://127.0.0.1:6274/oauth/callback",
      "http://127.0.0.1:6274/callback",
      "http://127.0.0.1:6274/oauth/callback/debug",
      "http://localhost:6274/oauth/callback",
      "http://localhost:6274/callback",
      "http://localhost:6274/oauth/callback/debug",
      "http://127.0.0.1:5173/oauth/callback",
      "http://127.0.0.1:5173/oauth/callback/debug",
      "http://localhost:5173/oauth/callback",
      "http://localhost:5173/oauth/callback/debug",
      "https://app.mcpjam.com/oauth/callback",
      "https://app.mcpjam.com/oauth/callback/debug",
      "https://staging.mcpjam.com/oauth/callback",
      "https://staging.mcpjam.com/oauth/callback/debug",
      "https://score.mcpjam.com/oauth/callback",
      "https://score.mcpjam.com/oauth/callback/debug",
      "https://www.score.mcpjam.com/oauth/callback",
      "https://www.score.mcpjam.com/oauth/callback/debug"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token",
      "urn:ietf:params:oauth:grant-type:device_code"
    ],
    response_types: [
      "code"
    ]
  }
};

// api/oauth/_client-metadata.js
var TRUSTED_CLIENT_METADATA_URLS = /* @__PURE__ */ new Set([
  // Claude, Claude Code
  "https://claude.ai/oauth/mcp-oauth-client-metadata",
  "https://claude.ai/oauth/claude-code-client-metadata",
  // ChatGPT (stable document, used because we return RFC 9207 `iss`) and Codex
  "https://chatgpt.com/oauth/client.json",
  "https://chatgpt.com/oauth/codex/client.json",
  // Cursor (also lists Grok Bot's callback)
  "https://cursor.com/oauth/mcp-client.json",
  // Grok
  "https://grok.com/oauth/mcp-client.json",
  // VS Code
  "https://vscode.dev/oauth/client-metadata.json",
  // goose
  "https://goose-docs.ai/oauth/client-metadata.json",
  // Notion
  "https://www.notion.so/oauth/mcp-client-metadata.json",
  "https://app.notion.com/oauth/mcp-client-metadata.json",
  // Linear
  "https://linear.app/.well-known/oauth-client-metadata/mcp.json",
  // Lovable
  "https://api.lovable.dev/.well-known/oauth-client",
  // Factory
  "https://api.factory.ai/mcp/oauth-client",
  // Conductor
  "https://api.conductor.build/oauth/client-metadata.json",
  // Skydive
  "https://www.skydive.com/api/v1/external-oauth/client-metadata",
  // MCPJam
  "https://www.mcpjam.com/.well-known/oauth/client-metadata.json"
]);
var TRUSTED_CLIENT_METADATA_PREFIXES = [
  // Vercel Connect: https://connect.vercel.com/connectors/<id>
  { prefix: "https://connect.vercel.com/connectors/", redirectUris: ["https://connect.vercel.com/callback"] }
];
var CONNECTOR_ID = /^[A-Za-z0-9_-]{1,128}$/;
var FETCH_TIMEOUT_MS = 3e3;
var MAX_DOCUMENT_BYTES = 16 * 1024;
var MAX_REDIRECT_URIS = 50;
var MAX_REDIRECT_URI_BYTES = 2 * 1024;
var MAX_CLIENT_NAME_CHARS = 100;
var MAX_CACHE_TTL_SECONDS = 3600;
var DEFAULT_CACHE_TTL_SECONDS = 300;
var USER_AGENT = "WorldMonitor-OAuth/1.0 (+https://www.worldmonitor.app/docs/mcp-overview)";
var LOOPBACK_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "[::1]"]);
var encoder = new TextEncoder();
var CLIENT_METADATA_CACHE_PREFIX = "oauth:cimd:";
function isClientMetadataDocumentId(clientId) {
  return typeof clientId === "string" && /^[A-Za-z][A-Za-z0-9+.-]*:/.test(clientId);
}
var ClientMetadataError = class extends Error {
  constructor(reason, transient = false) {
    super(reason);
    this.name = "ClientMetadataError";
    this.reason = reason;
    this.transient = transient;
  }
};
function isIpLiteral(hostname) {
  return hostname.startsWith("[") || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || /^\d+$/.test(hostname);
}
function checkClientIdUrl(clientId) {
  let u;
  try {
    u = new URL(clientId);
  } catch {
    return "invalid_client_id_url";
  }
  if (u.protocol !== "https:") return "client_id_not_https";
  if (u.href !== clientId) return "client_id_not_canonical";
  if (u.username || u.password || u.hash || u.search || u.port) return "client_id_not_canonical";
  if (u.pathname === "/" || /\/\.\.?(?:\/|$)/.test(u.pathname)) return "client_id_not_canonical";
  const host = u.hostname;
  if (isIpLiteral(host) || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".")) {
    return "client_id_not_public_host";
  }
  return null;
}
function trustedEntry(clientId) {
  if (TRUSTED_CLIENT_METADATA_URLS.has(clientId)) return { redirectUris: null };
  for (const entry of TRUSTED_CLIENT_METADATA_PREFIXES) {
    if (clientId.startsWith(entry.prefix) && CONNECTOR_ID.test(clientId.slice(entry.prefix.length))) {
      return { redirectUris: entry.redirectUris };
    }
  }
  return null;
}
function clientMetadataCacheTtl(cacheControl) {
  if (!cacheControl) return DEFAULT_CACHE_TTL_SECONDS;
  const directives = cacheControl.toLowerCase().split(",").map((d) => d.trim());
  if (directives.some((d) => d === "no-store" || d === "no-cache" || d === "private")) return 0;
  const read = (name) => {
    const d = directives.find((x) => x.startsWith(`${name}=`));
    if (!d) return null;
    const n = Number.parseInt(d.slice(name.length + 1).replace(/^"(.*)"$/, "$1"), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const ttl = read("s-maxage") ?? read("max-age") ?? DEFAULT_CACHE_TTL_SECONDS;
  return Math.min(ttl, MAX_CACHE_TTL_SECONDS);
}
async function readCappedBody(resp, signal) {
  if (Number(resp.headers.get("content-length")) > MAX_DOCUMENT_BYTES) {
    throw new ClientMetadataError("document_too_large");
  }
  if (!resp.body) return "";
  const reader = resp.body.getReader();
  const bytes = new Uint8Array(MAX_DOCUMENT_BYTES);
  let total = 0;
  const onAbort = () => {
    void reader.cancel().catch(() => {
    });
  };
  signal.addEventListener("abort", onAbort, { once: true });
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (signal.aborted) throw new ClientMetadataError("document_fetch_timeout", true);
      if (done) break;
      if (value.byteLength > MAX_DOCUMENT_BYTES - total) {
        void reader.cancel().catch(() => {
        });
        throw new ClientMetadataError("document_too_large");
      }
      bytes.set(value, total);
      total += value.byteLength;
    }
  } catch (err) {
    if (err instanceof ClientMetadataError) throw err;
    throw new ClientMetadataError(signal.aborted ? "document_fetch_timeout" : "document_fetch_failed", true);
  } finally {
    signal.removeEventListener("abort", onAbort);
    try {
      reader.releaseLock();
    } catch {
    }
  }
  return new TextDecoder().decode(bytes.subarray(0, total));
}
async function withBodySnippet(err, resp, signal) {
  try {
    err.snippet = (await readCappedBody(resp, signal)).replace(/\s+/g, " ").slice(0, 200);
  } catch {
  }
  return err;
}
async function fetchDocument(clientId, fetchImpl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const timeout = new Promise((_, reject) => {
    controller.signal.addEventListener("abort", () => reject(new ClientMetadataError("document_fetch_timeout", true)), { once: true });
  });
  let resp;
  try {
    return await Promise.race([timeout, (async () => {
      try {
        resp = await fetchImpl(clientId, {
          method: "GET",
          redirect: "manual",
          headers: { Accept: "application/json", "User-Agent": USER_AGENT },
          signal: controller.signal
        });
      } catch (fetchErr) {
        const failure = new ClientMetadataError(controller.signal.aborted ? "document_fetch_timeout" : "document_fetch_failed", true);
        failure.detail = { error: fetchErr instanceof Error ? `${fetchErr.name}: ${fetchErr.message}` : String(fetchErr) };
        throw failure;
      }
      if (resp.type === "opaqueredirect" || resp.status >= 300 && resp.status < 400) {
        throw new ClientMetadataError("document_redirected");
      }
      if (resp.status === 404 || resp.status === 410) throw new ClientMetadataError("document_not_found");
      if (resp.status !== 200) throw await withBodySnippet(new ClientMetadataError("document_fetch_failed", true), resp, controller.signal);
      if (!/^application\/(?:[\w.+-]+\+)?json\b/i.test(resp.headers.get("content-type") ?? "")) {
        throw await withBodySnippet(new ClientMetadataError("document_not_json", true), resp, controller.signal);
      }
      const text = await readCappedBody(resp, controller.signal);
      let doc;
      try {
        doc = JSON.parse(text);
      } catch {
        throw new ClientMetadataError("document_not_json", true);
      }
      return { doc, ttl: clientMetadataCacheTtl(resp.headers.get("cache-control")) };
    })()]);
  } catch (err) {
    if (err instanceof ClientMetadataError && resp) {
      err.detail = {
        status: resp.status,
        content_type: resp.headers.get("content-type"),
        cf_mitigated: resp.headers.get("cf-mitigated"),
        cf_ray: resp.headers.get("cf-ray"),
        server: resp.headers.get("server"),
        ...err.snippet !== void 0 ? { body: err.snippet } : {}
      };
    }
    throw err;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
function validateDocument(clientId, doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) throw new ClientMetadataError("document_not_object");
  if (doc.client_id !== clientId) throw new ClientMetadataError("client_id_mismatch");
  if ("client_secret" in doc || "client_secret_expires_at" in doc) throw new ClientMetadataError("document_has_client_secret");
  const uris = doc.redirect_uris;
  if (!Array.isArray(uris) || uris.length === 0 || uris.length > MAX_REDIRECT_URIS) {
    throw new ClientMetadataError("invalid_redirect_uris");
  }
  for (const uri of uris) {
    if (typeof uri !== "string" || encoder.encode(uri).byteLength > MAX_REDIRECT_URI_BYTES) {
      throw new ClientMetadataError("invalid_redirect_uris");
    }
  }
  const method = doc.token_endpoint_auth_method;
  const supported = Array.isArray(doc.token_endpoint_auth_methods_supported) ? doc.token_endpoint_auth_methods_supported : [];
  if (method !== void 0 && method !== "none" && !supported.includes("none")) {
    throw new ClientMetadataError("unsupported_token_endpoint_auth_method");
  }
  if (doc.grant_types !== void 0 && !(Array.isArray(doc.grant_types) && doc.grant_types.includes("authorization_code"))) {
    throw new ClientMetadataError("unsupported_grant_types");
  }
  if (doc.response_types !== void 0 && !(Array.isArray(doc.response_types) && doc.response_types.includes("code"))) {
    throw new ClientMetadataError("unsupported_response_types");
  }
  const name = typeof doc.client_name === "string" ? doc.client_name.trim().slice(0, MAX_CLIENT_NAME_CHARS) : "";
  return {
    client_id: clientId,
    client_name: name || new URL(clientId).hostname,
    redirect_uris: uris
  };
}
function isCachedClient(clientId, value) {
  return !!value && typeof value === "object" && value.client_id === clientId && typeof value.client_name === "string" && Array.isArray(value.redirect_uris);
}
async function resolveOAuthClient(clientId, deps) {
  if (typeof clientId !== "string" || clientId.length === 0) return { ok: false, reason: "unknown_client", transient: false };
  if (!isClientMetadataDocumentId(clientId)) {
    let client2;
    try {
      client2 = await deps.redisGet(`oauth:client:${clientId}`);
    } catch {
      return { ok: false, reason: "storage_unavailable", transient: true };
    }
    if (!client2 || typeof client2 !== "object") return { ok: false, reason: "unknown_client", transient: false };
    return { ok: true, client: { ...client2, cimd: false } };
  }
  const urlProblem = checkClientIdUrl(clientId);
  if (urlProblem) return { ok: false, reason: urlProblem, transient: false };
  if (!trustedEntry(clientId)) {
    console.warn("[oauth/cimd] untrusted client_id", JSON.stringify({ client_id: clientId.slice(0, 300) }));
    return { ok: false, reason: "untrusted_client_id", transient: false };
  }
  const cacheKey = `${CLIENT_METADATA_CACHE_PREFIX}${clientId}`;
  try {
    const cached = await deps.redisGet(cacheKey);
    if (isCachedClient(clientId, cached)) return { ok: true, client: { ...cached, cimd: true } };
  } catch {
  }
  let client;
  let ttl;
  try {
    const fetched = await fetchDocument(clientId, deps.fetch ?? ((...args) => globalThis.fetch(...args)));
    client = validateDocument(clientId, fetched.doc);
    ttl = fetched.ttl;
  } catch (err) {
    const failure = err instanceof ClientMetadataError ? { ok: false, reason: err.reason, transient: err.transient } : { ok: false, reason: "document_fetch_failed", transient: true };
    const snapshots = deps.snapshots ?? CLIENT_METADATA_SNAPSHOTS;
    const snapshot = failure.transient && Object.hasOwn(snapshots, clientId) ? snapshots[clientId] : null;
    console.warn("[oauth/cimd] client document unusable", JSON.stringify({
      client_id: clientId,
      reason: failure.reason,
      transient: failure.transient,
      ...snapshot ? { fallback: "snapshot" } : {},
      ...err instanceof ClientMetadataError ? err.detail : { error: err instanceof Error ? `${err.name}: ${err.message}` : String(err) }
    }));
    if (snapshot) return { ok: true, client: { ...validateDocument(clientId, snapshot), cimd: true } };
    return failure;
  }
  if (ttl > 0 && deps.redisSetEx) {
    try {
      await deps.redisSetEx(cacheKey, client, ttl);
    } catch {
    }
  }
  return { ok: true, client: { ...client, cimd: true } };
}
function isLoopbackHttp(u) {
  return u.protocol === "http:" && LOOPBACK_HOSTS.has(u.hostname);
}
function clientAllowsRedirectUri(client, redirectUri) {
  if (!client || typeof redirectUri !== "string") return false;
  const uris = Array.isArray(client.redirect_uris) ? client.redirect_uris : [];
  if (!client.cimd) return uris.includes(redirectUri);
  if (encoder.encode(redirectUri).byteLength > MAX_REDIRECT_URI_BYTES) return false;
  const entry = trustedEntry(client.client_id);
  if (!entry) return false;
  if (entry.redirectUris && !entry.redirectUris.includes(redirectUri)) return false;
  let u;
  try {
    u = new URL(redirectUri);
  } catch {
    return false;
  }
  if (u.username || u.password || u.hash) return false;
  if (u.protocol !== "https:" && !isLoopbackHttp(u)) return false;
  if (uris.includes(redirectUri)) return true;
  if (!isLoopbackHttp(u)) return false;
  return uris.some((registered) => {
    let r;
    try {
      r = new URL(registered);
    } catch {
      return false;
    }
    return isLoopbackHttp(r) && r.hostname === u.hostname && r.pathname === u.pathname && r.search === u.search;
  });
}
function describeClientFailure(result) {
  if (result.reason === "storage_unavailable") return "Authorization service is temporarily unavailable. Please try again shortly.";
  if (result.transient) return "The client could not be verified right now. Please try again shortly.";
  if (result.reason === "unknown_client") return "The client_id is not registered or has expired. Please re-register the client.";
  if (result.reason === "untrusted_client_id") return "This client_id URL is not on the list of MCP clients WorldMonitor accepts.";
  return "The client metadata document for this client_id is invalid.";
}

// api/oauth/authorize-pro.ts
var config = { runtime: "edge" };
var CODE_TTL_SECONDS = 600;
var PAGE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "X-Frame-Options": "DENY",
  "Cache-Control": "no-store",
  Pragma: "no-cache"
};
var GLOBE_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;");
}
function htmlError(title, detail, status = 400, extraHeaders = {}) {
  return new Response(
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Error &#x2014; WorldMonitor MCP</title>
<style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:ui-monospace,'SF Mono','Cascadia Code',monospace;background:#0a0a0a;color:#e8e8e8;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1.5rem}.wm-logo{display:flex;align-items:center;gap:.5rem;margin-bottom:2rem;text-decoration:none}.wm-logo svg{color:#2d8a6e}.wm-logo-text{font-size:.75rem;color:#555;letter-spacing:.1em;text-transform:uppercase}.card{width:100%;max-width:420px;background:#111;border:1px solid #1e1e1e;padding:2rem}h1{font-size:.95rem;font-weight:600;color:#ef4444;margin-bottom:.75rem;letter-spacing:.02em}p{font-size:.85rem;color:#666;line-height:1.6}.back{display:inline-block;margin-top:1.5rem;font-size:.75rem;color:#444;text-decoration:none;letter-spacing:.03em}.back:hover{color:#888}.footer{margin-top:1.5rem;font-size:.7rem;color:#2a2a2a;text-align:center}.footer a{color:#333;text-decoration:none}.footer a:hover{color:#555}</style></head>
<body><a href="https://www.worldmonitor.app" class="wm-logo" target="_blank" rel="noopener">${GLOBE_SVG}<span class="wm-logo-text">WorldMonitor MCP</span></a>
<div class="card"><h1>${escapeHtml(title)}</h1><p>${escapeHtml(detail)}</p><a href="#" id="back" class="back">&#8592; go back</a></div>
<script>document.getElementById('back').addEventListener('click',function(e){e.preventDefault();history.back();});</script>
<p class="footer"><a href="https://www.worldmonitor.app" target="_blank" rel="noopener">worldmonitor.app</a></p>
</body></html>`,
    { status, headers: { ...PAGE_HEADERS, ...extraHeaders } }
  );
}
function proRequiredPage() {
  return htmlError(
    "Pro Subscription Required",
    "A WorldMonitor Pro subscription is required for this connection. Please subscribe and try again.",
    403
  );
}
function billingVerificationPage(denial) {
  const headers = { "X-Billing-Verification": denial.code };
  if (!denial.retryable) {
    return htmlError(
      "Subscription Lapsed",
      "Your WorldMonitor Pro subscription is no longer active, so this connection cannot be authorized. Renew your subscription at worldmonitor.app, then start the connection again from your MCP client.",
      403,
      headers
    );
  }
  headers["Retry-After"] = String(denial.retryAfterSeconds);
  return htmlError(
    "Verifying Your Subscription",
    `We could not confirm your WorldMonitor Pro subscription just now \u2014 this is temporary and does not mean your subscription has a problem. Wait about ${denial.retryAfterSeconds} seconds, then start the connection again from your MCP client. (This authorization session is single-use, so it has to be restarted rather than reloaded.)`,
    503,
    headers
  );
}
async function rawRedisGetDel(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis not configured");
  const resp = await fetch(`${url}/getdel/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(3e3)
  });
  if (!resp.ok) throw new Error(`Redis HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data?.result) return null;
  try {
    return JSON.parse(data.result);
  } catch {
    return null;
  }
}
async function rawRedisGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis not configured");
  const resp = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(3e3)
  });
  if (!resp.ok) throw new Error(`Redis HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data?.result) return null;
  try {
    return JSON.parse(data.result);
  } catch {
    return null;
  }
}
async function rawRedisSetEx(key, value, ttlSeconds) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return false;
  try {
    const resp = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["SET", key, JSON.stringify(value), "EX", ttlSeconds]]),
      signal: AbortSignal.timeout(3e3)
    });
    if (!resp.ok) return false;
    const results = await resp.json().catch(() => null);
    return Array.isArray(results) && results[0]?.result === "OK";
  } catch {
    return false;
  }
}
async function authorizeProHandler(req, deps) {
  if (req.method !== "GET") {
    return new Response(null, {
      status: 405,
      headers: { Allow: "GET", "Cache-Control": "no-store" }
    });
  }
  const url = new URL(req.url);
  const nonce = url.searchParams.get("nonce") ?? "";
  const grantToken = url.searchParams.get("grant") ?? "";
  if (!nonce || !grantToken) {
    return htmlError(
      "Invalid Authorization Request",
      "The authorization link is missing required parameters. Please start over from your dashboard."
    );
  }
  let verifyResult;
  try {
    verifyResult = await deps.verifyGrant(grantToken, void 0, deps.now());
  } catch (err) {
    if (err instanceof GrantConfigError) {
      console.warn("[authorize-pro] missing MCP_PRO_GRANT_HMAC_SECRET");
      return htmlError(
        "Service Unavailable",
        "Pro MCP authorization is temporarily unavailable. Please try again shortly.",
        500
      );
    }
    throw err;
  }
  if (!verifyResult.ok) {
    return htmlError(
      "Authorization Expired",
      "This authorization link is no longer valid. Please start over from your dashboard."
    );
  }
  const grantPayload = verifyResult.payload;
  if (grantPayload.nonce !== nonce) {
    return htmlError(
      "Authorization Mismatch",
      "This authorization link is no longer valid. Please start over from your dashboard."
    );
  }
  let preResolved = null;
  let peeked = null;
  try {
    peeked = await deps.redisGet(`oauth:nonce:${nonce}`);
  } catch {
    return htmlError(
      "Service Unavailable",
      "Authorization service is temporarily unavailable. Please try again shortly.",
      503
    );
  }
  if (peeked && typeof peeked.client_id === "string" && isClientMetadataDocumentId(peeked.client_id)) {
    const early = await resolveOAuthClient(peeked.client_id, {
      redisGet: deps.redisGet,
      redisSetEx: deps.redisSetEx,
      fetch: deps.fetchClientMetadata
    });
    if (!early.ok && early.transient) {
      return htmlError("Service Unavailable", describeClientFailure(early), 503);
    }
    preResolved = { clientId: peeked.client_id, result: early };
  }
  let grantRedis;
  try {
    grantRedis = await deps.redisGetDel(`mcp-grant:${nonce}`);
  } catch {
    return htmlError(
      "Service Unavailable",
      "Authorization service is temporarily unavailable. Please try again shortly.",
      503
    );
  }
  if (!grantRedis || typeof grantRedis.userId !== "string" || typeof grantRedis.exp !== "number") {
    return htmlError(
      "Authorization Expired",
      "This authorization link is no longer valid. Please start over from your dashboard."
    );
  }
  if (grantRedis.userId !== grantPayload.userId || grantRedis.exp !== grantPayload.exp) {
    return htmlError(
      "Authorization Mismatch",
      "This authorization link is no longer valid. Please start over from your dashboard."
    );
  }
  const userId = grantPayload.userId;
  let nonceData;
  try {
    nonceData = await deps.redisGetDel(`oauth:nonce:${nonce}`);
  } catch {
    return htmlError(
      "Service Unavailable",
      "Authorization service is temporarily unavailable. Please try again shortly.",
      503
    );
  }
  if (!nonceData || typeof nonceData.client_id !== "string" || typeof nonceData.redirect_uri !== "string" || typeof nonceData.code_challenge !== "string") {
    return htmlError(
      "Session Expired",
      "Your authorization session has expired. Please start over from your dashboard."
    );
  }
  const { client_id, redirect_uri, code_challenge } = nonceData;
  const state = typeof nonceData.state === "string" ? nonceData.state : "";
  const resolved = preResolved && preResolved.clientId === client_id ? preResolved.result : await resolveOAuthClient(client_id, {
    redisGet: deps.redisGet,
    redisSetEx: deps.redisSetEx,
    fetch: deps.fetchClientMetadata
  });
  if (!resolved.ok) {
    if (resolved.transient) {
      return htmlError("Service Unavailable", describeClientFailure(resolved), 503);
    }
    return htmlError(
      "Unknown Client",
      resolved.reason === "unknown_client" ? "The OAuth client registration has expired. Please re-register the client." : describeClientFailure(resolved)
    );
  }
  const clientData = resolved.client;
  if (!clientAllowsRedirectUri(clientData, redirect_uri)) {
    return htmlError(
      "Redirect URI Mismatch",
      "The redirect_uri does not match any registered redirect URI for this client."
    );
  }
  const ent = await deps.getEntitlements(userId);
  const gate = checkProMcpAccess(ent, deps.now(), {
    backendConfigured: isEntitlementBackendConfigured()
  });
  if (gate && gate.kind !== "free_account") {
    if (gate.kind === "billing_verification") {
      return billingVerificationPage(gate.denial);
    }
    return proRequiredPage();
  }
  let issueResult;
  try {
    issueResult = await deps.issueProMcpTokenForUser(userId, client_id, mcpGrantName(clientData.client_name));
  } catch (err) {
    if (err instanceof ProMcpIssueFailed) {
      if (err.kind === "pro-required") {
        return proRequiredPage();
      }
      if (err.kind === "invalid-user-id") {
        return htmlError(
          "Authorization Failed",
          "Could not complete authorization. Please sign out, sign in again, and try again.",
          400
        );
      }
      if (err.kind === "config") {
        console.warn("[authorize-pro] Convex config missing for issue helper");
        return htmlError(
          "Service Unavailable",
          "Pro MCP authorization is temporarily unavailable. Please try again shortly.",
          500
        );
      }
      return htmlError(
        "Service Unavailable",
        "Pro MCP authorization is temporarily unavailable. Please try again shortly.",
        503
      );
    }
    throw err;
  }
  const code = deps.randomCode();
  const codeData = {
    kind: "pro",
    userId,
    mcpTokenId: issueResult.tokenId,
    client_id,
    redirect_uri,
    code_challenge,
    scope: "mcp_pro"
  };
  let codeStored = false;
  try {
    codeStored = await deps.redisSetEx(`oauth:code:${code}`, codeData, CODE_TTL_SECONDS);
  } catch {
    codeStored = false;
  }
  if (!codeStored) {
    try {
      const rollback = await deps.revokeProMcpToken(userId, issueResult.tokenId);
      if (!rollback.ok) {
        console.warn(
          `[authorize-pro] orphaned mcpProTokens row ${issueResult.tokenId} for user ${userId}: revoke failed (${rollback.reason})`
        );
      }
    } catch (err) {
      console.warn(
        `[authorize-pro] revoke rollback unexpectedly threw for token ${issueResult.tokenId}:`,
        err instanceof Error ? err.message : String(err)
      );
      captureSilentError(err, {
        tags: { route: "api/oauth/authorize-pro", step: "rollback-revoke" },
        fingerprint: ["api/oauth/authorize-pro", "rollback-revoke", err instanceof Error ? err.name : "Error"]
      });
    }
    return htmlError(
      "Server Error",
      "Failed to store authorization code. Please try again.",
      500
    );
  }
  const redirectUrl = new URL(redirect_uri);
  redirectUrl.searchParams.set("code", code);
  if (state) redirectUrl.searchParams.set("state", state);
  if (typeof nonceData.iss === "string" && nonceData.iss) {
    redirectUrl.searchParams.set("iss", nonceData.iss);
  }
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectUrl.toString(),
      "Cache-Control": "no-store",
      Pragma: "no-cache"
    }
  });
}
async function handler(req) {
  return authorizeProHandler(req, {
    redisGetDel: rawRedisGetDel,
    redisGet: rawRedisGet,
    redisSetEx: rawRedisSetEx,
    verifyGrant,
    getEntitlements,
    issueProMcpTokenForUser,
    revokeProMcpToken,
    randomCode: () => crypto.randomUUID(),
    now: () => Date.now()
  });
}
export {
  authorizeProHandler,
  config,
  handler as default
};
