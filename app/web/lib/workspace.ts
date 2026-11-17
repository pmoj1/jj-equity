import { normalizeSymbol } from "./symbol";

export const WIDGET_TITLES = {
  "global-map": "Global map", "world-news": "Intelligence wire", "country-risk": "Country risk",
  "energy-intel": "Energy", "shipping-intel": "Shipping", "hazard-intel": "Hazards",
  "military-intel": "Force posture", "cyber-intel": "Cyber intelligence",
  quote: "Quote", chart: "Chart", watchlist: "Watchlist", news: "News", heatmap: "Heatmap",
  screener: "Screener", crypto: "Crypto", macro: "Macro & indexes", options: "Option chain",
  portfolio: "Portfolio ledger", ai: "Research assistant", calendar: "Calendar", insider: "Insider transactions",
  tv: "Live TV", recap: "Market recap",
} as const;
export type WidgetType = keyof typeof WIDGET_TITLES;
export type WidgetInstance = { id: string; type: WidgetType; symbol?: string; linked: boolean };
export type LayoutItem = { i: string; x: number; y: number; w: number; h: number };
export const DESKS = ["personal", "markets", "intelligence", "research"] as const;
export type DeskId = typeof DESKS[number];
export type Desk = { widgets: WidgetInstance[]; layout: LayoutItem[] };
export type DeskCollection = Record<DeskId, Desk>;
export const DESK_LABELS: Record<DeskId, string> = { personal: "My desk", markets: "Markets", intelligence: "Intelligence", research: "Research" };
export const WIDGET_GROUPS: Array<{ label: string; items: WidgetType[] }> = [
  { label: "Markets", items: ["chart", "quote", "watchlist", "news", "heatmap", "screener", "crypto", "macro", "options"] },
  { label: "Intelligence", items: ["global-map", "world-news", "country-risk", "energy-intel", "shipping-intel", "hazard-intel", "military-intel", "cyber-intel"] },
  { label: "Research", items: ["portfolio", "ai", "calendar", "insider", "tv", "recap"] },
];
export const SIZE_BY_TYPE: Record<WidgetType, { w: number; h: number }> = {
  "global-map": { w: 8, h: 13 }, "world-news": { w: 6, h: 11 }, "country-risk": { w: 4, h: 13 },
  "energy-intel": { w: 4, h: 9 }, "shipping-intel": { w: 6, h: 10 }, "hazard-intel": { w: 4, h: 9 },
  "military-intel": { w: 4, h: 9 }, "cyber-intel": { w: 4, h: 9 },
  quote: { w: 4, h: 8 }, chart: { w: 8, h: 13 }, watchlist: { w: 4, h: 8 }, news: { w: 8, h: 10 },
  heatmap: { w: 8, h: 10 }, screener: { w: 12, h: 10 }, crypto: { w: 6, h: 10 }, macro: { w: 4, h: 10 },
  options: { w: 12, h: 10 }, portfolio: { w: 12, h: 10 }, ai: { w: 6, h: 13 }, calendar: { w: 6, h: 13 },
  insider: { w: 6, h: 10 }, tv: { w: 6, h: 11 }, recap: { w: 6, h: 13 },
};
function preset(id: DeskId, entries: Array<[WidgetType, number, number, number, number]>): Desk {
  return {
    widgets: entries.map(([type], index) => ({ id: `${id}-${type}-${index}`, type, linked: ["chart", "quote", "news", "options", "insider"].includes(type) })),
    layout: entries.map(([type, x, y, w, h], index) => ({ i: `${id}-${type}-${index}`, x, y, w, h })),
  };
}
export function defaultDesks(): DeskCollection {
  return {
    personal: preset("personal", [["chart", 0, 0, 8, 13], ["quote", 8, 0, 4, 7], ["watchlist", 8, 7, 4, 6], ["world-news", 0, 13, 8, 10], ["macro", 8, 13, 4, 10]]),
    markets: preset("markets", [["chart", 0, 0, 8, 13], ["quote", 8, 0, 4, 7], ["watchlist", 8, 7, 4, 6], ["news", 0, 13, 8, 10], ["macro", 8, 13, 4, 10]]),
    intelligence: preset("intelligence", [["global-map", 0, 0, 8, 13], ["country-risk", 8, 0, 4, 13], ["world-news", 0, 13, 6, 11], ["shipping-intel", 6, 13, 6, 11], ["energy-intel", 0, 24, 4, 9], ["hazard-intel", 4, 24, 4, 9], ["cyber-intel", 8, 24, 4, 9], ["military-intel", 0, 33, 4, 9]]),
    research: preset("research", [["portfolio", 0, 0, 12, 10], ["ai", 0, 10, 6, 13], ["calendar", 6, 10, 6, 13], ["recap", 0, 23, 6, 13], ["insider", 6, 23, 6, 13]]),
  };
}
function isRecord(value: unknown): value is Record<string, unknown> { return !!value && typeof value === "object" && !Array.isArray(value); }
function isInt(value: unknown, min: number, max: number): value is number { return typeof value === "number" && Number.isInteger(value) && value >= min && value <= max; }
export function parseDesk(value: unknown): Desk {
  if (!isRecord(value) || !Array.isArray(value.widgets) || !Array.isArray(value.layout) || value.widgets.length > 100) throw new Error("A desk must contain at most 100 panels and their layout.");
  const ids = new Set<string>();
  const widgets = value.widgets.map((raw): WidgetInstance => {
    if (!isRecord(raw) || typeof raw.id !== "string" || !/^[\w-]{1,120}$/.test(raw.id) || ids.has(raw.id) || typeof raw.type !== "string" || !Object.prototype.hasOwnProperty.call(WIDGET_TITLES, raw.type) || typeof raw.linked !== "boolean") throw new Error("The workspace contains an invalid or duplicate panel.");
    ids.add(raw.id);
    const symbol = raw.symbol === undefined ? undefined : typeof raw.symbol === "string" ? normalizeSymbol(raw.symbol) : null;
    if (symbol === null) throw new Error("A panel contains an invalid symbol.");
    return { id: raw.id, type: raw.type as WidgetType, linked: raw.linked, ...(symbol ? { symbol } : {}) };
  });
  const placed = new Set<string>();
  const layout = value.layout.map((raw): LayoutItem => {
    if (!isRecord(raw) || typeof raw.i !== "string" || !ids.has(raw.i) || placed.has(raw.i) || !isInt(raw.x, 0, 11) || !isInt(raw.y, 0, 100_000) || !isInt(raw.w, 1, 12) || !isInt(raw.h, 1, 100) || raw.x + raw.w > 12) throw new Error("A panel layout is invalid or outside the desk.");
    placed.add(raw.i); return { i: raw.i, x: raw.x, y: raw.y, w: raw.w, h: raw.h };
  });
  if (widgets.length !== layout.length) throw new Error("Every panel needs one layout position.");
  return { widgets, layout };
}
export type WorkspaceFile = { format: "jj-equity-workspace"; version: 1; workspaceName: string; activeSymbol: string; activeDesk: DeskId; watchlist: string[]; desks: DeskCollection };
export function parseWorkspaceFile(raw: unknown): WorkspaceFile {
  if (!isRecord(raw) || raw.format !== "jj-equity-workspace" || raw.version !== 1 || !isRecord(raw.desks) || !DESKS.includes(raw.activeDesk as DeskId) || typeof raw.workspaceName !== "string" || !raw.workspaceName.trim() || raw.workspaceName.length > 70 || typeof raw.activeSymbol !== "string" || !Array.isArray(raw.watchlist) || raw.watchlist.length > 500) throw new Error("Choose a J&J Equity workspace export (version 1).");
  const activeSymbol = normalizeSymbol(raw.activeSymbol);
  const watchlist = raw.watchlist.map((symbol) => typeof symbol === "string" ? normalizeSymbol(symbol) : null);
  if (!activeSymbol || watchlist.some((symbol) => !symbol)) throw new Error("The workspace contains an invalid symbol.");
  const desks = Object.fromEntries(DESKS.map((id) => [id, parseDesk((raw.desks as Record<string, unknown>)[id])])) as DeskCollection;
  return { format: "jj-equity-workspace", version: 1, workspaceName: raw.workspaceName.trim(), activeSymbol, activeDesk: raw.activeDesk as DeskId, watchlist: [...new Set(watchlist as string[])], desks };
}
export function legacyDesk(value: unknown): Desk | null {
  if (!isRecord(value)) return null;
  try { return parseDesk(value); } catch { return null; }
}

/** Convert an old workspace without mutating or discarding its saved desk. */
export function migrateLegacyWorkspace(value: unknown): WorkspaceFile | null {
  if (!value || typeof value !== "object") return null;
  const state = value as Record<string, unknown>;
  const desk = legacyDesk(state);
  if (!desk) return null;
  const desks = defaultDesks(); desks.personal = desk;
  try { return parseWorkspaceFile({ format: "jj-equity-workspace", version: 1, workspaceName: "Jay-deane's research desk", activeDesk: "personal", activeSymbol: state.activeSymbol || "AAPL", watchlist: state.watchlist || [], desks }); }
  catch { return null; }
}
