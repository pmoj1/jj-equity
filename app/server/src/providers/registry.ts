export type ProviderStats = {
  name: string;
  ok: number;
  failed: number;
  lastLatencyMs: number | null;
  avgLatencyMs: number | null;
  lastError: string | null;
  lastSuccess: string | null;
  lastAttempt: string | null;
  lastFailure: string | null;
  status: "available" | "degraded" | "unavailable" | "unobserved";
};

const stats = new Map<string, ProviderStats>();

function getStats(name: string): ProviderStats {
  let s = stats.get(name);
  if (!s) {
    s = { name, ok: 0, failed: 0, lastLatencyMs: null, avgLatencyMs: null, lastError: null, lastSuccess: null, lastAttempt: null, lastFailure: null, status: "unobserved" };
    stats.set(name, s);
  }
  return s;
}

/** Run fn while recording latency/health for the named provider. */
export async function tracked<T>(provider: string, fn: () => Promise<T>): Promise<T> {
  const s = getStats(provider);
  const t0 = Date.now();
  s.lastAttempt = new Date(t0).toISOString();
  try {
    const result = await fn();
    const ms = Date.now() - t0;
    s.ok++;
    s.lastLatencyMs = ms;
    s.avgLatencyMs = s.avgLatencyMs === null ? ms : Math.round(s.avgLatencyMs * 0.8 + ms * 0.2);
    s.lastSuccess = new Date().toISOString();
    s.lastError = null;
    s.status = "available";
    return result;
  } catch (err) {
    s.failed++;
    s.lastFailure = new Date().toISOString();
    s.status = s.lastSuccess ? "degraded" : "unavailable";
    // Public readiness must never echo a provider URL, query, request body or secret.
    const message = err instanceof Error ? err.message : String(err);
    const status = message.match(/\b(?:HTTP|status|nasdaq|yahoo|fred|ecb|binance|coingecko)\s*[:=]?\s*(\d{3})\b/i)?.[1];
    s.lastError = status ? `Provider request failed (HTTP ${status}).` : "Provider request failed.";
    throw err;
  }
}

/** Try each provider in order; return the first success. */
export async function withFallback<T>(attempts: Array<[string, () => Promise<T>]>): Promise<T> {
  let lastErr: unknown = new Error("no providers configured");
  for (const [name, fn] of attempts) {
    try {
      return await tracked(name, fn);
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr;
}

export function allStats(): ProviderStats[] {
  return [...stats.values()].map((entry) => ({ ...entry }));
}
