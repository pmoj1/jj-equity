"use client";

import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";
import { normalizeSymbol } from "../lib/symbol";
import { defaultDesks, migrateLegacyWorkspace, parseWorkspaceFile, SIZE_BY_TYPE, type DeskId, type DeskCollection, type LayoutItem, type WidgetInstance, type WidgetType, type WorkspaceFile } from "../lib/workspace";
export type { DeskId, LayoutItem, WidgetInstance, WidgetType } from "../lib/workspace";
export type IntelFocus = { name: string; country?: string; lat?: number; lon?: number; detail?: string; keywords?: string[] };

type TerminalState = {
  workspaceName: string; activeDesk: DeskId; desks: DeskCollection;
  intelFocus: IntelFocus | null; setIntelFocus: (focus: IntelFocus | null) => void;
  activeSymbol: string; widgets: WidgetInstance[]; layout: LayoutItem[]; watchlist: string[];
  commandOpen: boolean; settingsOpen: boolean; panelsOpen: boolean;
  setWorkspaceName: (name: string) => void; setDesk: (desk: DeskId) => void;
  setSettingsOpen: (open: boolean) => void; setPanelsOpen: (open: boolean) => void;
  setActiveSymbol: (s: string) => void; setCommandOpen: (open: boolean) => void;
  addWidget: (type: WidgetType, symbol?: string) => void; removeWidget: (id: string) => void;
  setWidgetSymbol: (id: string, symbol: string) => void; toggleLinked: (id: string) => void;
  setLayout: (layout: LayoutItem[]) => void; addToWatchlist: (s: string) => void;
  removeFromWatchlist: (s: string) => void; resetWorkspace: () => void;
  exportWorkspace: () => WorkspaceFile; importWorkspace: (raw: unknown) => void;
};
const STORAGE_KEY = "jj-equity-workspace";
const LEGACY_KEY = "openterminal-workspace";
const defaults = defaultDesks();
function safeLegacy(raw: string): string | null {
  try {
    const saved = JSON.parse(raw);
    const candidate = migrateLegacyWorkspace(saved.state);
    if (!candidate) return null;
    const desk = candidate.desks.personal;
    return JSON.stringify({ state: { ...candidate, widgets: desk.widgets, layout: desk.layout }, version: 3 });
  } catch { return null; }
}
/** Read the old workspace once, keep its original bytes intact, and persist future changes under J&J's own key. */
const browserStorage: StateStorage = {
  getItem(name) {
    try {
      const current = localStorage.getItem(name);
      if (current !== null) return current;
      const previous = localStorage.getItem(LEGACY_KEY);
      return previous ? safeLegacy(previous) : null;
    } catch { return null; }
  },
  setItem(name, value) { try { localStorage.setItem(name, value); } catch { /* Restricted storage remains usable in memory. */ } },
  removeItem(name) { try { localStorage.removeItem(name); } catch { /* The original legacy key is never removed. */ } },
};
export const useTerminal = create<TerminalState>()(persist((set, get) => ({
  workspaceName: "Jay-deane's research desk", activeDesk: "markets", desks: defaults,
  widgets: defaults.markets.widgets, layout: defaults.markets.layout,
  intelFocus: null, activeSymbol: "AAPL", watchlist: ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "SPY"],
  commandOpen: false, settingsOpen: false, panelsOpen: false,
  setIntelFocus: (intelFocus) => set({ intelFocus }),
  setWorkspaceName: (name) => { const value = name.trim().slice(0, 70); if (value) set({ workspaceName: value }); },
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }), setPanelsOpen: (panelsOpen) => set({ panelsOpen }),
  setDesk: (activeDesk) => set((state) => {
    const desks = { ...state.desks, [state.activeDesk]: { widgets: state.widgets, layout: state.layout } };
    return { desks, activeDesk, ...desks[activeDesk], panelsOpen: false };
  }),
  setActiveSymbol: (s) => { const activeSymbol = normalizeSymbol(s); if (activeSymbol) set({ activeSymbol }); },
  setCommandOpen: (commandOpen) => set({ commandOpen }),
  addWidget: (type, symbol) => set((state) => {
    if (state.widgets.length >= 100) return state;
    const id = `jj-${type}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nextSymbol = symbol ? normalizeSymbol(symbol) : null;
    return { widgets: [...state.widgets, { id, type, ...(nextSymbol ? { symbol: nextSymbol } : {}), linked: !nextSymbol }], layout: [...state.layout, { i: id, x: 0, y: state.layout.reduce((max, item) => Math.max(max, item.y + item.h), 0), ...SIZE_BY_TYPE[type] }], panelsOpen: false };
  }),
  removeWidget: (id) => set((state) => ({ widgets: state.widgets.filter((widget) => widget.id !== id), layout: state.layout.filter((item) => item.i !== id) })),
  setWidgetSymbol: (id, value) => { const symbol = normalizeSymbol(value); if (symbol) set((state) => ({ widgets: state.widgets.map((widget) => widget.id === id ? { ...widget, symbol, linked: false } : widget) })); },
  toggleLinked: (id) => set((state) => ({ widgets: state.widgets.map((widget) => widget.id === id ? { ...widget, linked: !widget.linked } : widget) })),
  setLayout: (layout) => set({ layout }),
  addToWatchlist: (value) => { const symbol = normalizeSymbol(value); if (symbol) set((state) => ({ watchlist: state.watchlist.includes(symbol) || state.watchlist.length >= 500 ? state.watchlist : [...state.watchlist, symbol] })); },
  removeFromWatchlist: (symbol) => set((state) => ({ watchlist: state.watchlist.filter((item) => item !== symbol) })),
  resetWorkspace: () => set((state) => { const next = defaultDesks()[state.activeDesk]; return { ...next, desks: { ...state.desks, [state.activeDesk]: next } }; }),
  exportWorkspace: () => { const state = get(); return { format: "jj-equity-workspace", version: 1, workspaceName: state.workspaceName, activeDesk: state.activeDesk, activeSymbol: state.activeSymbol, watchlist: state.watchlist, desks: { ...state.desks, [state.activeDesk]: { widgets: state.widgets, layout: state.layout } } }; },
  importWorkspace: (raw) => { const file = parseWorkspaceFile(raw); set({ workspaceName: file.workspaceName, activeDesk: file.activeDesk, desks: file.desks, activeSymbol: file.activeSymbol, watchlist: file.watchlist, ...file.desks[file.activeDesk], intelFocus: null, commandOpen: false, panelsOpen: false }); },
}), {
  name: STORAGE_KEY, version: 3, storage: createJSONStorage(() => browserStorage),
  partialize: ({ workspaceName, activeDesk, desks, widgets, layout, activeSymbol, watchlist }) => ({ workspaceName, activeDesk, desks: { ...desks, [activeDesk]: { widgets, layout } }, widgets, layout, activeSymbol, watchlist }),
  merge: (persisted, current) => {
    try {
      const old = persisted as Partial<TerminalState>;
      const file = parseWorkspaceFile({ ...old, format: "jj-equity-workspace", version: 1 });
      return { ...current, ...file, ...file.desks[file.activeDesk] };
    } catch { return current; }
  },
}));
export function useWidgetSymbol(widget: WidgetInstance): string {
  const active = useTerminal((state) => state.activeSymbol);
  return widget.linked ? active : widget.symbol ?? active;
}
