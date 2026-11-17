"use client";
import { useEffect } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import CommandPalette from "./CommandPalette";
import WorkspaceSettings from "./WorkspaceSettings";
import { useTerminal } from "../store/terminal";
import { DESKS, DESK_LABELS } from "../lib/workspace";
const DESK_DESCRIPTION = { personal: "Your saved arrangement. Bring the panels that matter together.", markets: "Prices, companies and the context behind the move.", intelligence: "Follow the events connecting countries, commodities and supply routes.", research: "Keep your ledger, calendar and research questions in one place." };
export default function Terminal() {
  const focus = useTerminal((s) => s.intelFocus);
  const setFocus = useTerminal((s) => s.setIntelFocus);
  const setSymbol = useTerminal((s) => s.setActiveSymbol);
  const openSearch = useTerminal((s) => s.setCommandOpen);
  const addWidget = useTerminal((s) => s.addWidget);
  const activeDesk = useTerminal((s) => s.activeDesk);
  const setDesk = useTerminal((s) => s.setDesk);
  const workspaceName = useTerminal((s) => s.workspaceName);
  const panelsOpen = useTerminal((s) => s.panelsOpen);
  const setPanelsOpen = useTerminal((s) => s.setPanelsOpen);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); useTerminal.getState().setSettingsOpen(false); setPanelsOpen(false); openSearch(true); return; }
      if (event.key === "Escape" && useTerminal.getState().panelsOpen) { setPanelsOpen(false); return; }
      if (useTerminal.getState().settingsOpen || useTerminal.getState().commandOpen) return;
      if ((event.target as HTMLElement)?.closest("input,textarea,select,[contenteditable=true]")) return;
      if (event.altKey) {
        const types = ["chart", "quote", "news", "screener", "heatmap", "crypto", "options", "portfolio", "ai"] as const;
        const type = types[Number(event.key) - 1];
        if (type) { event.preventDefault(); addWidget(type); }
      }
    };
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [openSearch, addWidget, setPanelsOpen]);
  return <div className="jj-shell">
    <a className="jj-skip" href="#workspace">Skip to workspace</a>
    <TopBar />
    <div className="jj-deskbar"><nav aria-label="Research desks" className="desk-tabs">{DESKS.map((id) => <button key={id} aria-current={activeDesk === id ? "page" : undefined} className={activeDesk === id ? "active" : ""} onClick={() => setDesk(id)}>{DESK_LABELS[id]}</button>)}</nav><button className="term-btn panel-picker-toggle" onClick={() => setPanelsOpen(!panelsOpen)} aria-expanded={panelsOpen}>Add panel</button></div>
    <div className="jj-body"><Sidebar /><main id="workspace" tabIndex={-1} className="jj-main">
      <div className="workspace-intro"><div><p className="workspace-owner">{workspaceName}</p><h1>{DESK_LABELS[activeDesk]}</h1><p>{DESK_DESCRIPTION[activeDesk]}</p></div><div className="workspace-context"><span>{focus ? `Context: ${focus.name}` : "Linked symbol workspace"}</span>{focus && <button className="term-btn" onClick={() => setFocus(null)}>Clear context</button>}<div className="quick-symbols" aria-label="Quick market symbols">{["SPY", "XLE", "GLD", "ITA", "SOXX"].map((symbol) => <button key={symbol} onClick={() => setSymbol(symbol)}>{symbol}</button>)}</div></div></div>
      <Workspace />
      <footer className="jj-workspace-footer"><span>J&J Equity · Personal research tools</span><span>Source availability and delayed prices vary. Review evidence before decisions.</span></footer>
    </main></div><CommandPalette /><WorkspaceSettings />
  </div>;
}
