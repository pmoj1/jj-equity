import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("../providers/nasdaq.js", async (original) => ({ ...await original<typeof import("../providers/nasdaq.js")>(), quote: vi.fn(), earningsSurprise: vi.fn(), history: vi.fn() }));
vi.mock("../providers/yahoo.js", async (original) => ({ ...await original<typeof import("../providers/yahoo.js")>(), quotes: vi.fn(), quoteFromChart: vi.fn() }));
vi.mock("../providers/stooq.js", async (original) => ({ ...await original<typeof import("../providers/stooq.js")>(), quote: vi.fn() }));
import { marketRouter, buildRecapSummary } from "./market.js";
import * as nasdaq from "../providers/nasdaq.js";
import * as yahoo from "../providers/yahoo.js";
import * as stooq from "../providers/stooq.js";
import { staleSet } from "../cache.js";
async function request(path: string, query: Record<string,string> = {}, params: Record<string,string> = {}) {
  const handler = (marketRouter as any).stack.find((l: any) => l.route?.path === path).route.stack[0].handle;
  const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  await handler({ path, query, params }, res); return res;
}
function failQuotes() {
  vi.mocked(nasdaq.quote).mockRejectedValue(new Error("down"));
  vi.mocked(yahoo.quotes).mockRejectedValue(new Error("down"));
  vi.mocked(yahoo.quoteFromChart).mockRejectedValue(new Error("down"));
  vi.mocked(stooq.quote).mockRejectedValue(new Error("down"));
}
afterEach(() => { vi.resetAllMocks(); });
describe("market evidence quality", () => {
  it("labels a recent stale quote without refreshing its observation or fetch time", async () => {
    failQuotes();
    const fetchedAt = new Date(Date.now() - 60000).toISOString();
    staleSet("quote:STALECHECK", { symbol: "STALECHECK", price: 100, pe: 1, source: "test", time: 1000, fetchedAt });
    const res = await request("/quotes", { symbols: "STALECHECK" });
    expect(res.json).toHaveBeenCalledWith([expect.objectContaining({ stale: true, fetchedAt, time: 1000 })]);
  });
  it("does not serve a quote cached longer than the 15-minute outage window", async () => {
    failQuotes();
    staleSet("quote:OLDCHECK", { symbol: "OLDCHECK", price: 100, fetchedAt: new Date(Date.now() - 3600000).toISOString() });
    expect((await request("/quotes", { symbols: "OLDCHECK" })).status).toHaveBeenCalledWith(502);
  });
  it("falls back when the first provider returns a missing price rather than stopping with unusable data", async () => {
    vi.mocked(nasdaq.quote).mockResolvedValue({ symbol: "PRICECHECK", price: null } as yahoo.Quote);
    vi.mocked(yahoo.quotes).mockResolvedValue([{ symbol: "PRICECHECK", price: 100, pe: 1, exchange: null, time: 1234 } as yahoo.Quote]);
    const res = await request("/quotes", { symbols: "PRICECHECK" });
    expect(res.json).toHaveBeenCalledWith([expect.objectContaining({ price: 100, stale: false, time: 1234, fetchedAt: expect.any(String) })]);
  });
  it("does not describe missing index changes as flat market performance", () => {
    const text = buildRecapSummary({ indexes: [], gainers: [], losers: [], vix: null });
    expect(text).toContain("unavailable");expect(text).not.toContain("little changed");expect(text).not.toContain("flat");
  });
  it("does not call a negative performer an advancer on an all-down session", () => {
    const text = buildRecapSummary({ indexes: [], gainers: [{ name: "Still down", changePercent: -1 }] as any, losers: [{ name: "Down", changePercent: -5 }] as any, vix: null });
    expect(text).not.toContain("paces advancers");
  });
  it("compares earnings with the session on or after the report date, not three days before it", async () => {
    const day = 86400;
    vi.mocked(nasdaq.earningsSurprise).mockResolvedValue([{ dateReported: day * 10 }] as any);
    vi.mocked(nasdaq.history).mockResolvedValue([{ time: day * 7, close: 50 }, { time: day * 8, close: 55 }, { time: day * 10, close: 100 }, { time: day * 11, close: 110 }] as any);
    const res = await request("/earnings-history/:symbol", {}, { symbol: "EARNTEST" });
    expect(res.json.mock.calls[0][0][0].dayAfterChangePercent).toBeCloseTo(10);
  });
});
