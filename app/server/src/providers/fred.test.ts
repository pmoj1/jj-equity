import { afterEach, describe, expect, it, vi } from "vitest";
import { series } from "./fred.js";
afterEach(() => vi.unstubAllGlobals());
describe("FRED missing values", () => {
  it("keeps real zero observations while discarding missing cells instead of inventing zero", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, text: async () => "DATE,VALUE\n2026-01-01,\n2026-01-02,.\n2026-01-03,0\n2026-01-04,4.25\ninvalid,3\n" }));
    expect(await series("TEST")).toEqual([{ date: "2026-01-03", value: 0 }, { date: "2026-01-04", value: 4.25 }]);
  });
});
