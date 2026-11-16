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
var UI_CONNECT_DOMAINS = ["https://worldmonitor.app", "https://www.worldmonitor.app"];
var UI_FRAME_ANCESTORS = ["https://chatgpt.com", "https://claude.ai", "https://claude.com"];
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
export {
  CHOKEPOINT_MONITOR_APP_HTML
};
