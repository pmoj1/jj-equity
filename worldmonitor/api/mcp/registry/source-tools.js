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

// shared/source-attribution-manifest.json
var source_attribution_manifest_default = {
  version: 1,
  entries: [
    {
      host: "127.0.0.1",
      provider: "Local loopback transport",
      kind: "structured",
      observed: true,
      license: "Excluded: local development/desktop transport",
      attribution: "Excluded from the provider count: local-only loopback URL.",
      status: "excluded",
      references: [
        {
          path: "scripts/measure-trade-animation-rebuild.mjs"
        },
        {
          path: "scripts/profile-news-hybrid-clustering-7782-dashboard.mjs"
        },
        {
          path: "src/services/desktop-sign-in-page.ts"
        },
        {
          path: "src/services/runtime.ts"
        }
      ]
    },
    {
      host: "24.hu",
      provider: "24.hu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit 24.hu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "247preview.foxnews.com",
      provider: "247preview.foxnews.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "36kr.com",
      provider: "36kr.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit 36kr.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "444.hu",
      provider: "444.hu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit 444.hu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "511.alberta.ca",
      provider: "Alberta 511",
      kind: "structured",
      observed: true,
      license: "Alberta 511 terms (https://511.alberta.ca/about/about): non-commercial/educational reproduction allowed; commercial reproduction needs written permission from Alberta Transportation and Economic Corridors. https://511.alberta.ca/help/terms returned 404.",
      attribution: "Alberta 511 (Alberta Transportation and Economic Corridors). https://511.alberta.ca/",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/provincial-511.mjs"
        }
      ]
    },
    {
      host: "511on.ca",
      provider: "Ontario 511",
      kind: "structured",
      observed: true,
      license: "Ontario 511 API terms; Government of Ontario data; attribution required",
      attribution: "Ontario 511 (Ministry of Transportation). https://511on.ca/",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/provincial-511.mjs"
        }
      ]
    },
    {
      host: "a16z.com",
      provider: "a16z.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit a16z.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "abacus.worldmonitor.app",
      provider: "abacus.worldmonitor.app",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/check-analytics-collector.mjs"
        },
        {
          path: "src/services/analytics.ts"
        }
      ]
    },
    {
      host: "abc-iview-mediapackagestreams-2.akamaized.net",
      provider: "abc-iview-mediapackagestreams-2.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "abplivetv.pc.cdn.bitgravity.com",
      provider: "abplivetv.pc.cdn.bitgravity.com",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "accounts.google.com",
      provider: "Google account sign-in",
      kind: "structured",
      observed: true,
      license: "Excluded: authentication/UI link",
      attribution: "Excluded from the provider count: user sign-in redirect, not an ingested source.",
      status: "excluded",
      references: [
        {
          path: "src/components/LiveNewsPanel.ts"
        }
      ]
    },
    {
      host: "acleddata.com",
      provider: "acleddata.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit acleddata.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-conflict-intel.mjs"
        },
        {
          path: "scripts/seed-unrest-events.mjs"
        },
        {
          path: "scripts/shared/acled-oauth.mjs"
        },
        {
          path: "server/_shared/acled-auth.ts"
        },
        {
          path: "server/_shared/acled.ts"
        }
      ]
    },
    {
      host: "actualite.cd",
      provider: "actualite.cd",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit actualite.cd and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "actuniger.com",
      provider: "ActuNiger",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit ActuNiger and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "admin.gse.com.ge",
      provider: "admin.gse.com.ge",
      kind: "structured",
      observed: true,
      license: "Unconfirmed",
      attribution: "Credit Georgian State Electrosystem and link to https://admin.gse.com.ge/api/en/menu/actual-balance-125.",
      status: "terms-review",
      references: [
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "ae.usembassy.gov",
      provider: "ae.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit ae.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "aerotime.aero",
      provider: "aerotime.aero",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit aerotime.aero and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aviation-news.ts"
        }
      ]
    },
    {
      host: "agentskills.io",
      provider: "agentskills.io",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit agentskills.io and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/skills/fetch-agentskills.ts"
        }
      ]
    },
    {
      host: "agsi.gie.eu",
      provider: "agsi.gie.eu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit agsi.gie.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-gas-storage-countries.mjs"
        },
        {
          path: "scripts/seed-gie-gas-storage.mjs"
        }
      ]
    },
    {
      host: "airinfoagadez.com",
      provider: "A\xEFr Info",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit A\xEFr Info and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "airlinegeeks.com",
      provider: "airlinegeeks.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit airlinegeeks.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aviation-news.ts"
        }
      ]
    },
    {
      host: "aljazeera.com",
      provider: "Al Jazeera",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Al Jazeera and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "amdlive-ch01-ctnd-com.akamaized.net",
      provider: "amdlive-ch01-ctnd-com.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "amg00106-france24-france24-samsunguk-qvpp8.amagi.tv",
      provider: "amg00106-france24-france24-samsunguk-qvpp8.amagi.tv",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "amna.gr",
      provider: "amna.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit amna.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "amu.tv",
      provider: "Amu TV",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Amu TV and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "angellist.com",
      provider: "angellist.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit angellist.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "annahar.com",
      provider: "Annahar",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Annahar and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "api-nms.aim.faa.gov",
      provider: "api-nms.aim.faa.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api-nms.aim.faa.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-notam-nms.mjs"
        }
      ]
    },
    {
      host: "api.abuseipdb.com",
      provider: "api.abuseipdb.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.abuseipdb.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-cyber-threats.mjs"
        }
      ]
    },
    {
      host: "api.adsb.lol",
      provider: "adsb.lol",
      kind: "structured",
      observed: true,
      license: "Open Database License (ODbL) 1.0",
      attribution: "adsb.lol; preserve ODbL attribution and link to https://adsb.lol/.",
      status: "reviewed",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-military-flights.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aircraft-emergencies.ts"
        },
        {
          path: "src/components/MapPopup.ts"
        }
      ]
    },
    {
      host: "api.airplanes.live",
      provider: "airplanes.live",
      kind: "structured",
      observed: true,
      license: "Public API restricted to non-commercial use; 1 request/second limit",
      attribution: "airplanes.live; link to https://airplanes.live/api-guide/ and comply with its non-commercial restriction.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-military-flights.mjs"
        },
        {
          path: "src/components/MapPopup.ts"
        }
      ]
    },
    {
      host: "api.alternative.me",
      provider: "Alternative.me Fear & Greed Index",
      kind: "structured",
      observed: true,
      license: "Alternative.me API terms; attribution and redistribution require review",
      attribution: "Alternative.me Crypto Fear & Greed Index; link to the API response and methodology.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-economy.mjs"
        }
      ]
    },
    {
      host: "api.anthropic.com",
      provider: "api.anthropic.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "server/_shared/llm-anthropic.ts"
        }
      ]
    },
    {
      host: "api.aviationstack.com",
      provider: "api.aviationstack.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.aviationstack.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-aviation.mjs"
        }
      ]
    },
    {
      host: "api.axiom.co",
      provider: "Axiom telemetry",
      kind: "structured",
      observed: true,
      license: "Excluded: World Monitor operational telemetry, not an external data provider",
      attribution: "Excluded from the provider count: internal usage telemetry.",
      status: "excluded",
      references: [
        {
          path: "api/_usage-telemetry.js"
        },
        {
          path: "scripts/lib/llm-telemetry.cjs"
        },
        {
          path: "scripts/seed-forecasts.mjs"
        },
        {
          path: "server/_shared/usage.ts"
        }
      ]
    },
    {
      host: "api.axios.com",
      provider: "api.axios.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit api.axios.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "api.cammesa.com",
      provider: "api.cammesa.com",
      kind: "structured",
      observed: true,
      license: "All rights reserved",
      attribution: "Credit CAMMESA SADI and link to https://api.cammesa.com/demanda-svc/swagger-ui.html.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_regional-energy-source.mjs"
        },
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "api.clerk.com",
      provider: "Clerk identity service",
      kind: "structured",
      observed: true,
      license: "Excluded: authentication/control-plane service",
      attribution: "Excluded from the provider count: identity-control-plane request.",
      status: "excluded",
      references: [
        {
          path: "api/_desktop-auth.ts"
        },
        {
          path: "api/user/passkey-offer.ts"
        },
        {
          path: "server/auth-session.ts"
        }
      ]
    },
    {
      host: "api.cloudflare.com",
      provider: "api.cloudflare.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.cloudflare.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_kv-storage.mjs"
        },
        {
          path: "scripts/_r2-storage.mjs"
        },
        {
          path: "scripts/cloudflare-cache-rule.mjs"
        },
        {
          path: "scripts/seed-internet-outages.mjs"
        },
        {
          path: "scripts/seed-military-bases.mjs"
        }
      ]
    },
    {
      host: "api.coingecko.com",
      provider: "api.coingecko.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.coingecko.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "api.coinpaprika.com",
      provider: "CoinPaprika",
      kind: "structured",
      observed: true,
      license: "CoinPaprika API terms",
      attribution: "CoinPaprika; link to the market/API response.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_seed-utils.mjs"
        },
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "server/worldmonitor/market/v1/_shared.ts"
        }
      ]
    },
    {
      host: "api.data.apps.fao.org",
      provider: "FAOSTAT",
      kind: "structured",
      observed: true,
      license: "FAOSTAT CC-BY; attribution to FAO required",
      attribution: "FAO. FAOSTAT. https://www.fao.org/faostat/",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-food-stocks.mjs"
        }
      ]
    },
    {
      host: "api.data.gov.my",
      provider: "api.data.gov.my",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.data.gov.my and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_dosm-product-demand.mjs"
        },
        {
          path: "scripts/backfill-fuel-prices-prev.mjs"
        },
        {
          path: "scripts/seed-fuel-prices.mjs"
        }
      ]
    },
    {
      host: "api.datos.gob.mx",
      provider: "api.datos.gob.mx",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.datos.gob.mx and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/backfill-fuel-prices-prev.mjs"
        }
      ]
    },
    {
      host: "api.e-stat.go.jp",
      provider: "api.e-stat.go.jp",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.e-stat.go.jp and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-world-cpi-estat.mjs"
        }
      ]
    },
    {
      host: "api.eia.gov",
      provider: "api.eia.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.eia.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/backfill-fuel-prices-prev.mjs"
        },
        {
          path: "scripts/seed-economy.mjs"
        },
        {
          path: "scripts/seed-eia-petroleum.mjs"
        },
        {
          path: "scripts/seed-electricity-prices.mjs"
        },
        {
          path: "scripts/seed-fuel-prices.mjs"
        },
        {
          path: "scripts/seed-oil-trade-series.mjs"
        }
      ]
    },
    {
      host: "api.elections.kalshi.com",
      provider: "Kalshi",
      kind: "structured",
      observed: true,
      license: "Kalshi API terms; commercial-use and redistribution terms require review",
      attribution: "Kalshi prediction markets; link to the relevant market/API response.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_forecast-market-settlements.mjs"
        },
        {
          path: "scripts/seed-prediction-markets.mjs"
        }
      ]
    },
    {
      host: "api.exa.ai",
      provider: "api.exa.ai",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.exa.ai and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/lib/company-monitoring-exa.mjs"
        },
        {
          path: "scripts/seed-bigmac.mjs"
        },
        {
          path: "scripts/seed-grocery-basket.mjs"
        },
        {
          path: "server/worldmonitor/market/v1/stock-news-search.ts"
        }
      ]
    },
    {
      host: "api.fas.usda.gov",
      provider: "USDA FAS PSD",
      kind: "structured",
      observed: true,
      license: "U.S. government public-domain PSD Open Data",
      attribution: "USDA Foreign Agricultural Service, Production, Supply and Distribution (PSD).",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-food-stocks.mjs"
        }
      ]
    },
    {
      host: "api.firecrawl.dev",
      provider: "Firecrawl",
      kind: "structured",
      observed: true,
      license: "Firecrawl API terms",
      attribution: "Firecrawl; link to the retrieved source page.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-grocery-basket.mjs"
        }
      ]
    },
    {
      host: "api.fiscaldata.treasury.gov",
      provider: "api.fiscaldata.treasury.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.fiscaldata.treasury.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-national-debt.mjs"
        },
        {
          path: "scripts/seed-supply-chain-trade.mjs"
        }
      ]
    },
    {
      host: "api.gdeltproject.org",
      provider: "api.gdeltproject.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.gdeltproject.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-gdelt-intel.mjs"
        },
        {
          path: "scripts/seed-unrest-events.mjs"
        }
      ]
    },
    {
      host: "api.github.com",
      provider: "api.github.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.github.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/_github-release.js"
        },
        {
          path: "scripts/dispatch-stale-railway-reconcile.mjs"
        },
        {
          path: "scripts/freeze-github-stars.mjs"
        },
        {
          path: "scripts/resolve-railway-reconcile-control.mjs"
        },
        {
          path: "scripts/seed-research.mjs"
        }
      ]
    },
    {
      host: "api.groq.com",
      provider: "api.groq.com",
      kind: "structured",
      observed: false,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded"
    },
    {
      host: "api.hyperliquid.xyz",
      provider: "Hyperliquid",
      kind: "structured",
      observed: true,
      license: "Hyperliquid API terms",
      attribution: "Hyperliquid; link to the relevant market/API response.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-hyperliquid-flow.mjs"
        }
      ]
    },
    {
      host: "api.iea.org",
      provider: "api.iea.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.iea.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-iea-oil-stocks.mjs"
        }
      ]
    },
    {
      host: "api.imd.gov.in",
      provider: "India Meteorological Department",
      kind: "structured",
      observed: true,
      license: "IMD public API is account- and key-gated. RTI IMETD/R/E/25/00381 states APIs are without charges for non-commercial use only. World Monitor public-display and redistribution rights are validated.",
      attribution: "Data source: India Meteorological Department. Link https://api.imd.gov.in/public/api_reference.html and the official product page.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/imd-cyclone-marine.mjs"
        }
      ]
    },
    {
      host: "api.imf.org",
      provider: "api.imf.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.imf.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_seed-utils.mjs"
        },
        {
          path: "scripts/backtest-capital-flow-episodes.mjs"
        },
        {
          path: "scripts/seed-capital-flows.mjs"
        },
        {
          path: "scripts/seed-gold-cb-reserves.mjs"
        },
        {
          path: "scripts/seed-world-cpi-imf.mjs"
        }
      ]
    },
    {
      host: "api.indexnow.org",
      provider: "api.indexnow.org",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/seo-indexnow-submit.mjs"
        }
      ]
    },
    {
      host: "api.mercadopublico.cl",
      provider: "api.mercadopublico.cl",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.mercadopublico.cl and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "api.open511.gov.bc.ca",
      provider: "BC Open511",
      kind: "structured",
      observed: true,
      license: "Open Government Licence - British Columbia (OGL-BC). Confirmed on https://api.open511.gov.bc.ca/help. API Terms of Use for OGL-BC information also apply.",
      attribution: "DriveBC Open511 (Province of British Columbia). Licensed under OGL-BC. https://api.open511.gov.bc.ca/help",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/open511.mjs"
        }
      ]
    },
    {
      host: "api.openaq.org",
      provider: "OpenAQ",
      kind: "structured",
      observed: true,
      license: "CC BY 4.0 (dataset/API terms may vary by measurement source)",
      attribution: "OpenAQ, https://openaq.org/.",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-health-air-quality.mjs"
        }
      ]
    },
    {
      host: "api.opensanctions.org",
      provider: "OpenSanctions",
      kind: "structured",
      observed: false,
      license: "OpenSanctions terms; dataset-specific license varies by source",
      attribution: "OpenSanctions; link to the matching entity/dataset.",
      status: "excluded"
    },
    {
      host: "api.ossinsight.io",
      provider: "api.ossinsight.io",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.ossinsight.io and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-research.mjs"
        }
      ]
    },
    {
      host: "api.planespotters.net",
      provider: "api.planespotters.net",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.planespotters.net and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/military/v1/get-wingbits-live-flight.ts"
        }
      ]
    },
    {
      host: "api.publisher.jodidata.org",
      provider: "www.jodidata.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.publisher.jodidata.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-jodi-gas.mjs"
        }
      ]
    },
    {
      host: "api.rainviewer.com",
      provider: "api.rainviewer.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.rainviewer.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "src/components/DeckGLMap.ts"
        }
      ]
    },
    {
      host: "api.reliefweb.int",
      provider: "ReliefWeb (UN OCHA)",
      kind: "structured",
      observed: true,
      license: "UN OCHA/ReliefWeb terms",
      attribution: "ReliefWeb, United Nations Office for the Coordination of Humanitarian Affairs (OCHA).",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-disasters.mjs"
        }
      ]
    },
    {
      host: "api.resend.com",
      provider: "Resend email service",
      kind: "structured",
      observed: true,
      license: "Excluded: transactional email/control-plane service",
      attribution: "Excluded from the provider count: transactional email delivery.",
      status: "excluded",
      references: [
        {
          path: "server/worldmonitor/leads/v1/register-interest.ts"
        },
        {
          path: "server/worldmonitor/leads/v1/submit-contact.ts"
        }
      ]
    },
    {
      host: "api.riksbank.se",
      provider: "api.riksbank.se",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.riksbank.se and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-yield-curve-se.mjs"
        }
      ]
    },
    {
      host: "api.safecast.org",
      provider: "Safecast",
      kind: "structured",
      observed: true,
      license: "Safecast data/API terms; verify dataset license by endpoint",
      attribution: "Safecast; link to the measurement/API response.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-radiation-watch.mjs"
        }
      ]
    },
    {
      host: "api.sam.gov",
      provider: "api.sam.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.sam.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-global-tenders.mjs"
        }
      ]
    },
    {
      host: "api.scrapecreators.com",
      provider: "api.scrapecreators.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.scrapecreators.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "api.search.brave.com",
      provider: "Brave Search API",
      kind: "structured",
      observed: true,
      license: "Brave Search API terms",
      attribution: "Brave Search; link to the result and original publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "server/worldmonitor/market/v1/stock-news-search.ts"
        }
      ]
    },
    {
      host: "api.spdrgoldshares.com",
      provider: "api.spdrgoldshares.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.spdrgoldshares.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-gold-etf-flows.mjs"
        }
      ]
    },
    {
      host: "api.statistiken.bundesbank.de",
      provider: "api.statistiken.bundesbank.de",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.statistiken.bundesbank.de and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-yield-curve-de.mjs"
        }
      ]
    },
    {
      host: "api.stlouisfed.org",
      provider: "api.stlouisfed.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.stlouisfed.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-economic-calendar.mjs"
        },
        {
          path: "scripts/seed-us-cpi.mjs"
        },
        {
          path: "scripts/seed-us-interest-rates.mjs"
        }
      ]
    },
    {
      host: "api.ted.europa.eu",
      provider: "api.ted.europa.eu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.ted.europa.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-global-tenders.mjs"
        }
      ]
    },
    {
      host: "api.telegram.org",
      provider: "api.telegram.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.telegram.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/notification-relay.cjs"
        },
        {
          path: "scripts/seed-digest-notifications.mjs"
        }
      ]
    },
    {
      host: "api.travelpayouts.com",
      provider: "Travelpayouts flight-price data",
      kind: "structured",
      observed: true,
      license: "Travelpayouts API terms; commercial use and redistribution require review",
      attribution: "Travelpayouts; link to the returned flight-price response.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/aviation/v1/_providers/travelpayouts_data.ts"
        }
      ]
    },
    {
      host: "api.typesafe.ai",
      provider: "api.typesafe.ai",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/lib/internal-links.mjs"
        }
      ]
    },
    {
      host: "api.tzevaadom.co.il",
      provider: "api.tzevaadom.co.il",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.tzevaadom.co.il and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "api.unhcr.org",
      provider: "api.unhcr.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.unhcr.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-displacement-summary.mjs"
        }
      ]
    },
    {
      host: "api.usaspending.gov",
      provider: "api.usaspending.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.usaspending.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-usa-spending.mjs"
        }
      ]
    },
    {
      host: "api.uspto.gov",
      provider: "USPTO Open Data Portal",
      kind: "structured",
      observed: true,
      license: "U.S. government public data; USPTO terms apply",
      attribution: "U.S. Patent and Trademark Office (USPTO) Open Data Portal.",
      status: "reviewed",
      references: [
        {
          path: "scripts/_defense-patents-source.mjs"
        }
      ]
    },
    {
      host: "api.waqi.info",
      provider: "World Air Quality Index (WAQI)",
      kind: "structured",
      observed: true,
      license: "WAQI API terms; attribution required",
      attribution: "World Air Quality Index (WAQI); link to the station/API response.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-health-air-quality.mjs"
        }
      ]
    },
    {
      host: "api.weather.gc.ca",
      provider: "Environment and Climate Change Canada (ECCC)",
      kind: "structured",
      observed: true,
      license: "ECCC Data Server End-use Licence; Government of Canada open data",
      attribution: "Environment and Climate Change Canada (ECCC) weather alerts via MSC GeoMet (https://api.weather.gc.ca/).",
      status: "reviewed",
      references: [
        {
          path: "scripts/_weather-alert-select.mjs"
        }
      ]
    },
    {
      host: "api.weather.gov",
      provider: "api.weather.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.weather.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_weather-alert-select.mjs"
        }
      ]
    },
    {
      host: "api.windy.com",
      provider: "api.windy.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.windy.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/mcp/registry/webcam-tools.ts"
        },
        {
          path: "api/mcp/skill-extension/generated.ts"
        },
        {
          path: "scripts/seed-webcams.mjs"
        },
        {
          path: "server/worldmonitor/webcam/v1/get-webcam-image.ts"
        }
      ]
    },
    {
      host: "api.worldbank.org",
      provider: "World Bank Open Data",
      kind: "structured",
      observed: true,
      license: "World Development Indicators are licensed under CC BY 4.0. UNESCO UIS indicators mirrored through WDI also require the UIS attribution stated in the public source documentation.",
      attribution: "World Bank Open Data. For education indicators: UNESCO Institute for Statistics via World Bank WDI; include the UIS source URL and extraction date.",
      status: "reviewed",
      references: [
        {
          path: "scripts/_defense-industrial-source.mjs"
        },
        {
          path: "scripts/_demographics-capability-source.mjs"
        },
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-bis-lbs.mjs"
        },
        {
          path: "scripts/seed-capital-flows.mjs"
        },
        {
          path: "scripts/seed-education-attainment.mjs"
        },
        {
          path: "scripts/seed-fossil-electricity-share.mjs"
        },
        {
          path: "scripts/seed-power-reliability.mjs"
        },
        {
          path: "scripts/seed-recovery-external-debt.mjs"
        },
        {
          path: "scripts/seed-recovery-reserve-adequacy.mjs"
        },
        {
          path: "scripts/seed-resilience-static.mjs"
        },
        {
          path: "scripts/seed-sovereign-wealth.mjs"
        },
        {
          path: "scripts/seed-wb-external-debt.mjs"
        },
        {
          path: "scripts/seed-wb-indicators.mjs"
        },
        {
          path: "server/worldmonitor/economic/v1/list-world-bank-indicators.ts"
        },
        {
          path: "server/worldmonitor/resilience/v1/_dimension-scorers.ts"
        },
        {
          path: "server/worldmonitor/resilience/v1/_indicator-source-policy.ts"
        }
      ]
    },
    {
      host: "api.worldmonitor.app",
      provider: "World Monitor hosted API",
      kind: "feed+structured",
      observed: true,
      license: "Excluded: World Monitor own service/control plane",
      attribution: "Excluded from the external-provider count: first-party API endpoint.",
      status: "excluded",
      references: [
        {
          path: "api/a2a.ts"
        },
        {
          path: "api/internal/mcp-grant-mint.ts"
        },
        {
          path: "api/mcp/downstream.ts"
        },
        {
          path: "api/mcp/skill-extension/generated.ts"
        },
        {
          path: "scripts/_widget-data-policy.cjs"
        },
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/audit-resilience-cohorts.mjs"
        },
        {
          path: "scripts/capture-seed-recovery.mjs"
        },
        {
          path: "scripts/freeze-resilience-ranking.mjs"
        },
        {
          path: "scripts/openapi-inject-servers.mjs"
        },
        {
          path: "scripts/post-pr3427-force-refresh.mjs"
        },
        {
          path: "scripts/post-pr3487-force-refresh.mjs"
        },
        {
          path: "scripts/seed-china-decision-signals.mjs"
        },
        {
          path: "scripts/seed-infra.mjs"
        },
        {
          path: "scripts/seed-insights.mjs"
        },
        {
          path: "scripts/seed-military-maritime-news.mjs"
        },
        {
          path: "scripts/seed-resilience-scores.mjs"
        },
        {
          path: "scripts/seed-service-statuses.mjs"
        },
        {
          path: "scripts/shipping-webhook-worker.mjs"
        },
        {
          path: "scripts/validate-rss-feeds.mjs"
        },
        {
          path: "scripts/validate-seed-migration.mjs"
        },
        {
          path: "scripts/verify-import-hhi-coverage.mjs"
        },
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/app/desktop-updater.ts"
        },
        {
          path: "src/mcp-grant-main.ts"
        },
        {
          path: "src/services/runtime.ts"
        }
      ]
    },
    {
      host: "api.wto.org",
      provider: "api.wto.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit api.wto.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-supply-chain-trade.mjs"
        },
        {
          path: "server/worldmonitor/trade/v1/_shared.ts"
        }
      ]
    },
    {
      host: "api.x.com",
      provider: "X API",
      kind: "structured",
      observed: true,
      license: "X Developer Agreement and Policy; ingest and retain only allowed fields and honor deletion, protection, and withholding signals",
      attribution: "Credit X and preserve author and source links when the allowed use permits display.",
      status: "terms-review",
      references: [
        {
          path: "scripts/cross-strait-activity/japan-x.mjs"
        },
        {
          path: "scripts/lib/company-monitoring-x-provider.mjs"
        },
        {
          path: "scripts/lib/x-news-accounts.cjs"
        },
        {
          path: "scripts/lib/x-post-budget.cjs"
        },
        {
          path: "scripts/verify-x-accounts.mjs"
        }
      ]
    },
    {
      host: "apnews.com",
      provider: "apnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit apnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "apps.fas.usda.gov",
      provider: "USDA FAS PSD",
      kind: "structured",
      observed: false,
      license: "U.S. government public-domain PSD Open Data",
      attribution: "USDA Foreign Agricultural Service, Production, Supply and Distribution (PSD).",
      status: "excluded"
    },
    {
      host: "arabianbusiness.com",
      provider: "arabianbusiness.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit arabianbusiness.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "arabnews.com",
      provider: "arabnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit arabnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "archive-api.open-meteo.com",
      provider: "archive-api.open-meteo.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit archive-api.open-meteo.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_open-meteo-archive.mjs"
        }
      ]
    },
    {
      host: "arctictoday.com",
      provider: "arctictoday.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit arctictoday.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "armenpress.am",
      provider: "armenpress.am",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit armenpress.am and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "armscontrol.org",
      provider: "armscontrol.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit armscontrol.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "arxiv.org",
      provider: "arxiv.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit arxiv.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-research.mjs"
        }
      ]
    },
    {
      host: "asharq.com",
      provider: "asharq.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit asharq.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "asharqbusiness.com",
      provider: "asharqbusiness.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit asharqbusiness.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "asia.nikkei.com",
      provider: "asia.nikkei.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit asia.nikkei.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "asianews.it",
      provider: "asianews.it",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit asianews.it and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "astanatimes.com",
      provider: "astanatimes.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit astanatimes.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "atbackend.sipri.org",
      provider: "SIPRI Arms Transfers Database",
      kind: "structured",
      observed: true,
      license: "SIPRI fair use permits limited non-commercial use; commercial use requires prior authorization and may require a royalty",
      attribution: "Credit the SIPRI Arms Transfers Database and link to SIPRI terms and the public database portal.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_defense-industrial-source.mjs"
        }
      ]
    },
    {
      host: "auth.opensky-network.org",
      provider: "opensky-network.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit auth.opensky-network.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-military-flights.mjs"
        }
      ]
    },
    {
      host: "av.alarabiya.net",
      provider: "av.alarabiya.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "aws.amazon.com",
      provider: "aws.amazon.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/comparison-shortlist.mjs"
        }
      ]
    },
    {
      host: "ayibopost.com",
      provider: "AyiboPost",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit AyiboPost and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "azertag.az",
      provider: "azertag.az",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit azertag.az and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "azure.status.microsoft",
      provider: "azure.status.microsoft",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit azure.status.microsoft and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "balkaninsight.com",
      provider: "balkaninsight.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit balkaninsight.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "bangkokpost.com",
      provider: "bangkokpost.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit bangkokpost.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "basemaps.cartocdn.com",
      provider: "basemaps.cartocdn.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/basemap-styles.ts"
        }
      ]
    },
    {
      host: "bcovlive-a.akamaihd.net",
      provider: "bcovlive-a.akamaihd.net",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "bd.usembassy.gov",
      provider: "bd.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit bd.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "bellingcat.com",
      provider: "bellingcat.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit bellingcat.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "besttime.app",
      provider: "besttime.app",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit besttime.app and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "bihus.info",
      provider: "bihus.info",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit bihus.info and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "binance.com",
      provider: "Binance",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Binance and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "bitbucket.status.atlassian.com",
      provider: "bitbucket.status.atlassian.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit bitbucket.status.atlassian.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "bitcoinmagazine.com",
      provider: "bitcoinmagazine.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit bitcoinmagazine.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "bloomberg.com",
      provider: "bloomberg.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit bloomberg.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "bothsidesofthetable.com",
      provider: "bothsidesofthetable.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit bothsidesofthetable.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "breakingdefense.com",
      provider: "breakingdefense.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit breakingdefense.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "brookings.edu",
      provider: "brookings.edu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit brookings.edu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "browser.mcp.cloudflare.com",
      provider: "Cloudflare Browser MCP",
      kind: "structured",
      observed: true,
      license: "Excluded: optional rendering/automation connector",
      attribution: "Excluded from the provider count: user-configured MCP connector.",
      status: "excluded",
      references: [
        {
          path: "src/services/mcp-store.ts"
        }
      ]
    },
    {
      host: "budgetlab.yale.edu",
      provider: "budgetlab.yale.edu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit budgetlab.yale.edu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_trade-parse-utils.mjs"
        }
      ]
    },
    {
      host: "calgaryherald.com",
      provider: "calgaryherald.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit calgaryherald.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "canadabuys.canada.ca",
      provider: "canadabuys.canada.ca",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit canadabuys.canada.ca and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-global-tenders.mjs"
        }
      ]
    },
    {
      host: "carnegieendowment.org",
      provider: "carnegieendowment.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit carnegieendowment.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "catalogue.data.gov.bc.ca",
      provider: "B.C. Evacuation Orders and Alerts",
      kind: "structured",
      observed: true,
      license: "Open Government Licence - British Columbia (OGL-BC). The B.C. Data Catalogue record 7efd46d0-b5d3-4dff-af80-d376c42aec33 explicitly assigns OGL-BC to this ArcGIS layer.",
      attribution: "Contains information licensed under the Open Government Licence - British Columbia. https://catalogue.data.gov.bc.ca/dataset/7efd46d0-b5d3-4dff-af80-d376c42aec33",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/bc-emergency-info.mjs"
        }
      ]
    },
    {
      host: "cbcnewshd-f.akamaihd.net",
      provider: "cbcnewshd-f.akamaihd.net",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "cbinsights.com",
      provider: "cbinsights.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit cbinsights.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "cbsn-us.cbsnstream.cbsnews.com",
      provider: "cbsn-us.cbsnstream.cbsnews.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "cdc.gov",
      provider: "cdc.gov",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit cdc.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "cdn-ca2-na.lncnetworks.host",
      provider: "cdn-ca2-na.lncnetworks.host",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "cdn-uw2-prod.tsv2.amagi.tv",
      provider: "cdn-uw2-prod.tsv2.amagi.tv",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "cdn.debugbear.com",
      provider: "cdn.debugbear.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/bootstrap/debugbear-rum.ts"
        }
      ]
    },
    {
      host: "cdn.jsdelivr.net",
      provider: "jsDelivr asset CDN",
      kind: "structured",
      observed: true,
      license: "Excluded: presentation asset/CDN",
      attribution: "Excluded from the provider count: browser asset, not an ingested source.",
      status: "excluded",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "server/_shared/brief-carousel-render.ts"
        }
      ]
    },
    {
      host: "cdnlive.presstv.ir",
      provider: "cdnlive.presstv.ir",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "celestrak.org",
      provider: "celestrak.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit celestrak.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "chainwire.org",
      provider: "Chainwire",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Chainwire and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "challenges.cloudflare.com",
      provider: "challenges.cloudflare.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "server/_shared/turnstile.ts"
        }
      ]
    },
    {
      host: "changelog.com",
      provider: "changelog.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit changelog.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "chatgpt.com",
      provider: "ChatGPT link",
      kind: "structured",
      observed: true,
      license: "Excluded: documentation/UI link",
      attribution: "Excluded from the provider count: UI link, not an ingested source.",
      status: "excluded",
      references: [
        {
          path: "api/oauth/_client-metadata.js"
        }
      ]
    },
    {
      host: "chathamhouse.org",
      provider: "chathamhouse.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit chathamhouse.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "citinewsroom.com",
      provider: "citinewsroom.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit citinewsroom.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "civil.ge",
      provider: "civil.ge",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit civil.ge and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "ckan0.cf.opendata.inter.prod-toronto.ca",
      provider: "City of Toronto Open Data",
      kind: "structured",
      observed: true,
      license: 'CKAN package_show for police-annual-statistical-report-calls-for-service-attended (package id bfffadee-e6e5-4404-8455-e67e9ea11ba7) returned license_id=notspecified, license_title="License not specified", and isopen=false on 2026-09-03. The portal dataset page displays Open Government Licence - Toronto, but that claim is not data-bound to the CKAN package metadata.',
      attribution: "Toronto Police Service, Calls for Service Attended, via City of Toronto Open Data. https://open.toronto.ca/dataset/police-annual-statistical-report-calls-for-service-attended/",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/tps-open-data.mjs"
        }
      ]
    },
    {
      host: "claude.ai",
      provider: "Claude link",
      kind: "structured",
      observed: true,
      license: "Excluded: documentation/UI link",
      attribution: "Excluded from the provider count: UI link, not an ingested source.",
      status: "excluded",
      references: [
        {
          path: "api/oauth/_client-metadata.js"
        }
      ]
    },
    {
      host: "climate.copernicus.eu",
      provider: "climate.copernicus.eu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit climate.copernicus.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-news.mjs"
        }
      ]
    },
    {
      host: "cloudflare-dns.com",
      provider: "cloudflare-dns.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/_notification-webhook-ssrf.ts"
        },
        {
          path: "api/mcp-proxy.ts"
        },
        {
          path: "server/_shared/email-validation.ts"
        },
        {
          path: "server/worldmonitor/shipping/v2/webhook-shared.ts"
        }
      ]
    },
    {
      host: "cnas.org",
      provider: "cnas.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit cnas.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "cnbc.com",
      provider: "cnbc.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit cnbc.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "cnn.com",
      provider: "cnn.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit cnn.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "cnn.gr",
      provider: "cnn.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit cnn.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "co.usembassy.gov",
      provider: "co.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit co.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "coinbase.com",
      provider: "Coinbase",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Coinbase and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "cointelegraph.com",
      provider: "cointelegraph.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit cointelegraph.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/finance.ts"
        }
      ]
    },
    {
      host: "collisionconf.com",
      provider: "collisionconf.com",
      kind: "structured",
      observed: false,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit collisionconf.com and link to the original upstream API/dataset.",
      status: "excluded"
    },
    {
      host: "commodity.worldmonitor.app",
      provider: "commodity.worldmonitor.app",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/app/panel-layout.ts"
        },
        {
          path: "src/config/variant-meta.ts"
        }
      ]
    },
    {
      host: "comtradeapi.un.org",
      provider: "comtradeapi.un.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit comtradeapi.un.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-comtrade-bilateral-hs4.mjs"
        },
        {
          path: "scripts/seed-oil-trade-series.mjs"
        },
        {
          path: "scripts/seed-recovery-import-hhi.mjs"
        },
        {
          path: "scripts/seed-recovery-reexport-share.mjs"
        },
        {
          path: "scripts/seed-supply-vulnerability.mjs"
        },
        {
          path: "scripts/seed-trade-flows.mjs"
        },
        {
          path: "server/worldmonitor/supply-chain/v1/_bilateral-hs4-lazy.ts"
        }
      ]
    },
    {
      host: "confluence.status.atlassian.com",
      provider: "confluence.status.atlassian.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit confluence.status.atlassian.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "conservationoptimism.org",
      provider: "conservationoptimism.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit conservationoptimism.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "contxto.com",
      provider: "contxto.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit contxto.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "correctiv.org",
      provider: "correctiv.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit correctiv.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "corridorrisk.io",
      provider: "corridorrisk.io",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit corridorrisk.io and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "corriere.it",
      provider: "corriere.it",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit corriere.it and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "cp24.com",
      provider: "cp24.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit cp24.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "creativecommons.org",
      provider: "creativecommons.org",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "server/worldmonitor/displacement/v1/cross-border-data.ts"
        },
        {
          path: "src/components/UkmtoIncidentsPanel.ts"
        }
      ]
    },
    {
      host: "cryptoslate.com",
      provider: "cryptoslate.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit cryptoslate.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "csis.org",
      provider: "csis.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit csis.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "ctvnews.ca",
      provider: "ctvnews.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ctvnews.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "customer-api.wingbits.com",
      provider: "wingbits.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit customer-api.wingbits.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-military-flights.mjs"
        },
        {
          path: "server/worldmonitor/military/v1/_wingbits-aircraft-details.ts"
        }
      ]
    },
    {
      host: "customer.dodopayments.com",
      provider: "customer.dodopayments.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/services/billing.ts"
        }
      ]
    },
    {
      host: "dados.ons.org.br",
      provider: "dados.ons.org.br",
      kind: "structured",
      observed: true,
      license: "CC-BY",
      attribution: "Credit Brazil ONS and link to https://dados.ons.org.br/api/3/action/package_show?id=balanco-energia-subsistema.",
      status: "terms-review",
      references: [
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "dai2.xumo.com",
      provider: "dai2.xumo.com",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "dailytrust.com",
      provider: "dailytrust.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit dailytrust.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "dash4.antik.sk",
      provider: "dash4.antik.sk",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "data-api.ecb.europa.eu",
      provider: "data-api.ecb.europa.eu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit data-api.ecb.europa.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/yield-curves/oecd-lt.mjs"
        },
        {
          path: "scripts/seed-ecb-fx-rates.mjs"
        },
        {
          path: "scripts/seed-ecb-short-rates.mjs"
        },
        {
          path: "scripts/seed-yield-curve-eu.mjs"
        }
      ]
    },
    {
      host: "data.api.abs.gov.au",
      provider: "data.api.abs.gov.au",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit data.api.abs.gov.au and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-world-cpi-abs.mjs"
        }
      ]
    },
    {
      host: "data.apps.fao.org",
      provider: "FAOSTAT",
      kind: "structured",
      observed: true,
      license: "FAOSTAT CC-BY; attribution to FAO required",
      attribution: "FAO. FAOSTAT. https://www.fao.org/faostat/",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-food-stocks.mjs"
        }
      ]
    },
    {
      host: "data.ecb.europa.eu",
      provider: "data.ecb.europa.eu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit data.ecb.europa.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-fsi-eu.mjs"
        }
      ]
    },
    {
      host: "data.humdata.org",
      provider: "data.humdata.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit data.humdata.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_conflict-hapi.mjs"
        },
        {
          path: "scripts/benchmark-resilience-external.mjs"
        },
        {
          path: "scripts/seed-idmc-idu-displacement.mjs"
        },
        {
          path: "scripts/seed-resilience-static.mjs"
        }
      ]
    },
    {
      host: "data.norges-bank.no",
      provider: "data.norges-bank.no",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit data.norges-bank.no and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-yield-curve-no.mjs"
        }
      ]
    },
    {
      host: "data.sec.gov",
      provider: "SEC EDGAR",
      kind: "structured",
      observed: true,
      license: "U.S. government public data; SEC terms apply",
      attribution: "U.S. Securities and Exchange Commission (SEC) EDGAR.",
      status: "reviewed",
      references: [
        {
          path: "server/_shared/sec-edgar.ts"
        }
      ]
    },
    {
      host: "data.snb.ch",
      provider: "data.snb.ch",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit data.snb.ch and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-yield-curve-ch.mjs"
        }
      ]
    },
    {
      host: "data.stats.gov.cn",
      provider: "data.stats.gov.cn",
      kind: "structured",
      observed: true,
      catalogActive: false,
      license: "NBS Terms of Service section III permits statistical data download and use, with NBS attribution (https://www.stats.gov.cn/english/nbs/200701/t20070104_59236.html; checked 2026-10-24). Saved-response extraction only; canonical publication remains blocked by missing source clocks. No authenticated download, application-code reuse or access bypass.",
      attribution: "Quoted from the website of the National Bureau of Statistics: www.stats.gov.cn. Retain the National Data source URL and exact indicator reference.",
      status: "reviewed",
      references: [
        {
          path: "scripts/china-macro/extract-nbs-national-data.mjs"
        }
      ]
    },
    {
      host: "data.tps.ca",
      provider: "Toronto Police Service Open Data",
      kind: "structured",
      observed: true,
      license: 'Custom licence based on the Open Government Licence - Ontario. The Major Crime Indicators FeatureServer (serviceItemId 0a239a5563a344a3bbf8452504ed8d68) requires: "Contains information licensed under the Open Government Licence - Ontario." Credit Toronto Police Service without crests, logos, flags, or official marks. No TPS endorsement. Locations are deliberately offset; do not present them as precise addresses. Do not merge or link the data with other databases for the purpose of identifying a person, business, or organization. Do not fill privacy exclusions from GTA Update, news, radio, or another source. Evidence: https://www.tps.ca/data-maps/open-data/ and the item-level FeatureServer description on https://data.tps.ca/.',
      attribution: "Contains information licensed under the Open Government Licence - Ontario. Toronto Police Service Open Data (https://www.tps.ca/data-maps/open-data/, https://data.tps.ca/). Coordinates are approximate offset intersection nodes. No TPS endorsement.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/tps-open-data.mjs"
        }
      ]
    },
    {
      host: "data.trade.gov",
      provider: "International Trade Administration (US Consolidated Screening List)",
      kind: "structured",
      observed: true,
      license: "US government work. The ITA Data API terms of service (developer.trade.gov/terms-of-service) require the notice: This product uses the International Trade Administration's Data API but is not endorsed or certified by the International Trade Administration.",
      attribution: "This product uses the International Trade Administration's Data API but is not endorsed or certified by the International Trade Administration. Verify listings against the Federal Register and the issuing agency.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_csl-sanctions.mjs"
        }
      ]
    },
    {
      host: "data.unhcr.org",
      provider: "data.unhcr.org",
      kind: "structured",
      observed: true,
      license: "ODP footer states datasets are CC BY 4.0 (observed 2026-10-19).",
      attribution: "UNHCR Operational Data Portal; link the situation and CC BY 4.0. WorldMonitor normalizes and derives the view. No UNHCR endorsement.",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-cross-border-arrivals.mjs"
        },
        {
          path: "server/worldmonitor/displacement/v1/cross-border-data.ts"
        }
      ]
    },
    {
      host: "data.uspto.gov",
      provider: "USPTO Open Data Portal",
      kind: "structured",
      observed: true,
      license: "U.S. government public data; USPTO terms apply",
      attribution: "U.S. Patent and Trademark Office (USPTO) Open Data.",
      status: "reviewed",
      references: [
        {
          path: "scripts/_defense-patents-source.mjs"
        }
      ]
    },
    {
      host: "data.weather.gov.hk",
      provider: "data.weather.gov.hk",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit data.weather.gov.hk and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/natural/western-pacific-cyclones.mjs"
        }
      ]
    },
    {
      host: "data.worldbank.org",
      provider: "data.worldbank.org",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/seed-education-attainment.mjs"
        },
        {
          path: "scripts/seed-wb-external-debt.mjs"
        }
      ]
    },
    {
      host: "datalab.wto.org",
      provider: "datalab.wto.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit datalab.wto.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-hormuz.mjs"
        }
      ]
    },
    {
      host: "dataservices.icao.int",
      provider: "dataservices.icao.int",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit dataservices.icao.int and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/_shared.ts"
        }
      ]
    },
    {
      host: "de.euronews.com",
      provider: "de.euronews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit de.euronews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "de.usembassy.gov",
      provider: "de.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit de.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "decrypt.co",
      provider: "decrypt.co",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit decrypt.co and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "defense.gov",
      provider: "defense.gov",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit defense.gov and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "dev.events",
      provider: "dev.events",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit dev.events and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-research.mjs"
        },
        {
          path: "server/worldmonitor/research/v1/list-tech-events.ts"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "dev.to",
      provider: "dev.to",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit dev.to and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "devops.com",
      provider: "devops.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit devops.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "dfrlab.org",
      provider: "dfrlab.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit dfrlab.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "dhakatribune.com",
      provider: "Dhaka Tribune",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Dhaka Tribune and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "dhs.gov",
      provider: "dhs.gov",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit dhs.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "discord.com",
      provider: "discord.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/channel-oauth-bind.ts"
        },
        {
          path: "api/discord/oauth/callback.ts"
        },
        {
          path: "api/discord/oauth/start.ts"
        }
      ]
    },
    {
      host: "discord.gg",
      provider: "discord.gg",
      kind: "structured",
      observed: false,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded"
    },
    {
      host: "discordstatus.com",
      provider: "discordstatus.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit discordstatus.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "disrupt-africa.com",
      provider: "disrupt-africa.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit disrupt-africa.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "dlnews.com",
      provider: "dlnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit dlnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "do.usembassy.gov",
      provider: "do.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit do.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "drmkc.jrc.ec.europa.eu",
      provider: "drmkc.jrc.ec.europa.eu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit drmkc.jrc.ec.europa.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/benchmark-resilience-external.mjs"
        }
      ]
    },
    {
      host: "dtmapi.iom.int",
      provider: "dtmapi.iom.int",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit dtmapi.iom.int and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-dtm-displacement.mjs"
        }
      ]
    },
    {
      host: "dw.com",
      provider: "dw.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit dw.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "dwamdstream103.akamaized.net",
      provider: "dwamdstream103.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "dwamdstream104.akamaized.net",
      provider: "dwamdstream104.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "e00-elmundo.uecdn.es",
      provider: "e00-elmundo.uecdn.es",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit e00-elmundo.uecdn.es and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "earth-search.aws.element84.com",
      provider: "Element84 Earth Search STAC",
      kind: "structured",
      observed: true,
      license: "AWS Open Data and dataset-specific collection licenses",
      attribution: "Element84 Earth Search; preserve the collection license and link to the item.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/imagery/v1/search-imagery.ts"
        }
      ]
    },
    {
      host: "earthobservatory.nasa.gov",
      provider: "earthobservatory.nasa.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit earthobservatory.nasa.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-news.mjs"
        }
      ]
    },
    {
      host: "earthquake.usgs.gov",
      provider: "earthquake.usgs.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit earthquake.usgs.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/mcp/skill-extension/generated.ts"
        },
        {
          path: "scripts/seed-earthquakes.mjs"
        }
      ]
    },
    {
      host: "ec.europa.eu",
      provider: "ec.europa.eu",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit ec.europa.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_eurostat-utils.mjs"
        },
        {
          path: "scripts/seed-economic-calendar.mjs"
        },
        {
          path: "scripts/seed-eurostat-country-data.mjs"
        },
        {
          path: "scripts/seed-resilience-static.mjs"
        },
        {
          path: "server/worldmonitor/resilience/v1/_indicator-source-policy.ts"
        },
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "ecfr.eu",
      provider: "ecfr.eu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ecfr.eu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "economist.com",
      provider: "The Economist",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit The Economist and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "ecs-api.wingbits.com",
      provider: "wingbits.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit ecs-api.wingbits.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/military/v1/get-wingbits-live-flight.ts"
        }
      ]
    },
    {
      host: "edmontonjournal.com",
      provider: "edmontonjournal.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit edmontonjournal.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "efectococuyo.com",
      provider: "Efecto Cocuyo",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Efecto Cocuyo and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "eff.org",
      provider: "eff.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit eff.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "efts.sec.gov",
      provider: "SEC EDGAR Full-Text Search",
      kind: "structured",
      observed: true,
      license: "U.S. government public data; SEC terms apply",
      attribution: "U.S. Securities and Exchange Commission (SEC) EDGAR full-text search.",
      status: "reviewed",
      references: [
        {
          path: "server/_shared/sec-edgar.ts"
        }
      ]
    },
    {
      host: "eia.gov",
      provider: "eia.gov",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit eia.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "emergencyalert.saskatchewan.ca",
      provider: "SaskAlert",
      kind: "structured",
      observed: true,
      license: "Public SaskAlert mobile JSON at /sapublic/feed.json plus same-host CAP 1.2 JSON details. Government of Saskatchewan website terms exclude some connected subsites; this host is the official public alert feed authorized for canadaAlerts ingest under #6659. Not Pelmorex LMD.",
      attribution: "SaskAlert, Government of Saskatchewan. https://emergencyalert.saskatchewan.ca/",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/saskalert.mjs"
        },
        {
          path: "scripts/source-attribution.mjs"
        }
      ]
    },
    {
      host: "en.irna.ir",
      provider: "en.irna.ir",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit en.irna.ir and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "en.mehrnews.com",
      provider: "en.mehrnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit en.mehrnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "en.sge.com.cn",
      provider: "en.sge.com.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit en.sge.com.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-physical-premiums.mjs"
        }
      ]
    },
    {
      host: "en.sse.net.cn",
      provider: "en.sse.net.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit en.sse.net.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-supply-chain-trade.mjs"
        }
      ]
    },
    {
      host: "en.wikipedia.org",
      provider: "en.wikipedia.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit en.wikipedia.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-sovereign-wealth.mjs"
        },
        {
          path: "server/worldmonitor/intelligence/v1/get-country-facts.ts"
        }
      ]
    },
    {
      host: "energy.ec.europa.eu",
      provider: "energy.ec.europa.eu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit energy.ec.europa.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/backfill-fuel-prices-prev.mjs"
        },
        {
          path: "scripts/seed-fuel-prices.mjs"
        }
      ]
    },
    {
      host: "energy.worldmonitor.app",
      provider: "energy.worldmonitor.app",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/app/panel-layout.ts"
        },
        {
          path: "src/config/variant-meta.ts"
        }
      ]
    },
    {
      host: "eng.lsm.lv",
      provider: "eng.lsm.lv",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit eng.lsm.lv and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "english-livebkali.cgtn.com",
      provider: "english-livebkali.cgtn.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "english.alarabiya.net",
      provider: "english.alarabiya.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit english.alarabiya.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "english.customs.gov.cn",
      provider: "english.customs.gov.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit english.customs.gov.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/china-macro/source-contracts.mjs"
        }
      ]
    },
    {
      host: "english.enabbaladi.net",
      provider: "Enab Baladi English",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Enab Baladi English and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "english.nv.ua",
      provider: "english.nv.ua",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit english.nv.ua and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "english.wafa.ps",
      provider: "WAFA English",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit WAFA English and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "eonet.gsfc.nasa.gov",
      provider: "eonet.gsfc.nasa.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit eonet.gsfc.nasa.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-natural-events.mjs"
        }
      ]
    },
    {
      host: "epms.ppra.gov.pk",
      provider: "epms.ppra.gov.pk",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit epms.ppra.gov.pk and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "erp.powergrid.gov.bd",
      provider: "erp.powergrid.gov.bd",
      kind: "structured",
      observed: true,
      license: "Unconfirmed",
      attribution: "Credit Bangladesh Power Grid and link to https://erp.powergrid.gov.bd/w/generations/view_generations.",
      status: "terms-review",
      references: [
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "ert-ucdn.broadpeak-aas.com",
      provider: "ert-ucdn.broadpeak-aas.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "ert.gr",
      provider: "ert.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ert.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "ertflix.ascdn.broadpeak.io",
      provider: "ertflix.ascdn.broadpeak.io",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "es.euronews.com",
      provider: "es.euronews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit es.euronews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "eu-startups.com",
      provider: "eu-startups.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit eu-startups.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "euractiv.com",
      provider: "euractiv.com",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit euractiv.com and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "eurasianet.org",
      provider: "eurasianet.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit eurasianet.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "euromaidanpress.com",
      provider: "euromaidanpress.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit euromaidanpress.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "evn.com.vn",
      provider: "evn.com.vn",
      kind: "structured",
      observed: true,
      license: "All rights reserved",
      attribution: "Credit Vietnam Electricity (EVN) and link to https://evn.com.vn/vi-VN/news-l/Thong-tin-tom-tat-van-hanh-HTD-Quoc-gia-60-2015.",
      status: "terms-review",
      references: [
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "example.com",
      provider: "Example domain placeholder",
      kind: "structured",
      observed: true,
      license: "Excluded: documentation/test placeholder",
      attribution: "Excluded from the provider count: placeholder URL.",
      status: "excluded",
      references: [
        {
          path: "scripts/mcp-live-smoke.mjs"
        },
        {
          path: "scripts/openapi-inject-examples.mjs"
        },
        {
          path: "src/services/mcp-store.ts"
        },
        {
          path: "src/utils/sanitize.ts"
        }
      ]
    },
    {
      host: "export.arxiv.org",
      provider: "export.arxiv.org",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit export.arxiv.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-research.mjs"
        },
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "ezamowienia.gov.pl",
      provider: "ezamowienia.gov.pl",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit ezamowienia.gov.pl and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "factchecktools.googleapis.com",
      provider: "factchecktools.googleapis.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit factchecktools.googleapis.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "server/_shared/fact-checks.ts"
        }
      ]
    },
    {
      host: "fao.org",
      provider: "fao.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit fao.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "farsnews.ir",
      provider: "farsnews.ir",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit farsnews.ir and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fas.org",
      provider: "fas.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit fas.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fc.yahoo.com",
      provider: "fc.yahoo.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit fc.yahoo.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_yahoo-sector-valuations.cjs"
        }
      ]
    },
    {
      host: "fccc.gov.fj",
      provider: "fccc.gov.fj",
      kind: "structured",
      observed: true,
      license: "All rights reserved; robots content-signal ai-train=no, use=reference",
      attribution: "Credit the Fijian Competition and Consumer Commission and link to https://fccc.gov.fj/.",
      status: "terms-review",
      references: [
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "feed.businesswire.com",
      provider: "Business Wire",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Business Wire and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feed.infoq.com",
      provider: "feed.infoq.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feed.infoq.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "feeds.abcnews.com",
      provider: "feeds.abcnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.abcnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feeds.arstechnica.com",
      provider: "feeds.arstechnica.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.arstechnica.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "feeds.bbci.co.uk",
      provider: "BBC",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.bbci.co.uk and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feeds.content.dowjones.io",
      provider: "feeds.content.dowjones.io",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.content.dowjones.io and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feeds.elpais.com",
      provider: "feeds.elpais.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.elpais.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feeds.feedburner.com",
      provider: "feeds.feedburner.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.feedburner.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ],
      role: "transport"
    },
    {
      host: "feeds.finra.org",
      provider: "FINRA",
      kind: "structured",
      observed: true,
      license: "FINRA feed terms",
      attribution: "Financial Industry Regulatory Authority (FINRA); link to the original notice.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-regulatory-actions.mjs"
        }
      ]
    },
    {
      host: "feeds.folha.uol.com.br",
      provider: "feeds.folha.uol.com.br",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.folha.uol.com.br and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feeds.megaphone.fm",
      provider: "feeds.megaphone.fm",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.megaphone.fm and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feeds.nbcnews.com",
      provider: "feeds.nbcnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.nbcnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feeds.news24.com",
      provider: "feeds.news24.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.news24.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feeds.nos.nl",
      provider: "feeds.nos.nl",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.nos.nl and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "feeds.npr.org",
      provider: "feeds.npr.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit feeds.npr.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fema.gov",
      provider: "fema.gov",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit fema.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fenixservices.fao.org",
      provider: "FAOSTAT",
      kind: "structured",
      observed: false,
      license: "FAOSTAT CC-BY; attribution to FAO required",
      attribution: "FAO. FAOSTAT. https://www.fao.org/faostat/",
      status: "excluded"
    },
    {
      host: "feodotracker.abuse.ch",
      provider: "feodotracker.abuse.ch",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit feodotracker.abuse.ch and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-cyber-threats.mjs"
        }
      ]
    },
    {
      host: "finance.worldmonitor.app",
      provider: "finance.worldmonitor.app",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/app/panel-layout.ts"
        },
        {
          path: "src/config/variant-meta.ts"
        }
      ]
    },
    {
      host: "finance.yahoo.com",
      provider: "finance.yahoo.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit finance.yahoo.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/finance.ts"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "financialpost.com",
      provider: "financialpost.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit financialpost.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "finnhub.io",
      provider: "finnhub.io",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit finnhub.io and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/symbol-search.ts"
        },
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-earnings-calendar.mjs"
        },
        {
          path: "scripts/seed-economy.mjs"
        },
        {
          path: "scripts/shared/market-quote-provider.mjs"
        },
        {
          path: "server/worldmonitor/intelligence/v1/_company-shared.ts"
        },
        {
          path: "server/worldmonitor/market/v1/_quote-provider.ts"
        },
        {
          path: "server/worldmonitor/market/v1/get-insider-transactions.ts"
        }
      ]
    },
    {
      host: "firms.modaps.eosdis.nasa.gov",
      provider: "NASA FIRMS",
      kind: "structured",
      observed: true,
      license: "NASA FIRMS provider terms apply; redistribution terms require review",
      attribution: "Credit NASA FIRMS and link to the original upstream API or dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/wildfire/firms-area.mjs"
        }
      ]
    },
    {
      host: "firms2.modaps.eosdis.nasa.gov",
      provider: "NASA FIRMS",
      kind: "structured",
      observed: false,
      license: "NASA FIRMS provider terms apply; redistribution terms require review",
      attribution: "Credit NASA FIRMS and link to the original upstream API or dataset.",
      status: "excluded"
    },
    {
      host: "focustaiwan.tw",
      provider: "focustaiwan.tw",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit focustaiwan.tw and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fonts.googleapis.com",
      provider: "fonts.googleapis.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "server/_shared/brief-render.js"
        }
      ]
    },
    {
      host: "foreignpolicy.com",
      provider: "foreignpolicy.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit foreignpolicy.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fpri.org",
      provider: "fpri.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit fpri.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fr.africanews.com",
      provider: "fr.africanews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit fr.africanews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fr.euronews.com",
      provider: "fr.euronews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit fr.euronews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fred.stlouisfed.org",
      provider: "fred.stlouisfed.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit fred.stlouisfed.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-oecd-lt-rates.mjs"
        }
      ]
    },
    {
      host: "freeipapi.com",
      provider: "freeipapi.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit freeipapi.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-cyber-threats.mjs"
        }
      ]
    },
    {
      host: "ft.com",
      provider: "ft.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ft.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fwdstart.me",
      provider: "fwdstart.me",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit fwdstart.me and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "fxempire.com",
      provider: "fxempire.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit fxempire.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "gain.nd.edu",
      provider: "gain.nd.edu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit gain.nd.edu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/benchmark-resilience-external.mjs"
        }
      ]
    },
    {
      host: "gamma-api.polymarket.com",
      provider: "gamma-api.polymarket.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit gamma-api.polymarket.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_forecast-market-settlements.mjs"
        },
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-prediction-markets.mjs"
        }
      ]
    },
    {
      host: "gcaptain.com",
      provider: "gcaptain.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit gcaptain.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "geo.tv",
      provider: "geo.tv",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit geo.tv and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "geoserver.cwfif.nrcan.gc.ca",
      provider: "CWFIS / CWFIF (NRCan)",
      kind: "structured",
      observed: true,
      license: "Open Government Licence - Canada; redistribution granted (copy, modify, publish, distribute, including commercial use) with attribution",
      attribution: "Canadian Forest Service. Canadian Wildland Fire Information System (CWFIS), Natural Resources Canada, Canadian Forest Service, Northern Forestry Centre, Edmonton, Alberta. https://cwfis.cfs.nrcan.gc.ca. Contains information licensed under the Open Government Licence \u2013 Canada (https://open.canada.ca/en/open-government-licence-canada). Evidence: https://cwfis.cfs.nrcan.gc.ca/downloads/licence.txt",
      status: "reviewed",
      references: [
        {
          path: "scripts/wildfire/cwfis-wfs.mjs"
        }
      ]
    },
    {
      host: "geospatial-usace.opendata.arcgis.com",
      provider: "geospatial-usace.opendata.arcgis.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit geospatial-usace.opendata.arcgis.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/fetch-mirta-bases.mjs"
        }
      ]
    },
    {
      host: "ghoapi.azureedge.net",
      provider: "ghoapi.azureedge.net",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit ghoapi.azureedge.net and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-resilience-static.mjs"
        }
      ]
    },
    {
      host: "github.blog",
      provider: "github.blog",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit github.blog and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "github.com",
      provider: "github.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/download.js"
        },
        {
          path: "api/health.js"
        },
        {
          path: "scripts/build-accuracy-page.mjs"
        },
        {
          path: "scripts/build-crawlable-corpus.mjs"
        },
        {
          path: "scripts/generate-airline-codes.mjs"
        },
        {
          path: "scripts/seed-research.mjs"
        },
        {
          path: "src/app/desktop-updater.ts"
        },
        {
          path: "src/services/analytics.ts"
        },
        {
          path: "src/services/preferences-content.ts"
        }
      ]
    },
    {
      host: "globalenergymonitor.org",
      provider: "Global Energy Monitor",
      kind: "structured",
      observed: true,
      license: "CC BY 4.0 for published datasets unless the dataset page states otherwise",
      attribution: "Global Energy Monitor; link to the dataset page.",
      status: "reviewed",
      references: [
        {
          path: "scripts/import-gem-pipelines.mjs"
        },
        {
          path: "src/components/PipelineStatusPanel.ts"
        },
        {
          path: "src/components/StorageFacilityMapPanel.ts"
        }
      ]
    },
    {
      host: "globalinitiative.net",
      provider: "globalinitiative.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit globalinitiative.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "globalnews.ca",
      provider: "globalnews.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit globalnews.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "gmfus.org",
      provider: "gmfus.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit gmfus.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "gml.noaa.gov",
      provider: "gml.noaa.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit gml.noaa.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-co2-monitoring.mjs"
        }
      ]
    },
    {
      host: "goldsilverworlds.com",
      provider: "goldsilverworlds.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit goldsilverworlds.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "gpsjam.org",
      provider: "gpsjam.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit gpsjam.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/fetch-gpsjam.mjs"
        }
      ]
    },
    {
      host: "gr.euronews.com",
      provider: "gr.euronews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit gr.euronews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "greatergood.berkeley.edu",
      provider: "greatergood.berkeley.edu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit greatergood.berkeley.edu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "gtaupdate.com",
      provider: "GTA Update",
      kind: "structured",
      observed: true,
      license: "Reuse permission held by WorldMonitor, as confirmed by the repository owner on 2026-08-21. The private grant is not stored in this public repository. Production activation remains separately blocked on official TPS/TFS upstream provenance and the safety, cadence, capacity, and product acceptance gates in issue #7012.",
      attribution: "GTA Update (unofficial third-party TPS/TFS dispatch mirror; not official, not verified, entertainment-only per publisher). Used with permission. Production disabled pending upstream provenance and product activation. https://gtaupdate.com/about.php",
      status: "reviewed",
      catalogActive: false,
      references: [
        {
          path: "scripts/lib/gta-update.mjs"
        }
      ]
    },
    {
      host: "gtfsrt.ttc.ca",
      provider: "Toronto Transit Commission (TTC) GTFS-RT",
      kind: "structured",
      observed: true,
      license: "CKAN package_show for ttc-gtfs-realtime-gtfs-rt: license_id=notspecified, isopen=false (https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=ttc-gtfs-realtime-gtfs-rt). Portal dataset page chrome links OGL-Toronto but is not data-bound to this dataset.",
      attribution: "Toronto Transit Commission GTFS-RT service alerts. https://gtfsrt.ttc.ca and https://open.toronto.ca/dataset/ttc-gtfs-realtime-gtfs-rt/. Portal HTML cites OGL-Toronto; CKAN does not.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-ttc-alerts.mjs"
        }
      ]
    },
    {
      host: "haaretz.com",
      provider: "haaretz.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit haaretz.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "hacker-news.firebaseio.com",
      provider: "hacker-news.firebaseio.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit hacker-news.firebaseio.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-research.mjs"
        }
      ]
    },
    {
      host: "hai.stanford.edu",
      provider: "hai.stanford.edu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit hai.stanford.edu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "hapi.humdata.org",
      provider: "hapi.humdata.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit hapi.humdata.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_conflict-hapi.mjs"
        }
      ]
    },
    {
      host: "happy.worldmonitor.app",
      provider: "happy.worldmonitor.app",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/variant-meta.ts"
        }
      ]
    },
    {
      host: "havanatimes.org",
      provider: "Havana Times",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Havana Times and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "hdr.undp.org",
      provider: "UNDP Human Development Report",
      kind: "structured",
      observed: true,
      license: "UNDP data terms; dataset-specific license applies",
      attribution: "United Nations Development Programme (UNDP) Human Development Report.",
      status: "terms-review",
      references: [
        {
          path: "scripts/benchmark-resilience-external.mjs"
        }
      ]
    },
    {
      host: "health.aws.amazon.com",
      provider: "health.aws.amazon.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit health.aws.amazon.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "hiiraan.com",
      provider: "hiiraan.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit hiiraan.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "hirado.hu",
      provider: "hirado.hu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit hirado.hu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "hnrss.org",
      provider: "hnrss.org",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit hnrss.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "home.treasury.gov",
      provider: "home.treasury.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit home.treasury.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-us-treasury-par-yield.mjs"
        }
      ]
    },
    {
      host: "hormuz.data-tracking.net",
      provider: "hormuz.data-tracking.net",
      kind: "structured",
      observed: true,
      license: "Documented public API, no key (https://hormuz.data-tracking.net/api-docs, reviewed 2026-10-29): data reusable including commercially under CC BY 4.0 with attribution to hormuz.data-tracking.net; republished UKMTO incident reports stay under the Open Government Licence v3.0. The publisher refreshes every 30 minutes and asks clients not to poll faster.",
      attribution: "UK Maritime Trade Operations (https://www.ukmto.org/recent-incidents), contains public sector information licensed under the Open Government Licence v3.0; republished by hormuz.data-tracking.net (CC BY 4.0).",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-ukmto-incidents.mjs"
        }
      ]
    },
    {
      host: "hromadske.ua",
      provider: "hromadske.ua",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit hromadske.ua and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "hts.usitc.gov",
      provider: "hts.usitc.gov",
      kind: "structured",
      observed: true,
      license: "Harmonized Tariff Schedule of the United States, published by the US International Trade Commission; a US federal government work, not subject to copyright (17 U.S.C. 105)",
      attribution: "Credit the USITC Harmonized Tariff Schedule and name the HTS release the rates come from.",
      status: "reviewed",
      references: [
        {
          path: "api/mcp/skill-extension/generated.ts"
        },
        {
          path: "scripts/seed-supply-chain-trade.mjs"
        },
        {
          path: "server/worldmonitor/trade/v1/get-us-import-duty.ts"
        }
      ]
    },
    {
      host: "humanprogress.org",
      provider: "humanprogress.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit humanprogress.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "hvg.hu",
      provider: "hvg.hu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit hvg.hu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "i24newshebrew-cdn.encoders.immergo.tv",
      provider: "i24newshebrew-cdn.encoders.immergo.tv",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "iccc.gov.pg",
      provider: "iccc.gov.pg",
      kind: "structured",
      observed: true,
      license: "All rights reserved",
      attribution: "Credit the PNG Independent Consumer and Competition Commission and link to https://iccc.gov.pg/category/fuel-prices/.",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/regional-energy-feeds.mjs"
        },
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "ici.radio-canada.ca",
      provider: "ici.radio-canada.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ici.radio-canada.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "identity.dataspace.copernicus.eu",
      provider: "identity.dataspace.copernicus.eu",
      kind: "structured",
      observed: true,
      license: "Copernicus Sentinel data policy: free, full and open access, including commercial use and redistribution, with the Copernicus credit",
      attribution: "Contains modified Copernicus Sentinel data [year]",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-no2-activity.mjs"
        }
      ]
    },
    {
      host: "iea.org",
      provider: "iea.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit iea.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "in.usembassy.gov",
      provider: "in.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit in.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "inc42.com",
      provider: "inc42.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit inc42.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "independent.co.uk",
      provider: "The Independent",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit The Independent and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "index.hu",
      provider: "index.hu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit index.hu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "indianexpress.com",
      provider: "indianexpress.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit indianexpress.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "indiatodaylive.akamaized.net",
      provider: "indiatodaylive.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "insideclimatenews.org",
      provider: "insideclimatenews.org",
      kind: "structured",
      observed: false,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit insideclimatenews.org and link to the original upstream API/dataset.",
      status: "excluded"
    },
    {
      host: "insightcrime.org",
      provider: "insightcrime.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit insightcrime.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "interfax.com",
      provider: "Interfax",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Interfax and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "internal.example.com",
      provider: "Internal example placeholder",
      kind: "structured",
      observed: true,
      license: "Excluded: documentation/test placeholder",
      attribution: "Excluded from the provider count: placeholder URL.",
      status: "excluded",
      references: [
        {
          path: "api/notification-channels.ts"
        }
      ]
    },
    {
      host: "investing.com",
      provider: "investing.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit investing.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "ipinfo.io",
      provider: "ipinfo.io",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit ipinfo.io and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-cyber-threats.mjs"
        }
      ]
    },
    {
      host: "iranintl.com",
      provider: "iranintl.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit iranintl.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "iseas.edu.sg",
      provider: "iseas.edu.sg",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit iseas.edu.sg and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "islandtimes.org",
      provider: "islandtimes.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit islandtimes.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "iss.europa.eu",
      provider: "iss.europa.eu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit iss.europa.eu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "it.euronews.com",
      provider: "it.euronews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit it.euronews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "it.usembassy.gov",
      provider: "it.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit it.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "jam-news.net",
      provider: "jam-news.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit jam-news.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "jamestown.org",
      provider: "jamestown.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit jamestown.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "janes.com",
      provider: "janes.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit janes.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "japantimes.co.jp",
      provider: "Japan Times",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Japan Times and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "japantoday.com",
      provider: "japantoday.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit japantoday.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "jin10.com",
      provider: "Jin10",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Jin10 and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "jira-software.status.atlassian.com",
      provider: "jira-software.status.atlassian.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit jira-software.status.atlassian.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "jmespath.org",
      provider: "jmespath.org",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/mcp/constants.ts"
        }
      ]
    },
    {
      host: "jrj.sh.gov.cn",
      provider: "Shanghai Financial Portal",
      kind: "structured",
      observed: true,
      license: "Shanghai Financial Portal copyright statement section 2 (https://jrj.sh.gov.cn/BQSM/index.html), reviewed 2026-10-24. Numeric facts and publication metadata only; retain the credited underlying source. No article prose or third-party media redistribution.",
      attribution: "People\u2019s Bank of China, republished by Shanghai Financial Portal. Link to the dated https://jrj.sh.gov.cn/SCGK194/ report.",
      status: "reviewed",
      references: [
        {
          path: "scripts/_china-macro-contract.mjs"
        },
        {
          path: "scripts/china-macro/source-contracts.mjs"
        }
      ]
    },
    {
      host: "justice.gov",
      provider: "justice.gov",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit justice.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "kalshi.com",
      provider: "kalshi.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit kalshi.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_bet-templates-markets.mjs"
        },
        {
          path: "scripts/seed-prediction-markets.mjs"
        }
      ]
    },
    {
      host: "kan11.media.kan.org.il",
      provider: "kan11.media.kan.org.il",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "kancdn.medonecdn.net",
      provider: "kancdn.medonecdn.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "kathimerini.gr",
      provider: "kathimerini.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit kathimerini.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "kitco.com",
      provider: "kitco.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit kitco.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "kr-asia.com",
      provider: "kr-asia.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit kr-asia.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "krebsonsecurity.com",
      provider: "krebsonsecurity.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit krebsonsecurity.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "kyivindependent.com",
      provider: "kyivindependent.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit kyivindependent.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "lavca.org",
      provider: "lavca.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit lavca.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "lefaso.net",
      provider: "leFaso.net",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit leFaso.net and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "lequotidien.sn",
      provider: "lequotidien.sn",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit lequotidien.sn and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "liberal.gr",
      provider: "liberal.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit liberal.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "libyaherald.com",
      provider: "Libya Herald",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Libya Herald and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "linear901-oo-hls0-prd-gtm.delivery.skycdp.com",
      provider: "linear901-oo-hls0-prd-gtm.delivery.skycdp.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "linearstatus.com",
      provider: "linearstatus.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit linearstatus.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "live-cdn-stream-euw1.bfmtv.bct.nextradiotv.com",
      provider: "live-cdn-stream-euw1.bfmtv.bct.nextradiotv.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "live-gbnews.simplestreamcdn.com",
      provider: "live-gbnews.simplestreamcdn.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "live-hls-apps-aje-fa.getaj.net",
      provider: "live-hls-apps-aje-fa.getaj.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "live-hls-web-aja.getaj.net",
      provider: "live-hls-web-aja.getaj.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "live-hls-web-ajb.getaj.net",
      provider: "live-hls-web-ajb.getaj.net",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "live-hls-web-ajm.getaj.net",
      provider: "live-hls-web-ajm.getaj.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "live-stream.skynewsarabia.com",
      provider: "live-stream.skynewsarabia.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "live.alarabiya.net",
      provider: "live.alarabiya.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "live.dodopayments.com",
      provider: "live.dodopayments.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/product-catalog.js"
        },
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "live.livetvstream.co.uk",
      provider: "live.livetvstream.co.uk",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "live.presstv.co.uk",
      provider: "live.presstv.co.uk",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "live.rudaw.net",
      provider: "live.rudaw.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "liveedge-arisenews.visioncdn.com",
      provider: "liveedge-arisenews.visioncdn.com",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "livenewschat.eu",
      provider: "livenewschat.eu",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "liveuamap.com",
      provider: "liveuamap.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/comparison-shortlist.mjs"
        }
      ]
    },
    {
      host: "lnc-abc-news.tubi.video",
      provider: "lnc-abc-news.tubi.video",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "lobste.rs",
      provider: "lobste.rs",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit lobste.rs and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "localhost",
      provider: "Local development transport",
      kind: "structured",
      observed: true,
      license: "Excluded: local development/test transport",
      attribution: "Excluded from the provider count: local-only URL.",
      status: "excluded",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "server/worldmonitor/research/v1/list-tech-events.ts"
        },
        {
          path: "src/config/desktop-runtime.ts"
        },
        {
          path: "src/services/wm-session.ts"
        }
      ]
    },
    {
      host: "lorientlejour.com",
      provider: "L'Orient Today",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit L'Orient Today and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "lowyinstitute.org",
      provider: "lowyinstitute.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit lowyinstitute.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "macleans.ca",
      provider: "macleans.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit macleans.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "madamasr.com",
      provider: "Mada Masr",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Mada Masr and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "maps.worldmonitor.app",
      provider: "maps.worldmonitor.app",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/services/country-geometry.ts"
        }
      ]
    },
    {
      host: "mapservices.weather.noaa.gov",
      provider: "mapservices.weather.noaa.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit mapservices.weather.noaa.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-natural-events.mjs"
        }
      ]
    },
    {
      host: "marketwatch.com",
      provider: "marketwatch.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit marketwatch.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "masterpl.hls.nhkworld.jp",
      provider: "masterpl.hls.nhkworld.jp",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "mausam.imd.gov.in",
      provider: "India Meteorological Department",
      kind: "structured",
      observed: true,
      license: "Public IMD sea-area and coastal bulletin pages, parsed without an account or key. The RTI IMETD/R/E/25/00381 non-commercial-only terms recorded for the IMD API apply to these pages too. World Monitor public-display and redistribution rights are validated.",
      attribution: "Data source: India Meteorological Department. Link the official marine/coastal bulletin page.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/imd-cyclone-marine.mjs"
        },
        {
          path: "src/app/data-loader.ts"
        }
      ]
    },
    {
      host: "mcp.linear.app",
      provider: "Linear MCP",
      kind: "structured",
      observed: true,
      license: "Excluded: optional user-configured MCP connector",
      attribution: "Excluded from the provider count: user-configured MCP connector.",
      status: "excluded",
      references: [
        {
          path: "src/services/mcp-store.ts"
        }
      ]
    },
    {
      host: "mcp.robtex.com",
      provider: "Robtex MCP",
      kind: "structured",
      observed: true,
      license: "Excluded: optional user-configured MCP connector",
      attribution: "Excluded from the provider count: user-configured MCP connector.",
      status: "excluded",
      references: [
        {
          path: "src/services/mcp-store.ts"
        }
      ]
    },
    {
      host: "me.liveuamap.com",
      provider: "me.liveuamap.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/comparison-shortlist.mjs"
        }
      ]
    },
    {
      host: "meduza.io",
      provider: "meduza.io",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit meduza.io and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "mei.edu",
      provider: "mei.edu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit mei.edu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "mempool.space",
      provider: "mempool.space",
      kind: "structured",
      observed: true,
      license: "mempool.space API terms; underlying Bitcoin data is public but endpoint terms apply",
      attribution: "mempool.space; link to the mining/hashrate API response.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-economy.mjs"
        }
      ]
    },
    {
      host: "messari.io",
      provider: "messari.io",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit messari.io and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "mexiconewsdaily.com",
      provider: "mexiconewsdaily.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit mexiconewsdaily.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "middleeasteye.net",
      provider: "Middle East Eye",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Middle East Eye and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "miit.gov.cn",
      provider: "miit.gov.cn",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit miit.gov.cn and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "mining-journal.com",
      provider: "mining-journal.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit mining-journal.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "miningweekly.com",
      provider: "miningweekly.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit miningweekly.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "mm.usembassy.gov",
      provider: "mm.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit mm.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "mofcom.gov.cn",
      provider: "mofcom.gov.cn",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit mofcom.gov.cn and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "montrealgazette.com",
      provider: "montrealgazette.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit montrealgazette.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "moxie.foxbusiness.com",
      provider: "Fox Business",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Fox Business and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "moxie.foxnews.com",
      provider: "moxie.foxnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit moxie.foxnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "mshibanami.github.io",
      provider: "mshibanami.github.io",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit mshibanami.github.io and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "msi.nga.mil",
      provider: "msi.nga.mil",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit msi.nga.mil and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/get-cable-health.ts"
        },
        {
          path: "server/worldmonitor/maritime/v1/list-navigational-warnings.ts"
        }
      ]
    },
    {
      host: "mx.usembassy.gov",
      provider: "mx.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit mx.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "n1ctsota.akamaized.net",
      provider: "n1ctsota.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "n1info.hr",
      provider: "n1info.hr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit n1info.hr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "nasstatus.faa.gov",
      provider: "nasstatus.faa.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit nasstatus.faa.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/_shared.ts"
        }
      ]
    },
    {
      host: "nation.africa",
      provider: "Daily Nation",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Daily Nation and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "nationalpost.com",
      provider: "nationalpost.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit nationalpost.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "ndtvindiaelemarchana.akamaized.net",
      provider: "ndtvindiaelemarchana.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "news.cgtn.com",
      provider: "news.cgtn.com",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "news.crunchbase.com",
      provider: "news.crunchbase.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit news.crunchbase.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "news.err.ee",
      provider: "news.err.ee",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit news.err.ee and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "news.google.com",
      provider: "news.google.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit news.google.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/source-catalog-identity.mjs"
        },
        {
          path: "server/worldmonitor/intelligence/v1/_country-coverage-feeds.ts"
        },
        {
          path: "server/worldmonitor/market/v1/stock-news-search.ts"
        },
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/finance.ts"
        },
        {
          path: "src/config/variants/tech.ts"
        },
        {
          path: "src/services/country-coverage.ts"
        }
      ],
      role: "transport"
    },
    {
      host: "news.mit.edu",
      provider: "news.mit.edu",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit news.mit.edu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "news.mongabay.com",
      provider: "news.mongabay.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit news.mongabay.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "news.sky.com",
      provider: "Sky News",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Sky News and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "news.tuoitre.vn",
      provider: "news.tuoitre.vn",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit news.tuoitre.vn and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "news.un.org",
      provider: "news.un.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit news.un.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "news.usni.org",
      provider: "news.usni.org",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit news.usni.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "news.ycombinator.com",
      provider: "news.ycombinator.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit news.ycombinator.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "newscientist.com",
      provider: "newscientist.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit newscientist.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "newsfeed.zeit.de",
      provider: "newsfeed.zeit.de",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit newsfeed.zeit.de and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "newsmaker.md",
      provider: "newsmaker.md",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit newsmaker.md and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "nhkwlive-ojp.akamaized.net",
      provider: "nhkwlive-ojp.akamaized.net",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "nmxlive.akamaized.net",
      provider: "nmxlive.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "noaadata.apps.nsidc.org",
      provider: "NSIDC",
      kind: "structured",
      observed: true,
      license: "U.S. government/public dataset terms; collection-specific license applies",
      attribution: "National Snow and Ice Data Center (NSIDC); link to the dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-ocean-ice.mjs"
        }
      ]
    },
    {
      host: "nominatim.openstreetmap.org",
      provider: "nominatim.openstreetmap.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit nominatim.openstreetmap.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/reverse-geocode.js"
        },
        {
          path: "server/worldmonitor/infrastructure/v1/reverse-geocode.ts"
        }
      ]
    },
    {
      host: "northernminer.com",
      provider: "northernminer.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit northernminer.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "novayagazeta.eu",
      provider: "novayagazeta.eu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit novayagazeta.eu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "nrk-nrk1.akamaized.net",
      provider: "nrk-nrk1.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "nti.org",
      provider: "nti.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit nti.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "nytimes.com",
      provider: "The New York Times",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit The New York Times and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "oauth.reddit.com",
      provider: "oauth.reddit.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit oauth.reddit.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "oauth2.googleapis.com",
      provider: "oauth2.googleapis.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/seo-gsc-collect.mjs"
        }
      ]
    },
    {
      host: "oc-media.org",
      provider: "oc-media.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit oc-media.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "ocds-api.etenders.gov.za",
      provider: "ocds-api.etenders.gov.za",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit ocds-api.etenders.gov.za and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "oecd.org",
      provider: "oecd.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit oecd.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "offnadir-delta.com",
      provider: "offnadir-delta.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/comparison-shortlist.mjs"
        }
      ]
    },
    {
      host: "ogcapi.bgs.ac.uk",
      provider: "British Geological Survey World Mineral Statistics",
      kind: "structured",
      observed: true,
      license: "BGS mineral statistics terms; attribution required; redistribution restricted",
      attribution: "British Geological Survey (BGS) World Mineral Production; credit BGS and link to https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/.",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-mineral-production.mjs"
        }
      ]
    },
    {
      host: "oglobo.globo.com",
      provider: "oglobo.globo.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit oglobo.globo.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "oilprice.com",
      provider: "oilprice.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit oilprice.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-energy-intelligence.mjs"
        },
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "oko.press",
      provider: "OKO.press",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit OKO.press and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "onemileatatime.com",
      provider: "onemileatatime.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit onemileatatime.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aviation-news.ts"
        }
      ]
    },
    {
      host: "open-meteo.caseyjhand.com",
      provider: "open-meteo.caseyjhand.com",
      kind: "structured",
      observed: true,
      license: "Community-hosted MCP service. Open-Meteo weather data is CC BY 4.0; free API access is non-commercial only. Commercial access requires a paid Open-Meteo plan and compatible hosting.",
      attribution: "Weather data by Open-Meteo.com. MCP server hosted by cyanheads at open-meteo.caseyjhand.com. Preserve the attribution returned with weather results.",
      status: "terms-review",
      references: [
        {
          path: "src/services/mcp-store.ts"
        }
      ]
    },
    {
      host: "open.alberta.ca",
      provider: "open.alberta.ca",
      kind: "structured",
      observed: false,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit open.alberta.ca and link to the original upstream API/dataset.",
      status: "excluded"
    },
    {
      host: "open.iub.gov.lv",
      provider: "open.iub.gov.lv",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit open.iub.gov.lv and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "open.toronto.ca",
      provider: "City of Toronto Open Data",
      kind: "structured",
      observed: true,
      license: 'CKAN package_show for police-annual-statistical-report-calls-for-service-attended (package id bfffadee-e6e5-4404-8455-e67e9ea11ba7) returned license_id=notspecified, license_title="License not specified", and isopen=false on 2026-09-03. The portal dataset page displays Open Government Licence - Toronto, but that claim is not data-bound to the CKAN package metadata.',
      attribution: "Toronto Police Service, Calls for Service Attended, via City of Toronto Open Data. https://open.toronto.ca/dataset/police-annual-statistical-report-calls-for-service-attended/",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/tps-open-data.mjs"
        }
      ]
    },
    {
      host: "opendata.adsb.fi",
      provider: "adsb.fi Open Data",
      kind: "structured",
      observed: true,
      license: "Public API restricted to personal, non-commercial use; 1 request/second limit",
      attribution: "adsb.fi; cite and link to https://github.com/adsbfi/opendata and comply with its non-commercial restriction.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-military-flights.mjs"
        },
        {
          path: "src/components/MapPopup.ts"
        }
      ]
    },
    {
      host: "openmaps.gov.bc.ca",
      provider: "BC Wildfire Service (OpenMaps)",
      kind: "structured",
      observed: true,
      license: "Open Government Licence - British Columbia; redistribution granted (copy, modify, publish, distribute, including commercial use) with attribution",
      attribution: "Contains information licensed under the Open Government Licence \u2013 British Columbia. BC Wildfire Service, Current Fire Locations (PROT_CURRENT_FIRE_PNTS_SP), Government of British Columbia. https://catalogue.data.gov.bc.ca/dataset/bc-wildfire-fire-locations-current. Evidence: https://www2.gov.bc.ca/gov/content/data/policy-standards/data-policies/open-data/open-government-licence-bc and https://open.canada.ca/data/en/dataset/2790e3f7-6395-4230-8545-04efb5a18800",
      status: "reviewed",
      references: [
        {
          path: "scripts/wildfire/bc-fire-points.mjs"
        }
      ]
    },
    {
      host: "openrouter.ai",
      provider: "openrouter.ai",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/eval-classify-labels.mjs"
        },
        {
          path: "scripts/lib/brief-dedup-consts.mjs"
        },
        {
          path: "scripts/lib/company-monitoring-classifier-client.mjs"
        },
        {
          path: "scripts/regional-snapshot/weekly-brief.mjs"
        }
      ]
    },
    {
      host: "opensky-network.org",
      provider: "opensky-network.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit opensky-network.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-military-flights.mjs"
        },
        {
          path: "server/worldmonitor/military/v1/list-military-flights.ts"
        },
        {
          path: "src/components/MapPopup.ts"
        }
      ]
    },
    {
      host: "openstreetmap.org",
      provider: "openstreetmap.org",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/basemap-styles.ts"
        }
      ]
    },
    {
      host: "ott.tv5monde.com",
      provider: "ott.tv5monde.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "ottawacitizen.com",
      provider: "ottawacitizen.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ottawacitizen.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "otx.alienvault.com",
      provider: "otx.alienvault.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit otx.alienvault.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-cyber-threats.mjs"
        }
      ]
    },
    {
      host: "ourworldindata.org",
      provider: "Our World in Data",
      kind: "structured",
      observed: true,
      license: "CC BY 4.0 for the dataset unless the dataset page states otherwise",
      attribution: "Our World in Data; link to the dataset page.",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-low-carbon-generation.mjs"
        },
        {
          path: "server/worldmonitor/resilience/v1/_dimension-scorers.ts"
        },
        {
          path: "server/worldmonitor/resilience/v1/_indicator-source-policy.ts"
        }
      ]
    },
    {
      host: "outbreaknewstoday.com",
      provider: "outbreaknewstoday.com",
      kind: "structured",
      observed: false,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit outbreaknewstoday.com and link to the original upstream API/dataset.",
      status: "excluded"
    },
    {
      host: "overpass-api.de",
      provider: "overpass-api.de",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit overpass-api.de and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/fetch-osm-bases.mjs"
        }
      ]
    },
    {
      host: "owid-public.owid.io",
      provider: "Our World in Data",
      kind: "structured",
      observed: true,
      license: "CC BY 4.0 for the dataset unless the dataset page states otherwise",
      attribution: "Our World in Data; link to the dataset page.",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-owid-energy-mix.mjs"
        }
      ]
    },
    {
      host: "pajhwok.com",
      provider: "Pajhwok Afghan News",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Pajhwok Afghan News and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "pap.pl",
      provider: "PAP",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit PAP and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "patents.google.com",
      provider: "patents.google.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit patents.google.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_defense-patents-source.mjs"
        }
      ]
    },
    {
      host: "pe-fa-lp02a.9c9media.com",
      provider: "pe-fa-lp02a.9c9media.com",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "petrobangla.org.bd",
      provider: "petrobangla.org.bd",
      kind: "structured",
      observed: true,
      license: "Unconfirmed",
      attribution: "Credit Petrobangla daily gas and link to https://petrobangla.org.bd/pages/reports.",
      status: "terms-review",
      references: [
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "phys.org",
      provider: "phys.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit phys.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-news.mjs"
        }
      ]
    },
    {
      host: "pitchbook.com",
      provider: "pitchbook.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit pitchbook.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "pk.usembassy.gov",
      provider: "pk.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit pk.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "pl.usembassy.gov",
      provider: "pl.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit pl.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "pncp.gov.br",
      provider: "pncp.gov.br",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit pncp.gov.br and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "polityka.pl",
      provider: "Polityka",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Polityka and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "polymarket.com",
      provider: "polymarket.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit polymarket.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/mcp/skill-extension/generated.ts"
        },
        {
          path: "scripts/_bet-templates-markets.mjs"
        },
        {
          path: "scripts/seed-prediction-markets.mjs"
        }
      ]
    },
    {
      host: "population.un.org",
      provider: "United Nations Population Division",
      kind: "structured",
      observed: true,
      license: "UN World Population Prospects 2024 is licensed under CC BY 3.0 IGO.",
      attribution: "United Nations, Department of Economic and Social Affairs, Population Division (2024). World Population Prospects 2024.",
      status: "reviewed",
      references: [
        {
          path: "scripts/_demographics-capability-source.mjs"
        }
      ]
    },
    {
      host: "portal.korem.kz",
      provider: "portal.korem.kz",
      kind: "structured",
      observed: true,
      license: "Unconfirmed",
      attribution: "Credit KOREM, the Kazakhstan electricity market operator and link to https://portal.korem.kz/?lang=ru.",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/regional-energy-feeds.mjs"
        },
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "portfolio.hu",
      provider: "portfolio.hu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit portfolio.hu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "portwatch.imf.org",
      provider: "portwatch.imf.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit portwatch.imf.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/build-chokepoint-transit-snapshot.mjs"
        },
        {
          path: "scripts/seed-oil-trade-series.mjs"
        }
      ]
    },
    {
      host: "pravda.com.ua",
      provider: "pravda.com.ua",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit pravda.com.ua and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "prnewswire.com",
      provider: "PR Newswire",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit PR Newswire and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "pro-api.coingecko.com",
      provider: "pro-api.coingecko.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit pro-api.coingecko.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "production.dataviz.cnn.io",
      provider: "production.dataviz.cnn.io",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit production.dataviz.cnn.io and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-fear-greed.mjs"
        }
      ]
    },
    {
      host: "protomaps.com",
      provider: "protomaps.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/basemap-styles.ts"
        }
      ]
    },
    {
      host: "protothema.gr",
      provider: "protothema.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit protothema.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "proxy.worldmonitor.app",
      provider: "World Monitor proxy",
      kind: "structured",
      observed: true,
      license: "Excluded: World Monitor own service/control plane",
      attribution: "Excluded from the external-provider count: first-party proxy endpoint.",
      status: "excluded",
      references: [
        {
          path: "api/widget-agent.ts"
        },
        {
          path: "scripts/seed-security-advisories.mjs"
        },
        {
          path: "src/utils/proxy.ts"
        }
      ]
    },
    {
      host: "pt.euronews.com",
      provider: "pt.euronews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit pt.euronews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "public-api.prozorro.gov.ua",
      provider: "public-api.prozorro.gov.ua",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit public-api.prozorro.gov.ua and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "public.govdelivery.com",
      provider: "public.govdelivery.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit public.govdelivery.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-regulatory-actions.mjs"
        }
      ]
    },
    {
      host: "publicacionexterna.azurewebsites.net",
      provider: "publicacionexterna.azurewebsites.net",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit publicacionexterna.azurewebsites.net and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-fuel-prices.mjs"
        }
      ]
    },
    {
      host: "publicreporting.cftc.gov",
      provider: "CFTC Commitments of Traders",
      kind: "structured",
      observed: true,
      license: "U.S. government public data; endpoint terms apply",
      attribution: "U.S. Commodity Futures Trading Commission (CFTC), Commitments of Traders.",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-cot.mjs"
        }
      ]
    },
    {
      host: "purl.org",
      provider: "PURL namespace",
      kind: "structured",
      observed: true,
      license: "Excluded: schema/namespace reference",
      attribution: "Excluded from the provider count: namespace reference, not an ingested source.",
      status: "excluded",
      references: [
        {
          path: "src/services/rss.ts"
        }
      ]
    },
    {
      host: "qevdnlpgjxpwusesmtpx.supabase.co",
      provider: "qevdnlpgjxpwusesmtpx.supabase.co",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit qevdnlpgjxpwusesmtpx.supabase.co and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/fetch-pizzint-bases.mjs"
        }
      ]
    },
    {
      host: "query.sse.com.cn",
      provider: "query.sse.com.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit query.sse.com.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/china-corporate-disclosures/adapters.mjs"
        }
      ]
    },
    {
      host: "query.wikidata.org",
      provider: "Wikidata",
      kind: "structured",
      observed: true,
      license: "Creative Commons CC0 1.0 Universal",
      attribution: "Wikidata structured data is CC0. Credit Wikidata and link each reused entity identifier as a best practice.",
      status: "reviewed",
      references: [
        {
          path: "scripts/freeze-resilience-ranking.mjs"
        },
        {
          path: "server/worldmonitor/intelligence/v1/get-country-facts.ts"
        }
      ]
    },
    {
      host: "query1.finance.yahoo.com",
      provider: "query1.finance.yahoo.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit query1.finance.yahoo.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_seed-utils.mjs"
        },
        {
          path: "scripts/_yahoo-fetch.mjs"
        },
        {
          path: "scripts/_yahoo-sector-valuations.cjs"
        },
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-commodity-quotes.mjs"
        },
        {
          path: "scripts/seed-economy.mjs"
        },
        {
          path: "scripts/seed-etf-flows.mjs"
        },
        {
          path: "scripts/seed-fear-greed.mjs"
        },
        {
          path: "scripts/seed-fx-yoy.mjs"
        },
        {
          path: "scripts/seed-gulf-quotes.mjs"
        },
        {
          path: "scripts/seed-market-correlation-series.mjs"
        },
        {
          path: "scripts/seed-market-quotes.mjs"
        },
        {
          path: "server/worldmonitor/market/v1/analyze-stock.ts"
        },
        {
          path: "server/worldmonitor/market/v1/get-country-stock-index.ts"
        },
        {
          path: "server/worldmonitor/market/v1/get-price-history.ts"
        }
      ]
    },
    {
      host: "radar.cloudflare.com",
      provider: "radar.cloudflare.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit radar.cloudflare.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/resilience/v1/_indicator-source-policy.ts"
        }
      ]
    },
    {
      host: "radar.mcp.cloudflare.com",
      provider: "Cloudflare Radar MCP",
      kind: "structured",
      observed: true,
      license: "Excluded: optional user-configured MCP connector",
      attribution: "Excluded from the provider count: user-configured MCP connector.",
      status: "excluded",
      references: [
        {
          path: "src/services/mcp-store.ts"
        }
      ]
    },
    {
      host: "radnet.epa.gov",
      provider: "EPA RadNet",
      kind: "structured",
      observed: true,
      license: "U.S. government public data; EPA terms apply",
      attribution: "U.S. Environmental Protection Agency (EPA) RadNet.",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-radiation-watch.mjs"
        }
      ]
    },
    {
      host: "railway.instatus.com",
      provider: "railway.instatus.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit railway.instatus.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "rakuten-guardian-1-ie.samsung.wurl.tv",
      provider: "rakuten-guardian-1-ie.samsung.wurl.tv",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "ransomware.live",
      provider: "ransomware.live",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ransomware.live and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "raw.githubusercontent.com",
      provider: "raw.githubusercontent.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit raw.githubusercontent.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/fetch-country-boundary-overrides.mjs"
        },
        {
          path: "scripts/generate-airline-codes.mjs"
        },
        {
          path: "scripts/generate-oref-locations.mjs"
        },
        {
          path: "scripts/seed-cyber-threats.mjs"
        },
        {
          path: "scripts/seed-disease-outbreaks.mjs"
        }
      ]
    },
    {
      host: "reasonstobecheerful.world",
      provider: "reasonstobecheerful.world",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit reasonstobecheerful.world and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "reddit.com",
      provider: "reddit.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "src/services/story-share.ts"
        }
      ]
    },
    {
      host: "registry.modelcontextprotocol.io",
      provider: "registry.modelcontextprotocol.io",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/publish-mcp-registry.mjs"
        }
      ]
    },
    {
      host: "reliefweb.int",
      provider: "reliefweb.int",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit reliefweb.int and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-news.mjs"
        }
      ]
    },
    {
      host: "renaissancecapital.com",
      provider: "renaissancecapital.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit renaissancecapital.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "responsiblestatecraft.org",
      provider: "responsiblestatecraft.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit responsiblestatecraft.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "restcountries.com",
      provider: "restcountries.com",
      kind: "structured",
      observed: false,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit restcountries.com and link to the original upstream API/dataset.",
      status: "excluded"
    },
    {
      host: "reuters-reutersnow-1-eu.rakuten.wurl.tv",
      provider: "reuters-reutersnow-1-eu.rakuten.wurl.tv",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "reuters.com",
      provider: "reuters.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit reuters.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "review.firstround.com",
      provider: "review.firstround.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit review.firstround.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "rferl.org",
      provider: "rferl.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit rferl.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "rieti.go.jp",
      provider: "rieti.go.jp",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit rieti.go.jp and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "rsf.org",
      provider: "Reporters Without Borders (RSF)",
      kind: "structured",
      observed: true,
      license: "RSF terms; attribution required",
      attribution: "Reporters Without Borders (RSF) World Press Freedom Index.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-resilience-static.mjs"
        }
      ]
    },
    {
      host: "rsmcnewdelhi.imd.gov.in",
      provider: "India Meteorological Department",
      kind: "structured",
      observed: true,
      license: "Official RSMC New Delhi visualization pages cited for attribution and source links, not scraped.",
      attribution: "Data source: India Meteorological Department / RSMC New Delhi. Link https://rsmcnewdelhi.imd.gov.in/.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/imd-cyclone-marine.mjs"
        }
      ]
    },
    {
      host: "rss.art19.com",
      provider: "rss.art19.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit rss.art19.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "rss.dw.com",
      provider: "rss.dw.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit rss.dw.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "rss.libsyn.com",
      provider: "rss.libsyn.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit rss.libsyn.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "rss.politico.com",
      provider: "rss.politico.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit rss.politico.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "rt-arb.rttv.com",
      provider: "rt-arb.rttv.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "rt-english.com",
      provider: "rt-english.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit rt-english.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "rt-esp.rttv.com",
      provider: "rt-esp.rttv.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "rt-glb.rttv.com",
      provider: "rt-glb.rttv.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "rtvelivestream.rtve.es",
      provider: "rtvelivestream.rtve.es",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "ru.euronews.com",
      provider: "ru.euronews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ru.euronews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "rudaw.net",
      provider: "rudaw.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit rudaw.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "rusi.org",
      provider: "rusi.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit rusi.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "sabconetanw.cdn.mangomolo.com",
      provider: "sabconetanw.cdn.mangomolo.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "sanaacenter.org",
      provider: "Sana'a Center",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Sana'a Center and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "sanctionslistservice.ofac.treas.gov",
      provider: "sanctionslistservice.ofac.treas.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit sanctionslistservice.ofac.treas.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-sanctions-pressure.mjs"
        }
      ]
    },
    {
      host: "scanner.tradingview.com",
      provider: "TradingView",
      kind: "structured",
      observed: true,
      license: "TradingView terms; the screener scan endpoint is undocumented and redistribution requires review",
      attribution: "TradingView; link to the S&P 500 stock screener.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_sp500-breadth.mjs"
        }
      ]
    },
    {
      host: "sccd.royalnavy.mod.uk",
      provider: "sccd.royalnavy.mod.uk",
      kind: "structured",
      observed: false,
      license: "UKMTO terms sections 20-23 permit reuse under the Open Government Licence v3.0, subject to excluded third-party rights. Website JSON backend; no verified external developer support contract.",
      attribution: "UK Maritime Trade Operations. Link https://www.ukmto.org/recent-incidents and https://www.ukmto.org/terms-and-conditions. Contains public sector information licensed under the Open Government Licence v3.0.",
      status: "excluded"
    },
    {
      host: "schema.org",
      provider: "schema.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit schema.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/ask.ts"
        },
        {
          path: "scripts/build-accuracy-page.mjs"
        },
        {
          path: "scripts/build-crawlable-corpus.mjs"
        },
        {
          path: "scripts/build-use-cases.mjs"
        },
        {
          path: "scripts/comparison-shortlist.mjs"
        },
        {
          path: "scripts/crawlable-sources-page.mjs"
        }
      ]
    },
    {
      host: "schemas.agentskills.io",
      provider: "schemas.agentskills.io",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/build-agent-skills-index.mjs"
        }
      ]
    },
    {
      host: "scmp.com",
      provider: "scmp.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit scmp.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "sdmx.ilo.org",
      provider: "ILOSTAT",
      kind: "structured",
      observed: true,
      license: "ILOSTAT datasets and metadata published from 3 May 2023 are licensed under CC BY 4.0.",
      attribution: "International Labour Organization, ILOSTAT database; include the dataset and extraction date.",
      status: "reviewed",
      references: [
        {
          path: "scripts/_demographics-capability-source.mjs"
        }
      ]
    },
    {
      host: "sdmx.oecd.org",
      provider: "sdmx.oecd.org",
      kind: "structured",
      observed: false,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit sdmx.oecd.org and link to the original upstream API/dataset.",
      status: "excluded"
    },
    {
      host: "sealevel.nasa.gov",
      provider: "sealevel.nasa.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit sealevel.nasa.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-ocean-ice.mjs"
        }
      ]
    },
    {
      host: "search.parallel.ai",
      provider: "Parallel Search MCP",
      kind: "structured",
      observed: true,
      license: "Excluded: optional user-configured MCP connector",
      attribution: "Excluded from the provider count: user-configured MCP connector.",
      status: "excluded",
      references: [
        {
          path: "src/services/mcp-store.ts"
        }
      ]
    },
    {
      host: "search.seznam.cz",
      provider: "search.seznam.cz",
      kind: "structured",
      observed: false,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded"
    },
    {
      host: "search.worldbank.org",
      provider: "search.worldbank.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit search.worldbank.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-global-tenders.mjs"
        }
      ]
    },
    {
      host: "search.yahoo.com",
      provider: "search.yahoo.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/services/rss.ts"
        }
      ]
    },
    {
      host: "searchadvisor.naver.com",
      provider: "searchadvisor.naver.com",
      kind: "structured",
      observed: false,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded"
    },
    {
      host: "searchconsole.googleapis.com",
      provider: "searchconsole.googleapis.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/seo-gsc-collect.mjs"
        }
      ]
    },
    {
      host: "secure.toronto.ca",
      provider: "City of Toronto Open Data",
      kind: "structured",
      observed: true,
      license: 'CKAN package_show for road-restrictions: license_id=notspecified, license_title="License not specified" (https://ckan0.cf.opendata.inter.prod-toronto.ca/api/3/action/package_show?id=road-restrictions). Portal dataset page chrome links OGL-Toronto but is not data-bound to this dataset.',
      attribution: "City of Toronto, Road Restrictions. https://open.toronto.ca/dataset/road-restrictions/",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/toronto-road-restrictions.mjs"
        }
      ]
    },
    {
      host: "sedeaplicaciones.minetur.gob.es",
      provider: "sedeaplicaciones.minetur.gob.es",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit sedeaplicaciones.minetur.gob.es and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/backfill-fuel-prices-prev.mjs"
        },
        {
          path: "scripts/seed-fuel-prices.mjs"
        }
      ]
    },
    {
      host: "seekingalpha.com",
      provider: "seekingalpha.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit seekingalpha.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/finance.ts"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "semianalysis.com",
      provider: "semianalysis.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit semianalysis.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "sequoiacap.com",
      provider: "sequoiacap.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit sequoiacap.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "serpapi.com",
      provider: "SerpAPI",
      kind: "structured",
      observed: true,
      license: "SerpAPI terms",
      attribution: "SerpAPI; link to the result and original publisher.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/market/v1/stock-news-search.ts"
        }
      ]
    },
    {
      host: "services.arcgis.com",
      provider: "Toronto Police Service",
      kind: "structured",
      observed: true,
      license: "Open Government Licence \u2013 Ontario as published on the TPS Calls for Service Experience item a22f5295933e48a5b0a4c90cd3c4cae1 (licenseInfo), plus TPS Public Safety Data Portal terms on that item: no identification of individuals, no TPS marks. Layer C4S_Public_NoGO is the privacy-filtered public Calls-for-Service map (refresh ~20 min). Not Major Crime Indicators / YTD.",
      attribution: "Toronto Police Service, Calls for Service. Contains information licensed under the Open Government Licence \u2013 Ontario.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/toronto-official-cad.mjs"
        },
        {
          path: "scripts/lib/tps-open-data.mjs"
        }
      ]
    },
    {
      host: "services6.arcgis.com",
      provider: "B.C. Evacuation Orders and Alerts",
      kind: "structured",
      observed: true,
      license: "Open Government Licence - British Columbia (OGL-BC). The B.C. Data Catalogue record 7efd46d0-b5d3-4dff-af80-d376c42aec33 explicitly assigns OGL-BC to this ArcGIS layer.",
      attribution: "Contains information licensed under the Open Government Licence - British Columbia. https://catalogue.data.gov.bc.ca/dataset/7efd46d0-b5d3-4dff-af80-d376c42aec33",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/bc-emergency-info.mjs"
        }
      ]
    },
    {
      host: "services7.arcgis.com",
      provider: "services7.arcgis.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit services7.arcgis.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/fetch-mirta-bases.mjs"
        }
      ]
    },
    {
      host: "services9.arcgis.com",
      provider: "services9.arcgis.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit services9.arcgis.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/build-chokepoint-transit-snapshot.mjs"
        },
        {
          path: "scripts/seed-oil-trade-series.mjs"
        },
        {
          path: "scripts/seed-portwatch-chokepoints-ref.mjs"
        },
        {
          path: "scripts/seed-portwatch-disruptions.mjs"
        },
        {
          path: "scripts/seed-portwatch-port-activity.mjs"
        },
        {
          path: "scripts/seed-portwatch.mjs"
        }
      ]
    },
    {
      host: "severeweather.wmo.int",
      provider: "severeweather.wmo.int",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit severeweather.wmo.int and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_weather-alert-select.mjs"
        }
      ]
    },
    {
      host: "sh.dataspace.copernicus.eu",
      provider: "sh.dataspace.copernicus.eu",
      kind: "structured",
      observed: true,
      license: "Copernicus Sentinel data policy: free, full and open access, including commercial use and redistribution, with the Copernicus credit",
      attribution: "Contains modified Copernicus Sentinel data [year]",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-no2-activity.mjs"
        }
      ]
    },
    {
      host: "sifted.eu",
      provider: "sifted.eu",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit sifted.eu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "simpleflying.com",
      provider: "simpleflying.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit simpleflying.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aviation-news.ts"
        }
      ]
    },
    {
      host: "singularityhub.com",
      provider: "singularityhub.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit singularityhub.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "skai-live.siliconweb.com",
      provider: "skai-live.siliconweb.com",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "slack-status.com",
      provider: "slack-status.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit slack-status.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "slack.com",
      provider: "slack.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/channel-oauth-bind.ts"
        },
        {
          path: "api/slack/oauth/callback.ts"
        },
        {
          path: "api/slack/oauth/start.ts"
        }
      ]
    },
    {
      host: "slidstvo.info",
      provider: "slidstvo.info",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit slidstvo.info and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "spglobal.com",
      provider: "spglobal.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit spglobal.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "state.gov",
      provider: "state.gov",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit state.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "stats.bis.org",
      provider: "stats.bis.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit stats.bis.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-bis-data.mjs"
        },
        {
          path: "scripts/seed-bis-extended.mjs"
        },
        {
          path: "scripts/seed-bis-lbs.mjs"
        },
        {
          path: "scripts/seed-capital-flows.mjs"
        },
        {
          path: "server/worldmonitor/economic/v1/_bis-shared.ts"
        }
      ]
    },
    {
      host: "status.circleci.com",
      provider: "status.circleci.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.circleci.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.claude.com",
      provider: "status.claude.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.claude.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.cloud.google.com",
      provider: "status.cloud.google.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.cloud.google.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.datadoghq.com",
      provider: "status.datadoghq.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.datadoghq.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.digitalocean.com",
      provider: "status.digitalocean.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.digitalocean.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.gitlab.com",
      provider: "status.gitlab.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.gitlab.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.npmjs.org",
      provider: "status.npmjs.org",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.npmjs.org and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.openai.com",
      provider: "status.openai.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.openai.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.render.com",
      provider: "status.render.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.render.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.sentry.io",
      provider: "status.sentry.io",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.sentry.io and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.stripe.com",
      provider: "status.stripe.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.stripe.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.supabase.com",
      provider: "status.supabase.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.supabase.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "status.twilio.com",
      provider: "status.twilio.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit status.twilio.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "storage.eop.bg",
      provider: "storage.eop.bg",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit storage.eop.bg and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "storage.googleapis.com",
      provider: "Ember electricity data",
      kind: "structured",
      observed: true,
      license: "CC BY 4.0 (Ember dataset)",
      attribution: "Ember; link to the Ember dataset and preserve its license notice.",
      status: "reviewed",
      references: [
        {
          path: "scripts/_conflict-gdelt-bulk.mjs"
        },
        {
          path: "scripts/_gdelt-bulk-materializer.mjs"
        },
        {
          path: "scripts/seed-ember-electricity.mjs"
        }
      ]
    },
    {
      host: "stratechery.com",
      provider: "stratechery.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit stratechery.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "stream.ads.ottera.tv",
      provider: "stream.ads.ottera.tv",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "streaming-live.rtp.pt",
      provider: "streaming-live.rtp.pt",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "suspilne.media",
      provider: "suspilne.media",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit suspilne.media and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "svs.itworkscdn.net",
      provider: "svs.itworkscdn.net",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "syriadirect.org",
      provider: "Syria Direct",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Syria Direct and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "t.me",
      provider: "t.me",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/telegram-feed.js"
        },
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "server/worldmonitor/leads/v1/register-interest.ts"
        },
        {
          path: "src/services/story-share.ts"
        },
        {
          path: "src/services/telegram-intel.ts"
        }
      ]
    },
    {
      host: "tagesschau.akamaized.net",
      provider: "tagesschau.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "taipeitimes.com",
      provider: "taipeitimes.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit taipeitimes.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "taiwannews.com.tw",
      provider: "taiwannews.com.tw",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit taiwannews.com.tw and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "taskandpurpose.com",
      provider: "taskandpurpose.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit taskandpurpose.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "tass.com",
      provider: "tass.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit tass.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "tchadinfos.com",
      provider: "Tchadinfos",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Tchadinfos and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "tech.eu",
      provider: "tech.eu",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit tech.eu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "tech.worldmonitor.app",
      provider: "tech.worldmonitor.app",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/app/panel-layout.ts"
        },
        {
          path: "src/config/variant-meta.ts"
        }
      ]
    },
    {
      host: "techcabal.com",
      provider: "techcabal.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit techcabal.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "techcrunch.com",
      provider: "techcrunch.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit techcrunch.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "techinasia.com",
      provider: "techinasia.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit techinasia.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "telegraaf.nl",
      provider: "telegraaf.nl",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit telegraaf.nl and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "telex.hu",
      provider: "telex.hu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit telex.hu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "tenders.go.ke",
      provider: "tenders.go.ke",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit tenders.go.ke and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "test",
      provider: "test",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/seed-forecasts.mjs"
        }
      ]
    },
    {
      host: "test.dodopayments.com",
      provider: "test.dodopayments.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/product-catalog.js"
        },
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "th.usembassy.gov",
      provider: "th.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit th.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "thebetterindia.com",
      provider: "thebetterindia.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thebetterindia.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "theblock.co",
      provider: "theblock.co",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit theblock.co and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thebulletin.org",
      provider: "thebulletin.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thebulletin.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thedailystar.net",
      provider: "The Daily Star",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit The Daily Star and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thedefiant.io",
      provider: "thedefiant.io",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thedefiant.io and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thediplomat.com",
      provider: "thediplomat.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thediplomat.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "theguardianpostcameroon.com",
      provider: "The Guardian Post",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit The Guardian Post and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thehill.com",
      provider: "thehill.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thehill.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "theinformation.com",
      provider: "theinformation.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit theinformation.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thejakartapost.com",
      provider: "thejakartapost.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thejakartapost.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thenarwhal.ca",
      provider: "thenarwhal.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thenarwhal.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thenationalnews.com",
      provider: "thenationalnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thenationalnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thenewstack.io",
      provider: "thenewstack.io",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thenewstack.io and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "thenextweb.com",
      provider: "thenextweb.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thenextweb.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thepointsguy.com",
      provider: "thepointsguy.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit thepointsguy.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aviation-news.ts"
        }
      ]
    },
    {
      host: "theprovince.com",
      provider: "theprovince.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit theprovince.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thesentry.org",
      provider: "thesentry.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thesentry.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thestar.com.my",
      provider: "thestar.com.my",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thestar.com.my and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thetyee.ca",
      provider: "thetyee.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit thetyee.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "thinkglobalhealth.github.io",
      provider: "thinkglobalhealth.github.io",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit thinkglobalhealth.github.io and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-disease-outbreaks.mjs"
        },
        {
          path: "scripts/seed-vpd-tracker.mjs"
        }
      ]
    },
    {
      host: "tiles.openfreemap.org",
      provider: "tiles.openfreemap.org",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/basemap.ts"
        }
      ]
    },
    {
      host: "timesca.com",
      provider: "timesca.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit timesca.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "timesofindia.indiatimes.com",
      provider: "Times of India",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Times of India and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "timesofisrael.com",
      provider: "Times of Israel",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Times of Israel and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "tools.cdc.gov",
      provider: "tools.cdc.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit tools.cdc.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-disease-outbreaks.mjs"
        }
      ]
    },
    {
      host: "travel.state.gov",
      provider: "travel.state.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit travel.state.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "treasury.gov",
      provider: "treasury.gov",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit treasury.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "trumpstruth.org",
      provider: "trumpstruth.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit trumpstruth.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "tsimobile.viarail.ca",
      provider: "VIA Rail Tracker (unofficial)",
      kind: "structured",
      observed: true,
      license: "VIA Rail Site Terms prohibit commercial use of the Site (https://www.viarail.ca/en/terms-and-conditions). Developer Resources publish GTFS only under Open Government Licence \u2013 Canada v2 (https://www.viarail.ca/en/developer-resources); that OGL grant does not cover tsimobile.viarail.ca unofficial live JSON. Terms require review.",
      attribution: "VIA Rail Canada; unofficial live train JSON at tsimobile.viarail.ca. Not the Developer Resources GTFS feed; OGL does not apply to this host. Best-effort only.",
      status: "terms-review",
      references: [
        {
          path: "scripts/viarail-live.mjs"
        }
      ]
    },
    {
      host: "tts.baidu.com",
      provider: "tts.baidu.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/main.ts"
        }
      ]
    },
    {
      host: "tuoitrenews.vn",
      provider: "tuoitrenews.vn",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit tuoitrenews.vn and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "turnerlive.warnermediacdn.com",
      provider: "turnerlive.warnermediacdn.com",
      kind: "feed",
      observed: false,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded"
    },
    {
      host: "tv-trthaber.medya.trt.com.tr",
      provider: "tv-trthaber.medya.trt.com.tr",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "tv-trtworld.medya.trt.com.tr",
      provider: "tv-trtworld.medya.trt.com.tr",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "tvn24.pl",
      provider: "tvn24.pl",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit tvn24.pl and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "tvp.info",
      provider: "TVP Info",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit TVP Info and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "twitter.com",
      provider: "twitter.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/services/story-share.ts"
        }
      ]
    },
    {
      host: "ua.usembassy.gov",
      provider: "ua.usembassy.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit ua.usembassy.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "ucdpapi.pcr.uu.se",
      provider: "ucdpapi.pcr.uu.se",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit ucdpapi.pcr.uu.se and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-ucdp-events.mjs"
        }
      ]
    },
    {
      host: "uis.unesco.org",
      provider: "uis.unesco.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit uis.unesco.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/resilience/v1/_indicator-source-policy.ts"
        }
      ]
    },
    {
      host: "ukrinform.net",
      provider: "ukrinform.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ukrinform.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "ukrinform.ua",
      provider: "ukrinform.ua",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit ukrinform.ua and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "unchainedcrypto.com",
      provider: "unchainedcrypto.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit unchainedcrypto.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "understandingwar.org",
      provider: "understandingwar.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit understandingwar.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "unhcr.org",
      provider: "unhcr.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit unhcr.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "unstats.un.org",
      provider: "unstats.un.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit unstats.un.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/build-un-m49-regions.mjs"
        }
      ]
    },
    {
      host: "urlhaus-api.abuse.ch",
      provider: "urlhaus-api.abuse.ch",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit urlhaus-api.abuse.ch and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-cyber-threats.mjs"
        }
      ]
    },
    {
      host: "us.sentry.io",
      provider: "Sentry error tracking",
      kind: "structured",
      observed: true,
      license: "Excluded: World Monitor operational telemetry, not an external data provider",
      attribution: "Excluded from the provider count: internal error-tracking request.",
      status: "excluded",
      references: [
        {
          path: "scripts/audit-sentry-resolve-pins.mjs"
        },
        {
          path: "scripts/sync-sentry-convex-probe-filters.mjs"
        }
      ]
    },
    {
      host: "user",
      provider: "Proxy URL placeholder",
      kind: "structured",
      observed: true,
      license: "Excluded: URL-format example",
      attribution: "Excluded from the provider count: credentials placeholder.",
      status: "excluded",
      references: [
        {
          path: "scripts/_proxy-utils.cjs"
        },
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "ustr.gov",
      provider: "Office of the U.S. Trade Representative",
      kind: "feed",
      observed: true,
      license: "U.S. government public information; site and document-specific notices apply",
      attribution: "Office of the U.S. Trade Representative; link to the original release.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "vancouversun.com",
      provider: "vancouversun.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit vancouversun.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "venturebeat.com",
      provider: "venturebeat.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit venturebeat.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "viewfromthewing.com",
      provider: "viewfromthewing.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit viewfromthewing.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aviation-news.ts"
        }
      ]
    },
    {
      host: "vnexpress.net",
      provider: "vnexpress.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit vnexpress.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "vs-hls-push-uk.live.fastly.md.bbci.co.uk",
      provider: "vs-hls-push-uk.live.fastly.md.bbci.co.uk",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "vsquare.org",
      provider: "vsquare.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit vsquare.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "wa.me",
      provider: "wa.me",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "server/worldmonitor/leads/v1/register-interest.ts"
        },
        {
          path: "src/services/story-share.ts"
        }
      ]
    },
    {
      host: "wabi-europe-north-b-api.analysis.windows.net",
      provider: "wabi-europe-north-b-api.analysis.windows.net",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit wabi-europe-north-b-api.analysis.windows.net and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-hormuz.mjs"
        }
      ]
    },
    {
      host: "warontherocks.com",
      provider: "warontherocks.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit warontherocks.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "washingtonpost.com",
      provider: "The Washington Post",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit The Washington Post and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "web-api.tp.entsoe.eu",
      provider: "ENTSO-E Transparency Platform",
      kind: "structured",
      observed: true,
      license: "ENTSO-E Transparency Platform terms",
      attribution: "ENTSO-E Transparency Platform; link to the returned dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-electricity-prices.mjs"
        }
      ]
    },
    {
      host: "web.archive.org",
      provider: "web.archive.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit web.archive.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-fatf-listing.mjs"
        }
      ]
    },
    {
      host: "web.cbr.ru",
      provider: "web.cbr.ru",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/seed-cbr-rates.mjs"
        }
      ]
    },
    {
      host: "webcams.windy.com",
      provider: "webcams.windy.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "shared/pinned-webcams.ts"
        }
      ]
    },
    {
      host: "websummit.com",
      provider: "websummit.com",
      kind: "structured",
      observed: false,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit websummit.com and link to the original upstream API/dataset.",
      status: "excluded"
    },
    {
      host: "whitehouse.gov",
      provider: "whitehouse.gov",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit whitehouse.gov and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "wiadomosci.onet.pl",
      provider: "Onet",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Onet and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "wilsoncenter.org",
      provider: "wilsoncenter.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit wilsoncenter.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "wingbits.com",
      provider: "wingbits.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/components/MapPopup.ts"
        }
      ]
    },
    {
      host: "wits.worldbank.org",
      provider: "wits.worldbank.org",
      kind: "structured",
      observed: true,
      license: "UNCTAD TRAINS tariff data served through the World Bank WITS API; redistribution to paying API customers confirmed by the owner on 2026-10-10",
      attribution: "Credit UNCTAD TRAINS and World Bank WITS, and link to the WITS query behind each rate.",
      status: "reviewed",
      references: [
        {
          path: "api/mcp/skill-extension/generated.ts"
        },
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "server/worldmonitor/trade/v1/_tradestats-tariff.ts"
        },
        {
          path: "server/worldmonitor/trade/v1/get-bilateral-tariff.ts"
        }
      ]
    },
    {
      host: "workos.com",
      provider: "workos.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/oauth-authorization-server.ts"
        }
      ]
    },
    {
      host: "worldmonitor.app",
      provider: "World Monitor web app",
      kind: "structured",
      observed: true,
      license: "Excluded: World Monitor own web application",
      attribution: "Excluded from the external-provider count: first-party web origin.",
      status: "excluded",
      references: [
        {
          path: "api/_agent-metadata.ts"
        },
        {
          path: "api/a2a.ts"
        },
        {
          path: "api/ask.ts"
        },
        {
          path: "api/fwdstart.js"
        },
        {
          path: "api/mcp/skill-extension/generated.ts"
        },
        {
          path: "api/miit-news.js"
        },
        {
          path: "api/notification-suppressions.js"
        },
        {
          path: "api/oauth/authorize.js"
        },
        {
          path: "api/og-story.js"
        },
        {
          path: "api/opensky.js"
        },
        {
          path: "api/referral/me.ts"
        },
        {
          path: "api/reverse-geocode.js"
        },
        {
          path: "api/seed-contract-probe.ts"
        },
        {
          path: "api/story.js"
        },
        {
          path: "api/telegram-feed.js"
        },
        {
          path: "scripts/_upstash-rest.mjs"
        },
        {
          path: "scripts/build-agent-skills-index.mjs"
        },
        {
          path: "scripts/capture-mcp-fixture.mjs"
        },
        {
          path: "scripts/china-coverage-health.mjs"
        },
        {
          path: "scripts/china-macro/calendar.mjs"
        },
        {
          path: "scripts/cross-strait-activity/adapters.mjs"
        },
        {
          path: "scripts/cross-strait-activity/japan-x.mjs"
        },
        {
          path: "scripts/eval-classify-labels.mjs"
        },
        {
          path: "scripts/lib/brief-embedding.mjs"
        },
        {
          path: "scripts/lib/company-monitoring-classifier-client.mjs"
        },
        {
          path: "scripts/lib/digest-email-html.mjs"
        },
        {
          path: "scripts/lib/x-news-accounts.cjs"
        },
        {
          path: "scripts/mcp-live-smoke.mjs"
        },
        {
          path: "scripts/mcp-proxy-live-smoke.mjs"
        },
        {
          path: "scripts/measure-mobile-mainthread.mjs"
        },
        {
          path: "scripts/publish-mcp-registry.mjs"
        },
        {
          path: "scripts/seed-digest-notifications.mjs"
        },
        {
          path: "scripts/seed-five-factor-scorecard.mjs"
        },
        {
          path: "scripts/seed-hyperliquid-flow.mjs"
        },
        {
          path: "scripts/seed-infra.mjs"
        },
        {
          path: "scripts/seed-insights.mjs"
        },
        {
          path: "scripts/seed-military-maritime-news.mjs"
        },
        {
          path: "scripts/seed-service-statuses.mjs"
        },
        {
          path: "scripts/seed-wb-indicators.mjs"
        },
        {
          path: "scripts/shared/notify-fields.cjs"
        },
        {
          path: "scripts/shipping-webhook-worker.mjs"
        },
        {
          path: "scripts/validate-seed-migration.mjs"
        },
        {
          path: "server/_shared/brief-url.ts"
        },
        {
          path: "server/_shared/channel-oauth-state.ts"
        },
        {
          path: "server/_shared/intel-history-embed.ts"
        },
        {
          path: "server/_shared/notify-fields.ts"
        },
        {
          path: "server/gateway.ts"
        },
        {
          path: "server/worldmonitor/infrastructure/v1/reverse-geocode.ts"
        },
        {
          path: "src/bootstrap/web-vitals-utils.ts"
        },
        {
          path: "src/components/UnifiedSettings.ts"
        },
        {
          path: "src/config/web-origin.ts"
        },
        {
          path: "src/services/premium-fetch.ts"
        },
        {
          path: "src/services/runtime.ts"
        },
        {
          path: "src/settings-main.ts"
        }
      ]
    },
    {
      host: "worldmonitor.invalid",
      provider: "WorldMonitor test origin",
      kind: "structured",
      observed: true,
      license: "Excluded: test-only origin",
      attribution: "Excluded from the provider count: test-only URL.",
      status: "excluded",
      references: [
        {
          path: "api/_md-url-twin.ts"
        },
        {
          path: "src/shared/public-rpc-cache.ts"
        },
        {
          path: "src/utils/dom-utils.ts"
        }
      ]
    },
    {
      host: "worldmonitor.mintlify.dev",
      provider: "worldmonitor.mintlify.dev",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/docs-mcp.ts"
        },
        {
          path: "src/config/docs-locale-seo.ts"
        }
      ]
    },
    {
      host: "wublockchain.com",
      provider: "wublockchain.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit wublockchain.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.14ymedio.com",
      provider: "14ymedio",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit 14ymedio and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.972mag.com",
      provider: "+972 Magazine",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit +972 Magazine and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.a16z.news",
      provider: "www.a16z.news",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.a16z.news and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.aaii.com",
      provider: "www.aaii.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.aaii.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aaii-sentiment.mjs"
        },
        {
          path: "scripts/seed-fear-greed.mjs"
        }
      ]
    },
    {
      host: "www.aajtak.in",
      provider: "www.aajtak.in",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.aajtak.in and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.aaronsw.com",
      provider: "www.aaronsw.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.aaronsw.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.abc.net.au",
      provider: "www.abc.net.au",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.abc.net.au and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.africanews.com",
      provider: "www.africanews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.africanews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.afro.who.int",
      provider: "www.afro.who.int",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.afro.who.int and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "www.aftenposten.no",
      provider: "www.aftenposten.no",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.aftenposten.no and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.alarabiya.net",
      provider: "www.alarabiya.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.alarabiya.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.alberta.ca",
      provider: "Alberta Emergency Alert",
      kind: "structured",
      observed: true,
      license: "Alberta.ca terms of use. Open Government Licence - Alberta exists on the open.alberta.ca licence page but is not bound to the AEA Atom feed on a live dataset page (the alberta-emergency-alert.aspx page has no OGL statement).",
      attribution: "Alberta Emergency Alert, Government of Alberta. https://www.alberta.ca/alberta-emergency-alert.aspx",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/alberta-emergency-alert.mjs"
        },
        {
          path: "scripts/source-attribution.mjs"
        }
      ]
    },
    {
      host: "www.aljazeera.com",
      provider: "Al Jazeera",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.aljazeera.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.aljazeera.net",
      provider: "www.aljazeera.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.aljazeera.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.alphavantage.co",
      provider: "www.alphavantage.co",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.alphavantage.co and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_shared-av.mjs"
        },
        {
          path: "server/worldmonitor/market/v1/_quote-provider.ts"
        }
      ]
    },
    {
      host: "www.alwihdainfo.com",
      provider: "Alwihda Info",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Alwihda Info and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.amarujala.com",
      provider: "www.amarujala.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.amarujala.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.ansa.it",
      provider: "www.ansa.it",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.ansa.it and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.applytosupply.digitalmarketplace.service.gov.uk",
      provider: "www.applytosupply.digitalmarketplace.service.gov.uk",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/comparison-shortlist.mjs"
        }
      ]
    },
    {
      host: "www.asahi.com",
      provider: "www.asahi.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.asahi.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.atlanticcouncil.org",
      provider: "www.atlanticcouncil.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.atlanticcouncil.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.atv.hu",
      provider: "www.atv.hu",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.atv.hu and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.australianmining.com.au",
      provider: "www.australianmining.com.au",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.australianmining.com.au and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.aviationpros.com",
      provider: "www.aviationpros.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.aviationpros.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aviation-news.ts"
        }
      ]
    },
    {
      host: "www.aviationweek.com",
      provider: "www.aviationweek.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.aviationweek.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aviation-news.ts"
        }
      ]
    },
    {
      host: "www.bankofcanada.ca",
      provider: "Bank of Canada",
      kind: "structured",
      observed: true,
      license: "Bank of Canada Terms of Use \u2014 permission to freely use, copy, distribute and transmit website content with attribution (https://www.bankofcanada.ca/terms/)",
      attribution: "Bank of Canada Valet API; link to https://www.bankofcanada.ca/valet/ and the Terms of Use at https://www.bankofcanada.ca/terms/.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/boc-valet.mjs"
        },
        {
          path: "scripts/seed-yield-curve-ca.mjs"
        }
      ]
    },
    {
      host: "www.bankofengland.co.uk",
      provider: "www.bankofengland.co.uk",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.bankofengland.co.uk and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-yield-curve-gb.mjs"
        }
      ]
    },
    {
      host: "www.barchart.com",
      provider: "Barchart",
      kind: "structured",
      observed: true,
      license: "Barchart terms; redistribution requires review",
      attribution: "Barchart; link to the source quote or page.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-fear-greed.mjs"
        }
      ]
    },
    {
      host: "www.bbc.com",
      provider: "BBC",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.bbc.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.bgs.ac.uk",
      provider: "British Geological Survey World Mineral Statistics",
      kind: "structured",
      observed: true,
      license: "BGS mineral statistics terms; attribution required; redistribution restricted",
      attribution: "British Geological Survey (BGS) World Mineral Production; credit BGS and link to https://www.bgs.ac.uk/mineralsuk/statistics/world-mineral-statistics/.",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-supply-vulnerability.mjs"
        }
      ]
    },
    {
      host: "www.bild.de",
      provider: "www.bild.de",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.bild.de and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.bing.com",
      provider: "www.bing.com",
      kind: "structured",
      observed: false,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded"
    },
    {
      host: "www.brasilparalelo.com.br",
      provider: "www.brasilparalelo.com.br",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.brasilparalelo.com.br and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.businessinsider.com",
      provider: "Business Insider",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Business Insider and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.cac.gov.cn",
      provider: "www.cac.gov.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.cac.gov.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/china-policy/adapters.mjs"
        }
      ]
    },
    {
      host: "www.caracaschronicles.com",
      provider: "Caracas Chronicles",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Caracas Chronicles and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.carbonbrief.org",
      provider: "www.carbonbrief.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.carbonbrief.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-news.mjs"
        }
      ]
    },
    {
      host: "www.cbc.ca",
      provider: "www.cbc.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.cbc.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.cbinsights.com",
      provider: "www.cbinsights.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.cbinsights.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.cbp.gov",
      provider: "www.cbp.gov",
      kind: "structured",
      observed: true,
      license: "US government public-domain work unless otherwise noted. Copyright notice reviewed 2026-10-19 for the Nationwide Encounters CSV.",
      attribution: "Credit US Customs and Border Protection and link to the Nationwide Encounters source. Encounters are enforcement events, not unique people.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/border-route-sources.mjs"
        },
        {
          path: "server/worldmonitor/displacement/v1/cross-border-data.ts"
        }
      ]
    },
    {
      host: "www.cbr.ru",
      provider: "www.cbr.ru",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.cbr.ru and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-cbr-rates.mjs"
        }
      ]
    },
    {
      host: "www.cbsnews.com",
      provider: "www.cbsnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.cbsnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.cftc.gov",
      provider: "CFTC public notices",
      kind: "structured",
      observed: true,
      license: "U.S. government public data; CFTC terms apply",
      attribution: "U.S. Commodity Futures Trading Commission (CFTC); link to the original notice/feed.",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-regulatory-actions.mjs"
        }
      ]
    },
    {
      host: "www.channelnewsasia.com",
      provider: "www.channelnewsasia.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.channelnewsasia.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.channelstv.com",
      provider: "www.channelstv.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.channelstv.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.chinamoney.com.cn",
      provider: "www.chinamoney.com.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.chinamoney.com.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/china-macro/calendar.mjs"
        }
      ]
    },
    {
      host: "www.chosun.com",
      provider: "www.chosun.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.chosun.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.cidrap.umn.edu",
      provider: "www.cidrap.umn.edu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.cidrap.umn.edu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-disease-outbreaks.mjs"
        }
      ]
    },
    {
      host: "www.cisa.gov",
      provider: "www.cisa.gov",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.cisa.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.clarin.com",
      provider: "www.clarin.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.clarin.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.climatecentral.org",
      provider: "www.climatecentral.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.climatecentral.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-news.mjs"
        }
      ]
    },
    {
      host: "www.cloudflarestatus.com",
      provider: "www.cloudflarestatus.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit www.cloudflarestatus.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "www.cnbc.com",
      provider: "www.cnbc.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.cnbc.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/finance.ts"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.cnn.gr",
      provider: "www.cnn.gr",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.cnn.gr and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "www.coes.org.pe",
      provider: "www.coes.org.pe",
      kind: "structured",
      observed: true,
      license: "Unconfirmed",
      attribution: "Credit COES SINAC and link to https://www.coes.org.pe/Portal/portalinformacion/demanda.",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/regional-energy-feeds.mjs"
        },
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "www.coindesk.com",
      provider: "www.coindesk.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.coindesk.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/finance.ts"
        }
      ]
    },
    {
      host: "www.contractsfinder.service.gov.uk",
      provider: "www.contractsfinder.service.gov.uk",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.contractsfinder.service.gov.uk and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-global-tenders.mjs"
        }
      ]
    },
    {
      host: "www.corriere.it",
      provider: "www.corriere.it",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.corriere.it and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "www.crisisgroup.org",
      provider: "www.crisisgroup.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.crisisgroup.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.csis.org",
      provider: "www.csis.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.csis.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.dabangasudan.org",
      provider: "www.dabangasudan.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.dabangasudan.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.dailygood.org",
      provider: "www.dailygood.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.dailygood.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.dailysabah.com",
      provider: "www.dailysabah.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.dailysabah.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.darkreading.com",
      provider: "www.darkreading.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.darkreading.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.datos.gov.co",
      provider: "www.datos.gov.co",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.datos.gov.co and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_global-tender-feeds.mjs"
        }
      ]
    },
    {
      host: "www.dawn.com",
      provider: "www.dawn.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.dawn.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.defensenews.com",
      provider: "www.defensenews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.defensenews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.defenseone.com",
      provider: "www.defenseone.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.defenseone.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.digi24.ro",
      provider: "www.digi24.ro",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.digi24.ro and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.dn.se",
      provider: "www.dn.se",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.dn.se and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.dnevnik.bg",
      provider: "www.dnevnik.bg",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.dnevnik.bg and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.dockerstatus.com",
      provider: "www.dockerstatus.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit www.dockerstatus.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "www.dr.dk",
      provider: "www.dr.dk",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.dr.dk and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.earthquakescanada.nrcan.gc.ca",
      provider: "Earthquakes Canada (NRCan)",
      kind: "structured",
      observed: true,
      license: "Earthquakes Canada citation terms; live Atom redistribution not explicitly granted (historical catalogues on the Open Government Portal are OGL-Canada)",
      attribution: "Natural Resources Canada, Earthquakes Canada; link to https://www.earthquakescanada.nrcan.gc.ca/index-en.php?tpl_region=canada. Event-metadata citation: https://www.earthquakescanada.nrcan.gc.ca/cite-en.php",
      status: "terms-review",
      references: [
        {
          path: "scripts/seismology/nrcan-atom.mjs"
        }
      ]
    },
    {
      host: "www.ecb.europa.eu",
      provider: "www.ecb.europa.eu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.ecb.europa.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-economic-calendar.mjs"
        }
      ]
    },
    {
      host: "www.ecdc.europa.eu",
      provider: "www.ecdc.europa.eu",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.ecdc.europa.eu and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-disease-outbreaks.mjs"
        },
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "www.egyptindependent.com",
      provider: "Egypt Independent",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Egypt Independent and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.eia.gov",
      provider: "www.eia.gov",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.eia.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-oil-trade-series.mjs"
        },
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.eltiempo.com",
      provider: "www.eltiempo.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.eltiempo.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.eluniverso.com",
      provider: "www.eluniverso.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.eluniverso.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.engadget.com",
      provider: "www.engadget.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.engadget.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.epdk.gov.tr",
      provider: "www.epdk.gov.tr",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.epdk.gov.tr and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/_epdk-crude-imports.mjs"
        }
      ]
    },
    {
      host: "www.eskom.co.za",
      provider: "www.eskom.co.za",
      kind: "structured",
      observed: true,
      license: "Site terms apply; open data licence unconfirmed",
      attribution: "Credit Eskom data portal and link to https://www.eskom.co.za/dataportal/.",
      status: "terms-review",
      references: [
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "www.ethiopia-insight.com",
      provider: "www.ethiopia-insight.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.ethiopia-insight.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.eu-startups.com",
      provider: "www.eu-startups.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.eu-startups.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.euronews.com",
      provider: "www.euronews.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.euronews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/main.ts"
        }
      ]
    },
    {
      host: "www.facebook.com",
      provider: "www.facebook.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "src/services/story-share.ts"
        }
      ]
    },
    {
      host: "www.factal.com",
      provider: "www.factal.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/comparison-shortlist.mjs"
        }
      ]
    },
    {
      host: "www.fao.org",
      provider: "www.fao.org",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.fao.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-fao-food-price-index.mjs"
        },
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.fatf-gafi.org",
      provider: "Financial Action Task Force (FATF)",
      kind: "structured",
      observed: true,
      license: "FATF website and publication terms",
      attribution: "Financial Action Task Force (FATF); link to the original publication.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-fatf-listing.mjs"
        }
      ]
    },
    {
      host: "www.federalreserve.gov",
      provider: "www.federalreserve.gov",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.federalreserve.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-economic-calendar.mjs"
        },
        {
          path: "scripts/seed-regulatory-actions.mjs"
        },
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/finance.ts"
        }
      ]
    },
    {
      host: "www.flightglobal.com",
      provider: "www.flightglobal.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.flightglobal.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-aviation.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/list-aviation-news.ts"
        }
      ]
    },
    {
      host: "www.foreignaffairs.com",
      provider: "www.foreignaffairs.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.foreignaffairs.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.fpri.org",
      provider: "www.fpri.org",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.fpri.org and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "www.france24.com",
      provider: "www.france24.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.france24.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.frontex.europa.eu",
      provider: "www.frontex.europa.eu",
      kind: "structured",
      observed: true,
      license: "Used with permission; repository owner confirmed reuse permission on 2026-10-20.",
      attribution: "Credit Frontex and link to https://www.frontex.europa.eu/what-we-do/monitoring-and-risk-analysis/migratory-map/. Counts are detections, not unique people. No endorsement implied.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/border-route-sources.mjs"
        },
        {
          path: "server/worldmonitor/displacement/v1/cross-border-data.ts"
        }
      ]
    },
    {
      host: "www.ft.com",
      provider: "www.ft.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.ft.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.fwdstart.me",
      provider: "www.fwdstart.me",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.fwdstart.me and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/fwdstart.js"
        }
      ]
    },
    {
      host: "www.g4media.ro",
      provider: "www.g4media.ro",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.g4media.ro and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.gdacs.org",
      provider: "www.gdacs.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.gdacs.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-natural-events.mjs"
        }
      ]
    },
    {
      host: "www.gets.govt.nz",
      provider: "www.gets.govt.nz",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.gets.govt.nz and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-global-tenders.mjs"
        }
      ]
    },
    {
      host: "www.gitex.com",
      provider: "www.gitex.com",
      kind: "structured",
      observed: false,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.gitex.com and link to the original upstream API/dataset.",
      status: "excluded"
    },
    {
      host: "www.githubstatus.com",
      provider: "www.githubstatus.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit www.githubstatus.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "www.globenewswire.com",
      provider: "GlobeNewswire",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit GlobeNewswire and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.goldseek.com",
      provider: "www.goldseek.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.goldseek.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.good.is",
      provider: "www.good.is",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.good.is and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.goodgoodgood.co",
      provider: "www.goodgoodgood.co",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.goodgoodgood.co and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.goodnewsnetwork.org",
      provider: "www.goodnewsnetwork.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.goodnewsnetwork.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.google.com",
      provider: "www.google.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.google.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "src/components/AviationCommandBar.ts"
        },
        {
          path: "src/components/MapPopup.ts"
        }
      ]
    },
    {
      host: "www.googleapis.com",
      provider: "www.googleapis.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/seo-gsc-collect.mjs"
        }
      ]
    },
    {
      host: "www.gov.br",
      provider: "www.gov.br",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.gov.br and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-fuel-prices.mjs"
        },
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "www.gov.uk",
      provider: "www.gov.uk",
      kind: "feed+structured",
      observed: true,
      license: "GOV.UK Open Government Licence v3.0 for Home Office small-boat arrival statistics; other publishers on this host retain their source terms.",
      attribution: "Credit the issuing department and original dataset. Home Office arrivals: Contains public sector information licensed under the Open Government Licence v3.0.",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/border-route-sources.mjs"
        },
        {
          path: "scripts/seed-fuel-prices.mjs"
        },
        {
          path: "scripts/seed-security-advisories.mjs"
        },
        {
          path: "server/worldmonitor/displacement/v1/cross-border-data.ts"
        },
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.haitilibre.com",
      provider: "HaitiLibre English",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit HaitiLibre English and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.handelsblatt.com",
      provider: "Handelsblatt",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Handelsblatt and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.handybulk.com",
      provider: "www.handybulk.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.handybulk.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-supply-chain-trade.mjs"
        }
      ]
    },
    {
      host: "www.hotnews.ro",
      provider: "www.hotnews.ro",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.hotnews.ro and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.hurriyet.com.tr",
      provider: "www.hurriyet.com.tr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.hurriyet.com.tr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.iaea.org",
      provider: "www.iaea.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.iaea.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.iea.org",
      provider: "www.iea.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.iea.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-energy-intelligence.mjs"
        },
        {
          path: "src/components/EnergyCrisisPanel.ts"
        }
      ]
    },
    {
      host: "www.iefimerida.gr",
      provider: "www.iefimerida.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.iefimerida.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.ifswf.org",
      provider: "International Forum of Sovereign Wealth Funds",
      kind: "structured",
      observed: true,
      license: "Provider terms; attribution and redistribution require review",
      attribution: "International Forum of Sovereign Wealth Funds (IFSWF); link to the source.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-sovereign-wealth.mjs"
        }
      ]
    },
    {
      host: "www.in.gr",
      provider: "www.in.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.in.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.index.hr",
      provider: "www.index.hr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.index.hr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.infobae.com",
      provider: "www.infobae.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.infobae.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.interfax.ru",
      provider: "Interfax",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Interfax and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.international.gc.ca",
      provider: "Global Affairs Canada (SEMA consolidated sanctions)",
      kind: "structured",
      observed: true,
      license: "Government of Canada website terms; no explicit redistribution licence on the SEMA XML. Canada.ca terms restrict commercial reproduction unless otherwise specified. The Open Government Licence page on this host covers international-assistance open data sets, not this sanctions list.",
      attribution: "Global Affairs Canada, Consolidated Canadian Autonomous Sanctions List; link to https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/consolidated-consolide.aspx?lang=eng",
      status: "terms-review",
      references: [
        {
          path: "scripts/_sema-sanctions.mjs"
        }
      ]
    },
    {
      host: "www.ipolitics.ca",
      provider: "www.ipolitics.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.ipolitics.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.irrawaddy.com",
      provider: "www.irrawaddy.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.irrawaddy.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.jeuneafrique.com",
      provider: "www.jeuneafrique.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.jeuneafrique.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.jodidata.org",
      provider: "www.jodidata.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.jodidata.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-jodi-gas.mjs"
        },
        {
          path: "scripts/seed-jodi-oil.mjs"
        },
        {
          path: "scripts/seed-oil-trade-series.mjs"
        }
      ]
    },
    {
      host: "www.jpost.com",
      provider: "www.jpost.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.jpost.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.jutarnji.hr",
      provider: "www.jutarnji.hr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.jutarnji.hr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.lapresse.ca",
      provider: "www.lapresse.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.lapresse.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.lasillavacia.com",
      provider: "www.lasillavacia.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.lasillavacia.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.ledevoir.com",
      provider: "www.ledevoir.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.ledevoir.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.lemonde.fr",
      provider: "www.lemonde.fr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.lemonde.fr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.lennysnewsletter.com",
      provider: "www.lennysnewsletter.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.lennysnewsletter.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.liberal.gr",
      provider: "www.liberal.gr",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.liberal.gr and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "www.lighthousereports.com",
      provider: "www.lighthousereports.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.lighthousereports.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.linkedin.com",
      provider: "www.linkedin.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/comparison-shortlist.mjs"
        },
        {
          path: "server/worldmonitor/leads/v1/register-interest.ts"
        },
        {
          path: "src/services/story-share.ts"
        }
      ]
    },
    {
      host: "www.livescience.com",
      provider: "www.livescience.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.livescience.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.lrt.lt",
      provider: "www.lrt.lt",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.lrt.lt and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.manitoba511.ca",
      provider: "Manitoba 511",
      kind: "structured",
      observed: true,
      license: "Contains information from the Government of Manitoba, licensed under the OpenMB Information and Data Use License (Manitoba.ca/OpenMB). Manitoba 511 developer copy permits creating traffic apps; no separate developer access agreement is published.",
      attribution: "Manitoba 511 (Government of Manitoba). Contains information from the Government of Manitoba, licensed under the OpenMB Information and Data Use License. https://www.manitoba511.ca/",
      status: "terms-review",
      references: [
        {
          path: "scripts/lib/provincial-511.mjs"
        }
      ]
    },
    {
      host: "www.mbie.govt.nz",
      provider: "www.mbie.govt.nz",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.mbie.govt.nz and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-fuel-prices.mjs"
        }
      ]
    },
    {
      host: "www.migracion.gob.pa",
      provider: "www.migracion.gob.pa",
      kind: "structured",
      observed: true,
      license: "Used with permission; repository owner confirmed reuse permission on 2026-10-20.",
      attribution: "Servicio Nacional de Migraci\xF3n, Panam\xE1. https://www.migracion.gob.pa/estadisticas/. Figures are preliminary and subject to revision.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/border-route-sources.mjs"
        },
        {
          path: "server/worldmonitor/displacement/v1/cross-border-data.ts"
        }
      ]
    },
    {
      host: "www.miit.gov.cn",
      provider: "www.miit.gov.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.miit.gov.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/miit-news.js"
        },
        {
          path: "scripts/china-policy/adapters.mjs"
        }
      ]
    },
    {
      host: "www.militarytimes.com",
      provider: "www.militarytimes.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.militarytimes.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.mining-technology.com",
      provider: "www.mining-technology.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.mining-technology.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.mining.com",
      provider: "www.mining.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.mining.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.mnd.gov.tw",
      provider: "www.mnd.gov.tw",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.mnd.gov.tw and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/cross-strait-activity/adapters.mjs"
        },
        {
          path: "src/components/cross-strait-activity-summary.ts"
        }
      ]
    },
    {
      host: "www.mod.go.jp",
      provider: "www.mod.go.jp",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.mod.go.jp and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/cross-strait-activity/adapters.mjs"
        },
        {
          path: "src/components/cross-strait-activity-summary.ts"
        }
      ]
    },
    {
      host: "www.mof.go.jp",
      provider: "www.mof.go.jp",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.mof.go.jp and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-yield-curve-jp.mjs"
        }
      ]
    },
    {
      host: "www.myjoyonline.com",
      provider: "www.myjoyonline.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.myjoyonline.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.naftemporiki.gr",
      provider: "www.naftemporiki.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.naftemporiki.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.naharnet.com",
      provider: "Naharnet Lebanon",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Naharnet Lebanon and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.nationalarchives.gov.uk",
      provider: "www.nationalarchives.gov.uk",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/lib/border-route-sources.mjs"
        },
        {
          path: "server/worldmonitor/displacement/v1/cross-border-data.ts"
        },
        {
          path: "src/components/UkmtoIncidentsPanel.ts"
        }
      ]
    },
    {
      host: "www.nature.com",
      provider: "www.nature.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.nature.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.ncei.noaa.gov",
      provider: "www.ncei.noaa.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.ncei.noaa.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-ocean-ice.mjs"
        }
      ]
    },
    {
      host: "www.netlifystatus.com",
      provider: "www.netlifystatus.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit www.netlifystatus.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "www.newscientist.com",
      provider: "www.newscientist.com",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.newscientist.com and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "www.newyorkfed.org",
      provider: "www.newyorkfed.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.newyorkfed.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "www.nfx.com",
      provider: "www.nfx.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.nfx.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.niggrid.org",
      provider: "www.niggrid.org",
      kind: "structured",
      observed: true,
      license: "All rights reserved",
      attribution: "Credit Nigeria NISO and link to https://www.niggrid.org/.",
      status: "terms-review",
      references: [
        {
          path: "scripts/shared/regional-energy-feeds.json"
        }
      ]
    },
    {
      host: "www.northernminer.com",
      provider: "www.northernminer.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.northernminer.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.notion-status.com",
      provider: "www.notion-status.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit www.notion-status.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "www.nrc.nl",
      provider: "www.nrc.nl",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.nrc.nl and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.nrk.no",
      provider: "www.nrk.no",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.nrk.no and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.occrp.org",
      provider: "www.occrp.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.occrp.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.omanobserver.om",
      provider: "www.omanobserver.om",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.omanobserver.om and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.opec.org",
      provider: "www.opec.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.opec.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-energy-intelligence.mjs"
        }
      ]
    },
    {
      host: "www.optimistdaily.com",
      provider: "www.optimistdaily.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.optimistdaily.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.oref.org.il",
      provider: "www.oref.org.il",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.oref.org.il and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "www.oryxspioenkop.com",
      provider: "www.oryxspioenkop.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.oryxspioenkop.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.pbc.gov.cn",
      provider: "www.pbc.gov.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.pbc.gov.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/china-macro/source-contracts.mjs"
        }
      ]
    },
    {
      host: "www.pbs.org",
      provider: "www.pbs.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.pbs.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.pizzint.watch",
      provider: "www.pizzint.watch",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.pizzint.watch and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-conflict-intel.mjs"
        }
      ]
    },
    {
      host: "www.polsatnews.pl",
      provider: "www.polsatnews.pl",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.polsatnews.pl and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.positive.news",
      provider: "www.positive.news",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.positive.news and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.premiumtimesng.com",
      provider: "www.premiumtimesng.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.premiumtimesng.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.primicias.ec",
      provider: "www.primicias.ec",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.primicias.ec and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.producthunt.com",
      provider: "www.producthunt.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.producthunt.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.radiondekeluka.org",
      provider: "Radio Ndeke Luka",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Radio Ndeke Luka and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.radiookapi.net",
      provider: "www.radiookapi.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.radiookapi.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.radiotamazuj.org",
      provider: "www.radiotamazuj.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.radiotamazuj.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.rand.org",
      provider: "www.rand.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.rand.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.ransomware.live",
      provider: "www.ransomware.live",
      kind: "structured",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.ransomware.live and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "www.rappler.com",
      provider: "www.rappler.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.rappler.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.rba.gov.au",
      provider: "www.rba.gov.au",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.rba.gov.au and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-yield-curve-au.mjs"
        }
      ]
    },
    {
      host: "www.reddit.com",
      provider: "www.reddit.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.reddit.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        }
      ]
    },
    {
      host: "www.replicatestatus.com",
      provider: "www.replicatestatus.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit www.replicatestatus.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "www.repubblica.it",
      provider: "www.repubblica.it",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.repubblica.it and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.rfi.fr",
      provider: "www.rfi.fr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.rfi.fr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.rigzone.com",
      provider: "www.rigzone.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.rigzone.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.rp.pl",
      provider: "www.rp.pl",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.rp.pl and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.rt.com",
      provider: "www.rt.com",
      kind: "feed",
      observed: false,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.rt.com and link to the original feed publisher.",
      status: "excluded"
    },
    {
      host: "www.saastr.com",
      provider: "www.saastr.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.saastr.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.safe.gov.cn",
      provider: "www.safe.gov.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.safe.gov.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/china-macro/source-contracts.mjs"
        }
      ]
    },
    {
      host: "www.samr.gov.cn",
      provider: "www.samr.gov.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.samr.gov.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/china-policy/adapters.mjs"
        }
      ]
    },
    {
      host: "www.schneier.com",
      provider: "www.schneier.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.schneier.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.sciencebase.gov",
      provider: "USGS ScienceBase (Mineral Commodity Summaries)",
      kind: "structured",
      observed: true,
      license: "U.S. government public-domain mineral statistics (USGS MCS data release)",
      attribution: "U.S. Geological Survey Mineral Commodity Summaries; link to the ScienceBase data release (https://doi.org/10.5066/P1WKQ63T).",
      status: "reviewed",
      references: [
        {
          path: "scripts/seed-mineral-production.mjs"
        },
        {
          path: "scripts/seed-supply-vulnerability.mjs"
        }
      ]
    },
    {
      host: "www.sciencedaily.com",
      provider: "www.sciencedaily.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.sciencedaily.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.scmp.com",
      provider: "www.scmp.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.scmp.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.sec.gov",
      provider: "SEC",
      kind: "feed+structured",
      observed: true,
      license: "U.S. government public data; SEC terms apply",
      attribution: "U.S. Securities and Exchange Commission (SEC).",
      status: "reviewed",
      references: [
        {
          path: "scripts/openapi-inject-examples.mjs"
        },
        {
          path: "scripts/seed-regulatory-actions.mjs"
        },
        {
          path: "scripts/seed-sec-8k-stream.mjs"
        },
        {
          path: "scripts/seed-sec-cik-map.mjs"
        },
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/finance.ts"
        }
      ]
    },
    {
      host: "www.semianalysis.com",
      provider: "www.semianalysis.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.semianalysis.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.sequoiacap.com",
      provider: "www.sequoiacap.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.sequoiacap.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.seznamzpravy.cz",
      provider: "www.seznamzpravy.cz",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.seznamzpravy.cz and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.shareable.net",
      provider: "www.shareable.net",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.shareable.net and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.silverseek.com",
      provider: "www.silverseek.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.silverseek.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.smartraveller.gov.au",
      provider: "www.smartraveller.gov.au",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.smartraveller.gov.au and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "www.spdrgoldshares.com",
      provider: "www.spdrgoldshares.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.spdrgoldshares.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-gold-etf-flows.mjs"
        }
      ]
    },
    {
      host: "www.spiegel.de",
      provider: "www.spiegel.de",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.spiegel.de and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.statcan.gc.ca",
      provider: "www.statcan.gc.ca",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.statcan.gc.ca and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/resilience/v1/_indicator-source-policy.ts"
        }
      ]
    },
    {
      host: "www.stats.gov.cn",
      provider: "www.stats.gov.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.stats.gov.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/china-macro/calendar.mjs"
        },
        {
          path: "scripts/china-macro/source-contracts.mjs"
        }
      ]
    },
    {
      host: "www.stimson.org",
      provider: "www.stimson.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.stimson.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.studiotamani.org",
      provider: "Studio Tamani",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Studio Tamani and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.submarinecablemap.com",
      provider: "TeleGeography Submarine Cable Map",
      kind: "structured",
      observed: true,
      license: "TeleGeography proprietary/provider terms",
      attribution: "TeleGeography Submarine Cable Map; link to the source map.",
      status: "terms-review",
      references: [
        {
          path: "scripts/check-submarine-cable-gaps.mjs"
        },
        {
          path: "scripts/seed-submarine-cables.mjs"
        }
      ]
    },
    {
      host: "www.sunnyskyz.com",
      provider: "www.sunnyskyz.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.sunnyskyz.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.svd.se",
      provider: "www.svd.se",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.svd.se and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.svt.se",
      provider: "www.svt.se",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.svt.se and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.swfinstitute.org",
      provider: "SWF Institute",
      kind: "structured",
      observed: true,
      license: "Provider terms; attribution and redistribution require review",
      attribution: "SWF Institute; link to the source publication.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-sovereign-wealth.mjs"
        }
      ]
    },
    {
      host: "www.szse.cn",
      provider: "www.szse.cn",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.szse.cn and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/china-corporate-disclosures/adapters.mjs"
        },
        {
          path: "scripts/china-stock-connect/adapters.mjs"
        }
      ]
    },
    {
      host: "www.tagesschau.de",
      provider: "www.tagesschau.de",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.tagesschau.de and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.tanea.gr",
      provider: "www.tanea.gr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.tanea.gr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.techinasia.com",
      provider: "www.techinasia.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.techinasia.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.techmeme.com",
      provider: "www.techmeme.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.techmeme.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/ais-relay.cjs"
        },
        {
          path: "scripts/seed-research.mjs"
        },
        {
          path: "server/worldmonitor/research/v1/list-tech-events.ts"
        },
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.technologyreview.com",
      provider: "www.technologyreview.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.technologyreview.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.techstars.com",
      provider: "www.techstars.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.techstars.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.telegraph.co.uk",
      provider: "The Telegraph",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit The Telegraph and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.tenders.gov.au",
      provider: "AusTender",
      kind: "structured",
      observed: true,
      license: "Australian Government data and feed terms",
      attribution: "Australian Government AusTender; link to the original notice/feed.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-global-tenders.mjs"
        }
      ]
    },
    {
      host: "www.theglobeandmail.com",
      provider: "www.theglobeandmail.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.theglobeandmail.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.theguardian.com",
      provider: "www.theguardian.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.theguardian.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-news.mjs"
        },
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.thehindu.com",
      provider: "www.thehindu.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.thehindu.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.themoscowtimes.com",
      provider: "www.themoscowtimes.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.themoscowtimes.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.thenationalnews.com",
      provider: "www.thenationalnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.thenationalnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.thereporterethiopia.com",
      provider: "www.thereporterethiopia.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.thereporterethiopia.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.thestar.com",
      provider: "www.thestar.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.thestar.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.theverge.com",
      provider: "www.theverge.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.theverge.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.thisdaylive.com",
      provider: "www.thisdaylive.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.thisdaylive.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.token2049.com",
      provider: "www.token2049.com",
      kind: "structured",
      observed: false,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.token2049.com and link to the original upstream API/dataset.",
      status: "excluded"
    },
    {
      host: "www.tomshardware.com",
      provider: "www.tomshardware.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.tomshardware.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.toronto.ca",
      provider: "Toronto Fire Services",
      kind: "structured",
      observed: true,
      license: "Direct permission: World Monitor's owner confirmed on 2026-08-21 that World Monitor holds redistribution and public-display rights for the Toronto Fire Services live CAD XML. This does not claim that the feed is licensed under the City of Toronto Open Government Licence: no data-bound CKAN package was found for toronto-fire-active-incidents or livecad.xml. City of Toronto copyright and the source-specific permission still apply. Not the historical fire-incidents CKAN datasets.",
      attribution: "Toronto Fire Services, Active Incidents (CAD). https://www.toronto.ca/community-people/public-safety-alerts/alerts-notifications/toronto-fire-active-incidents/",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/toronto-official-cad.mjs"
        }
      ]
    },
    {
      host: "www.tps.ca",
      provider: "Toronto Police Service Open Data",
      kind: "structured",
      observed: true,
      license: 'Custom licence based on the Open Government Licence - Ontario. The Major Crime Indicators FeatureServer (serviceItemId 0a239a5563a344a3bbf8452504ed8d68) requires: "Contains information licensed under the Open Government Licence - Ontario." Credit Toronto Police Service without crests, logos, flags, or official marks. No TPS endorsement. Locations are deliberately offset; do not present them as precise addresses. Do not merge or link the data with other databases for the purpose of identifying a person, business, or organization. Do not fill privacy exclusions from GTA Update, news, radio, or another source. Evidence: https://www.tps.ca/data-maps/open-data/ and the item-level FeatureServer description on https://data.tps.ca/.',
      attribution: "Contains information licensed under the Open Government Licence - Ontario. Toronto Police Service Open Data (https://www.tps.ca/data-maps/open-data/, https://data.tps.ca/). Coordinates are approximate offset intersection nodes. No TPS endorsement.",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/tps-open-data.mjs"
        }
      ]
    },
    {
      host: "www.tvanouvelles.ca",
      provider: "www.tvanouvelles.ca",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.tvanouvelles.ca and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.twz.com",
      provider: "www.twz.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.twz.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.unep.org",
      provider: "www.unep.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.unep.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-climate-news.mjs"
        }
      ]
    },
    {
      host: "www.unognewsroom.org",
      provider: "www.unognewsroom.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.unognewsroom.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-disease-outbreaks.mjs"
        }
      ]
    },
    {
      host: "www.upworthy.com",
      provider: "www.upworthy.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.upworthy.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.vanguardngr.com",
      provider: "www.vanguardngr.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.vanguardngr.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.vendr.com",
      provider: "www.vendr.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/comparison-shortlist.mjs"
        }
      ]
    },
    {
      host: "www.vercel-status.com",
      provider: "www.vercel-status.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit www.vercel-status.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "www.visionofhumanity.org",
      provider: "Vision of Humanity / Global Peace Index",
      kind: "structured",
      observed: true,
      license: "Vision of Humanity terms; attribution required",
      attribution: "Institute for Economics & Peace, Global Peace Index / Vision of Humanity.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-resilience-static.mjs"
        }
      ]
    },
    {
      host: "www.w3.org",
      provider: "W3C schema reference",
      kind: "structured",
      observed: true,
      license: "Excluded: schema/standards reference",
      attribution: "Excluded from the provider count: standards reference, not an ingested source.",
      status: "excluded",
      references: [
        {
          path: "api/fwdstart.js"
        },
        {
          path: "src/embed/panels/fear-greed.ts"
        }
      ]
    },
    {
      host: "www.war.gov",
      provider: "www.war.gov",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.war.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.weather.gov.hk",
      provider: "www.weather.gov.hk",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.weather.gov.hk and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/natural/western-pacific-cyclones.mjs"
        }
      ]
    },
    {
      host: "www.welt.de",
      provider: "Welt",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Welt and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.whitehouse.gov",
      provider: "www.whitehouse.gov",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.whitehouse.gov and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.who.int",
      provider: "www.who.int",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.who.int and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-disease-outbreaks.mjs"
        },
        {
          path: "scripts/seed-security-advisories.mjs"
        },
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.windy.com",
      provider: "www.windy.com",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.windy.com and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "api/mcp/registry/webcam-tools.ts"
        },
        {
          path: "api/mcp/skill-extension/generated.ts"
        },
        {
          path: "server/worldmonitor/webcam/v1/get-webcam-image.ts"
        },
        {
          path: "src/services/webcams/index.ts"
        }
      ]
    },
    {
      host: "www.winnipegfreepress.com",
      provider: "www.winnipegfreepress.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.winnipegfreepress.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.wired.com",
      provider: "Wired",
      kind: "feed",
      observed: true,
      license: "Licensed publisher content; redistribution governed by the World Monitor agreement",
      attribution: "Credit Wired and link to the original item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.worldbank.org",
      provider: "www.worldbank.org",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit www.worldbank.org and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/resilience/v1/_indicator-source-policy.ts"
        }
      ]
    },
    {
      host: "www.worldmonitor.app",
      provider: "World Monitor web app",
      kind: "structured",
      observed: true,
      license: "Excluded: World Monitor own web application",
      attribution: "Excluded from the external-provider count: first-party web origin.",
      status: "excluded",
      references: [
        {
          path: "api/_cors.js"
        },
        {
          path: "api/a2a.ts"
        },
        {
          path: "api/ask.ts"
        },
        {
          path: "api/customer-portal.ts"
        },
        {
          path: "api/mcp/skill-extension/generated.ts"
        },
        {
          path: "api/mcp/ui/news-dashboard-app.ts"
        },
        {
          path: "api/not-found.ts"
        },
        {
          path: "api/story.js"
        },
        {
          path: "scripts/build-accuracy-page.mjs"
        },
        {
          path: "scripts/build-agent-skills-index.mjs"
        },
        {
          path: "scripts/build-ai-search.mjs"
        },
        {
          path: "scripts/build-crawlable-corpus.mjs"
        },
        {
          path: "scripts/build-openapi-json.mjs"
        },
        {
          path: "scripts/build-research-reports.mjs"
        },
        {
          path: "scripts/build-sitemap.mjs"
        },
        {
          path: "scripts/build-un-m49-regions.mjs"
        },
        {
          path: "scripts/build-use-cases.mjs"
        },
        {
          path: "scripts/capture-resilience-energy-v2-acceptance.mjs"
        },
        {
          path: "scripts/check-live-video-sources.mjs"
        },
        {
          path: "scripts/comparison-shortlist.mjs"
        },
        {
          path: "scripts/discover-content-corpus-pages.mjs"
        },
        {
          path: "scripts/freeze-crawlable-live-pulse.mjs"
        },
        {
          path: "scripts/freeze-resilience-ranking.mjs"
        },
        {
          path: "scripts/generate-sandbox-fixtures.mjs"
        },
        {
          path: "scripts/github-stars-snapshot.mjs"
        },
        {
          path: "scripts/lib/email-unsubscribe.cjs"
        },
        {
          path: "scripts/lib/internal-links.mjs"
        },
        {
          path: "scripts/live-pages/common.mjs"
        },
        {
          path: "scripts/mcp-proxy-live-smoke.mjs"
        },
        {
          path: "scripts/measure-composited-layers.mjs"
        },
        {
          path: "scripts/measure-dashboard-render-axis.mjs"
        },
        {
          path: "scripts/measure-desktop-mainthread.mjs"
        },
        {
          path: "scripts/notification-relay.cjs"
        },
        {
          path: "scripts/seed-no2-activity.mjs"
        },
        {
          path: "scripts/seo-indexnow-submit.mjs"
        },
        {
          path: "scripts/syndication-candidates.mjs"
        },
        {
          path: "scripts/verify-agent-readiness.mjs"
        },
        {
          path: "scripts/verify-sitemaps.mjs"
        },
        {
          path: "server/_shared/deprecation-policy.ts"
        },
        {
          path: "server/worldmonitor/intelligence/v1/_country-brief-evidence.ts"
        },
        {
          path: "src/app/panel-layout.ts"
        },
        {
          path: "src/components/CountryBriefController.ts"
        },
        {
          path: "src/components/CountryDeepDivePanel.ts"
        },
        {
          path: "src/components/RuntimeConfigPanel.ts"
        },
        {
          path: "src/config/docs-locale-seo.ts"
        },
        {
          path: "src/config/schema-graph-ids.ts"
        },
        {
          path: "src/config/variant-meta.ts"
        },
        {
          path: "src/embed/embed-url.ts"
        },
        {
          path: "src/plugin-country-main.ts"
        },
        {
          path: "src/services/country-brief-host-transport.ts"
        },
        {
          path: "src/services/country-brief-source.ts"
        }
      ]
    },
    {
      host: "www.ycombinator.com",
      provider: "www.ycombinator.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.ycombinator.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.yesmagazine.org",
      provider: "www.yesmagazine.org",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.yesmagazine.org and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.ynetnews.com",
      provider: "www.ynetnews.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.ynetnews.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.yonhapnewstv.co.kr",
      provider: "www.yonhapnewstv.co.kr",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.yonhapnewstv.co.kr and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.youtube.com",
      provider: "www.youtube.com",
      kind: "feed+structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "api/youtube/embed.js"
        },
        {
          path: "api/youtube/live.js"
        },
        {
          path: "scripts/check-live-video-sources.mjs"
        },
        {
          path: "scripts/lib/live-video-channel-live.mjs"
        },
        {
          path: "server/worldmonitor/aviation/v1/get-youtube-live-stream-info.ts"
        },
        {
          path: "src/config/live-video-sources.ts"
        },
        {
          path: "src/services/live-video/session.ts"
        }
      ]
    },
    {
      host: "www.zdg.md",
      provider: "www.zdg.md",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.zdg.md and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "www.zdnet.com",
      provider: "www.zdnet.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit www.zdnet.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "www.zoomstatus.com",
      provider: "www.zoomstatus.com",
      kind: "operational-status",
      observed: true,
      license: "Provider terms for this service-status endpoint; verify before redistribution",
      attribution: "Credit www.zoomstatus.com and link to the original service-status endpoint.",
      status: "terms-review",
      references: [
        {
          path: "server/worldmonitor/infrastructure/v1/list-service-statuses.ts"
        }
      ]
    },
    {
      host: "www150.statcan.gc.ca",
      provider: "Statistics Canada",
      kind: "structured",
      observed: true,
      license: "Statistics Canada Open Licence (Open Government Licence \u2014 Canada); use, reproduce, publish, freely distribute or sell with attribution (https://www.statcan.gc.ca/en/terms-conditions/open-licence)",
      attribution: "Statistics Canada. Web Data Service. https://www.statcan.gc.ca/en/developers/wds/user-guide",
      status: "reviewed",
      references: [
        {
          path: "scripts/lib/statcan-wds.mjs"
        },
        {
          path: "server/worldmonitor/resilience/v1/_canada-national-overlay.ts"
        },
        {
          path: "server/worldmonitor/resilience/v1/_indicator-source-policy.ts"
        }
      ]
    },
    {
      host: "wwwnc.cdc.gov",
      provider: "wwwnc.cdc.gov",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit wwwnc.cdc.gov and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/seed-security-advisories.mjs"
        }
      ]
    },
    {
      host: "wyborcza.pl",
      provider: "Gazeta Wyborcza",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Gazeta Wyborcza and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "x.com",
      provider: "x.com",
      kind: "structured",
      observed: true,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded",
      references: [
        {
          path: "scripts/comparison-shortlist.mjs"
        },
        {
          path: "scripts/cross-strait-activity/japan-x.mjs"
        },
        {
          path: "server/worldmonitor/leads/v1/register-interest.ts"
        }
      ]
    },
    {
      host: "xinhuanet.com",
      provider: "xinhuanet.com",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit xinhuanet.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "yandex.com",
      provider: "yandex.com",
      kind: "structured",
      observed: false,
      license: "Excluded: first-party, control-plane, UI, or rendering transport",
      attribution: "Excluded from the external-provider count: not an ingested upstream dataset.",
      status: "excluded"
    },
    {
      host: "yemenonline.info",
      provider: "Yemen Online",
      kind: "feed",
      observed: true,
      license: "Publisher-provided feed or Google News link metadata; ingest is limited to headlines, summaries, timestamps, publisher credit, and link-out",
      attribution: "Credit Yemen Online and link to the original publisher item.",
      status: "reviewed",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "yle.fi",
      provider: "yle.fi",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit yle.fi and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "your-app.convex.site",
      provider: "your-app.convex.site",
      kind: "structured",
      observed: true,
      license: "Provider terms for this upstream API/dataset; verify before redistribution",
      attribution: "Credit your-app.convex.site and link to the original upstream API/dataset.",
      status: "terms-review",
      references: [
        {
          path: "scripts/import-bounced-emails.mjs"
        }
      ]
    },
    {
      host: "yourstory.com",
      provider: "yourstory.com",
      kind: "feed+structured",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit yourstory.com and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        },
        {
          path: "src/config/variants/tech.ts"
        }
      ]
    },
    {
      host: "zdf-hls-19.akamaized.net",
      provider: "zdf-hls-19.akamaized.net",
      kind: "feed",
      observed: true,
      license: "Excluded: live-video playback transport; channel/provider terms apply separately",
      attribution: "Excluded from the external-provider count: presentation-only HLS stream, not an ingested dataset.",
      status: "excluded",
      references: [
        {
          path: "src/config/live-video-sources.ts"
        }
      ]
    },
    {
      host: "zerkalo.io",
      provider: "zerkalo.io",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit zerkalo.io and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    },
    {
      host: "zn.ua",
      provider: "zn.ua",
      kind: "feed",
      observed: true,
      license: "Provider terms for this feed publisher; verify before redistribution",
      attribution: "Credit zn.ua and link to the original feed publisher.",
      status: "terms-review",
      references: [
        {
          path: "shared/news-catalog.json"
        }
      ]
    }
  ],
  logicalEntries: [
    {
      provider: "Fintraffic Digitraffic",
      host: "not-currently-wired",
      kind: "candidate",
      observed: false,
      license: "Not applicable: no live fetch is present in this checkout",
      attribution: "Excluded from the live-provider count: issue audit named Digitraffic, but no current source call was found.",
      status: "excluded"
    }
  ],
  logicalProviders: [
    {
      provider: "Fast Company",
      feedLabels: [
        "Fast Company"
      ],
      transportHosts: [
        "feeds.feedburner.com"
      ],
      editorialHosts: [],
      originCountry: "US",
      coveredCountries: []
    },
    {
      provider: "NDTV",
      feedLabels: [
        "NDTV",
        "NDTV India"
      ],
      transportHosts: [
        "feeds.feedburner.com"
      ],
      editorialHosts: [],
      originCountry: "IN",
      coveredCountries: [
        "IN"
      ]
    },
    {
      provider: "The Hacker News",
      feedLabels: [
        "The Hacker News"
      ],
      transportHosts: [
        "feeds.feedburner.com"
      ],
      editorialHosts: [],
      originCountry: "IN",
      coveredCountries: []
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
var provenanceCoverage = null;
function getProvenanceCoverage() {
  if (provenanceCoverage) return provenanceCoverage;
  const names = /* @__PURE__ */ new Set([
    ...Object.keys(SOURCE_PROPAGANDA_RISK),
    ...Object.keys(SOURCE_TYPES),
    ...Object.keys(CONFIGURED_SOURCE_PROVENANCE_DECLARATIONS)
  ]);
  let riskReviewed = 0;
  let stateAffiliated = 0;
  let perspectiveLabelled = 0;
  for (const name of names) {
    if (!hasReviewedPropagandaRisk(name)) continue;
    riskReviewed += 1;
    const profile = SOURCE_PROPAGANDA_RISK[name];
    if (profile.stateAffiliated) stateAffiliated += 1;
    if (profile.knownBiases?.length) perspectiveLabelled += 1;
  }
  provenanceCoverage = {
    sources: names.size,
    riskReviewed,
    stateAffiliated,
    perspectiveLabelled,
    caveat: `Perspective labels are recorded for ${perspectiveLabelled} of ${names.size} sources; a source without one has not been assessed, not judged neutral.`
  };
  return provenanceCoverage;
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
var TIER_MEANING = Object.freeze({
  1: "Wire services and official bodies",
  2: "Major outlets",
  3: "Specialist, regional and think-tank sources",
  4: "Aggregators and blogs"
});

// scripts/source-origin.mjs
var INTERNATIONAL_FILTER = "intl";
var ISO2_CODES = new Set("AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BR BS BT BW BY BZ CA CD CF CG CH CI CK CL CM CN CO CR CU CV CW CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET EU FI FJ FK FM FO FR GA GB GD GE GG GH GI GL GM GN GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RO RS RU RW SA SB SC SD SE SG SH SI SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS XK YE ZA ZM ZW".split(" "));
var REGION_NAMES = new Intl.DisplayNames(["en"], { type: "region" });
var VANITY_CC_TLDS = /* @__PURE__ */ new Set([
  "ai",
  "am",
  "cc",
  "cf",
  "cm",
  "co",
  "fm",
  "ga",
  "gd",
  "gg",
  "gl",
  "gq",
  "io",
  "is",
  "ly",
  "me",
  "ml",
  "mn",
  "nu",
  "rs",
  "sh",
  "so",
  "tk",
  "to",
  "tv",
  "vc",
  "ws",
  "zw"
]);
var GENERIC_TLDS = /* @__PURE__ */ new Set([
  "aero",
  "app",
  "arpa",
  "asia",
  "biz",
  "blog",
  "cloud",
  "coop",
  "dev",
  "edu",
  "events",
  "example",
  "gov",
  "info",
  "int",
  "invalid",
  "jobs",
  "live",
  "local",
  "mil",
  "mobi",
  "museum",
  "name",
  "net",
  "news",
  "online",
  "onion",
  "org",
  "pro",
  "site",
  "space",
  "tech",
  "tel",
  "test",
  "watch",
  "world",
  "xxx",
  "xyz"
]);
var INTERNATIONAL_HOST_SUFFIXES = [
  ".fao.org",
  ".gdacs.org",
  ".humdata.org",
  ".iaea.org",
  ".icao.int",
  ".iea.org",
  ".ilo.org",
  ".imf.org",
  ".opec.org",
  ".reliefweb.int",
  ".un.org",
  ".undp.org",
  ".unep.org",
  ".unesco.org",
  ".unhcr.org",
  ".unognewsroom.org",
  ".who.int",
  ".worldbank.org",
  ".wto.org"
];
var HOST_ORIGINS = Object.freeze({
  "api.cammesa.com": "AR",
  "admin.gse.com.ge": "GE",
  "erp.powergrid.gov.bd": "BD",
  "petrobangla.org.bd": "BD",
  "niggrid.org": "NG",
  "eskom.co.za": "ZA",
  "dados.ons.org.br": "BR",
  "www.datos.gov.co": "CO",
  // Editorial hosts used by site-scoped news searches. These are catalogued
  // as publishers in their own right; the shared search endpoint is a
  // separate provider.
  "36kr.com": "CN",
  "a16z.com": "US",
  "actuniger.com": "NE",
  "angellist.com": "US",
  "annahar.com": "LB",
  "apnews.com": "US",
  "arabianbusiness.com": "AE",
  "arabnews.com": "SA",
  "arctictoday.com": "US",
  "armenpress.am": "AM",
  "armscontrol.org": "US",
  "asia.nikkei.com": "JP",
  "ayibopost.com": "HT",
  "bangkokpost.com": "TH",
  "bellingcat.com": "NL",
  "besttime.app": "NL",
  "bihus.info": "UA",
  "binance.com": null,
  "bloomberg.com": "US",
  "carnegieendowment.org": "US",
  "chathamhouse.org": "GB",
  "citinewsroom.com": "GH",
  "cnas.org": "US",
  "cnn.com": "US",
  "coinbase.com": "US",
  "cp24.com": "CA",
  "dhakatribune.com": "BD",
  "dlnews.com": "GB",
  "dw.com": "DE",
  "eff.org": "US",
  "english.alarabiya.net": "SA",
  "english.enabbaladi.net": "SY",
  "euractiv.com": "BE",
  "euromaidanpress.com": "UA",
  "fas.org": "US",
  "fxempire.com": "IL",
  "geo.tv": "PK",
  "gmfus.org": "US",
  "haaretz.com": "IL",
  "hiiraan.com": "CA",
  "interfax.com": "RU",
  "investing.com": "IL",
  "iranintl.com": "GB",
  "janes.com": "GB",
  "jin10.com": "CN",
  "kitco.com": "CA",
  "kyivindependent.com": "UA",
  "lorientlejour.com": "LB",
  "lowyinstitute.org": "AU",
  "madamasr.com": "EG",
  "marketwatch.com": "US",
  "messari.io": "US",
  "mining-journal.com": "GB",
  "miningweekly.com": "ZA",
  "montrealgazette.com": "CA",
  "nti.org": "US",
  "oecd.org": null,
  "oko.press": "PL",
  "oglobo.globo.com": "BR",
  "pajhwok.com": "AF",
  "prnewswire.com": "US",
  "renaissancecapital.com": "US",
  "reuters.com": "GB",
  "rferl.org": "US",
  "rudaw.net": "IQ",
  "rusi.org": "GB",
  "slidstvo.info": "UA",
  "spglobal.com": "US",
  "suspilne.media": "UA",
  "taipeitimes.com": "TW",
  "tass.com": "RU",
  "theblock.co": "US",
  "thebulletin.org": "US",
  "thedailystar.net": "BD",
  "theguardianpostcameroon.com": "CM",
  "theinformation.com": "US",
  "thejakartapost.com": "ID",
  "thenextweb.com": "NL",
  "tvp.info": "PL",
  "ukrinform.net": "UA",
  "understandingwar.org": "US",
  "wilsoncenter.org": "US",
  "wublockchain.com": "CN",
  "xinhuanet.com": "CN",
  "yemenonline.info": "YE",
  "zerkalo.io": "BY",
  "acleddata.com": "US",
  "adsb.lol": "NL",
  // Republishes UK Maritime Trade Operations reports; the catalog origin is the reporting authority.
  "hormuz.data-tracking.net": "GB",
  "api.adsb.lol": "NL",
  "aerotime.aero": "LT",
  "agentskills.io": "US",
  // Validated crisis-desk direct publishers (#6813-#6830).
  "airinfoagadez.com": "NE",
  "amu.tv": "AF",
  "efectococuyo.com": "VE",
  "havanatimes.org": "CU",
  "lefaso.net": "BF",
  "libyaherald.com": "LY",
  "nation.africa": "KE",
  "sanaacenter.org": "YE",
  "syriadirect.org": "SY",
  "tchadinfos.com": "TD",
  "www.14ymedio.com": "CU",
  "www.972mag.com": "IL",
  "www.alwihdainfo.com": "TD",
  "www.caracaschronicles.com": "VE",
  "www.egyptindependent.com": "EG",
  "www.haitilibre.com": "HT",
  "www.naharnet.com": "LB",
  "www.radiondekeluka.org": "CF",
  "www.studiotamani.org": "ML",
  "airlinegeeks.com": "US",
  "airplanes.live": null,
  "api.airplanes.live": null,
  "api.cloudflare.com": "US",
  "radar.cloudflare.com": "US",
  "api.abuseipdb.com": "US",
  "api.alternative.me": null,
  "api.aviationstack.com": "GB",
  "api.coingecko.com": "MY",
  "api.coinpaprika.com": "PL",
  "api.elections.kalshi.com": "US",
  "api.exa.ai": "US",
  "api.firecrawl.dev": "US",
  "api.gdeltproject.org": "US",
  "api.github.com": null,
  "api.hyperliquid.xyz": "US",
  "api.openaq.org": "US",
  "api.opensanctions.org": "DE",
  "api.ossinsight.io": "CN",
  "api.planespotters.net": "DE",
  "api.rainviewer.com": "US",
  "api.safecast.org": "JP",
  "api.scrapecreators.com": "US",
  "api.search.brave.com": "US",
  "api.spdrgoldshares.com": "US",
  "api.stlouisfed.org": "US",
  "fred.stlouisfed.org": "US",
  "api.telegram.org": "AE",
  "api.travelpayouts.com": "CY",
  "api.tzevaadom.co.il": "IL",
  "api.waqi.info": "CN",
  "api.windy.com": "CZ",
  "api.x.com": "US",
  "archive-api.open-meteo.com": "DE",
  "asharq.com": "SA",
  "asharqbusiness.com": "SA",
  "astanatimes.com": "KZ",
  "atbackend.sipri.org": "SE",
  "auth.opensky-network.org": "CH",
  "azure.status.microsoft": "US",
  "balkaninsight.com": "BA",
  "bitcoinmagazine.com": "US",
  "bitbucket.status.atlassian.com": "AU",
  "bothsidesofthetable.com": "US",
  "breakingdefense.com": "US",
  "budgetlab.yale.edu": "US",
  "calgaryherald.com": "CA",
  "celestrak.org": "US",
  "chainwire.org": "US",
  "changelog.com": "US",
  "climate.copernicus.eu": "EU",
  "cointelegraph.com": "US",
  "collisionconf.com": "CA",
  "confluence.status.atlassian.com": "AU",
  "conservationoptimism.org": "GB",
  "contxto.com": "MX",
  "correctiv.org": "DE",
  "corridorrisk.io": null,
  "cryptoslate.com": "US",
  "customer-api.wingbits.com": "NO",
  "dailytrust.com": "NG",
  "decrypt.co": "US",
  "dev.events": "US",
  "dev.to": "US",
  "devops.com": "US",
  "dfrlab.org": "US",
  "discordstatus.com": "US",
  "disrupt-africa.com": "ZA",
  "e00-elmundo.uecdn.es": "ES",
  "earth-search.aws.element84.com": "US",
  "ecs-api.wingbits.com": "NO",
  "edmontonjournal.com": "CA",
  "en.mehrnews.com": "IR",
  "en.wikipedia.org": null,
  "eurasianet.org": null,
  "export.arxiv.org": "US",
  "feed.businesswire.com": "US",
  "feed.infoq.com": "US",
  "feeds.abcnews.com": "US",
  "feeds.arstechnica.com": "US",
  "feeds.content.dowjones.io": "US",
  "feeds.elpais.com": "ES",
  "feeds.feedburner.com": "US",
  "feeds.finra.org": "US",
  "feeds.folha.uol.com.br": "BR",
  "feeds.megaphone.fm": "US",
  "feeds.nbcnews.com": "US",
  "feeds.news24.com": "ZA",
  "feeds.npr.org": "US",
  "financialpost.com": "CA",
  "factchecktools.googleapis.com": "US",
  "finnhub.io": "US",
  "foreignpolicy.com": "US",
  "fr.africanews.com": null,
  "freeipapi.com": null,
  "gain.nd.edu": "US",
  "gcaptain.com": "US",
  "gtaupdate.com": "CA",
  "geospatial-usace.opendata.arcgis.com": "US",
  "ghoapi.azureedge.net": null,
  "github.blog": null,
  "globalenergymonitor.org": "US",
  "globalinitiative.net": "CH",
  "goldsilverworlds.com": "BE",
  "gpsjam.org": "US",
  "greatergood.berkeley.edu": "US",
  "hacker-news.firebaseio.com": "US",
  "health.aws.amazon.com": "US",
  "hnrss.org": "US",
  "humanprogress.org": "US",
  "inc42.com": "IN",
  "indianexpress.com": "IN",
  "insightcrime.org": "US",
  "ipinfo.io": "US",
  "islandtimes.org": "PW",
  "jam-news.net": "GE",
  "jamestown.org": "US",
  "japantoday.com": "JP",
  "jira-software.status.atlassian.com": "AU",
  "kalshi.com": "US",
  "kr-asia.com": "SG",
  "krebsonsecurity.com": "US",
  "lavca.org": "US",
  "linearstatus.com": "US",
  // The Lobsters domain is a .rs domain hack; the publisher is operated from
  // Chicago, not Serbia.
  "lobste.rs": "US",
  "meduza.io": "RU",
  "mempool.space": null,
  "mexiconewsdaily.com": "MX",
  "moxie.foxbusiness.com": "US",
  "moxie.foxnews.com": "US",
  "mshibanami.github.io": "US",
  "nationalpost.com": "CA",
  "news.crunchbase.com": "US",
  "news.google.com": "US",
  "news.mit.edu": "US",
  "news.mongabay.com": "US",
  "news.ycombinator.com": "US",
  "nominatim.openstreetmap.org": null,
  "oauth.reddit.com": "US",
  "oc-media.org": "GE",
  "oilprice.com": "CA",
  "onemileatatime.com": "US",
  "open-meteo.caseyjhand.com": "US",
  // Community MCP operator cyanheads is based in Seattle.
  "opensky-network.org": "CH",
  "ottawacitizen.com": "CA",
  "otx.alienvault.com": "US",
  "ourworldindata.org": "GB",
  "owid-public.owid.io": "GB",
  "patents.google.com": "US",
  "phys.org": "GB",
  "pitchbook.com": "US",
  "polymarket.com": "US",
  "pro-api.coingecko.com": "MY",
  "production.dataviz.cnn.io": "US",
  "public.govdelivery.com": "US",
  "publicacionexterna.azurewebsites.net": "MX",
  "qevdnlpgjxpwusesmtpx.supabase.co": "US",
  "query.wikidata.org": null,
  "query1.finance.yahoo.com": "US",
  "railway.instatus.com": "US",
  "raw.githubusercontent.com": null,
  "reasonstobecheerful.world": "US",
  "responsiblestatecraft.org": "US",
  "restcountries.com": null,
  "review.firstround.com": "US",
  "rss.art19.com": "US",
  "rss.dw.com": "DE",
  "rss.libsyn.com": "US",
  "rss.politico.com": "US",
  "rsf.org": "FR",
  "scanner.tradingview.com": "US",
  "schema.org": "US",
  "seekingalpha.com": "US",
  "serpapi.com": "US",
  "services.arcgis.com": "CA",
  "services7.arcgis.com": "US",
  "services9.arcgis.com": "US",
  "simpleflying.com": "GB",
  "singularityhub.com": "US",
  "slack-status.com": "US",
  "stats.bis.org": "CH",
  "status.circleci.com": "US",
  "status.claude.com": "US",
  "status.cloud.google.com": "US",
  "status.datadoghq.com": "US",
  "status.digitalocean.com": "US",
  "status.gitlab.com": "US",
  "status.npmjs.org": "US",
  "status.openai.com": "US",
  "status.render.com": "US",
  "status.sentry.io": "US",
  "status.stripe.com": "US",
  "status.supabase.com": "US",
  "status.twilio.com": "US",
  "storage.googleapis.com": "GB",
  "stratechery.com": "US",
  "taskandpurpose.com": "US",
  "tech.eu": "EU",
  "techcabal.com": "NG",
  "techcrunch.com": "US",
  "thebetterindia.com": "IN",
  "thedefiant.io": "US",
  "thediplomat.com": "US",
  "thehill.com": "US",
  "thenewstack.io": "US",
  "thepointsguy.com": "US",
  "theprovince.com": "CA",
  "thesentry.org": "US",
  "thinkglobalhealth.github.io": "US",
  "timesca.com": null,
  "timesofindia.indiatimes.com": "IN",
  "trumpstruth.org": "US",
  "unchainedcrypto.com": "US",
  "vancouversun.com": "CA",
  "venturebeat.com": "US",
  "viewfromthewing.com": "US",
  "vnexpress.net": "VN",
  "vsquare.org": "PL",
  "wabi-europe-north-b-api.analysis.windows.net": "US",
  "warontherocks.com": "US",
  "web.archive.org": "US",
  "websummit.com": "IE",
  "www.a16z.news": "US",
  "www.aaii.com": "US",
  "www.aaronsw.com": "US",
  "www.abc.net.au": "AU",
  "www.africanews.com": null,
  "www.aajtak.in": "IN",
  "www.alarabiya.net": "SA",
  "aljazeera.com": "QA",
  "www.aljazeera.com": "QA",
  "www.aljazeera.net": "QA",
  "www.alphavantage.co": "US",
  "www.amarujala.com": "IN",
  "www.asahi.com": "JP",
  "www.atlanticcouncil.org": "US",
  "www.aviationpros.com": "US",
  "www.aviationweek.com": "US",
  "www.axios.com": "US",
  "api.axios.com": "US",
  "www.barchart.com": "US",
  "www.bbc.com": "GB",
  "www.businessinsider.com": "US",
  "www.carbonbrief.org": "GB",
  "www.cbinsights.com": "US",
  "www.cbsnews.com": "US",
  "www.channelnewsasia.com": "SG",
  "www.channelstv.com": "NG",
  "www.chosun.com": "KR",
  "www.clarin.com": "AR",
  "www.climatecentral.org": "US",
  "www.cloudflarestatus.com": "US",
  "www.cnbc.com": "US",
  "www.coindesk.com": "US",
  "www.crisisgroup.org": "BE",
  "www.csis.org": "US",
  "www.dabangasudan.org": "SD",
  "www.dailygood.org": "US",
  "www.dailysabah.com": "TR",
  "www.darkreading.com": "US",
  "www.dawn.com": "PK",
  "www.defensenews.com": "US",
  "www.defenseone.com": "US",
  "www.dockerstatus.com": "US",
  "www.eltiempo.com": "CO",
  "www.eluniverso.com": "EC",
  "www.engadget.com": "US",
  "www.ethiopia-insight.com": "ET",
  "www.eu-startups.com": "EU",
  "www.euronews.com": null,
  "de.euronews.com": null,
  "es.euronews.com": null,
  "fr.euronews.com": null,
  "gr.euronews.com": null,
  "it.euronews.com": null,
  "pt.euronews.com": null,
  "ru.euronews.com": null,
  "www.fatf-gafi.org": null,
  "www.flightglobal.com": "GB",
  "www.foreignaffairs.com": "US",
  "www.fpri.org": "US",
  "www.france24.com": "FR",
  "www.ft.com": "GB",
  "www.fwdstart.me": "US",
  "www.githubstatus.com": null,
  "www.gitex.com": "AE",
  "www.globenewswire.com": "US",
  "www.goldseek.com": "US",
  "www.good.is": "US",
  "www.goodgoodgood.co": "US",
  "www.goodnewsnetwork.org": "US",
  "www.google.com": "US",
  "www.handelsblatt.com": "DE",
  "www.handybulk.com": "GB",
  "www.iaea.org": null,
  "www.iea.org": null,
  "www.ifswf.org": null,
  "www.infobae.com": "AR",
  "www.irrawaddy.com": "MM",
  "www.jeuneafrique.com": "FR",
  "www.jodidata.org": null,
  "api.publisher.jodidata.org": null,
  "www.jpost.com": "IL",
  "www.lasillavacia.com": "CO",
  "www.ledevoir.com": "CA",
  "www.lennysnewsletter.com": "US",
  "www.lighthousereports.com": "NL",
  "www.livescience.com": "US",
  "www.militarytimes.com": "US",
  "www.mining.com": "CA",
  "www.mining-technology.com": "GB",
  "www.myjoyonline.com": "GH",
  "www.nature.com": "GB",
  "www.netlifystatus.com": "US",
  "www.newscientist.com": "GB",
  "www.newyorkfed.org": "US",
  "www.nfx.com": "US",
  "www.northernminer.com": "CA",
  "www.notion-status.com": "US",
  "www.occrp.org": null,
  "www.opec.org": null,
  "www.optimistdaily.com": "US",
  "www.oryxspioenkop.com": "NL",
  "www.pbs.org": "US",
  "www.pizzint.watch": "US",
  "www.positive.news": "GB",
  "www.premiumtimesng.com": "NG",
  "www.producthunt.com": "US",
  "www.radiookapi.net": "CD",
  "www.radiotamazuj.org": "SS",
  "www.rand.org": "US",
  "www.ransomware.live": "FR",
  "www.rappler.com": "PH",
  "www.reddit.com": "US",
  "www.replicatestatus.com": "US",
  "www.rigzone.com": "US",
  "rt-english.com": "RU",
  "www.saastr.com": "US",
  "www.schneier.com": "US",
  "www.sciencedaily.com": "US",
  "www.scmp.com": "HK",
  "www.semianalysis.com": "US",
  "www.sequoiacap.com": "US",
  "www.shareable.net": "US",
  "www.silverseek.com": "US",
  "www.spdrgoldshares.com": "US",
  "www.stimson.org": "US",
  "www.submarinecablemap.com": "US",
  "www.sunnyskyz.com": "US",
  "www.swfinstitute.org": "US",
  "www.techinasia.com": "SG",
  "www.techmeme.com": "US",
  "www.techstars.com": "US",
  "www.technologyreview.com": "US",
  "www.theglobeandmail.com": "CA",
  "www.theguardian.com": "GB",
  "www.thehindu.com": "IN",
  "www.themoscowtimes.com": "RU",
  "www.thenationalnews.com": "AE",
  "www.thereporterethiopia.com": "ET",
  "www.thestar.com": "CA",
  "www.theverge.com": "US",
  "www.thisdaylive.com": "NG",
  "www.token2049.com": "SG",
  "www.tomshardware.com": "US",
  "www.twz.com": "US",
  "www.upworthy.com": "US",
  "www.vanguardngr.com": "NG",
  "www.vercel-status.com": "US",
  "www.visionofhumanity.org": "AU",
  "www.windy.com": "CZ",
  "www.winnipegfreepress.com": "CA",
  "www.wired.com": "US",
  "www.ycombinator.com": "US",
  "www.yesmagazine.org": "US",
  "www.ynetnews.com": "IL",
  "www.zdnet.com": "US",
  "www.zoomstatus.com": "US",
  "arxiv.org": "US",
  "economist.com": "GB",
  "fc.yahoo.com": "US",
  "finance.yahoo.com": "US",
  "news.usni.org": "US",
  "sifted.eu": "EU",
  "your-app.convex.site": "US",
  "yourstory.com": "IN",
  "gamma-api.polymarket.com": "US",
  "independent.co.uk": "GB",
  "japantimes.co.jp": "JP",
  "middleeasteye.net": "GB",
  "news.sky.com": "GB",
  "noaadata.apps.nsidc.org": "US",
  "nytimes.com": "US",
  "timesofisrael.com": "IL",
  "washingtonpost.com": "US"
});
var PROVIDER_ORIGINS = Object.freeze({
  "B.C. Evacuation Orders and Alerts": "CA",
  "Toronto Police Service": "CA",
  "Toronto Police Service Open Data": "CA",
  "GTA Update": "CA",
  "Ember electricity data": "GB",
  "Fast Company": "US",
  "Mexico Energy Regulatory Commission (CRE)": "MX",
  NDTV: "IN",
  "Our World in Data": "GB",
  "The Hacker News": "IN",
  "World Health Organization (WHO)": null
});
function normalizeHost(host) {
  return String(host || "").trim().toLowerCase();
}
function hasOwn(map, key) {
  return Object.prototype.hasOwnProperty.call(map, key);
}
function inferOriginFromHost(host) {
  const lower = normalizeHost(host);
  if (!lower) return void 0;
  if (lower.endsWith(".usembassy.gov") || lower.endsWith(".gov") || lower.endsWith(".mil") || lower.endsWith(".fed.us")) {
    return "US";
  }
  if (lower.endsWith(".edu")) return "US";
  if (/\.(?:gov|service\.gov)\.uk$/.test(lower) || lower.endsWith(".ac.uk") || lower.endsWith(".co.uk") || lower.endsWith(".org.uk")) {
    return "GB";
  }
  if (lower.endsWith(".gov.au") || lower.endsWith(".net.au") || lower.endsWith(".com.au") || lower.endsWith(".org.au") || lower.endsWith(".edu.au")) {
    return "AU";
  }
  if (lower.endsWith(".gc.ca") || lower.endsWith(".canada.ca") || lower.endsWith(".statcan.gc.ca")) {
    return "CA";
  }
  if (lower.endsWith(".gov.cn") || lower.endsWith(".com.cn") || lower.endsWith(".net.cn") || lower.endsWith(".org.cn") || lower.endsWith(".edu.cn") || lower.endsWith(".ac.cn")) {
    return "CN";
  }
  if (lower.endsWith(".gov.tw")) return "TW";
  if (lower.endsWith(".gov.hk")) return "HK";
  if (lower.endsWith(".gov.my")) return "MY";
  if (lower.endsWith(".gob.mx")) return "MX";
  if (lower.endsWith(".gob.es")) return "ES";
  if (lower.endsWith(".govt.nz") || lower.endsWith(".co.nz")) return "NZ";
  if (lower.endsWith(".gov.br") || lower.endsWith(".com.br")) return "BR";
  if (lower.endsWith(".europa.eu")) return "EU";
  if (lower.endsWith(".gov.il") || lower.endsWith(".co.il")) return "IL";
  if (lower.endsWith(".co.kr") || lower.endsWith(".go.kr")) return "KR";
  if (lower.endsWith(".com.tr")) return "TR";
  if (INTERNATIONAL_HOST_SUFFIXES.some((suffix) => lower === suffix.slice(1) || lower.endsWith(suffix)) || lower.endsWith(".int")) {
    return null;
  }
  const tld = lower.split(".").at(-1);
  if (!tld || GENERIC_TLDS.has(tld) || VANITY_CC_TLDS.has(tld)) return void 0;
  if (tld === "uk") return "GB";
  if (tld === "eu") return "EU";
  const iso2 = tld.toUpperCase();
  return ISO2_CODES.has(iso2) ? iso2 : void 0;
}
function resolveHostOrigin(host) {
  const lower = normalizeHost(host);
  if (hasOwn(HOST_ORIGINS, lower)) return HOST_ORIGINS[lower];
  const wwwAlias = lower.startsWith("www.") ? lower.slice(4) : `www.${lower}`;
  if (hasOwn(HOST_ORIGINS, wwwAlias)) return HOST_ORIGINS[wwwAlias];
  return inferOriginFromHost(lower);
}
function resolveSourceOrigin({ provider, hosts = [] } = {}) {
  if (hasOwn(PROVIDER_ORIGINS, provider)) return PROVIDER_ORIGINS[provider];
  const resolved = (hosts.length > 0 ? hosts : [provider]).map((host) => resolveHostOrigin(host));
  const missing = resolved.some((code2) => code2 === void 0);
  if (missing) {
    throw new Error(`Source provider needs a catalog origin country: ${provider}`);
  }
  const unique = new Set(resolved.map((code2) => code2 ?? INTERNATIONAL_FILTER));
  if (unique.size !== 1) {
    throw new Error(`Source provider has conflicting origin countries: ${provider}`);
  }
  const code = [...unique][0];
  return code === INTERNATIONAL_FILTER ? null : code;
}
var ORIGIN_LABEL_OVERRIDES = Object.freeze({
  EU: "European Union",
  HK: "Hong Kong"
});
function sourceOriginLabel(code) {
  if (!code) return "International";
  if (hasOwn(ORIGIN_LABEL_OVERRIDES, code)) return ORIGIN_LABEL_OVERRIDES[code];
  return REGION_NAMES.of(code) || code;
}
function sourceOriginFilterValue(code) {
  return (code || INTERNATIONAL_FILTER).toLowerCase();
}
function assertKnownOriginCode(code, label) {
  if (code == null) return;
  if (!ISO2_CODES.has(code)) {
    throw new Error(`${label} uses unknown origin country "${code}"`);
  }
}
for (const [host, code] of Object.entries(HOST_ORIGINS)) {
  assertKnownOriginCode(code, `source-origin host ${host}`);
}
for (const [provider, code] of Object.entries(PROVIDER_ORIGINS)) {
  assertKnownOriginCode(code, `source-origin provider ${provider}`);
}

// api/mcp/filters.ts
function argNum(v) {
  if (v == null || v === "") return null;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}
function argStr(v) {
  return typeof v === "string" ? v.toLowerCase().trim() : "";
}
function ciIncludes(hay, needle) {
  return typeof hay === "string" && hay.toLowerCase().includes(needle);
}

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
function resolveCountryFilter(raw, field) {
  if (raw == null || typeof raw === "string" && !raw.trim()) return [];
  const values = Array.isArray(raw) ? raw : [raw];
  return values.map((value) => requireCountryCode(value, "country-filter", field).toLowerCase());
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

// shared/un-m49-regions.json
var un_m49_regions_default = {
  source: "https://unstats.un.org/unsd/methodology/m49/overview/",
  note: "UN M49 geoscheme; supplements cover areas M49 does not list.",
  supplements: {
    TW: "Not listed by M49; geographically Eastern Asia.",
    XK: "Not listed by M49 (user-assigned ISO code); geographically Southern Europe."
  },
  regions: {
    africa: {
      code: "002",
      name: "Africa",
      level: "region",
      countries: [
        "AO",
        "BF",
        "BI",
        "BJ",
        "BW",
        "CD",
        "CF",
        "CG",
        "CI",
        "CM",
        "CV",
        "DJ",
        "DZ",
        "EG",
        "EH",
        "ER",
        "ET",
        "GA",
        "GH",
        "GM",
        "GN",
        "GQ",
        "GW",
        "IO",
        "KE",
        "KM",
        "LR",
        "LS",
        "LY",
        "MA",
        "MG",
        "ML",
        "MR",
        "MU",
        "MW",
        "MZ",
        "NA",
        "NE",
        "NG",
        "RE",
        "RW",
        "SC",
        "SD",
        "SH",
        "SL",
        "SN",
        "SO",
        "SS",
        "ST",
        "SZ",
        "TD",
        "TF",
        "TG",
        "TN",
        "TZ",
        "UG",
        "YT",
        "ZA",
        "ZM",
        "ZW"
      ]
    },
    americas: {
      code: "019",
      name: "Americas",
      level: "region",
      countries: [
        "AG",
        "AI",
        "AR",
        "AW",
        "BB",
        "BL",
        "BM",
        "BO",
        "BQ",
        "BR",
        "BS",
        "BV",
        "BZ",
        "CA",
        "CL",
        "CO",
        "CR",
        "CU",
        "CW",
        "DM",
        "DO",
        "EC",
        "FK",
        "GD",
        "GF",
        "GL",
        "GP",
        "GS",
        "GT",
        "GY",
        "HN",
        "HT",
        "JM",
        "KN",
        "KY",
        "LC",
        "MF",
        "MQ",
        "MS",
        "MX",
        "NI",
        "PA",
        "PE",
        "PM",
        "PR",
        "PY",
        "SR",
        "SV",
        "SX",
        "TC",
        "TT",
        "US",
        "UY",
        "VC",
        "VE",
        "VG",
        "VI"
      ]
    },
    asia: {
      code: "142",
      name: "Asia",
      level: "region",
      countries: [
        "AE",
        "AF",
        "AM",
        "AZ",
        "BD",
        "BH",
        "BN",
        "BT",
        "CN",
        "CY",
        "GE",
        "HK",
        "ID",
        "IL",
        "IN",
        "IQ",
        "IR",
        "JO",
        "JP",
        "KG",
        "KH",
        "KP",
        "KR",
        "KW",
        "KZ",
        "LA",
        "LB",
        "LK",
        "MM",
        "MN",
        "MO",
        "MV",
        "MY",
        "NP",
        "OM",
        "PH",
        "PK",
        "PS",
        "QA",
        "SA",
        "SG",
        "SY",
        "TH",
        "TJ",
        "TL",
        "TM",
        "TR",
        "TW",
        "UZ",
        "VN",
        "YE"
      ]
    },
    "australia-and-new-zealand": {
      code: "053",
      name: "Australia and New Zealand",
      level: "sub-region",
      countries: [
        "AU",
        "CC",
        "CX",
        "HM",
        "NF",
        "NZ"
      ]
    },
    caribbean: {
      code: "029",
      name: "Caribbean",
      level: "intermediate-region",
      countries: [
        "AG",
        "AI",
        "AW",
        "BB",
        "BL",
        "BQ",
        "BS",
        "CU",
        "CW",
        "DM",
        "DO",
        "GD",
        "GP",
        "HT",
        "JM",
        "KN",
        "KY",
        "LC",
        "MF",
        "MQ",
        "MS",
        "PR",
        "SX",
        "TC",
        "TT",
        "VC",
        "VG",
        "VI"
      ]
    },
    "central-america": {
      code: "013",
      name: "Central America",
      level: "intermediate-region",
      countries: [
        "BZ",
        "CR",
        "GT",
        "HN",
        "MX",
        "NI",
        "PA",
        "SV"
      ]
    },
    "central-asia": {
      code: "143",
      name: "Central Asia",
      level: "sub-region",
      countries: [
        "KG",
        "KZ",
        "TJ",
        "TM",
        "UZ"
      ]
    },
    "eastern-africa": {
      code: "014",
      name: "Eastern Africa",
      level: "intermediate-region",
      countries: [
        "BI",
        "DJ",
        "ER",
        "ET",
        "IO",
        "KE",
        "KM",
        "MG",
        "MU",
        "MW",
        "MZ",
        "RE",
        "RW",
        "SC",
        "SO",
        "SS",
        "TF",
        "TZ",
        "UG",
        "YT",
        "ZM",
        "ZW"
      ]
    },
    "eastern-asia": {
      code: "030",
      name: "Eastern Asia",
      level: "sub-region",
      countries: [
        "CN",
        "HK",
        "JP",
        "KP",
        "KR",
        "MN",
        "MO",
        "TW"
      ]
    },
    "eastern-europe": {
      code: "151",
      name: "Eastern Europe",
      level: "sub-region",
      countries: [
        "BG",
        "BY",
        "CZ",
        "HU",
        "MD",
        "PL",
        "RO",
        "RU",
        "SK",
        "UA"
      ]
    },
    europe: {
      code: "150",
      name: "Europe",
      level: "region",
      countries: [
        "AD",
        "AL",
        "AT",
        "AX",
        "BA",
        "BE",
        "BG",
        "BY",
        "CH",
        "CZ",
        "DE",
        "DK",
        "EE",
        "ES",
        "FI",
        "FO",
        "FR",
        "GB",
        "GG",
        "GI",
        "GR",
        "HR",
        "HU",
        "IE",
        "IM",
        "IS",
        "IT",
        "JE",
        "LI",
        "LT",
        "LU",
        "LV",
        "MC",
        "MD",
        "ME",
        "MK",
        "MT",
        "NL",
        "NO",
        "PL",
        "PT",
        "RO",
        "RS",
        "RU",
        "SE",
        "SI",
        "SJ",
        "SK",
        "SM",
        "UA",
        "VA",
        "XK"
      ]
    },
    "latin-america-and-the-caribbean": {
      code: "419",
      name: "Latin America and the Caribbean",
      level: "sub-region",
      countries: [
        "AG",
        "AI",
        "AR",
        "AW",
        "BB",
        "BL",
        "BO",
        "BQ",
        "BR",
        "BS",
        "BV",
        "BZ",
        "CL",
        "CO",
        "CR",
        "CU",
        "CW",
        "DM",
        "DO",
        "EC",
        "FK",
        "GD",
        "GF",
        "GP",
        "GS",
        "GT",
        "GY",
        "HN",
        "HT",
        "JM",
        "KN",
        "KY",
        "LC",
        "MF",
        "MQ",
        "MS",
        "MX",
        "NI",
        "PA",
        "PE",
        "PR",
        "PY",
        "SR",
        "SV",
        "SX",
        "TC",
        "TT",
        "UY",
        "VC",
        "VE",
        "VG",
        "VI"
      ]
    },
    melanesia: {
      code: "054",
      name: "Melanesia",
      level: "sub-region",
      countries: [
        "FJ",
        "NC",
        "PG",
        "SB",
        "VU"
      ]
    },
    micronesia: {
      code: "057",
      name: "Micronesia",
      level: "sub-region",
      countries: [
        "FM",
        "GU",
        "KI",
        "MH",
        "MP",
        "NR",
        "PW",
        "UM"
      ]
    },
    "middle-africa": {
      code: "017",
      name: "Middle Africa",
      level: "intermediate-region",
      countries: [
        "AO",
        "CD",
        "CF",
        "CG",
        "CM",
        "GA",
        "GQ",
        "ST",
        "TD"
      ]
    },
    "northern-africa": {
      code: "015",
      name: "Northern Africa",
      level: "sub-region",
      countries: [
        "DZ",
        "EG",
        "EH",
        "LY",
        "MA",
        "SD",
        "TN"
      ]
    },
    "northern-america": {
      code: "021",
      name: "Northern America",
      level: "sub-region",
      countries: [
        "BM",
        "CA",
        "GL",
        "PM",
        "US"
      ]
    },
    "northern-europe": {
      code: "154",
      name: "Northern Europe",
      level: "sub-region",
      countries: [
        "AX",
        "DK",
        "EE",
        "FI",
        "FO",
        "GB",
        "GG",
        "IE",
        "IM",
        "IS",
        "JE",
        "LT",
        "LV",
        "NO",
        "SE",
        "SJ"
      ]
    },
    oceania: {
      code: "009",
      name: "Oceania",
      level: "region",
      countries: [
        "AS",
        "AU",
        "CC",
        "CK",
        "CX",
        "FJ",
        "FM",
        "GU",
        "HM",
        "KI",
        "MH",
        "MP",
        "NC",
        "NF",
        "NR",
        "NU",
        "NZ",
        "PF",
        "PG",
        "PN",
        "PW",
        "SB",
        "TK",
        "TO",
        "TV",
        "UM",
        "VU",
        "WF",
        "WS"
      ]
    },
    polynesia: {
      code: "061",
      name: "Polynesia",
      level: "sub-region",
      countries: [
        "AS",
        "CK",
        "NU",
        "PF",
        "PN",
        "TK",
        "TO",
        "TV",
        "WF",
        "WS"
      ]
    },
    "south-america": {
      code: "005",
      name: "South America",
      level: "intermediate-region",
      countries: [
        "AR",
        "BO",
        "BR",
        "BV",
        "CL",
        "CO",
        "EC",
        "FK",
        "GF",
        "GS",
        "GY",
        "PE",
        "PY",
        "SR",
        "UY",
        "VE"
      ]
    },
    "south-eastern-asia": {
      code: "035",
      name: "South-eastern Asia",
      level: "sub-region",
      countries: [
        "BN",
        "ID",
        "KH",
        "LA",
        "MM",
        "MY",
        "PH",
        "SG",
        "TH",
        "TL",
        "VN"
      ]
    },
    "southern-africa": {
      code: "018",
      name: "Southern Africa",
      level: "intermediate-region",
      countries: [
        "BW",
        "LS",
        "NA",
        "SZ",
        "ZA"
      ]
    },
    "southern-asia": {
      code: "034",
      name: "Southern Asia",
      level: "sub-region",
      countries: [
        "AF",
        "BD",
        "BT",
        "IN",
        "IR",
        "LK",
        "MV",
        "NP",
        "PK"
      ]
    },
    "southern-europe": {
      code: "039",
      name: "Southern Europe",
      level: "sub-region",
      countries: [
        "AD",
        "AL",
        "BA",
        "ES",
        "GI",
        "GR",
        "HR",
        "IT",
        "ME",
        "MK",
        "MT",
        "PT",
        "RS",
        "SI",
        "SM",
        "VA",
        "XK"
      ]
    },
    "sub-saharan-africa": {
      code: "202",
      name: "Sub-Saharan Africa",
      level: "sub-region",
      countries: [
        "AO",
        "BF",
        "BI",
        "BJ",
        "BW",
        "CD",
        "CF",
        "CG",
        "CI",
        "CM",
        "CV",
        "DJ",
        "ER",
        "ET",
        "GA",
        "GH",
        "GM",
        "GN",
        "GQ",
        "GW",
        "IO",
        "KE",
        "KM",
        "LR",
        "LS",
        "MG",
        "ML",
        "MR",
        "MU",
        "MW",
        "MZ",
        "NA",
        "NE",
        "NG",
        "RE",
        "RW",
        "SC",
        "SH",
        "SL",
        "SN",
        "SO",
        "SS",
        "ST",
        "SZ",
        "TD",
        "TF",
        "TG",
        "TZ",
        "UG",
        "YT",
        "ZA",
        "ZM",
        "ZW"
      ]
    },
    "western-africa": {
      code: "011",
      name: "Western Africa",
      level: "intermediate-region",
      countries: [
        "BF",
        "BJ",
        "CI",
        "CV",
        "GH",
        "GM",
        "GN",
        "GW",
        "LR",
        "ML",
        "MR",
        "NE",
        "NG",
        "SH",
        "SL",
        "SN",
        "TG"
      ]
    },
    "western-asia": {
      code: "145",
      name: "Western Asia",
      level: "sub-region",
      countries: [
        "AE",
        "AM",
        "AZ",
        "BH",
        "CY",
        "GE",
        "IL",
        "IQ",
        "JO",
        "KW",
        "LB",
        "OM",
        "PS",
        "QA",
        "SA",
        "SY",
        "TR",
        "YE"
      ]
    },
    "western-europe": {
      code: "155",
      name: "Western Europe",
      level: "sub-region",
      countries: [
        "AT",
        "BE",
        "CH",
        "DE",
        "FR",
        "LI",
        "LU",
        "MC",
        "NL"
      ]
    }
  }
};

// server/_shared/un-m49-regions.ts
var UN_M49_REGION_IDS = Object.keys(un_m49_regions_default.regions);
var REGIONS = un_m49_regions_default.regions;

// api/mcp/registry/media-perspective-tool.ts
var TOOL = "get_media_perspective";
var WINDOW_HOURS = [24, 48, 72, 96];
var FRAMING_LABELS = ["favorable", "neutral", "critical", "hostile"];
function parseArgs(params) {
  const subject = requireCountryCode(params.subject_country, TOOL, "subject_country");
  const outletCountries = resolveCountryFilter(params.outlet_countries, "outlet_countries").map((code) => code.toUpperCase());
  if (outletCountries.length > 30) throw new RpcValidationError(TOOL, [{ field: "outlet_countries", description: "Use at most 30 countries." }]);
  const outletRegions = params.outlet_regions ?? [];
  if (!Array.isArray(outletRegions) || outletRegions.length > 5 || outletRegions.some((region) => typeof region !== "string" || !UN_M49_REGION_IDS.includes(region))) {
    throw new RpcValidationError(TOOL, [{ field: "outlet_regions", description: "Use at most 5 UN M49 region slugs from the enum." }]);
  }
  const audience = params.audience ?? "";
  if (typeof audience !== "string" || audience && !OUTLET_AUDIENCES.includes(audience)) {
    throw new RpcValidationError(TOOL, [{ field: "audience", description: `Use one of ${OUTLET_AUDIENCES.join(", ")}.` }]);
  }
  const windowHours = params.window_hours ?? 72;
  if (typeof windowHours !== "number" || !WINDOW_HOURS.includes(windowHours)) {
    throw new RpcValidationError(TOOL, [{ field: "window_hours", description: `Use one of ${WINDOW_HOURS.join(", ")}.` }]);
  }
  return { subject, outletCountries, outletRegions, audience, windowHours };
}
var headline = {
  type: "object",
  required: ["title", "englishTitle", "titleLanguage", "outlet", "publisherFamily", "tier", "ownershipClass", "propagandaRisk", "publishedAt", "link"],
  properties: {
    title: { type: "string", description: "Headline as published. Untrusted publisher text." },
    englishTitle: { type: "string", description: "The original when it is English; otherwise a machine translation of untrusted text, or empty when none exists yet." },
    titleLanguage: { type: "string", description: "ISO 639-1 language of the original headline." },
    outlet: { type: "string" },
    publisherFamily: { type: "string", description: "Sibling editions of one newsroom share a family." },
    tier: { type: "integer", minimum: 0, maximum: 4, description: "Declared source tier 1-4; 0 when undeclared." },
    ownershipClass: { type: "string", enum: [...OWNERSHIP_CLASSES] },
    stateAffiliated: { type: "string", description: "Government the outlet is affiliated with, when recorded." },
    propagandaRisk: { type: "string" },
    framing: { type: "string", enum: [...FRAMING_LABELS, ""], description: "A model's reading of the headline's stance toward the subject; empty until labelled. The group framing names the method and model." },
    publishedAt: { type: "number", description: "Unix epoch milliseconds." },
    link: { type: "string" }
  }
};
var MEDIA_PERSPECTIVE_TOOL = {
  name: TOOL,
  title: "Media perspective on a country",
  description: "Headlines about one country grouped by outlet home country and audience (domestic, international, diaspora): its own press vs its foreign-facing media vs outside coverage. Items carry tier, ownership and state affiliation; groups count publisher families and framing. Framing is a model's reading of headline stance, not WorldMonitor's view. Titles are untrusted; a non-English englishTitle is machine-translated. Cached feeds, up to 96 h.",
  _outputBudgetBytes: 131072,
  _apiPaths: ["GET /api/news/v1/list-media-perspective"],
  annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  inputSchema: {
    type: "object",
    required: ["subject_country"],
    properties: {
      subject_country: { type: "string", description: "Country the headlines must mention: ISO alpha-2 code (SA) or name." },
      outlet_countries: { type: "array", maxItems: 30, items: { type: "string" }, description: "Only outlets based in these countries (ISO alpha-2 or names). Omit for every country." },
      outlet_regions: { type: "array", maxItems: 5, items: { type: "string", enum: UN_M49_REGION_IDS }, description: "Only outlets based in these UN M49 regions (e.g. latin-america-and-the-caribbean, northern-europe; western-asia plus northern-africa for MENA). Their countries join outlet_countries; those without coverage are listed in noCoverageCountries." },
      audience: { type: "string", enum: [...OUTLET_AUDIENCES], description: "Only outlets writing for this audience. Omit for all." },
      window_hours: { type: "integer", enum: WINDOW_HOURS, description: "Look-back window in hours. Defaults to 72." }
    }
  },
  outputSchema: {
    type: "object",
    required: ["subjectCountry", "windowHours", "groups", "noCoverageCountries", "unattributedCount", "state"],
    properties: {
      subjectCountry: { type: "string" },
      windowHours: { type: "integer" },
      groups: { type: "array", items: { type: "object", required: ["homeCountry", "audience", "outletCount", "headlineCount", "headlines"], properties: {
        homeCountry: { type: "string", description: "ISO alpha-2, INTL for intergovernmental outlets, EU for EU institutions." },
        audience: { type: "string", enum: [...OUTLET_AUDIENCES] },
        outletCount: { type: "integer", description: "Distinct publisher families." },
        headlineCount: { type: "integer", description: "All matching headlines in the group; more than headlines.length when capped or trimmed for size." },
        framing: { type: "object", properties: {
          favorable: { type: "integer" },
          neutral: { type: "integer" },
          critical: { type: "integer" },
          hostile: { type: "integer" },
          unlabeled: { type: "integer" },
          method: { type: "string", description: "How the labels were produced, e.g. llm-headline-stance." },
          model: { type: "string" },
          promptVersion: { type: "string" }
        } },
        headlines: { type: "array", maxItems: 20, items: headline }
      } } },
      noCoverageCountries: { type: "array", items: { type: "string" } },
      unattributedCount: { type: "integer", description: "Matching headlines left ungrouped: no outlet profile, or a multi-publisher search feed." },
      state: { type: "string", enum: ["complete", "partial", "unavailable"] },
      feedTotal: { type: "integer" },
      feedCached: { type: "integer" },
      readAt: { type: "string" }
    }
  },
  _validateArgs: parseArgs,
  _fitToBudget(result, budgetBytes) {
    if (!Array.isArray(result.groups)) return result;
    const groups = result.groups;
    let fitted = result;
    for (const keep of [3, 1, 0]) {
      fitted = {
        ...result,
        groups: groups.map((group) => Array.isArray(group.headlines) && group.headlines.length > keep ? { ...group, headlines: group.headlines.slice(0, keep) } : group)
      };
      if (new TextEncoder().encode(JSON.stringify(fitted)).length <= budgetBytes) break;
    }
    return fitted;
  },
  async _execute(params, base, context, execution) {
    const args = parseArgs(params);
    const query = new URLSearchParams({ subject_country: args.subject, window_hours: String(args.windowHours) });
    for (const code of args.outletCountries) query.append("outlet_countries", code);
    for (const region of args.outletRegions) query.append("outlet_regions", region);
    if (args.audience) query.set("audience", args.audience);
    const url = `${base}/api/news/v1/list-media-perspective?${query}`;
    const response = await fetchMcpDownstream(url, { headers: { ...await buildAuthHeaders(context, "GET", url, null), "User-Agent": "worldmonitor-mcp-edge/1.0" }, signal: AbortSignal.timeout(8e3) }, execution);
    await assertMcpToolFetchOk(response, { tool: TOOL, operation: "list-media-perspective", auth: context });
    return response.json();
  }
};

// api/mcp/registry/source-tools.ts
var MANIFEST_ENTRIES = source_attribution_manifest_default.entries;
var ACTIVE_PROVIDERS = MANIFEST_ENTRIES.filter((entry) => entry.observed === true && entry.catalogActive !== false && (entry.status === "reviewed" || entry.status === "terms-review"));
var EXCLUDED_COUNT = MANIFEST_ENTRIES.filter((entry) => entry.status === "excluded").length;
var PROVIDER_HOSTS = /* @__PURE__ */ new Map();
for (const entry of ACTIVE_PROVIDERS) {
  const provider = entry.provider || entry.host;
  const hosts = PROVIDER_HOSTS.get(provider) || [];
  if (!hosts.includes(entry.host)) hosts.push(entry.host);
  PROVIDER_HOSTS.set(provider, hosts);
}
var PROVIDER_ORIGINS2 = /* @__PURE__ */ new Map();
for (const [provider, hosts] of PROVIDER_HOSTS) {
  PROVIDER_ORIGINS2.set(provider, resolveSourceOrigin({ provider, hosts }));
}
function providerOrigin(entry) {
  const provider = entry.provider || entry.host;
  const origin = PROVIDER_ORIGINS2.get(provider);
  if (origin === void 0 && !PROVIDER_ORIGINS2.has(provider)) {
    throw new Error(`Missing publisher origin for provider: ${provider}`);
  }
  return origin ?? null;
}
var SOURCE_VIEWS = ["summary", "providers", "outlets"];
var SOURCE_PLATFORMS = ["telegram"];
var DEFAULT_ROW_LIMIT = 50;
var MAX_ROW_LIMIT = 200;
var PLATFORM_IDENTITIES_BY_SOURCE = /* @__PURE__ */ new Map();
for (const entry of TELEGRAM_CHANNEL_TRUST) {
  const identities = PLATFORM_IDENTITIES_BY_SOURCE.get(entry.name) || [];
  identities.push({ platform: "telegram", handle: entry.handle });
  PLATFORM_IDENTITIES_BY_SOURCE.set(entry.name, identities);
}
function resolveRowLimit(value) {
  if (value === void 0) return { limit: DEFAULT_ROW_LIMIT };
  const parsed = typeof value === "string" && /^\d+$/.test(value.trim()) ? Number(value.trim()) : value;
  if (typeof parsed !== "number" || !Number.isSafeInteger(parsed) || parsed < 1) {
    return { error: "limit must be an integer of at least 1" };
  }
  return { limit: Math.min(parsed, MAX_ROW_LIMIT) };
}
function tally(values) {
  const out = {};
  for (const v of values) {
    const key = v || "unknown";
    out[key] = (out[key] || 0) + 1;
  }
  return out;
}
function outletRecord(name) {
  const raw = SOURCE_TIERS[name];
  const tier = typeof raw === "number" ? raw : null;
  const platformIdentities = PLATFORM_IDENTITIES_BY_SOURCE.get(name);
  const { summary: _summary, ...provenance } = getSourceProvenanceState(name);
  return {
    name,
    tier,
    provenance: withOutletProfile(name, provenance),
    ...platformIdentities ? { platformIdentities } : {}
  };
}
var SOURCE_TOOLS = [
  {
    name: "get_sources",
    title: "Source inventory",
    _outputBudgetBytes: 131072,
    // U7 roster (R7). The selection criterion is cheap to serve, cacheable,
    // low value to bulk-scrape, AND reliably fresh. This tool satisfies all
    // four trivially: it is a committed-registry read with no network call, no
    // cache, and therefore no staleness mode at all — a data tool whose seed
    // runs late would hand an uncredentialed caller an empty envelope, which
    // reads as a dead server and defeats the point of having a free tier.
    //
    // The roster is deliberately one tool. Widening it needs per-tool
    // freshness evidence from production, not an assumption; the mechanism is
    // generic, so adding a screened tool later is this one line.
    _freeTier: true,
    description: "WorldMonitor's live source inventory, for deciding whether and how far to trust what the other tools return. Two separate populations: `providers` are upstream hosts data is fetched from (with licence and attribution status), and `outlets` are named public source identities carrying an editorial tier plus propaganda-risk and source-type provenance. Platform channels include stable platform identities instead of pretending every source is a newsroom masthead. Defaults to `summary` (counts only); pass a view to enumerate. Static registry read \u2014 no network, no cache, always current with the deployed build. Credential-free: callable anonymously with no daily quota, under a separate ceiling of 10 unauthenticated calls per minute per IP.",
    inputSchema: {
      type: "object",
      properties: {
        view: {
          type: "string",
          enum: [...SOURCE_VIEWS],
          description: "summary (default) returns counts only and is small. providers enumerates upstream hosts; outlets enumerates named public source identities with tier and provenance."
        },
        kind: { type: "string", description: "providers view only: restrict to one kind \u2014 feed, structured, feed+structured, or operational-status." },
        country: { type: "string", description: "providers view only: restrict by publisher origin using a two-letter country code or intl for international sources. Case-insensitive." },
        tier: { type: "integer", minimum: 1, maximum: 4, description: "outlets view only: restrict to one editorial tier. 1 is a wire or primary outlet. Outlets with no declared tier are never returned by this filter, because their tier is unknown rather than 4." },
        risk: { type: "string", enum: ["low", "medium", "high", "unknown"], description: "outlets view only: restrict to one declared propaganda-risk band." },
        platform: { type: "string", enum: [...SOURCE_PLATFORMS], description: "outlets view only: restrict to source identities configured on a platform such as telegram." },
        query: { type: "string", description: "Case-insensitive substring match \u2014 against host and provider in the providers view, against outlet name in the outlets view. Applied before limit." },
        limit: { type: "integer", minimum: 1, maximum: MAX_ROW_LIMIT, description: `Maximum rows in an enumerated view. Defaults to ${DEFAULT_ROW_LIMIT}, capped at ${MAX_ROW_LIMIT}. Ignored by the summary view. The full provider inventory does not fit one response, so a truncated result sets returned < matched.` }
      },
      required: []
    },
    outputSchema: {
      type: "object",
      required: ["view", "summary"],
      properties: {
        view: { type: "string", enum: [...SOURCE_VIEWS] },
        summary: {
          type: "object",
          description: "Always present, in every view, so counts are available without a second call.",
          required: ["providerCount", "outletCount", "excludedProviderCount", "providersByCountry", "provenanceCoverage"],
          properties: {
            providerCount: { type: "number", description: "Active upstream hosts. Excludes the excluded-status rows counted separately." },
            excludedProviderCount: { type: "number", description: "Manifest rows deliberately excluded from the provider count (local transports and development-only URLs). Reported rather than silently dropped." },
            outletCount: { type: "number", description: "Named news organisations carrying a declared editorial tier." },
            providersByKind: { type: "object", description: "Active provider counts keyed by kind." },
            providersByStatus: { type: "object", description: "Active provider counts keyed by attribution-review status." },
            providersByCountry: { type: "object", description: "Active provider counts keyed by the lowercase country filter value, including intl." },
            outletsByTier: { type: "object", description: "Outlet counts keyed by declared tier." },
            outletsByRisk: { type: "object", description: "Outlet counts keyed by propaganda-risk band." },
            outletsByPlatform: { type: "object", description: "Outlet counts keyed by an explicitly configured platform identity." },
            provenanceCoverage: {
              type: "object",
              description: "How much of the provenance registry is curated. Counts the registry population, not the outlet tier table, so sources differs from outletCount.",
              required: ["sources", "riskReviewed", "stateAffiliated", "perspectiveLabelled", "caveat"],
              properties: {
                sources: { type: "number" },
                riskReviewed: { type: "number" },
                stateAffiliated: { type: "number" },
                perspectiveLabelled: { type: "number", description: "Sources with at least one knownBiases label. An unlabelled source has not been assessed, not judged neutral." },
                caveat: { type: "string" }
              }
            }
          }
        },
        providers: {
          type: "array",
          description: "Present only in the providers view.",
          items: {
            type: "object",
            required: ["host", "provider", "originCountry", "originLabel"],
            properties: {
              host: { type: "string" },
              provider: { type: "string" },
              kind: { type: "string" },
              status: { type: "string" },
              license: { type: "string" },
              originCountry: { type: ["string", "null"], description: "Publisher-origin ISO 3166-1 alpha-2 code, or null for international sources." },
              originLabel: { type: "string", description: "Human-readable publisher-origin label." }
            }
          }
        },
        outlets: {
          type: "array",
          description: "Present only in the outlets view.",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              tier: { type: ["number", "null"], description: "Declared editorial tier, or null when WorldMonitor has not declared one. Never defaulted to a number." },
              provenance: { type: "object", description: "Same provenance shape the news tools attach to stories, minus the prose `summary`. `knownBiases` is always present; empty means no perspective label recorded, not neutral. Includes the outlet profile: `homeCountry`, `audience` (domestic, international or diaspora), `language` and `ownershipClass`, each null when no profile is recorded." },
              platformIdentities: {
                type: "array",
                description: "Stable platform-specific identities for this source, when configured.",
                items: {
                  type: "object",
                  required: ["platform", "handle"],
                  properties: {
                    platform: { type: "string", enum: [...SOURCE_PLATFORMS] },
                    handle: { type: "string" }
                  }
                }
              }
            }
          }
        },
        matched: { type: "number", description: "Rows matching the filters before the limit was applied. Present in enumerated views." },
        returned: { type: "number", description: "Rows actually returned. Less than matched means the limit truncated the result." },
        error: { type: "string", description: "Present when input validation fails. Required summary counts remain available." }
      }
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    _execute: async (params) => {
      const view = argStr(params.view) || "summary";
      const outletNames = Object.keys(SOURCE_TIERS);
      const summary = {
        providerCount: ACTIVE_PROVIDERS.length,
        excludedProviderCount: EXCLUDED_COUNT,
        outletCount: outletNames.length,
        providersByKind: tally(ACTIVE_PROVIDERS.map((e) => e.kind)),
        providersByStatus: tally(ACTIVE_PROVIDERS.map((e) => e.status)),
        providersByCountry: tally(ACTIVE_PROVIDERS.map((e) => sourceOriginFilterValue(providerOrigin(e)))),
        outletsByTier: tally(outletNames.map((n) => String(SOURCE_TIERS[n]))),
        outletsByRisk: tally(outletNames.map((n) => getSourceProvenanceState(n).risk)),
        outletsByPlatform: tally(
          outletNames.flatMap((name) => PLATFORM_IDENTITIES_BY_SOURCE.get(name)?.map((identity) => identity.platform) || [])
        ),
        provenanceCoverage: getProvenanceCoverage()
      };
      if (!SOURCE_VIEWS.includes(view)) {
        return { view: "summary", summary, error: `view must be one of: ${SOURCE_VIEWS.join(", ")}` };
      }
      if (view === "summary") return { view, summary };
      const query = argStr(params.query);
      const resolvedLimit = resolveRowLimit(params.limit);
      if ("error" in resolvedLimit) return { view, summary, error: resolvedLimit.error };
      const { limit } = resolvedLimit;
      if (view === "providers") {
        const kind = argStr(params.kind);
        const country = argStr(params.country)?.toLowerCase();
        if (country && !(country in summary.providersByCountry)) {
          return {
            view,
            summary,
            error: `country must be one of: ${Object.keys(summary.providersByCountry).sort().join(", ")}`
          };
        }
        const matches2 = ACTIVE_PROVIDERS.filter((e) => (!kind || argStr(e.kind) === kind) && (!country || sourceOriginFilterValue(providerOrigin(e)) === country) && (!query || ciIncludes(e.host, query) || ciIncludes(e.provider, query)));
        const providers = matches2.slice(0, limit).map((e) => {
          const originCountry = providerOrigin(e);
          return {
            host: e.host,
            provider: e.provider || e.host,
            kind: e.kind,
            status: e.status,
            license: e.license,
            originCountry,
            originLabel: sourceOriginLabel(originCountry)
          };
        });
        return {
          view,
          summary,
          matched: matches2.length,
          returned: providers.length,
          providers
        };
      }
      const tier = argNum(params.tier);
      const risk = argStr(params.risk);
      const platform = argStr(params.platform);
      const matches = outletNames.map(outletRecord).filter((o) => (tier === null || o.tier === tier) && (!risk || o.provenance.risk === risk) && (!platform || o.platformIdentities?.some((identity) => identity.platform === platform)) && (!query || ciIncludes(o.name, query)));
      const outlets = matches.slice(0, limit);
      return {
        view,
        summary,
        matched: matches.length,
        returned: outlets.length,
        outlets
      };
    },
    // Static registry read — no HTTP endpoint. Same shape as get_commodity_geo,
    // which the RpcToolDef contract names as the valid empty-_apiPaths case.
    _apiPaths: []
  },
  MEDIA_PERSPECTIVE_TOOL
];
export {
  SOURCE_TOOLS,
  outletRecord
};
