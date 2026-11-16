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
        for (const channel of channels) {
          if (isPattern) {
            this.subscribeToPattern(channel);
          } else {
            this.subscribeToChannel(channel);
          }
        }
      }
      subscribeToChannel(channel) {
        const controller = new AbortController();
        const command = new SubscribeCommand([channel], {
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
        this.subscriptions.set(channel, {
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
            const channel = messageData.slice(secondCommaIndex + 1, thirdCommaIndex);
            const messageStr = messageData.slice(thirdCommaIndex + 1);
            try {
              const message2 = this.opts?.automaticDeserialization === false ? messageStr : JSON.parse(messageStr);
              this.dispatchToListeners("pmessage", { pattern, channel, message: message2 });
              this.dispatchToListeners(`pmessage:${pattern}`, { pattern, channel, message: message2 });
            } catch (error) {
              this.dispatchToListeners("error", new Error(`Failed to parse message: ${error}`));
            }
          } else {
            const channel = messageData.slice(firstCommaIndex + 1, secondCommaIndex);
            const messageStr = messageData.slice(secondCommaIndex + 1);
            try {
              if (type === "subscribe" || type === "psubscribe" || type === "unsubscribe" || type === "punsubscribe") {
                const count = Number.parseInt(messageStr);
                this.dispatchToListeners(type, count);
              } else {
                const message2 = this.opts?.automaticDeserialization === false ? messageStr : parseWithTryCatch(messageStr);
                this.dispatchToListeners(type, { channel, message: message2 });
                this.dispatchToListeners(`${type}:${channel}`, { channel, message: message2 });
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
          for (const channel of channels) {
            const subscription = this.subscriptions.get(channel);
            if (subscription) {
              try {
                subscription.controller.abort();
              } catch {
              }
              this.subscriptions.delete(channel);
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
      async digest(s) {
        const data = new TextEncoder().encode(s);
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
      async digest(s) {
        const data = new TextEncoder().encode(s);
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
var BUILD, TextFieldBuilder, NumericFieldBuilder, BoolFieldBuilder, DateFieldBuilder, KeywordFieldBuilder, FacetFieldBuilder, Redis2;
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
var UNKNOWN_CLIENT_IP = "unknown";
var CF_EDGE_PROOF_HEADER = "x-wm-edge-proof";
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
var EDGE_PROOF_MISMATCH_LATCH = /* @__PURE__ */ Symbol.for(
  "worldmonitor.client-ip.edge-proof-mismatch-warning.v1"
);
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
var inflight = /* @__PURE__ */ new Map();
var FETCHER_TIMEOUT_MS_DEFAULT = 3e4;
var fetcherTimeoutDefaultMs = FETCHER_TIMEOUT_MS_DEFAULT;
var CachedFetchTimeoutError = class extends Error {
  constructor(message2) {
    super(message2);
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
var USER_API_KEY_KINDS = /* @__PURE__ */ new Set(["api", "desktop"]);
var USER_API_KEY_CACHE_VERSION = 2;
var UserApiKeyUnavailableError = class extends Error {
  code = "validation_unavailable";
  constructor(message2) {
    super(message2);
    this.name = "UserApiKeyUnavailableError";
  }
};
var USER_API_KEY_RE = /^wm_[a-f0-9]{40}$/;
var CACHE_TTL_SECONDS = 60;
var NEG_TTL_SECONDS = 60;
var CACHE_KEY_PREFIX = "user-api-key:";
var revalidateInFlight = /* @__PURE__ */ new Map();
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
async function sha256Hex(input) {
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
    keyHash: await sha256Hex(key),
    ...entry.activeKeyRank === void 0 ? {} : { activeKeyRank: entry.activeKeyRank }
  };
}
async function validateUserApiKeyEntry(key) {
  if (!USER_API_KEY_RE.test(key ?? "")) return null;
  const keyHash = await sha256Hex(key);
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

// server/_shared/mcp-internal-hmac.ts
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

// server/_shared/rate-limit.ts
var import_ratelimit = __toESM(require_dist2(), 1);
init_nodejs();

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
var REDIS_TEST_RETRY_OPTS = process.env.NODE_TEST_CONTEXT ? { retry: false } : {};
var ENDPOINT_RATE_LIMIT_TIMEOUT_MS = process.env.NODE_TEST_CONTEXT ? 250 : 5e3;
var ENDPOINT_REDIS_ABORT_TIMEOUT_MS = process.env.NODE_TEST_CONTEXT ? 20 : 4500;
var __ENDPOINT_LIMITER_DEADLINES_FOR_TEST = Object.freeze({
  decisionMs: ENDPOINT_RATE_LIMIT_TIMEOUT_MS,
  abortMs: ENDPOINT_REDIS_ABORT_TIMEOUT_MS
});
var GLOBAL_RATE_WINDOW = "60 s";
var GLOBAL_RATE_WINDOW_SECONDS = durationToSeconds(GLOBAL_RATE_WINDOW);
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

// node_modules/jose/dist/webapi/lib/buffer_utils.js
var encoder2 = new TextEncoder();
var decoder = new TextDecoder();
var MAX_INT32 = 2 ** 32;
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

// node_modules/jose/dist/webapi/lib/crypto_key.js
var unusable = (name, prop = "algorithm.name") => new TypeError(`CryptoKey does not support this operation, its ${prop} must be ${name}`);
var isAlgorithm = (algorithm, name) => algorithm.name === name;
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
var invalidKeyInput = (actual, ...types) => message("Key must be ", actual, ...types);
var withAlg = (alg, actual, ...types) => message(`Key for the ${alg} algorithm must be `, actual, ...types);

// node_modules/jose/dist/webapi/util/errors.js
var JOSEError = class extends Error {
  static code = "ERR_JOSE_GENERIC";
  code = "ERR_JOSE_GENERIC";
  constructor(message2, options) {
    super(message2, options);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
};
var JWTClaimValidationFailed = class extends JOSEError {
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
var JWTExpired = class extends JOSEError {
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
var JOSEAlgNotAllowed = class extends JOSEError {
  static code = "ERR_JOSE_ALG_NOT_ALLOWED";
  code = "ERR_JOSE_ALG_NOT_ALLOWED";
};
var JOSENotSupported = class extends JOSEError {
  static code = "ERR_JOSE_NOT_SUPPORTED";
  code = "ERR_JOSE_NOT_SUPPORTED";
};
var JWSInvalid = class extends JOSEError {
  static code = "ERR_JWS_INVALID";
  code = "ERR_JWS_INVALID";
};
var JWTInvalid = class extends JOSEError {
  static code = "ERR_JWT_INVALID";
  code = "ERR_JWT_INVALID";
};
var JWKSInvalid = class extends JOSEError {
  static code = "ERR_JWKS_INVALID";
  code = "ERR_JWKS_INVALID";
};
var JWKSNoMatchingKey = class extends JOSEError {
  static code = "ERR_JWKS_NO_MATCHING_KEY";
  code = "ERR_JWKS_NO_MATCHING_KEY";
  constructor(message2 = "no applicable key found in the JSON Web Key Set", options) {
    super(message2, options);
  }
};
var JWKSMultipleMatchingKeys = class extends JOSEError {
  [Symbol.asyncIterator];
  static code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  code = "ERR_JWKS_MULTIPLE_MATCHING_KEYS";
  constructor(message2 = "multiple matching keys found in the JSON Web Key Set", options) {
    super(message2, options);
  }
};
var JWKSTimeout = class extends JOSEError {
  static code = "ERR_JWKS_TIMEOUT";
  code = "ERR_JWKS_TIMEOUT";
  constructor(message2 = "request timed out", options) {
    super(message2, options);
  }
};
var JWSSignatureVerificationFailed = class extends JOSEError {
  static code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  code = "ERR_JWS_SIGNATURE_VERIFICATION_FAILED";
  constructor(message2 = "signature verification failed", options) {
    super(message2, options);
  }
};

// node_modules/jose/dist/webapi/lib/is_key_like.js
var isCryptoKey = (key) => {
  if (key?.[Symbol.toStringTag] === "CryptoKey")
    return true;
  try {
    return key instanceof CryptoKey;
  } catch {
    return false;
  }
};
var isKeyObject = (key) => key?.[Symbol.toStringTag] === "KeyObject";
var isKeyLike = (key) => isCryptoKey(key) || isKeyObject(key);

// node_modules/jose/dist/webapi/lib/helpers.js
function decodeBase64url(value, label, ErrorClass) {
  try {
    return decode2(value);
  } catch {
    throw new ErrorClass(`Failed to base64url decode the ${label}`);
  }
}

// node_modules/jose/dist/webapi/lib/type_checks.js
var isObjectLike = (value) => typeof value === "object" && value !== null;
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
var isJWK = (key) => isObject(key) && typeof key.kty === "string";
var isPrivateJWK = (key) => key.kty !== "oct" && (key.kty === "AKP" && typeof key.priv === "string" || typeof key.d === "string");
var isPublicJWK = (key) => key.kty !== "oct" && key.d === void 0 && key.priv === void 0;
var isSecretJWK = (key) => key.kty === "oct" && typeof key.k === "string";

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

// node_modules/jose/dist/webapi/lib/jwk_to_key.js
var unsupportedAlg = 'Invalid or unsupported JWK "alg" (Algorithm) Parameter value';
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

// node_modules/jose/dist/webapi/lib/normalize_key.js
var unusableForAlg = "given KeyObject instance cannot be used for this algorithm";
var cache;
var handleJWK = async (key, jwk, alg, freeze = false) => {
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
var handleKeyObject = (keyObject, alg) => {
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

// node_modules/jose/dist/webapi/lib/validate_algorithms.js
function validateAlgorithms(option, algorithms) {
  if (algorithms !== void 0 && (!Array.isArray(algorithms) || algorithms.some((s) => typeof s !== "string"))) {
    throw new TypeError(`"${option}" option must be an array of strings`);
  }
  if (!algorithms) {
    return void 0;
  }
  return new Set(algorithms);
}

// node_modules/jose/dist/webapi/lib/check_key_type.js
var tag = (key) => key?.[Symbol.toStringTag];
var jwkMatchesOp = (alg, key, usage) => {
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
var symmetricTypeCheck = (alg, key, usage) => {
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
var asymmetricTypeCheck = (alg, key, usage) => {
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
  const data = concat(jws.protected !== void 0 ? encode(jws.protected) : new Uint8Array(), encode("."), typeof jws.payload === "string" ? b64 ? encode(jws.payload) : encoder2.encode(jws.payload) : jws.payload);
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
    payload = encoder2.encode(jws.payload);
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

// node_modules/jose/dist/webapi/lib/jwt_claims_set.js
var epoch = (date) => Math.floor(date.getTime() / 1e3);
var minute = 60;
var hour = minute * 60;
var day = hour * 24;
var week = day * 7;
var year = day * 365.25;
var REGEX = /^(\+|\-)? ?(\d+|\d+\.\d+) ?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)(?: (ago|from now))?$/i;
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
var normalizeTyp = (value) => {
  if (value.includes("/")) {
    return value.toLowerCase();
  }
  return `application/${value.toLowerCase()}`;
};
var checkAudiencePresence = (audPayload, audOption) => {
  if (typeof audPayload === "string") {
    return audOption.includes(audPayload);
  }
  if (Array.isArray(audPayload)) {
    return audOption.some(Set.prototype.has.bind(new Set(audPayload)));
  }
  return false;
};
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
var LocalJWKSet = class {
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

// node_modules/jose/dist/webapi/jwks/remote.js
function isCloudflareWorkers() {
  return typeof WebSocketPair !== "undefined" || typeof navigator !== "undefined" && navigator.userAgent === "Cloudflare-Workers" || typeof EdgeRuntime !== "undefined" && EdgeRuntime === "vercel";
}
var USER_AGENT;
if (typeof navigator === "undefined" || !navigator.userAgent?.startsWith?.("Mozilla/5.0 ")) {
  const NAME = "jose";
  const VERSION2 = "v6.2.2";
  USER_AGENT = `${NAME}/${VERSION2}`;
}
var customFetch = /* @__PURE__ */ Symbol();
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
var jwksCache = /* @__PURE__ */ Symbol();
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
var RemoteJWKSet = class {
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

// server/cors.ts
var APP_ORIGIN_PATTERN2 = /^https:\/\/(?:(?:www|app|api|tech|finance|commodity|happy|energy)\.)?worldmonitor\.app$/;
var MAX_ORIGIN_BYTES2 = 300;
var ORIGIN_ENCODER2 = new TextEncoder();
var PRODUCTION_PATTERNS = [
  APP_ORIGIN_PATTERN2,
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
var DEV_PATTERNS = [
  /^https?:\/\/localhost(:\d+)?$/,
  /^https?:\/\/127\.0\.0\.1(:\d+)?$/
];
var ALLOWED_ORIGIN_PATTERNS2 = process.env.NODE_ENV === "production" ? PRODUCTION_PATTERNS : [...PRODUCTION_PATTERNS, ...DEV_PATTERNS];
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
function stripTrailingDnsDots2(hostname) {
  let end = hostname.length;
  while (end > 0 && hostname[end - 1] === ".") end--;
  return hostname.slice(0, end);
}
function originForAllowlistMatch2(origin) {
  if (!origin) return "";
  try {
    const url = new URL(origin);
    const host = stripTrailingDnsDots2(url.hostname);
    if (!host || host === url.hostname) return origin;
    url.hostname = host;
    return url.origin;
  } catch {
    return origin;
  }
}
function isWorldMonitorGoogleTranslateOrigin2(origin) {
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" || url.port !== "") return false;
    const host = stripTrailingDnsDots2(url.hostname);
    const suffix = ".translate.goog";
    if (!host.endsWith(suffix)) return false;
    const encoded = host.slice(0, -suffix.length);
    if (!encoded || encoded.includes(".")) return false;
    const decoded = encoded.replace(/--/g, "\0").replace(/-/g, ".").replace(/\0/g, "-");
    return APP_ORIGIN_PATTERN2.test(`https://${decoded}`);
  } catch {
    return false;
  }
}
function isAllowedOrigin2(origin) {
  if (!origin || origin.length > MAX_ORIGIN_BYTES2 || ORIGIN_ENCODER2.encode(origin).byteLength > MAX_ORIGIN_BYTES2) return false;
  if (isWorldMonitorGoogleTranslateOrigin2(origin)) return true;
  const candidate = originForAllowlistMatch2(origin);
  return ALLOWED_ORIGIN_PATTERNS2.some((pattern) => pattern.test(candidate));
}

// server/auth-session.ts
var CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY ?? "";
var CLERK_JWT_CLOCK_TOLERANCE_SECONDS = 5;
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
var _jwks = null;
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
  if (isAllowedOrigin2(azp)) return true;
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
var _planCache = /* @__PURE__ */ new Map();
var PLAN_CACHE_TTL_MS = 5 * 60 * 1e3;
var DEFAULT_PLAN_LOOKUP_TIMEOUT_MS = 3e3;
var MAX_ABORT_SIGNAL_TIMEOUT_MS = 2147483647;
function parsePlanLookupTimeoutMs(value) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= MAX_ABORT_SIGNAL_TIMEOUT_MS ? parsed : DEFAULT_PLAN_LOOKUP_TIMEOUT_MS;
}
var PLAN_LOOKUP_TIMEOUT_MS = parsePlanLookupTimeoutMs(process.env.CLERK_PLAN_LOOKUP_TIMEOUT_MS);
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

// server/_shared/direct-llm-quota.ts
var DIRECT_LLM_DAILY_QUOTA_LIMIT = 500;
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

// server/_shared/high-usage-alarm.ts
var OPERATOR_KEY_DAILY_CEILINGS = {
  /** REST requests. Recorded only while `API_RATE_LIMIT_ENFORCE` is off. */
  restRequests: 1e5,
  /** MCP tool calls: one unit per call, as on Pro's dedicated counter. */
  mcpUnits: 1e4,
  /** Direct-LLM calls, one counter shared by the gateway, chat-analyst and widget-agent. */
  directLlmCalls: 5e3
};
async function operatorKeyQuotaPrincipal(key) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
  const hex = [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `wm:${hex.slice(0, 32)}`;
}

// server/_shared/usage-identity.ts
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

// server/_shared/premium-check.ts
async function operatorKeyIdentity(key) {
  return {
    isPremium: true,
    userId: null,
    kind: "enterprise",
    quotaExempt: false,
    quotaUserId: await operatorKeyQuotaPrincipal(key),
    alarmPrincipal: hashKeySync(key),
    directLlmDailyLimit: OPERATOR_KEY_DAILY_CEILINGS.directLlmCalls
  };
}
var DENIED = Object.freeze({
  isPremium: false,
  userId: null,
  kind: null,
  quotaExempt: false
});
var UNAUTHENTICATED = Object.freeze({
  isPremium: false,
  userId: null,
  kind: null,
  quotaExempt: false,
  unauthenticated: true
});
function denyFor(entitlements) {
  if (!entitlements && !isEntitlementBackendConfigured()) {
    return { ...DENIED, billingDenial: unverifiableEntitlementDenial() };
  }
  const billingDenial = classifyBillingVerification(entitlements);
  return billingDenial ? { ...DENIED, billingDenial } : DENIED;
}
async function resolvePremiumCallerIdentity(request) {
  const verifiedMarker = request.headers.get(INTERNAL_MCP_VERIFIED_HEADER);
  const trustedUserId = request.headers.get(TRUSTED_USER_ID_HEADER);
  if (verifiedMarker && trustedUserId) {
    const expectedNonce = getInternalMcpVerifiedNonce();
    let diff = verifiedMarker.length ^ expectedNonce.length;
    const len = Math.max(verifiedMarker.length, expectedNonce.length);
    for (let i = 0; i < len; i++) {
      const a = i < verifiedMarker.length ? verifiedMarker.charCodeAt(i) : 0;
      const b = i < expectedNonce.length ? expectedNonce.charCodeAt(i) : 0;
      diff |= a ^ b;
    }
    if (diff === 0) {
      const ent = await getEntitlements(trustedUserId);
      if (hasCurrentEntitlementCoverage(ent) && ent.features.tier >= 1 && // mcpAccess lands in U10. Until then the field is undefined for
      // existing entitlement rows; treat undefined as false (fail-closed)
      // so a misconfigured / pre-U10 row cannot grant premium semantics
      // through the internal-MCP path.
      ent.features.mcpAccess === true) {
        return { isPremium: true, userId: trustedUserId, kind: "internal-mcp", quotaExempt: true };
      }
      return denyFor(ent);
    }
  }
  const wmKey = request.headers.get("X-WorldMonitor-Key") || request.headers.get("X-Api-Key") || "";
  let userKeyLookupUnavailable = false;
  if (wmKey) {
    const validKeys = (process.env.WORLDMONITOR_VALID_KEYS ?? "").split(",").map((k) => k.trim()).filter(Boolean);
    if (await timingSafeIncludes(wmKey, validKeys)) {
      return operatorKeyIdentity(wmKey);
    }
    try {
      const userKey = await validateUserApiKeyPrincipal(wmKey);
      if (userKey) {
        const ent = await resolveUserKeyEntitlement(userKey.userId, userKey);
        const keyScope = resolveUserKeyScope(userKey, ent);
        if (keyScope.scope === "api" && ent) {
          return {
            isPremium: true,
            userId: userKey.userId,
            kind: "user-api-key",
            quotaExempt: false,
            directLlmDailyLimit: resolveActiveDirectLlmLimit(ent),
            enterprisePlan: ent.features.tier >= 3
          };
        }
        if (keyScope.scope === "desktop" && ent) {
          if (isApiOnlyPath(new URL(request.url).pathname)) return DENIED;
          return {
            isPremium: true,
            userId: userKey.userId,
            kind: "desktop-key",
            desktopKeyMeter: { planKey: ent.planKey, features: { planLimits: ent.features.planLimits } },
            quotaExempt: false,
            directLlmDailyLimit: resolveActiveDirectLlmLimit(ent),
            enterprisePlan: ent.features.tier >= 3
          };
        }
        if (keyScope.scope === "denied" && keyScope.reason === "over_cap") return DENIED;
        return denyFor(ent);
      }
    } catch {
      userKeyLookupUnavailable = true;
    }
  }
  const keyCheck = await validateApiKey(request, {});
  if (keyCheck.valid && keyCheck.required && keyCheck.credential) {
    return operatorKeyIdentity(keyCheck.credential);
  }
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const session = await validateBearerToken(authHeader.slice(7));
    if (!session.valid) {
      if (session.reason === "unverifiable") {
        return { ...DENIED, billingDenial: unverifiableEntitlementDenial() };
      }
      return UNAUTHENTICATED;
    }
    if (session.role === "pro" && session.userId) {
      return {
        isPremium: true,
        userId: session.userId,
        kind: "bearer",
        quotaExempt: false,
        directLlmDailyLimit: DIRECT_LLM_UNVERIFIED_DAILY_QUOTA_LIMIT,
        enterprisePlan: false
      };
    }
    if (session.userId) {
      const ent = await getEntitlements(session.userId);
      if (hasCurrentEntitlementCoverage(ent) && ent.features.tier >= 1) {
        return {
          isPremium: true,
          userId: session.userId,
          kind: "bearer",
          quotaExempt: false,
          directLlmDailyLimit: resolveActiveDirectLlmLimit(ent),
          enterprisePlan: ent.features.tier >= 3
        };
      }
      return denyFor(ent);
    }
  }
  if (userKeyLookupUnavailable) {
    return { ...DENIED, billingDenial: unverifiableEntitlementDenial() };
  }
  return UNAUTHENTICATED;
}

// shared/strip-trailing-slashes.js
function stripTrailingSlashes(value) {
  let end = value.length;
  while (end > 1 && value.charCodeAt(end - 1) === 47) end -= 1;
  return end === value.length ? value : value.slice(0, end);
}

// src/generated/server/worldmonitor/shipping/v2/service_server.ts
var ApiError = class extends Error {
  statusCode;
  body;
  constructor(statusCode, message2, body) {
    super(message2);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.body = body;
  }
};

// server/_shared/chokepoint-registry.ts
var CHOKEPOINT_REGISTRY = [
  {
    id: "suez",
    displayName: "Suez Canal",
    geoId: "suez",
    relayName: "Suez Canal",
    portwatchName: "Suez Canal",
    corridorRiskName: "Suez",
    baselineId: "suez",
    shockModelSupported: true,
    routeIds: ["china-europe-suez", "china-us-east-suez", "gulf-europe-oil", "qatar-europe-lng", "singapore-med", "india-europe"],
    lat: 30.5,
    lon: 32.3
  },
  {
    id: "malacca_strait",
    displayName: "Strait of Malacca",
    geoId: "malacca_strait",
    relayName: "Malacca Strait",
    portwatchName: "Malacca Strait",
    corridorRiskName: "Malacca",
    baselineId: "malacca",
    shockModelSupported: true,
    routeIds: ["china-europe-suez", "china-us-east-suez", "gulf-asia-oil", "qatar-asia-lng", "india-se-asia", "china-africa", "cpec-route"],
    lat: 2.5,
    lon: 101.5
  },
  {
    id: "hormuz_strait",
    displayName: "Strait of Hormuz",
    geoId: "hormuz_strait",
    relayName: "Strait of Hormuz",
    portwatchName: "Strait of Hormuz",
    transitMeasurementNote: "Not measured here in this snapshot. The live counter requires matched AIS entry and exit reports, with at least five minutes inside the monitored area. No complete crossing measurement is available for this period. Historical PortWatch totals do not supply today's count.",
    corridorRiskName: "Hormuz",
    baselineId: "hormuz",
    shockModelSupported: true,
    routeIds: ["gulf-europe-oil", "gulf-asia-oil", "qatar-europe-lng", "qatar-asia-lng", "gulf-americas-cape"],
    lat: 26.5,
    lon: 56.5
  },
  {
    id: "bab_el_mandeb",
    displayName: "Bab el-Mandeb",
    geoId: "bab_el_mandeb",
    relayName: "Bab el-Mandeb Strait",
    portwatchName: "Bab el-Mandeb Strait",
    corridorRiskName: "Bab el-Mandeb",
    baselineId: "babelm",
    shockModelSupported: true,
    routeIds: ["china-europe-suez", "china-us-east-suez", "gulf-europe-oil", "qatar-europe-lng", "singapore-med", "india-europe"],
    lat: 12.5,
    lon: 43.3
  },
  {
    id: "panama",
    displayName: "Panama Canal",
    geoId: "panama",
    relayName: "Panama Canal",
    portwatchName: "Panama Canal",
    corridorRiskName: "Panama",
    baselineId: "panama",
    shockModelSupported: false,
    routeIds: ["china-us-east-panama", "panama-transit"],
    lat: 9.1,
    lon: -79.7
  },
  {
    id: "taiwan_strait",
    displayName: "Taiwan Strait",
    geoId: "taiwan_strait",
    relayName: "Taiwan Strait",
    portwatchName: "Taiwan Strait",
    corridorRiskName: "Taiwan",
    baselineId: null,
    shockModelSupported: false,
    routeIds: ["china-us-west", "intra-asia-container"],
    lat: 24,
    lon: 119.5
  },
  {
    id: "cape_of_good_hope",
    displayName: "Cape of Good Hope",
    geoId: "cape_of_good_hope",
    relayName: "Cape of Good Hope",
    portwatchName: "Cape of Good Hope",
    corridorRiskName: "Cape of Good Hope",
    baselineId: null,
    shockModelSupported: false,
    routeIds: ["brazil-china-bulk", "gulf-americas-cape", "asia-europe-cape"],
    lat: -34.36,
    lon: 18.49
  },
  {
    id: "gibraltar",
    displayName: "Strait of Gibraltar",
    geoId: "gibraltar",
    relayName: "Gibraltar Strait",
    portwatchName: "Gibraltar Strait",
    corridorRiskName: null,
    baselineId: null,
    shockModelSupported: false,
    routeIds: ["gulf-europe-oil", "singapore-med", "india-europe", "asia-europe-cape"],
    lat: 35.9,
    lon: -5.6
  },
  {
    id: "bosphorus",
    displayName: "Bosporus Strait",
    geoId: "bosphorus",
    relayName: "Bosporus Strait",
    portwatchName: "Bosporus Strait",
    corridorRiskName: null,
    baselineId: "turkish",
    shockModelSupported: false,
    routeIds: ["russia-med-oil"],
    lat: 41.1,
    lon: 29
  },
  {
    id: "korea_strait",
    displayName: "Korea Strait",
    geoId: "korea_strait",
    relayName: "Korea Strait",
    portwatchName: "Korea Strait",
    corridorRiskName: null,
    baselineId: null,
    shockModelSupported: false,
    routeIds: [],
    lat: 34,
    lon: 129
  },
  {
    id: "dover_strait",
    displayName: "Dover Strait",
    geoId: "dover_strait",
    relayName: "Dover Strait",
    portwatchName: "Dover Strait",
    corridorRiskName: null,
    baselineId: "danish",
    shockModelSupported: false,
    routeIds: [],
    lat: 51,
    lon: 1.5
  },
  {
    id: "kerch_strait",
    displayName: "Kerch Strait",
    geoId: "kerch_strait",
    relayName: "Kerch Strait",
    portwatchName: "Kerch Strait",
    corridorRiskName: null,
    baselineId: null,
    shockModelSupported: false,
    routeIds: [],
    lat: 45.3,
    lon: 36.6
  },
  {
    id: "lombok_strait",
    displayName: "Lombok Strait",
    geoId: "lombok_strait",
    relayName: "Lombok Strait",
    portwatchName: "Lombok Strait",
    corridorRiskName: null,
    baselineId: null,
    shockModelSupported: false,
    routeIds: [],
    lat: -8.5,
    lon: 115.7
  }
];
var CANONICAL_CHOKEPOINT_IDS = new Set(CHOKEPOINT_REGISTRY.map((c) => c.id));
var SHOCK_MODEL_CHOKEPOINTS = CHOKEPOINT_REGISTRY.filter((c) => c.shockModelSupported);

// shared/event-triggers.json
var event_triggers_default = {
  schemaVersion: 1,
  description: "Surface-neutral registry of the push event triggers WorldMonitor delivers to API-key webhook subscribers (POST /api/v2/shipping/webhooks). Zapier triggers, the OpenAPI webhooks block and the delivery worker read this file; the MCP Events extension (#9268) will too. Mirrored byte-for-byte at scripts/shared/event-triggers.json (Railway rootDirectory=scripts) and integrations/zapier/event-triggers.json (Zapier bundles only its own folder).",
  subscription: {
    register: { method: "POST", path: "/api/v2/shipping/webhooks" },
    list: { method: "GET", path: "/api/v2/shipping/webhooks" },
    status: { method: "GET", path: "/api/v2/shipping/webhooks/{subscriberId}" },
    unsubscribe: { method: "DELETE", path: "/api/v2/shipping/webhooks/{subscriberId}" },
    auth: "X-WorldMonitor-Key with an API plan key (apiAccess entitlement)",
    ttlSeconds: 2592e3,
    scopeField: "scope",
    signature: {
      header: "X-WM-Signature",
      algorithm: "sha256=hex(HMAC-SHA256(key=secret, message=rawBody))",
      eventHeader: "X-WM-Event",
      deliveryIdHeader: "X-WM-Delivery-Id",
      v2Header: "X-WM-Signature-V2",
      timestampHeader: "X-WM-Timestamp",
      v2Algorithm: "sha256=hex(HMAC-SHA256(key=secret, message=timestamp + '.' + deliveryId + '.' + event + '.' + rawBody))",
      toleranceSeconds: 300,
      note: "Every event, threshold or occurrence, goes through one sender (scripts/lib/shipping-webhook-delivery.mjs, mirrored by deliver-webhook.ts), so all of them carry the same headers. X-WM-Signature is the legacy body-only HMAC; X-WM-Signature-V2 also binds the X-WM-Timestamp send time, the delivery id and the event, so a captured delivery cannot be replayed under another id or outside the tolerance. Receivers require V2 and never fall back to the legacy header, which a captured delivery can be replayed under with a new id or with V2 stripped; the Zapier app (1.2.0) rejects any delivery without a valid V2."
    },
    evaluationSeconds: 300,
    failureCeiling: 5,
    kinds: {
      threshold: "The worker re-evaluates a condition against a feed every tick and keeps the delivery pending while the condition holds; one crossing is one delivery id.",
      occurrence: "A fire-once event: a subscription gets one delivery id per eventId, from the first copy that matches its scope (delivery stays at-least-once, so a retry can repeat it). A failed delivery is retried every tick under the same delivery id until retry.pendingTtlSeconds, then dropped for good. Per-subscription volume caps count the events POSTed per UTC hour and day, retries included; a retry over the cap waits, new events over it are dropped and counted. Scope fields travel in the `scope` object of the registration body."
    }
  },
  events: {
    "chokepoint.disruption": {
      key: "chokepoint.disruption",
      kind: "threshold",
      label: "Chokepoint Disruption",
      noun: "Chokepoint Alert",
      description: "Triggers when a monitored maritime chokepoint's disruption score reaches the alert threshold while live signals (navigational warnings, AIS disruption, transit drop) sit at least minLiveSignal points above its standing threat level.",
      source: {
        redisKey: "supply_chain:chokepoints:v4",
        rpc: "/api/supply-chain/v1/get-chokepoint-status",
        refreshSeconds: 360
      },
      entity: { field: "chokepointId", listRpc: "/api/supply-chain/v1/get-chokepoint-status", listField: "chokepoints" },
      inputSchema: {
        type: "object",
        properties: {
          chokepointIds: {
            type: "array",
            items: { type: "string" },
            default: [],
            description: "Chokepoint ids to watch. Empty subscribes to every registered chokepoint."
          },
          alertThreshold: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            default: 50,
            description: "Fire when disruptionScore >= alertThreshold. 50 is the red band. Standing threat levels: war zone 70 (Hormuz, Kerch), critical 40 (Bab el-Mandeb), high 30 (Suez), elevated 15 (Taiwan, Bosphorus), normal 0."
          },
          minLiveSignal: {
            type: "integer",
            minimum: 0,
            maximum: 40,
            default: 0,
            recommended: 15,
            description: "Also require disruptionScore minus the standing threat level to be at least this many points, so a chokepoint that sits permanently above the threshold does not fire once and go silent. 15 matches the in-app chokepoint_disruption alert rule; 0 keeps the legacy score-only behaviour."
          }
        }
      },
      threshold: {
        field: "disruptionScore",
        operator: ">=",
        default: 50,
        liveSignalField: "disruptionScore - standingThreatLevel(warRiskTier)",
        liveSignalDefault: 0,
        liveSignalRecommended: 15
      },
      cooldown: {
        type: "hysteresis",
        rearm: "disruptionScore < alertThreshold, after compensating for score inputs that were present at delivery and are missing now",
        minimumSeconds: 0,
        withLiveSignal: {
          rearm: "disruptionScore < alertThreshold - rearmScoreMargin or liveSignal < min(rearmLiveBelow, minLiveSignal), with the same compensation; the in-app chokepoint_disruption rule's hysteresis",
          rearmScoreMargin: 10,
          rearmLiveBelow: 5,
          minimumSeconds: 43200
        }
      },
      id: {
        field: "deliveryId",
        header: "X-WM-Delivery-Id",
        construction: "whd_ + 32 lowercase hex, minted once per upward crossing and kept across retries, so one disruption is one id"
      },
      payloadSchema: {
        type: "object",
        required: ["subscriberId", "chokepointId", "score", "alertThreshold", "triggeredAt", "reason"],
        properties: {
          subscriberId: { type: "string" },
          chokepointId: { type: "string" },
          score: { type: "number" },
          alertThreshold: { type: "number" },
          triggeredAt: { type: "string", format: "date-time" },
          reason: { type: "string", enum: ["ais_congestion_spike", "navigational_warning", "transit_drop", "score_threshold"] },
          details: {
            type: "object",
            properties: {
              name: { type: "string" },
              status: { type: ["string", "null"] },
              activeWarnings: { type: "integer" },
              aisDisruptions: { type: "integer" },
              congestionLevel: { type: ["string", "null"] },
              warRiskTier: { type: ["string", "null"] },
              wowChangePct: { type: ["number", "null"] },
              previousScore: { type: ["number", "null"] },
              scoresFetchedAt: { type: ["string", "null"] }
            }
          }
        }
      },
      sample: {
        subscriberId: "wh_041fef6d0657b56b75fb62cb",
        chokepointId: "suez",
        score: 35,
        alertThreshold: 0,
        triggeredAt: "2026-10-17T12:02:07.248Z",
        reason: "navigational_warning",
        details: {
          name: "Suez Canal",
          status: "yellow",
          activeWarnings: 1,
          aisDisruptions: 0,
          congestionLevel: "normal",
          warRiskTier: "WAR_RISK_TIER_HIGH",
          wowChangePct: null,
          previousScore: null,
          scoresFetchedAt: "2026-10-17T12:00:06.018Z"
        }
      }
    },
    "country.risk_surge": {
      key: "country.risk_surge",
      kind: "threshold",
      label: "Country Risk Surge",
      noun: "Risk Surge",
      description: "Triggers when a monitored country's Country Instability Index rises by at least riseThreshold points within 24 hours into the high band (70 or more), once per surge with a 24-hour cooldown per country.",
      source: {
        redisKey: "risk:scores:sebuf:v14",
        staleRedisKey: "risk:scores:sebuf:stale:v14",
        rpc: "/api/intelligence/v1/get-risk-scores",
        refreshSeconds: 480
      },
      entity: { field: "countryCode", listRpc: "/api/intelligence/v1/get-risk-scores", listField: "ciiScores" },
      countries: {
        US: "United States",
        RU: "Russia",
        CN: "China",
        UA: "Ukraine",
        IR: "Iran",
        IL: "Israel",
        TW: "Taiwan",
        KP: "North Korea",
        SA: "Saudi Arabia",
        TR: "Turkey",
        PL: "Poland",
        DE: "Germany",
        FR: "France",
        GB: "United Kingdom",
        IN: "India",
        PK: "Pakistan",
        SY: "Syria",
        YE: "Yemen",
        MM: "Myanmar",
        VE: "Venezuela",
        CU: "Cuba",
        MX: "Mexico",
        BR: "Brazil",
        AE: "United Arab Emirates",
        KR: "South Korea",
        IQ: "Iraq",
        AF: "Afghanistan",
        LB: "Lebanon",
        EG: "Egypt",
        JP: "Japan",
        QA: "Qatar"
      },
      inputSchema: {
        type: "object",
        properties: {
          countries: {
            type: "array",
            items: { type: "string", pattern: "^[A-Z]{2}$" },
            default: [],
            description: "ISO 3166-1 alpha-2 codes among the monitored countries. Empty subscribes to all of them."
          }
        }
      },
      threshold: {
        field: "dynamicScore",
        operator: ">=",
        riseThreshold: 15,
        floorField: "combinedScore",
        floor: 70,
        baselineGuard: "a reading whose staticBaseline differs from the previous evaluation is a methodology or baseline edit, not an event: it disarms the country until the 24-hour movement falls under rearmBelow",
        why: "Backtest on 90 days of 6-hourly archive readings (24 countries, 11,054 steps): a 10-point rise fires 2.9 times a day and tracks news-volume blips; 15 points fires 0.9 a day (median 1, p95 3). Checking all 48 fires at rise 15 and floor 50 against wire reports gave 17 true positives, 17 minor incidents and 14 false positives, every true positive in a country whose index sits in the high band; raising the floor to 70 keeps 15 of the 17 true positives and drops 5 false positives, and the baseline guard removes the static re-levellings (Brazil, Mexico 50 to 70) that produced 4 more non-events."
      },
      cooldown: {
        type: "hysteresis",
        rearm: "dynamicScore < rearmBelow",
        rearmBelow: 5,
        minimumSeconds: 86400
      },
      id: {
        field: "deliveryId",
        header: "X-WM-Delivery-Id",
        construction: "whd_ + 32 lowercase hex, minted once per surge per country and kept across retries"
      },
      payloadSchema: {
        type: "object",
        required: ["subscriberId", "countryCode", "score", "delta24h", "triggeredAt", "reason"],
        properties: {
          subscriberId: { type: "string" },
          countryCode: { type: "string" },
          countryName: { type: "string" },
          score: { type: "number", description: "Current combined Country Instability Index, 0-100." },
          previousScore: { type: ["number", "null"], description: "Score about 24 hours earlier (score minus delta24h)." },
          delta24h: { type: "number", description: "24-hour movement, the dynamicScore of get-risk-scores." },
          trend: { type: "string" },
          advisoryLevel: { type: ["string", "null"] },
          triggeredAt: { type: "string", format: "date-time" },
          reason: { type: "string", enum: ["risk_surge"] },
          details: {
            type: "object",
            properties: {
              riseThreshold: { type: "number" },
              floor: { type: "number" },
              staticBaseline: { type: "number" },
              components: { type: "object" },
              methodologyVersion: { type: "string" },
              computedAt: { type: ["number", "null"] },
              scoresFetchedAt: { type: ["string", "null"] }
            }
          }
        }
      },
      sample: {
        subscriberId: "wh_041fef6d0657b56b75fb62cb",
        countryCode: "IR",
        countryName: "Iran",
        score: 84,
        previousScore: 60,
        delta24h: 24,
        trend: "TREND_DIRECTION_RISING",
        advisoryLevel: "do-not-travel",
        triggeredAt: "2026-10-01T04:49:00.000Z",
        reason: "risk_surge",
        details: {
          riseThreshold: 15,
          floor: 70,
          staticBaseline: 50,
          components: { newsActivity: 24, ciiContribution: 0, geoConvergence: 10, militaryActivity: 50 },
          methodologyVersion: "v12",
          computedAt: 179083014e4,
          scoresFetchedAt: "2026-10-01T04:49:00.000Z"
        }
      }
    },
    "news.breaking": {
      key: "news.breaking",
      kind: "occurrence",
      label: "Breaking News Alert",
      noun: "Breaking News Alert",
      description: "Triggers when WorldMonitor's news relay classifies a headline as critical or high and it clears the subscription's importance floor, severity floor, keywords, categories and countries, once per story link.",
      source: {
        channel: "wm:events:api:v1",
        producer: "scripts/ais-relay.cjs publishNotificationEvent (tee of the rss_alert queue message)",
        relayEventType: "rss_alert"
      },
      categories: [
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
      ],
      inputSchema: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: { type: "string", minLength: 2, maxLength: 64 },
            maxItems: 20,
            default: [],
            description: "Case-insensitive whole-word terms matched against the headline; a headline matches when it contains any of them. Empty applies no keyword filter."
          },
          categories: {
            type: "array",
            items: {
              type: "string",
              enum: [
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
              ]
            },
            default: [],
            description: "Classifier categories to accept. Empty accepts every category."
          },
          countries: {
            type: "array",
            items: { type: "string", pattern: "^[A-Z]{2}$" },
            maxItems: 50,
            default: [],
            description: "ISO 3166-1 alpha-2 codes. A headline matches when the relay attributed it to one of them; a headline with no country attribution never matches a country scope. Empty applies no country filter."
          },
          importanceFloor: {
            type: "integer",
            minimum: 0,
            maximum: 100,
            default: 69,
            description: "Deliver when importanceScore >= importanceFloor. 69 is the watchlist-story floor; the critical band starts at 82."
          },
          severityFloor: {
            type: "string",
            enum: ["critical", "high"],
            default: "high",
            description: "critical delivers critical headlines only; high delivers critical and high, which is every headline the relay queues."
          }
        }
      },
      volume: {
        maxDeliveriesPerHour: 20,
        maxDeliveriesPerDay: 100,
        overflow: "dropped and counted per subscription, never batched",
        measured: "2026-10-18, 20.6 h of relay logs: 141 queued rss_alert messages a day, 135 distinct headlines (16 critical, 119 high), at most 10 in an hour"
      },
      retry: { pendingTtlSeconds: 7200 },
      dedupe: { seenWindowSeconds: 86400 },
      id: {
        field: "deliveryId",
        header: "X-WM-Delivery-Id",
        construction: "whd_ + 32 lowercase hex, minted once per (subscription, eventId) and kept across retries",
        eventIdField: "eventId",
        eventIdConstruction: "rss_ + first 32 hex of sha256(canonical link: lowercase host + path, no query, fragment or trailing slash); when the headline carries no link, the same over the normalized title (lowercased, attribution suffix after ' - ' or ' | ' stripped, punctuation and whitespace collapsed). The relay publishes one copy per site variant; they share the id."
      },
      payloadSchema: {
        type: "object",
        required: ["subscriberId", "eventId", "title", "source", "link", "publishedAt", "severity", "importanceScore", "corroborationCount", "category", "countryCodes", "variant", "matchedKeywords", "triggeredAt", "reason"],
        properties: {
          subscriberId: { type: "string" },
          eventId: { type: "string", pattern: "^rss_[0-9a-f]{32}$" },
          title: { type: "string" },
          source: { type: "string" },
          link: { type: ["string", "null"] },
          publishedAt: { type: "string", format: "date-time" },
          severity: { type: "string", enum: ["critical", "high"] },
          importanceScore: { type: "number", description: "Relay importance score, 0-100, recomputed from the classifier level." },
          corroborationCount: { type: "integer", description: "Publishers the relay merged into this story; 1 when unknown." },
          category: { type: ["string", "null"], description: "Classifier category, null for alert paths that carry none (Saudi Civil Defense posts)." },
          countryCodes: { type: "array", items: { type: "string" }, description: "ISO2 codes the relay attributed to the headline; empty when unattributed." },
          variant: { type: ["string", "null"], description: "Site variant whose feed set carried the headline (full, tech, finance, commodity, happy), null for non-variant paths." },
          matchedKeywords: { type: "array", items: { type: "string" }, description: "Subscription keywords found in the headline; empty when the subscription has no keywords." },
          triggeredAt: { type: "string", format: "date-time" },
          reason: { type: "string", enum: ["breaking_news"] }
        }
      },
      sample: {
        subscriberId: "wh_041fef6d0657b56b75fb62cb",
        eventId: "rss_17e006d328288631614def2e44e5a1c7",
        title: "Iran\u2019s Guards Say Two Tankers Hit Mines In Strait Of Hormuz",
        source: "RFE/RL",
        link: "https://www.rferl.org/a/iran-guards-tankers-mines-hormuz/33560001.html",
        publishedAt: "2026-10-17T18:31:00.000Z",
        severity: "critical",
        importanceScore: 88,
        corroborationCount: 3,
        category: "conflict",
        countryCodes: ["IR"],
        variant: "full",
        matchedKeywords: ["hormuz"],
        triggeredAt: "2026-10-17T18:45:16.000Z",
        reason: "breaking_news"
      }
    },
    "market.move": {
      key: "market.move",
      kind: "occurrence",
      label: "Large Market Move",
      noun: "Market Move",
      description: "Triggers when a tracked equity, commodity or crypto quote moves at least minAbsPct percent on the day; the relay publishes moves of 5 percent or more (10 for crypto), and a sustained move is delivered once per symbol, direction and severity band per UTC day.",
      source: {
        channel: "wm:events:api:v1",
        producer: "scripts/ais-relay.cjs publishNotificationEvent (tee of the market_alert queue message)",
        relayEventType: "market_alert"
      },
      assetClasses: ["equity", "commodity", "crypto"],
      inputSchema: {
        type: "object",
        properties: {
          assetClasses: {
            type: "array",
            items: { type: "string", enum: ["equity", "commodity", "crypto"] },
            default: [],
            description: "Asset classes to accept. Empty accepts all three."
          },
          symbols: {
            type: "array",
            items: { type: "string", minLength: 1, maxLength: 24 },
            maxItems: 50,
            default: [],
            description: "Quote symbols as WorldMonitor lists them (upper-cased on registration). Empty accepts every tracked symbol."
          },
          minAbsPct: {
            type: "number",
            minimum: 5,
            maximum: 100,
            default: 10,
            description: "Deliver when |changePct| >= minAbsPct. The relay only publishes moves of 5 percent or more (10 for crypto), so lower values change nothing; 10 is the relay's critical band for equities and commodities."
          },
          direction: {
            type: "string",
            enum: ["up", "down", "any"],
            default: "any",
            description: "Accept rises, falls, or both."
          }
        }
      },
      volume: {
        maxDeliveriesPerHour: 20,
        maxDeliveriesPerDay: 100,
        overflow: "dropped and counted per subscription, never batched",
        measured: "2026-10-18, 20.6 h of relay logs: 41 queued market_alert messages, 2 distinct moves republished hourly (Newcastle Coal +8 percent, VIX +21 percent)"
      },
      retry: { pendingTtlSeconds: 7200 },
      dedupe: { seenWindowSeconds: 86400 },
      id: {
        field: "deliveryId",
        header: "X-WM-Delivery-Id",
        construction: "whd_ + 32 lowercase hex, minted once per (subscription, eventId) and kept across retries",
        eventIdField: "eventId",
        eventIdConstruction: "mkt_ + first 32 hex of sha256(coalesceKey + '|' + UTC date of publication), where coalesceKey = market:<assetClass>:<symbol lowercased>:<surge|decline>:<severity> is the relay's hourly dedup key; a move that holds all day is one event, a move that escalates into the critical band is a second one."
      },
      payloadSchema: {
        type: "object",
        required: ["subscriberId", "eventId", "assetClass", "symbol", "name", "price", "changePct", "direction", "severity", "source", "publishedAt", "triggeredAt", "reason"],
        properties: {
          subscriberId: { type: "string" },
          eventId: { type: "string", pattern: "^mkt_[0-9a-f]{32}$" },
          assetClass: { type: "string", enum: ["equity", "commodity", "crypto"] },
          symbol: { type: "string" },
          name: { type: "string" },
          price: { type: ["number", "null"], description: "Last price in the quote's own unit; null when the feed carried none." },
          changePct: { type: "number", description: "Day change in percent, unrounded (8.4 means 8.4 percent)." },
          direction: { type: "string", enum: ["up", "down"] },
          severity: { type: "string", enum: ["critical", "high"], description: "critical at 10 percent or more (20 for crypto), otherwise high." },
          source: { type: "string", description: "Equity Market, Commodity Market or Crypto Market." },
          publishedAt: { type: "string", format: "date-time", description: "When the relay published the move." },
          triggeredAt: { type: "string", format: "date-time" },
          reason: { type: "string", enum: ["large_move"] }
        }
      },
      sample: {
        subscriberId: "wh_041fef6d0657b56b75fb62cb",
        eventId: "mkt_a8ba149319c17693b70869797fdaa17f",
        assetClass: "equity",
        symbol: "VIX",
        name: "CBOE Volatility Index",
        price: 28.41,
        changePct: 21.3,
        direction: "up",
        severity: "critical",
        source: "Equity Market",
        publishedAt: "2026-10-17T17:46:47.000Z",
        triggeredAt: "2026-10-17T17:50:02.000Z",
        reason: "large_move"
      }
    },
    "natural.hazard": {
      key: "natural.hazard",
      kind: "occurrence",
      label: "Natural Hazard",
      noun: "Natural Hazard",
      description: "Triggers when WorldMonitor first sees a natural hazard that clears the subscription's hazard types, earthquake magnitude, GDACS alert level and countries: an earthquake from USGS or Earthquakes Canada, or a storm, wildfire, flood, volcano or other event from NASA EONET, GDACS, the National Hurricane Center or the western-Pacific cyclone feed.",
      source: {
        redisKeys: ["seismology:earthquakes:v1", "natural:events:v1"],
        rpcs: ["/api/seismology/v1/list-earthquakes", "/api/natural/v1/list-natural-events"],
        refreshSeconds: 300,
        detection: "Each tick the worker reads both seeded keys and diffs their ids against the seen set webhook:seen:natural.hazard:v1 (scored by when each id was last in a feed, pruned after dedupe.seenWindowSeconds). An unseen id is new when its event time is within dedupe.newWithinSeconds and it is not closed; older or closed unseen ids are marked seen without delivering. GDACS events are new whenever first seen at Orange or Red, since their date is when GDACS opened the event, often while it was Green and not stored. Hong Kong Observatory warning signals are skipped: their id names the signal, not the storm. EONET wildfires titled as prescribed burns (Prescribed Fire \u2026 RX) are skipped: a planned burn is not a wildfire alert. The first tick that finds no seen id for a feed marks every current id of that feed seen and delivers nothing (bootstrap); the feed is then recorded in webhook:seen:natural.hazard:init:v1 (no TTL) and never bootstraps again, so a quiet feed whose seen ids were all pruned does not swallow its next event; if the seen set itself is lost, hazards still inside their new window are delivered once more rather than suppressed. Earthquake rows of natural:events:v1 (GDACS) are skipped, since the earthquake feed carries the same quakes."
      },
      inputSchema: {
        type: "object",
        properties: {
          hazardTypes: {
            type: "array",
            items: {
              type: "string",
              enum: [
                "earthquakes",
                "severeStorms",
                "floods",
                "volcanoes",
                "wildfires",
                "drought",
                "landslides",
                "dustHaze",
                "snow",
                "tempExtremes",
                "seaLakeIce",
                "waterColor",
                "manmade"
              ]
            },
            default: [],
            description: "Hazard types to accept (the natural-events categories; earthquakes come from the earthquake feed). Empty accepts every type."
          },
          minMagnitude: {
            type: "number",
            minimum: 4.5,
            maximum: 9.5,
            default: 5.5,
            description: "Earthquakes only: deliver when magnitude >= minMagnitude. The feed starts at 4.5; 5.5 delivered about 1 quake a day in October 2026 (4.5 about 21). A quake revised across the floor after it was first seen is not delivered."
          },
          minAlertLevel: {
            type: "string",
            enum: ["Orange", "Red"],
            default: "Orange",
            description: "GDACS events only: Orange delivers every GDACS event WorldMonitor stores (it drops Green), Red delivers Red only. An escalation from Orange to Red is a second event (eventId suffix :red), so a Red scope hears of it; a fall back to Orange is not new. Western-Pacific cyclones carry no alert level and pass Orange only. Events from other sources ignore this field."
          },
          countries: {
            type: "array",
            items: { type: "string", pattern: "^[A-Z]{2}$" },
            maxItems: 50,
            default: [],
            description: "ISO 3166-1 alpha-2 codes. A hazard matches when countryCodes names one of them; a hazard placed in no country (open ocean) never matches a country scope. Empty applies no country filter."
          }
        }
      },
      volume: {
        maxDeliveriesPerHour: 30,
        maxDeliveriesPerDay: 150,
        overflow: "dropped and counted per subscription, never batched",
        measured: "2026-10-18, public upstream feeds over 30 days at the default floors: 1.07 earthquakes a day at M5.5+ (at most 2 in an hour, 5 in a day), 1.37 new EONET events a day (32 wildfires, 18 of them prescribed burns; 8 storms; 1 iceberg), 3 GDACS Orange or Red cyclones, and no Orange or Red GDACS floods, fires, droughts or volcanoes started in the window"
      },
      retry: { pendingTtlSeconds: 86400 },
      dedupe: {
        seenWindowSeconds: 2592e3,
        newWithinSeconds: { earthquakes: 86400, other: 259200 },
        crossSource: "An unseen earthquake within 120 seconds, 150 km and 0.6 magnitude of a seen one is the same quake under another id when the seen one came from the other agency or has left the feed (an Earthquakes Canada row replaced by USGS, or a USGS preferred-id change); two quakes the feed still lists side by side are separate events. An unseen storm whose name (classification and season suffix stripped) matches a seen storm is the same storm from another agency (NHC, EONET from JTWC or NOAA, GDACS)."
      },
      id: {
        field: "deliveryId",
        header: "X-WM-Delivery-Id",
        construction: "whd_ + 32 lowercase hex, minted once per (subscription, eventId) and kept across retries",
        eventIdField: "eventId",
        eventIdConstruction: "eq: + the earthquake feed id (a USGS event id, or nrcan: plus the Earthquakes Canada id); nat: + the natural-events id (EONET_<n>, gdacs-<type>-<eventid>, cyclone:wp:<season>:<agency>:<id>), with :red appended to a GDACS event at Red; National Hurricane Center rows, whose id embeds the advisory number (nhc-AL09-12): those are keyed on basin and storm number (nat:nhc-AL09) so a new advisory is not a new storm."
      },
      payloadSchema: {
        type: "object",
        required: ["subscriberId", "eventId", "hazardType", "title", "source", "sourceUrl", "lat", "lon", "countryCodes", "occurredAt", "magnitude", "depthKm", "nearTestSite", "alertLevel", "stormName", "stormCategory", "windKt", "triggeredAt", "reason"],
        properties: {
          subscriberId: { type: "string" },
          eventId: { type: "string", pattern: "^(eq|nat):.+$" },
          hazardType: { type: "string", description: "earthquakes, or the natural-events category (severeStorms, wildfires, floods, volcanoes, drought, seaLakeIce, ...)." },
          title: { type: "string", description: "M<magnitude> - <place> for earthquakes; the agency's title otherwise, without the GDACS alert emoji." },
          source: { type: "string", description: "usgs, nrcan, eonet, gdacs or nhc; a western-Pacific cyclone names the agency it was built from." },
          sourceUrl: { type: ["string", "null"] },
          lat: { type: "number" },
          lon: { type: "number" },
          countryCodes: { type: "array", items: { type: "string" }, description: "The ISO2 country the agency's text names, else the smallest country bounding box containing the point; empty in open ocean." },
          occurredAt: { type: "string", format: "date-time", description: "Earthquake origin time; for other hazards the agency's event or latest-observation time." },
          magnitude: { type: ["number", "null"], description: "Earthquake magnitude; null for other hazards." },
          depthKm: { type: ["number", "null"], description: "Earthquake depth; null for other hazards." },
          nearTestSite: { type: ["boolean", "null"], description: "Earthquakes: true within the radius of a monitored nuclear test site. Null for other hazards." },
          alertLevel: { type: ["string", "null"], enum: ["Orange", "Red", null], description: "GDACS alert level; null for other sources." },
          stormName: { type: ["string", "null"] },
          stormCategory: { type: ["integer", "null"], description: "Saffir-Simpson category where the agency reports one." },
          windKt: { type: ["number", "null"], description: "Maximum sustained wind in knots for storms." },
          triggeredAt: { type: "string", format: "date-time" },
          reason: { type: "string", enum: ["new_hazard"] }
        }
      },
      sample: {
        subscriberId: "wh_041fef6d0657b56b75fb62cb",
        eventId: "eq:us6000u2mq",
        hazardType: "earthquakes",
        title: "M6.9 - 76 km NE of Ozernovskiy, Russia",
        source: "usgs",
        sourceUrl: "https://earthquake.usgs.gov/earthquakes/eventpage/us6000u2mq",
        lat: 51.98,
        lon: 157.27,
        countryCodes: ["RU"],
        occurredAt: "2026-10-16T03:35:31.925Z",
        magnitude: 6.9,
        depthKm: 135,
        nearTestSite: false,
        alertLevel: null,
        stormName: null,
        stormCategory: null,
        windKt: null,
        triggeredAt: "2026-10-16T03:40:02.000Z",
        reason: "new_hazard"
      }
    }
  }
};

// server/worldmonitor/shipping/v2/webhook-shared.ts
var WEBHOOK_TTL = 86400 * 30;
var ALL_INDEX_KEY = "webhook:all:v1";
var VALID_CHOKEPOINT_IDS = new Set(CHOKEPOINT_REGISTRY.map((c) => c.id));
var VALID_EVENT_TYPES = new Set(Object.keys(event_triggers_default.events));
var RISK_SURGE_COUNTRIES = new Set(Object.keys(event_triggers_default.events["country.risk_surge"].countries));
async function generateSecret() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function webhookKey(subscriberId) {
  return `webhook:sub:${subscriberId}:v1`;
}
function ownerIndexKey(ownerHash) {
  return `webhook:owner:${ownerHash}:v1`;
}
async function callerFingerprint(req, resolvedCredential) {
  const key = resolvedCredential ?? req.headers.get("X-WorldMonitor-Key") ?? req.headers.get("X-Api-Key") ?? "";
  if (!key) throw new ApiError(401, "API key required", "");
  const encoded = new TextEncoder().encode(key);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// api/v2/shipping/webhooks/[subscriberId]/[action].ts
var config = { runtime: "edge" };
async function handler(req) {
  const cors = getCorsHeaders(req, "POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
  const apiKeyResult = await validateApiKey(req, { forceKey: true });
  if (apiKeyResult.error === USER_API_KEY_GATEWAY_VALIDATION_ERROR) {
    const validationGuard = await checkFailClosedScopedIpRateLimit(
      req,
      "user-api-key:pre-auth-validation",
      600,
      "60 s",
      cors
    );
    if (validationGuard) return validationGuard;
    const credential = getHeaderApiKey(req);
    let userKey;
    try {
      userKey = credential ? await validateUserApiKey(credential) : null;
    } catch {
      return new Response(JSON.stringify({ error: "Service temporarily unavailable" }), {
        status: 503,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }
    if (!userKey) {
      return new Response(JSON.stringify({ error: "Invalid API key" }), {
        status: 401,
        headers: { ...cors, "Content-Type": "application/json" }
      });
    }
    apiKeyResult.valid = true;
    apiKeyResult.credential = credential;
  }
  if (apiKeyResult.required && !apiKeyResult.valid) {
    return new Response(JSON.stringify({ error: apiKeyResult.error ?? "API key required" }), {
      status: 401,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
  const identity = await resolvePremiumCallerIdentity(req);
  if (!identity.isPremium) {
    if (identity.billingDenial) return renderBillingVerificationDenial(identity.billingDenial, cors);
    return new Response(JSON.stringify({ error: "PRO subscription required" }), {
      status: 403,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
  const url = new URL(req.url);
  const parts = stripTrailingSlashes(url.pathname).split("/");
  const action = parts[parts.length - 1];
  const subscriberId = parts[parts.length - 2];
  if (!subscriberId || !subscriberId.startsWith("wh_")) {
    return new Response(JSON.stringify({ error: "Webhook not found" }), {
      status: 404,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
  if (action !== "rotate-secret" && action !== "reactivate") {
    return new Response(JSON.stringify({ error: "Not found" }), {
      status: 404,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
  const json = (status, body) => new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" }
  });
  let ownerHash = null;
  let newSecret = null;
  for (let attempt = 0; attempt < PERSIST_ATTEMPTS; attempt += 1) {
    const read = await readRecord(subscriberId);
    if (read === "unavailable") return json(503, { error: "Service temporarily unavailable" });
    if (!read) return json(404, { error: "Webhook not found" });
    const { raw, record } = read;
    ownerHash ??= await callerFingerprint(req, apiKeyResult.credential);
    if (record.ownerTag !== ownerHash) return json(403, { error: "Forbidden" });
    let next;
    if (action === "rotate-secret") {
      newSecret ??= await generateSecret();
      next = { ...record, secret: newSecret };
    } else {
      const { deactivatedAt: _deactivatedAt, ...revived } = record;
      next = { ...revived, active: true, failureCount: 0 };
    }
    const outcome = await persistWebhook(subscriberId, raw, next, record.ownerTag);
    if (outcome === "conflict") continue;
    if (outcome !== "stored") return json(503, { error: "Service temporarily unavailable" });
    return action === "rotate-secret" ? json(200, { subscriberId, secret: newSecret, rotatedAt: (/* @__PURE__ */ new Date()).toISOString() }) : json(200, { subscriberId, active: true });
  }
  return json(503, { error: "Service temporarily unavailable" });
}
var PERSIST_ATTEMPTS = 3;
var PERSIST_SCRIPT = [
  "if redis.call('GET', KEYS[1]) ~= ARGV[1] then return 0 end",
  "redis.call('SET', KEYS[1], ARGV[2], 'EX', ARGV[3])",
  "redis.call('SADD', KEYS[2], ARGV[4])",
  "redis.call('EXPIRE', KEYS[2], ARGV[3])",
  "redis.call('SADD', KEYS[3], ARGV[4])",
  "return 1"
].join(" ");
async function readRecord(subscriberId) {
  const [row] = await runRedisPipeline([["GET", webhookKey(subscriberId)]]);
  if (!row || row.error) return "unavailable";
  if (typeof row.result !== "string") return null;
  try {
    return { raw: row.result, record: JSON.parse(row.result) };
  } catch {
    return null;
  }
}
async function persistWebhook(subscriberId, expectedRaw, record, ownerTag) {
  const [row] = await runRedisPipeline([[
    "EVAL",
    PERSIST_SCRIPT,
    "3",
    webhookKey(subscriberId),
    ownerIndexKey(ownerTag),
    ALL_INDEX_KEY,
    expectedRaw,
    JSON.stringify(record),
    String(WEBHOOK_TTL),
    subscriberId
  ]]);
  if (!row || row.error) return "unavailable";
  if (row.result === 1 || row.result === "1") return "stored";
  if (row.result === 0 || row.result === "0") return "conflict";
  return "unavailable";
}
export {
  config,
  handler as default
};
