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
async function readRawJsonFromUpstash(key, timeoutMs = 3e3, raw = false) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("readRawJsonFromUpstash: UPSTASH_REDIS_REST_URL/TOKEN not configured");
  }
  const resp = await fetch(`${url}/get/${encodeURIComponent(raw ? key : applyRedisKeyPrefix(key))}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(timeoutMs)
  });
  if (!resp.ok) {
    throw new Error(`readRawJsonFromUpstash: Upstash GET ${key} returned HTTP ${resp.status}`);
  }
  const data = await resp.json();
  if (!data || typeof data !== "object" || !Object.prototype.hasOwnProperty.call(data, "result")) {
    throw new Error(`readRawJsonFromUpstash: Upstash GET ${key} returned a malformed response`);
  }
  if (data.result === null) return null;
  try {
    return JSON.parse(data.result);
  } catch (err) {
    throw new Error(
      `readRawJsonFromUpstash: JSON.parse failed for ${key}: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}
function getRedisCredentials() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
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
async function setCachedData(key, value, ttlSeconds, raw = false) {
  const results = await redisPipeline([
    ["SET", key, JSON.stringify(value), "EX", String(ttlSeconds)]
  ], 5e3, raw);
  return results !== null;
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

// api/miit-news.js
var config = { runtime: "edge" };
var SOURCE_URL = "https://www.miit.gov.cn/";
var CACHE_KEY = "miit:news-listing:v1";
var CACHE_TTL_SECONDS = 300;
var LAST_GOOD_KEY = "miit:news-listing:last-good:v1";
var MAX_LISTING_AGE_DAYS = 14;
var LAST_GOOD_TTL_SECONDS = MAX_LISTING_AGE_DAYS * 86400;
var XML_CONTROLS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
function chinaCalendarDaysBetween(day, nowMs) {
  const articleDay = /* @__PURE__ */ new Date(`${day}T00:00:00+08:00`);
  if (!Number.isFinite(articleDay.getTime())) return Number.POSITIVE_INFINITY;
  if (new Date(articleDay.getTime() + 8 * 36e5).toISOString().slice(0, 10) !== day) {
    return Number.POSITIVE_INFINITY;
  }
  const nowDay = new Date(nowMs + 8 * 36e5).toISOString().slice(0, 10);
  const [ay, am, ad] = day.split("-").map(Number);
  const [ny, nm, nd] = nowDay.split("-").map(Number);
  return (Date.UTC(ny, nm - 1, nd) - Date.UTC(ay, am - 1, ad)) / 864e5;
}
function decodeText(value) {
  const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt|nbsp);/gi, (entity, code) => {
    if (!code.startsWith("#")) return named[code.toLowerCase()];
    const point = code[1].toLowerCase() === "x" ? Number.parseInt(code.slice(2), 16) : Number(code.slice(1));
    return point > 0 && point <= 1114111 && !(point >= 55296 && point <= 57343) ? String.fromCodePoint(point) : entity;
  }).replace(XML_CONTROLS, "").trim();
}
function cdata(value) {
  return `<![CDATA[${value.replace(XML_CONTROLS, "").split("]]>").join("]]]]><![CDATA[>")}]]>`;
}
function listingText(value) {
  let previous;
  do {
    previous = value;
    value = value.replace(/<[^<>]*>/g, "");
  } while (value !== previous);
  return value;
}
function parseMiitNews(html, nowMs = Date.now()) {
  const items = /* @__PURE__ */ new Map();
  for (const match of html.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const row = match[1];
    const day = row.match(/<span\b[^>]*>\s*(\d{4}-\d{2}-\d{2})\s*<\/span>/i)?.[1];
    const anchor = row.match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i);
    const href = anchor?.[1].match(/\shref\s*=\s*(["'])(.*?)\1/i)?.[2];
    if (!day || !anchor || !href) continue;
    const date = /* @__PURE__ */ new Date(`${day}T00:00:00+08:00`);
    const ageDays = chinaCalendarDaysBetween(day, nowMs);
    if (!Number.isFinite(date.getTime()) || date.getTime() > nowMs || ageDays < 0 || ageDays > MAX_LISTING_AGE_DAYS) continue;
    let url;
    try {
      url = new URL(decodeText(href), SOURCE_URL);
    } catch {
      continue;
    }
    if (!["http:", "https:"].includes(url.protocol) || url.hostname !== "www.miit.gov.cn" || url.username || url.password || url.port || !/^\/(?:[\w-]+\/)+art\/\d{4}\/art_[\da-f]+\.html$/i.test(url.pathname)) continue;
    url.protocol = "https:";
    url.search = "";
    url.hash = "";
    const title = decodeText(anchor[1].match(/\stitle\s*=\s*(["'])(.*?)\1/i)?.[2] ?? listingText(anchor[2]));
    if (!title || items.has(url.href)) continue;
    items.set(url.href, { title, link: url.href, date: date.toISOString() });
  }
  return [...items.values()].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
}
function withinListingWindow(item, nowMs) {
  const dateMs = Date.parse(item?.date ?? "");
  if (!Number.isFinite(dateMs) || dateMs > nowMs) return false;
  const day = new Date(dateMs + 8 * 36e5).toISOString().slice(0, 10);
  return chinaCalendarDaysBetween(day, nowMs) <= MAX_LISTING_AGE_DAYS;
}
async function readLastGood() {
  try {
    const stored = await readRawJsonFromUpstash(LAST_GOOD_KEY);
    if (!Array.isArray(stored)) return [];
    const nowMs = Date.now();
    return stored.filter((item) => withinListingWindow(item, nowMs));
  } catch {
    return [];
  }
}
function rssResponse(items, maxAgeSeconds) {
  return new Response(renderMiitRss(items), {
    headers: {
      ...getPublicCorsHeaders(),
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": `public, max-age=${maxAgeSeconds}, s-maxage=${maxAgeSeconds}`
    }
  });
}
function renderMiitRss(items) {
  return `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel>
<title>MIIT (China)</title><link>${SOURCE_URL}</link><language>zh-CN</language>
<description>Official Ministry of Industry and Information Technology news</description>
${items.map((item) => `<item><title>${cdata(item.title)}</title><link>${item.link}</link>
<guid>${item.link}</guid><pubDate>${new Date(item.date).toUTCString()}</pubDate>
<source url="${SOURCE_URL}">MIIT (China)</source></item>`).join("\n")}
</channel></rss>`;
}
async function handler(req, ctx) {
  const cors = getCorsHeaders(req);
  if (isDisallowedOrigin(req)) return jsonResponse({ error: "Origin not allowed" }, 403, cors);
  try {
    let items = null;
    try {
      const cached = await readRawJsonFromUpstash(CACHE_KEY);
      if (Array.isArray(cached) && cached.length > 0) items = cached;
    } catch {
    }
    if (!items) {
      const response = await fetch(SOURCE_URL, {
        headers: { "User-Agent": "WorldMonitor/1.0 (+https://worldmonitor.app)", Accept: "text/html" },
        redirect: "manual",
        signal: AbortSignal.timeout(1e4)
      });
      if (!response.ok) throw new Error(`MIIT HTTP ${response.status}`);
      const html = await response.text();
      if (html.length > 1e6) throw new Error("MIIT listing exceeds size limit");
      items = parseMiitNews(html);
      if (items.length === 0) throw new Error("MIIT listing has no dated official articles");
      try {
        await Promise.all([
          setCachedData(CACHE_KEY, items, CACHE_TTL_SECONDS),
          setCachedData(LAST_GOOD_KEY, items, LAST_GOOD_TTL_SECONDS)
        ]);
      } catch {
      }
    }
    return rssResponse(items, CACHE_TTL_SECONDS);
  } catch (error) {
    const errName = error instanceof Error ? error.name : "";
    const isTransientTimeout = errName === "AbortError" || errName === "TimeoutError";
    captureSilentError(error, {
      tags: { route: "api/miit-news", step: "listing" },
      fingerprint: ["api/miit-news", "listing", error instanceof Error ? error.name : "Error"],
      ctx,
      ...isTransientTimeout ? { level: "warning" } : {}
    });
    const lastGood = await readLastGood();
    if (lastGood.length > 0) return rssResponse(lastGood, 60);
    return jsonResponse({ error: "MIIT official news unavailable" }, 502, {
      ...cors,
      "Cache-Control": "no-store"
    });
  }
}
export {
  config,
  handler as default,
  parseMiitNews,
  renderMiitRss
};
