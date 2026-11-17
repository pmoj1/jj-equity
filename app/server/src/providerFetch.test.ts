import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createServer, type Server } from "node:http";
import { providerFetch } from "./providerFetch.js";
let server: Server;
let address: string;
beforeAll(async () => {
  server = createServer((req, res) => {
    if (req.url === "/slow-body") { res.writeHead(200, { "Content-Type": "application/json" }); res.write('{"pending":'); }
    else if (req.url === "/ok") { res.writeHead(200); res.end("ok"); }
    // /no-headers intentionally never replies.
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  address = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
});
describe("public provider request deadlines", () => {
  it("aborts an endpoint that never sends headers", async () => {
    await expect(providerFetch(address + "/no-headers", {}, 30)).rejects.toThrow();
  });
  it("keeps the deadline active while reading a stalled response body", async () => {
    const response = await providerFetch(address + "/slow-body", {}, 100);
    await expect(response.json()).rejects.toThrow();
  });
  it("preserves explicit caller cancellation", async () => {
    const controller = new AbortController(); controller.abort();
    await expect(providerFetch(address + "/ok", { signal: controller.signal }, 500)).rejects.toThrow();
  });
  it("returns successful responses normally", async () => {
    expect(await (await providerFetch(address + "/ok", {}, 1000)).text()).toBe("ok");
  });
});
