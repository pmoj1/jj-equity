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

// api/mcp/ui/shell.ts
var UI_RESOURCE_MIME_TYPE = "text/html;profile=mcp-app";
var UI_CONNECT_DOMAINS = ["https://worldmonitor.app", "https://www.worldmonitor.app"];
var UI_FRAME_ANCESTORS = ["https://chatgpt.com", "https://claude.ai", "https://claude.com"];
var SHARED_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; connect-src 'self' " + UI_CONNECT_DOMAINS.join(" ") + "; frame-ancestors " + UI_FRAME_ANCESTORS.join(" ") + "; form-action 'none'; base-uri 'none'";

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
export {
  LEGACY_MARKET_RADAR_UI_URI,
  PREVIOUS_MARKET_RADAR_UI_URI,
  readMarketRadar
};
