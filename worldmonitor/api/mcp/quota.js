var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
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

// api/_api-key-rate-limit.js
function apiKeyDailyKey(userId, date) {
  if (!userId)
    return "";
  const d = date ?? /* @__PURE__ */ new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `rl:apikey:day:${userId}:${yyyy}-${mm}-${dd}`;
}

// server/_shared/api-key-rate-limit.ts
var apiKeyDailyKey2 = apiKeyDailyKey;

// server/_shared/redis.ts
var import_compare_and_delete_script = __toESM(require_compare_and_delete_script(), 1);

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

// server/_shared/pro-mcp-token.ts
function dailyCounterKey(userId, date) {
  if (!userId) return "";
  const d = date ?? /* @__PURE__ */ new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const base = `mcp:pro-usage:${userId}:${yyyy}-${mm}-${dd}`;
  return `${envPrefix()}${base}`;
}
function dailyQuotaFloorKey(userId, date) {
  if (!userId) return "";
  const d = date ?? /* @__PURE__ */ new Date();
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const base = `mcp:pro-usage-floor:${userId}:${yyyy}-${mm}-${dd}`;
  return `${envPrefix()}${base}`;
}
function envPrefix() {
  const env = process.env.VERCEL_ENV;
  if (!env || env === "production") return "";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "dev";
  return `${env}:${sha}:`;
}
var PRO_DAILY_QUOTA_LIMIT = 50;
var PRO_DAILY_QUOTA_TTL_SECONDS = 172800;

// shared/mcp-quota-reserve-script.mjs
var MCP_QUOTA_RESERVE_SCRIPT = [
  "local ttl = tonumber(ARGV[2])",
  "local weight = tonumber(ARGV[3])",
  "if weight == nil or weight < 1 then weight = 1 end",
  "local clamp_enabled = tonumber(ARGV[4]) ~= 0",
  "local n = redis.call('INCRBY', KEYS[1], weight)",
  "if ttl ~= nil and ttl > 0 then",
  "  redis.call('EXPIRE', KEYS[1], ttl)",
  "end",
  "",
  "local function read_floor()",
  "  local raw = redis.call('GET', KEYS[2])",
  "  if raw == false or raw == nil or raw == '' then return nil end",
  "  return tonumber(raw)",
  "end",
  "",
  "local function write_floor(value)",
  "  redis.call('SET', KEYS[2], value)",
  "  if ttl ~= nil and ttl > 0 then",
  "    redis.call('EXPIRE', KEYS[2], ttl)",
  "  end",
  "end",
  "",
  "local function remember_success(limit)",
  "  local seen = read_floor()",
  "  if seen == -1 then return end",
  "  if seen == nil or limit > seen then",
  "    write_floor(limit)",
  "  end",
  "end",
  "",
  "local limit_raw = ARGV[1]",
  "if limit_raw == nil or limit_raw == false or limit_raw == '' then",
  "  write_floor(-1)",
  "  return {1, n}",
  "end",
  "",
  "local limit = tonumber(limit_raw)",
  "if limit == nil or limit < 0 then",
  "  redis.call('DECRBY', KEYS[1], weight)",
  "  return {-1, 0}",
  "end",
  "",
  "if n <= limit then",
  "  remember_success(limit)",
  "  return {1, n}",
  "end",
  "",
  "n = redis.call('DECRBY', KEYS[1], weight)",
  "if clamp_enabled then",
  "  local seen = read_floor()",
  "  if seen ~= -1 then",
  "    local clamp_to = limit",
  "    if seen ~= nil and seen > clamp_to then clamp_to = seen end",
  "    if n > clamp_to then",
  "      redis.call('SET', KEYS[1], clamp_to)",
  "      if ttl ~= nil and ttl > 0 then",
  "        redis.call('EXPIRE', KEYS[1], ttl)",
  "      end",
  "      n = clamp_to",
  "    end",
  "  end",
  "end",
  "return {0, n}"
].join("\n");

// api/mcp/quota.ts
function resolveDailyLimit(planDailyLimit) {
  if (planDailyLimit === null) return null;
  if (typeof planDailyLimit === "number" && Number.isFinite(planDailyLimit) && planDailyLimit >= 0) {
    return planDailyLimit;
  }
  return PRO_DAILY_QUOTA_LIMIT;
}
var SHARED_API_BUDGET = "shared-api-budget";
function isRestEnforcementEnabled() {
  return process.env.API_RATE_LIMIT_ENFORCE === "true";
}
function resolveMcpBudget(mcpCallsPerDay, apiRequestsPerDay, restEnforced = isRestEnforcementEnabled()) {
  if (mcpCallsPerDay === SHARED_API_BUDGET) {
    return {
      allowance: "api",
      counter: restEnforced ? "api" : "mcp",
      limit: resolveDailyLimit(apiRequestsPerDay)
    };
  }
  return {
    allowance: "mcp",
    limit: resolveDailyLimit(typeof mcpCallsPerDay === "string" ? void 0 : mcpCallsPerDay)
  };
}
function isSharedRestCounter(budget) {
  return budget?.allowance === "api" && budget.counter === "api";
}
function budgetCounterKey(budget, userId, date) {
  if (!isSharedRestCounter(budget)) return dailyCounterKey(userId, date);
  const key = apiKeyDailyKey2(userId, date);
  return key ? `${envPrefix()}${key}` : key;
}
function asFiniteNumber(raw) {
  if (typeof raw !== "number" && typeof raw !== "string") return null;
  if (typeof raw === "string" && raw.trim() === "") return null;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : null;
}
function dailyAllowanceResetAt(nowMs) {
  const now = new Date(nowMs);
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
}
async function readDailyAllowance(userId, pipeline, budget, nowMs = Date.now()) {
  let result;
  try {
    result = await pipeline([["GET", budgetCounterKey(budget, userId, new Date(nowMs))]], 5e3, true);
  } catch {
    return null;
  }
  const entry = result?.[0];
  if (!Array.isArray(result) || result.length < 1 || !entry || !Object.prototype.hasOwnProperty.call(entry, "result") || result.some((item) => item?.error !== void 0 && item?.error !== null)) return null;
  const raw = entry.result;
  if (raw !== null && raw !== void 0 && typeof raw !== "number" && typeof raw !== "string") return null;
  if (typeof raw === "string" && raw.trim() === "") return null;
  const count = raw === null || raw === void 0 ? 0 : Number(raw);
  if (!Number.isSafeInteger(count) || count < 0) return null;
  const limit = resolveDailyLimit(budget?.limit);
  const used = limit === null ? count : Math.min(count, limit);
  return { used, limit, remaining: limit === null ? null : Math.max(0, limit - used), resetsAt: dailyAllowanceResetAt(nowMs) };
}
async function reserveQuota(userId, pipeline, budget, toolUnits = 1) {
  const weight = budget?.allowance === "api" ? toolUnits : 1;
  const limit = budget ? resolveDailyLimit(budget.limit) : PRO_DAILY_QUOTA_LIMIT;
  const key = budgetCounterKey(budget, userId);
  const floorKey = dailyQuotaFloorKey(userId);
  if (!key || !floorKey) return { ok: false, reason: "redis-unavailable" };
  const clampResidue = isSharedRestCounter(budget) ? 0 : 1;
  let pipeResult;
  try {
    pipeResult = await pipeline([[
      "EVAL",
      MCP_QUOTA_RESERVE_SCRIPT,
      2,
      key,
      floorKey,
      limit === null ? "" : limit,
      PRO_DAILY_QUOTA_TTL_SECONDS,
      weight,
      clampResidue
    ]]);
  } catch {
    pipeResult = null;
  }
  const entry = pipeResult?.[0];
  if (!pipeResult || !Array.isArray(pipeResult) || pipeResult.length !== 1 || !entry || entry.error !== void 0 && entry.error !== null || !Array.isArray(entry.result)) {
    return { ok: false, reason: "redis-unavailable" };
  }
  const status = asFiniteNumber(entry.result[0]);
  const newCount = asFiniteNumber(entry.result[1]);
  if (status === null || newCount === null) {
    return { ok: false, reason: "redis-unavailable" };
  }
  let rolledBack = false;
  const rollback = async () => {
    if (rolledBack) return;
    rolledBack = true;
    try {
      await pipeline([["DECRBY", key, weight]]);
    } catch {
    }
  };
  if (status === 1 && newCount >= weight) {
    return { ok: true, newCount, rollback };
  }
  if (status === 0 && limit !== null && newCount >= 0) {
    return { ok: false, reason: "cap-exceeded", floor: limit };
  }
  return { ok: false, reason: "redis-unavailable" };
}
export {
  SHARED_API_BUDGET,
  budgetCounterKey,
  dailyAllowanceResetAt,
  isRestEnforcementEnabled,
  isSharedRestCounter,
  readDailyAllowance,
  reserveQuota,
  resolveDailyLimit,
  resolveMcpBudget
};
