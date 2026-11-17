import { describe, expect, it } from "vitest";
import { providerState } from "./status";
describe("provider latest-state display", () => {
  it("does not call an unobserved provider healthy", () => { expect(providerState({ name: "feed", ok: 0, failed: 0, lastLatencyMs: null })).toBe("unobserved"); });
  it("does not treat historical successes as proof of recovery", () => { expect(providerState({ name: "feed", ok: 10, failed: 1, lastSuccess: 100, lastFailure: 200, lastLatencyMs: 10 })).toBe("degraded"); });
  it("uses the server's explicit state", () => { expect(providerState({ name: "feed", ok: 10, failed: 1, status: "unavailable", lastLatencyMs: 10 })).toBe("unavailable"); });
});
