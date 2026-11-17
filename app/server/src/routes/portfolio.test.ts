import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
let directory: string;
let db: (typeof import("../db.js"))["db"];
let router: (typeof import("./portfolio.js"))["portfolioRouter"];
let portfolioId: number;
beforeAll(async () => {
  directory = mkdtempSync(join(tmpdir(), "jj-portfolio-routes-"));
  vi.stubEnv("DATA_DIR", directory);
  ({ db } = await import("../db.js"));
  ({ portfolioRouter: router } = await import("./portfolio.js"));
});
afterAll(() => { db.close(); rmSync(directory, { recursive: true, force: true }); vi.unstubAllEnvs(); });
beforeEach(() => {
  db.prepare("DELETE FROM portfolios").run();
  portfolioId = Number(db.prepare("INSERT INTO portfolios (name) VALUES (?)").run("Test portfolio").lastInsertRowid);
});
function request(method: string, path: string, body = {}, params: Record<string,string> = {}) {
  const layer = (router as any).stack.find((l: any) => l.route?.path === path && l.route.methods[method]);
  const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis(), end: vi.fn().mockReturnThis() };
  layer.route.stack[0].handle({ body, params: { id: String(portfolioId), ...params } }, res);
  return res;
}
const trade = (side: "BUY"|"SELL", quantity = 1, day = 1) => ({ symbol: " aapl ", side, quantity, price: 100, executed_at: `2026-01-0${day}T00:00:00Z` });
describe("portfolio mutation integrity", () => {
  it("rejects oversells atomically without inserting a partial transaction", () => {
    request("post", "/:id/transactions", trade("BUY"));
    const res = request("post", "/:id/transactions", trade("SELL", 2, 2));
    expect(res.status).toHaveBeenCalledWith(409);
    expect(db.prepare("SELECT COUNT(*) AS n FROM transactions").get()).toEqual({ n: 1 });
  });
  it("rejects deletion of the purchase supporting a later sale", () => {
    const buy = request("post", "/:id/transactions", trade("BUY", 2));
    request("post", "/:id/transactions", trade("SELL", 1, 2));
    const id = buy.json.mock.calls[0][0].id;
    const result = request("delete", "/:id/transactions/:txId", {}, { txId: String(id) });
    expect(result.status).toHaveBeenCalledWith(409);
    expect(db.prepare("SELECT COUNT(*) AS n FROM transactions").get()).toEqual({ n: 2 });
  });
  it("normalizes symbols and timezone offsets before storage", () => {
    const res = request("post", "/:id/transactions", { ...trade("BUY"), symbol: "m&m.ns", executed_at: "2026-01-01T02:00:00+02:00" });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json.mock.calls[0][0]).toMatchObject({ symbol: "M&M.NS", executed_at: "2026-01-01T00:00:00.000Z" });
  });
  it.each([{ symbol: ".." }, { executed_at: "not-a-date" }, { executed_at: "2026-02-30T00:00:00Z" }, { quantity: Infinity }, { price: -1 }])("rejects malformed transaction %j", (changes) => {
    expect(request("post", "/:id/transactions", { ...trade("BUY"), ...changes }).status).toHaveBeenCalledWith(400);
    expect(db.prepare("SELECT COUNT(*) AS n FROM transactions").get()).toEqual({ n: 0 });
  });
  it("distinguishes missing portfolios and invalid identifiers from an empty ledger", () => {
    expect(request("get", "/:id/positions", {}, { id: "999999" }).status).toHaveBeenCalledWith(404);
    expect(request("get", "/:id/positions", {}, { id: "x" }).status).toHaveBeenCalledWith(400);
    expect(request("get", "/:id/positions").json).toHaveBeenCalledWith([]);
  });
  it("cascades portfolio deletion and rejects blank names", () => {
    request("post", "/:id/transactions", trade("BUY"));
    expect(request("delete", "/:id").status).toHaveBeenCalledWith(204);
    expect(db.prepare("SELECT COUNT(*) AS n FROM transactions").get()).toEqual({ n: 0 });
    expect(request("post", "/", { name: "  " }).status).toHaveBeenCalledWith(400);
  });
});
