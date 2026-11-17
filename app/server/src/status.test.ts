import { afterEach, describe, expect, it, vi } from "vitest";
import { applicationStatus } from "./status.js";
afterEach(() => vi.unstubAllEnvs());
describe("application readiness", () => {
  it("reports configuration separately from provider access and never returns credentials", () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "private-test-only-value"); vi.stubEnv("ANTHROPIC_MODEL", "");
    const status = applicationStatus();
    expect(status).toMatchObject({ product: { name: "J&J Equity" }, ai: false, capabilities: { ai: { keyConfigured: true, configured: false, model: null } } });
    expect(JSON.stringify(status)).not.toContain("private-test-only-value");
    vi.stubEnv("ANTHROPIC_MODEL", "test-model");
    expect(applicationStatus()).toMatchObject({ ai: true, capabilities: { ai: { model: "test-model", configured: true } } });
  });
});
