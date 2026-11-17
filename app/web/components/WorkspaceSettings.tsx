"use client";
import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "../lib/api";
import { providerState, type ServiceStatus } from "../lib/status";
import { useTerminal } from "../store/terminal";
import type { WorkspaceFile } from "../lib/workspace";
export default function WorkspaceSettings() {
  const open = useTerminal((s) => s.settingsOpen);
  const close = useTerminal((s) => s.setSettingsOpen);
  const workspaceName = useTerminal((s) => s.workspaceName);
  const setName = useTerminal((s) => s.setWorkspaceName);
  const exportWorkspace = useTerminal((s) => s.exportWorkspace);
  const importWorkspace = useTerminal((s) => s.importWorkspace);
  const reset = useTerminal((s) => s.resetWorkspace);
  const activeDesk = useTerminal((s) => s.activeDesk);
  const [name, setDraft] = useState(workspaceName);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [armed, setArmed] = useState(false);
  const [undo, setUndo] = useState<WorkspaceFile | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const { data, error: statusError, isFetching, refetch } = useQuery({ queryKey: ["status"], queryFn: () => apiGet<ServiceStatus>("/api/status"), enabled: open, refetchInterval: open ? 30_000 : false });
  useEffect(() => {
    if (!open) return;
    setDraft(workspaceName); setError(""); setNotice(""); setArmed(false);
    const previous = document.activeElement as HTMLElement | null;
    const first = panel.current?.querySelector<HTMLButtonElement>("button"); first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(false); }
      if (event.key !== "Tab") return;
      const elements = Array.from(panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href]') ?? []).filter((element) => element.getClientRects().length);
      const start = elements[0], end = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === start) { event.preventDefault(); end?.focus(); }
      if (!event.shiftKey && document.activeElement === end) { event.preventDefault(); start?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [open, close]); // Name editing is intentionally not reset while the panel is open.
  if (!open) return null;
  const configured = data?.capabilities?.ai?.configured ?? data?.ai;
  const keyConfigured = data?.capabilities?.ai?.keyConfigured ?? configured;
  return <div className="settings-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) close(false); }}>
    <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="settings-heading" className="jj-settings">
      <header><div><span className="settings-brand">J&J Equity</span><h2 id="settings-heading">Your workspace</h2></div><button className="settings-close" onClick={() => close(false)} aria-label="Close workspace settings">×</button></header>
      <div className="settings-body">
        <section><h3>Make it yours</h3><form className="workspace-name-form" onSubmit={(event) => { event.preventDefault(); setName(name); setNotice("Workspace name saved on this device."); }}><label htmlFor="workspace-name">Workspace name</label><div><input id="workspace-name" value={name} required maxLength={70} onChange={(event) => setDraft(event.target.value)} /><button className="term-btn" type="submit" disabled={!name.trim()}>Save name</button></div></form><p>Your desks, panels, symbols and watchlist save in this browser. Portfolio transactions are stored separately by the local server.</p></section>
        <section><h3>Workspace files</h3><p>Export a backup of all four desks. Import accepts a J&J Equity workspace file up to 1 MB. These files do not include API credentials or portfolio transactions.</p><div className="settings-actions"><button className="term-btn" onClick={() => {
          const blob = new Blob([JSON.stringify(exportWorkspace(), null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = url; anchor.download = "jj-equity-workspace.json"; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice("Workspace backup downloaded.");
        }}>Export all desks</button><button className="term-btn" onClick={() => fileInput.current?.click()}>Import workspace</button><input ref={fileInput} type="file" accept=".json,application/json" className="sr-only" aria-label="Choose J&J Equity workspace file" onChange={async (event) => {
          const file = event.target.files?.[0]; if (!file) return;
          try { if (file.size > 1_000_000) throw new Error("Choose a workspace file smaller than 1 MB."); const raw = JSON.parse(await file.text()); const previous = exportWorkspace(); importWorkspace(raw); setUndo(previous); setDraft(useTerminal.getState().workspaceName); setError(""); setNotice("Workspace imported. You can undo this import."); }
          catch (issue) { setError(issue instanceof Error ? issue.message : "The workspace file could not be imported."); }
          finally { event.target.value = ""; }
        }} /></div><div className="settings-actions">{!armed ? <button className="settings-text-button" onClick={() => setArmed(true)}>Reset the {activeDesk} desk</button> : <><span>Replace this desk with its default panels?</span><button className="term-btn" onClick={() => { setUndo(exportWorkspace()); reset(); setArmed(false); setNotice("Desk reset. You can undo this change."); }}>Reset desk</button><button className="term-btn" onClick={() => setArmed(false)}>Cancel</button></>}{undo && <button className="term-btn" onClick={() => { importWorkspace(undo); setDraft(undo.workspaceName); setUndo(null); setNotice("Previous workspace restored."); }}>Undo workspace change</button>}</div>{notice && <p className="settings-notice" role="status">{notice}</p>}{error && <p className="down" role="alert">{error}</p>}</section>
        <section><div className="settings-section-heading"><h3>Data connections</h3><button className="term-btn" onClick={() => refetch()} disabled={isFetching}>{isFetching ? "Checking…" : "Refresh status"}</button></div><p>Status reflects the latest requests observed by this local server. It does not certify a feed’s timeliness or market-data entitlement.</p>{statusError && <p className="down" role="status">The local API could not be reached. Start the J&J Equity server and check its configuration.</p>}<div className="settings-service"><span>Research assistant</span><b className={configured ? "amber" : "dim"}>{configured === undefined ? "Checking" : configured ? "Configured" : keyConfigured ? "Model not configured" : "Key not configured"}</b></div><p className="settings-small">{data?.capabilities?.ai?.model ? `Model: ${data.capabilities.ai.model}. ` : ""}A configured key has not necessarily been validated. No AI request is sent from this panel.</p><div className="settings-service"><span>Portfolio ledger</span><b>{data?.capabilities?.portfolio?.available ? "Local storage available" : data ? "Local server" : "Checking"}</b></div><div className="source-status-list">{data?.providers.map((provider) => { const state = providerState(provider); return <div key={provider.name}><span>{provider.name}</span><span className={state === "available" ? "up" : state === "unavailable" ? "down" : "dim"}>{state === "unobserved" ? "Awaiting a request" : state}</span><small>{provider.lastLatencyMs === null ? "—" : `${provider.lastLatencyMs} ms`}</small></div>; })}</div><p className="settings-small">Credentials stay on the server. <a href="https://github.com/pmoj1/jj-equity" target="_blank" rel="noreferrer">Open the setup guide</a> to configure services.</p></section>
      </div><footer><span>Personal research workspace</span><span>{data?.product?.version ? `v${data.product.version}` : "J&J Equity"}</span></footer>
    </div>
  </div>;
}
