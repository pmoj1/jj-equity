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
var init_seed_envelope = __esm({
  "server/_shared/seed-envelope.ts"() {
    "use strict";
  }
});

// server/_shared/cache-contract.ts
function isRecord(value) {
  return value != null && typeof value === "object" && !Array.isArray(value);
}
function nonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}
function getRpcNoStoreReasonFromPayload(payload, options = {}) {
  if (!isRecord(payload)) return null;
  if (payload.upstreamUnavailable === true) return "upstream-unavailable";
  if (payload.unavailable === true) return "unavailable";
  if (payload.dataAvailable === false) return "data-unavailable";
  if (payload.degraded === true) return "degraded";
  if (options.includeAvailableFalse !== false && payload.available === false) return "available-false";
  if (nonEmptyString(payload.error)) return "error";
  if (options.pathname === "/api/displacement/v1/get-cross-border-movements" && Array.isArray(payload.sources) && payload.sources.some((source) => isRecord(source) && source.status !== "ok")) return "degraded";
  if (options.pathname === SCENARIO_STATUS_PATH && nonEmptyString(payload.status)) {
    const status = payload.status.trim().toLowerCase();
    if (!SCENARIO_TERMINAL_STATUSES.has(status)) return "nonterminal";
  }
  return null;
}
function getRpcNoStoreReasonFromJson(body, options = {}) {
  try {
    return getRpcNoStoreReasonFromPayload(JSON.parse(body), options);
  } catch {
    if (body.includes('"upstreamUnavailable":true')) return "upstream-unavailable";
    if (body.includes('"unavailable":true')) return "unavailable";
    if (body.includes('"dataAvailable":false')) return "data-unavailable";
    if (body.includes('"degraded":true')) return "degraded";
    if (options.includeAvailableFalse !== false && body.includes('"available":false')) return "available-false";
    return null;
  }
}
var SCENARIO_STATUS_PATH, SCENARIO_TERMINAL_STATUSES;
var init_cache_contract = __esm({
  "server/_shared/cache-contract.ts"() {
    "use strict";
    SCENARIO_STATUS_PATH = "/api/scenario/v1/get-scenario-status";
    SCENARIO_TERMINAL_STATUSES = /* @__PURE__ */ new Set(["done", "failed"]);
  }
});

// server/_shared/client-ip.ts
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
function isInIpv4Range(address, network, prefixLength) {
  const mask = 4294967295 << 32 - prefixLength >>> 0;
  return (address & mask) >>> 0 === (network & mask) >>> 0;
}
function isInIpv6Range(address, network, prefixLength) {
  const fullGroups = Math.floor(prefixLength / 16);
  for (let i = 0; i < fullGroups; i += 1) {
    if (address[i] !== network[i]) return false;
  }
  const remainingBits = prefixLength % 16;
  if (remainingBits === 0) return true;
  const mask = 65535 << 16 - remainingBits & 65535;
  return (address[fullGroups] & mask) === (network[fullGroups] & mask);
}
function isCloudflareProxyIp(value) {
  const ipv4 = parseIpv4(value);
  if (ipv4 !== null) {
    return CLOUDFLARE_IPV4_RANGES.some(([network, prefix]) => isInIpv4Range(ipv4, network, prefix));
  }
  const ipv6 = parseIpv6(value);
  return ipv6 !== null && CLOUDFLARE_IPV6_RANGES.some(([network, prefix]) => isInIpv6Range(ipv6, network, prefix));
}
function constantTimeEqual(a, b) {
  const len = b.length;
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i += 1) diff |= (a.charCodeAt(i) || 0) ^ b.charCodeAt(i);
  return diff === 0;
}
function hasCloudflareTransitProof(request) {
  const secret = (process.env.CF_EDGE_PROOF_SECRET ?? "").trim();
  if (!secret) return false;
  return constantTimeEqual((request.headers.get(CF_EDGE_PROOF_HEADER) ?? "").trim(), secret);
}
function hasUnprovenCloudflareClientIp(request) {
  const secret = (process.env.CF_EDGE_PROOF_SECRET ?? "").trim();
  if (!secret) return false;
  const cf = (request.headers.get("cf-connecting-ip") ?? "").trim();
  if (!cf) return false;
  return !hasCloudflareTransitProof(request);
}
function getEdgeProofMismatchLatch() {
  const existing = Reflect.get(globalThis, EDGE_PROOF_MISMATCH_LATCH);
  if (existing) return existing;
  const latch = { warned: false };
  Reflect.set(globalThis, EDGE_PROOF_MISMATCH_LATCH, latch);
  return latch;
}
function warnEdgeProofNotProving() {
  const latch = getEdgeProofMismatchLatch();
  if (latch.warned) return;
  latch.warned = true;
  console.warn(
    "[client-ip] cf-connecting-ip present but x-wm-edge-proof missing/mismatched \u2014 rate-limit buckets keyed by Cloudflare PoP (x-real-ip), not per user. Fix CF_EDGE_PROOF_SECRET or the Cloudflare header transform rule. Issue #6431"
  );
}
function getClientIp(request) {
  const cf = (request.headers.get("cf-connecting-ip") ?? "").trim();
  const xr = (request.headers.get("x-real-ip") ?? "").trim();
  if (cf && hasCloudflareTransitProof(request)) return cf;
  if (cf && isCloudflareProxyIp(xr)) warnEdgeProofNotProving();
  return xr || UNKNOWN_CLIENT_IP;
}
function rateLimitKeyForIp(ip) {
  if (!ip.includes(":")) return ip;
  let addr = (ip.split("%")[0] ?? ip).toLowerCase();
  const v4Tail = addr.match(/^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4Tail) {
    const octets = v4Tail[2].split(".").map(Number);
    if (octets.some((n) => n > 255)) return ip;
    const [a = 0, b = 0, c = 0, d = 0] = octets;
    addr = `${v4Tail[1]}${(a << 8 | b).toString(16)}:${(c << 8 | d).toString(16)}`;
  }
  const halves = addr.split("::");
  if (halves.length > 2) return ip;
  const head = halves[0] ? halves[0].split(":") : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(":") : [];
  const missing = 8 - head.length - tail.length;
  if (halves.length === 1 ? missing !== 0 : missing < 1) return ip;
  const groups = [...head, ...new Array(halves.length === 2 ? missing : 0).fill("0"), ...tail];
  if (!groups.every((g) => /^[0-9a-f]{1,4}$/.test(g))) return ip;
  const nums = groups.map((g) => parseInt(g, 16));
  if (nums.slice(0, 5).every((n) => n === 0) && nums[5] === 65535) {
    const hi = nums[6];
    const lo = nums[7];
    return `${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`;
  }
  return `${groups.slice(0, 4).map((g) => parseInt(g, 16).toString(16)).join(":")}::/64`;
}
function getClientRateLimitKey(request) {
  return rateLimitKeyForIp(getClientIp(request));
}
var UNKNOWN_CLIENT_IP, CF_EDGE_PROOF_HEADER, CLOUDFLARE_IPV4_CIDRS, CLOUDFLARE_IPV6_CIDRS, CLOUDFLARE_IPV4_RANGES, CLOUDFLARE_IPV6_RANGES, EDGE_PROOF_MISMATCH_LATCH;
var init_client_ip = __esm({
  "server/_shared/client-ip.ts"() {
    "use strict";
    UNKNOWN_CLIENT_IP = "unknown";
    CF_EDGE_PROOF_HEADER = "x-wm-edge-proof";
    CLOUDFLARE_IPV4_CIDRS = Object.freeze([
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
    CLOUDFLARE_IPV6_CIDRS = Object.freeze([
      "2400:cb00::/32",
      "2606:4700::/32",
      "2803:f800::/32",
      "2405:b500::/32",
      "2405:8100::/32",
      "2a06:98c0::/29",
      "2c0f:f248::/32"
    ]);
    CLOUDFLARE_IPV4_RANGES = Object.freeze(CLOUDFLARE_IPV4_CIDRS.map(parseIpv4Cidr));
    CLOUDFLARE_IPV6_RANGES = Object.freeze(CLOUDFLARE_IPV6_CIDRS.map(parseIpv6Cidr));
    EDGE_PROOF_MISMATCH_LATCH = /* @__PURE__ */ Symbol.for(
      "worldmonitor.client-ip.edge-proof-mismatch-warning.v1"
    );
  }
});

// server/_shared/usage.ts
function isUsageEnabled() {
  return process.env.USAGE_TELEMETRY === "1";
}
function isDevHeaderEnabled() {
  return process.env.NODE_ENV !== "production";
}
function buildRequestEvent(p) {
  return {
    _time: (/* @__PURE__ */ new Date()).toISOString(),
    event_type: "request",
    request_id: p.requestId,
    domain: p.domain,
    route: p.route,
    method: p.method,
    status: p.status,
    duration_ms: p.durationMs,
    req_bytes: p.reqBytes,
    res_bytes: p.resBytes,
    customer_id: p.customerId,
    principal_id: p.principalId,
    auth_kind: p.authKind,
    tier: p.tier,
    plan_key: p.planKey,
    country: p.country,
    ip_city: p.ipCity,
    ip_region: p.ipRegion,
    execution_region: p.executionRegion,
    execution_plane: p.executionPlane,
    origin_kind: p.originKind,
    cache_tier: p.cacheTier,
    ip: p.ip,
    user_agent: p.userAgent,
    ua_hash: p.uaHash,
    referer: p.referer,
    accept_language: p.acceptLanguage,
    host: p.host,
    sentry_trace_id: p.sentryTraceId,
    reason: p.reason,
    rpc_method: p.rpcMethod ?? null,
    tool_name: p.toolName ?? null,
    requested_tool: p.requestedTool ?? null,
    tool_error_kind: p.toolErrorKind ?? null,
    tool_result_bytes: p.toolResultBytes ?? null,
    tool_jmespath: p.toolJmespath ?? null,
    mcp_protocol_version: p.mcpProtocolVersion ?? null,
    mcp_era: p.mcpEra ?? null
  };
}
function buildUpstreamEvent(p) {
  return {
    _time: (/* @__PURE__ */ new Date()).toISOString(),
    event_type: "upstream",
    request_id: p.requestId,
    customer_id: p.customerId,
    route: p.route,
    tier: p.tier,
    provider: p.provider,
    operation: p.operation,
    host: p.host,
    status: p.status,
    duration_ms: p.durationMs,
    request_bytes: p.requestBytes,
    response_bytes: p.responseBytes,
    cache_status: p.cacheStatus
  };
}
function capHeaderValue(s2) {
  if (s2 == null) return null;
  return s2.length > MAX_HEADER_FIELD_LEN ? s2.slice(0, MAX_HEADER_FIELD_LEN) : s2;
}
function deriveRequestId(req) {
  return req.headers.get("x-vercel-id") ?? "";
}
function deriveExecutionRegion(req) {
  const id = req.headers.get("x-vercel-id");
  if (!id) return null;
  const sep = id.indexOf("::");
  return sep > 0 ? id.slice(0, sep) : null;
}
function deriveCountry(req) {
  if (hasCloudflareTransitProof(req)) {
    const country = req.headers.get("cf-ipcountry");
    return (country && country !== "T1" ? country : null) ?? req.headers.get("x-vercel-ip-country") ?? null;
  }
  return req.headers.get("x-vercel-ip-country") ?? null;
}
function deriveIpCity(req) {
  const raw = req.headers.get("x-vercel-ip-city");
  if (!raw) return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}
function deriveIpRegion(req) {
  return req.headers.get("x-vercel-ip-country-region") ?? null;
}
function deriveIp(req) {
  const ip = getClientIp(req);
  return ip === UNKNOWN_CLIENT_IP ? null : ip;
}
function deriveUserAgent(req) {
  return capHeaderValue(req.headers.get("user-agent"));
}
function deriveReferer(req) {
  const raw = req.headers.get("referer");
  if (!raw) return null;
  try {
    const u = new URL(raw);
    return capHeaderValue(`${u.origin}${u.pathname}`);
  } catch {
    return null;
  }
}
function deriveAcceptLanguage(req) {
  return capHeaderValue(req.headers.get("accept-language"));
}
function deriveHost(req) {
  return capHeaderValue(req.headers.get("host"));
}
function deriveReqBytes(req) {
  const len = req.headers.get("content-length");
  if (!len) return 0;
  const n = Number(len);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
function deriveSentryTraceId(req) {
  return capHeaderValue(req.headers.get("sentry-trace"));
}
async function deriveUaHash(req) {
  const pepper = process.env.USAGE_UA_PEPPER;
  if (!pepper) return null;
  const ua = req.headers.get("user-agent") ?? "";
  if (!ua) return null;
  const data = new TextEncoder().encode(`${pepper}|${ua}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
function deriveOriginKind(req) {
  const origin = req.headers.get("origin") ?? "";
  const hasApiKey = req.headers.has("x-worldmonitor-key") || req.headers.has("x-api-key");
  const hasBearer = (req.headers.get("authorization") ?? "").startsWith("Bearer ");
  if (hasApiKey) return "api-key";
  if (hasBearer) return "oauth";
  if (!origin) return null;
  try {
    const host = new URL(origin).host;
    const reqHost = new URL(req.url).host;
    return host === reqHost ? "browser-same-origin" : "browser-cross-origin";
  } catch {
    return "browser-cross-origin";
  }
}
function pruneOldSamples(now) {
  while (breakerSamples.length > 0 && now - breakerSamples[0].ts > CB_WINDOW_MS) {
    breakerSamples.shift();
  }
}
function recordSample(ok) {
  const now = Date.now();
  pruneOldSamples(now);
  breakerSamples.push({ ts: now, ok });
  if (breakerSamples.length < CB_MIN_SAMPLES) {
    breakerTripped = false;
    return;
  }
  let failures = 0;
  for (const s2 of breakerSamples) if (!s2.ok) failures++;
  const ratio = failures / breakerSamples.length;
  const wasTripped = breakerTripped;
  breakerTripped = ratio > CB_TRIP_FAILURE_RATIO;
  if (breakerTripped && !wasTripped && now - breakerLastNotifyTs > CB_WINDOW_MS) {
    breakerLastNotifyTs = now;
    console.error("[usage-telemetry] circuit breaker tripped", {
      ratio: ratio.toFixed(3),
      samples: breakerSamples.length
    });
  }
}
function getTelemetryHealth() {
  if (!isUsageEnabled()) return "off";
  return breakerTripped ? "degraded" : "ok";
}
function maybeAttachDevHealthHeader(headers) {
  if (!isDevHeaderEnabled()) return;
  headers.set("x-usage-telemetry", getTelemetryHealth());
}
async function getScopeStore() {
  if (scopeStore) return scopeStore;
  try {
    const mod = await import("node:async_hooks");
    scopeStore = new mod.AsyncLocalStorage();
    return scopeStore;
  } catch {
    return null;
  }
}
async function runWithUsageScope(scope, fn) {
  const store2 = await getScopeStore();
  if (!store2) return fn();
  return store2.run(scope, fn);
}
function getUsageScope() {
  return scopeStore?.getStore();
}
async function sendToAxiom(events) {
  if (!isUsageEnabled()) return;
  if (events.length === 0) return;
  const token = process.env.AXIOM_API_TOKEN;
  if (!token) {
    if (Math.random() < SAMPLED_DROP_LOG_RATE) {
      console.warn("[usage-telemetry] drop", { reason: "no-token" });
    }
    return;
  }
  if (breakerTripped) {
    if (Math.random() < SAMPLED_DROP_LOG_RATE) {
      console.warn("[usage-telemetry] drop", { reason: "breaker-open" });
    }
    return;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TELEMETRY_TIMEOUT_MS);
  try {
    const resp = await fetch(AXIOM_INGEST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(events),
      signal: controller.signal
    });
    if (!resp.ok) {
      recordSample(false);
      if (Math.random() < SAMPLED_DROP_LOG_RATE) {
        console.warn("[usage-telemetry] drop", { reason: `http-${resp.status}` });
      }
      return;
    }
    recordSample(true);
  } catch (err) {
    recordSample(false);
    if (Math.random() < SAMPLED_DROP_LOG_RATE) {
      const reason = err instanceof Error && err.name === "AbortError" ? "timeout" : "fetch-error";
      console.warn("[usage-telemetry] drop", { reason });
    }
  } finally {
    clearTimeout(timer);
  }
}
function deliverUsageEvents(events) {
  if (!isUsageEnabled() || events.length === 0) return Promise.resolve();
  return sendToAxiom(events);
}
var AXIOM_DATASET, AXIOM_INGEST_URL, TELEMETRY_TIMEOUT_MS, CB_WINDOW_MS, CB_TRIP_FAILURE_RATIO, CB_MIN_SAMPLES, SAMPLED_DROP_LOG_RATE, MAX_HEADER_FIELD_LEN, breakerSamples, breakerTripped, breakerLastNotifyTs, scopeStore;
var init_usage = __esm({
  "server/_shared/usage.ts"() {
    "use strict";
    init_client_ip();
    AXIOM_DATASET = "wm_api_usage";
    AXIOM_INGEST_URL = `https://api.axiom.co/v1/datasets/${AXIOM_DATASET}/ingest`;
    TELEMETRY_TIMEOUT_MS = 1500;
    CB_WINDOW_MS = 5 * 60 * 1e3;
    CB_TRIP_FAILURE_RATIO = 0.05;
    CB_MIN_SAMPLES = 20;
    SAMPLED_DROP_LOG_RATE = 0.01;
    MAX_HEADER_FIELD_LEN = 512;
    breakerSamples = [];
    breakerTripped = false;
    breakerLastNotifyTs = 0;
    scopeStore = null;
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

// server/_shared/redis.ts
function parseTimeoutEnv(raw, defaultMs) {
  const parsed = Number.parseInt(raw ?? "", 10);
  return parsed > 0 ? parsed : defaultMs;
}
function errMsg(err) {
  return err instanceof Error ? err.message : String(err);
}
function hasRemoteRedisConfig() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
function getKeyPrefix() {
  const env = process.env.VERCEL_ENV;
  if (!env || env === "production") return "";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "dev";
  return `${env}:${sha}:`;
}
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
function evictOldestLocalFallbackEntries(map) {
  while (map.size > LOCAL_FALLBACK_MAX_ENTRIES) {
    const oldestKey = map.keys().next().value;
    if (oldestKey === void 0) return;
    map.delete(oldestKey);
  }
}
function effectiveFetchErrorNegativeTtlSeconds(negativeTtlSeconds) {
  return Math.max(1, Math.min(negativeTtlSeconds, FETCH_ERROR_NEGATIVE_TTL_SECONDS));
}
function armLocalNegativeCooldown(key, ttlSeconds) {
  localNegativeUntil.set(key, Date.now() + ttlSeconds * 1e3);
  evictOldestLocalFallbackEntries(localNegativeUntil);
}
function hasLocalNegativeCooldown(key) {
  const expiresAt = localNegativeUntil.get(key);
  if (expiresAt === void 0) return false;
  if (expiresAt > Date.now()) return true;
  localNegativeUntil.delete(key);
  return false;
}
function armLocalUnavailableBackoff(key, ttlSeconds) {
  localUnavailableUntil.set(key, Date.now() + ttlSeconds * 1e3);
  evictOldestLocalFallbackEntries(localUnavailableUntil);
}
function hasLocalUnavailableBackoff(key) {
  const expiresAt = localUnavailableUntil.get(key);
  if (expiresAt === void 0) return false;
  if (expiresAt > Date.now()) return true;
  localUnavailableUntil.delete(key);
  return false;
}
function effectiveRedisFailurePositiveTtlSeconds(ttlSeconds) {
  return Math.max(1, Math.min(ttlSeconds, REDIS_FAILURE_POSITIVE_TTL_SECONDS));
}
function armLocalPositiveFallback(key, value, ttlSeconds) {
  const effectiveTtlSeconds = effectiveRedisFailurePositiveTtlSeconds(ttlSeconds);
  localPositiveFallback.set(key, {
    value,
    expiresAt: Date.now() + effectiveTtlSeconds * 1e3
  });
  evictOldestLocalFallbackEntries(localPositiveFallback);
}
function readLocalPositiveFallback(key) {
  const cached = localPositiveFallback.get(key);
  if (cached === void 0) return void 0;
  if (cached.expiresAt > Date.now()) return cached.value;
  localPositiveFallback.delete(key);
  return void 0;
}
function normalizePipelineCommand(command, raw) {
  if (raw || command.length < 2) return [...command];
  const [verb, key, ...rest] = command;
  if (typeof verb !== "string" || typeof key !== "string") return [...command];
  if (verb.toUpperCase() === "EVAL") {
    const keyCount = Number(rest[0]);
    if (!Number.isInteger(keyCount) || keyCount < 0 || rest.length < keyCount + 1) return [...command];
    const keys = rest.slice(1, keyCount + 1).map((item) => typeof item === "string" ? prefixKey(item) : item);
    return [verb, key, rest[0], ...keys, ...rest.slice(keyCount + 1)];
  }
  return [verb, prefixKey(key), ...rest];
}
function resolvePipelineTimeoutMs(timeoutMs) {
  if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    return REDIS_PIPELINE_TIMEOUT_MS;
  }
  return Math.min(REDIS_PIPELINE_TIMEOUT_MS, Math.max(1, Math.ceil(timeoutMs)));
}
async function runRedisPipeline(commands, raw = false, timeoutMs) {
  if (process.env.LOCAL_API_MODE === "tauri-sidecar") return [];
  if (commands.length === 0) return [];
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return [];
  try {
    const response = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commands.map((command) => normalizePipelineCommand(command, raw))),
      signal: AbortSignal.timeout(resolvePipelineTimeoutMs(timeoutMs))
    });
    if (!response.ok) {
      console.warn(`[redis] runRedisPipeline HTTP ${response.status}`);
      return [];
    }
    return await response.json();
  } catch (err) {
    console.warn("[redis] runRedisPipeline failed:", errMsg(err));
    return [];
  }
}
function withFetcherTimeout(promise, key, timeoutMs, callerName) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new CachedFetchTimeoutError(`${callerName} timeout after ${timeoutMs}ms for "${key}"`));
    }, timeoutMs);
  });
  return Promise.race([promise, timeout]).finally(() => {
    if (timer !== void 0) clearTimeout(timer);
  });
}
async function cachedFetchJson(key, ttlSeconds, fetcher, negativeTtlSeconds = 120, opts) {
  const coreOpts = opts === void 0 ? void 0 : {
    timeoutMs: opts.timeoutMs,
    cacheFetcherErrors: opts.cacheFetcherErrors,
    cacheUpstreamUnavailablePayloads: opts.cacheUpstreamUnavailablePayloads
  };
  const result = await cachedFetchJsonCore(key, ttlSeconds, fetcher, negativeTtlSeconds, coreOpts, "cachedFetchJson");
  return result.data;
}
async function cachedFetchJsonWithMeta(key, ttlSeconds, fetcher, negativeTtlSeconds = 120, opts) {
  return cachedFetchJsonCore(key, ttlSeconds, fetcher, negativeTtlSeconds, opts, "cachedFetchJsonWithMeta");
}
async function cachedFetchJsonCore(key, ttlSeconds, fetcher, negativeTtlSeconds, opts, callerName) {
  const cached = await readCachedJson(key);
  if (cached.status === "hit") {
    if (cached.value === NEG_SENTINEL) return { data: null, source: "cache", leader: false };
    return { data: cached.value, source: "cache", leader: false };
  }
  const localPositive = readLocalPositiveFallback(key);
  if (localPositive !== void 0) return { data: localPositive, source: "cache", leader: false };
  const hadCacheReadError = cached.status === "error";
  if (cached.status === "error") {
    logCacheReadError(key, cached.error);
    if (hasLocalNegativeCooldown(key)) return { data: null, source: "cache", leader: false };
  }
  if (hasLocalUnavailableBackoff(key)) {
    throw new Error(`${callerName} unavailable backoff active for "${key}"`);
  }
  const inflightKey = opts?.inflightKey ?? key;
  const shouldFetch = opts?.shouldFetch;
  let admissionChecked = shouldFetch == null;
  while (true) {
    const existing = inflight.get(inflightKey);
    if (existing) {
      try {
        const data2 = await existing;
        return { data: data2, source: "fresh", leader: false };
      } catch (error) {
        if (!opts?.isCallerLocalError?.(error)) throw error;
        continue;
      }
    }
    if (!admissionChecked) {
      admissionChecked = true;
      if (!await shouldFetch()) return { data: null, source: "skipped", leader: false };
      continue;
    }
    break;
  }
  const fetchT0 = Date.now();
  let upstreamStatus = 0;
  let cacheStatus = "miss";
  const timeoutMs = opts?.timeoutMs ?? fetcherTimeoutDefaultMs;
  const promise = withFetcherTimeout(fetcher(), key, timeoutMs, callerName).then(async (result) => {
    if (result != null) {
      const noStoreReason = getRpcNoStoreReasonFromPayload(result, { includeAvailableFalse: false });
      const cachePartialUpstreamResult = noStoreReason === "upstream-unavailable" && opts?.cacheUpstreamUnavailablePayloads === true && getRpcNoStoreReasonFromPayload(
        { ...result, upstreamUnavailable: false },
        { includeAvailableFalse: false }
      ) === null;
      if (noStoreReason && !cachePartialUpstreamResult) {
        upstreamStatus = 0;
        if (opts?.cacheFailures !== false) {
          cacheStatus = "neg-sentinel";
          armLocalNegativeCooldown(key, negativeTtlSeconds);
          await setCachedJson(key, NEG_SENTINEL, negativeTtlSeconds);
        }
      } else {
        upstreamStatus = 200;
        const wrote = opts?.cachePositiveResult === false ? true : await setCachedJson(key, result, ttlSeconds);
        if (opts?.cachePositiveResult !== false && (hadCacheReadError || !wrote && hasRemoteRedisConfig())) {
          armLocalPositiveFallback(key, result, ttlSeconds);
        }
        if (opts?.cachePositiveResult === false) await opts.onPositiveResult?.(result);
      }
    } else {
      upstreamStatus = 0;
      if (opts?.cacheFailures !== false) {
        cacheStatus = "neg-sentinel";
        armLocalNegativeCooldown(key, negativeTtlSeconds);
        await setCachedJson(key, NEG_SENTINEL, negativeTtlSeconds);
      }
    }
    return result;
  }).catch(async (err) => {
    upstreamStatus = 0;
    if (opts?.isCallerLocalError?.(err)) {
    } else if (opts?.cacheFailures === false) {
    } else if (opts?.cacheFetcherErrors !== false) {
      cacheStatus = "neg-sentinel";
      const errorTtlSeconds = effectiveFetchErrorNegativeTtlSeconds(negativeTtlSeconds);
      armLocalNegativeCooldown(key, errorTtlSeconds);
      await setCachedJson(key, NEG_SENTINEL, errorTtlSeconds);
      console.warn(`[redis] ${callerName} fetcher failed for "${key}":`, errMsg(err));
    } else {
      armLocalUnavailableBackoff(key, FETCH_ERROR_UNAVAILABLE_BACKOFF_SECONDS);
    }
    throw err;
  }).finally(() => {
    inflight.delete(inflightKey);
  });
  inflight.set(inflightKey, promise);
  let data;
  try {
    data = await promise;
  } finally {
    emitUpstreamFromHook(opts?.usage, upstreamStatus, Date.now() - fetchT0, cacheStatus);
  }
  return { data, source: "fresh", leader: true };
}
function emitUpstreamFromHook(usage, status, durationMs, cacheStatus) {
  if (!usage?.provider) return;
  const scope = getUsageScope();
  const ctx = usage.ctx ?? scope?.ctx;
  if (!ctx) return;
  const event = buildUpstreamEvent({
    requestId: usage.requestId ?? scope?.requestId ?? "",
    customerId: usage.customerId ?? scope?.customerId ?? null,
    route: usage.route ?? scope?.route ?? "",
    tier: usage.tier ?? scope?.tier ?? 0,
    provider: usage.provider,
    operation: usage.operation ?? "fetch",
    host: usage.host ?? "",
    status,
    durationMs,
    requestBytes: 0,
    responseBytes: 0,
    cacheStatus
  });
  try {
    ctx.waitUntil(sendToAxiom([event]));
  } catch {
  }
}
async function getHashFieldsBatch(...args) {
  try {
    return await getHashFieldsBatchStrict(...args);
  } catch (error) {
    logCacheReadError(args[0], error);
    return /* @__PURE__ */ new Map();
  }
}
async function geoSearchByBoxStrict(key, lon, lat, widthKm, heightKm, count, raw = false) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis unavailable");
  const finalKey = raw ? key : prefixKey(key);
  const pipeline = [["GEOSEARCH", finalKey, "FROMLONLAT", String(lon), String(lat), "BYBOX", String(widthKm), String(heightKm), "km", "ASC", "COUNT", String(count)]];
  const resp = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "worldmonitor-server/1.0 (redis)"
    },
    body: JSON.stringify(pipeline),
    signal: AbortSignal.timeout(REDIS_PIPELINE_TIMEOUT_MS)
  });
  if (!resp.ok) throw new Error(`Redis HTTP ${resp.status}`);
  const data = await resp.json();
  if (data[0]?.error || !Array.isArray(data[0]?.result) || !data[0].result.every((value) => typeof value === "string")) throw new Error("Invalid GEOSEARCH result");
  return data[0].result;
}
async function getHashFieldsBatchStrict(key, fields, raw = false, timeoutMs) {
  const result = /* @__PURE__ */ new Map();
  if (fields.length === 0) return result;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis unavailable");
  const finalKey = raw ? key : prefixKey(key);
  const pipeline = [["HMGET", finalKey, ...fields]];
  const resp = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "worldmonitor-server/1.0 (redis)"
    },
    body: JSON.stringify(pipeline),
    signal: AbortSignal.timeout(resolvePipelineTimeoutMs(timeoutMs))
  });
  if (!resp.ok) throw new Error(`Redis HTTP ${resp.status}`);
  const data = await resp.json();
  const values = data[0]?.result;
  if (data[0]?.error || !Array.isArray(values) || values.length !== fields.length || !values.every((value) => value === null || typeof value === "string")) throw new Error("Invalid HMGET result");
  for (let i = 0; i < fields.length; i++) {
    if (values[i] != null) result.set(fields[i], values[i]);
  }
  return result;
}
async function deleteRedisKey(key, raw = false) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    const finalKey = raw ? key : prefixKey(key);
    await fetch(`${url}/del/${encodeURIComponent(finalKey)}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(REDIS_OP_TIMEOUT_MS)
    });
  } catch (err) {
    console.warn("[redis] deleteRedisKey failed:", errMsg(err));
  }
}
var import_compare_and_delete_script, REDIS_OP_TIMEOUT_MS, REDIS_PIPELINE_TIMEOUT_MS, cachedPrefix, NEG_SENTINEL, FETCH_ERROR_NEGATIVE_TTL_SECONDS, FETCH_ERROR_UNAVAILABLE_BACKOFF_SECONDS, REDIS_FAILURE_POSITIVE_TTL_SECONDS, LOCAL_FALLBACK_MAX_ENTRIES, localNegativeUntil, localUnavailableUntil, localPositiveFallback, inflight, FETCHER_TIMEOUT_MS_DEFAULT, fetcherTimeoutDefaultMs, CachedFetchTimeoutError;
var init_redis = __esm({
  "server/_shared/redis.ts"() {
    "use strict";
    import_compare_and_delete_script = __toESM(require_compare_and_delete_script(), 1);
    init_seed_envelope();
    init_cache_contract();
    init_usage();
    REDIS_OP_TIMEOUT_MS = parseTimeoutEnv(process.env.REDIS_OP_TIMEOUT_MS, 1500);
    REDIS_PIPELINE_TIMEOUT_MS = parseTimeoutEnv(process.env.REDIS_PIPELINE_TIMEOUT_MS, 5e3);
    NEG_SENTINEL = "__WM_NEG__";
    FETCH_ERROR_NEGATIVE_TTL_SECONDS = 30;
    FETCH_ERROR_UNAVAILABLE_BACKOFF_SECONDS = 3;
    REDIS_FAILURE_POSITIVE_TTL_SECONDS = 30;
    LOCAL_FALLBACK_MAX_ENTRIES = 5e3;
    localNegativeUntil = /* @__PURE__ */ new Map();
    localUnavailableUntil = /* @__PURE__ */ new Map();
    localPositiveFallback = /* @__PURE__ */ new Map();
    inflight = /* @__PURE__ */ new Map();
    FETCHER_TIMEOUT_MS_DEFAULT = 3e4;
    fetcherTimeoutDefaultMs = FETCHER_TIMEOUT_MS_DEFAULT;
    CachedFetchTimeoutError = class extends Error {
      constructor(message2) {
        super(message2);
        this.name = "CachedFetchTimeoutError";
      }
    };
  }
});

// server/cors.ts
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
function getCorsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  const allowOrigin = isAllowedOrigin(origin) ? origin : "https://worldmonitor.app";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Expose-Headers": EXPOSED_HEADERS,
    "Access-Control-Max-Age": "3600",
    "Vary": "Origin"
  };
}
function getOriginDeniedCorsHeaders(req) {
  const origin = req.headers.get("origin") || "";
  return {
    "Access-Control-Allow-Origin": origin || "https://worldmonitor.app",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
var APP_ORIGIN_PATTERN, MAX_ORIGIN_BYTES, ORIGIN_ENCODER, PRODUCTION_PATTERNS, DEV_PATTERNS, ALLOWED_ORIGIN_PATTERNS, ALLOWED_HEADERS, EXPOSED_HEADERS;
var init_cors = __esm({
  "server/cors.ts"() {
    "use strict";
    APP_ORIGIN_PATTERN = /^https:\/\/(?:(?:www|app|api|tech|finance|commodity|happy|energy)\.)?worldmonitor\.app$/;
    MAX_ORIGIN_BYTES = 300;
    ORIGIN_ENCODER = new TextEncoder();
    PRODUCTION_PATTERNS = [
      APP_ORIGIN_PATTERN,
      // Vercel preview deployments under the "eliewm" team scope, e.g.
      //   worldmonitor-git-<branch>-eliewm.vercel.app  (git-branch alias)
      //   worldmonitor-<hash>-eliewm.vercel.app        (deployment URL)
      // Tight on purpose: never a bare *.vercel.app (this is a security allowlist).
      /^https:\/\/worldmonitor-[a-z0-9-]+-eliewm\.vercel\.app$/,
      /^https?:\/\/tauri\.localhost(:\d+)?$/,
      /^https?:\/\/[a-z0-9-]+\.tauri\.localhost(:\d+)?$/i,
      /^tauri:\/\/localhost$/,
      /^asset:\/\/localhost$/
    ];
    DEV_PATTERNS = [
      /^https?:\/\/localhost(:\d+)?$/,
      /^https?:\/\/127\.0\.0\.1(:\d+)?$/
    ];
    ALLOWED_ORIGIN_PATTERNS = process.env.NODE_ENV === "production" ? PRODUCTION_PATTERNS : [...PRODUCTION_PATTERNS, ...DEV_PATTERNS];
    ALLOWED_HEADERS = [
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
    EXPOSED_HEADERS = [
      "Mcp-Session-Id",
      "WWW-Authenticate",
      "Retry-After",
      "Idempotency-Key",
      "Idempotent-Replayed",
      "Location",
      // See api/_cors.js — the gateway emits this on every billing-verification
      // denial and cross-origin clients could not read it (#5622).
      "X-Billing-Verification",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
      // Fail-open limiter degradation marker. Parity with api/_cors.js (#7270):
      // the Limit/Remaining/Reset triplet is not enough for browser JS to read Mode.
      "X-RateLimit-Mode",
      // api/mcp-proxy marks the 504 it relays for a remote MCP server timeout so
      // premium-fetch's origin-5xx canary can skip it (WORLDMONITOR-17A). Parity
      // with api/_cors.js.
      "X-Wm-Upstream-Timeout",
      // IETF draft-ietf-httpapi-ratelimit-headers fields — emitted by the
      // per-account API-key limiter; docs/usage-rate-limits.mdx tells browser
      // clients to self-throttle on these, so they must be readable cross-origin
      // (parity with api/_cors.js).
      "RateLimit",
      "RateLimit-Policy",
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
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
  }
});

// api/_sentry-common.js
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
var _key, _envelopeUrl;
var init_sentry_common = __esm({
  "api/_sentry-common.js"() {
    "use strict";
    _key = "";
    _envelopeUrl = "";
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
  }
});

// api/_sentry-edge.js
var captureSilentError;
var init_sentry_edge = __esm({
  "api/_sentry-edge.js"() {
    "use strict";
    init_sentry_common();
    captureSilentError = makeCaptureSilentError({
      runtime: "edge",
      platform: "javascript",
      logPrefix: "[sentry-edge]"
    });
  }
});

// node_modules/@upstash/core-analytics/dist/index.js
var require_dist = __commonJS({
  "node_modules/@upstash/core-analytics/dist/index.js"(exports, module) {
    "use strict";
    var g = Object.defineProperty;
    var k = Object.getOwnPropertyDescriptor;
    var _ = Object.getOwnPropertyNames;
    var y = Object.prototype.hasOwnProperty;
    var w = (l, e) => {
      for (var t in e) g(l, t, { get: e[t], enumerable: true });
    };
    var A = (l, e, t, i) => {
      if (e && typeof e == "object" || typeof e == "function") for (let s2 of _(e)) !y.call(l, s2) && s2 !== t && g(l, s2, { get: () => e[s2], enumerable: !(i = k(e, s2)) || i.enumerable });
      return l;
    };
    var x = (l) => A(g({}, "__esModule", { value: true }), l);
    var S = {};
    w(S, { Analytics: () => b });
    module.exports = x(S);
    var p = `
local key = KEYS[1]
local field = ARGV[1]

local data = redis.call("ZRANGE", key, 0, -1, "WITHSCORES")
local count = {}

for i = 1, #data, 2 do
  local json_str = data[i]
  local score = tonumber(data[i + 1])
  local obj = cjson.decode(json_str)

  local fieldValue = obj[field]

  if count[fieldValue] == nil then
    count[fieldValue] = score
  else
    count[fieldValue] = count[fieldValue] + score
  end
end

local result = {}
for k, v in pairs(count) do
  table.insert(result, {k, v})
end

return result
`;
    var f = `
local prefix = KEYS[1]
local first_timestamp = tonumber(ARGV[1]) -- First timestamp to check
local increment = tonumber(ARGV[2])       -- Increment between each timestamp
local num_timestamps = tonumber(ARGV[3])  -- Number of timestampts to check (24 for a day and 24 * 7 for a week)
local num_elements = tonumber(ARGV[4])    -- Number of elements to fetch in each category
local check_at_most = tonumber(ARGV[5])   -- Number of elements to check at most.

local keys = {}
for i = 1, num_timestamps do
  local timestamp = first_timestamp - (i - 1) * increment
  table.insert(keys, prefix .. ":" .. timestamp)
end

-- get the union of the groups
local zunion_params = {"ZUNION", num_timestamps, unpack(keys)}
table.insert(zunion_params, "WITHSCORES")
local result = redis.call(unpack(zunion_params))

-- select num_elements many items
local true_group = {}
local false_group = {}
local denied_group = {}
local true_count = 0
local false_count = 0
local denied_count = 0
local i = #result - 1

-- index to stop at after going through "checkAtMost" many items:
local cutoff_index = #result - 2 * check_at_most

-- iterate over the results
while (true_count + false_count + denied_count) < (num_elements * 3) and 1 <= i and i >= cutoff_index do
  local score = tonumber(result[i + 1])
  if score > 0 then
    local element = result[i]
    if string.find(element, "success\\":true") and true_count < num_elements then
      table.insert(true_group, {score, element})
      true_count = true_count + 1
    elseif string.find(element, "success\\":false") and false_count < num_elements then
      table.insert(false_group, {score, element})
      false_count = false_count + 1
    elseif string.find(element, "success\\":\\"denied") and denied_count < num_elements then
      table.insert(denied_group, {score, element})
      denied_count = denied_count + 1
    end
  end
  i = i - 2
end

return {true_group, false_group, denied_group}
`;
    var h = `
local prefix = KEYS[1]
local first_timestamp = tonumber(ARGV[1])
local increment = tonumber(ARGV[2])
local num_timestamps = tonumber(ARGV[3])

local keys = {}
for i = 1, num_timestamps do
  local timestamp = first_timestamp - (i - 1) * increment
  table.insert(keys, prefix .. ":" .. timestamp)
end

-- get the union of the groups
local zunion_params = {"ZUNION", num_timestamps, unpack(keys)}
table.insert(zunion_params, "WITHSCORES")
local result = redis.call(unpack(zunion_params))

return result
`;
    var b = class {
      redis;
      prefix;
      bucketSize;
      constructor(e) {
        this.redis = e.redis, this.prefix = e.prefix ?? "@upstash/analytics", this.bucketSize = this.parseWindow(e.window);
      }
      validateTableName(e) {
        if (!/^[a-zA-Z0-9_-]+$/.test(e)) throw new Error(`Invalid table name: ${e}. Table names can only contain letters, numbers, dashes and underscores.`);
      }
      parseWindow(e) {
        if (typeof e == "number") {
          if (e <= 0) throw new Error(`Invalid window: ${e}`);
          return e;
        }
        let t = /^(\d+)([smhd])$/;
        if (!t.test(e)) throw new Error(`Invalid window: ${e}`);
        let [, i, s2] = e.match(t), n = parseInt(i);
        switch (s2) {
          case "s":
            return n * 1e3;
          case "m":
            return n * 1e3 * 60;
          case "h":
            return n * 1e3 * 60 * 60;
          case "d":
            return n * 1e3 * 60 * 60 * 24;
          default:
            throw new Error(`Invalid window unit: ${s2}`);
        }
      }
      getBucket(e) {
        let t = e ?? Date.now();
        return Math.floor(t / this.bucketSize) * this.bucketSize;
      }
      async ingest(e, ...t) {
        this.validateTableName(e), await Promise.all(t.map(async (i) => {
          let s2 = this.getBucket(i.time), n = [this.prefix, e, s2].join(":");
          await this.redis.zincrby(n, 1, JSON.stringify({ ...i, time: void 0 }));
        }));
      }
      formatBucketAggregate(e, t, i) {
        let s2 = {};
        return e.forEach(([n, r]) => {
          t == "success" && (n = n === 1 ? "true" : n === null ? "false" : n), s2[t] = s2[t] || {}, s2[t][(n ?? "null").toString()] = r;
        }), { time: i, ...s2 };
      }
      async aggregateBucket(e, t, i) {
        this.validateTableName(e);
        let s2 = this.getBucket(i), n = [this.prefix, e, s2].join(":"), r = await this.redis.eval(p, [n], [t]);
        return this.formatBucketAggregate(r, t, s2);
      }
      async aggregateBuckets(e, t, i, s2) {
        this.validateTableName(e);
        let n = this.getBucket(s2), r = [];
        for (let o = 0; o < i; o += 1) r.push(this.aggregateBucket(e, t, n)), n = n - this.bucketSize;
        return Promise.all(r);
      }
      async aggregateBucketsWithPipeline(e, t, i, s2, n) {
        this.validateTableName(e), n = n ?? 48;
        let r = this.getBucket(s2), o = [], c = this.redis.pipeline(), u = [];
        for (let a = 1; a <= i; a += 1) {
          let d = [this.prefix, e, r].join(":");
          c.eval(p, [d], [t]), o.push(r), r = r - this.bucketSize, (a % n == 0 || a == i) && (u.push(c.exec()), c = this.redis.pipeline());
        }
        return (await Promise.all(u)).flat().map((a, d) => this.formatBucketAggregate(a, t, o[d]));
      }
      async getAllowedBlocked(e, t, i) {
        this.validateTableName(e);
        let s2 = [this.prefix, e].join(":"), n = this.getBucket(i), r = await this.redis.eval(h, [s2], [n, this.bucketSize, t]), o = {};
        for (let c = 0; c < r.length; c += 2) {
          let u = r[c], m = u.identifier, a = +r[c + 1];
          o[m] || (o[m] = { success: 0, blocked: 0 }), o[m][u.success ? "success" : "blocked"] = a;
        }
        return o;
      }
      async getMostAllowedBlocked(e, t, i, s2, n) {
        this.validateTableName(e);
        let r = [this.prefix, e].join(":"), o = this.getBucket(s2), c = n ?? i * 5, [u, m, a] = await this.redis.eval(f, [r], [o, this.bucketSize, t, i, c]);
        return { allowed: this.toDicts(u), ratelimited: this.toDicts(m), denied: this.toDicts(a) };
      }
      toDicts(e) {
        let t = [];
        for (let i = 0; i < e.length; i += 1) {
          let s2 = +e[i][0], n = e[i][1];
          t.push({ identifier: n.identifier, count: s2 });
        }
        return t;
      }
    };
  }
});

// node_modules/@upstash/ratelimit/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/@upstash/ratelimit/dist/index.js"(exports, module) {
    "use strict";
    var __defProp3 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export3 = (target, all) => {
      for (var name in all)
        __defProp3(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key) && key !== except)
            __defProp3(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp3({}, "__esModule", { value: true }), mod);
    var src_exports = {};
    __export3(src_exports, {
      Analytics: () => Analytics2,
      IpDenyList: () => ip_deny_list_exports,
      MultiRegionRatelimit: () => MultiRegionRatelimit,
      Ratelimit: () => RegionRatelimit
    });
    module.exports = __toCommonJS(src_exports);
    var import_core_analytics = require_dist();
    var Analytics2 = class {
      analytics;
      table = "events";
      constructor(config2) {
        this.analytics = new import_core_analytics.Analytics({
          // @ts-expect-error we need to fix the types in core-analytics, it should only require the methods it needs, not the whole sdk
          redis: config2.redis,
          window: "1h",
          prefix: config2.prefix ?? "@upstash/ratelimit",
          retention: "90d"
        });
      }
      /**
       * Try to extract the geo information from the request
       *
       * This handles Vercel's `req.geo` and  and Cloudflare's `request.cf` properties
       * @param req
       * @returns
       */
      extractGeo(req) {
        if (req.geo !== void 0) {
          return req.geo;
        }
        if (req.cf !== void 0) {
          return req.cf;
        }
        return {};
      }
      async record(event) {
        await this.analytics.ingest(this.table, event);
      }
      async series(filter, cutoff) {
        const timestampCount = Math.min(
          (this.analytics.getBucket(Date.now()) - this.analytics.getBucket(cutoff)) / (60 * 60 * 1e3),
          256
        );
        return this.analytics.aggregateBucketsWithPipeline(this.table, filter, timestampCount);
      }
      async getUsage(cutoff = 0) {
        const timestampCount = Math.min(
          (this.analytics.getBucket(Date.now()) - this.analytics.getBucket(cutoff)) / (60 * 60 * 1e3),
          256
        );
        const records = await this.analytics.getAllowedBlocked(this.table, timestampCount);
        return records;
      }
      async getUsageOverTime(timestampCount, groupby) {
        const result = await this.analytics.aggregateBucketsWithPipeline(this.table, groupby, timestampCount);
        return result;
      }
      async getMostAllowedBlocked(timestampCount, getTop, checkAtMost) {
        getTop = getTop ?? 5;
        const timestamp = void 0;
        return this.analytics.getMostAllowedBlocked(this.table, timestampCount, getTop, timestamp, checkAtMost);
      }
    };
    var Cache = class {
      /**
       * Stores identifier -> reset (in milliseconds)
       */
      cache;
      constructor(cache2) {
        this.cache = cache2;
      }
      isBlocked(identifier) {
        if (!this.cache.has(identifier)) {
          return { blocked: false, reset: 0 };
        }
        const reset = this.cache.get(identifier);
        if (reset < Date.now()) {
          this.cache.delete(identifier);
          return { blocked: false, reset: 0 };
        }
        return { blocked: true, reset };
      }
      blockUntil(identifier, reset) {
        this.cache.set(identifier, reset);
      }
      set(key, value) {
        this.cache.set(key, value);
      }
      get(key) {
        return this.cache.get(key) || null;
      }
      incr(key, incrementAmount = 1) {
        let value = this.cache.get(key) ?? 0;
        value += incrementAmount;
        this.cache.set(key, value);
        return value;
      }
      pop(key) {
        this.cache.delete(key);
      }
      empty() {
        this.cache.clear();
      }
      size() {
        return this.cache.size;
      }
    };
    var DYNAMIC_LIMIT_KEY_SUFFIX = ":dynamic:global";
    var DEFAULT_PREFIX = "@upstash/ratelimit";
    function ms(d) {
      const match = d.match(/^(\d+)\s?(ms|s|m|h|d)$/);
      if (!match) {
        throw new Error(`Unable to parse window size: ${d}`);
      }
      const time = Number.parseInt(match[1]);
      const unit = match[2];
      switch (unit) {
        case "ms": {
          return time;
        }
        case "s": {
          return time * 1e3;
        }
        case "m": {
          return time * 1e3 * 60;
        }
        case "h": {
          return time * 1e3 * 60 * 60;
        }
        case "d": {
          return time * 1e3 * 60 * 60 * 24;
        }
        default: {
          throw new Error(`Unable to parse window size: ${d}`);
        }
      }
    }
    var safeEval = async (ctx, script, keys, args) => {
      try {
        return await ctx.redis.evalsha(script.hash, keys, args);
      } catch (error) {
        if (`${error}`.includes("NOSCRIPT")) {
          return await ctx.redis.eval(script.script, keys, args);
        }
        throw error;
      }
    };
    var fixedWindowLimitScript = `
  local key           = KEYS[1]
  local dynamicLimitKey = KEYS[2]  -- optional: key for dynamic limit in redis
  local tokens        = tonumber(ARGV[1])  -- default limit
  local window        = ARGV[2]
  local incrementBy   = ARGV[3] -- increment rate per request at a given value, default is 1

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local r = redis.call("INCRBY", key, incrementBy)
  if r == tonumber(incrementBy) then
  -- The first time this key is set, the value will be equal to incrementBy.
  -- So we only need the expire command once
  redis.call("PEXPIRE", key, window)
  end

  return {r, effectiveLimit}
`;
    var fixedWindowRemainingTokensScript = `
  local key = KEYS[1]
  local dynamicLimitKey = KEYS[2]  -- optional: key for dynamic limit in redis
  local tokens = tonumber(ARGV[1])  -- default limit

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local value = redis.call('GET', key)
  local usedTokens = 0
  if value then
    usedTokens = tonumber(value)
  end
  
  return {effectiveLimit - usedTokens, effectiveLimit}
`;
    var slidingWindowLimitScript = `
  local currentKey  = KEYS[1]           -- identifier including prefixes
  local previousKey = KEYS[2]           -- key of the previous bucket
  local dynamicLimitKey = KEYS[3]       -- optional: key for dynamic limit in redis
  local tokens      = tonumber(ARGV[1]) -- default tokens per window
  local now         = ARGV[2]           -- current timestamp in milliseconds
  local window      = ARGV[3]           -- interval in milliseconds
  local incrementBy = tonumber(ARGV[4]) -- increment rate per request at a given value, default is 1

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local requestsInCurrentWindow = redis.call("GET", currentKey)
  if requestsInCurrentWindow == false then
    requestsInCurrentWindow = 0
  end

  local requestsInPreviousWindow = redis.call("GET", previousKey)
  if requestsInPreviousWindow == false then
    requestsInPreviousWindow = 0
  end
  local percentageInCurrent = ( now % window ) / window
  -- weighted requests to consider from the previous window
  requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)

  -- Only check limit if not refunding (negative rate)
  if incrementBy > 0 and requestsInPreviousWindow + requestsInCurrentWindow >= effectiveLimit then
    return {-1, effectiveLimit}
  end

  local newValue = redis.call("INCRBY", currentKey, incrementBy)
  if newValue == incrementBy then
    -- The first time this key is set, the value will be equal to incrementBy.
    -- So we only need the expire command once
    redis.call("PEXPIRE", currentKey, window * 2 + 1000) -- Enough time to overlap with a new window + 1 second
  end
  return {effectiveLimit - ( newValue + requestsInPreviousWindow ), effectiveLimit}
`;
    var slidingWindowRemainingTokensScript = `
  local currentKey  = KEYS[1]           -- identifier including prefixes
  local previousKey = KEYS[2]           -- key of the previous bucket
  local dynamicLimitKey = KEYS[3]       -- optional: key for dynamic limit in redis
  local tokens      = tonumber(ARGV[1]) -- default tokens per window
  local now         = ARGV[2]           -- current timestamp in milliseconds
  local window      = ARGV[3]           -- interval in milliseconds

  -- Check for dynamic limit
  local effectiveLimit = tokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end

  local requestsInCurrentWindow = redis.call("GET", currentKey)
  if requestsInCurrentWindow == false then
    requestsInCurrentWindow = 0
  end

  local requestsInPreviousWindow = redis.call("GET", previousKey)
  if requestsInPreviousWindow == false then
    requestsInPreviousWindow = 0
  end

  local percentageInCurrent = ( now % window ) / window
  -- weighted requests to consider from the previous window
  requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)

  local usedTokens = requestsInPreviousWindow + requestsInCurrentWindow
  return {effectiveLimit - usedTokens, effectiveLimit}
`;
    var tokenBucketLimitScript = `
  local key         = KEYS[1]           -- identifier including prefixes
  local dynamicLimitKey = KEYS[2]       -- optional: key for dynamic limit in redis
  local maxTokens   = tonumber(ARGV[1]) -- default maximum number of tokens
  local interval    = tonumber(ARGV[2]) -- size of the window in milliseconds
  local refillRate  = tonumber(ARGV[3]) -- how many tokens are refilled after each interval
  local now         = tonumber(ARGV[4]) -- current timestamp in milliseconds
  local incrementBy = tonumber(ARGV[5]) -- how many tokens to consume, default is 1

  -- Check for dynamic limit
  local effectiveLimit = maxTokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end
        
  local bucket = redis.call("HMGET", key, "refilledAt", "tokens")
        
  local refilledAt
  local tokens

  if bucket[1] == false then
    refilledAt = now
    tokens = effectiveLimit
  else
    refilledAt = tonumber(bucket[1])
    tokens = tonumber(bucket[2])
  end
        
  if now >= refilledAt + interval then
    local numRefills = math.floor((now - refilledAt) / interval)
    tokens = math.min(effectiveLimit, tokens + numRefills * refillRate)

    refilledAt = refilledAt + numRefills * interval
  end

  -- Only reject if tokens are 0 and we're consuming (not refunding)
  if tokens == 0 and incrementBy > 0 then
    return {-1, refilledAt + interval, effectiveLimit}
  end

  local remaining = tokens - incrementBy
  local expireAt = math.ceil(((effectiveLimit - remaining) / refillRate)) * interval
        
  redis.call("HSET", key, "refilledAt", refilledAt, "tokens", remaining)

  if (expireAt > 0) then
    redis.call("PEXPIRE", key, expireAt)
  end
  return {remaining, refilledAt + interval, effectiveLimit}
`;
    var tokenBucketIdentifierNotFound = -1;
    var tokenBucketRemainingTokensScript = `
  local key         = KEYS[1]
  local dynamicLimitKey = KEYS[2]       -- optional: key for dynamic limit in redis
  local maxTokens   = tonumber(ARGV[1]) -- default maximum number of tokens

  -- Check for dynamic limit
  local effectiveLimit = maxTokens
  if dynamicLimitKey ~= "" then
    local dynamicLimit = redis.call("GET", dynamicLimitKey)
    if dynamicLimit then
      effectiveLimit = tonumber(dynamicLimit)
    end
  end
        
  local bucket = redis.call("HMGET", key, "refilledAt", "tokens")

  if bucket[1] == false then
    return {effectiveLimit, ${tokenBucketIdentifierNotFound}, effectiveLimit}
  end
        
  return {tonumber(bucket[2]), tonumber(bucket[1]), effectiveLimit}
`;
    var cachedFixedWindowLimitScript = `
  local key     = KEYS[1]
  local window  = ARGV[1]
  local incrementBy   = ARGV[2] -- increment rate per request at a given value, default is 1

  local r = redis.call("INCRBY", key, incrementBy)
  if r == incrementBy then
  -- The first time this key is set, the value will be equal to incrementBy.
  -- So we only need the expire command once
  redis.call("PEXPIRE", key, window)
  end
      
  return r
`;
    var cachedFixedWindowRemainingTokenScript = `
  local key = KEYS[1]
  local tokens = 0

  local value = redis.call('GET', key)
  if value then
      tokens = value
  end
  return tokens
`;
    var fixedWindowLimitScript2 = `
	local key           = KEYS[1]
	local id            = ARGV[1]
	local window        = ARGV[2]
	local incrementBy   = tonumber(ARGV[3])

	redis.call("HSET", key, id, incrementBy)
	local fields = redis.call("HGETALL", key)
	if #fields == 2 and tonumber(fields[2])==incrementBy then
	-- The first time this key is set, and the value will be equal to incrementBy.
	-- So we only need the expire command once
	  redis.call("PEXPIRE", key, window)
	end

	return fields
`;
    var fixedWindowRemainingTokensScript2 = `
      local key = KEYS[1]
      local tokens = 0

      local fields = redis.call("HGETALL", key)

      return fields
    `;
    var slidingWindowLimitScript2 = `
	local currentKey    = KEYS[1]           -- identifier including prefixes
	local previousKey   = KEYS[2]           -- key of the previous bucket
	local tokens        = tonumber(ARGV[1]) -- tokens per window
	local now           = ARGV[2]           -- current timestamp in milliseconds
	local window        = ARGV[3]           -- interval in milliseconds
	local requestId     = ARGV[4]           -- uuid for this request
	local incrementBy   = tonumber(ARGV[5]) -- custom rate, default is  1

	local currentFields = redis.call("HGETALL", currentKey)
	local requestsInCurrentWindow = 0
	for i = 2, #currentFields, 2 do
	requestsInCurrentWindow = requestsInCurrentWindow + tonumber(currentFields[i])
	end

	local previousFields = redis.call("HGETALL", previousKey)
	local requestsInPreviousWindow = 0
	for i = 2, #previousFields, 2 do
	requestsInPreviousWindow = requestsInPreviousWindow + tonumber(previousFields[i])
	end

	local percentageInCurrent = ( now % window) / window

	-- Only check limit if not refunding (negative rate)
	if incrementBy > 0 and requestsInPreviousWindow * (1 - percentageInCurrent ) + requestsInCurrentWindow + incrementBy > tokens then
	  return {currentFields, previousFields, false}
	end

	redis.call("HSET", currentKey, requestId, incrementBy)

	if requestsInCurrentWindow == 0 then 
	  -- The first time this key is set, the value will be equal to incrementBy.
	  -- So we only need the expire command once
	  redis.call("PEXPIRE", currentKey, window * 2 + 1000) -- Enough time to overlap with a new window + 1 second
	end
	return {currentFields, previousFields, true}
`;
    var slidingWindowRemainingTokensScript2 = `
	local currentKey    = KEYS[1]           -- identifier including prefixes
	local previousKey   = KEYS[2]           -- key of the previous bucket
	local now         	= ARGV[1]           -- current timestamp in milliseconds
  	local window      	= ARGV[2]           -- interval in milliseconds

	local currentFields = redis.call("HGETALL", currentKey)
	local requestsInCurrentWindow = 0
	for i = 2, #currentFields, 2 do
	requestsInCurrentWindow = requestsInCurrentWindow + tonumber(currentFields[i])
	end

	local previousFields = redis.call("HGETALL", previousKey)
	local requestsInPreviousWindow = 0
	for i = 2, #previousFields, 2 do
	requestsInPreviousWindow = requestsInPreviousWindow + tonumber(previousFields[i])
	end

	local percentageInCurrent = ( now % window) / window
  	requestsInPreviousWindow = math.floor(( 1 - percentageInCurrent ) * requestsInPreviousWindow)
	
	return requestsInCurrentWindow + requestsInPreviousWindow
`;
    var resetScript = `
      local pattern = KEYS[1]

      -- Initialize cursor to start from 0
      local cursor = "0"

      repeat
          -- Scan for keys matching the pattern
          local scan_result = redis.call('SCAN', cursor, 'MATCH', pattern)

          -- Extract cursor for the next iteration
          cursor = scan_result[1]

          -- Extract keys from the scan result
          local keys = scan_result[2]

          for i=1, #keys do
          redis.call('DEL', keys[i])
          end

      -- Continue scanning until cursor is 0 (end of keyspace)
      until cursor == "0"
    `;
    var SCRIPTS = {
      singleRegion: {
        fixedWindow: {
          limit: {
            script: fixedWindowLimitScript,
            hash: "472e55443b62f60d0991028456c57815a387066d"
          },
          getRemaining: {
            script: fixedWindowRemainingTokensScript,
            hash: "40515c9dd0a08f8584f5f9b593935f6a87c1c1c3"
          }
        },
        slidingWindow: {
          limit: {
            script: slidingWindowLimitScript,
            hash: "977fb636fb5ceb7e98a96d1b3a1272ba018efdae"
          },
          getRemaining: {
            script: slidingWindowRemainingTokensScript,
            hash: "ee3a3265fad822f83acad23f8a1e2f5c0b156b03"
          }
        },
        tokenBucket: {
          limit: {
            script: tokenBucketLimitScript,
            hash: "b35c5bc0b7fdae7dd0573d4529911cabaf9d1d89"
          },
          getRemaining: {
            script: tokenBucketRemainingTokensScript,
            hash: "deb03663e8af5a968deee895dd081be553d2611b"
          }
        },
        cachedFixedWindow: {
          limit: {
            script: cachedFixedWindowLimitScript,
            hash: "c26b12703dd137939b9a69a3a9b18e906a2d940f"
          },
          getRemaining: {
            script: cachedFixedWindowRemainingTokenScript,
            hash: "8e8f222ccae68b595ee6e3f3bf2199629a62b91a"
          }
        }
      },
      multiRegion: {
        fixedWindow: {
          limit: {
            script: fixedWindowLimitScript2,
            hash: "a8c14f3835aa87bd70e5e2116081b81664abcf5c"
          },
          getRemaining: {
            script: fixedWindowRemainingTokensScript2,
            hash: "8ab8322d0ed5fe5ac8eb08f0c2e4557f1b4816fd"
          }
        },
        slidingWindow: {
          limit: {
            script: slidingWindowLimitScript2,
            hash: "1e7ca8dcd2d600a6d0124a67a57ea225ed62921b"
          },
          getRemaining: {
            script: slidingWindowRemainingTokensScript2,
            hash: "558c9306b7ec54abb50747fe0b17e5d44bd24868"
          }
        }
      }
    };
    var RESET_SCRIPT = {
      script: resetScript,
      hash: "54bd274ddc59fb3be0f42deee2f64322a10e2b50"
    };
    var DenyListExtension = "denyList";
    var IpDenyListKey = "ipDenyList";
    var IpDenyListStatusKey = "ipDenyListStatus";
    var checkDenyListScript = `
  -- Checks if values provideed in ARGV are present in the deny lists.
  -- This is done using the allDenyListsKey below.

  -- Additionally, checks the status of the ip deny list using the
  -- ipDenyListStatusKey below. Here are the possible states of the
  -- ipDenyListStatusKey key:
  -- * status == -1: set to "disabled" with no TTL
  -- * status == -2: not set, meaning that is was set before but expired
  -- * status  >  0: set to "valid", with a TTL
  --
  -- In the case of status == -2, we set the status to "pending" with
  -- 30 second ttl. During this time, the process which got status == -2
  -- will update the ip deny list.

  local allDenyListsKey     = KEYS[1]
  local ipDenyListStatusKey = KEYS[2]

  local results = redis.call('SMISMEMBER', allDenyListsKey, unpack(ARGV))
  local status  = redis.call('TTL', ipDenyListStatusKey)
  if status == -2 then
    redis.call('SETEX', ipDenyListStatusKey, 30, "pending")
  end

  return { results, status }
`;
    var ip_deny_list_exports = {};
    __export3(ip_deny_list_exports, {
      ThresholdError: () => ThresholdError,
      disableIpDenyList: () => disableIpDenyList,
      updateIpDenyList: () => updateIpDenyList
    });
    var MILLISECONDS_IN_HOUR = 60 * 60 * 1e3;
    var MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR;
    var MILLISECONDS_TO_2AM = 2 * MILLISECONDS_IN_HOUR;
    var getIpListTTL = (time) => {
      const now = time || Date.now();
      const timeSinceLast2AM = (now - MILLISECONDS_TO_2AM) % MILLISECONDS_IN_DAY;
      return MILLISECONDS_IN_DAY - timeSinceLast2AM;
    };
    var baseUrl = "https://raw.githubusercontent.com/stamparm/ipsum/master/levels";
    var ThresholdError = class extends Error {
      constructor(threshold) {
        super(`Allowed threshold values are from 1 to 8, 1 and 8 included. Received: ${threshold}`);
        this.name = "ThresholdError";
      }
    };
    var getIpDenyList = async (threshold) => {
      if (typeof threshold !== "number" || threshold < 1 || threshold > 8) {
        throw new ThresholdError(threshold);
      }
      try {
        const response = await fetch(`${baseUrl}/${threshold}.txt`);
        if (!response.ok) {
          throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.text();
        const lines = data.split("\n");
        return lines.filter((value) => value.length > 0);
      } catch (error) {
        throw new Error(`Failed to fetch ip deny list: ${error}`);
      }
    };
    var updateIpDenyList = async (redis, prefix, threshold, ttl) => {
      const allIps = await getIpDenyList(threshold);
      const allDenyLists = [prefix, DenyListExtension, "all"].join(":");
      const ipDenyList = [prefix, DenyListExtension, IpDenyListKey].join(":");
      const statusKey = [prefix, IpDenyListStatusKey].join(":");
      const transaction = redis.multi();
      transaction.sdiffstore(allDenyLists, allDenyLists, ipDenyList);
      transaction.del(ipDenyList);
      transaction.sadd(ipDenyList, allIps.at(0), ...allIps.slice(1));
      transaction.sdiffstore(ipDenyList, ipDenyList, allDenyLists);
      transaction.sunionstore(allDenyLists, allDenyLists, ipDenyList);
      transaction.set(statusKey, "valid", { px: ttl ?? getIpListTTL() });
      return await transaction.exec();
    };
    var disableIpDenyList = async (redis, prefix) => {
      const allDenyListsKey = [prefix, DenyListExtension, "all"].join(":");
      const ipDenyListKey = [prefix, DenyListExtension, IpDenyListKey].join(":");
      const statusKey = [prefix, IpDenyListStatusKey].join(":");
      const transaction = redis.multi();
      transaction.sdiffstore(allDenyListsKey, allDenyListsKey, ipDenyListKey);
      transaction.del(ipDenyListKey);
      transaction.set(statusKey, "disabled");
      return await transaction.exec();
    };
    var denyListCache = new Cache(/* @__PURE__ */ new Map());
    var checkDenyListCache = (members) => {
      return members.find(
        (member) => denyListCache.isBlocked(member).blocked
      );
    };
    var blockMember = (member) => {
      if (denyListCache.size() > 1e3)
        denyListCache.empty();
      denyListCache.blockUntil(member, Date.now() + 6e4);
    };
    var checkDenyList = async (redis, prefix, members) => {
      const [deniedValues, ipDenyListStatus] = await redis.eval(
        checkDenyListScript,
        [
          [prefix, DenyListExtension, "all"].join(":"),
          [prefix, IpDenyListStatusKey].join(":")
        ],
        members
      );
      let deniedValue = void 0;
      deniedValues.map((memberDenied, index) => {
        if (memberDenied) {
          blockMember(members[index]);
          deniedValue = members[index];
        }
      });
      return {
        deniedValue,
        invalidIpDenyList: ipDenyListStatus === -2
      };
    };
    var resolveLimitPayload = (redis, prefix, [ratelimitResponse, denyListResponse], threshold) => {
      if (denyListResponse.deniedValue) {
        ratelimitResponse.success = false;
        ratelimitResponse.remaining = 0;
        ratelimitResponse.reason = "denyList";
        ratelimitResponse.deniedValue = denyListResponse.deniedValue;
      }
      if (denyListResponse.invalidIpDenyList) {
        const updatePromise = updateIpDenyList(redis, prefix, threshold);
        ratelimitResponse.pending = Promise.all([
          ratelimitResponse.pending,
          updatePromise
        ]);
      }
      return ratelimitResponse;
    };
    var defaultDeniedResponse = (deniedValue) => {
      return {
        success: false,
        limit: 0,
        remaining: 0,
        reset: 0,
        pending: Promise.resolve(),
        reason: "denyList",
        deniedValue
      };
    };
    var Ratelimit2 = class {
      limiter;
      ctx;
      prefix;
      timeout;
      primaryRedis;
      analytics;
      enableProtection;
      denyListThreshold;
      dynamicLimits;
      constructor(config2) {
        this.ctx = config2.ctx;
        this.limiter = config2.limiter;
        this.timeout = config2.timeout ?? 5e3;
        this.prefix = config2.prefix ?? DEFAULT_PREFIX;
        this.dynamicLimits = config2.dynamicLimits ?? false;
        this.enableProtection = config2.enableProtection ?? false;
        this.denyListThreshold = config2.denyListThreshold ?? 6;
        this.primaryRedis = "redis" in this.ctx ? this.ctx.redis : this.ctx.regionContexts[0].redis;
        if ("redis" in this.ctx) {
          this.ctx.dynamicLimits = this.dynamicLimits;
          this.ctx.prefix = this.prefix;
        }
        this.analytics = config2.analytics ? new Analytics2({
          redis: this.primaryRedis,
          prefix: this.prefix
        }) : void 0;
        if (config2.ephemeralCache instanceof Map) {
          this.ctx.cache = new Cache(config2.ephemeralCache);
        } else if (config2.ephemeralCache === void 0) {
          this.ctx.cache = new Cache(/* @__PURE__ */ new Map());
        }
      }
      /**
       * Determine if a request should pass or be rejected based on the identifier and previously chosen ratelimit.
       *
       * Use this if you want to reject all requests that you can not handle right now.
       *
       * @example
       * ```ts
       *  const ratelimit = new Ratelimit({
       *    redis: Redis.fromEnv(),
       *    limiter: Ratelimit.slidingWindow(10, "10 s")
       *  })
       *
       *  const { success } = await ratelimit.limit(id)
       *  if (!success){
       *    return "Nope"
       *  }
       *  return "Yes"
       * ```
       *
       * @param req.rate - The rate at which tokens will be added or consumed from the token bucket. A higher rate allows for more requests to be processed. Defaults to 1 token per interval if not specified.
       *
       * Usage with `req.rate`
       * @example
       * ```ts
       *  const ratelimit = new Ratelimit({
       *    redis: Redis.fromEnv(),
       *    limiter: Ratelimit.slidingWindow(100, "10 s")
       *  })
       *
       *  const { success } = await ratelimit.limit(id, {rate: 10})
       *  if (!success){
       *    return "Nope"
       *  }
       *  return "Yes"
       * ```
       */
      limit = async (identifier, req) => {
        let timeoutId = null;
        try {
          const response = this.getRatelimitResponse(identifier, req);
          const { responseArray, newTimeoutId } = this.applyTimeout(response);
          timeoutId = newTimeoutId;
          const timedResponse = await Promise.race(responseArray);
          const finalResponse = this.submitAnalytics(timedResponse, identifier, req);
          return finalResponse;
        } finally {
          if (timeoutId) {
            clearTimeout(timeoutId);
          }
        }
      };
      /**
       * Block until the request may pass or timeout is reached.
       *
       * This method returns a promise that resolves as soon as the request may be processed
       * or after the timeout has been reached.
       *
       * Use this if you want to delay the request until it is ready to get processed.
       *
       * @example
       * ```ts
       *  const ratelimit = new Ratelimit({
       *    redis: Redis.fromEnv(),
       *    limiter: Ratelimit.slidingWindow(10, "10 s")
       *  })
       *
       *  const { success } = await ratelimit.blockUntilReady(id, 60_000)
       *  if (!success){
       *    return "Nope"
       *  }
       *  return "Yes"
       * ```
       */
      blockUntilReady = async (identifier, timeout) => {
        if (timeout <= 0) {
          throw new Error("timeout must be positive");
        }
        let res;
        const deadline = Date.now() + timeout;
        while (true) {
          res = await this.limit(identifier);
          if (res.success) {
            break;
          }
          if (res.reset === 0) {
            throw new Error("This should not happen");
          }
          const wait = Math.min(res.reset, deadline) - Date.now();
          await new Promise((r) => setTimeout(r, wait));
          if (Date.now() > deadline) {
            break;
          }
        }
        return res;
      };
      resetUsedTokens = async (identifier) => {
        const pattern = [this.prefix, identifier].join(":");
        await this.limiter().resetTokens(this.ctx, pattern);
      };
      /**
       * Returns the remaining token count together with a reset timestamps
       * 
       * @param identifier identifir to check
       * @returns object with `remaining`, `reset`, and `limit` fields. `remaining` denotes
       *          the remaining tokens, `limit` is the effective limit (considering dynamic
       *          limits if enabled), and `reset` denotes the timestamp when the tokens reset.
       */
      getRemaining = async (identifier) => {
        const pattern = [this.prefix, identifier].join(":");
        return await this.limiter().getRemaining(this.ctx, pattern);
      };
      /**
       * Checks if the identifier or the values in req are in the deny list cache.
       * If so, returns the default denied response.
       * 
       * Otherwise, calls redis to check the rate limit and deny list. Returns after
       * resolving the result. Resolving is overriding the rate limit result if
       * the some value is in deny list.
       * 
       * @param identifier identifier to block
       * @param req options with ip, user agent, country, rate and geo info
       * @returns rate limit response
       */
      getRatelimitResponse = async (identifier, req) => {
        const key = this.getKey(identifier);
        const definedMembers = this.getDefinedMembers(identifier, req);
        const deniedValue = checkDenyListCache(definedMembers);
        const result = deniedValue ? [defaultDeniedResponse(deniedValue), { deniedValue, invalidIpDenyList: false }] : await Promise.all([
          this.limiter().limit(this.ctx, key, req?.rate),
          this.enableProtection ? checkDenyList(this.primaryRedis, this.prefix, definedMembers) : { deniedValue: void 0, invalidIpDenyList: false }
        ]);
        return resolveLimitPayload(this.primaryRedis, this.prefix, result, this.denyListThreshold);
      };
      /**
       * Creates an array with the original response promise and a timeout promise
       * if this.timeout > 0.
       * 
       * @param response Ratelimit response promise
       * @returns array with the response and timeout promise. also includes the timeout id
       */
      applyTimeout = (response) => {
        let newTimeoutId = null;
        const responseArray = [response];
        if (this.timeout > 0) {
          const timeoutResponse = new Promise((resolve) => {
            newTimeoutId = setTimeout(() => {
              resolve({
                success: true,
                limit: 0,
                remaining: 0,
                reset: 0,
                pending: Promise.resolve(),
                reason: "timeout"
              });
            }, this.timeout);
          });
          responseArray.push(timeoutResponse);
        }
        return {
          responseArray,
          newTimeoutId
        };
      };
      /**
       * submits analytics if this.analytics is set
       * 
       * @param ratelimitResponse final rate limit response
       * @param identifier identifier to submit
       * @param req limit options
       * @returns rate limit response after updating the .pending field
       */
      submitAnalytics = (ratelimitResponse, identifier, req) => {
        if (this.analytics) {
          try {
            const geo = req ? this.analytics.extractGeo(req) : void 0;
            const analyticsP = this.analytics.record({
              identifier: ratelimitResponse.reason === "denyList" ? ratelimitResponse.deniedValue : identifier,
              time: Date.now(),
              success: ratelimitResponse.reason === "denyList" ? "denied" : ratelimitResponse.success,
              ...geo
            }).catch((error) => {
              let errorMessage = "Failed to record analytics";
              if (`${error}`.includes("WRONGTYPE")) {
                errorMessage = `
    Failed to record analytics. See the information below:

    This can occur when you uprade to Ratelimit version 1.1.2
    or later from an earlier version.

    This occurs simply because the way we store analytics data
    has changed. To avoid getting this error, disable analytics
    for *an hour*, then simply enable it back.

    `;
              }
              console.warn(errorMessage, error);
            });
            ratelimitResponse.pending = Promise.all([ratelimitResponse.pending, analyticsP]);
          } catch (error) {
            console.warn("Failed to record analytics", error);
          }
          ;
        }
        ;
        return ratelimitResponse;
      };
      getKey = (identifier) => {
        return [this.prefix, identifier].join(":");
      };
      /**
       * returns a list of defined values from
       * [identifier, req.ip, req.userAgent, req.country]
       * 
       * @param identifier identifier
       * @param req limit options
       * @returns list of defined values
       */
      getDefinedMembers = (identifier, req) => {
        const members = [identifier, req?.ip, req?.userAgent, req?.country];
        return members.filter(Boolean);
      };
      /**
       * Set a dynamic rate limit globally.
       * 
       * When dynamicLimits is enabled, this limit will override the default limit
       * set in the constructor for all requests.
       * 
       * @example
       * ```ts
       * const ratelimit = new Ratelimit({
       *   redis: Redis.fromEnv(),
       *   limiter: Ratelimit.slidingWindow(10, "10 s"),
       *   dynamicLimits: true
       * });
       * 
       * // Set global dynamic limit to 120 requests
       * await ratelimit.setDynamicLimit({ limit: 120 });
       * 
       * // Disable dynamic limit (falls back to default)
       * await ratelimit.setDynamicLimit({ limit: false });
       * ```
       * 
       * @param options.limit - The new rate limit to apply globally, or false to disable
       */
      setDynamicLimit = async (options) => {
        if (!this.dynamicLimits) {
          throw new Error(
            "dynamicLimits must be enabled in the Ratelimit constructor to use setDynamicLimit()"
          );
        }
        const globalKey = `${this.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`;
        await (options.limit === false ? this.primaryRedis.del(globalKey) : this.primaryRedis.set(globalKey, options.limit));
      };
      /**
       * Get the current global dynamic rate limit.
       * 
       * @example
       * ```ts
       * const { dynamicLimit } = await ratelimit.getDynamicLimit();
       * console.log(dynamicLimit); // 120 or null if not set
       * ```
       * 
       * @returns Object containing the current global dynamic limit, or null if not set
       */
      getDynamicLimit = async () => {
        if (!this.dynamicLimits) {
          throw new Error(
            "dynamicLimits must be enabled in the Ratelimit constructor to use getDynamicLimit()"
          );
        }
        const globalKey = `${this.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}`;
        const result = await this.primaryRedis.get(globalKey);
        return { dynamicLimit: result === null ? null : Number(result) };
      };
    };
    function randomId() {
      let result = "";
      const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      const charactersLength = characters.length;
      for (let i = 0; i < 16; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
      }
      return result;
    }
    var MultiRegionRatelimit = class extends Ratelimit2 {
      /**
       * Create a new Ratelimit instance by providing a `@upstash/redis` instance and the algorithn of your choice.
       */
      constructor(config2) {
        super({
          prefix: config2.prefix,
          limiter: config2.limiter,
          timeout: config2.timeout,
          analytics: config2.analytics,
          dynamicLimits: config2.dynamicLimits,
          ctx: {
            regionContexts: config2.redis.map((redis) => ({
              redis,
              prefix: config2.prefix ?? DEFAULT_PREFIX
            })),
            cache: config2.ephemeralCache ? new Cache(config2.ephemeralCache) : void 0
          }
        });
        if (config2.dynamicLimits) {
          console.warn(
            "Warning: Dynamic limits are not yet supported for multi-region rate limiters. The dynamicLimits option will be ignored."
          );
        }
      }
      /**
       * Each request inside a fixed time increases a counter.
       * Once the counter reaches the maximum allowed number, all further requests are
       * rejected.
       *
       * **Pro:**
       *
       * - Newer requests are not starved by old ones.
       * - Low storage cost.
       *
       * **Con:**
       *
       * A burst of requests near the boundary of a window can result in a very
       * high request rate because two windows will be filled with requests quickly.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - A fixed timeframe
       */
      static fixedWindow(tokens, window) {
        const windowDuration = ms(window);
        return () => ({
          async limit(ctx, identifier, rate) {
            const requestId = randomId();
            const bucket = Math.floor(Date.now() / windowDuration);
            const key = [identifier, bucket].join(":");
            const incrementBy = rate ?? 1;
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
              if (blocked) {
                return {
                  success: false,
                  limit: tokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock"
                };
              }
            }
            const dbs = ctx.regionContexts.map((regionContext) => ({
              redis: regionContext.redis,
              request: safeEval(
                regionContext,
                SCRIPTS.multiRegion.fixedWindow.limit,
                [key],
                [requestId, windowDuration, incrementBy]
              )
            }));
            const firstResponse = await Promise.any(dbs.map((s2) => s2.request));
            const usedTokens = firstResponse.reduce(
              (accTokens, usedToken, index) => {
                let parsedToken = 0;
                if (index % 2) {
                  parsedToken = Number.parseInt(usedToken);
                }
                return accTokens + parsedToken;
              },
              0
            );
            const remaining = tokens - usedTokens;
            async function sync() {
              const individualIDs = await Promise.all(dbs.map((s2) => s2.request));
              const allIDs = [
                ...new Set(
                  individualIDs.flat().reduce((acc, curr, index) => {
                    if (index % 2 === 0) {
                      acc.push(curr);
                    }
                    return acc;
                  }, [])
                ).values()
              ];
              for (const db of dbs) {
                const usedDbTokensRequest = await db.request;
                const usedDbTokens = usedDbTokensRequest.reduce(
                  (accTokens, usedToken, index) => {
                    let parsedToken = 0;
                    if (index % 2) {
                      parsedToken = Number.parseInt(usedToken);
                    }
                    return accTokens + parsedToken;
                  },
                  0
                );
                const dbIdsRequest = await db.request;
                const dbIds = dbIdsRequest.reduce(
                  (ids, currentId, index) => {
                    if (index % 2 === 0) {
                      ids.push(currentId);
                    }
                    return ids;
                  },
                  []
                );
                if (usedDbTokens >= tokens) {
                  continue;
                }
                const diff = allIDs.filter((id) => !dbIds.includes(id));
                if (diff.length === 0) {
                  continue;
                }
                for (const requestId2 of diff) {
                  await db.redis.hset(key, { [requestId2]: incrementBy });
                }
              }
            }
            const success = remaining >= 0;
            const reset = (bucket + 1) * windowDuration;
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset);
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier);
              }
            }
            return {
              success,
              limit: tokens,
              remaining,
              reset,
              pending: sync()
            };
          },
          async getRemaining(ctx, identifier) {
            const bucket = Math.floor(Date.now() / windowDuration);
            const key = [identifier, bucket].join(":");
            const dbs = ctx.regionContexts.map((regionContext) => ({
              redis: regionContext.redis,
              request: safeEval(
                regionContext,
                SCRIPTS.multiRegion.fixedWindow.getRemaining,
                [key],
                [null]
              )
            }));
            const firstResponse = await Promise.any(dbs.map((s2) => s2.request));
            const usedTokens = firstResponse.reduce(
              (accTokens, usedToken, index) => {
                let parsedToken = 0;
                if (index % 2) {
                  parsedToken = Number.parseInt(usedToken);
                }
                return accTokens + parsedToken;
              },
              0
            );
            return {
              remaining: Math.max(0, tokens - usedTokens),
              reset: (bucket + 1) * windowDuration,
              limit: tokens
            };
          },
          async resetTokens(ctx, identifier) {
            const pattern = [identifier, "*"].join(":");
            if (ctx.cache) {
              ctx.cache.pop(identifier);
            }
            await Promise.all(
              ctx.regionContexts.map((regionContext) => {
                safeEval(regionContext, RESET_SCRIPT, [pattern], [null]);
              })
            );
          }
        });
      }
      /**
       * Combined approach of `slidingLogs` and `fixedWindow` with lower storage
       * costs than `slidingLogs` and improved boundary behavior by calculating a
       * weighted score between two windows.
       *
       * **Pro:**
       *
       * Good performance allows this to scale to very high loads.
       *
       * **Con:**
       *
       * Nothing major.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - The duration in which the user can max X requests.
       */
      static slidingWindow(tokens, window) {
        const windowSize = ms(window);
        const windowDuration = ms(window);
        return () => ({
          async limit(ctx, identifier, rate) {
            const requestId = randomId();
            const now = Date.now();
            const currentWindow = Math.floor(now / windowSize);
            const currentKey = [identifier, currentWindow].join(":");
            const previousWindow = currentWindow - 1;
            const previousKey = [identifier, previousWindow].join(":");
            const incrementBy = rate ?? 1;
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
              if (blocked) {
                return {
                  success: false,
                  limit: tokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock"
                };
              }
            }
            const dbs = ctx.regionContexts.map((regionContext) => ({
              redis: regionContext.redis,
              request: safeEval(
                regionContext,
                SCRIPTS.multiRegion.slidingWindow.limit,
                [currentKey, previousKey],
                [tokens, now, windowDuration, requestId, incrementBy]
                // lua seems to return `1` for true and `null` for false
              )
            }));
            const percentageInCurrent = now % windowDuration / windowDuration;
            const [current, previous, success] = await Promise.any(
              dbs.map((s2) => s2.request)
            );
            if (success) {
              current.push(requestId, incrementBy.toString());
            }
            const previousUsedTokens = previous.reduce(
              (accTokens, usedToken, index) => {
                let parsedToken = 0;
                if (index % 2) {
                  parsedToken = Number.parseInt(usedToken);
                }
                return accTokens + parsedToken;
              },
              0
            );
            const currentUsedTokens = current.reduce(
              (accTokens, usedToken, index) => {
                let parsedToken = 0;
                if (index % 2) {
                  parsedToken = Number.parseInt(usedToken);
                }
                return accTokens + parsedToken;
              },
              0
            );
            const previousPartialUsed = Math.ceil(
              previousUsedTokens * (1 - percentageInCurrent)
            );
            const usedTokens = previousPartialUsed + currentUsedTokens;
            const remaining = tokens - usedTokens;
            async function sync() {
              const res = await Promise.all(dbs.map((s2) => s2.request));
              const allCurrentIds = [
                ...new Set(
                  res.flatMap(([current2]) => current2).reduce((acc, curr, index) => {
                    if (index % 2 === 0) {
                      acc.push(curr);
                    }
                    return acc;
                  }, [])
                ).values()
              ];
              for (const db of dbs) {
                const [current2, _previous, _success] = await db.request;
                const dbIds = current2.reduce((ids, currentId, index) => {
                  if (index % 2 === 0) {
                    ids.push(currentId);
                  }
                  return ids;
                }, []);
                const usedDbTokens = current2.reduce(
                  (accTokens, usedToken, index) => {
                    let parsedToken = 0;
                    if (index % 2) {
                      parsedToken = Number.parseInt(usedToken);
                    }
                    return accTokens + parsedToken;
                  },
                  0
                );
                if (usedDbTokens >= tokens) {
                  continue;
                }
                const diff = allCurrentIds.filter((id) => !dbIds.includes(id));
                if (diff.length === 0) {
                  continue;
                }
                for (const requestId2 of diff) {
                  await db.redis.hset(currentKey, { [requestId2]: incrementBy });
                }
              }
            }
            const reset = (currentWindow + 1) * windowDuration;
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset);
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier);
              }
            }
            return {
              success: Boolean(success),
              limit: tokens,
              remaining: Math.max(0, remaining),
              reset,
              pending: sync()
            };
          },
          async getRemaining(ctx, identifier) {
            const now = Date.now();
            const currentWindow = Math.floor(now / windowSize);
            const currentKey = [identifier, currentWindow].join(":");
            const previousWindow = currentWindow - 1;
            const previousKey = [identifier, previousWindow].join(":");
            const dbs = ctx.regionContexts.map((regionContext) => ({
              redis: regionContext.redis,
              request: safeEval(
                regionContext,
                SCRIPTS.multiRegion.slidingWindow.getRemaining,
                [currentKey, previousKey],
                [now, windowSize]
                // lua seems to return `1` for true and `null` for false
              )
            }));
            const usedTokens = await Promise.any(dbs.map((s2) => s2.request));
            return {
              remaining: Math.max(0, tokens - usedTokens),
              reset: (currentWindow + 1) * windowSize,
              limit: tokens
            };
          },
          async resetTokens(ctx, identifier) {
            const pattern = [identifier, "*"].join(":");
            if (ctx.cache) {
              ctx.cache.pop(identifier);
            }
            await Promise.all(
              ctx.regionContexts.map((regionContext) => {
                safeEval(regionContext, RESET_SCRIPT, [pattern], [null]);
              })
            );
          }
        });
      }
    };
    var RegionRatelimit = class extends Ratelimit2 {
      /**
       * Create a new Ratelimit instance by providing a `@upstash/redis` instance and the algorithm of your choice.
       */
      constructor(config2) {
        super({
          prefix: config2.prefix,
          limiter: config2.limiter,
          timeout: config2.timeout,
          analytics: config2.analytics,
          ctx: {
            redis: config2.redis,
            prefix: config2.prefix ?? DEFAULT_PREFIX
          },
          ephemeralCache: config2.ephemeralCache,
          enableProtection: config2.enableProtection,
          denyListThreshold: config2.denyListThreshold,
          dynamicLimits: config2.dynamicLimits
        });
      }
      /**
       * Each request inside a fixed time increases a counter.
       * Once the counter reaches the maximum allowed number, all further requests are
       * rejected.
       *
       * **Pro:**
       *
       * - Newer requests are not starved by old ones.
       * - Low storage cost.
       *
       * **Con:**
       *
       * A burst of requests near the boundary of a window can result in a very
       * high request rate because two windows will be filled with requests quickly.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - A fixed timeframe
       */
      static fixedWindow(tokens, window) {
        const windowDuration = ms(window);
        return () => ({
          async limit(ctx, identifier, rate) {
            const bucket = Math.floor(Date.now() / windowDuration);
            const key = [identifier, bucket].join(":");
            const incrementBy = rate ?? 1;
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
              if (blocked) {
                return {
                  success: false,
                  limit: tokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock"
                };
              }
            }
            const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
            const [usedTokensAfterUpdate, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.fixedWindow.limit,
              [key, dynamicLimitKey],
              [tokens, windowDuration, incrementBy]
            );
            const success = usedTokensAfterUpdate <= effectiveLimit;
            const remainingTokens = Math.max(0, effectiveLimit - usedTokensAfterUpdate);
            const reset = (bucket + 1) * windowDuration;
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset);
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier);
              }
            }
            return {
              success,
              limit: effectiveLimit,
              remaining: remainingTokens,
              reset,
              pending: Promise.resolve()
            };
          },
          async getRemaining(ctx, identifier) {
            const bucket = Math.floor(Date.now() / windowDuration);
            const key = [identifier, bucket].join(":");
            const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
            const [remaining, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.fixedWindow.getRemaining,
              [key, dynamicLimitKey],
              [tokens]
            );
            return {
              remaining: Math.max(0, remaining),
              reset: (bucket + 1) * windowDuration,
              limit: effectiveLimit
            };
          },
          async resetTokens(ctx, identifier) {
            const pattern = [identifier, "*"].join(":");
            if (ctx.cache) {
              ctx.cache.pop(identifier);
            }
            await safeEval(
              ctx,
              RESET_SCRIPT,
              [pattern],
              [null]
            );
          }
        });
      }
      /**
       * Combined approach of `slidingLogs` and `fixedWindow` with lower storage
       * costs than `slidingLogs` and improved boundary behavior by calculating a
       * weighted score between two windows.
       *
       * **Pro:**
       *
       * Good performance allows this to scale to very high loads.
       *
       * **Con:**
       *
       * Nothing major.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - The duration in which the user can max X requests.
       */
      static slidingWindow(tokens, window) {
        const windowSize = ms(window);
        return () => ({
          async limit(ctx, identifier, rate) {
            const now = Date.now();
            const currentWindow = Math.floor(now / windowSize);
            const currentKey = [identifier, currentWindow].join(":");
            const previousWindow = currentWindow - 1;
            const previousKey = [identifier, previousWindow].join(":");
            const incrementBy = rate ?? 1;
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
              if (blocked) {
                return {
                  success: false,
                  limit: tokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock"
                };
              }
            }
            const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
            const [remainingTokens, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.slidingWindow.limit,
              [currentKey, previousKey, dynamicLimitKey],
              [tokens, now, windowSize, incrementBy]
            );
            const success = remainingTokens >= 0;
            const reset = (currentWindow + 1) * windowSize;
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset);
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier);
              }
            }
            return {
              success,
              limit: effectiveLimit,
              remaining: Math.max(0, remainingTokens),
              reset,
              pending: Promise.resolve()
            };
          },
          async getRemaining(ctx, identifier) {
            const now = Date.now();
            const currentWindow = Math.floor(now / windowSize);
            const currentKey = [identifier, currentWindow].join(":");
            const previousWindow = currentWindow - 1;
            const previousKey = [identifier, previousWindow].join(":");
            const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
            const [remaining, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.slidingWindow.getRemaining,
              [currentKey, previousKey, dynamicLimitKey],
              [tokens, now, windowSize]
            );
            return {
              remaining: Math.max(0, remaining),
              reset: (currentWindow + 1) * windowSize,
              limit: effectiveLimit
            };
          },
          async resetTokens(ctx, identifier) {
            const pattern = [identifier, "*"].join(":");
            if (ctx.cache) {
              ctx.cache.pop(identifier);
            }
            await safeEval(
              ctx,
              RESET_SCRIPT,
              [pattern],
              [null]
            );
          }
        });
      }
      /**
       * You have a bucket filled with `{maxTokens}` tokens that refills constantly
       * at `{refillRate}` per `{interval}`.
       * Every request will remove one token from the bucket and if there is no
       * token to take, the request is rejected.
       *
       * **Pro:**
       *
       * - Bursts of requests are smoothed out and you can process them at a constant
       * rate.
       * - Allows to set a higher initial burst limit by setting `maxTokens` higher
       * than `refillRate`
       */
      static tokenBucket(refillRate, interval, maxTokens) {
        const intervalDuration = ms(interval);
        return () => ({
          async limit(ctx, identifier, rate) {
            const now = Date.now();
            const incrementBy = rate ?? 1;
            if (ctx.cache && incrementBy > 0) {
              const { blocked, reset: reset2 } = ctx.cache.isBlocked(identifier);
              if (blocked) {
                return {
                  success: false,
                  limit: maxTokens,
                  remaining: 0,
                  reset: reset2,
                  pending: Promise.resolve(),
                  reason: "cacheBlock"
                };
              }
            }
            const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
            const [remaining, reset, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.tokenBucket.limit,
              [identifier, dynamicLimitKey],
              [maxTokens, intervalDuration, refillRate, now, incrementBy]
            );
            const success = remaining >= 0;
            if (ctx.cache) {
              if (!success) {
                ctx.cache.blockUntil(identifier, reset);
              } else if (incrementBy < 0) {
                ctx.cache.pop(identifier);
              }
            }
            return {
              success,
              limit: effectiveLimit,
              remaining: Math.max(0, remaining),
              reset,
              pending: Promise.resolve()
            };
          },
          async getRemaining(ctx, identifier) {
            const dynamicLimitKey = ctx.dynamicLimits ? `${ctx.prefix}${DYNAMIC_LIMIT_KEY_SUFFIX}` : "";
            const [remainingTokens, refilledAt, effectiveLimit] = await safeEval(
              ctx,
              SCRIPTS.singleRegion.tokenBucket.getRemaining,
              [identifier, dynamicLimitKey],
              [maxTokens]
            );
            const freshRefillAt = Date.now() + intervalDuration;
            const identifierRefillsAt = refilledAt + intervalDuration;
            return {
              remaining: Math.max(0, remainingTokens),
              reset: refilledAt === tokenBucketIdentifierNotFound ? freshRefillAt : identifierRefillsAt,
              limit: effectiveLimit
            };
          },
          async resetTokens(ctx, identifier) {
            const pattern = identifier;
            if (ctx.cache) {
              ctx.cache.pop(identifier);
            }
            await safeEval(
              ctx,
              RESET_SCRIPT,
              [pattern],
              [null]
            );
          }
        });
      }
      /**
       * cachedFixedWindow first uses the local cache to decide if a request may pass and then updates
       * it asynchronously.
       * This is experimental and not yet recommended for production use.
       *
       * @experimental
       *
       * Each request inside a fixed time increases a counter.
       * Once the counter reaches the maximum allowed number, all further requests are
       * rejected.
       *
       * **Pro:**
       *
       * - Newer requests are not starved by old ones.
       * - Low storage cost.
       *
       * **Con:**
       *
       * A burst of requests near the boundary of a window can result in a very
       * high request rate because two windows will be filled with requests quickly.
       *
       * @param tokens - How many requests a user can make in each time window.
       * @param window - A fixed timeframe
       */
      static cachedFixedWindow(tokens, window) {
        const windowDuration = ms(window);
        return () => ({
          async limit(ctx, identifier, rate) {
            if (!ctx.cache) {
              throw new Error("This algorithm requires a cache");
            }
            if (ctx.dynamicLimits) {
              console.warn(
                "Warning: Dynamic limits are not yet supported for cachedFixedWindow algorithm. The dynamicLimits option will be ignored."
              );
            }
            const bucket = Math.floor(Date.now() / windowDuration);
            const key = [identifier, bucket].join(":");
            const reset = (bucket + 1) * windowDuration;
            const incrementBy = rate ?? 1;
            const hit = typeof ctx.cache.get(key) === "number";
            if (hit) {
              const cachedTokensAfterUpdate = ctx.cache.incr(key, incrementBy);
              const success = cachedTokensAfterUpdate < tokens;
              const pending = success ? safeEval(
                ctx,
                SCRIPTS.singleRegion.cachedFixedWindow.limit,
                [key],
                [windowDuration, incrementBy]
              ) : Promise.resolve();
              return {
                success,
                limit: tokens,
                remaining: tokens - cachedTokensAfterUpdate,
                reset,
                pending
              };
            }
            const usedTokensAfterUpdate = await safeEval(
              ctx,
              SCRIPTS.singleRegion.cachedFixedWindow.limit,
              [key],
              [windowDuration, incrementBy]
            );
            ctx.cache.set(key, usedTokensAfterUpdate);
            const remaining = tokens - usedTokensAfterUpdate;
            return {
              success: remaining >= 0,
              limit: tokens,
              remaining,
              reset,
              pending: Promise.resolve()
            };
          },
          async getRemaining(ctx, identifier) {
            if (!ctx.cache) {
              throw new Error("This algorithm requires a cache");
            }
            const bucket = Math.floor(Date.now() / windowDuration);
            const key = [identifier, bucket].join(":");
            const hit = typeof ctx.cache.get(key) === "number";
            if (hit) {
              const cachedUsedTokens = ctx.cache.get(key) ?? 0;
              return {
                remaining: Math.max(0, tokens - cachedUsedTokens),
                reset: (bucket + 1) * windowDuration,
                limit: tokens
              };
            }
            const usedTokens = await safeEval(
              ctx,
              SCRIPTS.singleRegion.cachedFixedWindow.getRemaining,
              [key],
              [null]
            );
            return {
              remaining: Math.max(0, tokens - usedTokens),
              reset: (bucket + 1) * windowDuration,
              limit: tokens
            };
          },
          async resetTokens(ctx, identifier) {
            if (!ctx.cache) {
              throw new Error("This algorithm requires a cache");
            }
            const bucket = Math.floor(Date.now() / windowDuration);
            const key = [identifier, bucket].join(":");
            ctx.cache.pop(key);
            const pattern = [identifier, "*"].join(":");
            await safeEval(
              ctx,
              RESET_SCRIPT,
              [pattern],
              [null]
            );
          }
        });
      }
    };
  }
});

// node_modules/uncrypto/dist/crypto.node.mjs
import nodeCrypto from "node:crypto";
var subtle;
var init_crypto_node = __esm({
  "node_modules/uncrypto/dist/crypto.node.mjs"() {
    subtle = nodeCrypto.webcrypto?.subtle || {};
  }
});

// node_modules/@upstash/redis/chunk-IH7W44G6.mjs
function parseRecursive(obj) {
  const parsed = Array.isArray(obj) ? obj.map((o) => {
    try {
      return parseRecursive(o);
    } catch {
      return o;
    }
  }) : JSON.parse(obj);
  if (typeof parsed === "number" && parsed.toString() !== obj) {
    return obj;
  }
  return parsed;
}
function parseResponse(result) {
  try {
    return parseRecursive(result);
  } catch {
    return result;
  }
}
function deserializeScanResponse(result) {
  return [result[0], ...parseResponse(result.slice(1))];
}
function deserializeScanWithTypesResponse(result) {
  const [cursor, keys] = result;
  const parsedKeys = [];
  for (let i = 0; i < keys.length; i += 2) {
    parsedKeys.push({ key: keys[i], type: keys[i + 1] });
  }
  return [cursor, parsedKeys];
}
function mergeHeaders(...headers) {
  const merged = {};
  for (const header of headers) {
    if (!header) continue;
    for (const [key, value] of Object.entries(header)) {
      if (value !== void 0 && value !== null) {
        merged[key] = value;
      }
    }
  }
  return merged;
}
function kvArrayToObject(v) {
  if (typeof v === "object" && v !== null && !Array.isArray(v)) return v;
  if (!Array.isArray(v)) return {};
  const obj = {};
  for (let i = 0; i < v.length; i += 2) {
    if (typeof v[i] === "string") obj[v[i]] = v[i + 1];
  }
  return obj;
}
function base64decode(b64) {
  let dec = "";
  try {
    const binString = atob(b64);
    const size = binString.length;
    const bytes = new Uint8Array(size);
    for (let i = 0; i < size; i++) {
      bytes[i] = binString.charCodeAt(i);
    }
    dec = new TextDecoder().decode(bytes);
  } catch {
    dec = b64;
  }
  return dec;
}
function decode(raw) {
  let result = void 0;
  switch (typeof raw) {
    case "undefined": {
      return raw;
    }
    case "number": {
      result = raw;
      break;
    }
    case "object": {
      if (Array.isArray(raw)) {
        result = raw.map(
          (v) => typeof v === "string" ? base64decode(v) : Array.isArray(v) ? v.map((element) => decode(element)) : v
        );
      } else {
        result = null;
      }
      break;
    }
    case "string": {
      result = raw === "OK" ? "OK" : base64decode(raw);
      break;
    }
    default: {
      break;
    }
  }
  return result;
}
function merge(obj, key, value) {
  if (!value) {
    return obj;
  }
  obj[key] = obj[key] ? [obj[key], value].join(",") : value;
  return obj;
}
function isFieldType(value) {
  return typeof value === "string" && FIELD_TYPES.includes(value);
}
function isDetailedField(value) {
  return typeof value === "object" && value !== null && "type" in value && isFieldType(value.type);
}
function isNestedSchema(value) {
  return typeof value === "object" && value !== null && !isDetailedField(value);
}
function flattenSchema(schema, pathPrefix = []) {
  const fields = [];
  for (const [key, value] of Object.entries(schema)) {
    const currentPath = [...pathPrefix, key];
    const pathString = currentPath.join(".");
    if (isFieldType(value)) {
      fields.push({
        path: pathString,
        type: value
      });
    } else if (isDetailedField(value)) {
      fields.push({
        path: pathString,
        type: value.type,
        fast: "fast" in value ? value.fast : void 0,
        noTokenize: "noTokenize" in value ? value.noTokenize : void 0,
        noStem: "noStem" in value ? value.noStem : void 0,
        from: "from" in value ? value.from : void 0
      });
    } else if (isNestedSchema(value)) {
      const nestedFields = flattenSchema(value, currentPath);
      fields.push(...nestedFields);
    }
  }
  return fields;
}
function deserializeQueryResponse(rawResponse) {
  return rawResponse.map((itemRaw) => {
    const raw = itemRaw;
    const key = raw[0];
    const score = Number(raw[1]);
    const rawFields = raw[2];
    if (rawFields === void 0) {
      return { key, score };
    }
    if (!Array.isArray(rawFields) || rawFields.length === 0) {
      return { key, score, data: {} };
    }
    let data = {};
    for (const fieldRaw of rawFields) {
      const key2 = fieldRaw[0];
      const value = fieldRaw[1];
      const pathParts = key2.split(".");
      if (pathParts.length === 1) {
        data[key2] = value;
      } else {
        let currentObj = data;
        for (let i = 0; i < pathParts.length - 1; i++) {
          const pathPart = pathParts[i];
          if (!(pathPart in currentObj)) {
            currentObj[pathPart] = {};
          }
          currentObj = currentObj[pathPart];
        }
        currentObj[pathParts.at(-1)] = value;
      }
    }
    if ("$" in data) {
      data = data["$"];
    }
    return { key, score, data };
  });
}
function deserializeDescribeResponse(rawResponse) {
  const description = {};
  for (let i = 0; i < rawResponse.length; i += 2) {
    const descriptor = rawResponse[i];
    switch (descriptor) {
      case "name": {
        description["name"] = rawResponse[i + 1];
        break;
      }
      case "type": {
        description["dataType"] = rawResponse[i + 1].toLowerCase();
        break;
      }
      case "prefixes": {
        description["prefixes"] = rawResponse[i + 1];
        break;
      }
      case "language": {
        description["language"] = rawResponse[i + 1];
        break;
      }
      case "schema": {
        const schema = {};
        for (const fieldDescription of rawResponse[i + 1]) {
          const fieldName = fieldDescription[0];
          const fieldInfo = { type: fieldDescription[1] };
          if (fieldDescription.length > 2) {
            for (let j = 2; j < fieldDescription.length; j++) {
              const fieldOption = fieldDescription[j];
              switch (fieldOption) {
                case "NOSTEM": {
                  fieldInfo.noStem = true;
                  break;
                }
                case "NOTOKENIZE": {
                  fieldInfo.noTokenize = true;
                  break;
                }
                case "FAST": {
                  fieldInfo.fast = true;
                  break;
                }
                case "FROM": {
                  fieldInfo.from = fieldDescription[++j];
                  break;
                }
              }
            }
          }
          schema[fieldName] = fieldInfo;
        }
        description["schema"] = schema;
        break;
      }
    }
  }
  return description;
}
function parseCountResponse(rawResponse) {
  return typeof rawResponse === "number" ? rawResponse : Number.parseInt(rawResponse, 10);
}
function deserializeAggregateResponse(rawResponse) {
  return parseAggregationArray(rawResponse);
}
function parseAggregationArray(arr) {
  const result = {};
  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value = arr[i + 1];
    if (Array.isArray(value)) {
      if (value.length > 0 && typeof value[0] === "string") {
        result[key] = value[0] === "buckets" ? parseBucketsValue(value) : parseStatsValue(value);
      } else {
        result[key] = parseAggregationArray(value);
      }
    } else {
      result[key] = value;
    }
  }
  return result;
}
function coerceNumericString(value) {
  if (typeof value === "string" && value !== "" && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return value;
}
function parseStatsValue(arr) {
  const result = {};
  for (let i = 0; i < arr.length; i += 2) {
    const key = arr[i];
    const value = arr[i + 1];
    if (Array.isArray(value) && value.length > 0) {
      if (typeof value[0] === "string") {
        result[key] = parseStatsValue(value);
      } else if (Array.isArray(value[0]) && typeof value[0][0] === "string") {
        result[key] = value.map((item) => parseStatsValue(item));
      } else {
        result[key] = value;
      }
    } else {
      result[key] = coerceNumericString(value);
    }
  }
  return result;
}
function parseBucketsValue(arr) {
  if (arr[0] === "buckets" && Array.isArray(arr[1])) {
    const result = {
      buckets: arr[1].map((bucket) => {
        const bucketObj = {};
        for (let i = 0; i < bucket.length; i += 2) {
          const key = bucket[i];
          const value = bucket[i + 1];
          bucketObj[key] = Array.isArray(value) && value.length > 0 && typeof value[0] === "string" ? parseStatsValue(value) : value;
        }
        return bucketObj;
      })
    };
    for (let i = 2; i < arr.length; i += 2) {
      result[arr[i]] = arr[i + 1];
    }
    return result;
  }
  return arr;
}
function buildQueryCommand(redisCommand, name, options) {
  const query = JSON.stringify(options?.filter ?? {});
  const command = [redisCommand, name, query];
  if (options?.limit !== void 0) {
    command.push("LIMIT", options.limit.toString());
  }
  if (options?.offset !== void 0) {
    command.push("OFFSET", options.offset.toString());
  }
  if (options?.select && Object.keys(options.select).length === 0) {
    command.push("NOCONTENT");
  }
  if (options) {
    if ("orderBy" in options && options.orderBy) {
      command.push("ORDERBY");
      for (const [field, direction] of Object.entries(options.orderBy)) {
        command.push(field, direction);
      }
    } else if ("scoreFunc" in options && options.scoreFunc) {
      command.push("SCOREFUNC", ...buildScoreFunc(options.scoreFunc));
    }
  }
  if (options?.highlight) {
    command.push(
      "HIGHLIGHT",
      "FIELDS",
      options.highlight.fields.length.toString(),
      ...options.highlight.fields
    );
    if (options.highlight.preTag && options.highlight.postTag) {
      command.push("TAGS", options.highlight.preTag, options.highlight.postTag);
    }
  }
  if (options?.select && Object.keys(options.select).length > 0) {
    command.push(
      "SELECT",
      Object.keys(options.select).length.toString(),
      ...Object.keys(options.select)
    );
  }
  return command;
}
function buildScoreFunc(scoreBy) {
  const result = [];
  if (typeof scoreBy === "string") {
    result.push("FIELDVALUE", scoreBy);
  } else if ("fields" in scoreBy) {
    if (scoreBy.combineMode) {
      result.push("COMBINEMODE", scoreBy.combineMode.toUpperCase());
    }
    if (scoreBy.scoreMode) {
      result.push("SCOREMODE", scoreBy.scoreMode.toUpperCase());
    }
    for (const field of scoreBy.fields) {
      result.push(...buildScoreFuncField(field));
    }
  } else {
    result.push(...buildScoreFuncField(scoreBy));
  }
  return result;
}
function buildScoreFuncField(field) {
  const result = [];
  if (typeof field === "string") {
    result.push("FIELDVALUE", field);
  } else {
    if (field.scoreMode) {
      result.push("SCOREMODE", field.scoreMode.toUpperCase());
    }
    result.push("FIELDVALUE", field.field);
    if (field.modifier) {
      result.push("MODIFIER", field.modifier.toUpperCase());
    }
    if (field.factor !== void 0) {
      result.push("FACTOR", field.factor.toString());
    }
    if (field.missing !== void 0) {
      result.push("MISSING", field.missing.toString());
    }
  }
  return result;
}
function buildCreateIndexCommand(params) {
  const { name, schema, dataType, prefix, language, skipInitialScan, existsOk } = params;
  const prefixArray = Array.isArray(prefix) ? prefix : [prefix];
  const payload = [
    name,
    ...skipInitialScan ? ["SKIPINITIALSCAN"] : [],
    ...existsOk ? ["EXISTSOK"] : [],
    "ON",
    dataType.toUpperCase(),
    "PREFIX",
    prefixArray.length.toString(),
    ...prefixArray,
    ...language ? ["LANGUAGE", language] : [],
    "SCHEMA"
  ];
  const fields = flattenSchema(schema);
  for (const field of fields) {
    payload.push(field.path, field.type);
    if (field.fast) {
      payload.push("FAST");
    }
    if (field.noTokenize) {
      payload.push("NOTOKENIZE");
    }
    if (field.noStem) {
      payload.push("NOSTEM");
    }
    if (field.from) {
      payload.push("FROM", field.from);
    }
  }
  return ["SEARCH.CREATE", ...payload];
}
function buildAggregateCommand(name, options) {
  const query = JSON.stringify(options?.filter ?? {});
  const aggregations = JSON.stringify(options.aggregations);
  return ["SEARCH.AGGREGATE", name, query, aggregations];
}
async function createIndex(client, params) {
  const { name, schema } = params;
  const createIndexCommand = buildCreateIndexCommand(params);
  await new ExecCommand(createIndexCommand).exec(client);
  return initIndex(client, { name, schema });
}
function initIndex(client, params) {
  const { name, schema } = params;
  return new SearchIndex({ name, schema, client });
}
async function listAliases(client) {
  const command = ["SEARCH.LISTALIASES"];
  const rawResult = await new ExecCommand(command).exec(client);
  if (rawResult === 0 || Array.isArray(rawResult) && rawResult.length === 0) {
    return {};
  }
  if (!Array.isArray(rawResult)) {
    return {};
  }
  const aliases = {};
  for (const pair of rawResult) {
    if (Array.isArray(pair) && pair.length === 2) {
      const [alias, index] = pair;
      aliases[alias] = index;
    }
  }
  return aliases;
}
async function addAlias(client, { indexName, alias }) {
  const command = ["SEARCH.ALIASADD", alias, indexName];
  const result = await new ExecCommand(command).exec(client);
  return result;
}
async function delAlias(client, { alias }) {
  const command = ["SEARCH.ALIASDEL", alias];
  const result = await new ExecCommand(command).exec(client);
  return result;
}
function deserialize(result) {
  if (result.length === 0) {
    return null;
  }
  const obj = {};
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i];
    const value = result[i + 1];
    try {
      obj[key] = JSON.parse(value);
    } catch {
      obj[key] = value;
    }
  }
  return obj;
}
function deserialize2(result) {
  if (!Array.isArray(result)) return [];
  return result.map((libRaw) => {
    const lib = kvArrayToObject(libRaw);
    const functionsParsed = lib.functions.map(
      (fnRaw) => kvArrayToObject(fnRaw)
    );
    return {
      libraryName: lib.library_name,
      engine: lib.engine,
      functions: functionsParsed.map((fn) => ({
        name: fn.name,
        description: fn.description ?? void 0,
        flags: fn.flags
      })),
      libraryCode: lib.library_code
    };
  });
}
function deserialize3(result) {
  const rawEngines = kvArrayToObject(kvArrayToObject(result).engines);
  const parsedEngines = Object.fromEntries(
    Object.entries(rawEngines).map(([key, value]) => [key, kvArrayToObject(value)])
  );
  const final = {
    engines: Object.fromEntries(
      Object.entries(parsedEngines).map(([key, value]) => [
        key,
        {
          librariesCount: value.libraries_count,
          functionsCount: value.functions_count
        }
      ])
    )
  };
  return final;
}
function transform(result) {
  const final = [];
  for (const pos of result) {
    if (!pos?.[0] || !pos?.[1]) {
      continue;
    }
    final.push({ lng: Number.parseFloat(pos[0]), lat: Number.parseFloat(pos[1]) });
  }
  return final;
}
function deserialize4(result) {
  if (result.length === 0) {
    return null;
  }
  const obj = {};
  for (let i = 0; i < result.length; i += 2) {
    const key = result[i];
    const value = result[i + 1];
    try {
      const valueIsNumberAndNotSafeInteger = !Number.isNaN(Number(value)) && !Number.isSafeInteger(Number(value));
      obj[key] = valueIsNumberAndNotSafeInteger ? value : JSON.parse(value);
    } catch {
      obj[key] = value;
    }
  }
  return obj;
}
function deserialize5(fields, result) {
  if (result.every((field) => field === null)) {
    return null;
  }
  const obj = {};
  for (const [i, field] of fields.entries()) {
    try {
      obj[field] = JSON.parse(result[i]);
    } catch {
      obj[field] = result[i];
    }
  }
  return obj;
}
function deserialize6(result) {
  const obj = {};
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i];
      const entries = e[i + 1];
      if (!(streamId in obj)) {
        obj[streamId] = {};
      }
      for (let j = 0; j < entries.length; j += 2) {
        const field = entries[j];
        const value = entries[j + 1];
        try {
          obj[streamId][field] = JSON.parse(value);
        } catch {
          obj[streamId][field] = value;
        }
      }
    }
  }
  return obj;
}
function deserialize7(result) {
  const obj = {};
  for (const e of result) {
    for (let i = 0; i < e.length; i += 2) {
      const streamId = e[i];
      const entries = e[i + 1];
      if (!(streamId in obj)) {
        obj[streamId] = {};
      }
      for (let j = 0; j < entries.length; j += 2) {
        const field = entries[j];
        const value = entries[j + 1];
        try {
          obj[streamId][field] = JSON.parse(value);
        } catch {
          obj[streamId][field] = value;
        }
      }
    }
  }
  return obj;
}
function createAutoPipelineProxy(_redis, namespace = "root") {
  const redis = _redis;
  if (!redis.autoPipelineExecutor) {
    redis.autoPipelineExecutor = new AutoPipelineExecutor(redis);
  }
  return new Proxy(redis, {
    get: (redis2, command) => {
      if (command === "pipelineCounter") {
        return redis2.autoPipelineExecutor.pipelineCounter;
      }
      if (namespace === "root" && command === "json") {
        return createAutoPipelineProxy(redis2, "json");
      }
      if (namespace === "root" && command === "functions") {
        return createAutoPipelineProxy(redis2, "functions");
      }
      if (namespace === "root") {
        const commandInRedisButNotPipeline = command in redis2 && !(command in redis2.autoPipelineExecutor.pipeline);
        const isCommandExcluded = EXCLUDE_COMMANDS.has(command);
        if (commandInRedisButNotPipeline || isCommandExcluded) {
          return redis2[command];
        }
      }
      const pipeline = redis2.autoPipelineExecutor.pipeline;
      const targetFunction = namespace === "json" ? pipeline.json[command] : namespace === "functions" ? pipeline.functions[command] : pipeline[command];
      const isFunction = typeof targetFunction === "function";
      if (isFunction) {
        return (...args) => {
          return redis2.autoPipelineExecutor.withAutoPipeline((pipeline2) => {
            const targetFunction2 = namespace === "json" ? pipeline2.json[command] : namespace === "functions" ? pipeline2.functions[command] : pipeline2[command];
            targetFunction2(...args);
          });
        };
      }
      return targetFunction;
    }
  });
}
var __defProp2, __export2, error_exports, UpstashError, UrlError, UpstashJSONParseError, MAX_BUFFER_SIZE, HttpClient, defaultSerializer, Command, ExecCommand, FIELD_TYPES, SearchIndex, HRandFieldCommand, AppendCommand, BitCountCommand, BitFieldCommand, BitOpCommand, BitPosCommand, ClientSetInfoCommand, CopyCommand, DBSizeCommand, DecrCommand, DecrByCommand, DelCommand, EchoCommand, EvalROCommand, EvalCommand, EvalshaROCommand, EvalshaCommand, ExistsCommand, ExpireCommand, ExpireAtCommand, FCallCommand, FCallRoCommand, FlushAllCommand, FlushDBCommand, FunctionDeleteCommand, FunctionFlushCommand, FunctionListCommand, FunctionLoadCommand, FunctionStatsCommand, GeoAddCommand, GeoDistCommand, GeoHashCommand, GeoPosCommand, GeoSearchCommand, GeoSearchStoreCommand, GetCommand, GetBitCommand, GetDelCommand, GetExCommand, GetRangeCommand, GetSetCommand, HDelCommand, HExistsCommand, HExpireCommand, HExpireAtCommand, HExpireTimeCommand, HPersistCommand, HPExpireCommand, HPExpireAtCommand, HPExpireTimeCommand, HPTtlCommand, HGetCommand, HGetAllCommand, HMGetCommand, HGetDelCommand, HGetExCommand, HIncrByCommand, HIncrByFloatCommand, HKeysCommand, HLenCommand, HMSetCommand, HScanCommand, HSetCommand, HSetExCommand, HSetNXCommand, HStrLenCommand, HTtlCommand, HValsCommand, IncrCommand, IncrByCommand, IncrByFloatCommand, JsonArrAppendCommand, JsonArrIndexCommand, JsonArrInsertCommand, JsonArrLenCommand, JsonArrPopCommand, JsonArrTrimCommand, JsonClearCommand, JsonDelCommand, JsonForgetCommand, JsonGetCommand, JsonMergeCommand, JsonMGetCommand, JsonMSetCommand, JsonNumIncrByCommand, JsonNumMultByCommand, JsonObjKeysCommand, JsonObjLenCommand, JsonRespCommand, JsonSetCommand, JsonStrAppendCommand, JsonStrLenCommand, JsonToggleCommand, JsonTypeCommand, KeysCommand, LIndexCommand, LInsertCommand, LLenCommand, LMoveCommand, LmPopCommand, LPopCommand, LPosCommand, LPushCommand, LPushXCommand, LRangeCommand, LRemCommand, LSetCommand, LTrimCommand, MGetCommand, MSetCommand, MSetNXCommand, PersistCommand, PExpireCommand, PExpireAtCommand, PfAddCommand, PfCountCommand, PfMergeCommand, PingCommand, PSetEXCommand, PTtlCommand, PublishCommand, RandomKeyCommand, RenameCommand, RenameNXCommand, RPopCommand, RPushCommand, RPushXCommand, SAddCommand, ScanCommand, SCardCommand, ScriptExistsCommand, ScriptFlushCommand, ScriptLoadCommand, SDiffCommand, SDiffStoreCommand, SetCommand, SetBitCommand, SetExCommand, SetNxCommand, SetRangeCommand, SInterCommand, SInterCardCommand, SInterStoreCommand, SIsMemberCommand, SMembersCommand, SMIsMemberCommand, SMoveCommand, SPopCommand, SRandMemberCommand, SRemCommand, SScanCommand, StrLenCommand, SUnionCommand, SUnionStoreCommand, TimeCommand, TouchCommand, TtlCommand, TypeCommand, UnlinkCommand, XAckCommand, XAckDelCommand, XAddCommand, XAutoClaim, XClaimCommand, XDelCommand, XDelExCommand, XGroupCommand, XInfoCommand, XLenCommand, XPendingCommand, XRangeCommand, UNBALANCED_XREAD_ERR, XReadCommand, UNBALANCED_XREADGROUP_ERR, XReadGroupCommand, XRevRangeCommand, XTrimCommand, ZAddCommand, ZCardCommand, ZCountCommand, ZIncrByCommand, ZInterStoreCommand, ZLexCountCommand, ZPopMaxCommand, ZPopMinCommand, ZRangeCommand, ZRankCommand, ZRemCommand, ZRemRangeByLexCommand, ZRemRangeByRankCommand, ZRemRangeByScoreCommand, ZRevRankCommand, ZScanCommand, ZScoreCommand, ZUnionCommand, ZUnionStoreCommand, ZDiffStoreCommand, ZMScoreCommand, Pipeline, EXCLUDE_COMMANDS, AutoPipelineExecutor, PSubscribeCommand, Subscriber, SubscribeCommand, parseWithTryCatch, Script, ScriptRO, Redis, VERSION;
var init_chunk_IH7W44G6 = __esm({
  "node_modules/@upstash/redis/chunk-IH7W44G6.mjs"() {
    init_crypto_node();
    init_crypto_node();
    __defProp2 = Object.defineProperty;
    __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    error_exports = {};
    __export2(error_exports, {
      UpstashError: () => UpstashError,
      UpstashJSONParseError: () => UpstashJSONParseError,
      UrlError: () => UrlError
    });
    UpstashError = class extends Error {
      constructor(message2, options) {
        super(message2, options);
        this.name = "UpstashError";
      }
    };
    UrlError = class extends Error {
      constructor(url) {
        super(
          `Upstash Redis client was passed an invalid URL. You should pass a URL starting with https. Received: "${url}". `
        );
        this.name = "UrlError";
      }
    };
    UpstashJSONParseError = class extends UpstashError {
      constructor(body, options) {
        const truncatedBody = body.length > 200 ? body.slice(0, 200) + "..." : body;
        super(`Unable to parse response body: ${truncatedBody}`, options);
        this.name = "UpstashJSONParseError";
      }
    };
    MAX_BUFFER_SIZE = 1024 * 1024;
    HttpClient = class {
      baseUrl;
      headers;
      options;
      readYourWrites;
      upstashSyncToken = "";
      hasCredentials;
      retry;
      constructor(config2) {
        this.options = {
          backend: config2.options?.backend,
          agent: config2.agent,
          responseEncoding: config2.responseEncoding ?? "base64",
          // default to base64
          cache: config2.cache,
          signal: config2.signal,
          keepAlive: config2.keepAlive ?? true
        };
        this.upstashSyncToken = "";
        this.readYourWrites = config2.readYourWrites ?? true;
        this.baseUrl = (config2.baseUrl || "").replace(/\/$/, "");
        const urlRegex = /^https?:\/\/[^\s#$./?].\S*$/;
        if (this.baseUrl && !urlRegex.test(this.baseUrl)) {
          throw new UrlError(this.baseUrl);
        }
        this.headers = {
          "Content-Type": "application/json",
          ...config2.headers
        };
        this.hasCredentials = Boolean(this.baseUrl && this.headers.authorization.split(" ")[1]);
        if (this.options.responseEncoding === "base64") {
          this.headers["Upstash-Encoding"] = "base64";
        }
        this.retry = typeof config2.retry === "boolean" && !config2.retry ? {
          attempts: 1,
          backoff: () => 0
        } : {
          attempts: config2.retry?.retries ?? 5,
          backoff: config2.retry?.backoff ?? ((retryCount) => Math.exp(retryCount) * 50)
        };
      }
      mergeTelemetry(telemetry) {
        this.headers = merge(this.headers, "Upstash-Telemetry-Runtime", telemetry.runtime);
        this.headers = merge(this.headers, "Upstash-Telemetry-Platform", telemetry.platform);
        this.headers = merge(this.headers, "Upstash-Telemetry-Sdk", telemetry.sdk);
      }
      async request(req) {
        const requestHeaders = mergeHeaders(this.headers, req.headers ?? {});
        const requestUrl = [this.baseUrl, ...req.path ?? []].join("/");
        const isEventStream = requestHeaders.Accept === "text/event-stream";
        const signal = req.signal ?? this.options.signal;
        const isSignalFunction = typeof signal === "function";
        const requestOptions = {
          cache: this.options.cache,
          method: "POST",
          headers: requestHeaders,
          body: JSON.stringify(req.body),
          keepalive: this.options.keepAlive,
          agent: this.options.agent,
          signal: isSignalFunction ? signal() : signal,
          /**
           * Fastly specific
           */
          backend: this.options.backend
        };
        if (!this.hasCredentials) {
          console.warn(
            "[Upstash Redis] Redis client was initialized without url or token. Failed to execute command."
          );
        }
        if (this.readYourWrites) {
          const newHeader = this.upstashSyncToken;
          this.headers["upstash-sync-token"] = newHeader;
        }
        let res = null;
        let error = null;
        for (let i = 0; i <= this.retry.attempts; i++) {
          try {
            res = await fetch(requestUrl, requestOptions);
            break;
          } catch (error_) {
            if (requestOptions.signal?.aborted && isSignalFunction) {
              throw error_;
            } else if (requestOptions.signal?.aborted) {
              const myBlob = new Blob([
                JSON.stringify({ result: requestOptions.signal.reason ?? "Aborted" })
              ]);
              const myOptions = {
                status: 200,
                statusText: requestOptions.signal.reason ?? "Aborted"
              };
              res = new Response(myBlob, myOptions);
              break;
            }
            error = error_;
            if (i < this.retry.attempts) {
              await new Promise((r) => setTimeout(r, this.retry.backoff(i)));
            }
          }
        }
        if (!res) {
          throw error ?? new Error("Exhausted all retries");
        }
        if (!res.ok) {
          let body2;
          const rawBody2 = await res.text();
          try {
            body2 = JSON.parse(rawBody2);
          } catch (error2) {
            throw new UpstashJSONParseError(rawBody2, { cause: error2 });
          }
          throw new UpstashError(`${body2.error}, command was: ${JSON.stringify(req.body)}`);
        }
        if (this.readYourWrites) {
          const headers = res.headers;
          this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
        }
        if (isEventStream && req && req.onMessage && res.body) {
          const reader = res.body.getReader();
          const decoder2 = new TextDecoder();
          (async () => {
            try {
              let buffer = "";
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder2.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";
                if (buffer.length > MAX_BUFFER_SIZE) {
                  throw new Error("Buffer size exceeded (1MB)");
                }
                for (const line of lines) {
                  if (line.startsWith("data: ")) {
                    const data = line.slice(6);
                    req.onMessage?.(data);
                  }
                }
              }
            } catch (error2) {
              if (error2 instanceof Error && error2.name === "AbortError") {
              } else {
                console.error("Stream reading error:", error2);
              }
            } finally {
              try {
                await reader.cancel();
              } catch {
              }
            }
          })();
          return { result: 1 };
        }
        let body;
        const rawBody = await res.text();
        try {
          body = JSON.parse(rawBody);
        } catch (error2) {
          throw new UpstashJSONParseError(rawBody, { cause: error2 });
        }
        if (this.readYourWrites) {
          const headers = res.headers;
          this.upstashSyncToken = headers.get("upstash-sync-token") ?? "";
        }
        if (this.options.responseEncoding === "base64") {
          if (Array.isArray(body)) {
            return body.map(({ result: result2, error: error2 }) => ({
              result: decode(result2),
              error: error2
            }));
          }
          const result = decode(body.result);
          return { result, error: body.error };
        }
        return body;
      }
    };
    defaultSerializer = (c) => {
      switch (typeof c) {
        case "string":
        case "number":
        case "boolean": {
          return c;
        }
        default: {
          return JSON.stringify(c);
        }
      }
    };
    Command = class {
      command;
      serialize;
      deserialize;
      headers;
      path;
      onMessage;
      isStreaming;
      signal;
      /**
       * Create a new command instance.
       *
       * You can define a custom `deserialize` function. By default we try to deserialize as json.
       */
      constructor(command, opts) {
        this.serialize = defaultSerializer;
        this.deserialize = opts?.automaticDeserialization === void 0 || opts.automaticDeserialization ? opts?.deserialize ?? parseResponse : (x) => x;
        this.command = command.map((c) => this.serialize(c));
        this.headers = opts?.headers;
        this.path = opts?.path;
        this.onMessage = opts?.streamOptions?.onMessage;
        this.isStreaming = opts?.streamOptions?.isStreaming ?? false;
        this.signal = opts?.streamOptions?.signal;
        if (opts?.latencyLogging) {
          const originalExec = this.exec.bind(this);
          this.exec = async (client) => {
            const start = performance.now();
            const result = await originalExec(client);
            const end = performance.now();
            const loggerResult = (end - start).toFixed(2);
            console.log(
              `Latency for \x1B[38;2;19;185;39m${this.command[0].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
            );
            return result;
          };
        }
      }
      /**
       * Execute the command using a client.
       */
      async exec(client) {
        const { result, error } = await client.request({
          body: this.command,
          path: this.path,
          upstashSyncToken: client.upstashSyncToken,
          headers: this.headers,
          onMessage: this.onMessage,
          isStreaming: this.isStreaming,
          signal: this.signal
        });
        if (error) {
          throw new UpstashError(error);
        }
        if (result === void 0) {
          throw new TypeError("Request did not return a result");
        }
        return this.deserialize(result);
      }
    };
    ExecCommand = class extends Command {
      constructor(cmd, opts) {
        const normalizedCmd = cmd.map((arg) => typeof arg === "string" ? arg : String(arg));
        super(normalizedCmd, opts);
      }
    };
    FIELD_TYPES = [
      "TEXT",
      "U64",
      "I64",
      "F64",
      "BOOL",
      "DATE",
      "KEYWORD",
      "FACET"
    ];
    SearchIndex = class {
      name;
      schema;
      client;
      constructor({ name, schema, client }) {
        this.name = name;
        this.schema = schema;
        this.client = client;
      }
      async waitIndexing() {
        const command = ["SEARCH.WAITINDEXING", this.name];
        return await new ExecCommand(command).exec(this.client);
      }
      async describe() {
        const command = ["SEARCH.DESCRIBE", this.name];
        const rawResult = await new ExecCommand(command).exec(
          this.client
        );
        if (!rawResult) return null;
        return deserializeDescribeResponse(rawResult);
      }
      async query(options) {
        const command = buildQueryCommand("SEARCH.QUERY", this.name, options);
        const rawResult = await new ExecCommand(command).exec(
          this.client
        );
        if (!rawResult) return rawResult;
        return deserializeQueryResponse(rawResult);
      }
      async aggregate(options) {
        const command = buildAggregateCommand(this.name, options);
        const rawResult = await new ExecCommand(
          command
        ).exec(this.client);
        return deserializeAggregateResponse(rawResult);
      }
      async count({ filter }) {
        const command = buildQueryCommand("SEARCH.COUNT", this.name, { filter });
        const rawResult = await new ExecCommand(command).exec(
          this.client
        );
        return { count: parseCountResponse(rawResult) };
      }
      async drop() {
        const command = ["SEARCH.DROP", this.name];
        const result = await new ExecCommand(command).exec(this.client);
        return result;
      }
      async addAlias({ alias }) {
        const command = ["SEARCH.ALIASADD", alias, this.name];
        const result = await new ExecCommand(command).exec(this.client);
        return result;
      }
    };
    HRandFieldCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["hrandfield", cmd[0]];
        if (typeof cmd[1] === "number") {
          command.push(cmd[1]);
        }
        if (cmd[2]) {
          command.push("WITHVALUES");
        }
        super(command, {
          // @ts-expect-error to silence compiler
          deserialize: cmd[2] ? (result) => deserialize(result) : opts?.deserialize,
          ...opts
        });
      }
    };
    AppendCommand = class extends Command {
      constructor(cmd, opts) {
        super(["append", ...cmd], opts);
      }
    };
    BitCountCommand = class extends Command {
      constructor([key, start, end], opts) {
        const command = ["bitcount", key];
        if (typeof start === "number") {
          command.push(start);
        }
        if (typeof end === "number") {
          command.push(end);
        }
        super(command, opts);
      }
    };
    BitFieldCommand = class {
      constructor(args, client, opts, execOperation = (command) => command.exec(this.client)) {
        this.client = client;
        this.opts = opts;
        this.execOperation = execOperation;
        this.command = ["bitfield", ...args];
      }
      command;
      chain(...args) {
        this.command.push(...args);
        return this;
      }
      get(...args) {
        return this.chain("get", ...args);
      }
      set(...args) {
        return this.chain("set", ...args);
      }
      incrby(...args) {
        return this.chain("incrby", ...args);
      }
      overflow(overflow) {
        return this.chain("overflow", overflow);
      }
      exec() {
        const command = new Command(this.command, this.opts);
        return this.execOperation(command);
      }
    };
    BitOpCommand = class extends Command {
      constructor(cmd, opts) {
        super(["bitop", ...cmd], opts);
      }
    };
    BitPosCommand = class extends Command {
      constructor(cmd, opts) {
        super(["bitpos", ...cmd], opts);
      }
    };
    ClientSetInfoCommand = class extends Command {
      constructor([attribute, value], opts) {
        super(["CLIENT", "SETINFO", attribute.toUpperCase(), value], opts);
      }
    };
    CopyCommand = class extends Command {
      constructor([key, destinationKey, opts], commandOptions) {
        super(["COPY", key, destinationKey, ...opts?.replace ? ["REPLACE"] : []], {
          ...commandOptions,
          deserialize(result) {
            if (result > 0) {
              return "COPIED";
            }
            return "NOT_COPIED";
          }
        });
      }
    };
    DBSizeCommand = class extends Command {
      constructor(opts) {
        super(["dbsize"], opts);
      }
    };
    DecrCommand = class extends Command {
      constructor(cmd, opts) {
        super(["decr", ...cmd], opts);
      }
    };
    DecrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["decrby", ...cmd], opts);
      }
    };
    DelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["del", ...cmd], opts);
      }
    };
    EchoCommand = class extends Command {
      constructor(cmd, opts) {
        super(["echo", ...cmd], opts);
      }
    };
    EvalROCommand = class extends Command {
      constructor([script, keys, args], opts) {
        super(["eval_ro", script, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    EvalCommand = class extends Command {
      constructor([script, keys, args], opts) {
        super(["eval", script, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    EvalshaROCommand = class extends Command {
      constructor([sha, keys, args], opts) {
        super(["evalsha_ro", sha, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    EvalshaCommand = class extends Command {
      constructor([sha, keys, args], opts) {
        super(["evalsha", sha, keys.length, ...keys, ...args ?? []], opts);
      }
    };
    ExistsCommand = class extends Command {
      constructor(cmd, opts) {
        super(["exists", ...cmd], opts);
      }
    };
    ExpireCommand = class extends Command {
      constructor(cmd, opts) {
        super(["expire", ...cmd.filter(Boolean)], opts);
      }
    };
    ExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        super(["expireat", ...cmd], opts);
      }
    };
    FCallCommand = class extends Command {
      constructor([functionName, keys, args], opts) {
        super(["fcall", functionName, ...keys ? [keys.length, ...keys] : [0], ...args ?? []], opts);
      }
    };
    FCallRoCommand = class extends Command {
      constructor([functionName, keys, args], opts) {
        super(
          ["fcall_ro", functionName, ...keys ? [keys.length, ...keys] : [0], ...args ?? []],
          opts
        );
      }
    };
    FlushAllCommand = class extends Command {
      constructor(args, opts) {
        const command = ["flushall"];
        if (args && args.length > 0 && args[0].async) {
          command.push("async");
        }
        super(command, opts);
      }
    };
    FlushDBCommand = class extends Command {
      constructor([opts], cmdOpts) {
        const command = ["flushdb"];
        if (opts?.async) {
          command.push("async");
        }
        super(command, cmdOpts);
      }
    };
    FunctionDeleteCommand = class extends Command {
      constructor([libraryName], opts) {
        super(["function", "delete", libraryName], opts);
      }
    };
    FunctionFlushCommand = class extends Command {
      constructor(opts) {
        super(["function", "flush"], opts);
      }
    };
    FunctionListCommand = class extends Command {
      constructor([args], opts) {
        const command = ["function", "list"];
        if (args?.libraryName) {
          command.push("libraryname", args.libraryName);
        }
        if (args?.withCode) {
          command.push("withcode");
        }
        super(command, { deserialize: deserialize2, ...opts });
      }
    };
    FunctionLoadCommand = class extends Command {
      constructor([args], opts) {
        super(["function", "load", ...args.replace ? ["replace"] : [], args.code], opts);
      }
    };
    FunctionStatsCommand = class extends Command {
      constructor(opts) {
        super(["function", "stats"], { deserialize: deserialize3, ...opts });
      }
    };
    GeoAddCommand = class extends Command {
      constructor([key, arg1, ...arg2], opts) {
        const command = ["geoadd", key];
        if ("nx" in arg1 && arg1.nx) {
          command.push("nx");
        } else if ("xx" in arg1 && arg1.xx) {
          command.push("xx");
        }
        if ("ch" in arg1 && arg1.ch) {
          command.push("ch");
        }
        if ("latitude" in arg1 && arg1.latitude) {
          command.push(arg1.longitude, arg1.latitude, arg1.member);
        }
        command.push(
          ...arg2.flatMap(({ latitude, longitude, member }) => [longitude, latitude, member])
        );
        super(command, opts);
      }
    };
    GeoDistCommand = class extends Command {
      constructor([key, member1, member2, unit = "M"], opts) {
        super(["GEODIST", key, member1, member2, unit], opts);
      }
    };
    GeoHashCommand = class extends Command {
      constructor(cmd, opts) {
        const [key] = cmd;
        const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
        super(["GEOHASH", key, ...members], opts);
      }
    };
    GeoPosCommand = class extends Command {
      constructor(cmd, opts) {
        const [key] = cmd;
        const members = Array.isArray(cmd[1]) ? cmd[1] : cmd.slice(1);
        super(["GEOPOS", key, ...members], {
          deserialize: (result) => transform(result),
          ...opts
        });
      }
    };
    GeoSearchCommand = class extends Command {
      constructor([key, centerPoint, shape, order, opts], commandOptions) {
        const command = ["GEOSEARCH", key];
        if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
          command.push(centerPoint.type, centerPoint.member);
        }
        if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
          command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
        }
        if (shape.type === "BYRADIUS" || shape.type === "byradius") {
          command.push(shape.type, shape.radius, shape.radiusType);
        }
        if (shape.type === "BYBOX" || shape.type === "bybox") {
          command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
        }
        command.push(order);
        if (opts?.count) {
          command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
        }
        const transform2 = (result) => {
          if (!opts?.withCoord && !opts?.withDist && !opts?.withHash) {
            return result.map((member) => {
              try {
                return { member: JSON.parse(member) };
              } catch {
                return { member };
              }
            });
          }
          return result.map((members) => {
            let counter = 1;
            const obj = {};
            try {
              obj.member = JSON.parse(members[0]);
            } catch {
              obj.member = members[0];
            }
            if (opts.withDist) {
              obj.dist = Number.parseFloat(members[counter++]);
            }
            if (opts.withHash) {
              obj.hash = members[counter++].toString();
            }
            if (opts.withCoord) {
              obj.coord = {
                long: Number.parseFloat(members[counter][0]),
                lat: Number.parseFloat(members[counter][1])
              };
            }
            return obj;
          });
        };
        super(
          [
            ...command,
            ...opts?.withCoord ? ["WITHCOORD"] : [],
            ...opts?.withDist ? ["WITHDIST"] : [],
            ...opts?.withHash ? ["WITHHASH"] : []
          ],
          {
            deserialize: transform2,
            ...commandOptions
          }
        );
      }
    };
    GeoSearchStoreCommand = class extends Command {
      constructor([destination, key, centerPoint, shape, order, opts], commandOptions) {
        const command = ["GEOSEARCHSTORE", destination, key];
        if (centerPoint.type === "FROMMEMBER" || centerPoint.type === "frommember") {
          command.push(centerPoint.type, centerPoint.member);
        }
        if (centerPoint.type === "FROMLONLAT" || centerPoint.type === "fromlonlat") {
          command.push(centerPoint.type, centerPoint.coordinate.lon, centerPoint.coordinate.lat);
        }
        if (shape.type === "BYRADIUS" || shape.type === "byradius") {
          command.push(shape.type, shape.radius, shape.radiusType);
        }
        if (shape.type === "BYBOX" || shape.type === "bybox") {
          command.push(shape.type, shape.rect.width, shape.rect.height, shape.rectType);
        }
        command.push(order);
        if (opts?.count) {
          command.push("COUNT", opts.count.limit, ...opts.count.any ? ["ANY"] : []);
        }
        super([...command, ...opts?.storeDist ? ["STOREDIST"] : []], commandOptions);
      }
    };
    GetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["get", ...cmd], opts);
      }
    };
    GetBitCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getbit", ...cmd], opts);
      }
    };
    GetDelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getdel", ...cmd], opts);
      }
    };
    GetExCommand = class extends Command {
      constructor([key, opts], cmdOpts) {
        const command = ["getex", key];
        if (opts) {
          if ("ex" in opts && typeof opts.ex === "number") {
            command.push("ex", opts.ex);
          } else if ("px" in opts && typeof opts.px === "number") {
            command.push("px", opts.px);
          } else if ("exat" in opts && typeof opts.exat === "number") {
            command.push("exat", opts.exat);
          } else if ("pxat" in opts && typeof opts.pxat === "number") {
            command.push("pxat", opts.pxat);
          } else if ("persist" in opts && opts.persist) {
            command.push("persist");
          }
        }
        super(command, cmdOpts);
      }
    };
    GetRangeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getrange", ...cmd], opts);
      }
    };
    GetSetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["getset", ...cmd], opts);
      }
    };
    HDelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hdel", ...cmd], opts);
      }
    };
    HExistsCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hexists", ...cmd], opts);
      }
    };
    HExpireCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields, seconds, option] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(
          [
            "hexpire",
            key,
            seconds,
            ...option ? [option] : [],
            "FIELDS",
            fieldArray.length,
            ...fieldArray
          ],
          opts
        );
      }
    };
    HExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields, timestamp, option] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(
          [
            "hexpireat",
            key,
            timestamp,
            ...option ? [option] : [],
            "FIELDS",
            fieldArray.length,
            ...fieldArray
          ],
          opts
        );
      }
    };
    HExpireTimeCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["hexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HPersistCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["hpersist", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HPExpireCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields, milliseconds, option] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(
          [
            "hpexpire",
            key,
            milliseconds,
            ...option ? [option] : [],
            "FIELDS",
            fieldArray.length,
            ...fieldArray
          ],
          opts
        );
      }
    };
    HPExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields, timestamp, option] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(
          [
            "hpexpireat",
            key,
            timestamp,
            ...option ? [option] : [],
            "FIELDS",
            fieldArray.length,
            ...fieldArray
          ],
          opts
        );
      }
    };
    HPExpireTimeCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["hpexpiretime", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HPTtlCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["hpttl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HGetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hget", ...cmd], opts);
      }
    };
    HGetAllCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hgetall", ...cmd], {
          deserialize: (result) => deserialize4(result),
          ...opts
        });
      }
    };
    HMGetCommand = class extends Command {
      constructor([key, ...fields], opts) {
        super(["hmget", key, ...fields], {
          deserialize: (result) => deserialize5(fields, result),
          ...opts
        });
      }
    };
    HGetDelCommand = class extends Command {
      constructor([key, ...fields], opts) {
        super(["hgetdel", key, "FIELDS", fields.length, ...fields], {
          deserialize: (result) => deserialize5(fields.map(String), result),
          ...opts
        });
      }
    };
    HGetExCommand = class extends Command {
      constructor([key, opts, ...fields], cmdOpts) {
        const command = ["hgetex", key];
        if ("ex" in opts && typeof opts.ex === "number") {
          command.push("EX", opts.ex);
        } else if ("px" in opts && typeof opts.px === "number") {
          command.push("PX", opts.px);
        } else if ("exat" in opts && typeof opts.exat === "number") {
          command.push("EXAT", opts.exat);
        } else if ("pxat" in opts && typeof opts.pxat === "number") {
          command.push("PXAT", opts.pxat);
        } else if ("persist" in opts && opts.persist) {
          command.push("PERSIST");
        }
        command.push("FIELDS", fields.length, ...fields);
        super(command, {
          deserialize: (result) => deserialize5(fields.map(String), result),
          ...cmdOpts
        });
      }
    };
    HIncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hincrby", ...cmd], opts);
      }
    };
    HIncrByFloatCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hincrbyfloat", ...cmd], opts);
      }
    };
    HKeysCommand = class extends Command {
      constructor([key], opts) {
        super(["hkeys", key], opts);
      }
    };
    HLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hlen", ...cmd], opts);
      }
    };
    HMSetCommand = class extends Command {
      constructor([key, kv], opts) {
        super(["hmset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts);
      }
    };
    HScanCommand = class extends Command {
      constructor([key, cursor, cmdOpts], opts) {
        const command = ["hscan", key, cursor];
        if (cmdOpts?.match) {
          command.push("match", cmdOpts.match);
        }
        if (typeof cmdOpts?.count === "number") {
          command.push("count", cmdOpts.count);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...opts
        });
      }
    };
    HSetCommand = class extends Command {
      constructor([key, kv], opts) {
        super(["hset", key, ...Object.entries(kv).flatMap(([field, value]) => [field, value])], opts);
      }
    };
    HSetExCommand = class extends Command {
      constructor([key, opts, kv], cmdOpts) {
        const command = ["hsetex", key];
        if (opts.conditional) {
          command.push(opts.conditional.toUpperCase());
        }
        if (opts.expiration) {
          if ("ex" in opts.expiration && typeof opts.expiration.ex === "number") {
            command.push("EX", opts.expiration.ex);
          } else if ("px" in opts.expiration && typeof opts.expiration.px === "number") {
            command.push("PX", opts.expiration.px);
          } else if ("exat" in opts.expiration && typeof opts.expiration.exat === "number") {
            command.push("EXAT", opts.expiration.exat);
          } else if ("pxat" in opts.expiration && typeof opts.expiration.pxat === "number") {
            command.push("PXAT", opts.expiration.pxat);
          } else if ("keepttl" in opts.expiration && opts.expiration.keepttl) {
            command.push("KEEPTTL");
          }
        }
        const entries = Object.entries(kv);
        command.push("FIELDS", entries.length);
        for (const [field, value] of entries) {
          command.push(field, value);
        }
        super(command, cmdOpts);
      }
    };
    HSetNXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hsetnx", ...cmd], opts);
      }
    };
    HStrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hstrlen", ...cmd], opts);
      }
    };
    HTtlCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, fields] = cmd;
        const fieldArray = Array.isArray(fields) ? fields : [fields];
        super(["httl", key, "FIELDS", fieldArray.length, ...fieldArray], opts);
      }
    };
    HValsCommand = class extends Command {
      constructor(cmd, opts) {
        super(["hvals", ...cmd], opts);
      }
    };
    IncrCommand = class extends Command {
      constructor(cmd, opts) {
        super(["incr", ...cmd], opts);
      }
    };
    IncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["incrby", ...cmd], opts);
      }
    };
    IncrByFloatCommand = class extends Command {
      constructor(cmd, opts) {
        super(["incrbyfloat", ...cmd], opts);
      }
    };
    JsonArrAppendCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRAPPEND", ...cmd], opts);
      }
    };
    JsonArrIndexCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRINDEX", ...cmd], opts);
      }
    };
    JsonArrInsertCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRINSERT", ...cmd], opts);
      }
    };
    JsonArrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRLEN", cmd[0], cmd[1] ?? "$"], opts);
      }
    };
    JsonArrPopCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.ARRPOP", ...cmd], opts);
      }
    };
    JsonArrTrimCommand = class extends Command {
      constructor(cmd, opts) {
        const path = cmd[1] ?? "$";
        const start = cmd[2] ?? 0;
        const stop = cmd[3] ?? 0;
        super(["JSON.ARRTRIM", cmd[0], path, start, stop], opts);
      }
    };
    JsonClearCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.CLEAR", ...cmd], opts);
      }
    };
    JsonDelCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.DEL", ...cmd], opts);
      }
    };
    JsonForgetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.FORGET", ...cmd], opts);
      }
    };
    JsonGetCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.GET"];
        if (typeof cmd[1] === "string") {
          command.push(...cmd);
        } else {
          command.push(cmd[0]);
          if (cmd[1]) {
            if (cmd[1].indent) {
              command.push("INDENT", cmd[1].indent);
            }
            if (cmd[1].newline) {
              command.push("NEWLINE", cmd[1].newline);
            }
            if (cmd[1].space) {
              command.push("SPACE", cmd[1].space);
            }
          }
          command.push(...cmd.slice(2));
        }
        super(command, opts);
      }
    };
    JsonMergeCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.MERGE", ...cmd];
        super(command, opts);
      }
    };
    JsonMGetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.MGET", ...cmd[0], cmd[1]], opts);
      }
    };
    JsonMSetCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.MSET"];
        for (const c of cmd) {
          command.push(c.key, c.path, c.value);
        }
        super(command, opts);
      }
    };
    JsonNumIncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.NUMINCRBY", ...cmd], opts);
      }
    };
    JsonNumMultByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.NUMMULTBY", ...cmd], opts);
      }
    };
    JsonObjKeysCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.OBJKEYS", ...cmd], opts);
      }
    };
    JsonObjLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.OBJLEN", ...cmd], opts);
      }
    };
    JsonRespCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.RESP", ...cmd], opts);
      }
    };
    JsonSetCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["JSON.SET", cmd[0], cmd[1], cmd[2]];
        if (cmd[3]) {
          if (cmd[3].nx) {
            command.push("NX");
          } else if (cmd[3].xx) {
            command.push("XX");
          }
        }
        super(command, opts);
      }
    };
    JsonStrAppendCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.STRAPPEND", ...cmd], opts);
      }
    };
    JsonStrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.STRLEN", ...cmd], opts);
      }
    };
    JsonToggleCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.TOGGLE", ...cmd], opts);
      }
    };
    JsonTypeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["JSON.TYPE", ...cmd], opts);
      }
    };
    KeysCommand = class extends Command {
      constructor(cmd, opts) {
        super(["keys", ...cmd], opts);
      }
    };
    LIndexCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lindex", ...cmd], opts);
      }
    };
    LInsertCommand = class extends Command {
      constructor(cmd, opts) {
        super(["linsert", ...cmd], opts);
      }
    };
    LLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["llen", ...cmd], opts);
      }
    };
    LMoveCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lmove", ...cmd], opts);
      }
    };
    LmPopCommand = class extends Command {
      constructor(cmd, opts) {
        const [numkeys, keys, direction, count] = cmd;
        super(["LMPOP", numkeys, ...keys, direction, ...count ? ["COUNT", count] : []], opts);
      }
    };
    LPopCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lpop", ...cmd], opts);
      }
    };
    LPosCommand = class extends Command {
      constructor(cmd, opts) {
        const args = ["lpos", cmd[0], cmd[1]];
        if (typeof cmd[2]?.rank === "number") {
          args.push("rank", cmd[2].rank);
        }
        if (typeof cmd[2]?.count === "number") {
          args.push("count", cmd[2].count);
        }
        if (typeof cmd[2]?.maxLen === "number") {
          args.push("maxLen", cmd[2].maxLen);
        }
        super(args, opts);
      }
    };
    LPushCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lpush", ...cmd], opts);
      }
    };
    LPushXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lpushx", ...cmd], opts);
      }
    };
    LRangeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lrange", ...cmd], opts);
      }
    };
    LRemCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lrem", ...cmd], opts);
      }
    };
    LSetCommand = class extends Command {
      constructor(cmd, opts) {
        super(["lset", ...cmd], opts);
      }
    };
    LTrimCommand = class extends Command {
      constructor(cmd, opts) {
        super(["ltrim", ...cmd], opts);
      }
    };
    MGetCommand = class extends Command {
      constructor(cmd, opts) {
        const keys = Array.isArray(cmd[0]) ? cmd[0] : cmd;
        super(["mget", ...keys], opts);
      }
    };
    MSetCommand = class extends Command {
      constructor([kv], opts) {
        super(["mset", ...Object.entries(kv).flatMap(([key, value]) => [key, value])], opts);
      }
    };
    MSetNXCommand = class extends Command {
      constructor([kv], opts) {
        super(["msetnx", ...Object.entries(kv).flat()], opts);
      }
    };
    PersistCommand = class extends Command {
      constructor(cmd, opts) {
        super(["persist", ...cmd], opts);
      }
    };
    PExpireCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pexpire", ...cmd], opts);
      }
    };
    PExpireAtCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pexpireat", ...cmd], opts);
      }
    };
    PfAddCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pfadd", ...cmd], opts);
      }
    };
    PfCountCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pfcount", ...cmd], opts);
      }
    };
    PfMergeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pfmerge", ...cmd], opts);
      }
    };
    PingCommand = class extends Command {
      constructor(cmd, opts) {
        const command = ["ping"];
        if (cmd?.[0] !== void 0) {
          command.push(cmd[0]);
        }
        super(command, opts);
      }
    };
    PSetEXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["psetex", ...cmd], opts);
      }
    };
    PTtlCommand = class extends Command {
      constructor(cmd, opts) {
        super(["pttl", ...cmd], opts);
      }
    };
    PublishCommand = class extends Command {
      constructor(cmd, opts) {
        super(["publish", ...cmd], opts);
      }
    };
    RandomKeyCommand = class extends Command {
      constructor(opts) {
        super(["randomkey"], opts);
      }
    };
    RenameCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rename", ...cmd], opts);
      }
    };
    RenameNXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["renamenx", ...cmd], opts);
      }
    };
    RPopCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rpop", ...cmd], opts);
      }
    };
    RPushCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rpush", ...cmd], opts);
      }
    };
    RPushXCommand = class extends Command {
      constructor(cmd, opts) {
        super(["rpushx", ...cmd], opts);
      }
    };
    SAddCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sadd", ...cmd], opts);
      }
    };
    ScanCommand = class extends Command {
      constructor([cursor, opts], cmdOpts) {
        const command = ["scan", cursor];
        if (opts?.match) {
          command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
          command.push("count", opts.count);
        }
        if (opts && "withType" in opts && opts.withType === true) {
          command.push("withtype");
        } else if (opts && "type" in opts && opts.type && opts.type.length > 0) {
          command.push("type", opts.type);
        }
        super(command, {
          // @ts-expect-error ignore types here
          deserialize: opts?.withType ? deserializeScanWithTypesResponse : deserializeScanResponse,
          ...cmdOpts
        });
      }
    };
    SCardCommand = class extends Command {
      constructor(cmd, opts) {
        super(["scard", ...cmd], opts);
      }
    };
    ScriptExistsCommand = class extends Command {
      constructor(hashes, opts) {
        super(["script", "exists", ...hashes], {
          deserialize: (result) => result,
          ...opts
        });
      }
    };
    ScriptFlushCommand = class extends Command {
      constructor([opts], cmdOpts) {
        const cmd = ["script", "flush"];
        if (opts?.sync) {
          cmd.push("sync");
        } else if (opts?.async) {
          cmd.push("async");
        }
        super(cmd, cmdOpts);
      }
    };
    ScriptLoadCommand = class extends Command {
      constructor(args, opts) {
        super(["script", "load", ...args], opts);
      }
    };
    SDiffCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sdiff", ...cmd], opts);
      }
    };
    SDiffStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sdiffstore", ...cmd], opts);
      }
    };
    SetCommand = class extends Command {
      constructor([key, value, opts], cmdOpts) {
        const command = ["set", key, value];
        if (opts) {
          if ("nx" in opts && opts.nx) {
            command.push("nx");
          } else if ("xx" in opts && opts.xx) {
            command.push("xx");
          }
          if ("get" in opts && opts.get) {
            command.push("get");
          }
          if ("ex" in opts && typeof opts.ex === "number") {
            command.push("ex", opts.ex);
          } else if ("px" in opts && typeof opts.px === "number") {
            command.push("px", opts.px);
          } else if ("exat" in opts && typeof opts.exat === "number") {
            command.push("exat", opts.exat);
          } else if ("pxat" in opts && typeof opts.pxat === "number") {
            command.push("pxat", opts.pxat);
          } else if ("keepTtl" in opts && opts.keepTtl) {
            command.push("keepTtl");
          }
        }
        super(command, cmdOpts);
      }
    };
    SetBitCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setbit", ...cmd], opts);
      }
    };
    SetExCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setex", ...cmd], opts);
      }
    };
    SetNxCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setnx", ...cmd], opts);
      }
    };
    SetRangeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["setrange", ...cmd], opts);
      }
    };
    SInterCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sinter", ...cmd], opts);
      }
    };
    SInterCardCommand = class extends Command {
      constructor(cmd, cmdOpts) {
        const [keys, opts] = cmd;
        const command = ["sintercard", keys.length, ...keys];
        if (opts?.limit !== void 0) {
          command.push("LIMIT", opts.limit);
        }
        super(command, cmdOpts);
      }
    };
    SInterStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sinterstore", ...cmd], opts);
      }
    };
    SIsMemberCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sismember", ...cmd], opts);
      }
    };
    SMembersCommand = class extends Command {
      constructor(cmd, opts) {
        super(["smembers", ...cmd], opts);
      }
    };
    SMIsMemberCommand = class extends Command {
      constructor(cmd, opts) {
        super(["smismember", cmd[0], ...cmd[1]], opts);
      }
    };
    SMoveCommand = class extends Command {
      constructor(cmd, opts) {
        super(["smove", ...cmd], opts);
      }
    };
    SPopCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["spop", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    SRandMemberCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["srandmember", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    SRemCommand = class extends Command {
      constructor(cmd, opts) {
        super(["srem", ...cmd], opts);
      }
    };
    SScanCommand = class extends Command {
      constructor([key, cursor, opts], cmdOpts) {
        const command = ["sscan", key, cursor];
        if (opts?.match) {
          command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
          command.push("count", opts.count);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...cmdOpts
        });
      }
    };
    StrLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["strlen", ...cmd], opts);
      }
    };
    SUnionCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sunion", ...cmd], opts);
      }
    };
    SUnionStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["sunionstore", ...cmd], opts);
      }
    };
    TimeCommand = class extends Command {
      constructor(opts) {
        super(["time"], opts);
      }
    };
    TouchCommand = class extends Command {
      constructor(cmd, opts) {
        super(["touch", ...cmd], opts);
      }
    };
    TtlCommand = class extends Command {
      constructor(cmd, opts) {
        super(["ttl", ...cmd], opts);
      }
    };
    TypeCommand = class extends Command {
      constructor(cmd, opts) {
        super(["type", ...cmd], opts);
      }
    };
    UnlinkCommand = class extends Command {
      constructor(cmd, opts) {
        super(["unlink", ...cmd], opts);
      }
    };
    XAckCommand = class extends Command {
      constructor([key, group, id], opts) {
        const ids = Array.isArray(id) ? [...id] : [id];
        super(["XACK", key, group, ...ids], opts);
      }
    };
    XAckDelCommand = class extends Command {
      constructor([key, group, opts, ...ids], cmdOpts) {
        const command = ["XACKDEL", key, group];
        command.push(opts.toUpperCase(), "IDS", ids.length, ...ids);
        super(command, cmdOpts);
      }
    };
    XAddCommand = class extends Command {
      constructor([key, id, entries, opts], commandOptions) {
        const command = ["XADD", key];
        if (opts) {
          if (opts.nomkStream) {
            command.push("NOMKSTREAM");
          }
          if (opts.trim) {
            command.push(opts.trim.type, opts.trim.comparison, opts.trim.threshold);
            if (opts.trim.limit !== void 0) {
              command.push("LIMIT", opts.trim.limit);
            }
          }
        }
        command.push(id);
        for (const [k, v] of Object.entries(entries)) {
          command.push(k, v);
        }
        super(command, commandOptions);
      }
    };
    XAutoClaim = class extends Command {
      constructor([key, group, consumer, minIdleTime, start, options], opts) {
        const commands = [];
        if (options?.count) {
          commands.push("COUNT", options.count);
        }
        if (options?.justId) {
          commands.push("JUSTID");
        }
        super(["XAUTOCLAIM", key, group, consumer, minIdleTime, start, ...commands], opts);
      }
    };
    XClaimCommand = class extends Command {
      constructor([key, group, consumer, minIdleTime, id, options], opts) {
        const ids = Array.isArray(id) ? [...id] : [id];
        const commands = [];
        if (options?.idleMS) {
          commands.push("IDLE", options.idleMS);
        }
        if (options?.idleMS) {
          commands.push("TIME", options.timeMS);
        }
        if (options?.retryCount) {
          commands.push("RETRYCOUNT", options.retryCount);
        }
        if (options?.force) {
          commands.push("FORCE");
        }
        if (options?.justId) {
          commands.push("JUSTID");
        }
        if (options?.lastId) {
          commands.push("LASTID", options.lastId);
        }
        super(["XCLAIM", key, group, consumer, minIdleTime, ...ids, ...commands], opts);
      }
    };
    XDelCommand = class extends Command {
      constructor([key, ids], opts) {
        const cmds = Array.isArray(ids) ? [...ids] : [ids];
        super(["XDEL", key, ...cmds], opts);
      }
    };
    XDelExCommand = class extends Command {
      constructor([key, opts, ...ids], cmdOpts) {
        const command = ["XDELEX", key];
        if (opts) {
          command.push(opts.toUpperCase());
        }
        command.push("IDS", ids.length, ...ids);
        super(command, cmdOpts);
      }
    };
    XGroupCommand = class extends Command {
      constructor([key, opts], commandOptions) {
        const command = ["XGROUP"];
        switch (opts.type) {
          case "CREATE": {
            command.push("CREATE", key, opts.group, opts.id);
            if (opts.options) {
              if (opts.options.MKSTREAM) {
                command.push("MKSTREAM");
              }
              if (opts.options.ENTRIESREAD !== void 0) {
                command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
              }
            }
            break;
          }
          case "CREATECONSUMER": {
            command.push("CREATECONSUMER", key, opts.group, opts.consumer);
            break;
          }
          case "DELCONSUMER": {
            command.push("DELCONSUMER", key, opts.group, opts.consumer);
            break;
          }
          case "DESTROY": {
            command.push("DESTROY", key, opts.group);
            break;
          }
          case "SETID": {
            command.push("SETID", key, opts.group, opts.id);
            if (opts.options?.ENTRIESREAD !== void 0) {
              command.push("ENTRIESREAD", opts.options.ENTRIESREAD.toString());
            }
            break;
          }
          default: {
            throw new Error("Invalid XGROUP");
          }
        }
        super(command, commandOptions);
      }
    };
    XInfoCommand = class extends Command {
      constructor([key, options], opts) {
        const cmds = [];
        if (options.type === "CONSUMERS") {
          cmds.push("CONSUMERS", key, options.group);
        } else {
          cmds.push("GROUPS", key);
        }
        super(["XINFO", ...cmds], opts);
      }
    };
    XLenCommand = class extends Command {
      constructor(cmd, opts) {
        super(["XLEN", ...cmd], opts);
      }
    };
    XPendingCommand = class extends Command {
      constructor([key, group, start, end, count, options], opts) {
        const consumers = options?.consumer === void 0 ? [] : Array.isArray(options.consumer) ? [...options.consumer] : [options.consumer];
        super(
          [
            "XPENDING",
            key,
            group,
            ...options?.idleTime ? ["IDLE", options.idleTime] : [],
            start,
            end,
            count,
            ...consumers
          ],
          opts
        );
      }
    };
    XRangeCommand = class extends Command {
      constructor([key, start, end, count], opts) {
        const command = ["XRANGE", key, start, end];
        if (typeof count === "number") {
          command.push("COUNT", count);
        }
        super(command, {
          deserialize: (result) => deserialize6(result),
          ...opts
        });
      }
    };
    UNBALANCED_XREAD_ERR = "ERR Unbalanced XREAD list of streams: for each stream key an ID or '$' must be specified";
    XReadCommand = class extends Command {
      constructor([key, id, options], opts) {
        if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
          throw new Error(UNBALANCED_XREAD_ERR);
        }
        const commands = [];
        if (typeof options?.count === "number") {
          commands.push("COUNT", options.count);
        }
        if (typeof options?.blockMS === "number") {
          commands.push("BLOCK", options.blockMS);
        }
        commands.push(
          "STREAMS",
          ...Array.isArray(key) ? [...key] : [key],
          ...Array.isArray(id) ? [...id] : [id]
        );
        super(["XREAD", ...commands], opts);
      }
    };
    UNBALANCED_XREADGROUP_ERR = "ERR Unbalanced XREADGROUP list of streams: for each stream key an ID or '$' must be specified";
    XReadGroupCommand = class extends Command {
      constructor([group, consumer, key, id, options], opts) {
        if (Array.isArray(key) && Array.isArray(id) && key.length !== id.length) {
          throw new Error(UNBALANCED_XREADGROUP_ERR);
        }
        const commands = [];
        if (typeof options?.count === "number") {
          commands.push("COUNT", options.count);
        }
        if (typeof options?.blockMS === "number") {
          commands.push("BLOCK", options.blockMS);
        }
        if (typeof options?.NOACK === "boolean" && options.NOACK) {
          commands.push("NOACK");
        }
        commands.push(
          "STREAMS",
          ...Array.isArray(key) ? [...key] : [key],
          ...Array.isArray(id) ? [...id] : [id]
        );
        super(["XREADGROUP", "GROUP", group, consumer, ...commands], opts);
      }
    };
    XRevRangeCommand = class extends Command {
      constructor([key, end, start, count], opts) {
        const command = ["XREVRANGE", key, end, start];
        if (typeof count === "number") {
          command.push("COUNT", count);
        }
        super(command, {
          deserialize: (result) => deserialize7(result),
          ...opts
        });
      }
    };
    XTrimCommand = class extends Command {
      constructor([key, options], opts) {
        const { limit, strategy, threshold, exactness = "~" } = options;
        super(["XTRIM", key, strategy, exactness, threshold, ...limit ? ["LIMIT", limit] : []], opts);
      }
    };
    ZAddCommand = class extends Command {
      constructor([key, arg1, ...arg2], opts) {
        const command = ["zadd", key];
        if ("nx" in arg1 && arg1.nx) {
          command.push("nx");
        } else if ("xx" in arg1 && arg1.xx) {
          command.push("xx");
        }
        if ("ch" in arg1 && arg1.ch) {
          command.push("ch");
        }
        if ("incr" in arg1 && arg1.incr) {
          command.push("incr");
        }
        if ("lt" in arg1 && arg1.lt) {
          command.push("lt");
        } else if ("gt" in arg1 && arg1.gt) {
          command.push("gt");
        }
        if ("score" in arg1 && "member" in arg1) {
          command.push(arg1.score, arg1.member);
        }
        command.push(...arg2.flatMap(({ score, member }) => [score, member]));
        super(command, opts);
      }
    };
    ZCardCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zcard", ...cmd], opts);
      }
    };
    ZCountCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zcount", ...cmd], opts);
      }
    };
    ZIncrByCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zincrby", ...cmd], opts);
      }
    };
    ZInterStoreCommand = class extends Command {
      constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zinterstore", destination, numKeys];
        if (Array.isArray(keyOrKeys)) {
          command.push(...keyOrKeys);
        } else {
          command.push(keyOrKeys);
        }
        if (opts) {
          if ("weights" in opts && opts.weights) {
            command.push("weights", ...opts.weights);
          } else if ("weight" in opts && typeof opts.weight === "number") {
            command.push("weights", opts.weight);
          }
          if ("aggregate" in opts) {
            command.push("aggregate", opts.aggregate);
          }
        }
        super(command, cmdOpts);
      }
    };
    ZLexCountCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zlexcount", ...cmd], opts);
      }
    };
    ZPopMaxCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["zpopmax", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    ZPopMinCommand = class extends Command {
      constructor([key, count], opts) {
        const command = ["zpopmin", key];
        if (typeof count === "number") {
          command.push(count);
        }
        super(command, opts);
      }
    };
    ZRangeCommand = class extends Command {
      constructor([key, min, max, opts], cmdOpts) {
        const command = ["zrange", key, min, max];
        if (opts?.byScore) {
          command.push("byscore");
        }
        if (opts?.byLex) {
          command.push("bylex");
        }
        if (opts?.rev) {
          command.push("rev");
        }
        if (opts?.count !== void 0 && opts.offset !== void 0) {
          command.push("limit", opts.offset, opts.count);
        }
        if (opts?.withScores) {
          command.push("withscores");
        }
        super(command, cmdOpts);
      }
    };
    ZRankCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zrank", ...cmd], opts);
      }
    };
    ZRemCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zrem", ...cmd], opts);
      }
    };
    ZRemRangeByLexCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zremrangebylex", ...cmd], opts);
      }
    };
    ZRemRangeByRankCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zremrangebyrank", ...cmd], opts);
      }
    };
    ZRemRangeByScoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zremrangebyscore", ...cmd], opts);
      }
    };
    ZRevRankCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zrevrank", ...cmd], opts);
      }
    };
    ZScanCommand = class extends Command {
      constructor([key, cursor, opts], cmdOpts) {
        const command = ["zscan", key, cursor];
        if (opts?.match) {
          command.push("match", opts.match);
        }
        if (typeof opts?.count === "number") {
          command.push("count", opts.count);
        }
        super(command, {
          deserialize: deserializeScanResponse,
          ...cmdOpts
        });
      }
    };
    ZScoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zscore", ...cmd], opts);
      }
    };
    ZUnionCommand = class extends Command {
      constructor([numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zunion", numKeys];
        if (Array.isArray(keyOrKeys)) {
          command.push(...keyOrKeys);
        } else {
          command.push(keyOrKeys);
        }
        if (opts) {
          if ("weights" in opts && opts.weights) {
            command.push("weights", ...opts.weights);
          } else if ("weight" in opts && typeof opts.weight === "number") {
            command.push("weights", opts.weight);
          }
          if ("aggregate" in opts) {
            command.push("aggregate", opts.aggregate);
          }
          if (opts.withScores) {
            command.push("withscores");
          }
        }
        super(command, cmdOpts);
      }
    };
    ZUnionStoreCommand = class extends Command {
      constructor([destination, numKeys, keyOrKeys, opts], cmdOpts) {
        const command = ["zunionstore", destination, numKeys];
        if (Array.isArray(keyOrKeys)) {
          command.push(...keyOrKeys);
        } else {
          command.push(keyOrKeys);
        }
        if (opts) {
          if ("weights" in opts && opts.weights) {
            command.push("weights", ...opts.weights);
          } else if ("weight" in opts && typeof opts.weight === "number") {
            command.push("weights", opts.weight);
          }
          if ("aggregate" in opts) {
            command.push("aggregate", opts.aggregate);
          }
        }
        super(command, cmdOpts);
      }
    };
    ZDiffStoreCommand = class extends Command {
      constructor(cmd, opts) {
        super(["zdiffstore", ...cmd], opts);
      }
    };
    ZMScoreCommand = class extends Command {
      constructor(cmd, opts) {
        const [key, members] = cmd;
        super(["zmscore", key, ...members], opts);
      }
    };
    Pipeline = class {
      client;
      commands;
      commandOptions;
      multiExec;
      constructor(opts) {
        this.client = opts.client;
        this.commands = [];
        this.commandOptions = opts.commandOptions;
        this.multiExec = opts.multiExec ?? false;
        if (this.commandOptions?.latencyLogging) {
          const originalExec = this.exec.bind(this);
          this.exec = async (options) => {
            const start = performance.now();
            const result = await (options ? originalExec(options) : originalExec());
            const end = performance.now();
            const loggerResult = (end - start).toFixed(2);
            console.log(
              `Latency for \x1B[38;2;19;185;39m${this.multiExec ? ["MULTI-EXEC"] : ["PIPELINE"].toString().toUpperCase()}\x1B[0m: \x1B[38;2;0;255;255m${loggerResult} ms\x1B[0m`
            );
            return result;
          };
        }
      }
      exec = async (options) => {
        if (this.commands.length === 0) {
          throw new Error("Pipeline is empty");
        }
        const path = this.multiExec ? ["multi-exec"] : ["pipeline"];
        const res = await this.client.request({
          path,
          body: Object.values(this.commands).map((c) => c.command)
        });
        return options?.keepErrors ? res.map(({ error, result }, i) => {
          return {
            error,
            result: this.commands[i].deserialize(result)
          };
        }) : res.map(({ error, result }, i) => {
          if (error) {
            throw new UpstashError(
              `Command ${i + 1} [ ${this.commands[i].command[0]} ] failed: ${error}`
            );
          }
          return this.commands[i].deserialize(result);
        });
      };
      /**
       * Returns the length of pipeline before the execution
       */
      length() {
        return this.commands.length;
      }
      /**
       * Pushes a command into the pipeline and returns a chainable instance of the
       * pipeline
       */
      chain(command) {
        this.commands.push(command);
        return this;
      }
      /**
       * @see https://redis.io/commands/append
       */
      append = (...args) => this.chain(new AppendCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/bitcount
       */
      bitcount = (...args) => this.chain(new BitCountCommand(args, this.commandOptions));
      /**
       * Returns an instance that can be used to execute `BITFIELD` commands on one key.
       *
       * @example
       * ```typescript
       * redis.set("mykey", 0);
       * const result = await redis.pipeline()
       *   .bitfield("mykey")
       *   .set("u4", 0, 16)
       *   .incr("u4", "#1", 1)
       *   .exec();
       * console.log(result); // [[0, 1]]
       * ```
       *
       * @see https://redis.io/commands/bitfield
       */
      bitfield = (...args) => new BitFieldCommand(args, this.client, this.commandOptions, this.chain.bind(this));
      /**
       * @see https://redis.io/commands/bitop
       */
      bitop = (op, destinationKey, sourceKey, ...sourceKeys) => this.chain(
        new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.commandOptions)
      );
      /**
       * @see https://redis.io/commands/bitpos
       */
      bitpos = (...args) => this.chain(new BitPosCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/client-setinfo
       */
      clientSetinfo = (...args) => this.chain(new ClientSetInfoCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/copy
       */
      copy = (...args) => this.chain(new CopyCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zdiffstore
       */
      zdiffstore = (...args) => this.chain(new ZDiffStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/dbsize
       */
      dbsize = () => this.chain(new DBSizeCommand(this.commandOptions));
      /**
       * @see https://redis.io/commands/decr
       */
      decr = (...args) => this.chain(new DecrCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/decrby
       */
      decrby = (...args) => this.chain(new DecrByCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/del
       */
      del = (...args) => this.chain(new DelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/echo
       */
      echo = (...args) => this.chain(new EchoCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/eval_ro
       */
      evalRo = (...args) => this.chain(new EvalROCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/eval
       */
      eval = (...args) => this.chain(new EvalCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/evalsha_ro
       */
      evalshaRo = (...args) => this.chain(new EvalshaROCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/evalsha
       */
      evalsha = (...args) => this.chain(new EvalshaCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/exists
       */
      exists = (...args) => this.chain(new ExistsCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/expire
       */
      expire = (...args) => this.chain(new ExpireCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/expireat
       */
      expireat = (...args) => this.chain(new ExpireAtCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/flushall
       */
      flushall = (args) => this.chain(new FlushAllCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/flushdb
       */
      flushdb = (...args) => this.chain(new FlushDBCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geoadd
       */
      geoadd = (...args) => this.chain(new GeoAddCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geodist
       */
      geodist = (...args) => this.chain(new GeoDistCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geopos
       */
      geopos = (...args) => this.chain(new GeoPosCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geohash
       */
      geohash = (...args) => this.chain(new GeoHashCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geosearch
       */
      geosearch = (...args) => this.chain(new GeoSearchCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/geosearchstore
       */
      geosearchstore = (...args) => this.chain(new GeoSearchStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/get
       */
      get = (...args) => this.chain(new GetCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getbit
       */
      getbit = (...args) => this.chain(new GetBitCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getdel
       */
      getdel = (...args) => this.chain(new GetDelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getex
       */
      getex = (...args) => this.chain(new GetExCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getrange
       */
      getrange = (...args) => this.chain(new GetRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/getset
       */
      getset = (key, value) => this.chain(new GetSetCommand([key, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/hdel
       */
      hdel = (...args) => this.chain(new HDelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hexists
       */
      hexists = (...args) => this.chain(new HExistsCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hexpire
       */
      hexpire = (...args) => this.chain(new HExpireCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hexpireat
       */
      hexpireat = (...args) => this.chain(new HExpireAtCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hexpiretime
       */
      hexpiretime = (...args) => this.chain(new HExpireTimeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/httl
       */
      httl = (...args) => this.chain(new HTtlCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpexpire
       */
      hpexpire = (...args) => this.chain(new HPExpireCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpexpireat
       */
      hpexpireat = (...args) => this.chain(new HPExpireAtCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpexpiretime
       */
      hpexpiretime = (...args) => this.chain(new HPExpireTimeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpttl
       */
      hpttl = (...args) => this.chain(new HPTtlCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hpersist
       */
      hpersist = (...args) => this.chain(new HPersistCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hget
       */
      hget = (...args) => this.chain(new HGetCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hgetall
       */
      hgetall = (...args) => this.chain(new HGetAllCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hgetdel
       */
      hgetdel = (...args) => this.chain(new HGetDelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hgetex
       */
      hgetex = (...args) => this.chain(new HGetExCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hincrby
       */
      hincrby = (...args) => this.chain(new HIncrByCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hincrbyfloat
       */
      hincrbyfloat = (...args) => this.chain(new HIncrByFloatCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hkeys
       */
      hkeys = (...args) => this.chain(new HKeysCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hlen
       */
      hlen = (...args) => this.chain(new HLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hmget
       */
      hmget = (...args) => this.chain(new HMGetCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hmset
       */
      hmset = (key, kv) => this.chain(new HMSetCommand([key, kv], this.commandOptions));
      /**
       * @see https://redis.io/commands/hrandfield
       */
      hrandfield = (key, count, withValues) => this.chain(new HRandFieldCommand([key, count, withValues], this.commandOptions));
      /**
       * @see https://redis.io/commands/hscan
       */
      hscan = (...args) => this.chain(new HScanCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hset
       */
      hset = (key, kv) => this.chain(new HSetCommand([key, kv], this.commandOptions));
      /**
       * @see https://redis.io/commands/hsetex
       */
      hsetex = (...args) => this.chain(new HSetExCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hsetnx
       */
      hsetnx = (key, field, value) => this.chain(new HSetNXCommand([key, field, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/hstrlen
       */
      hstrlen = (...args) => this.chain(new HStrLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/hvals
       */
      hvals = (...args) => this.chain(new HValsCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/incr
       */
      incr = (...args) => this.chain(new IncrCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/incrby
       */
      incrby = (...args) => this.chain(new IncrByCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/incrbyfloat
       */
      incrbyfloat = (...args) => this.chain(new IncrByFloatCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/keys
       */
      keys = (...args) => this.chain(new KeysCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lindex
       */
      lindex = (...args) => this.chain(new LIndexCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/linsert
       */
      linsert = (key, direction, pivot, value) => this.chain(new LInsertCommand([key, direction, pivot, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/llen
       */
      llen = (...args) => this.chain(new LLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lmove
       */
      lmove = (...args) => this.chain(new LMoveCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lpop
       */
      lpop = (...args) => this.chain(new LPopCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lmpop
       */
      lmpop = (...args) => this.chain(new LmPopCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lpos
       */
      lpos = (...args) => this.chain(new LPosCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lpush
       */
      lpush = (key, ...elements) => this.chain(new LPushCommand([key, ...elements], this.commandOptions));
      /**
       * @see https://redis.io/commands/lpushx
       */
      lpushx = (key, ...elements) => this.chain(new LPushXCommand([key, ...elements], this.commandOptions));
      /**
       * @see https://redis.io/commands/lrange
       */
      lrange = (...args) => this.chain(new LRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/lrem
       */
      lrem = (key, count, value) => this.chain(new LRemCommand([key, count, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/lset
       */
      lset = (key, index, value) => this.chain(new LSetCommand([key, index, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/ltrim
       */
      ltrim = (...args) => this.chain(new LTrimCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/mget
       */
      mget = (...args) => this.chain(new MGetCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/mset
       */
      mset = (kv) => this.chain(new MSetCommand([kv], this.commandOptions));
      /**
       * @see https://redis.io/commands/msetnx
       */
      msetnx = (kv) => this.chain(new MSetNXCommand([kv], this.commandOptions));
      /**
       * @see https://redis.io/commands/persist
       */
      persist = (...args) => this.chain(new PersistCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pexpire
       */
      pexpire = (...args) => this.chain(new PExpireCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pexpireat
       */
      pexpireat = (...args) => this.chain(new PExpireAtCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pfadd
       */
      pfadd = (...args) => this.chain(new PfAddCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pfcount
       */
      pfcount = (...args) => this.chain(new PfCountCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/pfmerge
       */
      pfmerge = (...args) => this.chain(new PfMergeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/ping
       */
      ping = (args) => this.chain(new PingCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/psetex
       */
      psetex = (key, ttl, value) => this.chain(new PSetEXCommand([key, ttl, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/pttl
       */
      pttl = (...args) => this.chain(new PTtlCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/publish
       */
      publish = (...args) => this.chain(new PublishCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/randomkey
       */
      randomkey = () => this.chain(new RandomKeyCommand(this.commandOptions));
      /**
       * @see https://redis.io/commands/rename
       */
      rename = (...args) => this.chain(new RenameCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/renamenx
       */
      renamenx = (...args) => this.chain(new RenameNXCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/rpop
       */
      rpop = (...args) => this.chain(new RPopCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/rpush
       */
      rpush = (key, ...elements) => this.chain(new RPushCommand([key, ...elements], this.commandOptions));
      /**
       * @see https://redis.io/commands/rpushx
       */
      rpushx = (key, ...elements) => this.chain(new RPushXCommand([key, ...elements], this.commandOptions));
      /**
       * @see https://redis.io/commands/sadd
       */
      sadd = (key, member, ...members) => this.chain(new SAddCommand([key, member, ...members], this.commandOptions));
      /**
       * @see https://redis.io/commands/scan
       */
      scan = (...args) => this.chain(new ScanCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/scard
       */
      scard = (...args) => this.chain(new SCardCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/script-exists
       */
      scriptExists = (...args) => this.chain(new ScriptExistsCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/script-flush
       */
      scriptFlush = (...args) => this.chain(new ScriptFlushCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/script-load
       */
      scriptLoad = (...args) => this.chain(new ScriptLoadCommand(args, this.commandOptions));
      /*)*
       * @see https://redis.io/commands/sdiff
       */
      sdiff = (...args) => this.chain(new SDiffCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sdiffstore
       */
      sdiffstore = (...args) => this.chain(new SDiffStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/set
       */
      set = (key, value, opts) => this.chain(new SetCommand([key, value, opts], this.commandOptions));
      /**
       * @see https://redis.io/commands/setbit
       */
      setbit = (...args) => this.chain(new SetBitCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/setex
       */
      setex = (key, ttl, value) => this.chain(new SetExCommand([key, ttl, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/setnx
       */
      setnx = (key, value) => this.chain(new SetNxCommand([key, value], this.commandOptions));
      /**
       * @see https://redis.io/commands/setrange
       */
      setrange = (...args) => this.chain(new SetRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sinter
       */
      sinter = (...args) => this.chain(new SInterCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sintercard
       */
      sintercard = (...args) => this.chain(new SInterCardCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sinterstore
       */
      sinterstore = (...args) => this.chain(new SInterStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sismember
       */
      sismember = (key, member) => this.chain(new SIsMemberCommand([key, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/smembers
       */
      smembers = (...args) => this.chain(new SMembersCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/smismember
       */
      smismember = (key, members) => this.chain(new SMIsMemberCommand([key, members], this.commandOptions));
      /**
       * @see https://redis.io/commands/smove
       */
      smove = (source, destination, member) => this.chain(new SMoveCommand([source, destination, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/spop
       */
      spop = (...args) => this.chain(new SPopCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/srandmember
       */
      srandmember = (...args) => this.chain(new SRandMemberCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/srem
       */
      srem = (key, ...members) => this.chain(new SRemCommand([key, ...members], this.commandOptions));
      /**
       * @see https://redis.io/commands/sscan
       */
      sscan = (...args) => this.chain(new SScanCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/strlen
       */
      strlen = (...args) => this.chain(new StrLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sunion
       */
      sunion = (...args) => this.chain(new SUnionCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/sunionstore
       */
      sunionstore = (...args) => this.chain(new SUnionStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/time
       */
      time = () => this.chain(new TimeCommand(this.commandOptions));
      /**
       * @see https://redis.io/commands/touch
       */
      touch = (...args) => this.chain(new TouchCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/ttl
       */
      ttl = (...args) => this.chain(new TtlCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/type
       */
      type = (...args) => this.chain(new TypeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/unlink
       */
      unlink = (...args) => this.chain(new UnlinkCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zadd
       */
      zadd = (...args) => {
        if ("score" in args[1]) {
          return this.chain(
            new ZAddCommand([args[0], args[1], ...args.slice(2)], this.commandOptions)
          );
        }
        return this.chain(
          new ZAddCommand(
            [args[0], args[1], ...args.slice(2)],
            this.commandOptions
          )
        );
      };
      /**
       * @see https://redis.io/commands/xadd
       */
      xadd = (...args) => this.chain(new XAddCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xack
       */
      xack = (...args) => this.chain(new XAckCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xackdel
       */
      xackdel = (...args) => this.chain(new XAckDelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xdel
       */
      xdel = (...args) => this.chain(new XDelCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xdelex
       */
      xdelex = (...args) => this.chain(new XDelExCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xgroup
       */
      xgroup = (...args) => this.chain(new XGroupCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xread
       */
      xread = (...args) => this.chain(new XReadCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xreadgroup
       */
      xreadgroup = (...args) => this.chain(new XReadGroupCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xinfo
       */
      xinfo = (...args) => this.chain(new XInfoCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xlen
       */
      xlen = (...args) => this.chain(new XLenCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xpending
       */
      xpending = (...args) => this.chain(new XPendingCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xclaim
       */
      xclaim = (...args) => this.chain(new XClaimCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xautoclaim
       */
      xautoclaim = (...args) => this.chain(new XAutoClaim(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xtrim
       */
      xtrim = (...args) => this.chain(new XTrimCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xrange
       */
      xrange = (...args) => this.chain(new XRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/xrevrange
       */
      xrevrange = (...args) => this.chain(new XRevRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zcard
       */
      zcard = (...args) => this.chain(new ZCardCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zcount
       */
      zcount = (...args) => this.chain(new ZCountCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zincrby
       */
      zincrby = (key, increment, member) => this.chain(new ZIncrByCommand([key, increment, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/zinterstore
       */
      zinterstore = (...args) => this.chain(new ZInterStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zlexcount
       */
      zlexcount = (...args) => this.chain(new ZLexCountCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zmscore
       */
      zmscore = (...args) => this.chain(new ZMScoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zpopmax
       */
      zpopmax = (...args) => this.chain(new ZPopMaxCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zpopmin
       */
      zpopmin = (...args) => this.chain(new ZPopMinCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zrange
       */
      zrange = (...args) => this.chain(new ZRangeCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zrank
       */
      zrank = (key, member) => this.chain(new ZRankCommand([key, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/zrem
       */
      zrem = (key, ...members) => this.chain(new ZRemCommand([key, ...members], this.commandOptions));
      /**
       * @see https://redis.io/commands/zremrangebylex
       */
      zremrangebylex = (...args) => this.chain(new ZRemRangeByLexCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zremrangebyrank
       */
      zremrangebyrank = (...args) => this.chain(new ZRemRangeByRankCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zremrangebyscore
       */
      zremrangebyscore = (...args) => this.chain(new ZRemRangeByScoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zrevrank
       */
      zrevrank = (key, member) => this.chain(new ZRevRankCommand([key, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/zscan
       */
      zscan = (...args) => this.chain(new ZScanCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zscore
       */
      zscore = (key, member) => this.chain(new ZScoreCommand([key, member], this.commandOptions));
      /**
       * @see https://redis.io/commands/zunionstore
       */
      zunionstore = (...args) => this.chain(new ZUnionStoreCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/zunion
       */
      zunion = (...args) => this.chain(new ZUnionCommand(args, this.commandOptions));
      /**
       * @see https://redis.io/commands/?group=json
       */
      get json() {
        return {
          /**
           * @see https://redis.io/commands/json.arrappend
           */
          arrappend: (...args) => this.chain(new JsonArrAppendCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrindex
           */
          arrindex: (...args) => this.chain(new JsonArrIndexCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrinsert
           */
          arrinsert: (...args) => this.chain(new JsonArrInsertCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrlen
           */
          arrlen: (...args) => this.chain(new JsonArrLenCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrpop
           */
          arrpop: (...args) => this.chain(new JsonArrPopCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.arrtrim
           */
          arrtrim: (...args) => this.chain(new JsonArrTrimCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.clear
           */
          clear: (...args) => this.chain(new JsonClearCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.del
           */
          del: (...args) => this.chain(new JsonDelCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.forget
           */
          forget: (...args) => this.chain(new JsonForgetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.get
           */
          get: (...args) => this.chain(new JsonGetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.merge
           */
          merge: (...args) => this.chain(new JsonMergeCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.mget
           */
          mget: (...args) => this.chain(new JsonMGetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.mset
           */
          mset: (...args) => this.chain(new JsonMSetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.numincrby
           */
          numincrby: (...args) => this.chain(new JsonNumIncrByCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.nummultby
           */
          nummultby: (...args) => this.chain(new JsonNumMultByCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.objkeys
           */
          objkeys: (...args) => this.chain(new JsonObjKeysCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.objlen
           */
          objlen: (...args) => this.chain(new JsonObjLenCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.resp
           */
          resp: (...args) => this.chain(new JsonRespCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.set
           */
          set: (...args) => this.chain(new JsonSetCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.strappend
           */
          strappend: (...args) => this.chain(new JsonStrAppendCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.strlen
           */
          strlen: (...args) => this.chain(new JsonStrLenCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.toggle
           */
          toggle: (...args) => this.chain(new JsonToggleCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/commands/json.type
           */
          type: (...args) => this.chain(new JsonTypeCommand(args, this.commandOptions))
        };
      }
      get functions() {
        return {
          /**
           * @see https://redis.io/docs/latest/commands/function-load/
           */
          load: (...args) => this.chain(new FunctionLoadCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/docs/latest/commands/function-list/
           */
          list: (...args) => this.chain(new FunctionListCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/docs/latest/commands/function-delete/
           */
          delete: (...args) => this.chain(new FunctionDeleteCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/docs/latest/commands/function-flush/
           */
          flush: () => this.chain(new FunctionFlushCommand(this.commandOptions)),
          /**
           * @see https://redis.io/docs/latest/commands/function-stats/
           */
          stats: () => this.chain(new FunctionStatsCommand(this.commandOptions)),
          /**
           * @see https://redis.io/docs/latest/commands/fcall/
           */
          call: (...args) => this.chain(new FCallCommand(args, this.commandOptions)),
          /**
           * @see https://redis.io/docs/latest/commands/fcall_ro/
           */
          callRo: (...args) => this.chain(new FCallRoCommand(args, this.commandOptions))
        };
      }
    };
    EXCLUDE_COMMANDS = /* @__PURE__ */ new Set([
      "scan",
      "keys",
      "flushdb",
      "flushall",
      "dbsize",
      "hscan",
      "hgetall",
      "hkeys",
      "lrange",
      "sscan",
      "smembers",
      "xrange",
      "xrevrange",
      "zscan",
      "zrange",
      "exec"
    ]);
    AutoPipelineExecutor = class {
      pipelinePromises = /* @__PURE__ */ new WeakMap();
      activePipeline = null;
      indexInCurrentPipeline = 0;
      redis;
      pipeline;
      // only to make sure that proxy can work
      pipelineCounter = 0;
      // to keep track of how many times a pipeline was executed
      constructor(redis) {
        this.redis = redis;
        this.pipeline = redis.pipeline();
      }
      async withAutoPipeline(executeWithPipeline) {
        const pipeline = this.activePipeline ?? this.redis.pipeline();
        if (!this.activePipeline) {
          this.activePipeline = pipeline;
          this.indexInCurrentPipeline = 0;
        }
        const index = this.indexInCurrentPipeline++;
        executeWithPipeline(pipeline);
        const pipelineDone = this.deferExecution().then(() => {
          if (!this.pipelinePromises.has(pipeline)) {
            const pipelinePromise = pipeline.exec({ keepErrors: true });
            this.pipelineCounter += 1;
            this.pipelinePromises.set(pipeline, pipelinePromise);
            this.activePipeline = null;
          }
          return this.pipelinePromises.get(pipeline);
        });
        const results = await pipelineDone;
        const commandResult = results[index];
        if (commandResult.error) {
          throw new UpstashError(`Command failed: ${commandResult.error}`);
        }
        return commandResult.result;
      }
      async deferExecution() {
        await Promise.resolve();
        await Promise.resolve();
      }
    };
    PSubscribeCommand = class extends Command {
      constructor(cmd, opts) {
        const sseHeaders = {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        };
        super([], {
          ...opts,
          headers: sseHeaders,
          path: ["psubscribe", ...cmd],
          streamOptions: {
            isStreaming: true,
            onMessage: opts?.streamOptions?.onMessage,
            signal: opts?.streamOptions?.signal
          }
        });
      }
    };
    Subscriber = class extends EventTarget {
      subscriptions;
      client;
      listeners;
      opts;
      constructor(client, channels, isPattern = false, opts) {
        super();
        this.client = client;
        this.subscriptions = /* @__PURE__ */ new Map();
        this.listeners = /* @__PURE__ */ new Map();
        this.opts = opts;
        for (const channel2 of channels) {
          if (isPattern) {
            this.subscribeToPattern(channel2);
          } else {
            this.subscribeToChannel(channel2);
          }
        }
      }
      subscribeToChannel(channel2) {
        const controller = new AbortController();
        const command = new SubscribeCommand([channel2], {
          streamOptions: {
            signal: controller.signal,
            onMessage: (data) => this.handleMessage(data, false)
          }
        });
        command.exec(this.client).catch((error) => {
          if (error.name !== "AbortError") {
            this.dispatchToListeners("error", error);
          }
        });
        this.subscriptions.set(channel2, {
          command,
          controller,
          isPattern: false
        });
      }
      subscribeToPattern(pattern) {
        const controller = new AbortController();
        const command = new PSubscribeCommand([pattern], {
          streamOptions: {
            signal: controller.signal,
            onMessage: (data) => this.handleMessage(data, true)
          }
        });
        command.exec(this.client).catch((error) => {
          if (error.name !== "AbortError") {
            this.dispatchToListeners("error", error);
          }
        });
        this.subscriptions.set(pattern, {
          command,
          controller,
          isPattern: true
        });
      }
      handleMessage(data, isPattern) {
        const messageData = data.replace(/^data:\s*/, "");
        const firstCommaIndex = messageData.indexOf(",");
        const secondCommaIndex = messageData.indexOf(",", firstCommaIndex + 1);
        const thirdCommaIndex = isPattern ? messageData.indexOf(",", secondCommaIndex + 1) : -1;
        if (firstCommaIndex !== -1 && secondCommaIndex !== -1) {
          const type = messageData.slice(0, firstCommaIndex);
          if (isPattern && type === "pmessage" && thirdCommaIndex !== -1) {
            const pattern = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
            const channel2 = messageData.slice(secondCommaIndex + 1, thirdCommaIndex);
            const messageStr = messageData.slice(thirdCommaIndex + 1);
            try {
              const message2 = this.opts?.automaticDeserialization === false ? messageStr : JSON.parse(messageStr);
              this.dispatchToListeners("pmessage", { pattern, channel: channel2, message: message2 });
              this.dispatchToListeners(`pmessage:${pattern}`, { pattern, channel: channel2, message: message2 });
            } catch (error) {
              this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
            }
          } else {
            const channel2 = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
            const messageStr = messageData.slice(secondCommaIndex + 1);
            try {
              if (type === "subscribe" || type === "psubscribe" || type === "unsubscribe" || type === "punsubscribe") {
                const count = Number.parseInt(messageStr);
                this.dispatchToListeners(type, count);
              } else {
                const message2 = this.opts?.automaticDeserialization === false ? messageStr : parseWithTryCatch(messageStr);
                this.dispatchToListeners(type, { channel: channel2, message: message2 });
                this.dispatchToListeners(`${type}:${channel2}`, { channel: channel2, message: message2 });
              }
            } catch (error) {
              this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
            }
          }
        }
      }
      dispatchToListeners(type, data) {
        const listeners = this.listeners.get(type);
        if (listeners) {
          for (const listener of listeners) {
            listener(data);
          }
        }
      }
      on(type, listener) {
        if (!this.listeners.has(type)) {
          this.listeners.set(type, /* @__PURE__ */ new Set());
        }
        this.listeners.get(type)?.add(listener);
      }
      removeAllListeners() {
        this.listeners.clear();
      }
      async unsubscribe(channels) {
        if (channels) {
          for (const channel2 of channels) {
            const subscription = this.subscriptions.get(channel2);
            if (subscription) {
              try {
                subscription.controller.abort();
              } catch {
              }
              this.subscriptions.delete(channel2);
            }
          }
        } else {
          for (const subscription of this.subscriptions.values()) {
            try {
              subscription.controller.abort();
            } catch {
            }
          }
          this.subscriptions.clear();
          this.removeAllListeners();
        }
      }
      getSubscribedChannels() {
        return [...this.subscriptions.keys()];
      }
    };
    SubscribeCommand = class extends Command {
      constructor(cmd, opts) {
        const sseHeaders = {
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive"
        };
        super([], {
          ...opts,
          headers: sseHeaders,
          path: ["subscribe", ...cmd],
          streamOptions: {
            isStreaming: true,
            onMessage: opts?.streamOptions?.onMessage,
            signal: opts?.streamOptions?.signal
          }
        });
      }
    };
    parseWithTryCatch = (str) => {
      try {
        return JSON.parse(str);
      } catch {
        return str;
      }
    };
    Script = class {
      script;
      /**
       * @deprecated This property is initialized to an empty string and will be set in the init method
       * asynchronously. Do not use this property immidiately after the constructor.
       *
       * This property is only exposed for backwards compatibility and will be removed in the
       * future major release.
       */
      sha1;
      initPromise;
      redis;
      constructor(redis, script) {
        this.redis = redis;
        this.script = script;
        this.sha1 = "";
        void this.init(script);
      }
      /**
       * Initialize the script by computing its SHA-1 hash.
       */
      init(script) {
        if (!this.initPromise) {
          this.initPromise = this.digest(script).then((sha1) => {
            this.sha1 = sha1;
          });
        }
        return this.initPromise;
      }
      /**
       * Send an `EVAL` command to redis.
       */
      async eval(keys, args) {
        await this.init(this.script);
        return await this.redis.eval(this.script, keys, args);
      }
      /**
       * Calculates the sha1 hash of the script and then calls `EVALSHA`.
       */
      async evalsha(keys, args) {
        await this.init(this.script);
        return await this.redis.evalsha(this.sha1, keys, args);
      }
      /**
       * Optimistically try to run `EVALSHA` first.
       * If the script is not loaded in redis, it will fall back and try again with `EVAL`.
       *
       * Following calls will be able to use the cached script
       */
      async exec(keys, args) {
        await this.init(this.script);
        const res = await this.redis.evalsha(this.sha1, keys, args).catch(async (error) => {
          if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
            return await this.redis.eval(this.script, keys, args);
          }
          throw error;
        });
        return res;
      }
      /**
       * Compute the sha1 hash of the script and return its hex representation.
       */
      async digest(s2) {
        const data = new TextEncoder().encode(s2);
        const hashBuffer = await subtle.digest("SHA-1", data);
        const hashArray = [...new Uint8Array(hashBuffer)];
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    };
    ScriptRO = class {
      script;
      /**
       * @deprecated This property is initialized to an empty string and will be set in the init method
       * asynchronously. Do not use this property immidiately after the constructor.
       *
       * This property is only exposed for backwards compatibility and will be removed in the
       * future major release.
       */
      sha1;
      initPromise;
      redis;
      constructor(redis, script) {
        this.redis = redis;
        this.sha1 = "";
        this.script = script;
        void this.init(script);
      }
      init(script) {
        if (!this.initPromise) {
          this.initPromise = this.digest(script).then((sha1) => {
            this.sha1 = sha1;
          });
        }
        return this.initPromise;
      }
      /**
       * Send an `EVAL_RO` command to redis.
       */
      async evalRo(keys, args) {
        await this.init(this.script);
        return await this.redis.evalRo(this.script, keys, args);
      }
      /**
       * Calculates the sha1 hash of the script and then calls `EVALSHA_RO`.
       */
      async evalshaRo(keys, args) {
        await this.init(this.script);
        return await this.redis.evalshaRo(this.sha1, keys, args);
      }
      /**
       * Optimistically try to run `EVALSHA_RO` first.
       * If the script is not loaded in redis, it will fall back and try again with `EVAL_RO`.
       *
       * Following calls will be able to use the cached script
       */
      async exec(keys, args) {
        await this.init(this.script);
        const res = await this.redis.evalshaRo(this.sha1, keys, args).catch(async (error) => {
          if (error instanceof Error && error.message.toLowerCase().includes("noscript")) {
            return await this.redis.evalRo(this.script, keys, args);
          }
          throw error;
        });
        return res;
      }
      /**
       * Compute the sha1 hash of the script and return its hex representation.
       */
      async digest(s2) {
        const data = new TextEncoder().encode(s2);
        const hashBuffer = await subtle.digest("SHA-1", data);
        const hashArray = [...new Uint8Array(hashBuffer)];
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      }
    };
    Redis = class {
      client;
      opts;
      enableTelemetry;
      enableAutoPipelining;
      /**
       * Create a new redis client
       *
       * @example
       * ```typescript
       * const redis = new Redis({
       *  url: "<UPSTASH_REDIS_REST_URL>",
       *  token: "<UPSTASH_REDIS_REST_TOKEN>",
       * });
       * ```
       */
      constructor(client, opts) {
        this.client = client;
        this.opts = opts;
        this.enableTelemetry = opts?.enableTelemetry ?? true;
        if (opts?.readYourWrites === false) {
          this.client.readYourWrites = false;
        }
        this.enableAutoPipelining = opts?.enableAutoPipelining ?? true;
      }
      get readYourWritesSyncToken() {
        return this.client.upstashSyncToken;
      }
      set readYourWritesSyncToken(session) {
        this.client.upstashSyncToken = session;
      }
      get json() {
        return {
          /**
           * @see https://redis.io/commands/json.arrappend
           */
          arrappend: (...args) => new JsonArrAppendCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrindex
           */
          arrindex: (...args) => new JsonArrIndexCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrinsert
           */
          arrinsert: (...args) => new JsonArrInsertCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrlen
           */
          arrlen: (...args) => new JsonArrLenCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrpop
           */
          arrpop: (...args) => new JsonArrPopCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.arrtrim
           */
          arrtrim: (...args) => new JsonArrTrimCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.clear
           */
          clear: (...args) => new JsonClearCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.del
           */
          del: (...args) => new JsonDelCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.forget
           */
          forget: (...args) => new JsonForgetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.get
           */
          get: (...args) => new JsonGetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.merge
           */
          merge: (...args) => new JsonMergeCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.mget
           */
          mget: (...args) => new JsonMGetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.mset
           */
          mset: (...args) => new JsonMSetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.numincrby
           */
          numincrby: (...args) => new JsonNumIncrByCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.nummultby
           */
          nummultby: (...args) => new JsonNumMultByCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.objkeys
           */
          objkeys: (...args) => new JsonObjKeysCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.objlen
           */
          objlen: (...args) => new JsonObjLenCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.resp
           */
          resp: (...args) => new JsonRespCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.set
           */
          set: (...args) => new JsonSetCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.strappend
           */
          strappend: (...args) => new JsonStrAppendCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.strlen
           */
          strlen: (...args) => new JsonStrLenCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.toggle
           */
          toggle: (...args) => new JsonToggleCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/commands/json.type
           */
          type: (...args) => new JsonTypeCommand(args, this.opts).exec(this.client)
        };
      }
      get functions() {
        return {
          /**
           * @see https://redis.io/docs/latest/commands/function-load/
           */
          load: (...args) => new FunctionLoadCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/docs/latest/commands/function-list/
           */
          list: (...args) => new FunctionListCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/docs/latest/commands/function-delete/
           */
          delete: (...args) => new FunctionDeleteCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/docs/latest/commands/function-flush/
           */
          flush: () => new FunctionFlushCommand(this.opts).exec(this.client),
          /**
           * @see https://redis.io/docs/latest/commands/function-stats/
           *
           * Note: `running_script` field is not supported and therefore not included in the type.
           */
          stats: () => new FunctionStatsCommand(this.opts).exec(this.client),
          /**
           * @see https://redis.io/docs/latest/commands/fcall/
           */
          call: (...args) => new FCallCommand(args, this.opts).exec(this.client),
          /**
           * @see https://redis.io/docs/latest/commands/fcall_ro/
           */
          callRo: (...args) => new FCallRoCommand(args, this.opts).exec(this.client)
        };
      }
      /**
       * Wrap a new middleware around the HTTP client.
       */
      use = (middleware) => {
        const makeRequest = this.client.request.bind(this.client);
        this.client.request = (req) => middleware(req, makeRequest);
      };
      /**
       * Technically this is not private, we can hide it from intellisense by doing this
       */
      addTelemetry = (telemetry) => {
        if (!this.enableTelemetry) {
          return;
        }
        try {
          this.client.mergeTelemetry(telemetry);
        } catch {
        }
      };
      /**
       * Creates a new script.
       *
       * Scripts offer the ability to optimistically try to execute a script without having to send the
       * entire script to the server. If the script is loaded on the server, it tries again by sending
       * the entire script. Afterwards, the script is cached on the server.
       *
       * @param script - The script to create
       * @param opts - Optional options to pass to the script `{ readonly?: boolean }`
       * @returns A new script
       *
       * @example
       * ```ts
       * const redis = new Redis({...})
       *
       * const script = redis.createScript<string>("return ARGV[1];")
       * const arg1 = await script.eval([], ["Hello World"])
       * expect(arg1, "Hello World")
       * ```
       * @example
       * ```ts
       * const redis = new Redis({...})
       *
       * const script = redis.createScript<string>("return ARGV[1];", { readonly: true })
       * const arg1 = await script.evalRo([], ["Hello World"])
       * expect(arg1, "Hello World")
       * ```
       */
      createScript(script, opts) {
        return opts?.readonly ? new ScriptRO(this, script) : new Script(this, script);
      }
      get search() {
        return {
          createIndex: (params) => {
            return createIndex(this.client, params);
          },
          index: (params) => {
            return initIndex(this.client, params);
          },
          alias: {
            list: () => {
              return listAliases(this.client);
            },
            add: ({ indexName, alias }) => {
              return addAlias(this.client, { indexName, alias });
            },
            delete: ({ alias }) => {
              return delAlias(this.client, { alias });
            }
          }
        };
      }
      /**
       * Create a new pipeline that allows you to send requests in bulk.
       *
       * @see {@link Pipeline}
       */
      pipeline = () => new Pipeline({
        client: this.client,
        commandOptions: this.opts,
        multiExec: false
      });
      autoPipeline = () => {
        return createAutoPipelineProxy(this);
      };
      /**
       * Create a new transaction to allow executing multiple steps atomically.
       *
       * All the commands in a transaction are serialized and executed sequentially. A request sent by
       * another client will never be served in the middle of the execution of a Redis Transaction. This
       * guarantees that the commands are executed as a single isolated operation.
       *
       * @see {@link Pipeline}
       */
      multi = () => new Pipeline({
        client: this.client,
        commandOptions: this.opts,
        multiExec: true
      });
      /**
       * Returns an instance that can be used to execute `BITFIELD` commands on one key.
       *
       * @example
       * ```typescript
       * redis.set("mykey", 0);
       * const result = await redis.bitfield("mykey")
       *   .set("u4", 0, 16)
       *   .incr("u4", "#1", 1)
       *   .exec();
       * console.log(result); // [0, 1]
       * ```
       *
       * @see https://redis.io/commands/bitfield
       */
      bitfield = (...args) => new BitFieldCommand(args, this.client, this.opts);
      /**
       * @see https://redis.io/commands/append
       */
      append = (...args) => new AppendCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/bitcount
       */
      bitcount = (...args) => new BitCountCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/bitop
       */
      bitop = (op, destinationKey, sourceKey, ...sourceKeys) => new BitOpCommand([op, destinationKey, sourceKey, ...sourceKeys], this.opts).exec(
        this.client
      );
      /**
       * @see https://redis.io/commands/bitpos
       */
      bitpos = (...args) => new BitPosCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/client-setinfo
       */
      clientSetinfo = (...args) => new ClientSetInfoCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/copy
       */
      copy = (...args) => new CopyCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/dbsize
       */
      dbsize = () => new DBSizeCommand(this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/decr
       */
      decr = (...args) => new DecrCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/decrby
       */
      decrby = (...args) => new DecrByCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/del
       */
      del = (...args) => new DelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/echo
       */
      echo = (...args) => new EchoCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/eval_ro
       */
      evalRo = (...args) => new EvalROCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/eval
       */
      eval = (...args) => new EvalCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/evalsha_ro
       */
      evalshaRo = (...args) => new EvalshaROCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/evalsha
       */
      evalsha = (...args) => new EvalshaCommand(args, this.opts).exec(this.client);
      /**
       * Generic method to execute any Redis command.
       */
      exec = (args) => new ExecCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/exists
       */
      exists = (...args) => new ExistsCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/expire
       */
      expire = (...args) => new ExpireCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/expireat
       */
      expireat = (...args) => new ExpireAtCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/flushall
       */
      flushall = (args) => new FlushAllCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/flushdb
       */
      flushdb = (...args) => new FlushDBCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geoadd
       */
      geoadd = (...args) => new GeoAddCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geopos
       */
      geopos = (...args) => new GeoPosCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geodist
       */
      geodist = (...args) => new GeoDistCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geohash
       */
      geohash = (...args) => new GeoHashCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geosearch
       */
      geosearch = (...args) => new GeoSearchCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/geosearchstore
       */
      geosearchstore = (...args) => new GeoSearchStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/get
       */
      get = (...args) => new GetCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getbit
       */
      getbit = (...args) => new GetBitCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getdel
       */
      getdel = (...args) => new GetDelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getex
       */
      getex = (...args) => new GetExCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getrange
       */
      getrange = (...args) => new GetRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/getset
       */
      getset = (key, value) => new GetSetCommand([key, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hdel
       */
      hdel = (...args) => new HDelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hexists
       */
      hexists = (...args) => new HExistsCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hexpire
       */
      hexpire = (...args) => new HExpireCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hexpireat
       */
      hexpireat = (...args) => new HExpireAtCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hexpiretime
       */
      hexpiretime = (...args) => new HExpireTimeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/httl
       */
      httl = (...args) => new HTtlCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpexpire
       */
      hpexpire = (...args) => new HPExpireCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpexpireat
       */
      hpexpireat = (...args) => new HPExpireAtCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpexpiretime
       */
      hpexpiretime = (...args) => new HPExpireTimeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpttl
       */
      hpttl = (...args) => new HPTtlCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hpersist
       */
      hpersist = (...args) => new HPersistCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hget
       */
      hget = (...args) => new HGetCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hgetall
       */
      hgetall = (...args) => new HGetAllCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hgetdel
       */
      hgetdel = (...args) => new HGetDelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hgetex
       */
      hgetex = (...args) => new HGetExCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hincrby
       */
      hincrby = (...args) => new HIncrByCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hincrbyfloat
       */
      hincrbyfloat = (...args) => new HIncrByFloatCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hkeys
       */
      hkeys = (...args) => new HKeysCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hlen
       */
      hlen = (...args) => new HLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hmget
       */
      hmget = (...args) => new HMGetCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hmset
       */
      hmset = (key, kv) => new HMSetCommand([key, kv], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hrandfield
       */
      hrandfield = (key, count, withValues) => new HRandFieldCommand([key, count, withValues], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hscan
       */
      hscan = (...args) => new HScanCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hset
       */
      hset = (key, kv) => new HSetCommand([key, kv], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hsetex
       */
      hsetex = (...args) => new HSetExCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hsetnx
       */
      hsetnx = (key, field, value) => new HSetNXCommand([key, field, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hstrlen
       */
      hstrlen = (...args) => new HStrLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/hvals
       */
      hvals = (...args) => new HValsCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/incr
       */
      incr = (...args) => new IncrCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/incrby
       */
      incrby = (...args) => new IncrByCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/incrbyfloat
       */
      incrbyfloat = (...args) => new IncrByFloatCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/keys
       */
      keys = (...args) => new KeysCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lindex
       */
      lindex = (...args) => new LIndexCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/linsert
       */
      linsert = (key, direction, pivot, value) => new LInsertCommand([key, direction, pivot, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/llen
       */
      llen = (...args) => new LLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lmove
       */
      lmove = (...args) => new LMoveCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lpop
       */
      lpop = (...args) => new LPopCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lmpop
       */
      lmpop = (...args) => new LmPopCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lpos
       */
      lpos = (...args) => new LPosCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lpush
       */
      lpush = (key, ...elements) => new LPushCommand([key, ...elements], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lpushx
       */
      lpushx = (key, ...elements) => new LPushXCommand([key, ...elements], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lrange
       */
      lrange = (...args) => new LRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lrem
       */
      lrem = (key, count, value) => new LRemCommand([key, count, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/lset
       */
      lset = (key, index, value) => new LSetCommand([key, index, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/ltrim
       */
      ltrim = (...args) => new LTrimCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/mget
       */
      mget = (...args) => new MGetCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/mset
       */
      mset = (kv) => new MSetCommand([kv], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/msetnx
       */
      msetnx = (kv) => new MSetNXCommand([kv], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/persist
       */
      persist = (...args) => new PersistCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pexpire
       */
      pexpire = (...args) => new PExpireCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pexpireat
       */
      pexpireat = (...args) => new PExpireAtCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pfadd
       */
      pfadd = (...args) => new PfAddCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pfcount
       */
      pfcount = (...args) => new PfCountCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/pfmerge
       */
      pfmerge = (...args) => new PfMergeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/ping
       */
      ping = (args) => new PingCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/psetex
       */
      psetex = (key, ttl, value) => new PSetEXCommand([key, ttl, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/psubscribe
       */
      psubscribe = (patterns) => {
        const patternArray = Array.isArray(patterns) ? patterns : [patterns];
        return new Subscriber(this.client, patternArray, true, this.opts);
      };
      /**
       * @see https://redis.io/commands/pttl
       */
      pttl = (...args) => new PTtlCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/publish
       */
      publish = (...args) => new PublishCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/randomkey
       */
      randomkey = () => new RandomKeyCommand().exec(this.client);
      /**
       * @see https://redis.io/commands/rename
       */
      rename = (...args) => new RenameCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/renamenx
       */
      renamenx = (...args) => new RenameNXCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/rpop
       */
      rpop = (...args) => new RPopCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/rpush
       */
      rpush = (key, ...elements) => new RPushCommand([key, ...elements], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/rpushx
       */
      rpushx = (key, ...elements) => new RPushXCommand([key, ...elements], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sadd
       */
      sadd = (key, member, ...members) => new SAddCommand([key, member, ...members], this.opts).exec(this.client);
      scan(cursor, opts) {
        return new ScanCommand([cursor, opts], this.opts).exec(this.client);
      }
      /**
       * @see https://redis.io/commands/scard
       */
      scard = (...args) => new SCardCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/script-exists
       */
      scriptExists = (...args) => new ScriptExistsCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/script-flush
       */
      scriptFlush = (...args) => new ScriptFlushCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/script-load
       */
      scriptLoad = (...args) => new ScriptLoadCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sdiff
       */
      sdiff = (...args) => new SDiffCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sdiffstore
       */
      sdiffstore = (...args) => new SDiffStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/set
       */
      set = (key, value, opts) => new SetCommand([key, value, opts], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/setbit
       */
      setbit = (...args) => new SetBitCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/setex
       */
      setex = (key, ttl, value) => new SetExCommand([key, ttl, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/setnx
       */
      setnx = (key, value) => new SetNxCommand([key, value], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/setrange
       */
      setrange = (...args) => new SetRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sinter
       */
      sinter = (...args) => new SInterCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sintercard
       */
      sintercard = (...args) => new SInterCardCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sinterstore
       */
      sinterstore = (...args) => new SInterStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sismember
       */
      sismember = (key, member) => new SIsMemberCommand([key, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/smismember
       */
      smismember = (key, members) => new SMIsMemberCommand([key, members], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/smembers
       */
      smembers = (...args) => new SMembersCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/smove
       */
      smove = (source, destination, member) => new SMoveCommand([source, destination, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/spop
       */
      spop = (...args) => new SPopCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/srandmember
       */
      srandmember = (...args) => new SRandMemberCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/srem
       */
      srem = (key, ...members) => new SRemCommand([key, ...members], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sscan
       */
      sscan = (...args) => new SScanCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/strlen
       */
      strlen = (...args) => new StrLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/subscribe
       */
      subscribe = (channels) => {
        const channelArray = Array.isArray(channels) ? channels : [channels];
        return new Subscriber(this.client, channelArray, false, this.opts);
      };
      /**
       * @see https://redis.io/commands/sunion
       */
      sunion = (...args) => new SUnionCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/sunionstore
       */
      sunionstore = (...args) => new SUnionStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/time
       */
      time = () => new TimeCommand().exec(this.client);
      /**
       * @see https://redis.io/commands/touch
       */
      touch = (...args) => new TouchCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/ttl
       */
      ttl = (...args) => new TtlCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/type
       */
      type = (...args) => new TypeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/unlink
       */
      unlink = (...args) => new UnlinkCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xadd
       */
      xadd = (...args) => new XAddCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xack
       */
      xack = (...args) => new XAckCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xackdel
       */
      xackdel = (...args) => new XAckDelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xdel
       */
      xdel = (...args) => new XDelCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xdelex
       */
      xdelex = (...args) => new XDelExCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xgroup
       */
      xgroup = (...args) => new XGroupCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xread
       */
      xread = (...args) => new XReadCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xreadgroup
       */
      xreadgroup = (...args) => new XReadGroupCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xinfo
       */
      xinfo = (...args) => new XInfoCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xlen
       */
      xlen = (...args) => new XLenCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xpending
       */
      xpending = (...args) => new XPendingCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xclaim
       */
      xclaim = (...args) => new XClaimCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xautoclaim
       */
      xautoclaim = (...args) => new XAutoClaim(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xtrim
       */
      xtrim = (...args) => new XTrimCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xrange
       */
      xrange = (...args) => new XRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/xrevrange
       */
      xrevrange = (...args) => new XRevRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zadd
       */
      zadd = (...args) => {
        if ("score" in args[1]) {
          return new ZAddCommand([args[0], args[1], ...args.slice(2)], this.opts).exec(
            this.client
          );
        }
        return new ZAddCommand(
          [args[0], args[1], ...args.slice(2)],
          this.opts
        ).exec(this.client);
      };
      /**
       * @see https://redis.io/commands/zcard
       */
      zcard = (...args) => new ZCardCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zcount
       */
      zcount = (...args) => new ZCountCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zdiffstore
       */
      zdiffstore = (...args) => new ZDiffStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zincrby
       */
      zincrby = (key, increment, member) => new ZIncrByCommand([key, increment, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zinterstore
       */
      zinterstore = (...args) => new ZInterStoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zlexcount
       */
      zlexcount = (...args) => new ZLexCountCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zmscore
       */
      zmscore = (...args) => new ZMScoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zpopmax
       */
      zpopmax = (...args) => new ZPopMaxCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zpopmin
       */
      zpopmin = (...args) => new ZPopMinCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zrange
       */
      zrange = (...args) => new ZRangeCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zrank
       */
      zrank = (key, member) => new ZRankCommand([key, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zrem
       */
      zrem = (key, ...members) => new ZRemCommand([key, ...members], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zremrangebylex
       */
      zremrangebylex = (...args) => new ZRemRangeByLexCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zremrangebyrank
       */
      zremrangebyrank = (...args) => new ZRemRangeByRankCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zremrangebyscore
       */
      zremrangebyscore = (...args) => new ZRemRangeByScoreCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zrevrank
       */
      zrevrank = (key, member) => new ZRevRankCommand([key, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zscan
       */
      zscan = (...args) => new ZScanCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zscore
       */
      zscore = (key, member) => new ZScoreCommand([key, member], this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zunion
       */
      zunion = (...args) => new ZUnionCommand(args, this.opts).exec(this.client);
      /**
       * @see https://redis.io/commands/zunionstore
       */
      zunionstore = (...args) => new ZUnionStoreCommand(args, this.opts).exec(this.client);
    };
    VERSION = "v1.30.2";
  }
});

// node_modules/@upstash/redis/nodejs.mjs
var nodejs_exports = {};
__export(nodejs_exports, {
  Redis: () => Redis2,
  SearchIndex: () => SearchIndex,
  errors: () => error_exports,
  s: () => s
});
var BUILD, TextFieldBuilder, NumericFieldBuilder, BoolFieldBuilder, DateFieldBuilder, KeywordFieldBuilder, FacetFieldBuilder, s, Redis2;
var init_nodejs = __esm({
  "node_modules/@upstash/redis/nodejs.mjs"() {
    init_chunk_IH7W44G6();
    BUILD = /* @__PURE__ */ Symbol("build");
    TextFieldBuilder = class _TextFieldBuilder {
      _noTokenize;
      _noStem;
      _from;
      constructor(noTokenize = { noTokenize: false }, noStem = { noStem: false }, from = { from: null }) {
        this._noTokenize = noTokenize;
        this._noStem = noStem;
        this._from = from;
      }
      noTokenize() {
        return new _TextFieldBuilder({ noTokenize: true }, this._noStem, this._from);
      }
      noStem() {
        return new _TextFieldBuilder(this._noTokenize, { noStem: true }, this._from);
      }
      from(field) {
        return new _TextFieldBuilder(this._noTokenize, this._noStem, { from: field });
      }
      [BUILD]() {
        return {
          type: "TEXT",
          ...this._noTokenize.noTokenize ? { noTokenize: true } : {},
          ...this._noStem.noStem ? { noStem: true } : {},
          ...this._from.from ? { from: this._from.from } : {}
        };
      }
    };
    NumericFieldBuilder = class _NumericFieldBuilder {
      type;
      _from;
      constructor(type, from = { from: null }) {
        this.type = type;
        this._from = from;
      }
      from(field) {
        return new _NumericFieldBuilder(this.type, { from: field });
      }
      [BUILD]() {
        return this._from.from ? {
          type: this.type,
          fast: true,
          from: this._from.from
        } : {
          type: this.type,
          fast: true
        };
      }
    };
    BoolFieldBuilder = class _BoolFieldBuilder {
      _fast;
      _from;
      constructor(fast = { fast: false }, from = { from: null }) {
        this._fast = fast;
        this._from = from;
      }
      fast() {
        return new _BoolFieldBuilder({ fast: true }, this._from);
      }
      from(field) {
        return new _BoolFieldBuilder(this._fast, { from: field });
      }
      [BUILD]() {
        const hasFast = this._fast.fast;
        const hasFrom = Boolean(this._from.from);
        if (hasFast && hasFrom) {
          return {
            type: "BOOL",
            fast: true,
            from: this._from.from
          };
        }
        if (hasFast) {
          return {
            type: "BOOL",
            fast: true
          };
        }
        if (hasFrom) {
          return {
            type: "BOOL",
            from: this._from.from
          };
        }
        return { type: "BOOL" };
      }
    };
    DateFieldBuilder = class _DateFieldBuilder {
      _fast;
      _from;
      constructor(fast = { fast: false }, from = { from: null }) {
        this._fast = fast;
        this._from = from;
      }
      fast() {
        return new _DateFieldBuilder({ fast: true }, this._from);
      }
      from(field) {
        return new _DateFieldBuilder(this._fast, { from: field });
      }
      [BUILD]() {
        const hasFast = this._fast.fast;
        const hasFrom = Boolean(this._from.from);
        if (hasFast && hasFrom) {
          return {
            type: "DATE",
            fast: true,
            from: this._from.from
          };
        }
        if (hasFast) {
          return {
            type: "DATE",
            fast: true
          };
        }
        if (hasFrom) {
          return {
            type: "DATE",
            from: this._from.from
          };
        }
        return { type: "DATE" };
      }
    };
    KeywordFieldBuilder = class {
      [BUILD]() {
        return { type: "KEYWORD" };
      }
    };
    FacetFieldBuilder = class {
      [BUILD]() {
        return { type: "FACET" };
      }
    };
    s = {
      string() {
        return new TextFieldBuilder();
      },
      number(type = "F64") {
        return new NumericFieldBuilder(type);
      },
      boolean() {
        return new BoolFieldBuilder();
      },
      date() {
        return new DateFieldBuilder();
      },
      keyword() {
        return new KeywordFieldBuilder();
      },
      facet() {
        return new FacetFieldBuilder();
      },
      object(fields) {
        const result = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value && typeof value === "object" && BUILD in value) {
            result[key] = value[BUILD]();
          } else {
            result[key] = value;
          }
        }
        return result;
      }
    };
    if (typeof atob === "undefined") {
      global.atob = (b64) => Buffer.from(b64, "base64").toString("utf8");
    }
    Redis2 = class _Redis extends Redis {
      /**
       * Create a new redis client by providing a custom `Requester` implementation
       *
       * @example
       * ```ts
       *
       * import { UpstashRequest, Requester, UpstashResponse, Redis } from "@upstash/redis"
       *
       *  const requester: Requester = {
       *    request: <TResult>(req: UpstashRequest): Promise<UpstashResponse<TResult>> => {
       *      // ...
       *    }
       *  }
       *
       * const redis = new Redis(requester)
       * ```
       */
      constructor(configOrRequester) {
        if ("request" in configOrRequester) {
          super(configOrRequester);
          return;
        }
        if (!configOrRequester.url) {
          console.warn(
            `[Upstash Redis] The 'url' property is missing or undefined in your Redis config.`
          );
        } else if (configOrRequester.url.startsWith(" ") || configOrRequester.url.endsWith(" ") || /\r|\n/.test(configOrRequester.url)) {
          console.warn(
            "[Upstash Redis] The redis url contains whitespace or newline, which can cause errors!"
          );
        }
        if (!configOrRequester.token) {
          console.warn(
            `[Upstash Redis] The 'token' property is missing or undefined in your Redis config.`
          );
        } else if (configOrRequester.token.startsWith(" ") || configOrRequester.token.endsWith(" ") || /\r|\n/.test(configOrRequester.token)) {
          console.warn(
            "[Upstash Redis] The redis token contains whitespace or newline, which can cause errors!"
          );
        }
        const client = new HttpClient({
          baseUrl: configOrRequester.url,
          retry: configOrRequester.retry,
          headers: { authorization: `Bearer ${configOrRequester.token}` },
          agent: configOrRequester.agent,
          responseEncoding: configOrRequester.responseEncoding,
          cache: configOrRequester.cache ?? "no-store",
          signal: configOrRequester.signal,
          keepAlive: configOrRequester.keepAlive,
          readYourWrites: configOrRequester.readYourWrites
        });
        const safeEnv = typeof process === "object" && process && typeof process.env === "object" && process.env ? process.env : {};
        super(client, {
          automaticDeserialization: configOrRequester.automaticDeserialization,
          enableTelemetry: configOrRequester.enableTelemetry ?? !safeEnv.UPSTASH_DISABLE_TELEMETRY,
          latencyLogging: configOrRequester.latencyLogging,
          enableAutoPipelining: configOrRequester.enableAutoPipelining
        });
        const nodeVersion = typeof process === "object" && process ? process.version : void 0;
        this.addTelemetry({
          runtime: (
            // @ts-expect-error to silence compiler
            typeof EdgeRuntime === "string" ? "edge-light" : nodeVersion ? `node@${nodeVersion}` : "unknown"
          ),
          platform: safeEnv.UPSTASH_CONSOLE ? "console" : safeEnv.VERCEL ? "vercel" : safeEnv.AWS_REGION ? "aws" : "unknown",
          sdk: `@upstash/redis@${VERSION}`
        });
        if (this.enableAutoPipelining) {
          return this.autoPipeline();
        }
      }
      /**
       * Create a new Upstash Redis instance from environment variables.
       *
       * Use this to automatically load connection secrets from your environment
       * variables. For instance when using the Vercel integration.
       *
       * This tries to load connection details from your environment using `process.env`:
       * - URL: `UPSTASH_REDIS_REST_URL` or fallback to `KV_REST_API_URL`
       * - Token: `UPSTASH_REDIS_REST_TOKEN` or fallback to `KV_REST_API_TOKEN`
       *
       * The fallback variables provide compatibility with Vercel KV and other platforms
       * that may use different naming conventions.
       */
      static fromEnv(config2) {
        if (typeof process !== "object" || !process || typeof process.env !== "object" || !process.env) {
          throw new TypeError(
            '[Upstash Redis] Unable to get environment variables, `process.env` is undefined. If you are deploying to cloudflare, please import from "@upstash/redis/cloudflare" instead'
          );
        }
        const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
        if (!url) {
          console.warn("[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_URL`");
        }
        const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
        if (!token) {
          console.warn(
            "[Upstash Redis] Unable to find environment variable: `UPSTASH_REDIS_REST_TOKEN`"
          );
        }
        return new _Redis({ ...config2, url, token });
      }
    };
  }
});

// node_modules/jmespath/jmespath.js
var require_jmespath = __commonJS({
  "node_modules/jmespath/jmespath.js"(exports) {
    (function(exports2) {
      "use strict";
      function isArray(obj) {
        if (obj !== null) {
          return Object.prototype.toString.call(obj) === "[object Array]";
        } else {
          return false;
        }
      }
      function isObject2(obj) {
        if (obj !== null) {
          return Object.prototype.toString.call(obj) === "[object Object]";
        } else {
          return false;
        }
      }
      function strictDeepEqual(first, second) {
        if (first === second) {
          return true;
        }
        var firstType = Object.prototype.toString.call(first);
        if (firstType !== Object.prototype.toString.call(second)) {
          return false;
        }
        if (isArray(first) === true) {
          if (first.length !== second.length) {
            return false;
          }
          for (var i = 0; i < first.length; i++) {
            if (strictDeepEqual(first[i], second[i]) === false) {
              return false;
            }
          }
          return true;
        }
        if (isObject2(first) === true) {
          var keysSeen = {};
          for (var key in first) {
            if (hasOwnProperty.call(first, key)) {
              if (strictDeepEqual(first[key], second[key]) === false) {
                return false;
              }
              keysSeen[key] = true;
            }
          }
          for (var key2 in second) {
            if (hasOwnProperty.call(second, key2)) {
              if (keysSeen[key2] !== true) {
                return false;
              }
            }
          }
          return true;
        }
        return false;
      }
      function isFalse(obj) {
        if (obj === "" || obj === false || obj === null) {
          return true;
        } else if (isArray(obj) && obj.length === 0) {
          return true;
        } else if (isObject2(obj)) {
          for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
              return false;
            }
          }
          return true;
        } else {
          return false;
        }
      }
      function objValues(obj) {
        var keys = Object.keys(obj);
        var values = [];
        for (var i = 0; i < keys.length; i++) {
          values.push(obj[keys[i]]);
        }
        return values;
      }
      function merge2(a, b) {
        var merged = {};
        for (var key in a) {
          merged[key] = a[key];
        }
        for (var key2 in b) {
          merged[key2] = b[key2];
        }
        return merged;
      }
      var trimLeft;
      if (typeof String.prototype.trimLeft === "function") {
        trimLeft = function(str) {
          return str.trimLeft();
        };
      } else {
        trimLeft = function(str) {
          return str.match(/^\s*(.*)/)[1];
        };
      }
      var TYPE_NUMBER = 0;
      var TYPE_ANY = 1;
      var TYPE_STRING = 2;
      var TYPE_ARRAY = 3;
      var TYPE_OBJECT = 4;
      var TYPE_BOOLEAN = 5;
      var TYPE_EXPREF = 6;
      var TYPE_NULL = 7;
      var TYPE_ARRAY_NUMBER = 8;
      var TYPE_ARRAY_STRING = 9;
      var TYPE_NAME_TABLE = {
        0: "number",
        1: "any",
        2: "string",
        3: "array",
        4: "object",
        5: "boolean",
        6: "expression",
        7: "null",
        8: "Array<number>",
        9: "Array<string>"
      };
      var TOK_EOF = "EOF";
      var TOK_UNQUOTEDIDENTIFIER = "UnquotedIdentifier";
      var TOK_QUOTEDIDENTIFIER = "QuotedIdentifier";
      var TOK_RBRACKET = "Rbracket";
      var TOK_RPAREN = "Rparen";
      var TOK_COMMA = "Comma";
      var TOK_COLON = "Colon";
      var TOK_RBRACE = "Rbrace";
      var TOK_NUMBER = "Number";
      var TOK_CURRENT = "Current";
      var TOK_EXPREF = "Expref";
      var TOK_PIPE = "Pipe";
      var TOK_OR = "Or";
      var TOK_AND = "And";
      var TOK_EQ = "EQ";
      var TOK_GT = "GT";
      var TOK_LT = "LT";
      var TOK_GTE = "GTE";
      var TOK_LTE = "LTE";
      var TOK_NE = "NE";
      var TOK_FLATTEN = "Flatten";
      var TOK_STAR = "Star";
      var TOK_FILTER = "Filter";
      var TOK_DOT = "Dot";
      var TOK_NOT = "Not";
      var TOK_LBRACE = "Lbrace";
      var TOK_LBRACKET = "Lbracket";
      var TOK_LPAREN = "Lparen";
      var TOK_LITERAL = "Literal";
      var basicTokens = {
        ".": TOK_DOT,
        "*": TOK_STAR,
        ",": TOK_COMMA,
        ":": TOK_COLON,
        "{": TOK_LBRACE,
        "}": TOK_RBRACE,
        "]": TOK_RBRACKET,
        "(": TOK_LPAREN,
        ")": TOK_RPAREN,
        "@": TOK_CURRENT
      };
      var operatorStartToken = {
        "<": true,
        ">": true,
        "=": true,
        "!": true
      };
      var skipChars = {
        " ": true,
        "	": true,
        "\n": true
      };
      function isAlpha(ch) {
        return ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z" || ch === "_";
      }
      function isNum(ch) {
        return ch >= "0" && ch <= "9" || ch === "-";
      }
      function isAlphaNum(ch) {
        return ch >= "a" && ch <= "z" || ch >= "A" && ch <= "Z" || ch >= "0" && ch <= "9" || ch === "_";
      }
      function Lexer() {
      }
      Lexer.prototype = {
        tokenize: function(stream) {
          var tokens = [];
          this._current = 0;
          var start;
          var identifier;
          var token;
          while (this._current < stream.length) {
            if (isAlpha(stream[this._current])) {
              start = this._current;
              identifier = this._consumeUnquotedIdentifier(stream);
              tokens.push({
                type: TOK_UNQUOTEDIDENTIFIER,
                value: identifier,
                start
              });
            } else if (basicTokens[stream[this._current]] !== void 0) {
              tokens.push({
                type: basicTokens[stream[this._current]],
                value: stream[this._current],
                start: this._current
              });
              this._current++;
            } else if (isNum(stream[this._current])) {
              token = this._consumeNumber(stream);
              tokens.push(token);
            } else if (stream[this._current] === "[") {
              token = this._consumeLBracket(stream);
              tokens.push(token);
            } else if (stream[this._current] === '"') {
              start = this._current;
              identifier = this._consumeQuotedIdentifier(stream);
              tokens.push({
                type: TOK_QUOTEDIDENTIFIER,
                value: identifier,
                start
              });
            } else if (stream[this._current] === "'") {
              start = this._current;
              identifier = this._consumeRawStringLiteral(stream);
              tokens.push({
                type: TOK_LITERAL,
                value: identifier,
                start
              });
            } else if (stream[this._current] === "`") {
              start = this._current;
              var literal = this._consumeLiteral(stream);
              tokens.push({
                type: TOK_LITERAL,
                value: literal,
                start
              });
            } else if (operatorStartToken[stream[this._current]] !== void 0) {
              tokens.push(this._consumeOperator(stream));
            } else if (skipChars[stream[this._current]] !== void 0) {
              this._current++;
            } else if (stream[this._current] === "&") {
              start = this._current;
              this._current++;
              if (stream[this._current] === "&") {
                this._current++;
                tokens.push({ type: TOK_AND, value: "&&", start });
              } else {
                tokens.push({ type: TOK_EXPREF, value: "&", start });
              }
            } else if (stream[this._current] === "|") {
              start = this._current;
              this._current++;
              if (stream[this._current] === "|") {
                this._current++;
                tokens.push({ type: TOK_OR, value: "||", start });
              } else {
                tokens.push({ type: TOK_PIPE, value: "|", start });
              }
            } else {
              var error = new Error("Unknown character:" + stream[this._current]);
              error.name = "LexerError";
              throw error;
            }
          }
          return tokens;
        },
        _consumeUnquotedIdentifier: function(stream) {
          var start = this._current;
          this._current++;
          while (this._current < stream.length && isAlphaNum(stream[this._current])) {
            this._current++;
          }
          return stream.slice(start, this._current);
        },
        _consumeQuotedIdentifier: function(stream) {
          var start = this._current;
          this._current++;
          var maxLength = stream.length;
          while (stream[this._current] !== '"' && this._current < maxLength) {
            var current = this._current;
            if (stream[current] === "\\" && (stream[current + 1] === "\\" || stream[current + 1] === '"')) {
              current += 2;
            } else {
              current++;
            }
            this._current = current;
          }
          this._current++;
          return JSON.parse(stream.slice(start, this._current));
        },
        _consumeRawStringLiteral: function(stream) {
          var start = this._current;
          this._current++;
          var maxLength = stream.length;
          while (stream[this._current] !== "'" && this._current < maxLength) {
            var current = this._current;
            if (stream[current] === "\\" && (stream[current + 1] === "\\" || stream[current + 1] === "'")) {
              current += 2;
            } else {
              current++;
            }
            this._current = current;
          }
          this._current++;
          var literal = stream.slice(start + 1, this._current - 1);
          return literal.replace("\\'", "'");
        },
        _consumeNumber: function(stream) {
          var start = this._current;
          this._current++;
          var maxLength = stream.length;
          while (isNum(stream[this._current]) && this._current < maxLength) {
            this._current++;
          }
          var value = parseInt(stream.slice(start, this._current));
          return { type: TOK_NUMBER, value, start };
        },
        _consumeLBracket: function(stream) {
          var start = this._current;
          this._current++;
          if (stream[this._current] === "?") {
            this._current++;
            return { type: TOK_FILTER, value: "[?", start };
          } else if (stream[this._current] === "]") {
            this._current++;
            return { type: TOK_FLATTEN, value: "[]", start };
          } else {
            return { type: TOK_LBRACKET, value: "[", start };
          }
        },
        _consumeOperator: function(stream) {
          var start = this._current;
          var startingChar = stream[start];
          this._current++;
          if (startingChar === "!") {
            if (stream[this._current] === "=") {
              this._current++;
              return { type: TOK_NE, value: "!=", start };
            } else {
              return { type: TOK_NOT, value: "!", start };
            }
          } else if (startingChar === "<") {
            if (stream[this._current] === "=") {
              this._current++;
              return { type: TOK_LTE, value: "<=", start };
            } else {
              return { type: TOK_LT, value: "<", start };
            }
          } else if (startingChar === ">") {
            if (stream[this._current] === "=") {
              this._current++;
              return { type: TOK_GTE, value: ">=", start };
            } else {
              return { type: TOK_GT, value: ">", start };
            }
          } else if (startingChar === "=") {
            if (stream[this._current] === "=") {
              this._current++;
              return { type: TOK_EQ, value: "==", start };
            }
          }
        },
        _consumeLiteral: function(stream) {
          this._current++;
          var start = this._current;
          var maxLength = stream.length;
          var literal;
          while (stream[this._current] !== "`" && this._current < maxLength) {
            var current = this._current;
            if (stream[current] === "\\" && (stream[current + 1] === "\\" || stream[current + 1] === "`")) {
              current += 2;
            } else {
              current++;
            }
            this._current = current;
          }
          var literalString = trimLeft(stream.slice(start, this._current));
          literalString = literalString.replace("\\`", "`");
          if (this._looksLikeJSON(literalString)) {
            literal = JSON.parse(literalString);
          } else {
            literal = JSON.parse('"' + literalString + '"');
          }
          this._current++;
          return literal;
        },
        _looksLikeJSON: function(literalString) {
          var startingChars = '[{"';
          var jsonLiterals = ["true", "false", "null"];
          var numberLooking = "-0123456789";
          if (literalString === "") {
            return false;
          } else if (startingChars.indexOf(literalString[0]) >= 0) {
            return true;
          } else if (jsonLiterals.indexOf(literalString) >= 0) {
            return true;
          } else if (numberLooking.indexOf(literalString[0]) >= 0) {
            try {
              JSON.parse(literalString);
              return true;
            } catch (ex) {
              return false;
            }
          } else {
            return false;
          }
        }
      };
      var bindingPower = {};
      bindingPower[TOK_EOF] = 0;
      bindingPower[TOK_UNQUOTEDIDENTIFIER] = 0;
      bindingPower[TOK_QUOTEDIDENTIFIER] = 0;
      bindingPower[TOK_RBRACKET] = 0;
      bindingPower[TOK_RPAREN] = 0;
      bindingPower[TOK_COMMA] = 0;
      bindingPower[TOK_RBRACE] = 0;
      bindingPower[TOK_NUMBER] = 0;
      bindingPower[TOK_CURRENT] = 0;
      bindingPower[TOK_EXPREF] = 0;
      bindingPower[TOK_PIPE] = 1;
      bindingPower[TOK_OR] = 2;
      bindingPower[TOK_AND] = 3;
      bindingPower[TOK_EQ] = 5;
      bindingPower[TOK_GT] = 5;
      bindingPower[TOK_LT] = 5;
      bindingPower[TOK_GTE] = 5;
      bindingPower[TOK_LTE] = 5;
      bindingPower[TOK_NE] = 5;
      bindingPower[TOK_FLATTEN] = 9;
      bindingPower[TOK_STAR] = 20;
      bindingPower[TOK_FILTER] = 21;
      bindingPower[TOK_DOT] = 40;
      bindingPower[TOK_NOT] = 45;
      bindingPower[TOK_LBRACE] = 50;
      bindingPower[TOK_LBRACKET] = 55;
      bindingPower[TOK_LPAREN] = 60;
      function Parser() {
      }
      Parser.prototype = {
        parse: function(expression) {
          this._loadTokens(expression);
          this.index = 0;
          var ast = this.expression(0);
          if (this._lookahead(0) !== TOK_EOF) {
            var t = this._lookaheadToken(0);
            var error = new Error(
              "Unexpected token type: " + t.type + ", value: " + t.value
            );
            error.name = "ParserError";
            throw error;
          }
          return ast;
        },
        _loadTokens: function(expression) {
          var lexer = new Lexer();
          var tokens = lexer.tokenize(expression);
          tokens.push({ type: TOK_EOF, value: "", start: expression.length });
          this.tokens = tokens;
        },
        expression: function(rbp) {
          var leftToken = this._lookaheadToken(0);
          this._advance();
          var left = this.nud(leftToken);
          var currentToken = this._lookahead(0);
          while (rbp < bindingPower[currentToken]) {
            this._advance();
            left = this.led(currentToken, left);
            currentToken = this._lookahead(0);
          }
          return left;
        },
        _lookahead: function(number) {
          return this.tokens[this.index + number].type;
        },
        _lookaheadToken: function(number) {
          return this.tokens[this.index + number];
        },
        _advance: function() {
          this.index++;
        },
        nud: function(token) {
          var left;
          var right;
          var expression;
          switch (token.type) {
            case TOK_LITERAL:
              return { type: "Literal", value: token.value };
            case TOK_UNQUOTEDIDENTIFIER:
              return { type: "Field", name: token.value };
            case TOK_QUOTEDIDENTIFIER:
              var node = { type: "Field", name: token.value };
              if (this._lookahead(0) === TOK_LPAREN) {
                throw new Error("Quoted identifier not allowed for function names.");
              }
              return node;
            case TOK_NOT:
              right = this.expression(bindingPower.Not);
              return { type: "NotExpression", children: [right] };
            case TOK_STAR:
              left = { type: "Identity" };
              right = null;
              if (this._lookahead(0) === TOK_RBRACKET) {
                right = { type: "Identity" };
              } else {
                right = this._parseProjectionRHS(bindingPower.Star);
              }
              return { type: "ValueProjection", children: [left, right] };
            case TOK_FILTER:
              return this.led(token.type, { type: "Identity" });
            case TOK_LBRACE:
              return this._parseMultiselectHash();
            case TOK_FLATTEN:
              left = { type: TOK_FLATTEN, children: [{ type: "Identity" }] };
              right = this._parseProjectionRHS(bindingPower.Flatten);
              return { type: "Projection", children: [left, right] };
            case TOK_LBRACKET:
              if (this._lookahead(0) === TOK_NUMBER || this._lookahead(0) === TOK_COLON) {
                right = this._parseIndexExpression();
                return this._projectIfSlice({ type: "Identity" }, right);
              } else if (this._lookahead(0) === TOK_STAR && this._lookahead(1) === TOK_RBRACKET) {
                this._advance();
                this._advance();
                right = this._parseProjectionRHS(bindingPower.Star);
                return {
                  type: "Projection",
                  children: [{ type: "Identity" }, right]
                };
              }
              return this._parseMultiselectList();
            case TOK_CURRENT:
              return { type: TOK_CURRENT };
            case TOK_EXPREF:
              expression = this.expression(bindingPower.Expref);
              return { type: "ExpressionReference", children: [expression] };
            case TOK_LPAREN:
              var args = [];
              while (this._lookahead(0) !== TOK_RPAREN) {
                if (this._lookahead(0) === TOK_CURRENT) {
                  expression = { type: TOK_CURRENT };
                  this._advance();
                } else {
                  expression = this.expression(0);
                }
                args.push(expression);
              }
              this._match(TOK_RPAREN);
              return args[0];
            default:
              this._errorToken(token);
          }
        },
        led: function(tokenName, left) {
          var right;
          switch (tokenName) {
            case TOK_DOT:
              var rbp = bindingPower.Dot;
              if (this._lookahead(0) !== TOK_STAR) {
                right = this._parseDotRHS(rbp);
                return { type: "Subexpression", children: [left, right] };
              }
              this._advance();
              right = this._parseProjectionRHS(rbp);
              return { type: "ValueProjection", children: [left, right] };
            case TOK_PIPE:
              right = this.expression(bindingPower.Pipe);
              return { type: TOK_PIPE, children: [left, right] };
            case TOK_OR:
              right = this.expression(bindingPower.Or);
              return { type: "OrExpression", children: [left, right] };
            case TOK_AND:
              right = this.expression(bindingPower.And);
              return { type: "AndExpression", children: [left, right] };
            case TOK_LPAREN:
              var name = left.name;
              var args = [];
              var expression, node;
              while (this._lookahead(0) !== TOK_RPAREN) {
                if (this._lookahead(0) === TOK_CURRENT) {
                  expression = { type: TOK_CURRENT };
                  this._advance();
                } else {
                  expression = this.expression(0);
                }
                if (this._lookahead(0) === TOK_COMMA) {
                  this._match(TOK_COMMA);
                }
                args.push(expression);
              }
              this._match(TOK_RPAREN);
              node = { type: "Function", name, children: args };
              return node;
            case TOK_FILTER:
              var condition = this.expression(0);
              this._match(TOK_RBRACKET);
              if (this._lookahead(0) === TOK_FLATTEN) {
                right = { type: "Identity" };
              } else {
                right = this._parseProjectionRHS(bindingPower.Filter);
              }
              return { type: "FilterProjection", children: [left, right, condition] };
            case TOK_FLATTEN:
              var leftNode = { type: TOK_FLATTEN, children: [left] };
              var rightNode = this._parseProjectionRHS(bindingPower.Flatten);
              return { type: "Projection", children: [leftNode, rightNode] };
            case TOK_EQ:
            case TOK_NE:
            case TOK_GT:
            case TOK_GTE:
            case TOK_LT:
            case TOK_LTE:
              return this._parseComparator(left, tokenName);
            case TOK_LBRACKET:
              var token = this._lookaheadToken(0);
              if (token.type === TOK_NUMBER || token.type === TOK_COLON) {
                right = this._parseIndexExpression();
                return this._projectIfSlice(left, right);
              }
              this._match(TOK_STAR);
              this._match(TOK_RBRACKET);
              right = this._parseProjectionRHS(bindingPower.Star);
              return { type: "Projection", children: [left, right] };
            default:
              this._errorToken(this._lookaheadToken(0));
          }
        },
        _match: function(tokenType) {
          if (this._lookahead(0) === tokenType) {
            this._advance();
          } else {
            var t = this._lookaheadToken(0);
            var error = new Error("Expected " + tokenType + ", got: " + t.type);
            error.name = "ParserError";
            throw error;
          }
        },
        _errorToken: function(token) {
          var error = new Error("Invalid token (" + token.type + '): "' + token.value + '"');
          error.name = "ParserError";
          throw error;
        },
        _parseIndexExpression: function() {
          if (this._lookahead(0) === TOK_COLON || this._lookahead(1) === TOK_COLON) {
            return this._parseSliceExpression();
          } else {
            var node = {
              type: "Index",
              value: this._lookaheadToken(0).value
            };
            this._advance();
            this._match(TOK_RBRACKET);
            return node;
          }
        },
        _projectIfSlice: function(left, right) {
          var indexExpr = { type: "IndexExpression", children: [left, right] };
          if (right.type === "Slice") {
            return {
              type: "Projection",
              children: [indexExpr, this._parseProjectionRHS(bindingPower.Star)]
            };
          } else {
            return indexExpr;
          }
        },
        _parseSliceExpression: function() {
          var parts = [null, null, null];
          var index = 0;
          var currentToken = this._lookahead(0);
          while (currentToken !== TOK_RBRACKET && index < 3) {
            if (currentToken === TOK_COLON) {
              index++;
              this._advance();
            } else if (currentToken === TOK_NUMBER) {
              parts[index] = this._lookaheadToken(0).value;
              this._advance();
            } else {
              var t = this._lookahead(0);
              var error = new Error("Syntax error, unexpected token: " + t.value + "(" + t.type + ")");
              error.name = "Parsererror";
              throw error;
            }
            currentToken = this._lookahead(0);
          }
          this._match(TOK_RBRACKET);
          return {
            type: "Slice",
            children: parts
          };
        },
        _parseComparator: function(left, comparator) {
          var right = this.expression(bindingPower[comparator]);
          return { type: "Comparator", name: comparator, children: [left, right] };
        },
        _parseDotRHS: function(rbp) {
          var lookahead = this._lookahead(0);
          var exprTokens = [TOK_UNQUOTEDIDENTIFIER, TOK_QUOTEDIDENTIFIER, TOK_STAR];
          if (exprTokens.indexOf(lookahead) >= 0) {
            return this.expression(rbp);
          } else if (lookahead === TOK_LBRACKET) {
            this._match(TOK_LBRACKET);
            return this._parseMultiselectList();
          } else if (lookahead === TOK_LBRACE) {
            this._match(TOK_LBRACE);
            return this._parseMultiselectHash();
          }
        },
        _parseProjectionRHS: function(rbp) {
          var right;
          if (bindingPower[this._lookahead(0)] < 10) {
            right = { type: "Identity" };
          } else if (this._lookahead(0) === TOK_LBRACKET) {
            right = this.expression(rbp);
          } else if (this._lookahead(0) === TOK_FILTER) {
            right = this.expression(rbp);
          } else if (this._lookahead(0) === TOK_DOT) {
            this._match(TOK_DOT);
            right = this._parseDotRHS(rbp);
          } else {
            var t = this._lookaheadToken(0);
            var error = new Error("Sytanx error, unexpected token: " + t.value + "(" + t.type + ")");
            error.name = "ParserError";
            throw error;
          }
          return right;
        },
        _parseMultiselectList: function() {
          var expressions = [];
          while (this._lookahead(0) !== TOK_RBRACKET) {
            var expression = this.expression(0);
            expressions.push(expression);
            if (this._lookahead(0) === TOK_COMMA) {
              this._match(TOK_COMMA);
              if (this._lookahead(0) === TOK_RBRACKET) {
                throw new Error("Unexpected token Rbracket");
              }
            }
          }
          this._match(TOK_RBRACKET);
          return { type: "MultiSelectList", children: expressions };
        },
        _parseMultiselectHash: function() {
          var pairs = [];
          var identifierTypes = [TOK_UNQUOTEDIDENTIFIER, TOK_QUOTEDIDENTIFIER];
          var keyToken, keyName, value, node;
          for (; ; ) {
            keyToken = this._lookaheadToken(0);
            if (identifierTypes.indexOf(keyToken.type) < 0) {
              throw new Error("Expecting an identifier token, got: " + keyToken.type);
            }
            keyName = keyToken.value;
            this._advance();
            this._match(TOK_COLON);
            value = this.expression(0);
            node = { type: "KeyValuePair", name: keyName, value };
            pairs.push(node);
            if (this._lookahead(0) === TOK_COMMA) {
              this._match(TOK_COMMA);
            } else if (this._lookahead(0) === TOK_RBRACE) {
              this._match(TOK_RBRACE);
              break;
            }
          }
          return { type: "MultiSelectHash", children: pairs };
        }
      };
      function TreeInterpreter(runtime) {
        this.runtime = runtime;
      }
      TreeInterpreter.prototype = {
        search: function(node, value) {
          return this.visit(node, value);
        },
        visit: function(node, value) {
          var matched, current, result, first, second, field, left, right, collected, i;
          switch (node.type) {
            case "Field":
              if (value !== null && isObject2(value)) {
                field = value[node.name];
                if (field === void 0) {
                  return null;
                } else {
                  return field;
                }
              }
              return null;
            case "Subexpression":
              result = this.visit(node.children[0], value);
              for (i = 1; i < node.children.length; i++) {
                result = this.visit(node.children[1], result);
                if (result === null) {
                  return null;
                }
              }
              return result;
            case "IndexExpression":
              left = this.visit(node.children[0], value);
              right = this.visit(node.children[1], left);
              return right;
            case "Index":
              if (!isArray(value)) {
                return null;
              }
              var index = node.value;
              if (index < 0) {
                index = value.length + index;
              }
              result = value[index];
              if (result === void 0) {
                result = null;
              }
              return result;
            case "Slice":
              if (!isArray(value)) {
                return null;
              }
              var sliceParams = node.children.slice(0);
              var computed = this.computeSliceParams(value.length, sliceParams);
              var start = computed[0];
              var stop = computed[1];
              var step = computed[2];
              result = [];
              if (step > 0) {
                for (i = start; i < stop; i += step) {
                  result.push(value[i]);
                }
              } else {
                for (i = start; i > stop; i += step) {
                  result.push(value[i]);
                }
              }
              return result;
            case "Projection":
              var base = this.visit(node.children[0], value);
              if (!isArray(base)) {
                return null;
              }
              collected = [];
              for (i = 0; i < base.length; i++) {
                current = this.visit(node.children[1], base[i]);
                if (current !== null) {
                  collected.push(current);
                }
              }
              return collected;
            case "ValueProjection":
              base = this.visit(node.children[0], value);
              if (!isObject2(base)) {
                return null;
              }
              collected = [];
              var values = objValues(base);
              for (i = 0; i < values.length; i++) {
                current = this.visit(node.children[1], values[i]);
                if (current !== null) {
                  collected.push(current);
                }
              }
              return collected;
            case "FilterProjection":
              base = this.visit(node.children[0], value);
              if (!isArray(base)) {
                return null;
              }
              var filtered = [];
              var finalResults = [];
              for (i = 0; i < base.length; i++) {
                matched = this.visit(node.children[2], base[i]);
                if (!isFalse(matched)) {
                  filtered.push(base[i]);
                }
              }
              for (var j = 0; j < filtered.length; j++) {
                current = this.visit(node.children[1], filtered[j]);
                if (current !== null) {
                  finalResults.push(current);
                }
              }
              return finalResults;
            case "Comparator":
              first = this.visit(node.children[0], value);
              second = this.visit(node.children[1], value);
              switch (node.name) {
                case TOK_EQ:
                  result = strictDeepEqual(first, second);
                  break;
                case TOK_NE:
                  result = !strictDeepEqual(first, second);
                  break;
                case TOK_GT:
                  result = first > second;
                  break;
                case TOK_GTE:
                  result = first >= second;
                  break;
                case TOK_LT:
                  result = first < second;
                  break;
                case TOK_LTE:
                  result = first <= second;
                  break;
                default:
                  throw new Error("Unknown comparator: " + node.name);
              }
              return result;
            case TOK_FLATTEN:
              var original = this.visit(node.children[0], value);
              if (!isArray(original)) {
                return null;
              }
              var merged = [];
              for (i = 0; i < original.length; i++) {
                current = original[i];
                if (isArray(current)) {
                  merged.push.apply(merged, current);
                } else {
                  merged.push(current);
                }
              }
              return merged;
            case "Identity":
              return value;
            case "MultiSelectList":
              if (value === null) {
                return null;
              }
              collected = [];
              for (i = 0; i < node.children.length; i++) {
                collected.push(this.visit(node.children[i], value));
              }
              return collected;
            case "MultiSelectHash":
              if (value === null) {
                return null;
              }
              collected = {};
              var child;
              for (i = 0; i < node.children.length; i++) {
                child = node.children[i];
                collected[child.name] = this.visit(child.value, value);
              }
              return collected;
            case "OrExpression":
              matched = this.visit(node.children[0], value);
              if (isFalse(matched)) {
                matched = this.visit(node.children[1], value);
              }
              return matched;
            case "AndExpression":
              first = this.visit(node.children[0], value);
              if (isFalse(first) === true) {
                return first;
              }
              return this.visit(node.children[1], value);
            case "NotExpression":
              first = this.visit(node.children[0], value);
              return isFalse(first);
            case "Literal":
              return node.value;
            case TOK_PIPE:
              left = this.visit(node.children[0], value);
              return this.visit(node.children[1], left);
            case TOK_CURRENT:
              return value;
            case "Function":
              var resolvedArgs = [];
              for (i = 0; i < node.children.length; i++) {
                resolvedArgs.push(this.visit(node.children[i], value));
              }
              return this.runtime.callFunction(node.name, resolvedArgs);
            case "ExpressionReference":
              var refNode = node.children[0];
              refNode.jmespathType = TOK_EXPREF;
              return refNode;
            default:
              throw new Error("Unknown node type: " + node.type);
          }
        },
        computeSliceParams: function(arrayLength, sliceParams) {
          var start = sliceParams[0];
          var stop = sliceParams[1];
          var step = sliceParams[2];
          var computed = [null, null, null];
          if (step === null) {
            step = 1;
          } else if (step === 0) {
            var error = new Error("Invalid slice, step cannot be 0");
            error.name = "RuntimeError";
            throw error;
          }
          var stepValueNegative = step < 0 ? true : false;
          if (start === null) {
            start = stepValueNegative ? arrayLength - 1 : 0;
          } else {
            start = this.capSliceRange(arrayLength, start, step);
          }
          if (stop === null) {
            stop = stepValueNegative ? -1 : arrayLength;
          } else {
            stop = this.capSliceRange(arrayLength, stop, step);
          }
          computed[0] = start;
          computed[1] = stop;
          computed[2] = step;
          return computed;
        },
        capSliceRange: function(arrayLength, actualValue, step) {
          if (actualValue < 0) {
            actualValue += arrayLength;
            if (actualValue < 0) {
              actualValue = step < 0 ? -1 : 0;
            }
          } else if (actualValue >= arrayLength) {
            actualValue = step < 0 ? arrayLength - 1 : arrayLength;
          }
          return actualValue;
        }
      };
      function Runtime(interpreter) {
        this._interpreter = interpreter;
        this.functionTable = {
          // name: [function, <signature>]
          // The <signature> can be:
          //
          // {
          //   args: [[type1, type2], [type1, type2]],
          //   variadic: true|false
          // }
          //
          // Each arg in the arg list is a list of valid types
          // (if the function is overloaded and supports multiple
          // types.  If the type is "any" then no type checking
          // occurs on the argument.  Variadic is optional
          // and if not provided is assumed to be false.
          abs: { _func: this._functionAbs, _signature: [{ types: [TYPE_NUMBER] }] },
          avg: { _func: this._functionAvg, _signature: [{ types: [TYPE_ARRAY_NUMBER] }] },
          ceil: { _func: this._functionCeil, _signature: [{ types: [TYPE_NUMBER] }] },
          contains: {
            _func: this._functionContains,
            _signature: [
              { types: [TYPE_STRING, TYPE_ARRAY] },
              { types: [TYPE_ANY] }
            ]
          },
          "ends_with": {
            _func: this._functionEndsWith,
            _signature: [{ types: [TYPE_STRING] }, { types: [TYPE_STRING] }]
          },
          floor: { _func: this._functionFloor, _signature: [{ types: [TYPE_NUMBER] }] },
          length: {
            _func: this._functionLength,
            _signature: [{ types: [TYPE_STRING, TYPE_ARRAY, TYPE_OBJECT] }]
          },
          map: {
            _func: this._functionMap,
            _signature: [{ types: [TYPE_EXPREF] }, { types: [TYPE_ARRAY] }]
          },
          max: {
            _func: this._functionMax,
            _signature: [{ types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING] }]
          },
          "merge": {
            _func: this._functionMerge,
            _signature: [{ types: [TYPE_OBJECT], variadic: true }]
          },
          "max_by": {
            _func: this._functionMaxBy,
            _signature: [{ types: [TYPE_ARRAY] }, { types: [TYPE_EXPREF] }]
          },
          sum: { _func: this._functionSum, _signature: [{ types: [TYPE_ARRAY_NUMBER] }] },
          "starts_with": {
            _func: this._functionStartsWith,
            _signature: [{ types: [TYPE_STRING] }, { types: [TYPE_STRING] }]
          },
          min: {
            _func: this._functionMin,
            _signature: [{ types: [TYPE_ARRAY_NUMBER, TYPE_ARRAY_STRING] }]
          },
          "min_by": {
            _func: this._functionMinBy,
            _signature: [{ types: [TYPE_ARRAY] }, { types: [TYPE_EXPREF] }]
          },
          type: { _func: this._functionType, _signature: [{ types: [TYPE_ANY] }] },
          keys: { _func: this._functionKeys, _signature: [{ types: [TYPE_OBJECT] }] },
          values: { _func: this._functionValues, _signature: [{ types: [TYPE_OBJECT] }] },
          sort: { _func: this._functionSort, _signature: [{ types: [TYPE_ARRAY_STRING, TYPE_ARRAY_NUMBER] }] },
          "sort_by": {
            _func: this._functionSortBy,
            _signature: [{ types: [TYPE_ARRAY] }, { types: [TYPE_EXPREF] }]
          },
          join: {
            _func: this._functionJoin,
            _signature: [
              { types: [TYPE_STRING] },
              { types: [TYPE_ARRAY_STRING] }
            ]
          },
          reverse: {
            _func: this._functionReverse,
            _signature: [{ types: [TYPE_STRING, TYPE_ARRAY] }]
          },
          "to_array": { _func: this._functionToArray, _signature: [{ types: [TYPE_ANY] }] },
          "to_string": { _func: this._functionToString, _signature: [{ types: [TYPE_ANY] }] },
          "to_number": { _func: this._functionToNumber, _signature: [{ types: [TYPE_ANY] }] },
          "not_null": {
            _func: this._functionNotNull,
            _signature: [{ types: [TYPE_ANY], variadic: true }]
          }
        };
      }
      Runtime.prototype = {
        callFunction: function(name, resolvedArgs) {
          var functionEntry = this.functionTable[name];
          if (functionEntry === void 0) {
            throw new Error("Unknown function: " + name + "()");
          }
          this._validateArgs(name, resolvedArgs, functionEntry._signature);
          return functionEntry._func.call(this, resolvedArgs);
        },
        _validateArgs: function(name, args, signature) {
          var pluralized;
          if (signature[signature.length - 1].variadic) {
            if (args.length < signature.length) {
              pluralized = signature.length === 1 ? " argument" : " arguments";
              throw new Error("ArgumentError: " + name + "() takes at least" + signature.length + pluralized + " but received " + args.length);
            }
          } else if (args.length !== signature.length) {
            pluralized = signature.length === 1 ? " argument" : " arguments";
            throw new Error("ArgumentError: " + name + "() takes " + signature.length + pluralized + " but received " + args.length);
          }
          var currentSpec;
          var actualType;
          var typeMatched;
          for (var i = 0; i < signature.length; i++) {
            typeMatched = false;
            currentSpec = signature[i].types;
            actualType = this._getTypeName(args[i]);
            for (var j = 0; j < currentSpec.length; j++) {
              if (this._typeMatches(actualType, currentSpec[j], args[i])) {
                typeMatched = true;
                break;
              }
            }
            if (!typeMatched) {
              var expected = currentSpec.map(function(typeIdentifier) {
                return TYPE_NAME_TABLE[typeIdentifier];
              }).join(",");
              throw new Error("TypeError: " + name + "() expected argument " + (i + 1) + " to be type " + expected + " but received type " + TYPE_NAME_TABLE[actualType] + " instead.");
            }
          }
        },
        _typeMatches: function(actual, expected, argValue) {
          if (expected === TYPE_ANY) {
            return true;
          }
          if (expected === TYPE_ARRAY_STRING || expected === TYPE_ARRAY_NUMBER || expected === TYPE_ARRAY) {
            if (expected === TYPE_ARRAY) {
              return actual === TYPE_ARRAY;
            } else if (actual === TYPE_ARRAY) {
              var subtype;
              if (expected === TYPE_ARRAY_NUMBER) {
                subtype = TYPE_NUMBER;
              } else if (expected === TYPE_ARRAY_STRING) {
                subtype = TYPE_STRING;
              }
              for (var i = 0; i < argValue.length; i++) {
                if (!this._typeMatches(
                  this._getTypeName(argValue[i]),
                  subtype,
                  argValue[i]
                )) {
                  return false;
                }
              }
              return true;
            }
          } else {
            return actual === expected;
          }
        },
        _getTypeName: function(obj) {
          switch (Object.prototype.toString.call(obj)) {
            case "[object String]":
              return TYPE_STRING;
            case "[object Number]":
              return TYPE_NUMBER;
            case "[object Array]":
              return TYPE_ARRAY;
            case "[object Boolean]":
              return TYPE_BOOLEAN;
            case "[object Null]":
              return TYPE_NULL;
            case "[object Object]":
              if (obj.jmespathType === TOK_EXPREF) {
                return TYPE_EXPREF;
              } else {
                return TYPE_OBJECT;
              }
          }
        },
        _functionStartsWith: function(resolvedArgs) {
          return resolvedArgs[0].lastIndexOf(resolvedArgs[1]) === 0;
        },
        _functionEndsWith: function(resolvedArgs) {
          var searchStr = resolvedArgs[0];
          var suffix = resolvedArgs[1];
          return searchStr.indexOf(suffix, searchStr.length - suffix.length) !== -1;
        },
        _functionReverse: function(resolvedArgs) {
          var typeName = this._getTypeName(resolvedArgs[0]);
          if (typeName === TYPE_STRING) {
            var originalStr = resolvedArgs[0];
            var reversedStr = "";
            for (var i = originalStr.length - 1; i >= 0; i--) {
              reversedStr += originalStr[i];
            }
            return reversedStr;
          } else {
            var reversedArray = resolvedArgs[0].slice(0);
            reversedArray.reverse();
            return reversedArray;
          }
        },
        _functionAbs: function(resolvedArgs) {
          return Math.abs(resolvedArgs[0]);
        },
        _functionCeil: function(resolvedArgs) {
          return Math.ceil(resolvedArgs[0]);
        },
        _functionAvg: function(resolvedArgs) {
          var sum = 0;
          var inputArray = resolvedArgs[0];
          for (var i = 0; i < inputArray.length; i++) {
            sum += inputArray[i];
          }
          return sum / inputArray.length;
        },
        _functionContains: function(resolvedArgs) {
          return resolvedArgs[0].indexOf(resolvedArgs[1]) >= 0;
        },
        _functionFloor: function(resolvedArgs) {
          return Math.floor(resolvedArgs[0]);
        },
        _functionLength: function(resolvedArgs) {
          if (!isObject2(resolvedArgs[0])) {
            return resolvedArgs[0].length;
          } else {
            return Object.keys(resolvedArgs[0]).length;
          }
        },
        _functionMap: function(resolvedArgs) {
          var mapped = [];
          var interpreter = this._interpreter;
          var exprefNode = resolvedArgs[0];
          var elements = resolvedArgs[1];
          for (var i = 0; i < elements.length; i++) {
            mapped.push(interpreter.visit(exprefNode, elements[i]));
          }
          return mapped;
        },
        _functionMerge: function(resolvedArgs) {
          var merged = {};
          for (var i = 0; i < resolvedArgs.length; i++) {
            var current = resolvedArgs[i];
            for (var key in current) {
              merged[key] = current[key];
            }
          }
          return merged;
        },
        _functionMax: function(resolvedArgs) {
          if (resolvedArgs[0].length > 0) {
            var typeName = this._getTypeName(resolvedArgs[0][0]);
            if (typeName === TYPE_NUMBER) {
              return Math.max.apply(Math, resolvedArgs[0]);
            } else {
              var elements = resolvedArgs[0];
              var maxElement = elements[0];
              for (var i = 1; i < elements.length; i++) {
                if (maxElement.localeCompare(elements[i]) < 0) {
                  maxElement = elements[i];
                }
              }
              return maxElement;
            }
          } else {
            return null;
          }
        },
        _functionMin: function(resolvedArgs) {
          if (resolvedArgs[0].length > 0) {
            var typeName = this._getTypeName(resolvedArgs[0][0]);
            if (typeName === TYPE_NUMBER) {
              return Math.min.apply(Math, resolvedArgs[0]);
            } else {
              var elements = resolvedArgs[0];
              var minElement = elements[0];
              for (var i = 1; i < elements.length; i++) {
                if (elements[i].localeCompare(minElement) < 0) {
                  minElement = elements[i];
                }
              }
              return minElement;
            }
          } else {
            return null;
          }
        },
        _functionSum: function(resolvedArgs) {
          var sum = 0;
          var listToSum = resolvedArgs[0];
          for (var i = 0; i < listToSum.length; i++) {
            sum += listToSum[i];
          }
          return sum;
        },
        _functionType: function(resolvedArgs) {
          switch (this._getTypeName(resolvedArgs[0])) {
            case TYPE_NUMBER:
              return "number";
            case TYPE_STRING:
              return "string";
            case TYPE_ARRAY:
              return "array";
            case TYPE_OBJECT:
              return "object";
            case TYPE_BOOLEAN:
              return "boolean";
            case TYPE_EXPREF:
              return "expref";
            case TYPE_NULL:
              return "null";
          }
        },
        _functionKeys: function(resolvedArgs) {
          return Object.keys(resolvedArgs[0]);
        },
        _functionValues: function(resolvedArgs) {
          var obj = resolvedArgs[0];
          var keys = Object.keys(obj);
          var values = [];
          for (var i = 0; i < keys.length; i++) {
            values.push(obj[keys[i]]);
          }
          return values;
        },
        _functionJoin: function(resolvedArgs) {
          var joinChar = resolvedArgs[0];
          var listJoin = resolvedArgs[1];
          return listJoin.join(joinChar);
        },
        _functionToArray: function(resolvedArgs) {
          if (this._getTypeName(resolvedArgs[0]) === TYPE_ARRAY) {
            return resolvedArgs[0];
          } else {
            return [resolvedArgs[0]];
          }
        },
        _functionToString: function(resolvedArgs) {
          if (this._getTypeName(resolvedArgs[0]) === TYPE_STRING) {
            return resolvedArgs[0];
          } else {
            return JSON.stringify(resolvedArgs[0]);
          }
        },
        _functionToNumber: function(resolvedArgs) {
          var typeName = this._getTypeName(resolvedArgs[0]);
          var convertedValue;
          if (typeName === TYPE_NUMBER) {
            return resolvedArgs[0];
          } else if (typeName === TYPE_STRING) {
            convertedValue = +resolvedArgs[0];
            if (!isNaN(convertedValue)) {
              return convertedValue;
            }
          }
          return null;
        },
        _functionNotNull: function(resolvedArgs) {
          for (var i = 0; i < resolvedArgs.length; i++) {
            if (this._getTypeName(resolvedArgs[i]) !== TYPE_NULL) {
              return resolvedArgs[i];
            }
          }
          return null;
        },
        _functionSort: function(resolvedArgs) {
          var sortedArray = resolvedArgs[0].slice(0);
          sortedArray.sort();
          return sortedArray;
        },
        _functionSortBy: function(resolvedArgs) {
          var sortedArray = resolvedArgs[0].slice(0);
          if (sortedArray.length === 0) {
            return sortedArray;
          }
          var interpreter = this._interpreter;
          var exprefNode = resolvedArgs[1];
          var requiredType = this._getTypeName(
            interpreter.visit(exprefNode, sortedArray[0])
          );
          if ([TYPE_NUMBER, TYPE_STRING].indexOf(requiredType) < 0) {
            throw new Error("TypeError");
          }
          var that = this;
          var decorated = [];
          for (var i = 0; i < sortedArray.length; i++) {
            decorated.push([i, sortedArray[i]]);
          }
          decorated.sort(function(a, b) {
            var exprA = interpreter.visit(exprefNode, a[1]);
            var exprB = interpreter.visit(exprefNode, b[1]);
            if (that._getTypeName(exprA) !== requiredType) {
              throw new Error(
                "TypeError: expected " + requiredType + ", received " + that._getTypeName(exprA)
              );
            } else if (that._getTypeName(exprB) !== requiredType) {
              throw new Error(
                "TypeError: expected " + requiredType + ", received " + that._getTypeName(exprB)
              );
            }
            if (exprA > exprB) {
              return 1;
            } else if (exprA < exprB) {
              return -1;
            } else {
              return a[0] - b[0];
            }
          });
          for (var j = 0; j < decorated.length; j++) {
            sortedArray[j] = decorated[j][1];
          }
          return sortedArray;
        },
        _functionMaxBy: function(resolvedArgs) {
          var exprefNode = resolvedArgs[1];
          var resolvedArray = resolvedArgs[0];
          var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
          var maxNumber = -Infinity;
          var maxRecord;
          var current;
          for (var i = 0; i < resolvedArray.length; i++) {
            current = keyFunction(resolvedArray[i]);
            if (current > maxNumber) {
              maxNumber = current;
              maxRecord = resolvedArray[i];
            }
          }
          return maxRecord;
        },
        _functionMinBy: function(resolvedArgs) {
          var exprefNode = resolvedArgs[1];
          var resolvedArray = resolvedArgs[0];
          var keyFunction = this.createKeyFunction(exprefNode, [TYPE_NUMBER, TYPE_STRING]);
          var minNumber = Infinity;
          var minRecord;
          var current;
          for (var i = 0; i < resolvedArray.length; i++) {
            current = keyFunction(resolvedArray[i]);
            if (current < minNumber) {
              minNumber = current;
              minRecord = resolvedArray[i];
            }
          }
          return minRecord;
        },
        createKeyFunction: function(exprefNode, allowedTypes) {
          var that = this;
          var interpreter = this._interpreter;
          var keyFunc = function(x) {
            var current = interpreter.visit(exprefNode, x);
            if (allowedTypes.indexOf(that._getTypeName(current)) < 0) {
              var msg = "TypeError: expected one of " + allowedTypes + ", received " + that._getTypeName(current);
              throw new Error(msg);
            }
            return current;
          };
          return keyFunc;
        }
      };
      function compile(stream) {
        var parser = new Parser();
        var ast = parser.parse(stream);
        return ast;
      }
      function tokenize(stream) {
        var lexer = new Lexer();
        return lexer.tokenize(stream);
      }
      function search(data, expression) {
        var parser = new Parser();
        var runtime = new Runtime();
        var interpreter = new TreeInterpreter(runtime);
        runtime._interpreter = interpreter;
        var node = parser.parse(expression);
        return interpreter.search(node, data);
      }
      exports2.tokenize = tokenize;
      exports2.compile = compile;
      exports2.search = search;
      exports2.strictDeepEqual = strictDeepEqual;
    })(typeof exports === "undefined" ? exports.jmespath = {} : exports);
  }
});

// shared/embed-access.ts
function hasEmbedAccess(entitlement, now) {
  if (!entitlement) return false;
  return entitlement.features.tier >= 1 && entitlement.features.embedAccess === true && entitlement.validUntil >= now;
}
var init_embed_access = __esm({
  "shared/embed-access.ts"() {
    "use strict";
  }
});

// node_modules/jose/dist/webapi/lib/buffer_utils.js
function concat(...buffers) {
  const size = buffers.reduce((acc, { length }) => acc + length, 0);
  const buf = new Uint8Array(size);
  let i = 0;
  for (const buffer of buffers) {
    buf.set(buffer, i);
    i += buffer.length;
  }
  return buf;
}
function encode(string) {
  const bytes = new Uint8Array(string.length);
  for (let i = 0; i < string.length; i++) {
    const code = string.charCodeAt(i);
    if (code > 127) {
      throw new TypeError("non-ASCII string encountered in encode()");
    }
    bytes[i] = code;
  }
  return bytes;
}
var encoder, decoder, MAX_INT32;
var init_buffer_utils = __esm({
  "node_modules/jose/dist/webapi/lib/buffer_utils.js"() {
    encoder = new TextEncoder();
    decoder = new TextDecoder();
    MAX_INT32 = 2 ** 32;
  }
});

// node_modules/jose/dist/webapi/lib/base64.js
function decodeBase64(encoded) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(encoded);
  }
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
var init_base64 = __esm({
  "node_modules/jose/dist/webapi/lib/base64.js"() {
  }
});

// node_modules/jose/dist/webapi/util/base64url.js
function decode2(input) {
  if (Uint8Array.fromBase64) {
    return Uint8Array.fromBase64(typeof input === "string" ? input : decoder.decode(input), {
      alphabet: "base64url"
    });
  }
  let encoded = input;
  if (encoded instanceof Uint8Array) {
    encoded = decoder.decode(encoded);
  }
  encoded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  try {
    return decodeBase64(encoded);
  } catch {
    throw new TypeError("The input to be decoded is not correctly encoded.");
  }
}
var init_base64url = __esm({
  "node_modules/jose/dist/webapi/util/base64url.js"() {
    init_buffer_utils();
    init_base64();
  }
});

// node_modules/jose/dist/webapi/lib/crypto_key.js
function getHashLength(hash) {
  return parseInt(hash.name.slice(4), 10);
}
function checkHashLength(algorithm, expected) {
  const actual = getHashLength(algorithm.hash);
  if (actual !== expected)
    throw unusable(`SHA-${expected}`, "algorithm.hash");
}
function getNamedCurve(alg) {
  switch (alg) {
    case "ES256":
      return "P-256";
    case "ES384":
      return "P-384";
    case "ES512":
      return "P-521";
    default:
      throw new Error("unreachable");
  }
}
function checkUsage(key, usage) {
  if (usage && !key.usages.includes(usage)) {
    throw new TypeError(`CryptoKey does not support this operation, its usages must include ${usage}.`);
  }
}
function checkSigCryptoKey(key, alg, usage) {
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512": {
      if (!isAlgorithm(key.algorithm, "HMAC"))
        throw unusable("HMAC");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "RS256":
    case "RS384":
    case "RS512": {
      if (!isAlgorithm(key.algorithm, "RSASSA-PKCS1-v1_5"))
        throw unusable("RSASSA-PKCS1-v1_5");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "PS256":
    case "PS384":
    case "PS512": {
      if (!isAlgorithm(key.algorithm, "RSA-PSS"))
        throw unusable("RSA-PSS");
      checkHashLength(key.algorithm, parseInt(alg.slice(2), 10));
      break;
    }
    case "Ed25519":
    case "EdDSA": {
      if (!isAlgorithm(key.algorithm, "Ed25519"))
        throw unusable("Ed25519");
      break;
    }
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87": {
      if (!isAlgorithm(key.algorithm, alg))
        throw unusable(alg);
      break;
    }
    case "ES256":
    case "ES384":
    case "ES512": {
      if (!isAlgorithm(key.algorithm, "ECDSA"))
        throw unusable("ECDSA");
      const expected = getNamedCurve(alg);
      const actual = key.algorithm.namedCurve;
      if (actual !== expected)
        throw unusable(expected, "algorithm.namedCurve");
      break;
    }
    default:
      throw new TypeError("CryptoKey does not support this operation");
  }
  checkUsage(key, usage);
}
var unusable, isAlgorithm;
var init_crypto_key = __esm({
  "node_modules/jose/dist/webapi/lib/crypto_key.js"() {
    unusable = (name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
    isAlgorithm = (algorithm, name) => algorithm.name === name;
  }
});

// node_modules/jose/dist/webapi/lib/invalid_key_input.js
function message(msg, actual, ...types) {
  types = types.filter(Boolean);
  if (types.length > 2) {
    const last = types.pop();
    msg += `one of type ${types.join(", ")}, or ${last}.`;
  } else if (types.length === 2) {
    msg += `one of type ${types[0]} or ${types[1]}.`;
  } else {
    msg += `of type ${types[0]}.`;
  }
  if (actual == null) {
    msg += ` Received ${actual}`;
  } else if (typeof actual === "function" && actual.name) {
    msg += ` Received function ${actual.name}`;
  } else if (typeof actual === "object" && actual != null) {
    if (actual.constructor?.name) {
      msg += ` Received an instance of ${actual.constructor.name}`;
    }
  }
  return msg;
}
var invalidKeyInput, withAlg;
var init_invalid_key_input = __esm({
  "node_modules/jose/dist/webapi/lib/invalid_key_input.js"() {
    invalidKeyInput = (actual, ...types) => message("Key must be ", actual, ...types);
    withAlg = (alg, actual, ...types) => message(`Key for the ${alg} algorithm must be `, actual, ...types);
  }
});

// node_modules/jose/dist/webapi/util/errors.js
var JOSEError, JWTClaimValidationFailed, JWTExpired, JOSEAlgNotAllowed, JOSENotSupported, JWSInvalid, JWTInvalid, JWKSInvalid, JWKSNoMatchingKey, JWKSMultipleMatchingKeys, JWKSTimeout, JWSSignatureVerificationFailed;
var init_errors = __esm({
  "node_modules/jose/dist/webapi/util/errors.js"() {
    JOSEError = class extends Error {
      static code = "ERR_JOSE_GENERIC";
      code = "ERR_JOSE_GENERIC";
      constructor(message2, options) {
        super(message2, options);
        this.name = this.constructor.name;
        Error.captureStackTrace?.(this, this.constructor);
      }
    };
    JWTClaimValidationFailed = class extends JOSEError {
      static code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
      code = "ERR_JWT_CLAIM_VALIDATION_FAILED";
      claim;
      reason;
      payload;
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JWTExpired = class extends JOSEError {
      static code = "ERR_JWT_EXPIRED";
      code = "ERR_JWT_EXPIRED";
      claim;
      reason;
      payload;
      constructor(message2, payload, claim = "unspecified", reason = "unspecified") {
        super(message2, { cause: { claim, reason, payload } });
        this.claim = claim;
        this.reason = reason;
        this.payload = payload;
      }
    };
    JOSEAlgNotAllowed = class extends JOSEError {
      static code = "ERR_JOSE_ALG_NOT_ALLOWED";
      code = "ERR_JOSE_ALG_NOT_ALLOWED";
    };
    JOSENotSupported = class extends JOSEError {
      static code = "ERR_JOSE_NOT_SUPPORTED";
      code = "ERR_JOSE_NOT_SUPPORTED";
    };
    JWSInvalid = class extends JOSEError {
      static code = "ERR_JWS_INVALID";
      code = "ERR_JWS_INVALID";
    };
    JWTInvalid = class extends JOSEError {
      static code = "ERR_JWT_INVALID";
      code = "ERR_JWT_INVALID";
    };
    JWKSInvalid = class extends JOSEError {
      static code = "ERR_JWKS_INVALID";
      code = "ERR_JWKS_INVALID";
    };
    JWKSNoMatchingKey = class extends JOSEError {
      static code = "ERR_JWKS_NO_MATCHING_KEY";
      code = "ERR_JWKS_NO_MATCHING_KEY";
      constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
        super(message2, options);
      }
    };
    JWKSMultipleMatchingKeys = class extends JOSEError {
      [Symbol.asyncIterator];
      static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
      code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
      constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
        super(message2, options);
      }
    };
    JWKSTimeout = class extends JOSEError {
      static code = "ERR_JWKS_TIMEOUT";
      code = "ERR_JWKS_TIMEOUT";
      constructor(message2 = "request timed out", options) {
        super(message2, options);
      }
    };
    JWSSignatureVerificationFailed = class extends JOSEError {
      static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
      code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
      constructor(message2 = "signature verification failed", options) {
        super(message2, options);
      }
    };
  }
});

// node_modules/jose/dist/webapi/lib/is_key_like.js
var isCryptoKey, isKeyObject, isKeyLike;
var init_is_key_like = __esm({
  "node_modules/jose/dist/webapi/lib/is_key_like.js"() {
    isCryptoKey = (key) => {
      if (key?.[Symbol.toStringTag] === "CryptoKey")
        return true;
      try {
        return key instanceof CryptoKey;
      } catch {
        return false;
      }
    };
    isKeyObject = (key) => key?.[Symbol.toStringTag] === "KeyObject";
    isKeyLike = (key) => isCryptoKey(key) || isKeyObject(key);
  }
});

// node_modules/jose/dist/webapi/lib/helpers.js
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode2(value);
  } catch {
    throw new ErrorClass(`Failed to base64url decode the ${label}`);
  }
}
var init_helpers = __esm({
  "node_modules/jose/dist/webapi/lib/helpers.js"() {
    init_base64url();
  }
});

// node_modules/jose/dist/webapi/lib/type_checks.js
function isObject(input) {
  if (!isObjectLike(input) || Object.prototype.toString.call(input) !== "[object Object]") {
    return false;
  }
  if (Object.getPrototypeOf(input) === null) {
    return true;
  }
  let proto = input;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(input) === proto;
}
function isDisjoint(...headers) {
  const sources = headers.filter(Boolean);
  if (sources.length === 0 || sources.length === 1) {
    return true;
  }
  let acc;
  for (const header of sources) {
    const parameters = Object.keys(header);
    if (!acc || acc.size === 0) {
      acc = new Set(parameters);
      continue;
    }
    for (const parameter of parameters) {
      if (acc.has(parameter)) {
        return false;
      }
      acc.add(parameter);
    }
  }
  return true;
}
var isObjectLike, isJWK, isPrivateJWK, isPublicJWK, isSecretJWK;
var init_type_checks = __esm({
  "node_modules/jose/dist/webapi/lib/type_checks.js"() {
    isObjectLike = (value) => typeof value === "object" && value !== null;
    isJWK = (key) => isObject(key) && typeof key.kty === "string";
    isPrivateJWK = (key) => key.kty !== "oct" && (key.kty === "AKP" && typeof key.priv === "string" || typeof key.d === "string");
    isPublicJWK = (key) => key.kty !== "oct" && key.d === void 0 && key.priv === void 0;
    isSecretJWK = (key) => key.kty === "oct" && typeof key.k === "string";
  }
});

// node_modules/jose/dist/webapi/lib/signing.js
function checkKeyLength(alg, key) {
  if (alg.startsWith("RS") || alg.startsWith("PS")) {
    const { modulusLength } = key.algorithm;
    if (typeof modulusLength !== "number" || modulusLength < 2048) {
      throw new TypeError(`${alg} requires key modulusLength to be 2048 bits or larger`);
    }
  }
}
function subtleAlgorithm(alg, algorithm) {
  const hash = `SHA-${alg.slice(-3)}`;
  switch (alg) {
    case "HS256":
    case "HS384":
    case "HS512":
      return { hash, name: "HMAC" };
    case "PS256":
    case "PS384":
    case "PS512":
      return { hash, name: "RSA-PSS", saltLength: parseInt(alg.slice(-3), 10) >> 3 };
    case "RS256":
    case "RS384":
    case "RS512":
      return { hash, name: "RSASSA-PKCS1-v1_5" };
    case "ES256":
    case "ES384":
    case "ES512":
      return { hash, name: "ECDSA", namedCurve: algorithm.namedCurve };
    case "Ed25519":
    case "EdDSA":
      return { name: "Ed25519" };
    case "ML-DSA-44":
    case "ML-DSA-65":
    case "ML-DSA-87":
      return { name: alg };
    default:
      throw new JOSENotSupported(`alg ${alg} is not supported either by JOSE or your javascript runtime`);
  }
}
async function getSigKey(alg, key, usage) {
  if (key instanceof Uint8Array) {
    if (!alg.startsWith("HS")) {
      throw new TypeError(invalidKeyInput(key, "CryptoKey", "KeyObject", "JSON Web Key"));
    }
    return crypto.subtle.importKey("raw", key, { hash: `SHA-${alg.slice(-3)}`, name: "HMAC" }, false, [usage]);
  }
  checkSigCryptoKey(key, alg, usage);
  return key;
}
async function verify(alg, key, signature, data) {
  const cryptoKey = await getSigKey(alg, key, "verify");
  checkKeyLength(alg, cryptoKey);
  const algorithm = subtleAlgorithm(alg, cryptoKey.algorithm);
  try {
    return await crypto.subtle.verify(algorithm, cryptoKey, signature, data);
  } catch {
    return false;
  }
}
var init_signing = __esm({
  "node_modules/jose/dist/webapi/lib/signing.js"() {
    init_errors();
    init_crypto_key();
    init_invalid_key_input();
  }
});

// node_modules/jose/dist/webapi/lib/jwk_to_key.js
function subtleMapping(jwk) {
  let algorithm;
  let keyUsages;
  switch (jwk.kty) {
    case "AKP": {
      switch (jwk.alg) {
        case "ML-DSA-44":
        case "ML-DSA-65":
        case "ML-DSA-87":
          algorithm = { name: jwk.alg };
          keyUsages = jwk.priv ? ["sign"] : ["verify"];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "RSA": {
      switch (jwk.alg) {
        case "PS256":
        case "PS384":
        case "PS512":
          algorithm = { name: "RSA-PSS", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RS256":
        case "RS384":
        case "RS512":
          algorithm = { name: "RSASSA-PKCS1-v1_5", hash: `SHA-${jwk.alg.slice(-3)}` };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "RSA-OAEP":
        case "RSA-OAEP-256":
        case "RSA-OAEP-384":
        case "RSA-OAEP-512":
          algorithm = {
            name: "RSA-OAEP",
            hash: `SHA-${parseInt(jwk.alg.slice(-3), 10) || 1}`
          };
          keyUsages = jwk.d ? ["decrypt", "unwrapKey"] : ["encrypt", "wrapKey"];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "EC": {
      switch (jwk.alg) {
        case "ES256":
        case "ES384":
        case "ES512":
          algorithm = {
            name: "ECDSA",
            namedCurve: { ES256: "P-256", ES384: "P-384", ES512: "P-521" }[jwk.alg]
          };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: "ECDH", namedCurve: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    case "OKP": {
      switch (jwk.alg) {
        case "Ed25519":
        case "EdDSA":
          algorithm = { name: "Ed25519" };
          keyUsages = jwk.d ? ["sign"] : ["verify"];
          break;
        case "ECDH-ES":
        case "ECDH-ES+A128KW":
        case "ECDH-ES+A192KW":
        case "ECDH-ES+A256KW":
          algorithm = { name: jwk.crv };
          keyUsages = jwk.d ? ["deriveBits"] : [];
          break;
        default:
          throw new JOSENotSupported(unsupportedAlg);
      }
      break;
    }
    default:
      throw new JOSENotSupported('Invalid or unsupported JWK "kty" (Key Type) Parameter value');
  }
  return { algorithm, keyUsages };
}
async function jwkToKey(jwk) {
  if (!jwk.alg) {
    throw new TypeError('"alg" argument is required when "jwk.alg" is not present');
  }
  const { algorithm, keyUsages } = subtleMapping(jwk);
  const keyData = { ...jwk };
  if (keyData.kty !== "AKP") {
    delete keyData.alg;
  }
  delete keyData.use;
  return crypto.subtle.importKey("jwk", keyData, algorithm, jwk.ext ?? (jwk.d || jwk.priv ? false : true), jwk.key_ops ?? keyUsages);
}
var unsupportedAlg;
var init_jwk_to_key = __esm({
  "node_modules/jose/dist/webapi/lib/jwk_to_key.js"() {
    init_errors();
    unsupportedAlg = 'Invalid or unsupported JWK "alg" (Algorithm) Parameter value';
  }
});

// node_modules/jose/dist/webapi/lib/normalize_key.js
async function normalizeKey(key, alg) {
  if (key instanceof Uint8Array) {
    return key;
  }
  if (isCryptoKey(key)) {
    return key;
  }
  if (isKeyObject(key)) {
    if (key.type === "secret") {
      return key.export();
    }
    if ("toCryptoKey" in key && typeof key.toCryptoKey === "function") {
      try {
        return handleKeyObject(key, alg);
      } catch (err) {
        if (err instanceof TypeError) {
          throw err;
        }
      }
    }
    let jwk = key.export({ format: "jwk" });
    return handleJWK(key, jwk, alg);
  }
  if (isJWK(key)) {
    if (key.k) {
      return decode2(key.k);
    }
    return handleJWK(key, key, alg, true);
  }
  throw new Error("unreachable");
}
var unusableForAlg, cache, handleJWK, handleKeyObject;
var init_normalize_key = __esm({
  "node_modules/jose/dist/webapi/lib/normalize_key.js"() {
    init_type_checks();
    init_base64url();
    init_jwk_to_key();
    init_is_key_like();
    unusableForAlg = "given KeyObject instance cannot be used for this algorithm";
    handleJWK = async (key, jwk, alg, freeze = false) => {
      cache ||= /* @__PURE__ */ new WeakMap();
      let cached = cache.get(key);
      if (cached?.[alg]) {
        return cached[alg];
      }
      const cryptoKey = await jwkToKey({ ...jwk, alg });
      if (freeze)
        Object.freeze(key);
      if (!cached) {
        cache.set(key, { [alg]: cryptoKey });
      } else {
        cached[alg] = cryptoKey;
      }
      return cryptoKey;
    };
    handleKeyObject = (keyObject, alg) => {
      cache ||= /* @__PURE__ */ new WeakMap();
      let cached = cache.get(keyObject);
      if (cached?.[alg]) {
        return cached[alg];
      }
      const isPublic = keyObject.type === "public";
      const extractable = isPublic ? true : false;
      let cryptoKey;
      if (keyObject.asymmetricKeyType === "x25519") {
        switch (alg) {
          case "ECDH-ES":
          case "ECDH-ES+A128KW":
          case "ECDH-ES+A192KW":
          case "ECDH-ES+A256KW":
            break;
          default:
            throw new TypeError(unusableForAlg);
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, isPublic ? [] : ["deriveBits"]);
      }
      if (keyObject.asymmetricKeyType === "ed25519") {
        if (alg !== "EdDSA" && alg !== "Ed25519") {
          throw new TypeError(unusableForAlg);
        }
        cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
          isPublic ? "verify" : "sign"
        ]);
      }
      switch (keyObject.asymmetricKeyType) {
        case "ml-dsa-44":
        case "ml-dsa-65":
        case "ml-dsa-87": {
          if (alg !== keyObject.asymmetricKeyType.toUpperCase()) {
            throw new TypeError(unusableForAlg);
          }
          cryptoKey = keyObject.toCryptoKey(keyObject.asymmetricKeyType, extractable, [
            isPublic ? "verify" : "sign"
          ]);
        }
      }
      if (keyObject.asymmetricKeyType === "rsa") {
        let hash;
        switch (alg) {
          case "RSA-OAEP":
            hash = "SHA-1";
            break;
          case "RS256":
          case "PS256":
          case "RSA-OAEP-256":
            hash = "SHA-256";
            break;
          case "RS384":
          case "PS384":
          case "RSA-OAEP-384":
            hash = "SHA-384";
            break;
          case "RS512":
          case "PS512":
          case "RSA-OAEP-512":
            hash = "SHA-512";
            break;
          default:
            throw new TypeError(unusableForAlg);
        }
        if (alg.startsWith("RSA-OAEP")) {
          return keyObject.toCryptoKey({
            name: "RSA-OAEP",
            hash
          }, extractable, isPublic ? ["encrypt"] : ["decrypt"]);
        }
        cryptoKey = keyObject.toCryptoKey({
          name: alg.startsWith("PS") ? "RSA-PSS" : "RSASSA-PKCS1-v1_5",
          hash
        }, extractable, [isPublic ? "verify" : "sign"]);
      }
      if (keyObject.asymmetricKeyType === "ec") {
        const nist = /* @__PURE__ */ new Map([
          ["prime256v1", "P-256"],
          ["secp384r1", "P-384"],
          ["secp521r1", "P-521"]
        ]);
        const namedCurve = nist.get(keyObject.asymmetricKeyDetails?.namedCurve);
        if (!namedCurve) {
          throw new TypeError(unusableForAlg);
        }
        const expectedCurve = { ES256: "P-256", ES384: "P-384", ES512: "P-521" };
        if (expectedCurve[alg] && namedCurve === expectedCurve[alg]) {
          cryptoKey = keyObject.toCryptoKey({
            name: "ECDSA",
            namedCurve
          }, extractable, [isPublic ? "verify" : "sign"]);
        }
        if (alg.startsWith("ECDH-ES")) {
          cryptoKey = keyObject.toCryptoKey({
            name: "ECDH",
            namedCurve
          }, extractable, isPublic ? [] : ["deriveBits"]);
        }
      }
      if (!cryptoKey) {
        throw new TypeError(unusableForAlg);
      }
      if (!cached) {
        cache.set(keyObject, { [alg]: cryptoKey });
      } else {
        cached[alg] = cryptoKey;
      }
      return cryptoKey;
    };
  }
});

// node_modules/jose/dist/webapi/key/import.js
async function importJWK(jwk, alg, options) {
  if (!isObject(jwk)) {
    throw new TypeError("JWK must be an object");
  }
  let ext;
  alg ??= jwk.alg;
  ext ??= options?.extractable ?? jwk.ext;
  switch (jwk.kty) {
    case "oct":
      if (typeof jwk.k !== "string" || !jwk.k) {
        throw new TypeError('missing "k" (Key Value) Parameter value');
      }
      return decode2(jwk.k);
    case "RSA":
      if ("oth" in jwk && jwk.oth !== void 0) {
        throw new JOSENotSupported('RSA JWK "oth" (Other Primes Info) Parameter value is not supported');
      }
      return jwkToKey({ ...jwk, alg, ext });
    case "AKP": {
      if (typeof jwk.alg !== "string" || !jwk.alg) {
        throw new TypeError('missing "alg" (Algorithm) Parameter value');
      }
      if (alg !== void 0 && alg !== jwk.alg) {
        throw new TypeError("JWK alg and alg option value mismatch");
      }
      return jwkToKey({ ...jwk, ext });
    }
    case "EC":
    case "OKP":
      return jwkToKey({ ...jwk, alg, ext });
    default:
      throw new JOSENotSupported('Unsupported "kty" (Key Type) Parameter value');
  }
}
var init_import = __esm({
  "node_modules/jose/dist/webapi/key/import.js"() {
    init_base64url();
    init_jwk_to_key();
    init_errors();
    init_type_checks();
  }
});

// node_modules/jose/dist/webapi/lib/validate_crit.js
function validateCrit(Err, recognizedDefault, recognizedOption, protectedHeader, joseHeader) {
  if (joseHeader.crit !== void 0 && protectedHeader?.crit === void 0) {
    throw new Err('"crit" (Critical) Header Parameter MUST be integrity protected');
  }
  if (!protectedHeader || protectedHeader.crit === void 0) {
    return /* @__PURE__ */ new Set();
  }
  if (!Array.isArray(protectedHeader.crit) || protectedHeader.crit.length === 0 || protectedHeader.crit.some((input) => typeof input !== "string" || input.length === 0)) {
    throw new Err('"crit" (Critical) Header Parameter MUST be an array of non-empty strings when present');
  }
  let recognized;
  if (recognizedOption !== void 0) {
    recognized = new Map([...Object.entries(recognizedOption), ...recognizedDefault.entries()]);
  } else {
    recognized = recognizedDefault;
  }
  for (const parameter of protectedHeader.crit) {
    if (!recognized.has(parameter)) {
      throw new JOSENotSupported(`Extension Header Parameter "${parameter}" is not recognized`);
    }
    if (joseHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" is missing`);
    }
    if (recognized.get(parameter) && protectedHeader[parameter] === void 0) {
      throw new Err(`Extension Header Parameter "${parameter}" MUST be integrity protected`);
    }
  }
  return new Set(protectedHeader.crit);
}
var init_validate_crit = __esm({
  "node_modules/jose/dist/webapi/lib/validate_crit.js"() {
    init_errors();
  }
});

// node_modules/jose/dist/webapi/lib/validate_algorithms.js
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s2) => typeof s2 !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}
var init_validate_algorithms = __esm({
  "node_modules/jose/dist/webapi/lib/validate_algorithms.js"() {
  }
});

// node_modules/jose/dist/webapi/lib/check_key_type.js
function checkKeyType(alg, key, usage) {
  switch (alg.substring(0, 2)) {
    case "A1":
    case "A2":
    case "di":
    case "HS":
    case "PB":
      symmetricTypeCheck(alg, key, usage);
      break;
    default:
      asymmetricTypeCheck(alg, key, usage);
  }
}
var tag, jwkMatchesOp, symmetricTypeCheck, asymmetricTypeCheck;
var init_check_key_type = __esm({
  "node_modules/jose/dist/webapi/lib/check_key_type.js"() {
    init_invalid_key_input();
    init_is_key_like();
    init_type_checks();
    tag = (key) => key?.[Symbol.toStringTag];
    jwkMatchesOp = (alg, key, usage) => {
      if (key.use !== void 0) {
        let expected;
        switch (usage) {
          case "sign":
          case "verify":
            expected = "sig";
            break;
          case "encrypt":
          case "decrypt":
            expected = "enc";
            break;
        }
        if (key.use !== expected) {
          throw new TypeError(`Invalid key for this operation, its "use" must be "${expected}" when present`);
        }
      }
      if (key.alg !== void 0 && key.alg !== alg) {
        throw new TypeError(`Invalid key for this operation, its "alg" must be "${alg}" when present`);
      }
      if (Array.isArray(key.key_ops)) {
        let expectedKeyOp;
        switch (true) {
          case (usage === "sign" || usage === "verify"):
          case alg === "dir":
          case alg.includes("CBC-HS"):
            expectedKeyOp = usage;
            break;
          case alg.startsWith("PBES2"):
            expectedKeyOp = "deriveBits";
            break;
          case /^A\d{3}(?:GCM)?(?:KW)?$/.test(alg):
            if (!alg.includes("GCM") && alg.endsWith("KW")) {
              expectedKeyOp = usage === "encrypt" ? "wrapKey" : "unwrapKey";
            } else {
              expectedKeyOp = usage;
            }
            break;
          case (usage === "encrypt" && alg.startsWith("RSA")):
            expectedKeyOp = "wrapKey";
            break;
          case usage === "decrypt":
            expectedKeyOp = alg.startsWith("RSA") ? "unwrapKey" : "deriveBits";
            break;
        }
        if (expectedKeyOp && key.key_ops?.includes?.(expectedKeyOp) === false) {
          throw new TypeError(`Invalid key for this operation, its "key_ops" must include "${expectedKeyOp}" when present`);
        }
      }
      return true;
    };
    symmetricTypeCheck = (alg, key, usage) => {
      if (key instanceof Uint8Array)
        return;
      if (isJWK(key)) {
        if (isSecretJWK(key) && jwkMatchesOp(alg, key, usage))
          return;
        throw new TypeError(`JSON Web Key for symmetric algorithms must have JWK "kty" (Key Type) equal to "oct" and the JWK "k" (Key Value) present`);
      }
      if (!isKeyLike(key)) {
        throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key", "Uint8Array"));
      }
      if (key.type !== "secret") {
        throw new TypeError(`${tag(key)} instances for symmetric algorithms must be of type "secret"`);
      }
    };
    asymmetricTypeCheck = (alg, key, usage) => {
      if (isJWK(key)) {
        switch (usage) {
          case "decrypt":
          case "sign":
            if (isPrivateJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation must be a private JWK`);
          case "encrypt":
          case "verify":
            if (isPublicJWK(key) && jwkMatchesOp(alg, key, usage))
              return;
            throw new TypeError(`JSON Web Key for this operation must be a public JWK`);
        }
      }
      if (!isKeyLike(key)) {
        throw new TypeError(withAlg(alg, key, "CryptoKey", "KeyObject", "JSON Web Key"));
      }
      if (key.type === "secret") {
        throw new TypeError(`${tag(key)} instances for asymmetric algorithms must not be of type "secret"`);
      }
      if (key.type === "public") {
        switch (usage) {
          case "sign":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm signing must be of type "private"`);
          case "decrypt":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm decryption must be of type "private"`);
        }
      }
      if (key.type === "private") {
        switch (usage) {
          case "verify":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm verifying must be of type "public"`);
          case "encrypt":
            throw new TypeError(`${tag(key)} instances for asymmetric algorithm encryption must be of type "public"`);
        }
      }
    };
  }
});

// node_modules/jose/dist/webapi/jws/flattened/verify.js
async function flattenedVerify(jws, key, options) {
  if (!isObject(jws)) {
    throw new JWSInvalid("Flattened JWS must be an object");
  }
  if (jws.protected === void 0 && jws.header === void 0) {
    throw new JWSInvalid('Flattened JWS must have either of the "protected" or "header" members');
  }
  if (jws.protected !== void 0 && typeof jws.protected !== "string") {
    throw new JWSInvalid("JWS Protected Header incorrect type");
  }
  if (jws.payload === void 0) {
    throw new JWSInvalid("JWS Payload missing");
  }
  if (typeof jws.signature !== "string") {
    throw new JWSInvalid("JWS Signature missing or incorrect type");
  }
  if (jws.header !== void 0 && !isObject(jws.header)) {
    throw new JWSInvalid("JWS Unprotected Header incorrect type");
  }
  let parsedProt = {};
  if (jws.protected) {
    try {
      const protectedHeader = decode2(jws.protected);
      parsedProt = JSON.parse(decoder.decode(protectedHeader));
    } catch {
      throw new JWSInvalid("JWS Protected Header is invalid");
    }
  }
  if (!isDisjoint(parsedProt, jws.header)) {
    throw new JWSInvalid("JWS Protected and JWS Unprotected Header Parameter names must be disjoint");
  }
  const joseHeader = {
    ...parsedProt,
    ...jws.header
  };
  const extensions = validateCrit(JWSInvalid, /* @__PURE__ */ new Map([["b64", true]]), options?.crit, parsedProt, joseHeader);
  let b64 = true;
  if (extensions.has("b64")) {
    b64 = parsedProt.b64;
    if (typeof b64 !== "boolean") {
      throw new JWSInvalid('The "b64" (base64url-encode payload) Header Parameter must be a boolean');
    }
  }
  const { alg } = joseHeader;
  if (typeof alg !== "string" || !alg) {
    throw new JWSInvalid('JWS "alg" (Algorithm) Header Parameter missing or invalid');
  }
  const algorithms = options && validateAlgorithms("algorithms", options.algorithms);
  if (algorithms && !algorithms.has(alg)) {
    throw new JOSEAlgNotAllowed('"alg" (Algorithm) Header Parameter value not allowed');
  }
  if (b64) {
    if (typeof jws.payload !== "string") {
      throw new JWSInvalid("JWS Payload must be a string");
    }
  } else if (typeof jws.payload !== "string" && !(jws.payload instanceof Uint8Array)) {
    throw new JWSInvalid("JWS Payload must be a string or an Uint8Array instance");
  }
  let resolvedKey = false;
  if (typeof key === "function") {
    key = await key(parsedProt, jws);
    resolvedKey = true;
  }
  checkKeyType(alg, key, "verify");
  const data = concat(jws.protected !== void 0 ? encode(jws.protected) : new Uint8Array(), encode("."), typeof jws.payload === "string" ? b64 ? encode(jws.payload) : encoder.encode(jws.payload) : jws.payload);
  const signature = decodeBase64url(jws.signature, "signature", JWSInvalid);
  const k = await normalizeKey(key, alg);
  const verified = await verify(alg, k, signature, data);
  if (!verified) {
    throw new JWSSignatureVerificationFailed();
  }
  let payload;
  if (b64) {
    payload = decodeBase64url(jws.payload, "payload", JWSInvalid);
  } else if (typeof jws.payload === "string") {
    payload = encoder.encode(jws.payload);
  } else {
    payload = jws.payload;
  }
  const result = { payload };
  if (jws.protected !== void 0) {
    result.protectedHeader = parsedProt;
  }
  if (jws.header !== void 0) {
    result.unprotectedHeader = jws.header;
  }
  if (resolvedKey) {
    return { ...result, key: k };
  }
  return result;
}
var init_verify = __esm({
  "node_modules/jose/dist/webapi/jws/flattened/verify.js"() {
    init_base64url();
    init_signing();
    init_errors();
    init_buffer_utils();
    init_helpers();
    init_type_checks();
    init_type_checks();
    init_check_key_type();
    init_validate_crit();
    init_validate_algorithms();
    init_normalize_key();
  }
});

// node_modules/jose/dist/webapi/jws/compact/verify.js
async function compactVerify(jws, key, options) {
  if (jws instanceof Uint8Array) {
    jws = decoder.decode(jws);
  }
  if (typeof jws !== "string") {
    throw new JWSInvalid("Compact JWS must be a string or Uint8Array");
  }
  const { 0: protectedHeader, 1: payload, 2: signature, length } = jws.split(".");
  if (length !== 3) {
    throw new JWSInvalid("Invalid Compact JWS");
  }
  const verified = await flattenedVerify({ payload, protected: protectedHeader, signature }, key, options);
  const result = { payload: verified.payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
var init_verify2 = __esm({
  "node_modules/jose/dist/webapi/jws/compact/verify.js"() {
    init_verify();
    init_errors();
    init_buffer_utils();
  }
});

// node_modules/jose/dist/webapi/lib/jwt_claims_set.js
function secs(str) {
  const matched = REGEX.exec(str);
  if (!matched || matched[4] && matched[1]) {
    throw new TypeError("Invalid time period format");
  }
  const value = parseFloat(matched[2]);
  const unit = matched[3].toLowerCase();
  let numericDate;
  switch (unit) {
    case "sec":
    case "secs":
    case "second":
    case "seconds":
    case "s":
      numericDate = Math.round(value);
      break;
    case "minute":
    case "minutes":
    case "min":
    case "mins":
    case "m":
      numericDate = Math.round(value * minute);
      break;
    case "hour":
    case "hours":
    case "hr":
    case "hrs":
    case "h":
      numericDate = Math.round(value * hour);
      break;
    case "day":
    case "days":
    case "d":
      numericDate = Math.round(value * day);
      break;
    case "week":
    case "weeks":
    case "w":
      numericDate = Math.round(value * week);
      break;
    default:
      numericDate = Math.round(value * year);
      break;
  }
  if (matched[1] === "-" || matched[4] === "ago") {
    return -numericDate;
  }
  return numericDate;
}
function validateClaimsSet(protectedHeader, encodedPayload, options = {}) {
  let payload;
  try {
    payload = JSON.parse(decoder.decode(encodedPayload));
  } catch {
  }
  if (!isObject(payload)) {
    throw new JWTInvalid("JWT Claims Set must be a top-level JSON object");
  }
  const { typ } = options;
  if (typ && (typeof protectedHeader.typ !== "string" || normalizeTyp(protectedHeader.typ) !== normalizeTyp(typ))) {
    throw new JWTClaimValidationFailed('unexpected "typ" JWT header value', payload, "typ", "check_failed");
  }
  const { requiredClaims = [], issuer, subject, audience, maxTokenAge } = options;
  const presenceCheck = [...requiredClaims];
  if (maxTokenAge !== void 0)
    presenceCheck.push("iat");
  if (audience !== void 0)
    presenceCheck.push("aud");
  if (subject !== void 0)
    presenceCheck.push("sub");
  if (issuer !== void 0)
    presenceCheck.push("iss");
  for (const claim of new Set(presenceCheck.reverse())) {
    if (!(claim in payload)) {
      throw new JWTClaimValidationFailed(`missing required "${claim}" claim`, payload, claim, "missing");
    }
  }
  if (issuer && !(Array.isArray(issuer) ? issuer : [issuer]).includes(payload.iss)) {
    throw new JWTClaimValidationFailed('unexpected "iss" claim value', payload, "iss", "check_failed");
  }
  if (subject && payload.sub !== subject) {
    throw new JWTClaimValidationFailed('unexpected "sub" claim value', payload, "sub", "check_failed");
  }
  if (audience && !checkAudiencePresence(payload.aud, typeof audience === "string" ? [audience] : audience)) {
    throw new JWTClaimValidationFailed('unexpected "aud" claim value', payload, "aud", "check_failed");
  }
  let tolerance;
  switch (typeof options.clockTolerance) {
    case "string":
      tolerance = secs(options.clockTolerance);
      break;
    case "number":
      tolerance = options.clockTolerance;
      break;
    case "undefined":
      tolerance = 0;
      break;
    default:
      throw new TypeError("Invalid clockTolerance option type");
  }
  const { currentDate } = options;
  const now = epoch(currentDate || /* @__PURE__ */ new Date());
  if ((payload.iat !== void 0 || maxTokenAge) && typeof payload.iat !== "number") {
    throw new JWTClaimValidationFailed('"iat" claim must be a number', payload, "iat", "invalid");
  }
  if (payload.nbf !== void 0) {
    if (typeof payload.nbf !== "number") {
      throw new JWTClaimValidationFailed('"nbf" claim must be a number', payload, "nbf", "invalid");
    }
    if (payload.nbf > now + tolerance) {
      throw new JWTClaimValidationFailed('"nbf" claim timestamp check failed', payload, "nbf", "check_failed");
    }
  }
  if (payload.exp !== void 0) {
    if (typeof payload.exp !== "number") {
      throw new JWTClaimValidationFailed('"exp" claim must be a number', payload, "exp", "invalid");
    }
    if (payload.exp <= now - tolerance) {
      throw new JWTExpired('"exp" claim timestamp check failed', payload, "exp", "check_failed");
    }
  }
  if (maxTokenAge) {
    const age = now - payload.iat;
    const max = typeof maxTokenAge === "number" ? maxTokenAge : secs(maxTokenAge);
    if (age - tolerance > max) {
      throw new JWTExpired('"iat" claim timestamp check failed (too far in the past)', payload, "iat", "check_failed");
    }
    if (age < 0 - tolerance) {
      throw new JWTClaimValidationFailed('"iat" claim timestamp check failed (it should be in the past)', payload, "iat", "check_failed");
    }
  }
  return payload;
}
var epoch, minute, hour, day, week, year, REGEX, normalizeTyp, checkAudiencePresence;
var init_jwt_claims_set = __esm({
  "node_modules/jose/dist/webapi/lib/jwt_claims_set.js"() {
    init_errors();
    init_buffer_utils();
    init_type_checks();
    epoch = (date) => Math.floor(date.getTime() / 1e3);
    minute = 60;
    hour = minute * 60;
    day = hour * 24;
    week = day * 7;
    year = day * 365.25;
    REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
    normalizeTyp = (value) => {
      if (value.includes("/")) {
        return value.toLowerCase();
      }
      return `application/${value.toLowerCase()}`;
    };
    checkAudiencePresence = (audPayload, audOption) => {
      if (typeof audPayload === "string") {
        return audOption.includes(audPayload);
      }
      if (Array.isArray(audPayload)) {
        return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
      }
      return false;
    };
  }
});

// node_modules/jose/dist/webapi/jwt/verify.js
async function jwtVerify(jwt, key, options) {
  const verified = await compactVerify(jwt, key, options);
  if (verified.protectedHeader.crit?.includes("b64") && verified.protectedHeader.b64 === false) {
    throw new JWTInvalid("JWTs MUST NOT use unencoded payload");
  }
  const payload = validateClaimsSet(verified.protectedHeader, verified.payload, options);
  const result = { payload, protectedHeader: verified.protectedHeader };
  if (typeof key === "function") {
    return { ...result, key: verified.key };
  }
  return result;
}
var init_verify3 = __esm({
  "node_modules/jose/dist/webapi/jwt/verify.js"() {
    init_verify2();
    init_jwt_claims_set();
    init_errors();
  }
});

// node_modules/jose/dist/webapi/jwks/local.js
function getKtyFromAlg(alg) {
  switch (typeof alg === "string" && alg.slice(0, 2)) {
    case "RS":
    case "PS":
      return "RSA";
    case "ES":
      return "EC";
    case "Ed":
      return "OKP";
    case "ML":
      return "AKP";
    default:
      throw new JOSENotSupported('Unsupported "alg" value for a JSON Web Key Set');
  }
}
function isJWKSLike(jwks) {
  return jwks && typeof jwks === "object" && Array.isArray(jwks.keys) && jwks.keys.every(isJWKLike);
}
function isJWKLike(key) {
  return isObject(key);
}
async function importWithAlgCache(cache2, jwk, alg) {
  const cached = cache2.get(jwk) || cache2.set(jwk, {}).get(jwk);
  if (cached[alg] === void 0) {
    const key = await importJWK({ ...jwk, ext: true }, alg);
    if (key instanceof Uint8Array || key.type !== "public") {
      throw new JWKSInvalid("JSON Web Key Set members must be public keys");
    }
    cached[alg] = key;
  }
  return cached[alg];
}
function createLocalJWKSet(jwks) {
  const set = new LocalJWKSet(jwks);
  const localJWKSet = async (protectedHeader, token) => set.getKey(protectedHeader, token);
  Object.defineProperties(localJWKSet, {
    jwks: {
      value: () => structuredClone(set.jwks()),
      enumerable: false,
      configurable: false,
      writable: false
    }
  });
  return localJWKSet;
}
var LocalJWKSet;
var init_local = __esm({
  "node_modules/jose/dist/webapi/jwks/local.js"() {
    init_import();
    init_errors();
    init_type_checks();
    LocalJWKSet = class {
      #jwks;
      #cached = /* @__PURE__ */ new WeakMap();
      constructor(jwks) {
        if (!isJWKSLike(jwks)) {
          throw new JWKSInvalid("JSON Web Key Set malformed");
        }
        this.#jwks = structuredClone(jwks);
      }
      jwks() {
        return this.#jwks;
      }
      async getKey(protectedHeader, token) {
        const { alg, kid } = { ...protectedHeader, ...token?.header };
        const kty = getKtyFromAlg(alg);
        const candidates = this.#jwks.keys.filter((jwk2) => {
          let candidate = kty === jwk2.kty;
          if (candidate && typeof kid === "string") {
            candidate = kid === jwk2.kid;
          }
          if (candidate && (typeof jwk2.alg === "string" || kty === "AKP")) {
            candidate = alg === jwk2.alg;
          }
          if (candidate && typeof jwk2.use === "string") {
            candidate = jwk2.use === "sig";
          }
          if (candidate && Array.isArray(jwk2.key_ops)) {
            candidate = jwk2.key_ops.includes("verify");
          }
          if (candidate) {
            switch (alg) {
              case "ES256":
                candidate = jwk2.crv === "P-256";
                break;
              case "ES384":
                candidate = jwk2.crv === "P-384";
                break;
              case "ES512":
                candidate = jwk2.crv === "P-521";
                break;
              case "Ed25519":
              case "EdDSA":
                candidate = jwk2.crv === "Ed25519";
                break;
            }
          }
          return candidate;
        });
        const { 0: jwk, length } = candidates;
        if (length === 0) {
          throw new JWKSNoMatchingKey();
        }
        if (length !== 1) {
          const error = new JWKSMultipleMatchingKeys();
          const _cached = this.#cached;
          error[Symbol.asyncIterator] = async function* () {
            for (const jwk2 of candidates) {
              try {
                yield await importWithAlgCache(_cached, jwk2, alg);
              } catch {
              }
            }
          };
          throw error;
        }
        return importWithAlgCache(this.#cached, jwk, alg);
      }
    };
  }
});

// node_modules/jose/dist/webapi/jwks/remote.js
function isCloudflareWorkers() {
  return typeof WebSocketPair !== "undefined" || typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers" || typeof EdgeRuntime !== "undefined" && EdgeRuntime === "vercel";
}
async function fetchJwks(url, headers, signal, fetchImpl = fetch) {
  const response = await fetchImpl(url, {
    method: "GET",
    signal,
    redirect: "manual",
    headers
  }).catch((err) => {
    if (err.name === "TimeoutError") {
      throw new JWKSTimeout();
    }
    throw err;
  });
  if (response.status !== 200) {
    throw new JOSEError("Expected 200 OK from the JSON Web Key Set HTTP response");
  }
  try {
    return await response.json();
  } catch {
    throw new JOSEError("Failed to parse the JSON Web Key Set HTTP response as JSON");
  }
}
function isFreshJwksCache(input, cacheMaxAge) {
  if (typeof input !== "object" || input === null) {
    return false;
  }
  if (!("uat" in input) || typeof input.uat !== "number" || Date.now() - input.uat >= cacheMaxAge) {
    return false;
  }
  if (!("jwks" in input) || !isObject(input.jwks) || !Array.isArray(input.jwks.keys) || !Array.prototype.every.call(input.jwks.keys, isObject)) {
    return false;
  }
  return true;
}
function createRemoteJWKSet(url, options) {
  const set = new RemoteJWKSet(url, options);
  const remoteJWKSet = async (protectedHeader, token) => set.getKey(protectedHeader, token);
  Object.defineProperties(remoteJWKSet, {
    coolingDown: {
      get: () => set.coolingDown(),
      enumerable: true,
      configurable: false
    },
    fresh: {
      get: () => set.fresh(),
      enumerable: true,
      configurable: false
    },
    reload: {
      value: () => set.reload(),
      enumerable: true,
      configurable: false,
      writable: false
    },
    reloading: {
      get: () => set.pendingFetch(),
      enumerable: true,
      configurable: false
    },
    jwks: {
      value: () => set.jwks(),
      enumerable: true,
      configurable: false,
      writable: false
    }
  });
  return remoteJWKSet;
}
var USER_AGENT, customFetch, jwksCache, RemoteJWKSet;
var init_remote = __esm({
  "node_modules/jose/dist/webapi/jwks/remote.js"() {
    init_errors();
    init_local();
    init_type_checks();
    if (typeof navigator === "undefined" || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) {
      const NAME = "jose";
      const VERSION2 = "v6.2.2";
      USER_AGENT = `${NAME}/${VERSION2}`;
    }
    customFetch = /* @__PURE__ */ Symbol();
    jwksCache = /* @__PURE__ */ Symbol();
    RemoteJWKSet = class {
      #url;
      #timeoutDuration;
      #cooldownDuration;
      #cacheMaxAge;
      #jwksTimestamp;
      #pendingFetch;
      #headers;
      #customFetch;
      #local;
      #cache;
      constructor(url, options) {
        if (!(url instanceof URL)) {
          throw new TypeError("url must be an instance of URL");
        }
        this.#url = new URL(url.href);
        this.#timeoutDuration = typeof options?.timeoutDuration === "number" ? options?.timeoutDuration : 5e3;
        this.#cooldownDuration = typeof options?.cooldownDuration === "number" ? options?.cooldownDuration : 3e4;
        this.#cacheMaxAge = typeof options?.cacheMaxAge === "number" ? options?.cacheMaxAge : 6e5;
        this.#headers = new Headers(options?.headers);
        if (USER_AGENT && !this.#headers.has("User-Agent")) {
          this.#headers.set("User-Agent", USER_AGENT);
        }
        if (!this.#headers.has("accept")) {
          this.#headers.set("accept", "application/json");
          this.#headers.append("accept", "application/jwk-set+json");
        }
        this.#customFetch = options?.[customFetch];
        if (options?.[jwksCache] !== void 0) {
          this.#cache = options?.[jwksCache];
          if (isFreshJwksCache(options?.[jwksCache], this.#cacheMaxAge)) {
            this.#jwksTimestamp = this.#cache.uat;
            this.#local = createLocalJWKSet(this.#cache.jwks);
          }
        }
      }
      pendingFetch() {
        return !!this.#pendingFetch;
      }
      coolingDown() {
        return typeof this.#jwksTimestamp === "number" ? Date.now() < this.#jwksTimestamp + this.#cooldownDuration : false;
      }
      fresh() {
        return typeof this.#jwksTimestamp === "number" ? Date.now() < this.#jwksTimestamp + this.#cacheMaxAge : false;
      }
      jwks() {
        return this.#local?.jwks();
      }
      async getKey(protectedHeader, token) {
        if (!this.#local || !this.fresh()) {
          await this.reload();
        }
        try {
          return await this.#local(protectedHeader, token);
        } catch (err) {
          if (err instanceof JWKSNoMatchingKey) {
            if (this.coolingDown() === false) {
              await this.reload();
              return this.#local(protectedHeader, token);
            }
          }
          throw err;
        }
      }
      async reload() {
        if (this.#pendingFetch && isCloudflareWorkers()) {
          this.#pendingFetch = void 0;
        }
        this.#pendingFetch ||= fetchJwks(this.#url.href, this.#headers, AbortSignal.timeout(this.#timeoutDuration), this.#customFetch).then((json) => {
          this.#local = createLocalJWKSet(json);
          if (this.#cache) {
            this.#cache.uat = Date.now();
            this.#cache.jwks = json;
          }
          this.#jwksTimestamp = Date.now();
          this.#pendingFetch = void 0;
        }).catch((err) => {
          this.#pendingFetch = void 0;
          throw err;
        });
        await this.#pendingFetch;
      }
    };
  }
});

// node_modules/jose/dist/webapi/index.js
var init_webapi = __esm({
  "node_modules/jose/dist/webapi/index.js"() {
    init_verify3();
    init_remote();
  }
});

// server/auth-session.ts
var auth_session_exports = {};
__export(auth_session_exports, {
  __resetJwksForTests: () => __resetJwksForTests,
  getClerkJwtVerifyBaseOptions: () => getClerkJwtVerifyBaseOptions,
  getClerkJwtVerifyOptions: () => getClerkJwtVerifyOptions,
  getJWKS: () => getJWKS,
  isAllowedClerkAuthorizedParty: () => isAllowedClerkAuthorizedParty,
  lookupClerkPlan: () => lookupClerkPlan,
  parsePlanLookupTimeoutMs: () => parsePlanLookupTimeoutMs,
  validateBearerToken: () => validateBearerToken,
  verifiedSubjectIgnoringExpiry: () => verifiedSubjectIgnoringExpiry,
  verifyClerkSessionActive: () => verifyClerkSessionActive
});
function getClerkJwtVerifyBaseOptions() {
  return {
    // Read lazily (not from the module-scope const) for the same reason as
    // getJWKS(): both halves of issuer handling must read the env at the same
    // time. A module evaluated before CLERK_JWT_ISSUER_DOMAIN is set would
    // otherwise pin issuer '' here — and jose skips the issuer VALUE check
    // entirely on a falsy issuer — while the lazily-built JWKS still resolves.
    issuer: process.env.CLERK_JWT_ISSUER_DOMAIN ?? "",
    algorithms: ["RS256"],
    clockTolerance: CLERK_JWT_CLOCK_TOLERANCE_SECONDS,
    // The bounded tolerance above is only a bound if expiry is evaluated at
    // all: jose skips the whole `exp` check (tolerance included) when the
    // claim is absent. Clerk always mints `exp`, so requiring it rejects
    // nothing real — it makes the stated bound enforced rather than assumed.
    requiredClaims: ["exp"]
  };
}
function getJWKS() {
  if (!_jwks) {
    const issuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
    if (issuerDomain) {
      const jwksUrl = new URL("/.well-known/jwks.json", issuerDomain);
      _jwks = createRemoteJWKSet(jwksUrl);
    }
  }
  return _jwks;
}
function __resetJwksForTests() {
  _jwks = null;
}
function isJwksFetchFailure(err) {
  if (err instanceof TypeError) return true;
  const code = err?.code;
  return code === "ERR_JWKS_TIMEOUT";
}
function getAllowedAudiences() {
  const configured = [
    process.env.CLERK_JWT_AUDIENCE,
    process.env.CLERK_PUBLISHABLE_KEY
  ].flatMap((value) => (value ?? "").split(",")).map((value) => value.trim()).filter(Boolean);
  return Array.from(/* @__PURE__ */ new Set(["convex", ...configured]));
}
function getClerkJwtVerifyOptions() {
  return {
    ...getClerkJwtVerifyBaseOptions(),
    audience: getAllowedAudiences()
  };
}
function isAllowedClerkAuthorizedParty(azp) {
  if (!azp) return false;
  if (isAllowedOrigin(azp)) return true;
  const siteUrl = process.env.SITE_URL?.trim();
  if (!siteUrl) return false;
  try {
    return new URL(siteUrl).origin === new URL(azp).origin;
  } catch {
    return false;
  }
}
function extractOrgId(payload) {
  const orgClaim = payload.org;
  return (typeof orgClaim?.id === "string" ? orgClaim.id : null) ?? (typeof payload.org_id === "string" ? payload.org_id : null);
}
function parsePlanLookupTimeoutMs(value) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= MAX_ABORT_SIGNAL_TIMEOUT_MS ? parsed : DEFAULT_PLAN_LOOKUP_TIMEOUT_MS;
}
async function lookupClerkPlan(userId) {
  const cached = _planCache.get(userId);
  if (cached && Date.now() < cached.expiresAt) return cached.role;
  if (!CLERK_SECRET_KEY) return "unavailable";
  try {
    const resp = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
        // AGENTS.md: always set User-Agent on server-side fetches. Matches the
        // sibling auth lookups (entitlement-check.ts, _shared/user-api-key.ts).
        "User-Agent": "worldmonitor-gateway/1.0"
      },
      signal: AbortSignal.timeout(PLAN_LOOKUP_TIMEOUT_MS)
    });
    if (resp.status === 404) return "free";
    if (!resp.ok) {
      console.warn(`[auth-session] Clerk plan lookup unavailable: http-${resp.status}`);
      return "unavailable";
    }
    const user = await resp.json();
    const role = user.public_metadata?.plan === "pro" ? "pro" : "free";
    _planCache.set(userId, { role, expiresAt: Date.now() + PLAN_CACHE_TTL_MS });
    return role;
  } catch (err) {
    void captureSilentError(err, {
      tags: { route: "server/auth-session", step: "clerk-plan-lookup" }
    });
    console.warn(
      "[auth-session] Clerk plan lookup unavailable:",
      err instanceof Error ? err.message : String(err)
    );
    return "unavailable";
  }
}
async function lookupPlanFromClerk(userId) {
  const result = await lookupClerkPlan(userId);
  return result === "unavailable" ? "free" : result;
}
async function verifyClerkSessionActive(sessionId, userId) {
  const secret = process.env.CLERK_SECRET_KEY;
  if (!secret) return "unavailable";
  if (!sessionId || !userId) return "inactive";
  try {
    const resp = await fetch(`https://api.clerk.com/v1/sessions/${encodeURIComponent(sessionId)}`, {
      headers: {
        Authorization: `Bearer ${secret}`,
        "User-Agent": "worldmonitor-gateway/1.0"
      },
      signal: AbortSignal.timeout(PLAN_LOOKUP_TIMEOUT_MS)
    });
    if (resp.status === 404) return "inactive";
    if (!resp.ok) {
      console.warn(`[auth-session] Clerk session check unavailable: http-${resp.status}`);
      return "unavailable";
    }
    const session = await resp.json();
    return session.id === sessionId && session.status === "active" && session.user_id === userId ? "active" : "inactive";
  } catch (err) {
    void captureSilentError(err, {
      tags: { route: "server/auth-session", step: "clerk-session-check" }
    });
    console.warn(
      "[auth-session] Clerk session check unavailable:",
      err instanceof Error ? err.message : String(err)
    );
    return "unavailable";
  }
}
async function verifiedSubjectIgnoringExpiry(token) {
  const jwks = getJWKS();
  if (!jwks) return "unverifiable";
  try {
    const { payload } = await jwtVerify(token, jwks, {
      ...getClerkJwtVerifyBaseOptions(),
      clockTolerance: Number.MAX_SAFE_INTEGER
    });
    return typeof payload.sub === "string" && payload.sub ? payload.sub : null;
  } catch (err) {
    return isJwksFetchFailure(err) ? "unverifiable" : null;
  }
}
async function validateBearerToken(token, options = {}) {
  const jwks = getJWKS();
  if (!jwks) return { valid: false, reason: "unverifiable" };
  try {
    let payload;
    try {
      ({ payload } = await jwtVerify(token, jwks, getClerkJwtVerifyOptions()));
    } catch (audErr) {
      if (audErr.message?.includes('missing required "aud"')) {
        ({ payload } = await jwtVerify(token, jwks, getClerkJwtVerifyBaseOptions()));
      } else {
        throw audErr;
      }
    }
    const userId = payload.sub;
    if (!userId) return { valid: false, reason: "invalid" };
    const azp = payload.azp;
    if (typeof azp === "string" && azp.length > 0 && !isAllowedClerkAuthorizedParty(azp)) {
      return { valid: false, reason: "invalid" };
    }
    if (azp !== void 0 && typeof azp !== "string") {
      return { valid: false, reason: "invalid" };
    }
    const rawPlan = payload.plan;
    const role = rawPlan !== void 0 ? rawPlan === "pro" ? "pro" : "free" : options.resolvePlan === false ? "free" : await lookupPlanFromClerk(userId);
    const email = typeof payload.email === "string" ? payload.email : void 0;
    const givenName = typeof payload.given_name === "string" ? payload.given_name : void 0;
    const familyName = typeof payload.family_name === "string" ? payload.family_name : void 0;
    const name = [givenName, familyName].filter(Boolean).join(" ") || void 0;
    const orgId = extractOrgId(payload);
    const sessionId = typeof payload.sid === "string" && payload.sid ? payload.sid : void 0;
    const expMs = typeof payload.exp === "number" ? payload.exp * 1e3 : null;
    const withinTolerance = expMs !== null && expMs <= Date.now();
    return {
      valid: true,
      userId,
      orgId,
      role,
      email,
      name,
      ...sessionId ? { sessionId } : {},
      ...withinTolerance ? { acceptedWithinClockTolerance: true } : {}
    };
  } catch (err) {
    return { valid: false, reason: isJwksFetchFailure(err) ? "unverifiable" : "invalid" };
  }
}
var CLERK_SECRET_KEY, CLERK_JWT_CLOCK_TOLERANCE_SECONDS, _jwks, _planCache, PLAN_CACHE_TTL_MS, DEFAULT_PLAN_LOOKUP_TIMEOUT_MS, MAX_ABORT_SIGNAL_TIMEOUT_MS, PLAN_LOOKUP_TIMEOUT_MS;
var init_auth_session = __esm({
  "server/auth-session.ts"() {
    "use strict";
    init_webapi();
    init_sentry_edge();
    init_cors();
    CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY ?? "";
    CLERK_JWT_CLOCK_TOLERANCE_SECONDS = 5;
    _jwks = null;
    _planCache = /* @__PURE__ */ new Map();
    PLAN_CACHE_TTL_MS = 5 * 60 * 1e3;
    DEFAULT_PLAN_LOOKUP_TIMEOUT_MS = 3e3;
    MAX_ABORT_SIGNAL_TIMEOUT_MS = 2147483647;
    PLAN_LOOKUP_TIMEOUT_MS = parsePlanLookupTimeoutMs(process.env.CLERK_PLAN_LOOKUP_TIMEOUT_MS);
  }
});

// shared/company-monitoring-contract.ts
var COMPANY_MONITORING_LIMITS, COMPANY_MONITORING_RPC_SCOPES, encoder2;
var init_company_monitoring_contract = __esm({
  "shared/company-monitoring-contract.ts"() {
    "use strict";
    COMPANY_MONITORING_LIMITS = {
      maxCompaniesPerAccount: 500,
      maxRequestBytes: 256 * 1024,
      maxImportBatchBytes: 256 * 1024,
      maxImportRows: 100,
      maxImportRowBytes: 8 * 1024,
      maxClientImportIdBytes: 64,
      maxNameBytes: 256,
      maxCustomerReferenceBytes: 128,
      maxAliasBytes: 256,
      maxDomainBytes: 253,
      maxIdentifierBytes: 512,
      maxXHandleBytes: 15,
      maxXHandleInputBytes: 16,
      maxXAccountIdBytes: 32,
      maxLocationBytes: 256,
      maxAliases: 20,
      maxDomains: 10,
      maxIdentifiers: 20,
      maxXHandles: 5,
      maxLocations: 20,
      maxClaimsPerCompany: 81,
      maxEvidenceReferences: 20,
      maxPageSize: 100,
      maxCursorBytes: 2048,
      maxCursorTtlMs: 24 * 60 * 60 * 1e3,
      maxCursorClockSkewMs: 60 * 1e3
    };
    COMPANY_MONITORING_RPC_SCOPES = {
      CreateMonitoredCompany: "company_monitoring:write",
      UpdateMonitoredCompany: "company_monitoring:write",
      SetMonitoredCompanyState: "company_monitoring:write",
      ImportMonitoredCompanyBatch: "company_monitoring:write",
      ListMonitoredCompanies: "company_monitoring:read",
      ListCompanyEventImpacts: "company_monitoring:read",
      ListCompanyEventChanges: "company_monitoring:read",
      GetCompanyMaterialEvent: "company_monitoring:read",
      GetCompanyCoverage: "company_monitoring:read",
      GetCompanyMonitoringStatus: "company_monitoring:read"
    };
    encoder2 = new TextEncoder();
  }
});

// server/_shared/user-api-key.ts
var user_api_key_exports = {};
__export(user_api_key_exports, {
  UserApiKeyUnavailableError: () => UserApiKeyUnavailableError,
  invalidateApiKeyCache: () => invalidateApiKeyCache,
  isUserApiKeyUnavailableError: () => isUserApiKeyUnavailableError,
  validateUserApiKey: () => validateUserApiKey,
  validateUserApiKeyPrincipal: () => validateUserApiKeyPrincipal
});
function isUserApiKeyUnavailableError(err) {
  return err instanceof UserApiKeyUnavailableError;
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasNonEmptyString(value, field) {
  if (!Object.prototype.hasOwnProperty.call(value, field)) return false;
  const candidate = value[field];
  return typeof candidate === "string" && candidate.length > 0;
}
function hasValidCompanyMonitoringBinding(value) {
  const { scopes, companyMonitoringAccountId } = value;
  if (scopes === void 0 && companyMonitoringAccountId === void 0) return true;
  if (!Array.isArray(scopes) || scopes.length === 0) return false;
  if (typeof companyMonitoringAccountId !== "string" || companyMonitoringAccountId.length === 0) return false;
  return new Set(scopes).size === scopes.length && scopes.every((scope) => typeof scope === "string" && COMPANY_MONITORING_SCOPES.has(scope));
}
function isCurrentUserKeyCacheEntry(value) {
  if (!isPlainObject(value)) return false;
  if (!Object.prototype.hasOwnProperty.call(value, "v") || value.v !== USER_API_KEY_CACHE_VERSION) return false;
  if (!hasNonEmptyString(value, "userId") || !hasNonEmptyString(value, "keyId")) return false;
  if (typeof value.keyKind !== "string" || !USER_API_KEY_KINDS.has(value.keyKind)) return false;
  if (value.activeKeyRank !== void 0 && !isActiveKeyRank(value.activeKeyRank)) return false;
  return hasValidCompanyMonitoringBinding(value);
}
function isActiveKeyRank(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
function toCacheEntry(value) {
  if (!isPlainObject(value)) return null;
  if (!hasNonEmptyString(value, "userId") || !hasNonEmptyString(value, "id")) return null;
  if (!hasValidCompanyMonitoringBinding(value)) return null;
  const rawKind = value.keyKind;
  if (rawKind !== void 0 && (typeof rawKind !== "string" || !USER_API_KEY_KINDS.has(rawKind))) return null;
  const keyKind = rawKind === void 0 ? "api" : rawKind;
  return {
    v: USER_API_KEY_CACHE_VERSION,
    userId: value.userId,
    keyId: value.id,
    ...typeof value.name === "string" ? { name: value.name } : {},
    keyKind,
    ...isActiveKeyRank(value.activeKeyRank) ? { activeKeyRank: value.activeKeyRank } : {},
    ...value.scopes === void 0 ? {} : { scopes: value.scopes },
    ...value.companyMonitoringAccountId === void 0 ? {} : { companyMonitoringAccountId: value.companyMonitoringAccountId }
  };
}
function isGenericUserKeyResult(value) {
  return value.scopes === void 0 && value.companyMonitoringAccountId === void 0;
}
async function sha256Hex3(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
function toUnavailableError(err) {
  if (err instanceof UserApiKeyUnavailableError) return err;
  const message2 = err instanceof Error ? err.message : String(err);
  return new UserApiKeyUnavailableError(
    message2.startsWith("Convex user API key validation unavailable") ? message2 : `Convex user API key validation unavailable: ${message2}`
  );
}
async function validateUserApiKey(key) {
  const entry = await validateUserApiKeyEntry(key);
  if (entry === null) return null;
  if (!isGenericUserKeyResult(entry)) return null;
  if (entry.keyKind !== "api") return null;
  return entry;
}
async function validateUserApiKeyPrincipal(key) {
  const entry = await validateUserApiKeyEntry(key);
  if (entry === null || !isGenericUserKeyResult(entry)) return null;
  return {
    userId: entry.userId,
    keyId: entry.keyId,
    keyKind: entry.keyKind,
    // The hash is what the entry was looked up by; recomputing it here keeps
    // the function pure for callers that never saw the cache key.
    keyHash: await sha256Hex3(key),
    ...entry.activeKeyRank === void 0 ? {} : { activeKeyRank: entry.activeKeyRank }
  };
}
async function validateUserApiKeyEntry(key) {
  if (!USER_API_KEY_RE.test(key ?? "")) return null;
  const keyHash = await sha256Hex3(key);
  try {
    return await loadUserKeyEntry(keyHash);
  } catch (err) {
    const unavailable = toUnavailableError(err);
    console.warn("[user-api-key] validateUserApiKey unavailable:", unavailable.message);
    throw unavailable;
  }
}
async function loadUserKeyEntry(keyHash) {
  const cacheKey = `${CACHE_KEY_PREFIX}${keyHash}`;
  const pre = await readCachedJson(cacheKey);
  if (pre.status === "hit" && isPlainObject(pre.value)) {
    if (isCurrentUserKeyCacheEntry(pre.value)) return pre.value;
    return revalidateUserKey(cacheKey, keyHash);
  }
  const result = await cachedFetchJson(
    cacheKey,
    CACHE_TTL_SECONDS,
    () => fetchFromConvex(keyHash),
    NEG_TTL_SECONDS,
    { cacheFetcherErrors: false }
  );
  if (result === null) return null;
  if (isCurrentUserKeyCacheEntry(result)) return result;
  if (isPlainObject(result)) return revalidateUserKey(cacheKey, keyHash);
  console.warn(`[user-api-key] discarding non-conforming validation payload (type=${Array.isArray(result) ? "array" : typeof result})`);
  return null;
}
function revalidateUserKey(cacheKey, keyHash) {
  const existing = revalidateInFlight.get(cacheKey);
  if (existing) return existing;
  const pending = (async () => {
    const fresh = await fetchFromConvex(keyHash);
    if (fresh === null) {
      await deleteRedisKey(cacheKey);
      return null;
    }
    await setCachedJson(cacheKey, fresh, CACHE_TTL_SECONDS);
    return fresh;
  })();
  revalidateInFlight.set(cacheKey, pending);
  return pending.finally(() => {
    revalidateInFlight.delete(cacheKey);
  });
}
async function fetchFromConvex(keyHash) {
  const convexSiteUrl = process.env.CONVEX_SITE_URL;
  const convexSharedSecret = process.env.CONVEX_SERVER_SHARED_SECRET;
  if (!convexSiteUrl || !convexSharedSecret) {
    throw new UserApiKeyUnavailableError("Convex user API key validation unavailable: missing-config");
  }
  let resp;
  try {
    resp = await fetch(`${convexSiteUrl}/api/internal-validate-api-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "worldmonitor-gateway/1.0",
        "x-convex-shared-secret": convexSharedSecret
      },
      body: JSON.stringify({ keyHash }),
      signal: AbortSignal.timeout(3e3)
    });
  } catch {
    throw new UserApiKeyUnavailableError("Convex user API key validation unavailable: fetch-error");
  }
  if (!resp.ok) {
    throw new UserApiKeyUnavailableError(
      `Convex user API key validation unavailable: http-${resp.status}`
    );
  }
  let value;
  try {
    value = await resp.json();
  } catch {
    throw new UserApiKeyUnavailableError("Convex user API key validation unavailable: invalid-json");
  }
  if (value === null) return null;
  const entry = toCacheEntry(value);
  if (entry === null) {
    throw new UserApiKeyUnavailableError("Convex user API key validation unavailable: invalid-payload");
  }
  return entry;
}
async function invalidateApiKeyCache(keyHash) {
  await deleteRedisKey(`${CACHE_KEY_PREFIX}${keyHash}`);
}
var COMPANY_MONITORING_SCOPES, USER_API_KEY_KINDS, USER_API_KEY_CACHE_VERSION, UserApiKeyUnavailableError, USER_API_KEY_RE, CACHE_TTL_SECONDS, NEG_TTL_SECONDS, CACHE_KEY_PREFIX, revalidateInFlight;
var init_user_api_key = __esm({
  "server/_shared/user-api-key.ts"() {
    "use strict";
    init_redis();
    init_company_monitoring_contract();
    COMPANY_MONITORING_SCOPES = new Set(Object.values(COMPANY_MONITORING_RPC_SCOPES));
    USER_API_KEY_KINDS = /* @__PURE__ */ new Set(["api", "desktop"]);
    USER_API_KEY_CACHE_VERSION = 2;
    UserApiKeyUnavailableError = class extends Error {
      code = "validation_unavailable";
      constructor(message2) {
        super(message2);
        this.name = "UserApiKeyUnavailableError";
      }
    };
    USER_API_KEY_RE = /^wm_[a-f0-9]{40}$/;
    CACHE_TTL_SECONDS = 60;
    NEG_TTL_SECONDS = 60;
    CACHE_KEY_PREFIX = "user-api-key:";
    revalidateInFlight = /* @__PURE__ */ new Map();
  }
});

// server/_shared/embed-key.ts
var embed_key_exports = {};
__export(embed_key_exports, {
  EmbedKeyUnavailableError: () => EmbedKeyUnavailableError,
  embedCredentialFromHeaders: () => embedCredentialFromHeaders,
  hasEmbedAccess: () => hasEmbedAccess,
  invalidateEmbedKeyCache: () => invalidateEmbedKeyCache,
  isEmbedKeyUnavailableError: () => isEmbedKeyUnavailableError,
  validateEmbedKey: () => validateEmbedKey
});
function embedCredentialFromHeaders(headers) {
  return headers.get("X-WorldMonitor-Key")?.trim() || headers.get("X-Api-Key")?.trim() || null;
}
function isEmbedKeyUnavailableError(err) {
  return err instanceof EmbedKeyUnavailableError;
}
function isEmbedKeyResult(value) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  if (!Object.prototype.hasOwnProperty.call(value, "userId")) return false;
  const userId = value.userId;
  return typeof userId === "string" && userId.length > 0;
}
async function sha256Hex4(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}
function toUnavailableError2(err) {
  if (err instanceof EmbedKeyUnavailableError) return err;
  const message2 = err instanceof Error ? err.message : String(err);
  return new EmbedKeyUnavailableError(
    message2.startsWith("Convex embed key validation unavailable") ? message2 : `Convex embed key validation unavailable: ${message2}`
  );
}
async function validateEmbedKey(key) {
  if (!EMBED_KEY_RE.test(key ?? "")) return null;
  const keyHash = await sha256Hex4(key);
  const cacheKey = `${CACHE_KEY_PREFIX2}${keyHash}`;
  try {
    const result = await cachedFetchJson(
      cacheKey,
      CACHE_TTL_SECONDS2,
      () => fetchFromConvex2(keyHash),
      NEG_TTL_SECONDS2,
      { cacheFetcherErrors: false }
    );
    if (result === null) return null;
    if (!isEmbedKeyResult(result)) {
      console.warn(`[embed-key] discarding non-conforming validation payload (type=${Array.isArray(result) ? "array" : typeof result})`);
      return null;
    }
    return result;
  } catch (err) {
    const unavailable = toUnavailableError2(err);
    console.warn("[embed-key] validateEmbedKey unavailable:", unavailable.message);
    throw unavailable;
  }
}
async function fetchFromConvex2(keyHash) {
  const convexSiteUrl = process.env.CONVEX_SITE_URL;
  const convexSharedSecret = process.env.CONVEX_SERVER_SHARED_SECRET;
  if (!convexSiteUrl || !convexSharedSecret) {
    throw new EmbedKeyUnavailableError("Convex embed key validation unavailable: missing-config");
  }
  let resp;
  try {
    resp = await fetch(`${convexSiteUrl}/api/internal-validate-embed-key`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "worldmonitor-gateway/1.0",
        "x-convex-shared-secret": convexSharedSecret
      },
      body: JSON.stringify({ keyHash }),
      signal: AbortSignal.timeout(3e3)
    });
  } catch {
    throw new EmbedKeyUnavailableError("Convex embed key validation unavailable: fetch-error");
  }
  if (!resp.ok) {
    throw new EmbedKeyUnavailableError(
      `Convex embed key validation unavailable: http-${resp.status}`
    );
  }
  let value;
  try {
    value = await resp.json();
  } catch {
    throw new EmbedKeyUnavailableError("Convex embed key validation unavailable: invalid-json");
  }
  if (value === null) return null;
  if (!isEmbedKeyResult(value)) {
    throw new EmbedKeyUnavailableError("Convex embed key validation unavailable: invalid-payload");
  }
  return value;
}
async function invalidateEmbedKeyCache(keyHash) {
  await deleteRedisKey(`${CACHE_KEY_PREFIX2}${keyHash}`);
}
var EmbedKeyUnavailableError, EMBED_KEY_RE, CACHE_TTL_SECONDS2, NEG_TTL_SECONDS2, CACHE_KEY_PREFIX2;
var init_embed_key = __esm({
  "server/_shared/embed-key.ts"() {
    "use strict";
    init_redis();
    init_embed_access();
    EmbedKeyUnavailableError = class extends Error {
      code = "validation_unavailable";
      constructor(message2) {
        super(message2);
        this.name = "EmbedKeyUnavailableError";
      }
    };
    EMBED_KEY_RE = /^wme_[a-f0-9]{40}$/;
    CACHE_TTL_SECONDS2 = 60;
    NEG_TTL_SECONDS2 = 60;
    CACHE_KEY_PREFIX2 = "embed-key:";
  }
});

// server/_shared/sub-request-admission.ts
init_redis();

// server/_shared/mcp-internal-hmac.ts
var INTERNAL_MCP_SIG_HEADER = "X-WM-MCP-Internal";
var INTERNAL_MCP_USER_ID_HEADER = "X-WM-MCP-User-Id";
var INTERNAL_MCP_NONCE_HEADER = "X-WM-MCP-Nonce";
var INTERNAL_MCP_VERIFIED_HEADER = "x-wm-mcp-internal-verified";
var TRUSTED_USER_ID_HEADER = "x-user-id";
var _verifiedNonce = null;
function getInternalMcpVerifiedNonce() {
  if (_verifiedNonce !== null) return _verifiedNonce;
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  _verifiedNonce = Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
  return _verifiedNonce;
}
var INTERNAL_MCP_TIMESTAMP_WINDOW_SECONDS = 30;
var INTERNAL_MCP_REPLAY_CACHE_TTL_SECONDS = 2 * INTERNAL_MCP_TIMESTAMP_WINDOW_SECONDS + 5;
async function sha256Hex(input) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function canonicalQueryString(searchOrUrl) {
  let search;
  if (searchOrUrl instanceof URL) {
    search = searchOrUrl.search;
  } else if (typeof searchOrUrl === "string") {
    if (searchOrUrl.startsWith("http://") || searchOrUrl.startsWith("https://")) {
      try {
        search = new URL(searchOrUrl).search;
      } catch {
        return "";
      }
    } else {
      search = searchOrUrl;
    }
  } else {
    return "";
  }
  if (!search || search === "?") return "";
  const trimmed = search.startsWith("?") ? search.slice(1) : search;
  if (!trimmed) return "";
  const params = new URLSearchParams(trimmed);
  const entries = [];
  for (const [k, v] of params) entries.push([k, v]);
  entries.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  return entries.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join("&");
}
function canonicalGatewayQueryString(input) {
  const url = new URL(input);
  const pathSegments = url.pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1] ?? "";
  const rpcParams = url.searchParams.getAll("rpc");
  if (rpcParams.some((value) => value === lastSegment)) {
    url.searchParams.delete("rpc");
    for (const value of rpcParams) {
      if (value !== lastSegment) url.searchParams.append("rpc", value);
    }
  }
  return canonicalQueryString(url);
}
function buildHmacPayload(args) {
  return `${args.ts}:${args.method.toUpperCase()}:${args.pathname}:${args.queryHash}:${args.bodyHash}:${args.userId}:${args.nonce}`;
}
async function importHmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}
function bufferToBase64Url(buf) {
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function hmacSha256Base64Url(secret, payload) {
  const key = await importHmacKey(secret);
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return bufferToBase64Url(sig);
}
function isValidInternalMcpNonce(nonce) {
  return /^[A-Za-z0-9_-]{16,128}$/.test(nonce);
}
async function timingSafeStringEqual(a, b) {
  const enc2 = new TextEncoder();
  const aHash = new Uint8Array(await crypto.subtle.digest("SHA-256", enc2.encode(a)));
  const bHash = new Uint8Array(await crypto.subtle.digest("SHA-256", enc2.encode(b)));
  let diff = 0;
  for (let i = 0; i < aHash.length; i++) diff |= aHash[i] ^ bHash[i];
  return diff === 0;
}
function parseSignatureHeader(value) {
  if (!value) return null;
  const dotIdx = value.indexOf(".");
  if (dotIdx <= 0 || dotIdx === value.length - 1) return null;
  if (value.indexOf(".", dotIdx + 1) !== -1) return null;
  const tsStr = value.slice(0, dotIdx);
  const sigB64u = value.slice(dotIdx + 1);
  if (!/^[0-9]{1,15}$/.test(tsStr)) return null;
  if (!/^[A-Za-z0-9_-]+$/.test(sigB64u)) return null;
  const ts = Number(tsStr);
  if (!Number.isFinite(ts) || ts < 0) return null;
  return { ts, sigB64u };
}
async function verifyInternalMcpRequestDetailed(req, secret, now) {
  if (!secret) return { ok: false, failure: "no_secret" };
  const sigHeader = req.headers.get(INTERNAL_MCP_SIG_HEADER);
  const userId = req.headers.get(INTERNAL_MCP_USER_ID_HEADER);
  const nonce = req.headers.get(INTERNAL_MCP_NONCE_HEADER);
  if (!userId) return { ok: false, failure: "no_user_id" };
  if (!sigHeader) {
    return { ok: false, failure: "missing_signature" };
  }
  if (!nonce || !isValidInternalMcpNonce(nonce)) {
    return { ok: false, failure: "invalid_nonce" };
  }
  const parsed = parseSignatureHeader(sigHeader);
  if (!parsed) return { ok: false, failure: "malformed_signature" };
  const { ts, sigB64u } = parsed;
  const nowSec = Math.floor(now ?? Date.now() / 1e3);
  if (Math.abs(nowSec - ts) > INTERNAL_MCP_TIMESTAMP_WINDOW_SECONDS) {
    return { ok: false, failure: "timestamp_window" };
  }
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return { ok: false, failure: "malformed_request" };
  }
  let bodyBytes;
  try {
    const buf = await req.clone().arrayBuffer();
    bodyBytes = new Uint8Array(buf);
  } catch {
    return { ok: false, failure: "malformed_request" };
  }
  const bodyAsString = bodyBytes.length === 0 ? "" : new TextDecoder().decode(bodyBytes);
  const queryHash = await sha256Hex(canonicalGatewayQueryString(url));
  const bodyHash = await sha256Hex(bodyAsString);
  const expectedPayload = buildHmacPayload({
    ts,
    method: req.method,
    pathname: url.pathname,
    queryHash,
    bodyHash,
    userId,
    nonce
  });
  const expectedSig = await hmacSha256Base64Url(secret, expectedPayload);
  const ok = await timingSafeStringEqual(expectedSig, sigB64u);
  if (!ok) return { ok: false, failure: "signature_mismatch" };
  return { ok: true, verified: { userId, nonce } };
}

// server/_shared/sub-request-admission.ts
var SUB_REQUEST_MARKER_HEADER = "x-wm-sub-request";
var ADMISSION_PREFIX = "sub-request-admission:v1:";
async function requestDigest(request) {
  const url = new URL(request.url);
  return sha256Hex(JSON.stringify([
    request.method,
    url.origin,
    url.pathname,
    canonicalGatewayQueryString(url),
    request.headers.get("authorization"),
    request.headers.get("x-worldmonitor-key"),
    request.headers.get("x-api-key")
  ]));
}
async function consumeSubRequestAdmission(request, principal = null) {
  const token = request.headers.get(SUB_REQUEST_MARKER_HEADER);
  if (request.method !== "GET" || !token || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(token)) return "invalid";
  const results = await runRedisPipeline([["GETDEL", `${ADMISSION_PREFIX}${token}`]], true);
  if (results.length === 0 || results[0]?.error) return "unavailable";
  const stored = results[0]?.result;
  if (typeof stored !== "string") return "invalid";
  let value;
  try {
    value = JSON.parse(stored);
  } catch {
    return "invalid";
  }
  if (value.request !== await requestDigest(request)) return "invalid";
  if (value.principal !== null && typeof value.principal !== "string") return "invalid";
  if (principal && value.principal !== await sha256Hex(principal)) return "invalid";
  return "admitted";
}

// server/_shared/entitlement-coverage.ts
function hasCurrentEntitlementCoverage(entitlement, now = Date.now()) {
  return entitlement != null && entitlement.verificationUnavailable !== true && entitlement.billingStatus !== "subscription_lapsed" && Number.isFinite(entitlement.validUntil) && entitlement.validUntil >= now;
}

// server/_shared/country-history-access.ts
var access = /* @__PURE__ */ new WeakMap();
function countryHistoryDays(entitlement, now = Date.now()) {
  if (!hasCurrentEntitlementCoverage(entitlement, now)) return 7;
  const { tier, historyDays } = entitlement.features;
  const ceiling = tier >= 2 ? 365 : tier >= 1 ? 90 : 7;
  return typeof historyDays === "number" && Number.isInteger(historyDays) && historyDays > 0 ? Math.min(historyDays, ceiling) : ceiling;
}
function bindCountryHistoryAccess(request, days) {
  access.set(request, days);
}

// server/router.ts
function toHeadResponse(response) {
  const headers = new Headers(response.headers);
  if (response.body) {
    try {
      void response.body.cancel();
    } catch {
    }
  }
  return new Response(null, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}
function createRouter(allRoutes) {
  const staticTable = /* @__PURE__ */ new Map();
  const staticPaths = /* @__PURE__ */ new Map();
  const dynamicRoutes = [];
  for (const route of allRoutes) {
    if (route.path.includes("{")) {
      const parts = route.path.split("/").filter(Boolean);
      dynamicRoutes.push({
        method: route.method,
        segmentCount: parts.length,
        segments: parts.map((p) => p.startsWith("{") && p.endsWith("}") ? null : p),
        handler: route.handler
      });
    } else {
      const key = `${route.method} ${route.path}`;
      staticTable.set(key, route.handler);
      if (!staticPaths.has(route.path)) staticPaths.set(route.path, /* @__PURE__ */ new Set());
      staticPaths.get(route.path).add(route.method);
    }
  }
  function normalizePath(raw) {
    return raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw;
  }
  function lookup(method, pathname) {
    const staticHandler = staticTable.get(`${method} ${pathname}`);
    if (staticHandler) return staticHandler;
    const parts = pathname.split("/").filter(Boolean);
    for (const route of dynamicRoutes) {
      if (route.method !== method) continue;
      if (route.segmentCount !== parts.length) continue;
      let matched = true;
      for (let i = 0; i < route.segmentCount; i++) {
        if (route.segments[i] !== null && route.segments[i] !== parts[i]) {
          matched = false;
          break;
        }
      }
      if (matched) return route.handler;
    }
    return null;
  }
  return {
    match(req) {
      const pathname = normalizePath(new URL(req.url).pathname);
      const exact = lookup(req.method, pathname);
      if (exact) return exact;
      if (req.method === "HEAD") return lookup("GET", pathname);
      return null;
    },
    allowedMethods(pathname) {
      const normalized = normalizePath(pathname);
      const methods = staticPaths.get(normalized);
      if (methods) {
        const result = Array.from(methods);
        if (result.includes("GET") && !result.includes("HEAD")) result.push("HEAD");
        return result;
      }
      const parts = normalized.split("/").filter(Boolean);
      const found = /* @__PURE__ */ new Set();
      for (const route of dynamicRoutes) {
        if (route.segmentCount !== parts.length) continue;
        let matched = true;
        for (let i = 0; i < route.segmentCount; i++) {
          if (route.segments[i] !== null && route.segments[i] !== parts[i]) {
            matched = false;
            break;
          }
        }
        if (matched) found.add(route.method);
      }
      if (found.has("GET")) found.add("HEAD");
      return Array.from(found);
    }
  };
}

// server/gateway.ts
init_cors();

// src/shared/public-rpc-cache.ts
var LIVE_TOPIC_RPC_PATHS = Object.freeze([
  "/api/market/v1/get-fear-greed-index",
  "/api/infrastructure/v1/list-internet-outages",
  "/api/prediction/v1/list-prediction-markets",
  "/api/economic/v1/get-national-debt",
  "/api/economic/v1/get-us-treasury-par-yield-curve",
  "/api/economic/v1/get-oil-inventories"
]);
var LIVE_TOPIC_PUBLIC_SEARCH = "public=1";
var PUBLIC_SHARED_RPC_PATHS = /* @__PURE__ */ new Set([
  "/api/news/v1/list-feed-digest",
  "/api/displacement/v1/get-displacement-summary",
  "/api/displacement/v1/get-cross-border-movements",
  "/api/forecast/v1/get-forecasts",
  "/api/supply-chain/v1/get-chokepoint-status",
  ...LIVE_TOPIC_RPC_PATHS
]);
var NEWS_VARIANTS = /* @__PURE__ */ new Set(["full", "tech", "finance", "happy", "commodity", "energy"]);
var NEWS_LANGUAGES = /* @__PURE__ */ new Set([
  "en",
  "bg",
  "cs",
  "fr",
  "de",
  "el",
  "es",
  "hr",
  "hu",
  "it",
  "pl",
  "pt",
  "nl",
  "sv",
  "sw",
  "ru",
  "uk",
  "ar",
  "fa",
  "zh",
  "ja",
  "ko",
  "ro",
  "tr",
  "th",
  "vi",
  "hi"
]);
var NEWS_QUERY_KEYS = /* @__PURE__ */ new Set(["variant", "lang", "public"]);
var DISPLACEMENT_PUBLIC_SEARCH = "flow_limit=50&public=1";
var FORECASTS_PUBLIC_SEARCH = "public=1";
var CHOKEPOINT_STATUS_PUBLIC_SEARCH = "public=1";
function hasSingleValue(params, key) {
  return params.getAll(key).length === 1;
}
function stripRouterInjectedRpcEcho(url) {
  const raw = url.search.startsWith("?") ? url.search.slice(1) : url.search;
  if (!raw) return "";
  const segments = url.pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "";
  const echo = `rpc=${lastSegment}`;
  const parts = raw.split("&");
  const rpcParts = parts.filter((part) => part === "rpc" || part.startsWith("rpc="));
  if (rpcParts.length === 0) return raw;
  if (!rpcParts.every((part) => part === echo)) return raw;
  return parts.filter((part) => part !== echo).join("&");
}
function hasOnlyKeys(params, allowed) {
  return Array.from(params.keys()).every((key) => allowed.has(key));
}
function isNewsDigestShape(params) {
  return hasOnlyKeys(params, NEWS_QUERY_KEYS) && hasSingleValue(params, "variant") && hasSingleValue(params, "lang") && NEWS_VARIANTS.has(params.get("variant") ?? "") && NEWS_LANGUAGES.has(params.get("lang") ?? "");
}
function stripTrailingSlashes(value) {
  let end = value.length;
  while (end > 1 && value.charCodeAt(end - 1) === 47) end -= 1;
  return end === value.length ? value : value.slice(0, end);
}
function isPublicSharedRpcRequest(urlLike, method = "GET") {
  const normalizedMethod = method.toUpperCase();
  if (normalizedMethod !== "GET" && normalizedMethod !== "HEAD") return false;
  let url;
  try {
    url = urlLike instanceof URL ? urlLike : new URL(urlLike, "https://worldmonitor.invalid");
  } catch {
    return false;
  }
  const pathname = stripTrailingSlashes(url.pathname);
  if (!PUBLIC_SHARED_RPC_PATHS.has(pathname)) return false;
  const search = stripRouterInjectedRpcEcho(url);
  const params = new URLSearchParams(search);
  if (!hasSingleValue(params, "public") || params.get("public") !== "1") return false;
  if (pathname === "/api/news/v1/list-feed-digest") return isNewsDigestShape(params);
  if (pathname === "/api/displacement/v1/get-cross-border-movements") return search === "public=1";
  if (pathname === "/api/forecast/v1/get-forecasts") return search === FORECASTS_PUBLIC_SEARCH;
  if (pathname === "/api/supply-chain/v1/get-chokepoint-status") return search === CHOKEPOINT_STATUS_PUBLIC_SEARCH;
  if (LIVE_TOPIC_RPC_PATHS.includes(pathname)) return search === LIVE_TOPIC_PUBLIC_SEARCH;
  return search === DISPLACEMENT_PUBLIC_SEARCH;
}

// src/shared/pro-fresh-rpc.ts
var PRO_FRESH_CACHE_RPC_PATHS = /* @__PURE__ */ new Set([
  "/api/market/v1/list-market-quotes",
  "/api/market/v1/list-crypto-quotes",
  "/api/market/v1/list-commodity-quotes",
  "/api/market/v1/list-stablecoin-markets",
  "/api/market/v1/list-gulf-quotes"
]);

// api/_session.js
var SESSION_TTL_MS = 12 * 60 * 60 * 1e3;
var PREFIX = "wms_";
var enc = new TextEncoder();
function getSecret() {
  const s2 = process.env.WM_SESSION_SECRET;
  if (!s2 || s2.length < 32) {
    throw new Error("WM_SESSION_SECRET must be set (min 32 chars)");
  }
  return s2;
}
async function importHmacKey2() {
  return crypto.subtle.importKey(
    "raw",
    enc.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}
function bufferToBase64Url2(buf) {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function base64UrlToBytes(s2) {
  const pad = (4 - s2.length % 4) % 4;
  const b64 = (s2 + "=".repeat(pad)).replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
function base64UrlToString(s2) {
  const bytes = base64UrlToBytes(s2);
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
    key = await importHmacKey2();
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
  if (bufferToBase64Url2(providedBytes.buffer) !== sig) return false;
  const expected = new Uint8Array(expectedBuf);
  if (expected.length !== providedBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ providedBytes[i];
  if (diff !== 0) return false;
  let payload;
  try {
    payload = JSON.parse(base64UrlToString(body));
  } catch {
    return false;
  }
  if (typeof payload.exp !== "number") return false;
  if (!Number.isFinite(payload.exp)) return false;
  if (Date.now() >= payload.exp) return false;
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
async function timingSafeEqualSecret(candidate, expected) {
  if (!candidate || !expected) return false;
  return timingSafeIncludes(candidate, [expected]);
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

// server/gateway.ts
init_sentry_edge();

// server/_shared/entitlement-check.ts
init_redis();
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
function getRequiredTier(pathname) {
  return ENDPOINT_ENTITLEMENTS[pathname] ?? null;
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
function isBillingVerificationCode(value) {
  return value === "entitlement_verification_unavailable" || isBillingVerificationStatus(value);
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
function getBillingVerificationDenial(entitlements, corsHeaders, requiredTier) {
  const denial = classifyBillingVerification(entitlements);
  return denial ? renderBillingVerificationDenial(denial, corsHeaders, requiredTier) : null;
}
function renderBillingVerificationDenial(denial, corsHeaders, requiredTier) {
  return new Response(
    JSON.stringify({
      error: denial.message,
      code: denial.code,
      ...requiredTier == null ? {} : { requiredTier }
    }),
    {
      status: denial.status,
      headers: {
        // corsHeaders FIRST: the contract headers below are this function's own
        // output and must win. The pre-#5622 version was inconsistent about it
        // (a corsHeaders map could clobber X-Billing-Verification but not
        // Retry-After); no cors helper in the repo emits either name, so this is
        // inert today and pinned by test so it stays that way.
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Billing-Verification": denial.code,
        // Terminal denials carry no Retry-After — advertising one would invite
        // a lapsed subscriber into an infinite retry instead of a resubscribe.
        ...denial.retryable ? { "Retry-After": String(denial.retryAfterSeconds) } : {}
      }
    }
  );
}
async function checkEntitlementDetailed(userId, pathname, corsHeaders, options = {}) {
  const requiredTier = getRequiredTier(pathname);
  if (requiredTier === null) {
    return { response: null, entitlements: null };
  }
  if (!userId) {
    return {
      response: new Response(
        JSON.stringify({ error: "Authentication required", requiredTier }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      ),
      entitlements: null
    };
  }
  if (options.clerkRole === "pro" && requiredTier <= 1) {
    return { response: null, entitlements: null };
  }
  const ent = await getEntitlements(userId);
  if (!ent) {
    if (!isEntitlementBackendConfigured()) {
      return {
        response: renderBillingVerificationDenial(
          unverifiableEntitlementDenial(),
          corsHeaders,
          requiredTier
        ),
        entitlements: null
      };
    }
    return {
      response: new Response(
        JSON.stringify({ error: "Unable to verify entitlements", requiredTier }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      ),
      entitlements: null
    };
  }
  if (ent.features.tier >= requiredTier && hasCurrentEntitlementCoverage(ent)) {
    return { response: null, entitlements: ent };
  }
  const billingDenial = getBillingVerificationDenial(ent, corsHeaders, requiredTier);
  if (billingDenial) {
    return { response: billingDenial, entitlements: ent };
  }
  return {
    response: new Response(
      JSON.stringify({
        error: "Upgrade required",
        requiredTier,
        currentTier: ent.features.tier,
        planKey: ent.planKey
      }),
      {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    ),
    entitlements: ent
  };
}

// api/_upstash-json.js
function getKeyPrefix2() {
  const env = process.env.VERCEL_ENV;
  if (!env || env === "production") return "";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "dev";
  return `${env}:${sha}:`;
}
function applyRedisKeyPrefix(key) {
  const prefix = getKeyPrefix2();
  return prefix ? `${prefix}${key}` : key;
}
function getRedisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}
function normalizePipelineCommand2(command, raw) {
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
      body: JSON.stringify(commands.map((command) => normalizePipelineCommand2(command, raw))),
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

// api/_upstash-ratelimit.js
var modules = null;
function loadUpstashRatelimit() {
  modules ??= Promise.all([Promise.resolve().then(() => __toESM(require_dist2(), 1)), Promise.resolve().then(() => (init_nodejs(), nodejs_exports))]).then(([ratelimit2, redis]) => ({ Ratelimit: ratelimit2.Ratelimit, Redis: redis.Redis }));
  return modules;
}

// api/_api-key-rate-limit.js
var ENTERPRISE_API_RATE_LIMIT = 1e3;
var redisSingleton = null;
var burstLimiters = /* @__PURE__ */ new Map();
async function getRedis() {
  if (redisSingleton)
    return redisSingleton;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token)
    return null;
  const { Redis: Redis3 } = await loadUpstashRatelimit();
  redisSingleton = process.env.NODE_TEST_CONTEXT ? new Redis3({ url, token, retry: false }) : new Redis3({ url, token });
  return redisSingleton;
}
async function getBurstLimiter(perMinute) {
  const existing = burstLimiters.get(perMinute);
  if (existing)
    return existing;
  const redis = await getRedis();
  if (!redis)
    return null;
  const { Ratelimit: Ratelimit2 } = await loadUpstashRatelimit();
  const limiter = new Ratelimit2({
    redis,
    limiter: Ratelimit2.slidingWindow(perMinute, "60 s"),
    // Env-scope the prefix exactly like the daily meter (runRedisPipeline's
    // prefixKey) so a preview deployment sharing one Upstash database doesn't
    // consume/pollute the production burst namespace. Empty in production.
    prefix: `${getKeyPrefix2()}rl:apikey:min`,
    analytics: false
  });
  burstLimiters.set(perMinute, limiter);
  return limiter;
}
var lastBurstWarningAt;
function unavailableBurst(reason) {
  const now = Date.now();
  if (lastBurstWarningAt === void 0 || now - lastBurstWarningAt >= 6e4) {
    lastBurstWarningAt = now;
    console.warn("[api-key-rate-limit] burst unavailable", { reason });
  }
  return { ok: (
    /** @type {null} */
    null
  ), reason };
}
async function checkBurst(perMinute, identity) {
  try {
    const limiter = await getBurstLimiter(perMinute);
    if (!limiter)
      return unavailableBurst("not_configured");
    const { success, limit, reset, reason } = await limiter.limit(identity);
    if (reason === "timeout")
      return unavailableBurst("timeout");
    if (!success)
      return { ok: false, limit, reset };
    return { ok: true };
  } catch {
    return unavailableBurst("error");
  }
}
function apiKeyDailyKey(userId, date) {
  if (!userId)
    return "";
  const d = date ?? /* @__PURE__ */ new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `rl:apikey:day:${userId}:${yyyy}-${mm}-${dd}`;
}
var API_DAILY_TTL_SECONDS = 172800;
async function reserveDailyMeter(opts) {
  const { userId, allowance, pipeline, date } = opts;
  const noop = async () => {
  };
  const retryAfterSec = secondsUntilUtcMidnight(date);
  if (allowance <= 0) {
    return { count: 0, overLimit: false, metered: false, retryAfterSec, rollback: noop };
  }
  const key = apiKeyDailyKey(userId, date);
  if (!key) {
    return { count: 0, overLimit: false, metered: false, retryAfterSec, rollback: noop };
  }
  let pipeResult;
  try {
    pipeResult = await pipeline([
      ["INCR", key],
      ["EXPIRE", key, API_DAILY_TTL_SECONDS]
    ]);
  } catch {
    pipeResult = null;
  }
  if (!pipeResult || !Array.isArray(pipeResult) || pipeResult.length === 0) {
    return { count: 0, overLimit: false, metered: false, retryAfterSec, rollback: noop };
  }
  const incrRaw = pipeResult[0]?.result;
  const count = typeof incrRaw === "number" ? incrRaw : Number(incrRaw);
  if (!Number.isFinite(count) || count < 1) {
    return { count: 0, overLimit: false, metered: false, retryAfterSec, rollback: noop };
  }
  let rolledBack = false;
  const rollback = async () => {
    if (rolledBack)
      return;
    rolledBack = true;
    try {
      await pipeline([["DECR", key]]);
    } catch {
    }
  };
  return { count, overLimit: count > allowance, metered: true, retryAfterSec, rollback };
}
function rateLimitHeaders(opts) {
  const remaining = Math.max(0, opts.remaining);
  const resetSeconds = Math.max(0, Math.ceil((opts.resetMs - Date.now()) / 1e3));
  const windowSec = opts.windowSec ?? 60;
  return {
    // IETF RateLimit fields.
    "RateLimit-Policy": `"default";q=${opts.limit};w=${windowSec}`,
    "RateLimit-Limit": String(opts.limit),
    "RateLimit-Remaining": String(remaining),
    "RateLimit-Reset": String(resetSeconds),
    RateLimit: `"default";r=${remaining};t=${resetSeconds}`,
    // Legacy X-RateLimit-* retained for back-compat (Reset is epoch-ms).
    "X-RateLimit-Limit": String(opts.limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(opts.resetMs),
    "Retry-After": String(Math.max(1, opts.retryAfterSec))
  };
}
function secondsUntilUtcMidnight(now) {
  const d = now ?? /* @__PURE__ */ new Date();
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
  return Math.max(1, Math.ceil((next.getTime() - d.getTime()) / 1e3));
}

// server/_shared/api-key-rate-limit.ts
var ENTERPRISE_API_RATE_LIMIT2 = ENTERPRISE_API_RATE_LIMIT;
var checkBurst2 = checkBurst;
var reserveDailyMeter2 = reserveDailyMeter;
var rateLimitHeaders2 = rateLimitHeaders;
var secondsUntilUtcMidnight2 = secondsUntilUtcMidnight;

// server/error-mapper.ts
function isNetworkError(error) {
  if (!(error instanceof TypeError)) return false;
  const msg = error.message.toLowerCase();
  return msg.includes("fetch") || msg.includes("network") || msg.includes("connect") || msg.includes("econnrefused") || msg.includes("enotfound") || msg.includes("socket");
}
function jsonMessageResponse(message2, status, extras, headers) {
  return new Response(JSON.stringify({ message: message2, ...extras ?? {} }), {
    status,
    headers: { "Content-Type": "application/json", ...headers ?? {} }
  });
}
function jsonErrorResponse(message2, status, headers) {
  return new Response(JSON.stringify({ error: message2 }), {
    status,
    headers: { "Content-Type": "application/json", ...headers ?? {} }
  });
}
function getHttpResponseMetadata(error) {
  const metadata = error.httpResponseMetadata;
  return metadata?.envelope === "error" ? metadata : null;
}
function isValidRateLimitMetadata(metadata) {
  return Number.isFinite(metadata.limit) && metadata.limit > 0 && Number.isFinite(metadata.remaining) && metadata.remaining >= 0 && Number.isFinite(metadata.resetMs) && metadata.resetMs >= 0 && (metadata.windowSec === void 0 || Number.isFinite(metadata.windowSec) && metadata.windowSec > 0);
}
function mapErrorToResponse(error, _req) {
  if (error instanceof Error && "statusCode" in error) {
    const statusCode = error.statusCode;
    const httpResponseMetadata = getHttpResponseMetadata(error);
    const retryAfter = (statusCode === 429 || statusCode === 503) && "retryAfter" in error ? Number(error.retryAfter) : null;
    const billingCodeCandidate = "billingVerificationCode" in error ? error.billingVerificationCode : null;
    const billingVerificationCode = isBillingVerificationCode(billingCodeCandidate) ? billingCodeCandidate : null;
    const exposesRetryableUnavailable = statusCode === 503 && retryAfter != null && Number.isFinite(retryAfter) && (error.exposeMessage === true || httpResponseMetadata != null);
    const message2 = statusCode >= 400 && statusCode < 500 || exposesRetryableUnavailable ? error.message : "Internal server error";
    const extras = {};
    const headers = {};
    if (statusCode === 503) headers["Cache-Control"] = "no-store";
    if (retryAfter != null && Number.isFinite(retryAfter)) {
      extras.retryAfter = retryAfter;
      headers["Retry-After"] = String(retryAfter);
    }
    if (billingVerificationCode) {
      extras.code = billingVerificationCode;
      headers["X-Billing-Verification"] = billingVerificationCode;
    }
    if (statusCode === 429 && retryAfter != null && Number.isFinite(retryAfter) && httpResponseMetadata?.rateLimit && isValidRateLimitMetadata(httpResponseMetadata.rateLimit)) {
      Object.assign(headers, rateLimitHeaders2({
        ...httpResponseMetadata.rateLimit,
        retryAfterSec: retryAfter
      }));
    }
    if (statusCode >= 500) {
      const apiBody = "body" in error ? String(error.body).slice(0, 500) : "";
      console.error(`[error-mapper] ${statusCode}:`, error.message, apiBody ? `| body: ${apiBody}` : "");
    }
    if (httpResponseMetadata) {
      return jsonErrorResponse(
        message2,
        statusCode,
        Object.keys(headers).length > 0 ? headers : void 0
      );
    }
    return jsonMessageResponse(
      message2,
      statusCode,
      Object.keys(extras).length > 0 ? extras : void 0,
      Object.keys(headers).length > 0 ? headers : void 0
    );
  }
  if (error instanceof SyntaxError) {
    return jsonMessageResponse("Invalid request body", 400);
  }
  if (isNetworkError(error)) {
    console.error("[error-mapper] Network error (502):", error.message);
    return jsonMessageResponse("Upstream unavailable", 502);
  }
  console.error("[error-mapper] Unhandled error:", error instanceof Error ? error.message : error);
  return jsonMessageResponse("Internal server error", 500);
}

// server/_shared/rate-limit.ts
var import_ratelimit = __toESM(require_dist2(), 1);
init_nodejs();
init_client_ip();
init_sentry_edge();

// api/_rate-limit-fallback.js
var FALLBACK_REDIS_TIMEOUT_MS = 1e3;
var luaUnsupported = false;
function durationToSeconds(window) {
  const match = /^(\d+)\s?(ms|s|m|h|d)$/.exec(window);
  if (!match) throw new Error(`Unable to parse rate-limit window: ${window}`);
  const value = Number(match[1]);
  const unit = match[2] ?? "s";
  const unitSeconds = { ms: 1e-3, s: 1, m: 60, h: 3600, d: 86400 };
  return Math.max(1, Math.ceil(value * (unitSeconds[unit] ?? 1)));
}
function commandError(entry, command) {
  if (!entry?.error) return null;
  return new Error(`rate-limit fallback: ${command} failed: ${entry.error}`);
}
async function fixedWindowLimit(key, limit, windowSeconds) {
  const result = await redisPipeline([
    ["INCR", key],
    ["EXPIRE", key, String(windowSeconds), "NX"],
    ["TTL", key]
  ], FALLBACK_REDIS_TIMEOUT_MS, true);
  if (!result) throw new Error("rate-limit fallback: Redis pipeline unavailable");
  const incrError = commandError(result[0], "INCR");
  if (incrError) throw incrError;
  const expireError = commandError(result[1], "EXPIRE");
  if (expireError) throw expireError;
  const ttlError = commandError(result[2], "TTL");
  if (ttlError) throw ttlError;
  const count = Number(result[0]?.result ?? 0);
  if (!Number.isFinite(count) || count < 1) {
    throw new Error(`rate-limit fallback: invalid Redis counter (${String(result[0]?.result)})`);
  }
  const ttlRaw = Number(result[2]?.result ?? -1);
  if (!Number.isFinite(ttlRaw) || ttlRaw < 0) {
    throw new Error(`rate-limit fallback: Redis key has no expiry (ttl=${String(result[2]?.result ?? "missing")})`);
  }
  return { success: count <= limit, limit, reset: Date.now() + ttlRaw * 1e3 };
}
async function limitWithFallback(rl, identifier, fallbackKey, limit, windowSeconds) {
  if (!luaUnsupported) {
    try {
      return await rl.limit(identifier);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!/Command not allowed: (EVAL|EVALSHA|SCRIPT)\b/i.test(msg)) throw err;
      luaUnsupported = true;
      console.warn("[rate-limit] EVAL/EVALSHA rejected by this Redis endpoint \u2014 switching to the non-Lua fixed-window fallback for the rest of this process");
    }
  }
  try {
    return await fixedWindowLimit(fallbackKey, limit, windowSeconds);
  } catch (err) {
    throw new Error("rate-limit fallback: Redis unavailable", { cause: err });
  }
}

// server/_shared/rate-limit.ts
init_client_ip();
var REDIS_TEST_RETRY_OPTS = process.env.NODE_TEST_CONTEXT ? { retry: false } : {};
var ENDPOINT_RATE_LIMIT_TIMEOUT_MS = process.env.NODE_TEST_CONTEXT ? 250 : 5e3;
var ENDPOINT_REDIS_ABORT_TIMEOUT_MS = process.env.NODE_TEST_CONTEXT ? 20 : 4500;
var __ENDPOINT_LIMITER_DEADLINES_FOR_TEST = Object.freeze({
  decisionMs: ENDPOINT_RATE_LIMIT_TIMEOUT_MS,
  abortMs: ENDPOINT_REDIS_ABORT_TIMEOUT_MS
});
var ratelimit = null;
var GLOBAL_RATE_LIMIT = 600;
var GLOBAL_RATE_WINDOW = "60 s";
var GLOBAL_RATE_WINDOW_SECONDS = durationToSeconds(GLOBAL_RATE_WINDOW);
function getRatelimit() {
  if (ratelimit) return ratelimit;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  ratelimit = new import_ratelimit.Ratelimit({
    redis: new Redis2({ url, token, ...REDIS_TEST_RETRY_OPTS }),
    limiter: import_ratelimit.Ratelimit.slidingWindow(GLOBAL_RATE_LIMIT, GLOBAL_RATE_WINDOW),
    prefix: "rl",
    analytics: false
  });
  return ratelimit;
}
function rateLimitErrorLevel(stage, msg) {
  if (stage.includes("missing-config")) return "error";
  if (/Error running script|execution timed out|Command failed|ETIMEDOUT|ECONNRESET|ENOTFOUND|fetch failed|network|timed out|aborted due to timeout|TimeoutError|socket hang up|Redis unavailable|Redis unreachable/i.test(msg)) {
    return "warning";
  }
  return "error";
}
var RATE_LIMIT_SENTRY_DEDUP_MS = 6e4;
var lastRateLimitSentryCaptureAt = /* @__PURE__ */ new Map();
var RATE_LIMIT_FINGERPRINT_SUFFIXES = /* @__PURE__ */ new Set(["missing-config", "timeout", "edge-proof"]);
function rateLimitFingerprintStage(stage) {
  const parts = String(stage ?? "").split(":");
  const head = parts[0] || "rate-limit";
  const last = (parts.length > 1 ? parts[parts.length - 1] : "") ?? "";
  return RATE_LIMIT_FINGERPRINT_SUFFIXES.has(last) ? `${head}:${last}` : head;
}
function reportRateLimitDegraded(stage, err, surface = "server") {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[rate-limit] redis-error stage=${stage} msg=${msg}`);
  const now = Date.now();
  const lastCaptureAt = lastRateLimitSentryCaptureAt.get(stage);
  if (lastCaptureAt !== void 0 && now - lastCaptureAt < RATE_LIMIT_SENTRY_DEDUP_MS) return;
  lastRateLimitSentryCaptureAt.set(stage, now);
  captureSilentError(err, {
    tags: { surface, component: "rate-limit", stage },
    fingerprint: ["rate-limit", "redis-error", rateLimitFingerprintStage(stage)],
    level: rateLimitErrorLevel(stage, msg)
  });
}
var scopedMissingConfigStages = /* @__PURE__ */ new Set();
function logScopedRateLimitMissingConfig(scope) {
  const stage = `checkScopedRateLimit:${scope}:missing-config`;
  if (scopedMissingConfigStages.has(stage)) return;
  scopedMissingConfigStages.add(stage);
  reportRateLimitDegraded(stage, new Error("UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN missing"));
}
var EDGE_PROOF_RATE_LIMIT_LATCH = /* @__PURE__ */ Symbol.for("worldmonitor.rate-limit.edge-proof-reported.v1");
function reportEdgeProofRequiredOnce(stage, err) {
  const existing = Reflect.get(globalThis, EDGE_PROOF_RATE_LIMIT_LATCH);
  const latch = existing ?? { reported: false };
  if (!existing) Reflect.set(globalThis, EDGE_PROOF_RATE_LIMIT_LATCH, latch);
  if (latch.reported) return;
  latch.reported = true;
  reportRateLimitDegraded(stage, err);
}
var RATE_LIMIT_DEGRADED_HEADERS = {
  "X-RateLimit-Mode": "degraded",
  // Short Retry-After encourages clients to retry once the limiter is back,
  // rather than treating the 503 as a hard outage.
  "Retry-After": "5"
};
function tooManyRequestsResponse(limit, reset, corsHeaders, windowSeconds) {
  const resetSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1e3));
  return new Response(JSON.stringify({ error: "Too many requests" }), {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      // IETF RateLimit fields (draft-ietf-httpapi-ratelimit-headers). The
      // combined RateLimit member references the "default" policy advertised on
      // every API response via vercel.json so agents can self-throttle. Mirrors
      // api/_rate-limit.js.
      "RateLimit-Policy": `"default";q=${limit};w=${windowSeconds}`,
      "RateLimit-Limit": String(limit),
      "RateLimit-Remaining": "0",
      "RateLimit-Reset": String(resetSeconds),
      RateLimit: `"default";r=0;t=${resetSeconds}`,
      // Legacy X-RateLimit-* retained for back-compat (Reset is epoch-ms).
      "X-RateLimit-Limit": String(limit),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(reset),
      "Retry-After": String(resetSeconds),
      ...corsHeaders
    }
  });
}
function rateLimitDegradedResponse(corsHeaders) {
  return new Response(JSON.stringify({ error: "Rate-limit service temporarily unavailable" }), {
    status: 503,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...RATE_LIMIT_DEGRADED_HEADERS,
      ...corsHeaders
    }
  });
}
function edgeProofRequiredResponse(corsHeaders) {
  return new Response(JSON.stringify({ error: "Cloudflare edge proof required" }), {
    status: 403,
    headers: {
      "Content-Type": "application/json",
      "X-RateLimit-Mode": "edge-proof",
      "Cache-Control": "no-store",
      ...corsHeaders
    }
  });
}
function checkIpScopedEdgeProof(request, corsHeaders) {
  if (!hasUnprovenCloudflareClientIp(request)) return null;
  reportEdgeProofRequiredOnce(
    "ip-scoped:edge-proof",
    new Error("Cloudflare client IP arrived without a valid x-wm-edge-proof")
  );
  return edgeProofRequiredResponse(corsHeaders);
}
var TRUSTED_RATE_LIMIT_PRINCIPAL_HEADER = "x-wm-rl-principal";
function formatTrustedRateLimitPrincipal(principalUserId, scope) {
  return `${scope}:${principalUserId}`;
}
var SUB_REQUEST_UNATTRIBUTED_172_16_12_PREFIXES = Object.freeze([
  "172.16.",
  "172.17.",
  "172.18.",
  "172.19.",
  "172.20.",
  "172.21.",
  "172.22.",
  "172.23.",
  "172.24.",
  "172.25.",
  "172.26.",
  "172.27.",
  "172.28.",
  "172.29.",
  "172.30.",
  "172.31."
]);
var SUB_REQUEST_UNATTRIBUTED_IP_PREFIXES = Object.freeze([
  "10.",
  ...SUB_REQUEST_UNATTRIBUTED_172_16_12_PREFIXES,
  "192.168.",
  "169.254."
]);
function getPrincipalRateLimitIdentifier(principalUserId, scope = "session") {
  if (!principalUserId) return null;
  return scope === "api_key" ? `apikey-user:${principalUserId}` : `user:${principalUserId}`;
}
async function checkRateLimit(request, corsHeaders, opts = {}) {
  const proofDenied = !opts.principalUserId && checkIpScopedEdgeProof(request, corsHeaders);
  if (proofDenied) return proofDenied;
  const rl = getRatelimit();
  if (!rl) {
    if (opts.failClosed) {
      reportRateLimitDegraded("checkRateLimit:missing-config", new Error("Upstash Redis is not configured"));
      return rateLimitDegradedResponse(corsHeaders);
    }
    return null;
  }
  const identifier = getPrincipalRateLimitIdentifier(opts.principalUserId, opts.principalScope) ?? getClientRateLimitKey(request);
  try {
    const { success, limit, reset, reason } = await limitWithFallback(
      rl,
      identifier,
      `rl:fw:${identifier}`,
      GLOBAL_RATE_LIMIT,
      GLOBAL_RATE_WINDOW_SECONDS
    );
    if (reason === "timeout") throw new Error("rate-limit decision timed out");
    if (!success) {
      return tooManyRequestsResponse(limit, reset, corsHeaders, GLOBAL_RATE_WINDOW_SECONDS);
    }
    return null;
  } catch (err) {
    reportRateLimitDegraded("checkRateLimit", err);
    if (opts.failClosed) return rateLimitDegradedResponse(corsHeaders);
    return null;
  }
}
var ENDPOINT_RATE_POLICIES = {
  "/api/scorecard/v1/get-five-factor-scorecard": { limit: 30, window: "60 s" },
  "/api/scorecard/v1/get-bloc-scorecard": { limit: 30, window: "60 s" },
  "/api/scorecard/v1/list-five-factor-scorecards": { limit: 30, window: "60 s" },
  // #9094 /verify fact-check lookup: public, and a cache miss spends the
  // Google Fact Check Tools API quota.
  "/api/news/v1/search-fact-checks": { limit: 20, window: "60 s" },
  // /verify claim search: public; a cache miss reads every feed cache.
  "/api/news/v1/search-claim-headlines": { limit: 30, window: "60 s" },
  "/api/aviation/v1/track-aircraft": { limit: 30, window: "60 s" },
  "/api/aviation/v1/list-aircraft-emergencies": { limit: 20, window: "60 s" },
  "/api/aviation/v1/search-google-flights": { limit: 30, window: "60 s" },
  "/api/aviation/v1/search-google-dates": { limit: 10, window: "60 s" },
  "/api/aviation/v1/list-aviation-news": { limit: 30, window: "60 s" },
  // Public YouTube video lookups call oEmbed on cache misses (channel live
  // detection is retired) and keep their own fail-closed gateway budget.
  "/api/aviation/v1/get-youtube-live-stream-info": { limit: 30, window: "60 s" },
  // Interactive fare searches use one provider request on a cache miss.
  // 30/min leaves headroom under the provider's 300-600/min shared quota.
  "/api/aviation/v1/search-flight-prices": { limit: 30, window: "60 s" },
  // LLM article summarization is Pro-gated, but still needs a scoped,
  // fail-closed budget so Redis degradation cannot silently lift the
  // per-endpoint spend control.
  "/api/news/v1/list-feed-digest": { limit: 30, window: "60 s" },
  "/api/news/v1/summarize-article": { limit: 30, window: "60 s" },
  "/api/news/v1/summarize-article-cache": { limit: 3e3, window: "60 s" },
  "/api/intelligence/v1/classify-event": { limit: 600, window: "60 s" },
  // Full Telegram bodies match the first-party feed's 60/min ceiling. Anonymous
  // sessions remain IP-scoped; verified paid principals retain user identity.
  // The endpoint registry fails closed so outages cannot lift this cap.
  "/api/intelligence/v1/list-telegram-feed": { limit: 60, window: "60 s" },
  // LLM-backed situational deduction (imports callLlmReasoning) can drive
  // provider spend on cache misses, so it must fail closed on Redis outage
  // rather than inherit the global fail-open fallback. Mirror the sibling
  // classify-event budget (same limit/window) — both are AI-backed Intelligence
  // RPCs. (#4676)
  "/api/intelligence/v1/deduct-situation": { limit: 600, window: "60 s" },
  // Historical intelligence memory (#5694): both semantic routes embed the
  // caller's free text through the OpenRouter embeddings API on every cache
  // miss, so they are provider-backed spend, not pure reads. They are also
  // premium-gated, which means the gateway serves them with no CDN cache — a
  // The three intel-history reads. All are Pro-gated and reach the function on
  // every request, but they spend two different budgets, so they are sized
  // against two different ceilings.
  //
  // search + similar-events each embed their input on a paid provider. They
  // share ONE budget while the registry is keyed per PATH, so a caller
  // alternating them gets the sum, not the cap — 30/min each holds the
  // combined worst case at the 60/min per-principal embeddings bill this is
  // sized for. Still generous for interactive use (a search plus follow-ups),
  // and far under the LLM routes' 600/min because nothing here runs in a
  // page-load fan-out.
  //
  // timeline embeds nothing, which is why it originally carried no policy at
  // all. That reasoning was right about money and wrong about the resource
  // that actually scales with retention: Convex reads whole documents, and
  // every intelHistory row carries a 512-float embedding the projection
  // immediately discards. One limit=200 call scoped by both domain and
  // country scans TIMELINE_MAX_SCAN=800 rows (4x over-fetch for the
  // post-filter) — roughly 3MB of Convex read budget, which the 600/min
  // availability-first fallback did not bound. 120/min keeps a timeline read
  // comfortable while capping that worst case.
  "/api/intelligence/v1/search-intel-history": { limit: 30, window: "60 s" },
  "/api/intelligence/v1/get-similar-events": { limit: 30, window: "60 s" },
  "/api/intelligence/v1/get-intel-timeline": { limit: 120, window: "60 s" },
  "/api/intelligence/v1/get-country-history": { limit: 60, window: "60 s" },
  // Batch humanitarian-summary fans out to the external HAPI (humdata) provider
  // on cache miss — up to 25 countries per request, 5 concurrent upstream
  // fetches. Batch aircraft-details fans out to the external Wingbits provider —
  // up to 10 ICAO24 lookups per request. Both proxy external providers, so keep
  // them at the same 30/min budget as the other provider-proxy routes
  // (sanctions lookup / resilience ranking); conservative because a single
  // request already amplifies into many upstream calls. (#4676)
  "/api/conflict/v1/get-humanitarian-summary-batch": { limit: 30, window: "60 s" },
  // Single aircraft-details is a caller-controlled Wingbits lookup. Keep it
  // aligned with the batch sibling so cache misses cannot become an unlimited
  // paid-provider probe under anonymous or rotating callers.
  "/api/military/v1/get-aircraft-details": { limit: 30, window: "60 s" },
  "/api/military/v1/get-aircraft-details-batch": { limit: 30, window: "60 s" },
  // Webcam image resolution proxies Windy on a caller-controlled cache miss.
  // Keep it at the standard provider-proxy budget instead of the global fallback.
  "/api/webcam/v1/get-webcam-image": { limit: 30, window: "60 s" },
  // Live lookups can fan out to position, schedule and photo providers.
  "/api/military/v1/get-wingbits-live-flight": { limit: 30, window: "60 s" },
  "/api/imagery/v1/search-imagery": { limit: 30, window: "60 s" },
  // Generic batch fan-out: one request re-dispatches up to 20 gateway GETs, so
  // cap the multiplier at the same 30/min budget as the other batch routes.
  "/api/batch/v1/execute": { limit: 30, window: "60 s" },
  // Legacy /api/sanctions-entity-search rate limit was 30/min per IP. Preserve
  // that budget now that LookupSanctionEntity proxies OpenSanctions live.
  "/api/sanctions/v1/lookup-sanction-entity": { limit: 30, window: "60 s" },
  // Corporate intelligence (#5695): each cache miss proxies SEC EDGAR and/or
  // Finnhub on the caller's behalf, and the per-company inputs are effectively
  // unbounded (any ticker/name/domain), so these cannot inherit the fail-open
  // global fallback. Same 30/min provider-proxy budget as the sanctions lookup
  // and batch fan-out routes above.
  // Country coverage (#7526) fans out per cache miss to two Google News RSS
  // feeds plus a live military-flights path and an ACLED window whose cache key
  // moves with the clock, so the miss rate is high. Same shape as the sibling
  // provider-proxy routes above; it must not inherit the global fail-open
  // budget on a Redis outage.
  "/api/intelligence/v1/get-country-coverage": { limit: 30, window: "60 s" },
  "/api/intelligence/v1/get-company-enrichment": { limit: 30, window: "60 s" },
  "/api/intelligence/v1/list-company-signals": { limit: 30, window: "60 s" },
  "/api/intelligence/v1/search-sec-filings": { limit: 30, window: "60 s" },
  // Public market/economic provider proxies (#6236): caller-controlled symbols,
  // indicators, and year ranges create unbounded cache-key cardinality; the
  // country-index and price-history routes are bounded to their tracked
  // symbol sets but still proxy Yahoo Finance on a cache miss. None may inherit the global
  // fail-open budget. The dashboard can legitimately fan out across 50 Pro
  // watchlist symbols, so those three per-symbol routes admit one full load
  // plus headroom. analyze-stock remains separately constrained by the
  // fail-closed per-user daily direct-LLM quota. backtest-stock is technical
  // only, so its cache-miss Yahoo fetches use a separate per-user daily
  // provider-work budget (`provider:backtest-yahoo:*`) instead of
  // `llm:direct-usage`.
  "/api/market/v1/analyze-stock": { limit: 60, window: "60 s" },
  "/api/market/v1/backtest-stock": { limit: 60, window: "60 s" },
  "/api/market/v1/get-insider-transactions": { limit: 60, window: "60 s" },
  "/api/market/v1/get-country-stock-index": { limit: 30, window: "60 s" },
  "/api/market/v1/get-price-history": { limit: 30, window: "60 s" },
  // Stablecoins are seed-backed for the DEFAULT request, but naming coins the
  // snapshot does not carry reaches CoinGecko, and the caller picks the IDs —
  // unbounded cardinality, so the per-ID-set cache cannot bound spend alone.
  //
  // Sized against the dashboard, not the provider: this path is in
  // PRO_FRESH_CACHE_RPC_PATHS, so it carries a panel that refreshes on a timer
  // for every open dashboard, and the limit is per-IP for anonymous traffic —
  // one office NAT is one bucket. 60/min matches the sibling per-symbol market
  // routes, which are likewise sized to admit a full legitimate load plus
  // headroom rather than to price the upstream call.
  //
  // Note this makes the route fail closed on a Redis outage, which the four
  // other panels in PRO_FRESH_CACHE_RPC_PATHS are not. That is survivable
  // because the handler cannot serve data during that outage either (the seed
  // read is the same Redis) — and it deliberately performs no provider work
  // when that read fails, so the fail-closed 503 is a second line, not the
  // only thing standing between a Redis outage and a CoinGecko fan-out. (#6308)
  "/api/market/v1/list-stablecoin-markets": { limit: 60, window: "60 s" },
  "/api/market/v1/list-crypto-quotes": { limit: 60, window: "60 s" },
  "/api/economic/v1/list-world-bank-indicators": { limit: 30, window: "60 s" },
  // #6305: list-market-quotes stopped being a pure seed read. The fixed seed
  // still answers the default universe with no upstream call, but a symbol the
  // seed does not carry (a custom watchlist ticker) now resolves through the
  // bounded, Redis-cached Finnhub gap fetch — so caller-controlled symbols can
  // reach a paid provider and this route can no longer inherit the fail-open
  // global budget. Same 60/min as the sibling per-symbol market routes: the
  // dashboard issues one multi-symbol call per refresh and the response is
  // CDN-cached (medium tier), so 60/min is far above any legitimate per-IP
  // load. Provider spend is separately capped at MARKET_QUOTES_UPSTREAM_LIMIT
  // lookups per request.
  "/api/market/v1/list-market-quotes": { limit: 60, window: "60 s" },
  // Company Monitoring is contract-only and remains unrouted until #6003
  // passes, but generated mutation routes still need a fail-closed policy
  // before any later lane can wire them. Import can carry 100 rows, so keep its
  // request budget lower than the single-company mutations.
  "/api/company-monitoring/v1/create-monitored-company": { limit: 30, window: "60 s" },
  "/api/company-monitoring/v1/update-monitored-company": { limit: 30, window: "60 s" },
  "/api/company-monitoring/v1/set-monitored-company-state": { limit: 30, window: "60 s" },
  "/api/company-monitoring/v1/import-monitored-company-batch": { limit: 10, window: "60 s" },
  // Lead capture: preserve the 3/hr and 5/hr budgets from legacy api/contact.js
  // and api/register-interest.js. Lower limits than normal IP rate limit since
  // these hit Convex + Resend per request.
  "/api/leads/v1/submit-contact": { limit: 3, window: "1 h" },
  "/api/leads/v1/register-interest": { limit: 5, window: "1 h" },
  // #9093 reader error reports: anonymous writes to the review queue.
  "/api/news/v1/submit-error-report": { limit: 5, window: "1 h" },
  // #9093 /trust page read: public and CDN-cached, bounded per IP.
  "/api/news/v1/list-label-changes": { limit: 60, window: "60 s" },
  // Operator review: secret-gated, but still bounded against secret guessing.
  "/api/news/v1/list-error-reports": { limit: 60, window: "60 s" },
  "/api/news/v1/review-error-report": { limit: 60, window: "60 s" },
  // Scenario engine: legacy /api/scenario/v1/run capped at 10 jobs/min/IP via
  // inline Upstash INCR. Gateway preserves the same budget while using a
  // trusted paid-user principal when available, otherwise the client IP.
  "/api/scenario/v1/run-scenario": { limit: 10, window: "60 s" },
  // #3734: trigger-simulation PRO endpoint, same shape as run-scenario.
  // It follows the same trusted-principal-or-IP attribution contract.
  "/api/forecast/v1/trigger-simulation": { limit: 10, window: "60 s" },
  // Live tanker map (Energy Atlas): one user with 6 chokepoints × 1 call/min
  // = 6 req/min/IP base load. 60/min headroom covers tab refreshes + zoom
  // pans within a single user without flagging legitimate traffic.
  "/api/maritime/v1/get-vessel-snapshot": { limit: 60, window: "60 s" },
  // Country Resilience ranking can synchronously warm the full country table
  // on cold/stale cache paths; keep it well below the global 600/min fallback.
  "/api/resilience/v1/get-resilience-ranking": { limit: 30, window: "60 s" },
  // Indicator drill-down fans out across the full scorer source graph on a
  // cold per-country cache miss. Match the MCP minute ceiling and fail closed.
  "/api/resilience/v1/get-resilience-indicators": { limit: 60, window: "60 s" },
  // #3805 / PR #3821: MCP proxy is a top-level Vercel Edge Function in
  // `api/mcp-proxy.ts` (registered as `external-protocol` in
  // api/api-route-exceptions.json — JSON-RPC shape dictated by the MCP spec),
  // so it does NOT flow through the gateway and `checkEndpointRateLimit`
  // never fires for it. The handler reads this policy and enforces it
  // in-handler via `checkScopedRateLimit` — keeping the registry as the
  // single source of truth so future audit additions (and the
  // enforce-rate-limit-policies lint) see the endpoint. The audit script
  // resolves edge-function paths via api/api-route-exceptions.json instead
  // of the OpenAPI specs.
  "/api/mcp-proxy": { limit: 30, window: "60 s" },
  // Docs MCP facade (`api/docs-mcp.ts`, external-protocol exception — serves
  // /docs/mcp, proxying the Mintlify docs MCP server and lifting its
  // protocol-level tool-call failures into proper JSON-RPC error objects).
  // Anonymous by design (upstream is fully public), so the per-IP minute
  // limit is the whole abuse defence; 60/min mirrors the MCP public-method
  // posture. Enforced in-handler via `checkScopedRateLimit`, same pattern as
  // /api/mcp-proxy.
  "/api/docs-mcp": { limit: 60, window: "60 s" },
  // A2A concierge endpoint (`api/a2a.ts`, external-protocol exception —
  // JSON-RPC shape dictated by the A2A spec, served at /a2a). Anonymous and
  // quota-free by design (routes over the public tool catalog + public
  // freshness envelope only), so the per-IP minute limit is the whole abuse
  // defence; 60/min mirrors the MCP public-method posture. Enforced
  // in-handler via `checkScopedRateLimit`, same pattern as /api/mcp-proxy.
  "/api/a2a": { limit: 60, window: "60 s" },
  // NLWeb /ask endpoint (`api/ask.ts`, external-protocol exception — request/
  // response shape dictated by the NLWeb spec, served at /ask). Same anonymous
  // cheap-catalog posture as /api/a2a, same in-handler enforcement.
  "/api/ask": { limit: 60, window: "60 s" },
  // Agent-skills import proxy (`api/skills/fetch-agentskills.ts`, registered
  // as `migration-pending` in api/api-route-exceptions.json). Fetches one
  // skill definition from a fixed three-host allowlist on agentskills.io.
  // Anonymous by design (the settings importer calls it same-origin before
  // the user has done anything privileged), so the per-IP minute limit is the
  // whole abuse defence; 30/min is the provider-proxy budget above, and the
  // handler also caches the fetched payload so repeat imports never leave our
  // edge. Enforced in-handler via `checkScopedRateLimit`, same pattern as
  // /api/docs-mcp. (#6234)
  "/api/skills/fetch-agentskills": { limit: 30, window: "60 s" },
  // Legacy `api/*.js` provider proxies (`api/youtube/live.js`,
  // `api/reverse-geocode.js`), both registered in
  // api/api-route-exceptions.json. Neither flows through the gateway, and
  // AGENTS.md forbids `api/*.js` from importing `../server/`, so unlike
  // /api/mcp-proxy they cannot read this registry at runtime: each handler
  // carries the same numbers as literal constants and enforces them with
  // `checkRateLimit` from `api/_rate-limit.js`. The registry stays the single
  // source of truth for the audit script and the docs, and
  // tests/rate-limit.test.mts fails if the two copies drift. (#6234)
  //
  // youtube/live: a video lookup calls youtube.com oEmbed from our egress IPs
  // (channel live detection answers 410 without upstream work), so it keeps
  // the same 30/min provider-proxy budget as the batch fan-out routes above.
  "/api/youtube/live": { limit: 30, window: "60 s" },
  // reverse-geocode: already Upstash-cached on a 0.001-degree grid and memoized
  // per cell in the browser (src/utils/reverse-geocode.ts), so 60/min is a
  // per-caller floor against scripted coordinate sweeps rather than a throttle
  // on real map use. Nominatim's usage policy is the strictest in our stack and
  // is enforced by egress-IP ban, and there are two callers sharing one egress:
  // the legacy `api/reverse-geocode.js` edge function (which carries these
  // same numbers as literal constants and enforces them in-handler via
  // checkRateLimit — api/*.js cannot import ../server/) and the gateway RPC
  // below. Both use the shared `geocode:` cache namespace (604800 s TTL), so
  // a hit on either serves the other. Cache misses also pass through one
  // fail-closed provider-wide bucket, `rl:scope:reverse-geocode:global`, capped
  // at 1 request/second across both handlers. (#6234, #6432, #7279)
  "/api/reverse-geocode": { limit: 60, window: "60 s" },
  // Gateway reverse-geocode RPC (#6432): the second Nominatim caller. Same
  // provider, same shared 0.001-degree grid cache, same egress IPs — must carry
  // the same 60/min budget as the legacy edge route, and it now does. Both are
  // per-IP budgets. After a shared-cache miss, each handler also applies the
  // same fail-closed `reverse-geocode:global` scoped bucket at 1 request/second
  // before Nominatim. Redis outage therefore 503s instead of inheriting a
  // fail-open path that could expose the provider to unbounded aggregate load.
  "/api/infrastructure/v1/reverse-geocode": { limit: 60, window: "60 s" },
  // Partner embed entitlement (#6599): keyed panels look up wm_ keys in Convex.
  // Cap per-IP so a stolen snippet cannot amplify validation traffic.
  "/api/embed/entitlement": { limit: 60, window: "60 s" },
  // Grant exchange: validates a wme_ key in Convex, so it amplifies the same
  // way the entitlement lookup does. A frame mints once per 30-minute grant,
  // which leaves this budget almost entirely as headroom for shared egress IPs.
  "/api/embed/session": { limit: 60, window: "60 s" },
  // Partner map frame. Public traffic uses the client IP; a verified grant uses
  // its account owner so every display for one partner shares the same budget.
  // The CDN absorbs most canonical public requests before this policy runs.
  "/api/embed/map-frame": { limit: 120, window: "60 s" },
  // Widget agent is a top-level edge proxy (api/widget-agent.ts) that spends a
  // frontier-model call on every POST. It does not flow through the gateway, so
  // the handler enforces this budget in-process, keyed on the validated
  // user/key identity rather than the edge egress IP. 20/hour matches the
  // relay's pro bucket; basic callers are still capped tighter on the relay.
  "/api/widget-agent": { limit: 20, window: "1 h" },
  // Checkout session creation (api/create-checkout.ts) relays to Dodo. Same
  // per-user 5/min fail-closed budget as the customer portal, enforced
  // in-handler after JWT validation. A Redis outage must not lift it.
  "/api/create-checkout": { limit: 5, window: "60 s" }
};
var endpointLimiters = /* @__PURE__ */ new Map();
function getEndpointRatelimit(pathname) {
  const policy = ENDPOINT_RATE_POLICIES[pathname];
  if (!policy) return null;
  const cached = endpointLimiters.get(pathname);
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const rl = new import_ratelimit.Ratelimit({
    redis: new Redis2({
      url,
      token,
      ...REDIS_TEST_RETRY_OPTS,
      signal: () => AbortSignal.timeout(ENDPOINT_REDIS_ABORT_TIMEOUT_MS)
    }),
    limiter: import_ratelimit.Ratelimit.slidingWindow(policy.limit, policy.window),
    prefix: "rl:ep",
    analytics: false,
    timeout: ENDPOINT_RATE_LIMIT_TIMEOUT_MS
  });
  endpointLimiters.set(pathname, rl);
  return rl;
}
function hasEndpointRatePolicy(pathname) {
  return pathname in ENDPOINT_RATE_POLICIES;
}
var nativeGoogleDatesAdmissions = [];
var nativeGoogleFlightsAdmissions = [];
var nativeAviationNewsAdmissions = [];
async function checkEndpointRateLimit(request, pathname, corsHeaders, opts = {}) {
  if (!hasEndpointRatePolicy(pathname)) return null;
  if ((pathname === "/api/aviation/v1/search-google-dates" || pathname === "/api/aviation/v1/search-google-flights") && process.env.LOCAL_API_MODE === "tauri-sidecar") {
    const policy2 = ENDPOINT_RATE_POLICIES[pathname];
    const windowSeconds = durationToSeconds(policy2.window);
    const now = Date.now();
    const admissions = pathname === "/api/aviation/v1/search-google-dates" ? nativeGoogleDatesAdmissions : nativeGoogleFlightsAdmissions;
    const activeAdmissions = admissions.filter((time) => time > now - windowSeconds * 1e3);
    if (activeAdmissions.length >= policy2.limit) {
      return tooManyRequestsResponse(policy2.limit, activeAdmissions[0] + windowSeconds * 1e3, corsHeaders, windowSeconds);
    }
    activeAdmissions.push(now);
    if (pathname === "/api/aviation/v1/search-google-dates") nativeGoogleDatesAdmissions = activeAdmissions;
    else nativeGoogleFlightsAdmissions = activeAdmissions;
    return null;
  }
  if (pathname === "/api/aviation/v1/list-aviation-news" && process.env.LOCAL_API_MODE === "tauri-sidecar") {
    const policy2 = ENDPOINT_RATE_POLICIES[pathname];
    const windowSeconds = durationToSeconds(policy2.window);
    const now = Date.now();
    nativeAviationNewsAdmissions = nativeAviationNewsAdmissions.filter((time) => time > now - windowSeconds * 1e3);
    if (nativeAviationNewsAdmissions.length >= policy2.limit) {
      return tooManyRequestsResponse(policy2.limit, nativeAviationNewsAdmissions[0] + windowSeconds * 1e3, corsHeaders, windowSeconds);
    }
    nativeAviationNewsAdmissions.push(now);
    return null;
  }
  const proofDenied = !opts.principalUserId && checkIpScopedEdgeProof(request, corsHeaders);
  if (proofDenied) return proofDenied;
  const rl = getEndpointRatelimit(pathname);
  if (!rl) {
    const failClosed = opts.failClosed ?? true;
    if (failClosed) {
      reportRateLimitDegraded(`checkEndpointRateLimit:${pathname}:missing-config`, new Error("Upstash Redis is not configured"));
      return rateLimitDegradedResponse(corsHeaders);
    }
    return null;
  }
  const identifier = getPrincipalRateLimitIdentifier(opts.principalUserId, opts.principalScope) ?? `ip:${getClientRateLimitKey(request)}`;
  const policy = ENDPOINT_RATE_POLICIES[pathname];
  if (!policy) return null;
  try {
    const result = await limitWithFallback(rl, `${pathname}:${identifier}`, `rl:ep:fw:${pathname}:${identifier}`, policy.limit, durationToSeconds(policy.window));
    if (result.reason === "timeout") {
      throw new Error("Upstash endpoint rate-limit decision timed out");
    }
    const { success, limit, reset } = result;
    if (!success) {
      return tooManyRequestsResponse(limit, reset, corsHeaders, durationToSeconds(policy.window));
    }
    return null;
  } catch (err) {
    reportRateLimitDegraded(`checkEndpointRateLimit:${pathname}`, err);
    const failClosed = opts.failClosed ?? true;
    if (failClosed) return rateLimitDegradedResponse(corsHeaders);
    return null;
  }
}
var scopedLimiters = /* @__PURE__ */ new Map();
function getScopedRatelimit(scope, limit, window) {
  const cacheKey = `${scope}|${limit}|${window}`;
  const cached = scopedLimiters.get(cacheKey);
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const rl = new import_ratelimit.Ratelimit({
    redis: new Redis2({ url, token, ...REDIS_TEST_RETRY_OPTS }),
    limiter: import_ratelimit.Ratelimit.slidingWindow(limit, window),
    prefix: "rl:scope",
    analytics: false
  });
  scopedLimiters.set(cacheKey, rl);
  return rl;
}
async function checkScopedRateLimit(scope, limit, window, identifier) {
  const rl = getScopedRatelimit(scope, limit, window);
  if (!rl) {
    logScopedRateLimitMissingConfig(scope);
    return { allowed: true, limit, reset: 0, degraded: true };
  }
  try {
    const result = await limitWithFallback(rl, `${scope}:${identifier}`, `rl:scope:fw:${scope}:${identifier}`, limit, durationToSeconds(window));
    if (result.reason === "timeout") {
      reportRateLimitDegraded(`checkScopedRateLimit:${scope}`, new Error("Upstash scoped rate-limit decision timed out"));
      return { allowed: true, limit, reset: 0, degraded: true };
    }
    return {
      allowed: result.success,
      limit: result.limit,
      reset: result.reset,
      degraded: false
    };
  } catch (err) {
    reportRateLimitDegraded(`checkScopedRateLimit:${scope}`, err);
    return { allowed: true, limit, reset: 0, degraded: true };
  }
}
async function checkFailClosedScopedIpRateLimit(request, scope, limit, window, corsHeaders) {
  const proofDenied = checkIpScopedEdgeProof(request, corsHeaders);
  if (proofDenied) return proofDenied;
  const result = await checkScopedRateLimit(scope, limit, window, getClientRateLimitKey(request));
  if (result.degraded) return rateLimitDegradedResponse(corsHeaders);
  if (!result.allowed) {
    return tooManyRequestsResponse(result.limit, result.reset, corsHeaders, durationToSeconds(window));
  }
  return null;
}

// server/_shared/response-headers.ts
var channel = /* @__PURE__ */ new WeakMap();
var retryableResponses = /* @__PURE__ */ new WeakSet();
function drainResponseHeaders(req) {
  const headers = channel.get(req);
  if (headers) channel.delete(req);
  return headers;
}
function drainRetryableResponse(req) {
  const retryable = retryableResponses.has(req);
  if (retryable) retryableResponses.delete(req);
  return retryable;
}
var unservedLlmResponses = /* @__PURE__ */ new WeakSet();
function drainUnservedLlmResponse(req) {
  const unserved = unservedLlmResponses.has(req);
  if (unserved) unservedLlmResponses.delete(req);
  return unserved;
}
var statusOverrides = /* @__PURE__ */ new WeakMap();
function drainSuccessStatusOverride(req) {
  const status = statusOverrides.get(req);
  if (status !== void 0) statusOverrides.delete(req);
  return status;
}

// server/_shared/deprecation-policy.ts
var DEPRECATION_POLICY_URL = "https://www.worldmonitor.app/api-versioning.md";
var DEPRECATION_POLICY_LINK = `<${DEPRECATION_POLICY_URL}>; rel="deprecation"; type="text/markdown"`;
var DEPRECATION_REL = /(?:^|,)\s*<[^>]+>\s*;[^,]*\brel="deprecation"/;
function appendDeprecationPolicyLinkToRecord(headers) {
  const existing = headers.Link;
  if (existing && DEPRECATION_REL.test(existing)) return;
  headers.Link = existing ? `${existing}, ${DEPRECATION_POLICY_LINK}` : DEPRECATION_POLICY_LINK;
}
function appendDeprecationPolicyLink(headers) {
  const existing = headers.get("Link");
  if (existing && DEPRECATION_REL.test(existing)) return;
  headers.set("Link", existing ? `${existing}, ${DEPRECATION_POLICY_LINK}` : DEPRECATION_POLICY_LINK);
}

// shared/attribution-rider.ts
var import_jmespath = __toESM(require_jmespath(), 1);
var ATTRIBUTION_RIDER_NOTICE = "The values in `data` are derived from the sources listed here. Redistribution requires this attribution block to travel with them.";
var NO2_ATTRIBUTION_EXPRESSION = "{attribution: attribution, generatedAt: generatedAt}";
var REST_ATTRIBUTION_EXPRESSIONS = {
  "/api/economic/v1/get-no2-activity": NO2_ATTRIBUTION_EXPRESSION,
  "/api/displacement/v1/get-cross-border-movements": "movements[].{source: source, sourceUrl: sourceUrl, license: license, licenseUrl: licenseUrl, notice: notice}",
  // Same payload as the get_resilience_indicators tool: its `_execute` returns
  // this endpoint's JSON verbatim, so the expression is identical.
  "/api/resilience/v1/get-resilience-indicators": "indicators[].{indicatorId: id, retrievedAt: retrievedAt, sources: sources[].{key: key, name: name, attribution: attribution, license: license, url: url, licenseUrl: licenseUrl, attributionUrl: attributionUrl}}",
  // Flat response, one dataset per request (`?dataset=`), with the licence
  // assertion at the top level — see queryTorontoSafety's return shape.
  "/api/safety/v1/get-toronto-safety": "{attribution: attribution, source: source, sourceUrl: sourceUrl, fetchedAt: fetchedAt}"
};
function pruneEmpty(entry) {
  const kept = {};
  for (const [key, value] of Object.entries(entry)) {
    if (value === null || value === void 0 || value === "") continue;
    kept[key] = value;
  }
  return Object.keys(kept).length > 0 ? kept : null;
}
function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (value !== null && typeof value === "object") {
    return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => `${JSON.stringify(key)}:${canonicalJson(child)}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}
function dedupeIdentity(entry) {
  return canonicalJson(entry);
}
function expandCandidate(candidate) {
  if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) return [];
  const record = candidate;
  if (!Array.isArray(record.sources)) return [record];
  const { sources, ...context } = record;
  return sources.flatMap((source) => source !== null && typeof source === "object" && !Array.isArray(source) ? [{ ...context, ...source }] : []);
}
function buildAttributionRider(payload, extractionExpr) {
  if (typeof extractionExpr !== "string" || extractionExpr === "") return null;
  let extracted;
  try {
    extracted = import_jmespath.default.search(payload, extractionExpr);
  } catch {
    return null;
  }
  const candidates = (Array.isArray(extracted) ? extracted : [extracted]).flatMap(expandCandidate);
  const sources = [];
  const seen = /* @__PURE__ */ new Set();
  for (const candidate of candidates) {
    const pruned = pruneEmpty(candidate);
    if (pruned === null) continue;
    const identity = dedupeIdentity(pruned);
    if (seen.has(identity)) continue;
    seen.add(identity);
    sources.push(pruned);
  }
  if (sources.length === 0) return null;
  return { required: true, notice: ATTRIBUTION_RIDER_NOTICE, sources };
}
function mergeAttributionRider(projectedText, rider) {
  return `{"data":${projectedText},"_attribution":${JSON.stringify(rider)}}`;
}

// server/_shared/bounded-jmespath.ts
var import_jmespath2 = __toESM(require_jmespath(), 1);
var compiler = import_jmespath2.default;
var MAX_NODES = 128;
var MAX_DEPTH = 32;
var MAX_PIPES = 8;
var MAX_MULTISELECTS = 8;
var MAX_FANOUT = 64;
var EXPRESSION_REFERENCE_ARGUMENTS = /* @__PURE__ */ new Map([
  ["map", 0],
  ["sort_by", 1],
  ["min_by", 1],
  ["max_by", 1]
]);
function scalarLiteral(node) {
  return node !== null && typeof node === "object" && node.type === "Literal" && (node.value === null || ["string", "number", "boolean"].includes(typeof node.value));
}
function searchBoundedJmespath(value, expression) {
  const ast = compiler.compile(expression);
  let nodes = 0;
  let pipes = 0;
  let multiselects = 0;
  let fanout = 1;
  function reject(reason) {
    throw new Error(`Unsafe JMESPath: ${reason}`);
  }
  function expand(width) {
    fanout *= Math.max(1, width);
    if (fanout > MAX_FANOUT) reject("too much expression expansion");
  }
  function visitLiteral(literal) {
    if (literal === null || typeof literal !== "object") return;
    const values = Object.values(literal);
    expand(values.length);
    for (const child of values) visitLiteral(child);
  }
  function visit(node, depth) {
    nodes += 1;
    if (nodes > MAX_NODES || depth > MAX_DEPTH) reject("expression is too complex");
    if (node.type === "Pipe" && ++pipes > MAX_PIPES) reject("too many pipe stages");
    if (node.type === "MultiSelectList" || node.type === "MultiSelectHash") {
      multiselects += 1;
      if (multiselects > MAX_MULTISELECTS) reject("too many multiselects");
      expand(node.children?.length ?? 0);
    }
    if (node.type === "Literal") visitLiteral(node.value);
    if (node.type === "Function") {
      if (node.name === "to_string") reject("to_string() is not supported");
      const referenceIndex = EXPRESSION_REFERENCE_ARGUMENTS.get(node.name ?? "");
      if (referenceIndex !== void 0) {
        const reference = node.children?.[referenceIndex];
        if (reference === null || typeof reference !== "object" || reference.type !== "ExpressionReference") {
          reject(`${node.name}() requires an explicit &expression reference`);
        }
      }
      if (node.name === "join") {
        const separator = node.children?.[0];
        if (!scalarLiteral(separator) || typeof separator.value !== "string") {
          reject("join() requires a literal string separator");
        }
      }
    }
    if (node.type === "Comparator" && (node.name === "EQ" || node.name === "NE")) {
      if (!node.children?.some(scalarLiteral)) reject("equality requires a scalar literal operand");
    }
    for (const child of node.children ?? []) {
      if (child !== null && typeof child === "object") visit(child, depth + 1);
    }
    if (node.type === "KeyValuePair") visit(node.value, depth + 1);
  }
  visit(ast, 1);
  return import_jmespath2.default.search(value, expression);
}

// server/_shared/bounded-json.ts
var BudgetExceeded = class extends Error {
};
var BoundedWriter = class {
  constructor(budget) {
    this.budget = budget;
  }
  budget;
  parts = [];
  length = 0;
  // `length` is UTF-16 code units, a lower bound on UTF-8 bytes.
  write(text) {
    this.length += text.length;
    if (this.length > this.budget) throw new BudgetExceeded();
    this.parts.push(text);
  }
  mark() {
    return [this.parts.length, this.length];
  }
  rollback([parts, length]) {
    this.parts.length = parts;
    this.length = length;
  }
};
function writeValue(out, key, input, ancestors) {
  let value = input;
  if (value !== null && (typeof value === "object" || typeof value === "bigint")) {
    const toJSON = value.toJSON;
    if (typeof toJSON === "function") value = toJSON.call(value, key);
  }
  if (value instanceof Number) value = Number(value);
  else if (value instanceof String) value = String(value);
  else if (value instanceof Boolean) value = value.valueOf();
  if (value === null) {
    out.write("null");
    return true;
  }
  switch (typeof value) {
    case "string":
      if (out.length + value.length + 2 > out.budget) {
        out.length += value.length + 2;
        throw new BudgetExceeded();
      }
      out.write(JSON.stringify(value));
      return true;
    case "number":
      out.write(Number.isFinite(value) ? String(value) : "null");
      return true;
    case "boolean":
      out.write(value ? "true" : "false");
      return true;
    case "bigint":
      throw new TypeError("Do not know how to serialize a BigInt");
    case "undefined":
    case "function":
    case "symbol":
      return false;
    default:
      break;
  }
  const object = value;
  if (ancestors.has(object)) throw new TypeError("Converting circular structure to JSON");
  ancestors.add(object);
  try {
    if (Array.isArray(object)) {
      out.write("[");
      for (let i = 0; i < object.length; i += 1) {
        if (i > 0) out.write(",");
        if (!writeValue(out, String(i), object[i], ancestors)) out.write("null");
      }
      out.write("]");
      return true;
    }
    const record = object;
    out.write("{");
    let first = true;
    for (const name of Object.keys(record)) {
      const before = out.mark();
      out.write(`${first ? "" : ","}${JSON.stringify(name)}:`);
      if (writeValue(out, name, record[name], ancestors)) first = false;
      else out.rollback(before);
    }
    out.write("}");
    return true;
  } finally {
    ancestors.delete(object);
  }
}
function stringifyWithinBudget(value, maxBytes) {
  const out = new BoundedWriter(maxBytes);
  try {
    if (!writeValue(out, "", value, /* @__PURE__ */ new Set())) return { ok: true, text: "null" };
  } catch (err) {
    if (err instanceof BudgetExceeded) return { ok: false, reason: "too_large", minBytes: out.length };
    throw err;
  }
  const text = out.parts.join("");
  const bytes = new TextEncoder().encode(text).length;
  if (bytes > maxBytes) return { ok: false, reason: "too_large", minBytes: bytes };
  return { ok: true, text };
}

// server/_shared/response-projection.ts
var REST_JMESPATH_MAX_EXPR_BYTES = 1024;
var REST_JMESPATH_MAX_OUTPUT_BYTES = 256 * 1024;
function utf8ByteLength(value) {
  return new TextEncoder().encode(value).length;
}
function originalKeys(value) {
  if (Array.isArray(value)) return [`<array length=${value.length}>`];
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value);
    if (keys.length <= 50) return keys;
    return [...keys.slice(0, 50), `...<${keys.length - 50} more>`];
  }
  return [`<${typeof value}>`];
}
function enforceRestProjectionOutputLimit(body, originalValue) {
  const outputBytes = utf8ByteLength(body);
  if (outputBytes <= REST_JMESPATH_MAX_OUTPUT_BYTES) return { ok: true, body };
  return {
    ok: false,
    envelope: {
      _jmespath_error: `projection_too_large: ${outputBytes} > ${REST_JMESPATH_MAX_OUTPUT_BYTES}`,
      original_keys: originalKeys(originalValue)
    }
  };
}
function projectJsonResponse(bodyStr, expr) {
  const exprBytes = utf8ByteLength(expr);
  if (exprBytes > REST_JMESPATH_MAX_EXPR_BYTES) {
    let parsed = null;
    try {
      parsed = JSON.parse(bodyStr);
    } catch {
    }
    return {
      ok: false,
      envelope: {
        _jmespath_error: `expression_too_long: ${exprBytes} > ${REST_JMESPATH_MAX_EXPR_BYTES}`,
        original_keys: originalKeys(parsed)
      }
    };
  }
  let value;
  try {
    value = JSON.parse(bodyStr);
  } catch {
    return { ok: true, body: bodyStr };
  }
  let projected;
  try {
    projected = searchBoundedJmespath(value, expr);
  } catch (err) {
    const message2 = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      envelope: {
        _jmespath_error: `invalid_expression: ${message2}`,
        original_keys: originalKeys(value)
      }
    };
  }
  const bounded = stringifyWithinBudget(projected, REST_JMESPATH_MAX_OUTPUT_BYTES);
  if (!bounded.ok) {
    return {
      ok: false,
      envelope: {
        _jmespath_error: `projection_too_large: ${bounded.minBytes} > ${REST_JMESPATH_MAX_OUTPUT_BYTES}`,
        original_keys: originalKeys(value)
      }
    };
  }
  return enforceRestProjectionOutputLimit(bounded.text, value);
}

// server/gateway.ts
init_cache_contract();

// shared/embed-panels.ts
var EMBED_LAYER_IDS = [
  "conflicts",
  "earthquakes",
  "protests",
  "weather",
  "cables",
  "pipelines",
  "waterways",
  "tradeRoutes",
  "economic",
  "stockExchanges",
  "financialCenters",
  "centralBanks",
  "commodityHubs",
  "gulfInvestments"
];
var EMBED_FREE_REFRESH_MS = 60 * 60 * 1e3;
var EMBED_KEYED_REFRESH_MS = 10 * 60 * 1e3;
var EMBEDDABLE_PANELS = [
  {
    id: "map",
    label: "Live Map",
    access: {
      kind: "tiered",
      free: {
        layers: ["conflicts", "earthquakes", "weather"],
        refreshMs: EMBED_FREE_REFRESH_MS
      }
    },
    aliases: ["live-map", "live_map", "livemap"]
  },
  {
    id: "chokepoint-strip",
    label: "Chokepoint Monitor",
    access: { kind: "paid-only", rpcPaths: ["/api/supply-chain/v1/get-chokepoint-status"] },
    aliases: ["chokepoints", "chokepoint", "chokepoint-monitor"]
  },
  {
    id: "fear-greed",
    label: "Fear & Greed",
    access: { kind: "paid-only", rpcPaths: ["/api/market/v1/get-fear-greed-index"] },
    aliases: ["feargreed", "fear_greed", "markets-fear-greed"]
  }
];
var EMBED_KEY_RPC_PATHS = new Set(
  EMBEDDABLE_PANELS.flatMap(
    (panel) => panel.access.kind === "paid-only" ? [...panel.access.rpcPaths] : []
  )
);
var PANEL_BY_TOKEN = /* @__PURE__ */ new Map();
for (const panel of EMBEDDABLE_PANELS) {
  PANEL_BY_TOKEN.set(panel.id, panel.id);
  for (const alias of panel.aliases) {
    PANEL_BY_TOKEN.set(alias.toLowerCase(), panel.id);
  }
}
var PANEL_DEF_BY_ID = new Map(
  EMBEDDABLE_PANELS.map((panel) => [panel.id, panel])
);
var EMBED_LAYER_ID_SET = new Set(EMBED_LAYER_IDS);

// server/gateway.ts
init_embed_access();

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

// server/_shared/auth-session.ts
init_auth_session();
var UNVERIFIABLE = { reason: "unverifiable", userId: null, orgId: null, role: null };
function sessionVerificationUnavailableResponse(headers = {}) {
  return renderBillingVerificationDenial(unverifiableEntitlementDenial(), {
    ...headers,
    "Cache-Control": "no-store"
  });
}
async function resolveClerkSession(request, options = {}) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const session = await validateBearerToken(authHeader.slice(7), options);
    if (!session.valid) return session.reason === "unverifiable" ? UNVERIFIABLE : null;
    if (!session.userId) return null;
    return {
      userId: session.userId,
      orgId: session.orgId ?? null,
      role: session.role ?? "free",
      sessionId: session.sessionId ?? null
    };
  } catch (err) {
    console.warn(
      "[auth-session] JWT verification failed:",
      err instanceof Error ? err.message : String(err)
    );
    return UNVERIFIABLE;
  }
}

// server/_shared/usage-identity.ts
var ENTERPRISE_KEY_TO_CUSTOMER = {
  // 'wm_ent_xxxx': 'acme-corp',
};
function buildUsageIdentity(input) {
  const tier = input.tier ?? 0;
  if (input.isUserApiKey) {
    return {
      auth_kind: "user_api_key",
      principal_id: input.sessionUserId,
      customer_id: input.userApiKeyCustomerRef ?? input.sessionUserId,
      tier,
      plan_key: input.planKey
    };
  }
  if (input.sessionUserId) {
    return {
      auth_kind: "clerk_jwt",
      principal_id: input.sessionUserId,
      customer_id: input.clerkOrgId ?? input.sessionUserId,
      tier,
      plan_key: input.planKey
    };
  }
  if (input.enterpriseApiKey) {
    const customer = ENTERPRISE_KEY_TO_CUSTOMER[input.enterpriseApiKey] ?? "enterprise-unmapped";
    return {
      auth_kind: "enterprise_api_key",
      principal_id: hashKeySync(input.enterpriseApiKey),
      customer_id: customer,
      tier,
      plan_key: input.planKey ?? "enterprise"
    };
  }
  if (input.widgetKey) {
    return {
      auth_kind: "widget_key",
      principal_id: hashKeySync(input.widgetKey),
      customer_id: "widget",
      tier,
      plan_key: null
    };
  }
  return {
    auth_kind: "anon",
    principal_id: null,
    customer_id: null,
    tier: 0,
    plan_key: null
  };
}
function hashKeySync(key) {
  let h1 = 2166136261;
  let h2 = 2166136261 ^ 2746401236;
  for (let i = 0; i < key.length; i++) {
    const c = key.charCodeAt(i);
    h1 ^= c;
    h1 = Math.imul(h1, 16777619);
    h2 ^= c + 2654435761;
    h2 = Math.imul(h2, 16777619);
  }
  const lo = (h1 >>> 0).toString(36);
  const hi = (h2 >>> 0).toString(36);
  return `${hi}${lo}`;
}

// server/gateway.ts
init_redis();

// server/_shared/idempotency.ts
init_client_ip();
init_redis();
var IDEMPOTENCY_HEADER = "Idempotency-Key";
var IDEMPOTENT_REPLAYED_HEADER = "Idempotent-Replayed";
var IDEMPOTENCY_EXEMPT_RPC_PATHS = /* @__PURE__ */ new Set([
  "/api/company-monitoring/v1/import-monitored-company-batch",
  // #9093 operator review: the response carries the private message and email
  // of a reader, and the gateway would replay a stored response before the
  // handler checks the review secret. The handler is idempotent on its own (a
  // reviewed report answers 409), so it needs no generic replay. (No apostrophes
  // in this block: readIdempotencyExemptPaths parses its quoted strings.)
  "/api/news/v1/review-error-report"
]);
var KEY_MAX_LENGTH = 255;
var KEY_PATTERN = /^[\x21-\x7e]{1,255}$/;
var PROCESSING_TTL_SECONDS = 180;
var COMPLETED_TTL_SECONDS = 24 * 60 * 60;
var MAX_STORED_BODY_BYTES = 256 * 1024;
var PROCESSING_MARKER = JSON.stringify({ state: "processing" });
function isValidIdempotencyKey(key) {
  return key.length <= KEY_MAX_LENGTH && KEY_PATTERN.test(key);
}
async function sha256Hex2(input) {
  const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function isReplayableTextBody(contentType) {
  if (!contentType) return false;
  const ct = contentType.toLowerCase();
  return ct.includes("json") || ct.startsWith("text/");
}
function isRetryableStatus(status) {
  return status === 408 || status === 409 || status === 429 || status >= 500;
}
function anonScope(request) {
  return `ip:${getClientIp(request)}`;
}
function jsonResponse(status, body, corsHeaders, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...corsHeaders,
      ...extraHeaders
    }
  });
}
async function getRequestHashAndRedisKey(request, pathname, scope, idempotencyKey) {
  try {
    const bodyBuf = await request.clone().arrayBuffer();
    const reqHash = await sha256Hex2(bodyBuf);
    const effectiveScope = scope || anonScope(request);
    const redisKey = `idem:v1:${await sha256Hex2(`${effectiveScope}
${pathname}
${idempotencyKey}`)}`;
    return { reqHash, redisKey };
  } catch {
    return null;
  }
}
function outcomeFromStoredRecord(raw, reqHash, idempotencyKey, corsHeaders) {
  if (raw == null) return { kind: "miss" };
  let record = null;
  if (typeof raw === "string") {
    try {
      record = JSON.parse(raw);
    } catch {
      record = null;
    }
  }
  if (!record) {
    return { kind: "disabled" };
  }
  if (record.state === "processing") {
    return {
      kind: "conflict",
      response: jsonResponse(
        409,
        {
          error: "idempotency_conflict",
          message: `A request with this ${IDEMPOTENCY_HEADER} is still being processed. Retry shortly.`
        },
        corsHeaders,
        { "Retry-After": "2", [IDEMPOTENCY_HEADER]: idempotencyKey }
      )
    };
  }
  if (record.reqHash !== reqHash) {
    return {
      kind: "mismatch",
      response: jsonResponse(
        422,
        {
          error: "idempotency_key_reused",
          message: `This ${IDEMPOTENCY_HEADER} was already used with a different request body.`
        },
        corsHeaders,
        { [IDEMPOTENCY_HEADER]: idempotencyKey }
      )
    };
  }
  return {
    kind: "replay",
    response: new Response(record.body, {
      status: record.status,
      headers: {
        "Content-Type": record.contentType ?? "application/json",
        "Cache-Control": "no-store",
        ...corsHeaders,
        [IDEMPOTENCY_HEADER]: idempotencyKey,
        [IDEMPOTENT_REPLAYED_HEADER]: "true"
      }
    })
  };
}
function isPipelineSuccess(entry, expected) {
  return entry?.error == null && entry?.result === expected;
}
async function releaseProcessingLock(redisKey) {
  await runRedisPipeline([["DEL", redisKey]]);
}
async function peekIdempotency(args) {
  const { request, pathname, scope, idempotencyKey, corsHeaders } = args;
  if (!isValidIdempotencyKey(idempotencyKey)) {
    return {
      kind: "invalid",
      response: jsonResponse(
        400,
        {
          error: "invalid_idempotency_key",
          message: `The ${IDEMPOTENCY_HEADER} header must be 1-${KEY_MAX_LENGTH} printable ASCII characters.`
        },
        corsHeaders
      )
    };
  }
  const resolved = await getRequestHashAndRedisKey(request, pathname, scope, idempotencyKey);
  if (!resolved) return { kind: "disabled" };
  const pipeline = await runRedisPipeline([["GET", resolved.redisKey]]);
  if (pipeline.length < 1) return { kind: "disabled" };
  const entry = pipeline[0];
  if (entry?.error) return { kind: "disabled" };
  return outcomeFromStoredRecord(entry?.result, resolved.reqHash, idempotencyKey, corsHeaders);
}
async function beginIdempotency(args) {
  const { request, pathname, scope, idempotencyKey, corsHeaders } = args;
  if (!isValidIdempotencyKey(idempotencyKey)) {
    return {
      kind: "invalid",
      response: jsonResponse(
        400,
        {
          error: "invalid_idempotency_key",
          message: `The ${IDEMPOTENCY_HEADER} header must be 1-${KEY_MAX_LENGTH} printable ASCII characters.`
        },
        corsHeaders
      )
    };
  }
  const resolved = await getRequestHashAndRedisKey(request, pathname, scope, idempotencyKey);
  if (!resolved) return { kind: "disabled" };
  const pipeline = await runRedisPipeline([
    ["SET", resolved.redisKey, PROCESSING_MARKER, "NX", "EX", String(PROCESSING_TTL_SECONDS)],
    ["GET", resolved.redisKey]
  ]);
  if (pipeline.length < 2) return { kind: "disabled" };
  const claim = pipeline[0];
  if (claim?.error) return { kind: "disabled" };
  const claimed = claim?.result === "OK";
  if (claimed) {
    return {
      kind: "proceed",
      key: idempotencyKey,
      store: (status, body, contentType) => storeResult(resolved.redisKey, status, body, contentType, resolved.reqHash)
    };
  }
  const raw = pipeline[1]?.result;
  const outcome = outcomeFromStoredRecord(raw, resolved.reqHash, idempotencyKey, corsHeaders);
  return outcome.kind === "miss" ? { kind: "disabled" } : outcome;
}
async function storeResult(redisKey, status, body, contentType, reqHash) {
  try {
    if (isRetryableStatus(status) || body.byteLength > MAX_STORED_BODY_BYTES || !isReplayableTextBody(contentType)) {
      await releaseProcessingLock(redisKey);
      return;
    }
    const record = {
      state: "completed",
      status,
      contentType,
      reqHash,
      body: new TextDecoder().decode(body)
    };
    const pipeline = await runRedisPipeline([
      ["SET", redisKey, JSON.stringify(record), "EX", String(COMPLETED_TTL_SECONDS)]
    ]);
    if (!isPipelineSuccess(pipeline[0], "OK")) {
      await releaseProcessingLock(redisKey);
    }
  } catch {
    try {
      await releaseProcessingLock(redisKey);
    } catch {
    }
  }
}

// server/_shared/api-only-paths.ts
var API_ONLY_PATH_PREFIXES = Object.freeze(["/api/v2/"]);
var API_ONLY_EXACT_PATHS = /* @__PURE__ */ new Set([
  "/mcp",
  "/api/mcp",
  "/.well-known/mcp",
  "/.well-known/mcp.json",
  "/oauth/authorize",
  "/oauth/authorize-pro",
  "/oauth/token",
  "/oauth/register",
  "/api/oauth/authorize",
  "/api/oauth/authorize-pro",
  "/api/oauth/token",
  "/api/oauth/register"
]);
function isApiOnlyPath(pathname) {
  const collapsed = pathname.replace(/\/{2,}/g, "/");
  const normalized = collapsed.length > 1 && collapsed.endsWith("/") ? collapsed.replace(/\/+$/, "") : collapsed;
  if (API_ONLY_EXACT_PATHS.has(normalized)) return true;
  return API_ONLY_PATH_PREFIXES.some((prefix) => normalized.startsWith(prefix) || normalized === prefix.slice(0, -1));
}

// shared/desktop-key-access.js
function admitsDesktopKeyPrincipal(entitlement, now) {
  if (!entitlement) return false;
  const { features } = entitlement;
  return features.tier >= 1 && entitlement.validUntil >= now && (features.desktopKeyAccess === true || features.apiAccess === true);
}
var DESKTOP_KEY_LIMIT_ERROR = "Desktop key limit reached for this account";
var DESKTOP_KEY_API_ONLY_ERROR = "This endpoint requires an API plan";

// server/_shared/desktop-key-principal.ts
function resolveUserKeyScope(principal, entitlement, now = Date.now()) {
  if (!entitlement) return { scope: "denied", reason: "not_covered" };
  const covered = hasCurrentEntitlementCoverage(entitlement, now);
  const apiAccessCovered = covered && entitlement.features.apiAccess === true;
  if (principal.keyKind === "api" && apiAccessCovered) return { scope: "api" };
  const desktopAdmitted = covered && admitsDesktopKeyPrincipal(entitlement, now);
  if (!desktopAdmitted) return { scope: "denied", reason: "not_covered" };
  if (apiAccessCovered) return { scope: "desktop" };
  const cap = entitlement.features.maxDesktopKeys;
  const rank = principal.activeKeyRank;
  if (typeof rank !== "number" || !Number.isInteger(rank) || rank < 0) {
    return { scope: "denied", reason: "rank_unknown" };
  }
  if (typeof cap === "number" && Number.isInteger(cap) && rank < cap) return { scope: "desktop" };
  return { scope: "denied", reason: "over_cap" };
}
function needsDesktopKeyShape(principal, ent, now = Date.now()) {
  if (!ent || !hasCurrentEntitlementCoverage(ent, now)) return false;
  if (ent.features.tier < 1) return false;
  if (principal.keyKind === "api" && ent.features.apiAccess === true) return false;
  return ent.features.desktopKeyAccess === void 0;
}
async function resolveUserKeyEntitlement(userId, principal) {
  const ent = await getEntitlements(userId);
  if (!needsDesktopKeyShape(principal, ent)) return ent;
  return getEntitlements(userId, { requireDesktopKeyShape: true });
}

// api/_client-ip.js
var RATE_LIMIT_DEGRADED_HEADERS2 = Object.freeze({
  "X-RateLimit-Mode": "degraded",
  "Retry-After": "5"
});
var CLOUDFLARE_IPV4_CIDRS2 = Object.freeze([
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
var CLOUDFLARE_IPV6_CIDRS2 = Object.freeze([
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32"
]);
function parseIpv42(value) {
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
function parseIpv62(value) {
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
function parseIpv4Cidr2(cidr) {
  const [networkText, prefixText] = cidr.split("/");
  const network = parseIpv42(networkText);
  if (network === null) throw new Error(`Invalid Cloudflare IPv4 CIDR: ${cidr}`);
  return [network, Number(prefixText)];
}
function parseIpv6Cidr2(cidr) {
  const [networkText, prefixText] = cidr.split("/");
  const network = parseIpv62(networkText);
  if (network === null) throw new Error(`Invalid Cloudflare IPv6 CIDR: ${cidr}`);
  return [network, Number(prefixText)];
}
var CLOUDFLARE_IPV4_RANGES2 = Object.freeze(CLOUDFLARE_IPV4_CIDRS2.map(parseIpv4Cidr2));
var CLOUDFLARE_IPV6_RANGES2 = Object.freeze(CLOUDFLARE_IPV6_CIDRS2.map(parseIpv6Cidr2));

// api/_desktop-key-meter.js
var DESKTOP_KEY_DAILY_CEILING = 7500;
var DESKTOP_KEY_BURST_PER_MINUTE = 120;
var DESKTOP_KEY_DAILY_TTL_SECONDS = 172800;
var DESKTOP_KEY_MINUTE_TTL_SECONDS = 120;
var DAILY_KEY_PREFIX = "rl:desktopkey:day:";
var MINUTE_KEY_PREFIX = "rl:desktopkey:min:";
function resolveDesktopKeyLimits(entitlement) {
  const limits = entitlement?.features?.planLimits;
  return {
    dailyLimit: positiveInteger(limits?.desktopKeyRequestsPerDay) ?? DESKTOP_KEY_DAILY_CEILING,
    burstPerMinute: positiveInteger(limits?.desktopKeyBurstPerMinute) ?? DESKTOP_KEY_BURST_PER_MINUTE
  };
}
function positiveInteger(value) {
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
}
function desktopKeyDailyKey(userId, date) {
  const d = date ?? /* @__PURE__ */ new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${DAILY_KEY_PREFIX}${userId}:${yyyy}-${mm}-${dd}`;
}
function desktopKeyMinuteKey(userId, date) {
  const ms = (date ?? /* @__PURE__ */ new Date()).getTime();
  return `${MINUTE_KEY_PREFIX}${userId}:${Math.floor(ms / 6e4)}`;
}
function secondsUntilUtcMidnight3(now) {
  const d = now ?? /* @__PURE__ */ new Date();
  const next = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
  return Math.max(1, Math.ceil((next.getTime() - d.getTime()) / 1e3));
}
function secondsUntilNextMinute(now) {
  const ms = (now ?? /* @__PURE__ */ new Date()).getTime();
  const next = (Math.floor(ms / 6e4) + 1) * 6e4;
  return Math.max(1, Math.ceil((next - ms) / 1e3));
}
async function reserveDesktopKeyBudget(opts) {
  const { userId, dailyLimit, burstPerMinute, pipeline } = opts;
  const now = opts.date ?? /* @__PURE__ */ new Date();
  const dayKey = desktopKeyDailyKey(userId, now);
  const minuteKey = desktopKeyMinuteKey(userId, now);
  const unavailable = { ok: null, reason: "unavailable" };
  if (!userId) return unavailable;
  let result;
  try {
    result = await pipeline([
      ["INCR", dayKey],
      ["EXPIRE", dayKey, DESKTOP_KEY_DAILY_TTL_SECONDS],
      ["INCR", minuteKey],
      ["EXPIRE", minuteKey, DESKTOP_KEY_MINUTE_TTL_SECONDS]
    ]);
  } catch {
    result = null;
  }
  if (!Array.isArray(result) || result.length < 4) return unavailable;
  if (result.some((entry) => !entry || typeof entry !== "object" || "error" in entry)) return unavailable;
  const dailyCount = toCount(result[0]?.result);
  const minuteCount = toCount(result[2]?.result);
  if (dailyCount === null || minuteCount === null) return unavailable;
  let rolledBack = false;
  const rollback = async () => {
    if (rolledBack) return;
    rolledBack = true;
    try {
      await pipeline([["DECR", dayKey], ["DECR", minuteKey]]);
    } catch {
    }
  };
  if (dailyCount > dailyLimit) {
    await rollback();
    const retryAfterSec = secondsUntilUtcMidnight3(now);
    return { ok: false, limitType: "daily", limit: dailyLimit, retryAfterSec, resetMs: now.getTime() + retryAfterSec * 1e3 };
  }
  if (minuteCount > burstPerMinute) {
    await rollback();
    const retryAfterSec = secondsUntilNextMinute(now);
    return { ok: false, limitType: "per_minute", limit: burstPerMinute, retryAfterSec, resetMs: now.getTime() + retryAfterSec * 1e3 };
  }
  return { ok: true, dailyCount, minuteCount, rollback };
}
function toCount(raw) {
  const count = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(count) && count >= 1 ? count : null;
}
var DESKTOP_KEY_METER_UNAVAILABLE_ERROR = "Rate-limit service temporarily unavailable";
var DESKTOP_KEY_DAILY_LIMIT_ERROR = "Daily request limit reached";
var DESKTOP_KEY_BURST_LIMIT_ERROR = "Too many requests";
function desktopKeyBudgetDenial(decision, planKey) {
  if (decision.ok === null) {
    return {
      ok: false,
      status: 503,
      reason: "unavailable",
      body: { error: DESKTOP_KEY_METER_UNAVAILABLE_ERROR },
      headers: { "Cache-Control": "no-store", ...RATE_LIMIT_DEGRADED_HEADERS2 }
    };
  }
  const daily = decision.limitType === "daily";
  const error = daily ? DESKTOP_KEY_DAILY_LIMIT_ERROR : DESKTOP_KEY_BURST_LIMIT_ERROR;
  return {
    ok: false,
    status: 429,
    reason: decision.limitType,
    body: {
      error,
      plan: planKey,
      limit: decision.limit,
      limit_type: decision.limitType,
      reset: new Date(decision.resetMs).toISOString()
    },
    headers: {
      "Cache-Control": "no-store",
      ...rateLimitHeaders({
        limit: decision.limit,
        remaining: 0,
        resetMs: decision.resetMs,
        retryAfterSec: decision.retryAfterSec,
        windowSec: daily ? 86400 : 60
      })
    }
  };
}
async function chargeDesktopKeyBudget(opts) {
  const limits = resolveDesktopKeyLimits(opts.entitlement);
  const decision = await reserveDesktopKeyBudget({
    userId: opts.userId,
    dailyLimit: limits.dailyLimit,
    burstPerMinute: limits.burstPerMinute,
    pipeline: opts.pipeline,
    ...opts.date ? { date: opts.date } : {}
  });
  if (decision.ok === true) return decision;
  const planKey = opts.entitlement?.planKey;
  return desktopKeyBudgetDenial(decision, typeof planKey === "string" ? planKey : void 0);
}

// server/_shared/desktop-key-meter.ts
var chargeDesktopKeyBudget2 = chargeDesktopKeyBudget;

// server/_shared/direct-llm-quota.ts
init_redis();

// server/_shared/pro-mcp-token.ts
init_redis();
var PRO_DAILY_QUOTA_TTL_SECONDS = 172800;

// server/_shared/direct-llm-quota.ts
var DIRECT_LLM_DAILY_QUOTA_LIMIT = 500;
var DIRECT_LLM_REDIS_UNAVAILABLE_RETRY_AFTER_SECONDS = 30;
var DIRECT_LLM_UNVERIFIED_DAILY_QUOTA_LIMIT = 50;
function resolveDirectLlmDailyLimit(planDailyLimit) {
  if (planDailyLimit === null) return null;
  if (typeof planDailyLimit === "number" && Number.isFinite(planDailyLimit) && planDailyLimit >= 0) {
    return planDailyLimit;
  }
  return DIRECT_LLM_DAILY_QUOTA_LIMIT;
}
function directLlmDailyLimitFromEntitlements(entitlements) {
  return entitlements?.features?.planLimits?.dashboardAiCallsPerDay;
}
function isActivePaidEntitlement(ent) {
  if (!ent || ent.verificationUnavailable) return false;
  const tier = ent.features?.tier;
  if (typeof tier !== "number" || tier < 1) return false;
  return typeof ent.validUntil === "number" && ent.validUntil >= Date.now();
}
function resolveActiveDirectLlmLimit(ent) {
  if (!isActivePaidEntitlement(ent)) return DIRECT_LLM_UNVERIFIED_DAILY_QUOTA_LIMIT;
  return resolveDirectLlmDailyLimit(directLlmDailyLimitFromEntitlements(ent));
}
var DIRECT_LLM_GATEWAY_QUOTA_PATHS = /* @__PURE__ */ new Set([
  "/api/intelligence/v1/classify-event",
  "/api/intelligence/v1/deduct-situation",
  "/api/intelligence/v1/get-country-intel-brief",
  "/api/market/v1/analyze-stock",
  "/api/news/v1/summarize-article"
]);
var DIRECT_LLM_SELF_METERED_QUOTA_PATHS = /* @__PURE__ */ new Set([
  "/api/chat-analyst",
  "/api/widget-agent"
]);
var DIRECT_LLM_QUOTA_PATHS = /* @__PURE__ */ new Set([
  ...DIRECT_LLM_GATEWAY_QUOTA_PATHS,
  ...DIRECT_LLM_SELF_METERED_QUOTA_PATHS
]);
function directLlmDailyQuotaKey(userId, date) {
  if (!userId) return "";
  const d = date ?? /* @__PURE__ */ new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${getKeyPrefix()}llm:direct-usage:${userId}:${yyyy}-${mm}-${dd}`;
}
async function reserveDirectLlmQuota(opts) {
  const limit = resolveDirectLlmDailyLimit(opts.limit);
  const retryAfterSec = secondsUntilUtcMidnight2(opts.date);
  const key = directLlmDailyQuotaKey(opts.userId, opts.date);
  if (!key) {
    return {
      ok: false,
      reason: "redis-unavailable",
      retryAfterSec: DIRECT_LLM_REDIS_UNAVAILABLE_RETRY_AFTER_SECONDS
    };
  }
  let pipeResult;
  try {
    pipeResult = await opts.pipeline([
      ["INCR", key],
      ["EXPIRE", key, PRO_DAILY_QUOTA_TTL_SECONDS]
    ]);
  } catch {
    pipeResult = null;
  }
  if (!pipeResult || !Array.isArray(pipeResult) || pipeResult.length === 0) {
    return {
      ok: false,
      reason: "redis-unavailable",
      retryAfterSec: DIRECT_LLM_REDIS_UNAVAILABLE_RETRY_AFTER_SECONDS
    };
  }
  const incrRaw = pipeResult[0]?.result;
  const newCount = typeof incrRaw === "number" ? incrRaw : Number(incrRaw);
  if (!Number.isFinite(newCount) || newCount < 1) {
    return {
      ok: false,
      reason: "redis-unavailable",
      retryAfterSec: DIRECT_LLM_REDIS_UNAVAILABLE_RETRY_AFTER_SECONDS
    };
  }
  let rolledBack = false;
  const rollback = async () => {
    if (rolledBack) return;
    rolledBack = true;
    try {
      await opts.pipeline([["DECR", key]]);
    } catch {
    }
  };
  if (limit !== null && newCount > limit) {
    await rollback();
    return {
      ok: false,
      reason: "cap-exceeded",
      floor: limit,
      retryAfterSec
    };
  }
  return { ok: true, newCount, rollback };
}

// server/_shared/high-usage-alarm.ts
init_sentry_edge();
var OPERATOR_KEY_DAILY_CEILINGS = {
  /** REST requests. Recorded only while `API_RATE_LIMIT_ENFORCE` is off. */
  restRequests: 1e5,
  /** MCP tool calls: one unit per call, as on Pro's dedicated counter. */
  mcpUnits: 1e4,
  /** Direct-LLM calls, one counter shared by the gateway, chat-analyst and widget-agent. */
  directLlmCalls: 5e3
};
var HIGH_USAGE_ALARM_FRACTION = 0.25;
function crossedHighUsageThreshold(newCount, weight, ceiling) {
  if (!Number.isFinite(newCount) || !Number.isFinite(ceiling) || ceiling <= 0) return false;
  const threshold = Math.ceil(ceiling * HIGH_USAGE_ALARM_FRACTION);
  const previous = newCount - Math.max(1, weight);
  return previous < threshold && newCount >= threshold;
}
var reporter = captureSilentError;
var reportedToday = /* @__PURE__ */ new Map();
function reportHighUsageIfCrossed(opts) {
  if (!crossedHighUsageThreshold(opts.newCount, opts.weight ?? 1, opts.ceiling)) return false;
  const day2 = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const key = `${opts.meter}|${opts.credential}|${opts.principal}`;
  if (reportedToday.get(key) === day2) return false;
  for (const [reportedKey, reportedDay] of reportedToday) {
    if (reportedDay !== day2) reportedToday.delete(reportedKey);
  }
  reportedToday.set(key, day2);
  reporter(
    new Error(
      `High daily usage: ${opts.credential} ${opts.principal} reached ${opts.newCount} of its ${opts.ceiling} ${opts.meter} ceiling`
    ),
    {
      tags: { route: "high-usage-alarm", meter: opts.meter, credential: opts.credential },
      extra: { principal: opts.principal, newCount: opts.newCount, ceiling: opts.ceiling },
      fingerprint: ["high-usage-alarm", opts.meter, opts.credential],
      ctx: opts.ctx
    }
  );
  return true;
}
async function operatorKeyQuotaPrincipal(key) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `wm:${hex.slice(0, 32)}`;
}

// server/gateway.ts
init_usage();

// server/_shared/internal-auth.ts
async function timingSafeEqual(a, b) {
  const encoder3 = new TextEncoder();
  const aHash = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder3.encode(a)));
  const bHash = new Uint8Array(await crypto.subtle.digest("SHA-256", encoder3.encode(b)));
  const n = bHash.length;
  let diff = 0;
  for (let i = 0; i < n; i++) {
    diff |= aHash[i] ^ bHash[i];
  }
  return diff === 0;
}

// src/generated/server/request_validation.ts
var GENERATED_REQUEST_TYPES = {
  "analyzeStock": "worldmonitor.market.v1.AnalyzeStockRequest",
  "backtestStock": "worldmonitor.market.v1.BacktestStockRequest",
  "classifyEvent": "worldmonitor.intelligence.v1.ClassifyEventRequest",
  "computeEnergyShockScenario": "worldmonitor.intelligence.v1.ComputeEnergyShockScenarioRequest",
  "createMonitoredCompany": "worldmonitor.company_monitoring.v1.CreateMonitoredCompanyRequest",
  "deductSituation": "worldmonitor.intelligence.v1.DeductSituationRequest",
  "executeBatch": "worldmonitor.batch.v1.ExecuteBatchRequest",
  "getAircraftDetails": "worldmonitor.military.v1.GetAircraftDetailsRequest",
  "getAircraftDetailsBatch": "worldmonitor.military.v1.GetAircraftDetailsBatchRequest",
  "getAirportOpsSummary": "worldmonitor.aviation.v1.GetAirportOpsSummaryRequest",
  "getBilateralTariff": "worldmonitor.trade.v1.GetBilateralTariffRequest",
  "getBlocScorecard": "worldmonitor.scorecard.v1.GetBlocScorecardRequest",
  "getBlsSeries": "worldmonitor.economic.v1.GetBlsSeriesRequest",
  "getBootstrapData": "worldmonitor.infrastructure.v1.GetBootstrapDataRequest",
  "getBypassOptions": "worldmonitor.supply_chain.v1.GetBypassOptionsRequest",
  "getCapitalFlows": "worldmonitor.economic.v1.GetCapitalFlowsRequest",
  "getCarrierOps": "worldmonitor.aviation.v1.GetCarrierOpsRequest",
  "getChokepointDependencies": "worldmonitor.supply_chain.v1.GetChokepointDependenciesRequest",
  "getChokepointHistory": "worldmonitor.supply_chain.v1.GetChokepointHistoryRequest",
  "getCompanyCoverage": "worldmonitor.company_monitoring.v1.GetCompanyCoverageRequest",
  "getCompanyEnrichment": "worldmonitor.intelligence.v1.GetCompanyEnrichmentRequest",
  "getCompanyMaterialEvent": "worldmonitor.company_monitoring.v1.GetCompanyMaterialEventRequest",
  "getConsumerPriceBasketSeries": "worldmonitor.consumer_prices.v1.GetConsumerPriceBasketSeriesRequest",
  "getConsumerPriceFreshness": "worldmonitor.consumer_prices.v1.GetConsumerPriceFreshnessRequest",
  "getConsumerPriceOverview": "worldmonitor.consumer_prices.v1.GetConsumerPriceOverviewRequest",
  "getCountryChokepointIndex": "worldmonitor.supply_chain.v1.GetCountryChokepointIndexRequest",
  "getCountryCostShock": "worldmonitor.supply_chain.v1.GetCountryCostShockRequest",
  "getCountryCoverage": "worldmonitor.intelligence.v1.GetCountryCoverageRequest",
  "getCountryEnergyProfile": "worldmonitor.intelligence.v1.GetCountryEnergyProfileRequest",
  "getCountryFacts": "worldmonitor.intelligence.v1.GetCountryFactsRequest",
  "getCountryHistory": "worldmonitor.intelligence.v1.GetCountryHistoryRequest",
  "getCountryIntelBrief": "worldmonitor.intelligence.v1.GetCountryIntelBriefRequest",
  "getCountryPortActivity": "worldmonitor.intelligence.v1.GetCountryPortActivityRequest",
  "getCountryProducts": "worldmonitor.supply_chain.v1.GetCountryProductsRequest",
  "getCountryRisk": "worldmonitor.intelligence.v1.GetCountryRiskRequest",
  "getCountrySignalObservations": "worldmonitor.intelligence.v1.GetCountrySignalObservationsRequest",
  "getCountryStockIndex": "worldmonitor.market.v1.GetCountryStockIndexRequest",
  "getCountryVulnerabilities": "worldmonitor.supply_chain.v1.GetCountryVulnerabilitiesRequest",
  "getCrossBorderMovements": "worldmonitor.displacement.v1.GetCrossBorderMovementsRequest",
  "getDefenseIndustrialBase": "worldmonitor.military.v1.GetDefenseIndustrialBaseRequest",
  "getDemographicsCapability": "worldmonitor.resilience.v1.GetDemographicsCapabilityRequest",
  "getDisplacementSummary": "worldmonitor.displacement.v1.GetDisplacementSummaryRequest",
  "getEconomicCalendar": "worldmonitor.economic.v1.GetEconomicCalendarRequest",
  "getEnergyCapacity": "worldmonitor.economic.v1.GetEnergyCapacityRequest",
  "getEnergyCrisisPolicies": "worldmonitor.economic.v1.GetEnergyCrisisPoliciesRequest",
  "getEnergyPrices": "worldmonitor.economic.v1.GetEnergyPricesRequest",
  "getFiveFactorScorecard": "worldmonitor.scorecard.v1.GetFiveFactorScorecardRequest",
  "getFlightStatus": "worldmonitor.aviation.v1.GetFlightStatusRequest",
  "getFoodStocks": "worldmonitor.resilience.v1.GetFoodStocksRequest",
  "getForecasts": "worldmonitor.forecast.v1.GetForecastsRequest",
  "getFredSeries": "worldmonitor.economic.v1.GetFredSeriesRequest",
  "getFredSeriesBatch": "worldmonitor.economic.v1.GetFredSeriesBatchRequest",
  "getFuelShortageDetail": "worldmonitor.supply_chain.v1.GetFuelShortageDetailRequest",
  "getGdeltTopicTimeline": "worldmonitor.intelligence.v1.GetGdeltTopicTimelineRequest",
  "getGivingSummary": "worldmonitor.giving.v1.GetGivingSummaryRequest",
  "getGovernmentYieldCurve": "worldmonitor.economic.v1.GetGovernmentYieldCurveRequest",
  "getHumanitarianSummary": "worldmonitor.conflict.v1.GetHumanitarianSummaryRequest",
  "getHumanitarianSummaryBatch": "worldmonitor.conflict.v1.GetHumanitarianSummaryBatchRequest",
  "getInsiderTransactions": "worldmonitor.market.v1.GetInsiderTransactionsRequest",
  "getIntelTimeline": "worldmonitor.intelligence.v1.GetIntelTimelineRequest",
  "getInternalDisplacement": "worldmonitor.displacement.v1.GetInternalDisplacementRequest",
  "getMineralProduction": "worldmonitor.supply_chain.v1.GetMineralProductionRequest",
  "getMultiSectorCostShock": "worldmonitor.supply_chain.v1.GetMultiSectorCostShockRequest",
  "getNo2Activity": "worldmonitor.economic.v1.GetNo2ActivityRequest",
  "getPhysicalDivergenceIndex": "worldmonitor.market.v1.GetPhysicalDivergenceIndexRequest",
  "getPhysicalPremiums": "worldmonitor.market.v1.GetPhysicalPremiumsRequest",
  "getPipelineDetail": "worldmonitor.supply_chain.v1.GetPipelineDetailRequest",
  "getPizzintStatus": "worldmonitor.intelligence.v1.GetPizzintStatusRequest",
  "getPopulationExposure": "worldmonitor.displacement.v1.GetPopulationExposureRequest",
  "getPriceHistory": "worldmonitor.market.v1.GetPriceHistoryRequest",
  "getRegimeHistory": "worldmonitor.intelligence.v1.GetRegimeHistoryRequest",
  "getRegionalBrief": "worldmonitor.intelligence.v1.GetRegionalBriefRequest",
  "getRegionalSnapshot": "worldmonitor.intelligence.v1.GetRegionalSnapshotRequest",
  "getResilienceIndicators": "worldmonitor.resilience.v1.GetResilienceIndicatorsRequest",
  "getResilienceScore": "worldmonitor.resilience.v1.GetResilienceScoreRequest",
  "getRiskScores": "worldmonitor.intelligence.v1.GetRiskScoresRequest",
  "getRouteExplorerLane": "worldmonitor.supply_chain.v1.GetRouteExplorerLaneRequest",
  "getRouteImpact": "worldmonitor.supply_chain.v1.GetRouteImpactRequest",
  "getScenarioStatus": "worldmonitor.scenario.v1.GetScenarioStatusRequest",
  "getSectorDependency": "worldmonitor.supply_chain.v1.GetSectorDependencyRequest",
  "getSectorSummary": "worldmonitor.market.v1.GetSectorSummaryRequest",
  "getSimilarEvents": "worldmonitor.intelligence.v1.GetSimilarEventsRequest",
  "getSimulationOutcome": "worldmonitor.forecast.v1.GetSimulationOutcomeRequest",
  "getSimulationPackage": "worldmonitor.forecast.v1.GetSimulationPackageRequest",
  "getStockAnalysisHistory": "worldmonitor.market.v1.GetStockAnalysisHistoryRequest",
  "getStorageFacilityDetail": "worldmonitor.supply_chain.v1.GetStorageFacilityDetailRequest",
  "getSummarizeArticleCache": "worldmonitor.news.v1.GetSummarizeArticleCacheRequest",
  "getTariffTrends": "worldmonitor.trade.v1.GetTariffTrendsRequest",
  "getTemporalBaseline": "worldmonitor.infrastructure.v1.GetTemporalBaselineRequest",
  "getTheaterPosture": "worldmonitor.military.v1.GetTheaterPostureRequest",
  "getTorontoSafety": "worldmonitor.safety.v1.GetTorontoSafetyRequest",
  "getTradeBarriers": "worldmonitor.trade.v1.GetTradeBarriersRequest",
  "getTradeFlows": "worldmonitor.trade.v1.GetTradeFlowsRequest",
  "getTradeRestrictions": "worldmonitor.trade.v1.GetTradeRestrictionsRequest",
  "getUsCpiMonthly": "worldmonitor.economic.v1.GetUsCpiMonthlyRequest",
  "getUsImportDuty": "worldmonitor.trade.v1.GetUsImportDutyRequest",
  "getUsInterestRates": "worldmonitor.economic.v1.GetUsInterestRatesRequest",
  "getUSNIFleetReport": "worldmonitor.military.v1.GetUSNIFleetReportRequest",
  "getUsTreasuryParYieldCurve": "worldmonitor.economic.v1.GetUsTreasuryParYieldCurveRequest",
  "getVesselSnapshot": "worldmonitor.maritime.v1.GetVesselSnapshotRequest",
  "getWebcamImage": "worldmonitor.webcam.v1.GetWebcamImageRequest",
  "getWingbitsLiveFlight": "worldmonitor.military.v1.GetWingbitsLiveFlightRequest",
  "getWorldCpiMonthly": "worldmonitor.economic.v1.GetWorldCpiMonthlyRequest",
  "getYoutubeLiveStreamInfo": "worldmonitor.aviation.v1.GetYoutubeLiveStreamInfoRequest",
  "importMonitoredCompanyBatch": "worldmonitor.company_monitoring.v1.ImportMonitoredCompanyBatchRequest",
  "listAcledEvents": "worldmonitor.conflict.v1.ListAcledEventsRequest",
  "listAirportDelays": "worldmonitor.aviation.v1.ListAirportDelaysRequest",
  "listAirportFlights": "worldmonitor.aviation.v1.ListAirportFlightsRequest",
  "listArxivPapers": "worldmonitor.research.v1.ListArxivPapersRequest",
  "listAviationNews": "worldmonitor.aviation.v1.ListAviationNewsRequest",
  "listClimateAnomalies": "worldmonitor.climate.v1.ListClimateAnomaliesRequest",
  "listClimateDisasters": "worldmonitor.climate.v1.ListClimateDisastersRequest",
  "listCommodityQuotes": "worldmonitor.market.v1.ListCommodityQuotesRequest",
  "listCompanyEventChanges": "worldmonitor.company_monitoring.v1.ListCompanyEventChangesRequest",
  "listCompanyEventImpacts": "worldmonitor.company_monitoring.v1.ListCompanyEventImpactsRequest",
  "listCompanySignals": "worldmonitor.intelligence.v1.ListCompanySignalsRequest",
  "listComtradeFlows": "worldmonitor.trade.v1.ListComtradeFlowsRequest",
  "listConsumerPriceCategories": "worldmonitor.consumer_prices.v1.ListConsumerPriceCategoriesRequest",
  "listConsumerPriceMovers": "worldmonitor.consumer_prices.v1.ListConsumerPriceMoversRequest",
  "listCountryHeadlines": "worldmonitor.news.v1.ListCountryHeadlinesRequest",
  "listCryptoQuotes": "worldmonitor.market.v1.ListCryptoQuotesRequest",
  "listCyberThreats": "worldmonitor.cyber.v1.ListCyberThreatsRequest",
  "listDefensePatents": "worldmonitor.military.v1.ListDefensePatentsRequest",
  "listEarningsCalendar": "worldmonitor.market.v1.ListEarningsCalendarRequest",
  "listEarthquakes": "worldmonitor.seismology.v1.ListEarthquakesRequest",
  "listEnergyDisruptions": "worldmonitor.supply_chain.v1.ListEnergyDisruptionsRequest",
  "listErrorReports": "worldmonitor.news.v1.ListErrorReportsRequest",
  "listFeedDigest": "worldmonitor.news.v1.ListFeedDigestRequest",
  "listFireDetections": "worldmonitor.wildfire.v1.ListFireDetectionsRequest",
  "listFuelShortages": "worldmonitor.supply_chain.v1.ListFuelShortagesRequest",
  "listGlobalTenders": "worldmonitor.economic.v1.ListGlobalTendersRequest",
  "listGpsInterference": "worldmonitor.intelligence.v1.ListGpsInterferenceRequest",
  "listHackernewsItems": "worldmonitor.research.v1.ListHackernewsItemsRequest",
  "listInternetOutages": "worldmonitor.infrastructure.v1.ListInternetOutagesRequest",
  "listInternetTrafficAnomalies": "worldmonitor.infrastructure.v1.ListInternetTrafficAnomaliesRequest",
  "listLabelChanges": "worldmonitor.news.v1.ListLabelChangesRequest",
  "listMarketImplications": "worldmonitor.intelligence.v1.ListMarketImplicationsRequest",
  "listMarketQuotes": "worldmonitor.market.v1.ListMarketQuotesRequest",
  "listMaterialEvents": "worldmonitor.intelligence.v1.ListMaterialEventsRequest",
  "listMediaPerspective": "worldmonitor.news.v1.ListMediaPerspectiveRequest",
  "listMilitaryBases": "worldmonitor.military.v1.ListMilitaryBasesRequest",
  "listMilitaryFlights": "worldmonitor.military.v1.ListMilitaryFlightsRequest",
  "listMonitoredCompanies": "worldmonitor.company_monitoring.v1.ListMonitoredCompaniesRequest",
  "listNaturalEvents": "worldmonitor.natural.v1.ListNaturalEventsRequest",
  "listNavigationalWarnings": "worldmonitor.maritime.v1.ListNavigationalWarningsRequest",
  "listNewsPool": "worldmonitor.news.v1.ListNewsPoolRequest",
  "listOrefAlerts": "worldmonitor.intelligence.v1.ListOrefAlertsRequest",
  "listPipelines": "worldmonitor.supply_chain.v1.ListPipelinesRequest",
  "listPredictionMarkets": "worldmonitor.prediction.v1.ListPredictionMarketsRequest",
  "listRadiationObservations": "worldmonitor.radiation.v1.ListRadiationObservationsRequest",
  "listRetailerPriceSpreads": "worldmonitor.consumer_prices.v1.ListRetailerPriceSpreadsRequest",
  "listSanctionsPressure": "worldmonitor.sanctions.v1.ListSanctionsPressureRequest",
  "listSatellites": "worldmonitor.intelligence.v1.ListSatellitesRequest",
  "listServiceStatuses": "worldmonitor.infrastructure.v1.ListServiceStatusesRequest",
  "listSourceItems": "worldmonitor.news.v1.ListSourceItemsRequest",
  "listStablecoinMarkets": "worldmonitor.market.v1.ListStablecoinMarketsRequest",
  "listStorageFacilities": "worldmonitor.supply_chain.v1.ListStorageFacilitiesRequest",
  "listStoredStockBacktests": "worldmonitor.market.v1.ListStoredStockBacktestsRequest",
  "listTechEvents": "worldmonitor.research.v1.ListTechEventsRequest",
  "listTelegramFeed": "worldmonitor.intelligence.v1.ListTelegramFeedRequest",
  "listThermalEscalations": "worldmonitor.thermal.v1.ListThermalEscalationsRequest",
  "listTrendingRepos": "worldmonitor.research.v1.ListTrendingReposRequest",
  "listUcdpEvents": "worldmonitor.conflict.v1.ListUcdpEventsRequest",
  "listUnrestEvents": "worldmonitor.unrest.v1.ListUnrestEventsRequest",
  "listVulnerabilityRankings": "worldmonitor.supply_chain.v1.ListVulnerabilityRankingsRequest",
  "listWebcams": "worldmonitor.webcam.v1.ListWebcamsRequest",
  "listWorldBankIndicators": "worldmonitor.economic.v1.ListWorldBankIndicatorsRequest",
  "listXFeed": "worldmonitor.intelligence.v1.ListXFeedRequest",
  "lookupSanctionEntity": "worldmonitor.sanctions.v1.LookupSanctionEntityRequest",
  "recordBaselineSnapshot": "worldmonitor.infrastructure.v1.RecordBaselineSnapshotRequest",
  "registerInterest": "worldmonitor.leads.v1.RegisterInterestRequest",
  "registerWebhook": "worldmonitor.shipping.v2.RegisterWebhookRequest",
  "reverseGeocode": "worldmonitor.infrastructure.v1.ReverseGeocodeRequest",
  "reviewErrorReport": "worldmonitor.news.v1.ReviewErrorReportRequest",
  "routeIntelligence": "worldmonitor.shipping.v2.RouteIntelligenceRequest",
  "runScenario": "worldmonitor.scenario.v1.RunScenarioRequest",
  "searchClaimHeadlines": "worldmonitor.news.v1.SearchClaimHeadlinesRequest",
  "searchFactChecks": "worldmonitor.news.v1.SearchFactChecksRequest",
  "searchFlightPrices": "worldmonitor.aviation.v1.SearchFlightPricesRequest",
  "searchGdeltDocuments": "worldmonitor.intelligence.v1.SearchGdeltDocumentsRequest",
  "searchGoogleDates": "worldmonitor.aviation.v1.SearchGoogleDatesRequest",
  "searchGoogleFlights": "worldmonitor.aviation.v1.SearchGoogleFlightsRequest",
  "searchImagery": "worldmonitor.imagery.v1.SearchImageryRequest",
  "searchIntelHistory": "worldmonitor.intelligence.v1.SearchIntelHistoryRequest",
  "searchSecFilings": "worldmonitor.intelligence.v1.SearchSecFilingsRequest",
  "setMonitoredCompanyState": "worldmonitor.company_monitoring.v1.SetMonitoredCompanyStateRequest",
  "submitContact": "worldmonitor.leads.v1.SubmitContactRequest",
  "submitErrorReport": "worldmonitor.news.v1.SubmitErrorReportRequest",
  "summarizeArticle": "worldmonitor.news.v1.SummarizeArticleRequest",
  "trackAircraft": "worldmonitor.aviation.v1.TrackAircraftRequest",
  "triggerSimulation": "worldmonitor.forecast.v1.TriggerSimulationRequest",
  "updateMonitoredCompany": "worldmonitor.company_monitoring.v1.UpdateMonitoredCompanyRequest"
};
var GENERATED_MESSAGE_RULES = {
  "worldmonitor.aviation.v1.GetAirportOpsSummaryRequest": {
    "fields": {
      "airports": {
        "kind": "string",
        "repeated": true,
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "repeatedMinItems": 1,
        "repeatedMaxItems": 20,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.aviation.v1.GetCarrierOpsRequest": {
    "fields": {
      "airports": {
        "kind": "string",
        "repeated": true,
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "repeatedMinItems": 1,
        "repeatedMaxItems": 20,
        "stringMaxBytes": 65536
      },
      "minFlights": {
        "kind": "int32",
        "numberGte": 0
      }
    }
  },
  "worldmonitor.aviation.v1.GetFlightStatusRequest": {
    "fields": {
      "flightNumber": {
        "kind": "string",
        "required": true,
        "stringMinLen": 3,
        "stringMaxLen": 10,
        "stringMaxBytes": 65536
      },
      "date": {
        "kind": "string",
        "required": true,
        "stringLen": 10,
        "stringMaxBytes": 65536
      },
      "origin": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.aviation.v1.GetYoutubeLiveStreamInfoRequest": {
    "fields": {
      "channel": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "videoId": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.aviation.v1.ListAirportDelaysRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.aviation.v1.ListAirportFlightsRequest": {
    "fields": {
      "airport": {
        "kind": "string",
        "required": true,
        "stringMinLen": 3,
        "stringMaxLen": 4,
        "stringMaxBytes": 65536
      },
      "limit": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 100
      }
    }
  },
  "worldmonitor.aviation.v1.ListAviationNewsRequest": {
    "fields": {
      "entities": {
        "kind": "string",
        "repeated": true,
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "repeatedMinItems": 1,
        "repeatedMaxItems": 10,
        "stringMaxBytes": 65536
      },
      "windowHours": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 168
      },
      "maxItems": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 50
      }
    }
  },
  "worldmonitor.aviation.v1.SearchFlightPricesRequest": {
    "fields": {
      "origin": {
        "kind": "string",
        "required": true,
        "stringMinLen": 3,
        "stringMaxLen": 4,
        "stringMaxBytes": 65536
      },
      "destination": {
        "kind": "string",
        "required": true,
        "stringMinLen": 3,
        "stringMaxLen": 4,
        "stringMaxBytes": 65536
      },
      "departureDate": {
        "kind": "string",
        "required": true,
        "stringLen": 10,
        "stringMaxBytes": 65536
      },
      "returnDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "adults": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 9
      },
      "maxResults": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 50
      },
      "currency": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "market": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.aviation.v1.SearchGoogleDatesRequest": {
    "fields": {
      "origin": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "destination": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "startDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "endDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "cabinClass": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "maxStops": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "departureWindow": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "airlines": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.aviation.v1.SearchGoogleFlightsRequest": {
    "fields": {
      "origin": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "destination": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "departureDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "returnDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "cabinClass": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "maxStops": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "departureWindow": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "airlines": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "sortBy": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.aviation.v1.TrackAircraftRequest": {
    "fields": {
      "icao24": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "callsign": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.batch.v1.BatchOperation": {
    "fields": {
      "id": {
        "kind": "string",
        "stringMaxLen": 64,
        "stringMaxBytes": 65536
      },
      "path": {
        "kind": "string",
        "required": true,
        "stringMaxLen": 2048,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.batch.v1.ExecuteBatchRequest": {
    "fields": {
      "operations": {
        "kind": "message",
        "repeated": true,
        "messageType": "worldmonitor.batch.v1.BatchOperation",
        "repeatedMinItems": 1,
        "repeatedMaxItems": 20
      }
    }
  },
  "worldmonitor.climate.v1.ListClimateAnomaliesRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.climate.v1.ListClimateDisastersRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.company_monitoring.v1.CompanyClaimInput": {
    "fields": {
      "type": {
        "kind": "enum",
        "enumValues": [
          "COMPANY_CLAIM_TYPE_UNSPECIFIED",
          "COMPANY_CLAIM_TYPE_ALIAS",
          "COMPANY_CLAIM_TYPE_DOMAIN",
          "COMPANY_CLAIM_TYPE_LEGAL_IDENTIFIER",
          "COMPANY_CLAIM_TYPE_X_ACCOUNT_ID",
          "COMPANY_CLAIM_TYPE_X_HANDLE",
          "COMPANY_CLAIM_TYPE_LOCATION",
          "COMPANY_CLAIM_TYPE_CUSTOMER_REFERENCE"
        ],
        "required": true,
        "enumDefinedOnly": true
      },
      "value": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 512
      }
    }
  },
  "worldmonitor.company_monitoring.v1.CreateMonitoredCompanyRequest": {
    "fields": {
      "company": {
        "kind": "message",
        "messageType": "worldmonitor.company_monitoring.v1.MonitoredCompanyInput",
        "required": true
      },
      "clientRequestId": {
        "kind": "string",
        "stringMaxBytes": 64
      }
    }
  },
  "worldmonitor.company_monitoring.v1.GetCompanyCoverageRequest": {
    "fields": {
      "companyId": {
        "kind": "string",
        "required": true,
        "stringPattern": "^cm_company_[0-9A-HJKMNP-TV-Z]{26}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.company_monitoring.v1.GetCompanyMaterialEventRequest": {
    "fields": {
      "impactId": {
        "kind": "string",
        "required": true,
        "stringPattern": "^cm_impact_[0-9A-HJKMNP-TV-Z]{26}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.company_monitoring.v1.ImportMonitoredCompanyBatchRequest": {
    "fields": {
      "contractVersion": {
        "kind": "string",
        "required": true,
        "stringConst": "cm-import-v1",
        "stringMaxBytes": 65536
      },
      "clientImportId": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 64
      },
      "rows": {
        "kind": "message",
        "repeated": true,
        "messageType": "worldmonitor.company_monitoring.v1.MonitoredCompanyImportRow",
        "repeatedMinItems": 1,
        "repeatedMaxItems": 100
      }
    }
  },
  "worldmonitor.company_monitoring.v1.ListCompanyEventChangesRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 2048,
        "stringPattern": "^cmc1\\.[A-Za-z0-9_-]{16,1000}[A-Za-z0-9_-]{0,536}\\.[A-Za-z0-9_-]{43}$"
      },
      "pageSize": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 100
      }
    }
  },
  "worldmonitor.company_monitoring.v1.ListCompanyEventImpactsRequest": {
    "fields": {
      "companyIds": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 100,
        "stringPattern": "^cm_company_[0-9A-HJKMNP-TV-Z]{26}$",
        "stringMaxBytes": 65536
      },
      "directions": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 3,
        "stringPattern": "^(?:positive|negative|mixed|MATERIAL_IMPACT_DIRECTION_(?:POSITIVE|NEGATIVE|MIXED))$",
        "stringMaxBytes": 65536
      },
      "lifecycles": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 3,
        "stringPattern": "^(?:admitted|corrected|retracted|MATERIAL_IMPACT_LIFECYCLE_(?:ADMITTED|CORRECTED|RETRACTED))$",
        "stringMaxBytes": 65536
      },
      "pageSize": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 100
      },
      "cursor": {
        "kind": "string",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "stringMaxBytes": 2048,
        "stringPattern": "^cmc1\\.[A-Za-z0-9_-]{16,1000}[A-Za-z0-9_-]{0,536}\\.[A-Za-z0-9_-]{43}$"
      }
    }
  },
  "worldmonitor.company_monitoring.v1.ListMonitoredCompaniesRequest": {
    "fields": {
      "lifecycles": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 3,
        "stringPattern": "^(?:active|paused|removed|MONITORED_COMPANY_LIFECYCLE_(?:ACTIVE|PAUSED|REMOVED))$",
        "stringMaxBytes": 65536
      },
      "coverageStates": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 7,
        "stringPattern": "^(?:awaiting_first_scan|identity_unresolved|adequate|partial|stale|unavailable|needs_confirmation|COMPANY_COVERAGE_STATE_(?:AWAITING_FIRST_SCAN|IDENTITY_UNRESOLVED|ADEQUATE|PARTIAL|STALE|UNAVAILABLE|NEEDS_CONFIRMATION))$",
        "stringMaxBytes": 65536
      },
      "pageSize": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 100
      },
      "cursor": {
        "kind": "string",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "stringMaxBytes": 2048,
        "stringPattern": "^cmc1\\.[A-Za-z0-9_-]{16,1000}[A-Za-z0-9_-]{0,536}\\.[A-Za-z0-9_-]{43}$"
      }
    }
  },
  "worldmonitor.company_monitoring.v1.MonitoredCompanyImportRow": {
    "fields": {
      "ordinal": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 99
      },
      "company": {
        "kind": "message",
        "messageType": "worldmonitor.company_monitoring.v1.MonitoredCompanyInput",
        "required": true
      }
    }
  },
  "worldmonitor.company_monitoring.v1.MonitoredCompanyInput": {
    "fields": {
      "name": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 256
      },
      "domicileCountry": {
        "kind": "enum",
        "enumValues": [
          "DOMICILE_COUNTRY_UNSPECIFIED",
          "DOMICILE_COUNTRY_US",
          "DOMICILE_COUNTRY_GB"
        ],
        "required": true,
        "enumDefinedOnly": true
      },
      "aliases": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 20,
        "stringMinLen": 1,
        "stringMaxBytes": 256
      },
      "domains": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 10,
        "stringMinLen": 1,
        "stringMaxBytes": 253,
        "stringPattern": "^(?:www\\.)?(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.)+[A-Za-z](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\\.?$"
      },
      "identifiers": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 20,
        "stringMinLen": 1,
        "stringMaxBytes": 512
      },
      "xHandles": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 5,
        "stringMaxBytes": 16,
        "stringPattern": "^@?[A-Za-z0-9_]{1,15}$"
      },
      "locations": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 20,
        "stringMinLen": 1,
        "stringMaxBytes": 256
      },
      "customerReference": {
        "kind": "string",
        "stringMaxBytes": 128
      }
    }
  },
  "worldmonitor.company_monitoring.v1.MonitoredCompanyPatch": {
    "fields": {
      "name": {
        "kind": "string",
        "optional": true,
        "stringMinLen": 1,
        "stringMaxBytes": 256
      },
      "domicileCountry": {
        "kind": "enum",
        "optional": true,
        "enumValues": [
          "DOMICILE_COUNTRY_UNSPECIFIED",
          "DOMICILE_COUNTRY_US",
          "DOMICILE_COUNTRY_GB"
        ],
        "enumDefinedOnly": true,
        "enumNotIn": [
          "DOMICILE_COUNTRY_UNSPECIFIED"
        ]
      },
      "addClaims": {
        "kind": "message",
        "repeated": true,
        "messageType": "worldmonitor.company_monitoring.v1.CompanyClaimInput",
        "repeatedMaxItems": 81
      },
      "removeClaimIds": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 81,
        "stringPattern": "^cm_claim_[0-9A-HJKMNP-TV-Z]{26}$",
        "stringMaxBytes": 65536
      },
      "customerReference": {
        "kind": "string",
        "optional": true,
        "stringMaxBytes": 128
      }
    }
  },
  "worldmonitor.company_monitoring.v1.SetMonitoredCompanyStateRequest": {
    "fields": {
      "companyId": {
        "kind": "string",
        "required": true,
        "stringPattern": "^cm_company_[0-9A-HJKMNP-TV-Z]{26}$",
        "stringMaxBytes": 65536
      },
      "targetLifecycle": {
        "kind": "enum",
        "enumValues": [
          "MONITORED_COMPANY_LIFECYCLE_UNSPECIFIED",
          "MONITORED_COMPANY_LIFECYCLE_ACTIVE",
          "MONITORED_COMPANY_LIFECYCLE_PAUSED",
          "MONITORED_COMPANY_LIFECYCLE_REMOVED"
        ],
        "required": true,
        "enumDefinedOnly": true
      }
    }
  },
  "worldmonitor.company_monitoring.v1.UpdateMonitoredCompanyRequest": {
    "fields": {
      "companyId": {
        "kind": "string",
        "required": true,
        "stringPattern": "^cm_company_[0-9A-HJKMNP-TV-Z]{26}$",
        "stringMaxBytes": 65536
      },
      "patch": {
        "kind": "message",
        "messageType": "worldmonitor.company_monitoring.v1.MonitoredCompanyPatch",
        "required": true
      }
    }
  },
  "worldmonitor.conflict.v1.GetHumanitarianSummaryBatchRequest": {
    "fields": {
      "countryCodes": {
        "kind": "string",
        "repeated": true,
        "repeatedMinItems": 1,
        "repeatedMaxItems": 25,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.conflict.v1.GetHumanitarianSummaryRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.conflict.v1.ListAcledEventsRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.conflict.v1.ListUcdpEventsRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.consumer_prices.v1.GetConsumerPriceBasketSeriesRequest": {
    "fields": {
      "marketCode": {
        "kind": "string",
        "stringMaxLen": 2,
        "stringPattern": "^([A-Za-z]{2})?$",
        "stringMaxBytes": 65536
      },
      "basketSlug": {
        "kind": "string",
        "stringMaxLen": 13,
        "stringPattern": "^([Ee][Ss][Ss][Ee][Nn][Tt][Ii][Aa][Ll][Ss]-[A-Za-z]{2})?$",
        "stringMaxBytes": 65536
      },
      "range": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.consumer_prices.v1.GetConsumerPriceFreshnessRequest": {
    "fields": {
      "marketCode": {
        "kind": "string",
        "stringMaxLen": 2,
        "stringPattern": "^([A-Za-z]{2})?$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.consumer_prices.v1.GetConsumerPriceOverviewRequest": {
    "fields": {
      "marketCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "basketSlug": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.consumer_prices.v1.ListConsumerPriceCategoriesRequest": {
    "fields": {
      "marketCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "basketSlug": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "range": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.consumer_prices.v1.ListConsumerPriceMoversRequest": {
    "fields": {
      "marketCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "range": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "categorySlug": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.consumer_prices.v1.ListRetailerPriceSpreadsRequest": {
    "fields": {
      "marketCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "basketSlug": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.cyber.v1.ListCyberThreatsRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.displacement.v1.GetCrossBorderMovementsRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "stringPattern": "^[A-Za-z]{2}$",
        "stringMaxBytes": 65536
      },
      "route": {
        "kind": "string",
        "stringMaxLen": 120,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.displacement.v1.GetDisplacementSummaryRequest": {
    "fields": {
      "year": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1951,
        "numberLte": 9999
      },
      "countryLimit": {
        "kind": "int32",
        "numberGte": 0
      },
      "flowLimit": {
        "kind": "int32",
        "numberGte": 0
      }
    }
  },
  "worldmonitor.displacement.v1.GetInternalDisplacementRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "stringPattern": "^(?:|[A-Za-z]{3})$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.displacement.v1.GetPopulationExposureRequest": {
    "fields": {
      "mode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "lat": {
        "kind": "double",
        "numberGte": -90,
        "numberLte": 90
      },
      "lon": {
        "kind": "double",
        "numberGte": -180,
        "numberLte": 180
      },
      "radius": {
        "kind": "double",
        "numberGte": 0
      }
    }
  },
  "worldmonitor.economic.v1.GetBlsSeriesRequest": {
    "fields": {
      "seriesId": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.economic.v1.GetCapitalFlowsRequest": {
    "fields": {
      "country": {
        "kind": "string",
        "stringMaxLen": 2,
        "stringMaxBytes": 65536
      },
      "counterpart": {
        "kind": "string",
        "stringMaxLen": 2,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.economic.v1.GetEconomicCalendarRequest": {
    "fields": {
      "fromDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "toDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.economic.v1.GetEnergyCapacityRequest": {
    "fields": {
      "energySources": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.economic.v1.GetEnergyCrisisPoliciesRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "category": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.economic.v1.GetEnergyPricesRequest": {
    "fields": {
      "commodities": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.economic.v1.GetFredSeriesBatchRequest": {
    "fields": {
      "seriesIds": {
        "kind": "string",
        "repeated": true,
        "repeatedMinItems": 1,
        "repeatedMaxItems": 20,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.economic.v1.GetFredSeriesRequest": {
    "fields": {
      "seriesId": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.economic.v1.GetGovernmentYieldCurveRequest": {
    "fields": {
      "country": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      },
      "limit": {
        "kind": "int32",
        "optional": true,
        "numberGte": 0,
        "numberLte": 366
      }
    }
  },
  "worldmonitor.economic.v1.GetNo2ActivityRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "stringPattern": "^([A-Za-z]{2})?$",
        "stringMaxBytes": 65536
      },
      "regionId": {
        "kind": "string",
        "stringPattern": "^([a-z0-9-]{1,64})?$",
        "stringMaxBytes": 65536
      },
      "kind": {
        "kind": "enum",
        "enumValues": [
          "NO2_REGION_KIND_UNSPECIFIED",
          "NO2_REGION_KIND_COUNTRY",
          "NO2_REGION_KIND_CLUSTER"
        ],
        "enumDefinedOnly": true
      }
    }
  },
  "worldmonitor.economic.v1.GetUsCpiMonthlyRequest": {
    "fields": {
      "limit": {
        "kind": "int32",
        "optional": true,
        "numberGte": 0,
        "numberLte": 366
      }
    }
  },
  "worldmonitor.economic.v1.GetUsInterestRatesRequest": {
    "fields": {
      "limit": {
        "kind": "int32",
        "optional": true,
        "numberGte": 0,
        "numberLte": 366
      }
    }
  },
  "worldmonitor.economic.v1.GetUsTreasuryParYieldCurveRequest": {
    "fields": {
      "limit": {
        "kind": "int32",
        "optional": true,
        "numberGte": 0,
        "numberLte": 366
      }
    }
  },
  "worldmonitor.economic.v1.GetWorldCpiMonthlyRequest": {
    "fields": {
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "limit": {
        "kind": "int32",
        "optional": true,
        "numberGte": 0,
        "numberLte": 366
      }
    }
  },
  "worldmonitor.economic.v1.ListGlobalTendersRequest": {
    "fields": {
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "countries": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "region": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "source": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "status": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "deadlineFrom": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "deadlineTo": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "currency": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "category": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "query": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "sort": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "buyer": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "publishedFrom": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "publishedTo": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.economic.v1.ListWorldBankIndicatorsRequest": {
    "fields": {
      "indicatorCode": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      },
      "countryCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.forecast.v1.GetForecastsRequest": {
    "fields": {
      "domain": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "region": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.forecast.v1.GetSimulationOutcomeRequest": {
    "fields": {
      "runId": {
        "kind": "string",
        "stringMaxLen": 128,
        "stringPattern": "^([0-9]{13,}-[A-Za-z0-9-]{1,64})?$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.forecast.v1.GetSimulationPackageRequest": {
    "fields": {
      "runId": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.forecast.v1.TriggerSimulationRequest": {
    "fields": {
      "clientVersion": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.giving.v1.GetGivingSummaryRequest": {
    "fields": {}
  },
  "worldmonitor.imagery.v1.SearchImageryRequest": {
    "fields": {
      "bbox": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "datetime": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "source": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.infrastructure.v1.BaselineUpdate": {
    "fields": {
      "type": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      },
      "region": {
        "kind": "string",
        "stringConst": "global",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.infrastructure.v1.GetBootstrapDataRequest": {
    "fields": {
      "tier": {
        "kind": "string",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "stringPattern": "^(fast|slow)$",
        "stringMaxBytes": 65536
      },
      "keys": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 100,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.infrastructure.v1.GetTemporalBaselineRequest": {
    "fields": {
      "type": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      },
      "region": {
        "kind": "string",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "stringConst": "global",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.infrastructure.v1.ListInternetOutagesRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.infrastructure.v1.ListInternetTrafficAnomaliesRequest": {
    "fields": {
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.infrastructure.v1.ListServiceStatusesRequest": {
    "fields": {}
  },
  "worldmonitor.infrastructure.v1.RecordBaselineSnapshotRequest": {
    "fields": {
      "updates": {
        "kind": "message",
        "repeated": true,
        "messageType": "worldmonitor.infrastructure.v1.BaselineUpdate"
      }
    }
  },
  "worldmonitor.infrastructure.v1.ReverseGeocodeRequest": {
    "fields": {}
  },
  "worldmonitor.intelligence.v1.ClassifyEventRequest": {
    "fields": {
      "title": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      },
      "description": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "source": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.ComputeEnergyShockScenarioRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "chokepointId": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "fuelMode": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.DeductSituationRequest": {
    "fields": {
      "query": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "geoContext": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "framework": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetCompanyEnrichmentRequest": {
    "fields": {
      "domain": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "name": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "ticker": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetCountryCoverageRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "windowHours": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 168
      },
      "limit": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 500
      }
    }
  },
  "worldmonitor.intelligence.v1.GetCountryEnergyProfileRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetCountryFactsRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetCountryHistoryRequest": {
    "fields": {
      "country": {
        "kind": "string",
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "days": {
        "kind": "int32",
        "numberGte": 0
      }
    }
  },
  "worldmonitor.intelligence.v1.GetCountryIntelBriefRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "framework": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetCountryPortActivityRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetCountryRiskRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetCountrySignalObservationsRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "family": {
        "kind": "enum",
        "enumValues": [
          "COUNTRY_SIGNAL_FAMILY_UNSPECIFIED",
          "COUNTRY_SIGNAL_FAMILY_OUTAGES",
          "COUNTRY_SIGNAL_FAMILY_UNREST",
          "COUNTRY_SIGNAL_FAMILY_FIRES",
          "COUNTRY_SIGNAL_FAMILY_RADIATION",
          "COUNTRY_SIGNAL_FAMILY_SANCTIONS",
          "COUNTRY_SIGNAL_FAMILY_CONFLICT",
          "COUNTRY_SIGNAL_FAMILY_POSTURE",
          "COUNTRY_SIGNAL_FAMILY_FLIGHT_PAGE"
        ],
        "required": true,
        "enumDefinedOnly": true,
        "enumNotIn": [
          "COUNTRY_SIGNAL_FAMILY_UNSPECIFIED"
        ]
      },
      "windowIndex": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 1
      },
      "cursor": {
        "kind": "string",
        "stringMaxLen": 200,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetGdeltTopicTimelineRequest": {
    "fields": {
      "topic": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetIntelTimelineRequest": {
    "fields": {
      "domain": {
        "kind": "string",
        "stringPattern": "^(conflict|military|energy)?$",
        "stringMaxBytes": 65536
      },
      "country": {
        "kind": "string",
        "stringPattern": "^([A-Z]{2})?$",
        "stringMaxBytes": 65536
      },
      "from": {
        "kind": "int64",
        "int64Encoding": "number",
        "numberGte": 0
      },
      "to": {
        "kind": "int64",
        "int64Encoding": "number",
        "numberGte": 0
      },
      "limit": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 200
      },
      "cursor": {
        "kind": "string",
        "optional": true,
        "stringMaxLen": 4096,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetPizzintStatusRequest": {
    "fields": {}
  },
  "worldmonitor.intelligence.v1.GetRegimeHistoryRequest": {
    "fields": {
      "regionId": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxLen": 32,
        "stringPattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
        "stringMaxBytes": 65536
      },
      "limit": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 100
      }
    }
  },
  "worldmonitor.intelligence.v1.GetRegionalBriefRequest": {
    "fields": {
      "regionId": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxLen": 32,
        "stringPattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetRegionalSnapshotRequest": {
    "fields": {
      "regionId": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxLen": 32,
        "stringPattern": "^[a-z][a-z0-9]*(-[a-z0-9]+)*$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetRiskScoresRequest": {
    "fields": {
      "region": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.GetSimilarEventsRequest": {
    "fields": {
      "situation": {
        "kind": "string",
        "required": true,
        "stringMinLen": 10,
        "stringMaxLen": 1e3,
        "stringMaxBytes": 65536
      },
      "domain": {
        "kind": "string",
        "stringPattern": "^(conflict|military|energy)?$",
        "stringMaxBytes": 65536
      },
      "country": {
        "kind": "string",
        "stringPattern": "^([A-Z]{2})?$",
        "stringMaxBytes": 65536
      },
      "limit": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 32
      }
    }
  },
  "worldmonitor.intelligence.v1.ListCompanySignalsRequest": {
    "fields": {
      "company": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "domain": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "ticker": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.ListGpsInterferenceRequest": {
    "fields": {
      "region": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.ListMarketImplicationsRequest": {
    "fields": {
      "frameworkId": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.ListMaterialEventsRequest": {
    "fields": {
      "itemCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.ListOrefAlertsRequest": {
    "fields": {}
  },
  "worldmonitor.intelligence.v1.ListSatellitesRequest": {
    "fields": {
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.ListTelegramFeedRequest": {
    "fields": {
      "topic": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "channel": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.ListXFeedRequest": {
    "fields": {
      "topic": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "account": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.SearchGdeltDocumentsRequest": {
    "fields": {
      "query": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      },
      "maxRecords": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 250
      },
      "timespan": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "toneFilter": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "sort": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.intelligence.v1.SearchIntelHistoryRequest": {
    "fields": {
      "query": {
        "kind": "string",
        "required": true,
        "stringMinLen": 2,
        "stringMaxLen": 500,
        "stringMaxBytes": 65536
      },
      "domain": {
        "kind": "string",
        "stringPattern": "^(conflict|military|energy)?$",
        "stringMaxBytes": 65536
      },
      "country": {
        "kind": "string",
        "stringPattern": "^([A-Z]{2})?$",
        "stringMaxBytes": 65536
      },
      "from": {
        "kind": "int64",
        "int64Encoding": "number",
        "numberGte": 0
      },
      "to": {
        "kind": "int64",
        "int64Encoding": "number",
        "numberGte": 0
      },
      "limit": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 64
      }
    }
  },
  "worldmonitor.intelligence.v1.SearchSecFilingsRequest": {
    "fields": {
      "query": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      },
      "forms": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "startDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "endDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.leads.v1.RegisterInterestRequest": {
    "fields": {
      "email": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      },
      "source": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "appVersion": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "referredBy": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "website": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "turnstileToken": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.leads.v1.SubmitContactRequest": {
    "fields": {
      "email": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      },
      "name": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      },
      "organization": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      },
      "phone": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      },
      "message": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "source": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "website": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "turnstileToken": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.maritime.v1.GetVesselSnapshotRequest": {
    "fields": {}
  },
  "worldmonitor.maritime.v1.ListNavigationalWarningsRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "area": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.AnalyzeStockRequest": {
    "fields": {
      "symbol": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxLen": 32,
        "stringMaxBytes": 65536
      },
      "name": {
        "kind": "string",
        "stringMaxLen": 120,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.BacktestStockRequest": {
    "fields": {
      "symbol": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxLen": 32,
        "stringMaxBytes": 65536
      },
      "name": {
        "kind": "string",
        "stringMaxLen": 120,
        "stringMaxBytes": 65536
      },
      "evalWindowDays": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 3,
        "numberLte": 30
      }
    }
  },
  "worldmonitor.market.v1.GetCountryStockIndexRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.GetInsiderTransactionsRequest": {
    "fields": {
      "symbol": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxLen": 32,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.GetPhysicalDivergenceIndexRequest": {
    "fields": {
      "metals": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 2,
        "repeatedUnique": true,
        "stringPattern": "^(?:gold|silver)$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.GetPhysicalPremiumsRequest": {
    "fields": {
      "metals": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 2,
        "repeatedUnique": true,
        "stringPattern": "^(?:gold|silver)$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.GetPriceHistoryRequest": {
    "fields": {
      "symbols": {
        "kind": "string",
        "required": true,
        "stringMaxLen": 100,
        "stringPattern": "^ *[A-Za-z0-9^=.&-]{1,20} *(, *[A-Za-z0-9^=.&-]{1,20} *){0,3}$",
        "stringMaxBytes": 65536
      },
      "range": {
        "kind": "string",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "stringPattern": "^(1mo|3mo|6mo|1y)?$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.GetSectorSummaryRequest": {
    "fields": {
      "period": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.GetStockAnalysisHistoryRequest": {
    "fields": {
      "symbols": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "limitPerSymbol": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 1,
        "numberLte": 32
      }
    }
  },
  "worldmonitor.market.v1.ListCommodityQuotesRequest": {
    "fields": {
      "symbols": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.ListCryptoQuotesRequest": {
    "fields": {
      "ids": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 25,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.ListEarningsCalendarRequest": {
    "fields": {
      "fromDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "toDate": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.ListMarketQuotesRequest": {
    "fields": {
      "symbols": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.ListStablecoinMarketsRequest": {
    "fields": {
      "coins": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.market.v1.ListStoredStockBacktestsRequest": {
    "fields": {
      "symbols": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "evalWindowDays": {
        "kind": "int32",
        "ignore": "IGNORE_IF_ZERO_VALUE",
        "numberGte": 3,
        "numberLte": 30
      }
    }
  },
  "worldmonitor.military.v1.GetAircraftDetailsBatchRequest": {
    "fields": {
      "icao24s": {
        "kind": "string",
        "repeated": true,
        "repeatedMinItems": 1,
        "repeatedMaxItems": 20,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.military.v1.GetAircraftDetailsRequest": {
    "fields": {
      "icao24": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[0-9a-fA-F]{6}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.military.v1.GetDefenseIndustrialBaseRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.military.v1.GetTheaterPostureRequest": {
    "fields": {
      "theater": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.military.v1.GetUSNIFleetReportRequest": {
    "fields": {}
  },
  "worldmonitor.military.v1.GetWingbitsLiveFlightRequest": {
    "fields": {
      "icao24": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.military.v1.ListDefensePatentsRequest": {
    "fields": {
      "cpcCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "assignee": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.military.v1.ListMilitaryBasesRequest": {
    "fields": {
      "type": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "kind": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.military.v1.ListMilitaryFlightsRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.natural.v1.ListNaturalEventsRequest": {
    "fields": {}
  },
  "worldmonitor.news.v1.GetSummarizeArticleCacheRequest": {
    "fields": {
      "cacheKey": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.ListCountryHeadlinesRequest": {
    "fields": {
      "countryCodes": {
        "kind": "string",
        "repeated": true,
        "repeatedMinItems": 1,
        "repeatedMaxItems": 250,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.ListErrorReportsRequest": {
    "fields": {
      "status": {
        "kind": "string",
        "stringMaxLen": 16,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.ListFeedDigestRequest": {
    "fields": {
      "variant": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "lang": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.ListLabelChangesRequest": {
    "fields": {
      "storyId": {
        "kind": "string",
        "stringMaxLen": 64,
        "stringMaxBytes": 65536
      },
      "limit": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 200
      }
    }
  },
  "worldmonitor.news.v1.ListMediaPerspectiveRequest": {
    "fields": {
      "subjectCountry": {
        "kind": "string",
        "stringMinLen": 2,
        "stringMaxLen": 2,
        "stringMaxBytes": 65536
      },
      "outletCountries": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 30,
        "stringMaxBytes": 65536
      },
      "audience": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "windowHours": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 96
      },
      "outletRegions": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 5,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.ListNewsPoolRequest": {
    "fields": {
      "languages": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 8,
        "stringMaxBytes": 65536
      },
      "editions": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 8,
        "stringMaxBytes": 65536
      },
      "category": {
        "kind": "string",
        "stringMaxLen": 32,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.ListSourceItemsRequest": {
    "fields": {
      "editions": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 8,
        "stringMaxBytes": 65536
      },
      "category": {
        "kind": "string",
        "stringMinLen": 1,
        "stringMaxLen": 32,
        "stringMaxBytes": 65536
      },
      "sources": {
        "kind": "string",
        "repeated": true,
        "repeatedMinItems": 1,
        "repeatedMaxItems": 24,
        "stringMaxBytes": 65536
      },
      "lang": {
        "kind": "string",
        "stringMaxLen": 8,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.ReviewErrorReportRequest": {
    "fields": {
      "reportId": {
        "kind": "string",
        "stringMinLen": 1,
        "stringMaxLen": 64,
        "stringMaxBytes": 65536
      },
      "decision": {
        "kind": "string",
        "stringMaxLen": 16,
        "stringMaxBytes": 65536
      },
      "publicNote": {
        "kind": "string",
        "stringMaxLen": 500,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.SearchClaimHeadlinesRequest": {
    "fields": {
      "claim": {
        "kind": "string",
        "stringMaxLen": 300,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.SearchFactChecksRequest": {
    "fields": {
      "claim": {
        "kind": "string",
        "stringMaxLen": 300,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.SubmitErrorReportRequest": {
    "fields": {
      "message": {
        "kind": "string",
        "stringMinLen": 10,
        "stringMaxLen": 2e3,
        "stringMaxBytes": 65536
      },
      "storyId": {
        "kind": "string",
        "stringMaxLen": 64,
        "stringMaxBytes": 65536
      },
      "url": {
        "kind": "string",
        "stringMaxLen": 2048,
        "stringMaxBytes": 65536
      },
      "contact": {
        "kind": "string",
        "stringMaxLen": 320,
        "stringMaxBytes": 65536
      },
      "website": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.news.v1.SummarizeArticleRequest": {
    "fields": {
      "provider": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxBytes": 65536
      },
      "headlines": {
        "kind": "string",
        "repeated": true,
        "repeatedMinItems": 1,
        "stringMaxBytes": 65536
      },
      "mode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "geoContext": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "variant": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "lang": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "systemAppend": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "bodies": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.prediction.v1.ListPredictionMarketsRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "category": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "query": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "minLiquidity": {
        "kind": "double",
        "numberGte": 0
      }
    }
  },
  "worldmonitor.radiation.v1.ListRadiationObservationsRequest": {
    "fields": {}
  },
  "worldmonitor.research.v1.ListArxivPapersRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "category": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "query": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.research.v1.ListHackernewsItemsRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "feedType": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.research.v1.ListTechEventsRequest": {
    "fields": {
      "type": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "limit": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 500
      },
      "days": {
        "kind": "int32",
        "numberGte": 0
      }
    }
  },
  "worldmonitor.research.v1.ListTrendingReposRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "language": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "period": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.resilience.v1.GetDemographicsCapabilityRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.resilience.v1.GetFoodStocksRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "commodity": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.resilience.v1.GetResilienceIndicatorsRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.resilience.v1.GetResilienceScoreRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.safety.v1.GetTorontoSafetyRequest": {
    "fields": {
      "dataset": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "division": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "neighbourhood": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "offence": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.sanctions.v1.ListSanctionsPressureRequest": {
    "fields": {}
  },
  "worldmonitor.sanctions.v1.LookupSanctionEntityRequest": {
    "fields": {
      "q": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.scenario.v1.GetScenarioStatusRequest": {
    "fields": {
      "jobId": {
        "kind": "string",
        "required": true,
        "stringPattern": "^scenario:[0-9]{13}:([a-f0-9]{32}|[a-z0-9]{8})$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.scenario.v1.RunScenarioRequest": {
    "fields": {
      "scenarioId": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxLen": 128,
        "stringMaxBytes": 65536
      },
      "iso2": {
        "kind": "string",
        "stringPattern": "^([A-Z]{2})?$",
        "stringMaxBytes": 65536
      },
      "disruptionPct": {
        "kind": "int32",
        "optional": true,
        "numberGte": 0,
        "numberLte": 100
      }
    }
  },
  "worldmonitor.scorecard.v1.GetBlocScorecardRequest": {
    "fields": {
      "preset": {
        "kind": "string",
        "stringPattern": "^(?:|USMCA|EU27|BRICS|GCC|ASEAN|NATO)$",
        "stringMaxBytes": 65536
      },
      "members": {
        "kind": "string",
        "repeated": true,
        "repeatedMaxItems": 30,
        "repeatedUnique": true,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.scorecard.v1.GetFiveFactorScorecardRequest": {
    "fields": {
      "countryCode": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.seismology.v1.ListEarthquakesRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.shipping.v2.RegisterWebhookRequest": {
    "fields": {
      "callbackUrl": {
        "kind": "string",
        "required": true,
        "stringMinLen": 8,
        "stringMaxLen": 2048,
        "stringMaxBytes": 65536
      },
      "chokepointIds": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "alertThreshold": {
        "kind": "int32",
        "optional": true,
        "numberGte": 0,
        "numberLte": 100
      },
      "eventType": {
        "kind": "string",
        "optional": true,
        "stringMaxLen": 64,
        "stringMaxBytes": 65536
      },
      "countries": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "minLiveSignal": {
        "kind": "int32",
        "optional": true,
        "numberGte": 0,
        "numberLte": 40
      },
      "scope": {
        "kind": "message",
        "messageType": "worldmonitor.shipping.v2.WebhookScope"
      }
    }
  },
  "worldmonitor.shipping.v2.RouteIntelligenceRequest": {
    "fields": {
      "fromIso2": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "toIso2": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "cargoType": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "hs2": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.shipping.v2.WebhookScope": {
    "fields": {
      "keywords": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "categories": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "severityFloor": {
        "kind": "string",
        "optional": true,
        "stringMaxBytes": 65536
      },
      "countries": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "hazardTypes": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "minAlertLevel": {
        "kind": "string",
        "optional": true,
        "stringMaxBytes": 65536
      },
      "assetClasses": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "symbols": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "direction": {
        "kind": "string",
        "optional": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetBypassOptionsRequest": {
    "fields": {
      "chokepointId": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      },
      "cargoType": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetChokepointDependenciesRequest": {
    "fields": {
      "chokepointId": {
        "kind": "string",
        "required": true,
        "stringMinLen": 1,
        "stringMaxLen": 80,
        "stringPattern": "^[a-z0-9_\\-]+$",
        "stringMaxBytes": 65536
      },
      "pageSize": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 100
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetChokepointHistoryRequest": {
    "fields": {
      "chokepointId": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetCountryChokepointIndexRequest": {
    "fields": {
      "iso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "hs2": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetCountryCostShockRequest": {
    "fields": {
      "iso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "chokepointId": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      },
      "hs2": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetCountryProductsRequest": {
    "fields": {
      "iso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "hs4": {
        "kind": "string",
        "optional": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetCountryVulnerabilitiesRequest": {
    "fields": {
      "iso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetFuelShortageDetailRequest": {
    "fields": {
      "shortageId": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetMineralProductionRequest": {
    "fields": {
      "commodity": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "iso2": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "stage": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetMultiSectorCostShockRequest": {
    "fields": {
      "iso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "chokepointId": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetPipelineDetailRequest": {
    "fields": {
      "pipelineId": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetRouteExplorerLaneRequest": {
    "fields": {
      "fromIso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "toIso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "hs2": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      },
      "cargoType": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetRouteImpactRequest": {
    "fields": {
      "fromIso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "toIso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "hs2": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetSectorDependencyRequest": {
    "fields": {
      "iso2": {
        "kind": "string",
        "required": true,
        "stringLen": 2,
        "stringPattern": "^[A-Z]{2}$",
        "stringMaxBytes": 65536
      },
      "hs2": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.GetStorageFacilityDetailRequest": {
    "fields": {
      "facilityId": {
        "kind": "string",
        "required": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.ListEnergyDisruptionsRequest": {
    "fields": {
      "assetId": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "assetType": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.ListFuelShortagesRequest": {
    "fields": {
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "product": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "severity": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.ListPipelinesRequest": {
    "fields": {
      "commodityType": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.ListStorageFacilitiesRequest": {
    "fields": {
      "facilityType": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.supply_chain.v1.ListVulnerabilityRankingsRequest": {
    "fields": {
      "commodityId": {
        "kind": "string",
        "stringMaxLen": 80,
        "stringPattern": "^$|^[a-z0-9_\\-]+$",
        "stringMaxBytes": 65536
      },
      "band": {
        "kind": "string",
        "stringPattern": "^$|^(low|moderate|high|critical)$",
        "stringMaxBytes": 65536
      },
      "state": {
        "kind": "string",
        "stringPattern": "^$|^(ok|insufficient_data|stale_input)$",
        "stringMaxBytes": 65536
      },
      "pageSize": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 25
      }
    }
  },
  "worldmonitor.thermal.v1.ListThermalEscalationsRequest": {
    "fields": {}
  },
  "worldmonitor.trade.v1.GetBilateralTariffRequest": {
    "fields": {
      "reportingCountry": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[0-9]{3}$",
        "stringMaxBytes": 65536
      },
      "partnerCountry": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[0-9]{3}$",
        "stringMaxBytes": 65536
      },
      "hsCode": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[0-9]{6}$",
        "stringMaxBytes": 65536
      },
      "year": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 2100
      }
    }
  },
  "worldmonitor.trade.v1.GetTariffTrendsRequest": {
    "fields": {
      "reportingCountry": {
        "kind": "string",
        "stringPattern": "^([0-9]{3})?$",
        "stringMaxBytes": 65536
      },
      "partnerCountry": {
        "kind": "string",
        "stringPattern": "^([0-9]{3})?$",
        "stringMaxBytes": 65536
      },
      "productSector": {
        "kind": "string",
        "stringPattern": "^([a-zA-Z0-9_-]{0,16})?$",
        "stringMaxBytes": 65536
      },
      "years": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 30
      }
    }
  },
  "worldmonitor.trade.v1.GetTradeBarriersRequest": {
    "fields": {
      "countries": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      },
      "measureType": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.trade.v1.GetTradeFlowsRequest": {
    "fields": {
      "reportingCountry": {
        "kind": "string",
        "stringPattern": "^([0-9]{3})?$",
        "stringMaxBytes": 65536
      },
      "partnerCountry": {
        "kind": "string",
        "stringPattern": "^([0-9]{3})?$",
        "stringMaxBytes": 65536
      },
      "years": {
        "kind": "int32",
        "numberGte": 0,
        "numberLte": 30
      }
    }
  },
  "worldmonitor.trade.v1.GetTradeRestrictionsRequest": {
    "fields": {
      "countries": {
        "kind": "string",
        "repeated": true,
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.trade.v1.GetUsImportDutyRequest": {
    "fields": {
      "hsCode": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[0-9]{6}([0-9]{2}){0,2}$",
        "stringMaxBytes": 65536
      },
      "partnerCountry": {
        "kind": "string",
        "required": true,
        "stringPattern": "^[0-9]{3}$",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.trade.v1.ListComtradeFlowsRequest": {
    "fields": {
      "reporterCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "cmdCode": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.unrest.v1.ListUnrestEventsRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      },
      "country": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.webcam.v1.GetWebcamImageRequest": {
    "fields": {
      "webcamId": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  },
  "worldmonitor.webcam.v1.ListWebcamsRequest": {
    "fields": {}
  },
  "worldmonitor.wildfire.v1.ListFireDetectionsRequest": {
    "fields": {
      "cursor": {
        "kind": "string",
        "stringMaxBytes": 65536
      }
    }
  }
};

// server/request-validator.ts
var requestTypes = GENERATED_REQUEST_TYPES;
var messageRules = GENERATED_MESSAGE_RULES;
var patternCache = /* @__PURE__ */ new Map();
var utf8Encoder = new TextEncoder();
var hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key);
var DEFAULT_STRING_MAX_BYTES = 64 * 1024;
function exceedsUtf8ByteLimit(value, limit) {
  if (value.length > limit) return true;
  for (let index = 0; index < value.length; index += 1) {
    if (value.charCodeAt(index) > 127) return utf8Encoder.encode(value).byteLength > limit;
  }
  return false;
}
function isRecord2(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function addViolation(violations, field, description) {
  violations.push({ field, description });
}
function isRequiredValueMissing(value) {
  return value == null || value === "" || Array.isArray(value) && value.length === 0;
}
function isZeroValue(value) {
  return value == null || value === "" || value === 0 || value === false || Array.isArray(value) && value.length === 0;
}
function defaultScalarValue(rule) {
  if (rule.optional) return void 0;
  if (rule.kind === "string") return "";
  if (rule.kind === "double" || rule.kind === "float") return 0;
  if (rule.kind === "enum") return rule.enumValues?.[0];
  if (/^(?:s?fixed|s?int|uint)/.test(rule.kind)) {
    return rule.kind === "int64" && rule.int64Encoding !== "number" ? "0" : 0;
  }
  return void 0;
}
function validateEnum(rule, value, path, violations) {
  if (typeof value !== "string") {
    addViolation(
      violations,
      path,
      "value must be an enum name (this API does not accept the numeric proto3-JSON enum form)"
    );
    return;
  }
  if (rule.enumValues && !rule.enumValues.includes(value)) {
    addViolation(violations, path, "enum value must be defined");
    return;
  }
  if (rule.enumNotIn?.includes(value)) {
    addViolation(violations, path, `enum value must not be ${value}`);
  }
}
var ADJACENT_CLASS_QUANTIFIERS = /(\[(?:[^\]\\]|\\.)*\])\{(\d+),(\d+)\}\1\{(\d+),(\d+)\}/;
function collapseAdjacentClassQuantifiers(source) {
  let out = source;
  for (let guard = 0; guard < 16; guard += 1) {
    const next = out.replace(
      ADJACENT_CLASS_QUANTIFIERS,
      (_match, cls, a, b, c, d) => `${cls}{${Number(a) + Number(c)},${Number(b) + Number(d)}}`
    );
    if (next === out) break;
    out = next;
  }
  return out;
}
function compilePattern(source) {
  let pattern = patternCache.get(source);
  if (!pattern) {
    pattern = new RegExp(collapseAdjacentClassQuantifiers(source));
    patternCache.set(source, pattern);
  }
  return pattern;
}
function validateString(rule, value, path, violations) {
  if (typeof value !== "string") {
    addViolation(violations, path, "value must be a string");
    return;
  }
  const length = [...value].length;
  let oversized = false;
  if (rule.stringLen != null && length !== rule.stringLen) {
    addViolation(violations, path, `string length must be exactly ${rule.stringLen}`);
    if (length > rule.stringLen) oversized = true;
  }
  if (rule.stringMinLen != null && length < rule.stringMinLen) {
    addViolation(violations, path, `string length must be at least ${rule.stringMinLen}`);
  }
  if (rule.stringMaxLen != null && length > rule.stringMaxLen) {
    addViolation(violations, path, `string length must be at most ${rule.stringMaxLen}`);
    oversized = true;
  }
  const maxBytes = rule.stringMaxBytes ?? DEFAULT_STRING_MAX_BYTES;
  if (exceedsUtf8ByteLimit(value, maxBytes)) {
    addViolation(violations, path, `string UTF-8 length must be at most ${maxBytes} bytes`);
    oversized = true;
  }
  if (rule.stringConst != null && value !== rule.stringConst) {
    addViolation(violations, path, `string must equal ${rule.stringConst}`);
  }
  if (rule.stringPattern != null && !oversized) {
    if (!compilePattern(rule.stringPattern).test(value)) {
      addViolation(violations, path, `string must match pattern ${rule.stringPattern}`);
    }
  }
}
function validateNumber(rule, value, path, violations) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    addViolation(violations, path, "value must be a finite number");
    return;
  }
  if (rule.kind !== "double" && rule.kind !== "float" && !Number.isInteger(value)) {
    addViolation(violations, path, "value must be an integer");
    return;
  }
  if (rule.numberGte != null && value < rule.numberGte) {
    addViolation(violations, path, `number must be greater than or equal to ${rule.numberGte}`);
  }
  if (rule.numberLte != null && value > rule.numberLte) {
    addViolation(violations, path, `number must be less than or equal to ${rule.numberLte}`);
  }
}
function validateStringEncodedInt64(rule, value, path, violations) {
  if (typeof value !== "string" || !/^-?\d+$/.test(value)) {
    addViolation(violations, path, "value must be a base-10 integer string");
    return;
  }
  const integer = BigInt(value);
  if (rule.numberGte != null && integer < BigInt(rule.numberGte)) {
    addViolation(violations, path, `number must be greater than or equal to ${rule.numberGte}`);
  }
  if (rule.numberLte != null && integer > BigInt(rule.numberLte)) {
    addViolation(violations, path, `number must be less than or equal to ${rule.numberLte}`);
  }
}
function validateSingleValue(rule, value, path, violations, ancestors) {
  if (rule.kind === "message") {
    if (!isRecord2(value)) {
      addViolation(violations, path, "value must be an object");
      return;
    }
    if (!rule.messageType) {
      throw new Error(`Generated request-validation rule for ${path} is missing its message type.`);
    }
    validateMessage(rule.messageType, value, path, violations, ancestors);
    return;
  }
  if (rule.kind === "string") {
    validateString(rule, value, path, violations);
    return;
  }
  if (rule.kind === "enum") {
    validateEnum(rule, value, path, violations);
    return;
  }
  if (rule.kind === "int64" && rule.int64Encoding !== "number") {
    validateStringEncodedInt64(rule, value, path, violations);
    return;
  }
  validateNumber(rule, value, path, violations);
}
function validateField(rule, value, present, path, violations, ancestors) {
  if (rule.ignore === "IGNORE_IF_ZERO_VALUE" && (!present || isZeroValue(value))) {
    return;
  }
  const enumZeroValue = rule.kind === "enum" && value === rule.enumValues?.[0];
  if (rule.required && (isRequiredValueMissing(value) || enumZeroValue)) {
    addViolation(violations, path, "value is required");
    return;
  }
  if (rule.repeated) {
    const repeatedValue = present ? value : [];
    if (!Array.isArray(repeatedValue)) {
      addViolation(violations, path, "value must be an array");
      return;
    }
    if (rule.repeatedMinItems != null && repeatedValue.length < rule.repeatedMinItems) {
      addViolation(violations, path, `array must contain at least ${rule.repeatedMinItems} item(s)`);
    }
    if (rule.repeatedMaxItems != null && repeatedValue.length > rule.repeatedMaxItems) {
      addViolation(violations, path, `array must contain at most ${rule.repeatedMaxItems} item(s)`);
    }
    if (rule.repeatedUnique && new Set(repeatedValue.map((item) => JSON.stringify(item))).size !== repeatedValue.length) {
      addViolation(violations, path, "array items must be unique");
    }
    repeatedValue.forEach((item, index) => {
      validateSingleValue(rule, item, `${path}[${index}]`, violations, ancestors);
    });
    return;
  }
  if (!present) {
    if (rule.kind === "message" || rule.optional) return;
    value = defaultScalarValue(rule);
  }
  if (value === void 0) return;
  validateSingleValue(rule, value, path, violations, ancestors);
}
function validateMessage(typeName, body, parentPath, violations, ancestors) {
  const schema = messageRules[typeName];
  if (!schema) {
    throw new Error(`No generated message-validation schema for ${typeName}.`);
  }
  if (ancestors.has(body)) {
    addViolation(violations, parentPath || "$request", "value must not contain circular references");
    return;
  }
  ancestors.add(body);
  for (const [fieldName, rule] of Object.entries(schema.fields)) {
    const path = parentPath ? `${parentPath}.${fieldName}` : fieldName;
    validateField(rule, body[fieldName], hasOwn(body, fieldName), path, violations, ancestors);
  }
  ancestors.delete(body);
}
function validateGeneratedRequest(methodName, body) {
  const requestType = requestTypes[methodName];
  if (!hasOwn(requestTypes, methodName) || typeof requestType !== "string") {
    throw new Error(`No generated request-validation schema for RPC method ${methodName}.`);
  }
  if (!isRecord2(body)) {
    return [{ field: "$request", description: "value must be an object" }];
  }
  const violations = [];
  validateMessage(requestType, body, "", violations, /* @__PURE__ */ new Set());
  return violations.length > 0 ? violations : void 0;
}

// api/_cors.js
var APP_ORIGIN_PATTERN2 = /^https:\/\/(?:(?:www|app|api|tech|finance|commodity|happy|energy)\.)?worldmonitor\.app$/;
var ORIGIN_ENCODER2 = new TextEncoder();
var ALLOWED_ORIGIN_PATTERNS2 = [
  APP_ORIGIN_PATTERN2,
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
var ALLOWED_HEADERS2 = [
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
var EXPOSED_HEADERS2 = [
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
function getPublicCorsHeaders(methods = "GET, OPTIONS") {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS2,
    "Access-Control-Expose-Headers": EXPOSED_HEADERS2,
    "Access-Control-Max-Age": "3600"
  };
}

// shared/page-canonical.js
var LINK_TAG = /<link\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
var LINK_ATTRIBUTE = /([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
var FIRST_PARTY_HOST = /(^|\.)worldmonitor\.app$/i;
function declaredHtmlCanonical(html) {
  if (typeof html !== "string") return null;
  const head = html.slice(0, 2e5);
  for (const [tag2] of head.matchAll(LINK_TAG)) {
    const attributes = /* @__PURE__ */ new Map();
    for (const [, name, doubleQuoted, singleQuoted, unquoted] of tag2.matchAll(LINK_ATTRIBUTE)) {
      const key = name.toLowerCase();
      if (!attributes.has(key)) attributes.set(key, doubleQuoted ?? singleQuoted ?? unquoted ?? "");
    }
    const rel = attributes.get("rel") ?? "";
    if (rel.toLowerCase().split(/[\t\n\f\r ]+/).includes("canonical")) {
      return attributes.get("href")?.trim() || null;
    }
  }
  return null;
}
function pageCanonicalUrl(pageUrl, declaredHref = null) {
  const page = new URL(pageUrl);
  if (declaredHref) {
    try {
      const declared = new URL(declaredHref, page);
      if ((declared.protocol === "https:" || declared.protocol === "http:") && FIRST_PARTY_HOST.test(declared.hostname)) {
        return `${declared.origin}${declared.pathname}`;
      }
    } catch {
    }
  }
  return `${page.origin}${page.pathname}`;
}

// api/_md-url-twin.ts
var MD_TWIN_LOOP_HEADER = "x-wm-md-twin";
var MAX_TWIN_CHARS = 512e3;
var MAX_TWIN_BYTES = 512e3;
var MAX_SIBLING_REDIRECTS = 3;
var NOT_A_DOCUMENT = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
var SIBLING_FETCH_TIMEOUT_MS = 8e3;
var SIBLING_USER_AGENT = "WorldMonitor-MarkdownTwin/1.0";
var FORWARDED_RESPONSE_HEADERS = [
  "allow",
  "location",
  "retry-after",
  "www-authenticate",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset"
];
var UNSAFE_PATH_CHARS = /[\x00-\x20\x7f]/;
function isMarkdownTwinPath(pathname) {
  return pathname.startsWith("/") && !UNSAFE_PATH_CHARS.test(pathname) && pathname.endsWith(".md") && pathname.length > 4 && !pathname.includes("..") && !pathname.includes("//") && !pathname.includes("\\");
}
function siblingPathFromMarkdown(markdownPath) {
  if (!isMarkdownTwinPath(markdownPath)) return null;
  if (markdownPath.startsWith("/api/md-twin")) return null;
  const sibling = markdownPath.slice(0, -3);
  return sibling.length > 0 ? sibling : null;
}
var HTML_ENTITIES = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'"
};
function decodeHtmlEntities(value) {
  return value.replace(/&(nbsp|amp|lt|gt|quot|apos|#(x[\da-f]+|\d+));/gi, (_, entity, code) => {
    if (code === void 0) return HTML_ENTITIES[entity.toLowerCase()];
    const n = /^x/i.test(code) ? Number.parseInt(code.slice(1), 16) : Number(code);
    const decodable = Number.isInteger(n) && n >= 32 && n <= 1114111 && !(n >= 55296 && n <= 57343);
    return decodable ? String.fromCodePoint(n) : "";
  });
}
function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function withoutTrackingParams(href) {
  const hashIndex = href.indexOf("#");
  const pathAndQuery = hashIndex < 0 ? href : href.slice(0, hashIndex);
  const hash = hashIndex < 0 ? "" : href.slice(hashIndex);
  const queryIndex = pathAndQuery.indexOf("?");
  if (queryIndex < 0) return href;
  const params = pathAndQuery.slice(queryIndex + 1).split("&").filter((param) => !/^utm_/i.test(new URLSearchParams(param).keys().next().value ?? ""));
  const query = params.join("&");
  return `${pathAndQuery.slice(0, queryIndex)}${query ? `?${query}` : ""}${hash}`;
}
function htmlToMarkdown(html, fallbackTitle) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decodeHtmlEntities(stripTags(titleMatch?.[1] ?? "")) || fallbackTitle;
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script(?:[\t\n\f\r ][^>]*|\/[^>]*)?>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style(?:[\t\n\f\r ][^>]*|\/[^>]*)?>/gi, " ").replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript(?:[\t\n\f\r ][^>]*|\/[^>]*)?>/gi, " ");
  const main = body.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? body;
  let text = main.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (_m, inner) => `

# ${stripTags(inner)}

`).replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_m, inner) => `

## ${stripTags(inner)}

`).replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_m, inner) => `

### ${stripTags(inner)}

`).replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, (_m, inner) => `

#### ${stripTags(inner)}

`).replace(/<h5\b[^>]*>([\s\S]*?)<\/h5>/gi, (_m, inner) => `

##### ${stripTags(inner)}

`).replace(/<h6\b[^>]*>([\s\S]*?)<\/h6>/gi, (_m, inner) => `

###### ${stripTags(inner)}

`).replace(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_m, href, inner) => {
      const label = stripTags(inner) || href;
      const target = withoutTrackingParams(decodeHtmlEntities(href)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const link = `[${label}](${target})`;
      return /<div\b/i.test(inner) ? `

${link}

` : link;
    }
  ).replace(
    /<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi,
    (_m, label, value) => `
- ${stripTags(label)}: ${stripTags(value)}
`
  ).replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner) => `
- ${stripTags(inner)}`).replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<\/div>/gi, "\n").replace(/<[^>]+>/g, " ");
  text = decodeHtmlEntities(text).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
  if (!/^# /m.test(text)) {
    text = text.length > 0 ? `# ${title}

${text}` : `# ${title}`;
  }
  return text.slice(0, MAX_TWIN_CHARS);
}
function jsonToMarkdown(raw, heading) {
  let pretty = raw.trim();
  try {
    const reserialised = JSON.stringify(JSON.parse(raw), null, 2);
    if (reserialised.length <= MAX_TWIN_CHARS) pretty = reserialised;
  } catch {
  }
  return `# ${heading}

\`\`\`json
${pretty}
\`\`\``.slice(0, MAX_TWIN_CHARS);
}
var FRONT_MATTER = /^---\n([\s\S]*?)\n---(?:\n|$)/;
var FRONT_MATTER_KEY = /^([A-Za-z0-9_.-]+):(?:\s|$)/;
function frontMatterOf(markdown) {
  const match = markdown.match(FRONT_MATTER);
  if (!match) return null;
  const lines = (match[1] ?? "").split("\n");
  const isMapping = lines.some((line) => FRONT_MATTER_KEY.test(line)) && lines.every((line) => line.trim() === "" || line.startsWith(" ") || FRONT_MATTER_KEY.test(line));
  return isMapping ? { block: match[0], lines } : null;
}
function quoteFrontMatterValue(line) {
  const entry = line.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/);
  if (!entry) return line;
  const [, key, value = ""] = entry;
  if (value === "" || /^(["']).*\1$/.test(value)) return line;
  return `${key}: ${JSON.stringify(value)}`;
}
function withHeading(markdown, heading) {
  if (/^# /m.test(markdown)) return markdown;
  const block = frontMatterOf(markdown)?.block;
  return block ? `${block}
# ${heading}

${markdown.slice(block.length)}` : `# ${heading}

${markdown}`;
}
function withMarkdownMetadata(markdown, canonical, fallbackTitle) {
  const frontMatter = frontMatterOf(markdown);
  if (frontMatter) {
    if (!canonical) return markdown;
    const lines = frontMatter.lines.filter((line) => !line.startsWith("canonical:")).map(quoteFrontMatterValue);
    lines.push(`canonical: ${JSON.stringify(canonical)}`);
    return `---
${lines.join("\n")}
---
${markdown.slice(frontMatter.block.length)}`;
  }
  const title = markdown.match(/^# (.+)$/m)?.[1] ?? fallbackTitle;
  const canonicalLine = canonical ? `
canonical: ${JSON.stringify(canonical)}` : "";
  return `---
title: ${JSON.stringify(title)}${canonicalLine}
---

${markdown}`;
}
function markdownHeadersFor(canonical, extra, corsHeaders) {
  const { Vary: corsVary, ...cors } = corsHeaders;
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=3600",
    // The loop-guard header changes the twin response (loop requests get a
    // 404 stub), and so does Origin when the caller's CORS is echoed. The
    // outbound Accept is fixed and auth/cookie/UA are never forwarded, so no
    // other variance needs declaring.
    Vary: corsVary ? `${corsVary}, ${MD_TWIN_LOOP_HEADER}` : MD_TWIN_LOOP_HEADER,
    ...cors,
    Link: canonical ? `<${canonical}>; rel="canonical", ${DEPRECATION_POLICY_LINK}` : DEPRECATION_POLICY_LINK,
    ...extra
  };
}
function inheritedCacheControl(response) {
  const value = response.headers.get("cache-control");
  if (!value) return {};
  return { "Cache-Control": /\b(?:no-store|private|no-cache)\b/i.test(value) ? "no-store" : value };
}
function headingFromPath(pathname) {
  const leaf = pathname.split("/").filter(Boolean).pop() ?? pathname;
  return leaf.replace(/[-_]+/g, " ");
}
async function readSiblingBody(response) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_TWIN_BYTES) {
    try {
      void response.body?.cancel("Sibling response exceeds the markdown twin byte limit").catch(() => {
      });
    } catch {
    }
    throw new Error("Sibling response exceeds the markdown twin byte limit");
  }
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes2 = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes2 += value.byteLength;
      if (totalBytes2 > MAX_TWIN_BYTES) {
        try {
          void reader.cancel("Sibling response exceeds the markdown twin byte limit").catch(() => {
          });
        } catch {
        }
        throw new Error("Sibling response exceeds the markdown twin byte limit");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(totalBytes2);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}
async function fetchDeclaredCanonical(siblingUrl, outbound, signal, fetchImpl) {
  try {
    const headers = new Headers(outbound);
    headers.set("accept", "text/html");
    const res = await fetchImpl(siblingUrl, { method: "GET", headers, redirect: "manual", signal });
    if (!res.ok || !/html/i.test(res.headers.get("content-type") ?? "")) {
      void res.body?.cancel().catch(() => {
      });
      return null;
    }
    return declaredHtmlCanonical(await readSiblingBody(res));
  } catch {
    return null;
  }
}
function forwardedResponseHeaders(response) {
  const headers = {};
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}
async function buildMarkdownTwinResponse(req, markdownPath, fetchImpl = globalThis.fetch, options = {}) {
  const corsHeaders = { ...options.corsHeaders ?? getPublicCorsHeaders("GET, HEAD, OPTIONS") };
  const markdownHeaders = (canonical2, extra = {}) => markdownHeadersFor(canonical2, extra, corsHeaders);
  const isAllowedSibling = options.isAllowedSibling ?? (() => true);
  if (req.method === "OPTIONS") {
    appendDeprecationPolicyLinkToRecord(corsHeaders);
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("# Method not allowed\n", {
      status: 405,
      headers: markdownHeaders(null, { Allow: "GET, HEAD, OPTIONS", "X-Robots-Tag": "noindex" })
    });
  }
  if (req.headers.get(MD_TWIN_LOOP_HEADER) === "1") {
    return new Response("# Not found\n", {
      status: 404,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  const sibling = siblingPathFromMarkdown(markdownPath);
  if (!sibling || !isAllowedSibling(sibling)) {
    return new Response("# Not found\n", {
      status: 404,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  const heading = headingFromPath(sibling);
  const requestUrl = new URL(req.url);
  let siblingUrl = new URL(sibling, requestUrl);
  if (siblingUrl.origin !== requestUrl.origin) {
    return new Response("# Not found\n", {
      status: 404,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  if (!isAllowedSibling(siblingUrl.pathname)) {
    return new Response("# Not found\n", {
      status: 404,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  siblingUrl.search = requestUrl.search;
  if (requestUrl.pathname === "/api/md-twin" || requestUrl.pathname === "/api/md-twin/") {
    siblingUrl.searchParams.delete("path");
    siblingUrl.searchParams.delete("mdPath");
  }
  const outbound = new Headers();
  outbound.set("user-agent", SIBLING_USER_AGENT);
  outbound.set(MD_TWIN_LOOP_HEADER, "1");
  outbound.set("accept", "text/markdown, text/html;q=0.9, application/json;q=0.8, text/plain;q=0.7, */*;q=0.1");
  const deadline = AbortSignal.timeout(SIBLING_FETCH_TIMEOUT_MS);
  let siblingRes;
  for (let hops = 0; ; hops += 1) {
    let redirectTarget;
    try {
      siblingRes = await fetchImpl(siblingUrl, {
        method: req.method,
        headers: outbound,
        redirect: "manual",
        signal: deadline
      });
      const location2 = siblingRes.headers.get("location");
      redirectTarget = siblingRes.status >= 300 && siblingRes.status < 400 && location2 ? new URL(location2, siblingUrl) : null;
    } catch {
      return new Response(`# ${heading}

The sibling page at \`${sibling}\` could not be fetched.
`, {
        status: 502,
        headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
      });
    }
    if (!redirectTarget) break;
    if (redirectTarget.origin !== requestUrl.origin) {
      const body = `# ${heading}

This resource redirects to [${redirectTarget.href}](${redirectTarget.href}).
`;
      return new Response(req.method === "HEAD" ? null : withMarkdownMetadata(body, null, heading), {
        status: 200,
        headers: markdownHeaders(null, { "X-Robots-Tag": "noindex" })
      });
    }
    if (hops >= MAX_SIBLING_REDIRECTS || isMarkdownTwinPath(redirectTarget.pathname) || !isAllowedSibling(redirectTarget.pathname)) {
      return new Response("# Not found\n", {
        status: 404,
        headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
      });
    }
    siblingUrl = redirectTarget;
  }
  const isFailure = !siblingRes.ok;
  const siblingStatus = isFailure ? siblingRes.status : 200;
  const servesCanonicalPage = !isFailure && !siblingUrl.pathname.startsWith("/api/");
  const responseHeaders = {
    ...isFailure ? NOT_A_DOCUMENT : {},
    // An API twin is a rendering of the sibling, so it may be cached no more
    // widely or longer than the sibling allows.
    ...!isFailure && options.inheritSiblingCacheControl ? inheritedCacheControl(siblingRes) : {},
    ...forwardedResponseHeaders(siblingRes)
  };
  const resolveCanonical = async (body, contentType2) => {
    if (!servesCanonicalPage) return null;
    const declared = body !== null && /html/i.test(contentType2) ? declaredHtmlCanonical(body) : await fetchDeclaredCanonical(siblingUrl, outbound, deadline, fetchImpl);
    return pageCanonicalUrl(siblingUrl, declared);
  };
  if (req.method === "HEAD") {
    const canonical2 = await resolveCanonical(null, "");
    return new Response(null, {
      status: siblingStatus,
      headers: markdownHeaders(canonical2, responseHeaders)
    });
  }
  if (siblingStatus === 304) {
    const canonical2 = await resolveCanonical(null, "");
    return new Response(null, {
      status: siblingStatus,
      headers: markdownHeaders(canonical2, responseHeaders)
    });
  }
  let markdown;
  let raw;
  const contentType = siblingRes.headers.get("content-type") ?? "";
  try {
    raw = await readSiblingBody(siblingRes);
    if (/markdown|text\/plain/i.test(contentType) && (/^# /m.test(raw) || FRONT_MATTER.test(raw))) {
      markdown = raw.slice(0, MAX_TWIN_CHARS);
    } else if (/json/i.test(contentType) || raw.trim().startsWith("{") || raw.trim().startsWith("[")) {
      markdown = jsonToMarkdown(raw, heading);
    } else if (/html/i.test(contentType) || /<html|<body|<title/i.test(raw)) {
      markdown = htmlToMarkdown(raw, heading);
    } else if (raw.trim().length === 0) {
      markdown = `# ${heading}
`;
    } else {
      markdown = /^# /m.test(raw) ? raw.slice(0, MAX_TWIN_CHARS) : `# ${heading}

${raw}`.slice(0, MAX_TWIN_CHARS);
    }
    markdown = withHeading(markdown, heading);
  } catch {
    return new Response(`# ${heading}

The sibling page at \`${sibling}\` could not be read.
`, {
      status: 502,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  const canonical = await resolveCanonical(raw, contentType);
  return new Response(withMarkdownMetadata(markdown, canonical, heading), {
    status: siblingStatus,
    headers: markdownHeaders(canonical, responseHeaders)
  });
}

// src/shared/premium-paths.ts
var PREMIUM_RPC_PATHS = /* @__PURE__ */ new Set([
  "/api/market/v1/analyze-stock",
  "/api/market/v1/get-stock-analysis-history",
  "/api/market/v1/get-insider-transactions",
  "/api/market/v1/backtest-stock",
  "/api/market/v1/list-stored-stock-backtests",
  // Physical-vs-paper metals: the SGE/COMEX premium series (#6436) and the
  // divergence index computed over its history (#6448). The market client
  // wraps proFreshRpcFetch rather than premiumFetch, so these two entries are
  // load-bearing twice over — proFreshRpcFetch delegates premium paths to
  // premiumFetch for the Bearer, and the wm-session interceptor needs the
  // membership to read their 401s as Pro denials rather than a dead cookie.
  "/api/market/v1/get-physical-premiums",
  "/api/market/v1/get-physical-divergence-index",
  // /api/intelligence/v1/classify-event: LLM-backed classifier. Keep in the
  // premium path set so browser Pro callers attach the Clerk Bearer and
  // anonymous wms_ sessions cannot mint cache-miss LLM spend.
  "/api/intelligence/v1/classify-event",
  "/api/intelligence/v1/deduct-situation",
  // Browser calls must attach Clerk auth and bypass wm-session recovery:
  // anonymous 401s here are expected Pro denials, not dead session cookies.
  "/api/intelligence/v1/get-country-intel-brief",
  // Country coverage (#7526) is an agent surface, not a panel dependency — the
  // browser builds its own timeline client-side and never calls this. Each call
  // costs two live outbound feed fetches plus five upstream reads, so it is
  // gated like get-country-intel-brief rather than like the cheap Redis read
  // get-country-risk. This is what makes the Pro decision real on the REST
  // path; the MCP `subscription` class only covers MCP callers.
  //
  // Keep every comment in this block free of single quotes. readPremiumRpcPaths
  // (scripts/lib/openapi-codegen.mjs) recovers these paths with a bare
  // quoted-string regex over the whole block, so one apostrophe in a comment
  // pairs with the next opening quote and silently eats a path out of the
  // published security contract.
  "/api/intelligence/v1/get-country-coverage",
  "/api/intelligence/v1/list-market-implications",
  "/api/intelligence/v1/list-wsb-tickers",
  "/api/intelligence/v1/get-regional-snapshot",
  "/api/intelligence/v1/get-regime-history",
  "/api/intelligence/v1/get-regional-brief",
  // Historical intelligence memory (#5694). Read-only over the Convex history
  // store; the two semantic routes also spend one embeddings call per cache
  // miss, which is why they carry fail-closed rate policies as well.
  "/api/intelligence/v1/search-intel-history",
  "/api/intelligence/v1/get-intel-timeline",
  "/api/intelligence/v1/get-similar-events",
  "/api/resilience/v1/get-resilience-score",
  "/api/resilience/v1/get-resilience-indicators",
  "/api/resilience/v1/get-resilience-ranking",
  "/api/resilience/v1/get-food-stocks",
  "/api/resilience/v1/get-demographics-capability",
  // The five-factor scorecard went free (#9742); it is no longer in this set.
  "/api/supply-chain/v1/get-country-chokepoint-index",
  "/api/supply-chain/v1/get-bypass-options",
  "/api/supply-chain/v1/get-country-cost-shock",
  "/api/supply-chain/v1/get-route-explorer-lane",
  "/api/supply-chain/v1/get-route-impact",
  "/api/supply-chain/v1/get-country-products",
  "/api/supply-chain/v1/get-multi-sector-cost-shock",
  "/api/supply-chain/v1/get-sector-dependency",
  // Mineral production & processing concentration (#6439) and the commodity
  // supply-vulnerability scoring built over it (#6449). The supply-chain
  // client already wraps premiumFetch, so these entries switch Bearer
  // injection on for methods that previously fell through anonymous.
  "/api/supply-chain/v1/get-mineral-production",
  "/api/supply-chain/v1/get-country-vulnerabilities",
  "/api/supply-chain/v1/get-chokepoint-dependencies",
  "/api/supply-chain/v1/list-vulnerability-rankings",
  // Global procurement is a Pro product surface. Keep this in the shared
  // registry so premiumFetch attaches the Clerk bearer and the gateway enforces
  // the same route as the entitlement map.
  "/api/economic/v1/list-global-tenders",
  // Outlet-perspective grouping is a Pro MCP tool; the REST route matches it.
  "/api/news/v1/list-media-perspective",
  "/api/news/v1/list-news-pool",
  "/api/trade/v1/list-comtrade-flows",
  "/api/trade/v1/get-tariff-trends",
  "/api/trade/v1/get-bilateral-tariff",
  "/api/trade/v1/get-us-import-duty",
  "/api/scenario/v1/run-scenario",
  "/api/scenario/v1/get-scenario-status",
  // #3734: PRO-gated mutation that enqueues a simulation task. Companion
  // /get-simulation-outcome remains public (existing convention).
  "/api/forecast/v1/trigger-simulation",
  "/api/v2/shipping/route-intelligence",
  "/api/v2/shipping/webhooks",
  // /api/mcp-proxy: Pro-gated outbound MCP proxy (PR #3768, issue #3723).
  // Path-gated here so premiumFetch attaches the Clerk Bearer for normal
  // web Pro users; the server gate in api/mcp-proxy.ts uses isCallerPremium
  // which validates enterprise key, wm_ user key, or Bearer JWT.
  "/api/mcp-proxy",
  // /api/chat-analyst: Pro-gated streaming SSE endpoint for WM Analyst panel.
  // ChatAnalystPanel.send() calls premiumFetch('/api/chat-analyst', ...) and
  // the server uses isCallerPremium; without this entry premiumFetch never
  // attaches the Clerk Bearer for browser Pro users → every send returned
  // 403 "Pro subscription required" despite a valid subscription. Symptom
  // stayed hidden until PR #3797 fixed the unlock-wipe so users could
  // actually type and click Send.
  "/api/chat-analyst",
  // Single-aircraft Wingbits enrichment is a caller-controlled paid-provider
  // lookup. Keep the batch sibling outside this registry because the map uses
  // that route as its existing anonymous, rate-limited enrichment path; it
  // only spends the credential on aircraft in the published flight snapshot.
  "/api/military/v1/get-aircraft-details",
  // Arms-supplier dependency + World Bank military capacity (#6438). This one
  // also left PUBLIC_SHARED_RPC_PATHS: it had an anonymous `public=1` CDN
  // shape, which is a bypass of any tier gate, not a cache tier. Losing that
  // shared shape costs the CDN shield — the trade accepted when the data
  // became Pro.
  "/api/military/v1/get-defense-industrial-base",
  // The three AviationStack-METERED routes. Each cache miss buys a paid
  // upstream call and get-carrier-ops buys one PER AIRPORT, so anonymous access
  // was a standing invitation: one scripted client took ~1,000 calls/day, ~43%
  // of spend, in August 2026. Registered here for the same reason /api/chat-
  // analyst is — without the entry premiumFetch never attaches the Clerk Bearer
  // and browser Pro users get 403 on a subscription they are paying for.
  // The seeder-backed aviation routes (list-airport-delays,
  // get-airport-ops-summary) stay OFF this list on purpose: they serve
  // aviation:delays:intl:v3, already bought by cron, so gating them would cost
  // the free map its airport-delay layer and save nothing.
  "/api/aviation/v1/list-airport-flights",
  "/api/aviation/v1/get-carrier-ops",
  "/api/aviation/v1/get-flight-status",
  // TravelPayouts, billed per search — a different provider from the three
  // above but the same exposure, and the same scraper was spending on it.
  "/api/aviation/v1/search-flight-prices"
]);

// server/gateway.ts
var serverOptions = {
  onError: mapErrorToResponse,
  validateRequest: validateGeneratedRequest
};
var MAX_INTERNAL_MCP_BODY = 256 * 1024;
function internalMcpSignatureDenial(corsHeaders) {
  return new Response(
    JSON.stringify({ error: "invalid_internal_mcp_signature" }),
    { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
  );
}
function internalMcpReasonFor(failure) {
  switch (failure) {
    // Cannot normally happen here: the handler returns 500 CONFIGURATION
    // before reaching the verifier when the secret is absent. Mapped to the
    // existing config reason so a deploy incident never lands in an auth
    // dashboard.
    case "no_secret":
      return "hmac_secret_unconfigured";
    case "no_user_id":
      return "internal_mcp_no_user";
    case "missing_signature":
    case "malformed_signature":
      return "internal_mcp_malformed_sig";
    case "invalid_nonce":
      return "internal_mcp_bad_nonce";
    case "timestamp_window":
      return "internal_mcp_ts_window";
    case "malformed_request":
      return "internal_mcp_bad_request";
    case "signature_mismatch":
      return "internal_mcp_sig_mismatch";
  }
}
function getRateLimitTelemetryReason(response, rejectedReason) {
  return response.status === 503 && response.headers.get("X-RateLimit-Mode") === "degraded" ? "rate_limit_degraded" : rejectedReason;
}
async function claimInternalMcpReplayNonce(userId, nonce) {
  const digest = await sha256Hex(`${userId}:${nonce}`);
  const key = `internal-mcp-replay:v1:${digest}`;
  const result = await runRedisPipeline([
    ["SET", key, "1", "EX", INTERNAL_MCP_REPLAY_CACHE_TTL_SECONDS, "NX"]
  ]);
  if (result.length === 0) return "unavailable";
  const claim = result[0];
  if (claim?.error) return "unavailable";
  return claim?.result === "OK" ? "fresh" : "replay";
}
var TIER_HEADERS = {
  fast: "public, max-age=60, s-maxage=300, stale-while-revalidate=60, stale-if-error=600",
  medium: "public, max-age=120, s-maxage=600, stale-while-revalidate=120, stale-if-error=900",
  slow: "public, max-age=300, s-maxage=1800, stale-while-revalidate=300, stale-if-error=3600",
  "slow-browser": "max-age=300, stale-while-revalidate=60, stale-if-error=1800",
  "live-browser": "private, max-age=30, stale-while-revalidate=60, stale-if-error=300",
  static: "public, max-age=600, s-maxage=3600, stale-while-revalidate=600, stale-if-error=14400",
  daily: "public, max-age=3600, s-maxage=14400, stale-while-revalidate=7200, stale-if-error=172800",
  "no-store": "no-store",
  live: "public, max-age=30, s-maxage=60, stale-while-revalidate=60, stale-if-error=300"
};
var TIER_CDN_CACHE = {
  fast: "public, s-maxage=600, stale-while-revalidate=300, stale-if-error=1200",
  medium: "public, s-maxage=1200, stale-while-revalidate=600, stale-if-error=1800",
  slow: "public, s-maxage=3600, stale-while-revalidate=900, stale-if-error=7200",
  "slow-browser": "public, s-maxage=900, stale-while-revalidate=60, stale-if-error=1800",
  "live-browser": null,
  static: "public, s-maxage=14400, stale-while-revalidate=3600, stale-if-error=28800",
  daily: "public, s-maxage=86400, stale-while-revalidate=14400, stale-if-error=172800",
  "no-store": null,
  live: "public, s-maxage=60, stale-while-revalidate=60, stale-if-error=300"
};
var RPC_CACHE_TIER = {
  // 'live' tier — bbox-quantized + tanker-aware caching upstream of the
  // 60s in-handler cache, absorbing identical-bbox requests at the CDN
  // before they hit this Vercel function. Energy Atlas live-tanker layer.
  "/api/maritime/v1/get-vessel-snapshot": "live",
  "/api/market/v1/list-market-quotes": "medium",
  "/api/market/v1/list-crypto-quotes": "medium",
  "/api/market/v1/list-crypto-sectors": "slow",
  "/api/market/v1/list-defi-tokens": "slow",
  "/api/market/v1/list-ai-tokens": "slow",
  "/api/market/v1/list-other-tokens": "slow",
  "/api/market/v1/list-commodity-quotes": "medium",
  "/api/market/v1/get-physical-premiums": "no-store",
  "/api/market/v1/get-physical-divergence-index": "no-store",
  "/api/market/v1/list-stablecoin-markets": "medium",
  "/api/market/v1/get-sector-summary": "medium",
  "/api/market/v1/get-fear-greed-index": "slow",
  "/api/market/v1/get-market-breadth-history": "daily",
  "/api/market/v1/list-gulf-quotes": "medium",
  "/api/market/v1/analyze-stock": "slow",
  "/api/market/v1/get-stock-analysis-history": "medium",
  "/api/market/v1/backtest-stock": "slow",
  "/api/market/v1/list-stored-stock-backtests": "medium",
  "/api/infrastructure/v1/list-service-statuses": "slow",
  "/api/seismology/v1/list-earthquakes": "fast",
  "/api/infrastructure/v1/list-internet-outages": "slow",
  "/api/infrastructure/v1/list-internet-ddos-attacks": "slow",
  "/api/infrastructure/v1/list-internet-traffic-anomalies": "slow",
  "/api/forecast/v1/get-forecast-scorecard": "fast",
  "/api/safety/v1/get-toronto-safety": "slow",
  "/api/unrest/v1/list-unrest-events": "slow",
  "/api/cyber/v1/list-cyber-threats": "static",
  "/api/conflict/v1/list-acled-events": "slow",
  "/api/military/v1/get-theater-posture": "slow",
  "/api/intelligence/v1/get-country-signal-observations": "no-store",
  "/api/military/v1/get-defense-industrial-base": "daily",
  "/api/infrastructure/v1/get-temporal-baseline": "slow",
  "/api/aviation/v1/list-airport-delays": "static",
  "/api/aviation/v1/get-airport-ops-summary": "static",
  "/api/aviation/v1/list-airport-flights": "static",
  "/api/aviation/v1/get-carrier-ops": "slow",
  "/api/aviation/v1/get-flight-status": "fast",
  "/api/aviation/v1/track-aircraft": "no-store",
  "/api/aviation/v1/list-aircraft-emergencies": "no-store",
  "/api/aviation/v1/search-flight-prices": "medium",
  "/api/aviation/v1/search-google-flights": "no-store",
  "/api/aviation/v1/search-google-dates": "medium",
  "/api/aviation/v1/list-aviation-news": "slow",
  "/api/market/v1/get-country-stock-index": "slow",
  "/api/market/v1/get-price-history": "static",
  "/api/natural/v1/list-natural-events": "slow",
  "/api/wildfire/v1/list-fire-detections": "static",
  "/api/maritime/v1/list-navigational-warnings": "static",
  "/api/maritime/v1/list-ukmto-incidents": "no-store",
  "/api/supply-chain/v1/get-china-corridor-control-towers": "medium",
  "/api/supply-chain/v1/get-shipping-rates": "daily",
  "/api/supply-chain/v1/list-pipelines": "static",
  "/api/supply-chain/v1/get-pipeline-detail": "static",
  "/api/supply-chain/v1/list-storage-facilities": "static",
  "/api/supply-chain/v1/get-storage-facility-detail": "static",
  "/api/supply-chain/v1/list-fuel-shortages": "medium",
  "/api/supply-chain/v1/get-fuel-shortage-detail": "medium",
  "/api/supply-chain/v1/list-energy-disruptions": "medium",
  "/api/economic/v1/get-fred-series": "static",
  "/api/economic/v1/get-bls-series": "daily",
  "/api/economic/v1/get-energy-prices": "static",
  "/api/research/v1/list-arxiv-papers": "static",
  "/api/research/v1/list-trending-repos": "static",
  "/api/giving/v1/get-giving-summary": "static",
  "/api/intelligence/v1/get-country-intel-brief": "static",
  // The canonical Railway projection refreshes every 15 minutes. Keep the
  // public composition route's Vercel TTL (10m on fast) inside that cadence so
  // the seeder cannot keep re-publishing a two-hour-old medium-tier response.
  "/api/intelligence/v1/get-china-decision-signals": "fast",
  "/api/intelligence/v1/get-gdelt-topic-timeline": "medium",
  "/api/climate/v1/list-climate-anomalies": "daily",
  "/api/climate/v1/list-climate-disasters": "daily",
  "/api/climate/v1/get-co2-monitoring": "daily",
  "/api/climate/v1/get-ocean-ice-data": "daily",
  "/api/climate/v1/list-air-quality-data": "fast",
  "/api/climate/v1/list-climate-news": "slow",
  "/api/sanctions/v1/list-sanctions-pressure": "daily",
  "/api/sanctions/v1/lookup-sanction-entity": "no-store",
  "/api/radiation/v1/list-radiation-observations": "slow",
  "/api/thermal/v1/list-thermal-escalations": "slow",
  "/api/research/v1/list-tech-events": "daily",
  "/api/military/v1/get-usni-fleet-report": "daily",
  "/api/military/v1/list-defense-patents": "daily",
  "/api/conflict/v1/list-ucdp-events": "daily",
  "/api/conflict/v1/get-humanitarian-summary": "daily",
  "/api/conflict/v1/list-iran-events": "slow",
  "/api/displacement/v1/get-displacement-summary": "daily",
  "/api/displacement/v1/get-internal-displacement": "daily",
  "/api/displacement/v1/get-cross-border-movements": "daily",
  "/api/displacement/v1/get-population-exposure": "daily",
  "/api/economic/v1/get-bis-policy-rates": "daily",
  "/api/economic/v1/get-bis-exchange-rates": "daily",
  "/api/economic/v1/get-bis-credit": "daily",
  "/api/trade/v1/get-tariff-trends": "daily",
  "/api/trade/v1/get-bilateral-tariff": "daily",
  "/api/trade/v1/get-us-import-duty": "daily",
  "/api/trade/v1/get-trade-flows": "daily",
  "/api/trade/v1/get-trade-barriers": "daily",
  "/api/trade/v1/get-trade-restrictions": "daily",
  "/api/trade/v1/get-customs-revenue": "daily",
  "/api/trade/v1/list-comtrade-flows": "daily",
  "/api/economic/v1/list-world-bank-indicators": "daily",
  "/api/economic/v1/get-energy-capacity": "daily",
  "/api/economic/v1/list-grocery-basket-prices": "daily",
  "/api/economic/v1/list-bigmac-prices": "daily",
  "/api/economic/v1/list-fuel-prices": "daily",
  "/api/economic/v1/get-fao-food-price-index": "daily",
  "/api/economic/v1/get-crude-inventories": "daily",
  "/api/economic/v1/get-nat-gas-storage": "daily",
  "/api/economic/v1/get-eu-yield-curve": "daily",
  // Daily macro seed. A miss returns unavailable:true, which the gateway
  // already keeps out of the shared cache.
  "/api/economic/v1/get-us-cpi-monthly": "daily",
  "/api/economic/v1/get-us-treasury-par-yield-curve": "daily",
  "/api/economic/v1/get-us-interest-rates": "daily",
  "/api/economic/v1/get-world-cpi-monthly": "daily",
  // Weekly seed of quarterly IMF/BIS sources. A miss returns unavailable:true.
  "/api/economic/v1/get-capital-flows": "daily",
  // Daily yield-curve bundle. A miss returns unavailable:true, which the
  // gateway already keeps out of the shared cache.
  "/api/economic/v1/get-government-yield-curve": "daily",
  "/api/supply-chain/v1/get-critical-minerals": "daily",
  "/api/supply-chain/v1/get-mineral-production": "daily",
  "/api/military/v1/get-aircraft-details": "static",
  "/api/military/v1/get-wingbits-status": "static",
  "/api/military/v1/get-wingbits-live-flight": "no-store",
  "/api/military/v1/list-military-flights": "slow",
  "/api/market/v1/list-etf-flows": "slow",
  "/api/research/v1/list-hackernews-items": "slow",
  "/api/intelligence/v1/get-country-risk": "slow",
  "/api/intelligence/v1/get-country-history": "no-store",
  // get-country-coverage is premium-gated via PREMIUM_RPC_PATHS, so the gateway
  // short-circuits to 'slow-browser' before consulting this map — same as
  // get-regional-snapshot below. This entry exists to satisfy the parity
  // contract in tests/route-cache-tier.test.mjs and to record the intended tier
  // if the endpoint ever stops being premium: `medium` rather than the sibling
  // `slow`, because the response can carry degraded=true and an hour of shared
  // edge cache would pin a transient upstream failure long after it healed.
  "/api/intelligence/v1/get-country-coverage": "medium",
  "/api/intelligence/v1/get-risk-scores": "slow",
  // Live, not slow: the relay publishes a BestTime reading every 15 min, and
  // an hour of CDN cache kept venues CLOSED long after they opened.
  "/api/intelligence/v1/get-pizzint-status": "live",
  "/api/intelligence/v1/classify-event": "static",
  "/api/intelligence/v1/search-gdelt-documents": "slow",
  "/api/infrastructure/v1/get-cable-health": "slow",
  "/api/positive-events/v1/list-positive-geo-events": "slow",
  "/api/military/v1/list-military-bases": "daily",
  "/api/economic/v1/get-macro-signals": "medium",
  "/api/economic/v1/get-national-debt": "daily",
  "/api/prediction/v1/list-prediction-markets": "medium",
  "/api/forecast/v1/get-forecasts": "medium",
  "/api/forecast/v1/get-simulation-package": "slow",
  "/api/forecast/v1/get-simulation-outcome": "slow",
  "/api/supply-chain/v1/get-chokepoint-status": "fast",
  "/api/supply-chain/v1/get-chokepoint-history": "slow",
  // Fast, not slow: the digest is rebuilt into Redis every 15 min, and a CDN
  // holding one body for an hour made the CDN the freshness floor.
  "/api/news/v1/list-feed-digest": "fast",
  "/api/news/v1/list-country-headlines": "fast",
  "/api/news/v1/list-media-perspective": "fast",
  "/api/news/v1/list-news-pool": "fast",
  // #9796: cached feed rows for a panel's enabled sources below the category cap.
  "/api/news/v1/list-source-items": "fast",
  "/api/news/v1/list-label-changes": "fast",
  // #9093 operator queue: never cached, it is gated by a secret header.
  "/api/news/v1/list-error-reports": "no-store",
  // #9094: per-claim fact-check lookup; the CDN key includes the claim.
  "/api/news/v1/search-fact-checks": "slow",
  // /verify claim search over the feed caches; the CDN key includes the claim.
  "/api/news/v1/search-claim-headlines": "fast",
  "/api/intelligence/v1/get-country-facts": "daily",
  "/api/intelligence/v1/list-security-advisories": "slow",
  "/api/intelligence/v1/list-satellites": "static",
  "/api/intelligence/v1/list-gps-interference": "slow",
  "/api/intelligence/v1/list-cross-source-signals": "medium",
  "/api/intelligence/v1/list-oref-alerts": "fast",
  "/api/intelligence/v1/list-telegram-feed": "fast",
  "/api/intelligence/v1/list-x-feed": "fast",
  "/api/intelligence/v1/get-company-enrichment": "slow",
  "/api/intelligence/v1/list-company-signals": "slow",
  "/api/intelligence/v1/search-sec-filings": "medium",
  "/api/intelligence/v1/list-material-events": "medium",
  "/api/news/v1/summarize-article-cache": "slow",
  "/api/imagery/v1/search-imagery": "static",
  "/api/infrastructure/v1/list-temporal-anomalies": "medium",
  "/api/infrastructure/v1/get-ip-geo": "no-store",
  "/api/infrastructure/v1/reverse-geocode": "slow",
  "/api/infrastructure/v1/get-bootstrap-data": "no-store",
  "/api/webcam/v1/get-webcam-image": "no-store",
  "/api/webcam/v1/list-webcams": "no-store",
  "/api/consumer-prices/v1/get-consumer-price-overview": "slow",
  "/api/consumer-prices/v1/get-consumer-price-basket-series": "slow",
  "/api/consumer-prices/v1/list-consumer-price-categories": "slow",
  "/api/consumer-prices/v1/list-consumer-price-movers": "slow",
  "/api/consumer-prices/v1/list-retailer-price-spreads": "slow",
  "/api/consumer-prices/v1/get-consumer-price-freshness": "slow",
  "/api/aviation/v1/get-youtube-live-stream-info": "fast",
  "/api/market/v1/list-earnings-calendar": "slow",
  "/api/market/v1/get-cot-positioning": "slow",
  "/api/market/v1/get-gold-intelligence": "slow",
  "/api/market/v1/get-hyperliquid-flow": "medium",
  "/api/market/v1/get-insider-transactions": "slow",
  "/api/economic/v1/get-economic-calendar": "slow",
  "/api/economic/v1/get-china-macro-snapshot": "slow",
  "/api/economic/v1/get-china-activity-nowcast": "medium",
  // Daily seed (#9722); the CDN key carries the country_code, region_id and kind filters.
  "/api/economic/v1/get-no2-activity": "slow",
  "/api/intelligence/v1/list-market-implications": "slow",
  "/api/intelligence/v1/list-wsb-tickers": "no-store",
  "/api/economic/v1/get-ecb-fx-rates": "slow",
  "/api/economic/v1/get-eurostat-country-data": "slow",
  "/api/economic/v1/get-eu-gas-storage": "slow",
  "/api/economic/v1/get-oil-stocks-analysis": "static",
  "/api/economic/v1/get-oil-inventories": "slow",
  "/api/economic/v1/get-energy-crisis-policies": "static",
  "/api/economic/v1/list-global-tenders": "medium",
  "/api/economic/v1/get-eu-fsi": "slow",
  "/api/economic/v1/get-economic-stress": "slow",
  "/api/supply-chain/v1/get-shipping-stress": "medium",
  "/api/supply-chain/v1/get-country-chokepoint-index": "slow-browser",
  "/api/supply-chain/v1/get-bypass-options": "slow-browser",
  "/api/supply-chain/v1/get-country-cost-shock": "slow-browser",
  "/api/supply-chain/v1/get-country-products": "slow-browser",
  // These responses differ by caller redistribution rights. The gateway cache
  // key does not vary on session/API-key audience, so they must never be stored.
  "/api/supply-chain/v1/get-country-vulnerabilities": "no-store",
  "/api/supply-chain/v1/get-chokepoint-dependencies": "no-store",
  "/api/supply-chain/v1/list-vulnerability-rankings": "no-store",
  "/api/supply-chain/v1/get-multi-sector-cost-shock": "slow-browser",
  "/api/supply-chain/v1/get-sector-dependency": "slow-browser",
  "/api/supply-chain/v1/get-route-explorer-lane": "slow-browser",
  "/api/supply-chain/v1/get-route-impact": "slow-browser",
  // Scenario engine: list-scenario-templates is a compile-time constant catalog;
  // daily tier gives browser max-age=3600 matching the legacy /api/scenario/v1/templates
  // endpoint header. get-scenario-status is premium-gated — gateway short-circuits
  // to 'slow-browser' but the entry is still required by tests/route-cache-tier.test.mjs.
  "/api/scenario/v1/list-scenario-templates": "daily",
  "/api/scenario/v1/get-scenario-status": "slow-browser",
  "/api/health/v1/list-disease-outbreaks": "slow",
  "/api/health/v1/list-air-quality-alerts": "fast",
  "/api/intelligence/v1/get-social-velocity": "fast",
  "/api/intelligence/v1/get-country-energy-profile": "slow",
  "/api/intelligence/v1/compute-energy-shock": "fast",
  "/api/intelligence/v1/get-country-port-activity": "slow",
  // NOTE: get-regional-snapshot is premium-gated via PREMIUM_RPC_PATHS; the
  // gateway short-circuits to 'slow-browser' before consulting this map. The
  // entry below exists to satisfy the parity contract enforced by
  // tests/route-cache-tier.test.mjs (every generated GET route needs a tier)
  // and documents the intended tier if the endpoint ever becomes non-premium.
  "/api/intelligence/v1/get-regional-snapshot": "slow",
  // get-regime-history is premium-gated same as get-regional-snapshot; this
  // entry is required by tests/route-cache-tier.test.mjs even though the
  // gateway short-circuits premium paths to slow-browser.
  "/api/intelligence/v1/get-regime-history": "slow",
  // get-regional-brief is premium-gated; slow-browser in practice, slow entry for route-parity.
  "/api/intelligence/v1/get-regional-brief": "slow",
  // Historical intelligence memory (#5694) — the timeline is a generated GET
  // and therefore requires an explicit gateway cache tier. The two semantic
  // reads are POSTs and cache successful results inside their handlers.
  "/api/intelligence/v1/get-intel-timeline": "slow",
  "/api/resilience/v1/get-resilience-score": "slow",
  "/api/resilience/v1/get-resilience-indicators": "slow",
  "/api/resilience/v1/get-resilience-ranking": "slow",
  "/api/resilience/v1/get-food-stocks": "slow",
  "/api/resilience/v1/get-demographics-capability": "slow",
  "/api/resilience/v1/get-runtime-manifest": "no-store",
  "/api/scorecard/v1/get-five-factor-scorecard": "slow",
  "/api/scorecard/v1/list-five-factor-scorecards": "slow",
  "/api/scorecard/v1/get-bloc-scorecard": "slow",
  // Partner-facing shipping/v2. route-intelligence is premium-gated; gateway
  // short-circuits to slow-browser. Entry required by tests/route-cache-tier.test.mjs.
  "/api/v2/shipping/route-intelligence": "slow-browser",
  // GET /webhooks lists caller's webhooks — premium-gated; short-circuited to
  // slow-browser. Entry required by tests/route-cache-tier.test.mjs.
  "/api/v2/shipping/webhooks": "slow-browser",
  // Company Monitoring is account-private and remains unrouted until #6003.
  // Keep every generated read no-store so future activation cannot inherit a
  // shared CDN tier before its account isolation is proven end to end.
  "/api/company-monitoring/v1/get-company-coverage": "no-store",
  "/api/company-monitoring/v1/get-company-material-event": "no-store",
  "/api/company-monitoring/v1/get-company-monitoring-status": "no-store",
  "/api/company-monitoring/v1/list-company-event-changes": "no-store",
  "/api/company-monitoring/v1/list-company-event-impacts": "no-store",
  "/api/company-monitoring/v1/list-monitored-companies": "no-store"
};
var PUBLIC_NO_AUTH_RPC_PATHS = /* @__PURE__ */ new Set([
  "/api/scorecard/v1/get-five-factor-scorecard",
  "/api/scorecard/v1/get-bloc-scorecard",
  "/api/scorecard/v1/list-five-factor-scorecards",
  "/api/intelligence/v1/get-china-decision-signals",
  "/api/resilience/v1/get-runtime-manifest",
  // Lead-capture RPCs serve ANONYMOUS prospects by definition: the /pro
  // marketing page contact form and the waitlist/desktop signup both POST
  // without a wms_ session or API key (see pro-test/src/App.tsx onSubmit and
  // src/services/runtime.ts isKeyFreeApiTarget). A freely-mintable anonymous
  // session token would add zero abuse protection here — the real gates live
  // in the handlers: server-side Turnstile (fails closed in production),
  // honeypot, free-email-domain rejection, per-IP endpoint rate limits
  // (server/_shared/rate-limit.ts: 3/h and 5/h), and the Convex per-email
  // throttle. Pinned by tests/leads-gateway-public.test.mts.
  "/api/leads/v1/submit-contact",
  "/api/leads/v1/register-interest",
  // #9093 "Report an error": readers report without an account by design. The
  // gates are the handler's honeypot and validation, a fail-closed per-IP
  // endpoint limit (server/_shared/rate-limit.ts), and a bounded review queue
  // that refuses rather than evicts. Reports are never applied automatically.
  "/api/news/v1/submit-error-report",
  // #9093 /trust page: public label history and today's counts. Read-only,
  // public coverage metadata; a visitor who lands on /trust directly has no
  // session cookie. Bounded by a per-IP endpoint limit and the 'fast' CDN tier.
  "/api/news/v1/list-label-changes",
  // #9093 operator review. The gate is TRUST_REVIEW_SECRET, checked in the
  // handler (X-Trust-Review-Key, constant-time): unset → every call is 401.
  // A browser session would add nothing an operator secret does not already
  // prove, and the standalone review page has none. Fail-closed per-IP limits
  // bound guessing; list-error-reports is no-store.
  "/api/news/v1/list-error-reports",
  "/api/news/v1/review-error-report",
  // #9094 /verify: published fact-checks for a claim, cited with attribution.
  // Free like /verify (owner decision), which needs no account; bounded by a
  // fail-closed per-IP limit and a day-long per-claim cache of the upstream.
  "/api/news/v1/search-fact-checks",
  // /verify: the fresh headlines that share a claim's words, read from the
  // RSS caches the digest already writes (no publisher fetch). Free like
  // /verify; bounded by a per-IP limit and the 'fast' CDN tier.
  "/api/news/v1/search-claim-headlines"
]);
var RELAY_WARM_PING_PATHS = /* @__PURE__ */ new Set([
  "/api/infrastructure/v1/list-service-statuses",
  "/api/infrastructure/v1/get-cable-health",
  "/api/infrastructure/v1/list-temporal-anomalies",
  "/api/intelligence/v1/get-risk-scores",
  "/api/supply-chain/v1/get-chokepoint-status",
  // Classify reads the same public digest a session holder can already trigger
  // so self-host / Railway can send WORLDMONITOR_RELAY_KEY instead of an
  // enterprise key (#7437).
  "/api/news/v1/list-feed-digest"
]);
var POST_TO_GET_MAX_BODY_BYTES = 1048576;
var POST_TO_GET_MAX_ARRAY_VALUES_PER_KEY = 200;
var REQUIRED_BBOX_QUERY_PARAMS = ["sw_lat", "sw_lon", "ne_lat", "ne_lon"];
var REQUIRED_BBOX_RPC_PATHS = [
  "/api/military/v1/list-military-bases",
  "/api/military/v1/list-military-flights"
];
var REQUIRED_BBOX_RPC_PATH_SET = new Set(REQUIRED_BBOX_RPC_PATHS);
var MILITARY_BBOX_DIAGNOSTIC_PATH_SET = new Set(REQUIRED_BBOX_RPC_PATHS);
function isPostToGetCompatibleBodySize(headers) {
  const rawContentLength = headers.get("Content-Length");
  if (rawContentLength === null || !/^\d+$/.test(rawContentLength)) return false;
  const contentLength = Number(rawContentLength);
  return Number.isSafeInteger(contentLength) && contentLength < POST_TO_GET_MAX_BODY_BYTES;
}
function isPostToGetScalar(value) {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}
function isPostToGetPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function parsePostToGetCompatBody(bodyText) {
  if (new TextEncoder().encode(bodyText).byteLength >= POST_TO_GET_MAX_BODY_BYTES) {
    return { status: "too_large" };
  }
  if (bodyText.trim().length === 0) {
    return { status: "ok", fields: [] };
  }
  let parsed;
  try {
    parsed = JSON.parse(bodyText);
  } catch {
    return { status: "malformed_json" };
  }
  if (!isPostToGetPlainObject(parsed)) {
    return { status: "unsupported_body" };
  }
  const fields = [];
  for (const [name, value] of Object.entries(parsed)) {
    if (Array.isArray(value)) {
      if (value.length > POST_TO_GET_MAX_ARRAY_VALUES_PER_KEY) {
        return { status: "oversized_array", parameter: name };
      }
      const values = [];
      for (const item of value) {
        if (!isPostToGetScalar(item)) {
          return { status: "unsupported_value", parameter: name };
        }
        values.push(String(item));
      }
      fields.push({ kind: "array", name, values });
      continue;
    }
    if (isPostToGetScalar(value)) {
      fields.push({ kind: "scalar", name, value: String(value) });
      continue;
    }
    return { status: "unsupported_value", parameter: name };
  }
  return { status: "ok", fields };
}
function applyPostToGetCompatFields(searchParams, fields) {
  for (const field of fields) {
    if (field.kind === "scalar") {
      searchParams.set(field.name, field.value);
      continue;
    }
    for (const value of field.values) {
      searchParams.append(field.name, value);
    }
  }
}
function postToGetCompatErrorBody(parsed) {
  if (parsed.status === "too_large") return { error: "malformed_request" };
  if (parsed.status === "malformed_json") return { error: "Invalid JSON body for POST compatibility" };
  if (parsed.status === "unsupported_body") return { error: "Unsupported POST compatibility body" };
  if (parsed.status === "oversized_array") {
    return {
      error: "Too many values for POST compatibility parameter",
      parameter: parsed.parameter,
      maxValues: POST_TO_GET_MAX_ARRAY_VALUES_PER_KEY
    };
  }
  return {
    error: "Unsupported value for POST compatibility parameter",
    parameter: parsed.parameter
  };
}
function getRequiredBboxQueryProblems(searchParams) {
  const absent = [];
  const invalid = [];
  const values = [];
  for (const param of REQUIRED_BBOX_QUERY_PARAMS) {
    const raw = searchParams.get(param);
    if (raw == null) {
      absent.push(param);
      continue;
    }
    if (raw.trim() === "") {
      invalid.push(param);
      continue;
    }
    const value = Number(raw);
    if (!Number.isFinite(value)) {
      invalid.push(param);
      continue;
    }
    values.push(value);
  }
  const missing = absent.length === REQUIRED_BBOX_QUERY_PARAMS.length ? [...REQUIRED_BBOX_QUERY_PARAMS] : [];
  return {
    missing,
    invalid,
    allZero: absent.length === 0 && invalid.length === 0 && values.every((value) => value === 0)
  };
}
function getRequiredBboxDiagnostic(request, pathname) {
  if (!REQUIRED_BBOX_RPC_PATH_SET.has(pathname)) return null;
  const { searchParams } = new URL(request.url);
  const { missing, invalid, allZero } = getRequiredBboxQueryProblems(searchParams);
  if (missing.length === 0 && invalid.length === 0 && !allZero) return null;
  return {
    status: missing.length > 0 ? "missing" : "invalid",
    missing,
    invalid: allZero ? [...REQUIRED_BBOX_QUERY_PARAMS] : invalid
  };
}
function attachRequiredBboxDiagnosticHeaders(headers, pathname, diagnostic) {
  if (!diagnostic) return;
  headers.set("X-WorldMonitor-Bbox", diagnostic.status);
  if (diagnostic.missing.length > 0) headers.set("X-WorldMonitor-Bbox-Missing", diagnostic.missing.join(","));
  if (diagnostic.invalid.length > 0) headers.set("X-WorldMonitor-Bbox-Invalid", diagnostic.invalid.join(","));
  if (MILITARY_BBOX_DIAGNOSTIC_PATH_SET.has(pathname)) {
    headers.set("X-Military-Bbox", diagnostic.status);
  }
}
function cloneRequestWithHeaders(request, headers) {
  return new Request(request, { headers });
}
function stripClientTrustedHeaders(request) {
  if (!request.headers.has(TRUSTED_USER_ID_HEADER) && !request.headers.has(TRUSTED_RATE_LIMIT_PRINCIPAL_HEADER)) {
    return request;
  }
  const headers = new Headers(request.headers);
  headers.delete(TRUSTED_USER_ID_HEADER);
  headers.delete(TRUSTED_RATE_LIMIT_PRINCIPAL_HEADER);
  return cloneRequestWithHeaders(request, headers);
}
function withAuthenticatedUserId(request, userId) {
  const headers = new Headers(request.headers);
  headers.set(TRUSTED_USER_ID_HEADER, userId);
  return cloneRequestWithHeaders(request, headers);
}
function withTrustedRateLimitPrincipal(request, userId, scope) {
  const headers = new Headers(request.headers);
  headers.set(
    TRUSTED_RATE_LIMIT_PRINCIPAL_HEADER,
    formatTrustedRateLimitPrincipal(userId, scope)
  );
  return cloneRequestWithHeaders(request, headers);
}
function normalizeAuthError(error) {
  if (!error || error === USER_API_KEY_GATEWAY_VALIDATION_ERROR) return "Invalid API key";
  return error;
}
function createGatewayAuthErrorResponse(status, error, corsHeaders) {
  return new Response(JSON.stringify({ error: normalizeAuthError(error) }), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...corsHeaders,
      Link: DEPRECATION_POLICY_LINK
    }
  });
}
var GATEWAY_DIRECT_LLM_QUOTA_METHODS = {
  "/api/intelligence/v1/classify-event": "GET",
  "/api/intelligence/v1/deduct-situation": "POST",
  "/api/intelligence/v1/get-country-intel-brief": "GET",
  "/api/market/v1/analyze-stock": "GET",
  "/api/news/v1/summarize-article": "POST"
};
var COUNTRY_INTEL_BRIEF_PATH = "/api/intelligence/v1/get-country-intel-brief";
var pendingDirectLlmReservations = /* @__PURE__ */ new WeakMap();
function methodForGetEquivalentPolicy(method) {
  return method === "HEAD" ? "GET" : method;
}
async function shouldReserveGatewayDirectLlmQuota(request, pathname) {
  if (!DIRECT_LLM_GATEWAY_QUOTA_PATHS.has(pathname)) return false;
  if (GATEWAY_DIRECT_LLM_QUOTA_METHODS[pathname] !== methodForGetEquivalentPolicy(request.method)) return false;
  if (pathname !== "/api/news/v1/summarize-article") return true;
  const contentLength = Number(request.headers.get("Content-Length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength >= POST_TO_GET_MAX_BODY_BYTES) {
    return true;
  }
  try {
    const body = await request.clone().json();
    return body.mode !== "translate";
  } catch {
    return false;
  }
}
function createDirectLlmQuotaFailureResponse(reservation, corsHeaders) {
  if (reservation.ok) {
    throw new Error("createDirectLlmQuotaFailureResponse called for successful reservation");
  }
  if (reservation.reason === "cap-exceeded") {
    return new Response(JSON.stringify({
      error: "Direct LLM daily quota exceeded",
      limit: reservation.floor ?? DIRECT_LLM_DAILY_QUOTA_LIMIT,
      resetsAt: "next UTC midnight"
    }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "Retry-After": String(reservation.retryAfterSec),
        ...corsHeaders
      }
    });
  }
  return new Response(JSON.stringify({ error: "Direct LLM quota unavailable" }), {
    status: 503,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      "Retry-After": String(reservation.retryAfterSec),
      ...corsHeaders
    }
  });
}
function markAuthErrorNoStore(response) {
  response.headers.set("Cache-Control", "no-store");
  response.headers.delete("CDN-Cache-Control");
  response.headers.delete("Vercel-CDN-Cache-Control");
  return response;
}
var CREDENTIAL_BEARING_HEADERS = [
  "Authorization",
  "X-WorldMonitor-Key",
  "X-Api-Key",
  // Widget tester keys (validated in api/widget-agent.ts:273-274). Both are
  // per-principal credentials like the operator keys above: X-Widget-Key
  // unlocks basic, X-Pro-Key unlocks Pro-tier generation.
  "X-Widget-Key",
  "X-Pro-Key",
  "Cookie"
];
var MARKDOWN_TWIN_CALLER_HEADERS = [
  "x-real-ip",
  "x-vercel-forwarded-for",
  "cf-connecting-ip",
  "x-wm-edge-proof",
  "origin"
];
function hasCredentialBearingHeader(request) {
  return CREDENTIAL_BEARING_HEADERS.some((header) => Boolean(request.headers.get(header)));
}
function stripTrailingSlashes2(value) {
  let end = value.length;
  while (end > 1 && value.charCodeAt(end - 1) === 47) end -= 1;
  return end === value.length ? value : value.slice(0, end);
}
async function isResilienceRankingSeedRefreshRequest(request, pathname) {
  if (pathname !== "/api/resilience/v1/get-resilience-ranking") return false;
  const expected = process.env.WORLDMONITOR_SEED_REFRESH_KEY?.trim() ?? "";
  if (!expected) return false;
  try {
    const url = new URL(request.url);
    if (url.searchParams.get("refresh") !== "1") return false;
  } catch {
    return false;
  }
  const candidate = request.headers.get("X-WorldMonitor-Key") ?? "";
  return timingSafeEqual(candidate, expected);
}
async function isRelayWarmPingRequest(request, pathname) {
  if (!RELAY_WARM_PING_PATHS.has(pathname)) return false;
  const expected = process.env.WORLDMONITOR_RELAY_KEY?.trim() ?? "";
  if (!expected) return false;
  const candidate = request.headers.get("X-WorldMonitor-Key") ?? "";
  return timingSafeEqual(candidate, expected);
}
function assertProMcpGatewayHmacConfig() {
  const proGrantSecret = process.env.MCP_PRO_GRANT_HMAC_SECRET?.trim() ?? "";
  const internalSecret = process.env.MCP_INTERNAL_HMAC_SECRET?.trim() ?? "";
  if (proGrantSecret && !internalSecret) {
    throw new Error("MCP_INTERNAL_HMAC_SECRET must be configured when MCP_PRO_GRANT_HMAC_SECRET is set");
  }
}
function createDomainGateway(routes) {
  assertProMcpGatewayHmacConfig();
  const router = createRouter(routes);
  async function dispatch(originalRequest, ctx) {
    const originalPathname = new URL(originalRequest.url).pathname;
    if (originalPathname.startsWith("/api/") && isMarkdownTwinPath(originalPathname) && (originalRequest.method === "GET" || originalRequest.method === "HEAD")) {
      return serveMarkdownTwin(originalRequest, originalPathname, ctx);
    }
    let request = stripClientTrustedHeaders(originalRequest);
    const rawPathname = new URL(request.url).pathname;
    const pathname = stripTrailingSlashes2(rawPathname);
    const t0 = Date.now();
    const rawWidgetKey = request.headers.get("x-widget-key") ?? null;
    const widgetAgentKey = process.env.WIDGET_AGENT_KEY ?? "";
    const validatedWidgetKey = await timingSafeEqualSecret(rawWidgetKey, widgetAgentKey) ? rawWidgetKey : null;
    const usage = {
      sessionUserId: null,
      isUserApiKey: false,
      enterpriseApiKey: null,
      widgetKey: validatedWidgetKey,
      clerkOrgId: null,
      userApiKeyCustomerRef: null,
      tier: null,
      planKey: null
    };
    function recordUsageEntitlement(ent) {
      if (!ent) return;
      if (ent.verificationUnavailable) return;
      usage.tier = typeof ent.features.tier === "number" ? ent.features.tier : 0;
      usage.planKey = ent.planKey;
    }
    const _parts = pathname.split("/");
    const domain = (/^v\d+$/.test(_parts[2] ?? "") ? _parts[3] : _parts[2]) ?? "";
    const reqBytes = deriveReqBytes(request);
    let pendingShadowReason = null;
    function denyForBillingVerification(ent, cors, capabilityCovered = false) {
      if (capabilityCovered) return null;
      const billingDenial = getBillingVerificationDenial(ent, cors);
      if (!billingDenial) return null;
      emitRequest(
        billingDenial.status,
        billingDenial.status === 503 ? "billing_verification_503" : "tier_403",
        null
      );
      return billingDenial;
    }
    function emitRequest(status, reason, cacheTier, resBytes = 0) {
      if (!ctx?.waitUntil) return;
      const effectiveReason = pendingShadowReason && status < 400 ? pendingShadowReason : reason;
      const identity = buildUsageIdentity(usage);
      ctx.waitUntil((async () => {
        const uaHash = await deriveUaHash(originalRequest);
        await deliverUsageEvents([
          buildRequestEvent({
            requestId: deriveRequestId(originalRequest),
            domain,
            route: pathname,
            method: originalRequest.method,
            status,
            durationMs: Date.now() - t0,
            reqBytes,
            resBytes,
            customerId: identity.customer_id,
            principalId: identity.principal_id,
            authKind: identity.auth_kind,
            tier: identity.tier,
            planKey: identity.plan_key,
            country: deriveCountry(originalRequest),
            ipCity: deriveIpCity(originalRequest),
            ipRegion: deriveIpRegion(originalRequest),
            executionRegion: deriveExecutionRegion(originalRequest),
            executionPlane: "vercel-edge",
            originKind: deriveOriginKind(originalRequest),
            cacheTier,
            ip: deriveIp(originalRequest),
            userAgent: deriveUserAgent(originalRequest),
            uaHash,
            referer: deriveReferer(originalRequest),
            acceptLanguage: deriveAcceptLanguage(originalRequest),
            host: deriveHost(originalRequest),
            sentryTraceId: deriveSentryTraceId(originalRequest),
            reason: effectiveReason
          })
        ]);
      })());
    }
    let corsHeaders;
    try {
      corsHeaders = isDisallowedOrigin(request) ? getOriginDeniedCorsHeaders(request) : getCorsHeaders(request);
    } catch (err) {
      const captured = captureSilentError(err, {
        tags: { route: "gateway", step: "cors_headers" }
      });
      ctx?.waitUntil(captured);
      emitRequest(500, "cors_error", null);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          // Prevent CDN/edge from caching the 500 — a transient CORS
          // failure must not be pinned for downstream callers.
          "Cache-Control": "no-store"
        }
      });
    }
    appendDeprecationPolicyLinkToRecord(corsHeaders);
    if (request.method === "OPTIONS") {
      emitRequest(204, "preflight", null);
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (isDisallowedOrigin(request)) {
      emitRequest(403, "origin_403", null);
      return new Response(JSON.stringify({ error: "Origin not allowed" }), {
        status: 403,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders
        }
      });
    }
    {
      const inboundHeaders = request.headers;
      if (inboundHeaders.has(INTERNAL_MCP_VERIFIED_HEADER) || inboundHeaders.has(TRUSTED_USER_ID_HEADER) || inboundHeaders.has(TRUSTED_RATE_LIMIT_PRINCIPAL_HEADER)) {
        const stripped = new Headers(inboundHeaders);
        stripped.delete(INTERNAL_MCP_VERIFIED_HEADER);
        stripped.delete(TRUSTED_USER_ID_HEADER);
        stripped.delete(TRUSTED_RATE_LIMIT_PRINCIPAL_HEADER);
        const reInit = { method: request.method, headers: stripped };
        if (request.method !== "GET" && request.method !== "HEAD") {
          const contentLen = parseInt(request.headers.get("Content-Length") ?? "0", 10);
          if (Number.isFinite(contentLen) && contentLen > MAX_INTERNAL_MCP_BODY) {
            emitRequest(413, "malformed_request", null);
            return new Response(JSON.stringify({ error: "payload_too_large" }), {
              status: 413,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }
          try {
            const bytes = await request.clone().arrayBuffer();
            if (bytes.byteLength > MAX_INTERNAL_MCP_BODY) {
              emitRequest(413, "malformed_request", null);
              return new Response(JSON.stringify({ error: "payload_too_large" }), {
                status: 413,
                headers: { "Content-Type": "application/json", ...corsHeaders }
              });
            }
            reInit.body = bytes;
          } catch {
            emitRequest(400, "malformed_request", null);
            return new Response(JSON.stringify({ error: "malformed_request" }), {
              status: 400,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
          }
        }
        request = new Request(request.url, reInit);
      }
    }
    let internalMcpVerified = false;
    if (request.headers.has(INTERNAL_MCP_SIG_HEADER)) {
      const hmacSecret = process.env.MCP_INTERNAL_HMAC_SECRET ?? "";
      if (!hmacSecret) {
        emitRequest(500, "hmac_secret_unconfigured", null);
        return new Response(
          JSON.stringify({ error: "CONFIGURATION" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      let bodyBytes = null;
      if (request.method !== "GET" && request.method !== "HEAD") {
        const contentLen = parseInt(request.headers.get("Content-Length") ?? "0", 10);
        if (Number.isFinite(contentLen) && contentLen > MAX_INTERNAL_MCP_BODY) {
          emitRequest(413, "malformed_request", null);
          return new Response(JSON.stringify({ error: "payload_too_large" }), {
            status: 413,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
        try {
          bodyBytes = await request.clone().arrayBuffer();
        } catch {
          emitRequest(401, "internal_mcp_bad_request", null);
          return internalMcpSignatureDenial(corsHeaders);
        }
        if (bodyBytes.byteLength > MAX_INTERNAL_MCP_BODY) {
          emitRequest(413, "malformed_request", null);
          return new Response(JSON.stringify({ error: "payload_too_large" }), {
            status: 413,
            headers: { "Content-Type": "application/json", ...corsHeaders }
          });
        }
        request = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: bodyBytes
        });
      }
      const verifyResult = await verifyInternalMcpRequestDetailed(request, hmacSecret);
      if (!verifyResult.ok) {
        emitRequest(401, internalMcpReasonFor(verifyResult.failure), null);
        return internalMcpSignatureDenial(corsHeaders);
      }
      const verified = verifyResult.verified;
      const replayClaim = await claimInternalMcpReplayNonce(verified.userId, verified.nonce);
      if (replayClaim === "unavailable") {
        emitRequest(503, "replay_cache_unavailable", null);
        return new Response(
          JSON.stringify({ error: "internal_mcp_replay_cache_unavailable" }),
          { status: 503, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      if (replayClaim === "replay") {
        emitRequest(401, "internal_mcp_replay", null);
        return internalMcpSignatureDenial(corsHeaders);
      }
      const ent = await getEntitlements(verified.userId);
      const gate = checkProMcpAccess(ent, Date.now());
      const mcpCovered = gate === null;
      const billingDenial = denyForBillingVerification(
        ent,
        corsHeaders,
        mcpCovered
      );
      if (billingDenial) return billingDenial;
      if (!mcpCovered) {
        emitRequest(401, "auth_401", null);
        return new Response(
          JSON.stringify({ error: "insufficient_entitlement" }),
          { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      const trusted = new Headers(request.headers);
      trusted.delete(INTERNAL_MCP_SIG_HEADER);
      trusted.delete(INTERNAL_MCP_USER_ID_HEADER);
      trusted.delete(INTERNAL_MCP_NONCE_HEADER);
      trusted.set(INTERNAL_MCP_VERIFIED_HEADER, getInternalMcpVerifiedNonce());
      trusted.set(TRUSTED_USER_ID_HEADER, verified.userId);
      trusted.set(
        TRUSTED_RATE_LIMIT_PRINCIPAL_HEADER,
        formatTrustedRateLimitPrincipal(verified.userId, "session")
      );
      const rebuildInit = { method: request.method, headers: trusted };
      if (bodyBytes !== null) rebuildInit.body = bodyBytes;
      request = new Request(request.url, rebuildInit);
      usage.sessionUserId = verified.userId;
      recordUsageEntitlement(ent);
      internalMcpVerified = true;
    }
    const isCountryHistoryRpc = pathname === "/api/intelligence/v1/get-country-history";
    const isPublicNoAuthRpc = PUBLIC_NO_AUTH_RPC_PATHS.has(pathname) || isPublicSharedRpcRequest(request.url, request.method);
    let isSidecarOllamaTranslation = false;
    if (process.env.LOCAL_API_MODE === "tauri-sidecar" && request.method === "POST" && pathname === "/api/news/v1/summarize-article") {
      try {
        const body = await request.clone().json();
        isSidecarOllamaTranslation = body.provider === "ollama" && body.mode === "translate";
      } catch {
      }
    }
    const seedRefreshVerified = await isResilienceRankingSeedRefreshRequest(request, pathname);
    const relayWarmPingVerified = await isRelayWarmPingRequest(request, pathname);
    let directLlmPolicyRequest = request;
    if (request.method === "POST" && GATEWAY_DIRECT_LLM_QUOTA_METHODS[pathname] === "GET" && isPostToGetCompatibleBodySize(request.headers) && !router.match(request)) {
      const getProbe = new Request(request.url, { method: "GET", headers: request.headers });
      if (router.match(getProbe)) directLlmPolicyRequest = getProbe;
    }
    const requiresDirectLlmQuota = !internalMcpVerified && await shouldReserveGatewayDirectLlmQuota(directLlmPolicyRequest, pathname);
    const isTierGated = !internalMcpVerified && !isPublicNoAuthRpc && !seedRefreshVerified && !relayWarmPingVerified && getRequiredTier(pathname) !== null;
    const isDockerSelfHostCountryBrief = (request.method === "GET" || request.method === "HEAD") && pathname === COUNTRY_INTEL_BRIEF_PATH && process.env.LOCAL_API_MODE === "docker";
    const needsLegacyProBearerGate = !internalMcpVerified && !isPublicNoAuthRpc && PREMIUM_RPC_PATHS.has(pathname) && !isTierGated;
    const isProFreshCacheRpc = PRO_FRESH_CACHE_RPC_PATHS.has(pathname);
    const needsProFreshnessResolution = !internalMcpVerified && !isPublicNoAuthRpc && isProFreshCacheRpc && request.headers.get("Authorization")?.startsWith("Bearer ") === true;
    let rateLimitPrincipalUserId;
    let sessionUserId = null;
    let sessionRole = null;
    let quotaEntitlements = null;
    let directLlmDailyLimit;
    if (isTierGated || requiresDirectLlmQuota || needsProFreshnessResolution || isCountryHistoryRpc && !internalMcpVerified && request.headers.has("Authorization")) {
      const session = await resolveClerkSession(request);
      if (session && "reason" in session) {
        emitRequest(503, "billing_verification_503", null);
        return sessionVerificationUnavailableResponse(corsHeaders);
      }
      sessionUserId = session?.userId ?? null;
      sessionRole = session?.role ?? null;
      usage.sessionUserId = sessionUserId;
      usage.clerkOrgId = session?.orgId ?? null;
      if (sessionUserId) {
        request = withAuthenticatedUserId(request, sessionUserId);
      }
    }
    let keyCheck = internalMcpVerified || isPublicNoAuthRpc || seedRefreshVerified || relayWarmPingVerified || isSidecarOllamaTranslation ? { valid: true, required: false } : await validateApiKey(request, {
      forceKey: (isTierGated && !sessionUserId || needsLegacyProBearerGate) && !isDockerSelfHostCountryBrief
    });
    let isUserApiKey = false;
    let userKeyPrincipal = null;
    const wmKey = getHeaderApiKey(request);
    const dockerSelfHostSessionAuthorized = isDockerSelfHostCountryBrief && keyCheck.valid && !keyCheck.required && keyCheck.kind === "session";
    if (keyCheck.required && !keyCheck.valid && wmKey.startsWith("wm_")) {
      const validationGuardResponse = await checkFailClosedScopedIpRateLimit(
        request,
        "user-api-key:pre-auth-validation",
        600,
        "60 s",
        corsHeaders
      );
      if (validationGuardResponse) {
        const reason = getRateLimitTelemetryReason(
          validationGuardResponse,
          "rate_limit_429"
        );
        emitRequest(validationGuardResponse.status, reason, null);
        return validationGuardResponse;
      }
      const { validateUserApiKeyPrincipal: validateUserApiKeyPrincipal2 } = await Promise.resolve().then(() => (init_user_api_key(), user_api_key_exports));
      try {
        const userKeyResult = await validateUserApiKeyPrincipal2(wmKey);
        if (userKeyResult) {
          isUserApiKey = true;
          userKeyPrincipal = userKeyResult;
          usage.isUserApiKey = true;
          usage.userApiKeyCustomerRef = userKeyResult.userId;
          keyCheck = { valid: true, required: true };
          sessionUserId = userKeyResult.userId;
          sessionRole = null;
          usage.sessionUserId = sessionUserId;
          usage.clerkOrgId = null;
          request = withAuthenticatedUserId(request, sessionUserId);
        }
      } catch (err) {
        const code = typeof err === "object" && err !== null ? err.code : void 0;
        if (code === "validation_unavailable") {
          emitRequest(503, "validation_unavailable", null);
          return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "Retry-After": "5",
              "X-Validation-Mode": "degraded",
              ...corsHeaders
            }
          });
        }
        throw err;
      }
    }
    if (keyCheck.required && !keyCheck.valid && wmKey.startsWith("wme_") && EMBED_KEY_RPC_PATHS.has(pathname)) {
      const embedGuardResponse = await checkFailClosedScopedIpRateLimit(
        request,
        "embed-key:pre-auth-validation",
        600,
        "60 s",
        corsHeaders
      );
      if (embedGuardResponse) {
        const reason = getRateLimitTelemetryReason(embedGuardResponse, "rate_limit_429");
        emitRequest(embedGuardResponse.status, reason, null);
        return embedGuardResponse;
      }
      const { validateEmbedKey: validateEmbedKey2 } = await Promise.resolve().then(() => (init_embed_key(), embed_key_exports));
      try {
        const embedKeyResult = await validateEmbedKey2(wmKey);
        if (embedKeyResult) {
          const embedEntitlement = await getEntitlements(embedKeyResult.userId);
          const embedCovered = hasEmbedAccess(embedEntitlement, Date.now());
          const billingDenial = denyForBillingVerification(
            embedEntitlement,
            corsHeaders,
            embedCovered
          );
          if (billingDenial) return billingDenial;
          if (embedCovered) {
            keyCheck = { valid: true, required: true };
          }
        }
      } catch (err) {
        const code = typeof err === "object" && err !== null ? err.code : void 0;
        if (code === "validation_unavailable") {
          emitRequest(503, "validation_unavailable", null);
          return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
            status: 503,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "Retry-After": "5",
              "X-Validation-Mode": "degraded",
              ...corsHeaders
            }
          });
        }
        throw err;
      }
    }
    if ((isTierGated || requiresDirectLlmQuota || needsProFreshnessResolution || isCountryHistoryRpc) && !needsLegacyProBearerGate && sessionUserId && keyCheck.required && !keyCheck.valid) {
      keyCheck = { valid: true, required: false };
    }
    const enterpriseCredential = keyCheck.valid && keyCheck.kind === "enterprise" ? keyCheck.credential ?? wmKey : "";
    if (enterpriseCredential && !isUserApiKey) {
      usage.enterpriseApiKey = enterpriseCredential;
    }
    let userKeyEntitlement;
    let isDesktopPrincipal = false;
    if (isUserApiKey && sessionUserId && userKeyPrincipal) {
      userKeyEntitlement = await resolveUserKeyEntitlement(sessionUserId, userKeyPrincipal);
      recordUsageEntitlement(userKeyEntitlement);
      const keyScope = resolveUserKeyScope(userKeyPrincipal, userKeyEntitlement);
      const billingDenial = denyForBillingVerification(
        userKeyEntitlement,
        corsHeaders,
        keyScope.scope !== "denied"
      );
      if (billingDenial) return billingDenial;
      if (!userKeyEntitlement) {
        emitRequest(503, "billing_verification_503", null);
        return new Response(
          JSON.stringify({
            error: "Unable to verify API access",
            code: "entitlement_verification_unavailable"
          }),
          {
            status: 503,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
              "Retry-After": "5",
              "X-Billing-Verification": "entitlement_verification_unavailable"
            }
          }
        );
      } else if (keyScope.scope === "denied") {
        emitRequest(403, "tier_403", null);
        return createGatewayAuthErrorResponse(
          403,
          keyScope.reason === "over_cap" ? DESKTOP_KEY_LIMIT_ERROR : userKeyPrincipal.keyKind === "desktop" ? "Pro subscription required" : "API access requires an active subscription",
          corsHeaders
        );
      } else if (keyScope.scope === "desktop") {
        if (isApiOnlyPath(pathname)) {
          emitRequest(403, "tier_403", null);
          return createGatewayAuthErrorResponse(403, DESKTOP_KEY_API_ONLY_ERROR, corsHeaders);
        }
        isDesktopPrincipal = true;
        rateLimitPrincipalUserId = sessionUserId;
      } else {
        rateLimitPrincipalUserId = sessionUserId;
      }
    }
    let hasProFreshCacheAccess = internalMcpVerified && isProFreshCacheRpc;
    if (!hasProFreshCacheAccess && isProFreshCacheRpc && sessionUserId) {
      const ent = userKeyEntitlement !== void 0 ? userKeyEntitlement : await getEntitlements(sessionUserId);
      recordUsageEntitlement(ent);
      hasProFreshCacheAccess = !!ent && ent.features.tier >= 1 && hasCurrentEntitlementCoverage(ent);
      if (hasProFreshCacheAccess) {
        rateLimitPrincipalUserId = sessionUserId;
      }
    }
    if (isCountryHistoryRpc && !keyCheck.valid && !wmKey && !request.headers.has("Authorization")) {
      keyCheck = { valid: true, required: false };
    }
    if (keyCheck.required && !keyCheck.valid) {
      if (needsLegacyProBearerGate) {
        const authHeader = request.headers.get("Authorization");
        if (authHeader?.startsWith("Bearer ")) {
          const { validateBearerToken: validateBearerToken2 } = await Promise.resolve().then(() => (init_auth_session(), auth_session_exports));
          const session = await validateBearerToken2(authHeader.slice(7));
          if (!session.valid) {
            emitRequest(401, "auth_401", null);
            return createGatewayAuthErrorResponse(401, "Invalid or expired session", corsHeaders);
          }
          if (session.userId) {
            sessionUserId = session.userId;
            usage.sessionUserId = session.userId;
            request = withAuthenticatedUserId(request, session.userId);
          }
          let allowed = session.role === "pro";
          if (!allowed && session.userId) {
            const ent = await getEntitlements(session.userId);
            recordUsageEntitlement(ent);
            const proCovered = !!ent && ent.features.tier >= 1 && hasCurrentEntitlementCoverage(ent);
            const billingDenial = denyForBillingVerification(
              ent,
              corsHeaders,
              proCovered
            );
            if (billingDenial) return billingDenial;
            allowed = !!ent && ent.features.tier >= 1 && hasCurrentEntitlementCoverage(ent);
          }
          if (!allowed) {
            emitRequest(403, "tier_403", null);
            return createGatewayAuthErrorResponse(403, "Pro subscription required", corsHeaders);
          }
          rateLimitPrincipalUserId = session.userId;
        } else {
          emitRequest(401, "auth_401", null);
          return createGatewayAuthErrorResponse(401, keyCheck.error, corsHeaders);
        }
      } else {
        emitRequest(401, "auth_401", null);
        return createGatewayAuthErrorResponse(401, keyCheck.error, corsHeaders);
      }
    }
    const isEnterpriseAuth = keyCheck.valid && Boolean(enterpriseCredential) && !isUserApiKey && keyCheck.kind === "enterprise";
    if (requiresDirectLlmQuota && isEnterpriseAuth && enterpriseCredential !== wmKey) {
      const origin = request.headers.get("Origin");
      const hasRequestIntent = origin ? isAllowedOrigin(origin) : request.headers.get("Sec-Fetch-Site") === "same-origin";
      if (!hasRequestIntent) {
        emitRequest(403, "auth_403", null);
        return createGatewayAuthErrorResponse(403, "Request intent required for cookie-authorized AI work", corsHeaders);
      }
    }
    if (!dockerSelfHostSessionAuthorized && !isEnterpriseAuth && !internalMcpVerified && !seedRefreshVerified && !relayWarmPingVerified) {
      const entitlementCheck = await checkEntitlementDetailed(sessionUserId, pathname, corsHeaders, {
        clerkRole: sessionRole
      });
      quotaEntitlements = entitlementCheck.entitlements;
      recordUsageEntitlement(entitlementCheck.entitlements);
      const entitlementResponse = entitlementCheck.response;
      if (entitlementResponse) {
        const entReason = entitlementResponse.status === 401 ? "auth_401" : entitlementResponse.status === 403 ? "tier_403" : entitlementResponse.status === 503 ? "billing_verification_503" : "ok";
        emitRequest(entitlementResponse.status, entReason, null);
        return entitlementResponse.status === 401 || entitlementResponse.status === 403 ? markAuthErrorNoStore(entitlementResponse) : entitlementResponse;
      }
      if (sessionUserId && isTierGated) {
        rateLimitPrincipalUserId = sessionUserId;
      }
      if (pathname === "/api/news/v1/summarize-article" && requiresDirectLlmQuota && sessionUserId) {
        const attributionGuardResponse = await checkFailClosedScopedIpRateLimit(
          request,
          "summarize-article:principal-attribution",
          600,
          "60 s",
          corsHeaders
        );
        if (attributionGuardResponse) {
          const reason = getRateLimitTelemetryReason(
            attributionGuardResponse,
            "rate_limit_429"
          );
          emitRequest(attributionGuardResponse.status, reason, null);
          return attributionGuardResponse;
        }
        const ent = entitlementCheck.entitlements ?? (userKeyEntitlement !== void 0 ? userKeyEntitlement : await getEntitlements(sessionUserId));
        quotaEntitlements = ent;
        recordUsageEntitlement(ent);
        if (ent && ent.features.tier >= 1 && hasCurrentEntitlementCoverage(ent)) {
          rateLimitPrincipalUserId = sessionUserId;
        }
      }
    }
    let matchedHandler = router.match(request);
    let pendingPostToGetCompatError = null;
    if (!matchedHandler && request.method === "POST") {
      if (isPostToGetCompatibleBodySize(request.headers)) {
        const url = new URL(request.url);
        const getProbe = new Request(url.toString(), { method: "GET", headers: request.headers });
        const getProbeHandler = router.match(getProbe);
        if (getProbeHandler) {
          let compatErrorBody = null;
          let compatFields = [];
          try {
            const parsed = parsePostToGetCompatBody(await request.clone().text());
            if (parsed.status === "ok") {
              compatFields = parsed.fields;
            } else {
              compatErrorBody = postToGetCompatErrorBody(parsed);
            }
          } catch {
            compatErrorBody = { error: "malformed_request" };
          }
          if (compatErrorBody) {
            pendingPostToGetCompatError = new Response(JSON.stringify(compatErrorBody), {
              status: 400,
              headers: { "Content-Type": "application/json", ...corsHeaders }
            });
            matchedHandler = getProbeHandler;
            request = getProbe;
          } else {
            applyPostToGetCompatFields(url.searchParams, compatFields);
            const getReq = new Request(url.toString(), { method: "GET", headers: request.headers });
            matchedHandler = router.match(getReq);
            if (matchedHandler) request = getReq;
          }
        }
      }
    }
    if (!matchedHandler) {
      const allowed = router.allowedMethods(new URL(request.url).pathname);
      if (allowed.length > 0) {
        emitRequest(405, "method_not_allowed", null);
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
          status: 405,
          headers: { "Content-Type": "application/json", Allow: allowed.join(", "), ...corsHeaders }
        });
      }
      emitRequest(404, "unknown_route", null);
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
    const requiredBboxDiagnostic = getRequiredBboxDiagnostic(request, pathname);
    const identityForScope = buildUsageIdentity(usage);
    let idempotency = null;
    const hasIdempotencyKey = request.method === "POST" && request.headers.has(IDEMPOTENCY_HEADER) && !IDEMPOTENCY_EXEMPT_RPC_PATHS.has(pathname);
    const idScope = isUserApiKey && pathname === "/api/v2/shipping/webhooks" ? userKeyPrincipal?.keyHash ?? null : identityForScope.principal_id ?? identityForScope.customer_id;
    const idempotencyScope = idScope ? `${identityForScope.auth_kind}:${idScope}` : null;
    if (hasIdempotencyKey) {
      const peek = await peekIdempotency({
        request,
        pathname,
        scope: idempotencyScope,
        idempotencyKey: request.headers.get(IDEMPOTENCY_HEADER) ?? "",
        corsHeaders
      });
      switch (peek.kind) {
        case "invalid":
          emitRequest(400, "idempotency_invalid", null);
          return peek.response;
        case "replay":
          emitRequest(peek.response.status, "idempotent_replay", null);
          return peek.response;
        case "conflict":
          emitRequest(409, "idempotency_conflict", null);
          return peek.response;
        case "mismatch":
          emitRequest(422, "idempotency_mismatch", null);
          return peek.response;
      }
    }
    const subRequestAdmission = await consumeSubRequestAdmission(request, rateLimitPrincipalUserId ? formatTrustedRateLimitPrincipal(rateLimitPrincipalUserId, isUserApiKey ? "api_key" : "session") : null);
    if (subRequestAdmission === "unavailable") {
      const response2 = new Response(JSON.stringify({ error: "Rate-limit service temporarily unavailable" }), {
        status: 503,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          ...RATE_LIMIT_DEGRADED_HEADERS,
          ...corsHeaders
        }
      });
      emitRequest(503, "rate_limit_degraded", null);
      return response2;
    }
    const isServerSubRequest = subRequestAdmission === "admitted";
    if (!isServerSubRequest && internalMcpVerified && (pathname === "/api/aviation/v1/search-google-flights" || pathname === "/api/aviation/v1/search-google-dates")) {
      const endpointRlResponse = await checkEndpointRateLimit(request, pathname, corsHeaders, {
        principalUserId: request.headers.get(TRUSTED_USER_ID_HEADER),
        principalScope: "session"
      });
      if (endpointRlResponse) {
        const reason = getRateLimitTelemetryReason(endpointRlResponse, "rate_limit_429_endpoint");
        emitRequest(endpointRlResponse.status, reason, null);
        return endpointRlResponse;
      }
    }
    if (!internalMcpVerified) {
      const isSidecarProviderLookup = process.env.LOCAL_API_MODE === "tauri-sidecar" && (pathname === "/api/aviation/v1/track-aircraft" || pathname === "/api/military/v1/get-wingbits-live-flight" || pathname === "/api/imagery/v1/search-imagery" || pathname === "/api/webcam/v1/get-webcam-image");
      const endpointRlResponse = isServerSubRequest || isSidecarProviderLookup || isSidecarOllamaTranslation ? null : rateLimitPrincipalUserId ? await checkEndpointRateLimit(request, pathname, corsHeaders, {
        principalUserId: rateLimitPrincipalUserId,
        principalScope: isUserApiKey ? "api_key" : "session"
      }) : await checkEndpointRateLimit(request, pathname, corsHeaders);
      if (endpointRlResponse) {
        const reason = getRateLimitTelemetryReason(
          endpointRlResponse,
          "rate_limit_429_endpoint"
        );
        emitRequest(endpointRlResponse.status, reason, null);
        return endpointRlResponse;
      }
      let governedByApiKeyLayer = false;
      let rollbackDailyMeter;
      if (isDesktopPrincipal && sessionUserId) {
        const budget = await chargeDesktopKeyBudget2({
          userId: sessionUserId,
          entitlement: userKeyEntitlement,
          pipeline: (cmds) => runRedisPipeline(cmds)
        });
        if (!budget.ok) {
          emitRequest(
            budget.status,
            budget.reason === "unavailable" ? "rate_limit_degraded" : budget.reason === "daily" ? "rl_ceiling_429" : "rl_min_429",
            null
          );
          return new Response(JSON.stringify(budget.body), {
            status: budget.status,
            headers: { "Content-Type": "application/json", ...budget.headers, ...corsHeaders }
          });
        }
        rollbackDailyMeter = budget.rollback;
      }
      if (keyCheck.valid && (isUserApiKey || isEnterpriseAuth) && !isDesktopPrincipal) {
        const enforce = process.env.API_RATE_LIMIT_ENFORCE === "true";
        let perMinute = 0;
        let allowance = -1;
        let identity = "";
        let planKey = "";
        if (isEnterpriseAuth) {
          perMinute = ENTERPRISE_API_RATE_LIMIT2;
          allowance = OPERATOR_KEY_DAILY_CEILINGS.restRequests;
          planKey = "enterprise";
          usage.tier = 3;
          identity = hashKeySync(enterpriseCredential);
        } else if (sessionUserId) {
          const ent = userKeyEntitlement !== void 0 ? userKeyEntitlement : await getEntitlements(sessionUserId);
          if (ent) {
            recordUsageEntitlement(ent);
          }
          if (ent && ent.features.apiAccess && ent.features.apiRateLimit > 0) {
            perMinute = ent.features.apiRateLimit;
            allowance = typeof ent.features.apiDailyAllowance === "number" ? ent.features.apiDailyAllowance : -1;
            planKey = ent.planKey;
            identity = sessionUserId;
          }
        }
        if (perMinute > 0 && identity) {
          const upgradeUrl = planKey && planKey !== "enterprise" ? "https://worldmonitor.app/" : void 0;
          const burst = await checkBurst2(perMinute, identity);
          if (burst.ok === false) {
            if (enforce) {
              const retryAfterSec = Math.max(1, Math.ceil((burst.reset - Date.now()) / 1e3));
              emitRequest(429, "rl_min_429", null);
              return new Response(JSON.stringify({
                error: "Too many requests",
                plan: planKey || void 0,
                limit: burst.limit,
                limit_type: "per_minute",
                reset: new Date(burst.reset).toISOString(),
                upgrade_url: upgradeUrl
              }), {
                status: 429,
                headers: {
                  "Content-Type": "application/json",
                  "Cache-Control": "no-store",
                  ...rateLimitHeaders2({ limit: burst.limit, remaining: 0, resetMs: burst.reset, retryAfterSec, windowSec: 60 }),
                  ...corsHeaders
                }
              });
            }
            pendingShadowReason = "rl_min_shadow";
          } else if (allowance >= 0) {
            const meter = await reserveDailyMeter2({
              userId: identity,
              allowance,
              pipeline: (cmds) => runRedisPipeline(cmds)
            });
            if (meter.metered) rollbackDailyMeter = meter.rollback;
            if (meter.metered && planKey === "enterprise") {
              reportHighUsageIfCrossed({
                meter: "rest",
                credential: isEnterpriseAuth ? "operator-key" : "enterprise-plan",
                principal: identity,
                newCount: meter.count,
                ceiling: allowance,
                ctx
              });
            }
            if (meter.overLimit) {
              if (enforce) {
                await meter.rollback();
                emitRequest(429, "rl_ceiling_429", null);
                return new Response(JSON.stringify({
                  error: "Daily request limit reached",
                  plan: planKey || void 0,
                  limit: allowance,
                  limit_type: "daily",
                  reset: new Date(Date.now() + meter.retryAfterSec * 1e3).toISOString(),
                  upgrade_url: upgradeUrl
                }), {
                  status: 429,
                  headers: {
                    "Content-Type": "application/json",
                    "Cache-Control": "no-store",
                    ...rateLimitHeaders2({
                      limit: allowance,
                      remaining: 0,
                      resetMs: Date.now() + meter.retryAfterSec * 1e3,
                      retryAfterSec: meter.retryAfterSec,
                      // Daily ceiling window (24 h) for the advertised policy.
                      windowSec: 86400
                    }),
                    ...corsHeaders
                  }
                });
              }
              pendingShadowReason = "rl_ceiling_shadow";
            }
          }
          if (enforce && burst.ok === true) governedByApiKeyLayer = true;
        }
      }
      if (!isServerSubRequest && !governedByApiKeyLayer && !hasEndpointRatePolicy(pathname)) {
        const rateLimitResponse = rateLimitPrincipalUserId ? await checkRateLimit(request, corsHeaders, {
          principalUserId: rateLimitPrincipalUserId,
          principalScope: isUserApiKey ? "api_key" : "session"
        }) : await checkRateLimit(request, corsHeaders);
        if (rateLimitResponse) {
          await rollbackDailyMeter?.();
          const reason = getRateLimitTelemetryReason(
            rateLimitResponse,
            "rate_limit_429_global"
          );
          emitRequest(rateLimitResponse.status, reason, null);
          return rateLimitResponse;
        }
      }
    }
    if (pendingPostToGetCompatError) {
      emitRequest(400, "malformed_request", null);
      return pendingPostToGetCompatError;
    }
    let directLlmRollback = null;
    const releaseDirectLlmReservation = async () => {
      const rollback = directLlmRollback;
      directLlmRollback = null;
      pendingDirectLlmReservations.delete(originalRequest);
      if (rollback) await rollback();
    };
    if (requiresDirectLlmQuota) {
      const dockerQuotaUserId = dockerSelfHostSessionAuthorized ? `docker:${hashKeySync(deriveIp(request) ?? "unknown")}` : null;
      const operatorQuotaUserId = isEnterpriseAuth ? await operatorKeyQuotaPrincipal(enterpriseCredential) : null;
      const quotaUserId = operatorQuotaUserId ?? sessionUserId ?? dockerQuotaUserId;
      if (!quotaUserId) {
        emitRequest(401, "auth_401", null);
        return createGatewayAuthErrorResponse(401, "Pro authentication required", corsHeaders);
      }
      let ent = null;
      if (isEnterpriseAuth) {
        directLlmDailyLimit = OPERATOR_KEY_DAILY_CEILINGS.directLlmCalls;
      } else {
        ent = quotaEntitlements ?? (sessionUserId ? userKeyEntitlement !== void 0 ? userKeyEntitlement : await getEntitlements(sessionUserId) : null);
        if (ent) recordUsageEntitlement(ent);
        directLlmDailyLimit = sessionUserId ? resolveActiveDirectLlmLimit(ent) : DIRECT_LLM_UNVERIFIED_DAILY_QUOTA_LIMIT;
      }
      if (directLlmDailyLimit !== null) {
        const reservation = await reserveDirectLlmQuota({
          userId: quotaUserId,
          limit: directLlmDailyLimit,
          pipeline: (cmds) => runRedisPipeline(cmds, true)
        });
        if (!reservation.ok) {
          const response2 = createDirectLlmQuotaFailureResponse(reservation, corsHeaders);
          emitRequest(
            response2.status,
            response2.status === 429 ? "rate_limit_429_direct_llm" : "rate_limit_degraded",
            null
          );
          return response2;
        }
        if (isEnterpriseAuth || (ent?.features.tier ?? 0) >= 3) {
          reportHighUsageIfCrossed({
            meter: "direct-llm",
            credential: isEnterpriseAuth ? "operator-key" : "enterprise-plan",
            principal: isEnterpriseAuth ? hashKeySync(enterpriseCredential) : quotaUserId,
            newCount: reservation.newCount,
            ceiling: directLlmDailyLimit,
            ctx
          });
        }
        directLlmRollback = reservation.rollback;
        pendingDirectLlmReservations.set(originalRequest, reservation.rollback);
      }
    }
    if (hasIdempotencyKey) {
      idempotency = await beginIdempotency({
        request,
        pathname,
        // Tag the scope with the auth kind so value spaces (Clerk id vs hashed
        // key vs customer ref) can never collide across authentication methods.
        scope: idempotencyScope,
        idempotencyKey: request.headers.get(IDEMPOTENCY_HEADER) ?? "",
        corsHeaders
      });
      switch (idempotency.kind) {
        case "invalid":
          await releaseDirectLlmReservation();
          emitRequest(400, "idempotency_invalid", null);
          return idempotency.response;
        case "replay":
          await releaseDirectLlmReservation();
          emitRequest(idempotency.response.status, "idempotent_replay", null);
          return idempotency.response;
        case "conflict":
          await releaseDirectLlmReservation();
          emitRequest(409, "idempotency_conflict", null);
          return idempotency.response;
        case "mismatch":
          await releaseDirectLlmReservation();
          emitRequest(422, "idempotency_mismatch", null);
          return idempotency.response;
      }
    }
    let response;
    const handlerCall = matchedHandler;
    const requestForHandler = rateLimitPrincipalUserId ? withTrustedRateLimitPrincipal(
      request,
      rateLimitPrincipalUserId,
      isUserApiKey ? "api_key" : "session"
    ) : request;
    if (isCountryHistoryRpc) {
      const userId = sessionUserId ?? usage.sessionUserId;
      const ent = !isEnterpriseAuth && userId ? userKeyEntitlement ?? quotaEntitlements ?? await getEntitlements(userId) : null;
      const denial = ent?.verificationUnavailable ? getBillingVerificationDenial(ent, corsHeaders) : null;
      if (denial) return denial;
      bindCountryHistoryAccess(requestForHandler, isEnterpriseAuth ? 365 : countryHistoryDays(ent));
    }
    try {
      response = await runWithUsageScope(
        {
          ctx: ctx ?? { waitUntil: () => {
          } },
          requestId: deriveRequestId(originalRequest),
          customerId: identityForScope.customer_id,
          route: pathname,
          tier: identityForScope.tier
        },
        () => handlerCall(requestForHandler)
      );
    } catch (err) {
      console.error("[gateway] Unhandled handler error:", err);
      response = new Response(JSON.stringify({ message: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    const mergedHeaders = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders)) {
      mergedHeaders.set(key, value);
    }
    const extraHeaders = drainResponseHeaders(requestForHandler);
    if (extraHeaders) {
      for (const [key, value] of Object.entries(extraHeaders)) {
        mergedHeaders.set(key, value);
      }
    }
    appendDeprecationPolicyLink(mergedHeaders);
    const retryableResponse = drainRetryableResponse(requestForHandler);
    const unservedLlmResponse = drainUnservedLlmResponse(requestForHandler);
    if (directLlmRollback && (response.status >= 400 || retryableResponse || unservedLlmResponse)) {
      await releaseDirectLlmReservation();
    }
    attachRequiredBboxDiagnosticHeaders(mergedHeaders, pathname, requiredBboxDiagnostic);
    const statusOverride = drainSuccessStatusOverride(requestForHandler);
    const finalStatus = statusOverride !== void 0 && request.method === "POST" && response.status === 200 ? statusOverride : response.status;
    let resolvedCacheTier = null;
    if (response.status === 200 && (request.method === "GET" || request.method === "HEAD") && response.body) {
      const bodyBytes = await response.arrayBuffer();
      const bodyStr = new TextDecoder().decode(bodyBytes);
      const noStoreReason = getRpcNoStoreReasonFromJson(bodyStr, { pathname });
      const rpcName = pathname.split("/").pop() ?? "";
      const envOverride = process.env[`CACHE_TIER_OVERRIDE_${rpcName.replace(/-/g, "_").toUpperCase()}`];
      const mapTier = RPC_CACHE_TIER[pathname];
      const declaredTier = (envOverride && envOverride in TIER_HEADERS ? envOverride : null) ?? mapTier;
      if (mergedHeaders.get("X-No-Cache") || noStoreReason || declaredTier === "no-store" || mapTier === "no-store") {
        mergedHeaders.set("Cache-Control", "no-store");
        mergedHeaders.delete("CDN-Cache-Control");
        mergedHeaders.delete("Vercel-CDN-Cache-Control");
        mergedHeaders.set("X-Cache-Tier", "no-store");
        resolvedCacheTier = "no-store";
      } else {
        const isPremium = PREMIUM_RPC_PATHS.has(pathname) || getRequiredTier(pathname) !== null;
        const hasCredentialedNonPublicGet = !isPublicNoAuthRpc && hasCredentialBearingHeader(request);
        const tier = hasProFreshCacheAccess ? "live-browser" : isPremium || hasCredentialedNonPublicGet ? "slow-browser" : declaredTier ?? "medium";
        resolvedCacheTier = tier;
        const isPrivateResponse = hasCredentialedNonPublicGet || isPremium && !isPublicNoAuthRpc;
        const cacheControl = isPrivateResponse && !TIER_HEADERS[tier].includes("private") ? `private, ${TIER_HEADERS[tier]}` : TIER_HEADERS[tier];
        mergedHeaders.set("Cache-Control", cacheControl);
        const reqOrigin = request.headers.get("origin") || "";
        const cdnCache = !hasProFreshCacheAccess && !isPremium && !hasCredentialedNonPublicGet && isAllowedOrigin(reqOrigin) ? TIER_CDN_CACHE[tier] : null;
        mergedHeaders.delete("CDN-Cache-Control");
        mergedHeaders.delete("Vercel-CDN-Cache-Control");
        if (cdnCache) mergedHeaders.set("CDN-Cache-Control", cdnCache);
        mergedHeaders.set("X-Cache-Tier", tier);
      }
      mergedHeaders.delete("X-No-Cache");
      if (!new URL(request.url).searchParams.has("_debug")) {
        mergedHeaders.delete("X-Cache-Tier");
      }
      let responseView = new Uint8Array(bodyBytes);
      const jmespathExpr = new URL(request.url).searchParams.get("jmespath");
      if (jmespathExpr && (mergedHeaders.get("Content-Type") ?? "").includes("application/json")) {
        let projection = projectJsonResponse(bodyStr, jmespathExpr);
        if (projection.ok) {
          const attributionExpr = REST_ATTRIBUTION_EXPRESSIONS[pathname];
          if (attributionExpr !== void 0) {
            let unprojected;
            try {
              unprojected = JSON.parse(bodyStr);
            } catch {
              unprojected = null;
            }
            const rider = buildAttributionRider(unprojected, attributionExpr);
            if (rider !== null) {
              const projectedBody = mergeAttributionRider(projection.body, rider);
              projection = enforceRestProjectionOutputLimit(projectedBody, unprojected);
            }
          }
        }
        if (!projection.ok) {
          const errorBody = JSON.stringify(projection.envelope);
          emitRequest(400, "malformed_request", null, errorBody.length);
          maybeAttachDevHealthHeader(mergedHeaders);
          return new Response(errorBody, {
            status: 400,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json; charset=utf-8",
              "X-Content-Type-Options": "nosniff",
              "Cache-Control": "no-store"
            }
          });
        }
        responseView = new TextEncoder().encode(projection.body);
        mergedHeaders.delete("Content-Length");
      }
      let hash = 2166136261;
      const view = responseView;
      for (let i = 0; i < view.length; i++) {
        hash ^= view[i];
        hash = Math.imul(hash, 16777619);
      }
      const etag = `"${(hash >>> 0).toString(36)}-${view.length.toString(36)}"`;
      mergedHeaders.set("ETag", etag);
      const ifNoneMatch = request.headers.get("If-None-Match");
      if (ifNoneMatch === etag) {
        emitRequest(304, "ok", resolvedCacheTier, 0);
        maybeAttachDevHealthHeader(mergedHeaders);
        return new Response(null, { status: 304, headers: mergedHeaders });
      }
      emitRequest(response.status, "ok", resolvedCacheTier, view.length);
      maybeAttachDevHealthHeader(mergedHeaders);
      return new Response(responseView, {
        status: response.status,
        statusText: response.statusText,
        headers: mergedHeaders
      });
    }
    if (response.status === 200 && (request.method === "GET" || request.method === "HEAD")) {
      if (mergedHeaders.get("X-No-Cache")) {
        mergedHeaders.set("Cache-Control", "no-store");
      }
      mergedHeaders.delete("X-No-Cache");
    }
    if (idempotency?.kind === "proceed") {
      const bodyBytes = response.body ? await response.arrayBuffer() : new ArrayBuffer(0);
      mergedHeaders.set(IDEMPOTENCY_HEADER, idempotency.key);
      mergedHeaders.set(IDEMPOTENT_REPLAYED_HEADER, "false");
      await idempotency.store(
        retryableResponse ? 503 : finalStatus,
        bodyBytes,
        response.headers.get("content-type")
      );
      emitRequest(finalStatus, "ok", resolvedCacheTier, bodyBytes.byteLength);
      maybeAttachDevHealthHeader(mergedHeaders);
      return new Response(bodyBytes, {
        status: finalStatus,
        statusText: response.statusText,
        headers: mergedHeaders
      });
    }
    const finalContentLen = response.headers.get("content-length");
    const finalResBytes = finalContentLen ? Number(finalContentLen) || 0 : 0;
    emitRequest(finalStatus, "ok", resolvedCacheTier, finalResBytes);
    maybeAttachDevHealthHeader(mergedHeaders);
    return new Response(response.body, {
      status: finalStatus,
      statusText: response.statusText,
      headers: mergedHeaders
    });
  }
  async function serveMarkdownTwin(caller, markdownPath, ctx) {
    let corsHeaders;
    try {
      corsHeaders = isDisallowedOrigin(caller) ? getOriginDeniedCorsHeaders(caller) : getCorsHeaders(caller);
    } catch {
      corsHeaders = {};
    }
    const callerOrigin = new URL(caller.url).origin;
    const dispatchSibling = (async (input, init) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      if (url.origin !== callerOrigin || router.allowedMethods(stripTrailingSlashes2(url.pathname)).length === 0) {
        return new Response(null, { status: 404, headers: { "Cache-Control": "no-store" } });
      }
      const headers = new Headers(init?.headers);
      for (const name of MARKDOWN_TWIN_CALLER_HEADERS) {
        const value = caller.headers.get(name);
        if (value) headers.set(name, value);
      }
      return gatewayHandler(new Request(url, { method: init?.method ?? "GET", headers, signal: init?.signal }), ctx);
    });
    return buildMarkdownTwinResponse(caller, markdownPath, dispatchSibling, {
      corsHeaders,
      inheritSiblingCacheControl: true
    });
  }
  const gatewayHandler = async function handler(originalRequest, ctx) {
    let response;
    try {
      response = await dispatch(originalRequest, ctx);
    } catch (err) {
      const rollback = pendingDirectLlmReservations.get(originalRequest);
      if (rollback) {
        pendingDirectLlmReservations.delete(originalRequest);
        await rollback();
      }
      throw err;
    }
    pendingDirectLlmReservations.delete(originalRequest);
    return originalRequest.method === "HEAD" ? toHeadResponse(response) : response;
  };
  return gatewayHandler;
}

// src/generated/server/worldmonitor/webcam/v1/service_server.ts
var ValidationError = class extends Error {
  violations;
  constructor(violations) {
    super("Validation failed");
    this.name = "ValidationError";
    this.violations = violations;
  }
};
function createWebcamServiceRoutes(handler, options) {
  return [
    {
      method: "GET",
      path: "/api/webcam/v1/list-webcams",
      handler: async (req) => {
        try {
          const pathParams = {};
          const url = new URL(req.url, "http://localhost");
          const params = url.searchParams;
          const body = {
            zoom: Number(params.get("zoom") ?? "0"),
            boundW: Number(params.get("bound_w") ?? "0"),
            boundS: Number(params.get("bound_s") ?? "0"),
            boundE: Number(params.get("bound_e") ?? "0"),
            boundN: Number(params.get("bound_n") ?? "0")
          };
          if (options?.validateRequest) {
            const bodyViolations = options.validateRequest("listWebcams", body);
            if (bodyViolations) {
              throw new ValidationError(bodyViolations);
            }
          }
          const ctx = {
            request: req,
            pathParams,
            headers: Object.fromEntries(req.headers.entries())
          };
          const result = await handler.listWebcams(ctx, body);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (err) {
          if (err instanceof ValidationError) {
            return new Response(JSON.stringify({ violations: err.violations }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }
          if (options?.onError) {
            return options.onError(err, req);
          }
          const message2 = "Internal server error";
          return new Response(JSON.stringify({ message: message2 }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    },
    {
      method: "GET",
      path: "/api/webcam/v1/get-webcam-image",
      handler: async (req) => {
        try {
          const pathParams = {};
          const url = new URL(req.url, "http://localhost");
          const params = url.searchParams;
          const body = {
            webcamId: params.get("webcam_id") ?? ""
          };
          if (options?.validateRequest) {
            const bodyViolations = options.validateRequest("getWebcamImage", body);
            if (bodyViolations) {
              throw new ValidationError(bodyViolations);
            }
          }
          const ctx = {
            request: req,
            pathParams,
            headers: Object.fromEntries(req.headers.entries())
          };
          const result = await handler.getWebcamImage(ctx, body);
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { "Content-Type": "application/json" }
          });
        } catch (err) {
          if (err instanceof ValidationError) {
            return new Response(JSON.stringify({ violations: err.violations }), {
              status: 400,
              headers: { "Content-Type": "application/json" }
            });
          }
          if (options?.onError) {
            return options.onError(err, req);
          }
          const message2 = "Internal server error";
          return new Response(JSON.stringify({ message: message2 }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
          });
        }
      }
    }
  ];
}

// server/worldmonitor/webcam/v1/list-webcams.ts
init_redis();

// server/_shared/required-seed.ts
init_redis();
var SeedUnavailableError = class extends Error {
  statusCode = 503;
  constructor(key) {
    super(`Seed unavailable: ${key}`);
    this.name = "SeedUnavailableError";
  }
};
async function readRequiredSeed(key, decode3) {
  const result = await readCachedJson(key, true);
  if (result.status === "error") logCacheReadError(key, result.error);
  if (result.status !== "hit") throw new SeedUnavailableError(key);
  const data = decode3(result.value);
  if (data === void 0) throw new SeedUnavailableError(key);
  return data;
}

// server/worldmonitor/webcam/v1/list-webcams.ts
var MAX_RESULTS = 2e3;
var RESPONSE_CACHE_TTL = 3600;
function getClusterCellSize(zoom) {
  if (zoom < 3) return 8;
  if (zoom <= 4) return 5;
  if (zoom <= 6) return 2;
  if (zoom <= 8) return 0.5;
  return 0;
}
function clusterWebcams(webcams, cellSize) {
  if (cellSize <= 0) {
    return {
      singles: webcams.map((w) => ({
        webcamId: w.webcamId,
        title: w.title,
        lat: w.lat,
        lng: w.lng,
        category: w.category,
        country: w.country
      })),
      clusters: []
    };
  }
  const buckets = /* @__PURE__ */ new Map();
  for (const w of webcams) {
    const key = `${Math.floor(w.lat / cellSize)}:${Math.floor(w.lng / cellSize)}`;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = [];
      buckets.set(key, bucket);
    }
    bucket.push(w);
  }
  const singles = [];
  const clusters = [];
  for (const bucket of buckets.values()) {
    if (bucket.length === 1) {
      const w = bucket[0];
      singles.push({
        webcamId: w.webcamId,
        title: w.title,
        lat: w.lat,
        lng: w.lng,
        category: w.category,
        country: w.country
      });
    } else {
      const toRad = Math.PI / 180;
      const toDeg = 180 / Math.PI;
      let sinSum = 0, cosSum = 0, latSum = 0;
      const catSet = /* @__PURE__ */ new Set();
      for (const w of bucket) {
        latSum += w.lat;
        sinSum += Math.sin(w.lng * toRad);
        cosSum += Math.cos(w.lng * toRad);
        catSet.add(w.category);
      }
      clusters.push({
        lat: latSum / bucket.length,
        lng: Math.atan2(sinSum, cosSum) * toDeg,
        count: bucket.length,
        categories: [...catSet]
      });
    }
  }
  return { singles, clusters };
}
async function listWebcams(_ctx, req) {
  const values = {
    zoom: req.zoom ?? 3,
    boundW: req.boundW ?? -180,
    boundS: req.boundS ?? -90,
    boundE: req.boundE ?? 180,
    boundN: req.boundN ?? 90
  };
  const violations = Object.entries(values).filter(([, value]) => !Number.isFinite(value)).map(([field]) => ({ field, description: "Must be a finite number" }));
  if (violations.length) throw new ValidationError(violations);
  const zoom = Math.max(0, Math.min(
    22,
    values.zoom < 3 ? Math.floor(values.zoom) : Math.ceil(values.zoom)
  ));
  const qW = Math.floor(Math.max(-180, Math.min(180, values.boundW)));
  const qS = Math.floor(Math.max(-90, Math.min(90, values.boundS)));
  const qE = Math.ceil(Math.max(-180, Math.min(180, values.boundE)));
  const qN = Math.ceil(Math.max(-90, Math.min(90, values.boundN)));
  const version = await readRequiredSeed("webcam:cameras:active", (value) => typeof value === "string" && value.length > 0 ? value : typeof value === "number" && Number.isFinite(value) ? String(value) : void 0);
  const cacheKey = `webcam:resp:${version}:${zoom}:${qW}:${qS}:${qE}:${qN}`;
  const cached = await getCachedJson(cacheKey);
  if (cached) return cached;
  const geoKey = `webcam:cameras:geo:${version}`;
  const metaKey = `webcam:cameras:meta:${version}`;
  try {
    const centerLat = (qN + qS) / 2;
    const heightKm = Math.abs(qN - qS) * 111.32;
    let ids;
    if (qW > qE) {
      const centerLon1 = (qW + 180) / 2;
      const centerLon2 = (-180 + qE) / 2;
      const width1 = (180 - qW) * 111.32 * Math.cos(centerLat * Math.PI / 180);
      const width2 = (qE + 180) * 111.32 * Math.cos(centerLat * Math.PI / 180);
      const [ids1, ids2] = await Promise.all([
        geoSearchByBoxStrict(geoKey, centerLon1, centerLat, width1, heightKm, MAX_RESULTS, true),
        geoSearchByBoxStrict(geoKey, centerLon2, centerLat, width2, heightKm, MAX_RESULTS, true)
      ]);
      ids = [...ids1, ...ids2];
    } else {
      const centerLon = (qW + qE) / 2;
      const widthKm = equirectangularWidthKm(qS, qN, qW, qE);
      ids = await geoSearchByBoxStrict(geoKey, centerLon, centerLat, widthKm, heightKm, MAX_RESULTS, true);
    }
    if (ids.length === 0) {
      const [seedKeys] = await runRedisPipeline([["EXISTS", geoKey, metaKey]], true);
      if (seedKeys?.error || seedKeys?.result !== 2) throw new SeedUnavailableError(geoKey);
      const empty = { webcams: [], clusters: [], totalInView: 0 };
      await setCachedJson(cacheKey, empty, RESPONSE_CACHE_TTL);
      return empty;
    }
    const metaMap = await getHashFieldsBatchStrict(metaKey, ids, true);
    const webcams = [];
    for (const id of ids) {
      const raw = metaMap.get(id);
      if (!raw) throw new SeedUnavailableError(metaKey);
      try {
        const meta = JSON.parse(raw);
        webcams.push({
          webcamId: id,
          title: meta.title || "",
          lat: meta.lat || 0,
          lng: meta.lng || 0,
          category: meta.category || "other",
          country: meta.country || ""
        });
      } catch {
        throw new SeedUnavailableError(metaKey);
      }
    }
    const cellSize = getClusterCellSize(zoom);
    const { singles, clusters } = clusterWebcams(webcams, cellSize);
    const result = {
      webcams: singles,
      clusters,
      totalInView: webcams.length
    };
    setCachedJson(cacheKey, result, RESPONSE_CACHE_TTL).catch((err) => {
      console.warn("[webcam] response cache write failed:", err);
    });
    return result;
  } catch {
    throw new SeedUnavailableError(geoKey);
  }
}
function equirectangularWidthKm(s2, n, w, e) {
  const midLat = (s2 + n) / 2 * Math.PI / 180;
  return Math.abs(e - w) * 111.32 * Math.cos(midLat);
}

// server/worldmonitor/webcam/v1/get-webcam-image.ts
init_redis();

// server/_shared/constants.ts
var CHROME_UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
var YAHOO_MIN_GAP_MS = process.env.NODE_TEST_CONTEXT ? 1 : 600;
var yahooQueue = Promise.resolve();
var FINNHUB_MIN_GAP_MS = process.env.NODE_TEST_CONTEXT ? 1 : 350;
var finnhubQueue = Promise.resolve();

// server/worldmonitor/webcam/v1/get-webcam-image.ts
var WINDY_BASE = "https://api.windy.com/webcams/api/v3/webcams";
var CACHE_TTL = 300;
var WEBCAM_ID_RE = /^[\w-]+$/;
var MAX_WEBCAM_ID_LENGTH = 64;
function normalizeWebcamId(value) {
  const webcamId = value?.trim();
  if (!webcamId || webcamId.length > MAX_WEBCAM_ID_LENGTH || !WEBCAM_ID_RE.test(webcamId)) return null;
  return webcamId;
}
async function isSeededWebcamId(webcamId) {
  if (process.env.LOCAL_API_MODE === "tauri-sidecar") return true;
  const activeVersion = await getCachedJson("webcam:cameras:active", true);
  if (activeVersion == null) return false;
  const version = String(activeVersion);
  if (!version) return false;
  const webcamMeta = await getHashFieldsBatch(`webcam:cameras:meta:${version}`, [webcamId], true);
  return webcamMeta.has(webcamId);
}
async function getWebcamImage(_ctx, req) {
  const rawWebcamId = req.webcamId ?? "";
  const webcamId = normalizeWebcamId(req.webcamId);
  const windyUrl = `https://www.windy.com/webcams/${encodeURIComponent(webcamId ?? rawWebcamId)}`;
  if (!webcamId) {
    return { thumbnailUrl: "", playerUrl: "", title: "", windyUrl, lastUpdated: "", error: "missing webcam_id" };
  }
  const apiKey = process.env.WINDY_API_KEY;
  if (!apiKey) {
    return { thumbnailUrl: "", playerUrl: "", title: "", windyUrl, lastUpdated: "", error: "unavailable" };
  }
  try {
    const { data: result } = await cachedFetchJsonWithMeta(
      `webcam:image:${webcamId}`,
      CACHE_TTL,
      async () => {
        const resp = await fetch(`${WINDY_BASE}/${encodeURIComponent(webcamId)}?include=images,player,urls`, {
          headers: { "x-windy-api-key": apiKey, "User-Agent": CHROME_UA },
          redirect: "manual",
          signal: AbortSignal.timeout(5e3)
        });
        if (!resp.ok) return null;
        const data = await resp.json();
        const wc = data.webcams?.[0] ?? data;
        if (!wc || wc.status === "inactive") return null;
        const thumbnailUrl = providerUrl(wc.images?.current?.preview) || providerUrl(wc.images?.current?.thumbnail);
        const timelapseUrl = ["day", "month", "year", "lifetime"].map((span) => providerUrl(wc.player?.[span])).find(Boolean) || "";
        const playerUrl = timelapseUrl || providerUrl(wc.player?.live);
        if (!thumbnailUrl && !playerUrl) return null;
        const capturedAt = typeof wc.lastUpdatedOn === "string" ? Date.parse(wc.lastUpdatedOn) : NaN;
        return {
          thumbnailUrl,
          playerUrl,
          title: typeof wc.title === "string" ? wc.title : "",
          windyUrl: providerUrl(wc.urls?.detail) || windyUrl,
          lastUpdated: Number.isFinite(capturedAt) ? new Date(capturedAt).toISOString() : "",
          resolvedAt: Date.now(),
          mediaType: timelapseUrl ? "timelapse" : playerUrl ? "live" : "snapshot",
          error: ""
        };
      },
      120,
      { shouldFetch: () => isSeededWebcamId(webcamId) }
    );
    return result ?? { thumbnailUrl: "", playerUrl: "", title: "", windyUrl, lastUpdated: "", error: "unavailable" };
  } catch {
    return { thumbnailUrl: "", playerUrl: "", title: "", windyUrl, lastUpdated: "", error: "unavailable" };
  }
}
function providerUrl(value) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? value : "";
  } catch {
    return "";
  }
}

// server/worldmonitor/webcam/v1/handler.ts
var webcamHandler = {
  listWebcams,
  getWebcamImage
};

// api/webcam/v1/[rpc].ts
var config = { runtime: "edge" };
var rpc_default = createDomainGateway(
  createWebcamServiceRoutes(webcamHandler, serverOptions)
);
export {
  config,
  rpc_default as default
};
