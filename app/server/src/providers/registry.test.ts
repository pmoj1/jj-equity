import { describe, expect, it, vi } from "vitest";
import { allStats, tracked } from "./registry.js";
describe("provider observations", () => {
  it("records failure, recovery and degraded state without exposing error data", async () => {
    await expect(tracked("test-provider", async () => { throw new Error("HTTP 429 https://provider.invalid?api_key=private-value"); })).rejects.toThrow();
    let stats = allStats().find((s) => s.name === "test-provider")!;
    expect(stats).toMatchObject({ status: "unavailable", failed: 1, ok: 0, lastError: "Provider request failed (HTTP 429)." });
    expect(JSON.stringify(stats)).not.toContain("private-value");
    await tracked("test-provider", async () => 42);
    stats = allStats().find((s) => s.name === "test-provider")!;
    expect(stats).toMatchObject({ status: "available", lastError: null, ok: 1 });
    await expect(tracked("test-provider", async () => { throw new Error("down"); })).rejects.toThrow();
    expect(allStats().find((s) => s.name === "test-provider")).toMatchObject({ status: "degraded", failed: 2 });
  });
  it("returns snapshots rather than references that callers can mutate", async () => {
    await tracked("snapshot-provider", async () => true);
    allStats().find((s) => s.name === "snapshot-provider")!.ok = 999;
    expect(allStats().find((s) => s.name === "snapshot-provider")!.ok).toBe(1);
  });
});
