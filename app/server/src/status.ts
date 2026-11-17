import { allStats } from "./providers/registry.js";
import { aiReadiness } from "./routes/ai.js";

/** Local configuration and past request observations, not a live health probe. */
export function applicationStatus() {
  const providers = allStats();
  const ai = aiReadiness();
  return {
    ok: true,
    time: new Date().toISOString(),
    product: { name: "J&J Equity", version: "1.3.0" },
    providers,
    ai: ai.configured,
    capabilities: {
      marketData: { configured: true, observedProviders: providers.length },
      portfolio: { available: true, storage: "local" },
      ai,
    },
    observationNote: "Provider states reflect the last request observed by this process. Configuration is not proof of access or current feed health.",
  };
}
