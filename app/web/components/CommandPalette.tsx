"use client";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { apiGet } from "../lib/api";
import { useTerminal } from "../store/terminal";
type SearchResult = { symbol: string; name: string; exchange: string; type: string };
export default function CommandPalette() {
  const open = useTerminal((state) => state.commandOpen);
  const setOpen = useTerminal((state) => state.setCommandOpen);
  const setSymbol = useTerminal((state) => state.setActiveSymbol);
  const watch = useTerminal((state) => state.addToWatchlist);
  const [query, setQuery] = useState(""); const [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null); const dialog = useRef<HTMLDivElement>(null); const resultId = useId();
  const { data: results = [], isFetching, error } = useQuery({ queryKey: ["search", query], queryFn: () => apiGet<SearchResult[]>(`/api/search?q=${encodeURIComponent(query)}`), enabled: open && !!query.trim(), staleTime: 300_000 });
  useEffect(() => {
    if (!open) return;
    setQuery(""); setSelected(0); const previous = document.activeElement as HTMLElement | null;
    input.current?.focus();
    const keys = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); }
      if (event.key !== "Tab") return;
      const focusable = Array.from(dialog.current?.querySelectorAll<HTMLElement>("input,button") ?? []);
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keys); return () => { document.removeEventListener("keydown", keys); previous?.focus(); };
  }, [open, setOpen]);
  useEffect(() => setSelected(0), [query]);
  if (!open) return null;
  const pick = (result: SearchResult, addWatch = false) => { setSymbol(result.symbol); if (addWatch) watch(result.symbol); setOpen(false); };
  return <div className="command-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
    <div className="jj-command" ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${resultId}-heading`}><div className="command-heading"><h2 id={`${resultId}-heading`}>Find a company or symbol</h2><button onClick={() => setOpen(false)} aria-label="Close symbol search">×</button></div>
      <input ref={input} value={query} aria-label="Search symbols" aria-controls={`${resultId}-results`} aria-activedescendant={results[selected] ? `${resultId}-${selected}` : undefined} aria-autocomplete="list" role="combobox" aria-expanded={results.length > 0} placeholder="Ticker, company, ETF, crypto or index" onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
        if (event.key === "ArrowDown") { event.preventDefault(); setSelected((value) => Math.min(value + 1, Math.max(0, results.length - 1))); }
        if (event.key === "ArrowUp") { event.preventDefault(); setSelected((value) => Math.max(0, value - 1)); }
        if (event.key === "Enter" && results[selected]) { event.preventDefault(); pick(results[selected], event.shiftKey); }
      }} />
      <div className="command-results" id={`${resultId}-results`} role="listbox" aria-label="Symbol results">{results.map((result, index) => <button role="option" aria-selected={index === selected} id={`${resultId}-${index}`} key={`${result.symbol}-${index}`} className={index === selected ? "active" : ""} onMouseEnter={() => setSelected(index)} onClick={() => pick(result)}><strong>{result.symbol}</strong><span>{result.name}</span><small>{result.exchange} {result.type}</small></button>)}
        {error ? <p role="status" className="down">Symbol search is unavailable. Check the local API connection.</p> : isFetching ? <p role="status">Searching…</p> : query.trim() && !results.length ? <p role="status">No symbols found for “{query}”.</p> : !query.trim() ? <p>Search to load a symbol across linked panels.</p> : null}
      </div><footer>Enter loads a symbol. Shift + Enter also adds it to your watchlist.</footer>
    </div>
  </div>;
}
