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

// api/version.js
var config = { runtime: "edge" };
async function handler() {
  try {
    const release = await fetchLatestRelease("WorldMonitor-Version-Check");
    if (!release) {
      return jsonResponse({ error: "upstream" }, 502);
    }
    const tag = release.tag_name ?? "";
    const version = tag.replace(/^v/, "");
    return jsonResponse({
      version,
      tag,
      url: release.html_url,
      prerelease: release.prerelease ?? false
    }, 200, {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60, stale-if-error=3600",
      "Access-Control-Allow-Origin": "*"
    });
  } catch {
    return jsonResponse({ error: "fetch_failed" }, 502);
  }
}
export {
  config,
  handler as default
};
