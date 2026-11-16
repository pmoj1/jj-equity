var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require2() {
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

// node_modules/@vercel/functions/headers.js
var require_headers = __commonJS({
  "node_modules/@vercel/functions/headers.js"(exports, module) {
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
    var headers_exports = {};
    __export3(headers_exports, {
      CITY_HEADER_NAME: () => CITY_HEADER_NAME,
      COUNTRY_HEADER_NAME: () => COUNTRY_HEADER_NAME,
      EMOJI_FLAG_UNICODE_STARTING_POSITION: () => EMOJI_FLAG_UNICODE_STARTING_POSITION,
      IP_HEADER_NAME: () => IP_HEADER_NAME,
      LATITUDE_HEADER_NAME: () => LATITUDE_HEADER_NAME,
      LONGITUDE_HEADER_NAME: () => LONGITUDE_HEADER_NAME,
      POSTAL_CODE_HEADER_NAME: () => POSTAL_CODE_HEADER_NAME,
      REGION_HEADER_NAME: () => REGION_HEADER_NAME,
      REQUEST_ID_HEADER_NAME: () => REQUEST_ID_HEADER_NAME,
      geolocation: () => geolocation2,
      ipAddress: () => ipAddress2
    });
    module.exports = __toCommonJS(headers_exports);
    var CITY_HEADER_NAME = "x-vercel-ip-city";
    var COUNTRY_HEADER_NAME = "x-vercel-ip-country";
    var IP_HEADER_NAME = "x-real-ip";
    var LATITUDE_HEADER_NAME = "x-vercel-ip-latitude";
    var LONGITUDE_HEADER_NAME = "x-vercel-ip-longitude";
    var REGION_HEADER_NAME = "x-vercel-ip-country-region";
    var POSTAL_CODE_HEADER_NAME = "x-vercel-ip-postal-code";
    var REQUEST_ID_HEADER_NAME = "x-vercel-id";
    var EMOJI_FLAG_UNICODE_STARTING_POSITION = 127397;
    function getHeader(headers, key) {
      return headers.get(key) ?? void 0;
    }
    function getHeaderWithDecode(request, key) {
      const header = getHeader(request.headers, key);
      return header ? decodeURIComponent(header) : void 0;
    }
    function getFlag(countryCode) {
      const regex = new RegExp("^[A-Z]{2}$").test(countryCode);
      if (!countryCode || !regex)
        return void 0;
      return String.fromCodePoint(
        ...countryCode.split("").map((char) => EMOJI_FLAG_UNICODE_STARTING_POSITION + char.charCodeAt(0))
      );
    }
    function ipAddress2(input) {
      const headers = "headers" in input ? input.headers : input;
      return getHeader(headers, IP_HEADER_NAME);
    }
    function getRegionFromRequestId(requestId) {
      if (!requestId) {
        return "dev1";
      }
      return requestId.split(":")[0];
    }
    function geolocation2(request) {
      return {
        // city name may be encoded to support multi-byte characters
        city: getHeaderWithDecode(request, CITY_HEADER_NAME),
        country: getHeader(request.headers, COUNTRY_HEADER_NAME),
        flag: getFlag(getHeader(request.headers, COUNTRY_HEADER_NAME)),
        countryRegion: getHeader(request.headers, REGION_HEADER_NAME),
        region: getRegionFromRequestId(
          getHeader(request.headers, REQUEST_ID_HEADER_NAME)
        ),
        latitude: getHeader(request.headers, LATITUDE_HEADER_NAME),
        longitude: getHeader(request.headers, LONGITUDE_HEADER_NAME),
        postalCode: getHeader(request.headers, POSTAL_CODE_HEADER_NAME)
      };
    }
  }
});

// node_modules/@vercel/functions/get-env.js
var require_get_env = __commonJS({
  "node_modules/@vercel/functions/get-env.js"(exports, module) {
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
    var get_env_exports = {};
    __export3(get_env_exports, {
      getEnv: () => getEnv2
    });
    module.exports = __toCommonJS(get_env_exports);
    var getEnv2 = (env = process.env) => ({
      /**
       * An indicator to show that System Environment Variables have been exposed to your project's Deployments.
       * @example "1"
       */
      VERCEL: get(env, "VERCEL"),
      /**
       * An indicator that the code is running in a Continuous Integration environment.
       * @example "1"
       */
      CI: get(env, "CI"),
      /**
       * The Environment that the app is deployed and running on.
       * @example "production"
       */
      VERCEL_ENV: get(env, "VERCEL_ENV"),
      /**
       * The domain name of the generated deployment URL. The value does not include the protocol scheme https://.
       * NOTE: This Variable cannot be used in conjunction with Standard Deployment Protection.
       * @example "*.vercel.app"
       */
      VERCEL_URL: get(env, "VERCEL_URL"),
      /**
       * The domain name of the generated Git branch URL. The value does not include the protocol scheme https://.
       * @example "*-git-*.vercel.app"
       */
      VERCEL_BRANCH_URL: get(env, "VERCEL_BRANCH_URL"),
      /**
       * A production domain name of the project. This is useful to reliably generate links that point to production such as OG-image URLs.
       * The value does not include the protocol scheme https://.
       * @example "myproject.vercel.app"
       */
      VERCEL_PROJECT_PRODUCTION_URL: get(env, "VERCEL_PROJECT_PRODUCTION_URL"),
      /**
       * The ID of the Region where the app is running.
       *
       * Possible values:
       * - arn1 (Stockholm, Sweden)
       * - bom1 (Mumbai, India)
       * - cdg1 (Paris, France)
       * - cle1 (Cleveland, USA)
       * - cpt1 (Cape Town, South Africa)
       * - dub1 (Dublin, Ireland)
       * - fra1 (Frankfurt, Germany)
       * - gru1 (São Paulo, Brazil)
       * - hkg1 (Hong Kong)
       * - hnd1 (Tokyo, Japan)
       * - iad1 (Washington, D.C., USA)
       * - icn1 (Seoul, South Korea)
       * - kix1 (Osaka, Japan)
       * - lhr1 (London, United Kingdom)
       * - pdx1 (Portland, USA)
       * - sfo1 (San Francisco, USA)
       * - sin1 (Singapore)
       * - syd1 (Sydney, Australia)
       * - dev1 (Development Region)
       *
       * @example "iad1"
       */
      VERCEL_REGION: get(env, "VERCEL_REGION"),
      /**
       * The unique identifier for the deployment, which can be used to implement Skew Protection.
       * @example "dpl_7Gw5ZMBpQA8h9GF832KGp7nwbuh3"
       */
      VERCEL_DEPLOYMENT_ID: get(env, "VERCEL_DEPLOYMENT_ID"),
      /**
       * When Skew Protection is enabled in Project Settings, this value is set to 1.
       * @example "1"
       */
      VERCEL_SKEW_PROTECTION_ENABLED: get(env, "VERCEL_SKEW_PROTECTION_ENABLED"),
      /**
       * The Protection Bypass for Automation value, if the secret has been generated in the project's Deployment Protection settings.
       */
      VERCEL_AUTOMATION_BYPASS_SECRET: get(env, "VERCEL_AUTOMATION_BYPASS_SECRET"),
      /**
       * The Git Provider the deployment is triggered from.
       * @example "github"
       */
      VERCEL_GIT_PROVIDER: get(env, "VERCEL_GIT_PROVIDER"),
      /**
       * The origin repository the deployment is triggered from.
       * @example "my-site"
       */
      VERCEL_GIT_REPO_SLUG: get(env, "VERCEL_GIT_REPO_SLUG"),
      /**
       * The account that owns the repository the deployment is triggered from.
       * @example "acme"
       */
      VERCEL_GIT_REPO_OWNER: get(env, "VERCEL_GIT_REPO_OWNER"),
      /**
       * The ID of the repository the deployment is triggered from.
       * @example "117716146"
       */
      VERCEL_GIT_REPO_ID: get(env, "VERCEL_GIT_REPO_ID"),
      /**
       * The git branch of the commit the deployment was triggered by.
       * @example "improve-about-page"
       */
      VERCEL_GIT_COMMIT_REF: get(env, "VERCEL_GIT_COMMIT_REF"),
      /**
       * The git SHA of the commit the deployment was triggered by.
       * @example "fa1eade47b73733d6312d5abfad33ce9e4068081"
       */
      VERCEL_GIT_COMMIT_SHA: get(env, "VERCEL_GIT_COMMIT_SHA"),
      /**
       * The message attached to the commit the deployment was triggered by.
       * @example "Update about page"
       */
      VERCEL_GIT_COMMIT_MESSAGE: get(env, "VERCEL_GIT_COMMIT_MESSAGE"),
      /**
       * The username attached to the author of the commit that the project was deployed by.
       * @example "johndoe"
       */
      VERCEL_GIT_COMMIT_AUTHOR_LOGIN: get(env, "VERCEL_GIT_COMMIT_AUTHOR_LOGIN"),
      /**
       * The name attached to the author of the commit that the project was deployed by.
       * @example "John Doe"
       */
      VERCEL_GIT_COMMIT_AUTHOR_NAME: get(env, "VERCEL_GIT_COMMIT_AUTHOR_NAME"),
      /**
       * The git SHA of the last successful deployment for the project and branch.
       * NOTE: This Variable is only exposed when an Ignored Build Step is provided.
       * @example "fa1eade47b73733d6312d5abfad33ce9e4068080"
       */
      VERCEL_GIT_PREVIOUS_SHA: get(env, "VERCEL_GIT_PREVIOUS_SHA"),
      /**
       * The pull request id the deployment was triggered by. If a deployment is created on a branch before a pull request is made, this value will be an empty string.
       * @example "23"
       */
      VERCEL_GIT_PULL_REQUEST_ID: get(env, "VERCEL_GIT_PULL_REQUEST_ID")
    });
    var get = (env, key) => {
      const value = env[key];
      return value === "" ? void 0 : value;
    };
  }
});

// node_modules/@vercel/functions/get-context.js
var require_get_context = __commonJS({
  "node_modules/@vercel/functions/get-context.js"(exports, module) {
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
    var get_context_exports = {};
    __export3(get_context_exports, {
      SYMBOL_FOR_REQ_CONTEXT: () => SYMBOL_FOR_REQ_CONTEXT,
      getContext: () => getContext
    });
    module.exports = __toCommonJS(get_context_exports);
    var SYMBOL_FOR_REQ_CONTEXT = /* @__PURE__ */ Symbol.for("@vercel/request-context");
    function getContext() {
      const fromSymbol = globalThis;
      return fromSymbol[SYMBOL_FOR_REQ_CONTEXT]?.get?.() ?? {};
    }
  }
});

// node_modules/@vercel/functions/wait-until.js
var require_wait_until = __commonJS({
  "node_modules/@vercel/functions/wait-until.js"(exports, module) {
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
    var wait_until_exports = {};
    __export3(wait_until_exports, {
      waitUntil: () => waitUntil2
    });
    module.exports = __toCommonJS(wait_until_exports);
    var import_get_context = require_get_context();
    var waitUntil2 = (promise) => {
      if (promise === null || typeof promise !== "object" || typeof promise.then !== "function") {
        throw new TypeError(
          `waitUntil can only be called with a Promise, got ${typeof promise}`
        );
      }
      return (0, import_get_context.getContext)().waitUntil?.(promise);
    };
  }
});

// node_modules/@vercel/functions/middleware.js
var require_middleware = __commonJS({
  "node_modules/@vercel/functions/middleware.js"(exports, module) {
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
    var middleware_exports = {};
    __export3(middleware_exports, {
      next: () => next2,
      rewrite: () => rewrite2
    });
    module.exports = __toCommonJS(middleware_exports);
    function handleMiddlewareField(init, headers) {
      if (init?.request?.headers) {
        if (!(init.request.headers instanceof Headers)) {
          throw new Error("request.headers must be an instance of Headers");
        }
        const keys = [];
        for (const [key, value] of init.request.headers) {
          headers.set("x-middleware-request-" + key, value);
          keys.push(key);
        }
        headers.set("x-middleware-override-headers", keys.join(","));
      }
    }
    function rewrite2(destination, init) {
      const headers = new Headers(init?.headers ?? {});
      headers.set("x-middleware-rewrite", String(destination));
      handleMiddlewareField(init, headers);
      return new Response(null, {
        ...init,
        headers
      });
    }
    function next2(init) {
      const headers = new Headers(init?.headers ?? {});
      headers.set("x-middleware-next", "1");
      handleMiddlewareField(init, headers);
      return new Response(null, {
        ...init,
        headers
      });
    }
  }
});

// node_modules/@vercel/functions/cache/in-memory-cache.js
var require_in_memory_cache = __commonJS({
  "node_modules/@vercel/functions/cache/in-memory-cache.js"(exports, module) {
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
    var in_memory_cache_exports = {};
    __export3(in_memory_cache_exports, {
      InMemoryCache: () => InMemoryCache
    });
    module.exports = __toCommonJS(in_memory_cache_exports);
    var InMemoryCache = class {
      constructor() {
        this.cache = {};
      }
      async get(key) {
        const entry = this.cache[key];
        if (entry) {
          if (entry.ttl && entry.lastModified + entry.ttl * 1e3 < Date.now()) {
            await this.delete(key);
            return null;
          }
          return JSON.parse(entry.value);
        }
        return null;
      }
      async set(key, value, options) {
        const serialized = JSON.stringify(value ?? null);
        this.cache[key] = {
          value: serialized,
          lastModified: Date.now(),
          ttl: options?.ttl,
          tags: new Set(options?.tags || [])
        };
      }
      async delete(key) {
        delete this.cache[key];
      }
      async expireTag(tag) {
        const tags = Array.isArray(tag) ? tag : [tag];
        for (const key in this.cache) {
          if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
            const entry = this.cache[key];
            if (tags.some((t) => entry.tags.has(t))) {
              delete this.cache[key];
            }
          }
        }
      }
    };
  }
});

// node_modules/@vercel/functions/cache/build-client.js
var require_build_client = __commonJS({
  "node_modules/@vercel/functions/cache/build-client.js"(exports, module) {
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
    var build_client_exports = {};
    __export3(build_client_exports, {
      BuildCache: () => BuildCache
    });
    module.exports = __toCommonJS(build_client_exports);
    var import_index = require_cache();
    var BuildCache = class {
      constructor({
        endpoint,
        headers,
        onError,
        timeout = 500
      }) {
        this.get = async (key) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);
          try {
            const res = await fetch(`${this.endpoint}${key}`, {
              headers: this.headers,
              method: "GET",
              signal: controller.signal
            });
            if (res.status === 404) {
              clearTimeout(timeoutId);
              return null;
            }
            if (res.status === 200) {
              const cacheState = res.headers.get(
                import_index.HEADERS_VERCEL_CACHE_STATE
              );
              if (cacheState !== import_index.PkgCacheState.Fresh) {
                res.body?.cancel?.();
                clearTimeout(timeoutId);
                return null;
              }
              const result = await res.json();
              clearTimeout(timeoutId);
              return result;
            } else {
              clearTimeout(timeoutId);
              throw new Error(`Failed to get cache: ${res.statusText}`);
            }
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
              const timeoutError = new Error(
                `Cache request timed out after ${this.timeout}ms`
              );
              timeoutError.stack = error.stack;
              this.onError?.(timeoutError);
            } else {
              this.onError?.(error);
            }
            return null;
          }
        };
        this.set = async (key, value, options) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);
          try {
            const optionalHeaders = {};
            if (options?.ttl) {
              optionalHeaders[import_index.HEADERS_VERCEL_REVALIDATE] = options.ttl.toString();
            }
            if (options?.tags && options.tags.length > 0) {
              optionalHeaders[import_index.HEADERS_VERCEL_CACHE_TAGS] = options.tags.join(",");
            }
            if (options?.name) {
              optionalHeaders[import_index.HEADERS_VERCEL_CACHE_ITEM_NAME] = options.name;
            }
            const res = await fetch(`${this.endpoint}${key}`, {
              method: "POST",
              headers: {
                ...this.headers,
                ...optionalHeaders
              },
              body: JSON.stringify(value),
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.status !== 200) {
              throw new Error(`Failed to set cache: ${res.status} ${res.statusText}`);
            }
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
              const timeoutError = new Error(
                `Cache request timed out after ${this.timeout}ms`
              );
              timeoutError.stack = error.stack;
              this.onError?.(timeoutError);
            } else {
              this.onError?.(error);
            }
          }
        };
        this.delete = async (key) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);
          try {
            const res = await fetch(`${this.endpoint}${key}`, {
              method: "DELETE",
              headers: this.headers,
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.status !== 200) {
              throw new Error(`Failed to delete cache: ${res.statusText}`);
            }
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
              const timeoutError = new Error(
                `Cache request timed out after ${this.timeout}ms`
              );
              timeoutError.stack = error.stack;
              this.onError?.(timeoutError);
            } else {
              this.onError?.(error);
            }
          }
        };
        this.expireTag = async (tag) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.timeout);
          try {
            if (Array.isArray(tag)) {
              tag = tag.join(",");
            }
            const res = await fetch(`${this.endpoint}revalidate?tags=${tag}`, {
              method: "POST",
              headers: this.headers,
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            if (res.status !== 200) {
              throw new Error(`Failed to revalidate tag: ${res.statusText}`);
            }
          } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === "AbortError") {
              const timeoutError = new Error(
                `Cache request timed out after ${this.timeout}ms`
              );
              timeoutError.stack = error.stack;
              this.onError?.(timeoutError);
            } else {
              this.onError?.(error);
            }
          }
        };
        this.endpoint = endpoint;
        this.headers = headers;
        this.onError = onError;
        this.timeout = timeout;
      }
    };
  }
});

// node_modules/@vercel/functions/cache/index.js
var require_cache = __commonJS({
  "node_modules/@vercel/functions/cache/index.js"(exports, module) {
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
    var cache_exports = {};
    __export3(cache_exports, {
      HEADERS_VERCEL_CACHE_ITEM_NAME: () => HEADERS_VERCEL_CACHE_ITEM_NAME,
      HEADERS_VERCEL_CACHE_STATE: () => HEADERS_VERCEL_CACHE_STATE,
      HEADERS_VERCEL_CACHE_TAGS: () => HEADERS_VERCEL_CACHE_TAGS,
      HEADERS_VERCEL_REVALIDATE: () => HEADERS_VERCEL_REVALIDATE,
      PkgCacheState: () => PkgCacheState,
      getCache: () => getCache2
    });
    module.exports = __toCommonJS(cache_exports);
    var import_get_context = require_get_context();
    var import_in_memory_cache = require_in_memory_cache();
    var import_build_client = require_build_client();
    var defaultKeyHashFunction = (key) => {
      let hash2 = 5381;
      for (let i = 0; i < key.length; i++) {
        hash2 = hash2 * 33 ^ key.charCodeAt(i);
      }
      return (hash2 >>> 0).toString(16);
    };
    var defaultNamespaceSeparator = "$";
    var inMemoryCacheInstance = null;
    var buildCacheInstance = null;
    var getCache2 = (cacheOptions) => {
      const resolveCache = () => {
        let cache;
        if ((0, import_get_context.getContext)().cache) {
          cache = (0, import_get_context.getContext)().cache;
        } else {
          cache = getCacheImplementation(
            process.env.SUSPENSE_CACHE_DEBUG === "true"
          );
        }
        return cache;
      };
      return wrapWithKeyTransformation(
        resolveCache,
        createKeyTransformer(cacheOptions)
      );
    };
    function createKeyTransformer(cacheOptions) {
      const hashFunction = cacheOptions?.keyHashFunction || defaultKeyHashFunction;
      return (key) => {
        if (!cacheOptions?.namespace)
          return hashFunction(key);
        const separator = cacheOptions.namespaceSeparator || defaultNamespaceSeparator;
        return `${cacheOptions.namespace}${separator}${hashFunction(key)}`;
      };
    }
    function wrapWithKeyTransformation(resolveCache, makeKey) {
      return {
        get: (key) => {
          return resolveCache().get(makeKey(key));
        },
        set: (key, value, options) => {
          return resolveCache().set(makeKey(key), value, {
            ...options,
            name: options?.name ?? key
          });
        },
        delete: (key) => {
          return resolveCache().delete(makeKey(key));
        },
        expireTag: (tag) => {
          return resolveCache().expireTag(tag);
        }
      };
    }
    var warnedCacheUnavailable = false;
    function getCacheImplementation(debug) {
      if (!inMemoryCacheInstance) {
        inMemoryCacheInstance = new import_in_memory_cache.InMemoryCache();
      }
      if (process.env.RUNTIME_CACHE_DISABLE_BUILD_CACHE === "true") {
        debug && console.log("Using InMemoryCache as build cache is disabled");
        return inMemoryCacheInstance;
      }
      const { RUNTIME_CACHE_ENDPOINT, RUNTIME_CACHE_HEADERS } = process.env;
      if (debug) {
        console.log("Runtime cache environment variables:", {
          RUNTIME_CACHE_ENDPOINT,
          RUNTIME_CACHE_HEADERS
        });
      }
      if (!RUNTIME_CACHE_ENDPOINT || !RUNTIME_CACHE_HEADERS) {
        if (!warnedCacheUnavailable) {
          console.warn(
            "Runtime Cache unavailable in this environment. Falling back to in-memory cache."
          );
          warnedCacheUnavailable = true;
        }
        return inMemoryCacheInstance;
      }
      if (!buildCacheInstance) {
        let parsedHeaders = {};
        try {
          parsedHeaders = JSON.parse(RUNTIME_CACHE_HEADERS);
        } catch (e) {
          console.error("Failed to parse RUNTIME_CACHE_HEADERS:", e);
          return inMemoryCacheInstance;
        }
        let timeout = 500;
        if (process.env.RUNTIME_CACHE_TIMEOUT) {
          const parsed = parseInt(process.env.RUNTIME_CACHE_TIMEOUT, 10);
          if (!isNaN(parsed) && parsed > 0) {
            timeout = parsed;
          } else {
            console.warn(
              `Invalid RUNTIME_CACHE_TIMEOUT value: "${process.env.RUNTIME_CACHE_TIMEOUT}". Using default: ${timeout}ms`
            );
          }
        }
        buildCacheInstance = new import_build_client.BuildCache({
          endpoint: RUNTIME_CACHE_ENDPOINT,
          headers: parsedHeaders,
          onError: (error) => console.error(error),
          timeout
        });
      }
      return buildCacheInstance;
    }
    var PkgCacheState = /* @__PURE__ */ ((PkgCacheState2) => {
      PkgCacheState2["Fresh"] = "fresh";
      PkgCacheState2["Stale"] = "stale";
      PkgCacheState2["Expired"] = "expired";
      PkgCacheState2["NotFound"] = "notFound";
      PkgCacheState2["Error"] = "error";
      return PkgCacheState2;
    })(PkgCacheState || {});
    var HEADERS_VERCEL_CACHE_STATE = "x-vercel-cache-state";
    var HEADERS_VERCEL_REVALIDATE = "x-vercel-revalidate";
    var HEADERS_VERCEL_CACHE_TAGS = "x-vercel-cache-tags";
    var HEADERS_VERCEL_CACHE_ITEM_NAME = "x-vercel-cache-item-name";
  }
});

// node_modules/@vercel/functions/db-connections/index.js
var require_db_connections = __commonJS({
  "node_modules/@vercel/functions/db-connections/index.js"(exports, module) {
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
    var db_connections_exports = {};
    __export3(db_connections_exports, {
      attachDatabasePool: () => attachDatabasePool2,
      experimental_attachDatabasePool: () => experimental_attachDatabasePool2
    });
    module.exports = __toCommonJS(db_connections_exports);
    var import_get_context = require_get_context();
    var DEBUG = !!process.env.DEBUG;
    function getIdleTimeout(dbPool) {
      if ("options" in dbPool && dbPool.options) {
        if ("idleTimeoutMillis" in dbPool.options) {
          return typeof dbPool.options.idleTimeoutMillis === "number" ? dbPool.options.idleTimeoutMillis : 1e4;
        }
        if ("maxIdleTimeMS" in dbPool.options) {
          return typeof dbPool.options.maxIdleTimeMS === "number" ? dbPool.options.maxIdleTimeMS : 0;
        }
        if ("status" in dbPool) {
          return 5e3;
        }
        if ("connect" in dbPool && "execute" in dbPool) {
          return 3e4;
        }
      }
      if ("config" in dbPool && dbPool.config) {
        if ("connectionConfig" in dbPool.config && dbPool.config.connectionConfig) {
          return dbPool.config.connectionConfig.idleTimeout || 6e4;
        }
        if ("idleTimeout" in dbPool.config) {
          return typeof dbPool.config.idleTimeout === "number" ? dbPool.config.idleTimeout : 6e4;
        }
      }
      if ("poolTimeout" in dbPool) {
        return typeof dbPool.poolTimeout === "number" ? dbPool.poolTimeout : 6e4;
      }
      if ("idleTimeout" in dbPool) {
        return typeof dbPool.idleTimeout === "number" ? dbPool.idleTimeout : 0;
      }
      return 1e4;
    }
    var idleTimeout = null;
    var idleTimeoutResolve = () => {
    };
    var bootTime = Date.now();
    var maximumDuration = 15 * 60 * 1e3 - 1e3;
    function waitUntilIdleTimeout(dbPool) {
      if (!process.env.VERCEL_URL || // This is not set during builds where we don't need to wait for idle connections using the mechanism
      !process.env.VERCEL_REGION) {
        return;
      }
      if (idleTimeout) {
        clearTimeout(idleTimeout);
        idleTimeoutResolve();
      }
      const promise = new Promise((resolve) => {
        idleTimeoutResolve = resolve;
      });
      const waitTime = Math.min(
        getIdleTimeout(dbPool) + 100,
        Math.max(100, maximumDuration - (Date.now() - bootTime))
      );
      idleTimeout = setTimeout(() => {
        idleTimeoutResolve?.();
        if (DEBUG) {
          console.log("Database pool idle timeout reached. Releasing connections.");
        }
      }, waitTime);
      const requestContext = (0, import_get_context.getContext)();
      if (requestContext?.waitUntil) {
        requestContext.waitUntil(promise);
      } else {
        console.warn("Pool release event triggered outside of request scope.");
      }
    }
    function attachDatabasePool2(dbPool) {
      if (idleTimeout) {
        idleTimeoutResolve?.();
        clearTimeout(idleTimeout);
      }
      if ("on" in dbPool && dbPool.on && "options" in dbPool && "idleTimeoutMillis" in dbPool.options) {
        const pgPool = dbPool;
        pgPool.on("release", () => {
          if (DEBUG) {
            console.log("Client released from pool");
          }
          waitUntilIdleTimeout(dbPool);
        });
        return;
      } else if ("on" in dbPool && dbPool.on && "config" in dbPool && dbPool.config && "connectionConfig" in dbPool.config) {
        const mysqlPool = dbPool;
        mysqlPool.on("release", () => {
          if (DEBUG) {
            console.log("MySQL client released from pool");
          }
          waitUntilIdleTimeout(dbPool);
        });
        return;
      } else if ("on" in dbPool && dbPool.on && "config" in dbPool && dbPool.config && "idleTimeout" in dbPool.config) {
        const mysql2Pool = dbPool;
        mysql2Pool.on("release", () => {
          if (DEBUG) {
            console.log("MySQL2/MariaDB client released from pool");
          }
          waitUntilIdleTimeout(dbPool);
        });
        return;
      }
      if ("on" in dbPool && dbPool.on && "options" in dbPool && dbPool.options && "maxIdleTimeMS" in dbPool.options) {
        const mongoPool = dbPool;
        mongoPool.on("connectionCheckedOut", () => {
          if (DEBUG) {
            console.log("MongoDB connection checked out");
          }
          waitUntilIdleTimeout(dbPool);
        });
        return;
      }
      if ("on" in dbPool && dbPool.on && "options" in dbPool && dbPool.options && "socket" in dbPool.options) {
        const redisPool = dbPool;
        redisPool.on("end", () => {
          if (DEBUG) {
            console.log("Redis connection ended");
          }
          waitUntilIdleTimeout(dbPool);
        });
        return;
      }
      throw new Error("Unsupported database pool type");
    }
    var experimental_attachDatabasePool2 = attachDatabasePool2;
  }
});

// node_modules/@vercel/functions/purge/index.js
var require_purge = __commonJS({
  "node_modules/@vercel/functions/purge/index.js"(exports, module) {
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
    var purge_exports = {};
    __export3(purge_exports, {
      dangerouslyDeleteBySrcImage: () => dangerouslyDeleteBySrcImage2,
      dangerouslyDeleteByTag: () => dangerouslyDeleteByTag2,
      invalidateBySrcImage: () => invalidateBySrcImage2,
      invalidateByTag: () => invalidateByTag2
    });
    module.exports = __toCommonJS(purge_exports);
    var import_get_context = require_get_context();
    var invalidateByTag2 = (tag) => {
      const api = (0, import_get_context.getContext)().purge;
      if (api) {
        return api.invalidateByTag(tag);
      }
      return Promise.resolve();
    };
    var dangerouslyDeleteByTag2 = (tag, options) => {
      const api = (0, import_get_context.getContext)().purge;
      if (api) {
        return api.dangerouslyDeleteByTag(tag, options);
      }
      return Promise.resolve();
    };
    var invalidateBySrcImage2 = (src) => {
      const api = (0, import_get_context.getContext)().purge;
      return api ? api.invalidateBySrcImage(src) : Promise.resolve();
    };
    var dangerouslyDeleteBySrcImage2 = (src, options) => {
      const api = (0, import_get_context.getContext)().purge;
      return api ? api.dangerouslyDeleteBySrcImage(src, options) : Promise.resolve();
    };
  }
});

// node_modules/@vercel/functions/addcachetag/index.js
var require_addcachetag = __commonJS({
  "node_modules/@vercel/functions/addcachetag/index.js"(exports, module) {
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
    var addcachetag_exports = {};
    __export3(addcachetag_exports, {
      addCacheTag: () => addCacheTag2
    });
    module.exports = __toCommonJS(addcachetag_exports);
    var import_get_context = require_get_context();
    var addCacheTag2 = (tag) => {
      const addCacheTag22 = (0, import_get_context.getContext)().addCacheTag;
      if (addCacheTag22) {
        return addCacheTag22(tag);
      }
      return Promise.resolve();
    };
  }
});

// node_modules/ws/lib/constants.js
var require_constants = __commonJS({
  "node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: /* @__PURE__ */ Symbol("kIsForOnEventAttribute"),
      kListener: /* @__PURE__ */ Symbol("kListener"),
      kStatusCode: /* @__PURE__ */ Symbol("status-code"),
      kWebSocket: /* @__PURE__ */ Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});

// node_modules/node-gyp-build/node-gyp-build.js
var require_node_gyp_build = __commonJS({
  "node_modules/node-gyp-build/node-gyp-build.js"(exports, module) {
    var fs = __require("fs");
    var path = __require("path");
    var os = __require("os");
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
    var vars = process.config && process.config.variables || {};
    var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
    var abi = process.versions.modules;
    var runtime = isElectron() ? "electron" : isNwjs() ? "node-webkit" : "node";
    var arch = process.env.npm_config_arch || os.arch();
    var platform = process.env.npm_config_platform || os.platform();
    var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
    var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars.arm_version) || "";
    var uv = (process.versions.uv || "").split(".")[0];
    module.exports = load;
    function load(dir) {
      return runtimeRequire(load.resolve(dir));
    }
    load.resolve = load.path = function(dir) {
      dir = path.resolve(dir || ".");
      try {
        var name = runtimeRequire(path.join(dir, "package.json")).name.toUpperCase().replace(/-/g, "_");
        if (process.env[name + "_PREBUILD"]) dir = process.env[name + "_PREBUILD"];
      } catch (err) {
      }
      if (!prebuildsOnly) {
        var release = getFirst(path.join(dir, "build/Release"), matchBuild);
        if (release) return release;
        var debug = getFirst(path.join(dir, "build/Debug"), matchBuild);
        if (debug) return debug;
      }
      var prebuild = resolve(dir);
      if (prebuild) return prebuild;
      var nearby = resolve(path.dirname(process.execPath));
      if (nearby) return nearby;
      var target = [
        "platform=" + platform,
        "arch=" + arch,
        "runtime=" + runtime,
        "abi=" + abi,
        "uv=" + uv,
        armv ? "armv=" + armv : "",
        "libc=" + libc,
        "node=" + process.versions.node,
        process.versions.electron ? "electron=" + process.versions.electron : "",
        typeof __webpack_require__ === "function" ? "webpack=true" : ""
        // eslint-disable-line
      ].filter(Boolean).join(" ");
      throw new Error("No native build was found for " + target + "\n    loaded from: " + dir + "\n");
      function resolve(dir2) {
        var tuples = readdirSync(path.join(dir2, "prebuilds")).map(parseTuple);
        var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
        if (!tuple) return;
        var prebuilds = path.join(dir2, "prebuilds", tuple.name);
        var parsed = readdirSync(prebuilds).map(parseTags);
        var candidates = parsed.filter(matchTags(runtime, abi));
        var winner = candidates.sort(compareTags(runtime))[0];
        if (winner) return path.join(prebuilds, winner.file);
      }
    };
    function readdirSync(dir) {
      try {
        return fs.readdirSync(dir);
      } catch (err) {
        return [];
      }
    }
    function getFirst(dir, filter) {
      var files = readdirSync(dir).filter(filter);
      return files[0] && path.join(dir, files[0]);
    }
    function matchBuild(name) {
      return /\.node$/.test(name);
    }
    function parseTuple(name) {
      var arr = name.split("-");
      if (arr.length !== 2) return;
      var platform2 = arr[0];
      var architectures = arr[1].split("+");
      if (!platform2) return;
      if (!architectures.length) return;
      if (!architectures.every(Boolean)) return;
      return { name, platform: platform2, architectures };
    }
    function matchTuple(platform2, arch2) {
      return function(tuple) {
        if (tuple == null) return false;
        if (tuple.platform !== platform2) return false;
        return tuple.architectures.includes(arch2);
      };
    }
    function compareTuples(a, b) {
      return a.architectures.length - b.architectures.length;
    }
    function parseTags(file) {
      var arr = file.split(".");
      var extension2 = arr.pop();
      var tags = { file, specificity: 0 };
      if (extension2 !== "node") return;
      for (var i = 0; i < arr.length; i++) {
        var tag = arr[i];
        if (tag === "node" || tag === "electron" || tag === "node-webkit") {
          tags.runtime = tag;
        } else if (tag === "napi") {
          tags.napi = true;
        } else if (tag.slice(0, 3) === "abi") {
          tags.abi = tag.slice(3);
        } else if (tag.slice(0, 2) === "uv") {
          tags.uv = tag.slice(2);
        } else if (tag.slice(0, 4) === "armv") {
          tags.armv = tag.slice(4);
        } else if (tag === "glibc" || tag === "musl") {
          tags.libc = tag;
        } else {
          continue;
        }
        tags.specificity++;
      }
      return tags;
    }
    function matchTags(runtime2, abi2) {
      return function(tags) {
        if (tags == null) return false;
        if (tags.runtime && tags.runtime !== runtime2 && !runtimeAgnostic(tags)) return false;
        if (tags.abi && tags.abi !== abi2 && !tags.napi) return false;
        if (tags.uv && tags.uv !== uv) return false;
        if (tags.armv && tags.armv !== armv) return false;
        if (tags.libc && tags.libc !== libc) return false;
        return true;
      };
    }
    function runtimeAgnostic(tags) {
      return tags.runtime === "node" && tags.napi;
    }
    function compareTags(runtime2) {
      return function(a, b) {
        if (a.runtime !== b.runtime) {
          return a.runtime === runtime2 ? -1 : 1;
        } else if (a.abi !== b.abi) {
          return a.abi ? -1 : 1;
        } else if (a.specificity !== b.specificity) {
          return a.specificity > b.specificity ? -1 : 1;
        } else {
          return 0;
        }
      };
    }
    function isNwjs() {
      return !!(process.versions && process.versions.nw);
    }
    function isElectron() {
      if (process.versions && process.versions.electron) return true;
      if (process.env.ELECTRON_RUN_AS_NODE) return true;
      return typeof window !== "undefined" && window.process && window.process.type === "renderer";
    }
    function isAlpine(platform2) {
      return platform2 === "linux" && fs.existsSync("/etc/alpine-release");
    }
    load.parseTags = parseTags;
    load.matchTags = matchTags;
    load.compareTags = compareTags;
    load.parseTuple = parseTuple;
    load.matchTuple = matchTuple;
    load.compareTuples = compareTuples;
  }
});

// node_modules/node-gyp-build/index.js
var require_node_gyp_build2 = __commonJS({
  "node_modules/node-gyp-build/index.js"(exports, module) {
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
    if (typeof runtimeRequire.addon === "function") {
      module.exports = runtimeRequire.addon.bind(runtimeRequire);
    } else {
      module.exports = require_node_gyp_build();
    }
  }
});

// node_modules/bufferutil/fallback.js
var require_fallback = __commonJS({
  "node_modules/bufferutil/fallback.js"(exports, module) {
    "use strict";
    var mask = (source, mask2, output, offset, length) => {
      for (var i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask2[i & 3];
      }
    };
    var unmask = (buffer, mask2) => {
      const length = buffer.length;
      for (var i = 0; i < length; i++) {
        buffer[i] ^= mask2[i & 3];
      }
    };
    module.exports = { mask, unmask };
  }
});

// node_modules/bufferutil/index.js
var require_bufferutil = __commonJS({
  "node_modules/bufferutil/index.js"(exports, module) {
    "use strict";
    try {
      module.exports = require_node_gyp_build2()(__dirname);
    } catch (e) {
      module.exports = require_fallback();
    }
  }
});

// node_modules/ws/lib/buffer-util.js
var require_buffer_util = __commonJS({
  "node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require_bufferutil();
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/limiter.js
var require_limiter = __commonJS({
  "node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = /* @__PURE__ */ Symbol("kDone");
    var kRun = /* @__PURE__ */ Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});

// node_modules/ws/lib/permessage-deflate.js
var require_permessage_deflate = __commonJS({
  "node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = /* @__PURE__ */ Symbol("permessage-deflate");
    var kTotalLength = /* @__PURE__ */ Symbol("total-length");
    var kCallback = /* @__PURE__ */ Symbol("callback");
    var kBuffers = /* @__PURE__ */ Symbol("buffers");
    var kError = /* @__PURE__ */ Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num = +value;
                if (!Number.isInteger(num) || num < 8 || num > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num = +value;
              if (!Number.isInteger(num) || num < 8 || num > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});

// node_modules/utf-8-validate/fallback.js
var require_fallback2 = __commonJS({
  "node_modules/utf-8-validate/fallback.js"(exports, module) {
    "use strict";
    function isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    module.exports = isValidUTF8;
  }
});

// node_modules/utf-8-validate/index.js
var require_utf_8_validate = __commonJS({
  "node_modules/utf-8-validate/index.js"(exports, module) {
    "use strict";
    try {
      module.exports = require_node_gyp_build2()(__dirname);
    } catch (e) {
      module.exports = require_fallback2();
    }
  }
});

// node_modules/ws/lib/validation.js
var require_validation = __commonJS({
  "node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code) {
      return code >= 1e3 && code <= 1014 && code !== 1004 && code !== 1005 && code !== 1006 || code >= 3e3 && code <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = require_utf_8_validate();
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});

// node_modules/ws/lib/receiver.js
var require_receiver = __commonJS({
  "node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num = buf.readUInt32BE(0);
        if (num > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
            const error = this.createError(
              RangeError,
              "Too many message fragments",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            );
            cb(error);
            return;
          }
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
              const error = this.createError(
                RangeError,
                "Too many message fragments",
                false,
                1008,
                "WS_ERR_TOO_MANY_BUFFERED_PARTS"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code = data.readUInt16BE(0);
            if (!isValidStatusCode(code)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});

// node_modules/ws/lib/sender.js
var require_sender = __commonJS({
  "node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var {
      types: { isUint8Array }
    } = __require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = /* @__PURE__ */ Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge2 = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge2 = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge2 ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge2) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code, data, mask, cb) {
        let buf;
        if (code === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code !== "number" || !isValidStatusCode(code)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});

// node_modules/ws/lib/event-target.js
var require_event_target = __commonJS({
  "node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = /* @__PURE__ */ Symbol("kCode");
    var kData = /* @__PURE__ */ Symbol("kData");
    var kError = /* @__PURE__ */ Symbol("kError");
    var kMessage = /* @__PURE__ */ Symbol("kMessage");
    var kReason = /* @__PURE__ */ Symbol("kReason");
    var kTarget = /* @__PURE__ */ Symbol("kTarget");
    var kType = /* @__PURE__ */ Symbol("kType");
    var kWasClean = /* @__PURE__ */ Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget2 = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler2, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler2 && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code, message) {
            const event = new CloseEvent("close", {
              code,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler2;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler2) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler2 && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget: EventTarget2,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});

// node_modules/ws/lib/extension.js
var require_extension = __commonJS({
  "node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code === 32 || code === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (code === 32 || code === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code] === 1) {
              if (start === -1) start = i;
            } else if (code === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code === 32 || code === 9)) {
            if (end === -1) end = i;
          } else if (code === 59 || code === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code === 32 || code === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v) => v === true ? k : `${k}=${v}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse };
  }
});

// node_modules/ws/lib/websocket.js
var require_websocket = __commonJS({
  "node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL: URL2 } = __require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = /* @__PURE__ */ Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler2) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler2 !== "function") return;
          this.addEventListener(method, handler2, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 1024 * 1024,
        maxFragments: 128 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code === 1005) websocket.close();
      else websocket.close(code, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});

// node_modules/ws/lib/stream.js
var require_stream = __commonJS({
  "node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});

// node_modules/ws/lib/subprotocol.js
var require_subprotocol = __commonJS({
  "node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code = header.charCodeAt(i);
        if (end === -1 && tokenChars[code] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code === 32 || code === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse };
  }
});

// node_modules/ws/lib/websocket-server.js
var require_websocket_server = __commonJS({
  "node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash } = __require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=1048576] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=131072] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 1024 * 1024,
          maxFragments: 128 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version !== 13 && version !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code, message, headers) {
      message = message || http.STATUS_CODES[code];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\r
` + Object.keys(headers).map((h) => `${h}: ${headers[h]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code, message, headers);
      }
    }
  }
});

// node_modules/ws/wrapper.mjs
var wrapper_exports = {};
__export(wrapper_exports, {
  PerMessageDeflate: () => import_permessage_deflate.default,
  Receiver: () => import_receiver.default,
  Sender: () => import_sender.default,
  WebSocket: () => import_websocket.default,
  WebSocketServer: () => import_websocket_server.default,
  createWebSocketStream: () => import_stream.default,
  default: () => wrapper_default,
  extension: () => import_extension.default,
  subprotocol: () => import_subprotocol.default
});
var import_stream, import_extension, import_permessage_deflate, import_receiver, import_sender, import_subprotocol, import_websocket, import_websocket_server, wrapper_default;
var init_wrapper = __esm({
  "node_modules/ws/wrapper.mjs"() {
    import_stream = __toESM(require_stream(), 1);
    import_extension = __toESM(require_extension(), 1);
    import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
    import_receiver = __toESM(require_receiver(), 1);
    import_sender = __toESM(require_sender(), 1);
    import_subprotocol = __toESM(require_subprotocol(), 1);
    import_websocket = __toESM(require_websocket(), 1);
    import_websocket_server = __toESM(require_websocket_server(), 1);
    wrapper_default = import_websocket.default;
  }
});

// node_modules/@vercel/functions/websocket/index.js
var require_websocket2 = __commonJS({
  "node_modules/@vercel/functions/websocket/index.js"(exports, module) {
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
    var websocket_exports = {};
    __export3(websocket_exports, {
      experimental_upgradeWebSocket: () => experimental_upgradeWebSocket2
    });
    module.exports = __toCommonJS(websocket_exports);
    var import_get_context = require_get_context();
    var DEFAULT_MAX_PAYLOAD = 256 * 1024;
    async function loadWebSocketServer() {
      try {
        const ws = await Promise.resolve().then(() => (init_wrapper(), wrapper_exports));
        return ws.WebSocketServer;
      } catch {
        throw new Error(
          'The "ws" package is required for experimental_upgradeWebSocket(). Install it with: npm install ws'
        );
      }
    }
    async function experimental_upgradeWebSocket2(handler2, options = {}) {
      const ctx = (0, import_get_context.getContext)();
      if (typeof ctx.upgradeWebSocket !== "function") {
        throw new Error(
          "experimental_upgradeWebSocket is not available in the current runtime environment. This feature requires a Vercel runtime that supports WebSocket upgrades."
        );
      }
      const WebSocketServer2 = await loadWebSocketServer();
      const { req, socket, head } = ctx.upgradeWebSocket();
      const wss = new WebSocketServer2({
        noServer: true,
        maxPayload: options.maxPayload ?? DEFAULT_MAX_PAYLOAD
      });
      const ws = await new Promise((resolve, reject) => {
        const cleanup = () => {
          socket.removeListener("error", onError);
          socket.removeListener("close", onClose);
        };
        const rejectUpgrade = (err) => {
          cleanup();
          if (err instanceof Error) {
            reject(err);
            return;
          }
          const error = new Error("WebSocket upgrade failed");
          error.cause = err;
          reject(error);
        };
        const resolveUpgrade = (ws2) => {
          cleanup();
          resolve(ws2);
        };
        const onError = (err) => rejectUpgrade(err);
        const onClose = () => rejectUpgrade(
          new Error("socket closed before the WebSocket upgrade completed")
        );
        socket.once("error", onError);
        socket.once("close", onClose);
        try {
          wss.handleUpgrade(req, socket, head, resolveUpgrade);
        } catch (err) {
          rejectUpgrade(err);
        }
      });
      try {
        await handler2(ws);
      } catch (err) {
        ws.close(1011, "WebSocket handler failed");
        throw err;
      }
      return new Response(null, { status: 204 });
    }
  }
});

// node_modules/@vercel/functions/index.js
var require_functions = __commonJS({
  "node_modules/@vercel/functions/index.js"(exports, module) {
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
      addCacheTag: () => import_addcachetag.addCacheTag,
      attachDatabasePool: () => import_db_connections.attachDatabasePool,
      dangerouslyDeleteBySrcImage: () => import_purge.dangerouslyDeleteBySrcImage,
      dangerouslyDeleteByTag: () => import_purge.dangerouslyDeleteByTag,
      experimental_attachDatabasePool: () => import_db_connections.experimental_attachDatabasePool,
      experimental_upgradeWebSocket: () => import_websocket2.experimental_upgradeWebSocket,
      geolocation: () => import_headers.geolocation,
      getCache: () => import_cache.getCache,
      getEnv: () => import_get_env.getEnv,
      invalidateBySrcImage: () => import_purge.invalidateBySrcImage,
      invalidateByTag: () => import_purge.invalidateByTag,
      ipAddress: () => import_headers.ipAddress,
      next: () => import_middleware.next,
      rewrite: () => import_middleware.rewrite,
      waitUntil: () => import_wait_until.waitUntil
    });
    module.exports = __toCommonJS(src_exports);
    var import_headers = require_headers();
    var import_get_env = require_get_env();
    var import_wait_until = require_wait_until();
    var import_middleware = require_middleware();
    var import_cache = require_cache();
    var import_db_connections = require_db_connections();
    var import_purge = require_purge();
    var import_addcachetag = require_addcachetag();
    var import_websocket2 = require_websocket2();
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
    var Ratelimit = class {
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
    var MultiRegionRatelimit = class extends Ratelimit {
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
      static fixedWindow(tokens, window2) {
        const windowDuration = ms(window2);
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
      static slidingWindow(tokens, window2) {
        const windowSize = ms(window2);
        const windowDuration = ms(window2);
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
    var RegionRatelimit = class extends Ratelimit {
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
      static fixedWindow(tokens, window2) {
        const windowDuration = ms(window2);
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
      static slidingWindow(tokens, window2) {
        const windowSize = ms(window2);
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
      static cachedFixedWindow(tokens, window2) {
        const windowDuration = ms(window2);
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
          const decoder = new TextDecoder();
          (async () => {
            try {
              let buffer = "";
              while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
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
              const message = this.opts?.automaticDeserialization === false ? messageStr : JSON.parse(messageStr);
              this.dispatchToListeners("pmessage", { pattern, channel, message });
              this.dispatchToListeners(`pmessage:${pattern}`, { pattern, channel, message });
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
                const message = this.opts?.automaticDeserialization === false ? messageStr : parseWithTryCatch(messageStr);
                this.dispatchToListeners(type, { channel, message });
                this.dispatchToListeners(`${type}:${channel}`, { channel, message });
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

// api/_wildfire-dashboard.js
var WILDFIRE_DASHBOARD_DETECTION_LIMIT = 500;
var WILDFIRE_BOOTSTRAP_CWFIS_RESERVED = 50;
var WILDFIRE_CWFIS_SOURCE = "cwfis";
function numeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}
function confidenceRank(confidence) {
  switch (confidence) {
    case "FIRE_CONFIDENCE_HIGH":
      return 3;
    case "FIRE_CONFIDENCE_NOMINAL":
      return 2;
    case "FIRE_CONFIDENCE_LOW":
      return 1;
    default:
      return 0;
  }
}
function compareFireDetectionsForDashboard(a, b) {
  return Number(Boolean(b?.possibleExplosion)) - Number(Boolean(a?.possibleExplosion)) || confidenceRank(b?.confidence) - confidenceRank(a?.confidence) || numeric(b?.brightness) - numeric(a?.brightness) || numeric(b?.frp) - numeric(a?.frp) || numeric(b?.detectedAt) - numeric(a?.detectedAt);
}
function compareCwfisForReservation(a, b) {
  return numeric(b?.fireSize) - numeric(a?.fireSize) || numeric(b?.detectedAt) - numeric(a?.detectedAt) || compareFireDetectionsForDashboard(a, b);
}
function isCwfisDetection(detection) {
  return detection?.source === WILDFIRE_CWFIS_SOURCE;
}
function isDashboardEmergencyFire(detection) {
  if (!detection || typeof detection !== "object") return false;
  if (detection.kind === "prescribed") return false;
  if (detection.emergency === false) return false;
  if (detection.fireWasPrescribed === 1 || detection.fireWasPrescribed === true) return false;
  return true;
}
function limitFireDetectionsForDashboard(detections, limit = WILDFIRE_DASHBOARD_DETECTION_LIMIT) {
  if (!Array.isArray(detections)) return detections;
  const pool = limit === WILDFIRE_DASHBOARD_DETECTION_LIMIT ? detections.filter(isDashboardEmergencyFire) : detections;
  if (pool.length <= limit) return pool;
  if (limit !== WILDFIRE_DASHBOARD_DETECTION_LIMIT) {
    return [...pool].sort(compareFireDetectionsForDashboard).slice(0, limit);
  }
  const cwfis = [];
  const others = [];
  for (const detection of pool) {
    if (isCwfisDetection(detection)) cwfis.push(detection);
    else others.push(detection);
  }
  const reservedCount = Math.min(WILDFIRE_BOOTSTRAP_CWFIS_RESERVED, limit, cwfis.length);
  const keptCwfis = [...cwfis].sort(compareCwfisForReservation).slice(0, reservedCount);
  const keptOthers = [...others].sort(compareFireDetectionsForDashboard).slice(0, limit - reservedCount);
  return [...keptCwfis, ...keptOthers].sort(compareFireDetectionsForDashboard);
}
function trimFireDetectionsToByteBudget(detections, {
  maxBytes,
  measureBytes,
  totalCount = detections.length
} = {}) {
  if (!Array.isArray(detections) || typeof measureBytes !== "function" || !Number.isFinite(maxBytes)) {
    return detections;
  }
  const wrap = (slice) => ({
    fireDetections: slice,
    pagination: { nextCursor: "", totalCount }
  });
  if (measureBytes(wrap(detections)) <= maxBytes) return detections;
  let lo = 0;
  let hi = detections.length;
  let best = 0;
  while (lo <= hi) {
    const mid = lo + hi >> 1;
    if (measureBytes(wrap(detections.slice(0, mid))) <= maxBytes) {
      best = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return detections.slice(0, best);
}
function compactWildfireDashboardPayload(value, limit = WILDFIRE_DASHBOARD_DETECTION_LIMIT, options = {}) {
  if (!value || typeof value !== "object" || !Array.isArray(value.fireDetections)) return value;
  if (limit === WILDFIRE_DASHBOARD_DETECTION_LIMIT) {
    const { fireDetections: fireDetections2, pagination, fetchedAt, dataAvailable } = value;
    value = { fireDetections: fireDetections2, pagination, fetchedAt, dataAvailable };
  }
  const needsCountCap = value.fireDetections.length > limit;
  const needsDashboardFilter = limit === WILDFIRE_DASHBOARD_DETECTION_LIMIT;
  const needsByteCap = Number.isFinite(options.maxBytes) && typeof options.measureBytes === "function";
  if (!needsCountCap && !needsDashboardFilter && !needsByteCap) return value;
  const totalCount = Math.max(numeric(value.pagination?.totalCount), value.fireDetections.length);
  let fireDetections = needsCountCap || needsDashboardFilter ? limitFireDetectionsForDashboard(value.fireDetections, limit) : value.fireDetections;
  if (needsByteCap) {
    fireDetections = trimFireDetectionsToByteBudget(fireDetections, {
      maxBytes: options.maxBytes,
      measureBytes: (candidate) => options.measureBytes({ ...value, ...candidate }),
      totalCount
    });
  }
  if (fireDetections === value.fireDetections) return value;
  return {
    ...value,
    fireDetections,
    pagination: { nextCursor: "", totalCount }
  };
}

// api/_natural-events-dashboard.js
var NATURAL_EVENTS_CONE_SIMPLIFY_TOLERANCE_DEG = 0.05;
var NATURAL_EVENTS_CONE_COORD_DECIMALS = 4;
var NATURAL_EVENTS_CONE_MAX_POINTS = 96;
function compactCoord(value) {
  return Number.isFinite(value) ? Number(value.toFixed(NATURAL_EVENTS_CONE_COORD_DECIMALS)) : value;
}
function toLonLat(point) {
  if (Array.isArray(point) && Number.isFinite(point[0]) && Number.isFinite(point[1])) {
    return { lon: point[0], lat: point[1] };
  }
  if (point && typeof point === "object" && !Array.isArray(point)) {
    const lon = Number(point.lon);
    const lat = Number(point.lat);
    if (Number.isFinite(lon) && Number.isFinite(lat)) return { lon, lat };
  }
  return null;
}
function ringPoints(ring) {
  if (Array.isArray(ring)) return ring;
  if (ring && typeof ring === "object" && Array.isArray(ring.points)) return ring.points;
  return null;
}
function samePoint(a, b) {
  return a.lon === b.lon && a.lat === b.lat;
}
function perpendicularDistance(point, start, end) {
  const dx = end.lon - start.lon;
  const dy = end.lat - start.lat;
  const denom = Math.hypot(dx, dy);
  if (denom === 0) return Math.hypot(point.lon - start.lon, point.lat - start.lat);
  return Math.abs(dy * point.lon - dx * point.lat + end.lon * start.lat - end.lat * start.lon) / denom;
}
function rdp(points, tolerance) {
  if (points.length <= 2) return points.slice();
  const keep = new Array(points.length).fill(false);
  keep[0] = true;
  keep[points.length - 1] = true;
  const stack = [[0, points.length - 1]];
  while (stack.length > 0) {
    const segment = stack.pop();
    const startIndex = segment[0];
    const endIndex = segment[1];
    if (endIndex - startIndex <= 1) continue;
    const first = points[startIndex];
    const last = points[endIndex];
    let index = 0;
    let maxDist = 0;
    for (let i = startIndex + 1; i < endIndex; i += 1) {
      const distance = perpendicularDistance(points[i], first, last);
      if (distance > maxDist) {
        maxDist = distance;
        index = i;
      }
    }
    if (maxDist > tolerance) {
      keep[index] = true;
      stack.push([startIndex, index], [index, endIndex]);
    }
  }
  return points.filter((_, i) => keep[i]);
}
function simplifyClosedRing(points, tolerance) {
  if (tolerance <= 0 || points.length <= 5) return points.slice();
  const closed = samePoint(points[0], points[points.length - 1]);
  const open = closed ? points.slice(0, -1) : points.slice();
  if (open.length <= 4) return points.slice();
  let far = 0;
  let farDist = -1;
  for (let i = 1; i < open.length; i += 1) {
    const distance = Math.hypot(open[i].lon - open[0].lon, open[i].lat - open[0].lat);
    if (distance > farDist) {
      farDist = distance;
      far = i;
    }
  }
  const first = rdp(open.slice(0, far + 1), tolerance);
  const second = rdp([...open.slice(far), open[0]], tolerance);
  const merged = [...first.slice(0, -1), ...second.slice(0, -1)];
  if (merged.length < 4) return points.slice();
  const result = [...merged, merged[0]];
  return result.length < points.length ? result : points.slice();
}
function dedupeAdjacent(points) {
  const out = [];
  for (const point of points) {
    const last = out[out.length - 1];
    if (last && samePoint(last, point)) continue;
    out.push(point);
  }
  if (out.length >= 2 && samePoint(out[0], out[out.length - 1]) === false) {
    out.push(out[0]);
  }
  return out;
}
function capClosedRing(points, maxPoints) {
  const closed = points.length >= 2 && samePoint(points[0], points[points.length - 1]);
  const open = closed ? points.slice(0, -1) : points.slice();
  if (open.length + 1 <= maxPoints) {
    return open.length === 0 ? points : [...open, open[0]];
  }
  const keepOpen = maxPoints - 1;
  const stride = (open.length - 1) / (keepOpen - 1);
  const sampled = [open[0]];
  for (let i = 1; i < keepOpen - 1; i += 1) {
    sampled.push(open[Math.round(i * stride)]);
  }
  sampled.push(open[open.length - 1]);
  return dedupeAdjacent([...sampled, sampled[0]]);
}
function wrapRing(original, points) {
  if (Array.isArray(original)) {
    if (original.length > 0 && Array.isArray(original[0])) {
      return points.map((point) => [point.lon, point.lat]);
    }
    return points;
  }
  return { ...original, points };
}
function simplifyNaturalEventConeRing(ring) {
  const raw = ringPoints(ring);
  if (!raw || raw.length < 4) return ring;
  const parsed = [];
  for (const item of raw) {
    const point = toLonLat(item);
    if (point) parsed.push(point);
  }
  if (parsed.length < 4) return ring;
  const simplified = simplifyClosedRing(parsed, NATURAL_EVENTS_CONE_SIMPLIFY_TOLERANCE_DEG);
  const rounded = dedupeAdjacent(simplified.map((point) => ({
    lon: compactCoord(point.lon),
    lat: compactCoord(point.lat)
  })));
  const capped = capClosedRing(rounded, NATURAL_EVENTS_CONE_MAX_POINTS);
  if (capped.length < 4) return ring;
  if (capped.length >= parsed.length && JSON.stringify(capped) === JSON.stringify(parsed)) {
    return ring;
  }
  return wrapRing(ring, capped);
}
function projectNaturalEventsRetention(value, now = Date.now()) {
  if (!value || !Array.isArray(value.events) || !value.eonetRetention) return value;
  const { eonetRetention, ...publicData } = value;
  const expiresAt = eonetRetention.retainedUntil;
  if (Number.isSafeInteger(expiresAt) && now < expiresAt) return publicData;
  const indexes = new Set(eonetRetention.eventIndexes ?? []);
  const events = value.events.filter((_event, index) => !indexes.has(index));
  return { ...publicData, events, dataAvailable: events.length > 0 };
}
function compactNaturalEventsDashboardPayload(value) {
  value = projectNaturalEventsRetention(value);
  if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.events)) {
    return value;
  }
  let changed = false;
  const events = value.events.map((event) => {
    if (!event || typeof event !== "object" || Array.isArray(event) || !Array.isArray(event.conePolygon)) {
      return event;
    }
    if (event.conePolygon.length === 0) return event;
    const conePolygon = event.conePolygon.map((ring) => {
      const next2 = simplifyNaturalEventConeRing(ring);
      if (next2 !== ring) changed = true;
      return next2;
    });
    if (conePolygon.every((ring, index) => ring === event.conePolygon[index])) return event;
    return { ...event, conePolygon };
  });
  if (!changed) return value;
  return { ...value, events };
}

// api/_social-velocity.js
var REDDIT_HOSTS = /* @__PURE__ */ new Set(["reddit.com", "www.reddit.com", "old.reddit.com"]);
function finiteNumber(value, min, max) {
  return typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : 0;
}
function normalizeSocialVelocity(data) {
  if (!data || typeof data !== "object" || !("posts" in data) || !Array.isArray(data.posts)) {
    return { posts: [], fetchedAt: 0 };
  }
  const posts = [];
  for (const post of data.posts) {
    if (!post || typeof post !== "object" || Array.isArray(post)) continue;
    const p = post;
    if (typeof p.url !== "string" || p.url.length > 2048) continue;
    let url;
    try {
      url = new URL(p.url);
    } catch {
      continue;
    }
    if (!["https:", "http:"].includes(url.protocol) || !REDDIT_HOSTS.has(url.hostname) || url.username || url.password || url.port || !/^\/r\/[A-Za-z0-9_]+\/comments\/[A-Za-z0-9]+(?:\/|$)/.test(url.pathname)) continue;
    posts.push({
      id: typeof p.id === "string" ? p.id.slice(0, 128) : "",
      title: typeof p.title === "string" ? p.title.slice(0, 300) : "",
      subreddit: typeof p.subreddit === "string" ? p.subreddit.slice(0, 64) : "",
      url: url.href,
      score: Math.trunc(finiteNumber(p.score, -2147483648, 2147483647)),
      upvoteRatio: finiteNumber(p.upvoteRatio, 0, 1),
      numComments: Math.trunc(finiteNumber(p.numComments, 0, 2147483647)),
      velocityScore: finiteNumber(p.velocityScore, 0, Number.MAX_SAFE_INTEGER),
      createdAt: Math.trunc(finiteNumber(p.createdAt, 0, Number.MAX_SAFE_INTEGER))
    });
    if (posts.length === 30) break;
  }
  if (data.posts.length > 0 && posts.length === 0) return { posts: [], fetchedAt: 0 };
  return { posts, fetchedAt: Math.trunc(finiteNumber("fetchedAt" in data ? data.fetchedAt : 0, 0, Number.MAX_SAFE_INTEGER)) };
}

// api/_bootstrap-public-payload.js
function stripXFeedRestrictedFields(value) {
  if (value == null || typeof value !== "object" || Array.isArray(value)) return value;
  const { pollState: _pollState, ...rest } = value;
  if (!Array.isArray(rest.items)) return rest;
  return {
    ...rest,
    items: rest.items.map((item) => {
      if (item == null || typeof item !== "object" || Array.isArray(item)) return item;
      const { text: _text, ...itemRest } = item;
      return itemRest;
    })
  };
}
function sanitizeBootstrapValue(name, value) {
  if (name === "socialVelocity" && value != null) return normalizeSocialVelocity(value);
  if (value == null || typeof value !== "object" || Array.isArray(value)) return value;
  if (name === "forecasts") {
    const { enrichmentMeta: _internal, ...rest } = value;
    return rest;
  }
  if (name === "xFeed") return stripXFeedRestrictedFields(value);
  if (name === "wildfires") return compactWildfireDashboardPayload(value);
  if (name === "naturalEvents") return compactNaturalEventsDashboardPayload(value);
  if (name === "chokepoints" && Array.isArray(value.chokepoints)) {
    return { ...value, chokepoints: value.chokepoints.map((cp) => cp?.transitSummary ? {
      ...cp,
      transitSummary: { ...cp.transitSummary, riskSummary: "", riskReportAction: "" }
    } : cp) };
  }
  return value;
}

// api/_imf-dataset.js
var IMF_DATASETS = {
  imfMacro: { fields: ["inflationPct", "currentAccountPct", "govRevenuePct", "cpiIndex", "cpiEopPct", "govExpenditurePct", "primaryBalancePct", "year"] },
  imfGrowth: { fields: ["realGdpGrowthPct", "gdpPerCapitaUsd", "realGdpLcuB", "realGdp", "gdpPerCapitaPpp", "gdpPpp", "investmentPct", "savingsPct", "savingsInvestmentGap", "year"] },
  imfLabor: { fields: ["unemploymentPct", "populationMillions", "year"] },
  imfExternal: { fields: ["exportsUsd", "importsUsd", "tradeBalanceUsd", "currentAccountUsd", "importVolumePctChg", "exportVolumePctChg", "year"] }
};
function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
function isValidCountryRow(fields, code, row) {
  if (!/^[A-Z]{2}$/.test(code) || !isRecord(row)) return false;
  let hasValue = false;
  for (const field of fields) {
    const v = row[field];
    if (v == null) continue;
    if (typeof v !== "number" || !Number.isFinite(v)) return false;
    if (field === "year") {
      if (!Number.isInteger(v) || v < 1900 || v > 2200) return false;
    } else {
      hasValue = true;
    }
  }
  return hasValue;
}
function validateImfDataset(key, value) {
  if (!Object.hasOwn(IMF_DATASETS, key)) return value;
  if (!isRecord(value) || !isRecord(value.countries) || value.error || value.fallback || value.dataAvailable === false) return void 0;
  const { fields } = IMF_DATASETS[key];
  const countries = {};
  let dropped = false;
  for (const [code, row] of Object.entries(value.countries)) {
    if (isValidCountryRow(fields, code, row)) countries[code] = row;
    else dropped = true;
  }
  if (Object.keys(countries).length === 0) return void 0;
  return dropped ? { ...value, countries } : value;
}

// api/_strip-trailing-slashes.js
function stripTrailingSlashes(value) {
  let end = value.length;
  while (end > 1 && value.charCodeAt(end - 1) === 47) end -= 1;
  return end === value.length ? value : value.slice(0, end);
}

// api/bootstrap.js
var import_functions = __toESM(require_functions(), 1);

// api/_bootstrap-tier-keys.js
var BOOTSTRAP_CACHE_KEYS = Object.freeze({
  ukmtoIncidents: "maritime:ukmto-incidents:v1",
  earthquakes: "seismology:earthquakes:v1",
  outages: "infra:outages:v1",
  serviceStatuses: "infra:service-statuses:v1",
  ddosAttacks: "cf:radar:ddos:v1",
  trafficAnomalies: "cf:radar:traffic-anomalies:v1",
  marketQuotes: "market:stocks-bootstrap:v1",
  commodityQuotes: "market:commodities-bootstrap:v1",
  sectors: "market:sectors:v2",
  etfFlows: "market:etf-flows:v1",
  macroSignals: "economic:macro-signals:v1",
  bisPolicy: "economic:bis:policy:v1",
  bisExchange: "economic:bis:eer:v1",
  bisCredit: "economic:bis:credit:v1",
  bisDsr: "economic:bis:dsr:v1",
  bisPropertyResidential: "economic:bis:property-residential:v1",
  bisPropertyCommercial: "economic:bis:property-commercial:v1",
  imfMacro: "economic:imf:macro:v2",
  imfGrowth: "economic:imf:growth:v1",
  imfLabor: "economic:imf:labor:v1",
  imfExternal: "economic:imf:external:v1",
  chinaMacro: "economic:china:macro:v2",
  chinaReleaseCalendar: "economic:china:release-calendar:v1",
  chinaCorporateDisclosures: "market:china:corporate-disclosures:v1",
  chinaPolicyEvents: "china:policy-events:v1",
  chinaDecisionSignals: "intelligence:china-decision-signals:v1",
  shippingRates: "supply_chain:shipping:v2",
  chokepoints: "supply_chain:chokepoints:v4",
  minerals: "supply_chain:minerals:v2",
  giving: "giving:summary:v2",
  climateAnomalies: "climate:anomalies:v2",
  climateDisasters: "climate:disasters:v1",
  co2Monitoring: "climate:co2-monitoring:v1",
  oceanIce: "climate:ocean-ice:v1",
  climateNews: "climate:news-intelligence:v1",
  radiationWatch: "radiation:observations:v1",
  thermalEscalation: "thermal:escalation-bootstrap:v1",
  crossSourceSignals: "intelligence:cross-source-signals:v1",
  wildfires: "wildfire:fires-bootstrap:v1",
  cyberThreats: "cyber:threats-bootstrap:v2",
  techReadiness: "economic:worldbank-techreadiness:v1",
  progressData: "economic:worldbank-progress:v1",
  renewableEnergy: "economic:worldbank-renewable:v1",
  positiveGeoEvents: "positive_events:geo-bootstrap:v1",
  theaterPosture: "theater_posture:sebuf:stale:v1",
  riskScores: "risk:scores:sebuf:stale:v14",
  naturalEvents: "natural:events:v1",
  flightDelays: "aviation:delays-bootstrap:v2",
  insights: "news:insights:v1",
  predictions: "prediction:markets-bootstrap:v1",
  cryptoQuotes: "market:crypto:v1",
  cryptoSectors: "market:crypto-sectors:v1",
  defiTokens: "market:defi-tokens:v1",
  aiTokens: "market:ai-tokens:v1",
  otherTokens: "market:other-tokens:v1",
  gulfQuotes: "market:gulf-quotes:v1",
  stablecoinMarkets: "market:stablecoins:v1",
  unrestEvents: "unrest:events:v1",
  iranEvents: "conflict:iran-events:v1",
  ucdpEvents: "conflict:ucdp-events-bootstrap:v1",
  temporalAnomalies: "temporal:anomalies:v1",
  weatherAlerts: "weather:alerts:v1",
  imdCycloneMarine: "weather:imd-cyclone-marine:v1",
  notamAirspace: "aviation:notam:airspace:v1",
  liveVideoResolved: "live-video:resolved:v1",
  crossBorderArrivals: "displacement:cross-border:v1",
  idmcIduDisplacement: "displacement:idmc-idu:v1",
  canadaRoads: "infra:ontario-511:v1",
  albertaRoads: "infra:alberta-511:v1",
  manitobaRoads: "infra:manitoba-511:v1",
  torontoRoads: "infra:toronto-roads:v1",
  bcOpen511: "infra:bc-open511:v1",
  canadaAlerts: "alerts:canada:v1",
  spending: "economic:spending:v1",
  techEvents: "research:tech-events-bootstrap:v1",
  gdeltIntel: "intelligence:gdelt-intel:v1",
  correlationCards: "correlation:cards-bootstrap:v1",
  crossStraitActivity: "military:cross-strait-activity-bootstrap:v1",
  forecasts: "forecast:predictions-bootstrap:v1",
  securityAdvisories: "intelligence:advisories-bootstrap:v1",
  customsRevenue: "trade:customs-revenue:v1",
  sanctionsPressure: "sanctions:pressure:v1",
  consumerPricesOverview: "consumer-prices:overview:ae",
  consumerPricesCategories: "consumer-prices:categories:ae:30d",
  consumerPricesMovers: "consumer-prices:movers:ae:30d",
  consumerPricesSpread: "consumer-prices:retailer-spread:ae:essentials-ae",
  groceryBasket: "economic:grocery-basket:v1",
  bigmac: "economic:bigmac:v1",
  fuelPrices: "economic:fuel-prices:v1",
  faoFoodPriceIndex: "economic:fao-ffpi:v1",
  nationalDebt: "economic:national-debt:v1",
  euGasStorage: "economic:eu-gas-storage:v1",
  eurostatCountryData: "economic:eurostat-country-data:v1",
  eurostatHousePrices: "economic:eurostat:house-prices:v1",
  eurostatGovDebtQ: "economic:eurostat:gov-debt-q:v1",
  eurostatIndProd: "economic:eurostat:industrial-production:v1",
  fearGreedIndex: "market:fear-greed:v1",
  hyperliquidFlow: "market:hyperliquid:flow:v1",
  crudeInventories: "economic:crude-inventories:v1",
  natGasStorage: "economic:nat-gas-storage:v1",
  ecbFxRates: "economic:ecb-fx-rates:v1",
  cbrRates: "economic:cbr-rates:v1",
  fxYoy: "economic:fx:yoy:v1",
  sharedFxRates: "shared:fx-rates:v1",
  euFsi: "economic:fsi-eu:v1",
  shippingStress: "supply_chain:shipping_stress:v1",
  socialVelocity: "intelligence:social:reddit:v1",
  pizzint: "intelligence:pizzint:seed:v1",
  diseaseOutbreaks: "health:disease-outbreaks:v1",
  economicStress: "economic:stress-index:v1",
  electricityPrices: "energy:electricity:v1:index",
  jodiOil: "energy:jodi-oil:v1:_countries",
  chokepointBaselines: "energy:chokepoint-baselines:v1",
  portwatchChokepointsRef: "portwatch:chokepoints:ref:v1",
  portwatchPortActivity: "supply_chain:portwatch-ports:v1:_countries",
  oilStocksAnalysis: "energy:oil-stocks-analysis:v1",
  lngVulnerability: "energy:lng-vulnerability:v1",
  sprPolicies: "energy:spr-policies:v1",
  pipelinesGas: "energy:pipelines:gas:v1",
  pipelinesOil: "energy:pipelines:oil:v1",
  storageFacilities: "energy:storage-facilities:v1",
  fuelShortages: "energy:fuel-shortages:v1",
  energyDisruptions: "energy:disruptions:v1",
  energyCrisisPolicies: "energy:crisis-policies:v1",
  aaiiSentiment: "market:aaii-sentiment:v1",
  breadthHistory: "market:breadth-history:v1",
  marketCorrelationSeries: "market:correlation-series:v1"
});
var SLOW_KEY_NAMES = /* @__PURE__ */ new Set([
  "bisPolicy",
  "bisExchange",
  "bisCredit",
  "chinaMacro",
  "chinaReleaseCalendar",
  "chinaCorporateDisclosures",
  "minerals",
  "giving",
  "sectors",
  "etfFlows",
  "wildfires",
  "climateAnomalies",
  "climateDisasters",
  "co2Monitoring",
  "oceanIce",
  "climateNews",
  "radiationWatch",
  "thermalEscalation",
  "crossSourceSignals",
  "crossStraitActivity",
  "techReadiness",
  "progressData",
  "renewableEnergy",
  "naturalEvents",
  "cryptoQuotes",
  "cryptoSectors",
  "defiTokens",
  "aiTokens",
  "otherTokens",
  "gulfQuotes",
  "stablecoinMarkets",
  "unrestEvents",
  "ucdpEvents",
  "techEvents",
  "securityAdvisories",
  "customsRevenue",
  "sanctionsPressure",
  "consumerPricesOverview",
  "consumerPricesCategories",
  "consumerPricesMovers",
  "consumerPricesSpread",
  "groceryBasket",
  "bigmac",
  "fuelPrices",
  "faoFoodPriceIndex",
  "nationalDebt",
  "euGasStorage",
  "eurostatCountryData",
  "fearGreedIndex",
  "hyperliquidFlow",
  "crudeInventories",
  "natGasStorage",
  "ecbFxRates",
  "euFsi",
  "diseaseOutbreaks",
  "economicStress",
  "pizzint",
  "oilStocksAnalysis",
  "lngVulnerability",
  "fuelShortages",
  "energyCrisisPolicies",
  "aaiiSentiment",
  "breadthHistory"
]);
var FAST_KEY_NAMES = /* @__PURE__ */ new Set([
  "earthquakes",
  "outages",
  "serviceStatuses",
  "ddosAttacks",
  "trafficAnomalies",
  "macroSignals",
  "chokepoints",
  "marketQuotes",
  "commodityQuotes",
  "positiveGeoEvents",
  "riskScores",
  "insights",
  "predictions",
  "iranEvents",
  "temporalAnomalies",
  "weatherAlerts",
  "spending",
  "theaterPosture",
  "gdeltIntel",
  "canadaAlerts",
  "shippingRates",
  "shippingStress",
  "socialVelocity"
]);
var ON_DEMAND_KEY_NAMES = /* @__PURE__ */ new Set([
  "ukmtoIncidents",
  "cyberThreats",
  "chinaPolicyEvents",
  "chinaDecisionSignals",
  "bisDsr",
  "bisPropertyResidential",
  "bisPropertyCommercial",
  // One row of this feeds the Central Banks tab's policy-rate list, which BIS
  // cannot supply for Russia. On-demand rather than tiered: the tab fetches it
  // through the credential-less per-key URL when it renders, so the ~8KB never
  // rides a payload every visitor downloads.
  "cbrRates",
  "imfMacro",
  "imfGrowth",
  "imfLabor",
  "imfExternal",
  "eurostatHousePrices",
  "eurostatGovDebtQ",
  "eurostatIndProd",
  "electricityPrices",
  "jodiOil",
  "chokepointBaselines",
  "portwatchChokepointsRef",
  "portwatchPortActivity",
  "sprPolicies",
  "energyDisruptions",
  // Oil/gas pipeline and storage registries. Previously slow-tier freight:
  // every visitor downloaded ~528 KB decoded even when the map layers were
  // off (full/happy defaults) and the panels were below the fold. Demand
  // comes from an enabled layer or a near-viewport energy panel (#7046).
  "pipelinesGas",
  "pipelinesOil",
  "storageFacilities",
  // Flights layer ships disabled on every variant, so this never rendered
  // from the fast payload for a default visitor.
  "flightDelays",
  // The minimum further FAST demotion needed by #7046. Both consumers are
  // demand-gated and read the credential-less per-key URL. Putting them in
  // SLOW would erase the energy-registry reduction; moving additional FAST
  // keys would add default-startup requests after the 20% target is met.
  "forecasts",
  "correlationCards",
  // Both back the opt-in FX panel (#6199). On-demand rather than tiered
  // because that panel ships disabled by default: neither payload should ride
  // a tier every visitor downloads to render a surface almost nobody has on.
  // NOTE: no apostrophes in this block. scripts/docs-stats.mjs scans these
  // Sets with a bare quote matcher, so one apostrophe in prose opens a phantom
  // string and gets registered as a duplicate key.
  "fxYoy",
  "sharedFxRates",
  "marketCorrelationSeries",
  // Toronto's live road-restrictions snapshot is about 2 MB. Keep it off the
  // global FAST payload and fetch it only when the Canada-roads layer renders.
  "torontoRoads",
  // DriveBC is also too large for every visitor's startup payload.
  "bcOpen511",
  // The other two feeds behind the same map layer, moved off FAST in #6763.
  // Together they were 507,639 of the fast tier's 1,343,003 bytes — 37.8%, more
  // than marketQuotes — and a tier is not layer-gated, so every visitor on every
  // variant downloaded them, mobile included, where this layer ships disabled
  // and nothing ever rendered a byte of it.
  //
  // All five road sources are on-demand now, which is what lets the layer stay
  // off by default: with none of them tiered, a visitor who never enables
  // Canada roads pays nothing at all for them.
  "canadaRoads",
  "albertaRoads",
  "manitobaRoads",
  // IMD cyclone/port/coastal/marine products (#7005). On-demand: the weather
  // and natural layers fetch this key only when those layers are on, so it
  // never rides a payload every visitor downloads.
  "imdCycloneMarine",
  // FAA NMS airspace restrictions (TFRs, restricted/danger/prohibited areas),
  // ~1.5 MB. On-demand: fetched only when the NOTAM airspace layer is on.
  "notamAirspace",
  // The video each catalog YouTube channel has live now (#8545), fetched by the
  // live video players at play intent and only for slots that list a channel.
  // The get-bootstrap-data RPC also serves any registered key by name, so the
  // payload stays minimal: channel id to video id and timestamps, no titles,
  // enforced by validateResolvedPayload in scripts/seed-live-video-resolved.mjs.
  "liveVideoResolved",
  // Legacy ODP bootstrap/widget contract. The dashboard uses the source-dated
  // movement RPC; retain this on-demand key until legacy clients migrate.
  "crossBorderArrivals",
  // IDMC internal displacement events (#9014), about 2.5 MB, read by the
  // displacement panel and map layer only when they are open.
  "idmcIduDisplacement"
]);
var PUBLIC_WEATHER_BOOTSTRAP_KEY = "weatherAlerts";
function tierForKey(name) {
  if (FAST_KEY_NAMES.has(name)) return "fast";
  if (SLOW_KEY_NAMES.has(name)) return "slow";
  if (ON_DEMAND_KEY_NAMES.has(name)) return "on-demand";
  throw new Error(`Bootstrap cache key "${name}" has no tier assignment`);
}
var BOOTSTRAP_TIERS = Object.freeze(Object.fromEntries(
  Object.keys(BOOTSTRAP_CACHE_KEYS).map((name) => [name, tierForKey(name)])
));
function bootstrapTierKeyNames(tier, { iranEventsEnabled = true } = {}) {
  if (tier !== "fast" && tier !== "slow" && tier !== "on-demand") {
    throw new TypeError(`Unknown bootstrap tier: ${tier}`);
  }
  return Object.keys(BOOTSTRAP_CACHE_KEYS).filter((name) => BOOTSTRAP_TIERS[name] === tier && (iranEventsEnabled || name !== "iranEvents"));
}
function resolveBootstrapRegistry({ iranEventsEnabled = true } = {}) {
  const cacheKeys = { ...BOOTSTRAP_CACHE_KEYS };
  const tiers = { ...BOOTSTRAP_TIERS };
  if (!iranEventsEnabled) {
    delete cacheKeys.iranEvents;
    delete tiers.iranEvents;
  }
  return { cacheKeys, tiers };
}

// api/_bootstrap-public-tier.js
var PUBLIC_BOOTSTRAP_TIERS = /* @__PURE__ */ new Set(["fast", "slow"]);
var PUBLIC_ON_DEMAND_BOOTSTRAP_KEYS = new Set(bootstrapTierKeyNames("on-demand"));
function classifyPublicBootstrapUrl(parsedUrl) {
  const pathname = stripTrailingSlashes(parsedUrl.pathname);
  if (pathname !== "/api/bootstrap") return null;
  const paramNames = new Set(parsedUrl.searchParams.keys());
  const publicParams = parsedUrl.searchParams.getAll("public");
  if (paramNames.size !== 2 || !paramNames.has("public")) return null;
  if (publicParams.length !== 1 || publicParams[0] !== "1") return null;
  if (paramNames.has("tier")) {
    const tierParams = parsedUrl.searchParams.getAll("tier");
    if (tierParams.length !== 1 || !PUBLIC_BOOTSTRAP_TIERS.has(tierParams[0])) return null;
    return { authKind: "public-tier", tier: tierParams[0] };
  }
  if (!paramNames.has("keys")) return null;
  const keyParams = parsedUrl.searchParams.getAll("keys");
  if (keyParams.length !== 1) return null;
  const key = keyParams[0];
  if (key === PUBLIC_WEATHER_BOOTSTRAP_KEY) {
    return { authKind: "public-weather", tier: null };
  }
  if (PUBLIC_ON_DEMAND_BOOTSTRAP_KEYS.has(key)) {
    return { authKind: "public-on-demand", tier: null };
  }
  return null;
}
function classifyPublicBootstrapRequest(req, parsedUrl = new URL(req.url)) {
  if (req.method !== "GET") return null;
  return classifyPublicBootstrapUrl(parsedUrl);
}
function bootstrapTierFromPublicRequest(req, parsedUrl = new URL(req.url)) {
  const publicBootstrap = classifyPublicBootstrapRequest(req, parsedUrl);
  return publicBootstrap?.authKind === "public-tier" ? publicBootstrap.tier : null;
}
function isPublicTierBootstrapRequest(req) {
  return bootstrapTierFromPublicRequest(req) !== null;
}
function isPublicWeatherBootstrapRequest(req) {
  return classifyPublicBootstrapRequest(req)?.authKind === "public-weather";
}
function isPublicOnDemandBootstrapRequest(req) {
  return classifyPublicBootstrapRequest(req)?.authKind === "public-on-demand";
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
async function sha256Hex(str) {
  if (typeof str !== "string") return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
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

// api/_upstash-ratelimit.js
var modules = null;
function loadUpstashRatelimit() {
  modules ??= Promise.all([Promise.resolve().then(() => __toESM(require_dist2(), 1)), Promise.resolve().then(() => (init_nodejs(), nodejs_exports))]).then(([ratelimit, redis]) => ({ Ratelimit: ratelimit.Ratelimit, Redis: redis.Redis }));
  return modules;
}

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

// api/_rate-limit-fallback.js
var FALLBACK_REDIS_TIMEOUT_MS = 1e3;
var luaUnsupported = false;
function durationToSeconds(window2) {
  const match = /^(\d+)\s?(ms|s|m|h|d)$/.exec(window2);
  if (!match) throw new Error(`Unable to parse rate-limit window: ${window2}`);
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

// api/_client-ip.js
var UNKNOWN_CLIENT_IP = "unknown";
var RATE_LIMIT_DEGRADED_HEADERS = Object.freeze({
  "X-RateLimit-Mode": "degraded",
  "Retry-After": "5"
});
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
  if (typeof a !== "string" || typeof b !== "string") return false;
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
  if (typeof ip !== "string" || !ip.includes(":")) return ip;
  let addr = ip.split("%")[0].toLowerCase();
  const v4Tail = addr.match(/^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4Tail) {
    const octets = v4Tail[2].split(".").map(Number);
    if (octets.some((n) => n > 255)) return ip;
    const [a, b, c, d] = octets;
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

// api/_rate-limit.js
var REDIS_TEST_RETRY_OPTS = process.env.NODE_TEST_CONTEXT ? { retry: false } : {};
var DEFAULT_RATE_LIMIT_SCOPE = "global";
var DEFAULT_RATE_LIMIT = 600;
var DEFAULT_RATE_LIMIT_WINDOW = "60 s";
var ratelimits = /* @__PURE__ */ new Map();
function getRateLimitPolicy(opts = {}) {
  return {
    scope: opts.scope ?? DEFAULT_RATE_LIMIT_SCOPE,
    limit: opts.limit ?? DEFAULT_RATE_LIMIT,
    window: opts.window ?? DEFAULT_RATE_LIMIT_WINDOW
  };
}
async function getRatelimit(policy) {
  const cacheKey = `${policy.scope}|${policy.limit}|${policy.window}`;
  const cached = ratelimits.get(cacheKey);
  if (cached) return cached;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const { Ratelimit, Redis: Redis3 } = await loadUpstashRatelimit();
  const ratelimit = new Ratelimit({
    redis: new Redis3({ url, token, ...REDIS_TEST_RETRY_OPTS }),
    limiter: Ratelimit.slidingWindow(policy.limit, policy.window),
    prefix: policy.scope === DEFAULT_RATE_LIMIT_SCOPE ? "rl" : `rl:${policy.scope}`,
    analytics: false
  });
  ratelimits.set(cacheKey, ratelimit);
  return ratelimit;
}
function rateLimitErrorLevel(stage, msg) {
  if (stage.includes("missing-config")) return "error";
  if (/Error running script|execution timed out|Command failed|ETIMEDOUT|ECONNRESET|ENOTFOUND|fetch failed|network|timed out|aborted due to timeout|TimeoutError|socket hang up|Redis unavailable|Redis unreachable/i.test(msg)) {
    return "warning";
  }
  return "error";
}
var RATE_LIMIT_FINGERPRINT_SUFFIXES = /* @__PURE__ */ new Set(["missing-config", "timeout", "edge-proof"]);
function rateLimitFingerprintStage(stage) {
  const parts = String(stage ?? "").split(":");
  const head = parts[0] || "rate-limit";
  const last = (parts.length > 1 ? parts[parts.length - 1] : "") ?? "";
  return RATE_LIMIT_FINGERPRINT_SUFFIXES.has(last) ? `${head}:${last}` : head;
}
function logRateLimitDegraded(stage, err, ctx) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`[rate-limit] redis-error stage=${stage} msg=${msg}`);
  captureSilentError(err, {
    tags: { surface: "api", component: "rate-limit", stage },
    fingerprint: ["rate-limit", "redis-error", rateLimitFingerprintStage(stage)],
    ctx,
    level: rateLimitErrorLevel(stage, msg)
  });
}
var EDGE_PROOF_RATE_LIMIT_LATCH = /* @__PURE__ */ Symbol.for("worldmonitor.rate-limit.edge-proof-reported.v1");
function reportEdgeProofRequiredOnce(stage, err, ctx) {
  const existing = Reflect.get(globalThis, EDGE_PROOF_RATE_LIMIT_LATCH);
  const latch = existing ?? { reported: false };
  if (!existing) Reflect.set(globalThis, EDGE_PROOF_RATE_LIMIT_LATCH, latch);
  if (latch.reported) return;
  latch.reported = true;
  logRateLimitDegraded(stage, err, ctx);
}
function rateLimitDegradedResponse(corsHeaders) {
  return jsonResponse(
    { error: "Rate-limit service temporarily unavailable" },
    503,
    { ...RATE_LIMIT_DEGRADED_HEADERS, ...corsHeaders }
  );
}
function edgeProofRequiredResponse(corsHeaders) {
  return jsonResponse(
    { error: "Cloudflare edge proof required" },
    403,
    { "X-RateLimit-Mode": "edge-proof", ...corsHeaders }
  );
}
async function checkRateLimit(request, corsHeaders, opts = {}) {
  const policy = getRateLimitPolicy(opts);
  if (opts.identifier == null && hasUnprovenCloudflareClientIp(request)) {
    reportEdgeProofRequiredOnce(
      "checkRateLimit:edge-proof",
      new Error("Cloudflare client IP arrived without a valid x-wm-edge-proof"),
      opts.ctx
    );
    return edgeProofRequiredResponse(corsHeaders);
  }
  const rl = await getRatelimit(policy);
  if (!rl) {
    if (opts.failClosed) {
      logRateLimitDegraded("checkRateLimit:missing-config", new Error("Upstash Redis is not configured"), opts.ctx);
      return rateLimitDegradedResponse(corsHeaders);
    }
    return null;
  }
  const identifier = opts.identifier ?? getClientRateLimitKey(request);
  try {
    const fallbackPrefix = policy.scope === DEFAULT_RATE_LIMIT_SCOPE ? "rl:fw" : `rl:${policy.scope}:fw`;
    const result = await limitWithFallback(
      rl,
      identifier,
      `${fallbackPrefix}:${identifier}`,
      policy.limit,
      durationToSeconds(policy.window)
    );
    if (result.reason === "timeout") {
      logRateLimitDegraded("checkRateLimit:timeout", new Error("Upstash rate-limit decision timed out"), opts.ctx);
      if (opts.failClosed) return rateLimitDegradedResponse(corsHeaders);
      return null;
    }
    const { success, limit, reset } = result;
    if (!success) {
      const resetSeconds = Math.max(0, Math.ceil((reset - Date.now()) / 1e3));
      const windowSeconds = durationToSeconds(policy.window);
      return jsonResponse({ error: "Too many requests" }, 429, {
        // IETF RateLimit fields (draft-ietf-httpapi-ratelimit-headers). The
        // combined RateLimit member references the "default" policy advertised
        // on every API response via vercel.json so an agent can self-throttle.
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
      });
    }
    return null;
  } catch (err) {
    logRateLimitDegraded("checkRateLimit", err, opts.ctx);
    if (opts.failClosed) return rateLimitDegradedResponse(corsHeaders);
    return null;
  }
}

// shared/desktop-key-access.js
function admitsDesktopKeyPrincipal(entitlement, now) {
  if (!entitlement) return false;
  const { features } = entitlement;
  return features.tier >= 1 && entitlement.validUntil >= now && (features.desktopKeyAccess === true || features.apiAccess === true);
}
var DESKTOP_KEY_LIMIT_ERROR = "Desktop key limit reached for this account";

// api/_api-key-rate-limit.js
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
function secondsUntilUtcMidnight(now) {
  const d = now ?? /* @__PURE__ */ new Date();
  const next2 = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1));
  return Math.max(1, Math.ceil((next2.getTime() - d.getTime()) / 1e3));
}
function secondsUntilNextMinute(now) {
  const ms = (now ?? /* @__PURE__ */ new Date()).getTime();
  const next2 = (Math.floor(ms / 6e4) + 1) * 6e4;
  return Math.max(1, Math.ceil((next2 - ms) / 1e3));
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
    const retryAfterSec = secondsUntilUtcMidnight(now);
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
      headers: { "Cache-Control": "no-store", ...RATE_LIMIT_DEGRADED_HEADERS }
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

// api/_user-api-key.js
var USER_API_KEY_RE = /^wm_[a-f0-9]{40}$/;
var USER_API_KEY_CACHE_VERSION = 2;
var USER_API_KEY_KINDS = /* @__PURE__ */ new Set(["api", "desktop"]);
var CONVEX_VALIDATE_PATH = "/api/internal-validate-api-key";
var CONVEX_ENTITLEMENTS_PATH = "/api/internal-entitlements";
var VALIDATION_TIMEOUT_MS = 3e3;
var RATE_LIMIT_WINDOW_SECONDS = 60;
var RATE_LIMIT_MAX = 600;
var RATE_LIMIT_PREFIX = "rl:bootstrap-user-api-key:";
var RATE_LIMIT_REDIS_TIMEOUT_MS = 1e3;
var USER_KEY_CACHE_TTL_SECONDS = 60;
var USER_KEY_NEGATIVE_CACHE_TTL_SECONDS = 60;
var USER_KEY_CACHE_PREFIX = "user-api-key:";
var COMPANY_MONITORING_SCOPES = /* @__PURE__ */ new Set(["company_monitoring:read", "company_monitoring:write"]);
var BOOTSTRAP_USER_KEY_NEGATIVE_CACHE_PREFIX = "bootstrap-user-api-key-invalid:";
var ENTITLEMENT_CACHE_TTL_SECONDS = 900;
var LAPSED_BILLING_MARKER_TTL_SECONDS = 60;
var NOT_APPLICABLE_VERIFICATION_TTL_SECONDS = 60;
var ENTITLEMENT_ENV_PREFIX = process.env.DODO_PAYMENTS_ENVIRONMENT === "live_mode" ? "live" : "test";
var NEG_SENTINEL = "__WM_NEG__";
var userKeyInFlight = /* @__PURE__ */ new Map();
var entitlementInFlight = /* @__PURE__ */ new Map();
function getServerRedisKeyPrefix() {
  const env = process.env.VERCEL_ENV;
  if (!env || env === "production") return "";
  const sha = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 8) || "dev";
  return `${env}:${sha}:`;
}
function userApiKeyCacheKey(keyHash) {
  return `${getServerRedisKeyPrefix()}${USER_KEY_CACHE_PREFIX}${keyHash}`;
}
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function hasNonEmptyString(value, field) {
  if (!Object.prototype.hasOwnProperty.call(value, field)) return false;
  return typeof value[field] === "string" && value[field].length > 0;
}
function hasValidCompanyMonitoringBinding(value) {
  if (value.scopes === void 0 && value.companyMonitoringAccountId === void 0) return true;
  if (!Array.isArray(value.scopes) || value.scopes.length === 0) return false;
  if (typeof value.companyMonitoringAccountId !== "string" || value.companyMonitoringAccountId.length === 0) {
    return false;
  }
  return new Set(value.scopes).size === value.scopes.length && value.scopes.every((scope) => typeof scope === "string" && COMPANY_MONITORING_SCOPES.has(scope));
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
  if (value.keyKind !== void 0 && (typeof value.keyKind !== "string" || !USER_API_KEY_KINDS.has(value.keyKind))) {
    return null;
  }
  return {
    v: USER_API_KEY_CACHE_VERSION,
    userId: value.userId,
    keyId: value.id,
    ...typeof value.name === "string" ? { name: value.name } : {},
    keyKind: value.keyKind === void 0 ? "api" : value.keyKind,
    ...isActiveKeyRank(value.activeKeyRank) ? { activeKeyRank: value.activeKeyRank } : {},
    ...value.scopes === void 0 ? {} : { scopes: value.scopes },
    ...value.companyMonitoringAccountId === void 0 ? {} : { companyMonitoringAccountId: value.companyMonitoringAccountId }
  };
}
function isGenericUserKeyResult(value) {
  return value.scopes === void 0 && value.companyMonitoringAccountId === void 0;
}
function invalidKey(reason) {
  return { ok: false, status: 401, error: "Invalid API key", reason };
}
function bootstrapUserApiKeyNegativeCacheKey(keyHash) {
  return `${getServerRedisKeyPrefix()}${BOOTSTRAP_USER_KEY_NEGATIVE_CACHE_PREFIX}${keyHash}`;
}
function convexConfig() {
  const siteUrl = process.env.CONVEX_SITE_URL || "";
  const sharedSecret = process.env.CONVEX_SERVER_SHARED_SECRET || "";
  if (!siteUrl || !sharedSecret) return null;
  return { siteUrl, sharedSecret };
}
function noStoreHeaders(extra = {}) {
  return { "Cache-Control": "no-store", ...extra };
}
function rateLimitUnavailable(stage) {
  console.warn(`[bootstrap-user-api-key] rate-limit unavailable stage=${stage}`);
  return {
    ok: false,
    status: 503,
    error: "Rate-limit service temporarily unavailable",
    headers: noStoreHeaders(RATE_LIMIT_DEGRADED_HEADERS)
  };
}
function validationUnavailable(stage, detail = "") {
  const suffix = detail ? ` ${detail}` : "";
  console.warn(`[bootstrap-user-api-key] validation unavailable stage=${stage}${suffix}`);
  return { ok: false, unavailable: true };
}
var VALIDATION_RETRY_AFTER_SECONDS = 5;
function serviceUnavailable() {
  return {
    ok: false,
    status: 503,
    error: "Service temporarily unavailable",
    unavailable: true,
    // X-Validation-Mode mirrors the rate-limiter's X-RateLimit-Mode: degraded
    // marker so observability can correlate validation-service outages without
    // parsing the body; Retry-After signals the failure is transient.
    headers: noStoreHeaders({
      "Retry-After": String(VALIDATION_RETRY_AFTER_SECONDS),
      "X-Validation-Mode": "degraded"
    })
  };
}
function cacheUnavailable(stage) {
  console.warn(`[bootstrap-user-api-key] auth-cache unavailable stage=${stage}`);
}
async function readCachedJson(key) {
  const result = await redisPipeline([["GET", key]], 1e3, true);
  if (!result) return { status: "unavailable" };
  const raw = result[0]?.result;
  if (raw == null) return { status: "miss" };
  try {
    return { status: "hit", value: JSON.parse(String(raw)) };
  } catch {
    cacheUnavailable("invalid-json");
    return { status: "unavailable" };
  }
}
async function writeCachedJson(key, value, ttlSeconds) {
  const result = await redisPipeline([
    ["SET", key, JSON.stringify(value), "EX", String(ttlSeconds)]
  ], 1e3, true);
  if (!result) cacheUnavailable("write-failed");
}
async function coalesce(map, key, load) {
  const existing = map.get(key);
  if (existing) return existing;
  const promise = load();
  map.set(key, promise);
  try {
    return await promise;
  } finally {
    map.delete(key);
  }
}
function isCanonicalUserApiKey(key) {
  return USER_API_KEY_RE.test(key || "");
}
async function checkBootstrapUserApiKeyRateLimit(req) {
  const identifier = getClientRateLimitKey(req);
  const cacheKey = `${RATE_LIMIT_PREFIX}${identifier}`;
  const result = await redisPipeline([
    ["INCR", cacheKey],
    ["EXPIRE", cacheKey, String(RATE_LIMIT_WINDOW_SECONDS), "NX"],
    ["TTL", cacheKey]
  ], RATE_LIMIT_REDIS_TIMEOUT_MS);
  if (!result) {
    return rateLimitUnavailable("redis-unavailable");
  }
  const count = Number(result[0]?.result ?? 0);
  if (!Number.isFinite(count) || count < 1) {
    return rateLimitUnavailable("invalid-count");
  }
  const ttl = Number(result[2]?.result ?? -1);
  if (!Number.isFinite(ttl) || ttl < 0) {
    return rateLimitUnavailable("missing-expiry");
  }
  if (count > RATE_LIMIT_MAX) {
    return {
      ok: false,
      status: 429,
      error: "Too many requests",
      headers: noStoreHeaders({ "Retry-After": String(Math.ceil(ttl)) })
    };
  }
  return { ok: true };
}
async function postConvexJson(path, body) {
  const config2 = convexConfig();
  if (!config2) return validationUnavailable("missing-config");
  let resp;
  try {
    resp = await fetch(`${config2.siteUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "worldmonitor-bootstrap/1.0",
        "x-convex-shared-secret": config2.sharedSecret
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(VALIDATION_TIMEOUT_MS)
    });
  } catch {
    return validationUnavailable("fetch-error");
  }
  if (!resp.ok) return validationUnavailable("http-error", `status=${resp.status}`);
  try {
    return { ok: true, value: await resp.json() };
  } catch {
    return validationUnavailable("invalid-json");
  }
}
async function validateBootstrapUserApiKeyPrincipal(key) {
  if (!isCanonicalUserApiKey(key)) return invalidKey("malformed");
  const keyHash = await sha256Hex(key);
  const resolved = await resolveUserApiKeyHash(keyHash);
  if (!resolved.ok) return resolved;
  const { entry } = resolved;
  if (!isGenericUserKeyResult(entry)) return invalidKey("invalid");
  return {
    ok: true,
    userId: entry.userId,
    keyId: entry.keyId,
    keyKind: entry.keyKind,
    keyHash,
    ...entry.activeKeyRank === void 0 ? {} : { activeKeyRank: entry.activeKeyRank }
  };
}
async function resolveUserApiKeyHash(keyHash) {
  if (typeof keyHash !== "string" || !/^[a-f0-9]{64}$/.test(keyHash)) return invalidKey("malformed");
  return coalesce(userKeyInFlight, keyHash, () => resolveUserApiKeyHashUncached(keyHash));
}
async function resolveUserApiKeyHashUncached(keyHash) {
  const cacheKey = userApiKeyCacheKey(keyHash);
  const cached = await readCachedJson(cacheKey);
  if (cached.status === "hit" && isCurrentUserKeyCacheEntry(cached.value)) {
    return { ok: true, entry: cached.value };
  }
  const negativeCacheKey = bootstrapUserApiKeyNegativeCacheKey(keyHash);
  const cachedNegative = await readCachedJson(negativeCacheKey);
  if (cachedNegative.status === "hit" && cachedNegative.value === NEG_SENTINEL) {
    return invalidKey("cached-invalid");
  }
  const result = await postConvexJson(CONVEX_VALIDATE_PATH, { keyHash });
  if (!result.ok) {
    return serviceUnavailable();
  }
  const entry = toCacheEntry(result.value);
  if (entry === null) {
    await writeCachedJson(negativeCacheKey, NEG_SENTINEL, USER_KEY_NEGATIVE_CACHE_TTL_SECONDS);
    return invalidKey("invalid");
  }
  await writeCachedJson(cacheKey, entry, USER_KEY_CACHE_TTL_SECONDS);
  return { ok: true, entry };
}
function hasCurrentApiAccess(value) {
  if (!value || typeof value !== "object") return false;
  const validUntil = Number(value.validUntil ?? 0);
  return Boolean(value.features?.apiAccess === true && Number.isFinite(validUntil) && validUntil >= Date.now());
}
function clampRetryAfterSeconds(rawRetryAfter) {
  const parsed = Number(rawRetryAfter);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(60, Math.ceil(parsed))) : VALIDATION_RETRY_AFTER_SECONDS;
}
function billingVerificationFailure(value, lapsedError = API_ACCESS_POLICY.lapsedError) {
  const status = value?.billingStatus;
  if (status === "subscription_lapsed") {
    return {
      ok: false,
      status: 403,
      error: lapsedError,
      reason: status,
      headers: noStoreHeaders({ "X-Billing-Verification": status })
    };
  }
  if (status !== "renewal_verification_pending" && status !== "renewal_verification_failed") {
    return null;
  }
  const retryAfter = clampRetryAfterSeconds(value?.retryAfterSeconds);
  return {
    ok: false,
    status: 503,
    error: status === "renewal_verification_pending" ? "Renewal verification pending" : "Renewal verification failed",
    reason: status,
    unavailable: true,
    headers: noStoreHeaders({
      "Retry-After": String(retryAfter),
      "X-Billing-Verification": status
    })
  };
}
function notApplicableVerificationTtlSeconds(value) {
  const marker = value?.renewalVerificationFreshness;
  if (marker?.status !== "not_applicable") return null;
  if (typeof marker.checkedAt !== "number" || !Number.isFinite(marker.checkedAt)) return null;
  const remainingMs = marker.checkedAt + NOT_APPLICABLE_VERIFICATION_TTL_SECONDS * 1e3 - Date.now();
  return remainingMs > 0 ? Math.max(1, Math.min(
    NOT_APPLICABLE_VERIFICATION_TTL_SECONDS,
    Math.ceil(remainingMs / 1e3)
  )) : null;
}
function entitlementCacheTtlSeconds(value) {
  const status = value?.billingStatus;
  if (status === "subscription_lapsed") return LAPSED_BILLING_MARKER_TTL_SECONDS;
  if (status === "renewal_verification_pending" || status === "renewal_verification_failed") {
    return clampRetryAfterSeconds(value?.retryAfterSeconds);
  }
  const notApplicableTtl = notApplicableVerificationTtlSeconds(value);
  return notApplicableTtl ?? ENTITLEMENT_CACHE_TTL_SECONDS;
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
async function validateBootstrapUserApiAccess(userId) {
  return validateBootstrapEntitlement(userId, API_ACCESS_POLICY);
}
async function resolveBootstrapUserKeyAccess(principal) {
  let rankUnknownFailure;
  if (principal.keyKind !== "desktop") {
    const apiResult = await validateBootstrapUserApiAccess(principal.userId);
    if (apiResult.ok) return { ok: true, scope: "api", entitlement: apiResult.entitlement };
    if (apiResult.unavailable || apiResult.status === 503) return apiResult;
    const desktopResult2 = await validateBootstrapDesktopKeyAccess(principal.userId);
    if (!desktopResult2.ok) return apiResult;
    rankUnknownFailure = apiResult;
    return applyDesktopKeyCap(principal, desktopResult2.entitlement, rankUnknownFailure);
  }
  const desktopResult = await validateBootstrapDesktopKeyAccess(principal.userId);
  if (!desktopResult.ok) return desktopResult;
  if (hasCurrentApiAccess(desktopResult.entitlement)) {
    return { ok: true, scope: "desktop", entitlement: desktopResult.entitlement };
  }
  rankUnknownFailure = {
    ok: false,
    status: 403,
    error: DESKTOP_KEY_POLICY.forbiddenError,
    reason: "rank-unknown"
  };
  return applyDesktopKeyCap(principal, desktopResult.entitlement, rankUnknownFailure);
}
function applyDesktopKeyCap(principal, entitlement, rankUnknownFailure) {
  const rank = principal.activeKeyRank;
  if (typeof rank !== "number" || !Number.isInteger(rank) || rank < 0) return rankUnknownFailure;
  const cap = entitlement?.features?.maxDesktopKeys;
  if (typeof cap === "number" && Number.isInteger(cap) && rank < cap) {
    return { ok: true, scope: "desktop", entitlement };
  }
  return { ok: false, status: 403, error: DESKTOP_KEY_LIMIT_ERROR, reason: "desktop-key-limit" };
}
async function checkBootstrapDesktopKeyBudget(userId, entitlement) {
  const budget = await chargeDesktopKeyBudget({
    userId,
    entitlement,
    pipeline: (commands) => redisPipeline(commands, RATE_LIMIT_REDIS_TIMEOUT_MS)
  });
  if (budget.ok) return { ok: true };
  if (budget.reason === "unavailable") console.warn("[bootstrap-user-api-key] rate-limit unavailable stage=desktop-key-meter");
  return {
    ok: false,
    status: budget.status,
    error: String(budget.body.error),
    body: budget.body,
    headers: budget.headers
  };
}
async function validateBootstrapDesktopKeyAccess(userId) {
  return validateBootstrapEntitlement(userId, DESKTOP_KEY_POLICY);
}
async function validateBootstrapEntitlement(userId, policy) {
  if (!userId || typeof userId !== "string") {
    return { ok: false, status: 403, error: policy.forbiddenError, reason: "missing-user" };
  }
  return coalesce(
    entitlementInFlight,
    `${policy.name}:${userId}`,
    () => validateBootstrapEntitlementUncached(userId, policy)
  );
}
async function validateBootstrapEntitlementUncached(userId, policy) {
  const cacheKey = `entitlements:${ENTITLEMENT_ENV_PREFIX}:${userId}`;
  const cached = await readCachedJson(cacheKey);
  if (cached.status === "hit" && cached.value && typeof cached.value === "object" && (policy.trustsCachedEntry === void 0 || policy.trustsCachedEntry(cached.value))) {
    if (policy.admits(cached.value)) return { ok: true, entitlement: cached.value };
    const cachedBillingFailure = billingVerificationFailure(cached.value, policy.lapsedError);
    if (cachedBillingFailure) return cachedBillingFailure;
    if (notApplicableVerificationTtlSeconds(cached.value) !== null) {
      return { ok: false, status: 403, error: policy.forbiddenError, reason: "cached-forbidden" };
    }
    const validUntil = Number(cached.value.validUntil ?? 0);
    if (Number.isFinite(validUntil) && validUntil >= Date.now()) {
      return { ok: false, status: 403, error: policy.forbiddenError, reason: "cached-forbidden" };
    }
  }
  const result = await postConvexJson(CONVEX_ENTITLEMENTS_PATH, { userId });
  if (!result.ok) {
    return {
      ok: false,
      status: 503,
      error: "Unable to verify API access",
      reason: "entitlement_verification_unavailable",
      unavailable: true,
      headers: noStoreHeaders({
        "Retry-After": String(VALIDATION_RETRY_AFTER_SECONDS),
        "X-Validation-Mode": "degraded",
        "X-Billing-Verification": "entitlement_verification_unavailable"
      })
    };
  }
  if (result.value && typeof result.value === "object") {
    await writeCachedJson(cacheKey, result.value, entitlementCacheTtlSeconds(result.value));
  }
  if (policy.admits(result.value)) return { ok: true, entitlement: result.value };
  const billingFailure = billingVerificationFailure(result.value, policy.lapsedError);
  if (billingFailure) return billingFailure;
  return { ok: false, status: 403, error: policy.forbiddenError, reason: "forbidden" };
}

// api/_canada-alerts-cutover.js
var CANADA_ALERTS_SIBLING_KEY = "alerts:canada:alberta-aea:v1";
var CANADA_ALERTS_LEGACY_KEY = "alerts:alberta-aea:v1";
var CANADA_ALERTS_CUTOVER_FALLBACK_KEYS = Object.freeze([
  CANADA_ALERTS_SIBLING_KEY,
  CANADA_ALERTS_LEGACY_KEY
]);
function extraCanadaAlertsCutoverReadKeys(keys, primaryKey) {
  if (!primaryKey || !keys.includes(primaryKey)) return [];
  return CANADA_ALERTS_CUTOVER_FALLBACK_KEYS.filter((key) => !keys.includes(key));
}
function canadaAlertsCutoverFallbackValue(lookup) {
  for (const key of CANADA_ALERTS_CUTOVER_FALLBACK_KEYS) {
    const fallback2 = lookup.get(key);
    if (fallback2 !== void 0) return fallback2;
  }
  return void 0;
}

// node_modules/aws4fetch/dist/aws4fetch.esm.mjs
var encoder = new TextEncoder();
var HOST_SERVICES = {
  appstream2: "appstream",
  cloudhsmv2: "cloudhsm",
  email: "ses",
  marketplace: "aws-marketplace",
  mobile: "AWSMobileHubService",
  pinpoint: "mobiletargeting",
  queue: "sqs",
  "git-codecommit": "codecommit",
  "mturk-requester-sandbox": "mturk-requester",
  "personalize-runtime": "personalize"
};
var UNSIGNABLE_HEADERS = /* @__PURE__ */ new Set([
  "authorization",
  "content-type",
  "content-length",
  "user-agent",
  "presigned-expires",
  "expect",
  "x-amzn-trace-id",
  "range",
  "connection"
]);
var AwsClient = class {
  constructor({ accessKeyId, secretAccessKey, sessionToken, service, region, cache, retries, initRetryMs }) {
    if (accessKeyId == null) throw new TypeError("accessKeyId is a required option");
    if (secretAccessKey == null) throw new TypeError("secretAccessKey is a required option");
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.sessionToken = sessionToken;
    this.service = service;
    this.region = region;
    this.cache = cache || /* @__PURE__ */ new Map();
    this.retries = retries != null ? retries : 10;
    this.initRetryMs = initRetryMs || 50;
  }
  async sign(input, init) {
    if (input instanceof Request) {
      const { method, url, headers, body } = input;
      init = Object.assign({ method, url, headers }, init);
      if (init.body == null && headers.has("Content-Type")) {
        init.body = body != null && headers.has("X-Amz-Content-Sha256") ? body : await input.clone().arrayBuffer();
      }
      input = url;
    }
    const signer = new AwsV4Signer(Object.assign({ url: input.toString() }, init, this, init && init.aws));
    const signed = Object.assign({}, init, await signer.sign());
    delete signed.aws;
    try {
      return new Request(signed.url.toString(), signed);
    } catch (e) {
      if (e instanceof TypeError) {
        return new Request(signed.url.toString(), Object.assign({ duplex: "half" }, signed));
      }
      throw e;
    }
  }
  async fetch(input, init) {
    for (let i = 0; i <= this.retries; i++) {
      const fetched = fetch(await this.sign(input, init));
      if (i === this.retries) {
        return fetched;
      }
      const res = await fetched;
      if (res.status < 500 && res.status !== 429) {
        return res;
      }
      await new Promise((resolve) => setTimeout(resolve, Math.random() * this.initRetryMs * Math.pow(2, i)));
    }
    throw new Error("An unknown error occurred, ensure retries is not negative");
  }
};
var AwsV4Signer = class {
  constructor({ method, url, headers, body, accessKeyId, secretAccessKey, sessionToken, service, region, cache, datetime, signQuery, appendSessionToken, allHeaders, singleEncode }) {
    if (url == null) throw new TypeError("url is a required option");
    if (accessKeyId == null) throw new TypeError("accessKeyId is a required option");
    if (secretAccessKey == null) throw new TypeError("secretAccessKey is a required option");
    this.method = method || (body ? "POST" : "GET");
    this.url = new URL(url);
    this.headers = new Headers(headers || {});
    this.body = body;
    this.accessKeyId = accessKeyId;
    this.secretAccessKey = secretAccessKey;
    this.sessionToken = sessionToken;
    let guessedService, guessedRegion;
    if (!service || !region) {
      [guessedService, guessedRegion] = guessServiceRegion(this.url, this.headers);
    }
    this.service = service || guessedService || "";
    this.region = region || guessedRegion || "us-east-1";
    this.cache = cache || /* @__PURE__ */ new Map();
    this.datetime = datetime || (/* @__PURE__ */ new Date()).toISOString().replace(/[:-]|\.\d{3}/g, "");
    this.signQuery = signQuery;
    this.appendSessionToken = appendSessionToken || this.service === "iotdevicegateway";
    this.headers.delete("Host");
    if (this.service === "s3" && !this.signQuery && !this.headers.has("X-Amz-Content-Sha256")) {
      this.headers.set("X-Amz-Content-Sha256", "UNSIGNED-PAYLOAD");
    }
    const params = this.signQuery ? this.url.searchParams : this.headers;
    params.set("X-Amz-Date", this.datetime);
    if (this.sessionToken && !this.appendSessionToken) {
      params.set("X-Amz-Security-Token", this.sessionToken);
    }
    this.signableHeaders = ["host", ...this.headers.keys()].filter((header) => allHeaders || !UNSIGNABLE_HEADERS.has(header)).sort();
    this.signedHeaders = this.signableHeaders.join(";");
    this.canonicalHeaders = this.signableHeaders.map((header) => header + ":" + (header === "host" ? this.url.host : (this.headers.get(header) || "").replace(/\s+/g, " "))).join("\n");
    this.credentialString = [this.datetime.slice(0, 8), this.region, this.service, "aws4_request"].join("/");
    if (this.signQuery) {
      if (this.service === "s3" && !params.has("X-Amz-Expires")) {
        params.set("X-Amz-Expires", "86400");
      }
      params.set("X-Amz-Algorithm", "AWS4-HMAC-SHA256");
      params.set("X-Amz-Credential", this.accessKeyId + "/" + this.credentialString);
      params.set("X-Amz-SignedHeaders", this.signedHeaders);
    }
    if (this.service === "s3") {
      try {
        this.encodedPath = decodeURIComponent(this.url.pathname.replace(/\+/g, " "));
      } catch (e) {
        this.encodedPath = this.url.pathname;
      }
    } else {
      this.encodedPath = this.url.pathname.replace(/\/+/g, "/");
    }
    if (!singleEncode) {
      this.encodedPath = encodeURIComponent(this.encodedPath).replace(/%2F/g, "/");
    }
    this.encodedPath = encodeRfc3986(this.encodedPath);
    const seenKeys = /* @__PURE__ */ new Set();
    this.encodedSearch = [...this.url.searchParams].filter(([k]) => {
      if (!k) return false;
      if (this.service === "s3") {
        if (seenKeys.has(k)) return false;
        seenKeys.add(k);
      }
      return true;
    }).map((pair) => pair.map((p) => encodeRfc3986(encodeURIComponent(p)))).sort(([k1, v1], [k2, v2]) => k1 < k2 ? -1 : k1 > k2 ? 1 : v1 < v2 ? -1 : v1 > v2 ? 1 : 0).map((pair) => pair.join("=")).join("&");
  }
  async sign() {
    if (this.signQuery) {
      this.url.searchParams.set("X-Amz-Signature", await this.signature());
      if (this.sessionToken && this.appendSessionToken) {
        this.url.searchParams.set("X-Amz-Security-Token", this.sessionToken);
      }
    } else {
      this.headers.set("Authorization", await this.authHeader());
    }
    return {
      method: this.method,
      url: this.url,
      headers: this.headers,
      body: this.body
    };
  }
  async authHeader() {
    return [
      "AWS4-HMAC-SHA256 Credential=" + this.accessKeyId + "/" + this.credentialString,
      "SignedHeaders=" + this.signedHeaders,
      "Signature=" + await this.signature()
    ].join(", ");
  }
  async signature() {
    const date = this.datetime.slice(0, 8);
    const cacheKey = [this.secretAccessKey, date, this.region, this.service].join();
    let kCredentials = this.cache.get(cacheKey);
    if (!kCredentials) {
      const kDate = await hmac("AWS4" + this.secretAccessKey, date);
      const kRegion = await hmac(kDate, this.region);
      const kService = await hmac(kRegion, this.service);
      kCredentials = await hmac(kService, "aws4_request");
      this.cache.set(cacheKey, kCredentials);
    }
    return buf2hex(await hmac(kCredentials, await this.stringToSign()));
  }
  async stringToSign() {
    return [
      "AWS4-HMAC-SHA256",
      this.datetime,
      this.credentialString,
      buf2hex(await hash(await this.canonicalString()))
    ].join("\n");
  }
  async canonicalString() {
    return [
      this.method.toUpperCase(),
      this.encodedPath,
      this.encodedSearch,
      this.canonicalHeaders + "\n",
      this.signedHeaders,
      await this.hexBodyHash()
    ].join("\n");
  }
  async hexBodyHash() {
    let hashHeader = this.headers.get("X-Amz-Content-Sha256") || (this.service === "s3" && this.signQuery ? "UNSIGNED-PAYLOAD" : null);
    if (hashHeader == null) {
      if (this.body && typeof this.body !== "string" && !("byteLength" in this.body)) {
        throw new Error("body must be a string, ArrayBuffer or ArrayBufferView, unless you include the X-Amz-Content-Sha256 header");
      }
      hashHeader = buf2hex(await hash(this.body || ""));
    }
    return hashHeader;
  }
};
async function hmac(key, string) {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    typeof key === "string" ? encoder.encode(key) : key,
    { name: "HMAC", hash: { name: "SHA-256" } },
    false,
    ["sign"]
  );
  return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(string));
}
async function hash(content) {
  return crypto.subtle.digest("SHA-256", typeof content === "string" ? encoder.encode(content) : content);
}
var HEX_CHARS = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
function buf2hex(arrayBuffer) {
  const buffer = new Uint8Array(arrayBuffer);
  let out = "";
  for (let idx = 0; idx < buffer.length; idx++) {
    const n = buffer[idx];
    out += HEX_CHARS[n >>> 4 & 15];
    out += HEX_CHARS[n & 15];
  }
  return out;
}
function encodeRfc3986(urlEncodedStr) {
  return urlEncodedStr.replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}
function guessServiceRegion(url, headers) {
  const { hostname, pathname } = url;
  if (hostname.endsWith(".on.aws")) {
    const match2 = hostname.match(/^[^.]{1,63}\.lambda-url\.([^.]{1,63})\.on\.aws$/);
    return match2 != null ? ["lambda", match2[1] || ""] : ["", ""];
  }
  if (hostname.endsWith(".r2.cloudflarestorage.com")) {
    return ["s3", "auto"];
  }
  if (hostname.endsWith(".backblazeb2.com")) {
    const match2 = hostname.match(/^(?:[^.]{1,63}\.)?s3\.([^.]{1,63})\.backblazeb2\.com$/);
    return match2 != null ? ["s3", match2[1] || ""] : ["", ""];
  }
  const match = hostname.replace("dualstack.", "").match(/([^.]{1,63})\.(?:([^.]{0,63})\.)?amazonaws\.com(?:\.cn)?$/);
  let service = match && match[1] || "";
  let region = match && match[2];
  if (region === "us-gov") {
    region = "us-gov-west-1";
  } else if (region === "s3" || region === "s3-accelerate") {
    region = "us-east-1";
    service = "s3";
  } else if (service === "iot") {
    if (hostname.startsWith("iot.")) {
      service = "execute-api";
    } else if (hostname.startsWith("data.jobs.iot.")) {
      service = "iot-jobs-data";
    } else {
      service = pathname === "/mqtt" ? "iotdevicegateway" : "iotdata";
    }
  } else if (service === "autoscaling") {
    const targetPrefix = (headers.get("X-Amz-Target") || "").split(".")[0];
    if (targetPrefix === "AnyScaleFrontendService") {
      service = "application-autoscaling";
    } else if (targetPrefix === "AnyScaleScalingPlannerFrontendService") {
      service = "autoscaling-plans";
    }
  } else if (region == null && service.startsWith("s3-")) {
    region = service.slice(3).replace(/^fips-|^external-1/, "");
    service = "s3";
  } else if (service.endsWith("-fips")) {
    service = service.slice(0, -5);
  } else if (region && /-\d$/.test(service) && !/-\d$/.test(region)) {
    [service, region] = [region, service];
  }
  return [HOST_SERVICES[service] || service, region || ""];
}

// api/_bootstrap-r2.js
var MINUTE_MS = 6e4;
var MAX_FUTURE_SKEW_MS = 5 * MINUTE_MS;
var MAX_AGE_MS = Object.freeze({
  fast: 15 * MINUTE_MS,
  slow: 60 * MINUTE_MS
});
var BOOTSTRAP_R2_PROBE_CEILING_MS = 5e3;
function isPlainObject2(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}
function isValidEnvelope(envelope, tier, nowMs) {
  return isPlainObject2(envelope) && envelope.tier === tier && Number.isFinite(envelope.generatedAt) && Number.isInteger(envelope.generatedAt) && envelope.generatedAt <= nowMs + MAX_FUTURE_SKEW_MS && isPlainObject2(envelope.payload) && isPlainObject2(envelope.payload.data) && Array.isArray(envelope.payload.missing);
}
function readConfig(env) {
  const accountId = env.R2_ACCOUNT_ID;
  const endpoint = env.R2_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : "");
  const bucket = env.R2_BOOTSTRAP_BUCKET;
  const accessKeyId = env.R2_BOOTSTRAP_READ_KEY_ID;
  const secretAccessKey = env.R2_BOOTSTRAP_READ_SECRET;
  if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) return null;
  return {
    endpoint: endpoint.replace(/\/+$/, ""),
    bucket,
    accessKeyId,
    secretAccessKey
  };
}
function fallback(reason, startedAt) {
  return {
    status: "fallback",
    reason,
    durationMs: Math.max(0, performance.now() - startedAt)
  };
}
async function readBootstrapTierObject(tier, options = {}) {
  const startedAt = performance.now();
  const {
    timeoutMs,
    nowMs = Date.now(),
    env = process.env,
    awsClientFactory = (config3) => new AwsClient(config3)
  } = options;
  if (!Object.hasOwn(MAX_AGE_MS, tier)) return fallback("invalid", startedAt);
  const config2 = readConfig(env);
  if (!config2) return fallback("unreadable", startedAt);
  let signal;
  let response;
  try {
    signal = AbortSignal.timeout(timeoutMs);
    const client = awsClientFactory({
      accessKeyId: config2.accessKeyId,
      secretAccessKey: config2.secretAccessKey,
      service: "s3",
      region: "auto",
      retries: 0
    });
    response = await client.fetch(
      `${config2.endpoint}/${encodeURIComponent(config2.bucket)}/${tier}.json`,
      {
        method: "GET",
        headers: { "User-Agent": "WorldMonitor Bootstrap/1.0" },
        signal
      }
    );
  } catch (error) {
    const timedOut = signal?.aborted || error?.name === "TimeoutError" || error?.name === "AbortError";
    return fallback(timedOut ? "timeout" : "unreadable", startedAt);
  }
  if (response.status === 404) return fallback("missing", startedAt);
  if (!response.ok) return fallback("unreadable", startedAt);
  let envelope;
  try {
    envelope = await response.json();
  } catch (error) {
    const timedOut = signal?.aborted || error?.name === "TimeoutError" || error?.name === "AbortError";
    return fallback(timedOut ? "timeout" : "invalid", startedAt);
  }
  if (!isValidEnvelope(envelope, tier, nowMs)) {
    return fallback("invalid", startedAt);
  }
  if (nowMs - envelope.generatedAt > MAX_AGE_MS[tier]) {
    return fallback("stale", startedAt);
  }
  return {
    status: "ok",
    payload: envelope.payload,
    generatedAt: envelope.generatedAt,
    durationMs: Math.max(0, performance.now() - startedAt)
  };
}

// api/_usage-telemetry.js
var AXIOM_INGEST_URL = "https://api.axiom.co/v1/datasets/wm_api_usage/ingest";
var TELEMETRY_USER_AGENT = "worldmonitor-edge/1.0";
var TELEMETRY_TIMEOUT_MS = 1500;
var CB_WINDOW_MS = 5 * 60 * 1e3;
var CB_TRIP_FAILURE_RATIO = 0.05;
var CB_MIN_SAMPLES = 20;
var breakerSamples = [];
var breakerTripped = false;
var breakerOpenUntil = 0;
var breakerProbeInFlight = false;
function deriveExecutionRegion(req) {
  const requestId = req.headers.get("x-vercel-id") ?? "";
  return requestId.includes("::") ? requestId.split("::", 1)[0] : null;
}
function recordDelivery(ok, isProbe) {
  const now = Date.now();
  if (isProbe) {
    breakerProbeInFlight = false;
    if (ok) {
      breakerSamples.length = 0;
      breakerTripped = false;
      breakerOpenUntil = 0;
    } else {
      breakerOpenUntil = now + CB_WINDOW_MS;
    }
    return;
  }
  while (breakerSamples.length > 0 && now - breakerSamples[0].ts > CB_WINDOW_MS) breakerSamples.shift();
  breakerSamples.push({ ts: now, ok });
  if (breakerSamples.length < CB_MIN_SAMPLES) {
    breakerTripped = false;
    breakerOpenUntil = 0;
    return;
  }
  breakerTripped = breakerSamples.filter((sample) => !sample.ok).length / breakerSamples.length > CB_TRIP_FAILURE_RATIO;
  breakerOpenUntil = breakerTripped ? now + CB_WINDOW_MS : 0;
}
function deliveryMode() {
  if (!breakerTripped) return "normal";
  if (Date.now() < breakerOpenUntil || breakerProbeInFlight) return null;
  breakerProbeInFlight = true;
  return "probe";
}
function isBootstrapR2Event(event) {
  return event?.event_type === "bootstrap_r2_shadow" || event?.event_type === "bootstrap_r2";
}
function logBootstrapR2DeliveryHealth(failureClass) {
  console.warn(JSON.stringify({
    event_type: "bootstrap_r2_telemetry_delivery",
    failure_class: failureClass,
    breaker_state: breakerTripped ? "open" : "closed"
  }));
}
function recordEventDelivery(event, ok, isProbe, failureClass = null) {
  const wasTripped = breakerTripped;
  recordDelivery(ok, isProbe);
  if (!isBootstrapR2Event(event)) return;
  if (failureClass) logBootstrapR2DeliveryHealth(failureClass);
  if (wasTripped !== breakerTripped) logBootstrapR2DeliveryHealth("breaker_transition");
}
async function deliver2(event) {
  if (process.env.USAGE_TELEMETRY !== "1") return;
  const token = process.env.AXIOM_API_TOKEN;
  if (!token) {
    if (isBootstrapR2Event(event)) logBootstrapR2DeliveryHealth("missing_token");
    return;
  }
  const mode = deliveryMode();
  if (!mode) return;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TELEMETRY_TIMEOUT_MS);
  try {
    const response = await fetch(AXIOM_INGEST_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": TELEMETRY_USER_AGENT
      },
      body: JSON.stringify([event]),
      signal: controller.signal
    });
    recordEventDelivery(
      event,
      response.ok,
      mode === "probe",
      response.ok ? null : "http_error"
    );
  } catch {
    recordEventDelivery(
      event,
      false,
      mode === "probe",
      controller.signal.aborted ? "timeout" : "network_error"
    );
  } finally {
    clearTimeout(timer);
  }
}
function bootstrapR2ShadowDelivery(input) {
  return deliver2({
    event_type: "bootstrap_r2_shadow",
    route: "/api/bootstrap",
    r2_outcome: input.r2Outcome,
    r2_reason: input.r2Reason,
    bootstrap_tier: input.bootstrapTier,
    r2_duration_ms: input.r2DurationMs,
    redis_duration_ms: input.redisDurationMs,
    execution_region: input.executionRegion,
    execution_cold: input.executionCold,
    status: input.status
  });
}
function deliverBootstrapR2Shadow(input) {
  if (process.env.USAGE_TELEMETRY !== "1") return Promise.resolve();
  return bootstrapR2ShadowDelivery(input);
}

// api/bootstrap.js
var config = { runtime: "edge" };
var IRAN_EVENTS_ENABLED = (process.env.IRAN_EVENTS_ENABLED ?? "false").toLowerCase() === "true";
var { cacheKeys: BOOTSTRAP_CACHE_KEYS2 } = resolveBootstrapRegistry({
  iranEventsEnabled: IRAN_EVENTS_ENABLED
});
var SLOW_KEYS = new Set(bootstrapTierKeyNames("slow", { iranEventsEnabled: IRAN_EVENTS_ENABLED }));
var FAST_KEYS = new Set(bootstrapTierKeyNames("fast", { iranEventsEnabled: IRAN_EVENTS_ENABLED }));
function bootstrapRedisReadKeys(keys) {
  const extra = extraCanadaAlertsCutoverReadKeys(keys, BOOTSTRAP_CACHE_KEYS2.canadaAlerts);
  return extra.length > 0 ? [...keys, ...extra] : keys;
}
var TIER_CACHE = {
  slow: "max-age=300, stale-while-revalidate=600, stale-if-error=3600",
  fast: "max-age=60, stale-while-revalidate=120, stale-if-error=900"
};
var TIER_CDN_CACHE = {
  slow: "public, s-maxage=7200, stale-while-revalidate=1800, stale-if-error=7200",
  fast: "public, s-maxage=600, stale-while-revalidate=120, stale-if-error=900"
};
var ON_DEMAND_CACHE_PROFILES = {
  ukmtoIncidents: {
    browser: "max-age=60, stale-while-revalidate=60, stale-if-error=60",
    cdn: "public, s-maxage=60, stale-while-revalidate=60, stale-if-error=60"
  },
  // Correlation cards publish every 5 minutes and have a 30-minute health
  // budget. The conservative complete CDN window is 11m.
  correlationCards: {
    browser: "max-age=60, stale-while-revalidate=60, stale-if-error=300",
    cdn: "public, s-maxage=300, stale-while-revalidate=60, stale-if-error=300"
  },
  // Hourly publisher, 90-minute health budget. The conservative full CDN
  // serving window is 80m, so one failed refresh cannot be hidden past health.
  forecasts: {
    browser: "max-age=300, stale-while-revalidate=300, stale-if-error=1800",
    cdn: "public, s-maxage=3600, stale-while-revalidate=300, stale-if-error=900"
  },
  // Seeded every 15 minutes. Keep the caller-invariant public URL from
  // outliving a complete seed interval; per-group stale/unavailable states
  // remain part of the payload contract.
  chinaDecisionSignals: {
    browser: "max-age=60, stale-while-revalidate=120, stale-if-error=900",
    cdn: "public, s-maxage=900, stale-while-revalidate=120, stale-if-error=900"
  },
  // Both published by seed-provincial-511 on one 15min member interval against
  // a 45min health budget. They only need a profile because #6763 moved them
  // off the fast tier, where they inherited the fast shield: without this the
  // move would have traded 508 KB of universal page weight for a 2h stale
  // window on live road closures.
  canadaRoads: {
    browser: "max-age=60, stale-while-revalidate=120, stale-if-error=900",
    cdn: "public, s-maxage=900, stale-while-revalidate=120, stale-if-error=900"
  },
  albertaRoads: {
    browser: "max-age=60, stale-while-revalidate=120, stale-if-error=900",
    cdn: "public, s-maxage=900, stale-while-revalidate=120, stale-if-error=900"
  },
  manitobaRoads: {
    browser: "max-age=60, stale-while-revalidate=120, stale-if-error=900",
    cdn: "public, s-maxage=900, stale-while-revalidate=120, stale-if-error=900"
  },
  // seed-bundle-canada member interval 30min, 90min health budget. The default
  // 2h shield outlived the budget by half an hour (#6667).
  bcOpen511: {
    browser: "max-age=60, stale-while-revalidate=120, stale-if-error=1800",
    cdn: "public, s-maxage=1800, stale-while-revalidate=300, stale-if-error=1800"
  },
  // seed-bundle-market-backup member interval 15min, 45min health budget. Same
  // defect as bcOpen511: the default 2h shield was 2.6x the budget.
  marketCorrelationSeries: {
    browser: "max-age=60, stale-while-revalidate=120, stale-if-error=900",
    cdn: "public, s-maxage=900, stale-while-revalidate=120, stale-if-error=900"
  },
  // IMD cyclone/port/coastal/marine seeder on a 15min interval against
  // a 45min health budget (#7005). The public on-demand URL would otherwise
  // inherit the 2h slow shield and outlive health's stale declaration.
  imdCycloneMarine: {
    browser: "max-age=60, stale-while-revalidate=120, stale-if-error=900",
    cdn: "public, s-maxage=900, stale-while-revalidate=120, stale-if-error=900"
  },
  // FAA NMS seeder on a 5min interval against a 20min health budget.
  notamAirspace: {
    browser: "max-age=60, stale-while-revalidate=120, stale-if-error=900",
    cdn: "public, s-maxage=300, stale-while-revalidate=120, stale-if-error=900"
  },
  // seed-aviation aggregate, 90min health budget. Default 2h on-demand
  // shield would outlive the budget after #7046 moved this key off FAST.
  flightDelays: {
    browser: "max-age=60, stale-while-revalidate=120, stale-if-error=1800",
    cdn: "public, s-maxage=1800, stale-while-revalidate=300, stale-if-error=1800"
  },
  // seed-live-video-resolved publishes every 6h against an 18h health budget
  // (#8545). A 30-minute shield keeps a fresh video id reaching players within
  // the hour after a refresh; the default 2h shield would hold a rotated id.
  liveVideoResolved: {
    browser: "max-age=300, stale-while-revalidate=300, stale-if-error=1800",
    cdn: "public, s-maxage=1800, stale-while-revalidate=300, stale-if-error=3600"
  }
};
function isAnonymousWeatherBootstrapRequest(req) {
  if (req.method !== "GET" && req.method !== "HEAD") return false;
  const url = new URL(req.url);
  const pathname = stripTrailingSlashes(url.pathname);
  if (pathname !== "/api/bootstrap") return false;
  const params = Array.from(url.searchParams.keys());
  if (params.some((key) => key !== "keys")) return false;
  const keyParams = url.searchParams.getAll("keys");
  if (keyParams.length !== 1) return false;
  const requested = keyParams[0].split(",").map((key) => key.trim()).filter(Boolean);
  return requested.length === 1 && requested[0] === PUBLIC_WEATHER_BOOTSTRAP_KEY;
}
var nextBootstrapR2ShadowProbeIsCold = true;
var scheduleBootstrapR2Shadow = import_functions.waitUntil;
var readBootstrapR2ShadowTier = readBootstrapTierObject;
function shouldMeasureBootstrapR2Shadow(authKind, tier) {
  return process.env.BOOTSTRAP_R2_SHADOW_MEASURE === "1" && process.env.VERCEL_ENV === "production" && authKind === "public-tier" && PUBLIC_BOOTSTRAP_TIERS.has(tier);
}
function finishBootstrapR2ShadowResponse(req, ctx, tier, response, redisDurationMs) {
  const serializedRedisDurationMs = redisDurationMs.toFixed(3);
  response.headers.set("Server-Timing", `wm_bootstrap_redis;dur=${serializedRedisDurationMs}`);
  response.headers.set("X-WorldMonitor-Bootstrap-Redis-Duration", serializedRedisDurationMs);
  response.headers.set("Cache-Control", "no-store");
  const exposedHeaders = response.headers.get("Access-Control-Expose-Headers");
  response.headers.set(
    "Access-Control-Expose-Headers",
    [
      exposedHeaders,
      "Server-Timing",
      "X-WorldMonitor-Bootstrap-Redis-Duration",
      "Age",
      "X-Vercel-Cache",
      "CF-Cache-Status"
    ].filter(Boolean).join(", ")
  );
  const executionCold = nextBootstrapR2ShadowProbeIsCold;
  nextBootstrapR2ShadowProbeIsCold = false;
  const deliverProbeResult = (result) => deliverBootstrapR2Shadow({
    r2Outcome: result.status === "ok" ? "r2" : "fallback",
    r2Reason: result.status === "fallback" ? result.reason : null,
    bootstrapTier: tier,
    r2DurationMs: result.durationMs,
    redisDurationMs,
    executionRegion: deriveExecutionRegion(req) ?? process.env.VERCEL_REGION ?? "unknown",
    executionCold,
    status: response.status
  });
  const probe = readBootstrapR2ShadowTier(tier, {
    timeoutMs: BOOTSTRAP_R2_PROBE_CEILING_MS
  }).then(deliverProbeResult).catch(() => {
    return deliverProbeResult({
      status: "fallback",
      reason: "unreadable",
      durationMs: 0
    });
  });
  try {
    if (typeof ctx?.waitUntil === "function") ctx.waitUntil(probe);
    else scheduleBootstrapR2Shadow(probe);
  } catch {
  }
  return response;
}
var BOOTSTRAP_CREDENTIAL_COOKIES = /* @__PURE__ */ new Set(["wm-session", "__Host-wm-pro-key", "__Host-wm-widget-key"]);
function hasBootstrapCredentialCookie(req) {
  const raw = req.headers.get("Cookie") || req.headers.get("cookie") || "";
  if (!raw) return false;
  for (const part of raw.split(";")) {
    const name = part.trim().split("=", 1)[0];
    if (BOOTSTRAP_CREDENTIAL_COOKIES.has(name)) return true;
  }
  return false;
}
var NEG_SENTINEL2 = "__WM_NEG__";
var compactWildfireBootstrapPayload = compactWildfireDashboardPayload;
async function getCachedJsonBatch(keys, shadowMarkerTier = null) {
  const result = /* @__PURE__ */ new Map();
  if (keys.length === 0) return result;
  const pipeline = keys.map((k) => ["GET", k]);
  if (shadowMarkerTier) {
    pipeline.push(["GET", `bootstrap:r2-shadow-origin-marker:${shadowMarkerTier}`]);
  }
  const data = await redisPipeline(pipeline, 3e3, true);
  if (!Array.isArray(data) || data.length !== pipeline.length) {
    throw new Error("Bootstrap Redis pipeline unavailable");
  }
  for (let i = 0; i < keys.length; i++) {
    const entry = data[i];
    if (!entry || typeof entry !== "object" || !("result" in entry) || entry.error != null) {
      throw new Error("Bootstrap Redis pipeline command failed");
    }
    const raw = entry.result;
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed === NEG_SENTINEL2) continue;
        result.set(keys[i], unwrapEnvelope(parsed).data);
      } catch {
      }
    }
  }
  return result;
}
function authFailure(body, status, cors, extraHeaders = {}) {
  return jsonResponse(body, status, {
    ...cors,
    ...extraHeaders,
    "Cache-Control": "no-store"
  });
}
async function validateBootstrapAuth(req, cors) {
  const headerKey = getHeaderApiKey(req);
  const publicBootstrap = classifyPublicBootstrapRequest(req);
  if (publicBootstrap) {
    return { ok: true, kind: publicBootstrap.authKind };
  }
  if (!headerKey && !hasBootstrapCredentialCookie(req)) {
    if (isAnonymousWeatherBootstrapRequest(req)) {
      return { ok: true, kind: "anonymous-weather" };
    }
  }
  const apiKeyResult = await validateApiKey(req);
  if (!apiKeyResult.required || apiKeyResult.valid) {
    return { ok: true, kind: apiKeyResult.kind || "unknown" };
  }
  if (apiKeyResult.error === USER_API_KEY_GATEWAY_VALIDATION_ERROR && headerKey.startsWith("wm_")) {
    if (!isCanonicalUserApiKey(headerKey)) {
      return {
        ok: false,
        response: authFailure({ error: "Invalid API key" }, 401, cors)
      };
    }
    const rateLimitResult = await checkBootstrapUserApiKeyRateLimit(req);
    if (!rateLimitResult.ok) {
      return {
        ok: false,
        response: authFailure(
          { error: rateLimitResult.error },
          rateLimitResult.status,
          cors,
          rateLimitResult.headers
        )
      };
    }
    const userKeyResult = await validateBootstrapUserApiKeyPrincipal(headerKey);
    if (!userKeyResult.ok) {
      return {
        ok: false,
        response: authFailure(
          { error: userKeyResult.error },
          userKeyResult.status,
          cors,
          userKeyResult.headers
        )
      };
    }
    const entitlementResult = await resolveBootstrapUserKeyAccess(userKeyResult);
    if (!entitlementResult.ok) {
      return {
        ok: false,
        response: authFailure(
          {
            error: entitlementResult.error,
            // Billing-verification denials (#4770) expose their machine-readable
            // code in the body, matching the {error, code} shape the REST
            // gateway emits for the same statuses.
            ...entitlementResult.headers?.["X-Billing-Verification"] ? { code: entitlementResult.reason } : {}
          },
          entitlementResult.status,
          cors,
          entitlementResult.headers
        )
      };
    }
    if (entitlementResult.scope === "desktop") {
      const budget = await checkBootstrapDesktopKeyBudget(userKeyResult.userId, entitlementResult.entitlement);
      if (!budget.ok) {
        return {
          ok: false,
          response: authFailure(budget.body ?? { error: budget.error }, budget.status, cors, budget.headers)
        };
      }
    }
    return { ok: true, kind: "user" };
  }
  const error = apiKeyResult.error === USER_API_KEY_GATEWAY_VALIDATION_ERROR ? "Invalid API key" : apiKeyResult.error;
  return {
    ok: false,
    response: authFailure({ error }, 401, cors)
  };
}
function isPublicBootstrapKind(authKind) {
  return authKind === "public-weather" || authKind === "anonymous-weather" || authKind === "public-tier" || authKind === "public-on-demand";
}
function isSharedCacheableBootstrapKind(authKind) {
  return authKind === "public-weather" || authKind === "public-tier" || authKind === "public-on-demand";
}
function getPublicBootstrapHeaders() {
  return {
    ...getPublicCorsHeaders(),
    "Timing-Allow-Origin": "*"
  };
}
function successCacheHeaders(requestedTier, authKind, cors, onDemandKey = null) {
  const tier = requestedTier ?? (authKind === "public-on-demand" ? "slow" : null);
  if (!isPublicBootstrapKind(authKind)) {
    return {
      ...cors,
      "Cache-Control": "no-store"
    };
  }
  const publicCors = getPublicBootstrapHeaders();
  if (!isSharedCacheableBootstrapKind(authKind)) {
    return {
      ...publicCors,
      "Cache-Control": "no-store"
    };
  }
  const onDemandProfile = authKind === "public-on-demand" ? ON_DEMAND_CACHE_PROFILES[onDemandKey] : null;
  const cacheControl = onDemandProfile?.browser || tier && TIER_CACHE[tier] || "public, s-maxage=600, stale-while-revalidate=120, stale-if-error=900";
  return {
    ...publicCors,
    "Cache-Control": cacheControl,
    "CDN-Cache-Control": onDemandProfile?.cdn || tier && TIER_CDN_CACHE[tier] || TIER_CDN_CACHE.fast
  };
}
var SESSION_BOOTSTRAP_RATE_SCOPE = "bootstrap-session";
var SESSION_BOOTSTRAP_RATE_LIMIT = 120;
async function handler(req, ctx) {
  if (isDisallowedOrigin(req))
    return new Response("Forbidden", { status: 403, headers: { "Cache-Control": "no-store" } });
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS")
    return new Response(null, { status: 204, headers: cors });
  const auth = await validateBootstrapAuth(req, cors);
  if (!auth.ok) return auth.response;
  if (auth.kind === "session") {
    const limited = await checkRateLimit(req, cors, {
      ctx,
      scope: SESSION_BOOTSTRAP_RATE_SCOPE,
      limit: SESSION_BOOTSTRAP_RATE_LIMIT,
      window: "60 s"
    });
    if (limited) return limited;
  }
  const url = new URL(req.url);
  const tier = url.searchParams.get("tier");
  let registry;
  if (tier === "slow" || tier === "fast") {
    const tierSet = tier === "slow" ? SLOW_KEYS : FAST_KEYS;
    registry = Object.fromEntries(Object.entries(BOOTSTRAP_CACHE_KEYS2).filter(([k]) => tierSet.has(k)));
  } else {
    const requested = url.searchParams.get("keys")?.split(",").filter(Boolean).sort();
    registry = requested ? Object.fromEntries(Object.entries(BOOTSTRAP_CACHE_KEYS2).filter(([k]) => requested.includes(k))) : BOOTSTRAP_CACHE_KEYS2;
  }
  const keys = Object.values(registry);
  const names = Object.keys(registry);
  const measureR2Shadow = shouldMeasureBootstrapR2Shadow(auth.kind, tier);
  const redisStartedAt = measureR2Shadow ? performance.now() : null;
  let cached;
  try {
    cached = await getCachedJsonBatch(
      bootstrapRedisReadKeys(keys),
      measureR2Shadow ? tier : null
    );
  } catch {
    const isPublic = isPublicBootstrapKind(auth.kind);
    if (isPublic) {
      const response2 = jsonResponse(
        { error: "Bootstrap service temporarily unavailable" },
        503,
        {
          ...getPublicBootstrapHeaders(),
          "Cache-Control": "no-store",
          "Retry-After": "5"
        }
      );
      return measureR2Shadow ? finishBootstrapR2ShadowResponse(
        req,
        ctx,
        tier,
        response2,
        Math.max(0, performance.now() - redisStartedAt)
      ) : response2;
    }
    return jsonResponse({ data: {}, missing: names }, 200, { ...cors, "Cache-Control": "no-store" });
  }
  const data = {};
  const missing = [];
  for (let i = 0; i < names.length; i++) {
    const raw = keys[i] === BOOTSTRAP_CACHE_KEYS2.canadaAlerts && !cached.has(BOOTSTRAP_CACHE_KEYS2.canadaAlerts) ? canadaAlertsCutoverFallbackValue(cached) : cached.get(keys[i]);
    const val = raw === void 0 ? void 0 : validateImfDataset(names[i], raw);
    if (val !== void 0) {
      data[names[i]] = sanitizeBootstrapValue(names[i], val);
    } else {
      missing.push(names[i]);
    }
  }
  const redisDurationMs = measureR2Shadow ? Math.max(0, performance.now() - redisStartedAt) : null;
  const onDemandKey = auth.kind === "public-on-demand" && names.length === 1 ? names[0] : null;
  const cacheHeaders = onDemandKey && missing.includes(onDemandKey) ? { ...getPublicBootstrapHeaders(), "Cache-Control": "no-store" } : successCacheHeaders(tier, auth.kind, cors, onDemandKey);
  const response = jsonResponse(
    { data, missing },
    200,
    cacheHeaders
  );
  return measureR2Shadow ? finishBootstrapR2ShadowResponse(req, ctx, tier, response, redisDurationMs) : response;
}
var __testing__ = {
  // The real resolver, so the CDN-shield guard in
  // tests/bootstrap-on-demand-cache-budget.test.mts calls the same code the
  // handler does instead of restating the fallback chain.
  successCacheHeaders,
  resetBootstrapR2ShadowForTests() {
    nextBootstrapR2ShadowProbeIsCold = true;
    scheduleBootstrapR2Shadow = import_functions.waitUntil;
    readBootstrapR2ShadowTier = readBootstrapTierObject;
  },
  setWaitUntilForTests(waitUntil2) {
    scheduleBootstrapR2Shadow = waitUntil2;
  },
  setBootstrapR2ShadowReaderForTests(reader) {
    readBootstrapR2ShadowTier = reader;
  }
};
export {
  __testing__,
  compactNaturalEventsDashboardPayload,
  compactWildfireBootstrapPayload,
  config,
  handler as default,
  isAnonymousWeatherBootstrapRequest,
  isPublicOnDemandBootstrapRequest,
  isPublicTierBootstrapRequest,
  isPublicWeatherBootstrapRequest,
  stripXFeedRestrictedFields
};
/*! Bundled license information:

aws4fetch/dist/aws4fetch.esm.mjs:
  (**
   * @license MIT <https://opensource.org/licenses/MIT>
   * @copyright Michael Hart 2024
   *)
*/
