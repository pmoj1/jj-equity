"use client";
import { useState } from "react";
import { useTerminal } from "../store/terminal";
import { WIDGET_GROUPS, WIDGET_TITLES } from "../lib/workspace";
export default function Sidebar() {
  const addWidget = useTerminal((s) => s.addWidget);
  const open = useTerminal((s) => s.panelsOpen);
  const close = useTerminal((s) => s.setPanelsOpen);
  const widgets = useTerminal((s) => s.widgets);
  const [search, setSearch] = useState("");
  return <>
    {open && <button className="panel-picker-backdrop" aria-label="Close panel library" onClick={() => close(false)} />}
    <aside className={`jj-sidebar ${open ? "is-open" : ""}`} aria-label="Panel library">
      <div className="panel-library-heading"><h2>Panel library</h2><button className="mobile-picker-close" onClick={() => close(false)} aria-label="Close panel library">×</button></div>
      <p className="panel-library-help">Add to this desk.<br />Drag a panel header to arrange it.</p>
      <input className="panel-library-search" aria-label="Find a panel" placeholder="Find a panel…" value={search} onChange={(event) => setSearch(event.target.value)} />
      {WIDGET_GROUPS.map((group) => <section className="panel-group" key={group.label}><h3>{group.label}</h3>{group.items.filter((type) => WIDGET_TITLES[type].toLowerCase().includes(search.toLowerCase())).map((type) => <button key={type} onClick={() => addWidget(type)} disabled={widgets.length >= 100} title={`Add ${WIDGET_TITLES[type]} panel`}><span>{WIDGET_TITLES[type]}</span><b aria-hidden="true">+</b></button>)}</section>)}
      <p className="panel-library-foot">{widgets.length}/100 panels on this desk.<br />Layouts save on this device.</p>
    </aside>
  </>;
}
