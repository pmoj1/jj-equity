import type { Quote } from "./api";
export type Position = { symbol: string; quantity: number; avgCost: number; realizedPnl: number };
export function usableQuote(quote: Quote | undefined): quote is Quote & { price: number } {
  return typeof quote?.price === "number" && Number.isFinite(quote.price) && quote.price >= 0;
}
/** Missing prices never become cost-based market values. Mixed/unknown currencies suppress aggregate P&L. */
export function portfolioValuation(positions: Position[], quotes: Quote[]) {
  const missing: string[] = [], stale: string[] = [];
  const currencies = new Set<string>();
  let unknownCurrency = false, pricedValue = 0, cost = 0, realized = 0;
  for (const position of positions) {
    const quote = quotes.find((item) => item.symbol === position.symbol);
    cost += position.avgCost * position.quantity;
    realized += position.realizedPnl;
    if (position.quantity === 0 && position.realizedPnl === 0) continue;
    if (quote?.currency) currencies.add(quote.currency);
    else unknownCurrency = true;
    if (position.quantity === 0) continue;
    if (!usableQuote(quote)) { missing.push(position.symbol); continue; }
    pricedValue += quote.price * position.quantity;
    if (quote.stale) stale.push(position.symbol);
  }
  const currencyComplete = currencies.size <= 1 && !unknownCurrency;
  const complete = missing.length === 0 && currencyComplete;
  return { marketValue: complete ? pricedValue : null, pricedValue, cost, realized: currencyComplete ? realized : null, unrealized: complete ? pricedValue - cost : null, missing, stale, currency: currencies.size === 1 ? [...currencies][0] : null, mixedCurrencies: currencies.size > 1, unknownCurrency };
}
