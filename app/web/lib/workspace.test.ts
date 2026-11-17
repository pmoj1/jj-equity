import { describe, expect, it } from "vitest";
import { defaultDesks, migrateLegacyWorkspace, parseWorkspaceFile } from "./workspace";
function exportFile() { return { format: "jj-equity-workspace", version: 1, workspaceName: "My research", activeDesk: "markets", activeSymbol: "MSFT", watchlist: ["MSFT", "SPY"], desks: defaultDesks() }; }
describe("workspace portability and migration", () => {
  it("keeps a legacy desk's widgets, independent symbols, layout and watchlist", () => {
    const previous = { widgets: [{ id: "old-chart", type: "chart", linked: false, symbol: "NVDA" }, { id: "old-wire", type: "world-news", linked: false }], layout: [{ i: "old-chart", x: 5, y: 47, w: 7, h: 12 }, { i: "old-wire", x: 0, y: 0, w: 5, h: 9 }], watchlist: ["BRK-B", "0700.HK"], activeSymbol: "SPY" };
    const before = JSON.stringify(previous);
    const migrated = migrateLegacyWorkspace(previous)!;
    expect(migrated.activeDesk).toBe("personal");
    expect(migrated.desks.personal).toEqual({ widgets: previous.widgets, layout: previous.layout });
    expect(migrated.watchlist).toEqual(previous.watchlist);
    expect(migrated.activeSymbol).toBe("SPY");
    expect(JSON.stringify(previous)).toBe(before);
    expect(migrated.desks.intelligence.widgets).toHaveLength(8);
  });
  it("round-trips all desks and custom names without carrying unknown fields", () => {
    const file = { ...exportFile(), credential: "not-workspace-data" };
    const parsed = parseWorkspaceFile(JSON.parse(JSON.stringify(file)));
    expect(parsed.desks).toEqual(file.desks);
    expect(parsed.workspaceName).toBe(file.workspaceName);
    expect(parsed).not.toHaveProperty("credential");
  });
  it("rejects a panel outside grid bounds before replacing a workspace", () => {
    const file = exportFile(); file.desks.markets.layout[0].x = 11;
    expect(() => parseWorkspaceFile(file)).toThrow("outside the desk");
  });
  it("rejects unknown panel types and duplicate panel ids", () => {
    const file = exportFile(); (file.desks.markets.widgets[0] as { type: string }).type = "__proto__";
    expect(() => parseWorkspaceFile(file)).toThrow("invalid or duplicate");
    const duplicate = exportFile(); duplicate.desks.markets.widgets[1].id = duplicate.desks.markets.widgets[0].id;
    expect(() => parseWorkspaceFile(duplicate)).toThrow("invalid or duplicate");
  });
  it("rejects incomplete or unrelated documents and invalid symbols", () => {
    expect(() => parseWorkspaceFile({ name: "not a workspace" })).toThrow();
    expect(() => parseWorkspaceFile({ ...exportFile(), activeSymbol: "../../private" })).toThrow("invalid symbol");
    expect(migrateLegacyWorkspace({ widgets: [], layout: [{ i: "missing", x: 0, y: 0, w: 1, h: 2 }] })).toBeNull();
  });
});
