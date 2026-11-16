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
    var __export2 = (target, all) => {
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
    __export2(src_exports, {
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
    __export2(ip_deny_list_exports, {
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
var __defProp2, __export, error_exports, UpstashError, UrlError, UpstashJSONParseError, MAX_BUFFER_SIZE;
var init_chunk_IH7W44G6 = __esm({
  "node_modules/@upstash/redis/chunk-IH7W44G6.mjs"() {
    __defProp2 = Object.defineProperty;
    __export = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    error_exports = {};
    __export(error_exports, {
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

// shared/compare-and-delete-script.cjs
var require_compare_and_delete_script = __commonJS({
  "shared/compare-and-delete-script.cjs"(exports, module) {
    "use strict";
    var COMPARE_AND_DELETE_SCRIPT2 = "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end";
    module.exports = { COMPARE_AND_DELETE_SCRIPT: COMPARE_AND_DELETE_SCRIPT2 };
  }
});

// shared/country-names.json
var country_names_default = {
  afghanistan: "AF",
  aland: "AX",
  albania: "AL",
  algeria: "DZ",
  "american samoa": "AS",
  andorra: "AD",
  angola: "AO",
  anguilla: "AI",
  antarctica: "AQ",
  "antigua and barbuda": "AG",
  argentina: "AR",
  armenia: "AM",
  aruba: "AW",
  australia: "AU",
  austria: "AT",
  azerbaijan: "AZ",
  bahamas: "BS",
  "bahamas the": "BS",
  bahrain: "BH",
  bangladesh: "BD",
  barbados: "BB",
  belarus: "BY",
  belgium: "BE",
  belize: "BZ",
  benin: "BJ",
  bermuda: "BM",
  bhutan: "BT",
  "bolivarian republic of venezuela": "VE",
  bolivia: "BO",
  "bosnia and herzegovina": "BA",
  botswana: "BW",
  brazil: "BR",
  "british indian ocean territory": "IO",
  "british virgin islands": "VG",
  brunei: "BN",
  "brunei darussalam": "BN",
  bulgaria: "BG",
  "burkina faso": "BF",
  burma: "MM",
  burundi: "BI",
  "cabo verde": "CV",
  cambodia: "KH",
  cameroon: "CM",
  canada: "CA",
  "cape verde": "CV",
  "cayman islands": "KY",
  "central african republic": "CF",
  chad: "TD",
  chile: "CL",
  china: "CN",
  colombia: "CO",
  comoros: "KM",
  congo: "CG",
  "congo brazzaville": "CG",
  "congo dem rep": "CD",
  "congo kinshasa": "CD",
  "congo rep": "CG",
  "cook islands": "CK",
  "costa rica": "CR",
  "cote d ivoire": "CI",
  "cote divoire": "CI",
  croatia: "HR",
  cuba: "CU",
  curacao: "CW",
  cyprus: "CY",
  "czech republic": "CZ",
  czechia: "CZ",
  "democratic peoples republic of korea": "KP",
  "democratic republic of korea": "KP",
  "democratic republic of the congo": "CD",
  denmark: "DK",
  djibouti: "DJ",
  dominica: "DM",
  "dominican republic": "DO",
  "dr congo": "CD",
  drc: "CD",
  "east timor": "TL",
  ecuador: "EC",
  egypt: "EG",
  "egypt arab rep": "EG",
  "el salvador": "SV",
  "equatorial guinea": "GQ",
  eritrea: "ER",
  estonia: "EE",
  eswatini: "SZ",
  ethiopia: "ET",
  "falkland islands": "FK",
  "faroe islands": "FO",
  "federated states of micronesia": "FM",
  fiji: "FJ",
  finland: "FI",
  france: "FR",
  "french polynesia": "PF",
  "french southern and antarctic lands": "TF",
  gabon: "GA",
  gambia: "GM",
  "gambia the": "GM",
  gaza: "PS",
  georgia: "GE",
  germany: "DE",
  ghana: "GH",
  gibraltar: "GI",
  greece: "GR",
  greenland: "GL",
  grenada: "GD",
  guam: "GU",
  guatemala: "GT",
  guernsey: "GG",
  guinea: "GN",
  "guinea bissau": "GW",
  guyana: "GY",
  haiti: "HT",
  "heard island and mcdonald islands": "HM",
  honduras: "HN",
  "hong kong": "HK",
  "hong kong s a r": "HK",
  "hong kong sar china": "HK",
  hungary: "HU",
  iceland: "IS",
  india: "IN",
  indonesia: "ID",
  iran: "IR",
  "iran islamic rep": "IR",
  iraq: "IQ",
  ireland: "IE",
  "isle of man": "IM",
  israel: "IL",
  italy: "IT",
  "ivory coast": "CI",
  jamaica: "JM",
  japan: "JP",
  jersey: "JE",
  jordan: "JO",
  kazakhstan: "KZ",
  kenya: "KE",
  kiribati: "KI",
  "korea dem peoples rep": "KP",
  "korea rep": "KR",
  kosovo: "XK",
  kuwait: "KW",
  "kyrgyz republic": "KG",
  kyrgyzstan: "KG",
  "lao pdr": "LA",
  laos: "LA",
  latvia: "LV",
  lebanon: "LB",
  lesotho: "LS",
  liberia: "LR",
  libya: "LY",
  liechtenstein: "LI",
  lithuania: "LT",
  luxembourg: "LU",
  "macao s a r": "MO",
  "macao sar china": "MO",
  madagascar: "MG",
  malawi: "MW",
  malaysia: "MY",
  maldives: "MV",
  mali: "ML",
  malta: "MT",
  "marshall islands": "MH",
  mauritania: "MR",
  mauritius: "MU",
  mexico: "MX",
  micronesia: "FM",
  "micronesia fed sts": "FM",
  moldova: "MD",
  monaco: "MC",
  mongolia: "MN",
  montenegro: "ME",
  montserrat: "MS",
  morocco: "MA",
  mozambique: "MZ",
  myanmar: "MM",
  namibia: "NA",
  nauru: "NR",
  nepal: "NP",
  netherlands: "NL",
  "new caledonia": "NC",
  "new zealand": "NZ",
  nicaragua: "NI",
  niger: "NE",
  nigeria: "NG",
  niue: "NU",
  "norfolk island": "NF",
  "north korea": "KP",
  "north macedonia": "MK",
  "northern mariana islands": "MP",
  norway: "NO",
  "occupied palestinian territory": "PS",
  oman: "OM",
  pakistan: "PK",
  palau: "PW",
  palestine: "PS",
  "palestine state of": "PS",
  "palestinian territories": "PS",
  panama: "PA",
  "papua new guinea": "PG",
  paraguay: "PY",
  peru: "PE",
  philippines: "PH",
  "pitcairn islands": "PN",
  "plurinational state of bolivia": "BO",
  poland: "PL",
  portugal: "PT",
  "puerto rico": "PR",
  qatar: "QA",
  "republic of korea": "KR",
  "republic of serbia": "RS",
  "republic of the congo": "CG",
  romania: "RO",
  russia: "RU",
  "russian federation": "RU",
  rwanda: "RW",
  "saint barthelemy": "BL",
  "saint helena": "SH",
  "saint kitts and nevis": "KN",
  "saint lucia": "LC",
  "saint martin": "MF",
  "saint pierre and miquelon": "PM",
  "saint vincent and the grenadines": "VC",
  samoa: "WS",
  "san marino": "SM",
  "sao tome": "ST",
  "sao tome and principe": "ST",
  "saudi arabia": "SA",
  senegal: "SN",
  serbia: "RS",
  seychelles: "SC",
  "sierra leone": "SL",
  singapore: "SG",
  "sint maarten": "SX",
  "slovak republic": "SK",
  slovakia: "SK",
  slovenia: "SI",
  "solomon islands": "SB",
  somalia: "SO",
  "south africa": "ZA",
  "south georgia and the islands": "GS",
  "south korea": "KR",
  "south sudan": "SS",
  spain: "ES",
  "sri lanka": "LK",
  "st kitts and nevis": "KN",
  "st lucia": "LC",
  "st vincent and the grenadines": "VC",
  sudan: "SD",
  suriname: "SR",
  swaziland: "SZ",
  sweden: "SE",
  switzerland: "CH",
  syria: "SY",
  "syrian arab republic": "SY",
  taiwan: "TW",
  tajikistan: "TJ",
  tanzania: "TZ",
  thailand: "TH",
  "the bahamas": "BS",
  "the comoros": "KM",
  "the gambia": "GM",
  "the maldives": "MV",
  "the netherlands": "NL",
  "the philippines": "PH",
  "the seychelles": "SC",
  "timor leste": "TL",
  togo: "TG",
  tonga: "TO",
  "trinidad and tobago": "TT",
  tunisia: "TN",
  turkey: "TR",
  turkiye: "TR",
  turkmenistan: "TM",
  "turks and caicos": "TC",
  "turks and caicos islands": "TC",
  tuvalu: "TV",
  "u s": "US",
  "u s virgin islands": "VI",
  uae: "AE",
  uganda: "UG",
  uk: "GB",
  ukraine: "UA",
  "united arab emirates": "AE",
  "united kingdom": "GB",
  "united republic of tanzania": "TZ",
  "united states": "US",
  "united states minor outlying islands": "UM",
  "united states of america": "US",
  "united states virgin islands": "VI",
  uruguay: "UY",
  usa: "US",
  uzbekistan: "UZ",
  vanuatu: "VU",
  vatican: "VA",
  venezuela: "VE",
  "venezuela rb": "VE",
  "viet nam": "VN",
  vietnam: "VN",
  "virgin islands uk": "VG",
  "wallis and futuna": "WF",
  "west bank": "PS",
  "west bank and gaza": "PS",
  "western sahara": "EH",
  yemen: "YE",
  "yemen rep": "YE",
  zambia: "ZM",
  zimbabwe: "ZW"
};

// shared/iso3-to-iso2.json
var iso3_to_iso2_default = {
  ABW: "AW",
  AFG: "AF",
  AGO: "AO",
  AIA: "AI",
  ALA: "AX",
  ALB: "AL",
  AND: "AD",
  ARE: "AE",
  ARG: "AR",
  ARM: "AM",
  ASM: "AS",
  ATA: "AQ",
  ATF: "TF",
  ATG: "AG",
  AUS: "AU",
  AUT: "AT",
  AZE: "AZ",
  BDI: "BI",
  BEL: "BE",
  BEN: "BJ",
  BFA: "BF",
  BGD: "BD",
  BGR: "BG",
  BHR: "BH",
  BHS: "BS",
  BIH: "BA",
  BLM: "BL",
  BLR: "BY",
  BLZ: "BZ",
  BMU: "BM",
  BOL: "BO",
  BRA: "BR",
  BRB: "BB",
  BRN: "BN",
  BTN: "BT",
  BWA: "BW",
  CAF: "CF",
  CAN: "CA",
  CHE: "CH",
  CHL: "CL",
  CHN: "CN",
  CIV: "CI",
  CMR: "CM",
  COD: "CD",
  COG: "CG",
  COK: "CK",
  COL: "CO",
  COM: "KM",
  CPV: "CV",
  CRI: "CR",
  CUB: "CU",
  CUW: "CW",
  CYM: "KY",
  CYP: "CY",
  CZE: "CZ",
  DEU: "DE",
  DJI: "DJ",
  DMA: "DM",
  DNK: "DK",
  DOM: "DO",
  DZA: "DZ",
  ECU: "EC",
  EGY: "EG",
  ERI: "ER",
  ESH: "EH",
  ESP: "ES",
  EST: "EE",
  ETH: "ET",
  FIN: "FI",
  FJI: "FJ",
  FLK: "FK",
  FRA: "FR",
  FRO: "FO",
  FSM: "FM",
  GAB: "GA",
  GBR: "GB",
  GEO: "GE",
  GGY: "GG",
  GHA: "GH",
  GIB: "GI",
  GIN: "GN",
  GMB: "GM",
  GNB: "GW",
  GNQ: "GQ",
  GRC: "GR",
  GRD: "GD",
  GRL: "GL",
  GTM: "GT",
  GUM: "GU",
  GUY: "GY",
  HKG: "HK",
  HMD: "HM",
  HND: "HN",
  HRV: "HR",
  HTI: "HT",
  HUN: "HU",
  IDN: "ID",
  IMN: "IM",
  IND: "IN",
  IOT: "IO",
  IRL: "IE",
  IRN: "IR",
  IRQ: "IQ",
  ISL: "IS",
  ISR: "IL",
  ITA: "IT",
  JAM: "JM",
  JEY: "JE",
  JOR: "JO",
  JPN: "JP",
  KAZ: "KZ",
  KEN: "KE",
  KGZ: "KG",
  KHM: "KH",
  KIR: "KI",
  KNA: "KN",
  KOR: "KR",
  KWT: "KW",
  LAO: "LA",
  LBN: "LB",
  LBR: "LR",
  LBY: "LY",
  LCA: "LC",
  LIE: "LI",
  LKA: "LK",
  LSO: "LS",
  LTU: "LT",
  LUX: "LU",
  LVA: "LV",
  MAC: "MO",
  MAF: "MF",
  MAR: "MA",
  MCO: "MC",
  MDA: "MD",
  MDG: "MG",
  MDV: "MV",
  MEX: "MX",
  MHL: "MH",
  MKD: "MK",
  MLI: "ML",
  MLT: "MT",
  MMR: "MM",
  MNE: "ME",
  MNG: "MN",
  MNP: "MP",
  MOZ: "MZ",
  MRT: "MR",
  MSR: "MS",
  MUS: "MU",
  MWI: "MW",
  MYS: "MY",
  NAM: "NA",
  NCL: "NC",
  NER: "NE",
  NFK: "NF",
  NGA: "NG",
  NIC: "NI",
  NIU: "NU",
  NLD: "NL",
  NOR: "NO",
  NPL: "NP",
  NRU: "NR",
  NZL: "NZ",
  OMN: "OM",
  PAK: "PK",
  PAN: "PA",
  PCN: "PN",
  PER: "PE",
  PHL: "PH",
  PLW: "PW",
  PNG: "PG",
  POL: "PL",
  PRI: "PR",
  PRK: "KP",
  PRT: "PT",
  PRY: "PY",
  PSE: "PS",
  PYF: "PF",
  QAT: "QA",
  ROU: "RO",
  RUS: "RU",
  RWA: "RW",
  SAU: "SA",
  SDN: "SD",
  SEN: "SN",
  SGP: "SG",
  SGS: "GS",
  SHN: "SH",
  SLB: "SB",
  SLE: "SL",
  SLV: "SV",
  SMR: "SM",
  SOM: "SO",
  SPM: "PM",
  SRB: "RS",
  SSD: "SS",
  STP: "ST",
  SUR: "SR",
  SVK: "SK",
  SVN: "SI",
  SWE: "SE",
  SWZ: "SZ",
  SXM: "SX",
  SYC: "SC",
  SYR: "SY",
  TCA: "TC",
  TCD: "TD",
  TGO: "TG",
  THA: "TH",
  TJK: "TJ",
  TKM: "TM",
  TLS: "TL",
  TON: "TO",
  TTO: "TT",
  TUN: "TN",
  TUR: "TR",
  TUV: "TV",
  TWN: "TW",
  TZA: "TZ",
  UGA: "UG",
  UKR: "UA",
  UMI: "UM",
  URY: "UY",
  USA: "US",
  UZB: "UZ",
  VAT: "VA",
  VCT: "VC",
  VEN: "VE",
  VGB: "VG",
  VIR: "VI",
  VNM: "VN",
  VUT: "VU",
  WLF: "WF",
  WSM: "WS",
  XKX: "XK",
  YEM: "YE",
  ZAF: "ZA",
  ZMB: "ZM",
  ZWE: "ZW"
};

// shared/country-code-resolve.ts
var EXTRA_ALIASES = { "bosnia herzegovina": "BA" };
var NAME_TO_ISO2 = Object.assign(/* @__PURE__ */ Object.create(null), country_names_default, EXTRA_ALIASES);
var ISO3_MAP = Object.assign(/* @__PURE__ */ Object.create(null), iso3_to_iso2_default);
var ASSIGNED_ISO2_OUTSIDE_GEOJSON = ["BQ", "BV", "CC", "CX", "GF", "GP", "MQ", "RE", "SJ", "TK", "YT"];
var ASSIGNED_ISO2 = /* @__PURE__ */ new Set([
  ...Object.values(ISO3_MAP),
  ...ASSIGNED_ISO2_OUTSIDE_GEOJSON
]);
var ISO2_PATTERN = /^[A-Z]{2}$/;
var ISO3_PATTERN = /^[A-Z]{3}$/;
function asIso2(value) {
  return typeof value === "string" && ISO2_PATTERN.test(value) ? value : null;
}
function normalizeCountryToken(raw) {
  return String(raw ?? "").normalize("NFKD").replace(new RegExp("\\p{Diacritic}", "gu"), "").toLowerCase().replace(/&/g, " and ").replace(/['’‘`.(),/-]/g, " ").replace(/\s+/g, " ").trim();
}
function resolveDesignator(value) {
  const byName = asIso2(NAME_TO_ISO2[normalizeCountryToken(value)]);
  if (byName) return byName;
  const upper = value.trim().toUpperCase();
  if (ISO2_PATTERN.test(upper)) return upper;
  if (ISO3_PATTERN.test(upper)) return asIso2(ISO3_MAP[upper]);
  return null;
}
var MAX_DESIGNATOR_LENGTH = 128;
function resolveCountryCode(raw) {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_DESIGNATOR_LENGTH) return null;
  const whole = resolveDesignator(trimmed);
  if (whole) return whole;
  const parenthetical = trimmed.match(/^([^(]*)\s*\(([^)]*)\)$/);
  if (!parenthetical) return null;
  const base = (parenthetical[1] ?? "").trim();
  const inner = (parenthetical[2] ?? "").trim();
  if (!base || !inner) return resolveDesignator(base || inner);
  const baseName = asIso2(NAME_TO_ISO2[normalizeCountryToken(base)]);
  const innerName = asIso2(NAME_TO_ISO2[normalizeCountryToken(inner)]);
  if (baseName && innerName && baseName !== innerName) return null;
  const baseTokens = normalizeCountryToken(base).split(" ").filter(Boolean);
  const innerToken = normalizeCountryToken(inner);
  for (let at = 0; at <= baseTokens.length; at++) {
    const combined = [...baseTokens.slice(0, at), innerToken, ...baseTokens.slice(at)].join(" ");
    const hit = asIso2(NAME_TO_ISO2[combined]);
    if (hit) return hit;
  }
  const fromInner = resolveDesignator(inner);
  const fromBase = resolveDesignator(base);
  if (fromInner && fromBase) return fromInner === fromBase ? fromInner : null;
  return fromInner ?? fromBase ?? null;
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

// api/mcp/_country-args.ts
var MAX_ECHOED_COUNTRY_INPUT = 64;
function echoCountryInput(raw) {
  const text = typeof raw === "string" ? raw.trim() : `<non-string ${typeof raw}>`;
  return text.length > MAX_ECHOED_COUNTRY_INPUT ? `${text.slice(0, MAX_ECHOED_COUNTRY_INPUT)}\u2026` : text;
}
var COUNTRY_ARG_HINT = 'Pass an ISO 3166-1 alpha-2 code (e.g. "IQ"), an alpha-3 code ("IRQ"), or an English country name ("Iraq").';
function requireCountryCode(raw, operation, field = "country_code") {
  const resolved = resolveCountryCode(raw);
  if (resolved) return resolved;
  throw new RpcValidationError(operation, [{
    field,
    description: `Could not resolve ${JSON.stringify(echoCountryInput(raw))} to a country. ${COUNTRY_ARG_HINT}`
  }]);
}

// api/mcp/auth.ts
var import_ratelimit2 = __toESM(require_dist2(), 1);
init_nodejs();

// api/_client-ip.js
var RATE_LIMIT_DEGRADED_HEADERS = Object.freeze({
  "X-RateLimit-Mode": "degraded",
  "Retry-After": "5"
});
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
  const [networkText, prefixText] = cidr.split("/");
  const network = parseIpv4(networkText);
  if (network === null) throw new Error(`Invalid Cloudflare IPv4 CIDR: ${cidr}`);
  return [network, Number(prefixText)];
}
function parseIpv6Cidr(cidr) {
  const [networkText, prefixText] = cidr.split("/");
  const network = parseIpv6(networkText);
  if (network === null) throw new Error(`Invalid Cloudflare IPv6 CIDR: ${cidr}`);
  return [network, Number(prefixText)];
}
var CLOUDFLARE_IPV4_RANGES = Object.freeze(CLOUDFLARE_IPV4_CIDRS.map(parseIpv4Cidr));
var CLOUDFLARE_IPV6_RANGES = Object.freeze(CLOUDFLARE_IPV6_CIDRS.map(parseIpv6Cidr));

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

// server/_shared/redis.ts
var import_compare_and_delete_script = __toESM(require_compare_and_delete_script(), 1);

// server/_shared/client-ip.ts
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
  const [networkText = "", prefixText = ""] = cidr.split("/");
  const network = parseIpv42(networkText);
  if (network === null) throw new Error(`Invalid Cloudflare IPv4 CIDR: ${cidr}`);
  return [network, Number(prefixText)];
}
function parseIpv6Cidr2(cidr) {
  const [networkText = "", prefixText = ""] = cidr.split("/");
  const network = parseIpv62(networkText);
  if (network === null) throw new Error(`Invalid Cloudflare IPv6 CIDR: ${cidr}`);
  return [network, Number(prefixText)];
}
var CLOUDFLARE_IPV4_RANGES2 = Object.freeze(CLOUDFLARE_IPV4_CIDRS2.map(parseIpv4Cidr2));
var CLOUDFLARE_IPV6_RANGES2 = Object.freeze(CLOUDFLARE_IPV6_CIDRS2.map(parseIpv6Cidr2));

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
async function sha256Hex2(input) {
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
  const queryHash = await sha256Hex2(canonicalQueryString(url));
  const bodyHash = await sha256Hex2(await coerceBodyToString(args.body));
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
function telemetryEnabled() {
  const v = process.env.MCP_TELEMETRY;
  return v !== "false" && v !== "0";
}
function emitTelemetry(event, payload) {
  if (!telemetryEnabled()) return;
  try {
    console.log({ tag: event, ts: (/* @__PURE__ */ new Date()).toISOString(), ...payload });
  } catch {
  }
}
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

// api/mcp/downstream.ts
var SAFE_GATEWAY_ERROR_CODES = /* @__PURE__ */ new Set([
  "invalid_internal_mcp_signature",
  "internal_mcp_replay_cache_unavailable",
  "insufficient_entitlement",
  "entitlement_verification_unavailable",
  "subscription_lapsed",
  "renewal_verification_pending",
  "renewal_verification_failed",
  "payload_too_large",
  "rate_limited"
]);
var SAFE_GATEWAY_ERROR_MESSAGES = /* @__PURE__ */ new Map([
  ["invalid api key", "invalid_api_key"],
  ["invalid or expired session", "invalid_session"],
  ["api access requires an active subscription", "api_subscription_required"],
  ["pro subscription required", "pro_subscription_required"],
  ["unable to verify api access", "entitlement_verification_unavailable"],
  ["method not allowed", "method_not_allowed"],
  ["configuration", "configuration"]
]);
var ToolFetchError = class extends Error {
  operation;
  status;
  safeCode;
  responseMarker;
  constructor(operation, status, safeCode, responseMarker) {
    super(`${operation} HTTP ${status}: ${safeCode}`);
    this.name = "ToolFetchError";
    this.operation = operation;
    this.status = status;
    this.safeCode = safeCode;
    this.responseMarker = responseMarker;
  }
};
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
function contentType(response) {
  return (response.headers?.get("Content-Type") ?? "").toLowerCase();
}
function successMarker(response) {
  const type = contentType(response);
  if (type.includes("json")) return "json";
  if (type.includes("html")) return "html";
  return "other";
}
function defaultSafeErrorCode(status) {
  if (status === 401) return "auth_rejected";
  if (status === 403) return "forbidden";
  if (status === 405) return "method_not_allowed";
  if (status === 429) return "rate_limited";
  return "upstream_http_error";
}
function safeGatewayErrorCode(value, status) {
  if (typeof value !== "string") return defaultSafeErrorCode(status);
  const normalized = value.trim().toLowerCase();
  if (SAFE_GATEWAY_ERROR_CODES.has(normalized)) return normalized;
  return SAFE_GATEWAY_ERROR_MESSAGES.get(normalized) ?? defaultSafeErrorCode(status);
}
async function classifyFailure(response) {
  if (response.status === 405) {
    return { errorCode: "method_not_allowed", marker: "method_not_allowed", violations: [] };
  }
  const type = contentType(response);
  const budget = response.status === 400 ? MAX_VALIDATION_BODY_BYTES : 4096;
  const detail = await readBoundedResponseText(response, budget);
  if (!detail) {
    return {
      errorCode: defaultSafeErrorCode(response.status),
      marker: "empty_error",
      violations: []
    };
  }
  const hasJsonContentType = type.includes("json");
  const mayContainValidationBody = response.status === 400 && !type.includes("html");
  if (hasJsonContentType || mayContainValidationBody) {
    try {
      const parsed = JSON.parse(detail);
      const coded = parsed.code ?? parsed.error;
      const violations = mayContainValidationBody && (coded === void 0 || coded === null) ? parseSafeRpcViolations(parsed) : [];
      if (violations.length > 0 || hasJsonContentType) {
        return {
          errorCode: violations.length > 0 ? "rpc_validation" : safeGatewayErrorCode(coded, response.status),
          marker: "json_error",
          violations
        };
      }
    } catch {
      if (hasJsonContentType) {
        return {
          errorCode: defaultSafeErrorCode(response.status),
          marker: "json_error",
          violations: []
        };
      }
    }
  }
  return {
    errorCode: defaultSafeErrorCode(response.status),
    marker: type.includes("html") ? "html_error" : "other",
    violations: []
  };
}
function emitDownstreamTelemetry(tool, operation, auth, execution, response, errorCode, responseMarker) {
  if (!execution) return;
  emitTelemetry("mcp.downstream", {
    tool,
    auth_kind: auth.kind,
    inbound_host_class: execution.inboundHostClass,
    downstream_origin: execution.downstreamOriginTag,
    downstream_operation: operation,
    status: response.status,
    ok: response.ok,
    error_code: errorCode,
    response_marker: responseMarker
  });
}
async function assertMcpToolFetchOk(response, observation) {
  const { operation, tool, auth, execution } = observation;
  if (response.ok) {
    emitDownstreamTelemetry(
      tool,
      operation,
      auth,
      execution,
      response,
      null,
      successMarker(response)
    );
    return;
  }
  try {
    throwIfBillingDenial(response, operation);
  } catch (error) {
    if (error instanceof BillingDenialError) {
      emitDownstreamTelemetry(
        tool,
        operation,
        auth,
        execution,
        response,
        error.billingCode,
        "billing_verification"
      );
    }
    throw error;
  }
  const failure = await classifyFailure(response);
  emitDownstreamTelemetry(
    tool,
    operation,
    auth,
    execution,
    response,
    failure.errorCode,
    failure.marker
  );
  if (failure.violations.length > 0) {
    throw new RpcValidationError(operation, failure.violations);
  }
  throw new ToolFetchError(
    operation,
    response.status,
    failure.errorCode,
    failure.marker
  );
}

// api/mcp/registry/country-history-tool.ts
var score = { type: "object", required: ["score", "version", "observedAt"], properties: { score: { type: "number", minimum: 0, maximum: 100 }, version: { type: "string" }, observedAt: { type: "number" } } };
var COUNTRY_HISTORY_TOOL = {
  name: "get_country_history",
  title: "Country daily history",
  description: "Read cached daily country CII, resilience and linked headlines. Account depth: Pro 90 days; API/Enterprise 365. Starts at activation; gaps and formula breaks remain explicit. One request. Large outputs retain one headline per day, marked events_reduced_for_output_budget.",
  _subscriptionOnly: true,
  _outputBudgetBytes: 1048576,
  _apiPaths: ["GET /api/intelligence/v1/get-country-history"],
  _coverageKeys: ["history:country:index"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: { type: "object", required: ["country_code"], properties: {
    country_code: { type: "string", description: "Assigned ISO alpha-2 country code, such as US or FR." },
    days: { type: "integer", minimum: 1, maximum: 365, description: "UTC calendar days including today. Defaults to 7; the account retention limit applies." }
  } },
  outputSchema: { type: "object", required: ["country", "requestedDays", "allowedDays", "effectiveDays", "returnedDays", "points", "stale", "upstreamUnavailable", "fetchedAt"], properties: {
    country: { type: "string" },
    requestedDays: { type: "integer" },
    allowedDays: { type: "integer" },
    effectiveDays: { type: "integer" },
    returnedDays: { type: "integer" },
    stale: { type: "boolean" },
    upstreamUnavailable: { type: "boolean" },
    fetchedAt: { type: "number" },
    points: { type: "array", maxItems: 365, items: { type: "object", required: ["date", "capturedAt", "topEvents", "keySignals", "ciiVersionBreak", "resilienceVersionBreak"], properties: {
      date: { type: "string" },
      capturedAt: { type: "number" },
      cii: score,
      resilience: score,
      ciiVersionBreak: { type: "boolean" },
      resilienceVersionBreak: { type: "boolean" },
      keySignals: { type: "array", items: { type: "string" } },
      topEvents: { type: "array", maxItems: 5, items: { type: "object", required: ["title", "link", "source", "category"], properties: { title: { type: "string" }, link: { type: "string" }, source: { type: "string" }, category: { type: "string" } } } }
    } } }
  } },
  _fitToBudget(result) {
    if (!Array.isArray(result.points)) return result;
    return { ...result, points: result.points.map((point) => ({ ...point, topEvents: point.topEvents.slice(0, 1), keySignals: point.topEvents.length > 1 ? [...point.keySignals, "events_reduced_for_output_budget"] : point.keySignals })) };
  },
  async _execute(params, base, context, execution) {
    const country = requireCountryCode(params.country_code, "get_country_history", "country_code");
    const days = params.days ?? 7;
    if (typeof days !== "number" || !Number.isInteger(days) || days < 1 || days > 365) throw new RpcValidationError("get_country_history", [{ field: "days", description: "Use an integer from 1 to 365." }]);
    const url = `${base}/api/intelligence/v1/get-country-history?country=${encodeURIComponent(country)}&days=${days}`;
    const response = await fetchMcpDownstream(url, { headers: { ...await buildAuthHeaders(context, "GET", url, null), "User-Agent": "worldmonitor-mcp-edge/1.0" }, signal: AbortSignal.timeout(8e3) }, execution);
    await assertMcpToolFetchOk(response, { tool: "get_country_history", operation: "get-country-history", auth: context });
    return response.json();
  }
};
export {
  COUNTRY_HISTORY_TOOL
};
