export type ProviderStatus = {
  name: string; ok: number; failed: number; lastLatencyMs: number | null;
  status?: "unobserved" | "available" | "degraded" | "unavailable";
  lastSuccess?: number | string | null; lastFailure?: number | string | null; lastError?: string | null;
};
export type ServiceStatus = {
  ok: boolean; time?: string; providers: ProviderStatus[]; ai: boolean;
  product?: { name: string; version: string };
  capabilities?: {
    marketData?: { configured: boolean; observedProviders: number };
    portfolio?: { available: boolean; storage: string };
    ai?: { configured: boolean; keyConfigured?: boolean; model: string | null };
  };
};
function stamp(value: number | string | null | undefined): number {
  return typeof value === "number" ? value : typeof value === "string" ? Date.parse(value) || 0 : 0;
}
export function providerState(provider: ProviderStatus): NonNullable<ProviderStatus["status"]> {
  if (provider.status) return provider.status;
  if (!provider.ok && !provider.failed) return "unobserved";
  if (stamp(provider.lastFailure) > stamp(provider.lastSuccess)) return provider.ok ? "degraded" : "unavailable";
  if (!provider.ok) return "unavailable";
  // Older servers do not provide timing: a failure count cannot establish current recovery.
  return provider.failed && !provider.lastSuccess ? "degraded" : "available";
}
