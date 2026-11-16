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
function getPublicCorsHeaders(methods = "GET, OPTIONS") {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": ALLOWED_HEADERS,
    "Access-Control-Expose-Headers": EXPOSED_HEADERS,
    "Access-Control-Max-Age": "3600"
  };
}

// server/_shared/deprecation-policy.ts
var DEPRECATION_POLICY_URL = "https://www.worldmonitor.app/api-versioning.md";
var DEPRECATION_POLICY_LINK = `<${DEPRECATION_POLICY_URL}>; rel="deprecation"; type="text/markdown"`;
var DEPRECATION_REL = /(?:^|,)\s*<[^>]+>\s*;[^,]*\brel="deprecation"/;
function appendDeprecationPolicyLinkToRecord(headers) {
  const existing = headers.Link;
  if (existing && DEPRECATION_REL.test(existing)) return;
  headers.Link = existing ? `${existing}, ${DEPRECATION_POLICY_LINK}` : DEPRECATION_POLICY_LINK;
}

// shared/page-canonical.js
var LINK_TAG = /<link\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi;
var LINK_ATTRIBUTE = /([^\s"'<>/=]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
var FIRST_PARTY_HOST = /(^|\.)worldmonitor\.app$/i;
function declaredHtmlCanonical(html) {
  if (typeof html !== "string") return null;
  const head = html.slice(0, 2e5);
  for (const [tag] of head.matchAll(LINK_TAG)) {
    const attributes = /* @__PURE__ */ new Map();
    for (const [, name, doubleQuoted, singleQuoted, unquoted] of tag.matchAll(LINK_ATTRIBUTE)) {
      const key = name.toLowerCase();
      if (!attributes.has(key)) attributes.set(key, doubleQuoted ?? singleQuoted ?? unquoted ?? "");
    }
    const rel = attributes.get("rel") ?? "";
    if (rel.toLowerCase().split(/[\t\n\f\r ]+/).includes("canonical")) {
      return attributes.get("href")?.trim() || null;
    }
  }
  return null;
}
function pageCanonicalUrl(pageUrl, declaredHref = null) {
  const page = new URL(pageUrl);
  if (declaredHref) {
    try {
      const declared = new URL(declaredHref, page);
      if ((declared.protocol === "https:" || declared.protocol === "http:") && FIRST_PARTY_HOST.test(declared.hostname)) {
        return `${declared.origin}${declared.pathname}`;
      }
    } catch {
    }
  }
  return `${page.origin}${page.pathname}`;
}

// api/_md-url-twin.ts
var MD_TWIN_LOOP_HEADER = "x-wm-md-twin";
var MAX_TWIN_CHARS = 512e3;
var MAX_TWIN_BYTES = 512e3;
var MAX_SIBLING_REDIRECTS = 3;
var NOT_A_DOCUMENT = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };
var SIBLING_FETCH_TIMEOUT_MS = 8e3;
var SIBLING_USER_AGENT = "WorldMonitor-MarkdownTwin/1.0";
var FORWARDED_RESPONSE_HEADERS = [
  "allow",
  "location",
  "retry-after",
  "www-authenticate",
  "x-ratelimit-limit",
  "x-ratelimit-remaining",
  "x-ratelimit-reset"
];
var UNSAFE_PATH_CHARS = /[\x00-\x20\x7f]/;
function isMarkdownTwinPath(pathname) {
  return pathname.startsWith("/") && !UNSAFE_PATH_CHARS.test(pathname) && pathname.endsWith(".md") && pathname.length > 4 && !pathname.includes("..") && !pathname.includes("//") && !pathname.includes("\\");
}
function siblingPathFromMarkdown(markdownPath) {
  if (!isMarkdownTwinPath(markdownPath)) return null;
  if (markdownPath.startsWith("/api/md-twin")) return null;
  const sibling = markdownPath.slice(0, -3);
  return sibling.length > 0 ? sibling : null;
}
function sanitizeMarkdownTwinPath(raw) {
  let candidate = raw.trim();
  if (!candidate.startsWith("/")) candidate = `/${candidate}`;
  if (!candidate.endsWith(".md")) candidate += ".md";
  if (!isMarkdownTwinPath(candidate)) return null;
  if (candidate.startsWith("/api/md-twin")) return null;
  return candidate;
}
function resolveMarkdownTwinPath(req) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  if (pathname === "/api/md-twin" || pathname === "/api/md-twin/") {
    const queryPath = url.searchParams.get("path") ?? url.searchParams.get("mdPath");
    if (!queryPath || queryPath === "$1") return null;
    return sanitizeMarkdownTwinPath(queryPath);
  }
  if (isMarkdownTwinPath(pathname)) return pathname;
  return null;
}
var API_REWRITE_PAGE_PATHS = /* @__PURE__ */ new Set([
  "/docs/mcp",
  "/mcp",
  "/a2a",
  "/ask",
  "/agent/auth",
  "/oauth/token",
  "/oauth/register",
  "/oauth/authorize",
  "/oauth/authorize-pro",
  "/.well-known/oauth-protected-resource",
  "/.well-known/oauth-authorization-server",
  "/.well-known/mcp",
  "/.well-known/mcp.json",
  "/.well-known/http-message-signatures-directory"
]);
var API_REWRITE_PAGE_PREFIXES = [
  "/.well-known/oauth-protected-resource/",
  "/.well-known/oauth-authorization-server/"
];
function namesApiFunction(path) {
  if (path === "/api" || path.startsWith("/api/")) return true;
  let end = path.length;
  while (end > 1 && path.charCodeAt(end - 1) === 47) end -= 1;
  if (API_REWRITE_PAGE_PATHS.has(path.slice(0, end))) return true;
  return API_REWRITE_PAGE_PREFIXES.some((prefix) => path.startsWith(prefix));
}
var MAX_SIBLING_DECODE_LAYERS = 4;
function isPageTwinSibling(pathname) {
  let layer = pathname.toLowerCase();
  for (let depth = 0; depth < MAX_SIBLING_DECODE_LAYERS; depth += 1) {
    let resolved;
    let decoded;
    try {
      resolved = new URL(layer, "https://worldmonitor.invalid").pathname.toLowerCase();
      decoded = decodeURIComponent(layer);
    } catch {
      return false;
    }
    if (namesApiFunction(layer) || namesApiFunction(resolved)) return false;
    if (decoded === layer) return true;
    layer = decoded;
  }
  return false;
}
var HTML_ENTITIES = {
  nbsp: " ",
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'"
};
function decodeHtmlEntities(value) {
  return value.replace(/&(nbsp|amp|lt|gt|quot|apos|#(x[\da-f]+|\d+));/gi, (_, entity, code) => {
    if (code === void 0) return HTML_ENTITIES[entity.toLowerCase()];
    const n = /^x/i.test(code) ? Number.parseInt(code.slice(1), 16) : Number(code);
    const decodable = Number.isInteger(n) && n >= 32 && n <= 1114111 && !(n >= 55296 && n <= 57343);
    return decodable ? String.fromCodePoint(n) : "";
  });
}
function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}
function withoutTrackingParams(href) {
  const hashIndex = href.indexOf("#");
  const pathAndQuery = hashIndex < 0 ? href : href.slice(0, hashIndex);
  const hash = hashIndex < 0 ? "" : href.slice(hashIndex);
  const queryIndex = pathAndQuery.indexOf("?");
  if (queryIndex < 0) return href;
  const params = pathAndQuery.slice(queryIndex + 1).split("&").filter((param) => !/^utm_/i.test(new URLSearchParams(param).keys().next().value ?? ""));
  const query = params.join("&");
  return `${pathAndQuery.slice(0, queryIndex)}${query ? `?${query}` : ""}${hash}`;
}
function htmlToMarkdown(html, fallbackTitle) {
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const title = decodeHtmlEntities(stripTags(titleMatch?.[1] ?? "")) || fallbackTitle;
  const body = html.replace(/<script\b[^>]*>[\s\S]*?<\/script(?:[\t\n\f\r ][^>]*|\/[^>]*)?>/gi, " ").replace(/<style\b[^>]*>[\s\S]*?<\/style(?:[\t\n\f\r ][^>]*|\/[^>]*)?>/gi, " ").replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript(?:[\t\n\f\r ][^>]*|\/[^>]*)?>/gi, " ");
  const main = body.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? body;
  let text = main.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/gi, (_m, inner) => `

# ${stripTags(inner)}

`).replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_m, inner) => `

## ${stripTags(inner)}

`).replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/gi, (_m, inner) => `

### ${stripTags(inner)}

`).replace(/<h4\b[^>]*>([\s\S]*?)<\/h4>/gi, (_m, inner) => `

#### ${stripTags(inner)}

`).replace(/<h5\b[^>]*>([\s\S]*?)<\/h5>/gi, (_m, inner) => `

##### ${stripTags(inner)}

`).replace(/<h6\b[^>]*>([\s\S]*?)<\/h6>/gi, (_m, inner) => `

###### ${stripTags(inner)}

`).replace(
    /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi,
    (_m, href, inner) => {
      const label = stripTags(inner) || href;
      const target = withoutTrackingParams(decodeHtmlEntities(href)).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const link = `[${label}](${target})`;
      return /<div\b/i.test(inner) ? `

${link}

` : link;
    }
  ).replace(
    /<dt\b[^>]*>([\s\S]*?)<\/dt>\s*<dd\b[^>]*>([\s\S]*?)<\/dd>/gi,
    (_m, label, value) => `
- ${stripTags(label)}: ${stripTags(value)}
`
  ).replace(/<li\b[^>]*>([\s\S]*?)<\/li>/gi, (_m, inner) => `
- ${stripTags(inner)}`).replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>/gi, "\n\n").replace(/<\/div>/gi, "\n").replace(/<[^>]+>/g, " ");
  text = decodeHtmlEntities(text).replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
  if (!/^# /m.test(text)) {
    text = text.length > 0 ? `# ${title}

${text}` : `# ${title}`;
  }
  return text.slice(0, MAX_TWIN_CHARS);
}
function jsonToMarkdown(raw, heading) {
  let pretty = raw.trim();
  try {
    const reserialised = JSON.stringify(JSON.parse(raw), null, 2);
    if (reserialised.length <= MAX_TWIN_CHARS) pretty = reserialised;
  } catch {
  }
  return `# ${heading}

\`\`\`json
${pretty}
\`\`\``.slice(0, MAX_TWIN_CHARS);
}
var FRONT_MATTER = /^---\n([\s\S]*?)\n---(?:\n|$)/;
var FRONT_MATTER_KEY = /^([A-Za-z0-9_.-]+):(?:\s|$)/;
function frontMatterOf(markdown) {
  const match = markdown.match(FRONT_MATTER);
  if (!match) return null;
  const lines = (match[1] ?? "").split("\n");
  const isMapping = lines.some((line) => FRONT_MATTER_KEY.test(line)) && lines.every((line) => line.trim() === "" || line.startsWith(" ") || FRONT_MATTER_KEY.test(line));
  return isMapping ? { block: match[0], lines } : null;
}
function quoteFrontMatterValue(line) {
  const entry = line.match(/^([A-Za-z0-9_.-]+):\s*(.*)$/);
  if (!entry) return line;
  const [, key, value = ""] = entry;
  if (value === "" || /^(["']).*\1$/.test(value)) return line;
  return `${key}: ${JSON.stringify(value)}`;
}
function withHeading(markdown, heading) {
  if (/^# /m.test(markdown)) return markdown;
  const block = frontMatterOf(markdown)?.block;
  return block ? `${block}
# ${heading}

${markdown.slice(block.length)}` : `# ${heading}

${markdown}`;
}
function withMarkdownMetadata(markdown, canonical, fallbackTitle) {
  const frontMatter = frontMatterOf(markdown);
  if (frontMatter) {
    if (!canonical) return markdown;
    const lines = frontMatter.lines.filter((line) => !line.startsWith("canonical:")).map(quoteFrontMatterValue);
    lines.push(`canonical: ${JSON.stringify(canonical)}`);
    return `---
${lines.join("\n")}
---
${markdown.slice(frontMatter.block.length)}`;
  }
  const title = markdown.match(/^# (.+)$/m)?.[1] ?? fallbackTitle;
  const canonicalLine = canonical ? `
canonical: ${JSON.stringify(canonical)}` : "";
  return `---
title: ${JSON.stringify(title)}${canonicalLine}
---

${markdown}`;
}
function markdownHeadersFor(canonical, extra, corsHeaders) {
  const { Vary: corsVary, ...cors } = corsHeaders;
  return {
    "Content-Type": "text/markdown; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "public, max-age=3600",
    // The loop-guard header changes the twin response (loop requests get a
    // 404 stub), and so does Origin when the caller's CORS is echoed. The
    // outbound Accept is fixed and auth/cookie/UA are never forwarded, so no
    // other variance needs declaring.
    Vary: corsVary ? `${corsVary}, ${MD_TWIN_LOOP_HEADER}` : MD_TWIN_LOOP_HEADER,
    ...cors,
    Link: canonical ? `<${canonical}>; rel="canonical", ${DEPRECATION_POLICY_LINK}` : DEPRECATION_POLICY_LINK,
    ...extra
  };
}
function inheritedCacheControl(response) {
  const value = response.headers.get("cache-control");
  if (!value) return {};
  return { "Cache-Control": /\b(?:no-store|private|no-cache)\b/i.test(value) ? "no-store" : value };
}
function headingFromPath(pathname) {
  const leaf = pathname.split("/").filter(Boolean).pop() ?? pathname;
  return leaf.replace(/[-_]+/g, " ");
}
async function readSiblingBody(response) {
  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_TWIN_BYTES) {
    try {
      void response.body?.cancel("Sibling response exceeds the markdown twin byte limit").catch(() => {
      });
    } catch {
    }
    throw new Error("Sibling response exceeds the markdown twin byte limit");
  }
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_TWIN_BYTES) {
        try {
          void reader.cancel("Sibling response exceeds the markdown twin byte limit").catch(() => {
          });
        } catch {
        }
        throw new Error("Sibling response exceeds the markdown twin byte limit");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}
async function fetchDeclaredCanonical(siblingUrl, outbound, signal, fetchImpl) {
  try {
    const headers = new Headers(outbound);
    headers.set("accept", "text/html");
    const res = await fetchImpl(siblingUrl, { method: "GET", headers, redirect: "manual", signal });
    if (!res.ok || !/html/i.test(res.headers.get("content-type") ?? "")) {
      void res.body?.cancel().catch(() => {
      });
      return null;
    }
    return declaredHtmlCanonical(await readSiblingBody(res));
  } catch {
    return null;
  }
}
function forwardedResponseHeaders(response) {
  const headers = {};
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers[name] = value;
  }
  return headers;
}
async function buildMarkdownTwinResponse(req, markdownPath, fetchImpl = globalThis.fetch, options = {}) {
  const corsHeaders = { ...options.corsHeaders ?? getPublicCorsHeaders("GET, HEAD, OPTIONS") };
  const markdownHeaders = (canonical2, extra = {}) => markdownHeadersFor(canonical2, extra, corsHeaders);
  const isAllowedSibling = options.isAllowedSibling ?? (() => true);
  if (req.method === "OPTIONS") {
    appendDeprecationPolicyLinkToRecord(corsHeaders);
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return new Response("# Method not allowed\n", {
      status: 405,
      headers: markdownHeaders(null, { Allow: "GET, HEAD, OPTIONS", "X-Robots-Tag": "noindex" })
    });
  }
  if (req.headers.get(MD_TWIN_LOOP_HEADER) === "1") {
    return new Response("# Not found\n", {
      status: 404,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  const sibling = siblingPathFromMarkdown(markdownPath);
  if (!sibling || !isAllowedSibling(sibling)) {
    return new Response("# Not found\n", {
      status: 404,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  const heading = headingFromPath(sibling);
  const requestUrl = new URL(req.url);
  let siblingUrl = new URL(sibling, requestUrl);
  if (siblingUrl.origin !== requestUrl.origin) {
    return new Response("# Not found\n", {
      status: 404,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  if (!isAllowedSibling(siblingUrl.pathname)) {
    return new Response("# Not found\n", {
      status: 404,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  siblingUrl.search = requestUrl.search;
  if (requestUrl.pathname === "/api/md-twin" || requestUrl.pathname === "/api/md-twin/") {
    siblingUrl.searchParams.delete("path");
    siblingUrl.searchParams.delete("mdPath");
  }
  const outbound = new Headers();
  outbound.set("user-agent", SIBLING_USER_AGENT);
  outbound.set(MD_TWIN_LOOP_HEADER, "1");
  outbound.set("accept", "text/markdown, text/html;q=0.9, application/json;q=0.8, text/plain;q=0.7, */*;q=0.1");
  const deadline = AbortSignal.timeout(SIBLING_FETCH_TIMEOUT_MS);
  let siblingRes;
  for (let hops = 0; ; hops += 1) {
    let redirectTarget;
    try {
      siblingRes = await fetchImpl(siblingUrl, {
        method: req.method,
        headers: outbound,
        redirect: "manual",
        signal: deadline
      });
      const location = siblingRes.headers.get("location");
      redirectTarget = siblingRes.status >= 300 && siblingRes.status < 400 && location ? new URL(location, siblingUrl) : null;
    } catch {
      return new Response(`# ${heading}

The sibling page at \`${sibling}\` could not be fetched.
`, {
        status: 502,
        headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
      });
    }
    if (!redirectTarget) break;
    if (redirectTarget.origin !== requestUrl.origin) {
      const body = `# ${heading}

This resource redirects to [${redirectTarget.href}](${redirectTarget.href}).
`;
      return new Response(req.method === "HEAD" ? null : withMarkdownMetadata(body, null, heading), {
        status: 200,
        headers: markdownHeaders(null, { "X-Robots-Tag": "noindex" })
      });
    }
    if (hops >= MAX_SIBLING_REDIRECTS || isMarkdownTwinPath(redirectTarget.pathname) || !isAllowedSibling(redirectTarget.pathname)) {
      return new Response("# Not found\n", {
        status: 404,
        headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
      });
    }
    siblingUrl = redirectTarget;
  }
  const isFailure = !siblingRes.ok;
  const siblingStatus = isFailure ? siblingRes.status : 200;
  const servesCanonicalPage = !isFailure && !siblingUrl.pathname.startsWith("/api/");
  const responseHeaders = {
    ...isFailure ? NOT_A_DOCUMENT : {},
    // An API twin is a rendering of the sibling, so it may be cached no more
    // widely or longer than the sibling allows.
    ...!isFailure && options.inheritSiblingCacheControl ? inheritedCacheControl(siblingRes) : {},
    ...forwardedResponseHeaders(siblingRes)
  };
  const resolveCanonical = async (body, contentType2) => {
    if (!servesCanonicalPage) return null;
    const declared = body !== null && /html/i.test(contentType2) ? declaredHtmlCanonical(body) : await fetchDeclaredCanonical(siblingUrl, outbound, deadline, fetchImpl);
    return pageCanonicalUrl(siblingUrl, declared);
  };
  if (req.method === "HEAD") {
    const canonical2 = await resolveCanonical(null, "");
    return new Response(null, {
      status: siblingStatus,
      headers: markdownHeaders(canonical2, responseHeaders)
    });
  }
  if (siblingStatus === 304) {
    const canonical2 = await resolveCanonical(null, "");
    return new Response(null, {
      status: siblingStatus,
      headers: markdownHeaders(canonical2, responseHeaders)
    });
  }
  let markdown;
  let raw;
  const contentType = siblingRes.headers.get("content-type") ?? "";
  try {
    raw = await readSiblingBody(siblingRes);
    if (/markdown|text\/plain/i.test(contentType) && (/^# /m.test(raw) || FRONT_MATTER.test(raw))) {
      markdown = raw.slice(0, MAX_TWIN_CHARS);
    } else if (/json/i.test(contentType) || raw.trim().startsWith("{") || raw.trim().startsWith("[")) {
      markdown = jsonToMarkdown(raw, heading);
    } else if (/html/i.test(contentType) || /<html|<body|<title/i.test(raw)) {
      markdown = htmlToMarkdown(raw, heading);
    } else if (raw.trim().length === 0) {
      markdown = `# ${heading}
`;
    } else {
      markdown = /^# /m.test(raw) ? raw.slice(0, MAX_TWIN_CHARS) : `# ${heading}

${raw}`.slice(0, MAX_TWIN_CHARS);
    }
    markdown = withHeading(markdown, heading);
  } catch {
    return new Response(`# ${heading}

The sibling page at \`${sibling}\` could not be read.
`, {
      status: 502,
      headers: markdownHeaders(null, { ...NOT_A_DOCUMENT })
    });
  }
  const canonical = await resolveCanonical(raw, contentType);
  return new Response(withMarkdownMetadata(markdown, canonical, heading), {
    status: siblingStatus,
    headers: markdownHeaders(canonical, responseHeaders)
  });
}

// api/md-twin.ts
var config = { runtime: "edge" };
async function handler(req) {
  const markdownPath = resolveMarkdownTwinPath(req);
  if (!markdownPath) {
    return new Response("# Not found\n\nNo markdown twin path was provided.\n", {
      status: 404,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
  return buildMarkdownTwinResponse(req, markdownPath, globalThis.fetch, {
    isAllowedSibling: isPageTwinSibling
  });
}
export {
  config,
  handler as default
};
