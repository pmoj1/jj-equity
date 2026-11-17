"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { apiGet } from "../lib/api";
import { providerState, type ServiceStatus } from "../lib/status";
import { useTerminal } from "../store/terminal";

function Clock({ tz, label }: { tz: string; label: string }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => { setNow(new Date()); const timer = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(timer); }, []);
  return <span className="desk-clock"><span>{label}</span><time>{now?.toLocaleTimeString("en-GB", { timeZone: tz, hour12: false }) ?? "--:--:--"}</time></span>;
}
export default function TopBar() {
  const openSearch = useTerminal((s) => s.setCommandOpen);
  const openSettings = useTerminal((s) => s.setSettingsOpen);
  const activeSymbol = useTerminal((s) => s.activeSymbol);
  const { data, error } = useQuery({ queryKey: ["status"], queryFn: () => apiGet<ServiceStatus>("/api/status"), refetchInterval: 30_000 });
  const providers = data?.providers ?? [];
  const available = providers.filter((provider) => providerState(provider) === "available").length;
  const observed = providers.filter((provider) => providerState(provider) !== "unobserved").length;
  const label = error ? "API unavailable" : !data ? "Checking connection" : !observed ? "Feeds awaiting requests" : `${available}/${observed} feeds responding`;
  return <header className="jj-topbar">
    <a href="#workspace" className="jj-wordmark" aria-label="J&J Equity workspace"><span className="jj-monogram" aria-hidden="true">J<span>&</span>J</span><span>J&J <b>Equity</b><small>Research workspace</small></span></a>
    <div className="desk-clocks"><Clock tz="Australia/Perth" label="Perth" /><Clock tz="America/New_York" label="New York" /><Clock tz="Europe/London" label="London" /></div>
    <button className="desk-search" onClick={() => openSearch(true)} aria-label={`Search symbols; active symbol ${activeSymbol}`}><strong>{activeSymbol}</strong><span>Find a company or symbol</span><kbd>⌘ K</kbd></button>
    <button className="desk-connection" onClick={() => openSettings(true)} aria-label="Open settings and data status"><i className={error ? "is-error" : available ? "is-available" : "is-idle"} aria-hidden="true" /><span>{label}</span><span className="desk-settings-label">Settings</span></button>
  </header>;
}
