"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { apiGet, apiPost, apiDelete, fmt, pctClass, type Quote } from "../../lib/api";
import { symbolsParam, normalizeSymbol } from "../../lib/symbol";
import { portfolioValuation, usableQuote, type Position } from "../../lib/portfolio";
type Portfolio = { id: number; name: string };
type Tx = { id: number; symbol: string; side: string; quantity: number; price: number; executed_at: string };
export default function PortfolioWidget() {
  const qc = useQueryClient();
  const selectId = useId();
  const [portfolioId, setPortfolioId] = useState<number | null>(null);
  const [showTx, setShowTx] = useState(false);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ symbol: "", side: "BUY", quantity: "", price: "" });
  const { data: portfolios = [], error: portfolioError, isPending: portfoliosPending } = useQuery({ queryKey: ["portfolios"], queryFn: () => apiGet<Portfolio[]>("/api/portfolios") });
  const pid = portfolios.some((item) => item.id === portfolioId) ? portfolioId : portfolios[0]?.id;
  const { data: positions = [], error: positionsError, isPending: positionsPending } = useQuery({ queryKey: ["positions", pid], queryFn: () => apiGet<Position[]>(`/api/portfolios/${pid}/positions`), enabled: !!pid });
  const { data: txs = [], error: transactionsError, isPending: transactionsPending } = useQuery({ queryKey: ["transactions", pid], queryFn: () => apiGet<Tx[]>(`/api/portfolios/${pid}/transactions`), enabled: !!pid && showTx });
  const symbols = positions.map((position) => position.symbol);
  const { data: quotes = [], error: quotesError } = useQuery({ queryKey: ["pf-quotes", symbols.join(",")], queryFn: () => apiGet<Quote[]>(`/api/quotes?symbols=${symbolsParam(symbols)}`), enabled: symbols.length > 0, refetchInterval: 30_000 });
  const invalidate = () => { qc.invalidateQueries({ queryKey: ["positions", pid] }); qc.invalidateQueries({ queryKey: ["transactions", pid] }); };
  const create = useMutation({ mutationFn: () => apiPost<Portfolio>("/api/portfolios", { name: newName.trim() }), onSuccess: (portfolio) => { qc.invalidateQueries({ queryKey: ["portfolios"] }); setPortfolioId(portfolio.id); setNewName(""); setShowCreate(false); } });
  const add = useMutation({ mutationFn: () => apiPost(`/api/portfolios/${pid}/transactions`, { symbol: form.symbol, side: form.side, quantity: Number(form.quantity), price: Number(form.price), executed_at: new Date().toISOString() }), onSuccess: () => { invalidate(); setForm({ symbol: "", side: "BUY", quantity: "", price: "" }); } });
  const remove = useMutation({ mutationFn: (id: number) => apiDelete(`/api/portfolios/${pid}/transactions/${id}`), onSuccess: invalidate });
  const pricedQuotes = quotesError ? quotes.map((quote) => ({ ...quote, stale: true })) : quotes;
  const totals = portfolioValuation(positions, pricedQuotes);
  const valid = !!pid && !!normalizeSymbol(form.symbol) && !!form.quantity && Number.isFinite(Number(form.quantity)) && Number(form.quantity) > 0 && !!form.price && Number.isFinite(Number(form.price)) && Number(form.price) >= 0;
  const error = portfolioError || positionsError || transactionsError || add.error || remove.error || create.error;
  return <div>
    <div className="portfolio-toolbar"><label className="sr-only" htmlFor={selectId}>Portfolio ledger</label><select id={selectId} value={pid ?? ""} onChange={(event) => { setPortfolioId(Number(event.target.value)); add.reset(); remove.reset(); }}><option value="" disabled>Choose a ledger</option>{portfolios.map((portfolio) => <option key={portfolio.id} value={portfolio.id}>{portfolio.name}</option>)}</select><button className="term-btn" onClick={() => setShowCreate(!showCreate)} aria-expanded={showCreate}>New ledger</button><button className={`term-btn ${showTx ? "active" : ""}`} onClick={() => setShowTx(!showTx)} aria-pressed={showTx}>{showTx ? "Show positions" : "Show transactions"}</button></div>
    {showCreate && <form className="portfolio-create" onSubmit={(event) => { event.preventDefault(); if (newName.trim()) create.mutate(); }}><input aria-label="New ledger name" maxLength={64} value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Ledger name" required /><button className="term-btn" type="submit" disabled={create.isPending || !newName.trim()}>Create ledger</button></form>}
    {error && <p role="alert" className="portfolio-feedback down">{(error as Error).message}</p>}
    {pid && !positionsPending && !positionsError && <><div className="portfolio-summary"><div><small>Market value {totals.currency ?? ""}</small><strong className="amber">{fmt(totals.marketValue)}</strong></div><div><small>Unrealized P&L</small><strong className={pctClass(totals.unrealized)}>{fmt(totals.unrealized)}</strong></div><div><small>Realized P&L</small><strong className={pctClass(totals.realized)}>{fmt(totals.realized)}</strong></div></div>
      {(totals.missing.length > 0 || totals.stale.length > 0 || totals.mixedCurrencies || totals.unknownCurrency) && <p className="valuation-note" role="status">{totals.missing.length > 0 && <>Valuation incomplete: no usable quote for {totals.missing.join(", ")}. </>}{totals.stale.length > 0 && <>Cached pricing for {totals.stale.join(", ")}; timestamps remain unchanged. </>}{totals.mixedCurrencies && <>Aggregate values are hidden because positions use different currencies. </>}{totals.unknownCurrency && <>Aggregate values are hidden while a position’s quote currency is unknown. </>}No currency conversion is applied.</p>}
      {quotesError && <p className="portfolio-feedback dim">Price refresh unavailable. Previously received values retain their source status.</p>}
    </>}
    {pid && <form className="portfolio-entry-form" onSubmit={(event) => { event.preventDefault(); if (valid) add.mutate(); }}><label>Ticker<input required aria-label="Transaction ticker" placeholder="AAPL" value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value.toUpperCase() })} /></label><label>Side<select aria-label="Transaction side" value={form.side} onChange={(event) => setForm({ ...form, side: event.target.value })}><option>BUY</option><option>SELL</option></select></label><label>Quantity<input required aria-label="Transaction quantity" type="number" min="0.00000001" step="any" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} /></label><label>Unit price<input required aria-label="Transaction unit price" type="number" min="0" step="any" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} /></label><button className="term-btn" type="submit" disabled={!valid || add.isPending}>{add.isPending ? "Saving…" : "Record transaction"}</button></form>}
    {portfoliosPending ? <p className="portfolio-empty">Loading ledgers…</p> : !pid ? <p className="portfolio-empty">Create a ledger to record your own transactions. Entries are local research records; no orders are placed.</p> : positionsPending ? <p className="portfolio-empty">Loading positions…</p> : !showTx ? <>
      {!positions.length && !positionsError && <p className="portfolio-empty">No transactions in this ledger. Add a buy to begin tracking a position.</p>}
      <table className="data-table"><thead><tr><th>Symbol</th><th>Qty</th><th>Avg cost</th><th>Last</th><th>Currency</th><th>Market value</th><th>Unrealized</th><th>Realized</th></tr></thead><tbody>{positions.map((position) => {
        const quote = pricedQuotes.find((item) => item.symbol === position.symbol); const last = usableQuote(quote) ? quote.price : null; const pnl = last === null ? null : (last - position.avgCost) * position.quantity;
        return <tr key={position.symbol}><td className="font-bold">{position.symbol}</td><td>{fmt(position.quantity, 4)}</td><td>{fmt(position.avgCost)}</td><td title={quote?.fetchedAt ? `Fetched ${quote.fetchedAt}` : "Source timestamp unavailable"}>{fmt(last)}{quote?.stale && <small className="amber"> cached</small>}</td><td className="dim">{quote?.currency ?? "—"}</td><td>{fmt(last === null ? null : last * position.quantity)}</td><td className={pctClass(pnl)}>{fmt(pnl)}</td><td className={pctClass(position.realizedPnl)}>{fmt(position.realizedPnl)}</td></tr>;
      })}</tbody></table>
    </> : transactionsPending ? <p className="portfolio-empty">Loading transactions…</p> : <><p className="portfolio-feedback dim">Removing a transaction is blocked if it would make the remaining ledger oversold.</p><table className="data-table"><thead><tr><th>Date</th><th>Symbol</th><th>Side</th><th>Qty</th><th>Price</th><th></th></tr></thead><tbody>{txs.map((tx) => <tr key={tx.id}><td className="!text-left dim">{new Date(tx.executed_at).toLocaleString()}</td><td className="font-bold">{tx.symbol}</td><td className={tx.side === "BUY" ? "up" : "down"}>{tx.side}</td><td>{fmt(tx.quantity, 4)}</td><td>{fmt(tx.price)}</td><td><button className="dim" aria-label={`Remove ${tx.symbol} ${tx.side.toLowerCase()} transaction ${tx.id}`} disabled={remove.isPending} onClick={() => remove.mutate(tx.id)}>×</button></td></tr>)}</tbody></table>{!txs.length && <p className="portfolio-empty">No recorded transactions.</p>}</>}
  </div>;
}
