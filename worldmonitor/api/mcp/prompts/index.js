// api/mcp/prompts/index.ts
var PROMPT_REGISTRY = [
  {
    name: "country-view",
    description: "Interactive country brief with assessment, resilience, energy, trade, security and source evidence. Text-only clients can use the existing data tools.",
    arguments: [
      {
        name: "iso2",
        description: `Country designator, substituted into the tools' country_code: an ISO 3166-1 alpha-2 code (e.g. "DE"), an alpha-3 code ("DEU"), or an English country name ("Germany"). Case-insensitive.`,
        required: true
      }
    ],
    steps: [{
      tool: "open_country_brief",
      args: { country_code: "${iso2}" },
      jmespath: "{countryCode: countryCode, topic: topic}",
      purpose: "Open the embedded country interface. Its sections load through the authenticated host and keep their observation dates and source states."
    }],
    intro: "Open the WorldMonitor country brief for ${iso2} with the linked interactive view. Use its topic tabs and evidence rather than replacing the interface with paragraphs. If the user explicitly requests text only or the host cannot render apps, use get_country_risk, get_country_brief and get_country_macro for a labeled text assessment."
  },
  {
    name: "country-briefing",
    description: "Multi-tool country brief: quantitative risk score + LLM-synthesised intelligence brief + macro indicators for a single ISO 3166-1 alpha-2 country.",
    arguments: [
      {
        name: "iso2",
        description: `Country designator, substituted into the tools' country_code: an ISO 3166-1 alpha-2 code (e.g. "DE"), an alpha-3 code ("DEU"), or an English country name ("Germany"). Case-insensitive.`,
        required: true
      }
    ],
    steps: [
      {
        tool: "get_country_risk",
        args: { country_code: "${iso2}" },
        jmespath: "{cii: cii.combinedScore, trend: cii.trend, components: cii.components, advisoryLevel: advisoryLevel, sanctionsActive: sanctionsActive, sanctionsCount: sanctionsCount, upstreamUnavailable: upstreamUnavailable}",
        purpose: "Quantitative Composite Instability Index (CII) + component breakdown + travel advisory + OFAC sanctions exposure. upstreamUnavailable is projected so an all-upstreams-down response is not read as a calm country."
      },
      {
        tool: "get_country_brief",
        args: { country_code: "${iso2}" },
        jmespath: "{countryCode: countryCode, brief: brief}",
        purpose: "LLM-synthesised geopolitical + economic narrative grounded on the latest headlines."
      },
      {
        tool: "get_country_macro",
        args: { countries: ["${iso2}"] },
        jmespath: "{macro: data.macro.countries, growth: data.growth.countries, labor: data.labor.countries}",
        purpose: "IMF WEO macro/growth/labor indicators (one-country slice; external excluded \u2014 broad WEO retraction 2026-04)."
      }
    ],
    intro: "Build a country briefing for ${iso2}. Execute the three steps below in order; combine the results into a single concise brief (CII score and components, travel/sanctions posture, the LLM brief, then the key macro indicators)."
  },
  {
    name: "energy-shock-watch",
    description: "Active energy supply disruptions, fuel shortages, and government crisis policies. Optional country filter narrows the country-keyed slices; omit for a global view.",
    arguments: [
      {
        name: "country",
        description: 'Optional ISO 3166-1 alpha-2 country code to focus on (e.g. "DE", "IN"). Omit for the global energy bundle.',
        required: false
      }
    ],
    steps: [
      {
        tool: "get_energy_intelligence",
        args: { country: "${country}" },
        jmespath: '{disruptions: data.disruptions.events, fuel_shortages: data."fuel-shortages".shortages, crisis_policies: data."crisis-policies".policies}',
        purpose: "Active disruptions + per-country fuel shortages + government crisis policies. Three slices of the energy bundle most relevant to a near-term shock."
      }
    ],
    intro: "Surface active energy disruptions, fuel shortages, and the government crisis-policy posture${country_suffix}. Call the step below, then summarise: are there active disruptions right now, and which countries / policies are in scope?",
    intro_substitutions: {
      country_suffix: { when_present: " for ${country}", when_absent: " (global view)" }
    }
  },
  {
    name: "market-open-prep",
    description: "Pre-market briefing: equity, commodity, and crypto quotes with per-symbol percent changes. Designed to be cheap to read \u2014 only changePercent + symbol are projected per asset class.",
    arguments: [],
    steps: [
      {
        tool: "get_market_data",
        args: { asset_class: ["equity", "commodity", "crypto"] },
        // The served key is `change` and it is already a percent; the
        // projection renames it so the agent reading the result cannot mistake
        // it for an absolute price delta.
        jmespath: '{equity: data."stocks-bootstrap".quotes[*].{symbol: symbol, changePercent: change}, commodity: data."commodities-bootstrap".quotes[*].{symbol: symbol, changePercent: change}, crypto: data.crypto.quotes[*].{symbol: symbol, changePercent: change}}',
        purpose: "Per-asset-class quote pairs (symbol + changePercent only). Skip ETF flows / sectors / Gulf / fear-greed \u2014 they belong in a deeper drill-down, not a session-opening read."
      }
    ],
    intro: "Prepare a market-open briefing. Call the step below to fetch equity, commodity, and crypto movers, then highlight the largest gainers and losers per asset class along with anything anomalous (e.g. correlated moves, single-name outliers)."
  },
  {
    name: "conflict-pulse",
    description: "Active conflict events (UCDP) + alert-flagged top news stories. Optional country filter narrows both feeds; omit for a global pulse.",
    arguments: [
      {
        name: "country",
        description: 'Optional country filter. UCDP event names use full country names ("United States"); news intelligence uses ISO 3166-1 alpha-2. Pass the most specific form that matches both \u2014 the postFilters are case-insensitive on substring/code respectively.',
        required: false
      }
    ],
    steps: [
      {
        tool: "get_conflict_events",
        args: { country: "${country}", min_fatalities: 1 },
        jmespath: 'data."ucdp-events".events',
        purpose: "UCDP armed-conflict events (\u22651 fatality) \u2014 the canonical low-noise feed for hot conflicts."
      },
      {
        tool: "get_news_intelligence",
        args: { country: "${country}", alerts_only: true },
        jmespath: "data.insights.topStories",
        purpose: "Alert-flagged top stories only \u2014 high signal-to-noise filter on the news layer."
      }
    ],
    intro: "Read the current conflict pulse${country_suffix}. Run both steps below and synthesise: where are the active conflict events, and what alert-flagged stories cluster with them? Be specific about geographies and sides.",
    intro_substitutions: {
      country_suffix: { when_present: " for ${country}", when_absent: " (global view)" }
    }
  },
  {
    name: "route-risk-check",
    description: 'Maritime chokepoint transit summary + risk posture for a single chokepoint (e.g. "hormuz", "suez", "malacca", "bab-el-mandeb", "panama"). The filter is case-insensitive substring against the chokepoint identifiers used by each dataset.',
    arguments: [
      {
        name: "chokepoint",
        description: 'Substring match against chokepoint identifiers \u2014 e.g. "hormuz" matches both "hormuz_strait" and "Strait of Hormuz". Use the most specific name you have.',
        required: true
      }
    ],
    steps: [
      {
        tool: "get_chokepoint_status",
        args: { chokepoint: "${chokepoint}" },
        jmespath: 'data."transit-summaries".summaries',
        purpose: "Per-chokepoint transit summary: today total / tanker / cargo, week-over-week change, risk level, incident count, disruption percentage, and a risk narrative."
      }
    ],
    intro: "Assess the current route risk for the ${chokepoint} chokepoint. Call the step below and surface: today's transit volume, week-over-week change, risk level + narrative, and any incidents in the trailing 7 days. Flag explicitly if the dataAvailable field is false."
  },
  {
    name: "freshness-audit",
    description: "Quick audit of cache freshness across three high-cadence cache tools. Reads each envelope's cached_at + stale flag (no full data payload) so the operator can see at a glance whether the bootstrap pipeline is up to date.",
    arguments: [],
    steps: [
      {
        tool: "get_market_data",
        args: { summary: true },
        jmespath: "{cached_at: cached_at, stale: stale}",
        purpose: "Market-data envelope freshness (10-min cadence on equity quotes; stale if any contributing key is older than its per-key budget)."
      },
      {
        tool: "get_energy_intelligence",
        args: { summary: true },
        jmespath: "{cached_at: cached_at, stale: stale}",
        purpose: "Energy bundle envelope freshness (multi-cadence \u2014 EIA daily, Ember daily, gas-storage daily, World Bank annual)."
      },
      {
        tool: "get_chokepoint_status",
        args: { summary: true },
        jmespath: "{cached_at: cached_at, stale: stale}",
        purpose: "Chokepoint transit-summary envelope freshness (10-min relay cadence on the live transit feeds)."
      }
    ],
    intro: "Audit the bootstrap pipeline freshness across markets, energy, and maritime chokepoints. For each step below, project ONLY the envelope (cached_at + stale) \u2014 the summary: true flag collapses the payload so this stays cheap. Then report a one-line freshness verdict per tool."
  },
  {
    name: "trade-exposure-check",
    description: "US import exposure for one product from one partner: the US duty in force today (live HTS plus any Section 301 and 232 duties), then the bilateral schedule rate and the five-year applied-average trend for context. The schedule steps end around 2023 and exclude unilateral duties.",
    arguments: [
      {
        name: "partner",
        description: 'Exporting country: a name ("China"), an ISO alpha-2 or alpha-3 code ("CN", "CHN"), or a 3-digit UN M49 code ("156").',
        required: true
      },
      {
        name: "hs_code",
        description: '6-digit HS product code, e.g. "870380" (dots are ignored: "8703.80").',
        required: true
      }
    ],
    steps: [
      {
        tool: "get_us_import_duty",
        args: { hs_code: "${hs_code}", partner: "${partner}" },
        jmespath: "{htsRelease: htsRelease, additionalDutiesLoaded: additionalDutiesLoaded, upstreamUnavailable: upstreamUnavailable, unavailableReason: unavailableReason, rateBasis: coverage.rateBasis, includesUnilateralDuties: coverage.includesUnilateralDuties, excludedDutyTypes: coverage.excludedDutyTypes, lines: lines[*].{htsCode: htsCode, baseRate: baseRate, preferenceProgram: preferenceProgram, unresolvedPrograms: unresolvedPrograms, estimatedRate: estimatedRate, estimateComplete: estimateComplete, additionalDuties: additionalDuties[*].{heading: heading, program: program, addedRate: addedRate, topUpTo: topUpTo, status: status, condition: condition}}}",
        purpose: "The US duty in force today for each 8-digit line under ${hs_code} from ${partner}: base rate, estimated total rate, whether that estimate is complete, and each Section 301 or 232 duty with its status (APPLIES, CONDITIONAL, EXEMPT, SCHEDULED)."
      },
      {
        tool: "get_bilateral_tariff",
        args: { reporter: "840", partner: "${partner}", hs_code: "${hs_code}" },
        jmespath: "{year: year, basis: basis, appliedRate: appliedRate.{rate: rate, tariffLines: tariffLines, nonAdValoremLines: nonAdValoremLines}, mfnRate: mfnRate.{rate: rate, tariffLines: tariffLines, nonAdValoremLines: nonAdValoremLines}, mfnAveRate: mfnAveRate.{rate: rate, tariffLines: tariffLines, nonAdValoremLines: nonAdValoremLines}, upstreamUnavailable: upstreamUnavailable, unavailableReason: unavailableReason, rateBasis: coverage.rateBasis, latestYear: coverage.latestYear}",
        purpose: "The US schedule rate on ${hs_code} from ${partner} in the latest year with data: applied rate, MFN rate, the MFN ad valorem equivalent and which one applied, each with its line counts. Schedule history only, with no Section 301 or 232 duties."
      },
      {
        tool: "get_tariff_averages",
        args: { reporter: "840", partner: "${partner}", years: 5 },
        jmespath: "{datapoints: datapoints[*].{year: year, tariffRate: tariffRate, weightedRate: weightedRate}, upstreamUnavailable: upstreamUnavailable, unavailableReason: unavailableReason, rateBasis: coverage.rateBasis, latestYear: coverage.latestYear}",
        purpose: "Five years of the average US applied tariff on all goods from ${partner}, simple and import-weighted. Schedule history only, with no Section 301 or 232 duties."
      }
    ],
    intro: "Check US import exposure for HS ${hs_code} from ${partner}. Step 1 is the duty in force today; it includes Section 301 and 232 duties only when additionalDutiesLoaded is true, so say so when it is false. Lead with the step 1 estimated rate and whether it is complete, then list each additional duty with its status. When estimateComplete is false the estimated rate is a floor: it adds only APPLIES duties, and a specific (non-ad-valorem) duty, a CONDITIONAL duty or an unresolved preference program leaves the total open. Even a complete estimate leaves out the excludedDutyTypes (IEEPA, anti-dumping, countervailing), so never call it the all-in duty. Steps 2 and 3 are schedule history through about 2023 that excludes unilateral duties: use them for context and trend, never as the current rate, and quote the data year with any schedule rate. A step 2 rate with tariffLines 0, or a null rate, is absent, and one with nonAdValoremLines above 0 leaves out specific duties, so never read either as 0%. Step 3 is the average over all goods from ${partner}, not a rate for this product. If any step returns upstreamUnavailable true or an unavailableReason ending in UPSTREAM_UNAVAILABLE, report a temporary outage to retry later, never a zero rate. If any step returns an unavailableReason ending in NOT_COVERED, say the data does not cover it; step 3 can still answer when step 2 is not covered."
  }
];
var TOKEN_RE = /\$\{([^}]*)\}/g;
var MAX_PROMPT_ARG_LENGTH = 200;
function collectTokens(s) {
  const out = [];
  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(s)) !== null) out.push(m[1] ?? "");
  return out;
}
function collectTokensFromValue(v, sink) {
  if (typeof v === "string") {
    for (const t of collectTokens(v)) sink.push(t);
    return;
  }
  if (Array.isArray(v)) {
    for (const x of v) collectTokensFromValue(x, sink);
    return;
  }
  if (v !== null && typeof v === "object") {
    for (const x of Object.values(v)) collectTokensFromValue(x, sink);
  }
}
function substituteString(s, values) {
  return s.replace(TOKEN_RE, (_, name) => values[name] ?? "");
}
function substituteValue(v, values) {
  if (typeof v === "string") return substituteString(v, values);
  if (Array.isArray(v)) return v.map((x) => substituteValue(x, values));
  if (v !== null && typeof v === "object") {
    const out = {};
    for (const [k, val] of Object.entries(v)) {
      out[k] = substituteValue(val, values);
    }
    return out;
  }
  return v;
}
function applyIntroSubstitutions(intro, intro_substitutions, values) {
  if (!intro_substitutions) return intro;
  let out = intro;
  for (const [tokenName, spec] of Object.entries(intro_substitutions)) {
    const argsReferenced = [
      ...collectTokens(spec.when_present),
      ...collectTokens(spec.when_absent)
    ];
    const isPresent = argsReferenced.some((arg) => (values[arg] ?? "").length > 0);
    const replacement = isPresent ? spec.when_present : spec.when_absent;
    out = out.split("${" + tokenName + "}").join(replacement);
  }
  return out;
}
function buildPromptResponse(promptName, providedArgs) {
  if (providedArgs !== void 0 && (providedArgs === null || typeof providedArgs !== "object" || Array.isArray(providedArgs) || Object.values(providedArgs).some((value) => typeof value !== "string"))) {
    return { ok: false, code: -32602, message: "Invalid params: prompt arguments must be an object with string values" };
  }
  const args = providedArgs;
  const prompt = PROMPT_REGISTRY.find((p) => p.name === promptName);
  if (!prompt) {
    return { ok: false, code: -32602, message: `Unknown prompt: ${promptName}` };
  }
  const values = {};
  for (const arg of prompt.arguments) {
    const value = args?.[arg.name];
    if (value === void 0 || value === "") {
      if (arg.required) {
        return { ok: false, code: -32602, message: `Missing required argument "${arg.name}" for prompt "${promptName}"` };
      }
      values[arg.name] = "";
      continue;
    }
    if (value.length > MAX_PROMPT_ARG_LENGTH) {
      return {
        ok: false,
        code: -32602,
        message: `Argument "${arg.name}" for prompt "${promptName}" exceeds the ${MAX_PROMPT_ARG_LENGTH}-character limit`
      };
    }
    values[arg.name] = value;
  }
  const renderedIntro = substituteString(
    applyIntroSubstitutions(prompt.intro, prompt.intro_substitutions, values),
    values
  );
  const lines = [renderedIntro, ""];
  prompt.steps.forEach((step, i) => {
    const rawArgs = substituteValue(step.args, values);
    const renderedArgs = Object.fromEntries(
      Object.entries(rawArgs).filter(([, v]) => v !== "")
    );
    lines.push(`Step ${i + 1} \u2014 ${step.tool}`);
    lines.push(`  purpose: ${substituteString(step.purpose, values)}`);
    lines.push(`  arguments: ${JSON.stringify(renderedArgs)}`);
    lines.push(`  jmespath: ${step.jmespath}`);
    lines.push("");
  });
  return {
    ok: true,
    description: prompt.description,
    messages: [
      { role: "user", content: { type: "text", text: lines.join("\n").trimEnd() } }
    ]
  };
}
function validatePromptRegistry() {
  const namesSeen = /* @__PURE__ */ new Set();
  for (const prompt of PROMPT_REGISTRY) {
    if (namesSeen.has(prompt.name)) {
      throw new Error(`api/mcp/prompts/index.ts: duplicate prompt name "${prompt.name}".`);
    }
    namesSeen.add(prompt.name);
    const argNames = /* @__PURE__ */ new Set();
    for (const arg of prompt.arguments) {
      if (argNames.has(arg.name)) {
        throw new Error(`api/mcp/prompts/index.ts: prompt "${prompt.name}" declares duplicate argument "${arg.name}".`);
      }
      argNames.add(arg.name);
    }
    const introTokens = new Set(prompt.intro_substitutions ? Object.keys(prompt.intro_substitutions) : []);
    const validateTokensIn = (where, s) => {
      for (const tok of collectTokens(s)) {
        if (!argNames.has(tok) && !introTokens.has(tok)) {
          throw new Error(`api/mcp/prompts/index.ts: prompt "${prompt.name}" ${where} references unknown token "\${${tok}}". Declared args: [${[...argNames].join(", ")}]${introTokens.size ? `; intro substitutions: [${[...introTokens].join(", ")}]` : ""}.`);
        }
      }
    };
    validateTokensIn("intro", prompt.intro);
    if (prompt.intro_substitutions) {
      for (const [name, spec] of Object.entries(prompt.intro_substitutions)) {
        for (const tok of collectTokens(spec.when_present)) {
          if (!argNames.has(tok)) {
            throw new Error(`api/mcp/prompts/index.ts: prompt "${prompt.name}" intro_substitutions.${name}.when_present references unknown token "\${${tok}}".`);
          }
        }
        for (const tok of collectTokens(spec.when_absent)) {
          if (!argNames.has(tok)) {
            throw new Error(`api/mcp/prompts/index.ts: prompt "${prompt.name}" intro_substitutions.${name}.when_absent references unknown token "\${${tok}}".`);
          }
        }
      }
    }
    for (const [i, step] of prompt.steps.entries()) {
      const sink = [];
      collectTokensFromValue(step.args, sink);
      for (const tok of sink) {
        if (!argNames.has(tok)) {
          throw new Error(`api/mcp/prompts/index.ts: prompt "${prompt.name}" step ${i + 1} (${step.tool}) args reference unknown token "\${${tok}}".`);
        }
      }
      validateTokensIn(`step ${i + 1} (${step.tool}) purpose`, step.purpose);
    }
  }
}
validatePromptRegistry();
var PROMPT_LIST_RESPONSE = PROMPT_REGISTRY.map((p) => ({
  name: p.name,
  description: p.description,
  arguments: p.arguments.map((a) => ({ ...a }))
}));
export {
  MAX_PROMPT_ARG_LENGTH,
  PROMPT_LIST_RESPONSE,
  PROMPT_REGISTRY,
  buildPromptResponse
};
