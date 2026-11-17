export type LedgerTransaction = {
  symbol: string;
  side: "BUY" | "SELL";
  quantity: number;
  price: number;
  executed_at: string;
  id?: number;
};

export type Position = { symbol: string; quantity: number; avgCost: number; realizedPnl: number };

/** Long-only average-cost bookkeeping; validate backdated changes against the full timeline. */
export function calculatePositions(transactions: LedgerTransaction[]): Position[] {
  for (const tx of transactions) {
    if (!Number.isFinite(Date.parse(tx.executed_at)) || !Number.isFinite(tx.quantity) || tx.quantity <= 0 || !Number.isFinite(tx.price) || tx.price < 0) {
      throw new Error("Portfolio history contains an invalid transaction.");
    }
  }
  const ordered = [...transactions].sort((a, b) =>
    Date.parse(a.executed_at) - Date.parse(b.executed_at) ||
    (a.id ?? Number.MAX_SAFE_INTEGER) - (b.id ?? Number.MAX_SAFE_INTEGER)
  );
  const positions = new Map<string, Position>();
  for (const tx of ordered) {
    const p = positions.get(tx.symbol) ?? { symbol: tx.symbol, quantity: 0, avgCost: 0, realizedPnl: 0 };
    positions.set(tx.symbol, p);
    if (tx.side === "BUY") {
      const cost = p.avgCost * p.quantity + tx.price * tx.quantity;
      const quantity = p.quantity + tx.quantity;
      if (!Number.isFinite(cost) || !Number.isFinite(quantity)) throw new Error("Transaction exceeds the supported numeric range.");
      p.quantity = quantity;
      p.avgCost = cost / quantity;
    } else if (tx.side === "SELL") {
      const tolerance = Number.EPSILON * Math.max(1, p.quantity, tx.quantity) * 16;
      if (tx.quantity - p.quantity > tolerance) {
        throw new Error(`Cannot sell more ${tx.symbol} than held at that point in the transaction history. Short positions are not supported.`);
      }
      const sold = Math.min(tx.quantity, p.quantity);
      const priceDifference = tx.price - p.avgCost;
      const priceTolerance = Number.EPSILON * Math.max(1, Math.abs(tx.price), Math.abs(p.avgCost)) * 16;
      p.realizedPnl += Math.abs(priceDifference) <= priceTolerance ? 0 : priceDifference * sold;
      if (!Number.isFinite(p.realizedPnl)) throw new Error("Transaction exceeds the supported numeric range.");
      p.quantity -= sold;
      if (p.quantity <= tolerance) { p.quantity = 0; p.avgCost = 0; }
    } else {
      throw new Error("Portfolio history contains an unsupported transaction side.");
    }
  }
  return [...positions.values()].filter((p) => p.quantity > 0 || p.realizedPnl !== 0);
}
