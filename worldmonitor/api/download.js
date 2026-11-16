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

// api/_github-release.js
var RELEASES_URL = "https://api.github.com/repos/koala73/worldmonitor/releases/latest";
var CACHE_KEY = "github:latest-release:v1";
var CACHE_TTL_SECONDS = 300;
async function fetchLatestRelease(userAgent, timeoutMs = 5e3) {
  try {
    const cached = await readRawJsonFromUpstash(CACHE_KEY);
    if (cached) return cached;
  } catch {
  }
  let res;
  try {
    res = await fetch(RELEASES_URL, {
      headers: {
        "Accept": "application/vnd.github+json",
        "User-Agent": userAgent
      },
      signal: AbortSignal.timeout(timeoutMs)
    });
  } catch {
    return null;
  }
  if (!res.ok) return null;
  const release = await res.json();
  try {
    await setCachedData(CACHE_KEY, release, CACHE_TTL_SECONDS);
  } catch {
  }
  return release;
}

// api/download.js
var config = { runtime: "edge" };
var RELEASES_PAGE = "https://github.com/koala73/worldmonitor/releases/latest";
var PLATFORM_PATTERNS = {
  "windows-exe": (name) => name.endsWith("_x64-setup.exe"),
  "windows-msi": (name) => name.endsWith("_x64_en-US.msi"),
  "macos-arm64": (name) => name.endsWith("_aarch64.dmg"),
  "macos-x64": (name) => name.endsWith("_x64.dmg") && !name.includes("setup"),
  "linux-appimage": (name) => name.endsWith("_amd64.AppImage"),
  "linux-appimage-arm64": (name) => name.endsWith("_aarch64.AppImage")
};
var SUPPORTED_VARIANTS = /* @__PURE__ */ new Set([
  "full",
  "world",
  "tech",
  "finance",
  "commodity",
  "energy",
  "happy"
]);
var DESKTOP_ASSET_IDENTIFIER = "worldmonitor";
function canonicalAssetName(name) {
  return String(name || "").toLowerCase().replace(/[^a-z0-9]+/g, "");
}
function findDesktopAsset(assets, platformMatcher) {
  return assets.find((asset) => {
    const assetName = String(asset?.name || "");
    return canonicalAssetName(assetName).includes(DESKTOP_ASSET_IDENTIFIER) && platformMatcher(assetName);
  }) ?? null;
}
async function handler(req) {
  const url = new URL(req.url);
  const platform = url.searchParams.get("platform");
  const variant = (url.searchParams.get("variant") || "").toLowerCase();
  if (!platform || !Object.hasOwn(PLATFORM_PATTERNS, platform)) {
    return Response.redirect(RELEASES_PAGE, 302);
  }
  if (variant && !SUPPORTED_VARIANTS.has(variant)) {
    return Response.redirect(RELEASES_PAGE, 302);
  }
  try {
    const release = await fetchLatestRelease("WorldMonitor-Download-Redirect");
    if (!release) {
      return Response.redirect(RELEASES_PAGE, 302);
    }
    const matcher = PLATFORM_PATTERNS[platform];
    const assets = Array.isArray(release.assets) ? release.assets : [];
    const asset = findDesktopAsset(assets, matcher);
    if (!asset) {
      return Response.redirect(RELEASES_PAGE, 302);
    }
    return new Response(null, {
      status: 302,
      headers: {
        "Location": asset.browser_download_url,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60, stale-if-error=600"
      }
    });
  } catch {
    return Response.redirect(RELEASES_PAGE, 302);
  }
}
export {
  SUPPORTED_VARIANTS,
  config,
  handler as default
};
