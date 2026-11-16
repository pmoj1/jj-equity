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

// api/mcp/ui/forecasts-app.ts
var STYLES = `
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
var BODY = `
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
var RENDER = `
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
  styles: STYLES,
  body: BODY,
  renderBody: RENDER
});
export {
  FORECASTS_APP_HTML
};
