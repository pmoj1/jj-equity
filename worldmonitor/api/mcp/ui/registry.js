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

// api/mcp/rpc.ts
function withMcpNoStore(extraHeaders = {}) {
  return { ...extraHeaders, "Cache-Control": "no-store" };
}
function rpcOk(id, result, extraHeaders = {}) {
  return jsonResponse({ jsonrpc: "2.0", id: id ?? null, result }, 200, withMcpNoStore(extraHeaders));
}
function rpcError(id, code, message, extraHeaders = {}, data, status = 200) {
  return jsonResponse(
    {
      jsonrpc: "2.0",
      id: id ?? null,
      error: { code, message, ...data === void 0 ? {} : { data } }
    },
    status,
    withMcpNoStore(extraHeaders)
  );
}

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

// api/mcp/ui/shell.ts
var UI_PROTOCOL_VERSION = "2026-01-26";
var UI_RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";
var UI_CONNECT_DOMAINS = ["https://worldmonitor.app", "https://www.worldmonitor.app"];
var UI_FRAME_ANCESTORS = ["https://chatgpt.com", "https://claude.ai", "https://claude.com"];
function buildUiMeta() {
  return {
    ui: {
      csp: {
        connectDomains: [...UI_CONNECT_DOMAINS],
        resourceDomains: [],
        frameDomains: [],
        baseUriDomains: []
      },
      prefersBorder: true
    }
  };
}
var SHARED_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self' " + UI_CONNECT_DOMAINS.join(" ") + "; frame-ancestors " + UI_FRAME_ANCESTORS.join(" ") + "; form-action 'none'; base-uri 'none'";
var SHARED_STYLE_TOKENS = `
  :root {
    --bg: #ffffff; --fg: #0f172a; --muted: #64748b; --card: #f8fafc;
    --border: #e2e8f0; --accent: #2563eb;
    --low: #16a34a; --moderate: #ca8a04; --high: #ea580c; --severe: #dc2626;
    --up: #16a34a; --down: #dc2626;
  }
  [data-theme="dark"] {
    --bg: #0b1220; --fg: #e5e7eb; --muted: #94a3b8; --card: #131c2e;
    --border: #1e293b; --accent: #60a5fa;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg);
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .wrap { padding: 16px; max-width: 560px; }
  .head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }
  #panel-usage { margin: 0 0 10px; font-size: 11px; color: var(--muted); }
  .title { font-size: 20px; font-weight: 650; letter-spacing: 0.2px; }
  .badge { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); }
  .empty { color: var(--muted); padding: 8px 0; }
  .foot { margin-top: 14px; font-size: 11px; color: var(--muted); }
  a { color: var(--accent); text-decoration: none; }
  .pbar { height: 6px; border-radius: 999px; background: var(--border); overflow: hidden; margin-top: 5px; }
  .pbar > span { display: block; height: 100%; width: 0%; background: var(--accent); }
`;
var SHARED_BRIDGE_HEAD = `
(function () {
  "use strict";
  var parentWin = window.parent;
  var hostCapabilities = {};
  var sourceLinkRequest = null;
  var sourceLinkSerial = 0;

  function post(msg) {
    try { parentWin.postMessage(msg, "*"); } catch (e) { /* host gone */ }
  }
  function notify(method, params) {
    post({ jsonrpc: "2.0", method: method, params: params || {} });
  }

  function showSourceLinkStatus(text) {
    var notice = q("source-link-status");
    if (!notice) {
      notice = el("p");
      notice.id = "source-link-status";
      notice.setAttribute("role", "status");
      q("root").appendChild(notice);
    }
    notice.textContent = text;
    notice.hidden = !text;
    reportSize();
  }
  function finishSourceLink(id, text) {
    if (!sourceLinkRequest || sourceLinkRequest.id !== id) return;
    clearTimeout(sourceLinkRequest.timer);
    sourceLinkRequest = null;
    showSourceLinkStatus(text);
  }
  window.addEventListener("click", function (event) {
    var link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link) return;
    var url = httpUrl(link.getAttribute("href"));
    if (!url) return;
    event.preventDefault();
    if (sourceLinkRequest) return;
    if (!hostCapabilities.openLinks || typeof hostCapabilities.openLinks !== "object" || Array.isArray(hostCapabilities.openLinks)) {
      showSourceLinkStatus("Opening source links is unavailable in this host.");
      return;
    }
    var id = "source-link-" + ++sourceLinkSerial;
    sourceLinkRequest = { id: id, timer: null };
    sourceLinkRequest.timer = setTimeout(function () {
      finishSourceLink(id, "The host did not respond to this source link.");
    }, 30000);
    showSourceLinkStatus("Requesting this source link from the host.");
    try {
      parentWin.postMessage({ jsonrpc: "2.0", id: id, method: "ui/open-link", params: { url: url } }, "*");
    } catch (error) {
      finishSourceLink(id, "The host could not open this source link.");
    }
  });
  window.addEventListener("pagehide", function () {
    if (sourceLinkRequest) finishSourceLink(sourceLinkRequest.id, "");
  });

  // ---- shared render helpers (widget renderBody uses these) ----
  function q(id) { return document.getElementById(id); }
  function num(v) {
    if (v == null) return null;
    var n = typeof v === "number" ? v : Number(v);
    return isFinite(n) ? n : null;
  }
  // Normalise both full array fields and summary:true fields shaped as
  // { count, sample }. The available flag remains false for absent/null/malformed
  // fields so widgets can distinguish a partial cache miss from a real empty
  // array (including { count: 0, sample: [] }).
  function listState(v) {
    if (Array.isArray(v)) return { available: true, items: v };
    if (v && typeof v === "object" && Array.isArray(v.sample)) {
      return { available: true, items: v.sample };
    }
    return { available: false, items: [] };
  }
  function clampPct(n) { return Math.max(0, Math.min(100, n)); }
  function setText(id, text) { var e = q(id); if (e) e.textContent = text == null ? "\u2014" : String(text); }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = String(text);
    return e;
  }
  // Shared 0-100 probability bar: a .pbar node with a filled span, or null when
  // pct is not a finite number. Callers pass an already-0-100 value and append
  // the returned node under a market / forecast row.
  function probabilityBar(pct) {
    if (typeof pct !== "number" || !isFinite(pct)) return null;
    var bar = el("div", "pbar");
    var fill = el("span");
    fill.style.width = clampPct(pct) + "%";
    bar.appendChild(fill);
    return bar;
  }
  function cssVar(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }
  function pctText(v) {
    var n = num(v);
    if (n == null) return "\u2014";
    return (n > 0 ? "+" : "") + n.toFixed(2) + "%";
  }
  function levelFor(score) {
    if (typeof score !== "number" || isNaN(score)) return { label: "Unknown", varName: "--muted" };
    if (score >= 75) return { label: "Severe", varName: "--severe" };
    if (score >= 50) return { label: "High", varName: "--high" };
    if (score >= 25) return { label: "Moderate", varName: "--moderate" };
    return { label: "Low", varName: "--low" };
  }
  // Text helpers centralised here so widget renderBody stays regex/escape-free.
  function collapseWs(s) { return String(s == null ? "" : s).replace(/\\s+/g, " ").trim(); }
  function paragraphs(s) {
    return String(s == null ? "" : s)
      .split(/\\n\\s*\\n/)
      .map(function (p) { return collapseWs(p); })
      .filter(Boolean);
  }
  function httpUrl(u) {
    if (typeof u !== "string") return "";
    try {
      var parsed = new URL(u.trim());
      return (parsed.protocol === "http:" || parsed.protocol === "https:") ? parsed.href : "";
    } catch (e) { return ""; }
  }
  // Reader-facing time: "31 Oct 2026, 11:31 UTC". Returns "" for a missing or
  // unparseable value so callers choose their own "unknown" wording.
  var UTC_MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function utcTime(value) {
    var date = typeof value === "number" || typeof value === "string" && value.trim() ? new Date(value) : null;
    if (!date || !Number.isFinite(date.getTime())) return "";
    var hours = date.getUTCHours(), minutes = date.getUTCMinutes();
    return date.getUTCDate() + " " + UTC_MONTHS[date.getUTCMonth()] + " " + date.getUTCFullYear()
      + ", " + (hours < 10 ? "0" : "") + hours + ":" + (minutes < 10 ? "0" : "") + minutes + " UTC";
  }
  function countryName(code) {
    var c = String(code == null ? "" : code).toUpperCase().slice(0, 2);
    if (!c) return "";
    try {
      var n = new Intl.DisplayNames(["en"], { type: "region" }).of(c);
      return n || c;
    } catch (e) { return c; }
  }

  function reportSize() {
    var root = q("root");
    if (!root) return;
    var h = Math.ceil(root.getBoundingClientRect().height) + 8;
    notify("ui/notifications/size-changed", { height: h });
  }

  function extractToolResult(result) {
    if (!result || typeof result !== "object") return { data: null, renderContext: { kind: "unknown" } };
    if (result.structuredContent && typeof result.structuredContent === "object") {
      var structured = result.structuredContent;
      var kind = "unknown";
      if (!Array.isArray(structured)) {
        if (Object.prototype.hasOwnProperty.call(structured, "projection")) kind = "projection-wrapped";
        else if (!Object.prototype.hasOwnProperty.call(structured, "_attribution") && !softError(structured)) kind = "ordinary-structured";
      }
      return { data: structured, renderContext: { kind: kind } };
    }
    if (Array.isArray(result.content)) {
      for (var i = 0; i < result.content.length; i++) {
        var c = result.content[i];
        if (c && c.type === "text" && typeof c.text === "string") {
          try { return { data: JSON.parse(c.text), renderContext: { kind: "text-fallback" } }; } catch (e) { /* not JSON */ }
        }
      }
    }
    return { data: null, renderContext: { kind: "unknown" } };
  }

  function extractToolData(result) {
    return extractToolResult(result).data;
  }

  function applyTheme(hostContext) {
    var theme = hostContext && hostContext.theme;
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }

  // Soft-error envelopes are SUCCESSFUL tools/call results (HTTP 200, valid
  // JSON) that carry an error sentinel instead of renderable data \u2014 the
  // dispatcher returns { _budget_exceeded, ... } when the tool output exceeds
  // its byte budget, and a bad jmespath projection returns { _jmespath_error,
  // ... }. A few tools also surface user-input faults as a result-level
  // { error: "..." } string. Rendering any of these through renderData() shows
  // a blank / empty-success dashboard, so detect them and surface a visible
  // message instead. Returns the message string, or null when data is genuinely
  // renderable.
  function softError(data) {
    if (!data || typeof data !== "object") return null;
    if (data._budget_exceeded === true) {
      return "This response is too large to display here. Narrow the request (fewer items, or a jmespath projection) and try again.";
    }
    if (data._jmespath_error) {
      return "The response projection could not be applied, so there is nothing to render. Remove the jmespath argument and retry.";
    }
    if (typeof data.error === "string" && data.error) return data.error;
    return null;
  }
  // Every fleet widget owns an #empty placeholder and an #card body; on a soft
  // error we reuse #empty as the error slot (hide the card) so the message is
  // visible regardless of which widget is mounted.
  function showError(msg) {
    var card = q("card");
    if (card) card.style.display = "none";
    var empty = q("empty");
    if (empty) { empty.textContent = msg; empty.style.display = "block"; }
  }

  function safeRender(data, renderContext) {
    var errMsg = softError(data);
    if (errMsg) { showError(errMsg); reportSize(); return; }
    try { renderData(data, renderContext); } catch (e) { /* never break the host on a bad payload */ }
    reportSize();
  }
`;
var PANEL_USAGE_BRIDGE = `
  function showPanelUsage(result) {
    var usage = result && result._meta && result._meta["worldmonitor/usage"];
    var notice = document.getElementById("panel-usage");
    if (!usage || usage.unit !== "requests" || typeof usage.resetsAt !== "string" ||
        (usage.remaining !== null && (typeof usage.remaining !== "number" || !Number.isFinite(usage.remaining) || usage.remaining < 0))) {
      if (notice) notice.hidden = true;
      return;
    }
    if (!notice) {
      notice = document.createElement("p");
      notice.id = "panel-usage";
      notice.setAttribute("role", "status");
      document.getElementById("root").prepend(notice);
    }
    notice.hidden = false;
    var resets = new Date(usage.resetsAt);
    var resetText = Number.isFinite(resets.getTime())
      ? " \xB7 resets " + resets.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
      : "";
    notice.textContent = (usage.remaining === null ? "Unlimited requests" : usage.remaining + " of " + usage.limit + " requests remaining") +
      resetText + ". Opening this panel uses 1 request.";
  }
`;
function renderBridgeTail(appName) {
  return `
  ${PANEL_USAGE_BRIDGE}
  window.addEventListener("message", function (event) {
    if (event.source !== parentWin) return;
    var msg = event.data;
    if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0") return;

    if (sourceLinkRequest && msg.id === sourceLinkRequest.id) {
      if (msg.method && !("result" in msg) && !("error" in msg)) return;
      var result = msg.result;
      var failed = msg.error || !result || typeof result !== "object" || Array.isArray(result) || result.isError === true;
      finishSourceLink(msg.id, failed ? "The host could not open this source link." : "");
      return;
    }

    if (msg.id === 1 && msg.result) {
      hostCapabilities = msg.result.hostCapabilities && typeof msg.result.hostCapabilities === "object" ? msg.result.hostCapabilities : {};
      applyTheme(msg.result.hostContext);
      notify("ui/notifications/initialized", {});
      reportSize();
      return;
    }

    switch (msg.method) {
      case "ui/notifications/tool-result": {
        var result = msg.params && msg.params.result ? msg.params.result : msg.params;
        showPanelUsage(result);
        var extracted = extractToolResult(result);
        if (result && result.isError === true) {
          var message = softError(extracted.data);
          message = typeof message === "string" ? message.replace(/[\\x00-\\x1f\\x7f]/g, "").trim().slice(0, 1000) : "";
          if (!message && Array.isArray(result.content)) {
            for (var i = 0; i < result.content.length; i++) {
              var block = result.content[i];
              if (!block || block.type !== "text" || typeof block.text !== "string") continue;
              message = block.text.replace(/[\\x00-\\x1f\\x7f]/g, "").trim().slice(0, 1000);
              if (message) break;
            }
          }
          extracted = { data: { error: message || "Tool request failed." }, renderContext: { kind: "unknown" } };
        }
        safeRender(extracted.data, extracted.renderContext);
        break;
      }
      case "ui/notifications/tool-input":
        break;
      case "ui/notifications/host-context-changed":
        applyTheme(msg.params && msg.params.hostContext ? msg.params.hostContext : msg.params);
        break;
      default:
        break;
    }
  });

  applyTheme(null);

  post({
    jsonrpc: "2.0",
    id: 1,
    method: "ui/initialize",
    params: {
      protocolVersion: "${UI_PROTOCOL_VERSION}",
      appInfo: { name: ${JSON.stringify(appName)}, version: "1.0.0" },
      appCapabilities: {}
    }
  });
})();
`;
}
function buildAppHtml(spec) {
  const bridge = SHARED_BRIDGE_HEAD + "\n  function renderData(data, renderContext) {\n" + spec.renderBody + "\n  }\n" + renderBridgeTail(spec.appName);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- MCP Apps view quality: uppercase DOCTYPE + color-scheme so the host renders
     light/dark correctly (orank mcp-apps-ui-quality + mcp-view-domain checks). -->
<meta name="color-scheme" content="light dark">
<!-- MCP Apps view CSP (orank mcp-view-csp): all 4 required directive categories
     scoped. Shared across the widget fleet via api/mcp/ui/shell.ts. -->
<meta http-equiv="Content-Security-Policy" content="${SHARED_CSP}">
<title>${spec.title}</title>
<style>${SHARED_STYLE_TOKENS}${spec.styles}</style>
</head>
<body>
<div class="wrap" id="root">
${spec.body}
</div>
<script>${bridge}</script>
</body>
</html>`;
}

// api/mcp/ui/chokepoint-monitor-app.ts
var CHOKEPOINT_NAMES = JSON.stringify(Object.fromEntries(CHOKEPOINT_REGISTRY.map((c) => [c.id, c.displayName])));
var STYLES = `
  .crow { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border); }
  .crow:first-child { border-top: none; }
  .crow-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .cname { font-size: 15px; font-weight: 600; }
  .risk { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600;
    padding: 1px 8px; border-radius: 999px; border: 1px solid var(--border); }
  .risk.unknown { text-transform: none; letter-spacing: 0; font-weight: 400; border-color: transparent; }
  .cstats { display: flex; gap: 18px; margin-top: 6px; flex-wrap: wrap; }
  .cstat { display: flex; flex-direction: column; }
  .cstat .k { font-size: 11px; color: var(--muted); }
  .cstat .v { font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .csum { margin-top: 6px; font-size: 12px; color: var(--muted); }
  .coverage { margin-top: 12px; font-size: 12px; color: var(--muted); overflow-wrap: anywhere; }
  .foot { white-space: pre-line; overflow-wrap: anywhere; }
`;
var BODY = `
  <div class="head">
    <div class="title">Chokepoint Monitor</div>
    <div class="badge">WorldMonitor Maritime</div>
  </div>
  <div class="empty" id="empty">Waiting for chokepoint data\u2026</div>
  <div id="card" style="display:none">
    <div class="coverage" id="coverage"></div>
    <div id="rows"></div>
    <div class="foot" id="foot"></div>
  </div>
`;
var RENDER = `
    var value = data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "projection") ? data.projection : data;
    var envelope = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    var d = envelope.data && typeof envelope.data === "object" && !Array.isArray(envelope.data)
      ? envelope.data : envelope;
    q("empty").style.display = "none";
    q("card").style.display = "block";

    var NAMES = ${CHOKEPOINT_NAMES};
    function prettyName(key) {
      var id = String(key == null ? "" : key);
      if (Object.prototype.hasOwnProperty.call(NAMES, id)) return NAMES[id];
      var words = id.split("_").join(" ").trim().split(" ").filter(Boolean);
      if (!words.length) return "\u2014";
      return words.map(function (w) { return w.charAt(0).toUpperCase() + w.slice(1); }).join(" ");
    }
    // One decimal is enough for a weekly change ("+12.5%").
    function changeText(v) {
      if (v == null) return "\u2014";
      var r = Math.round(v * 10) / 10;
      if (r === 0) r = 0;
      return (r > 0 ? "+" : "") + r.toFixed(1) + "%";
    }
    function riskColor(r) {
      if (r === "critical" || r === "severe") return cssVar("--severe");
      if (r === "high" || r === "elevated") return cssVar("--high");
      if (r === "moderate" || r === "warning") return cssVar("--moderate");
      return r === "normal" || r === "low" ? cssVar("--low") : cssVar("--muted");
    }
    function transitCount(v) {
      return typeof v === "number" && Number.isSafeInteger(v) && v >= 0 ? v : null;
    }
    function clock(v) {
      var ms = NaN;
      if (typeof v === "number") ms = v;
      else if (typeof v === "string" && v.indexOf("T") >= 0) ms = Date.parse(v);
      else if (typeof v === "string" && v.trim() && String(Number(v)) === v.trim()) ms = Number(v);
      if (!Number.isFinite(ms) || ms <= 0) return "";
      return utcTime(ms);
    }
    function stat(k, v, color) {
      var wrap = el("div", "cstat");
      wrap.appendChild(el("span", "k", k));
      var val = el("span", "v", v);
      if (color) val.style.color = color;
      wrap.appendChild(val);
      return wrap;
    }

    var ts = d["transit-summaries"];
    var summaries = ts && typeof ts === "object" ? ts.summaries : null;
    var host = q("rows");
    host.textContent = "";
    var count = 0;
    var keySummary = summaries && typeof summaries === "object" && Array.isArray(summaries.sample_keys);
    if (keySummary) {
      var reported = summaries.count;
      var knownCount = typeof reported === "number" && Number.isFinite(reported) && Number.isInteger(reported) && reported >= summaries.sample_keys.length;
      host.appendChild(el("div", "empty", (knownCount ? reported + " chokepoints reported," : "Chokepoints reported,") +
        " but this response left out their transit figures."));
    } else if (summaries && typeof summaries === "object" && !Array.isArray(summaries)) {
      var keys = Object.keys(summaries);
      for (var i = 0; i < keys.length && count < 20; i++) {
        var s = summaries[keys[i]];
        if (!s || typeof s !== "object" || Array.isArray(s)) continue;
        var historyMissing = s.dataAvailable === false;
        var row = el("div", "crow");
        var head = el("div", "crow-head");
        head.appendChild(el("span", "cname", prettyName(keys[i])));
        var risk = typeof s.riskLevel === "string" ? collapseWs(s.riskLevel).toLowerCase() : "";
        var riskKnown = ["normal", "low", "moderate", "warning", "high", "elevated", "critical", "severe"].indexOf(risk) >= 0;
        if (!riskKnown) risk = "Unknown";
        var badge = el("span", riskKnown ? "risk" : "risk unknown", riskKnown ? risk : "Risk unknown");
        var rc = riskColor(risk);
        badge.style.color = rc;
        badge.style.borderColor = rc;
        head.appendChild(badge);
        row.appendChild(head);

        var stats = el("div", "cstats");
        var countsAvailable = s.todayCountsAvailable === undefined || s.todayCountsAvailable === true;
        var total = countsAvailable ? transitCount(s.todayTotal) : null;
        stats.appendChild(stat("Last 24 hours", total == null ? "\u2014" : String(total)));
        var wow = s.dataAvailable === true && typeof s.wowChangePct === "number" && Number.isFinite(s.wowChangePct) ? s.wowChangePct : null;
        var wowColor = wow == null ? null : (wow >= 0 ? cssVar("--up") : cssVar("--down"));
        stats.appendChild(stat("Week over week", changeText(wow), wowColor));
        var tanker = countsAvailable ? transitCount(s.todayTanker) : null;
        stats.appendChild(stat("Tanker", tanker == null ? "\u2014" : String(tanker)));
        row.appendChild(stats);

        if (historyMissing) row.appendChild(el("div", "csum", "No weekly history, so the weekly change is unknown."));
        else if (s.dataAvailable !== true) row.appendChild(el("div", "csum", "Weekly history status unknown."));
        if (s.riskSummary) row.appendChild(el("div", "csum", collapseWs(s.riskSummary)));
        host.appendChild(row);
        count++;
      }
    }
    if (!count && !keySummary) host.appendChild(el("div", "empty", "No chokepoint transit data available."));

    var transits = d.chokepoint_transits;
    var coverage = transits && typeof transits === "object" ? transits.transitCoverage : null;
    var coverageText = "";
    if (transits && typeof transits === "object" && !Array.isArray(transits)) {
      var covered = coverage && transitCount(coverage.covered);
      var totalRoutes = coverage && transitCount(coverage.total);
      var coverageKnown = covered != null && totalRoutes != null && totalRoutes > 0 && covered <= totalRoutes;
      coverageText = coverageKnown
        ? "Live ship tracking covers " + covered + " of " + totalRoutes + " chokepoints."
        : "Live ship tracking coverage is unknown.";
      var missing = coverage && coverage.missing;
      if (Array.isArray(missing) && missing.every(function(key) { return typeof key === "string" && key.trim().length > 0; })) {
        if (missing.length) coverageText += " Not covered: " + missing.map(prettyName).join(", ") + ".";
      } else coverageText += " Which chokepoints are not covered is unknown.";
    }
    q("coverage").textContent = coverageText;
    var clocks = [];
    var hasDataClock = false;
    if (ts && typeof ts === "object" && !Array.isArray(ts) && (count || keySummary || ts.fetchedAt !== undefined)) {
      var summaryAt = clock(ts.fetchedAt);
      clocks.push(summaryAt ? "Transit counts updated " + summaryAt : "Transit count update time unknown");
      hasDataClock = true;
    }
    if (transits && typeof transits === "object" && !Array.isArray(transits)) {
      var trackingAt = clock(transits.fetchedAt);
      clocks.push(trackingAt ? "Ship tracking updated " + trackingAt : "Ship tracking update time unknown");
      hasDataClock = true;
    }
    var baseline = d["chokepoint-baselines"];
    if (baseline && typeof baseline === "object" && !Array.isArray(baseline)) {
      var year = baseline.referenceYear;
      if (typeof year === "string" && String(Number(year)) === year) year = Number(year);
      var yearKnown = typeof year === "number" && Number.isInteger(year) && year >= 1900 && year <= 9999;
      clocks.push("Energy baseline: " + (typeof baseline.source === "string" && baseline.source.trim() ? collapseWs(baseline.source) : "source unknown") +
        (yearKnown ? ", " + year : ", reference year unknown"));
    }
    // The envelope time is the oldest cached part (often the yearly baseline),
    // so it is shown only when no transit clock is present.
    if (envelope.cached_at !== undefined && !hasDataClock) {
      var cachedAt = clock(envelope.cached_at);
      clocks.push(cachedAt ? "Updated " + cachedAt : "Update time unknown");
    }
    if (envelope.stale === true) clocks.push("Some of this data is out of date.");
    if (envelope.freshnessUnknown === true) clocks.push("Freshness could not be checked.");
    q("foot").textContent = clocks.join("\\n");
`;
var CHOKEPOINT_MONITOR_APP_HTML = buildAppHtml({
  title: "Chokepoint Monitor \u2014 WorldMonitor",
  appName: "worldmonitor-chokepoint-monitor",
  styles: STYLES,
  body: BODY,
  renderBody: RENDER
});

// api/mcp/ui/country-brief-app.ts
var STYLES2 = `
  .lens { display: inline-block; margin: 4px 0 0; font-size: 11px; color: var(--muted); }
  .lens b { color: var(--fg); font-weight: 600; }
  .grounding-notice { margin: 12px 0 0; padding: 10px; border: 1px solid var(--border); border-radius: 6px; color: var(--muted); font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
  .brief { margin: 14px 0 4px; }
  .brief .para { margin: 0 0 10px; font-size: 14px; line-height: 1.6; }
  .brief .brief-head { margin: 14px 0 6px; font-size: 13px; font-weight: 650; color: var(--fg); }
  .brief .brief-head:first-child { margin-top: 0; }
  .brief .para b { font-weight: 600; }
  .src-num { color: var(--muted); font-weight: 400; margin-right: 6px; font-variant-numeric: tabular-nums; }
  .section { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border); }
  .sec-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 8px; }
  .src-row { display: flex; flex-direction: column; gap: 1px; padding: 6px 0; border-bottom: 1px solid var(--border); }
  .src-row:last-child { border-bottom: none; }
  .src-name { font-size: 11px; color: var(--accent); font-weight: 600; }
  .src-title { font-size: 12px; color: var(--fg); }
  .ev-ref { font-size: 10px; color: var(--accent); font-weight: 600; cursor: help; margin-left: 1px; }
  .ev-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: 6px; padding: 4px 0; font-size: 12px; }
  .ev-id { font-size: 10px; color: var(--accent); font-weight: 600; }
  .ev-text { color: var(--fg); }
  .ev-date { font-size: 11px; color: var(--muted); }
`;
var BODY2 = `
  <div class="head">
    <div class="title" id="title">Country Brief</div>
    <div class="badge">WorldMonitor Intelligence</div>
  </div>
  <div class="lens" id="lens" style="display:none"></div>
  <div class="empty" id="empty">Waiting for country-brief data\u2026</div>
  <div id="card" style="display:none">
    <div class="grounding-notice" id="grounding-notice" role="note" style="display:none"></div>
    <div class="brief" id="brief"></div>
    <div class="section" id="src-sec" style="display:none">
      <div class="sec-label">Sources</div>
      <div class="sources" id="sources"></div>
    </div>
    <div class="section" id="ev-sec" style="display:none">
      <div class="sec-label">World Monitor data</div>
      <div id="evidence"></div>
    </div>
    <div class="foot" id="foot"></div>
  </div>
`;
var RENDER2 = `
    if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "projection")) data = data.projection;
    if (!data || typeof data !== "object" || Array.isArray(data)) data = {};
    q("empty").style.display = "none";
    q("card").style.display = "block";

    var groundingNotice = q("grounding-notice");
    groundingNotice.textContent = "";
    groundingNotice.style.display = "none";
    var coverage = data.digestCoverage;
    if (coverage && typeof coverage === "object" && !Array.isArray(coverage) &&
        (coverage.servedStale === true || coverage.state === "stale")) {
      var age = coverage.staleAgeSeconds;
      var howOld = "";
      if (typeof age === "number" && Number.isFinite(age) && age > 0) {
        var amount = age < 60 ? Math.max(1, Math.round(age)) : Math.round(age / 60);
        var unit = age < 60 ? "second" : "minute";
        howOld = amount + " " + unit + (amount === 1 ? "" : "s") + " old";
      }
      // digestCoverage describes the news digest, not the brief: the brief may
      // come from cache or drop stale news, so the age is never tied to it.
      // Known reason codes become a plain cause; anything else is not shown.
      var reasons = { "empty-rebuild": "The latest news update returned no stories", "build-error": "The latest news update failed", "gate-held": "The latest news update was held back by quality checks" };
      var reason = typeof coverage.staleReason === "string" && Object.prototype.hasOwnProperty.call(reasons, coverage.staleReason)
        ? reasons[coverage.staleReason] : "The latest news update could not be confirmed";
      var notice = reason + (howOld ? "; the most recent news on hand is " + howOld : "") + ". This brief may not reflect current news.";
      groundingNotice.textContent = notice;
      groundingNotice.style.display = "block";
    }

    var titleName = collapseWs(data.countryName) || countryName(data.countryCode || data.country_code);
    setText("title", titleName ? titleName + " Brief" : "Country Brief");

    // GetCountryIntelBriefResponse has no framework field \u2014 it is an INPUT
    // only, so this lens pill could never appear. The shared shell drops
    // ui/notifications/tool-input (shell.ts), which is where the argument
    // would have to come from; wiring that is a fleet-wide bridge change.
    q("lens").style.display = "none";

    // Evidence items keyed by id; malformed entries (null, missing or
    // non-string id) are dropped before either the markers or the list use them.
    var evRaw = Array.isArray(data.evidence) ? data.evidence : [];
    var evList = [];
    var evById = {};
    for (var e = 0; e < evRaw.length; e++) {
      var ev = evRaw[e];
      if (!ev || typeof ev !== "object" || typeof ev.id !== "string" || !ev.id) continue;
      if (Object.prototype.hasOwnProperty.call(evById, ev.id)) continue;
      evById[ev.id] = ev;
      evList.push(ev);
    }
    var srcs = Array.isArray(data.sources) ? data.sources : [];
    var linkOriginalCitations = renderContext && renderContext.kind === "ordinary-structured";
    function evAsOf(ev) {
      if (typeof ev.asOf !== "string") return "";
      var day = collapseWs(ev.asOf).slice(0, 10);
      // Only a full YYYY-MM-DD date is reformatted; "2026 Q2" or "2026-09"
      // stay as written rather than gaining a day they never had.
      var full = day.length === 10 && day.charAt(4) === "-" && day.charAt(7) === "-";
      var parsed = full ? utcTime(day + "T00:00:00Z") : "";
      return parsed ? parsed.slice(0, parsed.indexOf(",")) : day;
    }
    function evText(ev) { return (collapseWs(ev.label) || ev.id) + ": " + collapseWs(ev.value); }
    function evHttps(u) { var h = httpUrl(u); return h.indexOf("https:") === 0 ? h : ""; }
    function isDigits(value) { return value.length > 0 && value.length <= 2 && String(Number(value)) === value; }
    // Appends claim text to node. A known "[E<n>]" marker becomes a superscript
    // reference to World Monitor data; a "[<n>]" marker links the numbered
    // source row. Unknown markers stay literal text.
    function appendWithRefs(node, text) {
      var pos = 0, cursor = 0;
      while (pos < text.length) {
        var open = text.indexOf("[", pos);
        if (open < 0) break;
        var close = text.indexOf("]", open + 1);
        var id = close > open + 1 ? text.slice(open + 1, close) : "";
        var evidence = id.charAt(0) === "E" && isDigits(id.slice(1)) && Object.prototype.hasOwnProperty.call(evById, id) ? evById[id] : null;
        var sourceIndex = isDigits(id) ? Number(id) - 1 : -1;
        var source = sourceIndex >= 0 && sourceIndex < Math.min(12, srcs.length) && srcs[sourceIndex] && typeof srcs[sourceIndex] === "object" ? srcs[sourceIndex] : null;
        var sourceUrl = source && linkOriginalCitations ? httpUrl(source.url) : "";
        if (!evidence && !sourceUrl) { pos = open + 1; continue; }
        var before = text.slice(cursor, open);
        if (before.charAt(before.length - 1) === " ") before = before.slice(0, -1);
        node.appendChild(document.createTextNode(before));
        if (evidence) {
          var asOf = evAsOf(evidence);
          var sup = el("sup", "ev-ref", id);
          sup.title = evText(evidence) + (asOf ? " (as of " + asOf + ")" : "");
          node.appendChild(sup);
        } else {
          var link = el("a", null, "[" + id + "]");
          link.href = sourceUrl; link.target = "_blank"; link.rel = "noopener noreferrer";
          node.appendChild(link);
        }
        pos = cursor = close + 1;
      }
      node.appendChild(document.createTextNode(text.slice(cursor)));
    }
    var displayName = collapseWs(data.countryName) || countryName(data.countryCode || data.country_code);
    // Section headings arrive as whole upper-case lines ("SITUATION NOW",
    // "WHAT THIS MEANS FOR IRAN"); show them in sentence case.
    function headingText(line) {
      var heading = collapseWs(line);
      if (heading.charAt(heading.length - 1) === ":") heading = heading.slice(0, -1);
      if (!heading || heading.length > 80 || heading !== heading.toUpperCase() || heading === heading.toLowerCase()) return "";
      // A cited or labelled line is a claim even when written in capitals.
      if (heading.indexOf("[") >= 0 || heading.indexOf(":") >= 0) return "";
      var prefix = "WHAT THIS MEANS FOR ";
      if (heading.indexOf(prefix) === 0 && displayName) return "What this means for " + displayName;
      return heading.charAt(0) + heading.slice(1).toLowerCase();
    }

    var brief = typeof data.brief === "string" ? data.brief
      : (typeof data.summary === "string" ? data.summary : "");
    var briefEl = q("brief");
    briefEl.textContent = "";
    // Each line of the brief is its own claim or heading.
    var lines = brief.split("\\n").map(collapseWs).filter(Boolean);
    for (var l = 0; l < lines.length; l++) {
      var heading = headingText(lines[l]);
      if (heading) { briefEl.appendChild(el("div", "brief-head", heading)); continue; }
      var p = el("p", "para");
      var colon = lines[l].indexOf(":");
      var label = lines[l].indexOf("NEXT ") === 0 && colon > 0 && colon < 20 ? lines[l].slice(0, colon) : "";
      if (label) {
        p.appendChild(el("b", null, "Next " + label.slice(5).toLowerCase() + ": "));
        appendWithRefs(p, collapseWs(lines[l].slice(colon + 1)));
      } else appendWithRefs(p, lines[l]);
      briefEl.appendChild(p);
    }
    if (!briefEl.childNodes.length) briefEl.appendChild(el("div", "empty", "No brief text available."));

    var srcHost = q("sources");
    srcHost.textContent = "";
    // Rows keep their list position so a claim's [n] marker names row n.
    for (var k = 0; k < srcs.length && k < 12; k++) {
      var s = srcs[k];
      if (!s || typeof s !== "object") continue;
      var row = el("div", "src-row");
      var srcName = el("span", "src-name");
      srcName.appendChild(el("span", "src-num", String(k + 1)));
      srcName.appendChild(document.createTextNode(collapseWs(s.source) || "Source"));
      row.appendChild(srcName);
      var url = httpUrl(s.url);
      if (s.title) {
        var titleText = collapseWs(s.title);
        if (url) {
          var a = el("a", "src-title", titleText);
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          row.appendChild(a);
        } else {
          row.appendChild(el("span", "src-title", titleText));
        }
      }
      srcHost.appendChild(row);
    }
    q("src-sec").style.display = srcHost.childNodes.length ? "block" : "none";

    var evHost = q("evidence");
    evHost.textContent = "";
    for (var m = 0; m < evList.length && m < 12; m++) {
      var item = evList[m];
      var evRow = el("div", "ev-row");
      evRow.appendChild(el("span", "ev-id", item.id));
      var evUrl = evHttps(item.url);
      if (evUrl) {
        var link = el("a", "ev-text", evText(item));
        link.href = evUrl;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        evRow.appendChild(link);
      } else {
        evRow.appendChild(el("span", "ev-text", evText(item)));
      }
      var evDate = evAsOf(item);
      if (evDate) evRow.appendChild(el("span", "ev-date", "as of " + evDate));
      evHost.appendChild(evRow);
    }
    q("ev-sec").style.display = evHost.childNodes.length ? "block" : "none";

    // The response still carries model for telemetry; no rendered surface
    // shows it (plan KTD7), so the footer is the generation date alone.
    // generated_at is int64 epoch milliseconds (INT64_ENCODING_NUMBER), so
    // printing it raw read "Generated 1756296000000".
    var genMs = Number(data.generatedAt);
    var genAt = isFinite(genMs) && genMs > 0 ? new Date(genMs) : null;
    var gen = genAt && !isNaN(genAt.getTime())
      ? "Generated " + utcTime(genMs)
      : (data.generatedAt != null ? "Generated " + collapseWs(data.generatedAt) : "");
    q("foot").textContent = gen;
`;
var COUNTRY_BRIEF_APP_HTML = buildAppHtml({
  title: "Country Brief \u2014 WorldMonitor",
  appName: "worldmonitor-country-brief",
  styles: STYLES2,
  body: BODY2,
  renderBody: RENDER2
});

// api/mcp/ui/country-risk-app.ts
var COUNTRY_RISK_APP_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- MCP Apps view quality: uppercase DOCTYPE + color-scheme so the host renders
     light/dark correctly (orank mcp-apps-ui-quality + mcp-view-domain checks). -->
<meta name="color-scheme" content="light dark">
<!-- MCP Apps view CSP (orank mcp-view-csp). Scopes all 4 required directive
     categories: connect-src pins the MCP origin; frame-ancestors allowlists the
     agent hosts that embed this shell; form-action is locked ('none' \u2014 no forms);
     img/script/style-src are specific ('unsafe-inline' keeps the inline bridge +
     styles working) rather than '*'. default-src 'none' earns full credit over a
     permissive default. frame-ancestors is advisory in a <meta> CSP (browsers honor
     it only via HTTP header) but the static scanner reads it here. -->
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://worldmonitor.app https://www.worldmonitor.app; frame-ancestors https://chatgpt.com https://claude.ai https://claude.com; form-action 'none'; base-uri 'none'">
<title>Country Risk \u2014 WorldMonitor</title>
<style>
  :root {
    --bg: #ffffff; --fg: #0f172a; --muted: #64748b; --card: #f8fafc;
    --border: #e2e8f0; --accent: #2563eb;
    --low: #16a34a; --moderate: #ca8a04; --high: #ea580c; --severe: #dc2626;
  }
  [data-theme="dark"] {
    --bg: #0b1220; --fg: #e5e7eb; --muted: #94a3b8; --card: #131c2e;
    --border: #1e293b; --accent: #60a5fa;
    /* The severity ramp needs dark variants too: the light values sit at
       3.5:1 on --card, under WCAG AA for the 12px degraded banner \u2014 the one
       element whose whole job is being noticed during an outage. */
    --low: #4ade80; --moderate: #facc15; --high: #fb923c; --severe: #f87171;
  }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: var(--bg); color: var(--fg);
    font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  .wrap { padding: 16px; max-width: 520px; }
  .head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 12px; }
  .country { min-width: 0; overflow-wrap: anywhere; font-size: 20px; font-weight: 650; letter-spacing: 0.2px; }
  .badge { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em;
    color: var(--muted); }
  .cii-row { display: flex; align-items: center; gap: 14px; margin: 14px 0 4px; }
  .cii-score { font-size: 40px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; }
  .cii-of { color: var(--muted); font-size: 13px; }
  .level { font-weight: 600; font-size: 13px; padding: 2px 10px; border-radius: 999px;
    background: var(--card); border: 1px solid var(--border); }
  .bar { height: 8px; border-radius: 999px; background: var(--border); overflow: hidden; margin: 6px 0 18px; }
  .bar > span { display: block; height: 100%; background: var(--accent); width: 0%; transition: width .3s ease; }
  .components { display: grid; grid-template-columns: 1fr; gap: 10px; }
  .comp { }
  .comp-top { display: flex; justify-content: space-between; font-size: 12px; color: var(--muted); }
  .comp-name { color: var(--fg); font-weight: 550; }
  .degraded { margin: 0 0 14px; padding: 8px 10px; border-radius: 8px; font-size: 12px;
    color: var(--severe); background: var(--card); border: 1px solid var(--severe); }
  .comp-bar { height: 6px; border-radius: 999px; background: var(--border); overflow: hidden; margin-top: 4px; }
  .comp-bar > span { display: block; height: 100%; width: 0%; }
  .meta { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border);
    display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; font-size: 12px; }
  .meta .k { color: var(--muted); }
  .meta .v { min-width: 0; overflow-wrap: anywhere; font-weight: 600; }
  .foot { margin-top: 14px; font-size: 11px; color: var(--muted); }
  .empty { color: var(--muted); padding: 8px 0; }
  #panel-usage { margin: 0 0 10px; font-size: 11px; color: var(--muted); }
  a { color: var(--accent); text-decoration: none; }
</style>
</head>
<body>
<div class="wrap" id="root">
  <div class="empty" id="empty">Waiting for country-risk data\u2026</div>
  <div id="card" style="display:none">
    <div class="head">
      <div class="country" id="country">\u2014</div>
      <div class="badge" id="badge">Country Instability Index</div>
    </div>
    <!-- upstreamUnavailable: a required upstream read failed, so the zeroed risk
         fields mean UNKNOWN. Without this banner an outage renders exactly
         like a calm, low-risk country. -->
    <div class="degraded" id="degraded" style="display:none">
      Risk data could not be loaded, so the scores below are unknown, not low.
    </div>
    <div class="cii-row">
      <div class="cii-score" id="cii">\u2014</div>
      <div class="cii-of">/ 100</div>
      <div class="level" id="level">\u2014</div>
    </div>
    <div class="bar"><span id="ciibar"></span></div>
    <div class="components" id="components"></div>
    <div class="meta">
      <div class="k">Structural baseline</div><div class="v" id="baseline">\u2014</div>
      <div class="k">24-hour change (approx.)</div><div class="v" id="movement">\u2014</div>
      <div class="k">Travel advisory</div><div class="v" id="advisory">\u2014</div>
      <div class="k">Sanctions exposure</div><div class="v" id="sanctions">\u2014</div>
      <div class="k">Trend</div><div class="v" id="trend">\u2014</div>
    </div>
    <div class="foot" id="movement-note" style="display:none">A change of 0 can mean no movement, or that there was no earlier reading to compare.</div>
    <div class="foot" id="display-note" style="display:none"></div>
    <div class="foot" id="foot"></div>
  </div>
</div>
<script>
(function () {
  "use strict";
  var parentWin = window.parent;

  function post(msg) {
    // Opaque sandbox origin: the host expects "*" and validates on its side.
    try { parentWin.postMessage(msg, "*"); } catch (e) { /* host gone */ }
  }
  function notify(method, params) {
    post({ jsonrpc: "2.0", method: method, params: params || {} });
  }

  function ciiLevelFor(score) {
    if (typeof score !== "number" || !isFinite(score)) return { label: "Unknown", varName: "--muted" };
    if (score >= 81) return { label: "Critical", varName: "--severe" };
    if (score >= 66) return { label: "High", varName: "--high" };
    if (score >= 51) return { label: "Elevated", varName: "--moderate" };
    if (score >= 31) return { label: "Normal", varName: "--low" };
    return { label: "Low", varName: "--low" };
  }
  // Only real numbers and numeric strings become numbers. A bare Number()
  // coerces null, "", and [] to 0, which would render a MISSING score as a
  // reassuring 0 \u2014 the same "absent read as calm" failure as the outage path.
  function num(v) {
    if (typeof v === "number") return isFinite(v) ? v : null;
    if (typeof v === "string" && v.trim() !== "") {
      var n = Number(v);
      return isFinite(n) ? n : null;
    }
    return null;
  }
  function clampPct(n) { return Math.max(0, Math.min(100, n)); }
  // Scores print with thousands separators and at most one decimal.
  function round1(n) { var r = Math.round(n * 10) / 10; return r === 0 ? 0 : r; }
  function fmt(n) { return round1(n).toLocaleString("en-US"); }
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function utcTime(ms) {
    var d = new Date(ms);
    if (isNaN(d.getTime())) return "";
    function two(v) { return v < 10 ? "0" + v : String(v); }
    return d.getUTCDate() + " " + MONTHS[d.getUTCMonth()] + " " + d.getUTCFullYear() + ", " +
      two(d.getUTCHours()) + ":" + two(d.getUTCMinutes()) + " UTC";
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text == null ? "\u2014" : String(text);
  }

  // Server strings are collapsed and capped before they reach the DOM. The
  // sibling shells get this from shell.ts's collapseWs; this shell is
  // hand-rolled, and the tool's 256 KB output budget means an unbounded value
  // could flood a cell and push a huge height back to the host.
  // NOTE the doubled backslash: this file is a TS template literal, so a bare
  // \\s would reach the browser as a literal "s" and collapse every letter s
  // in the value. shell.ts:189 escapes the same way for the same reason.
  function cleanText(s, max) {
    return String(s == null ? "" : s).replace(/\\s+/g, " ").trim().slice(0, max);
  }
  // GetCountryRiskResponse.advisory_level is a plain string ("do-not-travel",
  // "reconsider", "caution", \u2026), empty when no advisory applies.
  function describeAdvisory(level) {
    if (typeof level !== "string") return "\u2014";
    var text = cleanText(level, 64).replace(/[-_]+/g, " ");
    return text === "" ? "None" : text.charAt(0).toUpperCase() + text.slice(1);
  }
  // Sanctions arrive as two scalars, not a collection: sanctions_active plus
  // sanctions_count. count alone is enough to render, but active is the
  // authoritative flag, so an active designation with an unknown count still
  // reads as active rather than as "None".
  function describeSanctions(active, count) {
    // Count first, so a positive one is never discarded. The producer keeps
    // the two coupled today (sanctionsActive = sanctionsCount > 0), but the
    // schema declares them independently and nothing enforces that, and
    // "designations exist but we printed None" is the precise failure this
    // shell was fixed to stop making.
    var n = num(count);
    if (n != null && n > 0) return fmt(n) + (n === 1 ? " sanctions listing" : " sanctions listings");
    if (active === true) return "Active";
    if (active === false) return "None";
    return "\u2014";
  }
  var TREND_LABELS = {
    TREND_DIRECTION_RISING: "Rising",
    TREND_DIRECTION_STABLE: "Stable",
    TREND_DIRECTION_FALLING: "Falling"
  };
  function describeTrend(trend) {
    if (typeof trend !== "string") return "\u2014";
    // Require a string hit: a bare lookup also finds inherited members, so a
    // payload sending trend "constructor" or "__proto__" would render an
    // Object internal into the row instead of the em-dash.
    var label = TREND_LABELS[trend];
    return typeof label === "string" ? label : "\u2014";
  }
  // The four CiiComponents wire names are historical and do not describe what
  // they measure (cii_contribution is unrest, geo_convergence is armed
  // conflict, military_activity is security/mobility). Label them by meaning \u2014
  // see proto/worldmonitor/intelligence/v1/intelligence.proto.
  var COMPONENTS = [
    { key: "ciiContribution", label: "Domestic unrest" },
    { key: "geoConvergence", label: "Armed conflict" },
    { key: "militaryActivity", label: "Security & mobility" },
    { key: "newsActivity", label: "Information environment" }
  ];

  function render(data) {
    if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "projection")) data = data.projection;
    if (!data || typeof data !== "object" || Array.isArray(data)) data = {};
    document.getElementById("empty").style.display = "none";
    document.getElementById("card").style.display = "block";

    var degraded = data.upstreamUnavailable === true;
    document.getElementById("degraded").style.display = degraded ? "block" : "none";

    setText("country", cleanText(data.countryName, 64) || cleanText(data.countryCode, 8) || "\u2014");

    // cii is a CiiScore object; combinedScore is the headline 0-100 number.
    var score = (data.cii && typeof data.cii === "object") ? data.cii : {};
    var cii = degraded ? null : num(score.combinedScore);
    setText("cii", cii == null ? "\u2014" : String(Math.round(cii)));
    var lv = ciiLevelFor(cii);
    var levelEl = document.getElementById("level");
    var bar = document.getElementById("ciibar");
    levelEl.textContent = lv.label;
    // The host can post a second tool-result into this same shell, so every
    // branch must fully own the score visuals. Leaving them untouched when
    // cii is null let an outage inherit the PREVIOUS country's severity \u2014
    // "Unknown" in red above a full red bar \u2014 which is the exact
    // outage-reads-as-a-verdict failure this shell exists to prevent.
    if (cii == null) {
      levelEl.style.color = "";
      bar.style.width = "0%";
      bar.style.background = "";
    } else {
      var color = getComputedStyle(document.documentElement).getPropertyValue(lv.varName).trim();
      levelEl.style.color = color;
      bar.style.width = clampPct(cii) + "%";
      bar.style.background = color || "var(--accent)";
    }

    var comps = (score.components && typeof score.components === "object") ? score.components : {};
    var host = document.getElementById("components");
    host.textContent = "";
    var any = false;
    COMPONENTS.forEach(function (spec) {
      var val = degraded ? null : num(comps[spec.key]);
      if (val == null) return;
      any = true;
      var wrap = document.createElement("div");
      wrap.className = "comp";
      var top = document.createElement("div");
      top.className = "comp-top";
      var name = document.createElement("span");
      name.className = "comp-name";
      name.textContent = spec.label;
      var v = document.createElement("span");
      v.textContent = String(Math.round(val));
      top.appendChild(name); top.appendChild(v);
      var cbar = document.createElement("div");
      cbar.className = "comp-bar";
      var fill = document.createElement("span");
      // Same colour bands as the headline score, so one colour means one level.
      var cl = ciiLevelFor(val);
      var ccolor = getComputedStyle(document.documentElement).getPropertyValue(cl.varName).trim();
      fill.style.width = clampPct(val) + "%";
      fill.style.background = ccolor || "var(--accent)";
      cbar.appendChild(fill);
      wrap.appendChild(top); wrap.appendChild(cbar);
      host.appendChild(wrap);
    });
    if (!any) {
      var none = document.createElement("div");
      none.className = "empty";
      // The outage banner above already says why; this line only marks the gap.
      none.textContent = degraded ? "Breakdown unknown." : "No component breakdown available.";
      host.appendChild(none);
    }

    var baseline = degraded ? null : num(score.staticBaseline);
    var movement = degraded ? null : num(score.dynamicScore);
    setText("baseline", baseline == null ? "\u2014" : fmt(baseline));
    var moved = movement == null ? null : round1(movement);
    setText("movement", moved == null ? "\u2014"
      : (moved > 0 ? "+" : "") + fmt(moved) + (Math.abs(moved) === 1 ? " point" : " points"));
    document.getElementById("movement-note").style.display = movement === 0 ? "block" : "none";

    var shortenedCountry = cleanText(data.countryName, 65).length > 64;
    var shortenedAdvisory = !degraded && typeof data.advisoryLevel === "string" && cleanText(data.advisoryLevel, 65).length > 64;
    var displayNote = document.getElementById("display-note");
    displayNote.textContent = shortenedCountry && shortenedAdvisory
      ? "Country name and travel advisory shortened to 64 characters each."
      : shortenedCountry ? "Country name shortened to 64 characters."
      : shortenedAdvisory ? "Travel advisory shortened to 64 characters." : "";
    displayNote.style.display = displayNote.textContent ? "block" : "none";

    setText("advisory", degraded ? "\u2014" : describeAdvisory(data.advisoryLevel));
    setText("sanctions", degraded ? "\u2014" : describeSanctions(data.sanctionsActive, data.sanctionsCount));
    setText("trend", degraded ? "\u2014" : describeTrend(score.trend));

    // fetched_at is Unix epoch milliseconds, 0 when the CII computation time
    // is unknown (which includes "no CII score for this country").
    var foot = document.getElementById("foot");
    var fetchedAt = num(data.fetchedAt);
    var when = fetchedAt != null && fetchedAt > 0 ? utcTime(fetchedAt) : "";
    foot.textContent = when ? "Updated " + when : "";
    reportSize();
  }

  function applyTheme(hostContext) {
    var theme = hostContext && hostContext.theme;
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
    } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }

  function extractToolData(result) {
    if (!result || typeof result !== "object") return null;
    if (result.structuredContent && typeof result.structuredContent === "object") {
      return result.structuredContent;
    }
    if (Array.isArray(result.content)) {
      for (var i = 0; i < result.content.length; i++) {
        var c = result.content[i];
        if (c && c.type === "text" && typeof c.text === "string") {
          try { return JSON.parse(c.text); } catch (e) { /* not JSON */ }
        }
      }
    }
    return null;
  }

  function reportSize() {
    var h = Math.ceil(document.getElementById("root").getBoundingClientRect().height) + 8;
    notify("ui/notifications/size-changed", { height: h });
  }

  ${PANEL_USAGE_BRIDGE}
  window.addEventListener("message", function (event) {
    // Trust boundary: only the embedding host (window.parent) may drive us.
    if (event.source !== parentWin) return;
    var msg = event.data;
    if (!msg || typeof msg !== "object" || msg.jsonrpc !== "2.0") return;

    // Response to our ui/initialize request.
    if (msg.id === 1 && msg.result) {
      applyTheme(msg.result.hostContext);
      notify("ui/notifications/initialized", {});
      reportSize();
      return;
    }

    switch (msg.method) {
      case "ui/notifications/tool-result": {
        var result = msg.params && msg.params.result ? msg.params.result : msg.params;
        showPanelUsage(result);
        var data = extractToolData(result);
        render(data);
        break;
      }
      case "ui/notifications/tool-input":
        // Arguments (e.g. country_code) arrive before the result; no-op \u2014
        // the header country is populated from the result payload.
        break;
      case "ui/notifications/host-context-changed":
        applyTheme(msg.params && msg.params.hostContext ? msg.params.hostContext : msg.params);
        break;
      default:
        break;
    }
  });

  // Apply the OS/browser color preference up front so the theme is correct
  // from first paint regardless of host message ordering; the host's
  // ui/initialize result (hostContext.theme) overrides it if provided.
  applyTheme(null);

  // Kick off the handshake.
  post({
    jsonrpc: "2.0",
    id: 1,
    method: "ui/initialize",
    params: {
      protocolVersion: "2026-01-26",
      appInfo: { name: "worldmonitor-country-risk", version: "1.0.0" },
      appCapabilities: {}
    }
  });
})();
</script>
</body>
</html>`;

// api/mcp/ui/_plugin-loader.ts
function buildPluginShell(config) {
  const args = JSON.stringify(config).replace(/</g, "\\u003c");
  return `<!doctype html><html lang="en" data-theme="dark"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><base href="${config.origin}/"><title>WorldMonitor</title><style>body:has(#pluginBoot){margin:0;background:#141414;color:#eee;font:16px system-ui}#pluginBoot{padding:24px}#pluginBoot button{font:inherit;padding:8px 16px;background:#222;color:inherit;border:1px solid #555;border-radius:4px}</style></head><body><div id="pluginBoot"><p role="status">Loading WorldMonitor\u2026</p></div><script>(${BOOT_SCRIPT})(${args});</script></body></html>`;
}
var BOOT_SCRIPT = String.raw`async function(config) {
  const styles = [];
  let attempt = 0;
  const assetUrl = (path, extension) => {
    const url = new URL(path, config.origin);
    if (url.origin !== config.origin || url.search || url.hash || !new RegExp('^/plugin/assets/[a-zA-Z0-9_.-]+\\.' + extension + '$').test(url.pathname)) {
      throw new Error('Unexpected panel asset');
    }
    return url.href;
  };
  const showFailure = () => {
    styles.splice(0).forEach(link => link.remove());
    const notice = document.createElement('div');
    notice.id = 'pluginBoot';
    const status = document.createElement('p');
    status.setAttribute('role', 'status');
    status.textContent = 'WorldMonitor could not load its interface. Retry to load the current version.';
    const retry = document.createElement('button');
    retry.textContent = 'Retry interface';
    retry.onclick = () => { void load(); };
    notice.append(status, retry);
    document.body.replaceChildren(notice);
  };
  const load = async () => {
    document.body.className = '';
    const loading = document.createElement('div');
    loading.id = 'pluginBoot';
    loading.setAttribute('role', 'status');
    loading.textContent = 'Loading WorldMonitor…';
    document.body.replaceChildren(loading);
    try {
      const response = await fetch(config.origin + '/plugin/' + config.entry, {
        cache: 'no-store', credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(10000),
      });
      if (!response.ok || !response.headers.get('content-type')?.includes('text/html') || !response.body) throw new Error('Missing panel document');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let html = '';
      let bytes = 0;
      try {
        while (true) {
          const chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > 131072) throw new Error('Panel document too large');
          html += decoder.decode(chunk.value, { stream: true });
        }
        html += decoder.decode();
      } finally { await reader.cancel(); }
      const current = new DOMParser().parseFromString(html, 'text/html');
      const modules = current.querySelectorAll('script[type="module"][src]');
      if (!current.getElementById(config.root) || modules.length !== 1) throw new Error('Invalid panel document');
      const entry = assetUrl(modules[0].getAttribute('src'), 'js');
      const css = [...current.querySelectorAll('link[rel="stylesheet"]')].map(link => assetUrl(link.getAttribute('href'), 'css'));
      current.querySelectorAll('script, link, base').forEach(node => node.remove());
      await Promise.all(css.map(href => new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.crossOrigin = 'anonymous';
        const timeout = setTimeout(() => { link.remove(); reject(new Error('Panel style timed out')); }, 10000);
        link.onload = () => { clearTimeout(timeout); resolve(); };
        link.onerror = () => { clearTimeout(timeout); reject(new Error('Panel style unavailable')); };
        styles.push(link);
        document.head.append(link);
      })));
      document.body.className = current.body.className;
      document.body.replaceChildren(...current.body.childNodes);
      document.documentElement.dataset.wmPluginManagedBoot = 'true';
      const mountEvent = 'wm-plugin-boot-' + ++attempt;
      let timeout;
      try {
        await Promise.race([
          import(entry.replace('/plugin/assets/', '/plugin/assets/boot-' + attempt + '/')),
          new Promise((resolve, reject) => { timeout = setTimeout(() => reject(new Error('Panel module timed out')), 10000); }),
        ]);
      } finally { clearTimeout(timeout); }
      document.dispatchEvent(new Event(mountEvent));
    } catch { showFailure(); }
  };
  await load();
}`;

// api/mcp/ui/news-dashboard-app.ts
var COUNTRY_VIEW_UI_URI = "ui://worldmonitor/country-view-v3.html";
var NEWS_DASHBOARD_UI_URI = "ui://worldmonitor/news-dashboard-v3.html";
var PREVIOUS_COUNTRY_VIEW_UI_URI = "ui://worldmonitor/country-view-v2.html";
var PREVIOUS_NEWS_DASHBOARD_UI_URI = "ui://worldmonitor/news-dashboard-v2.html";
var LEGACY_COUNTRY_VIEW_UI_URI = "ui://worldmonitor/country-view-v1.html";
var LEGACY_NEWS_DASHBOARD_UI_URI = "ui://worldmonitor/news-dashboard.html";
var previewHost = process.env.VERCEL_ENV === "preview" ? process.env.VERCEL_URL : void 0;
var ASSET_ORIGIN = previewHost && /^[a-z0-9-]+\.vercel\.app$/i.test(previewHost) ? `https://${previewHost}` : "https://www.worldmonitor.app";
var MAP_ASSET_ORIGINS = [
  "https://tiles.openfreemap.org",
  "https://basemaps.cartocdn.com",
  "https://*.basemaps.cartocdn.com"
];
var NEWS_DASHBOARD_META = {
  ui: {
    csp: {
      connectDomains: [ASSET_ORIGIN, ...MAP_ASSET_ORIGINS],
      resourceDomains: [ASSET_ORIGIN, ...MAP_ASSET_ORIGINS, "data:"],
      frameDomains: [],
      baseUriDomains: [ASSET_ORIGIN]
    },
    prefersBorder: true
  }
};
var COUNTRY_VIEW_META = {
  ui: { csp: { connectDomains: [ASSET_ORIGIN], resourceDomains: [ASSET_ORIGIN, "https://upload.wikimedia.org", "data:"], frameDomains: [], baseUriDomains: [ASSET_ORIGIN] }, prefersBorder: true }
};
var MARKET_RADAR_META = {
  ui: { csp: { connectDomains: [ASSET_ORIGIN], resourceDomains: [ASSET_ORIGIN], frameDomains: [], baseUriDomains: [ASSET_ORIGIN] }, prefersBorder: true }
};
async function readNewsDashboard(id, corsHeaders, uri = NEWS_DASHBOARD_UI_URI) {
  return readPluginDocument(id, corsHeaders, "plugin.html", "pluginRoot", uri);
}
async function readCountryView(id, corsHeaders, uri = COUNTRY_VIEW_UI_URI) {
  return readPluginDocument(id, corsHeaders, "country.html", "countryRoot", uri);
}
async function readPluginDocument(id, corsHeaders, entry, root, uri) {
  try {
    const response = await fetch(`${ASSET_ORIGIN}/plugin/${entry}`, {
      headers: { "User-Agent": "WorldMonitor-MCP/1.0" },
      redirect: "manual",
      signal: AbortSignal.timeout(5e3)
    });
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) throw new Error("Missing plugin build");
    if (!response.body) throw new Error("Missing plugin body");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let bytes = 0;
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        bytes += chunk.value.byteLength;
        if (bytes > 131072) throw new Error("Plugin document too large");
        html += decoder.decode(chunk.value, { stream: true });
      }
      html += decoder.decode();
    } finally {
      await reader.cancel();
    }
    if (!html.includes(`id="${root}"`) || !html.includes("<head>")) throw new Error("Invalid plugin build");
    const text = buildPluginShell({ origin: ASSET_ORIGIN, entry, root });
    return rpcOk(id, { contents: [{ uri, mimeType: UI_RESOURCE_MIME_TYPE, text, _meta: root === "pluginRoot" ? NEWS_DASHBOARD_META : root === "marketRoot" ? MARKET_RADAR_META : COUNTRY_VIEW_META }] }, corsHeaders);
  } catch {
    return rpcError(id, -32603, "WorldMonitor dashboard assets are unavailable. Retry after the plugin build is deployed.", corsHeaders);
  }
}

// api/mcp/ui/market-radar-app.ts
var PREVIOUS_MARKET_RADAR_UI_URI = "ui://worldmonitor/market-radar-v2.html";
var LEGACY_MARKET_RADAR_UI_URI = "ui://worldmonitor/market-radar.html";
function readMarketRadar(id, corsHeaders, uri) {
  return readPluginDocument(id, corsHeaders, "market.html", "marketRoot", uri);
}

// api/mcp/ui/world-brief-app.ts
var STYLES3 = `
  .brief { margin: 14px 0 4px; }
  .brief .para { margin: 0 0 10px; font-size: 14px; line-height: 1.6; }
  .section { margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border); }
  .sec-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 8px; }
  ul.headlines { margin: 0; padding-left: 18px; }
  ul.headlines li { margin: 4px 0; font-size: 13px; }
  .src-row { display: flex; flex-direction: column; gap: 1px; padding: 6px 0; border-bottom: 1px solid var(--border); }
  .src-row:last-child { border-bottom: none; }
  .src-name { font-size: 11px; color: var(--accent); font-weight: 600; }
  .src-num { color: var(--muted); font-weight: 400; margin-right: 6px; font-variant-numeric: tabular-nums; }
  .src-title { font-size: 12px; color: var(--fg); }
  .src-date { font-size: 11px; color: var(--muted); }
  /* Serving a stale brief is only safe if a PERSON can see it is stale, so
     this sits above the brief rather than in the footer beside the provenance
     line, which reads as metadata and gets skipped (review, PR #7271). */
  .stale-note { margin: 12px 0 0; padding: 8px 10px; border-radius: 6px; font-size: 12px; line-height: 1.5;
    color: var(--fg); background: rgba(180, 120, 0, 0.12); border: 1px solid rgba(180, 120, 0, 0.45); }
  .stale-note b { font-weight: 600; }
`;
var BODY3 = `
  <div class="head">
    <div class="title" id="title">World Brief</div>
    <div class="badge">WorldMonitor Intelligence</div>
  </div>
  <div class="empty" id="empty">Waiting for world-brief data\u2026</div>
  <div id="card" style="display:none">
    <div class="stale-note" id="stale-note" style="display:none"></div>
    <div class="brief" id="brief"></div>
    <div class="section" id="hl-sec" style="display:none">
      <div class="sec-label">Headlines</div>
      <ul class="headlines" id="headlines"></ul>
    </div>
    <div class="section" id="src-sec" style="display:none">
      <div class="sec-label">Sources</div>
      <div class="sources" id="sources"></div>
    </div>
    <div class="foot" id="foot"></div>
  </div>
`;
var RENDER3 = `
    var linkOriginalCitations = renderContext && renderContext.kind === "ordinary-structured";
    if (data && typeof data === "object" && Object.prototype.hasOwnProperty.call(data, "projection")) data = data.projection;
    if (!data || typeof data !== "object" || Array.isArray(data)) data = {};
    var brief = typeof data.brief === "string" && data.brief ? data.brief
      : (typeof data.summary === "string" ? data.summary : "");
    q("empty").style.display = "none";
    q("card").style.display = "block";

    var srcs = Array.isArray(data.sources) ? data.sources : [];
    var briefEl = q("brief");
    briefEl.textContent = "";
    var paras = paragraphs(brief);
    for (var i = 0; i < paras.length; i++) {
      var para = el("p", "para");
      if (!linkOriginalCitations) para.textContent = paras[i];
      else {
        var citation = /\\[([0-9]+)\\]/g;
        var match;
        var cursor = 0;
        while ((match = citation.exec(paras[i])) !== null) {
          para.appendChild(document.createTextNode(paras[i].slice(cursor, match.index)));
          var index = Number(match[1]) - 1;
          var source = Number.isSafeInteger(index) && index >= 0 && index < Math.min(12, srcs.length) ? srcs[index] : null;
          var href = source && typeof source === "object" && !Array.isArray(source) ? httpUrl(source.url) : null;
          if (href) {
            var link = el("a", null, match[0]);
            link.href = href;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            para.appendChild(link);
          } else para.appendChild(document.createTextNode(match[0]));
          cursor = citation.lastIndex;
        }
        para.appendChild(document.createTextNode(paras[i].slice(cursor)));
      }
      briefEl.appendChild(para);
    }
    if (!briefEl.childNodes.length) briefEl.appendChild(el("div", "empty", "No brief text available."));

    // Headlines that only repeat a listed source title add nothing; show the
    // section only for headlines the Sources list does not already carry.
    var sourceTitles = {};
    for (var t = 0; t < srcs.length && t < 12; t++) {
      if (srcs[t] && typeof srcs[t] === "object" && typeof srcs[t].title === "string") sourceTitles[collapseWs(srcs[t].title).toLowerCase()] = true;
    }
    var hls = Array.isArray(data.headlines) ? data.headlines : [];
    var hlHost = q("headlines");
    hlHost.textContent = "";
    for (var j = 0; j < hls.length && hlHost.childNodes.length < 12; j++) {
      var h = hls[j];
      if (typeof h !== "string" || !h) continue;
      if (Object.prototype.hasOwnProperty.call(sourceTitles, collapseWs(h).toLowerCase())) continue;
      hlHost.appendChild(el("li", null, collapseWs(h)));
    }
    q("hl-sec").style.display = hlHost.childNodes.length ? "block" : "none";

    var srcHost = q("sources");
    srcHost.textContent = "";
    // Rows keep their position in the source list, so a brief citation [n]
    // always points at the row numbered n (citations link the first 12).
    for (var k = 0; k < srcs.length && k < 12; k++) {
      var s = srcs[k];
      if (!s || typeof s !== "object") continue;
      var row = el("div", "src-row");
      var name = el("span", "src-name");
      name.appendChild(el("span", "src-num", String(k + 1)));
      name.appendChild(document.createTextNode(collapseWs(s.source) || "Source"));
      row.appendChild(name);
      var url = httpUrl(s.url);
      if (s.title) {
        var titleText = collapseWs(s.title);
        if (url) {
          var a = el("a", "src-title", titleText);
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          row.appendChild(a);
        } else {
          row.appendChild(el("span", "src-title", titleText));
        }
      }
      var publishedAt = utcTime(s.publishedAt);
      if (publishedAt) row.appendChild(el("span", "src-date", publishedAt));
      srcHost.appendChild(row);
    }
    q("src-sec").style.display = srcHost.childNodes.length ? "block" : "none";

    // The tool serves last-known-good rather than failing when the seeder has
    // not published inside its freshness window, so the card has to SAY so \u2014
    // otherwise an old brief is presented identically to a current one and the
    // labelling this rests on reaches the agent but never the human.
    var staleEl = q("stale-note");
    staleEl.textContent = "";
    if (data.stale === true) {
      var age = typeof data.ageMinutes === "number" && isFinite(data.ageMinutes) ? Math.round(data.ageMinutes) : null;
      var howOld = age == null ? "" :
        age < 60 ? age + (age === 1 ? " minute" : " minutes") :
        Math.floor(age / 60) + "h " + (age % 60) + "m";
      var lead = document.createElement("b");
      lead.textContent = "Out of date (stale)";
      staleEl.appendChild(lead);
      staleEl.appendChild(document.createTextNode(
        ": " + (howOld ? "this brief is " + howOld + " old" : "this brief's age is unknown")
        + " and a newer one has not been published yet. Check the age before acting on time-sensitive points."
      ));
      staleEl.style.display = "block";
    } else {
      staleEl.style.display = "none";
    }

    var generated = data.generatedAt != null ? utcTime(data.generatedAt) || collapseWs(data.generatedAt) : "";
    q("foot").textContent = generated ? "Generated " + generated : "";
`;
var WORLD_BRIEF_APP_HTML = buildAppHtml({
  title: "World Brief \u2014 WorldMonitor",
  appName: "worldmonitor-world-brief",
  styles: STYLES3,
  body: BODY3,
  renderBody: RENDER3
});

// api/mcp/ui/news-intelligence-app.ts
var STYLES4 = `
  .story { padding: 10px 0; border-bottom: 1px solid var(--border); }
  .story:last-child { border-bottom: none; }
  .story-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
  .story-title { overflow-wrap: anywhere; font-size: 14px; font-weight: 600; color: var(--fg); }
  a.story-title { text-decoration: underline; text-underline-offset: 3px; }
  .chip { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted);
    border: 1px solid var(--border); border-radius: 999px; padding: 1px 7px; }
  .chip.alert { color: #fff; background: var(--severe); border-color: var(--severe); font-weight: 600; }
  .story-country { font-size: 11px; color: var(--muted); }
  .story-src { overflow-wrap: anywhere; margin-top: 4px; font-size: 12px; color: var(--muted); }
  .news-note { font-size: 12px; color: var(--high); padding: 6px 0; }
`;
var BODY4 = `
  <div class="head">
    <div class="title">News Intelligence</div>
    <div class="badge">WorldMonitor Intelligence</div>
  </div>
  <div class="empty" id="empty">Waiting for news intelligence\u2026</div>
  <div id="card" style="display:none">
    <div id="list"></div>
    <div class="foot" id="foot"></div>
  </div>
`;
var RENDER4 = `
    if (!data || typeof data !== "object") return;
    var value = Object.prototype.hasOwnProperty.call(data, "projection") ? data.projection : data;
    var envelope = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    var d = envelope.data && typeof envelope.data === "object" && !Array.isArray(envelope.data)
      ? envelope.data : envelope;
    q("empty").style.display = "none";
    q("card").style.display = "block";

    var hasOwn = Object.prototype.hasOwnProperty;
    // An unprojected response always carries insights (null when the source is
    // missing), so an insights that is absent, a non-null scalar, or an object
    // without topStories was left out by a projection, with or without the
    // wrapper; only an explicit null stays an unavailable source.
    var projectedInsights = d.insights;
    var omitsInsights = !hasOwn.call(d, "insights") || (projectedInsights !== null
      && (typeof projectedInsights !== "object" || !hasOwn.call(projectedInsights, "topStories")));
    var ins = d.insights && typeof d.insights === "object" ? d.insights : null;
    var sourceStories = ins && ins.topStories;
    var storyState = listState(sourceStories);
    var stories = storyState.items;
    var host = q("list");
    host.textContent = "";
    // A short, plain provenance tag; unreviewed sources say so rather than
    // reading as neutral.
    function provenanceLabel(provenance) {
      if (!provenance || typeof provenance !== "object") return "";
      var state = collapseWs(provenance.stateAffiliated);
      var where = state ? " (" + state + ")" : "";
      var biases = Array.isArray(provenance.knownBiases)
        ? provenance.knownBiases.map(collapseWs).filter(Boolean) : [];
      var label = provenance.type === "gov" ? "official source" + where
        : provenance.risk === "high" ? "state media" + where
        : provenance.risk === "medium" ? (state ? "state-funded" + where : "use with caution")
        : provenance.risk === "unknown" ? "source not yet reviewed"
        : "";
      if (biases.length) label += (label ? "; " : "") + biases.join(", ");
      return label ? " \xB7 " + label : "";
    }
    function corroborationText(story) {
      var publishers = Array.isArray(story.publishers) ? story.publishers : null;
      // Only valid roster entries count, so blank or malformed rows never
      // inflate the "and N more" figure.
      var validNames = [];
      if (publishers) {
        for (var j = 0; j < publishers.length; j++) {
          var publisher = publishers[j];
          if (publisher && typeof publisher.name === "string" && publisher.name.trim()) validNames.push(collapseWs(publisher.name));
        }
      }
      var names = validNames.slice(0, 12);
      var unlisted = Number.isInteger(story.publishersUnlisted) && story.publishersUnlisted > 0 ? story.publishersUnlisted : 0;
      var more = validNames.length - names.length + unlisted;
      var corroboration = story.corroboration && typeof story.corroboration === "object" ? story.corroboration : {};
      var state = corroboration.state;
      var lead = state === "single-publisher" ? "Single source"
        : state === "tier4-only" ? "Only low-reliability sources"
        : state === "corroborated" ? "Corroborated"
        : "Corroboration unknown";
      if (!names.length) return lead + (publishers || lead !== "Corroboration unknown" ? "" : "; publishers unknown") + ".";
      if (state === "single-publisher" && names.length === 1 && !more) return lead + ".";
      return lead + ": " + names.join(", ") + (more > 0 ? " and " + more + " more" : "") + ".";
    }
    for (var i = 0; i < stories.length && i < 12; i++) {
      var s = stories[i];
      if (!s || typeof s !== "object") continue;
      var row = el("div", "story");
      var head = el("div", "story-head");
      var originalUrl = httpUrl(s.primaryLink);
      var title = el(originalUrl ? "a" : "span", "story-title", collapseWs(s.primaryTitle) || "Untitled story");
      if (originalUrl) {
        title.href = originalUrl;
        title.target = "_blank";
        title.rel = "noopener noreferrer";
      }
      head.appendChild(title);
      var cat = collapseWs(s.category);
      if (cat) head.appendChild(el("span", "chip", cat));
      var threat = typeof s.threatLevel === "string" ? collapseWs(s.threatLevel).toLowerCase() : "";
      if (threat) head.appendChild(el("span", "chip", threat.charAt(0).toUpperCase() + threat.slice(1) + " threat"));
      if (s.isAlert === true) head.appendChild(el("span", "chip alert", "Alert"));
      var cn = countryName(s.countryCode);
      if (cn) head.appendChild(el("span", "story-country", cn));
      row.appendChild(head);
      var src = collapseWs(s.primarySource);
      var metaLine = el("div", "story-src", src ? src + provenanceLabel(s.sourceProvenance) + " \xB7 " : "");
      var pubValue = typeof s.pubDate === "number" && s.pubDate <= 0 ? null : s.pubDate;
      var published = utcTime(pubValue);
      if (published) {
        var publication = el("time", "", published);
        publication.dateTime = new Date(pubValue).toISOString();
        metaLine.appendChild(publication);
      } else {
        metaLine.appendChild(el("span", "", "Publication time unknown"));
      }
      row.appendChild(metaLine);
      var support = corroborationText(s);
      var reliability = s.credibilityScore;
      if (typeof reliability === "number" && Number.isFinite(reliability) && reliability >= 0 && reliability <= 100) {
        support += " Reliability " + reliability + "/100.";
      }
      row.appendChild(el("div", "story-src", support));
      host.appendChild(row);
    }
    var shown = host.childNodes.length;
    if (!shown) {
      host.appendChild(el("div", "empty", storyState.available
        ? "No news stories available."
        : omitsInsights ? "This request left out the story list, so there is nothing to show."
        : "News intelligence is temporarily unavailable."));
    }
    var notes = [];
    // "degraded" also covers a failed summary with healthy feeds, and a stale
    // flag can come from unreadable freshness data, so neither names a cause.
    if (ins && ins.status === "degraded") notes.push("The last news update was incomplete.");
    if (envelope.freshnessUnknown === true) notes.push("Whether these stories are current could not be checked.");
    else if (envelope.stale === true) notes.push("These stories may be out of date.");
    if (notes.length) host.insertBefore(el("div", "news-note", notes.join(" ")), host.firstChild);

    var footParts = [];
    if (storyState.available) {
      if (Array.isArray(sourceStories)) {
        if (shown < stories.length) footParts.push("Showing " + shown + " of " + stories.length + " stories.");
      } else {
        var total = sourceStories.count;
        var knownTotal = typeof total === "number" && Number.isInteger(total) && total >= stories.length;
        if (!knownTotal) footParts.push("Showing " + shown + " stories; total unknown.");
        else if (total > shown) footParts.push("Showing " + shown + " of " + total + " stories.");
      }
    }
    var updated = utcTime(envelope.cached_at);
    if (envelope.cached_at) footParts.push("Updated " + (updated || collapseWs(envelope.cached_at)) + ".");
    q("foot").textContent = footParts.join(" ");
`;
var NEWS_INTELLIGENCE_APP_HTML = buildAppHtml({
  title: "News Intelligence \u2014 WorldMonitor",
  appName: "worldmonitor-news-intelligence",
  styles: STYLES4,
  body: BODY4,
  renderBody: RENDER4
});

// api/mcp/ui/_conflict-map-base.ts
var CONFLICT_MAP_BASE = {
  "width": 720,
  "height": 384,
  "scale": 104.40564266828335,
  "translate": [
    360,
    192
  ],
  "path": "M685,224L685,224L686,224L685,225L684,225L683,225L683,224L684,224ZM688,222L687,223L686,223L685,222L686,222L687,222L688,221L688,221L688,222ZM32,221L32,221L32,221L32,221L32,222L32,222L32,222L32,221ZM422,194L422,194L429,198L429,199L431,201L431,203L431,204L432,204L432,205L431,206L432,207L431,207L432,209L433,210L433,211L432,212L430,213L429,213L428,213L427,213L427,213L424,213L423,213L422,211L422,210L421,209L420,209L419,208L418,208L417,208L416,207L415,205L414,204L414,203L414,202L413,200L414,200L415,199L416,199L416,198L416,198L416,197L416,196L416,196L416,195L415,194L416,194L418,194ZM344,142L344,142L344,142L344,145L338,145L338,149L337,150L336,151L336,153L329,153L329,154L329,153L329,153L333,153L333,152L334,151L335,149L337,147L338,145L339,144L339,143L341,143L341,143L342,143L343,143L344,143L344,142ZM136,103L136,103L132,101L131,100L128,99L127,98L127,97L125,96L124,94L122,93L122,92L123,91L123,90L120,89L118,87L117,86L115,85L114,84L113,83L111,84L110,85L108,83L107,83L105,82L103,82L103,72L103,65L106,65L109,66L111,66L113,66L115,65L118,65L121,65L123,64L125,65L126,64L127,64L128,64L131,65L133,64L134,66L136,65L136,65L139,65L141,66L146,66L148,67L150,66L152,67L150,68L153,69L158,68L160,68L162,69L164,68L162,68L163,67L165,67L167,67L168,67L170,68L172,68L175,69L178,68L181,68L180,67L182,67L185,68L185,69L186,68L187,68L188,66L186,65L184,64L184,62L187,61L189,61L191,62L193,64L192,65L195,65L195,67L197,66L200,67L199,68L201,70L203,68L204,67L204,65L207,65L209,65L212,66L212,67L211,68L212,69L212,70L208,71L206,71L204,71L203,72L201,73L201,74L199,75L196,75L195,76L195,77L192,78L190,79L188,81L188,82L187,85L190,85L191,87L192,88L194,88L198,88L200,89L201,90L203,90L205,91L208,91L210,92L210,93L210,95L212,97L214,99L216,98L217,96L216,93L215,92L217,92L220,90L221,89L220,88L219,86L217,85L219,83L218,81L218,78L219,78L222,79L224,79L225,78L227,79L229,80L230,81L233,81L233,82L234,85L235,85L237,86L239,85L241,83L242,82L244,84L246,86L248,88L247,89L250,90L251,91L254,92L256,92L256,94L258,94L258,95L259,97L257,98L256,98L253,99L251,100L248,101L244,100L241,100L239,100L237,102L235,103L233,105L230,107L232,106L235,104L239,102L241,102L243,103L241,104L242,106L243,108L245,109L248,108L250,106L250,108L251,108L249,110L245,111L243,111L241,113L240,113L239,111L243,109L240,110L238,110L236,109L236,106L236,106L234,106L234,106L232,107L232,108L231,109L230,109L230,110L230,110L226,110L224,110L223,110L221,112L221,112L220,113L218,112L217,113L216,113L216,113L216,114L216,114L214,115L212,115L210,116L209,116L209,116L208,116L209,115L209,115L210,114L210,113L210,111L210,109L208,109L208,108L208,108L207,108L207,108L207,107L206,107L206,107L206,107L206,107L205,107L204,106L202,105L201,105L199,104L197,104L197,105L194,104L193,104L191,104L189,103L188,103L188,103L187,102L187,102L187,103L183,103L177,103L170,103L165,103L159,103L154,103L149,103L147,103L141,103ZM207,78L208,77L211,77L211,78L209,79L207,79ZM215,59L213,58L213,58L214,58L218,58L221,59L221,59L219,59L217,59L215,59ZM214,79L214,78L215,78L216,79L215,80L214,80L214,79ZM189,55L188,56L186,56L184,55L185,55L187,54L189,55ZM189,51L188,51L185,51L184,50L188,50L189,51ZM184,48L186,49L185,50L183,50L181,50L180,49L180,48L183,48ZM199,56L196,56L192,56L191,55L191,54L189,53L185,53L183,52L184,51L187,52L189,52L193,52L195,53L194,53L196,54L197,54L200,54L203,54L205,54L209,54L212,54L214,55L215,55L213,56L211,56L208,56L203,56ZM157,50L160,50L159,50L156,51L153,50L155,50ZM158,48L160,49L158,49L155,49L155,49L157,48ZM259,98L258,100L257,101L258,101L259,101L258,102L260,102L261,102L263,102L262,104L263,103L263,104L264,105L263,107L262,107L261,107L262,105L261,105L259,107L258,107L259,106L257,105L256,105L252,105L252,105L253,104L252,104L254,102L255,100L257,99L258,98L259,98ZM207,73L209,74L211,75L211,75L213,75L214,76L212,76L210,76L209,75L207,76L204,77L204,76L201,76L203,75L203,74L203,72L205,72L205,73L206,73ZM216,60L218,59L222,60L225,61L225,62L228,62L230,63L235,63L236,64L238,66L235,67L239,68L242,68L244,70L247,70L247,71L244,74L241,73L238,71L236,71L236,72L238,73L240,74L241,75L242,76L242,78L239,77L235,76L237,77L239,79L239,79L234,78L231,77L228,76L229,76L226,75L224,74L224,75L218,75L217,74L218,73L221,73L225,73L225,72L225,71L228,69L227,69L226,68L224,67L220,66L221,66L219,65L218,65L216,64L215,65L212,65L205,65L201,64L198,64L197,63L199,62L196,62L196,60L197,59L199,58L204,58L202,59L204,60L205,58L210,58L213,59L213,61ZM188,57L192,57L195,57L192,59L190,59L188,61L186,61L185,59L185,58L186,57ZM136,53L139,52L143,51L146,51L148,51L148,52L147,53L145,53L142,53L139,54ZM118,94L120,93L119,95L121,97L120,97L119,96L118,95L118,95L117,94L117,93ZM168,47L171,48L176,48L178,49L178,50L175,50L172,49L168,49L170,49L168,48ZM135,104L134,104L131,103L130,102L129,102L129,101L127,101L126,100L126,99L128,100L129,100L131,100L131,101L132,102L134,103ZM139,56L141,57L146,57L148,57L150,58L147,59L143,60L140,61L140,62L136,63L135,62L131,61L131,60L133,59L134,58L132,57ZM164,54L165,53L167,54L167,54L166,55L160,56L156,56L153,56L153,56L156,55L148,55L146,55L148,53L150,53L155,53L158,54L161,54L159,53L160,52L162,52L163,53ZM166,59L168,60L169,61L170,63L173,64L176,64L176,65L173,65L174,66L173,67L170,66L167,66L165,66L161,67L157,67L154,67L153,66L150,66L148,66L146,65L147,64L150,64L153,64L155,64L152,63L148,63L145,63L144,63L148,62L146,62L142,62L144,60L145,60L150,58L152,59L151,60L155,59L158,60L160,59L161,60L163,61L164,61L162,59L164,59ZM177,60L175,58L177,57L179,58L183,58L183,58L181,59L184,60L184,61L181,62L179,62L178,61L173,60L173,59ZM166,58L168,58L170,58L168,59L165,58ZM181,52L182,53L182,54L181,55L178,56L176,55L176,54L173,54L173,53L175,53L178,52L180,52ZM185,45L186,45L188,44L187,44L192,44L194,45L197,45L200,46L201,47L204,47L201,48L198,49L195,49L191,49L189,48L189,48L190,47L187,47L185,47L184,46ZM193,43L196,42L198,42L202,42L204,41L206,41L208,42L210,41L212,41L215,41L221,40L222,41L227,40L231,40L235,41L240,41L244,41L247,41L247,42L243,43L238,43L237,43L241,43L236,45L233,45L230,47L227,47L225,47L220,47L222,48L221,48L223,49L221,50L218,50L217,51L215,51L215,52L218,52L218,52L213,53L208,53L203,53L200,53L197,53L197,52L200,51L199,50L200,50L205,51L203,50L200,49L201,48L204,48L205,47L202,47L202,46L207,46L208,46L211,45L207,45L200,45L197,45L196,44L194,43ZM223,69L222,70L220,70L219,69L220,68L222,68L223,68L223,69ZM185,65L186,66L185,67L182,66L181,66L178,66L180,65L181,64L183,65L184,65ZM242,101L243,101L245,101L247,102L247,103L246,103L244,102ZM243,106L244,107L245,107L247,107L246,108L245,108L243,107L243,107ZM136,103L141,103L147,103L149,103L154,103L159,103L165,103L170,103L177,103L183,103L187,103L187,102L187,102L188,103L188,103L189,103L191,104L193,104L194,104L197,105L197,104L199,104L201,105L202,105L204,106L205,107L206,107L206,107L206,107L206,107L207,107L207,108L207,108L208,108L208,108L208,109L210,109L210,111L210,113L210,114L209,115L209,115L208,116L209,116L209,116L210,116L212,115L214,115L216,114L216,114L216,113L216,113L217,113L218,112L220,113L221,112L221,112L223,110L224,110L226,110L230,110L230,110L230,109L231,109L232,108L232,107L234,106L234,106L236,106L236,106L236,109L238,110L238,110L236,111L234,112L232,112L231,113L231,114L231,115L232,116L232,116L232,115L233,116L233,116L231,116L230,116L229,117L228,117L227,117L226,117L228,117L229,117L226,118L225,118L225,118L225,118L225,118L225,120L224,121L223,121L223,120L222,120L223,121L223,121L223,122L223,123L222,124L221,124L222,123L221,122L221,121L221,121L221,123L220,122L221,123L221,125L222,125L222,125L222,127L221,129L219,129L218,130L217,130L216,131L216,132L214,133L213,134L212,135L212,136L212,137L212,139L213,140L213,141L214,143L214,144L214,145L214,146L213,146L212,146L212,145L211,145L210,143L209,142L209,141L209,140L209,139L207,137L207,137L205,138L205,138L204,137L203,137L201,137L199,137L197,137L197,137L197,138L197,138L197,139L197,139L196,139L196,139L194,139L193,138L191,138L190,138L189,138L187,138L186,140L184,140L183,141L183,142L183,143L183,144L183,145L182,145L181,145L180,144L179,143L179,142L178,141L177,140L176,138L175,138L173,138L172,139L171,139L170,138L169,137L169,136L168,135L167,135L166,134L163,134L163,135L161,135L158,135L154,134L151,133L151,132L149,133L147,133L146,132L145,131L144,131L144,130L143,130L142,129L141,129L140,129L140,128L138,126L137,124L137,123L136,123L135,121L134,120L133,119L134,117L134,115L133,114L134,112L134,111L134,109L134,107L133,105L133,104L133,104L136,104L137,106L137,106L137,104ZM77,155L77,156L77,156L78,156L78,157L77,157L77,157L76,158L76,157L76,157L76,156L76,156L76,156L76,155L76,155L76,155ZM76,154L76,154L75,155L75,154L74,154L74,154L75,154L75,154ZM74,153L74,154L73,154L73,153ZM72,152L72,153L73,153L73,153L72,153L72,153L72,153L72,153ZM70,152L70,152L69,152L69,152L69,152L69,151ZM57,82L58,82L58,83L57,83L56,83L55,82ZM81,86L82,86L83,87L81,88L79,89L78,88L78,87L80,87ZM103,65L103,72L103,82L105,82L107,83L108,83L110,85L111,84L113,83L114,84L115,85L117,86L118,87L120,89L123,90L123,91L122,92L121,91L120,91L119,89L117,88L116,86L114,86L111,86L109,85L105,84L103,83L100,83L98,83L94,82L92,81L90,81L90,83L89,83L87,83L86,84L84,84L83,83L84,81L86,81L86,80L83,81L82,83L79,84L81,85L79,86L77,87L75,87L75,88L72,89L71,90L69,91L68,91L66,91L64,92L63,92L60,93L59,93L61,92L63,91L65,90L67,90L68,89L71,88L71,88L73,87L73,86L74,85L72,85L71,85L70,86L69,85L68,85L68,84L66,85L65,85L65,84L65,83L64,83L61,83L60,82L59,82L59,81L57,80L58,79L59,78L60,77L62,77L63,77L64,76L66,76L67,76L67,75L66,75L67,74L66,74L64,74L63,75L62,74L59,75L57,74L56,73L54,72L56,72L60,71L62,71L62,72L65,72L64,70L62,70L60,69L59,68L56,67L57,66L60,66L63,66L63,65L65,64L67,64L70,63L72,63L75,62L77,62L79,63L80,63L83,63L83,63L85,64L87,63L91,64L95,64L96,64L98,64L101,65ZM47,76L48,76L49,76L51,76L53,77L52,77L51,77L50,77L49,77L47,77L47,76ZM519,102L518,104L516,104L516,106L515,106L512,106L510,109L509,109L506,110L507,113L506,114L506,115L505,115L504,114L502,114L498,114L498,114L495,113L494,113L494,115L491,114L490,114L489,115L488,115L486,117L485,118L484,118L484,117L482,117L481,115L480,115L480,114L478,112L475,112L473,113L471,111L470,110L467,109L467,109L462,110L462,117L461,117L460,115L459,115L456,115L456,116L456,115L456,115L456,114L454,113L453,112L452,111L452,111L453,111L454,110L455,109L457,110L457,108L457,107L455,107L453,106L451,107L449,107L449,107L449,106L448,105L446,105L445,104L446,102L445,102L447,100L449,101L449,100L453,98L455,98L459,99L462,100L463,99L466,99L469,100L469,99L472,99L472,99L469,97L471,96L471,96L472,95L471,94L472,94L479,93L480,93L484,92L486,91L489,91L490,93L492,93L494,94L494,95L496,94L500,93L499,93L502,95L506,99L507,98L509,99L512,99L513,99L514,100L515,101L516,101L518,101ZM462,117L462,110L467,109L467,109L470,110L471,111L473,113L475,112L478,112L480,114L480,115L481,115L482,117L484,117L484,118L485,118L486,117L488,115L489,115L490,115L488,116L490,117L491,117L493,118L491,119L489,119L489,119L488,118L489,117L486,118L486,119L485,120L483,120L483,121L484,121L485,122L484,124L482,124L481,124L481,123L479,122L477,121L476,120L474,119L473,117L472,117L470,117L469,117L469,115L467,114L465,115L464,116L464,117ZM617,197L620,198L623,199L625,200L626,201L626,202L629,203L629,204L628,204L628,205L630,207L631,209L632,209L632,209L633,210L633,210L635,211L635,211L633,211L633,211L631,211L630,210L628,209L627,208L626,207L624,206L622,206L621,207L621,208L620,209L619,209L617,209L617,203ZM638,199L639,199L639,200L638,201L638,200L638,199L637,198L636,198L635,197L635,197L636,197L637,197L637,198ZM636,203L635,203L634,204L633,204L631,203L630,202L630,202L632,202L633,202L633,201L634,201L634,202L635,202L635,201L636,201L636,200L637,200L638,200L638,201L637,202L636,202ZM642,202L643,202L643,203L644,204L644,204L644,205L643,204L642,203L642,201L642,201ZM617,197L617,203L617,209L615,207L614,207L613,207L611,207L612,206L613,205L612,203L611,202L608,200L606,200L604,198L603,199L602,199L602,199L602,198L601,197L602,196L604,197L604,196L601,196L600,195L599,195L598,194L600,193L601,193L604,193L604,194L605,197L607,198L608,196L610,195L612,195L614,196L615,196ZM588,208L588,209L588,209L587,210L585,211L585,211L585,210L586,209ZM605,205L604,203L605,203L605,202L606,202L606,203ZM575,184L574,186L575,188L575,189L577,190L575,191L574,192L574,193L572,195L572,197L572,199L571,199L569,199L569,198L567,198L566,198L564,198L564,197L562,198L561,197L561,195L560,194L559,193L559,191L559,190L560,188L560,190L561,191L563,190L564,190L565,189L566,189L567,190L569,189L570,187L571,186L571,184L573,184ZM596,197L598,198L598,199L597,198L595,198L594,198L593,198L593,197ZM591,199L590,199L590,198L591,198L592,198ZM593,188L593,189L594,189L594,190L594,192L593,191L593,192L594,193L593,194L593,192L592,190L593,189ZM584,190L586,190L588,189L588,189L587,191L585,192L584,191L581,191L579,192L579,193L580,195L581,194L585,193L585,194L584,194L583,195L581,195L583,198L583,198L584,201L584,202L583,202L583,202L584,200L582,201L581,200L582,200L580,199L580,197L579,197L579,199L579,202L578,202L578,202L578,200L578,198L577,198L576,197L577,196L577,194L578,192L579,191L580,190L582,190ZM579,211L577,209L578,209L579,210L580,210L580,211ZM581,208L582,207L584,207L584,208L581,208L579,208L579,207L580,207ZM575,207L577,207L577,208L575,208L574,208L573,208L573,207L574,207L575,207ZM558,204L558,204L561,205L562,204L565,205L566,206L569,206L571,207L569,208L567,207L565,207L563,207L562,207L559,206L558,206L557,206L554,205L554,205L552,204L553,203L555,203L557,204ZM550,194L550,195L551,196L552,196L553,198L553,200L553,203L551,203L549,201L547,200L546,199L545,197L544,196L542,193L541,192L540,190L540,189L538,188L537,186L536,185L534,183L534,182L535,182L538,182L539,184L541,185L542,186L543,188L545,188L547,189L548,191L549,192L548,193L550,194ZM235,288L236,289L237,290L239,291L241,292L241,293L239,293L238,292L237,292L235,292ZM255,247L255,249L254,250L254,252L254,253L254,254L253,255L256,256L255,258L257,258L257,259L255,262L252,263L248,263L246,263L247,264L246,265L247,266L246,267L244,267L242,266L241,267L242,269L243,269L244,269L244,270L243,270L241,271L241,273L241,274L239,274L237,275L237,276L239,278L240,278L240,280L238,281L236,283L235,284L234,284L235,286L236,287L235,287L233,287L229,287L228,286L228,284L227,284L226,284L226,282L228,281L228,280L228,279L229,277L230,275L229,274L230,274L230,273L229,273L230,272L229,271L229,269L229,269L229,266L229,265L230,263L231,262L230,260L230,259L232,258L232,256L233,254L233,253L232,252L231,249L233,247L232,246L233,244L234,242L236,241L235,240L235,240L235,237L237,236L238,234L238,233L239,232L242,232L243,234L243,232L245,232L246,233L249,236L251,236L253,237L255,238L255,239L253,241L255,242L257,242L259,242L260,241L260,239L261,239L262,240L262,241L261,242L259,243L257,245ZM235,288L235,292L237,292L238,292L237,293L236,293L235,293L234,293L233,293L231,292L228,291L226,290L224,288L225,289L228,290L230,291L231,290L232,288L234,288ZM233,224L234,225L234,227L235,227L235,229L236,231L236,234L238,233L238,234L237,236L235,237L235,240L235,240L236,241L234,242L233,244L232,246L233,247L231,249L232,252L233,253L233,254L232,256L232,258L230,259L230,260L231,262L230,263L229,265L229,266L229,269L229,269L229,271L230,272L229,273L230,273L230,274L229,274L230,275L229,277L228,279L228,280L228,281L226,282L226,284L227,284L228,284L228,286L229,287L233,287L235,287L233,287L233,288L231,288L231,290L230,290L228,290L226,288L223,287L223,286L223,285L222,284L222,281L223,279L225,278L222,277L224,275L225,272L227,273L227,269L226,269L226,271L225,271L225,268L226,265L227,264L226,262L226,260L227,260L228,257L229,254L230,251L229,248L230,247L230,245L231,242L231,239L232,235L232,231L232,228L232,225L233,225ZM413,200L414,202L414,203L414,204L415,205L416,207L415,207L413,207L412,208L412,209L412,210L412,212L412,213L412,214L413,215L414,214L414,216L413,216L412,215L411,214L410,214L409,213L408,214L407,213L406,213L405,212L404,213L404,212L404,212L403,212L402,212L401,212L400,212L400,210L400,209L400,208L400,207L400,206L400,205L397,205L398,205L397,205L397,205L395,205L395,206L395,207L394,206L393,207L392,207L391,206L391,205L390,204L390,203L384,203L384,203L383,203L382,203L382,203L383,202L383,202L383,201L384,201L384,201L385,200L386,200L386,201L387,201L388,200L389,199L389,198L389,197L390,195L391,194L392,193L392,193L392,192L392,191L392,190L393,189L393,188L394,187L394,186L394,184L394,183L395,183L397,183L398,184L399,184L401,185L401,184L402,183L402,184L404,183L405,183L406,183L406,183L407,182L408,183L409,183L410,182L411,184L412,184L412,184L413,184L414,184L415,184L416,186L416,188L417,188L416,189L416,189L415,190L414,191L414,192L414,193L414,194L413,195L413,196L413,196L413,197L413,198ZM436,195L435,194L435,187L436,185L437,184L438,184L440,183L442,183L447,177L448,176L449,175L449,174L449,172L449,171L449,171L450,171L451,171L452,171L452,170L453,170L453,171L453,172L453,173L453,173L452,175L451,177L450,180L449,182L447,184L445,187L443,188L440,190L439,191L437,194L436,195ZM431,201L429,199L429,198L422,194L422,194L422,192L422,191L423,190L424,189L423,186L423,186L422,184L423,183L424,182L425,182L425,183L426,184L427,184L429,185L430,185L430,185L431,186L432,186L433,185L434,184L435,185L436,185L435,187L435,194L436,195L434,196L434,197L433,197L433,198L433,199L432,200ZM405,177L403,176L403,176L403,175L403,174L403,174L402,172L402,172L402,171L401,171L401,170L401,169L400,169L400,168L401,168L400,167L401,166L401,166L401,165L402,163L404,164L403,156L403,156L406,156L406,152L413,152L420,152L427,152L428,154L427,154L428,156L428,158L429,159L430,159L429,160L428,161L427,161L427,162L426,165L426,166L426,167L425,169L424,170L423,171L423,172L422,173L422,175L422,176L422,175L422,175L422,174L421,173L421,172L420,171L421,170L420,170L420,170L418,170L419,171L419,172L418,173L417,174L416,174L415,173L414,174L414,174L413,174L413,175L411,175L411,174L409,174L409,175L408,175L407,174L407,173L406,173L405,174L405,176L404,176L404,176ZM403,156L404,164L402,163L401,165L401,166L401,166L400,167L401,168L400,168L400,169L401,169L401,170L401,171L402,171L402,172L401,172L400,173L398,175L397,176L395,175L394,176L394,176L394,177L393,178L390,178L390,178L390,178L389,178L388,178L388,178L388,177L387,176L387,176L385,175L386,174L387,174L387,174L388,174L387,172L387,171L387,170L386,169L387,168L385,168L385,166L385,166L385,163L388,162L388,159L389,156L389,155L388,154L388,154L388,153L387,150L389,149L396,153ZM229,156L229,157L229,158L229,158L229,159L229,159L228,159L227,159L226,159L225,159L224,159L224,158L226,158L228,158L228,158L227,157L227,156L226,156L227,156L228,156ZM229,159L229,159L229,158L229,158L229,157L229,156L230,156L231,156L232,156L233,156L233,157L234,157L234,157L235,157L236,158L235,159L234,158L233,159L233,158L232,159L232,159L231,158L231,159L230,160L229,160ZM531,44L535,44L538,45L543,47L542,48L538,48L533,48L530,47L529,46L526,46ZM547,48L552,49L551,49L541,50L545,48L546,47ZM613,53L618,53L624,54L623,56L616,56L613,56L610,55L611,54ZM630,55L635,55L633,56L630,56L626,55L627,54ZM615,58L617,58L619,57L621,58L622,59L619,59L615,58ZM442,45L445,45L448,45L448,45L449,45L451,45L454,45L453,45L451,45L449,46L449,46L447,46L445,46L446,45ZM401,93L398,93L396,93L396,92L399,91L401,92L401,92L401,93ZM458,58L462,56L461,55L465,54L471,53L478,53L481,52L484,52L485,53L484,53L478,54L472,55L467,57L464,58L461,60L461,62L465,63L464,63L458,63L457,62L454,62L454,61L456,60L456,59L459,58ZM620,94L621,96L621,98L622,100L624,103L621,102L620,105L622,107L622,108L620,107L619,108L619,107L619,105L619,103L619,102L619,99L618,97L618,95L620,94L619,93L620,93ZM32,66L32,66L36,68L41,70L41,71L42,71L42,70L47,70L50,72L49,73L46,73L46,75L45,75L43,75L42,74L39,74L39,73L37,73L35,73L34,72L34,72L32,72L33,73L32,74L32,74L32,66ZM688,74L688,74L686,74L683,74L685,75L686,77L687,77L687,78L687,78L683,78L678,79L676,80L674,81L671,82L670,83L668,82L663,83L662,82L660,83L658,83L657,84L655,86L655,87L657,87L657,90L655,90L655,91L655,92L652,93L652,95L649,95L648,97L646,99L645,98L644,95L643,91L644,89L646,87L646,87L649,86L652,84L655,82L658,81L660,78L657,78L656,80L652,82L650,79L646,80L641,83L643,84L638,85L636,85L636,84L633,83L631,84L625,84L619,84L613,88L606,92L609,92L610,94L612,94L613,93L615,93L618,95L618,97L616,99L616,101L615,104L612,106L612,108L609,110L607,112L606,113L603,114L602,114L601,113L599,114L598,115L598,115L598,115L598,114L599,114L599,112L599,110L600,109L603,110L604,108L604,106L605,105L606,104L603,104L601,105L599,105L598,103L596,102L593,101L592,100L591,98L591,98L590,96L588,95L585,95L583,95L580,95L579,96L580,96L580,97L579,98L577,100L577,101L575,102L573,101L570,101L569,101L568,100L566,102L563,102L562,102L559,102L558,102L557,101L555,100L553,100L551,100L549,101L546,100L546,99L544,98L542,98L540,97L538,99L539,100L537,101L535,101L533,101L532,100L530,100L528,99L525,100L522,102L520,102L519,102L518,101L516,101L515,101L514,100L513,99L512,99L509,99L507,98L506,99L502,95L499,93L500,93L496,94L494,95L494,94L492,93L490,93L489,91L486,91L484,92L480,93L479,93L472,94L471,94L472,95L471,96L471,96L469,97L472,99L472,99L469,99L469,100L466,99L463,99L462,100L459,99L455,98L453,98L449,100L449,101L447,100L445,102L446,102L445,104L446,105L448,105L449,106L449,107L449,107L449,109L447,109L445,111L447,112L447,114L449,116L447,117L447,117L446,117L445,116L445,116L443,115L443,115L441,114L440,114L440,114L437,113L435,113L433,113L433,113L430,111L428,111L427,110L428,109L430,108L429,107L431,106L431,106L430,106L430,105L431,105L432,105L433,104L432,103L433,102L433,102L430,101L429,101L428,100L427,100L424,100L424,99L424,99L422,99L422,98L423,98L422,97L420,97L419,97L419,97L418,97L417,96L417,95L417,95L419,95L420,95L419,94L418,94L418,94L417,93L416,92L416,92L416,91L414,90L414,91L413,90L411,90L411,89L411,88L410,87L411,87L410,85L411,84L411,84L413,83L411,82L415,79L417,78L417,77L415,76L415,75L414,74L415,72L413,70L415,69L412,67L412,66L414,66L417,65L419,65L422,66L427,66L433,68L435,69L435,70L433,71L430,72L422,70L420,71L423,72L424,73L424,75L426,75L427,76L428,75L427,74L428,73L432,74L434,74L432,73L437,71L438,71L440,72L441,70L440,69L441,68L439,67L444,68L445,69L443,69L443,70L444,71L447,70L448,69L452,68L458,67L459,67L457,68L460,68L461,67L464,67L467,66L469,68L471,66L469,65L470,65L476,65L478,66L485,68L486,67L484,66L484,66L482,65L483,65L482,63L482,63L485,61L486,59L487,59L492,59L493,60L491,62L492,62L493,64L492,66L494,67L493,69L490,71L492,71L493,71L495,70L495,69L497,69L496,67L497,66L495,66L494,65L496,63L493,62L496,61L496,59L497,59L498,60L497,62L499,62L498,61L501,60L505,60L509,61L507,60L507,58L510,57L514,58L518,57L517,56L519,55L521,55L524,54L529,54L530,53L535,53L536,54L540,53L544,53L544,52L546,51L550,50L553,51L551,51L555,52L555,53L557,52L562,52L567,53L568,54L568,55L566,55L561,56L559,57L562,57L564,58L566,57L567,58L568,58L571,58L576,58L577,59L585,59L585,58L588,58L591,58L594,59L595,60L594,61L596,62L599,63L601,61L604,62L607,61L611,62L612,61L615,62L614,60L616,59L632,60L634,62L639,63L646,63L650,63L651,64L651,65L653,65L656,65L659,65L662,65L666,65L669,67L671,66L670,65L671,64L676,65L680,65L685,66L688,66L688,74ZM688,63L686,63L686,62L688,62L688,63ZM32,62L32,62L32,62L32,62L34,62L36,62L36,62L34,63L32,63L32,63L32,62ZM421,108L421,108L423,108L423,108L424,109L424,109L424,109L425,109L427,109L426,110L424,110L422,111L421,111L421,110L419,109L419,109L421,108ZM216,143L217,143L218,143L218,144L216,144ZM218,143L220,144L219,145L219,145L219,144L218,143ZM218,146L218,146L219,148L219,149L218,149L218,148L217,147ZM248,286L251,285L252,286L253,285L255,286L254,287L252,287L251,286L249,287ZM388,47L388,46L391,46L393,47L399,48L395,49L394,50L392,51L391,52L389,52L385,51L387,50L384,50L380,48L379,47L384,46L385,47ZM417,65L414,66L412,66L413,65L411,64L408,65L407,66L405,67L403,66L401,67L399,66L398,66L396,66L396,67L393,67L392,68L391,68L389,69L388,71L385,74L385,75L385,75L383,75L382,77L382,79L383,80L382,82L381,84L380,85L379,84L375,86L373,86L370,85L370,83L369,79L371,78L376,76L379,74L383,72L387,68L390,67L395,65L399,64L402,64L405,63L408,63L411,62L417,64L415,64ZM410,46L407,47L402,47L397,47L396,47L394,46L392,46L397,45L400,46L402,45L406,45ZM405,50L401,51L398,50L399,50L398,49L402,49L402,50ZM275,41L281,40L287,40L290,40L296,40L311,40L322,41L319,42L312,42L302,42L303,43L309,42L315,43L318,42L320,43L318,44L322,43L331,43L337,43L338,44L330,45L329,46L323,46L328,46L326,47L324,48L324,51L326,52L323,52L320,52L324,53L324,55L322,55L325,57L321,57L323,57L322,58L320,58L317,58L319,60L319,60L316,60L315,60L317,61L320,62L320,63L317,64L316,63L313,62L314,63L312,64L317,64L319,64L314,66L309,67L304,68L302,68L300,69L298,70L294,72L293,72L290,72L287,73L286,74L286,75L285,76L282,78L283,79L282,81L281,82L278,83L276,81L272,81L270,80L269,78L266,76L265,75L265,73L262,72L263,70L262,70L263,67L266,67L267,66L267,65L265,65L264,65L263,66L260,65L260,64L261,63L263,63L266,63L263,62L262,62L260,62L258,61L260,60L259,59L258,58L256,56L253,55L253,54L248,53L244,53L240,53L235,53L233,53L230,52L235,51L238,51L231,51L226,50L227,49L234,48L240,47L241,47L236,46L238,45L244,44L247,44L246,43L250,43L256,42L261,42L263,43L268,42L273,42L275,43L279,43L275,42ZM486,281L487,281L489,281L489,282L488,283L485,283L485,282L485,281ZM588,208L588,208L590,207L591,207L591,207L592,207L591,208L589,209L588,209L588,209ZM390,244L391,243L391,244L392,244L393,245L394,245L395,245L396,244L396,237L397,237L398,239L398,240L398,241L399,241L400,240L401,239L402,238L402,238L403,238L404,239L406,239L407,238L407,238L407,237L408,237L409,236L409,235L411,234L414,232L414,232L415,233L416,232L417,233L418,235L418,236L418,238L418,239L417,239L417,239L416,239L416,240L416,241L417,242L418,242L418,241L420,241L419,242L419,244L419,244L417,245L417,246L416,247L416,247L415,249L413,251L411,252L410,253L408,253L407,253L407,254L406,254L405,254L403,254L402,254L401,254L399,254L398,255L397,255L396,255L395,255L394,255L394,254L393,254L393,254L393,253L393,251L393,251L393,250L392,248L391,246L391,246ZM413,245L412,244L411,245L410,245L409,246L411,248L411,248L412,247L413,247L413,246L413,245ZM413,245L413,245L413,246L413,247L412,247L411,248L411,248L409,246L410,245L411,245L412,244ZM147,133L149,133L151,132L151,133L154,134L158,135L161,135L163,135L163,134L166,134L167,135L168,135L169,136L169,137L170,138L171,139L172,139L173,138L175,138L176,138L177,140L178,141L179,142L179,143L180,144L181,145L182,145L183,145L182,146L182,148L182,150L182,151L182,152L183,153L183,154L184,156L185,157L185,158L187,158L188,159L190,158L191,158L192,158L193,158L195,157L195,156L195,154L195,154L197,153L199,153L200,153L201,153L202,153L202,154L201,155L200,156L201,157L200,157L200,159L199,158L199,158L199,158L198,159L198,159L198,159L198,160L196,160L194,160L194,161L193,161L194,161L195,162L195,162L195,162L195,163L193,163L192,164L192,165L192,165L192,166L190,164L189,163L187,162L186,163L185,163L184,163L183,163L181,163L180,162L178,162L176,161L175,160L174,159L173,159L171,159L171,158L169,157L168,156L167,155L168,155L168,154L168,154L168,153L168,152L167,151L167,151L165,149L163,147L162,146L161,145L161,145L161,144L160,143L159,143L158,141L157,141L156,140L155,139L155,139L154,137L154,136L154,135L153,134L152,135L151,134L151,135L151,136L151,137L152,138L153,139L153,139L154,140L154,140L154,140L155,141L155,142L155,142L157,143L157,145L158,146L158,147L158,148L159,148L160,149L161,149L161,150L160,150L160,150L159,149L158,148L157,147L156,147L156,146L155,145L154,144L153,143L153,143L153,143L151,143L150,141L150,141L151,141L152,141L152,140L151,139L149,138L149,137L148,136L147,134ZM255,247L256,247L258,248L259,248L261,249L262,250L263,252L262,253L263,254L262,255L260,256L259,255L258,256L256,255L255,255L254,254L254,253L254,252L254,250L255,249ZM263,254L262,253L263,252L262,250L261,249L259,248L258,248L256,247L255,247L257,245L259,243L261,242L262,241L262,240L261,239L260,239L261,238L261,237L261,236L260,235L260,236L259,236L259,235L259,233L258,233L257,232L256,233L254,232L255,230L254,229L255,228L254,227L255,227L255,225L255,224L254,223L254,223L254,222L250,222L250,220L250,219L250,219L250,218L250,217L249,217L248,217L247,216L246,216L245,215L243,215L241,213L241,212L241,211L241,210L239,210L238,211L236,212L236,212L235,212L233,212L232,212L231,212L232,209L230,210L228,210L228,209L227,209L227,208L226,207L225,206L226,205L226,205L227,204L227,203L227,202L227,202L229,200L231,200L231,200L233,200L233,195L233,194L233,193L232,192L232,191L233,191L234,191L234,190L233,190L233,189L236,189L237,188L237,189L238,190L238,190L239,191L241,191L241,190L242,190L243,189L243,189L245,188L244,188L243,187L243,186L243,185L242,185L242,184L244,185L245,185L246,185L247,184L249,184L250,183L249,183L250,182L251,183L250,184L251,184L252,185L251,185L251,187L251,188L251,189L252,190L253,190L254,189L254,189L255,189L256,188L257,189L257,189L258,189L258,188L258,188L258,187L259,188L260,187L261,188L261,188L262,188L262,188L263,188L264,188L264,187L265,186L266,184L266,184L267,185L268,189L269,189L269,190L268,192L268,192L271,192L271,194L273,193L275,194L278,195L279,196L279,197L281,196L284,197L287,197L290,199L292,201L294,201L295,201L296,202L296,204L297,205L296,208L295,210L292,212L291,214L290,216L290,216L289,217L289,221L289,223L288,225L288,225L288,228L286,230L285,232L284,233L283,234L282,234L279,235L277,235L275,236L273,237L272,239L271,241L272,242L271,243L271,244L270,245L268,248L266,250L265,251L264,252ZM233,212L235,212L236,212L236,212L238,211L239,210L241,210L241,211L241,212L241,213L243,215L245,215L246,216L247,216L248,217L249,217L250,217L250,218L250,219L250,219L250,220L250,222L254,222L254,223L254,223L255,224L255,225L255,227L254,227L255,228L254,229L254,228L252,227L251,227L247,228L247,229L246,230L246,233L245,232L243,232L243,234L242,232L239,232L238,233L236,234L236,231L235,229L235,227L234,227L234,225L233,224L234,222L234,221L234,220L234,219L234,218L234,217L234,216L235,215ZM233,200L231,200L231,200L229,200L227,202L227,202L227,203L227,204L226,205L226,205L225,206L226,207L227,208L227,209L228,209L228,210L230,210L232,209L231,212L232,212L233,212L235,215L234,216L234,217L234,218L234,219L234,220L234,221L234,222L233,224L233,225L232,225L230,224L230,224L226,222L223,220L221,219L221,217L221,217L219,214L218,211L216,207L215,206L215,205L213,204L212,203L213,202L212,201L212,199L214,198L214,199L213,199L213,200L214,200L215,200L216,201L217,200L217,199L218,197L220,197L222,195L223,194L223,192L223,192L224,193L225,194L226,194L227,196L228,196L229,196L230,196L231,196L232,197L231,199L232,199ZM238,190L238,190L237,189L237,188L236,189L233,189L233,190L234,190L234,191L233,191L232,191L232,192L233,193L233,194L233,195L233,200L232,199L231,199L232,197L231,196L230,196L229,196L228,196L227,196L226,194L225,194L224,193L223,192L223,192L222,192L221,191L220,192L219,191L218,190L218,191L216,189L216,189L217,189L217,188L217,187L218,187L219,186L219,185L219,185L219,183L219,182L219,181L219,180L218,179L218,178L219,178L219,178L219,176L219,176L220,176L221,175L222,175L222,174L222,173L224,172L225,172L225,171L226,172L228,171L228,170L229,169L230,169L230,170L230,171L229,171L228,172L228,172L227,173L227,174L226,175L227,175L228,176L228,177L228,177L228,178L228,178L228,179L229,179L231,179L232,179L234,181L234,181L236,181L237,181L237,181L237,182L237,182L236,184L237,185L237,186L237,186L236,187L237,187L238,188ZM219,176L219,176L219,178L219,178L218,178L218,179L217,178L217,177L218,177L217,177L217,176L216,176L215,176L215,176L214,177L214,177L213,177L214,178L214,178L213,179L213,179L212,178L212,178L211,178L211,177L210,177L210,177L209,177L209,177L209,177L209,177L209,176L209,176L209,176L209,175L209,175L210,175L210,175L210,176L211,176L211,176L212,176L212,176L213,175L214,175L215,174L216,175L216,175L217,175L218,175L218,176ZM210,175L209,175L209,175L209,176L209,176L209,176L209,177L209,177L208,177L207,176L208,176L208,176L207,175L206,175L206,174L206,174L205,174L205,174L205,175L204,174L204,174L204,174L204,173L204,172L203,172L204,172L204,172L205,172L206,172L206,172L207,172L207,172L208,172L208,173L209,174ZM208,172L207,172L207,172L206,172L206,172L205,172L204,172L204,172L203,171L202,170L202,170L201,169L200,168L200,168L201,168L201,168L201,168L202,168L202,168L202,167L202,167L203,167L203,166L204,167L204,167L204,166L205,166L205,165L205,165L205,165L205,165L206,165L206,165L207,165L207,165L208,165L208,165L208,165L208,165L208,165L208,166L208,167L208,167L208,168L208,169L208,169L208,170L207,170L208,171L207,171L207,172ZM208,165L208,165L208,165L207,165L207,165L206,165L206,165L205,165L205,165L205,165L205,165L205,166L204,166L204,167L204,167L203,166L203,167L202,167L202,167L202,168L202,168L201,168L201,168L201,168L200,168L200,167L200,167L200,167L199,167L199,167L198,166L198,166L197,166L198,165L197,165L198,165L198,164L199,163L199,163L200,163L200,163L201,163L201,163L202,163L202,163L203,163L203,163L204,163L204,163L205,163L205,163L206,163L206,163L207,163L207,164L208,164ZM197,166L198,166L198,166L199,167L199,167L200,167L200,167L200,167L200,168L200,168L199,168L198,168L197,167L196,167L196,167L196,167L197,166L197,166L197,166ZM192,166L192,165L192,165L192,164L193,163L195,163L195,162L195,162L195,162L194,161L193,161L194,161L194,160L196,160L198,160L198,161L197,163L198,163L199,163L199,163L199,163L198,164L198,165L197,165L198,165L197,166L197,166L197,166L197,166L196,167L196,167L195,167L194,167L193,166ZM198,160L198,159L198,159L198,159L199,158L199,158L199,159L199,159L199,159L199,160L199,160L199,161L199,161L199,162L199,162L198,162L198,163L197,163L198,161ZM249,183L250,183L249,184L247,184L246,185L245,185L244,185L242,184L242,185L243,185L243,186L243,187L244,188L245,188L243,189L243,189L242,190L241,190L241,191L239,191L238,190L238,188L237,187L236,187L237,186L237,186L237,185L236,184L237,182L237,182L237,181L237,181L236,181L234,181L234,181L232,179L231,179L229,179L228,179L228,178L228,178L228,177L228,177L228,176L227,175L226,175L227,174L227,173L228,172L228,172L229,171L230,171L230,171L229,171L229,172L229,173L229,174L229,175L230,175L231,174L230,173L230,172L232,171L232,170L233,170L233,171L234,171L236,172L236,173L237,173L239,173L240,173L242,174L243,173L243,173L245,173L247,172L246,173L246,174L248,174L249,175L249,176L250,176L251,177L250,178L250,178L250,179L250,180L249,180L249,181L248,181ZM257,189L257,189L256,188L255,189L254,189L254,189L253,190L252,190L251,189L251,188L251,187L251,185L252,185L251,184L250,184L251,183L250,182L249,183L248,181L249,181L249,180L250,180L250,179L250,178L250,178L251,177L252,177L253,179L253,180L254,180L255,180L256,181L256,183L254,183L255,184L254,185L255,186L256,186L256,187ZM261,188L260,187L259,188L258,187L258,188L258,188L258,189L257,189L256,187L256,186L255,186L254,185L255,184L254,183L256,183L256,181L258,181L258,181L260,181L262,182L261,183L261,184L262,185L261,186L261,187ZM266,184L265,186L264,187L264,188L263,188L262,188L262,188L261,188L261,188L261,187L261,186L262,185L261,184L261,183L262,182L262,182L264,182L266,184ZM371,102L372,102L375,103L374,104L374,105L373,106L372,105L372,106L371,107L371,108L372,107L372,108L372,109L373,109L372,110L373,111L374,112L374,112L372,113L368,113L366,114L365,115L363,115L361,114L361,114L357,114L357,113L357,112L358,108L356,106L355,105L352,105L352,103L354,103L357,103L356,101L358,102L362,101L363,99L365,99L365,99L366,99L367,100L368,101L369,101L370,102L371,102ZM376,114L377,114L377,115L377,117L376,116L376,115ZM223,192L223,194L222,195L220,197L218,197L217,199L217,200L216,201L215,200L214,200L213,200L213,199L214,199L214,198L215,197L214,196L214,197L212,196L213,196L213,194L213,194L213,193L214,191L214,191L215,190L216,189L218,191L218,190L219,191L220,192L221,191L222,192ZM239,158L240,158L240,159L240,159L239,159L238,159L237,159L238,158ZM219,158L220,158L221,159L221,159L220,159L219,160L218,159L217,159L217,158L218,158ZM210,150L212,150L213,150L215,151L216,151L217,151L218,151L219,153L221,153L221,153L222,154L222,154L223,154L225,155L225,155L223,156L222,156L221,156L218,156L220,155L219,154L218,154L217,154L217,153L216,153L214,152L213,152L211,152L210,151L211,151L209,151L208,152L207,152L207,152L206,152L205,152L206,152L207,151L207,150L208,150L210,150ZM417,233L416,232L415,233L414,232L414,232L412,231L411,231L411,230L411,229L410,229L408,227L407,226L407,226L406,224L408,225L409,225L409,225L410,224L412,222L413,222L413,221L414,221L415,220L415,221L417,221L418,221L418,222L419,222L420,222L420,225L420,226L419,227L420,228L420,229L419,229L419,230ZM414,232L411,234L409,235L409,236L408,237L407,237L407,238L407,238L406,239L404,239L403,238L402,238L402,238L401,239L400,240L399,241L398,241L398,240L398,239L397,237L396,237L396,232L398,232L398,225L399,225L402,225L403,225L404,225L405,225L406,224L406,224L407,226L407,226L408,227L410,229L411,229L411,230L411,231L412,231ZM396,237L396,244L395,245L394,245L393,245L392,244L391,244L391,243L390,244L388,243L388,241L387,240L387,238L386,235L386,233L386,232L385,232L384,230L383,228L383,227L381,225L381,224L382,223L383,223L385,223L386,224L386,224L393,224L395,224L399,225L402,224L404,224L405,224L406,224L406,224L405,225L404,225L403,225L402,225L399,225L398,225L398,232L396,232ZM330,167L329,166L328,165L329,165L330,164L330,163L331,162L332,162L332,162L333,162L334,162L336,163L337,164L338,165L338,166L338,168L339,168L339,169L339,169L339,169L338,169L338,169L337,170L336,169L335,169L332,169L331,169L331,169L330,169L329,168L331,168L331,168L332,168L332,167L333,168L334,168L335,167L334,167L334,167L333,167L333,167L332,167L332,167ZM339,169L339,169L339,168L338,168L338,166L338,165L338,165L339,164L339,164L341,164L342,164L342,164L343,164L350,164L350,162L350,162L349,154L348,147L351,146L357,150L363,154L364,155L365,156L366,156L366,157L368,157L368,161L367,163L367,164L365,164L363,164L362,165L361,165L360,165L359,164L358,165L356,165L356,166L355,167L354,167L354,168L353,167L352,168L352,169L350,171L351,171L350,172L350,173L349,173L349,174L349,173L348,173L348,173L348,174L346,174L346,173L345,173L345,173L345,172L345,172L344,172L344,172L345,171L344,170L344,170L343,170L343,170L343,170L342,170L341,170L341,170L340,170L340,170L339,170L339,170ZM329,154L329,153L336,153L336,151L337,150L338,149L338,145L344,145L344,142L351,146L348,147L349,154L350,162L350,162L350,164L343,164L342,164L342,164L341,164L339,164L339,164L338,165L338,165L337,164L336,163L334,162L333,162L332,162L332,162L331,162L330,163L330,162L330,161L331,159L330,157L330,156L330,155L330,155ZM365,181L363,181L363,180L363,175L363,175L363,174L362,173L361,173L362,172L362,172L363,171L364,171L364,170L365,170L365,170L367,171L367,171L367,172L367,173L367,174L366,175L365,175L365,176L365,178ZM387,150L388,153L388,154L388,154L389,155L389,156L388,159L388,162L385,163L385,166L385,166L385,168L387,168L386,169L386,169L386,169L386,169L384,167L384,167L382,168L381,168L380,168L379,168L378,168L377,169L376,169L374,168L373,168L372,168L372,167L370,167L368,167L367,167L367,168L367,169L367,171L365,170L365,170L364,170L364,169L362,169L362,168L361,167L361,166L361,165L362,165L363,164L365,164L367,164L367,163L368,161L368,157L370,156L376,153L382,149L385,150L386,151ZM365,181L365,178L365,176L365,175L366,175L367,174L367,173L367,172L367,171L367,171L367,169L367,168L367,167L368,167L370,167L372,167L372,168L373,168L374,168L376,169L377,169L378,168L379,168L380,168L381,168L382,168L384,167L384,167L386,169L386,169L387,170L386,170L386,171L385,172L384,173L384,174L384,175L383,176L382,177L382,178L382,179L381,179L380,180L379,179L378,179L377,180L377,180L376,182L375,183L374,184L373,184L372,184L371,184L370,183L369,182L368,181L367,181ZM386,169L387,170L387,171L387,172L388,174L387,174L387,174L386,174L385,175L387,176L387,176L388,177L388,178L388,178L387,180L386,181L386,182L387,183L386,183L387,184L387,185L388,186L389,187L389,187L389,188L389,189L388,188L386,188L384,188L384,188L383,188L381,188L381,188L378,188L378,186L377,185L376,185L376,184L375,184L375,183L376,182L377,180L377,180L378,179L379,179L380,180L381,179L382,179L382,178L382,177L383,176L384,175L384,174L384,173L385,172L386,171L386,170L387,170L386,169L386,169ZM362,172L361,173L362,173L363,174L363,175L363,175L363,180L363,181L362,181L362,181L361,179L361,178L361,177L361,176L361,175L361,173L360,172L360,172ZM360,172L360,172L361,173L361,175L361,176L361,177L361,178L361,179L362,181L362,181L359,182L358,183L356,183L355,183L355,182L354,181L355,179L355,177L355,174L355,173L355,172L358,172L359,172L359,172ZM345,173L346,173L346,174L348,174L348,173L348,173L349,173L349,174L349,173L350,173L351,173L351,174L352,174L353,174L354,174L355,174L355,177L355,179L354,181L355,182L355,183L354,183L353,183L352,183L349,183L348,183L346,184L346,184L346,183L346,182L346,182L345,181L345,181L344,180L345,179L345,179L345,178L345,178L345,177L345,177L345,177L346,176L345,175L345,174L345,174ZM335,169L336,169L337,170L338,169L338,169L339,169L339,169L339,170L339,170L340,170L340,170L341,170L341,170L342,170L343,170L343,170L343,170L344,170L344,170L345,171L344,172L344,172L345,172L345,172L345,173L345,173L345,174L345,174L345,175L346,176L345,177L345,177L345,177L345,178L345,178L344,178L344,179L343,179L343,178L343,178L342,176L342,177L341,177L341,177L341,176L341,176L341,175L340,174L340,174L338,174L338,174L337,174L337,174L337,175L336,176L335,175L334,174L334,174L333,173L333,173L333,172L332,172L333,171L334,171L334,171L335,171L335,170L335,170L335,170ZM330,169L331,169L331,169L332,169L335,169L335,170L335,170L335,170L335,171L334,171L334,171L333,171L332,172L331,171L331,171L330,170L330,170L330,170ZM345,178L345,179L345,179L344,180L345,181L345,181L346,182L346,182L346,183L346,184L345,184L344,183L342,182L340,181L339,180L340,179L340,179L341,178L341,177L342,177L342,176L343,178L343,178L343,179L344,179L344,178ZM336,176L337,175L337,174L337,174L338,174L338,174L340,174L340,174L341,175L341,176L341,176L341,177L341,177L341,178L340,179L340,179L339,180L339,179L337,179L336,178L336,177ZM350,173L350,172L351,171L350,171L352,169L352,168L353,167L354,168L354,167L355,167L356,166L356,165L358,165L359,164L360,165L361,165L361,166L361,167L362,168L362,169L364,169L364,170L364,171L363,171L362,172L362,172L360,172L359,172L359,172L358,172L355,172L355,173L355,174L354,174L353,174L352,174L351,174L351,173ZM410,182L409,183L408,183L407,182L406,183L406,183L405,183L404,183L402,184L402,183L401,184L401,185L399,184L398,184L397,183L395,183L394,183L394,184L394,186L392,186L391,185L390,186L389,188L389,187L389,187L388,186L387,185L387,184L386,183L387,183L386,182L386,181L387,180L388,178L389,178L390,178L390,178L390,178L393,178L394,177L394,176L394,176L395,175L397,176L398,175L400,173L401,172L402,172L402,172L403,174L403,174L403,175L403,176L403,176L405,177L406,178L406,178L407,179L408,180L408,181L410,182ZM394,186L394,187L393,188L393,189L392,190L392,191L392,192L392,193L392,193L391,194L390,195L389,197L389,198L389,199L388,200L387,201L386,201L386,200L385,200L384,201L384,201L383,200L382,200L382,201L380,199L382,198L381,197L382,197L383,196L383,196L384,196L385,197L386,196L386,194L386,193L385,192L386,190L386,189L384,190L384,189L384,188L386,188L388,188L389,189L389,188L390,186L391,185L392,186ZM381,188L381,188L383,188L384,188L384,188L384,189L384,190L386,189L386,190L385,192L386,193L386,194L386,196L385,197L384,196L383,196L383,196L382,197L381,197L382,198L380,199L378,197L377,196L376,194L376,193L376,193L377,192L377,190L378,190L381,190ZM378,188L381,188L381,190L378,190L377,190L377,190ZM416,207L417,208L418,208L419,208L420,209L421,210L421,211L421,212L420,213L421,215L420,215L420,217L421,217L415,219L415,220L414,221L413,221L413,222L412,222L410,224L409,225L409,225L408,225L406,224L406,224L406,224L405,224L404,224L402,224L401,223L400,221L400,216L404,216L404,215L404,214L404,213L404,212L404,212L404,212L404,213L405,212L406,213L407,213L408,214L409,213L410,214L411,214L412,215L413,216L414,216L414,214L413,215L412,214L412,213L412,212L412,210L412,209L412,208L413,207L415,207ZM420,209L421,209L422,210L422,211L423,213L422,214L423,217L424,217L424,217L425,219L425,221L424,221L424,223L423,221L423,220L423,219L423,219L422,218L422,218L421,217L420,217L420,215L421,215L420,213L421,212L421,211L421,210ZM423,213L424,213L427,213L427,213L428,213L429,213L430,213L432,212L433,211L434,212L434,213L434,215L434,218L434,219L434,220L433,221L432,222L430,223L428,224L426,226L425,226L424,228L423,228L423,229L424,231L424,232L424,232L425,232L425,234L424,235L425,235L425,236L424,237L422,237L420,238L419,239L420,240L420,240L420,241L418,241L418,240L418,239L418,238L418,236L418,235L417,233L419,230L419,229L420,229L420,228L419,227L420,226L420,225L420,222L419,222L418,222L418,221L417,221L415,221L415,220L415,219L421,217L422,218L422,218L423,219L423,219L423,220L423,221L424,223L424,221L425,221L425,219L424,217L424,217L423,217L422,214ZM418,241L418,242L417,242L416,241L416,240L416,239L417,239L417,239L418,239L418,240ZM384,201L383,201L383,202L383,202L382,203L382,201L382,200L383,200ZM382,203L383,203L384,203L384,203L390,203L390,204L391,205L391,206L392,207L393,207L394,206L395,207L395,206L395,205L397,205L397,205L398,205L397,205L400,205L400,206L400,207L400,208L400,209L400,210L400,212L401,212L402,212L403,212L404,212L404,212L404,213L404,214L404,215L404,216L400,216L400,221L401,223L402,224L399,225L395,224L393,224L386,224L386,224L385,223L383,223L382,223L381,224L381,222L381,221L382,219L382,218L383,217L383,216L384,215L385,214L385,213L385,212L384,211L384,210L383,209L384,208L384,208L384,206L383,205L382,203ZM416,196L416,197L416,198L416,198L416,199L415,199L414,200L413,200L413,198L413,197L414,197L415,196ZM425,132L425,133L424,133L424,134L424,134L424,134L424,135L425,135L425,135L424,138L423,138L422,135L423,135L423,134L423,134L424,132L424,132L424,132L425,132L425,131L425,131L425,132L425,132ZM425,131L425,131L425,132L424,132L425,130L426,129L426,129L426,129L427,130L426,130ZM450,215L451,215L451,217L452,219L452,220L452,221L451,221L451,220L451,221L451,222L451,223L450,223L450,225L449,227L448,229L447,233L447,235L446,237L444,238L443,239L442,238L440,238L440,237L440,235L439,234L439,232L439,231L440,231L440,230L441,229L441,227L441,227L440,225L440,224L441,223L441,222L442,221L443,221L444,221L444,221L445,220L447,219L447,218L447,217L448,217L449,216L449,215L450,214ZM425,135L424,135L424,134L424,134L424,134L424,133L425,133L425,134ZM330,167L332,167L332,167L333,167L333,167L334,167L334,167L335,167L334,168L333,168L332,167L332,168L331,168L331,168L329,168ZM377,137L377,134L375,133L375,132L374,131L374,130L375,129L375,127L375,126L375,125L377,124L379,124L379,125L380,124L380,125L379,126L379,126L380,127L380,129L378,129L379,130L380,130L380,131L381,132L381,133L380,134L379,134L378,135L378,136L378,136ZM344,142L344,142L344,142L344,139L347,138L349,138L350,137L351,136L353,136L353,134L354,134L355,134L358,133L358,133L357,132L357,130L357,129L356,128L358,127L360,127L361,126L363,125L366,125L369,125L370,125L371,124L373,124L374,125L375,125L375,126L375,127L375,129L374,130L374,131L375,132L375,133L377,134L377,137L378,138L378,139L378,141L378,142L378,143L378,144L377,144L378,146L378,147L379,148L380,147L381,148L382,149L376,153L370,156L368,157L366,157L366,156L365,156L364,155L363,154L357,150L351,146ZM425,133L425,132L427,133L431,131L431,133L431,134L427,135L429,136L429,137L428,137L427,138L427,138L426,139L424,139L424,138L425,135L425,135L425,134ZM454,148L454,148L454,148L456,148L457,148L458,148L460,147L461,146L462,145L463,145L463,147L462,147L462,148L462,148L461,148L461,149L461,150L461,151L460,151L455,150L454,148ZM453,147L452,146L453,145L453,144L454,145L454,146L454,147L453,147ZM447,137L448,138L448,139L448,140L447,140L446,139L445,139L446,137ZM431,133L431,131L435,129L435,127L435,126L436,125L437,124L438,124L440,124L441,125L442,124L443,126L444,127L444,128L443,129L443,130L444,132L446,133L447,134L447,136L447,136L447,137L448,137L447,137L446,137L445,139L441,139L436,135L434,134ZM461,151L461,150L461,149L461,148L462,148L462,148L462,147L463,147L464,148L465,148L466,149L467,149L468,150L468,151L469,151L469,151L468,152L468,153L467,154L467,155L466,155L465,155L465,156L465,157L465,157L464,157L463,158L463,159L463,159L461,159L461,160L461,161L460,161L459,161L458,162L457,162L456,160L455,157L460,156L461,152ZM463,145L462,145L463,144L463,144L463,145ZM665,221L666,222L665,222L665,221ZM664,221L664,220L664,219L665,219L665,221L664,220ZM547,170L546,168L548,166L550,166L552,166L553,167L554,165L556,166L556,167L556,170L553,171L554,172L552,172L550,173L549,173L548,172ZM552,166L550,166L548,166L546,168L547,170L545,169L544,169L544,168L542,168L542,170L541,172L541,174L541,175L542,175L543,177L543,178L544,180L545,180L546,181L546,181L544,182L544,181L543,180L542,180L542,180L541,179L540,178L539,177L539,178L539,177L539,176L540,174L540,172L541,170L541,169L541,168L541,167L539,165L539,164L540,164L540,163L539,161L538,160L537,158L538,158L539,156L540,156L541,155L542,155L543,155L543,156L545,157L544,158L544,160L546,159L547,159L548,159L548,159L549,159L551,160L551,162L552,164L552,165ZM556,166L554,165L553,167L552,166L552,165L552,164L551,162L551,160L549,159L548,159L548,159L547,159L546,159L544,160L544,158L545,157L543,156L543,155L542,155L543,154L544,153L545,153L546,153L545,151L546,151L547,153L548,154L550,154L551,156L550,156L549,157L552,158L553,160L554,162L556,163L556,164ZM542,155L541,155L540,156L539,156L538,158L537,158L538,160L539,161L540,163L540,164L539,164L539,165L541,167L541,168L541,169L541,170L540,172L540,174L539,173L540,171L539,170L540,168L539,167L538,165L538,163L537,161L536,162L534,163L533,163L532,163L532,161L532,159L530,157L531,156L530,156L528,154L528,153L529,153L529,152L530,151L530,151L530,150L530,148L531,149L532,147L532,146L533,145L533,144L536,142L537,143L537,142L537,141L537,141L538,140L539,141L540,142L540,143L540,145L538,146L538,148L540,148L540,150L541,150L541,152L542,152L543,153L544,152L544,153L543,154ZM550,173L552,172L554,172L553,171L556,170L556,167L556,166L556,164L556,163L554,162L553,160L552,158L549,157L550,156L551,156L550,154L548,154L547,153L546,151L547,151L549,151L550,150L552,149L553,150L554,150L554,152L555,152L557,153L554,154L553,156L553,157L554,159L556,162L557,163L558,164L559,168L559,171L557,172L555,173L554,175L552,176L551,175L551,174ZM598,115L598,115L598,115ZM598,115L598,115L598,115L597,116L596,116L596,118L595,118L595,118L594,119L593,119L592,120L592,120L592,121L593,121L594,122L594,122L593,122L592,122L591,123L590,123L590,123L589,123L589,123L588,123L588,123L588,123L587,123L588,122L588,122L588,121L588,120L588,120L587,120L586,119L588,118L590,117L591,116L592,116L594,116L593,115L596,115L597,114ZM590,123L590,123L591,123L592,122L593,122L594,122L594,122L595,124L596,125L596,127L595,128L594,128L592,129L590,129L590,128L591,127L590,125L591,125ZM520,102L522,102L525,100L528,99L530,100L532,100L533,101L535,101L537,101L539,100L538,99L540,97L542,98L544,98L546,99L546,100L549,101L551,100L553,100L555,100L557,101L558,102L559,102L562,102L563,102L566,102L568,100L569,101L570,101L573,101L572,102L570,104L571,105L572,105L574,105L575,104L577,105L578,106L578,107L577,107L574,107L573,107L571,109L569,109L567,110L565,110L564,110L563,111L563,112L564,112L563,113L561,114L559,115L556,115L553,115L551,116L550,116L548,116L546,115L544,114L541,115L538,114L536,114L535,113L534,111L533,111L530,110L528,110L526,109L525,109L526,107L525,105L522,104L520,103ZM537,141L537,141L537,142L537,143L536,142L533,144L533,145L532,146L532,147L531,149L530,148L530,150L530,151L530,151L529,152L528,149L527,149L527,150L526,149L527,148L527,148L528,146L527,146L526,146L524,146L524,145L523,145L521,144L521,145L522,146L521,147L521,147L522,148L521,149L522,150L522,152L522,152L521,152L518,153L519,154L518,155L515,157L513,159L512,160L510,161L510,162L509,162L507,163L506,163L506,164L506,167L506,168L506,170L506,173L505,173L504,175L504,175L503,176L502,177L501,177L500,176L499,173L498,171L497,171L496,169L496,167L496,165L494,163L493,159L493,157L493,155L492,153L490,154L488,154L486,152L487,151L486,150L484,149L485,148L489,148L489,146L488,145L488,144L487,143L489,141L491,141L493,139L494,137L496,136L496,134L497,133L496,132L495,131L494,129L495,129L498,129L500,129L502,127L504,129L504,131L504,132L504,133L503,133L503,135L505,136L508,137L507,138L506,140L508,140L509,141L512,142L514,142L515,143L517,143L519,144L520,144L521,143L520,142L521,141L522,141L522,142L522,143L524,143L525,143L526,143L528,143L528,142L527,141L529,141L530,140L532,139L534,139L535,138L536,139L535,140ZM529,152L529,153L528,153L528,154L528,153L528,152L527,152L527,151L525,150L525,151L524,152L524,152L523,152L523,152L522,152L522,150L521,149L522,148L521,147L521,147L522,146L521,145L521,144L523,145L524,145L524,146L526,146L527,146L528,146L527,148L527,148L526,149L527,150L527,149L528,149ZM527,141L528,142L528,143L526,143L525,143L524,143L522,143L522,142L523,141L524,140L525,141L526,141ZM521,141L520,142L521,143L520,144L519,144L517,143L515,143L514,142L512,142L509,141L508,140L506,140L507,138L508,137L509,137L510,137L512,138L513,139L513,139L515,140L516,141L518,141ZM502,127L500,129L498,129L495,129L494,129L495,131L496,132L497,133L496,134L496,136L494,137L493,139L491,141L489,141L487,143L488,144L488,145L489,146L489,148L485,148L484,149L483,148L482,147L481,146L478,146L475,146L472,146L473,144L475,143L475,142L474,142L474,141L473,140L472,139L471,138L474,139L476,138L477,139L477,138L479,138L481,138L481,136L482,135L483,135L484,134L485,134L486,134L486,134L486,133L487,132L488,131L487,130L489,130L490,129L490,129L490,128L490,127L490,126L491,125L493,125L495,125L496,125L497,124L498,125L499,127ZM481,124L482,124L484,124L484,125L485,124L486,124L487,123L488,124L488,123L488,123L489,122L490,122L490,123L490,123L490,124L491,125L492,125L492,124L493,124L495,124L497,124L497,124L496,125L495,125L493,125L491,125L490,126L490,127L490,128L490,129L490,129L489,130L487,130L488,131L487,132L486,133L486,134L486,134L485,134L484,134L483,135L482,135L481,136L481,138L479,138L477,138L477,139L476,138L474,139L471,138L473,136L472,135L471,135L471,133L470,132L471,131L470,131L471,129L472,127L473,128L475,127L475,127L477,126L478,126L478,124L480,124L480,123L481,124ZM484,124L485,122L484,121L483,121L483,120L485,120L486,119L486,118L489,117L488,118L489,119L489,119L489,119L487,119L487,120L489,120L491,120L494,120L495,122L495,122L496,122L496,123L497,124L495,124L493,124L492,124L492,125L491,125L490,124L490,123L490,123L490,122L489,122L488,123L488,123L488,124L487,123L486,124L485,124L484,125ZM489,115L490,114L491,114L494,115L494,113L495,113L498,114L498,114L502,114L504,114L505,115L506,115L506,115L503,116L502,117L500,117L499,118L498,118L496,118L495,119L495,120L494,120L491,120L489,120L487,120L487,119L489,119L489,119L491,119L493,118L491,117L490,117L488,116L490,115ZM456,116L456,115L459,115L460,115L461,117L462,117L464,117L464,116L465,115L467,114L469,115L469,117L470,117L472,117L473,117L474,119L476,120L477,121L479,122L481,123L481,124L481,124L480,123L480,124L478,124L478,126L477,126L475,127L475,127L473,128L472,127L471,126L470,125L468,124L466,124L464,123L463,123L462,123L461,123L460,124L458,124L458,123L458,121L457,120L457,119L456,119L456,118L458,118L460,117L458,116L458,115L456,116L456,117ZM448,137L447,137L447,136L447,136L447,134L446,133L444,132L443,130L443,129L444,128L444,127L443,126L442,124L441,123L441,122L440,120L442,120L442,120L443,121L444,121L445,121L447,120L448,120L448,120L447,121L449,122L449,122L450,124L451,124L453,125L455,125L458,125L458,124L460,124L461,123L462,123L463,123L464,123L466,124L468,124L470,125L471,126L472,127L471,129L470,131L471,131L470,132L471,133L471,135L472,135L473,136L471,138L472,139L473,140L474,141L474,142L475,142L475,143L473,144L472,146L469,146L467,145L465,145L464,143L463,143L462,143L460,144L457,143L456,142L454,141L453,139L451,137L450,137L449,137ZM425,132L425,132L425,132L425,131L426,130L427,130L426,129L426,129L425,127L426,127L426,126L427,126L427,125L428,125L430,125L431,125L432,125L434,124L435,124L437,124L436,125L435,126L435,127L435,129L431,131L427,133ZM445,121L444,121L443,120L443,120L443,120L442,120L442,120L441,119L440,119L440,118L439,117L442,117L442,117L443,118L443,118L444,119L443,119L444,120L445,120ZM380,85L381,84L382,82L383,80L382,79L382,77L383,75L385,75L385,75L385,74L388,71L389,69L391,68L392,68L393,67L396,67L396,66L398,66L400,67L403,68L403,71L404,72L400,72L399,74L399,75L396,76L393,78L391,80L392,82L394,83L393,85L391,85L390,88L389,90L387,90L386,91L384,91L383,89L381,87ZM411,90L413,90L414,91L414,90L416,91L416,92L416,92L417,93L418,94L418,94L419,94L420,95L419,95L417,95L417,95L417,96L418,97L416,97L416,98L416,98L415,98L413,98L413,98L412,98L411,98L410,98L408,98L406,97L405,97L404,98L403,98L403,97L402,96L403,96L403,95L403,95L403,94L405,94L407,93L407,92L408,91L408,91L409,90ZM418,97L419,97L419,97L420,97L422,97L423,98L422,98L422,99L424,99L424,99L424,100L427,100L428,100L429,101L430,101L433,102L433,102L432,103L433,104L432,105L431,105L430,105L430,106L428,106L427,107L425,107L424,108L424,109L424,109L423,108L423,108L421,108L421,108L421,108L418,108L418,107L416,107L415,108L414,109L413,109L412,109L411,109L412,109L412,108L413,108L413,107L413,107L413,107L414,108L415,107L414,107L414,107L414,106L414,106L413,105L413,105L412,104L411,104L410,104L409,104L409,104L408,104L407,105L406,105L405,105L404,105L403,105L402,104L401,105L401,104L400,104L401,103L401,103L402,103L401,102L403,100L404,100L404,100L403,98L404,98L405,97L406,97L408,98L410,98L411,98L412,98L413,98L413,98L415,98L416,98L416,98L416,97ZM403,94L403,95L403,95L403,96L402,96L403,97L403,98L404,100L404,100L403,100L401,102L402,103L401,103L399,102L398,102L397,102L396,102L395,102L394,102L394,102L394,101L392,101L392,100L391,100L390,100L389,100L390,100L388,99L387,99L387,98L387,97L386,96L386,95L386,95L386,94L387,94L390,93L392,92L394,92L394,93L396,93L398,93L401,93L402,93ZM391,104L391,105L390,105L390,105L390,107L389,107L388,107L387,107L385,107L383,107L382,106L380,106L380,107L379,107L378,107L377,106L378,106L377,105L378,105L379,106L379,105L381,105L382,105L383,105L384,106L384,105L383,104L384,104L385,103L386,104L387,103L388,103L389,103L390,103L391,103L391,104ZM400,104L401,104L401,105L400,105L399,106L398,108L397,108L396,108L394,108L394,109L392,108L391,107L390,107L390,107L390,107L390,105L390,105L391,105L391,104L392,105L393,105L394,105L394,104L395,104L396,104L396,104L397,104L397,104L398,103L400,104ZM409,104L409,104L410,104L411,104L412,104L413,105L413,105L414,106L414,106L414,107L414,107L415,107L414,108L413,107L413,107L413,107L413,108L412,108L412,109L411,109L411,108L411,108L411,107L410,106L410,105L409,104ZM411,109L412,109L413,109L414,109L414,110L413,110L413,110L412,112L411,112L410,112L407,112L407,112L404,112L403,112L402,112L401,111L401,111L401,111L401,111L400,111L399,110L399,110L398,109L398,109L397,108L398,108L399,106L400,105L401,105L402,104L403,105L404,105L405,105L406,105L407,105L408,104L409,104L409,104L410,105L410,106L411,107L411,108L411,108ZM408,91L408,91L407,92L407,93L405,94L403,94L402,93L401,93L401,93L401,92L401,92L399,91L398,90L400,89L404,89L405,89L406,90L407,90ZM410,87L411,88L411,89L411,90L409,90L408,91L407,90L406,90L405,89L404,89L400,89L398,90L398,89L399,87L401,87L402,88L404,88L404,87L406,86L407,87L408,87ZM411,84L411,84L410,85L411,87L410,87L408,87L407,87L406,86L404,87L405,86L404,86L403,85L403,84L405,84L407,83L409,84ZM386,94L386,95L386,95L386,96L387,97L387,98L387,99L387,99L386,99L386,99L384,100L384,100L382,100L383,101L383,102L384,102L385,103L384,104L383,104L384,105L384,106L383,105L382,105L381,105L379,105L379,106L378,105L377,105L376,105L375,105L374,105L374,104L375,103L372,102L371,102L371,101L371,101L371,99L371,98L372,98L372,97L373,95L373,95L373,94L374,94L375,94L376,94L376,93L376,92L377,92L378,92L378,93L380,93L380,94L382,93L383,93L385,93ZM401,111L402,112L403,112L404,112L407,112L407,112L410,112L411,112L412,112L411,113L410,114L411,115L409,115L408,116L408,117L406,117L405,116L403,117L402,117L402,115L401,115L401,115L401,114L401,114L402,113L401,112L401,112ZM408,128L408,128L405,128L405,128L403,128L403,127L404,128L406,127L407,128L407,128ZM402,117L403,117L405,116L406,117L408,117L408,116L408,116L408,117L407,118L406,118L405,117L403,118L404,119L404,119L403,119L402,118L401,119L402,120L403,121L402,121L403,122L404,122L404,123L402,123L403,124L402,124L402,126L401,126L399,125L399,123L398,122L398,121L397,120L397,120L398,119L398,118L398,118L398,118L399,117L400,117L401,117L401,117ZM442,124L441,125L440,124L438,124L437,124L435,124L434,124L432,125L431,125L430,125L428,125L427,125L427,126L426,126L426,127L425,126L426,125L425,125L423,125L422,126L419,126L418,125L416,125L415,126L414,126L412,125L410,125L409,123L408,122L409,121L408,120L410,118L413,118L413,117L417,117L419,116L421,115L424,115L427,117L430,117L432,117L434,117L436,116L438,116L439,117L440,118L440,119L441,119L442,120L440,120L441,122L441,123ZM408,116L409,115L411,115L411,116L413,117L412,117L410,117L410,118L408,119L407,118L407,118L408,117L408,116ZM398,118L398,118L398,118L398,119L397,120L396,120L396,119L395,119L395,118L395,117L396,116L395,116L395,115L396,114L396,115L397,114L397,115L397,115L398,116L397,116L398,117ZM390,107L391,107L392,108L394,109L394,108L395,109L395,110L395,110L394,110L393,110L391,110L390,110L390,110L389,110L389,110L390,111L390,112L391,112L392,113L392,114L394,114L394,115L392,114L391,113L389,113L388,111L388,111L387,110L387,110L386,110L385,110L385,110L385,109L385,109L386,109L387,109L387,109L388,109L388,109L389,108L389,108ZM377,105L378,106L377,106L378,107L379,107L379,107L378,108L377,107L376,108L375,108L375,108L374,108L373,109L372,108L372,107L371,108L371,107L372,106L372,105L373,106L374,105L375,105L376,105ZM371,101L371,101L371,102L371,102L370,102L371,101ZM371,99L371,101L371,101L370,102L369,101L368,101L367,100L366,99L365,99L365,99L366,98L367,99L369,98L370,99ZM373,95L373,95L372,97L372,98L371,98L371,99L370,99L369,98L367,99L366,98L367,98L369,95L371,94ZM344,116L344,115L345,115L345,116L346,116L347,116L348,116L348,117L348,117L347,119L347,119L347,120L346,120L347,121L347,122L347,123L347,123L346,124L346,124L346,125L345,125L344,125L344,123L344,122L343,122L343,121L343,120L344,120L344,119L344,118L344,117L344,116ZM346,124L346,124L347,123L347,123L347,122L347,121L346,120L347,120L347,119L347,119L348,117L348,117L348,116L347,116L346,116L345,116L345,115L344,115L344,116L344,114L343,114L345,112L348,113L350,113L352,113L354,113L357,113L357,114L361,114L361,114L363,115L365,115L366,116L364,117L361,117L361,118L360,119L359,120L360,121L359,122L359,123L357,124L356,125L354,125L352,125L351,126L350,126L349,126L349,126L348,125ZM349,94L349,95L348,97L344,98L342,98L343,96L342,94L345,92L346,92L347,93L346,93L347,93ZM662,230L664,232L665,232L664,233L663,232L662,232L660,231L659,229L659,229L660,229L661,229L662,230ZM655,211L656,212L655,212L654,211L655,211ZM655,209L654,210L653,208L653,207L653,207L654,209ZM653,210L652,210L651,210L651,210L651,209L652,209L653,210ZM651,207L651,207L651,208L650,207L649,206L648,206L649,205L649,206ZM646,205L647,205L647,205L646,205L645,204L645,204ZM682,265L682,266L681,267L679,268L679,267L678,267L679,266L679,265L677,264L677,263L678,263L678,261L678,260L678,259L678,259L677,258L675,256L675,255L675,255L676,256L678,256L678,258L680,260L680,259L680,259L681,260L682,261L683,261L684,260L685,261L685,262L684,263L683,263L682,264L683,265ZM669,271L671,270L672,269L673,268L673,268L674,267L675,266L675,267L676,267L677,267L678,267L678,268L677,269L676,270L675,271L675,272L674,272L672,273L672,274L671,276L669,276L669,277L667,277L666,276L664,276L663,276L664,274L667,272L668,272ZM629,266L630,266L630,269L630,269L630,271L629,270L628,272L627,271L626,271L625,270L625,269L624,267L624,266L625,266L627,267L628,267ZM590,251L588,252L586,252L586,253L585,254L584,254L583,254L581,254L580,254L578,254L577,255L577,255L576,255L575,256L574,256L573,256L571,255L570,254L570,253L571,253L571,253L571,252L571,251L571,250L570,248L570,247L570,246L569,244L569,244L568,243L568,242L567,240L567,240L567,240L567,239L568,239L568,240L568,239L567,238L567,237L567,236L567,235L567,235L567,234L567,233L568,232L568,233L569,232L570,231L571,230L573,230L574,230L574,230L575,229L577,229L577,229L577,228L578,228L580,228L581,227L582,226L583,225L583,224L583,223L584,222L585,223L586,223L585,222L586,221L586,222L587,220L588,219L588,219L589,218L589,218L590,218L590,218L591,217L592,217L593,218L594,219L595,219L596,219L596,218L597,217L598,216L597,216L598,215L599,214L600,214L602,214L602,213L600,213L601,212L602,213L603,213L605,214L605,214L607,214L608,214L608,214L609,214L610,215L609,215L608,216L608,216L608,217L607,218L607,219L607,219L608,220L610,221L611,222L612,223L613,223L613,223L614,224L616,224L617,224L617,223L617,222L618,221L618,219L618,219L618,218L618,217L618,216L618,215L618,215L619,214L619,213L619,212L620,211L620,212L620,213L621,214L621,214L622,215L622,216L622,217L622,219L623,218L624,219L625,219L625,220L625,222L625,223L626,223L626,224L626,225L627,227L629,227L630,228L631,229L631,230L632,231L633,233L633,232L634,233L635,233L635,235L636,236L637,237L639,238L639,240L639,241L639,242L640,243L640,245L639,246L639,247L639,248L639,250L638,251L636,252L636,254L635,255L635,256L634,257L633,258L633,260L633,260L632,261L630,261L629,262L628,262L627,263L625,262L624,262L624,261L623,261L622,263L620,262L619,262L618,262L616,261L615,260L615,259L614,258L613,257L612,257L612,256L612,255L611,256L609,256L610,255L611,254L611,253L611,252L610,254L608,254L608,256L606,255L606,254L605,253L604,252L605,251L602,250L601,250L599,249L596,250L594,250L592,251ZM509,178L509,180L508,181L506,181L506,180L505,177L506,174L507,175L508,176ZM559,159L558,158L558,157L559,156L561,155L562,155L562,156L561,157L561,158ZM506,115L506,114L507,113L506,110L509,109L510,109L512,106L515,106L516,106L516,104L518,104L519,102L520,102L520,103L522,104L525,105L526,107L525,109L526,109L528,110L530,110L533,111L534,111L535,113L536,114L538,114L541,115L544,114L546,115L548,116L550,116L551,116L553,115L556,115L559,115L561,114L563,113L564,112L563,112L563,111L564,110L565,110L567,110L569,109L571,109L573,107L574,107L577,107L578,107L578,106L577,105L575,104L574,105L572,105L571,105L570,104L572,102L573,101L575,102L577,101L577,100L579,98L580,97L580,96L579,96L580,95L583,95L585,95L588,95L590,96L591,98L591,98L592,100L593,101L596,102L598,103L599,105L601,105L603,104L606,104L605,105L604,106L604,108L603,110L600,109L599,110L599,112L599,114L598,114L598,115L597,114L596,115L593,115L594,116L592,116L591,116L590,117L588,118L586,119L584,120L583,121L581,121L582,120L581,120L583,118L582,117L580,118L578,119L577,120L575,121L574,121L575,123L577,123L577,124L578,124L580,123L582,124L583,124L583,125L581,125L580,126L578,127L577,128L579,129L580,131L581,133L582,134L582,136L581,136L581,137L582,138L582,139L582,141L581,141L579,143L578,145L576,147L574,149L571,150L569,151L568,152L567,151L566,152L564,153L562,153L561,155L560,155L560,154L560,153L558,152L557,153L555,152L554,152L554,150L553,150L552,149L550,150L549,151L547,151L546,151L545,151L546,153L545,153L544,153L544,152L543,153L542,152L541,152L541,150L540,150L540,148L538,148L538,146L540,145L540,143L540,142L539,141L538,140L537,141L535,140L536,139L535,138L534,139L532,139L530,140L529,141L527,141L526,141L525,141L524,140L523,141L522,142L522,141L521,141L518,141L516,141L515,140L513,139L513,139L512,138L510,137L509,137L508,137L505,136L503,135L503,133L504,133L504,132L504,131L504,129L502,127L499,127L498,125L497,124L497,124L496,123L496,122L495,122L495,122L494,120L495,120L495,119L496,118L498,118L499,118L500,117L502,117L503,116L506,115ZM582,148L581,150L580,152L579,150L579,149L580,147L581,146L582,146ZM379,107L380,107L380,106L382,106L383,107L385,107L385,108L385,109L384,109L382,109L383,110L382,111L383,112L385,113L386,114L388,116L389,116L389,116L389,116L391,117L392,118L393,118L394,119L393,119L392,119L391,118L390,119L391,120L391,121L390,121L389,123L389,123L389,122L389,121L389,121L389,120L388,119L387,119L387,118L386,118L385,117L383,117L382,116L380,115L379,114L379,112L378,112L376,111L375,111L374,112L374,112L374,112L373,111L372,110L373,109L372,109L372,108L373,109L374,108L375,108L375,108L376,108L377,107L378,108L379,107ZM387,122L388,122L388,124L388,124L388,125L386,125L385,124L383,123L383,123L385,123ZM376,117L377,117L378,118L378,121L377,120L376,121L375,121L375,118L375,117ZM378,92L377,92L376,92L375,91L375,89L375,88L376,88L377,88L378,87L379,87L379,88L379,88L379,89L380,89L379,90L379,90L378,91ZM383,90L383,91L382,92L380,91L380,90ZM349,94L347,93L346,93L347,93L346,92L348,91L350,93ZM354,95L354,95L355,94L353,93L353,92L351,92L351,92L351,91L351,90L350,91L350,89L349,89L349,87L351,85L352,85L355,85L353,87L354,87L356,87L356,88L354,90L356,90L356,90L358,92L359,93L360,95L361,96L363,96L363,97L362,98L363,99L361,99L359,99L355,100L355,100L353,100L352,100L350,101L349,101L352,99L354,98L354,98L351,98L350,97L352,97L351,96L352,95ZM334,71L333,72L335,73L333,75L328,76L326,76L324,76L319,75L320,75L316,74L320,73L319,73L316,72L317,71L320,71L323,72L325,71L328,72L331,71ZM445,116L445,116L446,117L447,117L447,117L449,116L449,117L450,118L451,118L452,119L450,119L450,120L450,121L449,121L449,122L449,122L447,121L448,120L448,120L447,120L445,121L445,120L444,120L443,119L444,119L443,118L443,118L442,117L442,117L442,117L444,117L445,117L445,117L444,116ZM444,121L443,121L442,120L442,120L442,120L443,120L443,120L443,120ZM433,113L433,113L435,113L437,113L440,114L440,114L441,114L443,115L443,115L445,116L444,116L445,117L445,117L444,117L442,117L442,117L439,117L438,116L436,116L436,116L436,114L434,114L433,113ZM580,169L579,167L581,168L581,168L581,170ZM583,174L584,173L584,172L585,172L585,173L586,172L586,173L585,174L585,175L584,176L583,174ZM590,177L590,178L591,179L590,181L589,179L588,180L589,181L589,182L586,181L586,179L586,179L585,178L585,178L584,178L582,179L582,179L583,177L584,177L585,176L586,177L587,176L587,176L589,176L589,174L590,175L590,176ZM576,175L574,177L574,175L576,174L577,173L578,171L578,173L577,174ZM583,159L583,160L583,161L583,162L582,163L581,164L582,166L583,166L584,166L586,167L586,168L586,168L586,169L585,168L584,167L584,168L582,167L581,167L580,167L580,166L580,166L580,165L580,166L579,165L579,164L578,162L579,163L579,160L580,158L581,158L582,159L583,158ZM582,171L582,170L583,171L584,171L584,172L583,172L582,173L582,172ZM589,170L589,172L588,171L588,172L588,173L587,174L587,172L587,172L587,171L588,171L588,171L586,169L588,169ZM542,180L543,180L544,181L544,182L546,181L546,181L547,181L548,182L548,183L548,184L548,185L548,186L549,187L549,187L550,189L550,190L549,190L547,188L545,187L545,186L543,185L543,183L543,182L543,181ZM575,184L573,184L571,184L571,186L570,187L569,189L567,190L566,189L565,189L564,190L563,190L561,191L560,190L560,188L561,189L563,189L563,187L564,187L566,186L567,185L568,184L569,185L569,184L570,184L570,183L570,182L572,181L573,179L573,179L574,180L574,181L576,182L577,182L577,183L576,183L576,184ZM570,182L570,183L570,184L569,184L569,185L568,184L569,183ZM385,107L387,107L388,107L389,107L390,107L390,107L390,107L389,108L389,108L388,109L388,109L387,109L387,109L386,109L385,109L385,109L385,108ZM412,66L412,67L415,69L413,70L415,72L414,74L415,75L415,76L417,77L417,78L415,79L411,82L408,82L405,83L402,83L401,82L399,81L399,80L398,78L399,77L401,76L405,74L406,73L406,73L404,72L403,71L403,68L400,67L398,66L399,66L401,67L403,66L405,67L407,66L408,65L411,64L413,65ZM401,103L401,103L400,104L400,104L398,103L397,104L397,104L396,104L396,104L395,104L394,104L394,105L393,105L392,105L391,104L391,104L391,103L391,103L392,103L393,103L393,103L393,103L393,102L394,102L394,102L394,102L394,102L395,102L396,102L397,102L398,102L399,102ZM387,99L388,99L390,100L389,100L390,100L391,100L392,100L392,101L394,101L394,102L394,102L394,102L393,102L393,103L393,103L393,103L392,103L391,103L391,103L390,103L389,103L388,103L387,103L386,104L385,103L384,102L383,102L383,101L382,100L384,100L384,100L386,99L386,99L387,99ZM426,166L426,165L427,162L427,161L428,161L429,160L430,159L431,161L432,163L433,164L435,166L436,167L437,168L438,168L439,169L438,169L437,169L437,169L436,167L435,167L435,166L433,166L432,166L431,165L430,166L429,165L429,166ZM619,121L617,122L617,124L616,126L617,127L616,128L613,129L610,129L607,131L606,130L606,129L603,129L601,130L599,130L601,132L599,135L598,135L597,135L598,133L597,133L596,131L598,131L598,130L600,129L602,127L605,127L607,127L609,124L610,125L613,123L614,122L615,120L615,118L616,117L618,117L619,119ZM624,112L625,111L625,113L623,114L621,115L618,114L617,116L615,116L615,114L616,113L618,113L618,110L619,109L621,111L622,112ZM601,131L602,130L603,130L604,129L605,130L606,130L605,131L604,131L603,131L602,132L601,132ZM254,229L255,230L254,232L256,233L257,232L258,233L259,233L259,235L259,236L260,236L260,235L261,236L261,237L261,238L260,239L260,241L259,242L257,242L255,242L253,241L255,239L255,238L253,237L251,236L249,236L246,233L246,230L247,229L247,228L251,227L252,227L254,228ZM455,157L456,160L457,162L455,162L455,163L455,164L453,164L450,165L449,166L448,167L447,166L446,167L445,168L444,168L443,168L443,168L442,168L442,169L441,169L440,169L439,169L439,168L439,167L439,166L438,165L438,164L438,164L438,163L438,163L438,162L439,162L439,161L439,160L440,160L440,160L442,160L443,160L444,161L445,161L446,161L446,161L448,159L450,158ZM424,139L426,139L427,138L427,138L428,137L429,137L429,136L427,135L431,134L431,133L434,134L436,135L441,139L445,139L446,139L447,140L448,140L449,142L450,142L450,143L451,143L451,144L451,145L452,145L452,146L452,146L453,147L453,147L454,147L454,148L454,148L455,150L460,151L461,151L461,152L460,156L455,157L450,158L448,159L446,161L446,161L445,161L444,161L443,160L442,160L440,160L440,160L439,160L439,161L439,162L438,162L438,161L437,161L437,160L436,160L435,158L435,156L433,155L433,155L431,153L431,152L431,151L430,149L429,148L428,148L428,147L428,146L427,145L427,145L426,144L425,142L424,141L423,141L423,140L423,139ZM271,334L272,334L275,334L278,334L280,335L281,336L281,337L281,338L278,338L275,339L272,339L268,340L264,340L261,339L262,338L266,338L267,337L268,336L269,336L270,335ZM239,338L243,338L247,338L249,338L250,337L251,338L251,339L250,340L247,339L242,339L240,339L240,339ZM225,322L227,322L229,322L229,321L229,320L229,319L230,318L232,318L233,318L233,319L234,320L235,320L235,321L235,322L235,323L235,324L233,324L230,324L228,324L229,323L227,324L225,324L223,323L223,323ZM174,323L175,323L177,323L180,323L182,323L184,323L185,324L183,324L181,324L179,324L176,324L174,324ZM137,326L137,326L139,326L141,326L144,326L143,327L141,327L138,327ZM128,326L129,325L131,326L134,327L133,327L131,326ZM62,335L63,335L66,335L68,335L69,336L70,337L66,337L64,336L63,336L63,336ZM32,346L32,346L32,346L32,346L34,345L37,346L37,346L39,345L39,345L40,345L42,346L45,345L45,345L50,345L52,345L53,346L56,346L61,347L65,347L72,348L77,347L85,347L89,348L94,347L99,347L100,346L92,346L87,346L85,345L80,344L80,344L81,343L82,342L81,342L78,341L77,340L74,340L79,340L83,340L85,340L89,340L92,339L93,338L93,338L90,337L88,337L84,337L80,336L77,336L76,335L73,335L72,334L71,332L72,332L74,333L77,333L80,332L81,333L84,333L87,333L89,332L91,332L94,331L94,331L93,330L94,329L96,329L97,330L100,329L102,329L105,329L107,329L109,328L111,328L114,327L115,328L116,328L119,327L121,328L124,328L126,327L129,328L131,328L134,328L137,328L139,328L142,328L144,327L146,327L148,327L150,327L152,326L154,327L154,328L155,328L157,328L159,328L162,329L164,329L167,329L169,329L172,329L174,329L177,329L178,328L176,328L175,327L173,327L172,326L172,326L171,324L172,325L175,325L177,325L179,325L181,325L182,326L184,326L187,326L189,326L192,325L193,326L196,326L197,324L199,325L201,325L203,325L205,326L207,326L209,326L212,327L213,326L214,325L216,326L218,326L220,326L221,327L224,327L225,326L227,326L229,326L232,325L234,325L236,325L237,324L238,323L237,323L237,322L236,321L236,320L235,320L235,319L235,318L236,318L237,317L237,316L237,315L237,315L237,314L238,313L240,313L241,312L242,312L243,311L244,310L245,310L247,310L248,309L249,309L251,309L252,308L253,308L255,307L256,308L255,308L253,309L252,309L251,309L250,309L248,310L247,310L246,311L246,311L246,312L247,313L246,313L244,313L243,314L242,314L241,315L240,316L241,317L242,317L243,318L245,318L246,319L246,320L247,320L247,321L248,322L248,323L249,324L249,325L249,325L249,326L248,327L247,328L245,328L244,329L243,329L240,330L238,330L235,331L233,331L231,332L228,332L225,332L222,332L219,332L220,333L223,333L225,333L226,334L224,335L221,334L218,335L218,336L218,336L220,337L220,338L223,338L227,339L230,339L232,340L236,340L240,340L245,341L248,342L251,342L253,343L254,344L256,343L259,342L262,342L266,341L269,341L274,341L278,341L282,342L283,341L286,340L290,340L294,340L297,339L301,339L305,339L308,338L307,338L306,337L306,336L302,337L299,337L295,337L295,336L295,335L296,334L298,334L301,334L304,333L306,332L307,332L310,331L312,331L314,331L316,331L319,331L321,330L324,330L326,329L328,329L330,328L331,328L332,327L330,327L331,326L332,325L334,325L336,325L338,324L339,323L340,322L341,322L343,322L344,323L346,323L347,322L347,321L349,321L350,322L352,322L354,322L357,322L359,322L360,323L362,322L363,322L366,321L368,321L369,321L371,320L373,320L374,319L375,320L377,320L379,320L380,321L382,321L383,320L384,320L387,320L388,320L389,320L391,319L393,319L395,319L397,320L399,320L400,320L401,321L403,321L405,320L407,320L409,320L411,320L413,320L415,319L416,319L418,319L420,318L421,317L422,317L424,317L424,318L426,318L428,318L429,319L430,319L432,319L433,318L435,318L436,317L438,317L440,316L442,316L443,316L445,315L446,315L448,315L449,314L451,314L452,314L453,313L454,313L456,312L458,312L459,312L461,312L463,312L464,313L464,314L466,314L467,315L469,315L470,315L472,316L474,316L475,316L477,315L478,315L480,315L482,316L484,316L486,316L487,318L487,318L487,319L485,319L484,320L484,321L486,321L486,322L485,322L484,323L485,324L487,324L489,323L490,323L491,322L492,321L493,321L494,320L495,319L496,319L498,319L500,319L501,319L502,318L503,317L504,317L506,316L507,316L508,315L510,315L511,314L513,315L514,314L516,314L518,314L519,314L520,313L521,313L522,314L523,314L525,315L527,314L529,314L530,314L532,314L533,314L535,315L536,315L538,315L540,314L542,315L543,314L544,313L545,313L547,311L549,312L550,312L551,313L553,314L555,314L557,314L559,314L561,314L562,313L564,313L566,312L567,312L568,312L569,313L571,314L573,313L574,314L576,314L578,315L580,314L582,314L583,313L585,313L586,313L588,314L590,313L591,313L593,313L595,314L596,313L598,313L600,313L602,313L604,313L606,313L606,312L606,311L607,312L608,312L608,313L609,314L610,314L613,314L615,314L617,314L619,314L621,314L623,314L625,314L626,315L626,315L627,316L629,316L631,317L634,317L636,317L638,318L640,318L641,317L643,317L644,318L646,318L648,319L650,319L651,320L653,320L654,321L656,321L659,321L661,321L663,321L665,321L667,321L669,322L671,322L672,323L672,323L671,324L670,325L669,325L668,326L666,327L665,327L663,328L662,328L661,329L659,330L659,330L658,331L658,332L658,332L659,333L659,334L660,334L664,335L664,336L661,336L658,336L655,336L653,337L653,338L652,339L651,340L654,340L655,341L656,342L658,342L661,343L664,343L668,344L669,345L674,345L674,345L676,346L681,345L685,346L688,346L688,346L688,356L360,356L32,356ZM420,128L420,128L420,128L421,128L423,127L422,128L422,128L422,128L421,128L421,128L421,128L421,128L421,128L420,128L420,128ZM420,128L420,128L420,128L421,128L421,128L421,128L421,128L421,128L422,128L422,128L422,128L420,129L419,129L419,128ZM356,128L357,129L357,130L357,132L358,133L358,133L355,134L354,134L353,134L353,136L351,136L350,137L349,138L347,138L344,139L344,142L344,142L344,143L343,143L342,143L341,143L341,143L339,143L339,144L338,145L337,147L335,149L334,151L333,152L333,153L329,153L329,153L329,152L330,152L330,151L330,150L331,149L332,148L333,147L333,146L333,145L334,144L335,143L336,142L336,142L337,141L339,141L340,139L341,139L343,137L342,135L343,134L343,133L344,131L346,131L347,130L349,128L349,127L351,127L352,128L353,127L355,128ZM427,152L420,152L413,152L406,152L406,145L406,139L405,137L405,136L405,135L406,134L408,134L410,135L412,135L413,136L414,135L415,135L416,134L418,135L418,136L419,135L420,135L422,136L422,135L423,138L424,138L423,139L423,140L422,141L422,142L421,141L420,140L419,138L419,138L420,140L421,142L422,144L423,145L423,146L425,148L425,149L425,150L427,152ZM406,152L406,156L403,156L403,156L396,153L389,149L387,150L386,151L385,150L382,149L381,148L380,147L379,148L378,147L378,146L377,144L378,144L378,143L378,142L378,141L378,139L378,138L377,137L378,136L378,136L378,135L379,134L380,134L381,133L381,132L383,132L384,132L385,132L388,133L389,135L390,135L393,136L395,137L396,136L397,136L396,134L397,133L398,132L399,132L402,133L402,133L403,133L404,134L405,134L406,134L405,135L405,136L405,137L406,139L406,145ZM447,177L442,183L440,183L438,184L437,184L436,185L435,185L434,184L433,185L432,186L431,186L430,185L430,185L429,185L427,184L426,184L425,183L425,182L424,182L423,180L422,180L422,179L421,178L420,178L421,177L422,177L422,176L422,175L422,173L423,172L423,171L424,170L425,169L426,167L426,166L429,166L429,165L430,166L431,165L432,166L433,166L435,166L435,167L436,167L437,169L437,169L437,170L436,171L436,171L436,172L437,172L438,172L438,172L438,173L438,174L439,175L440,175L446,177ZM437,169L438,169L439,169L439,169L439,170L438,171L439,171L438,172L438,172L437,172L436,172L436,171L436,171L437,170ZM449,171L449,171L449,172L449,174L449,175L448,176L447,177L446,177L440,175L439,175L438,174L438,173L438,172L439,171L439,171L440,172L440,173L441,173L443,173L445,172L447,172L448,172L448,171ZM422,194L418,194L416,194L415,194L414,195L414,194L414,193L414,192L414,191L415,190L416,189L416,189L417,188L416,188L416,186L417,185L418,186L420,185L421,185L422,184L423,186L423,186L424,189L423,190L422,191L422,192ZM415,194L416,195L416,196L416,196L415,196L414,197L413,197L413,196L413,196L413,195L414,194L414,195ZM394,114L392,114L392,113L391,112L390,112L390,111L389,110L389,110L390,110L390,110L391,110L393,110L394,110L395,110L395,110L395,111L396,112L395,113L395,113L395,113L394,113ZM401,115L402,115L402,117L401,117L401,117L400,117L399,117L398,118L398,117L397,116L398,116L398,116L398,115L399,115L399,115L400,115ZM394,108L396,108L397,108L398,109L398,109L399,110L399,110L400,111L401,111L401,111L401,111L401,111L401,112L401,112L402,113L401,114L401,114L401,115L401,115L400,115L399,115L399,115L399,115L400,114L399,114L399,114L399,114L399,114L398,113L398,113L398,113L397,114L397,114L397,114L396,113L396,113L396,113L395,113L395,113L396,112L395,111L395,110L395,110L395,110L395,109ZM397,114L396,115L396,114L395,115L395,116L395,116L394,115L394,115L394,114L394,113L395,113L395,113L396,113L396,113L396,113L397,114L397,114ZM398,116L397,115L397,115L397,114L397,114L397,114L398,113L398,113L398,113L399,114L399,114L399,114L399,114L400,114L399,115L399,115L399,115L399,115L398,115L398,116ZM248,172L249,172L249,172L249,174L247,174L247,174L248,173ZM416,186L415,184L414,184L413,184L412,184L412,184L411,184L410,182L410,182L408,181L408,180L407,179L406,178L406,178L405,177L404,176L404,176L405,176L405,174L406,173L407,173L407,174L408,175L409,175L409,174L411,174L411,175L413,175L413,174L414,174L414,174L415,173L416,174L417,174L418,173L419,172L419,171L418,170L420,170L420,170L421,170L420,171L421,172L421,173L422,174L422,175L422,175L422,176L422,177L421,177L420,178L421,178L422,179L422,180L423,180L424,182L423,183L422,184L421,185L420,185L418,186L417,185Z"
};

// api/mcp/ui/conflict-events-app.ts
var STYLES5 = `
  .evt { display: flex; align-items: baseline; justify-content: space-between; gap: 10px;
    padding: 9px 0; border-bottom: 1px solid var(--border); }
  .evt:last-child { border-bottom: none; }
  .evt-main { min-width: 0; }
  .evt-sides { font-size: 13px; font-weight: 600; color: var(--fg); overflow-wrap: anywhere; }
  .evt-meta { font-size: 11px; color: var(--muted); margin-top: 2px; overflow-wrap: anywhere; }
  .evt-deaths { font-variant-numeric: tabular-nums; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .evt[role="button"] { cursor: pointer; }
  .evt[aria-pressed="true"] { background: var(--card); box-shadow: inset 3px 0 var(--accent); padding-left: 8px; }
  .evt:focus-visible, .conflict-marker:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  #conflict-map { display: block; width: 100%; height: auto; border: 1px solid var(--border); border-radius: 6px; background: var(--bg); }
  .conflict-land { fill: var(--card); stroke: var(--muted); stroke-width: 0.5; }
  .conflict-marker, #conflict-hit-targets { cursor: pointer; }
  .conflict-dot { fill: var(--high); stroke: var(--fg); stroke-width: 1; }
  .conflict-marker[aria-pressed="true"] .conflict-dot { fill: var(--accent); stroke-width: 2; }
  .conflict-marker text { fill: var(--fg); font-size: 10px; font-weight: 700; pointer-events: none; }
  .conflict-tools { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
  #conflict-locations, #conflict-selection { font-size: 12px; color: var(--muted); overflow-wrap: anywhere; }
  #conflict-selection { margin: 8px 0; }
  #conflict-chooser { display: flex; flex-wrap: wrap; gap: 6px; }
  .conflict-control { color: var(--fg); background: var(--card); border: 1px solid var(--border); border-radius: 4px; padding: 7px 10px; cursor: pointer; font: inherit; font-size: 12px; max-width: 100%; overflow-wrap: anywhere; }
  .conflict-control:focus-visible { outline: 2px solid var(--accent); }
  .conflict-control:disabled { opacity: 0.5; cursor: default; }
  .conflict-note { margin: 10px 0 4px; padding: 8px 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 12px; line-height: 1.5; color: var(--fg); }
`;
var BODY5 = `
  <div class="head">
    <div class="title">Conflict Events</div>
    <div class="badge">WorldMonitor Conflict</div>
  </div>
  <div class="empty" id="empty">Waiting for conflict data\u2026</div>
  <div id="card" style="display:none">
    <div id="conflict-geography">
      <div class="conflict-tools">
        <span id="conflict-locations"></span>
        <button type="button" id="conflict-world" class="conflict-control">World view</button>
      </div>
      <svg id="conflict-map" viewBox="0 0 ${CONFLICT_MAP_BASE.width} ${CONFLICT_MAP_BASE.height}" role="group" aria-label="Locations of displayed conflict events">
        <path class="conflict-land" d="${CONFLICT_MAP_BASE.path}" aria-hidden="true"></path>
        <g id="conflict-hit-targets" aria-hidden="true"></g>
        <g id="conflict-markers"></g>
      </svg>
      <div id="conflict-selection" role="status" aria-live="polite"></div>
      <div id="conflict-chooser" aria-label="Events at the selected location"></div>
    </div>
    <div class="conflict-note" id="conflict-note" role="status" hidden></div>
    <div id="list"></div>
    <div class="foot" id="foot"></div>
  </div>
`;
var RENDER5 = `
    if (!data || typeof data !== "object") return;
    var envelope = Object.prototype.hasOwnProperty.call(data, "projection") ? data.projection : data;
    var d = envelope && typeof envelope === "object"
      ? (envelope.data && typeof envelope.data === "object" ? envelope.data : envelope) : {};
    q("empty").style.display = "none";
    q("card").style.display = "block";

    var uc = d["ucdp-events"] && typeof d["ucdp-events"] === "object" ? d["ucdp-events"] : null;
    var eventValue = uc && uc.events;
    var eventState = listState(eventValue);
    var evs = eventState.items;
    var isSummary = eventValue && !Array.isArray(eventValue) && Array.isArray(eventValue.sample);
    var total = Array.isArray(eventValue) ? eventValue.length
      : isSummary && Number.isSafeInteger(eventValue.count) && eventValue.count >= evs.length ? eventValue.count : null;
    var shown = 0;
    var vtMap = {
      UCDP_VIOLENCE_TYPE_STATE_BASED: "State-based",
      UCDP_VIOLENCE_TYPE_NON_STATE: "Non-state",
      UCDP_VIOLENCE_TYPE_ONE_SIDED: "One-sided"
    };
    var host = q("list");
    host.textContent = "";
    var map = q("conflict-map");
    var markers = q("conflict-markers");
    var hitTargets = q("conflict-hit-targets");
    var chooser = q("conflict-chooser");
    var selection = q("conflict-selection");
    var geometry = ${JSON.stringify({ width: CONFLICT_MAP_BASE.width, height: CONFLICT_MAP_BASE.height, scale: CONFLICT_MAP_BASE.scale, translate: CONFLICT_MAP_BASE.translate })};
    var worldView = "0 0 " + geometry.width + " " + geometry.height;
    var locations = new Map();
    var selectable = [];
    markers.textContent = "";
    hitTargets.textContent = "";
    chooser.textContent = "";
    selection.textContent = "";
    map.setAttribute("viewBox", worldView);
    function clearSelection(keepChooser) {
      selectable.forEach(function(item) { item.row.setAttribute("aria-pressed", "false"); });
      locations.forEach(function(location) { location.marker.setAttribute("aria-pressed", "false"); });
      selection.textContent = "";
      if (!keepChooser) chooser.textContent = "";
    }
    function focusLocation(location) {
      var x = Math.max(0, Math.min(geometry.width - 180, location.x - 90));
      var y = Math.max(0, Math.min(geometry.height - 96, location.y - 48));
      map.setAttribute("viewBox", x + " " + y + " 180 96");
    }
    function selectEvent(item, keepChooser) {
      if (!host.contains(item.row)) return;
      clearSelection(keepChooser);
      item.row.setAttribute("aria-pressed", "true");
      item.location.marker.setAttribute("aria-pressed", "true");
      focusLocation(item.location);
      selection.textContent = item.label;
      reportSize();
    }
    function activate(node, action) {
      node.setAttribute("role", "button");
      node.setAttribute("tabindex", "0");
      node.setAttribute("aria-pressed", "false");
      node.addEventListener("click", action);
      node.addEventListener("keydown", function(event) {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); action(); }
      });
    }
    q("conflict-world").onclick = function() { clearSelection(); map.setAttribute("viewBox", worldView); reportSize(); };
    for (var i = 0; i < evs.length && i < 14; i++) {
      var ev = evs[i];
      if (!ev || typeof ev !== "object") continue;
      var row = el("div", "evt");
      var main = el("div", "evt-main");
      var a = collapseWs(ev.sideA);
      var b = collapseWs(ev.sideB);
      var vt = vtMap[collapseWs(ev.violenceType)] || "";
      var sides = a && b ? a + " vs " + b : (a || b || vt || "Event");
      main.appendChild(el("div", "evt-sides", sides));
      var metaParts = [];
      var ct = collapseWs(ev.country);
      if (ct) metaParts.push(ct);
      if (vt && a && b) metaParts.push(vt);
      // A zero or negative epoch is a missing date, not 1 Jan 1970.
      var dv = ev.dateStart;
      var dayText = typeof dv === "number" && dv <= 0 ? "" : utcTime(dv);
      if (dayText) metaParts.push(dayText.slice(0, dayText.indexOf(",")));
      main.appendChild(el("div", "evt-meta", metaParts.join(" \xB7 ")));
      if (typeof ev.sourceOriginal === "string" && collapseWs(ev.sourceOriginal)) {
        main.appendChild(el("div", "evt-meta", "Source: " + collapseWs(ev.sourceOriginal)));
      }
      row.appendChild(main);
      var deaths = num(ev.deathsBest);
      if (deaths != null) {
        var badge = el("span", "evt-deaths", deaths.toLocaleString() + (deaths === 1 ? " death" : " deaths"));
        var dcol = deaths >= 100 ? cssVar("--severe") : (deaths >= 10 ? cssVar("--high") : (deaths >= 1 ? cssVar("--moderate") : cssVar("--muted")));
        badge.style.color = dcol || "";
        row.appendChild(badge);
      }
      host.appendChild(row);
      shown++;
      var latitude = ev.location && ev.location.latitude;
      var longitude = ev.location && ev.location.longitude;
      if (typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90
        || typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        main.appendChild(el("div", "evt-meta", "Location unavailable"));
        continue;
      }
      var locationKey = latitude + "," + longitude;
      var location = locations.get(locationKey);
      if (!location) {
        location = { latitude: latitude, longitude: longitude, events: [],
          x: geometry.translate[0] + longitude * Math.PI / 180 * geometry.scale,
          y: geometry.translate[1] - latitude * Math.PI / 180 * geometry.scale };
        locations.set(locationKey, location);
      }
      var label = Array.from(row.querySelectorAll(".evt-sides, .evt-meta, .evt-deaths"))
        .map(function(node) { return node.textContent; }).join(" \xB7 ");
      var item = { key: i, row: row, location: location, label: label };
      location.events.push(item);
      selectable.push(item);
      row.setAttribute("data-event-key", String(i));
      activate(row, (function(current) { return function() { selectEvent(current); }; })(item));
    }
    locations.forEach(function(location) {
      var marker = document.createElementNS("http://www.w3.org/2000/svg", "g");
      location.marker = marker;
      marker.setAttribute("class", "conflict-marker");
      marker.setAttribute("transform", "translate(" + location.x + " " + location.y + ")");
      marker.setAttribute("aria-label", location.events.length === 1
        ? "Select " + location.events[0].label
        : "Choose one of " + location.events.length + " events here, including " + location.events[0].label);
      var hit = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      hit.setAttribute("r", "24"); hit.setAttribute("fill", "transparent");
      hit.setAttribute("transform", marker.getAttribute("transform")); hitTargets.appendChild(hit);
      var dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("r", location.events.length > 1 ? "8" : "5"); dot.setAttribute("class", "conflict-dot"); marker.appendChild(dot);
      if (location.events.length > 1) {
        var count = document.createElementNS("http://www.w3.org/2000/svg", "text");
        count.setAttribute("text-anchor", "middle"); count.setAttribute("dy", "3"); count.textContent = String(location.events.length); marker.appendChild(count);
      }
      function chooseLocation() {
        if (!host.contains(location.events[0].row)) return;
        if (location.events.length === 1) { selectEvent(location.events[0]); return; }
        clearSelection(); focusLocation(location);
        selection.textContent = location.events.length + " events at this location. Choose one:";
        location.events.forEach(function(item) {
          var button = el("button", "conflict-control", item.label);
          button.type = "button"; button.onclick = function() { selectEvent(item, true); }; chooser.appendChild(button);
        });
        reportSize();
      }
      activate(marker, chooseLocation);
      hit.addEventListener("click", chooseLocation);
      markers.appendChild(marker);
    });
    q("conflict-geography").hidden = shown === 0;
    map.style.display = selectable.length ? "block" : "none";
    q("conflict-world").disabled = selectable.length === 0;
    q("conflict-locations").textContent = !selectable.length ? "None of these events has a map location."
      : selectable.length === shown ? (shown === 1 ? "The event is on the map." : "All " + shown + " events are on the map.")
      : selectable.length + " of " + shown + " events have map locations.";
    if (!host.childNodes.length) {
      host.appendChild(el("div", "empty", eventState.available
        ? (isSummary && total !== 0 ? "This response left out the event list, so there is nothing to show." : "No conflict events available.")
        : "Conflict event data is temporarily unavailable."));
    }

    // The footer carries the count (only when the list is cut short) and the
    // update time; source problems go in the note above the list.
    var footParts = [];
    var notes = [];
    if (eventState.available) {
      if (isSummary && total == null) footParts.push("Showing " + shown + (shown === 1 ? " event" : " events") + "; total unknown.");
      else if (total != null && shown < total) footParts.push("Showing " + shown + " of " + total.toLocaleString("en-US") + (isSummary ? " events." : " returned events."));
    }
    if (uc) {
      var source = envelope && envelope.conflict_source && envelope.conflict_source.ucdp || {};
      var fetchedPartial = [source.candidateVersion, uc.candidateVersion].some(function(version) {
        return typeof version === "string" && version.endsWith("+partial");
      });
      var incomplete = source.candidateComplete === false || uc.candidateComplete === false || fetchedPartial;
      var confirmed = source.candidateComplete === true || uc.candidateComplete === true;
      // "Candidate" events are UCDP's preliminary monthly release.
      // The loaded release may not be the newest one, so it is not called "latest".
      if (fetchedPartial) notes.push("Recent events may be incomplete: a monthly UCDP release was only partly loaded.");
      else if (incomplete) notes.push("Recent events may be incomplete: the monthly UCDP release is not confirmed complete.");
      else if (!confirmed) notes.push("Whether recent events are complete is unknown.");
      var sourceFailures = source.annualFailedPages;
      var payloadFailures = uc.annualFailedPages;
      var sourceFailuresKnown = Number.isSafeInteger(sourceFailures) && sourceFailures >= 0;
      var payloadFailuresKnown = Number.isSafeInteger(payloadFailures) && payloadFailures >= 0;
      if (sourceFailuresKnown && payloadFailuresKnown && sourceFailures !== payloadFailures) {
        notes.push("Some older events may be missing; two load reports disagree (" + sourceFailures + " and "
          + payloadFailures + " failed pages).");
      } else {
        var failedPages = sourceFailuresKnown ? sourceFailures : payloadFailuresKnown ? payloadFailures : null;
        if (failedPages == null) notes.push("Whether older events loaded fully is unknown.");
        else if (failedPages > 0) notes.push(failedPages + (failedPages === 1 ? " page" : " pages") + " of older UCDP events failed to load, so some may be missing.");
      }
    }
    if (d.partial === true && d.truncation && typeof d.truncation === "object") {
      var returnedCount = num(d.truncation.returned_event_count);
      var originalCount = num(d.truncation.original_event_count);
      if (returnedCount != null && originalCount != null) {
        notes.push("This response includes " + returnedCount.toLocaleString("en-US") + " of "
          + originalCount.toLocaleString("en-US") + " events because of its size limit.");
      }
    }
    var noteEl = q("conflict-note");
    noteEl.textContent = notes.join(" ");
    noteEl.hidden = !notes.length;
    if (envelope && envelope.cached_at) {
      var updated = utcTime(envelope.cached_at) || collapseWs(envelope.cached_at);
      footParts.push("Updated " + updated + (envelope.stale ? " (out of date)." : "."));
    }
    q("foot").textContent = footParts.join(" ");
`;
var CONFLICT_EVENTS_APP_HTML = buildAppHtml({
  title: "Conflict Events \u2014 WorldMonitor",
  appName: "worldmonitor-conflict-events",
  styles: STYLES5,
  body: BODY5,
  renderBody: RENDER5
});

// api/mcp/ui/natural-disasters-app.ts
var STYLES6 = `
  .natural-map-wrap { margin-top: 12px; border: 1px solid var(--border); border-radius: 8px; overflow: hidden; }
  #natural-map { width: 100%; display: block; background: var(--surface); }
  .natural-land { fill: var(--muted); opacity: 0.3; }
  .natural-controls { display: flex; flex-wrap: wrap; gap: 6px; margin: 8px 0; }
  .natural-controls button, .natural-select, #natural-chooser button, #natural-selection button { font: inherit; font-size: 12px; color: var(--fg); background: var(--surface); border: 1px solid var(--border); border-radius: 5px; padding: 6px 9px; cursor: pointer; }
  button[aria-pressed="true"] { border-color: var(--high); background: var(--border); }
  button:focus-visible, .natural-marker:focus-visible { outline: 3px solid var(--high); outline-offset: 3px; }
  .natural-marker { fill: var(--high); stroke: var(--fg); stroke-width: 1; cursor: pointer; vector-effect: non-scaling-stroke; }
  .natural-controls button[data-layer="earthquakes"] { border-left: 5px solid var(--high); }
  .natural-controls button[data-layer="fires"] { border-left: 5px solid var(--severe); }
  .natural-controls button[data-layer="events"] { border-left: 5px solid var(--moderate); }
  .natural-marker.fires { fill: var(--severe); }
  .natural-marker.events { fill: var(--moderate); }
  .natural-marker[aria-pressed="true"] { stroke: var(--fg); stroke-width: 4; }
  .natural-target { fill: transparent; cursor: pointer; }
  .natural-selected { background: var(--border); }
  .natural-geometry { pointer-events: none; fill: none; stroke: var(--high); stroke-width: 2; }
  .natural-geometry.pastTrack { stroke: var(--fg); stroke-dasharray: 4 3; }
  .natural-geometry.conePolygon { fill: var(--moderate); fill-opacity: 0.22; stroke: var(--moderate); }
  #natural-selection, #natural-chooser { overflow-wrap: anywhere; }
  #natural-selection:not(:empty), #natural-chooser:not(:empty) { padding: 10px; border: 1px solid var(--border); border-radius: 6px; margin: 8px 0; }
  #natural-selection .dtime, #natural-selection a { display: block; margin: 5px 0; }
  #natural-chooser button { margin: 4px; }

  .dgroup { margin-top: 14px; }
  .dgroup:first-child { margin-top: 4px; }
  .sec-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 6px; }
  .drow { display: flex; flex-wrap: wrap; align-items: baseline; gap: 10px; padding: 6px 0; border-bottom: 1px solid var(--border); }
  .drow:last-child { border-bottom: none; }
  .mag { font-variant-numeric: tabular-nums; font-weight: 700; font-size: 13px; min-width: 52px; }
  .dplace { flex: 1 1 10rem; font-size: 13px; color: var(--fg); min-width: 0; overflow-wrap: anywhere; }
  .dcounts, .dwarning { font-size: 12px; color: var(--muted); margin: 6px 0; }
  .dwarning { color: var(--high); }
  .dtime { font-size: 11px; color: var(--muted); overflow-wrap: anywhere; }
  .drow .natural-select { order: 2; margin-left: auto; }
  .drow .dmeta { order: 3; flex-basis: 100%; margin-top: -6px; }
  .drow .mag ~ .dmeta { padding-left: 62px; }
  .dprovider { font-size: 12px; line-height: 1.6; margin: 8px 0; padding: 8px; border: 1px solid var(--border); border-radius: 6px; overflow-wrap: anywhere; }
  .dprovider-title { font-weight: 600; }
  .dsources { font-size: 12px; color: var(--muted); margin: 8px 0; }
  .dsources summary { cursor: pointer; }
  .dsources .dprovider { color: var(--fg); }
`;
var BODY6 = `
  <div class="head">
    <div class="title" id="natural-heading" role="heading" aria-level="1" tabindex="-1">Natural Disasters</div>
    <div class="badge">WorldMonitor Hazards</div>
  </div>
  <div class="empty" id="empty">Waiting for hazard data\u2026</div>
  <div id="card" style="display:none">
    <div class="natural-controls" id="natural-layers" aria-label="Hazard map layers"></div>
    <div class="natural-controls"><button type="button" id="natural-world">World view</button></div>
    <div class="dcounts" id="natural-map-status" role="status"></div>
    <div class="natural-map-wrap">
      <svg id="natural-map" viewBox="0 0 ${CONFLICT_MAP_BASE.width} ${CONFLICT_MAP_BASE.height}" role="group" aria-label="Reported locations of displayed hazard events">
        <defs><clipPath id="natural-map-clip"><rect width="${CONFLICT_MAP_BASE.width}" height="${CONFLICT_MAP_BASE.height}"></rect></clipPath></defs>
        <path class="natural-land" d="${CONFLICT_MAP_BASE.path}" aria-hidden="true"></path>
        <g clip-path="url(#natural-map-clip)"><g id="natural-overlays" aria-hidden="true" pointer-events="none"></g><g id="natural-targets"></g><g id="natural-markers"></g></g>
      </svg>
    </div>
    <div id="natural-chooser"></div>
    <div id="natural-selection" aria-live="polite"></div>
    <div id="groups"></div>
    <div class="foot" id="foot"></div>
  </div>
`;
var RENDER6 = `
    if (!data || typeof data !== "object") return;
    var envelope = data.projection && typeof data.projection === "object" && !Array.isArray(data.projection)
      ? data.projection : data;
    var datasets = envelope.data && typeof envelope.data === "object" ? envelope.data : envelope;
    q("empty").style.display = "none";
    q("card").style.display = "block";
    var host = q("groups");
    var focused = document.activeElement;
    var restoreOwnedFocus = [host, q("natural-layers"), q("natural-markers"), q("natural-chooser"), q("natural-selection")].some(function(node) { return node && node.contains(focused); });
    host.textContent = "";
    var selectedCount = 0;
    var emptyCount = 0;
    var coverageLimited = false;

    var detailCoverage = envelope.transportCoverage;
    if (detailCoverage && detailCoverage.count_scope === "post_filter_snapshot" && Array.isArray(detailCoverage.details)) {
      var detailLabels = { conePolygon: "Cone points", forecastTrack: "Forecast track points", pastTrack: "Past track points", events: "Regional events", warnings: "Regional warnings" };
      var displayedCounts = {};
      detailCoverage.details.forEach(function (detail) {
        if (!detail || typeof detail !== "object" || !Object.prototype.hasOwnProperty.call(detailLabels, detail.field)
          || ["geometry_simplified", "output_budget"].indexOf(detail.omission_reason) < 0) return;
        if (typeof detail.original_count !== "number" || !Number.isSafeInteger(detail.original_count) || detail.original_count < 0
          || typeof detail.returned_count !== "number" || !Number.isSafeInteger(detail.returned_count)
          || detail.returned_count < 0 || detail.returned_count > detail.original_count) return;
        var count = displayedCounts[detail.field] || { original: 0, returned: 0 };
        count.original += detail.original_count; count.returned += detail.returned_count;
        displayedCounts[detail.field] = count;
      });
      if (Object.keys(displayedCounts).length) {
        warning(host, "Some detail was simplified or omitted for display. Full original detail is not loaded.");
        Object.keys(displayedCounts).forEach(function (field) {
          var count = displayedCounts[field];
          host.appendChild(el("div", "dcounts", detailLabels[field] + ": " + count.returned + " returned from " + count.original + " original items."));
        });
      }
    }

    var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    function pad(value) { return value < 10 ? "0" + value : String(value); }
    function utc(date) {
      return date.getUTCDate() + " " + MONTHS[date.getUTCMonth()] + " " + date.getUTCFullYear()
        + ", " + pad(date.getUTCHours()) + ":" + pad(date.getUTCMinutes()) + " UTC";
    }
    function eventTime(value, label, missing) {
      var date = typeof value === "number" || typeof value === "string" && value.trim()
        ? new Date(value) : null;
      return date && Number.isFinite(date.getTime()) ? label + utc(date) : missing;
    }
    function group(key, label, field) {
      if (!Object.prototype.hasOwnProperty.call(datasets, key)) return null;
      selectedCount++;
      var bucket = datasets[key] && typeof datasets[key] === "object" ? datasets[key] : null;
      var list = bucket && bucket[field];
      var state = listState(list);
      var section = el("div", "dgroup");
      section.appendChild(el("div", "sec-label", label));
      host.appendChild(section);
      var knownEmpty = Array.isArray(list) ? list.length === 0
        : state.available && list.count === 0 && state.items.length === 0;
      if (knownEmpty) emptyCount++;
      var missingLabel = key === "earthquakes" ? "Earthquake" : key === "fires" ? "Wildfire" : label;
      if (!state.available) section.appendChild(el("div", "empty", missingLabel + " data is temporarily unavailable."));
      return { section: section, bucket: bucket, list: list, items: state.items, available: state.available, knownEmpty: knownEmpty };
    }
    function counts(view, shown) {
      if (!view.available) return;
      var message;
      if (Array.isArray(view.list)) {
        if (shown >= view.list.length) return;
        message = "Showing " + shown + " of " + view.list.length + " returned events.";
      } else {
        var total = view.list.count;
        var known = typeof total === "number" && Number.isInteger(total) && total >= view.items.length;
        if (known && total === shown) return;
        message = known ? "Showing " + shown + " of " + total + " events." : "Showing " + shown + " events; total unknown.";
      }
      view.section.appendChild(el("div", "dcounts", message));
    }
    function warning(section, message) {
      coverageLimited = true;
      section.appendChild(el("div", "dwarning", message));
    }
    function providerState(view, field, label) {
      var state = view.bucket && view.bucket[field];
      if (typeof state === "string" && state !== "ok") warning(view.section, label + " coverage is " + collapseWs(state) + ".");
    }
    function sourceCounter(value) {
      return typeof value === "number" && Number.isFinite(value) && Number.isInteger(value) && value >= 0 ? value.toLocaleString("en-US") : null;
    }
    function sourceState(value) {
      if (typeof value !== "string" || !value.trim()) return "status unknown";
      return value === "ok" ? "OK" : collapseWs(value);
    }
    function sourcesBlock(section) {
      var details = el("details", "dsources");
      details.appendChild(el("summary", "", "Sources"));
      details.ontoggle = function () { reportSize(); };
      section.appendChild(details);
      return details;
    }
    function detailBlock(parent, title, lines) {
      var block = el("div", "dprovider");
      block.appendChild(el("div", "dprovider-title", title));
      lines.forEach(function (line) { block.appendChild(el("div", "", line)); });
      parent.appendChild(block);
    }
    function wildfireLine(bucket, prefix, noun, extra) {
      var parts = [sourceState(bucket["_" + prefix + "State"])];
      var count = sourceCounter(bucket["_" + prefix + "Count"]);
      parts.push(count === null ? noun + " count unknown" : count + " " + noun);
      if (extra) parts.push.apply(parts, extra);
      var error = bucket["_" + prefix + "ErrorCode"];
      if (typeof error === "string" && error.trim()) parts.push("error: " + collapseWs(error));
      return parts.join(" \xB7 ");
    }
    function wildfireDetails(view) {
      var bucket = view.bucket || {};
      var sources = sourcesBlock(view.section);
      if (!Object.keys(bucket).some(function (key) { return /^_(firms|cwfis|bc)/.test(key); })) {
        sources.appendChild(el("div", "", "No source details supplied."));
        return;
      }
      var firmsExtra = [];
      if (bucket._firmsPartial === true) firmsExtra.push("partial");
      else if (bucket._firmsPartial !== undefined && typeof bucket._firmsPartial !== "boolean") firmsExtra.push("completeness unknown");
      if (sourceCounter(bucket._firmsFailedCalls) !== null && bucket._firmsFailedCalls > 0) firmsExtra.push(sourceCounter(bucket._firmsFailedCalls) + " failed requests");
      var active = sourceCounter(bucket._cwfisActiveCount), prescribed = sourceCounter(bucket._cwfisPrescribedCount);
      var cwfisExtra = active !== null && prescribed !== null ? [active + " active, " + prescribed + " prescribed"] : [];
      detailBlock(sources, "NASA FIRMS", [wildfireLine(bucket, "firms", "detections", firmsExtra)]);
      detailBlock(sources, "Canadian CWFIS", [wildfireLine(bucket, "cwfis", "detections", cwfisExtra)]);
      detailBlock(sources, "British Columbia", [wildfireLine(bucket, "bc", "records")]);
    }
    function decisionList(coverage) {
      var supplied = coverage && typeof coverage === "object" && !Array.isArray(coverage) ? coverage.sourceDecisions : null;
      var sampled = Boolean(supplied) && typeof supplied === "object" && !Array.isArray(supplied) && Array.isArray(supplied.sample);
      return { decisions: Array.isArray(supplied) ? supplied : sampled ? supplied.sample : null, sampled: sampled, supplied: supplied };
    }
    // A source the seeder never requested (requestCount 0) is switched off by
    // design and is not a coverage failure; only an attempted source that was
    // not accepted is.
    function decisionFailed(decision) {
      return Boolean(decision) && typeof decision === "object" && decision.status !== "accepted" && decision.requestCount !== 0;
    }
    function decisionLine(decision) {
      var item = decision && typeof decision === "object" && !Array.isArray(decision) ? decision : {};
      var name = typeof item.source === "string" && item.source.trim() ? collapseWs(item.source) : "Unnamed source";
      if (item.status === "accepted") return name + " \xB7 OK";
      if (item.requestCount === 0) return name + " \xB7 not connected";
      var reason = typeof item.reason === "string" && item.reason.trim() ? " (" + collapseWs(item.reason) + ")" : "";
      return name + " \xB7 failed" + reason;
    }
    function regionalDetails(view, regions) {
      var sources = sourcesBlock(view.section);
      var seen = {}, lines = [], checked = null, known = false;
      regions.forEach(function (region) {
        var coverage = view.bucket[region.key];
        var list = decisionList(coverage);
        if (!list.decisions) {
          if (coverage && typeof coverage === "object") lines.push(region.label + ": source details unavailable.");
          return;
        }
        known = true;
        if (list.sampled) {
          var total = sourceCounter(list.supplied.count);
          var knownTotal = total !== null && list.supplied.count >= list.decisions.length;
          lines.push(region.label + ": showing " + list.decisions.length + (knownTotal ? " of " + total + " sources." : " sources; total unknown."));
        }
        list.decisions.forEach(function (decision) {
          var line = decisionLine(decision);
          if (seen[line]) return;
          seen[line] = true; lines.push(line);
        });
        if (checked === null) checked = eventTime(coverage.evaluatedAt, "Checked ", null);
      });
      if (!lines.length) { sources.appendChild(el("div", "", "No source details supplied.")); return; }
      if (known) lines.push(checked || "Check time unknown");
      detailBlock(sources, "Cyclone and warning sources", lines);
    }

    var geo = ${JSON.stringify({ width: CONFLICT_MAP_BASE.width, height: CONFLICT_MAP_BASE.height, scale: CONFLICT_MAP_BASE.scale, translate: CONFLICT_MAP_BASE.translate })};
    var map = q("natural-map"), markers = q("natural-markers"), targets = q("natural-targets");
    var overlays = q("natural-overlays"), chooser = q("natural-chooser"), selection = q("natural-selection");
    var toolbar = q("natural-layers"), mapStatus = q("natural-map-status");
    var world = "0 0 " + geo.width + " " + geo.height;
    var items = [], locations = new Map(), selectedKey = null;
    var layers = { earthquakes: { label: "Earthquakes" }, fires: { label: "Wildfires" }, events: { label: "Other natural events" } };
    [markers, targets, overlays, chooser, selection, toolbar].forEach(function(node) { node.textContent = ""; });
    map.setAttribute("viewBox", world);
    chooser.onkeydown = null;
    function layoutChanged() { requestAnimationFrame(function() { reportSize(); }); }
    function svg(tag, attributes) {
      var node = document.createElementNS("http://www.w3.org/2000/svg", tag);
      Object.keys(attributes).forEach(function(key) { node.setAttribute(key, String(attributes[key])); });
      return node;
    }
    function projected(point) {
      return [geo.translate[0] + point[0] * Math.PI / 180 * geo.scale,
        geo.translate[1] - point[1] * Math.PI / 180 * geo.scale];
    }
    function point(lon, lat) {
      return typeof lon === "number" && Number.isFinite(lon) && lon >= -180 && lon <= 180
        && typeof lat === "number" && Number.isFinite(lat) && lat >= -90 && lat <= 90 ? [lon, lat] : null;
    }
    function objectPoint(value) {
      return value && typeof value === "object" && !Array.isArray(value)
        && Object.prototype.hasOwnProperty.call(value, "lon") && Object.prototype.hasOwnProperty.call(value, "lat")
        ? point(value.lon, value.lat) : null;
    }
    function delta(fromLongitude, toLongitude) {
      var longitudeDelta = toLongitude - fromLongitude;
      if (longitudeDelta > 180) longitudeDelta -= 360;
      if (longitudeDelta < -180) longitudeDelta += 360;
      return Math.abs(longitudeDelta) === 180 ? null : longitudeDelta;
    }
    function path(points, closed) {
      return points.map(function(vertex, vertexIndex) {
        var xy = projected(vertex);
        return (vertexIndex ? "L" : "M") + Number(xy[0].toFixed(3)) + "," + Number(xy[1].toFixed(3));
      }).join("") + (closed ? "Z" : "");
    }
    function rejected(reason) { return { paths: [], status: "Returned geometry retained; not drawn: " + reason }; }
    function localLimit(reason) { return rejected("local display limit or ambiguous geometry (" + reason + ")"); }
    function track(value) {
      if (value.length > 512) return localLimit("more than 512 track entries");
      var edges = [], previous = null, longitude = 0, low = 0, high = 0, invalid = false;
      for (var entryIndex = 0; entryIndex < value.length; entryIndex++) {
        var current = objectPoint(value[entryIndex]);
        if (!current) { previous = null; invalid = true; continue; }
        if (!previous) { longitude = current[0]; low = longitude; high = longitude; }
        else {
          var longitudeDelta = delta(previous[0], current[0]);
          if (longitudeDelta === null) return localLimit("ambiguous 180-degree track edge");
          longitude += longitudeDelta; low = Math.min(low, longitude); high = Math.max(high, longitude);
          if (high - low > 180) return localLimit("track span or repeated winding exceeds 180 degrees");
          if (longitudeDelta !== 0 || current[1] !== previous[1]) edges.push([previous, [previous[0] + longitudeDelta, current[1]]]);
        }
        previous = current;
      }
      var paths = [], vertices = 0;
      edges.forEach(function(edge) {
        [-360, 0, 360].forEach(function(shift) {
          var shiftedStart = [edge[0][0] + shift, edge[0][1]], shiftedEnd = [edge[1][0] + shift, edge[1][1]];
          var dx = shiftedEnd[0] - shiftedStart[0], start = 0, end = 1;
          if (dx === 0) { if (shiftedStart[0] < -180 || shiftedStart[0] > 180) return; }
          else {
            var firstBoundaryFraction = (-180 - shiftedStart[0]) / dx, secondBoundaryFraction = (180 - shiftedStart[0]) / dx;
            start = Math.max(0, Math.min(firstBoundaryFraction, secondBoundaryFraction)); end = Math.min(1, Math.max(firstBoundaryFraction, secondBoundaryFraction));
          }
          if (end <= start) return;
          var pair = [start, end].map(function(fraction) { return [Math.max(-180, Math.min(180, shiftedStart[0] + dx * fraction)), shiftedStart[1] + (shiftedEnd[1] - shiftedStart[1]) * fraction]; });
          paths.push(path(pair, false)); vertices += 2;
        });
      });
      if (vertices > 2048) return localLimit("track output vertices");
      return { paths: paths, status: invalid ? paths.length ? "Supplied geometry invalid/unavailable; valid separated segments are partial." : "Supplied geometry invalid/unavailable; no valid track segments can be drawn." : "" };
    }
    function clipRing(points, boundary, keepGreater) {
      var result = [];
      for (var vertexIndex = 0; vertexIndex < points.length; vertexIndex++) {
        var previousVertex = points[(vertexIndex + points.length - 1) % points.length], currentVertex = points[vertexIndex];
        var previousInside = keepGreater ? previousVertex[0] >= boundary : previousVertex[0] <= boundary;
        var currentInside = keepGreater ? currentVertex[0] >= boundary : currentVertex[0] <= boundary;
        if (previousInside !== currentInside) {
          var intersectionFraction = (boundary - previousVertex[0]) / (currentVertex[0] - previousVertex[0]);
          result.push([boundary, previousVertex[1] + intersectionFraction * (currentVertex[1] - previousVertex[1])]);
        }
        if (currentInside) result.push(currentVertex);
      }
      return result;
    }
    function cones(value) {
      if (value.length > 16) return localLimit("more than 16 cone rings");
      var total = 0, rings = [];
      for (var ringIndex = 0; ringIndex < value.length; ringIndex++) {
        var ring = value[ringIndex], tuples = Array.isArray(ring);
        var values = tuples ? ring : ring && typeof ring === "object" ? ring.points : null;
        if (Array.isArray(values)) {
          total += values.length;
          if (total > 512) return localLimit("more than 512 cone vertices");
        }
        rings.push({ values: values, tuples: tuples });
      }
      var paths = [], vertices = 0, invalid = false;
      for (var ringIndex = 0; ringIndex < rings.length; ringIndex++) {
        var input = rings[ringIndex], points = [], bad = false;
        if (!Array.isArray(input.values)) { invalid = true; continue; }
        for (var vertexIndex = 0; vertexIndex < input.values.length; vertexIndex++) {
          var suppliedVertex = input.values[vertexIndex];
          var vertex = input.tuples ? Array.isArray(suppliedVertex) && suppliedVertex.length === 2 ? point(suppliedVertex[0], suppliedVertex[1]) : null : objectPoint(suppliedVertex);
          if (!vertex) { bad = true; break; }
          if (!points.length || vertex[0] !== points[points.length - 1][0] || vertex[1] !== points[points.length - 1][1]) points.push(vertex);
        }
        while (points.length > 1 && points[0][0] === points[points.length - 1][0] && points[0][1] === points[points.length - 1][1]) points.pop();
        var distinct = new Set(points.map(function(vertex) { return vertex[0] + "," + vertex[1]; }));
        if (bad || distinct.size < 3 || distinct.size !== points.length) { invalid = true; continue; }
        var unwrapped = [points[0]], longitude = points[0][0], low = longitude, high = longitude;
        for (var vertexIndex = 1; vertexIndex <= points.length; vertexIndex++) {
          var longitudeDelta = delta(points[vertexIndex - 1][0], points[vertexIndex % points.length][0]);
          if (longitudeDelta === null) return localLimit("ambiguous 180-degree cone edge");
          longitude += longitudeDelta; low = Math.min(low, longitude); high = Math.max(high, longitude);
          if (high - low > 180) return localLimit("cone span or repeated winding exceeds 180 degrees");
          if (vertexIndex < points.length) unwrapped.push([longitude, points[vertexIndex][1]]);
        }
        if (Math.abs(longitude - points[0][0]) > 1e-8) return localLimit("nonzero cone winding");
        [-360, 0, 360].forEach(function(shift) {
          var copy = unwrapped.map(function(vertex) { return [vertex[0] + shift, vertex[1]]; });
          copy = clipRing(clipRing(copy, -180, true), 180, false);
          if (copy.length < 3 || new Set(copy.map(function(vertex) { return vertex[0] + "," + vertex[1]; })).size < 3) return;
          paths.push(path(copy, true)); vertices += copy.length;
        });
      }
      if (vertices > 8192) return localLimit("cone output vertices");
      return { paths: paths, status: invalid ? paths.length ? "Supplied geometry invalid/unavailable; valid rings are partial." : "Supplied geometry invalid/unavailable; no valid cone rings can be drawn." : "" };
    }
    function geometryFor(item) {
      var fields = ["forecastTrack", "pastTrack", "conePolygon"], used = 0;
      return fields.map(function(field) {
        var value = item.raw[field], result;
        var omitted = detailCoverage && detailCoverage.count_scope === "post_filter_snapshot" && Array.isArray(detailCoverage.details)
          && detailCoverage.details.some(function(detail) {
            return detail && detail.dataset === "events" && detail.collection === "events.events"
              && Number.isSafeInteger(detail.event_index) && detail.event_index === item.index
              && detail.field === field && detail.state === "available" && detail.omission_reason === "output_budget"
              && Number.isSafeInteger(detail.original_count) && detail.original_count > 0
              && detail.returned_count === 0 && detail.omitted_count === detail.original_count && detail.geometry_simplified === false;
          });
        if (value == null) result = { paths: [], status: omitted ? "Geometry not loaded: omitted by transport." : "Geometry not supplied." };
        else if (!Array.isArray(value)) result = rejected("supplied geometry invalid/unavailable");
        else if (!value.length) result = { paths: [], status: omitted ? "Geometry not loaded: omitted by transport." : "No geometry points supplied." };
        else result = field === "conePolygon" ? cones(value) : track(value);
        var chars = result.paths.reduce(function(count, pathData) { return count + pathData.length; }, 0);
        if (used + chars > 400000) result = localLimit("400000 path character budget");
        else used += chars;
        result.field = field;
        return result;
      });
    }
    function registerRow(dataset, index, raw, row, label) {
      var location = dataset === "events" ? raw : raw.location;
      var reported = dataset === "events" ? objectPoint(location) : location && typeof location === "object"
        && Object.prototype.hasOwnProperty.call(location, "longitude") && Object.prototype.hasOwnProperty.call(location, "latitude")
        ? point(location.longitude, location.latitude) : null;
      var item = { key: dataset + ":" + index, dataset: dataset, index: index, raw: raw, row: row, label: label, point: reported };
      items.push(item);
      if (!reported) { row.appendChild(el("span", "dtime", "No valid coordinates supplied")); return; }
      var button = el("button", "natural-select", "Select location");
      button.type = "button"; button.setAttribute("data-select", item.key); button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Select location: " + label);
      button.onclick = function() {
        if (!layers[dataset].visible) { layers[dataset].visible = true; syncLayers(); }
        selectItem(item); button.focus();
      };
      row.appendChild(button); item.button = button;
      var key = reported[1] + "," + reported[0], entry = locations.get(key);
      if (!entry) { entry = { key: key, point: reported, items: [] }; locations.set(key, entry); }
      entry.items.push(item); item.location = entry;
    }
    function clearSelection() {
      selectedKey = null; chooser.textContent = ""; chooser.onkeydown = null; selection.textContent = ""; overlays.textContent = "";
      map.setAttribute("viewBox", world);
      items.forEach(function(item) { if (item.button) item.button.setAttribute("aria-pressed", "false"); item.row.classList.remove("natural-selected"); });
      locations.forEach(function(entry) { if (entry.marker) { entry.marker.setAttribute("aria-pressed", "false"); entry.marker.setAttribute("aria-label", entry.label); } });
    }
    function selectItem(item) {
      clearSelection(); selectedKey = item.key;
      item.button.setAttribute("aria-pressed", "true"); item.row.classList.add("natural-selected");
      item.location.marker.setAttribute("aria-pressed", "true");
      item.location.marker.setAttribute("aria-label", item.location.label + "; selected " + itemLabel(item));
      selection.appendChild(el("div", "dprovider-title", item.label + " \xB7 Reported coordinates: " + item.point[1] + ", " + item.point[0]));
      Array.from(item.row.children).forEach(function(child) { if (child.classList.contains("dtime") || child.classList.contains("mag") || child.tagName === "A") selection.appendChild(child.cloneNode(true)); });
      var geometry = item.dataset === "events" ? geometryFor(item) : [];
      if (!geometry.some(function(overlay) { return overlay.paths.length; })) {
        var xy = projected(item.point);
        map.setAttribute("viewBox", Math.max(0, Math.min(geo.width - 180, xy[0] - 90)) + " " + Math.max(0, Math.min(geo.height - 96, xy[1] - 48)) + " 180 96");
      }
      geometry.forEach(function(overlay) {
        var group = svg("g", { "data-geometry": overlay.field, "aria-hidden": "true", "pointer-events": "none", "class": "natural-geometry " + overlay.field });
        overlay.paths.forEach(function(pathData) { group.appendChild(svg("path", { "d": pathData })); }); overlays.appendChild(group);
        var label = { forecastTrack: "Forecast track", pastTrack: "Past track", conePolygon: "Cone" }[overlay.field];
        if (overlay.status) selection.appendChild(el("div", "dtime", label + ": " + overlay.status));
        if (overlay.paths.length) {
          var toggle = el("button", "", label); toggle.type = "button";
          toggle.setAttribute("data-overlay", overlay.field); toggle.setAttribute("aria-pressed", "true");
          toggle.onclick = function() {
            var visible = toggle.getAttribute("aria-pressed") !== "true";
            toggle.setAttribute("aria-pressed", String(visible)); group.style.display = visible ? "" : "none"; layoutChanged();
          };
          selection.appendChild(toggle);
        }
      });
      layoutChanged();
    }
    function itemLabel(item) { return layers[item.dataset].label + " \xB7 " + item.label; }
    function visibleItems(entry) { return entry.items.filter(function(item) { return layers[item.dataset].visible; }); }
    function syncLayers() {
      Object.keys(layers).forEach(function(key) { layers[key].button.setAttribute("aria-pressed", String(layers[key].visible)); });
      locations.forEach(function(entry) {
        var members = visibleItems(entry), visible = members.length > 0;
        entry.marker.style.display = visible ? "" : "none"; entry.target.style.display = visible ? "" : "none";
        entry.label = members.length === 1 ? "Select " + itemLabel(members[0]) : "Choose " + members.length + " events at " + entry.key + ": " + members.map(itemLabel).join("; ");
        var chosen = members.find(function(item) { return item.key === selectedKey; });
        entry.marker.setAttribute("aria-label", entry.label + (chosen ? "; selected " + itemLabel(chosen) : ""));
        if (members.length) entry.marker.setAttribute("class", "natural-marker " + members[0].dataset);
      });
      var shownItems = items.filter(function(item) { return layers[item.dataset].visible; });
      var valid = shownItems.filter(function(item) { return item.point; }).length;
      mapStatus.textContent = Object.keys(layers).some(function(key) { return layers[key].visible; })
        ? (valid === shownItems.length ? valid + (valid === 1 ? " event" : " events") + " on the map." : valid + " of " + shownItems.length + " events in the shown layers have map locations.")
        : Object.keys(layers).some(function(key) { return !layers[key].button.disabled; })
          ? "Layers hidden. Source rows and coverage remain below." : "Map locations unavailable for supplied datasets. See source coverage below.";
    }
    function finishMap(views) {
      Object.keys(layers).forEach(function(key) {
        var layer = layers[key], view = views[key], available = view && view.available;
        layer.visible = Boolean(available);
        var label = !view ? "Not included" : !available ? "Unavailable" : view.knownEmpty ? "No events in this supplied snapshot" : !view.items.length ? "No sample rows loaded" : "";
        var button = el("button", "", layer.label + (label ? " \xB7 " + label : ""));
        button.type = "button"; button.setAttribute("data-layer", key); button.disabled = !available;
        layer.button = button; toolbar.appendChild(button);
        button.onclick = function() {
          layer.visible = !layer.visible;
          if (!layer.visible && items.some(function(item) { return item.key === selectedKey && item.dataset === key; })) {
            button.focus(); clearSelection();
          } else if (chooser.childNodes.length) {
            chooser.textContent = ""; chooser.onkeydown = null; button.focus();
          }
          syncLayers(); layoutChanged();
        };
      });
      locations.forEach(function(entry) {
        var xy = projected(entry.point);
        entry.target = svg("circle", { cx: xy[0], cy: xy[1], r: 10, "class": "natural-target", "aria-hidden": "true" });
        var marker = svg("circle", { cx: xy[0], cy: xy[1], r: 4, role: "button", tabindex: 0,
          "data-marker": entry.key, "aria-pressed": "false", "class": "natural-marker " + entry.items[0].dataset });
        entry.marker = marker; targets.appendChild(entry.target); markers.appendChild(marker);
        marker.onfocus = function() {
          var bounds = map.getAttribute("viewBox").split(" ").map(Number);
          if (xy[0] - 10 < bounds[0] || xy[0] + 10 > bounds[0] + bounds[2]
            || xy[1] - 10 < bounds[1] || xy[1] + 10 > bounds[1] + bounds[3]) {
            map.setAttribute("viewBox", world); layoutChanged();
          }
        };
        function choose() {
          var members = visibleItems(entry);
          if (members.length === 1) { selectItem(members[0]); marker.focus(); return; }
          chooser.textContent = "";
          chooser.appendChild(el("div", "", "Choose an event at " + entry.key));
          members.forEach(function(item) {
            var button = el("button", "", itemLabel(item)); button.type = "button"; button.setAttribute("data-choice", item.key);
            button.onclick = function() { selectItem(item); marker.focus(); }; chooser.appendChild(button);
          });
          var dismiss = el("button", "", "Dismiss choices"); dismiss.type = "button";
          function closeChooser() { chooser.textContent = ""; chooser.onkeydown = null; marker.focus(); layoutChanged(); }
          dismiss.onclick = closeChooser; chooser.appendChild(dismiss);
          chooser.onkeydown = function(event) { if (event.key === "Escape") { event.preventDefault(); closeChooser(); } };
          chooser.querySelector("button").focus(); layoutChanged();
        }
        marker.onclick = choose; entry.target.onclick = choose;
        marker.onkeydown = function(event) { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); } };
      });
      q("natural-world").onclick = function() { clearSelection(); q("natural-world").focus(); layoutChanged(); };
      syncLayers();
      if (restoreOwnedFocus) q("natural-heading").focus();
      layoutChanged();
    }

    var quakeView = group("earthquakes", "Earthquakes", "earthquakes");
    if (quakeView) {
      var quakeShown = 0;
      for (var quakeIndex = 0; quakeIndex < quakeView.items.length && quakeIndex < 8; quakeIndex++) {
        var quake = quakeView.items[quakeIndex];
        if (!quake || typeof quake !== "object") continue;
        var quakeRow = el("div", "drow");
        var magnitude = num(quake.magnitude);
        var magnitudeLabel = el("span", "mag", magnitude == null ? "\u2014" : "M" + magnitude.toFixed(1));
        magnitudeLabel.style.color = magnitude == null ? cssVar("--muted") : cssVar(magnitude >= 6 ? "--severe" : magnitude >= 5 ? "--high" : magnitude >= 4 ? "--moderate" : "--low");
        quakeRow.appendChild(magnitudeLabel);
        var source = httpUrl(quake.sourceUrl);
        var place = el(source ? "a" : "span", "dplace", collapseWs(quake.place) || "Unknown location");
        if (source) { place.href = source; place.target = "_blank"; place.rel = "noopener noreferrer"; }
        quakeRow.appendChild(place);
        quakeRow.appendChild(el("span", "dtime dmeta", eventTime(quake.occurredAt, "", "Event time unavailable")));
        registerRow("earthquakes", quakeIndex, quake, quakeRow, place.textContent);
        quakeView.section.appendChild(quakeRow);
        quakeShown++;
      }
      if (quakeView.bucket && quakeView.bucket.upstreamUnavailable === true) warning(quakeView.section, "Earthquake source coverage is unavailable.");
      counts(quakeView, quakeShown);
    }

    var fireView = group("fires", "Active Wildfires", "fireDetections");
    if (fireView) {
      var fireShown = 0;
      var confidenceLabels = { FIRE_CONFIDENCE_HIGH: "high", FIRE_CONFIDENCE_NOMINAL: "nominal", FIRE_CONFIDENCE_LOW: "low" };
      for (var fireIndex = 0; fireIndex < fireView.items.length && fireIndex < 6; fireIndex++) {
        var fire = fireView.items[fireIndex];
        if (!fire || typeof fire !== "object") continue;
        var fireRow = el("div", "drow");
        var fireMark = el("span", "mag", "Fire");
        fireMark.style.color = cssVar("--severe");
        fireRow.appendChild(fireMark);
        var location = fire.location && typeof fire.location === "object" ? fire.location : null;
        var latitude = location ? num(location.latitude) : null;
        var longitude = location ? num(location.longitude) : null;
        var firePlace = collapseWs(fire.region) || (latitude != null && longitude != null ? latitude.toFixed(2) + ", " + longitude.toFixed(2) : "detection");
        fireRow.appendChild(el("span", "dplace", firePlace));
        var brightness = num(fire.brightness);
        var fireDetails = eventTime(fire.detectedAt === 0 ? null : fire.detectedAt, "Detected ", "Detection time unavailable");
        var confidence = confidenceLabels[collapseWs(fire.confidence)];
        if (confidence) fireDetails += " \xB7 " + confidence + " confidence";
        if (brightness != null && brightness > 0) fireDetails += " \xB7 " + Math.round(brightness) + " K";
        fireRow.appendChild(el("span", "dtime dmeta", fireDetails));
        registerRow("fires", fireIndex, fire, fireRow, firePlace);
        fireView.section.appendChild(fireRow);
        fireShown++;
      }
      if (fireView.bucket) {
        if (fireView.bucket._firmsPartial === true) warning(fireView.section, "NASA FIRMS coverage is partial.");
        providerState(fireView, "_firmsState", "NASA FIRMS");
        providerState(fireView, "_cwfisState", "Canadian wildfire");
        providerState(fireView, "_bcState", "British Columbia wildfire");
        if (fireView.bucket.upstreamUnavailable === true) warning(fireView.section, "Wildfire source coverage is unavailable.");
        if (fireView.bucket._bcErrorCode) warning(fireView.section, "British Columbia wildfire source reports an error.");
      }
      wildfireDetails(fireView);
      counts(fireView, fireShown);
    }

    var otherView = group("events", "Other natural events", "events");
    if (otherView) {
      var otherShown = 0;
      for (var otherIndex = 0; otherIndex < otherView.items.length && otherIndex < 8; otherIndex++) {
        var event = otherView.items[otherIndex];
        if (!event || typeof event !== "object") continue;
        var eventRow = el("div", "drow");
        var eventSource = httpUrl(event.sourceUrl);
        var eventPlace = el(eventSource ? "a" : "span", "dplace", collapseWs(event.title) || "Natural event");
        if (eventSource) { eventPlace.href = eventSource; eventPlace.target = "_blank"; eventPlace.rel = "noopener noreferrer"; }
        eventRow.appendChild(eventPlace);
        var eventDetails = [collapseWs(event.categoryTitle) || collapseWs(event.category) || collapseWs(event.type), collapseWs(event.country)].filter(Boolean);
        var ownDate = Object.prototype.hasOwnProperty.call(event, "date") && typeof event.date === "number" && Number.isSafeInteger(event.date) && Number.isFinite(new Date(event.date).getTime());
        var reportedDate = ownDate ? utc(new Date(event.date)) : "Event time unavailable";
        var eventMagnitude = typeof event.magnitude === "number" && Number.isFinite(event.magnitude) ? event.magnitude : null;
        var eventUnit = typeof event.magnitudeUnit === "string" ? collapseWs(event.magnitudeUnit) : "";
        if (eventMagnitude != null) eventDetails.push(eventUnit ? eventMagnitude + " " + eventUnit : eventMagnitude + " (no unit given)");
        if (typeof event.closed === "boolean") eventDetails.push(event.closed ? "Closed" : "Active");
        if (eventDetails.length) eventRow.appendChild(el("span", "dtime dmeta", eventDetails.join(" \xB7 ")));
        eventRow.appendChild(el("span", "dtime dmeta", reportedDate));
        if (typeof event.status === "string" && event.status.trim()) eventRow.appendChild(el("span", "dtime dmeta", "Status: " + collapseWs(event.status)));
        registerRow("events", otherIndex, event, eventRow, eventPlace.textContent);
        otherView.section.appendChild(eventRow);
        otherShown++;
      }
      if (otherView.bucket) {
        if (otherView.bucket.upstreamUnavailable === true) warning(otherView.section, "Other natural-event source coverage is unavailable.");
        var regionalSources = [{ key: "westernPacific", label: "Western Pacific" }, { key: "hkoWarnings", label: "Hong Kong warnings" }];
        regionalSources.forEach(function (region) {
          var coverage = otherView.bucket[region.key];
          if (coverage && typeof coverage === "object") {
            var failedSources = (decisionList(coverage).decisions || []).filter(decisionFailed);
            var failedText = failedSources.length ? ": " + failedSources.map(decisionLine).join("; ") : "";
            if (coverage.dataAvailable === false) warning(otherView.section, region.label + " coverage is unavailable" + failedText + ".");
            else if (failedSources.length) warning(otherView.section, region.label + " coverage is incomplete" + failedText + ".");
          }
        });
        regionalDetails(otherView, regionalSources);
      }
      else sourcesBlock(otherView.section).appendChild(el("div", "", "No source details supplied."));
      counts(otherView, otherShown);
    }

    finishMap({ earthquakes: quakeView, fires: fireView, events: otherView });
    if (!selectedCount) host.appendChild(el("div", "empty", "Natural-hazard data is temporarily unavailable."));
    else if (emptyCount === selectedCount && !coverageLimited) host.appendChild(el("div", "empty", "No natural-hazard events available."));
    q("foot").textContent = envelope.cached_at
      ? "Updated " + eventTime(envelope.cached_at, "", collapseWs(envelope.cached_at)) + (envelope.stale ? " (stale)" : "")
      : "";
`;
var NATURAL_DISASTERS_APP_HTML = buildAppHtml({
  title: "Natural Disasters \u2014 WorldMonitor",
  appName: "worldmonitor-natural-disasters",
  styles: STYLES6,
  body: BODY6,
  renderBody: RENDER6
});

// api/mcp/ui/prediction-markets-app.ts
var STYLES7 = `
  .mgroup { margin-top: 14px; }
  .mgroup:first-child { margin-top: 4px; }
  .sec-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted); margin-bottom: 6px; }
  .mkt { padding: 7px 0; border-bottom: 1px solid var(--border); }
  .mkt:last-child { border-bottom: none; }
  .mkt:focus-visible { outline: 1px solid var(--accent); outline-offset: -1px; }
  .mkt-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .mkt-title { font-size: 13px; color: var(--fg); min-width: 0; }
  .mkt-prob { font-variant-numeric: tabular-nums; font-weight: 700; font-size: 13px; white-space: nowrap; }
  .mkt-src { font-size: 10px; letter-spacing: 0.05em; color: var(--muted); }
  .mkt-title { overflow-wrap: anywhere; }
  a.mkt-title { text-decoration: none; }
  a.mkt-title:hover { text-decoration: underline; }
  .mkt-meta { display: flex; flex-wrap: wrap; gap: 6px 12px; color: var(--muted); font-size: 11px; margin-top: 4px; }
  .mkt-conviction { color: var(--muted); }
  .conv-yes, .mkt-yes { color: var(--accent); }
  .conv-no, .mkt-no { color: var(--severe); }
  .mkt-outcomes { display: flex; justify-content: space-between; font-size: 11px; margin-top: 5px; }
  .mkt .pbar { background: color-mix(in srgb, var(--severe) 30%, var(--border)); }
  .mkt-count { color: var(--muted); font-size: 11px; margin-left: 8px; text-transform: none; letter-spacing: 0; }
  .mkt-coverage { font-size: 12px; }
  .mkt-more { margin: 8px 0; padding: 6px 10px; border: 1px solid var(--border); border-radius: 5px; background: transparent; color: var(--fg); cursor: pointer; }
`;
var BODY7 = `
  <div class="head">
    <div class="title">Prediction Markets</div>
    <div class="badge">WorldMonitor Markets</div>
  </div>
  <div class="empty" id="empty">Waiting for market odds\u2026</div>
  <div id="card" style="display:none">
    <div id="groups"></div>
    <div class="foot" id="foot"></div>
  </div>
`;
var RENDER7 = `
    if (!data || typeof data !== "object") return;
    var value = Object.prototype.hasOwnProperty.call(data, "projection") ? data.projection : data;
    var envelope = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    var d = envelope.data && typeof envelope.data === "object" ? envelope.data : envelope;
    q("empty").style.display = "none";
    q("card").style.display = "block";

    var mb = d["markets-bootstrap"] && typeof d["markets-bootstrap"] === "object" ? d["markets-bootstrap"] : null;
    var buckets = [
      { key: "geopolitical", label: "Geopolitical" },
      { key: "tech", label: "Tech" },
      { key: "finance", label: "Finance" }
    ];
    var host = q("groups");
    host.textContent = "";
    function appendMarket(sec, m) {
      if (!m || typeof m !== "object") return;
      var mkt = el("div", "mkt");
      var head = el("div", "mkt-head");
      var href = httpUrl(m.source === "kalshi" ? m.displayUrl ?? m.url : m.url);
      var title = el(href ? "a" : "span", "mkt-title", collapseWs(m.title) || "Market");
      if (href) { title.href = href; title.target = "_blank"; title.rel = "noopener noreferrer"; }
      head.appendChild(title);
      var p = num(m.yesPrice);
      var pct = p == null ? null : Math.round(clampPct(p));
      head.appendChild(el("span", "mkt-prob", pct == null ? "\u2014" : pct + "%"));
      mkt.appendChild(head);
      var meta = el("div", "mkt-meta");
      var src = collapseWs(m.source);
      if (src) meta.appendChild(el("span", "mkt-src", src === "kalshi" ? "Kalshi" : src === "polymarket" ? "Polymarket" : src));
      var volume = num(m.volume);
      if (volume != null && volume > 0) {
        var amount = volume >= 1000000 ? (volume / 1000000).toFixed(1) + "M"
          : volume >= 1000 ? (volume / 1000).toFixed(0) + "K" : volume.toFixed(0);
        meta.appendChild(el("span", "mkt-volume", "Vol: $" + amount));
      }
      if (typeof m.endDate === "string") {
        var closes = new Date(m.endDate);
        if (Number.isFinite(closes.getTime())) meta.appendChild(el("span", "mkt-closes", "Closes: " + closes.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })));
      }
      if (pct != null) meta.appendChild(el("span", "mkt-conviction " + (pct >= 60 ? "conv-yes" : pct <= 40 ? "conv-no" : "conv-neutral"), pct >= 60 ? "Lean Yes" : pct <= 40 ? "Lean No" : "Toss-up"));
      mkt.appendChild(meta);
      var outcomes = el("div", "mkt-outcomes");
      outcomes.appendChild(el("span", "mkt-yes", "Yes " + (pct == null ? "\u2014" : pct + "%")));
      outcomes.appendChild(el("span", "mkt-no", "No " + (pct == null ? "\u2014" : (100 - pct) + "%")));
      mkt.appendChild(outcomes);
      var bar = probabilityBar(pct);
      if (bar) mkt.appendChild(bar);
      sec.appendChild(mkt);
    }
    function plural(n, word) { return n.toLocaleString("en-US") + " " + word + (n === 1 ? "" : "s"); }
    function listNames(names) {
      return names.length < 2 ? names.join("") : names.slice(0, -1).join(", ") + " and " + names[names.length - 1];
    }
    var unavailable = [];
    var unsampled = [];
    for (let g = 0; g < buckets.length; g++) {
      let cfg = buckets[g];
      let raw = mb && mb[cfg.key];
      let state = listState(raw);
      let list = state.items;
      let reported = raw && !Array.isArray(raw) ? num(raw.count) : null;
      if (!state.available) unavailable.push(cfg.label);
      if (!list.length) {
        if (reported != null && reported > 0) unsampled.push(cfg.label + ": " + plural(Math.floor(reported), "market") + " reported, but none were included to show.");
        continue;
      }
      let sec = el("div", "mgroup");
      let label = el("div", "sec-label", cfg.label);
      let total = reported == null ? list.length : Math.max(list.length, Math.floor(reported));
      label.appendChild(el("span", "mkt-count", plural(total, "market")));
      sec.appendChild(label);
      for (var i = 0; i < list.length && i < 6; i++) appendMarket(sec, list[i]);
      if (list.length > 6) {
        let more = el("button", "mkt-more", "Show " + (list.length - 6) + " more");
        more.type = "button";
        more.onclick = function () {
          var firstNew = sec.querySelectorAll(".mkt").length;
          more.remove();
          for (var j = 6; j < list.length; j++) appendMarket(sec, list[j]);
          var target = sec.querySelectorAll(".mkt")[firstNew];
          if (target) { target.tabIndex = -1; target.focus(); }
          reportSize();
        };
        sec.appendChild(more);
      }
      // A summary carries a sample; say so rather than imply the list is whole.
      if (list.length < total) sec.appendChild(el("div", "empty mkt-coverage", "Showing " + list.length + " of " + total + "; the rest were not included in this response."));
      host.appendChild(sec);
    }
    if (!host.childNodes.length && !unsampled.length) host.appendChild(el("div", "empty",
      unavailable.length === buckets.length ? "Prediction data unavailable."
        : unavailable.length ? "No markets in the categories that loaded."
        : "No markets in this response."));
    if (unavailable.length) host.appendChild(el("div", "empty mkt-coverage", listNames(unavailable) + " markets were not included or could not be loaded."));
    unsampled.forEach(function (notice) { host.appendChild(el("div", "empty mkt-coverage", notice)); });

    var updated = envelope.cached_at ? utcTime(envelope.cached_at) || collapseWs(envelope.cached_at) : "";
    var notices = [updated ? "Updated " + updated : "Update time unknown"];
    if (envelope.stale) notices[0] += " (out of date)";
    if (envelope.freshnessUnknown) notices.push("Freshness could not be checked");
    if (envelope.degraded || mb && mb.degraded) notices.push("Some market sources failed");
    // Error codes such as "kalshi_fetch_failed" name the source in plain
    // words; other error text is not shown to the reader.
    var sourceError = collapseWs(envelope.error || mb && mb.error);
    if (sourceError) {
      var failedSuffix = "_fetch_failed";
      var failedName = sourceError.length > failedSuffix.length && sourceError.slice(-failedSuffix.length) === failedSuffix
        ? sourceError.slice(0, -failedSuffix.length) : "";
      var sourceNames = { kalshi: "Kalshi", polymarket: "Polymarket" };
      notices.push(Object.prototype.hasOwnProperty.call(sourceNames, failedName)
        ? sourceNames[failedName] + " could not be reached" : "A market source reported an error");
    }
    q("foot").textContent = notices.join(" \xB7 ");
`;
var PREDICTION_MARKETS_APP_HTML = buildAppHtml({
  title: "Prediction Markets \u2014 WorldMonitor",
  appName: "worldmonitor-prediction-markets",
  styles: STYLES7,
  body: BODY7,
  renderBody: RENDER7
});

// api/mcp/ui/forecasts-app.ts
var STYLES8 = `
  .filters { display: flex; gap: 12px; margin: 14px 0 6px; flex-wrap: wrap; }
  .filters label { display: grid; gap: 4px; flex: 1; font-size: 12px; color: var(--muted); }
  .filters select { width: 100%; min-width: 0; padding: 7px; color: var(--fg); background: var(--card); border: 1px solid var(--border); border-radius: 5px; }
  #count { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
  .fc { padding: 12px 2px; border-bottom: 1px solid var(--border); overflow-wrap: anywhere; }
  .fc:last-child { border-bottom: none; }
  .fc-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
  .fc-title { font-size: 13px; color: var(--fg); min-width: 0; }
  .fc-prob { font-variant-numeric: tabular-nums; font-weight: 700; font-size: 13px; white-space: nowrap; }
  .fc-reliability { display: block; width: fit-content; max-width: 100%; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-size: 11px; color: var(--muted); margin-top: 6px; }
  .fc-reliability:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .fc-family-history { margin-top: 8px; font-size: 12px; }
  .fc-family-history details { margin-top: 0; }
  .fc-res-history { display: inline-flex; gap: 4px; margin-left: 8px; }
  .fc-res-chip[data-outcome="YES"], .fc-res-mark[data-outcome="YES"] { color: var(--up); }
  .fc-res-chip[data-outcome="NO"], .fc-res-mark[data-outcome="NO"] { color: var(--down); }
  .fc-res-chip[data-outcome="VOID"], .fc-res-mark[data-outcome="VOID"] { color: var(--muted); }
  .fc-family-history[data-unverified="true"] .fc-res-chip,
  .fc-family-history[data-unverified="true"] .fc-res-mark { color: var(--muted); }
  .fc-res-reasons { color: var(--muted); font-size: 11px; }
  .fc-horizons-hint { color: var(--muted); font-size: 11px; }
  .fc-sr-only { position: absolute; width: 1px; height: 1px; margin: -1px; padding: 0; overflow: hidden; clip-path: inset(50%); white-space: nowrap; border: 0; }
  .fc-meta { margin-top: 5px; display: flex; gap: 6px; flex-wrap: wrap; }
  .chip { font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted);
    border: 1px solid var(--border); border-radius: 999px; padding: 1px 7px; }
  details { margin-top: 10px; }
  summary { cursor: pointer; color: var(--accent); font-size: 12px; padding: 4px 0; }
  summary:focus-visible, select:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  .fc-section { padding: 10px; margin: 8px 0; background: var(--card); border: 1px solid var(--border); border-radius: 6px; font-size: 12px; }
  .fc-section h3 { margin: 0 0 6px; font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
  .fc-section p { margin: 4px 0; }
  .fc-section ul { margin: 4px 0; padding-left: 18px; }
  .fc-entry + .fc-entry { border-top: 1px solid var(--border); margin-top: 8px; padding-top: 8px; }
  #theaters { border-top: 1px solid var(--border); margin-top: 16px; padding-top: 12px; overflow-wrap: anywhere; }
  #theaters h2 { margin: 0 0 8px; font-size: 14px; }
  #load-theaters { margin: 8px 0; padding: 7px 12px; border: 1px solid var(--border); border-radius: 5px; background: var(--card); color: var(--accent); cursor: pointer; }
  #load-theaters:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
`;
var BODY8 = `
  <div class="head">
    <div class="title">Forecasts</div>
    <div class="badge">WorldMonitor Forecasts</div>
  </div>
  <div class="empty" id="empty">Waiting for forecasts\u2026</div>
  <div id="card" style="display:none">
    <div class="filters">
      <label for="domain">Domain<select id="domain"></select></label>
      <label for="region">Region<select id="region"></select></label>
    </div>
    <div id="count" role="status"></div>
    <div id="fc-audit"></div>
    <div id="list" role="region" aria-label="Forecasts"></div>
    <div class="foot" id="foot"></div>
    <section id="theaters" aria-label="Original active theaters"></section>
  </div>
`;
var RENDER8 = `
    if (!data || typeof data !== "object") return;
    if (Object.prototype.hasOwnProperty.call(data, "projection")) data = object(data.projection);
    var d = data.data && typeof data.data === "object" ? data.data : data;
    q("empty").style.display = "none";
    q("card").style.display = "block";
    var node = object(d.predictions);
    var state = listState(node.predictions);
    var preds = state.items.filter(function (p) { return p && typeof p === "object" && !Array.isArray(p); });
    var reported = number(object(node.predictions).count);
    var total = reported == null ? preds.length : Math.max(preds.length, reported);
    var host = q("list");
    var generation = node.generatedAt == null ? "" : String(node.generatedAt);
    var cases = renderData.forecastCases || (renderData.forecastCases = { generation: "", cache: new Map(), pending: new Map(), targets: new Map(), serial: 0 });
    var panel = object(data.panelRequest);
    var listKey = JSON.stringify([preds, generation, text(panel.token), state.available, total]);
    var reliability = object(d.reliability);
    var voidLabels = {
      no_establishable_metric: "The feed had no reading for this question",
      value_source_never_settled: "The feed never published a settled value",
      count_source_window_not_retained: "The feed no longer held the question window",
      unsupported_window: "The question could not be checked against its feed",
      unsupported_metric_key: "The question could not be checked against its feed",
      not_hard_spec: "The question could not be checked against its feed",
      missing_threshold: "The question was missing a threshold",
      missing_deadline: "The question was missing a deadline",
      missing_generated_at: "The forecast was missing its start date",
      beyond_archive_horizon: "The news archive no longer covered the question window",
      no_archive_evidence: "The news archive had nothing on the subject",
      all_judges_void: "Both judges found the evidence insufficient",
      judge_disagreement: "The judges disagreed",
      judge_retry_exhausted: "The judges returned no verdict",
      withheld_unpublished: "This kind of forecast is no longer published",
      resolver_envelope_bug: "Scored against a data feed we could not read correctly",
      market_price_not_outcome: "The feed showed the market price, not how the market resolved",
      judged_evidence_unreliable: "Held out of scoring while the judges' evidence is being fixed",
      judged_old_selection: "Judged with an evidence method later found unreliable",
      late_read: "The feed was not read close enough to the deadline",
      feed_unavailable: "The data feed was unavailable after the deadline",
      resolver_could_not_read_feed: "Our resolver could not read this feed correctly",
      base_rate_placeholder: "Opened on a base-rate placeholder, not a model forecast",
      other: "Could not be resolved"
    };
    function domainLabel(value) {
      var words = text(value).split("_").join(" ");
      return words ? words.charAt(0).toUpperCase() + words.slice(1) : "";
    }
    function indexHistory(rows) {
      var result = new Map();
      var ids = new Set(preds.slice(0, 30).map(function (prediction) { return prediction.id; }));
      if (!Array.isArray(rows)) return result;
      rows.slice(0, 150).forEach(function (row) {
        if (!row || typeof row !== "object" || Array.isArray(row) || typeof row.forecastId !== "string" || !row.forecastId || !ids.has(row.forecastId) || ["YES", "NO", "VOID"].indexOf(row.outcome) < 0) return;
        var windows = result.get(row.forecastId) || [];
        if (windows.length >= 5) return;
        windows.push({ outcome: row.outcome, voidReason: row.outcome === "VOID" ? (typeof row.voidReason === "string" && Object.prototype.hasOwnProperty.call(voidLabels, row.voidReason) ? row.voidReason : "other") : "" });
        result.set(row.forecastId, windows);
      });
      return result;
    }
    var familyHistory = indexHistory(d.familyOutcomes);
    function updateHistory(fc) {
      var old = fc.querySelector(".fc-family-history");
      var windows = familyHistory.get(fc.getAttribute("data-forecast-id")) || [];
      var unverified = !!text(object(reliability.underAudit).since);
      var key = JSON.stringify([windows, unverified]);
      if (old && old.getAttribute("data-history") === key) return;
      if (!windows.length) { if (old) old.remove(); return; }
      var wasOpen = !!(old && old.querySelector("details") && old.querySelector("details").open);
      var slot = el("div", "fc-family-history"); slot.setAttribute("data-history", key);
      if (unverified) slot.setAttribute("data-unverified", "true");
      var row = el("span");
      var last = el("span", "fc-res-chip", "Last: " + windows[0].outcome);
      last.setAttribute("data-outcome", windows[0].outcome);
      last.setAttribute("aria-label", "The previous window of this forecast resolved " + windows[0].outcome + ".");
      if (unverified) {
        var warning = "Recorded outcome, not verified while accuracy is under audit.";
        last.setAttribute("aria-label", last.getAttribute("aria-label") + " " + warning);
        last.setAttribute("title", warning);
      }
      row.appendChild(last);
      if (windows.length > 1) {
        var marks = el("span", "fc-res-history"); marks.setAttribute("aria-hidden", "true");
        windows.forEach(function (windowOutcome) { var mark = el("span", "fc-res-mark", { YES: "\u2713", NO: "\u2717", VOID: "\u2205" }[windowOutcome.outcome]); mark.setAttribute("data-outcome", windowOutcome.outcome); marks.appendChild(mark); });
        row.appendChild(marks);
      }
      var sentence = "Recent windows, newest first: " + windows.map(function (windowOutcome) { return windowOutcome.outcome + (windowOutcome.outcome === "VOID" ? " (" + voidLabels[windowOutcome.voidReason] + ")" : ""); }).join(", ");
      if (windows.some(function (windowOutcome) { return windowOutcome.outcome === "VOID"; })) {
        var disclosure = el("details", "fc-res-void"); disclosure.open = wasOpen;
        var summary = el("summary"); summary.appendChild(row); disclosure.appendChild(summary);
        disclosure.appendChild(el("p", "fc-res-reasons", sentence)); disclosure.ontoggle = reportSize; slot.appendChild(disclosure);
      } else { slot.appendChild(row); slot.appendChild(el("span", "fc-sr-only", sentence)); }
      if (old) old.replaceWith(slot); else fc.appendChild(slot);
    }
    // While the audit switch withholds scores, every card would carry the same
    // badge, so the notice is shown once above the list instead.
    function renderAudit() {
      var host = q("fc-audit");
      host.textContent = "";
      var audit = object(reliability.underAudit);
      if (!text(audit.since)) return;
      var held = el("a", "fc-reliability", "Accuracy under audit");
      held.href = "https://www.worldmonitor.app/accuracy/"; held.target = "_blank"; held.rel = "noopener noreferrer";
      held.setAttribute("aria-label", "Accuracy under audit since " + text(audit.since) + ". Scores are withdrawn while scoring errors are corrected.");
      held.setAttribute("data-fc-reliability-state", "under-audit");
      host.appendChild(held);
    }
    function badge(domain) {
      if (text(object(reliability.underAudit).since)) return null;
      if (reliability.status !== "ready" || !Array.isArray(reliability.byDomain)) return null;
      var row = reliability.byDomain.find(function (value) { return value && value.domain === domain; });
      if (!row) return null;
      var label = domainLabel(domain) || "Forecast";
      var measured = row.kind === "measured" && number(row.brier) != null && number(row.yesShare) != null;
      var main = measured ? label + " n=" + row.n + " \xB7 Brier " + row.brier.toFixed(3) + " vs base rate " + (row.yesShare * (1 - row.yesShare)).toFixed(3) : "Not yet measured";
      if (reliability.stale) main = "Out of date \xB7 " + main;
      var link = el("a", "fc-reliability", main);
      link.href = "https://www.worldmonitor.app/accuracy/#by-domain"; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", main + ". " + label + ": " + row.n + " published outcomes over " + reliability.windowDays + " days." + (reliability.freshnessUnknown ? " Freshness unknown." : ""));
      return link;
    }
    var source = [];
    var generatedAt = timestamp(node.generatedAt);
    var cachedAt = timestamp(data.cached_at) || text(data.cached_at);
    if (generatedAt) source.push("Generated " + generatedAt);
    else if (cachedAt) source.push("Updated " + cachedAt);
    if (data.stale || node.stale) source.push("Out of date");
    if (node.degraded) source.push("Some forecast sources failed");
    if (text(node.error)) source.push("The forecast source reported an error");
    q("foot").textContent = source.join(" \xB7 ");
    renderAudit();
    if (cases.listKey === listKey && cases.updateMetadata) {
      cases.updateMetadata(reliability, d.familyOutcomes); reportSize(); return;
    }
    cases.pending.forEach(function (cancel) { cancel(); });
    cases.pending.clear(); cases.cache.clear(); cases.generation = generation; cases.listKey = listKey;
    cases.updateMetadata = function (value, rows) {
      reliability = value;
      familyHistory = indexHistory(rows);
      renderAudit();
      host.querySelectorAll(".fc").forEach(function (fc) {
        var old = fc.querySelector(".fc-reliability");
        var next = badge(fc.getAttribute("data-forecast-domain"));
        if (old) { if (next) old.replaceWith(next); else old.remove(); }
        else if (next) fc.insertBefore(next, fc.querySelector("details"));
        updateHistory(fc);
      });
    };
    var theaterState = renderData.forecastTheaters || (renderData.forecastTheaters = { key: "", value: null, error: "", pending: false, cancel: null, serial: 0 });
    var theaterKey = listKey;
    if (theaterState.key !== theaterKey) {
      if (theaterState.cancel) theaterState.cancel();
      theaterState.key = theaterKey; theaterState.value = null; theaterState.error = "";
    }

    function renderTheaters() {
      var target = q("theaters");
      target.textContent = "";
      target.appendChild(el("h2", "", "Active theaters"));
      var value = theaterState.value;
      if (value) {
        var status = { ready: "", partial: "Some theaters are missing.", empty: "No theaters qualified this run.", failed: "Every theater failed this run.", unknown: "Whether this run finished is unknown.", missing: "No theater results are available.", processing: "Theater results are still being prepared.", unavailable: "The theater source is unavailable." }[value.status] || "";
        var coverage = value.theaterCount + " of " + value.eligibleTheaterCount + " theaters loaded" + (value.failedTheaterCount ? "; " + value.failedTheaterCount + " failed." : ".");
        target.appendChild(el("p", "empty", (status ? status + " " : "") + coverage));
        var theaterTime = timestamp(value.generatedAt);
        // The source time does not show whether the theaters are current.
        target.appendChild(el("p", "foot", (theaterTime ? "Generated " + theaterTime + "; whether" : "Whether") + " this is current is unknown."));
        if (value.note) target.appendChild(el("p", "empty", value.note));
        if (value.error) target.appendChild(el("p", "empty", "The theater source reported an error."));
        value.theaters.forEach(function (theater) {
          var details = el("details", "fc");
          details.appendChild(el("summary", "", theater.theaterLabel));
          copy(details, theater.stateKind, "State: ");
          theater.topPaths.forEach(function (path) {
            section(details, path.label, function (content) {
              copy(content, path.summary);
              var confidence = number(path.confidence);
              content.appendChild(el("p", "", confidence == null ? "Confidence unknown" : "Confidence: " + Math.round(confidence * 100) + "%"));
              section(content, "Actors", function (actors) { items(actors, path.keyActors); });
              section(content, "Actor roles", function (roles) { items(roles, path.keyActorRoles); });
            });
          });
          section(details, "Dominant reactions", function (content) { items(content, theater.dominantReactions); });
          section(details, "Stabilizers", function (content) { items(content, theater.stabilizers); });
          section(details, "Invalidators", function (content) { items(content, theater.invalidators); });
          details.ontoggle = reportSize;
          target.appendChild(details);
        });
      }
      if (theaterState.error) target.appendChild(el("p", "empty", theaterState.error));
      if (!value || value.status !== "ready" && value.status !== "empty" || theaterState.error) {
        var load = el("button", "", theaterState.pending ? "Loading active theaters\u2026" : value || theaterState.error ? "Retry active theaters" : "Load active theaters");
        load.id = "load-theaters"; load.type = "button"; load.disabled = theaterState.pending;
        load.onclick = loadTheaters;
        target.appendChild(load);
      }
      reportSize();
    }
    function publicRequestError(error) {
      if (!error || typeof error !== "object" || Array.isArray(error)) return "";
      var allowed = [
        [-32602, "Invalid panel request."],
        [-32602, "Panel request expired. Open or refresh the panel.", "This panel request was not accepted. Open a new forecasts panel."],
        [-32602, "Open a forecast panel before reading original evidence."],
        [-32602, "Panel request only covers bounded forecast lists, original cases and latest theater summaries."],
        [-32029, "This panel reached its read budget. Refresh to start another request."],
        [-32029, "Too many requests"],
        // MCP 2026-07-28 carries the same budget denials as -31029.
        [-31029, "This panel reached its read budget. Refresh to start another request."],
        [-31029, "Too many requests"],
        [-32603, "Service temporarily unavailable, retry in a moment."],
        [-32603, "Service temporarily unavailable"],
        [-32603, "Internal error: data fetch failed"],
        [-32003, "Required data inputs are unavailable"]
      ];
      var match = allowed.find(function (entry) { return error.code === entry[0] && error.message === entry[1]; });
      return match ? (match[2] || match[1]) + " (Error " + match[0] + ")" : "";
    }
    function publicToolError(payload) {
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "";
      if (payload._budget_exceeded === true) return softError({ _budget_exceeded: true });
      if (typeof payload._jmespath_error === "string" && payload._jmespath_error) return softError({ _jmespath_error: true });
      return "";
    }
    function loadTheaters() {
      if (theaterState.pending) return;
      if (!hostCapabilities.serverTools || typeof hostCapabilities.serverTools !== "object") {
        theaterState.error = "This host does not support original theater tool calls."; renderTheaters(); return;
      }
      if (panel.panel !== "forecasts" || typeof panel.token !== "string" || !panel.token) {
        theaterState.error = "Original theaters require a signed panel request. Open a new forecasts panel."; renderTheaters(); return;
      }
      theaterState.pending = true; theaterState.error = "";
      var id = "forecast-theaters-" + ++theaterState.serial;
      var timer;
      function cancel() { clearTimeout(timer); window.removeEventListener("message", receive); theaterState.pending = false; theaterState.cancel = null; }
      function failure(message) { cancel(); theaterState.error = message; renderTheaters(); }
      function receive(event) {
        if (event.source !== parentWin || theaterState.key !== theaterKey) return;
        var message = event.data;
        if (!message || message.jsonrpc !== "2.0" || message.id !== id) return;
        if (message.error) { failure(publicRequestError(message.error) || "Original theater request failed. Retry manually or refresh forecasts if the panel expired."); return; }
        var payload = extractToolData(message.result);
        if (message.result && message.result.isError || softError(payload)) {
          failure(publicToolError(payload) || "Original theater request failed. Retry manually or refresh forecasts if the panel expired."); return;
        }
        var envelope = object(payload);
        if (Object.prototype.hasOwnProperty.call(envelope, "projection")) envelope = object(envelope.projection);
        var value = object(object(envelope.data).forecastTheaters);
        var theaters;
        try { theaters = value.theaterSummariesJson ? JSON.parse(value.theaterSummariesJson) : []; } catch (_) { failure("Original theater response is invalid."); return; }
        function stringArray(v) { return Array.isArray(v) && v.every(function (item) { return typeof item === "string"; }); }
        function count(v) { return Number.isInteger(v) && v >= 0 && v <= 3; }
        var valid = ["ready", "partial", "empty", "failed", "unknown", "missing", "processing", "unavailable"].indexOf(value.status) >= 0
          && typeof value.found === "boolean" && typeof value.processing === "boolean" && typeof value.allTheatersFailed === "boolean"
          && ["runId", "schemaVersion", "note", "error", "theaterSummariesJson", "completionStatus"].every(function (field) { return typeof value[field] === "string"; })
          && Number.isSafeInteger(value.generatedAt) && value.generatedAt >= 0
          && count(value.theaterCount) && count(value.eligibleTheaterCount) && count(value.failedTheaterCount)
          && value.theaterCount + value.failedTheaterCount === value.eligibleTheaterCount
          && Array.isArray(theaters) && theaters.length <= 3 && theaters.length === value.theaterCount
          && theaters.every(function (theater) {
            return theater && typeof theater.theaterId === "string" && typeof theater.theaterLabel === "string" && typeof theater.stateKind === "string"
              && Array.isArray(theater.topPaths) && theater.topPaths.length <= 3 && theater.topPaths.every(function (path) {
                return path && typeof path.pathId === "string" && typeof path.label === "string" && typeof path.summary === "string"
                  && (path.confidence == null || number(path.confidence) != null && path.confidence >= 0 && path.confidence <= 1)
                  && stringArray(path.keyActors) && path.keyActors.length <= 4 && (path.keyActorRoles === undefined || stringArray(path.keyActorRoles) && path.keyActorRoles.length <= 8);
              }) && stringArray(theater.dominantReactions) && theater.dominantReactions.length <= 3
              && stringArray(theater.stabilizers) && theater.stabilizers.length <= 3 && stringArray(theater.invalidators) && theater.invalidators.length <= 2;
          });
        if (!valid) { failure("Original theater response is invalid."); return; }
        if (["unavailable", "missing", "processing", "failed"].indexOf(value.status) >= 0 && theaterState.value && theaterState.value.theaters.length) {
          var why = { unavailable: "the theater source is unavailable", missing: "no theater results were found", processing: "theater results are still being prepared", failed: "every theater failed" }[value.status];
          failure("The latest refresh did not load: " + why + ". Previously loaded evidence remains visible and may be out of date."); return;
        }
        cancel(); theaterState.value = Object.assign({}, value, { theaters: theaters }); renderTheaters();
      }
      theaterState.cancel = cancel;
      window.addEventListener("message", receive);
      timer = setTimeout(function () { failure("Original theater request timed out."); }, 15000);
      renderTheaters();
      post({ jsonrpc: "2.0", id: id, method: "tools/call", params: { name: "get_forecast_theaters", arguments: { panel_request: panel.token } } });
    }

    function caseContent(parent, value) {
      parent.textContent = "";
      analysis(parent, value.forecast);
      var coverage = [];
      if (text(value.cached_at)) coverage.push("Original case snapshot: " + text(value.cached_at));
      if (value.stale) coverage.push("Original case uses stale cache");
      if (value.freshnessUnknown) coverage.push("Original case freshness unknown");
      if (value.unreadable) coverage.push("Original case source coverage unavailable");
      if (coverage.length) parent.appendChild(el("p", "empty", coverage.join(" \xB7 ")));
    }
    function caseNotice(parent, message, retry) {
      parent.textContent = "";
      parent.appendChild(el("p", "empty", message));
      if (retry) {
        var button = el("button", "", "Retry case details");
        button.type = "button";
        button.onclick = retry;
        parent.appendChild(button);
      }
      reportSize();
    }
    function loadCase(parent, p) {
      if (!hostCapabilities.serverTools || typeof hostCapabilities.serverTools !== "object") {
        caseNotice(parent, "This host does not support original case tool calls."); return;
      }
      if (panel.panel !== "forecasts" || typeof panel.token !== "string" || !panel.token) {
        caseNotice(parent, "Original case details require a signed panel request. Open a new forecasts panel."); return;
      }
      if (typeof p.id !== "string" || !p.id || p.id.length > 160 || !generation || generation.length > 64) {
        caseNotice(parent, "Original case identity or generation is unavailable."); return;
      }
      var cached = cases.cache.get(p.id);
      if (cached) { caseContent(parent, cached); return; }
      caseNotice(parent, "Loading original case details\u2026");
      if (cases.pending.has(p.id)) return;
      var requestId = "forecast-case-" + ++cases.serial;
      var timer;
      function cancel() { clearTimeout(timer); window.removeEventListener("message", receive); cases.pending.delete(p.id); }
      function failure(message) { cancel(); caseNotice(cases.targets.get(p.id) || parent, message, function () { loadCase(cases.targets.get(p.id) || parent, p); }); }
      function receive(event) {
        if (event.source !== parentWin) return;
        var message = event.data;
        if (!message || message.jsonrpc !== "2.0" || message.id !== requestId) return;
        if (message.error) { failure(publicRequestError(message.error) || "Original case request failed."); return; }
        var result = message.result;
        var payload = extractToolData(result);
        if (result && result.isError || softError(payload)) { failure(publicToolError(payload) || "Original case request failed."); return; }
        var envelope = object(payload);
        if (Object.prototype.hasOwnProperty.call(envelope, "projection")) envelope = object(envelope.projection);
        var detail = object(object(envelope.data).forecastCase);
        if (detail.status === "generation_changed" || (detail.generatedAt != null && String(detail.generatedAt) !== generation)) {
          cancel(); caseNotice(cases.targets.get(p.id) || parent, "Forecast generation changed. Ask to refresh forecasts for current original evidence. Refreshing uses 1 new panel allocation."); return;
        }
        if (detail.status === "missing") { failure("Original case is no longer available."); return; }
        if (detail.status === "unavailable") { failure("Original case source unavailable."); return; }
        var original = object(detail.forecast);
        if (detail.status !== "ready" || String(detail.generatedAt) !== generation || original.id !== p.id) {
          failure("Original case response does not match this forecast."); return;
        }
        cancel();
        var value = { forecast: original, cached_at: envelope.cached_at, stale: envelope.stale === true, freshnessUnknown: envelope.freshnessUnknown === true, unreadable: Array.isArray(envelope.unreadable) && envelope.unreadable.length > 0 };
        cases.cache.set(p.id, value);
        caseContent(cases.targets.get(p.id) || parent, value);
        reportSize();
      }
      cases.pending.set(p.id, cancel);
      window.addEventListener("message", receive);
      timer = setTimeout(function () { failure("Original case request timed out."); }, 15000);
      post({ jsonrpc: "2.0", id: requestId, method: "tools/call", params: { name: "get_forecast_case", arguments: {
        forecast_id: p.id, generated_at: generation, panel_request: panel.token
      } } });
    }

    function object(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
    function text(v) { return typeof v === "string" ? collapseWs(v) : ""; }
    function number(v) { return typeof v === "number" && isFinite(v) ? v : null; }
    function timestamp(v) {
      if ((typeof v !== "number" && typeof v !== "string") || !v || (typeof v === "number" && v <= 0)) return "";
      return utcTime(v);
    }
    function strings(v) { return Array.isArray(v) ? v.map(text).filter(Boolean) : []; }
    function copy(parent, value, prefix) {
      var str = text(value);
      if (str) parent.appendChild(el("p", "", (prefix || "") + str));
    }
    function items(parent, values) {
      var entries = strings(values);
      if (!entries.length) return;
      var ul = el("ul");
      entries.forEach(function (entry) { ul.appendChild(el("li", "", entry)); });
      parent.appendChild(ul);
    }
    function section(parent, title, fill) {
      var content = el("div");
      fill(content);
      if (!content.childNodes.length) return;
      var block = el("section", "fc-section");
      block.appendChild(el("h3", "", title));
      block.appendChild(content);
      parent.appendChild(block);
    }
    function evidence(parent, values) {
      if (!Array.isArray(values)) return;
      items(parent, values.map(function (item) {
        var e = object(item);
        var weight = number(e.weight);
        return text(e.summary) ? text(e.summary) + (weight == null ? "" : " (" + Math.round(weight * 100) + "%)") : "";
      }));
    }
    function analysis(parent, p) {
      var c = object(p.caseFile);
      section(parent, "Executive View", function (s) { copy(s, p.scenario); });
      section(parent, "Base Case", function (s) { copy(s, c.baseCase); });
      section(parent, "What Changed", function (s) { copy(s, c.changeSummary); items(s, c.changeItems); });
      section(parent, "World State", function (s) {
        var w = object(c.worldState);
        copy(s, w.summary);
        [["Pressures", w.activePressures], ["Stabilizers", w.stabilizers], ["Key unknowns", w.keyUnknowns]].forEach(function (entry) {
          if (strings(entry[1]).length) { copy(s, entry[0] + ":"); items(s, entry[1]); }
        });
      });
      section(parent, "Alternative Paths", function (s) { copy(s, c.escalatoryCase, "Escalatory: "); copy(s, c.contrarianCase, "Contrarian: "); });
      section(parent, "Simulated Branches", function (s) {
        if (!Array.isArray(c.branches)) return;
        c.branches.forEach(function (value) {
          if (!value || typeof value !== "object") return;
          var b = object(value);
          var entry = el("div", "fc-entry");
          entry.appendChild(el("strong", "", text(b.title) || text(b.kind) || "Branch"));
          var probability = number(b.projectedProbability);
          if (probability != null) copy(entry, "Projected " + Math.round(probability * 100) + "%");
          copy(entry, b.summary); copy(entry, b.outcome, "Outcome: ");
          if (Array.isArray(b.rounds)) b.rounds.slice(0, 3).forEach(function (value) {
            var r = object(value);
            var detail = strings(r.developments).slice(0, 2).concat(strings(r.actorMoves).slice(0, 1)).join(" ") || text(r.focus);
            copy(entry, detail, "R" + (number(r.round) || 0) + ": ");
          });
          s.appendChild(entry);
        });
      });
      section(parent, "Supporting Evidence", function (s) { evidence(s, c.supportingEvidence); });
      section(parent, "Counter Evidence", function (s) { evidence(s, c.counterEvidence); });
      section(parent, "Signals To Watch", function (s) { items(s, c.triggers); });
      section(parent, "Signals", function (s) {
        if (Array.isArray(p.signals)) items(s, p.signals.map(function (value) { return object(value).value; }));
      });
      section(parent, "Actors", function (s) {
        if (!Array.isArray(c.actors)) return;
        c.actors.forEach(function (value) {
          if (!value || typeof value !== "object") return;
          var a = object(value);
          var entry = el("div", "fc-entry");
          entry.appendChild(el("strong", "", text(a.name) || "Actor"));
          copy(entry, a.category);
          var influence = number(a.influenceScore);
          if (influence != null) copy(entry, "Influence " + Math.round(influence * 100) + "%");
          copy(entry, a.role);
          copy(entry, strings(a.objectives)[0], "Objective: ");
          copy(entry, strings(a.constraints)[0], "Constraint: ");
          copy(entry, strings(a.likelyActions)[0], "Likely action: ");
          s.appendChild(entry);
        });
      });
      if (!Array.isArray(c.actors) || !c.actors.length) section(parent, "Actor Lenses", function (s) { items(s, c.actorLenses); });
      section(parent, "Perspectives", function (s) {
        var views = object(p.perspectives);
        copy(s, views.strategic, "Strategic: "); copy(s, views.regional, "Regional: "); copy(s, views.contrarian, "Contrarian: ");
      });
      section(parent, "Context", function (s) {
        var calibration = object(p.calibration);
        if (text(calibration.marketTitle)) {
          var price = number(calibration.marketPrice);
          copy(s, "Market: " + text(calibration.marketTitle) + (price == null ? " (probability unknown)" : " (" + Math.round(price * 100) + "%)"));
        }
        var prior = number(p.priorProbability);
        if (prior != null) copy(s, "Prior: " + Math.round(prior * 100) + "%");
        if (Array.isArray(p.cascades) && p.cascades.length) copy(s, "Cascades: " + p.cascades.length);
      });
      if (!Object.keys(c).length) parent.appendChild(el("p", "empty", "Case evidence is not included in this result."));
    }
    function appendForecast(p) {
      var fc = el("article", "fc");
      fc.setAttribute("data-forecast-domain", text(p.domain));
      fc.setAttribute("data-forecast-id", text(p.id));
      var head = el("div", "fc-head");
      head.appendChild(el("span", "fc-title", text(p.title) || "Forecast"));
      var pr = num(p.probability);
      var pct = pr == null ? null : (pr <= 1 ? pr * 100 : pr);
      head.appendChild(el("span", "fc-prob", pct == null ? "\u2014" : Math.round(pct) + "%"));
      fc.appendChild(head);
      var meta = el("div", "fc-meta");
      [domainLabel(p.domain), text(p.region), text(p.trend), text(p.timeHorizon)].forEach(function (value) {
        if (value) meta.appendChild(el("span", "chip", value));
      });
      // One chip says what the simulation did and by how much.
      var adjustment = number(p.simulationAdjustment);
      var adjusted = adjustment != null && adjustment !== 0;
      var shift = adjusted ? " \xB7 " + (adjustment > 0 ? "+" : "\u2212") + Math.round(Math.abs(adjustment) * 100) + "%" : "";
      if (p.demotedBySimulation === true) meta.appendChild(el("span", "chip", "AI skeptical" + shift));
      else if (adjusted) {
        var confidence = number(p.simPathConfidence);
        meta.appendChild(el("span", "chip", (adjustment < 0 ? "AI caution" : confidence != null && confidence < 0.7 ? "AI support (moderate)" : "AI support") + shift));
      }
      if (meta.childNodes.length) fc.appendChild(meta);
      var reliabilityBadge = badge(text(p.domain));
      if (reliabilityBadge) fc.appendChild(reliabilityBadge);
      var bar = probabilityBar(pct);
      if (bar) fc.appendChild(bar);
      var details = el("details");
      details.appendChild(el("summary", "", "Analysis"));
      var content = el("div");
      details.appendChild(content);
      if (typeof p.id === "string") cases.targets.set(p.id, content);
      var loadedCase = Object.keys(object(p.caseFile)).length > 0;
      if (loadedCase) analysis(content, p);
      else if (p.hasCaseFile === false) caseNotice(content, "No case evidence is available for this forecast.");
      else if (p.hasCaseFile === true && typeof p.id === "string" && cases.cache.has(p.id)) caseContent(content, cases.cache.get(p.id));
      else analysis(content, p);
      details.ontoggle = function () {
        if (details.open && !loadedCase && p.hasCaseFile === true) loadCase(content, p);
        reportSize();
      };
      fc.appendChild(details);
      if (Array.isArray(p.scoredHorizons)) {
        var horizonNames = [["h24", "24h"], ["d7", "7d"], ["d30", "30d"]]
          .filter(function (entry) { return p.scoredHorizons.indexOf(entry[0]) >= 0; })
          .map(function (entry) { return entry[1]; });
        if (horizonNames.length) {
          var horizons = el("details", "fc-horizons");
          horizons.appendChild(el("summary", "", "Also scored at: " + horizonNames.join(", ")));
          horizons.appendChild(el("p", "fc-horizons-hint", "The headline probability is graded at the forecast's own horizon. The projection at each of these horizons is graded too, against its source feed, using the value first published for this forecast. Projection values are not shown because the current value can differ from the graded one."));
          horizons.ontoggle = reportSize;
          fc.appendChild(horizons);
        }
      }
      updateHistory(fc);
      host.appendChild(fc);
    }
    function options(id, field, all) {
      var select = q(id);
      var selected = select.value || "";
      var values = Array.from(new Set(preds.map(function (p) { return text(p[field]); }).filter(Boolean))).sort();
      select.textContent = "";
      [""].concat(values).forEach(function (value) {
        var option = el("option", "", value ? (field === "domain" ? domainLabel(value) : value) : all);
        option.value = value;
        select.appendChild(option);
      });
      select.value = values.indexOf(selected) >= 0 ? selected : "";
      select.onchange = renderList;
    }
    function renderList() {
      cases.targets.clear();
      host.textContent = "";
      var visible = preds.filter(function (p) {
        return (!q("domain").value || text(p.domain) === q("domain").value) && (!q("region").value || text(p.region) === q("region").value);
      });
      visible.forEach(appendForecast);
      if (!host.childNodes.length) host.appendChild(el("div", "empty", !state.available ? "Forecast data unavailable." : !preds.length ? "No forecasts available."
        : preds.length < total ? "No forecasts in this response match these filters. Forecasts left out of the response were not checked."
        : "No forecasts match these filters."));
      var countText = visible.length === preds.length ? preds.length + (preds.length === 1 ? " forecast" : " forecasts")
        : "Showing " + visible.length + " of " + preds.length + " forecasts";
      if (preds.length < total) countText += "; " + (total - preds.length) + " more were not included in this response";
      q("count").textContent = state.available ? countText + "." : "Forecast coverage unavailable.";
      reportSize();
    }
    options("domain", "domain", "All domains");
    options("region", "region", "All regions");
    renderList();
    renderTheaters();
`;
var FORECASTS_APP_HTML = buildAppHtml({
  title: "Forecasts \u2014 WorldMonitor",
  appName: "worldmonitor-forecasts",
  styles: STYLES8,
  body: BODY8,
  renderBody: RENDER8
});

// api/mcp/ui/registry.ts
var UI_RESOURCE_MIME_TYPE2 = UI_RESOURCE_MIME_TYPE;
var COUNTRY_RISK_UI_URI = "ui://worldmonitor/country-risk-v3.html";
var PREVIOUS_COUNTRY_RISK_UI_URI = "ui://worldmonitor/country-risk-v2.html";
var LEGACY_COUNTRY_RISK_UI_URI = "ui://worldmonitor/country-risk.html";
var WORLD_BRIEF_UI_URI = "ui://worldmonitor/world-brief-v2.html";
var LEGACY_WORLD_BRIEF_UI_URI = "ui://worldmonitor/world-brief.html";
var COUNTRY_BRIEF_UI_URI = "ui://worldmonitor/country-brief-v3.html";
var PREVIOUS_COUNTRY_BRIEF_UI_URI = "ui://worldmonitor/country-brief-v2.html";
var LEGACY_COUNTRY_BRIEF_UI_URI = "ui://worldmonitor/country-brief.html";
var MARKET_RADAR_UI_URI = "ui://worldmonitor/market-radar-v3.html";
var CHOKEPOINT_MONITOR_UI_URI = "ui://worldmonitor/chokepoint-monitor-v2.html";
var LEGACY_CHOKEPOINT_MONITOR_UI_URI = "ui://worldmonitor/chokepoint-monitor.html";
var NEWS_INTELLIGENCE_UI_URI = "ui://worldmonitor/news-intelligence-v3.html";
var PREVIOUS_NEWS_INTELLIGENCE_UI_URI = "ui://worldmonitor/news-intelligence-v2.html";
var LEGACY_NEWS_INTELLIGENCE_UI_URI = "ui://worldmonitor/news-intelligence.html";
var CONFLICT_EVENTS_UI_URI = "ui://worldmonitor/conflict-events-v2.html";
var LEGACY_CONFLICT_EVENTS_UI_URI = "ui://worldmonitor/conflict-events.html";
var NATURAL_DISASTERS_UI_URI = "ui://worldmonitor/natural-disasters-v3.html";
var PREVIOUS_NATURAL_DISASTERS_UI_URI = "ui://worldmonitor/natural-disasters-v2.html";
var LEGACY_NATURAL_DISASTERS_UI_URI = "ui://worldmonitor/natural-disasters.html";
var PREDICTION_MARKETS_UI_URI = "ui://worldmonitor/prediction-markets-v3.html";
var PREVIOUS_PREDICTION_MARKETS_UI_URI = "ui://worldmonitor/prediction-markets-v2.html";
var LEGACY_PREDICTION_MARKETS_UI_URI = "ui://worldmonitor/prediction-markets.html";
var FORECASTS_UI_URI = "ui://worldmonitor/forecasts-v4.html";
var PREVIOUS_FORECASTS_UI_URI = "ui://worldmonitor/forecasts-v3.html";
var LEGACY_FORECASTS_V2_UI_URI = "ui://worldmonitor/forecasts-v2.html";
var LEGACY_FORECASTS_UI_URI = "ui://worldmonitor/forecasts.html";
var UI_RESOURCE_REGISTRY = [
  {
    uri: COUNTRY_RISK_UI_URI,
    name: "Country Risk (interactive)",
    description: "Interactive in-conversation app shell for get_country_risk: renders the Composite Instability Index (cii.combinedScore, 0-100), its four contributing components labelled by meaning (domestic unrest, armed conflict, security and mobility, information environment), the government travel-advisory level, OFAC sanctions exposure, and score trend. Shows an explicit degraded banner when upstreamUnavailable is set, so an outage cannot read as a calm country. Linked from the get_country_risk tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Static, data-free template \u2014 public and quota-exempt.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: buildUiMeta(),
    html: COUNTRY_RISK_APP_HTML
  },
  {
    uri: WORLD_BRIEF_UI_URI,
    name: "World Brief (interactive)",
    description: "Interactive in-conversation app shell for get_world_brief: renders the AI-summarised global intelligence brief as readable paragraphs, the grounding headlines, and the source feed articles. Linked from the get_world_brief tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Static, data-free template \u2014 public and quota-exempt.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: buildUiMeta(),
    html: WORLD_BRIEF_APP_HTML
  },
  {
    uri: COUNTRY_BRIEF_UI_URI,
    name: "Country Brief (interactive)",
    description: "Interactive in-conversation app shell for get_country_brief: renders the AI-synthesised per-country intelligence brief as paragraphs, the grounding sources, and cited WorldMonitor data. Linked from the get_country_brief tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Static, data-free template \u2014 public and quota-exempt.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: buildUiMeta(),
    html: COUNTRY_BRIEF_APP_HTML
  },
  {
    uri: MARKET_RADAR_UI_URI,
    name: "Market Radar (interactive)",
    description: "Interactive in-conversation app shell for get_market_data: renders the Fear & Greed composite plus per-asset-class quote tables (equities, commodities, crypto, Gulf, sectors) with signed change, loaded names and locally expandable original intraday charts. Linked from the get_market_data tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Data-free current-interface bootstrap, public and quota-exempt. Loads only the current public UI assets; chart expansion reuses the tool result.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: MARKET_RADAR_META,
    html: ""
  },
  {
    uri: CHOKEPOINT_MONITOR_UI_URI,
    name: "Chokepoint Monitor (interactive)",
    description: "Interactive in-conversation app shell for get_chokepoint_status: renders per-chokepoint rolling transit summaries (today's transit count, week-over-week change, tanker split) with a risk-level badge. Linked from the get_chokepoint_status tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Static, data-free template \u2014 public and quota-exempt.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: buildUiMeta(),
    html: CHOKEPOINT_MONITOR_APP_HTML
  },
  {
    uri: NEWS_INTELLIGENCE_UI_URI,
    name: "News Intelligence (interactive)",
    description: "Interactive in-conversation app shell for get_news_intelligence: renders AI-classified top stories (title, category, alert flag, country, source) from WorldMonitor's intelligence layer. Linked from the get_news_intelligence tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Static, data-free template \u2014 public and quota-exempt.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: buildUiMeta(),
    html: NEWS_INTELLIGENCE_APP_HTML
  },
  {
    uri: CONFLICT_EVENTS_UI_URI,
    name: "Conflict Events (interactive)",
    description: "Interactive in-conversation app shell for get_conflict_events: renders active armed-conflict events (belligerents, violence type, country, fatalities, date) from the UCDP feed. Linked from the get_conflict_events tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Static, data-free template \u2014 public and quota-exempt.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: buildUiMeta(),
    html: CONFLICT_EVENTS_APP_HTML
  },
  {
    uri: NATURAL_DISASTERS_UI_URI,
    name: "Natural Disasters (interactive)",
    description: "Interactive in-conversation app shell for get_natural_disasters: groups recent M4.5+ earthquakes (USGS and Earthquakes Canada / NRCan: magnitude, place, time, source) and active wildfires (NASA FIRMS). Linked from the get_natural_disasters tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Static, data-free template \u2014 public and quota-exempt.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: buildUiMeta(),
    html: NATURAL_DISASTERS_APP_HTML
  },
  {
    uri: PREDICTION_MARKETS_UI_URI,
    name: "Prediction Markets (interactive)",
    description: "Interactive in-conversation app shell for get_prediction_markets: renders active event-contract odds grouped by category (geopolitical, tech, finance) with a probability bar per market. Linked from the get_prediction_markets tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Static, data-free template \u2014 public and quota-exempt.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: buildUiMeta(),
    html: PREDICTION_MARKETS_APP_HTML
  },
  {
    uri: FORECASTS_UI_URI,
    name: "Forecasts (interactive)",
    description: "Interactive in-conversation app shell for get_forecast_predictions: renders WorldMonitor's AI-generated forecasts with local domain/region filters and original case analysis. Analysis expansion loads original cases; Active theaters loads latest original theater summaries under the same signed forecast panel allocation, with independent run/time and completion coverage. Provided full cases and loaded theater details expand locally. Linked from the get_forecast_predictions tool via _meta.ui.resourceUri; an MCP-Apps host renders it inline and streams the tool result in via postMessage. Static, data-free template \u2014 public and quota-exempt.",
    mimeType: UI_RESOURCE_MIME_TYPE2,
    _meta: buildUiMeta(),
    html: FORECASTS_APP_HTML
  }
];
var UI_RESOURCE_BY_URI = new Map(UI_RESOURCE_REGISTRY.map((r) => [r.uri, r]));
function isUiResourceUri(uri) {
  return uri === PREVIOUS_COUNTRY_RISK_UI_URI || uri === PREVIOUS_COUNTRY_BRIEF_UI_URI || uri === LEGACY_COUNTRY_BRIEF_UI_URI || uri === LEGACY_COUNTRY_RISK_UI_URI || uri === LEGACY_WORLD_BRIEF_UI_URI || uri === LEGACY_CHOKEPOINT_MONITOR_UI_URI || uri === PREVIOUS_NEWS_INTELLIGENCE_UI_URI || uri === LEGACY_NEWS_INTELLIGENCE_UI_URI || uri === LEGACY_CONFLICT_EVENTS_UI_URI || uri === PREVIOUS_NATURAL_DISASTERS_UI_URI || uri === LEGACY_NATURAL_DISASTERS_UI_URI || uri === PREVIOUS_PREDICTION_MARKETS_UI_URI || uri === LEGACY_PREDICTION_MARKETS_UI_URI || uri === PREVIOUS_FORECASTS_UI_URI || uri === LEGACY_FORECASTS_V2_UI_URI || uri === LEGACY_FORECASTS_UI_URI || uri === PREVIOUS_MARKET_RADAR_UI_URI || uri === PREVIOUS_COUNTRY_VIEW_UI_URI || uri === PREVIOUS_NEWS_DASHBOARD_UI_URI || uri === LEGACY_MARKET_RADAR_UI_URI || uri === COUNTRY_VIEW_UI_URI || uri === NEWS_DASHBOARD_UI_URI || uri === LEGACY_COUNTRY_VIEW_UI_URI || uri === LEGACY_NEWS_DASHBOARD_UI_URI || UI_RESOURCE_BY_URI.has(uri);
}
var UI_RESOURCE_LIST_RESPONSE = UI_RESOURCE_REGISTRY.map((r) => ({
  uri: r.uri,
  name: r.name,
  description: r.description,
  mimeType: r.mimeType,
  _meta: r._meta
}));
async function buildUiResourceRead(id, uri, corsHeaders) {
  if (uri === MARKET_RADAR_UI_URI || uri === PREVIOUS_MARKET_RADAR_UI_URI || uri === LEGACY_MARKET_RADAR_UI_URI) return readMarketRadar(id, corsHeaders, uri);
  if (uri === COUNTRY_VIEW_UI_URI || uri === PREVIOUS_COUNTRY_VIEW_UI_URI || uri === LEGACY_COUNTRY_VIEW_UI_URI) return readCountryView(id, corsHeaders, uri);
  if (uri === NEWS_DASHBOARD_UI_URI || uri === PREVIOUS_NEWS_DASHBOARD_UI_URI || uri === LEGACY_NEWS_DASHBOARD_UI_URI) return readNewsDashboard(id, corsHeaders, uri);
  const canonicalUri = uri === PREVIOUS_COUNTRY_RISK_UI_URI || uri === LEGACY_COUNTRY_RISK_UI_URI ? COUNTRY_RISK_UI_URI : uri === LEGACY_WORLD_BRIEF_UI_URI ? WORLD_BRIEF_UI_URI : uri === PREVIOUS_COUNTRY_BRIEF_UI_URI || uri === LEGACY_COUNTRY_BRIEF_UI_URI ? COUNTRY_BRIEF_UI_URI : uri === LEGACY_CHOKEPOINT_MONITOR_UI_URI ? CHOKEPOINT_MONITOR_UI_URI : uri === PREVIOUS_NEWS_INTELLIGENCE_UI_URI || uri === LEGACY_NEWS_INTELLIGENCE_UI_URI ? NEWS_INTELLIGENCE_UI_URI : uri === LEGACY_CONFLICT_EVENTS_UI_URI ? CONFLICT_EVENTS_UI_URI : uri === PREVIOUS_NATURAL_DISASTERS_UI_URI || uri === LEGACY_NATURAL_DISASTERS_UI_URI ? NATURAL_DISASTERS_UI_URI : uri === LEGACY_PREDICTION_MARKETS_UI_URI || uri === PREVIOUS_PREDICTION_MARKETS_UI_URI ? PREDICTION_MARKETS_UI_URI : uri === LEGACY_FORECASTS_UI_URI || uri === PREVIOUS_FORECASTS_UI_URI || uri === LEGACY_FORECASTS_V2_UI_URI ? FORECASTS_UI_URI : uri;
  const def = UI_RESOURCE_BY_URI.get(canonicalUri);
  if (!def) {
    return rpcError(id, -32602, `Unknown ui:// resource "${uri}".`, corsHeaders);
  }
  return rpcOk(
    id,
    { contents: [{ uri: uri === LEGACY_PREDICTION_MARKETS_UI_URI || uri === PREVIOUS_PREDICTION_MARKETS_UI_URI ? def.uri : uri, mimeType: def.mimeType, text: def.html, _meta: def._meta }] },
    corsHeaders
  );
}
UI_RESOURCE_LIST_RESPONSE.push({
  uri: NEWS_DASHBOARD_UI_URI,
  name: "WorldMonitor news and maps",
  description: "WorldMonitor news panels and interactive map, rendered with the dashboard components.",
  mimeType: UI_RESOURCE_MIME_TYPE2,
  _meta: NEWS_DASHBOARD_META
});
UI_RESOURCE_LIST_RESPONSE.push({
  uri: COUNTRY_VIEW_UI_URI,
  name: "WorldMonitor country view",
  description: "Shared country deep dive with progressive authenticated sections.",
  mimeType: UI_RESOURCE_MIME_TYPE2,
  _meta: COUNTRY_VIEW_META
});
export {
  CHOKEPOINT_MONITOR_UI_URI,
  CONFLICT_EVENTS_UI_URI,
  COUNTRY_BRIEF_UI_URI,
  COUNTRY_RISK_UI_URI,
  FORECASTS_UI_URI,
  MARKET_RADAR_UI_URI,
  NATURAL_DISASTERS_UI_URI,
  NEWS_INTELLIGENCE_UI_URI,
  PREDICTION_MARKETS_UI_URI,
  UI_RESOURCE_LIST_RESPONSE,
  UI_RESOURCE_MIME_TYPE2 as UI_RESOURCE_MIME_TYPE,
  UI_RESOURCE_REGISTRY,
  WORLD_BRIEF_UI_URI,
  buildUiResourceRead,
  isUiResourceUri
};
