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

// api/mcp/ui/country-brief-app.ts
var STYLES = `
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
var BODY = `
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
var RENDER = `
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
  styles: STYLES,
  body: BODY,
  renderBody: RENDER
});
export {
  COUNTRY_BRIEF_APP_HTML
};
