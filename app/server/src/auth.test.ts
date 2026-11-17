import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { mkdtempSync, writeFileSync, statSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
let dir: string;
let auth: typeof import("./auth.js");
let db: (typeof import("./db.js"))["db"];
beforeAll(async () => {
  dir = mkdtempSync(join(tmpdir(), "jj-auth-test-"));
  vi.stubEnv("DATA_DIR", dir); vi.stubEnv("API_KEY", undefined);
  writeFileSync(join(dir, ".api-key"), "  \n");
  ({ db } = await import("./db.js")); auth = await import("./auth.js");
});
afterAll(() => { db.close(); rmSync(dir, { recursive: true, force: true }); vi.unstubAllEnvs(); });
describe("local API key boundary", () => {
  it("replaces a blank stored key and rejects an absent header", () => {
    expect(auth.apiKey).toHaveLength(48);
    const next = vi.fn();const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    auth.requireApiKey({ header: () => undefined } as any, res, next);
    expect(res.status).toHaveBeenCalledWith(401);expect(next).not.toHaveBeenCalled();
    expect(statSync(join(dir, ".api-key")).mode & 0o777).toBe(0o600);
  });
  it("accepts the generated key without putting it in a response", () => {
    const next = vi.fn();const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    auth.requireApiKey({ header: () => auth.apiKey } as any, res, next);
    expect(next).toHaveBeenCalledOnce(); expect(res.json).not.toHaveBeenCalled();
  });
});
