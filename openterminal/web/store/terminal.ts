"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { normalizeSymbol } from "../lib/symbol";

export type WidgetType =
  | "quote"
  | "chart"
  | "watchlist"
  | "news"
  | "heatmap"
  | "screener"
  | "crypto"
  | "macro"
  | "options"
  | "portfolio"
  | "ai"
  | "calendar"
  | "insider"
  | "tv"
  | "recap"
  | "global-map" | "world-news" | "country-risk" | "energy-intel" | "shipping-intel" | "hazard-intel" | "military-intel" | "cyber-intel";

export type WidgetInstance = {
  id: string;
  type: WidgetType;
  symbol?: string;
  linked: boolean; // follows the globally active symbol
};

export type LayoutItem = { i: string; x: number; y: number; w: number; h: number };

export type IntelFocus = {name:string; country?:string; lat?:number; lon?:number; detail?:string; keywords?:string[]};

type TerminalState = {
  intelFocus: IntelFocus | null;
  setIntelFocus: (focus: IntelFocus | null) => void;
  activeSymbol: string;
  widgets: WidgetInstance[];
  layout: LayoutItem[];
  watchlist: string[];
  commandOpen: boolean;
  setActiveSymbol: (s: string) => void;
  setCommandOpen: (open: boolean) => void;
  addWidget: (type: WidgetType, symbol?: string) => void;
  removeWidget: (id: string) => void;
  setWidgetSymbol: (id: string, symbol: string) => void;
  toggleLinked: (id: string) => void;
  setLayout: (layout: LayoutItem[]) => void;
  addToWatchlist: (s: string) => void;
  removeFromWatchlist: (s: string) => void;
  resetWorkspace: () => void;
};

const DEFAULT_WIDGETS: WidgetInstance[] = [
  { id: "w-chart", type: "chart", linked: true },
  { id: "w-quote", type: "quote", linked: true },
  { id: "w-watchlist", type: "watchlist", linked: false },
  { id: "w-news", type: "news", linked: true },
  { id: "w-macro", type: "macro", linked: false },
];

const DEFAULT_LAYOUT: LayoutItem[] = [
  { i: "w-chart", x: 0, y: 0, w: 7, h: 12 },
  { i: "w-quote", x: 7, y: 0, w: 5, h: 6 },
  { i: "w-watchlist", x: 7, y: 6, w: 5, h: 6 },
  { i: "w-news", x: 0, y: 12, w: 7, h: 7 },
  { i: "w-macro", x: 7, y: 12, w: 5, h: 7 },
];

const SIZE_BY_TYPE: Record<WidgetType, { w: number; h: number }> = {
  "global-map": {w:7,h:12}, "world-news":{w:7,h:11}, "country-risk":{w:5,h:10}, "energy-intel":{w:4,h:9}, "shipping-intel":{w:5,h:10}, "hazard-intel":{w:4,h:9}, "military-intel":{w:4,h:9}, "cyber-intel":{w:4,h:9},
  quote: { w: 5, h: 6 },
  chart: { w: 7, h: 12 },
  watchlist: { w: 4, h: 7 },
  news: { w: 5, h: 8 },
  heatmap: { w: 7, h: 10 },
  screener: { w: 12, h: 9 },
  crypto: { w: 6, h: 9 },
  macro: { w: 5, h: 7 },
  options: { w: 12, h: 9 },
  portfolio: { w: 7, h: 8 },
  ai: { w: 5, h: 10 },
  calendar: { w: 12, h: 11 },
  insider: { w: 7, h: 9 },
  tv: { w: 6, h: 11 },
  recap: { w: 5, h: 12 },
};

export function integratedDesk(widgets:WidgetInstance[], layout:LayoutItem[]) {
 const kinds:WidgetType[]=['global-map','world-news','country-risk','energy-intel','shipping-intel','hazard-intel','military-intel','cyber-intel'];
 const added=kinds.filter(type=>!widgets.some(w=>w.type===type)).map(type=>({id:'jj-'+type,type,linked:false}));
 const all=[...widgets,...added];
 const chart=all.find(w=>w.type==='chart'), watch=all.find(w=>w.type==='watchlist');
 const placed:LayoutItem[]=[];
 const put=(type:WidgetType,x:number,y:number,w:number,h:number)=>{const widget=all.find(v=>v.type===type);if(widget)placed.push({i:widget.id,x,y,w,h});};
 put('global-map',0,0,7,12);put('chart',7,0,5,12);put('world-news',0,12,7,10);put('country-risk',7,12,5,10);put('energy-intel',0,22,4,9);put('shipping-intel',4,22,4,9);put('watchlist',8,22,4,9);put('hazard-intel',0,31,4,9);put('military-intel',4,31,4,9);put('cyber-intel',8,31,4,9);
 const ids=new Set(placed.map(p=>p.i));
 return {widgets:all,layout:[...placed,...layout.filter(l=>!ids.has(l.i)).map(l=>({...l,y:l.y+40}))]};
}
const INITIAL_DESK=integratedDesk(DEFAULT_WIDGETS,DEFAULT_LAYOUT);
export const useTerminal = create<TerminalState>()(
  persist(
    (set) => ({
      intelFocus:null,
      setIntelFocus:(intelFocus)=>set({intelFocus}),
      activeSymbol: "AAPL",
      widgets: INITIAL_DESK.widgets,
      layout: INITIAL_DESK.layout,
      watchlist: ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "GOOGL", "META", "SPY"],
      commandOpen: false,
      setActiveSymbol: (s) => {
        const sym = normalizeSymbol(s);
        if (sym) set({ activeSymbol: sym });
      },
      setCommandOpen: (open) => set({ commandOpen: open }),
      addWidget: (type, symbol) =>
        set((st) => {
          const id = `w-${type}-${Date.now()}`;
          const size = SIZE_BY_TYPE[type];
          const maxY = st.layout.reduce((m, l) => Math.max(m, l.y + l.h), 0);
          return {
            widgets: [...st.widgets, { id, type, symbol, linked: !symbol }],
            layout: [...st.layout, { i: id, x: 0, y: maxY, ...size }],
          };
        }),
      removeWidget: (id) =>
        set((st) => ({
          widgets: st.widgets.filter((w) => w.id !== id),
          layout: st.layout.filter((l) => l.i !== id),
        })),
      setWidgetSymbol: (id, symbol) => {
        const sym = normalizeSymbol(symbol);
        if (!sym) return;
        set((st) => ({
          widgets: st.widgets.map((w) => (w.id === id ? { ...w, symbol: sym, linked: false } : w)),
        }));
      },
      toggleLinked: (id) =>
        set((st) => ({
          widgets: st.widgets.map((w) => (w.id === id ? { ...w, linked: !w.linked } : w)),
        })),
      setLayout: (layout) => set({ layout }),
      addToWatchlist: (s) => {
        const sym = normalizeSymbol(s);
        if (!sym) return;
        set((st) => ({
          watchlist: st.watchlist.includes(sym) ? st.watchlist : [...st.watchlist, sym],
        }));
      },
      removeFromWatchlist: (s) => set((st) => ({ watchlist: st.watchlist.filter((x) => x !== s) })),
      resetWorkspace: () => set(INITIAL_DESK),
    }),
    { name: "openterminal-workspace", version: 2, migrate: (persisted) => { const old=persisted as TerminalState; return {...old,...integratedDesk(old.widgets || DEFAULT_WIDGETS,old.layout || DEFAULT_LAYOUT),intelFocus:null}; } }
  )
);

/** Symbol a widget should display: its own, or the active one when linked. */
export function useWidgetSymbol(widget: WidgetInstance): string {
  const active = useTerminal((s) => s.activeSymbol);
  return widget.linked ? active : widget.symbol ?? active;
}
