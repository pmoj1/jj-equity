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

// api/_cors.js
var APP_ORIGIN_PATTERN = /^https:\/\/(?:(?:www|app|api|tech|finance|commodity|happy|energy)\.)?worldmonitor\.app$/;
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

// server/_shared/channel-oauth-state.ts
var BIND_VALUE_RE = /^[A-Za-z0-9_-]{43}$/;
function channelOAuthCookieName(provider) {
  return `__Secure-wm_${provider}_oauth`;
}
async function sha256Hex(value) {
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
  return Array.from(digest, (b) => b.toString(16).padStart(2, "0")).join("");
}
function hashBindValue(provider, value) {
  return sha256Hex(`${provider}-oauth-bind:${value}`);
}
function parseChannelOAuthState(raw) {
  if (!raw) return null;
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object") return null;
  const { userId, bindHash, openerOrigin, cookieName } = parsed;
  if (typeof userId !== "string" || !userId) return null;
  if (typeof bindHash !== "string" || !/^[0-9a-f]{64}$/.test(bindHash)) return null;
  if (typeof openerOrigin !== "string" || !/^https?:\/\/[^/]+$/.test(openerOrigin)) return null;
  if (cookieName !== void 0 && (typeof cookieName !== "string" || !/^__Secure-wm_(slack|discord)_oauth_[a-f0-9-]{36}$/.test(cookieName))) return null;
  return { userId, bindHash, openerOrigin, ...typeof cookieName === "string" ? { cookieName } : {} };
}
function readCookie(req, name) {
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1 || part.slice(0, eq).trim() !== name) continue;
    const value = part.slice(eq + 1).trim();
    return BIND_VALUE_RE.test(value) ? value : null;
  }
  return null;
}
async function callbackMatchesBrowser(provider, req, state) {
  const name = state.cookieName ?? channelOAuthCookieName(provider);
  if (!name.startsWith(channelOAuthCookieName(provider))) return false;
  const value = readCookie(req, name);
  return channelOAuthBindingMatches(provider, value, state);
}
async function channelOAuthBindingMatches(provider, value, state) {
  if (!value || !BIND_VALUE_RE.test(value)) return false;
  const actual = await hashBindValue(provider, value);
  let diff = 0;
  for (let i = 0; i < 64; i++) diff |= actual.charCodeAt(i) ^ state.bindHash.charCodeAt(i);
  return diff === 0;
}

// api/discord/oauth/callback.ts
var config = { runtime: "edge" };
var DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID ?? "";
var DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET ?? "";
var DISCORD_REDIRECT_URI = process.env.DISCORD_REDIRECT_URI ?? "";
var UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL ?? "";
var UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
var CONVEX_SITE_URL = process.env.CONVEX_SITE_URL ?? (process.env.CONVEX_URL ?? "").replace(".convex.cloud", ".convex.site");
var CONVEX_TENANT_RELAY_SECRET = process.env.CONVEX_TENANT_RELAY_SECRET ?? "";
var NOTIFICATION_ENCRYPTION_KEY = process.env.NOTIFICATION_ENCRYPTION_KEY ?? "";
var ANY_OPENER = "*";
async function encryptWebhook(url) {
  const keyBytes = Uint8Array.from(atob(NOTIFICATION_ENCRYPTION_KEY), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(url);
  const result = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv, tagLength: 128 }, key, encoded));
  const ciphertext = result.slice(0, -16);
  const tag = result.slice(-16);
  const payload = new Uint8Array(12 + 16 + ciphertext.length);
  payload.set(iv, 0);
  payload.set(tag, 12);
  payload.set(ciphertext, 28);
  const binary = Array.from(payload, (b) => String.fromCharCode(b)).join("");
  return `v1:${btoa(binary)}`;
}
async function upstashGetDel(key) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) throw new Error("Redis not configured");
  const res = await fetch(`${UPSTASH_URL}/getdel/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "User-Agent": "worldmonitor-edge/1.0" },
    signal: AbortSignal.timeout(5e3)
  });
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`);
  const json = await res.json();
  if (!json || !Object.prototype.hasOwnProperty.call(json, "result")) {
    throw new Error("Redis returned a malformed GETDEL response");
  }
  return json.result ?? null;
}
function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
async function publishWelcome(userId) {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) return;
  const msg = JSON.stringify({ eventType: "channel_welcome", userId, channelType: "discord" });
  await fetch(`${UPSTASH_URL}/lpush/wm:events:queue/${encodeURIComponent(msg)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${UPSTASH_TOKEN}`, "User-Agent": "worldmonitor-edge/1.0" },
    signal: AbortSignal.timeout(5e3)
  }).catch(() => {
  });
}
function htmlResponse(script, body, status = 200) {
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Discord OAuth</title></head><body>
<p style="font-family:system-ui;padding:20px">${body}</p>
<script>
(function(){try{${script}}catch(e){}})();
</script>
</body></html>`,
    { status, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
function safeJsonInScript(data) {
  return JSON.stringify(data).replace(/<\//g, "<\\/");
}
function postAndClose(data, openerOrigin) {
  const msg = safeJsonInScript(data);
  return htmlResponse(
    `window.opener&&window.opener.postMessage(${msg},${safeJsonInScript(openerOrigin)});window.close();`,
    "Connected to Discord. You can close this window."
  );
}
function errorAndClose(error, status = 200) {
  const msg = safeJsonInScript({ type: "wm:discord_error", error });
  return htmlResponse(
    `window.opener&&window.opener.postMessage(${msg},'${ANY_OPENER}');window.close();`,
    `Discord connection failed: ${escapeHtml(error)}. You can close this window.`,
    status
  );
}
async function handler(req, ctx) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const errorParam = url.searchParams.get("error");
  if (errorParam) return errorAndClose(errorParam);
  if (!code || !state) return errorAndClose("missing_params");
  if (!UPSTASH_URL || !DISCORD_CLIENT_ID || !DISCORD_CLIENT_SECRET || !CONVEX_SITE_URL || !CONVEX_TENANT_RELAY_SECRET || !NOTIFICATION_ENCRYPTION_KEY) {
    return errorAndClose("misconfigured");
  }
  const stateKey = `wm:discord:oauth:${state}`;
  let rawState;
  try {
    rawState = await upstashGetDel(stateKey);
  } catch (error) {
    console.error("[discord-oauth] state store unavailable:", error instanceof Error ? error.message : error);
    await captureSilentError(error, { tags: { route: "api/discord/oauth/callback", step: "state-consume" }, fingerprint: ["api/discord/oauth/callback", "state-consume", error instanceof Error ? error.name : "Error"], ctx });
    return errorAndClose("service_unavailable", 503);
  }
  const oauthState = parseChannelOAuthState(rawState);
  if (!oauthState) return errorAndClose("invalid_state");
  if (!await callbackMatchesBrowser("discord", req, oauthState)) return errorAndClose("browser_mismatch");
  const { userId, openerOrigin } = oauthState;
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: DISCORD_CLIENT_ID,
      client_secret: DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_REDIRECT_URI
    }),
    signal: AbortSignal.timeout(1e4)
  }).catch(() => null);
  if (!tokenRes?.ok) {
    const errBody = await tokenRes?.text().catch(() => "(unreadable)");
    console.error(`[discord-oauth] token_exchange_failed status=${tokenRes?.status} body=${errBody} redirect_uri=${DISCORD_REDIRECT_URI} client_id=${DISCORD_CLIENT_ID}`);
    return errorAndClose("token_exchange_failed");
  }
  const tokenData = await tokenRes.json();
  if (!tokenData.webhook?.url) return errorAndClose("no_webhook");
  let webhookEnvelope;
  try {
    webhookEnvelope = await encryptWebhook(tokenData.webhook.url);
  } catch {
    return errorAndClose("encryption_failed");
  }
  const convexRes = await fetch(`${CONVEX_SITE_URL}/relay/notification-channels`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${CONVEX_TENANT_RELAY_SECRET}` },
    body: JSON.stringify({
      action: "set-discord-oauth",
      userId,
      webhookEnvelope,
      discordGuildId: tokenData.webhook.guild_id,
      discordChannelId: tokenData.webhook.channel_id
    }),
    signal: AbortSignal.timeout(1e4)
  }).catch(() => null);
  if (!convexRes?.ok) return errorAndClose("storage_failed");
  const stored = await convexRes.json();
  if (stored.isNew) ctx.waitUntil(publishWelcome(userId));
  return postAndClose({
    type: "wm:discord_connected",
    guildId: tokenData.webhook.guild_id ?? "",
    channelId: tokenData.webhook.channel_id ?? ""
  }, openerOrigin);
}
export {
  config,
  handler as default
};
