// shared/mcp-attribution.ts
var MCP_UPGRADE_UTM_SOURCE = "mcp";
var MCP_UPGRADE_UTM_MEDIUM = "agent";
var MCP_UPGRADE_UTM_CAMPAIGN = "mcp-paid-funnel";
var MCP_ATTRIBUTION_SOURCE = MCP_UPGRADE_UTM_CAMPAIGN;
var MCP_UPGRADE_URL = `https://worldmonitor.app/pro?utm_source=${MCP_UPGRADE_UTM_SOURCE}&utm_medium=${MCP_UPGRADE_UTM_MEDIUM}&utm_campaign=${MCP_UPGRADE_UTM_CAMPAIGN}`;
function isMcpAttributionSource(value) {
  return value === MCP_ATTRIBUTION_SOURCE;
}
function normalizeCheckoutAttributionSource(value) {
  if (typeof value !== "string") return void 0;
  const trimmed = value.trim();
  return isMcpAttributionSource(trimmed) ? trimmed : void 0;
}
function readMcpAttributionFromSearch(search) {
  const normalized = search.startsWith("?") || search.startsWith("#") ? search.slice(1) : search;
  const campaign = new URLSearchParams(normalized).get("utm_campaign");
  return isMcpAttributionSource(campaign) ? campaign : void 0;
}

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

// api/mcp/checkout.ts
var START_UPGRADE_TOOL = "start_upgrade";
var PLANS = product_catalog_generated_default.facts.plans;
var PRODUCTS = product_catalog_generated_default.products;
var MCP_CHECKOUT_PLANS = PLANS.filter((plan) => plan.selfServe && plan.currentForCheckout).map((plan) => plan.planKey);
var NEXT_PLAN_BY_TIER_GROUP = {
  free: "pro_monthly",
  pro: "pro_business_monthly",
  api_starter: "api_business"
};
function recommendedPlanFor(planKey) {
  const tierGroup = PLANS.find((plan) => plan.planKey === planKey)?.tierGroup;
  const next = tierGroup === void 0 ? void 0 : NEXT_PLAN_BY_TIER_GROUP[tierGroup];
  return next !== void 0 && MCP_CHECKOUT_PLANS.includes(next) ? next : void 0;
}

// api/mcp/upgrade.ts
var UPGRADEABLE_REASONS = /* @__PURE__ */ new Set([
  "allowance-exhausted",
  "upgrade-required",
  "quota-exceeded"
]);
function checkoutHint(denial) {
  if (!UPGRADEABLE_REASONS.has(denial.reason) || denial.upgradeFrom === void 0) return {};
  const recommendedPlan = recommendedPlanFor(denial.upgradeFrom);
  if (recommendedPlan === void 0) return {};
  return denial.upgradeFrom === "free" ? { recommendedPlan, checkoutTool: START_UPGRADE_TOOL } : { recommendedPlan };
}
var DENIAL_COPY = {
  "no-account": {
    message: "Authentication required to call this tool.",
    // The first denial a cold agent reads. Name both free paths before Pro;
    // pointing only at the upgrade URL sent agents to checkout when a free
    // account and the credential-free get_sources tool were available.
    nextStep: "Connect via OAuth (see the WWW-Authenticate header) to sign in with a free account, or call get_sources, which needs no credential. Subscribe to Pro at the upgrade URL for the full daily allowance."
  },
  "allowance-exhausted": {
    message: "Free-account MCP allowance exhausted for today.",
    nextStep: "Wait until the next UTC day for another free allowance window, or upgrade to Pro for a higher daily limit."
  },
  // #6716 F1: the free allowance covers cache-backed tools only. Tools with a
  // downstream `_execute` are re-gated by server/gateway.ts's own
  // checkProMcpAccess, which this feature deliberately does not relax — so a
  // free caller must be refused HERE, before a slot is charged on a call the
  // gateway will reject. Terminal until upgrade: retrying and re-authenticating
  // both fail, which is why this rides the 403 envelope, not 401 or 429.
  "upgrade-required": {
    message: "This tool requires a WorldMonitor Pro subscription.",
    nextStep: "The free allowance covers cached-data tools only. Call one of those, or subscribe to Pro at the upgrade URL for the full tool set."
  },
  // The lapsed MESSAGE is owned by getMcpBillingVerificationDenial (it keeps the
  // "Re-authenticating will not help" clause the error catalog documents); only
  // `nextStep` and `upgradeUrl` from here reach the wire for this reason. Do not
  // say "reconnect MCP" — that is the OAuth retry this envelope exists to prevent.
  "lapsed-subscription": {
    message: "Your WorldMonitor Pro subscription is no longer active.",
    nextStep: "Resubscribe at the upgrade URL. The existing credential stays valid \u2014 re-authenticating will not restore access."
  }
};
function buildMcpStructuredDenial(denial) {
  if (denial.reason === "quota-exceeded") {
    return {
      // Byte-identical to the copy this denial has always carried, because
      // docs/mcp-error-catalog.mdx publishes it and clients string-match it.
      // What changes is that the same two facts now also ride `data`.
      message: `Daily MCP quota exceeded (${denial.limit}/day). Resets at next UTC midnight.`,
      data: {
        reason: denial.reason,
        nextStep: denial.sharedWithRestApi ? "This allowance is shared with your REST API requests, so REST traffic spends it too \u2014 the exhaustion may not be your tool calls. Wait for the next UTC day, or upgrade at the upgrade URL for a higher daily limit." : "Wait for the next UTC day, or upgrade at the upgrade URL for a higher daily limit.",
        upgradeUrl: MCP_UPGRADE_URL,
        limit: denial.limit,
        sharedWithRestApi: denial.sharedWithRestApi,
        ...checkoutHint(denial)
      }
    };
  }
  const copy = DENIAL_COPY[denial.reason];
  return {
    message: copy.message,
    data: {
      reason: denial.reason,
      nextStep: copy.nextStep,
      upgradeUrl: MCP_UPGRADE_URL,
      ...checkoutHint(denial)
    }
  };
}
export {
  MCP_ATTRIBUTION_SOURCE,
  MCP_UPGRADE_URL,
  MCP_UPGRADE_UTM_CAMPAIGN,
  MCP_UPGRADE_UTM_MEDIUM,
  MCP_UPGRADE_UTM_SOURCE,
  buildMcpStructuredDenial,
  isMcpAttributionSource,
  normalizeCheckoutAttributionSource,
  readMcpAttributionFromSearch
};
