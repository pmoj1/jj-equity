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

// api/mcp/ui/news-intelligence-app.ts
var STYLES = `
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
var BODY = `
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
var RENDER = `
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
  styles: STYLES,
  body: BODY,
  renderBody: RENDER
});
export {
  NEWS_INTELLIGENCE_APP_HTML
};
