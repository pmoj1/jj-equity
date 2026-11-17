import { describe, expect, it } from "vitest";
import { portfolioValuation } from "./portfolio";
import type { Quote } from "./api";
const positions = [{ symbol: "AAPL", quantity: 2, avgCost: 100, realizedPnl: 5 }];
const quote = (symbol: string, price: number | null, currency: string | null = "USD", stale = false) => ({ symbol, price, currency, stale } as Quote);
describe("portfolio valuation honesty", () => {
  it("does not substitute cost when a price is missing", () => {
    const result = portfolioValuation(positions, []);
    expect(result.marketValue).toBeNull(); expect(result.unrealized).toBeNull(); expect(result.missing).toEqual(["AAPL"]);
  });
  it("retains a cached price with an explicit stale indicator", () => {
    const result = portfolioValuation(positions, [quote("AAPL", 120, "USD", true)]);
    expect(result.marketValue).toBe(240); expect(result.unrealized).toBe(40); expect(result.stale).toEqual(["AAPL"]);
  });
  it("suppresses mixed-currency totals instead of adding unlike units", () => {
    const result = portfolioValuation([...positions, { symbol: "SAP.DE", quantity: 1, avgCost: 150, realizedPnl: 0 }], [quote("AAPL", 120), quote("SAP.DE", 160, "EUR")]);
    expect(result.marketValue).toBeNull(); expect(result.realized).toBeNull(); expect(result.mixedCurrencies).toBe(true);
  });
  it("rejects non-finite prices and unknown currency for aggregate valuation", () => {
    expect(portfolioValuation(positions, [quote("AAPL", NaN)]).marketValue).toBeNull();
    expect(portfolioValuation(positions, [quote("AAPL", 120, null)]).unknownCurrency).toBe(true);
  });
  it("values a closed, zero-P&L position at zero without requiring a quote", () => {
    expect(portfolioValuation([{ ...positions[0], quantity: 0, realizedPnl: 0 }], []).marketValue).toBe(0);
  });
});
