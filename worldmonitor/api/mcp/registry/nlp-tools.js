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
      if (e && typeof e == "object" || typeof e == "function") for (let s of _(e)) !y.call(l, s) && s !== t && g(l, s, { get: () => e[s], enumerable: !(i = k(e, s)) || i.enumerable });
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
        let [, i, s] = e.match(t), n = parseInt(i);
        switch (s) {
          case "s":
            return n * 1e3;
          case "m":
            return n * 1e3 * 60;
          case "h":
            return n * 1e3 * 60 * 60;
          case "d":
            return n * 1e3 * 60 * 60 * 24;
          default:
            throw new Error(`Invalid window unit: ${s}`);
        }
      }
      getBucket(e) {
        let t = e ?? Date.now();
        return Math.floor(t / this.bucketSize) * this.bucketSize;
      }
      async ingest(e, ...t) {
        this.validateTableName(e), await Promise.all(t.map(async (i) => {
          let s = this.getBucket(i.time), n = [this.prefix, e, s].join(":");
          await this.redis.zincrby(n, 1, JSON.stringify({ ...i, time: void 0 }));
        }));
      }
      formatBucketAggregate(e, t, i) {
        let s = {};
        return e.forEach(([n, r]) => {
          t == "success" && (n = n === 1 ? "true" : n === null ? "false" : n), s[t] = s[t] || {}, s[t][(n ?? "null").toString()] = r;
        }), { time: i, ...s };
      }
      async aggregateBucket(e, t, i) {
        this.validateTableName(e);
        let s = this.getBucket(i), n = [this.prefix, e, s].join(":"), r = await this.redis.eval(p, [n], [t]);
        return this.formatBucketAggregate(r, t, s);
      }
      async aggregateBuckets(e, t, i, s) {
        this.validateTableName(e);
        let n = this.getBucket(s), r = [];
        for (let o = 0; o < i; o += 1) r.push(this.aggregateBucket(e, t, n)), n = n - this.bucketSize;
        return Promise.all(r);
      }
      async aggregateBucketsWithPipeline(e, t, i, s, n) {
        this.validateTableName(e), n = n ?? 48;
        let r = this.getBucket(s), o = [], c = this.redis.pipeline(), u = [];
        for (let a = 1; a <= i; a += 1) {
          let d = [this.prefix, e, r].join(":");
          c.eval(p, [d], [t]), o.push(r), r = r - this.bucketSize, (a % n == 0 || a == i) && (u.push(c.exec()), c = this.redis.pipeline());
        }
        return (await Promise.all(u)).flat().map((a, d) => this.formatBucketAggregate(a, t, o[d]));
      }
      async getAllowedBlocked(e, t, i) {
        this.validateTableName(e);
        let s = [this.prefix, e].join(":"), n = this.getBucket(i), r = await this.redis.eval(h, [s], [n, this.bucketSize, t]), o = {};
        for (let c = 0; c < r.length; c += 2) {
          let u = r[c], m = u.identifier, a = +r[c + 1];
          o[m] || (o[m] = { success: 0, blocked: 0 }), o[m][u.success ? "success" : "blocked"] = a;
        }
        return o;
      }
      async getMostAllowedBlocked(e, t, i, s, n) {
        this.validateTableName(e);
        let r = [this.prefix, e].join(":"), o = this.getBucket(s), c = n ?? i * 5, [u, m, a] = await this.redis.eval(f, [r], [o, this.bucketSize, t, i, c]);
        return { allowed: this.toDicts(u), ratelimited: this.toDicts(m), denied: this.toDicts(a) };
      }
      toDicts(e) {
        let t = [];
        for (let i = 0; i < e.length; i += 1) {
          let s = +e[i][0], n = e[i][1];
          t.push({ identifier: n.identifier, count: s });
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
      constructor(config) {
        this.analytics = new import_core_analytics.Analytics({
          // @ts-expect-error we need to fix the types in core-analytics, it should only require the methods it needs, not the whole sdk
          redis: config.redis,
          window: "1h",
          prefix: config.prefix ?? "@upstash/ratelimit",
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
      constructor(cache) {
        this.cache = cache;
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
    var Ratelimit3 = class {
      limiter;
      ctx;
      prefix;
      timeout;
      primaryRedis;
      analytics;
      enableProtection;
      denyListThreshold;
      dynamicLimits;
      constructor(config) {
        this.ctx = config.ctx;
        this.limiter = config.limiter;
        this.timeout = config.timeout ?? 5e3;
        this.prefix = config.prefix ?? DEFAULT_PREFIX;
        this.dynamicLimits = config.dynamicLimits ?? false;
        this.enableProtection = config.enableProtection ?? false;
        this.denyListThreshold = config.denyListThreshold ?? 6;
        this.primaryRedis = "redis" in this.ctx ? this.ctx.redis : this.ctx.regionContexts[0].redis;
        if ("redis" in this.ctx) {
          this.ctx.dynamicLimits = this.dynamicLimits;
          this.ctx.prefix = this.prefix;
        }
        this.analytics = config.analytics ? new Analytics2({
          redis: this.primaryRedis,
          prefix: this.prefix
        }) : void 0;
        if (config.ephemeralCache instanceof Map) {
          this.ctx.cache = new Cache(config.ephemeralCache);
        } else if (config.ephemeralCache === void 0) {
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
    var MultiRegionRatelimit = class extends Ratelimit3 {
      /**
       * Create a new Ratelimit instance by providing a `@upstash/redis` instance and the algorithn of your choice.
       */
      constructor(config) {
        super({
          prefix: config.prefix,
          limiter: config.limiter,
          timeout: config.timeout,
          analytics: config.analytics,
          dynamicLimits: config.dynamicLimits,
          ctx: {
            regionContexts: config.redis.map((redis) => ({
              redis,
              prefix: config.prefix ?? DEFAULT_PREFIX
            })),
            cache: config.ephemeralCache ? new Cache(config.ephemeralCache) : void 0
          }
        });
        if (config.dynamicLimits) {
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
            const firstResponse = await Promise.any(dbs.map((s) => s.request));
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
              const individualIDs = await Promise.all(dbs.map((s) => s.request));
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
            const firstResponse = await Promise.any(dbs.map((s) => s.request));
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
              dbs.map((s) => s.request)
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
              const res = await Promise.all(dbs.map((s) => s.request));
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
            const usedTokens = await Promise.any(dbs.map((s) => s.request));
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
    var RegionRatelimit = class extends Ratelimit3 {
      /**
       * Create a new Ratelimit instance by providing a `@upstash/redis` instance and the algorithm of your choice.
       */
      constructor(config) {
        super({
          prefix: config.prefix,
          limiter: config.limiter,
          timeout: config.timeout,
          analytics: config.analytics,
          ctx: {
            redis: config.redis,
            prefix: config.prefix ?? DEFAULT_PREFIX
          },
          ephemeralCache: config.ephemeralCache,
          enableProtection: config.enableProtection,
          denyListThreshold: config.denyListThreshold,
          dynamicLimits: config.dynamicLimits
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

// node_modules/@upstash/redis/chunk-IH7W44G6.mjs
var __defProp2, __export2, error_exports, UpstashError, UrlError, UpstashJSONParseError, MAX_BUFFER_SIZE;
var init_chunk_IH7W44G6 = __esm({
  "node_modules/@upstash/redis/chunk-IH7W44G6.mjs"() {
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
      constructor(message, options) {
        super(message, options);
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
  }
});

// node_modules/@upstash/redis/nodejs.mjs
var BUILD, TextFieldBuilder, NumericFieldBuilder, BoolFieldBuilder, DateFieldBuilder, KeywordFieldBuilder, FacetFieldBuilder;
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
    if (typeof atob === "undefined") {
      global.atob = (b64) => Buffer.from(b64, "base64").toString("utf8");
    }
  }
});

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

// shared/entity-registry.js
var ENTITY_REGISTRY = [
  // ============================================================================
  // INDICES
  // ============================================================================
  {
    id: "^GSPC",
    type: "index",
    name: "S&P 500",
    aliases: ["s&p", "s&p 500", "sp500", "spx", "spy"],
    keywords: ["market", "stocks", "wall street", "equities"],
    related: ["^DJI", "^IXIC"]
  },
  {
    id: "^DJI",
    type: "index",
    name: "Dow Jones",
    aliases: ["dow", "dow jones", "djia", "dow 30"],
    keywords: ["blue chip", "industrials", "market"],
    related: ["^GSPC", "^IXIC"]
  },
  {
    id: "^IXIC",
    type: "index",
    name: "NASDAQ",
    aliases: ["nasdaq", "nasdaq composite", "qqq", "tech index"],
    keywords: ["tech stocks", "growth", "technology"],
    related: ["^GSPC", "XLK"]
  },
  // ============================================================================
  // TECH COMPANIES
  // ============================================================================
  {
    id: "AAPL",
    type: "company",
    name: "Apple Inc.",
    aliases: ["apple", "aapl", "tim cook", "iphone", "ipad", "mac"],
    keywords: ["iphone", "ios", "app store", "macbook", "vision pro", "services", "wearables"],
    sector: "Technology",
    related: ["MSFT", "GOOGL", "TSM"]
  },
  {
    id: "MSFT",
    type: "company",
    name: "Microsoft Corporation",
    aliases: ["microsoft", "msft", "satya nadella", "windows", "azure", "xbox"],
    keywords: ["azure", "cloud", "windows", "office", "copilot", "openai", "teams", "github"],
    sector: "Technology",
    related: ["AAPL", "GOOGL", "AMZN", "NVDA"]
  },
  {
    id: "NVDA",
    type: "company",
    name: "NVIDIA Corporation",
    aliases: ["nvidia", "nvda", "jensen huang", "geforce"],
    keywords: ["gpu", "ai chip", "datacenter", "cuda", "h100", "blackwell", "artificial intelligence", "gaming", "graphics"],
    sector: "Technology",
    related: ["AMD", "TSM", "AVGO", "INTC", "MSFT"]
  },
  {
    id: "GOOGL",
    type: "company",
    name: "Alphabet Inc.",
    aliases: ["google", "alphabet", "googl", "goog", "sundar pichai", "youtube"],
    keywords: ["search", "ads", "android", "chrome", "gemini", "waymo", "cloud", "ai"],
    sector: "Technology",
    related: ["META", "MSFT", "AAPL", "AMZN"]
  },
  {
    id: "AMZN",
    type: "company",
    name: "Amazon.com Inc.",
    aliases: ["amazon", "amzn", "aws", "andy jassy", "jeff bezos", "prime"],
    keywords: ["ecommerce", "cloud", "aws", "prime", "alexa", "warehouse", "logistics", "retail"],
    sector: "Technology",
    related: ["MSFT", "GOOGL", "WMT", "COST"]
  },
  {
    id: "META",
    type: "company",
    name: "Meta Platforms Inc.",
    aliases: ["meta", "facebook", "fb", "mark zuckerberg", "zuckerberg", "instagram", "whatsapp"],
    keywords: ["social media", "metaverse", "vr", "reels", "advertising", "llama", "ai"],
    sector: "Technology",
    related: ["GOOGL", "SNAP", "PINS"]
  },
  {
    id: "TSM",
    type: "company",
    name: "Taiwan Semiconductor",
    aliases: ["tsmc", "tsm", "taiwan semi", "taiwan semiconductor"],
    keywords: ["chip", "foundry", "semiconductor", "fab", "wafer", "node", "nanometer", "taiwan"],
    sector: "Technology",
    related: ["NVDA", "AMD", "AAPL", "AVGO", "INTC"]
  },
  {
    id: "AVGO",
    type: "company",
    name: "Broadcom Inc.",
    aliases: ["broadcom", "avgo", "avago", "hock tan"],
    keywords: ["chip", "semiconductor", "wireless", "5g", "networking", "infrastructure", "vmware", "enterprise"],
    sector: "Technology",
    related: ["NVDA", "QCOM", "TSM", "INTC"]
  },
  {
    id: "ORCL",
    type: "company",
    name: "Oracle Corporation",
    aliases: ["oracle", "orcl", "larry ellison", "ellison"],
    keywords: ["database", "cloud", "enterprise", "java", "erp", "saas"],
    sector: "Technology",
    related: ["MSFT", "SAP", "CRM"]
  },
  {
    id: "NFLX",
    type: "company",
    name: "Netflix Inc.",
    aliases: ["netflix", "nflx"],
    keywords: ["streaming", "entertainment", "movies", "series", "subscription", "content"],
    sector: "Technology",
    related: ["DIS", "WBD", "PARA"]
  },
  // ============================================================================
  // DEFENSE & AEROSPACE
  // ============================================================================
  {
    id: "LMT",
    type: "company",
    name: "Lockheed Martin",
    aliases: ["lockheed", "lockheed martin", "lmt", "skunk works"],
    keywords: ["f-35", "defense", "missile", "aerospace", "himars", "javeline"],
    sector: "Defense",
    related: ["RTX", "NOC", "GD", "BA"]
  },
  {
    id: "RTX",
    type: "company",
    name: "RTX Corp",
    aliases: ["raytheon", "rtx", "pratt & whitney", "collins aerospace"],
    keywords: ["missile", "patriot", "defense", "radar", "engine"],
    sector: "Defense",
    related: ["LMT", "NOC", "GD"]
  },
  {
    id: "NOC",
    type: "company",
    name: "Northrop Grumman",
    aliases: ["northrop", "northrop grumman", "noc"],
    keywords: ["b-21", "bomber", "space", "defense", "drone"],
    sector: "Defense",
    related: ["LMT", "RTX", "L3H"]
  },
  {
    id: "BA",
    type: "company",
    name: "Boeing",
    aliases: ["boeing", "ba"],
    keywords: ["airplane", "737 max", "defense", "space", "starliner"],
    sector: "Defense",
    related: ["AIR.PA", "LMT"]
  },
  {
    id: "GD",
    type: "company",
    name: "General Dynamics",
    aliases: ["general dynamics", "gd"],
    keywords: ["submarine", "tank", "abrams", "gulfstream", "defense"],
    sector: "Defense",
    related: ["LMT", "HII"]
  },
  {
    id: "RHM.DE",
    type: "company",
    name: "Rheinmetall AG",
    aliases: ["rheinmetall", "rhm"],
    keywords: ["tank", "leopard", "ammunition", "defense", "germany"],
    sector: "Defense",
    related: ["KMW", "BAE.L"]
  },
  {
    id: "AIR.PA",
    type: "company",
    name: "Airbus SE",
    aliases: ["airbus", "eads"],
    keywords: ["airplane", "defense", "helicopter", "space", "europe"],
    sector: "Defense",
    related: ["BA", "SAF.PA"]
  },
  // ============================================================================
  // SEMICONDUCTORS & CRITICAL TECH (GLOBAL)
  // ============================================================================
  {
    id: "ASML",
    type: "company",
    name: "ASML Holding",
    aliases: ["asml"],
    keywords: ["lithography", "euv", "duv", "chip equipment", "semiconductor"],
    sector: "Technology",
    related: ["TSM", "INTC", "SAMSUNG"]
  },
  {
    id: "005930.KS",
    type: "company",
    name: "Samsung Electronics",
    aliases: ["samsung", "samsung electronics"],
    keywords: ["memory", "chip", "phone", "display", "foundry"],
    sector: "Technology",
    related: ["SK hynix", "AAPL", "TSM"]
  },
  // ============================================================================
  // CRITICAL MINERALS
  // ============================================================================
  {
    id: "ALB",
    type: "company",
    name: "Albemarle",
    aliases: ["albemarle", "alb"],
    keywords: ["lithium", "battery", "ev", "mining"],
    sector: "Materials",
    related: ["SQM", "TSLA"]
  },
  {
    id: "SQM",
    type: "company",
    name: "SQM",
    aliases: ["sqm", "sociedad quimica"],
    keywords: ["lithium", "chile", "mining", "battery"],
    sector: "Materials",
    related: ["ALB"]
  },
  {
    id: "MP",
    type: "company",
    name: "MP Materials",
    aliases: ["mp materials", "mountain pass"],
    keywords: ["rare earth", "neodymium", "magnet", "mining", "china alternative"],
    sector: "Materials",
    related: ["ARE"]
  },
  {
    id: "FCX",
    type: "company",
    name: "Freeport-McMoRan",
    aliases: ["freeport", "fcx"],
    keywords: ["copper", "gold", "mining", "indonesia", "grasberg"],
    sector: "Materials",
    related: ["SCCO", "RIO"]
  },
  // ============================================================================
  // FINANCIAL SERVICES
  // ============================================================================
  {
    id: "BRK-B",
    type: "company",
    name: "Berkshire Hathaway",
    aliases: ["berkshire", "berkshire hathaway", "brk", "warren buffett", "buffett", "charlie munger"],
    keywords: ["insurance", "investing", "conglomerate", "value"],
    sector: "Finance",
    related: ["JPM", "BAC", "GS"]
  },
  {
    id: "JPM",
    type: "company",
    name: "JPMorgan Chase",
    aliases: ["jpmorgan", "jp morgan", "jpm", "chase", "jamie dimon", "dimon"],
    keywords: ["bank", "banking", "investment bank", "credit", "loans", "interest rate"],
    sector: "Finance",
    related: ["BAC", "GS", "MS", "C"]
  },
  {
    id: "V",
    type: "company",
    name: "Visa Inc.",
    aliases: ["visa"],
    keywords: ["payments", "credit card", "debit", "transaction", "fintech"],
    sector: "Finance",
    related: ["MA", "AXP", "PYPL"]
  },
  {
    id: "MA",
    type: "company",
    name: "Mastercard Inc.",
    aliases: ["mastercard", "master card"],
    keywords: ["payments", "credit card", "debit", "transaction", "fintech"],
    sector: "Finance",
    related: ["V", "AXP", "PYPL"]
  },
  {
    id: "BAC",
    type: "company",
    name: "Bank of America",
    aliases: ["bank of america", "bofa", "bac", "boa"],
    keywords: ["bank", "banking", "mortgage", "loans", "credit", "interest rate"],
    sector: "Finance",
    related: ["JPM", "WFC", "C"]
  },
  // ============================================================================
  // HEALTHCARE
  // ============================================================================
  {
    id: "LLY",
    type: "company",
    name: "Eli Lilly",
    aliases: ["eli lilly", "lilly", "lly"],
    keywords: ["pharma", "drug", "ozempic", "diabetes", "obesity", "weight loss", "mounjaro", "zepbound"],
    sector: "Healthcare",
    related: ["NVO", "PFE", "MRK", "JNJ"]
  },
  {
    id: "UNH",
    type: "company",
    name: "UnitedHealth Group",
    aliases: ["unitedhealth", "united health", "unh", "optum"],
    keywords: ["insurance", "healthcare", "managed care", "medicare", "medicaid"],
    sector: "Healthcare",
    related: ["CVS", "CI", "HUM"]
  },
  {
    id: "NVO",
    type: "company",
    name: "Novo Nordisk",
    aliases: ["novo nordisk", "novo", "nvo"],
    keywords: ["pharma", "drug", "ozempic", "wegovy", "diabetes", "obesity", "glp-1", "weight loss"],
    sector: "Healthcare",
    related: ["LLY", "PFE", "MRK"]
  },
  {
    id: "JNJ",
    type: "company",
    name: "Johnson & Johnson",
    aliases: ["johnson johnson", "j&j", "jnj", "johnson and johnson"],
    keywords: ["pharma", "medical devices", "consumer health", "vaccine"],
    sector: "Healthcare",
    related: ["PFE", "MRK", "ABT"]
  },
  // ============================================================================
  // ENERGY
  // ============================================================================
  {
    id: "XOM",
    type: "company",
    name: "Exxon Mobil",
    aliases: ["exxon", "exxonmobil", "exxon mobil", "xom", "mobil"],
    keywords: ["oil", "gas", "drilling", "refinery", "petroleum", "energy", "fossil fuel"],
    sector: "Energy",
    related: ["CVX", "COP", "CL=F"]
  },
  // ============================================================================
  // CONSUMER / RETAIL
  // ============================================================================
  {
    id: "TSLA",
    type: "company",
    name: "Tesla Inc.",
    aliases: ["tesla", "tsla", "elon musk", "musk"],
    keywords: ["ev", "electric vehicle", "battery", "autopilot", "fsd", "robotaxi", "energy storage", "solar"],
    sector: "Consumer",
    related: ["RIVN", "LCID", "F", "GM"]
  },
  {
    id: "WMT",
    type: "company",
    name: "Walmart Inc.",
    aliases: ["walmart", "wmt", "wal-mart"],
    keywords: ["retail", "grocery", "ecommerce", "stores", "consumer", "discount"],
    sector: "Consumer",
    related: ["COST", "TGT", "AMZN"]
  },
  {
    id: "COST",
    type: "company",
    name: "Costco Wholesale",
    aliases: ["costco", "cost"],
    keywords: ["retail", "wholesale", "membership", "grocery", "warehouse"],
    sector: "Consumer",
    related: ["WMT", "TGT", "BJ"]
  },
  {
    id: "HD",
    type: "company",
    name: "Home Depot",
    aliases: ["home depot", "hd", "homedepot"],
    keywords: ["retail", "home improvement", "construction", "housing", "diy"],
    sector: "Consumer",
    related: ["LOW", "WMT"]
  },
  {
    id: "PG",
    type: "company",
    name: "Procter & Gamble",
    aliases: ["procter gamble", "p&g", "pg", "procter & gamble", "procter and gamble"],
    keywords: ["consumer goods", "household", "personal care", "detergent", "beauty"],
    sector: "Consumer",
    related: ["KO", "PEP", "CL", "UL"]
  },
  // ============================================================================
  // SECTORS (ETFs)
  // ============================================================================
  {
    id: "XLK",
    type: "sector",
    name: "Technology Select Sector",
    aliases: ["tech sector", "technology sector", "xlk"],
    keywords: ["tech", "software", "hardware", "it"],
    related: ["AAPL", "MSFT", "NVDA"]
  },
  {
    id: "XLF",
    type: "sector",
    name: "Financial Select Sector",
    aliases: ["finance sector", "financial sector", "xlf", "banks"],
    keywords: ["bank", "insurance", "financial"],
    related: ["JPM", "BAC", "V"]
  },
  {
    id: "XLE",
    type: "sector",
    name: "Energy Select Sector",
    aliases: ["energy sector", "xle", "oil stocks"],
    keywords: ["oil", "gas", "energy", "drilling"],
    related: ["XOM", "CVX", "CL=F"]
  },
  {
    id: "XLV",
    type: "sector",
    name: "Health Care Select Sector",
    aliases: ["healthcare sector", "health sector", "xlv", "pharma stocks"],
    keywords: ["pharma", "biotech", "healthcare", "medical"],
    related: ["LLY", "UNH", "JNJ"]
  },
  {
    id: "SMH",
    type: "sector",
    name: "Semiconductor ETF",
    aliases: ["semis", "semiconductor sector", "smh", "chip stocks"],
    keywords: ["chip", "semiconductor", "foundry", "fab"],
    related: ["NVDA", "TSM", "AVGO", "AMD"]
  },
  // ============================================================================
  // COMMODITIES
  // ============================================================================
  {
    id: "^VIX",
    type: "commodity",
    name: "VIX Volatility Index",
    aliases: ["vix", "fear index", "volatility"],
    keywords: ["volatility", "fear", "uncertainty", "hedging", "options"],
    related: ["^GSPC"]
  },
  {
    id: "GC=F",
    type: "commodity",
    name: "Gold Futures",
    aliases: ["gold", "xau", "bullion"],
    keywords: ["precious metal", "safe haven", "inflation hedge", "bullion", "jewelry"],
    related: ["SI=F", "GLD"]
  },
  {
    id: "CL=F",
    type: "commodity",
    name: "Crude Oil WTI",
    aliases: ["oil", "crude", "wti", "crude oil", "petroleum", "brent"],
    keywords: ["opec", "drilling", "refinery", "barrel", "pipeline", "energy", "gasoline", "fuel"],
    related: ["NG=F", "XOM", "CVX", "XLE"]
  },
  {
    id: "NG=F",
    type: "commodity",
    name: "Natural Gas Futures",
    aliases: ["natural gas", "natgas", "gas"],
    keywords: ["lng", "pipeline", "heating", "energy", "utility"],
    related: ["CL=F", "XLE"]
  },
  {
    id: "SI=F",
    type: "commodity",
    name: "Silver Futures",
    aliases: ["silver", "xag"],
    keywords: ["precious metal", "industrial metal", "solar", "electronics"],
    related: ["GC=F", "HG=F"]
  },
  {
    id: "HG=F",
    type: "commodity",
    name: "Copper Futures",
    aliases: ["copper"],
    keywords: ["industrial metal", "construction", "wiring", "ev", "infrastructure"],
    related: ["SI=F", "GC=F"]
  },
  // ============================================================================
  // CRYPTO (IDs match CRYPTO_IDS in markets.ts)
  // ============================================================================
  {
    id: "bitcoin",
    type: "crypto",
    name: "Bitcoin",
    aliases: ["bitcoin", "btc", "satoshi"],
    keywords: ["cryptocurrency", "blockchain", "digital currency", "halving", "btc mining"],
    related: ["ethereum", "solana"]
  },
  {
    id: "ethereum",
    type: "crypto",
    name: "Ethereum",
    aliases: ["ethereum", "eth", "ether", "vitalik"],
    keywords: ["smart contract", "defi", "nft", "blockchain", "eth gas"],
    related: ["bitcoin", "solana"]
  },
  {
    id: "solana",
    type: "crypto",
    name: "Solana",
    aliases: ["solana", "sol token"],
    keywords: ["blockchain", "defi", "nft", "solana network"],
    related: ["bitcoin", "ethereum"]
  },
  // ============================================================================
  // KEY COUNTRIES (for geopolitical correlation)
  // ============================================================================
  {
    id: "CN",
    type: "country",
    name: "China",
    aliases: ["china", "chinese", "beijing", "prc", "xi jinping"],
    keywords: ["trade war", "tariff", "ccp", "pla", "taiwan strait", "south china sea", "yuan", "rmb"],
    related: ["TW", "TSM", "BABA"]
  },
  {
    id: "TW",
    type: "country",
    name: "Taiwan",
    aliases: ["taiwan", "taiwanese", "taipei", "roc"],
    keywords: ["strait", "semiconductor", "chip", "invasion", "blockade"],
    related: ["CN", "TSM", "NVDA"]
  },
  {
    id: "RU",
    type: "country",
    name: "Russia",
    aliases: ["russia", "russian", "moscow", "kremlin", "putin", "vladimir putin"],
    keywords: ["sanctions", "ukraine", "war", "gas", "oil", "nato", "nuclear"],
    related: ["UA", "CL=F", "NG=F"]
  },
  {
    id: "UA",
    type: "country",
    name: "Ukraine",
    aliases: ["ukraine", "ukrainian", "kyiv", "kiev", "zelenskyy", "zelensky"],
    keywords: ["war", "invasion", "grain", "nato", "aid", "defense"],
    related: ["RU", "CL=F", "GC=F"]
  },
  {
    id: "IR",
    type: "country",
    name: "Iran",
    aliases: ["iran", "iranian", "tehran", "khamenei", "irgc"],
    keywords: ["sanctions", "nuclear", "oil", "strait of hormuz", "proxy", "hezbollah", "houthi"],
    related: ["IL", "CL=F", "SA"]
  },
  {
    id: "IL",
    type: "country",
    name: "Israel",
    aliases: ["israel", "israeli", "tel aviv", "jerusalem", "netanyahu", "idf"],
    keywords: ["gaza", "hamas", "hezbollah", "iran", "defense", "war", "middle east"],
    related: ["IR", "CL=F"]
  },
  {
    id: "SA",
    type: "country",
    name: "Saudi Arabia",
    aliases: ["saudi", "saudi arabia", "riyadh", "mbs", "aramco"],
    keywords: ["opec", "oil", "production", "cut", "crude", "energy"],
    related: ["CL=F", "IR", "XOM"]
  },
  {
    id: "AE",
    type: "country",
    name: "UAE",
    aliases: ["uae", "united arab emirates", "emirates", "abu dhabi", "dubai", "mbz"],
    keywords: ["oil", "trade", "g42", "ai", "logistics", "dp world"],
    related: ["SA", "CL=F", "MSFT"]
  },
  {
    id: "QA",
    type: "country",
    name: "Qatar",
    aliases: ["qatar", "doha", "al thani"],
    keywords: ["lng", "gas", "mediator", "hamas", "al udeid", "energy"],
    related: ["NG=F", "XOM", "US"]
  },
  {
    id: "TR",
    type: "country",
    name: "Turkey",
    aliases: ["turkey", "turkiye", "erdogan", "ankara"],
    keywords: ["nato", "bosphorus", "drone", "bayraktar", "kurds", "lira"],
    related: ["RU", "UA", "RHM.DE"]
  },
  {
    id: "EG",
    type: "country",
    name: "Egypt",
    aliases: ["egypt", "cairo", "sisi"],
    keywords: ["suez canal", "gaza", "rafah", "imf", "debt", "tourism"],
    related: ["IL", "SA", "AE"]
  }
];
function getEntityById(id) {
  return ENTITY_REGISTRY.find((e) => e.id === id);
}

// shared/text-analysis-core.js
var SIMILARITY_THRESHOLD = 0.5;
var STOP_WORDS = /* @__PURE__ */ new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "as",
  "is",
  "was",
  "are",
  "were",
  "been",
  "be",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "can",
  "need",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "i",
  "you",
  "he",
  "she",
  "we",
  "they",
  "what",
  "which",
  "who",
  "whom",
  "how",
  "when",
  "where",
  "why",
  "all",
  "each",
  "every",
  "both",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "not",
  "only",
  "same",
  "so",
  "than",
  "too",
  "very",
  "just",
  "also",
  "now",
  "new",
  "says",
  "said",
  "after"
]);
var SUPPRESSED_TRENDING_TERMS = /* @__PURE__ */ new Set([
  // Meta / media terms
  "ai",
  "app",
  "api",
  "new",
  "top",
  "big",
  "ceo",
  "cto",
  "update",
  "report",
  "latest",
  "breaking",
  "analysis",
  "reuters",
  "exclusive",
  "opinion",
  "editorial",
  "watch",
  "live",
  "video",
  "photo",
  "photos",
  "read",
  "full",
  "source",
  "sources",
  "according",
  "ahead",
  "english",
  "times",
  "post",
  "news",
  "press",
  "media",
  "journal",
  "morning",
  "evening",
  "daily",
  "weekly",
  "monthly",
  "newsletter",
  "subscribe",
  "podcast",
  "interview",
  // Common news verbs (not meaningful standalone)
  "says",
  "said",
  "tells",
  "told",
  "calls",
  "called",
  "makes",
  "made",
  "takes",
  "took",
  "gets",
  "gives",
  "gave",
  "goes",
  "went",
  "comes",
  "came",
  "puts",
  "sets",
  "set",
  "shows",
  "shown",
  "finds",
  "found",
  "keeps",
  "kept",
  "holds",
  "held",
  "runs",
  "turns",
  "turned",
  "leads",
  "led",
  "brings",
  "brought",
  "starts",
  "started",
  "moves",
  "moved",
  "plans",
  "planned",
  "wants",
  "wanted",
  "needs",
  "needed",
  "looks",
  "looked",
  "works",
  "worked",
  "tries",
  "tried",
  "asks",
  "asked",
  "uses",
  "used",
  "expects",
  "expected",
  "reports",
  "reported",
  "claims",
  "claimed",
  "warns",
  "warned",
  "reveals",
  "revealed",
  "announces",
  "announced",
  "confirms",
  "confirmed",
  "denies",
  "denied",
  "launches",
  "launched",
  "signs",
  "signed",
  "faces",
  "faced",
  "seeks",
  "sought",
  "hits",
  "hit",
  "dies",
  "died",
  "killed",
  "kills",
  "rises",
  "rose",
  "falls",
  "fell",
  "wins",
  "won",
  "lost",
  "ends",
  "ended",
  "begins",
  "began",
  "opens",
  "opened",
  "closes",
  "closed",
  "raises",
  "raised",
  "cuts",
  "cut",
  "adds",
  "added",
  "drops",
  "dropped",
  "pushes",
  "pushed",
  "pulls",
  "pulled",
  "backs",
  "backed",
  "blocks",
  "blocked",
  "passes",
  "passed",
  "votes",
  "voted",
  "joins",
  "joined",
  "leaves",
  "left",
  "returns",
  "returned",
  "sends",
  "sent",
  "urges",
  "urged",
  "vows",
  "vowed",
  "pledges",
  "pledged",
  "rejects",
  "rejected",
  "approves",
  "approved",
  // Common news adjectives / adverbs / time words
  "first",
  "last",
  "next",
  "major",
  "former",
  "still",
  "despite",
  "amid",
  "over",
  "under",
  "back",
  "year",
  "years",
  "day",
  "days",
  "week",
  "weeks",
  "month",
  "months",
  "time",
  "long",
  "high",
  "low",
  "part",
  "early",
  "late",
  "key",
  "two",
  "three",
  "four",
  "five",
  "million",
  "billion",
  "percent",
  "nearly",
  "almost",
  "already",
  "just",
  "even",
  "since",
  "while",
  "during",
  "before",
  "between",
  "again",
  "against",
  "into",
  "through",
  "around",
  "about",
  "much",
  "many",
  "several",
  "second",
  "third",
  "possible",
  "likely",
  "least",
  "best",
  "worst",
  "largest",
  "biggest",
  "smallest",
  "highest",
  "lowest",
  "record",
  "global",
  "local",
  // Generic news nouns (too vague as standalone trends)
  "state",
  "states",
  "department",
  "officials",
  "official",
  "country",
  "countries",
  "people",
  "group",
  "groups",
  "plan",
  "deal",
  "talks",
  "move",
  "order",
  "case",
  "house",
  "court",
  "secretary",
  "board",
  "control",
  "bank",
  "power",
  "leader",
  "leaders",
  "government",
  "minister",
  "president",
  "agency",
  "market",
  "markets",
  "company",
  "companies",
  "world",
  "white",
  "head",
  "side",
  "point",
  "end",
  "line",
  "area",
  "number",
  "issue",
  "issues",
  "policy",
  "security",
  "force",
  "forces",
  "system",
  "service",
  "services",
  "program",
  "project",
  "effort",
  "action",
  "support",
  "level",
  "rate",
  "rates",
  "price",
  "prices",
  "trade",
  "growth",
  "change",
  "changes",
  "crisis",
  "risk",
  "impact",
  "future",
  "history",
  "data",
  "team",
  "member",
  "members",
  "office",
  "sector",
  "region",
  "regions",
  "center",
  "role",
  "south",
  "north",
  "east",
  "west",
  "eastern",
  "western",
  "southern",
  "northern",
  "central",
  "middle",
  "united",
  "national",
  "international",
  "federal",
  // Base verb forms (fallback when NER model unavailable)
  "say",
  "get",
  "give",
  "go",
  "come",
  "put",
  "take",
  "make",
  "know",
  "think",
  "see",
  "want",
  "look",
  "find",
  "tell",
  "ask",
  "use",
  "try",
  "leave",
  "call",
  "keep",
  "let",
  "begin",
  "show",
  "hear",
  "play",
  "run",
  "move",
  "help",
  "turn",
  "start",
  "hold",
  "bring",
  "write",
  "provide",
  "sit",
  "stand",
  "lose",
  "pay",
  "meet",
  "include",
  "continue",
  "learn",
  "lead",
  "believe",
  "feel",
  "follow",
  "stop",
  "speak",
  "allow",
  "add",
  "grow",
  "open",
  "walk",
  "win",
  "offer",
  "appear",
  "buy",
  "wait",
  "serve",
  "die",
  "send",
  "build",
  "stay",
  "fall",
  "reach",
  "remain",
  "suggest",
  "raise",
  "sell",
  "require",
  "decide",
  "develop",
  "break",
  "happen",
  "create",
  "live",
  // Numbers and misc
  "000",
  "100",
  "200",
  "500",
  "per",
  "than",
  // Finance / trading generic terms
  "trading",
  "stock",
  "earnings",
  "finance",
  "defi",
  "ipo",
  "tradingview",
  "currency",
  "dollar",
  "usd",
  "investing",
  "equity",
  "valuation",
  "ecb",
  "regulation",
  "outlook",
  "forecast",
  "financial",
  // Web / tech generic terms
  "com",
  "platform",
  "block",
  // Generic news nouns (additional)
  "focus",
  "today",
  "chief",
  "basel",
  // Generic adjectives / adverbs (additional)
  "ongoing",
  "higher",
  "poised",
  "track",
  // URL / source fragments
  "wall",
  "street",
  "financialcontent",
  // Media / URL fragments
  "ray",
  "msn",
  "aol",
  // Date fragments
  "2025",
  "2026",
  "2027",
  // Month names
  "january",
  "february",
  "march",
  "april",
  "may",
  "june",
  "july",
  "august",
  "september",
  "october",
  "november",
  "december",
  // Company name fragments (too generic standalone)
  "goldman",
  "sachs",
  "off",
  // Basic English stopwords (pronouns, prepositions, adverbs)
  "here",
  "there",
  "where",
  "when",
  "what",
  "which",
  "who",
  "whom",
  "this",
  "that",
  "these",
  "those",
  "been",
  "being",
  "have",
  "has",
  "had",
  "having",
  "does",
  "done",
  "doing",
  "would",
  "could",
  "should",
  "will",
  "shall",
  "might",
  "must",
  "also",
  "more",
  "most",
  "some",
  "other",
  "only",
  "very",
  "after",
  "with",
  "from",
  "they",
  "them",
  "their",
  "then",
  "now",
  "how",
  "all",
  "each",
  "every",
  "both",
  "few",
  "own",
  "same",
  "such",
  "too",
  "any",
  "well"
]);
function tokenize(text) {
  const words2 = text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP_WORDS.has(w));
  return new Set(words2);
}
var UNSPACED_SCRIPT = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Thai}\p{Script=Lao}\p{Script=Khmer}\p{Script=Myanmar}]/u;
var HANGUL = new RegExp("\\p{Script=Hangul}", "u");
function tokenizeAnyScript(text) {
  const tokens = /* @__PURE__ */ new Set();
  for (const run of text.normalize("NFKC").toLowerCase().split(/[^\p{L}\p{N}\p{M}]+/u)) {
    if (!run) continue;
    const chars = [...run];
    if (UNSPACED_SCRIPT.test(run)) {
      if (chars.length === 1) tokens.add(run);
      for (let i = 0; i + 1 < chars.length; i++) tokens.add(chars[i] + chars[i + 1]);
    } else if (chars.length > (HANGUL.test(run) ? 1 : 2) && !STOP_WORDS.has(run)) {
      tokens.add(run);
    }
  }
  return tokens;
}
function jaccardSimilarity(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let intersection = 0;
  for (const x of small) if (large.has(x)) intersection++;
  return intersection / (a.size + b.size - intersection);
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// shared/entity-extraction-core.js
function buildEntityIndex(entities) {
  const byId = /* @__PURE__ */ new Map();
  const byAlias = /* @__PURE__ */ new Map();
  const byKeyword = /* @__PURE__ */ new Map();
  const bySector = /* @__PURE__ */ new Map();
  const byType = /* @__PURE__ */ new Map();
  for (const entity of entities) {
    byId.set(entity.id, entity);
    for (const alias of entity.aliases) {
      byAlias.set(alias.toLowerCase(), entity.id);
    }
    byAlias.set(entity.id.toLowerCase(), entity.id);
    byAlias.set(entity.name.toLowerCase(), entity.id);
    for (const keyword of entity.keywords) {
      const kw = keyword.toLowerCase();
      if (!byKeyword.has(kw)) byKeyword.set(kw, /* @__PURE__ */ new Set());
      byKeyword.get(kw).add(entity.id);
    }
    if (entity.sector) {
      const sector = entity.sector.toLowerCase();
      if (!bySector.has(sector)) bySector.set(sector, /* @__PURE__ */ new Set());
      bySector.get(sector).add(entity.id);
    }
    if (!byType.has(entity.type)) byType.set(entity.type, /* @__PURE__ */ new Set());
    byType.get(entity.type).add(entity.id);
  }
  const aliasMatchers = [];
  for (const [alias, entityId] of byAlias) {
    if (alias.length < 3) continue;
    aliasMatchers.push({
      alias,
      entityId,
      regex: new RegExp(`\\b${escapeRegex(alias)}\\b`, "gi")
    });
  }
  return { byId, byAlias, byKeyword, bySector, byType, aliasMatchers };
}
var cachedIndex = null;
function getEntityIndex() {
  if (!cachedIndex) {
    cachedIndex = buildEntityIndex(ENTITY_REGISTRY);
  }
  return cachedIndex;
}
function findEntitiesInText(text, index = getEntityIndex()) {
  const matches = [];
  const seen = /* @__PURE__ */ new Set();
  const textLower = text.toLowerCase();
  for (const { alias, entityId, regex } of index.aliasMatchers) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (!seen.has(entityId)) {
        matches.push({
          entityId,
          matchedText: match[0],
          matchType: "alias",
          confidence: alias.length > 4 ? 0.95 : 0.85,
          position: match.index
        });
        seen.add(entityId);
        break;
      }
    }
  }
  for (const [keyword, entityIds] of index.byKeyword) {
    if (keyword.length < 3) continue;
    if (!textLower.includes(keyword)) continue;
    for (const entityId of entityIds) {
      if (seen.has(entityId)) continue;
      const pos = textLower.indexOf(keyword);
      matches.push({
        entityId,
        matchedText: keyword,
        matchType: "keyword",
        confidence: 0.7,
        position: pos
      });
      seen.add(entityId);
    }
  }
  return matches.sort((a, b) => b.confidence - a.confidence || a.position - b.position);
}
function getEntityDisplayName(entityId, index = getEntityIndex()) {
  const entity = index.byId.get(entityId);
  return entity?.name ?? entityId;
}
function extractEntitiesFromTitle(title, index = getEntityIndex()) {
  const matches = findEntitiesInText(title, index);
  return matches.map((match) => ({
    entityId: match.entityId,
    name: getEntityDisplayName(match.entityId, index),
    matchedText: match.matchedText,
    matchType: match.matchType,
    confidence: match.confidence
  }));
}

// shared/publisher-families.js
var PUBLISHER_FAMILY_DATA = {
  "miit": { publisher: "MIIT (China)", labels: [] },
  "a16z": { publisher: "Andreessen Horowitz", labels: ["a16z Blog", "a16z Insights", "a16z Podcast"] },
  "abc-news": { publisher: "ABC News", labels: [] },
  "acquired": { publisher: "Acquired", labels: ["Acquired Episodes", "Acquired Podcast"] },
  "ap-news": { publisher: "Associated Press", labels: ["AP Mexico", "AP News"] },
  "ars-technica": { publisher: "Ars Technica", labels: [] },
  "arxiv": { publisher: "arXiv", labels: ["ArXiv AI", "ArXiv ML"] },
  "asharq": { publisher: "Asharq News", labels: ["Asharq Business", "Asharq News"] },
  "axios": { publisher: "Axios", labels: [] },
  "bbc": {
    publisher: "BBC",
    labels: [
      "BBC Africa",
      "BBC Afrique",
      "BBC Asia",
      "BBC Hindi",
      "BBC Latin America",
      "BBC Middle East",
      "BBC Mundo",
      "BBC Persian",
      "BBC Russian",
      "BBC Northern Ireland",
      "BBC Science",
      "BBC Turkce",
      "BBC UK",
      "BBC World"
    ]
  },
  "bloomberg": {
    publisher: "Bloomberg",
    labels: [
      "Bloomberg",
      "Bloomberg Commodities",
      "Bloomberg Crypto",
      "Bloomberg Energy",
      "Bloomberg Markets"
    ]
  },
  "brookings": { publisher: "Brookings Institution", labels: ["Brookings", "Brookings Tech"] },
  "business-wire": { publisher: "Business Wire", labels: [] },
  "cb-insights": { publisher: "CB Insights", labels: ["CB Insights", "CB Insights Unicorn"] },
  "chatham-house": { publisher: "Chatham House", labels: ["Chatham House", "Chatham House Tech"] },
  "cnbc": { publisher: "CNBC", labels: ["CNBC", "CNBC Commodities", "CNBC Markets", "CNBC Tech"] },
  "csis": { publisher: "CSIS", labels: ["CSIS", "CSIS Tech"] },
  "die-zeit": { publisher: "Die Zeit", labels: [] },
  "dw": { publisher: "Deutsche Welle", labels: ["DW News", "DW Turkish"] },
  "eia": { publisher: "US Energy Information Administration", labels: ["EIA Press Room", "EIA Reports"] },
  "el-mundo": { publisher: "El Mundo", labels: [] },
  "el-pais": { publisher: "El Pa\xEDs", labels: [] },
  "fao": { publisher: "UN Food and Agriculture Organization", labels: ["FAO GIEWS", "FAO News"] },
  "fast-company": { publisher: "Fast Company", labels: [] },
  "financial-times": { publisher: "Financial Times", labels: ["FT Energy", "Financial Times"] },
  "fox-business": { publisher: "Fox Business", labels: [] },
  "fox-news": { publisher: "Fox News", labels: [] },
  "france-24": { publisher: "France 24", labels: ["France 24", "France 24 Africa", "France 24 Asia Pacific", "France 24 LatAm"] },
  "good-news-network": {
    publisher: "Good News Network",
    labels: [
      "GNN Animals",
      "GNN Earth",
      "GNN Health",
      "GNN Heroes",
      "GNN Heroes Spotlight",
      "GNN Science",
      "Good News Network"
    ]
  },
  "guardian": {
    publisher: "The Guardian",
    labels: [
      "Guardian Africa",
      "Guardian Americas",
      "Guardian Australia",
      "Guardian Caribbean",
      "Guardian ME",
      "Guardian Pacific",
      "Guardian Science",
      "Guardian World"
    ]
  },
  "hacker-news": { publisher: "Hacker News", labels: ["Hacker News", "Show HN", "YC News"] },
  "hromadske": { publisher: "Hromadske", labels: ["Hromadske", "Hromadske EN"] },
  "infoq": { publisher: "InfoQ", labels: [] },
  "interfax": { publisher: "Interfax", labels: ["Interfax EN", "Interfax RU"] },
  "iea": { publisher: "International Energy Agency", labels: ["IEA Critical Minerals", "IEA News"] },
  "kitco": { publisher: "Kitco", labels: ["Kitco Gold", "Kitco News"] },
  "marketwatch": { publisher: "MarketWatch", labels: ["MarketWatch", "MarketWatch Tech"] },
  "mit-technology-review": {
    publisher: "MIT Technology Review",
    labels: [
      "MIT Tech Review",
      "MIT Tech Review AI"
    ]
  },
  "nbc-news": { publisher: "NBC News", labels: [] },
  "ndtv": { publisher: "NDTV", labels: ["NDTV", "NDTV India"] },
  "new-york-times": { publisher: "The New York Times", labels: ["Hard Fork (NYT)", "New York Times World"] },
  "news24": { publisher: "News24", labels: [] },
  "nikkei": { publisher: "Nikkei", labels: ["Nikkei Asia", "Nikkei Tech"] },
  "nos": { publisher: "NOS Nieuws", labels: [] },
  "npr": { publisher: "NPR News", labels: [] },
  "pivot": { publisher: "Pivot (Vox Media)", labels: ["Pivot (Vox)", "Pivot Podcast"] },
  "politico": { publisher: "Politico", labels: ["Politico", "Politico Tech"] },
  "reuters": {
    publisher: "Reuters",
    labels: [
      "Reuters",
      "Reuters Asia",
      "Reuters Business",
      "Reuters Commodities",
      "Reuters Crypto",
      "Reuters Energy",
      "Reuters India",
      "Reuters LatAm",
      "Reuters Markets",
      "Reuters Nasdaq Futures",
      "Reuters Science",
      "Reuters US",
      "Reuters World"
    ]
  },
  "rt": { publisher: "RT", labels: ["RT", "RT Russia"] },
  "seeking-alpha": {
    publisher: "Seeking Alpha",
    labels: [
      "Seeking Alpha",
      "Seeking Alpha Metals",
      "Seeking Alpha Tech"
    ]
  },
  // Two titles, one owner: Sightline Media Group (owned by Regent) publishes
  // both Defense News and Military Times, per each site's About page.
  "sightline-media": { publisher: "Sightline Media", labels: ["Defense News", "Military Times"] },
  "sp-global": { publisher: "S&P Global", labels: ["S&P Global Commodity", "S&P Global Platts"] },
  "techcrunch": {
    publisher: "TechCrunch",
    labels: [
      "TechCrunch",
      "TechCrunch Layoffs",
      "TechCrunch Startups",
      "TechCrunch Venture"
    ]
  },
  "the-hacker-news": { publisher: "The Hacker News", labels: [] },
  "the-verge": {
    publisher: "The Verge",
    labels: [
      "Decoder (Verge)",
      "The Verge",
      "The Verge AI",
      "The Vergecast",
      "Verge Shows"
    ]
  },
  "venturebeat": { publisher: "VentureBeat", labels: ["VentureBeat", "VentureBeat AI"] },
  "white-house": { publisher: "The White House", labels: ["White House", "White House Actions"] },
  // #8398: the feed URL is a Dow Jones delivery host
  // (feeds.content.dowjones.io) but item links point at the publisher apex
  // (wsj.com, per the Dow Jones Investor Select RSS docs). Without this
  // mapping the ingest gate blanks every WSJ link. Domain-only by design:
  // the bare feed label ("Wall Street Journal") keeps its own singleton
  // (failing closed on labels), while the wsj.com domain allowance is
  // declared explicitly in PUBLISHER_FAMILY_DOMAINS below and the ingest
  // gate composes the feed-host leg (dowjones.io) separately. Domain-only
  // families are exempt from the two-label minimum (that rule targets label
  // folding; a domain table entry cannot merge two publishers' counts).
  // Exempted in tests/publisher-families.test.mjs via DOMAIN_ONLY_FAMILIES.
  "wsj": { publisher: "Wall Street Journal", labels: [] },
  // Same shape as 'wsj': the feed host (feeds.folha.uol.com.br) is not the
  // article host (www1.folha.uol.com.br), so the ingest gate needs the
  // folha.uol.com.br domain. Domain-only, exempted alongside 'wsj'.
  "folha": { publisher: "Folha de S.Paulo", labels: [] },
  "y-combinator": { publisher: "Y Combinator", labels: ["YC Launches", "Y Combinator Blog"] },
  "yahoo-finance": { publisher: "Yahoo Finance", labels: ["Yahoo Finance", "Yahoo Finance Commodities"] }
};
var PUBLISHER_FAMILIES = Object.freeze(PUBLISHER_FAMILY_DATA);
var PUBLISHER_FAMILY_DOMAINS = Object.freeze({
  "miit": ["miit.gov.cn"],
  "a16z": ["a16z.com"],
  "abc-news": ["abcnews.com"],
  "ap-news": ["apnews.com"],
  "ars-technica": ["arstechnica.com"],
  "arxiv": ["arxiv.org"],
  "axios": ["axios.com"],
  "bbc": ["bbc.com", "bbc.co.uk"],
  "bloomberg": ["bloomberg.com"],
  "brookings": ["brookings.edu"],
  "business-wire": ["businesswire.com"],
  "cb-insights": ["cbinsights.com"],
  "chatham-house": ["chathamhouse.org"],
  "cnbc": ["cnbc.com"],
  "csis": ["csis.org"],
  "die-zeit": ["zeit.de"],
  "dw": ["dw.com"],
  "eia": ["eia.gov"],
  "el-mundo": ["elmundo.es"],
  "el-pais": ["elpais.com"],
  "fao": ["fao.org"],
  "fast-company": ["fastcompany.com"],
  "folha": ["folha.uol.com.br"],
  "financial-times": ["ft.com"],
  "fox-business": ["foxbusiness.com"],
  "fox-news": ["foxnews.com"],
  "france-24": ["france24.com"],
  "good-news-network": ["goodnewsnetwork.org"],
  "guardian": ["theguardian.com"],
  "hromadske": ["hromadske.ua"],
  "iea": ["iea.org"],
  "infoq": ["infoq.com"],
  "interfax": ["interfax.com", "interfax.ru"],
  "kitco": ["kitco.com"],
  "marketwatch": ["marketwatch.com"],
  "mit-technology-review": ["technologyreview.com"],
  "nbc-news": ["nbcnews.com", "today.com"],
  "ndtv": ["ndtv.com", "ndtv.in"],
  "new-york-times": ["nytimes.com"],
  "news24": ["news24.com"],
  "nikkei": ["nikkei.com"],
  "nos": ["nos.nl"],
  "npr": ["npr.org"],
  "politico": ["politico.com", "politico.eu"],
  "reuters": ["reuters.com"],
  "rt": ["rt.com", "rt-english.com"],
  "seeking-alpha": ["seekingalpha.com"],
  "sightline-media": ["defensenews.com", "militarytimes.com"],
  "sp-global": ["spglobal.com"],
  "techcrunch": ["techcrunch.com"],
  "the-hacker-news": ["thehackernews.com"],
  "the-verge": ["theverge.com"],
  "venturebeat": ["venturebeat.com"],
  "white-house": ["whitehouse.gov"],
  // #8398: see the 'wsj' family entry above — the Dow Jones delivery host
  // is not the article host.
  "wsj": ["wsj.com"]
});
var familyByDomain = /* @__PURE__ */ new Map();
for (const [familyId, domains] of Object.entries(PUBLISHER_FAMILY_DOMAINS)) {
  for (const domain of domains) familyByDomain.set(domain, familyId);
}
var SINGLETON_PREFIX = "label:";
var familyByLabel = /* @__PURE__ */ new Map();
var familyByLowerLabel = /* @__PURE__ */ new Map();
for (const [familyId, entry] of Object.entries(PUBLISHER_FAMILY_DATA)) {
  for (const label of entry.labels) {
    familyByLabel.set(label, familyId);
    familyByLowerLabel.set(label.toLowerCase(), familyId);
  }
}
for (const [familyId, entry] of Object.entries(PUBLISHER_FAMILY_DATA)) {
  const lowerName = entry.publisher.toLowerCase();
  if (!familyByLowerLabel.has(lowerName)) familyByLowerLabel.set(lowerName, familyId);
}
function publisherFamilyFor(label) {
  if (typeof label !== "string") return "";
  const trimmed = label.trim();
  if (trimmed.length === 0) return "";
  const lower = trimmed.toLowerCase();
  return familyByLabel.get(trimmed) ?? familyByLowerLabel.get(lower) ?? `${SINGLETON_PREFIX}${lower}`;
}
function publisherFamilyForItem(item) {
  const sourceFamily = publisherFamilyFor(item?.source);
  if (item?.originPublisherTrusted !== true) return sourceFamily;
  const originFamily = publisherFamilyFor(item?.originPublisher);
  return originFamily || sourceFamily;
}
function publisherNameForFamily(familyId) {
  if (typeof familyId !== "string" || familyId.length === 0) return "";
  if (familyId.startsWith(SINGLETON_PREFIX)) return familyId.slice(SINGLETON_PREFIX.length);
  return PUBLISHER_FAMILY_DATA[familyId]?.publisher ?? familyId;
}

// shared/keyword-spike-core.js
var CVE_PATTERN = /CVE-\d{4}-\d{4,}/gi;
var APT_PATTERN = /APT\d+/gi;
var FIN_PATTERN = /FIN\d+/gi;
var LEADER_NAMES = [
  "putin",
  "zelensky",
  "xi jinping",
  "biden",
  "trump",
  "netanyahu",
  "khamenei",
  "erdogan",
  "modi",
  "macron",
  "scholz",
  "starmer",
  "orban",
  "milei",
  "kim jong un",
  "al-sisi"
];
var LEADER_PATTERNS = LEADER_NAMES.map((name) => ({
  name,
  pattern: new RegExp(`\\b${escapeRegex(name)}\\b`, "i")
}));
var ROLLING_WINDOW_MS = 2 * 60 * 60 * 1e3;
var BASELINE_WINDOW_MS = 7 * 24 * 60 * 60 * 1e3;
var MIN_TOKEN_LENGTH = 3;
var MAX_TERM_TITLE_CHARS = 500;
var MIN_SPIKE_SOURCE_COUNT = 2;
var DEFAULT_MIN_SPIKE_COUNT = 5;
var DEFAULT_SPIKE_MULTIPLIER = 3;
function toTermKey(term) {
  return term.trim().toLowerCase();
}
function asDisplayTerm(term) {
  if (/^(cve-\d{4}-\d{4,}|apt\d+|fin\d+)$/i.test(term)) {
    return term.toUpperCase();
  }
  return term.toLowerCase();
}
function extractEntities(text) {
  const entities = [];
  const lower = text.toLowerCase();
  for (const match of text.matchAll(CVE_PATTERN)) {
    entities.push(match[0].toUpperCase());
  }
  for (const match of text.matchAll(APT_PATTERN)) {
    entities.push(match[0].toUpperCase());
  }
  for (const match of text.matchAll(FIN_PATTERN)) {
    entities.push(match[0].toUpperCase());
  }
  for (const { name, pattern } of LEADER_PATTERNS) {
    if (pattern.test(lower)) {
      entities.push(name);
    }
  }
  return entities;
}
function stripSourceAttribution(title) {
  const idx = title.lastIndexOf(" - ");
  if (idx === -1) return title;
  const after = title.slice(idx + 3).trim();
  if (after.length > 0 && after.length <= 60 && !/[.!?]/.test(after)) {
    return title.slice(0, idx).trim();
  }
  return title;
}
function buildBaseTermCandidates(title) {
  const termCandidates = /* @__PURE__ */ new Map();
  const cleanTitle = stripSourceAttribution(title).slice(0, MAX_TERM_TITLE_CHARS);
  for (const token of tokenize(cleanTitle)) {
    const termKey = toTermKey(token);
    termCandidates.set(termKey, { display: token, isEntity: false });
  }
  for (const entity of extractEntities(cleanTitle)) {
    const termKey = toTermKey(entity);
    termCandidates.set(termKey, { display: entity, isEntity: true });
  }
  return termCandidates;
}
function evaluateSpikeDecision({ recentCount, baseline, minSpikeCount, spikeMultiplier }) {
  if (recentCount < minSpikeCount) return { isSpike: false, multiplier: 0 };
  const multiplier = baseline > 0 ? recentCount / baseline : 0;
  const isSpike = baseline > 0 ? recentCount > baseline * spikeMultiplier : recentCount >= minSpikeCount;
  return { isSpike, multiplier };
}
function displayNameForLabel(label) {
  const family = publisherFamilyFor(label);
  if (!family) return "";
  return PUBLISHER_FAMILIES[family]?.publisher ?? String(label).trim();
}
function collectPublisherNames(stories) {
  const byFamily = /* @__PURE__ */ new Map();
  for (const story of stories) {
    if (!Array.isArray(story.sources)) continue;
    for (const label of story.sources) {
      const family = publisherFamilyFor(label);
      if (!family || byFamily.has(family)) continue;
      byFamily.set(family, displayNameForLabel(label));
    }
  }
  return {
    uniqueSources: byFamily.size,
    sourceNames: [...byFamily.values()].sort((a, b) => a.localeCompare(b))
  };
}
function sampleHeadlineFromStory(story) {
  const names = collectPublisherNames([story]).sourceNames;
  return {
    title: story.title,
    source: names.join(", "),
    link: typeof story.link === "string" ? story.link : ""
  };
}
function computeKeywordSpikesFromStories(stories, {
  nowMs,
  windowMs = ROLLING_WINDOW_MS,
  baselineDurationMs,
  minSpikeCount = DEFAULT_MIN_SPIKE_COUNT,
  spikeMultiplier = DEFAULT_SPIKE_MULTIPLIER,
  blockedTerms = SUPPRESSED_TRENDING_TERMS,
  maxSampleHeadlines = 3
}) {
  if (!Number.isFinite(baselineDurationMs) || baselineDurationMs <= 0) return [];
  const windowStart = nowMs - windowMs;
  const baselineWindows = baselineDurationMs / windowMs;
  const terms = /* @__PURE__ */ new Map();
  for (const story of stories) {
    if (!story?.title || !Number.isFinite(story.lastSeenMs)) continue;
    const isRecent = story.lastSeenMs >= windowStart && story.lastSeenMs <= nowMs;
    for (const [termKey, meta] of buildBaseTermCandidates(story.title)) {
      if (blockedTerms.has(termKey)) continue;
      if (!meta.isEntity && termKey.length < MIN_TOKEN_LENGTH) continue;
      let record = terms.get(termKey);
      if (!record) {
        record = { display: asDisplayTerm(meta.display), recent: [], baselineCount: 0 };
        terms.set(termKey, record);
      } else if (meta.isEntity) {
        record.display = asDisplayTerm(meta.display);
      }
      if (isRecent) record.recent.push(story);
      else record.baselineCount += 1;
    }
  }
  const spikes = [];
  for (const record of terms.values()) {
    const recentCount = record.recent.length;
    const baseline = record.baselineCount / baselineWindows;
    const { isSpike, multiplier } = evaluateSpikeDecision({
      recentCount,
      baseline,
      minSpikeCount,
      spikeMultiplier
    });
    if (!isSpike) continue;
    const publishers = collectPublisherNames(record.recent);
    if (publishers.uniqueSources < MIN_SPIKE_SOURCE_COUNT) continue;
    spikes.push({
      term: record.display,
      count: recentCount,
      baseline,
      multiplier,
      windowMs,
      uniqueSources: publishers.uniqueSources,
      sourceNames: publishers.sourceNames,
      sampleHeadlines: (record.recent.some((story) => collectPublisherNames([story]).uniqueSources > 0) ? record.recent.filter((story) => collectPublisherNames([story]).uniqueSources > 0) : record.recent).slice(0, maxSampleHeadlines).map(sampleHeadlineFromStory)
    });
  }
  return spikes.sort((a, b) => b.count - a.count || a.term.localeCompare(b.term));
}

// shared/syndication.js
var SYNDICATION_MIN_LEAD_WORDS = 12;
var SYNDICATION_MIN_CONTAINMENT = 0.85;
var LEAD_WORD_LIMIT = 60;
var CURATED_FAMILY = (family) => typeof family === "string" && family !== "" && !family.startsWith("label:");
function words(text) {
  return String(text || "").replace(/&(?:[a-z]+|#\d+|#x[0-9a-f]+);/gi, " ").toLowerCase().normalize("NFKD").replace(new RegExp("\\p{M}", "gu"), "").split(/[^\p{L}\p{N}]+/u).filter(Boolean);
}
function leadOf(item) {
  const lead = typeof item?.snippet === "string" && item.snippet.trim() !== "" ? item.snippet : item?.description;
  return typeof lead === "string" ? lead : "";
}
function copyShingles(item) {
  const title = words(item?.title);
  const lead = words(leadOf(item));
  const titleWords = new Set(title);
  if (lead.filter((word) => !titleWords.has(word)).length < SYNDICATION_MIN_LEAD_WORDS) return null;
  const tokens = [...title, ...lead.slice(0, LEAD_WORD_LIMIT)];
  const shingles = /* @__PURE__ */ new Set();
  for (let i = 0; i + 2 < tokens.length; i++) shingles.add(`${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`);
  return shingles.size > 0 ? shingles : null;
}
function copyContainment(a, b) {
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  if (small.size === 0) return 0;
  let shared = 0;
  for (const shingle of small) if (large.has(shingle)) shared += 1;
  return shared / small.size;
}
function detectSyndication(items, familyFor = publisherFamilyForItem) {
  const list = Array.isArray(items) ? items : [];
  const familyByItem = /* @__PURE__ */ new Map();
  for (const item of list) familyByItem.set(item, familyFor(item) || "");
  const parent = /* @__PURE__ */ new Map();
  const curatedOf = /* @__PURE__ */ new Map();
  for (const family of new Set(familyByItem.values())) {
    if (!family) continue;
    parent.set(family, family);
    curatedOf.set(family, CURATED_FAMILY(family) ? family : null);
  }
  const find = (family) => {
    let root = family;
    while (parent.get(root) !== root) root = parent.get(root);
    while (parent.get(family) !== root) {
      const next = parent.get(family);
      parent.set(family, root);
      family = next;
    }
    return root;
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA === rootB) return;
    const curatedA = curatedOf.get(rootA);
    const curatedB = curatedOf.get(rootB);
    if (curatedA && curatedB) return;
    const [root, child] = curatedB && !curatedA ? [rootB, rootA] : [rootA, rootB];
    parent.set(child, root);
    curatedOf.set(root, curatedA ?? curatedB ?? null);
  };
  const comparable = [];
  for (const item of list) {
    const family = familyByItem.get(item);
    if (!family) continue;
    const shingles = copyShingles(item);
    if (shingles) comparable.push({ family, shingles });
  }
  const copyOf = comparable.map((_, i) => i);
  const findCopy = (i) => {
    while (copyOf[i] !== i) i = copyOf[i] = copyOf[copyOf[i]];
    return i;
  };
  for (let i = 0; i < comparable.length; i++) {
    for (let j = i + 1; j < comparable.length; j++) {
      if (comparable[i].family === comparable[j].family || findCopy(i) === findCopy(j)) continue;
      if (copyContainment(comparable[i].shingles, comparable[j].shingles) >= SYNDICATION_MIN_CONTAINMENT) {
        copyOf[findCopy(i)] = findCopy(j);
      }
    }
  }
  const familiesByCopy = /* @__PURE__ */ new Map();
  comparable.forEach(({ family }, i) => {
    const copy = findCopy(i);
    if (!familiesByCopy.has(copy)) familiesByCopy.set(copy, /* @__PURE__ */ new Set());
    familiesByCopy.get(copy).add(family);
  });
  const sharedCopies = /* @__PURE__ */ new Map();
  for (const families of familiesByCopy.values()) {
    if (families.size < 2) continue;
    for (const family of families) sharedCopies.set(family, (sharedCopies.get(family) ?? 0) + 1);
  }
  for (const families of familiesByCopy.values()) {
    const [first, ...rest] = [...families].filter((family) => sharedCopies.get(family) === 1);
    for (const family of rest) union(first, family);
  }
  const membersByRoot = /* @__PURE__ */ new Map();
  for (const family of parent.keys()) {
    const root = find(family);
    if (!membersByRoot.has(root)) membersByRoot.set(root, []);
    membersByRoot.get(root).push(family);
  }
  const groups = [];
  for (const members of membersByRoot.values()) {
    if (members.length < 2) continue;
    const memberSet = new Set(members);
    const labels = [];
    for (const item of list) {
      const label = typeof item?.source === "string" ? item.source.trim() : "";
      if (label && memberSet.has(familyByItem.get(item)) && !labels.includes(label)) labels.push(label);
    }
    groups.push({ families: [...members].sort(), labels });
  }
  return {
    familyOf: (item) => {
      const family = familyByItem.has(item) ? familyByItem.get(item) : familyFor(item) || "";
      return family && parent.has(family) ? find(family) : family;
    },
    publishers: membersByRoot.size,
    groups
  };
}

// shared/news-clustering-core.js
var MAX_CLUSTER_NEWS_ITEMS = 1e3;
var THREAT_PRIORITY = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1
};
var PROTO_TO_THREAT_LEVEL = {
  THREAT_LEVEL_UNSPECIFIED: "info",
  THREAT_LEVEL_LOW: "low",
  THREAT_LEVEL_MEDIUM: "medium",
  THREAT_LEVEL_HIGH: "high",
  THREAT_LEVEL_CRITICAL: "critical"
};
function protoThreatLevelToLabel(value) {
  return PROTO_TO_THREAT_LEVEL[value] ?? "info";
}
function effectivePubDateMs(item) {
  if (item.pubDateMissing === true) return 0;
  if (item.pubDate instanceof Date) {
    const ms2 = item.pubDate.getTime();
    return Number.isFinite(ms2) ? ms2 : 0;
  }
  if (typeof item.pubDate === "number") {
    return Number.isFinite(item.pubDate) ? item.pubDate : 0;
  }
  const ms = new Date(item.pubDate).getTime();
  return Number.isFinite(ms) ? ms : 0;
}
function aggregateThreats(items) {
  const withThreat = items.filter((i) => i.threat);
  if (withThreat.length === 0) {
    return { level: "info", category: "general", confidence: 0.3, source: "keyword" };
  }
  let maxLevel = "info";
  let maxPriority = 0;
  for (const item of withThreat) {
    const p = THREAT_PRIORITY[item.threat.level];
    if (p > maxPriority) {
      maxPriority = p;
      maxLevel = item.threat.level;
    }
  }
  const catCounts = /* @__PURE__ */ new Map();
  for (const item of withThreat) {
    const cat = item.threat.category;
    catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
  }
  let topCat = "general";
  let topCount = 0;
  for (const [cat, count] of catCounts) {
    if (count > topCount) {
      topCount = count;
      topCat = cat;
    }
  }
  let weightedSum = 0;
  let weightTotal = 0;
  for (const item of withThreat) {
    const weight = item.tier ? 6 - Math.min(item.tier, 5) : 1;
    weightedSum += item.threat.confidence * weight;
    weightTotal += weight;
  }
  return {
    level: maxLevel,
    category: topCat,
    confidence: weightTotal > 0 ? weightedSum / weightTotal : 0.5,
    source: "keyword"
  };
}
function generateClusterId(items) {
  const sorted = [...items].sort((a, b) => a.pubDate.getTime() - b.pubDate.getTime());
  const first = sorted[0];
  return `${first.pubDate.getTime()}-${first.title.slice(0, 20).replace(/\W/g, "")}`;
}
function clusterNewsCore(items, getSourceTier2, tokenizeTitle = tokenize) {
  if (items.length === 0) return [];
  const boundedItems = items.length > MAX_CLUSTER_NEWS_ITEMS ? [...items].sort(
    (a, b) => effectivePubDateMs(b) - effectivePubDateMs(a) || a.source.localeCompare(b.source) || a.title.localeCompare(b.title) || a.link.localeCompare(b.link)
  ).slice(0, MAX_CLUSTER_NEWS_ITEMS) : items;
  const itemsWithTier = boundedItems.map((item) => ({
    ...item,
    tier: item.tier ?? getSourceTier2(item.source)
  }));
  const tokenCache = /* @__PURE__ */ new Map();
  const tokenList = [];
  const invertedIndex = /* @__PURE__ */ new Map();
  for (const item of itemsWithTier) {
    const tokens = tokenizeTitle(item.title);
    tokenCache.set(item.title, tokens);
    tokenList.push(tokens);
  }
  for (let index = 0; index < tokenList.length; index++) {
    const tokens = tokenList[index];
    for (const token of tokens) {
      const bucket = invertedIndex.get(token);
      if (bucket) {
        bucket.push(index);
      } else {
        invertedIndex.set(token, [index]);
      }
    }
  }
  const clusters = [];
  const assigned = /* @__PURE__ */ new Set();
  for (let i = 0; i < itemsWithTier.length; i++) {
    if (assigned.has(i)) continue;
    const currentItem = itemsWithTier[i];
    const cluster = [currentItem];
    assigned.add(i);
    const tokensI = tokenList[i];
    const candidateIndices = /* @__PURE__ */ new Set();
    for (const token of tokensI) {
      const bucket = invertedIndex.get(token);
      if (!bucket) continue;
      for (const idx of bucket) {
        if (idx > i) {
          candidateIndices.add(idx);
        }
      }
    }
    const sortedCandidates = Array.from(candidateIndices).sort((a, b) => a - b);
    for (const j of sortedCandidates) {
      if (assigned.has(j)) {
        continue;
      }
      const otherItem = itemsWithTier[j];
      const tokensJ = tokenList[j];
      const similarity = jaccardSimilarity(tokensI, tokensJ);
      if (similarity >= SIMILARITY_THRESHOLD) {
        cluster.push(otherItem);
        assigned.add(j);
      }
    }
    clusters.push(cluster);
  }
  return clusters.map((cluster) => {
    const sorted = [...cluster].sort((a, b) => {
      const tierDiff = a.tier - b.tier;
      if (tierDiff !== 0) return tierDiff;
      return effectivePubDateMs(b) - effectivePubDateMs(a);
    });
    const primary = sorted[0];
    const dates = cluster.map((i) => i.pubDate.getTime());
    const topSources = sorted.slice(0, 3).map((item) => ({
      name: item.source,
      tier: item.tier,
      url: item.link
    }));
    const threat = aggregateThreats(cluster);
    const locItems = cluster.filter((i) => i.lat != null && i.lon != null);
    let clusterLat;
    let clusterLon;
    if (locItems.length > 0) {
      const locCounts = /* @__PURE__ */ new Map();
      for (const li of locItems) {
        const key = `${li.lat},${li.lon}`;
        const entry = locCounts.get(key) || { lat: li.lat, lon: li.lon, count: 0 };
        entry.count++;
        locCounts.set(key, entry);
      }
      const best = Array.from(locCounts.values()).sort((a, b) => b.count - a.count)[0];
      clusterLat = best.lat;
      clusterLon = best.lon;
    }
    return {
      id: generateClusterId(cluster),
      primaryTitle: primary.title,
      primarySource: primary.source,
      primaryLink: primary.link,
      ...Number.isFinite(primary.credibilityScore) ? { credibilityScore: primary.credibilityScore } : {},
      sourceCount: cluster.length,
      uniquePublisherCount: clusterPublisherCount(cluster),
      topSources,
      allItems: cluster,
      firstSeen: new Date(dates.reduce((min, d) => d < min ? d : min)),
      lastUpdated: new Date(dates.reduce((max, d) => d > max ? d : max)),
      isAlert: cluster.some((i) => i.isAlert),
      monitorColor: cluster.find((i) => i.monitorColor)?.monitorColor,
      threat,
      ...clusterLat != null && { lat: clusterLat, lon: clusterLon },
      lang: primary.lang
    };
  }).sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime());
}
function topClusterKeywords(cluster, limit = 5, tokenizeTitle = tokenize) {
  const counts = /* @__PURE__ */ new Map();
  for (const item of cluster.allItems) {
    for (const token of tokenizeTitle(item.title)) {
      if (SUPPRESSED_TRENDING_TERMS.has(token)) continue;
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, limit).map(([token]) => token);
}
function clusterPublisherCount(items) {
  return detectSyndication(items, (i) => publisherFamilyFor(i.source)).publishers;
}

// shared/news-pool-layout.generated.ts
var NEWS_POOL_LAYOUT = {
  "editions": {
    "full": [
      "politics",
      "us",
      "europe",
      "middleeast",
      "tech",
      "ai",
      "finance",
      "commodities",
      "gov",
      "africa",
      "latam",
      "asia",
      "energy",
      "thinktanks",
      "crisis",
      "layoffs",
      "science",
      "intel"
    ],
    "tech": [
      "tech",
      "ai",
      "startups",
      "vcblogs",
      "regionalStartups",
      "unicorns",
      "accelerators",
      "security",
      "policy",
      "github",
      "funding",
      "cloud",
      "layoffs",
      "finance",
      "dev",
      "ipo",
      "producthunt",
      "hardware",
      "outages",
      "thinktanks",
      "podcasts"
    ],
    "finance": [
      "markets",
      "forex",
      "bonds",
      "commodities",
      "crypto",
      "centralbanks",
      "economic",
      "ipo",
      "derivatives",
      "fintech",
      "fin-regulation",
      "institutional",
      "analysis",
      "gccNews",
      "nq-news"
    ],
    "commodity": [
      "commodity-news",
      "gold-silver",
      "energy",
      "mining-news",
      "critical-minerals",
      "base-metals",
      "mining-companies",
      "supply-chain",
      "commodity-regulation",
      "markets",
      "finance"
    ],
    "happy": [
      "positive",
      "science",
      "nature",
      "inspiring",
      "community"
    ],
    "energy": [
      "live-news",
      "energy",
      "supply-chain"
    ]
  },
  "languages": [
    "en",
    "ar",
    "bg",
    "cs",
    "da",
    "de",
    "el",
    "es",
    "fa",
    "fr",
    "hi",
    "hr",
    "hu",
    "it",
    "ja",
    "ko",
    "nl",
    "no",
    "pl",
    "pt",
    "ro",
    "ru",
    "sv",
    "tr",
    "uk",
    "vi",
    "zh"
  ],
  "cells": [
    {
      "edition": "full",
      "lang": "en",
      "contentLanguages": [
        "en",
        "ar",
        "da",
        "de",
        "no",
        "pl",
        "ru",
        "uk"
      ]
    },
    {
      "edition": "full",
      "lang": "ar",
      "contentLanguages": [
        "ar"
      ]
    },
    {
      "edition": "full",
      "lang": "bg",
      "contentLanguages": [
        "bg"
      ]
    },
    {
      "edition": "full",
      "lang": "cs",
      "contentLanguages": [
        "cs"
      ]
    },
    {
      "edition": "full",
      "lang": "de",
      "contentLanguages": [
        "de"
      ]
    },
    {
      "edition": "full",
      "lang": "el",
      "contentLanguages": [
        "el"
      ]
    },
    {
      "edition": "full",
      "lang": "es",
      "contentLanguages": [
        "es"
      ]
    },
    {
      "edition": "full",
      "lang": "fa",
      "contentLanguages": [
        "fa"
      ]
    },
    {
      "edition": "full",
      "lang": "fr",
      "contentLanguages": [
        "fr"
      ]
    },
    {
      "edition": "full",
      "lang": "hi",
      "contentLanguages": [
        "hi"
      ]
    },
    {
      "edition": "full",
      "lang": "hr",
      "contentLanguages": [
        "hr"
      ]
    },
    {
      "edition": "full",
      "lang": "hu",
      "contentLanguages": [
        "hu"
      ]
    },
    {
      "edition": "full",
      "lang": "it",
      "contentLanguages": [
        "it"
      ]
    },
    {
      "edition": "full",
      "lang": "ja",
      "contentLanguages": [
        "ja"
      ]
    },
    {
      "edition": "full",
      "lang": "ko",
      "contentLanguages": [
        "ko"
      ]
    },
    {
      "edition": "full",
      "lang": "nl",
      "contentLanguages": [
        "nl"
      ]
    },
    {
      "edition": "full",
      "lang": "pl",
      "contentLanguages": [
        "pl"
      ]
    },
    {
      "edition": "full",
      "lang": "pt",
      "contentLanguages": [
        "pt"
      ]
    },
    {
      "edition": "full",
      "lang": "ro",
      "contentLanguages": [
        "ro"
      ]
    },
    {
      "edition": "full",
      "lang": "ru",
      "contentLanguages": [
        "ru"
      ]
    },
    {
      "edition": "full",
      "lang": "sv",
      "contentLanguages": [
        "sv"
      ]
    },
    {
      "edition": "full",
      "lang": "th",
      "contentLanguages": [
        "en"
      ]
    },
    {
      "edition": "full",
      "lang": "tr",
      "contentLanguages": [
        "tr"
      ]
    },
    {
      "edition": "full",
      "lang": "uk",
      "contentLanguages": [
        "uk"
      ]
    },
    {
      "edition": "full",
      "lang": "vi",
      "contentLanguages": [
        "en",
        "vi"
      ]
    },
    {
      "edition": "full",
      "lang": "zh",
      "contentLanguages": [
        "zh"
      ]
    },
    {
      "edition": "tech",
      "lang": "en",
      "contentLanguages": [
        "en"
      ]
    },
    {
      "edition": "finance",
      "lang": "en",
      "contentLanguages": [
        "en"
      ]
    },
    {
      "edition": "finance",
      "lang": "zh",
      "contentLanguages": [
        "zh"
      ]
    },
    {
      "edition": "commodity",
      "lang": "en",
      "contentLanguages": [
        "en"
      ]
    },
    {
      "edition": "happy",
      "lang": "en",
      "contentLanguages": [
        "en"
      ]
    },
    {
      "edition": "energy",
      "lang": "en",
      "contentLanguages": [
        "en"
      ]
    }
  ]
};

// shared/source-provenance-declarations.ts
var CONFIGURED_SOURCE_PROVENANCE_DECLARATIONS = Object.freeze({
  "+972 Magazine": { risk: "reviewed", type: "reviewed" },
  "14ymedio": { risk: "reviewed", type: "reviewed" },
  "20VC Episodes": { risk: "unknown", type: "unknown" },
  "24.hu": { risk: "unknown", type: "reviewed" },
  "36Kr English": { risk: "unknown", type: "reviewed" },
  "444.hu": { risk: "unknown", type: "reviewed" },
  "500 Global News": { risk: "unknown", type: "unknown" },
  "a16z Blog": { risk: "unknown", type: "unknown" },
  "a16z Insights": { risk: "unknown", type: "unknown" },
  "Aaj Tak": { risk: "unknown", type: "reviewed" },
  "ABC News": { risk: "unknown", type: "unknown" },
  "ABC News Australia": { risk: "unknown", type: "unknown" },
  "Acquired Episodes": { risk: "unknown", type: "unknown" },
  "Actualite.cd": { risk: "unknown", type: "unknown" },
  "ActuNiger": { risk: "reviewed", type: "reviewed" },
  "Africa News": { risk: "unknown", type: "unknown" },
  "Africa Startups": { risk: "unknown", type: "unknown" },
  "Africa Tech News": { risk: "unknown", type: "unknown" },
  "Africanews": { risk: "unknown", type: "unknown" },
  "Aftenposten": { risk: "reviewed", type: "reviewed" },
  "Agriculture": { risk: "unknown", type: "unknown" },
  "AI Interviews": { risk: "unknown", type: "unknown" },
  "AI News": { risk: "unknown", type: "reviewed" },
  "AI Now Institute": { risk: "unknown", type: "reviewed" },
  "AI Podcasts": { risk: "unknown", type: "unknown" },
  "AI Regulation": { risk: "unknown", type: "unknown" },
  "AI Weekly": { risk: "unknown", type: "unknown" },
  "A\xEFr Info": { risk: "reviewed", type: "reviewed" },
  "Al Arabiya": { risk: "reviewed", type: "reviewed" },
  "Al Jazeera": { risk: "reviewed", type: "reviewed" },
  "All-In Podcast": { risk: "unknown", type: "reviewed" },
  "Aluminum & Zinc": { risk: "unknown", type: "unknown" },
  "Alwihda Info": { risk: "reviewed", type: "reviewed" },
  "Amar Ujala": { risk: "unknown", type: "reviewed" },
  "AMNA": { risk: "reviewed", type: "reviewed" },
  "Amu TV": { risk: "reviewed", type: "reviewed" },
  "AngelList News": { risk: "unknown", type: "unknown" },
  "Annahar": { risk: "reviewed", type: "reviewed" },
  "ANSA": { risk: "unknown", type: "reviewed" },
  "Anthropic News": { risk: "unknown", type: "unknown" },
  "AP Mexico": { risk: "unknown", type: "unknown" },
  "AP News": { risk: "reviewed", type: "reviewed" },
  "Arab News": { risk: "unknown", type: "unknown" },
  "Arabian Business": { risk: "unknown", type: "unknown" },
  "Arctic Today": { risk: "reviewed", type: "reviewed" },
  "Armenpress": { risk: "reviewed", type: "reviewed" },
  "Arms Control Assn": { risk: "unknown", type: "reviewed" },
  "Ars Technica": { risk: "unknown", type: "reviewed" },
  "ArXiv AI": { risk: "unknown", type: "reviewed" },
  "ArXiv ML": { risk: "unknown", type: "unknown" },
  "Asahi Shimbun": { risk: "unknown", type: "unknown" },
  "Asharq Business": { risk: "unknown", type: "unknown" },
  "Asharq News": { risk: "unknown", type: "unknown" },
  "Asia News": { risk: "unknown", type: "unknown" },
  "Asia Pacific Tech": { risk: "unknown", type: "unknown" },
  "Asia VC News": { risk: "unknown", type: "unknown" },
  "Atlantic Council": { risk: "unknown", type: "reviewed" },
  "ATV": { risk: "unknown", type: "reviewed" },
  "Australian Mining": { risk: "unknown", type: "unknown" },
  "AWS Status": { risk: "unknown", type: "unknown" },
  "Axios": { risk: "unknown", type: "reviewed" },
  "AyiboPost": { risk: "reviewed", type: "reviewed" },
  "Azertag": { risk: "reviewed", type: "reviewed" },
  "Balkan Insight": { risk: "unknown", type: "reviewed" },
  "Bangkok Post": { risk: "unknown", type: "unknown" },
  "Bank Research": { risk: "unknown", type: "unknown" },
  "Banking Rules": { risk: "unknown", type: "unknown" },
  "BBC Africa": { risk: "unknown", type: "unknown" },
  "BBC Afrique": { risk: "unknown", type: "unknown" },
  "BBC Asia": { risk: "unknown", type: "unknown" },
  "BBC Hindi": { risk: "unknown", type: "reviewed" },
  "BBC Latin America": { risk: "unknown", type: "unknown" },
  "BBC Middle East": { risk: "reviewed", type: "reviewed" },
  "BBC Mundo": { risk: "unknown", type: "reviewed" },
  "BBC Northern Ireland": { risk: "reviewed", type: "reviewed" },
  "BBC Persian": { risk: "unknown", type: "unknown" },
  "BBC Russian": { risk: "unknown", type: "unknown" },
  "BBC Science": { risk: "reviewed", type: "reviewed" },
  "BBC Turkce": { risk: "unknown", type: "unknown" },
  "BBC UK": { risk: "reviewed", type: "reviewed" },
  "BBC World": { risk: "reviewed", type: "reviewed" },
  "Bellingcat": { risk: "reviewed", type: "reviewed" },
  "Benchmark Mineral": { risk: "unknown", type: "unknown" },
  "BHP News": { risk: "unknown", type: "unknown" },
  "Bihus.Info": { risk: "reviewed", type: "reviewed" },
  "Bild": { risk: "unknown", type: "unknown" },
  "Binance Announcements": { risk: "reviewed", type: "reviewed" },
  "Bitcoin Magazine": { risk: "unknown", type: "unknown" },
  "Blockchain Finance": { risk: "unknown", type: "unknown" },
  "Bloomberg Commodities": { risk: "unknown", type: "unknown" },
  "Bloomberg Crypto": { risk: "unknown", type: "unknown" },
  "Bloomberg Energy": { risk: "unknown", type: "unknown" },
  "Bloomberg Markets": { risk: "unknown", type: "unknown" },
  "BoE Watch": { risk: "unknown", type: "unknown" },
  "BoJ Watch": { risk: "unknown", type: "unknown" },
  "Bond Market": { risk: "unknown", type: "unknown" },
  "Brasil Paralelo": { risk: "reviewed", type: "reviewed" },
  "Brazil Tech": { risk: "unknown", type: "unknown" },
  "Breaking Defense": { risk: "reviewed", type: "reviewed" },
  "Brookings": { risk: "unknown", type: "reviewed" },
  "Brookings Tech": { risk: "unknown", type: "reviewed" },
  "Bulletin of Atomic Scientists": { risk: "unknown", type: "reviewed" },
  "Business Insider": { risk: "reviewed", type: "reviewed" },
  "Business Wire": { risk: "reviewed", type: "reviewed" },
  "Calgary Herald": { risk: "reviewed", type: "reviewed" },
  "Caracas Chronicles": { risk: "reviewed", type: "reviewed" },
  "Carnegie": { risk: "unknown", type: "reviewed" },
  "CB Insights": { risk: "unknown", type: "unknown" },
  "CB Insights Unicorn": { risk: "unknown", type: "unknown" },
  "CBC News": { risk: "reviewed", type: "reviewed" },
  "CBS News": { risk: "unknown", type: "unknown" },
  "CDC": { risk: "unknown", type: "reviewed" },
  "Central Bank Rates": { risk: "unknown", type: "unknown" },
  "Chainwire": { risk: "reviewed", type: "reviewed" },
  "Changelog": { risk: "unknown", type: "unknown" },
  "Channels TV": { risk: "unknown", type: "unknown" },
  "Chatham House": { risk: "unknown", type: "unknown" },
  "Chatham House Tech": { risk: "unknown", type: "reviewed" },
  "China Commodity Imports": { risk: "unknown", type: "unknown" },
  "China Mineral Policy": { risk: "unknown", type: "unknown" },
  "China Startups": { risk: "unknown", type: "unknown" },
  "China Tech Analysis": { risk: "unknown", type: "unknown" },
  "China Tech Giants": { risk: "unknown", type: "unknown" },
  "China Tech Policy": { risk: "unknown", type: "unknown" },
  "Chosun Ilbo": { risk: "unknown", type: "unknown" },
  "CISA": { risk: "reviewed", type: "reviewed" },
  "Citi Newsroom": { risk: "unknown", type: "unknown" },
  "Civil.ge": { risk: "reviewed", type: "reviewed" },
  "Clar\xEDn": { risk: "unknown", type: "unknown" },
  "Cloud Outages": { risk: "unknown", type: "unknown" },
  "CNA": { risk: "reviewed", type: "reviewed" },
  "CNAS": { risk: "unknown", type: "reviewed" },
  "CNBC": { risk: "unknown", type: "reviewed" },
  "CNBC Commodities": { risk: "unknown", type: "unknown" },
  "CNBC Tech": { risk: "unknown", type: "unknown" },
  "CNN Greece": { risk: "unknown", type: "reviewed" },
  "CNN World": { risk: "reviewed", type: "reviewed" },
  "Cobalt Market": { risk: "unknown", type: "unknown" },
  "Coinbase Blog": { risk: "reviewed", type: "reviewed" },
  "CoinDesk": { risk: "unknown", type: "unknown" },
  "Cointelegraph": { risk: "unknown", type: "unknown" },
  "Commodity Futures": { risk: "unknown", type: "unknown" },
  "Commodity Trading": { risk: "unknown", type: "unknown" },
  "Conservation Optimism": { risk: "unknown", type: "unknown" },
  "Copper Market": { risk: "unknown", type: "unknown" },
  "Corporate Bonds": { risk: "unknown", type: "unknown" },
  "Correctiv": { risk: "unknown", type: "reviewed" },
  "Corriere della Sera": { risk: "unknown", type: "reviewed" },
  "CP24": { risk: "reviewed", type: "reviewed" },
  "CrisisWatch": { risk: "unknown", type: "reviewed" },
  "Critical Mineral Companies": { risk: "unknown", type: "unknown" },
  "Crunchbase News": { risk: "unknown", type: "unknown" },
  "Crypto News": { risk: "unknown", type: "unknown" },
  "Crypto Regulation": { risk: "unknown", type: "unknown" },
  "CryptoSlate": { risk: "unknown", type: "unknown" },
  "CSIS": { risk: "unknown", type: "reviewed" },
  "CSIS Tech": { risk: "unknown", type: "reviewed" },
  "CTV News": { risk: "reviewed", type: "reviewed" },
  "Dabanga Sudan": { risk: "unknown", type: "unknown" },
  "Dagens Nyheter": { risk: "unknown", type: "reviewed" },
  "Daily Nation": { risk: "reviewed", type: "reviewed" },
  "Daily Sabah": { risk: "reviewed", type: "reviewed" },
  "Daily Trust": { risk: "unknown", type: "unknown" },
  "DailyGood": { risk: "unknown", type: "unknown" },
  "Dark Reading": { risk: "unknown", type: "unknown" },
  "Dawn": { risk: "unknown", type: "reviewed" },
  "De Telegraaf": { risk: "unknown", type: "reviewed" },
  "Decacorn News": { risk: "unknown", type: "unknown" },
  "Decrypt": { risk: "unknown", type: "unknown" },
  "Defense News": { risk: "unknown", type: "reviewed" },
  "Defense One": { risk: "reviewed", type: "reviewed" },
  "DeFi News": { risk: "unknown", type: "unknown" },
  "Demo Day News": { risk: "unknown", type: "unknown" },
  "Der Spiegel": { risk: "unknown", type: "reviewed" },
  "Dev Events": { risk: "unknown", type: "unknown" },
  "Dev.to": { risk: "unknown", type: "unknown" },
  "DevOps.com": { risk: "unknown", type: "unknown" },
  "DFRLab": { risk: "unknown", type: "reviewed" },
  "Dhaka Tribune": { risk: "reviewed", type: "reviewed" },
  "DHS": { risk: "unknown", type: "reviewed" },
  "Die Zeit": { risk: "unknown", type: "reviewed" },
  "Digi24": { risk: "reviewed", type: "reviewed" },
  "DigiChina": { risk: "unknown", type: "reviewed" },
  "DL News": { risk: "unknown", type: "unknown" },
  "Dnevnik": { risk: "reviewed", type: "reviewed" },
  "DOJ": { risk: "unknown", type: "reviewed" },
  "Dollar Watch": { risk: "unknown", type: "unknown" },
  "DR Nyheder": { risk: "reviewed", type: "reviewed" },
  "DW News": { risk: "reviewed", type: "reviewed" },
  "DW Turkish": { risk: "unknown", type: "unknown" },
  "Earnings Reports": { risk: "unknown", type: "unknown" },
  "ECB Watch": { risk: "unknown", type: "unknown" },
  "ECFR": { risk: "unknown", type: "unknown" },
  "Economic Data": { risk: "unknown", type: "unknown" },
  "Edmonton Journal": { risk: "reviewed", type: "reviewed" },
  "Efecto Cocuyo": { risk: "reviewed", type: "reviewed" },
  "EFF News": { risk: "unknown", type: "reviewed" },
  "Egypt Independent": { risk: "reviewed", type: "reviewed" },
  "EIA Reports": { risk: "unknown", type: "unknown" },
  "El Mundo": { risk: "unknown", type: "reviewed" },
  "El Pa\xEDs": { risk: "unknown", type: "reviewed" },
  "El Tiempo": { risk: "unknown", type: "unknown" },
  "El Universo": { risk: "unknown", type: "unknown" },
  "Enab Baladi English": { risk: "reviewed", type: "reviewed" },
  "Energy Crisis & Shortages": { risk: "unknown", type: "unknown" },
  "Energy Intel": { risk: "unknown", type: "unknown" },
  "Energy Sanctions": { risk: "unknown", type: "unknown" },
  "Engadget": { risk: "unknown", type: "unknown" },
  "ERR News": { risk: "reviewed", type: "reviewed" },
  "ERT": { risk: "reviewed", type: "reviewed" },
  "ESG in Mining": { risk: "unknown", type: "unknown" },
  "Ethiopia Insight": { risk: "unknown", type: "unknown" },
  "EU Commission Digital": { risk: "unknown", type: "unknown" },
  "EU Digital Policy": { risk: "unknown", type: "unknown" },
  "EU ISS": { risk: "unknown", type: "reviewed" },
  "EU Startups": { risk: "unknown", type: "reviewed" },
  "EU Tech Policy": { risk: "unknown", type: "unknown" },
  "Eurasianet": { risk: "reviewed", type: "reviewed" },
  "EuroNews": { risk: "reviewed", type: "reviewed" },
  "EV Battery Supply": { risk: "unknown", type: "unknown" },
  "FAO GIEWS": { risk: "unknown", type: "reviewed" },
  "FAO News": { risk: "unknown", type: "unknown" },
  "Fars News": { risk: "unknown", type: "unknown" },
  "FAS": { risk: "unknown", type: "unknown" },
  "Fast Company": { risk: "unknown", type: "unknown" },
  "Federal Reserve": { risk: "unknown", type: "reviewed" },
  "FEMA": { risk: "unknown", type: "reviewed" },
  "Financial Post": { risk: "reviewed", type: "reviewed" },
  "Financial Regulation": { risk: "unknown", type: "unknown" },
  "Financial Times": { risk: "reviewed", type: "reviewed" },
  "FinTech LATAM": { risk: "unknown", type: "unknown" },
  "Fintech News": { risk: "unknown", type: "unknown" },
  "First Round Review": { risk: "unknown", type: "unknown" },
  "Focus Taiwan": { risk: "unknown", type: "reviewed" },
  "Folha de S.Paulo": { risk: "unknown", type: "unknown" },
  "Foreign Affairs": { risk: "unknown", type: "reviewed" },
  "Foreign Policy": { risk: "unknown", type: "reviewed" },
  "Forex News": { risk: "unknown", type: "unknown" },
  "Fortune Term Sheet": { risk: "unknown", type: "unknown" },
  "Fox Business": { risk: "reviewed", type: "reviewed" },
  "Fox News": { risk: "unknown", type: "unknown" },
  "FPRI": { risk: "unknown", type: "reviewed" },
  "France 24": { risk: "reviewed", type: "reviewed" },
  "France 24 Africa": { risk: "reviewed", type: "reviewed" },
  "France 24 Asia Pacific": { risk: "reviewed", type: "reviewed" },
  "France 24 LatAm": { risk: "reviewed", type: "reviewed" },
  "Freeport & Copper Miners": { risk: "unknown", type: "unknown" },
  "FT Energy": { risk: "unknown", type: "unknown" },
  "Futures Trading": { risk: "unknown", type: "unknown" },
  "FwdStart Newsletter": { risk: "unknown", type: "unknown" },
  "FX Empire Gold": { risk: "unknown", type: "unknown" },
  "G4Media": { risk: "reviewed", type: "reviewed" },
  "Gazeta Wyborcza": { risk: "reviewed", type: "reviewed" },
  "gCaptain": { risk: "unknown", type: "reviewed" },
  "Geo News": { risk: "unknown", type: "reviewed" },
  "GitHub Blog": { risk: "unknown", type: "unknown" },
  "GitHub Trending": { risk: "unknown", type: "unknown" },
  "GITOC": { risk: "unknown", type: "reviewed" },
  "Glencore & Vale": { risk: "unknown", type: "unknown" },
  "Global Central Banks": { risk: "unknown", type: "unknown" },
  "Global News": { risk: "reviewed", type: "reviewed" },
  "Globe and Mail": { risk: "reviewed", type: "reviewed" },
  "GlobeNewswire": { risk: "reviewed", type: "reviewed" },
  "GMF": { risk: "unknown", type: "reviewed" },
  "GNN Animals": { risk: "unknown", type: "unknown" },
  "GNN Earth": { risk: "unknown", type: "unknown" },
  "GNN Health": { risk: "unknown", type: "unknown" },
  "GNN Heroes": { risk: "unknown", type: "unknown" },
  "GNN Heroes Spotlight": { risk: "unknown", type: "unknown" },
  "GNN Science": { risk: "unknown", type: "unknown" },
  "Gold & Metals": { risk: "unknown", type: "unknown" },
  "Gold Majors": { risk: "unknown", type: "unknown" },
  "Gold Price News": { risk: "unknown", type: "unknown" },
  "Gold Silver Worlds": { risk: "unknown", type: "unknown" },
  "GoldSeek": { risk: "unknown", type: "unknown" },
  "Good Good Good": { risk: "unknown", type: "unknown" },
  "GOOD Magazine": { risk: "unknown", type: "unknown" },
  "Good News Network": { risk: "unknown", type: "unknown" },
  "Greater Good (Berkeley)": { risk: "unknown", type: "unknown" },
  "Guardian Africa": { risk: "reviewed", type: "reviewed" },
  "Guardian Americas": { risk: "unknown", type: "unknown" },
  "Guardian Australia": { risk: "unknown", type: "unknown" },
  "Guardian Caribbean": { risk: "reviewed", type: "reviewed" },
  "Guardian ME": { risk: "unknown", type: "reviewed" },
  "Guardian Pacific": { risk: "reviewed", type: "reviewed" },
  "Guardian Science": { risk: "reviewed", type: "reviewed" },
  "Guardian World": { risk: "reviewed", type: "reviewed" },
  "Gulf FDI": { risk: "unknown", type: "unknown" },
  "Gulf Investments": { risk: "unknown", type: "unknown" },
  "Haaretz": { risk: "reviewed", type: "reviewed" },
  "Hacker News": { risk: "unknown", type: "reviewed" },
  "HaitiLibre English": { risk: "reviewed", type: "reviewed" },
  "Handelsblatt": { risk: "reviewed", type: "reviewed" },
  "Hard Fork (NYT)": { risk: "unknown", type: "reviewed" },
  "Havana Times": { risk: "reviewed", type: "reviewed" },
  "Hedge Fund News": { risk: "unknown", type: "unknown" },
  "Hiiraan Online": { risk: "unknown", type: "unknown" },
  "H\xEDrad\xF3": { risk: "unknown", type: "reviewed" },
  "HotNews": { risk: "reviewed", type: "reviewed" },
  "Housing Market": { risk: "unknown", type: "unknown" },
  "How I Built This": { risk: "unknown", type: "reviewed" },
  "Hromadske": { risk: "reviewed", type: "reviewed" },
  "Hromadske EN": { risk: "reviewed", type: "reviewed" },
  "Human Progress": { risk: "unknown", type: "unknown" },
  "Hurriyet": { risk: "unknown", type: "unknown" },
  "HVG": { risk: "unknown", type: "reviewed" },
  "IAEA": { risk: "reviewed", type: "reviewed" },
  "IEA Critical Minerals": { risk: "unknown", type: "unknown" },
  "IEA News": { risk: "unknown", type: "unknown" },
  "iefimerida": { risk: "unknown", type: "reviewed" },
  "in.gr": { risk: "unknown", type: "reviewed" },
  "Inc42 (India)": { risk: "unknown", type: "reviewed" },
  "Index.hr": { risk: "unknown", type: "reviewed" },
  "Index.hu": { risk: "unknown", type: "reviewed" },
  "India News Network": { risk: "unknown", type: "unknown" },
  "India Startups": { risk: "unknown", type: "unknown" },
  "India Tech News": { risk: "unknown", type: "unknown" },
  "India Tech Policy": { risk: "unknown", type: "unknown" },
  "Indian Express": { risk: "unknown", type: "unknown" },
  "Indonesia Nickel Policy": { risk: "unknown", type: "unknown" },
  "Indonesia Tech": { risk: "unknown", type: "unknown" },
  "Infobae Americas": { risk: "unknown", type: "unknown" },
  "InfoQ": { risk: "unknown", type: "unknown" },
  "InSight Crime": { risk: "unknown", type: "unknown" },
  "Interfax EN": { risk: "reviewed", type: "reviewed" },
  "Interfax RU": { risk: "reviewed", type: "reviewed" },
  "Investing.com News": { risk: "unknown", type: "unknown" },
  "IPO News": { risk: "unknown", type: "unknown" },
  "iPolitics": { risk: "reviewed", type: "reviewed" },
  "Iran International": { risk: "reviewed", type: "reviewed" },
  "IRNA": { risk: "reviewed", type: "reviewed" },
  "Iron Ore Market": { risk: "unknown", type: "unknown" },
  "Irrawaddy": { risk: "unknown", type: "reviewed" },
  "ISEAS (Singapore)": { risk: "unknown", type: "unknown" },
  "Island Times (Palau)": { risk: "unknown", type: "unknown" },
  "ISW": { risk: "reviewed", type: "reviewed" },
  "Jakarta Post": { risk: "unknown", type: "reviewed" },
  "Jamestown": { risk: "unknown", type: "reviewed" },
  "JAMnews": { risk: "reviewed", type: "reviewed" },
  "Janes": { risk: "reviewed", type: "reviewed" },
  "Japan Startups": { risk: "unknown", type: "unknown" },
  "Japan Tech News": { risk: "unknown", type: "unknown" },
  "Japan Times": { risk: "reviewed", type: "reviewed" },
  "Japan Today": { risk: "unknown", type: "unknown" },
  "Jerusalem Post": { risk: "reviewed", type: "reviewed" },
  "Jeune Afrique": { risk: "unknown", type: "unknown" },
  "Jin10": { risk: "reviewed", type: "reviewed" },
  "Jutarnji list": { risk: "unknown", type: "reviewed" },
  "Kathimerini": { risk: "unknown", type: "reviewed" },
  "Kitco Gold": { risk: "unknown", type: "unknown" },
  "Kitco News": { risk: "unknown", type: "unknown" },
  "Korea Startups": { risk: "unknown", type: "unknown" },
  "Korea Tech News": { risk: "unknown", type: "unknown" },
  "KrASIA": { risk: "unknown", type: "unknown" },
  "Krebs Security": { risk: "reviewed", type: "reviewed" },
  "Kyiv Independent": { risk: "reviewed", type: "reviewed" },
  "L'Orient Today": { risk: "reviewed", type: "reviewed" },
  "La Presse": { risk: "reviewed", type: "reviewed" },
  "La Silla Vac\xEDa": { risk: "unknown", type: "unknown" },
  "LATAM Startups": { risk: "unknown", type: "unknown" },
  "Latin America": { risk: "unknown", type: "unknown" },
  "Layoffs News": { risk: "unknown", type: "reviewed" },
  "Layoffs.fyi": { risk: "unknown", type: "reviewed" },
  "Le Devoir": { risk: "reviewed", type: "reviewed" },
  "Le Monde": { risk: "reviewed", type: "reviewed" },
  "Le Quotidien": { risk: "unknown", type: "unknown" },
  "leFaso.net": { risk: "reviewed", type: "reviewed" },
  "Lenny's Newsletter": { risk: "unknown", type: "unknown" },
  "Lex Fridman Tech": { risk: "unknown", type: "unknown" },
  "Liberal GR": { risk: "unknown", type: "reviewed" },
  "Libya Herald": { risk: "reviewed", type: "reviewed" },
  "Lighthouse Reports": { risk: "unknown", type: "reviewed" },
  "Lithium Market": { risk: "unknown", type: "unknown" },
  "Live Science": { risk: "unknown", type: "unknown" },
  "LME Metals": { risk: "unknown", type: "unknown" },
  "Lobsters": { risk: "unknown", type: "unknown" },
  "Lowy Institute": { risk: "unknown", type: "reviewed" },
  "LRT English": { risk: "reviewed", type: "reviewed" },
  "LSM English": { risk: "reviewed", type: "reviewed" },
  "M&A News": { risk: "unknown", type: "unknown" },
  "Maclean's": { risk: "reviewed", type: "reviewed" },
  "Mada Masr": { risk: "reviewed", type: "reviewed" },
  "Market Outlook": { risk: "unknown", type: "unknown" },
  "MarketWatch": { risk: "unknown", type: "reviewed" },
  "MarketWatch Tech": { risk: "unknown", type: "unknown" },
  "Masters of Scale": { risk: "unknown", type: "reviewed" },
  "Meduza": { risk: "reviewed", type: "reviewed" },
  "Mehr News": { risk: "reviewed", type: "unknown" },
  "MENA Startups": { risk: "unknown", type: "unknown" },
  "MENA Tech News": { risk: "unknown", type: "unknown" },
  "Messari": { risk: "unknown", type: "unknown" },
  "Metals Bulletin": { risk: "unknown", type: "unknown" },
  "Mexico News Daily": { risk: "reviewed", type: "reviewed" },
  "Mexico Security": { risk: "unknown", type: "unknown" },
  "Middle East Eye": { risk: "reviewed", type: "reviewed" },
  "Middle East Institute": { risk: "unknown", type: "unknown" },
  "MIIT (China)": { risk: "reviewed", type: "reviewed" },
  "Military Times": { risk: "unknown", type: "reviewed" },
  "Mine Web (SNL)": { risk: "unknown", type: "unknown" },
  "Mining & Resources": { risk: "unknown", type: "unknown" },
  "Mining Journal": { risk: "unknown", type: "unknown" },
  "Mining Regulation": { risk: "unknown", type: "unknown" },
  "Mining Technology": { risk: "unknown", type: "unknown" },
  "Mining Weekly": { risk: "unknown", type: "unknown" },
  "Mining.com": { risk: "unknown", type: "unknown" },
  "MIT Research": { risk: "unknown", type: "unknown" },
  "MIT Tech Policy": { risk: "unknown", type: "unknown" },
  "MIT Tech Review": { risk: "unknown", type: "reviewed" },
  "MOFCOM (China)": { risk: "reviewed", type: "reviewed" },
  "Mongabay": { risk: "unknown", type: "unknown" },
  "Montreal Gazette": { risk: "reviewed", type: "reviewed" },
  "Moscow Times": { risk: "reviewed", type: "reviewed" },
  "MyJoyOnline": { risk: "unknown", type: "unknown" },
  "N1 Croatia": { risk: "unknown", type: "reviewed" },
  "Naftemporiki": { risk: "unknown", type: "reviewed" },
  "Naharnet Lebanon": { risk: "reviewed", type: "reviewed" },
  "Nasdaq-100 & QQQ": { risk: "unknown", type: "unknown" },
  "National Post": { risk: "reviewed", type: "reviewed" },
  "Natural Gas & LNG": { risk: "unknown", type: "unknown" },
  "Natural Gas News": { risk: "unknown", type: "unknown" },
  "Nature News": { risk: "reviewed", type: "reviewed" },
  "NBC News": { risk: "unknown", type: "unknown" },
  "NDTV": { risk: "unknown", type: "unknown" },
  "NDTV India": { risk: "unknown", type: "reviewed" },
  "New Scientist": { risk: "unknown", type: "unknown" },
  "New Unicorns": { risk: "unknown", type: "unknown" },
  "New York Times World": { risk: "reviewed", type: "reviewed" },
  "News24": { risk: "unknown", type: "unknown" },
  "NewsMaker": { risk: "reviewed", type: "reviewed" },
  "NFT News": { risk: "unknown", type: "unknown" },
  "Nickel News": { risk: "unknown", type: "unknown" },
  "Nikkei Asia": { risk: "reviewed", type: "reviewed" },
  "Nikkei Tech": { risk: "unknown", type: "reviewed" },
  "Northern Miner": { risk: "unknown", type: "unknown" },
  "NOS Nieuws": { risk: "unknown", type: "reviewed" },
  "Novaya Gazeta Europe": { risk: "unknown", type: "unknown" },
  "NPR News": { risk: "unknown", type: "reviewed" },
  "NQ Influence Basket": { risk: "unknown", type: "unknown" },
  "NRC": { risk: "unknown", type: "reviewed" },
  "NRK": { risk: "reviewed", type: "reviewed" },
  "NTI": { risk: "unknown", type: "unknown" },
  "Nuclear Energy": { risk: "unknown", type: "unknown" },
  "NV EN": { risk: "reviewed", type: "reviewed" },
  "O Globo": { risk: "unknown", type: "unknown" },
  "OC Media": { risk: "reviewed", type: "reviewed" },
  "OCCRP": { risk: "unknown", type: "reviewed" },
  "OECD Digital": { risk: "unknown", type: "reviewed" },
  "Oil & Gas": { risk: "unknown", type: "unknown" },
  "OilPrice.com": { risk: "unknown", type: "unknown" },
  "OKO.press": { risk: "reviewed", type: "reviewed" },
  "Oman Observer": { risk: "unknown", type: "unknown" },
  "Onet": { risk: "reviewed", type: "reviewed" },
  "OPEC & Crude": { risk: "unknown", type: "unknown" },
  "OPEC News": { risk: "unknown", type: "unknown" },
  "Open Source News": { risk: "unknown", type: "unknown" },
  "OpenAI News": { risk: "unknown", type: "unknown" },
  "Optimist Daily": { risk: "unknown", type: "unknown" },
  "Options Market": { risk: "unknown", type: "unknown" },
  "ORF Tech (India)": { risk: "unknown", type: "unknown" },
  "Oryx OSINT": { risk: "unknown", type: "reviewed" },
  "Ottawa Citizen": { risk: "reviewed", type: "reviewed" },
  "Pajhwok Afghan News": { risk: "reviewed", type: "reviewed" },
  "PAP": { risk: "reviewed", type: "reviewed" },
  "Paul Graham Essays": { risk: "unknown", type: "unknown" },
  "PBoC Watch": { risk: "unknown", type: "unknown" },
  "PBS NewsHour": { risk: "unknown", type: "unknown" },
  "Pentagon": { risk: "unknown", type: "reviewed" },
  "Pipelines & Chokepoints": { risk: "unknown", type: "unknown" },
  "PitchBook News": { risk: "unknown", type: "unknown" },
  "Pivot Podcast": { risk: "unknown", type: "unknown" },
  "Politico": { risk: "unknown", type: "reviewed" },
  "Politico Tech": { risk: "unknown", type: "reviewed" },
  "Polityka": { risk: "reviewed", type: "reviewed" },
  "Polsat News": { risk: "unknown", type: "unknown" },
  "Port & Logistics": { risk: "unknown", type: "unknown" },
  "Port & Terminal": { risk: "unknown", type: "unknown" },
  "Portfolio.hu": { risk: "unknown", type: "reviewed" },
  "Positive.News": { risk: "unknown", type: "unknown" },
  "PR Newswire": { risk: "reviewed", type: "reviewed" },
  "Precious Metals": { risk: "unknown", type: "unknown" },
  "Premium Times": { risk: "unknown", type: "unknown" },
  "Primicias": { risk: "unknown", type: "unknown" },
  "Private Equity": { risk: "unknown", type: "unknown" },
  "Product Hunt": { risk: "unknown", type: "unknown" },
  "Proto Thema": { risk: "unknown", type: "reviewed" },
  "Radio Ndeke Luka": { risk: "reviewed", type: "reviewed" },
  "Radio Okapi": { risk: "unknown", type: "unknown" },
  "Radio Tamazuj": { risk: "unknown", type: "unknown" },
  "Radio-Canada": { risk: "reviewed", type: "reviewed" },
  "RAND": { risk: "unknown", type: "reviewed" },
  "Ransomware.live": { risk: "unknown", type: "unknown" },
  "Rappler": { risk: "unknown", type: "reviewed" },
  "Rare Earths News": { risk: "unknown", type: "unknown" },
  "Reasons to be Cheerful": { risk: "unknown", type: "unknown" },
  "Refinery & Disruptions": { risk: "unknown", type: "unknown" },
  "Renaissance IPO": { risk: "unknown", type: "unknown" },
  "Repubblica": { risk: "unknown", type: "reviewed" },
  "Resource World": { risk: "unknown", type: "unknown" },
  "Responsible Statecraft": { risk: "unknown", type: "reviewed" },
  "Reuters Asia": { risk: "unknown", type: "unknown" },
  "Reuters Business": { risk: "unknown", type: "reviewed" },
  "Reuters Commodities": { risk: "unknown", type: "unknown" },
  "Reuters Crypto": { risk: "unknown", type: "unknown" },
  "Reuters Energy": { risk: "unknown", type: "unknown" },
  "Reuters India": { risk: "unknown", type: "unknown" },
  "Reuters LatAm": { risk: "unknown", type: "unknown" },
  "Reuters Markets": { risk: "unknown", type: "unknown" },
  "Reuters Nasdaq Futures": { risk: "unknown", type: "reviewed" },
  "Reuters Science": { risk: "reviewed", type: "reviewed" },
  "Reuters US": { risk: "unknown", type: "unknown" },
  "Reuters World": { risk: "unknown", type: "reviewed" },
  "RFE/RL Central Asia": { risk: "reviewed", type: "reviewed" },
  "RFI Afrique": { risk: "unknown", type: "unknown" },
  "RIETI (Japan)": { risk: "unknown", type: "unknown" },
  "Rigzone": { risk: "unknown", type: "unknown" },
  "Rio Tinto News": { risk: "unknown", type: "unknown" },
  "Risk & Volatility": { risk: "unknown", type: "unknown" },
  "RT": { risk: "reviewed", type: "reviewed" },
  "RT Russia": { risk: "reviewed", type: "reviewed" },
  "Rudaw": { risk: "unknown", type: "unknown" },
  "RUSI": { risk: "unknown", type: "reviewed" },
  "Rzeczpospolita": { risk: "unknown", type: "unknown" },
  "S&P Global Commodity": { risk: "unknown", type: "unknown" },
  "S&P Global Platts": { risk: "unknown", type: "unknown" },
  "SaaStr": { risk: "unknown", type: "unknown" },
  "Sahel Crisis": { risk: "unknown", type: "unknown" },
  "Sana'a Center": { risk: "reviewed", type: "reviewed" },
  "Schneier": { risk: "unknown", type: "unknown" },
  "ScienceDaily": { risk: "reviewed", type: "reviewed" },
  "SEA Startups": { risk: "unknown", type: "unknown" },
  "SEA Tech News": { risk: "unknown", type: "unknown" },
  "SEC": { risk: "unknown", type: "reviewed" },
  "SEC Filings": { risk: "unknown", type: "unknown" },
  "Seed & Pre-Seed": { risk: "unknown", type: "unknown" },
  "Seeking Alpha": { risk: "unknown", type: "unknown" },
  "Seeking Alpha Metals": { risk: "unknown", type: "unknown" },
  "Seeking Alpha Tech": { risk: "unknown", type: "unknown" },
  "SemiAnalysis": { risk: "unknown", type: "unknown" },
  "Semiconductor News": { risk: "unknown", type: "unknown" },
  "Semiconductors": { risk: "unknown", type: "unknown" },
  "Sequoia Blog": { risk: "unknown", type: "unknown" },
  "Seznam Zpr\xE1vy": { risk: "reviewed", type: "reviewed" },
  "Shareable": { risk: "unknown", type: "unknown" },
  "Shipping & Freight": { risk: "unknown", type: "unknown" },
  "Show HN": { risk: "unknown", type: "unknown" },
  "Sifted (Europe)": { risk: "unknown", type: "reviewed" },
  "Silver Price News": { risk: "unknown", type: "unknown" },
  "SilverSeek": { risk: "unknown", type: "unknown" },
  "Singularity Hub": { risk: "unknown", type: "unknown" },
  "Sky News": { risk: "reviewed", type: "reviewed" },
  "Slidstvo.Info": { risk: "reviewed", type: "reviewed" },
  "South China Morning Post": { risk: "unknown", type: "unknown" },
  "Sovereign Wealth": { risk: "unknown", type: "unknown" },
  "Stablecoin Policy": { risk: "unknown", type: "unknown" },
  "Stanford HAI": { risk: "unknown", type: "reviewed" },
  "Startup Funding": { risk: "unknown", type: "unknown" },
  "Startup School": { risk: "unknown", type: "unknown" },
  "Startups LATAM": { risk: "unknown", type: "unknown" },
  "State Dept": { risk: "reviewed", type: "reviewed" },
  "Stimson Center": { risk: "unknown", type: "reviewed" },
  "Stratechery": { risk: "unknown", type: "reviewed" },
  "Strategic Chokepoints": { risk: "unknown", type: "unknown" },
  "Studio Tamani": { risk: "reviewed", type: "reviewed" },
  "Sunny Skyz": { risk: "unknown", type: "unknown" },
  "Suspilne": { risk: "reviewed", type: "reviewed" },
  "Svenska Dagbladet": { risk: "unknown", type: "reviewed" },
  "SVT Nyheter": { risk: "unknown", type: "reviewed" },
  "Syria Direct": { risk: "reviewed", type: "reviewed" },
  "Ta Nea": { risk: "unknown", type: "reviewed" },
  "Tagesschau": { risk: "unknown", type: "reviewed" },
  "Taipei Times": { risk: "unknown", type: "reviewed" },
  "Taiwan News": { risk: "unknown", type: "reviewed" },
  "Taiwan Tech": { risk: "unknown", type: "unknown" },
  "Tanker & Shipping": { risk: "unknown", type: "unknown" },
  "Task & Purpose": { risk: "unknown", type: "reviewed" },
  "TASS": { risk: "reviewed", type: "reviewed" },
  "Tchadinfos": { risk: "reviewed", type: "reviewed" },
  "Tech Antitrust": { risk: "unknown", type: "unknown" },
  "Tech in Asia": { risk: "unknown", type: "reviewed" },
  "Tech IPO News": { risk: "unknown", type: "unknown" },
  "Tech Newsletters": { risk: "unknown", type: "unknown" },
  "Tech.eu": { risk: "unknown", type: "reviewed" },
  "TechCabal (Africa)": { risk: "unknown", type: "reviewed" },
  "TechCrunch": { risk: "unknown", type: "unknown" },
  "TechCrunch Layoffs": { risk: "unknown", type: "reviewed" },
  "TechCrunch Startups": { risk: "unknown", type: "unknown" },
  "TechCrunch Venture": { risk: "unknown", type: "unknown" },
  "TechMeme": { risk: "unknown", type: "unknown" },
  "Techstars News": { risk: "unknown", type: "unknown" },
  "Telegraph": { risk: "reviewed", type: "reviewed" },
  "Telex": { risk: "unknown", type: "reviewed" },
  "Thai PBS": { risk: "unknown", type: "unknown" },
  "The Astana Times": { risk: "reviewed", type: "reviewed" },
  "The Better India": { risk: "unknown", type: "unknown" },
  "The Block": { risk: "unknown", type: "unknown" },
  "The Daily Star": { risk: "reviewed", type: "reviewed" },
  "The Defiant": { risk: "unknown", type: "unknown" },
  "The Diplomat": { risk: "unknown", type: "reviewed" },
  "The Economist": { risk: "reviewed", type: "reviewed" },
  "The Guardian Post": { risk: "reviewed", type: "reviewed" },
  "The Hacker News": { risk: "reviewed", type: "reviewed" },
  "The Hill": { risk: "unknown", type: "unknown" },
  "The Hindu": { risk: "unknown", type: "unknown" },
  "The Independent": { risk: "reviewed", type: "reviewed" },
  "The Information": { risk: "unknown", type: "unknown" },
  "The Narwhal": { risk: "reviewed", type: "reviewed" },
  "The National": { risk: "unknown", type: "unknown" },
  "The New Stack": { risk: "unknown", type: "unknown" },
  "The Next Web": { risk: "unknown", type: "reviewed" },
  "The Province": { risk: "reviewed", type: "reviewed" },
  "The Reporter Ethiopia": { risk: "unknown", type: "unknown" },
  "The Sentry": { risk: "unknown", type: "reviewed" },
  "The Star (Malaysia)": { risk: "unknown", type: "reviewed" },
  "The Times of Central Asia": { risk: "reviewed", type: "reviewed" },
  "The Tyee": { risk: "reviewed", type: "reviewed" },
  "The Verge": { risk: "unknown", type: "reviewed" },
  "The Verge AI": { risk: "unknown", type: "reviewed" },
  "The War Zone": { risk: "reviewed", type: "reviewed" },
  "ThisDay": { risk: "unknown", type: "unknown" },
  "Times of India": { risk: "reviewed", type: "reviewed" },
  "Times of Israel": { risk: "reviewed", type: "reviewed" },
  "Tom's Hardware": { risk: "unknown", type: "unknown" },
  "Toronto Star": { risk: "reviewed", type: "reviewed" },
  "Trade & Tariffs": { risk: "unknown", type: "unknown" },
  "Trade Routes": { risk: "unknown", type: "unknown" },
  "Trading Tech": { risk: "unknown", type: "unknown" },
  "Treasury": { risk: "unknown", type: "reviewed" },
  "Treasury Watch": { risk: "unknown", type: "unknown" },
  "Trump - Truth Social": { risk: "unknown", type: "unknown" },
  "Tuoi Tre News": { risk: "unknown", type: "unknown" },
  "TVA Nouvelles": { risk: "reviewed", type: "reviewed" },
  "TVN24": { risk: "unknown", type: "unknown" },
  "TVP Info": { risk: "reviewed", type: "reviewed" },
  "TWIST Episodes": { risk: "unknown", type: "unknown" },
  "U.S. Trade Representative": { risk: "reviewed", type: "reviewed" },
  "UK MOD": { risk: "reviewed", type: "reviewed" },
  "UK Tech Policy": { risk: "unknown", type: "unknown" },
  "Ukrainska Pravda": { risk: "reviewed", type: "reviewed" },
  "Ukrainska Pravda EN": { risk: "reviewed", type: "reviewed" },
  "Ukrinform": { risk: "reviewed", type: "reviewed" },
  "UN News": { risk: "reviewed", type: "reviewed" },
  "Unchained": { risk: "unknown", type: "unknown" },
  "UNHCR": { risk: "unknown", type: "reviewed" },
  "Unicorn News": { risk: "unknown", type: "unknown" },
  "Upworthy": { risk: "unknown", type: "unknown" },
  "Uranium Market": { risk: "unknown", type: "unknown" },
  "USNI News": { risk: "unknown", type: "reviewed" },
  "Vancouver Sun": { risk: "reviewed", type: "reviewed" },
  "Vanguard Nigeria": { risk: "unknown", type: "unknown" },
  "VC Insights": { risk: "unknown", type: "unknown" },
  "VC News": { risk: "unknown", type: "unknown" },
  "VentureBeat": { risk: "unknown", type: "unknown" },
  "VentureBeat AI": { risk: "unknown", type: "reviewed" },
  "Verge Shows": { risk: "unknown", type: "unknown" },
  "Vietnam Tech": { risk: "unknown", type: "unknown" },
  "Vision 2030": { risk: "unknown", type: "unknown" },
  "VnExpress": { risk: "unknown", type: "unknown" },
  "VSquare": { risk: "unknown", type: "reviewed" },
  "WAFA English": { risk: "reviewed", type: "reviewed" },
  "Wall Street Journal": { risk: "reviewed", type: "reviewed" },
  "War on the Rocks": { risk: "unknown", type: "reviewed" },
  "Washington Post World": { risk: "reviewed", type: "reviewed" },
  "Welt": { risk: "reviewed", type: "reviewed" },
  "White House": { risk: "unknown", type: "reviewed" },
  "White House Actions": { risk: "unknown", type: "reviewed" },
  "WHO": { risk: "unknown", type: "reviewed" },
  "Wilson Center": { risk: "unknown", type: "reviewed" },
  "Winnipeg Free Press": { risk: "reviewed", type: "reviewed" },
  "Wired": { risk: "reviewed", type: "reviewed" },
  "World Gold Council": { risk: "unknown", type: "unknown" },
  "Wu Blockchain": { risk: "unknown", type: "unknown" },
  "Xinhua": { risk: "reviewed", type: "reviewed" },
  "Y Combinator Blog": { risk: "unknown", type: "unknown" },
  "Yahoo Finance": { risk: "unknown", type: "reviewed" },
  "YC Launches": { risk: "unknown", type: "unknown" },
  "YC News": { risk: "unknown", type: "unknown" },
  "Yemen Online": { risk: "reviewed", type: "reviewed" },
  "Yes! Magazine": { risk: "unknown", type: "unknown" },
  "Yle News": { risk: "reviewed", type: "reviewed" },
  "Ynetnews": { risk: "reviewed", type: "unknown" },
  "Yonhap News": { risk: "unknown", type: "unknown" },
  "YourStory": { risk: "unknown", type: "reviewed" },
  "ZDNet": { risk: "unknown", type: "unknown" },
  "Zerkalo": { risk: "reviewed", type: "reviewed" },
  "Ziarul de Gard\u0103": { risk: "reviewed", type: "reviewed" },
  "ZN.UA": { risk: "reviewed", type: "reviewed" }
});

// shared/x-account-source-tiers.json
var x_account_source_tiers_default = {
  "Al Arabiya": 2,
  "Aurora Intel": 3,
  "BNO News": 1,
  CGTN: 3,
  "Clash Report": 3,
  CrowdStrike: 3,
  "Dark Web Informer": 3,
  DeepState: 3,
  "Department of War": 1,
  Haaretz: 2,
  IDF: 1,
  IRNA: 3,
  "Intel Crab": 3,
  "Jerusalem Post": 2,
  Kaspersky: 3,
  "Kyiv Independent": 2,
  LiveUAMap: 3,
  "Moscow Times": 2,
  NATO: 1,
  "New York Times": 2,
  "OSINT Technical": 3,
  OSINTdefender: 3,
  "Press TV": 3,
  "The CyberWire": 3,
  "The Economist": 2,
  "The Hacker News": 3,
  "Times of Israel": 2,
  "US CENTCOM": 1,
  "Washington Post": 2,
  "vx-underground": 3
};

// shared/x-account-trust.ts
var X_ACCOUNT_TRUST = [
  {
    sourceName: "Al Arabiya",
    tier: 2,
    type: "mainstream",
    risk: "medium",
    stateAffiliated: "Saudi Arabia",
    note: "Saudi-owned Gulf newsroom; established outlet, not a wire",
    reuseRisk: true
  },
  {
    sourceName: "Aurora Intel",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "OSINT aggregator; not a major established newsroom"
  },
  {
    sourceName: "BNO News",
    tier: 1,
    type: "wire",
    risk: "low",
    note: "Independent newsroom and subscription newswire; publisher history: https://bnonews.es/index.php/about-us/"
  },
  {
    sourceName: "Bloomberg",
    tier: 1,
    type: "wire",
    risk: "low",
    note: "Financial wire service with editorial standards",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "Breaking Defense",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Defense trade press; specialty desk, not a wire",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "CGTN",
    tier: 3,
    type: "mainstream",
    risk: "high",
    stateAffiliated: "China",
    note: "Chinese state broadcaster",
    reuseRisk: true
  },
  {
    sourceName: "CISA",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "USA",
    note: "Official US cybersecurity agency publisher; treat statements as government claims",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "CNN World",
    tier: 2,
    type: "mainstream",
    risk: "medium",
    note: "US cable news world desk; established outlet, not a wire",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "Clash Report",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Conflict OSINT aggregator; unverified battlefield claims are common"
  },
  {
    sourceName: "CrowdStrike",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Vendor threat-intel publisher; not independent journalism"
  },
  {
    sourceName: "Dark Web Informer",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Dark-web monitoring aggregator"
  },
  {
    sourceName: "DeepState",
    tier: 3,
    type: "intel",
    risk: "medium",
    knownBiases: ["Pro-Ukraine"],
    note: "Ukrainian OSINT mapping project; high-signal maps, not a wire service"
  },
  {
    sourceName: "Defense One",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Defense trade press; specialty desk, not a wire",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "Haaretz",
    tier: 2,
    type: "mainstream",
    risk: "low",
    note: "Israeli newspaper of record with editorial standards"
  },
  {
    sourceName: "IAEA",
    tier: 1,
    type: "gov",
    risk: "medium",
    note: "UN nuclear watchdog official publisher; treat statements as institutional claims",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "IDF",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "Israel",
    note: "Official IDF publisher on X; treat statements as government claims, not independent observation"
  },
  {
    sourceName: "IRNA",
    tier: 3,
    type: "wire",
    risk: "high",
    stateAffiliated: "Iran",
    note: "Iranian state news agency",
    reuseRisk: true
  },
  {
    sourceName: "Intel Crab",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Military OSINT aggregator; treat as a lead"
  },
  {
    sourceName: "Iran International",
    tier: 3,
    type: "mainstream",
    risk: "medium",
    stateAffiliated: "Saudi Arabia",
    knownBiases: ["Iranian opposition"],
    note: "Saudi-funded Iranian exile broadcaster; established newsroom, not independent of a state sponsor",
    reuseTier: true
  },
  {
    sourceName: "Janes",
    tier: 3,
    type: "intel",
    risk: "low",
    note: "Defense intelligence publisher with editorial standards",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "Jerusalem Post",
    tier: 2,
    type: "mainstream",
    risk: "low",
    note: "English-language Israeli daily of record",
    reuseRisk: true
  },
  {
    sourceName: "Kaspersky",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Vendor research publisher; not independent journalism"
  },
  {
    sourceName: "Krebs Security",
    tier: 3,
    type: "intel",
    risk: "low",
    note: "Independent cybersecurity reporting",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "Kyiv Independent",
    tier: 2,
    type: "mainstream",
    risk: "medium",
    knownBiases: ["Pro-Ukraine"],
    note: "Ukrainian English-language primary",
    reuseType: true,
    reuseRisk: true
  },
  {
    sourceName: "LiveUAMap",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Live conflict-mapping aggregator; source quality varies by incident"
  },
  {
    sourceName: "Moscow Times",
    tier: 2,
    type: "mainstream",
    risk: "medium",
    knownBiases: ["Anti-Kremlin"],
    note: "Independent English-language Russian outlet, critical of Kremlin",
    reuseType: true,
    reuseRisk: true
  },
  {
    sourceName: "NATO",
    tier: 1,
    type: "gov",
    risk: "high",
    note: "Official NATO publisher; treat statements as alliance claims, not independent observation"
  },
  {
    sourceName: "NHK World",
    tier: 2,
    type: "mainstream",
    risk: "medium",
    stateAffiliated: "Japan",
    note: "Japanese public broadcaster English service",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "New York Times",
    tier: 2,
    type: "mainstream",
    risk: "low",
    note: "US newspaper of record with editorial standards"
  },
  {
    sourceName: "Nikkei Asia",
    tier: 2,
    type: "market",
    risk: "low",
    note: "Nikkei English-language Asia desk",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "OSINT Technical",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Technical OSINT aggregator; treat as a lead"
  },
  {
    sourceName: "OSINTdefender",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Military OSINT aggregator; treat as a lead"
  },
  {
    // Renamed from 'Pentagon' (#6654 follow-up). @PentagonPresSec no longer
    // exists: the department rebranded and the account is now @DeptofWar.
    // Beware the neighbours — @WarDepartment, @SecretaryOfWar and @thePentagon
    // are unrelated personal accounts with three-figure follower counts, so
    // only the id verified against the API belongs in a tier-1 slot.
    sourceName: "Department of War",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "USA",
    note: "Official US Department of War publisher; treat statements as government claims"
    // No reuse flags: 'Pentagon' could borrow the existing defense.gov RSS
    // masthead's type/risk, but 'Department of War' is a new public name with
    // no masthead behind it, so this entry must emit its own keys or the
    // account falls through to the tier-4 default and is dropped from alerts.
  },
  {
    sourceName: "Press TV",
    tier: 3,
    type: "mainstream",
    risk: "high",
    stateAffiliated: "Iran",
    note: "Iranian state media",
    reuseRisk: true
  },
  {
    sourceName: "State Dept",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "USA",
    note: "Official US State Department publisher; treat statements as government claims",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "The CyberWire",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Cybersecurity briefing specialist"
  },
  {
    sourceName: "The Economist",
    tier: 2,
    type: "mainstream",
    risk: "low",
    note: "Weekly news magazine with editorial standards"
  },
  {
    sourceName: "The Hacker News",
    tier: 3,
    type: "tech",
    risk: "medium",
    note: "Cybersecurity news specialist; not a general wire"
  },
  {
    sourceName: "The War Zone",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Defense specialty desk; not a wire",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "Times of Israel",
    tier: 2,
    type: "mainstream",
    risk: "low",
    knownBiases: ["Israeli mainstream"],
    note: "English-language Israeli newspaper"
  },
  {
    sourceName: "UK MOD",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "UK",
    note: "Official UK Ministry of Defence publisher; treat statements as government claims",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "UN News",
    tier: 1,
    type: "gov",
    risk: "medium",
    note: "Official UN news publisher; treat statements as institutional claims",
    reuseType: true,
    reuseTier: true
  },
  {
    sourceName: "US CENTCOM",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "USA",
    note: "Official US Central Command publisher; treat statements as government claims"
  },
  {
    sourceName: "Wall Street Journal",
    tier: 1,
    type: "market",
    risk: "low",
    note: "US business newspaper with editorial standards",
    reuseTier: true
  },
  {
    sourceName: "Washington Post",
    tier: 2,
    type: "mainstream",
    risk: "low",
    note: "US national newspaper with editorial standards"
  },
  {
    sourceName: "vx-underground",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Malware-research archive; technical primary, not a newsroom"
  }
];
function xRiskProfile(entry) {
  return {
    risk: entry.risk,
    ...entry.stateAffiliated ? { stateAffiliated: entry.stateAffiliated } : {},
    ...entry.knownBiases ? { knownBiases: entry.knownBiases } : {},
    note: entry.note
  };
}
var X_ACCOUNT_SOURCE_TYPES = Object.fromEntries(
  X_ACCOUNT_TRUST.filter((entry) => !entry.reuseType).map((entry) => [entry.sourceName, entry.type])
);
var X_ACCOUNT_SOURCE_PROPAGANDA_RISK = Object.fromEntries(
  X_ACCOUNT_TRUST.filter((entry) => !entry.reuseRisk).map((entry) => [entry.sourceName, xRiskProfile(entry)])
);
var X_ACCOUNT_SOURCE_TIERS = x_account_source_tiers_default;

// shared/telegram-channel-trust.ts
var TELEGRAM_CHANNEL_TRUST = [
  {
    handle: "InaTEWS_BMKG",
    name: "BMKG InaTEWS",
    tier: 1,
    type: "gov",
    risk: "low",
    stateAffiliated: "Indonesia",
    note: "Official earthquake and tsunami authority; Tier 1 applies to its hazard bulletins. Ownership: https://inatews.bmkg.go.id/eng/detail?day=614&name=20251010093608"
  },
  {
    handle: "dsns_telegram",
    name: "Ukraine State Emergency Service",
    tier: 1,
    type: "gov",
    risk: "medium",
    stateAffiliated: "Ukraine",
    note: "Primary emergency-service reports; attribute incident and conflict claims to the authority. Ownership: https://cpd.gov.ua/announcement/spysok-bezpechnyh-kanaliv-otrymannya-informacziyi/"
  },
  {
    handle: "PikudHaOref_all",
    name: "Israel Home Front Command",
    tier: 1,
    type: "gov",
    risk: "medium",
    stateAffiliated: "Israel",
    note: "Official civil-defense warnings and protective instructions; not independent confirmation of military claims. Ownership: IDF social-account disclosure linked in docs/operations/telegram-source-additions-2026-09-15.md"
  },
  {
    handle: "cnalatest",
    name: "CNA",
    tier: 2,
    type: "mainstream",
    risk: "low",
    stateAffiliated: "Singapore",
    note: "Established Mediacorp newsroom; retain the same CNA publisher identity as RSS. Ownership: https://www.mediacorp.sg/online-links-policy"
  },
  {
    handle: "govsg",
    name: "Singapore Government",
    tier: 1,
    type: "gov",
    risk: "low",
    stateAffiliated: "Singapore",
    note: "Primary source for Singapore government announcements; routine campaigns are not emergency alerts. Ownership: https://www.mddi.gov.sg/what-we-do/public-comms-and-engagement/public-communications/"
  },
  {
    handle: "wamnews_en",
    name: "Emirates News Agency (WAM)",
    tier: 1,
    type: "wire",
    risk: "medium",
    stateAffiliated: "UAE",
    note: "UAE state newswire; attribute government and conflict claims. Official English Telegram link published by https://www.wam.ae/en"
  },
  {
    handle: "SaudiDCD",
    name: "Saudi Civil Defense",
    tier: 1,
    type: "gov",
    risk: "low",
    stateAffiliated: "Saudi Arabia",
    note: "Official Saudi Civil Defense channel (https://t.me/SaudiDCD); primary source for civil-defense warnings and emergency notices. Attribute incident reports to the authority, not independent confirmation"
  },
  {
    handle: "VahidOnline",
    name: "Vahid Online",
    tier: 2,
    type: "intel",
    risk: "medium",
    note: "Independent Iranian journalist. Operational Telegram priority is not a wire-service rating"
  },
  {
    handle: "abualiexpress",
    name: "Abu Ali Express",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Hebrew-language military OSINT channel; treat posts as leads, not confirmation"
  },
  {
    handle: "AuroraIntel",
    name: "Aurora Intel",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "OSINT aggregator; not a major established newsroom"
  },
  {
    handle: "BNONews",
    name: "BNO News",
    tier: 1,
    type: "wire",
    risk: "low",
    note: "Independent newsroom and subscription newswire; publisher history: https://bnonews.es/index.php/about-us/"
  },
  {
    handle: "ClashReport",
    name: "Clash Report",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Conflict OSINT aggregator; unverified battlefield claims are common"
  },
  {
    handle: "DeepStateUA",
    name: "DeepState",
    tier: 3,
    type: "intel",
    risk: "medium",
    knownBiases: ["Pro-Ukraine"],
    note: "Ukrainian OSINT mapping project; high-signal maps, not a wire service"
  },
  {
    handle: "DefenderDome",
    name: "The Defender Dome",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Conflict OSINT aggregator"
  },
  {
    handle: "englishabuali",
    name: "Abu Ali Express EN",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "English edition of Abu Ali Express military OSINT"
  },
  {
    handle: "IranIntl_En",
    name: "Iran International EN",
    tier: 2,
    type: "mainstream",
    risk: "medium",
    stateAffiliated: "Saudi Arabia",
    knownBiases: ["Iranian opposition"],
    note: "Saudi-funded Iranian exile broadcaster; established newsroom, not independent of a state sponsor"
  },
  {
    handle: "kpszsu",
    name: "Air Force of the Armed Forces of Ukraine",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "Ukraine",
    note: "Official Ukrainian Air Force publisher; treat statements as government claims"
  },
  {
    handle: "LiveUAMap",
    name: "LiveUAMap",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Live conflict-mapping aggregator; source quality varies by incident"
  },
  {
    handle: "OSINTdefender",
    name: "OSINTdefender",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Military OSINT aggregator; treat as a lead"
  },
  {
    handle: "OsintUpdates",
    name: "Osint Updates",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Breaking OSINT aggregator"
  },
  {
    handle: "bellingcat",
    name: "Bellingcat",
    tier: 3,
    type: "intel",
    risk: "low",
    note: "Open-source investigations, methodology transparent",
    reuseExisting: true
  },
  {
    handle: "CyberDetective",
    name: "CyberDetective",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Cyber OSINT specialist"
  },
  {
    handle: "GeopoliticalCenter",
    name: "GeopoliticalCenter",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Geopolitical commentary aggregator"
  },
  {
    handle: "Middle_East_Spectator",
    name: "Middle East Spectator",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Middle East OSINT aggregator"
  },
  {
    handle: "MiddleEastNow_Breaking",
    name: "Middle East Now Breaking",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Regional breaking-news aggregator"
  },
  {
    handle: "nexta_tv",
    name: "NEXTA",
    tier: 3,
    type: "mainstream",
    risk: "medium",
    knownBiases: ["Belarusian opposition"],
    note: "Belarusian opposition media; useful primary, not a wire"
  },
  {
    handle: "OSINTIndustries",
    name: "OSINT Industries",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Commercial OSINT vendor channel"
  },
  {
    handle: "Osintlatestnews",
    name: "OSIntOps News",
    tier: 4,
    type: "intel",
    risk: "medium",
    note: "Anonymous OSINT news aggregator; not an editorial newsroom"
  },
  {
    handle: "osintlive",
    name: "OSINT Live",
    tier: 4,
    type: "intel",
    risk: "medium",
    note: "Anonymous OSINT aggregator"
  },
  {
    handle: "OsintTv",
    name: "OsintTV",
    tier: 4,
    type: "intel",
    risk: "medium",
    note: "Anonymous OSINT video aggregator"
  },
  {
    handle: "spectatorindex",
    name: "The Spectator Index",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Headline aggregator; speed over original reporting"
  },
  {
    handle: "wfwitness",
    name: "Witness",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Conflict-witness aggregator"
  },
  {
    handle: "war_monitor",
    name: "monitor",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Ukraine-focused conflict monitor; label matches the product-managed channel list"
  },
  {
    handle: "nayaforiraq",
    name: "Naya for Iraq",
    tier: 3,
    type: "mainstream",
    risk: "medium",
    note: "Iraq-focused regional desk"
  },
  {
    handle: "yediotnews25",
    name: "Yedioth News",
    tier: 2,
    type: "mainstream",
    risk: "low",
    knownBiases: ["Israeli mainstream"],
    note: "Yedioth Ahronoth Telegram desk; same newsroom family as Ynetnews"
  },
  {
    handle: "DDGeopolitics",
    name: "DD Geopolitics",
    tier: 4,
    type: "intel",
    risk: "medium",
    knownBiases: ["Pro-Russia"],
    note: "Anonymous partisan aggregator; not independent journalism"
  },
  {
    handle: "FotrosResistancee",
    name: "Fotros Resistance",
    tier: 4,
    type: "intel",
    risk: "medium",
    knownBiases: ["Iran-aligned resistance"],
    note: "Partisan resistance channel; treat as advocacy, not reporting"
  },
  {
    handle: "RezistanceTrench1",
    name: "Resistance Trench",
    tier: 4,
    type: "intel",
    risk: "medium",
    knownBiases: ["Iran-aligned resistance"],
    note: "Partisan resistance channel; treat as advocacy, not reporting"
  },
  {
    handle: "geopolitics_prime",
    name: "Geopolitics Prime",
    tier: 4,
    type: "intel",
    risk: "medium",
    note: "State-adjacent geopolitical aggregator; not an independent newsroom"
  },
  {
    handle: "thecradlemedia",
    name: "The Cradle",
    tier: 3,
    type: "mainstream",
    risk: "medium",
    knownBiases: ["West-Asia alignment"],
    note: "West Asia analytical outlet with a disclosed editorial line"
  },
  {
    handle: "LebUpdate",
    name: "Lebanon Update",
    tier: 3,
    type: "mainstream",
    risk: "medium",
    note: "Lebanon breaking-news aggregator"
  },
  {
    handle: "middleeastobserver",
    name: "Middle East Observer",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Regional observer/OSINT desk"
  },
  {
    handle: "MiddleEastEye_TG",
    name: "Middle East Eye",
    tier: 2,
    type: "mainstream",
    risk: "medium",
    stateAffiliated: "Qatar",
    note: "Qatar-linked Middle East newsroom; established outlet, not a wire"
  },
  {
    handle: "dragonwatch",
    name: "Dragon Watch",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Indo-Pacific OSINT aggregator"
  },
  {
    handle: "IDFofficial",
    name: "IDF Official",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "Israel",
    note: "Official IDF publisher; treat statements as government claims, not independent observation"
  },
  {
    handle: "RocketAlert",
    name: "Rocket Alert",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "Israel",
    note: "Official Israeli civilian rocket-alert publisher; values are primary government claims"
  },
  {
    handle: "sepah",
    name: "IRGC Official",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "Iran",
    note: "Official IRGC publisher; treat statements as government claims"
  },
  {
    handle: "defapress_ir",
    name: "DefaPress (Iran MOD)",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "Iran",
    note: "Iranian Ministry of Defence publisher; treat statements as government claims"
  },
  {
    handle: "TasnimNewsEN",
    name: "Tasnim News EN",
    tier: 3,
    type: "mainstream",
    risk: "high",
    stateAffiliated: "Iran",
    note: "Iranian state-affiliated outlet; not a wire service"
  },
  {
    handle: "PressTV",
    name: "PressTV (Iran State)",
    tier: 3,
    type: "mainstream",
    risk: "high",
    stateAffiliated: "Iran",
    note: 'Iranian state media Telegram desk; distinct key from RSS "Press TV"'
  },
  {
    handle: "FarsNews_EN",
    name: "Fars News EN",
    tier: 3,
    type: "mainstream",
    risk: "high",
    stateAffiliated: "Iran",
    note: 'Iranian state-affiliated outlet; distinct key from RSS "Fars News"'
  },
  {
    handle: "SaberinFa",
    name: "Saberin (IRGC Intel)",
    tier: 1,
    type: "gov",
    risk: "high",
    stateAffiliated: "Iran",
    note: "IRGC-linked intelligence publisher; treat statements as government claims"
  },
  {
    handle: "warfareanalysis",
    name: "Warfare Analysis",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Military analysis/OSINT desk"
  },
  {
    handle: "rnintel",
    name: "RN Intel",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "OSINT aggregator"
  },
  {
    handle: "bintjbeilnews",
    name: "Bint Jbeil News",
    tier: 3,
    type: "mainstream",
    risk: "medium",
    note: "Southern Lebanon local desk in a polarized media environment"
  },
  {
    handle: "HAMASW",
    name: "Hamas-Israel War",
    tier: 4,
    type: "intel",
    risk: "medium",
    knownBiases: ["Faction-aligned"],
    note: "Faction-aligned war aggregator; not an editorial newsroom"
  },
  {
    handle: "QudsNen",
    name: "Quds News",
    tier: 4,
    type: "intel",
    risk: "medium",
    knownBiases: ["Faction-aligned"],
    note: "Faction-aligned aggregator; treat as advocacy, not reporting"
  },
  {
    handle: "Alsaa_plus_EN",
    name: "Al-Saa EN",
    tier: 3,
    type: "mainstream",
    risk: "medium",
    note: "Arabic-to-English regional desk"
  },
  {
    handle: "GeoPWatch",
    name: "GeoPol Watch",
    tier: 4,
    type: "intel",
    risk: "medium",
    note: "Anonymous geopolitical aggregator"
  },
  {
    handle: "dropsitenews",
    name: "Drop Site News",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Investigative digital outlet; specialty desk, not a wire"
  },
  {
    handle: "france24_en",
    name: "France 24 EN",
    tier: 2,
    type: "mainstream",
    risk: "medium",
    stateAffiliated: "France",
    note: 'French state-funded broadcaster Telegram desk; editorially independent charter, distinct key from RSS "France 24"'
  },
  {
    handle: "kianmeli1",
    name: "Kian Meli (Iran)",
    tier: 4,
    type: "intel",
    risk: "medium",
    note: "Unverified personal Iran desk; not a reviewed newsroom"
  },
  {
    handle: "TimesofIsrael",
    name: "Times of Israel",
    tier: 2,
    type: "mainstream",
    risk: "low",
    knownBiases: ["Israeli mainstream"],
    note: "English-language Israeli newspaper Telegram desk"
  },
  {
    handle: "thehackernews",
    name: "The Hacker News",
    tier: 3,
    type: "tech",
    risk: "medium",
    note: "Cybersecurity news specialist; not a general wire"
  },
  {
    handle: "cybersecboardrm",
    name: "Cybersecurity Boardroom",
    tier: 3,
    type: "tech",
    risk: "medium",
    note: "Cybersecurity industry aggregator"
  },
  {
    handle: "securelist",
    name: "Securelist by Kaspersky",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Kaspersky research blog; vendor research, not independent journalism"
  },
  {
    handle: "DarkWebInformer",
    name: "Dark Web Informer",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Dark-web monitoring aggregator"
  },
  {
    handle: "CYBERWARCOM",
    name: "CYBERWAR.COM",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Cyber-conflict aggregator"
  },
  {
    handle: "thecyberwire",
    name: "The CyberWire",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Cybersecurity briefing specialist"
  },
  {
    handle: "vxunderground",
    name: "vx-underground",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Malware-research archive; technical primary, not a newsroom"
  },
  {
    handle: "falconfeeds",
    name: "FalconFeeds.io",
    tier: 3,
    type: "intel",
    risk: "medium",
    note: "Commercial threat-intel feed"
  }
];
function telegramRiskProfile(entry) {
  return {
    risk: entry.risk,
    ...entry.stateAffiliated ? { stateAffiliated: entry.stateAffiliated } : {},
    ...entry.knownBiases ? { knownBiases: entry.knownBiases } : {},
    note: entry.note
  };
}
var TELEGRAM_SOURCE_TYPES = Object.fromEntries(
  TELEGRAM_CHANNEL_TRUST.filter((entry) => !entry.reuseExisting).map((entry) => [entry.name, entry.type])
);
var TELEGRAM_SOURCE_PROPAGANDA_RISK = Object.fromEntries(
  TELEGRAM_CHANNEL_TRUST.filter((entry) => !entry.reuseExisting).map((entry) => [entry.name, telegramRiskProfile(entry)])
);
var TELEGRAM_SOURCE_TIERS = Object.fromEntries(
  TELEGRAM_CHANNEL_TRUST.filter((entry) => !entry.reuseExisting).map((entry) => [entry.name, entry.tier])
);
var TELEGRAM_HANDLE_TO_PUBLIC_NAME = Object.fromEntries(
  TELEGRAM_CHANNEL_TRUST.map((entry) => [entry.handle, entry.name])
);
function normalizeTelegramHandle(handle) {
  return handle.trim().replace(/^@/, "").toLowerCase();
}
var TELEGRAM_NORMALIZED_HANDLE_TO_PUBLIC_NAME = (() => {
  const entries = /* @__PURE__ */ new Map();
  for (const entry of TELEGRAM_CHANNEL_TRUST) {
    const normalizedHandle = normalizeTelegramHandle(entry.handle);
    if (entries.has(normalizedHandle)) {
      throw new Error(`Duplicate Telegram trust handle: ${entry.handle}`);
    }
    entries.set(normalizedHandle, entry.name);
  }
  return entries;
})();

// shared/source-provenance.ts
var SOURCE_TYPES = {
  // Wire services - fastest, most authoritative
  "Reuters": "wire",
  "Reuters World": "wire",
  "Reuters Business": "wire",
  "Reuters Nasdaq Futures": "wire",
  "AP News": "wire",
  "AFP": "wire",
  "Bloomberg": "wire",
  // Government & International Org sources
  "White House": "gov",
  "White House Actions": "gov",
  "State Dept": "gov",
  "Pentagon": "gov",
  "Treasury": "gov",
  "DOJ": "gov",
  "DHS": "gov",
  "CDC": "gov",
  "FEMA": "gov",
  "Federal Reserve": "gov",
  "SEC": "gov",
  "U.S. Trade Representative": "gov",
  "UN News": "gov",
  "CISA": "gov",
  // Direct official military publishers. Their claims remain publisher claims,
  // not independent ADS-B/AIS observations.
  "Taiwan Ministry of National Defense": "gov",
  "Japan Joint Staff": "gov",
  // Chinese government ministries (Tier 1 official sources — not wire/verified outlets)
  "CAC (China)": "gov",
  "SAMR (China)": "gov",
  "MIIT (China)": "gov",
  "MOFCOM (China)": "gov",
  "NDRC (China)": "gov",
  "NBS (China)": "gov",
  "PBoC (China)": "gov",
  "SAFE (China)": "gov",
  "GACC (China)": "gov",
  "Shanghai Financial Portal (People\u2019s Bank of China republication)": "gov",
  // Intel/Defense specialty
  "Defense One": "intel",
  "Breaking Defense": "intel",
  "The War Zone": "intel",
  "Defense News": "intel",
  "Janes": "intel",
  "Military Times": "intel",
  "Task & Purpose": "intel",
  "USNI News": "intel",
  "gCaptain": "intel",
  "Oryx OSINT": "intel",
  "UK MOD": "gov",
  "Bellingcat": "intel",
  "Krebs Security": "intel",
  "Foreign Policy": "intel",
  "The Diplomat": "intel",
  "Atlantic Council": "intel",
  "Foreign Affairs": "intel",
  "CrisisWatch": "intel",
  "CSIS": "intel",
  "RAND": "intel",
  "Brookings": "intel",
  "Carnegie": "intel",
  "IAEA": "gov",
  "WHO": "gov",
  "UNHCR": "gov",
  "Xinhua": "wire",
  "TASS": "wire",
  "RT": "wire",
  "RT Russia": "wire",
  "NHK World": "mainstream",
  "Nikkei Asia": "market",
  // Independent RU exile / UA English primary (default-eligible under #5950 balance rule)
  "Meduza": "mainstream",
  "Moscow Times": "mainstream",
  "Kyiv Independent": "mainstream",
  // Ukraine depth pack (#5951) + uk native pack (#5959)
  "Ukrinform": "wire",
  "Suspilne": "mainstream",
  "Ukrainska Pravda EN": "mainstream",
  "NV EN": "mainstream",
  "Hromadske EN": "mainstream",
  "ISW": "intel",
  "Ukrainska Pravda": "mainstream",
  "Hromadske": "mainstream",
  "Bihus.Info": "intel",
  "Slidstvo.Info": "intel",
  "ZN.UA": "mainstream",
  // Mainstream outlets
  "BBC World": "mainstream",
  "BBC Middle East": "mainstream",
  "Guardian World": "mainstream",
  "Guardian ME": "mainstream",
  "Guardian Africa": "mainstream",
  "Guardian Caribbean": "mainstream",
  "Guardian Pacific": "mainstream",
  "France 24 Africa": "mainstream",
  "France 24 Asia Pacific": "mainstream",
  "France 24 LatAm": "mainstream",
  "Mexico News Daily": "mainstream",
  "NPR News": "mainstream",
  "Al Jazeera": "mainstream",
  "CNN World": "mainstream",
  "Politico": "mainstream",
  "Axios": "mainstream",
  "EuroNews": "mainstream",
  "France 24": "mainstream",
  "Le Monde": "mainstream",
  // European Addition
  "El Pa\xEDs": "mainstream",
  "El Mundo": "mainstream",
  "BBC Mundo": "mainstream",
  "Tagesschau": "mainstream",
  "Der Spiegel": "mainstream",
  "Die Zeit": "mainstream",
  "DW News": "mainstream",
  "ANSA": "wire",
  "Corriere della Sera": "mainstream",
  "Repubblica": "mainstream",
  "Handelsblatt": "market",
  "Welt": "mainstream",
  "Telegraph": "mainstream",
  "Interfax RU": "wire",
  "Interfax EN": "wire",
  "NOS Nieuws": "mainstream",
  "NRC": "mainstream",
  "De Telegraaf": "mainstream",
  // Croatian (HR)
  "N1 Croatia": "mainstream",
  "Index.hr": "mainstream",
  "Jutarnji list": "mainstream",
  "Balkan Insight": "intel",
  // Romanian (RO) — Eastern flank (#5952)
  "Digi24": "mainstream",
  "HotNews": "mainstream",
  "G4Media": "mainstream",
  // Bulgarian (BG) — Black Sea flank (#5952)
  "Dnevnik": "mainstream",
  // Greek (EL) — locale-boosted; Kathimerini is the EN strategic default
  "Kathimerini": "mainstream",
  "Naftemporiki": "mainstream",
  "in.gr": "mainstream",
  "iefimerida": "mainstream",
  "Proto Thema": "mainstream",
  "ERT": "mainstream",
  "AMNA": "wire",
  "Ta Nea": "mainstream",
  "Liberal GR": "mainstream",
  "CNN Greece": "mainstream",
  // Baltic states — Eastern flank (#5952)
  "ERR News": "mainstream",
  "LRT English": "mainstream",
  "LSM English": "mainstream",
  // Turkey EN path (#5952)
  "Daily Sabah": "mainstream",
  // Polish (PL) depth — catalog opt-in, locale-boosted
  "PAP": "wire",
  "Gazeta Wyborcza": "mainstream",
  "Polityka": "mainstream",
  "Onet": "mainstream",
  "OKO.press": "intel",
  "TVP Info": "mainstream",
  // Czech (CS) — V4 balance (#5952)
  "Seznam Zpr\xE1vy": "mainstream",
  // Hindi (HI)
  "BBC Hindi": "mainstream",
  "Aaj Tak": "mainstream",
  "NDTV India": "mainstream",
  "Amar Ujala": "mainstream",
  // Hungarian (HU)
  "Telex": "mainstream",
  "Index.hu": "mainstream",
  "HVG": "mainstream",
  "444.hu": "mainstream",
  "24.hu": "mainstream",
  "H\xEDrad\xF3": "mainstream",
  "ATV": "mainstream",
  "Portfolio.hu": "market",
  "SVT Nyheter": "mainstream",
  "Dagens Nyheter": "mainstream",
  "Svenska Dagbladet": "mainstream",
  // Canada + Arctic/Nordic pack (#5960) + depth pack (#6604/#6605)
  "CBC News": "mainstream",
  "Globe and Mail": "mainstream",
  "Global News": "mainstream",
  "Toronto Star": "mainstream",
  "National Post": "mainstream",
  "Financial Post": "market",
  "iPolitics": "mainstream",
  "The Narwhal": "mainstream",
  "The Tyee": "mainstream",
  "Maclean's": "mainstream",
  "Radio-Canada": "mainstream",
  "La Presse": "mainstream",
  "Le Devoir": "mainstream",
  "TVA Nouvelles": "mainstream",
  "Vancouver Sun": "mainstream",
  "Calgary Herald": "mainstream",
  "Winnipeg Free Press": "mainstream",
  "Edmonton Journal": "mainstream",
  "Ottawa Citizen": "mainstream",
  "The Province": "mainstream",
  "CTV News": "mainstream",
  "CP24": "mainstream",
  "Montreal Gazette": "mainstream",
  "Yle News": "mainstream",
  "NRK": "mainstream",
  "Aftenposten": "mainstream",
  "DR Nyheder": "mainstream",
  "Arctic Today": "mainstream",
  // Brazilian Addition
  "Brasil Paralelo": "mainstream",
  // Market/Finance
  "CNBC": "market",
  "MarketWatch": "market",
  "Yahoo Finance": "market",
  "Financial Times": "market",
  "Fox Business": "market",
  "Business Insider": "market",
  "Jin10": "market",
  "Coinbase Blog": "market",
  "Binance Announcements": "market",
  // Press-release distribution is publisher-submitted content. Do not label
  // these feeds as independent wire reporting.
  "GlobeNewswire": "other",
  "Business Wire": "other",
  "PR Newswire": "other",
  "Chainwire": "other",
  "Shanghai Stock Exchange": "market",
  "Shenzhen Stock Exchange": "market",
  // Tech
  "Hacker News": "tech",
  "Ars Technica": "tech",
  "The Verge": "tech",
  "The Verge AI": "tech",
  "MIT Tech Review": "tech",
  "TechCrunch Layoffs": "tech",
  "AI News": "tech",
  "ArXiv AI": "tech",
  "VentureBeat AI": "tech",
  "Wired": "tech",
  "Layoffs.fyi": "tech",
  "Layoffs News": "tech",
  // Regional Tech Startups
  "EU Startups": "tech",
  "Tech.eu": "tech",
  "Sifted (Europe)": "tech",
  "The Next Web": "tech",
  "Tech in Asia": "tech",
  "e27 (SEA)": "tech",
  "DealStreetAsia": "tech",
  "Pandaily (China)": "tech",
  "36Kr English": "tech",
  "TechNode (China)": "tech",
  "The Bridge (Japan)": "tech",
  "Nikkei Tech": "tech",
  "Inc42 (India)": "tech",
  "YourStory": "tech",
  "TechCabal (Africa)": "tech",
  "Wamda (MENA)": "tech",
  "Magnitt": "tech",
  // Think Tanks & Policy
  "Brookings Tech": "intel",
  "CSIS Tech": "intel",
  "Stanford HAI": "intel",
  "AI Now Institute": "intel",
  "OECD Digital": "intel",
  "Bruegel (EU)": "intel",
  "Chatham House Tech": "intel",
  "DigiChina": "intel",
  "Lowy Institute": "intel",
  "EFF News": "intel",
  "Politico Tech": "intel",
  // Security/Defense Think Tanks
  "RUSI": "intel",
  "Wilson Center": "intel",
  "GMF": "intel",
  "Stimson Center": "intel",
  "CNAS": "intel",
  // Nuclear & Arms Control
  "Arms Control Assn": "intel",
  "Bulletin of Atomic Scientists": "intel",
  // Food Security & Regional
  "FAO GIEWS": "gov",
  "EU ISS": "intel",
  // Investigative journalism & accountability
  "OCCRP": "intel",
  "DFRLab": "intel",
  "Lighthouse Reports": "intel",
  "The Sentry": "intel",
  "GITOC": "intel",
  "VSquare": "intel",
  "Correctiv": "intel",
  // New verified think tanks
  "War on the Rocks": "intel",
  "AEI": "intel",
  "Responsible Statecraft": "intel",
  "FPRI": "intel",
  "Jamestown": "intel",
  // Podcasts & Newsletters
  "Acquired Podcast": "tech",
  "All-In Podcast": "tech",
  "a16z Podcast": "tech",
  "This Week in Startups": "tech",
  "The Twenty Minute VC": "tech",
  "Hard Fork (NYT)": "tech",
  "Pivot (Vox)": "tech",
  "Stratechery": "tech",
  "Benedict Evans": "tech",
  "How I Built This": "tech",
  "Masters of Scale": "tech",
  // Periphery packs (#5953) — Caucasus
  "Civil.ge": "mainstream",
  "OC Media": "mainstream",
  "JAMnews": "mainstream",
  "Azertag": "wire",
  "Armenpress": "wire",
  // Periphery packs (#5953) — Belarus / Moldova
  "Zerkalo": "mainstream",
  "NewsMaker": "mainstream",
  "Ziarul de Gard\u0103": "mainstream",
  // Periphery packs (#5953) — Central Asia
  "Eurasianet": "mainstream",
  "RFE/RL Central Asia": "mainstream",
  "The Astana Times": "mainstream",
  "The Times of Central Asia": "mainstream",
  // Indo-Pacific feeds (#5954)
  "Focus Taiwan": "wire",
  "Taipei Times": "mainstream",
  "Taiwan News": "mainstream",
  "Dawn": "mainstream",
  "Geo News": "mainstream",
  "Jakarta Post": "mainstream",
  "Rappler": "mainstream",
  "The Star (Malaysia)": "mainstream",
  "Irrawaddy": "mainstream",
  // Validated crisis desks (#6813-#6830)
  "Yemen Online": "mainstream",
  "Sana'a Center": "intel",
  "Syria Direct": "mainstream",
  "Enab Baladi English": "mainstream",
  "+972 Magazine": "mainstream",
  "WAFA English": "gov",
  "HaitiLibre English": "mainstream",
  "AyiboPost": "mainstream",
  "Amu TV": "mainstream",
  "Pajhwok Afghan News": "wire",
  "Naharnet Lebanon": "mainstream",
  "L'Orient Today": "mainstream",
  "Annahar": "mainstream",
  // Major publishers added after the 2026-10-16 Google News World audit. The
  // Economist, Times of Israel and Middle East Eye are typed by the social
  // overlays spread below, which own those names.
  "New York Times World": "mainstream",
  "Washington Post World": "mainstream",
  "The Independent": "mainstream",
  "Sky News": "mainstream",
  "Japan Times": "mainstream",
  // The BBC's UK desks, added after the 2026-10-17 audit.
  "BBC UK": "mainstream",
  "BBC Northern Ireland": "mainstream",
  // Science panel sources (2026-10-17 audit).
  "Reuters Science": "wire",
  "Nature News": "mainstream",
  "BBC Science": "mainstream",
  "Guardian Science": "mainstream",
  "ScienceDaily": "other",
  "Studio Tamani": "mainstream",
  "leFaso.net": "mainstream",
  "ActuNiger": "mainstream",
  "A\xEFr Info": "mainstream",
  "Caracas Chronicles": "mainstream",
  "Efecto Cocuyo": "mainstream",
  "Havana Times": "mainstream",
  "14ymedio": "mainstream",
  "Libya Herald": "mainstream",
  "Egypt Independent": "mainstream",
  "Mada Masr": "mainstream",
  "The Daily Star": "mainstream",
  "Dhaka Tribune": "mainstream",
  "Daily Nation": "mainstream",
  "Times of India": "mainstream",
  "The Guardian Post": "mainstream",
  "Tchadinfos": "mainstream",
  "Alwihda Info": "mainstream",
  "Radio Ndeke Luka": "mainstream",
  // Telegram channels (#6600). Additive keys keyed by channel display label.
  ...TELEGRAM_SOURCE_TYPES,
  // Curated X news-account overlay (#6654). Additive to Telegram.
  ...X_ACCOUNT_SOURCE_TYPES
};
function getSourceType(sourceName) {
  return SOURCE_TYPES[sourceName] ?? "unknown";
}
function hasReviewedSourceType(sourceName) {
  return Object.prototype.hasOwnProperty.call(SOURCE_TYPES, sourceName);
}
function hasDeclaredSourceType(sourceName) {
  return hasReviewedSourceType(sourceName) || Object.prototype.hasOwnProperty.call(CONFIGURED_SOURCE_PROVENANCE_DECLARATIONS, sourceName);
}
var UNREVIEWED_SOURCE_RISK = Object.freeze({
  risk: "unknown",
  note: "Provenance not yet reviewed \u2014 do not treat as independent journalism"
});
var SOURCE_PROPAGANDA_RISK = {
  // High risk - State-controlled media
  "Xinhua": { risk: "high", stateAffiliated: "China", note: "Official CCP news agency" },
  "TASS": { risk: "high", stateAffiliated: "Russia", note: "Russian state news agency" },
  "RT": { risk: "high", stateAffiliated: "Russia", note: "Russian state media, banned in EU" },
  "RT Russia": { risk: "high", stateAffiliated: "Russia", note: "Russian state media, Russia desk" },
  "Sputnik": { risk: "high", stateAffiliated: "Russia", note: "Russian state media" },
  "CGTN": { risk: "high", stateAffiliated: "China", note: "Chinese state broadcaster" },
  "Press TV": { risk: "high", stateAffiliated: "Iran", note: "Iranian state media" },
  "IRNA": { risk: "high", stateAffiliated: "Iran", note: "Iranian state news agency (Islamic Republic News Agency)" },
  "Mehr News": { risk: "high", stateAffiliated: "Iran", note: "Iranian state-affiliated, Basij-linked" },
  "KCNA": { risk: "high", stateAffiliated: "North Korea", note: "North Korean state media" },
  // Official Chinese ministry feeds (government sources, not independent media)
  "MIIT (China)": {
    risk: "high",
    stateAffiliated: "China",
    note: "Chinese Ministry of Industry and Information Technology official feed"
  },
  "MOFCOM (China)": {
    risk: "high",
    stateAffiliated: "China",
    note: "Chinese Ministry of Commerce official feed"
  },
  // Official exchange authorities. These are authoritative primary publishers,
  // not independent journalism; omit stateAffiliated so the shared validator
  // does not conflate an exchange authority with state-controlled media.
  "Shanghai Stock Exchange": {
    risk: "high",
    note: "Official mainland China exchange authority; metadata-only source"
  },
  "Shenzhen Stock Exchange": {
    risk: "high",
    note: "Official mainland China exchange authority; metadata-only source"
  },
  "Taiwan Ministry of National Defense": {
    risk: "high",
    stateAffiliated: "Taiwan",
    note: "Direct government activity reports; treat values as official publisher claims, not independent observations"
  },
  "Japan Joint Staff": {
    risk: "high",
    stateAffiliated: "Japan",
    note: "Direct government activity reports; only manually reviewed documents are admitted as regional augmentation"
  },
  "CAC (China)": {
    risk: "high",
    stateAffiliated: "China",
    note: "Cyberspace Administration of China official publication"
  },
  "SAMR (China)": {
    risk: "high",
    stateAffiliated: "China",
    note: "State Administration for Market Regulation official publication"
  },
  "NDRC (China)": {
    risk: "high",
    stateAffiliated: "China",
    note: "National Development and Reform Commission official publication"
  },
  "NBS (China)": {
    risk: "high",
    stateAffiliated: "China",
    note: "National Bureau of Statistics of China official data release"
  },
  "PBoC (China)": {
    risk: "high",
    stateAffiliated: "China",
    note: "People's Bank of China official publication"
  },
  "Shanghai Financial Portal (People\u2019s Bank of China republication)": {
    risk: "high",
    stateAffiliated: "China",
    note: "Shanghai municipal financial office republication of credited PBOC numeric data"
  },
  "SAFE (China)": {
    risk: "high",
    stateAffiliated: "China",
    note: "State Administration of Foreign Exchange official data release"
  },
  "GACC (China)": {
    risk: "high",
    stateAffiliated: "China",
    note: "General Administration of Customs of China official data release"
  },
  "U.S. Trade Representative": {
    risk: "high",
    stateAffiliated: "USA",
    note: "Official U.S. government trade-policy publication; treat statements as primary government claims"
  },
  // Medium risk - State-affiliated or known bias
  "Al Jazeera": { risk: "medium", stateAffiliated: "Qatar", note: "Qatari state-funded, independent editorial" },
  "Al Arabiya": { risk: "medium", stateAffiliated: "Saudi Arabia", note: "Saudi-owned, reflects Gulf perspective" },
  "TRT World": { risk: "medium", stateAffiliated: "Turkey", note: "Turkish state broadcaster" },
  "France 24": { risk: "medium", stateAffiliated: "France", note: "French state-funded, editorially independent" },
  "France 24 Africa": { risk: "medium", stateAffiliated: "France", note: "French state-funded, editorially independent" },
  "France 24 Asia Pacific": { risk: "medium", stateAffiliated: "France", note: "French state-funded, editorially independent" },
  "France 24 LatAm": { risk: "medium", stateAffiliated: "France", note: "French state-funded, editorially independent" },
  "EuroNews": { risk: "low", note: "European public broadcaster consortium", knownBiases: ["Pro-EU"] },
  "Le Monde": { risk: "low", note: "French newspaper of record" },
  "DW News": { risk: "medium", stateAffiliated: "Germany", note: "German state-funded, editorially independent" },
  "ERT": { risk: "medium", stateAffiliated: "Greece", note: "Greek public broadcaster" },
  "AMNA": { risk: "medium", stateAffiliated: "Greece", note: "Greek national news agency" },
  "Voice of America": { risk: "medium", stateAffiliated: "USA", note: "US government-funded" },
  "Kyiv Independent": { risk: "medium", knownBiases: ["Pro-Ukraine"], note: "Ukrainian English-language primary on Russia-Ukraine war (#5950 balance: dedicated UA voice)" },
  // Ukraine depth pack (#5951) — local institutions + frontline assessment
  "Ukrinform": { risk: "high", stateAffiliated: "Ukraine", note: "Ukrainian national state news agency (UKRINFORM)" },
  "Suspilne": { risk: "medium", stateAffiliated: "Ukraine", note: "Ukrainian public broadcaster, state-funded" },
  "Ukrainska Pravda EN": { risk: "medium", knownBiases: ["Pro-Ukraine"], note: "Independent Ukrainian outlet, high-signal English edition" },
  "NV EN": { risk: "medium", knownBiases: ["Pro-Ukraine"], note: "New Voice of Ukraine English edition, independent" },
  "Hromadske EN": { risk: "medium", knownBiases: ["Pro-Ukraine"], note: "Ukrainian independent public broadcaster (English)" },
  // Ukrainian native outlets (#5959) — locale-boosted for uk UI
  "Ukrainska Pravda": { risk: "medium", knownBiases: ["Pro-Ukraine"], note: "Independent Ukrainian outlet, Ukrainian-language edition" },
  "Hromadske": { risk: "medium", knownBiases: ["Pro-Ukraine"], note: "Ukrainian independent public broadcaster (Ukrainian)" },
  "Bihus.Info": { risk: "medium", knownBiases: ["Pro-Ukraine"], note: "Ukrainian investigative anti-corruption outlet" },
  "Slidstvo.Info": { risk: "medium", knownBiases: ["Pro-Ukraine"], note: "Ukrainian investigative journalism project (Radio Free Europe partnership)" },
  "ZN.UA": { risk: "medium", knownBiases: ["Pro-Ukraine"], note: "Dzerkalo Tyzhnia \u2014 Ukrainian weekly analytical newspaper" },
  "ISW": { risk: "low", note: "Institute for the Study of War, nonpartisan research nonprofit, daily frontline assessments" },
  "Moscow Times": { risk: "medium", knownBiases: ["Anti-Kremlin"], note: "Independent English-language Russian outlet, critical of Kremlin" },
  "Interfax RU": { risk: "medium", note: "Russian private news agency operating under domestic media restrictions; Russian-language feed" },
  "Interfax EN": { risk: "medium", note: "Russian private news agency operating under domestic media restrictions; English-language edition" },
  "GlobeNewswire": { risk: "medium", note: "Publisher-submitted press releases; not independent reporting" },
  "Business Wire": { risk: "medium", note: "Publisher-submitted press releases; not independent reporting" },
  "PR Newswire": { risk: "medium", note: "Publisher-submitted press releases; not independent reporting" },
  "Chainwire": { risk: "medium", note: "Paid crypto press-release distribution; not independent reporting" },
  "Coinbase Blog": { risk: "medium", note: "Coinbase first-party company publication; treat statements as issuer claims" },
  "Binance Announcements": { risk: "medium", note: "Binance first-party announcement channel; treat statements as issuer claims" },
  "Jin10": { risk: "medium", note: "Chinese financial-news and market-data publisher; limited English editorial transparency" },
  // Independent RU exile press — not state media; eligible for EN defaults (#5950)
  "Meduza": { risk: "low", knownBiases: ["Anti-Kremlin"], note: "Independent Russian exile outlet (Riga); English + Russian RSS" },
  // Validated crisis desks (#6813-#6830). These declarations are editorial
  // provenance, not endorsements of every publisher claim.
  "Yemen Online": { risk: "medium", note: "Independent English-language Yemeni platform; exile and conflict-reporting context" },
  "Sana'a Center": { risk: "low", note: "Independent Yemeni policy and analysis center" },
  "Syria Direct": { risk: "low", note: "Independent nonprofit Syria newsroom" },
  "Enab Baladi English": { risk: "medium", knownBiases: ["Syrian opposition perspective"], note: "Independent Syrian newsroom founded by citizen journalists" },
  "+972 Magazine": { risk: "medium", knownBiases: ["Israeli-Palestinian human-rights perspective"], note: "Independent Israeli-Palestinian magazine" },
  "WAFA English": { risk: "high", stateAffiliated: "Palestine", note: "Official Palestinian news agency; treat statements as government claims" },
  "HaitiLibre English": { risk: "medium", note: "Translated Haiti-focused desk; retain explicit publisher attribution" },
  "AyiboPost": { risk: "low", note: "Independent Haitian investigative newsroom" },
  "Amu TV": { risk: "medium", note: "Independent Afghan exile newsroom with reporters inside Afghanistan" },
  "Pajhwok Afghan News": { risk: "medium", note: "Independent Kabul-based news agency operating under domestic restrictions" },
  "Naharnet Lebanon": { risk: "low", note: "Independent Lebanese digital outlet" },
  "L'Orient Today": { risk: "low", note: "Independent English-language Lebanese newsroom" },
  "Annahar": { risk: "low", note: "Independent Lebanese Arabic-language political newspaper" },
  "New York Times World": { risk: "low", note: "US national daily newspaper (New York Times Company)" },
  "Washington Post World": { risk: "low", note: "US national daily newspaper" },
  // The Economist, Times of Israel and Middle East Eye: risk notes come from the social overlays below.
  "The Independent": { risk: "low", note: "British national online newspaper" },
  "Sky News": { risk: "low", note: "British commercial news broadcaster (Comcast)" },
  "Japan Times": { risk: "low", note: "Japanese English-language daily newspaper" },
  "BBC UK": { risk: "low", note: "Public broadcaster, editorial independence charter" },
  "BBC Northern Ireland": { risk: "low", note: "Public broadcaster, editorial independence charter" },
  "Reuters Science": { risk: "low", note: "Wire service, strict editorial standards" },
  "Nature News": { risk: "low", note: "News desk of the scientific journal Nature (Springer Nature)" },
  "BBC Science": { risk: "low", note: "Public broadcaster, editorial independence charter" },
  "Guardian Science": { risk: "low", note: "Scott Trust ownership, no shareholders" },
  "ScienceDaily": { risk: "low", note: "Aggregator of university and institute press releases" },
  "PAP": { risk: "medium", stateAffiliated: "Poland", note: "Polish national news agency (Polska Agencja Prasowa); state-owned wire" },
  "Gazeta Wyborcza": { risk: "low", note: "Independent Polish daily newspaper published by Agora" },
  "Polityka": { risk: "low", note: "Independent Polish weekly news magazine" },
  "Onet": { risk: "low", note: "Polish commercial news portal published by Ringier Axel Springer Polska" },
  "OKO.press": { risk: "low", note: "Independent Polish investigative and fact-checking outlet" },
  "TVP Info": { risk: "medium", stateAffiliated: "Poland", note: "Polish public-service news channel; state-funded broadcaster" },
  "Studio Tamani": { risk: "low", note: "Mali newsroom operated by Fondation Hirondelle; Journalism Trust Initiative certified" },
  "leFaso.net": { risk: "low", note: "Independent Burkina Faso digital newsroom" },
  "ActuNiger": { risk: "medium", note: "Niger-focused independent newsroom" },
  "A\xEFr Info": { risk: "low", note: "Independent northern Niger and Agadez newsroom" },
  "Caracas Chronicles": { risk: "medium", knownBiases: ["Opposition-leaning Venezuela analysis"], note: "Independent English-language Venezuela analysis outlet" },
  "Efecto Cocuyo": { risk: "low", note: "Independent Venezuelan newsroom" },
  "Havana Times": { risk: "medium", knownBiases: ["Independent Cuban perspective"], note: "Independent English-language Cuba-focused publication" },
  "14ymedio": { risk: "medium", knownBiases: ["Cuban opposition perspective"], note: "Independent Cuban digital newspaper" },
  "Libya Herald": { risk: "medium", note: "Independent English-language Libya newsroom in a polarized media environment" },
  "Egypt Independent": { risk: "medium", note: "Independent English-language Egypt newsroom operating under domestic restrictions" },
  "Mada Masr": { risk: "medium", note: "Independent Egyptian newsroom operating under domestic restrictions" },
  "The Daily Star": { risk: "low", note: "Independent English-language Bangladesh newspaper" },
  "Dhaka Tribune": { risk: "low", note: "Independent English-language Bangladesh newspaper" },
  "Daily Nation": { risk: "low", note: "Kenyan newspaper published by Nation Media Group" },
  "The Guardian Post": { risk: "medium", note: "Independent Cameroon English-language newspaper" },
  "Tchadinfos": { risk: "medium", note: "Chad-focused French-language newsroom" },
  "Alwihda Info": { risk: "medium", note: "Pan-African French-language publisher with Chad coverage; source mapping is not article geolocation" },
  "Radio Ndeke Luka": { risk: "low", note: "CAR-focused newsroom; Journalism Trust Initiative certified" },
  // Low risk - Independent with editorial standards (explicit)
  "Jerusalem Post": { risk: "low", note: "English-language Israeli daily of record" },
  "Ynetnews": { risk: "low", knownBiases: ["Israeli mainstream"], note: "Yedioth Ahronoth English edition" },
  "Digi24": { risk: "low", note: "Romanian independent news channel, member of ERNO" },
  "HotNews": { risk: "low", note: "Romanian independent online news portal" },
  "G4Media": { risk: "low", note: "Romanian independent investigative outlet" },
  "Dnevnik": { risk: "low", note: "Bulgarian independent daily newspaper" },
  "ERR News": { risk: "low", note: "Estonian Public Broadcasting English service" },
  "LRT English": { risk: "low", note: "Lithuanian Public Broadcasting English service" },
  "LSM English": { risk: "low", note: "Latvian Public Broadcasting English service" },
  // Canada + Arctic/Nordic pack (#5960) + depth pack (#6604/#6605)
  "CBC News": { risk: "medium", stateAffiliated: "Canada", note: "Canadian public broadcaster (CBC/Radio-Canada), editorially independent charter" },
  "Globe and Mail": { risk: "low", note: "Canadian newspaper of record" },
  "Global News": { risk: "low", note: "Canadian national news network (Corus Entertainment)" },
  "Toronto Star": { risk: "low", note: "Canadian metropolitan daily newspaper of record (Toronto)" },
  "National Post": { risk: "low", note: "Canadian national newspaper (Postmedia)" },
  "Financial Post": { risk: "low", note: "Canadian business newspaper (Postmedia)" },
  "iPolitics": { risk: "low", note: "Canadian political news outlet" },
  "The Narwhal": { risk: "low", note: "Canadian independent environmental investigative outlet" },
  "The Tyee": { risk: "low", note: "Canadian independent British Columbia news magazine" },
  "Maclean's": { risk: "low", note: "Canadian national news magazine" },
  "Radio-Canada": { risk: "medium", stateAffiliated: "Canada", note: "CBC/Radio-Canada French service, editorially independent charter" },
  "La Presse": { risk: "low", note: "Quebec French-language daily newspaper" },
  "Le Devoir": { risk: "low", note: "Quebec French-language newspaper of record" },
  "TVA Nouvelles": { risk: "low", note: "Quebec private television news (Quebecor); not state-affiliated" },
  "Vancouver Sun": { risk: "low", note: "Vancouver daily newspaper (Postmedia)" },
  "Calgary Herald": { risk: "low", note: "Calgary daily newspaper (Postmedia)" },
  "Winnipeg Free Press": { risk: "low", note: "Winnipeg daily newspaper" },
  "Edmonton Journal": { risk: "low", note: "Edmonton daily newspaper (Postmedia)" },
  "Ottawa Citizen": { risk: "low", note: "Ottawa daily newspaper (Postmedia)" },
  "The Province": { risk: "low", note: "Vancouver daily tabloid (Postmedia)" },
  "CTV News": { risk: "low", note: "Canadian national television news (Bell Media); GNews site: fallback, no native RSS" },
  "CP24": { risk: "low", note: "Toronto 24-hour news channel (Bell Media); GNews site: fallback, no native RSS" },
  "Montreal Gazette": { risk: "low", note: "Montreal English daily (Postmedia); GNews site: fallback, native RSS dead" },
  "Yle News": { risk: "medium", stateAffiliated: "Finland", note: "Finnish public broadcaster English service (Yle)" },
  "NRK": { risk: "medium", stateAffiliated: "Norway", note: "Norwegian public broadcaster" },
  "Aftenposten": { risk: "low", note: "Norwegian newspaper of record (Schibsted)" },
  "DR Nyheder": { risk: "medium", stateAffiliated: "Denmark", note: "Danish public broadcaster (DR)" },
  "Arctic Today": { risk: "low", note: "Independent High North / Arctic security and business news" },
  "Daily Sabah": { risk: "medium", stateAffiliated: "Turkey", note: "Turkish pro-government daily, English edition" },
  "Seznam Zpr\xE1vy": { risk: "low", note: "Czech independent online news outlet" },
  "Reuters": { risk: "low", note: "Wire service, strict editorial standards" },
  "AP News": { risk: "low", note: "Wire service, nonprofit cooperative" },
  "AFP": { risk: "low", note: "Wire service, editorially independent" },
  "BBC World": { risk: "low", note: "Public broadcaster, editorial independence charter" },
  "BBC Middle East": { risk: "low", note: "Public broadcaster, editorial independence charter" },
  "Guardian World": { risk: "low", note: "Scott Trust ownership, no shareholders" },
  "Guardian Africa": { risk: "low", note: "Scott Trust ownership, no shareholders" },
  "Guardian Caribbean": { risk: "low", note: "Scott Trust ownership, no shareholders" },
  "Guardian Pacific": { risk: "low", note: "Scott Trust ownership, no shareholders" },
  "Mexico News Daily": { risk: "low", note: "English-language Mexican news publication" },
  "Financial Times": { risk: "low", note: "Business focus, Nikkei-owned" },
  "Times of India": { risk: "low", note: "Major Indian national newspaper with an established editorial newsroom" },
  "Fox Business": { risk: "low", note: "Commercial U.S. business-news publisher" },
  "Business Insider": { risk: "low", note: "Commercial business-news publisher with editorial standards" },
  "Wired": { risk: "low", note: "Technology publication with editorial standards" },
  "Handelsblatt": { risk: "low", note: "German business newspaper with editorial standards" },
  "Welt": { risk: "low", note: "German national newspaper with editorial standards" },
  "Telegraph": { risk: "low", note: "British national newspaper with editorial standards" },
  "Bellingcat": { risk: "low", note: "Open-source investigations, methodology transparent" },
  "Brasil Paralelo": { risk: "low", note: "Independent media company: no political ties, no public funding, 100% subscriber-funded." },
  // Periphery packs (#5953) — Caucasus
  "Civil.ge": { risk: "low", note: "Independent Georgian English-language news outlet" },
  "OC Media": { risk: "low", note: "Independent South Caucasus regional news outlet" },
  "JAMnews": { risk: "medium", note: "Regional Caucasus news platform, limited editorial transparency" },
  "Azertag": { risk: "high", stateAffiliated: "Azerbaijan", note: "Azerbaijani state news agency (AZERTAC)" },
  "Armenpress": { risk: "high", stateAffiliated: "Armenia", note: "Armenian state news agency" },
  // Periphery packs (#5953) — Belarus / Moldova
  "Zerkalo": { risk: "low", note: "Independent Belarusian exile news outlet (formerly TUT.BY)" },
  "NewsMaker": { risk: "medium", note: "Moldovan independent news outlet; configured Russian-language feed" },
  "Ziarul de Gard\u0103": { risk: "medium", note: "Moldovan investigative journalism outlet, Romanian-language" },
  // Periphery packs (#5953) — Central Asia
  "Eurasianet": { risk: "medium", note: "Nonprofit regional news covering Eurasia, Carnegie-funded" },
  "RFE/RL Central Asia": { risk: "medium", stateAffiliated: "USA", note: "US government-funded Central Asia desk (Radio Free Europe)" },
  "The Astana Times": { risk: "medium", stateAffiliated: "Kazakhstan", note: "Kazakhstan government-funded English-language news" },
  "The Times of Central Asia": { risk: "medium", note: "Independent English-language Central Asia news outlet" },
  // Telegram channels (#6600). Additive keys keyed by channel display label.
  ...TELEGRAM_SOURCE_PROPAGANDA_RISK,
  // Curated X news-account overlay (#6654). Additive to Telegram.
  ...X_ACCOUNT_SOURCE_PROPAGANDA_RISK
};
function getSourcePropagandaRisk(sourceName) {
  return SOURCE_PROPAGANDA_RISK[sourceName] ?? UNREVIEWED_SOURCE_RISK;
}
function hasReviewedPropagandaRisk(sourceName) {
  return Object.prototype.hasOwnProperty.call(SOURCE_PROPAGANDA_RISK, sourceName);
}
function hasDeclaredPropagandaRisk(sourceName) {
  return hasReviewedPropagandaRisk(sourceName) || Object.prototype.hasOwnProperty.call(CONFIGURED_SOURCE_PROVENANCE_DECLARATIONS, sourceName);
}
function describeRiskClause(profile, type) {
  if (profile.risk === "unknown") return `${UNREVIEWED_SOURCE_RISK.note}.`;
  if (type === "gov") {
    return profile.stateAffiliated ? `Official government source: ${profile.stateAffiliated}.` : "Official government source.";
  }
  const state = profile.stateAffiliated ? ` State-affiliated: ${profile.stateAffiliated}.` : "";
  if (profile.risk === "high") return `State media.${state}`;
  if (profile.risk === "medium") return `Caution.${state}`;
  return `Reviewed.${state}`;
}
function composeProvenanceSummary(profile, type) {
  const knownBiases = profile.knownBiases ?? [];
  const note = profile.note === UNREVIEWED_SOURCE_RISK.note ? void 0 : profile.note;
  return [
    describeRiskClause(profile, type),
    knownBiases.length > 0 ? `Perspective: ${knownBiases.join(", ")}.` : "Perspective: none recorded.",
    ...note ? [/[.!?]$/.test(note) ? note : `${note}.`] : []
  ].join(" ");
}
function getSourceProvenanceState(sourceName) {
  const profile = getSourcePropagandaRisk(sourceName);
  const type = getSourceType(sourceName);
  return {
    risk: profile.risk,
    type,
    riskDeclared: hasDeclaredPropagandaRisk(sourceName),
    typeDeclared: hasDeclaredSourceType(sourceName),
    riskReviewed: hasReviewedPropagandaRisk(sourceName),
    typeReviewed: hasReviewedSourceType(sourceName),
    ...profile.stateAffiliated ? { stateAffiliated: profile.stateAffiliated } : {},
    knownBiases: profile.knownBiases ?? [],
    ...profile.note ? { note: profile.note } : {},
    summary: composeProvenanceSummary(profile, type)
  };
}

// shared/outlet-profile.json
var outlet_profile_default = {
  _readme: [
    "Reviewed outlet profiles, one per catalog source name (RSS, Telegram, X).",
    "country: ISO2 home country of the publisher (INTL for intergovernmental or multi-publisher, EU for EU institutions).",
    "audience: domestic | international | diaspora. language: ISO 639-1 of the ingested content.",
    "ownershipClass: state | public-service | private | nonprofit | intergovernmental | unreviewed; never defaulted.",
    "No political lean ratings. tests/outlet-profile-completeness.test.mts keeps this closed-world."
  ],
  "+972 Magazine": {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "14ymedio": {
    country: "CU",
    audience: "domestic",
    language: "es",
    ownershipClass: "private"
  },
  "20VC Episodes": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "London-based podcast; feed hosted on US libsyn."
  },
  "24.hu": {
    country: "HU",
    audience: "domestic",
    language: "hu",
    ownershipClass: "private"
  },
  "36Kr English": {
    country: "CN",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "444.hu": {
    country: "HU",
    audience: "domestic",
    language: "hu",
    ownershipClass: "private"
  },
  "500 Global News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "a16z Blog": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "a16z Insights": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "a16z Podcast": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Aaj Tak": {
    country: "IN",
    audience: "domestic",
    language: "hi",
    ownershipClass: "private"
  },
  "ABC News": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "ABC News Australia": {
    country: "AU",
    audience: "domestic",
    language: "en",
    ownershipClass: "public-service"
  },
  "Abu Ali Express": {
    country: "IL",
    audience: "domestic",
    language: "he",
    ownershipClass: "private",
    note: "Individually run Israeli Telegram channel."
  },
  "Abu Ali Express EN": {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Israeli-run military OSINT channel operated by an individual blogger."
  },
  "Acquired Episodes": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "Acquired Podcast": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Actualite.cd": {
    country: "CD",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  ActuNiger: {
    country: "NE",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  AEI: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "nonprofit"
  },
  AFP: {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "Agence France-Presse, a statutory autonomous agency funded partly by the French state."
  },
  "Africa News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Africa Startups": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Africa Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  Africanews: {
    country: "CG",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Euronews-owned pan-African channel headquartered in Pointe-Noire."
  },
  Aftenposten: {
    country: "NO",
    audience: "domestic",
    language: "no",
    ownershipClass: "private"
  },
  Agriculture: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "AI Interviews": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "AI News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "AI Now Institute": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "AI Podcast (NVIDIA)": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "AI Podcasts": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "AI Regulation": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "AI Weekly": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Air Force of the Armed Forces of Ukraine": {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "state"
  },
  "A\xEFr Info": {
    country: "NE",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  "Al Arabiya": {
    country: "SA",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "MBC Group, majority-held by the Saudi state; operated from Dubai."
  },
  "Al Jazeera": {
    country: "QA",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Al-Saa EN": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Ownership and base of this Telegram desk are not identifiable."
  },
  "All-In Podcast": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "Aluminum & Zinc": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Alwihda Info": {
    country: "TD",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  "Amar Ujala": {
    country: "IN",
    audience: "domestic",
    language: "hi",
    ownershipClass: "private"
  },
  AMNA: {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "state"
  },
  "Amu TV": {
    country: "US",
    audience: "diaspora",
    language: "en",
    ownershipClass: "private",
    note: "Afghan exile newsroom operating from abroad (US-registered) with reporters inside Afghanistan."
  },
  "AngelList News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Annahar: {
    country: "LB",
    audience: "domestic",
    language: "ar",
    ownershipClass: "private"
  },
  ANSA: {
    country: "IT",
    audience: "domestic",
    language: "it",
    ownershipClass: "private"
  },
  "Anthropic News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "AP Mexico": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "AP News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Arab News": {
    country: "SA",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "SRMG daily, Saudi-government-linked."
  },
  "Arabian Business": {
    country: "AE",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Arctic Today": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Armenpress: {
    country: "AM",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Arms Control Assn": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Ars Technica": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "ArXiv AI": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "ArXiv ML": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Asahi Shimbun": {
    country: "JP",
    audience: "domestic",
    language: "ja",
    ownershipClass: "private"
  },
  "Asharq Business": {
    country: "SA",
    audience: "international",
    language: "ar",
    ownershipClass: "state",
    note: "SRMG-owned pan-Arab outlet (Bloomberg partnership), Saudi-government-linked."
  },
  "Asharq News": {
    country: "SA",
    audience: "international",
    language: "ar",
    ownershipClass: "state",
    note: "SRMG-owned pan-Arab outlet, Saudi-government-linked."
  },
  "Asia News": {
    country: "IT",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "AsiaNews.it, agency of the Pontifical Institute for Foreign Missions (PIME); client variant uses a generic Asia topic search."
  },
  "Asia Pacific Tech": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Asia VC News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Atlantic Council": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  ATV: {
    country: "HU",
    audience: "domestic",
    language: "hu",
    ownershipClass: "private"
  },
  "Aurora Intel": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous OSINT aggregator; ownership not public."
  },
  "Australian Mining": {
    country: "AU",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "AWS Status": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Axios: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  AyiboPost: {
    country: "HT",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  Azertag: {
    country: "AZ",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Balkan Insight": {
    country: "BA",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Published by the Balkan Investigative Reporting Network (BIRN), a regional nonprofit network."
  },
  "Bangkok Post": {
    country: "TH",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "English Google News feed of bangkokpost.com; the catalog lang th only routes it to Thai digests."
  },
  "Bank Research": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Banking Rules": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "BBC Africa": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "public-service"
  },
  "BBC Afrique": {
    country: "GB",
    audience: "international",
    language: "fr",
    ownershipClass: "public-service"
  },
  "BBC Asia": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "public-service"
  },
  "BBC Hindi": {
    country: "GB",
    audience: "diaspora",
    language: "hi",
    ownershipClass: "public-service",
    note: "BBC World Service language service run from London for audiences abroad."
  },
  "BBC Latin America": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "public-service"
  },
  "BBC Middle East": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "public-service"
  },
  "BBC Mundo": {
    country: "GB",
    audience: "international",
    language: "es",
    ownershipClass: "public-service"
  },
  "BBC Northern Ireland": {
    country: "GB",
    audience: "domestic",
    language: "en",
    ownershipClass: "public-service"
  },
  "BBC Persian": {
    country: "GB",
    audience: "diaspora",
    language: "fa",
    ownershipClass: "public-service",
    note: "BBC World Service language service run from London for audiences abroad."
  },
  "BBC Russian": {
    country: "GB",
    audience: "diaspora",
    language: "ru",
    ownershipClass: "public-service",
    note: "BBC World Service language service run from London for audiences abroad."
  },
  "BBC Science": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "public-service"
  },
  "BBC Turkce": {
    country: "GB",
    audience: "diaspora",
    language: "tr",
    ownershipClass: "public-service",
    note: "BBC World Service language service run from London for audiences abroad."
  },
  "BBC UK": {
    country: "GB",
    audience: "domestic",
    language: "en",
    ownershipClass: "public-service"
  },
  "BBC World": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "public-service"
  },
  Bellingcat: {
    country: "NL",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Benchmark Mineral": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Benedict Evans": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "BHP News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Bihus.Info": {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "nonprofit"
  },
  Bild: {
    country: "DE",
    audience: "domestic",
    language: "de",
    ownershipClass: "private"
  },
  "Binance Announcements": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "First-party Binance channel; Binance has no single home jurisdiction."
  },
  "Bint Jbeil News": {
    country: "LB",
    audience: "domestic",
    language: "ar",
    ownershipClass: "unreviewed",
    note: "Local southern Lebanon Telegram desk; ownership not verifiable."
  },
  "Bitcoin Magazine": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Blockchain Finance": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Bloomberg: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Bloomberg Commodities": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Bloomberg Crypto": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "Bloomberg Energy": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Bloomberg Markets": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "BMKG InaTEWS": {
    country: "ID",
    audience: "domestic",
    language: "id",
    ownershipClass: "state"
  },
  "BNO News": {
    country: "NL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "BoE Watch": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "BoJ Watch": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Bond Market": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Brasil Paralelo": {
    country: "BR",
    audience: "domestic",
    language: "pt",
    ownershipClass: "private"
  },
  "Brazil Tech": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Brazil Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Topic search across many publishers (Brazilian tech); no single owner."
  },
  "Breaking Defense": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Brookings: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Brookings Tech": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Bruegel (EU)": {
    country: "BE",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Bulletin of Atomic Scientists": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Business Insider": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Business Wire": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "CAC (China)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  "Calgary Herald": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Caracas Chronicles": {
    country: "VE",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Carnegie: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "CB Insights": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "CB Insights Unicorn": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "CBC News": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "public-service",
    note: "State-funded broadcaster with a statutory independence charter."
  },
  "CBS News": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  CDC: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Central Bank Rates": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  CGTN: {
    country: "CN",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  Chainwire: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Changelog: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Channels TV": {
    country: "NG",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Chatham House": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Chatham House Tech": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "China Commodity Imports": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "China Mineral Policy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "China Startups": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "China Tech Analysis": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "China Tech Giants": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "China Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Topic search across many publishers (Chinese tech); no single owner."
  },
  "China Tech Policy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Chosun Ilbo": {
    country: "KR",
    audience: "domestic",
    language: "ko",
    ownershipClass: "private"
  },
  CISA: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Citi Newsroom": {
    country: "GH",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Civil.ge": {
    country: "GE",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  Clar\u00EDn: {
    country: "AR",
    audience: "domestic",
    language: "es",
    ownershipClass: "private"
  },
  "Clash Report": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous conflict aggregator; ownership not public."
  },
  "Cloud Outages": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  CNA: {
    country: "SG",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "Mediacorp, owned by the Singapore state investor Temasek."
  },
  CNAS: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  CNBC: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "CNBC Commodities": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "CNBC Markets": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "CNBC Tech": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "CNN Greece": {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "private"
  },
  "CNN World": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Cobalt Market": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Coinbase Blog": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  CoinDesk: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Cointelegraph: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Commodity Futures": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Commodity Trading": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Conservation Optimism": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Contxto (LATAM)": {
    country: "MX",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Copper Market": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Corporate Bonds": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Correctiv: {
    country: "DE",
    audience: "domestic",
    language: "de",
    ownershipClass: "nonprofit"
  },
  "Corriere della Sera": {
    country: "IT",
    audience: "domestic",
    language: "it",
    ownershipClass: "private"
  },
  CP24: {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  CrisisWatch: {
    country: "BE",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Critical Mineral Companies": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  CrowdStrike: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Crunchbase News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Crypto News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Crypto Regulation": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  CryptoSlate: {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "UK-based publisher on a generic .com host."
  },
  CSIS: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "CSIS Tech": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "CTV News": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  CyberDetective: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Telegram OSINT channel with no disclosed operator."
  },
  "Cybersecurity Boardroom": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram aggregator; operator unknown."
  },
  "CYBERWAR.COM": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous cyber aggregator channel; ownership not public."
  },
  "Dabanga Sudan": {
    country: "NL",
    audience: "diaspora",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Sudanese exile newsroom run from Amsterdam; evidence maps the host to SD."
  },
  "Dagens Nyheter": {
    country: "SE",
    audience: "domestic",
    language: "sv",
    ownershipClass: "private"
  },
  "Daily Nation": {
    country: "KE",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Daily Sabah": {
    country: "TR",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Daily Trust": {
    country: "NG",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  DailyGood: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Dark Reading": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Dark Web Informer": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Individually run monitoring channel; ownership not public."
  },
  Dawn: {
    country: "PK",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "DD Geopolitics": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram aggregator with no disclosed operator."
  },
  "De Telegraaf": {
    country: "NL",
    audience: "domestic",
    language: "nl",
    ownershipClass: "private"
  },
  DealStreetAsia: {
    country: "SG",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Decacorn News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Decoder (Verge)": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Decrypt: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  DeepState: {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "private"
  },
  "DefaPress (Iran MOD)": {
    country: "IR",
    audience: "domestic",
    language: "fa",
    ownershipClass: "state"
  },
  "Defense News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Defense One": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "DeFi News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Demo Day News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Department of War": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Der Spiegel": {
    country: "DE",
    audience: "domestic",
    language: "de",
    ownershipClass: "private"
  },
  "Dev Events": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Dev.to": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "DevOps.com": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  DFRLab: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Dhaka Tribune": {
    country: "BD",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  DHS: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Die Zeit": {
    country: "DE",
    audience: "domestic",
    language: "de",
    ownershipClass: "private"
  },
  Digi24: {
    country: "RO",
    audience: "domestic",
    language: "ro",
    ownershipClass: "private"
  },
  DigiChina: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "DL News": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Dnevnik: {
    country: "BG",
    audience: "domestic",
    language: "bg",
    ownershipClass: "private"
  },
  DOJ: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Dollar Watch": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "DR Nyheder": {
    country: "DK",
    audience: "domestic",
    language: "da",
    ownershipClass: "public-service",
    note: "State-funded Danish broadcaster with statutory editorial independence."
  },
  "Dragon Watch": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram OSINT aggregator; operator unknown."
  },
  "Drop Site News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "DW News": {
    country: "DE",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "German state-funded broadcaster with statutory editorial independence."
  },
  "DW Turkish": {
    country: "DE",
    audience: "diaspora",
    language: "tr",
    ownershipClass: "public-service",
    note: "German public-service broadcaster service aimed at Turkey."
  },
  "e27 (SEA)": {
    country: "SG",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Earnings Reports": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "ECB Watch": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  ECFR: {
    country: "DE",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Pan-European think tank headquartered in Berlin; host domain implies EU but it is not an EU institution."
  },
  "Economic Data": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Edmonton Journal": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Efecto Cocuyo": {
    country: "VE",
    audience: "domestic",
    language: "es",
    ownershipClass: "private"
  },
  "EFF News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Egypt Independent": {
    country: "EG",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "EIA Press Room": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "EIA Reports": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "El Mundo": {
    country: "ES",
    audience: "domestic",
    language: "es",
    ownershipClass: "private"
  },
  "El Pa\xEDs": {
    country: "ES",
    audience: "domestic",
    language: "es",
    ownershipClass: "private"
  },
  "El Tiempo": {
    country: "CO",
    audience: "domestic",
    language: "es",
    ownershipClass: "private"
  },
  "El Universo": {
    country: "EC",
    audience: "domestic",
    language: "es",
    ownershipClass: "private"
  },
  "Emirates News Agency (WAM)": {
    country: "AE",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Enab Baladi English": {
    country: "TR",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Syrian independent newsroom long run from Istanbul; English edition for international readers."
  },
  "Energy Crisis & Shortages": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Energy Intel": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Energy Sanctions": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Engadget: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Entrackr (India)": {
    country: "IN",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "ERR News": {
    country: "EE",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "Estonian public broadcaster English service."
  },
  ERT: {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "public-service",
    note: "State-funded Greek public broadcaster classed public-service."
  },
  "ESG in Mining": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Ethiopia Insight": {
    country: "ET",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "EU Commission Digital": {
    country: "EU",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  "EU Digital Policy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "EU ISS": {
    country: "EU",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  "EU Startups": {
    country: "ES",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Barcelona-based publisher; host domain implies EU but it is a private outlet."
  },
  "EU Tech Policy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Eurasianet: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "New York-based nonprofit; host domain implies no country."
  },
  EuroNews: {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Lyon-based, majority-owned by Alpac Capital since 2022, no longer a public broadcaster consortium."
  },
  "EV Battery Supply": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Eye on AI": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "FalconFeeds.io": {
    country: "IN",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Commercial threat-intel service run by an India-based company."
  },
  "FAO GIEWS": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  "FAO News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  "Fars News": {
    country: "IR",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "IRGC-linked agency; ingested via an English Google News site: query."
  },
  "Fars News EN": {
    country: "IR",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  FAS: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Fast Company": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Federal Reserve": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  FEMA: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Financial Post": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Financial Regulation": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Financial Times": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "FinTech LATAM": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Fintech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "First Round Review": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Focus Taiwan": {
    country: "TW",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "English service of the Central News Agency, a state-funded national agency with statutory independence."
  },
  "Folha de S.Paulo": {
    country: "BR",
    audience: "domestic",
    language: "pt",
    ownershipClass: "private"
  },
  "Foreign Affairs": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Foreign Policy": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Forex News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Fortune Term Sheet": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Fotros Resistance": {
    country: "INTL",
    audience: "diaspora",
    language: "fa",
    ownershipClass: "unreviewed",
    note: "Anonymous Iranian opposition Telegram channel; operator and base unknown."
  },
  "Fox Business": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Fox News": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  FPRI: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "France 24": {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "State-funded France M\xE9dias Monde broadcaster with statutory editorial independence."
  },
  "France 24 Africa": {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "State-funded France M\xE9dias Monde broadcaster with statutory editorial independence."
  },
  "France 24 Asia Pacific": {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "State-funded France M\xE9dias Monde broadcaster with statutory editorial independence."
  },
  "France 24 EN": {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "State-funded France Medias Monde broadcaster with a statutory independence charter."
  },
  "France 24 LatAm": {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "State-funded France M\xE9dias Monde broadcaster with statutory editorial independence."
  },
  "Freeport & Copper Miners": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "FT Energy": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Futures Trading": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "FwdStart Newsletter": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Startup newsletter (fwdstart.me) with no disclosed publisher found."
  },
  "FX Empire Gold": {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  G4Media: {
    country: "RO",
    audience: "domestic",
    language: "ro",
    ownershipClass: "private"
  },
  "GACC (China)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  "Gazeta Wyborcza": {
    country: "PL",
    audience: "domestic",
    language: "pl",
    ownershipClass: "private"
  },
  gCaptain: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Geo News": {
    country: "PK",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "GeoPol Watch": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous geopolitical aggregator; ownership not public."
  },
  GeopoliticalCenter: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram aggregator; owner not identifiable."
  },
  "Geopolitics Prime": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram aggregator with no disclosed operator."
  },
  "GitHub Blog": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "GitHub Trending": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Third-party RSS generator of GitHub (Microsoft) trending pages."
  },
  GITOC: {
    country: "CH",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Glencore & Vale": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Global Central Banks": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Global News": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Globe and Mail": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  GlobeNewswire: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "GloNewswire (Taiwan)": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Topic search across many publishers (Taiwan press releases); no single owner."
  },
  GMF: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "GNN Animals": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "GNN Earth": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "GNN Health": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "GNN Heroes": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "GNN Heroes Spotlight": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "GNN Science": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Gold & Metals": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Gold Majors": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Gold Price News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Gold Silver Worlds": {
    country: "BE",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  GoldSeek: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Good Good Good": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "GOOD Magazine": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Good News Network": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Gradient Dissent": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Greater Good (Berkeley)": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Guardian Africa": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Guardian Americas": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Guardian Australia": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Australian edition run in Sydney; kept GB to match the Guardian family."
  },
  "Guardian Caribbean": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Guardian ME": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Guardian Pacific": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Guardian Science": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Guardian World": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Gulf FDI": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Gulf Investments": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  Haaretz: {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Hacker News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "HaitiLibre English": {
    country: "HT",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Hamas-Israel War": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous faction-aligned aggregator; ownership not public."
  },
  Handelsblatt: {
    country: "DE",
    audience: "domestic",
    language: "de",
    ownershipClass: "private"
  },
  "Hard Fork (NYT)": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "Havana Times": {
    country: "CU",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Hedge Fund News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Hiiraan Online": {
    country: "CA",
    audience: "diaspora",
    language: "en",
    ownershipClass: "private",
    note: "Toronto-based Somali outlet aimed at Somalia and its diaspora."
  },
  H\u00EDrad\u00F3: {
    country: "HU",
    audience: "domestic",
    language: "hu",
    ownershipClass: "state",
    note: "News site of MTVA/Duna M\xE9diaszolg\xE1ltat\xF3, government-controlled Hungarian public media."
  },
  HotNews: {
    country: "RO",
    audience: "domestic",
    language: "ro",
    ownershipClass: "private"
  },
  "Housing Market": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "How I Built This": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Hromadske: {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "nonprofit"
  },
  "Hromadske EN": {
    country: "UA",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Human Progress": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  Hurriyet: {
    country: "TR",
    audience: "domestic",
    language: "tr",
    ownershipClass: "private"
  },
  HVG: {
    country: "HU",
    audience: "domestic",
    language: "hu",
    ownershipClass: "private"
  },
  IAEA: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  IDF: {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "IDF Official": {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "IEA Critical Minerals": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  "IEA News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  iefimerida: {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "private"
  },
  "in.gr": {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "private"
  },
  "Inc42 (India)": {
    country: "IN",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Index.hr": {
    country: "HR",
    audience: "domestic",
    language: "hr",
    ownershipClass: "private"
  },
  "Index.hu": {
    country: "HU",
    audience: "domestic",
    language: "hu",
    ownershipClass: "private"
  },
  "India News Network": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "India Startups": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "India Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "India Tech Policy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Indian Express": {
    country: "IN",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Indonesia Nickel Policy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Indonesia Tech": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Infobae Americas": {
    country: "AR",
    audience: "international",
    language: "es",
    ownershipClass: "private"
  },
  InfoQ: {
    country: "CA",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Run by Toronto-based C4Media on a generic .com host."
  },
  "InSight Crime": {
    country: "CO",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Editorially run from Medell\xEDn; host is a US-registered .org."
  },
  "Intel Crab": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Pseudonymous X OSINT account with no disclosed operator."
  },
  "Interfax EN": {
    country: "RU",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Interfax RU": {
    country: "RU",
    audience: "domestic",
    language: "ru",
    ownershipClass: "private"
  },
  "Investing.com News": {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "IPO News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  iPolitics: {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Iran International": {
    country: "GB",
    audience: "diaspora",
    language: "en",
    ownershipClass: "state",
    note: "London-based Iranian exile broadcaster, Saudi-funded per repo state affiliation."
  },
  "Iran International EN": {
    country: "GB",
    audience: "diaspora",
    language: "en",
    ownershipClass: "state",
    note: "London-based Iranian exile broadcaster with Saudi-linked funding."
  },
  "IRGC Official": {
    country: "IR",
    audience: "domestic",
    language: "fa",
    ownershipClass: "state"
  },
  IRNA: {
    country: "IR",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Iron Ore Market": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Irrawaddy: {
    country: "TH",
    audience: "diaspora",
    language: "en",
    ownershipClass: "private",
    note: "Myanmar exile outlet operating from Thailand."
  },
  "ISEAS (Singapore)": {
    country: "SG",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "Statutory research institute under the Singapore government."
  },
  "Island Times (Palau)": {
    country: "PW",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Israel Home Front Command": {
    country: "IL",
    audience: "domestic",
    language: "he",
    ownershipClass: "state"
  },
  ISW: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Jakarta Post": {
    country: "ID",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Jamestown: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  JAMnews: {
    country: "GE",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Grant-funded regional Caucasus news platform based in Tbilisi."
  },
  Janes: {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Japan Joint Staff": {
    country: "JP",
    audience: "domestic",
    language: "ja",
    ownershipClass: "state"
  },
  "Japan Startups": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Japan Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Japan Times": {
    country: "JP",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Japan Today": {
    country: "JP",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Jerusalem Post": {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Jeune Afrique": {
    country: "FR",
    audience: "international",
    language: "fr",
    ownershipClass: "private"
  },
  Jin10: {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "private"
  },
  "Jutarnji list": {
    country: "HR",
    audience: "domestic",
    language: "hr",
    ownershipClass: "private"
  },
  Kaspersky: {
    country: "RU",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Kathimerini: {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "private"
  },
  KCNA: {
    country: "KP",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "KED Global": {
    country: "KR",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Kian Meli (Iran)": {
    country: "IR",
    audience: "domestic",
    language: "fa",
    ownershipClass: "unreviewed",
    note: "Personal Persian-language Telegram channel; operator and location undisclosed."
  },
  "Kitco Gold": {
    country: "CA",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Kitco News": {
    country: "CA",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Korea Startups": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Korea Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  KrASIA: {
    country: "SG",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Krebs Security": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Kyiv Independent": {
    country: "UA",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "L'Orient Today": {
    country: "LB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "La Presse": {
    country: "CA",
    audience: "domestic",
    language: "fr",
    ownershipClass: "nonprofit",
    note: "Owned by a nonprofit social trust since 2018."
  },
  "La Silla Vac\xEDa": {
    country: "CO",
    audience: "domestic",
    language: "es",
    ownershipClass: "private"
  },
  "LATAM Fintech": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Topic search across many publishers (Latin American fintech); no single owner."
  },
  "LATAM Startups": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "LATAM Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Topic search across many publishers (Latin American tech); no single owner."
  },
  "Latin America": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Layoffs News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Layoffs.fyi": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Le Devoir": {
    country: "CA",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  "Le Monde": {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Ingests the English edition (lemonde.fr/en)."
  },
  "Le Quotidien": {
    country: "SN",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  "Lebanon Update": {
    country: "LB",
    audience: "domestic",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Telegram breaking-news aggregator; operator unknown."
  },
  "leFaso.net": {
    country: "BF",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  "Lenny Newsletter": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Lenny's Newsletter": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Lex Fridman Tech": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "Liberal GR": {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "private"
  },
  "Libya Herald": {
    country: "LY",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Lighthouse Reports": {
    country: "NL",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Lithium Market": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Live Science": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  LiveUAMap: {
    country: "UA",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "LME Metals": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  Lobsters: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Lowy Institute": {
    country: "AU",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "LRT English": {
    country: "LT",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "Lithuanian public broadcaster English service."
  },
  "LSM English": {
    country: "LV",
    audience: "international",
    language: "en",
    ownershipClass: "public-service"
  },
  "M&A News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Maclean's": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Mada Masr": {
    country: "EG",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Magnitt: {
    country: "AE",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Market Outlook": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  MarketWatch: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "MarketWatch Tech": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Masters of Scale": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Meduza: {
    country: "LV",
    audience: "diaspora",
    language: "en",
    ownershipClass: "private",
    note: "Russian exile outlet operating from Riga; English feed ingested."
  },
  "Mehr News": {
    country: "IR",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "MENA Startups": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "MENA Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Messari: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Metals Bulletin": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Mexico News Daily": {
    country: "MX",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Mexico Security": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Mexico Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Topic search across many publishers (Mexican tech); no single owner."
  },
  "Middle East Eye": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "London-based; repo records Qatar affiliation through reported funding links."
  },
  "Middle East Institute": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Middle East Now Breaking": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram aggregator; owner not identifiable."
  },
  "Middle East Observer": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Telegram observer channel with no disclosed operator."
  },
  "Middle East Spectator": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram OSINT aggregator; operator unknown."
  },
  "MIIT (China)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state",
    note: "Ingested via a WorldMonitor proxy host."
  },
  "Military Times": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Mine Web (SNL)": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Mining & Resources": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Mining Journal": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Mining Regulation": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Mining Technology": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Mining Weekly": {
    country: "ZA",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Mining.com": {
    country: "CA",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "MIT Research": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "MIT Tech Policy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "MIT Tech Review": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Owned by MIT."
  },
  "MOFCOM (China)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  Mongabay: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  monitor: {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "unreviewed",
    note: "Anonymous Ukrainian Telegram monitor channel; owner not identifiable."
  },
  "Montreal Gazette": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Moscow Times": {
    country: "NL",
    audience: "diaspora",
    language: "en",
    ownershipClass: "private",
    note: "Russian outlet relocated to Amsterdam after 2022."
  },
  "My Modern Met": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  MyJoyOnline: {
    country: "GH",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "N1 Croatia": {
    country: "HR",
    audience: "domestic",
    language: "hr",
    ownershipClass: "private"
  },
  Naftemporiki: {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "private"
  },
  "Naharnet Lebanon": {
    country: "LB",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Nasdaq-100 & QQQ": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "National Post": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  NATO: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  "Natural Gas & LNG": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Natural Gas News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Nature News": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Naya for Iraq": {
    country: "IQ",
    audience: "domestic",
    language: "ar",
    ownershipClass: "unreviewed",
    note: "Iraq-focused Telegram desk with no disclosed owner."
  },
  "NBC News": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "NBS (China)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  "NDRC (China)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  NDTV: {
    country: "IN",
    audience: "domestic",
    language: "en",
    ownershipClass: "private",
    note: "Feed served via FeedBurner (US host); publisher is Indian."
  },
  "NDTV India": {
    country: "IN",
    audience: "domestic",
    language: "hi",
    ownershipClass: "private",
    note: "Feed served via FeedBurner (US host); publisher is Indian."
  },
  "New Scientist": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "New Unicorns": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "New York Times": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "New York Times World": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  News24: {
    country: "ZA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  NewsMaker: {
    country: "MD",
    audience: "domestic",
    language: "ru",
    ownershipClass: "private"
  },
  NEXTA: {
    country: "PL",
    audience: "diaspora",
    language: "ru",
    ownershipClass: "private",
    note: "Belarusian exile outlet operating from Warsaw."
  },
  "NFT News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "NHK World": {
    country: "JP",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "Japanese public broadcaster with statutory independence; foreign-facing English service."
  },
  "Nickel News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Nikkei Asia": {
    country: "JP",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Nikkei Tech": {
    country: "JP",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Northern Miner": {
    country: "CA",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "NOS Nieuws": {
    country: "NL",
    audience: "domestic",
    language: "nl",
    ownershipClass: "public-service"
  },
  "Novaya Gazeta Europe": {
    country: "LV",
    audience: "diaspora",
    language: "ru",
    ownershipClass: "private",
    note: "Russian exile outlet operating from Riga."
  },
  "NPR News": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "NQ Influence Basket": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  NRC: {
    country: "NL",
    audience: "domestic",
    language: "nl",
    ownershipClass: "private"
  },
  NRK: {
    country: "NO",
    audience: "domestic",
    language: "no",
    ownershipClass: "public-service",
    note: "State-funded broadcaster with statutory editorial independence."
  },
  NTI: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Nuclear Energy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "NV EN": {
    country: "UA",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "O Globo": {
    country: "BR",
    audience: "domestic",
    language: "pt",
    ownershipClass: "private"
  },
  "OC Media": {
    country: "GE",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  OCCRP: {
    country: "NL",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "OECD Digital": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  "Oil & Gas": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "OilPrice.com": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "London-based publisher; repo host mapping says CA."
  },
  "OKO.press": {
    country: "PL",
    audience: "domestic",
    language: "pl",
    ownershipClass: "nonprofit"
  },
  "Oman Observer": {
    country: "OM",
    audience: "domestic",
    language: "en",
    ownershipClass: "state",
    note: "Published by the government-owned Oman Establishment for Press, News, Publication and Advertising."
  },
  Onet: {
    country: "PL",
    audience: "domestic",
    language: "pl",
    ownershipClass: "private"
  },
  "OPEC & Crude": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "OPEC News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Open Source News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "OpenAI News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Optimist Daily": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Options Market": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "ORF Tech (India)": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Oryx OSINT": {
    country: "NL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "OSINT Industries": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "OSINT Live": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram aggregator; owner not identifiable."
  },
  "OSINT Technical": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Pseudonymous X OSINT account with no disclosed operator."
  },
  "Osint Updates": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram OSINT aggregator; operator unknown."
  },
  OSINTdefender: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Individually run OSINT aggregator; ownership not public."
  },
  "OSIntOps News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram aggregator; owner not identifiable."
  },
  OsintTV: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram video aggregator."
  },
  "Ottawa Citizen": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Pajhwok Afghan News": {
    country: "AF",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Pandaily (China)": {
    country: "CN",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  PAP: {
    country: "PL",
    audience: "domestic",
    language: "pl",
    ownershipClass: "state"
  },
  "Paul Graham Essays": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "PBoC (China)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  "PBoC Watch": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "PBS NewsHour": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "nonprofit"
  },
  Pentagon: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Pipelines & Chokepoints": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "PitchBook News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Pivot (Vox)": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Pivot Podcast": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  Politico: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Politico Tech": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  Polityka: {
    country: "PL",
    audience: "domestic",
    language: "pl",
    ownershipClass: "private"
  },
  "Polsat News": {
    country: "PL",
    audience: "domestic",
    language: "pl",
    ownershipClass: "private"
  },
  "Port & Logistics": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Port & Terminal": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Portfolio.hu": {
    country: "HU",
    audience: "domestic",
    language: "hu",
    ownershipClass: "private"
  },
  "Positive.News": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "PR Newswire": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Precious Metals": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Premium Times": {
    country: "NG",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Press TV": {
    country: "IR",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "PressTV (Iran State)": {
    country: "IR",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  Primicias: {
    country: "EC",
    audience: "domestic",
    language: "es",
    ownershipClass: "private"
  },
  "Private Equity": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Product Hunt": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Proto Thema": {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "private"
  },
  "Quds News": {
    country: "PS",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Palestinian news network Telegram channel; ownership opaque."
  },
  "Radio Ndeke Luka": {
    country: "CF",
    audience: "domestic",
    language: "fr",
    ownershipClass: "nonprofit"
  },
  "Radio Okapi": {
    country: "CD",
    audience: "domestic",
    language: "fr",
    ownershipClass: "intergovernmental",
    note: "Run by the UN peacekeeping mission MONUSCO with Fondation Hirondelle."
  },
  "Radio Tamazuj": {
    country: "NL",
    audience: "diaspora",
    language: "en",
    ownershipClass: "nonprofit",
    note: "South Sudan and Sudan focused nonprofit station registered in the Netherlands."
  },
  "Radio-Canada": {
    country: "CA",
    audience: "domestic",
    language: "fr",
    ownershipClass: "public-service",
    note: "State-funded broadcaster with statutory editorial independence."
  },
  RAND: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Ransomware.live": {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Rappler: {
    country: "PH",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Rare Earths News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Reasons to be Cheerful": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Refinery & Disruptions": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Renaissance IPO": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Repubblica: {
    country: "IT",
    audience: "domestic",
    language: "it",
    ownershipClass: "private"
  },
  "Resistance Trench": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous advocacy Telegram channel; owner and base not identifiable."
  },
  "Resource World": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Responsible Statecraft": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  Reuters: {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters Asia": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters Business": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters Commodities": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters Crypto": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "Reuters Energy": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters India": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters LatAm": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters Markets": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters Nasdaq Futures": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters Science": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters US": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Reuters World": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "RFE/RL Central Asia": {
    country: "CZ",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "US-government-funded broadcaster editorially run from Prague; host is rferl.org."
  },
  "RFI Afrique": {
    country: "FR",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "Ingests the RFI English Africa feed."
  },
  "RIETI (Japan)": {
    country: "JP",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "METI-affiliated incorporated administrative agency; ingested via an English Google News query."
  },
  Rigzone: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Rio Tinto News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Risk & Volatility": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "RN Intel": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram OSINT aggregator."
  },
  "Rocket Alert": {
    country: "IL",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  RT: {
    country: "RU",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "RT Russia": {
    country: "RU",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  Rudaw: {
    country: "IQ",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Erbil-based Kurdish network with ruling-party links."
  },
  RUSI: {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  Rzeczpospolita: {
    country: "PL",
    audience: "domestic",
    language: "pl",
    ownershipClass: "private"
  },
  "S&P Global Commodity": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "S&P Global Platts": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  SaaStr: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Saberin (IRGC Intel)": {
    country: "IR",
    audience: "domestic",
    language: "fa",
    ownershipClass: "state"
  },
  "SAFE (China)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  "Sahel Crisis": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "SAMR (China)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  "Sana'a Center": {
    country: "YE",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Saudi Civil Defense": {
    country: "SA",
    audience: "domestic",
    language: "ar",
    ownershipClass: "state"
  },
  Schneier: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  ScienceDaily: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "SEA Startups": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "SEA Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  SEC: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "SEC Filings": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Securelist by Kaspersky": {
    country: "RU",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Kaspersky research blog; company is Moscow-headquartered with a UK holding entity."
  },
  "Seed & Pre-Seed": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Seeking Alpha": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Seeking Alpha Metals": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Seeking Alpha Tech": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  SemiAnalysis: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Semiconductor News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  Semiconductors: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Sequoia Blog": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Seznam Zpr\xE1vy": {
    country: "CZ",
    audience: "domestic",
    language: "cs",
    ownershipClass: "private"
  },
  "Shanghai Financial Portal (People\u2019s Bank of China republication)": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  "Shanghai Stock Exchange": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  Shareable: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Shenzhen Stock Exchange": {
    country: "CN",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  "Shipping & Freight": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Show HN": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Sifted (Europe)": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "London-based, Financial Times-backed; host domain implies EU."
  },
  "Silver Price News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  SilverSeek: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Singapore Government": {
    country: "SG",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Singularity Hub": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Sky News": {
    country: "GB",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Slidstvo.Info": {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "nonprofit"
  },
  "South China Morning Post": {
    country: "HK",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Hong Kong-based, Alibaba-owned; curated as local to China."
  },
  "Sovereign Wealth": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  Sputnik: {
    country: "RU",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Stablecoin Policy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Stanford HAI": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Startup Funding": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Startup School": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Startups LATAM": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Startups.co (LATAM)": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Topic search across many publishers (Latin American startups); no single owner."
  },
  "State Dept": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Stimson Center": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  Stratechery: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Strategic Chokepoints": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Studio Tamani": {
    country: "ML",
    audience: "domestic",
    language: "fr",
    ownershipClass: "nonprofit"
  },
  "Sunny Skyz": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Suspilne: {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "public-service",
    note: "State-funded broadcaster with statutory editorial independence."
  },
  "Svenska Dagbladet": {
    country: "SE",
    audience: "domestic",
    language: "sv",
    ownershipClass: "private"
  },
  "SVT Nyheter": {
    country: "SE",
    audience: "domestic",
    language: "sv",
    ownershipClass: "public-service"
  },
  "Syria Direct": {
    country: "JO",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Syria-focused nonprofit newsroom operating from Amman."
  },
  "Ta Nea": {
    country: "GR",
    audience: "domestic",
    language: "el",
    ownershipClass: "private"
  },
  Tagesschau: {
    country: "DE",
    audience: "domestic",
    language: "de",
    ownershipClass: "public-service"
  },
  "Taipei Times": {
    country: "TW",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Taiwan Ministry of National Defense": {
    country: "TW",
    audience: "domestic",
    language: "zh",
    ownershipClass: "state"
  },
  "Taiwan News": {
    country: "TW",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Taiwan Tech": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Taiwan Tech News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Topic search across many publishers (Taiwanese tech); no single owner."
  },
  "Tanker & Shipping": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Task & Purpose": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Tasnim News EN": {
    country: "IR",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  TASS: {
    country: "RU",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  Tchadinfos: {
    country: "TD",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  "Tech Antitrust": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Tech in Asia": {
    country: "SG",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Tech IPO News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "Tech Newsletters": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Tech.eu": {
    country: "BE",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Host uses a .eu domain; publisher is Brussels-based."
  },
  "TechCabal (Africa)": {
    country: "NG",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  TechCrunch: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "TechCrunch Layoffs": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "TechCrunch Startups": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "TechCrunch Venture": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  TechMeme: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "TechNode (China)": {
    country: "CN",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Techstars News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Telegraph: {
    country: "GB",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  Telex: {
    country: "HU",
    audience: "domestic",
    language: "hu",
    ownershipClass: "private"
  },
  "Thai PBS": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "The Astana Times": {
    country: "KZ",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "The Better India": {
    country: "IN",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Block": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Bridge (Japan)": {
    country: "JP",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Cradle": {
    country: "LB",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "Beirut-based outlet; ownership not publicly disclosed."
  },
  "The CyberWire": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Daily Star": {
    country: "BD",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Defender Dome": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous Telegram conflict aggregator."
  },
  "The Defiant": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Diplomat": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Economist": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Guardian Post": {
    country: "CM",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Hacker News": {
    country: "IN",
    audience: "international",
    language: "en",
    ownershipClass: "private",
    note: "India-run cybersecurity publication; feed served via a US feedburner host."
  },
  "The Hill": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Hindu": {
    country: "IN",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Independent": {
    country: "GB",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Information": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Narwhal": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "The National": {
    country: "AE",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "Owned by International Media Investments, controlled by a senior Abu Dhabi royal who is UAE deputy PM."
  },
  "The New Stack": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Next Web": {
    country: "NL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Pitch": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Pragmatic Engineer": {
    country: "NL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Province": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Reporter Ethiopia": {
    country: "ET",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Sentry": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "The Spectator Index": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Headline aggregator account; ownership not disclosed."
  },
  "The Star (Malaysia)": {
    country: "MY",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Times of Central Asia": {
    country: "KG",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Twenty Minute VC": {
    country: "GB",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Tyee": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "The Verge": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Verge AI": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The Vergecast": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "The War Zone": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "This Week in Startups": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  ThisDay: {
    country: "NG",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Times of India": {
    country: "IN",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Times of Israel": {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Tom's Hardware": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Toronto Star": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Trade & Tariffs": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "Trade Routes": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Trading Tech": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  Treasury: {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "Treasury Watch": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  "TRT World": {
    country: "TR",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Trump - Truth Social": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private",
    note: "Third-party archive of Donald Trump's Truth Social posts."
  },
  "Tuoi Tre News": {
    country: "VN",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "news.tuoitre.vn is the English edition; the catalog lang vi only routes it to Vietnamese digests."
  },
  "TVA Nouvelles": {
    country: "CA",
    audience: "domestic",
    language: "fr",
    ownershipClass: "private"
  },
  TVN24: {
    country: "PL",
    audience: "domestic",
    language: "pl",
    ownershipClass: "private"
  },
  "TVP Info": {
    country: "PL",
    audience: "domestic",
    language: "pl",
    ownershipClass: "public-service",
    note: "State-funded Polish public broadcaster with a statutory public-service remit."
  },
  "TWIST Episodes": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  "U.S. Trade Representative": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "UK MOD": {
    country: "GB",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "UK Tech Policy": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Ukraine State Emergency Service": {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "state"
  },
  "Ukrainska Pravda": {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "private"
  },
  "Ukrainska Pravda EN": {
    country: "UA",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Feed actually ingests euromaidanpress.com (Euromaidan Press, NGO-run), not Ukrainska Pravda."
  },
  Ukrinform: {
    country: "UA",
    audience: "international",
    language: "en",
    ownershipClass: "state",
    note: "English edition ingested via a Google News site: query."
  },
  "UN News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  Unchained: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  UNHCR: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  "Unicorn News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  Upworthy: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Uranium Market": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "US CENTCOM": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "USNI News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Vahid Online": {
    country: "US",
    audience: "diaspora",
    language: "fa",
    ownershipClass: "private",
    note: "Independent Iranian journalist publishing from exile."
  },
  "Vancouver Sun": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Vanguard Nigeria": {
    country: "NG",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "VC Insights": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "VC News": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic search aggregating many publishers; no single owner."
  },
  VentureBeat: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "VentureBeat AI": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Verge Shows": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "Vietnam Tech": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News topic query aggregating many publishers; no single owner."
  },
  "Vision 2030": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search aggregating many publishers; no single owner."
  },
  VnExpress: {
    country: "VN",
    audience: "domestic",
    language: "vi",
    ownershipClass: "private",
    note: "Owned by FPT Corporation; operates under a state press licence like all Vietnamese media."
  },
  "Voice of America": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "US government-funded international broadcaster with a statutory editorial firewall."
  },
  VSquare: {
    country: "PL",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "vx-underground": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous malware-research collective; ownership not public."
  },
  "WAFA English": {
    country: "PS",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Wall Street Journal": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Wamda (MENA)": {
    country: "AE",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "War on the Rocks": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Warfare Analysis": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous analysis channel; ownership not public."
  },
  "Washington Post": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  "Washington Post World": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  Welt: {
    country: "DE",
    audience: "domestic",
    language: "de",
    ownershipClass: "private"
  },
  "White House": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  "White House Actions": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "state"
  },
  WHO: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "intergovernmental"
  },
  "Wilson Center": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Winnipeg Free Press": {
    country: "CA",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  Wired: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Witness: {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Anonymous conflict aggregator; ownership not public."
  },
  "World Gold Council": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search (gold reserves, central bank gold) aggregating many publishers, not the WGC itself."
  },
  "Wu Blockchain": {
    country: "CN",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Xinhua: {
    country: "CN",
    audience: "international",
    language: "en",
    ownershipClass: "state"
  },
  "Y Combinator Blog": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Yahoo Finance": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Yahoo Finance Commodities": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "YC Launches": {
    country: "INTL",
    audience: "international",
    language: "en",
    ownershipClass: "unreviewed",
    note: "Google News keyword search with no site: filter; its rows come from many publishers."
  },
  "YC News": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Yedioth News": {
    country: "IL",
    audience: "domestic",
    language: "he",
    ownershipClass: "private"
  },
  "Yemen Online": {
    country: "YE",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Yes! Magazine": {
    country: "US",
    audience: "domestic",
    language: "en",
    ownershipClass: "nonprofit"
  },
  "Yle News": {
    country: "FI",
    audience: "international",
    language: "en",
    ownershipClass: "public-service",
    note: "State-funded broadcaster with statutory independence; English service."
  },
  Ynetnews: {
    country: "IL",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  "Yonhap News": {
    country: "KR",
    audience: "domestic",
    language: "ko",
    ownershipClass: "public-service",
    note: "Yonhap News TV, subsidiary of the state-funded national agency Yonhap with statutory independence."
  },
  YourStory: {
    country: "IN",
    audience: "domestic",
    language: "en",
    ownershipClass: "private"
  },
  ZDNet: {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "private"
  },
  Zerkalo: {
    country: "PL",
    audience: "diaspora",
    language: "ru",
    ownershipClass: "private",
    note: "Belarusian exile outlet operating from outside Belarus."
  },
  "Ziarul de Gard\u0103": {
    country: "MD",
    audience: "domestic",
    language: "ro",
    ownershipClass: "private"
  },
  "ZN.UA": {
    country: "UA",
    audience: "domestic",
    language: "uk",
    ownershipClass: "private"
  },
  "MIT Tech Review AI": {
    country: "US",
    audience: "international",
    language: "en",
    ownershipClass: "nonprofit",
    note: "Owned by MIT."
  }
};

// server/_shared/outlet-profile.ts
var OUTLET_AUDIENCES = ["domestic", "international", "diaspora"];
var OWNERSHIP_CLASSES = ["state", "public-service", "private", "nonprofit", "intergovernmental", "unreviewed"];
var INTERNATIONAL_HOME = "INTL";
var PROFILES = Object.freeze(
  Object.fromEntries(
    Object.entries(outlet_profile_default).filter(([name]) => !name.startsWith("_"))
  )
);
function getOutletProfile(sourceName) {
  return Object.prototype.hasOwnProperty.call(PROFILES, sourceName) ? PROFILES[sourceName] : null;
}
function outletProfileFields(sourceName) {
  const profile = getOutletProfile(sourceName);
  return {
    homeCountry: profile?.country ?? null,
    audience: profile?.audience ?? null,
    language: profile?.language ?? null,
    ownershipClass: profile?.ownershipClass ?? null
  };
}
function profileClause(fields) {
  if (!fields.homeCountry) return "Outlet profile: none recorded.";
  return `Home ${fields.homeCountry}; ${fields.audience} audience; language ${fields.language}; ownership ${fields.ownershipClass}.`;
}
function withOutletProfile(sourceName, provenance) {
  const fields = outletProfileFields(sourceName);
  const summary = provenance.summary;
  return {
    ...provenance,
    ...fields,
    ...typeof summary === "string" ? { summary: `${summary} ${profileClause(fields)}` } : {}
  };
}
var OUTLET_PROFILE_OUTPUT_PROPERTIES = {
  homeCountry: { type: ["string", "null"], description: `ISO 3166-1 alpha-2 country the outlet is based in, ${INTERNATIONAL_HOME} for intergovernmental or multi-publisher sources, EU for EU institutions. Null when no profile is recorded.` },
  audience: { type: ["string", "null"], enum: [...OUTLET_AUDIENCES, null], description: "Who the outlet writes for: domestic (its home country), international (a global or foreign readership), diaspora (one foreign country or its diaspora, from outside it). Null when no profile is recorded." },
  language: { type: ["string", "null"], description: "ISO 639-1 language of the ingested content. Null when no profile is recorded." },
  ownershipClass: { type: ["string", "null"], enum: [...OWNERSHIP_CLASSES, null], description: "Who owns the outlet. unreviewed means not established (e.g. multi-publisher searches, anonymous channels). Ownership only: not a rating of editorial independence or lean. Null when no profile is recorded." }
};
var OUTLET_PROFILE_REQUIRED = ["homeCountry", "audience", "language", "ownershipClass"];

// shared/news-credibility.js
var CREDIBILITY_WEIGHTS = Object.freeze({
  sourceTier: 0.3,
  propagandaRisk: 0.5,
  independentCorroboration: 0.2
});
var CREDIBILITY_TIER_SCORES = Object.freeze({
  1: 100,
  2: 75,
  3: 50,
  4: 25
});
var CREDIBILITY_RISK_SCORES = Object.freeze({
  low: 100,
  medium: 50,
  unknown: 35,
  high: 12
});
var CREDIBILITY_HIGH_RISK_CAP = 40;
var CREDIBILITY_CORROBORATION_CAP = 5;
var CREDIBILITY_CORROBORATION_PER_SOURCE = 20;
function clampInt(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}
function tierScore(sourceTier) {
  const tier = clampInt(sourceTier, 4, 1, 4);
  return CREDIBILITY_TIER_SCORES[tier] ?? CREDIBILITY_TIER_SCORES[4];
}
function riskScore(propagandaRisk) {
  if (propagandaRisk === "low" || propagandaRisk === "medium" || propagandaRisk === "high") {
    return CREDIBILITY_RISK_SCORES[propagandaRisk];
  }
  return CREDIBILITY_RISK_SCORES.unknown;
}
function corroborationScore(count) {
  const finite = Number.isFinite(count) ? Number(count) : 0;
  const capped = Math.min(Math.max(finite, 0), CREDIBILITY_CORROBORATION_CAP);
  return capped * CREDIBILITY_CORROBORATION_PER_SOURCE;
}
function computeCredibilityScore(input) {
  const source = input && typeof input === "object" ? input : {};
  const base = Math.round(
    tierScore(source.sourceTier) * CREDIBILITY_WEIGHTS.sourceTier + riskScore(source.propagandaRisk) * CREDIBILITY_WEIGHTS.propagandaRisk + corroborationScore(source.independentCorroborationCount) * CREDIBILITY_WEIGHTS.independentCorroboration
  );
  const bounded = Math.min(100, Math.max(0, base));
  if (source.propagandaRisk === "high") {
    return Math.min(bounded, CREDIBILITY_HIGH_RISK_CAP);
  }
  return bounded;
}

// shared/source-tiers.json
var source_tiers_default = {
  "24.hu": 2,
  "36Kr English": 3,
  "444.hu": 2,
  "ABC News": 2,
  "ABC News Australia": 2,
  AEI: 3,
  AFP: 1,
  Agriculture: 4,
  "AI News": 4,
  "AI Now Institute": 3,
  "AI Podcast (NVIDIA)": 3,
  "AI Regulation": 3,
  ANSA: 1,
  "AP News": 1,
  ATV: 2,
  "Aaj Tak": 2,
  "Acquired Podcast": 2,
  "Actualite.cd": 3,
  Aftenposten: 2,
  "Al Jazeera": 2,
  "All-In Podcast": 2,
  "Amar Ujala": 2,
  AMNA: 1,
  "ArXiv AI": 4,
  "Arctic Today": 2,
  Armenpress: 1,
  "Arms Control Assn": 2,
  "Ars Technica": 3,
  "Atlantic Council": 3,
  Axios: 2,
  Azertag: 1,
  "BBC Hindi": 2,
  "BBC Middle East": 2,
  "BBC Mundo": 2,
  "BBC Persian": 2,
  "BBC Russian": 2,
  "BBC Turkce": 2,
  "BBC World": 2,
  "Balkan Insight": 1,
  "Bangkok Post": 2,
  Bellingcat: 3,
  "Benedict Evans": 2,
  "Bihus.Info": 2,
  "Binance Announcements": 2,
  Bloomberg: 1,
  "Bloomberg Markets": 1,
  "BoE Watch": 4,
  "BoJ Watch": 4,
  "Brasil Paralelo": 2,
  "Brazil Tech News": 3,
  "Breaking Defense": 3,
  Brookings: 3,
  "Brookings Tech": 3,
  "Bruegel (EU)": 3,
  "Bulletin of Atomic Scientists": 2,
  "Business Insider": 2,
  "Business Wire": 3,
  "CAC (China)": 1,
  "CB Insights": 2,
  "CBC News": 1,
  "CBS News": 2,
  CDC: 2,
  "Central Bank Rates": 4,
  "Chatham House": 3,
  CISA: 1,
  CNAS: 2,
  CNBC: 2,
  "CNN World": 2,
  "CNN Greece": 2,
  "Commodity Trading": 4,
  "Corporate Bonds": 4,
  CP24: 2,
  "Crypto News": 4,
  CSIS: 3,
  "CSIS Tech": 3,
  "CTV News": 2,
  "Calgary Herald": 3,
  Carnegie: 3,
  Chainwire: 3,
  "Channels TV": 2,
  "Chatham House Tech": 3,
  "China Tech Analysis": 3,
  "China Tech News": 3,
  "China Tech Policy": 3,
  "Chosun Ilbo": 2,
  "Citi Newsroom": 3,
  "Civil.ge": 2,
  "Coinbase Blog": 2,
  "Conservation Optimism": 3,
  "Contxto (LATAM)": 3,
  Correctiv: 3,
  "Corriere della Sera": 2,
  CrisisWatch: 3,
  "Crunchbase News": 2,
  DFRLab: 2,
  DHS: 2,
  DOJ: 2,
  "Dollar Watch": 4,
  "DR Nyheder": 1,
  "DW News": 2,
  "DW Turkish": 2,
  "Dabanga Sudan": 3,
  "Dagens Nyheter": 2,
  "Daily Sabah": 2,
  "Daily Trust": 3,
  DailyGood: 3,
  Dawn: 2,
  "De Telegraaf": 2,
  DealStreetAsia: 3,
  "Decoder (Verge)": 3,
  "Defense News": 3,
  "Defense One": 3,
  "Der Spiegel": 2,
  "Die Zeit": 2,
  Digi24: 2,
  DigiChina: 2,
  Dnevnik: 2,
  "Earnings Reports": 4,
  "ECB Watch": 4,
  ECFR: 3,
  "EFF News": 3,
  "ERR News": 2,
  ERT: 1,
  "EU Commission Digital": 2,
  "EU Digital Policy": 3,
  "EU ISS": 3,
  "EU Startups": 3,
  "Edmonton Journal": 3,
  "El Mundo": 2,
  "El Pa\xEDs": 2,
  "Entrackr (India)": 3,
  "Ethiopia Insight": 3,
  Eurasianet: 2,
  EuroNews: 2,
  "Eye on AI": 3,
  "FAO GIEWS": 2,
  FAS: 3,
  FEMA: 2,
  FPRI: 3,
  "Fars News": 3,
  "Federal Reserve": 3,
  "Financial Post": 2,
  "Financial Times": 2,
  "Focus Taiwan": 1,
  "Foreign Affairs": 3,
  "Foreign Policy": 3,
  "Fox Business": 2,
  "Fox News": 2,
  "France 24": 2,
  "France 24 Africa": 2,
  "France 24 Asia Pacific": 2,
  "France 24 LatAm": 2,
  "FX Empire Gold": 3,
  G4Media: 2,
  "Gazeta Wyborcza": 1,
  GITOC: 3,
  "Global Central Banks": 4,
  GMF: 3,
  "GNN Animals": 3,
  "GNN Earth": 3,
  "GNN Health": 3,
  "GNN Heroes": 3,
  "GNN Heroes Spotlight": 3,
  "GNN Science": 3,
  "Gold Silver Worlds": 4,
  GoldSeek: 4,
  "GOOD Magazine": 3,
  "Geo News": 2,
  "GloNewswire (Taiwan)": 4,
  "Global News": 2,
  "Globe and Mail": 2,
  GlobeNewswire: 3,
  "Good Good Good": 3,
  "Good News Network": 2,
  "Gradient Dissent": 3,
  "Greater Good (Berkeley)": 3,
  "Guardian Africa": 2,
  "Guardian Australia": 2,
  "Guardian Caribbean": 2,
  "Guardian ME": 2,
  "Guardian Pacific": 2,
  "Guardian World": 2,
  "Housing Market": 4,
  HVG: 2,
  "Hacker News": 4,
  Handelsblatt: 2,
  "Hard Fork (NYT)": 2,
  "Hiiraan Online": 3,
  HotNews: 2,
  "How I Built This": 2,
  Hromadske: 2,
  "Hromadske EN": 2,
  Hurriyet: 2,
  H\u00EDrad\u00F3: 2,
  IAEA: 1,
  "Investing.com News": 3,
  "ISEAS (Singapore)": 3,
  ISW: 2,
  "Inc42 (India)": 3,
  "Index.hr": 2,
  "Index.hu": 2,
  "India Tech News": 3,
  "India Tech Policy": 3,
  "Interfax EN": 1,
  "Interfax RU": 1,
  "Iran International": 3,
  Irrawaddy: 3,
  JAMnews: 3,
  "Jakarta Post": 2,
  Jamestown: 3,
  Janes: 3,
  "Japan Tech News": 3,
  Jin10: 2,
  "Jutarnji list": 2,
  "KED Global": 3,
  Kathimerini: 2,
  "Korea Tech News": 3,
  "Krebs Security": 3,
  "LATAM Fintech": 3,
  "LATAM Tech News": 3,
  "Live Science": 3,
  "LRT English": 2,
  "LSM English": 2,
  "La Presse": 2,
  "La Silla Vac\xEDa": 3,
  "Layoffs News": 4,
  "Layoffs.fyi": 3,
  "Le Devoir": 2,
  "Le Monde": 2,
  "Le Quotidien": 3,
  "Lenny Newsletter": 2,
  "Lex Fridman Tech": 3,
  "Liberal GR": 2,
  "Lighthouse Reports": 3,
  "Lowy Institute": 3,
  "M&A News": 4,
  "Middle East Institute": 3,
  "MIIT (China)": 1,
  "MIT Tech Policy": 3,
  "MIT Tech Review": 3,
  "MOFCOM (China)": 1,
  "Maclean's": 3,
  Magnitt: 3,
  MarketWatch: 2,
  "Masters of Scale": 2,
  Meduza: 2,
  "Mexico News Daily": 2,
  "Mexico Tech News": 3,
  "Military Times": 2,
  Mongabay: 3,
  "Montreal Gazette": 2,
  "My Modern Met": 2,
  MyJoyOnline: 2,
  "N1 Croatia": 2,
  "NBC News": 2,
  "NDRC (China)": 1,
  "NDTV India": 2,
  "New Scientist": 3,
  "NHK World": 2,
  "NOS Nieuws": 1,
  "NPR News": 2,
  NRC: 2,
  NRK: 1,
  NTI: 3,
  "NV EN": 2,
  Naftemporiki: 2,
  "National Post": 2,
  NewsMaker: 2,
  "Nikkei Asia": 2,
  "Nikkei Tech": 2,
  "Novaya Gazeta Europe": 2,
  "OC Media": 2,
  OCCRP: 2,
  "OECD Digital": 2,
  "OKO.press": 2,
  Onet: 2,
  "ORF Tech (India)": 3,
  "OpenAI News": 3,
  "Optimist Daily": 2,
  "Oryx OSINT": 2,
  "Ottawa Citizen": 3,
  "PBS NewsHour": 2,
  "PBoC (China)": 1,
  "PR Newswire": 3,
  "Pandaily (China)": 3,
  PAP: 1,
  "Paul Graham Essays": 2,
  Pentagon: 1,
  "PitchBook News": 2,
  "Pivot (Vox)": 2,
  Politico: 2,
  "Politico Tech": 2,
  Polityka: 2,
  "Polsat News": 2,
  "Portfolio.hu": 2,
  "Positive.News": 2,
  "Premium Times": 2,
  "Proto Thema": 3,
  RAND: 3,
  "Reuters Markets": 1,
  "RFE/RL Central Asia": 2,
  "RFI Afrique": 2,
  "RIETI (Japan)": 3,
  RT: 3,
  "RT Russia": 3,
  RUSI: 2,
  "Radio Okapi": 3,
  "Radio Tamazuj": 3,
  "Radio-Canada": 1,
  "Ransomware.live": 3,
  Rappler: 2,
  "Reasons to be Cheerful": 2,
  Repubblica: 2,
  "Responsible Statecraft": 3,
  Reuters: 1,
  "Reuters Business": 1,
  "Reuters India": 1,
  "Reuters US": 1,
  "Reuters World": 1,
  Rzeczpospolita: 2,
  "SAMR (China)": 1,
  SEC: 3,
  SilverSeek: 4,
  "SVT Nyheter": 1,
  "Sequoia Blog": 2,
  "Seznam Zpr\xE1vy": 2,
  Shareable: 3,
  "Sifted (Europe)": 3,
  "Slidstvo.Info": 2,
  "Stanford HAI": 2,
  "Startups.co (LATAM)": 3,
  "State Dept": 1,
  "Stimson Center": 3,
  Stratechery: 2,
  "Sunny Skyz": 3,
  Suspilne: 1,
  "Svenska Dagbladet": 2,
  TASS: 3,
  "Treasury Watch": 4,
  "TVA Nouvelles": 2,
  TVN24: 2,
  "TVP Info": 2,
  Tagesschau: 1,
  "Ta Nea": 2,
  "Taipei Times": 2,
  "Taiwan News": 2,
  "Taiwan Tech News": 3,
  "Task & Purpose": 3,
  "Tech Antitrust": 3,
  "Tech in Asia": 3,
  "Tech.eu": 3,
  "TechCabal (Africa)": 3,
  "TechCrunch Layoffs": 4,
  "TechNode (China)": 3,
  Telegraph: 2,
  Telex: 2,
  "Thai PBS": 2,
  "The Astana Times": 2,
  "The Better India": 3,
  "The Bridge (Japan)": 3,
  "The Diplomat": 3,
  "The Hill": 3,
  "The Information": 2,
  "The Narwhal": 3,
  "The National": 2,
  "The Next Web": 3,
  "The Pitch": 3,
  "The Pragmatic Engineer": 2,
  "The Province": 2,
  "The Reporter Ethiopia": 3,
  "The Sentry": 3,
  "The Star (Malaysia)": 2,
  "The Times of Central Asia": 3,
  "Times of India": 2,
  "The Twenty Minute VC": 2,
  "The Tyee": 3,
  "The Verge": 4,
  "The Verge AI": 4,
  "The Vergecast": 3,
  "The War Zone": 3,
  "This Week in Startups": 3,
  ThisDay: 2,
  "Toronto Star": 2,
  Treasury: 2,
  "Tuoi Tre News": 2,
  "U.S. Trade Representative": 1,
  "UK MOD": 1,
  "UK Tech Policy": 3,
  "UN News": 1,
  UNHCR: 1,
  "USNI News": 2,
  "Ukrainska Pravda": 2,
  "Ukrainska Pravda EN": 2,
  Ukrinform: 1,
  Upworthy: 3,
  VSquare: 3,
  "Vancouver Sun": 3,
  "Vanguard Nigeria": 2,
  "VentureBeat AI": 4,
  VnExpress: 2,
  WHO: 1,
  "Wall Street Journal": 1,
  "Wamda (MENA)": 3,
  "War on the Rocks": 2,
  Welt: 2,
  "White House": 1,
  "White House Actions": 1,
  "Wilson Center": 3,
  "Winnipeg Free Press": 3,
  Wired: 2,
  Xinhua: 3,
  "Y Combinator Blog": 2,
  "Yahoo Finance": 4,
  "Yes! Magazine": 2,
  "Yle News": 1,
  "Yonhap News": 2,
  YourStory: 3,
  "ZN.UA": 2,
  Zerkalo: 2,
  "Ziarul de Gard\u0103": 3,
  "a16z Blog": 2,
  "a16z Podcast": 2,
  "e27 (SEA)": 3,
  gCaptain: 3,
  iPolitics: 3,
  iefimerida: 3,
  "in.gr": 3,
  "14ymedio": 2,
  "+972 Magazine": 2,
  ActuNiger: 2,
  "A\xEFr Info": 2,
  "Alwihda Info": 2,
  "Amu TV": 2,
  Annahar: 2,
  AyiboPost: 2,
  "Caracas Chronicles": 2,
  "Daily Nation": 2,
  "Dhaka Tribune": 2,
  "Efecto Cocuyo": 2,
  "Egypt Independent": 2,
  "Enab Baladi English": 2,
  "HaitiLibre English": 2,
  "Havana Times": 2,
  "Libya Herald": 2,
  "L'Orient Today": 2,
  "Mada Masr": 2,
  "Naharnet Lebanon": 2,
  "Pajhwok Afghan News": 2,
  "Radio Ndeke Luka": 2,
  "Sana'a Center": 2,
  "Studio Tamani": 2,
  "Syria Direct": 2,
  Tchadinfos: 2,
  "The Daily Star": 2,
  "The Guardian Post": 2,
  "WAFA English": 3,
  "Yemen Online": 2,
  "leFaso.net": 2,
  "New York Times World": 2,
  "Washington Post World": 2,
  "The Independent": 2,
  "Sky News": 2,
  "Japan Times": 2,
  "BBC UK": 2,
  "BBC Northern Ireland": 2,
  "Reuters Science": 1,
  "Nature News": 2,
  "BBC Science": 2,
  "Guardian Science": 2,
  ScienceDaily: 3,
  "AP Mexico": 1,
  "Reuters LatAm": 1,
  "BBC Afrique": 2,
  "El Tiempo": 2,
  "Folha de S.Paulo": 2,
  "O Globo": 2,
  "Indian Express": 2,
  "Asharq News": 3,
  "Mehr News": 3,
  Bild: 3,
  "Latin America": 4,
  "Mexico Security": 4,
  "Mining & Resources": 4,
  "India News Network": 4,
  "Africa Startups": 4,
  "Africa Tech News": 4,
  "Asia VC News": 4,
  "Brazil Tech": 4,
  "China Startups": 4,
  "China Tech Giants": 4,
  "FinTech LATAM": 4,
  "India Startups": 4,
  "Indonesia Tech": 4,
  "Japan Startups": 4,
  "Korea Startups": 4,
  KrASIA: 3,
  "LATAM Startups": 4,
  "MENA Startups": 4,
  "MENA Tech News": 4,
  "SEA Startups": 4,
  "SEA Tech News": 4,
  "Startups LATAM": 4,
  "Taiwan Tech": 4,
  "Vietnam Tech": 4,
  "CB Insights Unicorn": 2,
  "Lenny's Newsletter": 2,
  "MarketWatch Tech": 2,
  "DevOps.com": 3,
  Engadget: 3,
  "Fast Company": 3,
  "FwdStart Newsletter": 3,
  "MIT Research": 3,
  "MIT Tech Review AI": 3,
  "Renaissance IPO": 3,
  SaaStr: 3,
  Schneier: 3,
  "Seeking Alpha Tech": 3,
  "TechCrunch Venture": 3,
  ZDNet: 3,
  "500 Global News": 4,
  "AI Weekly": 4,
  "AngelList News": 4,
  "Anthropic News": 4,
  "ArXiv ML": 4,
  "Dev Events": 4,
  "Fortune Term Sheet": 4,
  "GitHub Trending": 4,
  "New Unicorns": 4,
  "Open Source News": 4,
  "SEC Filings": 4,
  "Seed & Pre-Seed": 4,
  "Startup Funding": 4,
  "Startup School": 4,
  TechMeme: 4,
  "Techstars News": 4,
  "VC Insights": 4,
  "YC Launches": 4
};

// server/_shared/source-tiers.ts
var SOURCE_TIERS = {
  ...source_tiers_default,
  ...TELEGRAM_SOURCE_TIERS,
  ...X_ACCOUNT_SOURCE_TIERS
};
function getSourceTier(sourceName) {
  return SOURCE_TIERS[sourceName] ?? 4;
}
var TIER_MEANING = Object.freeze({
  1: "Wire services and official bodies",
  2: "Major outlets",
  3: "Specialist, regional and think-tank sources",
  4: "Aggregators and blogs"
});
function declaredSourceTier(sourceName) {
  const tier = Object.prototype.hasOwnProperty.call(SOURCE_TIERS, sourceName) ? SOURCE_TIERS[sourceName] : declaredTierByNormalizedName().get(normalizeSourceName(sourceName));
  return tier === 1 || tier === 2 || tier === 3 || tier === 4 ? tier : null;
}
var normalizeSourceName = (name) => name.trim().toLowerCase();
var normalizedTiers = null;
function declaredTierByNormalizedName() {
  if (!normalizedTiers) {
    normalizedTiers = /* @__PURE__ */ new Map();
    for (const [name, tier] of Object.entries(SOURCE_TIERS)) {
      const key = normalizeSourceName(name);
      if (!normalizedTiers.has(key)) normalizedTiers.set(key, tier);
    }
  }
  return normalizedTiers;
}

// server/_shared/corroboration.ts
var CORROBORATION_STATES = ["corroborated", "single-publisher", "tier4-only", "unknown"];
var UNKNOWN = { state: "unknown" };
var SINGLE_PUBLISHER = { state: "single-publisher", publishers: 1 };
function positiveCount(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 1 ? Math.floor(value) : null;
}
function claimLabels(evidence) {
  return (evidence.kind === "grouped" ? evidence.labels : [evidence.label]).filter((label) => publisherFamilyFor(label) !== "");
}
var isCuratedFamily = (family) => Object.prototype.hasOwnProperty.call(PUBLISHER_FAMILIES, family);
function publisherKeyFor(evidence) {
  const merged = /* @__PURE__ */ new Map();
  if (evidence.kind === "grouped") {
    for (const group of evidence.sameCopy ?? []) {
      const families = group.filter((family) => typeof family === "string" && family !== "");
      const key = families.find(isCuratedFamily) ?? families[0];
      for (const family of families) if (!merged.has(family)) merged.set(family, key);
    }
  }
  return (label) => {
    const family = publisherFamilyFor(label);
    return merged.get(family) ?? family;
  };
}
function assessCorroboration(evidence) {
  const labels = claimLabels(evidence);
  const seen = new Set(labels.map(publisherKeyFor(evidence))).size;
  const reported = positiveCount(evidence.reportedPublishers);
  if (evidence.kind === "item" && reported === null) return UNKNOWN;
  if (evidence.kind === "grouped" && seen === 0) return UNKNOWN;
  const publishers = Math.max(seen, reported ?? 0);
  if (publishers <= 1) return SINGLE_PUBLISHER;
  if (reported !== null && reported > seen || evidence.kind === "item") {
    return { state: "corroborated", publishers };
  }
  return labels.every((label) => declaredSourceTier(label) === 4) ? { state: "tier4-only", publishers } : { state: "corroborated", publishers };
}
var tierRank = (tier) => tier ?? 5;
function publisherRoster(evidence) {
  const keyFor = publisherKeyFor(evidence);
  const byKey = /* @__PURE__ */ new Map();
  for (const label of claimLabels(evidence)) {
    const key = keyFor(label);
    const entry = byKey.get(key) ?? { labels: [], tier: null, tierLabel: null, families: /* @__PURE__ */ new Set() };
    if (!entry.labels.includes(label)) entry.labels.push(label);
    entry.families.add(publisherFamilyFor(label));
    const tier = declaredSourceTier(label);
    if (tier !== null && (entry.tier === null || tier < entry.tier)) {
      entry.tier = tier;
      entry.tierLabel = label;
    }
    byKey.set(key, entry);
  }
  return [...byKey].map(([family, { labels, tier, tierLabel, families }]) => ({
    family,
    name: isCuratedFamily(family) ? publisherNameForFamily(family) : (tierLabel ?? labels[0]).trim(),
    tier,
    labels,
    ...families.size > 1 ? { sameCopy: true } : {}
  })).sort((a, b) => tierRank(a.tier) - tierRank(b.tier) || a.name.localeCompare(b.name, "en"));
}
function evidenceFromCluster(cluster) {
  let reported = null;
  for (const item of cluster.allItems) {
    const count = positiveCount(item.corroborationCount);
    if (count !== null && (reported === null || count > reported)) reported = count;
  }
  const { groups } = detectSyndication(cluster.allItems, (item) => publisherFamilyFor(item.source));
  return {
    kind: "grouped",
    labels: cluster.allItems.map((item) => item.source),
    reportedPublishers: reported,
    ...groups.length > 0 ? { sameCopy: groups.map((group) => group.families) } : {}
  };
}
function toCorroborationJson(c) {
  return c.state === "unknown" ? { state: "unknown", publishers: null } : { state: c.state, publishers: c.publishers };
}
var CORROBORATION_OUTPUT_SCHEMA = Object.freeze({
  type: "object",
  description: "Coverage of this claim across the sources WorldMonitor monitors. Describes coverage, not accuracy: no state says the claim is true or false.",
  required: ["state", "publishers"],
  properties: {
    state: {
      type: "string",
      enum: [...CORROBORATION_STATES],
      description: "single-publisher: one publisher family carries it. tier4-only: two or more families, every one a declared tier-4 outlet (aggregators and blogs). corroborated: two or more families, not all tier 4. unknown: no evidence to judge. An undeclared tier never counts as tier 4."
    },
    publishers: {
      type: ["integer", "null"],
      description: "Distinct publisher families behind the claim; null when state is unknown."
    }
  }
});
var PUBLISHER_ROSTER_CAP = 8;
var PUBLISHER_ROSTER_LABEL_CAP = 4;
var PUBLISHER_ROSTER_STRING_MAX_BYTES = 40;
function capUtf8(value, maxBytes) {
  let bytes = 0;
  let end = 0;
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    const size = codePoint <= 127 ? 1 : codePoint <= 2047 ? 2 : codePoint <= 65535 ? 3 : 4;
    if (bytes + size > maxBytes) break;
    bytes += size;
    end += character.length;
  }
  return value.slice(0, end);
}
function toPublisherRosterJson(roster, verdict) {
  const cap = (value) => capUtf8(value, PUBLISHER_ROSTER_STRING_MAX_BYTES);
  const publishers = roster.slice(0, PUBLISHER_ROSTER_CAP).map(({ name, tier, labels }) => ({
    name: cap(name),
    tier,
    labels: labels.slice(0, PUBLISHER_ROSTER_LABEL_CAP).map(cap),
    labelsUnlisted: Math.max(0, labels.length - PUBLISHER_ROSTER_LABEL_CAP)
  }));
  const knownTotal = verdict.state === "unknown" ? 0 : verdict.publishers;
  return {
    publishers,
    publishersUnlisted: Math.max(0, Math.max(roster.length, knownTotal) - publishers.length)
  };
}
var TIER_LEGEND = [1, 2, 3, 4].map((tier) => `${tier} ${TIER_MEANING[tier]}`).join("; ");
var DECLARED_TIER_SCHEMA = Object.freeze({
  type: ["integer", "null"],
  enum: [1, 2, 3, 4, null],
  description: `Tier declared for this source in WorldMonitor's source tables: ${TIER_LEGEND}. null means not declared, never tier 4. Tiers rank sources; they do not judge a claim.`
});
var PUBLISHER_ROSTER_OUTPUT_PROPERTIES = Object.freeze({
  publishers: {
    type: "array",
    description: `Distinct publisher families behind this claim, from the same source labels as corroboration: best declared tier first, undeclared last, then name. Up to ${PUBLISHER_ROSTER_CAP}.`,
    items: {
      type: "object",
      required: ["name", "tier", "labels", "labelsUnlisted"],
      properties: {
        name: { type: "string", description: `Publisher name, or the feed label when no publisher family is curated. At most ${PUBLISHER_ROSTER_STRING_MAX_BYTES} UTF-8 bytes.` },
        tier: { ...DECLARED_TIER_SCHEMA, description: `Best tier declared among this claim's labels for the publisher: ${TIER_LEGEND}. null means none is declared, never tier 4. Tiers rank sources; they do not judge the claim.` },
        labels: { type: "array", items: { type: "string" }, description: `Feed labels seen for this publisher, first seen first, up to ${PUBLISHER_ROSTER_LABEL_CAP}. The tier is read from every seen label, listed or not. Each at most ${PUBLISHER_ROSTER_STRING_MAX_BYTES} UTF-8 bytes; the sources list carries the full label.` },
        labelsUnlisted: { type: "integer", minimum: 0, description: "Feed labels seen for this publisher beyond those labels lists." }
      }
    }
  },
  publishersUnlisted: {
    type: "integer",
    minimum: 0,
    description: `Publishers counted in corroboration.publishers that publishers does not name: those past the first ${PUBLISHER_ROSTER_CAP}, and those the digest counted whose feed labels this response does not carry. publishers.length + publishersUnlisted equals corroboration.publishers when corroboration.state is not unknown.`
  }
});

// shared/brief-llm-core.js
var ACRONYM_EXPANSIONS = [
  ["WHO", "World Health Organization"],
  ["ICC", "International Criminal Court"],
  ["UN", "United Nations"],
  ["US", "USA", "United States", "United States of America", "America"],
  ["UK", "United Kingdom", "Britain", "Great Britain"],
  ["EU", "European Union"],
  ["IDF", "Israel Defense Forces", "Israeli Defense Forces"],
  ["IMF", "International Monetary Fund"],
  ["WTO", "World Trade Organization"],
  ["NATO", "North Atlantic Treaty Organization"],
  ["OECD"],
  ["OPEC", "Organization of the Petroleum Exporting Countries"],
  ["IAEA", "International Atomic Energy Agency"],
  ["ASEAN"],
  ["ECOWAS"],
  ["BRICS"],
  ["DOJ", "Department of Justice", "Justice Department"],
  ["FBI", "Federal Bureau of Investigation"],
  ["SEC", "Securities and Exchange Commission"],
  ["CIA", "Central Intelligence Agency"],
  ["NSA", "National Security Agency"],
  ["DOD", "Department of Defense", "Defense Department", "Pentagon"],
  ["DR Congo", "Democratic Republic of Congo", "DRC"],
  ["UAE", "United Arab Emirates"]
];
var DEMONYM_TO_NATION = /* @__PURE__ */ new Map([
  ["Israeli", "Israel"],
  ["Israelis", "Israel"],
  ["American", "United States"],
  ["Americans", "United States"],
  ["Iranian", "Iran"],
  ["Iranians", "Iran"],
  ["Russian", "Russia"],
  ["Russians", "Russia"],
  ["Chinese", "China"],
  ["French", "France"],
  ["German", "Germany"],
  ["Germans", "Germany"],
  ["Japanese", "Japan"],
  ["Lebanese", "Lebanon"],
  ["Syrian", "Syria"],
  ["Syrians", "Syria"],
  ["Saudi", "Saudi Arabia"],
  ["Saudis", "Saudi Arabia"],
  ["Egyptian", "Egypt"],
  ["Egyptians", "Egypt"],
  ["Turkish", "Turkey"],
  ["Turks", "Turkey"],
  ["Indian", "India"],
  ["Indians", "India"],
  ["Pakistani", "Pakistan"],
  ["Pakistanis", "Pakistan"],
  ["British", "United Kingdom"],
  ["Briton", "United Kingdom"],
  ["Britons", "United Kingdom"],
  ["Ukrainian", "Ukraine"],
  ["Ukrainians", "Ukraine"],
  ["Palestinian", "Palestine"],
  ["Palestinians", "Palestine"],
  ["Yemeni", "Yemen"],
  ["Yemenis", "Yemen"],
  ["Iraqi", "Iraq"],
  ["Iraqis", "Iraq"],
  ["Afghan", "Afghanistan"],
  ["Afghans", "Afghanistan"],
  ["Spanish", "Spain"],
  ["Italian", "Italy"],
  ["Italians", "Italy"],
  ["Korean", "Korea"],
  ["Koreans", "Korea"],
  ["Vietnamese", "Vietnam"],
  ["Mexican", "Mexico"],
  ["Mexicans", "Mexico"],
  ["Brazilian", "Brazil"],
  ["Brazilians", "Brazil"],
  ["Canadian", "Canada"],
  ["Canadians", "Canada"],
  ["Australian", "Australia"],
  ["Australians", "Australia"],
  ["Cuban", "Cuba"],
  ["Cubans", "Cuba"],
  ["Venezuelan", "Venezuela"],
  ["Venezuelans", "Venezuela"],
  ["Argentine", "Argentina"],
  ["Argentinian", "Argentina"],
  ["Argentinians", "Argentina"],
  ["Polish", "Poland"],
  ["Dutch", "Netherlands"],
  ["Greek", "Greece"],
  ["Greeks", "Greece"],
  ["Portuguese", "Portugal"],
  ["Swiss", "Switzerland"],
  ["Swedish", "Sweden"],
  ["Swedes", "Sweden"],
  ["Norwegian", "Norway"],
  ["Norwegians", "Norway"],
  ["Finnish", "Finland"],
  ["Finns", "Finland"],
  ["Danish", "Denmark"],
  ["Danes", "Denmark"],
  ["Belgian", "Belgium"],
  ["Belgians", "Belgium"],
  ["Austrian", "Austria"],
  ["Austrians", "Austria"],
  ["Philippine", "Philippines"],
  ["Filipino", "Philippines"],
  ["Filipinos", "Philippines"],
  ["Thai", "Thailand"],
  ["Thais", "Thailand"],
  ["Indonesian", "Indonesia"],
  ["Indonesians", "Indonesia"],
  ["Nigerian", "Nigeria"],
  ["Nigerians", "Nigeria"],
  ["Ethiopian", "Ethiopia"],
  ["Ethiopians", "Ethiopia"],
  ["Kenyan", "Kenya"],
  ["Kenyans", "Kenya"],
  ["South Korean", "South Korea"],
  ["South Koreans", "South Korea"],
  ["North Korean", "North Korea"],
  ["North Koreans", "North Korea"]
]);
var ACRONYM_NORMALIZE = (() => {
  const map = /* @__PURE__ */ new Map();
  for (const group of ACRONYM_EXPANSIONS) {
    const canonical = group[0].toLowerCase();
    for (const variant of group) map.set(variant.toLowerCase(), canonical);
  }
  return map;
})();
var AND_JOINED_ACRONYM_VARIANTS = ACRONYM_EXPANSIONS.flatMap((group) => group).map((variant) => variant.toLowerCase().split(/\s+/)).filter((tokens) => tokens.includes("and"));
var DEMONYM_NORMALIZE = (() => {
  const map = /* @__PURE__ */ new Map();
  for (const [demonym, nation] of DEMONYM_TO_NATION) {
    map.set(demonym.toLowerCase(), nation.toLowerCase());
  }
  return map;
})();
var NUMBER_FACT_WORD_VALUES = /* @__PURE__ */ new Map([
  ["zero", 0],
  ["one", 1],
  ["two", 2],
  ["three", 3],
  ["four", 4],
  ["five", 5],
  ["six", 6],
  ["seven", 7],
  ["eight", 8],
  ["nine", 9],
  ["ten", 10],
  ["eleven", 11],
  ["twelve", 12],
  ["thirteen", 13],
  ["fourteen", 14],
  ["fifteen", 15],
  ["sixteen", 16],
  ["seventeen", 17],
  ["eighteen", 18],
  ["nineteen", 19],
  ["twenty", 20],
  ["thirty", 30],
  ["forty", 40],
  ["fifty", 50],
  ["sixty", 60],
  ["seventy", 70],
  ["eighty", 80],
  ["ninety", 90],
  ["hundred", 100],
  ["thousand", 1e3],
  ["thousands", 1e3],
  ["million", 1e6],
  ["millions", 1e6],
  ["billion", 1e9],
  ["billions", 1e9],
  ["trillion", 1e12],
  ["trillions", 1e12],
  ["dozen", 12]
]);
var NUMBER_FACT_WORDS = [...NUMBER_FACT_WORD_VALUES.keys(), "dozens"];
var NUMBER_FACT_WORD_PATTERN = NUMBER_FACT_WORDS.sort((a, b) => b.length - a.length).join("|");
var NUMBER_FACT_WORD_SEQUENCE_RE = new RegExp(
  `\\b(?:${NUMBER_FACT_WORD_PATTERN})(?:[- ](?:${NUMBER_FACT_WORD_PATTERN}|and))*\\b(?:\\s+percent\\b)?`,
  "gi"
);
var DIGIT_FACT_RE = /\d[\d,]*(?:\.\d+)?(?:\s*(?:%|percent|thousands?|millions?|billions?|bil\b|trillions?))?/gi;
var DATE_MONTH_PATTERN = "Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?";
var DATE_EXPRESSION_RE = new RegExp(
  `\\b(?:\\d{4}-\\d{1,2}-\\d{1,2}|\\d{1,2}[/-]\\d{1,2}(?:[/-]\\d{2,4})?|(?:${DATE_MONTH_PATTERN})\\.?\\s+\\d{1,2}(?:,?\\s+\\d{4})?|\\d{1,2}\\s+(?:${DATE_MONTH_PATTERN})\\.?\\s*(?:\\d{4})?)\\b`,
  "gi"
);
var DATE_MONTH_NUMBERS = /* @__PURE__ */ new Map([
  ["jan", 1],
  ["january", 1],
  ["feb", 2],
  ["february", 2],
  ["mar", 3],
  ["march", 3],
  ["apr", 4],
  ["april", 4],
  ["may", 5],
  ["jun", 6],
  ["june", 6],
  ["jul", 7],
  ["july", 7],
  ["aug", 8],
  ["august", 8],
  ["sep", 9],
  ["sept", 9],
  ["september", 9],
  ["oct", 10],
  ["october", 10],
  ["nov", 11],
  ["november", 11],
  ["dec", 12],
  ["december", 12]
]);
function formatNumericFact(value) {
  return String(value);
}
function normalizeDigitFact(raw) {
  const match = raw.trim().toLowerCase().replace(/,/g, "").match(
    /^(\d+(?:\.\d+)?)(?:\s*(%|percent|thousands?|millions?|billions?|bil\b|trillions?))?$/
  );
  if (!match) return `number:${raw.trim().toLowerCase()}`;
  const value = Number(match[1]);
  if (!Number.isFinite(value)) return `number:${raw.trim().toLowerCase()}`;
  const unit = match[2];
  if (!unit) return `number:${formatNumericFact(value)}`;
  if (unit === "%" || unit === "percent") return `number:${formatNumericFact(value)}%`;
  const scale = NUMBER_FACT_WORD_VALUES.get(unit === "bil" ? "billion" : unit.replace(/s$/, ""));
  return scale ? `number:${formatNumericFact(value * scale)}` : `number:${formatNumericFact(value)} ${unit}`;
}
function normalizeNumberWordFact(raw) {
  const words2 = raw.toLowerCase().replace(/-/g, " ").split(/\s+/).filter(Boolean);
  let percent = false;
  if (words2.at(-1) === "percent") {
    percent = true;
    words2.pop();
  }
  if (words2.includes("dozen") || words2.includes("dozens")) return `word:${words2.join(" ")}`;
  let total = 0;
  let current = 0;
  let sawValue = false;
  for (const word of words2) {
    if (word === "and") continue;
    const value2 = NUMBER_FACT_WORD_VALUES.get(word);
    if (value2 == null) return `word:${words2.join(" ")}`;
    sawValue = true;
    if (value2 >= 100) {
      if (current === 0) current = 1;
      if (value2 >= 1e3) {
        total += current * value2;
        current = 0;
      } else {
        current *= value2;
      }
    } else {
      current += value2;
    }
  }
  if (!sawValue) return `word:${words2.join(" ")}`;
  const value = total + current;
  return `number:${formatNumericFact(value)}${percent ? "%" : ""}`;
}
function addDateFact(facts, year, month, day, dateParts = true) {
  const monthNumber = Number(month);
  const dayNumber = Number(day);
  if (!Number.isInteger(monthNumber) || !Number.isInteger(dayNumber)) return;
  if (monthNumber < 1 || monthNumber > 12 || dayNumber < 1 || dayNumber > 31) return;
  const monthPart = String(monthNumber).padStart(2, "0");
  const dayPart = String(dayNumber).padStart(2, "0");
  facts.add(`date:${monthPart}-${dayPart}`);
  if (dateParts) {
    facts.add(`number:${formatNumericFact(monthNumber)}`);
    facts.add(`number:${formatNumericFact(dayNumber)}`);
  }
  if (year != null && year !== "") {
    const yearNumber = Number(year);
    if (Number.isInteger(yearNumber)) {
      facts.add(`date:${yearNumber}-${monthPart}-${dayPart}`);
      if (dateParts) facts.add(`number:${formatNumericFact(yearNumber)}`);
    }
  }
}
function addDateExpressionFacts(facts, raw, dateParts) {
  const normalized = raw.trim().replace(/\s+/g, " ");
  let match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    addDateFact(facts, match[1], match[2], match[3], dateParts);
    return;
  }
  match = normalized.match(/^(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?$/);
  if (match) {
    addDateFact(facts, match[3], match[1], match[2], dateParts);
    return;
  }
  match = normalized.match(/^([A-Za-z]+)\.?\s+(\d{1,2})(?:,?\s+(\d{4}))?$/);
  if (match) {
    addDateFact(facts, match[3], DATE_MONTH_NUMBERS.get(match[1].toLowerCase()), match[2], dateParts);
    return;
  }
  match = normalized.match(/^(\d{1,2})\s+([A-Za-z]+)\.?\s*(?:\s+(\d{4}))?$/);
  if (match) addDateFact(facts, match[3], DATE_MONTH_NUMBERS.get(match[2].toLowerCase()), match[1], dateParts);
}
function extractNumericFacts(text, { dateParts = true } = {}) {
  const facts = /* @__PURE__ */ new Set();
  if (typeof text !== "string" || text.length === 0) return facts;
  let remaining = text.replace(/\[\d{1,3}\]/g, " ");
  remaining = remaining.replace(DATE_EXPRESSION_RE, (match) => {
    addDateExpressionFacts(facts, match, dateParts);
    return " ".repeat(match.length);
  });
  remaining = remaining.replace(DIGIT_FACT_RE, (match, offset, original) => {
    const before = original[offset - 1];
    const after = original[offset + match.length];
    const isWordChar = (value) => typeof value === "string" && /[\p{L}\p{N}]/u.test(value);
    if (isWordChar(before) || isWordChar(after)) return match;
    facts.add(normalizeDigitFact(match));
    return " ".repeat(match.length);
  });
  remaining.replace(NUMBER_FACT_WORD_SEQUENCE_RE, (match) => {
    facts.add(normalizeNumberWordFact(match));
    return match;
  });
  return facts;
}
var STATUS_QUALIFIER_CLASSES = [
  ["former", "ex", "erstwhile", "one-time", "onetime", "then-", "outgoing", "retired"],
  ["acting", "interim", "caretaker"],
  ["incoming"],
  ["late"]
];
var STATUS_QUALIFIER_CLASS_OF = new Map(
  STATUS_QUALIFIER_CLASSES.flatMap((cls) => cls.map((q) => [q.replace(/-$/, ""), cls]))
);
var PERSON_TITLE_WORDS = "president|prime minister|vice president|premier|chancellor|minister|secretary|senator|governor|mayor|chairman|chairwoman|chairperson|chair|chief|ceo|cfo|ambassador|envoy|speaker|king|queen|pope|leader|commander|general|admiral|director|prosecutor|judge|justice|adviser|advisor|aide|spokesman|spokeswoman|spokesperson|head|official|lawmaker|congressman|congresswoman|representative|pm";
var OFFICE_MODIFIER_WORDS = "deputy|vice|assistant|associate|senior|national|security|foreign|defense|defence|finance|interior|justice|health|trade|energy|state|army|military|intelligence|supreme|party|attorney|federal|regional";
var CALENDAR_WORDS = "Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December";
var anyCase = (word) => word.replace(new RegExp("\\p{L}", "gu"), (c) => `[${c.toUpperCase()}${c}]`);
var PERSON_TITLE_RE_SOURCE = PERSON_TITLE_WORDS.split("|").map(anyCase).join("|");
var BRIDGE_WORD_RE_SOURCE = `(?:(?!(?:${CALENDAR_WORDS})\\b)\\p{Lu}[\\p{L}'\u2019-]*|${OFFICE_MODIFIER_WORDS.split("|").map(anyCase).join("|")}|${PERSON_TITLE_RE_SOURCE})`;
var STATUS_QUALIFIER_RE = new RegExp(
  `\\b(${STATUS_QUALIFIER_CLASSES.flat().map((q) => q.endsWith("-") ? `${anyCase(q.slice(0, -1))}(?=-)` : anyCase(q)).join("|")})[-\\s]+(?:${BRIDGE_WORD_RE_SOURCE}\\s+){0,3}?(?:${PERSON_TITLE_RE_SOURCE})s?\\b[-\\s]+(?:(?:of|the|for|to|and)\\s+)?(\\p{Lu}[\\p{L}'\u2019-]+)`,
  "gu"
);

// server/_shared/claim-match.ts
var CLAIM_MAX_CHARS = 300;
var CLAIM_MATCH_MIN_SCORE = 0.5;
var CLAIM_MATCH_MIN_SHARED = 2;
var CLAIM_MATCH_MAX_CLUSTERS = 8;
var CLAIM_CARD_MAX_HEADLINES = 10;
var CLAIM_CANDIDATE_LIMIT = 100;
var CLAIM_CARD_CAVEAT = "Coverage, not accuracy: this shows who reported the claim and whether they are independent, not whether it is true. Not found means not in WorldMonitor's current sources.";
var STOPWORDS = new Set(`a an and are as at be been but by can could did do does for from had has have he her his how
i if in into is it its just more most new news no not now of on or our out over says said say she so than that the their
them then there these they this those to up us was we were what when where which while who why will with would you your
after amid ahead against about all also any back before being between both during each few first get gets got here last
like many may might much must next off once only other own same should since some still such through under until very
week weeks year years day days today yesterday report reports reported reportedly breaking live update updates latest
claim claims claimed`.split(/\s+/));
function claimTokens(text) {
  return String(text || "").toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "").replace(/['’]s\b/g, "").split(/[^a-z0-9.%$-]+/).map((token) => token.replace(/^[.$-]+|[.-]+$/g, "")).filter((token) => token.length > 1 && !STOPWORDS.has(token));
}
function stem(token) {
  return token.replace(/(ing|ed|es|s)$/, "").replace(/e$/, "");
}
function claimOverlap(claim, headline) {
  const wanted = [...new Set(claimTokens(claim))];
  if (wanted.length === 0) return { score: 0, shared: 0 };
  const have = new Set(claimTokens(headline));
  const haveStems = new Set([...have].map(stem).filter((s) => s.length >= 4));
  let hit = 0;
  let shared = 0;
  for (const token of wanted) {
    if (have.has(token)) {
      hit += 1;
      shared += 1;
      continue;
    }
    const s = stem(token);
    if (s.length >= 4 && haveStems.has(s)) {
      hit += 0.75;
      shared += 1;
    }
  }
  return { score: hit / wanted.length, shared };
}
function claimCandidates(claim, items, limit = CLAIM_CANDIDATE_LIMIT) {
  return items.map((item) => ({ item, overlap: claimOverlap(claim, item.title) })).filter(({ overlap }) => overlap.shared >= 1).sort((a, b) => b.overlap.score - a.overlap.score || b.item.pubDate.getTime() - a.item.pubDate.getTime() || a.item.link.localeCompare(b.item.link)).slice(0, limit).map(({ item }) => item);
}
function matchClaimToClusters(claim, clusters) {
  const matches = [];
  for (const cluster of clusters) {
    let best = { score: 0, shared: 0 };
    for (const title of [cluster.primaryTitle, ...cluster.allItems.map((item) => item.title)]) {
      const overlap = claimOverlap(claim, title);
      if (overlap.score > best.score) best = overlap;
    }
    if (best.score >= CLAIM_MATCH_MIN_SCORE && best.shared >= CLAIM_MATCH_MIN_SHARED) {
      matches.push({ cluster, score: best.score });
    }
  }
  return matches.sort((a, b) => b.score - a.score || b.cluster.uniquePublisherCount - a.cluster.uniquePublisherCount).slice(0, CLAIM_MATCH_MAX_CLUSTERS);
}
function evidenceFromMatches(matches) {
  const labels = [];
  let reported = null;
  for (const { cluster } of matches) {
    for (const item of cluster.allItems) {
      labels.push(item.source);
      const count = item.corroborationCount;
      if (typeof count === "number" && Number.isFinite(count) && count >= 1) {
        reported = Math.max(reported ?? 0, Math.floor(count));
      }
    }
  }
  return { kind: "grouped", labels, reportedPublishers: reported };
}
function factLabel(fact) {
  return fact.replace(/^(number|date):/, "");
}
function checkClaimFigures(claim, coverageTexts) {
  const facts = extractNumericFacts(claim, { dateParts: false });
  const ground = extractNumericFacts(coverageTexts.join("\n"), { dateParts: false });
  const fullDateMonthDays = /* @__PURE__ */ new Set();
  for (const fact of facts) {
    const full = fact.match(/^date:\d{4}-(\d{2}-\d{2})$/);
    if (full) fullDateMonthDays.add(`date:${full[1]}`);
  }
  const listed = [...facts].filter((fact) => !fullDateMonthDays.has(fact)).sort();
  const isGrounded = (fact) => {
    if (ground.has(fact)) return true;
    const full = fact.match(/^date:\d{4}-(\d{2}-\d{2})$/);
    return full !== null && ground.has(`date:${full[1]}`);
  };
  return {
    claimed: listed.map(factLabel),
    grounded: listed.filter(isGrounded).map(factLabel),
    ungrounded: listed.filter((fact) => !isGrounded(fact)).map(factLabel)
  };
}
var CLAIM_CARD_STATES = ["corroborated", "single-publisher", "tier4-only", "unknown", "not-found"];
function buildClaimCard(claim, digestItems, searched = digestItems.length) {
  const matches = claim ? matchClaimToClusters(claim, clusterNewsCore([...digestItems], getSourceTier)) : [];
  if (matches.length === 0) {
    return {
      claim,
      found: false,
      // not-found claims a search happened: with nothing searched (coverage
      // unavailable) the state stays unknown.
      state: searched > 0 ? "not-found" : "unknown",
      corroboration: toCorroborationJson({ state: "unknown" }),
      publishers: [],
      publishersUnlisted: 0,
      matchedClusters: 0,
      credibilityScore: null,
      firstSeen: null,
      lastUpdated: null,
      headlines: [],
      figures: checkClaimFigures(claim, []),
      caveat: CLAIM_CARD_CAVEAT
    };
  }
  const evidence = evidenceFromMatches(matches);
  const verdict = assessCorroboration(evidence);
  const items = matches.flatMap(({ cluster }) => cluster.allItems);
  const times = items.map((item) => item.pubDate.getTime()).filter((t) => Number.isFinite(t) && t > 0);
  const top = matches[0].cluster;
  const seen = /* @__PURE__ */ new Set();
  const headlines = [];
  for (const { cluster } of matches) {
    for (const item of [...cluster.allItems].sort((a, b) => getSourceTier(a.source) - getSourceTier(b.source))) {
      const key = item.link || `${item.source}|${item.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      headlines.push({
        title: item.title,
        source: item.source,
        link: item.link,
        publishedAt: item.pubDate.toISOString(),
        tier: declaredSourceTier(item.source),
        ...getSourceProvenanceState(item.source)
      });
      if (headlines.length >= CLAIM_CARD_MAX_HEADLINES) break;
    }
    if (headlines.length >= CLAIM_CARD_MAX_HEADLINES) break;
  }
  return {
    claim,
    found: true,
    state: verdict.state,
    corroboration: toCorroborationJson(verdict),
    ...toPublisherRosterJson(publisherRoster(evidence), verdict),
    matchedClusters: matches.length,
    credibilityScore: Number.isFinite(top.credibilityScore) ? top.credibilityScore : computeCredibilityScore({
      sourceTier: getSourceTier(top.primarySource),
      propagandaRisk: getSourceProvenanceState(top.primarySource).risk,
      independentCorroborationCount: top.uniquePublisherCount
    }),
    firstSeen: times.length ? new Date(Math.min(...times)).toISOString() : null,
    lastUpdated: times.length ? new Date(Math.max(...times)).toISOString() : null,
    headlines,
    figures: checkClaimFigures(claim, items.map((item) => item.title)),
    caveat: CLAIM_CARD_CAVEAT
  };
}

// shared/fact-checkers.json
var fact_checkers_default = {
  $comment: "Fact-checkers whose published ratings WorldMonitor may cite (#9094): the verified signatories of the IFCN Code of Principles, by site domain, copied from the IFCN list unedited apart from lowercasing and dropping a leading www. Reviewed like source tiers: refresh it from the source below and review the diff; never add or remove a domain by hand for any reason other than the IFCN list changing. A rating from any other site is not shown.",
  source: "https://github.com/IFCN/verified-signatories/blob/main/list",
  sourceCommit: "d263aee1143b9204ee86d5590db44375720ade3f",
  snapshot: "2026-10-01",
  domains: [
    "15min.lt",
    "aap.com.au",
    "africacheck.org",
    "agenciaocote.com",
    "akhbarmeter.org",
    "annir.ly",
    "aosfatos.org",
    "ap.org",
    "apa.at",
    "arij.net",
    "balobakicheck.com",
    "boomlive.in",
    "businessnews.com.tn",
    "cazadoresdefakenews.info",
    "chequeado.com",
    "civilnet.am",
    "correctiv.org",
    "cotejo.info",
    "danbinews.com",
    "delfi.lt",
    "delfi.lv",
    "demagog.cz",
    "demagog.org.pl",
    "doblecheck.cr",
    "dogrula.org",
    "dogrulukpayi.com",
    "dpa-factchecking.com",
    "dw.com",
    "ecuadorchequea.com",
    "efe.com",
    "efectococuyo.com",
    "elezafact.cd",
    "ellinikahoaxes.gr",
    "epl.delfi.ee",
    "facta.news",
    "factcheck.afp.com",
    "factcheck.kz",
    "factcheck.org",
    "factcheckcenter.jp",
    "factchecker.gr",
    "factcheckhub.com",
    "factchecklab.org",
    "factcheckni.org",
    "factchequeado.com",
    "factcrescendo.com",
    "factico.org",
    "factly.in",
    "factreview.gr",
    "factual.ro",
    "fakenews.pl",
    "fakenews.rs",
    "faktisk.no",
    "faktograf.hr",
    "faktoje.al",
    "fastcheck.cl",
    "firstcheck.in",
    "fullfact.org",
    "ghanafact.com",
    "globes.co.il",
    "grupoanimal.mx",
    "gwaramedia.com",
    "haqcheck.org",
    "hibrid.info",
    "indiatoday.in",
    "infact.press",
    "info-veritas.com",
    "investigatebel.org",
    "istinomer.rs",
    "istinomjer.ba",
    "kallkritikbyran.se",
    "kallxo.com",
    "kashif.ps",
    "knack.be",
    "kompas.com",
    "ladiaria.com.uy",
    "lakmusz.hu",
    "larepublica.pe",
    "lasillavacia.com",
    "leadstories.com",
    "lessurligneurs.eu",
    "liputan6.com",
    "localvoicesliberia.com",
    "lrt.lt",
    "mafindo.or.id",
    "malaespinacheck.cl",
    "manoramaonline.com",
    "medicaldialogues.in",
    "medizin-transparent.at",
    "mfcc.mn",
    "mygopen.com",
    "mythdetector.com",
    "news.abs-cbn.com",
    "news.jtbc.co.kr",
    "newschecker.in",
    "newsmeter.in",
    "newsmobile.in",
    "newtral.es",
    "observers.france24.com",
    "open.online",
    "ostro.si",
    "pagellapolitica.it",
    "poligrafo.sapo.pt",
    "politica.estadao.com.br",
    "politifact.com",
    "poynter.org",
    "pravda.org.pl",
    "pressone.ph",
    "provereno.media",
    "ptinews.com",
    "rappler.com",
    "raskrikavanje.rs",
    "raskrinkavanje.ba",
    "raskrinkavanje.me",
    "rebaltica.lv",
    "reutersagency.com",
    "sawablb.com",
    "shechecks.net",
    "snopes.com",
    "sochfactcheck.com",
    "stopfake.org",
    "stopfals.md",
    "t4p.co",
    "telemundo.com",
    "telugupost.com",
    "teyit.org",
    "tfc-taiwan.org.tw",
    "thecanadianpressnews.ca",
    "thedispatch.com",
    "thejournal.ie",
    "thelallantop.com",
    "thequint.com",
    "thip.media",
    "tirto.id",
    "tjekdet.dk",
    "togocheck.com",
    "tsmliberia.com",
    "tstm.tw",
    "univision.com",
    "verafiles.org",
    "verificado.com.mx",
    "verificat.cat",
    "viralcheck.pt",
    "vishvasnews.com",
    "vistinomer.mk",
    "voxukraine.org",
    "washingtonpost.com",
    "wisconsinwatch.org",
    "youturn.in"
  ]
};

// server/_shared/fact-checks.ts
var FACT_CHECK_SEARCH_URL = "https://factchecktools.googleapis.com/v1alpha1/claims:search";
var FACT_CHECK_API_KEY_ENV = "GOOGLE_FACT_CHECK_API_KEY";
var FACT_CHECK_LANGUAGE = "en";
var FACT_CHECK_MATCH_MIN_SCORE = 0.6;
var FACT_CHECK_MATCH_MIN_SHARED = 3;
var FACT_CHECK_MAX_RESULTS = 10;
var FACT_CHECK_SEARCH_PAGE_SIZE = 20;
var FACT_CHECK_LABEL = "A published fact-check of a similar claim";
var FACT_CHECK_CAVEAT = "Ratings are the fact-checkers' own, quoted with attribution from IFCN-verified signatories. WorldMonitor does not rate claims, and a rating never changes the coverage result above.";
var RATING_MAX_CHARS = 200;
var REVIEWED_CLAIM_MAX_CHARS = 1e3;
var TITLE_MAX_CHARS = 200;
var FACT_CHECKER_DOMAINS = new Set(
  fact_checkers_default.domains.map(normalizeHost)
);
var FACT_CHECKER_SNAPSHOT = fact_checkers_default.snapshot;
function normalizeHost(host) {
  return String(host || "").trim().toLowerCase().replace(/\.$/, "").replace(/^www\./, "");
}
function factCheckerDomainFor(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  const host = normalizeHost(parsed.hostname);
  if (FACT_CHECKER_DOMAINS.has(host)) return host;
  for (let dot = host.indexOf("."); dot !== -1; dot = host.indexOf(".", dot + 1)) {
    const parent = host.slice(dot + 1);
    if (FACT_CHECKER_DOMAINS.has(parent)) return parent;
  }
  return null;
}
function isStrongFactCheckMatch(claim, reviewedClaim) {
  const forward = claimOverlap(claim, reviewedClaim);
  if (forward.score < FACT_CHECK_MATCH_MIN_SCORE || forward.shared < FACT_CHECK_MATCH_MIN_SHARED) return false;
  return claimOverlap(reviewedClaim, claim).score >= FACT_CHECK_MATCH_MIN_SCORE;
}
function claimCanMatchFactChecks(claim) {
  return new Set(claimTokens(claim)).size >= FACT_CHECK_MATCH_MIN_SHARED;
}
function whole(text, max) {
  const value = typeof text === "string" ? text.replace(/\s+/g, " ").trim() : "";
  return value.length <= max ? value : "";
}
function clip(text, max) {
  return typeof text === "string" ? text.replace(/\s+/g, " ").trim().slice(0, max) : "";
}
function selectFactChecks(claim, apiClaims) {
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  for (const apiClaim of Array.isArray(apiClaims) ? apiClaims : []) {
    const claimReviewed = whole(apiClaim?.text, REVIEWED_CLAIM_MAX_CHARS);
    if (!claimReviewed || !isStrongFactCheckMatch(claim, claimReviewed)) continue;
    for (const review of Array.isArray(apiClaim.claimReview) ? apiClaim.claimReview : []) {
      const url = whole(review?.url, 2048);
      const site = factCheckerDomainFor(url);
      if (!site || seen.has(url)) continue;
      const language = clip(review.languageCode, 16).toLowerCase();
      if (language && language !== FACT_CHECK_LANGUAGE && !language.startsWith(`${FACT_CHECK_LANGUAGE}-`)) continue;
      const rating = whole(review.textualRating, RATING_MAX_CHARS);
      const reviewedMs = Date.parse(clip(review.reviewDate, 64));
      if (!rating || !Number.isFinite(reviewedMs)) continue;
      seen.add(url);
      out.push({
        publisher: whole(review.publisher?.name, 120) || site,
        site,
        rating,
        reviewedAt: new Date(reviewedMs).toISOString(),
        url,
        title: clip(review.title, TITLE_MAX_CHARS),
        claimReviewed
      });
    }
  }
  return out.sort((a, b) => b.reviewedAt.localeCompare(a.reviewedAt) || a.site.localeCompare(b.site)).slice(0, FACT_CHECK_MAX_RESULTS);
}
function factCheckSearchUrl(claim, apiKey) {
  const params = new URLSearchParams({
    query: claim,
    languageCode: FACT_CHECK_LANGUAGE,
    pageSize: String(FACT_CHECK_SEARCH_PAGE_SIZE),
    key: apiKey
  });
  return `${FACT_CHECK_SEARCH_URL}?${params}`;
}
function compactApiClaims(body) {
  const claims = body?.claims;
  if (!Array.isArray(claims)) return [];
  return claims.slice(0, FACT_CHECK_SEARCH_PAGE_SIZE).map((raw) => ({
    text: whole(raw?.text, REVIEWED_CLAIM_MAX_CHARS),
    claimReview: (Array.isArray(raw?.claimReview) ? raw.claimReview : []).slice(0, 10).map((review) => ({
      publisher: { name: whole(review?.publisher?.name, 120), site: whole(review?.publisher?.site, 253) },
      url: whole(review?.url, 2048),
      title: clip(review?.title, TITLE_MAX_CHARS),
      reviewDate: clip(review?.reviewDate, 64),
      textualRating: whole(review?.textualRating, RATING_MAX_CHARS),
      languageCode: clip(review?.languageCode, 16)
    }))
  }));
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

// server/_shared/redis.ts
var import_compare_and_delete_script = __toESM(require_compare_and_delete_script(), 1);

// server/_shared/seed-envelope.ts
function unwrapEnvelope2(raw) {
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

// server/_shared/cache-contract.ts
var SCENARIO_STATUS_PATH = "/api/scenario/v1/get-scenario-status";
var SCENARIO_TERMINAL_STATUSES = /* @__PURE__ */ new Set(["done", "failed"]);
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
var TELEMETRY_TIMEOUT_MS = 1500;
var CB_WINDOW_MS = 5 * 60 * 1e3;
var CB_TRIP_FAILURE_RATIO = 0.05;
var CB_MIN_SAMPLES = 20;
var SAMPLED_DROP_LOG_RATE = 0.01;
function isUsageEnabled() {
  return process.env.USAGE_TELEMETRY === "1";
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
var breakerSamples = [];
var breakerTripped = false;
var breakerLastNotifyTs = 0;
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
  for (const s of breakerSamples) if (!s.ok) failures++;
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
var scopeStore = null;
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
function hasRemoteRedisConfig() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
function getKeyPrefix2() {
  const env = process.env.VERCEL_ENV;
  if (!env || env === "production") return "";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "dev";
  return `${env}:${sha}:`;
}
var cachedPrefix;
function prefixKey(key) {
  if (cachedPrefix === void 0) cachedPrefix = getKeyPrefix2();
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
      value: unwrapSeedEnvelope ? unwrapEnvelope2(parsed).data : parsed
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
var NEG_SENTINEL = "__WM_NEG__";
var FETCH_ERROR_NEGATIVE_TTL_SECONDS = 30;
var FETCH_ERROR_UNAVAILABLE_BACKOFF_SECONDS = 3;
var REDIS_FAILURE_POSITIVE_TTL_SECONDS = 30;
var LOCAL_FALLBACK_MAX_ENTRIES = 5e3;
var localNegativeUntil = /* @__PURE__ */ new Map();
var localUnavailableUntil = /* @__PURE__ */ new Map();
var localPositiveFallback = /* @__PURE__ */ new Map();
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
async function getCachedJsonBatch(keys, raw = false) {
  const result = /* @__PURE__ */ new Map();
  if (keys.length === 0) return result;
  if (process.env.LOCAL_API_MODE === "tauri-sidecar") {
    try {
      const { sidecarCacheGet: sidecarCacheGet2 } = await Promise.resolve().then(() => (init_sidecar_cache(), sidecar_cache_exports));
      for (const key of keys) {
        const value = sidecarCacheGet2(key);
        if (value != null) result.set(key, value);
      }
    } catch (error) {
      console.warn("[redis] getCachedJsonBatch failed:", errMsg(error));
    }
    return result;
  }
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return result;
  try {
    const pipeline = keys.map((k) => ["GET", raw ? k : prefixKey(k)]);
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
    if (!resp.ok) {
      console.warn(`[redis] getCachedJsonBatch HTTP ${resp.status}`);
      return result;
    }
    const data = await resp.json();
    for (let i = 0; i < keys.length; i++) {
      const rawResult = data[i]?.result;
      if (rawResult) {
        try {
          const parsed = JSON.parse(rawResult);
          if (parsed === NEG_SENTINEL) continue;
          result.set(keys[i], unwrapEnvelope2(parsed).data);
        } catch {
        }
      }
    }
  } catch (err) {
    const isTimeout = err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError");
    if (isTimeout) {
      console.error(`[REDIS-TIMEOUT] getCachedJsonBatch keys=${keys.length} timeoutMs=${REDIS_PIPELINE_TIMEOUT_MS}`);
    } else {
      console.warn("[redis] getCachedJsonBatch failed:", errMsg(err));
    }
  }
  return result;
}
function isRedisConfigured() {
  if (process.env.LOCAL_API_MODE === "tauri-sidecar") return true;
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}
function normalizePipelineCommand2(command, raw) {
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
      body: JSON.stringify(commands.map((command) => normalizePipelineCommand2(command, raw))),
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
var inflight = /* @__PURE__ */ new Map();
var FETCHER_TIMEOUT_MS_DEFAULT = 3e4;
var fetcherTimeoutDefaultMs = FETCHER_TIMEOUT_MS_DEFAULT;
var CachedFetchTimeoutError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "CachedFetchTimeoutError";
  }
};
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

// server/_shared/hash.ts
async function sha256Hex(input) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// server/_shared/fact-check-search.ts
var SEARCH_TIMEOUT_MS = 5e3;
var SEARCH_CACHE_TTL_S = 24 * 60 * 60;
var USER_AGENT = "worldmonitor-server/1.0 (fact-checks; +https://www.worldmonitor.app/verify)";
function factCheckQuery(rawClaim) {
  return String(rawClaim ?? "").replace(/\s+/g, " ").trim().slice(0, CLAIM_MAX_CHARS);
}
async function factCheckCacheKey(query) {
  return `factcheck:search:v2:${await sha256Hex(query)}`;
}
async function lookupFactChecks(rawClaim) {
  const claim = factCheckQuery(rawClaim);
  if (!claimCanMatchFactChecks(claim)) return { state: "ok", factChecks: [] };
  const apiKey = process.env[FACT_CHECK_API_KEY_ENV];
  if (!apiKey) return { state: "not-configured", factChecks: [] };
  let cached;
  try {
    const cacheKey = await factCheckCacheKey(claim);
    cached = await cachedFetchJson(cacheKey, SEARCH_CACHE_TTL_S, async () => {
      const res = await globalThis.fetch(factCheckSearchUrl(claim, apiKey), {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(SEARCH_TIMEOUT_MS)
      });
      if (!res.ok) throw new Error(`fact-check search HTTP ${res.status}`);
      return { claims: compactApiClaims(await res.json()) };
    });
  } catch (err) {
    console.warn("[fact-checks] search failed:", err instanceof Error ? err.message : String(err));
    captureSilentError(err, {
      tags: { surface: "server", component: "fact-checks", stage: "search" },
      fingerprint: ["fact-checks", "search"],
      level: "warning"
    });
    cached = null;
  }
  if (!cached) return { state: "unavailable", factChecks: [] };
  return { state: "ok", factChecks: selectFactChecks(claim, cached.claims) };
}

// server/_shared/digest-revocations.ts
var REVOKED_URLS_KEY = "news:digest:revoked-urls:v1";
async function readRevokedUrlSet() {
  if (process.env.LOCAL_API_MODE === "tauri-sidecar") {
    return { urls: /* @__PURE__ */ new Set(), readable: true };
  }
  if (!isRedisConfigured()) {
    return { urls: /* @__PURE__ */ new Set(), readable: true };
  }
  try {
    const results = await runRedisPipeline([["SMEMBERS", REVOKED_URLS_KEY]]);
    const entry = results[0];
    if (!entry || entry.error || !Array.isArray(entry.result)) {
      return { urls: /* @__PURE__ */ new Set(), readable: false };
    }
    return {
      urls: new Set(entry.result.filter((value) => typeof value === "string")),
      readable: true
    };
  } catch {
    return { urls: /* @__PURE__ */ new Set(), readable: false };
  }
}

// shared/news-catalog.json
var news_catalog_default = {
  $comment: "Single source of truth for every news feed. Browser and server catalogs are derived views (shared/news-catalog.ts). Base fields are the server values; `browser` overrides fields the browser view serves differently (null = absent). Placement orders reproduce each view's order.",
  version: 1,
  layout: {
    browser: {
      full: [
        "politics",
        "us",
        "europe",
        "middleeast",
        "tech",
        "ai",
        "finance",
        "gov",
        "layoffs",
        "thinktanks",
        "crisis",
        "africa",
        "latam",
        "asia",
        "energy",
        "science"
      ],
      tech: [
        "tech",
        "ai",
        "startups",
        "vcblogs",
        "regionalStartups",
        "github",
        "ipo",
        "funding",
        "producthunt",
        "outages",
        "security",
        "policy",
        "thinktanks",
        "finance",
        "hardware",
        "cloud",
        "dev",
        "layoffs",
        "unicorns",
        "accelerators",
        "podcasts"
      ],
      finance: [
        "markets",
        "forex",
        "bonds",
        "commodities",
        "crypto",
        "centralbanks",
        "economic",
        "ipo",
        "derivatives",
        "fintech",
        "fin-regulation",
        "institutional",
        "analysis",
        "gccNews"
      ],
      happy: [
        "positive",
        "science",
        "nature",
        "inspiring",
        "community"
      ],
      commodity: [
        "commodity-news",
        "gold-silver",
        "energy",
        "mining-news",
        "critical-minerals",
        "base-metals",
        "mining-companies",
        "supply-chain",
        "commodity-regulation",
        "markets",
        "finance"
      ],
      energy: [
        "live-news",
        "energy",
        "supply-chain"
      ],
      ondemand: [
        "nq-news"
      ]
    },
    server: {
      full: [
        "politics",
        "us",
        "europe",
        "middleeast",
        "tech",
        "ai",
        "finance",
        "commodities",
        "gov",
        "africa",
        "latam",
        "asia",
        "energy",
        "thinktanks",
        "crisis",
        "layoffs",
        "science"
      ],
      tech: [
        "tech",
        "ai",
        "startups",
        "vcblogs",
        "regionalStartups",
        "unicorns",
        "accelerators",
        "security",
        "policy",
        "github",
        "funding",
        "cloud",
        "layoffs",
        "finance",
        "dev",
        "ipo",
        "producthunt",
        "hardware",
        "outages",
        "thinktanks",
        "podcasts"
      ],
      finance: [
        "markets",
        "forex",
        "bonds",
        "commodities",
        "crypto",
        "centralbanks",
        "economic",
        "ipo",
        "derivatives",
        "fintech",
        "fin-regulation",
        "institutional",
        "analysis",
        "gccNews",
        "nq-news"
      ],
      commodity: [
        "commodity-news",
        "gold-silver",
        "energy",
        "mining-news",
        "critical-minerals",
        "base-metals",
        "mining-companies",
        "supply-chain",
        "commodity-regulation",
        "markets",
        "finance"
      ],
      happy: [
        "positive",
        "science",
        "nature",
        "inspiring",
        "community"
      ],
      energy: [
        "live-news",
        "energy",
        "supply-chain"
      ]
    }
  },
  gateExempt: {
    energy: [
      "supply-chain"
    ],
    finance: [
      "nq-news"
    ]
  },
  categoryNotes: [
    {
      side: "browser",
      edition: "full",
      category: "science",
      note: "Science panel (2026-10-17 Google News World audit: science stories it carried, such as Nature's coral study and Reuters' Neanderthal report, reached no feed). Last category, so the free cap reaches it last."
    },
    {
      side: "server",
      edition: "full",
      category: "commodities",
      note: "MCP digest-backed tools consume `full`, while the finance dashboard consumes `finance`. Keep this literal array aligned with the finance bucket below; the static per-variant feed-key guard requires literals."
    },
    {
      side: "server",
      edition: "full",
      category: "science",
      note: "Science panel (2026-10-17 Google News World audit)."
    },
    {
      side: "server",
      edition: "finance",
      category: "fin-regulation",
      note: "Key MUST match the client-side category key in src/config/feeds.ts FINANCE_FEEDS (`'fin-regulation'`). The client iterates `Object.keys(FEEDS)` and looks up `digest.categories[category]` by the same key \u2014 a name drift here means the server returns the digest bucket but the client never finds it, and the panel renders empty. The panel name was renamed `regulation` \u2192 `fin-regulation` client-side in PR #3578-era work (App.ts:539-542 has a one-time storage migration for prior users), but this server-side key was never updated."
    },
    {
      side: "server",
      edition: "commodity",
      category: "*",
      note: "\u2500\u2500 Commodity variant (Mining, Metals, Energy) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500"
    }
  ],
  feeds: [
    {
      name: "BBC World",
      url: "https://feeds.bbci.co.uk/news/world/rss.xml",
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Guardian World",
      url: "https://www.theguardian.com/world/rss",
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "AP News",
      url: "https://news.google.com/rss/search?q=site%3Aapnews.com%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:apnews.com&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Reuters World",
      url: "https://news.google.com/rss/search?q=site%3Areuters.com%20world%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:reuters.com+world&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "CNN World",
      url: "https://news.google.com/rss/search?q=site%3Acnn.com%20world%20news%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Trump - Truth Social",
      url: "https://trumpstruth.org/feed",
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "New York Times World",
      url: "https://news.google.com/rss/search?q=site%3Anytimes.com%20world%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Major publishers Google News World leads with and no feed carried (2026-10-16 audit). Google News site: queries, like AP and Reuters.",
        "Major publishers Google News World leads with and no feed carried (2026-10-16 audit). Last in the category, so the free-tier cap's declaration-order pick keeps every earlier source."
      ],
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 6,
          browserOrder: 6
        }
      ]
    },
    {
      name: "Washington Post World",
      url: "https://news.google.com/rss/search?q=site%3Awashingtonpost.com%20world%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 7,
          browserOrder: 7
        }
      ]
    },
    {
      name: "The Economist",
      url: "https://news.google.com/rss/search?q=site%3Aeconomist.com%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 8,
          browserOrder: 8
        }
      ]
    },
    {
      name: "The Independent",
      url: "https://news.google.com/rss/search?q=site%3Aindependent.co.uk%20world%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "politics",
          serverOrder: 9,
          browserOrder: 9
        }
      ]
    },
    {
      name: "Reuters US",
      url: "https://news.google.com/rss/search?q=site%3Areuters.com%20US%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:reuters.com+US&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "NPR News",
      url: "https://feeds.npr.org/1001/rss.xml",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "PBS NewsHour",
      url: "https://www.pbs.org/newshour/feeds/rss/headlines",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "ABC News",
      url: "https://feeds.abcnews.com/abcnews/topstories",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "CBS News",
      url: "https://www.cbsnews.com/latest/rss/main",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "NBC News",
      url: "https://feeds.nbcnews.com/nbcnews/public/news",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Wall Street Journal",
      url: "https://feeds.content.dowjones.io/public/rss/RSSUSnews",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 6,
          browserOrder: 6
        }
      ]
    },
    {
      name: "Politico",
      url: "https://rss.politico.com/politics-news.xml",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 7,
          browserOrder: 7
        }
      ]
    },
    {
      name: "The Hill",
      url: "https://thehill.com/news/feed",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 8,
          browserOrder: 8
        }
      ]
    },
    {
      name: "Axios",
      url: "https://api.axios.com/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 9,
          browserOrder: 9
        }
      ]
    },
    {
      name: "Fox News",
      url: "https://moxie.foxnews.com/google-publisher/us.xml",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 10,
          browserOrder: 10
        }
      ]
    },
    {
      name: "CBC News",
      url: "https://www.cbc.ca/webfeed/rss/rss-world",
      notes: [
        "Canada + North America key-country pack (#5960)",
        "Canada + North America key-country pack (#5960). CA is a North America keyCountry but had zero dedicated catalog sources. CBC World is the EN-default (noise-acceptable public broadcaster); Globe and Global News stay catalog opt-in. Canadian Press has no usable public RSS/GNews feed."
      ],
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 11,
          browserOrder: 11
        }
      ]
    },
    {
      name: "Globe and Mail",
      url: "https://www.theglobeandmail.com/arc/outboundfeeds/rss/category/canada/?outputType=xml",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 12,
          browserOrder: 12
        }
      ]
    },
    {
      name: "Global News",
      url: "https://globalnews.ca/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 13,
          browserOrder: 13
        }
      ]
    },
    {
      name: "Toronto Star",
      url: "https://www.thestar.com/search/?f=rss&t=article&c=news/canada",
      notes: [
        "Canada depth pack (#6604/#6605). FR sources keep lang:'fr'.",
        "Canada depth pack (#6604/#6605). CBC stays default-on; CTV News and Toronto Star join the EN default-on national floor (floors.CA = 3). Remaining names are catalog opt-in. FR sources are locale-boosted only."
      ],
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 14,
          browserOrder: 14
        }
      ]
    },
    {
      name: "National Post",
      url: "https://nationalpost.com/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 15,
          browserOrder: 15
        }
      ]
    },
    {
      name: "Financial Post",
      url: "https://financialpost.com/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 16,
          browserOrder: 16
        }
      ]
    },
    {
      name: "iPolitics",
      url: "https://www.ipolitics.ca/feed",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 17,
          browserOrder: 17
        }
      ]
    },
    {
      name: "The Narwhal",
      url: "https://thenarwhal.ca/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 18,
          browserOrder: 18
        }
      ]
    },
    {
      name: "The Tyee",
      url: "https://thetyee.ca/rss2.xml",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 19,
          browserOrder: 19
        }
      ]
    },
    {
      name: "Radio-Canada",
      url: "https://ici.radio-canada.ca/info/rss/info/en-continu",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 20,
          browserOrder: 20
        }
      ]
    },
    {
      name: "La Presse",
      url: "https://www.lapresse.ca/actualites/rss",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 21,
          browserOrder: 21
        }
      ]
    },
    {
      name: "Le Devoir",
      url: "https://www.ledevoir.com/rss/manchettes.xml",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 22,
          browserOrder: 22
        }
      ]
    },
    {
      name: "TVA Nouvelles",
      url: "https://www.tvanouvelles.ca/rss.xml",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 23,
          browserOrder: 23
        }
      ]
    },
    {
      name: "Vancouver Sun",
      url: "https://vancouversun.com/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 24,
          browserOrder: 24
        }
      ]
    },
    {
      name: "Calgary Herald",
      url: "https://calgaryherald.com/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 25,
          browserOrder: 25
        }
      ]
    },
    {
      name: "Winnipeg Free Press",
      url: "https://www.winnipegfreepress.com/feed",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 26,
          browserOrder: 26
        }
      ]
    },
    {
      name: "Ottawa Citizen",
      url: "https://ottawacitizen.com/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 27,
          browserOrder: 27
        }
      ]
    },
    {
      name: "Edmonton Journal",
      url: "https://edmontonjournal.com/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 28,
          browserOrder: 28
        }
      ]
    },
    {
      name: "Maclean's",
      url: "https://macleans.ca/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 29,
          browserOrder: 29
        }
      ]
    },
    {
      name: "The Province",
      url: "https://theprovince.com/feed/",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 30,
          browserOrder: 30
        }
      ]
    },
    {
      name: "CTV News",
      url: "https://news.google.com/rss/search?q=site%3Actvnews.ca%20when%3A1d&hl=en-CA&gl=CA&ceid=CA:en",
      notes: [
        "GNews-only (#6604): no parseable native RSS. CA locale. Do not allowlist publisher hosts."
      ],
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 31,
          browserOrder: 31
        }
      ]
    },
    {
      name: "CP24",
      url: "https://news.google.com/rss/search?q=site%3Acp24.com%20when%3A1d&hl=en-CA&gl=CA&ceid=CA:en",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 32,
          browserOrder: 32
        }
      ]
    },
    {
      name: "Montreal Gazette",
      url: "https://news.google.com/rss/search?q=site%3Amontrealgazette.com%20when%3A1d&hl=en-CA&gl=CA&ceid=CA:en",
      placements: [
        {
          edition: "full",
          category: "us",
          serverOrder: 33,
          browserOrder: 33
        }
      ]
    },
    {
      name: "France 24",
      url: "https://www.france24.com/en/rss",
      browser: {
        url: {
          en: "https://www.france24.com/en/rss",
          fr: "https://www.france24.com/fr/rss",
          es: "https://www.france24.com/es/rss",
          ar: "https://www.france24.com/ar/rss"
        }
      },
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "EuroNews",
      url: "https://www.euronews.com/rss?format=xml",
      browser: {
        url: {
          en: "https://www.euronews.com/rss?format=xml",
          fr: "https://fr.euronews.com/rss?format=xml",
          de: "https://de.euronews.com/rss?format=xml",
          it: "https://it.euronews.com/rss?format=xml",
          es: "https://es.euronews.com/rss?format=xml",
          pt: "https://pt.euronews.com/rss?format=xml",
          ru: "https://ru.euronews.com/rss?format=xml",
          el: "https://gr.euronews.com/rss?format=xml"
        }
      },
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Le Monde",
      url: "https://www.lemonde.fr/en/rss/une.xml",
      browser: {
        url: {
          en: "https://www.lemonde.fr/en/rss/une.xml",
          fr: "https://www.lemonde.fr/rss/une.xml"
        }
      },
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "DW News",
      url: "https://rss.dw.com/xml/rss-en-all",
      browser: {
        url: {
          en: "https://rss.dw.com/xml/rss-en-all",
          de: "https://rss.dw.com/xml/rss-de-all",
          es: "https://news.google.com/rss/search?q=site:dw.com/es&hl=es-419&gl=MX&ceid=MX:es-419"
        }
      },
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Telegraph",
      url: "https://www.telegraph.co.uk/rss.xml",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Interfax EN",
      url: "https://news.google.com/rss/search?q=site%3Ainterfax.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Tagesschau",
      url: "https://www.tagesschau.de/xml/rss2/",
      lang: "de",
      notes: [
        "German (DE)"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 6,
          browserOrder: 9
        }
      ]
    },
    {
      name: "Handelsblatt",
      url: "https://www.handelsblatt.com/contentexport/feed/schlagzeilen",
      lang: "de",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 7,
          browserOrder: 13
        }
      ]
    },
    {
      name: "Welt",
      url: "https://www.welt.de/feeds/latest.rss",
      lang: "de",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 8,
          browserOrder: 14
        }
      ]
    },
    {
      name: "Interfax RU",
      url: "https://www.interfax.ru/rss.asp",
      lang: "ru",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 9,
          browserOrder: 73
        }
      ]
    },
    {
      name: "ANSA",
      url: "https://www.ansa.it/sito/ansait_rss.xml",
      lang: "it",
      browser: {
        url: "https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml"
      },
      notes: [
        "Italian (IT)"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 10,
          browserOrder: 15
        }
      ]
    },
    {
      name: "NOS Nieuws",
      url: "https://feeds.nos.nl/nosnieuwsalgemeen",
      lang: "nl",
      notes: [
        "Dutch (NL)"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 11,
          browserOrder: 18
        }
      ]
    },
    {
      name: "SVT Nyheter",
      url: "https://www.svt.se/nyheter/rss.xml",
      lang: "sv",
      notes: [
        "Swedish (SV)"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 12,
          browserOrder: 21
        }
      ]
    },
    {
      name: "Yle News",
      url: "https://yle.fi/rss/news",
      notes: [
        "Arctic / Nordic security pack (#5960). Unscoped so EN digests can include them when enabled (no/da/fi are not UI locales). Yle + Arctic Today are EN.",
        "Arctic / Nordic security pack (#5960) \u2014 High North + Nordics beyond Sweden. no/da/fi are not UI locales, so native Nordics are left unscoped (no lang tag) so EN analysts can enable them. Yle News + Arctic Today are English."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 13,
          browserOrder: 24
        }
      ]
    },
    {
      name: "NRK",
      url: "https://www.nrk.no/nyheter/siste.rss",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 14,
          browserOrder: 25
        }
      ]
    },
    {
      name: "Aftenposten",
      url: "https://www.aftenposten.no/rss",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 15,
          browserOrder: 26
        }
      ]
    },
    {
      name: "DR Nyheder",
      url: "https://www.dr.dk/nyheder/service/feeds/allenyheder",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 16,
          browserOrder: 27
        }
      ]
    },
    {
      name: "Arctic Today",
      url: "https://news.google.com/rss/search?q=site%3Aarctictoday.com%20when%3A14d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "High North specialty (Berlingske/High North News lack reliable public RSS)."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 17,
          browserOrder: 28
        }
      ]
    },
    {
      name: "Telex",
      url: "https://telex.hu/rss",
      lang: "hu",
      notes: [
        "Hungarian (HU) \u2014 V4 / CEE coverage. Mirrors src/config/feeds.ts europe block.",
        "Hungarian (HU) \u2014 V4 / CEE coverage. Locale-gated for hu users only, matching the Tagesschau (de) / ANSA (it) / NOS Nieuws (nl) / SVT (sv) convention. `hu` is registered as a supported locale in src/services/i18n.ts."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 18,
          browserOrder: 42
        }
      ]
    },
    {
      name: "Index.hu",
      url: "https://index.hu/24ora/rss",
      lang: "hu",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 19,
          browserOrder: 43
        }
      ]
    },
    {
      name: "HVG",
      url: "https://hvg.hu/rss",
      lang: "hu",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 20,
          browserOrder: 44
        }
      ]
    },
    {
      name: "444.hu",
      url: "https://444.hu/feed",
      lang: "hu",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 21,
          browserOrder: 45
        }
      ]
    },
    {
      name: "24.hu",
      url: "https://24.hu/feed/",
      lang: "hu",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 22,
          browserOrder: 46
        }
      ]
    },
    {
      name: "H\xEDrad\xF3",
      url: "https://news.google.com/rss/search?q=site%3Ahirado.hu%20when%3A2d&hl=hu&gl=HU&ceid=HU:hu",
      lang: "hu",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 23,
          browserOrder: 47
        }
      ]
    },
    {
      name: "Portfolio.hu",
      url: "https://portfolio.hu/rss/all.xml",
      lang: "hu",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 24,
          browserOrder: 48
        }
      ]
    },
    {
      name: "ATV",
      url: "https://www.atv.hu/rss",
      lang: "hu",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 25,
          browserOrder: 49
        }
      ]
    },
    {
      name: "Seznam Zpr\xE1vy",
      url: "https://www.seznamzpravy.cz/rss",
      lang: "cs",
      notes: [
        "Czech (CS) \u2014 V4 balance with Hungary (#5952). Locale-boosted for cs users."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 26,
          browserOrder: 50
        }
      ]
    },
    {
      name: "N1 Croatia",
      url: "https://n1info.hr/feed/",
      lang: "hr",
      notes: [
        "Croatian (HR) \u2014 mainstream + investigative; Balkan Insight is English-language (no lang tag)",
        "Croatian (HR) \u2014 mainstream + investigative"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 27,
          browserOrder: 51
        }
      ]
    },
    {
      name: "Index.hr",
      url: "https://www.index.hr/rss",
      lang: "hr",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 28,
          browserOrder: 52
        }
      ]
    },
    {
      name: "Jutarnji list",
      url: "https://www.jutarnji.hr/feed",
      lang: "hr",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 29,
          browserOrder: 53
        }
      ]
    },
    {
      name: "Balkan Insight",
      url: "https://balkaninsight.com/feed/",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 30,
          browserOrder: 54
        }
      ]
    },
    {
      name: "Digi24",
      url: "https://www.digi24.ro/rss",
      lang: "ro",
      notes: [
        "Romanian (RO) \u2014 Eastern flank (#5952). Locale-boosted for ro users."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 31,
          browserOrder: 55
        }
      ]
    },
    {
      name: "HotNews",
      url: "https://www.hotnews.ro/rss",
      lang: "ro",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 32,
          browserOrder: 56
        }
      ]
    },
    {
      name: "G4Media",
      url: "https://www.g4media.ro/feed/",
      lang: "ro",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 33,
          browserOrder: 57
        }
      ]
    },
    {
      name: "Dnevnik",
      url: "https://www.dnevnik.bg/rss/",
      lang: "bg",
      notes: [
        "Bulgarian (BG) \u2014 Black Sea flank (#5952). Locale-boosted for bg users."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 34,
          browserOrder: 58
        }
      ]
    },
    {
      name: "Kyiv Independent",
      url: "https://news.google.com/rss/search?q=site%3Akyivindependent.com%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Ukraine war frontline for EN digests (#5949). Names must match client DEFAULT_ENABLED_SOURCES.europe. Ordinary non-en `lang` tags are filtered from EN digests; strategic defaults explicitly bypass that filter.",
        "English-language (no lang tag) \u2014 always EN-digest-reachable"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 35,
          browserOrder: 79
        }
      ]
    },
    {
      name: "Ukrinform",
      url: "https://news.google.com/rss/search?q=site%3Aukrinform.net%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: {
          en: "https://news.google.com/rss/search?q=site:ukrinform.net+when:3d&hl=en-US&gl=US&ceid=US:en",
          uk: "https://news.google.com/rss/search?q=site:ukrinform.ua+when:3d&hl=uk&gl=UA&ceid=UA:uk"
        }
      },
      notes: [
        "Ukraine depth pack (#5951) \u2014 local institutional + independent sources (server keeps EN URLs; client multi-URL adds uk variants for UI locale).",
        "Ukraine depth pack (#5951) \u2014 local institutional + independent sources. Ukrinform / Suspilne are multi-URL so EN digests keep the English edition while `uk` UI users get UA-language Google News (locale boost via url key)."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 36,
          browserOrder: 80
        }
      ]
    },
    {
      name: "Suspilne",
      url: "https://news.google.com/rss/search?q=site%3Asuspilne.media%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: {
          en: "https://news.google.com/rss/search?q=site:suspilne.media+when:2d&hl=en-US&gl=US&ceid=US:en",
          uk: "https://news.google.com/rss/search?q=site:suspilne.media+when:2d&hl=uk&gl=UA&ceid=UA:uk"
        }
      },
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 37,
          browserOrder: 81
        }
      ]
    },
    {
      name: "Ukrainska Pravda EN",
      url: "https://news.google.com/rss/search?q=site%3Aeuromaidanpress.com%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 38,
          browserOrder: 82
        }
      ]
    },
    {
      name: "NV EN",
      url: "https://news.google.com/rss/search?q=site%3Aenglish.nv.ua%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 39,
          browserOrder: 83
        }
      ]
    },
    {
      name: "Hromadske EN",
      url: "https://news.google.com/rss/search?q=site%3Ahromadske.ua%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 40,
          browserOrder: 84
        }
      ]
    },
    {
      name: "Ukrainska Pravda",
      url: "https://news.google.com/rss/search?q=site%3Apravda.com.ua%20when%3A2d&hl=uk&gl=UA&ceid=UA:uk",
      lang: "uk",
      notes: [
        "Ukrainian (uk) native pack for uk digests (#5959)",
        "Ukrainian (uk) \u2014 native-language pack for uk locale (#5959). Locale-gated like Telex (hu) / Digi24 (ro): not EN default-on."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 41,
          browserOrder: 85
        }
      ]
    },
    {
      name: "Hromadske",
      url: "https://news.google.com/rss/search?q=site%3Ahromadske.ua%20when%3A3d&hl=uk&gl=UA&ceid=UA:uk",
      lang: "uk",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 42,
          browserOrder: 86
        }
      ]
    },
    {
      name: "Bihus.Info",
      url: "https://news.google.com/rss/search?q=site%3Abihus.info%20when%3A7d&hl=uk&gl=UA&ceid=UA:uk",
      lang: "uk",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 43,
          browserOrder: 87
        }
      ]
    },
    {
      name: "Slidstvo.Info",
      url: "https://news.google.com/rss/search?q=site%3Aslidstvo.info%20when%3A7d&hl=uk&gl=UA&ceid=UA:uk",
      lang: "uk",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 44,
          browserOrder: 88
        }
      ]
    },
    {
      name: "ZN.UA",
      url: "https://news.google.com/rss/search?q=site%3Azn.ua%20when%3A3d&hl=uk&gl=UA&ceid=UA:uk",
      lang: "uk",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 45,
          browserOrder: 89
        }
      ]
    },
    {
      name: "TVN24",
      url: "https://tvn24.pl/swiat.xml",
      browser: {
        url: {
          en: "https://tvn24.pl/swiat.xml",
          pl: "https://tvn24.pl/swiat.xml"
        }
      },
      notes: [
        "Google News returned HTTP 200 with no items for these site queries; use the outlets' live native RSS feeds for the EN digest path too.",
        "Polish (PL) \u2014 TVN24 / Rzeczpospolita are EN-default frontline sources (#5949). Their native RSS feeds are used for both locales: the Google News site queries previously used for EN returned HTTP 200 with no <item> nodes. No `lang` tag so isFeedInLanguage / server digests do not drop them for EN. Polsat News \u2014 strategic default via `strategicDefault: true` (#5958)."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 46,
          browserOrder: 33
        }
      ]
    },
    {
      name: "Rzeczpospolita",
      url: "https://www.rp.pl/rss_main",
      browser: {
        url: {
          en: "https://www.rp.pl/rss_main",
          pl: "https://www.rp.pl/rss_main"
        }
      },
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 47,
          browserOrder: 35
        }
      ]
    },
    {
      name: "Meduza",
      url: "https://meduza.io/rss/en/all",
      browser: {
        url: {
          en: "https://meduza.io/rss/en/all",
          ru: "https://meduza.io/rss/all"
        }
      },
      notes: [
        "Meduza: multi-URL so EN digests use the English RSS (no lang gate); RU UI keeps Russian."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 48,
          browserOrder: 74
        }
      ]
    },
    {
      name: "Moscow Times",
      url: "https://www.themoscowtimes.com/rss/news",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 49,
          browserOrder: 90
        }
      ]
    },
    {
      name: "Civil.ge",
      url: "https://civil.ge/feed/",
      notes: [
        "Caucasus (#5953) \u2014 secondary Russian periphery / BRI hinterland"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 50,
          browserOrder: 91
        }
      ]
    },
    {
      name: "OC Media",
      url: "https://oc-media.org/feed/",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 51,
          browserOrder: 92
        }
      ]
    },
    {
      name: "JAMnews",
      url: "https://jam-news.net/feed/",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 52,
          browserOrder: 93
        }
      ]
    },
    {
      name: "Azertag",
      url: "https://news.google.com/rss/search?q=site%3Aazertag.az%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Risk-tagged state wires",
        "Risk-tagged state wires \u2014 Azertag (Azerbaijan) / Armenpress (Armenia)"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 53,
          browserOrder: 94
        }
      ]
    },
    {
      name: "Armenpress",
      url: "https://news.google.com/rss/search?q=site%3Aarmenpress.am%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 54,
          browserOrder: 95
        }
      ]
    },
    {
      name: "Zerkalo",
      url: "https://news.google.com/rss/search?q=site%3Azerkalo.io%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Belarus / Moldova (#5953)",
        "Belarus / Moldova (#5953) \u2014 secondary pressure line"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 55,
          browserOrder: 96
        }
      ]
    },
    {
      name: "NewsMaker",
      url: "https://newsmaker.md/feed",
      lang: "ru",
      notes: [
        "NewsMaker removed its English feed; retain the live Russian feed only for Russian-language digests instead of serving a 404 to EN.",
        "NewsMaker removed its English feed; keep the live native Russian feed locale-scoped instead of default-enabling a 404 or mislabeled content."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 56,
          browserOrder: 97
        }
      ]
    },
    {
      name: "Ziarul de Gard\u0103",
      url: "https://www.zdg.md/feed/",
      lang: "ro",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 57,
          browserOrder: 98
        }
      ]
    },
    {
      name: "ERR News",
      url: "https://news.err.ee/rss",
      notes: [
        "Baltic states \u2014 Eastern flank (#5952). English-language, no lang tag, so EN digests include them.",
        "Baltic states \u2014 Eastern flank (#5952). English-language Baltic news services (no lang tag) so EN digests can include them as flank sources."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 58,
          browserOrder: 69
        }
      ]
    },
    {
      name: "LRT English",
      url: "https://www.lrt.lt/en/news-in-english?rss",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 59,
          browserOrder: 70
        }
      ]
    },
    {
      name: "LSM English",
      url: "https://eng.lsm.lv/rss/",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 60,
          browserOrder: 71
        }
      ]
    },
    {
      name: "Daily Sabah",
      url: "https://www.dailysabah.com/rss/home-page",
      notes: [
        "Daily Sabah (EN) \u2014 Turkey EN path improvement (#5952).",
        "Daily Sabah (EN) \u2014 Turkey EN path improvement (#5952). English-language, no lang tag, so EN digests include it as a default-on flank source."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 61,
          browserOrder: 32
        }
      ]
    },
    {
      name: "Hurriyet",
      url: "https://www.hurriyet.com.tr/rss/anasayfa",
      lang: "tr",
      strategicDefault: true,
      notes: [
        "Strategic local-depth sources (#6000) \u2014 reachable in every digest language and protected from client-side source filtering."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 62,
          browserOrder: 31
        }
      ]
    },
    {
      name: "Polsat News",
      url: "https://www.polsatnews.pl/rss/wszystkie.xml",
      lang: "pl",
      strategicDefault: true,
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 63,
          browserOrder: 34
        }
      ]
    },
    {
      name: "PAP",
      url: "https://news.google.com/rss/search?q=site%3Apap.pl%20when%3A2d&hl=pl&gl=PL&ceid=PL:pl",
      lang: "pl",
      notes: [
        "Polish depth \u2014 catalog opt-in, locale-boosted for `pl`. PAP/Onet native RSS is gone; OKO.press still has a live publisher feed.",
        "Polish depth \u2014 catalog opt-in, locale-boosted for `pl`. Native RSS for PAP (`/rss.xml`) and Onet (`wiadomosci.onet.pl/rss/index.xml`) is dead; keep those on Google News. OKO.press still publishes a live native feed."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 64,
          browserOrder: 36
        }
      ]
    },
    {
      name: "Gazeta Wyborcza",
      url: "https://news.google.com/rss/search?q=site%3Awyborcza.pl%20when%3A2d&hl=pl&gl=PL&ceid=PL:pl",
      lang: "pl",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 65,
          browserOrder: 37
        }
      ]
    },
    {
      name: "Polityka",
      url: "https://news.google.com/rss/search?q=site%3Apolityka.pl%20when%3A2d&hl=pl&gl=PL&ceid=PL:pl",
      lang: "pl",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 66,
          browserOrder: 38
        }
      ]
    },
    {
      name: "Onet",
      url: "https://news.google.com/rss/search?q=site%3Awiadomosci.onet.pl%20when%3A2d&hl=pl&gl=PL&ceid=PL:pl",
      lang: "pl",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 67,
          browserOrder: 39
        }
      ]
    },
    {
      name: "OKO.press",
      url: "https://oko.press/feed",
      lang: "pl",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 68,
          browserOrder: 40
        }
      ]
    },
    {
      name: "TVP Info",
      url: "https://news.google.com/rss/search?q=site%3Atvp.info%20when%3A2d&hl=pl&gl=PL&ceid=PL:pl",
      lang: "pl",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 69,
          browserOrder: 41
        }
      ]
    },
    {
      name: "Kathimerini",
      url: "https://news.google.com/rss/search?q=site%3Akathimerini.gr%20when%3A2d&hl=el&gl=GR&ceid=GR:el",
      lang: "el",
      strategicDefault: true,
      notes: [
        "Greek (EL)"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 70,
          browserOrder: 59
        }
      ]
    },
    {
      name: "Naftemporiki",
      url: "https://www.naftemporiki.gr/feed/",
      lang: "el",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 71,
          browserOrder: 60
        }
      ]
    },
    {
      name: "in.gr",
      url: "https://www.in.gr/feed/",
      lang: "el",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 72,
          browserOrder: 61
        }
      ]
    },
    {
      name: "iefimerida",
      url: "https://www.iefimerida.gr/rss.xml",
      lang: "el",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 73,
          browserOrder: 62
        }
      ]
    },
    {
      name: "Proto Thema",
      url: "https://news.google.com/rss/search?q=site%3Aprotothema.gr%20when%3A2d&hl=el&gl=GR&ceid=GR:el",
      lang: "el",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 74,
          browserOrder: 63
        }
      ]
    },
    {
      name: "ERT",
      url: "https://news.google.com/rss/search?q=site%3Aert.gr%20when%3A2d&hl=el&gl=GR&ceid=GR:el",
      lang: "el",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 75,
          browserOrder: 64
        }
      ]
    },
    {
      name: "AMNA",
      url: "https://news.google.com/rss/search?q=site%3Aamna.gr%20when%3A2d&hl=el&gl=GR&ceid=GR:el",
      lang: "el",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 76,
          browserOrder: 65
        }
      ]
    },
    {
      name: "Ta Nea",
      url: "https://www.tanea.gr/feed/",
      lang: "el",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 77,
          browserOrder: 66
        }
      ]
    },
    {
      name: "Liberal GR",
      url: "https://news.google.com/rss/search?q=site%3Aliberal.gr%20when%3A2d&hl=el&gl=GR&ceid=GR:el",
      lang: "el",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 78,
          browserOrder: 67
        }
      ]
    },
    {
      name: "CNN Greece",
      url: "https://news.google.com/rss/search?q=site%3Acnn.gr%20when%3A2d&hl=el&gl=GR&ceid=GR:el",
      lang: "el",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 79,
          browserOrder: 68
        }
      ]
    },
    {
      name: "Sky News",
      url: "https://news.google.com/rss/search?q=site%3Anews.sky.com%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 80,
          browserOrder: 99
        }
      ]
    },
    {
      name: "BBC UK",
      url: "https://feeds.bbci.co.uk/news/uk/rss.xml",
      notes: [
        "UK domestic and Northern Ireland desks (2026-10-17 audit): stories Google News World carried that BBC World leaves out."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 81,
          browserOrder: 100
        }
      ]
    },
    {
      name: "BBC Northern Ireland",
      url: "https://feeds.bbci.co.uk/news/northern_ireland/rss.xml",
      placements: [
        {
          edition: "full",
          category: "europe",
          serverOrder: 82,
          browserOrder: 101
        }
      ]
    },
    {
      name: "BBC Middle East",
      url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Al Jazeera",
      url: "https://www.aljazeera.com/xml/rss/all.xml",
      depthUrl: "https://news.google.com/rss/search?q=site%3Aaljazeera.com%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: {
          en: "https://www.aljazeera.com/xml/rss/all.xml",
          ar: "https://www.aljazeera.net/aljazeerarss/a7c186be-1adb-4b11-a982-4783e765316e/4e17ecdc-8fb9-40de-a5d6-d00f72384a51"
        }
      },
      notes: [
        "The native feed holds 25 entries, about ten hours; the Google News search holds 100 over two days (2026-10-17 /verify audit)."
      ],
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Al Arabiya",
      url: "https://news.google.com/rss/search?q=site%3Aenglish.alarabiya.net%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: {
          en: "https://news.google.com/rss/search?q=site:english.alarabiya.net+when:2d&hl=en-US&gl=US&ceid=US:en",
          ar: "https://www.alarabiya.net/tools/mrss/?cat=main"
        }
      },
      notes: [
        "Theater coverage preset (#5956) - English regional sources.",
        "AlArabiya EN blocks cloud IPs \u2014 Google News fallback; AR RSS is direct"
      ],
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Guardian ME",
      url: "https://www.theguardian.com/world/middleeast/rss",
      notes: [
        "Arab News and Times of Israel removed \u2014 403 from cloud IPs"
      ],
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "BBC Persian",
      url: "https://feeds.bbci.co.uk/persian/rss.xml",
      lang: "fa",
      browser: {
        lang: null
      },
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Iran International",
      url: "https://news.google.com/rss/search?q=site%3Airanintl.com%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Haaretz",
      url: "https://news.google.com/rss/search?q=site%3Ahaaretz.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 6,
          browserOrder: 9
        }
      ]
    },
    {
      name: "Jerusalem Post",
      url: "https://www.jpost.com/rss/rssfeedsheadlines.aspx",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 7,
          browserOrder: 10
        }
      ]
    },
    {
      name: "Ynetnews",
      url: "https://www.ynetnews.com/Integration/StoryRss3089.xml",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 8,
          browserOrder: 11
        }
      ]
    },
    {
      name: "Arab News",
      url: "https://news.google.com/rss/search?q=site%3Aarabnews.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 9,
          browserOrder: 12
        }
      ]
    },
    {
      name: "Arab News",
      url: "https://news.google.com/rss/search?q=site%3Aarabnews.com%20(Saudi%20Arabia%20OR%20investment%20OR%20infrastructure)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "gccNews",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "The National",
      url: "https://news.google.com/rss/search?q=site%3Athenationalnews.com%20(Abu%20Dhabi%20OR%20UAE%20OR%20Saudi)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "gccNews",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "The National",
      url: "https://www.thenationalnews.com/arc/outboundfeeds/rss/?outputType=xml",
      browser: {
        url: "https://news.google.com/rss/search?q=site:thenationalnews.com+when:2d&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 10,
          browserOrder: 13
        }
      ]
    },
    {
      name: "Oman Observer",
      url: "https://www.omanobserver.om/rssFeed/1",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 11,
          browserOrder: 14
        }
      ]
    },
    {
      name: "Asharq Business",
      url: "https://asharqbusiness.com/rss.xml",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 12,
          browserOrder: 15
        }
      ]
    },
    {
      name: "Rudaw",
      url: "https://news.google.com/rss/search?q=site%3Arudaw.net%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:rudaw.net+when:7d&hl=en&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 13,
          browserOrder: 17
        }
      ]
    },
    {
      name: "Yemen Online",
      url: "https://news.google.com/rss/search?q=site%3Ayemenonline.info%20when%3A14d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Validated crisis-floor desks (#6813-#6818, #6824-#6825)."
      ],
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 14,
          browserOrder: 18
        }
      ]
    },
    {
      name: "Sana'a Center",
      url: "https://sanaacenter.org/feed/",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 15,
          browserOrder: 19
        }
      ]
    },
    {
      name: "Syria Direct",
      url: "https://syriadirect.org/feed/",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 16,
          browserOrder: 20
        }
      ]
    },
    {
      name: "Enab Baladi English",
      url: "https://news.google.com/rss/search?q=site%3Aenglish.enabbaladi.net%20when%3A14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 17,
          browserOrder: 21
        }
      ]
    },
    {
      name: "+972 Magazine",
      url: "https://www.972mag.com/feed/",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 18,
          browserOrder: 22
        }
      ]
    },
    {
      name: "WAFA English",
      url: "https://news.google.com/rss/search?q=site%3Aenglish.wafa.ps%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 19,
          browserOrder: 23
        }
      ]
    },
    {
      name: "Naharnet Lebanon",
      url: "https://www.naharnet.com/tags/lebanon/en/feed.atom",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 20,
          browserOrder: 24
        }
      ]
    },
    {
      name: "L'Orient Today",
      url: "https://news.google.com/rss/search?q=site%3Alorientlejour.com%20Lebanon%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 21,
          browserOrder: 25
        }
      ]
    },
    {
      name: "Annahar",
      url: "https://news.google.com/rss/search?q=site%3Aannahar.com%2Flebanon%20when%3A7d&hl=ar&gl=LB&ceid=LB:ar",
      lang: "ar",
      strategicDefault: true,
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 22,
          browserOrder: 26
        }
      ]
    },
    {
      name: "Libya Herald",
      url: "https://libyaherald.com/rss.xml",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 23,
          browserOrder: 27
        }
      ]
    },
    {
      name: "Egypt Independent",
      url: "https://www.egyptindependent.com/feed/",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 24,
          browserOrder: 28
        }
      ]
    },
    {
      name: "Mada Masr",
      url: "https://news.google.com/rss/search?q=site%3Amadamasr.com%20when%3A30d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 25,
          browserOrder: 29
        }
      ]
    },
    {
      name: "Times of Israel",
      url: "https://news.google.com/rss/search?q=site%3Atimesofisrael.com%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Direct Times of Israel RSS returns 403 to cloud IPs; Google News does not."
      ],
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 26,
          browserOrder: 30
        }
      ]
    },
    {
      name: "Middle East Eye",
      url: "https://news.google.com/rss/search?q=site%3Amiddleeasteye.net%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          serverOrder: 27,
          browserOrder: 31
        }
      ]
    },
    {
      name: "Hacker News",
      url: "https://hnrss.org/frontpage",
      placements: [
        {
          edition: "full",
          category: "tech",
          serverOrder: 0,
          browserOrder: 0
        },
        {
          edition: "tech",
          category: "tech",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Ars Technica",
      url: "https://feeds.arstechnica.com/arstechnica/technology-lab",
      placements: [
        {
          edition: "full",
          category: "tech",
          serverOrder: 1,
          browserOrder: 1
        },
        {
          edition: "tech",
          category: "tech",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "The Verge",
      url: "https://www.theverge.com/rss/index.xml",
      placements: [
        {
          edition: "full",
          category: "tech",
          serverOrder: 2,
          browserOrder: 2
        },
        {
          edition: "tech",
          category: "tech",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "MIT Tech Review",
      url: "https://www.technologyreview.com/feed/",
      placements: [
        {
          edition: "full",
          category: "tech",
          serverOrder: 3,
          browserOrder: 3
        },
        {
          edition: "tech",
          category: "tech",
          browserOrder: 4,
          serverOrder: 9
        }
      ]
    },
    {
      name: "MIT Tech Review",
      url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
      placements: [
        {
          edition: "full",
          category: "ai",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Wired",
      url: "https://www.wired.com/feed/rss",
      placements: [
        {
          edition: "full",
          category: "tech",
          serverOrder: 4,
          browserOrder: 4
        },
        {
          edition: "tech",
          category: "tech",
          serverOrder: 4,
          browserOrder: 9
        }
      ]
    },
    {
      name: "AI News",
      url: "https://news.google.com/rss/search?q=(OpenAI%20OR%20Anthropic%20OR%20Google%20AI%20OR%20%22large%20language%20model%22%20OR%20ChatGPT)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "ai",
          serverOrder: 0,
          browserOrder: 0
        },
        {
          edition: "tech",
          category: "ai",
          serverOrder: 0
        }
      ]
    },
    {
      name: "AI News",
      url: 'https://news.google.com/rss/search?q=(OpenAI+OR+Anthropic+OR+Google+AI+OR+"large+language+model"+OR+ChatGPT+OR+Claude+OR+"AI+model")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "ai",
          browserOrder: 0
        }
      ]
    },
    {
      name: "VentureBeat AI",
      url: "https://venturebeat.com/category/ai/feed/",
      placements: [
        {
          edition: "full",
          category: "ai",
          serverOrder: 1,
          browserOrder: 1
        },
        {
          edition: "tech",
          category: "ai",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "The Verge AI",
      url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
      placements: [
        {
          edition: "full",
          category: "ai",
          serverOrder: 2,
          browserOrder: 2
        },
        {
          edition: "tech",
          category: "ai",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "ArXiv AI",
      url: "https://export.arxiv.org/rss/cs.AI",
      placements: [
        {
          edition: "full",
          category: "ai",
          serverOrder: 4,
          browserOrder: 4
        },
        {
          edition: "tech",
          category: "ai",
          serverOrder: 3,
          browserOrder: 5
        }
      ]
    },
    {
      name: "CNBC",
      url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 0,
          browserOrder: 0
        },
        {
          edition: "finance",
          category: "markets",
          serverOrder: 0,
          browserOrder: 0
        },
        {
          edition: "commodity",
          category: "finance",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "MarketWatch",
      url: "https://news.google.com/rss/search?q=site%3Amarketwatch.com%20markets%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Direct MarketWatch RSS returns frequent 403s from cloud IPs; use Google News fallback."
      ],
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 1,
          browserOrder: 1
        },
        {
          edition: "commodity",
          category: "finance",
          serverOrder: 1,
          browserOrder: 1
        },
        {
          edition: "finance",
          category: "markets",
          browserOrder: 1,
          serverOrder: 8
        }
      ]
    },
    {
      name: "Yahoo Finance",
      url: "https://finance.yahoo.com/news/rssindex",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 2,
          browserOrder: 2
        },
        {
          edition: "commodity",
          category: "finance",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Yahoo Finance",
      url: "https://finance.yahoo.com/rss/topstories",
      placements: [
        {
          edition: "tech",
          category: "finance",
          serverOrder: 1,
          browserOrder: 2
        },
        {
          edition: "finance",
          category: "markets",
          serverOrder: 1,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Financial Times",
      url: "https://www.ft.com/rss/home",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 3,
          browserOrder: 3
        },
        {
          edition: "commodity",
          category: "finance",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Reuters Business",
      url: "https://news.google.com/rss/search?q=site%3Areuters.com%20business%20markets%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:reuters.com+business+markets&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 4,
          browserOrder: 4
        },
        {
          edition: "commodity",
          category: "finance",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Fox Business",
      url: "https://moxie.foxbusiness.com/google-publisher/latest.xml",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 5,
          browserOrder: 5
        },
        {
          edition: "finance",
          category: "markets",
          serverOrder: 3,
          browserOrder: 7
        }
      ]
    },
    {
      name: "Business Insider",
      url: "https://www.businessinsider.com/rss",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 6,
          browserOrder: 6
        },
        {
          edition: "finance",
          category: "markets",
          serverOrder: 4,
          browserOrder: 8
        }
      ]
    },
    {
      name: "GlobeNewswire",
      url: "https://www.globenewswire.com/RssFeed/subjectcode/22/feedTitle/GlobeNewswire",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 7,
          browserOrder: 7
        },
        {
          edition: "finance",
          category: "markets",
          serverOrder: 5,
          browserOrder: 9
        }
      ]
    },
    {
      name: "Business Wire",
      url: "https://feed.businesswire.com/rss/home/?rss=G1QFDERJXkJeGVtRWA==",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 8,
          browserOrder: 8
        },
        {
          edition: "finance",
          category: "markets",
          serverOrder: 6,
          browserOrder: 10
        }
      ]
    },
    {
      name: "PR Newswire",
      url: "https://news.google.com/rss/search?q=site%3Aprnewswire.com%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 9,
          browserOrder: 9
        },
        {
          edition: "finance",
          category: "markets",
          serverOrder: 7,
          browserOrder: 11
        }
      ]
    },
    {
      name: "Chainwire",
      url: "https://chainwire.org/feed/",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 10,
          browserOrder: 10
        },
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 4,
          browserOrder: 14
        }
      ]
    },
    {
      name: "Coinbase Blog",
      url: "https://news.google.com/rss/search?q=site%3Acoinbase.com%2Fblog%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 11,
          browserOrder: 11
        },
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 5,
          browserOrder: 15
        }
      ]
    },
    {
      name: "Binance Announcements",
      url: "https://news.google.com/rss/search?q=site%3Abinance.com%2Fen%2Fsupport%2Fannouncement%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 12,
          browserOrder: 12
        },
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 6,
          browserOrder: 16
        }
      ]
    },
    {
      name: "Jin10",
      url: "https://news.google.com/rss/search?q=site%3Ajin10.com%20when%3A1d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      lang: "zh",
      placements: [
        {
          edition: "full",
          category: "finance",
          serverOrder: 13,
          browserOrder: 13
        },
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 7,
          browserOrder: 17
        }
      ]
    },
    {
      name: "Oil & Gas",
      url: "https://news.google.com/rss/search?q=(oil%20price%20OR%20OPEC%20OR%20%22natural%20gas%22%20OR%20pipeline%20OR%20LNG)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "commodities",
          serverOrder: 0
        },
        {
          edition: "full",
          category: "energy",
          serverOrder: 0,
          browserOrder: 0
        },
        {
          edition: "finance",
          category: "commodities",
          serverOrder: 0
        }
      ]
    },
    {
      name: "Oil & Gas",
      url: 'https://news.google.com/rss/search?q=(oil+price+OR+OPEC+OR+"natural+gas"+OR+"crude+oil"+OR+WTI+OR+Brent)+when:1d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "commodities",
          browserOrder: 0
        }
      ]
    },
    {
      name: "Gold & Metals",
      url: "https://news.google.com/rss/search?q=(%22gold%20price%22%20OR%20%22silver%20price%22%20OR%20%22precious%20metals%22%20OR%20%22copper%20price%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=(gold+price+OR+silver+price+OR+copper+OR+platinum+OR+"precious+metals")+when:2d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "full",
          category: "commodities",
          serverOrder: 1
        },
        {
          edition: "finance",
          category: "commodities",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "White House",
      url: "https://www.whitehouse.gov/briefings-statements/feed/",
      notes: [
        "White House: two direct WordPress RSS feeds. Replaces gn('site:whitehouse.gov ...') so the publisher's pubDate is authoritative and old re-indexed pages can't slip through. briefings-statements covers daily press releases; presidential-actions covers EOs / proclamations / nominations."
      ],
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "White House Actions",
      url: "https://www.whitehouse.gov/presidential-actions/feed/",
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "State Dept",
      url: "https://news.google.com/rss/search?q=(site%3Astate.gov%20OR%20%22State%20Department%22)%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=site:state.gov+OR+"State+Department"&hl=en-US&gl=US&ceid=US:en'
      },
      notes: [
        "State Dept, Treasury, DOJ: no working public RSS feed at any verified path (probed 2026-04-26). Federal Register fallback is bot-blocked. Stuck on Google News until a per-agency HTML scraper or destination-pubDate cross-check ships. The READ-time freshness floor in seed-digest-notifications.mjs::buildDigest mitigates the residue gap; PR-3417's when:1d gates new ingests by Google's honest-relayed source pubDate. See: skill: ingest-gate-tightening-leaves-residue-in-read-path"
      ],
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Pentagon",
      url: "https://www.war.gov/DesktopModules/ArticleCS/RSS.ashx?ContentType=1&Site=945",
      notes: [
        "Pentagon: direct war.gov RSS (post-rebrand). Replaces gn('(site:defense.gov OR Pentagon) when:1d') for the same reason as White House \u2014 the publisher's pubDate is authoritative, no re-indexing surprises."
      ],
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Federal Reserve",
      url: "https://www.federalreserve.gov/feeds/press_all.xml",
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 4,
          browserOrder: 6
        },
        {
          edition: "finance",
          category: "centralbanks",
          serverOrder: 0,
          browserOrder: 0
        },
        {
          edition: "ondemand",
          category: "nq-news",
          browserOrder: 2
        },
        {
          edition: "finance",
          category: "nq-news",
          serverOrder: 2
        }
      ]
    },
    {
      name: "SEC",
      url: "https://www.sec.gov/news/pressreleases.rss",
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 5,
          browserOrder: 7
        },
        {
          edition: "finance",
          category: "fin-regulation",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "U.S. Trade Representative",
      url: "https://ustr.gov/rss.xml",
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 6,
          browserOrder: 11
        }
      ]
    },
    {
      name: "UN News",
      url: "https://news.un.org/feed/subscribe/en/news/all/rss.xml",
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 7,
          browserOrder: 12
        }
      ]
    },
    {
      name: "CISA",
      url: "https://www.cisa.gov/cybersecurity-advisories/all.xml",
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 8,
          browserOrder: 13
        }
      ]
    },
    {
      name: "Treasury",
      url: "https://news.google.com/rss/search?q=site%3Atreasury.gov%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=site:treasury.gov+OR+"Treasury+Department"&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 9,
          browserOrder: 4
        }
      ]
    },
    {
      name: "DOJ",
      url: "https://news.google.com/rss/search?q=site%3Ajustice.gov%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=site:justice.gov+OR+"Justice+Department"+DOJ&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "full",
          category: "gov",
          serverOrder: 10,
          browserOrder: 5
        }
      ]
    },
    {
      name: "BBC Africa",
      url: "https://feeds.bbci.co.uk/news/world/africa/rss.xml",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 0,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Guardian Africa",
      url: "https://www.theguardian.com/world/africa/rss",
      notes: [
        "Keep regional desks early in the category-fair fetch schedule (#7748).",
        "Regional desks widen country grounding beyond the world-news feeds (#7748)."
      ],
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 1,
          browserOrder: 0
        }
      ]
    },
    {
      name: "France 24 Africa",
      url: "https://www.france24.com/en/africa/rss",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 2,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Africa News",
      url: "https://news.google.com/rss/search?q=(Africa%20OR%20Nigeria%20OR%20Kenya%20OR%20%22South%20Africa%22%20OR%20Ethiopia)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Theater coverage preset (#5956) - Sahel and West Africa sources."
      ],
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 3,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Sahel Crisis",
      url: "https://news.google.com/rss/search?q=(Sahel%20OR%20Mali%20OR%20Niger%20OR%20%22Burkina%20Faso%22%20OR%20Wagner)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 4,
          browserOrder: 3
        }
      ]
    },
    {
      name: "News24",
      url: "https://feeds.news24.com/articles/news24/TopStories/rss",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 5,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Africanews",
      url: "https://www.africanews.com/feed/",
      browser: {
        url: {
          en: "https://www.africanews.com/feed/rss",
          fr: "https://fr.africanews.com/feed/rss"
        }
      },
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 6,
          browserOrder: 7
        }
      ]
    },
    {
      name: "Jeune Afrique",
      url: "https://www.jeuneafrique.com/feed/",
      lang: "fr",
      strategicDefault: true,
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 7,
          browserOrder: 6
        }
      ]
    },
    {
      name: "Premium Times",
      url: "https://www.premiumtimesng.com/feed",
      notes: [
        "Nigeria"
      ],
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 8,
          browserOrder: 9
        }
      ]
    },
    {
      name: "Vanguard Nigeria",
      url: "https://www.vanguardngr.com/feed/",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 9,
          browserOrder: 10
        }
      ]
    },
    {
      name: "Channels TV",
      url: "https://www.channelstv.com/feed/",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 10,
          browserOrder: 11
        }
      ]
    },
    {
      name: "Daily Trust",
      url: "https://dailytrust.com/feed/",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 11,
          browserOrder: 12
        }
      ]
    },
    {
      name: "ThisDay",
      url: "https://www.thisdaylive.com/feed",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 12,
          browserOrder: 13
        }
      ]
    },
    {
      name: "Radio Tamazuj",
      url: "https://www.radiotamazuj.org/en/feed",
      notes: [
        "Horn of Africa"
      ],
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 13,
          browserOrder: 14
        }
      ]
    },
    {
      name: "The Reporter Ethiopia",
      url: "https://www.thereporterethiopia.com/feed/",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 14,
          browserOrder: 15
        }
      ]
    },
    {
      name: "Ethiopia Insight",
      url: "https://www.ethiopia-insight.com/feed/",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 15,
          browserOrder: 16
        }
      ]
    },
    {
      name: "Dabanga Sudan",
      url: "https://www.dabangasudan.org/en/feed",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 16,
          browserOrder: 17
        }
      ]
    },
    {
      name: "Hiiraan Online",
      url: "https://news.google.com/rss/search?q=site%3Ahiiraan.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 17,
          browserOrder: 18
        }
      ]
    },
    {
      name: "Actualite.cd",
      url: "https://actualite.cd/feed",
      lang: "fr",
      notes: [
        "DRC / Great Lakes"
      ],
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 18,
          browserOrder: 19
        }
      ]
    },
    {
      name: "Radio Okapi",
      url: "https://www.radiookapi.net/rss.xml",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 19,
          browserOrder: 20
        }
      ]
    },
    {
      name: "MyJoyOnline",
      url: "https://www.myjoyonline.com/feed/",
      notes: [
        "West Africa beyond Nigeria"
      ],
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 20,
          browserOrder: 21
        }
      ]
    },
    {
      name: "Citi Newsroom",
      url: "https://news.google.com/rss/search?q=site%3Acitinewsroom.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 21,
          browserOrder: 22
        }
      ]
    },
    {
      name: "Le Quotidien",
      url: "https://lequotidien.sn/feed/",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 22,
          browserOrder: 23
        }
      ]
    },
    {
      name: "RFI Afrique",
      url: "https://www.rfi.fr/en/africa/rss",
      notes: [
        "Pan-African"
      ],
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 23,
          browserOrder: 24
        }
      ]
    },
    {
      name: "Studio Tamani",
      url: "https://www.studiotamani.org/feed/",
      lang: "fr",
      strategicDefault: true,
      notes: [
        "Validated crisis-floor and locale desks (#6819-#6821, #6827-#6830)."
      ],
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 24,
          browserOrder: 25
        }
      ]
    },
    {
      name: "leFaso.net",
      url: "https://lefaso.net/spip.php?page=backend",
      lang: "fr",
      strategicDefault: true,
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 25,
          browserOrder: 26
        }
      ]
    },
    {
      name: "ActuNiger",
      url: "https://news.google.com/rss/search?q=site%3Aactuniger.com%20Niger%20when%3A7d&hl=fr&gl=FR&ceid=FR:fr",
      lang: "fr",
      strategicDefault: true,
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 26,
          browserOrder: 27
        }
      ]
    },
    {
      name: "A\xEFr Info",
      url: "https://airinfoagadez.com/feed/",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 27,
          browserOrder: 28
        }
      ]
    },
    {
      name: "Daily Nation",
      url: "https://nation.africa/kenya/rss.xml",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 28,
          browserOrder: 29
        }
      ]
    },
    {
      name: "The Guardian Post",
      url: "https://news.google.com/rss/search?q=site%3Atheguardianpostcameroon.com%20when%3A30d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 29,
          browserOrder: 30
        }
      ]
    },
    {
      name: "Tchadinfos",
      url: "https://tchadinfos.com/feed/",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 30,
          browserOrder: 31
        }
      ]
    },
    {
      name: "Alwihda Info",
      url: "https://www.alwihdainfo.com/rss/",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 31,
          browserOrder: 32
        }
      ]
    },
    {
      name: "Radio Ndeke Luka",
      url: "https://www.radiondekeluka.org/feed/",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "africa",
          serverOrder: 32,
          browserOrder: 33
        }
      ]
    },
    {
      name: "BBC Latin America",
      url: "https://feeds.bbci.co.uk/news/world/latin_america/rss.xml",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 0,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Guardian Americas",
      url: "https://www.theguardian.com/world/americas/rss",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 1,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Guardian Caribbean",
      url: "https://www.theguardian.com/world/caribbean/rss",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 2,
          browserOrder: 0
        }
      ]
    },
    {
      name: "France 24 LatAm",
      url: "https://www.france24.com/en/americas/rss",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 3,
          browserOrder: 18
        }
      ]
    },
    {
      name: "Mexico News Daily",
      url: "https://mexiconewsdaily.com/feed/",
      notes: [
        "Mexico"
      ],
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 4,
          browserOrder: 14
        }
      ]
    },
    {
      name: "Primicias",
      url: "https://www.primicias.ec/feed/",
      lang: "es",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 5,
          browserOrder: 11
        }
      ]
    },
    {
      name: "Infobae Americas",
      url: "https://www.infobae.com/arc/outboundfeeds/rss/",
      lang: "es",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 6,
          browserOrder: 12
        }
      ]
    },
    {
      name: "El Universo",
      url: "https://www.eluniverso.com/arc/outboundfeeds/rss/category/noticias/?outputType=xml",
      lang: "es",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 7,
          browserOrder: 13
        }
      ]
    },
    {
      name: "Clar\xEDn",
      url: "https://www.clarin.com/rss/lo-ultimo/",
      lang: "es",
      notes: [
        "Localized Feeds"
      ],
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 8,
          browserOrder: 5
        }
      ]
    },
    {
      name: "InSight Crime",
      url: "https://insightcrime.org/feed/",
      notes: [
        "LatAm Security"
      ],
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 9,
          browserOrder: 17
        }
      ]
    },
    {
      name: "HaitiLibre English",
      url: "https://www.haitilibre.com/rss-flash-en.php",
      notes: [
        "Validated crisis-floor desks (#6816, #6822-#6823)."
      ],
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 10,
          browserOrder: 19
        }
      ]
    },
    {
      name: "AyiboPost",
      url: "https://news.google.com/rss/search?q=site%3Aayibopost.com%20Haiti%20when%3A14d&hl=fr&gl=FR&ceid=FR:fr",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 11,
          browserOrder: 20
        }
      ]
    },
    {
      name: "Caracas Chronicles",
      url: "https://www.caracaschronicles.com/feed/",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 12,
          browserOrder: 21
        }
      ]
    },
    {
      name: "Efecto Cocuyo",
      url: "https://efectococuyo.com/feed/",
      lang: "es",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 13,
          browserOrder: 22
        }
      ]
    },
    {
      name: "Havana Times",
      url: "https://havanatimes.org/feed/",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 14,
          browserOrder: 23
        }
      ]
    },
    {
      name: "14ymedio",
      url: "https://www.14ymedio.com/rss/",
      lang: "es",
      placements: [
        {
          edition: "full",
          category: "latam",
          serverOrder: 15,
          browserOrder: 24
        }
      ]
    },
    {
      name: "BBC Asia",
      url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 0,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Guardian Pacific",
      url: "https://www.theguardian.com/world/pacific-islands/rss",
      notes: [
        "Pacific Islands"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 1,
          browserOrder: 29
        }
      ]
    },
    {
      name: "France 24 Asia Pacific",
      url: "https://www.france24.com/en/asia-pacific/rss",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 2,
          browserOrder: 30
        }
      ]
    },
    {
      name: "The Diplomat",
      url: "https://thediplomat.com/feed/",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 3,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Reuters Asia",
      url: "https://news.google.com/rss/search?q=site%3Areuters.com%20(China%20OR%20Japan%20OR%20Taiwan%20OR%20Korea)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Theater coverage preset (#5956) - Indo-Pacific sources."
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Reuters India",
      url: "https://news.google.com/rss/search?q=site%3Areuters.com%20India%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Japan Today",
      url: "https://japantoday.com/feed/atom",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 6,
          browserOrder: 7
        }
      ]
    },
    {
      name: "Nikkei Asia",
      url: "https://news.google.com/rss/search?q=site%3Aasia.nikkei.com%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 7,
          browserOrder: 8
        }
      ]
    },
    {
      name: "CNA",
      url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 8,
          browserOrder: 18
        }
      ]
    },
    {
      name: "NDTV",
      url: "https://feeds.feedburner.com/ndtvnews-top-stories",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 9,
          browserOrder: 12
        }
      ]
    },
    {
      name: "South China Morning Post",
      url: "https://news.google.com/rss/search?q=site%3Ascmp.com%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://www.scmp.com/rss/91/feed/"
      },
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 10,
          browserOrder: 3
        }
      ]
    },
    {
      name: "The Hindu",
      url: "https://www.thehindu.com/feeder/default.rss",
      browser: {
        url: "https://www.thehindu.com/news/national/feeder/default.rss",
        lang: "en"
      },
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 11,
          browserOrder: 10
        }
      ]
    },
    {
      name: "Asia News",
      url: "https://news.google.com/rss/search?q=site%3Aasianews.it%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=(China+OR+Japan+OR+Korea+OR+India+OR+ASEAN)+when:2d&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 12,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Xinhua",
      url: "https://news.google.com/rss/search?q=site%3Axinhuanet.com%20OR%20Xinhua%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      deadlinePriority: 100,
      notes: [
        "China coverage feeds must start before the full digest's later batches. Otherwise a slow cold build can report timeout for an otherwise healthy source while the seed transport remains fresh."
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 13,
          browserOrder: 6
        }
      ]
    },
    {
      name: "Asahi Shimbun",
      url: "https://www.asahi.com/rss/asahi/newsheadlines.rdf",
      lang: "ja",
      strategicDefault: true,
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 14,
          browserOrder: 9
        }
      ]
    },
    {
      name: "MIIT (China)",
      url: "https://api.worldmonitor.app/api/miit-news",
      lang: "zh",
      strategicDefault: true,
      deadlinePriority: 100,
      browser: {
        url: "/api/miit-news"
      },
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 15,
          browserOrder: 19
        }
      ]
    },
    {
      name: "MOFCOM (China)",
      url: "https://news.google.com/rss/search?q=site%3Amofcom.gov.cn%20when%3A7d&hl=zh-CN&gl=CN&ceid=CN:zh-Hans",
      lang: "zh",
      strategicDefault: true,
      deadlinePriority: 100,
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 16,
          browserOrder: 20
        }
      ]
    },
    {
      name: "Bangkok Post",
      url: "https://news.google.com/rss/search?q=site%3Abangkokpost.com%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      lang: "th",
      strategicDefault: true,
      notes: [
        "Thailand"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 17,
          browserOrder: 21
        }
      ]
    },
    {
      name: "VnExpress",
      url: "https://vnexpress.net/rss/tin-moi-nhat.rss",
      lang: "vi",
      strategicDefault: true,
      notes: [
        "Vietnam"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 18,
          browserOrder: 23
        }
      ]
    },
    {
      name: "Yonhap News",
      url: "https://www.yonhapnewstv.co.kr/browse/feed/",
      lang: "ko",
      strategicDefault: true,
      notes: [
        "Korea"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 19,
          browserOrder: 25
        }
      ]
    },
    {
      name: "BBC Hindi",
      url: "https://feeds.bbci.co.uk/hindi/rss.xml",
      lang: "hi",
      notes: [
        "Hindi (HI) \u2014 mainstream national coverage boosted for Hindi locale users"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 20,
          browserOrder: 14
        }
      ]
    },
    {
      name: "Aaj Tak",
      url: "https://www.aajtak.in/rssfeeds/?id=home",
      lang: "hi",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 21,
          browserOrder: 15
        }
      ]
    },
    {
      name: "NDTV India",
      url: "https://feeds.feedburner.com/ndtvkhabar-latest",
      lang: "hi",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 22,
          browserOrder: 16
        }
      ]
    },
    {
      name: "Amar Ujala",
      url: "https://www.amarujala.com/rss/national.xml",
      lang: "hi",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 23,
          browserOrder: 17
        }
      ]
    },
    {
      name: "Eurasianet",
      url: "https://eurasianet.org/rss",
      notes: [
        "Central Asia (#5953) \u2014 Russia rear area, China BRI, sanctions leakage"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 24,
          browserOrder: 32
        }
      ]
    },
    {
      name: "RFE/RL Central Asia",
      url: "https://news.google.com/rss/search?q=site%3Arferl.org%20Central%2BAsia%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:rferl.org+Central+Asia+when:3d&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 25,
          browserOrder: 33
        }
      ]
    },
    {
      name: "The Astana Times",
      url: "https://astanatimes.com/feed/",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 26,
          browserOrder: 34
        }
      ]
    },
    {
      name: "The Times of Central Asia",
      url: "https://timesca.com/feed/",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 27,
          browserOrder: 35
        }
      ]
    },
    {
      name: "Focus Taiwan",
      url: "https://news.google.com/rss/search?q=site%3Afocustaiwan.tw%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Taiwan (#5954)"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 28,
          browserOrder: 36
        }
      ]
    },
    {
      name: "Taipei Times",
      url: "https://news.google.com/rss/search?q=site%3Ataipeitimes.com%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 29,
          browserOrder: 37
        }
      ]
    },
    {
      name: "Taiwan News",
      url: "https://news.google.com/rss/search?q=site%3Ataiwannews.com.tw%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 30,
          browserOrder: 38
        }
      ]
    },
    {
      name: "Dawn",
      url: "https://www.dawn.com/feeds/home/",
      notes: [
        "Pakistan (#5954)"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 31,
          browserOrder: 39
        }
      ]
    },
    {
      name: "Geo News",
      url: "https://news.google.com/rss/search?q=site%3Ageo.tv%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 32,
          browserOrder: 40
        }
      ]
    },
    {
      name: "Jakarta Post",
      url: "https://news.google.com/rss/search?q=site%3Athejakartapost.com%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "SE Asia security (#5954)"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 33,
          browserOrder: 41
        }
      ]
    },
    {
      name: "Rappler",
      url: "https://www.rappler.com/feed/",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 34,
          browserOrder: 42
        }
      ]
    },
    {
      name: "The Star (Malaysia)",
      url: "https://news.google.com/rss/search?q=site%3Athestar.com.my%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 35,
          browserOrder: 43
        }
      ]
    },
    {
      name: "Irrawaddy",
      url: "https://www.irrawaddy.com/feed/",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 36,
          browserOrder: 44
        }
      ]
    },
    {
      name: "Island Times (Palau)",
      url: "https://islandtimes.org/feed/",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 37,
          browserOrder: 31
        }
      ]
    },
    {
      name: "Amu TV",
      url: "https://amu.tv/feed/",
      notes: [
        "Validated crisis-floor desks (#6817, #6826)."
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 38,
          browserOrder: 45
        }
      ]
    },
    {
      name: "Pajhwok Afghan News",
      url: "https://news.google.com/rss/search?q=site%3Apajhwok.com%20Afghanistan%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 39,
          browserOrder: 46
        }
      ]
    },
    {
      name: "The Daily Star",
      url: "https://news.google.com/rss/search?q=site%3Athedailystar.net%20when%3A14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 40,
          browserOrder: 47
        }
      ]
    },
    {
      name: "Dhaka Tribune",
      url: "https://news.google.com/rss/search?q=site%3Adhakatribune.com%20when%3A14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 41,
          browserOrder: 48
        }
      ]
    },
    {
      name: "Times of India",
      url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
      lang: "en",
      notes: [
        "New opt-in feeds stay at the end of the category. The free source cap consumes declaration order, so inserting earlier can evict an existing source from persisted free-user selections."
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 42,
          browserOrder: 49
        }
      ]
    },
    {
      name: "Japan Times",
      url: "https://news.google.com/rss/search?q=site%3Ajapantimes.co.jp%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          serverOrder: 43,
          browserOrder: 50
        }
      ]
    },
    {
      name: "Reuters Energy",
      url: "https://news.google.com/rss/search?q=site%3Areuters.com%20(oil%20OR%20gas%20OR%20energy)%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "energy",
          serverOrder: 6,
          browserOrder: 6
        }
      ]
    },
    {
      name: "Reuters Energy",
      url: "https://news.google.com/rss/search?q=site%3Areuters.com%20energy%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:reuters.com+(oil+OR+gas+OR+energy+OR+OPEC)+when:3d&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "energy",
          serverOrder: 1,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Reuters Energy",
      url: "https://news.google.com/rss/search?q=site:reuters.com+(oil+OR+gas+OR+energy+OR+OPEC+OR+pipeline+OR+LNG)+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "energy",
          category: "live-news",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Nuclear Energy",
      url: "https://news.google.com/rss/search?q=(%22nuclear%20energy%22%20OR%20%22nuclear%20power%22%20OR%20%22nuclear%20reactor%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("nuclear+energy"+OR+"nuclear+power"+OR+uranium+OR+IAEA)+when:3d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "full",
          category: "energy",
          serverOrder: 2,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Foreign Policy",
      url: "https://foreignpolicy.com/feed/",
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          serverOrder: 0,
          browserOrder: 0
        },
        {
          edition: "intel",
          category: "intel",
          serverOrder: 9
        },
        {
          edition: "intel",
          category: "intel",
          browserOrder: 14,
          type: "intl"
        }
      ]
    },
    {
      name: "Atlantic Council",
      url: "https://www.atlanticcouncil.org/feed/",
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          serverOrder: 1,
          browserOrder: 1
        },
        {
          edition: "intel",
          category: "intel",
          serverOrder: 11
        },
        {
          edition: "intel",
          category: "intel",
          browserOrder: 16,
          type: "intl"
        }
      ]
    },
    {
      name: "Foreign Affairs",
      url: "https://www.foreignaffairs.com/rss.xml",
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          serverOrder: 2,
          browserOrder: 2
        },
        {
          edition: "intel",
          category: "intel",
          serverOrder: 10
        },
        {
          edition: "intel",
          category: "intel",
          browserOrder: 15,
          type: "intl"
        }
      ]
    },
    {
      name: "War on the Rocks",
      url: "https://warontherocks.com/feed/",
      browser: {
        url: "https://warontherocks.com/feed"
      },
      notes: [
        "New verified think tank feeds War on the Rocks - Defense and national security analysis"
      ],
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          serverOrder: 3,
          browserOrder: 7
        }
      ]
    },
    {
      name: "CSIS",
      url: "https://www.csis.org/rss.xml",
      browser: {
        url: "https://news.google.com/rss/search?q=site:csis.org+when:7d&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          serverOrder: 4,
          browserOrder: 3
        }
      ]
    },
    {
      name: "CSIS",
      url: "https://news.google.com/rss/search?q=site:csis.org+when:7d&hl=en&gl=US&ceid=US:en",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 11,
          serverOrder: 25
        }
      ]
    },
    {
      name: "ISW",
      url: "https://news.google.com/rss/search?q=site%3Aunderstandingwar.org%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "ISW \u2014 Institute for the Study of War, daily Ukraine frontline operational assessments"
      ],
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          serverOrder: 5,
          browserOrder: 12
        }
      ]
    },
    {
      name: "CrisisWatch",
      url: "https://www.crisisgroup.org/rss",
      placements: [
        {
          edition: "full",
          category: "crisis",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "IAEA",
      url: "https://www.iaea.org/feeds/topnews",
      placements: [
        {
          edition: "full",
          category: "crisis",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "WHO",
      url: "https://www.who.int/rss-feeds/news-english.xml",
      placements: [
        {
          edition: "full",
          category: "crisis",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Layoffs.fyi",
      url: "https://news.google.com/rss/search?q=tech%2Bcompany%2Blayoffs%2Bannounced%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=tech+company+layoffs+announced&hl=en&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "full",
          category: "layoffs",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Layoffs.fyi",
      url: "https://news.google.com/rss/search?q=tech%2Blayoffs%2Bwhen%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=tech+layoffs+when:7d&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "tech",
          category: "layoffs",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "TechCrunch Layoffs",
      url: "https://techcrunch.com/tag/layoffs/feed/",
      placements: [
        {
          edition: "full",
          category: "layoffs",
          serverOrder: 1,
          browserOrder: 1
        },
        {
          edition: "tech",
          category: "layoffs",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Layoffs News",
      url: "https://news.google.com/rss/search?q=(layoffs%20OR%20%22job%20cuts%22%20OR%20%22workforce%20reduction%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "layoffs",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Reuters Science",
      url: "https://news.google.com/rss/search?q=site%3Areuters.com%20science%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "science",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Nature News",
      url: "https://www.nature.com/nature.rss",
      placements: [
        {
          edition: "full",
          category: "science",
          serverOrder: 1,
          browserOrder: 1
        },
        {
          edition: "happy",
          category: "science",
          serverOrder: 1,
          browserOrder: 2
        }
      ]
    },
    {
      name: "BBC Science",
      url: "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
      placements: [
        {
          edition: "full",
          category: "science",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Guardian Science",
      url: "https://www.theguardian.com/science/rss",
      placements: [
        {
          edition: "full",
          category: "science",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "ScienceDaily",
      url: "https://www.sciencedaily.com/rss/all.xml",
      placements: [
        {
          edition: "full",
          category: "science",
          serverOrder: 4,
          browserOrder: 4
        },
        {
          edition: "happy",
          category: "science",
          serverOrder: 0,
          browserOrder: 1
        }
      ]
    },
    {
      name: "TechCrunch",
      url: "https://techcrunch.com/feed/",
      placements: [
        {
          edition: "tech",
          category: "tech",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "TechCrunch Startups",
      url: "https://techcrunch.com/category/startups/feed/",
      placements: [
        {
          edition: "tech",
          category: "startups",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "VentureBeat",
      url: "https://venturebeat.com/feed/",
      placements: [
        {
          edition: "tech",
          category: "startups",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Crunchbase News",
      url: "https://news.crunchbase.com/feed/",
      placements: [
        {
          edition: "tech",
          category: "startups",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Y Combinator Blog",
      url: "https://www.ycombinator.com/blog/rss/",
      placements: [
        {
          edition: "tech",
          category: "vcblogs",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "a16z Blog",
      url: "https://www.a16z.news/feed",
      browser: {
        url: 'https://news.google.com/rss/search?q=site:a16z.com+OR+"Andreessen+Horowitz"+blog+when:14d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "tech",
          category: "vcblogs",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "First Round Review",
      url: "https://review.firstround.com/articles/rss",
      placements: [
        {
          edition: "tech",
          category: "vcblogs",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Sequoia Blog",
      url: "https://news.google.com/rss/search?q=site%3Asequoiacap.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "vcblogs",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Stratechery",
      url: "https://stratechery.com/feed/",
      placements: [
        {
          edition: "tech",
          category: "vcblogs",
          serverOrder: 4,
          browserOrder: 7
        }
      ]
    },
    {
      name: "EU Startups",
      url: "https://www.eu-startups.com/feed/",
      browser: {
        url: "https://news.google.com/rss/search?q=site:eu-startups.com+when:7d&hl=en-US&gl=US&ceid=US:en"
      },
      notes: [
        "Europe"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Tech.eu",
      url: "https://tech.eu/feed/",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Sifted (Europe)",
      url: "https://sifted.eu/feed",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Tech in Asia",
      url: "https://www.techinasia.com/feed",
      browser: {
        url: "https://news.google.com/rss/search?q=site:techinasia.com+when:7d&hl=en-US&gl=US&ceid=US:en"
      },
      notes: [
        "Asia - General"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          serverOrder: 3,
          browserOrder: 4
        }
      ]
    },
    {
      name: "TechCabal (Africa)",
      url: "https://techcabal.com/feed/",
      notes: [
        "Africa"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          serverOrder: 4,
          browserOrder: 29
        }
      ]
    },
    {
      name: "Inc42 (India)",
      url: "https://inc42.com/feed/",
      notes: [
        "India"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          serverOrder: 5,
          browserOrder: 16
        }
      ]
    },
    {
      name: "Unicorn News",
      url: "https://news.google.com/rss/search?q=(%22unicorn%20startup%22%20OR%20%22unicorn%20valuation%22%20OR%20%22%241%20billion%20valuation%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "unicorns",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Decacorn News",
      url: "https://news.google.com/rss/search?q=(%22decacorn%22%20OR%20%22%2410%20billion%20valuation%22)%20startup%20when%3A14d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("decacorn"+OR+"$10+billion+valuation"+OR+"$10B+valuation")+startup+when:14d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "tech",
          category: "unicorns",
          serverOrder: 1,
          browserOrder: 2
        }
      ]
    },
    {
      name: "YC News",
      url: "https://news.ycombinator.com/rss",
      placements: [
        {
          edition: "tech",
          category: "accelerators",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Demo Day News",
      url: "https://news.google.com/rss/search?q=(%22demo%20day%22%20OR%20%22YC%20batch%22%20OR%20%22accelerator%20batch%22)%20startup%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "accelerators",
          serverOrder: 1,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Krebs Security",
      url: "https://krebsonsecurity.com/feed/",
      placements: [
        {
          edition: "tech",
          category: "security",
          serverOrder: 0,
          browserOrder: 0
        },
        {
          edition: "intel",
          category: "intel",
          serverOrder: 13
        },
        {
          edition: "intel",
          category: "intel",
          browserOrder: 32,
          type: "cyber"
        }
      ]
    },
    {
      name: "Dark Reading",
      url: "https://www.darkreading.com/rss.xml",
      placements: [
        {
          edition: "tech",
          category: "security",
          serverOrder: 1,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Politico Tech",
      url: "https://rss.politico.com/technology.xml",
      notes: [
        "US Policy"
      ],
      placements: [
        {
          edition: "tech",
          category: "policy",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "AI Regulation",
      url: "https://news.google.com/rss/search?q=AI%20regulation%20OR%20%22artificial%20intelligence%22%20law%20OR%20policy%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "policy",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Tech Antitrust",
      url: "https://news.google.com/rss/search?q=tech%20antitrust%20OR%20FTC%20Google%20OR%20FTC%20Apple%20OR%20FTC%20Amazon%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "policy",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "GitHub Blog",
      url: "https://github.blog/feed/",
      placements: [
        {
          edition: "tech",
          category: "github",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "VC News",
      url: "https://news.google.com/rss/search?q=(%22Series%20A%22%20OR%20%22Series%20B%22%20OR%20%22Series%20C%22%20OR%20%22venture%20capital%22%20OR%20%22funding%20round%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("Series+A"+OR+"Series+B"+OR+"Series+C"+OR+"funding+round"+OR+"venture+capital")+when:7d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "tech",
          category: "funding",
          serverOrder: 0,
          browserOrder: 1
        }
      ]
    },
    {
      name: "InfoQ",
      url: "https://feed.infoq.com/",
      placements: [
        {
          edition: "tech",
          category: "cloud",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "The New Stack",
      url: "https://thenewstack.io/feed/",
      placements: [
        {
          edition: "tech",
          category: "cloud",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "CNBC Tech",
      url: "https://www.cnbc.com/id/19854910/device/rss/rss.html",
      placements: [
        {
          edition: "tech",
          category: "finance",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Dev.to",
      url: "https://dev.to/feed",
      placements: [
        {
          edition: "tech",
          category: "dev",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Lobsters",
      url: "https://lobste.rs/rss",
      placements: [
        {
          edition: "tech",
          category: "dev",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Changelog",
      url: "https://changelog.com/feed",
      placements: [
        {
          edition: "tech",
          category: "dev",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Show HN",
      url: "https://hnrss.org/show",
      placements: [
        {
          edition: "tech",
          category: "dev",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "IPO News",
      url: "https://news.google.com/rss/search?q=(IPO%20OR%20%22initial%20public%20offering%22%20OR%20SPAC)%20tech%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "ipo",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "IPO News",
      url: "https://news.google.com/rss/search?q=(IPO%20OR%20%22initial%20public%20offering%22%20OR%20%22stock%20market%20debut%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=(IPO+OR+"initial+public+offering"+OR+SPAC+OR+"direct+listing")+when:3d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "ipo",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Tech IPO News",
      url: "https://news.google.com/rss/search?q=tech%20IPO%20OR%20%22tech%20company%22%20IPO%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "ipo",
          serverOrder: 1,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Product Hunt",
      url: "https://www.producthunt.com/feed",
      placements: [
        {
          edition: "tech",
          category: "producthunt",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Tom's Hardware",
      url: "https://www.tomshardware.com/feeds.xml",
      placements: [
        {
          edition: "tech",
          category: "hardware",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "SemiAnalysis",
      url: "https://www.semianalysis.com/feed",
      browser: {
        url: "https://news.google.com/rss/search?q=site:semianalysis.com+when:7d&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "tech",
          category: "hardware",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Semiconductor News",
      url: "https://news.google.com/rss/search?q=semiconductor%20OR%20chip%20OR%20TSMC%20OR%20NVIDIA%20OR%20Intel%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "hardware",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "AWS Status",
      url: "https://news.google.com/rss/search?q=AWS%20outage%20OR%20%22Amazon%20Web%20Services%22%20down%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "outages",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Cloud Outages",
      url: "https://news.google.com/rss/search?q=(Azure%20outage%20OR%20%22Google%20Cloud%22%20outage%20OR%20Cloudflare%20outage%20OR%20Slack%20down%20OR%20GitHub%20down)%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=(Azure+OR+GCP+OR+Cloudflare+OR+Slack+OR+GitHub)+outage+OR+down+when:1d&hl=en-US&gl=US&ceid=US:en"
      },
      placements: [
        {
          edition: "tech",
          category: "outages",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Seeking Alpha",
      url: "https://seekingalpha.com/market_currents.xml",
      placements: [
        {
          edition: "finance",
          category: "markets",
          serverOrder: 2,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Forex News",
      url: "https://news.google.com/rss/search?q=(forex%20OR%20currency%20OR%20%22exchange%20rate%22%20OR%20FX%20OR%20%22US%20dollar%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("forex"+OR+"currency"+OR+"FX+market")+trading+when:1d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "forex",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Bond Market",
      url: "https://news.google.com/rss/search?q=(%22bond%20market%22%20OR%20%22treasury%20yield%22%20OR%20%22bond%20yield%22%20OR%20%22fixed%20income%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("bond+market"+OR+"treasury+yields"+OR+"bond+yields"+OR+"fixed+income")+when:2d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "bonds",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "CoinDesk",
      url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Cointelegraph",
      url: "https://cointelegraph.com/rss",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "The Block",
      url: "https://news.google.com/rss/search?q=site:theblock.co+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Decrypt",
      url: "https://decrypt.co/feed",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 3,
          browserOrder: 5
        }
      ]
    },
    {
      name: "The Defiant",
      url: "https://thedefiant.io/feed",
      notes: [
        "Blockworks REMOVED in parity with src/config/feeds.ts (PR #3715 review). blockworks.co/feed is Cloudflare-blocked from both Vercel edge AND Railway egress, AND Google News returns 0 items for site:blockworks.co. The Block (above) covers the same institutional-crypto territory; no coverage lost.",
        "Blockworks REMOVED (PR #3715 review): blockworks.co/feed is Cloudflare-blocked from both Vercel edge AND Railway egress, AND Google News returns 0 items for site:blockworks.co at every probed time window (publisher likely blocks Googlebot on the same wholesale tier \u2014 so the Google News fallback we tried first is a silent placeholder). The Block (above) covers the same institutional-crypto territory; no coverage lost. Also removed from the server feeds (_feeds.ts) for parity."
      ],
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 8,
          browserOrder: 6
        }
      ]
    },
    {
      name: "Bitcoin Magazine",
      url: "https://bitcoinmagazine.com/feed",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 9,
          browserOrder: 7
        }
      ]
    },
    {
      name: "DL News",
      url: "https://news.google.com/rss/search?q=site:dlnews.com+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 10,
          browserOrder: 8
        }
      ]
    },
    {
      name: "CryptoSlate",
      url: "https://cryptoslate.com/feed/",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 11,
          browserOrder: 9
        }
      ]
    },
    {
      name: "Unchained",
      url: "https://unchainedcrypto.com/feed/",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 12,
          browserOrder: 10
        }
      ]
    },
    {
      name: "DeFi News",
      url: 'https://news.google.com/rss/search?q=(DeFi+OR+"decentralized+finance")+when:3d&hl=en-US&gl=US&ceid=US:en',
      browser: {
        url: 'https://news.google.com/rss/search?q=(DeFi+OR+"decentralized+finance"+OR+DEX+OR+"yield+farming")+when:3d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 13,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Bloomberg Crypto",
      url: "https://news.google.com/rss/search?q=bloomberg+crypto+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 14,
          browserOrder: 13
        }
      ]
    },
    {
      name: "Reuters Crypto",
      url: "https://news.google.com/rss/search?q=reuters+crypto+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 15,
          browserOrder: 18
        }
      ]
    },
    {
      name: "Wu Blockchain",
      url: "https://news.google.com/rss/search?q=site:wublockchain.com+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 16,
          browserOrder: 11
        }
      ]
    },
    {
      name: "Messari",
      url: "https://news.google.com/rss/search?q=site:messari.io+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 17,
          browserOrder: 12
        }
      ]
    },
    {
      name: "NFT News",
      url: 'https://news.google.com/rss/search?q=(NFT+OR+"non-fungible")+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 18,
          browserOrder: 19
        }
      ]
    },
    {
      name: "Stablecoin Policy",
      url: 'https://news.google.com/rss/search?q=(stablecoin+regulation+OR+"stablecoin+bill")+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "crypto",
          serverOrder: 19,
          browserOrder: 20
        }
      ]
    },
    {
      name: "PBoC Watch",
      url: "https://news.google.com/rss/search?q=(%22People's%20Bank%20of%20China%22%20OR%20PBoC%20OR%20PBOC)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "centralbanks",
          serverOrder: 1,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Economic Data",
      url: "https://news.google.com/rss/search?q=(CPI%20OR%20inflation%20OR%20GDP%20OR%20%22economic%20data%22%20OR%20%22jobs%20report%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=(CPI+OR+inflation+OR+GDP+OR+"jobs+report"+OR+"nonfarm+payrolls"+OR+PMI)+when:2d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "economic",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Options Market",
      url: "https://news.google.com/rss/search?q=(%22options%20market%22%20OR%20%22options%20trading%22%20OR%20%22put%20call%20ratio%22%20OR%20VIX)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "derivatives",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Futures Trading",
      url: "https://news.google.com/rss/search?q=(%22futures%20trading%22%20OR%20%22S%26P%20500%20futures%22%20OR%20%22Nasdaq%20futures%22)%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "derivatives",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Fintech News",
      url: "https://news.google.com/rss/search?q=(fintech%20OR%20%22payment%20technology%22%20OR%20neobank%20OR%20%22digital%20banking%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=(fintech+OR+"payment+technology"+OR+"neobank"+OR+"digital+banking")+when:3d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "fintech",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Trading Tech",
      url: "https://news.google.com/rss/search?q=(%22algorithmic%20trading%22%20OR%20%22trading%20platform%22%20OR%20%22quantitative%20finance%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "fintech",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Blockchain Finance",
      url: "https://news.google.com/rss/search?q=(%22blockchain%20finance%22%20OR%20tokenization%20OR%20%22digital%20securities%22%20OR%20CBDC)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("blockchain+finance"+OR+"tokenization"+OR+"digital+securities"+OR+CBDC)+when:7d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "fintech",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Financial Regulation",
      url: "https://news.google.com/rss/search?q=(SEC%20OR%20CFTC%20OR%20FINRA%20OR%20FCA)%20regulation%20OR%20enforcement%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "fin-regulation",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Banking Rules",
      url: "https://news.google.com/rss/search?q=(Basel%20OR%20%22capital%20requirements%22%20OR%20%22banking%20regulation%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "fin-regulation",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Crypto Regulation",
      url: "https://news.google.com/rss/search?q=(crypto%20regulation%20OR%20%22digital%20asset%22%20regulation%20OR%20stablecoin%20regulation)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=(crypto+regulation+OR+"digital+asset"+regulation+OR+"stablecoin"+regulation)+when:7d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "fin-regulation",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Hedge Fund News",
      url: "https://news.google.com/rss/search?q=(%22hedge%20fund%22%20OR%20Bridgewater%20OR%20Citadel%20OR%20Renaissance)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("hedge+fund"+OR+"Bridgewater"+OR+"Citadel"+OR+"Renaissance")+when:7d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "institutional",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Private Equity",
      url: "https://news.google.com/rss/search?q=(%22private%20equity%22%20OR%20Blackstone%20OR%20KKR%20OR%20Apollo%20OR%20Carlyle)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "institutional",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Sovereign Wealth",
      url: "https://news.google.com/rss/search?q=(%22sovereign%20wealth%20fund%22%20OR%20%22pension%20fund%22%20OR%20%22institutional%20investor%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "institutional",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Market Outlook",
      url: "https://news.google.com/rss/search?q=(%22market%20outlook%22%20OR%20%22stock%20market%20forecast%22%20OR%20%22bull%20market%22%20OR%20%22bear%20market%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "analysis",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Risk & Volatility",
      url: "https://news.google.com/rss/search?q=(VIX%20OR%20%22market%20volatility%22%20OR%20%22risk%20off%22%20OR%20%22market%20correction%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "analysis",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Bank Research",
      url: "https://news.google.com/rss/search?q=(%22Goldman%20Sachs%22%20OR%20JPMorgan%20OR%20%22Morgan%20Stanley%22)%20forecast%20OR%20outlook%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("Goldman+Sachs"+OR+"JPMorgan"+OR+"Morgan+Stanley")+forecast+OR+outlook+when:3d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "analysis",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Arabian Business",
      url: "https://news.google.com/rss/search?q=site%3Aarabianbusiness.com%20(Saudi%20Arabia%20OR%20UAE%20OR%20GCC)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "gccNews",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Gulf FDI",
      url: "https://news.google.com/rss/search?q=(PIF%20OR%20%22DP%20World%22%20OR%20Mubadala%20OR%20ADNOC%20OR%20Masdar%20OR%20%22ACWA%20Power%22)%20infrastructure%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "gccNews",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Gulf Investments",
      url: "https://news.google.com/rss/search?q=(%22Saudi%20Arabia%22%20OR%20UAE%20OR%20%22Abu%20Dhabi%22)%20investment%20infrastructure%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("Saudi+Arabia"+OR+"UAE"+OR+"Abu+Dhabi")+investment+infrastructure+when:7d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "finance",
          category: "gccNews",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Vision 2030",
      url: "https://news.google.com/rss/search?q=%22Vision%202030%22%20(project%20OR%20investment%20OR%20announced)%20when%3A14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "gccNews",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Kitco News",
      url: "https://news.google.com/rss/search?q=site%3Akitco.com%20gold%20OR%20silver%20OR%20commodity%20OR%20metals%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:kitco.com+(gold+OR+silver+OR+metals)+when:1d&hl=en-US&gl=US&ceid=US:en"
      },
      notes: [
        "Kitco shut down their public RSS feeds in 2025 (every /rss/*, /news/feed, /news/category/*/feed path now returns an HTML SPA page, not XML). Fall back to Google News scoped to site:kitco.com, matching the pattern used by TASS / Kyiv Independent / Telegraaf elsewhere in this file."
      ],
      placements: [
        {
          edition: "commodity",
          category: "commodity-news",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Mining.com",
      url: "https://www.mining.com/feed/",
      placements: [
        {
          edition: "commodity",
          category: "commodity-news",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Bloomberg Commodities",
      url: "https://news.google.com/rss/search?q=site%3Abloomberg.com%20commodities%20OR%20metals%20OR%20mining%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "commodity-news",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Reuters Commodities",
      url: "https://news.google.com/rss/search?q=site%3Areuters.com%20commodities%20OR%20metals%20OR%20mining%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "commodity-news",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "S&P Global Commodity",
      url: "https://news.google.com/rss/search?q=site%3Aspglobal.com%20commodities%20metals%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "commodity-news",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "CNBC Commodities",
      url: "https://news.google.com/rss/search?q=site%3Acnbc.com%20(commodities%20OR%20metals%20OR%20gold%20OR%20copper)%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Commodity Trade Mantra REMOVED in parity with src/config/feeds.ts (PR #3715 review follow-up #3717). Server emits ~10 items per refresh but the client filters digest items against the client feed-name set (src/app/data-loader.ts:908-914), so these are invisible to users. Worse, the server truncates to MAX_ITEMS_PER_CATEGORY (list-feed- digest.ts:1076-1082) BEFORE the client filter \u2014 so invisible CTM items crowd out visible commodity-news items, leaving the panel with fewer results. The other 6 commodity-news feeds (Kitco / Mining.com / Bloomberg / Reuters / S&P / CNBC) cover the same territory.",
        "Commodity Trade Mantra REMOVED (PR #3715 review): commoditytrademantra.com wholesale-403s any direct fetch AND Google News returns 0 items for site:commoditytrademantra.com at every probed time window (publisher effectively not indexed by Google News). commodity-news still has Mining.com / Bloomberg / Reuters / S&P Global / CNBC \u2014 coverage isn't lost."
      ],
      placements: [
        {
          edition: "commodity",
          category: "commodity-news",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Kitco Gold",
      url: "https://news.google.com/rss/search?q=site%3Akitco.com%20gold%20price%20OR%20%22gold%20market%22%20OR%20%22silver%20price%22%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:kitco.com+gold+when:1d&hl=en-US&gl=US&ceid=US:en"
      },
      notes: [
        "Kitco RSS shutdown (see Kitco News comment in commodity-news above). Gold-scoped Google News query targeting site:kitco.com."
      ],
      placements: [
        {
          edition: "commodity",
          category: "gold-silver",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Gold Price News",
      url: "https://news.google.com/rss/search?q=(gold%20price%20OR%20%22gold%20market%22%20OR%20bullion%20OR%20LBMA)%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "gold-silver",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Silver Price News",
      url: "https://news.google.com/rss/search?q=(silver%20price%20OR%20%22silver%20market%22%20OR%20%22silver%20futures%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "gold-silver",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Precious Metals",
      url: "https://news.google.com/rss/search?q=(%22precious%20metals%22%20OR%20platinum%20OR%20palladium%20OR%20%22gold%20ETF%22%20OR%20GLD%20OR%20SLV)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "gold-silver",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "World Gold Council",
      url: "https://news.google.com/rss/search?q=%22World%20Gold%20Council%22%20OR%20%22central%20bank%20gold%22%20OR%20%22gold%20reserves%22%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "gold-silver",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "OilPrice.com",
      url: "https://oilprice.com/rss/main",
      placements: [
        {
          edition: "commodity",
          category: "energy",
          serverOrder: 0,
          browserOrder: 0
        },
        {
          edition: "energy",
          category: "live-news",
          browserOrder: 0,
          serverOrder: 0
        },
        {
          edition: "energy",
          category: "energy",
          browserOrder: 0,
          serverOrder: 0
        }
      ]
    },
    {
      name: "Rigzone",
      url: "https://www.rigzone.com/news/rss/rigzone_latest.aspx",
      placements: [
        {
          edition: "commodity",
          category: "energy",
          serverOrder: 1,
          browserOrder: 1
        },
        {
          edition: "energy",
          category: "live-news",
          browserOrder: 1,
          serverOrder: 1
        },
        {
          edition: "energy",
          category: "energy",
          browserOrder: 1,
          serverOrder: 1
        }
      ]
    },
    {
      name: "EIA Reports",
      url: "https://news.google.com/rss/search?q=site%3Aeia.gov%20energy%20oil%20gas%20when%3A14d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://www.eia.gov/rss/press_room.xml"
      },
      placements: [
        {
          edition: "commodity",
          category: "energy",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "OPEC News",
      url: "https://news.google.com/rss/search?q=(OPEC%20OR%20%22oil%20price%22%20OR%20%22crude%20oil%22%20OR%20WTI%20OR%20Brent%20OR%20%22oil%20production%22)%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "energy",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Natural Gas News",
      url: "https://news.google.com/rss/search?q=(%22natural%20gas%22%20OR%20LNG%20OR%20%22gas%20price%22%20OR%20%22Henry%20Hub%22)%20when%3A1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "energy",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Energy Intel",
      url: "https://news.google.com/rss/search?q=(energy%20commodities%20OR%20%22energy%20market%22%20OR%20%22energy%20prices%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "energy",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Energy Intel",
      url: 'https://news.google.com/rss/search?q=(energy+commodities+OR+"energy+market"+OR+"energy+prices"+OR+"energy+security")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "energy",
          browserOrder: 8,
          serverOrder: 8
        }
      ]
    },
    {
      name: "Mining Journal",
      url: "https://news.google.com/rss/search?q=site%3Amining-journal.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:mining-journal.com+when:2d&hl=en-US&gl=US&ceid=US:en"
      },
      notes: [
        'mining-journal.com migrated to Kreatio CMS; /feed/ now returns text/html (the homepage SPA), not RSS \u2014 produces "Parse error for Mining Journal" in the client. Google News fallback.'
      ],
      placements: [
        {
          edition: "commodity",
          category: "mining-news",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Northern Miner",
      url: "https://news.google.com/rss/search?q=site%3Anorthernminer.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://www.northernminer.com/feed/"
      },
      placements: [
        {
          edition: "commodity",
          category: "mining-news",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Mining Weekly",
      url: "https://news.google.com/rss/search?q=site%3Aminingweekly.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: "https://news.google.com/rss/search?q=site:miningweekly.com+when:2d&hl=en-US&gl=US&ceid=US:en"
      },
      notes: [
        "www.miningweekly.com domain-wide 403s every IP-based fetch (homepage included), not just Vercel edge \u2014 Railway relay likely wouldn't help. Google News scoped to site:miningweekly.com is the reliable path and matches the pattern used for other wholesale-blocked publishers."
      ],
      placements: [
        {
          edition: "commodity",
          category: "mining-news",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Mining Technology",
      url: "https://www.mining-technology.com/feed/",
      placements: [
        {
          edition: "commodity",
          category: "mining-news",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Australian Mining",
      url: "https://www.australianmining.com.au/feed/",
      placements: [
        {
          edition: "commodity",
          category: "mining-news",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Mine Web (SNL)",
      url: "https://news.google.com/rss/search?q=(%22mining%20company%22%20OR%20%22mine%20production%22%20OR%20%22mining%20operations%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "mining-news",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Resource World",
      url: "https://news.google.com/rss/search?q=(%22mining%20project%22%20OR%20%22mineral%20exploration%22%20OR%20%22mine%20development%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "mining-news",
          serverOrder: 6,
          browserOrder: 6
        }
      ]
    },
    {
      name: "Benchmark Mineral",
      url: "https://news.google.com/rss/search?q=(%22critical%20minerals%22%20OR%20%22battery%20metals%22%20OR%20lithium%20OR%20cobalt%20OR%20%22rare%20earths%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "critical-minerals",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Lithium Market",
      url: "https://news.google.com/rss/search?q=(lithium%20price%20OR%20%22lithium%20market%22%20OR%20%22lithium%20supply%22%20OR%20spodumene%20OR%20LCE)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "critical-minerals",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Cobalt Market",
      url: "https://news.google.com/rss/search?q=(cobalt%20price%20OR%20%22cobalt%20market%22%20OR%20%22DRC%20cobalt%22%20OR%20%22battery%20cobalt%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "critical-minerals",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Rare Earths News",
      url: "https://news.google.com/rss/search?q=(%22rare%20earth%22%20OR%20%22rare%20earths%22%20OR%20REE%20OR%20neodymium%20OR%20praseodymium)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("rare+earth"+OR+"rare+earths"+OR+"REE"+OR+neodymium+OR+praseodymium)+when:3d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "commodity",
          category: "critical-minerals",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "EV Battery Supply",
      url: "https://news.google.com/rss/search?q=(%22EV%20battery%22%20OR%20%22battery%20supply%20chain%22%20OR%20%22battery%20materials%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "critical-minerals",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "IEA Critical Minerals",
      url: "https://news.google.com/rss/search?q=site%3Aiea.org%20(minerals%20OR%20critical%20OR%20battery)%20when%3A14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "critical-minerals",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Uranium Market",
      url: "https://news.google.com/rss/search?q=(uranium%20price%20OR%20%22uranium%20market%22%20OR%20U3O8%20OR%20nuclear%20fuel)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "critical-minerals",
          serverOrder: 6,
          browserOrder: 6
        }
      ]
    },
    {
      name: "LME Metals",
      url: "https://news.google.com/rss/search?q=(LME%20OR%20%22London%20Metal%20Exchange%22)%20copper%20OR%20aluminum%20OR%20zinc%20OR%20nickel%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "base-metals",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Copper Market",
      url: "https://news.google.com/rss/search?q=(copper%20price%20OR%20%22copper%20market%22%20OR%20%22copper%20supply%22%20OR%20COMEX%20copper)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "base-metals",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Nickel News",
      url: "https://news.google.com/rss/search?q=(nickel%20price%20OR%20%22nickel%20market%22%20OR%20%22nickel%20supply%22%20OR%20Indonesia%20nickel)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "base-metals",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Aluminum & Zinc",
      url: "https://news.google.com/rss/search?q=(aluminum%20price%20OR%20aluminium%20OR%20zinc%20price%20OR%20%22base%20metals%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "base-metals",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Iron Ore Market",
      url: "https://news.google.com/rss/search?q=(%22iron%20ore%22%20price%20OR%20%22iron%20ore%20market%22%20OR%20%22steel%20raw%20materials%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "base-metals",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Metals Bulletin",
      url: "https://news.google.com/rss/search?q=(%22metals%20market%22%20OR%20%22base%20metals%22%20OR%20SHFE%20OR%20%22Shanghai%20Futures%22)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "base-metals",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "BHP News",
      url: "https://news.google.com/rss/search?q=BHP%20(mining%20OR%20production%20OR%20results%20OR%20copper%20OR%20%22iron%20ore%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "mining-companies",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Rio Tinto News",
      url: "https://news.google.com/rss/search?q=%22Rio%20Tinto%22%20(mining%20OR%20production%20OR%20results%20OR%20Pilbara)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "mining-companies",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Glencore & Vale",
      url: "https://news.google.com/rss/search?q=(Glencore%20OR%20Vale)%20(mining%20OR%20production%20OR%20cobalt%20OR%20%22iron%20ore%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "mining-companies",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Gold Majors",
      url: "https://news.google.com/rss/search?q=(Newmont%20OR%20Barrick%20OR%20AngloGold%20OR%20Agnico)%20(gold%20mine%20OR%20production%20OR%20results)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "mining-companies",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Freeport & Copper Miners",
      url: "https://news.google.com/rss/search?q=(Freeport%20McMoRan%20OR%20Southern%20Copper%20OR%20Teck%20OR%20Antofagasta)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "mining-companies",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Critical Mineral Companies",
      url: "https://news.google.com/rss/search?q=(Albemarle%20OR%20SQM%20OR%20%22MP%20Materials%22%20OR%20Lynas%20OR%20Cameco)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "mining-companies",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Shipping & Freight",
      url: "https://news.google.com/rss/search?q=(%22bulk%20carrier%22%20OR%20%22dry%20bulk%22%20OR%20%22commodity%20shipping%22%20OR%20%22Port%20Hedland%22%20OR%20%22Strait%20of%20Hormuz%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "supply-chain",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Trade Routes",
      url: "https://news.google.com/rss/search?q=(%22trade%20route%22%20OR%20%22supply%20chain%22%20OR%20%22commodity%20export%22%20OR%20%22mineral%20export%22)%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "supply-chain",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "China Commodity Imports",
      url: "https://news.google.com/rss/search?q=China%20imports%20copper%20OR%20%22iron%20ore%22%20OR%20lithium%20OR%20cobalt%20OR%20%22rare%20earth%22%20when%3A3d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=(China+imports+copper+OR+iron+ore+OR+lithium+OR+cobalt+OR+"rare+earth")+when:3d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "commodity",
          category: "supply-chain",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Port & Logistics",
      url: "https://news.google.com/rss/search?q=(%22iron%20ore%20port%22%20OR%20%22copper%20port%22%20OR%20%22commodity%20port%22%20OR%20%22mineral%20logistics%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "supply-chain",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Mining Regulation",
      url: "https://news.google.com/rss/search?q=(%22mining%20regulation%22%20OR%20%22mining%20policy%22%20OR%20%22mining%20permit%22%20OR%20%22mining%20ban%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "commodity-regulation",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "ESG in Mining",
      url: "https://news.google.com/rss/search?q=(%22mining%20ESG%22%20OR%20%22responsible%20mining%22%20OR%20%22mine%20closure%22%20OR%20tailings)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=("mining+ESG"+OR+"responsible+mining"+OR+"mine+closure"+OR+"tailings")+when:7d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "commodity",
          category: "commodity-regulation",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Trade & Tariffs",
      url: "https://news.google.com/rss/search?q=(%22mineral%20tariff%22%20OR%20%22metals%20tariff%22%20OR%20%22critical%20mineral%20policy%22%20OR%20%22mining%20export%20ban%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "commodity-regulation",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Trade & Tariffs",
      url: 'https://news.google.com/rss/search?q=(tariff+OR+"trade+war"+OR+"trade+deficit"+OR+sanctions)+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "economic",
          browserOrder: 1,
          serverOrder: 1
        }
      ]
    },
    {
      name: "Indonesia Nickel Policy",
      url: "https://news.google.com/rss/search?q=(Indonesia%20nickel%20OR%20%22nickel%20export%22%20OR%20%22nickel%20ban%22%20OR%20%22nickel%20processing%22)%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "commodity-regulation",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "China Mineral Policy",
      url: "https://news.google.com/rss/search?q=China%20%22rare%20earth%22%20OR%20%22mineral%20export%22%20OR%20%22critical%20mineral%22%20policy%20OR%20restriction%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      browser: {
        url: 'https://news.google.com/rss/search?q=(China+"rare+earth"+OR+"mineral+export"+OR+"critical+mineral")+policy+OR+restriction+when:7d&hl=en-US&gl=US&ceid=US:en'
      },
      placements: [
        {
          edition: "commodity",
          category: "commodity-regulation",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Yahoo Finance Commodities",
      url: "https://finance.yahoo.com/rss/topstories",
      placements: [
        {
          edition: "commodity",
          category: "markets",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "CNBC Markets",
      url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
      placements: [
        {
          edition: "commodity",
          category: "markets",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Seeking Alpha Metals",
      url: "https://news.google.com/rss/search?q=site%3Aseekingalpha.com%20(gold%20OR%20silver%20OR%20copper%20OR%20mining)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "markets",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Commodity Futures",
      url: "https://news.google.com/rss/search?q=(COMEX%20OR%20NYMEX%20OR%20%22commodity%20futures%22%20OR%20CME%20commodities)%20when%3A2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "commodity",
          category: "markets",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Good News Network",
      url: "https://www.goodnewsnetwork.org/feed/",
      placements: [
        {
          edition: "happy",
          category: "positive",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Positive.News",
      url: "https://www.positive.news/feed/",
      placements: [
        {
          edition: "happy",
          category: "positive",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Reasons to be Cheerful",
      url: "https://reasonstobecheerful.world/feed/",
      placements: [
        {
          edition: "happy",
          category: "positive",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Optimist Daily",
      url: "https://www.optimistdaily.com/feed/",
      placements: [
        {
          edition: "happy",
          category: "positive",
          serverOrder: 3,
          browserOrder: 3
        }
      ]
    },
    {
      name: "Singularity Hub",
      url: "https://singularityhub.com/feed/",
      placements: [
        {
          edition: "happy",
          category: "science",
          serverOrder: 2,
          browserOrder: 5
        }
      ]
    },
    {
      name: "Human Progress",
      url: "https://humanprogress.org/feed/",
      placements: [
        {
          edition: "happy",
          category: "science",
          serverOrder: 3,
          browserOrder: 6
        }
      ]
    },
    {
      name: "Mongabay",
      url: "https://news.mongabay.com/feed/",
      placements: [
        {
          edition: "happy",
          category: "nature",
          serverOrder: 0,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Conservation Optimism",
      url: "https://conservationoptimism.org/feed/",
      placements: [
        {
          edition: "happy",
          category: "nature",
          serverOrder: 1,
          browserOrder: 3
        }
      ]
    },
    {
      name: "GNN Heroes",
      url: "https://www.goodnewsnetwork.org/category/news/inspiring/feed/",
      placements: [
        {
          edition: "happy",
          category: "inspiring",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "GNN Health",
      url: "https://www.goodnewsnetwork.org/category/news/health/feed/",
      placements: [
        {
          edition: "happy",
          category: "inspiring",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Yes! Magazine",
      url: "https://www.yesmagazine.org/feed",
      placements: [
        {
          edition: "happy",
          category: "community",
          serverOrder: 0,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Shareable",
      url: "https://www.shareable.net/feed/",
      placements: [
        {
          edition: "happy",
          category: "community",
          serverOrder: 1,
          browserOrder: 0
        }
      ]
    },
    {
      name: "Defense One",
      url: "https://www.defenseone.com/rss/all/",
      type: "defense",
      notes: [
        "Defense & Security (Tier 1)"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 0,
          browserOrder: 0
        }
      ]
    },
    {
      name: "The War Zone",
      url: "https://www.twz.com/feed",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 1,
          browserOrder: 1
        }
      ]
    },
    {
      name: "Defense News",
      url: "https://www.defensenews.com/arc/outboundfeeds/rss/?outputType=xml",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 2,
          browserOrder: 2
        }
      ]
    },
    {
      name: "Breaking Defense",
      url: "https://breakingdefense.com/feed/",
      type: "defense",
      notes: [
        "Declared LAST in the defense group on purpose. The free-tier source cap (selectSourcesUnderCap, FREE_MAX_SOURCES) fills category buckets round-robin in DECLARATION ORDER, and the intel bucket only gets a handful of slots \u2014 so inserting a new name near the top silently evicts whichever default-enabled source it pushes past the cap. That eviction is written back into worldmonitor-disabled-feeds and cloud-synced rather than recomputed, so it never recovers. Appending makes a new source absorb its own cap cost instead of deleting an existing one from every free-tier user (#5405 review)."
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 3,
          browserOrder: 9
        }
      ]
    },
    {
      name: "Military Times",
      url: "https://www.militarytimes.com/arc/outboundfeeds/rss/?outputType=xml",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 4,
          browserOrder: 4
        }
      ]
    },
    {
      name: "Task & Purpose",
      url: "https://taskandpurpose.com/feed/",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 5,
          browserOrder: 5
        }
      ]
    },
    {
      name: "USNI News",
      url: "https://news.google.com/rss/search?q=site:news.usni.org+when:3d&hl=en-US&gl=US&ceid=US:en",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 6,
          browserOrder: 6
        }
      ]
    },
    {
      name: "gCaptain",
      url: "https://gcaptain.com/feed/",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 7,
          browserOrder: 7
        }
      ]
    },
    {
      name: "Oryx OSINT",
      url: "https://www.oryxspioenkop.com/feeds/posts/default?alt=rss",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 8,
          browserOrder: 8
        }
      ]
    },
    {
      name: "Bellingcat",
      url: "https://news.google.com/rss/search?q=site%3Abellingcat.com%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      type: "osint",
      browser: {
        url: "https://news.google.com/rss/search?q=site:bellingcat.com+when:30d&hl=en-US&gl=US&ceid=US:en"
      },
      notes: [
        "OSINT & Monitoring (Tier 2)"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 12,
          browserOrder: 31
        }
      ]
    },
    {
      name: "Arms Control Assn",
      url: "https://news.google.com/rss/search?q=site%3Aarmscontrol.org%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      type: "nuclear",
      notes: [
        "Nuclear & Arms Control (Tier 2)"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 14,
          browserOrder: 29
        }
      ]
    },
    {
      name: "Bulletin of Atomic Scientists",
      url: "https://news.google.com/rss/search?q=site%3Athebulletin.org%20when%3A7d&hl=en-US&gl=US&ceid=US:en",
      type: "nuclear",
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 15,
          browserOrder: 30
        }
      ]
    },
    {
      name: "FAO News",
      url: "https://www.fao.org/feeds/fao-newsroom-rss",
      type: "economic",
      notes: [
        "Economic & Food Security (Tier 2)"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 16,
          browserOrder: 34
        }
      ]
    },
    {
      name: "OCCRP",
      url: "https://www.occrp.org/en/feed",
      type: "investigative",
      notes: [
        "Investigative Journalism & Accountability Cross-border corruption & organized crime investigations (Panama Papers, Pandora Papers)"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 17,
          browserOrder: 36
        }
      ]
    },
    {
      name: "DFRLab",
      url: "https://dfrlab.org/feed/",
      type: "investigative",
      notes: [
        "Atlantic Council Digital Forensic Research Lab \u2014 disinformation/influence operations"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 18,
          browserOrder: 37
        }
      ]
    },
    {
      name: "Lighthouse Reports",
      url: "https://www.lighthousereports.com/feed/",
      type: "investigative",
      notes: [
        "European investigative collective \u2014 migration, extremism, accountability"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 19,
          browserOrder: 38
        }
      ]
    },
    {
      name: "The Sentry",
      url: "https://thesentry.org/feed/",
      type: "investigative",
      notes: [
        "Africa-focused: war crimes, illicit finance, sanctions evasion"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 20,
          browserOrder: 39
        }
      ]
    },
    {
      name: "GITOC",
      url: "https://globalinitiative.net/feed/",
      type: "investigative",
      notes: [
        "Global Initiative Against Transnational Organized Crime"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 21,
          browserOrder: 40
        }
      ]
    },
    {
      name: "VSquare",
      url: "https://vsquare.org/feed/",
      type: "investigative",
      notes: [
        "V4/CEE investigative network (OCCRP member)"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 22,
          browserOrder: 41
        }
      ]
    },
    {
      name: "Correctiv",
      url: "https://correctiv.org/feed/",
      type: "investigative",
      notes: [
        "German investigative journalism & fact-checking nonprofit"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          serverOrder: 23,
          browserOrder: 42
        }
      ]
    },
    {
      name: "El Pa\xEDs",
      url: "https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/portada",
      lang: "es",
      notes: [
        "Spanish (ES)"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 6,
          serverOrder: 94
        }
      ]
    },
    {
      name: "El Mundo",
      url: "https://e00-elmundo.uecdn.es/elmundo/rss/portada.xml",
      lang: "es",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 7,
          serverOrder: 93
        }
      ]
    },
    {
      name: "BBC Mundo",
      url: "https://www.bbc.com/mundo/index.xml",
      lang: "es",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 8,
          serverOrder: 83
        }
      ]
    },
    {
      name: "Bild",
      url: "https://www.bild.de/feed/alles.xml",
      lang: "de",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 10,
          serverOrder: 86
        }
      ]
    },
    {
      name: "Der Spiegel",
      url: "https://www.spiegel.de/schlagzeilen/tops/index.rss",
      lang: "de",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 11,
          serverOrder: 91
        }
      ]
    },
    {
      name: "Die Zeit",
      url: "https://newsfeed.zeit.de/index",
      lang: "de",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 12,
          serverOrder: 92
        }
      ]
    },
    {
      name: "Corriere della Sera",
      url: "https://news.google.com/rss/search?q=site:corriere.it+when:1d&hl=it&gl=IT&ceid=IT:it",
      lang: "it",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 16,
          serverOrder: 87
        }
      ]
    },
    {
      name: "Repubblica",
      url: "https://www.repubblica.it/rss/homepage/rss2.0.xml",
      lang: "it",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 17,
          serverOrder: 99
        }
      ]
    },
    {
      name: "NRC",
      url: "https://www.nrc.nl/rss/",
      lang: "nl",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 19,
          serverOrder: 95
        }
      ]
    },
    {
      name: "De Telegraaf",
      url: "https://news.google.com/rss/search?q=site:telegraaf.nl+when:1d&hl=nl&gl=NL&ceid=NL:nl",
      lang: "nl",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 20,
          serverOrder: 90
        }
      ]
    },
    {
      name: "Dagens Nyheter",
      url: "https://www.dn.se/rss/",
      lang: "sv",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 22,
          serverOrder: 89
        }
      ]
    },
    {
      name: "Svenska Dagbladet",
      url: "https://www.svd.se/feed/articles.rss",
      lang: "sv",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 23,
          serverOrder: 100
        }
      ]
    },
    {
      name: "BBC Turkce",
      url: "https://feeds.bbci.co.uk/turkce/rss.xml",
      lang: "tr",
      notes: [
        "Turkish (TR)"
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 29,
          serverOrder: 85
        }
      ]
    },
    {
      name: "DW Turkish",
      url: "https://rss.dw.com/xml/rss-tur-all",
      lang: "tr",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 30,
          serverOrder: 88
        }
      ]
    },
    {
      name: "BBC Russian",
      url: "https://feeds.bbci.co.uk/russian/rss.xml",
      lang: "ru",
      notes: [
        "Russia & Ukraine \u2014 EN default balance rule (#5950): For DEFAULT_ENABLED_SOURCES.europe (EN full-variant path), keep at least: \u22651 dedicated UA primary (today: Kyiv Independent) \u22651 independent RU (today: Meduza and/or Moscow Times) Never default-enable TASS / RT / RT Russia (state propaganda; catalog opt-in only). Default EN path must not be \u201CWestern wires + RU state media only.\u201D Independent / exile / UA outlets below are eligible for defaults; state media is not."
      ],
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 72,
          serverOrder: 84
        }
      ]
    },
    {
      name: "Novaya Gazeta Europe",
      url: "https://novayagazeta.eu/feed/rss",
      lang: "ru",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 75,
          serverOrder: 96
        }
      ]
    },
    {
      name: "TASS",
      url: "https://news.google.com/rss/search?q=site:tass.com+OR+TASS+Russia+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 76,
          serverOrder: 101
        }
      ]
    },
    {
      name: "RT",
      url: "https://rt-english.com/rss/",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 77,
          serverOrder: 97
        }
      ]
    },
    {
      name: "RT Russia",
      url: "https://rt-english.com/rss/russia/",
      placements: [
        {
          edition: "full",
          category: "europe",
          browserOrder: 78,
          serverOrder: 98
        }
      ]
    },
    {
      name: "Fars News",
      url: "https://news.google.com/rss/search?q=site:farsnews.ir+when:2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          browserOrder: 6,
          serverOrder: 29
        }
      ]
    },
    {
      name: "IRNA",
      url: "https://en.irna.ir/rss",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          browserOrder: 7,
          serverOrder: 30
        }
      ]
    },
    {
      name: "Mehr News",
      url: "https://en.mehrnews.com/rss",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          browserOrder: 8,
          serverOrder: 31
        }
      ]
    },
    {
      name: "Asharq News",
      url: "https://asharq.com/snapchat/rss.xml",
      lang: "ar",
      placements: [
        {
          edition: "full",
          category: "middleeast",
          browserOrder: 16,
          serverOrder: 28
        }
      ]
    },
    {
      name: "CDC",
      url: "https://news.google.com/rss/search?q=site:cdc.gov+OR+CDC+health+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "gov",
          browserOrder: 8,
          serverOrder: 11
        }
      ]
    },
    {
      name: "FEMA",
      url: "https://news.google.com/rss/search?q=site:fema.gov+OR+FEMA+emergency+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "gov",
          browserOrder: 9,
          serverOrder: 13
        }
      ]
    },
    {
      name: "DHS",
      url: 'https://news.google.com/rss/search?q=site:dhs.gov+OR+"Homeland+Security"+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "full",
          category: "gov",
          browserOrder: 10,
          serverOrder: 12
        }
      ]
    },
    {
      name: "RAND",
      url: "https://www.rand.org/pubs/articles.xml",
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          browserOrder: 4,
          serverOrder: 8
        },
        {
          edition: "intel",
          category: "intel",
          browserOrder: 18,
          type: "research",
          serverOrder: 24
        }
      ],
      notes: [
        "Think Tanks & Research (Tier 3)"
      ]
    },
    {
      name: "Brookings",
      url: "https://news.google.com/rss/search?q=site:brookings.edu+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          browserOrder: 5,
          serverOrder: 10
        }
      ]
    },
    {
      name: "Brookings",
      url: "https://news.google.com/rss/search?q=site:brookings.edu+when:7d&hl=en&gl=US&ceid=US:en",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 19,
          serverOrder: 26
        }
      ]
    },
    {
      name: "Carnegie",
      url: "https://news.google.com/rss/search?q=site:carnegieendowment.org+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          browserOrder: 6,
          serverOrder: 11
        }
      ]
    },
    {
      name: "Carnegie",
      url: "https://news.google.com/rss/search?q=site:carnegieendowment.org+when:7d&hl=en&gl=US&ceid=US:en",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 20,
          serverOrder: 28
        }
      ]
    },
    {
      name: "Responsible Statecraft",
      url: "https://responsiblestatecraft.org/feed/",
      notes: [
        "Responsible Statecraft - Foreign policy analysis (Quincy Institute)"
      ],
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          browserOrder: 8,
          serverOrder: 9
        }
      ]
    },
    {
      name: "RUSI",
      url: "https://news.google.com/rss/search?q=site:rusi.org+when:3d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "RUSI - Royal United Services Institute (UK defense & security)"
      ],
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          browserOrder: 9,
          serverOrder: 12
        }
      ]
    },
    {
      name: "RUSI",
      url: "https://news.google.com/rss/search?q=site:rusi.org+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 23,
          serverOrder: 39
        }
      ]
    },
    {
      name: "FPRI",
      url: "https://news.google.com/rss/search?q=site:fpri.org+when:7d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "FPRI - Foreign Policy Research Institute (US foreign policy)"
      ],
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          browserOrder: 10,
          serverOrder: 6
        }
      ]
    },
    {
      name: "Jamestown",
      url: "https://jamestown.org/feed/",
      notes: [
        "Jamestown Foundation - Eurasia/China/Terrorism analysis"
      ],
      placements: [
        {
          edition: "full",
          category: "thinktanks",
          browserOrder: 11,
          serverOrder: 7
        }
      ]
    },
    {
      name: "UNHCR",
      url: "https://news.google.com/rss/search?q=site:unhcr.org+OR+UNHCR+refugees+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "crisis",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "BBC Afrique",
      url: "https://www.bbc.com/afrique/index.xml",
      lang: "fr",
      placements: [
        {
          edition: "full",
          category: "africa",
          browserOrder: 8,
          serverOrder: 33
        }
      ]
    },
    {
      name: "Latin America",
      url: "https://news.google.com/rss/search?q=(Brazil+OR+Mexico+OR+Argentina+OR+Venezuela+OR+Colombia+OR+Haiti)+when:2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "latam",
          browserOrder: 1,
          serverOrder: 21
        }
      ]
    },
    {
      name: "Reuters LatAm",
      url: "https://news.google.com/rss/search?q=site:reuters.com+(Brazil+OR+Mexico+OR+Argentina)+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "latam",
          browserOrder: 3,
          serverOrder: 24
        }
      ]
    },
    {
      name: "O Globo",
      url: "https://news.google.com/rss/search?q=site:oglobo.globo.com+when:1d&hl=pt-BR&gl=BR&ceid=BR:pt-419",
      lang: "pt",
      placements: [
        {
          edition: "full",
          category: "latam",
          browserOrder: 6,
          serverOrder: 23
        }
      ]
    },
    {
      name: "Folha de S.Paulo",
      url: "https://feeds.folha.uol.com.br/emcimadahora/rss091.xml",
      lang: "pt",
      placements: [
        {
          edition: "full",
          category: "latam",
          browserOrder: 7,
          serverOrder: 19
        }
      ]
    },
    {
      name: "Brasil Paralelo",
      url: "https://www.brasilparalelo.com.br/noticias/rss.xml",
      lang: "pt",
      placements: [
        {
          edition: "full",
          category: "latam",
          browserOrder: 8,
          serverOrder: 17
        }
      ]
    },
    {
      name: "El Tiempo",
      url: "https://www.eltiempo.com/rss/mundo_latinoamerica.xml",
      lang: "es",
      placements: [
        {
          edition: "full",
          category: "latam",
          browserOrder: 9,
          serverOrder: 18
        }
      ]
    },
    {
      name: "La Silla Vac\xEDa",
      url: "https://www.lasillavacia.com/rss",
      lang: "es",
      browser: {
        lang: null
      },
      placements: [
        {
          edition: "full",
          category: "latam",
          browserOrder: 10,
          serverOrder: 20
        }
      ]
    },
    {
      name: "Mexico Security",
      url: "https://news.google.com/rss/search?q=(Mexico+cartel+OR+Mexico+violence+OR+Mexico+troops+OR+narco+Mexico)+when:2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "latam",
          browserOrder: 15,
          serverOrder: 22
        }
      ]
    },
    {
      name: "AP Mexico",
      url: "https://news.google.com/rss/search?q=site:apnews.com+Mexico+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "latam",
          browserOrder: 16,
          serverOrder: 16
        }
      ]
    },
    {
      name: "Indian Express",
      url: "https://indianexpress.com/section/india/feed/",
      placements: [
        {
          edition: "full",
          category: "asia",
          browserOrder: 11,
          serverOrder: 48
        }
      ]
    },
    {
      name: "India News Network",
      url: "https://news.google.com/rss/search?q=India+diplomacy+foreign+policy+news+when:3d&hl=en&gl=US&ceid=US:en",
      placements: [
        {
          edition: "full",
          category: "asia",
          browserOrder: 13,
          serverOrder: 47
        }
      ]
    },
    {
      name: "Thai PBS",
      url: "https://news.google.com/rss/search?q=Thai+PBS+World+news+when:2d&hl=en&gl=US&ceid=US:en",
      lang: "th",
      placements: [
        {
          edition: "full",
          category: "asia",
          browserOrder: 22,
          serverOrder: 49
        }
      ]
    },
    {
      name: "Tuoi Tre News",
      url: "https://news.tuoitre.vn/rss",
      lang: "vi",
      placements: [
        {
          edition: "full",
          category: "asia",
          browserOrder: 24,
          serverOrder: 50
        }
      ]
    },
    {
      name: "Chosun Ilbo",
      url: "https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml",
      lang: "ko",
      placements: [
        {
          edition: "full",
          category: "asia",
          browserOrder: 26,
          serverOrder: 45
        }
      ]
    },
    {
      name: "ABC News Australia",
      url: "https://www.abc.net.au/news/feed/2942460/rss.xml",
      notes: [
        "Australia"
      ],
      placements: [
        {
          edition: "full",
          category: "asia",
          browserOrder: 27,
          serverOrder: 44
        }
      ]
    },
    {
      name: "Guardian Australia",
      url: "https://www.theguardian.com/australia-news/rss",
      placements: [
        {
          edition: "full",
          category: "asia",
          browserOrder: 28,
          serverOrder: 46
        }
      ]
    },
    {
      name: "Mining & Resources",
      url: 'https://news.google.com/rss/search?q=(lithium+OR+"rare+earth"+OR+cobalt+OR+mining)+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "full",
          category: "energy",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "ZDNet",
      url: "https://www.zdnet.com/news/rss.xml",
      placements: [
        {
          edition: "tech",
          category: "tech",
          browserOrder: 5,
          serverOrder: 8
        }
      ]
    },
    {
      name: "TechMeme",
      url: "https://www.techmeme.com/feed.xml",
      placements: [
        {
          edition: "tech",
          category: "tech",
          browserOrder: 6,
          serverOrder: 7
        }
      ]
    },
    {
      name: "Engadget",
      url: "https://www.engadget.com/rss.xml",
      placements: [
        {
          edition: "tech",
          category: "tech",
          browserOrder: 7,
          serverOrder: 5
        }
      ]
    },
    {
      name: "Fast Company",
      url: "https://feeds.feedburner.com/fastcompany/headlines",
      placements: [
        {
          edition: "tech",
          category: "tech",
          browserOrder: 8,
          serverOrder: 6
        }
      ]
    },
    {
      name: "MIT Tech Review AI",
      url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
      placements: [
        {
          edition: "tech",
          category: "ai",
          browserOrder: 3,
          serverOrder: 8
        }
      ]
    },
    {
      name: "MIT Research",
      url: "https://news.mit.edu/rss/research",
      placements: [
        {
          edition: "tech",
          category: "ai",
          browserOrder: 4,
          serverOrder: 7
        }
      ]
    },
    {
      name: "ArXiv ML",
      url: "https://export.arxiv.org/rss/cs.LG",
      placements: [
        {
          edition: "tech",
          category: "ai",
          browserOrder: 6,
          serverOrder: 6
        }
      ]
    },
    {
      name: "AI Weekly",
      url: 'https://news.google.com/rss/search?q="artificial+intelligence"+OR+"machine+learning"+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "ai",
          browserOrder: 7,
          serverOrder: 4
        }
      ]
    },
    {
      name: "Anthropic News",
      url: "https://news.google.com/rss/search?q=Anthropic+Claude+AI+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "ai",
          browserOrder: 8,
          serverOrder: 5
        }
      ]
    },
    {
      name: "OpenAI News",
      url: "https://news.google.com/rss/search?q=OpenAI+ChatGPT+GPT-4+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "ai",
          browserOrder: 9,
          serverOrder: 9
        }
      ]
    },
    {
      name: "SaaStr",
      url: "https://www.saastr.com/feed/",
      placements: [
        {
          edition: "tech",
          category: "startups",
          browserOrder: 3,
          serverOrder: 7
        }
      ]
    },
    {
      name: "AngelList News",
      url: 'https://news.google.com/rss/search?q=site:angellist.com+OR+"AngelList"+funding+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "startups",
          browserOrder: 4,
          serverOrder: 3
        }
      ]
    },
    {
      name: "TechCrunch Venture",
      url: "https://techcrunch.com/category/venture/feed/",
      placements: [
        {
          edition: "tech",
          category: "startups",
          browserOrder: 5,
          serverOrder: 8
        }
      ]
    },
    {
      name: "The Information",
      url: "https://news.google.com/rss/search?q=site:theinformation.com+startup+OR+funding+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "startups",
          browserOrder: 6,
          serverOrder: 9
        }
      ]
    },
    {
      name: "Fortune Term Sheet",
      url: 'https://news.google.com/rss/search?q="Term+Sheet"+venture+capital+OR+startup+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "startups",
          browserOrder: 7,
          serverOrder: 5
        }
      ]
    },
    {
      name: "PitchBook News",
      url: "https://news.google.com/rss/search?q=site:pitchbook.com+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "startups",
          browserOrder: 8,
          serverOrder: 6
        }
      ]
    },
    {
      name: "CB Insights",
      url: "https://www.cbinsights.com/research/feed/",
      placements: [
        {
          edition: "tech",
          category: "startups",
          browserOrder: 9,
          serverOrder: 4
        }
      ]
    },
    {
      name: "Paul Graham Essays",
      url: 'https://news.google.com/rss/search?q="Paul+Graham"+essay+OR+blog+when:30d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "vcblogs",
          browserOrder: 4,
          serverOrder: 7
        }
      ]
    },
    {
      name: "VC Insights",
      url: 'https://news.google.com/rss/search?q=("venture+capital"+insights+OR+"VC+trends"+OR+"startup+advice")+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "vcblogs",
          browserOrder: 5,
          serverOrder: 8
        }
      ]
    },
    {
      name: "Lenny's Newsletter",
      url: "https://www.lennysnewsletter.com/feed",
      placements: [
        {
          edition: "tech",
          category: "vcblogs",
          browserOrder: 6,
          serverOrder: 6
        }
      ]
    },
    {
      name: "FwdStart Newsletter",
      url: "https://news.google.com/rss/search?q=site:fwdstart.me+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "vcblogs",
          browserOrder: 8,
          serverOrder: 5
        }
      ]
    },
    {
      name: "The Next Web",
      url: "https://news.google.com/rss/search?q=site:thenextweb.com+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 3,
          serverOrder: 30
        }
      ]
    },
    {
      name: "KrASIA",
      url: "https://news.google.com/rss/search?q=site:kr-asia.com+OR+KrASIA+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 5,
          serverOrder: 21
        }
      ]
    },
    {
      name: "SEA Startups",
      url: "https://news.google.com/rss/search?q=(Singapore+OR+Indonesia+OR+Vietnam+OR+Thailand+OR+Malaysia)+startup+funding+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 6,
          serverOrder: 26
        }
      ]
    },
    {
      name: "Asia VC News",
      url: 'https://news.google.com/rss/search?q=("Southeast+Asia"+OR+ASEAN)+venture+capital+OR+funding+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 7,
          serverOrder: 9
        }
      ]
    },
    {
      name: "China Startups",
      url: 'https://news.google.com/rss/search?q=China+startup+funding+OR+"Chinese+startup"+when:7d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "China"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 8,
          serverOrder: 11
        }
      ]
    },
    {
      name: "36Kr English",
      url: 'https://news.google.com/rss/search?q=site:36kr.com+OR+"36Kr"+startup+china+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 9,
          serverOrder: 6
        }
      ]
    },
    {
      name: "China Tech Giants",
      url: "https://news.google.com/rss/search?q=(Alibaba+OR+Tencent+OR+ByteDance+OR+Baidu+OR+JD.com+OR+Xiaomi+OR+Huawei)+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 10,
          serverOrder: 12
        }
      ]
    },
    {
      name: "Japan Startups",
      url: 'https://news.google.com/rss/search?q=Japan+startup+funding+OR+"Japanese+startup"+when:7d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "Japan"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 11,
          serverOrder: 17
        }
      ]
    },
    {
      name: "Japan Tech News",
      url: "https://news.google.com/rss/search?q=(Japan+startup+OR+Japan+tech+OR+SoftBank+OR+Rakuten+OR+Sony)+funding+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 12,
          serverOrder: 18
        }
      ]
    },
    {
      name: "Nikkei Tech",
      url: "https://news.google.com/rss/search?q=site:asia.nikkei.com+technology+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 13,
          serverOrder: 25
        }
      ]
    },
    {
      name: "Korea Tech News",
      url: "https://news.google.com/rss/search?q=(Korea+startup+OR+Korean+tech+OR+Samsung+OR+Kakao+OR+Naver+OR+Coupang)+when:7d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Korea"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 14,
          serverOrder: 20
        }
      ]
    },
    {
      name: "Korea Startups",
      url: 'https://news.google.com/rss/search?q=Korea+startup+funding+OR+"Korean+unicorn"+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 15,
          serverOrder: 19
        }
      ]
    },
    {
      name: "YourStory",
      url: "https://yourstory.com/feed",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 17,
          serverOrder: 32
        }
      ]
    },
    {
      name: "India Startups",
      url: 'https://news.google.com/rss/search?q=India+startup+funding+OR+"Indian+startup"+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 18,
          serverOrder: 14
        }
      ]
    },
    {
      name: "India Tech News",
      url: "https://news.google.com/rss/search?q=(Flipkart+OR+Razorpay+OR+Zerodha+OR+Zomato+OR+Paytm+OR+PhonePe)+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 19,
          serverOrder: 15
        }
      ]
    },
    {
      name: "SEA Tech News",
      url: "https://news.google.com/rss/search?q=(Grab+OR+GoTo+OR+Sea+Limited+OR+Shopee+OR+Tokopedia)+when:7d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Southeast Asia"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 20,
          serverOrder: 27
        }
      ]
    },
    {
      name: "Vietnam Tech",
      url: "https://news.google.com/rss/search?q=Vietnam+startup+OR+Vietnam+tech+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 21,
          serverOrder: 31
        }
      ]
    },
    {
      name: "Indonesia Tech",
      url: "https://news.google.com/rss/search?q=Indonesia+startup+OR+Indonesia+tech+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 22,
          serverOrder: 16
        }
      ]
    },
    {
      name: "Taiwan Tech",
      url: "https://news.google.com/rss/search?q=(Taiwan+startup+OR+TSMC+OR+MediaTek+OR+Foxconn)+when:7d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Taiwan"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 23,
          serverOrder: 29
        }
      ]
    },
    {
      name: "LATAM Startups",
      url: 'https://news.google.com/rss/search?q=("Latin+America"+startup+OR+LATAM+funding)+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 25,
          serverOrder: 22
        }
      ]
    },
    {
      name: "Startups LATAM",
      url: "https://news.google.com/rss/search?q=(startup+Brazil+OR+startup+Mexico+OR+startup+Argentina+OR+startup+Colombia+OR+startup+Chile)+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 26,
          serverOrder: 28
        }
      ]
    },
    {
      name: "Brazil Tech",
      url: "https://news.google.com/rss/search?q=(Nubank+OR+iFood+OR+Mercado+Libre+OR+Rappi+OR+VTEX)+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 27,
          serverOrder: 10
        }
      ]
    },
    {
      name: "FinTech LATAM",
      url: 'https://news.google.com/rss/search?q=fintech+(Brazil+OR+Mexico+OR+Argentina+OR+"Latin+America")+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 28,
          serverOrder: 13
        }
      ]
    },
    {
      name: "Africa Startups",
      url: 'https://news.google.com/rss/search?q=Africa+startup+funding+OR+"African+startup"+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 30,
          serverOrder: 7
        }
      ]
    },
    {
      name: "Africa Tech News",
      url: 'https://news.google.com/rss/search?q=(Flutterwave+OR+Paystack+OR+Jumia+OR+Andela+OR+"Africa+startup")+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 31,
          serverOrder: 8
        }
      ]
    },
    {
      name: "MENA Startups",
      url: 'https://news.google.com/rss/search?q=(MENA+startup+OR+"Middle+East"+funding+OR+Gulf+startup)+when:7d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "Middle East"
      ],
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 32,
          serverOrder: 23
        }
      ]
    },
    {
      name: "MENA Tech News",
      url: "https://news.google.com/rss/search?q=(UAE+startup+OR+Saudi+tech+OR+Dubai+startup+OR+NEOM+tech)+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "regionalStartups",
          browserOrder: 33,
          serverOrder: 24
        }
      ]
    },
    {
      name: "GitHub Trending",
      url: "https://mshibanami.github.io/GitHubTrendingRSS/daily/all.xml",
      channelDated: true,
      linkHosts: [
        "github.com"
      ],
      placements: [
        {
          edition: "tech",
          category: "github",
          browserOrder: 1,
          serverOrder: 2
        }
      ]
    },
    {
      name: "YC Launches",
      url: 'https://news.google.com/rss/search?q=("Y+Combinator"+OR+"YC+launch"+OR+"YC+W25"+OR+"YC+S25")+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "github",
          browserOrder: 2,
          serverOrder: 4
        }
      ]
    },
    {
      name: "Dev Events",
      url: 'https://news.google.com/rss/search?q=("developer+conference"+OR+"tech+summit"+OR+"devcon"+OR+"developer+event")+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "github",
          browserOrder: 3,
          serverOrder: 1
        }
      ]
    },
    {
      name: "Open Source News",
      url: 'https://news.google.com/rss/search?q="open+source"+project+release+OR+launch+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "github",
          browserOrder: 4,
          serverOrder: 3
        }
      ]
    },
    {
      name: "Renaissance IPO",
      url: "https://news.google.com/rss/search?q=site:renaissancecapital.com+IPO+when:14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "ipo",
          browserOrder: 1,
          serverOrder: 2
        }
      ]
    },
    {
      name: "SEC Filings",
      url: 'https://news.google.com/rss/search?q=(S-1+OR+"IPO+filing"+OR+"SEC+filing")+startup+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "funding",
          browserOrder: 0,
          serverOrder: 1
        }
      ]
    },
    {
      name: "Seed & Pre-Seed",
      url: 'https://news.google.com/rss/search?q=("seed+round"+OR+"pre-seed"+OR+"angel+round"+OR+"seed+funding")+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "funding",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Startup Funding",
      url: 'https://news.google.com/rss/search?q=("startup+funding"+OR+"raised+funding"+OR+"raised+$"+OR+"funding+announced")+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "funding",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "The Hacker News",
      url: "https://feeds.feedburner.com/TheHackersNews",
      placements: [
        {
          edition: "tech",
          category: "security",
          browserOrder: 1,
          serverOrder: 3
        }
      ]
    },
    {
      name: "Schneier",
      url: "https://www.schneier.com/feed/",
      placements: [
        {
          edition: "tech",
          category: "security",
          browserOrder: 3,
          serverOrder: 2
        }
      ]
    },
    {
      name: "EFF News",
      url: 'https://news.google.com/rss/search?q=site:eff.org+OR+"Electronic+Frontier+Foundation"+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "policy",
          browserOrder: 3,
          serverOrder: 4
        }
      ]
    },
    {
      name: "EU Digital Policy",
      url: 'https://news.google.com/rss/search?q=("Digital+Services+Act"+OR+"Digital+Markets+Act"+OR+"EU+AI+Act"+OR+"GDPR")+when:7d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "EU Digital Policy"
      ],
      placements: [
        {
          edition: "tech",
          category: "policy",
          browserOrder: 4,
          serverOrder: 6
        }
      ]
    },
    {
      name: "EU Commission Digital",
      url: "https://news.google.com/rss/search?q=site:ec.europa.eu+digital+OR+technology+when:14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "policy",
          browserOrder: 6,
          serverOrder: 5
        }
      ]
    },
    {
      name: "China Tech Policy",
      url: "https://news.google.com/rss/search?q=(China+tech+regulation+OR+China+AI+policy+OR+MIIT+technology)+when:7d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "China Tech Policy"
      ],
      placements: [
        {
          edition: "tech",
          category: "policy",
          browserOrder: 7,
          serverOrder: 3
        }
      ]
    },
    {
      name: "UK Tech Policy",
      url: 'https://news.google.com/rss/search?q=(UK+AI+safety+OR+"Online+Safety+Bill"+OR+UK+tech+regulation)+when:7d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "UK Policy"
      ],
      placements: [
        {
          edition: "tech",
          category: "policy",
          browserOrder: 8,
          serverOrder: 8
        }
      ]
    },
    {
      name: "India Tech Policy",
      url: "https://news.google.com/rss/search?q=(India+tech+regulation+OR+India+data+protection+OR+India+AI+policy)+when:7d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "India Policy"
      ],
      placements: [
        {
          edition: "tech",
          category: "policy",
          browserOrder: 9,
          serverOrder: 7
        }
      ]
    },
    {
      name: "Brookings Tech",
      url: "https://news.google.com/rss/search?q=site:brookings.edu+technology+OR+AI+when:14d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "US Think Tanks"
      ],
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 0,
          serverOrder: 0
        }
      ]
    },
    {
      name: "CSIS Tech",
      url: "https://news.google.com/rss/search?q=site:csis.org+technology+OR+AI+when:14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 1,
          serverOrder: 1
        }
      ]
    },
    {
      name: "MIT Tech Policy",
      url: "https://news.google.com/rss/search?q=%22Tech+Policy+Press%22+when:7d&hl=en&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Stanford HAI",
      url: "https://news.google.com/rss/search?q=site:hai.stanford.edu+when:14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "AI Now Institute",
      url: "https://news.google.com/rss/search?q=%22AI+Now+Institute%22+when:7d&hl=en&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 4,
          serverOrder: 4
        }
      ]
    },
    {
      name: "OECD Digital",
      url: "https://news.google.com/rss/search?q=site:oecd.org+digital+OR+AI+when:14d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Europe Think Tanks"
      ],
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 5,
          serverOrder: 5
        }
      ]
    },
    {
      name: "EU Tech Policy",
      url: 'https://news.google.com/rss/search?q=("EU+tech+policy"+OR+"European+digital"+OR+Bruegel+tech)+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 6,
          serverOrder: 6
        }
      ]
    },
    {
      name: "Chatham House Tech",
      url: "https://news.google.com/rss/search?q=site:chathamhouse.org+technology+OR+AI+when:14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 7,
          serverOrder: 7
        }
      ]
    },
    {
      name: "ISEAS (Singapore)",
      url: "https://news.google.com/rss/search?q=site:iseas.edu.sg+technology+when:14d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "Asia Think Tanks"
      ],
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 8,
          serverOrder: 8
        }
      ]
    },
    {
      name: "ORF Tech (India)",
      url: 'https://news.google.com/rss/search?q=(India+tech+policy+OR+ORF+technology+OR+"Observer+Research+Foundation"+tech)+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 9,
          serverOrder: 9
        }
      ]
    },
    {
      name: "RIETI (Japan)",
      url: "https://news.google.com/rss/search?q=site:rieti.go.jp+technology+when:30d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 10,
          serverOrder: 10
        }
      ]
    },
    {
      name: "Asia Pacific Tech",
      url: 'https://news.google.com/rss/search?q=("Asia+Pacific"+tech+policy+OR+"Lowy+Institute"+technology)+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 11,
          serverOrder: 11
        }
      ]
    },
    {
      name: "China Tech Analysis",
      url: 'https://news.google.com/rss/search?q=("China+tech+strategy"+OR+"Chinese+AI"+OR+"China+semiconductor")+analysis+when:7d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "China Research (External Views)"
      ],
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 12,
          serverOrder: 12
        }
      ]
    },
    {
      name: "DigiChina",
      url: "https://news.google.com/rss/search?q=DigiChina+Stanford+China+technology+when:7d&hl=en&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "thinktanks",
          browserOrder: 13,
          serverOrder: 13
        }
      ]
    },
    {
      name: "MarketWatch Tech",
      url: "https://news.google.com/rss/search?q=site:marketwatch.com+technology+markets+when:2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "finance",
          browserOrder: 1,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Seeking Alpha Tech",
      url: "https://seekingalpha.com/market_currents.xml",
      placements: [
        {
          edition: "tech",
          category: "finance",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "DevOps.com",
      url: "https://news.google.com/rss/search?q=site:devops.com+when:7d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "cloud",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "CB Insights Unicorn",
      url: "https://news.google.com/rss/search?q=site:cbinsights.com+unicorn+when:14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "unicorns",
          browserOrder: 1,
          serverOrder: 2
        }
      ]
    },
    {
      name: "New Unicorns",
      url: 'https://news.google.com/rss/search?q=("becomes+unicorn"+OR+"joins+unicorn"+OR+"reaches+unicorn"+OR+"achieved+unicorn")+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "unicorns",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "Techstars News",
      url: "https://news.google.com/rss/search?q=Techstars+accelerator+when:14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "accelerators",
          browserOrder: 1,
          serverOrder: 4
        }
      ]
    },
    {
      name: "500 Global News",
      url: 'https://news.google.com/rss/search?q="500+Global"+OR+"500+Startups"+accelerator+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "accelerators",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Startup School",
      url: 'https://news.google.com/rss/search?q="Startup+School"+OR+"YC+Startup+School"+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "accelerators",
          browserOrder: 4,
          serverOrder: 3
        }
      ]
    },
    {
      name: "Acquired Episodes",
      url: 'https://news.google.com/rss/search?q="Acquired+podcast"+episode+when:14d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "Tech Podcast Episodes (via Google News - podcast hosts block RSS proxies)"
      ],
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 0,
          serverOrder: 0
        }
      ]
    },
    {
      name: "All-In Podcast",
      url: 'https://news.google.com/rss/search?q="All-In+podcast"+(Chamath+OR+Sacks+OR+Friedberg)+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 1,
          serverOrder: 1
        }
      ]
    },
    {
      name: "a16z Insights",
      url: 'https://news.google.com/rss/search?q=("a16z"+OR+"Andreessen+Horowitz")+podcast+OR+interview+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "TWIST Episodes",
      url: 'https://news.google.com/rss/search?q="This+Week+in+Startups"+Jason+Calacanis+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "20VC Episodes",
      url: "https://rss.libsyn.com/shows/61840/destinations/240976.xml",
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 4,
          serverOrder: 4
        }
      ]
    },
    {
      name: "Lex Fridman Tech",
      url: 'https://news.google.com/rss/search?q=("Lex+Fridman"+interview)+(AI+OR+tech+OR+startup+OR+CEO)+when:7d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 5,
          serverOrder: 5
        }
      ]
    },
    {
      name: "Verge Shows",
      url: 'https://news.google.com/rss/search?q=("Vergecast"+OR+"Decoder+podcast"+Verge)+when:14d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "Tech Media Shows"
      ],
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 6,
          serverOrder: 6
        }
      ]
    },
    {
      name: "Hard Fork (NYT)",
      url: 'https://news.google.com/rss/search?q="Hard+Fork"+podcast+NYT+when:14d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 7,
          serverOrder: 7
        }
      ]
    },
    {
      name: "Pivot Podcast",
      url: "https://feeds.megaphone.fm/pivot",
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 8,
          serverOrder: 8
        }
      ]
    },
    {
      name: "Tech Newsletters",
      url: 'https://news.google.com/rss/search?q=("Benedict+Evans"+OR+"Pragmatic+Engineer"+OR+Stratechery)+tech+when:14d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "Newsletters"
      ],
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 9,
          serverOrder: 9
        }
      ]
    },
    {
      name: "AI Podcasts",
      url: 'https://news.google.com/rss/search?q=("AI+podcast"+OR+"artificial+intelligence+podcast")+episode+when:14d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "AI Podcasts & Shows"
      ],
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 10,
          serverOrder: 10
        }
      ]
    },
    {
      name: "AI Interviews",
      url: "https://news.google.com/rss/search?q=(NVIDIA+OR+OpenAI+OR+Anthropic+OR+DeepMind)+interview+OR+podcast+when:14d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 11,
          serverOrder: 11
        }
      ]
    },
    {
      name: "How I Built This",
      url: 'https://news.google.com/rss/search?q="How+I+Built+This"+Guy+Raz+when:14d&hl=en-US&gl=US&ceid=US:en',
      notes: [
        "Startup Shows"
      ],
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 12,
          serverOrder: 12
        }
      ]
    },
    {
      name: "Masters of Scale",
      url: "https://rss.art19.com/masters-of-scale",
      placements: [
        {
          edition: "tech",
          category: "podcasts",
          browserOrder: 13,
          serverOrder: 13
        }
      ]
    },
    {
      name: "Reuters Markets",
      url: "https://news.google.com/rss/search?q=site:reuters.com+markets+stocks+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "markets",
          browserOrder: 4,
          serverOrder: 11
        }
      ]
    },
    {
      name: "Bloomberg Markets",
      url: "https://news.google.com/rss/search?q=site:bloomberg.com+markets+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "markets",
          browserOrder: 5,
          serverOrder: 9
        }
      ]
    },
    {
      name: "Investing.com News",
      url: "https://news.google.com/rss/search?q=site:investing.com+markets+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "markets",
          browserOrder: 6,
          serverOrder: 10
        }
      ]
    },
    {
      name: "Dollar Watch",
      url: 'https://news.google.com/rss/search?q=("dollar+index"+OR+DXY+OR+"US+dollar"+OR+"euro+dollar")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "forex",
          browserOrder: 1,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Central Bank Rates",
      url: 'https://news.google.com/rss/search?q=("central+bank"+OR+"interest+rate"+OR+"rate+decision"+OR+"monetary+policy")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "forex",
          browserOrder: 2,
          serverOrder: 1
        }
      ]
    },
    {
      name: "Treasury Watch",
      url: 'https://news.google.com/rss/search?q=("US+Treasury"+OR+"Treasury+auction"+OR+"10-year+yield"+OR+"2-year+yield")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "bonds",
          browserOrder: 1,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Corporate Bonds",
      url: 'https://news.google.com/rss/search?q=("corporate+bond"+OR+"high+yield"+OR+"investment+grade"+OR+"credit+spread")+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "bonds",
          browserOrder: 2,
          serverOrder: 1
        }
      ]
    },
    {
      name: "Agriculture",
      url: "https://news.google.com/rss/search?q=(wheat+OR+corn+OR+soybeans+OR+coffee+OR+sugar)+price+OR+commodity+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "finance",
          category: "commodities",
          browserOrder: 2,
          serverOrder: 2
        },
        {
          edition: "full",
          category: "commodities",
          serverOrder: 2
        }
      ]
    },
    {
      name: "Commodity Trading",
      url: 'https://news.google.com/rss/search?q=("commodity+trading"+OR+"futures+market"+OR+CME+OR+NYMEX+OR+COMEX)+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "commodities",
          browserOrder: 3,
          serverOrder: 3
        },
        {
          edition: "full",
          category: "commodities",
          serverOrder: 3
        }
      ]
    },
    {
      name: "Crypto News",
      url: 'https://news.google.com/rss/search?q=(bitcoin+OR+ethereum+OR+crypto+OR+"digital+assets")+when:1d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "crypto",
          browserOrder: 3,
          serverOrder: 20
        }
      ]
    },
    {
      name: "ECB Watch",
      url: 'https://news.google.com/rss/search?q=("European+Central+Bank"+OR+ECB+OR+Lagarde)+monetary+policy+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "centralbanks",
          browserOrder: 1,
          serverOrder: 4
        }
      ]
    },
    {
      name: "BoJ Watch",
      url: 'https://news.google.com/rss/search?q=("Bank+of+Japan"+OR+BoJ)+monetary+policy+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "centralbanks",
          browserOrder: 2,
          serverOrder: 3
        }
      ]
    },
    {
      name: "BoE Watch",
      url: 'https://news.google.com/rss/search?q=("Bank+of+England"+OR+BoE)+monetary+policy+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "centralbanks",
          browserOrder: 3,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Global Central Banks",
      url: 'https://news.google.com/rss/search?q=("rate+hike"+OR+"rate+cut"+OR+"interest+rate+decision")+central+bank+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "centralbanks",
          browserOrder: 5,
          serverOrder: 5
        }
      ]
    },
    {
      name: "Housing Market",
      url: 'https://news.google.com/rss/search?q=("housing+market"+OR+"home+prices"+OR+"mortgage+rates"+OR+REIT)+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "economic",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Earnings Reports",
      url: 'https://news.google.com/rss/search?q=("earnings+report"+OR+"quarterly+earnings"+OR+"revenue+beat"+OR+"earnings+miss")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "ipo",
          browserOrder: 1,
          serverOrder: 1
        }
      ]
    },
    {
      name: "M&A News",
      url: 'https://news.google.com/rss/search?q=("merger"+OR+"acquisition"+OR+"takeover+bid"+OR+"buyout")+billion+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "finance",
          category: "ipo",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Upworthy",
      url: "https://www.upworthy.com/feed/",
      placements: [
        {
          edition: "happy",
          category: "positive",
          browserOrder: 4,
          serverOrder: 9
        }
      ]
    },
    {
      name: "DailyGood",
      url: "https://www.dailygood.org/feed",
      placements: [
        {
          edition: "happy",
          category: "positive",
          browserOrder: 5,
          serverOrder: 4
        }
      ]
    },
    {
      name: "Good Good Good",
      url: "https://www.goodgoodgood.co/articles/rss.xml",
      placements: [
        {
          edition: "happy",
          category: "positive",
          browserOrder: 6,
          serverOrder: 6
        }
      ]
    },
    {
      name: "GOOD Magazine",
      url: "https://www.good.is/feed/",
      placements: [
        {
          edition: "happy",
          category: "positive",
          browserOrder: 7,
          serverOrder: 5
        }
      ]
    },
    {
      name: "Sunny Skyz",
      url: "https://www.sunnyskyz.com/rss_tebow.php",
      placements: [
        {
          edition: "happy",
          category: "positive",
          browserOrder: 8,
          serverOrder: 7
        }
      ]
    },
    {
      name: "The Better India",
      url: "https://thebetterindia.com/feed/",
      placements: [
        {
          edition: "happy",
          category: "positive",
          browserOrder: 9,
          serverOrder: 8
        }
      ]
    },
    {
      name: "GNN Science",
      url: "https://www.goodnewsnetwork.org/category/news/science/feed/",
      placements: [
        {
          edition: "happy",
          category: "science",
          browserOrder: 0,
          serverOrder: 4
        }
      ]
    },
    {
      name: "Live Science",
      url: "https://www.livescience.com/feeds.xml",
      placements: [
        {
          edition: "happy",
          category: "science",
          browserOrder: 3,
          serverOrder: 6
        }
      ]
    },
    {
      name: "New Scientist",
      url: "https://news.google.com/rss/search?q=site:newscientist.com+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "happy",
          category: "science",
          browserOrder: 4,
          serverOrder: 7
        }
      ]
    },
    {
      name: "Greater Good (Berkeley)",
      url: "https://greatergood.berkeley.edu/site/rss/articles",
      placements: [
        {
          edition: "happy",
          category: "science",
          browserOrder: 7,
          serverOrder: 5
        }
      ]
    },
    {
      name: "GNN Animals",
      url: "https://www.goodnewsnetwork.org/category/news/animals/feed/",
      placements: [
        {
          edition: "happy",
          category: "nature",
          browserOrder: 0,
          serverOrder: 2
        }
      ]
    },
    {
      name: "GNN Earth",
      url: "https://www.goodnewsnetwork.org/category/news/earth/feed/",
      placements: [
        {
          edition: "happy",
          category: "nature",
          browserOrder: 1,
          serverOrder: 3
        }
      ]
    },
    {
      name: "GNN Heroes Spotlight",
      url: "https://www.goodnewsnetwork.org/category/news/heroes/feed/",
      placements: [
        {
          edition: "happy",
          category: "inspiring",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "GoldSeek",
      url: "https://www.goldseek.com/rss.xml",
      notes: [
        "GoldSeek + SilverSeek moved their feeds from the `news.*` subdomain to the apex domain (the old subdomain returns 404; the apex /rss.xml on both returns application/rss+xml)."
      ],
      placements: [
        {
          edition: "commodity",
          category: "gold-silver",
          browserOrder: 5,
          serverOrder: 7
        }
      ]
    },
    {
      name: "SilverSeek",
      url: "https://www.silverseek.com/rss.xml",
      placements: [
        {
          edition: "commodity",
          category: "gold-silver",
          browserOrder: 6,
          serverOrder: 8
        }
      ]
    },
    {
      name: "Gold Silver Worlds",
      url: "https://goldsilverworlds.com/feed/",
      placements: [
        {
          edition: "commodity",
          category: "gold-silver",
          browserOrder: 7,
          serverOrder: 6
        }
      ]
    },
    {
      name: "FX Empire Gold",
      url: "https://news.google.com/rss/search?q=site:fxempire.com+gold+when:1d&hl=en-US&gl=US&ceid=US:en",
      notes: [
        "The /api/v1/.../feed endpoint FX Empire used to expose was deprecated; their generic /feed now returns text/html, not RSS. Google News scoped to site:fxempire.com for gold articles."
      ],
      placements: [
        {
          edition: "commodity",
          category: "gold-silver",
          browserOrder: 8,
          serverOrder: 5
        }
      ]
    },
    {
      name: "Bloomberg Energy",
      url: "https://news.google.com/rss/search?q=site:bloomberg.com+(oil+OR+gas+OR+energy+OR+pipeline+OR+LNG)+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "energy",
          category: "live-news",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "FT Energy",
      url: "https://news.google.com/rss/search?q=site:ft.com+(oil+OR+gas+OR+energy+OR+LNG+OR+OPEC)+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "energy",
          category: "live-news",
          browserOrder: 4,
          serverOrder: 4
        }
      ]
    },
    {
      name: "IEA News",
      url: "https://news.google.com/rss/search?q=site:iea.org+(oil+OR+gas+OR+energy)+when:3d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "energy",
          category: "live-news",
          browserOrder: 5,
          serverOrder: 5
        }
      ]
    },
    {
      name: "S&P Global Platts",
      url: "https://news.google.com/rss/search?q=site:spglobal.com+(oil+OR+gas+OR+LNG+OR+pipeline)+when:2d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "energy",
          category: "live-news",
          browserOrder: 6,
          serverOrder: 6
        }
      ]
    },
    {
      name: "EIA Press Room",
      url: "https://www.eia.gov/rss/press_room.xml",
      placements: [
        {
          edition: "energy",
          category: "energy",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "OPEC & Crude",
      url: 'https://news.google.com/rss/search?q=(OPEC+OR+"oil+price"+OR+"crude+oil"+OR+WTI+OR+Brent+OR+"oil+production"+OR+"oil+inventory")+when:1d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "energy",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "Natural Gas & LNG",
      url: 'https://news.google.com/rss/search?q=("natural+gas"+OR+LNG+OR+"gas+price"+OR+"Henry+Hub"+OR+TTF+OR+JKM+OR+"LNG+cargo")+when:1d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "energy",
          browserOrder: 4,
          serverOrder: 4
        }
      ]
    },
    {
      name: "Pipelines & Chokepoints",
      url: 'https://news.google.com/rss/search?q=(pipeline+OR+Druzhba+OR+"Nord+Stream"+OR+TurkStream+OR+"Strait+of+Hormuz"+OR+"Bab+el-Mandeb"+OR+"Suez+Canal"+OR+"Power+of+Siberia")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "energy",
          browserOrder: 5,
          serverOrder: 5
        }
      ]
    },
    {
      name: "Energy Crisis & Shortages",
      url: 'https://news.google.com/rss/search?q=("fuel+shortage"+OR+"gas+shortage"+OR+"diesel+shortage"+OR+"jet+fuel+shortage"+OR+"energy+crisis"+OR+rationing+OR+"petrol+shortage")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "energy",
          browserOrder: 6,
          serverOrder: 6
        }
      ]
    },
    {
      name: "Refinery & Disruptions",
      url: 'https://news.google.com/rss/search?q=(refinery+OR+"refinery+outage"+OR+"force+majeure"+OR+"pipeline+sabotage"+OR+"pipeline+attack")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "energy",
          browserOrder: 7,
          serverOrder: 7
        }
      ]
    },
    {
      name: "Tanker & Shipping",
      url: 'https://news.google.com/rss/search?q=(tanker+OR+VLCC+OR+Suezmax+OR+Aframax+OR+"oil+shipping"+OR+"LNG+carrier"+OR+"shadow+fleet")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "supply-chain",
          browserOrder: 0,
          serverOrder: 0
        }
      ]
    },
    {
      name: "Strategic Chokepoints",
      url: 'https://news.google.com/rss/search?q=("Strait+of+Hormuz"+OR+"Strait+of+Malacca"+OR+"Bab+el-Mandeb"+OR+"Suez+Canal"+OR+"Panama+Canal"+OR+"Turkish+Straits"+OR+"Danish+Straits")+when:2d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "supply-chain",
          browserOrder: 1,
          serverOrder: 1
        }
      ]
    },
    {
      name: "Energy Sanctions",
      url: 'https://news.google.com/rss/search?q=("oil+sanctions"+OR+"gas+sanctions"+OR+"price+cap"+OR+"energy+embargo"+OR+"LNG+sanctions")+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "supply-chain",
          browserOrder: 2,
          serverOrder: 2
        }
      ]
    },
    {
      name: "Port & Terminal",
      url: 'https://news.google.com/rss/search?q=("LNG+terminal"+OR+"crude+terminal"+OR+"oil+port"+OR+"Ras+Laffan"+OR+"Sabine+Pass"+OR+"Rotterdam+oil")+when:3d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "energy",
          category: "supply-chain",
          browserOrder: 3,
          serverOrder: 3
        }
      ]
    },
    {
      name: "Reuters Nasdaq Futures",
      url: 'https://news.google.com/rss/search?q=site:reuters.com+(Nasdaq+futures+OR+NQ+OR+"E-mini")+when:1d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "ondemand",
          category: "nq-news",
          browserOrder: 0
        },
        {
          edition: "finance",
          category: "nq-news",
          serverOrder: 0
        }
      ]
    },
    {
      name: "Nasdaq-100 & QQQ",
      url: 'https://news.google.com/rss/search?q=("Nasdaq-100"+OR+QQQ+OR+"Nasdaq+100")+when:1d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "ondemand",
          category: "nq-news",
          browserOrder: 1
        },
        {
          edition: "finance",
          category: "nq-news",
          serverOrder: 1
        }
      ]
    },
    {
      name: "NQ Influence Basket",
      url: "https://news.google.com/rss/search?q=(AAPL+OR+Apple+OR+MSFT+OR+Microsoft+OR+NVDA+OR+NVIDIA+OR+AMZN+OR+Amazon+OR+GOOGL+OR+Alphabet+OR+META+OR+AVGO+OR+Broadcom+OR+TSLA+OR+Tesla)+when:1d&hl=en-US&gl=US&ceid=US:en",
      placements: [
        {
          edition: "ondemand",
          category: "nq-news",
          browserOrder: 3
        },
        {
          edition: "finance",
          category: "nq-news",
          serverOrder: 3
        }
      ]
    },
    {
      name: "Semiconductors",
      url: 'https://news.google.com/rss/search?q=(semiconductor+OR+chip+OR+"AI+chip"+OR+TSMC+OR+ASML)+when:1d&hl=en-US&gl=US&ceid=US:en',
      placements: [
        {
          edition: "ondemand",
          category: "nq-news",
          browserOrder: 4
        },
        {
          edition: "finance",
          category: "nq-news",
          serverOrder: 4
        }
      ]
    },
    {
      name: "Janes",
      url: "https://news.google.com/rss/search?q=site:janes.com+when:3d&hl=en-US&gl=US&ceid=US:en",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 3,
          serverOrder: 35
        }
      ]
    },
    {
      name: "UK MOD",
      url: "https://www.gov.uk/government/organisations/ministry-of-defence.atom",
      type: "defense",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 10,
          serverOrder: 42
        }
      ]
    },
    {
      name: "Chatham House",
      url: "https://news.google.com/rss/search?q=site:chathamhouse.org+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "intl",
      notes: [
        "International Relations (Tier 2)"
      ],
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 12,
          serverOrder: 29
        }
      ]
    },
    {
      name: "ECFR",
      url: "https://news.google.com/rss/search?q=site:ecfr.eu+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "intl",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 13,
          serverOrder: 30
        }
      ]
    },
    {
      name: "Middle East Institute",
      url: "https://news.google.com/rss/search?q=site:mei.edu+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "intl",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 17,
          serverOrder: 37
        }
      ]
    },
    {
      name: "FAS",
      url: "https://news.google.com/rss/search?q=site:fas.org+when:30d&hl=en-US&gl=US&ceid=US:en",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 21,
          serverOrder: 33
        }
      ]
    },
    {
      name: "NTI",
      url: "https://news.google.com/rss/search?q=site:nti.org+when:30d&hl=en-US&gl=US&ceid=US:en",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 22,
          serverOrder: 38
        }
      ]
    },
    {
      name: "Wilson Center",
      url: "https://news.google.com/rss/search?q=site:wilsoncenter.org+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 24,
          serverOrder: 43
        }
      ]
    },
    {
      name: "GMF",
      url: "https://news.google.com/rss/search?q=site:gmfus.org+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 25,
          serverOrder: 34
        }
      ]
    },
    {
      name: "Stimson Center",
      url: "https://www.stimson.org/feed/",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 26,
          serverOrder: 41
        }
      ]
    },
    {
      name: "CNAS",
      url: "https://news.google.com/rss/search?q=site:cnas.org+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 27,
          serverOrder: 27
        }
      ]
    },
    {
      name: "Lowy Institute",
      url: "https://news.google.com/rss/search?q=site:lowyinstitute.org+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "research",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 28,
          serverOrder: 36
        }
      ]
    },
    {
      name: "Ransomware.live",
      url: "https://news.google.com/rss/search?q=site:ransomware.live+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "cyber",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 33,
          serverOrder: 40
        }
      ]
    },
    {
      name: "FAO GIEWS",
      url: "https://news.google.com/rss/search?q=site:fao.org+GIEWS+food+security+when:30d&hl=en-US&gl=US&ceid=US:en",
      type: "economic",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 35,
          serverOrder: 32
        }
      ]
    },
    {
      name: "EU ISS",
      url: "https://news.google.com/rss/search?q=site:iss.europa.eu+when:7d&hl=en-US&gl=US&ceid=US:en",
      type: "intl",
      placements: [
        {
          edition: "intel",
          category: "intel",
          browserOrder: 43,
          serverOrder: 31
        }
      ]
    }
  ]
};

// shared/news-catalog-browser.ts
var INTEL_EDITION = "intel";

// shared/news-catalog.ts
var NEWS_CATALOG = news_catalog_default;
function indexServerPlacements(catalog) {
  const buckets = /* @__PURE__ */ new Map();
  for (const feed of catalog.feeds) {
    for (const placement of feed.placements) {
      const order = placement.serverOrder;
      if (order === void 0) continue;
      const key = `${placement.edition}|${placement.category}`;
      let bucket = buckets.get(key);
      if (!bucket) buckets.set(key, bucket = []);
      bucket.push({ order, feed });
    }
  }
  const index = /* @__PURE__ */ new Map();
  for (const [key, bucket] of buckets) {
    index.set(key, bucket.sort((a, b) => a.order - b.order).map((entry) => entry.feed));
  }
  return index;
}
var placementIndex = null;
function serverPlacedFeeds(edition, category) {
  placementIndex ??= indexServerPlacements(NEWS_CATALOG);
  return placementIndex.get(`${edition}|${category}`) ?? [];
}
function toServerFeed(feed) {
  if (typeof feed.url !== "string") {
    throw new Error(`news catalog: server-placed feed "${feed.name}" needs a single URL`);
  }
  const entry = { name: feed.name, url: feed.url };
  if (feed.lang !== void 0) entry.lang = feed.lang;
  if (feed.strategicDefault !== void 0) entry.strategicDefault = feed.strategicDefault;
  if (feed.deadlinePriority !== void 0) entry.deadlinePriority = feed.deadlinePriority;
  if (feed.depthUrl !== void 0) entry.depthUrl = feed.depthUrl;
  if (feed.channelDated !== void 0) entry.channelDated = feed.channelDated;
  if (feed.linkHosts !== void 0) entry.linkHosts = feed.linkHosts;
  return entry;
}
function buildServerVariantFeeds() {
  const out = {};
  for (const [edition, categories] of Object.entries(NEWS_CATALOG.layout.server)) {
    const byCategory = {};
    for (const category of categories) {
      byCategory[category] = serverPlacedFeeds(edition, category).map(toServerFeed);
    }
    out[edition] = byCategory;
  }
  return out;
}
function buildServerIntelSources() {
  return serverPlacedFeeds(INTEL_EDITION, INTEL_EDITION).map(toServerFeed);
}

// server/worldmonitor/news/v1/_feeds.ts
function isServerFeedReachableForLanguage(feed, language) {
  return !feed.lang || feed.lang === language || !!feed.strategicDefault;
}
var VARIANT_FEEDS = buildServerVariantFeeds();
var INTEL_SOURCES = buildServerIntelSources();
var SERVER_EDITIONS = Object.keys(NEWS_CATALOG.layout.server);

// server/worldmonitor/news/v1/_rss-cache.ts
function rssFeedCacheKey(variant, url) {
  return `rss:feed:v11:${variant}:${url}`;
}
function resolveMaxAgeMs() {
  const raw = Number.parseInt(process.env.NEWS_MAX_AGE_HOURS ?? "", 10);
  const hours = Number.isInteger(raw) && raw > 0 ? raw : 96;
  return hours * 60 * 60 * 1e3;
}
var FUTURE_DATE_TOLERANCE_MS = 60 * 60 * 1e3;

// server/worldmonitor/news/v1/search-claim-headlines.ts
var POOL_TTL_MS = 12e4;
var pool = null;
function isMultiPublisherFeed(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname === "news.google.com" && !/\bsite:/i.test(parsed.searchParams.get("q") ?? "");
  } catch {
    return false;
  }
}
function poolSource(row, feedName, multiPublisher) {
  if (!multiPublisher || row.originPublisherTrusted !== true || typeof row.originPublisher !== "string") return feedName;
  const origin = row.originPublisher.replace(/\s+/g, " ").trim();
  return origin && origin.length <= 200 ? origin : feedName;
}
function poolItem(value, feedName, multiPublisher, now, cutoff, revoked) {
  if (!value || typeof value !== "object") return null;
  const row = value;
  if (row.source !== feedName || typeof row.title !== "string") return null;
  const source = poolSource(row, feedName, multiPublisher);
  const title = row.title.replace(/\s+/g, " ").trim();
  if (!title || title.length > 1e3) return null;
  if (typeof row.publishedAt !== "number" || !Number.isFinite(row.publishedAt) || row.publishedAt < cutoff || row.publishedAt > now + FUTURE_DATE_TOLERANCE_MS) return null;
  const link = typeof row.link === "string" && /^https?:\/\//i.test(row.link) && row.link.length <= 2048 ? row.link : "";
  if (link && revoked.has(link)) return null;
  return { source, title, link, pubDate: new Date(row.publishedAt), isAlert: false };
}
function cachedRows(entry) {
  if (!entry || typeof entry !== "object" || !("items" in entry) || !Array.isArray(entry.items)) return null;
  return "countryItems" in entry && Array.isArray(entry.countryItems) ? [...entry.items, ...entry.countryItems] : entry.items;
}
function depthTitle(row, title) {
  const origin = row && typeof row === "object" && row.originPublisherTrusted === true ? row.originPublisher : "";
  const suffix = typeof origin === "string" && origin ? ` - ${origin.trim()}` : "";
  return suffix && title.endsWith(suffix) ? title.slice(0, -suffix.length).trim() : title;
}
async function readPool() {
  const feeds = [...Object.values(VARIANT_FEEDS.full ?? {}).flat(), ...INTEL_SOURCES].filter((feed) => isServerFeedReachableForLanguage(feed, "en"));
  const unique = [...new Map(feeds.map((feed) => [rssFeedCacheKey("full", feed.url), feed])).entries()];
  const depthKeys = unique.flatMap(([, feed]) => feed.depthUrl ? [rssFeedCacheKey("full", feed.depthUrl)] : []);
  const now = Date.now();
  const [cached, revoked] = await Promise.all([
    getCachedJsonBatch([...unique.map(([key]) => key), ...depthKeys]),
    readRevokedUrlSet()
  ]);
  if (!revoked.readable) return { items: [], feedsSearched: 0, feedTotal: unique.length, feedCached: 0, readable: false, readAt: now };
  const cutoff = now - resolveMaxAgeMs();
  const items = [];
  const seen = /* @__PURE__ */ new Set();
  let feedCached = 0;
  let feedsSearched = 0;
  for (const [key, feed] of unique) {
    const rows = cachedRows(cached.get(key));
    if (rows) feedCached++;
    const depthRows = feed.depthUrl ? cachedRows(cached.get(rssFeedCacheKey("full", feed.depthUrl))) : null;
    const multiPublisher = isMultiPublisherFeed(feed.url);
    const before = items.length;
    const titles = /* @__PURE__ */ new Set();
    for (const value of rows ?? []) {
      const row = value;
      if (feed.depthUrl && row && row.source === feed.name && typeof row.title === "string") {
        titles.add(row.title.replace(/\s+/g, " ").trim().toLowerCase());
      }
      const item = poolItem(value, feed.name, multiPublisher, now, cutoff, revoked.urls);
      if (!item) continue;
      const dedupe = item.link || `${item.source}|${item.title}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      items.push(item);
    }
    for (const value of depthRows ?? []) {
      const item = poolItem(value, feed.name, false, now, cutoff, revoked.urls);
      if (!item) continue;
      const title = depthTitle(value, item.title);
      if (titles.has(title.toLowerCase())) continue;
      const dedupe = item.link || `${item.source}|${title}`;
      if (seen.has(dedupe)) continue;
      seen.add(dedupe);
      titles.add(title.toLowerCase());
      items.push({ ...item, title });
    }
    if (items.length > before) feedsSearched++;
  }
  return { items, feedsSearched, feedTotal: unique.length, feedCached, readable: true, readAt: now };
}
function loadPool() {
  const now = Date.now();
  if (pool && now - pool.at < POOL_TTL_MS) return pool.promise;
  const promise = readPool();
  pool = { at: now, promise };
  void promise.then(
    (read) => {
      if ((!read.readable || read.items.length === 0) && pool?.promise === promise) pool = null;
    },
    () => {
      if (pool?.promise === promise) pool = null;
    }
  );
  return promise;
}
async function searchClaimPool(claimText) {
  const claim = claimText.trim().slice(0, CLAIM_MAX_CHARS);
  const read = await loadPool();
  const state = !read.readable || read.feedCached === 0 || read.items.length === 0 ? "unavailable" : read.feedCached === read.feedTotal ? "complete" : "partial";
  const searched = state === "unavailable" ? [] : read.items;
  return {
    candidates: claim ? claimCandidates(claim, searched) : [],
    searchedHeadlines: searched.length,
    searchedFeeds: state === "unavailable" ? 0 : read.feedsSearched,
    feedTotal: read.feedTotal,
    feedCached: read.feedCached,
    state,
    readAt: new Date(read.readAt).toISOString()
  };
}

// api/mcp/auth.ts
var import_ratelimit2 = __toESM(require_dist2(), 1);
init_nodejs();

// api/_client-ip.js
var RATE_LIMIT_DEGRADED_HEADERS = Object.freeze({
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

// shared/desktop-key-access.js
function admitsDesktopKeyPrincipal(entitlement, now) {
  if (!entitlement) return false;
  const { features } = entitlement;
  return features.tier >= 1 && entitlement.validUntil >= now && (features.desktopKeyAccess === true || features.apiAccess === true);
}

// api/_user-api-key.js
var ENTITLEMENT_ENV_PREFIX = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live" : "test";
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasCurrentApiAccess(value) {
  if (!value || typeof value !== "object") return false;
  const validUntil = Number(value.validUntil ?? 0);
  return Boolean(value.features?.apiAccess === true && Number.isFinite(validUntil) && validUntil >= Date.now());
}
var API_ACCESS_POLICY = Object.freeze({
  name: "api",
  admits: hasCurrentApiAccess,
  forbiddenError: "API access subscription required",
  lapsedError: "API access subscription lapsed"
});
var DESKTOP_KEY_POLICY = Object.freeze({
  name: "desktop",
  admits: (value) => isPlainObject(value) && isPlainObject(value.features) && admitsDesktopKeyPrincipal(value, Date.now()),
  trustsCachedEntry: (value) => {
    if (!isPlainObject(value) || !isPlainObject(value.features)) return true;
    const validUntil = Number(value.validUntil ?? 0);
    const current = Number.isFinite(validUntil) && validUntil >= Date.now();
    if (!current || !(Number(value.features.tier) >= 1)) return true;
    return value.features.desktopKeyAccess !== void 0;
  },
  forbiddenError: "Pro subscription required",
  lapsedError: "Subscription lapsed"
});

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
var ENV_PREFIX = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live" : "test";
var TIER_GATED_PATHS = new Set(Object.keys(ENDPOINT_ENTITLEMENTS));

// server/_shared/mcp-internal-hmac.ts
var INTERNAL_MCP_SIG_HEADER = "X-WM-MCP-Internal";
var INTERNAL_MCP_USER_ID_HEADER = "X-WM-MCP-User-Id";
var INTERNAL_MCP_NONCE_HEADER = "X-WM-MCP-Nonce";
var INTERNAL_MCP_TIMESTAMP_WINDOW_SECONDS = 30;
var INTERNAL_MCP_REPLAY_CACHE_TTL_SECONDS = 2 * INTERNAL_MCP_TIMESTAMP_WINDOW_SECONDS + 5;
async function sha256Hex3(input) {
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
function makeInternalMcpNonce() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
function isValidInternalMcpNonce(nonce) {
  return /^[A-Za-z0-9_-]{16,128}$/.test(nonce);
}
async function signInternalMcpRequest(args) {
  if (!args.userId) throw new Error("signInternalMcpRequest: userId is required");
  if (!args.secret) throw new Error("signInternalMcpRequest: secret is required");
  const nonce = args.nonce ?? makeInternalMcpNonce();
  if (!isValidInternalMcpNonce(nonce)) throw new Error("signInternalMcpRequest: nonce must be 16-128 URL-safe characters");
  const url = args.url instanceof URL ? args.url : new URL(args.url);
  const ts = Math.floor(args.now ?? Date.now() / 1e3);
  const queryHash = await sha256Hex3(canonicalQueryString(url));
  const bodyHash = await sha256Hex3(await coerceBodyToString(args.body));
  const payload = buildHmacPayload({
    ts,
    method: args.method,
    pathname: url.pathname,
    queryHash,
    bodyHash,
    userId: args.userId,
    nonce
  });
  const sig = await hmacSha256Base64Url(args.secret, payload);
  return { signature: `${ts}.${sig}`, userId: args.userId, nonce, ts };
}
async function coerceBodyToString(body) {
  if (body == null) return "";
  if (typeof body === "string") return body;
  if (body instanceof Uint8Array) return new TextDecoder().decode(body);
  if (body instanceof ArrayBuffer) return new TextDecoder().decode(new Uint8Array(body));
  if (body instanceof URLSearchParams) return body.toString();
  const G = globalThis;
  if (G.Blob && body instanceof G.Blob) {
    throw new Error("signInternalMcpRequest: unsupported body shape (Blob); pre-stringify before signing");
  }
  if (G.FormData && body instanceof G.FormData) {
    throw new Error("signInternalMcpRequest: unsupported body shape (FormData); pre-stringify before signing");
  }
  if (G.ReadableStream && body instanceof G.ReadableStream) {
    throw new Error("signInternalMcpRequest: unsupported body shape (ReadableStream); pre-stringify before signing");
  }
  throw new Error("signInternalMcpRequest: unsupported body shape; pre-stringify before signing");
}
function buildInternalMcpHeaders(signed) {
  return {
    [INTERNAL_MCP_SIG_HEADER]: signed.signature,
    [INTERNAL_MCP_USER_ID_HEADER]: signed.userId,
    [INTERNAL_MCP_NONCE_HEADER]: signed.nonce
  };
}

// shared/company-monitoring-contract.ts
var COMPANY_MONITORING_LIMITS = {
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
var COMPANY_MONITORING_RPC_SCOPES = {
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
var encoder = new TextEncoder();

// server/_shared/user-api-key.ts
var COMPANY_MONITORING_SCOPES = new Set(Object.values(COMPANY_MONITORING_RPC_SCOPES));

// server/_shared/rate-limit.ts
var import_ratelimit = __toESM(require_dist2(), 1);
init_nodejs();

// api/_rate-limit-fallback.js
function durationToSeconds(window) {
  const match = /^(\d+)\s?(ms|s|m|h|d)$/.exec(window);
  if (!match) throw new Error(`Unable to parse rate-limit window: ${window}`);
  const value = Number(match[1]);
  const unit = match[2] ?? "s";
  const unitSeconds = { ms: 1e-3, s: 1, m: 60, h: 3600, d: 86400 };
  return Math.max(1, Math.ceil(value * (unitSeconds[unit] ?? 1)));
}

// server/_shared/rate-limit.ts
var REDIS_TEST_RETRY_OPTS = process.env.NODE_TEST_CONTEXT ? { retry: false } : {};
var ENDPOINT_RATE_LIMIT_TIMEOUT_MS = process.env.NODE_TEST_CONTEXT ? 250 : 5e3;
var ENDPOINT_REDIS_ABORT_TIMEOUT_MS = process.env.NODE_TEST_CONTEXT ? 20 : 4500;
var __ENDPOINT_LIMITER_DEADLINES_FOR_TEST = Object.freeze({
  decisionMs: ENDPOINT_RATE_LIMIT_TIMEOUT_MS,
  abortMs: ENDPOINT_REDIS_ABORT_TIMEOUT_MS
});
var GLOBAL_RATE_WINDOW = "60 s";
var GLOBAL_RATE_WINDOW_SECONDS = durationToSeconds(GLOBAL_RATE_WINDOW);
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

// api/mcp/telemetry.ts
var MCP_TOOLCALL_TELEMETRY_KEYS = Object.freeze([
  "tag",
  "ts",
  "tool",
  "auth_kind",
  "user_id",
  "latency_ms",
  "bytes_pre_jmespath",
  "bytes_post_jmespath",
  "jmespath_used",
  "jmespath_failed",
  "ok",
  "error_kind",
  "budget_exceeded"
]);
var MCP_TOOLS_LIST_TELEMETRY_KEYS = Object.freeze([
  "tag",
  "ts",
  "auth_kind",
  "user_id",
  "tools_array_bytes",
  "tool_count",
  "client_user_agent",
  // MCP `initialize` params.clientInfo.name (bounded, printable ASCII) and its
  // AI client bucket from shared/agent-client-source.js. Software identity
  // only, never request content: counts MCP connections by client.
  "client_name",
  "client_source"
]);
var MCP_RATE_LIMIT_HIT_TELEMETRY_KEYS = Object.freeze([
  "tag",
  "ts",
  "auth_kind",
  "user_id",
  "principal_id",
  "dimension",
  "limit",
  "window_seconds"
]);
var MCP_DOWNSTREAM_TELEMETRY_KEYS = Object.freeze([
  "tag",
  "ts",
  "tool",
  "auth_kind",
  "inbound_host_class",
  "downstream_origin",
  "downstream_operation",
  "status",
  "ok",
  "error_code",
  "response_marker"
]);

// api/mcp/upgrade-constants.ts
var FREE_ACCOUNT_IDLE_GAP_MS = 15 * 60 * 1e3;

// shared/mcp-attribution.ts
var MCP_UPGRADE_UTM_SOURCE = "mcp";
var MCP_UPGRADE_UTM_MEDIUM = "agent";
var MCP_UPGRADE_UTM_CAMPAIGN = "mcp-paid-funnel";
var MCP_UPGRADE_URL = `https://worldmonitor.app/pro?utm_source=${MCP_UPGRADE_UTM_SOURCE}&utm_medium=${MCP_UPGRADE_UTM_MEDIUM}&utm_campaign=${MCP_UPGRADE_UTM_CAMPAIGN}`;

// shared/product-catalog.generated.json
var product_catalog_generated_default = {
  _generated: "scripts/generate-public-product-facts.mjs \u2014 do not edit by hand; run `npm run product:facts`",
  facts: {
    _generated: "scripts/generate-public-product-facts.mjs \u2014 do not edit by hand; run `npm run product:facts`",
    product: {
      name: "World Monitor",
      lifecycle: "launched",
      canonicalUrl: "https://www.worldmonitor.app/",
      pricingUrl: "https://www.worldmonitor.app/pro#pricing",
      primaryCtaLabel: "View Pro plans"
    },
    currency: "USD",
    plans: [
      {
        planKey: "free",
        name: "Free",
        tierGroup: "free",
        billingPeriod: "none",
        billingDuration: null,
        price: 0,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: false,
        selfServe: false,
        dashboardAiCallsPerDay: 0,
        description: "Core dashboard panels, Global news feed, Earthquake & weather alerts, Basic map view, 3 dashboard tabs"
      },
      {
        planKey: "pro_monthly",
        name: "Pro Monthly",
        tierGroup: "pro",
        billingPeriod: "monthly",
        billingDuration: "P1M",
        price: 39.99,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: true,
        selfServe: true,
        dashboardAiCallsPerDay: 500,
        description: "Everything in Free \u2014 panels, sources & followed countries uncapped, WM Analyst chat + AI stock analysis & backtesting, Cost-shock modelling & supply-chain stress tests, Intel memory \u2014 historical search, timelines & similar events, Physical metals divergence, minerals concentration & sovereign debt data, Scheduled AI digest + alert rules engine, MCP + SDK access for Claude Desktop & other AI clients (50 calls/day), Custom widgets & 10 dashboards (vs 3), Desktop key for the desktop app (2 keys), Personal license, 1 named user"
      },
      {
        planKey: "pro_annual",
        name: "Pro Annual",
        tierGroup: "pro",
        billingPeriod: "annual",
        billingDuration: "P1Y",
        price: 359.99,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: true,
        selfServe: true,
        dashboardAiCallsPerDay: 500,
        description: ""
      },
      {
        planKey: "pro_business_monthly",
        name: "Pro Business Monthly",
        tierGroup: "pro_business",
        billingPeriod: "monthly",
        billingDuration: "P1M",
        price: 49.99,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: true,
        selfServe: true,
        dashboardAiCallsPerDay: 2500,
        description: "Everything in Pro, Use for client work, internal tools & reporting, Data export \u2014 CSV, JSON & PDF reports, 25 custom dashboards (vs 10), MCP + SDK: 250 calls/day (vs 50), Desktop key for the desktop app (3 keys), Priority support, Commercial license included, 1 named user \u2014 not a shared login"
      },
      {
        planKey: "pro_business_annual",
        name: "Pro Business Annual",
        tierGroup: "pro_business",
        billingPeriod: "annual",
        billingDuration: "P1Y",
        price: 449.99,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: true,
        selfServe: true,
        dashboardAiCallsPerDay: 2500,
        description: ""
      },
      {
        planKey: "api_starter",
        name: "API Starter Monthly",
        tierGroup: "api_starter",
        billingPeriod: "monthly",
        billingDuration: "P1M",
        price: 99.99,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: true,
        selfServe: true,
        dashboardAiCallsPerDay: 1e3,
        description: "REST API + official SDKs (npm, PyPI, RubyGems, Go), License / API key included, Real-time data streams, 60 requests/minute, 1,000 requests/day included (REST + MCP combined; a live MCP call counts as 2-3), Webhook notifications, Commercial license \u2014 for your organization"
      },
      {
        planKey: "api_starter_annual",
        name: "API Starter Annual",
        tierGroup: "api_starter",
        billingPeriod: "annual",
        billingDuration: "P1Y",
        price: 899.99,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: true,
        selfServe: true,
        dashboardAiCallsPerDay: 1e3,
        description: ""
      },
      {
        planKey: "api_business",
        name: "API Business",
        tierGroup: "api_business",
        billingPeriod: "monthly",
        billingDuration: "P1M",
        price: 299.99,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: true,
        selfServe: true,
        dashboardAiCallsPerDay: 1e4,
        description: "Everything in API Starter, R1\u2013R3 redistribution rights for customer-facing products, 300 requests/minute, 10,000 requests/day included (REST + MCP combined; a live MCP call counts as 2-3), 5 Pro licenses \u2014 invite users at any corporate email domain, Priority support, Commercial license \u2014 for your customers"
      },
      {
        planKey: "api_business_annual",
        name: "API Business Annual",
        tierGroup: "api_business",
        billingPeriod: "annual",
        billingDuration: "P1Y",
        price: 2699.99,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: true,
        selfServe: true,
        dashboardAiCallsPerDay: 1e4,
        description: ""
      },
      {
        planKey: "enterprise",
        name: "Enterprise",
        tierGroup: "enterprise",
        billingPeriod: "none",
        billingDuration: null,
        price: null,
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: "https://www.worldmonitor.app/pro#pricing",
        currentForCheckout: false,
        selfServe: false,
        dashboardAiCallsPerDay: 25e3,
        description: "Everything in Pro + API, Unlimited API requests, Dedicated support, Custom integrations, SLA guarantee, On-premise option, Data processing agreement (DPA), Purchase-order billing, SAML SSO, SCIM, Custom security and privacy settings, Fully white-labeled \u2014 with or without revenue sharing"
      }
    ],
    heroProofStats: {
      mapLayers: 59,
      feeds: 468,
      providers: 802,
      alertOrigins: 5
    },
    depthProofStats: {
      mapLayers: 59,
      feeds: 468,
      providers: 802,
      alertOrigins: 5,
      chokepoints: 13,
      instabilityCountries: 31,
      resilienceRanked: 170,
      submarineCables: 98,
      pipelinesLng: 159,
      aiDatacenters: 313,
      hotspots: 29,
      stockExchanges: 29,
      mcpTools: 99,
      commands: 623,
      languages: 28
    },
    resilienceCoverage: {
      ranked: 170,
      universe: 196
    }
  },
  products: {
    pdt_0Nbtt71uObulf7fGXhQup: {
      planKey: "pro_monthly",
      tierGroup: "pro",
      billingPeriod: "monthly"
    },
    pdt_0NbttMIfjLWC10jHQWYgJ: {
      planKey: "pro_annual",
      tierGroup: "pro",
      billingPeriod: "annual"
    },
    pdt_0NjyFDbhURh2oROgPIU3G: {
      planKey: "pro_business_monthly",
      tierGroup: "pro_business",
      billingPeriod: "monthly"
    },
    pdt_0Nk072fxPUcHWivZRtlQW: {
      planKey: "pro_business_annual",
      tierGroup: "pro_business",
      billingPeriod: "annual"
    },
    pdt_0NbttVmG1SERrxhygbbUq: {
      planKey: "api_starter",
      tierGroup: "api_starter",
      billingPeriod: "monthly"
    },
    pdt_0Nbu2lawHYE3dv2THgSEV: {
      planKey: "api_starter_annual",
      tierGroup: "api_starter",
      billingPeriod: "annual"
    },
    pdt_0Nbttg7NuOJrhbyBGCius: {
      planKey: "api_business",
      tierGroup: "api_business",
      billingPeriod: "monthly"
    },
    pdt_0NkHjzMhGp3m45sZLQ7BQ: {
      planKey: "api_business_annual",
      tierGroup: "api_business",
      billingPeriod: "annual"
    },
    pdt_0Nbttnqrfh51cRqhMdVLx: {
      planKey: "enterprise",
      tierGroup: "enterprise",
      billingPeriod: "none"
    }
  },
  tierConfig: {
    free: {
      name: "Free",
      localeKey: "free",
      description: "Get started with the essentials",
      features: [
        "Core dashboard panels",
        "Global news feed",
        "Earthquake & weather alerts",
        "Basic map view",
        "3 dashboard tabs"
      ],
      planLimits: {
        apiRequestsPerDay: 0,
        apiBurstRequestsPerMinute: 0,
        mcpCallsPerDay: 0,
        dashboardAiCallsPerDay: 0,
        mcpBurstRequestsPerMinute: 0,
        desktopKeyRequestsPerDay: 0,
        desktopKeyBurstPerMinute: 0,
        mcpDailyBudgetSharedWithRest: false
      },
      cta: "Get Started",
      href: "https://worldmonitor.app/dashboard",
      highlighted: false
    },
    pro: {
      name: "Pro",
      localeKey: "pro",
      description: "Full intelligence dashboard",
      features: [
        "Everything in Free \u2014 panels, sources & followed countries uncapped",
        "WM Analyst chat + AI stock analysis & backtesting",
        "Cost-shock modelling & supply-chain stress tests",
        "Intel memory \u2014 historical search, timelines & similar events",
        "Physical metals divergence, minerals concentration & sovereign debt data",
        "Scheduled AI digest + alert rules engine",
        "MCP + SDK access for Claude Desktop & other AI clients (50 calls/day)",
        "Custom widgets & 10 dashboards (vs 3)",
        "Desktop key for the desktop app (2 keys)"
      ],
      highlightFeatures: [
        "Personal license",
        "1 named user"
      ],
      planLimits: {
        apiRequestsPerDay: 0,
        apiBurstRequestsPerMinute: 0,
        mcpCallsPerDay: 50,
        dashboardAiCallsPerDay: 500,
        mcpBurstRequestsPerMinute: 60,
        desktopKeyRequestsPerDay: 7500,
        desktopKeyBurstPerMinute: 120,
        mcpDailyBudgetSharedWithRest: false
      },
      highlighted: true
    },
    pro_business: {
      name: "Pro Business",
      localeKey: "proBusiness",
      description: "The Pro dashboard, licensed for work",
      features: [
        "Everything in Pro",
        "Use for client work, internal tools & reporting",
        "Data export \u2014 CSV, JSON & PDF reports",
        "25 custom dashboards (vs 10)",
        "MCP + SDK: 250 calls/day (vs 50)",
        "Desktop key for the desktop app (3 keys)",
        "Priority support"
      ],
      highlightFeatures: [
        "Commercial license included",
        "1 named user \u2014 not a shared login"
      ],
      planLimits: {
        apiRequestsPerDay: 0,
        apiBurstRequestsPerMinute: 0,
        mcpCallsPerDay: 250,
        dashboardAiCallsPerDay: 2500,
        mcpBurstRequestsPerMinute: 60,
        desktopKeyRequestsPerDay: 7500,
        desktopKeyBurstPerMinute: 120,
        mcpDailyBudgetSharedWithRest: false
      },
      highlighted: false
    },
    api_starter: {
      name: "API Starter",
      localeKey: "api",
      description: "Build internal tools on live intelligence data",
      features: [
        "REST API + official SDKs (npm, PyPI, RubyGems, Go)",
        "License / API key included",
        "Real-time data streams",
        "60 requests/minute",
        "1,000 requests/day included (REST + MCP combined; a live MCP call counts as 2-3)",
        "Webhook notifications"
      ],
      highlightFeatures: [
        "Commercial license \u2014 for your organization"
      ],
      planLimits: {
        apiRequestsPerDay: 1e3,
        apiBurstRequestsPerMinute: 60,
        mcpCallsPerDay: 1e3,
        dashboardAiCallsPerDay: 1e3,
        mcpBurstRequestsPerMinute: 60,
        desktopKeyRequestsPerDay: 0,
        desktopKeyBurstPerMinute: 0,
        mcpDailyBudgetSharedWithRest: true
      },
      highlighted: false
    },
    api_business: {
      name: "API Business",
      localeKey: "apiBusiness",
      description: "Launch your own product on WorldMonitor data",
      features: [
        "Everything in API Starter",
        "R1\u2013R3 redistribution rights for customer-facing products",
        "300 requests/minute",
        "10,000 requests/day included (REST + MCP combined; a live MCP call counts as 2-3)",
        "5 Pro licenses \u2014 invite users at any corporate email domain",
        "Priority support"
      ],
      highlightFeatures: [
        "Commercial license \u2014 for your customers"
      ],
      planLimits: {
        apiRequestsPerDay: 1e4,
        apiBurstRequestsPerMinute: 300,
        mcpCallsPerDay: 1e4,
        dashboardAiCallsPerDay: 1e4,
        mcpBurstRequestsPerMinute: 300,
        desktopKeyRequestsPerDay: 0,
        desktopKeyBurstPerMinute: 0,
        mcpDailyBudgetSharedWithRest: true
      },
      highlighted: false
    },
    enterprise: {
      name: "Enterprise",
      localeKey: "enterprise",
      description: "Custom solutions for organizations",
      features: [
        "Everything in Pro + API",
        "Unlimited API requests",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
        "On-premise option",
        "Data processing agreement (DPA)",
        "Purchase-order billing",
        "SAML SSO, SCIM",
        "Custom security and privacy settings",
        "Fully white-labeled \u2014 with or without revenue sharing"
      ],
      planLimits: {
        apiRequestsPerDay: 1e5,
        apiBurstRequestsPerMinute: 1e3,
        mcpCallsPerDay: 25e3,
        dashboardAiCallsPerDay: 25e3,
        mcpBurstRequestsPerMinute: 1e3,
        desktopKeyRequestsPerDay: 0,
        desktopKeyBurstPerMinute: 0,
        mcpDailyBudgetSharedWithRest: false
      },
      cta: "Contact Sales",
      href: "mailto:enterprise@worldmonitor.app",
      highlighted: false
    }
  },
  publicTierGroups: [
    "free",
    "pro",
    "pro_business",
    "api_starter",
    "api_business",
    "enterprise"
  ],
  fallbackPrices: {
    pdt_0Nbtt71uObulf7fGXhQup: 3999,
    pdt_0NbttMIfjLWC10jHQWYgJ: 35999,
    pdt_0NjyFDbhURh2oROgPIU3G: 4999,
    pdt_0Nk072fxPUcHWivZRtlQW: 44999,
    pdt_0NbttVmG1SERrxhygbbUq: 9999,
    pdt_0Nbu2lawHYE3dv2THgSEV: 89999,
    pdt_0Nbttg7NuOJrhbyBGCius: 29999,
    pdt_0NkHjzMhGp3m45sZLQ7BQ: 269999
  }
};

// api/mcp/checkout.ts
var PLANS = product_catalog_generated_default.facts.plans;
var PRODUCTS = product_catalog_generated_default.products;
var MCP_CHECKOUT_PLANS = PLANS.filter((plan) => plan.selfServe && plan.currentForCheckout).map((plan) => plan.planKey);

// api/mcp/auth.ts
async function buildAuthHeaders(context, method, url, body) {
  if (context.kind === "env_key") {
    return { "X-WorldMonitor-Key": context.apiKey };
  }
  if (context.kind === "free") {
    throw new Error("buildAuthHeaders: free-tier context has no credentials \u2014 a free-tier tool must not call a credentialed downstream");
  }
  const secret = process.env.MCP_INTERNAL_HMAC_SECRET ?? "";
  if (!secret) {
    throw new Error("MCP_INTERNAL_HMAC_SECRET not configured");
  }
  const signed = await signInternalMcpRequest({
    method,
    url,
    body,
    userId: context.userId,
    secret
  });
  return buildInternalMcpHeaders(signed);
}

// api/mcp/bounded-body.ts
async function readBoundedResponseText(response, maxBytes) {
  const reader = response.body?.getReader();
  if (!reader) {
    const text2 = typeof response.text === "function" ? await response.text().catch(() => "") : "";
    return text2.slice(0, maxBytes);
  }
  const decoder = new TextDecoder();
  let bytesRead = 0;
  let text = "";
  try {
    while (bytesRead < maxBytes) {
      const { done, value } = await reader.read();
      if (done || !value) break;
      const remaining = maxBytes - bytesRead;
      const chunk = value.byteLength > remaining ? value.subarray(0, remaining) : value;
      text += decoder.decode(chunk, { stream: bytesRead + chunk.byteLength < maxBytes });
      bytesRead += chunk.byteLength;
      if (chunk.byteLength < value.byteLength) break;
    }
    text += decoder.decode();
    return text;
  } catch {
    return "";
  } finally {
    await reader.cancel().catch(() => {
    });
  }
}

// api/mcp/billing-denial.ts
var BILLING_VERIFICATION_CODES = /* @__PURE__ */ new Set([
  "subscription_lapsed",
  "renewal_verification_pending",
  "renewal_verification_failed",
  "entitlement_verification_unavailable"
]);
var BillingDenialError = class extends Error {
  operation;
  status;
  billingCode;
  retryAfterSeconds;
  constructor(label, status, billingCode, retryAfterSeconds) {
    super(`${label} HTTP ${status} (${billingCode})`);
    this.name = "BillingDenialError";
    this.operation = label;
    this.status = status;
    this.billingCode = billingCode;
    this.retryAfterSeconds = retryAfterSeconds;
  }
};
var ToolBackoffError = class extends Error {
  constructor(status, retryAfter, label) {
    super(`${label} HTTP ${status}`);
    this.status = status;
    this.retryAfter = retryAfter;
    this.name = "ToolBackoffError";
  }
  status;
  retryAfter;
};
var MAX_VALIDATION_BODY_BYTES = 16384;
var MAX_VALIDATION_VIOLATIONS = 8;
var MAX_VIOLATION_FIELD_LEN = 64;
var MAX_VIOLATION_DESCRIPTION_LEN = 200;
var SAFE_VIOLATION_FIELD = /^[A-Za-z_][A-Za-z0-9_.]{0,63}$/;
var UNSAFE_VIOLATION_DESCRIPTION = /[<>]|authorization\s*:|bearer\s/i;
var RpcValidationError = class extends Error {
  operation;
  status;
  violations;
  constructor(label, violations) {
    super(`${label} HTTP 400`);
    this.name = "RpcValidationError";
    this.operation = label;
    this.status = 400;
    this.violations = violations;
  }
};
function throwIfBillingDenial(response, label) {
  if (response.ok) return;
  const marker = response.headers?.get("X-Billing-Verification");
  if (!marker || !BILLING_VERIFICATION_CODES.has(marker)) return;
  const retryHeader = response.headers?.get("Retry-After");
  const rawRetryAfter = retryHeader == null ? Number.NaN : Number(retryHeader);
  throw new BillingDenialError(
    label,
    response.status,
    marker,
    Number.isFinite(rawRetryAfter) ? rawRetryAfter : void 0
  );
}
function sanitizeViolationField(value) {
  if (typeof value !== "string") return null;
  const field = value.trim().slice(0, MAX_VIOLATION_FIELD_LEN);
  return SAFE_VIOLATION_FIELD.test(field) ? field : null;
}
function sanitizeViolationDescription(value) {
  if (typeof value !== "string") return null;
  const description = value.replace(/\s+/g, " ").trim().slice(0, MAX_VIOLATION_DESCRIPTION_LEN);
  if (!description || UNSAFE_VIOLATION_DESCRIPTION.test(description)) return null;
  return description;
}
function parseSafeRpcViolations(parsed) {
  if (!parsed || typeof parsed !== "object" || !("violations" in parsed)) return [];
  const raw = parsed.violations;
  if (!Array.isArray(raw)) return [];
  const violations = [];
  for (const item of raw) {
    if (violations.length >= MAX_VALIDATION_VIOLATIONS) break;
    if (!item || typeof item !== "object") continue;
    const record = item;
    const field = sanitizeViolationField(record.field);
    const description = sanitizeViolationDescription(record.description);
    if (!field || !description) continue;
    violations.push({ field, description });
  }
  return violations;
}
async function extractSafeRpcViolations(response) {
  const type = (response.headers?.get("Content-Type") ?? "").toLowerCase();
  if (type.includes("html")) return [];
  const detail = await readBoundedResponseText(response, MAX_VALIDATION_BODY_BYTES);
  if (!detail) return [];
  try {
    return parseSafeRpcViolations(JSON.parse(detail));
  } catch {
    return [];
  }
}
async function assertToolFetchOk(response, label, { preserveBackoff = false } = {}) {
  if (response.ok) return;
  throwIfBillingDenial(response, label);
  if (response.status === 401) {
    const detail = await readBoundedResponseText(response, 4096);
    let signatureRejected = false;
    try {
      const body = JSON.parse(detail);
      signatureRejected = (body?.code ?? body?.error) === "invalid_internal_mcp_signature";
    } catch {
    }
    if (signatureRejected) {
      throw new Error(`${label} HTTP 401: invalid_internal_mcp_signature`);
    }
  }
  if (preserveBackoff && (response.status === 429 || response.status === 503)) {
    throw new ToolBackoffError(response.status, response.headers?.get("Retry-After") ?? null, label);
  }
  if (response.status === 400) {
    const violations = await extractSafeRpcViolations(response);
    if (violations.length > 0) {
      throw new RpcValidationError(label, violations);
    }
  }
  throw new Error(`${label} HTTP ${response.status}`);
}

// api/mcp/downstream.ts
function isLoopbackHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}
function buildMcpDownstreamHeaders(targetUrl, execution, headers) {
  if (execution?.inboundHostClass !== "local") return headers;
  let target;
  let expected;
  try {
    target = new URL(targetUrl);
    expected = new URL(execution.downstreamOrigin);
  } catch {
    return headers;
  }
  if (target.origin !== expected.origin || !isLoopbackHostname(target.hostname)) return headers;
  const token = process.env.LOCAL_API_TOKEN?.trim();
  if (!token) return headers;
  return { ...headers, "X-WorldMonitor-Local-Token": token };
}
function fetchMcpDownstream(url, init, execution) {
  const headers = buildMcpDownstreamHeaders(url, execution, init.headers);
  return globalThis.fetch(url, {
    ...init,
    headers,
    // Custom transport headers survive cross-origin redirects in fetch.
    ...new Headers(headers).has("X-WorldMonitor-Local-Token") ? { redirect: "error" } : {}
  });
}

// api/mcp/filters.ts
function argStrList(v) {
  const raw = Array.isArray(v) ? v : v == null || v === "" ? [] : [v];
  return raw.map((x) => String(x).toLowerCase().trim()).filter(Boolean);
}
function argStr(v) {
  return typeof v === "string" ? v.toLowerCase().trim() : "";
}
function ciIncludes(hay, needle) {
  return typeof hay === "string" && hay.toLowerCase().includes(needle);
}

// api/mcp/source-unavailable.ts
var McpSourceUnavailableError = class extends Error {
  unavailableInputs;
  failedInputs;
  constructor(message, unavailableInputs, failedInputs) {
    super(message);
    this.name = "McpSourceUnavailableError";
    this.unavailableInputs = [...unavailableInputs];
    this.failedInputs = [...failedInputs];
  }
};

// api/mcp/registry/nlp-tools.ts
var CLASSIFY_TEXT_MAX_CHARS = 500;
var CLASSIFY_CATEGORIES = [
  "conflict",
  "protest",
  "disaster",
  "diplomatic",
  "economic",
  "terrorism",
  "cyber",
  "health",
  "environmental",
  "military",
  "crime",
  "infrastructure",
  "tech",
  "general"
];
var CLASSIFY_LEVELS = ["critical", "high", "medium", "low", "info"];
var CLASSIFY_SEVERITIES = [
  "SEVERITY_LEVEL_HIGH",
  "SEVERITY_LEVEL_MEDIUM",
  "SEVERITY_LEVEL_LOW"
];
var EXTRACT_TEXT_MAX_CHARS = 2048;
var NLP_DIGEST_TIMEOUT_MS = 6e3;
var NLP_UA = "worldmonitor-mcp-edge/1.0";
async function factCheckBlock(claim) {
  const { state, factChecks } = await lookupFactChecks(claim);
  return { state, label: FACT_CHECK_LABEL, caveat: FACT_CHECK_CAVEAT, items: factChecks };
}
var NLP_DIGEST_SOURCE_MAX_BYTES = 160;
var NLP_DIGEST_TITLE_MAX_BYTES = 512;
var NLP_DIGEST_LINK_MAX_BYTES = 2048;
var NLP_DIGEST_SNIPPET_MAX_BYTES = 2048;
var NLP_DIGEST_METADATA_MAX_BYTES = 64;
var NLP_DIGEST_NOTE_MAX_BYTES = 2048;
var KEYWORD_SPIKE_BASELINE_MS = 48 * 60 * 60 * 1e3;
var KEYWORD_SPIKE_CACHE_TTL_S = 600;
var KEYWORD_SPIKE_MAX_STORIES = 800;
var KEYWORD_SPIKE_MAX_STORED = 25;
var KEYWORD_SPIKE_LINK_MAX_BYTES = 384;
var DIGEST_ACCUMULATOR_KEY_MCP = "digest:accumulator:v1:full:en";
var NLP_DIGEST_VARIANTS = ["full", "tech"];
var NEWS_EDITIONS = Object.keys(NEWS_POOL_LAYOUT.editions);
var ALL_DIGEST_CATEGORIES = [...new Set(Object.values(NEWS_POOL_LAYOUT.editions).flat())];
var NEWS_LANGUAGE_LIMIT = 8;
var DIGEST_CATEGORY_DESC = "Restrict to one category of the selected editions. " + Object.entries(NEWS_POOL_LAYOUT.editions).map(([edition, categories]) => `${edition}: ${categories.join(", ")}`).join("; ") + ". Echoed as `category` in the result; an unknown value yields headlineCount 0 and a `note` listing categories present in the current digest.";
var NEWS_SCOPE_INPUT_PROPERTIES = {
  languages: {
    type: "array",
    items: { type: "string", enum: [...NEWS_POOL_LAYOUT.languages] },
    maxItems: NEWS_LANGUAGE_LIMIT,
    uniqueItems: true,
    description: `Content languages to read (ISO 639-1), up to ${NEWS_LANGUAGE_LIMIT}. Defaults to ["en"]. Each language is processed on its own and titles stay untranslated.`
  },
  editions: {
    type: "array",
    items: { type: "string", enum: NEWS_EDITIONS },
    maxItems: NEWS_EDITIONS.length,
    uniqueItems: true,
    description: 'Digest editions to read. Defaults to ["full"]; overrides variant.'
  }
};
var NEWS_SCOPE_OUTPUT_PROPERTIES = {
  languages: { type: "array", items: { type: "string" }, description: "Applied languages; present when languages or editions were passed." },
  editions: { type: "array", items: { type: "string" }, description: "Applied editions; present when languages or editions were passed." },
  poolCoverage: {
    type: "object",
    description: "Present on reads beyond one English edition. state is complete, partial (some sources were not cached; never read partial as quiet), stale or unavailable; cells lists each edition and language read.",
    properties: {
      state: { type: "string", enum: ["complete", "partial", "stale", "unavailable"] },
      cells: {
        type: "array",
        items: {
          type: "object",
          properties: {
            edition: { type: "string" },
            language: { type: "string" },
            state: { type: "string", enum: ["complete", "partial", "stale", "missing"] },
            items: { type: "number" },
            staleAgeSeconds: { type: "number" }
          }
        }
      }
    }
  }
};
var SOURCE_PROVENANCE_REQUIRED = [
  "risk",
  "type",
  "riskDeclared",
  "typeDeclared",
  "riskReviewed",
  "typeReviewed",
  "knownBiases",
  "summary",
  ...OUTLET_PROFILE_REQUIRED
];
var SOURCE_PROVENANCE_PROPERTIES = {
  risk: { type: "string" },
  type: { type: "string" },
  riskDeclared: { type: "boolean" },
  typeDeclared: { type: "boolean" },
  riskReviewed: { type: "boolean" },
  typeReviewed: { type: "boolean" },
  stateAffiliated: { type: "string" },
  note: { type: "string" },
  knownBiases: {
    type: "array",
    items: { type: "string" },
    description: "Curated perspective labels. Recorded for few sources: empty means not assessed, not neutral."
  },
  summary: { type: "string", description: 'Every provenance fact as short fixed-order clauses in one string; includes "Perspective: none recorded." when no label exists.' },
  ...OUTLET_PROFILE_OUTPUT_PROPERTIES
};
function nlpTruncateUtf8(value, maxBytes) {
  let bytes = 0;
  let end = 0;
  for (const character of value) {
    const codePoint = character.codePointAt(0);
    const characterBytes = codePoint <= 127 ? 1 : codePoint <= 2047 ? 2 : codePoint <= 65535 ? 3 : 4;
    if (bytes + characterBytes > maxBytes) break;
    bytes += characterBytes;
    end += character.length;
  }
  return end === value.length ? value : value.slice(0, end);
}
function nlpClampInt(value, min, max, fallback) {
  return Number.isInteger(value) ? Math.min(max, Math.max(min, value)) : fallback;
}
function patternEntityKind(value) {
  if (/^cve-/i.test(value)) return "cve";
  if (/^apt\d+$/i.test(value)) return "apt";
  if (/^fin\d+$/i.test(value)) return "fin";
  return "leader";
}
var NLP_DIGEST_COVERAGE_STATES = ["complete", "partial", "stale", "unavailable"];
var NLP_DIGEST_COVERAGE_OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "state",
    "servedItems",
    "servedPublishers",
    "feedsCompleted",
    "feedsTotal",
    "categoriesCompleted",
    "categoriesTotal",
    "missingCategories",
    "stale",
    "staleAgeSeconds",
    "staleReason"
  ],
  properties: {
    state: {
      type: "string",
      enum: [...NLP_DIGEST_COVERAGE_STATES],
      description: "Coverage state for the digest attempt: complete, partial, stale, or unavailable."
    },
    servedItems: { type: "integer", minimum: 0, description: "Headlines served in this response." },
    servedPublishers: { type: "integer", minimum: 0, description: "Distinct normalized publishers served." },
    feedsCompleted: { type: "integer", minimum: 0 },
    feedsTotal: { type: "integer", minimum: 0 },
    categoriesCompleted: { type: "integer", minimum: 0 },
    categoriesTotal: { type: "integer", minimum: 0 },
    missingCategories: {
      type: "array",
      maxItems: 12,
      items: { type: "string" },
      description: "Digest categories that did not complete in the current attempt."
    },
    stale: { type: "boolean", description: "True when the response serves retained content from an earlier attempt." },
    staleAgeSeconds: {
      type: "integer",
      minimum: 0,
      description: "Age of the replayed content since acceptance, in seconds. 0 when the digest is fresh."
    },
    staleReason: {
      type: "string",
      description: "Why retained content is served: empty-rebuild, build-error, or gate-held. Empty when fresh."
    }
  }
};
function isPoolScope(scope) {
  return scope.editions.length > 1 || scope.languages.length !== 1 || scope.languages[0] !== "en";
}
function resolveNlpNewsScope(params) {
  const languages = [...new Set(argStrList(params.languages))].sort();
  const editions = [...new Set(argStrList(params.editions))];
  if (languages.length > NEWS_LANGUAGE_LIMIT || languages.some((lang) => !NEWS_POOL_LAYOUT.languages.includes(lang))) {
    return { error: `languages must be at most ${NEWS_LANGUAGE_LIMIT} of: ${NEWS_POOL_LAYOUT.languages.join(", ")}` };
  }
  if (editions.some((edition) => !NEWS_EDITIONS.includes(edition))) {
    return { error: `editions must be from: ${NEWS_EDITIONS.join(", ")}` };
  }
  const variant = resolveNlpDigestVariant(params.variant);
  if (!variant) return { error: `variant must be one of: ${NLP_DIGEST_VARIANTS.join(", ")}` };
  if (editions.length > 0 && params.variant !== void 0 && (editions.length !== 1 || editions[0] !== variant)) {
    return { error: "pass editions or variant, not both" };
  }
  return {
    languages: languages.length > 0 ? languages : ["en"],
    editions: editions.length > 0 ? NEWS_EDITIONS.filter((edition) => editions.includes(edition)) : [variant],
    echo: languages.length > 0 || editions.length > 0
  };
}
function nlpScopeEcho(scope, fetched) {
  return {
    ...scope.echo ? { languages: scope.languages, editions: scope.editions } : {},
    ...fetched.poolCoverage ? { poolCoverage: fetched.poolCoverage } : {}
  };
}
async function fetchNlpNewsItems(base, context, scope, category, execution) {
  const pool2 = isPoolScope(scope);
  const scopeCategories = [...new Set(scope.editions.flatMap((edition) => NEWS_POOL_LAYOUT.editions[edition] ?? []))];
  if (pool2 && category && !scopeCategories.includes(category)) {
    return {
      items: [],
      generatedAt: "",
      variant: null,
      category,
      note: nlpTruncateUtf8(`Unknown digest category "${category}". Available: ${scopeCategories.join(", ")}.`, NLP_DIGEST_NOTE_MAX_BYTES)
    };
  }
  const query = new URLSearchParams();
  if (pool2) {
    for (const lang of scope.languages) query.append("languages", lang);
    for (const edition of scope.editions) query.append("editions", edition);
    if (category) query.set("category", category);
  } else {
    query.set("variant", scope.editions[0]);
    query.set("lang", "en");
  }
  const path = pool2 ? "list-news-pool" : "list-feed-digest";
  const url = `${base}/api/news/v1/${path}?${query}`;
  const auth = await buildAuthHeaders(context, "GET", url, null);
  const res = await fetchMcpDownstream(url, {
    headers: { ...auth, "User-Agent": NLP_UA },
    signal: AbortSignal.timeout(NLP_DIGEST_TIMEOUT_MS)
  }, execution);
  await assertToolFetchOk(res, path);
  return pool2 ? nlpPoolFetch(await res.json(), category) : nlpDigestFetch(await res.json(), scope.editions[0], category);
}
function toNlpNewsItem(raw) {
  return {
    source: nlpTruncateUtf8(raw.source, NLP_DIGEST_SOURCE_MAX_BYTES),
    title: nlpTruncateUtf8(raw.title, NLP_DIGEST_TITLE_MAX_BYTES),
    // #9095: without the lead, same-copy detection cannot merge reprints and
    // max(seen, reported) restores the count the digest already lowered.
    ...typeof raw.snippet === "string" && raw.snippet.trim() !== "" ? { snippet: nlpTruncateUtf8(raw.snippet, NLP_DIGEST_SNIPPET_MAX_BYTES) } : {},
    link: nlpTruncateUtf8(raw.link ?? "", NLP_DIGEST_LINK_MAX_BYTES),
    pubDate: new Date(Number(raw.publishedAt) || 0),
    isAlert: raw.isAlert === true,
    credibilityScore: Number.isFinite(raw.credibilityScore) ? nlpClampInt(raw.credibilityScore, 0, 100, 0) : void 0,
    ...Number.isFinite(raw.corroborationCount) && raw.corroborationCount >= 1 ? { corroborationCount: Math.floor(raw.corroborationCount) } : {},
    threat: raw.threat ? {
      level: protoThreatLevelToLabel(raw.threat.level),
      category: nlpTruncateUtf8(
        raw.threat.category ?? "general",
        NLP_DIGEST_METADATA_MAX_BYTES
      ),
      confidence: typeof raw.threat.confidence === "number" ? raw.threat.confidence : 0.5,
      source: raw.threat.source === "ml" || raw.threat.source === "llm" ? raw.threat.source : "keyword"
    } : void 0
  };
}
var NLP_POOL_STATES = ["complete", "partial", "stale", "unavailable"];
function nlpPoolFetch(body, category) {
  const state = NLP_POOL_STATES.includes(body.state ?? "") ? body.state : "unavailable";
  const items = [];
  for (const entry of body.items ?? []) {
    const raw = entry?.item;
    if (!raw?.title || !raw.source) continue;
    items.push({
      ...toNlpNewsItem(raw),
      language: nlpTruncateUtf8(entry.language ?? "", NLP_DIGEST_METADATA_MAX_BYTES),
      editions: (entry.editions ?? []).filter((edition) => NEWS_EDITIONS.includes(edition))
    });
  }
  return {
    items,
    generatedAt: nlpTruncateUtf8(body.generatedAt ?? "", NLP_DIGEST_METADATA_MAX_BYTES),
    variant: null,
    category: category || null,
    poolCoverage: {
      state,
      cells: (body.cells ?? []).map((cell) => ({
        edition: nlpTruncateUtf8(cell.edition ?? "", NLP_DIGEST_METADATA_MAX_BYTES),
        language: nlpTruncateUtf8(cell.language ?? "", NLP_DIGEST_METADATA_MAX_BYTES),
        state: nlpTruncateUtf8(cell.state ?? "", NLP_DIGEST_METADATA_MAX_BYTES),
        items: nlpClampInt(cell.items ?? 0, 0, Number.MAX_SAFE_INTEGER, 0),
        staleAgeSeconds: nlpClampInt(cell.staleAgeSeconds ?? 0, 0, Number.MAX_SAFE_INTEGER, 0)
      }))
    }
  };
}
function nlpDigestFetch(body, variant, category) {
  const seen = /* @__PURE__ */ new Set();
  const items = [];
  const categories = body.categories ?? {};
  const cov = body.coverage;
  const digestCoverage = cov && isNlpDigestCoverageState(cov.state) ? {
    state: cov.state,
    servedItems: nlpClampInt(cov.itemsServed ?? 0, 0, Number.MAX_SAFE_INTEGER, 0),
    servedPublishers: nlpClampInt(cov.publisherCount ?? 0, 0, Number.MAX_SAFE_INTEGER, 0),
    feedsCompleted: nlpClampInt(cov.feedCompleted ?? 0, 0, Number.MAX_SAFE_INTEGER, 0),
    feedsTotal: nlpClampInt(cov.feedTotal ?? 0, 0, Number.MAX_SAFE_INTEGER, 0),
    categoriesCompleted: nlpClampInt(cov.categoryCompleted ?? 0, 0, Number.MAX_SAFE_INTEGER, 0),
    categoriesTotal: nlpClampInt(cov.categoryTotal ?? 0, 0, Number.MAX_SAFE_INTEGER, 0),
    missingCategories: Object.entries(cov.categoryStates ?? {}).filter(([, v]) => v === "missing").map(([k]) => k).slice(0, 12),
    stale: cov.state === "stale",
    // #7084: complete the stale disclosure. The flag alone says the
    // evidence is old without saying how old or why — an agent deciding
    // whether stale evidence is usable needs the age.
    staleAgeSeconds: cov.state === "stale" ? nlpClampInt(cov.staleAgeSeconds ?? 0, 0, Number.MAX_SAFE_INTEGER, 0) : 0,
    staleReason: cov.state === "stale" ? nlpTruncateUtf8(cov.staleReason ?? "", NLP_DIGEST_METADATA_MAX_BYTES) : ""
  } : void 0;
  if (Object.keys(categories).length === 0 && Object.keys(body.feedStatuses ?? {}).length === 0 && digestCoverage?.state !== "unavailable") {
    throw new McpSourceUnavailableError(
      `Feed digest unavailable for ${variant}/en`,
      [`news:digest:v1:${variant}:en`],
      []
    );
  }
  const availableCategories = Object.keys(categories).sort();
  let groups;
  let note;
  if (!category) {
    groups = Object.values(categories);
  } else if (Object.prototype.hasOwnProperty.call(categories, category)) {
    groups = [categories[category]];
  } else if (digestCoverage?.state === "unavailable") {
    groups = [];
  } else {
    groups = [];
    const listed = availableCategories.length > 0 ? availableCategories.join(", ") : (NEWS_POOL_LAYOUT.editions[variant] ?? []).join(", ");
    note = nlpTruncateUtf8(
      `Unknown digest category "${category}". Available: ${listed}.`,
      NLP_DIGEST_NOTE_MAX_BYTES
    );
  }
  for (const group of groups) {
    for (const raw of group.items ?? []) {
      if (!raw?.title || !raw.source) continue;
      const key = raw.link || `${raw.source}|${raw.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(toNlpNewsItem(raw));
    }
  }
  return {
    items,
    generatedAt: nlpTruncateUtf8(body.generatedAt ?? "", NLP_DIGEST_METADATA_MAX_BYTES),
    variant,
    category: category || null,
    ...note ? { note } : {},
    ...digestCoverage ? { digestCoverage } : {}
  };
}
function isNlpDigestCoverageState(value) {
  return typeof value === "string" && NLP_DIGEST_COVERAGE_STATES.includes(value);
}
function titleTokenizer(language) {
  return !language || language === "en" ? tokenize : tokenizeAnyScript;
}
function clusterNlpItemsByLanguage(items) {
  const byLanguage = /* @__PURE__ */ new Map();
  for (const item of items) {
    const group = byLanguage.get(item.language ?? "");
    if (group) group.push(item);
    else byLanguage.set(item.language ?? "", [item]);
  }
  if (byLanguage.size <= 1) return clusterNewsCore(items, getSourceTier, titleTokenizer(items[0]?.language));
  const position = new Map(items.map((item, index) => [item.link || `${item.source}|${item.title}`, index]));
  const first = (cluster) => Math.min(
    ...cluster.allItems.map((item) => position.get(item.link || `${item.source}|${item.title}`) ?? Number.MAX_SAFE_INTEGER)
  );
  return [...byLanguage.values()].flatMap((group) => clusterNewsCore(group, getSourceTier, titleTokenizer(group[0]?.language))).map((cluster) => ({ cluster, at: first(cluster) })).sort((a, b) => a.at - b.at).map(({ cluster }) => cluster);
}
function argCategory(value) {
  return typeof value === "string" ? value.trim() : "";
}
function resolveNlpDigestVariant(value) {
  const requested = argStr(value) || "full";
  return NLP_DIGEST_VARIANTS.includes(requested) ? requested : null;
}
function nlpRegistryEntities(titles, limit) {
  const registryStats = /* @__PURE__ */ new Map();
  const patternStats = /* @__PURE__ */ new Map();
  for (const title of titles) {
    for (const entity of extractEntitiesFromTitle(title)) {
      const stats = registryStats.get(entity.entityId) ?? { name: entity.name, type: getEntityById(entity.entityId)?.type ?? "company", count: 0, totalConfidence: 0 };
      stats.count += 1;
      stats.totalConfidence += entity.confidence;
      registryStats.set(entity.entityId, stats);
    }
    for (const value of extractEntities(title)) {
      patternStats.set(value, (patternStats.get(value) ?? 0) + 1);
    }
  }
  return {
    entities: Array.from(registryStats.entries()).map(([entityId, stats]) => ({
      entityId,
      name: stats.name,
      type: stats.type,
      mentionCount: stats.count,
      avgConfidence: Math.round(stats.totalConfidence / stats.count * 100) / 100
    })).sort((a, b) => b.mentionCount - a.mentionCount || a.entityId.localeCompare(b.entityId)).slice(0, limit),
    patternEntities: Array.from(patternStats.entries()).map(([value, mentionCount]) => ({ value, kind: patternEntityKind(value), mentionCount })).sort((a, b) => b.mentionCount - a.mentionCount || a.value.localeCompare(b.value)).slice(0, limit)
  };
}
var NLP_TOOLS = [
  {
    name: "classify_event",
    title: "Classify a news event",
    _outputBudgetBytes: 4096,
    description: "Classify one supplied headline or short text (1-500 characters) into {category, level, severity, confidence} with the enum-validated WorldMonitor event classifier (temperature 0, cached 24 h per title, never free-form LLM output). classification is null when the classifier cannot produce an enum-valid result; longer input is rejected, not truncated. Operates only on the text passed in; no news lookup. Requires a paid plan; one downstream request, weight 2 on API plans. Read-only.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", maxLength: CLASSIFY_TEXT_MAX_CHARS, description: "Headline or short excerpt to classify (1-500 characters). Longer input is rejected, not truncated." }
      },
      required: ["text"]
    },
    outputSchema: {
      type: "object",
      required: ["classification"],
      properties: {
        classification: {
          type: ["object", "null"],
          description: "null when the classifier could not produce an enum-valid result for this text.",
          required: ["category", "level", "severity", "confidence"],
          properties: {
            category: {
              type: "string",
              enum: CLASSIFY_CATEGORIES
            },
            level: { type: "string", enum: CLASSIFY_LEVELS },
            severity: {
              type: "string",
              enum: CLASSIFY_SEVERITIES
            },
            confidence: { type: "number" }
          }
        },
        error: { type: "string", description: "Present instead of a result when input validation fails." }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    _execute: async (params, base, context, execution) => {
      const text = typeof params.text === "string" ? params.text.trim() : "";
      if (!text) return { classification: null, error: "text is required (a non-empty string of at most 500 characters)" };
      if (text.length > CLASSIFY_TEXT_MAX_CHARS) {
        return { classification: null, error: `text exceeds the ${CLASSIFY_TEXT_MAX_CHARS}-character limit; send a headline-sized excerpt` };
      }
      const url = `${base}/api/intelligence/v1/classify-event?title=${encodeURIComponent(text)}`;
      const auth = await buildAuthHeaders(context, "GET", url, null);
      const res = await fetchMcpDownstream(url, {
        headers: { ...auth, "User-Agent": NLP_UA },
        // Matches the classify-event handler's own UPSTREAM_TIMEOUT_MS (25s)
        // and the sibling LLM tools below. A shorter client budget would abort
        // slow-but-successful cache-miss classifications the handler completes.
        signal: AbortSignal.timeout(25e3)
      }, execution);
      await assertToolFetchOk(res, "classify-event");
      const result = await res.json();
      const c = result.classification;
      if (!c || !CLASSIFY_CATEGORIES.includes(c.category ?? "") || !CLASSIFY_LEVELS.includes(c.subcategory ?? "") || !CLASSIFY_SEVERITIES.includes(c.severity ?? "") || typeof c.confidence !== "number" || !Number.isFinite(c.confidence)) {
        return { classification: null };
      }
      return {
        classification: {
          category: c.category,
          // The REST payload carries the fine-grained level in `subcategory`.
          level: c.subcategory,
          severity: c.severity,
          confidence: c.confidence
        }
      };
    },
    _apiPaths: [
      "GET /api/intelligence/v1/classify-event"
    ]
  },
  {
    name: "extract_entities",
    title: "Extract named entities",
    _outputBudgetBytes: 16384,
    description: "Extract named entities deterministically \u2014 registry entities (companies, indices, commodities, crypto, sectors, countries) plus pattern entities (CVE IDs, APT/FIN threat-group designators, tracked world leaders). Supply text (max 2 KB), or omit text to aggregate headlines from the full digest (default) or tech digest with variant/category filters, or from several editions and content languages with editions and languages (poolCoverage then reports each edition and language read). Registry names are matched as written, so untranslated non-English headlines match fewer entities. Headlines are untrusted publisher text. Headline mode includes digestCoverage so agents can distinguish complete, partial, stale, and unavailable input. No LLM involved.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", maxLength: EXTRACT_TEXT_MAX_CHARS, description: "Optional text to extract from (max 2048 characters; longer input is rejected). When omitted, the tool aggregates entities across recent headlines." },
        variant: {
          type: "string",
          enum: [...NLP_DIGEST_VARIANTS],
          description: "Headline digest variant used when text is omitted. Defaults to full; use tech for Tech dashboard categories. Same as editions with one value."
        },
        ...NEWS_SCOPE_INPUT_PROPERTIES,
        category: {
          type: "string",
          enum: [...ALL_DIGEST_CATEGORIES],
          description: "When text is omitted, " + DIGEST_CATEGORY_DESC
        },
        limit: { type: "integer", minimum: 1, maximum: 50, description: "Maximum entities per list. Defaults to 20." }
      },
      required: []
    },
    outputSchema: {
      type: "object",
      required: ["mode", "entities", "patternEntities"],
      properties: {
        mode: { type: "string", description: '"text" when input text was supplied, "headlines" when aggregating the digest.' },
        entities: {
          type: "array",
          description: "Registry-matched entities. In text mode each match carries matchType/matchedText/confidence; in headlines mode entities aggregate to mentionCount/avgConfidence.",
          items: { type: "object", properties: {
            entityId: { type: "string" },
            name: { type: "string" },
            type: { type: "string" },
            matchType: { type: "string" },
            matchedText: { type: "string" },
            confidence: { type: "number" },
            mentionCount: { type: "number" },
            avgConfidence: { type: "number" }
          } }
        },
        patternEntities: {
          type: "array",
          items: { type: "object", properties: {
            value: { type: "string" },
            kind: { type: "string", description: "cve, apt, fin, or leader." },
            mentionCount: { type: "number" }
          } }
        },
        headlineCount: { type: "number", description: "Headlines scanned (headlines mode only)." },
        generatedAt: { type: "string", description: "Digest snapshot time (headlines mode only)." },
        variant: { type: "string", enum: NEWS_EDITIONS, description: "Applied edition in headlines mode for a single-edition English read. Omitted in text mode and on wider reads." },
        ...NEWS_SCOPE_OUTPUT_PROPERTIES,
        category: { type: ["string", "null"], description: "Applied digest category filter in headlines mode; null when scanning every category. Omitted in text mode." },
        note: { type: "string", description: "Present in headlines mode when category did not match any digest key (typo or missing bucket)." },
        digestCoverage: NLP_DIGEST_COVERAGE_OUTPUT_SCHEMA,
        error: { type: "string", description: "Present instead of a result when input validation fails." }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _execute: async (params, base, context, execution) => {
      const invalid = (error) => ({ mode: "text", entities: [], patternEntities: [], error });
      if (params.text !== void 0 && typeof params.text !== "string") {
        return invalid("text must be a string when provided");
      }
      const text = typeof params.text === "string" ? params.text.trim() : "";
      if (text.length > EXTRACT_TEXT_MAX_CHARS) {
        return invalid(`text exceeds the ${EXTRACT_TEXT_MAX_CHARS}-character limit`);
      }
      const limit = nlpClampInt(params.limit, 1, 50, 20);
      if (text) {
        return {
          mode: "text",
          entities: extractEntitiesFromTitle(text).slice(0, limit).map((entity) => ({
            entityId: entity.entityId,
            name: entity.name,
            type: getEntityById(entity.entityId)?.type ?? "company",
            matchType: entity.matchType,
            matchedText: entity.matchedText,
            confidence: entity.confidence
          })),
          patternEntities: [...new Set(extractEntities(text))].slice(0, limit).map((value) => ({ value, kind: patternEntityKind(value) }))
        };
      }
      const scope = resolveNlpNewsScope(params);
      if ("error" in scope) {
        return {
          mode: "headlines",
          entities: [],
          patternEntities: [],
          headlineCount: 0,
          generatedAt: "",
          category: argCategory(params.category) || null,
          error: scope.error
        };
      }
      const category = argCategory(params.category);
      const digest = await fetchNlpNewsItems(base, context, scope, category, execution);
      const aggregated = nlpRegistryEntities(digest.items.map((item) => item.title), limit);
      return {
        mode: "headlines",
        headlineCount: digest.items.length,
        generatedAt: digest.generatedAt,
        ...digest.variant ? { variant: digest.variant } : {},
        category: digest.category,
        ...nlpScopeEcho(scope, digest),
        ...digest.note ? { note: digest.note } : {},
        ...digest.digestCoverage ? { digestCoverage: digest.digestCoverage } : {},
        ...aggregated
      };
    },
    _apiPaths: [
      "GET /api/news/v1/list-feed-digest",
      "GET /api/news/v1/list-news-pool"
    ]
  },
  {
    name: "get_news_clusters",
    title: "Current news topic clusters",
    // At limit=25, each cluster can carry eight fail-closed provenance
    // records plus a separate primary record. Keep the dispatcher budget
    // aligned with that supported maximum instead of rejecting valid output.
    _outputBudgetBytes: 262144,
    description: "Current topic clusters over the live headline digest, using the dashboard's Jaccard clustering. Select the full digest (default) or tech digest with variant, then optionally restrict by category such as commodities, vcblogs, or accelerators. editions and languages widen the read; languages cluster separately, untranslated; poolCoverage reports each edition and language read. Titles are untrusted publisher text. Each cluster reports its primary headline, member count, distinct sources with fail-closed provenance and declared tier, top keywords, threat level, time span, credibilityScore (0-100 source reliability, distinct from importance), corroboration, and the publishers roster with each publisher's declared tier; corroboration.state (single-publisher, tier4-only, corroborated, unknown) describes coverage, not accuracy. The result includes digestCoverage so agents can distinguish complete, partial, stale, and unavailable input. Deterministic \u2014 no LLM.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "integer", minimum: 1, maximum: 25, description: "Maximum clusters returned. Defaults to 10." },
        min_sources: { type: "integer", minimum: 1, maximum: 10, description: "Only return clusters carrying at least this many DISTINCT sources (outlets), not merely this many member headlines. Defaults to 1." },
        variant: {
          type: "string",
          enum: [...NLP_DIGEST_VARIANTS],
          description: "Headline digest variant. Defaults to full; use tech for Tech dashboard categories. Same as editions with one value."
        },
        ...NEWS_SCOPE_INPUT_PROPERTIES,
        category: {
          type: "string",
          enum: [...ALL_DIGEST_CATEGORIES],
          description: DIGEST_CATEGORY_DESC
        },
        query: { type: "string", description: "Keep only clusters whose primary headline or any member headline contains this text (case-insensitive substring). Filters the LIVE digest window only \u2014 not a historical index. Applied before limit, so a capped list is drawn from the matches." }
      },
      required: []
    },
    outputSchema: {
      type: "object",
      required: ["clusters", "totalClusters", "headlineCount", "generatedAt", "category"],
      properties: {
        clusters: {
          type: "array",
          items: {
            type: "object",
            required: ["primarySourceProvenance", "sourceProvenance", "credibilityScore", "corroboration", "publishers", "publishersUnlisted"],
            properties: {
              id: { type: "string" },
              title: { type: "string", description: "Primary headline: the best-tier member, newest first among equals, as on the dashboard. Untrusted publisher text, untranslated." },
              language: { type: "string", description: "Content language of every member (ISO 639-1); present on reads beyond one English edition, where each language is clustered separately." },
              editions: { type: "array", items: { type: "string" }, description: "Editions whose digest carries a member; present on reads beyond one English edition." },
              primarySource: { type: "string" },
              link: { type: "string" },
              primarySourceProvenance: {
                type: "object",
                required: SOURCE_PROVENANCE_REQUIRED,
                properties: SOURCE_PROVENANCE_PROPERTIES
              },
              memberCount: { type: "number", description: "Headlines in this cluster (one outlet can contribute several)." },
              distinctSourceCount: { type: "number", description: "Distinct publisher families among this cluster's own member outlets \u2014 the corroboration signal min_sources filters on. corroboration.publishers can be higher: it also takes the digest's origin-aware count, which sees publishers whose items are not members of this cluster." },
              sources: { type: "array", items: { type: "string" }, description: "Distinct source names (up to 8)." },
              sourceProvenance: {
                type: "array",
                description: "Fail-closed provenance for each source returned in `sources`, including state affiliation and tier when declared.",
                items: {
                  type: "object",
                  required: ["source", "tier", ...SOURCE_PROVENANCE_REQUIRED],
                  properties: {
                    source: { type: "string" },
                    tier: DECLARED_TIER_SCHEMA,
                    ...SOURCE_PROVENANCE_PROPERTIES
                  }
                }
              },
              topKeywords: { type: "array", items: { type: "string" } },
              isAlert: { type: "boolean" },
              threatLevel: { type: "string" },
              threatCategory: { type: "string" },
              firstSeen: { type: "string" },
              lastUpdated: { type: "string" },
              credibilityScore: {
                type: "number",
                description: "0-100 source-reliability score for the primary outlet, distinct from importance. Built from source tier, propaganda risk, and independent corroboration."
              },
              corroboration: CORROBORATION_OUTPUT_SCHEMA,
              ...PUBLISHER_ROSTER_OUTPUT_PROPERTIES
            }
          }
        },
        totalClusters: { type: "number", description: "Cluster count before limit/min_sources filtering." },
        headlineCount: { type: "number" },
        generatedAt: { type: "string" },
        variant: { type: "string", enum: NEWS_EDITIONS, description: "Applied edition for a single-edition English read; omitted on wider reads." },
        ...NEWS_SCOPE_OUTPUT_PROPERTIES,
        category: { type: ["string", "null"], description: "Applied digest category filter; null when clustering every category." },
        note: { type: "string", description: "Present when category did not match any digest key (typo or missing bucket)." },
        digestCoverage: NLP_DIGEST_COVERAGE_OUTPUT_SCHEMA,
        error: { type: "string", description: "Present when variant validation fails." }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _execute: async (params, base, context, execution) => {
      const limit = nlpClampInt(params.limit, 1, 25, 10);
      const minSources = nlpClampInt(params.min_sources, 1, 10, 1);
      const scope = resolveNlpNewsScope(params);
      if ("error" in scope) {
        return {
          clusters: [],
          totalClusters: 0,
          headlineCount: 0,
          generatedAt: "",
          category: argCategory(params.category) || null,
          error: scope.error
        };
      }
      const category = argCategory(params.category);
      const query = argStr(params.query);
      const digest = await fetchNlpNewsItems(base, context, scope, category, execution);
      const clusters = clusterNlpItemsByLanguage(digest.items);
      const selectedClusters = clusters.map((cluster) => ({
        cluster,
        sources: [...new Set(cluster.allItems.map((item) => item.source))],
        // #6428: `sources` is the feed-LABEL list — kept for attribution, but
        // it is not the corroboration number. One newsroom ships many labels
        // ("Reuters World" + "Reuters US"), so counting them let one wire
        // satisfy the `min_sources` filter this tool documents as "distinct
        // outlets ... real corroboration, not one outlet filing twice".
        // clusterNewsCore already resolved the publisher families.
        distinctPublishers: cluster.uniquePublisherCount
      })).filter(({ distinctPublishers }) => distinctPublishers >= minSources).filter(({ cluster }) => !query || ciIncludes(cluster.primaryTitle, query) || cluster.allItems.some((item) => ciIncludes(item.title, query))).slice(0, limit);
      const projected = selectedClusters.map(({ cluster, sources, distinctPublishers }) => {
        const projectedSources = sources.slice(0, 8);
        const digestCredibilityScore = cluster.credibilityScore;
        const evidence = evidenceFromCluster(cluster);
        const verdict = assessCorroboration(evidence);
        const provenanceBySource = new Map(
          [.../* @__PURE__ */ new Set([cluster.primarySource, ...projectedSources])].map((source) => [source, withOutletProfile(source, getSourceProvenanceState(source))])
        );
        const members = cluster.allItems;
        return {
          id: cluster.id,
          title: cluster.primaryTitle,
          ...digest.poolCoverage ? {
            language: members[0]?.language ?? "",
            editions: NEWS_EDITIONS.filter((edition) => members.some((member) => member.editions?.includes(edition)))
          } : {},
          primarySource: cluster.primarySource,
          primarySourceProvenance: provenanceBySource.get(cluster.primarySource),
          link: cluster.primaryLink,
          memberCount: cluster.sourceCount,
          // Corroboration is distinct PUBLISHERS, not headline count and not
          // feed-label count — one outlet can file several near-identical
          // headlines into the same cluster, and can file them under several
          // of its own feeds (#6428).
          distinctSourceCount: distinctPublishers,
          sources: projectedSources,
          sourceProvenance: projectedSources.map((source) => ({
            source,
            tier: declaredSourceTier(source),
            ...provenanceBySource.get(source)
          })),
          topKeywords: topClusterKeywords(cluster, 5, titleTokenizer(members[0]?.language)),
          isAlert: cluster.isAlert,
          threatLevel: cluster.threat?.level ?? "info",
          threatCategory: cluster.threat?.category ?? "general",
          firstSeen: cluster.firstSeen.toISOString(),
          lastUpdated: cluster.lastUpdated.toISOString(),
          credibilityScore: Number.isFinite(digestCredibilityScore) ? digestCredibilityScore : computeCredibilityScore({
            sourceTier: getSourceTier(cluster.primarySource),
            propagandaRisk: provenanceBySource.get(cluster.primarySource).risk,
            independentCorroborationCount: distinctPublishers
          }),
          corroboration: toCorroborationJson(verdict),
          ...toPublisherRosterJson(publisherRoster(evidence), verdict)
        };
      });
      return {
        clusters: projected,
        totalClusters: clusters.length,
        headlineCount: digest.items.length,
        generatedAt: digest.generatedAt,
        ...digest.variant ? { variant: digest.variant } : {},
        category: digest.category,
        ...nlpScopeEcho(scope, digest),
        ...digest.note ? { note: digest.note } : {},
        ...digest.digestCoverage ? { digestCoverage: digest.digestCoverage } : {}
      };
    },
    _apiPaths: [
      "GET /api/news/v1/list-feed-digest",
      "GET /api/news/v1/list-news-pool"
    ]
  },
  {
    name: "verify_claim",
    title: "Check a claim against news coverage",
    _outputBudgetBytes: 65536,
    description: "Return an evidence card for a claim or headline: the live-digest clusters reporting the same event, a result state (corroborated, single-publisher, tier4-only, unknown, or not-found when the digest was searched and nothing reports it; unknown when there were no headlines to search), WorldMonitor's coverage verdict over the matched clusters, the publishers roster with declared tiers, matched headlines with fail-closed source provenance, a figure check (numbers and dates in the claim that no matched headline states) and first/last sighting. found=false means the claim was not matched, never that it is false; this is coverage, not accuracy. factChecks quotes ratings IFCN-verified fact-checkers published about a similar claim, each with checker, date and link; the rating is theirs and never changes state. Deterministic, no LLM. Requires a paid plan; one downstream search, weight 2 on API plans. claim is up to 300 characters; variant picks the full or tech digest. It searches the English edition only. Read-only.",
    inputSchema: {
      type: "object",
      properties: {
        claim: { type: "string", minLength: 1, maxLength: CLAIM_MAX_CHARS, description: `The claim or headline to check, up to ${CLAIM_MAX_CHARS} characters.` },
        variant: {
          type: "string",
          enum: [...NLP_DIGEST_VARIANTS],
          description: "Headline digest variant to search. Defaults to full."
        }
      },
      required: ["claim"]
    },
    outputSchema: {
      type: "object",
      required: ["claim", "found", "state", "corroboration", "publishers", "publishersUnlisted", "matchedClusters", "headlines", "figures", "caveat", "generatedAt"],
      properties: {
        claim: { type: "string", description: "The claim as checked (trimmed, capped)." },
        found: { type: "boolean", description: "True when at least one digest cluster reports the same event. False means no match: not in WorldMonitor's current sources when state is not-found, or nothing searched when state is unknown. Never false." },
        state: { type: "string", enum: [...CLAIM_CARD_STATES], description: "not-found when the digest was searched and no cluster reports the claim (not in WorldMonitor's sources, never false); unknown when the digest had no headlines to search (see digestCoverage); otherwise corroboration.state." },
        corroboration: CORROBORATION_OUTPUT_SCHEMA,
        ...PUBLISHER_ROSTER_OUTPUT_PROPERTIES,
        matchedClusters: { type: "number", description: "Digest clusters about this event (one event often spans several)." },
        credibilityScore: { type: ["number", "null"], description: "0-100 source-reliability score of the best-matched cluster's primary outlet, distinct from importance; null when not found." },
        firstSeen: { type: ["string", "null"], description: "Earliest matched headline (ISO 8601); null when not found." },
        lastUpdated: { type: ["string", "null"], description: "Latest matched headline (ISO 8601); null when not found." },
        headlines: {
          type: "array",
          description: `Matched headlines, best match first (up to ${CLAIM_CARD_MAX_HEADLINES}).`,
          items: {
            type: "object",
            required: ["title", "source", "link", "publishedAt", "tier", ...SOURCE_PROVENANCE_REQUIRED],
            properties: {
              title: { type: "string" },
              source: { type: "string" },
              link: { type: "string" },
              publishedAt: { type: "string" },
              tier: DECLARED_TIER_SCHEMA,
              ...SOURCE_PROVENANCE_PROPERTIES
            }
          }
        },
        figures: {
          type: "object",
          required: ["claimed", "grounded", "ungrounded"],
          description: "Numbers and dates in the claim checked against matched headlines with the brief grounding rule. Ungrounded means no matched headline states the figure, not that it is wrong.",
          properties: {
            claimed: { type: "array", items: { type: "string" } },
            grounded: { type: "array", items: { type: "string" } },
            ungrounded: { type: "array", items: { type: "string" } }
          }
        },
        caveat: { type: "string", description: "Fixed reminder that the verdict describes coverage, not accuracy." },
        factChecks: {
          type: "object",
          required: ["state", "label", "caveat", "items"],
          description: "Published fact-checks of a similar claim (#9094), cited with attribution. Strong text matches only, from IFCN-verified fact-checkers, English, newest first; disagreeing ratings are all listed. The ratings are the fact-checkers' own and never change state or corroboration.",
          properties: {
            state: { type: "string", enum: ["ok", "unavailable", "not-configured"], description: "ok when the lookup ran (an empty list then means no published fact-check of a similar claim was found); unavailable or not-configured when it did not run." },
            label: { type: "string", description: "How to introduce each item: a fact-check of a similar claim, never of this claim." },
            caveat: { type: "string" },
            items: {
              type: "array",
              items: {
                type: "object",
                required: ["publisher", "site", "rating", "reviewedAt", "url", "title", "claimReviewed"],
                properties: {
                  publisher: { type: "string", description: "The fact-checker." },
                  site: { type: "string", description: "Its IFCN-allowlisted domain." },
                  rating: { type: "string", description: "The fact-checker's own rating, verbatim." },
                  reviewedAt: { type: "string", description: "When the fact-check was published (ISO 8601)." },
                  url: { type: "string" },
                  title: { type: "string" },
                  claimReviewed: { type: "string", description: "The claim the fact-checker rated (similar, not necessarily identical)." }
                }
              }
            }
          }
        },
        generatedAt: { type: "string" },
        variant: { type: "string", enum: [...NLP_DIGEST_VARIANTS] },
        digestCoverage: NLP_DIGEST_COVERAGE_OUTPUT_SCHEMA,
        error: { type: "string", description: "Present when the claim or variant is invalid." }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _execute: async (params, base, context, execution) => {
      const claim = (typeof params.claim === "string" ? params.claim : "").trim().slice(0, CLAIM_MAX_CHARS);
      const empty = { ...buildClaimCard(claim, []), generatedAt: "" };
      const variant = resolveNlpDigestVariant(params.variant);
      if (!claim) return { ...empty, error: "claim is required" };
      if (!variant) return { ...empty, error: `variant must be one of: ${NLP_DIGEST_VARIANTS.join(", ")}` };
      const [search, factChecks] = await Promise.all([
        variant === "full" ? searchClaimPool(claim).catch(() => null) : null,
        factCheckBlock(claim)
      ]);
      if (search && search.state !== "unavailable") {
        return {
          ...buildClaimCard(claim, search.candidates, search.searchedHeadlines),
          factChecks,
          generatedAt: search.readAt,
          variant
        };
      }
      const digest = await fetchNlpNewsItems(base, context, { languages: ["en"], editions: [variant], echo: false }, "", execution);
      return {
        ...buildClaimCard(claim, digest.items),
        factChecks,
        generatedAt: digest.generatedAt,
        variant: digest.variant,
        ...digest.digestCoverage ? { digestCoverage: digest.digestCoverage } : {}
      };
    },
    // search-fact-checks and search-claim-headlines: covered by the same
    // in-process lookups they serve.
    _apiPaths: [
      "GET /api/news/v1/list-feed-digest",
      "GET /api/news/v1/search-fact-checks",
      "GET /api/news/v1/search-claim-headlines"
    ]
  },
  {
    name: "get_keyword_spikes",
    title: "Keyword and threat spikes",
    _outputBudgetBytes: 32768,
    description: "Keyword/CVE/APT spikes vs baseline, each with sourceNames and {title, source, link}. Uses the dashboard term-candidacy and spike-decision math. sourceNames are curated publisher names, or the original feed label when unmapped. sampleHeadlines are up to 3 newest recent-window stories; sourceNames is the complete publisher set. Baseline derives from the 48-hour story accumulator (per-window story rate), not the dashboard's incremental 7-day client history. The accumulator holds the English full edition only; there are no languages or editions filters. Results are cached for 10 minutes. Deterministic \u2014 no LLM.",
    inputSchema: {
      type: "object",
      properties: {
        window_hours: { type: "integer", minimum: 1, maximum: 12, description: "Recent window to test for spikes. Defaults to 2." },
        min_count: { type: "integer", minimum: 2, maximum: 20, description: "Minimum recent-window story count for a term to spike. Defaults to 5." },
        limit: { type: "integer", minimum: 1, maximum: 25, description: "Maximum spikes returned. Defaults to 10." }
      },
      required: []
    },
    outputSchema: {
      type: "object",
      required: ["spikes", "window_hours", "baseline_hours", "story_count", "sample_truncated", "generatedAt"],
      properties: {
        spikes: {
          type: "array",
          items: { type: "object", required: [
            "term",
            "count",
            "baseline",
            "multiplier",
            "uniqueSources",
            "sourceNames",
            "sampleHeadlines"
          ], properties: {
            term: { type: "string" },
            count: { type: "number", description: "Distinct stories mentioning the term inside the recent window." },
            baseline: { type: "number", description: "Per-window story rate over the exact sampled pre-window duration (see baseline_hours). 0 means this term was absent from the available baseline cohort." },
            multiplier: { type: "number", description: "count / baseline; 0 when the term has no baseline mentions." },
            uniqueSources: { type: "number", description: "Distinct publisher families in the recent window. Explained by sourceNames." },
            sourceNames: {
              type: "array",
              items: { type: "string" },
              description: "Publisher names matching uniqueSources: curated masthead, otherwise the original feed label."
            },
            sampleHeadlines: {
              type: "array",
              description: "Up to 3 newest recent-window stories by lastSeen. Not the full count; sourceNames is the complete publisher set.",
              items: {
                type: "object",
                required: ["title", "source", "link"],
                properties: {
                  title: { type: "string" },
                  source: { type: "string", description: "Publisher(s) that carried this collapsed title. Empty when the story has no usable feed labels. Not necessarily the outlet of link." },
                  link: { type: "string", description: "Canonical story URL from story:track:v1.link. Empty when the row has no link." }
                }
              }
            }
          } }
        },
        window_hours: { type: "number" },
        baseline_hours: { type: "number", description: "Exact hours in the sampled pre-window baseline cohort. 0 means no baseline was available and spikes is empty." },
        story_count: { type: "number", description: "Stories this computation saw across the separately bounded recent and baseline cohorts." },
        sample_truncated: { type: "boolean", description: "True when either bounded cohort hit its 800-story cap." },
        generatedAt: { type: "string" },
        note: { type: "string", description: "Present when the accumulator was unavailable/empty or the story store was only partially readable." }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _execute: async (params) => {
      const windowHours = nlpClampInt(params.window_hours, 1, 12, 2);
      const minCount = nlpClampInt(params.min_count, 2, 20, DEFAULT_MIN_SPIKE_COUNT);
      const limit = nlpClampInt(params.limit, 1, 25, 10);
      const cacheKey = `intelligence:keyword-spikes:mcp:v3:${windowHours}h:${minCount}`;
      let cached = null;
      try {
        cached = await readJsonFromUpstash(cacheKey);
      } catch {
        cached = null;
      }
      if (cached && Array.isArray(cached.spikes)) {
        return { ...cached, spikes: cached.spikes.slice(0, limit) };
      }
      const nowMs = Date.now();
      const windowMs = windowHours * 60 * 60 * 1e3;
      const windowStart = nowMs - windowMs;
      const emptyResult = {
        spikes: [],
        window_hours: windowHours,
        baseline_hours: 0,
        story_count: 0,
        sample_truncated: false,
        generatedAt: new Date(nowMs).toISOString()
      };
      const zres = await redisPipeline([
        [
          "ZRANGE",
          DIGEST_ACCUMULATOR_KEY_MCP,
          String(nowMs),
          String(windowStart),
          "BYSCORE",
          "REV",
          "WITHSCORES",
          "LIMIT",
          "0",
          String(KEYWORD_SPIKE_MAX_STORIES)
        ],
        [
          "ZRANGE",
          DIGEST_ACCUMULATOR_KEY_MCP,
          String(windowStart - 1),
          String(nowMs - KEYWORD_SPIKE_BASELINE_MS),
          "BYSCORE",
          "REV",
          "WITHSCORES",
          "LIMIT",
          "0",
          String(KEYWORD_SPIKE_MAX_STORIES)
        ]
      ]);
      const recentFlat = zres?.[0]?.result;
      const baselineFlat = zres?.[1]?.result;
      if (!Array.isArray(recentFlat) || !Array.isArray(baselineFlat)) {
        return { ...emptyResult, note: "story accumulator unavailable or empty" };
      }
      if (recentFlat.length === 0 && baselineFlat.length === 0) {
        return { ...emptyResult, note: "story accumulator unavailable or empty" };
      }
      const parseEntries = (flat) => {
        const entries2 = [];
        let malformed = flat.length % 2 !== 0;
        for (let i = 0; i + 1 < flat.length; i += 2) {
          const rawHash = flat[i];
          const hash = typeof rawHash === "string" ? rawHash : "";
          const lastSeenMs = Number(flat[i + 1]);
          if (hash && Number.isFinite(lastSeenMs)) entries2.push({ hash, lastSeenMs });
          else malformed = true;
        }
        return { entries: entries2, malformed };
      };
      const recentParsed = parseEntries(recentFlat);
      const baselineParsed = parseEntries(baselineFlat);
      if (recentParsed.malformed || baselineParsed.malformed) {
        return { ...emptyResult, note: "story accumulator returned an unreadable payload" };
      }
      const recentEntries = recentParsed.entries;
      const baselineEntries = baselineParsed.entries;
      const sampleTruncated = recentEntries.length >= KEYWORD_SPIKE_MAX_STORIES || baselineEntries.length >= KEYWORD_SPIKE_MAX_STORIES;
      if (baselineEntries.length === 0) {
        return {
          ...emptyResult,
          story_count: recentEntries.length,
          sample_truncated: sampleTruncated,
          note: "baseline unavailable: no pre-window stories were present; spikes were not computed or cached"
        };
      }
      const oldestBaselineMs = baselineEntries[baselineEntries.length - 1].lastSeenMs;
      const baselineDurationMs = Math.min(
        KEYWORD_SPIKE_BASELINE_MS - windowMs,
        windowStart - oldestBaselineMs
      );
      const entries = [...recentEntries, ...baselineEntries];
      let degraded = false;
      const chunkInto = (items, size) => {
        const chunks = [];
        for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
        return chunks;
      };
      const titles = /* @__PURE__ */ new Map();
      const links = /* @__PURE__ */ new Map();
      const HMGET_CHUNK = 200;
      const hmgetChunks = chunkInto(entries, HMGET_CHUNK);
      const hmgetResults = await Promise.all(hmgetChunks.map((chunk) => redisPipeline(
        chunk.map((entry) => ["HMGET", `story:track:v1:${entry.hash}`, "title", "link"])
      )));
      hmgetChunks.forEach((chunk, chunkIdx) => {
        const res = hmgetResults[chunkIdx];
        if (!Array.isArray(res) || res.length !== chunk.length) degraded = true;
        chunk.forEach((entry, idx) => {
          const reply = res?.[idx];
          const fields = reply?.result;
          if (!reply || Object.prototype.hasOwnProperty.call(reply, "error") || !Array.isArray(fields) || fields.length !== 2) {
            degraded = true;
            return;
          }
          const title = fields[0];
          if (typeof title !== "string" || !title) {
            degraded = true;
            return;
          }
          titles.set(entry.hash, title);
          const link = fields[1];
          if (typeof link === "string" && link) links.set(entry.hash, link);
        });
      });
      const recentHashes = entries.filter((entry) => entry.lastSeenMs >= windowStart && titles.has(entry.hash)).map((entry) => entry.hash);
      const sourcesByHash = /* @__PURE__ */ new Map();
      const SMEMBERS_CHUNK = 200;
      const smembersChunks = chunkInto(recentHashes, SMEMBERS_CHUNK);
      const smembersResults = await Promise.all(smembersChunks.map((chunk) => redisPipeline(
        chunk.map((hash) => ["SMEMBERS", `story:sources:v1:${hash}`])
      )));
      smembersChunks.forEach((chunk, chunkIdx) => {
        const res = smembersResults[chunkIdx];
        if (!Array.isArray(res) || res.length !== chunk.length) degraded = true;
        chunk.forEach((hash, idx) => {
          const reply = res?.[idx];
          const members = reply?.result;
          if (!reply || Object.prototype.hasOwnProperty.call(reply, "error") || !Array.isArray(members) || members.some((member) => typeof member !== "string")) {
            degraded = true;
            return;
          }
          sourcesByHash.set(hash, members);
        });
      });
      const stories = entries.filter((entry) => titles.has(entry.hash)).map((entry) => ({
        title: titles.get(entry.hash),
        lastSeenMs: entry.lastSeenMs,
        sources: sourcesByHash.get(entry.hash) ?? [],
        link: links.get(entry.hash) ?? ""
      }));
      const spikes = computeKeywordSpikesFromStories(stories, {
        nowMs,
        windowMs,
        baselineDurationMs,
        minSpikeCount: minCount,
        spikeMultiplier: DEFAULT_SPIKE_MULTIPLIER
      }).slice(0, KEYWORD_SPIKE_MAX_STORED).map((spike) => ({
        term: spike.term,
        count: spike.count,
        baseline: Math.round(spike.baseline * 100) / 100,
        multiplier: Math.round(spike.multiplier * 100) / 100,
        uniqueSources: spike.uniqueSources,
        sourceNames: spike.sourceNames,
        sampleHeadlines: spike.sampleHeadlines.map((sample) => ({
          title: sample.title,
          source: sample.source,
          link: nlpTruncateUtf8(sample.link, KEYWORD_SPIKE_LINK_MAX_BYTES)
        }))
      }));
      const payload = {
        ...emptyResult,
        spikes,
        story_count: stories.length,
        baseline_hours: baselineDurationMs / 36e5,
        sample_truncated: sampleTruncated
      };
      if (degraded) {
        return {
          ...payload,
          spikes: payload.spikes.slice(0, limit),
          note: "partial story-store read; spikes may be incomplete and were not cached"
        };
      }
      await setCachedData(cacheKey, payload, KEYWORD_SPIKE_CACHE_TTL_S);
      return { ...payload, spikes: payload.spikes.slice(0, limit) };
    },
    // Redis-only computation: no HTTP endpoint is proxied (types.ts case (a)).
    _apiPaths: []
  }
];
export {
  NLP_TOOLS
};
