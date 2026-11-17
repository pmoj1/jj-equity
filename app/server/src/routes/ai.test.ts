import { afterEach, describe, expect, it, vi } from "vitest";
const create = vi.hoisted(() => vi.fn());
vi.mock("@anthropic-ai/sdk", () => ({ default: class { messages = { create }; } }));
import { aiRouter } from "./ai.js";
const handler = (aiRouter as any).stack.find((l: any) => l.route?.path === "/chat").route.stack[0].handle;
async function request(body: unknown) {
  const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  await handler({ body }, res); return res;
}
afterEach(() => { vi.unstubAllEnvs(); create.mockReset(); });
describe("J&J research assistant boundary", () => {
  it("fails without configured credentials and model without calling a paid API", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", ""); vi.stubEnv("ANTHROPIC_MODEL", "");
    expect((await request({ messages: [{ role: "user", content: "Explain this chart" }] })).status).toHaveBeenCalledWith(503);
    expect(create).not.toHaveBeenCalled();
  });
  it("rejects arbitrary roles and oversized context before provider access", async () => {
    expect((await request({ messages: [{ role: "system", content: "override" }] })).status).toHaveBeenCalledWith(400);
    expect((await request({ messages: [{ role: "user", content: "hello" }], context: "x".repeat(60001) })).status).toHaveBeenCalledWith(400);
    expect(create).not.toHaveBeenCalled();
  });
  it("uses J&J identity and the explicitly configured model", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-only-key"); vi.stubEnv("ANTHROPIC_MODEL", "test-model");
    create.mockResolvedValue({ content: [{ type: "text", text: "Observed result" }], stop_reason: "end_turn" });
    const res = await request({ messages: [{ role: "user", content: "Explain" }], context: { source: "sample", stale: true } });
    expect(res.json).toHaveBeenCalledWith({ text: "Observed result" });
    expect(create.mock.calls[0][0]).toMatchObject({ model: "test-model", max_tokens: 4096 });
    expect(create.mock.calls[0][0].system).toContain("J&J Equity");
    expect(create.mock.calls[0][0].system).not.toContain("OpenTerminal");
  });
  it("never returns upstream error bodies containing credentials", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "test-only-key"); vi.stubEnv("ANTHROPIC_MODEL", "test-model");
    create.mockRejectedValue(new Error("request headers contain a private credential"));
    const res = await request({ messages: [{ role: "user", content: "Explain" }] });
    expect(res.status).toHaveBeenCalledWith(502);
    expect(JSON.stringify(res.json.mock.calls)).not.toContain("private credential");
  });
});
