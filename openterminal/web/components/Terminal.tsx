"use client";

import { useEffect } from "react";
import TopBar from "./TopBar";
import Sidebar from "./Sidebar";
import Workspace from "./Workspace";
import CommandPalette from "./CommandPalette";
import { useTerminal } from "../store/terminal";

export default function Terminal() {
  const focus=useTerminal(s=>s.intelFocus);
  const setFocus=useTerminal(s=>s.setIntelFocus);
  const setSymbol=useTerminal(s=>s.setActiveSymbol);
  const setCommandOpen = useTerminal((s) => s.setCommandOpen);
  const addWidget = useTerminal((s) => s.addWidget);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandOpen(true);
        return;
      }
      if (e.altKey) {
        const map: Record<string, () => void> = {
          "1": () => addWidget("chart"),
          "2": () => addWidget("quote"),
          "3": () => addWidget("news"),
          "4": () => addWidget("screener"),
          "5": () => addWidget("heatmap"),
          "6": () => addWidget("crypto"),
          "7": () => addWidget("options"),
          "8": () => addWidget("portfolio"),
          "9": () => addWidget("ai"),
        };
        const fn = map[e.key];
        if (fn) {
          e.preventDefault();
          fn();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setCommandOpen, addWidget]);

  return (
    <div className="flex flex-col h-screen">
      <TopBar />
      <div className="flex items-center gap-3 px-3 py-1.5 border-b border-[var(--border)] bg-[#0d141d] text-[10px]">
        <span className="amber tracking-widest">J&amp;J INTELLIGENCE</span><span className="dim">MARKETS / GEOPOLITICS / ENERGY / LOGISTICS</span>
        <span className="ml-auto">{focus ? `LINKED CONTEXT: ${focus.name}` : 'GLOBAL CONTEXT'}</span>{focus&&<button className="term-btn" onClick={()=>setFocus(null)}>CLEAR</button>}
        {['SPY','XLE','GLD','ITA','SOXX'].map(t=><button key={t} className="term-btn" title={`Load ${t} in linked market panels`} onClick={()=>setSymbol(t)}>{t}</button>)}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Workspace />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
