import { describe, expect, it } from "vitest";
import { calculatePositions, type LedgerTransaction } from "./portfolioLedger.js";
const tx = (side: "BUY" | "SELL", quantity: number, price: number, day: number, id = day): LedgerTransaction => ({ symbol: "AAPL", side, quantity, price, executed_at: `2026-01-${String(day).padStart(2,"0")}T00:00:00Z`, id });
describe("long-only average-cost ledger", () => {
  it("reconciles weighted cost, partial sale and realized profit", () => {
    expect(calculatePositions([tx("BUY", 10, 100, 1), tx("BUY", 10, 120, 2), tx("SELL", 5, 130, 3)]))
      .toEqual([{ symbol: "AAPL", quantity: 15, avgCost: 110, realizedPnl: 100 }]);
  });
  it("rejects an oversell instead of silently truncating it", () => {
    expect(() => calculatePositions([tx("BUY", 1, 100, 1), tx("SELL", 2, 110, 2)])).toThrow(/Cannot sell more/);
  });
  it("validates a backdated sale against holdings on that date", () => {
    expect(() => calculatePositions([tx("BUY", 10, 100, 3), tx("SELL", 1, 100, 1)])).toThrow(/Cannot sell more/);
  });
  it("uses actual timestamps rather than lexical ordering of UTC offsets", () => {
    const buy = { ...tx("BUY", 1, 100, 1), executed_at: "2026-01-01T01:00:00+02:00" };
    const sell = { ...tx("SELL", 1, 110, 1, 2), executed_at: "2026-01-01T00:00:00Z" };
    expect(calculatePositions([sell, buy])[0]).toMatchObject({ quantity: 0, realizedPnl: 10 });
  });
  it("retains realized gains when a position is fully closed then reopened", () => {
    expect(calculatePositions([tx("BUY", 1, 100, 1), tx("SELL", 1, 110, 2), tx("BUY", 2, 90, 3)])[0])
      .toMatchObject({ quantity: 2, avgCost: 90, realizedPnl: 10 });
  });
  it("accepts floating-point dust but rejects a material short position", () => {
    expect(calculatePositions([tx("BUY", 0.1, 10, 1), tx("BUY", 0.2, 10, 2), tx("SELL", 0.3, 10, 3)])).toEqual([]);
    expect(() => calculatePositions([tx("BUY", 0.3, 10, 1), tx("SELL", 0.30001, 10, 2)])).toThrow();
  });
  it("rejects invalid dates, nonfinite numbers and arithmetic overflow", () => {
    expect(() => calculatePositions([{ ...tx("BUY", 1, 1, 1), executed_at: "invalid" }])).toThrow();
    expect(() => calculatePositions([tx("BUY", Infinity, 1, 1)])).toThrow();
    expect(() => calculatePositions([tx("BUY", 1e308, 1e308, 1)])).toThrow(/numeric range/);
  });
});
