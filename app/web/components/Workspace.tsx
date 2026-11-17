"use client";

import { useEffect, useRef, useState } from "react";
import GridLayout, { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import { normalizeSymbol } from "../lib/symbol";
import { useTerminal, type WidgetInstance } from "../store/terminal";
import { WIDGET_TITLES } from "../lib/workspace";
import GlobalMap from "./intelligence/GlobalMap";
import NewsIntelligence from "./intelligence/NewsIntelligence";
import RiskIntelligence from "./intelligence/RiskIntelligence";
import OperationalFeeds from "./intelligence/OperationalFeeds";
import QuoteWidget from "./widgets/QuoteWidget";
import ChartWidget from "./widgets/ChartWidget";
import WatchlistWidget from "./widgets/WatchlistWidget";
import NewsWidget from "./widgets/NewsWidget";
import HeatmapWidget from "./widgets/HeatmapWidget";
import ScreenerWidget from "./widgets/ScreenerWidget";
import CryptoWidget from "./widgets/CryptoWidget";
import MacroWidget from "./widgets/MacroWidget";
import OptionsWidget from "./widgets/OptionsWidget";
import PortfolioWidget from "./widgets/PortfolioWidget";
import AiWidget from "./widgets/AiWidget";
import CalendarWidget from "./widgets/CalendarWidget";
import InsiderWidget from "./widgets/InsiderWidget";
import TvWidget from "./widgets/TvWidget";
import RecapWidget from "./widgets/RecapWidget";
import WidgetErrorBoundary from "./WidgetErrorBoundary";

const Grid = WidthProvider(GridLayout);

function WidgetBody({ widget }: { widget: WidgetInstance }) {
  switch (widget.type) {
    case "global-map": return <GlobalMap />;
    case "world-news": return <NewsIntelligence />;
    case "country-risk": return <RiskIntelligence />;
    case "energy-intel": case "shipping-intel": case "hazard-intel": case "military-intel": case "cyber-intel": return <OperationalFeeds kind={widget.type} />;
    case "quote": return <QuoteWidget widget={widget} />;
    case "chart": return <ChartWidget widget={widget} />;
    case "watchlist": return <WatchlistWidget />;
    case "news": return <NewsWidget widget={widget} />;
    case "heatmap": return <HeatmapWidget />;
    case "screener": return <ScreenerWidget />;
    case "crypto": return <CryptoWidget />;
    case "macro": return <MacroWidget />;
    case "options": return <OptionsWidget widget={widget} />;
    case "portfolio": return <PortfolioWidget />;
    case "ai": return <AiWidget />;
    case "calendar": return <CalendarWidget />;
    case "insider": return <InsiderWidget widget={widget} />;
    case "tv": return <TvWidget />;
    case "recap": return <RecapWidget />;
  }
}

function SymbolTag({ widget, activeSymbol }: { widget: WidgetInstance; activeSymbol: string }) {
  const setWidgetSymbol = useTerminal((s) => s.setWidgetSymbol);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const shown = widget.linked ? activeSymbol : widget.symbol ?? activeSymbol;

  useEffect(() => {
    if (!editing) return;
    setDraft(shown);
    requestAnimationFrame(() => inputRef.current?.select());
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={(e) => setDraft(e.target.value.toUpperCase())}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const v = normalizeSymbol(draft);
            if (v) setWidgetSymbol(widget.id, v);
            setEditing(false);
          }
          if (e.key === "Escape") setEditing(false);
        }}
        onBlur={() => setEditing(false)}
        className="ml-2 w-16 !border-0 !border-b !border-[var(--amber-dim)] bg-transparent text-[var(--text)] px-0 py-0 text-[13px] leading-none"
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Change ${shown} panel symbol`}
      className="ml-2 text-[var(--text)] cursor-pointer hover:text-[var(--amber)]"
      title="Click to set this widget's ticker"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={() => setEditing(true)}
    >
      {shown}
    </button>
  );
}

export default function Workspace() {
  const widgets = useTerminal((state) => state.widgets);
  const layout = useTerminal((state) => state.layout);
  const setLayout = useTerminal((state) => state.setLayout);
  const removeWidget = useTerminal((state) => state.removeWidget);
  const toggleLinked = useTerminal((state) => state.toggleLinked);
  const activeSymbol = useTerminal((state) => state.activeSymbol);
  const activeDesk = useTerminal((state) => state.activeDesk);
  const setPanelsOpen = useTerminal((state) => state.setPanelsOpen);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const change = () => setCompact(media.matches); change();
    media.addEventListener("change", change); return () => media.removeEventListener("change", change);
  }, []);
  const symbolAware = new Set(["quote", "chart", "news", "options", "insider"]);
  const panel = (widget: WidgetInstance) => <section className="terminal-panel" aria-label={WIDGET_TITLES[widget.type]}>
    <div className="panel-title"><span>{WIDGET_TITLES[widget.type]}{symbolAware.has(widget.type) && <SymbolTag widget={widget} activeSymbol={activeSymbol} />}</span>
      <span className="panel-actions">{symbolAware.has(widget.type) && <button aria-label={widget.linked ? `Unlink ${WIDGET_TITLES[widget.type]} from active symbol` : `Link ${WIDGET_TITLES[widget.type]} to active symbol`} title={widget.linked ? "Linked to the active symbol" : "Independent symbol"} onMouseDown={(event) => event.stopPropagation()} onClick={() => toggleLinked(widget.id)} className={widget.linked ? "amber" : "dim"}>⛓</button>}
        <button aria-label={`Remove ${WIDGET_TITLES[widget.type]} panel`} onMouseDown={(event) => event.stopPropagation()} onClick={() => removeWidget(widget.id)} className="dim">×</button>
      </span>
    </div><div className="widget-body"><WidgetErrorBoundary name={WIDGET_TITLES[widget.type]}><WidgetBody widget={widget} /></WidgetErrorBoundary></div>
  </section>;
  if (!widgets.length) return <div className="empty-desk"><h2>A clear desk.</h2><p>Add a chart, a source feed or a research tool from the panel library.</p><button className="term-btn" onClick={() => setPanelsOpen(true)}>Open panel library</button></div>;
  if (compact) return <div className="mobile-panels">{widgets.map((widget) => <div key={widget.id} className={`mobile-panel mobile-panel-${widget.type}`}>{panel(widget)}</div>)}</div>;
  return <Grid key={activeDesk} className="layout" layout={layout} cols={12} rowHeight={28} margin={[8, 8]} draggableHandle=".panel-title" draggableCancel="button,input,select,a" onLayoutChange={(next) => setLayout(next.map(({ i, x, y, w, h }) => ({ i, x, y, w, h })))}>
    {widgets.map((widget) => <div key={widget.id}>{panel(widget)}</div>)}
  </Grid>;
}
