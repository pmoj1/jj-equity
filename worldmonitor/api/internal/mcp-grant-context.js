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

// node_modules/jose/dist/webapi/lib/buffer_utils.js
var encoder = new TextEncoder();
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
function decode(input) {
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
    return decode(value);
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
      return decode(key.k);
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
      return decode(jwk.k);
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
      const protectedHeader = decode(jws.protected);
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
  const data = concat(jws.protected !== void 0 ? encode(jws.protected) : new Uint8Array(), encode("."), typeof jws.payload === "string" ? b64 ? encode(jws.payload) : encoder.encode(jws.payload) : jws.payload);
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
    payload = encoder.encode(jws.payload);
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
  const VERSION = "v6.2.2";
  USER_AGENT = `${NAME}/${VERSION}`;
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

// server/cors.ts
var APP_ORIGIN_PATTERN = /^https:\/\/(?:(?:www|app|api|tech|finance|commodity|happy|energy)\.)?worldmonitor\.app$/;
var MAX_ORIGIN_BYTES = 300;
var ORIGIN_ENCODER = new TextEncoder();
var PRODUCTION_PATTERNS = [
  APP_ORIGIN_PATTERN,
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
var ALLOWED_ORIGIN_PATTERNS = process.env.NODE_ENV === "production" ? PRODUCTION_PATTERNS : [...PRODUCTION_PATTERNS, ...DEV_PATTERNS];
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
  if (isAllowedOrigin(azp)) return true;
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
function errMsg(err) {
  return err instanceof Error ? err.message : String(err);
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

// server/_shared/auth-session.ts
var UNVERIFIABLE = { reason: "unverifiable", userId: null, orgId: null, role: null };
function sessionVerificationUnavailableResponse(headers = {}) {
  return renderBillingVerificationDenial(unverifiableEntitlementDenial(), {
    ...headers,
    "Cache-Control": "no-store"
  });
}
async function resolveClerkSession(request, options = {}) {
  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return null;
    const session = await validateBearerToken(authHeader.slice(7), options);
    if (!session.valid) return session.reason === "unverifiable" ? UNVERIFIABLE : null;
    if (!session.userId) return null;
    return {
      userId: session.userId,
      orgId: session.orgId ?? null,
      role: session.role ?? "free",
      sessionId: session.sessionId ?? null
    };
  } catch (err) {
    console.warn(
      "[auth-session] JWT verification failed:",
      err instanceof Error ? err.message : String(err)
    );
    return UNVERIFIABLE;
  }
}
async function resolveSessionUserId(request) {
  const session = await resolveClerkSession(request);
  if (session && "reason" in session) return sessionVerificationUnavailableResponse();
  return session?.userId ?? null;
}

// server/_shared/pro-mcp-gate.ts
function isConfirmedFreeMcpAccount(entitlements, opts) {
  if (entitlements === null) return opts?.backendConfigured === true;
  if (!entitlements || typeof entitlements !== "object") return false;
  const candidate = entitlements;
  return candidate.planKey === "free" && candidate.features?.tier === 0 && candidate.features.mcpAccess === false && typeof candidate.validUntil === "number" && Number.isFinite(candidate.validUntil);
}
function checkProMcpAccess(entitlements, now, opts) {
  if (entitlements && entitlements.features && entitlements.features.tier >= 1 && entitlements.features.mcpAccess === true && hasCurrentEntitlementCoverage(entitlements, now)) {
    return null;
  }
  if (!entitlements && opts?.backendConfigured === false) {
    return { kind: "billing_verification", denial: unverifiableEntitlementDenial() };
  }
  const billingInput = entitlements ? {
    ...entitlements,
    verificationUnavailable: entitlements.verificationUnavailable === true ? true : void 0
  } : entitlements;
  const denial = classifyBillingVerification(billingInput);
  if (denial) {
    if (!denial.retryable) return { kind: "free_account" };
    return { kind: "billing_verification", denial };
  }
  if (isConfirmedFreeMcpAccount(entitlements, opts)) return { kind: "free_account" };
  return { kind: "insufficient_tier" };
}
var GRANT_VERIFICATION_UNAVAILABLE_CODE = "TIER_VERIFICATION_UNAVAILABLE";
var NO_STORE_JSON = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};
function grantSessionVerificationUnavailableResponse() {
  const denial = unverifiableEntitlementDenial();
  return jsonError(
    "SERVICE_UNAVAILABLE",
    "Session verification is temporarily unavailable. Please try again in a moment.",
    503,
    { "Retry-After": String(denial.retryAfterSeconds) }
  );
}
function proMcpGateDenialResponse(gate) {
  if (gate.kind === "insufficient_tier" || gate.kind === "free_account") {
    return jsonError("INSUFFICIENT_TIER", "A WorldMonitor Pro subscription is required.", 403, {});
  }
  const { denial } = gate;
  if (!denial.retryable) {
    return jsonError(
      "INSUFFICIENT_TIER",
      "Your WorldMonitor Pro subscription is no longer active. Renew it, then start the connection again.",
      403,
      { "X-Billing-Verification": denial.code }
    );
  }
  return jsonError(
    GRANT_VERIFICATION_UNAVAILABLE_CODE,
    `Your Pro subscription could not be verified just now (${denial.code}). This is temporary \u2014 retry in a moment.`,
    503,
    {
      "X-Billing-Verification": denial.code,
      "Retry-After": String(denial.retryAfterSeconds)
    }
  );
}
function jsonError(error, error_description, status, extraHeaders) {
  return new Response(JSON.stringify({ error, error_description }), {
    status,
    headers: { ...NO_STORE_JSON, ...extraHeaders }
  });
}

// api/oauth/_redirect-uri.js
function redirectDisplayHost(uri) {
  const u = new URL(uri);
  return u.protocol === "https:" || u.protocol === "http:" ? u.hostname : `${u.protocol}//${u.hostname}`;
}

// api/_crypto.js
async function sha256Hex(str) {
  if (typeof str !== "string") return null;
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

// api/oauth/_browser-binding.js
var OAUTH_BIND_COOKIE = "__Secure-wm_oauth_bind";
var BIND_VALUE_RE = /^[A-Za-z0-9_-]{43}$/;
function readOAuthBindCookie(req, name = OAUTH_BIND_COOKIE) {
  if (name !== OAUTH_BIND_COOKIE && (typeof name !== "string" || !/^__Secure-wm_oauth_bind_[a-f0-9-]{36}$/.test(name))) return null;
  const header = req.headers.get("cookie") ?? "";
  for (const part of header.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() !== name) continue;
    const value = part.slice(eq + 1).trim();
    return BIND_VALUE_RE.test(value) ? value : null;
  }
  return null;
}
function hashOAuthBindValue(value) {
  return sha256Hex(`oauth-bind:${value}`);
}
async function requestMatchesOAuthBinding(req, nonceData) {
  const expected = nonceData?.bind_hash;
  if (typeof expected !== "string" || expected.length !== 64) return false;
  const value = readOAuthBindCookie(req, nonceData.bind_cookie === void 0 ? OAUTH_BIND_COOKIE : nonceData.bind_cookie);
  if (!value) return false;
  const actual = await hashOAuthBindValue(value);
  let diff = 0;
  for (let i = 0; i < 64; i++) diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

// api/oauth/_client-metadata-snapshots.js
var CLIENT_METADATA_SNAPSHOTS = {
  "https://claude.ai/oauth/mcp-oauth-client-metadata": {
    client_id: "https://claude.ai/oauth/mcp-oauth-client-metadata",
    client_name: "Claude",
    redirect_uris: [
      "https://claude.ai/api/mcp/auth_callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token",
      "urn:ietf:params:oauth:grant-type:jwt-bearer"
    ],
    response_types: [
      "code"
    ]
  },
  "https://claude.ai/oauth/claude-code-client-metadata": {
    client_id: "https://claude.ai/oauth/claude-code-client-metadata",
    client_name: "Claude Code",
    redirect_uris: [
      "http://localhost/callback",
      "http://127.0.0.1/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://chatgpt.com/oauth/client.json": {
    client_id: "https://chatgpt.com/oauth/client.json",
    client_name: "ChatGPT",
    redirect_uris: [
      "https://chatgpt.com/connector_platform_oauth_redirect"
    ],
    token_endpoint_auth_method: "private_key_jwt",
    token_endpoint_auth_methods_supported: [
      "none",
      "private_key_jwt"
    ],
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://chatgpt.com/oauth/codex/client.json": {
    client_id: "https://chatgpt.com/oauth/codex/client.json",
    client_name: "Codex",
    redirect_uris: [
      "http://127.0.0.1/callback",
      "http://localhost/callback"
    ],
    token_endpoint_auth_method: "none",
    token_endpoint_auth_methods_supported: [
      "none"
    ],
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://cursor.com/oauth/mcp-client.json": {
    client_id: "https://cursor.com/oauth/mcp-client.json",
    client_name: "Cursor",
    redirect_uris: [
      "https://www.cursor.com/agents/mcp/oauth/callback",
      "https://www.cursor.com/bot/mcp/oauth/callback",
      "https://grok.com/connectors-oauth-exchange-code/",
      "http://localhost:8787/callback",
      "http://127.0.0.1:8787/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://grok.com/oauth/mcp-client.json": {
    client_id: "https://grok.com/oauth/mcp-client.json",
    client_name: "Grok",
    redirect_uris: [
      "https://grok.com/connectors-oauth-exchange-code/",
      "https://console.x.ai/connectors-oauth-exchange-code/"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://vscode.dev/oauth/client-metadata.json": {
    client_id: "https://vscode.dev/oauth/client-metadata.json",
    client_name: "Visual Studio Code",
    redirect_uris: [
      "http://127.0.0.1:33418/",
      "https://vscode.dev/redirect"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token",
      "urn:ietf:params:oauth:grant-type:device_code"
    ],
    response_types: [
      "code"
    ]
  },
  "https://goose-docs.ai/oauth/client-metadata.json": {
    client_id: "https://goose-docs.ai/oauth/client-metadata.json",
    client_name: "goose",
    redirect_uris: [
      "http://127.0.0.1/oauth_callback",
      "http://[::1]/oauth_callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://www.notion.so/oauth/mcp-client-metadata.json": {
    client_id: "https://www.notion.so/oauth/mcp-client-metadata.json",
    client_name: "Notion",
    redirect_uris: [
      "https://www.notion.so/workflows/mcp/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://app.notion.com/oauth/mcp-client-metadata.json": {
    client_id: "https://app.notion.com/oauth/mcp-client-metadata.json",
    client_name: "Notion",
    redirect_uris: [
      "https://app.notion.com/workflows/mcp/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://linear.app/.well-known/oauth-client-metadata/mcp.json": {
    client_id: "https://linear.app/.well-known/oauth-client-metadata/mcp.json",
    client_name: "Linear",
    redirect_uris: [
      "https://linear.app/connect/mcp/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://api.lovable.dev/.well-known/oauth-client": {
    client_id: "https://api.lovable.dev/.well-known/oauth-client",
    client_name: "Lovable",
    redirect_uris: [
      "https://api.lovable.dev/workspaces/connectors/mcp/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://api.factory.ai/mcp/oauth-client": {
    client_id: "https://api.factory.ai/mcp/oauth-client",
    client_name: "Factory Droid",
    redirect_uris: [
      "http://127.0.0.1/callback",
      "http://127.0.0.1:54621/callback",
      "http://127.0.0.1:54622/callback",
      "http://127.0.0.1:54623/callback",
      "https://dev.app.factory.ai/mcp/oauth/callback",
      "https://staging.app.factory.ai/mcp/oauth/callback",
      "https://preprod.app.factory.ai/mcp/oauth/callback",
      "https://app.factory.ai/mcp/oauth/callback",
      "https://dev.app.eu.factory.ai/mcp/oauth/callback",
      "https://staging.app.eu.factory.ai/mcp/oauth/callback",
      "https://preprod.app.eu.factory.ai/mcp/oauth/callback",
      "https://app.eu.factory.ai/mcp/oauth/callback",
      "http://localhost:3002/mcp/oauth/callback",
      "http://127.0.0.1:3002/mcp/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://api.conductor.build/oauth/client-metadata.json": {
    client_id: "https://api.conductor.build/oauth/client-metadata.json",
    client_name: "Conductor",
    redirect_uris: [
      "https://api.conductor.build/oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://www.skydive.com/api/v1/external-oauth/client-metadata": {
    client_id: "https://www.skydive.com/api/v1/external-oauth/client-metadata",
    client_name: "Skydive",
    redirect_uris: [
      "https://www.skydive.com/api/v1/external-oauth/callback"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token"
    ],
    response_types: [
      "code"
    ]
  },
  "https://www.mcpjam.com/.well-known/oauth/client-metadata.json": {
    client_id: "https://www.mcpjam.com/.well-known/oauth/client-metadata.json",
    client_name: "MCPJam",
    redirect_uris: [
      "http://127.0.0.1:6274/oauth/callback",
      "http://127.0.0.1:6274/callback",
      "http://127.0.0.1:6274/oauth/callback/debug",
      "http://localhost:6274/oauth/callback",
      "http://localhost:6274/callback",
      "http://localhost:6274/oauth/callback/debug",
      "http://127.0.0.1:5173/oauth/callback",
      "http://127.0.0.1:5173/oauth/callback/debug",
      "http://localhost:5173/oauth/callback",
      "http://localhost:5173/oauth/callback/debug",
      "https://app.mcpjam.com/oauth/callback",
      "https://app.mcpjam.com/oauth/callback/debug",
      "https://staging.mcpjam.com/oauth/callback",
      "https://staging.mcpjam.com/oauth/callback/debug",
      "https://score.mcpjam.com/oauth/callback",
      "https://score.mcpjam.com/oauth/callback/debug",
      "https://www.score.mcpjam.com/oauth/callback",
      "https://www.score.mcpjam.com/oauth/callback/debug"
    ],
    token_endpoint_auth_method: "none",
    grant_types: [
      "authorization_code",
      "refresh_token",
      "urn:ietf:params:oauth:grant-type:device_code"
    ],
    response_types: [
      "code"
    ]
  }
};

// api/oauth/_client-metadata.js
var TRUSTED_CLIENT_METADATA_URLS = /* @__PURE__ */ new Set([
  // Claude, Claude Code
  "https://claude.ai/oauth/mcp-oauth-client-metadata",
  "https://claude.ai/oauth/claude-code-client-metadata",
  // ChatGPT (stable document, used because we return RFC 9207 `iss`) and Codex
  "https://chatgpt.com/oauth/client.json",
  "https://chatgpt.com/oauth/codex/client.json",
  // Cursor (also lists Grok Bot's callback)
  "https://cursor.com/oauth/mcp-client.json",
  // Grok
  "https://grok.com/oauth/mcp-client.json",
  // VS Code
  "https://vscode.dev/oauth/client-metadata.json",
  // goose
  "https://goose-docs.ai/oauth/client-metadata.json",
  // Notion
  "https://www.notion.so/oauth/mcp-client-metadata.json",
  "https://app.notion.com/oauth/mcp-client-metadata.json",
  // Linear
  "https://linear.app/.well-known/oauth-client-metadata/mcp.json",
  // Lovable
  "https://api.lovable.dev/.well-known/oauth-client",
  // Factory
  "https://api.factory.ai/mcp/oauth-client",
  // Conductor
  "https://api.conductor.build/oauth/client-metadata.json",
  // Skydive
  "https://www.skydive.com/api/v1/external-oauth/client-metadata",
  // MCPJam
  "https://www.mcpjam.com/.well-known/oauth/client-metadata.json"
]);
var TRUSTED_CLIENT_METADATA_PREFIXES = [
  // Vercel Connect: https://connect.vercel.com/connectors/<id>
  { prefix: "https://connect.vercel.com/connectors/", redirectUris: ["https://connect.vercel.com/callback"] }
];
var CONNECTOR_ID = /^[A-Za-z0-9_-]{1,128}$/;
var FETCH_TIMEOUT_MS = 3e3;
var MAX_DOCUMENT_BYTES = 16 * 1024;
var MAX_REDIRECT_URIS = 50;
var MAX_REDIRECT_URI_BYTES = 2 * 1024;
var MAX_CLIENT_NAME_CHARS = 100;
var MAX_CACHE_TTL_SECONDS = 3600;
var DEFAULT_CACHE_TTL_SECONDS = 300;
var USER_AGENT2 = "WorldMonitor-OAuth/1.0 (+https://www.worldmonitor.app/docs/mcp-overview)";
var LOOPBACK_HOSTS = /* @__PURE__ */ new Set(["localhost", "127.0.0.1", "[::1]"]);
var encoder2 = new TextEncoder();
var CLIENT_METADATA_CACHE_PREFIX = "oauth:cimd:";
function isClientMetadataDocumentId(clientId) {
  return typeof clientId === "string" && /^[A-Za-z][A-Za-z0-9+.-]*:/.test(clientId);
}
var ClientMetadataError = class extends Error {
  constructor(reason, transient = false) {
    super(reason);
    this.name = "ClientMetadataError";
    this.reason = reason;
    this.transient = transient;
  }
};
function isIpLiteral(hostname) {
  return hostname.startsWith("[") || /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || /^\d+$/.test(hostname);
}
function checkClientIdUrl(clientId) {
  let u;
  try {
    u = new URL(clientId);
  } catch {
    return "invalid_client_id_url";
  }
  if (u.protocol !== "https:") return "client_id_not_https";
  if (u.href !== clientId) return "client_id_not_canonical";
  if (u.username || u.password || u.hash || u.search || u.port) return "client_id_not_canonical";
  if (u.pathname === "/" || /\/\.\.?(?:\/|$)/.test(u.pathname)) return "client_id_not_canonical";
  const host = u.hostname;
  if (isIpLiteral(host) || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal") || !host.includes(".")) {
    return "client_id_not_public_host";
  }
  return null;
}
function trustedEntry(clientId) {
  if (TRUSTED_CLIENT_METADATA_URLS.has(clientId)) return { redirectUris: null };
  for (const entry of TRUSTED_CLIENT_METADATA_PREFIXES) {
    if (clientId.startsWith(entry.prefix) && CONNECTOR_ID.test(clientId.slice(entry.prefix.length))) {
      return { redirectUris: entry.redirectUris };
    }
  }
  return null;
}
function clientMetadataCacheTtl(cacheControl) {
  if (!cacheControl) return DEFAULT_CACHE_TTL_SECONDS;
  const directives = cacheControl.toLowerCase().split(",").map((d) => d.trim());
  if (directives.some((d) => d === "no-store" || d === "no-cache" || d === "private")) return 0;
  const read = (name) => {
    const d = directives.find((x) => x.startsWith(`${name}=`));
    if (!d) return null;
    const n = Number.parseInt(d.slice(name.length + 1).replace(/^"(.*)"$/, "$1"), 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  const ttl = read("s-maxage") ?? read("max-age") ?? DEFAULT_CACHE_TTL_SECONDS;
  return Math.min(ttl, MAX_CACHE_TTL_SECONDS);
}
async function readCappedBody(resp, signal) {
  if (Number(resp.headers.get("content-length")) > MAX_DOCUMENT_BYTES) {
    throw new ClientMetadataError("document_too_large");
  }
  if (!resp.body) return "";
  const reader = resp.body.getReader();
  const bytes = new Uint8Array(MAX_DOCUMENT_BYTES);
  let total = 0;
  const onAbort = () => {
    void reader.cancel().catch(() => {
    });
  };
  signal.addEventListener("abort", onAbort, { once: true });
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (signal.aborted) throw new ClientMetadataError("document_fetch_timeout", true);
      if (done) break;
      if (value.byteLength > MAX_DOCUMENT_BYTES - total) {
        void reader.cancel().catch(() => {
        });
        throw new ClientMetadataError("document_too_large");
      }
      bytes.set(value, total);
      total += value.byteLength;
    }
  } catch (err) {
    if (err instanceof ClientMetadataError) throw err;
    throw new ClientMetadataError(signal.aborted ? "document_fetch_timeout" : "document_fetch_failed", true);
  } finally {
    signal.removeEventListener("abort", onAbort);
    try {
      reader.releaseLock();
    } catch {
    }
  }
  return new TextDecoder().decode(bytes.subarray(0, total));
}
async function withBodySnippet(err, resp, signal) {
  try {
    err.snippet = (await readCappedBody(resp, signal)).replace(/\s+/g, " ").slice(0, 200);
  } catch {
  }
  return err;
}
async function fetchDocument(clientId, fetchImpl) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  const timeout = new Promise((_, reject) => {
    controller.signal.addEventListener("abort", () => reject(new ClientMetadataError("document_fetch_timeout", true)), { once: true });
  });
  let resp;
  try {
    return await Promise.race([timeout, (async () => {
      try {
        resp = await fetchImpl(clientId, {
          method: "GET",
          redirect: "manual",
          headers: { Accept: "application/json", "User-Agent": USER_AGENT2 },
          signal: controller.signal
        });
      } catch (fetchErr) {
        const failure = new ClientMetadataError(controller.signal.aborted ? "document_fetch_timeout" : "document_fetch_failed", true);
        failure.detail = { error: fetchErr instanceof Error ? `${fetchErr.name}: ${fetchErr.message}` : String(fetchErr) };
        throw failure;
      }
      if (resp.type === "opaqueredirect" || resp.status >= 300 && resp.status < 400) {
        throw new ClientMetadataError("document_redirected");
      }
      if (resp.status === 404 || resp.status === 410) throw new ClientMetadataError("document_not_found");
      if (resp.status !== 200) throw await withBodySnippet(new ClientMetadataError("document_fetch_failed", true), resp, controller.signal);
      if (!/^application\/(?:[\w.+-]+\+)?json\b/i.test(resp.headers.get("content-type") ?? "")) {
        throw await withBodySnippet(new ClientMetadataError("document_not_json", true), resp, controller.signal);
      }
      const text = await readCappedBody(resp, controller.signal);
      let doc;
      try {
        doc = JSON.parse(text);
      } catch {
        throw new ClientMetadataError("document_not_json", true);
      }
      return { doc, ttl: clientMetadataCacheTtl(resp.headers.get("cache-control")) };
    })()]);
  } catch (err) {
    if (err instanceof ClientMetadataError && resp) {
      err.detail = {
        status: resp.status,
        content_type: resp.headers.get("content-type"),
        cf_mitigated: resp.headers.get("cf-mitigated"),
        cf_ray: resp.headers.get("cf-ray"),
        server: resp.headers.get("server"),
        ...err.snippet !== void 0 ? { body: err.snippet } : {}
      };
    }
    throw err;
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
function validateDocument(clientId, doc) {
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) throw new ClientMetadataError("document_not_object");
  if (doc.client_id !== clientId) throw new ClientMetadataError("client_id_mismatch");
  if ("client_secret" in doc || "client_secret_expires_at" in doc) throw new ClientMetadataError("document_has_client_secret");
  const uris = doc.redirect_uris;
  if (!Array.isArray(uris) || uris.length === 0 || uris.length > MAX_REDIRECT_URIS) {
    throw new ClientMetadataError("invalid_redirect_uris");
  }
  for (const uri of uris) {
    if (typeof uri !== "string" || encoder2.encode(uri).byteLength > MAX_REDIRECT_URI_BYTES) {
      throw new ClientMetadataError("invalid_redirect_uris");
    }
  }
  const method = doc.token_endpoint_auth_method;
  const supported = Array.isArray(doc.token_endpoint_auth_methods_supported) ? doc.token_endpoint_auth_methods_supported : [];
  if (method !== void 0 && method !== "none" && !supported.includes("none")) {
    throw new ClientMetadataError("unsupported_token_endpoint_auth_method");
  }
  if (doc.grant_types !== void 0 && !(Array.isArray(doc.grant_types) && doc.grant_types.includes("authorization_code"))) {
    throw new ClientMetadataError("unsupported_grant_types");
  }
  if (doc.response_types !== void 0 && !(Array.isArray(doc.response_types) && doc.response_types.includes("code"))) {
    throw new ClientMetadataError("unsupported_response_types");
  }
  const name = typeof doc.client_name === "string" ? doc.client_name.trim().slice(0, MAX_CLIENT_NAME_CHARS) : "";
  return {
    client_id: clientId,
    client_name: name || new URL(clientId).hostname,
    redirect_uris: uris
  };
}
function isCachedClient(clientId, value) {
  return !!value && typeof value === "object" && value.client_id === clientId && typeof value.client_name === "string" && Array.isArray(value.redirect_uris);
}
async function resolveOAuthClient(clientId, deps) {
  if (typeof clientId !== "string" || clientId.length === 0) return { ok: false, reason: "unknown_client", transient: false };
  if (!isClientMetadataDocumentId(clientId)) {
    let client2;
    try {
      client2 = await deps.redisGet(`oauth:client:${clientId}`);
    } catch {
      return { ok: false, reason: "storage_unavailable", transient: true };
    }
    if (!client2 || typeof client2 !== "object") return { ok: false, reason: "unknown_client", transient: false };
    return { ok: true, client: { ...client2, cimd: false } };
  }
  const urlProblem = checkClientIdUrl(clientId);
  if (urlProblem) return { ok: false, reason: urlProblem, transient: false };
  if (!trustedEntry(clientId)) {
    console.warn("[oauth/cimd] untrusted client_id", JSON.stringify({ client_id: clientId.slice(0, 300) }));
    return { ok: false, reason: "untrusted_client_id", transient: false };
  }
  const cacheKey = `${CLIENT_METADATA_CACHE_PREFIX}${clientId}`;
  try {
    const cached = await deps.redisGet(cacheKey);
    if (isCachedClient(clientId, cached)) return { ok: true, client: { ...cached, cimd: true } };
  } catch {
  }
  let client;
  let ttl;
  try {
    const fetched = await fetchDocument(clientId, deps.fetch ?? ((...args) => globalThis.fetch(...args)));
    client = validateDocument(clientId, fetched.doc);
    ttl = fetched.ttl;
  } catch (err) {
    const failure = err instanceof ClientMetadataError ? { ok: false, reason: err.reason, transient: err.transient } : { ok: false, reason: "document_fetch_failed", transient: true };
    const snapshots = deps.snapshots ?? CLIENT_METADATA_SNAPSHOTS;
    const snapshot = failure.transient && Object.hasOwn(snapshots, clientId) ? snapshots[clientId] : null;
    console.warn("[oauth/cimd] client document unusable", JSON.stringify({
      client_id: clientId,
      reason: failure.reason,
      transient: failure.transient,
      ...snapshot ? { fallback: "snapshot" } : {},
      ...err instanceof ClientMetadataError ? err.detail : { error: err instanceof Error ? `${err.name}: ${err.message}` : String(err) }
    }));
    if (snapshot) return { ok: true, client: { ...validateDocument(clientId, snapshot), cimd: true } };
    return failure;
  }
  if (ttl > 0 && deps.redisSetEx) {
    try {
      await deps.redisSetEx(cacheKey, client, ttl);
    } catch {
    }
  }
  return { ok: true, client: { ...client, cimd: true } };
}
function isLoopbackHttp(u) {
  return u.protocol === "http:" && LOOPBACK_HOSTS.has(u.hostname);
}
function clientDisplayInfo(client, redirectUri) {
  if (!client?.cimd) return { client_host: null, localhost_redirect: false };
  let localhostRedirect = false;
  try {
    localhostRedirect = isLoopbackHttp(new URL(redirectUri));
  } catch {
  }
  return { client_host: new URL(client.client_id).hostname, localhost_redirect: localhostRedirect };
}

// api/internal/mcp-grant-context.ts
var config = { runtime: "edge" };
var NO_STORE_JSON2 = {
  "Content-Type": "application/json",
  "Cache-Control": "no-store"
};
function jsonError2(error, error_description, status) {
  return new Response(JSON.stringify({ error, error_description }), { status, headers: NO_STORE_JSON2 });
}
async function rawRedisGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error("Redis not configured");
  const resp = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(3e3)
  });
  if (!resp.ok) throw new Error(`Redis HTTP ${resp.status}`);
  const data = await resp.json();
  if (!data?.result) return null;
  try {
    return JSON.parse(data.result);
  } catch {
    return null;
  }
}
async function grantContextHandler(req, deps) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: { ...NO_STORE_JSON2, Allow: "GET" }
    });
  }
  const userId = await deps.resolveUserId(req);
  if (userId instanceof Response) return grantSessionVerificationUnavailableResponse();
  if (!userId) {
    return jsonError2("UNAUTHENTICATED", "A valid Clerk session is required.", 401);
  }
  const url = new URL(req.url);
  const nonce = url.searchParams.get("nonce") ?? "";
  if (!nonce) {
    return jsonError2("INVALID_REQUEST", "Missing `nonce` query parameter.", 400);
  }
  const ent = await deps.getEntitlements(userId);
  const gate = checkProMcpAccess(ent, deps.now(), {
    backendConfigured: isEntitlementBackendConfigured()
  });
  if (gate && gate.kind !== "free_account") return proMcpGateDenialResponse(gate);
  let claim;
  try {
    claim = await deps.redisGet(`mcp-grant:${nonce}`);
  } catch {
    return jsonError2("SERVICE_UNAVAILABLE", "Authorization storage is temporarily unavailable.", 503);
  }
  if (claim && typeof claim.userId === "string" && claim.userId !== userId) {
    return jsonError2(
      "NONCE_CLAIMED_BY_OTHER_USER",
      "This authorization request has already been claimed by another account.",
      403
    );
  }
  let nonceData;
  try {
    nonceData = await deps.redisGet(`oauth:nonce:${nonce}`);
  } catch {
    return jsonError2("SERVICE_UNAVAILABLE", "Authorization storage is temporarily unavailable.", 503);
  }
  if (!nonceData || typeof nonceData.client_id !== "string" || typeof nonceData.redirect_uri !== "string") {
    return jsonError2("INVALID_NONCE", "The authorization nonce is missing or expired.", 400);
  }
  if (!await requestMatchesOAuthBinding(req, nonceData)) {
    return jsonError2("BROWSER_MISMATCH", "This authorization was started in a different browser. Start over from your MCP client in this browser.", 403);
  }
  const resolved = await resolveOAuthClient(nonceData.client_id, {
    redisGet: deps.redisGet,
    fetch: deps.fetchClientMetadata
  });
  if (!resolved.ok) {
    if (resolved.transient) {
      return jsonError2("SERVICE_UNAVAILABLE", "Authorization storage is temporarily unavailable.", 503);
    }
    return jsonError2("UNKNOWN_CLIENT", "The OAuth client is not registered.", 400);
  }
  const clientData = resolved.client;
  let redirectHost = "";
  try {
    redirectHost = redirectDisplayHost(nonceData.redirect_uri);
  } catch {
    return jsonError2("INVALID_REDIRECT_URI", "The registered redirect URI is malformed.", 400);
  }
  const client_name = typeof clientData.client_name === "string" && clientData.client_name.length > 0 ? clientData.client_name : "Unknown Client";
  const display = clientDisplayInfo(clientData, nonceData.redirect_uri);
  const body = clientData.cimd ? { client_name, redirect_host: redirectHost, client_host: display.client_host, localhost_redirect: display.localhost_redirect } : { client_name, redirect_host: redirectHost };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: NO_STORE_JSON2
  });
}
async function handler(req) {
  return grantContextHandler(req, {
    resolveUserId: resolveSessionUserId,
    redisGet: rawRedisGet,
    getEntitlements: (userId) => getEntitlements(userId),
    now: () => Date.now()
  });
}
export {
  config,
  handler as default,
  grantContextHandler
};
