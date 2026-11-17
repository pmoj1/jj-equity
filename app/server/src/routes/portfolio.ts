import { Router } from "express";
import { z } from "zod";
import { db } from "../db.js";
import { calculatePositions, type LedgerTransaction } from "../portfolioLedger.js";

export const portfolioRouter = Router();
const identifier = z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER);
const txSchema = z.object({
  symbol: z.string().trim().toUpperCase().regex(/^(?=.*[A-Z0-9])[A-Z0-9.\-^=&]{1,20}$/, "Enter a valid ticker symbol."),
  side: z.enum(["BUY", "SELL"]),
  quantity: z.number().finite().positive(),
  price: z.number().finite().nonnegative(),
  executed_at: z.string().datetime({ offset: true }).transform((s) => new Date(s).toISOString()),
});

class PortfolioError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
function parseId(raw: unknown): number {
  const result = identifier.safeParse(raw);
  if (!result.success) throw new PortfolioError(400, "A valid portfolio or transaction ID is required.");
  return result.data;
}
function requirePortfolio(id: number) {
  if (!db.prepare("SELECT id FROM portfolios WHERE id = ?").get(id)) throw new PortfolioError(404, "Portfolio not found.");
}
function transactions(id: number): LedgerTransaction[] {
  return db.prepare("SELECT * FROM transactions WHERE portfolio_id = ? ORDER BY executed_at, id").all(id) as LedgerTransaction[];
}
function validateHistory(rows: LedgerTransaction[]) {
  try { return calculatePositions(rows); }
  catch (error) { throw new PortfolioError(409, error instanceof Error ? error.message : "Invalid transaction history."); }
}
function fail(res: any, error: unknown) {
  if (error instanceof PortfolioError) return res.status(error.status).json({ error: error.message });
  console.error("[portfolio] operation failed");
  return res.status(500).json({ error: "The portfolio operation could not be completed." });
}

portfolioRouter.get("/", (_req, res) => res.json(db.prepare("SELECT * FROM portfolios ORDER BY id").all()));
portfolioRouter.post("/", (req, res) => {
  const result = z.object({ name: z.string().trim().min(1).max(64) }).safeParse(req.body);
  if (!result.success) return res.status(400).json({ error: "Enter a portfolio name between 1 and 64 characters." });
  try {
    const info = db.prepare("INSERT INTO portfolios (name) VALUES (?)").run(result.data.name);
    return res.status(201).json({ id: info.lastInsertRowid, name: result.data.name });
  } catch (error) {
    if ((error as { code?: string }).code === "SQLITE_CONSTRAINT_UNIQUE") return res.status(409).json({ error: "Portfolio name already exists." });
    return fail(res, error);
  }
});
portfolioRouter.delete("/:id", (req, res) => {
  try {
    const id = parseId(req.params.id); requirePortfolio(id);
    db.prepare("DELETE FROM portfolios WHERE id = ?").run(id);
    return res.status(204).end();
  } catch (error) { return fail(res, error); }
});
portfolioRouter.get("/:id/transactions", (req, res) => {
  try {
    const id = parseId(req.params.id); requirePortfolio(id);
    return res.json(db.prepare("SELECT * FROM transactions WHERE portfolio_id = ? ORDER BY executed_at DESC, id DESC").all(id));
  } catch (error) { return fail(res, error); }
});
portfolioRouter.post("/:id/transactions", (req, res) => {
  const parsed = txSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "Provide a valid ticker, BUY or SELL, finite quantity and price, and an ISO timestamp with timezone." });
  try {
    const id = parseId(req.params.id);
    const insert = db.transaction(() => {
      requirePortfolio(id);
      validateHistory([...transactions(id), parsed.data]);
      return db.prepare("INSERT INTO transactions (portfolio_id, symbol, side, quantity, price, executed_at) VALUES (?, ?, ?, ?, ?, ?)")
        .run(id, parsed.data.symbol, parsed.data.side, parsed.data.quantity, parsed.data.price, parsed.data.executed_at);
    });
    const info = insert.immediate();
    return res.status(201).json({ id: info.lastInsertRowid, ...parsed.data });
  } catch (error) { return fail(res, error); }
});
portfolioRouter.delete("/:id/transactions/:txId", (req, res) => {
  try {
    const id = parseId(req.params.id); const txId = parseId(req.params.txId);
    const remove = db.transaction(() => {
      requirePortfolio(id);
      const rows = transactions(id);
      if (!rows.some((row) => row.id === txId)) throw new PortfolioError(404, "Transaction not found.");
      validateHistory(rows.filter((row) => row.id !== txId));
      db.prepare("DELETE FROM transactions WHERE id = ? AND portfolio_id = ?").run(txId, id);
    });
    remove.immediate();
    return res.status(204).end();
  } catch (error) { return fail(res, error); }
});
portfolioRouter.get("/:id/positions", (req, res) => {
  try {
    const id = parseId(req.params.id); requirePortfolio(id);
    return res.json(validateHistory(transactions(id)));
  } catch (error) { return fail(res, error); }
});
